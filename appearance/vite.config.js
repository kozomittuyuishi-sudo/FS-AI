import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the built index.html works when loaded
// via file:// by Electron in production.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 3000,
    strictPort: true,
  },
})
