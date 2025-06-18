import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { resolve } from "node:path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      lib: resolve(import.meta.dirname, "lib"),
    },
  },
})
