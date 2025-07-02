/** biome-ignore-all lint/style/useFilenamingConvention: <explanation> */
import { test, expect } from "bun:test"
import { runTscircuitCode } from "tscircuit"
import { convertCircuitJsonToBpc } from "circuit-json-to-bpc"
import {
  getGraphicsForBpcGraph,
  getPinDirection,
  getPinDirectionOrThrow,
  type BpcGraph,
  type MixedBpcGraph,
} from "lib/index"
import {
  getSvgFromGraphicsObject,
  stackGraphicsHorizontally,
  stackGraphicsVertically,
  type GraphicsObject,
} from "graphics-debug"
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

    wipPartitions: Array<Array<{ boxId: string; pinId: string }>>

    unexploredPins: Array<{ boxId: string; pinId: string }> = []

    constructor(public initialGraph: MixedBpcGraph) {
      this.lastGraph = initialGraph

      this.wipPartitions = this.initializeWipPartitions()
      this.unexploredPins = this.wipPartitions.flat()

      this.frames.push(
        getGraphicsForBpcGraph(initialGraph, {
          title: "Initial Graph",
        }),
      )
    }

    initializeWipPartitions(): Array<Array<{ boxId: string; pinId: string }>> {
      const wipPartitions: Array<Array<{ boxId: string; pinId: string }>> = []

      for (const box of this.initialGraph.boxes) {
        const pins = this.initialGraph.pins.filter((p) => p.boxId === box.boxId)

        if (pins.length <= 2) {
          continue
        }

        const uniqueDirections = new Set(
          pins.map((p) => getPinDirection(this.initialGraph, box, p)),
        )

        for (const direction of uniqueDirections) {
          const partition: Array<{ boxId: string; pinId: string }> = []

          for (const pin of pins) {
            if (getPinDirection(this.initialGraph, box, pin) === direction) {
              partition.push({ boxId: box.boxId, pinId: pin.pinId })
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

      // TODO Single traversal

      this.getGraphicsForLastGraph()
    }

    getPartitions() {
      if (!this.solved) throw new Error("Graph not solved")
      // TODO
    }

    getGraphicsForLastGraph(): GraphicsObject {
      const graphics = getGraphicsForBpcGraph(this.lastGraph, {
        title: `Iteration ${this.iteration}`,
      })

      // TODO Modify graphics to show rects around explored sides

      return graphics
    }
  }

  const processor = new DFSPartitionProcessor(ogGraph)

  while (!processor.solved && processor.iteration < 1000) {
    processor.step()
  }

  const partitions = processor.getPartitions()

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
