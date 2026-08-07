import { defineConfig } from 'vite'

export default defineConfig({
  base: '/amulish-game/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/app-v217-[hash].js`,
        chunkFileNames: `assets/chunk-v217-[hash].js`,
        assetFileNames: `assets/asset-v217-[hash].[ext]`
      }
    }
  }
})
