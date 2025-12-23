// sw.js
const CACHE_NAME = 'line-exception-pwa-v1';
const urlsToCache = [
  './',               // 首页（等价于 ./index.html）
  './index.html',
  './app.js',
  './style.css',
  './manifest.json',
  './icons/48.png',
  './icons/96.png',
  './icons/192.png',
  './icons/512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => {
        console.error('缓存安装失败:', err);
        // 可选：跳过等待，避免 install 失败阻塞
        return;
      })
  );
});

self.addEventListener('fetch', (event) => {
  // 只缓存同源请求（避免跨域问题）
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果缓存中有，直接返回
        if (response) {
          return response;
        }
        // 否则走网络，并自动 fallback 到首页（可选）
        return fetch(event.request).catch(() => {
          // 离线时返回首页（提升体验）
          return caches.match('./');
        });
      })
  );
});