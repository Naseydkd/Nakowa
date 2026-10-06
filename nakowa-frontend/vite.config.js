import { defineConfig } from 'vite';

export default defineConfig({
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    // Optimize bundle size
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['chart.js'],
        },
      },
    },
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

  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ['chart.js', 'leaflet'],
  },
});
