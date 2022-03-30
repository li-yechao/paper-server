import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy({
      renderLegacyChunks: false,
      modernPolyfills: ['es/array'],
    }),
    VitePWA({
      manifest: {
        name: 'Paper',
        short_name: 'Paper',
        description: 'Paper',
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
})
