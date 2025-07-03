import { test, expect } from "bun:test"
import { runTscircuitCode } from "tscircuit"
import { convertCircuitJsonToBpc } from "circuit-json-to-bpc"
import { getGraphicsForBpcGraph, SchematicPartitionProcessor } from "lib/index"
import {
  getSvgFromGraphicsObject,
  stackGraphicsVertically,
} from "graphics-debug"
import { convertCircuitJsonToSchematicSvg } from "circuit-to-svg"

test("tscircuitsch01", async () => {
  const circuitJson = await runTscircuitCode(`
export default () => (
  <board width="10mm" height="10mm" routingDisabled>
    <chip
      name="U1"
      schPinArrangement={{
        leftSide: { direction: "top-to-bottom", pins: [1, 2] },
        rightSide: { direction: "top-to-bottom", pins: [4, 3] },
      }}
      schPinStyle={{
        pin2: { marginTop: 1.2 },
        pin3: { marginTop: 1.2 }
      }}
    />
    <capacitor capacitance="1uF" name="C1" schX={1} schRotation="-90deg" />
    
    <netlabel schX={-1} schY={1} net="V3_3" anchorSide="bottom" connectsTo="U1.pin1" />
    <netlabel schX={-1} schY={-1} net="GND" anchorSide="top" connectsTo="U1.pin2" />
    <netlabel schX={1} schY={1} net="V3_3" anchorSide="bottom" connectsTo={["U1.pin4", "C1.pin1"]} />
    <netlabel schX={1} schY={-1} net="GND" anchorSide="top" connectsTo={["U1.pin3", "C1.pin2"]} />
  </board>
)
  `)

  const circuitSvg = await convertCircuitJsonToSchematicSvg(circuitJson)
  const ogBpcGraph = convertCircuitJsonToBpc(circuitJson)

  const partitionProcessor = new SchematicPartitionProcessor(ogBpcGraph, {
    singletonKeys: ["vcc/2", "gnd/2"],
    centerPinColors: ["netlabel_center", "component_center"],
  })

  partitionProcessor.solve()
  const partitions = partitionProcessor.getPartitions()

  expect(circuitSvg).toMatchSvgSnapshot(
    import.meta.path,
    "tscircuitsch01-input-circuit",
  )
  expect(
    getSvgFromGraphicsObject(
      stackGraphicsVertically([
        getGraphicsForBpcGraph(ogBpcGraph),
        ...partitions.map((p, pIdx) =>
          getGraphicsForBpcGraph(p, {
            title: `Partition ${pIdx}`,
          }),
        ),
      ]),
      {
        backgroundColor: "white",
      },
    ),
  ).toMatchSvgSnapshot(import.meta.path)
})
