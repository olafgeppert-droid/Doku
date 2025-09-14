import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite-Konfiguration für GitHub Pages Deployment
export default defineConfig({
  plugins: [react()],
  // WICHTIG: Basis-Pfad für dein GitHub Pages Repo
  base: "/Doku/",
  build: {
    outDir: "dist", // Standard-Ausgabeordner (wird vom Workflow veröffentlicht)
    sourcemap: false
  },
  server: {
    port: 5173,   // Lokaler Dev-Server-Port (optional)
    open: true    // Browser beim Start öffnen
  }
});
