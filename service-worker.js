const CACHE = "hartmann-v1";
const ASSETS = [
  "./",
  "vendas.html",
  "menu.html",
  "produtos.html",
  "arquivados.html",
  "manifest.webmanifest",
  "install.js",
  "img/icon-192.png",
  "img/icon-512.png",
  "img/logo-hartmann.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
