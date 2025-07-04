import { stackGraphicsHorizontally, type GraphicsObject } from "graphics-debug"
import { getGraphicsForBpcGraph } from "lib/debug/getGraphicsForBpcGraph"
import type { BpcGraph } from "lib/types"

type FloatingBoxId = string
type FixedBoxId = string

/**
 * Computes an assignment for each floating box to each fixed box by gradually
 * building a graph (the wipGraph) that is attempting to incrementally match the
 * floating graph (optimizing for a low WL distance)
 *
 * The wipGraph exists in the "Fixed Box" space, so all the box ids of the
 * wipGraph are fixed box ids. It basically represents what happens if you
 * construct a graph using the known assignments so far.
 *
 * Each iteration we test what the effect would be of adding a box to the
 * wipGraph, if it helps the WL distance, then we proceed with assigning it,
 * however if the WL distance goes down, then we reject the box.
 */
export class AssignmentSolver2 {
  wipGraph: BpcGraph

  iterations = 0
  solved = false

  acceptedFloatingBoxIds: Set<FloatingBoxId> = new Set()
  rejectedFloatingBoxIds: Set<FloatingBoxId> = new Set()
  assignment: Map<FloatingBoxId, FixedBoxId> = new Map()

  constructor(
    public floatingGraph: BpcGraph,
    public fixedGraph: BpcGraph,
  ) {
    this.wipGraph = {
      pins: [],
      boxes: [],
    }
  }

  /**
   * Returns the floating box id that should be assigned next.
   *
   * Currently this picks the boxes with the most pins first- but this
   * could be improved by picking the next box that is most relevant to the
   * network (e.g. a box that should be connected to the wipGraph)
   */
  getNextFloatingBoxId() {
    const remainingFloatingBoxIds = this.floatingGraph.boxes
      .map((b) => b.boxId)
      .filter(
        (b) =>
          !this.acceptedFloatingBoxIds.has(b) &&
          !this.rejectedFloatingBoxIds.has(b),
      )

    if (!remainingFloatingBoxIds.length) {
      throw new Error("No remaining floating box ids")
    }

    // Pick the floating box with the most pins
    let bestFloatingBoxId = remainingFloatingBoxIds[0]
    let bestFloatingBoxPinCount = 0
    for (const floatingBoxId of remainingFloatingBoxIds) {
      const floatingBoxPins = this.floatingGraph.pins.filter(
        (p) => p.boxId === floatingBoxId,
      )
      if (floatingBoxPins.length > bestFloatingBoxPinCount) {
        bestFloatingBoxId = floatingBoxId
        bestFloatingBoxPinCount = floatingBoxPins.length
      }
    }

    return bestFloatingBoxId
  }

  step() {
    if (this.solved) return
    if (this.iterations > 1000) {
      throw new Error("Too many iterations")
    }
    this.iterations++

    const nextFloatingBoxId = this.getNextFloatingBoxId()
  }

  visualize(): GraphicsObject {
    return stackGraphicsHorizontally([
      getGraphicsForBpcGraph(this.floatingGraph, {
        title: "Floating",
      }),
      getGraphicsForBpcGraph(this.wipGraph, {
        title: "WIP",
      }),
      getGraphicsForBpcGraph(this.fixedGraph, {
        title: "Fixed",
      }),
    ])
  }
}
