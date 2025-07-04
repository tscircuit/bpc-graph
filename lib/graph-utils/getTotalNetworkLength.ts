import type { FixedBpcGraph, NetworkId } from "lib/types"
import type { Vec2 } from "lib/types"

/**
 * Computes the total network length of a fixed graph
 *
 * We consider a simplified distance measure which is the sum of the distance of
 * each point in the network to the "network
 * center" which is an average of all points in the network.
 */
export const getTotalNetworkLength = (
  g: FixedBpcGraph,
): {
  totalNetworkLength: number
  networkLengths: Map<NetworkId, number>
} => {
  const networkPins = new Map<NetworkId, Vec2[]>()

  /* ─────── gather world-space pin positions per network ─────── */
  for (const pin of g.pins) {
    const box = g.boxes.find((b) => b.boxId === pin.boxId)
    if (!box || !box.center)
      throw new Error(
        `Expected fixed graph – box "${pin.boxId}" missing or has no center`,
      )

    const pos: Vec2 = {
      x: box.center.x + pin.offset.x,
      y: box.center.y + pin.offset.y,
    }
    if (!networkPins.has(pin.networkId)) networkPins.set(pin.networkId, [])
    networkPins.get(pin.networkId)!.push(pos)
  }

  /* ─────── compute per-network “lengths” ─────── */
  const networkLengths = new Map<NetworkId, number>()
  let totalNetworkLength = 0

  for (const [netId, positions] of networkPins) {
    if (positions.length === 0) {
      networkLengths.set(netId, 0)
      continue
    }

    // centre of mass
    const centre = positions.reduce(
      (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
      { x: 0, y: 0 } as Vec2,
    )
    centre.x /= positions.length
    centre.y /= positions.length

    // sum of distances to centre
    const len = positions.reduce((sum, p) => {
      const dx = p.x - centre.x
      const dy = p.y - centre.y
      return sum + Math.sqrt(dx * dx + dy * dy)
    }, 0)

    networkLengths.set(netId, len)
    totalNetworkLength += len
  }

  return { totalNetworkLength, networkLengths }
}
