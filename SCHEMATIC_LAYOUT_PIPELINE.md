# Schematic Layout Pipeline Implementation

This document describes the complete schematic layout algorithm pipeline that has been implemented for tscircuit.

## Overview

The schematic layout algorithm rewrites the position of each schematic component (resistors, capacitors, chips etc.) to match "common patterns" for schematic layout. The pipeline consists of four main steps:

1. **Partitioning** - Split BPC graph into subgraphs for each side of chips
2. **Matching** - Find best matching patterns from the schematic corpus
3. **Adaptation** - Adapt each partition to match the corpus pattern
4. **Merging** - Combine partitions back into a complete layout

## Implementation Details

### 1. Partitioning (`partitionBpcGraph`)

**Location**: `lib/box-sides/partitionBpcGraph.ts`

The partitioning step breaks up the input BPC Graph into many subgraphs, each containing just one side of a chip. This is essential because the corpus only contains "pattern sections" focusing on single sides of chips.

**Key Features**:
- Uses DFS to include everything connected to each side of a box
- Special handling for netlabels (VCC/GND) that are shared across multiple partitions
- Filters out center pins and netlabel center pins that don't represent actual component connections
- Returns an array of `BpcGraphPartition` objects with metadata

**Netlabel Handling**:
The implementation correctly handles power/ground netlabels that need to be included in multiple partitions:
```typescript
// VCC/GND netlabels are added to partitions if they connect to the same networks
const isVccGnd = pin.color.toLowerCase() === "vcc" || 
                 pin.color.toLowerCase() === "gnd" ||
                 pin.color.toLowerCase() === "power" ||
                 pin.color.toLowerCase() === "ground"
```

### 2. Matching (`matchGraph`)

**Location**: `lib/match-graph/matchGraph.ts`

Each partition is matched against the schematic corpus using Weisfeiler-Lehman distance to find the best structural pattern.

**Process**:
- Converts BPC graphs to flat representations
- Computes adjacency matrices and feature vectors
- Returns the corpus design with the lowest WL distance

### 3. Adaptation (`netAdaptBpcGraph`)

**Location**: `lib/bpc-graph-editing/netAdaptBpcGraph.ts`

Adapts the source partition to match the target corpus pattern while preserving the original circuit's connectivity.

**Steps**:
- Gets approximate assignments between source and target nodes
- Computes edit operations needed to transform the adjacency matrix
- Applies adaptations to boxes and pins
- Handles creation/deletion of nodes as needed

### 4. Merging (`mergePartitions`)

**Location**: `lib/box-sides/mergePartitions.ts`

Combines all processed partitions back into a single BPC graph, avoiding duplicates.

## Test Coverage

### Main Pipeline Test
**File**: `tests/tscircuit-schematic-layout/tscircuitsch01.test.tsx`

Demonstrates the complete pipeline on a realistic circuit with:
- SOIC8 chip in the center
- Voltage divider on the left
- Pullup resistors on the right
- Shared VCC/GND power nets

The test visualizes each step of the pipeline using graphics stacking.

### Netlabel Sharing Test
**File**: `tests/tscircuit-schematic-layout/netlabel-partition.test.tsx`

Specifically tests that VCC/GND netlabels are correctly shared across multiple partitions when two chips share the same power rails.

**Verification**:
- Ensures VCC appears in multiple partitions (6 partitions in test case)
- Ensures GND appears in multiple partitions (6 partitions in test case)
- Validates that power nets are properly distributed

### Full Pipeline Test
**File**: `tests/tscircuit-schematic-layout/full-pipeline.test.tsx`

Comprehensive test that includes adaptation step and provides detailed logging of each phase:
- Shows partition counts and structure
- Logs matching results with corpus names and distances
- Demonstrates the complete transformation process

## Key Algorithms

### Box Side Detection
Uses pin directions to determine which side of a box each pin belongs to:
```typescript
const sideToDirection: Record<Side, Direction> = {
  left: "x-",
  right: "x+", 
  top: "y+",
  bottom: "y-",
}
```

### Network Connectivity
Preserves electrical connectivity while allowing layout transformation:
- Pins on the same network remain connected
- Netlabels maintain their network associations
- Cross-partition connections are preserved through shared netlabels

### Floating Box Positioning
Infers positions for components without fixed locations based on their pin connections to already-placed components.

## Usage Example

```typescript
import { 
  partitionBpcGraph, 
  matchGraph, 
  netAdaptBpcGraph, 
  mergePartitions 
} from "lib/index"

// 1. Partition the circuit
const partitions = partitionBpcGraph(bpcGraph)

// 2. Process each partition
const processedPartitions = partitions.map(partition => {
  const matchResult = matchGraph(partition.subgraph, corpus)
  const adapted = netAdaptBpcGraph(
    assignFloatingBoxPositions(partition.subgraph),
    matchResult.graph
  )
  return { ...partition, subgraph: adapted.adaptedBpcGraph }
})

// 3. Merge results
const finalLayout = mergePartitions(processedPartitions)
```

## Current Status

✅ **Implemented**:
- Complete partitioning with netlabel sharing
- Corpus matching using WL distance
- Graph adaptation with edit operations
- Partition merging
- Comprehensive test suite

🔄 **Future Enhancements**:
- More sophisticated adaptation algorithms
- Better handling of complex multi-chip layouts
- Performance optimizations for large circuits
- Additional corpus patterns

The implementation successfully demonstrates the complete pipeline and handles the key challenge of netlabel sharing across partitions, which is critical for proper power distribution in schematic layouts.