import type { BpcGraph, BpcPin, Vec2 } from "lib/types"

export type AddPinToBoxOp = {
  operation_type: "add_pin_to_box"
  boxId: string
  pinPosition: Vec2
  newPinColor: string
  newPinNetworkId: string
}

export type ChangePinNetworkOp = {
  operation_type: "change_pin_network"
  pinId: string
  color: string
  oldNetworkId: string
  newNetworkId: string
}

export type MovePinOp = {
  operation_type: "move_pin"
  pinId: string
  color: string
  oldOffset: Vec2
  newOffset: Vec2
}

export type ChangePinColorOp = {
  operation_type: "change_pin_color"
  pinId: string
  oldColor: string
  newColor: string
}

export type AddBoxOp = {
  operation_type: "add_box"
  boxCenter: Vec2
}

export type RemoveBoxOp = {
  operation_type: "remove_box"
  boxId: string
  pinsInBox: BpcPin[]
}

export type RemovePinFromBoxOp = {
  operation_type: "remove_pin_from_box"
  pinId: string
  boxId: string // For context, though pinId should be enough
}

export type Operation =
  | AddPinToBoxOp
  | ChangePinNetworkOp
  | MovePinOp
  | AddBoxOp
  | ChangePinColorOp
  | RemoveBoxOp
  | RemovePinFromBoxOp

export type OperationCostFn = (g: BpcGraph, op: Operation[]) => number
