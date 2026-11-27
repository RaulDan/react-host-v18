import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3001,
    strictPort: true,
    open: false
  },
  preview: { port: 3001, strictPort: true },
  plugins: [
    react(),
  ],
})
