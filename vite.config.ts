import { defineConfig } from 'vite'

export default defineConfig({
  base: '/amulish-game/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/app-v250-[hash].js`,
        chunkFileNames: `assets/chunk-v250-[hash].js`,
        assetFileNames: `assets/asset-v250-[hash].[ext]`
      }
    }
  }
})
