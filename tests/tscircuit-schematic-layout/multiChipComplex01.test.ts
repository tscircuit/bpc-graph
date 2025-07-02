import { expect, test } from "bun:test"
import {
  renetworkWithCondition,
  getBoxSideSubgraph,
} from "lib/index"
import type { BpcGraph } from "lib/types"

/**
 * Multi-chip scenario: two identical ICs (U1, U2) share VCC / GND nets and a
 * bidirectional BUS net that runs on both sides of each chip.  After
 * renetworking we expect BUS to be split per side (BUS, BUS_1, BUS_2, BUS_3).
 */

test("multiChipComplex01", () => {
  const g: BpcGraph = {
    boxes: [
      { kind: "fixed", boxId: "U1", center: { x: -2, y: 0 } },
      { kind: "fixed", boxId: "U2", center: { x: 2, y: 0 } },
      { kind: "fixed", boxId: "VCC", center: { x: 0, y: 3 } },
      { kind: "fixed", boxId: "GND", center: { x: 0, y: -3 } },
    ],
    pins: [
      // U1 pins
      { boxId: "U1", pinId: "VCC_L", networkId: "VCC_NET", color: "orange", offset: { x: -1, y: 1 } },
      { boxId: "U1", pinId: "GND_L", networkId: "GND_NET", color: "purple", offset: { x: -1, y: -1 } },
      { boxId: "U1", pinId: "BUS_L", networkId: "BUS", color: "blue", offset: { x: -1, y: 0 } },
      { boxId: "U1", pinId: "VCC_R", networkId: "VCC_NET", color: "orange", offset: { x: 1, y: 1 } },
      { boxId: "U1", pinId: "GND_R", networkId: "GND_NET", color: "purple", offset: { x: 1, y: -1 } },
      { boxId: "U1", pinId: "BUS_R", networkId: "BUS", color: "blue", offset: { x: 1, y: 0 } },

      // U2 pins (mirrored)
      { boxId: "U2", pinId: "VCC_L", networkId: "VCC_NET", color: "orange", offset: { x: -1, y: 1 } },
      { boxId: "U2", pinId: "GND_L", networkId: "GND_NET", color: "purple", offset: { x: -1, y: -1 } },
      { boxId: "U2", pinId: "BUS_L", networkId: "BUS", color: "blue", offset: { x: -1, y: 0 } },
      { boxId: "U2", pinId: "VCC_R", networkId: "VCC_NET", color: "orange", offset: { x: 1, y: 1 } },
      { boxId: "U2", pinId: "GND_R", networkId: "GND_NET", color: "purple", offset: { x: 1, y: -1 } },
      { boxId: "U2", pinId: "BUS_R", networkId: "BUS", color: "blue", offset: { x: 1, y: 0 } },

      // Power rail labels
      { boxId: "VCC", pinId: "pin", networkId: "VCC_NET", color: "orange", offset: { x: 0, y: 0 } },
      { boxId: "GND", pinId: "pin", networkId: "GND_NET", color: "purple", offset: { x: 0, y: 0 } },
    ],
  }

  /* ───────────────────────────────── Renetwork ───────────────────────────────── */
  const { renetworkedGraph } = renetworkWithCondition(g, (from, to) => {
    if (from.pin.color === "orange" || from.pin.color === "purple") return true // share power nets
    const fromSide = from.pin.offset.x < 0 ? "left" : "right"
    const toSide = to.pin.offset.x < 0 ? "left" : "right"
    return fromSide === toSide
  })

  const netSet = new Set(renetworkedGraph.pins.map((p) => p.networkId))
  expect(Array.from(netSet).sort()).toMatchInlineSnapshot(`
    [
      "BUS",
      "BUS_1",
      "BUS_2",
      "BUS_3",
      "GND_NET",
      "VCC_NET",
    ]
  `)

  /* ───────────────────────────── Partition U1 & U2 ─────────────────────────── */
  const u1Left = getBoxSideSubgraph({ bpcGraph: renetworkedGraph, boxId: "U1", side: "left" })
  const u1Right = getBoxSideSubgraph({ bpcGraph: renetworkedGraph, boxId: "U1", side: "right" })
  const u2Left = getBoxSideSubgraph({ bpcGraph: renetworkedGraph, boxId: "U2", side: "left" })
  const u2Right = getBoxSideSubgraph({ bpcGraph: renetworkedGraph, boxId: "U2", side: "right" })

  expect(u1Left.pins.map((p) => p.networkId).sort()).toMatchInlineSnapshot(`
    [
      "BUS",
      "GND_NET",
      "VCC_NET",
    ]
  `)
  expect(u1Right.pins.map((p) => p.networkId).sort()).toMatchInlineSnapshot(`
    [
      "BUS_1",
      "GND_NET",
      "VCC_NET",
    ]
  `)
  expect(u2Left.pins.map((p) => p.networkId).sort()).toMatchInlineSnapshot(`
    [
      "BUS_2",
      "GND_NET",
      "VCC_NET",
    ]
  `)
  expect(u2Right.pins.map((p) => p.networkId).sort()).toMatchInlineSnapshot(`
    [
      "BUS_3",
      "GND_NET",
      "VCC_NET",
    ]
  `)
})