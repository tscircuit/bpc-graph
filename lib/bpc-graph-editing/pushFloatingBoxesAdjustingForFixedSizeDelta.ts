import { getBoundsOfBpcBox } from "lib/graph-utils/getBoundsOfBpcBox"
import { getDirectionFromVec2 } from "lib/graph-utils/getDirectionFromVec2"
import { getDirectionVec2 } from "lib/graph-utils/getDirectionVec2"
import { getDominantPinSide } from "lib/graph-utils/getDominantPinSide"
import type { BpcGraph, FixedBoxId, FloatingBoxId } from "lib/types"

/**
 * When a floating box is larger/smaller than the fixed box, shift all other
 * boxes such that relative pin offsets are the same
 */
export const pushFloatingBoxesAdjustingForFixedSizeDelta = (
  adaptedFloatingBpcGraph: BpcGraph,
  fixedGraph: BpcGraph,
  {
    floatingToFixedBoxAssignment,
    floatingBoxIdsWithMutablePinOffsets,
  }: {
    floatingToFixedBoxAssignment: Record<FloatingBoxId, FixedBoxId>
    floatingBoxIdsWithMutablePinOffsets?: Set<FloatingBoxId>
  },
) => {
  for (const floatingBox of adaptedFloatingBpcGraph.boxes) {
    const fixedBoxId = floatingToFixedBoxAssignment[floatingBox.boxId]
    if (!fixedBoxId) continue
    if (!floatingBox.center) continue
    if (floatingBoxIdsWithMutablePinOffsets?.has(floatingBox.boxId)) continue

    // Identify a difference in the bounds of these two boxes
    const fixedBoxBounds = getBoundsOfBpcBox(fixedGraph, fixedBoxId)
    const floatingBoxBounds = getBoundsOfBpcBox(
      adaptedFloatingBpcGraph,
      floatingBox.boxId,
    )

    const fixedDominantPinSide = getDominantPinSide(fixedGraph, fixedBoxId)
    const floatingDominantPinSide = getDominantPinSide(
      adaptedFloatingBpcGraph,
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

    for (const otherBox of adaptedFloatingBpcGraph.boxes) {
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
