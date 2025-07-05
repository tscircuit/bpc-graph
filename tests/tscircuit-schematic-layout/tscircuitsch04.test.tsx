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
export default () => (
  <board width="10mm" height="10mm" routingDisabled>
    <resistor name="R1" schX={-2} resistance="1k" connections={{pin1: "net.VCC"}} />
    <capacitor name="C1" schX={2} capacitance="10uF" connections={{pin2: "net.GND"}} />
    <trace from=".R1 > .pin2" to=".C1 > .pin1" />
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

  expect(laidOutGraph).toMatchInlineSnapshot(`
    {
      "boxes": [
        {
          "boxId": "R1",
          "center": {
            "x": 0,
            "y": 0,
          },
          "kind": "fixed",
        },
        {
          "boxId": "C1",
          "center": {
            "x": 1.2,
            "y": 0,
          },
          "kind": "fixed",
        },
        {
          "boxAttributes": {
            "is_net_label": true,
            "source_net_id": "source_net_0",
            "source_trace_id": undefined,
          },
          "boxId": "NL_VCC0",
          "center": {
            "x": -0.6,
            "y": 0.78,
          },
          "kind": "fixed",
        },
        {
          "boxAttributes": {
            "is_net_label": true,
            "source_net_id": "source_net_1",
            "source_trace_id": undefined,
          },
          "boxId": "NL_GND0",
          "center": {
            "x": 1.8,
            "y": -0.78,
          },
          "kind": "fixed",
        },
      ],
      "pins": [
        {
          "boxId": "R1",
          "color": "component_center",
          "networkId": "center_schematic_component_0",
          "offset": {
            "x": 0,
            "y": 0,
          },
          "pinId": "R1_center",
        },
        {
          "boxId": "R1",
          "color": "vcc",
          "networkId": "unnamedsubcircuit7_connectivity_net0",
          "offset": {
            "x": -0.5512907000000002,
            "y": 0.0002732499999993365,
          },
          "pinId": "R1_pin1",
        },
        {
          "boxId": "R1",
          "color": "normal",
          "networkId": "unnamedsubcircuit7_connectivity_net2",
          "offset": {
            "x": 0.5512907000000002,
            "y": -0.0002732499999993365,
          },
          "pinId": "R1_pin2",
        },
        {
          "boxId": "C1",
          "color": "component_center",
          "networkId": "center_schematic_component_1",
          "offset": {
            "x": 0,
            "y": 0,
          },
          "pinId": "C1_center",
        },
        {
          "boxId": "C1",
          "color": "normal",
          "networkId": "unnamedsubcircuit7_connectivity_net2",
          "offset": {
            "x": -0.5512093000000002,
            "y": -0.00027334999999961695,
          },
          "pinId": "C1_pin1",
        },
        {
          "boxId": "C1",
          "color": "gnd",
          "networkId": "unnamedsubcircuit7_connectivity_net1",
          "offset": {
            "x": 0.5512093000000002,
            "y": 0.00027334999999961695,
          },
          "pinId": "C1_pin2",
        },
        {
          "boxId": "NL_VCC0",
          "color": "vcc",
          "networkId": "unnamedsubcircuit7_connectivity_net0",
          "offset": {
            "x": 0,
            "y": -0.18000000000000005,
          },
          "pinId": "NL_VCC0_pin",
        },
        {
          "boxId": "NL_VCC0",
          "color": "netlabel_center",
          "networkId": "NL_VCC0_center",
          "offset": {
            "x": 0,
            "y": 0,
          },
          "pinId": "NL_VCC0_center",
        },
        {
          "boxId": "NL_GND0",
          "color": "gnd",
          "networkId": "unnamedsubcircuit7_connectivity_net1",
          "offset": {
            "x": 0,
            "y": 0.18000000000000005,
          },
          "pinId": "NL_GND0_pin",
        },
        {
          "boxId": "NL_GND0",
          "color": "netlabel_center",
          "networkId": "NL_GND0_center",
          "offset": {
            "x": 0,
            "y": 0,
          },
          "pinId": "NL_GND0_center",
        },
      ],
    }
  `)

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
