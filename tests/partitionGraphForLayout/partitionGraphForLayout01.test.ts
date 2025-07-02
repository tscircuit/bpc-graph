/** biome-ignore-all lint/style/useFilenamingConvention: <explanation> */
import { test, expect } from "bun:test"
import { runTscircuitCode } from "tscircuit"
import { convertCircuitJsonToBpc } from "circuit-json-to-bpc"
import {
  getGraphicsForBpcGraph,
  getPinDirection,
  getPinDirectionOrThrow,
  getPinPosition,
  type BpcGraph,
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

test("tscircuitsch01", async () => {
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
        boxId: "schematic_component_0",
        kind: "floating",
        center: {
          x: 0,
          y: 0,
        },
      },
      {
        boxId: "schematic_component_1",
        kind: "floating",
        center: {
          x: 1,
          y: 0,
        },
      },
      {
        boxId: "schematic_net_label_0",
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
        boxId: "schematic_net_label_1",
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
        boxId: "schematic_net_label_2",
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
        boxId: "schematic_net_label_3",
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
        pinId: "schematic_component_0_center",
        color: "component_center",
        networkId: "center_schematic_component_0",
        offset: {
          x: 0,
          y: 0,
        },
        boxId: "schematic_component_0",
      },
      {
        pinId: "schematic_port_0",
        color: "vcc",
        networkId: "unnamedsubcircuit12_connectivity_net0",
        offset: {
          x: -0.6000000000000001,
          y: 0.7,
        },
        boxId: "schematic_component_0",
      },
      {
        pinId: "schematic_port_1",
        color: "gnd",
        networkId: "unnamedsubcircuit12_connectivity_net1",
        offset: {
          x: -0.6000000000000001,
          y: -0.7,
        },
        boxId: "schematic_component_0",
      },
      {
        pinId: "schematic_port_2",
        color: "vcc",
        networkId: "unnamedsubcircuit12_connectivity_net0",
        offset: {
          x: 0.6000000000000001,
          y: 0.7,
        },
        boxId: "schematic_component_0",
      },
      {
        pinId: "schematic_port_3",
        color: "gnd",
        networkId: "unnamedsubcircuit12_connectivity_net1",
        offset: {
          x: 0.6000000000000001,
          y: -0.7,
        },
        boxId: "schematic_component_0",
      },
      {
        pinId: "schematic_component_1_center",
        color: "component_center",
        networkId: "center_schematic_component_1",
        offset: {
          x: 0,
          y: 0,
        },
        boxId: "schematic_component_1",
      },
      {
        pinId: "schematic_port_4",
        color: "vcc",
        networkId: "unnamedsubcircuit12_connectivity_net0",
        offset: {
          x: -0.00027334999999961695,
          y: 0.5512093000000002,
        },
        boxId: "schematic_component_1",
      },
      {
        pinId: "schematic_port_5",
        color: "gnd",
        networkId: "unnamedsubcircuit12_connectivity_net1",
        offset: {
          x: 0.00027334999999961695,
          y: -0.5512093000000002,
        },
        boxId: "schematic_component_1",
      },
      {
        pinId: "schematic_net_label_0_pin",
        boxId: "schematic_net_label_0",
        networkId: "unnamedsubcircuit12_connectivity_net0",
        color: "vcc",
        offset: {
          x: 0,
          y: -0.17999999999999994,
        },
      },
      {
        pinId: "schematic_net_label_0_center",
        boxId: "schematic_net_label_0",
        networkId: "schematic_net_label_0_center",
        color: "netlabel_center",
        offset: {
          x: 0,
          y: 0,
        },
      },
      {
        pinId: "schematic_net_label_1_pin",
        boxId: "schematic_net_label_1",
        networkId: "unnamedsubcircuit12_connectivity_net1",
        color: "gnd",
        offset: {
          x: 0,
          y: 0.17999999999999994,
        },
      },
      {
        pinId: "schematic_net_label_1_center",
        boxId: "schematic_net_label_1",
        networkId: "schematic_net_label_1_center",
        color: "netlabel_center",
        offset: {
          x: 0,
          y: 0,
        },
      },
      {
        pinId: "schematic_net_label_2_pin",
        boxId: "schematic_net_label_2",
        networkId: "unnamedsubcircuit12_connectivity_net0",
        color: "vcc",
        offset: {
          x: 0,
          y: -0.17999999999999994,
        },
      },
      {
        pinId: "schematic_net_label_2_center",
        boxId: "schematic_net_label_2",
        networkId: "schematic_net_label_2_center",
        color: "netlabel_center",
        offset: {
          x: 0,
          y: 0,
        },
      },
      {
        pinId: "schematic_net_label_3_pin",
        boxId: "schematic_net_label_3",
        networkId: "unnamedsubcircuit12_connectivity_net1",
        color: "gnd",
        offset: {
          x: 0,
          y: 0.17999999999999994,
        },
      },
      {
        pinId: "schematic_net_label_3_center",
        boxId: "schematic_net_label_3",
        networkId: "schematic_net_label_3_center",
        color: "netlabel_center",
        offset: {
          x: 0,
          y: 0,
        },
      },
    ],
  }

  type WipPartition = {
    partitionId: string
    singletonSlots: Record<string, boolean>
    pins: Array<{ boxId: string; pinId: string }>
  }
  /**
   * DFS Partition Solver
   *
   * We want to partition the graph such that any box with more than
   * two pins is split such that the pins on the same side (with the same
   * direction) are in the same partition and pins on different sides are
   * in different partitions.
   *
   * In this file (with the ogGraph above) there should be two partitions.
   *
   * The tricky thing is the "schematic_component_1" could be put into either
   * partition, but should not be a member of both.
   *
   */
  class DFSPartitionProcessor {
    frames: GraphicsObject[] = []

    lastGraph: BpcGraph

    solved = false

    iteration = 0

    wipPartitions: Array<{
      partitionId: string
      singletonSlots: Record<string, boolean>
      pins: Array<{ boxId: string; pinId: string }>
    }>

    unexploredPins: Array<{
      boxId: string
      pinId: string
      partitionId: string
    }> = []

    singletonColors = ["vcc", "gnd"]

    /** All explored pins in format "boxId:pinId" */
    exploredPins: Set<`${string}:${string}`> = new Set()

    constructor(public initialGraph: MixedBpcGraph) {
      this.lastGraph = initialGraph

      this.wipPartitions = this.initializeWipPartitions()
      this.unexploredPins = this.wipPartitions.flatMap((part) =>
        part.pins.map((p) => ({ ...p, partitionId: part.partitionId })),
      )

      this.frames.push(
        getGraphicsForBpcGraph(initialGraph, {
          title: "Initial Graph",
        }),
      )
    }

    initializeWipPartitions(): WipPartition[] {
      const wipPartitions: WipPartition[] = []

      let partitionId = 0
      for (const box of this.initialGraph.boxes) {
        const pins = this.initialGraph.pins.filter((p) => p.boxId === box.boxId)

        if (pins.length <= 2) {
          continue
        }

        const uniqueDirections = new Set(
          pins.map((p) => getPinDirection(this.initialGraph, box, p)),
        )

        for (const direction of uniqueDirections) {
          const partition: WipPartition = {
            partitionId: `partition${partitionId++}`,
            singletonSlots: {},
            pins: [],
          }

          for (const pin of pins) {
            if (getPinDirection(this.initialGraph, box, pin) === direction) {
              partition.pins.push({ boxId: box.boxId, pinId: pin.pinId })
            }
          }
        }
      }
      return wipPartitions
    }

    step() {
      if (this.solved) return
      this.iteration++
      const g = structuredClone(this.lastGraph)
      this.lastGraph = g

      const unexploredPin = this.unexploredPins.shift()

      // Explore all pins in the unexplored pin's network
      // If we come across a box with exactly two pins, we add the other
      // pin of the box to the unexplored pins list

      // When we come upon a new box, if it it contains a pin that is a singleton
      // color, we check if this partition already contains a singleton of that
      // color. If so, we can't add this box to this partition, don't queue it
      // for exploration. If we do add the box, set the singleton slot to true.

      // TODO
    }

    getPartitions() {
      if (!this.solved) throw new Error("Graph not solved")
      // TODO
    }

    getGraphicsForLastGraph(): GraphicsObject {
      // a) base graphics
      const graphics = getGraphicsForBpcGraph(this.lastGraph, {
        title: `Iteration ${this.iteration}`,
      })

      // b) overlay one rectangle per pending partition
      const total = this.wipPartitions.length
      this.wipPartitions.forEach((part, idx) => {
        if (part.pins.length === 0) return

        // collect bounds of all pins in this partition
        let minX = Infinity
        let minY = Infinity
        let maxX = -Infinity
        let maxY = -Infinity
        for (const { boxId, pinId } of part.pins) {
          const pos = getPinPosition(this.lastGraph, boxId, pinId)
          minX = Math.min(minX, pos.x)
          minY = Math.min(minY, pos.y)
          maxX = Math.max(maxX, pos.x)
          maxY = Math.max(maxY, pos.y)
        }

        const margin = 0.3
        graphics.rects.push({
          center: { x: (minX + maxX) / 2, y: (minY + maxY) / 2 },
          width: maxX - minX + margin * 2,
          height: maxY - minY + margin * 2,
          fill: getColorByIndex(idx, total, 0.05), // translucent fill
        })
      })

      // c) keep a copy for later inspection
      this.frames.push(graphics)

      // d) return graphics for external use
      return graphics
    }
  }

  const processor = new DFSPartitionProcessor(ogGraph)

  const stepGraphics = []

  while (!processor.solved && processor.iteration < 1000) {
    processor.step()
    stepGraphics.push(processor.getGraphicsForLastGraph())
  }

  const partitions = processor.getPartitions()

  // ──────────── build graphics ────────────
  const originalGraphics = getGraphicsForBpcGraph(ogGraph, {
    title: "Original Circuit",
  })

  expect(
    getSvgFromGraphicsObject(
      stackGraphicsVertically([originalGraphics, ...stepGraphics]),
      {
        backgroundColor: "white",
      },
    ),
  ).toMatchSvgSnapshot(import.meta.path)

  return

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
