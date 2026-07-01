import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Tailwind must be registered as a Vite plugin (Tailwind v4).
// PostCSS config is NOT required when using @tailwindcss/vite.
export default defineConfig({
  // SPA mode: dev + preview servers fall back to index.html for deep links like /settings.
  appType: "spa",
  plugins: [
    tailwindcss(),
    react(),
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
