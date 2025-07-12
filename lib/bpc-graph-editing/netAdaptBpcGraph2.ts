import { getApproximateAssignments2 } from "lib/assignment2/getApproximateAssignments2"
import { getBoundsOfBpcBox } from "lib/graph-utils/getBoundsOfBpcBox"
import { getDirectionFromVec2 } from "lib/graph-utils/getDirectionFromVec2"
import { getDirectionVec2 } from "lib/graph-utils/getDirectionVec2"
import { getDominantPinSide } from "lib/graph-utils/getDominantPinSide"
import type { BpcGraph, FloatingBoxId } from "lib/types"
import { pushFloatingBoxesAdjustingForFixedSizeDelta } from "./pushFloatingBoxesAdjustingForFixedSizeDelta"

/**
 * Returns a fixed position version of the floatingGraph that inherits matched
 * pins from the fixed graph
 */
export const netAdaptBpcGraph2 = (
  floatingGraph: BpcGraph,
  fixedGraph: BpcGraph,
  opts: {
    floatingBoxIdsWithMutablePinOffsets?: Set<FloatingBoxId>
    pushBoxesAsBoxesChangeSize?: boolean
  } = {},
) => {
  const { floatingBoxIdsWithMutablePinOffsets = new Set() } = opts
  const { floatingToFixedBoxAssignment, floatingToFixedPinAssignment } =
    getApproximateAssignments2(floatingGraph, fixedGraph)

  const adaptedBpcGraph = structuredClone(floatingGraph)

  for (const floatingPin of adaptedBpcGraph.pins) {
    if (!floatingBoxIdsWithMutablePinOffsets.has(floatingPin.boxId)) {
      continue
    }
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

  if (opts.pushBoxesAsBoxesChangeSize) {
    pushFloatingBoxesAdjustingForFixedSizeDelta(adaptedBpcGraph, fixedGraph, {
      floatingToFixedBoxAssignment,
      floatingBoxIdsWithMutablePinOffsets,
    })
  }

  return adaptedBpcGraph
}
