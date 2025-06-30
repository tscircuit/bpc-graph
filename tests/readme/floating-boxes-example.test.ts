import { expect, test } from "bun:test"
import { getGraphicsForBpcGraph } from "lib/debug/getGraphicsForBpcGraph"
import {
  getSvgFromGraphicsObject,
  stackGraphicsHorizontally,
} from "graphics-debug"
import type { BpcGraph } from "lib/types"
import { assignFloatingBoxPositions } from "lib/bpc-graph-editing/assignFloatingBoxPositions"

const floatingGraph: BpcGraph = {
  boxes: [
    { boxId: "A", kind: "floating" },
    { boxId: "B", kind: "floating" },
  ],
  pins: [
    {
      boxId: "A",
      pinId: "P1",
      offset: { x: 0.5, y: 0.25 },
      color: "red",
      networkId: "N1",
    },
    {
      boxId: "A",
      pinId: "P2",
      offset: { x: 0.5, y: -0.25 },
      color: "blue",
      networkId: "N2",
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
      pinId: "CENTER",
      offset: { x: 0, y: 0 },
      color: "gray",
      networkId: "N3",
    },
    {
      boxId: "B",
      pinId: "CENTER",
      offset: { x: 0, y: 0 },
      color: "gray",
      networkId: "N4",
    },
  ],
}

test("floating boxes example", () => {
  // Convert floating boxes to fixed positions
  const fixedGraph = assignFloatingBoxPositions(floatingGraph)

  expect(fixedGraph.boxes).toMatchInlineSnapshot(`
    [
      {
        "boxId": "A",
        "center": {
          "x": -1,
          "y": -0.25,
        },
        "kind": "fixed",
      },
      {
        "boxId": "B",
        "center": {
          "x": 0,
          "y": 0,
        },
        "kind": "fixed",
      },
    ]
  `)

  const svg = getSvgFromGraphicsObject(
    stackGraphicsHorizontally([
      getGraphicsForBpcGraph(floatingGraph, { title: "Floating Boxes" }),
      getGraphicsForBpcGraph(fixedGraph, { title: "Fixed Positions" }),
    ]),
    {
      backgroundColor: "white",
      includeTextLabels: false,
      svgHeight: 320,
      svgWidth: 800,
    },
  )
  expect(svg).toMatchSvgSnapshot(import.meta.path)
})
