import type { FixedBpcGraph, NetworkId } from "lib/types"

/**
 * Computes the total network length of a fixed graph
 *
 * We consider a simplified distance measure which is the sum of the distance of
 * each point in the network to the "network
 * center" which is an average of all points in the network.
 */
export const getTotalNetworkLength = (
  g: FixedBpcGraph,
): {
  totalNetworkLength: number
  networkLengths: Map<NetworkId, number>
} => {
  // TODO
}
