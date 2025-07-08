import { getBoundsOfPinList } from "lib/graph-utils/getBoundsOfPinList"
import { getNormalizedPerimeterDistance } from "lib/graph-utils/getNormalizedPerimeterDistance"
import { getNormalizedPerimeterPosition } from "lib/graph-utils/getNormalizedPerimeterPosition"
import { circularDistance } from "lib/network-bag-of-angles-assignment/computeBagOfAnglesDistance"
import type { BpcPin } from "lib/types"

/**
 * Match pins by color. If color is the same, match by offset angle distance.
 */
export const matchPins = (pinList1: BpcPin[], pinList2: BpcPin[]) => {
  const matchedPins: Array<[BpcPin, BpcPin]> = []
  const unmatchedPin1Ids: Set<string> = new Set()
  const unmatchedPin2Ids: Set<string> = new Set()

  const matchedPin1Ids = new Set<string>()
  const matchedPin2Ids = new Set<string>()

  const bounds1 = getBoundsOfPinList(pinList1)
  const bounds2 = getBoundsOfPinList(pinList2)

  for (const pin1 of pinList1) {
    const matchingPinsByColor = pinList2
      .filter((p2) => p2.color === pin1.color)
      .filter((p2) => !matchedPin2Ids.has(p2.pinId))
    if (matchingPinsByColor.length === 0) {
      unmatchedPin1Ids.add(pin1.pinId)
      continue
    }

    const normalizedPerimeterPosition1 = getNormalizedPerimeterPosition(
      bounds1,
      pin1.offset,
    )
    if (normalizedPerimeterPosition1 === null) {
      unmatchedPin1Ids.add(pin1.pinId)
      continue
    }

    let bestPerimeterDistance = Infinity
    let bestMatchingPin2: BpcPin = matchingPinsByColor[0]!

    for (const pin2 of matchingPinsByColor) {
      const normalizedPerimeterPosition2 = getNormalizedPerimeterPosition(
        bounds2,
        pin2.offset,
      )
      if (normalizedPerimeterPosition2 === null) {
        continue
      }
      const { minDistance } = getNormalizedPerimeterDistance(
        normalizedPerimeterPosition1,
        normalizedPerimeterPosition2,
      )
      if (minDistance < bestPerimeterDistance) {
        bestPerimeterDistance = minDistance
        bestMatchingPin2 = pin2
      }
    }

    matchedPins.push([pin1, bestMatchingPin2])
    matchedPin1Ids.add(pin1.pinId)
    matchedPin2Ids.add(bestMatchingPin2.pinId)
  }

  for (const pin2 of pinList2) {
    if (matchedPin2Ids.has(pin2.pinId)) continue
    unmatchedPin2Ids.add(pin2.pinId)
  }

  return {
    matchedPins,
    unmatchedPin1Ids,
    unmatchedPin2Ids,
  }
}
