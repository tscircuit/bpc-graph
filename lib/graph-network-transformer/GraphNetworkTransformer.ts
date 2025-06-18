import { BaseSolver } from "lib/generic-solvers/BaseSolver"
import type { CostConfiguration } from "lib/operations/configureOperationCostFn"
import type { Operation } from "lib/operations/operation-types"
import type { BpcGraph } from "lib/types"

interface Candidate {
  graph: BpcGraph
  operationChain: Operation[]
  hCost: number
  gCost: number
  fCost: number
}

/**
 * The graph network transformer starts from the initial graph and performs
 * operations until it has an identical network to the target graph. The boxes
 * may not have the same center, but the pin colors, the pin directions, the
 * pin network ids and the pin offsets will be the same.
 */
export class GraphNetworkTransformer extends BaseSolver {
  initialGraph: BpcGraph
  targetGraph: BpcGraph
  costConfiguration: CostConfiguration

  initialCandidatesGenerated: boolean = false
  candidates: Candidate[] = []

  constructor(params: {
    initialGraph: BpcGraph
    targetGraph: BpcGraph
    costConfiguration: CostConfiguration
  }) {
    super()
    this.initialGraph = params.initialGraph
    this.targetGraph = params.targetGraph
    this.costConfiguration = params.costConfiguration
    this.initialize()
  }

  initialize() {
    // TODO
  }

  getNeighbors(candidate: Candidate): Candidate[] {
    // TODO: getPossibleOperationsForGraph
    // TODO
  }

  generateInitialCandidates() {
    return this.getNeighbors({
      graph: this.initialGraph,
      operationChain: [],
      hCost: 0,
      gCost: 0,
      fCost: 0,
    })
  }

  override _step() {
    if (!this.initialCandidatesGenerated) {
      this.initialCandidatesGenerated = true
      this.candidates = this.generateInitialCandidates()
    }
    // TODO
  }
}
