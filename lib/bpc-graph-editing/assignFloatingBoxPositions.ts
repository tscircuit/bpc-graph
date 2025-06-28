import type { FixedBpcGraph, MixedBpcGraph } from "lib/types"

export const assignFloatingBoxPositions = (
  bpcGraph: MixedBpcGraph,
): FixedBpcGraph => {
  const g = structuredClone(bpcGraph)

  for (const box of g.boxes) {
    if (box.kind === "floating" || !box.center) {
      // TODO infer center based on network
      box.kind = "fixed"
      box.center = { x: 0, y: 0 }
    }
  }

  return g as FixedBpcGraph
}
