import {BaseSolver} from "lib/generic-solvers/BaseSolver"
import type {BoxId, BpcFloatingBox, BpcGraph, ForceVec2, Vec2} from "lib/types"
import {addBoxRepulsionForces} from "./addBoxRepulsionForces"
import {addPinAlignmentForces} from "./addPinAlignmentForces"
import {addCenterOfGraphForce} from "./addCenterOfGraphForce"
import {addNetworkedPinPullingForces} from "./addNetworkedPinPullingForces"
import {applyForcesToGraph} from "./applyForcesToGraph"
import type {GraphicsObject} from "graphics-debug"
import {getGraphicsForBpcGraph} from "lib/debug/getGraphicsForBpcGraph"
import { getPinPosition } from "lib/graph-utils/getPinPosition"

interface ForceDirectedLayoutSolverParams {
  graph: BpcGraph
}

export interface ForceDirectedLayoutSolverHyperParameters {
  DISPLAY_FORCE_LINE_MULTIPLIER: number; // For visualization
  BOX_REPULSION_STRENGTH: number;
  PIN_PULL_STRENGTH: number; // Spring constant for networked pins
  PIN_ALIGNMENT_STRENGTH: number;
  PIN_ALIGNMENT_ACTIVATE_DISTANCE: number; // Max orthogonal distance for pin alignment force to activate
  PIN_ALIGNMENT_GUIDELINE_LENGTH: number; // Max parallel distance along the guideline for pin alignment
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
    DISPLAY_FORCE_LINE_MULTIPLIER: 2,
    BOX_REPULSION_STRENGTH: 1,
    PIN_PULL_STRENGTH: 0.1,
    PIN_ALIGNMENT_STRENGTH: 0.5,
    PIN_ALIGNMENT_ACTIVATE_DISTANCE: 0.15, 
    PIN_ALIGNMENT_GUIDELINE_LENGTH: 4,
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
    }) as BpcFloatingBox[]
  }

  override _step() {
    const appliedForces: Map<BoxId, ForceVec2[]> = new Map()

    addBoxRepulsionForces(this.graph, appliedForces, this.hyperParameters)
    addPinAlignmentForces(this.graph, appliedForces, this.hyperParameters)
    // addCenterOfGraphForce(this.graph, appliedForces, this.hyperParameters)
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

      const boxCenter = box.kind === "fixed" ? box.center : box.center!;
      if (!boxCenter && !forces.some(f => f.sourcePinId)) continue; 

      for (const force of forces) {
        let startPoint: Vec2;
        if (force.sourcePinId) {
          try {
            startPoint = getPinPosition(this.graph, force.sourcePinId);
          } catch (e) {
            // Fallback to boxCenter if pin not found (should not happen in normal operation)
            console.warn(`Could not find pin ${force.sourcePinId} for force visualization, falling back to box center.`);
            startPoint = boxCenter;
          }
        } else {
          startPoint = boxCenter;
        }
        
        // If startPoint is still undefined (e.g. boxCenter was undefined and no sourcePinId)
        // This can happen if a floating box hasn't been initialized yet, though unlikely here.
        if (!startPoint) continue;


        const endPoint = {
          x: startPoint.x + force.x * this.hyperParameters.DISPLAY_FORCE_LINE_MULTIPLIER,
          y: startPoint.y + force.y * this.hyperParameters.DISPLAY_FORCE_LINE_MULTIPLIER,
        }

        let strokeColor = "rgba(128, 128, 128, 0.5)"; // Default gray
        switch (force.sourceStage) {
          case "box-repel":
            strokeColor = "rgba(255, 0, 0, 0.5)"; // Red
            break;
          case "pin-align":
            strokeColor = "rgba(0, 255, 0, 0.5)"; // Green
            break;
          case "center-pull":
            strokeColor = "rgba(0, 0, 255, 0.5)"; // Blue
            break;
          case "networked-pin-pull":
            strokeColor = "rgba(255, 165, 0, 0.5)"; // Orange
            break;
        }

        if (!baseGraphics.lines) baseGraphics.lines = [];
        baseGraphics.lines.push({
          points: [startPoint, endPoint],
          strokeColor: strokeColor,
          label: force.sourcePinId ? `${force.sourceStage}_${force.sourcePinId}` : (force.sourceStage || "force"),
        })
      }
    }
    return baseGraphics
  }
}
