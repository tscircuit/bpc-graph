import { expect, test } from "bun:test"
import { partitionBoxSides } from "lib/index"
import type { BpcGraph } from "lib/types"

// Simple graph with one VCC net label shared across both sides
const g: BpcGraph = {
  boxes: [
    { boxId: "U1", kind: "fixed", center: { x: 0, y: 0 } },
    {
      boxId: "VCC",
      kind: "fixed",
      center: { x: -1.5, y: 0 },
      boxAttributes: { is_net_label: true },
    },
  ],
  pins: [
    {
      boxId: "U1",
      pinId: "L",
      networkId: "N1",
      color: "vcc",
      offset: { x: -1, y: 0 },
    },
    {
      boxId: "U1",
      pinId: "R",
      networkId: "N1",
      color: "vcc",
      offset: { x: 1, y: 0 },
    },
    {
      boxId: "VCC",
      pinId: "P",
      networkId: "N1",
      color: "vcc",
      offset: { x: 0, y: 0 },
    },
  ],
}

test("partitionBoxSides duplicates shared vcc label", () => {
  const { partitions } = partitionBoxSides(g, "U1")
  const boxSets = partitions.map((p) => p.boxes.map((b) => b.boxId).sort())
  expect(boxSets).toMatchInlineSnapshot(`
    [
      [
        "U1",
        "VCC",
      ],
      [
        "U1",
        "VCC",
      ],
    ]
  `)
})
