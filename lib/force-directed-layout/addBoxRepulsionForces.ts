import type {BoxId, BpcGraph, ForceVec2, Vec2} from "lib/types"
import type {ForceDirectedLayoutSolverHyperParameters} from "./ForceDirectedLayoutSolver"

export const addBoxRepulsionForces = (
  g: BpcGraph,
  appliedForces: Map<BoxId, ForceVec2[]>,
  hyperParameters: ForceDirectedLayoutSolverHyperParameters
) => {
  for (let i = 0; i < g.boxes.length; i++) {
    for (let j = i + 1; j < g.boxes.length; j++) {
      const box1 = g.boxes[i]!;
      const box2 = g.boxes[j]!;

      // Fixed boxes have center. Floating box centers are assumed to be initialized.
      const center1 = box1.kind === "fixed" ? box1.center : box1.center!;
      const center2 = box2.kind === "fixed" ? box2.center : box2.center!;

      const dx = center1.x - center2.x;
      const dy = center1.y - center2.y;
      const distanceSquared = dx * dx + dy * dy;

      if (distanceSquared === 0) continue; // Avoid division by zero

      const distance = Math.sqrt(distanceSquared);
      
      const forceMagnitude = hyperParameters.BOX_REPULSION_STRENGTH / distanceSquared;

      const forceX = (dx / distance) * forceMagnitude;
      const forceY = (dy / distance) * forceMagnitude;

      const force1: ForceVec2 = { x: forceX, y: forceY, sourceStage: "box-repel" };
      const force2: ForceVec2 = { x: -forceX, y: -forceY, sourceStage: "box-repel" };

      if (box1.kind === "floating") {
        if (!appliedForces.has(box1.boxId)) appliedForces.set(box1.boxId, []);
        appliedForces.get(box1.boxId)!.push(force1);
      }
      if (box2.kind === "floating") {
        if (!appliedForces.has(box2.boxId)) appliedForces.set(box2.boxId, []);
        appliedForces.get(box2.boxId)!.push(force2);
      }
    }
  }
}
