const CACHE_NAME = "geek-calculator-v1";

const urlsToCache = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js"
];

// Install (save files)
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch (use cache if offline)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
