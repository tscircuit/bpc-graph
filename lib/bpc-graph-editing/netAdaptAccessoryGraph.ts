import { getApproximateAssignments2 } from "lib/assignment2/getApproximateAssignments2"
import type { FixedBpcGraph, BpcGraph, FixedBoxId } from "lib/types"

/**
 * Returns a fixed position version of the floatingGraph that contains accessory
 * graph information (all boxes from the fixedAccessoryCorpusMatch)
 *
 * - We add all boxes from the fixedAccessoryCorpusMatch graph (both matched and unmatched)
 * - For matched boxes, we use the original floating box ID for consistency
 * - For unmatched boxes, we use the accessory corpus box ID
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

  // Helper: which fixed boxes are already matched and their floating counterparts
  const matchedFixedBoxIds = new Set(Object.values(floatingToFixedBoxAssignment))
  const fixedToFloatingBoxAssignment: Record<string, string> = {}
  for (const [floatingId, fixedId] of Object.entries(floatingToFixedBoxAssignment)) {
    fixedToFloatingBoxAssignment[fixedId] = floatingId
  }

  // ------------------------------------------------------------------
  //  Iterate over all accessory boxes (both matched and unmatched)
  // ------------------------------------------------------------------
  for (const box of fixedAccessoryCorpusMatch.boxes) {
    const isMatchedBox = matchedFixedBoxIds.has(box.boxId)
    const boxIdToUse = isMatchedBox ? (fixedToFloatingBoxAssignment[box.boxId] ?? box.boxId) : box.boxId
    
    // Skip boxes without center - they can't be properly positioned
    if (!box.center) {
      console.log("[netAdaptAccessoryGraph] SKIP box without center", box.boxId)
      continue
    }
    
    console.log(`[netAdaptAccessoryGraph] ADD accessory box ${box.boxId} (${isMatchedBox ? 'matched' : 'unmatched'}) as ${boxIdToUse}`)

    // Remap every pin’s network if we have a mapping; otherwise keep the
    // original fixed-corpus network id.
    const remappedPins = fixedAccessoryCorpusMatch.pins
      .filter(p => p.boxId === box.boxId)
      .map(p => ({
        ...p,
        boxId: boxIdToUse,
        networkId: fixedToFloatingNetworkAssignment[p.networkId] ?? p.networkId,
      }))

    boxes.push({ ...box, kind: "fixed" as const, center: box.center, boxId: boxIdToUse })
    pins.push(...remappedPins)
  }


  console.log(
    "[netAdaptAccessoryGraph] FINISH",
    { addedBoxes: boxes.length, addedPins: pins.length },
  )

  return { boxes, pins }
}
