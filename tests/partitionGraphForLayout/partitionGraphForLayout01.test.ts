/** biome-ignore-all lint/style/useFilenamingConvention: <explanation> */
import { test, expect } from "bun:test"
import { runTscircuitCode } from "tscircuit"
import { convertCircuitJsonToBpc } from "circuit-json-to-bpc"
import {
  getGraphicsForBpcGraph,
  getPinDirection,
  getPinDirectionOrThrow,
  getPinPosition,
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

  /**
   * The canonical right-facing graph has the largest left_right box with pins
   * offset to the right of their box center (not the left)
   */
  const getCanonicalRightFacingGraph = (
    g: MixedBpcGraph,
  ): {
    g: MixedBpcGraph
    reflected: boolean
    centerBoxId: BoxId | null
  } => {
    let largestLeftRightBox = null
    let largestLeftRightBoxPins = -Infinity

    for (const box of g.boxes) {
      const lrPins = g.pins
        .filter((p) => p.boxId === box.boxId)
        .filter((p) =>
          ["x-", "x+"].includes(getPinDirection(g, box, p) ?? "none"),
        )

      if (lrPins.length > largestLeftRightBoxPins && lrPins.length > 1) {
        largestLeftRightBox = box
        largestLeftRightBoxPins = lrPins.length
      }
    }

    if (!largestLeftRightBox) {
      return { g, reflected: false, centerBoxId: null }
    }

    const largestBoxLRPinDirections = g.pins
      .filter((p) => p.boxId === largestLeftRightBox.boxId)
      .map((p) => getPinDirection(g, largestLeftRightBox, p))

    const dirCounts = {
      "x+": 0,
      "x-": 0,
      "y+": 0,
      "y-": 0,
    }

    for (const dir of largestBoxLRPinDirections) {
      if (!dir) continue
      dirCounts[dir]++
    }

    if (dirCounts["x+"] > dirCounts["x-"]) {
      return { g, reflected: false, centerBoxId: largestLeftRightBox.boxId }
    }

    return {
      g: reflectGraph({
        graph: g,
        axis: "x",
        centerBoxId: largestLeftRightBox.boxId,
      }),
      reflected: true,
      centerBoxId: largestLeftRightBox.boxId,
    }
  }

  type WipPartition = {
    partitionId: string
    filledSingletonSlots: Set<string>
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
   * The tricky thing is the "C1" could be put into either
   * partition, but should not be a member of both.
   *
   */
  class DFSPartitionProcessor {
    frames: GraphicsObject[] = []

    lastGraph: BpcGraph

    lastExploredPin?: BpcPin & { partitionId: string }

    solved = false

    iteration = 0

    wipPartitions: WipPartition[]

    unexploredPins: Array<{
      boxId: string
      pinId: string
      partitionId: string
    }> = []

    /** color/boxPinCount */
    singletonKeys = ["vcc/2", "gnd/2"]

    duplicatePinIfColor = ["netlabel_center", "component_center"]

    boxSingletonKeys: Record<BoxId, Set<string>>

    /**
     * Pins we have *investigated* per partition
     *   key =  `${partitionId}[${boxId}:${pinId}]`
     */
    exploredPins: Set<`${string}[${string}:${string}]`> = new Set()

    /**
     * Pins that have actually been *added* to some partition
     *   key =  `${boxId}:${pinId}`
     */
    addedPins: Set<`${string}:${string}`> = new Set()

    constructor(public initialGraph: MixedBpcGraph) {
      this.lastGraph = initialGraph

      this.wipPartitions = this.initializeWipPartitions()
      this.unexploredPins = this.wipPartitions.flatMap((part) =>
        part.pins.map((p) => ({ ...p, partitionId: part.partitionId })),
      )
      this.boxSingletonKeys = this.initializeBoxSingletonKeys()

      this.frames.push(
        getGraphicsForBpcGraph(initialGraph, {
          title: "Initial Graph",
        }),
      )
    }
    initializeBoxSingletonKeys() {
      const boxSingletonKeys: Record<BoxId, Set<string>> = {}
      for (const box of this.initialGraph.boxes) {
        const boxPins = this.initialGraph.pins.filter(
          (p) => p.boxId === box.boxId,
        )

        const boxPinCount = boxPins.length

        const singletonKeysForBox = boxPins
          .map((p) => `${p.color}/${boxPinCount}`)
          .filter((k) => this.singletonKeys.includes(k))

        console.log(singletonKeysForBox)

        boxSingletonKeys[box.boxId] = new Set(singletonKeysForBox)
      }
      return boxSingletonKeys
    }

    initializeWipPartitions(): WipPartition[] {
      const wipPartitions: WipPartition[] = []

      let partitionId = 0
      for (const box of this.initialGraph.boxes) {
        const pins = this.initialGraph.pins
          .filter((p) => p.boxId === box.boxId)
          .filter((p) => getPinDirection(this.initialGraph, box, p))

        if (pins.length <= 2) {
          continue
        }

        const uniqueDirections = new Set(
          pins.map((p) => getPinDirection(this.initialGraph, box, p)),
        )

        for (const direction of uniqueDirections) {
          const partition: WipPartition = {
            partitionId: `partition${partitionId++}`,
            filledSingletonSlots: new Set(),
            pins: [],
          }

          for (const pin of pins) {
            if (getPinDirection(this.initialGraph, box, pin) === direction) {
              partition.pins.push({ boxId: box.boxId, pinId: pin.pinId })
            }
          }

          wipPartitions.push(partition)
        }
      }
      console.log(wipPartitions)
      return wipPartitions
    }

    step() {
      if (this.solved) return
      this.iteration++
      console.log(
        `\n── Iteration ${this.iteration} ──` +
          `  unexplored=${this.unexploredPins.length}` +
          `  explored=${this.exploredPins.size}`,
      )

      /* ――― no more work to do? ――― */
      if (this.unexploredPins.length === 0) {
        this.solved = true
        return
      }

      /* ――― pick next pin to explore ――― */
      const current = this.unexploredPins.shift()!
      console.log(
        `Exploring pin ${current.boxId}:${current.pinId} in partition ${current.partitionId}`,
      )
      this.lastExploredPin = {
        ...current,
        partitionId: current.partitionId,
      } as BpcPin & { partitionId: string }
      const pinKey = `${current.boxId}:${current.pinId}` as const
      const exploredKey = `${current.partitionId}[${pinKey}]` as const

      const pinObj = this.initialGraph.pins.find(
        (p) => p.boxId === current.boxId && p.pinId === current.pinId,
      )
      if (!pinObj) return
      const isDuplicable = this.duplicatePinIfColor.includes(pinObj.color)

      // skip only if non-duplicable pin was already put in some partition
      if (this.addedPins.has(pinKey) && !isDuplicable) return
      if (this.exploredPins.has(exploredKey)) return

      const part = this.wipPartitions.find(
        (p) => p.partitionId === current.partitionId,
      )
      if (!part) return

      const singletonKeysForBox = this.boxSingletonKeys[current.boxId]!

      // does the current partition already contain any of those singleton slots?
      const hasConflict = Array.from(singletonKeysForBox).some((k) =>
        part.filledSingletonSlots.has(k),
      )

      if (hasConflict) {
        // no partition can accept this pin/box – mark as explored (discard)
        console.log("  ↳ rejected (singleton conflicts in all partitions)")
        this.exploredPins.add(exploredKey)
        return
      }

      /* ――― accept pin into partition ――― */
      // reserve all singleton keys this box brings in
      for (const k of singletonKeysForBox) {
        part.filledSingletonSlots.add(k)
      }
      part.pins.push({ boxId: current.boxId, pinId: current.pinId })

      // add to global set only if it must stay unique
      if (!isDuplicable) this.addedPins.add(pinKey)
      this.exploredPins.add(exploredKey)
      console.log(`  ↳ accepted → pins in partition now = ${part.pins.length}`)

      /* ――― queue other pins on the same network ――― */
      for (const other of this.initialGraph.pins) {
        if (other.networkId !== pinObj.networkId) continue
        const otherPinKey = `${other.boxId}:${other.pinId}` as const
        if (
          this.addedPins.has(otherPinKey) &&
          !this.duplicatePinIfColor.includes(other.color)
        )
          continue
        if (
          this.exploredPins.has(
            `${current.partitionId}[${otherPinKey}]` as const,
          )
        )
          continue
        this.unexploredPins.push({
          boxId: other.boxId,
          pinId: other.pinId,
          partitionId: current.partitionId,
        })
      }

      /* ――― if the current box only has two pins, queue the mate pin ――― */
      const boxPins = this.initialGraph.pins.filter(
        (p) => p.boxId === current.boxId,
      )
      if (boxPins.length === 2) {
        const mate = boxPins.find((p) => p.pinId !== current.pinId)!
        const mateKey = `${mate.boxId}:${mate.pinId}` as const
        const mateIsDuplicable = this.duplicatePinIfColor.includes(mate.color)
        if (
          (this.addedPins.has(mateKey) && !mateIsDuplicable) ||
          this.exploredPins.has(`${current.partitionId}[${mateKey}]` as const)
        ) {
          /* skip */
        } else {
          this.unexploredPins.push({
            boxId: mate.boxId,
            pinId: mate.pinId,
            partitionId: current.partitionId,
          })
        }
      }

      /* ――― done? ――― */
      if (this.unexploredPins.length === 0) this.solved = true

      if (this.solved) {
        console.log(
          `Solver finished in ${this.iteration} iterations,` +
            ` partitions=${this.getPartitions().length}`,
        )
      }
    }

    getPartitions(): MixedBpcGraph[] {
      if (!this.solved) throw new Error("Graph not solved")

      const partitions: MixedBpcGraph[] = []

      for (const part of this.wipPartitions) {
        if (part.pins.length === 0) continue

        // ---- gather ids of boxes already represented in the partition ----
        const pinKeySet = new Set(
          part.pins.map(({ boxId, pinId }) => `${boxId}:${pinId}`),
        )
        const boxIdSet = new Set(part.pins.map(({ boxId }) => boxId))

        // ---- collect pins ---------------------------------------------------
        const pins = this.initialGraph.pins
          .filter(
            (p) =>
              pinKeySet.has(`${p.boxId}:${p.pinId}`) ||
              (this.duplicatePinIfColor.includes(p.color) &&
                boxIdSet.has(p.boxId)),
          )
          .map((p) => ({ ...p }))

        // ---- collect boxes that own at least one of those pins --------------
        const boxes = this.initialGraph.boxes
          .filter((b) => pins.some((p) => p.boxId === b.boxId))
          .map((b) => ({ ...b }))

        partitions.push({ boxes, pins })
      }

      return partitions
    }

    getGraphicsForLastGraph(): GraphicsObject {
      // a) base graphics
      const graphics = getGraphicsForBpcGraph(this.lastGraph, {
        title: `Iteration ${this.iteration}`,
      })

      // b) overlay one rectangle per pending partition
      const total = this.wipPartitions.length
      const PIN_RECT_SIZE = 0.4 // side length of highlight around each pin
      this.wipPartitions.forEach((part, idx) => {
        if (part.pins.length === 0) return

        const fill = getColorByIndex(idx, total, 0.25) // 0.25 opacity

        for (const { boxId, pinId } of part.pins) {
          const { x, y } = getPinPosition(this.lastGraph, boxId, pinId)
          graphics.rects.push({
            center: { x, y },
            width: PIN_RECT_SIZE,
            height: PIN_RECT_SIZE,
            fill,
          })
        }
      })

      // --- highlight last explored pin ---
      if (this.lastExploredPin) {
        const { boxId, pinId, color } = this.lastExploredPin
        const pos = getPinPosition(this.lastGraph, boxId, pinId)
        const size = 0.25
        graphics.rects.push({
          center: { x: pos.x, y: pos.y },
          width: size,
          height: size,
          fill: this.lastExploredPin.partitionId
            ? getColorByIndex(
                this.wipPartitions.findIndex(
                  (p) => p.partitionId === this.lastExploredPin!.partitionId,
                ),
                this.wipPartitions.length,
                1,
              )
            : "black",
        })
        graphics.texts.push({
          x: pos.x,
          y: pos.y,
          text: `${boxId}:${pinId}-${Array.from(this.boxSingletonKeys[boxId] ?? []).join(",")}`,
          fontSize: 0.1,
        })
      }

      // c) keep a copy for later inspection
      this.frames.push(graphics)

      // d) return graphics for external use
      return graphics
    }
  }

  const processor = new DFSPartitionProcessor(ogGraph)

  console.log(processor.boxSingletonKeys)

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
  ])

  expect(
    getSvgFromGraphicsObject(allGraphics, { backgroundColor: "white" }),
  ).toMatchSvgSnapshot(import.meta.path)

  expect(partitions.length).toBeGreaterThan(0)
})
