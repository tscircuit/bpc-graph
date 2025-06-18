import type {BpcGraph} from "lib/types";
import type {Operation} from "../operation-types";

export const applyOperation = (g: BpcGraph, op: Operation) => {
  switch (op.operation_type) {
    case "add_pin_to_box":
      return applyAddPinToBox(g, op)
    case "change_pin_network":
      return applyChangePinNetwork(g, op)
    case "move_pin":
      return applyMovePin(g, op)
    case "add_box":
      return applyAddBox(g, op)
    case "change_pin_color":
      return applyChangePinColor(g, op)
  }
}