import type { BpcGraph } from "lib/types"
import type { CostConfiguration } from "../configureOperationCostFn"
import type { Operation } from "../operation-types"

export const getMoveBoxCost = (params: {
  op: Operation
  costConfiguration: CostConfiguration
  g: BpcGraph
}): number => {
  return params.costConfiguration.baseOperationCost
}
