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
import corpus, { corpusNoNetLabel } from "@tscircuit/schematic-corpus"
import { debugLayout } from "tests/fixtures/debugLayout"

test("tscircuitsch05", async () => {
  /* ── run the schematic JSX through tscircuit ── */
  const circuitJson = await runTscircuitCode(`
import { sel } from "tscircuit"

export default () => (
  <board width="10mm" height="10mm" routingDisabled>
    <chip
      name="U3"
      footprint="soic8"
      pinLabels={{
        pin8: "VDD",
        pin4: "GND",
        pin1: "N_CS",
        pin6: "CLK",
        pin5: "D0_DI",
        pin2: "D1_DO",
        pin3: "D2_N_WP",
        pin7: "D3_N_HOLD",
      }}
      schPinArrangement={{
        leftSide: {
          pins: [8, 4],
          direction: "top-to-bottom",
        },
        rightSide: {
          pins: [1, 6, 5, 2, 3, 7],
          direction: "top-to-bottom",
        },
      }}
      schPinStyle={{
        pin4: { marginTop: 0.65 },
      }}
      connections={{
        VDD: sel.net.V3_3,
        GND: sel.net.GND,
        pin7: sel.net.V3_3,
        pin3: sel.net.V3_3,
        pin2: sel.net.FLASH_SDO,
        pin5: sel.net.FLASH_SDI,
        pin6: sel.net.FLASH_SCK,
        pin1: sel.net.FLASH_N_CS,
      }}
    />
    <capacitor
      name="C20"
      capacitance="0.1uF"
      schRotation="90deg"
      footprint="0402"
      schX={-3}
      connections={{
        pin2: sel.U3.VDD,
        pin1: sel.U3.GND,
      }}
    />
    <resistor
      name="R11"
      resistance="100k"
      schX={2}
      schY={1}
      schRotation="90deg"
      connections={{
        pin2: sel.net.V3_3,
        pin1: sel.U3.N_CS,
      }}
    />
  </board>
)
  `)

  // Use the same debugLayout-based output structure as tscircuitsch02.test.tsx

  const circuitSvg = await convertCircuitJsonToSchematicSvg(circuitJson)
  const ogBpcGraph = convertCircuitJsonToBpc(circuitJson, {
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
    laidOutAccessoryGraphGraphics, // NEW
  } = debugLayout(ogBpcGraph, {
    corpus: corpusNoNetLabel,
    accessoryCorpus: corpus,
  })

  expect(circuitSvg).toMatchSvgSnapshot(
    import.meta.path,
    "tscircuitsch05-input-circuit",
  )

  console.log(
    "[tscircuitsch05] accessory graphics present:",
    Boolean(laidOutAccessoryGraphGraphics),
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
    "tscircuitsch05-partition-iteration-graphics",
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

  if (laidOutAccessoryGraphGraphics) {
    expect(
      getSvgFromGraphicsObject(laidOutAccessoryGraphGraphics, {
        backgroundColor: "white",
      }),
    ).toMatchSvgSnapshot(import.meta.path, "tscircuitsch05-accessory-graph")
  }
})
