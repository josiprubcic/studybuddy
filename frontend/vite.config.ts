import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In development the browser only talks to Vite (5173); Vite forwards /api to Spring (8080), so no CORS is needed.
    proxy: {
      '/api': process.env.API_URL ?? 'http://localhost:8080', // API_URL lets a second backend run side by side
    },
  },
})
