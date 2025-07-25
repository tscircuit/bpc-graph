import type { PartitionSingletonKey } from "lib/partition-processing/SchematicPartitionProcessor"
import type { BpcGraph, FixedBpcGraph, FloatingBoxId } from "lib/types"
import { layoutSchematicGraph } from "./layoutSchematicGraph"

export const layoutSchematicGraphVariants = (
  variants: Array<{ variantName: string; floatingGraph: BpcGraph }>,
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
    accessoryCorpus?: Record<string, FixedBpcGraph>
  },
): {
  fixedGraph: FixedBpcGraph
  accessoryFixedGraph?: FixedBpcGraph
  selectedVariantName: string
  variantResults: Array<{ variantName: string; distance: number }>
} => {
  const variantResults: Array<{ variantName: string; distance: number }> = []
  let bestVariant: {
    variantName: string
    fixedGraph: FixedBpcGraph
    accessoryFixedGraph?: FixedBpcGraph
    distance: number
  } | null = null

  for (const variant of variants) {
    const { fixedGraph, accessoryFixedGraph, distance } = layoutSchematicGraph(
      variant.floatingGraph,
      {
        corpus,
        singletonKeys,
        centerPinColors,
        floatingBoxIdsWithMutablePinOffsets,
      },
    )

    variantResults.push({
      variantName: variant.variantName,
      distance,
    })

    if (!bestVariant || distance < bestVariant.distance) {
      bestVariant = {
        variantName: variant.variantName,
        fixedGraph,
        accessoryFixedGraph,
        distance,
      }
    }
  }

  return {
    fixedGraph: bestVariant!.fixedGraph,
    accessoryFixedGraph: bestVariant!.accessoryFixedGraph,
    selectedVariantName: bestVariant!.variantName,
    variantResults,
  }
}
