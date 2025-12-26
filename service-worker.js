const CACHE_NAME = 'abnormal-report-v1';
const urlsToCache = [
  '/',               // 首页
  '/app.js',         // 主逻辑
  '/db.js',          // 数据库
  '/mqtt.js',        // MQTT 连接
  '/scanner.js',     // 扫码功能
  '/qrgen.js',       // 二维码生成
  '/utils.js'        // 工具函数
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
  }
});