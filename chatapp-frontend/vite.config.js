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
      '/ws': {
        target: 'http://localhost:8080', // ⚙️ Backend Spring Boot đang chạy
        changeOrigin: true,
        ws: true, // 🔥 BẮT BUỘC để hỗ trợ WebSocket
      },
    },
  },
})

