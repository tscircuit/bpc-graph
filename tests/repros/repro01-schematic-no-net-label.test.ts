import { test, expect } from "bun:test"
import { convertCircuitJsonToSchematicSvg } from "circuit-to-svg"
import { getGraphicsForBpcGraph, type FloatingBpcGraph } from "lib/index"
import { debugLayout } from "tests/fixtures/debugLayout"
import {
  getSvgFromGraphicsObject,
  stackGraphicsHorizontally,
  stackGraphicsVertically,
} from "graphics-debug"
import { corpusNoNetLabel } from "@tscircuit/schematic-corpus"

const floatingBpc: FloatingBpcGraph = {
  boxes: [
    {
      boxId: "schematic_component_0",
      kind: "floating",
      center: {
        x: 0,
        y: 0,
      },
    },
    {
      boxId: "schematic_component_1",
      kind: "floating",
      center: {
        x: -3,
        y: 0,
      },
    },
    {
      boxId: "schematic_component_2",
      kind: "floating",
      center: {
        x: 2,
        y: 1,
      },
    },
  ],
  pins: [
    {
      pinId: "schematic_component_0_center",
      color: "component_center",
      networkId: "center_schematic_component_0",
      offset: {
        x: 0,
        y: 0,
      },
      boxId: "schematic_component_0",
    },
    {
      pinId: "schematic_port_0",
      color: "vcc",
      networkId: "unnamedsubcircuit37_connectivity_net0",
      offset: {
        x: -1.4,
        y: 0.42500000000000004,
      },
      boxId: "schematic_component_0",
    },
    {
      pinId: "schematic_port_1",
      color: "gnd",
      networkId: "unnamedsubcircuit37_connectivity_net1",
      offset: {
        x: -1.4,
        y: -0.42500000000000004,
      },
      boxId: "schematic_component_0",
    },
    {
      pinId: "schematic_port_2",
      color: "normal",
      networkId: "unnamedsubcircuit37_connectivity_net5",
      offset: {
        x: 1.4,
        y: 0.5,
      },
      boxId: "schematic_component_0",
    },
    {
      pinId: "schematic_port_3",
      color: "normal",
      networkId: "unnamedsubcircuit37_connectivity_net4",
      offset: {
        x: 1.4,
        y: 0.30000000000000004,
      },
      boxId: "schematic_component_0",
    },
    {
      pinId: "schematic_port_4",
      color: "normal",
      networkId: "unnamedsubcircuit37_connectivity_net3",
      offset: {
        x: 1.4,
        y: 0.10000000000000009,
      },
      boxId: "schematic_component_0",
    },
    {
      pinId: "schematic_port_5",
      color: "normal",
      networkId: "unnamedsubcircuit37_connectivity_net2",
      offset: {
        x: 1.4,
        y: -0.09999999999999998,
      },
      boxId: "schematic_component_0",
    },
    {
      pinId: "schematic_port_6",
      color: "vcc",
      networkId: "unnamedsubcircuit37_connectivity_net0",
      offset: {
        x: 1.4,
        y: -0.3,
      },
      boxId: "schematic_component_0",
    },
    {
      pinId: "schematic_port_7",
      color: "vcc",
      networkId: "unnamedsubcircuit37_connectivity_net0",
      offset: {
        x: 1.4,
        y: -0.5,
      },
      boxId: "schematic_component_0",
    },
    {
      pinId: "schematic_component_1_center",
      color: "component_center",
      networkId: "center_schematic_component_1",
      offset: {
        x: 0,
        y: 0,
      },
      boxId: "schematic_component_1",
    },
    {
      pinId: "schematic_port_8",
      color: "gnd",
      networkId: "unnamedsubcircuit37_connectivity_net1",
      offset: {
        x: 0.00027334999999917287,
        y: -0.5512093000000002,
      },
      boxId: "schematic_component_1",
    },
    {
      pinId: "schematic_port_9",
      color: "vcc",
      networkId: "unnamedsubcircuit37_connectivity_net0",
      offset: {
        x: -0.00027334999999961695,
        y: 0.5512093000000002,
      },
      boxId: "schematic_component_1",
    },
    {
      pinId: "schematic_component_2_center",
      color: "component_center",
      networkId: "center_schematic_component_2",
      offset: {
        x: 0,
        y: 0,
      },
      boxId: "schematic_component_2",
    },
    {
      pinId: "schematic_port_10",
      color: "normal",
      networkId: "unnamedsubcircuit37_connectivity_net5",
      offset: {
        x: -0.0002732499999993365,
        y: -0.5512907000000004,
      },
      boxId: "schematic_component_2",
    },
    {
      pinId: "schematic_port_11",
      color: "vcc",
      networkId: "unnamedsubcircuit37_connectivity_net0",
      offset: {
        x: 0.0002732499999993365,
        y: 0.5512907000000002,
      },
      boxId: "schematic_component_2",
    },
  ],
}

test("repro01-schematic-no-net-label", async () => {
  // Use the debugLayout utility from tests/fixtures/debugLayout.ts
  const {
    partitions,
    partitionIterationGraphics,
    partitionGraphics,
    adaptedGraphGraphics,
    laidOutGraph,
    laidOutGraphGraphics,
    matchedCorpusGraphs,
    matchedCorpusGraphGraphics,
  } = debugLayout(floatingBpc, {
    corpus: corpusNoNetLabel,
  })

  expect(
    getSvgFromGraphicsObject(
      stackGraphicsVertically(
        [
          getGraphicsForBpcGraph(floatingBpc, {
            title: "Original BPC Graph",
          }),
          stackGraphicsHorizontally(partitionGraphics),
          stackGraphicsHorizontally(matchedCorpusGraphGraphics),
          stackGraphicsHorizontally(adaptedGraphGraphics),
          laidOutGraphGraphics,
        ],
        {
          titles: [
            "Original",
            "Partitions",
            "Matched Corpus Graphs",
            "Adapted Graphs",
            "Laid Out Graph",
          ],
        },
      ),
      {
        backgroundColor: "white",
      },
    ),
  ).toMatchSvgSnapshot(import.meta.path)
})
