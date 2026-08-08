import { defineConfig } from 'vite'

export default defineConfig({
  base: '/amulish-game/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/app-v244-[hash].js`,
        chunkFileNames: `assets/chunk-v244-[hash].js`,
        assetFileNames: `assets/asset-v244-[hash].[ext]`
      }
    }
  }
})
