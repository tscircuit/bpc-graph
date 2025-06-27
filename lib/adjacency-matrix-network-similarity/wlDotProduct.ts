export const getWlDotProduct = (
  wlFeatureVec1: Array<Record<string, number>>,
  wlFeatureVec2: Array<Record<string, number>>,
): number => {
  let totalDot = 0
  const len = Math.min(wlFeatureVec1.length, wlFeatureVec2.length)
  for (let i = 0; i < len; i++) {
    const rec1 = wlFeatureVec1[i]!
    const rec2 = wlFeatureVec2[i]!
    // Get all unique colors at this step
    const allColors = new Set([...Object.keys(rec1), ...Object.keys(rec2)])
    let stepDot = 0
    for (const color of allColors) {
      const v1 = rec1[color]! ?? 0
      const v2 = rec2[color]! ?? 0
      stepDot += v1 * v2
    }
    totalDot += stepDot
  }
  return totalDot
}
