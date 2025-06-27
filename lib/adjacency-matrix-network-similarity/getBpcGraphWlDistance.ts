import type { BpcGraph, MixedBpcGraph } from "lib"
import { getAdjacencyMatrixFromFlatBpcGraph } from "./getAdjacencyMatrixFromFlatBpcGraph"
import { convertToFlatBpcGraph } from "lib/flat-bpc/convertToFlatBpcGraph"
import { wlFeatureVec } from "./wlFeatureVec"
import { getWlDotProduct } from "./wlDotProduct"

const WL_DEGREES = 2

export const getBpcGraphWlDistance = (g1: BpcGraph, g2: BpcGraph) => {
  const adjacencyMatrix1 = getAdjacencyMatrixFromFlatBpcGraph(
    convertToFlatBpcGraph(g1 as MixedBpcGraph),
  ).matrix
  const adjacencyMatrix2 = getAdjacencyMatrixFromFlatBpcGraph(
    convertToFlatBpcGraph(g2 as MixedBpcGraph),
  ).matrix

  const wlVec1 = wlFeatureVec(adjacencyMatrix1, WL_DEGREES)
  const wlVec2 = wlFeatureVec(adjacencyMatrix2, WL_DEGREES)

  return WL_DEGREES + 1 - getWlDotProduct(wlVec1, wlVec2)
}
