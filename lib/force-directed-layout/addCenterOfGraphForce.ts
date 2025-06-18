import type { BoxId, BpcGraph, ForceVec2, Vec2 } from "lib/types"
import type { ForceDirectedLayoutSolverHyperParameters } from "./ForceDirectedLayoutSolver"

export const addCenterOfGraphForce = (
  g: BpcGraph,
  appliedForces: Map<BoxId, ForceVec2[]>,
  hyperParameters: ForceDirectedLayoutSolverHyperParameters,
) => {
  for (const box of g.boxes) {
    if (box.kind === "floating") {
      // Floating boxes have `center?: Vec2`. Assume it's initialized by initializeFloatingBoxPositions.
      const boxCenter = box.center!

      const forceMagnitude = hyperParameters.CENTER_OF_GRAPH_STRENGTH
      // Force direction is from boxCenter towards origin (0,0)
      const forceX = -boxCenter.x * forceMagnitude
      const forceY = -boxCenter.y * forceMagnitude

      const force: ForceVec2 = {
        x: forceX,
        y: forceY,
        sourceStage: "center-pull",
      }

      if (!appliedForces.has(box.boxId)) {
        appliedForces.set(box.boxId, [])
      }
      appliedForces.get(box.boxId)!.push(force)
    }
  }
}
