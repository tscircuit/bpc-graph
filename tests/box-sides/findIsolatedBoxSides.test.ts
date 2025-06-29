import { expect, test } from "bun:test"
import { findIsolatedBoxSides } from "lib/box-sides/findIsolatedBoxSides"
import type { BpcGraph } from "lib/types"

test("findIsolatedBoxSides isolates disconnected sides", () => {
  const g: BpcGraph = {
    boxes: [
      { kind: "fixed", boxId: "A", center: { x: 0, y: 0 } },
      { kind: "fixed", boxId: "B", center: { x: 10, y: 0 } },
    ],
    pins: [
      {
        boxId: "A",
        pinId: "AL",
        networkId: "N1",
        color: "red",
        offset: { x: -1, y: 0 },
      },
      {
        boxId: "B",
        pinId: "BR",
        networkId: "N1",
        color: "red",
        offset: { x: 1, y: 0 },
      },
      {
        boxId: "A",
        pinId: "AR",
        networkId: "N2",
        color: "blue",
        offset: { x: 1, y: 0 },
      },
      {
        boxId: "B",
        pinId: "BL",
        networkId: "N2",
        color: "blue",
        offset: { x: -1, y: 0 },
      },
    ],
  }

  const result = findIsolatedBoxSides(g, "A")
  expect(result).toEqual([["left"], ["right"]])
})

test("findIsolatedBoxSides groups connected sides", () => {
  const g: BpcGraph = {
    boxes: [
      { kind: "fixed", boxId: "A", center: { x: 0, y: 0 } },
      { kind: "fixed", boxId: "B", center: { x: 5, y: 0 } },
    ],
    pins: [
      {
        boxId: "A",
        pinId: "AL",
        networkId: "N1",
        color: "red",
        offset: { x: -1, y: 0 },
      },
      {
        boxId: "B",
        pinId: "BR1",
        networkId: "N1",
        color: "red",
        offset: { x: 1, y: 0 },
      },
      {
        boxId: "B",
        pinId: "BL1",
        networkId: "N1",
        color: "red",
        offset: { x: -1, y: 0 },
      },
      {
        boxId: "A",
        pinId: "AT",
        networkId: "N1",
        color: "red",
        offset: { x: 0, y: 1 },
      },
      {
        boxId: "A",
        pinId: "AR",
        networkId: "N2",
        color: "blue",
        offset: { x: 1, y: 0 },
      },
    ],
  }

  const result = findIsolatedBoxSides(g, "A")
  expect(result).toEqual([["left", "top"], ["right"]])
})
