import { InteractiveGraphics } from "graphics-debug/react"
import corpus from "@tscircuit/schematic-corpus"
import { AssignmentSolver2 } from "lib/assignment2/AssignmentSolver2"
import { useMemo, useState } from "react"
import { getWlFeatureVecs } from "lib/adjacency-matrix-network-similarity/getBpcGraphWlDistance"
import { getWlDotProduct } from "lib/index"

const floatingGraph = corpus.design001
const fixedGraph = corpus.design018

const WlVecDialog = ({
  wlVec,
  targetFloatingVec,
  onClose,
}: {
  wlVec: Array<Record<string, number>> | null
  targetFloatingVec: Array<Record<string, number>> | null
  onClose: () => void
}) => {
  if (!wlVec) return null

  const degreeDists: Array<{ degree: number; dist: number }> = []
  if (targetFloatingVec) {
    for (let i = 0; i < 3; i++) {
      const dist = getWlDotProduct(
        wlVec.slice(0, i + 1),
        targetFloatingVec.slice(0, i + 1),
      )
      degreeDists.push({ degree: i, dist })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg max-h-[80vh] overflow-auto">
        <button
          className="mb-4 px-2 py-1 bg-red-500 text-white rounded"
          onClick={onClose}
        >
          Close
        </button>
        <table className="border-collapse mb-4">
          <thead>
            <tr>
              <th className="px-2 py-1 border">Degree</th>
              <th className="px-2 py-1 border">Distance</th>
            </tr>
          </thead>
          <tbody>
            {degreeDists.map(({ degree, dist }) => (
              <tr key={degree}>
                <td className="px-2 py-1 border">{degree}</td>
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
  const closeDialog = () => setOpenVec(null)

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
      <table>
        <thead>
          <tr>
            <th>Floating Box ID</th>
            <th>Fixed Box ID</th>
            <th>
              Distance (base={solver?.lastDistanceEvaluation?.currentDist})
            </th>
            <th>
              WL Vec{" "}
              <span
                onClick={() => {
                  if (!solver) return
                  const vec = getWlFeatureVecs(
                    solver.lastDistanceEvaluation!.originalWipGraph!,
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
          {solver?.lastDistanceEvaluation &&
            Array.from(solver.lastDistanceEvaluation.distances.entries()).map(
              ([fixedBoxId, distance]) => (
                <tr key={fixedBoxId}>
                  <td>{solver.lastDistanceEvaluation?.floatingBoxId}</td>
                  <td>{fixedBoxId}</td>
                  <td>{distance}</td>
                  <td
                    className="text-blue-500 cursor-pointer"
                    onClick={() => {
                      const vec =
                        solver?.lastDistanceEvaluation?.wlVecs.get(
                          fixedBoxId,
                        ) ?? null
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
      <WlVecDialog
        wlVec={openVec}
        targetFloatingVec={targetFloatingVec}
        onClose={closeDialog}
      />
    </div>
  )
}
