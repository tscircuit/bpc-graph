import type { BpcGraph } from "../types"
import type { ElementDefinition } from "cytoscape"

export const convertBpcGraphToCytoscape = (
  g: BpcGraph,
): ElementDefinition[] => {
  const elements: ElementDefinition[] = []

  for (const box of g.boxes) {
    const node: ElementDefinition = {
      data: {
        id: box.boxId,
        label: box.boxId,
      },
    }
    if (box.center) {
      node.position = { x: box.center.x, y: box.center.y }
    }
    elements.push(node)
  }

  const networks: Record<string, typeof g.pins> = {}
  for (const pin of g.pins) {
    networks[pin.networkId] ||= []
    networks[pin.networkId].push(pin)
  }

  for (const networkId of Object.keys(networks)) {
    const pins = networks[networkId]!
    for (let i = 0; i < pins.length; i++) {
      for (let j = i + 1; j < pins.length; j++) {
        const p1 = pins[i]!
        const p2 = pins[j]!
        elements.push({
          data: {
            id: `${p1.pinId}-${p2.pinId}`,
            source: p1.boxId,
            target: p2.boxId,
            networkId,
            color: p1.color,
          },
        })
      }
    }
  }

  return elements
}
