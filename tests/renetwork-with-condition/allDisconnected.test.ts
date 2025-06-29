import { test, expect } from "bun:test"
import { renetworkWithCondition } from "lib/renetwork/renetworkWithCondition"
import type { BpcGraph } from "lib/types"

test("renetworkWithCondition: all pins disconnected", () => {
  // Three fixed boxes: left, center, right
  const g: BpcGraph = {
    boxes: [
      { kind: "fixed", boxId: "box1", center: { x: -5, y: 0 } },
      { kind: "fixed", boxId: "box2", center: { x: 0, y: 0 } },
      { kind: "fixed", boxId: "box3", center: { x: 5, y: 0 } },
    ],
    pins: [
      {
        boxId: "box1",
        pinId: "p1",
        networkId: "net1",
        color: "red",
        offset: { x: -0.5, y: 0 },
      },
      {
        boxId: "box2",
        pinId: "p2",
        networkId: "net1",
        color: "red",
        offset: { x: -0.5, y: 0 },
      },
      {
        boxId: "box3",
        pinId: "p3",
        networkId: "net1",
        color: "red",
        offset: { x: 0.5, y: 0 },
      },
    ],
  }

  // Never connect any pins
  const conditionStillConnected = () => false

  const out = renetworkWithCondition(g, conditionStillConnected)

  // Each pin should have its own unique networkId
  const netIds = out.pins.map((p) => p.networkId)
  expect(new Set(netIds).size).toBe(g.pins.length)
})
