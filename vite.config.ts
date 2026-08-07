import { defineConfig } from 'vite'

export default defineConfig({
  base: '/amulish-game/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/app-v213-[hash].js`,
        chunkFileNames: `assets/chunk-v213-[hash].js`,
        assetFileNames: `assets/asset-v213-[hash].[ext]`
      }
    }
  }
})
