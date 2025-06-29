import type { BpcGraph } from "lib/types"

export const mergeBoxSideSubgraphs = (
  graphs: BpcGraph[],
  {
    renetworkedNetworkIdMap,
  }: {
    renetworkedNetworkIdMap?: Record<string, string>
  } = {},
): BpcGraph => {
  renetworkedNetworkIdMap ??= {}

  const merged: BpcGraph = { boxes: [], pins: [] }
  const boxMap = new Map<string, BpcGraph["boxes"][0]>()
  const pinMap = new Map<string, BpcGraph["pins"][0]>()

  for (const g of graphs) {
    for (const box of g.boxes) {
      if (!boxMap.has(box.boxId)) boxMap.set(box.boxId, structuredClone(box))
    }
    for (const pin of g.pins) {
      if (!pinMap.has(pin.pinId)) pinMap.set(pin.pinId, structuredClone(pin))
    }
  }

  merged.boxes = Array.from(boxMap.values())
  merged.pins = Array.from(pinMap.values())

  return merged
}
