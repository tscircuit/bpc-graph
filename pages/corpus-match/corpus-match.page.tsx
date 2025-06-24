import { useState } from "react"
import type { BpcGraph, CostConfiguration } from "lib"
import { getHeuristicNetworkSimilarityDistance } from "lib/heuristic-network-similarity/getHeuristicSimilarityDistance"
import { getGraphicsForBpcGraph } from "lib/debug/getGraphicsForBpcGraph"
import { getSvgFromGraphicsObject } from "graphics-debug"
import corpus from "@tscircuit/schematic-corpus/dist/bundled-bpc-graphs.json"

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
    Array<{ name: string; distance: number; graph: BpcGraph }>
  >([])
  const [hoverTooltip, setHoverTooltip] = useState<{
    visible: boolean
    x: number
    y: number
    svgDataUrl: string
  }>({ visible: false, x: 0, y: 0, svgDataUrl: "" })

  const handleMatch = () => {
    let graph: BpcGraph
    try {
      graph = JSON.parse(input)
    } catch {
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
  }

  const downloadJson = (graph: BpcGraph, name: string) => {
    const dataStr = JSON.stringify(graph, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${name}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleMouseEnter = (graph: BpcGraph, event: React.MouseEvent) => {
    const graphics = getGraphicsForBpcGraph(graph)
    const svg = getSvgFromGraphicsObject(graphics, { backgroundColor: "white" })
    const svgDataUrl = `data:image/svg+xml;base64,${btoa(svg)}`
    
    setHoverTooltip({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      svgDataUrl,
    })
  }

  const handleMouseLeave = () => {
    setHoverTooltip({ ...hoverTooltip, visible: false })
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (hoverTooltip.visible) {
      setHoverTooltip({
        ...hoverTooltip,
        x: event.clientX,
        y: event.clientY,
      })
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <textarea
        style={{ width: "600px", height: "200px" }}
        value={input}
        onChange={(e) => setInput(e.currentTarget.value)}
      />
      <button onClick={handleMatch}>Match</button>
      {results.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Design</th>
              <th>Distance</th>
              <th>JSON</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.name}>
                <td
                  onMouseEnter={(e) => handleMouseEnter(r.graph, e)}
                  onMouseLeave={handleMouseLeave}
                  onMouseMove={handleMouseMove}
                  style={{ cursor: "pointer" }}
                >
                  {r.name}
                </td>
                <td>{r.distance.toFixed(2)}</td>
                <td>
                  <button
                    onClick={() => downloadJson(r.graph, r.name)}
                    style={{ cursor: "pointer" }}
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {hoverTooltip.visible && (
        <div
          style={{
            position: "fixed",
            left: hoverTooltip.x + 10,
            top: hoverTooltip.y + 10,
            zIndex: 1000,
            pointerEvents: "none",
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <img
            src={hoverTooltip.svgDataUrl}
            alt="BPC Graph Preview"
            style={{ maxWidth: "300px", maxHeight: "200px" }}
          />
        </div>
      )}
    </div>
  )
}
