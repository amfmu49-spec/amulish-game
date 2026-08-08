import { defineConfig } from 'vite'

export default defineConfig({
  base: '/amulish-game/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/app-v251-[hash].js`,
        chunkFileNames: `assets/chunk-v251-[hash].js`,
        assetFileNames: `assets/asset-v251-[hash].[ext]`
      }
    }
  }
})
