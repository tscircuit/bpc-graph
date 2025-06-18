import type { Bounds, BpcPin } from "../types"
import { getPinPosition } from "./getPinPosition"

export const getBoundsOfPins = (pins: BpcPin[]): Bounds => {
  if (pins.length === 0) {
    throw new Error("Cannot get bounds of empty pin list")
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const pin of pins) {
    minX = Math.min(minX, pin.offset.x)
    minY = Math.min(minY, pin.offset.y)
    maxX = Math.max(maxX, pin.offset.x)
    maxY = Math.max(maxY, pin.offset.y)
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
  }
}
