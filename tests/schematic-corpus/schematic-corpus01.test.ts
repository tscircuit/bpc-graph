import { test, expect } from "bun:test"
import { getHeuristicNetworkSimilarityDistance } from "lib/heuristic-network-similarity/getHeuristicSimilarityDistance"
import { GraphNetworkTransformer } from "lib/graph-network-transformer/GraphNetworkTransformer"
import type { BpcGraph, CostConfiguration } from "lib"
import corpus from "@tscircuit/schematic-corpus/dist/bundled-bpc-graphs.json"

const costConfiguration: Partial<CostConfiguration> = {
  baseOperationCost: 1,
  colorChangeCostMap: {},
  costPerUnitDistanceMovingPin: 0.1,
}

test("schematic-corpus01 – GraphNetworkTransformer should not hang (design006)", () => {
  const inputGraph = corpus["design006"]

  // Compute similarity scores to every design in the corpus.
  const scores = Object.entries(corpus).map(([name, g]) => ({
    name,
    graph: g,
    distance: getHeuristicNetworkSimilarityDistance(
      inputGraph,
      g,
      costConfiguration as CostConfiguration,
    ).distance,
  }))

  // Sort ascending by distance (lower is better).
  scores.sort((a, b) => a.distance - b.distance)

  // “Ignore Top Match” behaviour from the page: skip the best match.
  const bestTemplate = scores[1]
  expect(bestTemplate).toBeDefined()

  // Run the same adaptation step the page performs.
  const transformer = new GraphNetworkTransformer({
    initialGraph: bestTemplate.graph,
    targetGraph: inputGraph,
    costConfiguration,
  })
  transformer.MAX_ITERATIONS = 5_000

  transformer.solve()

  // The solver must either solve or fail, but never loop forever.
  expect(transformer.solved || transformer.failed).toBe(true)
})
