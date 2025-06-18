import type {FloatingBpcGraph} from "lib/types";
import type {Operation} from "../operation-types";
import {applyAddPinToBox} from "./applyAddPinToBox";
import {applyChangePinNetwork} from "./applyChangePinNetwork";
import {applyMovePin} from "./applyMovePin";
import {applyAddBox} from "./applyAddBox";
import {applyChangePinColor} from "./applyChangePinColor";
import {applyRemoveBox} from "./applyRemoveBox";

export const applyOperation = (g: FloatingBpcGraph, op: Operation) => {
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
    case "remove_box":
      return applyRemoveBox(g, op)
  }
}
