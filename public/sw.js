// Evenor service worker — offline-first cache strategy
// Versioned by CACHE_NAME; update the version string to bust the cache on deploy.

const CACHE_NAME = "evenor-v1";

// App shell: the minimum set of files needed to launch offline.
// Relative paths so it works regardless of base URL.
const APP_SHELL = [
  "./",
  "./index.html",
  "./evenor.js",
  "./mindbook.css",
  "./icon.png",
  "./manifest.json",
];

// Install: pre-cache the app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  // Activate immediately — don't wait for old tabs to close
  self.skipWaiting();
});

// Activate: delete old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      ),
    ),
  );
  // Take control of all open pages immediately
  self.clients.claim();
});

// Fetch: cache-first for app shell, network-first for everything else
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin GET requests.
  // Let git HTTP requests (to other origins) pass through untouched.
  if (event.request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        // Return cache immediately, but update in background for next load
        const fetchPromise = fetch(event.request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, clone);
              });
            }
            return response;
          })
          .catch(() => cached);

        return cached;
      }

      // Not in cache: fetch from network, cache if same-origin asset
      return fetch(event.request).then((response) => {
        if (response.ok && url.pathname.match(/\.(js|css|html|png|json)$/)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      });
    }),
  );
});
