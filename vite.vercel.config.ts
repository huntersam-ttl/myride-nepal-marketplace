import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";

// SPA-mode Vite config for Vercel deployment.
// Bypasses the Lovable/Cloudflare TanStack Start config and builds a plain
// React SPA that TanStack Router handles client-side.
export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    tsconfigPaths(),
  ],
  build: {
    outDir: "dist/vercel",
    emptyOutDir: true,
  },
});
