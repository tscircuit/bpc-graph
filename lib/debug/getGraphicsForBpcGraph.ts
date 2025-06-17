import { center } from "../graph-utils/center"
import { getBoundsOfBpcBox } from "../graph-utils/getBoundsOfBpcBox"
import { getColorByIndex } from "../graph-utils/getColorByIndex"
import { getGraphBounds } from "../graph-utils/getGraphBounds"
import { getGraphNetworkIds } from "../graph-utils/getGraphNetworkIds"
import { getPinPosition } from "../graph-utils/getPinPosition"
import type { BpcGraph } from "../types"
import type { GraphicsObject } from "graphics-debug"
import { translateColor } from "./translateColor"

export const getGraphicsForBpcGraph = (
  g: BpcGraph,
  opts?: {
    grayNetworks?: boolean
  },
) => {
  const graphics: Required<GraphicsObject> = {
    points: [],
    lines: [],
    rects: [],
    circles: [],
    coordinateSystem: "cartesian",
    title: "BPC Graph Graphics",
  }

  for (const box of g.boxes) {
    const bounds = getBoundsOfBpcBox(g, box.boxId)
    const boundsCenter = center(bounds)

    graphics.rects.push({
      label: box.boxId,
      center: boundsCenter,
      width: bounds.maxX - bounds.minX + 0.1,
      height: bounds.maxY - bounds.minY + 0.1,
      fill: "rgba(0, 0, 0, 0.2)",
    })

    const boxPins = g.pins.filter((p) => p.boxId === box.boxId)
    const boxCenter = box.center ?? boundsCenter

    for (const pin of boxPins) {
      graphics.points.push({
        x: pin.offset.x + boxCenter.x,
        y: pin.offset.y + boxCenter.y,
        label: pin.pinId,
        color: translateColor(pin.color),
      })
    }
  }

  // To draw a network, we want to draw a line between each pair of pins in the
  // network
  // Each network is given a unique color and has a low opacity
  const networks = getGraphNetworkIds(g)

  for (let ni = 0; ni < networks.length; ni++) {
    const networkId = networks[ni]
    const networkColor = getColorByIndex(ni, networks.length, 0.2)
    const pins = g.pins.filter((p) => p.networkId === networkId)

    // Precompute pin positions for efficiency
    const pinsInNetworkWithPosition = pins.map((pin) => ({
      pin,
      position: getPinPosition(g, pin.pinId),
    }))

    for (let i = 0; i < pinsInNetworkWithPosition.length; i++) {
      const { pin: pin1, position: pos1 } = pinsInNetworkWithPosition[i]!

      // Compute distances to all other pins in the network
      const distances: { index: number; dist: number }[] = []
      for (let j = 0; j < pinsInNetworkWithPosition.length; j++) {
        if (i === j) continue
        const { position: pos2 } = pinsInNetworkWithPosition[j]!
        const dx = pos1.x - pos2.x
        const dy = pos1.y - pos2.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        distances.push({ index: j, dist })
      }

      // Sort by distance and take up to 3 nearest
      distances.sort((a, b) => a.dist - b.dist)
      const nearest = distances.slice(0, 3)

      for (const { index: j } of nearest) {
        // To avoid duplicate lines, only draw if i < j
        if (i < j) {
          const { position: pos2 } = pinsInNetworkWithPosition[j]!
          graphics.lines.push({
            points: [pos1, pos2],
            strokeColor: opts?.grayNetworks
              ? "rgba(0, 0, 0, 0.05)"
              : networkColor,
          })
        }
      }
    }
  }

  return graphics
}
