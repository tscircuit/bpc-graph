import type { Operation, AddBoxOp, RemoveBoxOp, AddPinToBoxOp, ChangePinColorOp, ChangePinNetworkOp, MovePinOp } from "lib/operations/operation-types"
import type { BpcGraph, BpcPin, Vec2 } from "lib/types"
import type { GraphNetworkTransformer } from "./GraphNetworkTransformer"

export const getPossibleOperationsForGraph = (
  nt: GraphNetworkTransformer,
  g: BpcGraph,
): Operation[] => {
  const operations: Operation[] = []
  const currentGraph = g
  const targetGraph = nt.targetGraph // Used for box counts and pin properties

  // 1. Add Box Operation
  if (currentGraph.boxes.length < targetGraph.boxes.length) {
    const op: AddBoxOp = { operation_type: "add_box", boxCenter: { x: 0, y: 0 } } // Default center
    operations.push(op)
  }

  // 2. Remove Box Operation
  if (currentGraph.boxes.length > targetGraph.boxes.length) {
    for (const box of currentGraph.boxes) {
      const pinsInBox = currentGraph.pins.filter(p => p.boxId === box.boxId)
      const op: RemoveBoxOp = { operation_type: "remove_box", boxId: box.boxId, pinsInBox }
      operations.push(op)
    }
  }

  // Pin-related operations
  for (const boxG of currentGraph.boxes) {
    const pinsInBoxG = currentGraph.pins.filter(p => p.boxId === boxG.boxId)

    // 3. Add Pin To Box Operations
    // Consider adding pins (offset, color, networkId) that exist in targetGraph but not in boxG with that exact config
    for (const targetPin of nt.targetGraphAllPins) {
      const existsInBoxG = pinsInBoxG.some(pG =>
        pG.offset.x === targetPin.offset.x &&
        pG.offset.y === targetPin.offset.y &&
        pG.color === targetPin.color &&
        pG.networkId === targetPin.networkId
      );

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

    // 6. Move Pin Operations
    for (const targetPin of nt.targetGraphAllPins) {
      if (
        pinG.color === targetPin.color &&
        pinG.networkId === targetPin.networkId &&
        (pinG.offset.x !== targetPin.offset.x || pinG.offset.y !== targetPin.offset.y)
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

    // 7. Remove Pin (Conceptual, if RemovePinFromBoxOp existed and pinG is "superfluous")
    // A pin is "superfluous" if its exact configuration (offset, color, networkId)
    // does not exist in *any* pin of the targetGraph.
    const pinGConfigKey = `${pinG.offset.x}_${pinG.offset.y}_${pinG.color}_${pinG.networkId}`;
    if (!nt.targetGraphPinConfigurations.has(pinGConfigKey)) {
      // If RemovePinFromBoxOp were defined and used:
      // const op: RemovePinFromBoxOp = { operation_type: "remove_pin_from_box", pinId: pinG.pinId, boxId: pinG.boxId };
      // operations.push(op);
      // Without it, such pins increase cost; A* might remove their box or transform them.
    }
  }

  // Deduplicate operations as some strategies might generate identical ops
  const uniqueOps = new Map<string, Operation>();
  for (const op of operations) {
    // Ensure consistent key generation, e.g. by sorting keys in objects if order matters for stringify
    // For current Operation types, direct stringify should be mostly fine.
    uniqueOps.set(JSON.stringify(op), op);
  }

  return Array.from(uniqueOps.values());
}
