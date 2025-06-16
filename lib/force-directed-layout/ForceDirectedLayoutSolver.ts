import {BaseSolver} from "lib/generic-solvers/BaseSolver"
import type {BoxId, BpcGraph, ForceVec2, Vec2} from "lib/types"
import {addBoxRepulsionForces} from "./addBoxRepulsionForces"
import {addPinAlignmentForces} from "./addPinAlignmentForces"
import {addCenterOfGraphForce} from "./addCenterOfGraphForce"
import {addNetworkedPinPullingForces} from "./addNetworkedPinPullingForces"
import {applyForcesToGraph} from "./applyForcesToGraph"
import type {GraphicsObject} from "graphics-debug"
import {getGraphicsForBpcGraph} from "lib/debug/getGraphicsForBpcGraph"

interface ForceDirectedLayoutSolverParams {
  graph: BpcGraph
}

export interface ForceDirectedLayoutSolverHyperParameters {
  FORCE_LINE_MULTIPLIER: number
}

/**
 * Types of forces exterted:
 * - Repulse boxes from other boxes
 * - Pull networked pins together
 * - Each pin emits "alignment axis" outward from the
 *   direction it's facing. It pulls pins on it's same network
 *   into it's alignment axis (and only applies a force orthogonal
 *   to the alignment axis)
 * - Small force towards the center of the graph (0,0)
 * 
 * Starting conditions:
 * - Fixed boxes start at their fixed position and don't move
 * - Floating boxes start at either their center position or at
 *   a random position if their center isn't defined
 * - Pins do not change their offset relative to the box center,
 *   a force against a pin will move the floating box
 */
export class ForceDirectedLayoutSolver extends BaseSolver {
  graph: BpcGraph

  hyperParameters: ForceDirectedLayoutSolverHyperParameters = {
    FORCE_LINE_MULTIPLIER: 100
  }

  constructor(inputParams: ForceDirectedLayoutSolverParams) {
    super()
    this.graph = inputParams.graph
    this.initializeFloatingBoxPositions()
  }

  initializeFloatingBoxPositions() {
    // TODO
  }

  override _step() {
    const appliedForces: Map<BoxId, ForceVec2[]> = new Map()

    addBoxRepulsionForces(this.graph, appliedForces, this.hyperParameters)
    addPinAlignmentForces(this.graph, appliedForces, this.hyperParameters)
    addCenterOfGraphForce(this.graph, appliedForces, this.hyperParameters)
    addNetworkedPinPullingForces(this.graph, appliedForces, this.hyperParameters)


    this.graph = applyForcesToGraph(this.graph, appliedForces)
  }

  override visualize(): GraphicsObject {
    const baseGraphics = getGraphicsForBpcGraph(this.graph)

    // TODO add lines indicating the forces, use FORCE_LINE_MULTIPLIER
    // to scale the lines

    return baseGraphics
  }
}
