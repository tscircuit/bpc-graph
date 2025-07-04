import { runTscircuitCode } from "tscircuit"
import { test, expect } from "bun:test"
import { getBoxSideSubgraph } from "lib/box-sides/getBoxSideSubgraph"
import type { BpcGraph } from "lib/types"
import { convertCircuitJsonToBpc } from "circuit-json-to-bpc"
import {
  getGraphicsForBpcGraph,
  mergeBoxSideSubgraphs,
  renetworkWithCondition,
} from "lib/index"
import {
  getSvgFromGraphicsObject,
  stackGraphicsHorizontally,
  stackGraphicsVertically,
} from "graphics-debug"
import { mergeNetworks } from "lib/renetwork/mergeNetworks"
import corpus from "@tscircuit/schematic-corpus/dist/bundled-bpc-graphs.json"
import { matchGraph } from "lib/match-graph/matchGraph"
import { reflectGraph } from "lib/graph-utils/reflectGraph"

test("getBoxSideSubgraph returns the correct subgraph", async () => {
  const ogGraph = convertCircuitJsonToBpc(
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

  const ogGraphics = getGraphicsForBpcGraph(ogGraph, {
    title: "Original",
  })

  const component0Center = ogGraph.boxes.find(
    (b) => b.boxId === "schematic_component_0",
  )!.center!
  const { renetworkedGraph, renetworkedNetworkIdMap } = renetworkWithCondition(
    ogGraph,
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

  const renetworkedGraphics = getGraphicsForBpcGraph(renetworkedGraph, {
    title: "Renetworked",
  })

  const leftSubgraph = getBoxSideSubgraph({
    bpcGraph: renetworkedGraph,
    boxId: "schematic_component_0",
    side: "left",
  })

  const leftSubgraphGraphics = getGraphicsForBpcGraph(leftSubgraph, {
    title: "Left Subgraph",
  })

  const leftSubgraphReflected = reflectGraph({
    graph: leftSubgraph,
    axis: "x",
    centerBoxId: "schematic_component_0",
  })

  const rightSubgraph = getBoxSideSubgraph({
    bpcGraph: renetworkedGraph,
    boxId: "schematic_component_0",
    side: "right",
  })

  const rightSubgraphGraphics = getGraphicsForBpcGraph(rightSubgraph, {
    title: "Right Subgraph",
  })

  // Match and netAdapt both the left and right subgraphs
  const leftMatchResult = matchGraph(leftSubgraphReflected, corpus as any)

  const rightMatchResult = matchGraph(rightSubgraph, corpus as any)

  const leftMatchGraphics = stackGraphicsHorizontally([
    getGraphicsForBpcGraph(leftSubgraphReflected, {
      title: "Left Subgraph (Reflected)",
    }),
    getGraphicsForBpcGraph(leftMatchResult.graph!, {
      title: "Left Match",
      caption: `Corpus[${leftMatchResult.graphName}], WL Distance: ${leftMatchResult.distance}`,
    }),
  ])

  const rightMatchGraphics = stackGraphicsHorizontally([
    getGraphicsForBpcGraph(rightSubgraph, {
      title: "Right Subgraph",
    }),
    getGraphicsForBpcGraph(rightMatchResult.graph!, {
      title: "Right Match",
      caption: `Corpus[${rightMatchResult.graphName}], WL Distance: ${rightMatchResult.distance}`,
    }),
  ])

  // const mergedSidesGraph = mergeBoxSideSubgraphs(
  //   [leftSubgraph, rightSubgraph],
  //   {
  //     renetworkedNetworkIdMap,
  //   },
  // )

  // const mergedSidesGraphics = getGraphicsForBpcGraph(mergedSidesGraph, {
  //   title: "Merged Sides",
  // })

  // const mergedGraph = mergeNetworks(mergedSidesGraph, renetworkedNetworkIdMap)

  // const mergedGraphics = getGraphicsForBpcGraph(mergedGraph, {
  //   title: "Merged Networks",
  // })

  const allGraphics = stackGraphicsVertically([
    ogGraphics,
    renetworkedGraphics,
    leftSubgraphGraphics,
    rightSubgraphGraphics,
    leftMatchGraphics,
    rightMatchGraphics,
    // mergedSidesGraphics,
    // mergedGraphics,
  ])

  expect(
    getSvgFromGraphicsObject(allGraphics, {
      backgroundColor: "white",
      includeTextLabels: false,
    }),
  ).toMatchSvgSnapshot(import.meta.path)
})
