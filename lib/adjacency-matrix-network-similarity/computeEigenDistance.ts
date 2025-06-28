import { euclidean } from "lib/matrix-utils/euclidean"
import { computeTopKEigenValues } from "./computeTopKEigenValues"

export const computeEigenDistance = (
  adjacencyMatrix1: number[][],
  adjacencyMatrix2: number[][],
  k: number,
) => {
  const eigs1 = computeTopKEigenValues(adjacencyMatrix1, k)
  const eigs2 = computeTopKEigenValues(adjacencyMatrix2, k)
  return euclidean(eigs1, eigs2)
}
