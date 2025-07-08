import type { BpcPin } from "lib/types"

export const getBoundsOfPinList = (pins: BpcPin[]) => {
  const minX = Math.min(...pins.map((p) => p.offset.x))
  const maxX = Math.max(...pins.map((p) => p.offset.x))
  const minY = Math.min(...pins.map((p) => p.offset.y))
  const maxY = Math.max(...pins.map((p) => p.offset.y))
  return { minX, maxX, minY, maxY }
}
