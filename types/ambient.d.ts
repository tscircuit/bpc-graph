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