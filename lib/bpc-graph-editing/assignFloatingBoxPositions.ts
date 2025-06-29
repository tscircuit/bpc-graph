import type { FixedBpcGraph, MixedBpcGraph, Vec2 } from "lib/types"
import { getPinPosition } from "lib/graph-utils/getPinPosition"
import { getPinDirection } from "lib/graph-utils/getPinDirection"
import { getDirectionVec2 } from "lib/graph-utils/getDirectionVec2"

const PIN_TO_CENTER_DISTANCE = 0.2

export const assignFloatingBoxPositions = (
  og: MixedBpcGraph,
): FixedBpcGraph => {
  const g = structuredClone(og)

  for (const box of g.boxes) {
    // skip boxes that already have an absolute position
    if (box.center || box.kind === "fixed") continue

    const candidateCenters: Vec2[] = []
    const boxPins = og.pins.filter((p) => p.boxId === box.boxId)

    for (const pin of boxPins) {
      // other pins connected through the same network that DO have positions
      const networkPins = og.pins.filter(
        (p) => p.networkId === pin.networkId && p.boxId !== box.boxId,
      )

      for (const np of networkPins) {
        const npBox = og.boxes.find((b) => b.boxId === np.boxId)
        if (!npBox?.center) continue // skip if unknown position

        const pos = getPinPosition(og, np.pinId) // absolute position
        try {
          const dir = getDirectionVec2(getPinDirection(og, np.pinId))
          candidateCenters.push({
            x: pos.x + dir.x * PIN_TO_CENTER_DISTANCE,
            y: pos.y + dir.y * PIN_TO_CENTER_DISTANCE,
          })
        } catch {
          // fallback: just use the pin position itself
          candidateCenters.push(pos)
        }
      }
    }

    // average all candidate centres (fallback 0,0 if none)
    const inferred: Vec2 =
      candidateCenters.length === 0
        ? { x: 0, y: 0 }
        : candidateCenters.reduce(
            (acc, v) => ({ x: acc.x + v.x, y: acc.y + v.y }),
            { x: 0, y: 0 },
          )
    if (candidateCenters.length) {
      inferred.x /= candidateCenters.length
      inferred.y /= candidateCenters.length
    }

    // @ts-ignore
    box.kind = "fixed"
    box.center = inferred
  }

  return g as FixedBpcGraph
}
