import { test, expect } from "bun:test"
import { runTscircuitCode } from "tscircuit"
import { convertCircuitJsonToBpc } from "circuit-json-to-bpc"
import { getGraphicsForBpcGraph, layoutSchematicGraph } from "lib/index"
import {
  getSvgFromGraphicsObject,
  stackGraphicsHorizontally,
  stackGraphicsVertically,
} from "graphics-debug"
import { convertCircuitJsonToSchematicSvg } from "circuit-to-svg"
import corpus from "@tscircuit/schematic-corpus"
import { debugLayout } from "tests/fixtures/debugLayout"

test("tscircuitsch02", async () => {
  const circuitJson = await runTscircuitCode(`
import { sel } from "tscircuit"

export default () => (
  <board routingDisabled matchAdapt>
      <chip
        name="U1"
        manufacturerPartNumber="I2C_SENSOR"
        footprint="soic4"
        pinLabels={{
          pin1: "SCL",
          pin2: "SDA",
          pin3: "VCC",
          pin4: "GND",
        }}
        schPinArrangement={{
          rightSide: {
            direction: "top-to-bottom",
            pins: ["SCL", "SDA", "VCC", "GND"],
          },
        }}
        connections={{
          SCL: sel.net.SCL,
          SDA: sel.net.SDA,
          VCC: sel.net.V3_3,
          GND: sel.net.GND,
        }}
      />
    </board>
)
  `)

  const circuitSvg = await convertCircuitJsonToSchematicSvg(circuitJson)
  const ogBpcGraph = convertCircuitJsonToBpc(circuitJson)

  // Use the debugLayout utility from tests/fixtures/debugLayout.ts
  // (assumes debugLayout is available in the test environment)
  // If not already imported, add: import { debugLayout } from "tests/fixtures/debugLayout"
  // For this rewrite, we assume it's available.

  const {
    partitions,
    partitionIterationGraphics,
    partitionGraphics,
    adaptedGraphGraphics,
    laidOutGraph,
    laidOutGraphGraphics,
    matchedCorpusGraphs,
    matchedCorpusGraphGraphics,
  } = debugLayout(ogBpcGraph)

  expect(circuitSvg).toMatchSvgSnapshot(
    import.meta.path,
    "tscircuitsch02-input-circuit",
  )
  expect(
    getSvgFromGraphicsObject(
      stackGraphicsVertically(partitionIterationGraphics),
      {
        backgroundColor: "white",
      },
    ),
  ).toMatchSvgSnapshot(
    import.meta.path,
    "tscircuitsch02-partition-iteration-graphics",
  )
  expect(
    getSvgFromGraphicsObject(
      stackGraphicsVertically([
        getGraphicsForBpcGraph(ogBpcGraph),
        stackGraphicsHorizontally(partitionGraphics),
        stackGraphicsHorizontally(matchedCorpusGraphGraphics),
        stackGraphicsHorizontally(adaptedGraphGraphics),
        laidOutGraphGraphics,
      ]),
      {
        backgroundColor: "white",
      },
    ),
  ).toMatchSvgSnapshot(import.meta.path)
})
