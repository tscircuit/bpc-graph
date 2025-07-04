import { InteractiveGraphics } from "graphics-debug/react"
import corpus from "@tscircuit/schematic-corpus"
import { AssignmentSolver2 } from "lib/assignment2/AssignmentSolver2"
import { useMemo, useState } from "react"
import { getWlFeatureVecs } from "lib/adjacency-matrix-network-similarity/getBpcGraphWlDistance"
import {
  getGraphicsForBpcGraph,
  getWlDotProduct,
  type BpcGraph,
} from "lib/index"

const floatingGraph = corpus.design001
const fixedGraph = corpus.design018

const WlVecDialog = ({
  wlVec,
  fixedBoxId,
  targetFloatingVec,
  wipGraphWithAddedFixedBoxId,
  onClose,
}: {
  fixedBoxId?: string | null
  wlVec: Array<Record<string, number>> | null
  targetFloatingVec: Array<Record<string, number>> | null
  wipGraphWithAddedFixedBoxId: BpcGraph | null
  onClose: () => void
}) => {
  if (!wlVec) return null

  const degreeDists: Array<{ degree: number; dotProd: number; dist: number }> =
    []
  if (targetFloatingVec) {
    for (let i = 0; i < 3; i++) {
      const dotProd = getWlDotProduct(
        wlVec.slice(0, i + 1),
        targetFloatingVec.slice(0, i + 1),
      )
      degreeDists.push({ degree: i, dotProd, dist: i + 1 - dotProd })
    }
  }

  const graphics = useMemo(() => {
    if (!wipGraphWithAddedFixedBoxId) return null
    const graphics = getGraphicsForBpcGraph(wipGraphWithAddedFixedBoxId!)

    // Highlight the added fixed box
    if (fixedBoxId) {
      const rect = graphics.rects?.find((r) => r.label === fixedBoxId)
      if (rect) {
        rect.fill = `rgba(255, 0, 0, 0.5)`
      }
    }

    return graphics
  }, [wipGraphWithAddedFixedBoxId])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg max-h-[80vh] overflow-auto">
        <button
          className="mb-4 px-2 py-1 bg-red-500 text-white rounded"
          onClick={onClose}
        >
          Close
        </button>
        {graphics && <InteractiveGraphics graphics={graphics} />}
        <table className="border-collapse mb-4">
          <thead>
            <tr>
              <th className="px-2 py-1 border">Degree</th>
              <th className="px-2 py-1 border">Dot Product Result</th>
              <th className="px-2 py-1 border">WL Distance</th>
            </tr>
          </thead>
          <tbody>
            {degreeDists.map(({ degree, dotProd, dist }) => (
              <tr key={degree}>
                <td className="px-2 py-1 border">{degree}</td>
                <td className="px-2 py-1 border">{dotProd.toFixed(4)}</td>
                <td className="px-2 py-1 border">{dist.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <table className="border-collapse">
          <thead>
            <tr>
              <th className="px-2 py-1 border">Index</th>
              <th className="px-2 py-1 border">Key</th>
              <th className="px-2 py-1 border">Count</th>
              <th className="px-2 py-1 border">Target Floating Count</th>
            </tr>
          </thead>
          <tbody>
            {wlVec.flatMap((rec, idx) =>
              Object.entries(rec).map(([key, count]) => (
                <tr key={`${idx}-${key}`}>
                  <td className="px-2 py-1 border">{idx}</td>
                  <td className="px-2 max-w-[320px] break-words py-1 border">
                    {key}
                  </td>
                  <td className="px-2 py-1 border">{count}</td>
                  <td className="px-2 py-1 border">
                    {targetFloatingVec?.[idx]?.[key]}
                  </td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default () => {
  const [stepCount, setStepCount] = useState(0)
  const [solver, _setSolver] = useState<AssignmentSolver2 | null>(() => {
    const solver = new AssignmentSolver2(floatingGraph!, fixedGraph!)
    return solver
  })
  const targetFloatingVec = useMemo(() => {
    return getWlFeatureVecs(floatingGraph!)
  }, [floatingGraph])

  const [openVec, setOpenVec] = useState<Array<Record<string, number>> | null>(
    null,
  )
  const [openVecFixedBoxId, setOpenVecFixedBoxId] = useState<string | null>(
    null,
  )
  const closeDialog = () => {
    setOpenVec(null)
    setOpenVecFixedBoxId(null)
  }

  return (
    <div>
      <button
        className="bg-blue-500 text-white p-2 m-4"
        onClick={() => {
          solver?.step()
          setStepCount(stepCount + 1)
        }}
      >
        Step
      </button>
      <InteractiveGraphics graphics={solver?.visualize()!} />
      <h2 className="text-lg">
        Last-accepted evaluation (decided to assign floating box id{" "}
        {solver?.lastAcceptedEvaluation?.floatingBoxId})
      </h2>
      <table className="border-collapse">
        <thead>
          <tr>
            <th className="px-2 py-1 border">Floating Box ID</th>
            <th className="px-2 py-1 border">Fixed Box ID</th>
            <th className="px-2 py-1 border">
              WL Distance (base={solver?.lastAcceptedEvaluation?.currentWlDist})
            </th>
            <th className="px-2 py-1 border">
              WL Vec{" "}
              <span
                onClick={() => {
                  if (!solver) return
                  const vec = getWlFeatureVecs(
                    solver.lastAcceptedEvaluation!.originalWipGraph!,
                  )
                  setOpenVec(vec)
                }}
                className="cursor-pointer text-blue-500"
              >
                base
              </span>
              <span
                className="text-blue-500 ml-1 cursor-pointer"
                onClick={() => {
                  if (!solver) return
                  const vec = getWlFeatureVecs(solver.floatingGraph)
                  setOpenVec(vec)
                }}
              >
                floating target
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {solver?.lastAcceptedEvaluation &&
            Array.from(solver.lastAcceptedEvaluation.wlDistances.entries()).map(
              ([fixedBoxId, distance]) => (
                <tr key={fixedBoxId}>
                  <td className="px-2 py-1 border">
                    {solver.lastAcceptedEvaluation?.floatingBoxId}
                  </td>
                  <td className="px-2 py-1 border">{fixedBoxId}</td>
                  <td className="px-2 py-1 border">{distance}</td>
                  <td
                    className="px-2 py-1 border text-blue-500 cursor-pointer"
                    onClick={() => {
                      const vec =
                        solver?.lastAcceptedEvaluation?.wlVecs.get(
                          fixedBoxId,
                        ) ?? null
                      setOpenVecFixedBoxId(fixedBoxId)
                      setOpenVec(vec)
                    }}
                  >
                    WL Vec
                  </td>
                </tr>
              ),
            )}
        </tbody>
      </table>
      {/* ── Last-computed evaluations ─────────────────────────────────── */}
      <h2 className="text-lg mt-4">Last-computed evaluations</h2>
      <table className="border-collapse mt-4">
        <thead>
          <tr>
            <th className="px-2 py-1 border">Floating Box ID</th>
            <th className="px-2 py-1 border">Best WL Distance</th>
          </tr>
        </thead>
        <tbody>
          {solver?.lastComputedEvaluations
            ?.slice() // copy so we can sort
            .sort((a, b) => a.bestDist - b.bestDist) // ascending distance
            .map((ev) => (
              <tr key={ev.nextFloatingBoxId}>
                <td className="px-2 py-1 border">{ev.nextFloatingBoxId}</td>
                <td className="px-2 py-1 border">{ev.bestDist}</td>
              </tr>
            ))}
        </tbody>
      </table>
      <WlVecDialog
        wlVec={openVec}
        fixedBoxId={openVecFixedBoxId}
        targetFloatingVec={targetFloatingVec}
        wipGraphWithAddedFixedBoxId={
          solver?.lastAcceptedEvaluation?.wipGraphsWithAddedFixedBoxId.get(
            openVecFixedBoxId!,
          ) ?? null
        }
        onClose={closeDialog}
      />
    </div>
  )
}
