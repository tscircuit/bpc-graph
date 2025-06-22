import { test, expect } from "bun:test"
import type { BpcGraph } from "../../lib/types"
import { convertBpcGraphToCytoscape } from "../../lib/graph-utils/convertBpcGraphToCytoscape"

test("convertBpcGraphToCytoscape01", () => {
  const g: BpcGraph = {
    boxes: [
      { boxId: "B1", kind: "fixed", center: { x: 0, y: 0 } },
      { boxId: "B2", kind: "fixed", center: { x: 2, y: 0 } },
    ],
    pins: [
      {
        boxId: "B1",
        pinId: "B1.P1",
        offset: { x: 0, y: 0 },
        color: "red",
        networkId: "N1",
      },
      {
        boxId: "B2",
        pinId: "B2.P1",
        offset: { x: 0, y: 0 },
        color: "red",
        networkId: "N1",
      },
    ],
  }

  const elements = convertBpcGraphToCytoscape(g)
  expect(elements).toEqual([
    { data: { id: "B1", label: "B1" }, position: { x: 0, y: 0 } },
    { data: { id: "B2", label: "B2" }, position: { x: 2, y: 0 } },
    {
      data: {
        id: "B1.P1-B2.P1",
        source: "B1",
        target: "B2",
        networkId: "N1",
        color: "red",
      },
    },
  ])
})
