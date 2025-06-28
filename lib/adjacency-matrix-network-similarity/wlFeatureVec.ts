/**
 * Runs the Weisfeiler-Lehman algorithm on the adjacency matrix and returns
 * an array of color count records after each refinement step (including initial).
 * Each entry is a record mapping color labels to their counts at that step.
 */
export const wlFeatureVec = (
  adjMatrix: number[][],
  K: number,
  opts: { nodeInitialColors?: string[] } = {},
): Array<Record<string, number>> => {
  const n = adjMatrix.length
  if (adjMatrix.some((row) => row.length !== n)) {
    throw new Error("adjMatrix must be square")
  }

  // Initial colours (default “_” for every node)
  let colors = (
    opts.nodeInitialColors ?? Array.from({ length: n }, () => "_")
  ).slice()

  // Helper to count colors in an array
  const getCounts = (cols: string[]): Record<string, number> => {
    const counts: Record<string, number> = {}
    for (const c of cols) counts[c] = (counts[c] ?? 0) + 1
    return counts
  }

  const countsArr: Array<Record<string, number>> = []
  countsArr.push(getCounts(colors))

  for (let step = 0; step < K; step++) {
    const next: string[] = Array(n)

    for (let v = 0; v < n; v++) {
      // Multiset of neighbour colours
      const neigh: string[] = []
      for (let u = 0; u < n; u++) if (adjMatrix[v]![u]!) neigh.push(colors[u]!)
      neigh.sort() // canonical order

      // Refine: own colour | sorted multiset of neighbour colours
      next[v] = `${colors[v]}|${neigh.join(",")}`
    }

    colors = next
    countsArr.push(getCounts(colors))
  }

  return countsArr
}
