const CACHE_NAME = "aria-v0.3"; // v0.3 : purge des anciennes icônes (triangle Vercel)
const STATIC_ASSETS = [
  "/aria/login",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Réseau direct : routes API, requêtes non-GET, et autres domaines (Supabase)
  const url = new URL(event.request.url);
  if (
    event.request.url.includes("/api/") ||
    event.request.method !== "GET" ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  const putInCache = (res) => {
    if (res.ok) {
      const clone = res.clone();
      caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
    }
    return res;
  };

  // Fichiers versionnés de Next (nom unique par build) : cache d'abord, sans risque
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached ?? fetch(event.request).then(putInCache))
    );
    return;
  }

  // Pages et autres fichiers : réseau d'abord (toujours la dernière version),
  // cache seulement hors ligne
  event.respondWith(
    fetch(event.request)
      .then(putInCache)
      .catch(() => caches.match(event.request).then((cached) => cached ?? Response.error()))
  );
});
