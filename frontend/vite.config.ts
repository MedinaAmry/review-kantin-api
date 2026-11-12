import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxy /api -> backend Express, jadi saat development tidak kena masalah CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
});
