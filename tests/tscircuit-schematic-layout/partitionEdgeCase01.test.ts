import { expect, test } from "bun:test"
import { renetworkWithCondition, getBoxSideSubgraph } from "lib/index"
import type { BpcGraph } from "lib/types"

/**
 * Edge-case: a bidirectional signal net runs to *both* sides of a chip but is
 * *not* a power net.  After renetworking, the net must be split into NET_SIG_L
 * and NET_SIG_R so that each side-subgraph is completely independent.
 */

test("partitionEdgeCase01", () => {
  const g: BpcGraph = {
    boxes: [{ kind: "fixed", boxId: "U1", center: { x: 0, y: 0 } }],
    pins: [
      { boxId: "U1", pinId: "SIG_L", networkId: "NET_SIG", color: "blue", offset: { x: -1, y: 0 } },
      { boxId: "U1", pinId: "SIG_R", networkId: "NET_SIG", color: "blue", offset: { x: 1, y: 0 } },
    ],
  }

  const { renetworkedGraph } = renetworkWithCondition(g, (from, to) => {
    // Only keep nets together when pins are on the same horizontal side
    const fromSide = from.pin.offset.x < 0 ? "left" : "right"
    const toSide = to.pin.offset.x < 0 ? "left" : "right"
    return fromSide === toSide
  })

  // Collect unique networks after renetworking
  const nets = Array.from(new Set(renetworkedGraph.pins.map((p) => p.networkId))).sort()
  expect(nets).toMatchInlineSnapshot(`
    [
      "NET_SIG_1",
      "NET_SIG",
    ]
  `)

  // Extract sub-graphs
  const left = getBoxSideSubgraph({ bpcGraph: renetworkedGraph, boxId: "U1", side: "left" })
  const right = getBoxSideSubgraph({ bpcGraph: renetworkedGraph, boxId: "U1", side: "right" })

  expect(left.pins.map((p) => p.networkId)).toMatchInlineSnapshot(`
    [
      "NET_SIG",
    ]
  `)
  expect(right.pins.map((p) => p.networkId)).toMatchInlineSnapshot(`
    [
      "NET_SIG_1",
    ]
  `)
})