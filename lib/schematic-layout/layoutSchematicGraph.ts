import {
  SchematicPartitionProcessor,
  type PartitionSingletonKey,
} from "lib/partition-processing/SchematicPartitionProcessor"
import type { BpcGraph, FixedBpcGraph } from "lib/types"
import { mergeBoxSideSubgraphs } from "lib/box-sides/mergeBoxSideSubgraphs"
import { matchGraph } from "lib/match-graph/matchGraph"
import { netAdaptBpcGraph } from "lib/bpc-graph-editing/netAdaptBpcGraph"
import { reflectGraph } from "lib/graph-utils/reflectGraph"
import { getCanonicalRightFacingGraph } from "lib/partition-processing/getCanonicalRightFacingGraph"
import corpus from "@tscircuit/schematic-corpus/dist/bundled-bpc-graphs.json"

export const layoutSchematicGraph = (
  g: BpcGraph,
  {
    singletonKeys,
    duplicatePinIfColor,
  }: {
    singletonKeys?: PartitionSingletonKey[]
    duplicatePinIfColor?: string[]
  },
): FixedBpcGraph => {
  const processor = new SchematicPartitionProcessor(g, {
    singletonKeys,
    duplicatePinIfColor,
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
    const { graph: corpusSource /*, graphName, distance */ } = matchGraph(
      part.g,
      corpus as any,
    )
    const { adaptedBpcGraph } = netAdaptBpcGraph(corpusSource, part.g)
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
