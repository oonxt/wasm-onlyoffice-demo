import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Set by deploy.sh for the GitHub Pages build, e.g. "/wasm-onlyoffice-demo".
// The Vue demo is published under "/vue/"; the shared OnlyOffice asset tree and
// x2t stay at the site root and are referenced via VITE_OO_BASE.
const ooBase = process.env.VITE_OO_BASE ?? ''

export default defineConfig({
  base: ooBase ? `${ooBase}/vue/` : '/',
  define: {
    'import.meta.env.VITE_OO_BASE': JSON.stringify(ooBase),
  },
  plugins: [vue()],
  publicDir: ooBase ? false : '../public',
  optimizeDeps: {
    exclude: ['wasm-onlyoffice-sdk'],
  },
  server: {
    fs: {
      allow: ['../..'],
    },
  },
})
