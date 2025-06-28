import { expect, test } from "bun:test"
import { getAdjacencyMatrixFromFlatBpcGraph } from "lib/adjacency-matrix-network-similarity/getAdjacencyMatrixFromFlatBpcGraph"
import { getReadableMatrixString } from "lib/matrix-utils/getReadableMatrixString"
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
  expect(
    getReadableMatrixString(matrix, {
      headers: ["A", "A-P1", "B-P2"],
    }),
  ).toMatchInlineSnapshot(`
    "
          A A-P1 B-P2
       A  1    0    0
    A-P1  0    1    1
    B-P2  0    1    1"
  `)
  expect(mapping).toMatchInlineSnapshot(`
    Map {
      "A" => 0,
      "A-P1" => 1,
      "B-P2" => 2,
    }
  `)
})
