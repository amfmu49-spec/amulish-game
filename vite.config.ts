import { defineConfig } from 'vite'

export default defineConfig({
  base: '/amulish-game/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/app-v220-[hash].js`,
        chunkFileNames: `assets/chunk-v220-[hash].js`,
        assetFileNames: `assets/asset-v220-[hash].[ext]`
      }
    }
  }
})
