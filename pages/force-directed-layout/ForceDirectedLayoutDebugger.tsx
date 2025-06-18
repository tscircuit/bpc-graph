import { ForceDirectedLayoutSolver } from "lib/force-directed-layout/ForceDirectedLayoutSolver"
import { getGraphicsForBpcGraph } from "../../lib/debug/getGraphicsForBpcGraph"
import type { BpcGraph, FloatingBpcGraph } from "../../lib/types"
import { InteractiveGraphics } from "graphics-debug/react"
import { useEffect, useReducer, useRef, useState } from "react"

export const ForceDirectedLayoutDebugger = ({
  floatingBpsGraph,
}: {
  floatingBpsGraph: BpcGraph
}) => {
  const [runCount, incRunCount] = useReducer((c: number) => c + 1, 0)
  const [playInterval, setPlayInterval] = useState<NodeJS.Timeout | null>(null)
  const isPlaying = playInterval !== null
  const [solver, setSolver] = useState<ForceDirectedLayoutSolver>(() => {
    return new ForceDirectedLayoutSolver({
      graph: floatingBpsGraph,
    })
  })

  return (
    <div>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => {
            solver.step()
            incRunCount()
          }}
        >
          Step
        </button>
        <button
          onClick={() => {
            if (isPlaying) {
              clearInterval(playInterval)
              setPlayInterval(null)
            } else {
              const interval = setInterval(() => {
                solver.step()
                incRunCount()
              }, 20)
              setPlayInterval(interval)
            }
          }}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <div>{solver.iterations}</div>
      </div>
      <InteractiveGraphics graphics={solver.visualize()} />
    </div>
  )
}
