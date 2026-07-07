import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Tailwind must be registered as a Vite plugin (Tailwind v4).
// PostCSS config is NOT required when using @tailwindcss/vite.
export default defineConfig({
  // SPA mode: dev + preview servers fall back to index.html for deep links like /settings.
  appType: "spa",
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      manifest: false,
      includeAssets: [
        "favicon.svg",
        "manifest.webmanifest",
        "icons/**/*",
        "splash/**/*",
      ],
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2,webmanifest}"],
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  preview: {
    // Same SPA fallback as dev when testing production builds locally.
    strictPort: false,
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/@supabase")) {
            return "supabase"
          }
        },
      },
    },
  },
})
