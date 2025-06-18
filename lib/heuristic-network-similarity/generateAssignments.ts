// K: type of items in the first list (e.g., string for boxId or networkId)
// V: type of items in the second list
export interface Assignment<K, V> {
  map: Map<K, V | null> // Maps items from list1 to items from list2 or null
  unmappedRhs: Set<V> // Items from list2 not mapped by any item from list1
}

/**
 * Generates all possible assignments from items in list1 to items in list2.
 * An item in list1 can either map to an item in list2 or be unmapped (map to null).
 * An item in list2 can be mapped by at most one item from list1.
 */
export function* generateAssignments<K, V>(
  list1: K[],
  list2: V[],
): Generator<Assignment<K, V>> {
  const n1 = list1.length
  const n2 = list2.length

  // Inner recursive backtracking function
  function* backtrack(
    currentIndexInList1: number,
    currentMap: Map<K, V | null>,
    usedList2Indices: Set<number>, // Indices of list2 items already mapped
  ): Generator<Assignment<K, V>> {
    if (currentIndexInList1 === n1) {
      // All items in list1 have been considered. Construct the set of unmapped list2 items.
      const unmappedRhsItems = new Set<V>()
      for (let i = 0; i < n2; i++) {
        if (!usedList2Indices.has(i)) {
          unmappedRhsItems.add(list2[i]!)
        }
      }
      yield { map: new Map(currentMap), unmappedRhs: unmappedRhsItems }
      return
    }

    const itemFromList1 = list1[currentIndexInList1]!

    // Option 1: itemFromList1 is unmapped (maps to null)
    currentMap.set(itemFromList1, null)
    yield* backtrack(currentIndexInList1 + 1, currentMap, usedList2Indices)
    currentMap.delete(itemFromList1) // Backtrack: undo change for next iteration

    // Option 2: itemFromList1 maps to an available item in list2
    for (let i = 0; i < n2; i++) {
      if (!usedList2Indices.has(i)) {
        // If list2[i] is not already used
        const itemFromList2 = list2[i]!
        currentMap.set(itemFromList1, itemFromList2)
        usedList2Indices.add(i) // Mark list2[i] as used

        yield* backtrack(currentIndexInList1 + 1, currentMap, usedList2Indices)

        usedList2Indices.delete(i) // Backtrack: unmark list2[i]
        currentMap.delete(itemFromList1) // Backtrack: undo change
      }
    }
  }

  yield* backtrack(0, new Map<K, V | null>(), new Set<number>())
}
