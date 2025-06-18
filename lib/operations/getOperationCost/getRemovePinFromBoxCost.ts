import type { BpcGraph } from "lib/types"
import type { CostConfiguration } from "../configureOperationCostFn"
import type { Operation } from "../operation-types"

// Note: RemovePinFromBoxOp type doesn't exist in operation-types.ts
// Using generic Operation type for now
export const getRemovePinFromBoxCost = (params: {
  op: Operation
  costConfiguration: CostConfiguration
  g: BpcGraph
}): number => {
  const { costConfiguration } = params

  // Base cost for removing a pin
  let cost = costConfiguration.baseOperationCost || 1

  // Small additional cost for pin removal complexity
  cost += costConfiguration.pinHandlingCost || 0.3

  return cost
}
