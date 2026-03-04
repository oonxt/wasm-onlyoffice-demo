import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  publicDir: '../public',
  optimizeDeps: {
    exclude: ['wasm-onlyoffice-sdk'],
  },
  server: {
    fs: {
      allow: ['../..'],
    },
  },
})
