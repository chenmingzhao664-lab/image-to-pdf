import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署在 https://chenmingzhao664-lab.github.io/image-to-pdf/
  // base 必须用绝对路径前缀，否则子路径路由下资源 404
  base: '/image-to-pdf/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
  },
  server: {
    port: 5173,
    open: false,
  },
})
