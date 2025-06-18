import type {
  BoxId,
  BpcGraph,
  ForceVec2,
  Vec2,
  BpcFloatingBox,
  BpcFixedBox,
} from "lib/types"
import type { ForceDirectedLayoutSolverHyperParameters } from "./ForceDirectedLayoutSolver"

export const applyForcesToGraph = (
  g: BpcGraph,
  appliedForces: Map<BoxId, ForceVec2[]>,
  hyperParameters: ForceDirectedLayoutSolverHyperParameters,
): BpcGraph => {
  const newBoxes = g.boxes.map((box) => {
    if (box.kind === "fixed") {
      return box as BpcFixedBox // Fixed boxes don't move
    }

    // Box is floating
    const forcesOnBox = appliedForces.get(box.boxId) || []
    if (forcesOnBox.length === 0) {
      return box as BpcFloatingBox // No forces, no movement
    }

    const totalForce: Vec2 = { x: 0, y: 0 }
    for (const force of forcesOnBox) {
      totalForce.x += force.x
      totalForce.y += force.y
    }

    // Calculate mass based on pin count
    const pinCount = g.pins.filter((p) => p.boxId === box.boxId).length
    const mass = 1 + pinCount * hyperParameters.PIN_MASS_MULTIPLIER

    let displacement: Vec2 = {
      x: (totalForce.x / mass) * hyperParameters.LEARNING_RATE,
      y: (totalForce.y / mass) * hyperParameters.LEARNING_RATE,
    }

    const displacementMagnitude = Math.sqrt(
      displacement.x ** 2 + displacement.y ** 2,
    )
    if (displacementMagnitude > hyperParameters.MAX_DISPLACEMENT_PER_STEP) {
      const scale =
        hyperParameters.MAX_DISPLACEMENT_PER_STEP / displacementMagnitude
      displacement.x *= scale
      displacement.y *= scale
    }

    // Floating boxes have `center?: Vec2`. It must be initialized.
    const currentCenter = box.center!

    const newCenter: Vec2 = {
      x: currentCenter.x + displacement.x,
      y: currentCenter.y + displacement.y,
    }

    return {
      ...box,
      center: newCenter,
    } as BpcFloatingBox
  })

  return {
    ...g,
    boxes: newBoxes as any, // Cast to any due to BpcGraph union type complexity
    // This assumes the structure remains valid for either FloatingBpcGraph or FixedBpcGraph
    // or that the consumer can handle mixed types if that's the actual case.
  }
}
