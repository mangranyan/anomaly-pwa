const CACHE_NAME = 'anomaly-pwa-v1';
const urlsToCache = [
  './',
  './index.html',
  './dist/js/main.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => {
        console.error('Service Worker: 缓存失败', err);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // 仅处理同源请求
  if (event.request.url.startsWith(self.location.origin)) {
    if (event.request.destination === 'document') {
      event.respondWith(
        fetch(event.request).catch(() => caches.match('./index.html'))
      );
    } else {
      event.respondWith(
        caches.match(event.request).then(cached => {
          return cached || fetch(event.request);
        })
      );
    }
  }
});