import { test, expect } from "bun:test"
import { runTscircuitCode } from "tscircuit"
import { convertCircuitJsonToBpc } from "circuit-json-to-bpc"
import {
  getGraphicsForBpcGraph,
  renetworkWithCondition,
  getBoxSideSubgraph,
  mergeBoxSideSubgraphs,
  assignFloatingBoxPositions,
  netAdaptBpcGraph,
} from "lib/index"
import { reflectGraph } from "lib/graph-utils/reflectGraph"
import { matchGraph } from "lib/match-graph/matchGraph"
import { mergeNetworks } from "lib/renetwork/mergeNetworks"
import { getSvgFromGraphicsObject } from "graphics-debug"
import { stackGraphicsHorizontally, stackGraphicsVertically } from "graphics-debug"
import { convertCircuitJsonToSchematicSvg } from "circuit-to-svg"
import corpus from "@tscircuit/schematic-corpus/dist/bundled-bpc-graphs.json"

test("tscircuitsch01", async () => {
  const circuitJson = await runTscircuitCode(`
    export default () => (
  <board width="25mm" height="15mm" routingDisabled>
    {/* Voltage Divider on the left */}
    <resistor
      resistance="10k"
      footprint="0402"
      name="R1"
      schX={-4}
      schY={2}
      pcbX={-8}
      schRotation="-90deg"
      pcbY={4}
    />
    <resistor
      resistance="10k"
      footprint="0402"
      name="R2"
      schRotation="-90deg"
      schX={-4}
      schY={-2}
      pcbX={-8}
      pcbY={0}
    />
    
    {/* SOIC8 chip in the center */}
    <chip
      name="U1"
      footprint="soic8"
      schX={0}
      schY={0}
      pcbX={0}
      pcbY={2}
      pinLabels={{
        "1": "VIN",
        "2": "GND", 
        "3": "OUT1",
        "4": "OUT2",
        "5": "OUT3",
        "6": "OUT4",
        "7": "EN",
        "8": "VCC"
      }}
    />
    
    {/* Pullup resistors on the right */}
    <resistor
      resistance="4.7k"
      footprint="0402"
      name="R3"
      schX={4}
      schY={1}
      pcbX={8}
      pcbY={5}
    />
    <resistor
      resistance="4.7k"
      footprint="0402"
      name="R4"
      schX={4}
      schY={-1}
      pcbX={8}
      pcbY={3}
    />
    
    {/* Power supply connections */}
    <net name="VCC" />
    <net name="GND" />
    <net name="VDIV_OUT" />
    
    {/* Voltage divider connections */}
    <trace from=".R1 > .pin1" to="net.VCC" />
    <trace from=".R1 > .pin2" to=".R2 > .pin1" />
    <trace from=".R2 > .pin2" to="net.GND" />
    <trace from=".R1 > .pin2" to="net.VDIV_OUT" />
    
    {/* SOIC8 power connections */}
    <trace from=".U1 > .pin8" to="net.VCC" />
    <trace from=".U1 > .pin2" to="net.GND" />
    
    {/* Voltage divider output to SOIC8 input */}
    <trace from="net.VDIV_OUT" to=".U1 > .pin1" />
    
    {/* Pullup resistor connections */}
    <trace from=".R3 > .pin2" to="net.VCC" />
    <trace from=".R3 > .pin1" to=".U1 > .OUT3" />
    
    <trace from=".R4 > .pin2" to="net.VCC" />
    <trace from=".R4 > .pin1" to=".U1 > .OUT4" />
    
    {/* Enable pin connection */}
    <trace from=".U1 > .pin7" to="net.VCC" />
  </board>
  )
  `)

  const circuitSvg = await convertCircuitJsonToSchematicSvg(circuitJson)
  const ogBpcGraph = convertCircuitJsonToBpc(circuitJson)

  /* ------------------------------------------------------------------ */
  /* 1.  Display the raw graph                                           */
  /* ------------------------------------------------------------------ */
  const ogGraphics = getGraphicsForBpcGraph(ogBpcGraph, {
    title: "Original BPC Graph",
  })

  /* ------------------------------------------------------------------ */
  /* 2.  Pick the centre-chip (max-pin count)                            */
  /* ------------------------------------------------------------------ */
  const centreBoxId = ogBpcGraph.boxes
    .map((b: any) => ({
      boxId: b.boxId,
      pinCount: ogBpcGraph.pins.filter((p: any) => p.boxId === b.boxId).length,
    }))
    .sort((a: any, b: any) => b.pinCount - a.pinCount)[0]!.boxId

  const centre = ogBpcGraph.boxes.find((b: any) => b.boxId === centreBoxId)!.center!

  /* ------------------------------------------------------------------ */
  /* 3.  Re-network so that each chip-side gets its own copy of nets     */
  /* ------------------------------------------------------------------ */
  const { renetworkedGraph, renetworkedNetworkIdMap } = renetworkWithCondition(
    ogBpcGraph,
    (from: any, to: any) => {
      // Keep VCC/GND shared – detected via pin color (orange / purple)
      if (from.pin.color === "orange" || from.pin.color === "purple") return true

      const fromSide =
        from.box.center!.x + from.pin.offset.x < centre.x ? "left" : "right"
      const toSide =
        to.box.center!.x + to.pin.offset.x < centre.x ? "left" : "right"
      return fromSide === toSide
    },
  )

  const renetworkedGraphics = getGraphicsForBpcGraph(renetworkedGraph, {
    title: "Renetworked (by chip side)",
  })

  /* ------------------------------------------------------------------ */
  /* 4.  Extract left & right side sub-graphs                            */
  /* ------------------------------------------------------------------ */
  const leftSubgraph = getBoxSideSubgraph({
    bpcGraph: renetworkedGraph,
    boxId: centreBoxId,
    side: "left",
  })

  const rightSubgraph = getBoxSideSubgraph({
    bpcGraph: renetworkedGraph,
    boxId: centreBoxId,
    side: "right",
  })

  /* ------------------------------------------------------------------ */
  /* 5.  Prepare left graph for corpus matching (mirror about X-axis)    */
  /* ------------------------------------------------------------------ */
  const leftReflected = reflectGraph({
    graph: leftSubgraph,
    axis: "x",
    centerBoxId: centreBoxId,
  })

  /* ------------------------------------------------------------------ */
  /* 6.  Corpus matching                                                 */
  /* ------------------------------------------------------------------ */
  const leftMatchResult = matchGraph(leftReflected, corpus as any)
  const rightMatchResult = matchGraph(rightSubgraph, corpus as any)

  /* ------------------------------------------------------------------ */
  /* 7.  Net-adapt each side to its best pattern                         */
  /* ------------------------------------------------------------------ */
  const leftAdaptedFloating = netAdaptBpcGraph(
    leftReflected as any,
    leftMatchResult.graph as any,
  ).adaptedBpcGraph
  const leftAdaptedFixed = assignFloatingBoxPositions(leftAdaptedFloating)
  const leftAdapted = reflectGraph({
    graph: leftAdaptedFixed,
    axis: "x",
    centerBoxId: centreBoxId,
  })

  const rightAdaptedFloating = netAdaptBpcGraph(
    rightSubgraph as any,
    rightMatchResult.graph as any,
  ).adaptedBpcGraph
  const rightAdapted = assignFloatingBoxPositions(rightAdaptedFloating)

  /* ------------------------------------------------------------------ */
  /* 8.  Merge the two adapted sides back together                       */
  /* ------------------------------------------------------------------ */
  const mergedSides = mergeBoxSideSubgraphs([leftAdapted, rightAdapted])
  const mergedGraph = mergeNetworks(mergedSides, renetworkedNetworkIdMap)

  const mergedGraphics = getGraphicsForBpcGraph(mergedGraph, {
    title: "Merged + Adapted Graph",
  })

  /* ------------------------------------------------------------------ */
  /* 9.  Compose a big visual of every phase                             */
  /* ------------------------------------------------------------------ */
  const overview = stackGraphicsVertically([
    ogGraphics,
    renetworkedGraphics,
    stackGraphicsHorizontally([
      getGraphicsForBpcGraph(leftSubgraph, { title: "Left Subgraph" }),
      getGraphicsForBpcGraph(rightSubgraph, { title: "Right Subgraph" }),
    ]),
    stackGraphicsHorizontally([
      getGraphicsForBpcGraph(leftMatchResult.graph!, {
        title: `Left Match (${leftMatchResult.graphName})`,
      }),
      getGraphicsForBpcGraph(rightMatchResult.graph!, {
        title: `Right Match (${rightMatchResult.graphName})`,
      }),
    ]),
    mergedGraphics,
  ])

  /* ------------------------------------------------------------------ */
  /* 10.  Expectations                                                   */
  /* ------------------------------------------------------------------ */
  // @ts-ignore – bun provides `import.meta.path` at runtime but TS doesn't know it
  expect(circuitSvg).toMatchSvgSnapshot(import.meta.path, "tscircuitsch01-input-circuit")
  // @ts-ignore – bun provides `import.meta.path` at runtime but TS doesn't know it
  expect(
    getSvgFromGraphicsObject(overview, {
      backgroundColor: "white",
      includeTextLabels: false,
    }),
  ).toMatchSvgSnapshot(import.meta.path)
})
