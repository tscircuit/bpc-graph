import type { BpcGraph, NetworkId } from "lib/types"
import { computeBagOfAnglesForNetwork } from "./computeBagOfAnglesForNetwork"

export const computeGraphNetworkBagOfAnglesMap = (
  g: BpcGraph,
): Map<NetworkId, number[]> => {
  const map = new Map<NetworkId, number[]>()

  const networks = Array.from(new Set(g.pins.map((p) => p.networkId)))

  for (const networkId of networks) {
    const angles = computeBagOfAnglesForNetwork(g, networkId)
    map.set(networkId, angles)
  }

  return map
}
