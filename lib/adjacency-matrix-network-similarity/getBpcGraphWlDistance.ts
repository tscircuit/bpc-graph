import type { BpcGraph, MixedBpcGraph } from "../types"
import { getAdjacencyMatrixFromFlatBpcGraph } from "./getAdjacencyMatrixFromFlatBpcGraph"
import { convertToFlatBpcGraph } from "../flat-bpc/convertToFlatBpcGraph"
import { wlFeatureVec } from "./wlFeatureVec"
import { getWlDotProduct } from "./wlDotProduct"

const DEFAULT_WL_DEGREES = 2

export const getWlFeatureVecs = (
  g: BpcGraph,
  wlDegrees = DEFAULT_WL_DEGREES,
) => {
  const flatBpc = convertToFlatBpcGraph(g as MixedBpcGraph)

  const { matrix, indexMapping } = getAdjacencyMatrixFromFlatBpcGraph(flatBpc)

  return wlFeatureVec(matrix, wlDegrees, {
    nodeInitialColors: indexMapping.map(
      (id) => flatBpc.nodes.find((n) => n.id === id)?.color ?? "_",
    ),
  })
}

export const getBpcGraphWlDistance = (
  g1: BpcGraph,
  g2: BpcGraph,
  { wlDegrees = DEFAULT_WL_DEGREES }: { wlDegrees?: number } = {},
) => {
  const wlVec1 = getWlFeatureVecs(g1, wlDegrees)
  const wlVec2 = getWlFeatureVecs(g2, wlDegrees)

  return DEFAULT_WL_DEGREES + 1 - getWlDotProduct(wlVec1, wlVec2)
}
