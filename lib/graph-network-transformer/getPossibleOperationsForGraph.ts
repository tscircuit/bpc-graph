import type { Operation } from "lib/operations/operation-types"
import type { BpcGraph } from "lib/types"
import type { GraphNetworkTransformer } from "./GraphNetworkTransformer"

/**
 * Get possible operations for a graph that...
 * - Have not already been performed on another operation chain
 * - That make sense to move the graph towards the target graph (e.g. if the
 *   number of boxes are matching, there's no reason to create boxes, if a pin
 *   is the only pin in a network, no reason to change it's pin id)
 *
 * Where you need to compute something that needs to be reused a lot, you can
 * compute it once and store it in the GraphNetworkTransformer in the initialize()
 * function
 */
export const getPossibleOperationsForGraph = (
  nt: GraphNetworkTransformer,
  g: BpcGraph,
): Operation[] => {
  // TODO get all possible operations for the graph,
}
