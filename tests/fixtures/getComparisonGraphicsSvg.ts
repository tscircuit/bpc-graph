import {
  getSvgFromGraphicsObject,
  GraphicsObject,
  getBounds,
} from "graphics-debug"

const translateGraphics = (graphics: GraphicsObject, x: number, y: number) => {
  return {
    ...graphics,
    rects: graphics.rects?.map((rect) => ({
      ...rect,
      center: {
        x: rect.center.x + x,
        y: rect.center.y + y,
      },
    })),
    points: graphics.points?.map((point) => ({
      ...point,
      x: point.x + x,
      y: point.y + y,
    })),
    lines: graphics.lines?.map((line) => ({
      ...line,
      points: line.points?.map((point) => ({
        ...point,
        x: point.x + x,
        y: point.y + y,
      })),
    })),
    circles: graphics.circles?.map((circle) => ({
      ...circle,
      center: {
        x: circle.center.x + x,
        y: circle.center.y + y,
      },
    })),
  }
}

export const mergeGraphics = (
  graphics1: GraphicsObject,
  graphics2: GraphicsObject,
) => {
  return {
    ...graphics1,
    rects: [...(graphics1.rects ?? []), ...(graphics2.rects ?? [])],
    points: [...(graphics1.points ?? []), ...(graphics2.points ?? [])],
    lines: [...(graphics1.lines ?? []), ...(graphics2.lines ?? [])],
    circles: [...(graphics1.circles ?? []), ...(graphics2.circles ?? [])],
  }
}

export const getComparisonGraphicsSvg = (
  graphics1: GraphicsObject,
  graphics2: GraphicsObject,
  opts: {
    title?: string
    caption?: string
  } = {},
) => {
  const bounds1 = getBounds(graphics1)
  const bounds2 = getBounds(graphics2)

  const padding =
    ((bounds1.maxX - bounds2.minX) / 2 + (bounds2.maxX - bounds1.minX) / 2) *
    0.25

  // Combine these graphics into a single graphics object, but shift everything
  // in graphics2 to the right

  const shiftedGraphics2 = translateGraphics(
    graphics2,
    // Shift such that the bounds2.left is where the bounds1.right is, plus padding
    -bounds2.minX + bounds1.minX + (bounds1.maxX - bounds1.minX) + padding,
    -bounds2.minY + bounds1.minY,
  )

  const mergedGraphics = mergeGraphics(graphics1, shiftedGraphics2)

  const bounds = getBounds(mergedGraphics)

  // Add a title and caption to the graphics
  if (opts.title) {
    mergedGraphics.texts ??= []
    mergedGraphics.texts.push({
      x: bounds.minX,
      y: bounds.maxY + (bounds.maxY - bounds.minY) * 0.025,
      text: opts.title,
      fontSize: (bounds.maxY - bounds.minY) * 0.05,
      anchorSide: "bottom_left",
      color: "black",
    })
  }

  if (opts.caption) {
    mergedGraphics.texts ??= []
    mergedGraphics.texts.push({
      x: bounds.minX,
      y: bounds.minY - (bounds.maxY - bounds.minY) * 0.025,
      text: opts.caption,
      fontSize: (bounds.maxY - bounds.minY) * 0.05,
      anchorSide: "top_left",
    })
  }

  return getSvgFromGraphicsObject(mergedGraphics, {
    backgroundColor: "white",
    includeTextLabels: false,
  })
}
