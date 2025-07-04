import React, { useState, useRef, useCallback } from "react"
import { Trash2, Plus, Play, RotateCcw, Info } from "lucide-react"

type NodeType = { id: string; x: number; y: number; color: string }
type EdgeType = { from: string; to: string }
type Graph = { nodes: NodeType[]; edges: EdgeType[] }

type ColorHistogram = Record<string, number>
type WLResult = {
  iteration: number
  leftColors: ColorHistogram
  rightColors: ColorHistogram
  distance: number
}

const WLDistanceApp = () => {
  const [leftGraph, setLeftGraph] = useState<Graph>({ nodes: [], edges: [] })
  const [rightGraph, setRightGraph] = useState<Graph>({ nodes: [], edges: [] })

  const [selectedColor, setSelectedColor] = useState<string>("#3b82f6")
  const [mode, setMode] = useState<"add" | "connect" | "delete">("add")
  const [connecting, setConnecting] = useState<{
    active: boolean
    from: string | null
    graph: "left" | "right" | null
  }>({ active: false, from: null, graph: null })

  const [wlResults, setWlResults] = useState<WLResult[] | null>(null)
  const [iterations, setIterations] = useState<number>(3)

  const colors = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
    "#f97316",
    "#84cc16",
  ]

  const svgRef = useRef(null)

  // Generate unique ID for nodes
  const generateId = (): string => Math.random().toString(36).substr(2, 9)

  // Add node to graph
  const addNode = (
    graph: Graph,
    setGraph: React.Dispatch<React.SetStateAction<Graph>>,
    x: number,
    y: number,
  ) => {
    const newNode: NodeType = {
      id: generateId(),
      x: x,
      y: y,
      color: selectedColor,
    }
    setGraph((prev) => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }))
  }

  // Remove node and its edges
  const removeNode = (
    graph: Graph,
    setGraph: React.Dispatch<React.SetStateAction<Graph>>,
    nodeId: string,
  ) => {
    setGraph((prev) => ({
      nodes: prev.nodes.filter((n) => n.id !== nodeId),
      edges: prev.edges.filter((e) => e.from !== nodeId && e.to !== nodeId),
    }))
  }

  // Add edge between nodes
  const addEdge = (
    graph: Graph,
    setGraph: React.Dispatch<React.SetStateAction<Graph>>,
    from: string,
    to: string,
  ) => {
    if (from === to) return // No self-loops
    const edgeExists = graph.edges.some(
      (e) =>
        (e.from === from && e.to === to) || (e.from === to && e.to === from),
    )
    if (!edgeExists) {
      setGraph((prev) => ({
        ...prev,
        edges: [...prev.edges, { from, to }],
      }))
    }
  }

  // Change node color
  const changeNodeColor = (
    graph: Graph,
    setGraph: React.Dispatch<React.SetStateAction<Graph>>,
    nodeId: string,
    color: string,
  ) => {
    setGraph((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === nodeId ? { ...n, color } : n)),
    }))
  }

  // Handle SVG click
  const handleSvgClick = (
    e: React.MouseEvent<SVGSVGElement, MouseEvent>,
    graph: Graph,
    setGraph: React.Dispatch<React.SetStateAction<Graph>>,
  ) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (mode === "add") {
      addNode(graph, setGraph, x, y)
    }
  }

  // Handle node click
  const handleNodeClick = (
    e: React.MouseEvent,
    node: NodeType,
    graph: Graph,
    setGraph: React.Dispatch<React.SetStateAction<Graph>>,
    graphType: "left" | "right",
  ) => {
    e.stopPropagation()

    if (mode === "delete") {
      removeNode(graph, setGraph, node.id)
    } else if (mode === "connect") {
      if (!connecting.active) {
        setConnecting({ active: true, from: node.id, graph: graphType })
      } else if (connecting.graph === graphType) {
        addEdge(graph, setGraph, connecting.from!, node.id)
        setConnecting({ active: false, from: null, graph: null })
      } else {
        setConnecting({ active: false, from: null, graph: null })
      }
    }
  }

  // Weisfeiler-Lehman Algorithm
  const computeWL = (graph: Graph, iterations: number): ColorHistogram[] => {
    if (graph.nodes.length === 0) return []

    let nodeLabels: Record<string, string> = {}
    let colorCounts: ColorHistogram[] = []

    // Initialize labels with colors
    graph.nodes.forEach((node) => {
      nodeLabels[node.id] = node.color
    })

    for (let iter = 0; iter < iterations; iter++) {
      // Count current colors
      const currentColors: ColorHistogram = {}
      Object.values(nodeLabels).forEach((color) => {
        currentColors[color] = (currentColors[color] || 0) + 1
      })
      colorCounts.push(currentColors)

      // Update labels based on neighbors
      const newLabels: Record<string, string> = {}
      graph.nodes.forEach((node) => {
        const neighbors = graph.edges
          .filter((e) => e.from === node.id || e.to === node.id)
          .map((e) => (e.from === node.id ? e.to : e.from))

        const neighborColors = neighbors
          .map((nId) => nodeLabels[nId])
          .sort()
          .join(",")

        newLabels[node.id] = `${nodeLabels[node.id]}_${neighborColors}`
      })

      nodeLabels = newLabels
    }

    return colorCounts
  }

  // Jaccard Index
  const computeJaccardDistance = (
    colors1: ColorHistogram,
    colors2: ColorHistogram,
  ): number => {
    const allColors = new Set([
      ...Object.keys(colors1),
      ...Object.keys(colors2),
    ])
    let intersection = 0
    let union = 0

    allColors.forEach((color) => {
      const count1 = colors1[color] || 0
      const count2 = colors2[color] || 0
      intersection += Math.min(count1, count2)
      union += Math.max(count1, count2)
    })

    return union === 0 ? 0 : 1 - intersection / union
  }

  // Compute WL distance
  const computeWLDistance = () => {
    const leftWL = computeWL(leftGraph, iterations)
    const rightWL = computeWL(rightGraph, iterations)

    const distances = []
    const maxLen = Math.max(leftWL.length, rightWL.length)

    for (let i = 0; i < maxLen; i++) {
      const left = leftWL[i] || {}
      const right = rightWL[i] || {}
      const distance = computeJaccardDistance(left, right)
      distances.push({
        iteration: i,
        leftColors: left,
        rightColors: right,
        distance: distance,
      })
    }

    setWlResults(distances)
  }

  // Clear graph
  const clearGraph = (
    setGraph: React.Dispatch<React.SetStateAction<Graph>>,
  ) => {
    setGraph({ nodes: [], edges: [] })
  }

  // Reset connection mode
  const resetConnection = () => {
    setConnecting({ active: false, from: null, graph: null })
  }

  // GraphEditor Component
  interface GraphEditorProps {
    graph: Graph
    setGraph: React.Dispatch<React.SetStateAction<Graph>>
    title: string
    graphType: "left" | "right"
  }

  const GraphEditor: React.FC<GraphEditorProps> = ({
    graph,
    setGraph,
    title,
    graphType,
  }) => (
    <div className="border-2 border-gray-200 rounded-lg p-4 bg-white shadow-lg">
      <h3 className="text-lg font-semibold mb-2 text-gray-800">{title}</h3>
      <svg
        ref={svgRef}
        width="400"
        height="300"
        className="border border-gray-300 rounded cursor-crosshair bg-gray-50"
        onClick={(e) => handleSvgClick(e, graph, setGraph)}
      >
        {/* Edges */}
        {graph.edges.map((edge, idx) => {
          const fromNode = graph.nodes.find((n) => n.id === edge.from)
          const toNode = graph.nodes.find((n) => n.id === edge.to)
          if (!fromNode || !toNode) return null

          return (
            <line
              key={idx}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke="#6b7280"
              strokeWidth="2"
              className="transition-all duration-200"
            />
          )
        })}

        {/* Nodes */}
        {graph.nodes.map((node) => (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r="20"
              fill={node.color}
              stroke={
                connecting.active && connecting.from === node.id
                  ? "#fbbf24"
                  : "#374151"
              }
              strokeWidth={
                connecting.active && connecting.from === node.id ? "3" : "2"
              }
              className="cursor-pointer"
              onClick={(e) =>
                handleNodeClick(e, node, graph, setGraph, graphType)
              }
            />
            <text
              x={node.x}
              y={node.y + 35}
              textAnchor="middle"
              className="text-xs font-medium fill-gray-600 pointer-events-none"
            >
              {node.id.substr(0, 3)}
            </text>
          </g>
        ))}

        {/* Connection line preview */}
        {connecting.active && connecting.graph === graphType && (
          <text x="10" y="20" className="text-sm font-medium fill-orange-600">
            Click another node to connect
          </text>
        )}
      </svg>

      <div className="mt-2 text-sm text-gray-600">
        Nodes: {graph.nodes.length} | Edges: {graph.edges.length}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Weisfeiler-Lehman Distance Calculator
          </h1>
          <p className="text-lg text-gray-600">
            Draw graphs and compute their WL distance using the Jaccard index
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-center">
            {/* Mode Selection */}
            <div className="flex gap-2">
              <button
                onClick={() => setMode("add")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  mode === "add"
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Add Nodes
              </button>
              <button
                onClick={() => setMode("connect")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  mode === "connect"
                    ? "bg-green-500 text-white shadow-lg"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Connect
              </button>
              <button
                onClick={() => setMode("delete")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  mode === "delete"
                    ? "bg-red-500 text-white shadow-lg"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <Trash2 className="w-4 h-4 inline mr-1" />
                Delete
              </button>
            </div>

            {/* Color Picker */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Node Color:
              </span>
              <div className="flex gap-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color
                        ? "border-gray-800 scale-110"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Iterations */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                WL Iterations:
              </span>
              <input
                type="number"
                min="1"
                max="10"
                value={iterations}
                onChange={(e) => setIterations(parseInt(e.target.value))}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
              />
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={computeWLDistance}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-lg"
            >
              <Play className="w-4 h-4 inline mr-2" />
              Compute WL Distance
            </button>
            <button
              onClick={resetConnection}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4 inline mr-2" />
              Reset Connection
            </button>
          </div>
        </div>

        {/* Graph Editors */}
        <div className="flex flex-row gap-6 mb-6 justify-center items-start flex-wrap">
          <div className="space-y-4">
            <GraphEditor
              graph={leftGraph}
              setGraph={setLeftGraph}
              title="Graph A"
              graphType="left"
            />
            <button
              onClick={() => clearGraph(setLeftGraph)}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              Clear Graph A
            </button>
          </div>

          <div className="space-y-4">
            <GraphEditor
              graph={rightGraph}
              setGraph={setRightGraph}
              title="Graph B"
              graphType="right"
            />
            <button
              onClick={() => clearGraph(setRightGraph)}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              Clear Graph B
            </button>
          </div>
        </div>

        {/* Results */}
        {wlResults && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Weisfeiler-Lehman Distance Results
            </h3>

            <div className="space-y-4">
              {wlResults?.map((result, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-700">
                      Iteration {result.iteration}
                    </h4>
                    <div className="text-lg font-bold text-purple-600">
                      Distance: {result.distance.toFixed(4)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded">
                      <h5 className="font-medium text-blue-800 mb-2">
                        Graph A Colors
                      </h5>
                      <div className="space-y-1">
                        {(
                          Object.entries(result.leftColors) as [
                            string,
                            number,
                          ][]
                        ).map(([color, count]) => (
                          <div
                            key={color}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{
                                backgroundColor: color.includes("_")
                                  ? "#9ca3af"
                                  : color,
                              }}
                            />
                            <span className="font-mono text-xs">
                              {color.substr(0, 15)}
                              {color.length > 15 ? "..." : ""}
                            </span>
                            <span className="font-medium">× {count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-green-50 p-3 rounded">
                      <h5 className="font-medium text-green-800 mb-2">
                        Graph B Colors
                      </h5>
                      <div className="space-y-1">
                        {(
                          Object.entries(result.rightColors) as [
                            string,
                            number,
                          ][]
                        ).map(([color, count]) => (
                          <div
                            key={color}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{
                                backgroundColor: color.includes("_")
                                  ? "#9ca3af"
                                  : color,
                              }}
                            />
                            <span className="font-mono text-xs">
                              {color.substr(0, 15)}
                              {color.length > 15 ? "..." : ""}
                            </span>
                            <span className="font-medium">× {count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-purple-600" />
                <h4 className="font-medium text-purple-800">
                  Final WL Distance
                </h4>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {wlResults?.[wlResults.length - 1]?.distance.toFixed(4) ??
                  "N/A"}
              </div>
              <p className="text-sm text-purple-700 mt-1">
                Based on Jaccard distance of color bags after {iterations}{" "}
                iterations
              </p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            How to Use
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Drawing Graphs</h4>
              <ul className="space-y-1">
                <li>• Select "Add Nodes" and click to place nodes</li>
                <li>• Choose node colors from the palette</li>
                <li>• Select "Connect" and click two nodes to link them</li>
                <li>• Use "Delete" mode to remove nodes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Algorithm</h4>
              <ul className="space-y-1">
                <li>• WL iteratively updates node colors based on neighbors</li>
                <li>
                  • Creates "bags of colors" (histograms) at each iteration
                </li>
                <li>• Jaccard distance measures similarity between bags</li>
                <li>• Distance of 0 = identical, 1 = completely different</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WLDistanceApp
