import { defineConfig } from 'vite'

export default defineConfig({
  base: '/amulish-game/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/app-v215-[hash].js`,
        chunkFileNames: `assets/chunk-v215-[hash].js`,
        assetFileNames: `assets/asset-v215-[hash].[ext]`
      }
    }
  }
})
