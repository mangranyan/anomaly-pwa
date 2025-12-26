const CACHE_NAME = 'abnormal-report-v3'; // 👈 升级版本号，强制更新旧缓存
const urlsToCache = [
  './index.html',   // 👈 显式缓存主页面
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

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // 逐个添加，跳过失败项（避免全盘失败）
      const promises = urlsToCache.map(url =>
        fetch(url)
          .then(response => {
            if (response.ok) return cache.put(url, response);
          })
          .catch(err => {
            console.warn(`[SW] 缓存 ${url} 失败:`, err.message);
          })
      );
      return Promise.all(promises);
    }).then(() => self.skipWaiting()) // 立即激活新 SW
  );
});

self.addEventListener('activate', (event) => {
  const cacheAllowlist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheAllowlist.includes(cacheName)) {
            console.log(`[SW] 删除旧缓存: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      )
    ).then(() => self.clients.claim()) // 立即接管所有页面
  );
});

// 判断是否为同源资源
function isSafeToCache(request) {
  try {
    const url = new URL(request.url);
    return url.origin === self.origin;
  } catch (e) {
    return false;
  }
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // 仅处理同源请求
  if (!isSafeToCache(event.request)) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      // 网络优先，失败也不回退（避免陈旧数据）
      return fetch(event.request).catch(err => {
        console.error('[SW] 网络请求失败:', event.request.url, err);
        // 可选：对关键页面（如 index.html）提供兜底
        if (event.request.url.endsWith('/')) {
          return caches.match('./index.html');
        }
        throw err; // 或返回空响应
      });
    })
  );
});