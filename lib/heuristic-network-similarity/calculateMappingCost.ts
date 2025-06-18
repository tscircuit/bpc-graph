import type { Assignment } from "./generateAssignments";
import { calculateUnmappedG1BoxesCost } from "./calculateMappingCost/calculateUnmappedG1BoxesCost";
import { calculateUnmappedG2BoxesCost } from "./calculateMappingCost/calculateUnmappedG2BoxesCost";
import { calculateMappedBoxPairPinDifferencesCost } from "./calculateMappingCost/calculateMappedBoxPairPinDifferencesCost";
import type { HeuristicSimilarityCostContext } from "./types";

interface CalculateMappingCostParams {
  context: HeuristicSimilarityCostContext;
  boxAssignment: Assignment<string, string>;
}

export const calculateMappingCost = ({
  context,
  boxAssignment,
}: CalculateMappingCostParams): number => {
  const { g1, g2, costConfiguration } = context;
  let totalCost = 0;

  // Cost for unmapped g1 boxes (removed) and their pins
  totalCost += calculateUnmappedG1BoxesCost({ g1, boxAssignment, costConfiguration });

  // Cost for unmapped g2 boxes (added) and their pins
  totalCost += calculateUnmappedG2BoxesCost({ g2, boxAssignment, costConfiguration });

  // Cost for mapped boxes (pin differences)
  for (const [box1Id, box2IdOrNull] of boxAssignment.map.entries()) {
    if (box2IdOrNull === null || box2IdOrNull === undefined) {
      // Already handled by calculateUnmappedG1BoxesCost
      continue;
    }
    const box2Id = box2IdOrNull;

    totalCost += calculateMappedBoxPairPinDifferencesCost({
      context, // Pass the whole context down
      box1Id,
      box2Id,
    });
  }
  return totalCost;
};
