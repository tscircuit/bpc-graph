import type { BpcGraph } from "lib/types"

export const mergeBoxSideSubgraphs = (
  graphs: BpcGraph[],
  {
    renetworkedNetworkIdMap,
  }: {
    renetworkedNetworkIdMap?: Record<string, string>
  } = {},
): BpcGraph => {
  renetworkedNetworkIdMap ??= {}

  const merged: BpcGraph = { boxes: [], pins: [] }
  const boxMap = new Map<string, BpcGraph["boxes"][0]>()
  const pinMap = new Map<string, BpcGraph["pins"][0]>()

  const partitionedBoxIds = Object.entries(
    graphs
      .flatMap((g) => Array.from(new Set(g.boxes.map((b) => b.boxId))))
      .reduce(
        (acc, str) => {
          acc[str] = (acc[str] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
  )
    .filter(([_, count]) => count === graphs.length)
    .map(([str]) => str)

  if (partitionedBoxIds.length > 1) {
    throw new Error("Expected at most one box to be partitioned")
  }

  const partitionedBoxId = partitionedBoxIds[0]

  for (const g of graphs) {
    // Find the offset to the origin for the partitioned box
    const offset = g.boxes.find((b) => b.boxId === partitionedBoxId)?.center

    for (const box of g.boxes) {
      if (boxMap.has(box.boxId)) continue

      const modifiedBox = structuredClone(box)

      if (modifiedBox.center && offset) {
        // Offset the position of all boxes such that it aligns with the partitioned box
        //  when it is moved to the origin.
        modifiedBox.center = {
          x: modifiedBox.center.x - offset.x,
          y: modifiedBox.center.y - offset.y,
        }
      }

      boxMap.set(box.boxId, modifiedBox)
    }
    for (const pin of g.pins) {
      if (!pinMap.has(pin.pinId)) pinMap.set(pin.pinId, structuredClone(pin))
    }
  }

  merged.boxes = Array.from(boxMap.values())
  merged.pins = Array.from(pinMap.values())

  return merged
}
