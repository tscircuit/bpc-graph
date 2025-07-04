import { stackGraphicsHorizontally, type GraphicsObject } from "graphics-debug"
import { getGraphicsForBpcGraph } from "lib/debug/getGraphicsForBpcGraph"
import type { BpcFixedBox, BpcGraph } from "lib/types"
import {
  getBpcGraphWlDistance,
  getWlFeatureVecs,
} from "lib/adjacency-matrix-network-similarity/getBpcGraphWlDistance"
import { getColorByIndex } from "lib/graph-utils/getColorByIndex"
import { hashStringToNumber } from "lib/graph-utils/hashStringToNumber"

type FloatingBoxId = string
type FixedBoxId = string

/**
 * Computes an assignment for each floating box to each fixed box by gradually
 * building a graph (the wipGraph) that is attempting to incrementally match the
 * floating graph (optimizing for a low WL distance)
 *
 * The wipGraph exists in the "Fixed Box" space, so all the box ids of the
 * wipGraph are fixed box ids. It basically represents what happens if you
 * construct a graph using the known assignments so far.
 *
 * Each iteration we test what the effect would be of adding a box to the
 * wipGraph, if it helps the WL distance, then we proceed with assigning it,
 * however if the WL distance goes down, then we reject the box.
 */
export class AssignmentSolver2 {
  wipGraph: BpcGraph

  iterations = 0
  solved = false

  acceptedFloatingBoxIds: Set<FloatingBoxId> = new Set()
  rejectedFloatingBoxIds: Set<FloatingBoxId> = new Set()
  acceptedFixedBoxIds: Set<FixedBoxId> = new Set()
  assignment: Map<FloatingBoxId, FixedBoxId> = new Map()

  lastDistanceEvaluation: {
    floatingBoxId: FloatingBoxId
    originalWipGraph: BpcGraph
    currentDist: number
    distances: Map<FixedBoxId, number>
    wlVecs: Map<FixedBoxId, Array<Record<string, number>>>
  } | null = null

  constructor(
    public floatingGraph: BpcGraph,
    public fixedGraph: BpcGraph,
  ) {
    this.wipGraph = {
      pins: [],
      boxes: [],
    }
  }

  /**
   * Returns the floating box id that should be assigned next.
   *
   * Currently this picks the boxes with the most pins first- but this
   * could be improved by picking the next box that is most relevant to the
   * network (e.g. a box that should be connected to the wipGraph)
   */
  getNextFloatingBoxId() {
    const remainingFloatingBoxIds = this.floatingGraph.boxes
      .map((b) => b.boxId)
      .filter(
        (b) =>
          !this.acceptedFloatingBoxIds.has(b) &&
          !this.rejectedFloatingBoxIds.has(b),
      )

    if (!remainingFloatingBoxIds.length) {
      throw new Error("No remaining floating box ids")
    }

    // Pick the floating box with the most pins
    let bestFloatingBoxId = remainingFloatingBoxIds[0]
    let bestFloatingBoxPinCount = 0
    for (const floatingBoxId of remainingFloatingBoxIds) {
      const floatingBoxPins = this.floatingGraph.pins.filter(
        (p) => p.boxId === floatingBoxId,
      )
      if (floatingBoxPins.length > bestFloatingBoxPinCount) {
        bestFloatingBoxId = floatingBoxId
        bestFloatingBoxPinCount = floatingBoxPins.length
      }
    }

    return bestFloatingBoxId
  }

  step() {
    if (this.solved) return
    if (this.iterations > 1000) {
      throw new Error("Too many iterations")
    }
    this.iterations++

    const nextFloatingBoxId = this.getNextFloatingBoxId()

    if (!nextFloatingBoxId) {
      this.solved = true
      return
    }

    const currentDist = getBpcGraphWlDistance(this.floatingGraph, this.wipGraph)
    let bestFixedBoxId: FixedBoxId | null = null
    let bestNewWipGraph: BpcGraph | null = null

    this.lastDistanceEvaluation = {
      floatingBoxId: nextFloatingBoxId,
      originalWipGraph: this.wipGraph,
      currentDist,
      distances: new Map(),
      wlVecs: new Map(),
    }

    let bestDist = currentDist
    for (const fixedBoxId of this.fixedGraph.boxes.map((b) => b.boxId)) {
      if (this.acceptedFixedBoxIds.has(fixedBoxId)) continue
      const wipGraphWithAddedFixedBoxId =
        this.getWipGraphWithAddedFixedBoxId(fixedBoxId)
      const dist = getBpcGraphWlDistance(
        this.floatingGraph,
        wipGraphWithAddedFixedBoxId,
      )
      const debug_wlVec = getWlFeatureVecs(wipGraphWithAddedFixedBoxId)
      this.lastDistanceEvaluation.wlVecs.set(fixedBoxId, debug_wlVec)
      this.lastDistanceEvaluation.distances.set(fixedBoxId, dist)
      if (dist < bestDist) {
        bestDist = dist
        bestNewWipGraph = wipGraphWithAddedFixedBoxId
        bestFixedBoxId = fixedBoxId
      }
    }

    if (bestFixedBoxId === null) {
      this.rejectedFloatingBoxIds.add(nextFloatingBoxId!)
      return
    }

    this.acceptedFloatingBoxIds.add(nextFloatingBoxId!)
    this.assignment.set(nextFloatingBoxId!, bestFixedBoxId)
    this.acceptedFixedBoxIds.add(bestFixedBoxId)
    this.wipGraph = bestNewWipGraph!
  }

  getWipGraphWithAddedFixedBoxId(fid: FixedBoxId): BpcGraph {
    const g = structuredClone(this.wipGraph)
    const boxToAdd = this.fixedGraph.boxes.find((b) => b.boxId === fid)!
    g.boxes.push(boxToAdd as any)
    g.pins.push(...this.fixedGraph.pins.filter((p) => p.boxId === fid))
    return g
  }

  visualize(): GraphicsObject {
    const floatingGraphics = getGraphicsForBpcGraph(this.floatingGraph, {
      title: "Floating",
    })
    const wipGraphics = getGraphicsForBpcGraph(this.wipGraph, {
      title: "WIP",
    })
    const fixedGraphics = getGraphicsForBpcGraph(this.fixedGraph, {
      title: "Fixed",
    })

    // ------------------------------------------------------------------
    // 1.  Build colour table – one colour per (floating → fixed) mapping
    // ------------------------------------------------------------------
    const colorByFloatingId = new Map<FloatingBoxId, string>()
    const fixedToFloating = new Map<FixedBoxId, FloatingBoxId>()
    for (const [floatId, fixedId] of this.assignment) {
      const colour = getColorByIndex(
        (hashStringToNumber(floatId) * 47) % 100,
        100,
        0.5,
      )
      colorByFloatingId.set(floatId, colour)
      fixedToFloating.set(fixedId, floatId)
    }

    // ------------------------------------------------------------------
    // 2.  Helper that paints & relabels a rect when we know the mapping
    // ------------------------------------------------------------------
    function decorateRect(
      rect: { label?: string; fill?: string },
      floatId: string,
      fixedId: string,
    ) {
      const colour = colorByFloatingId.get(floatId)!
      rect.fill = colour
      rect.label = `${floatId}→${fixedId}`
    }

    // ------------------------------------------------------------------
    // 3.  Update floating-graph rects (labels are floating ids)
    // ------------------------------------------------------------------
    for (const rect of floatingGraphics.rects ?? []) {
      const floatId = rect.label
      if (!floatId) continue
      const fixedId = this.assignment.get(floatId)
      if (fixedId) decorateRect(rect, floatId, fixedId)
    }

    // ------------------------------------------------------------------
    // 4.  Update wip & fixed-graph rects (labels are fixed ids)
    // ------------------------------------------------------------------
    const targetGraphics = [wipGraphics, fixedGraphics]
    for (const g of targetGraphics) {
      for (const rect of g.rects ?? []) {
        const fixedId = rect.label
        if (!fixedId) continue
        const floatId = fixedToFloating.get(fixedId)
        if (floatId) decorateRect(rect, floatId, fixedId)
      }
    }

    const graphics = stackGraphicsHorizontally([
      floatingGraphics,
      wipGraphics,
      fixedGraphics,
    ])

    return graphics
  }
}
