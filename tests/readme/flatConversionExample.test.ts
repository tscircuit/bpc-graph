import { expect, test } from "bun:test"
import { convertToFlatBpcGraph } from "lib/flat-bpc/convertToFlatBpcGraph"
import { convertFromFlatBpcGraph } from "lib/flat-bpc/convertFromFlatBpcGraph"
import { getGraphicsForBpcGraph } from "lib/debug/getGraphicsForBpcGraph"
import {
  stackGraphicsHorizontally,
  getSvgFromGraphicsObject,
} from "graphics-debug"
import type { MixedBpcGraph } from "lib/types"

const base: MixedBpcGraph = {
  boxes: [
    { kind: "fixed", boxId: "B1", center: { x: 0, y: 0 } },
    { kind: "fixed", boxId: "B2", center: { x: 2, y: 0 } },
  ],
  pins: [
    {
      boxId: "B1",
      pinId: "P1",
      networkId: "N1",
      color: "red",
      offset: { x: 0.5, y: 0 },
    },
    {
      boxId: "B2",
      pinId: "P1",
      networkId: "N1",
      color: "red",
      offset: { x: -0.5, y: 0 },
    },
  ],
}

test("flatConversionExample", () => {
  const flat = convertToFlatBpcGraph(base)
  const round = convertFromFlatBpcGraph(flat)
  const svg = getSvgFromGraphicsObject(
    stackGraphicsHorizontally([
      getGraphicsForBpcGraph(base, { title: "Original", caption: "mixed" }),
      getGraphicsForBpcGraph(round, {
        title: "Round Trip",
        caption: "flat -> mixed",
      }),
    ]),
    { backgroundColor: "white" },
  )
  expect(svg).toMatchSvgSnapshot(import.meta.path)
})
