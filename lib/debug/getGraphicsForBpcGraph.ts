import { center } from "../graph-utils/center"
import { getBoundsOfBpcBox } from "../graph-utils/getBoundsOfBpcBox"
import { getColorByIndex } from "../graph-utils/getColorByIndex"
import { getGraphBounds } from "../graph-utils/getGraphBounds"
import { getGraphNetworkIds } from "../graph-utils/getGraphNetworkIds"
import type { BpcGraph } from "../types"
import { getBounds, type GraphicsObject } from "graphics-debug"
import { translateColor } from "./translateColor"

export const getGraphicsForBpcGraph = (
  g: BpcGraph,
  opts?: {
    grayNetworks?: boolean
    title?: string
    caption?: string
  },
) => {
  const graphics: Required<GraphicsObject> = {
    points: [],
    lines: [],
    rects: [],
    circles: [],
    texts: [],
    coordinateSystem: "cartesian",
    title: "BPC Graph Graphics",
  }

  const pinPositions = new Map<
    `${string}.${string}`,
    { x: number; y: number }
  >()

  // Track positions to detect overlaps
  const positionGroups = new Map<string, Array<{ box: any; pin: any }>>()

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
    const boxCenter = box.center ?? { x: 0, y: 0 }

    for (const pin of boxPins) {
      const pinPosition = {
        x: pin.offset.x + boxCenter.x,
        y: pin.offset.y + boxCenter.y,
      }
      const positionKey = `${pinPosition.x.toFixed(6)},${pinPosition.y.toFixed(6)}`

      if (!positionGroups.has(positionKey)) {
        positionGroups.set(positionKey, [])
      }
      positionGroups.get(positionKey)!.push({ box, pin })

      pinPositions.set(`${box.boxId}.${pin.pinId}`, pinPosition)
    }
  }

  // Add points with offset for overlapping positions
  for (const [positionKey, items] of positionGroups) {
    const coordinates = positionKey.split(",").map(Number)
    const baseX = coordinates[0]!
    const baseY = coordinates[1]!

    for (let i = 0; i < items.length; i++) {
      const item = items[i]!
      const { box, pin } = item
      let adjustedPosition = { x: baseX, y: baseY }

      // Apply small offset for overlapping points towards box center
      if (items.length > 1) {
        const boxCenter = box.center ?? { x: 0, y: 0 }
        const directionX = boxCenter.x - baseX
        const directionY = boxCenter.y - baseY
        const distance = Math.sqrt(
          directionX * directionX + directionY * directionY,
        )

        // Create unit vector towards box center, with fallback if distance is 0
        let unitX = 0
        let unitY = 0
        if (distance > 0) {
          unitX = directionX / distance
          unitY = directionY / distance
        } else {
          // Fallback to circular distribution if pin is exactly at box center
          const offsetAngle = (i * 2 * Math.PI) / items.length
          unitX = Math.cos(offsetAngle)
          unitY = Math.sin(offsetAngle)
        }

        adjustedPosition = {
          x: baseX + 0.01 * unitX,
          y: baseY + 0.01 * unitY,
        }
      }

      // Update the position map with adjusted position
      pinPositions.set(`${box.boxId}.${pin.pinId}`, adjustedPosition)

      graphics.points.push({
        ...adjustedPosition,
        label: [pin.pinId, pin.color, pin.networkId].join("\n"),
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
    const networkColor = getColorByIndex(ni, networks.length, 0.5)
    const pins = g.pins.filter((p) => p.networkId === networkId)

    // Precompute pin positions for efficiency
    const pinsInNetworkWithPosition = pins.map((pin) => ({
      pin,
      position: pinPositions.get(`${pin.boxId}.${pin.pinId}`)!,
    }))

    for (let i = 0; i < pinsInNetworkWithPosition.length; i++) {
      const { position: pos1 } = pinsInNetworkWithPosition[i]!
      for (let j = i + 1; j < pinsInNetworkWithPosition.length; j++) {
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

  const bounds = getBounds(graphics)

  if (opts?.title) {
    graphics.title = opts.title
    graphics.texts.push({
      text: opts.title,
      x: bounds.minX,
      y: bounds.maxY,
      fontSize: (bounds.maxY - bounds.minY) * 0.05,
      anchorSide: "bottom_left",
    })
  }

  if (opts?.caption) {
    graphics.texts.push({
      text: opts.caption,
      x: bounds.minX,
      y: bounds.minY,
      fontSize: (bounds.maxY - bounds.minY) * 0.05,
      anchorSide: "top_left",
    })
  }

  return graphics
}
