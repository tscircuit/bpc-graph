import {center} from "../graph-utils/center";
import {getBoundsOfBpcBox} from "../graph-utils/getBoundsOfBpcBox";
import {getColorByIndex} from "../graph-utils/getColorByIndex";
import {getGraphBounds} from "../graph-utils/getGraphBounds";
import {getGraphNetworkIds} from "../graph-utils/getGraphNetworkIds";
import {getPinPosition} from "../graph-utils/getPinPosition";
import type {BpcGraph} from "../types";
import type {GraphicsObject} from "graphics-debug";

export const getGraphicsForBpcGraph = (g: BpcGraph) => {
  const graphics: Required<GraphicsObject> = {
    points: [],
    lines: [],
    rects: [],
    circles: [],
    coordinateSystem: "cartesian",
    title: "BPC Graph Graphics"
  }

  for (const box of g.boxes) {
    const bounds = getBoundsOfBpcBox(g, box.boxId)
    const boundsCenter = center(bounds)

    graphics.rects.push({
      label: box.boxId,
      center: boundsCenter,
      width: bounds.maxX - bounds.minX,
      height: bounds.maxY - bounds.minY,
      fill: "rgba(0, 0, 0, 0.2)"
    })

    const boxPins = g.pins.filter(p => p.boxId === box.boxId)
    const boxCenter = box.center ?? boundsCenter

    for (const pin of boxPins) {
      graphics.points.push({
        x: pin.offset.x + boxCenter.x,
        y: pin.offset.y + boxCenter.y,
        label: pin.pinId,
        color: pin.color
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
    const pins = g.pins.filter(p => p.networkId === networkId)

    for (let i = 0; i < pins.length; i++) {
      for (let j = i + 1; j < pins.length; j++) {
        const pin1 = pins[i]
        const pin2 = pins[j]

        if (!pin1 || !pin2) {
          continue
        }

        const pin1Position = getPinPosition(g, pin1.pinId)
        const pin2Position = getPinPosition(g, pin2.pinId)

        graphics.lines.push({
          points: [pin1Position, pin2Position],
          strokeColor: networkColor,
        })
      }
    }
  }

  return graphics
}