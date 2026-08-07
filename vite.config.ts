import { defineConfig } from 'vite'

export default defineConfig({
  base: '/amulish-game/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/app-v214-[hash].js`,
        chunkFileNames: `assets/chunk-v214-[hash].js`,
        assetFileNames: `assets/asset-v214-[hash].[ext]`
      }
    }
  }
})
