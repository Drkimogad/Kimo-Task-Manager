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
// Register for push notifications
   function registerPushNotifications() {
       if ('Notification' in window && 'PushManager' in window) {
           Notification.requestPermission().then((permission) => {
               if (permission === 'granted') {
                   console.log('Push notifications granted');
               }
           });
       }
   }

   // Handle push notifications in the service worker
   self.addEventListener('push', (event) => {
       const data = event.data.json();
       const title = data.title || 'New Task Added';
       const options = {
           body: data.body || 'A new task has been added via voice command.',
           icon: '/icon.png',
       };

       event.waitUntil(
           self.registration.showNotification(title, options)
       );
   });
// Start voice recognition
   function startVoiceRecognition() {
       if (!('webkitSpeechRecognition' in window)) {
           alert('Your browser does not support speech recognition.');
           return;
       }

       const recognition = new webkitSpeechRecognition();
       recognition.lang = 'en-US';
       recognition.continuous = false;
       recognition.interimResults = false;

       recognition.onstart = function () {
           console.log('Voice recognition started. Try speaking into the microphone.');
       };

       recognition.onresult = function (event) {
           if (event.results.length > 0) {
               const voiceInput = event.results[0][0].transcript.toLowerCase();
               console.log(`Voice Input: ${voiceInput}`);
               handleUserInput(voiceInput);
           }
       };

       recognition.onerror = function (event) {
           console.error('Speech recognition error', event);
       };

       recognition.onend = function () {
           console.log('Voice recognition ended.');
       };

       recognition.start();
   }
// Open or create an IndexedDB database
   const openDB = () => {
       return new Promise((resolve, reject) => {
           const request = indexedDB.open('TodoBotDB', 1);

           request.onupgradeneeded = (event) => {
               const db = event.target.result;
               if (!db.objectStoreNames.contains('tasks')) {
                   db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
               }
           };

           request.onsuccess = (event) => resolve(event.target.result);
           request.onerror = (event) => reject(event.target.error);
       });
   };

   // Add a task to IndexedDB
   const addTaskToDB = async (task) => {
       const db = await openDB();
       const transaction = db.transaction('tasks', 'readwrite');
       const store = transaction.objectStore('tasks');
       store.add(task);
   };
// sync tasks with the server
const syncTasks = async () => {
       const db = await openDB();
       const transaction = db.transaction('tasks', 'readonly');
       const store = transaction.objectStore('tasks');
       const tasks = store.getAll();

       tasks.onsuccess = async () => {
           for (const task of tasks.result) {
               await fetch('/api/tasks', {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify(task),
               });
           }
       };
   };
