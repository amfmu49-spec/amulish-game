import { defineConfig } from 'vite'

export default defineConfig({
  base: '/amulish-game/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/app-v223-[hash].js`,
        chunkFileNames: `assets/chunk-v223-[hash].js`,
        assetFileNames: `assets/asset-v223-[hash].[ext]`
      }
    }
  }
})
