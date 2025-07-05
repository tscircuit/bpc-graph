import { test, expect } from "bun:test"
import { getEditOperationsForMatrix } from "lib/adjacency-matrix-network-similarity/getEditOperationsForMatrix"

test.skip("getEditOperationsForMatrix01", () => {
  // This is a basic test for getEditOperationsForMatrix
  // Source: 2x2 identity, Target: 3x3 identity (should require one create_node)
  const sourceAdjMatrix = [
    [1, 0],
    [0, 1],
  ]
  const targetAdjMatrix = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]
  const sourceMatrixMapping = new Map([
    ["sourceBox1", 0],
    ["sourceBox2", 1],
  ])
  const targetMatrixMapping = new Map([
    ["targetBox1", 0],
    ["targetBox2", 1],
    ["targetBox3", 2],
  ])
  const boxAssignment = {
    sourceBox1: "targetBox1",
    sourceBox2: "targetBox2",
  }

  const result = getEditOperationsForMatrix({
    fixedAdjMatrix: sourceAdjMatrix,
    floatingAdjMatrix: targetAdjMatrix,
    fixedMatrixMapping: sourceMatrixMapping,
    floatingMatrixMapping: targetMatrixMapping,
    floatingToFixedNodeAssignment: boxAssignment,
  })

  // The expected operation is to create a new node at index 2
  expect(result.operations).toEqual([
    {
      type: "create_node",
      newRowAndColumnIndex: 2,
      nodeId: expect.any(String),
      floatingNodeId: "targetBox3",
      isBox: true,
    },
  ])
})
