import { test, expect } from "bun:test"
import { runTscircuitCode } from "tscircuit"
import { convertCircuitJsonToBpc } from "circuit-json-to-bpc"
import { convertCircuitJsonToSchematicSvg } from "circuit-to-svg"
import {
  getGraphicsForBpcGraph,
  layoutSchematicGraph,
  SchematicPartitionProcessor,
} from "lib/index"
import {
  createGraphicsGrid,
  getSvgFromGraphicsObject,
  stackGraphicsHorizontally,
  stackGraphicsVertically,
  type GraphicsObject,
} from "graphics-debug"
import corpus from "@tscircuit/schematic-corpus"
import { debugLayout } from "tests/fixtures/debugLayout"

test("tscircuitsch04", async () => {
  /* ── run the schematic JSX through tscircuit ── */
  const circuitJson = await runTscircuitCode(`
export default () => (
  <board width="10mm" height="10mm" routingDisabled>
    <resistor name="R1" resistance="1k" />
    <capacitor name="C1" capacitance="10uF" />
    <trace from=".R1 > .pin1" to=".C1 > .pin1" />
  </board>
)
  `)

  // Use the same debugLayout-based output structure as tscircuitsch03.test.tsx

  const circuitSvg = await convertCircuitJsonToSchematicSvg(circuitJson)
  const ogBpcGraph = convertCircuitJsonToBpc(circuitJson)

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

  expect(laidOutGraph).toMatchInlineSnapshot(`
    {
      "boxes": [],
      "pins": [],
    }
  `)

  expect(circuitSvg).toMatchSvgSnapshot(
    import.meta.path,
    "tscircuitsch04-input-circuit",
  )
  const iterationChunks: GraphicsObject[][] = []
  for (let i = 0; i < partitionIterationGraphics.length; i += 5) {
    iterationChunks.push(partitionIterationGraphics.slice(i, i + 5))
  }
  expect(
    getSvgFromGraphicsObject(createGraphicsGrid(iterationChunks), {
      backgroundColor: "white",
    }),
  ).toMatchSvgSnapshot(
    import.meta.path,
    "tscircuitsch04-partition-iteration-graphics",
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
