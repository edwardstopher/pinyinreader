import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    testTimeout: 30000,
  },
  build: {
    target: "es2022",
    chunkSizeWarningLimit: 900,
  },
});
