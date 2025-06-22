import { useState } from "react"
import type { BpcGraph, CostConfiguration } from "lib"
import { getHeuristicNetworkSimilarityDistance } from "lib/heuristic-network-similarity/getHeuristicSimilarityDistance"
import corpus from "@tscircuit/schematic-corpus/bpc"

const costConfiguration: Partial<CostConfiguration> = {
  baseOperationCost: 1,
  colorChangeCostMap: {},
  costPerUnitDistanceMovingPin: 0.1,
}

export default function CorpusMatchPage() {
  const [input, setInput] = useState<string>(
    '{\n  "boxes": [],\n  "pins": []\n}',
  )
  const [results, setResults] = useState<
    Array<{ name: string; distance: number }>
  >([])

  const handleMatch = () => {
    let graph: BpcGraph
    try {
      graph = JSON.parse(input)
    } catch (err) {
      alert("Invalid JSON")
      return
    }

    const corpusGraphs = corpus as Record<string, BpcGraph>
    const scores = Object.entries(corpusGraphs).map(([name, g]) => ({
      name,
      distance: getHeuristicNetworkSimilarityDistance(
        graph,
        g,
        costConfiguration as CostConfiguration,
      ).distance,
    }))
    scores.sort((a, b) => a.distance - b.distance)
    setResults(scores)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <textarea
        style={{ width: "600px", height: "200px" }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={handleMatch}>Match</button>
      {results.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Design</th>
              <th>Distance</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.name}>
                <td>{r.name}</td>
                <td>{r.distance.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
