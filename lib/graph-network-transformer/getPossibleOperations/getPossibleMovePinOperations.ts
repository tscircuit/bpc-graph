import type { MovePinOp, Operation } from "lib/operations/operation-types"
import type { BpcGraph } from "lib/types"
import type { GraphNetworkTransformer } from "../GraphNetworkTransformer"

export const getPossibleMovePinOperations = (
  nt: GraphNetworkTransformer,
  currentGraph: BpcGraph,
): MovePinOp[] => {
  const operations: MovePinOp[] = []

  for (const pinG of currentGraph.pins) {
    // 6. Move Pin Operations
    for (const targetPin of nt.targetGraphAllPins) {
      if (
        pinG.color === targetPin.color &&
        pinG.networkId === targetPin.networkId &&
        (pinG.offset.x !== targetPin.offset.x ||
          pinG.offset.y !== targetPin.offset.y)
      ) {
        const op: MovePinOp = {
          operation_type: "move_pin",
          pinId: pinG.pinId,
          color: pinG.color,
          oldOffset: { ...pinG.offset },
          newOffset: { ...targetPin.offset },
        }
        operations.push(op)
      }
    }
  }
  return operations
}
