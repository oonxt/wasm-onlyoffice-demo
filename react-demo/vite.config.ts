import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set by deploy.sh for the GitHub Pages build, e.g. "/wasm-onlyoffice-demo".
// Empty during local dev so paths stay rooted at "/".
const ooBase = process.env.VITE_OO_BASE ?? ''

export default defineConfig({
  base: ooBase ? `${ooBase}/` : '/',
  define: {
    'import.meta.env.VITE_OO_BASE': JSON.stringify(ooBase),
  },
  plugins: [react()],
  // In dev, serve the editor entry HTMLs from ../public. For the Pages build
  // deploy.sh assembles the shared OnlyOffice asset tree at the site root, so we
  // disable publicDir to avoid baking the bundle into each app's output.
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
