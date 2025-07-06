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
      floatingNodeId: string
      isBox: boolean
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
  // Square Adjacency Matrix for Fixed/Source Graph
  fixedAdjMatrix: number[][]

  // Square Adjacency Matrix for Floating/Target Graph
  floatingAdjMatrix: number[][]

  // { [SourceNodeId]: SourceColumnIndex/SourceRowIndex in AdjMatrix }
  fixedMatrixMapping: Map<string, number>

  // { [TargetNodeId]: TargetColumnIndex/TargetRowIndex in AdjMatrix }
  floatingMatrixMapping: Map<string, number>

  // { [SourceNodeId]: TargetNodeId }
  floatingToFixedNodeAssignment: Assignment<string, string>
}): {
  operations: EditOperation[]
  newSourceAdjMatrix: number[][]
  newSourceMatrixMapping: Map<string, number>
  newFloatingToFixedNodeAssignment: Assignment<string, string>
} => {
  const {
    fixedAdjMatrix,
    floatingAdjMatrix,
    floatingToFixedNodeAssignment,
    fixedMatrixMapping,
    floatingMatrixMapping,
  } = params

  const fixedToFloatingNodeAssignment: Record<string, string> = {}
  for (const [floatingNodeId, fixedNodeId] of Object.entries(
    floatingToFixedNodeAssignment,
  )) {
    fixedToFloatingNodeAssignment[fixedNodeId] = floatingNodeId
  }

  const operations: EditOperation[] = []

  let currentFixedAdjMatrix = structuredClone(fixedAdjMatrix)
  let newFloatingToFixedNodeAssignment = structuredClone(
    floatingToFixedNodeAssignment,
  )
  let currentFixedMatrixMapping = structuredClone(fixedMatrixMapping)

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
    const unmappedFixedBoxIds = [...currentFixedMatrixMapping.keys()].filter(
      (boxId) => !(boxId in fixedToFloatingNodeAssignment),
    )

    // Nothing to do
    if (unmappedFixedBoxIds.length === 0) {
      /* no-op */
    } else {
      // Build list of { boxId, index } and sort descending so index shifting is safe
      const deletions = unmappedFixedBoxIds
        .map((boxId) => ({
          boxId,
          index: currentFixedMatrixMapping.get(boxId)!,
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
        currentFixedAdjMatrix.splice(index, 1)
        // Remove the column from each remaining row
        for (const row of currentFixedAdjMatrix) {
          row.splice(index, 1)
        }

        // Update source→matrix mapping
        currentFixedMatrixMapping.delete(boxId)
        for (const [otherBoxId, otherIdx] of currentFixedMatrixMapping) {
          if (otherIdx > index) {
            currentFixedMatrixMapping.set(otherBoxId, otherIdx - 1)
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
   *   { type: "create_node", newRowAndColumnIndex: 2, sourceBoxId: "newly-inserted-node-1" },
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
   *   "newly-inserted-node-1": 2,
   * }
   *
   * newBoxAssignment:
   * {
   *   "sourceBox1": "targetBox1",
   *   "sourceBox2": "targetBox2",
   *   "newly-inserted-node-1": "targetBox3",
   * }
   */
  /* ---------- STEP 2 – CREATE NODES FOR UNMAPPED TARGET BOXES ---------- */
  {
    // We only need to create nodes when the target matrix is bigger
    const sizeDiff = floatingAdjMatrix.length - currentFixedAdjMatrix.length
    if (sizeDiff <= 0) {
      /* nothing to create */
    } else {
      // Identify target-side boxes that no source box is currently mapped to
      const mappedTargetBoxIds = new Set(
        Object.values(newFloatingToFixedNodeAssignment),
      )
      const unmappedTargetBoxIds = [...floatingMatrixMapping.keys()].filter(
        (tBoxId) => !mappedTargetBoxIds.has(tBoxId),
      )

      let newNodeCounter = 0
      // Only create as many nodes as needed to match the size difference
      for (const targetNodeId of unmappedTargetBoxIds.slice(0, sizeDiff)) {
        // HACK: TODO we don't currently pass as input which nodes are boxes
        // but the ids are always constructed "${boxId}-${pinId}"
        const isBox = targetNodeId.split("-").length === 1

        // Generate a unique synthetic source-box id
        let newFixedNodeId: string
        if (isBox) {
          newFixedNodeId = `newly_inserted_${isBox ? "box" : "pin"}_${++newNodeCounter}`
        } else {
          const fixedBoxId = targetNodeId.split("-")[0]!
          newFixedNodeId = `${fixedBoxId}-newly_inserted_pin_${++newNodeCounter}`
        }

        // We will append the new node at the end of the current matrix
        const insertIndex = currentFixedAdjMatrix.length

        // Extend every existing row with a 0 (new column)
        for (const row of currentFixedAdjMatrix) {
          row.push(0)
        }

        // Create a new row filled with 0s and add a self-loop (1 on the diagonal)
        const newRow = new Array(insertIndex + 1).fill(0)
        newRow[insertIndex] = 1
        currentFixedAdjMatrix.push(newRow)

        // Update mappings and assignments
        currentFixedMatrixMapping.set(newFixedNodeId, insertIndex)
        newFloatingToFixedNodeAssignment[newFixedNodeId] = targetNodeId

        // Record the create_node operation
        operations.push({
          type: "create_node",
          newRowAndColumnIndex: insertIndex,
          nodeId: newFixedNodeId,
          floatingNodeId: targetNodeId,
          isBox,
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
    const floatingToFixedNodeAssignment = new Map<string, string>()
    for (const [fixedNodeId, floatingNodeId] of Object.entries(
      newFloatingToFixedNodeAssignment,
    )) {
      floatingToFixedNodeAssignment.set(floatingNodeId, fixedNodeId)
    }

    /* --------------------------------------------------------- */
    /*  Iterate over the desired ordering (target indices)       */
    /* --------------------------------------------------------- */
    for (const [
      floatingNodeId,
      desiredIdx,
    ] of floatingMatrixMapping.entries()) {
      const fixedNodeId = floatingToFixedNodeAssignment.get(floatingNodeId)
      if (!fixedNodeId) continue // no source box mapped → will be handled later
      const currentIdx = currentFixedMatrixMapping.get(fixedNodeId)
      if (currentIdx === undefined || currentIdx === desiredIdx) continue

      /* Who is sitting at the spot we want to occupy? */
      const fixedNodeIdAtDesiredIdx = [
        ...currentFixedMatrixMapping.entries(),
      ].find(([, idx]) => idx === desiredIdx)?.[0]

      if (fixedNodeIdAtDesiredIdx === undefined) continue // should not happen

      /* -------- perform swap in matrix & bookkeeping -------- */
      swapRowsAndColumns(currentFixedAdjMatrix, currentIdx, desiredIdx)

      currentFixedMatrixMapping.set(fixedNodeId, desiredIdx)
      currentFixedMatrixMapping.set(fixedNodeIdAtDesiredIdx, currentIdx)

      // Always record the lower index first to keep a stable ordering
      const index1 = Math.min(currentIdx, desiredIdx)
      const index2 = Math.max(currentIdx, desiredIdx)
      const sourceBoxId1 =
        index1 === currentIdx ? fixedNodeId : fixedNodeIdAtDesiredIdx
      const sourceBoxId2 =
        index1 === currentIdx ? fixedNodeIdAtDesiredIdx : fixedNodeId

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
    const indexToFixedNodeId = new Map<number, string>()
    for (const [srcBoxId, idx] of currentFixedMatrixMapping) {
      indexToFixedNodeId.set(idx, srcBoxId)
    }

    const n = currentFixedAdjMatrix.length // after Steps 1-3 this must equal targetAdjMatrix.length
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const sourceVal = currentFixedAdjMatrix[i]![j]
        const targetVal = floatingAdjMatrix[i]![j]

        // Edge exists in source but not in target → must be disconnected
        if (sourceVal === 1 && targetVal === 0) {
          const sourceBoxId1 = indexToFixedNodeId.get(i)!
          const sourceBoxId2 = indexToFixedNodeId.get(j)!

          operations.push({
            type: "disconnect_nodes",
            rowAndColumnIndex1: i,
            rowAndColumnIndex2: j,
            nodeId1: sourceBoxId1,
            nodeId2: sourceBoxId2,
          })

          // Mutate the working matrix so later steps see the change
          currentFixedAdjMatrix[i]![j] = 0
          currentFixedAdjMatrix[j]![i] = 0
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
    for (const [srcBoxId, idx] of currentFixedMatrixMapping) {
      indexToSourceBoxId.set(idx, srcBoxId)
    }

    const n = currentFixedAdjMatrix.length
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const sourceVal = currentFixedAdjMatrix[i]![j]
        const targetVal = floatingAdjMatrix[i]![j]

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
          currentFixedAdjMatrix[i]![j] = 1
          currentFixedAdjMatrix[j]![i] = 1
        }
      }
    }
  }

  // Step 6: Generate the network assignment
  // const reverseSourceMatrixMapping = new Map<number, string>()
  // for (const [srcBoxId, idx] of currentSourceMatrixMapping) {
  //   reverseSourceMatrixMapping.set(idx, srcBoxId)
  // }
  // const reverseTargetMatrixMapping = new Map<number, string>()
  // for (const [tgtBoxId, idx] of targetMatrixMapping) {
  //   reverseTargetMatrixMapping.set(idx, tgtBoxId)
  // }

  // const newNetAssignment: Assignment<string, string> = {}
  // for (let i = 0; i < currentSourceAdjMatrix.length; i++) {
  //   for (let j = i + 1; j < currentSourceAdjMatrix.length; j++) {
  //     if (sourceAdjMatrix[i]![j] === 1 && i !== j) {
  //       const sourceNodeId = reverseSourceMatrixMapping.get(i)!
  //       const targetNodeId = reverseTargetMatrixMapping.get(j)!
  //       const sourceIsPin = sourceNodeId.split("-").length === 2
  //       if (sourceIsPin) {
  //         const [sourceBoxId, sourcePinId] = sourceNodeId.split("-")
  //       }
  //     }
  //   }
  // }

  return {
    newSourceAdjMatrix: currentFixedAdjMatrix,
    newSourceMatrixMapping: currentFixedMatrixMapping,
    newFloatingToFixedNodeAssignment,
    operations,
  }
}
