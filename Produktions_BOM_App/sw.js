self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("bom-cache").then(cache =>
      cache.addAll([
        "./",
        "./index.html",
        "./style.css",
        "./app.js",
        "./data.json",
        "./manifest.json"
      ])
    )
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});