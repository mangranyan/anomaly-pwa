// sw.js
const CACHE_NAME = 'line-exception-pwa-v2'; // 版本号更新，强制刷新缓存
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './manifest.json',
  './libs/html5-qrcode.min.js',
  './libs/qrcode.min.js',
  './libs/paho-mqtt.min.js',
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
        // 即使部分失败，也继续激活
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  // 清理旧缓存
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // 只处理同源请求
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          // 离线 fallback 到首页
          return caches.match('./');
        });
      })
  );
});