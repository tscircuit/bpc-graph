import { useState } from "react"
import type { BpcGraph, CostConfiguration } from "lib"
import { getAssignmentCombinationsNetworkSimilarityDistance } from "lib/assignment-combinations-network-similarity/getAssignmentCombinationsNetworkSimilarityDistance"
import { GraphNetworkTransformer } from "lib/graph-network-transformer/GraphNetworkTransformer"
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
  const [inputSvgDataUrl, setInputSvgDataUrl] = useState<string>("")
  const [adaptedMatchSvgDataUrl, setAdaptedMatchSvgDataUrl] =
    useState<string>("")
  const [activeTab, setActiveTab] = useState<"input" | "match" | "adapted">(
    "input",
  )
  const [bestMatch, setBestMatch] = useState<{
    name: string
    graph: BpcGraph
  } | null>(null)
  const [hoverTooltip, setHoverTooltip] = useState<{
    visible: boolean
    x: number
    y: number
    svgDataUrl: string
    currentGraph: BpcGraph | null
  }>({ visible: false, x: 0, y: 0, svgDataUrl: "", currentGraph: null })

  const [matchedSvgDataUrl, setMatchedSvgDataUrl] = useState<string>("")

  // New state for the toggle
  const [ignoreTopMatch, setIgnoreTopMatch] = useState<boolean>(false)

  const updateInputSvg = (graphJson: string) => {
    try {
      const graph = JSON.parse(graphJson)
      const graphics = getGraphicsForBpcGraph(graph)
      const svg = getSvgFromGraphicsObject(graphics, {
        backgroundColor: "white",
      })
      const svgDataUrl = `data:image/svg+xml;base64,${btoa(svg)}`
      setInputSvgDataUrl(svgDataUrl)
    } catch {
      setInputSvgDataUrl("")
    }
  }

  /*  Adapt the matched template so that it becomes functionally identical to
      the input graph.  A GraphNetworkTransformer is used to compute and apply
      the minimal-cost operation chain.  We accept any solution whose discrete
      attributes (boxes / pins / networks / colours) match; absolute box
      centres and pin offsets may differ.                                       */
  const generateAdaptedMatch = (
    inputGraph: BpcGraph,
    templateGraph: BpcGraph,
  ): BpcGraph => {
    try {
      const transformer = new GraphNetworkTransformer({
        initialGraph: templateGraph,
        targetGraph: inputGraph,
        costConfiguration,
      })

      /* Give the solver more breathing room than the default. */
      transformer.MAX_ITERATIONS = 5_000

      transformer.solve()

      if (transformer.solved && transformer.stats.finalGraph) {
        // Perfect adaptation achieved
        return transformer.stats.finalGraph as BpcGraph
      }

      // Solver stopped early – use best candidate explored so far
      if (transformer.lastProcessedCandidate?.graph) {
        return transformer.lastProcessedCandidate.graph
      }

      // Fallback – return the template after initial ID remapping
      return transformer.initialGraph
    } catch (error) {
      console.error("Error generating adapted match:", error)
      return templateGraph
    }
  }

  const handleMatch = () => {
    let graph: BpcGraph
    try {
      graph = JSON.parse(input)
    } catch {
      alert("Invalid JSON")
      return
    }

    updateInputSvg(input)

    const corpusGraphs = corpus as Record<string, BpcGraph>
    const scores = Object.entries(corpusGraphs).map(([name, g]) => ({
      name,
      graph: g,
      distance: getAssignmentCombinationsNetworkSimilarityDistance(
        graph,
        g,
        costConfiguration as CostConfiguration,
      ).distance,
    }))
    scores.sort((a, b) => a.distance - b.distance)
    setResults(scores)

    // Use the toggle to determine which match to use
    let bestTemplate: { name: string; graph: BpcGraph } | undefined
    if (!ignoreTopMatch && scores.length > 0) {
      bestTemplate = scores[0]
    } else if (ignoreTopMatch && scores.length > 1) {
      bestTemplate = scores[1]
    }

    if (bestTemplate) {
      setBestMatch({ name: bestTemplate.name, graph: bestTemplate.graph })

      const matchedGraphics = getGraphicsForBpcGraph(bestTemplate.graph)
      const matchedSvg = getSvgFromGraphicsObject(matchedGraphics, {
        backgroundColor: "white",
      })
      setMatchedSvgDataUrl(`data:image/svg+xml;base64,${btoa(matchedSvg)}`)

      const adaptedGraph = generateAdaptedMatch(graph, bestTemplate.graph)
      const adaptedGraphics = getGraphicsForBpcGraph(adaptedGraph)
      const adaptedSvg = getSvgFromGraphicsObject(adaptedGraphics, {
        backgroundColor: "white",
      })
      const adaptedSvgDataUrl = `data:image/svg+xml;base64,${btoa(adaptedSvg)}`
      setAdaptedMatchSvgDataUrl(adaptedSvgDataUrl)
    } else {
      setBestMatch(null)
      setAdaptedMatchSvgDataUrl("")
      setMatchedSvgDataUrl("")
    }
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

  const loadAndMatch = (graph: BpcGraph) => {
    const graphStr = JSON.stringify(graph, null, 2)
    setInput(graphStr)
    updateInputSvg(graphStr)
    setIgnoreTopMatch(true)

    // Clear previous adapted match and reset to input tab
    setAdaptedMatchSvgDataUrl("")
    setMatchedSvgDataUrl("")
    setBestMatch(null)
    setActiveTab("input")

    // Re-match with the new input
    const corpusGraphs = corpus as Record<string, BpcGraph>
    const scores = Object.entries(corpusGraphs).map(([name, g]) => ({
      name,
      graph: g,
      distance: getAssignmentCombinationsNetworkSimilarityDistance(
        graph,
        g,
        costConfiguration as CostConfiguration,
      ).distance,
    }))
    scores.sort((a, b) => a.distance - b.distance)
    setResults(scores)

    // Use the toggle to determine which match to use
    let bestTemplate: { name: string; graph: BpcGraph } | undefined

    // We always ignore the top match
    if (scores.length > 1) {
      bestTemplate = scores[1]
    }

    if (bestTemplate) {
      setBestMatch({ name: bestTemplate.name, graph: bestTemplate.graph })

      const matchedGraphics = getGraphicsForBpcGraph(bestTemplate.graph)
      const matchedSvg = getSvgFromGraphicsObject(matchedGraphics, {
        backgroundColor: "white",
      })
      setMatchedSvgDataUrl(`data:image/svg+xml;base64,${btoa(matchedSvg)}`)

      const adaptedGraph = generateAdaptedMatch(graph, bestTemplate.graph)
      const adaptedGraphics = getGraphicsForBpcGraph(adaptedGraph)
      const adaptedSvg = getSvgFromGraphicsObject(adaptedGraphics, {
        backgroundColor: "white",
      })
      const adaptedSvgDataUrl = `data:image/svg+xml;base64,${btoa(adaptedSvg)}`
      setAdaptedMatchSvgDataUrl(adaptedSvgDataUrl)
    } else {
      setBestMatch(null)
      setAdaptedMatchSvgDataUrl("")
      setMatchedSvgDataUrl("")
    }
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
      currentGraph: graph,
    })
  }

  const handleMouseLeave = () => {
    setHoverTooltip({
      visible: false,
      x: 0,
      y: 0,
      svgDataUrl: "",
      currentGraph: null,
    })
  }

  const handleMouseMove = (graph: BpcGraph, event: React.MouseEvent) => {
    if (hoverTooltip.visible) {
      // Check if we're hovering over a different graph
      if (hoverTooltip.currentGraph !== graph) {
        const graphics = getGraphicsForBpcGraph(graph)
        const svg = getSvgFromGraphicsObject(graphics, {
          backgroundColor: "white",
        })
        const svgDataUrl = `data:image/svg+xml;base64,${btoa(svg)}`

        setHoverTooltip({
          visible: true,
          x: event.clientX,
          y: event.clientY,
          svgDataUrl,
          currentGraph: graph,
        })
      } else {
        // Same graph, just update position
        setHoverTooltip({
          ...hoverTooltip,
          x: event.clientX,
          y: event.clientY,
        })
      }
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
        <textarea
          style={{ width: "600px", height: "200px" }}
          value={input}
          onChange={(e) => {
            setInput((e.target as HTMLTextAreaElement).value)
            updateInputSvg((e.target as HTMLTextAreaElement).value)
          }}
        />
        {(inputSvgDataUrl || adaptedMatchSvgDataUrl) && (
          <div style={{ border: "1px solid #ccc", minWidth: "300px" }}>
            <div style={{ display: "flex", borderBottom: "1px solid #ccc" }}>
              <button
                onClick={() => setActiveTab("input")}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  backgroundColor: activeTab === "input" ? "#e0e0e0" : "white",
                  cursor: "pointer",
                  borderRight: "1px solid #ccc",
                }}
              >
                Input
              </button>
              <button
                onClick={() => setActiveTab("match")}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  backgroundColor: activeTab === "match" ? "#e0e0e0" : "white",
                  cursor: "pointer",
                  borderRight: "1px solid #ccc",
                }}
                disabled={!matchedSvgDataUrl}
              >
                Match
              </button>
              <button
                onClick={() => setActiveTab("adapted")}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  backgroundColor:
                    activeTab === "adapted" ? "#e0e0e0" : "white",
                  cursor: "pointer",
                }}
                disabled={!adaptedMatchSvgDataUrl}
              >
                Adapted
              </button>
            </div>
            <div style={{ padding: "10px" }}>
              {activeTab === "input" && inputSvgDataUrl && (
                <img
                  src={inputSvgDataUrl}
                  alt="Input BPC Graph Preview"
                  style={{ maxWidth: "280px", maxHeight: "200px" }}
                />
              )}
              {activeTab === "match" && matchedSvgDataUrl && (
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginBottom: "5px",
                    }}
                  >
                    Matched Template: {bestMatch?.name}
                  </div>
                  <img
                    src={matchedSvgDataUrl}
                    alt="Matched Template Preview"
                    style={{ maxWidth: "280px", maxHeight: "200px" }}
                  />
                </div>
              )}
              {activeTab === "adapted" && adaptedMatchSvgDataUrl && (
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginBottom: "5px",
                    }}
                  >
                    Adapted Match: {bestMatch?.name}
                  </div>
                  <img
                    src={adaptedMatchSvgDataUrl}
                    alt="Adapted Match Preview"
                    style={{ maxWidth: "280px", maxHeight: "200px" }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Toggle for Ignore Top Match */}
      <div style={{ margin: "8px 0" }}>
        <label style={{ cursor: "pointer", userSelect: "none" }}>
          <input
            type="checkbox"
            checked={ignoreTopMatch}
            onChange={() => setIgnoreTopMatch((v) => !v)}
            style={{ marginRight: "6px" }}
          />
          Ignore Top Match
        </label>
      </div>
      <button onClick={handleMatch}>Match</button>
      {results.length > 0 && (
        <table style={{ borderCollapse: "collapse", border: "1px solid #ccc" }}>
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  border: "1px solid #ccc",
                  padding: "8px",
                }}
              >
                Design
              </th>
              <th
                style={{
                  textAlign: "left",
                  border: "1px solid #ccc",
                  padding: "8px",
                }}
              >
                Distance
              </th>
              <th
                style={{
                  textAlign: "left",
                  border: "1px solid #ccc",
                  padding: "8px",
                }}
              ></th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.name}>
                <td
                  onMouseEnter={(e) => handleMouseEnter(r.graph, e)}
                  onMouseLeave={handleMouseLeave}
                  onMouseMove={(e) => handleMouseMove(r.graph, e)}
                  style={{
                    cursor: "pointer",
                    border: "1px solid #ccc",
                    padding: "8px",
                  }}
                >
                  {r.name}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {r.distance.toFixed(2)}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  <button
                    onClick={() => downloadJson(r.graph, r.name)}
                    style={{ cursor: "pointer", marginRight: "5px" }}
                  >
                    JSON
                  </button>
                  <button
                    onClick={() => loadAndMatch(r.graph)}
                    style={{ cursor: "pointer" }}
                  >
                    Match
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
