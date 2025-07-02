declare module "graphics-debug" {
  export interface GraphicsObject {
    [k: string]: any
  }
  export function getSvgFromGraphicsObject(...args: any[]): string
  export function stackGraphicsHorizontally(...args: any[]): GraphicsObject
  export function stackGraphicsVertically(...args: any[]): GraphicsObject
}

declare module "@tscircuit/schematic-corpus/dist/bundled-bpc-graphs.json" {
  const value: Record<string, any>
  export default value
}

declare global {
  interface ImportMeta {
    /** Bun exposes the absolute file path on ImportMeta */
    path?: string
  }
}

declare module "bun:test" {
  export interface Expect {
    <T = any>(value: T): Matchers<T>
  }
  export interface Matchers<T> {
    toBe(value: any): void
    toEqual(value: any): void
    toMatchInlineSnapshot(snapshot?: string | any): void
    toMatchSnapshot(): void
    toMatchSvgSnapshot(...args: any[]): void
  }
  export const test: (name: string, fn: (...args: any[]) => any) => void
  export const expect: Expect
}

declare module "tscircuit" {
  export const runTscircuitCode: any
  export const sel: any
}

declare module "circuit-json-to-bpc" {
  export function convertCircuitJsonToBpc(...args: any[]): any
}

declare module "circuit-to-svg" {
  export function convertCircuitJsonToSchematicSvg(...args: any[]): any
}

declare module "lib/index" {
  import type { BpcGraph } from "lib/types"
  export function getGraphicsForBpcGraph(graph: any, opts?: any): any
  export function renetworkWithCondition(
    g: BpcGraph,
    predicate: (
      from: { box: any; pin: any },
      to: { box: any; pin: any },
      networkId: string,
    ) => boolean,
  ): { renetworkedGraph: BpcGraph; renetworkedNetworkIdMap: Record<string, string> }
  export function getBoxSideSubgraph(args: any): BpcGraph
  export function mergeBoxSideSubgraphs(graphs: BpcGraph[], opts?: any): BpcGraph
  export function assignFloatingBoxPositions(g: any): any
  export function netAdaptBpcGraph(src: any, tgt: any): { adaptedBpcGraph: any }
  export function matchGraph(g: any, corpus: any, opts?: any): any
  export function reflectGraph(args: any): any
  export function mergeNetworks(graph: BpcGraph, map: Record<string, string>): BpcGraph
}