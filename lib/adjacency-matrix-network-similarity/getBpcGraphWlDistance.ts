import type { BpcGraph, MixedBpcGraph } from "../types"
import { getAdjacencyMatrixFromFlatBpcGraph } from "./getAdjacencyMatrixFromFlatBpcGraph"
import { convertToFlatBpcGraph } from "../flat-bpc/convertToFlatBpcGraph"
import { wlFeatureVec } from "./wlFeatureVec"
import { getWlDotProduct } from "./wlDotProduct"

const DEFAULT_WL_DEGREES = 2

export const getWlFeatureVecs = (
  g: BpcGraph,
  wlDegrees = DEFAULT_WL_DEGREES,
  opts: { limitInitialColorsToLabels?: string[] } = {},
) => {
  const flatBpc = convertToFlatBpcGraph(g as MixedBpcGraph)

  const { matrix, indexMapping } = getAdjacencyMatrixFromFlatBpcGraph(flatBpc)

  return wlFeatureVec(matrix, wlDegrees, {
    nodeInitialColors: indexMapping.map((id) => {
      const node = flatBpc.nodes.find((n) => n.id === id)

      if (!node) {
        return "_"
      }

      if (opts.limitInitialColorsToLabels === undefined) {
        return node.color
      }

      if (opts.limitInitialColorsToLabels.includes(node.color)) {
        return node.color
      }

      return "_"
    }),
  })
}

export const getBpcGraphWlDistance = (
  g1: BpcGraph,
  g2: BpcGraph,
  { wlDegrees = DEFAULT_WL_DEGREES }: { wlDegrees?: number } = {},
) => {
  const { counts: wlVec1 } = getWlFeatureVecs(g1, wlDegrees)
  const { counts: wlVec2 } = getWlFeatureVecs(g2, wlDegrees)

  return wlDegrees + 1 - getWlDotProduct(wlVec1, wlVec2)
}
