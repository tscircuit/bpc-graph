import type { BpcGraph, CostConfiguration } from "lib"
import { GraphNetworkTransformerDebugger } from "./GraphNetworkTransformerDebugger"

const initialGraphComplex: BpcGraph = {
  boxes: [
    { boxId: "BoxA", kind: "floating", center: { x: 0, y: 0 } },
    { boxId: "BoxB", kind: "floating", center: { x: 5, y: 0 } },
  ],
  pins: [
    // Pins for BoxA
    {
      boxId: "BoxA",
      pinId: "PinA1",
      offset: { x: -1, y: 0 },
      color: "red",
      networkId: "Net1",
    },
    {
      boxId: "BoxA",
      pinId: "PinA2",
      offset: { x: 1, y: 0 },
      color: "green",
      networkId: "Net2",
    },
    // Pin for BoxB
    {
      boxId: "BoxB",
      pinId: "PinB1",
      offset: { x: 0, y: 1 },
      color: "blue",
      networkId: "Net1", // Connected to PinA1
    },
  ],
}

const targetGraphComplex: BpcGraph = {
  boxes: [
    { boxId: "TargetBoxX", kind: "floating", center: { x: 1, y: 1 } }, // Corresponds to BoxA
    { boxId: "TargetBoxY", kind: "floating", center: { x: 6, y: 1 } }, // New box
    // BoxB from initial graph might be removed or transformed
  ],
  pins: [
    // Pins for TargetBoxX (transformed from BoxA)
    {
      boxId: "TargetBoxX",
      pinId: "TargetPinX1", // Transformed from PinA1
      offset: { x: -1, y: 0.5 }, // Moved
      color: "purple", // Color changed
      networkId: "NetAlpha", // Network changed
    },
    // PinA2 from initial graph is removed (not present in target)

    // Pins for TargetBoxY (new box, or transformed from BoxB)
    {
      boxId: "TargetBoxY",
      pinId: "TargetPinY1", // Could be transformed from PinB1 or new
      offset: { x: 0, y: -1 }, // Moved
      color: "orange", // Color changed
      networkId: "NetAlpha", // Now connected to TargetPinX1
    },
    {
      boxId: "TargetBoxY",
      pinId: "TargetPinY2", // New pin
      offset: { x: 1, y: 0 },
      color: "yellow",
      networkId: "NetBeta",
    },
  ],
}

const costConfiguration: Partial<CostConfiguration> = {
  baseOperationCost: 1,
  colorChangeCostMap: {
    "red->purple": 0.5,
    "green->yellow": 0.6, // Example costs
    "blue->orange": 0.4,
  },
  costPerUnitDistanceMovingPin: 0.1,
  // pinHandlingCost could be relevant if RemovePinFromBoxOp was used,
  // but current A* implies pin removal via box removal or transformation.
}

const GraphNetworkTransformerDebuggerPage = () => {
  return (
    <GraphNetworkTransformerDebugger
      initialGraph={initialGraphComplex}
      targetGraph={targetGraphComplex}
      costConfiguration={costConfiguration}
    />
  )
}

export default GraphNetworkTransformerDebuggerPage
