import { useState } from "react"
import { runTscircuitCode } from "tscircuit"
import { convertCircuitJsonToBpc } from "circuit-json-to-bpc"
import { convertCircuitJsonToSchematicSvg } from "circuit-to-svg"
import { getSvgFromGraphicsObject } from "graphics-debug"
import { debugLayout } from "tests/fixtures/debugLayout"
import { corpusNoNetLabel } from "@tscircuit/schematic-corpus"

export default function InteractiveSchematicLayoutPage() {
  const [tscircuitCode, setTscircuitCode] = useState(`export default () => (
  <board width="10mm" height="10mm" routingDisabled>
    <chip
      name="U1"
      schPinArrangement={{
        leftSide: { direction: "top-to-bottom", pins: [1, 2] },
        rightSide: { direction: "top-to-bottom", pins: [4, 3] },
      }}
      schPinStyle={{
        pin2: { marginTop: 1.2 },
        pin3: { marginTop: 1.2 }
      }}
    />
    <capacitor capacitance="1uF" name="C1" schX={1} schRotation="-90deg" />
    
    <netlabel schX={-1} schY={1} net="V3_3" anchorSide="bottom" connectsTo="U1.pin1" />
    <netlabel schX={-1} schY={-1} net="GND" anchorSide="top" connectsTo="U1.pin2" />
    <netlabel schX={1} schY={1} net="V3_3" anchorSide="bottom" connectsTo={["U1.pin4", "C1.pin1"]} />
    <netlabel schX={1} schY={-1} net="GND" anchorSide="top" connectsTo={["U1.pin3", "C1.pin2"]} />
  </board>
)`)

  const [layoutResult, setLayoutResult] = useState<any>(null)
  const [circuitJson, setCircuitJson] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runLayout = async () => {
    setLoading(true)
    setError(null)
    try {
      const circuitJson = await runTscircuitCode(tscircuitCode)
      setCircuitJson(circuitJson)
      const circuitJsonNoNetLabels = circuitJson.filter(
        (elm) => elm.type !== "schematic_net_label",
      )
      const bpcGraph = convertCircuitJsonToBpc(circuitJsonNoNetLabels)
      const result = debugLayout(bpcGraph, {
        corpus: corpusNoNetLabel,
      })
      setLayoutResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Interactive Schematic Layout Debugger</h1>

      <div style={{ marginBottom: "20px" }}>
        <h2>1. Input TSCircuit Code</h2>
        <textarea
          value={tscircuitCode}
          onChange={(e) => setTscircuitCode(e.target.value)}
          style={{
            width: "100%",
            height: "300px",
            fontFamily: "monospace",
            fontSize: "12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "8px",
          }}
        />
        <button
          onClick={runLayout}
          disabled={loading}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            backgroundColor: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Processing..." : "Run Layout Debug"}
        </button>
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: "20px" }}>Error: {error}</div>
      )}

      {layoutResult && (
        <div>
          <h2>2. Layout Process Steps</h2>

          <div style={{ marginBottom: "30px" }}>
            <h3>Step 1: Input Circuit</h3>
            <p>
              The original circuit from the TSCircuit code before any layout
              processing.
            </p>
            {circuitJson && (
              <div
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  display: "inline-block",
                }}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: convertCircuitJsonToSchematicSvg(circuitJson),
                  }}
                />
              </div>
            )}
          </div>

          <div style={{ marginBottom: "30px" }}>
            <details>
              <summary
                style={{
                  cursor: "pointer",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                Step 2: Partition Iteration Process
              </summary>
              <p>
                Shows the iterative process of partitioning the graph until
                convergence.
              </p>
              {layoutResult.partitionIterationGraphics.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                    marginTop: "10px",
                  }}
                >
                  {layoutResult.partitionIterationGraphics
                    .slice(0, 10)
                    .map((graphics: any, idx: number) => (
                      <div
                        key={idx}
                        style={{ border: "1px solid #ccc", padding: "10px" }}
                      >
                        <h4>Iteration {idx + 1}</h4>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: getSvgFromGraphicsObject(graphics, {
                              backgroundColor: "white",
                              svgWidth: 200,
                              svgHeight: 150,
                            }),
                          }}
                        />
                      </div>
                    ))}
                </div>
              )}
            </details>
          </div>

          <div style={{ marginBottom: "30px" }}>
            <h3>Step 3: Graph Partitioning</h3>
            <p>
              The input graph is partitioned into smaller subgraphs that can be
              processed independently.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {layoutResult.partitionGraphics.map(
                (graphics: any, idx: number) => (
                  <div
                    key={idx}
                    style={{ border: "1px solid #ccc", padding: "10px" }}
                  >
                    <h4>Partition {idx + 1}</h4>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: getSvgFromGraphicsObject(graphics, {
                          backgroundColor: "white",
                          svgWidth: 300,
                          svgHeight: 200,
                        }),
                      }}
                    />
                  </div>
                ),
              )}
            </div>
          </div>

          <div style={{ marginBottom: "30px" }}>
            <h3>Step 4: Corpus Matching</h3>
            <p>
              Each partition is matched against a corpus of known patterns to
              find the best layout template.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {layoutResult.matchedCorpusGraphGraphics.map(
                (graphics: any, idx: number) => (
                  <div
                    key={idx}
                    style={{ border: "1px solid #ccc", padding: "10px" }}
                  >
                    <h4>Matched Template {idx + 1}</h4>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: getSvgFromGraphicsObject(graphics, {
                          backgroundColor: "white",
                          svgWidth: 300,
                          svgHeight: 200,
                        }),
                      }}
                    />
                  </div>
                ),
              )}
            </div>
          </div>

          <div style={{ marginBottom: "30px" }}>
            <h3>Step 5: Net Adaptation</h3>
            <p>
              The partitions are adapted to match the corpus templates,
              adjusting pin positions and connections.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {layoutResult.adaptedGraphGraphics.map(
                (graphics: any, idx: number) => (
                  <div
                    key={idx}
                    style={{ border: "1px solid #ccc", padding: "10px" }}
                  >
                    <h4>Adapted Graph {idx + 1}</h4>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: getSvgFromGraphicsObject(graphics, {
                          backgroundColor: "white",
                          svgWidth: 300,
                          svgHeight: 200,
                        }),
                      }}
                    />
                  </div>
                ),
              )}
            </div>
          </div>

          <div style={{ marginBottom: "30px" }}>
            <h3>Step 6: Final Merged Layout</h3>
            <p>
              The final result after merging all adapted partitions back
              together.
            </p>
            <div
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                display: "inline-block",
              }}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: getSvgFromGraphicsObject(
                    layoutResult.laidOutGraphGraphics,
                    {
                      backgroundColor: "white",
                      svgWidth: 600,
                      svgHeight: 400,
                    },
                  ),
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
