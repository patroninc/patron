// Basic service worker - no caching or offline functionality
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

// Just pass through all requests without caching
self.addEventListener('fetch', function(event) {
  event.respondWith(fetch(event.request));
});