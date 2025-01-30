// service-worker.js
const CACHE_NAME = 'kimo-task-manager-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    // Add other assets (images, fonts, etc.) here
];

// Install the service worker and cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS))
    );
});

// Fetch cached assets or make a network request
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});
