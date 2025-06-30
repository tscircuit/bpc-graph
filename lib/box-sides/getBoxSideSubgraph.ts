import type { BpcGraph, MixedBpcGraph, Direction, BpcPin } from "lib/types"
import {
  getPinDirection,
  getPinDirectionOrThrow,
} from "lib/graph-utils/getPinDirection"

export type Side = "left" | "right" | "top" | "bottom"

const sideToDirection: Record<Side, Direction> = {
  left: "x-",
  right: "x+",
  top: "y+",
  bottom: "y-",
}

export const getBoxSideSubgraph = ({
  bpcGraph,
  boxId,
  side,
}: {
  bpcGraph: BpcGraph
  boxId: string
  side: Side
}): MixedBpcGraph => {
  const dir = sideToDirection[side]

  const subgraph: MixedBpcGraph = { boxes: [], pins: [] }

  const box = bpcGraph.boxes.find((b) => b.boxId === boxId)
  if (!box) throw new Error(`Box \"${boxId}\" not found`)

  // Add side-specific box
  subgraph.boxes.push({ ...structuredClone(box), boxId })

  // Add pins
  for (const p of bpcGraph.pins) {
    if (p.boxId === boxId) {
      const pDir = getPinDirection(bpcGraph, boxId, p.pinId)
      if (pDir === dir || pDir === null) {
        subgraph.pins.push(structuredClone(p))
      }
    }
  }

  // ------------------------------------------------------------------
  //  Collect the networks of the just-added root-side pins
  // ------------------------------------------------------------------
  const visitedNetIds = new Set<string>()
  for (const p of subgraph.pins) visitedNetIds.add(p.networkId)

  // ------------------------------------------------------------------
  //  Helper to add pins / boxes only once
  // ------------------------------------------------------------------
  const addedPinIds = new Set<string>(subgraph.pins.map((p) => p.pinId))
  const addedBoxIds = new Set<string>(subgraph.boxes.map((b) => b.boxId))

  const addBoxIfNeeded = (boxId: string) => {
    if (addedBoxIds.has(boxId)) return
    const b = bpcGraph.boxes.find((bb) => bb.boxId === boxId)
    if (b) {
      subgraph.boxes.push(structuredClone(b))
      addedBoxIds.add(boxId)
    }
  }

  const addPinIfNeeded = (pin: BpcPin) => {
    if (addedPinIds.has(pin.pinId)) return
    subgraph.pins.push(structuredClone(pin))
    addedPinIds.add(pin.pinId)
    addBoxIfNeeded(pin.boxId)
  }

  // ------------------------------------------------------------------
  //  Bring in every pin (and its box) that shares any of those networks
  // ------------------------------------------------------------------
  for (const netId of visitedNetIds) {
    for (const pin of bpcGraph.pins) {
      if (pin.networkId === netId) {
        addPinIfNeeded(pin)
      }
    }
  }

  /* ------------------------------------------------------------------
   *  Ensure that every NON-root box already present in the subgraph
   *  contributes *all* of its pins.
   *  (Root box keeps side-filtered pins only.)
   * ------------------------------------------------------------------ */
  for (const b of subgraph.boxes) {
    if (b.boxId === boxId) continue // root box: leave as-is
    const allPinsOfBox = bpcGraph.pins.filter(
      // every pin in original graph
      (pin) => pin.boxId === b.boxId,
    )
    for (const pin of allPinsOfBox) {
      addPinIfNeeded(pin) // uses existing helper
    }
  }

  return subgraph
}
