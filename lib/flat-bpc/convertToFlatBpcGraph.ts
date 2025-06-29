import { type FlatBpcGraph, type MixedBpcGraph, type Vec2 } from "lib/types"

export const convertToFlatBpcGraph = (mixed: MixedBpcGraph): FlatBpcGraph => {
  const nodes: FlatBpcGraph["nodes"] = []
  const undirectedEdges: FlatBpcGraph["undirectedEdges"] = []

  /* ------------------------------------------------------------------ */
  /*  Boxes → nodes                                                     */
  /* ------------------------------------------------------------------ */
  const boxCenterMap = new Map<string, Vec2 | undefined>()
  for (const box of mixed.boxes) {
    if (box.kind === "fixed") boxCenterMap.set(box.boxId, box.center)
    else boxCenterMap.set(box.boxId, box.center) // may be undefined

    nodes.push({
      id: box.boxId,
      boxId: box.boxId,
      color: "box",
      x: box.center?.x,
      y: box.center?.y,
    })
  }

  /* ------------------------------------------------------------------ */
  /*  Pins → nodes                                                      */
  /* ------------------------------------------------------------------ */
  type PinsByNetwork = Record<string, string[]> // networkId → pin-nodeIds[]
  const pinsByNetwork: PinsByNetwork = {}

  for (const pin of mixed.pins) {
    const nodeId = `${pin.boxId}-${pin.pinId}`
    const bCenter = boxCenterMap.get(pin.boxId)
    nodes.push({
      id: nodeId,
      boxId: pin.boxId,
      pinId: pin.pinId,
      color: pin.color,
      x: bCenter ? bCenter.x + pin.offset.x : undefined,
      y: bCenter ? bCenter.y + pin.offset.y : undefined,
    })

    pinsByNetwork[pin.boxId] ??= []
    pinsByNetwork[pin.boxId]!.push(nodeId)

    pinsByNetwork[pin.networkId] ??= []
    pinsByNetwork[pin.networkId]!.push(nodeId)
  }

  /* ------------------------------------------------------------------ */
  /*  NetworkIds → fully-connected edges                                */
  /* ------------------------------------------------------------------ */
  for (const nodeIds of Object.values(pinsByNetwork)) {
    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = i + 1; j < nodeIds.length; j++) {
        undirectedEdges.push([nodeIds[i]!, nodeIds[j]!])
      }
    }
  }

  return { nodes, undirectedEdges }
}
