const CACHE_NAME = 'abnormal-report-v1';
const urlsToCache = [
  '/',
  '/src/app.js',
  '/src/db.js',
  '/src/mqtt.js',
  '/src/scanner.js',
  '/src/qrgen.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});