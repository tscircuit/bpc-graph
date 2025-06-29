import type { BpcGraph } from "lib/types"

/**
 * Reflect the graph about the center box along the axis
 *
 * This will reflex box positions to the "opposite side" of the center box
 *
 * It will also cause pin positions to be reflected about their center
 */
export const reflectGraph = ({
  graph,
  axis,
  centerBoxId,
}: {
  graph: BpcGraph
  axis: "x" | "y"
  centerBoxId: string
}) => {
  // a. Deep-clone the incoming graph first
  const newGraph = structuredClone(graph)

  // b. Locate the centre-box and its centre coordinate
  const centreBox = newGraph.boxes.find((b) => b.boxId === centerBoxId)
  if (!centreBox || !centreBox.center) {
    throw new Error(`Center box "${centerBoxId}" not found or has no center`)
  }
  const { x: cx, y: cy } = centreBox.center

  // c. Reflect every other box that has a defined centre
  for (const box of newGraph.boxes) {
    if (!box.center) continue // floating w/o position: keep as-is
    if (axis === "x") {
      box.center.x = 2 * cx - box.center.x
    } else {
      box.center.y = 2 * cy - box.center.y
    }
  }

  // d. Reflect every pin around its own box centre (invert relevant offset)
  for (const pin of newGraph.pins) {
    if (axis === "x") {
      pin.offset.x = -pin.offset.x
    } else {
      pin.offset.y = -pin.offset.y
    }
  }

  // 2. Finally return the modified clone
  return newGraph
}
