import { stackGraphicsHorizontally, type GraphicsObject } from "graphics-debug"
import { getGraphicsForBpcGraph } from "lib/debug/getGraphicsForBpcGraph"
import type { BpcGraph } from "lib/types"
import { getWlFeatureVecs } from "lib/adjacency-matrix-network-similarity/getBpcGraphWlDistance"
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
    const wlDegrees = this.floatingGraph.boxes.length

    // Include as little information in the initial colors such that the graph will be isomorphic
    const limitInitialColorsToLabels = ["component_center", "netlabel_center"]

    const floatingWlVecs = getWlFeatureVecs(this.floatingGraph, wlDegrees, {
      limitInitialColorsToLabels,
    })
    const fixedWlVecs = getWlFeatureVecs(this.fixedGraph, wlDegrees, {
      limitInitialColorsToLabels,
    })

    // Create maps from WL color to box IDs
    const floatingBoxesByWlColor = new Map<string, FloatingBoxId[]>()
    const fixedBoxesByWlColor = new Map<string, FixedBoxId[]>()

    // Group floating boxes by their WL colors
    for (let i = 0; i < this.floatingGraph.boxes.length; i++) {
      const boxId = this.floatingGraph.boxes[i]!.boxId
      const wlColor = floatingWlVecs.colors[i]!
      if (!floatingBoxesByWlColor.has(wlColor)) {
        floatingBoxesByWlColor.set(wlColor, [])
      }
      floatingBoxesByWlColor.get(wlColor)!.push(boxId)
    }

    // Group fixed boxes by their WL colors
    for (let i = 0; i < this.fixedGraph.boxes.length; i++) {
      const boxId = this.fixedGraph.boxes[i]!.boxId
      const wlColor = fixedWlVecs.colors[i]!
      if (!fixedBoxesByWlColor.has(wlColor)) {
        fixedBoxesByWlColor.set(wlColor, [])
      }
      fixedBoxesByWlColor.get(wlColor)!.push(boxId)
    }

    // Create assignments by matching boxes with the same WL color
    for (const [wlColor, floatingBoxIds] of floatingBoxesByWlColor) {
      const fixedBoxIds = fixedBoxesByWlColor.get(wlColor)

      if (!fixedBoxIds || fixedBoxIds.length !== floatingBoxIds.length) {
        throw new Error(
          `WL color ${wlColor} has mismatched counts: ${floatingBoxIds.length} floating vs ${fixedBoxIds?.length || 0} fixed`,
        )
      }

      // For boxes with the same WL color, we can assign them arbitrarily
      // (since they're structurally equivalent)
      for (let i = 0; i < floatingBoxIds.length; i++) {
        const floatingBoxId = floatingBoxIds[i]!
        const fixedBoxId = fixedBoxIds[i]!
        this.assignment.set(floatingBoxId, fixedBoxId)
        this.acceptedFloatingBoxIds.add(floatingBoxId)
        this.acceptedFixedBoxIds.add(fixedBoxId)
      }
    }

    // Build the complete WIP graph with all assignments
    this.wipGraph = {
      boxes: [...this.fixedGraph.boxes],
      pins: [...this.fixedGraph.pins],
    }

    this.solved = true
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
