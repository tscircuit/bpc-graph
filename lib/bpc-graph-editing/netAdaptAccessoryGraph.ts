import { getApproximateAssignments2 } from "lib/assignment2/getApproximateAssignments2"
import type { FixedBpcGraph, BpcGraph, FixedBoxId } from "lib/types"

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

  console.log(
    "[netAdaptAccessoryGraph] START",
    { floatingBoxes: floatingGraph.boxes.length,
      fixedBoxes: fixedCorpusMatch.boxes.length,
      accessoryBoxes: fixedAccessoryCorpusMatch.boxes.length },
  )

  // Build reverse network assignment: fixedNet -> floatingNet
  const fixedToFloatingNetworkAssignment: Record<string, string> = {}
  for (const [floatNet, fixedNet] of Object.entries(floatingToFixedNetworkAssignment)) {
    fixedToFloatingNetworkAssignment[fixedNet] = floatNet
  }

  console.log("[netAdaptAccessoryGraph] assignments", {
    box: floatingToFixedBoxAssignment,
    net: floatingToFixedNetworkAssignment,
  })

  // Prepare result arrays
  const boxes: FixedBpcGraph['boxes'] = []
  const pins: FixedBpcGraph['pins'] = []

  // Helper: which fixed boxes are already matched (so we only add new ones)
  const matchedFixedBoxIds = new Set(Object.values(floatingToFixedBoxAssignment))

  // ------------------------------------------------------------------
  //  Iterate over accessory boxes
  // ------------------------------------------------------------------
  for (const box of fixedAccessoryCorpusMatch.boxes) {
    // Skip accessory boxes that were already matched to a floating box
    if (matchedFixedBoxIds.has(box.boxId)) {
      console.log("[netAdaptAccessoryGraph] SKIP already-matched accessory box", box.boxId)
      continue
    }
    console.log("[netAdaptAccessoryGraph] ADD accessory box", box.boxId)

    // Remap every pin’s network if we have a mapping; otherwise keep the
    // original fixed-corpus network id.
    const remappedPins = fixedAccessoryCorpusMatch.pins
      .filter(p => p.boxId === box.boxId)
      .map(p => ({
        ...p,
        networkId: fixedToFloatingNetworkAssignment[p.networkId] ?? p.networkId,
      }))

    boxes.push({ ...box, kind: "fixed" })
    pins.push(...remappedPins)
  }

  console.log(
    "[netAdaptAccessoryGraph] FINISH",
    { addedBoxes: boxes.length, addedPins: pins.length },
  )

  return { boxes, pins }
}
