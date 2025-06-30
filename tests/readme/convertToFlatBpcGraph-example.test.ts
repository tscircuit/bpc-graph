import { expect, test } from "bun:test"
import corpus from "@tscircuit/schematic-corpus/dist/bundled-bpc-graphs.json"
import { getGraphicsForBpcGraph, convertFlatBpcToGraphics } from "lib/index"
import { convertToFlatBpcGraph } from "lib/flat-bpc/convertToFlatBpcGraph"
import {
  stackGraphicsHorizontally,
  getSvgFromGraphicsObject,
} from "graphics-debug"
import type { MixedBpcGraph } from "lib/types"

test("convertToFlatBpcGraph README example – design005", () => {
  /* ---------------- source data ---------------- */
  const bpcGraph = corpus.design005 as MixedBpcGraph
  const flat = convertToFlatBpcGraph(bpcGraph)

  /* ---------------- graphics ------------------- */
  const gfxBpc = getGraphicsForBpcGraph(bpcGraph, {
    title: "BPC Representation",
  })
  const gfxFlat = convertFlatBpcToGraphics(flat, {
    title: "Flat Representation",
  })

  const all = stackGraphicsHorizontally([gfxBpc, gfxFlat])
  const svg = getSvgFromGraphicsObject(all, {
    backgroundColor: "white",
    includeTextLabels: false,
  })

  expect(svg).toMatchSvgSnapshot(import.meta.path)
})
