import type { CostConfiguration } from "lib/operations/configureOperationCostFn"
import type { BpcGraph } from "lib/types"

/**
 * The heuristic network similarity distance is a measure of how different
 * two graphs are, ignoring the box positions. We do consider the pin colors,
 * the pin directions, and the pin network ids.
 *
 * To compute this, we have to consider different possible matchings of boxes
 * and networks. Neither the boxId nor networkId are necessarily in the same
 * space. e.g. g1 may have boxIds [1,2,3] while g2 may have boxIds [A,B,C]
 * , similarly it may have networkIds [1,2,3] while g2 may have networkIds [A,B,C]
 *
 * For our first implementation, we consider every possible matching of boxes
 * and networks and take the best matching distance. We include variants where
 * a box is removed.
 *
 * When computing the distance, we guess how many operations it will take to
 * "fix" the g1 such that it matches g2. e.g. if a matched box in g1 has 2
 * fewer pins that it's counterpart in g2, we assume it will take 2 operations
 * to fix. We compute the cost using costConfiguration.baseOperationCost * 2
 *
 */
export const getHeuristicNetworkSimilarityDistance = (
  g1: BpcGraph,
  g2: BpcGraph,
  costConfiguration: CostConfiguration,
) => {
  // TODO
}
