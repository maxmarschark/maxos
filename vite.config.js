import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Tailwind must be registered as a Vite plugin (Tailwind v4).
// PostCSS config is NOT required when using @tailwindcss/vite.
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
})
