import type { FlatBpcGraph } from "lib/types"

export const getAdjacencyMatrixFromFlatBpcGraph = (
  flatBpcGraph: FlatBpcGraph,
): {
  matrix: number[][]
  mapping: Map<string, number>
  indexMapping: string[]
} => {
  const nodeIdToIndex = new Map<string, number>()
  const indexMapping: string[] = []
  flatBpcGraph.nodes.forEach((node, idx) => {
    nodeIdToIndex.set(node.id, idx)
    indexMapping.push(node.id)
  })
  const N = flatBpcGraph.nodes.length
  const matrix: number[][] = Array.from({ length: N }, () =>
    Array.from({ length: N }, () => 0),
  )
  for (const [id1, id2] of flatBpcGraph.undirectedEdges) {
    const i = nodeIdToIndex.get(id1)
    const j = nodeIdToIndex.get(id2)
    if (i !== undefined && j !== undefined && i !== j) {
      matrix[i]![j] = 1
      matrix[j]![i] = 1
    }
  }
  // Ones across the diagonal
  for (let i = 0; i < N; ++i) {
    matrix[i]![i] = 1
  }
  return { matrix, mapping: nodeIdToIndex, indexMapping }
}
