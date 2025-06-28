import { test, expect } from "bun:test"
import { getEditOperationsForMatrix } from "lib/adjacency-matrix-network-similarity/getEditOperationsForMatrix"

test("getEditOperationsForMatrix02", () => {
  // This is a basic test for getEditOperationsForMatrix
  // Source: 3x3 identity, Target: 2x2 identity (should require one delete_node)
  const sourceAdjMatrix = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]
  const targetAdjMatrix = [
    [1, 0],
    [0, 1],
  ]
  const sourceMatrixMapping = new Map([
    ["sourceBox1", 0],
    ["sourceBox2", 1],
    ["sourceBox3", 2],
  ])
  const targetMatrixMapping = new Map([
    ["targetBox1", 0],
    ["targetBox2", 1],
  ])
  const boxAssignment = {
    sourceBox1: "targetBox1",
    sourceBox2: "targetBox2",
    // sourceBox3 is not assigned, so should be deleted
  }
  const netAssignment = {}

  const result = getEditOperationsForMatrix({
    sourceAdjMatrix,
    targetAdjMatrix,
    sourceMatrixMapping,
    targetMatrixMapping,
    boxAssignment,
    netAssignment,
  })

  // The expected operation is to delete the node at index 2
  expect(result.operations).toEqual([
    {
      type: "delete_node",
      rowAndColumnIndexToRemove: 2,
      sourceBoxId: expect.any(String),
    },
  ])
})
