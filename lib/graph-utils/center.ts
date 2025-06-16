import type {Bounds, Vec2} from "../types";

export const center = (obj: Bounds | { center: Vec2 }): Vec2 => {
  if ("center" in obj) {
    return obj.center
  }

  return {
    x: (obj.minX + obj.maxX) / 2,
    y: (obj.minY + obj.maxY) / 2
  }
}