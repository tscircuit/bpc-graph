import { expect, test } from "bun:test"
import { renetworkWithCondition, getBoxSideSubgraph } from "lib/index"
import type { BpcGraph } from "lib/types"

/**
 * Scenario: A chip has VCC (orange) and GND (purple) pins on *both* sides.
 * A single net-label symbol is connected to each net.  The partitioner should
 * duplicate VCC / GND pins & net-labels into *both* side-sub-graphs.
 */

test("vccgndHandling01", () => {
  const g: BpcGraph = {
    boxes: [
      { kind: "fixed", boxId: "U1", center: { x: 0, y: 0 } },
      { kind: "fixed", boxId: "netlabel_VCC", center: { x: -3, y: 1 } },
      { kind: "fixed", boxId: "netlabel_GND", center: { x: -3, y: -1 } },
    ],
    pins: [
      // Left-side power pins
      { boxId: "U1", pinId: "VCC_L", networkId: "NET_VCC", color: "orange", offset: { x: -1, y: 1 } },
      { boxId: "U1", pinId: "GND_L", networkId: "NET_GND", color: "purple", offset: { x: -1, y: -1 } },

      // Right-side power pins
      { boxId: "U1", pinId: "VCC_R", networkId: "NET_VCC", color: "orange", offset: { x: 1, y: 1 } },
      { boxId: "U1", pinId: "GND_R", networkId: "NET_GND", color: "purple", offset: { x: 1, y: -1 } },

      // Net-label attachment pins (treated as pins on their own boxes)
      { boxId: "netlabel_VCC", pinId: "pin", networkId: "NET_VCC", color: "orange", offset: { x: 0, y: 0 } },
      { boxId: "netlabel_GND", pinId: "pin", networkId: "NET_GND", color: "purple", offset: { x: 0, y: 0 } },
    ],
  }

  const centre = g.boxes.find((b) => b.boxId === "U1")!.center!

  /** Re-network with the same rule as main pipeline (share VCC/GND globally) */
  const { renetworkedGraph } = renetworkWithCondition(g, (from, to) => {
    if (from.pin.color === "orange" || from.pin.color === "purple") return true
    const fromSide = from.pin.offset.x < 0 ? "left" : "right"
    const toSide = to.pin.offset.x < 0 ? "left" : "right"
    return fromSide === toSide
  })

  const leftSub = getBoxSideSubgraph({ bpcGraph: renetworkedGraph, boxId: "U1", side: "left" })
  const rightSub = getBoxSideSubgraph({ bpcGraph: renetworkedGraph, boxId: "U1", side: "right" })

  /* ------------------------------------------------------------------ */
  /* Assertions                                                          */
  /* ------------------------------------------------------------------ */

  // 1. Net-label boxes must appear in *both* sub-graphs
  const boxesLeft = leftSub.boxes.map((b) => b.boxId).sort()
  const boxesRight = rightSub.boxes.map((b) => b.boxId).sort()
  expect(boxesLeft).toMatchInlineSnapshot(`
    [
      "U1",
      "netlabel_GND",
      "netlabel_VCC",
    ]
  `)
  expect(boxesRight).toMatchInlineSnapshot(`
    [
      "U1",
      "netlabel_GND",
      "netlabel_VCC",
    ]
  `)

  // 2. Each sub-graph should contain exactly 4 pins (2 power pins + 2 net-labels)
  expect(leftSub.pins.length).toBe(4)
  expect(rightSub.pins.length).toBe(4)
})