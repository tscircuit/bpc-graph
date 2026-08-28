import { convertCircuitJsonToBpc } from "circuit-json-to-bpc"
import { getExampleCircuitJson } from "./ExampleCircuit"
import { PinRangeGenerator } from "lib/pin-range-processing/PinRangeGenerator"
import { createPinRangePartition } from "lib/pin-range-processing/createPinRangePartition"
import { getGraphicsForBpcGraph } from "lib/debug/getGraphicsForBpcGraph"
import { getSvgFromGraphicsObject } from "graphics-debug"
import { convertCircuitJsonToSchematicSvg } from "circuit-to-svg"
import { useState, useMemo } from "react"
import type { PinRange, BpcGraph } from "lib/types"

export default function PinRangeVisualizationPage() {
  const [selectedRangeIndex, setSelectedRangeIndex] = useState<number>(0)

  const { bpcGraph, circuitSvg, allRanges, selectedRange, selectedPartition } =
    useMemo(() => {
      // Convert the example circuit to BPC graph
      const circuitJson = getExampleCircuitJson()
      const bpcGraph = convertCircuitJsonToBpc(circuitJson, {
        useReadableIds: true,
      })

      // Generate pin ranges
      const generator = new PinRangeGenerator(bpcGraph)
      const allRanges: PinRange[] = []
      let range: PinRange | null
      while ((range = generator.next())) {
        allRanges.push(range)
      }

      // Get selected range and its partition
      const selectedRange = allRanges[selectedRangeIndex] || null
      const selectedPartition = selectedRange
        ? createPinRangePartition(bpcGraph, [selectedRange])
        : null

      // Convert original circuit to SVG for reference
      let circuitSvg = ""
      try {
        circuitSvg = convertCircuitJsonToSchematicSvg(circuitJson)
      } catch (error) {
        console.warn("Could not generate circuit SVG:", error)
      }

      return {
        bpcGraph,
        circuitSvg,
        allRanges,
        selectedRange,
        selectedPartition,
      }
    }, [selectedRangeIndex])

  const bpcGraphSvg = useMemo(() => {
    try {
      const graphics = getGraphicsForBpcGraph(bpcGraph, {
        title: "Original BPC Graph",
      })
      return getSvgFromGraphicsObject(graphics)
    } catch (error) {
      console.warn("Could not generate BPC graph SVG:", error)
      return ""
    }
  }, [bpcGraph])

  const highlightedBpcGraphSvg = useMemo(() => {
    if (!selectedPartition || !selectedRange) return bpcGraphSvg

    try {
      // Create a copy of the BPC graph and highlight the selected pins
      const highlightedGraph = {
        ...bpcGraph,
        pins: bpcGraph.pins.map((pin) => {
          const isInPartition = selectedPartition.graph.pins.some(
            (p) => p.boxId === pin.boxId && p.pinId === pin.pinId,
          )
          return {
            ...pin,
            color: isInPartition ? "highlighted_" + pin.color : pin.color,
          }
        }),
      }

      const graphics = getGraphicsForBpcGraph(highlightedGraph, {
        title: `BPC Graph - Highlighting Range ${selectedRange.boxId}[${selectedRange.startPinIndex}:${selectedRange.endPinIndex})`,
      })

      // Add highlighting rectangles for selected pins
      selectedPartition.graph.pins.forEach((pin) => {
        try {
          // This is a simplified approach - in a real implementation you'd need to calculate pin positions
          graphics.rects.push({
            center: { x: 0, y: 0 }, // Would need proper position calculation
            width: 0.3,
            height: 0.3,
            fill: "rgba(255, 255, 0, 0.5)", // Yellow highlight
          })
        } catch (e) {
          // Ignore positioning errors for now
        }
      })

      return getSvgFromGraphicsObject(graphics)
    } catch (error) {
      console.warn("Could not generate highlighted BPC graph SVG:", error)
      return bpcGraphSvg
    }
  }, [bpcGraph, bpcGraphSvg, selectedPartition, selectedRange])

  const partitionSvg = useMemo(() => {
    if (!selectedPartition) return ""
    try {
      const graphics = getGraphicsForBpcGraph(selectedPartition.graph, {
        title: `Pin Range Partition - ${selectedRange?.boxId}[${selectedRange?.startPinIndex}:${selectedRange?.endPinIndex})`,
      })
      return getSvgFromGraphicsObject(graphics)
    } catch (error) {
      console.warn("Could not generate partition SVG:", error)
      return ""
    }
  }, [selectedPartition, selectedRange])

  // Group ranges by box for better organization
  const rangesByBox = useMemo(() => {
    const grouped: Record<string, PinRange[]> = {}
    allRanges.forEach((range) => {
      if (!grouped[range.boxId]) {
        grouped[range.boxId] = []
      }
      grouped[range.boxId]!.push(range)
    })
    return grouped
  }, [allRanges])

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Pin Range Processing Visualization</h1>

      <div style={{ marginBottom: "20px" }}>
        <p>
          This page demonstrates the pin range-based approach to schematic
          layout. The circuit is broken down into small pin ranges (1-3 pins)
          that can be matched against a corpus of patterns.
        </p>
      </div>

      {/* Controls */}
      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          border: "1px solid #ccc",
          backgroundColor: "#f9f9f9",
        }}
      >
        <h3>Select Pin Range to Visualize:</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "10px",
          }}
        >
          {Object.entries(rangesByBox).map(([boxId, ranges]) => (
            <div
              key={boxId}
              style={{ border: "1px solid #ddd", padding: "10px" }}
            >
              <h4>{boxId}</h4>
              {ranges.map((range, idx) => {
                const globalIndex = allRanges.indexOf(range)
                const rangeSize = range.endPinIndex - range.startPinIndex
                return (
                  <div key={globalIndex} style={{ marginBottom: "5px" }}>
                    <label>
                      <input
                        type="radio"
                        name="selectedRange"
                        checked={selectedRangeIndex === globalIndex}
                        onChange={() => setSelectedRangeIndex(globalIndex)}
                        style={{ marginRight: "5px" }}
                      />
                      Range [{range.startPinIndex}:{range.endPinIndex}) -{" "}
                      {rangeSize} pin{rangeSize !== 1 ? "s" : ""}
                    </label>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          border: "1px solid #ccc",
          backgroundColor: "#f0f8ff",
        }}
      >
        <h3>Statistics:</h3>
        <ul>
          <li>Total pin ranges generated: {allRanges.length}</li>
          <li>Number of boxes: {Object.keys(rangesByBox).length}</li>
          <li>
            Selected range:{" "}
            {selectedRange
              ? `${selectedRange.boxId}[${selectedRange.startPinIndex}:${selectedRange.endPinIndex})`
              : "None"}
          </li>
          <li>
            Selected partition pins: {selectedPartition?.graph.pins.length || 0}
          </li>
          <li>
            Selected partition boxes:{" "}
            {selectedPartition?.graph.boxes.length || 0}
          </li>
        </ul>
      </div>

      {/* Visualizations */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        {/* Original Circuit */}
        <div>
          <h3>Original Circuit Schematic</h3>
          <div
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              minHeight: "400px",
            }}
          >
            {circuitSvg ? (
              <div dangerouslySetInnerHTML={{ __html: circuitSvg }} />
            ) : (
              <p>Circuit SVG not available</p>
            )}
          </div>
        </div>

        {/* BPC Graph */}
        <div>
          <h3>BPC Graph with Highlighted Range</h3>
          <div
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              minHeight: "400px",
            }}
          >
            {highlightedBpcGraphSvg ? (
              <div
                dangerouslySetInnerHTML={{ __html: highlightedBpcGraphSvg }}
              />
            ) : (
              <p>BPC Graph SVG not available</p>
            )}
          </div>
          {selectedRange && (
            <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
              Highlighted: {selectedRange.boxId} pins [
              {selectedRange.startPinIndex}:{selectedRange.endPinIndex})
            </p>
          )}
        </div>

        {/* Selected Partition */}
        <div style={{ gridColumn: "1 / -1" }}>
          <h3>Selected Pin Range Partition</h3>
          <div
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              minHeight: "300px",
            }}
          >
            {partitionSvg ? (
              <div dangerouslySetInnerHTML={{ __html: partitionSvg }} />
            ) : (
              <p>
                {selectedRange
                  ? "Partition SVG not available"
                  : "No range selected"}
              </p>
            )}
          </div>
          {selectedPartition && (
            <div style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
              <p>
                <strong>Partition Details:</strong>
              </p>
              <p>
                Boxes:{" "}
                {selectedPartition.graph.boxes.map((b) => b.boxId).join(", ")}
              </p>
              <p>
                Pins:{" "}
                {selectedPartition.graph.pins
                  .map((p) => `${p.boxId}.${p.pinId}`)
                  .join(", ")}
              </p>
              <p>
                Networks:{" "}
                {[
                  ...new Set(
                    selectedPartition.graph.pins.map((p) => p.networkId),
                  ),
                ].join(", ")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Raw Data */}
      <details style={{ marginTop: "20px" }}>
        <summary>Raw Data (for debugging)</summary>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginTop: "10px",
          }}
        >
          <div>
            <h4>All Pin Ranges:</h4>
            <pre
              style={{
                fontSize: "10px",
                background: "#f5f5f5",
                padding: "10px",
                overflow: "auto",
                maxHeight: "300px",
              }}
            >
              {JSON.stringify(allRanges, null, 2)}
            </pre>
          </div>
          <div>
            <h4>Selected Partition Graph:</h4>
            <pre
              style={{
                fontSize: "10px",
                background: "#f5f5f5",
                padding: "10px",
                overflow: "auto",
                maxHeight: "300px",
              }}
            >
              {selectedPartition
                ? JSON.stringify(selectedPartition.graph, null, 2)
                : "No partition selected"}
            </pre>
          </div>
        </div>
      </details>
    </div>
  )
}
