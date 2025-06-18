import type { FloatingBpcGraph } from "lib/types"
import type { RemovePinFromBoxOp } from "../operation-types"

export const applyRemovePinFromBox = (
  g: FloatingBpcGraph,
  op: RemovePinFromBoxOp,
) => {
  const pinIndex = g.pins.findIndex((p) => p.pinId === op.pinId)
  if (pinIndex === -1) {
    console.warn(
      `Pin with id ${op.pinId} not found for removal. State might be inconsistent.`,
    )
    // Depending on strictness, could throw:
    // throw new Error(`Pin with id ${op.pinId} not found for removal.`);
    return op // Or indicate failure/no-op
  }

  // Ensure the pin belongs to the specified box for an extra check, though pinId should be unique.
  if (g.pins[pinIndex]!.boxId !== op.boxId) {
    console.warn(
      `Pin ${op.pinId} does not belong to box ${op.boxId}. Operation might be misconfigured.`,
    )
    // throw new Error(`Pin ${op.pinId} does not belong to box ${op.boxId}.`);
    return op
  }

  g.pins.splice(pinIndex, 1)

  return op // Consistent with other applyOps returning the op or main affected item
}
