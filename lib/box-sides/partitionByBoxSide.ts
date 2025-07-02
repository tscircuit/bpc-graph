import { getBoxSideSubgraph, type Side } from "./getBoxSideSubgraph"
import { renetworkWithCondition } from "../renetwork/renetworkWithCondition"
import type { BpcGraph } from "../types"

export const partitionByBoxSide = (bpcGraph: BpcGraph, boxId: string) => {
  const center = bpcGraph.boxes.find((b) => b.boxId === boxId)?.center
  if (!center) throw new Error(`box ${boxId} missing center`)

  const { renetworkedGraph, renetworkedNetworkIdMap } = renetworkWithCondition(
    bpcGraph,
    (from, to) => {
      if (!from.box.center || !to.box.center) return true
      const fromSide =
        from.box.center.x + from.pin.offset.x < center.x ? "left" : "right"
      const toSide =
        to.box.center.x + to.pin.offset.x < center.x ? "left" : "right"
      return fromSide === toSide
    },
  )

  const left = getBoxSideSubgraph({
    bpcGraph: renetworkedGraph,
    boxId,
    side: "left",
  })
  const right = getBoxSideSubgraph({
    bpcGraph: renetworkedGraph,
    boxId,
    side: "right",
  })

  const powerNetLabels = renetworkedGraph.boxes.filter(
    (b) =>
      b.boxAttributes?.is_net_label &&
      ["vcc", "gnd"].includes(
        renetworkedGraph.pins.find(
          (p) => p.boxId === b.boxId && p.pinId.endsWith("_pin"),
        )?.color ?? "",
      ),
  )

  for (const sub of [left, right]) {
    for (const box of powerNetLabels) {
      if (!sub.boxes.some((b) => b.boxId === box.boxId)) {
        sub.boxes.push(structuredClone(box))
        for (const pin of renetworkedGraph.pins.filter(
          (p) => p.boxId === box.boxId,
        )) {
          sub.pins.push(structuredClone(pin))
        }
      }
    }
  }

  return {
    leftSubgraph: left,
    rightSubgraph: right,
    renetworkedGraph,
    renetworkedNetworkIdMap,
  }
}
