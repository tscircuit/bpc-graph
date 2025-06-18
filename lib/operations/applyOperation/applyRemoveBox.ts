import type { FloatingBpcGraph } from "lib/types"
import type { RemoveBoxOp } from "../operation-types"

export const applyRemoveBox = (g: FloatingBpcGraph, op: RemoveBoxOp) => {
  const boxIndex = g.boxes.findIndex((b) => b.boxId === op.boxId)
  if (boxIndex === -1) {
    // It's possible the box was already removed by a previous equivalent operation in a different path
    // or the operation is invalid. For robustness in a search algorithm,
    // we might choose to not throw, or let the cost function handle it.
    // However, applyOperation should generally assume valid ops for a given state.
    console.warn(
      `Box with id ${op.boxId} not found for removal. State might be inconsistent.`,
    )
    // Depending on strictness, could throw:
    // throw new Error(`Box with id ${op.boxId} not found for removal.`);
    return op // Or indicate failure/no-op
  }
  g.boxes.splice(boxIndex, 1)

  // Remove associated pins
  // This ensures that pins belonging to the removed box are also removed from the graph's pin list.
  g.pins = g.pins.filter((p) => p.boxId !== op.boxId)

  return op // Consistent with other applyOps returning the op or main affected item
}
