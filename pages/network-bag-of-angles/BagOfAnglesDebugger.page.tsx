import React, { useState } from "react"
import corpus from "@tscircuit/schematic-corpus"
import { InteractiveGraphics } from "graphics-debug/react"
import { getGraphicsForBpcGraph } from "lib/debug/getGraphicsForBpcGraph"
import { computeGraphNetworkBagOfAnglesMap } from "lib/network-bag-of-angles-assignment/computeGraphNetworkBagOfAnglesMap"
import { computeNetworkMappingFromBagsOfAngles } from "lib/network-bag-of-angles-assignment/computeNetworkMappingFromBagsOfAngles"
import { reassignGraphNetworksUsingBagOfAngles } from "lib/network-bag-of-angles-assignment/reassignGraphNetworksUsingBagOfAngles"
import type { BpcGraph, NetworkId } from "lib/types"

/* ------------------------------------------------------------------ */
/*  Helper – draw one graph                                           */
/* ------------------------------------------------------------------ */
function GraphPreview({ g, title }: { g: BpcGraph; title: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{title}</div>
      <InteractiveGraphics graphics={getGraphicsForBpcGraph(g)} />
    </div>
  )
}

function AnglesTable({
  bag,
  title,
}: {
  bag: Map<NetworkId, number[]>
  title: string
}) {
  const rad2deg = (r: number) => ((r * 180) / Math.PI).toFixed(0)
  return (
    <div style={{ fontSize: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{title}</div>
      <table style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 4 }}>Network</th>
            <th style={{ border: "1px solid #ccc", padding: 4 }}>
              Angles&nbsp;(°)
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from(bag.entries()).map(([net, ang]) => (
            <tr key={net}>
              <td style={{ border: "1px solid #ccc", padding: 4 }}>{net}</td>
              <td style={{ border: "1px solid #ccc", padding: 4 }}>
                {ang.map(rad2deg).join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function BagOfAnglesDebugger() {
  /* ─────────────────────────── state ────────────────────────────── */
  const designIds = Object.keys(corpus) as Array<keyof typeof corpus>
  const [srcId, setSrcId] = useState("design001")
  const [tgtId, setTgtId] = useState("design018")
  const [mapping, setMapping] = useState<Map<NetworkId, NetworkId> | null>(null)
  const [distance, setDistance] = useState<number | null>(null)
  const [reassigned, setReassigned] = useState<BpcGraph | null>(null)

  const [bagSrc, setBagSrc] = useState<Map<NetworkId, number[]> | null>(null)
  const [bagTgt, setBagTgt] = useState<Map<NetworkId, number[]> | null>(null)

  /* ─────────────────────── core computation ─────────────────────── */
  const run = () => {
    const src = corpus[srcId] as BpcGraph
    const tgt = corpus[tgtId] as BpcGraph

    const bagSrc = computeGraphNetworkBagOfAnglesMap(src)
    const bagTgt = computeGraphNetworkBagOfAnglesMap(tgt)

    setBagSrc(bagSrc)
    setBagTgt(bagTgt)

    const { networkMapping, distance } = computeNetworkMappingFromBagsOfAngles(
      bagTgt,
      bagSrc,
    )

    const { reassignedGraph } = reassignGraphNetworksUsingBagOfAngles(
      tgt,
      bagSrc,
    )

    setMapping(networkMapping)
    setDistance(distance)
    setReassigned(reassignedGraph)
  }

  /* ────────────────────────── render ─────────────────────────────── */
  return (
    <div style={{ padding: 20 }}>
      <h1>Bag-of-Angles Network-Reassignment Debugger</h1>

      {/* selectors + action */}
      <div style={{ display: "flex", gap: 12, margin: "12px 0" }}>
        <label>
          Source&nbsp;
          <select value={srcId} onChange={(e) => setSrcId(e.target.value)}>
            {designIds.map((id) => (
              <option key={id}>{id}</option>
            ))}
          </select>
        </label>

        <label>
          Target&nbsp;
          <select value={tgtId} onChange={(e) => setTgtId(e.target.value)}>
            {designIds.map((id) => (
              <option key={id}>{id}</option>
            ))}
          </select>
        </label>

        <button onClick={run}>Reassign Networks</button>

        {distance !== null && (
          <div style={{ fontWeight: 600 }}>
            Total&nbsp;distance&nbsp;≈&nbsp;
            {distance.toFixed(3)}
          </div>
        )}
      </div>

      {/* graphics */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <GraphPreview g={corpus[srcId] as BpcGraph} title="Source" />
        <GraphPreview g={corpus[tgtId] as BpcGraph} title="Target (orig.)" />
        {reassigned && (
          <GraphPreview g={reassigned} title="Target (re-mapped)" />
        )}
      </div>

      {/* mapping table */}
      {mapping && (
        <table style={{ marginTop: 20, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: 4 }}>
                Target&nbsp;net
              </th>
              <th style={{ border: "1px solid #ccc", padding: 4 }}>
                Source&nbsp;net
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from(mapping.entries()).map(([tgt, src]) => (
              <tr key={tgt}>
                <td style={{ border: "1px solid #ccc", padding: 4 }}>{tgt}</td>
                <td style={{ border: "1px solid #ccc", padding: 4 }}>{src}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {bagSrc && bagTgt && (
        <div
          style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 20 }}
        >
          <AnglesTable bag={bagSrc} title="Source – Bag&nbsp;of&nbsp;Angles" />
          <AnglesTable bag={bagTgt} title="Target – Bag&nbsp;of&nbsp;Angles" />
        </div>
      )}
    </div>
  )
}
