import { getAdjacencyMatrixFromFlatBpcGraph } from "lib/adjacency-matrix-network-similarity/getAdjacencyMatrixFromFlatBpcGraph"
import {
  getApproximateAssignments,
  type Assignment,
} from "lib/adjacency-matrix-network-similarity/getApproximateAssignments"
import { getEditOperationsForMatrix } from "lib/adjacency-matrix-network-similarity/getEditOperationsForMatrix"
import { convertToFlatBpcGraph } from "lib/flat-bpc/convertToFlatBpcGraph"
import type { BpcGraph, FixedBpcGraph, MixedBpcGraph } from "lib/types"

/**
 * This method adapts a source BPC graph to a target BPC graph such that the
 * nets match. At the end, there are the same boxes, the boxes are networked
 * in the same way, and there is a one-to-one mapping of boxes to boxes and
 * nets to nets. The pin offsets are are also changed to resemble the target
 * net where possible, however, the target bpc graph has some is completely
 * made up of "floating boxes" that do not have a position.
 *
 * The following process is used:
 * - Get approximate assignments of boxes to boxes and nets to nets
 * - Get edit operations for the source and target adjacency matrices
 * - Apply the edit operations to the source BPC graph
 * - Return the adapted BPC graph, the net assignment, and the box assignment
 */
export const netAdaptBpcGraph = (
  sourceBpcGraph: FixedBpcGraph,
  targetBpcGraph: MixedBpcGraph,
): {
  adaptedBpcGraph: MixedBpcGraph
} => {
  const approxAssignmentsResult = getApproximateAssignments(
    sourceBpcGraph,
    targetBpcGraph,
  )

  const sourceFlatBpcGraph = convertToFlatBpcGraph(sourceBpcGraph)
  const sourceAdjMatrixResult =
    getAdjacencyMatrixFromFlatBpcGraph(sourceFlatBpcGraph)

  const targetFlatBpcGraph = convertToFlatBpcGraph(targetBpcGraph)
  const targetAdjMatrixResult =
    getAdjacencyMatrixFromFlatBpcGraph(targetFlatBpcGraph)

  const editOpsResult = getEditOperationsForMatrix({
    nodeAssignment: approxAssignmentsResult.boxAssignment,
    sourceAdjMatrix: sourceAdjMatrixResult.matrix,
    targetAdjMatrix: targetAdjMatrixResult.matrix,
    sourceMatrixMapping: sourceAdjMatrixResult.mapping,
    targetMatrixMapping: targetAdjMatrixResult.mapping,
  })

  const adaptedBpcGraph: MixedBpcGraph = structuredClone(sourceBpcGraph)

  /* ---------- rename pins first (still using original source ids) ---------- */
  for (const pin of adaptedBpcGraph.pins) {
    const sourcePinNodeId = `${pin.boxId}-${pin.pinId}`
    const targetPinNodeId = editOpsResult.newNodeAssignment[sourcePinNodeId]
    if (!targetPinNodeId) continue // unmapped → will be handled later

    const [tBoxId, tPinId] = targetPinNodeId.split("-")
    const tgtPin = targetBpcGraph.pins.find(
      (p) => p.boxId === tBoxId && p.pinId === tPinId,
    )
    if (!tgtPin) continue // safety guard

    pin.boxId = tgtPin.boxId
    pin.pinId = tgtPin.pinId
    pin.networkId = tgtPin.networkId
    pin.color = tgtPin.color
    pin.offset = tgtPin.offset
  }

  /* ---------- now rename boxes (only when a mapping exists) ---------- */
  for (const box of adaptedBpcGraph.boxes) {
    const mappedId = editOpsResult.newNodeAssignment[box.boxId]
    if (mappedId !== undefined) {
      box.boxId = mappedId
    }
  }

  /* ---------- copy target box centers & attributes when available ----- */
  for (const box of adaptedBpcGraph.boxes) {
    const tgtBox = targetBpcGraph.boxes.find((b) => b.boxId === box.boxId)

    // 1. Transfer absolute position if the corpus pattern provides one
    if (tgtBox?.center) {
      // Only assign when the box does NOT yet have a position – this avoids
      // unexpectedly relocating components that were already placed in the
      // source design.
      if ((box as any).center === undefined) {
        // Ensure the adapted box is considered "fixed" if the target had a concrete position
        // (use a type-cast to appease the compiler – we know what we are doing)
        ;(box as any).kind = "fixed"
        ;(box as any).center = structuredClone(tgtBox.center)
      }
    }

    // 2. Merge boxAttributes (non-destructively)
    if ((tgtBox as any)?.boxAttributes) {
      ;(box as any).boxAttributes = {
        ...(tgtBox as any).boxAttributes,
        ...(box as any).boxAttributes,
      }
    }
  }

  for (const op of editOpsResult.operations) {
    switch (op.type) {
      case "create_node": {
        if (op.isBox) {
          const targetBox = targetBpcGraph.boxes.find(
            (b) => b.boxId === op.targetNodeId,
          )
          if (!targetBox) {
            throw new Error(`Target box ${op.targetNodeId} not found`)
          }
          adaptedBpcGraph.boxes.push({
            boxId: op.targetNodeId,
            kind: "floating",
          })
        } else {
          const splitResult = op.targetNodeId.split("-")
          if (splitResult.length !== 2) {
            throw new Error(`Invalid pin node ID format: ${op.targetNodeId}`)
          }
          const targetBoxId = splitResult[0]!
          const targetPinId = splitResult[1]!
          const targetPin = targetBpcGraph.pins.find(
            (p) => p.boxId === targetBoxId && p.pinId === targetPinId,
          )
          if (!targetPin) {
            throw new Error(`Target pin ${op.targetNodeId} not found`)
          }

          // Check if the box exists in the adapted graph, if not create it
          const boxExists = adaptedBpcGraph.boxes.some(
            (box) => box.boxId === targetBoxId,
          )
          if (!boxExists) {
            const targetBox = targetBpcGraph.boxes.find(
              (b) => b.boxId === targetBoxId,
            )
            if (!targetBox) {
              throw new Error(`Target box ${targetBoxId} not found`)
            }
            adaptedBpcGraph.boxes.push({
              boxId: targetBoxId,
              kind: "floating",
            })
          }

          adaptedBpcGraph.pins.push({
            boxId: targetPin.boxId,
            pinId: targetPin.pinId,
            networkId: targetPin.networkId,
            color: targetPin.color,
            offset: targetPin.offset,
          })
        }
        break
      }
      case "delete_node": {
        if (op.nodeId.split("-").length === 1) {
          adaptedBpcGraph.boxes = adaptedBpcGraph.boxes.filter(
            (box) => box.boxId !== op.nodeId,
          )
          // also drop every pin that belonged to the deleted box
          adaptedBpcGraph.pins = adaptedBpcGraph.pins.filter(
            (p) => p.boxId !== op.nodeId,
          )
        } else {
          const [boxId, pinId] = op.nodeId.split("-")
          adaptedBpcGraph.pins = adaptedBpcGraph.pins.filter(
            (pin) => !(pin.boxId === boxId && pin.pinId === pinId),
          )
        }
        break
      }
      case "connect_nodes": {
        break
      }
      case "disconnect_nodes": {
        break
      }
      case "swap_indices": {
        // noop for graph mutation
        break
      }
    }
  }

  return {
    adaptedBpcGraph: adaptedBpcGraph,
  }
}
