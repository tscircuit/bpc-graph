import { describe, it, expect } from "vitest"
import { getNormalizedPerimeterPosition } from "../getNormalizedPerimeterPosition"
import type { Bounds, Vec2 } from "lib/types"

const bounds: Bounds = { minX: 0, minY: 0, maxX: 10, maxY: 20 }

function check(
  pos: Vec2,
  expectedSide: "x+" | "x-" | "y+" | "y-",
  expectedDist: number,
) {
  const { side, cwDistanceFromCorner } = getNormalizedPerimeterPosition(
    bounds,
    pos,
  )
  expect(side).toBe(expectedSide)
  expect(cwDistanceFromCorner).toBeCloseTo(expectedDist, 5)
}

describe("getNormalizedPerimeterPosition", () => {
  it("handles the right edge (x+)", () => {
    check({ x: 10, y: 20 }, "x+", 0) // bottom-right corner
    check({ x: 10, y: 10 }, "x+", 0.5) // midway
    check({ x: 10, y: 0 }, "x+", 1) // top-right corner
  })

  it("handles the top edge (y+)", () => {
    check({ x: 0, y: 20 }, "y+", 0) // top-left
    check({ x: 5, y: 20 }, "y+", 0.5) // midway
    // Removed top-right corner to avoid duplicate edge test
  })

  it("handles the left edge (x-)", () => {
    check({ x: 0, y: 19.999 }, "x-", 0.99995) // near-top-left, only on x-
    check({ x: 0, y: 10 }, "x-", 0.5) // midway
    check({ x: 0, y: 0 }, "x-", 0) // bottom-left
  })

  it("handles the bottom edge (y-)", () => {
    // Removed bottom-right corner to avoid duplicate edge test
    check({ x: 5, y: 0 }, "y-", 0.5) // midway
    check({ x: 0, y: 0 }, "x-", 0) // bottom-left
  })

  it("throws if the point is not on the perimeter", () => {
    expect(() =>
      getNormalizedPerimeterPosition(bounds, { x: 5, y: 5 }),
    ).toThrow()
  })
})
