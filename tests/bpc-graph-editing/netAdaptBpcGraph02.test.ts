import { test, expect } from "bun:test"
import corpus from "@tscircuit/schematic-corpus/dist/bundled-bpc-graphs.json"
import {
  getGraphicsForBpcGraph,
  type FixedBpcGraph,
  type MixedBpcGraph,
} from "lib/index"
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
import { netAdaptBpcGraph } from "lib/bpc-graph-editing/netAdaptBpcGraph"

test("netAdaptBpcGraph02", () => {
  const target = corpus.design002 as FixedBpcGraph
  const source = corpus.design001 as MixedBpcGraph

  // Replicate the logic for getting assigned boxes and coloring them as in adjacencyMatrixVisual01.test.ts
  const { boxAssignment } = getApproximateAssignments(
    source as MixedBpcGraph,
    target as MixedBpcGraph,
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

  const targetGraphics = getGraphicsForBpcGraph(target as MixedBpcGraph, {
    title: "Target",
  })
  const sourceGraphics = getGraphicsForBpcGraph(source as MixedBpcGraph, {
    title: "Source",
  })

  targetGraphics.texts ??= []
  sourceGraphics.texts ??= []
  for (const rect of targetGraphics.rects) {
    if (rect.label && boxIdToColor.has(rect.label)) {
      rect.fill = boxIdToColor.get(rect.label)
      targetGraphics.texts.push({
        text: `${boxIdToNum.get(rect.label)}`,
        x: rect.center.x,
        y: rect.center.y,
        fontSize: (rect.width + rect.height) * 0.2,
        anchorSide: "center",
      })
    }
  }
  for (const rect of sourceGraphics.rects) {
    if (rect.label && boxIdToColor.has(rect.label)) {
      rect.fill = boxIdToColor.get(rect.label)
      sourceGraphics.texts.push({
        text: `${boxIdToNum.get(rect.label)}`,
        x: rect.center.x,
        y: rect.center.y,
        fontSize: (rect.width + rect.height) * 0.2,
        anchorSide: "center",
      })
    }
  }

  const { adaptedBpcGraph: netAdaptedBpcGraph } = netAdaptBpcGraph(
    source as FixedBpcGraph,
    target as MixedBpcGraph,
  )

  const netAdaptedGraphics = getGraphicsForBpcGraph(netAdaptedBpcGraph, {
    title: "Net Adapted",
  })

  // TODO floating assignment

  // TODO Force layout

  expect(
    getSvgFromGraphicsObject(
      stackGraphicsHorizontally([
        targetGraphics,
        sourceGraphics,
        netAdaptedGraphics,
      ]),
      {
        backgroundColor: "white",
        includeTextLabels: false, // ["rects"],
      },
    ),
  ).toMatchSvgSnapshot(import.meta.path)
})
