import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base + hash routing lets the build be hosted from any folder.
export default defineConfig({
  base: "./",
  plugins: [react()],
});
