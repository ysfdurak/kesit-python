/* Kesit Python service worker: önce ağ, ağ yoksa son kaydedilen kopya.
   Çekirdek dosyalar ilk ziyarette önbelleğe alınır; her yeni sürümde eski önbellek silinir.
   Sürüm ve dosya listesi tools/ghpack.py tarafından yazılır. Yalnız bu uygulamanın önbelleklerine dokunur. */
const PREFIX = 'kesit-python-';
const CACHE = PREFIX + '__SURUM__';
const CORE = __ONBELLEK__;
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
