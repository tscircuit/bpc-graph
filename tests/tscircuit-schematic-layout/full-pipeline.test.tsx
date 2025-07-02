import { test, expect } from "bun:test"
import { runTscircuitCode } from "tscircuit"
import { convertCircuitJsonToBpc } from "circuit-json-to-bpc"
import { 
  getGraphicsForBpcGraph,
  partitionBpcGraph,
  mergePartitions,
  matchGraph,
  netAdaptBpcGraph,
  assignFloatingBoxPositions,
} from "lib/index"
import { 
  getSvgFromGraphicsObject,
  stackGraphicsVertically,
  stackGraphicsHorizontally,
} from "graphics-debug"
import corpus from "@tscircuit/schematic-corpus/dist/bundled-bpc-graphs.json"

test("full schematic layout pipeline", async () => {
  const circuitJson = await runTscircuitCode(`
    export default () => (
  <board width="25mm" height="15mm" routingDisabled>
    {/* Simple circuit with one main chip */}
    <chip
      name="U1"
      footprint="soic8"
      schX={0}
      schY={0}
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
    
    {/* Some passive components */}
    <resistor
      name="R1"
      resistance="10k"
      schX={-3}
      schY={0}
    />
    
    <capacitor
      name="C1"
      capacitance="100nF"
      schX={3}
      schY={0}
    />
    
    {/* Power nets */}
    <net name="VCC" />
    <net name="GND" />
    
    {/* Connections */}
    <trace from=".U1 > .pin8" to="net.VCC" />
    <trace from=".U1 > .pin2" to="net.GND" />
    <trace from=".R1 > .pin2" to=".U1 > .pin1" />
    <trace from=".C1 > .pin1" to=".U1 > .pin3" />
  </board>
  )
  `)

  const ogBpcGraph = convertCircuitJsonToBpc(circuitJson)
  
  console.log("=== STEP 1: Original BPC Graph ===")
  console.log("Boxes:", ogBpcGraph.boxes.length)
  console.log("Pins:", ogBpcGraph.pins.length)
  
  const originalGraphics = getGraphicsForBpcGraph(ogBpcGraph, {
    title: "1. Original BPC Graph",
  })

  console.log("=== STEP 2: Partitioning ===")
  const partitions = partitionBpcGraph(ogBpcGraph)
  console.log("Total partitions:", partitions.length)
  
  // Focus on the main chip partitions for the pipeline
  const mainChipPartitions = partitions.filter(p => 
    p.boxId.includes("component_0") // The main chip
  )
  console.log("Main chip partitions:", mainChipPartitions.length)
  
  const partitionGraphics = stackGraphicsHorizontally(
    mainChipPartitions.map((partition, index) => 
      getGraphicsForBpcGraph(partition.subgraph, {
        title: `2.${index + 1} ${partition.sides.join(",")} Side`,
        caption: `${partition.subgraph.boxes.length} boxes, ${partition.subgraph.pins.length} pins`,
      })
    )
  )

  console.log("=== STEP 3: Matching and Adaptation ===")
  const processedPartitions = mainChipPartitions.map((partition, index) => {
    console.log(`Processing partition ${index}: ${partition.partitionId}`)
    
    // Match against corpus
    const matchResult = matchGraph(partition.subgraph, corpus as any)
    console.log(`  Best match: ${matchResult.graphName} (distance: ${matchResult.distance.toFixed(3)})`)
    
    try {
      // Adapt the partition to match the corpus pattern
      const fixedSubgraph = assignFloatingBoxPositions(partition.subgraph)
      const adaptedResult = netAdaptBpcGraph(fixedSubgraph, matchResult.graph!)
      
      // Assign positions to any remaining floating boxes
      const finalSubgraph = assignFloatingBoxPositions(adaptedResult.adaptedBpcGraph)
      
      return {
        ...partition,
        subgraph: finalSubgraph,
        matchResult,
        adapted: true,
      }
    } catch (error) {
      console.log(`  Adaptation failed, using original: ${error}`)
      return {
        ...partition,
        matchResult,
        adapted: false,
      }
    }
  })

  const matchedGraphics = stackGraphicsHorizontally(
    processedPartitions.map((partition, index) => 
      stackGraphicsVertically([
        getGraphicsForBpcGraph(partition.subgraph, {
          title: `3.${index + 1} ${partition.adapted ? 'Adapted' : 'Original'}`,
          caption: `Match: ${partition.matchResult.graphName}`,
        }),
        getGraphicsForBpcGraph(partition.matchResult.graph!, {
          title: `Corpus: ${partition.matchResult.graphName}`,
          caption: `Distance: ${partition.matchResult.distance.toFixed(3)}`,
        }),
      ])
    )
  )

  console.log("=== STEP 4: Merging ===")
  const mergedGraph = mergePartitions(processedPartitions)
  console.log("Merged graph:")
  console.log("  Boxes:", mergedGraph.boxes.length)
  console.log("  Pins:", mergedGraph.pins.length)
  
  const mergedGraphics = getGraphicsForBpcGraph(mergedGraph, {
    title: "4. Merged Result",
    caption: "Final layout after pipeline",
  })

  // Stack all graphics to show the complete pipeline
  const allGraphics = stackGraphicsVertically([
    originalGraphics,
    partitionGraphics,
    matchedGraphics,
    mergedGraphics,
  ])

  // Verify the pipeline worked
  expect(partitions.length).toBeGreaterThan(0)
  expect(mainChipPartitions.length).toBeGreaterThan(0)
  expect(processedPartitions.length).toBe(mainChipPartitions.length)
  expect(mergedGraph.boxes.length).toBeGreaterThan(0)
  expect(mergedGraph.pins.length).toBeGreaterThan(0)

  expect(
    getSvgFromGraphicsObject(allGraphics, {
      backgroundColor: "white",
    }),
  ).toMatchSvgSnapshot(import.meta.path)
})