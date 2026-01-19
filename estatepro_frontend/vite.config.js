// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  base: '/', // Good - works for most hosting (Netlify, Vercel, GitHub Pages)

  plugins: [react(), tailwindcss()],

  // Path aliases - @ points to src/ (this is what fixed your import issues)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Optional: Add more aliases later if project grows
      // '@components': path.resolve(__dirname, './src/components'),
      // '@pages': path.resolve(__dirname, './src/pages'),
      // '@assets': path.resolve(__dirname, './src/assets'),
    },
  },

  // Dev server settings - very useful for local development
  server: {
    port: 5173,
    open: true,           // Auto-open browser when you run npm run dev
    host: true,           // Allows testing from phone/other devices on same Wi-Fi
    strictPort: true,     // If port 5173 is taken, fail instead of auto-changing
  },

  // Production build optimizations (optional but recommended)
  build: {
    outDir: 'dist',       // Default, but good to be explicit
    sourcemap: true,      // Makes production debugging much easier (stack traces work)
    minify: 'esbuild',    // Fast minification (default is good)
  },

  // Optional: Better error reporting in development
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
})