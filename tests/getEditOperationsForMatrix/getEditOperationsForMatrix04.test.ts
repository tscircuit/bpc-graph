import { test, expect } from "bun:test"
import { getEditOperationsForMatrix } from "lib/adjacency-matrix-network-similarity/getEditOperationsForMatrix"

test("getEditOperationsForMatrix04 – disconnect nodes (Step 4)", () => {
  /* 2×2 matrices, same ordering, but source has an extra connection */
  const sourceAdjMatrix = [
    [1, 1],
    [1, 1],
  ]
  const targetAdjMatrix = [
    [1, 0],
    [0, 1],
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

  const { operations } = getEditOperationsForMatrix({
    fixedAdjMatrix: sourceAdjMatrix,
    floatingAdjMatrix: targetAdjMatrix,
    fixedMatrixMapping: sourceMatrixMapping,
    floatingMatrixMapping: targetMatrixMapping,
    floatingToFixedNodeAssignment: boxAssignment,
  })

  /* Only one operation should be needed: disconnect the off-diagonal link */
  expect(operations).toEqual([
    {
      type: "disconnect_nodes",
      rowAndColumnIndex1: 0,
      rowAndColumnIndex2: 1,
      nodeId1: "sourceBoxA",
      nodeId2: "sourceBoxB",
    },
  ])
})
