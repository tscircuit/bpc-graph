import type {BpcGraph} from "../types";

export const getGraphNetworkIds = (g: BpcGraph): string[] => {
  const networkIds = new Set<string>()

  for (const pin of g.pins) {
    networkIds.add(pin.networkId)
  }

  return Array.from(networkIds)
}