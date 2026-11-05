/* ==========================================================================
   SERVICE WORKER — caches the app shell for instant repeat loads & offline UI.
   ========================================================================== */
const CACHE = "atareeqak-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./src/styles/tokens.css",
  "./src/styles/base.css",
  "./src/styles/components.css",
  "./src/styles/sections.css",
  "./src/config.js",
  "./src/data/products.js",
  "./src/utils/dom.js",
  "./src/utils/format.js",
  "./src/store.js",
  "./src/components/icons.js",
  "./src/components/illustrations.js",
  "./src/components/product-art.js",
  "./src/components/ui.js",
  "./src/components/product-card.js",
  "./src/components/cart.js",
  "./src/components/quickview.js",
  "./src/components/search.js",
  "./src/components/checkout.js",
  "./src/sections/hero.js",
  "./src/sections/home.js",
  "./src/sections/catalog.js",
  "./src/motion.js",
  "./src/router.js",
  "./src/main.js",
  "./public/assets/logo.jpg",
  "./public/icons/favicon-32.png",
  "./public/icons/icon-192.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((cached) =>
      cached ||
      fetch(e.request).then((res) => {
        if (res && res.status === 200 && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached)
    )
  );
});

