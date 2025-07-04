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

  const n1 = bag1Entries.length
  const n2 = bag2Entries.length
  const distanceMatrix: number[][] = Array.from({ length: n1 }, () =>
    new Array(n2).fill(0),
  )

  for (let i = 0; i < n1; i++) {
    const [, angles1] = bag1Entries[i]!
    for (let j = 0; j < n2; j++) {
      const [, angles2] = bag2Entries[j]!
      distanceMatrix[i]![j] = computeBagOfAnglesDistance(angles1, angles2)
    }
  }

  const unmapped1 = new Set<number>(Array.from({ length: n1 }, (_, i) => i))
  const unmapped2 = new Set<number>(Array.from({ length: n2 }, (_, i) => i))

  let totalDistance = 0

  while (unmapped1.size && unmapped2.size) {
    let bestI = -1
    let bestJ = -1
    let bestD = Infinity
    for (const i of unmapped1) {
      for (const j of unmapped2) {
        const d = distanceMatrix[i]![j]!
        if (d < bestD) {
          bestD = d
          bestI = i
          bestJ = j
        }
      }
    }
    // record mapping
    const [net1] = bag1Entries[bestI]!
    const [net2] = bag2Entries[bestJ]!
    networkMapping.set(net1, net2)
    totalDistance += bestD
    unmapped1.delete(bestI)
    unmapped2.delete(bestJ)
  }

  const UNMATCHED_PENALTY = Math.PI
  totalDistance += (unmapped1.size + unmapped2.size) * UNMATCHED_PENALTY

  return { networkMapping, distance: totalDistance }
}
