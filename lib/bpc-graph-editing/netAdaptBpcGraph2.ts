import { getApproximateAssignments2 } from "lib/assignment2/getApproximateAssignments2"
import { getBoundsOfBpcBox } from "lib/graph-utils/getBoundsOfBpcBox"
import { getDirectionFromVec2 } from "lib/graph-utils/getDirectionFromVec2"
import { getDirectionVec2 } from "lib/graph-utils/getDirectionVec2"
import { getDominantPinSide } from "lib/graph-utils/getDominantPinSide"
import type { BpcGraph, FloatingBoxId } from "lib/types"

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
    // When a floating box is larger/smaller than the fixed box, shift all other
    // boxes such that relative pin offsets are the same
    for (const floatingBox of adaptedBpcGraph.boxes) {
      const fixedBoxId = floatingToFixedBoxAssignment[floatingBox.boxId]
      if (!fixedBoxId) continue
      if (!floatingBox.center) continue
      if (opts.floatingBoxIdsWithMutablePinOffsets?.has(floatingBox.boxId))
        continue

      // Identify a difference in the bounds of these two boxes
      const fixedBoxBounds = getBoundsOfBpcBox(fixedGraph, fixedBoxId)
      const floatingBoxBounds = getBoundsOfBpcBox(
        floatingGraph,
        floatingBox.boxId,
      )

      const fixedDominantPinSide = getDominantPinSide(fixedGraph, fixedBoxId)
      const floatingDominantPinSide = getDominantPinSide(
        floatingGraph,
        floatingBox.boxId,
      )

      if (fixedDominantPinSide === null || floatingDominantPinSide === null)
        continue
      if (fixedDominantPinSide !== floatingDominantPinSide) continue

      const shiftVec = getDirectionVec2(fixedDominantPinSide)

      const fixedWidth = fixedBoxBounds.maxX - fixedBoxBounds.minX
      const floatingWidth = floatingBoxBounds.maxX - floatingBoxBounds.minX
      const fixedHeight = fixedBoxBounds.maxY - fixedBoxBounds.minY
      const floatingHeight = floatingBoxBounds.maxY - floatingBoxBounds.minY

      const deltaWidth = floatingWidth - fixedWidth
      const deltaHeight = floatingHeight - fixedHeight

      if (deltaWidth < 0.001 && deltaHeight < 0.001) continue

      // If the bounds differ, we can "push" the adapted graph content to one side
      // of the box such that the relative position from the pins to other boxes
      // remains the same

      for (const otherBox of adaptedBpcGraph.boxes) {
        if (otherBox.boxId === floatingBox.boxId) continue
        if (!otherBox.center) continue

        // Make sure the other box is "to the dominant side" of the floating box
        const deltaPos = {
          x: otherBox.center.x - floatingBox.center.x,
          y: otherBox.center.y - floatingBox.center.y,
        }

        const isToTheSideOf =
          getDirectionFromVec2({
            x: deltaPos.x * Math.abs(shiftVec.x),
            y: deltaPos.y * Math.abs(shiftVec.y),
          }) === fixedDominantPinSide

        if (isToTheSideOf) {
          otherBox.center.x += shiftVec.x * deltaWidth
          otherBox.center.y += shiftVec.y * deltaHeight
        }
      }
    }
  }

  return adaptedBpcGraph
}
