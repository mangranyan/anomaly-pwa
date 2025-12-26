// public/service-worker.js

const CACHE_NAME = 'anomaly-report-pwa-v1';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/style.css',
  '/manifest.json',
  // 注意：Vite 构建后文件名可能带 hash（如 app.abc123.js）
  // 所以下面这个策略更适合开发环境或固定文件名场景
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('[SW] Cache addAll failed:', err);
        // 即使部分失败也继续安装
        return Promise.resolve();
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  const cacheAllowlist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheAllowlist.includes(cacheName)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // 忽略非 GET 请求（如 POST、MQTT 等）
  if (event.request.method !== 'GET') {
    return;
  }

  // 忽略 chrome-extension、data: 等非 HTTP 请求
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // 缓存优先策略（Cache-first with network fallback）
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // 只缓存成功的 HTML、JS、CSS、JSON、图片等
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (event.request.destination === '' || // script, style
           event.request.destination === 'document' ||
           event.request.destination === 'image' ||
           event.request.destination === 'manifest')
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return networkResponse;
      }).catch(() => {
        // 可选：返回兜底页面（如 /offline.html）
        return caches.match('/index.html');
      });
    })
  );
});