import { getApproximateAssignments2 } from "lib/assignment2/getApproximateAssignments2"
import type { BpcGraph } from "lib/types"

export const netAdaptBpcGraph2 = (
  floatingGraph: BpcGraph,
  fixedGraph: BpcGraph,
) => {
  const { floatingToFixedBoxAssignment, floatingToFixedPinAssignment } =
    getApproximateAssignments2(floatingGraph, fixedGraph)

  const adaptedBpcGraph = structuredClone(floatingGraph)

  console.log(floatingToFixedPinAssignment)
  for (const floatingPin of adaptedBpcGraph.pins) {
    if (floatingToFixedPinAssignment[floatingPin.boxId]?.[floatingPin.pinId]) {
      const fixedPinId =
        floatingToFixedPinAssignment[floatingPin.boxId]?.[floatingPin.pinId]
      const fixedBoxId = floatingToFixedBoxAssignment[floatingPin.boxId]
      const fixedPin = fixedGraph.pins.find(
        (p) => p.boxId === fixedBoxId && p.pinId === fixedPinId,
      )
      if (fixedPin) {
        floatingPin.offset = fixedPin.offset
      }
    }
  }

  for (const box of adaptedBpcGraph.boxes) {
    if (floatingToFixedBoxAssignment[box.boxId]) {
      const fixedBoxId = floatingToFixedBoxAssignment[box.boxId]
      const fixedBox = fixedGraph.boxes.find((b) => b.boxId === fixedBoxId)
      if (fixedBox) {
        box.center = fixedBox.center
        box.kind = "fixed"
      }
    }
  }

  return adaptedBpcGraph
}
