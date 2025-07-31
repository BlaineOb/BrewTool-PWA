const VERSION = "1.2";
const CACHE_NAME = `brew-tool-${VERSION}`;
const APP_STATIC_RESOURCES = [
  "/",
  "/beer_big_icon.png",
  "/beer_medium_icon.png",
  "/favicon.png",
  "/manifest.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      cache.addAll(APP_STATIC_RESOURCES);
    })()
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
      await clients.claim();
    })()
  );
});

self.addEventListener("fetch", (e) => {
  if (
    !(e.request.url.startsWith("http:") || e.request.url.startsWith("https:"))
  ) {
    return;
  }

  e.respondWith(
    (async () => {
      const r = await caches.match(e.request);
      if (r) return r;
      const response = await fetch(e.request);
      const cache = await caches.open(CACHE_NAME);
      cache.put(e.request, response.clone());
      return response;
    })()
  );
});
