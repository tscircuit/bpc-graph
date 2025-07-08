import circuitJson from "./tscircuitsch05-circuit.json"
import {
  convertCircuitJsonToBpc,
  generateImplicitNetLabels,
} from "circuit-json-to-bpc"
import { test, expect } from "bun:test"
import { convertCircuitJsonToSchematicSvg } from "circuit-to-svg"
import { getGraphicsForBpcGraph } from "lib/index"
import { debugLayout } from "tests/fixtures/debugLayout"
import {
  getSvgFromGraphicsObject,
  stackGraphicsHorizontally,
  stackGraphicsVertically,
} from "graphics-debug"

export const tscircuitCode = `
export default () => (
  <board width="10mm" height="10mm" routingDisabled>
    <resistor name="R1" schX={-2} resistance="1k" connections={{pin1: "net.VCC"}} />
    <capacitor name="C1" schX={2} capacitance="10uF" connections={{pin2: "net.GND"}} />
    <trace from=".R1 > .pin2" to=".C1 > .pin1" />
  </board>
)
  `

test("tscircuitsch04", async () => {
  const circuitJsonWithImpliedNetLabels: any[] = (circuitJson as any).concat(
    generateImplicitNetLabels(circuitJson as any),
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
