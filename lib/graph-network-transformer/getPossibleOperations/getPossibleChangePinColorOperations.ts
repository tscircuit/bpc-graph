import type {
  ChangePinColorOp,
  Operation,
} from "lib/operations/operation-types"
import type { BpcGraph } from "lib/types"
import type { GraphNetworkTransformer } from "../GraphNetworkTransformer"

export const getPossibleChangePinColorOperations = (
  nt: GraphNetworkTransformer,
  currentGraph: BpcGraph,
): ChangePinColorOp[] => {
  const operations: ChangePinColorOp[] = []

  for (const pinG of currentGraph.pins) {
    // 4. Change Pin Color Operations
    for (const targetPin of nt.targetGraphAllPins) {
      if (
        pinG.offset.x === targetPin.offset.x &&
        pinG.offset.y === targetPin.offset.y &&
        pinG.networkId === targetPin.networkId &&
        pinG.color !== targetPin.color
      ) {
        const op: ChangePinColorOp = {
          operation_type: "change_pin_color",
          pinId: pinG.pinId,
          oldColor: pinG.color,
          newColor: targetPin.color,
        }
        operations.push(op)
      }
    }
  }
  return operations
}
