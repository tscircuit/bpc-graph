import { BaseSolver } from "lib/generic-solvers/BaseSolver"
import type { CostConfiguration } from "lib/operations/configureOperationCostFn"
import type { Operation, OperationCostFn } from "lib/operations/operation-types"
import type { BpcGraph, BpcPin, FloatingBpcGraph } from "lib/types"
import { getPossibleOperationsForGraph } from "./getPossibleOperationsForGraph"
import { applyOperation } from "lib/operations/applyOperation/applyOperation"
import { getHeuristicNetworkSimilarityDistance } from "lib/heuristic-network-similarity/getHeuristicSimilarityDistance"
import { getOperationCost } from "lib/operations/getOperationCost/getOperationCost"
import { configureOperationCostFn } from "lib/operations/configureOperationCostFn"
import { transformGraphWithAssignments } from "./transformGraphWithAssignments"
import type { LibContext } from "lib/context"

interface Candidate {
  graph: BpcGraph // Current state of the graph
  operationChain: Operation[] // Operations taken to reach this state
  hCost: number // Heuristic cost (estimated cost to target)
  gCost: number // Actual cost from initialGraph to this.graph
  fCost: number // gCost + hCost
}

/**
 * The graph network transformer starts from the initial graph and performs
 * operations until it has an identical network to the target graph. The boxes
 * may not have the same center, but the pin colors, the pin directions, the
 * pin network ids and the pin offsets will be the same.
 * Uses A* search algorithm.
 */
export class GraphNetworkTransformer extends BaseSolver {
  initialGraph: BpcGraph
  targetGraph: BpcGraph
  costConfiguration: CostConfiguration
  operationCostFn: OperationCostFn
  context?: LibContext

  // Precomputed properties of the targetGraph for efficiency
  targetGraphAllPins!: BpcPin[]
  targetGraphPinConfigurations!: Set<string> // "offsetX_offsetY_color_networkId"

  // A* search state
  candidates: Candidate[] = [] // Open set
  // To avoid re-exploring states, we can store stringified versions of visited graphs.
  // This is a simple approach; more sophisticated graph isomorphism checks might be needed for complex cases.
  visitedStates: Set<string> = new Set()
  lastProcessedCandidate: Candidate | null = null

  constructor(params: {
    initialGraph: BpcGraph
    targetGraph: BpcGraph
    // Pass the partial config, and the transformer will create the full config and cost function
    costConfiguration: Partial<CostConfiguration>
    context?: LibContext
  }) {
    super()
    this.context = params.context
    // Deep copy initial graph to allow modifications
    // Deep copy initial graph to allow modifications
    let initialGraphCopy = structuredClone(params.initialGraph)
    this.targetGraph = params.targetGraph // Target graph is read-only

    // Resolve the full cost configuration and create the operation cost function
    const fullCostConfig: CostConfiguration = {
      colorChangeCostMap: params.costConfiguration.colorChangeCostMap ?? {},
      baseOperationCost: params.costConfiguration.baseOperationCost ?? 1,
      costPerUnitDistanceMovingPin:
        params.costConfiguration.costPerUnitDistanceMovingPin ?? 0,
      // Ensure all fields from CostConfiguration are here, possibly from a default
    }
    this.costConfiguration = fullCostConfig // Store the resolved full configuration
    this.operationCostFn = configureOperationCostFn(params.costConfiguration)

    // Get initial assignments to align initialGraph IDs with targetGraph IDs
    this.context?.logger?.debug(`GraphNetworkTransformer: getting initial assignments`)
    const initialAssignments = getHeuristicNetworkSimilarityDistance(
      initialGraphCopy,
      this.targetGraph,
      this.costConfiguration,
      this.context,
    )

    // Transform initialGraph to use targetGraph's IDs where a mapping exists
    this.initialGraph = transformGraphWithAssignments({
      graph: initialGraphCopy,
      boxAssignment: initialAssignments.boxAssignment,
      networkAssignment: initialAssignments.networkAssignment,
    })

    this.initialize()
  }

  initialize() {
    // Precompute target graph properties
    this.targetGraphAllPins = [...this.targetGraph.pins]
    this.targetGraphPinConfigurations = new Set(
      this.targetGraph.pins.map(
        (p) => `${p.offset.x}_${p.offset.y}_${p.color}_${p.networkId}`,
      ),
    )

    // Initialize candidates with the starting graph
    this.context?.logger?.debug(`GraphNetworkTransformer: computing initial heuristic cost`)
    const initialHCost = getHeuristicNetworkSimilarityDistance(
      this.initialGraph,
      this.targetGraph,
      this.costConfiguration,
      this.context,
    ).distance
    const initialCandidate: Candidate = {
      graph: this.initialGraph,
      operationChain: [],
      hCost: initialHCost,
      gCost: 0,
      fCost: initialHCost,
    }
    this.candidates.push(initialCandidate)
    this.visitedStates.add(JSON.stringify(this.initialGraph)) // Mark initial state as visited
  }

  getNeighbors(candidate: Candidate): Candidate[] {
    const possibleOps = getPossibleOperationsForGraph(this, candidate.graph)
    const neighbors: Candidate[] = []

    for (const op of possibleOps) {
      // Create a deep copy of the graph for the new state
      let nextGraphState: BpcGraph = JSON.parse(JSON.stringify(candidate.graph))

      // Ensure the graph is suitable for applyOperation (expects FloatingBpcGraph)
      // This makes all boxes 'floating' for transformation purposes.
      nextGraphState.boxes = nextGraphState.boxes.map((b) => ({
        ...b,
        kind: "floating",
        // Ensure center is defined if it wasn't (e.g. for new boxes from AddBoxOp if it didn't set one)
        center: b.center ?? { x: 0, y: 0 },
      })) as FloatingBpcGraph["boxes"] // Assert box types

      try {
        applyOperation(nextGraphState as FloatingBpcGraph, op)

        const graphKey = JSON.stringify(nextGraphState)
        if (this.visitedStates.has(graphKey)) {
          continue // Skip already visited state
        }

        const costOfThisOp = getOperationCost({
          op,
          costConfiguration: this.costConfiguration,
          g: candidate.graph,
        })
        const newGCost = candidate.gCost + costOfThisOp
        const newHCost = getHeuristicNetworkSimilarityDistance(
          nextGraphState,
          this.targetGraph,
          this.costConfiguration,
          this.context,
        ).distance

        neighbors.push({
          graph: nextGraphState,
          operationChain: [...candidate.operationChain, op],
          gCost: newGCost,
          hCost: newHCost,
          fCost: newGCost + newHCost,
        })
      } catch (e) {
        console.warn(
          `Error applying operation ${op.operation_type}: ${(e as Error).message}. Skipping this path.`,
        )
        // Operation might be invalid for the current state (e.g., changing a non-existent pin).
      }
    }
    return neighbors
  }

  override _step() {
    this.context?.logger?.debug(`GraphNetworkTransformer._step: iteration ${this.iterations}, candidates: ${this.candidates.length}`)
    
    if (this.candidates.length === 0) {
      if (!this.solved) {
        this.failed = true
        this.error = "No candidates left to explore and solution not found."
        this.context?.logger?.error(`GraphNetworkTransformer._step: failed - no candidates left`)
      }
      return
    }

    // Sort candidates by fCost (ascending) to pick the most promising one
    this.candidates.sort((a, b) => a.fCost - b.fCost)
    const currentCandidate = this.candidates.shift()! // Pop the candidate with the lowest fCost
    this.lastProcessedCandidate = currentCandidate

    // Check for goal state
    // hCost being 0 means the current graph is heuristically identical to the target network structure
    if (currentCandidate.hCost === 0) {
      // A hCost of 0 from getHeuristicNetworkSimilarityDistance means a perfect match.
      this.context?.logger?.info(`GraphNetworkTransformer._step: SOLVED! hCost=0, operations: ${currentCandidate.operationChain.length}, gCost: ${currentCandidate.gCost}`)
      this.solved = true
      this.stats.finalOperationChain = currentCandidate.operationChain
      this.stats.finalGraph = currentCandidate.graph
      this.stats.gCost = currentCandidate.gCost
      this.stats.iterations = this.iterations
      return
    }

    const neighbors = this.getNeighbors(currentCandidate)
    this.context?.logger?.debug(`GraphNetworkTransformer._step: current candidate hCost=${currentCandidate.hCost}, gCost=${currentCandidate.gCost}, generated ${neighbors.length} neighbors`)

    for (const neighbor of neighbors) {
      const neighborGraphKey = JSON.stringify(neighbor.graph)
      if (!this.visitedStates.has(neighborGraphKey)) {
        this.candidates.push(neighbor)
        this.visitedStates.add(neighborGraphKey)
      }
      // If allowing reopening states (e.g. found a shorter path), logic would be more complex here.
      // For now, simple visited set is fine.
    }

    // Iteration limit check is handled by BaseSolver
  }
}
