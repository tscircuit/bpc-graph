import { test, expect } from "bun:test"
import { renetworkWithCondition } from "lib/renetwork/renetworkWithCondition"
import type { BpcGraph } from "lib/types"

test("renetworkWithCondition: no split (all connected)", () => {
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

  // Always connect all pins
  const conditionStillConnected = () => true

  const out = renetworkWithCondition(
    g,
    conditionStillConnected,
  ).renetworkedGraph

  // All pins should share the same networkId, and it should be the original
  const netIds = new Set(out.pins.map((p) => p.networkId))
  expect(netIds.size).toBe(1)
  expect([...netIds][0]).toBe("net1")
})
