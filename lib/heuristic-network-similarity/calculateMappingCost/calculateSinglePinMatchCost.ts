import type { CostConfiguration } from "lib/operations/configureOperationCostFn"
import type { BpcPin } from "lib/types"
import { getColorChangeCost } from "./getColorChangeCost"

interface CalculateSinglePinMatchCostParams {
  p1: BpcPin
  p2: BpcPin
  p1MappedNetworkId: string | null
  costConfiguration: CostConfiguration
}

export const calculateSinglePinMatchCost = ({
  p1,
  p2,
  p1MappedNetworkId,
  costConfiguration,
}: CalculateSinglePinMatchCostParams): number => {
  let currentPinTransformCost = 0
  currentPinTransformCost += getColorChangeCost(
    p1.color,
    p2.color,
    costConfiguration,
  )

  // Compare p1's mapped network ID with p2's network ID
  if (p1MappedNetworkId !== p2.networkId) {
    currentPinTransformCost += costConfiguration.baseOperationCost // Cost to change network
  }
  return currentPinTransformCost
}
