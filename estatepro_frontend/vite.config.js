// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path' // Required for path.resolve

export default defineConfig({
  base: '/',

  plugins: [react(), tailwindcss()],

  // This block enables @ alias (src/ folder)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Recommended dev server settings
  server: {
    port: 5173,
    open: true,           // Auto-open browser on start
    host: true,           // Allow access from local network (phone testing)
  },

  // Optional: Better production build
  build: {
    outDir: 'dist',
    sourcemap: true,      // Helpful for debugging production issues
  },
})