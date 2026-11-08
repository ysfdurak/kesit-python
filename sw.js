/* Kesit Python service worker: önce ağ, ağ yoksa son kaydedilen kopya.
   Çekirdek dosyalar ilk ziyarette önbelleğe alınır; her yeni sürümde eski önbellek silinir.
   Sürüm ve dosya listesi tools/ghpack.py tarafından yazılır. Yalnız bu uygulamanın önbelleklerine dokunur. */
const PREFIX = 'kesit-python-';
const CACHE = PREFIX + 'ba7a374c557a';
const CORE = ["./", "index.html", "config.js", "pyworker.js", "vendor/fonts.css", "data/manifest.json", "vendor/fonts/bricolage-grotesque-latin-wght-normal.woff2", "vendor/fonts/bricolage-grotesque-latin-ext-wght-normal.woff2", "vendor/fonts/ibm-plex-sans-latin-400-normal.woff2", "vendor/fonts/ibm-plex-sans-latin-ext-400-normal.woff2", "vendor/fonts/ibm-plex-sans-latin-500-normal.woff2", "vendor/fonts/ibm-plex-sans-latin-ext-500-normal.woff2", "vendor/fonts/ibm-plex-sans-latin-600-normal.woff2", "vendor/fonts/ibm-plex-sans-latin-ext-600-normal.woff2", "vendor/fonts/ibm-plex-sans-latin-400-italic.woff2", "vendor/fonts/ibm-plex-sans-latin-ext-400-italic.woff2", "vendor/fonts/jetbrains-mono-latin-400-normal.woff2", "vendor/fonts/jetbrains-mono-latin-ext-400-normal.woff2", "vendor/fonts/jetbrains-mono-latin-600-normal.woff2", "vendor/fonts/jetbrains-mono-latin-ext-600-normal.woff2", "recovery.js", "levels.js", "paths.js", "c_temel.js", "c_orta.js", "c_ileri.js", "n_temel.js", "n_orta.js", "n_ileri.js", "x_1.js", "x_2.js", "bank.js", "exams.js", "arena.js", "interview.js", "mistakes.js", "ex_anahtar.js", "bilinen-sinirlar.js", "engine.js", "app.js", "app2.js", "portfolio.js"];
/* Python motoru, paketleri ve pypaket/ tekerlekleri (sürümlü ad, değişmez): bir kez inince bu cihazda kalır, internetsiz de çalışır. */
const MOTOR = PREFIX + 'motor-0.27.8';
const MOTOR_URL = 'https://cdn.jsdelivr.net/npm/pyodide@0.27.8/';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => (k.startsWith(PREFIX) && k !== CACHE && k !== MOTOR)).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method === 'GET' && (req.url.startsWith(MOTOR_URL) || new URL(req.url).pathname.includes('/pypaket/'))) {
    e.respondWith(caches.open(MOTOR).then(c => c.match(req, { ignoreVary: true }).then(r => r || fetch(req).then(res => {
      if (res && (res.ok || res.type === 'opaque')) e.waitUntil(c.put(req, res.clone()).catch(() => {}));
      return res;
    }))));
    return;
  }
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(fetch(req).then(res => {
    if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {}); }
    return res;
  }).catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('./') : Response.error()))));
});
