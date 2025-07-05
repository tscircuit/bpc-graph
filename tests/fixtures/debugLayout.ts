import type { GraphicsObject } from "graphics-debug"
import type { BpcGraph, FixedBpcGraph } from "lib/types"
import corpus from "@tscircuit/schematic-corpus"
import { SchematicPartitionProcessor } from "lib/partition-processing/SchematicPartitionProcessor"
import { getGraphicsForBpcGraph } from "lib/debug/getGraphicsForBpcGraph"
import { mergeBoxSideSubgraphs } from "lib/box-sides/mergeBoxSideSubgraphs"
import { netAdaptBpcGraph } from "lib/bpc-graph-editing/netAdaptBpcGraph"
import { matchGraph } from "lib/match-graph/matchGraph"
import { reflectGraph } from "lib/graph-utils/reflectGraph"
import { getCanonicalRightFacingGraph } from "lib/partition-processing/getCanonicalRightFacingGraph"
import { getSvgFromGraphicsObject } from "graphics-debug"
import { netAdaptBpcGraph2 } from "lib/bpc-graph-editing/netAdaptBpcGraph2"

export const debugLayout = (g: BpcGraph) => {
  // 1. Partition the graph
  const processor = new SchematicPartitionProcessor(g, {
    singletonKeys: ["vcc/2", "gnd/2"],
    centerPinColors: ["netlabel_center", "component_center"],
  })

  const partitionIterationGraphics: GraphicsObject[] = []
  while (!processor.solved && processor.iteration < 1000) {
    processor.step()
    partitionIterationGraphics.push(processor.getGraphicsForLastGraph())
  }

  // 2. Collect partitions
  const partitions = processor.getPartitions()

  // 3. Canonicalise each partition
  const canonicalPartitions = partitions.map(getCanonicalRightFacingGraph)

  // 4. Net-adapt each canonical partition to its best corpus match
  const adaptedGraphs = canonicalPartitions.map((part) => {
    const {
      graph: fixedCorpusGraph,
      graphName,
      distance,
    } = matchGraph(part.g, corpus as any)
    const adaptedBpcGraph = netAdaptBpcGraph2(part.g, fixedCorpusGraph)
    return {
      matchedCorpusGraph: fixedCorpusGraph,
      matchedCorpusGraphGraphics: getGraphicsForBpcGraph(fixedCorpusGraph, {
        title: `Matched ${graphName} (d=${distance.toFixed(2)})`,
      }),
      adaptedBpcGraph,
      graphName,
      reflected: part.reflected,
      centerBoxId: part.centerBoxId,
    }
  })

  // 5. Undo the temporary reflections
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

  // 6. Merge the adapted sub-graphs back together
  const remergedGraph = mergeBoxSideSubgraphs(adaptedUnreflectedGraphs)

  // 7. Prepare graphics and SVG
  return {
    partitions,
    partitionGraphics: partitions.map((p, idx) =>
      getGraphicsForBpcGraph(p, {
        title: `Partition ${idx}`,
      }),
    ),
    matchedCorpusGraphs: adaptedGraphs.map((g) => g.matchedCorpusGraph),
    matchedCorpusGraphGraphics: adaptedGraphs.map(
      (g) => g.matchedCorpusGraphGraphics,
    ),
    adaptedGraphGraphics: adaptedGraphs.map((g) =>
      getGraphicsForBpcGraph(g.adaptedBpcGraph, {
        title: `Net Adapted ${g.graphName}`,
      }),
    ),
    partitionIterationGraphics,
    laidOutGraph: remergedGraph,
    laidOutGraphGraphics: getGraphicsForBpcGraph(remergedGraph, {
      title: "Merged, Laid Out Graph",
    }),
    laidOutGraphSvg: getSvgFromGraphicsObject(
      getGraphicsForBpcGraph(remergedGraph, {
        title: "Merged, Laid Out Graph",
      }),
      {
        backgroundColor: "white",
      },
    ),
  }
}
