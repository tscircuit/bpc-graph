import { getColorByIndex } from "lib/graph-utils/getColorByIndex"

const COLOR_MAPPINGS = {
  not_connected: "rgba(0, 0, 0, 0.2)",
  normal: "blue",
  vcc: "orange",
  gnd: "purple",
}

const COMMON_COLORS = [
  "red",
  "green",
  "blue",
  "yellow",
  "purple",
  "orange",
  "brown",
  "gray",
  "black",
  "white",
]

function hashString(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
  }
  return hash
}

/**
 * The color is a BPC graph isn't always a color value, it often has semantic
 * meaning. e.g. "not_connected" or "normal" are common "colors". This function
 * determines if something is a valid color and if not, returns it into a
 * regular color using a simple mapping or hash (if no mapping exists)
 */
export const translateColor = (color: string) => {
  if (
    color.startsWith("rgb") ||
    color.startsWith("hsl") ||
    color.startsWith("#") ||
    COMMON_COLORS.includes(color)
  ) {
    return color
  }

  if (color in COLOR_MAPPINGS) {
    return COLOR_MAPPINGS[color as keyof typeof COLOR_MAPPINGS]
  }

  return getColorByIndex(hashString(color) % 50, 50)
}
