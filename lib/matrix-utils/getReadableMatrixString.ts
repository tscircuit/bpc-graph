export const getReadableMatrixString = (
  matrix: number[][],
  opts?: {
    headers?: string[]
    colHeaders?: string[]
    rowHeaders?: string[]
  },
) => {
  const { headers, colHeaders, rowHeaders } = opts ?? {}

  // If headers is provided, use it for both colHeaders and rowHeaders (adjacency matrix style)
  const finalColHeaders = headers ?? colHeaders
  const finalRowHeaders = headers ?? rowHeaders

  // Determine the width of each column for alignment
  const colCount = matrix[0]?.length ?? 0
  const allColHeaders = finalColHeaders ?? []
  const allRowHeaders = finalRowHeaders ?? []
  const colWidths: number[] = []

  // Compute max width for each column (including header if present)
  for (let j = 0; j < colCount; ++j) {
    let maxWidth = 0
    for (let i = 0; i < matrix.length; ++i) {
      maxWidth = Math.max(maxWidth, matrix[i]![j]!.toString().length)
    }
    if (allColHeaders[j] !== undefined) {
      maxWidth = Math.max(maxWidth, allColHeaders[j]!.toString().length)
    }
    colWidths[j] = Math.max(2, maxWidth) // at least 2 for readability
  }

  // Compute row header width
  let rowHeaderWidth = 0
  if (allRowHeaders.length > 0) {
    for (const rh of allRowHeaders) {
      rowHeaderWidth = Math.max(rowHeaderWidth, rh.toString().length)
    }
    rowHeaderWidth = Math.max(rowHeaderWidth, 2)
  }

  // Build header row if needed
  let result = "\n"
  if (allColHeaders.length > 0) {
    if (allRowHeaders.length > 0) {
      result += " ".repeat(rowHeaderWidth) + " "
    }
    result += allColHeaders
      .map((h, j) => h.toString().padStart(colWidths[j]!, " "))
      .join(" ")
    result += "\n"
  }

  // Build matrix rows
  result += matrix
    .map((row, i) => {
      let line = ""
      if (allRowHeaders.length > 0) {
        line += allRowHeaders[i]
          ? `${allRowHeaders[i].toString().padStart(rowHeaderWidth, " ")} `
          : `${" ".repeat(rowHeaderWidth)} `
      }
      line += row
        .map((x, j) => x.toString().padStart(colWidths[j]!, " "))
        .join(" ")
      return line
    })
    .join("\n")

  return result
}
