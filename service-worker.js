const CACHE_NAME = 'anomaly-pwa-v1';
const urlsToCache = [
  './',                    // 对应 https://.../anomaly-pwa/
  './index.html',
  './dist/js/main.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((err) => {
        console.error('SW: 缓存失败', err);
      })
  );
});

// 拦截所有请求，优先走网络，失败则回退到缓存（适合 PWA）
self.addEventListener('fetch', (event) => {
  // 只处理 GET 请求
  if (event.request.method !== 'GET') return;

  // 对于导航请求（HTML 页面），使用缓存优先策略
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('./index.html') || caches.match(event.request);
      })
    );
  } else {
    // 其他资源（JS、图片等）：网络优先
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});

// 可选：激活时清理旧缓存（略）