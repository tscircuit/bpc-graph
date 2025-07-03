import { getGraphicsForBpcGraph } from "lib/debug/getGraphicsForBpcGraph"
import { getPinDirection } from "lib/graph-utils/getPinDirection"
import { getPinPosition } from "lib/graph-utils/getPinPosition"
import { getColorByIndex } from "lib/graph-utils/getColorByIndex"
import type { BoxId, BpcGraph, BpcPin, MixedBpcGraph } from "lib/types"
import type { GraphicsObject } from "graphics-debug"
import Debug from "debug"

const debug = Debug("schematic-partition-processor")

export type WipPartition = {
  partitionId: string
  filledSingletonSlots: Set<string>
  pins: Array<{ boxId: string; pinId: string }>
}

export type PartitionSingletonKey = `${string}/${number}`

/**
 * A method of partitioning a graph into connected components by dividing boxes
 *
 * This partitioning method lends itself to schematics where some singletonKeys
 * make sense because you don't have the same netlabel on both sides of the box.
 */
export class SchematicPartitionProcessor {
  // frames: GraphicsObject[] = []

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

  boxSingletonKeys: Record<BoxId, Set<string>>

  /**
   * Pins we have *investigated* per partition
   *   key =  `${partitionId}[${boxId}:${pinId}]`
   */
  exploredPins: Set<`${string}[${string}:${string}]`> = new Set()

  /**
   * Pins that have actually been *added* to some partition
   *   key =  `${boxId}:${string}`
   */
  addedPins: Set<`${string}:${string}`> = new Set()

  singletonKeys: PartitionSingletonKey[]
  duplicatePinIfColor: string[]

  constructor(
    public initialGraph: MixedBpcGraph,
    opts: {
      /**
       * Every box has a set of characteristic keys e.g. "vcc/2", "gnd/2". The
       * first part of the key is a color of a pin inside it, the second part is
       * the number of pins in the box. In some applications, we want to make
       * sure that no partition contains two boxes with the same singleton key.
       *
       * If singletonKeys are provided, then we will never partition such that
       * two of these singleton keys are in the same partition.
       */
      singletonKeys?: PartitionSingletonKey[]

      /**
       * If provided, pins with this color are duplicated to every partition.
       * This is typically used for "pins" that represent box centers
       */
      duplicatePinIfColor?: string[]
    } = {},
  ) {
    this.lastGraph = initialGraph
    this.singletonKeys = opts.singletonKeys ?? []
    this.duplicatePinIfColor = opts.duplicatePinIfColor ?? []

    this.wipPartitions = this.initializeWipPartitions()
    this.unexploredPins = this.wipPartitions.flatMap((part) =>
      part.pins.map((p) => ({ ...p, partitionId: part.partitionId })),
    )
    this.boxSingletonKeys = this.initializeBoxSingletonKeys()

    //   this.frames.push(
    //     getGraphicsForBpcGraph(initialGraph, {
    //       title: "Initial Graph",
    //     }),
    //   )
  }
  initializeBoxSingletonKeys() {
    const boxSingletonKeys: Record<BoxId, Set<string>> = {}
    for (const box of this.initialGraph.boxes) {
      const boxPins = this.initialGraph.pins.filter(
        (p) => p.boxId === box.boxId,
      )

      const boxPinCount = boxPins.length

      const singletonKeysForBox = boxPins
        .map((p) => `${p.color}/${boxPinCount}` as const)
        .filter((k) => this.singletonKeys.includes(k))

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
    return wipPartitions
  }

  step() {
    if (this.solved) return
    this.iteration++
    debug(
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
    debug(
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
      debug("  ↳ rejected (singleton conflicts in all partitions)")
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
    debug(`  ↳ accepted → pins in partition now = ${part.pins.length}`)

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
        this.exploredPins.has(`${current.partitionId}[${otherPinKey}]` as const)
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
      debug(
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
    // this.frames.push(graphics)

    // d) return graphics for external use
    return graphics
  }
}
