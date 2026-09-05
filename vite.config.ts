import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    proxy: {
      '/api/v1': {
        target: 'http://localhost:8090',
        changeOrigin: true,
        // Strip the WWW-Authenticate header so the browser never shows
        // its native Basic Auth popup on 401 responses.
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            delete proxyRes.headers['www-authenticate'];
          });
        },
      }
    }
  },
  plugins: [
    react(),
    // MAKE SURE THERE IS NO "componentTagger()" HERE
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));