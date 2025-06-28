import type { Assignment } from "lib/adjacency-matrix-network-similarity/getApproximateAssignments"
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
  // TODO
}
