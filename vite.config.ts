import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'
import path from 'path'

export default defineConfig({
  plugins: [react(), imagetools()],
  server: {
    allowedHosts: true,
    host: '0.0.0.0',
    cors: true,
    hmr: {
      clientPort: 443,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
})
