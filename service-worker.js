const CACHE_NAME = 'Kimo-Task-Manager-cache-v1'; // Update cache version
const urlsToCache = [
    'https://drkimogad.github.io/Kimo-Task-Manager/',                // Main page URL
    'https://drkimogad.github.io/Kimo-Task-Manager/index.html',      // Ensure main HTML page is cached
    'https://drkimogad.github.io/Kimo-Task-Manager/styles.css',
    'https://drkimogad.github.io/Kimo-Task-Manager/script.js',
    'https://drkimogad.github.io/Kimo-Task-Manager/manifest.json',
    'https://drkimogad.github.io/Kimo-Task-Manager/icons/icon-192x192.png',
    'https://www.flaticon.com/free-icons/routine" title="routine icons">Routine icons created by Flat Icons - Flaticon',
    'https://drkimogad.github.io/Kimo-Task-Manager/offline.html'     // Ensure offline page is cached
];
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    document.getElementById('installButton').style.display = 'block';
});

document.getElementById('installButton').addEventListener('click', () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }
        deferredPrompt = null;
    });
});

// Install event: Cache necessary assets
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Forces the new service worker to take control immediately

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching assets during install');
            return cache.addAll(urlsToCache)
                .then(() => {
                    console.log('Assets successfully cached!');
                    // Debugging: List cached URLs
                    cache.keys().then((requestUrls) => {
                        requestUrls.forEach((url) => {
                            console.log('Cached URL:', url);
                        });
                    });
                })
                .catch((err) => {
                    console.error('Error caching assets:', err);
                });
        })
    );
});

// Fetch event: Serve assets from cache or fetch from network if not cached
self.addEventListener('fetch', (event) => {
    console.log('Fetching request for:', event.request.url);

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                console.log('Serving from cache:', event.request.url);
                return cachedResponse; // Serve from cache
            }

            // If the request is for an HTML file (navigation), return the offline page
            if (event.request.mode === 'navigate') {
                return caches.match('/offline.html');  // Ensure offline.html is cached
            }

            console.log('Fetching from network:', event.request.url);
            return fetch(event.request).catch(() => {
                // Offline fallback if fetch fails (e.g., user is offline)
                return caches.match('/offline.html');  // Ensure offline.html is cached
            });
        }).catch((err) => {
            console.error('Error fetching:', err);
            // In case of any unexpected errors, fallback to offline.html
            return caches.match('/offline.html');
        })
    );
});

// Activate event: Clean up old caches and take control immediately
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];  // Only keep the current cache

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName); // Delete old caches
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker activated and ready');
            self.clients.claim();  // Claim clients immediately after activation
        })
    );
});

// Push notifications
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'You have a new reminder!',
        icon: 'https://drkimogad.github.io/Kimo-Task-Manager/icons/icon-192x192.png',
        badge: 'https://drkimogad.github.io/Kimo-Task-Manager/icon-192x192.png',
    };

    event.waitUntil(
        self.registration.showNotification('Kimo-Task-Manager Reminder', options)
    );
});

// Check for updates and fetch new service worker
self.addEventListener('message', (event) => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting(); // Skip waiting and immediately activate the new service worker
    }
});

// Background Sync for offline tasks
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-tasks') {
        event.waitUntil(syncTasks());
    }
});

// Function to sync tasks when online
async function syncTasks() {
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

// Voice recognition function
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
        // Kimo's greeting
        const speech = new SpeechSynthesisUtterance("What can I do for you today?");
        window.speechSynthesis.speak(speech);
    };

    recognition.onresult = function (event) {
        if (event.results.length > 0) {
            const voiceInput = event.results[0][0].transcript.toLowerCase();
            console.log(`Voice Input: ${voiceInput}`);
            handleUserInput(voiceInput);
            // Kimo's confirmation
            const speech = new SpeechSynthesisUtterance(`Task "${voiceInput}" received.`);
            window.speechSynthesis.speak(speech);
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
