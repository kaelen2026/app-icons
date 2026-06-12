import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage/unit",
      include: [
        "src/lib/configStorage.ts",
        "src/lib/exportPresets.ts",
        "src/lib/ico.ts",
        "src/lib/lucide.ts",
        "src/lib/presets.ts",
        "src/lib/savedDesigns.ts",
        "src/lib/variations.ts",
      ],
      exclude: ["src/**/*.test.{ts,tsx}"],
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
    },
    environment: "happy-dom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
