import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@browser-agent/ai-hooks": resolve(__dirname, "../../src/index.tsx"),
    },
  },
  server: {
    port: 5174,
  },
});
