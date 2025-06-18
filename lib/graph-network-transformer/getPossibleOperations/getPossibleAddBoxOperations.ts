import type { AddBoxOp, Operation } from "lib/operations/operation-types"
import type { BpcGraph } from "lib/types"
import type { GraphNetworkTransformer } from "../GraphNetworkTransformer"

export const getPossibleAddBoxOperations = (
  nt: GraphNetworkTransformer,
  currentGraph: BpcGraph,
): AddBoxOp[] => {
  const operations: AddBoxOp[] = []
  const targetGraph = nt.targetGraph

  // 1. Add Box Operation
  if (currentGraph.boxes.length < targetGraph.boxes.length) {
    const op: AddBoxOp = {
      operation_type: "add_box",
      boxCenter: { x: 0, y: 0 }, // Default center
    }
    operations.push(op)
  }
  return operations
}
