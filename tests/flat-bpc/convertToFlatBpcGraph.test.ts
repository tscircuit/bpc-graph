import { expect, test } from "bun:test"
import { convertToFlatBpcGraph } from "lib/flat-bpc/convertToFlatBpcGraph"
import type { MixedBpcGraph } from "lib/types"

const mixed = {
  boxes: [
    { kind: "fixed", boxId: "B1", center: { x: 0, y: 0 } },
    { kind: "floating", boxId: "B2" },
  ],
  pins: [
    {
      boxId: "B1",
      pinId: "P1",
      networkId: "N1",
      color: "red",
      offset: { x: 1, y: 0 },
    },
    {
      boxId: "B2",
      pinId: "P2",
      networkId: "N1",
      color: "blue",
      offset: { x: 0, y: 0 },
    },
    {
      boxId: "B1",
      pinId: "P3",
      networkId: "N2",
      color: "green",
      offset: { x: 0, y: 1 },
    },
  ],
}

test("convertToFlatBpcGraph generates correct nodes and edges", () => {
  const flat = convertToFlatBpcGraph(mixed as MixedBpcGraph)

  // 2 boxes + 3 pins
  expect(flat.nodes.length).toBe(5)

  // N1 has 2 pins → 1 edge, N2 single pin → 0 edges
  expect(flat.undirectedEdges.length).toBe(1)
  expect(flat.undirectedEdges[0]).toEqual(["B1-P1", "B2-P2"])

  const boxNode = flat.nodes.find((n) => n.id === "B1")!
  expect(boxNode.color).toBe("box")

  const pinNode = flat.nodes.find((n) => n.id === "B1-P1")!
  expect(pinNode.x).toBe(1)
  expect(pinNode.y).toBe(0)
})
