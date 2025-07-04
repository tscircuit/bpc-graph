import { stackGraphicsHorizontally, type GraphicsObject } from "graphics-debug"
import { getGraphicsForBpcGraph } from "lib/debug/getGraphicsForBpcGraph"
import type { BpcGraph } from "lib/types"

export class AssignmentSolver2 {
  wipGraph: BpcGraph

  iterations = 0

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
