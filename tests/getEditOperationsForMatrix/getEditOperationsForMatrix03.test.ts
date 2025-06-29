import { test, expect } from "bun:test"
import { getEditOperationsForMatrix } from "lib/adjacency-matrix-network-similarity/getEditOperationsForMatrix"

test("getEditOperationsForMatrix03 – swap indices (Step 3)", () => {
  /*  Source matrix has boxes in order A, C, B while target expects A, B, C  */
  const sourceAdjMatrix = [
    [1, 0, 1], // A connected to B (index 2)
    [0, 1, 0], // C
    [1, 0, 1], // B connected back to A
  ]
  const targetAdjMatrix = [
    [1, 1, 0], // A, B
    [1, 1, 0], // B, A
    [0, 0, 1], // C
  ]

  const sourceMatrixMapping = new Map([
    ["sourceBoxA", 0],
    ["sourceBoxC", 1],
    ["sourceBoxB", 2],
  ])
  const targetMatrixMapping = new Map([
    ["targetBoxA", 0],
    ["targetBoxB", 1],
    ["targetBoxC", 2],
  ])

  const boxAssignment = {
    sourceBoxA: "targetBoxA",
    sourceBoxB: "targetBoxB",
    sourceBoxC: "sourceBoxC",
  }

  const { operations } = getEditOperationsForMatrix({
    sourceAdjMatrix,
    targetAdjMatrix,
    sourceMatrixMapping,
    targetMatrixMapping,
    nodeAssignment: boxAssignment,
  })

  // Expect a single swap_indices operation exchanging rows/columns 1 and 2
  expect(operations).toEqual([
    {
      type: "swap_indices",
      rowAndColumnIndex1: 1,
      rowAndColumnIndex2: 2,
      nodeId1: "sourceBoxC",
      nodeId2: "sourceBoxB",
    },
  ])
})
