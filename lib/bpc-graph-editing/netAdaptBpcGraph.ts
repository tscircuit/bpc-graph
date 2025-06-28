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
  netAssignment: Assignment<string, string>
  boxAssignment: Assignment<string, string>
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

  let adaptedBpcGraph: MixedBpcGraph = structuredClone(sourceBpcGraph)
  for (const op of editOpsResult.operations) {
    switch (op.type) {
      case "create_node": {
        adaptedBpcGraph.boxes.push({
          boxId: op.nodeId,
          kind: "floating",
        })
        break
      }
      case "delete_node": {
        adaptedBpcGraph.boxes = adaptedBpcGraph.boxes.filter(
          (box) => box.boxId !== op.nodeId,
        )
        adaptedBpcGraph.pins = adaptedBpcGraph.pins.filter(
          (pin) => pin.boxId !== op.nodeId,
        )
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
