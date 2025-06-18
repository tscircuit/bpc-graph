import { getPinDirection } from "lib/graph-utils/getPinDirection"
import type { BpcGraph, PinId, Direction } from "lib/types"

export const precomputePinDirections = (g: BpcGraph): Map<PinId, Direction> => {
  const directions = new Map<PinId, Direction>()
  for (const pin of g.pins) {
    try {
      // Assuming getPinDirection is robust or graphs are well-formed.
      // If getPinDirection can fail for valid heuristic scenarios, error handling might be needed.
      directions.set(pin.pinId, getPinDirection(g, pin.pinId))
    } catch (e) {
      // Log a warning if a pin's direction cannot be determined.
      // Such pins will likely not match any other pins by direction.
      console.warn(
        `Could not determine direction for pin ${pin.pinId} in precomputePinDirections: ${(e as Error).message}`,
      )
      // Depending on strictness, could throw, or assign a special "unknown" direction.
      // For now, pins without a computable direction won't be included in the map.
    }
  }
  return directions
}
