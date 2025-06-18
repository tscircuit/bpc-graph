import type { BpcGraph } from "lib/types"
import type { CostConfiguration } from "../configureOperationCostFn"
import type { RemoveBoxOp } from "../operation-types"

export const getRemoveBoxCost = (params: {
  op: RemoveBoxOp
  costConfiguration: CostConfiguration
  g: BpcGraph
}): number => {
  const { op, costConfiguration } = params

  // Base cost for removing a box
  let cost = costConfiguration.baseOperationCost || 1

  // Add cost for each pin that needs to be handled
  cost += op.pinsInBox.length * (costConfiguration.pinHandlingCost || 0.5)

  return cost
}
