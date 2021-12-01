import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({ exclude: [/\.min\.js$/] }),
    VitePWA({
      manifest: {
        name: 'Paper',
        short_name: 'Paper',
        description: 'Paper powered by IPFS',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'icons/Icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/Icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  build: {
    target: 'es2020',
  },
})
