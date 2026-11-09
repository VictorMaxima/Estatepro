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
    rollupOptions: {
      output: {
        entryFileNames: 'assets/index-3DnOkztr.js',
        chunkFileNames: 'assets/index-3DnOkztr.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/index-CtS4WT8Z.css';
          }
          return 'assets/[name].[ext]';
        },
      },
    },
  },

  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
})
