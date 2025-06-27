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
  createGraphicsGrid,
  type GraphicsObject,
} from "graphics-debug"
import { wlFeatureVec } from "lib/adjacency-matrix-network-similarity/wlFeatureVec"
import { getWlDotProduct } from "lib/adjacency-matrix-network-similarity/wlDotProduct"

test("adjacencyMatrixVisual01", () => {
  const designs = Object.keys(corpus).sort().slice(0, 6) as Array<
    keyof typeof corpus
  >

  const graphicsGridCells: GraphicsObject[][] = []
  let fontSize: number | undefined
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

      const wlVec1 = wlFeatureVec(adjacencyMatrix1, 2)
      const wlVec2 = wlFeatureVec(adjacencyMatrix2, 2)

      const wlDotProduct = getWlDotProduct(wlVec1, wlVec2)

      const sideBySideGraphics = stackGraphicsHorizontally([
        graphics1,
        graphics2,
      ])

      const sbsBounds = getBounds(sideBySideGraphics)

      fontSize ??= (sbsBounds.maxX - sbsBounds.minX) * 0.05
      const cellGraphics = stackGraphicsVertically([
        sideBySideGraphics,
        {
          texts: [
            {
              text: `Eigen distance: ${eigenDistance.toFixed(2)}`,
              x: 0,
              y: 0,
              fontSize,
              anchorSide: "top_left",
            },
            {
              text: `WL Dot Product: ${wlDotProduct.toFixed(2)}`,
              x: 0,
              y: -fontSize * 1.5,
              fontSize,
              anchorSide: "top_left",
            },
          ],
        },
      ])

      rowGraphics.unshift(cellGraphics)
    }
    graphicsGridCells.push(rowGraphics)
  }

  const giantGraphics = createGraphicsGrid(graphicsGridCells, {
    gapAsCellWidthFraction: 0.2,
  })

  expect(
    getSvgFromGraphicsObject(giantGraphics, {
      backgroundColor: "white",
      includeTextLabels: false,
    }),
  ).toMatchSvgSnapshot(import.meta.path)
})
