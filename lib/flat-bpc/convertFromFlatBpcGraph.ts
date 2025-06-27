import { type FlatBpcGraph, type MixedBpcGraph, type Vec2 } from "lib/types"

export const convertFromFlatBpcGraph = (flat: FlatBpcGraph): MixedBpcGraph => {
  const boxes: MixedBpcGraph["boxes"] = []
  const pins: MixedBpcGraph["pins"] = []

  /* ------------------------------------------------------------------ */
  /*  Build Box lookup & objects                                        */
  /* ------------------------------------------------------------------ */
  const boxNodeMap = new Map<string, { x?: number; y?: number }>()
  for (const n of flat.nodes.filter((n) => n.color === "box")) {
    boxNodeMap.set(n.id, { x: n.x, y: n.y })
    if (n.x !== undefined && n.y !== undefined) {
      boxes.push({
        kind: "fixed",
        boxId: n.id,
        center: { x: n.x, y: n.y },
      })
    } else {
      boxes.push({
        kind: "floating",
        boxId: n.id,
        center:
          n.x !== undefined && n.y !== undefined
            ? { x: n.x, y: n.y }
            : undefined,
      })
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Identify connected components of pin nodes                        */
  /* ------------------------------------------------------------------ */
  const pinNodes = flat.nodes.filter((n) => n.color !== "box")
  const adjacency = new Map<string, Set<string>>()
  for (const n of pinNodes) adjacency.set(n.id, new Set())
  for (const [a, b] of flat.undirectedEdges) {
    adjacency.get(a)?.add(b)
    adjacency.get(b)?.add(a)
  }

  const networkIdByPin: Record<string, string> = {}
  let netCounter = 0
  for (const n of pinNodes) {
    if (networkIdByPin[n.id]) continue
    const netId = `net${netCounter++}`
    const stack = [n.id]
    while (stack.length) {
      const current = stack.pop()!
      if (networkIdByPin[current]) continue
      networkIdByPin[current] = netId
      for (const nb of adjacency.get(current) ?? []) stack.push(nb)
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Build Pin objects                                                 */
  /* ------------------------------------------------------------------ */
  function getOffset(
    p: { x?: number; y?: number },
    bCenter?: Partial<Vec2>,
  ): Vec2 {
    if (
      p.x !== undefined &&
      p.y !== undefined &&
      bCenter &&
      bCenter.x !== undefined &&
      bCenter.y !== undefined
    ) {
      return { x: p.x - bCenter.x, y: p.y - bCenter.y }
    }
    return { x: 0, y: 0 }
  }

  for (const n of pinNodes) {
    const dashIdx = n.id.indexOf("-")
    if (dashIdx === -1)
      throw new Error(`Invalid pin node id "${n.id}" – no dash separator`)
    const boxId = n.id.slice(0, dashIdx)
    const pinId = n.id.slice(dashIdx + 1)

    const bCenter = boxNodeMap.get(boxId)!
    pins.push({
      boxId,
      pinId,
      color: n.color,
      networkId: networkIdByPin[n.id]!,
      offset: getOffset(n, bCenter),
    })
  }

  return { boxes, pins }
}
