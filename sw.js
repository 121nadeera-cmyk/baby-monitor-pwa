const CACHE_NAME = 'baby-tracker-v2';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon.svg',
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/react@18/umd/react.production.min.js',
    'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
    'https://unpkg.com/@babel/standalone/babel.min.js',
    'https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth-compat.js',
    'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore-compat.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                // Ignore errors for individual files so others still cache
                return Promise.allSettled(ASSETS.map(url => {
                    return fetch(url).then(response => {
                        if (!response.ok) throw new Error('Not ok');
                        return cache.put(url, response);
                    }).catch(error => console.log('Cache failed for', url, error));
                }));
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    // Network First strategy
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // If network fetch succeeds, return it and optionally update cache
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });
                return response;
            })
            .catch(() => {
                // If network fails (offline), try cache
                return caches.match(event.request);
            })
    );
});

self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: './icon.svg',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: '1'
            }
        };
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});
