import type { CostConfiguration } from "lib/operations/configureOperationCostFn";
import type { BpcGraph, Direction, PinId } from "lib/types";
import type { Assignment } from "./generateAssignments";

export interface HeuristicSimilarityCostContext {
  g1: BpcGraph;
  g2: BpcGraph;
  networkAssignment: Assignment<string, string>;
  costConfiguration: CostConfiguration;
  pinDirectionsG1: Map<PinId, Direction | undefined>;
  pinDirectionsG2: Map<PinId, Direction | undefined>;
}
