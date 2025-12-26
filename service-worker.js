const CACHE_NAME = 'abnormal-report-v1';
const urlsToCache = [
  './',           // ✅ 缓存当前目录的 index.html（即 /anomaly-pwa/）
  './app.js',
  './db.js',
  './mqtt.js',
  './scanner.js',
  './qrgen.js',
  './utils.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  // 可选：更健壮的 fetch 处理
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});