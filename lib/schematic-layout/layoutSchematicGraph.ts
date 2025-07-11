import {
  SchematicPartitionProcessor,
  type PartitionSingletonKey,
} from "lib/partition-processing/SchematicPartitionProcessor"
import type { BpcGraph, FixedBpcGraph, FloatingBoxId } from "lib/types"
import { mergeBoxSideSubgraphs } from "lib/box-sides/mergeBoxSideSubgraphs"
import { matchGraph } from "lib/match-graph/matchGraph"
import { reflectGraph } from "lib/graph-utils/reflectGraph"
import { getCanonicalRightFacingGraph } from "lib/partition-processing/getCanonicalRightFacingGraph"
import { netAdaptBpcGraph2 } from "lib/bpc-graph-editing/netAdaptBpcGraph2"

export const layoutSchematicGraph = (
  g: BpcGraph,
  {
    corpus,
    accessoryCorpus,
    singletonKeys,
    centerPinColors,
    floatingBoxIdsWithMutablePinOffsets,
  }: {
    singletonKeys?: PartitionSingletonKey[]
    centerPinColors?: string[]
    floatingBoxIdsWithMutablePinOffsets?: Set<FloatingBoxId>
    corpus: Record<string, FixedBpcGraph>
    accessoryCorpus?: Record<string, FixedBpcGraph>
  },
): {
  fixedGraph: FixedBpcGraph
  distance: number
  accessoryGraph?: FixedBpcGraph
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
      graph: corpusSource,
      graphName,
      distance,
    } = matchGraph(part.g, corpus as any)
    const accessorySource = accessoryCorpus?.[graphName]
    const adaptedBpcGraph = netAdaptBpcGraph2(
      structuredClone(part.g),
      corpusSource,
      {
        floatingBoxIdsWithMutablePinOffsets,
        pushBoxesAsBoxesChangeSize: true,
      },
    )
    const accessoryGraph = accessorySource
      ? (netAdaptBpcGraph2(structuredClone(accessorySource), corpusSource, {
          pushBoxesAsBoxesChangeSize: true,
        }) as FixedBpcGraph)
      : undefined
    return {
      adaptedBpcGraph,
      accessoryGraph,
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

  const accessoryUnreflectedGraphs = adaptedGraphs
    .map(({ accessoryGraph, reflected, centerBoxId }) => {
      if (!accessoryGraph) return undefined
      if (!reflected) return accessoryGraph
      return reflectGraph({
        graph: accessoryGraph,
        axis: "x",
        centerBoxId: centerBoxId!,
      })
    })
    .filter((g): g is FixedBpcGraph => !!g)

  /* ───────── merge the adapted sub-graphs back together ───────── */
  const remergedGraph = mergeBoxSideSubgraphs(adaptedUnreflectedGraphs)
  const accessoryRemergedGraph =
    accessoryUnreflectedGraphs.length > 0
      ? (mergeBoxSideSubgraphs(accessoryUnreflectedGraphs) as FixedBpcGraph)
      : undefined

  /* ───────── calculate total distance ───────── */
  const totalDistance = adaptedGraphs.reduce(
    (sum, ag) => sum + (ag.distance || 0),
    0,
  )

  /*  The merged result is fully fixed―cast to satisfy the signature.  */
  return {
    fixedGraph: remergedGraph as FixedBpcGraph,
    distance: totalDistance,
    accessoryGraph: accessoryRemergedGraph,
  }
}
