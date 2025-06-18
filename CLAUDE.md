# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Start development server**: `bun start` (starts React Cosmos for component development)
- **Build library**: `bun run build` (creates dist/ with ESM and type definitions)
- **Format code**: `bun run format` (auto-format with Biome)
- **Check formatting**: `bun run format:check`
- **Run tests**: `bun test` (uses Bun's built-in test runner)
- **Run single test**: `bun test <path-to-test-file>`
- **Check Types**: `bunx tsc --noEmit`

## Architecture Overview

This is a TypeScript library for working with Box-Pin-Color (BPC) graphs - specialized graph structures for schematic layout and force-directed positioning.

### Core Concepts

**BPC Graph Structure**:

- **Boxes**: Containers that can be `FixedBox` (with position) or `FloatingBox` (no position)
- **Pins**: Connected to boxes with relative positions, colors, and network IDs
- **Networks**: All pins sharing a networkId are mutually connected
- **Colors**: Represent pin attributes (e.g., "red" for power, "yellow" for ground)

**Primary Use Cases**:

1. **Graph Comparison**: Measuring similarity between BPC graphs
2. **Operations**: Transforming FloatingBox graphs to FixedBox graphs
3. **Auto-layout**: Converting floating layouts to fixed layouts using force-directed algorithms

### Key Modules

- `lib/types.ts`: Core type definitions (BpcGraph, BpcPin, BpcBox variants)
- `lib/force-directed-layout/`: Physics-based layout solver with multiple force types
- `lib/operations/`: Graph transformation operations (add box, move pin, change color/network)
- `lib/graph-utils/`: Utilities for bounds calculation, positioning, and graph analysis
- `lib/debug/`: Graphics generation for visualization

### Development Environment

- **Testing**: Uses Bun test runner with SVG snapshot testing via `bun-match-svg`
- **UI Development**: React Cosmos for component playground (pages/ directory)
- **Code Style**: Biome for formatting/linting with kebab-case file naming enforced
- **Build**: tsup for ESM library compilation with TypeScript declarations

The force-directed layout system applies multiple physics forces (box repulsion, pin alignment, center pulling, networked pin attraction) to automatically position floating boxes into optimal fixed layouts.
