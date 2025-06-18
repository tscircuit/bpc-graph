import type { CostConfiguration } from "lib/operations/configureOperationCostFn";
import type { BpcGraph, Direction, PinId } from "lib/types";
import type { Assignment } from "./generateAssignments";

function getColorChangeCost(
  color1: string,
  color2: string,
  costConfig: CostConfiguration,
): number {
  if (color1 === color2) return 0;
  return costConfig.colorChangeCostMap[`${color1}->${color2}`] ?? costConfig.baseOperationCost;
}

export const calculateMappingCost = (
  g1: BpcGraph,
  g2: BpcGraph,
  boxAssignment: Assignment<string, string>,
  networkAssignment: Assignment<string, string>,
  costConfiguration: CostConfiguration,
  pinDirectionsG1: Map<PinId, Direction | undefined>, // Allow undefined if direction couldn't be computed
  pinDirectionsG2: Map<PinId, Direction | undefined>,
): number => {
  let totalCost = 0;

  // Cost for unmapped g1 boxes (removed) and their pins
  for (const box1Id of g1.boxes.map(b => b.boxId)) {
    if (boxAssignment.map.get(box1Id) === null || boxAssignment.map.get(box1Id) === undefined) {
      totalCost += costConfiguration.baseOperationCost; // Cost to remove box
      const pinsInBox1 = g1.pins.filter(p => p.boxId === box1Id);
      totalCost += pinsInBox1.length * costConfiguration.baseOperationCost; // Cost to remove their pins
    }
  }

  // Cost for unmapped g2 boxes (added) and their pins
  for (const box2Id of boxAssignment.unmappedRhs) {
    totalCost += costConfiguration.baseOperationCost; // Cost to add box
    const pinsInBox2 = g2.pins.filter(p => p.boxId === box2Id);
    totalCost += pinsInBox2.length * costConfiguration.baseOperationCost; // Cost to add their pins
  }

  // Cost for mapped boxes (pin differences)
  for (const [box1Id, box2IdOrNull] of boxAssignment.map.entries()) {
    if (box2IdOrNull === null || box2IdOrNull === undefined) continue; // Already handled as removed box1
    const box2Id = box2IdOrNull;

    const pinsInBox1 = g1.pins.filter(p => p.boxId === box1Id);
    const pinsInBox2 = g2.pins.filter(p => p.boxId === box2Id);

    let costForThisBoxPair = 0;
    const mutablePinsInBox2 = [...pinsInBox2]; // Create a mutable copy to track unmatched g2 pins

    for (const p1 of pinsInBox1) {
      const p1Dir = pinDirectionsG1.get(p1.pinId);
      // If p1.networkId is unmapped, p1MappedNetworkId will be null.
      // This signifies p1's network is treated as a distinct, new network.
      const p1MappedNetworkId = networkAssignment.map.get(p1.networkId) ?? null;

      let bestMatchIndex = -1;
      let minPinMatchCost = Infinity;

      if (p1Dir === undefined) { // p1 has an uncomputable direction
        // This pin cannot be matched by direction, so it's effectively removed.
        costForThisBoxPair += costConfiguration.baseOperationCost;
        continue;
      }

      for (let i = 0; i < mutablePinsInBox2.length; i++) {
        const p2 = mutablePinsInBox2[i]!;
        const p2Dir = pinDirectionsG2.get(p2.pinId);

        if (p2Dir === undefined) { // p2 has an uncomputable direction
          // This pin cannot be matched by direction. It will be counted as an add later if not consumed.
          continue;
        }
        
        if (p1Dir === p2Dir) { // Directions must match for a potential transformation
          let currentPinTransformCost = 0;
          currentPinTransformCost += getColorChangeCost(p1.color, p2.color, costConfiguration);

          // Compare p1's mapped network ID with p2's network ID
          if (p1MappedNetworkId !== p2.networkId) {
            currentPinTransformCost += costConfiguration.baseOperationCost; // Cost to change network
          }

          if (currentPinTransformCost < minPinMatchCost) {
            minPinMatchCost = currentPinTransformCost;
            bestMatchIndex = i;
          }
        }
      }

      if (bestMatchIndex !== -1) { // Found a match for p1
        costForThisBoxPair += minPinMatchCost;
        mutablePinsInBox2.splice(bestMatchIndex, 1); // Consume p2 from the mutable list
      } else { // p1 could not be matched
        costForThisBoxPair += costConfiguration.baseOperationCost; // Cost to remove p1
      }
    }

    // Any remaining pins in mutablePinsInBox2 must be added
    for (const p2_remaining of mutablePinsInBox2) {
        // If p2_remaining has an undefined direction, it's an add for a pin that couldn't be processed properly.
        // Otherwise, it's a standard add.
        costForThisBoxPair += costConfiguration.baseOperationCost;
    }
    totalCost += costForThisBoxPair;
  }
  return totalCost;
};
