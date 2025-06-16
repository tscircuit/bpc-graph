export const getColorByIndex = (index: number, total: number, opacity?: number): string => {
  // Generate a distinct color using HSL based on the index and total count.
  // This ensures colors are distributed evenly around the color wheel.
  const hue = (index * 360) / total
  return `hsl(${hue}, 100%, 50%, ${opacity ?? 1})`
}