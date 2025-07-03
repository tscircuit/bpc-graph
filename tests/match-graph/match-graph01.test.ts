import { test, expect } from "bun:test"
import corpus from "@tscircuit/schematic-corpus"
import { matchGraph } from "lib/match-graph/matchGraph"

test("match-graph01", () => {
  const result = matchGraph(corpus.design010!, {
    design014: corpus.design014!,
  })
  expect(result.distance).not.toEqual(0)
})
