import type { FixedBpcGraph, MixedBpcGraph, Vec2 } from "lib/types"
import { addVec2 } from "lib/graph-utils/addVec2"

export const assignFloatingBoxPositions = (
  og: MixedBpcGraph,
): FixedBpcGraph => {
  const g = structuredClone(og)

  // Find all floating boxes that need positions
  const floatingBoxes = g.boxes
    .filter((box) => box.kind === "floating" && !box.center)
    .sort(
      (a, b) =>
        og.pins.filter((p) => p.boxId === b.boxId).length -
        og.pins.filter((p) => p.boxId === a.boxId).length,
    ) // place boxes with more pins first

  if (floatingBoxes.length === 0) {
    return g as FixedBpcGraph
  }

  // Place the first floating box at origin
  const firstBox = floatingBoxes[0]!
  // @ts-ignore
  firstBox.kind = "fixed"
  firstBox.center = { x: 0, y: 0 }

  // Iteratively place remaining boxes using network connections
  const remainingBoxes = floatingBoxes.slice(1)
  const placedBoxIds = new Set([firstBox.boxId])

  while (remainingBoxes.length > 0) {
    let placedAny = false

    for (let i = remainingBoxes.length - 1; i >= 0; i--) {
      const box = remainingBoxes[i]!
      const candidateCenters: Vec2[] = []
      const boxPins = og.pins.filter((p) => p.boxId === box.boxId)

      for (const pin of boxPins) {
        // Find pins in the same network that belong to already-placed boxes
        const networkPins = og.pins.filter(
          (p) =>
            p.networkId === pin.networkId &&
            p.boxId !== box.boxId &&
            placedBoxIds.has(p.boxId),
        )

        for (const np of networkPins) {
          const npBox = g.boxes.find((b) => b.boxId === np.boxId)
          if (!npBox?.center) continue

          // Calculate where this box should be positioned based on the network connection
          // The pins should be at the same world position, so:
          // npBox.center + np.offset = box.center + pin.offset
          // Therefore: box.center = npBox.center + np.offset - pin.offset
          const networkPinWorldPos = addVec2(npBox.center, np.offset)
          const inferredBoxCenter = {
            x: networkPinWorldPos.x - pin.offset.x,
            y: networkPinWorldPos.y - pin.offset.y,
          }
          candidateCenters.push(inferredBoxCenter)
        }
      }

      if (candidateCenters.length > 0) {
        // Average all candidate centers
        const center = candidateCenters.reduce(
          (acc, v) => ({ x: acc.x + v.x, y: acc.y + v.y }),
          { x: 0, y: 0 },
        )
        center.x /= candidateCenters.length
        center.y /= candidateCenters.length

        // @ts-ignore
        box.kind = "fixed"
        box.center = center
        placedBoxIds.add(box.boxId)
        remainingBoxes.splice(i, 1)
        placedAny = true
      }
    }

    // If we couldn't place any boxes in this iteration, place remaining ones at origin
    if (!placedAny && remainingBoxes.length > 0) {
      const box = remainingBoxes.pop()!
      // @ts-ignore
      box.kind = "fixed"
      box.center = { x: 0, y: 0 }
      placedBoxIds.add(box.boxId)
    }
  }

  return g as FixedBpcGraph
}
