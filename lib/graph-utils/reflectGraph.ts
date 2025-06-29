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
  const newGraph = structuredClone(graph)

  return newGraph
}
