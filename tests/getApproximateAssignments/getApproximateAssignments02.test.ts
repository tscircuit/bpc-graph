import { test, expect } from "bun:test"
import { getApproximateAssignments } from "lib/adjacency-matrix-network-similarity/getApproximateAssignments"
import type { BpcGraph } from "lib/types"

test("getApproximateAssignments should use greedy matching for non-exact matches", () => {
  const g1: BpcGraph = {
    boxes: [
      { kind: "floating", boxId: "D" },
      { kind: "floating", boxId: "E" },
    ],
    pins: [
      {
        boxId: "D",
        pinId: "p1",
        networkId: "n1",
        color: "red",
        offset: { x: 0, y: 0 },
      },
      {
        boxId: "E",
        pinId: "p1",
        networkId: "n2",
        color: "blue",
        offset: { x: 0, y: 0 },
      },
    ],
  }

  const g2: BpcGraph = {
    boxes: [
      { kind: "floating", boxId: "P" },
      { kind: "floating", boxId: "Q" },
    ],
    pins: [
      {
        boxId: "P",
        pinId: "p1",
        networkId: "nx",
        color: "red",
        offset: { x: 0, y: 0 },
      },
      {
        boxId: "P",
        pinId: "p2",
        networkId: "ny",
        color: "green",
        offset: { x: 0, y: 0 },
      },
      {
        boxId: "Q",
        pinId: "p1",
        networkId: "nx",
        color: "blue",
        offset: { x: 0, y: 0 },
      },
      {
        boxId: "Q",
        pinId: "p2",
        networkId: "ny",
        color: "yellow",
        offset: { x: 0, y: 0 },
      },
    ],
  }

  const { boxAssignment } = getApproximateAssignments(g1, g2)

  // D has {red:1}, E has {blue:1}
  // P has {red:1, green:1}, Q has {blue:1, yellow:1}
  // Jaccard(D,P) = 1/2, Jaccard(D,Q) = 0. D -> P
  // Jaccard(E,P) = 0, Jaccard(E,Q) = 1/2. E -> Q
  expect(boxAssignment).toEqual({
    D: "P",
    E: "Q",
  })
})
