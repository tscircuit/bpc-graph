import { expect, test } from "bun:test"
import { computeTopKEigenValues } from "lib/adjacency-matrix-network-similarity/computeTopKEigenValues"

test("computeTopKEigenValues returns correct eigenvalues for 3x3 swap matrix", () => {
  const mat = [
    [1, 1, 0],
    [1, 1, 0],
    [0, 0, 1],
  ]
  const eigs = computeTopKEigenValues(mat, 3)
  expect(eigs).toEqual(
    expect.arrayContaining([
      expect.closeTo(2),
      expect.closeTo(1),
      expect.closeTo(0),
    ]),
  )
})
