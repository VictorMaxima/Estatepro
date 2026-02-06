// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  base: '/', 

  plugins: [react(), tailwindcss()],

  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      
    },
  },

  server: {
    port: 5173,
    open: true,           
    host: true,           
    strictPort: true,     
  },

  
  build: {
    outDir: 'dist',       
    sourcemap: true,      
    minify: 'esbuild',    
  },

  
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
})