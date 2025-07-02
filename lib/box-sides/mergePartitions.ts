import type { MixedBpcGraph } from "lib/types"
import type { BpcGraphPartition } from "./partitionBpcGraph"

/**
 * Merges multiple BPC graph partitions back into a single graph.
 * This is used after each partition has been individually processed
 * through the layout pipeline (matching, adaptation, positioning).
 */
export const mergePartitions = (partitions: BpcGraphPartition[]): MixedBpcGraph => {
  const merged: MixedBpcGraph = {
    boxes: [],
    pins: [],
  }
  
  // Keep track of what we've already added to avoid duplicates
  const addedBoxIds = new Set<string>()
  const addedPinIds = new Set<string>()
  
  for (const partition of partitions) {
    // Add boxes from this partition
    for (const box of partition.subgraph.boxes) {
      if (!addedBoxIds.has(box.boxId)) {
        merged.boxes.push(structuredClone(box))
        addedBoxIds.add(box.boxId)
      }
    }
    
    // Add pins from this partition
    for (const pin of partition.subgraph.pins) {
      const pinKey = `${pin.boxId}-${pin.pinId}`
      if (!addedPinIds.has(pinKey)) {
        merged.pins.push(structuredClone(pin))
        addedPinIds.add(pinKey)
      }
    }
  }
  
  return merged
}