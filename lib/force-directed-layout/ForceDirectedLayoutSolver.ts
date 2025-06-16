import {BaseSolver} from "lib/generic-solvers/BaseSolver"
import type {BpcGraph} from "lib/types"

interface ForceDirectedLayoutSolverParams {
  graph: BpcGraph
}

/**
 * Types of forces exterted:
 * - Repulse boxes from other boxes
 * - Pull networked pins together
 * - Each pin emits a short "alignment axis" outward from the
 *   direction it's facing. It pulls pins on it's same network
 *   into it's alignment axis
 * - Small force towards the center of the graph (0,0)
 * 
 * Starting conditions:
 * - Fixed boxes start at their fixed position and don't move
 * - Floating boxes start 
 */
export class ForceDirectedLayoutSolver extends BaseSolver {
  graph: BpcGraph

  constructor(inputParams: ForceDirectedLayoutSolverParams) {
    super()
    this.graph = inputParams.graph
  }

  override _step() {

    

  }
}
