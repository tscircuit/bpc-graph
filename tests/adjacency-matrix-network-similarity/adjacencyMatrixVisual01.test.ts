import { getComparisonGraphicsSvg } from "tests/fixtures/getComparisonGraphicsSvg"
import { test, expect } from "bun:test"
import corpus from "@tscircuit/schematic-corpus/dist/bundled-bpc-graphs.json"
import { getGraphicsForBpcGraph, type MixedBpcGraph } from "lib/index"
import { getAdjacencyMatrixFromFlatBpcGraph } from "lib/adjacency-matrix-network-similarity/getAdjacencyMatrixFromFlatBpcGraph"
import { convertToFlatBpcGraph } from "lib/flat-bpc/convertToFlatBpcGraph"
import { computeEigenDistance } from "lib/adjacency-matrix-network-similarity/computeEigenDistance"
import {
  getBounds,
  getSvgFromGraphicsObject,
  stackGraphicsHorizontally,
  stackGraphicsVertically,
  type GraphicsObject,
} from "graphics-debug"

test("adjacencyMatrixVisual01", () => {
  const designs = Object.keys(corpus).sort().slice(0, 6) as Array<
    keyof typeof corpus
  >

  let giantGraphics: GraphicsObject = {}
  for (let i = 0; i < designs.length; i++) {
    const rowGraphics: GraphicsObject[] = []
    for (let j = 0; j < designs.length; j++) {
      const bpcGraph1 = corpus[designs[i]!]
      const bpcGraph2 = corpus[designs[j]!]

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

      const sideBySideGraphics = stackGraphicsHorizontally([
        graphics1,
        graphics2,
      ])

      const sbsBounds = getBounds(sideBySideGraphics)

      const cellGraphics = stackGraphicsVertically([
        sideBySideGraphics,
        {
          texts: [
            {
              text: `Eigen distance: ${eigenDistance}`,
              x: 0,
              y: 0,
              fontSize: (sbsBounds.maxX - sbsBounds.minX) * 0.05,
              anchorSide: "top_left",
            },
          ],
        },
      ])

      rowGraphics.push(cellGraphics)
    }

    giantGraphics = stackGraphicsVertically([
      giantGraphics,
      stackGraphicsHorizontally(rowGraphics.reverse()),
    ])
  }

  expect(
    getSvgFromGraphicsObject(giantGraphics, {
      backgroundColor: "white",
      includeTextLabels: false,
    }),
  ).toMatchSvgSnapshot(import.meta.path)
})
