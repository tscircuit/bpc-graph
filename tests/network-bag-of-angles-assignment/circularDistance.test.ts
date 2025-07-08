import { test, expect } from "bun:test"
import { circularDistance } from "lib/network-bag-of-angles-assignment/computeBagOfAnglesDistance"

const τ = 2 * Math.PI

test("identical directions → 0", () => {
  expect(circularDistance(0, 0)).toBe(0)
  expect(circularDistance(1.234, 1.234)).toBe(0)
})

test("full-turn wrap-around still 0", () => {
  expect(circularDistance(0, τ)).toBe(0)
})

test("opposite directions → π", () => {
  expect(circularDistance(0, Math.PI)).toBe(Math.PI)
  expect(circularDistance(-Math.PI / 2, Math.PI / 2)).toBe(Math.PI)
})

test("returns the smaller arc (< π)", () => {
  // 0 ↔ 270°  →  90°  (π/2)
  expect(circularDistance(0, (3 * Math.PI) / 2)).toBeCloseTo(Math.PI / 2)
})

test("circularDistance repro", () => {
  expect(circularDistance(0.2662520491509255, 3.141592653589793)).toBeCloseTo(
    Math.PI - 0.2662520491509255,
  )
})
