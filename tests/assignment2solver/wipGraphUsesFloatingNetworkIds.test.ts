import { test, expect } from "bun:test"
import { AssignmentSolver2 } from "lib/assignment2/AssignmentSolver2"
import type { BpcGraph } from "lib/types"

// The solver should convert network ids of added fixed pins to the
// corresponding floating network ids so that the working graph uses
// floating network identifiers.

test("AssignmentSolver2 uses floating network ids", () => {
  const floating: BpcGraph = {
    boxes: [{ kind: "floating", boxId: "A" }],
    pins: [
      {
        boxId: "A",
        pinId: "p1",
        networkId: "f1",
        color: "red",
        offset: { x: 0, y: 0 },
      },
    ],
  }

  const fixed: BpcGraph = {
    boxes: [{ kind: "fixed", boxId: "X", center: { x: 0, y: 0 } }],
    pins: [
      {
        boxId: "X",
        pinId: "p1",
        networkId: "g1",
        color: "red",
        offset: { x: 0, y: 0 },
      },
    ],
  }

  const solver = new AssignmentSolver2(floating, fixed)
  solver.step()

  expect(solver.wipGraph.pins[0]?.networkId).toBe("f1")
})
