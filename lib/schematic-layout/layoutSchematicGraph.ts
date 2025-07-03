import {
  SchematicPartitionProcessor,
  type PartitionSingletonKey,
} from "lib/partition-processing/SchematicPartitionProcessor"
import type { BpcGraph, FixedBpcGraph } from "lib/types"

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

  // TODO
}
