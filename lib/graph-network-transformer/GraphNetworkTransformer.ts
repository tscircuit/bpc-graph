import { BaseSolver } from "lib/generic-solvers/BaseSolver"
import type { CostConfiguration } from "lib/operations/configureOperationCostFn"
import type { BpcGraph } from "lib/types"

interface Candidate {
  graph: BpcGraph
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
  }

  override _step() {
    // TODO
  }
}
