import type { RemoveBoxOp, Operation } from "lib/operations/operation-types"
import type { BpcGraph } from "lib/types"
import type { GraphNetworkTransformer } from "../GraphNetworkTransformer"

export const getPossibleRemoveBoxOperations = (
  nt: GraphNetworkTransformer,
  currentGraph: BpcGraph,
): RemoveBoxOp[] => {
  const operations: RemoveBoxOp[] = []
  const targetGraph = nt.targetGraph

  // 2. Remove Box Operation
  if (currentGraph.boxes.length > targetGraph.boxes.length) {
    for (const box of currentGraph.boxes) {
      const pinsInBox = currentGraph.pins.filter((p) => p.boxId === box.boxId)
      const op: RemoveBoxOp = {
        operation_type: "remove_box",
        boxId: box.boxId,
        pinsInBox,
      }
      operations.push(op)
    }
  }
  return operations
}
