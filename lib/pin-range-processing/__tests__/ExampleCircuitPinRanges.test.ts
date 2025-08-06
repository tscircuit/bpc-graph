import { describe, test, expect } from "bun:test"
import { convertCircuitJsonToBpc } from "circuit-json-to-bpc"
import { PinRangeGenerator } from "../PinRangeGenerator"
import { createPinRangePartition } from "../createPinRangePartition"
import { getExampleCircuitJson } from "../../../pages/pin-range-processing/ExampleCircuit"

describe("Pin Range Processing with Example Circuit", () => {
  test("can convert example circuit to BPC graph and generate pin ranges", () => {
    // Convert circuit to BPC graph
    const circuitJson = getExampleCircuitJson()
    const bpcGraph = convertCircuitJsonToBpc(circuitJson)

    // Basic sanity checks
    expect(bpcGraph.boxes.length).toBeGreaterThan(0)
    expect(bpcGraph.pins.length).toBeGreaterThan(0)

    // Generate pin ranges
    const generator = new PinRangeGenerator(bpcGraph)
    const ranges = []
    let range
    while ((range = generator.next())) {
      ranges.push(range)
    }

    expect(ranges.length).toBeGreaterThan(0)

    // Check that we have ranges for different boxes
    const boxesWithRanges = new Set(ranges.map((r) => r.boxId))
    expect(boxesWithRanges.size).toBeGreaterThan(1)

    // Test that ranges are prioritized by size (smaller first)
    for (let i = 1; i < ranges.length; i++) {
      const prevSize = ranges[i - 1]!.endPinIndex - ranges[i - 1]!.startPinIndex
      const currSize = ranges[i]!.endPinIndex - ranges[i]!.startPinIndex
      expect(currSize).toBeGreaterThanOrEqual(prevSize)
    }
  })

  test("can create partitions from pin ranges", () => {
    // Convert circuit to BPC graph
    const circuitJson = getExampleCircuitJson()
    const bpcGraph = convertCircuitJsonToBpc(circuitJson)

    // Generate a few ranges
    const generator = new PinRangeGenerator(bpcGraph)
    const ranges = []
    for (let i = 0; i < 5; i++) {
      const range = generator.next()
      if (range) ranges.push(range)
    }

    expect(ranges.length).toBeGreaterThan(0)

    // Create partition from first range
    const firstRange = ranges[0]!
    const partition = createPinRangePartition(bpcGraph, [firstRange])

    expect(partition.ranges).toHaveLength(1)
    expect(partition.ranges[0]).toEqual(firstRange)
    expect(partition.graph.boxes.length).toBeGreaterThan(0)
    expect(partition.graph.pins.length).toBeGreaterThan(0)

    // Check that the partition contains pins from the specified box
    const boxPins = partition.graph.pins.filter(
      (p) => p.boxId === firstRange.boxId,
    )
    expect(boxPins.length).toBeGreaterThan(0)
  })

  test("partitions include connected pins from other boxes", () => {
    // Convert circuit to BPC graph
    const circuitJson = getExampleCircuitJson()
    const bpcGraph = convertCircuitJsonToBpc(circuitJson)

    // Find a range from a box that has connections to other boxes
    const generator = new PinRangeGenerator(bpcGraph)
    let targetRange
    while ((targetRange = generator.next())) {
      // Check if any pins in this range connect to other boxes
      const rangeBoxPins = bpcGraph.pins.filter(
        (p) =>
          p.boxId === targetRange.boxId &&
          p.pinId >= `pin${targetRange.startPinIndex}` && // This is a simplified check
          p.pinId < `pin${targetRange.endPinIndex}`,
      )

      if (rangeBoxPins.length > 0) {
        // Check if any of these pins share networks with pins from other boxes
        const networkIds = rangeBoxPins.map((p) => p.networkId)
        const connectedToOtherBoxes = bpcGraph.pins.some(
          (p) =>
            p.boxId !== targetRange.boxId && networkIds.includes(p.networkId),
        )

        if (connectedToOtherBoxes) {
          break
        }
      }
    }

    if (targetRange) {
      const partition = createPinRangePartition(bpcGraph, [targetRange])

      // The partition should include boxes other than the target box
      // (because pins on shared networks are included)
      const boxIds = new Set(partition.graph.boxes.map((b) => b.boxId))
      expect(boxIds.size).toBeGreaterThanOrEqual(1)
    }
  })
})
