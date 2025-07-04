import { expect, test } from "bun:test"
import corpus from "@tscircuit/schematic-corpus/dist/bundled-bpc-graphs.json"
import {
  getGraphicsForBpcGraph,
  getBpcGraphWlDistance,
  type MixedBpcGraph,
  getWlFeatureVecs,
} from "lib/index"
import { convertToFlatBpcGraph } from "lib/flat-bpc/convertToFlatBpcGraph"
import { convertFlatBpcToGraphics } from "lib/debug/convertFlatBpcToGraphics"
import {
  getSvgFromGraphicsObject,
  stackGraphicsHorizontally,
  stackGraphicsVertically,
  createGraphicsGrid,
  type GraphicsObject,
  type Text,
} from "graphics-debug"

test("wl-distance-debugging01 - investigate design001, design018, design020", () => {
  /* ------------------------------------------------------------ */
  /* Configuration                                                */
  /* ------------------------------------------------------------ */
  const targetDesigns = ["design001", "design018", "design020"] as const

  /* ------------------------------------------------------------ */
  /* Log WL distances between all pairs                          */
  /* ------------------------------------------------------------ */
  console.log("=== WL Distance Matrix ===")

  const designs = targetDesigns.map((name) => ({
    name,
    graph: corpus[name] as MixedBpcGraph,
  }))

  // Log distances between all pairs
  for (let i = 0; i < designs.length; i++) {
    for (let j = i + 1; j < designs.length; j++) {
      const d1 = designs[i]!
      const d2 = designs[j]!
      const distance = getBpcGraphWlDistance(d1.graph, d2.graph)
      console.log(`${d1.name} <-> ${d2.name}: ${distance.toFixed(6)}`)
    }
  }

  // Log self-distances (should be 0)
  for (const design of designs) {
    const selfDistance = getBpcGraphWlDistance(design.graph, design.graph)
    console.log(
      `${design.name} <-> ${design.name}: ${selfDistance.toFixed(6)} (self)`,
    )
  }

  /* ------------------------------------------------------------ */
  /* Create graphics for original BPC graphs (top row)           */
  /* ------------------------------------------------------------ */
  const originalGraphicsRow: GraphicsObject[] = []

  for (const design of designs) {
    const graphics = getGraphicsForBpcGraph(design.graph, {
      title: `${design.name} (Original)`,
    })
    originalGraphicsRow.push(graphics)
  }

  /* ------------------------------------------------------------ */
  /* Create graphics for flat BPC graphs (bottom row)            */
  /* ------------------------------------------------------------ */
  const flatGraphicsRow: GraphicsObject[] = []

  for (const design of designs) {
    const flatGraph = convertToFlatBpcGraph(design.graph)
    // console.log(`${design.name} flat graph:`, {
    //   nodeCount: flatGraph.nodes.length,
    //   edgeCount: flatGraph.undirectedEdges.length,
    //   nodes: flatGraph.nodes.map((n) => ({ id: n.id, color: n.color })),
    // })

    const graphics = convertFlatBpcToGraphics(flatGraph, {
      title: `${design.name} (Flat)`,
    })
    flatGraphicsRow.push(graphics)
  }

  /* ------------------------------------------------------------ */
  /* Stack all graphics sections vertically                      */
  /* ------------------------------------------------------------ */
  const originalGrid = stackGraphicsHorizontally(originalGraphicsRow, {})

  const flatGrid = stackGraphicsHorizontally(flatGraphicsRow, {})

  const allGraphics = stackGraphicsVertically([originalGrid, flatGrid], {})

  /* ------------------------------------------------------------ */
  /* Generate SVG snapshot                                        */
  /* ------------------------------------------------------------ */
  const svg = getSvgFromGraphicsObject(allGraphics, {
    backgroundColor: "white",
    includeTextLabels: false,
  })

  expect(svg).toMatchSvgSnapshot(import.meta.path)
})
