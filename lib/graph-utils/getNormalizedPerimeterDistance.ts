import type { Bounds, Vec2 } from "lib/types"
import type { NormalizedPerimeterPosition } from "./getNormalizedPerimeterPosition"

export const getNormalizedPerimeterDistance = (
  A: NormalizedPerimeterPosition,
  B: NormalizedPerimeterPosition,
): { cwDistance: number; ccwDistance: number; minDistance: number } => {
  const posToScalar = (p: NormalizedPerimeterPosition): number => {
    switch (p.side) {
      case "x+":
        return p.cwDistanceFromCorner // 0 … 1
      case "y-":
        return 1 + p.cwDistanceFromCorner // 1 … 2
      case "x-":
        return 2 + p.cwDistanceFromCorner // 2 … 3
      case "y+":
        return 3 + p.cwDistanceFromCorner // 3 … 4 (4 ≡ 0)
    }
  }

  const a = posToScalar(A) % 4
  const b = posToScalar(B) % 4

  const cwDistance = (b - a + 4) % 4 // clockwise  (0 … <4)
  const ccwDistance = (a - b + 4) % 4 // counter-cw (0 … <4)
  const minDistance = Math.min(cwDistance, ccwDistance) // 0 … 2

  return { cwDistance, ccwDistance, minDistance }
}
