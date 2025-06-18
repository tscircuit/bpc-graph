import { test, expect } from "bun:test"
import type { BpcGraph, PinId, Direction } from "lib/types"
import type { CostConfiguration } from "lib/operations/configureOperationCostFn"
import type { Assignment } from "lib/heuristic-network-similarity/generateAssignments"
import { calculateMappingCost } from "lib/heuristic-network-similarity/calculateMappingCost"
import type { HeuristicSimilarityCostContext } from "lib/heuristic-network-similarity/types"
import { precomputePinDirections } from "lib/heuristic-network-similarity/precomputePinDirections"

const testCostConfiguration: CostConfiguration = {
  baseOperationCost: 1,
  colorChangeCostMap: {
    "red->blue": 0.5,
    "blue->red": 0.5,
  },
  costPerUnitDistanceMovingPin: 0, // Not relevant for these tests
}

const emptyGraph: BpcGraph = { boxes: [], pins: [] }

test("identical empty graphs", () => {
  const boxAssignment: Assignment<string, string> = {
    map: new Map(),
    unmappedRhs: new Set(),
  }
  const networkAssignment: Assignment<string, string> = {
    map: new Map(),
    unmappedRhs: new Set(),
  }
  const pinDirectionsG1 = precomputePinDirections(emptyGraph)
  const pinDirectionsG2 = precomputePinDirections(emptyGraph)

  const context: HeuristicSimilarityCostContext = {
    g1: emptyGraph,
    g2: emptyGraph,
    networkAssignment,
    costConfiguration: testCostConfiguration,
    pinDirectionsG1,
    pinDirectionsG2,
  }

  const cost = calculateMappingCost({ context, boxAssignment })
  expect(cost).toBe(0)
})

test("identical single box, single pin graphs", () => {
  const g: BpcGraph = {
    boxes: [{ boxId: "B1", kind: "floating", center: { x: 0, y: 0 } }],
    pins: [
      {
        boxId: "B1",
        pinId: "P1",
        offset: { x: 0, y: 0.5 },
        color: "red",
        networkId: "N1",
      },
    ],
  }
  const boxAssignment: Assignment<string, string> = {
    map: new Map([["B1", "B1"]]),
    unmappedRhs: new Set(),
  }
  const networkAssignment: Assignment<string, string> = {
    map: new Map([["N1", "N1"]]),
    unmappedRhs: new Set(),
  }
  const pinDirectionsG1 = precomputePinDirections(g)
  const pinDirectionsG2 = precomputePinDirections(g)

  const context: HeuristicSimilarityCostContext = {
    g1: g,
    g2: g,
    networkAssignment,
    costConfiguration: testCostConfiguration,
    pinDirectionsG1,
    pinDirectionsG2,
  }
  const cost = calculateMappingCost({ context, boxAssignment })
  expect(cost).toBe(0)
})

test("add one box with one pin", () => {
  const g1: BpcGraph = emptyGraph
  const g2: BpcGraph = {
    boxes: [{ boxId: "B1", kind: "floating", center: { x: 0, y: 0 } }],
    pins: [
      {
        boxId: "B1",
        pinId: "P1",
        offset: { x: 0, y: 0.5 },
        color: "red",
        networkId: "N1",
      },
    ],
  }

  // Box B1 in g2 is unmapped from g1's perspective (it's new)
  const boxAssignment: Assignment<string, string> = {
    map: new Map(),
    unmappedRhs: new Set(["B1"]),
  }
  // Network N1 in g2 is unmapped from g1's perspective
  const networkAssignment: Assignment<string, string> = {
    map: new Map(),
    unmappedRhs: new Set(["N1"]),
  }

  const pinDirectionsG1 = precomputePinDirections(g1)
  const pinDirectionsG2 = precomputePinDirections(g2)

  const context: HeuristicSimilarityCostContext = {
    g1,
    g2,
    networkAssignment,
    costConfiguration: testCostConfiguration,
    pinDirectionsG1,
    pinDirectionsG2,
  }

  const cost = calculateMappingCost({ context, boxAssignment })
  // Cost = add box B1 (1) + add pin P1 (1) = 2
  expect(cost).toBe(2)
})

test("remove one box with one pin", () => {
  const g1: BpcGraph = {
    boxes: [{ boxId: "B1", kind: "floating", center: { x: 0, y: 0 } }],
    pins: [
      {
        boxId: "B1",
        pinId: "P1",
        offset: { x: 0, y: 0.5 },
        color: "red",
        networkId: "N1",
      },
    ],
  }
  const g2: BpcGraph = emptyGraph

  // Box B1 in g1 maps to null (it's removed)
  const boxAssignment: Assignment<string, string> = {
    map: new Map([["B1", null]]),
    unmappedRhs: new Set(),
  }
  // Network N1 in g1 maps to null
  const networkAssignment: Assignment<string, string> = {
    map: new Map([["N1", null]]),
    unmappedRhs: new Set(),
  }

  const pinDirectionsG1 = precomputePinDirections(g1)
  const pinDirectionsG2 = precomputePinDirections(g2)

  const context: HeuristicSimilarityCostContext = {
    g1,
    g2,
    networkAssignment,
    costConfiguration: testCostConfiguration,
    pinDirectionsG1,
    pinDirectionsG2,
  }

  const cost = calculateMappingCost({ context, boxAssignment })
  // Cost = remove box B1 (1) + remove pin P1 (1) = 2
  expect(cost).toBe(2)
})

test("change pin color", () => {
  const g1: BpcGraph = {
    boxes: [{ boxId: "B1", kind: "floating", center: { x: 0, y: 0 } }],
    pins: [
      {
        boxId: "B1",
        pinId: "P1",
        offset: { x: 0, y: 0.5 },
        color: "red",
        networkId: "N1",
      },
    ],
  }
  const g2: BpcGraph = {
    boxes: [{ boxId: "B1", kind: "floating", center: { x: 0, y: 0 } }],
    pins: [
      {
        boxId: "B1",
        pinId: "P1",
        offset: { x: 0, y: 0.5 },
        color: "blue",
        networkId: "N1",
      },
    ],
  }
  const boxAssignment: Assignment<string, string> = {
    map: new Map([["B1", "B1"]]),
    unmappedRhs: new Set(),
  }
  const networkAssignment: Assignment<string, string> = {
    map: new Map([["N1", "N1"]]),
    unmappedRhs: new Set(),
  }
  const pinDirectionsG1 = precomputePinDirections(g1)
  const pinDirectionsG2 = precomputePinDirections(g2)

  const context: HeuristicSimilarityCostContext = {
    g1,
    g2,
    networkAssignment,
    costConfiguration: testCostConfiguration,
    pinDirectionsG1,
    pinDirectionsG2,
  }
  const cost = calculateMappingCost({ context, boxAssignment })
  // Cost = change P1 color from red to blue (0.5)
  expect(cost).toBe(0.5)
})

test("change pin network", () => {
  const g1: BpcGraph = {
    boxes: [{ boxId: "B1", kind: "floating", center: { x: 0, y: 0 } }],
    pins: [
      {
        boxId: "B1",
        pinId: "P1",
        offset: { x: 0, y: 0.5 },
        color: "red",
        networkId: "N1",
      },
    ],
  }
  const g2: BpcGraph = {
    boxes: [{ boxId: "B1", kind: "floating", center: { x: 0, y: 0 } }],
    pins: [
      {
        boxId: "B1",
        pinId: "P1",
        offset: { x: 0, y: 0.5 },
        color: "red",
        networkId: "N2",
      },
    ],
  }
  const boxAssignment: Assignment<string, string> = {
    map: new Map([["B1", "B1"]]),
    unmappedRhs: new Set(),
  }
  // N1 maps to N2
  const networkAssignment: Assignment<string, string> = {
    map: new Map([["N1", "N2"]]),
    unmappedRhs: new Set(),
  }
  const pinDirectionsG1 = precomputePinDirections(g1)
  const pinDirectionsG2 = precomputePinDirections(g2)

  const context: HeuristicSimilarityCostContext = {
    g1,
    g2,
    networkAssignment,
    costConfiguration: testCostConfiguration,
    pinDirectionsG1,
    pinDirectionsG2,
  }
  const cost = calculateMappingCost({ context, boxAssignment })
  // Cost = 0 because N1 is mapped to N2, so pin P1's network effectively remains "the same" under mapping.
  // If N1 was mapped to null, and N2 was unmappedRhs, then it would be a change.
  expect(cost).toBe(0)
})

test("change pin network (N1 unmapped, N2 new)", () => {
  const g1: BpcGraph = {
    boxes: [{ boxId: "B1", kind: "floating", center: { x: 0, y: 0 } }],
    pins: [
      {
        boxId: "B1",
        pinId: "P1",
        offset: { x: 0, y: 0.5 },
        color: "red",
        networkId: "N1",
      },
    ],
  }
  const g2: BpcGraph = {
    boxes: [{ boxId: "B1", kind: "floating", center: { x: 0, y: 0 } }],
    pins: [
      {
        boxId: "B1",
        pinId: "P1",
        offset: { x: 0, y: 0.5 },
        color: "red",
        networkId: "N2",
      },
    ],
  }
  const boxAssignment: Assignment<string, string> = {
    map: new Map([["B1", "B1"]]),
    unmappedRhs: new Set(),
  }
  // N1 from g1 is unmapped (effectively deleted), N2 from g2 is new.
  const networkAssignment: Assignment<string, string> = {
    map: new Map([["N1", null]]),
    unmappedRhs: new Set(["N2"]),
  }
  const pinDirectionsG1 = precomputePinDirections(g1)
  const pinDirectionsG2 = precomputePinDirections(g2)

  const context: HeuristicSimilarityCostContext = {
    g1,
    g2,
    networkAssignment,
    costConfiguration: testCostConfiguration,
    pinDirectionsG1,
    pinDirectionsG2,
  }
  const cost = calculateMappingCost({ context, boxAssignment })
  // Cost = change P1 network (1)
  expect(cost).toBe(1)
})

test("add pin to existing mapped box", () => {
  const g1: BpcGraph = {
    boxes: [{ boxId: "B1", kind: "floating", center: { x: 0, y: 0 } }],
    pins: [
      {
        boxId: "B1",
        pinId: "P1",
        offset: { x: 0, y: 0.5 },
        color: "red",
        networkId: "N1",
      },
    ],
  }
  const g2: BpcGraph = {
    boxes: [{ boxId: "B1", kind: "floating", center: { x: 0, y: 0 } }],
    pins: [
      {
        boxId: "B1",
        pinId: "P1",
        offset: { x: 0, y: 0.5 },
        color: "red",
        networkId: "N1",
      },
      {
        boxId: "B1",
        pinId: "P2",
        offset: { x: 0, y: -0.5 },
        color: "blue",
        networkId: "N2",
      },
    ],
  }
  const boxAssignment: Assignment<string, string> = {
    map: new Map([["B1", "B1"]]),
    unmappedRhs: new Set(),
  }
  const networkAssignment: Assignment<string, string> = {
    map: new Map([["N1", "N1"]]), // N1 maps to N1
    unmappedRhs: new Set(["N2"]), // N2 is new in g2
  }
  const pinDirectionsG1 = precomputePinDirections(g1)
  const pinDirectionsG2 = precomputePinDirections(g2)

  const context: HeuristicSimilarityCostContext = {
    g1,
    g2,
    networkAssignment,
    costConfiguration: testCostConfiguration,
    pinDirectionsG1,
    pinDirectionsG2,
  }
  const cost = calculateMappingCost({ context, boxAssignment })
  // Cost = add pin P2 (1)
  expect(cost).toBe(1)
})

test("remove pin from existing mapped box", () => {
  const g1: BpcGraph = {
    boxes: [{ boxId: "B1", kind: "floating", center: { x: 0, y: 0 } }],
    pins: [
      {
        boxId: "B1",
        pinId: "P1",
        offset: { x: 0, y: 0.5 },
        color: "red",
        networkId: "N1",
      },
      {
        boxId: "B1",
        pinId: "P2",
        offset: { x: 0, y: -0.5 },
        color: "blue",
        networkId: "N2",
      },
    ],
  }
  const g2: BpcGraph = {
    boxes: [{ boxId: "B1", kind: "floating", center: { x: 0, y: 0 } }],
    pins: [
      {
        boxId: "B1",
        pinId: "P1",
        offset: { x: 0, y: 0.5 },
        color: "red",
        networkId: "N1",
      },
    ],
  }
  const boxAssignment: Assignment<string, string> = {
    map: new Map([["B1", "B1"]]),
    unmappedRhs: new Set(),
  }
  const networkAssignment: Assignment<string, string> = {
    map: new Map([
      ["N1", "N1"],
      ["N2", null],
    ]), // N1 maps to N1, N2 is removed
    unmappedRhs: new Set(),
  }
  const pinDirectionsG1 = precomputePinDirections(g1)
  const pinDirectionsG2 = precomputePinDirections(g2)

  const context: HeuristicSimilarityCostContext = {
    g1,
    g2,
    networkAssignment,
    costConfiguration: testCostConfiguration,
    pinDirectionsG1,
    pinDirectionsG2,
  }
  const cost = calculateMappingCost({ context, boxAssignment })
  // Cost = remove pin P2 (1)
  expect(cost).toBe(1)
})

test("complex case: add box, remove box, change pin, add pin, remove pin", () => {
  const g1: BpcGraph = {
    boxes: [
      { boxId: "B1", kind: "floating", center: { x: 0, y: 0 } }, // Mapped to B1_g2
      { boxId: "B2", kind: "floating", center: { x: 1, y: 0 } }, // To be removed
    ],
    pins: [
      {
        boxId: "B1",
        pinId: "P1_B1",
        offset: { x: 0, y: 0.5 },
        color: "red",
        networkId: "N1",
      }, // Color change, network change
      {
        boxId: "B1",
        pinId: "P2_B1",
        offset: { x: 0, y: -0.5 },
        color: "green",
        networkId: "N2",
      }, // To be removed
      {
        boxId: "B2",
        pinId: "P1_B2",
        offset: { x: 0, y: 0.5 },
        color: "yellow",
        networkId: "N3",
      }, // Part of removed B2
    ],
  }
  const g2: BpcGraph = {
    boxes: [
      { boxId: "B1_g2", kind: "floating", center: { x: 0, y: 0 } }, // Mapped from B1
      { boxId: "B3_g2", kind: "floating", center: { x: 2, y: 0 } }, // New box
    ],
    pins: [
      {
        boxId: "B1_g2",
        pinId: "P1_B1_g2",
        offset: { x: 0, y: 0.5 },
        color: "blue",
        networkId: "N1_g2",
      }, // Mapped from P1_B1
      {
        boxId: "B1_g2",
        pinId: "P3_B1_g2",
        offset: { x: 0.5, y: 0 },
        color: "purple",
        networkId: "N4_g2",
      }, // New pin in B1_g2
      {
        boxId: "B3_g2",
        pinId: "P1_B3_g2",
        offset: { x: 0, y: 0.5 },
        color: "orange",
        networkId: "N5_g2",
      }, // Pin in new B3_g2
    ],
  }

  const boxAssignment: Assignment<string, string> = {
    map: new Map([
      ["B1", "B1_g2"],
      ["B2", null],
    ]),
    unmappedRhs: new Set(["B3_g2"]),
  }
  const networkAssignment: Assignment<string, string> = {
    map: new Map([
      ["N1", "N1_g2"],
      ["N2", null],
      ["N3", null],
    ]),
    unmappedRhs: new Set(["N4_g2", "N5_g2"]),
  }

  const pinDirectionsG1 = precomputePinDirections(g1)
  const pinDirectionsG2 = precomputePinDirections(g2)

  const context: HeuristicSimilarityCostContext = {
    g1,
    g2,
    networkAssignment,
    costConfiguration: testCostConfiguration,
    pinDirectionsG1,
    pinDirectionsG2,
  }

  const cost = calculateMappingCost({ context, boxAssignment })
  // Breakdown:
  // 1. Box B2 removed: 1 (box) + 1 (P1_B2) = 2
  // 2. Box B3_g2 added: 1 (box) + 1 (P1_B3_g2) = 2
  // 3. Box B1 mapped to B1_g2:
  //    - P1_B1 (red, N1) -> P1_B1_g2 (blue, N1_g2):
  //        - Color red->blue: 0.5
  //        - Network N1->N1_g2: 0 (mapped)
  //        Total for P1_B1: 0.5
  //    - P2_B1 (green, N2) removed: 1
  //    - P3_B1_g2 (purple, N4_g2) added: 1
  //    Total for B1/B1_g2 mapping: 0.5 + 1 + 1 = 2.5
  // Total cost = 2 (remove B2) + 2 (add B3_g2) + 2.5 (B1 map) = 6.5
  expect(cost).toBe(6.5)
})
