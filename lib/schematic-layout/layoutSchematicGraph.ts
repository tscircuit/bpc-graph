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
    singletonKeys,
    centerPinColors,
    floatingBoxIdsWithMutablePinOffsets,
    accessoryCorpus,
  }: {
    singletonKeys?: PartitionSingletonKey[]
    centerPinColors?: string[]
    floatingBoxIdsWithMutablePinOffsets?: Set<FloatingBoxId>
    corpus: Record<string, FixedBpcGraph>
    accessoryCorpus?: Record<string, FixedBpcGraph>
  },
): { fixedGraph: FixedBpcGraph; distance: number; accessoryGraph: FixedBpcGraph } => {
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
    const { graph: corpusSource, distance, graphName } = matchGraph(part.g, corpus as any)
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
      graphName, // ← remember which corpus entry we matched
      corpusGraph: corpusSource,
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
  const fixedGraph = remergedGraph as FixedBpcGraph

  /* ───────── build accessory graph (boxes that exist only in the full corpus) ───────── */
  let accessoryGraph: FixedBpcGraph = { boxes: [], pins: [] }

  if (accessoryCorpus) {
    const accessoryParts = adaptedGraphs.map((adapted) => {
      const graphName = adapted.graphName

      // If the accessory corpus doesn't have this design, skip.
      if (!graphName || !accessoryCorpus![graphName]) return null

      const fullCorpusGraph = accessoryCorpus![graphName]
      const primaryCorpusGraph = adapted.corpusGraph

      // Collect boxes that are present in the full corpus but NOT in the primary (no-label) corpus.
      const extraBoxes = fullCorpusGraph.boxes.filter(
        (b) => !primaryCorpusGraph.boxes.some((pb) => pb.boxId === b.boxId),
      )

      if (extraBoxes.length === 0) return null

      const extraPins = fullCorpusGraph.pins.filter((p) =>
        extraBoxes.some((b) => b.boxId === p.boxId),
      )

      // Build a sub-graph consisting solely of the extra items.
      let subGraph: BpcGraph = {
        boxes: structuredClone(extraBoxes),
        pins: structuredClone(extraPins),
      }

      // If this partition was reflected earlier, undo that reflection so the accessory
      // boxes line up with the final (un-reflected) layout.
      if (adapted.reflected && adapted.centerBoxId) {
        // Ensure the centre-box exists so reflectGraph succeeds.
        const centreBox = fullCorpusGraph.boxes.find(
          (b) => b.boxId === adapted.centerBoxId,
        )
        if (centreBox) {
          subGraph = reflectGraph({
            graph: {
              boxes: [structuredClone(centreBox), ...subGraph.boxes],
              pins: subGraph.pins,
            },
            axis: "x",
            centerBoxId: adapted.centerBoxId,
          })
          // Remove the temporary centre box from the reflected output
          subGraph.boxes = subGraph.boxes.filter(
            (b) => b.boxId !== adapted.centerBoxId,
          )
        }
      }

      return subGraph as FixedBpcGraph
    }).filter(Boolean) as FixedBpcGraph[]

    if (accessoryParts.length > 0) {
      accessoryGraph = mergeBoxSideSubgraphs(accessoryParts) as FixedBpcGraph
    }
  }

  return {
    fixedGraph,
    distance: totalDistance,
    accessoryGraph,
  }
}
