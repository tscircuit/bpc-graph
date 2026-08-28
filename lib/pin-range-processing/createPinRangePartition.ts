import type {
  BpcGraph,
  PinRange,
  PinRangePartition,
  BpcPin,
  BpcBox,
} from "lib/types"

/**
 * Create a BpcGraph partition containing only the specified pin ranges
 */
export function createPinRangePartition(
  graph: BpcGraph,
  ranges: PinRange[],
): PinRangePartition {
  const includedPins = new Set<string>()
  const includedBoxes = new Set<string>()

  // Group pins by box to enable range selection
  const pinsByBox = new Map<string, BpcPin[]>()
  for (const pin of graph.pins) {
    if (!pinsByBox.has(pin.boxId)) {
      pinsByBox.set(pin.boxId, [])
    }
    pinsByBox.get(pin.boxId)!.push(pin)
  }

  // Sort pins within each box consistently (by pinId for now)
  for (const pins of pinsByBox.values()) {
    pins.sort((a, b) => a.pinId.localeCompare(b.pinId))
  }

  // Select pins based on ranges
  const selectedPins: BpcPin[] = []
  for (const range of ranges) {
    const boxPins = pinsByBox.get(range.boxId)
    if (!boxPins) continue

    includedBoxes.add(range.boxId)

    // Select pins in the specified range
    for (
      let i = range.startPinIndex;
      i < range.endPinIndex && i < boxPins.length;
      i++
    ) {
      const pin = boxPins[i]!
      const pinKey = `${pin.boxId}:${pin.pinId}`
      if (!includedPins.has(pinKey)) {
        selectedPins.push(pin)
        includedPins.add(pinKey)
      }
    }
  }

  // Include all pins that are on the same networks as selected pins
  const includeNetworks = new Set<string>()
  for (const pin of selectedPins) {
    includeNetworks.add(pin.networkId)
  }

  const partitionPins: BpcPin[] = []
  for (const pin of graph.pins) {
    const pinKey = `${pin.boxId}:${pin.pinId}`
    if (includedPins.has(pinKey) || includeNetworks.has(pin.networkId)) {
      partitionPins.push(pin)
      includedBoxes.add(pin.boxId)
    }
  }

  // Include all necessary boxes
  const partitionBoxes: BpcBox[] = graph.boxes.filter((box) =>
    includedBoxes.has(box.boxId),
  )

  const partitionGraph: BpcGraph = {
    boxes: partitionBoxes,
    pins: partitionPins,
  }

  return {
    ranges,
    graph: partitionGraph,
  }
}
