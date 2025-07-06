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
  },
): FixedBpcGraph => {
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
    const { graph: corpusSource } = matchGraph(part.g, corpus as any)
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

  /*  The merged result is fully fixed―cast to satisfy the signature.  */
  return remergedGraph as FixedBpcGraph
}
