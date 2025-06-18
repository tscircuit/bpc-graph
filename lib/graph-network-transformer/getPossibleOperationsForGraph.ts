import type { Operation } from "lib/operations/operation-types"
import type { BpcGraph } from "lib/types"
import type { GraphNetworkTransformer } from "./GraphNetworkTransformer"
import { getPossibleAddBoxOperations } from "./getPossibleOperations/getPossibleAddBoxOperations"
import { getPossibleRemoveBoxOperations } from "./getPossibleOperations/getPossibleRemoveBoxOperations"
import { getPossibleAddPinToBoxOperations } from "./getPossibleOperations/getPossibleAddPinToBoxOperations"
import { getPossibleChangePinColorOperations } from "./getPossibleOperations/getPossibleChangePinColorOperations"
import { getPossibleChangePinNetworkOperations } from "./getPossibleOperations/getPossibleChangePinNetworkOperations"
import { getPossibleMovePinOperations } from "./getPossibleOperations/getPossibleMovePinOperations"
import { getPossibleRemovePinFromBoxOperations } from "./getPossibleOperations/getPossibleRemovePinFromBoxOperations"

export const getPossibleOperationsForGraph = (
  nt: GraphNetworkTransformer,
  g: BpcGraph,
): Operation[] => {
  const allOperations: Operation[] = []

  allOperations.push(...getPossibleAddBoxOperations(nt, g))
  allOperations.push(...getPossibleRemoveBoxOperations(nt, g))
  allOperations.push(...getPossibleAddPinToBoxOperations(nt, g))
  allOperations.push(...getPossibleChangePinColorOperations(nt, g))
  allOperations.push(...getPossibleChangePinNetworkOperations(nt, g))
  allOperations.push(...getPossibleMovePinOperations(nt, g))
  allOperations.push(...getPossibleRemovePinFromBoxOperations(nt, g))

  // Deduplicate operations as some strategies might generate identical ops
  const uniqueOps = new Map<string, Operation>()
  for (const op of allOperations) {
    // Ensure consistent key generation, e.g. by sorting keys in objects if order matters for stringify
    // For current Operation types, direct stringify should be mostly fine.
    uniqueOps.set(JSON.stringify(op), op)
  }

  return Array.from(uniqueOps.values())
}
