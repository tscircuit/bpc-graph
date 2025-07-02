import { test, expect } from "bun:test"
import { runTscircuitCode } from "tscircuit"
import { convertCircuitJsonToBpc } from "circuit-json-to-bpc"
import { getGraphicsForBpcGraph } from "lib/index"
import { getSvgFromGraphicsObject } from "graphics-debug"
import { convertCircuitJsonToSchematicSvg } from "circuit-to-svg"

test("tscircuitsch01", async () => {
  const circuitJson = await runTscircuitCode(`
    export default () => (
  <board width="25mm" height="15mm" routingDisabled>
    {/* Voltage Divider on the left */}
    <resistor
      resistance="10k"
      footprint="0402"
      name="R1"
      schX={-4}
      schY={2}
      pcbX={-8}
      schRotation="-90deg"
      pcbY={4}
    />
    <resistor
      resistance="10k"
      footprint="0402"
      name="R2"
      schRotation="-90deg"
      schX={-4}
      schY={-2}
      pcbX={-8}
      pcbY={0}
    />
    
    {/* SOIC8 chip in the center */}
    <chip
      name="U1"
      footprint="soic8"
      schX={0}
      schY={0}
      pcbX={0}
      pcbY={2}
      pinLabels={{
        "1": "VIN",
        "2": "GND", 
        "3": "OUT1",
        "4": "OUT2",
        "5": "OUT3",
        "6": "OUT4",
        "7": "EN",
        "8": "VCC"
      }}
    />
    
    {/* Pullup resistors on the right */}
    <resistor
      resistance="4.7k"
      footprint="0402"
      name="R3"
      schX={4}
      schY={1}
      pcbX={8}
      pcbY={5}
    />
    <resistor
      resistance="4.7k"
      footprint="0402"
      name="R4"
      schX={4}
      schY={-1}
      pcbX={8}
      pcbY={3}
    />
    
    {/* Power supply connections */}
    <net name="VCC" />
    <net name="GND" />
    <net name="VDIV_OUT" />
    
    {/* Voltage divider connections */}
    <trace from=".R1 > .pin1" to="net.VCC" />
    <trace from=".R1 > .pin2" to=".R2 > .pin1" />
    <trace from=".R2 > .pin2" to="net.GND" />
    <trace from=".R1 > .pin2" to="net.VDIV_OUT" />
    
    {/* SOIC8 power connections */}
    <trace from=".U1 > .pin8" to="net.VCC" />
    <trace from=".U1 > .pin2" to="net.GND" />
    
    {/* Voltage divider output to SOIC8 input */}
    <trace from="net.VDIV_OUT" to=".U1 > .pin1" />
    
    {/* Pullup resistor connections */}
    <trace from=".R3 > .pin2" to="net.VCC" />
    <trace from=".R3 > .pin1" to=".U1 > .OUT3" />
    
    <trace from=".R4 > .pin2" to="net.VCC" />
    <trace from=".R4 > .pin1" to=".U1 > .OUT4" />
    
    {/* Enable pin connection */}
    <trace from=".U1 > .pin7" to="net.VCC" />
  </board>
  )
  `)

  const circuitSvg = await convertCircuitJsonToSchematicSvg(circuitJson)
  const ogBpcGraph = convertCircuitJsonToBpc(circuitJson)

  expect(circuitSvg).toMatchSvgSnapshot(
    import.meta.path,
    "tscircuitsch01-input-circuit",
  )
  expect(
    getSvgFromGraphicsObject(getGraphicsForBpcGraph(ogBpcGraph), {
      backgroundColor: "white",
    }),
  ).toMatchSvgSnapshot(import.meta.path)
})
