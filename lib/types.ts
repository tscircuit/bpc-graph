export interface Vec2 {
  x: number
  y: number
}

export type BpcGraph = FloatingBpcGraph | FixedBpcGraph | MixedBpcGraph

export interface MixedBpcGraph {
  boxes: (BpcFloatingBox | BpcFixedBox)[]
  pins: BpcPin[]
}

export interface FloatingBpcGraph {
  boxes: BpcFloatingBox[]
  pins: BpcPin[]
}

export interface FixedBpcGraph {
  boxes: BpcFixedBox[]
  pins: BpcPin[]
}

export interface BpcFixedBox {
  kind: "fixed"
  boxId: string
  center: Vec2
}

export interface BpcFloatingBox {
  kind: "floating"
  center?: undefined | Vec2
  boxId: string
}

export type BpcBox = BpcFixedBox | BpcFloatingBox

export interface BpcPin {
  boxId: string
  pinId: string
  networkId: string
  color: string
  offset: Vec2
}

export interface Bounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}
export type Direction = "x-" | "x+" | "y+" | "y-"
export type Axis = "x" | "y"

export type BoxId = string
export type PinId = string

/**
 * A flat BPC graph is a non-hierarchical and looks a lot like a regular graph.
 * The boxes are converted to nodes with a color "box", the pins are converted
 * to nodes, and the network ids are converted to fully connected edges
 */
export interface FlatBpcGraph {
  nodes: FlatBpcGraphNode[]
  undirectedEdges: Array<[string, string]>
}

export interface FlatBpcGraphNode {
  id: string // `${boxId}-${pinId}` for pins and just the `boxId` for boxes
  boxId?: BoxId
  pinId?: BoxId
  color: string
  x?: number
  y?: number
}

export * from "./force-types"
