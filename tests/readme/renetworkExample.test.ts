import { expect, test } from "bun:test"
import { renetworkWithCondition } from "lib/renetwork/renetworkWithCondition"
import { getGraphicsForBpcGraph } from "lib/debug/getGraphicsForBpcGraph"
import {
  stackGraphicsHorizontally,
  getSvgFromGraphicsObject,
} from "graphics-debug"
import type { BpcGraph } from "lib/types"

test("renetworkExample", () => {
  const g: BpcGraph = {
    boxes: [
      { boxId: "L", kind: "fixed", center: { x: -1, y: 0 } },
      { boxId: "M", kind: "fixed", center: { x: 0, y: 0 } },
      { boxId: "R", kind: "fixed", center: { x: 1, y: 0 } },
    ],
    pins: [
      {
        boxId: "L",
        pinId: "p",
        offset: { x: 0.5, y: 0 },
        color: "red",
        networkId: "net",
      },
      {
        boxId: "M",
        pinId: "p1",
        offset: { x: -0.5, y: 0 },
        color: "red",
        networkId: "net",
      },
      {
        boxId: "M",
        pinId: "p2",
        offset: { x: 0.5, y: 0 },
        color: "red",
        networkId: "net",
      },
      {
        boxId: "R",
        pinId: "p",
        offset: { x: -0.5, y: 0 },
        color: "red",
        networkId: "net",
      },
    ],
  }

  const { renetworkedGraph } = renetworkWithCondition(g, (from, to) => {
    const side = (p: {
      box: { center?: { x: number } }
      pin: { offset: { x: number } }
    }) => ((p.box.center?.x ?? 0) + p.pin.offset.x < 0 ? "left" : "right")
    return side(from) === side(to)
  })

  const svg = getSvgFromGraphicsObject(
    stackGraphicsHorizontally([
      getGraphicsForBpcGraph(g, { title: "Original" }),
      getGraphicsForBpcGraph(renetworkedGraph, { title: "Renetworked" }),
    ]),
    { backgroundColor: "white" },
  )

  expect(svg).toMatchSvgSnapshot(import.meta.path)
})
