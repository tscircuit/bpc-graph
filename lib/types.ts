export interface Vec2 {
  x: number
  y: number
}

export interface BpcGraph {
  boxes: BpcBox[]
  pins: BpcPin[]
}

export interface BpcBox {
  boxId: string,
  center: Vec2
}

export interface BpcPin {
  pinId: string
  networkId: string
  color: string
  offset: Vec2
}