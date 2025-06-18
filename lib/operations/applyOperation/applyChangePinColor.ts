import type { FloatingBpcGraph } from "lib/types"
import type { ChangePinColorOp } from "../operation-types"

export const applyChangePinColor = (
  g: FloatingBpcGraph,
  op: ChangePinColorOp,
) => {
  const pin = g.pins.find((p) => p.pinId === op.pinId)
  if (!pin) {
    throw new Error(`Pin with id ${op.pinId} not found`)
  }

  pin.color = op.newColor

  return pin
}
