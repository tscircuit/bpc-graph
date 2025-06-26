import type { CostConfiguration } from "lib/operations/configureOperationCostFn"
import type { BpcGraph, PinId, Direction } from "lib/types"
import { getGraphNetworkIds } from "lib/graph-utils/getGraphNetworkIds"
import type { HeuristicSimilarityCostContext } from "./types"
import { precomputePinDirections } from "./precomputePinDirections"
import { generateAssignments, type Assignment } from "./generateAssignments"
import { calculateMappingCost } from "./calculateMappingCost"
import type { LibContext } from "lib/context"

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
  ctx?: LibContext,
): {
  distance: number
  boxAssignment: Assignment<string, string>
  networkAssignment: Assignment<string, string>
} => {
  const boxIds1 = g1.boxes.map((b) => b.boxId)
  const boxIds2 = g2.boxes.map((b) => b.boxId)
  const networkIds1 = getGraphNetworkIds(g1)
  const networkIds2 = getGraphNetworkIds(g2)

  ctx?.logger?.debug(`getHeuristicNetworkSimilarityDistance: comparing ${boxIds1.length} boxes (${boxIds1.join(',')}) vs ${boxIds2.length} boxes (${boxIds2.join(',')})`)
  ctx?.logger?.debug(`getHeuristicNetworkSimilarityDistance: comparing ${networkIds1.length} networks vs ${networkIds2.length} networks`)

  // Precompute pin directions for efficiency
  const pinDirectionsG1 = precomputePinDirections(g1)
  const pinDirectionsG2 = precomputePinDirections(g2)

  let bestBoxAssignment: Assignment<string, string> | null = null
  let bestNetworkAssignment: Assignment<string, string> | null = null
  let minTotalCost = Infinity
  // Iterate over all possible assignments of g1 boxes to g2 boxes
  let boxAssignmentCount = 0
  for (const boxAssignment of generateAssignments(boxIds1, boxIds2, ctx)) {
    boxAssignmentCount++
    if (boxAssignmentCount % 1000 === 0) {
      ctx?.logger?.debug(`getHeuristicNetworkSimilarityDistance: processed ${boxAssignmentCount} box assignments`)
    }
    // For each box assignment, iterate over all possible assignments of g1 networks to g2 networks
    let networkAssignmentCount = 0
    for (const networkAssignment of generateAssignments(
      networkIds1,
      networkIds2,
      ctx,
    )) {
      networkAssignmentCount++
      const context: HeuristicSimilarityCostContext = {
        g1,
        g2,
        networkAssignment: networkAssignment as Assignment<string, string>,
        costConfiguration,
        pinDirectionsG1,
        pinDirectionsG2,
      }
      const currentCost = calculateMappingCost({
        context,
        boxAssignment: boxAssignment as Assignment<string, string>,
      })
      if (currentCost < minTotalCost) {
        minTotalCost = currentCost
        bestBoxAssignment = boxAssignment
        bestNetworkAssignment = networkAssignment
      }
    }
    ctx?.logger?.debug(`getHeuristicNetworkSimilarityDistance: box assignment ${boxAssignmentCount} had ${networkAssignmentCount} network assignments`)
  }
  
  ctx?.logger?.debug(`getHeuristicNetworkSimilarityDistance: total ${boxAssignmentCount} box assignments processed, min cost: ${minTotalCost}`)

  // If minTotalCost is still Infinity, it means no assignments were possible (e.g. loops didn't run, though they should at least once)
  // or graphs were empty. If both graphs are empty, calculateMappingCost returns 0.
  return {
    distance: minTotalCost === Infinity ? 0 : minTotalCost,
    boxAssignment: bestBoxAssignment!,
    networkAssignment: bestNetworkAssignment!,
  }
}
