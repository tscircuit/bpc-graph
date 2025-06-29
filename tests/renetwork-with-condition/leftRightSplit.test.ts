import { test, expect } from "bun:test"
import { renetworkWithCondition } from "lib/renetwork/renetworkWithCondition"
import type { BpcGraph } from "lib/types"

test("renetworkWithCondition splits left/right as expected", () => {
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

  // Only connect pins if both are on the same side of x = 0
  const conditionStillConnected = (
    from: { box: any; pin: any },
    to: { box: any; pin: any },
    _networkId: string,
  ) => {
    const x1 = from.box.center.x + from.pin.offset.x
    const x2 = to.box.center.x + to.pin.offset.x
    return (x1 < 0 && x2 < 0) || (x1 >= 0 && x2 >= 0)
  }

  const out = renetworkWithCondition(g, conditionStillConnected)

  // Collect networkIds
  const netIds = new Set(out.pins.map((p) => p.networkId))
  expect(netIds.size).toBe(2)

  // The two left-side pins should share a networkId
  const leftPins = out.pins.filter(
    (p) => g.boxes.find((b) => b.boxId === p.boxId)!.center.x + p.offset.x < 0,
  )
  expect(new Set(leftPins.map((p) => p.networkId)).size).toBe(1)

  // The right-side pin should have its own networkId
  const rightPins = out.pins.filter(
    (p) => g.boxes.find((b) => b.boxId === p.boxId)!.center.x + p.offset.x >= 0,
  )
  expect(new Set(rightPins.map((p) => p.networkId)).size).toBe(1)

  // The left and right networkIds should be different
  expect(leftPins[0].networkId).not.toBe(rightPins[0].networkId)
})
