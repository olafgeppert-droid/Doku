import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite-Konfiguration für GitHub Pages Deployment unter /Doku/
export default defineConfig({
  plugins: [react()],
  base: "/Doku/",
  build: {
    outDir: "dist",
    sourcemap: false
  },
  server: {
    port: 5173,
    open: true
  }
});
