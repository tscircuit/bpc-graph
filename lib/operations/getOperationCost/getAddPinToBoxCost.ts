import type { BpcGraph } from "lib/types"
import type { CostConfiguration } from "../configureOperationCostFn"
import type { AddPinToBoxOp } from "../operation-types"

export const getAddPinToBoxCost = (params: {
  op: AddPinToBoxOp
  costConfiguration: CostConfiguration
  g: BpcGraph
}): number => {
  const { costConfiguration } = params

  return costConfiguration.baseOperationCost || 1
}
