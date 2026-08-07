import { defineConfig } from 'vite'

export default defineConfig({
  base: '/amulish-game/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/app-v218-[hash].js`,
        chunkFileNames: `assets/chunk-v218-[hash].js`,
        assetFileNames: `assets/asset-v218-[hash].[ext]`
      }
    }
  }
})
