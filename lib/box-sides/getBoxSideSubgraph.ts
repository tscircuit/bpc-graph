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
  followCondition = (from: BpcPin, networkId: string, networkPins: BpcPin[]) =>
    true,
}: {
  bpcGraph: BpcGraph
  boxId: string
  side: Side
  followCondition?: (
    from: BpcPin,
    networkId: string,
    networkPins: BpcPin[],
  ) => boolean
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
      const pDir = getPinDirection(bpcGraph, p.pinId)
      console.log("p", p.pinId, pDir, dir)
      if (pDir === dir || dir === null) {
        subgraph.pins.push({ ...structuredClone(p), boxId })
      }
    }
  }

  return subgraph
}
