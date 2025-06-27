/**
 * Runs the Weisfeiler-Lehman algorithm on the adjacency matrix and returns,
 * for each refinement step (including the initial colouring), an array with
 * the counts of every colour that appears, as a record mapping color labels
 * to their counts.
 */
export const getLehmanKernel = (
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

  const result: Array<Record<string, number>> = []

  /** Push the current colour multiset into `result` */
  const pushCounts = (cols: string[]) => {
    const counts: Record<string, number> = {}
    for (const c of cols) counts[c] = (counts[c] ?? 0) + 1
    result.push(counts)
  }

  // Record iteration 0 (initial colours)
  pushCounts(colors)

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
    pushCounts(colors)
  }

  return result
}
