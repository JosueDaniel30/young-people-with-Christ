
const CACHE_NAME = 'ignite-v1.6-resilience';
const STATIC_ASSETS = [
  './index.html',
  './index.tsx',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Usamos addAll de forma segura, capturando errores individuales
      return Promise.allSettled(
        STATIC_ASSETS.map(url => cache.add(url).catch(err => console.warn(`Error al cachear: ${url}`, err)))
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  return self.clients.claim();
});

// Manejo de peticiones (Fetch)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Ignorar peticiones que no sean HTTP/HTTPS (como chrome-extension://)
  if (!url.protocol.startsWith('http')) return;

  // 2. Ignorar peticiones a la API de Gemini (deben ser siempre online)
  if (url.hostname.includes('generativelanguage.googleapis.com')) return;

  // 3. Ignorar métodos que no sean GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Retornar de caché si existe
      if (cachedResponse) return cachedResponse;

      // Si no está en caché, intentar red
      return fetch(event.request).then((networkResponse) => {
        // Guardar en caché si la respuesta es válida
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback para navegación (Single Page App)
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// Push Notifications
self.addEventListener('push', (event) => {
  let data = { title: 'Ignite Youth', body: '¡Tienes un nuevo mensaje del Altar!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Ignite Youth', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: 'https://api.dicebear.com/7.x/shapes/png?seed=Ignite&backgroundColor=7c3aed',
    badge: 'https://api.dicebear.com/7.x/shapes/png?seed=Ignite&backgroundColor=7c3aed',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' }
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      if (windowClients.length > 0) return windowClients[0].focus();
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
