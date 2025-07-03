import type { BpcGraph, MixedBpcGraph } from "../types"
import { getAdjacencyMatrixFromFlatBpcGraph } from "./getAdjacencyMatrixFromFlatBpcGraph"
import { convertToFlatBpcGraph } from "../flat-bpc/convertToFlatBpcGraph"
import { wlFeatureVec } from "./wlFeatureVec"
import { getWlDotProduct } from "./wlDotProduct"

const WL_DEGREES = 2

export const getWlFeatureVecs = (g: BpcGraph) => {
  const adjacencyMatrix = getAdjacencyMatrixFromFlatBpcGraph(
    convertToFlatBpcGraph(g as MixedBpcGraph),
  ).matrix
  return wlFeatureVec(adjacencyMatrix, WL_DEGREES)
}

export const getBpcGraphWlDistance = (g1: BpcGraph, g2: BpcGraph) => {
  const wlVec1 = getWlFeatureVecs(g1)
  const wlVec2 = getWlFeatureVecs(g2)

  return WL_DEGREES + 1 - getWlDotProduct(wlVec1, wlVec2)
}
