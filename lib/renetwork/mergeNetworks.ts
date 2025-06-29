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
): BpcGraph => {}
