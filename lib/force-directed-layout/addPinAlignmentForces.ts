import type {BoxId, BpcGraph, ForceVec2, Vec2, Direction} from "lib/types"
import type {ForceDirectedLayoutSolverHyperParameters} from "./ForceDirectedLayoutSolver"
import { getPinPosition } from "lib/graph-utils/getPinPosition";
import { getPinDirection } from "lib/graph-utils/getPinDirection";
import { getGraphNetworkIds } from "lib/graph-utils/getGraphNetworkIds";

export const addPinAlignmentForces = (
  g: BpcGraph,
  appliedForces: Map<BoxId, ForceVec2[]>,
  hyperParameters: ForceDirectedLayoutSolverHyperParameters
) => {
  const networkIds = getGraphNetworkIds(g);
  const alignmentStrength = hyperParameters.PIN_ALIGNMENT_STRENGTH;

  for (const networkId of networkIds) {
    const pinsInNetwork = g.pins.filter(p => p.networkId === networkId);

    for (const pinEmitter of pinsInNetwork) {
      const emitterPos = getPinPosition(g, pinEmitter.pinId);
      const emitterDir = getPinDirection(g, pinEmitter.pinId);

      for (const pinTarget of pinsInNetwork) {
        if (pinEmitter.pinId === pinTarget.pinId) continue;

        const targetPos = getPinPosition(g, pinTarget.pinId);
        
        let forceX = 0;
        let forceY = 0;
        const activateDistance = hyperParameters.PIN_ALIGNMENT_ACTIVATE_DISTANCE;
        const guidelineLength = hyperParameters.PIN_ALIGNMENT_GUIDELINE_LENGTH;

        if (emitterDir === "x+" || emitterDir === "x-") {
          // Alignment axis is horizontal (Y is constant: emitterPos.y)
          // Force is vertical.
          const deltaYOrthogonal = emitterPos.y - targetPos.y; // Orthogonal distance
          const deltaXParallel = targetPos.x - emitterPos.x; // Parallel distance from emitter

          const withinActivateDistance = Math.abs(deltaYOrthogonal) <= activateDistance;
          let withinGuidelineLength = false;

          if (emitterDir === "x+") { // Guideline extends in +x direction
            withinGuidelineLength = deltaXParallel >= 0 && deltaXParallel <= guidelineLength;
          } else { // emitterDir === "x-", guideline extends in -x direction
            withinGuidelineLength = deltaXParallel <= 0 && deltaXParallel >= -guidelineLength;
          }

          if (withinActivateDistance && withinGuidelineLength) {
            forceY = deltaYOrthogonal * alignmentStrength;
          }
        } else { // emitterDir === "y+" || emitterDir === "y-"
          // Alignment axis is vertical (X is constant: emitterPos.x)
          // Force is horizontal.
          const deltaXOrthogonal = emitterPos.x - targetPos.x; // Orthogonal distance
          const deltaYParallel = targetPos.y - emitterPos.y; // Parallel distance from emitter

          const withinActivateDistance = Math.abs(deltaXOrthogonal) <= activateDistance;
          let withinGuidelineLength = false;

          if (emitterDir === "y+") { // Guideline extends in +y direction
            withinGuidelineLength = deltaYParallel >= 0 && deltaYParallel <= guidelineLength;
          } else { // emitterDir === "y-", guideline extends in -y direction
            withinGuidelineLength = deltaYParallel <= 0 && deltaYParallel >= -guidelineLength;
          }

          if (withinActivateDistance && withinGuidelineLength) {
            forceX = deltaXOrthogonal * alignmentStrength;
          }
        }

        // Only apply force if it's non-zero
        if (forceX !== 0 || forceY !== 0) {
          const targetBox = g.boxes.find(b => b.boxId === pinTarget.boxId);
          if (targetBox && targetBox.kind === "floating") {
            const force: ForceVec2 = { 
              x: forceX, 
              y: forceY, 
              sourceStage: "pin-align", 
              sourcePinId: pinTarget.pinId 
            };
            if (!appliedForces.has(targetBox.boxId)) appliedForces.set(targetBox.boxId, []);
            appliedForces.get(targetBox.boxId)!.push(force);
          }
        }
      }
    }
  }
}
