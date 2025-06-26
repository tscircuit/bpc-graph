import Matrix, { EigenvalueDecomposition } from "ml-matrix"

const zeroes = (n: number) => Array.from({ length: n }, () => 0)

export const computeTopKEigenValues = (
  adjacencyMatrix: number[][],
  k: number,
) => {
  const mat = new Matrix(adjacencyMatrix)
  const e = new EigenvalueDecomposition(mat)

  if (e.realEigenvalues.length < k) {
    return e.realEigenvalues.concat(zeroes(k - e.realEigenvalues.length))
  } else {
    return e.realEigenvalues.slice(0, k)
  }
}
