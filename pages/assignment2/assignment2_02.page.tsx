import corpus from "@tscircuit/schematic-corpus"
import { useEffect, useMemo, useState } from "react"
import { Assignment2Debugger } from "./Assignment2Debugger"
import { runTscircuitCode } from "tscircuit"
import {
  convertCircuitJsonToBpc,
  generateImplicitNetLabels,
} from "circuit-json-to-bpc"

const fixedGraph = corpus.design040

export const tscircuitCode = `
export default () => (
  <board width="10mm" height="10mm" routingDisabled>
    <resistor name="R1" schX={-2} resistance="1k" connections={{pin1: "net.VCC"}} />
    <capacitor name="C1" schX={2} capacitance="10uF" connections={{pin2: "net.GND"}} />
    <trace from=".R1 > .pin2" to=".C1 > .pin1" />
  </board>
)
  `

export default function Assignment2Page() {
  const [floatingGraph, setFloatingGraph] = useState(null)

  useEffect(() => {
    const run = async () => {
      const circuitJson = await runTscircuitCode(tscircuitCode)
      const circuitJsonWithImpliedNetLabels = circuitJson.concat(
        generateImplicitNetLabels(circuitJson),
      )
      setFloatingGraph(
        convertCircuitJsonToBpc(circuitJsonWithImpliedNetLabels) as any,
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
