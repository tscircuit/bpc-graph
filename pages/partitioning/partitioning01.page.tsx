import { useState, useReducer } from "react"
import { InteractiveGraphics } from "graphics-debug/react"
import { SchematicPartitionProcessor } from "lib/partition-processing/SchematicPartitionProcessor"

const floatingBpc = {
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

function PartitioningDebugger() {
  const [iteration, setIteration] = useState(0)
  const [playInterval, setPlayInterval] = useState<NodeJS.Timeout | null>(null)
  const [processor] = useState(
    () => new SchematicPartitionProcessor(floatingBpc as any),
  )
  const isPlaying = playInterval !== null

  const step = () => {
    processor.step()
    setIteration((i) => i + 1)
  }

  const togglePlay = () => {
    if (isPlaying) {
      clearInterval(playInterval!)
      setPlayInterval(null)
    } else {
      const interval = setInterval(() => {
        processor.step()
        setIteration((i) => i + 1)
      }, 100)
      setPlayInterval(interval)
    }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button onClick={step}>Step</button>
        <button onClick={togglePlay}>{isPlaying ? "Pause" : "Play"}</button>
        <span>Iteration: {processor.iteration}</span>
        <span>Solved: {String(processor.solved)}</span>
      </div>
      <InteractiveGraphics graphics={processor.getGraphicsForLastGraph()} />
    </div>
  )
}

export default function PartitioningPage() {
  return <PartitioningDebugger />
}
