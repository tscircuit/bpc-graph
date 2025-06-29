import { getBpcGraphWlDistance } from "lib/adjacency-matrix-network-similarity/getBpcGraphWlDistance"
import type { BpcGraph } from "lib/types"

export const matchGraph = (
  g: BpcGraph,
  corpus: Record<string, BpcGraph>,
  opts: {
    similarityMethod?: "wl-distance"
  } = {},
) => {
  opts.similarityMethod ??= "wl-distance"

  const distanceFn = getBpcGraphWlDistance

  const distances = Object.fromEntries(
    Object.entries(corpus).map(([k, v]) => [k, distanceFn(g, v)]),
  )
  console.table(distances)

  const bestMatch = Object.entries(distances).reduce((best, [k, d]) =>
    d < best[1] ? [k, d] : best,
  )

  return {
    graphName: bestMatch[0],
    graph: corpus[bestMatch[0]],
    distance: bestMatch[1],
  }
}
