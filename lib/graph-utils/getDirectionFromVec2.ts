import type { Direction, Vec2 } from "lib/types"

export const getDirectionFromVec2 = (vec2: Vec2): Direction | null => {
  if (vec2.x > 0) return "x+"
  if (vec2.x < 0) return "x-"
  if (vec2.y > 0) return "y+"
  if (vec2.y < 0) return "y-"
  return null
}
