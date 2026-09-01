import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("react-router-dom") ||
              id.includes("react-dom") ||
              id.includes("/react/")
            ) {
              return "vendor-react";
            }
            if (id.includes("@tanstack")) {
              return "vendor-tanstack";
            }
            if (id.includes("lucide-react") || id.includes("react-icons") || id.includes("@heroicons")) {
              return "vendor-icons";
            }
            if (id.includes("framer-motion")) {
              return "vendor-motion";
            }
            if (id.includes("axios") || id.includes("zod") || id.includes("react-hook-form") || id.includes("sonner")) {
              return "vendor-utils";
            }
            if (id.includes("@cloudinary")) {
              return "vendor-cloudinary";
            }
            return "vendor";
          }
        },
      },
    },
  },
});