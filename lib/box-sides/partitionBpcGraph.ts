import type { BpcGraph, MixedBpcGraph } from "lib/types"
import { getBoxSideSubgraph, type Side } from "./getBoxSideSubgraph"
import { findIsolatedBoxSides } from "./findIsolatedBoxSides"

export interface BpcGraphPartition {
  subgraph: MixedBpcGraph
  boxId: string
  sides: Side[]
  partitionId: string
}

/**
 * Partitions a BPC graph into subgraphs, where each subgraph contains
 * one side (or connected sides) of a box along with all connected components.
 * 
 * Special handling for netlabels:
 * - Netlabels with colors "vcc" or "gnd" may be included in multiple partitions
 * - This is because power/ground symbols are often shared across chip sides
 */
export const partitionBpcGraph = (bpcGraph: BpcGraph): BpcGraphPartition[] => {
  const partitions: BpcGraphPartition[] = []
  
  // Find all boxes that have pins (these are the ones we want to partition by sides)
  const boxesWithPins = new Set<string>()
  for (const pin of bpcGraph.pins) {
    boxesWithPins.add(pin.boxId)
  }
  
  // For each box, find its isolated sides and create partitions
  for (const boxId of boxesWithPins) {
    // Skip boxes that only have center pins or netlabel pins
    const actualPins = bpcGraph.pins.filter(pin => 
      pin.boxId === boxId && 
      !pin.pinId.includes("_center") && 
      pin.color !== "component_center" &&
      pin.color !== "netlabel_center"
    )
    
    if (actualPins.length === 0) {
      continue // Skip this box as it has no actual component pins
    }
    
    const isolatedSideGroups = findIsolatedBoxSides(bpcGraph, boxId)
    
    for (let groupIndex = 0; groupIndex < isolatedSideGroups.length; groupIndex++) {
      const sideGroup = isolatedSideGroups[groupIndex]!
      
      // Create a subgraph for this group of sides
      let subgraph: MixedBpcGraph = { boxes: [], pins: [] }
      
      // Merge subgraphs for all sides in this group
      for (const side of sideGroup) {
        const sideSubgraph = getBoxSideSubgraph({
          bpcGraph,
          boxId,
          side,
        })
        
        // Merge this side's subgraph into the group subgraph
        subgraph = mergeSubgraphs(subgraph, sideSubgraph)
      }
      
      // Add shared netlabels (VCC/GND) from other partitions if they exist
      subgraph = addSharedNetlabels(bpcGraph, subgraph)
      
      const partitionId = `${boxId}-${sideGroup.join(",")}`
      
      partitions.push({
        subgraph,
        boxId,
        sides: sideGroup,
        partitionId,
      })
    }
  }
  
  return partitions
}

/**
 * Merges two BPC subgraphs, avoiding duplicates
 */
function mergeSubgraphs(
  subgraph1: MixedBpcGraph,
  subgraph2: MixedBpcGraph,
): MixedBpcGraph {
  const merged: MixedBpcGraph = {
    boxes: [...subgraph1.boxes],
    pins: [...subgraph1.pins],
  }
  
  // Add boxes from subgraph2 that aren't already present
  for (const box of subgraph2.boxes) {
    if (!merged.boxes.some(b => b.boxId === box.boxId)) {
      merged.boxes.push(structuredClone(box))
    }
  }
  
  // Add pins from subgraph2 that aren't already present
  for (const pin of subgraph2.pins) {
    if (!merged.pins.some(p => p.boxId === pin.boxId && p.pinId === pin.pinId)) {
      merged.pins.push(structuredClone(pin))
    }
  }
  
  return merged
}

/**
 * Adds netlabels with VCC/GND colors to the subgraph if they're connected
 * to the same networks but not already included
 */
function addSharedNetlabels(
  originalGraph: BpcGraph,
  subgraph: MixedBpcGraph,
): MixedBpcGraph {
  const result = structuredClone(subgraph)
  
  // Get all network IDs present in this subgraph
  const subgraphNetworkIds = new Set(result.pins.map(p => p.networkId))
  
  // Find all netlabels in the original graph with VCC/GND colors
  const netlabels = originalGraph.boxes.filter(box => {
    const attrs = (box as any).boxAttributes
    return attrs?.type === "netlabel" || attrs?.netlabel === true
  })
  
  for (const netlabel of netlabels) {
    // Check if this netlabel is already in the subgraph
    if (result.boxes.some(b => b.boxId === netlabel.boxId)) {
      continue
    }
    
    // Find pins of this netlabel
    const netlabelPins = originalGraph.pins.filter(p => p.boxId === netlabel.boxId)
    
    // Check if any of these pins have VCC/GND colors and connect to our networks
    for (const pin of netlabelPins) {
      const isVccGnd = pin.color.toLowerCase() === "vcc" || 
                       pin.color.toLowerCase() === "gnd" ||
                       pin.color.toLowerCase() === "power" ||
                       pin.color.toLowerCase() === "ground"
      
      if (isVccGnd && subgraphNetworkIds.has(pin.networkId)) {
        // Add this netlabel box and its pins to the subgraph
        if (!result.boxes.some(b => b.boxId === netlabel.boxId)) {
          result.boxes.push(structuredClone(netlabel))
        }
        
        // Add all pins of this netlabel
        for (const nlPin of netlabelPins) {
          if (!result.pins.some(p => p.boxId === nlPin.boxId && p.pinId === nlPin.pinId)) {
            result.pins.push(structuredClone(nlPin))
          }
        }
        break
      }
    }
  }
  
  return result
}