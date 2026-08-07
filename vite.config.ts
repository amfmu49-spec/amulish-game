import { defineConfig } from 'vite'

export default defineConfig({
  base: '/amulish-game/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/app-v221-[hash].js`,
        chunkFileNames: `assets/chunk-v221-[hash].js`,
        assetFileNames: `assets/asset-v221-[hash].[ext]`
      }
    }
  }
})
