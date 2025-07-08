import { describe, it, expect } from "bun:test"
import { getNormalizedPerimeterPosition } from "../getNormalizedPerimeterPosition"
import { getNormalizedPerimeterDistance } from "../getNormalizedPerimeterDistance"
import type { Bounds } from "lib/types"

const bounds: Bounds = { minX: 0, minY: 0, maxX: 10, maxY: 20 }
const pos = (x: number, y: number) =>
  getNormalizedPerimeterPosition(bounds, { x, y })!

describe("getNormalizedPerimeterDistance", () => {
  it("returns 0 for identical positions", () => {
    const A = pos(10, 20) // top-right
    const d = getNormalizedPerimeterDistance(A, A)
    expect(d.cwDistance).toBe(0)
    expect(d.ccwDistance).toBe(0)
    expect(d.minDistance).toBe(0)
  })

  it("handles opposite corners (max distance = 2)", () => {
    const A = pos(10, 20) // top-right
    const B = pos(0, 0) // bottom-left
    const d = getNormalizedPerimeterDistance(A, B)
    expect(d.cwDistance).toBeCloseTo(2, 5)
    expect(d.ccwDistance).toBeCloseTo(2, 5)
    expect(d.minDistance).toBeCloseTo(2, 5)
  })

  it("handles asymmetric distances", () => {
    const A = pos(0, 0) // bottom-left
    const B = pos(10, 0) // bottom-right
    const d = getNormalizedPerimeterDistance(A, B)
    expect(d.cwDistance).toBeCloseTo(3, 5) // BL → BR clockwise
    expect(d.ccwDistance).toBeCloseTo(1, 5) // counter-clockwise
    expect(d.minDistance).toBeCloseTo(1, 5)
  })
})
