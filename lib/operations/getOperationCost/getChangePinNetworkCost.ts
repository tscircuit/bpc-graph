import type { BpcGraph } from "lib/types"
import type { CostConfiguration } from "../configureOperationCostFn"
import type { ChangePinNetworkOp } from "../operation-types"

export const getChangePinNetworkCost = (params: {
  op: ChangePinNetworkOp
  costConfiguration: CostConfiguration
  g: BpcGraph
}): number => {
  return params.costConfiguration.baseOperationCost
}
