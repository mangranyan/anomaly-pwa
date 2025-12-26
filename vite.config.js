// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  root: '.', // 项目根目录即当前目录
  build: {
    outDir: 'dist', // 构建输出到 dist/
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})