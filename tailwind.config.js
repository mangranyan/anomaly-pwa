// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./app.js",
    "./db.js",
    "./mqtt.js",
    "./scanner.js",
    "./qrgen.js",
    "./utils.js"
    // 添加其他可能使用 Tailwind class 的 JS 文件
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E40AF',
        secondary: '#3B82F6'
      }
    },
  },
  plugins: [],
}