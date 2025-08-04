import { useMemo, useReducer, useState } from "react"
import { RootCircuit } from "tscircuit"
import { SchematicViewer } from "@tscircuit/schematic-viewer"
import { InteractiveGraphics } from "graphics-debug/react"
import { convertCircuitJsonToBpc } from "circuit-json-to-bpc"
import { getGraphicsForBpcGraph } from "lib/index"
import { PinSpacePartitionProcessor } from "lib/partition-processing/PinSpacePartitionProcessor"

export default () => {
  const [runCount, incRunCount] = useReducer((c) => c + 1, 0)
  const [error, setError] = useState<string | null>(null)

  const circuitJson = useMemo(() => {
    const circuit = new RootCircuit()

    circuit.add(
      <board routingDisabled>
        <chip
          name="U1"
          schPinArrangement={{
            rightSide: {
              direction: "top-to-bottom",
              pins: [1, 2, 3, 4, 5, 6],
            },
          }}
          schPinStyle={{
            pin4: {
              marginTop: 0.5,
            },
          }}
        />
      </board>,
    )

    return circuit.getCircuitJson()
  }, [])

  const bpcGraph = useMemo(() => {
    return convertCircuitJsonToBpc(circuitJson, {
      useReadableIds: true,
    })
  }, [circuitJson])

  const graphics = useMemo(
    () =>
      getGraphicsForBpcGraph(bpcGraph, {
        title: "Original BPC Graph",
      }),
    [bpcGraph],
  )

  const pinSpacePartitionProcessor = useMemo(() => {
    return new PinSpacePartitionProcessor({
      inputGraph: bpcGraph,
      minGap: 0.25,
      centerBoxId: "U1",
    })
  }, [bpcGraph])

  return (
    <div>
      <div style={{ paddingLeft: 16, paddingTop: 8 }}>Input</div>
      <div style={{ display: "flex" }}>
        <SchematicViewer
          colorOverrides={{
            schematic: {
              background: "transparent",
            },
          }}
          containerStyle={{
            width: 500,
            height: 600,
          }}
          circuitJson={circuitJson}
        />
        <InteractiveGraphics graphics={graphics} />
      </div>
      <div>
        <div className="mt-2 mb-1 mx-2 flex justify-between">
          <div>Pin Space Partitioning Toolbar</div>
          <div>{pinSpacePartitionProcessor.iteration} iterations</div>
        </div>
        <div className="ml-1">
          <button
            className="py-1 p-2 border border-gray-300 ml-2"
            onClick={() => {
              try {
                pinSpacePartitionProcessor.step()
                incRunCount()
              } catch (e) {
                setError(e instanceof Error ? e.message : "Unknown error")
              }
            }}
          >
            Step
          </button>
        </div>
      </div>
      <InteractiveGraphics graphics={pinSpacePartitionProcessor.visualize()} />
    </div>
  )
}
