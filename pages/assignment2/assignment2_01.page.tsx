import { InteractiveGraphics } from "graphics-debug/react"
import corpus from "@tscircuit/schematic-corpus"
import { AssignmentSolver2 } from "lib/assignment2/AssignmentSolver2"
import { useState } from "react"

const floatingGraph = corpus.design001
const fixedGraph = corpus.design018

export default () => {
  const [stepCount, setStepCount] = useState(0)
  const [solver, setSolver] = useState<AssignmentSolver2 | null>(() => {
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
    </div>
  )
}
