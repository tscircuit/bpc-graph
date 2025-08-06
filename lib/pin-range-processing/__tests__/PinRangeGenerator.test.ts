import { describe, test, expect } from "bun:test"
import { PinRangeGenerator } from "../PinRangeGenerator"
import type { BpcGraph } from "lib/types"

describe("PinRangeGenerator", () => {
  test("generates ranges for small boxes", () => {
    const graph: BpcGraph = {
      boxes: [
        { kind: "floating", boxId: "box1" },
        { kind: "floating", boxId: "box2" },
      ],
      pins: [
        {
          boxId: "box1",
          pinId: "pin1",
          networkId: "net1",
          color: "red",
          offset: { x: 0, y: 0 },
        },
        {
          boxId: "box1",
          pinId: "pin2",
          networkId: "net2",
          color: "blue",
          offset: { x: 1, y: 0 },
        },
        {
          boxId: "box2",
          pinId: "pin1",
          networkId: "net1",
          color: "red",
          offset: { x: 0, y: 0 },
        },
      ],
    }

    const generator = new PinRangeGenerator(graph)

    const ranges = []
    let range
    while ((range = generator.next())) {
      ranges.push(range)
    }

    // Should generate ranges for both boxes
    expect(ranges.length).toBeGreaterThan(0)

    // Should include the full box2 range (only 1 pin)
    const box2Range = ranges.find(
      (r) => r.boxId === "box2" && r.startPinIndex === 0 && r.endPinIndex === 1,
    )
    expect(box2Range).toBeDefined()

    // Should include the full box1 range (2 pins)
    const box1FullRange = ranges.find(
      (r) => r.boxId === "box1" && r.startPinIndex === 0 && r.endPinIndex === 2,
    )
    expect(box1FullRange).toBeDefined()
  })

  test("generates smaller ranges for larger boxes", () => {
    const graph: BpcGraph = {
      boxes: [{ kind: "floating", boxId: "largeBox" }],
      pins: [
        {
          boxId: "largeBox",
          pinId: "pin1",
          networkId: "net1",
          color: "red",
          offset: { x: 0, y: 0 },
        },
        {
          boxId: "largeBox",
          pinId: "pin2",
          networkId: "net2",
          color: "blue",
          offset: { x: 1, y: 0 },
        },
        {
          boxId: "largeBox",
          pinId: "pin3",
          networkId: "net3",
          color: "green",
          offset: { x: 2, y: 0 },
        },
        {
          boxId: "largeBox",
          pinId: "pin4",
          networkId: "net4",
          color: "yellow",
          offset: { x: 3, y: 0 },
        },
      ],
    }

    const generator = new PinRangeGenerator(graph)

    const ranges = []
    let range
    while ((range = generator.next())) {
      ranges.push(range)
    }

    // Should prioritize smaller ranges
    const singlePinRanges = ranges.filter(
      (r) => r.endPinIndex - r.startPinIndex === 1,
    )
    const twoPinRanges = ranges.filter(
      (r) => r.endPinIndex - r.startPinIndex === 2,
    )
    const threePinRanges = ranges.filter(
      (r) => r.endPinIndex - r.startPinIndex === 3,
    )

    // Should generate multiple ranges of different sizes
    expect(singlePinRanges.length).toBe(4) // 4 single pin ranges
    expect(twoPinRanges.length).toBe(3) // 3 two-pin ranges
    expect(threePinRanges.length).toBe(2) // 2 three-pin ranges

    // Ranges should be sorted by size (smaller first)
    expect(ranges[0]!.endPinIndex - ranges[0]!.startPinIndex).toBe(1)
  })

  test("can mark ranges as used", () => {
    const graph: BpcGraph = {
      boxes: [{ kind: "floating", boxId: "box1" }],
      pins: [
        {
          boxId: "box1",
          pinId: "pin1",
          networkId: "net1",
          color: "red",
          offset: { x: 0, y: 0 },
        },
        {
          boxId: "box1",
          pinId: "pin2",
          networkId: "net2",
          color: "blue",
          offset: { x: 1, y: 0 },
        },
      ],
    }

    const generator = new PinRangeGenerator(graph)

    const firstRange = generator.next()
    expect(firstRange).toBeDefined()

    if (firstRange) {
      generator.markRangeAsUsed(firstRange)

      // Reset and check that the marked range is skipped
      generator.reset()
      const nextRange = generator.next()
      expect(nextRange).not.toEqual(firstRange)
    }
  })
})
