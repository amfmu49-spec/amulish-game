import { defineConfig } from 'vite'

export default defineConfig({
  base: '/amulish-game/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/app-v222-[hash].js`,
        chunkFileNames: `assets/chunk-v222-[hash].js`,
        assetFileNames: `assets/asset-v222-[hash].[ext]`
      }
    }
  }
})
