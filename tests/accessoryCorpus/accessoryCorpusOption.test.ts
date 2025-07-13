import { test, expect } from "bun:test"
import { layoutSchematicGraph } from "lib/index"
import type { MixedBpcGraph, FixedBpcGraph } from "lib/types"

const floatingGraph: MixedBpcGraph = {
  boxes: [{ boxId: "U1", kind: "floating", center: { x: 0, y: 0 } }],
  pins: [
    {
      boxId: "U1",
      pinId: "L1",
      networkId: "n1",
      color: "c1",
      offset: { x: -1, y: 0 },
    },
    {
      boxId: "U1",
      pinId: "L2",
      networkId: "n2",
      color: "c2",
      offset: { x: -1, y: 1 },
    },
    {
      boxId: "U1",
      pinId: "R1",
      networkId: "n3",
      color: "c1",
      offset: { x: 1, y: 0 },
    },
    {
      boxId: "U1",
      pinId: "R2",
      networkId: "n4",
      color: "c2",
      offset: { x: 1, y: -1 },
    },
  ],
}

const leftCorpusGraph: FixedBpcGraph = {
  boxes: [{ boxId: "U1", kind: "fixed", center: { x: 0, y: 0 } }],
  pins: [
    {
      boxId: "U1",
      pinId: "P1",
      networkId: "a1",
      color: "c1",
      offset: { x: 1, y: 0 },
    },
    {
      boxId: "U1",
      pinId: "P2",
      networkId: "a2",
      color: "c2",
      offset: { x: 1, y: 1 },
    },
    {
      boxId: "U1",
      pinId: "P3",
      networkId: "a3",
      color: "c3",
      offset: { x: 1, y: 2 },
    },
  ],
}

const rightCorpusGraph: FixedBpcGraph = {
  boxes: [{ boxId: "U1", kind: "fixed", center: { x: 0, y: 0 } }],
  pins: [
    {
      boxId: "U1",
      pinId: "P1",
      networkId: "b1",
      color: "c1",
      offset: { x: 1, y: 0 },
    },
    {
      boxId: "U1",
      pinId: "P2",
      networkId: "b2",
      color: "c3",
      offset: { x: 1, y: -1 },
    },
  ],
}

test("accessoryCorpus merges with main corpus", () => {
  const resultWith = layoutSchematicGraph(floatingGraph, {
    corpus: { left: leftCorpusGraph },
    accessoryCorpus: { right: rightCorpusGraph },
  })

  const resultUnion = layoutSchematicGraph(floatingGraph, {
    corpus: { left: leftCorpusGraph, right: rightCorpusGraph },
  })

  expect(resultWith.distance).toBeCloseTo(resultUnion.distance)
})
