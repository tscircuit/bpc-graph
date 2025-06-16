import type {BpcGraph} from "../types";
import type {GraphicsObject} from "graphics-debug";

export const getGraphicsForBpcGraph = (graph: BpcGraph) => {
  const graphics: Required<GraphicsObject> = {
    points: [],
    lines: [],
    rects: [],
    circles: [],
    coordinateSystem: "cartesian",
    title: "BPC Graph Graphics"
  }
}