/**
 * Smallest angular separation (radians) between two directions on the unit circle.
 * Always in [0, π].
 */
const circularDistance = (a: number, b: number): number => {
  const TAU = 2 * Math.PI // 360 °
  const raw = Math.abs(a - b) % TAU
  return Math.min(raw, TAU - raw)
}

/**
 * Symmetric “average-nearest-neighbour” distance between two bags of angles.
 *
 * - If both bags are empty → 0.
 * - If exactly one bag is empty → π (worst-case half-circle).
 * - Otherwise:
 *     1. For every angle in `bag1`, find its closest match in `bag2`
 *        and average those distances.
 *     2. Do the same with the roles reversed.
 *     3. Return the mean of the two averages.
 *
 * The result is always in [0, π] radians   (≈ 0 ° … 180 °).
 */
export const computeBagOfAnglesDistance = (
  bag1: number[],
  bag2: number[],
): number => {
  // Handle degenerate cases first
  if (bag1.length === 0 && bag2.length === 0) return 0
  if (bag1.length === 0 || bag2.length === 0) return Math.PI

  const avgNearest = (src: number[], tgt: number[]): number => {
    let sum = 0
    for (const a of src) {
      let best = Infinity
      for (const b of tgt) {
        const d = circularDistance(a, b)
        if (d < best) best = d
      }
      sum += best
    }
    return sum / src.length
  }

  return (avgNearest(bag1, bag2) + avgNearest(bag2, bag1)) / 2
}
