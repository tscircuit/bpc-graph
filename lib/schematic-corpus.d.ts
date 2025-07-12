declare module "@tscircuit/schematic-corpus" {
  import type { FixedBpcGraph } from "lib/types"

  const corpus: Record<string, FixedBpcGraph>
  export default corpus
  export const corpusNoNetLabel: Record<string, FixedBpcGraph>
}