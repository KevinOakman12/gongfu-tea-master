/* 茶道 ChaDao — service worker (офлайн).
   HTML/CSS/манифест: сначала сеть (свежая версия), при её отсутствии — кэш.
   Шрифты и иконки: из кэша. При изменении состава файлов поднимайте VERSION. */
const VERSION = 'v11';
const CACHE = 'gongfu-' + VERSION;
const ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "assets/tailwind.css",
  "assets/fonts.css",
  "assets/fonts/cormorant-garamond-italic-500-cyrillic.woff2",
  "assets/fonts/cormorant-garamond-italic-500-latin-ext.woff2",
  "assets/fonts/cormorant-garamond-italic-500-latin.woff2",
  "assets/fonts/cormorant-garamond-normal-500-cyrillic.woff2",
  "assets/fonts/cormorant-garamond-normal-500-latin-ext.woff2",
  "assets/fonts/cormorant-garamond-normal-500-latin.woff2",
  "assets/fonts/cormorant-garamond-normal-600-cyrillic.woff2",
  "assets/fonts/cormorant-garamond-normal-600-latin-ext.woff2",
  "assets/fonts/cormorant-garamond-normal-600-latin.woff2",
  "assets/fonts/cormorant-garamond-normal-700-cyrillic.woff2",
  "assets/fonts/cormorant-garamond-normal-700-latin-ext.woff2",
  "assets/fonts/cormorant-garamond-normal-700-latin.woff2",
  "assets/fonts/inter-normal-400-cyrillic.woff2",
  "assets/fonts/inter-normal-400-latin-ext.woff2",
  "assets/fonts/inter-normal-400-latin.woff2",
  "assets/fonts/inter-normal-500-cyrillic.woff2",
  "assets/fonts/inter-normal-500-latin-ext.woff2",
  "assets/fonts/inter-normal-500-latin.woff2",
  "assets/fonts/inter-normal-600-cyrillic.woff2",
  "assets/fonts/inter-normal-600-latin-ext.woff2",
  "assets/fonts/inter-normal-600-latin.woff2",
  "assets/fonts/jetbrains-mono-normal-400-cyrillic.woff2",
  "assets/fonts/jetbrains-mono-normal-400-latin-ext.woff2",
  "assets/fonts/jetbrains-mono-normal-400-latin.woff2",
  "assets/fonts/jetbrains-mono-normal-500-cyrillic.woff2",
  "assets/fonts/jetbrains-mono-normal-500-latin-ext.woff2",
  "assets/fonts/jetbrains-mono-normal-500-latin.woff2",
  "assets/fonts/noto-serif-sc-normal-500-subset.woff2",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/icons/apple-touch-icon.png"
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('gongfu-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  const isStatic = /\.(woff2|png)$/.test(url.pathname);

  if (isStatic) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => store(req, res))));
  } else {
    e.respondWith(
      fetch(req, { cache: 'no-cache' }).then(res => store(req, res))
        .catch(() => caches.match(req).then(hit => hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error())))
    );
  }
});

function store(req, res) {
  if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
  return res;
}
