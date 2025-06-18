import { getOperationCost } from "./getOperationCost/getOperationCost"
import type { Operation, OperationCostFn } from "./operation-types"

export type CostConfiguration = {
  colorChangeCostMap: Record<string, number>
}

const defaultCostConfiguration: CostConfiguration = {
  colorChangeCostMap: {},
}

export const configureOperationCostFn = (
  params: Partial<CostConfiguration> = {},
): OperationCostFn => {
  const costConfiguration: CostConfiguration = {
    ...defaultCostConfiguration,
    ...params,
  }

  return (ops: Operation[]) => {
    let costSum = 0
    for (const op of ops) {
      costSum += getOperationCost({ op, costConfiguration, getColor })
    }
    return costSum
  }
}
