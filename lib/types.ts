export interface Vec2 {
  x: number
  y: number
}

export interface ForceVec2 extends Vec2 {
  source?: string
}

export type BpcGraph = FloatingBpcGraph | FixedBpcGraph

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
  boxId: string,
  center: Vec2
}

export interface BpcFloatingBox {
  kind: "floating"
  center?: undefined | Vec2
  boxId: string
}

export interface BpcPin {
  boxId: string
  pinId: string
  networkId: string
  color: string
  offset: Vec2
}

export interface Bounds {
  minX: number,
  minY: number,
  maxX: number,
  maxY: number
}
export type Direction = "x-" | "x+" | "y+" | "y-"
export type Axis = "x" | "y"

export type BoxId = string
export type PinId = string