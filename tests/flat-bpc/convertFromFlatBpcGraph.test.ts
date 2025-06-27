import { expect, test } from "bun:test"
import { convertFromFlatBpcGraph } from "lib/flat-bpc/convertFromFlatBpcGraph"

const flat = {
  nodes: [
    { id: "B1", color: "box", x: 0, y: 0 },
    { id: "B1-P1", color: "red", x: 1, y: 0 },
    { id: "B1-P2", color: "green", x: 0, y: 1 },
    { id: "B1-P3", color: "blue", x: 2, y: 0 },
  ],
  undirectedEdges: [
    ["B1-P1", "B1-P3"],
    ["B1-P3", "B1-P2"],
  ],
}

test("convertFromFlatBpcGraph reconstructs boxes and pins", () => {
  const mixed = convertFromFlatBpcGraph(flat)

  expect(mixed.boxes.length).toBe(1)
  const box = mixed.boxes[0]
  expect(box.kind).toBe("fixed")
  // @ts-ignore – box.center only exists on fixed boxes
  expect(box.center).toEqual({ x: 0, y: 0 })

  expect(mixed.pins.length).toBe(3)

  // All pins should share the same inferred networkId
  const networkIds = new Set(mixed.pins.map((p) => p.networkId))
  expect(networkIds.size).toBe(1)

  const p1 = mixed.pins.find((p) => p.pinId === "P1")!
  expect(p1.offset).toEqual({ x: 1, y: 0 })
})
