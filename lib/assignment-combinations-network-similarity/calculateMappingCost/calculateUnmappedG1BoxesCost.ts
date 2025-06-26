import type { CostConfiguration } from "lib/operations/configureOperationCostFn"
import type { BpcGraph } from "lib/types"
import type { Assignment } from "../generateAssignments"

interface CalculateUnmappedG1BoxesCostParams {
  g1: BpcGraph
  boxAssignment: Assignment<string, string>
  costConfiguration: CostConfiguration
}

export const calculateUnmappedG1BoxesCost = ({
  g1,
  boxAssignment,
  costConfiguration,
}: CalculateUnmappedG1BoxesCostParams): number => {
  let cost = 0
  for (const box1 of g1.boxes) {
    const box1Id = box1.boxId
    if (
      boxAssignment.map.get(box1Id) === null ||
      boxAssignment.map.get(box1Id) === undefined
    ) {
      cost += costConfiguration.baseOperationCost // Cost to remove box
      const pinsInBox1 = g1.pins.filter((p) => p.boxId === box1Id)
      cost += pinsInBox1.length * costConfiguration.baseOperationCost // Cost to remove their pins
    }
  }
  return cost
}
