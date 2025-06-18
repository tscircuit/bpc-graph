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
    // Always create a new transformer for a fresh solve
    const newTransformer = new GraphNetworkTransformer({
      initialGraph: initialGraph, // Constructor handles deep copy
      targetGraph: targetGraph,
      costConfiguration,
    })
    newTransformer.solve()
    setTransformer(newTransformer)
    forceUpdate()
  }

  const handleStep = () => {
    let currentTransformer = transformer
    if (
      !currentTransformer ||
      currentTransformer.solved ||
      currentTransformer.failed
    ) {
      currentTransformer = new GraphNetworkTransformer({
        initialGraph: initialGraph, // Constructor handles deep copy
        targetGraph: targetGraph,
        costConfiguration,
      })
      // The constructor already initializes the first candidate.
    }
    currentTransformer.step()
    setTransformer(currentTransformer) // Ensure the state holds the potentially new/updated transformer
    forceUpdate()
  }

  const finalGraph = transformer?.stats.finalGraph

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <h1>GraphNetworkTransformer Debugger</h1>
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={handleSolve}
          disabled={transformer?.solved && !transformer.failed}
        >
          {transformer?.solved && !transformer.failed ? "Solved" : "Solve"}
        </button>
        <button
          onClick={handleStep}
          disabled={transformer?.solved || transformer?.failed}
        >
          Step
        </button>
      </div>

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

      {transformer && transformer.candidates && (
        <div>
          <h2>
            Open Candidates (Sorted by fCost, Count:{" "}
            {transformer.candidates.length})
          </h2>
          {transformer.candidates.length > 0 ? (
            <ul
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                border: "1px solid #ccc",
                padding: "10px",
                listStyleType: "none",
              }}
            >
              {transformer.candidates
                .slice() // Create a copy before sorting for display
                .sort((a, b) => a.fCost - b.fCost)
                .map((candidate, index) => (
                  <li
                    key={index}
                    style={{
                      borderBottom: "1px solid #eee",
                      paddingBottom: "5px",
                      marginBottom: "5px",
                    }}
                  >
                    <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                      Candidate {index + 1}:<br />
                      fCost: {candidate.fCost.toFixed(2)}, gCost:{" "}
                      {candidate.gCost.toFixed(2)}, hCost:{" "}
                      {candidate.hCost.toFixed(2)}
                      <br />
                      Operations Count: {candidate.operationChain.length}
                      <br />
                      Last Op:{" "}
                      {candidate.operationChain.length > 0
                        ? candidate.operationChain[
                            candidate.operationChain.length - 1
                          ].operation_type
                        : "Initial State"}
                    </pre>
                  </li>
                ))}
            </ul>
          ) : (
            <p>No candidates in the open set.</p>
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
        {transformer?.lastProcessedCandidate?.graph && (
          <div>
            <h2>Last Processed Candidate Graph</h2>
            {transformer.lastProcessedCandidate.operationChain.length > 0 && (
              <pre style={{ fontSize: "0.8em", maxHeight: "100px", overflowY: "auto", border: "1px solid #ddd", padding: "5px" }}>
                Last Op: {JSON.stringify(transformer.lastProcessedCandidate.operationChain[transformer.lastProcessedCandidate.operationChain.length - 1], null, 2)}
              </pre>
            )}
            <InteractiveGraphics
              graphics={getGraphicsForBpcGraph(
                transformer.lastProcessedCandidate.graph,
              )}
              height={400}
              width={400}
            />
          </div>
        )}
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
