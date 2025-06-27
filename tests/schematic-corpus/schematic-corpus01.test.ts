import { test, expect } from "bun:test"
import { GraphNetworkTransformer } from "lib/graph-network-transformer/GraphNetworkTransformer"
import type { BpcGraph, CostConfiguration } from "lib"
import corpus from "@tscircuit/schematic-corpus/dist/bundled-bpc-graphs.json"
import { getDefaultLibContext } from "lib/context"
import { getBpcGraphWlDistance } from "lib/adjacency-matrix-network-similarity/getBpcGraphWlDistance"

const costConfiguration: Partial<CostConfiguration> = {
  baseOperationCost: 1,
  colorChangeCostMap: {},
  costPerUnitDistanceMovingPin: 0.1,
}

test("schematic-corpus01 – GraphNetworkTransformer should not hang (design006)", () => {
  const ctx = getDefaultLibContext()
  const inputGraph = corpus["design006"]

  ctx.logger.info("Starting schematic-corpus01 test with design006")

  // Compute similarity scores to every design in the corpus.
  const scores = Object.entries(corpus).map(([name, g]) => ({
    name,
    graph: g,
    distance: getBpcGraphWlDistance(inputGraph as BpcGraph, g as BpcGraph),
  }))

  // Sort ascending by distance (lower is better).
  scores.sort((a, b) => a.distance - b.distance)

  // “Ignore Top Match” behaviour from the page: skip the best match.
  const bestTemplate = scores[1]
  expect(bestTemplate).toBeDefined()

  ctx.logger.info(
    `Selected template: ${bestTemplate!.name} with distance ${bestTemplate!.distance}`,
  )

  // Run the same adaptation step the page performs.
  const transformer = new GraphNetworkTransformer({
    initialGraph: bestTemplate!.graph as BpcGraph,
    targetGraph: inputGraph as BpcGraph,
    costConfiguration,
    context: ctx,
  })
  transformer.MAX_ITERATIONS = 5_000

  ctx.logger.info("Starting GraphNetworkTransformer.solve()")
  transformer.solve()

  // The solver must either solve or fail, but never loop forever.
  ctx.logger.info(
    `GraphNetworkTransformer finished: solved=${transformer.solved}, failed=${transformer.failed}, iterations=${transformer.iterations}`,
  )
  expect(transformer.solved || transformer.failed).toBe(true)
})
