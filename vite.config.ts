import { defineConfig } from 'vite'

export default defineConfig({
  // This is a placeholder config for the root level
  // The actual frontend config is in frontend/vite.config.ts
  server: {
    port: 5173,
    open: '/frontend/'
  }
})