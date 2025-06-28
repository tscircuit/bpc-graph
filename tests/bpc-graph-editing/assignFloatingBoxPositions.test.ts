import { test, expect } from "bun:test"
import corpus from "@tscircuit/schematic-corpus/dist/bundled-bpc-graphs.json"
import {
  getGraphicsForBpcGraph,
  type FixedBpcGraph,
  type MixedBpcGraph,
} from "lib/index"
import { assignFloatingBoxPositions } from "lib/bpc-graph-editing/assignFloatingBoxPositions"
import {
  getSvgFromGraphicsObject,
  stackGraphicsHorizontally,
} from "graphics-debug"

test("assignFloatingBoxPositions01", () => {
  // Use design01 as the base
  const original = corpus.design001 as MixedBpcGraph

  // Clone and replace boxes[1] with a floating box (remove center, set kind)
  const withFloating = structuredClone(original) as MixedBpcGraph
  if (withFloating.boxes[1]) {
    withFloating.boxes[1] = {
      ...withFloating.boxes[1],
      kind: "floating",
    }
    // Remove center property if present
    delete (withFloating.boxes[1] as any).center
  }

  // Assign floating box positions
  const assigned = assignFloatingBoxPositions(withFloating)

  // Graphics for each
  const originalGraphics = getGraphicsForBpcGraph(original, {
    title: "Original",
  })
  const withFloatingGraphics = getGraphicsForBpcGraph(withFloating, {
    title: "With Floating",
  })
  const assignedGraphics = getGraphicsForBpcGraph(assigned, {
    title: "Floating Assigned",
  })

  // Stack horizontally: original | with floating | assigned
  expect(
    getSvgFromGraphicsObject(
      stackGraphicsHorizontally([
        originalGraphics,
        withFloatingGraphics,
        assignedGraphics,
      ]),
      {
        backgroundColor: "white",
        includeTextLabels: false,
      },
    ),
  ).toMatchSvgSnapshot(import.meta.path)
})
