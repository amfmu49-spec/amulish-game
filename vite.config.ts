import { defineConfig } from 'vite'

export default defineConfig({
  base: '/amulish-game/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/app-v219-[hash].js`,
        chunkFileNames: `assets/chunk-v219-[hash].js`,
        assetFileNames: `assets/asset-v219-[hash].[ext]`
      }
    }
  }
})
