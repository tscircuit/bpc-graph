import { test, expect } from "bun:test"
import { runTscircuitCode } from "tscircuit"
import {
  convertCircuitJsonToBpc,
  generateImplicitNetLabels,
} from "circuit-json-to-bpc"
import { convertCircuitJsonToSchematicSvg } from "circuit-to-svg"
import { getGraphicsForBpcGraph } from "lib/index"
import { debugLayout } from "tests/fixtures/debugLayout"
import {
  getSvgFromGraphicsObject,
  stackGraphicsHorizontally,
  stackGraphicsVertically,
} from "graphics-debug"

export const tscircuitCode = `
import { sel } from "tscircuit"
export default () => (
  <board routingDisabled>
    <group schX={5}>
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
    </group>
  </board>
)
  `

test("tscircuitsch04", async () => {
  /* ── run the schematic JSX through tscircuit ── */
  const circuitJson = await runTscircuitCode(tscircuitCode)

  const circuitJsonWithImpliedNetLabels = circuitJson.concat(
    generateImplicitNetLabels(circuitJson),
  )

  // Use the same debugLayout-based output structure as tscircuitsch03.test.tsx

  const circuitSvg = await convertCircuitJsonToSchematicSvg(
    circuitJsonWithImpliedNetLabels,
  )
  const ogBpcGraph = convertCircuitJsonToBpc(circuitJsonWithImpliedNetLabels, {
    useReadableIds: true,
  })

  // Use the debugLayout utility from tests/fixtures/debugLayout.ts
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
    "tscircuitsch04-input-circuit",
  )
  expect(
    getSvgFromGraphicsObject(
      stackGraphicsVertically(
        [
          getGraphicsForBpcGraph(ogBpcGraph, {
            title: "Original BPC Graph",
          }),
          stackGraphicsHorizontally(partitionGraphics),
          stackGraphicsHorizontally(matchedCorpusGraphGraphics),
          stackGraphicsHorizontally(adaptedGraphGraphics),
          laidOutGraphGraphics,
        ],
        {
          titles: [
            "Original",
            "Partitions",
            "Matched Corpus Graphs",
            "Adapted Graphs",
            "Laid Out Graph",
          ],
        },
      ),
      {
        backgroundColor: "white",
      },
    ),
  ).toMatchSvgSnapshot(import.meta.path)
})
