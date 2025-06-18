import type {Vec2} from "lib/types"

export type AddPinToBoxOp = {
  operation_type: "add_pin_to_box",
  boxId: string
  pinPosition: Vec2
  newPinColor: string
  newPinNetworkId: string
}

export type ChangePinNetworkOp = {
  operation_type: "change_pin_network",
  pinId: string
  oldNetworkId: string
  newNetworkId: string
}

export type MovePinOp =  {
  operation_type: "move_pin",
  pinId: string
  oldPosition: Vec2
  newOffset: Vec2
}


export type ChangePinColorOp =  {
  operation_type: "change_pin_color",
  pinId: string
  oldColor: string
  newColor: string
}

export type AddBoxOp = {
  operation_type: "add_box",
  boxCenter: Vec2
}

export type Operation = AddPinToBoxOp | ChangePinNetworkOp | MovePinOp | AddBoxOp | ChangePinColorOp

export type OperationCostFn = (op: Operation) => number

