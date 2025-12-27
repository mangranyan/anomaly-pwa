import { initRouter } from './router';

// ✅ 立即启动路由系统
initRouter();

// ✅ 注册 Service Worker（使用相对路径）
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js');
  });
}