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
      .filter((p) => p.boxId !== this.centerBoxId)
      .filter((p) => !params.centerPinColors?.includes(p.color))
      .sort((a, b) => a.offset.y - b.offset.y)
  }

  step() {
    throw new Error("Not implemented")
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

    // TODO highlight the current partition and all created partitions
    // go.rects.push({...})

    return go
  }
}
