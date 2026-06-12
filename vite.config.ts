import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base must match the GitHub Pages project path: pauljunsukhan.github.io/mox-sf-website/
// Override with VITE_BASE=/ for custom-domain or local-root serving.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/mox-sf-website/',
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // expose on LAN so phones on the same wifi can open it
    allowedHosts: true, // dev-only: let tunnel hostnames (trycloudflare etc.) through
  },
})
