import type { BpcGraph, CostConfiguration } from "lib"
import { GraphNetworkTransformerDebugger } from "./GraphNetworkTransformerDebugger"

const initialGraphSimple: BpcGraph = {
  boxes: [{ boxId: "B1", kind: "floating", center: { x: 0, y: 0 } }],
  pins: [
    {
      boxId: "B1",
      pinId: "P1",
      offset: { x: 0, y: 0.5 },
      color: "red",
      networkId: "N1",
    },
  ],
}

const targetGraphSimple: BpcGraph = {
  boxes: [{ boxId: "B1_target", kind: "floating", center: { x: 1, y: 1 } }], // Different boxId and center
  pins: [
    {
      boxId: "B1_target", // Corresponds to B1_target
      pinId: "P1_target", // Different pinId
      offset: { x: 0, y: -0.5 }, // Different offset
      color: "blue", // Different color
      networkId: "N2", // Different networkId
    },
  ],
}

const costConfiguration: Partial<CostConfiguration> = {
  baseOperationCost: 1,
  colorChangeCostMap: {
    "red->blue": 0.5,
    "blue->red": 0.5,
  },
  costPerUnitDistanceMovingPin: 0.1,
}

const GraphNetworkTransformerDebuggerPage = () => {
  return (
    <GraphNetworkTransformerDebugger
      initialGraph={initialGraphSimple}
      targetGraph={targetGraphSimple}
      costConfiguration={costConfiguration}
    />
  )
}

export default GraphNetworkTransformerDebuggerPage
