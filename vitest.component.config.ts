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
      reportsDirectory: "./coverage/components",
      include: ["src/components/**/*.tsx"],
      exclude: ["src/**/*.test.{ts,tsx}"],
    },
    environment: "happy-dom",
    include: ["src/components/**/*.test.tsx"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
