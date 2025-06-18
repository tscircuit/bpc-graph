import type { BpcGraph, FloatingBpcGraph, BpcPin } from "lib/types"
import type { AddPinToBoxOp } from "../operation-types"

export const applyAddPinToBox = (g: FloatingBpcGraph, op: AddPinToBoxOp) => {
  const box = g.boxes.find((b) => b.boxId === op.boxId)
  if (!box) {
    throw new Error(`Box with id ${op.boxId} not found`)
  }

  const newPin: BpcPin = {
    boxId: op.boxId,
    pinId: `pin_${g.pins.length}`,
    networkId: op.newPinNetworkId,
    color: op.newPinColor,
    offset: op.pinPosition,
  }

  g.pins.push(newPin)

  return newPin
}
