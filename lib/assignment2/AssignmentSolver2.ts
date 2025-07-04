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

  rejectedFloatingBoxIds: FloatingBoxId[] = []
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

  step() {
    this.iterations++
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
