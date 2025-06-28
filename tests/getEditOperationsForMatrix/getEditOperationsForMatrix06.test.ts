import { test, expect } from "bun:test"
import { getEditOperationsForMatrix } from "lib/adjacency-matrix-network-similarity/getEditOperationsForMatrix"

test("getEditOperationsForMatrix06 – mixed operations (delete / create / swap / disconnect / connect)", () => {
  /* ------------- SET-UP ------------- */
  // Source has 3 nodes (Box1, Box2, Box3) and extra connections.
  const sourceAdjMatrix = [
    [1, 1, 1], // Box1 connected to Box2 & Box3
    [1, 1, 0], // Box2 connected to Box1         (will be deleted)
    [1, 0, 1], // Box3 connected to Box1
  ]
  // Target has 3 nodes (T1, T2, T3) but a different ordering
  // and a different edge pattern.
  const targetAdjMatrix = [
    [1, 0, 1], // T1 connected to T3
    [0, 1, 0], // T2 isolated
    [1, 0, 1], // T3 connected to T1
  ]

  /* index mappings in the two matrices */
  const sourceMatrixMapping = new Map([
    ["sourceBox1", 0],
    ["sourceBox2", 1],
    ["sourceBox3", 2],
  ])
  const targetMatrixMapping = new Map([
    ["targetBox1", 0],
    ["targetBox2", 1],
    ["targetBox3", 2],
  ])

  /* Box assignment (Box2 is LEFT UNMAPPED on purpose) */
  const boxAssignment = {
    sourceBox1: "targetBox2", // will need SWAP
    sourceBox3: "targetBox1", // will need SWAP
    // sourceBox2 → unmapped → will be DELETED
  }
  const netAssignment = {}

  /* ------------- ACT ------------- */
  const { operations } = getEditOperationsForMatrix({
    sourceAdjMatrix,
    targetAdjMatrix,
    sourceMatrixMapping,
    targetMatrixMapping,
    nodeAssignment: boxAssignment,
    netAssignment,
  })

  /* ------------- ASSERT ------------- */
  expect(operations).toEqual([
    /* Step 1 – delete unmapped Box2 (index 1) */
    {
      type: "delete_node",
      rowAndColumnIndexToRemove: 1,
      nodeId: "sourceBox2",
    },
    /* Step 2 – create a new node for unmapped targetBox3 (index 2) */
    {
      type: "create_node",
      newRowAndColumnIndex: 2,
      nodeId: expect.any(String), // synthetic id
    },
    /* Step 3 – reorder: swap sourceBox1 & sourceBox3 (indices 0↔1) */
    {
      type: "swap_indices",
      rowAndColumnIndex1: 0,
      rowAndColumnIndex2: 1,
      nodeId1: "sourceBox1",
      nodeId2: "sourceBox3",
    },
    /* Step 4 – disconnect edge that exists only in source (0,1) */
    {
      type: "disconnect_nodes",
      rowAndColumnIndex1: 0,
      rowAndColumnIndex2: 1,
      nodeId1: "sourceBox3", // after swap index 0 == sourceBox3
      nodeId2: "sourceBox1", // after swap index 1 == sourceBox1
    },
    /* Step 5 – connect edge that exists only in target (0,2) */
    {
      type: "connect_nodes",
      rowAndColumnIndex1: 0,
      rowAndColumnIndex2: 2,
      nodeId1: "sourceBox3",
      nodeId2: expect.any(String), // the synthetic box
    },
  ])
})
