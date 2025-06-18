import type { BpcGraph, FloatingBpcGraph } from "lib/types"
import type { CostConfiguration } from "../configureOperationCostFn"
import type { Operation } from "../operation-types"
import { getAddBoxCost } from "./getAddBoxCost"

export const getOperationCost = (params: {
  op: Operation
  costConfiguration: CostConfiguration
  g: BpcGraph
}) => {
  const { op, costConfiguration, g } = params
  switch (op.operation_type) {
    case "add_box": {
      return getAddBoxCost({ op, costConfiguration, g })
    }
    case "remove_box": {
      return getRemoveBoxCost({ op, costConfiguration, g })
    }
    case "add_pin_to_box": {
      return getAddPinToBoxCost({ op, costConfiguration, g })
    }
    case "remove_pin_from_box": {
      return getRemovePinFromBoxCost({ op, costConfiguration, g })
    }
    case "move_box": {
      return getMoveBoxCost({ op, costConfiguration, g })
    }
    case "change_pin_network": {
      return getChangePinNetworkCost({ op, costConfiguration, g })
    }
    case "move_pin": {
      return getMovePinCost({ op, costConfiguration, g })
    }
  }
}
