import type {
  BpcGraph,
  FixedBoxId,
  FixedNetworkId,
  FixedPinId,
  FloatingBoxId,
  FloatingNetworkId,
  FloatingPinId,
} from "lib/types"
import { AssignmentSolver2 } from "./AssignmentSolver2"

/**
 * Implements the same interface as getApproximateAssignments, but uses AssignmentSolver2.
 * Returns boxAssignment and networkAssignment, but does not return nodeAssignment.
 */
export const getApproximateAssignments2 = (
  floatingGraph: BpcGraph,
  fixedGraph: BpcGraph,
): {
  floatingToFixedBoxAssignment: Record<FloatingBoxId, FixedBoxId>
  floatingToFixedNetworkAssignment: Record<FloatingNetworkId, FixedNetworkId>
  floatingToFixedPinAssignment: Record<
    FloatingBoxId,
    Record<FloatingPinId, FixedPinId>
  >
} => {
  // AssignmentSolver2 expects floatingGraph, fixedGraph
  const solver = new AssignmentSolver2(floatingGraph, fixedGraph)

  // Run the solver until solved or max iterations
  while (!solver.solved && solver.iterations < 1000) {
    solver.step()
  }

  // Build boxAssignment from solver.assignment
  const boxAssignment: Record<string, string> = {}
  for (const [floatingBoxId, fixedBoxId] of solver.assignment.entries()) {
    boxAssignment[floatingBoxId] = fixedBoxId
  }

  // Build networkAssignment from solver.floatingToFixedNetworkMap
  const networkAssignment: Record<string, string> = {}
  for (const [
    floatingNetId,
    fixedNetId,
  ] of solver.floatingToFixedNetworkMap.entries()) {
    networkAssignment[floatingNetId] = fixedNetId
  }

  const pinAssignment = solver.getPinAssignment()

  return {
    floatingToFixedBoxAssignment: boxAssignment,
    floatingToFixedNetworkAssignment: networkAssignment,
    floatingToFixedPinAssignment: pinAssignment,
  }
}
