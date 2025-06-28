import { getComparisonGraphicsSvg } from "tests/fixtures/getComparisonGraphicsSvg"
import { test, expect } from "bun:test"
import corpus from "@tscircuit/schematic-corpus/dist/bundled-bpc-graphs.json"
import { getGraphicsForBpcGraph, type MixedBpcGraph } from "lib/index"
import { getColorByIndex } from "lib/graph-utils/getColorByIndex"
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
import { getApproximateAssignments } from "lib/adjacency-matrix-network-similarity/getApproximateAssignments"

test("adjacencyMatrixVisual01", () => {
  const designs = Object.keys(corpus).sort().slice(0, 6) as Array<
    keyof typeof corpus
  >

  const graphicsGridCells: GraphicsObject[][] = []
  let fontSize: number | undefined
  for (let i = 0; i < designs.length; i++) {
    const rowGraphics: GraphicsObject[] = []
    let bestEigenDistance = Infinity
    let bestWlDotProduct = -Infinity
    let bestEigenIndex = -1
    let bestWlDotProductIndex = -1

    for (let j = 0; j < designs.length; j++) {
      const bpcGraph1 = corpus[designs[i]!]
      const bpcGraph2 = corpus[designs[j]!]

      const graphics1 = getGraphicsForBpcGraph(bpcGraph1 as MixedBpcGraph)
      const graphics2 = getGraphicsForBpcGraph(bpcGraph2 as MixedBpcGraph)

      const { boxAssignment } = getApproximateAssignments(
        bpcGraph1 as MixedBpcGraph,
        bpcGraph2 as MixedBpcGraph,
      )

      const assignedBoxIds1 = Object.keys(boxAssignment)
      const boxIdToNum = new Map<string, number>()
      const boxIdToColor = new Map<string, string>()
      assignedBoxIds1.forEach((boxId1, k) => {
        const boxId2 = boxAssignment[boxId1]!
        const color = getColorByIndex(k, assignedBoxIds1.length, 0.2)
        boxIdToColor.set(boxId1, color)
        boxIdToColor.set(boxId2, color)
        boxIdToNum.set(boxId1, k)
        boxIdToNum.set(boxId2, k)
      })

      graphics1.texts ??= []
      graphics2.texts ??= []
      for (const rect of graphics1.rects) {
        if (rect.label && boxIdToColor.has(rect.label)) {
          rect.fill = boxIdToColor.get(rect.label)
          graphics1.texts.push({
            text: `${boxIdToNum.get(rect.label)}`,
            x: rect.center.x,
            y: rect.center.y,
            fontSize: (rect.width + rect.height) * 0.2,
            anchorSide: "center",
          })
        }
      }
      for (const rect of graphics2.rects) {
        if (rect.label && boxIdToColor.has(rect.label)) {
          rect.fill = boxIdToColor.get(rect.label)
          graphics2.texts.push({
            text: `${boxIdToNum.get(rect.label)}`,
            x: rect.center.x,
            y: rect.center.y,
            fontSize: (rect.width + rect.height) * 0.2,
            anchorSide: "center",
          })
        }
      }

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

      const bounds2 = getBounds(graphics2)
      graphics2.lines.push({
        points: [
          {
            x: bounds2.minX - (bounds2.maxX - bounds2.minX) * 0.05,
            y: bounds2.minY,
          },
          {
            x: bounds2.minX - (bounds2.maxX - bounds2.minX) * 0.05,
            y: bounds2.maxY,
          },
        ],
        strokeColor: "rgba(0, 0, 0, 0.5)",
        strokeWidth: (bounds2.maxY - bounds2.minY) * 0.03,
        strokeDash: [
          (bounds2.maxY - bounds2.minY) * 0.5,
          (bounds2.maxY - bounds2.minY) * 0.5,
        ],
      })

      const sideBySideGraphics = stackGraphicsHorizontally([
        graphics1,
        graphics2,
      ])

      const sbsBounds = getBounds(sideBySideGraphics)

      if (eigenDistance < bestEigenDistance && i !== j) {
        bestEigenDistance = eigenDistance
        bestEigenIndex = j
      }

      if (wlDotProduct > bestWlDotProduct && i !== j) {
        bestWlDotProduct = wlDotProduct
        bestWlDotProductIndex = j
      }

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

      rowGraphics.push(cellGraphics)
    }

    // Modify the text adding an "*" at the end of the text if it is the best
    // in the row
    if (bestEigenIndex !== -1) {
      const texts = rowGraphics[bestEigenIndex]?.texts
      if (texts) {
        const eigenText = texts.find((t) => t.text.includes("Eigen"))
        if (eigenText) {
          eigenText.text += "*"
        }
      }
    }
    if (bestWlDotProductIndex !== -1) {
      const texts = rowGraphics[bestWlDotProductIndex]?.texts
      if (texts) {
        const wlText = texts.find((t) => t.text.includes("WL Dot Product"))
        if (wlText) {
          wlText.text += "*"
        }
      }
    }

    graphicsGridCells.push(rowGraphics)
  }

  const giantGraphics = createGraphicsGrid(graphicsGridCells, {
    gapAsCellWidthFraction: 0.2,
  })

  expect(
    getSvgFromGraphicsObject(
      { ...giantGraphics, points: [] },
      {
        backgroundColor: "white",
        includeTextLabels: false, // ["rects"],
      },
    ),
  ).toMatchSvgSnapshot(import.meta.path)
})
