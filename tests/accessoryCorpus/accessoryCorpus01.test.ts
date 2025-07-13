import { test, expect } from "bun:test"
import { layoutSchematicGraph } from "lib/index"
import type { MixedBpcGraph, FixedBpcGraph } from "lib/types"

const floatingGraph: MixedBpcGraph = {
  boxes: [{ boxId: "U1", kind: "floating", center: { x: 0, y: 0 } }],
  pins: [
    {
      boxId: "U1",
      pinId: "p1",
      networkId: "N1",
      color: "sig",
      offset: { x: -1, y: 1 },
    },
    {
      boxId: "U1",
      pinId: "p2",
      networkId: "N2",
      color: "sig",
      offset: { x: 1, y: 1 },
    },
    {
      boxId: "U1",
      pinId: "p3",
      networkId: "N2",
      color: "sig",
      offset: { x: 1, y: -1 },
    },
    {
      boxId: "U1",
      pinId: "p4",
      networkId: "N2",
      color: "sig",
      offset: { x: 1, y: 0 },
    },
    {
      boxId: "U1",
      pinId: "center",
      networkId: "C",
      color: "component_center",
      offset: { x: 0, y: 0 },
    },
  ],
}

const corpusLeft: FixedBpcGraph = {
  boxes: [{ boxId: "U1", kind: "fixed", center: { x: 0, y: 0 } }],
  pins: [
    {
      boxId: "U1",
      pinId: "p1",
      networkId: "N1",
      color: "sig",
      offset: { x: -1, y: 1 },
    },
    {
      boxId: "U1",
      pinId: "center",
      networkId: "C",
      color: "component_center",
      offset: { x: 0, y: 0 },
    },
  ],
}

const corpusRight: FixedBpcGraph = {
  boxes: [{ boxId: "U1", kind: "fixed", center: { x: 0, y: 0 } }],
  pins: [
    {
      boxId: "U1",
      pinId: "p2",
      networkId: "N2",
      color: "sig",
      offset: { x: 1, y: 1 },
    },
    {
      boxId: "U1",
      pinId: "p3",
      networkId: "N2",
      color: "sig",
      offset: { x: 1, y: -1 },
    },
    {
      boxId: "U1",
      pinId: "p4",
      networkId: "N2",
      color: "sig",
      offset: { x: 1, y: 0 },
    },
    {
      boxId: "U1",
      pinId: "center",
      networkId: "C",
      color: "component_center",
      offset: { x: 0, y: 0 },
    },
  ],
}

const accessoryLeft: FixedBpcGraph = {
  boxes: [{ boxId: "NL1", kind: "fixed", center: { x: -2, y: 0 } }],
  pins: [
    {
      boxId: "NL1",
      pinId: "n",
      networkId: "N1",
      color: "netlabel",
      offset: { x: 0, y: 0 },
    },
  ],
}

test("accessoryCorpus01", () => {
  const { accessoryFixedGraph } = layoutSchematicGraph(floatingGraph, {
    corpus: { left: corpusLeft, right: corpusRight },
    accessoryCorpus: { left: accessoryLeft },
    centerPinColors: ["component_center"],
  })

  expect(accessoryFixedGraph?.boxes.length).toBe(1)
  expect(accessoryFixedGraph?.pins.length).toBe(1)
})
