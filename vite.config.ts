import { defineConfig } from 'vite'

export default defineConfig({
  base: '/amulish-game/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/app-v216-[hash].js`,
        chunkFileNames: `assets/chunk-v216-[hash].js`,
        assetFileNames: `assets/asset-v216-[hash].[ext]`
      }
    }
  }
})
