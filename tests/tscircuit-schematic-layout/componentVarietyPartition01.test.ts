import { expect, test } from "bun:test"
import { renetworkWithCondition, getBoxSideSubgraph } from "lib/index"
import type { BpcGraph } from "lib/types"

/**
 * This test exercises partitioning on a graph that includes a capacitor (C),
 * inductor (L), and a generic IC (U).  VCC/GND should be shared across
 * partitions while a signal net SIG should be split into *_1 per side.
 */

test("componentVarietyPartition01", () => {
  const g: BpcGraph = {
    boxes: [
      { kind: "fixed", boxId: "U", center: { x: 0, y: 0 } },
      { kind: "floating", boxId: "C1" },
      { kind: "floating", boxId: "L1" },
      { kind: "fixed", boxId: "netlabel_VCC", center: { x: -3, y: 2 } },
      { kind: "fixed", boxId: "netlabel_GND", center: { x: -3, y: -2 } },
    ],
    pins: [
      // IC pins
      { boxId: "U", pinId: "VCC_L", networkId: "VCC_NET", color: "orange", offset: { x: -1, y: 1 } },
      { boxId: "U", pinId: "GND_L", networkId: "GND_NET", color: "purple", offset: { x: -1, y: -1 } },
      { boxId: "U", pinId: "SIG_L", networkId: "SIG", color: "blue", offset: { x: -1, y: 0 } },
      { boxId: "U", pinId: "SIG_R", networkId: "SIG", color: "blue", offset: { x: 1, y: 0 } },

      // Capacitor across VCC/GND near left
      { boxId: "C1", pinId: "plus", networkId: "VCC_NET", color: "orange", offset: { x: -4, y: 1 } },
      { boxId: "C1", pinId: "minus", networkId: "GND_NET", color: "purple", offset: { x: -4, y: -1 } },

      // Inductor on right signal
      { boxId: "L1", pinId: "a", networkId: "SIG", color: "blue", offset: { x: 4, y: 0 } },
      { boxId: "L1", pinId: "b", networkId: "SIG_OUT", color: "blue", offset: { x: 5, y: 0 } },

      // Netlabels
      { boxId: "netlabel_VCC", pinId: "pin", networkId: "VCC_NET", color: "orange", offset: { x: 0, y: 0 } },
      { boxId: "netlabel_GND", pinId: "pin", networkId: "GND_NET", color: "purple", offset: { x: 0, y: 0 } },
    ],
  }

  const { renetworkedGraph } = renetworkWithCondition(g, (from, to) => {
    if (from.pin.color === "orange" || from.pin.color === "purple") return true // share VCC/GND
    const fromSide = from.pin.offset.x < 0 ? "left" : "right"
    const toSide = to.pin.offset.x < 0 ? "left" : "right"
    return fromSide === toSide
  })

  // Verify SIG split
  const sigNets = renetworkedGraph.pins
    .filter((p) => p.networkId.startsWith("SIG"))
    .map((p) => p.networkId)
  expect(Array.from(new Set(sigNets)).sort()).toMatchInlineSnapshot(`
    [
      "SIG",
      "SIG_1",
      "SIG_OUT",
    ]
  `)

  // Extract subgraphs and snapshot box ids
  const left = getBoxSideSubgraph({ bpcGraph: renetworkedGraph, boxId: "U", side: "left" })
  const right = getBoxSideSubgraph({ bpcGraph: renetworkedGraph, boxId: "U", side: "right" })

  expect(left.boxes.map((b) => b.boxId).sort()).toMatchInlineSnapshot(`
    [
      "C1",
      "U",
      "netlabel_GND",
      "netlabel_VCC",
    ]
  `)
  expect(right.boxes.map((b) => b.boxId).sort()).toMatchInlineSnapshot(`
    [
      "L1",
      "U",
      "netlabel_GND",
      "netlabel_VCC",
    ]
  `)
})