import { InteractiveGraphics } from "graphics-debug/react"
import corpus from "@tscircuit/schematic-corpus"
import { AssignmentSolver2 } from "lib/assignment2/AssignmentSolver2"
import { useState } from "react"

const floatingGraph = corpus.design001
const fixedGraph = corpus.design018

export default () => {
  const [stepCount, setStepCount] = useState(0)
  const [solver, _setSolver] = useState<AssignmentSolver2 | null>(() => {
    const solver = new AssignmentSolver2(floatingGraph!, fixedGraph!)
    return solver
  })

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
                  // TODO
                }}
                className="cursor-pointer text-blue-500"
              >
                base
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
                      // TODO
                    }}
                  >
                    WL Vec
                  </td>
                </tr>
              ),
            )}
        </tbody>
      </table>
    </div>
  )
}
