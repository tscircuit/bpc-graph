export const wlVecWeightedJaccardSimilarity = (
  wlFeatureVec1: Array<Record<string, number>>,
  wlFeatureVec2: Array<Record<string, number>>,
): number => {
  let total = 0
  const len = Math.min(wlFeatureVec1.length, wlFeatureVec2.length)

  for (let i = 0; i < len; i++) {
    const rec1 = wlFeatureVec1[i]!
    const rec2 = wlFeatureVec2[i]!

    const allKeys = new Set([...Object.keys(rec1), ...Object.keys(rec2)])

    let sumMin = 0
    let sumMax = 0
    for (const k of allKeys) {
      const v1 = rec1[k] ?? 0
      const v2 = rec2[k] ?? 0
      sumMin += Math.min(v1, v2)
      sumMax += Math.max(v1, v2)
    }

    total += sumMax === 0 ? 0 : sumMin / sumMax // 0 ≤ score ≤ 1
  }

  return total
}

export const wlVecCosineSimilarity = (
  wlFeatureVec1: Array<Record<string, number>>,
  wlFeatureVec2: Array<Record<string, number>>,
): number => {
  let total = 0
  const len = Math.min(wlFeatureVec1.length, wlFeatureVec2.length)
  for (let i = 0; i < len; i++) {
    const rec1 = wlFeatureVec1[i]!
    const rec2 = wlFeatureVec2[i]!
    // Get all unique colors at this step
    const allColors = new Set([...Object.keys(rec1), ...Object.keys(rec2)])
    let dot12 = 0
    let dot11 = 0
    let dot22 = 0
    for (const color of allColors) {
      const v1 = rec1[color]! ?? 0
      const v2 = rec2[color]! ?? 0
      dot12 += v1 * v2
      dot11 += v1 * v1
      dot22 += v2 * v2
    }
    const denom = Math.sqrt(dot11) * Math.sqrt(dot22)
    if (denom > 0) {
      total += dot12 / denom
    } else {
      total += 0
    }
  }
  return total
}

export const getWlDotProduct = wlVecWeightedJaccardSimilarity
