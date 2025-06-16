export interface Vec2 {
  x: number
  y: number
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
  boxId: string,
  center: Vec2
}

export interface BpcFloatingBox {
  boxId: string
}

export interface BpcPin {
  pinId: string
  networkId: string
  color: string
  offset: Vec2
}