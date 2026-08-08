import { defineConfig } from 'vite'

export default defineConfig({
  base: '/amulish-game/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/app-v240-[hash].js`,
        chunkFileNames: `assets/chunk-v240-[hash].js`,
        assetFileNames: `assets/asset-v240-[hash].[ext]`
      }
    }
  }
})
