// sw.js — Irmãos Hartmann (PWA)
// >>>>>> AUMENTE ESTA VERSÃO AO PUBLICAR <<<<<<
const CACHE_VERSION = 'ih-v8-2025-08-16';
const CACHE_NAME = `irm-hart-${CACHE_VERSION}`;

// Detecta o escopo automaticamente (útil no GitHub Pages)
const SCOPE = (self.registration && self.registration.scope) || '/';
const base = (path) => new URL(path, SCOPE).toString();

// App Shell (adicione/remova de acordo com seu repo)
const APP_SHELL = [
  base('./'),
  base('index.html'),
  base('menu.html'),
  base('vendas.html'),
  base('produtos.html'),
  base('arquivadas.html'),
  base('manifest.webmanifest'),
  base('img/logo-hartmann.png'),
  base('img/logo-192.png'),   // se existirem
  base('img/logo-512.png')
];

// ===== Install: pré-cache do shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// ===== Activate: remove caches antigos
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

// ===== Fetch Strategy
// - HTML: network-first (pega online e atualiza cache; offline cai no cache)
// - Demais (img/manifest/etc.): cache-first com atualização em segundo plano
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const accept = req.headers.get('accept') || '';
  const isHTML = accept.includes('text/html');

  if (isHTML || req.mode === 'navigate') {
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
    return cache.match(base('index.html'));
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    // atualiza em segundo plano
    fetch(request).then((res) => {
      caches.open(CACHE_NAME).then((c) => c.put(request, res.clone()));
    }).catch(()=>{});
    return cached;
  }
  const fresh = await fetch(request);
  const cache = await caches.open(CACHE_NAME);
  cache.put(request, fresh.clone());
  return fresh;
}

// ===== Mensagens opcionais (para "atualizar agora")
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});        keys
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
