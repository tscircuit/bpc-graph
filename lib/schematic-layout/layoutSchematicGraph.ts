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
import { getApproximateAssignments2 } from "lib/assignment2/getApproximateAssignments2"

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
    accessoryCorpus: Record<string, FixedBpcGraph>
  },
): { fixedGraph: FixedBpcGraph; accessoryGraph: FixedBpcGraph; distance: number } => {
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
    const { graph: corpusSource, graphName, distance } = matchGraph(part.g, corpus as any)

    const accessoryCorpusGraph = accessoryCorpus[graphName]
    const corpusGraphForAccessories = accessoryCorpusGraph || corpusSource

    // a. Perform net-adaptation of the floating (partition) graph to the matched corpus graph
    const adaptedBpcGraph = netAdaptBpcGraph2(
      structuredClone(part.g),
      corpusSource,
      {
        floatingBoxIdsWithMutablePinOffsets,
        pushBoxesAsBoxesChangeSize: true,
      },
    )

    // b. Determine which boxes from the corpus graph were NOT matched – these become the accessory graph for this partition
    const {
      floatingToFixedBoxAssignment,
      floatingToFixedNetworkAssignment,
    } = getApproximateAssignments2(part.g, corpusGraphForAccessories)

    const matchedFixedBoxIds = new Set<string>(
      Object.values(floatingToFixedBoxAssignment),
    )

    // Build inverse network map: fixed -> floating
    const fixedToFloatingNetworkMap: Record<string, string> = {}
    for (const [floatingNetId, fixedNetId] of Object.entries(
      floatingToFixedNetworkAssignment,
    )) {
      fixedToFloatingNetworkMap[fixedNetId] = floatingNetId
    }

    const accessoryBoxes = corpusGraphForAccessories.boxes.filter(
      (b) => !matchedFixedBoxIds.has(b.boxId) || b.boxId === part.centerBoxId,
    )
    const accessoryPins = corpusGraphForAccessories.pins
      .filter((p) => !matchedFixedBoxIds.has(p.boxId) || p.boxId === part.centerBoxId)
      .map((p) => {
        const newPin = structuredClone(p)
        // map network id if possible
        if (fixedToFloatingNetworkMap[newPin.networkId]) {
          newPin.networkId = fixedToFloatingNetworkMap[newPin.networkId] ?? newPin.networkId
        }
        return newPin
      })

    const accessoryGraphPartition = {
      boxes: accessoryBoxes.map((b) => ({ ...structuredClone(b), kind: "fixed" })),
      pins: accessoryPins,
    } as BpcGraph

    return {
      adaptedBpcGraph,
      accessoryGraphPartition,
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

  /* ───────── undo reflections for accessory graphs ───────── */
  const accessoryUnreflectedGraphs = adaptedGraphs.map(
    ({ accessoryGraphPartition, reflected, centerBoxId }) => {
      if (!reflected) return accessoryGraphPartition
      return reflectGraph({
        graph: accessoryGraphPartition,
        axis: "x",
        centerBoxId: centerBoxId!,
      })
    },
  )

  /* ───────── merge the adapted sub-graphs back together ───────── */
  const remergedGraph = mergeBoxSideSubgraphs(adaptedUnreflectedGraphs)

  /* ───────── merge the accessory sub-graphs back together ───────── */
  const remergedAccessoryGraph = mergeBoxSideSubgraphs(accessoryUnreflectedGraphs)

  /* ───────── calculate total distance ───────── */
  const totalDistance = adaptedGraphs.reduce(
    (sum, ag) => sum + (ag.distance || 0),
    0,
  )

  /*  The merged result is fully fixed―cast to satisfy the signature.  */
  return {
    fixedGraph: remergedGraph as FixedBpcGraph,
    accessoryGraph: remergedAccessoryGraph as FixedBpcGraph,
    distance: totalDistance,
  }
}
