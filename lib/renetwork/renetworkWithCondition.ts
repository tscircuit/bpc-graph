import type { BpcBox, BpcGraph, BpcPin } from "lib/types"

/**
 * Re-network a BPC graph by examining each pair of pins within the same network
 *
 * If the condition returns false, then the pins are considered NOT CONNECTED
 * and we will need to create a new network. When we create this new network,
 * we'll need to test the the condition again with the new network (and repeat)
 *
 * The most common use case is breaking a network into a left and right side
 * because we don't want to keep pins on the other side of the box within the
 * network.
 *
 * So let's say we have a 3 boxes, box1, box2, and box3 arranged in a row.
 * box1.center = { x: -5, y: 0 }
 * box2.center = { x: 0, y: 0 }
 * box3.center = { x: 5, y: 0 }
 *
 * Let's say that box2 has two pins, pin1 and pin2
 * box2.pin1.offset = { x: -0.5, y: 0 }
 * box2.pin2.offset = { x: 0.5, y: 0 }
 *
 * [box1.pin1, box2.pin1, box2.pin2, box3.pin1] compose a network
 *
 * all the pins have the same networkId ("network1")
 *
 * But now we want to create a condition that makes it so that box3.pin1 lives
 * in a different network.
 *
 * conditionStillConnected = (from, to,networkId) => {
 *   const side1 = from.box.center.x + from.pin.offset.x < 0 ? "left" : "right"
 *   const side2 = to.box.center.x + to.pin.offset.x < 0 ? "left" : "right"
 *   return side1 === side2
 * }
 *
 * conditionStillConnected(box1.pin1, box2.pin1, "network1") -> true
 * conditionStillConnected(box1.pin1, box2.pin2, "network1") -> false
 * conditionStillConnected(box1.pin1, box3.pin1, "network1") -> false
 *
 * So we can see that the new networks should be:
 * network1 = [box1.pin1, box2.pin1]
 * network2 = [box2.pin2, box3.pin1]
 *
 */
export const renetworkWithCondition = (
  g: BpcGraph,
  conditionStillConnected: (
    from: { box: BpcBox; pin: BpcPin },
    to: { box: BpcBox; pin: BpcPin },
    networkId: string,
  ) => boolean,
): {
  renetworkedGraph: BpcGraph
  renetworkedNetworkIdMap: Record<string, string>
} => {
  // Clone the graph deeply
  const out: BpcGraph = {
    boxes: g.boxes.map((b) => structuredClone(b)),
    pins: g.pins.map((p) => structuredClone(p)),
  }

  const renetworkedNetworkIdMap: Record<string, string> = {}

  // Build a lookup for boxes by boxId
  const boxById = new Map<string, BpcBox>()
  for (const box of out.boxes) {
    boxById.set(box.boxId, box)
  }

  // For generating unique network ids
  let netIdCounter = 1
  const usedNetIds = new Set<string>(out.pins.map((p) => p.networkId))

  function getFreshNetId(base: string) {
    let candidate: string
    do {
      candidate = `${base}_${netIdCounter++}`
    } while (usedNetIds.has(candidate))
    usedNetIds.add(candidate)
    return candidate
  }

  // For each original network, build connectivity and split into components
  const pinsByNetwork: Record<string, BpcPin[]> = {}
  for (const pin of out.pins) {
    pinsByNetwork[pin.networkId] ??= []
    pinsByNetwork[pin.networkId]!.push(pin)
  }

  for (const [networkId, pins] of Object.entries(pinsByNetwork)) {
    // Build adjacency: pinId -> Set<pinId>
    const adj = new Map<string, Set<string>>()
    for (const pin of pins) adj.set(pin.pinId, new Set())
    for (let i = 0; i < pins.length; i++) {
      for (let j = i + 1; j < pins.length; j++) {
        const pinA = pins[i]!
        const pinB = pins[j]!
        const boxA = boxById.get(pinA.boxId)!
        const boxB = boxById.get(pinB.boxId)!
        if (
          conditionStillConnected(
            { box: boxA, pin: pinA },
            { box: boxB, pin: pinB },
            networkId,
          )
        ) {
          adj.get(pinA.pinId)!.add(pinB.pinId)
          adj.get(pinB.pinId)!.add(pinA.pinId)
        }
      }
    }

    // Find connected components (DFS)
    const pinIdToComponent: Record<string, number> = {}
    let compIdx = 0
    for (const pin of pins) {
      if (pinIdToComponent[pin.pinId] !== undefined) continue
      const stack = [pin.pinId]
      while (stack.length) {
        const pid = stack.pop()!
        if (pinIdToComponent[pid] !== undefined) continue
        pinIdToComponent[pid] = compIdx
        for (const nb of adj.get(pid) ?? []) {
          if (pinIdToComponent[nb] === undefined) stack.push(nb)
        }
      }
      compIdx++
    }

    // Group pins by component
    const pinsByComponent: Record<number, BpcPin[]> = {}
    for (const pin of pins) {
      const c = pinIdToComponent[pin.pinId]!
      pinsByComponent[c] ??= []
      pinsByComponent[c]!.push(pin)
    }

    // Assign networkIds: first component keeps original, others get fresh
    let first = true
    for (const [c, pinsInComp] of Object.entries(pinsByComponent)) {
      let newNetId: string
      if (first) {
        newNetId = networkId
        first = false
      } else {
        newNetId = getFreshNetId(networkId)
      }
      for (const pin of pinsInComp) {
        pin.networkId = newNetId
      }
    }
  }

  return {
    renetworkedGraph: out,
    renetworkedNetworkIdMap,
  }
}
