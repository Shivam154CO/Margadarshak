import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'
import compression from 'vite-plugin-compression'
import path from 'path'

export default defineConfig({
  plugins: [
    react({
      // React 19 + React Compiler support
      babel: {
        plugins: [["babel-plugin-react-compiler", { target: "19" }]],
      },
    }), 
    imagetools(),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    })
  ],
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
  esbuild: {
    drop: ['console', 'debugger'],
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) return 'vendor-framer';
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('chart.js') || id.includes('recharts')) return 'vendor-charts';
            if (id.includes('leaflet') || id.includes('google-maps')) return 'vendor-maps';
            if (id.includes('lucide-react')) return 'vendor-icons';
            return 'vendor'; // all other node_modules
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  css: {
    postcss: './postcss.config.js',
    devSourcemap: false, // Turn off for production feel
  },
})
