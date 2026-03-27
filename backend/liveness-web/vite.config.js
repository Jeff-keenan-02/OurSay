import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: '/liveness/',
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, "../public/liveness"),
    emptyOutDir: true,
  },
});