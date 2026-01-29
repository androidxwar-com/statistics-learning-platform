const CACHE_NAME = 'ema-stats-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './styles/main.css',
    './styles/theory-mode.css',
    './styles/quiz-mode.css',
    './scripts/core/api-client.js',
    './scripts/core/app-controller.js',
    './scripts/core/state-manager.js',
    './scripts/core/PhaseManager.js',
    './scripts/core/EventBus.js',
    './scripts/core/UserProfile.js',
    './scripts/ui/sidebar-manager.js',
    './scripts/ui/Visualizer.js',
    './scripts/utils/ExportManager.js',
    './scripts/utils/DataManager.js',
    './config/prompts.js',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// Install Event: Cache Core Assets
self.addEventListener('install', (event) => {
    console.log('👷 Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 Caching App Shell');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Activate Event: Clean old caches
self.addEventListener('activate', (event) => {
    console.log('👷 Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('🗑️ Removing old cache', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Fetch Event: Network First, then Cache
self.addEventListener('fetch', (event) => {
    // Ignora richieste non-GET o chrome-extension
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Se la rete risponde, clona e aggiorna cache (opzionale, qui semplice network first)
                return response;
            })
            .catch(() => {
                // Se rete fallisce, usa cache
                console.log('⚠️ Offline: Serving from cache', event.request.url);
                return caches.match(event.request);
            })
    );
});
