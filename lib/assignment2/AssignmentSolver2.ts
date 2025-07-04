import { stackGraphicsHorizontally, type GraphicsObject } from "graphics-debug"
import { getGraphicsForBpcGraph } from "lib/debug/getGraphicsForBpcGraph"
import type { BpcFixedBox, BpcGraph } from "lib/types"
import { getBpcGraphWlDistance } from "lib/adjacency-matrix-network-similarity/getBpcGraphWlDistance"
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
  assignment: Map<FloatingBoxId, FixedBoxId> = new Map()

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

    let bestDist = currentDist
    for (const fixedBoxId of this.fixedGraph.boxes.map((b) => b.boxId)) {
      const wipGraphWithAddedFixedBoxId =
        this.getWipGraphWithAddedFixedBoxId(fixedBoxId)
      const dist = getBpcGraphWlDistance(
        this.floatingGraph,
        wipGraphWithAddedFixedBoxId,
      )
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

    // Anywhere in the floatingGraphics where the rect.label matches an assignment,
    // change the fill to correspond with the assignment and the text to
    // show the assignment, same with the wipGraphics and fixedGraphics but
    // be mindful that the labels represents the fixed box id, not the floating
    // box id
    for (const rect of floatingGraphics.rects) {
      // const color = getColorByIndex(
      //   hashStringToNumber(rect.label!) % 100,
      //   100,
      //   0.5
      // )
      // rect.fill = color
    }

    const graphics = stackGraphicsHorizontally([
      floatingGraphics,
      wipGraphics,
      fixedGraphics,
    ])

    return graphics
  }
}
