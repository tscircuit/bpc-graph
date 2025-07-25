import { runTscircuitCode } from "tscircuit"
import { test, expect } from "bun:test"
import { getBoxSideSubgraph } from "lib/box-sides/getBoxSideSubgraph"
import type { BpcGraph } from "lib/types"
import { convertCircuitJsonToBpc } from "circuit-json-to-bpc"
import { getGraphicsForBpcGraph, renetworkWithCondition } from "lib/index"
import {
  getSvgFromGraphicsObject,
  stackGraphicsHorizontally,
  stackGraphicsVertically,
} from "graphics-debug"

test("getBoxSideSubgraph returns the correct subgraph", async () => {
  const bpcGraph = convertCircuitJsonToBpc(
    await runTscircuitCode(`
    import { sel } from "tscircuit"
    export default () => (<board width="10mm" height="10mm" routingDisabled>
      <chip
        name="U3"
        footprint="soic8"
        pinLabels={{
          pin8: "VDD",
          pin4: "GND",
          pin1: "N_CS",
          pin6: "CLK",
          pin5: "D0_DI",
          pin2: "D1_DO",
          pin3: "D2_N_WP",
          pin7: "D3_N_HOLD",
        }}
        schPinArrangement={{
          leftSide: {
            pins: [8, 4],
            direction: "top-to-bottom",
          },
          rightSide: {
            pins: [1, 6, 5, 2, 3, 7],
            direction: "top-to-bottom",
          },
        }}
        schPinStyle={{
          pin4: { marginTop: 0.65 },
        }}
        connections={{
          VDD: sel.net.V3_3,
          GND: sel.net.GND,
          pin7: sel.net.V3_3,
          pin3: sel.net.V3_3,
          pin2: sel.net.FLASH_SDO,
          pin5: sel.net.FLASH_SDI,
          pin6: sel.net.FLASH_SCK,
          pin1: sel.net.FLASH_N_CS,
        }}
      />
      <capacitor
        name="C20"
        capacitance="0.1uF"
        schRotation="90deg"
        footprint="0402"
        schX={-3}
        connections={{
          pin2: sel.U3.VDD,
          pin1: sel.U3.GND,
        }}
      />
      <resistor
        name="R11"
        resistance="100k"
        schX={2}
        schY={1}
        schRotation="90deg"
        connections={{
          pin2: sel.net.V3_3,
          pin1: sel.U3.N_CS,
        }}
      />
    </board>
    )
  `),
  )

  const ogGraphics = getGraphicsForBpcGraph(bpcGraph, {
    title: "Original",
  })

  const component0Center = bpcGraph.boxes.find(
    (b) => b.boxId === "schematic_component_0",
  )!.center!

  const { renetworkedGraph } = renetworkWithCondition(
    bpcGraph,
    (from, to, networkId) => {
      if (!from.box.center || !to.box.center) return true
      const fromSide =
        from.box.center.x + from.pin.offset.x < component0Center.x
          ? "left"
          : "right"
      const toSide =
        to.box.center.x + to.pin.offset.x < component0Center.x
          ? "left"
          : "right"
      return fromSide === toSide
    },
  )

  const leftSubgraphGraphics = getGraphicsForBpcGraph(renetworkedGraph, {
    title: "Renetworked",
  })

  const allGraphics = stackGraphicsHorizontally([
    ogGraphics,
    leftSubgraphGraphics,
  ])

  expect(
    getSvgFromGraphicsObject(allGraphics, {
      backgroundColor: "white",
      includeTextLabels: false,
    }),
  ).toMatchSvgSnapshot(import.meta.path)
})
