import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',  // Will be replaced in production
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: '../server/static',  // Builds to Django's static folder
    emptyOutDir: true,
    rollupOptions: {
    output: {
      assetFileNames: 'assets/[name][extname]'
    }
  }
  }
})