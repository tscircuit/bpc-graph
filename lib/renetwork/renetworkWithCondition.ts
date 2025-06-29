import type { BpcBox, BpcGraph, BpcPin } from "lib/types"

/**
 * Re-network a BPC graph by examining each pair of pins within the same network
 *
 * If the condition returns false, then the pins are considered NOT CONNECTED
 * and we will need to create a new network. When we create this new network,
 * we'll need to test the the condition again with the new network (and repeat)
 *
 * The most common use case is breaking a network into a left and right side
 * because we don't want to keep pins on the other side of the box within the
 * network.
 *
 * So let's say we have a 3 boxes, box1, box2, and box3 arranged in a row.
 * box1.center = { x: -5, y: 0 }
 * box2.center = { x: 0, y: 0 }
 * box3.center = { x: 5, y: 0 }
 *
 * Let's say that box2 has two pins, pin1 and pin2
 * box2.pin1.offset = { x: -0.5, y: 0 }
 * box2.pin2.offset = { x: 0.5, y: 0 }
 *
 * [box1.pin1, box2.pin1, box2.pin2, box3.pin1] compose a network
 *
 * all the pins have the same networkId ("network1")
 *
 * But now we want to create a condition that makes it so that box3.pin1 lives
 * in a different network.
 *
 * conditionStillConnected = (from, to,networkId) => {
 *   const side1 = from.box.center.x + from.pin.offset.x < 0 ? "left" : "right"
 *   const side2 = to.box.center.x + to.pin.offset.x < 0 ? "left" : "right"
 *   return side1 === side2
 * }
 *
 * conditionStillConnected(box1.pin1, box2.pin1, "network1") -> true
 * conditionStillConnected(box1.pin1, box2.pin2, "network1") -> false
 * conditionStillConnected(box1.pin1, box3.pin1, "network1") -> false
 *
 * So we can see that the new networks should be:
 * network1 = [box1.pin1, box2.pin1]
 * network2 = [box2.pin2, box3.pin1]
 *
 */
export const renetworkWithCondition = (
  g: BpcGraph,
  conditionStillConnected: (
    from: { box: BpcBox; pin: BpcPin },
    to: { box: BpcBox; pin: BpcPin },
    networkId: string,
  ) => boolean,
) => {}
