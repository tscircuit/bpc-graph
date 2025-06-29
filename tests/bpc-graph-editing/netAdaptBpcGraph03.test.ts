import { testNetAdapt } from "./testNetAdapt"
import { test, expect } from "bun:test"
import corpus from "@tscircuit/schematic-corpus/dist/bundled-bpc-graphs.json"
import type { FixedBpcGraph, MixedBpcGraph } from "lib/types"

test("netAdaptBpcGraph03", () => {
  const source = corpus.design004 as FixedBpcGraph
  const target = corpus.design001 as MixedBpcGraph

  const { allGraphicsSvg } = testNetAdapt(source, target)

  expect(allGraphicsSvg).toMatchSvgSnapshot(import.meta.path)
})
