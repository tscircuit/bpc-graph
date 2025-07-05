import {
  getSvgFromGraphicsObject,
  stackGraphicsHorizontally,
  type GraphicsObject,
} from "graphics-debug"
import { getApproximateAssignments } from "lib/adjacency-matrix-network-similarity/getApproximateAssignments"
import { getApproximateAssignments2 } from "lib/assignment2/getApproximateAssignments2"
import { assignFloatingBoxPositions } from "lib/bpc-graph-editing/assignFloatingBoxPositions"
import { getColorByIndex } from "lib/graph-utils/getColorByIndex"
import {
  type FixedBpcGraph,
  getGraphicsForBpcGraph,
  type MixedBpcGraph,
  netAdaptBpcGraph,
} from "lib/index"

export const testNetAdapt = (
  source: FixedBpcGraph,
  target: MixedBpcGraph,
): {
  sourceGraphics: GraphicsObject
  targetGraphics: GraphicsObject
  adaptedBpcGraph: FixedBpcGraph
  adaptedGraphics: GraphicsObject
  adaptedFloating: MixedBpcGraph
  adaptedFixed: FixedBpcGraph
  allGraphics: GraphicsObject
  allGraphicsSvg: string
} => {
  // Replicate the logic for getting assigned boxes and coloring them as in adjacencyMatrixVisual01.test.ts
  // (Assume getColorByIndex, getGraphicsForBpcGraph, getApproximateAssignments, netAdaptBpcGraph, assignFloatingBoxPositions are in scope)
  // (Assume GraphicsObject is in scope)

  // Get box assignments between source and target
  const { floatingToFixedBoxAssignment: boxAssignment } =
    getApproximateAssignments2(source as MixedBpcGraph, target as MixedBpcGraph)

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

  // Generate graphics for target and source
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

  // Adapt the source to the target using netAdaptBpcGraph
  const { adaptedBpcGraph: adaptedFloating } = netAdaptBpcGraph(
    source as FixedBpcGraph,
    target as MixedBpcGraph,
  )

  // Assign floating box positions to the adapted graph
  const adaptedFixed = assignFloatingBoxPositions(adaptedFloating)

  // Generate graphics for the adapted graph
  const adaptedGraphics = getGraphicsForBpcGraph(adaptedFixed, {
    title: "Net Adapted (floating assigned)",
  })

  // Compose all graphics horizontally
  const allGraphics = stackGraphicsHorizontally([
    targetGraphics,
    sourceGraphics,
    adaptedGraphics,
  ])

  const allGraphicsSvg = getSvgFromGraphicsObject(allGraphics, {
    backgroundColor: "white",
    includeTextLabels: false,
    svgHeight: 320,
    svgWidth: 800,
  })

  return {
    sourceGraphics,
    targetGraphics,
    adaptedFloating,
    adaptedFixed,
    adaptedBpcGraph: adaptedFixed,
    adaptedGraphics,
    allGraphics,
    allGraphicsSvg,
  }
}
