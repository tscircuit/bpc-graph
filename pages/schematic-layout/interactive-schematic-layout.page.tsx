/** biome-ignore lint/react/noDanger: raw SVG is required for debug visualisations */
import { useState } from "react"
import { runTscircuitCode } from "tscircuit"
import { convertCircuitJsonToBpc } from "circuit-json-to-bpc"
import { convertCircuitJsonToSchematicSvg } from "circuit-to-svg"
import { getSvgFromGraphicsObject } from "graphics-debug"
import { debugLayout } from "tests/fixtures/debugLayout"
import type { BpcGraph } from "lib/types"
import { corpusNoNetLabel } from "@tscircuit/schematic-corpus"
import mainCorpus from "@tscircuit/schematic-corpus"
import { getGraphicsForBpcGraph } from "lib/debug/getGraphicsForBpcGraph"

function createNotConnectedBecomesNormalVariant(bpcGraph: BpcGraph): BpcGraph {
  return {
    ...bpcGraph,
    pins: bpcGraph.pins.map((pin) =>
      pin.color === "not_connected" ? { ...pin, color: "normal" } : pin,
    ),
  }
}

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
  const [selectedVariant, setSelectedVariant] = useState<string>("auto")

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

      let result
      if (selectedVariant === "auto") {
        // Use floatingGraphInputVariants approach
        const variants = [
          { variantName: "Default", floatingGraph: bpcGraph },
          {
            variantName: "NotConnectedBecomesNormal",
            floatingGraph: createNotConnectedBecomesNormalVariant(bpcGraph),
          },
        ]
        result = debugLayout(variants, {
          corpus: corpusNoNetLabel,
          accessoryCorpus: mainCorpus,
        })
      } else {
        // Use specific variant
        let graphToUse = bpcGraph
        if (selectedVariant === "NotConnectedBecomesNormal") {
          graphToUse = createNotConnectedBecomesNormalVariant(bpcGraph)
        }
        result = debugLayout(graphToUse, {
          corpus: corpusNoNetLabel,
          accessoryCorpus: mainCorpus,
        })
      }

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
        <div style={{ marginTop: "10px" }}>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Input Variant:
            </label>
            <select
              value={selectedVariant}
              onChange={(e) => setSelectedVariant(e.target.value)}
              style={{
                padding: "5px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                backgroundColor: "white",
              }}
            >
              <option value="auto">Auto-select (lowest distance)</option>
              <option value="Default">Default</option>
              <option value="NotConnectedBecomesNormal">
                NotConnectedBecomesNormal
              </option>
            </select>
          </div>
          <button
            onClick={runLayout}
            disabled={loading}
            style={{
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
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: "20px" }}>Error: {error}</div>
      )}

      {layoutResult && layoutResult.variantResults && (
        <div style={{ marginBottom: "20px" }}>
          <h2>Variant Selection Results</h2>
          <p>
            Selected Variant:{" "}
            <strong>{layoutResult.selectedVariantName}</strong>
          </p>
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            {layoutResult.variantResults.map((variant: any, idx: number) => (
              <div
                key={variant.variantName}
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  borderRadius: "4px",
                  backgroundColor:
                    variant.variantName === layoutResult.selectedVariantName
                      ? "#e7f3ff"
                      : "white",
                }}
              >
                <h4>{variant.variantName}</h4>
                <p>Distance: {variant.distance.toFixed(3)}</p>
                {variant.variantName === layoutResult.selectedVariantName && (
                  <p style={{ color: "#007bff", fontWeight: "bold" }}>
                    ← Selected
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
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
                    .map((graphics: any, iterIdx: number) => (
                      <div
                        key={`iter-${iterIdx}`}
                        style={{ border: "1px solid #ccc", padding: "10px" }}
                      >
                        <h4>Iteration {iterIdx + 1}</h4>
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
                (graphics: any, partIdx: number) => (
                  <div
                    key={`partition-${partIdx}`}
                    style={{ border: "1px solid #ccc", padding: "10px" }}
                  >
                    <h4>Partition {partIdx + 1}</h4>
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
                (graphics: any, matchIdx: number) => {
                  const matchDetail = layoutResult.matchDetails?.[matchIdx]
                  return (
                    <div
                      key={`match-${matchIdx}`}
                      style={{ border: "1px solid #ccc", padding: "10px" }}
                    >
                      <h4>
                        Matched Template {matchIdx + 1}
                        {matchDetail && (
                          <>
                            : {matchDetail.designName} (d=
                            {matchDetail.distance?.toFixed(2)})
                          </>
                        )}
                      </h4>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <div>
                          <h5 style={{ margin: "0 0 5px 0", fontSize: "12px" }}>
                            BPC Graph
                          </h5>
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
                        {matchDetail && (
                          <div>
                            <h5
                              style={{ margin: "0 0 5px 0", fontSize: "12px" }}
                            >
                              Circuit Form
                            </h5>
                            <img
                              src={matchDetail.designSvgUrl}
                              alt={`Circuit form for ${matchDetail.designName}`}
                              style={{
                                width: "300px",
                                height: "200px",
                                objectFit: "contain",
                                border: "1px solid #ddd",
                                backgroundColor: "white",
                              }}
                            />
                          </div>
                        )}
                      </div>
                      {matchDetail && (
                        <details style={{ marginTop: "10px" }}>
                          <summary
                            style={{ cursor: "pointer", fontSize: "12px" }}
                          >
                            Match Details
                          </summary>
                          <div style={{ fontSize: "11px", marginTop: "5px" }}>
                            <h5>Corpus Scores:</h5>
                            <div
                              style={{ maxHeight: "200px", overflowY: "auto" }}
                            >
                              {Object.entries(matchDetail.corpusScores || {})
                                .sort(
                                  ([, a], [, b]) =>
                                    (a as number) - (b as number),
                                )
                                .map(([name, score]) => (
                                  <div
                                    key={name}
                                    style={{
                                      marginBottom: "10px",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                    }}
                                  >
                                    <div
                                      style={{ display: "flex", gap: "4px" }}
                                    >
                                      <div>
                                        <div
                                          style={{
                                            fontSize: "10px",
                                            marginBottom: "2px",
                                          }}
                                        >
                                          BPC
                                        </div>
                                        <div
                                          style={{
                                            width: "60px",
                                            height: "40px",
                                            border: "1px solid #ddd",
                                            backgroundColor: "white",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "8px",
                                            color: "#666",
                                          }}
                                        >
                                          {layoutResult.corpus &&
                                          layoutResult.corpus[name] ? (
                                            <img
                                              src={`data:image/svg+xml;base64,${btoa(
                                                getSvgFromGraphicsObject(
                                                  getGraphicsForBpcGraph(
                                                    layoutResult.corpus[name],
                                                    {
                                                      title: "",
                                                    },
                                                  ),
                                                  {
                                                    backgroundColor: "white",
                                                    svgWidth: 320,
                                                    svgHeight: 240,
                                                  },
                                                ),
                                              )}`}
                                              alt={`BPC graph for ${name}`}
                                              style={{
                                                width: "58px",
                                                height: "38px",
                                                objectFit: "fill",
                                              }}
                                            />
                                          ) : (
                                            "N/A"
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <div
                                          style={{
                                            fontSize: "10px",
                                            marginBottom: "2px",
                                          }}
                                        >
                                          Circuit
                                        </div>
                                        <img
                                          src={`https://schematic-corpus.tscircuit.com/${name}.svg`}
                                          alt={`Circuit form for ${name}`}
                                          style={{
                                            width: "60px",
                                            height: "40px",
                                            objectFit: "contain",
                                            border: "1px solid #ddd",
                                            backgroundColor: "white",
                                          }}
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <strong>
                                        {name === matchDetail.designName
                                          ? "→ "
                                          : ""}
                                      </strong>
                                      <span
                                        style={{
                                          color:
                                            name === matchDetail.designName
                                              ? "#28a745"
                                              : "#007bff",
                                        }}
                                      >
                                        {name}
                                      </span>
                                      : {(score as number).toFixed(3)}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </details>
                      )}
                    </div>
                  )
                },
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
                (graphics: any, adaptIdx: number) => (
                  <div
                    key={`adapt-${adaptIdx}`}
                    style={{ border: "1px solid #ccc", padding: "10px" }}
                  >
                    <h4>Adapted Graph {adaptIdx + 1}</h4>
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

          {layoutResult.accessoryGraphGraphics && (
            <div style={{ marginBottom: "30px" }}>
              <h3>Step 7: Accessory Graph (Net Labels & Extra Boxes)</h3>
              <p>
                Boxes from the corpus templates that were not matched to any
                floating boxes. These often include net labels or other
                annotations.
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
                      layoutResult.accessoryGraphGraphics,
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
          )}
        </div>
      )}
    </div>
  )
}
