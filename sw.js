// sw.js - Production-Ready Service Worker Fetch Handler
const CACHE_NAME = 'clienthub-v5-cache';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './Icon-ClientHub-v1.1.png'
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
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // 1. Bypass non-GET requests or cross-origin CDNs (Tesseract, Tailwind, FontAwesome, etc.)
    if (event.request.method !== 'GET' || url.origin !== location.origin) {
        // Let the browser handle external CDN requests normally without service worker intervention
        return; 
    }

    // 2. Stale-while-revalidate strategy for local app assets
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Fallback if offline and asset isn't cached
                return cachedResponse;
            });

            return cachedResponse || fetchPromise;
        })
    );
});