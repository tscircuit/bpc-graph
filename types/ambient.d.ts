declare module "graphics-debug" {
  const anyExport: any
  export = anyExport
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
  export const test: any
  export const expect: any
}