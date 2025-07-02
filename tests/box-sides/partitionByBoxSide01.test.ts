import { test, expect } from "bun:test"
import { runTscircuitCode } from "tscircuit"
import { convertCircuitJsonToBpc } from "circuit-json-to-bpc"
import { partitionByBoxSide } from "lib/box-sides/partitionByBoxSide"

// ensure power net labels appear in both subgraphs

test("partitionByBoxSide duplicates power labels", async () => {
  const circuitJson = await runTscircuitCode(`
    export default () => (
  <board width="25mm" height="15mm" routingDisabled>
    <resistor resistance="10k" footprint="0402" name="R1" schX={-4} schY={2} schRotation="-90deg" />
    <resistor resistance="10k" footprint="0402" name="R2" schRotation="-90deg" schX={-4} schY={-2} />
    <chip name="U1" footprint="soic8" schX={0} schY={0} pinLabels={{"1":"VIN","2":"GND","3":"OUT1","4":"OUT2","5":"OUT3","6":"OUT4","7":"EN","8":"VCC"}} />
    <net name="VCC" />
    <net name="GND" />
  </board>
  )
  `)
  const g = convertCircuitJsonToBpc(circuitJson)
  const { leftSubgraph, rightSubgraph } = partitionByBoxSide(
    g,
    "schematic_component_2",
  )

  const getPowerLabels = (sg: any) =>
    sg.boxes
      .filter((b: any) => b.boxAttributes?.is_net_label)
      .map((b: any) => b.boxId)

  const leftLabels = getPowerLabels(leftSubgraph)
  const rightLabels = getPowerLabels(rightSubgraph)

  expect(leftLabels).toEqual(rightLabels)
})
