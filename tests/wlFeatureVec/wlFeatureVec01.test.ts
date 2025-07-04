import { expect, test } from "bun:test"
import {
  wlVecWeightedJaccardSimilarity,
  wlVecCosineSimilarity,
} from "lib/adjacency-matrix-network-similarity/wlDotProduct"

// This is really a reproduction of an assignment issue, but helps
// for establishing a regression test for getWlDotProduct

test("wlFeatureVec01 - bigmatch", () => {
  const v1 = [
    {
      box: 1,
      component_center: 1,
      normal: 3,
      gnd: 1,
    },
  ]

  const v2 = [
    {
      box: 5,
      component_center: 1,
      normal: 4,
      vcc: 2,
      gnd: 2,
      netlabel_center: 4,
    },
  ]

  const dist = wlVecWeightedJaccardSimilarity(v1, v2)

  expect(dist).toMatchInlineSnapshot(`0.3333333333333333`)
})

test("wlFeatureVec01 - smallmatch", () => {
  const v1 = [
    {
      box: 1,
      normal: 1,
      netlabel_center: 1,
    },
  ]

  const v2 = [
    {
      box: 5,
      component_center: 1,
      normal: 4,
      vcc: 2,
      gnd: 2,
      netlabel_center: 4,
    },
  ]

  const dist = wlVecWeightedJaccardSimilarity(v1, v2)

  expect(dist).toMatchInlineSnapshot(`0.16666666666666666`)
})
