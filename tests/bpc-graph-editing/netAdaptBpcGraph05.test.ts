import { test, expect } from "bun:test"
import type { FixedBpcGraph } from "lib/types"
import corpus from "@tscircuit/schematic-corpus/dist/bundled-bpc-graphs.json"
import { netAdaptBpcGraph } from "lib/index"
import { testNetAdapt } from "./testNetAdapt"

test("netAdaptBpcGraph05", async () => {
  const design001 = corpus.design001 as FixedBpcGraph

  const design001MissingBoxes = structuredClone(design001)

  design001MissingBoxes.boxes = design001MissingBoxes.boxes.filter(
    (b) => !b.boxId.includes("net_label"),
  )
  design001MissingBoxes.pins = design001MissingBoxes.pins.filter(
    (p) => !p.boxId.includes("net_label"),
  )

  const { allGraphicsSvg, adaptedFloating, adaptedFixed } = testNetAdapt(
    design001MissingBoxes,
    design001,
  )

  expect(allGraphicsSvg).toMatchSvgSnapshot(import.meta.path)
})
