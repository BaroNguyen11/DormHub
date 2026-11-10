// vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/ai-proxy": {
          target: env.VITE_AI_TARGET_URL || "https://api.9router.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ai-proxy/, ""),
        },
      },
    },
  };
});