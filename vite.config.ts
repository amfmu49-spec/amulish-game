import { defineConfig } from 'vite'

export default defineConfig({
  base: '/amulish-game/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/app-v230-[hash].js`,
        chunkFileNames: `assets/chunk-v230-[hash].js`,
        assetFileNames: `assets/asset-v230-[hash].[ext]`
      }
    }
  }
})
