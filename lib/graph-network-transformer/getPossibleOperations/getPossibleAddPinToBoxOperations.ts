import type { AddPinToBoxOp, Operation } from "lib/operations/operation-types"
import type { BpcGraph } from "lib/types"
import type { GraphNetworkTransformer } from "../GraphNetworkTransformer"

export const getPossibleAddPinToBoxOperations = (
  nt: GraphNetworkTransformer,
  currentGraph: BpcGraph,
): AddPinToBoxOp[] => {
  const operations: AddPinToBoxOp[] = []

  // Pin-related operations
  for (const boxG of currentGraph.boxes) {
    const pinsInBoxG = currentGraph.pins.filter((p) => p.boxId === boxG.boxId)

    // 3. Add Pin To Box Operations
    // Consider adding pins (offset, color, networkId) that exist in targetGraph but not in boxG with that exact config
    for (const targetPin of nt.targetGraphAllPins) {
      const existsInBoxG = pinsInBoxG.some(
        (pG) =>
          pG.offset.x === targetPin.offset.x &&
          pG.offset.y === targetPin.offset.y &&
          pG.color === targetPin.color &&
          pG.networkId === targetPin.networkId,
      )

      if (!existsInBoxG) {
        const op: AddPinToBoxOp = {
          operation_type: "add_pin_to_box",
          boxId: boxG.boxId,
          pinPosition: { ...targetPin.offset },
          newPinColor: targetPin.color,
          newPinNetworkId: targetPin.networkId,
        }
        operations.push(op)
      }
    }
  }
  return operations
}
