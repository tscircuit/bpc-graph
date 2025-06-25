import { test, expect } from "bun:test"

// Reproduces an error where we select design006 and attempt to match it to
// other graphs and it hangs forever
test("schematic-corpus01", () => {})
