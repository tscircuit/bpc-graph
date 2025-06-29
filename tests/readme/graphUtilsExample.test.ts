import { expect, test } from "bun:test"
import {
  stackGraphicsHorizontally,
  getSvgFromGraphicsObject,
} from "graphics-debug"
import { getGraphicsForBpcGraph } from "lib/debug/getGraphicsForBpcGraph"
import { getGraphBounds } from "lib/graph-utils/getGraphBounds"
import { getPinPosition } from "lib/graph-utils/getPinPosition"
import { getPinDirection } from "lib/graph-utils/getPinDirection"
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

test("graphUtilsExample", () => {
  const bounds = getGraphBounds(g)
  const pos = getPinPosition(g, "P1")
  const dir = getPinDirection(g, "P1")

  const original = getGraphicsForBpcGraph(g, { title: "Original" })
  const withInfo = getGraphicsForBpcGraph(g, {
    title: "With Info",
    caption: `bounds: [${bounds.minX}, ${bounds.minY}] - [${bounds.maxX}, ${bounds.maxY}]\nP1@${pos.x},${pos.y} dir:${dir}`,
  })
  withInfo.rects.push({
    center: {
      x: (bounds.minX + bounds.maxX) / 2,
      y: (bounds.minY + bounds.maxY) / 2,
    },
    width: bounds.maxX - bounds.minX,
    height: bounds.maxY - bounds.minY,
    strokeColor: "green",
    strokeWidth: 0.05,
    fill: "transparent",
  })

  const svg = getSvgFromGraphicsObject(
    stackGraphicsHorizontally([original, withInfo]),
    {
      backgroundColor: "white",
    },
  )

  expect(svg).toMatchSvgSnapshot(import.meta.path)
})
