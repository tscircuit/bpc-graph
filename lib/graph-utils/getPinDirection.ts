import type {BpcGraph, Direction} from "lib/types";
import {getBoundsOfBpcBox} from "./getBoundsOfBpcBox";
import {getPinPosition} from "./getPinPosition";

export const getPinDirection = (g: BpcGraph, pinId: string): Direction => {
  const pin = g.pins.find(p => p.pinId === pinId)
  if (!pin) {
    throw new Error(`Pin not found "${pinId}"`)
  }

  const box = g.boxes.find(b => b.boxId === pin.boxId)
  if (!box) {
    throw new Error(`Box not found for pin "${pinId}" (looked for "${pin.boxId}")`)
  }

  const bounds = getBoundsOfBpcBox(g, pin.boxId)
  const pinPosition = getPinPosition(g, pinId)

  const width = bounds.maxX - bounds.minX
  const height = bounds.maxY - bounds.minY

  if (Math.abs(pinPosition.x - bounds.minX) < 0.0001 && width !== 0) {
    return "x-"
  }
  if (Math.abs(pinPosition.x - bounds.maxX) < 0.0001 && width !== 0) {
    return "x+"
  }
  if (Math.abs(pinPosition.y - bounds.minY) < 0.0001 && height !== 0) {
    return "y-"
  }
  if (Math.abs(pinPosition.y - bounds.maxY) < 0.0001 && height !== 0) {
    return "y+"
  }

  throw new Error(`Pin "${pinId}" not on the edge of the box "${pin.boxId}" so we couldn't determine the direction`)
}