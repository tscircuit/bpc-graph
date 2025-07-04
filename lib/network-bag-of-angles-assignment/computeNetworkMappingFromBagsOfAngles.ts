import type { BpcGraph, NetworkId } from "lib/types"
import { computeBagOfAnglesDistance } from "./computeBagOfAnglesDistance"

export const computeNetworkMappingFromBagsOfAngles = (
  bag1: Map<NetworkId, number[]>,
  bag2: Map<NetworkId, number[]>,
): {
  networkMapping: Map<NetworkId, NetworkId>
  distance: number
} => {
  const networkMapping = new Map<NetworkId, NetworkId>()

  const bag1Entries = Array.from(bag1.entries())
  const bag2Entries = Array.from(bag2.entries())

  const distanceMatrix: number[][] = []

  for (let i = 0; i < bag1Entries.length; i++) {
    for (let j = i; j < bag2Entries.length - 1; j++) {
      if (i === j) {
        distanceMatrix[i]!.[j] = 0
        continue
      }

      const [networkId1, angles1] = bag1Entries[i]!
      const [networkId2, angles2] = bag2Entries[j]!

      const distance = computeBagOfAnglesDistance(angles1, angles2)
      distanceMatrix[i]![j] = distance
      distanceMatrix[j]![i] = distance
    }
  }


  // TODO compute network mapping and total distance

  return { networkMapping }
}
