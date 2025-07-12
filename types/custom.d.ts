declare module "graphics-debug" {
  export type GraphicsObject = any
  export function getSvgFromGraphicsObject(
    graphics: GraphicsObject,
    opts?: {
      backgroundColor?: string
      svgWidth?: number
      svgHeight?: number
    },
  ): string
  // Add any additional minimal typings required by the project here
}

declare module "@tscircuit/schematic-corpus" {
  import type { FixedBpcGraph } from "lib/types"
  const corpus: Record<string, FixedBpcGraph>
  export const corpusNoNetLabel: Record<string, FixedBpcGraph>
  export default corpus
}