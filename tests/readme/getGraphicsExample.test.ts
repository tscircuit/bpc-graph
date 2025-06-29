import { expect, test } from "bun:test"
import { getGraphicsForBpcGraph } from "lib/debug/getGraphicsForBpcGraph"
import { getSvgFromGraphicsObject } from "graphics-debug"
import type { BpcGraph } from "lib/types"

const g: BpcGraph = {
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
  ],
}

test("getGraphicsExample", () => {
  const svg = getSvgFromGraphicsObject(
    getGraphicsForBpcGraph(g, {
      title: "getGraphicsForBpcGraph",
      caption: "Basic graph",
    }),
    {
      backgroundColor: "white",
    },
  )
  expect(svg).toMatchSvgSnapshot(import.meta.path)
})
