import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "/",
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  build: {
    outDir: "dist/vercel",
    emptyOutDir: true,
    target: "esnext",
    minify: "esbuild",
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
            return "vendor";
          }
          if (id.includes("@supabase")) {
            return "supabase";
          }
          if (id.includes("@radix-ui") || id.includes("cmdk") || id.includes("vaul") || id.includes("sonner") || id.includes("input-otp") || id.includes("embla-carousel")) {
            return "ui";
          }
          if (id.includes("@tanstack")) {
            return "router";
          }
        },
      },
    },
  },
});
