import type { GraphicsObject } from "graphics-debug"
import type { BpcGraph, FixedBpcGraph, FloatingBoxId } from "lib/types"
import mainCorpus from "@tscircuit/schematic-corpus"
import { SchematicPartitionProcessor } from "lib/partition-processing/SchematicPartitionProcessor"
import { getGraphicsForBpcGraph } from "lib/debug/getGraphicsForBpcGraph"
import { mergeBoxSideSubgraphs } from "lib/box-sides/mergeBoxSideSubgraphs"
import { netAdaptBpcGraph } from "lib/bpc-graph-editing/netAdaptBpcGraph"
import { matchGraph } from "lib/match-graph/matchGraph"
import { reflectGraph } from "lib/graph-utils/reflectGraph"
import { getCanonicalRightFacingGraph } from "lib/partition-processing/getCanonicalRightFacingGraph"
import { getSvgFromGraphicsObject } from "graphics-debug"
import { netAdaptBpcGraph2 } from "lib/bpc-graph-editing/netAdaptBpcGraph2"

export const debugLayout = (
  g: BpcGraph,
  opts: {
    corpus?: Record<string, BpcGraph>
  } = {},
) => {
  opts.corpus ??= mainCorpus

  const floatingBoxIdsWithMutablePinOffsets = new Set(
    g.boxes
      .filter((box) => {
        const boxPins = g.pins.filter((p) => p.boxId === box.boxId)
        const nonCenterBoxPins = boxPins.filter(
          (bp) => !bp.color.includes("center"),
        )
        if (nonCenterBoxPins.length <= 2) {
          return true
        }
        return false
      })
      .map((b) => b.boxId),
  )

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
      corpusScores,
      distance,
    } = matchGraph(part.g, opts.corpus as any)
    const adaptedBpcGraph = netAdaptBpcGraph2(part.g, fixedCorpusGraph, {
      floatingBoxIdsWithMutablePinOffsets,
      pushBoxesAsBoxesChangeSize: true,
    })
    return {
      corpusScores,
      matchedCorpusGraph: fixedCorpusGraph,
      matchedCorpusGraphGraphics: getGraphicsForBpcGraph(fixedCorpusGraph, {
        title: `Matched ${graphName}`,
      }),
      adaptedBpcGraph,
      graphName,
      distance,
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
    adaptedGraphs,
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
    matchDetails: adaptedGraphs.map((g) => ({
      designName: g.graphName,
      distance: g.distance,
      designSvgUrl: `https://schematic-corpus.tscircuit.com/${g.graphName}.svg`,
      corpusScores: g.corpusScores,
      matchedCorpusGraph: g.matchedCorpusGraph,
    })),
    corpus: opts.corpus,
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
