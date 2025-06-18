import type { Bounds, BpcGraph } from "../types"
import { getBoundsOfBpcBox } from "./getBoundsOfBpcBox"

export const getGraphBounds = (g: BpcGraph): Bounds => {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  if (g.boxes.length === 0) {
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
    }
  }

  for (const box of g.boxes) {
    const bounds = getBoundsOfBpcBox(g, box.boxId)
    minX = Math.min(minX, bounds.minX)
    minY = Math.min(minY, bounds.minY)
    maxX = Math.max(maxX, bounds.maxX)
    maxY = Math.max(maxY, bounds.maxY)
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
  }
}
