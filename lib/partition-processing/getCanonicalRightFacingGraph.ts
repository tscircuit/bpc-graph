import { getPinDirection } from "lib/graph-utils/getPinDirection"
import { reflectGraph } from "lib/graph-utils/reflectGraph"
import type { BoxId, MixedBpcGraph } from "lib/types"

export const getCanonicalRightFacingGraph = (
  g: MixedBpcGraph,
): {
  g: MixedBpcGraph
  reflected: boolean
  centerBoxId: BoxId | null
} => {
  let largestLeftRightBox = null
  let largestLeftRightBoxPins = -Infinity

  for (const box of g.boxes) {
    const lrPins = g.pins
      .filter((p) => p.boxId === box.boxId)
      .filter((p) =>
        ["x-", "x+"].includes(getPinDirection(g, box, p) ?? "none"),
      )

    if (lrPins.length > largestLeftRightBoxPins && lrPins.length > 1) {
      largestLeftRightBox = box
      largestLeftRightBoxPins = lrPins.length
    }
  }

  if (!largestLeftRightBox) {
    return { g, reflected: false, centerBoxId: null }
  }

  const largestBoxLRPinDirections = g.pins
    .filter((p) => p.boxId === largestLeftRightBox.boxId)
    .map((p) => getPinDirection(g, largestLeftRightBox, p))

  const dirCounts = {
    "x+": 0,
    "x-": 0,
    "y+": 0,
    "y-": 0,
  }

  for (const dir of largestBoxLRPinDirections) {
    if (!dir) continue
    dirCounts[dir]++
  }

  if (dirCounts["x+"] >= dirCounts["x-"]) {
    return { g, reflected: false, centerBoxId: largestLeftRightBox.boxId }
  }

  return {
    g: reflectGraph({
      graph: g,
      axis: "x",
      centerBoxId: largestLeftRightBox.boxId,
    }),
    reflected: true,
    centerBoxId: largestLeftRightBox.boxId,
  }
}
