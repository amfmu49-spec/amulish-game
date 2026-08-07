import { defineConfig } from 'vite'

export default defineConfig({
  base: '/amulish-game/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/app-v211-[hash].js`,
        chunkFileNames: `assets/chunk-v211-[hash].js`,
        assetFileNames: `assets/asset-v211-[hash].[ext]`
      }
    }
  }
})
