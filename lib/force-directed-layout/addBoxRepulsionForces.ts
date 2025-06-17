import type { BoxId, BpcGraph, ForceVec2, Vec2, Bounds } from "lib/types"
import type { ForceDirectedLayoutSolverHyperParameters } from "./ForceDirectedLayoutSolver"
import { getBoundsOfBpcBox } from "lib/graph-utils/getBoundsOfBpcBox"

function calculateEdgeToEdgeDistance(bounds1: Bounds, bounds2: Bounds): number {
  let sep_x = 0
  // Check for separation along X-axis
  if (bounds1.maxX < bounds2.minX) {
    // box1 is entirely to the left of box2
    sep_x = bounds2.minX - bounds1.maxX
  } else if (bounds2.maxX < bounds1.minX) {
    // box2 is entirely to the left of box1
    sep_x = bounds1.minX - bounds2.maxX
  }

  let sep_y = 0
  // Check for separation along Y-axis
  if (bounds1.maxY < bounds2.minY) {
    // box1 is entirely below box2
    sep_y = bounds2.minY - bounds1.maxY
  } else if (bounds2.maxY < bounds1.minY) {
    // box2 is entirely below box1
    sep_y = bounds1.minY - bounds2.maxY
  }

  if (sep_x > 0 && sep_y > 0) {
    // Separated in both axes (diagonal separation)
    return Math.sqrt(sep_x * sep_x + sep_y * sep_y)
  } else if (sep_x > 0) {
    // Separated only along X-axis (Y projections overlap)
    return sep_x
  } else if (sep_y > 0) {
    // Separated only along Y-axis (X projections overlap)
    return sep_y
  } else {
    // Boxes are overlapping or touching
    return 0
  }
}

export const addBoxRepulsionForces = (
  g: BpcGraph,
  appliedForces: Map<BoxId, ForceVec2[]>,
  hyperParameters: ForceDirectedLayoutSolverHyperParameters,
) => {
  for (let i = 0; i < g.boxes.length; i++) {
    for (let j = i + 1; j < g.boxes.length; j++) {
      const box1 = g.boxes[i]!
      const box2 = g.boxes[j]!

      const bounds1 = getBoundsOfBpcBox(g, box1.boxId)
      const bounds2 = getBoundsOfBpcBox(g, box2.boxId)
      const edgeDistance = calculateEdgeToEdgeDistance(bounds1, bounds2)

      const D1 = hyperParameters.BOX_REPEL_DISTANCE1
      const D2 = hyperParameters.BOX_REPEL_DISTANCE2
      const power = hyperParameters.BOX_CLOSE_REPULSION_POWER
      const minEffectiveEdgeDist =
        hyperParameters.BOX_MIN_EFFECTIVE_EDGE_DISTANCE
      let forceFactor: number

      if (edgeDistance <= D1) {
        // When edge distance is at or below D1, the force increases sharply
        // as edgeDistance approaches 0.
        // We use Math.max with minEffectiveEdgeDist to prevent division by zero or excessively large forces.
        const effectiveEdgeDist = Math.max(edgeDistance, minEffectiveEdgeDist)

        // Force factor is (D1 / effectiveEdgeDist)^power.
        // This means:
        // - If edgeDistance = D1, forceFactor = (D1/D1)^power = 1.
        // - As edgeDistance decreases towards minEffectiveEdgeDist, forceFactor increases.
        // - If edgeDistance is 0 (overlap), effectiveEdgeDist = minEffectiveEdgeDist,
        //   giving a large, but capped, forceFactor: (D1/minEffectiveEdgeDist)^power.
        // Assumes D1 > 0. If D1 is 0, this formula might need adjustment, but D1 is expected to be positive.
        if (D1 > 0 && effectiveEdgeDist > 0) {
          forceFactor = (D1 / effectiveEdgeDist) ** power
        } else {
          // Fallback for degenerate cases (e.g., D1 is zero or negative)
          // If boxes are overlapping (edgeDistance <= 0), apply a strong repulsion.
          // Otherwise, if D1 is not configured sensibly, default to a factor of 1.
          forceFactor =
            edgeDistance <= 0
              ? hyperParameters.BOX_REPEL_DISTANCE1 > 0 &&
                minEffectiveEdgeDist > 0
                ? (hyperParameters.BOX_REPEL_DISTANCE1 /
                    minEffectiveEdgeDist) **
                  power
                : 100
              : 1.0
        }
      } else if (edgeDistance >= D2 || D1 >= D2) {
        // If edgeDistance is beyond D2, or if D1 is not less than D2 (no valid ramp region),
        // then the force factor is 0.
        forceFactor = 0.0
      } else {
        // D1 < edgeDistance < D2 (linear ramp down from 1 to 0)
        // This part remains the same: forceFactor transitions linearly from 1 (at D1) to 0 (at D2).
        forceFactor = (D2 - edgeDistance) / (D2 - D1)
      }

      if (forceFactor <= 0) {
        // Includes 0 and tiny negatives from float precision
        continue
      }

      // Fixed boxes have center. Floating box centers are assumed to be initialized.
      const center1 = box1.kind === "fixed" ? box1.center : box1.center!
      const center2 = box2.kind === "fixed" ? box2.center : box2.center!

      const dx = center1.x - center2.x
      const dy = center1.y - center2.y
      const distanceSquared = dx * dx + dy * dy

      if (distanceSquared === 0) continue // Avoid division by zero if centers coincide

      const distance = Math.sqrt(distanceSquared)

      const baseForceMagnitude =
        hyperParameters.BOX_REPULSION_STRENGTH / distanceSquared
      const finalForceMagnitude = baseForceMagnitude * forceFactor

      const forceX = (dx / distance) * finalForceMagnitude
      const forceY = (dy / distance) * finalForceMagnitude

      const force1: ForceVec2 = {
        x: forceX,
        y: forceY,
        sourceStage: "box-repel",
      }
      const force2: ForceVec2 = {
        x: -forceX,
        y: -forceY,
        sourceStage: "box-repel",
      }

      if (box1.kind === "floating") {
        if (!appliedForces.has(box1.boxId)) appliedForces.set(box1.boxId, [])
        appliedForces.get(box1.boxId)!.push(force1)
      }
      if (box2.kind === "floating") {
        if (!appliedForces.has(box2.boxId)) appliedForces.set(box2.boxId, [])
        appliedForces.get(box2.boxId)!.push(force2)
      }
    }
  }
}
