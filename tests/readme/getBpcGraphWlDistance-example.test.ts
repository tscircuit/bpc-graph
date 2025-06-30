import { expect, test } from "bun:test"
import corpus from "@tscircuit/schematic-corpus/dist/bundled-bpc-graphs.json"
import {
  getGraphicsForBpcGraph,
  getBpcGraphWlDistance,
  type MixedBpcGraph,
} from "lib/index"
import {
  getSvgFromGraphicsObject,
  stackGraphicsHorizontally,
  stackGraphicsVertically,
  createGraphicsGrid,
  type GraphicsObject,
} from "graphics-debug"

test("getBpcGraphWlDistance-example", () => {
  /* ------------------------------------------------------------ */
  /* Configuration                                                */
  /* ------------------------------------------------------------ */
  const baseDesign = "design001"
  const compareDesigns = ["design002", "design003", "design004"] as const

  /* ------------------------------------------------------------ */
  /* Graphics for the base graph (top row)                        */
  /* ------------------------------------------------------------ */
  const baseGraph = corpus[baseDesign] as MixedBpcGraph
  const baseGraphics = getGraphicsForBpcGraph(baseGraph, {
    title: `Base Graph`,
  })

  /* ------------------------------------------------------------ */
  /* Build comparison graphics grid (bottom rows)                 */
  /* ------------------------------------------------------------ */
  const comparisonRow: GraphicsObject[] = []

  for (const d of compareDesigns) {
    const g = corpus[d] as MixedBpcGraph
    const graphics = getGraphicsForBpcGraph(g, {
      title: `WL-dist: ${getBpcGraphWlDistance(baseGraph, g).toFixed(2)}`,
    })
    comparisonRow.push(graphics)
  }

  const comparisonGrid = createGraphicsGrid([comparisonRow], {
    gapAsCellWidthFraction: 0.25,
  })

  /* ------------------------------------------------------------ */
  /* Stack base + grid vertically and snapshot                    */
  /* ------------------------------------------------------------ */
  const allGraphics = stackGraphicsVertically([baseGraphics, comparisonGrid])
  const svg = getSvgFromGraphicsObject(allGraphics, {
    backgroundColor: "white",
    includeTextLabels: false,
  })

  expect(svg).toMatchSvgSnapshot(import.meta.path)
})
