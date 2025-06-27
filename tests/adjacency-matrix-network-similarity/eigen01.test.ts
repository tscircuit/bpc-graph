import { getComparisonGraphicsSvg } from "tests/fixtures/getComparisonGraphicsSvg"
import { test, expect } from "bun:test"
import corpus from "@tscircuit/schematic-corpus/dist/bundled-bpc-graphs.json"
import { getGraphicsForBpcGraph, type MixedBpcGraph } from "lib/index"

test("eigen01", () => {
  const bpcGraph1 = corpus.design004
  const bpcGraph2 = corpus.design005

  const graphics1 = getGraphicsForBpcGraph(bpcGraph1 as MixedBpcGraph)
  const graphics2 = getGraphicsForBpcGraph(bpcGraph2 as MixedBpcGraph)

  expect(
    getComparisonGraphicsSvg(graphics1, graphics2, {
      caption: "Hello world",
    }),
  ).toMatchSvgSnapshot(import.meta.path)

  // TODO, take two graphs from the schematic corpus, take a snapshot of the
  // two circuits and test for the similarity of the adjacency matrices
  console.log(Object.keys(corpus))
})
