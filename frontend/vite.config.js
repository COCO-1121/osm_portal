import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // <-- apne backend ka actual port yahan daalo (Django=8000, Node/Express=3000 or 5000, FastAPI=8000)
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
