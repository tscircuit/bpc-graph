import type { BpcGraph, Direction, FixedBoxId, FloatingBoxId } from "lib/types"
import { getPinDirection } from "./getPinDirection"

export const getDominantPinSide = (
  g: BpcGraph,
  boxId: FixedBoxId | FloatingBoxId,
): Direction | null => {
  const box = g.boxes.find((b) => b.boxId === boxId)
  if (!box) throw new Error(`Box ${boxId} not found`)

  const pins = g.pins.filter((p) => p.boxId === boxId)

  const pinDirections = pins.map((p) => getPinDirection(g, box, p))

  const sideCounts = {
    "x-": 0,
    "x+": 0,
    "y-": 0,
    "y+": 0,
  }

  for (const dir of pinDirections) {
    if (!dir) continue
    sideCounts[dir]++
  }

  // If there is any conflicting direction, we can't determine the dominant side
  // and return null
  const maxSideCount = Math.max(...Object.values(sideCounts))
  for (const key of Object.keys(sideCounts) as Direction[]) {
    if (sideCounts[key] === maxSideCount) {
      return key
    }
  }

  return null
}
