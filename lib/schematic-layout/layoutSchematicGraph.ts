import {
  SchematicPartitionProcessor,
  type PartitionSingletonKey,
} from "lib/partition-processing/SchematicPartitionProcessor"
import type { BpcGraph, FixedBpcGraph, FloatingBoxId } from "lib/types"
import { mergeBoxSideSubgraphs } from "lib/box-sides/mergeBoxSideSubgraphs"
import { matchGraph } from "lib/match-graph/matchGraph"
import { netAdaptBpcGraph } from "lib/bpc-graph-editing/netAdaptBpcGraph"
import { reflectGraph } from "lib/graph-utils/reflectGraph"
import { getCanonicalRightFacingGraph } from "lib/partition-processing/getCanonicalRightFacingGraph"
import { netAdaptBpcGraph2 } from "lib/bpc-graph-editing/netAdaptBpcGraph2"
import { netAdaptAccessoryGraph } from "lib/bpc-graph-editing/netAdaptAccessoryGraph"

export const layoutSchematicGraph = (
  g: BpcGraph,
  {
    corpus,
    singletonKeys,
    centerPinColors,
    floatingBoxIdsWithMutablePinOffsets,
    accessoryCorpus,
  }: {
    singletonKeys?: PartitionSingletonKey[]
    centerPinColors?: string[]
    floatingBoxIdsWithMutablePinOffsets?: Set<FloatingBoxId>
    corpus: Record<string, FixedBpcGraph>
    /**
     * A corpus with extra boxes that is associated with the main corpus.
     *
     * If the accessoryCorpus is provided, we'll keep track of "accessory boxes"
     * which are boxes that aren't matched but may be useful outside of the
     * layout process. For example, this is often used for netlabels, which
     * don't effect the layout but it's useful to keep track of their positions
     * in the corpus so that you can use the netlabel positions outside of the
     * layout process.
     */
    accessoryCorpus?: Record<string, FixedBpcGraph>
  },
): {
  fixedGraph: FixedBpcGraph
  accessoryFixedGraph?: FixedBpcGraph
  distance: number
} => {
  const processor = new SchematicPartitionProcessor(g, {
    singletonKeys,
    centerPinColors,
  })

  while (!processor.solved && processor.iteration < 1000) {
    processor.step()
  }

  /* ───────── collect partitions ───────── */
  const partitions = processor.getPartitions()

  /* ───────── canonicalise each partition ───────── */
  const canonicalPartitions = partitions.map(getCanonicalRightFacingGraph)

  /* ───────── net-adapt each canonical partition to its best corpus match ───────── */
  const adaptedGraphs = canonicalPartitions.map((part) => {
    const {
      graph: corpusFixedGraph,
      distance,
      graphName,
    } = matchGraph(part.g, corpus as any)
    const accessoryCorpusFixedGraph = accessoryCorpus?.[graphName]

    const adaptedBpcGraph = netAdaptBpcGraph2(
      structuredClone(part.g),
      corpusFixedGraph,
      {
        floatingBoxIdsWithMutablePinOffsets,
        pushBoxesAsBoxesChangeSize: true,
      },
    )

    let adaptedAccessoryGraph: BpcGraph | undefined
    if (accessoryCorpusFixedGraph) {
      adaptedAccessoryGraph = netAdaptAccessoryGraph({
        floatingGraph: structuredClone(part.g),
        fixedCorpusMatch: corpusFixedGraph,
        fixedAccessoryCorpusMatch: accessoryCorpusFixedGraph,
      })
    }

    return {
      adaptedBpcGraph,
      adaptedAccessoryGraph,
      reflected: part.reflected,
      centerBoxId: part.centerBoxId,
      distance,
    }
  })

  /* ───────── undo the temporary reflections ───────── */
  const adaptedUnreflectedGraphs = adaptedGraphs.map(
    ({ adaptedBpcGraph, reflected, centerBoxId }) => {
      if (!reflected) return adaptedBpcGraph
      return reflectGraph({
        graph: adaptedBpcGraph,
        axis: "x",
        centerBoxId: centerBoxId!,
      })
    },
  )

  let adaptedUnreflectedAccessoryGraphs: FixedBpcGraph[] | undefined
  if (accessoryCorpus) {
    adaptedUnreflectedAccessoryGraphs = adaptedGraphs
      .filter(
        (
          g,
        ): g is {
          adaptedAccessoryGraph: BpcGraph
          adaptedBpcGraph: BpcGraph
          reflected: boolean
          centerBoxId: string | null
          distance: number
        } => g.adaptedAccessoryGraph !== undefined && g.centerBoxId !== null,
      )
      .map(({ adaptedAccessoryGraph, reflected, centerBoxId }) => {
        if (!reflected) return adaptedAccessoryGraph as FixedBpcGraph
        return reflectGraph({
          graph: adaptedAccessoryGraph as BpcGraph,
          axis: "x",
          centerBoxId: centerBoxId!,
        }) as FixedBpcGraph
      })
  }

  /* ───────── merge the adapted sub-graphs back together ───────── */
  const remergedGraph = mergeBoxSideSubgraphs(adaptedUnreflectedGraphs)

  let remergedAccessoryGraph: BpcGraph | undefined
  if (accessoryCorpus) {
    remergedAccessoryGraph = mergeBoxSideSubgraphs(
      adaptedUnreflectedAccessoryGraphs as FixedBpcGraph[],
    )
  }

  /* ───────── calculate total distance ───────── */
  const totalDistance = adaptedGraphs.reduce(
    (sum, ag) => sum + (ag.distance || 0),
    0,
  )

  /*  The merged result is fully fixed―cast to satisfy the signature.  */
  return {
    fixedGraph: remergedGraph as FixedBpcGraph,
    accessoryFixedGraph: remergedAccessoryGraph as FixedBpcGraph,
    distance: totalDistance,
  }
}
