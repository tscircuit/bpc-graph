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
      const pinPosition = {
        x: pin.offset.x + boxCenter.x,
        y: pin.offset.y + boxCenter.y,
      }
      pinPositions.set(`${box.boxId}.${pin.pinId}`, pinPosition)
      graphics.points.push({
        ...pinPosition,
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
      const { pin: pin1, position: pos1 } = pinsInNetworkWithPosition[i]!
      for (let j = i + 1; j < pinsInNetworkWithPosition.length; j++) {
        const { position: pos2, pin: pin2 } = pinsInNetworkWithPosition[j]!
        graphics.lines.push({
          points: [pos1, pos2],
          strokeWidth: 1,
          strokeColor: opts?.grayNetworks
            ? "rgba(0, 0, 0, 0.05)"
            : networkColor,
        })
      }
    }
  }

  const bounds = getBounds(graphics)

  if (opts?.title) {
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
