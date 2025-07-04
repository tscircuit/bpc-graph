import type { BpcGraph, NetworkId } from "lib/types"

export const computeBagOfAnglesForNetwork = (
  g: BpcGraph,
  networkId: NetworkId,
): number[] => {
  const pins = g.pins.filter((p) => p.networkId === networkId)

  const angles: number[] = []

  for (const pin of pins) {
    const pinAngle = Math.atan2(pin.offset.y, pin.offset.x)

    angles.push(pinAngle)
  }

  return angles
}
