import type { BpcGraph } from "lib/types"
import { getPinDirectionOrThrow } from "lib/graph-utils/getPinDirection"
import { getBoxSideSubgraph, type Side } from "./getBoxSideSubgraph"
import { mergeBoxSideSubgraphs } from "./mergeBoxSideSubgraphs"

export const findIsolatedBoxSides = (g: BpcGraph, boxId: string): Side[][] => {
  // Filter out center pins and netlabel centers
  const pins = g.pins.filter((p) => 
    p.boxId === boxId && 
    !p.pinId.includes("_center") && 
    p.color !== "component_center" &&
    p.color !== "netlabel_center"
  )
  const sides = new Set<Side>()
  for (const p of pins) {
    const dir = getPinDirectionOrThrow(g, p.boxId, p.pinId)
    const side: Side =
      dir === "x-"
        ? "left"
        : dir === "x+"
          ? "right"
          : dir === "y+"
            ? "top"
            : "bottom"
    sides.add(side)
  }

  const sideList = Array.from(sides)
  if (sideList.length === 0) return []

  const subgraphs = sideList.map((side) =>
    getBoxSideSubgraph({ bpcGraph: g, boxId, side }),
  )
  const merged = mergeBoxSideSubgraphs(subgraphs)

  // Build adjacency between pins based on networks
  const adjacency = new Map<string, Set<string>>() // pinId -> connected pinIds
  for (const p of merged.pins) adjacency.set(p.pinId, new Set())
  const pinsByNet: Record<string, string[]> = {}
  for (const p of merged.pins) {
    pinsByNet[p.networkId] ??= []
    pinsByNet[p.networkId]!.push(p.pinId)
  }
  for (const list of Object.values(pinsByNet)) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        adjacency.get(list[i]!)!.add(list[j]!)
        adjacency.get(list[j]!)!.add(list[i]!)
      }
    }
  }

  // Compute connected components of pins
  const compByPin = new Map<string, number>()
  let compIdx = 0
  for (const pinId of adjacency.keys()) {
    if (compByPin.has(pinId)) continue
    const stack = [pinId]
    while (stack.length) {
      const pid = stack.pop()!
      if (compByPin.has(pid)) continue
      compByPin.set(pid, compIdx)
      for (const nb of adjacency.get(pid) ?? []) stack.push(nb)
    }
    compIdx++
  }

  // Map components to sides
  const compsBySide = new Map<Side, Set<number>>()
  for (const side of sideList) compsBySide.set(side, new Set())
  for (const p of merged.pins) {
    const comp = compByPin.get(p.pinId)!
    const sMatch = sideList.find((s) => `${boxId}-${s}` === p.boxId)
    if (sMatch) compsBySide.get(sMatch)!.add(comp)
  }

  // Build side adjacency based on shared components
  const sideAdj = new Map<Side, Set<Side>>()
  for (const s of sideList) sideAdj.set(s, new Set())
  for (const [sideA, compsA] of compsBySide) {
    for (const [sideB, compsB] of compsBySide) {
      if (sideA === sideB) continue
      for (const c of compsA) {
        if (compsB.has(c)) {
          sideAdj.get(sideA)!.add(sideB)
          sideAdj.get(sideB)!.add(sideA)
          break
        }
      }
    }
  }

  // Connected components on sides
  const visitedSides = new Set<Side>()
  const result: Side[][] = []
  for (const side of sideList) {
    if (visitedSides.has(side)) continue
    const stack = [side]
    visitedSides.add(side)
    const group: Side[] = []
    while (stack.length) {
      const s = stack.pop()!
      group.push(s)
      for (const nb of sideAdj.get(s) ?? []) {
        if (!visitedSides.has(nb)) {
          visitedSides.add(nb)
          stack.push(nb)
        }
      }
    }
    if (group.length) result.push(group)
  }

  return result
}
