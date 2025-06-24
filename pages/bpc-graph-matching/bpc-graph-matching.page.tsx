import { useState } from "react"
import type { BpcGraph, CostConfiguration } from "lib"
import { getHeuristicNetworkSimilarityDistance } from "lib/heuristic-network-similarity/getHeuristicSimilarityDistance"
import { getGraphicsForBpcGraph } from "lib/debug/getGraphicsForBpcGraph"
import { InteractiveGraphics } from "graphics-debug/react"
import corpus from "@tscircuit/schematic-corpus/dist/bundled-bpc-graphs.json"

const costConfiguration: Partial<CostConfiguration> = {
  baseOperationCost: 1,
  colorChangeCostMap: {},
  costPerUnitDistanceMovingPin: 0.1,
}

interface MatchResult {
  name: string
  distance: number
  graph: BpcGraph
}

export default function BpcGraphMatchingPage() {
  const [input, setInput] = useState<string>(
    '{\n  "boxes": [],\n  "pins": []\n}',
  )
  const [results, setResults] = useState<MatchResult[]>([])
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [inputGraph, setInputGraph] = useState<BpcGraph | null>(null)

  const handleMatch = () => {
    let graph: BpcGraph
    try {
      graph = JSON.parse(input)
      setInputGraph(graph)
    } catch (err) {
      alert("Invalid JSON")
      return
    }

    const corpusGraphs = corpus as Record<string, BpcGraph>
    const scores = Object.entries(corpusGraphs).map(([name, g]) => ({
      name,
      graph: g,
      distance: getHeuristicNetworkSimilarityDistance(
        graph,
        g,
        costConfiguration as CostConfiguration,
      ).distance,
    }))
    scores.sort((a, b) => a.distance - b.distance)
    setResults(scores)
    setExpandedRow(null) // Close any expanded rows when new results come in
  }

  const toggleRow = (name: string) => {
    setExpandedRow(expandedRow === name ? null : name)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <h1>BPC Graph Matching</h1>
      
      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <textarea
            style={{ width: "600px", height: "200px" }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter BPC graph JSON..."
          />
          <button onClick={handleMatch}>Match</button>
        </div>
        
        {inputGraph && (
          <div style={{ minWidth: "300px" }}>
            <h3>Input Graph Preview</h3>
            <div style={{ border: "1px solid #ccc", padding: "10px" }}>
              <InteractiveGraphics graphics={getGraphicsForBpcGraph(inputGraph)} />
            </div>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: "8px", textAlign: "left" }}>
                  Design
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px", textAlign: "left" }}>
                  Distance
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px", textAlign: "center" }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <>
                  <tr key={r.name} style={{ cursor: "pointer" }}>
                    <td 
                      style={{ border: "1px solid #ccc", padding: "8px" }}
                      onClick={() => toggleRow(r.name)}
                    >
                      {r.name}
                    </td>
                    <td 
                      style={{ border: "1px solid #ccc", padding: "8px" }}
                      onClick={() => toggleRow(r.name)}
                    >
                      {r.distance.toFixed(2)}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "8px", textAlign: "center" }}>
                      <button 
                        onClick={() => toggleRow(r.name)}
                        style={{ 
                          background: "none", 
                          border: "1px solid #ccc", 
                          padding: "4px 8px",
                          cursor: "pointer"
                        }}
                      >
                        {expandedRow === r.name ? "▼" : "▶"}
                      </button>
                    </td>
                  </tr>
                  {expandedRow === r.name && (
                    <tr>
                      <td 
                        colSpan={3} 
                        style={{ 
                          border: "1px solid #ccc", 
                          padding: "20px",
                          backgroundColor: "#f9f9f9"
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          <h4>{r.name} - Interactive View</h4>
                          <div style={{ 
                            border: "1px solid #ddd", 
                            padding: "15px",
                            backgroundColor: "white",
                            borderRadius: "4px"
                          }}>
                            <InteractiveGraphics graphics={getGraphicsForBpcGraph(r.graph)} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}