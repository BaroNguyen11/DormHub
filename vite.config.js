import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Proxy cho 9Router AI API để bypass CORS trong development
      '/ai-proxy': {
        target: 'https://rendering-includes-fruits-new.trycloudflare.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ai-proxy/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Thêm Authorization header vào request
            const apiKey = process.env.VITE_AI_API_KEY || 'sk-c5a30fbce7ee2c04-8jv8c0-1ea4a431';
            proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
          });
        }
      }
    }
  }
});
