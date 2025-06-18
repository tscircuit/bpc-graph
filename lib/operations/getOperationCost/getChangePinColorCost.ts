import type { BpcGraph } from "lib/types"
import type { CostConfiguration } from "../configureOperationCostFn"
import type { ChangePinColorOp } from "../operation-types"

export const getChangePinColorCost = (params: {
  op: ChangePinColorOp
  costConfiguration: CostConfiguration
  g: BpcGraph
}) => {
  const { op, costConfiguration, g } = params
  const { pinId, oldColor, newColor } = op
  const pin = g.pins.find((p) => p.pinId === pinId)
  if (!pin) {
    throw new Error(`Pin with id ${pinId} not found`)
  }
  const cost =
    costConfiguration.colorChangeCostMap[`${oldColor}->${newColor}`] ??
    costConfiguration.baseOperationCost

  return cost
}
