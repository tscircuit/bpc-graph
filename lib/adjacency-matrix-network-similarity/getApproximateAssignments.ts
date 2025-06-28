/* ------------------------------------------------------------------ */
/*  Helper types                                                      */

import type { BpcGraph } from "lib/types"

/* ------------------------------------------------------------------ */
type Histogram = Record<string, number>

/**
 * Example:
 * {
 *   "sourceBox1": "targetBoxA",
 *   "sourceBox2": "targetBoxB",
 *   "sourceBox3": "targetBoxC",
 * }
 */
export type Assignment<K extends string, V extends string> = Record<K, V>

/* ------------------------------------------------------------------ */
/*  Histogram utilities                                               */
/* ------------------------------------------------------------------ */
const addColor = (h: Histogram, color: string) => {
  h[color] = (h[color] ?? 0) + 1
}

const histToKey = (h: Histogram) =>
  Object.entries(h)
    .sort(([c1], [c2]) => (c1 < c2 ? -1 : 1))
    .map(([c, n]) => `${c}:${n}`)
    .join("|")

const jaccardLike = (a: Histogram, b: Histogram) => {
  const colours = new Set([...Object.keys(a), ...Object.keys(b)])
  let intersect = 0
  let union = 0
  for (const c of colours) {
    const v1 = a[c] ?? 0
    const v2 = b[c] ?? 0
    intersect += Math.min(v1, v2)
    union += Math.max(v1, v2)
  }
  return union === 0 ? 0 : intersect / union
}

/* ------------------------------------------------------------------ */
/*  Finger-prints for one graph                                       */
/* ------------------------------------------------------------------ */
interface GraphSummaries {
  boxHist: Record<string, Histogram>
  netHist: Record<string, Histogram>
  boxKeyBuckets: Record<string, string[]> // histKey -> [boxId...]
  netKeyBuckets: Record<string, string[]> // histKey -> [networkId...]
}

const summarise = (g: BpcGraph): GraphSummaries => {
  const boxHist: Record<string, Histogram> = {}
  const netHist: Record<string, Histogram> = {}
  const boxKeyBuckets: Record<string, string[]> = {}
  const netKeyBuckets: Record<string, string[]> = {}

  for (const pin of g.pins) {
    /* ---- box histogram ---- */
    boxHist[pin.boxId] ??= {}
    addColor(boxHist[pin.boxId]!, pin.color)

    /* ---- network histogram ---- */
    netHist[pin.networkId] ??= {}
    addColor(netHist[pin.networkId]!, pin.color)
  }

  /* Bucket by canonical key (exact matches) */
  for (const [boxId, h] of Object.entries(boxHist)) {
    const k = histToKey(h)
    boxKeyBuckets[k] ??= []
    boxKeyBuckets[k]!.push(boxId)
  }
  for (const [netId, h] of Object.entries(netHist)) {
    const k = histToKey(h)
    netKeyBuckets[k] ??= []
    netKeyBuckets[k]!.push(netId)
  }

  return { boxHist, netHist, boxKeyBuckets, netKeyBuckets }
}

/* ------------------------------------------------------------------ */
/*  Generic assignment helper                                         */
/* ------------------------------------------------------------------ */
const greedyMatch = (
  leftIds: string[],
  rightIds: string[],
  leftHist: Record<string, Histogram>,
  rightHist: Record<string, Histogram>,
): Assignment<string, string> => {
  const assigned: Assignment<string, string> = {}
  const usedRight = new Set<string>()

  for (const l of leftIds) {
    let best: string | undefined
    let bestScore = -1
    for (const r of rightIds) {
      if (usedRight.has(r)) continue
      const s = jaccardLike(leftHist[l]!, rightHist[r]!)
      if (s > bestScore) {
        bestScore = s
        best = r
        if (s === 1) break // cannot do better
      }
    }
    if (best !== undefined) {
      assigned[l] = best
      usedRight.add(best)
    }
  }
  return assigned
}

/* ------------------------------------------------------------------ */
/*  Main exported function                                            */
/* ------------------------------------------------------------------ */
export const getApproximateAssignments = (
  g1: BpcGraph,
  g2: BpcGraph,
): {
  boxAssignment: Assignment<string, string>
  networkAssignment: Assignment<string, string>
  nodeAssignment: Assignment<string, string>
} => {
  const s1 = summarise(g1)
  const s2 = summarise(g2)

  /* --------------------------------------- */
  /* 1) exact one-to-one matches             */
  /* --------------------------------------- */
  const boxAssignment: Assignment<string, string> = {}
  const netAssignment: Assignment<string, string> = {}

  const unmatchedBoxes1: string[] = []
  const unmatchedBoxes2: string[] = []
  const unmatchedNets1: string[] = []
  const unmatchedNets2: string[] = []

  const exactMatchBuckets = (
    b1: Record<string, string[]>,
    b2: Record<string, string[]>,
    push1: string[],
    push2: string[],
    out: Assignment<string, string>,
  ) => {
    const keys = new Set([...Object.keys(b1), ...Object.keys(b2)])
    for (const k of keys) {
      const arr1 = b1[k] ?? []
      const arr2 = b2[k] ?? []
      if (arr1.length === 1 && arr2.length === 1) {
        out[arr1[0]!] = arr2[0]!
      } else {
        push1.push(...arr1)
        push2.push(...arr2)
      }
    }
  }

  exactMatchBuckets(
    s1.boxKeyBuckets,
    s2.boxKeyBuckets,
    unmatchedBoxes1,
    unmatchedBoxes2,
    boxAssignment,
  )
  exactMatchBuckets(
    s1.netKeyBuckets,
    s2.netKeyBuckets,
    unmatchedNets1,
    unmatchedNets2,
    netAssignment,
  )

  /* --------------------------------------- */
  /* 2) greedy best-similarity for the rest  */
  /* --------------------------------------- */
  Object.assign(
    boxAssignment,
    greedyMatch(unmatchedBoxes1, unmatchedBoxes2, s1.boxHist, s2.boxHist),
  )
  Object.assign(
    netAssignment,
    greedyMatch(unmatchedNets1, unmatchedNets2, s1.netHist, s2.netHist),
  )

  // Compute node assignment. Node assignment is for the flatBpcGraph, and
  // maps each source pin to each target pin.
  const nodeAssignment: Assignment<string, string> = {}
  for (const box of g1.boxes) {
    nodeAssignment[box.boxId] = boxAssignment[box.boxId]!
    for (const pin of g1.pins) {
      if (pin.boxId !== box.boxId) continue

      const targetNet = netAssignment[pin.networkId]!
      for (const targetPin of g2.pins) {
        if (targetPin.networkId !== targetNet) continue
        if (targetPin.boxId !== pin.boxId) continue
        if (nodeAssignment[`${pin.boxId}-${pin.pinId}`]) continue

        nodeAssignment[`${pin.boxId}-${pin.pinId}`] =
          `${targetPin.boxId}-${targetPin.pinId}`
      }
    }
  }

  return { boxAssignment, networkAssignment: netAssignment, nodeAssignment }
}
