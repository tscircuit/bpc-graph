/**
 * Swap two rows and columns in a square matrix in-place.
 *
 * @param m - The square matrix (2D array) to modify.
 * @param i - The index of the first row/column to swap.
 * @param j - The index of the second row/column to swap.
 */
export function swapRowsAndColumns(m: number[][], i: number, j: number): void {
  if (i === j) return // swap rows
  ;[m[i], m[j]] = [m[j]!, m[i]!]
  // swap columns
  for (const row of m) {
    ;[row[i], row[j]] = [row[j]!, row[i]!]
  }
}
