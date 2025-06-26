import type { PinId, Vec2 } from "./types"

export type ForceSourceStage =
  | "box-repel"
  | "pin-align"
  | "center-pull"
  | "networked-pin-pull"

export interface ForceVec2 extends Vec2 {
  sourceStage?: ForceSourceStage
  sourcePinId?: PinId // The pin on the box that the force is applied to, if applicable
}
