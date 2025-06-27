import { expect, test } from "bun:test"
import { getAdjacencyMatrixFromFlatBpcGraph } from "lib/adjacency-matrix-network-similarity/getAdjacencyMatrixFromFlatBpcGraph"
import type { FlatBpcGraph } from "lib/types"

test("getAdjacencyMatrixFromFlatBpcGraph builds correct adjacency matrix", () => {
  const flat: FlatBpcGraph = {
    nodes: [
      { id: "A", color: "box" },
      { id: "A-P1", color: "red" },
      { id: "B-P2", color: "blue" },
    ],
    undirectedEdges: [["A-P1", "B-P2"]],
  }
  const { matrix, mapping } = getAdjacencyMatrixFromFlatBpcGraph(flat)
  expect(matrix.length).toBe(3)
  expect(matrix[0]!.length).toBe(3)
  expect(matrix[1]![2]).toBe(1)
  expect(matrix[2]![1]).toBe(1)
  // All other distinct-index cells are 0
  for (let i = 0; i < 3; ++i) {
    for (let j = 0; j < 3; ++j) {
      if ((i === 1 && j === 2) || (i === 2 && j === 1)) continue
      if (i !== j) expect(matrix[i]![j]).toBe(0)
    }
  }
})
