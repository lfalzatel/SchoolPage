const CACHE_NAME = 'green-force-v7';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './auth.js',
  './gallery.js',
  './timeline.js',
  './firebase-config.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force new SW to take over
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      ).then(() => self.clients.claim()); // Take control of all clients immediately
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Network-first for Firebase/API calls (simplified check)
  if (event.request.url.includes('firebase') || event.request.url.includes('googleapis') || event.request.url.includes('firestore')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request).then((fetchResponse) => {
          // Check if we received a valid response
          if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
            return fetchResponse;
          }

          // Clone the response because it's a stream and can only be consumed once
          var responseToCache = fetchResponse.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              if (event.request.method === 'GET') {
                cache.put(event.request, responseToCache);
              }
            });

          return fetchResponse;
        });
      })
  );
});
