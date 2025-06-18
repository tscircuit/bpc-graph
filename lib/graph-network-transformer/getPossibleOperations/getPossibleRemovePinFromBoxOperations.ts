import type {
  RemovePinFromBoxOp,
  Operation,
} from "lib/operations/operation-types"
import type { BpcGraph } from "lib/types"
import type { GraphNetworkTransformer } from "../GraphNetworkTransformer"

export const getPossibleRemovePinFromBoxOperations = (
  nt: GraphNetworkTransformer,
  currentGraph: BpcGraph,
): RemovePinFromBoxOp[] => {
  const operations: RemovePinFromBoxOp[] = []

  for (const pinG of currentGraph.pins) {
    // A pin is "superfluous" if its exact configuration (offset, color, networkId)
    // does not exist in *any* pin of the targetGraph.
    const pinGConfigKey = `${pinG.offset.x}_${pinG.offset.y}_${pinG.color}_${pinG.networkId}`
    if (!nt.targetGraphPinConfigurations.has(pinGConfigKey)) {
      const op: RemovePinFromBoxOp = {
        operation_type: "remove_pin_from_box",
        pinId: pinG.pinId,
        boxId: pinG.boxId,
      }
      operations.push(op)
    }
  }
  return operations
}
