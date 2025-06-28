import { swapRowsAndColumns } from "lib/matrix-utils/swapRowsAndColumns"
import type { Assignment } from "./getApproximateAssignments"

export type EditOperation =
  // Added in step 1
  | {
      type: "delete_node"
      rowAndColumnIndexToRemove: number
      nodeId: string
    }
  // Added in step 2
  | {
      type: "create_node"
      newRowAndColumnIndex: number
      nodeId: string
    }
  // Added in step 3
  | {
      type: "swap_indices"
      rowAndColumnIndex1: number
      rowAndColumnIndex2: number
      nodeId1: string
      nodeId2: string
    }
  // Added in step 4
  | {
      type: "disconnect_nodes"
      rowAndColumnIndex1: number
      rowAndColumnIndex2: number
      nodeId1: string
      nodeId2: string
    }
  // Added in step 5
  | {
      type: "connect_nodes"
      rowAndColumnIndex1: number
      rowAndColumnIndex2: number
      nodeId1: string
      nodeId2: string
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
  nodeAssignment: Assignment<string, string>
}): {
  operations: EditOperation[]
  newSourceAdjMatrix: number[][]
  newSourceMatrixMapping: Map<string, number>
  newNodeAssignment: Assignment<string, string>
} => {
  const {
    sourceAdjMatrix,
    targetAdjMatrix,
    nodeAssignment,
    sourceMatrixMapping,
    targetMatrixMapping,
  } = params

  const operations: EditOperation[] = []

  let currentSourceAdjMatrix = structuredClone(sourceAdjMatrix)
  let currentNodeAssignment = structuredClone(nodeAssignment)
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
   * nodeAssignment:
   * {
   *   "sourceBox1": "targetBox1",
   *   "sourceBox2": "targetBox2",
   * }
   *
   * operations:
   * [ { type: "disconnect_node", rowAndColumnIndexToRemove: 2, sourceBoxId: "sourceBox3" } ]
   */
  /* ---------- STEP 1 – DELETE NODES NOT ASSIGNED TO A TARGET BOX ---------- */
  {
    // Source boxes that have NO mapping to any target box
    const unmappedSourceBoxIds = [...currentSourceMatrixMapping.keys()].filter(
      (boxId) => !(boxId in currentNodeAssignment),
    )

    // Nothing to do
    if (unmappedSourceBoxIds.length === 0) {
      /* no-op */
    } else {
      // Build list of { boxId, index } and sort descending so index shifting is safe
      const deletions = unmappedSourceBoxIds
        .map((boxId) => ({
          boxId,
          index: currentSourceMatrixMapping.get(boxId)!,
        }))
        .sort((a, b) => b.index - a.index)

      for (const { boxId, index } of deletions) {
        // Record operation
        operations.push({
          type: "delete_node",
          rowAndColumnIndexToRemove: index,
          nodeId: boxId,
        })

        // Remove the row
        currentSourceAdjMatrix.splice(index, 1)
        // Remove the column from each remaining row
        for (const row of currentSourceAdjMatrix) {
          row.splice(index, 1)
        }

        // Update source→matrix mapping
        currentSourceMatrixMapping.delete(boxId)
        for (const [otherBoxId, otherIdx] of currentSourceMatrixMapping) {
          if (otherIdx > index) {
            currentSourceMatrixMapping.set(otherBoxId, otherIdx - 1)
          }
        }
      }
    }
  }

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
   * nodeAssignment:
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
  /* ---------- STEP 2 – CREATE NODES FOR UNMAPPED TARGET BOXES ---------- */
  {
    // We only need to create nodes when the target matrix is bigger
    const sizeDiff = targetAdjMatrix.length - currentSourceAdjMatrix.length
    if (sizeDiff <= 0) {
      /* nothing to create */
    } else {
      // Identify target-side boxes that no source box is currently mapped to
      const mappedTargetBoxIds = new Set(Object.values(currentNodeAssignment))
      const unmappedTargetBoxIds = [...targetMatrixMapping.keys()].filter(
        (tBoxId) => !mappedTargetBoxIds.has(tBoxId),
      )

      let newBoxCounter = 0
      // Only create as many nodes as needed to match the size difference
      for (const targetBoxId of unmappedTargetBoxIds.slice(0, sizeDiff)) {
        // Generate a unique synthetic source-box id
        const newSourceBoxId = `newly-inserted-box-${++newBoxCounter}`

        // We will append the new node at the end of the current matrix
        const insertIndex = currentSourceAdjMatrix.length

        // Extend every existing row with a 0 (new column)
        for (const row of currentSourceAdjMatrix) {
          row.push(0)
        }

        // Create a new row filled with 0s and add a self-loop (1 on the diagonal)
        const newRow = new Array(insertIndex + 1).fill(0)
        newRow[insertIndex] = 1
        currentSourceAdjMatrix.push(newRow)

        // Update mappings and assignments
        currentSourceMatrixMapping.set(newSourceBoxId, insertIndex)
        currentNodeAssignment[newSourceBoxId] = targetBoxId

        // Record the create_node operation
        operations.push({
          type: "create_node",
          newRowAndColumnIndex: insertIndex,
          nodeId: newSourceBoxId,
        })
      }
    }
  }

  // Step 3: Reorder the rows/columns of the source adjacency matrix so that
  // its order matches the target adjacency matrix according to the current
  // nodeAssignment.  After this reordering the two matrices can be compared
  // element-by-element.
  /**
   * e.g.
   * source (after Steps 1 & 2):
   * [ [ 1, 0, 1 ],   // A connected to B (index 2), C is at index 1
   *   [ 0, 1, 0 ],   // C only self-loop
   *   [ 1, 0, 1 ] ]  // B connected back to A
   *
   * target:
   * [ [ 1, 1, 0 ],   // Desired order is A, B, C
   *   [ 1, 1, 0 ],
   *   [ 0, 0, 1 ] ]
   *
   * currentSourceMatrixMapping:
   * {
   *   "sourceBoxA": 0,
   *   "sourceBoxC": 1,
   *   "sourceBoxB": 2,
   * }
   *
   * targetMatrixMapping:
   * {
   *   "targetBoxA": 0,
   *   "targetBoxB": 1,
   *   "targetBoxC": 2,
   * }
   *
   * nodeAssignment:
   * {
   *   "sourceBoxA": "targetBoxA",
   *   "sourceBoxB": "targetBoxB",
   *   "sourceBoxC": "targetBoxC",
   * }
   *
   * To match the target ordering we need to swap indices 1 and 2
   * ("sourceBoxC" ↔ "sourceBoxB").
   *
   * operations:
   * [ { type: "swap_indices",
   *     rowAndColumnIndex1: 1,
   *     rowAndColumnIndex2: 2,
   *     sourceBoxId1: "sourceBoxC",
   *     sourceBoxId2: "sourceBoxB" } ]
   */

  /* ---------- STEP 3 – REORDER SOURCE MATRIX TO MATCH TARGET ORDER ---------- */
  {
    /* --------------------------------------------------------- */
    /*  Build reverse mapping  (targetBoxId → sourceBoxId)       */
    /* --------------------------------------------------------- */
    const targetToSource = new Map<string, string>()
    for (const [srcBoxId, tgtBoxId] of Object.entries(currentNodeAssignment)) {
      targetToSource.set(tgtBoxId, srcBoxId)
    }

    /* --------------------------------------------------------- */
    /*  Iterate over the desired ordering (target indices)       */
    /* --------------------------------------------------------- */
    for (const [targetBoxId, desiredIdx] of targetMatrixMapping.entries()) {
      const srcBoxId = targetToSource.get(targetBoxId)
      if (!srcBoxId) continue // no source box mapped → will be handled later
      const currentIdx = currentSourceMatrixMapping.get(srcBoxId)
      if (currentIdx === undefined || currentIdx === desiredIdx) continue

      /* Who is sitting at the spot we want to occupy? */
      const srcBoxIdAtDesiredIdx = [
        ...currentSourceMatrixMapping.entries(),
      ].find(([, idx]) => idx === desiredIdx)?.[0]

      if (srcBoxIdAtDesiredIdx === undefined) continue // should not happen

      /* -------- perform swap in matrix & bookkeeping -------- */
      swapRowsAndColumns(currentSourceAdjMatrix, currentIdx, desiredIdx)

      currentSourceMatrixMapping.set(srcBoxId, desiredIdx)
      currentSourceMatrixMapping.set(srcBoxIdAtDesiredIdx, currentIdx)

      // Always record the lower index first to keep a stable ordering
      const index1 = Math.min(currentIdx, desiredIdx)
      const index2 = Math.max(currentIdx, desiredIdx)
      const sourceBoxId1 =
        index1 === currentIdx ? srcBoxId : srcBoxIdAtDesiredIdx
      const sourceBoxId2 =
        index1 === currentIdx ? srcBoxIdAtDesiredIdx : srcBoxId

      operations.push({
        type: "swap_indices",
        rowAndColumnIndex1: index1,
        rowAndColumnIndex2: index2,
        nodeId1: sourceBoxId1,
        nodeId2: sourceBoxId2,
      })
    }
  }

  // Step 4: Disconnect nodes by comparing newSourceAdjMatrix and targetAdjMatrix
  /**
   * Example:
   * source:
   * [ [ 1, 1 ],
   *   [ 1, 1 ] ]
   *
   * target:
   * [ [ 1, 0 ],
   *   [ 0, 1 ] ]
   *
   * currentSourceMatrixMapping:
   * {
   *   "sourceBoxA": 0,
   *   "sourceBoxB": 1,
   * }
   *
   * targetMatrixMapping:
   * {
   *   "targetBoxA": 0,
   *   "targetBoxB": 1,
   * }
   *
   * nodeAssignment:
   * {
   *   "sourceBoxA": "targetBoxA",
   *   "sourceBoxB": "targetBoxB",
   * }
   *
   * The off-diagonal 1’s in the source matrix (indices [0,1] and [1,0])
   * have no corresponding 1’s in the target matrix, so they must be turned
   * into 0’s.  That is captured with one disconnect_nodes operation:
   *
   * operations:
   * [ { type: "disconnect_nodes",
   *     rowAndColumnIndex1: 0,
   *     rowAndColumnIndex2: 1,
   *     sourceBoxId1: "sourceBoxA",
   *     sourceBoxId2: "sourceBoxB" } ]
   */
  /* ---------- STEP 4 – DISCONNECT EDGES PRESENT IN SOURCE BUT NOT TARGET ---------- */
  {
    // Build reverse lookup: matrix-index -> sourceBoxId
    const indexToSourceBoxId = new Map<number, string>()
    for (const [srcBoxId, idx] of currentSourceMatrixMapping) {
      indexToSourceBoxId.set(idx, srcBoxId)
    }

    const n = currentSourceAdjMatrix.length // after Steps 1-3 this must equal targetAdjMatrix.length
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const sourceVal = currentSourceAdjMatrix[i]![j]
        const targetVal = targetAdjMatrix[i]![j]

        // Edge exists in source but not in target → must be disconnected
        if (sourceVal === 1 && targetVal === 0) {
          const sourceBoxId1 = indexToSourceBoxId.get(i)!
          const sourceBoxId2 = indexToSourceBoxId.get(j)!

          operations.push({
            type: "disconnect_nodes",
            rowAndColumnIndex1: i,
            rowAndColumnIndex2: j,
            nodeId1: sourceBoxId1,
            nodeId2: sourceBoxId2,
          })

          // Mutate the working matrix so later steps see the change
          currentSourceAdjMatrix[i]![j] = 0
          currentSourceAdjMatrix[j]![i] = 0
        }
      }
    }
  }

  // Step 5: Connect nodes by comparing newSourceAdjMatrix and targetAdjMatrix
  // We explore the newSourceAdjMatrix and look for 1s/0s that don't match

  /* ---------- STEP 5 – CONNECT EDGES PRESENT IN TARGET BUT NOT SOURCE ---------- */
  {
    // reverse lookup  (matrix index → sourceBoxId)
    const indexToSourceBoxId = new Map<number, string>()
    for (const [srcBoxId, idx] of currentSourceMatrixMapping) {
      indexToSourceBoxId.set(idx, srcBoxId)
    }

    const n = currentSourceAdjMatrix.length
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const sourceVal = currentSourceAdjMatrix[i]![j]
        const targetVal = targetAdjMatrix[i]![j]

        // Edge exists in target but not in source → must be connected
        if (sourceVal === 0 && targetVal === 1) {
          const sourceBoxId1 = indexToSourceBoxId.get(i)!
          const sourceBoxId2 = indexToSourceBoxId.get(j)!

          operations.push({
            type: "connect_nodes",
            rowAndColumnIndex1: i,
            rowAndColumnIndex2: j,
            nodeId1: sourceBoxId1,
            nodeId2: sourceBoxId2,
          })

          // update working matrix so later logic (future extensions / callers) is consistent
          currentSourceAdjMatrix[i]![j] = 1
          currentSourceAdjMatrix[j]![i] = 1
        }
      }
    }
  }

  return {
    newSourceAdjMatrix: currentSourceAdjMatrix,
    newSourceMatrixMapping: currentSourceMatrixMapping,
    newNodeAssignment: currentNodeAssignment,
    operations,
  }
}
