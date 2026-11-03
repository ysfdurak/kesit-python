/* Kesit Python service worker: önce ağ, ağ yoksa son kaydedilen kopya.
   Çekirdek dosyalar ilk ziyarette önbelleğe alınır; her yeni sürümde eski önbellek silinir.
   Sürüm ve dosya listesi tools/ghpack.py tarafından yazılır. Yalnız bu uygulamanın önbelleklerine dokunur. */
const PREFIX = 'kesit-python-';
const CACHE = PREFIX + '7a82617134bb';
const CORE = ["./", "index.html", "config.js", "pyworker.js", "vendor/fonts.css", "data/manifest.json", "levels.js", "paths.js", "c_temel.js", "c_orta.js", "c_ileri.js", "n_temel.js", "n_orta.js", "n_ileri.js", "x_1.js", "x_2.js", "bank.js", "exams.js", "arena.js", "interview.js", "mistakes.js", "ex_anahtar.js", "bilinen-sinirlar.js", "engine.js", "app.js", "app2.js", "portfolio.js"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => (k.startsWith(PREFIX) && k !== CACHE)).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(fetch(req).then(res => {
    if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {}); }
    return res;
  }).catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('./') : Response.error()))));
});
