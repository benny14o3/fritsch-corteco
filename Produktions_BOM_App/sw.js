const CACHE_NAME = "bom-cache-v2";
const STATIC_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json"
];

// data.json wird NICHT gecacht – immer frisch vom Server
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  // Alte Caches löschen
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // data.json immer vom Netzwerk laden
  if (url.pathname.endsWith("data.json")) {
    e.respondWith(
      fetch(e.request, { cache: "no-store" })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Alles andere: Cache first
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
