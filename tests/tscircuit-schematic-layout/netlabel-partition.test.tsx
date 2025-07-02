import { test, expect } from "bun:test"
import { runTscircuitCode } from "tscircuit"
import { convertCircuitJsonToBpc } from "circuit-json-to-bpc"
import { 
  getGraphicsForBpcGraph,
  partitionBpcGraph,
} from "lib/index"
import { 
  getSvgFromGraphicsObject,
  stackGraphicsVertically,
  stackGraphicsHorizontally,
} from "graphics-debug"

test("netlabel partitioning with VCC/GND sharing", async () => {
  const circuitJson = await runTscircuitCode(`
    export default () => (
  <board width="25mm" height="15mm" routingDisabled>
    {/* Two chips that share VCC and GND */}
    <chip
      name="U1"
      footprint="soic8"
      schX={-2}
      schY={0}
      pinLabels={{
        "1": "IN",
        "2": "GND", 
        "3": "OUT",
        "4": "VCC"
      }}
    />
    
    <chip
      name="U2"
      footprint="soic8"
      schX={2}
      schY={0}
      pinLabels={{
        "1": "IN",
        "2": "GND", 
        "3": "OUT",
        "4": "VCC"
      }}
    />
    
    {/* Shared power nets */}
    <net name="VCC" />
    <net name="GND" />
    
    {/* Both chips connected to same power rails */}
    <trace from=".U1 > .pin4" to="net.VCC" />
    <trace from=".U1 > .pin2" to="net.GND" />
    <trace from=".U2 > .pin4" to="net.VCC" />
    <trace from=".U2 > .pin2" to="net.GND" />
    
    {/* Signal connection between chips */}
    <trace from=".U1 > .pin3" to=".U2 > .pin1" />
  </board>
  )
  `)

  const bpcGraph = convertCircuitJsonToBpc(circuitJson)
  
  console.log("BPC Graph with shared power nets:")
  console.log("Boxes:", bpcGraph.boxes.length)
  console.log("Pins:", bpcGraph.pins.length)
  
  // Show original graph
  const originalGraphics = getGraphicsForBpcGraph(bpcGraph, {
    title: "Original Circuit with Shared VCC/GND",
  })
  
  // Partition the graph
  const partitions = partitionBpcGraph(bpcGraph)
  console.log("Total partitions:", partitions.length)
  
  // Group partitions by main components
  const u1Partitions = partitions.filter(p => p.boxId.includes("component_0"))
  const u2Partitions = partitions.filter(p => p.boxId.includes("component_1"))
  const netlabelPartitions = partitions.filter(p => p.boxId.includes("net_label"))
  
  console.log("U1 partitions:", u1Partitions.length)
  console.log("U2 partitions:", u2Partitions.length)
  console.log("Netlabel partitions:", netlabelPartitions.length)
  
  // Verify that VCC/GND netlabels appear in multiple partitions
  let vccNetworkId: string | null = null
  let gndNetworkId: string | null = null
  
  for (const pin of bpcGraph.pins) {
    if (pin.color.toLowerCase() === "vcc") {
      vccNetworkId = pin.networkId
    }
    if (pin.color.toLowerCase() === "gnd") {
      gndNetworkId = pin.networkId
    }
  }
  
  console.log("VCC network ID:", vccNetworkId)
  console.log("GND network ID:", gndNetworkId)
  
  // Count how many partitions contain VCC and GND networks
  let partitionsWithVcc = 0
  let partitionsWithGnd = 0
  
  for (const partition of partitions) {
    const networkIds = new Set(partition.subgraph.pins.map(p => p.networkId))
    if (vccNetworkId && networkIds.has(vccNetworkId)) {
      partitionsWithVcc++
    }
    if (gndNetworkId && networkIds.has(gndNetworkId)) {
      partitionsWithGnd++
    }
  }
  
  console.log("Partitions containing VCC:", partitionsWithVcc)
  console.log("Partitions containing GND:", partitionsWithGnd)
  
  // Create visualization
  const u1Graphics = stackGraphicsHorizontally(
    u1Partitions.map((partition, index) => 
      getGraphicsForBpcGraph(partition.subgraph, {
        title: `U1 ${partition.sides.join(",")}`,
        caption: `${partition.subgraph.pins.length} pins`,
      })
    )
  )
  
  const u2Graphics = stackGraphicsHorizontally(
    u2Partitions.map((partition, index) => 
      getGraphicsForBpcGraph(partition.subgraph, {
        title: `U2 ${partition.sides.join(",")}`,
        caption: `${partition.subgraph.pins.length} pins`,
      })
    )
  )
  
  const allGraphics = stackGraphicsVertically([
    originalGraphics,
    u1Graphics,
    u2Graphics,
  ])
  
  // Verify that power nets are shared appropriately
  expect(partitionsWithVcc).toBeGreaterThan(1) // VCC should appear in multiple partitions
  expect(partitionsWithGnd).toBeGreaterThan(1) // GND should appear in multiple partitions
  
  expect(
    getSvgFromGraphicsObject(allGraphics, {
      backgroundColor: "white",
    }),
  ).toMatchSvgSnapshot(import.meta.path)
})