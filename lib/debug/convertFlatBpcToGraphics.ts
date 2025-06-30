import { translateColor } from "./translateColor"
import { getBounds, type GraphicsObject } from "graphics-debug"
import type { FlatBpcGraph } from "lib/types"

/**
 * Render a FlatBpcGraph into a GraphicsObject so it can be visualised
 * next to the regular BPC-graph representation.
 */
export const convertFlatBpcToGraphics = (
  flat: FlatBpcGraph,
  opts: { title?: string; caption?: string } = {},
): GraphicsObject => {
  const gfx: Required<GraphicsObject> = {
    points: [],
    lines: [],
    rects: [],
    circles: [],
    texts: [],
    coordinateSystem: "cartesian",
    title: "Flat-BPC Graphics",
  }

  /* ---------------------  points  --------------------- */
  const pos = new Map<string, { x: number; y: number }>()
  for (const n of flat.nodes) {
    if (n.x === undefined || n.y === undefined) continue // can’t draw
    const p = { x: n.x, y: n.y }
    pos.set(n.id, p)
    gfx.points.push({
      ...p,
      color: translateColor(n.color),
      label: n.id,
    })
  }

  /* ---------------------  edges  ---------------------- */
  for (const [a, b] of flat.undirectedEdges) {
    const pa = pos.get(a)
    const pb = pos.get(b)
    if (pa && pb) {
      gfx.lines.push({
        points: [pa, pb],
        strokeColor: "rgba(0,0,0,0.3)",
        strokeWidth: 1,
      })
    }
  }

  /* -------------------  title / caption  -------------- */
  const bounds = getBounds(gfx)
  if (opts.title) {
    gfx.texts.push({
      text: opts.title,
      x: bounds.minX,
      y: bounds.maxY,
      fontSize: (bounds.maxY - bounds.minY) * 0.05,
      anchorSide: "bottom_left",
    })
  }
  if (opts.caption) {
    gfx.texts.push({
      text: opts.caption,
      x: bounds.minX,
      y: bounds.minY,
      fontSize: (bounds.maxY - bounds.minY) * 0.05,
      anchorSide: "top_left",
    })
  }

  return gfx
}
