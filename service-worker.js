// service-worker.js
const CACHE_NAME = 'abnormal-report-v1';
const urlsToCache = [
  './',                          // 首页 index.html
  './app.js',
  './db.js',
  './mqtt.js',
  './scanner.js',
  './qrgen.js',
  './utils.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// 安装阶段：预缓存关键资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.error('[ServiceWorker] 缓存失败:', err);
        throw err; // 确保 install 失败可被观察到
      })
  );
});

// 激活阶段：清理旧缓存（可选，便于版本更新）
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 请求拦截：仅处理同源请求（避免跨域错误）
self.addEventListener('fetch', (event) => {
  // 只缓存来自同一 origin 的请求（即你的 GitHub Pages 域名）
  if (event.request.url.startsWith(self.origin)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
  }
  // 非同源请求（如 fonts.gstatic.com）直接走网络，不拦截
});