export const euclidean = (A: number[], B: number[]) => {
  return Math.sqrt(A.reduce((acc, x, i) => acc + (x - B[i]!) ** 2, 0))
}
