import { defineConfig } from 'vite'

export default defineConfig({
  base: '/amulish-game/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/app-v212-[hash].js`,
        chunkFileNames: `assets/chunk-v212-[hash].js`,
        assetFileNames: `assets/asset-v212-[hash].[ext]`
      }
    }
  }
})
