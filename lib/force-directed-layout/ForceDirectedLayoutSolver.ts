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
  FORCE_LINE_MULTIPLIER: number; // For visualization
  BOX_REPULSION_STRENGTH: number;
  PIN_PULL_STRENGTH: number; // Spring constant for networked pins
  PIN_ALIGNMENT_STRENGTH: number;
  CENTER_OF_GRAPH_STRENGTH: number;
  LEARNING_RATE: number; // Step size for applying forces
  MAX_DISPLACEMENT_PER_STEP: number; // Optional: to cap movement
  RANDOM_INITIAL_PLACEMENT_MAX_X: number; // For initializing floating box positions
  RANDOM_INITIAL_PLACEMENT_MAX_Y: number; // For initializing floating box positions
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
  lastAppliedForces: Map<BoxId, ForceVec2[]> = new Map()

  hyperParameters: ForceDirectedLayoutSolverHyperParameters = {
    FORCE_LINE_MULTIPLIER: 100,
    BOX_REPULSION_STRENGTH: 10,
    PIN_PULL_STRENGTH: 0.1,
    PIN_ALIGNMENT_STRENGTH: 0.5,
    CENTER_OF_GRAPH_STRENGTH: 0.01,
    LEARNING_RATE: 0.1,
    MAX_DISPLACEMENT_PER_STEP: 1,
    RANDOM_INITIAL_PLACEMENT_MAX_X: 10,
    RANDOM_INITIAL_PLACEMENT_MAX_Y: 10,
  }

  constructor(inputParams: ForceDirectedLayoutSolverParams) {
    super()
    this.graph = inputParams.graph
    this.initializeFloatingBoxPositions()
  }

  initializeFloatingBoxPositions() {
    this.graph.boxes = this.graph.boxes.map(box => {
      if (box.kind === "floating" && box.center === undefined) {
        return {
          ...box,
          center: {
            x: (Math.random() - 0.5) * 2 * this.hyperParameters.RANDOM_INITIAL_PLACEMENT_MAX_X,
            y: (Math.random() - 0.5) * 2 * this.hyperParameters.RANDOM_INITIAL_PLACEMENT_MAX_Y,
          },
        };
      }
      return box;
    });
  }

  override _step() {
    const appliedForces: Map<BoxId, ForceVec2[]> = new Map()

    addBoxRepulsionForces(this.graph, appliedForces, this.hyperParameters)
    addPinAlignmentForces(this.graph, appliedForces, this.hyperParameters)
    addCenterOfGraphForce(this.graph, appliedForces, this.hyperParameters)
    addNetworkedPinPullingForces(this.graph, appliedForces, this.hyperParameters)

    this.lastAppliedForces = appliedForces;

    this.graph = applyForcesToGraph(this.graph, appliedForces, this.hyperParameters)
  }

  override visualize(): GraphicsObject {
    const baseGraphics = getGraphicsForBpcGraph(this.graph)

    // Add lines indicating the forces
    for (const [boxId, forces] of this.lastAppliedForces) {
      const box = this.graph.boxes.find(b => b.boxId === boxId)
      if (!box) continue;

      // Determine the center from which to draw force lines
      // For floating boxes, center must be defined after initialization.
      // For fixed boxes, center is always defined.
      const boxCenter = box.kind === "fixed" ? box.center : box.center!;

      if (!boxCenter) continue; // Should not happen if initialized

      for (const force of forces) {
        const startPoint = boxCenter;
        const endPoint = {
          x: startPoint.x + force.x * this.hyperParameters.FORCE_LINE_MULTIPLIER,
          y: startPoint.y + force.y * this.hyperParameters.FORCE_LINE_MULTIPLIER,
        }
        if (!baseGraphics.lines) baseGraphics.lines = [];
        baseGraphics.lines.push({
          points: [startPoint, endPoint],
          strokeColor: "rgba(255, 0, 0, 0.5)", // Red for forces
          label: force.source || "force",
        })
      }
    }
    return baseGraphics
  }
}
