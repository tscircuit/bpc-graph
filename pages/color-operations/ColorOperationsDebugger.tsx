import {ForceDirectedLayoutSolver} from "lib/force-directed-layout/ForceDirectedLayoutSolver";
import {getGraphicsForBpcGraph} from "../../lib/debug/getGraphicsForBpcGraph";
import type {BpcGraph, FloatingBpcGraph} from "../../lib/types";
import { InteractiveGraphics } from "graphics-debug/react"
import {useEffect, useReducer, useRef, useState} from "react";

export const ColorOperationsDebugger = ({
  floatingBpsGraph
}: {
  floatingBpsGraph: FloatingBpcGraph,
}) => {
  return <InteractiveGraphics graphics={getGraphicsForBpcGraph(floatingBpsGraph)} />
}