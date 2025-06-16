import {getGraphicsForBpcGraph} from "../../lib/debug/getGraphicsForBpcGraph";
import type {BpcGraph, FloatingBpcGraph} from "../../lib/types";
import { InteractiveGraphics } from "graphics-debug/react"

export const ForceDirectedLayoutDebugger = ({
  floatingBpsGraph
}: {
  floatingBpsGraph: FloatingBpcGraph,
}) => {
  const graphics = getGraphicsForBpcGraph(floatingBpsGraph)

  return (
    <InteractiveGraphics
      graphics={graphics}
    />
  )
}