import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  //base: process.env.VITE_BASE_PATH || "/react-vite-deploy",
  define: {
    global: 'window',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // ⚙️ Backend Spring Boot đang chạy
        changeOrigin: true,
      },
      '/ws': {
        target: 'http://localhost:8080', // ⚙️ Backend Spring Boot đang chạy
        changeOrigin: true,
        ws: true, // 🔥 BẮT BUỘC để hỗ trợ WebSocket
      },
      '/uploads': {
        target: 'http://localhost:8080', // ⚙️ Serve static files (images, documents)
        changeOrigin: true,
      },
    },
  },
  // Optimize build performance
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['flowbite-react', 'react-icons'],
          utils: ['axios', 'react-hot-toast']
        }
      }
    }
  },
  // Optimize dev server
  optimizeDeps: {
    include: ['react', 'react-dom', 'flowbite-react', 'react-icons']
  }
})

