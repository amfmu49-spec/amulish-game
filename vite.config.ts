import { defineConfig } from 'vite'

export default defineConfig({
  base: '/amulish-game/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/app-v241-[hash].js`,
        chunkFileNames: `assets/chunk-v241-[hash].js`,
        assetFileNames: `assets/asset-v241-[hash].[ext]`
      }
    }
  }
})
