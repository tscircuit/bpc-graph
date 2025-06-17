import type {BpcGraph, FloatingBpcGraph} from "../../lib/types"
import {ForceDirectedLayoutDebugger} from "./ForceDirectedLayoutDebugger"

const g: BpcGraph = {
  boxes: [
    {
      boxId: "U1",
      kind: "floating",
      center: {x: 0, y: 0},
    },
    {
      boxId: "U2",
      kind: "floating",
      center: {x: 3, y: 0},
    },
    {
      boxId: "NL1",
      kind: "floating",
      center: {x: -2, y: 2},
    }
  ],
  pins: [
    { boxId: "NL1", pinId: "NL1.P1", offset: { x: 0, y: 0 }, color: "red", networkId: "N1" },
    { boxId: "NL1", pinId: "NL1.TL", offset: { x: 0, y: 0.1 }, color: "green", networkId: "N1" },
    { boxId: "U1", pinId: "U1.P1", offset: { x: -0.5, y: 0 }, color: "red", networkId: "N1" },
    { boxId: "U1", pinId: "U1.P2", offset: { x: -0.5, y: -0.5 }, color: "blue", networkId: "N2" },
    { boxId: "U1", pinId: "U1.P3", offset: { x: 0.5, y: -0.5 }, color: "blue", networkId: "N4" },
    { boxId: "U1", pinId: "U1.P4", offset: { x: 0.5, y: 0 }, color: "blue", networkId: "N4" },
    { boxId: "U2", pinId: "U2.P1", offset: { x: -0.5, y: 0 }, color: "blue", networkId: "N4" },
    { boxId: "U2", pinId: "U2.P2", offset: { x: 0.5, y: 0 }, color: "blue", networkId: "N5" },
  ]
}

export default () => {
  return (
    <ForceDirectedLayoutDebugger
      floatingBpsGraph={g}
    />
  )
}