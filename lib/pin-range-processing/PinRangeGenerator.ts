import type { BpcGraph, PinRange } from "lib/types"

/**
 * Generates pin ranges for boxes in a BpcGraph, focusing on small ranges (1-3 pins)
 * that are likely to have matches in a corpus of small patterns.
 */
export class PinRangeGenerator {
  private graph: BpcGraph
  private usedRanges: Set<string> = new Set()
  private allRanges: PinRange[] = []
  private currentIndex = 0

  constructor(graph: BpcGraph) {
    this.graph = graph
    this.generateAllRanges()
  }

  /**
   * Generate all possible pin ranges, prioritizing smaller ranges
   */
  private generateAllRanges() {
    const ranges: PinRange[] = []

    // Group pins by box
    const pinsByBox = new Map<string, string[]>()
    for (const pin of this.graph.pins) {
      if (!pinsByBox.has(pin.boxId)) {
        pinsByBox.set(pin.boxId, [])
      }
      pinsByBox.get(pin.boxId)!.push(pin.pinId)
    }

    // Generate ranges for each box
    for (const [boxId, pinIds] of pinsByBox.entries()) {
      // Skip boxes with 2 or fewer pins as they're already small enough
      if (pinIds.length <= 2) {
        ranges.push({
          boxId,
          startPinIndex: 0,
          endPinIndex: pinIds.length,
        })
        continue
      }

      // For larger boxes, generate ranges of different sizes
      // Prioritize smaller ranges (1-3 pins)
      for (
        let rangeSize = 1;
        rangeSize <= Math.min(3, pinIds.length);
        rangeSize++
      ) {
        for (let start = 0; start <= pinIds.length - rangeSize; start++) {
          ranges.push({
            boxId,
            startPinIndex: start,
            endPinIndex: start + rangeSize,
          })
        }
      }
    }

    // Sort ranges by size (smaller first), then by box ID for consistency
    ranges.sort((a, b) => {
      const sizeA = a.endPinIndex - a.startPinIndex
      const sizeB = b.endPinIndex - b.startPinIndex
      if (sizeA !== sizeB) return sizeA - sizeB
      return a.boxId.localeCompare(b.boxId)
    })

    this.allRanges = ranges
  }

  /**
   * Get the next unused pin range
   */
  next(): PinRange | null {
    while (this.currentIndex < this.allRanges.length) {
      const range = this.allRanges[this.currentIndex]!
      this.currentIndex++

      const rangeKey = this.getRangeKey(range)
      if (!this.usedRanges.has(rangeKey)) {
        return range
      }
    }
    return null
  }

  /**
   * Mark a pin range as used (successfully matched and applied)
   */
  markRangeAsUsed(range: PinRange) {
    const rangeKey = this.getRangeKey(range)
    this.usedRanges.add(rangeKey)
  }

  /**
   * Generate a unique key for a pin range
   */
  private getRangeKey(range: PinRange): string {
    return `${range.boxId}:${range.startPinIndex}-${range.endPinIndex}`
  }

  /**
   * Reset the generator to start from the beginning
   */
  reset() {
    this.currentIndex = 0
  }

  /**
   * Get all unused ranges (useful for debugging)
   */
  getUnusedRanges(): PinRange[] {
    return this.allRanges.filter(
      (range) => !this.usedRanges.has(this.getRangeKey(range)),
    )
  }

  /**
   * Check if there are more ranges to process
   */
  hasNext(): boolean {
    return this.getUnusedRanges().length > 0
  }
}
