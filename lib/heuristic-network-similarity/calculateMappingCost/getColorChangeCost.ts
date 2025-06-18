import type { CostConfiguration } from "lib/operations/configureOperationCostFn";

export function getColorChangeCost(
  color1: string,
  color2: string,
  costConfig: CostConfiguration,
): number {
  if (color1 === color2) return 0;
  return costConfig.colorChangeCostMap[`${color1}->${color2}`] ?? costConfig.baseOperationCost;
}
