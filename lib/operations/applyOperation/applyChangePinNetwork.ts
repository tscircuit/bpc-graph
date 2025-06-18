import type {FloatingBpcGraph} from "lib/types";
import type {ChangePinNetworkOp} from "../operation-types";

export const applyChangePinNetwork = (g: FloatingBpcGraph, op: ChangePinNetworkOp) => {
  const pin = g.pins.find(p => p.pinId === op.pinId)
  if (!pin) {
    throw new Error(`Pin with id ${op.pinId} not found`)
  }

  pin.networkId = op.newNetworkId

  return pin
}