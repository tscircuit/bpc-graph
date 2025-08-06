import type {
  BpcGraph,
  FixedBpcGraph,
  FloatingBoxId,
  PinRangePartition,
} from "lib/types"
import { PinRangeGenerator } from "lib/pin-range-processing/PinRangeGenerator"
import { createPinRangePartition } from "lib/pin-range-processing/createPinRangePartition"
import {
  copyPartitionLayouts,
  copyMatchedLayout,
} from "lib/pin-range-processing/copyPartitionLayouts"
import { matchGraph } from "lib/match-graph/matchGraph"

/**
 * Layout a schematic graph using pin range-based pattern matching
 *
 * This approach directly processes pin ranges rather than creating major partitions first.
 * It focuses on small patterns (1-3 pins) that can be reliably matched against a corpus.
 */
export const layoutSchematicGraphWithPinRanges = (
  initialGraph: BpcGraph,
  {
    corpus,
    floatingBoxIdsWithMutablePinOffsets,
    distanceThreshold = 0,
  }: {
    corpus: Record<string, FixedBpcGraph>
    floatingBoxIdsWithMutablePinOffsets?: Set<FloatingBoxId>
    /**
     * Maximum distance allowed for a match to be considered perfect.
     * Default is 0 (perfect matches only).
     */
    distanceThreshold?: number
  },
): {
  fixedGraph: FixedBpcGraph
  distance: number
  appliedPartitions: PinRangePartition[]
  unusedRanges: number
} => {
  const pinRangeGenerator = new PinRangeGenerator(initialGraph)
  const appliedPartitions: PinRangePartition[] = []
  let totalDistance = 0

  // Process pin ranges one by one
  let pinRange
  while ((pinRange = pinRangeGenerator.next())) {
    // Create a partition for this pin range
    const pinRangePartition = createPinRangePartition(initialGraph, [pinRange])

    // Try to match this partition against the corpus
    const matches = matchGraph(pinRangePartition.graph, corpus)

    if (matches.distance <= distanceThreshold) {
      // Perfect (or acceptable) match found
      pinRangeGenerator.markRangeAsUsed(pinRange)

      // Copy the matched layout to the partition
      const updatedPartition = copyMatchedLayout(
        pinRangePartition,
        matches.graph,
      )
      appliedPartitions.push(updatedPartition)

      totalDistance += matches.distance
    }
  }

  // Clone the original graph to avoid mutations
  const laidOutGraph = {
    boxes: [...initialGraph.boxes],
    pins: [...initialGraph.pins],
  }

  // Apply all the partition layouts to the main graph
  const finalGraph = copyPartitionLayouts(laidOutGraph, appliedPartitions)

  // Count unused ranges for debugging/metrics
  const unusedRanges = pinRangeGenerator.getUnusedRanges().length

  return {
    fixedGraph: finalGraph as FixedBpcGraph,
    distance: totalDistance,
    appliedPartitions,
    unusedRanges,
  }
}
