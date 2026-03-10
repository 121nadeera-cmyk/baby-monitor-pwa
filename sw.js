const CACHE_NAME = 'baby-tracker-v1';
const ASSETS = [
    './',
    './index.html',
    './app.jsx',
    './manifest.json',
    './icon.svg'
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

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                // Try network
                return fetch(event.request).then(
                    function(response) {
                        // Check if we received a valid response
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        return response;
                    }
                );
            })
    );
});

self.addEventListener('push', function(event) {
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
