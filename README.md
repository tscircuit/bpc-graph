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

- [bpc-graph](#bpc-graph)
  - [Contents](#contents)
  - [Where BPC graphs are used](#where-bpc-graphs-are-used)
  - [Installation](#installation)
  - [Quick Example](#quick-example)
  - [Library](#library)
    - [getGraphBounds(graph)](#getgraphboundsgraph)
    - [getPinDirection(graph, boxId, pinId)](#getpindirectiongraph-boxid-pinid)
    - [assignFloatingBoxPositions(graph)](#assignfloatingboxpositionsgraph)
    - [netAdaptBpcGraph(source, target)](#netadaptbpcgraphsource-target)
    - [renetworkWithCondition(graph, predicate)](#renetworkwithconditiongraph-predicate)
    - [getBpcGraphWlDistance(a, b)](#getbpcgraphwldistancea-b)
    - [ForceDirectedLayoutSolver](#forcedirectedlayoutsolver)
    - [getBoxSideSubgraph({ bpcGraph, boxId, side })](#getboxsidesubgraph-bpcgraph-boxid-side-)
    - [mergeBoxSideSubgraphs(graphs)](#mergeboxsidesubgraphsgraphs)
    - [convertToFlatBpcGraph(graph)](#converttoflatbpcgraphgraph)
    - [convertFromFlatBpcGraph(flatBpcGraph)](#convertfromflatbpcgraphflatbpcgraph)
    - [layoutSchematic(graph, options)](#layoutschematicgraph-options)
    - [layoutSchematicWithInputVariants(variants, options)](#layoutschematicwithinputvariantsvariants-options)

## Where BPC graphs are used

When automatically laying out schematics the tools in this repo convert an initial
"floating" design into a fixed layout. Networks can be split, boxes can be adapted to a
template and the resulting graph can be rendered with a force directed solver.

<p align="center">
  <img src="https://github.com/user-attachments/assets/2efa5e6f-b0ba-478f-8cb8-361db267fab4" alt="Example Layout" width="45%" style="display:inline-block; margin-right: 1em;"/>
  <img src="https://github.com/user-attachments/assets/2a5b543b-32e5-4d25-bcc5-f02845e60a9e" alt="Example Template" width="45%" style="display:inline-block;"/>
</p>

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
    { boxId: "A", kind: "fixed", center: { x: 0, y: 0 } },
    { boxId: "B", kind: "fixed", center: { x: 2, y: 0 } },
  ],
  pins: [
    {
      boxId: "A",
      pinId: "P1",
      offset: { x: 0.5, y: 0 },
      color: "red",
      networkId: "N1",
    },
    {
      boxId: "A",
      pinId: "P2",
      offset: { x: 0.5, y: -0.5 },
      color: "blue",
      networkId: "N1",
    },
    {
      boxId: "B",
      pinId: "P1",
      offset: { x: -0.5, y: 0 },
      color: "red",
      networkId: "N1",
    },
    {
      boxId: "B",
      pinId: "CENTER",
      offset: { x: 0, y: 0 },
      color: "gray",
      networkId: "N2",
    },
  ],
}

const svg = getSvgFromGraphicsObject(getGraphicsForBpcGraph(graph), {
  backgroundColor: "white",
  includeTextLabels: true,
})
```

![Basic graph](tests/readme/__snapshots__/getGraphicsExample.snap.svg)

## Library

### getGraphBounds(graph)

```ts
getGraphBounds(g)
// { minX, minY, maxX, maxY }
```

### getPinDirection(graph, boxId, pinId)

Determines which direction a pin is facing (and which side of the box it is on)
by examining its offset relative to the bounds of the box.

```ts
getPinDirection(g, "A", "P1")
// x-" | "x+" | "y-" | "y+" | null
```

### assignFloatingBoxPositions(graph)

Infers positions for floating boxes based on the positions of any connected pins

Starting with floating boxes (no fixed positions), the layout solver can automatically assign positions:

```ts
import { assignFloatingBoxPositions } from "bpc-graph"

const floatingGraph = {
  boxes: [
    { boxId: "A", kind: "floating" },
    { boxId: "B", kind: "floating" },
  ],
  pins: [
    /* ... */
  ],
}

// Convert floating boxes to fixed positions
const fixedGraph = assignFloatingBoxPositions(floatingGraph)
```

The image shows floating boxes (left) being automatically positioned into a fixed layout (right):

![Floating boxes to fixed layout](tests/readme/__snapshots__/floating-boxes-example.snap.svg)

### netAdaptBpcGraph(source, target)

Adapt the source graph so that on a network, connection and pin count level it
matches the target graph. This function will insert or remove pins and boxes or
change network ids until there is a 1:1 matching for boxes and pins between the
source and target.

After net adapt, the graph will have floating boxes- we use `assignFloatingBoxPositions`
to infer positions for these boxes below.

![Net adapt example](tests/bpc-graph-editing/__snapshots__/netAdaptBpcGraph05.snap.svg)

### renetworkWithCondition(graph, predicate)

Change the networks of a graph based on a predicate.

```ts
const { renetworkedGraph } = renetworkWithCondition(
  ogGraph,
  (from, to, networkId) => {
    if (!from.box.center || !to.box.center) return true
    const fromSide =
      from.box.center.x + from.pin.offset.x < component0Center.x
        ? "left"
        : "right"
    const toSide =
      to.box.center.x + to.pin.offset.x < component0Center.x ? "left" : "right"
    return fromSide === toSide
  }
)
```

![Renetwork result](tests/readme/__snapshots__/renetworkExample.snap.svg)

### getBpcGraphWlDistance(a, b)

Compute graph distance based on the "bag of colors" from a Weisfeiler-Leman algorithm. This
algorithm runs several iterations of "color hashes" to create a "bag of colors" for each graph,
a Jaccard index is then computed between the bags of colors.

![Weisfeiler-Leman distance example](tests/readme/__snapshots__/getBpcGraphWlDistance-example.snap.svg)

### ForceDirectedLayoutSolver

Physics based solver for positioning boxes

All type definitions can be imported from `bpc-graph` as well and are located in
`lib/types.ts`.

### getBoxSideSubgraph({ bpcGraph, boxId, side })

Get the subgraph of one side of a box with all connections

![Box Side Subgraph](tests/box-sides/getBoxSideSubgraph/__snapshots__/readme-example.snap.svg)

### mergeBoxSideSubgraphs(graphs)

Merge two subgraphs into a single graph

```ts
import { mergeBoxSideSubgraphs } from "bpc-graph"

const mergedGraph = mergeBoxSideSubgraphs([leftSubgraph, rightSubgraph])
```

![Merging example](tests/box-sides/getBoxSideSubgraph/__snapshots__/merging-example.snap.svg)

### convertToFlatBpcGraph(graph)

Flatten a BPC graph into nodes and undirected edges. This is performed prior
to constructing adjacency matrices. This changes the representation of the graph
from a 2 layer hierarchy to a flat list of nodes and edges.

![Flattening example](tests/readme/__snapshots__/convertToFlatBpcGraph-example.snap.svg)

### convertFromFlatBpcGraph(flatBpcGraph)

Rebuild a BPC graph from the flat representation

### layoutSchematic(graph, options)

Automatically partition, match and lay out a floating BPC graph using a corpus of
known subcircuits.

```ts
import { layoutSchematicGraph } from "bpc-graph"

const { fixedGraph } = layoutSchematicGraph(floatingGraph, { corpus })
```

![layout schematic example](tests/readme/__snapshots__/layoutSchematicExample.snap.svg)

### layoutSchematicWithInputVariants(variants, options)

Try multiple input variants of a floating graph and pick the one that best
matches the corpus.

```ts
import { layoutSchematicGraphVariants } from "bpc-graph"

const { fixedGraph, selectedVariantName } = layoutSchematicGraphVariants(
  variants,
  { corpus },
)
```

![layout schematic variants example](tests/readme/__snapshots__/layoutSchematicVariantsExample.snap.svg)
