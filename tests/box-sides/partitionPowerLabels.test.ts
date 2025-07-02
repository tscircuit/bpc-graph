import { test, expect } from "bun:test"
import type { BpcGraph } from "lib/types"
import { partitionBoxSides } from "lib/index"

const buildGraph = (): BpcGraph => ({
  boxes: [
    { kind: "fixed", boxId: "chip", center: { x: 0, y: 0 } },
    {
      kind: "fixed",
      boxId: "vcc_label",
      center: { x: 2, y: 1 },
      boxAttributes: { is_net_label: true },
    },
    { kind: "fixed", boxId: "left", center: { x: -2, y: 0 } },
    { kind: "fixed", boxId: "right", center: { x: 4, y: 0 } },
  ],
  pins: [
    {
      boxId: "chip",
      pinId: "L",
      networkId: "VCC",
      color: "normal",
      offset: { x: -1, y: 0 },
    },
    {
      boxId: "chip",
      pinId: "R",
      networkId: "VCC",
      color: "normal",
      offset: { x: 1, y: 0 },
    },
    {
      boxId: "vcc_label",
      pinId: "v",
      networkId: "VCC",
      color: "vcc",
      offset: { x: 0, y: 0 },
    },
    {
      boxId: "left",
      pinId: "p1",
      networkId: "VCC",
      color: "normal",
      offset: { x: 1, y: 0 },
    },
    {
      boxId: "right",
      pinId: "p1",
      networkId: "VCC",
      color: "normal",
      offset: { x: -1, y: 0 },
    },
  ],
})

test("partitionBoxSides duplicates power net labels", () => {
  const { subgraphs } = partitionBoxSides(buildGraph(), "chip")
  expect(subgraphs).toHaveLength(2)
  const labelCounts = subgraphs.map(
    (g) => g.boxes.filter((b) => b.boxId === "vcc_label").length,
  )
  expect(labelCounts).toEqual([1, 1])
})
