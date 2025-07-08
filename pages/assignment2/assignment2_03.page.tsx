import corpus from "@tscircuit/schematic-corpus"
import { useEffect, useState } from "react"
import { Assignment2Debugger } from "./Assignment2Debugger"
import { runTscircuitCode } from "tscircuit"
import {
  convertCircuitJsonToBpc,
  generateImplicitNetLabels,
} from "circuit-json-to-bpc"

const fixedGraph = corpus.design001

export const tscircuitCode = `
import { sel } from "tscircuit"
export default () => (
  <board routingDisabled>
    <group schX={5}>
      <chip
        name="U1"
        manufacturerPartNumber="I2C_SENSOR"
        footprint="soic4"
        pinLabels={{
          pin1: "SCL",
          pin2: "SDA",
          pin3: "VCC",
          pin4: "GND",
        }}
        schPinArrangement={{
          rightSide: {
            direction: "top-to-bottom",
            pins: ["SCL", "SDA", "VCC", "GND"],
          },
        }}
        connections={{
          SCL: sel.net.SCL,
          SDA: sel.net.SDA,
          VCC: sel.net.V3_3,
          GND: sel.net.GND,
        }}
      />
    </group>
  </board>
)
`

export default function Assignment2_03() {
  const [floatingGraph, setFloatingGraph] = useState(null)

  useEffect(() => {
    const run = async () => {
      const circuitJson = await runTscircuitCode(tscircuitCode)
      const circuitJsonWithImpliedNetLabels = circuitJson.concat(
        generateImplicitNetLabels(circuitJson),
      )
      setFloatingGraph(
        convertCircuitJsonToBpc(circuitJsonWithImpliedNetLabels, {
          useReadableIds: true,
        }) as any,
      )
    }
    run()
  }, [])

  if (!floatingGraph) {
    return <div>Loading...</div>
  }

  return (
    <Assignment2Debugger
      floatingGraph={floatingGraph!}
      fixedGraph={fixedGraph!}
    />
  )
}
