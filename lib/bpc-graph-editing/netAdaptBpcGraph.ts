import { getAdjacencyMatrixFromFlatBpcGraph } from "lib/adjacency-matrix-network-similarity/getAdjacencyMatrixFromFlatBpcGraph"
import { getEditOperationsForMatrix } from "lib/adjacency-matrix-network-similarity/getEditOperationsForMatrix"
import { getApproximateAssignments2 } from "lib/assignment2/getApproximateAssignments2"
import { matchPins } from "lib/assignment2/matchPins"
import { convertToFlatBpcGraph } from "lib/flat-bpc/convertToFlatBpcGraph"
import type {
  BpcGraph,
  BpcPin,
  FixedBpcGraph,
  MixedBpcGraph,
  FloatingBoxId,
  FixedBoxId,
  FloatingPinId,
  FixedPinId,
} from "lib/types"

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
  fixedGraph: FixedBpcGraph,
  floatingGraph: MixedBpcGraph,
): {
  adaptedBpcGraph: MixedBpcGraph
} => {
  // const approxAssignmentsResult = getApproximateAssignments(
  //   sourceBpcGraph,
  //   targetBpcGraph,
  // )
  const approxAssignmentsResult = getApproximateAssignments2(
    floatingGraph,
    fixedGraph,
  )

  const fixedFlatBpcGraph = convertToFlatBpcGraph(fixedGraph)
  const fixedAdjMatrixResult =
    getAdjacencyMatrixFromFlatBpcGraph(fixedFlatBpcGraph)

  const floatingFlatBpcGraph = convertToFlatBpcGraph(floatingGraph)
  const floatingAdjMatrixResult =
    getAdjacencyMatrixFromFlatBpcGraph(floatingFlatBpcGraph)

  // Create a combined assignment that includes both boxes and pins
  const floatingToFixedNodeAssignment: Record<
    FloatingBoxId | `${FloatingBoxId}-${FloatingPinId}`,
    FixedBoxId | `${FixedBoxId}-${FixedPinId}`
  > = {
    ...approxAssignmentsResult.floatingToFixedBoxAssignment,
  }
  for (const [floatingBoxId, pinAssignment] of Object.entries(
    approxAssignmentsResult.floatingToFixedPinAssignment,
  )) {
    for (const [floatingPinId, fixedPinId] of Object.entries(pinAssignment)) {
      const fixedBoxId =
        approxAssignmentsResult.floatingToFixedBoxAssignment[floatingBoxId]
      floatingToFixedNodeAssignment[`${floatingBoxId}-${floatingPinId}`] =
        `${fixedBoxId}-${fixedPinId}`
    }
  }

  const editOpsResult = getEditOperationsForMatrix({
    floatingToFixedNodeAssignment,
    fixedAdjMatrix: fixedAdjMatrixResult.matrix,
    floatingAdjMatrix: floatingAdjMatrixResult.matrix,
    fixedMatrixMapping: fixedAdjMatrixResult.mapping,
    floatingMatrixMapping: floatingAdjMatrixResult.mapping,
  })

  const newFixedToFloatingNodeAssignment: Record<
    FixedBoxId | `${FixedBoxId}-${FixedPinId}`,
    FloatingBoxId | `${FloatingBoxId}-${FloatingPinId}`
  > = {}

  for (const [floatingNodeId, fixedNodeId] of Object.entries(
    editOpsResult.newFloatingToFixedNodeAssignment,
  )) {
    newFixedToFloatingNodeAssignment[fixedNodeId] = floatingNodeId
  }

  // Initially the adaptedBpcGraph has all fixed ids
  const adaptedBpcGraph: MixedBpcGraph = structuredClone(fixedGraph)

  /* ---------- rename pins first (use floating ids) ---------- */
  for (const pin of adaptedBpcGraph.pins) {
    const fixedPinNodeId = `${pin.boxId}-${pin.pinId}`
    const floatingPinNodeId = newFixedToFloatingNodeAssignment[fixedPinNodeId]
    if (!floatingPinNodeId) continue // unmapped → will be handled later

    const [tBoxId, tPinId] = floatingPinNodeId.split("-")
    const floatingPin = floatingGraph.pins.find(
      (p) => p.boxId === tBoxId && p.pinId === tPinId,
    )
    if (!floatingPin) continue // safety guard

    pin.boxId = floatingPin.boxId
    pin.pinId = floatingPin.pinId
    pin.networkId = floatingPin.networkId
    pin.color = floatingPin.color
    pin.offset = floatingPin.offset
  }

  for (const box of adaptedBpcGraph.boxes) {
    const floatingBoxId = newFixedToFloatingNodeAssignment[box.boxId]
    if (floatingBoxId) {
      box.boxId = floatingBoxId
    } else {
      // box is unmapped → will be handled later
    }
  }

  for (const op of editOpsResult.operations) {
    switch (op.type) {
      case "create_node": {
        if (op.isBox) {
          const targetBox = floatingGraph.boxes.find(
            (b) => b.boxId === op.floatingNodeId,
          )
          if (!targetBox) {
            throw new Error(`Target box ${op.floatingNodeId} not found`)
          }
          adaptedBpcGraph.boxes.push({
            boxId: op.floatingNodeId,
            kind: "floating",
          })
        } else {
          const splitResult = op.floatingNodeId.split("-")
          if (splitResult.length !== 2) {
            throw new Error(`Invalid pin node ID format: ${op.floatingNodeId}`)
          }
          const targetBoxId = splitResult[0]!
          const targetPinId = splitResult[1]!
          const targetPin = floatingGraph.pins.find(
            (p) => p.boxId === targetBoxId && p.pinId === targetPinId,
          )
          if (!targetPin) {
            throw new Error(`Target pin ${op.floatingNodeId} not found`)
          }

          // Check if the box exists in the adapted graph, if not create it
          const boxExists = adaptedBpcGraph.boxes.some(
            (box) => box.boxId === targetBoxId,
          )
          if (!boxExists) {
            const targetBox = floatingGraph.boxes.find(
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
