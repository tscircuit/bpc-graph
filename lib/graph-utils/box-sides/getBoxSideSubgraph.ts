import type { BpcGraph, MixedBpcGraph, Direction } from "lib/types"
import { getPinDirection } from "lib/graph-utils/getPinDirection"

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
  const sideBoxId = `${boxId}-${side}`

  const result: MixedBpcGraph = { boxes: [], pins: [] }

  const box = bpcGraph.boxes.find((b) => b.boxId === boxId)
  if (!box) throw new Error(`Box \"${boxId}\" not found`)

  // Add all other boxes
  for (const b of bpcGraph.boxes) {
    if (b.boxId === boxId) continue
    result.boxes.push(structuredClone(b))
  }

  // Add side-specific box
  result.boxes.push({ ...structuredClone(box), boxId: sideBoxId })

  // Add pins
  for (const p of bpcGraph.pins) {
    if (p.boxId === boxId) {
      const pDir = getPinDirection(bpcGraph, p.pinId)
      if (pDir === dir) {
        result.pins.push({ ...structuredClone(p), boxId: sideBoxId })
      }
    } else {
      result.pins.push(structuredClone(p))
    }
  }

  return result
}
