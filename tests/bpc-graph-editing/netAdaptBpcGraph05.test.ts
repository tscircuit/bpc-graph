import { test, expect } from "bun:test"
import type { FixedBpcGraph } from "lib/types"
import corpus from "@tscircuit/schematic-corpus/dist/bundled-bpc-graphs.json"
import { netAdaptBpcGraph } from "lib/index"
import { testNetAdapt } from "./testNetAdapt"

test("netAdaptBpcGraph05", async () => {
  const design001 = corpus.design001 as FixedBpcGraph

  const design001MissingBoxes = structuredClone(design001)

  design001MissingBoxes.boxes = design001MissingBoxes.boxes.filter(
    (b) => !b.boxId.includes("net_label"),
  )
  design001MissingBoxes.pins = design001MissingBoxes.pins.filter(
    (p) => !p.boxId.includes("net_label"),
  )

  const { allGraphicsSvg, adaptedFloating, adaptedFixed } = testNetAdapt(
    design001MissingBoxes,
    design001,
  )

  expect(adaptedFloating).toMatchInlineSnapshot(`
    {
      "boxes": [
        {
          "boxId": "schematic_component_0",
          "center": {
            "x": 0,
            "y": 0,
          },
          "kind": "floating",
        },
        {
          "boxId": "schematic_net_label_0",
          "kind": "floating",
        },
        {
          "boxId": "schematic_net_label_1",
          "kind": "floating",
        },
        {
          "boxId": "schematic_net_label_2",
          "kind": "floating",
        },
        {
          "boxId": "schematic_net_label_3",
          "kind": "floating",
        },
      ],
      "pins": [
        {
          "boxId": "schematic_component_0",
          "color": "component_center",
          "networkId": "center_schematic_component_0",
          "offset": {
            "x": 0,
            "y": 0,
          },
          "pinId": "schematic_component_0_center",
        },
        {
          "boxId": "schematic_component_0",
          "color": "normal",
          "networkId": "unnamedsubcircuit13_connectivity_net0",
          "offset": {
            "x": 1.1,
            "y": 0.30000000000000004,
          },
          "pinId": "schematic_port_0",
        },
        {
          "boxId": "schematic_component_0",
          "color": "normal",
          "networkId": "unnamedsubcircuit13_connectivity_net1",
          "offset": {
            "x": 1.1,
            "y": 0.09999999999999998,
          },
          "pinId": "schematic_port_1",
        },
        {
          "boxId": "schematic_component_0",
          "color": "vcc",
          "networkId": "unnamedsubcircuit13_connectivity_net2",
          "offset": {
            "x": 1.1,
            "y": -0.10000000000000003,
          },
          "pinId": "schematic_port_2",
        },
        {
          "boxId": "schematic_component_0",
          "color": "gnd",
          "networkId": "unnamedsubcircuit13_connectivity_net3",
          "offset": {
            "x": 1.1,
            "y": -0.30000000000000004,
          },
          "pinId": "schematic_port_3",
        },
        {
          "boxId": "schematic_net_label_0",
          "color": "gnd",
          "networkId": "unnamedsubcircuit13_connectivity_net3",
          "offset": {
            "x": 0,
            "y": 0.17999999999999994,
          },
          "pinId": "schematic_net_label_0_pin",
        },
        {
          "boxId": "schematic_net_label_0",
          "color": "netlabel_center",
          "networkId": "schematic_net_label_0_center",
          "offset": {
            "x": 0,
            "y": 0,
          },
          "pinId": "schematic_net_label_0_center",
        },
        {
          "boxId": "schematic_net_label_1",
          "color": "vcc",
          "networkId": "unnamedsubcircuit13_connectivity_net2",
          "offset": {
            "x": 0,
            "y": -0.17999999999999994,
          },
          "pinId": "schematic_net_label_1_pin",
        },
        {
          "boxId": "schematic_net_label_1",
          "color": "netlabel_center",
          "networkId": "schematic_net_label_1_center",
          "offset": {
            "x": 0,
            "y": 0,
          },
          "pinId": "schematic_net_label_1_center",
        },
        {
          "boxId": "schematic_net_label_2",
          "color": "normal",
          "networkId": "unnamedsubcircuit13_connectivity_net0",
          "offset": {
            "x": -0.27,
            "y": 0,
          },
          "pinId": "schematic_net_label_2_pin",
        },
        {
          "boxId": "schematic_net_label_2",
          "color": "netlabel_center",
          "networkId": "schematic_net_label_2_center",
          "offset": {
            "x": 0,
            "y": 0,
          },
          "pinId": "schematic_net_label_2_center",
        },
        {
          "boxId": "schematic_net_label_3",
          "color": "normal",
          "networkId": "unnamedsubcircuit13_connectivity_net1",
          "offset": {
            "x": -0.27,
            "y": 0,
          },
          "pinId": "schematic_net_label_3_pin",
        },
        {
          "boxId": "schematic_net_label_3",
          "color": "netlabel_center",
          "networkId": "schematic_net_label_3_center",
          "offset": {
            "x": 0,
            "y": 0,
          },
          "pinId": "schematic_net_label_3_center",
        },
      ],
    }
  `)
  expect(adaptedFixed).toMatchInlineSnapshot(`
    {
      "boxes": [
        {
          "boxId": "schematic_component_0",
          "center": {
            "x": 0,
            "y": 0,
          },
          "kind": "floating",
        },
        {
          "boxId": "schematic_net_label_0",
          "center": {
            "x": 0,
            "y": 0,
          },
          "kind": "fixed",
        },
        {
          "boxId": "schematic_net_label_1",
          "center": {
            "x": 0,
            "y": 0,
          },
          "kind": "fixed",
        },
        {
          "boxId": "schematic_net_label_2",
          "center": {
            "x": 0,
            "y": 0,
          },
          "kind": "fixed",
        },
        {
          "boxId": "schematic_net_label_3",
          "center": {
            "x": 0,
            "y": 0,
          },
          "kind": "fixed",
        },
      ],
      "pins": [
        {
          "boxId": "schematic_component_0",
          "color": "component_center",
          "networkId": "center_schematic_component_0",
          "offset": {
            "x": 0,
            "y": 0,
          },
          "pinId": "schematic_component_0_center",
        },
        {
          "boxId": "schematic_component_0",
          "color": "normal",
          "networkId": "unnamedsubcircuit13_connectivity_net0",
          "offset": {
            "x": 1.1,
            "y": 0.30000000000000004,
          },
          "pinId": "schematic_port_0",
        },
        {
          "boxId": "schematic_component_0",
          "color": "normal",
          "networkId": "unnamedsubcircuit13_connectivity_net1",
          "offset": {
            "x": 1.1,
            "y": 0.09999999999999998,
          },
          "pinId": "schematic_port_1",
        },
        {
          "boxId": "schematic_component_0",
          "color": "vcc",
          "networkId": "unnamedsubcircuit13_connectivity_net2",
          "offset": {
            "x": 1.1,
            "y": -0.10000000000000003,
          },
          "pinId": "schematic_port_2",
        },
        {
          "boxId": "schematic_component_0",
          "color": "gnd",
          "networkId": "unnamedsubcircuit13_connectivity_net3",
          "offset": {
            "x": 1.1,
            "y": -0.30000000000000004,
          },
          "pinId": "schematic_port_3",
        },
        {
          "boxId": "schematic_net_label_0",
          "color": "gnd",
          "networkId": "unnamedsubcircuit13_connectivity_net3",
          "offset": {
            "x": 0,
            "y": 0.17999999999999994,
          },
          "pinId": "schematic_net_label_0_pin",
        },
        {
          "boxId": "schematic_net_label_0",
          "color": "netlabel_center",
          "networkId": "schematic_net_label_0_center",
          "offset": {
            "x": 0,
            "y": 0,
          },
          "pinId": "schematic_net_label_0_center",
        },
        {
          "boxId": "schematic_net_label_1",
          "color": "vcc",
          "networkId": "unnamedsubcircuit13_connectivity_net2",
          "offset": {
            "x": 0,
            "y": -0.17999999999999994,
          },
          "pinId": "schematic_net_label_1_pin",
        },
        {
          "boxId": "schematic_net_label_1",
          "color": "netlabel_center",
          "networkId": "schematic_net_label_1_center",
          "offset": {
            "x": 0,
            "y": 0,
          },
          "pinId": "schematic_net_label_1_center",
        },
        {
          "boxId": "schematic_net_label_2",
          "color": "normal",
          "networkId": "unnamedsubcircuit13_connectivity_net0",
          "offset": {
            "x": -0.27,
            "y": 0,
          },
          "pinId": "schematic_net_label_2_pin",
        },
        {
          "boxId": "schematic_net_label_2",
          "color": "netlabel_center",
          "networkId": "schematic_net_label_2_center",
          "offset": {
            "x": 0,
            "y": 0,
          },
          "pinId": "schematic_net_label_2_center",
        },
        {
          "boxId": "schematic_net_label_3",
          "color": "normal",
          "networkId": "unnamedsubcircuit13_connectivity_net1",
          "offset": {
            "x": -0.27,
            "y": 0,
          },
          "pinId": "schematic_net_label_3_pin",
        },
        {
          "boxId": "schematic_net_label_3",
          "color": "netlabel_center",
          "networkId": "schematic_net_label_3_center",
          "offset": {
            "x": 0,
            "y": 0,
          },
          "pinId": "schematic_net_label_3_center",
        },
      ],
    }
  `)

  expect(allGraphicsSvg).toMatchSvgSnapshot(import.meta.path)
})
