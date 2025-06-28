import { test, expect } from "bun:test"
import { getApproximateAssignments } from "lib/adjacency-matrix-network-similarity/getApproximateAssignments"
import type { BpcGraph } from "lib/types"

test("getApproximateAssignments should handle exact matches", () => {
  const g1: BpcGraph = {
    boxes: [
      { kind: "floating", boxId: "boxA" },
      { kind: "floating", boxId: "boxB" },
    ],
    pins: [
      // Box A has a red and a green pin
      {
        boxId: "boxA",
        pinId: "p1",
        networkId: "net1",
        color: "red",
        offset: { x: 0, y: 0 },
      },
      {
        boxId: "boxA",
        pinId: "p2",
        networkId: "net2",
        color: "green",
        offset: { x: 0, y: 0 },
      },
      // Box B has a blue pin
      {
        boxId: "boxB",
        pinId: "p1",
        networkId: "net1",
        color: "blue",
        offset: { x: 0, y: 0 },
      },
    ],
  }

  const g2: BpcGraph = {
    boxes: [
      { kind: "floating", boxId: "boxX" },
      { kind: "floating", boxId: "boxY" },
      { kind: "floating", boxId: "boxZ_extra" },
    ],
    pins: [
      // Box X has a red and a green pin (exact match for boxA)
      {
        boxId: "boxX",
        pinId: "px1",
        networkId: "netX",
        color: "red",
        offset: { x: 0, y: 0 },
      },
      {
        boxId: "boxX",
        pinId: "px2",
        networkId: "netY",
        color: "green",
        offset: { x: 0, y: 0 },
      },
      // Box Y has a blue pin (exact match for boxB)
      {
        boxId: "boxY",
        pinId: "py1",
        networkId: "netX",
        color: "blue",
        offset: { x: 0, y: 0 },
      },
      // Box Z is extra in g2
      {
        boxId: "boxZ_extra",
        pinId: "pz1",
        networkId: "netZ",
        color: "purple",
        offset: { x: 0, y: 0 },
      },
    ],
  }

  const { boxAssignment, networkAssignment, nodeAssignment } =
    getApproximateAssignments(g1, g2)

  // boxA and boxB should be matched exactly based on their pin color histograms.
  // boxC_unmatched has no good match.
  expect(boxAssignment).toEqual({
    boxA: "boxX",
    boxB: "boxY",
  })

  // net1/netX and net2/netY should be matched exactly.
  // net3 has no good match.
  expect(networkAssignment).toEqual({
    net1: "netX",
    net2: "netY",
  })

  // The node assignment for boxes should match the box assignment.
  // Unmatched boxes from the source graph will have an undefined assignment.
  // Pin assignments are not created because of differing boxIds.
  expect(nodeAssignment).toEqual({
    boxA: "boxX",
    boxB: "boxY",
    "boxA-p1": "boxX-px1",
    "boxA-p2": "boxX-px2",
    "boxB-p1": "boxY-py1",
  })
})
