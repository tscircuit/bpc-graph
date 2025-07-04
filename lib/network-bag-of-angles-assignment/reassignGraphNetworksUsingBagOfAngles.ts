import type { BpcGraph, NetworkId } from "lib/types"

export const reassignGraphNetworksUsingBagOfAngles = (
  g: BpcGraph,
  bagOfAnglesMap: Map<NetworkId, number[]>,
) => {
  const newNetworks = Array.from(bagOfAnglesMap.keys())
}
