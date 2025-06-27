import { expect, test } from "bun:test"
import { computeTopKEigenValues } from "lib/adjacency-matrix-network-similarity/computeTopKEigenValues"

test("computeTopKEigenValues returns correct eigenvalues for 2x2 swap matrix", () => {
  const mat = [
    [1, 0],
    [0, 1],
  ]
  const eigs = computeTopKEigenValues(mat, 2)
  expect(eigs.length).toBe(2)
  expect(eigs).toEqual(expect.arrayContaining([1, -1]))
})
