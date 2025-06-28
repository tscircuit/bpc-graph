import { test, expect } from "bun:test"
import { netAdaptBpcGraph } from "lib/bpc-graph-editing/netAdaptBpcGraph"
import type { FixedBpcGraph, MixedBpcGraph } from "lib/types"

test("netAdaptBpcGraph should adapt source to target with exact matches", () => {
  const source: FixedBpcGraph = {
    boxes: [
      { kind: "fixed", boxId: "boxA", center: { x: 0, y: 0 } },
      { kind: "fixed", boxId: "boxB", center: { x: 10, y: 0 } },
    ],
    pins: [
      // Box A has a red and a green pin
      {
        boxId: "boxA",
        pinId: "p1",
        networkId: "net1",
        color: "red",
        offset: { x: -0.5, y: 0 },
      },
      {
        boxId: "boxA",
        pinId: "p2",
        networkId: "net2",
        color: "green",
        offset: { x: 0.5, y: 0 },
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

  const target: MixedBpcGraph = {
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
      // Box Z is extra in target
      {
        boxId: "boxZ_extra",
        pinId: "pz1",
        networkId: "netZ",
        color: "purple",
        offset: { x: 0, y: 0 },
      },
    ],
  }

  const { adaptedBpcGraph } = netAdaptBpcGraph(source, target)

  expect(adaptedBpcGraph).toMatchInlineSnapshot(`
    {
      "boxes": [
        {
          "boxId": "boxX",
          "center": {
            "x": 0,
            "y": 0,
          },
          "kind": "fixed",
        },
        {
          "boxId": "boxY",
          "center": {
            "x": 10,
            "y": 0,
          },
          "kind": "fixed",
        },
        {
          "boxId": "boxZ_extra",
          "kind": "floating",
        },
      ],
      "pins": [
        {
          "boxId": "boxX",
          "color": "red",
          "networkId": "netX",
          "offset": {
            "x": 0,
            "y": 0,
          },
          "pinId": "px1",
        },
        {
          "boxId": "boxX",
          "color": "green",
          "networkId": "netY",
          "offset": {
            "x": 0,
            "y": 0,
          },
          "pinId": "px2",
        },
        {
          "boxId": "boxY",
          "color": "blue",
          "networkId": "netX",
          "offset": {
            "x": 0,
            "y": 0,
          },
          "pinId": "py1",
        },
        {
          "boxId": "boxZ_extra",
          "color": "purple",
          "networkId": "netZ",
          "offset": {
            "x": 0,
            "y": 0,
          },
          "pinId": "pz1",
        },
      ],
    }
  `)
})
