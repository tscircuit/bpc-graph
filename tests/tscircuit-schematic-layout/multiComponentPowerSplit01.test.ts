import { expect, test } from "bun:test"
import { renetworkWithCondition, getBoxSideSubgraph } from "lib/index"
import type { BpcGraph } from "lib/types"

/**
 * Complex scenario: IC + capacitor + resistor + power net-labels.
 *   SIG net connects to pins on both sides – should be split by renetworking.
 *   VCC / GND stay common.
 */

test("multiComponentPowerSplit01", () => {
  const g: BpcGraph = {
    boxes: [
      { kind: "fixed", boxId: "U", center: { x: 0, y: 0 } },
      { kind: "floating", boxId: "C1" },
      { kind: "floating", boxId: "R1" },
      { kind: "fixed", boxId: "net_VCC", center: { x: -4, y: 2 } },
      { kind: "fixed", boxId: "net_GND", center: { x: -4, y: -2 } },
    ],
    pins: [
      // IC pins (power + signal both sides)
      { boxId: "U", pinId: "VCC_L", networkId: "VCC_NET", color: "orange", offset: { x: -1, y: 1 } },
      { boxId: "U", pinId: "GND_L", networkId: "GND_NET", color: "purple", offset: { x: -1, y: -1 } },
      { boxId: "U", pinId: "SIG_L", networkId: "SIG", color: "blue", offset: { x: -1, y: 0 } },
      { boxId: "U", pinId: "VCC_R", networkId: "VCC_NET", color: "orange", offset: { x: 1, y: 1 } },
      { boxId: "U", pinId: "GND_R", networkId: "GND_NET", color: "purple", offset: { x: 1, y: -1 } },
      { boxId: "U", pinId: "SIG_R", networkId: "SIG", color: "blue", offset: { x: 1, y: 0 } },

      // Decoupling capacitor on VCC/GND (near left)
      { boxId: "C1", pinId: "plus", networkId: "VCC_NET", color: "orange", offset: { x: -3, y: 1 } },
      { boxId: "C1", pinId: "minus", networkId: "GND_NET", color: "purple", offset: { x: -3, y: -1 } },

      // Pull-down resistor on right SIG
      { boxId: "R1", pinId: "a", networkId: "SIG", color: "blue", offset: { x: 3, y: 0 } },
      { boxId: "R1", pinId: "b", networkId: "GND_NET", color: "purple", offset: { x: 3, y: -1 } },

      // Power net-labels
      { boxId: "net_VCC", pinId: "pin", networkId: "VCC_NET", color: "orange", offset: { x: 0, y: 0 } },
      { boxId: "net_GND", pinId: "pin", networkId: "GND_NET", color: "purple", offset: { x: 0, y: 0 } },
    ],
  }

  /* ------------------------------------------------------------------ */
  /* 1. Renetwork                                                        */
  /* ------------------------------------------------------------------ */
  const { renetworkedGraph } = renetworkWithCondition(g, (from, to) => {
    if (from.pin.color === "orange" || from.pin.color === "purple") return true // share power nets
    const fromSide = from.pin.offset.x < 0 ? "left" : "right"
    const toSide = to.pin.offset.x < 0 ? "left" : "right"
    return fromSide === toSide
  })

  const netsAfter = Array.from(new Set(renetworkedGraph.pins.map((p) => p.networkId))).sort()
  expect(netsAfter).toMatchInlineSnapshot(`
    [
      "GND_NET",
      "SIG",
      "SIG_1",
      "VCC_NET",
    ]
  `)

  /* ------------------------------------------------------------------ */
  /* 2. Partition                                                       */
  /* ------------------------------------------------------------------ */
  const left = getBoxSideSubgraph({ bpcGraph: renetworkedGraph, boxId: "U", side: "left" })
  const right = getBoxSideSubgraph({ bpcGraph: renetworkedGraph, boxId: "U", side: "right" })

  expect(left.boxes.map((b) => b.boxId).sort()).toMatchInlineSnapshot(`
    [
      "C1",
      "U",
      "net_GND",
      "net_VCC",
    ]
  `)
  expect(right.boxes.map((b) => b.boxId).sort()).toMatchInlineSnapshot(`
    [
      "R1",
      "U",
      "net_GND",
      "net_VCC",
    ]
  `)

  expect(left.pins.map((p) => p.networkId).sort()).toMatchInlineSnapshot(`
    [
      "GND_NET",
      "SIG",
      "VCC_NET",
    ]
  `)
  expect(right.pins.map((p) => p.networkId).sort()).toMatchInlineSnapshot(`
    [
      "GND_NET",
      "SIG_1",
      "VCC_NET",
    ]
  `)
})