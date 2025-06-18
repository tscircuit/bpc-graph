import type { BpcGraph } from "lib/types"
import { getOperationCost } from "./getOperationCost/getOperationCost"
import type { Operation, OperationCostFn } from "./operation-types"

export type CostConfiguration = {
  colorChangeCostMap: Record<string, number>
  baseOperationCost: number
  costPerUnitDistanceMovingPin: number
}

const defaultCostConfiguration: CostConfiguration = {
  colorChangeCostMap: {},
  baseOperationCost: 1,
}

export const configureOperationCostFn = (
  params: Partial<CostConfiguration> = {},
): OperationCostFn => {
  const costConfiguration: CostConfiguration = {
    ...defaultCostConfiguration,
    ...params,
  }

  return (g: BpcGraph, ops: Operation[]) => {
    let costSum = 0
    for (const op of ops) {
      costSum += getOperationCost({ op, costConfiguration, g })
    }
    return costSum
  }
}
