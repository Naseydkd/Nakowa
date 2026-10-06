import { defineConfig } from 'vite';

export default defineConfig({
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    // Vercel has a 50MB limit
    chunkSizeWarningLimit: 1000,
  },

  // Development server
  server: {
    port: 5500,
    host: '0.0.0.0',
    strictPort: false,
    open: false,
  },

  // Preview server (for testing production build)
  preview: {
    port: 5500,
    host: '0.0.0.0',
    strictPort: false,
  },

  // Base public path
  base: '/',
});

