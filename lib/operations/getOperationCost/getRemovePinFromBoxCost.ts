import type { BpcGraph } from "lib/types"
import type { CostConfiguration } from "../configureOperationCostFn"
import type { RemovePinFromBoxOp } from "../operation-types"

export const getRemovePinFromBoxCost = (params: {
  op: RemovePinFromBoxOp
  costConfiguration: CostConfiguration
  g: BpcGraph
}): number => {
  const { costConfiguration } = params

  // Base cost for removing a pin
  let cost = costConfiguration.baseOperationCost

  // Potentially add a specific pinHandlingCost if defined, otherwise baseOperationCost is fine.
  // For example, if pinHandlingCost is meant to be an additional small cost:
  // if (costConfiguration.pinHandlingCost) {
  //   cost += costConfiguration.pinHandlingCost;
  // }

  return cost
}
