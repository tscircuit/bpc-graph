import { getComparisonGraphicsSvg } from "tests/fixtures/getComparisonGraphicsSvg"
import { test, expect } from "bun:test"
import corpus from "@tscircuit/schematic-corpus/dist/bundled-bpc-graphs.json"
import { getGraphicsForBpcGraph, type MixedBpcGraph } from "lib/index"
import { getAdjacencyMatrixFromFlatBpcGraph } from "lib/adjacency-matrix-network-similarity/getAdjacencyMatrixFromFlatBpcGraph"
import { convertToFlatBpcGraph } from "lib/flat-bpc/convertToFlatBpcGraph"
import { computeEigenDistance } from "lib/adjacency-matrix-network-similarity/computeEigenDistance"
test("eigen01", () => {
  const bpcGraph1 = corpus.design004
  const bpcGraph2 = corpus.design005

  const graphics1 = getGraphicsForBpcGraph(bpcGraph1 as MixedBpcGraph)
  const graphics2 = getGraphicsForBpcGraph(bpcGraph2 as MixedBpcGraph)

  const adjacencyMatrix1 = getAdjacencyMatrixFromFlatBpcGraph(
    convertToFlatBpcGraph(bpcGraph1 as MixedBpcGraph),
  ).matrix
  const adjacencyMatrix2 = getAdjacencyMatrixFromFlatBpcGraph(
    convertToFlatBpcGraph(bpcGraph2 as MixedBpcGraph),
  ).matrix

  const eigenDistance = computeEigenDistance(
    adjacencyMatrix1,
    adjacencyMatrix2,
    10,
  )

  expect(
    getComparisonGraphicsSvg(graphics1, graphics2, {
      caption: `Eigen distance: ${eigenDistance}`,
    }),
  ).toMatchSvgSnapshot(import.meta.path)
})
