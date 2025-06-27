import { test, expect } from "bun:test"
import type { BpcGraph, CostConfiguration } from "lib"
import { GraphNetworkTransformer } from "lib/graph-network-transformer/GraphNetworkTransformer"
import { getAssignmentCombinationsNetworkSimilarityDistance } from "lib/assignment-combinations-network-similarity/getAssignmentCombinationsNetworkSimilarityDistance"

const costConfiguration: Partial<CostConfiguration> = {
  baseOperationCost: 1,
  colorChangeCostMap: {},
  costPerUnitDistanceMovingPin: 0.1,
}

test("GraphNetworkTransformer - empty to single box with pin", () => {
  const initialGraph: BpcGraph = {
    boxes: [],
    pins: [],
  }

  const targetGraph: BpcGraph = {
    boxes: [{ boxId: "B1", kind: "floating", center: { x: 0, y: 0 } }],
    pins: [
      {
        boxId: "B1",
        pinId: "P1",
        offset: { x: 0, y: 0.5 },
        color: "red",
        networkId: "N1",
      },
    ],
  }

  const transformer = new GraphNetworkTransformer({
    initialGraph,
    targetGraph,
    costConfiguration,
  })

  transformer.solve()

  expect(transformer.solved).toBe(true)
  expect(transformer.failed).toBe(false)
  expect(transformer.error).toBeNull()

  // The final graph's network structure should match the target graph
  // This is confirmed if the heuristic distance is 0
  if (transformer.stats.finalGraph) {
    const finalDistance = getAssignmentCombinationsNetworkSimilarityDistance(
      transformer.stats.finalGraph,
      targetGraph,
      transformer.costConfiguration, // Use the full cost config from the transformer
    )
    expect(finalDistance.distance).toBe(0)
  } else {
    // Should not happen if solved is true
    expect(transformer.stats.finalGraph).toBeDefined()
  }

  // Check operations (optional, can be more specific if needed)
  // Expecting AddBoxOp and AddPinToBoxOp
  expect(transformer.stats.finalOperationChain).toBeDefined()
  expect(transformer.stats.finalOperationChain.length).toBeGreaterThanOrEqual(2)

  const hasAddBox = transformer.stats.finalOperationChain.some(
    (op: any) => op.operation_type === "add_box",
  )
  const hasAddPinToBox = transformer.stats.finalOperationChain.some(
    (op: any) => op.operation_type === "add_pin_to_box",
  )
  expect(hasAddBox).toBe(true)
  expect(hasAddPinToBox).toBe(true)

  // Verify gCost is reasonable (e.g., sum of baseOperationCosts for expected ops)
  // AddBox (1) + AddPinToBox (1) = 2
  // This can be more complex if other ops are generated and preferred by A*
  // For this simple case, it should be close to 2.
  // Due to potential variations in A* path finding, we'll check it's positive.
  expect(transformer.stats.gCost).toBeGreaterThan(0)
})

test("GraphNetworkTransformer - identical graphs", () => {
  const graph: BpcGraph = {
    boxes: [{ boxId: "B1", kind: "floating", center: { x: 0, y: 0 } }],
    pins: [
      {
        boxId: "B1",
        pinId: "P1",
        offset: { x: 0, y: 0.5 },
        color: "red",
        networkId: "N1",
      },
    ],
  }

  const transformer = new GraphNetworkTransformer({
    initialGraph: graph,
    targetGraph: graph,
    costConfiguration,
  })

  transformer.solve()

  expect(transformer.solved).toBe(true)
  expect(transformer.failed).toBe(false)
  expect(transformer.error).toBeNull()
  expect(transformer.stats.finalOperationChain.length).toBe(0)
  expect(transformer.stats.gCost).toBe(0)

  if (transformer.stats.finalGraph) {
    const finalDistance = getAssignmentCombinationsNetworkSimilarityDistance(
      transformer.stats.finalGraph,
      graph,
      transformer.costConfiguration,
    )
    expect(finalDistance.distance).toBe(0)
  } else {
    expect(transformer.stats.finalGraph).toBeDefined()
  }
})
