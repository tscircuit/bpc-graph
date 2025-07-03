import { test, expect } from "bun:test"
import { runTscircuitCode } from "tscircuit"
import { convertCircuitJsonToBpc } from "circuit-json-to-bpc"
import { getGraphicsForBpcGraph, layoutSchematicGraph } from "lib/index"
import {
  getSvgFromGraphicsObject,
  stackGraphicsVertically,
} from "graphics-debug"
import { convertCircuitJsonToSchematicSvg } from "circuit-to-svg"
import corpus from "@tscircuit/schematic-corpus"

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

  const laidOutBpcGraph = layoutSchematicGraph(ogBpcGraph, {
    singletonKeys: ["vcc/2", "gnd/2"],
    duplicatePinIfColor: ["netlabel_center", "component_center"],
    corpus,
  })

  expect(circuitSvg).toMatchSvgSnapshot(
    import.meta.path,
    "tscircuitsch02-input-circuit",
  )
  expect(
    getSvgFromGraphicsObject(
      stackGraphicsVertically([
        getGraphicsForBpcGraph(ogBpcGraph),
        getGraphicsForBpcGraph(laidOutBpcGraph),
      ]),
      {
        backgroundColor: "white",
      },
    ),
  ).toMatchSvgSnapshot(import.meta.path)
})
