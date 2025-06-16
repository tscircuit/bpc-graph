import type {Bounds, BpcFixedBox, BpcFloatingBox, BpcGraph} from "../types";

export const getBoundsOfBpcBox = (graph: BpcGraph, boxId: string): Bounds => {
  const box = graph.boxes.find(b => b.boxId === boxId)
  const pins = graph.pins.filter(p => p.boxId === boxId)
  if (!box) {
    throw new Error(`Box "${boxId}" not found`)
  }

  const boxCenter = box.kind === "fixed" ? box.center : {x: 0, y: 0}

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const pin of pins) {
    minX = Math.min(minX, pin.offset.x + boxCenter.x)
    minY = Math.min(minY, pin.offset.y + boxCenter.y)
    maxX = Math.max(maxX, pin.offset.x + boxCenter.x)
    maxY = Math.max(maxY, pin.offset.y + boxCenter.y)
  }

  return {
    minX,
    minY,
    maxX,
    maxY
  }
}