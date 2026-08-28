import type {
  BpcGraph,
  PinRangePartition,
  FixedBpcGraph,
  MixedBpcGraph,
  BpcBox,
  BpcFixedBox,
} from "lib/types"

/**
 * Copy layout information from matched pin range partitions back to the original graph
 */
export function copyPartitionLayouts(
  targetGraph: BpcGraph,
  partitions: PinRangePartition[],
): MixedBpcGraph {
  const result: MixedBpcGraph = {
    boxes: [...targetGraph.boxes],
    pins: [...targetGraph.pins],
  }

  // Track which pins and boxes have been positioned
  const positionedBoxes = new Set<string>()
  const positionedPins = new Set<string>()

  for (const partition of partitions) {
    const { graph: partitionGraph } = partition

    // Copy box positions from partition to result
    for (const partitionBox of partitionGraph.boxes) {
      if (
        partitionBox.kind === "fixed" &&
        !positionedBoxes.has(partitionBox.boxId)
      ) {
        const targetBoxIndex = result.boxes.findIndex(
          (b) => b.boxId === partitionBox.boxId,
        )
        if (targetBoxIndex !== -1) {
          result.boxes[targetBoxIndex] = {
            kind: "fixed" as const,
            boxId: partitionBox.boxId,
            center: partitionBox.center,
            boxAttributes: partitionBox.boxAttributes,
          } satisfies BpcFixedBox
          positionedBoxes.add(partitionBox.boxId)
        }
      }
    }

    // Copy pin positions (pin offsets are already preserved, but we can update them if needed)
    for (const partitionPin of partitionGraph.pins) {
      const pinKey = `${partitionPin.boxId}:${partitionPin.pinId}`
      if (!positionedPins.has(pinKey)) {
        const targetPinIndex = result.pins.findIndex(
          (p) =>
            p.boxId === partitionPin.boxId && p.pinId === partitionPin.pinId,
        )
        if (targetPinIndex !== -1) {
          result.pins[targetPinIndex] = {
            ...result.pins[targetPinIndex]!,
            offset: partitionPin.offset,
          }
          positionedPins.add(pinKey)
        }
      }
    }
  }

  return result
}

/**
 * Copy layout from a corpus match to a partition
 */
export function copyMatchedLayout(
  partition: PinRangePartition,
  matchedGraph: FixedBpcGraph,
): PinRangePartition {
  const updatedGraph = {
    boxes: [] as BpcBox[],
    pins: [] as BpcGraph["pins"],
  }

  // Create a mapping from partition to matched graph based on structure
  // For now, we'll do a simple mapping by index, but this could be more sophisticated
  const boxMapping = new Map<string, string>()
  const pinMapping = new Map<string, string>()

  // Map boxes (assuming same order/structure)
  for (
    let i = 0;
    i < Math.min(partition.graph.boxes.length, matchedGraph.boxes.length);
    i++
  ) {
    const partitionBox = partition.graph.boxes[i]!
    const matchedBox = matchedGraph.boxes[i]!
    boxMapping.set(partitionBox.boxId, matchedBox.boxId)
  }

  // Map pins based on network structure and position
  for (const partitionPin of partition.graph.pins) {
    // Find the best matching pin in the matched graph
    // This is a simplified approach - in practice, you'd want more sophisticated matching
    const matchedPin = matchedGraph.pins.find(
      (p) => boxMapping.get(partitionPin.boxId) === p.boxId,
    )
    if (matchedPin) {
      pinMapping.set(
        `${partitionPin.boxId}:${partitionPin.pinId}`,
        `${matchedPin.boxId}:${matchedPin.pinId}`,
      )
    }
  }

  // Copy boxes with layout from matched graph
  for (const box of partition.graph.boxes) {
    const matchedBoxId = boxMapping.get(box.boxId)
    const matchedBox = matchedGraph.boxes.find((b) => b.boxId === matchedBoxId)

    if (matchedBox) {
      updatedGraph.boxes.push({
        kind: "fixed" as const,
        boxId: box.boxId,
        center: matchedBox.center,
        boxAttributes: box.kind === "fixed" ? box.boxAttributes : undefined,
      } satisfies BpcFixedBox)
    } else {
      updatedGraph.boxes.push(box)
    }
  }

  // Copy pins with layout from matched graph
  for (const pin of partition.graph.pins) {
    const pinKey = `${pin.boxId}:${pin.pinId}`
    const matchedPinKey = pinMapping.get(pinKey)
    const matchedPin = matchedGraph.pins.find(
      (p) => `${p.boxId}:${p.pinId}` === matchedPinKey,
    )

    if (matchedPin) {
      updatedGraph.pins.push({
        ...pin,
        offset: matchedPin.offset,
      })
    } else {
      updatedGraph.pins.push(pin)
    }
  }

  return {
    ...partition,
    graph: updatedGraph,
  }
}
