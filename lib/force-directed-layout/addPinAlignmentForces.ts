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
      let emitterDir: Direction;
      try {
        emitterDir = getPinDirection(g, pinEmitter.pinId);
      } catch (e) {
        // Pin might not be on an edge, so it has no clear direction. Skip.
        continue;
      }

      for (const pinTarget of pinsInNetwork) {
        if (pinEmitter.pinId === pinTarget.pinId) continue;

        const targetPos = getPinPosition(g, pinTarget.pinId);
        
        let forceX = 0;
        let forceY = 0;

        if (emitterDir === "x+" || emitterDir === "x-") {
          // Alignment axis is horizontal (Y is constant: emitterPos.y)
          // Force is vertical.
          const deltaY = emitterPos.y - targetPos.y;
          forceY = deltaY * alignmentStrength;
        } else { // emitterDir === "y+" || emitterDir === "y-"
          // Alignment axis is vertical (X is constant: emitterPos.x)
          // Force is horizontal.
          const deltaX = emitterPos.x - targetPos.x;
          forceX = deltaX * alignmentStrength;
        }

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
