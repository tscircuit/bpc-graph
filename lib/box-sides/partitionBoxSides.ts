import { getBoxSideSubgraph } from "./getBoxSideSubgraph"
import { mergeBoxSideSubgraphs } from "./mergeBoxSideSubgraphs"
import { findIsolatedBoxSides } from "./findIsolatedBoxSides"
import { renetworkWithCondition } from "../renetwork/renetworkWithCondition"
import { getPinDirection } from "../graph-utils/getPinDirection"
import type { BpcGraph } from "../types"

export const partitionBoxSides = (
  g: BpcGraph,
  boxId: string,
): {
  subgraphs: BpcGraph[]
  renetworkedNetworkIdMap: Record<string, string>
} => {
  const center = g.boxes.find((b) => b.boxId === boxId)?.center
  if (!center) throw new Error(`Box ${boxId} not found or has no center`)

  const { renetworkedGraph, renetworkedNetworkIdMap } = renetworkWithCondition(
    g,
    (from, to) => {
      if (!from.box.center || !to.box.center) return true
      const fromSide =
        from.box.center.x + from.pin.offset.x < center.x ? "left" : "right"
      const toSide =
        to.box.center.x + to.pin.offset.x < center.x ? "left" : "right"
      return fromSide === toSide
    },
  )

  let sideGroups: any[] = []
  try {
    sideGroups = findIsolatedBoxSides(renetworkedGraph, boxId)
  } catch {
    sideGroups = []
  }
  if (sideGroups.length === 0) {
    const sides = new Set<string>()
    for (const p of renetworkedGraph.pins) {
      if (p.boxId !== boxId || p.pinId.endsWith("_center")) continue
      const dir = getPinDirection(renetworkedGraph, boxId, p.pinId)
      if (dir === "x-") sides.add("left")
      else if (dir === "x+") sides.add("right")
      else if (dir === "y+") sides.add("top")
      else if (dir === "y-") sides.add("bottom")
    }
    sideGroups = Array.from(sides).map((s) => [s as any])
  }

  const powerLabels = renetworkedGraph.boxes.filter(
    (b) => b.boxAttributes?.is_net_label,
  )
  const powerPins = new Map(
    powerLabels.map(
      (b) =>
        [
          b.boxId,
          renetworkedGraph.pins.find(
            (p) => p.boxId === b.boxId && p.pinId.endsWith("_pin"),
          ),
        ] as const,
    ),
  )
  const centerPins = new Map(
    powerLabels.map(
      (b) =>
        [
          b.boxId,
          renetworkedGraph.pins.find(
            (p) => p.boxId === b.boxId && p.pinId.endsWith("_center"),
          ),
        ] as const,
    ),
  )

  const results: BpcGraph[] = []
  for (const group of sideGroups) {
    const subgraphs = group.map((side) =>
      getBoxSideSubgraph({ bpcGraph: renetworkedGraph, boxId, side }),
    )
    let merged = mergeBoxSideSubgraphs(subgraphs)

    for (const label of powerLabels) {
      const pin = powerPins.get(label.boxId)
      if (!pin) continue
      const baseId = renetworkedNetworkIdMap[pin.networkId] ?? pin.networkId
      const matchNet = merged.pins.find(
        (p) => (renetworkedNetworkIdMap[p.networkId] ?? p.networkId) === baseId,
      )?.networkId
      if (matchNet && !merged.boxes.find((b) => b.boxId === label.boxId)) {
        merged.boxes.push(structuredClone(label))
        merged.pins.push(structuredClone({ ...pin, networkId: matchNet }))
        const cp = centerPins.get(label.boxId)
        if (cp) merged.pins.push(structuredClone(cp))
      }
    }

    results.push(merged)
  }

  return { subgraphs: results, renetworkedNetworkIdMap }
}
