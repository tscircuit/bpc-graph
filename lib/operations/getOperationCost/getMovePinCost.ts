import type { BpcGraph } from "lib/types"
import type { CostConfiguration } from "../configureOperationCostFn"
import type { MovePinOp } from "../operation-types"

export const getMovePinCost = (params: {
  op: MovePinOp
  costConfiguration: CostConfiguration
  g: BpcGraph
}): number => {
  const { op, costConfiguration } = params

  // Additional cost based on distance moved
  if (costConfiguration.costPerUnitDistanceMovingPin !== undefined) {
    const dx = op.newOffset.x - op.oldOffset.x
    const dy = op.newOffset.y - op.oldOffset.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance * costConfiguration.costPerUnitDistanceMovingPin
  }

  return costConfiguration.baseOperationCost
}
