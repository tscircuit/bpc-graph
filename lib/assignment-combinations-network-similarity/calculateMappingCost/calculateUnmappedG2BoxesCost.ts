import type { CostConfiguration } from "lib/operations/configureOperationCostFn"
import type { BpcGraph } from "lib/types"
import type { Assignment } from "../generateAssignments"

interface CalculateUnmappedG2BoxesCostParams {
  g2: BpcGraph
  boxAssignment: Assignment<string, string>
  costConfiguration: CostConfiguration
}

export const calculateUnmappedG2BoxesCost = ({
  g2,
  boxAssignment,
  costConfiguration,
}: CalculateUnmappedG2BoxesCostParams): number => {
  let cost = 0
  for (const box2Id of boxAssignment.unmappedRhs) {
    cost += costConfiguration.baseOperationCost // Cost to add box
    const pinsInBox2 = g2.pins.filter((p) => p.boxId === box2Id)
    cost += pinsInBox2.length * costConfiguration.baseOperationCost // Cost to add their pins
  }
  return cost
}
