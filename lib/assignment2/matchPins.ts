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

  for (const pin1 of pinList1) {
    const matchingPinsByColor = pinList2
      .filter((p2) => p2.color === pin1.color)
      .filter((p2) => !matchedPin2Ids.has(p2.pinId))
    if (matchingPinsByColor.length === 0) {
      unmatchedPin1Ids.add(pin1.pinId)
      continue
    }
    let bestAngleDistance = Infinity
    let bestMatchingPin2: BpcPin = matchingPinsByColor[0]!
    for (const pin2 of matchingPinsByColor) {
      const angleDistance = circularDistance(
        Math.atan2(pin1.offset.y, pin1.offset.x),
        Math.atan2(pin2.offset.y, pin2.offset.x),
      )
      if (angleDistance < bestAngleDistance) {
        bestAngleDistance = angleDistance
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
