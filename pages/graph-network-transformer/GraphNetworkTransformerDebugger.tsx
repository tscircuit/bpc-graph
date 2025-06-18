import type { BpcGraph, CostConfiguration } from "lib"
import { GraphNetworkTransformer } from "lib/graph-network-transformer/GraphNetworkTransformer"
import { getGraphicsForBpcGraph } from "lib/debug/getGraphicsForBpcGraph"
import { InteractiveGraphics } from "graphics-debug/react"
import { useState, useReducer } from "react"
import type { Operation } from "lib/operations/operation-types"

interface GraphNetworkTransformerDebuggerProps {
  initialGraph: BpcGraph
  targetGraph: BpcGraph
  costConfiguration: Partial<CostConfiguration>
}

export const GraphNetworkTransformerDebugger = ({
  initialGraph,
  targetGraph,
  costConfiguration,
}: GraphNetworkTransformerDebuggerProps) => {
  const [transformer, setTransformer] =
    useState<GraphNetworkTransformer | null>(null)
  const [_, forceUpdate] = useReducer((x) => x + 1, 0)

  const handleSolve = () => {
    const newTransformer = new GraphNetworkTransformer({
      initialGraph: JSON.parse(JSON.stringify(initialGraph)), // Use a deep copy
      targetGraph: targetGraph,
      costConfiguration,
    })
    newTransformer.solve()
    setTransformer(newTransformer)
    forceUpdate() // Force re-render to show results
  }

  const finalGraph = transformer?.stats.finalGraph

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <h1>GraphNetworkTransformer Debugger</h1>
      <button onClick={handleSolve} disabled={!!transformer?.solved}>
        {transformer?.solved ? "Solved" : "Solve"}
      </button>

      {transformer && (
        <div>
          <h2>Transformer Stats</h2>
          <p>Solved: {transformer.solved.toString()}</p>
          <p>Failed: {transformer.failed.toString()}</p>
          <p>Error: {transformer.error || "None"}</p>
          <p>Iterations: {transformer.iterations}</p>
          <p>gCost (Actual Cost): {transformer.stats.gCost?.toFixed(2)}</p>
          <h3>Operations:</h3>
          {transformer.stats.finalOperationChain &&
          transformer.stats.finalOperationChain.length > 0 ? (
            <ul
              style={{
                maxHeight: "200px",
                overflowY: "auto",
                border: "1px solid #ccc",
                padding: "10px",
              }}
            >
              {transformer.stats.finalOperationChain.map(
                (op: Operation, index: number) => (
                  <li key={index}>
                    <pre>{JSON.stringify(op, null, 2)}</pre>
                  </li>
                ),
              )}
            </ul>
          ) : (
            <p>No operations performed (or not solved yet).</p>
          )}
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2>Initial Graph</h2>
          <InteractiveGraphics
            graphics={getGraphicsForBpcGraph(initialGraph)}
            height={400}
            width={400}
          />
        </div>
        <div>
          <h2>Target Graph</h2>
          <InteractiveGraphics
            graphics={getGraphicsForBpcGraph(targetGraph)}
            height={400}
            width={400}
          />
        </div>
        {finalGraph && (
          <div>
            <h2>Final Graph (from Transformer)</h2>
            <InteractiveGraphics
              graphics={getGraphicsForBpcGraph(finalGraph)}
              height={400}
              width={400}
            />
          </div>
        )}
      </div>
    </div>
  )
}
