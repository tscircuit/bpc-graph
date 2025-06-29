import { expect, test } from "bun:test"
import { ForceDirectedLayoutSolver } from "lib/force-directed-layout/ForceDirectedLayoutSolver"
import { getGraphicsForBpcGraph } from "lib/debug/getGraphicsForBpcGraph"
import {
  stackGraphicsHorizontally,
  getSvgFromGraphicsObject,
} from "graphics-debug"
import type { BpcGraph } from "lib/types"

const g: BpcGraph = {
  boxes: [
    { boxId: "A", kind: "fixed", center: { x: -1, y: 0 } },
    { boxId: "B", kind: "floating", center: { x: 1, y: 0 } },
    { boxId: "C", kind: "floating", center: { x: 2, y: 0 } },
  ],
  pins: [
    {
      boxId: "A",
      pinId: "p1",
      offset: { x: 0.5, y: 0 },
      color: "red",
      networkId: "n1",
    },
    {
      boxId: "B",
      pinId: "p1",
      offset: { x: -0.5, y: 0 },
      color: "red",
      networkId: "n1",
    },
    {
      boxId: "B",
      pinId: "p2",
      offset: { x: 0.5, y: 0 },
      color: "blue",
      networkId: "n2",
    },
    {
      boxId: "C",
      pinId: "p1",
      offset: { x: -0.5, y: 0 },
      color: "blue",
      networkId: "n2",
    },
  ],
}

function runSolver(base: BpcGraph, steps: number) {
  const solver = new ForceDirectedLayoutSolver({ graph: structuredClone(base) })
  for (let i = 0; i < steps; i++) solver.step()
  return solver.graph
}

test("forceDirectedExample", () => {
  const solved = runSolver(g, 50)
  const svg = getSvgFromGraphicsObject(
    stackGraphicsHorizontally([
      getGraphicsForBpcGraph(g, { title: "Start", caption: "before layout" }),
      getGraphicsForBpcGraph(solved, {
        title: "Solved",
        caption: "after 50 steps",
      }),
    ]),
    { backgroundColor: "white" },
  )
  expect(svg).toMatchSvgSnapshot(import.meta.path)
})
