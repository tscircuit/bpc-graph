import type {
  ChangePinNetworkOp,
  Operation,
} from "lib/operations/operation-types"
import type { BpcGraph } from "lib/types"
import type { GraphNetworkTransformer } from "../GraphNetworkTransformer"

export const getPossibleChangePinNetworkOperations = (
  nt: GraphNetworkTransformer,
  currentGraph: BpcGraph,
): ChangePinNetworkOp[] => {
  const operations: ChangePinNetworkOp[] = []

  for (const pinG of currentGraph.pins) {
    // 5. Change Pin Network Operations
    for (const targetPin of nt.targetGraphAllPins) {
      if (
        pinG.offset.x === targetPin.offset.x &&
        pinG.offset.y === targetPin.offset.y &&
        pinG.color === targetPin.color &&
        pinG.networkId !== targetPin.networkId
      ) {
        const op: ChangePinNetworkOp = {
          operation_type: "change_pin_network",
          pinId: pinG.pinId,
          color: pinG.color,
          oldNetworkId: pinG.networkId,
          newNetworkId: targetPin.networkId,
        }
        operations.push(op)
      }
    }
  }
  return operations
}
