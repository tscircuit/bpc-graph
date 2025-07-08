import corpus from "@tscircuit/schematic-corpus"
import { useEffect, useMemo, useState } from "react"
import { Assignment2Debugger } from "./Assignment2Debugger"
import { runTscircuitCode } from "tscircuit"
import {
  convertCircuitJsonToBpc,
  generateImplicitNetLabels,
} from "circuit-json-to-bpc"
import assignment2_03_circuitJson from "./assignment2_03-circuit.json"

const fixedGraph = corpus.design040

export default function Assignment2Page() {
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
