import type { BpcGraph } from "lib/types"
import type { CostConfiguration } from "../configureOperationCostFn"
import type { RemoveBoxOp } from "../operation-types"

export const getRemoveBoxCost = (params: {
  op: RemoveBoxOp
  costConfiguration: CostConfiguration
  g: BpcGraph
}): number => {
  const { op, costConfiguration } = params

  return costConfiguration.baseOperationCost
}
