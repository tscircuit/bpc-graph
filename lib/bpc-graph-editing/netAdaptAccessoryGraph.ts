import { getApproximateAssignments2 } from "lib/assignment2/getApproximateAssignments2"
import type { BpcGraph, FixedBpcGraph } from "lib/types"

/**
 * Returns a fixed position version of the floatingGraph that contains accessory
 * graph information (extra boxes from the fixedAccessoryCorpusMatch)
 *
 * - We only add boxes from the fixedAccessoryCorpusMatch graph that were not
 *   matched
 * - We rewrite networkIds to be compatible with the floatingGraph
 *
 * If for whatever reason we don't have a network assignment, we don't add that
 * box from the fixedAccessoryCorpusMatch graph.
 */
export const netAdaptAccessoryGraph = (params: {
  floatingGraph: BpcGraph
  fixedCorpusMatch: BpcGraph
  fixedAccessoryCorpusMatch: BpcGraph
}): FixedBpcGraph => {
  const { floatingGraph, fixedCorpusMatch, fixedAccessoryCorpusMatch } = params

  const {
    floatingToFixedBoxAssignment,
    floatingToFixedPinAssignment,
    floatingToFixedNetworkAssignment,
  } = getApproximateAssignments2(floatingGraph, fixedCorpusMatch)

  const fixedToFloatingNetworkAssignment: Record<string, string> = {}
  for (const [floatingNet, fixedNet] of Object.entries(
    floatingToFixedNetworkAssignment,
  )) {
    fixedToFloatingNetworkAssignment[fixedNet] = floatingNet
  }

  const accessoryGraph: FixedBpcGraph = {
    boxes: [],
    pins: [],
  }

  for (const box of fixedAccessoryCorpusMatch.boxes) {
    accessoryGraph.boxes.push(structuredClone(box))
  }

  for (const pin of fixedAccessoryCorpusMatch.pins) {
    const networkId =
      fixedToFloatingNetworkAssignment[pin.networkId] ?? pin.networkId
    accessoryGraph.pins.push({
      ...structuredClone(pin),
      networkId,
    })
  }

  return accessoryGraph
}
