import type { Direction } from "lib/types"

export const getDirectionVec2 = (direction: Direction): Vec2 => {
  switch (direction) {
    case "x+":
      return { x: 1, y: 0 }
    case "x-":
      return { x: -1, y: 0 }
    case "y+":
      return { x: 0, y: 1 }
    case "y-":
      return { x: 0, y: -1 }
  }
}
