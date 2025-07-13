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
  const ogBpcGraph = convertCircuitJsonToBpc(
    circuitJson.filter((c) => c.type !== "schematic_net_label"),
    {
      useReadableIds: true,
    },
  )

  console.log(
    "\n\nORIGINAL BPC GRAPH:\n" + JSON.stringify(ogBpcGraph, null, "  "),
  )

  // Use the debugLayout utility from tests/fixtures/debugLayout.ts
  const {
    partitions,
    partitionIterationGraphics,
    partitionGraphics,
    adaptedGraphGraphics,
    laidOutGraph,
    laidOutGraphGraphics,
    matchedCorpusGraphs,
    adaptedAccessoryGraphGraphics,
    matchedCorpusGraphGraphics,
    laidOutAccessoryGraphGraphics, // NEW
    adaptedAccessoryUnreflectedGraphs,
  } = debugLayout(ogBpcGraph, {
    corpus: corpusNoNetLabel,
    accessoryCorpus: corpus,
  })

  console.log(
    "\n\n# LAID OUT GRAPH\n" + JSON.stringify(laidOutGraph, null, "  "),
  )
  console.log(
    "\n\n# ADAPTED ACCESSORY UNREFLECTED GRAPHS\n" +
      JSON.stringify(adaptedAccessoryUnreflectedGraphs, null, "  "),
  )

  expect(circuitSvg).toMatchSvgSnapshot(
    import.meta.path,
    "tscircuitsch05-input-circuit",
  )

  console.log(
    "[tscircuitsch05] accessory graphics present:",
    Boolean(laidOutAccessoryGraphGraphics),
  )
  expect(
    getSvgFromGraphicsObject(
      stackGraphicsVertically([
        getGraphicsForBpcGraph(ogBpcGraph),
        stackGraphicsHorizontally(partitionGraphics),
        stackGraphicsHorizontally(matchedCorpusGraphGraphics),
        stackGraphicsHorizontally(adaptedGraphGraphics),
        stackGraphicsHorizontally(
          adaptedAccessoryGraphGraphics.filter(
            (g): g is Required<GraphicsObject> => Boolean(g),
          ),
        ),
        laidOutGraphGraphics,
        laidOutAccessoryGraphGraphics!,
      ]),
      {
        backgroundColor: "white",
      },
    ),
  ).toMatchSvgSnapshot(import.meta.path)
})
