import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    // The browser talks to /api on the same origin; Vite forwards it to Express.
    // This keeps cookies first-party and simple in development.
    proxy: {
      '/api': { target: `http://localhost:${process.env.API_PORT ?? 4000}`, changeOrigin: false },
    },
  },
});
