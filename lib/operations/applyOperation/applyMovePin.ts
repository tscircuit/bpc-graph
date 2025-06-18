import type {FloatingBpcGraph} from "lib/types";
import type {MovePinOp} from "../operation-types";

export const applyMovePin = (g: FloatingBpcGraph, op: MovePinOp) => {
  const pin = g.pins.find(p => p.pinId === op.pinId)
  if (!pin) {
    throw new Error(`Pin with id ${op.pinId} not found`)
  }

  pin.offset = op.newOffset

  return pin
}