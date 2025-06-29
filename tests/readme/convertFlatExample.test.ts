import { expect, test } from "bun:test"
import { convertToFlatBpcGraph } from "lib/flat-bpc/convertToFlatBpcGraph"
import { convertFromFlatBpcGraph } from "lib/flat-bpc/convertFromFlatBpcGraph"
import { getGraphicsForBpcGraph } from "lib/debug/getGraphicsForBpcGraph"
import {
  stackGraphicsHorizontally,
  getSvgFromGraphicsObject,
} from "graphics-debug"
import type { MixedBpcGraph } from "lib/types"

const g: MixedBpcGraph = {
  boxes: [
    { boxId: "B1", kind: "fixed", center: { x: 0, y: 0 } },
    { boxId: "B2", kind: "floating" },
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
  ],
}

test("convertFlatExample", () => {
  const flat = convertToFlatBpcGraph(g)
  const reconstructed = convertFromFlatBpcGraph(flat)

  const svg = getSvgFromGraphicsObject(
    stackGraphicsHorizontally([
      getGraphicsForBpcGraph(g, { title: "Original" }),
      getGraphicsForBpcGraph(reconstructed, { title: "Round Trip" }),
    ]),
    { backgroundColor: "white" },
  )

  expect(svg).toMatchSvgSnapshot(import.meta.path)
})
