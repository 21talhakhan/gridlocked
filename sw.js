// GridLocked service worker: caches the app so it opens offline.
// Bump CACHE whenever you change a file, so phones pick up the new version.
const CACHE = "gridlocked-v2.0.0";
const FILES = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icons/favicon.svg",
  "icons/mark.svg",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "fonts/michroma-400.woff2",
  "fonts/vt323-400.woff2",
  "fonts/chakra-petch-400.woff2",
  "fonts/chakra-petch-500.woff2",
  "fonts/chakra-petch-600.woff2"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Page loads: try the network first so updates arrive, fall back to cache offline.
// Everything else (fonts, icons): cache first, it rarely changes.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put("index.html", copy)); return res; })
        .catch(() => caches.match("index.html"))
    );
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
