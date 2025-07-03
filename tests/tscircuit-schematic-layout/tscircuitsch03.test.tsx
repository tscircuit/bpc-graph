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
  getSvgFromGraphicsObject,
  stackGraphicsVertically,
} from "graphics-debug"
import corpus from "@tscircuit/schematic-corpus"

test("tscircuitsch03", async () => {
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

  /* ── generate SVG directly from the schematic ── */
  const circuitSvg = await convertCircuitJsonToSchematicSvg(circuitJson)

  const ogBpcGraph = convertCircuitJsonToBpc(circuitJson, {
    useReadableIds: true,
  })

  const processor = new SchematicPartitionProcessor(ogBpcGraph, {
    singletonKeys: ["vcc/2", "gnd/2"],
    duplicatePinIfColor: ["netlabel_center", "component_center"],
  })
  while (!processor.solved && processor.iteration < 1000) {
    processor.step()
  }

  expect(
    getSvgFromGraphicsObject(
      stackGraphicsVertically([
        getGraphicsForBpcGraph(ogBpcGraph),
        ...processor.getPartitions().map((g, gIdx) =>
          getGraphicsForBpcGraph(g, {
            title: `Partition ${gIdx}`,
          }),
        ),
      ]),
      {
        backgroundColor: "white",
      },
    ),
  ).toMatchSvgSnapshot(import.meta.path, "tscircuitsch03-partitions")

  const laidOutBpcGraph = layoutSchematicGraph(ogBpcGraph, {
    singletonKeys: ["vcc/2", "gnd/2"],
    duplicatePinIfColor: ["netlabel_center", "component_center"],
    corpus,
  })

  expect(circuitSvg).toMatchSvgSnapshot(
    import.meta.path,
    "tscircuitsch03-input-circuit",
  )
  expect(
    getSvgFromGraphicsObject(
      stackGraphicsVertically([
        getGraphicsForBpcGraph(ogBpcGraph),
        getGraphicsForBpcGraph(laidOutBpcGraph, { title: "Laid out graph" }),
        getGraphicsForBpcGraph(corpus["design018"]!, {
          title: "Matched corpus",
        }),
      ]),
      {
        backgroundColor: "white",
      },
    ),
  ).toMatchSvgSnapshot(import.meta.path)
})
