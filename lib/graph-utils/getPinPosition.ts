import type {BpcGraph, Vec2} from "../types";

export const getPinPosition = (g: BpcGraph, pinId: string): Vec2 => {
  const pin = g.pins.find(p => p.pinId === pinId)
  if (!pin) {
    throw new Error(`Pin "${pinId}" not found`)
  }

  const box = g.boxes.find(b => b.boxId === pin.boxId)

  if (!box) {
    throw new Error(`Box "${pin.boxId}" not found`)
  }

  const boxCenter =  box.center ?? {x: 0, y: 0}

  return {
    x: pin.offset.x + boxCenter.x,
    y: pin.offset.y + boxCenter.y
  }
}