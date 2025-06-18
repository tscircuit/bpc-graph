import type { Assignment } from "lib/heuristic-network-similarity/generateAssignments"
import type { BpcGraph } from "lib/types"

interface TransformGraphWithAssignmentsParams {
  graph: BpcGraph
  boxAssignment: Assignment<string, string>
  networkAssignment: Assignment<string, string>
}

export const transformGraphWithAssignments = ({
  graph,
  boxAssignment,
  networkAssignment,
}: TransformGraphWithAssignmentsParams): BpcGraph => {
  const newGraph: BpcGraph = {
    // The specific type of BpcGraph (Floating, Fixed, Mixed) might need adjustment
    // based on usage, but GraphNetworkTransformer generally handles BpcGraph.
    // We ensure the elements themselves are correctly typed.
    boxes: [] as any[], // Initialize as any[] to satisfy BpcGraph variants
    pins: [],
  }

  const mappedOldToNewBoxIds = new Map<string, string>()

  // Process boxes
  for (const box of graph.boxes) {
    const newBoxId = boxAssignment.map.get(box.boxId)
    // Only include the box if it's successfully mapped to a new ID (non-null)
    if (newBoxId) {
      const newBox = { ...box, boxId: newBoxId }
      newGraph.boxes.push(newBox as any)
      mappedOldToNewBoxIds.set(box.boxId, newBoxId)
    }
  }

  // Process pins
  for (const pin of graph.pins) {
    // Check if the pin's original parent box was kept and mapped
    const newParentBoxId = mappedOldToNewBoxIds.get(pin.boxId)
    if (newParentBoxId) {
      // Check if the pin's original network ID was mapped to a non-null new ID
      const newNetworkId = networkAssignment.map.get(pin.networkId)
      if (newNetworkId) {
        const newPin = {
          ...pin,
          boxId: newParentBoxId,
          networkId: newNetworkId,
        }
        newGraph.pins.push(newPin)
      }
      // Pins whose network maps to null or is not in networkAssignment.map are removed
    }
    // Pins belonging to boxes that were removed (not in mappedOldToNewBoxIds) are implicitly removed
  }

  return newGraph
}
