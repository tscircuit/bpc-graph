/** biome-ignore-all lint/style/useFilenamingConvention: <explanation> */
import { test, expect } from "bun:test"
import {
  type MixedBpcGraph,
  getGraphicsForBpcGraph,
  layoutSchematicGraph,
} from "lib/index"
import {
  getSvgFromGraphicsObject,
  stackGraphicsVertically,
} from "graphics-debug"
import corpus from "@tscircuit/schematic-corpus"

/* ─── identical test fixture used in 01 ─── */
const ogGraph: MixedBpcGraph = {
  boxes: [
    {
      boxId: "U1",
      kind: "floating",
      center: {
        x: 0,
        y: 0,
      },
    },
    {
      boxId: "C1",
      kind: "floating",
      center: {
        x: 1,
        y: 0,
      },
    },
    {
      boxId: "NL1",
      kind: "fixed",
      center: {
        x: -1,
        y: 1.18,
      },
      boxAttributes: {
        is_net_label: true,
        source_net_id: "source_net_0",
      },
    },
    {
      boxId: "NL2",
      kind: "fixed",
      center: {
        x: -1,
        y: -1.18,
      },
      boxAttributes: {
        is_net_label: true,
        source_net_id: "source_net_1",
      },
    },
    {
      boxId: "NL3",
      kind: "fixed",
      center: {
        x: 1,
        y: 1.18,
      },
      boxAttributes: {
        is_net_label: true,
        source_net_id: "source_net_0",
      },
    },
    {
      boxId: "NL4",
      kind: "fixed",
      center: {
        x: 1,
        y: -1.18,
      },
      boxAttributes: {
        is_net_label: true,
        source_net_id: "source_net_1",
      },
    },
  ],
  pins: [
    {
      pinId: "U1_center",
      color: "component_center",
      networkId: "center_schematic_component_0",
      offset: {
        x: 0,
        y: 0,
      },
      boxId: "U1",
    },
    {
      pinId: "U1_pin1",
      color: "vcc",
      networkId: "unnamedsubcircuit12_connectivity_net0",
      offset: {
        x: -0.6000000000000001,
        y: 0.7,
      },
      boxId: "U1",
    },
    {
      pinId: "U1_pin2",
      color: "gnd",
      networkId: "unnamedsubcircuit12_connectivity_net1",
      offset: {
        x: -0.6000000000000001,
        y: -0.7,
      },
      boxId: "U1",
    },
    {
      pinId: "U1_pin3",
      color: "vcc",
      networkId: "unnamedsubcircuit12_connectivity_net0",
      offset: {
        x: 0.6000000000000001,
        y: 0.7,
      },
      boxId: "U1",
    },
    {
      pinId: "U1_pin4",
      color: "gnd",
      networkId: "unnamedsubcircuit12_connectivity_net1",
      offset: {
        x: 0.6000000000000001,
        y: -0.7,
      },
      boxId: "U1",
    },
    {
      pinId: "C1_center",
      color: "component_center",
      networkId: "center_schematic_component_1",
      offset: {
        x: 0,
        y: 0,
      },
      boxId: "C1",
    },
    {
      pinId: "C1_pin1",
      color: "vcc",
      networkId: "unnamedsubcircuit12_connectivity_net0",
      offset: {
        x: -0.00027334999999961695,
        y: 0.5512093000000002,
      },
      boxId: "C1",
    },
    {
      pinId: "C1_pin2",
      color: "gnd",
      networkId: "unnamedsubcircuit12_connectivity_net1",
      offset: {
        x: 0.00027334999999961695,
        y: -0.5512093000000002,
      },
      boxId: "C1",
    },
    {
      pinId: "NL1_pin",
      boxId: "NL1",
      networkId: "unnamedsubcircuit12_connectivity_net0",
      color: "vcc",
      offset: {
        x: 0,
        y: -0.17999999999999994,
      },
    },
    {
      pinId: "NL1_center",
      boxId: "NL1",
      networkId: "schematic_net_label_0_center",
      color: "netlabel_center",
      offset: {
        x: 0,
        y: 0,
      },
    },
    {
      pinId: "NL2_pin",
      boxId: "NL2",
      networkId: "unnamedsubcircuit12_connectivity_net1",
      color: "gnd",
      offset: {
        x: 0,
        y: 0.17999999999999994,
      },
    },
    {
      pinId: "NL2_center",
      boxId: "NL2",
      networkId: "schematic_net_label_1_center",
      color: "netlabel_center",
      offset: {
        x: 0,
        y: 0,
      },
    },
    {
      pinId: "NL3_pin",
      boxId: "NL3",
      networkId: "unnamedsubcircuit12_connectivity_net0",
      color: "vcc",
      offset: {
        x: 0,
        y: -0.17999999999999994,
      },
    },
    {
      pinId: "NL3_center",
      boxId: "NL3",
      networkId: "schematic_net_label_2_center",
      color: "netlabel_center",
      offset: {
        x: 0,
        y: 0,
      },
    },
    {
      pinId: "NL4_pin",
      boxId: "NL4",
      networkId: "unnamedsubcircuit12_connectivity_net1",
      color: "gnd",
      offset: {
        x: 0,
        y: 0.17999999999999994,
      },
    },
    {
      pinId: "NL4_center",
      boxId: "NL4",
      networkId: "schematic_net_label_3_center",
      color: "netlabel_center",
      offset: {
        x: 0,
        y: 0,
      },
    },
  ],
}

/* ──────────────── test ──────────────── */
test("partitionGraphForLayout02 – layoutSchematicGraph pipeline", () => {
  // 1. run the high-level layout helper
  const { fixedGraph: laidOut } = layoutSchematicGraph(ogGraph, {
    singletonKeys: ["vcc/2", "gnd/2"],
    centerPinColors: ["netlabel_center", "component_center"],
    corpus,
  })

  // 2. create before/after graphics for snapshot
  const graphicsOriginal = getGraphicsForBpcGraph(ogGraph, {
    title: "Original Circuit",
  })
  const graphicsLaidOut = getGraphicsForBpcGraph(laidOut, {
    title: "Laid-out Circuit",
  })

  expect(
    getSvgFromGraphicsObject(
      stackGraphicsVertically([graphicsOriginal, graphicsLaidOut]),
      { backgroundColor: "white" },
    ),
  ).toMatchSvgSnapshot(import.meta.path)

  // 3. sanity check
  expect(laidOut.boxes.length).toBeGreaterThan(0)
})
