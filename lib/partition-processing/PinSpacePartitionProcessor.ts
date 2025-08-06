import type { GraphicsObject } from "graphics-debug"
import { getGraphicsForBpcGraph } from "lib/debug/getGraphicsForBpcGraph"
import type { BoxId, BpcGraph, BpcPin, MixedBpcGraph } from "lib/types"

/**
 * Partitions a canonical right-facing graph into smaller right-facing graphs
 * by breaking where there is a particularly large gap between pins
 */
export class PinSpacePartitionProcessor {
  inputGraph: MixedBpcGraph
  minGap: number
  pinQueue: BpcPin[]

  centerBoxId: BoxId

  finishedPinGroups: Array<BpcPin[]> = []
  currentPinGroup: BpcPin[] = []

  stage: "pin-grouping" | "partition-building" = "pin-grouping"

  iteration = 0
  solved = false
  failed = false

  constructor(params: {
    inputGraph: MixedBpcGraph

    /**
     * Minimum gap required to cut between two pins for a partition
     */
    minGap: number

    centerBoxId: BoxId

    /**
     * We'll copy the center pins to each partition
     */
    centerPinColors?: string[]
  }) {
    this.inputGraph = params.inputGraph
    this.minGap = params.minGap
    this.centerBoxId = params.centerBoxId
    this.pinQueue = params.inputGraph.pins
      .filter((p) => p.boxId === this.centerBoxId)
      .filter((p) => !params.centerPinColors?.includes(p.color))
      .sort((a, b) => b.offset.y - a.offset.y)
  }

  step() {
    if (this.stage === "pin-grouping") {
      if (this.pinQueue.length === 0) {
        // No more pins to process, finish current group and move to partition building
        if (this.currentPinGroup.length > 0) {
          this.finishedPinGroups.push([...this.currentPinGroup])
          this.currentPinGroup = []
        }
        this.stage = "partition-building"
        this.solved = true
        return
      }

      // Dequeue the next pin
      const nextPin = this.pinQueue.shift()!

      // If this is the first pin or current group is empty, add it to current group
      if (this.currentPinGroup.length === 0) {
        this.currentPinGroup.push(nextPin)
      } else {
        // Check gap between last pin in current group and next pin
        const lastPin = this.currentPinGroup[this.currentPinGroup.length - 1]!
        const gap = Math.abs(nextPin.offset.y - lastPin.offset.y)

        if (gap >= this.minGap) {
          // Gap is large enough, finish current group and start new one
          this.finishedPinGroups.push([...this.currentPinGroup])
          this.currentPinGroup = [nextPin]
        } else {
          // Gap is too small, add to current group
          this.currentPinGroup.push(nextPin)
        }
      }
    }

    this.iteration++
  }

  solve() {
    while (!this.solved && !this.failed) {
      this.step()
    }
  }

  getPartitions(): MixedBpcGraph[] {
    throw new Error("Not implemented")
  }

  visualize(): GraphicsObject {
    const go = getGraphicsForBpcGraph(this.inputGraph)

    // Get the center box to calculate pin positions
    const centerBox = this.inputGraph.boxes.find(
      (b) => b.boxId === this.centerBoxId,
    )
    const centerPosition = centerBox?.center ?? { x: 0, y: 0 }

    // Colors for highlighting different pin groups
    const groupColors = [
      "#ff6b6b",
      "#4ecdc4",
      "#45b7d1",
      "#96ceb4",
      "#feca57",
      "#ff9ff3",
      "#54a0ff",
      "#5f27cd",
      "#00d2d3",
      "#ff9f43",
    ]

    // Highlight finished pin groups
    this.finishedPinGroups.forEach((pinGroup, groupIndex) => {
      if (pinGroup.length === 0) return

      const color = groupColors[groupIndex % groupColors.length]

      // Create a rectangle that encompasses all pins in the group
      const minY = Math.min(
        ...pinGroup.map((p) => p.offset.y + centerPosition.y),
      )
      const maxY = Math.max(
        ...pinGroup.map((p) => p.offset.y + centerPosition.y),
      )
      const minX = Math.min(
        ...pinGroup.map((p) => p.offset.x + centerPosition.x),
      )
      const maxX = Math.max(
        ...pinGroup.map((p) => p.offset.x + centerPosition.x),
      )

      go.rects.push({
        center: {
          x: (minX + maxX) / 2,
          y: (minY + maxY) / 2,
        },
        width: maxX - minX + 0.2,
        height: maxY - minY + 0.1,
        fill: `${color}33`, // Add transparency
        stroke: color,
      })
    })

    // Highlight current pin group (in progress)
    if (this.currentPinGroup.length > 0) {
      const color =
        groupColors[this.finishedPinGroups.length % groupColors.length]

      const minY = Math.min(
        ...this.currentPinGroup.map((p) => p.offset.y + centerPosition.y),
      )
      const maxY = Math.max(
        ...this.currentPinGroup.map((p) => p.offset.y + centerPosition.y),
      )
      const minX = Math.min(
        ...this.currentPinGroup.map((p) => p.offset.x + centerPosition.x),
      )
      const maxX = Math.max(
        ...this.currentPinGroup.map((p) => p.offset.x + centerPosition.x),
      )

      go.rects.push({
        center: {
          x: (minX + maxX) / 2,
          y: (minY + maxY) / 2,
        },
        width: maxX - minX + 0.2,
        height: maxY - minY + 0.1,
        fill: `${color}4D`, // Add more transparency for current group
        stroke: color,
      })
    }

    return go
  }
}
