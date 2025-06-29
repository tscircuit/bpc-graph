import type { BpcGraph } from "lib/types"

/**
 * Reverse the renetwork operation to produce a graph with the original networkIds
 *
 * Can also be used to merge networks given a mapping from each network to a new
 * network id.
 */
export const mergeNetworks = (
  graph: BpcGraph,
  renetworkedNetworkIdMap: Record<string, string>,
): BpcGraph => {
  const newGraph = structuredClone(graph)

  for (const p of newGraph.pins) {
    p.networkId = renetworkedNetworkIdMap[p.networkId] ?? p.networkId
  }

  return newGraph
}
