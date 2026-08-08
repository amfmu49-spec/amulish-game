import { defineConfig } from 'vite'

export default defineConfig({
  base: '/amulish-game/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/app-v242-[hash].js`,
        chunkFileNames: `assets/chunk-v242-[hash].js`,
        assetFileNames: `assets/asset-v242-[hash].[ext]`
      }
    }
  }
})
