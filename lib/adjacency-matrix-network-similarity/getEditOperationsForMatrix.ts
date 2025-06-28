import type { Assignment } from "./getApproximateAssignments"

export type EditOperation =
  // Added in step 1
  | {
      type: "delete_node"
      rowAndColumnIndexToRemove: number
      sourceBoxId: string
    }
  // Added in step 2
  | {
      type: "create_node"
      newRowAndColumnIndex: number
      sourceBoxId: string
    }
  // Added in step 3
  | {
      type: "swap_indices"
      rowAndColumnIndex1: number
      rowAndColumnIndex2: number
      sourceBoxId1: string
      sourceBoxId2: string
    }
  // Added in step 4
  | {
      type: "disconnect_nodes"
      rowAndColumnIndex1: number
      rowAndColumnIndex2: number
      sourceBoxId1: string
      sourceBoxId2: string
    }
  // Added in step 5
  | {
      type: "connect_nodes"
      rowAndColumnIndex1: number
      rowAndColumnIndex2: number
      sourceBoxId1: string
      sourceBoxId2: string
    }

export const getEditOperationsForMatrix = (params: {
  // Square Adjacency Matrix for Source Graph
  sourceAdjMatrix: number[][]

  // Square Adjacency Matrix for Target Graph
  targetAdjMatrix: number[][]

  // { [SourceBoxId]: SourceColumnIndex/SourceRowIndex in AdjMatrix }
  sourceMatrixMapping: Map<string, number>

  // { [TargetBoxId]: TargetColumnIndex/TargetRowIndex in AdjMatrix }
  targetMatrixMapping: Map<string, number>

  // { [SourceBoxId]: TargetBoxId }
  boxAssignment: Assignment<string, string>

  // { [SourceNetId]: TargetNetId }
  netAssignment: Assignment<string, string>
}): {
  operations: EditOperation[]
  newSourceAdjMatrix: number[][]
  newSourceMatrixMapping: Map<string, number>
  newBoxAssignment: Assignment<string, string>
} => {
  const {
    sourceAdjMatrix,
    targetAdjMatrix,
    boxAssignment,
    netAssignment,
    sourceMatrixMapping,
    targetMatrixMapping,
  } = params

  const operations: EditOperation[] = []

  let currentSourceAdjMatrix = structuredClone(sourceAdjMatrix)
  let currentBoxAssignment = structuredClone(boxAssignment)
  let currentSourceMatrixMapping = structuredClone(sourceMatrixMapping)

  // Step 1: If the source matrix is larger than the target matrix,
  // we just need to remove rows/columns in the source matrix that are not
  // mapped to a target box
  // e.g.
  /**
   * source:
   * [ [ 1, 0, 0 ],
   *   [ 0, 1, 0 ],
   *   [ 0, 0, 1 ] ]
   *
   * target:
   * [ [ 1, 0 ],
   *   [ 0, 1 ] ]
   *
   * sourceMatrixMapping:
   * {
   *   "sourceBox1": 0,
   *   "sourceBox2": 1,
   *   "sourceBox3": 2,
   * }
   *
   * targetMatrixMapping:
   * {
   *   "targetBox1": 0,
   *   "targetBox2": 1,
   * }
   *
   * boxAssignment:
   * {
   *   "sourceBox1": "targetBox1",
   *   "sourceBox2": "targetBox2",
   * }
   *
   * operations:
   * [ { type: "disconnect_node", rowAndColumnIndexToRemove: 2, sourceBoxId: "sourceBox3" } ]
   */
  // TODO

  // Step 2: Source Matrix Size < Target Matrix Size:
  // We need to modify currentSourceAdjMatrix to be the same size as the target adjacency matrix.
  // We do this by zeroing out the rows and columns that would be unmapped in the new source adjacency matrix and
  // assigning them to unmapped connections.
  // e.g.
  /**
   * source:
   * [ [ 1, 0 ],
   *   [ 0, 1 ] ]
   *
   * target:
   * [ [ 1, 0, 0 ],
   *   [ 0, 1, 0 ],
   *   [ 0, 0, 1 ] ]
   *
   * sourceMatrixMapping:
   * {
   *   "sourceBox1": 0,
   *   "sourceBox2": 1,
   * }
   *
   * targetMatrixMapping:
   * {
   *   "targetBox1": 0,
   *   "targetBox2": 1,
   *   "targetBox3": 2,
   * }
   *
   * boxAssignment:
   * {
   *   "sourceBox1": "targetBox1",
   *   "sourceBox2": "targetBox2",
   * }
   *
   * operations:
   * [
   *   { type: "create_node", newRowAndColumnIndex: 2, sourceBoxId: "newly-inserted-box-1" },
   * ]
   *
   * newSourceAdjMatrix:
   * [ [ 1, 0, 0 ],
   *   [ 0, 1, 0 ],
   *   [ 0, 0, 1 ] ]
   *
   * newSourceMatrixMapping:
   * {
   *   "sourceBox1": 0,
   *   "sourceBox2": 1,
   *   "newly-inserted-box-1": 2,
   * }
   *
   * newBoxAssignment:
   * {
   *   "sourceBox1": "targetBox1",
   *   "sourceBox2": "targetBox2",
   *   "newly-inserted-box-1": "targetBox3",
   * }
   */
  // TODO

  // Step 3: Reorder the rows/columns of the source adjacency matrix to match
  // the target adjacency matrix based on assignments. After this reordering,
  // it is now expected that the source and target adjacency matrices can be
  // directly compared

  // Step 4: Disconnect nodes by comparing newSourceAdjMatrix and targetAdjMatrix
  // We explore the newSourceAdjMatrix and look for 1s/0s that don't match

  // Step 5: Connect nodes by comparing newSourceAdjMatrix and targetAdjMatrix
  // We explore the newSourceAdjMatrix and look for 1s/0s that don't match

  return {
    newSourceAdjMatrix: currentSourceAdjMatrix,
    newSourceMatrixMapping: currentSourceMatrixMapping,
    newBoxAssignment: currentBoxAssignment,
    operations,
  }
}
