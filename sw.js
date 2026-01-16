
const CACHE_NAME = 'ignite-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './logojov.png',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retorna el caché si existe, sino hace el fetch
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // No cacheamos llamadas a la API de Gemini para asegurar frescura
        if (event.request.url.includes('generativelanguage.googleapis.com')) {
          return networkResponse;
        }
        
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // Fallback simple si no hay red ni caché
        return response;
      });
      
      return response || fetchPromise;
    })
  );
});
