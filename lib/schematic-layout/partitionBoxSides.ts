import { findIsolatedBoxSides } from "lib/box-sides/findIsolatedBoxSides"
import { getBoxSideSubgraph } from "lib/box-sides/getBoxSideSubgraph"
import { mergeBoxSideSubgraphs } from "lib/box-sides/mergeBoxSideSubgraphs"
import { renetworkWithCondition } from "lib/renetwork/renetworkWithCondition"
import { mergeNetworks } from "lib/renetwork/mergeNetworks"
import type { BpcGraph, MixedBpcGraph, BpcPin, BpcBox } from "lib/types"

export interface PartitionResult {
  partitions: MixedBpcGraph[]
  renetworkedGraph: BpcGraph
  renetworkedNetworkIdMap: Record<string, string>
}

export const partitionBoxSides = (
  g: BpcGraph,
  boxId: string,
): PartitionResult => {
  const centerBox = g.boxes.find((b) => b.boxId === boxId)
  if (!centerBox?.center) throw new Error(`Box ${boxId} missing center`)

  // First split networks so that pins on opposite sides are not connected
  const { renetworkedGraph, renetworkedNetworkIdMap } = renetworkWithCondition(
    g,
    (from, to) => {
      if (!from.box.center || !to.box.center) return true
      const fromSide =
        from.box.center.x + from.pin.offset.x < centerBox.center!.x
          ? "left"
          : "right"
      const toSide =
        to.box.center.x + to.pin.offset.x < centerBox.center!.x
          ? "left"
          : "right"
      return fromSide === toSide
    },
  )

  const cleanedGraph: BpcGraph = {
    boxes: renetworkedGraph.boxes,
    pins: renetworkedGraph.pins.filter((p) => !p.pinId.endsWith("_center")),
  }

  // Determine isolated side groups after renetworking
  const sideGroups = findIsolatedBoxSides(cleanedGraph, boxId)

  const partitions: MixedBpcGraph[] = []
  for (const group of sideGroups) {
    const subgraphs = group.map((side) =>
      getBoxSideSubgraph({ bpcGraph: renetworkedGraph, boxId, side }),
    )
    const merged = mergeBoxSideSubgraphs(subgraphs, {
      renetworkedNetworkIdMap,
    })
    partitions.push(merged)
  }

  // Duplicate vcc/gnd netlabels into all partitions that share the same original
  // network id
  const netlabelBoxes = renetworkedGraph.boxes.filter(
    (b) => b.boxAttributes?.is_net_label,
  )
  for (const nlBox of netlabelBoxes) {
    const pins = renetworkedGraph.pins.filter((p) => p.boxId === nlBox.boxId)
    const pin = pins[0]
    if (!pin) continue
    if (pin.color !== "vcc" && pin.color !== "gnd") continue
    const originalNetId =
      renetworkedNetworkIdMap[pin.networkId] ?? pin.networkId

    for (const part of partitions) {
      const netMatch = part.pins.find(
        (p) =>
          (renetworkedNetworkIdMap[p.networkId] ?? p.networkId) ===
          originalNetId,
      )
      if (!netMatch) continue
      if (part.boxes.some((b) => b.boxId === nlBox.boxId)) continue
      part.boxes.push(structuredClone(nlBox))
      for (const p of pins) {
        const cloned = structuredClone(p)
        cloned.networkId = netMatch.networkId
        part.pins.push(cloned)
      }
    }
  }

  return { partitions, renetworkedGraph, renetworkedNetworkIdMap }
}
