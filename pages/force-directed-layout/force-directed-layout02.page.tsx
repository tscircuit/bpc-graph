import type { BpcGraph, FloatingBpcGraph } from "../../lib/types"
import { ForceDirectedLayoutDebugger } from "./ForceDirectedLayoutDebugger"

const g: BpcGraph = {
  boxes: [
    {
      boxId: "schematic_component_0",
      kind: "floating",
      center: {
        x: -24,
        y: 0,
      },
    },
    {
      boxId: "schematic_component_1",
      kind: "floating",
      center: {
        x: -20.5,
        y: 0,
      },
    },
    {
      boxId: "schematic_component_2",
      kind: "floating",
      center: {
        x: -17,
        y: 0,
      },
    },
    {
      boxId: "schematic_component_3",
      kind: "floating",
      center: {
        x: -13.5,
        y: 0,
      },
    },
    {
      boxId: "schematic_component_4",
      kind: "floating",
      center: {
        x: -10,
        y: 0,
      },
    },
    {
      boxId: "schematic_component_5",
      kind: "floating",
      center: {
        x: -6.5,
        y: 0,
      },
    },
    {
      boxId: "schematic_component_6",
      kind: "floating",
      center: {
        x: -3,
        y: 0,
      },
    },
    {
      boxId: "schematic_component_7",
      kind: "floating",
      center: {
        x: -24,
        y: 2,
      },
    },
    {
      boxId: "schematic_component_8",
      kind: "floating",
      center: {
        x: -20.5,
        y: 2,
      },
    },
    {
      boxId: "schematic_component_9",
      kind: "floating",
      center: {
        x: -17,
        y: 2,
      },
    },
    {
      boxId: "schematic_component_10",
      kind: "floating",
      center: {
        x: -13.5,
        y: 2,
      },
    },
    {
      boxId: "schematic_component_11",
      kind: "floating",
      center: {
        x: -10,
        y: 2,
      },
    },
    {
      boxId: "schematic_component_12",
      kind: "floating",
      center: {
        x: -6.5,
        y: 2,
      },
    },
    {
      boxId: "schematic_component_13",
      kind: "floating",
      center: {
        x: -3,
        y: 2,
      },
    },
    {
      boxId: "schematic_component_14",
      kind: "floating",
      center: {
        x: -24,
        y: 4,
      },
    },
    {
      boxId: "schematic_component_15",
      kind: "floating",
      center: {
        x: -20.5,
        y: 4,
      },
    },
    {
      boxId: "schematic_component_16",
      kind: "floating",
      center: {
        x: -17,
        y: 4,
      },
    },
    {
      boxId: "schematic_component_17",
      kind: "floating",
      center: {
        x: -13.5,
        y: 4,
      },
    },
    {
      boxId: "schematic_component_18",
      kind: "floating",
      center: {
        x: -10,
        y: 4,
      },
    },
    {
      boxId: "schematic_component_19",
      kind: "floating",
      center: {
        x: -6.5,
        y: 4,
      },
    },
    {
      boxId: "schematic_component_20",
      kind: "floating",
      center: {
        x: -3,
        y: 4,
      },
    },
    {
      boxId: "schematic_component_21",
      kind: "floating",
      center: {
        x: -24,
        y: 6,
      },
    },
    {
      boxId: "schematic_component_22",
      kind: "floating",
      center: {
        x: -20.5,
        y: 6,
      },
    },
    {
      boxId: "schematic_component_23",
      kind: "floating",
      center: {
        x: -17,
        y: 6,
      },
    },
    {
      boxId: "schematic_component_24",
      kind: "floating",
      center: {
        x: -13.5,
        y: 6,
      },
    },
    {
      boxId: "schematic_component_25",
      kind: "floating",
      center: {
        x: -10,
        y: 6,
      },
    },
    {
      boxId: "schematic_component_26",
      kind: "floating",
      center: {
        x: -6.5,
        y: 6,
      },
    },
    {
      boxId: "schematic_component_27",
      kind: "floating",
      center: {
        x: -3,
        y: 6,
      },
    },
    {
      boxId: "schematic_component_28",
      kind: "floating",
      center: {
        x: -24,
        y: 8,
      },
    },
    {
      boxId: "schematic_component_29",
      kind: "floating",
      center: {
        x: -20.5,
        y: 8,
      },
    },
    {
      boxId: "schematic_component_30",
      kind: "floating",
      center: {
        x: -17,
        y: 8,
      },
    },
    {
      boxId: "schematic_component_31",
      kind: "floating",
      center: {
        x: -13.5,
        y: 8,
      },
    },
    {
      boxId: "schematic_component_32",
      kind: "floating",
      center: {
        x: -10,
        y: 8,
      },
    },
    {
      boxId: "schematic_component_33",
      kind: "floating",
      center: {
        x: -6.5,
        y: 8,
      },
    },
    {
      boxId: "schematic_component_34",
      kind: "floating",
      center: {
        x: -3,
        y: 8,
      },
    },
    {
      boxId: "schematic_component_35",
      kind: "floating",
      center: {
        x: -24,
        y: 10,
      },
    },
    {
      boxId: "schematic_component_36",
      kind: "floating",
      center: {
        x: -20.5,
        y: 10,
      },
    },
    {
      boxId: "schematic_component_37",
      kind: "floating",
      center: {
        x: -17,
        y: 10,
      },
    },
    {
      boxId: "schematic_component_38",
      kind: "floating",
      center: {
        x: -13.5,
        y: 10,
      },
    },
    {
      boxId: "schematic_component_39",
      kind: "floating",
      center: {
        x: -10,
        y: 10,
      },
    },
    {
      boxId: "schematic_component_40",
      kind: "floating",
      center: {
        x: -6.5,
        y: 10,
      },
    },
    {
      boxId: "schematic_component_41",
      kind: "floating",
      center: {
        x: -3,
        y: 10,
      },
    },
    {
      boxId: "schematic_component_42",
      kind: "floating",
      center: {
        x: -25,
        y: -6,
      },
    },
    {
      boxId: "schematic_component_43",
      kind: "floating",
      center: {
        x: -20,
        y: -6,
      },
    },
    {
      boxId: "schematic_component_44",
      kind: "floating",
      center: {
        x: -32,
        y: -10,
      },
    },
    {
      boxId: "schematic_component_45",
      kind: "floating",
      center: {
        x: -20,
        y: -4,
      },
    },
    {
      boxId: "schematic_component_46",
      kind: "floating",
      center: {
        x: -10,
        y: -3,
      },
    },
  ],
  pins: [
    {
      pinId: "schematic_port_0",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net2",
      offset: {
        x: 1.0500000000000007,
        y: -0.1,
      },
      boxId: "schematic_component_0",
    },
    {
      pinId: "schematic_port_1",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0500000000000007,
        y: -0.1,
      },
      boxId: "schematic_component_0",
    },
    {
      pinId: "schematic_port_2",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net45",
      offset: {
        x: -1.0500000000000007,
        y: 0.1,
      },
      boxId: "schematic_component_0",
    },
    {
      pinId: "schematic_port_3",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0500000000000007,
        y: 0.1,
      },
      boxId: "schematic_component_0",
    },
    {
      pinId: "schematic_port_4",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net3",
      offset: {
        x: 1.0500000000000007,
        y: -0.1,
      },
      boxId: "schematic_component_1",
    },
    {
      pinId: "schematic_port_5",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0500000000000007,
        y: -0.1,
      },
      boxId: "schematic_component_1",
    },
    {
      pinId: "schematic_port_6",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net2",
      offset: {
        x: -1.0500000000000007,
        y: 0.1,
      },
      boxId: "schematic_component_1",
    },
    {
      pinId: "schematic_port_7",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0500000000000007,
        y: 0.1,
      },
      boxId: "schematic_component_1",
    },
    {
      pinId: "schematic_port_8",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net4",
      offset: {
        x: 1.0500000000000007,
        y: -0.1,
      },
      boxId: "schematic_component_2",
    },
    {
      pinId: "schematic_port_9",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0500000000000007,
        y: -0.1,
      },
      boxId: "schematic_component_2",
    },
    {
      pinId: "schematic_port_10",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net3",
      offset: {
        x: -1.0500000000000007,
        y: 0.1,
      },
      boxId: "schematic_component_2",
    },
    {
      pinId: "schematic_port_11",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0500000000000007,
        y: 0.1,
      },
      boxId: "schematic_component_2",
    },
    {
      pinId: "schematic_port_12",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net5",
      offset: {
        x: 1.0500000000000007,
        y: -0.1,
      },
      boxId: "schematic_component_3",
    },
    {
      pinId: "schematic_port_13",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0500000000000007,
        y: -0.1,
      },
      boxId: "schematic_component_3",
    },
    {
      pinId: "schematic_port_14",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net4",
      offset: {
        x: -1.0500000000000007,
        y: 0.1,
      },
      boxId: "schematic_component_3",
    },
    {
      pinId: "schematic_port_15",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0500000000000007,
        y: 0.1,
      },
      boxId: "schematic_component_3",
    },
    {
      pinId: "schematic_port_16",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net6",
      offset: {
        x: 1.0500000000000007,
        y: -0.1,
      },
      boxId: "schematic_component_4",
    },
    {
      pinId: "schematic_port_17",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0500000000000007,
        y: -0.1,
      },
      boxId: "schematic_component_4",
    },
    {
      pinId: "schematic_port_18",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net5",
      offset: {
        x: -1.0500000000000007,
        y: 0.1,
      },
      boxId: "schematic_component_4",
    },
    {
      pinId: "schematic_port_19",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0500000000000007,
        y: 0.1,
      },
      boxId: "schematic_component_4",
    },
    {
      pinId: "schematic_port_20",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net7",
      offset: {
        x: 1.0499999999999998,
        y: -0.1,
      },
      boxId: "schematic_component_5",
    },
    {
      pinId: "schematic_port_21",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0499999999999998,
        y: -0.1,
      },
      boxId: "schematic_component_5",
    },
    {
      pinId: "schematic_port_22",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net6",
      offset: {
        x: -1.0499999999999998,
        y: 0.1,
      },
      boxId: "schematic_component_5",
    },
    {
      pinId: "schematic_port_23",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0499999999999998,
        y: 0.1,
      },
      boxId: "schematic_component_5",
    },
    {
      pinId: "schematic_port_24",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net8",
      offset: {
        x: 1.05,
        y: -0.1,
      },
      boxId: "schematic_component_6",
    },
    {
      pinId: "schematic_port_25",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0499999999999998,
        y: -0.1,
      },
      boxId: "schematic_component_6",
    },
    {
      pinId: "schematic_port_26",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net7",
      offset: {
        x: -1.0499999999999998,
        y: 0.1,
      },
      boxId: "schematic_component_6",
    },
    {
      pinId: "schematic_port_27",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.05,
        y: 0.1,
      },
      boxId: "schematic_component_6",
    },
    {
      pinId: "schematic_port_28",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net9",
      offset: {
        x: 1.0500000000000007,
        y: -0.10000000000000009,
      },
      boxId: "schematic_component_7",
    },
    {
      pinId: "schematic_port_29",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0500000000000007,
        y: -0.10000000000000009,
      },
      boxId: "schematic_component_7",
    },
    {
      pinId: "schematic_port_30",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net8",
      offset: {
        x: -1.0500000000000007,
        y: 0.10000000000000009,
      },
      boxId: "schematic_component_7",
    },
    {
      pinId: "schematic_port_31",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0500000000000007,
        y: 0.10000000000000009,
      },
      boxId: "schematic_component_7",
    },
    {
      pinId: "schematic_port_32",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net10",
      offset: {
        x: 1.0500000000000007,
        y: -0.10000000000000009,
      },
      boxId: "schematic_component_8",
    },
    {
      pinId: "schematic_port_33",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0500000000000007,
        y: -0.10000000000000009,
      },
      boxId: "schematic_component_8",
    },
    {
      pinId: "schematic_port_34",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net9",
      offset: {
        x: -1.0500000000000007,
        y: 0.10000000000000009,
      },
      boxId: "schematic_component_8",
    },
    {
      pinId: "schematic_port_35",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0500000000000007,
        y: 0.10000000000000009,
      },
      boxId: "schematic_component_8",
    },
    {
      pinId: "schematic_port_36",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net11",
      offset: {
        x: 1.0500000000000007,
        y: -0.10000000000000009,
      },
      boxId: "schematic_component_9",
    },
    {
      pinId: "schematic_port_37",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0500000000000007,
        y: -0.10000000000000009,
      },
      boxId: "schematic_component_9",
    },
    {
      pinId: "schematic_port_38",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net10",
      offset: {
        x: -1.0500000000000007,
        y: 0.10000000000000009,
      },
      boxId: "schematic_component_9",
    },
    {
      pinId: "schematic_port_39",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0500000000000007,
        y: 0.10000000000000009,
      },
      boxId: "schematic_component_9",
    },
    {
      pinId: "schematic_port_40",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net12",
      offset: {
        x: 1.0500000000000007,
        y: -0.10000000000000009,
      },
      boxId: "schematic_component_10",
    },
    {
      pinId: "schematic_port_41",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0500000000000007,
        y: -0.10000000000000009,
      },
      boxId: "schematic_component_10",
    },
    {
      pinId: "schematic_port_42",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net11",
      offset: {
        x: -1.0500000000000007,
        y: 0.10000000000000009,
      },
      boxId: "schematic_component_10",
    },
    {
      pinId: "schematic_port_43",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0500000000000007,
        y: 0.10000000000000009,
      },
      boxId: "schematic_component_10",
    },
    {
      pinId: "schematic_port_44",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net13",
      offset: {
        x: 1.0500000000000007,
        y: -0.10000000000000009,
      },
      boxId: "schematic_component_11",
    },
    {
      pinId: "schematic_port_45",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0500000000000007,
        y: -0.10000000000000009,
      },
      boxId: "schematic_component_11",
    },
    {
      pinId: "schematic_port_46",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net12",
      offset: {
        x: -1.0500000000000007,
        y: 0.10000000000000009,
      },
      boxId: "schematic_component_11",
    },
    {
      pinId: "schematic_port_47",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0500000000000007,
        y: 0.10000000000000009,
      },
      boxId: "schematic_component_11",
    },
    {
      pinId: "schematic_port_48",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net14",
      offset: {
        x: 1.0499999999999998,
        y: -0.10000000000000009,
      },
      boxId: "schematic_component_12",
    },
    {
      pinId: "schematic_port_49",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0499999999999998,
        y: -0.10000000000000009,
      },
      boxId: "schematic_component_12",
    },
    {
      pinId: "schematic_port_50",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net13",
      offset: {
        x: -1.0499999999999998,
        y: 0.10000000000000009,
      },
      boxId: "schematic_component_12",
    },
    {
      pinId: "schematic_port_51",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0499999999999998,
        y: 0.10000000000000009,
      },
      boxId: "schematic_component_12",
    },
    {
      pinId: "schematic_port_52",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net15",
      offset: {
        x: 1.05,
        y: -0.10000000000000009,
      },
      boxId: "schematic_component_13",
    },
    {
      pinId: "schematic_port_53",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0499999999999998,
        y: -0.10000000000000009,
      },
      boxId: "schematic_component_13",
    },
    {
      pinId: "schematic_port_54",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net14",
      offset: {
        x: -1.0499999999999998,
        y: 0.10000000000000009,
      },
      boxId: "schematic_component_13",
    },
    {
      pinId: "schematic_port_55",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.05,
        y: 0.10000000000000009,
      },
      boxId: "schematic_component_13",
    },
    {
      pinId: "schematic_port_56",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net16",
      offset: {
        x: 1.0500000000000007,
        y: -0.10000000000000009,
      },
      boxId: "schematic_component_14",
    },
    {
      pinId: "schematic_port_57",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0500000000000007,
        y: -0.10000000000000009,
      },
      boxId: "schematic_component_14",
    },
    {
      pinId: "schematic_port_58",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net15",
      offset: {
        x: -1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_14",
    },
    {
      pinId: "schematic_port_59",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_14",
    },
    {
      pinId: "schematic_port_60",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net17",
      offset: {
        x: 1.0500000000000007,
        y: -0.10000000000000009,
      },
      boxId: "schematic_component_15",
    },
    {
      pinId: "schematic_port_61",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0500000000000007,
        y: -0.10000000000000009,
      },
      boxId: "schematic_component_15",
    },
    {
      pinId: "schematic_port_62",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net16",
      offset: {
        x: -1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_15",
    },
    {
      pinId: "schematic_port_63",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_15",
    },
    {
      pinId: "schematic_port_64",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net18",
      offset: {
        x: 1.0500000000000007,
        y: -0.10000000000000009,
      },
      boxId: "schematic_component_16",
    },
    {
      pinId: "schematic_port_65",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0500000000000007,
        y: -0.10000000000000009,
      },
      boxId: "schematic_component_16",
    },
    {
      pinId: "schematic_port_66",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net17",
      offset: {
        x: -1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_16",
    },
    {
      pinId: "schematic_port_67",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_16",
    },
    {
      pinId: "schematic_port_68",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net19",
      offset: {
        x: 1.0500000000000007,
        y: -0.10000000000000009,
      },
      boxId: "schematic_component_17",
    },
    {
      pinId: "schematic_port_69",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0500000000000007,
        y: -0.10000000000000009,
      },
      boxId: "schematic_component_17",
    },
    {
      pinId: "schematic_port_70",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net18",
      offset: {
        x: -1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_17",
    },
    {
      pinId: "schematic_port_71",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_17",
    },
    {
      pinId: "schematic_port_72",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net20",
      offset: {
        x: 1.0500000000000007,
        y: -0.10000000000000009,
      },
      boxId: "schematic_component_18",
    },
    {
      pinId: "schematic_port_73",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0500000000000007,
        y: -0.10000000000000009,
      },
      boxId: "schematic_component_18",
    },
    {
      pinId: "schematic_port_74",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net19",
      offset: {
        x: -1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_18",
    },
    {
      pinId: "schematic_port_75",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_18",
    },
    {
      pinId: "schematic_port_76",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net21",
      offset: {
        x: 1.0499999999999998,
        y: -0.10000000000000009,
      },
      boxId: "schematic_component_19",
    },
    {
      pinId: "schematic_port_77",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0499999999999998,
        y: -0.10000000000000009,
      },
      boxId: "schematic_component_19",
    },
    {
      pinId: "schematic_port_78",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net20",
      offset: {
        x: -1.0499999999999998,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_19",
    },
    {
      pinId: "schematic_port_79",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0499999999999998,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_19",
    },
    {
      pinId: "schematic_port_80",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net22",
      offset: {
        x: 1.05,
        y: -0.10000000000000009,
      },
      boxId: "schematic_component_20",
    },
    {
      pinId: "schematic_port_81",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0499999999999998,
        y: -0.10000000000000009,
      },
      boxId: "schematic_component_20",
    },
    {
      pinId: "schematic_port_82",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net21",
      offset: {
        x: -1.0499999999999998,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_20",
    },
    {
      pinId: "schematic_port_83",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.05,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_20",
    },
    {
      pinId: "schematic_port_84",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net23",
      offset: {
        x: 1.0500000000000007,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_21",
    },
    {
      pinId: "schematic_port_85",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0500000000000007,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_21",
    },
    {
      pinId: "schematic_port_86",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net22",
      offset: {
        x: -1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_21",
    },
    {
      pinId: "schematic_port_87",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_21",
    },
    {
      pinId: "schematic_port_88",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net24",
      offset: {
        x: 1.0500000000000007,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_22",
    },
    {
      pinId: "schematic_port_89",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0500000000000007,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_22",
    },
    {
      pinId: "schematic_port_90",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net23",
      offset: {
        x: -1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_22",
    },
    {
      pinId: "schematic_port_91",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_22",
    },
    {
      pinId: "schematic_port_92",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net25",
      offset: {
        x: 1.0500000000000007,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_23",
    },
    {
      pinId: "schematic_port_93",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0500000000000007,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_23",
    },
    {
      pinId: "schematic_port_94",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net24",
      offset: {
        x: -1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_23",
    },
    {
      pinId: "schematic_port_95",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_23",
    },
    {
      pinId: "schematic_port_96",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net26",
      offset: {
        x: 1.0500000000000007,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_24",
    },
    {
      pinId: "schematic_port_97",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0500000000000007,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_24",
    },
    {
      pinId: "schematic_port_98",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net25",
      offset: {
        x: -1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_24",
    },
    {
      pinId: "schematic_port_99",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_24",
    },
    {
      pinId: "schematic_port_100",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net27",
      offset: {
        x: 1.0500000000000007,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_25",
    },
    {
      pinId: "schematic_port_101",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0500000000000007,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_25",
    },
    {
      pinId: "schematic_port_102",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net26",
      offset: {
        x: -1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_25",
    },
    {
      pinId: "schematic_port_103",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_25",
    },
    {
      pinId: "schematic_port_104",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net28",
      offset: {
        x: 1.0499999999999998,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_26",
    },
    {
      pinId: "schematic_port_105",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0499999999999998,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_26",
    },
    {
      pinId: "schematic_port_106",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net27",
      offset: {
        x: -1.0499999999999998,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_26",
    },
    {
      pinId: "schematic_port_107",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0499999999999998,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_26",
    },
    {
      pinId: "schematic_port_108",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net29",
      offset: {
        x: 1.05,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_27",
    },
    {
      pinId: "schematic_port_109",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0499999999999998,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_27",
    },
    {
      pinId: "schematic_port_110",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net28",
      offset: {
        x: -1.0499999999999998,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_27",
    },
    {
      pinId: "schematic_port_111",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.05,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_27",
    },
    {
      pinId: "schematic_port_112",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net30",
      offset: {
        x: 1.0500000000000007,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_28",
    },
    {
      pinId: "schematic_port_113",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0500000000000007,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_28",
    },
    {
      pinId: "schematic_port_114",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net29",
      offset: {
        x: -1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_28",
    },
    {
      pinId: "schematic_port_115",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_28",
    },
    {
      pinId: "schematic_port_116",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net31",
      offset: {
        x: 1.0500000000000007,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_29",
    },
    {
      pinId: "schematic_port_117",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0500000000000007,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_29",
    },
    {
      pinId: "schematic_port_118",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net30",
      offset: {
        x: -1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_29",
    },
    {
      pinId: "schematic_port_119",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_29",
    },
    {
      pinId: "schematic_port_120",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net32",
      offset: {
        x: 1.0500000000000007,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_30",
    },
    {
      pinId: "schematic_port_121",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0500000000000007,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_30",
    },
    {
      pinId: "schematic_port_122",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net31",
      offset: {
        x: -1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_30",
    },
    {
      pinId: "schematic_port_123",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_30",
    },
    {
      pinId: "schematic_port_124",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net33",
      offset: {
        x: 1.0500000000000007,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_31",
    },
    {
      pinId: "schematic_port_125",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0500000000000007,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_31",
    },
    {
      pinId: "schematic_port_126",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net32",
      offset: {
        x: -1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_31",
    },
    {
      pinId: "schematic_port_127",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_31",
    },
    {
      pinId: "schematic_port_128",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net34",
      offset: {
        x: 1.0500000000000007,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_32",
    },
    {
      pinId: "schematic_port_129",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0500000000000007,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_32",
    },
    {
      pinId: "schematic_port_130",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net33",
      offset: {
        x: -1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_32",
    },
    {
      pinId: "schematic_port_131",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_32",
    },
    {
      pinId: "schematic_port_132",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net35",
      offset: {
        x: 1.0499999999999998,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_33",
    },
    {
      pinId: "schematic_port_133",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0499999999999998,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_33",
    },
    {
      pinId: "schematic_port_134",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net34",
      offset: {
        x: -1.0499999999999998,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_33",
    },
    {
      pinId: "schematic_port_135",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0499999999999998,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_33",
    },
    {
      pinId: "schematic_port_136",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net36",
      offset: {
        x: 1.05,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_34",
    },
    {
      pinId: "schematic_port_137",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0499999999999998,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_34",
    },
    {
      pinId: "schematic_port_138",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net35",
      offset: {
        x: -1.0499999999999998,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_34",
    },
    {
      pinId: "schematic_port_139",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.05,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_34",
    },
    {
      pinId: "schematic_port_140",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net37",
      offset: {
        x: 1.0500000000000007,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_35",
    },
    {
      pinId: "schematic_port_141",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0500000000000007,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_35",
    },
    {
      pinId: "schematic_port_142",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net36",
      offset: {
        x: -1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_35",
    },
    {
      pinId: "schematic_port_143",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_35",
    },
    {
      pinId: "schematic_port_144",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net38",
      offset: {
        x: 1.0500000000000007,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_36",
    },
    {
      pinId: "schematic_port_145",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0500000000000007,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_36",
    },
    {
      pinId: "schematic_port_146",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net37",
      offset: {
        x: -1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_36",
    },
    {
      pinId: "schematic_port_147",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_36",
    },
    {
      pinId: "schematic_port_148",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net39",
      offset: {
        x: 1.0500000000000007,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_37",
    },
    {
      pinId: "schematic_port_149",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0500000000000007,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_37",
    },
    {
      pinId: "schematic_port_150",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net38",
      offset: {
        x: -1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_37",
    },
    {
      pinId: "schematic_port_151",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_37",
    },
    {
      pinId: "schematic_port_152",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net40",
      offset: {
        x: 1.0500000000000007,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_38",
    },
    {
      pinId: "schematic_port_153",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0500000000000007,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_38",
    },
    {
      pinId: "schematic_port_154",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net39",
      offset: {
        x: -1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_38",
    },
    {
      pinId: "schematic_port_155",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_38",
    },
    {
      pinId: "schematic_port_156",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net41",
      offset: {
        x: 1.0500000000000007,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_39",
    },
    {
      pinId: "schematic_port_157",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0500000000000007,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_39",
    },
    {
      pinId: "schematic_port_158",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net40",
      offset: {
        x: -1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_39",
    },
    {
      pinId: "schematic_port_159",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0500000000000007,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_39",
    },
    {
      pinId: "schematic_port_160",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net42",
      offset: {
        x: 1.0499999999999998,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_40",
    },
    {
      pinId: "schematic_port_161",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0499999999999998,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_40",
    },
    {
      pinId: "schematic_port_162",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net41",
      offset: {
        x: -1.0499999999999998,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_40",
    },
    {
      pinId: "schematic_port_163",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.0499999999999998,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_40",
    },
    {
      pinId: "schematic_port_164",
      color: "not_connected",
      networkId: "disconnected-0",
      offset: {
        x: 1.05,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_41",
    },
    {
      pinId: "schematic_port_165",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.0499999999999998,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_41",
    },
    {
      pinId: "schematic_port_166",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net42",
      offset: {
        x: -1.0499999999999998,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_41",
    },
    {
      pinId: "schematic_port_167",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: 1.05,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_41",
    },
    {
      pinId: "schematic_port_168",
      color: "not_connected",
      networkId: "disconnected-1",
      offset: {
        x: -1.3999999999999986,
        y: 2.400000000000001,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_169",
      color: "not_connected",
      networkId: "disconnected-2",
      offset: {
        x: -1.3999999999999986,
        y: 2.2000000000000006,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_170",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.3999999999999986,
        y: 2.000000000000001,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_171",
      color: "not_connected",
      networkId: "disconnected-3",
      offset: {
        x: -1.3999999999999986,
        y: 1.8000000000000007,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_172",
      color: "not_connected",
      networkId: "disconnected-4",
      offset: {
        x: -1.3999999999999986,
        y: 1.6000000000000005,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_173",
      color: "not_connected",
      networkId: "disconnected-5",
      offset: {
        x: -1.3999999999999986,
        y: 1.4000000000000004,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_174",
      color: "not_connected",
      networkId: "disconnected-6",
      offset: {
        x: -1.3999999999999986,
        y: 1.200000000000001,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_175",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.3999999999999986,
        y: 1.0000000000000009,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_176",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net44",
      offset: {
        x: -1.3999999999999986,
        y: 0.8000000000000007,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_177",
      color: "not_connected",
      networkId: "disconnected-7",
      offset: {
        x: -1.3999999999999986,
        y: 0.6000000000000014,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_178",
      color: "not_connected",
      networkId: "disconnected-8",
      offset: {
        x: -1.3999999999999986,
        y: 0.40000000000000124,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_179",
      color: "not_connected",
      networkId: "disconnected-9",
      offset: {
        x: -1.3999999999999986,
        y: 0.20000000000000107,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_180",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.3999999999999986,
        y: 8.881784197001252e-16,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_181",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net46",
      offset: {
        x: -1.3999999999999986,
        y: -0.1999999999999993,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_182",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net47",
      offset: {
        x: -1.3999999999999986,
        y: -0.39999999999999947,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_183",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net48",
      offset: {
        x: -1.3999999999999986,
        y: -0.5999999999999996,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_184",
      color: "not_connected",
      networkId: "disconnected-10",
      offset: {
        x: -1.3999999999999986,
        y: -0.7999999999999998,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_185",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.3999999999999986,
        y: -1,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_186",
      color: "not_connected",
      networkId: "disconnected-11",
      offset: {
        x: -1.3999999999999986,
        y: -1.2000000000000002,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_187",
      color: "not_connected",
      networkId: "disconnected-12",
      offset: {
        x: -1.3999999999999986,
        y: -1.4000000000000004,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_188",
      color: "not_connected",
      networkId: "disconnected-13",
      offset: {
        x: -1.3999999999999986,
        y: -1.5999999999999996,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_189",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net49",
      offset: {
        x: -1.3999999999999986,
        y: -1.8000000000000007,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_190",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1.3999999999999986,
        y: -2,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_191",
      color: "not_connected",
      networkId: "disconnected-14",
      offset: {
        x: -1.3999999999999986,
        y: -2.200000000000001,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_192",
      color: "not_connected",
      networkId: "disconnected-15",
      offset: {
        x: -1.3999999999999986,
        y: -2.4000000000000004,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_193",
      color: "not_connected",
      networkId: "disconnected-16",
      offset: {
        x: 1.3999999999999986,
        y: -2.3000000000000007,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_194",
      color: "not_connected",
      networkId: "disconnected-17",
      offset: {
        x: 1.3999999999999986,
        y: -2.1000000000000014,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_195",
      color: "not_connected",
      networkId: "disconnected-18",
      offset: {
        x: 1.3999999999999986,
        y: -1.9000000000000004,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_196",
      color: "not_connected",
      networkId: "disconnected-19",
      offset: {
        x: 1.3999999999999986,
        y: -1.700000000000001,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_197",
      color: "not_connected",
      networkId: "disconnected-20",
      offset: {
        x: 1.3999999999999986,
        y: -1.5000000000000009,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_198",
      color: "not_connected",
      networkId: "disconnected-21",
      offset: {
        x: 1.3999999999999986,
        y: -1.3000000000000007,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_199",
      color: "not_connected",
      networkId: "disconnected-22",
      offset: {
        x: 1.3999999999999986,
        y: -1.1000000000000005,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_200",
      color: "not_connected",
      networkId: "disconnected-23",
      offset: {
        x: 1.3999999999999986,
        y: -0.9000000000000004,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_201",
      color: "not_connected",
      networkId: "disconnected-24",
      offset: {
        x: 1.3999999999999986,
        y: -0.7000000000000011,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_202",
      color: "not_connected",
      networkId: "disconnected-25",
      offset: {
        x: 1.3999999999999986,
        y: -0.5000000000000009,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_203",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net43",
      offset: {
        x: 1.3999999999999986,
        y: -0.3000000000000007,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_204",
      color: "not_connected",
      networkId: "disconnected-26",
      offset: {
        x: 1.3999999999999986,
        y: -0.10000000000000142,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_205",
      color: "not_connected",
      networkId: "disconnected-27",
      offset: {
        x: 1.3999999999999986,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_206",
      color: "not_connected",
      networkId: "disconnected-28",
      offset: {
        x: 1.3999999999999986,
        y: 0.29999999999999893,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_207",
      color: "not_connected",
      networkId: "disconnected-29",
      offset: {
        x: 1.3999999999999986,
        y: 0.5,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_208",
      color: "not_connected",
      networkId: "disconnected-30",
      offset: {
        x: 1.3999999999999986,
        y: 0.6999999999999993,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_209",
      color: "not_connected",
      networkId: "disconnected-31",
      offset: {
        x: 1.3999999999999986,
        y: 0.9000000000000004,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_210",
      color: "not_connected",
      networkId: "disconnected-32",
      offset: {
        x: 1.3999999999999986,
        y: 1.0999999999999996,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_211",
      color: "not_connected",
      networkId: "disconnected-33",
      offset: {
        x: 1.3999999999999986,
        y: 1.3000000000000007,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_212",
      color: "not_connected",
      networkId: "disconnected-34",
      offset: {
        x: 1.3999999999999986,
        y: 1.5,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_213",
      color: "not_connected",
      networkId: "disconnected-35",
      offset: {
        x: 1.3999999999999986,
        y: 1.7000000000000002,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_214",
      color: "not_connected",
      networkId: "disconnected-36",
      offset: {
        x: 1.3999999999999986,
        y: 1.9000000000000004,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_215",
      color: "not_connected",
      networkId: "disconnected-37",
      offset: {
        x: 1.3999999999999986,
        y: 2.1000000000000005,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_216",
      color: "not_connected",
      networkId: "disconnected-38",
      offset: {
        x: 1.3999999999999986,
        y: 2.3000000000000007,
      },
      boxId: "schematic_component_42",
    },
    {
      pinId: "schematic_port_217",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net43",
      offset: {
        x: -1,
        y: 0.7000000000000002,
      },
      boxId: "schematic_component_43",
    },
    {
      pinId: "schematic_port_218",
      color: "not_connected",
      networkId: "disconnected-39",
      offset: {
        x: -1,
        y: 0.5,
      },
      boxId: "schematic_component_43",
    },
    {
      pinId: "schematic_port_219",
      color: "not_connected",
      networkId: "disconnected-40",
      offset: {
        x: -1,
        y: 0.2999999999999998,
      },
      boxId: "schematic_component_43",
    },
    {
      pinId: "schematic_port_220",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net46",
      offset: {
        x: -1,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_43",
    },
    {
      pinId: "schematic_port_221",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -1,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_43",
    },
    {
      pinId: "schematic_port_222",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net47",
      offset: {
        x: -1,
        y: -0.2999999999999998,
      },
      boxId: "schematic_component_43",
    },
    {
      pinId: "schematic_port_223",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net48",
      offset: {
        x: -1,
        y: -0.5,
      },
      boxId: "schematic_component_43",
    },
    {
      pinId: "schematic_port_224",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net49",
      offset: {
        x: -1,
        y: -0.7000000000000002,
      },
      boxId: "schematic_component_43",
    },
    {
      pinId: "schematic_port_225",
      color: "not_connected",
      networkId: "disconnected-41",
      offset: {
        x: 1,
        y: -0.7000000000000002,
      },
      boxId: "schematic_component_43",
    },
    {
      pinId: "schematic_port_226",
      color: "not_connected",
      networkId: "disconnected-42",
      offset: {
        x: 1,
        y: -0.5,
      },
      boxId: "schematic_component_43",
    },
    {
      pinId: "schematic_port_227",
      color: "not_connected",
      networkId: "disconnected-43",
      offset: {
        x: 1,
        y: -0.2999999999999998,
      },
      boxId: "schematic_component_43",
    },
    {
      pinId: "schematic_port_228",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: 1,
        y: -0.09999999999999964,
      },
      boxId: "schematic_component_43",
    },
    {
      pinId: "schematic_port_229",
      color: "not_connected",
      networkId: "disconnected-44",
      offset: {
        x: 1,
        y: 0.09999999999999964,
      },
      boxId: "schematic_component_43",
    },
    {
      pinId: "schematic_port_230",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net43",
      offset: {
        x: 1,
        y: 0.2999999999999998,
      },
      boxId: "schematic_component_43",
    },
    {
      pinId: "schematic_port_231",
      color: "not_connected",
      networkId: "disconnected-45",
      offset: {
        x: 1,
        y: 0.5,
      },
      boxId: "schematic_component_43",
    },
    {
      pinId: "schematic_port_232",
      color: "not_connected",
      networkId: "disconnected-46",
      offset: {
        x: 1,
        y: 0.7000000000000002,
      },
      boxId: "schematic_component_43",
    },
    {
      pinId: "schematic_port_233",
      color: "vcc",
      networkId: "unnamedsubcircuit470_connectivity_net1",
      offset: {
        x: -0.5512093000000036,
        y: -0.0002733499999987288,
      },
      boxId: "schematic_component_44",
    },
    {
      pinId: "schematic_port_234",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: 0.5512093,
        y: 0.00027335000000050513,
      },
      boxId: "schematic_component_44",
    },
    {
      pinId: "schematic_port_235",
      color: "gnd",
      networkId: "unnamedsubcircuit470_connectivity_net0",
      offset: {
        x: -0.5512093,
        y: -0.00027334999999961695,
      },
      boxId: "schematic_component_45",
    },
    {
      pinId: "schematic_port_236",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net43",
      offset: {
        x: 0.5512093,
        y: 0.00027334999999961695,
      },
      boxId: "schematic_component_45",
    },
    {
      pinId: "schematic_port_237",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net44",
      offset: {
        x: -0.5512907000000009,
        y: 0.0002732499999993365,
      },
      boxId: "schematic_component_46",
    },
    {
      pinId: "schematic_port_238",
      color: "normal",
      networkId: "unnamedsubcircuit470_connectivity_net45",
      offset: {
        x: 0.5512907000000009,
        y: -0.0002732499999993365,
      },
      boxId: "schematic_component_46",
    },
  ],
}

export default () => {
  return <ForceDirectedLayoutDebugger floatingBpsGraph={g} />
}
