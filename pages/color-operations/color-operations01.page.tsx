import type {FloatingBpcGraph} from "lib/types"
import {ColorOperationsDebugger} from "./ColorOperationsDebugger"

const g: FloatingBpcGraph = {
  "boxes": [
    {
      "boxId": "schematic_component_0",
      "kind": "floating",
      "center": {
        "x": 1.1,
        "y": 0.5000000000000001
      }
    }
  ],
  "pins": [
    {
      "pinId": "schematic_component_0_center",
      "color": "component_center",
      "networkId": "center_schematic_component_0",
      "offset": {
        "x": 0,
        "y": 0
      },
      "boxId": "schematic_component_0"
    },
    {
      "pinId": "schematic_port_0",
      "color": "normal",
      "networkId": "unnamedsubcircuit111_connectivity_net0",
      "offset": {
        "x": -1.1,
        "y": 0.30000000000000004
      },
      "boxId": "schematic_component_0"
    },
    {
      "pinId": "schematic_port_1",
      "color": "normal",
      "networkId": "unnamedsubcircuit111_connectivity_net1",
      "offset": {
        "x": -1.1,
        "y": 0.09999999999999998
      },
      "boxId": "schematic_component_0"
    },
    {
      "pinId": "schematic_port_2",
      "color": "vcc",
      "networkId": "unnamedsubcircuit111_connectivity_net2",
      "offset": {
        "x": -1.1,
        "y": -0.09999999999999998
      },
      "boxId": "schematic_component_0"
    },
    {
      "pinId": "schematic_port_3",
      "color": "gnd",
      "networkId": "unnamedsubcircuit111_connectivity_net3",
      "offset": {
        "x": -1.1,
        "y": -0.30000000000000004
      },
      "boxId": "schematic_component_0"
    }
  ]
}

export default () => {
  return <ColorOperationsDebugger floatingBpsGraph={g} />
}