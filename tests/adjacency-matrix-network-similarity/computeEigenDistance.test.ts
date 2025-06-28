import { expect, test } from "bun:test"
import { computeEigenDistance } from "lib/adjacency-matrix-network-similarity/computeEigenDistance"

test("computeEigenDistance returns undefined for trivial identical matrices", () => {
  const mat = [[0]]
  const result = computeEigenDistance(mat, mat, 1)
  expect(result).toBe(0)
})
