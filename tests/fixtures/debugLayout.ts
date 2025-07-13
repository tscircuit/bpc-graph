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
  g: BpcGraph | Array<{ variantName: string; floatingGraph: BpcGraph }>,
  opts: {
    corpus?: Record<string, BpcGraph>
    accessoryCorpus?: Record<string, BpcGraph>
  } = {},
) => {
  opts.corpus ??= mainCorpus

  // Handle floatingGraphInputVariants
  let selectedGraph: BpcGraph
  let selectedVariantName = "Default"
  const variantResults: Array<{ variantName: string; distance: number }> = []

  if (Array.isArray(g)) {
    // Process each variant to find the one with lowest distance
    let bestVariant: {
      variantName: string
      floatingGraph: BpcGraph
      distance: number
    } | null = null

    for (const variant of g) {
      // Quick distance calculation for each variant
      const quickResult = debugLayoutSingle(variant.floatingGraph, opts)
      const totalDistance = quickResult.adaptedGraphs.reduce(
        (sum, ag) => sum + (ag.distance || 0),
        0,
      )

      variantResults.push({
        variantName: variant.variantName,
        distance: totalDistance,
      })

      if (!bestVariant || totalDistance < bestVariant.distance) {
        bestVariant = { ...variant, distance: totalDistance }
      }
    }

    selectedGraph = bestVariant!.floatingGraph
    selectedVariantName = bestVariant!.variantName
  } else {
    selectedGraph = g
  }

  const result = debugLayoutSingle(selectedGraph, opts)

  return {
    ...result,
    selectedVariantName,
    variantResults,
  }
}

const debugLayoutSingle = (
  g: BpcGraph,
  opts: {
    corpus?: Record<string, BpcGraph>
    accessoryCorpus?: Record<string, BpcGraph>
  } = {},
) => {
  opts.corpus ??= mainCorpus
  const accCorpus = opts.accessoryCorpus ?? {}

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

    // NEW: accessory graph adaptation
    let adaptedAccessoryBpcGraph: BpcGraph | null = null
    if (accCorpus[graphName]) {
      adaptedAccessoryBpcGraph = netAdaptBpcGraph2(
        part.g,
        accCorpus[graphName],
        {
          floatingBoxIdsWithMutablePinOffsets,
          pushBoxesAsBoxesChangeSize: true,
        },
      )
    }

    return {
      corpusScores,
      matchedCorpusGraph: fixedCorpusGraph,
      matchedCorpusGraphGraphics: getGraphicsForBpcGraph(fixedCorpusGraph, {
        title: `Matched ${graphName}`,
      }),
      adaptedBpcGraph,
      adaptedAccessoryBpcGraph,
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

  // 5b. Undo reflections for accessory graphs
  const adaptedAccessoryUnreflectedGraphs = adaptedGraphs.map(
    ({ adaptedAccessoryBpcGraph, reflected, centerBoxId }) => {
      if (!adaptedAccessoryBpcGraph) return null
      if (!reflected) return adaptedAccessoryBpcGraph
      return reflectGraph({
        graph: adaptedAccessoryBpcGraph,
        axis: "x",
        centerBoxId: centerBoxId!,
      })
    },
  )

  // 6. Merge the adapted sub-graphs back together
  const remergedGraph = mergeBoxSideSubgraphs(adaptedUnreflectedGraphs)

  // 6b. Merge accessory graphs if any
  const accessoryGraphsToMerge = adaptedAccessoryUnreflectedGraphs.filter(
    (g): g is BpcGraph => !!g,
  )
  const remergedAccessoryGraph = accessoryGraphsToMerge.length
    ? mergeBoxSideSubgraphs(accessoryGraphsToMerge)
    : null

  // 7. Prepare graphics and SVG
  const adaptedAccessoryGraphGraphics = adaptedAccessoryUnreflectedGraphs.map(
    (g, idx) =>
      g
        ? getGraphicsForBpcGraph(g, {
            title: `Accessory Net Adapted ${adaptedGraphs[idx]!.graphName}`,
          })
        : undefined,
  )

  const laidOutAccessoryGraphGraphics = remergedAccessoryGraph
    ? getGraphicsForBpcGraph(remergedAccessoryGraph, {
        title: "Merged Accessory Graph",
      })
    : undefined

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
    accessoryCorpus: accCorpus,
    adaptedAccessoryGraphGraphics,
    laidOutAccessoryGraphGraphics,
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
