import type { BoxId, BpcGraph, ForceVec2, Vec2 } from "lib/types"
import type { ForceDirectedLayoutSolverHyperParameters } from "./ForceDirectedLayoutSolver"
import { getPinPosition } from "lib/graph-utils/getPinPosition"
import { getGraphNetworkIds } from "lib/graph-utils/getGraphNetworkIds"
import { getPinDirectionOrThrow } from "lib/graph-utils/getPinDirection"

export const addNetworkedPinPullingForces = (
  g: BpcGraph,
  appliedForces: Map<BoxId, ForceVec2[]>,
  hyperParameters: ForceDirectedLayoutSolverHyperParameters,
) => {
  const networkIds = getGraphNetworkIds(g)

  for (const networkId of networkIds) {
    const pinsInNetwork = g.pins.filter((p) => p.networkId === networkId)

    for (let i = 0; i < pinsInNetwork.length; i++) {
      for (let j = i + 1; j < pinsInNetwork.length; j++) {
        const pin1 = pinsInNetwork[i]!
        const pin2 = pinsInNetwork[j]!

        const dir1 = getPinDirectionOrThrow(g, pin1.boxId, pin1.pinId)
        const dir2 = getPinDirectionOrThrow(g, pin2.boxId, pin2.pinId)

        if (dir1 === dir2) {
          continue // Pins facing the same direction do not pull each other
        }

        const pos1 = getPinPosition(g, pin1.pinId)
        const pos2 = getPinPosition(g, pin2.pinId)

        const dx = pos2.x - pos1.x
        const dy = pos2.y - pos1.y

        const springConstant = hyperParameters.PIN_PULL_STRENGTH
        const networkSize = pinsInNetwork.length

        // Avoid division by zero, though networkSize should be >= 2 here
        const forceDivisor = (networkSize > 0 ? networkSize : 1) ** 2

        const forceX = (dx * springConstant) / forceDivisor
        const forceY = (dy * springConstant) / forceDivisor

        const forceOnPin1Box: ForceVec2 = {
          x: forceX,
          y: forceY,
          sourceStage: "networked-pin-pull",
          sourcePinId: pin1.pinId,
        }
        const forceOnPin2Box: ForceVec2 = {
          x: -forceX,
          y: -forceY,
          sourceStage: "networked-pin-pull",
          sourcePinId: pin2.pinId,
        }

        const box1 = g.boxes.find((b) => b.boxId === pin1.boxId)
        const box2 = g.boxes.find((b) => b.boxId === pin2.boxId)

        if (box1 && box1.kind === "floating") {
          if (!appliedForces.has(box1.boxId)) appliedForces.set(box1.boxId, [])
          appliedForces.get(box1.boxId)!.push(forceOnPin1Box)
        }
        if (box2 && box2.kind === "floating") {
          if (!appliedForces.has(box2.boxId)) appliedForces.set(box2.boxId, [])
          appliedForces.get(box2.boxId)!.push(forceOnPin2Box)
        }
      }
    }
  }
}
