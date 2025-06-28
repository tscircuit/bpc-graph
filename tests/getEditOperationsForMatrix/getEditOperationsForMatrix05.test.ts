import { test, expect } from "bun:test"
import { getEditOperationsForMatrix } from "lib/adjacency-matrix-network-similarity/getEditOperationsForMatrix"

test("getEditOperationsForMatrix05 - connect nodes (Step 5)", () => {
  /* Source lacks an edge that exists in target */
  const sourceAdjMatrix = [
    [1, 0],
    [0, 1],
  ]
  const targetAdjMatrix = [
    [1, 1],
    [1, 1],
  ]

  const sourceMatrixMapping = new Map([
    ["sourceBoxA", 0],
    ["sourceBoxB", 1],
  ])
  const targetMatrixMapping = new Map([
    ["targetBoxA", 0],
    ["targetBoxB", 1],
  ])

  const boxAssignment = {
    sourceBoxA: "targetBoxA",
    sourceBoxB: "targetBoxB",
  }
  const netAssignment = {}

  const { operations } = getEditOperationsForMatrix({
    sourceAdjMatrix,
    targetAdjMatrix,
    sourceMatrixMapping,
    targetMatrixMapping,
    nodeAssignment: boxAssignment,
    netAssignment,
  })

  expect(operations).toEqual([
    {
      type: "connect_nodes",
      rowAndColumnIndex1: 0,
      rowAndColumnIndex2: 1,
      nodeId1: "sourceBoxA",
      nodeId2: "sourceBoxB",
    },
  ])
})
