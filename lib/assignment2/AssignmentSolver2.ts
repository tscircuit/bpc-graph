import {
  stackGraphicsHorizontally,
  stackGraphicsVertically,
  type GraphicsObject,
} from "graphics-debug"
import { getGraphicsForBpcGraph } from "lib/debug/getGraphicsForBpcGraph"
import type {
  BpcFixedBox,
  BpcFloatingBox,
  BpcGraph,
  FixedBpcGraph,
  FloatingBpcGraph,
} from "lib/types"
import {
  getBpcGraphWlDistance,
  getWlFeatureVecs,
} from "lib/adjacency-matrix-network-similarity/getBpcGraphWlDistance"
import { getColorByIndex } from "lib/graph-utils/getColorByIndex"
import { hashStringToNumber } from "lib/graph-utils/hashStringToNumber"
import { getWlDotProduct } from "lib/adjacency-matrix-network-similarity/wlDotProduct"
import { convertToFlatBpcGraph } from "lib/flat-bpc/convertToFlatBpcGraph"
import { convertFlatBpcToGraphics } from "lib/debug/convertFlatBpcToGraphics"
import { getTotalNetworkLength } from "lib/graph-utils/getTotalNetworkLength"
import { computeGraphNetworkBagOfAnglesMap } from "lib/network-bag-of-angles-assignment/computeGraphNetworkBagOfAnglesMap"
import { reassignGraphNetworksUsingBagOfAngles } from "lib/network-bag-of-angles-assignment/reassignGraphNetworksUsingBagOfAngles"

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

  lastAcceptedEvaluation: {
    floatingBoxId: FloatingBoxId
    originalWipGraph: BpcGraph
    partialFloatingGraph: BpcGraph
    currentWlDist: number
    networkLengths: Map<FixedBoxId, number>
    wlDistances: Map<FixedBoxId, number>
    wlVecs: Map<FixedBoxId, Array<Record<string, number>>>
    wipGraphsWithAddedFixedBoxId: Map<FixedBoxId, BpcGraph>
    wipGraphsWithAddedFixedBoxIdWithReassignedNetworks: Map<
      FixedBoxId,
      BpcGraph
    >
  } | null = null

  lastComputedEvaluations: Array<
    ReturnType<AssignmentSolver2["evaluateFloatingBoxAssignment"]>
  > = []

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

  getRemainingFloatingBoxIds() {
    return (
      this.floatingGraph.boxes
        .map((b) => b.boxId)
        .filter(
          (b) =>
            !this.acceptedFloatingBoxIds.has(b) &&
            !this.rejectedFloatingBoxIds.has(b),
        )
        // Just for testing to increase resilience
        .sort((a, b) => Math.random() - 0.5)
    )
  }

  /**
   * The floating graph, but with only the boxes that have been accepted so far
   */
  getPartialFloatingGraph(nextFloatingBoxId?: FloatingBoxId) {
    const g: FloatingBpcGraph = {
      pins: [],
      boxes: [],
    }

    for (const box of this.floatingGraph.boxes) {
      if (
        this.acceptedFloatingBoxIds.has(box.boxId) ||
        box.boxId === nextFloatingBoxId
      ) {
        g.boxes.push(box as BpcFloatingBox)
        g.pins.push(
          ...this.floatingGraph.pins.filter((p) => p.boxId === box.boxId),
        )
      }
    }

    return g
  }

  evaluateFloatingBoxAssignment(nextFloatingBoxId: FloatingBoxId) {
    const partialFloatingGraph = this.getPartialFloatingGraph(nextFloatingBoxId)

    const currentWlDist = getBpcGraphWlDistance(
      partialFloatingGraph,
      this.wipGraph,
    )
    let bestFixedBoxId: FixedBoxId | null = null
    let bestNewWipGraph: BpcGraph | null = null

    const dEval: typeof this.lastAcceptedEvaluation = {
      floatingBoxId: nextFloatingBoxId,
      originalWipGraph: this.wipGraph,
      partialFloatingGraph,
      currentWlDist: currentWlDist,
      networkLengths: new Map(),
      wlDistances: new Map(),
      wlVecs: new Map(),
      wipGraphsWithAddedFixedBoxId: new Map(),
      wipGraphsWithAddedFixedBoxIdWithReassignedNetworks: new Map(),
    }

    const partialFloatingBagOfAnglesMap =
      computeGraphNetworkBagOfAnglesMap(partialFloatingGraph)
    const floatingBagOfAnglesMap = computeGraphNetworkBagOfAnglesMap(
      this.floatingGraph,
    )

    let bestDist = currentWlDist
    let bestTotalNetworkLength = Infinity
    // const floatingBoxWlVec = getWlFeatureVecs(this.floatingGraph)
    const floatingBoxWlVec = getWlFeatureVecs(partialFloatingGraph)
    for (const fixedBoxId of this.fixedGraph.boxes.map((b) => b.boxId)) {
      if (this.acceptedFixedBoxIds.has(fixedBoxId)) continue
      const wipGraphWithAddedFixedBoxId =
        this.getWipGraphWithAddedFixedBoxId(fixedBoxId)
      const dist = getBpcGraphWlDistance(
        partialFloatingGraph,
        wipGraphWithAddedFixedBoxId,
      )
      const debug_wlVec = getWlFeatureVecs(wipGraphWithAddedFixedBoxId)

      const reassignedGraph = reassignGraphNetworksUsingBagOfAngles(
        wipGraphWithAddedFixedBoxId,
        floatingBagOfAnglesMap,
      ).reassignedGraph as FixedBpcGraph
      const { totalNetworkLength } = getTotalNetworkLength(reassignedGraph)

      // const dist = getWlDotProduct(floatingBoxWlVec, debug_wlVec)

      // console.log(dist, dist2)

      dEval.wipGraphsWithAddedFixedBoxId.set(
        fixedBoxId,
        wipGraphWithAddedFixedBoxId,
      )

      dEval!.wlVecs.set(fixedBoxId, debug_wlVec)
      dEval!.wlDistances.set(fixedBoxId, dist)
      dEval!.networkLengths.set(fixedBoxId, totalNetworkLength)
      dEval!.wipGraphsWithAddedFixedBoxIdWithReassignedNetworks.set(
        fixedBoxId,
        reassignedGraph,
      )

      if (dist < bestDist) {
        bestDist = dist
        bestTotalNetworkLength = totalNetworkLength
        bestNewWipGraph = wipGraphWithAddedFixedBoxId
        bestFixedBoxId = fixedBoxId
      }
    }

    return {
      bestFixedBoxId,
      bestNewWipGraph,
      bestDist,
      bestTotalNetworkLength,
      lastDistanceEvaluation: dEval,
      nextFloatingBoxId,
      partialFloatingGraph,
      floatingBoxWlVec,
    }
  }

  step() {
    if (this.solved) return
    if (this.iterations > 1000) {
      throw new Error("Too many iterations")
    }
    this.iterations++

    if (this.iterations === 1) {
      const nextFloatingBoxId = this.getNextFloatingBoxId()
      const evalResult = this.evaluateFloatingBoxAssignment(nextFloatingBoxId!)
      this.lastComputedEvaluations = [evalResult]
      this.acceptEvaluationResult(evalResult)
      return
    }

    const remainingFloatingBoxIds = this.getRemainingFloatingBoxIds()

    if (remainingFloatingBoxIds.length === 0) {
      this.solved = true
      return
    }

    let bestEvalDist = Infinity
    let bestEvalResult: ReturnType<
      AssignmentSolver2["evaluateFloatingBoxAssignment"]
    > | null = null
    this.lastComputedEvaluations = []
    for (const floatingBoxId of remainingFloatingBoxIds) {
      const evalResult = this.evaluateFloatingBoxAssignment(floatingBoxId)
      this.lastComputedEvaluations.push(evalResult)
      if (evalResult.bestDist < bestEvalDist) {
        bestEvalDist = evalResult.bestDist
        bestEvalResult = evalResult
      }
    }

    if (bestEvalResult) {
      this.acceptEvaluationResult(bestEvalResult)
    }
  }

  acceptEvaluationResult(
    evalResult: ReturnType<AssignmentSolver2["evaluateFloatingBoxAssignment"]>,
  ) {
    const { bestFixedBoxId, bestNewWipGraph, nextFloatingBoxId } = evalResult
    if (bestFixedBoxId === null) {
      this.rejectedFloatingBoxIds.add(nextFloatingBoxId!)
      return
    }

    this.acceptedFloatingBoxIds.add(nextFloatingBoxId!)
    this.assignment.set(nextFloatingBoxId!, bestFixedBoxId)
    this.acceptedFixedBoxIds.add(bestFixedBoxId)
    this.wipGraph = bestNewWipGraph!
    this.lastAcceptedEvaluation = evalResult.lastDistanceEvaluation
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
    const floatingPartialGraphics = getGraphicsForBpcGraph(
      this.getPartialFloatingGraph(),
      {
        title: "Partial Floating",
      },
    )

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
    for (const rect of floatingPartialGraphics.rects ?? []) {
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

    const floatingFlatG = convertToFlatBpcGraph(this.floatingGraph)
    const wipFlatG = convertToFlatBpcGraph(this.wipGraph)
    const fixedFlatG = convertToFlatBpcGraph(this.fixedGraph)

    const floatingFlatGraphics = convertFlatBpcToGraphics(floatingFlatG, {
      title: "Floating Flat",
    })
    const wipFlatGraphics = convertFlatBpcToGraphics(wipFlatG, {
      title: "WIP Flat",
    })
    const fixedFlatGraphics = convertFlatBpcToGraphics(fixedFlatG, {
      title: "Fixed Flat",
    })

    const graphics = stackGraphicsHorizontally([
      stackGraphicsVertically([
        floatingGraphics,
        floatingFlatGraphics,
        floatingPartialGraphics,
      ]),
      stackGraphicsVertically([wipGraphics, wipFlatGraphics]),
      stackGraphicsVertically([fixedGraphics, fixedFlatGraphics]),
    ])

    return graphics
  }
}
