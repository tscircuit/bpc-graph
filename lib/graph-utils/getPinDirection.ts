import type { BpcBox, BpcGraph, BpcPin, Direction } from "lib/types"
import { getBoundsOfBpcBox } from "./getBoundsOfBpcBox"
import { getPinPosition } from "./getPinPosition"

export const getPinDirectionOrThrow = (
  g: BpcGraph,
  boxIdOrBox: string | BpcBox,
  pinIdOrPin: string | BpcPin,
): Direction => {
  const pin =
    typeof pinIdOrPin === "string"
      ? g.pins.find((p) => p.pinId === pinIdOrPin && p.boxId === boxIdOrBox)
      : pinIdOrPin
  if (!pin) {
    throw new Error(`Pin not found "${pinIdOrPin}"`)
  }

  const box =
    typeof boxIdOrBox === "string"
      ? g.boxes.find((b) => b.boxId === boxIdOrBox)
      : boxIdOrBox
  if (!box) {
    throw new Error(
      `Box not found for pin "${pinIdOrPin}" (looked for "${pin.boxId}")`,
    )
  }

  const bounds = getBoundsOfBpcBox(g, pin.boxId)
  const pinPosition = getPinPosition(g, pin.boxId, pin.pinId)

  const width = bounds.maxX - bounds.minX
  const height = bounds.maxY - bounds.minY

  // Handle edge cases for boxes with zero width or height
  if (width === 0 && height === 0) {
    // Single pin box - determine direction based on offset from center
    if (Math.abs(pin.offset.x) > Math.abs(pin.offset.y)) {
      return pin.offset.x > 0 ? "x+" : "x-"
    } else {
      return pin.offset.y > 0 ? "y+" : "y-"
    }
  }

  if (width === 0) {
    // Vertical line of pins - use y direction
    if (Math.abs(pinPosition.y - bounds.minY) < 0.0001) {
      return "y-"
    }
    if (Math.abs(pinPosition.y - bounds.maxY) < 0.0001) {
      return "y+"
    }
  }

  if (height === 0) {
    // Horizontal line of pins - use x direction
    if (Math.abs(pinPosition.x - bounds.minX) < 0.0001) {
      return "x-"
    }
    if (Math.abs(pinPosition.x - bounds.maxX) < 0.0001) {
      return "x+"
    }
  }

  // Normal case: box has both width and height
  // Check if pin is on any edge, and if it's on a corner, choose based on offset magnitude
  const onLeftEdge = Math.abs(pinPosition.x - bounds.minX) < 0.0001
  const onRightEdge = Math.abs(pinPosition.x - bounds.maxX) < 0.0001
  const onBottomEdge = Math.abs(pinPosition.y - bounds.minY) < 0.0001
  const onTopEdge = Math.abs(pinPosition.y - bounds.maxY) < 0.0001

  // If pin is on a corner, decide based on which direction has larger offset magnitude
  if ((onLeftEdge || onRightEdge) && (onBottomEdge || onTopEdge)) {
    if (Math.abs(pin.offset.x) > Math.abs(pin.offset.y)) {
      return pin.offset.x > 0 ? "x+" : "x-"
    } else {
      return pin.offset.y > 0 ? "y+" : "y-"
    }
  }

  // Pin is on a single edge
  if (onLeftEdge) {
    return "x-"
  }
  if (onRightEdge) {
    return "x+"
  }
  if (onBottomEdge) {
    return "y-"
  }
  if (onTopEdge) {
    return "y+"
  }

  throw new Error(
    `Pin "${pinId}" not on the edge of the box "${pin.boxId}" so we couldn't determine the direction`,
  )
}

export const getPinDirection = (
  g: BpcGraph,
  boxIdOrBox: string | BpcBox,
  pinIdOrPin: string | BpcPin,
): Direction | null => {
  try {
    return getPinDirectionOrThrow(g, boxIdOrBox, pinIdOrPin)
  } catch (e: any) {
    return null
  }
}
