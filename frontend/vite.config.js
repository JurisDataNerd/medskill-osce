import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "url";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("html2pdf") || id.includes("html2canvas") || id.includes("jspdf")) {
              return "pdf-vendor";
            }
            if (id.includes("framer-motion") || id.includes("lenis") || id.includes("gsap")) {
              return "animation-vendor";
            }
            if (id.includes("@supabase")) {
              return "supabase-vendor";
            }
            if (id.includes("lucide-react")) {
              return "icons-vendor";
            }
            if (id.includes("react-router-dom") || id.includes("@tanstack") || id.includes("zustand")) {
              return "state-router-vendor";
            }
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-core";
            }
          }
        },
      },
    },
  },
});