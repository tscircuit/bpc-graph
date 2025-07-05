import { test, expect } from "bun:test"
import { runTscircuitCode } from "tscircuit"
import {
  convertCircuitJsonToBpc,
  generateImplicitNetLabels,
} from "circuit-json-to-bpc"
import { convertCircuitJsonToSchematicSvg } from "circuit-to-svg"
import { getGraphicsForBpcGraph } from "lib/index"
import { debugLayout } from "tests/fixtures/debugLayout"

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
  const ogBpcGraph = convertCircuitJsonToBpc(circuitJsonWithImpliedNetLabels)

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
          "boxId": "schematic_component_0",
          "center": {
            "x": 0,
            "y": 0,
          },
          "kind": "floating",
        },
        {
          "boxId": "schematic_component_1",
          "center": {
            "x": -1.2,
            "y": 0,
          },
          "kind": "floating",
        },
        {
          "boxId": "schematic_net_label_0",
          "center": {
            "x": 0.6,
            "y": 0.78,
          },
          "kind": "fixed",
        },
        {
          "boxId": "schematic_net_label_1",
          "center": {
            "x": -1.8,
            "y": -0.78,
          },
          "kind": "fixed",
        },
      ],
      "pins": [
        {
          "boxId": "schematic_component_0",
          "color": "component_center",
          "networkId": "center_schematic_component_0",
          "offset": {
            "x": 0,
            "y": 0,
          },
          "pinId": "schematic_component_0_center",
        },
        {
          "boxId": "schematic_component_0",
          "color": "vcc",
          "networkId": "unnamedsubcircuit7_connectivity_net0",
          "offset": {
            "x": -0.5512907,
            "y": 0.0002732499999993365,
          },
          "pinId": "schematic_port_0",
        },
        {
          "boxId": "schematic_component_0",
          "color": "normal",
          "networkId": "unnamedsubcircuit7_connectivity_net2",
          "offset": {
            "x": 0.5512907000000005,
            "y": -0.0002732499999993365,
          },
          "pinId": "schematic_port_1",
        },
        {
          "boxId": "schematic_component_1",
          "color": "component_center",
          "networkId": "center_schematic_component_1",
          "offset": {
            "x": 0,
            "y": 0,
          },
          "pinId": "schematic_component_1_center",
        },
        {
          "boxId": "schematic_component_1",
          "color": "normal",
          "networkId": "unnamedsubcircuit7_connectivity_net2",
          "offset": {
            "x": -0.5512093000000005,
            "y": -0.00027334999999961695,
          },
          "pinId": "schematic_port_2",
        },
        {
          "boxId": "schematic_component_1",
          "color": "gnd",
          "networkId": "unnamedsubcircuit7_connectivity_net1",
          "offset": {
            "x": 0.5512093,
            "y": 0.00027334999999961695,
          },
          "pinId": "schematic_port_3",
        },
        {
          "boxId": "schematic_net_label_0",
          "color": "vcc",
          "networkId": "unnamedsubcircuit7_connectivity_net0",
          "offset": {
            "x": 0.27,
            "y": 0,
          },
          "pinId": "schematic_net_label_0_pin",
        },
        {
          "boxId": "schematic_net_label_0",
          "color": "netlabel_center",
          "networkId": "schematic_net_label_0_center",
          "offset": {
            "x": 0,
            "y": 0,
          },
          "pinId": "schematic_net_label_0_center",
        },
        {
          "boxId": "schematic_net_label_1",
          "color": "gnd",
          "networkId": "unnamedsubcircuit7_connectivity_net1",
          "offset": {
            "x": -0.27,
            "y": 0,
          },
          "pinId": "schematic_net_label_1_pin",
        },
        {
          "boxId": "schematic_net_label_1",
          "color": "netlabel_center",
          "networkId": "schematic_net_label_1_center",
          "offset": {
            "x": 0,
            "y": 0,
          },
          "pinId": "schematic_net_label_1_center",
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
