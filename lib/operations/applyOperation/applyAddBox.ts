import type { BpcFloatingBox, BpcGraph, FloatingBpcGraph } from "lib/types"
import type { AddBoxOp } from "../operation-types"

export const applyAddBox = (g: FloatingBpcGraph, op: AddBoxOp) => {
  const newBox: BpcFloatingBox = {
    boxId: `box_${g.boxes.length}`,
    kind: "floating",
    center: op.boxCenter,
  }

  g.boxes.push(newBox)

  return newBox
}
