import type { BpcGraph, Direction, PinId, BpcPin } from "lib/types";
import { calculateSinglePinMatchCost } from "./calculateSinglePinMatchCost";
import type { HeuristicSimilarityCostContext } from "../types";

interface CalculateMappedBoxPairPinDifferencesCostParams {
  context: HeuristicSimilarityCostContext;
  box1Id: string;
  box2Id: string;
}

export const calculateMappedBoxPairPinDifferencesCost = ({
  context,
  box1Id,
  box2Id,
}: CalculateMappedBoxPairPinDifferencesCostParams): number => {
  const { g1, g2, networkAssignment, costConfiguration, pinDirectionsG1, pinDirectionsG2 } = context;
  let costForThisBoxPair = 0;
  const pinsInBox1 = g1.pins.filter(p => p.boxId === box1Id);
  const pinsInBox2 = g2.pins.filter(p => p.boxId === box2Id);
  const mutablePinsInBox2 = [...pinsInBox2]; // Create a mutable copy

  for (const p1 of pinsInBox1) {
    const p1Dir = pinDirectionsG1.get(p1.pinId);
    const p1MappedNetworkId = networkAssignment.map.get(p1.networkId) ?? null;

    if (p1Dir === undefined) {
      costForThisBoxPair += costConfiguration.baseOperationCost; // p1 removed (unmatchable direction)
      continue;
    }

    let bestMatchIndex = -1;
    let minPinMatchCost = Infinity;

    for (let i = 0; i < mutablePinsInBox2.length; i++) {
      const p2 = mutablePinsInBox2[i]!;
      const p2Dir = pinDirectionsG2.get(p2.pinId);

      if (p2Dir === undefined) { // p2 unmatchable by direction
        continue;
      }

      if (p1Dir === p2Dir) { // Directions must match
        const currentPinTransformCost = calculateSinglePinMatchCost({
          p1,
          p2,
          p1MappedNetworkId,
          costConfiguration,
        });

        if (currentPinTransformCost < minPinMatchCost) {
          minPinMatchCost = currentPinTransformCost;
          bestMatchIndex = i;
        }
      }
    }

    if (bestMatchIndex !== -1) {
      costForThisBoxPair += minPinMatchCost;
      mutablePinsInBox2.splice(bestMatchIndex, 1); // Consume p2
    } else {
      costForThisBoxPair += costConfiguration.baseOperationCost; // p1 removed (no match)
    }
  }

  // Any remaining pins in mutablePinsInBox2 must be added
  for (const _p2_remaining of mutablePinsInBox2) {
    costForThisBoxPair += costConfiguration.baseOperationCost; // p2 added
  }

  return costForThisBoxPair;
};
