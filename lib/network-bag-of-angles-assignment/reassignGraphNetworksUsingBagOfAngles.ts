import type { BpcGraph, NetworkId } from "lib/types"
import { computeNetworkMappingFromBagsOfAngles } from "./computeNetworkMappingFromBagsOfAngles"
import { computeGraphNetworkBagOfAnglesMap } from "./computeGraphNetworkBagOfAnglesMap"

export const reassignGraphNetworksUsingBagOfAngles = (
  g: BpcGraph,
  bagOfAnglesMapTarget: Map<NetworkId, number[]>,
): { reassignedGraph: BpcGraph; distance: number } => {
  const bagOfAnglesMap1 = computeGraphNetworkBagOfAnglesMap(g)
  const { networkMapping, distance } = computeNetworkMappingFromBagsOfAngles(
    bagOfAnglesMap1,
    bagOfAnglesMapTarget,
  )

  return {
    reassignedGraph: {
      boxes: g.boxes,
      pins: g.pins.map((p) => ({
        ...p,
        networkId: networkMapping.get(p.networkId)!,
      })),
    },
    distance,
  }
}
