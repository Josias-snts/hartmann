// sw.js — Irmãos Hartmann
// >>>>>> AUMENTE ESTA VERSÃO QUANDO PUBLICAR <<<<<<
const CACHE_VERSION = 'ih-v5-2025-08-14';
const CACHE_NAME = `irm-hart-${CACHE_VERSION}`;

// Detecta a URL base automaticamente (útil no GitHub Pages)
const SCOPE = (self.registration && self.registration.scope) || '/';
const base = (path) => new URL(path, SCOPE).toString();

// Arquivos principais do app (adicione/remova conforme seu repo)
const APP_SHELL = [
  base('./'),                 // raiz
  base('index.html'),
  base('menu.html'),
  base('vendas.html'),
  base('produtos.html'),
  base('arquivadas.html'),
  base('manifest.webmanifest'),
  base('img/logo-hartmann.png'),
  base('img/logo-192.png'),   // se tiver ícones do PWA
  base('img/logo-512.png')
];

// Instalação: pré-cache do shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// Ativação: limpa caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('irm-hart-') && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Estratégia de fetch:
// - HTML -> network-first (pega online e atualiza cache; se offline usa cache)
// - Outros (imagens, manifest, etc.) -> cache-first
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const isHTML = req.headers.get('accept')?.includes('text/html');

  if (isHTML) {
    event.respondWith(networkFirst(req));
  } else {
    event.respondWith(cacheFirst(req));
  }
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const fresh = await fetch(request, { cache: 'no-store' });
    cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    // fallback mínimo: entrega a página inicial se disponível
    return cache.match(base('index.html'));
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const fresh = await fetch(request);
  const cache = await caches.open(CACHE_NAME);
  cache.put(request, fresh.clone());
  return fresh;
}  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(c => c.put(req, copy));
      return res;
    }))
  );
});
