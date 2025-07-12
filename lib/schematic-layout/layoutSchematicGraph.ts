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

export const layoutSchematicGraph = (
  g: BpcGraph,
  {
    corpus,
    singletonKeys,
    centerPinColors,
    floatingBoxIdsWithMutablePinOffsets,
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
    const { graph: corpusSource, distance } = matchGraph(part.g, corpus as any)
    const adaptedBpcGraph = netAdaptBpcGraph2(
      structuredClone(part.g),
      corpusSource,
      {
        floatingBoxIdsWithMutablePinOffsets,
        pushBoxesAsBoxesChangeSize: true,
      },
    )
    return {
      adaptedBpcGraph,
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

  /* ───────── merge the adapted sub-graphs back together ───────── */
  const remergedGraph = mergeBoxSideSubgraphs(adaptedUnreflectedGraphs)

  /* ───────── calculate total distance ───────── */
  const totalDistance = adaptedGraphs.reduce(
    (sum, ag) => sum + (ag.distance || 0),
    0,
  )

  /*  The merged result is fully fixed―cast to satisfy the signature.  */
  return {
    fixedGraph: remergedGraph as FixedBpcGraph,
    distance: totalDistance,
  }
}
