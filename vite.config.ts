import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署在 https://<user>.github.io/image-to-pdf/ 子路径下，
  // 必须设置 base 让所有静态资源 URL 正确解析。
  base: './',
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
