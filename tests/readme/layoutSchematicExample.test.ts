import { expect, test } from "bun:test"
import { getSvgFromGraphicsObject } from "graphics-debug"
import { getGraphicsForBpcGraph, layoutSchematicGraph } from "lib/index"
import type { BpcGraph, FixedBpcGraph } from "lib/types"

const floatingGraph: BpcGraph = {
  boxes: [
    { boxId: "A", kind: "floating" },
    { boxId: "B", kind: "floating" },
  ],
  pins: [
    {
      boxId: "A",
      pinId: "P1",
      offset: { x: 0.5, y: 0 },
      color: "red",
      networkId: "N1",
    },
    {
      boxId: "B",
      pinId: "P1",
      offset: { x: -0.5, y: 0 },
      color: "red",
      networkId: "N1",
    },
    {
      boxId: "A",
      pinId: "P2",
      offset: { x: 0, y: 0 },
      color: "blue",
      networkId: "N2",
    },
    {
      boxId: "B",
      pinId: "P2",
      offset: { x: 0, y: 0 },
      color: "blue",
      networkId: "N2",
    },
  ],
}

const corpus: Record<string, FixedBpcGraph> = {
  Example: {
    boxes: [
      { boxId: "A", kind: "fixed", center: { x: 0, y: 0 } },
      { boxId: "B", kind: "fixed", center: { x: 2, y: 0 } },
    ],
    pins: [
      {
        boxId: "A",
        pinId: "P1",
        offset: { x: 0.5, y: 0 },
        color: "red",
        networkId: "N1",
      },
      {
        boxId: "B",
        pinId: "P1",
        offset: { x: -0.5, y: 0 },
        color: "red",
        networkId: "N1",
      },
      {
        boxId: "A",
        pinId: "P2",
        offset: { x: 0, y: 0 },
        color: "blue",
        networkId: "N2",
      },
      {
        boxId: "B",
        pinId: "P2",
        offset: { x: 0, y: 0 },
        color: "blue",
        networkId: "N2",
      },
    ],
  },
}

test("layoutSchematicGraph example", () => {
  const { fixedGraph } = layoutSchematicGraph(floatingGraph, { corpus })
  const svg = getSvgFromGraphicsObject(getGraphicsForBpcGraph(fixedGraph), {
    backgroundColor: "white",
    includeTextLabels: true,
  })
  expect(svg).toMatchSvgSnapshot(import.meta.path)
})
