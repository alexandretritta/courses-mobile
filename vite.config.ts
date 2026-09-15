import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/courses-mobile/',
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5174,
  },
  preview: {
    host: true,
    port: 4174,
  },
})
