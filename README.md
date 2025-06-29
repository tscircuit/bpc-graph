# bpc-graph

A box pin color (BPC) graph is a specialized graph structure where:

- Boxes contain pins
- Pins belong to a network
- Pins are coloured to describe signal type

Boxes can be **fixed** (they know their position) or **floating** (no position yet). Each
pin stores an offset relative to its box. When all pins on a network are visualised, a
schematic like connection graph is produced.

This repository provides utilities for manipulating and comparing BPC graphs.

## Contents

- [Where BPC graphs are used](#where-bpc-graphs-are-used)
- [Installation](#installation)
- [Quick Example](#quick-example)
- [API](#api)
  - [getGraphBounds](#getgraphboundsgraph)
  - [getPinPosition](#getpinpositiongraph-pinid)
  - [getPinDirection](#getpindirectiongraph-pinid)
  - [assignFloatingBoxPositions](#assignfloatingboxpositionsgraph)
  - [netAdaptBpcGraph](#netadaptbpcgraphsource-target)
  - [renetworkWithCondition](#renetworkwithconditiongraph-predicate)
  - [convertToFlatBpcGraph](#convertoflatbpcgraphmixed)
  - [convertFromFlatBpcGraph](#convertfromflatbpcgraphflat)
  - [getBpcGraphWlDistance](#getbpcgraphwldistancea-b)
  - [ForceDirectedLayoutSolver](#forcedirectedlayoutsolver)

## Where BPC graphs are used

When automatically laying out schematics the tools in this repo convert an initial
"floating" design into a fixed layout. Networks can be split, boxes can be adapted to a
template and the resulting graph can be rendered with a force directed solver.

![Example Layout](https://github.com/user-attachments/assets/2efa5e6f-b0ba-478f-8cb8-361db267fab4)

![Example Template](https://github.com/user-attachments/assets/2a5b543b-32e5-4d25-bcc5-f02845e60a9e)

## Installation

```bash
bun add bpc-graph
```

## Quick Example

```ts
import { getGraphicsForBpcGraph } from "bpc-graph"
import { getSvgFromGraphicsObject } from "graphics-debug"

const graph = {
  boxes: [
    { kind: "fixed", boxId: "A", center: { x: 0, y: 0 } },
    { kind: "fixed", boxId: "B", center: { x: 2, y: 0 } },
  ],
  pins: [
    { boxId: "A", pinId: "P1", offset: { x: 0.5, y: 0 }, color: "red", networkId: "N1" },
    { boxId: "B", pinId: "P1", offset: { x: -0.5, y: 0 }, color: "red", networkId: "N1" },
  ],
}

const svg = getSvgFromGraphicsObject(getGraphicsForBpcGraph(graph), { backgroundColor: "white" })
```

The snapshot generated in `tests/readme/getGraphicsExample.test.ts` renders as:

![Basic graph](tests/readme/__snapshots__/getGraphicsExample.snap.svg)

## API

### getGraphBounds(graph)

![Graph utils example](tests/readme/__snapshots__/graphUtilsExample.snap.svg)

### getPinPosition(graph, pinId)

_See graph utils example above_

### getPinDirection(graph, pinId)

_See graph utils example above_

### assignFloatingBoxPositions(graph)

![Assign floating](tests/bpc-graph-editing/__snapshots__/assignFloatingBoxPositions.snap.svg)

### netAdaptBpcGraph(source, target)

![Net adapt](tests/bpc-graph-editing/__snapshots__/netAdaptBpcGraph03.snap.svg)

### renetworkWithCondition(graph, predicate)

![Renetwork result](tests/readme/__snapshots__/renetworkExample.snap.svg)

### convertToFlatBpcGraph(mixed)

![Convert flat](tests/readme/__snapshots__/convertFlatExample.snap.svg)

### convertFromFlatBpcGraph(flat)

_Result identical to original, see convert flat example above_

### getBpcGraphWlDistance(a, b)

![WL distance](tests/adjacency-matrix-network-similarity/__snapshots__/eigen01.snap.svg)

### ForceDirectedLayoutSolver

![Force solver](tests/schematic-partition-layout-with-corpus/__snapshots__/partition01.snap.svg)

All type definitions can be imported from `bpc-graph` as well and are located in
`lib/types.ts`.

