import type { Bounds, Vec2 } from "lib/types"

export interface NormalizedPerimeterPosition {
  side: "x+" | "x-" | "y+" | "y-"

  /**
   * Clockwise distance from the corner. E.g. if the side is "x+", then 0.25
   * means that we are 25% of the way from the top-right corner.
   */
  cwDistanceFromCorner: number
}

const EPS = 1e-6 // tolerance for “on-edge” comparisons

export const getNormalizedPerimeterPosition = (
  bounds: Bounds,
  position: Vec2,
): NormalizedPerimeterPosition | null => {
  const { minX, minY, maxX, maxY } = bounds

  const near = (a: number, b: number) => Math.abs(a - b) < EPS

  let side: NormalizedPerimeterPosition["side"]
  let cwDistanceFromCorner: number

  if (
    near(position.x, maxX) &&
    position.y >= minY - EPS &&
    position.y <= maxY + EPS
  ) {
    // Right edge  (x+), start at top-right corner
    side = "x+"
    cwDistanceFromCorner = (maxY - position.y) / (maxY - minY)
  } else if (
    near(position.y, maxY) && // TOP edge  (y+)
    position.x <= maxX + EPS &&
    position.x >= minX - EPS
  ) {
    side = "y+" // TOP = y+
    // start at top-left corner, go clockwise to top-right
    cwDistanceFromCorner = (position.x - minX) / (maxX - minX)
  } else if (
    near(position.x, minX) &&
    position.y <= maxY + EPS &&
    position.y >= minY - EPS
  ) {
    // Left edge   (x-), start at bottom-left corner
    side = "x-"
    cwDistanceFromCorner = (position.y - minY) / (maxY - minY)
  } else if (
    near(position.y, minY) && // BOTTOM edge (y-)
    position.x >= minX - EPS &&
    position.x <= maxX + EPS
  ) {
    side = "y-" // BOTTOM = y-
    // start at bottom-right corner, go clockwise to bottom-left
    cwDistanceFromCorner = (maxX - position.x) / (maxX - minX)
  } else {
    return null
  }

  // Clamp to [0, 1] to guard against floating-point drift
  cwDistanceFromCorner = Math.min(1, Math.max(0, cwDistanceFromCorner))

  return { side, cwDistanceFromCorner }
}
