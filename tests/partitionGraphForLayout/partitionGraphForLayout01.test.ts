/** biome-ignore-all lint/style/useFilenamingConvention: <explanation> */
import { test, expect } from "bun:test"
import { runTscircuitCode } from "tscircuit"
import { convertCircuitJsonToBpc } from "circuit-json-to-bpc"
import {
  getGraphicsForBpcGraph,
  getPinDirection,
  getPinDirectionOrThrow,
  getPinPosition,
  mergeBoxSideSubgraphs,
  type BoxId,
  type BpcGraph,
  type BpcPin,
  type FixedBpcGraph,
  type MixedBpcGraph,
} from "lib/index"
import {
  getSvgFromGraphicsObject,
  stackGraphicsHorizontally,
  stackGraphicsVertically,
  type GraphicsObject,
} from "graphics-debug"
import { getColorByIndex } from "lib/graph-utils/getColorByIndex"
// import { partitionGraphForLayout } from "lib/schematic-layout/partitionGraphForLayout"
import { matchGraph } from "lib/match-graph/matchGraph"
import { netAdaptBpcGraph } from "lib/bpc-graph-editing/netAdaptBpcGraph"
import { assignFloatingBoxPositions } from "lib/bpc-graph-editing/assignFloatingBoxPositions"
import corpus from "@tscircuit/schematic-corpus/dist/bundled-bpc-graphs.json"
import { reflectGraph } from "lib/graph-utils/reflectGraph"
import { getCanonicalRightFacingGraph } from "lib/partition-processing/getCanonicalRightFacingGraph"
import { SchematicPartitionProcessor } from "lib/partition-processing/SchematicPartitionProcessor"

test("partitionGraphForLayout01", async () => {
  // export default () => (
  //   <board width="10mm" height="10mm" routingDisabled>
  //     <chip
  //       name="U1"
  //       schPinArrangement={{
  //         leftSide: { direction: "top-to-bottom", pins: [1, 2] },
  //         rightSide: { direction: "top-to-bottom", pins: [4, 3] },
  //       }}
  //       schPinStyle={{
  //         pin2: { marginTop: 1.2 },
  //         pin3: { marginTop: 1.2 }
  //       }}
  //     />
  //     <capacitor capacitance="1uF" name="C1" schX={1} schRotation="-90deg" />

  //     <netlabel schX={-1} schY={1} net="V3_3" anchorSide="bottom" connectsTo="U1.pin1" />
  //     <netlabel schX={-1} schY={-1} net="GND" anchorSide="top" connectsTo="U1.pin2" />
  //     <netlabel schX={1} schY={1} net="V3_3" anchorSide="bottom" connectsTo={["U1.pin4", "C1.pin1"]} />
  //     <netlabel schX={1} schY={-1} net="GND" anchorSide="top" connectsTo={["U1.pin3", "C1.pin2"]} />
  //   </board>
  // )
  const ogGraph: MixedBpcGraph = {
    boxes: [
      {
        boxId: "U1",
        kind: "floating",
        center: {
          x: 0,
          y: 0,
        },
      },
      {
        boxId: "C1",
        kind: "floating",
        center: {
          x: 1,
          y: 0,
        },
      },
      {
        boxId: "NL1",
        kind: "fixed",
        center: {
          x: -1,
          y: 1.18,
        },
        boxAttributes: {
          is_net_label: true,
          source_net_id: "source_net_0",
        },
      },
      {
        boxId: "NL2",
        kind: "fixed",
        center: {
          x: -1,
          y: -1.18,
        },
        boxAttributes: {
          is_net_label: true,
          source_net_id: "source_net_1",
        },
      },
      {
        boxId: "NL3",
        kind: "fixed",
        center: {
          x: 1,
          y: 1.18,
        },
        boxAttributes: {
          is_net_label: true,
          source_net_id: "source_net_0",
        },
      },
      {
        boxId: "NL4",
        kind: "fixed",
        center: {
          x: 1,
          y: -1.18,
        },
        boxAttributes: {
          is_net_label: true,
          source_net_id: "source_net_1",
        },
      },
    ],
    pins: [
      {
        pinId: "U1_center",
        color: "component_center",
        networkId: "center_schematic_component_0",
        offset: {
          x: 0,
          y: 0,
        },
        boxId: "U1",
      },
      {
        pinId: "U1_pin1",
        color: "vcc",
        networkId: "unnamedsubcircuit12_connectivity_net0",
        offset: {
          x: -0.6000000000000001,
          y: 0.7,
        },
        boxId: "U1",
      },
      {
        pinId: "U1_pin2",
        color: "gnd",
        networkId: "unnamedsubcircuit12_connectivity_net1",
        offset: {
          x: -0.6000000000000001,
          y: -0.7,
        },
        boxId: "U1",
      },
      {
        pinId: "U1_pin3",
        color: "vcc",
        networkId: "unnamedsubcircuit12_connectivity_net0",
        offset: {
          x: 0.6000000000000001,
          y: 0.7,
        },
        boxId: "U1",
      },
      {
        pinId: "U1_pin4",
        color: "gnd",
        networkId: "unnamedsubcircuit12_connectivity_net1",
        offset: {
          x: 0.6000000000000001,
          y: -0.7,
        },
        boxId: "U1",
      },
      {
        pinId: "C1_center",
        color: "component_center",
        networkId: "center_schematic_component_1",
        offset: {
          x: 0,
          y: 0,
        },
        boxId: "C1",
      },
      {
        pinId: "C1_pin1",
        color: "vcc",
        networkId: "unnamedsubcircuit12_connectivity_net0",
        offset: {
          x: -0.00027334999999961695,
          y: 0.5512093000000002,
        },
        boxId: "C1",
      },
      {
        pinId: "C1_pin2",
        color: "gnd",
        networkId: "unnamedsubcircuit12_connectivity_net1",
        offset: {
          x: 0.00027334999999961695,
          y: -0.5512093000000002,
        },
        boxId: "C1",
      },
      {
        pinId: "NL1_pin",
        boxId: "NL1",
        networkId: "unnamedsubcircuit12_connectivity_net0",
        color: "vcc",
        offset: {
          x: 0,
          y: -0.17999999999999994,
        },
      },
      {
        pinId: "NL1_center",
        boxId: "NL1",
        networkId: "schematic_net_label_0_center",
        color: "netlabel_center",
        offset: {
          x: 0,
          y: 0,
        },
      },
      {
        pinId: "NL2_pin",
        boxId: "NL2",
        networkId: "unnamedsubcircuit12_connectivity_net1",
        color: "gnd",
        offset: {
          x: 0,
          y: 0.17999999999999994,
        },
      },
      {
        pinId: "NL2_center",
        boxId: "NL2",
        networkId: "schematic_net_label_1_center",
        color: "netlabel_center",
        offset: {
          x: 0,
          y: 0,
        },
      },
      {
        pinId: "NL3_pin",
        boxId: "NL3",
        networkId: "unnamedsubcircuit12_connectivity_net0",
        color: "vcc",
        offset: {
          x: 0,
          y: -0.17999999999999994,
        },
      },
      {
        pinId: "NL3_center",
        boxId: "NL3",
        networkId: "schematic_net_label_2_center",
        color: "netlabel_center",
        offset: {
          x: 0,
          y: 0,
        },
      },
      {
        pinId: "NL4_pin",
        boxId: "NL4",
        networkId: "unnamedsubcircuit12_connectivity_net1",
        color: "gnd",
        offset: {
          x: 0,
          y: 0.17999999999999994,
        },
      },
      {
        pinId: "NL4_center",
        boxId: "NL4",
        networkId: "schematic_net_label_3_center",
        color: "netlabel_center",
        offset: {
          x: 0,
          y: 0,
        },
      },
    ],
  }

  const processor = new SchematicPartitionProcessor(ogGraph, {
    singletonKeys: ["vcc/2", "gnd/2"],
    duplicatePinIfColor: ["netlabel_center", "component_center"],
  })

  const stepGraphics = []

  while (!processor.solved && processor.iteration < 1000) {
    processor.step()
    stepGraphics.push(processor.getGraphicsForLastGraph())
  }

  const partitions = processor.getPartitions()
  const canonicalPartitions = partitions.map(getCanonicalRightFacingGraph)

  const adaptedGraphs = canonicalPartitions.map((part) => {
    const {
      graph: corpusSource,
      graphName,
      distance,
    } = matchGraph(part.g, corpus as any)
    const { adaptedBpcGraph } = netAdaptBpcGraph(corpusSource, part.g)
    return { adaptedBpcGraph, graphName, distance }
  })

  const adaptedUnreflectedGraphs = adaptedGraphs.map(
    ({ adaptedBpcGraph }, idx) => {
      if (!canonicalPartitions[idx]!.reflected) return adaptedBpcGraph
      return reflectGraph({
        graph: adaptedBpcGraph,
        axis: "x",
        centerBoxId: canonicalPartitions[idx]!.centerBoxId!,
      })
    },
  )

  const remergedGraph = mergeBoxSideSubgraphs(adaptedUnreflectedGraphs)

  const remergedGraphics = getGraphicsForBpcGraph(remergedGraph, {
    title: "Merged Graph",
  })

  const adaptedUnreflectedGraphics = adaptedUnreflectedGraphs.map((g, idx) => {
    return getGraphicsForBpcGraph(g, {
      title: `Unreflected Adaptation ${idx}`,
    })
  })

  /* ───────── net-adapt each partition to its best corpus match ───────── */
  const adaptedGraphics = adaptedGraphs.map(
    ({ adaptedBpcGraph, graphName, distance }, idx) => {
      return getGraphicsForBpcGraph(adaptedBpcGraph, {
        title: `Partition ${idx} → ${graphName}  (d=${distance.toFixed(2)})`,
      })
    },
  )

  // ──────────── build graphics ────────────
  const originalGraphics = getGraphicsForBpcGraph(ogGraph, {
    title: "Original Circuit",
  })

  expect(
    getSvgFromGraphicsObject(
      stackGraphicsVertically([originalGraphics, ...stepGraphics]),
      {
        backgroundColor: "white",
        svgWidth: 320,
        svgHeight: 4000,
      },
    ),
  ).toMatchSvgSnapshot(import.meta.path, "partitionGraphForLayout01-iterations")

  const partitionGraphics = partitions.map((p, i) => getGraphicsForBpcGraph(p))

  const bottomRow = stackGraphicsHorizontally(partitionGraphics, {
    titles: partitions.map((_p, i) => `Partition ${i}`),
  })

  const canonicalPartitionGraphics = canonicalPartitions.map((p, i) =>
    getGraphicsForBpcGraph(p.g),
  )

  const canonicalRow = stackGraphicsHorizontally(canonicalPartitionGraphics, {
    titles: canonicalPartitions.map((_p, i) => `Canonical Partition ${i}`),
  })

  const adaptedRow = stackGraphicsHorizontally(adaptedGraphics, {
    titles: partitions.map((_p, i) => `Adapted ${i}`),
  })
  const adaptedUnreflectedRow = stackGraphicsHorizontally(
    adaptedUnreflectedGraphics,
    {
      titles: adaptedUnreflectedGraphs.map(
        (_g, i) => `Adapted Unreflected ${i}`,
      ),
    },
  )
  const allGraphics = stackGraphicsVertically([
    originalGraphics,
    bottomRow,
    canonicalRow,
    adaptedRow,
    adaptedUnreflectedRow,
    remergedGraphics,
  ])

  expect(
    getSvgFromGraphicsObject(allGraphics, { backgroundColor: "white" }),
  ).toMatchSvgSnapshot(import.meta.path)

  expect(partitions.length).toBeGreaterThan(0)
})
