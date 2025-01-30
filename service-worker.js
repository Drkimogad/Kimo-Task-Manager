const CACHE_NAME = 'todo-bot-v1';
   const CACHE_URLS = [
       '/', // Root path
       '/index.html', // Main HTML file
       '/styles.css', // CSS file
       '/script.js', // Main JavaScript file
       // Add other assets (images, fonts, etc.) here
   ];

   // Install the service worker and cache resources
   self.addEventListener('install', (event) => {
       event.waitUntil(
           caches.open(CACHE_NAME)
               .then((cache) => cache.addAll(CACHE_URLS))
               .then(() => self.skipWaiting())
       );
   });

   // Fetch resources from cache or network
   self.addEventListener('fetch', (event) => {
       event.respondWith(
           caches.match(event.request)
               .then((response) => response || fetch(event.request))
       );
   });

   // Background Sync for offline tasks
   self.addEventListener('sync', (event) => {
       if (event.tag === 'sync-tasks') {
           event.waitUntil(syncTasks());
       }
   });

   // Function to sync tasks when online
   function syncTasks() {
       // Logic to sync tasks with the server
       console.log('Syncing tasks with the server...');
   }
