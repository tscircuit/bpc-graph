import { test, expect } from "bun:test"
import { runTscircuitCode } from "tscircuit"
import { convertCircuitJsonToBpc } from "circuit-json-to-bpc"
import { getGraphicsForBpcGraph } from "lib/index"
import {
  getSvgFromGraphicsObject,
  stackGraphicsHorizontally,
  stackGraphicsVertically,
} from "graphics-debug"
// import { partitionGraphForLayout } from "lib/schematic-layout/partitionGraphForLayout"

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

  const ogGraph = convertCircuitJsonToBpc(circuitJson)

  // const { partitions } = partitionGraphForLayout(ogGraph)
  const partitions = [ogGraph]

  // ──────────── build graphics ────────────
  const originalGraphics = getGraphicsForBpcGraph(ogGraph, {
    title: "Original Circuit",
  })

  const partitionGraphics = partitions.map((p, i) => getGraphicsForBpcGraph(p))

  const bottomRow = stackGraphicsHorizontally(partitionGraphics, {
    titles: partitions.map((_p, i) => `Partition ${i}`),
  })
  const allGraphics = stackGraphicsVertically([originalGraphics, bottomRow])

  expect(
    getSvgFromGraphicsObject(allGraphics, { backgroundColor: "white" }),
  ).toMatchSvgSnapshot(import.meta.path)

  expect(partitions.length).toBeGreaterThan(0)
})
