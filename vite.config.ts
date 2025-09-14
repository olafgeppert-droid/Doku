import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Wichtig: base auf dein Repo-Unterverzeichnis setzen
export default defineConfig({
  plugins: [react()],
  base: "/Doku/",
});
