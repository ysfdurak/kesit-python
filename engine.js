/* Kesit Python — Python motorunun sayfa tarafı.
   Motor (pyworker.js) ayrı iş parçacığında çalışır; ilk çalıştırmada yüklenir. Durdur düğmesi ve süre sınırı işçiyi
   sonlandırıp yenisini başlatır, sayfa donmaz. Ağ yoksa motor "yok" durumuna düşer; yeniden denemek mümkündür.
   input() için girdiler önceden verilir (Worker'da eşzamanlı girdi beklemek için paylaşılan bellek gerekir, GitHub Pages bunu sunmaz). */
(function () {
'use strict';
const S = { state: 'bos', err: '', w: null, seq: 0, pend: new Map(), listeners: [], booting: null, cur: null, gen: 0, partial: '', timer: null };
const LIMIT_MS = 60000;
const emit = () => S.listeners.forEach(f => { try { f(S.state); } catch (e) {} });
function onState(f) { S.listeners.push(f); }
function setState(s) { S.state = s; emit(); }

function worker() {
  if (S.w) return S.w;
  const w = S.w = new Worker('pyworker.js');
  w.onmessage = ev => {
    const m = ev.data;
    if (m.state) { if (w === S.w) setState(m.state); return; }
    if (m.paketBilgi != null) { S.paketBilgi = m.paketBilgi; emit(); return; }
    if (m.partial != null) { S.partial = m.partial; return; }
    if (m.started != null) { if (S.cur && S.cur.id === m.started) armTimer(S.cur.limit); return; }
    const p = S.pend.get(m.id); if (!p) return; S.pend.delete(m.id);
    if (m.ok) p.ok(m.res); else p.bad(new Error(m.msg));
  };
  w.onerror = ev => { ev.preventDefault && ev.preventDefault(); kill(new Error('Motor başlatılamadı')); S.err = 'Motor başlatılamadı'; setState('yok'); };
  return w;
}
function call(cmd, extra) { const id = ++S.seq; return new Promise((ok, bad) => { S.pend.set(id, { ok, bad, cmd }); worker().postMessage(Object.assign({ id, cmd }, extra)); }); }
function kill(reason) {
  if (S.w) { S.w.onmessage = null; S.w.onerror = null; S.w.terminate(); S.w = null; }
  clearTimeout(S.timer); S.booting = null; S.gen++;
  const pend = Array.from(S.pend.values()); S.pend.clear(); pend.forEach(p => p.bad(reason));
}
function armTimer(ms) { clearTimeout(S.timer); S.timer = setTimeout(() => halt('sure'), ms); }

async function boot() {
  if (S.booting) return S.booting;
  S.err = ''; setState('yukleniyor');
  S.booting = call('boot').then(() => { setState('hazir'); return true; }, e => { if (e && e.halted) throw e; S.booting = null; if (S.w) { S.w.terminate(); S.w = null; } S.err = 'Python motoru indirilemedi.'; setState('yok'); throw e; });
  return S.booting;
}
/* Çalışan kodu durdurur: işçi sonlanır, yenisi hazırlanır. why: 'kullanici' | 'sure' */
function halt(why) {
  if (!S.cur) return false;
  const c = S.cur; S.cur = null;
  const e = new Error('durdu'); e.halted = why;
  const partial = S.partial; kill(e);
  c.finish({ ok: false, out: partial, stderr: '', images: [], ms: Math.round(performance.now() - c.t0), stopped: why, err: { type: why === 'sure' ? 'Süre sınırı' : 'Durduruldu', msg: why === 'sure' ? 'Kod ' + Math.round(c.limit / 1000) + ' saniyede bitmedi, motor yeniden başlatıldı. Sonsuz döngü olabilir: döngünün durma koşulu var mı?' : 'Kodu sen durdurdun, motor yeniden başlatıldı.', line: null, where: '', phase: 'kod' } });
  setTimeout(() => { boot().catch(() => {}); }, 50);
  emit();
  return true;
}
const stop = () => {
  if (S.cur) return halt('kullanici');
  /* Motor inerken Durdur: indirme kesilir, sonraki Çalıştır baştan dener */
  if (S.booting && S.state !== 'hazir') { const e = new Error('durdu'); e.halted = 'kullanici'; kill(e); S.err = ''; S.stopped = true; setState('bos'); return true; }
  return false;
};
const stoppedBoot = () => { const v = !!S.stopped; S.stopped = false; return v; };
/* Motor bu cihazda önbellekte mi? Service worker yoksa (önizleme, file:) bilinemez: false */
const cached = () => { try { return caches.open('kesit-python-motor-0.27.8').then(c => c.match('https://cdn.jsdelivr.net/npm/pyodide@0.27.8/pyodide.asm.wasm', { ignoreVary: true })).then(r => !!r).catch(() => false); } catch (e) { return Promise.resolve(false); } };
const running = () => !!S.cur;

async function resetNs(key) { if (S.state !== 'hazir') return; try { await call('resetNs', { key }); } catch (e) {} }
async function ensurePkgs(list) { if (!list || !list.length) return; await boot(); await call('ensurePkgs', { list }); }

/* run({code, tests, stdin, needs, ns, raw, limit}) → {ok, out, stderr, images, err:{type,msg,line,where,phase}|null, ms, stopped} */
async function run(opt) {
  const t0 = performance.now();
  if (S.cur) halt('kullanici');
  await boot();
  return new Promise((res, rej) => {
    const limit = opt.limit || LIMIT_MS; let settled = false;
    const finish = r => { if (settled) return; settled = true; clearTimeout(S.timer); if (S.cur === cur) S.cur = null; emit(); res(r); };
    S.partial = '';
    const payload = { code: opt.code, tests: opt.tests, stdin: opt.stdin, needs: opt.needs, ns: opt.ns, raw: opt.raw };
    const id = S.seq + 1; const cur = { id, t0, limit, finish };
    S.cur = cur; emit();
    call('run', { opt: payload }).then(r => { r.ms = Math.round(performance.now() - t0); r.ok = !r.err; finish(r); }, e => { if (e && e.halted) return; if (S.cur === cur) S.cur = null; clearTimeout(S.timer); emit(); settled = true; rej(e); });
  });
}
function dataManifest() { return fetch('data/manifest.json').then(r => r.json()).then(j => j.datasets); }

/* Beklenen çıktı karşılaştırması: sondaki boşluklar ve satır sonları kırpılır */
function sameOut(got, expect) {
  const norm = s => String(s == null ? '' : s).replace(/\r\n/g, '\n').split('\n').map(l => l.replace(/\s+$/, '')).join('\n').trim();
  return norm(got) === norm(expect);
}

/* Hata mesajını öğrenci diline çevir */
const HINTS = {
  SyntaxError: 'Sözdizimi hatası: eksik iki nokta, kapanmamış parantez ya da tırnak olabilir.',
  IndentationError: 'Girinti hatası: blok 4 boşlukla hizalanmalı; sekme ve boşluğu karıştırma.',
  NameError: 'Tanımsız ad: değişkeni kullanmadan önce tanımladın mı? Yazım farkına (büyük/küçük harf) bak.',
  TypeError: 'Tür hatası: metinle sayıyı toplamak, fonksiyona yanlış sayıda argüman vermek gibi.',
  ValueError: 'Değer hatası: dönüşüm (int("abc")) ya da uygun olmayan değer.',
  IndexError: 'İndeks hatası: listede o konumda eleman yok; uzunluğu kontrol et.',
  KeyError: 'Anahtar hatası: sözlükte o anahtar yok; .get() kullanmayı düşün.',
  ZeroDivisionError: 'Sıfıra bölme: paydayı önce kontrol et.',
  AttributeError: 'Nitelik hatası: nesnenin o metodu/niteliği yok; türünü print(type(x)) ile kontrol et.',
  AssertionError: 'Test başarısız: beklenen sonuç ile senin sonucun farklı.',
  SystemExit: 'Program sys.exit() ile sıfırdan farklı bir kodla sonlandı (argparse hatalı argümanda 2 koduyla çıkar).',
  ModuleNotFoundError: 'Modül bulunamadı: tarayıcı ortamında standart kütüphane ve bilimsel paketler (pandas, numpy, scikit-learn, scipy, matplotlib, SQLAlchemy, pydantic, BeautifulSoup, polars, duckdb…) var; Flask, FastAPI gibi paketler yalnızca kendi bilgisayarında çalışır.',
  RecursionError: 'Özyineleme derinliği aşıldı: durma koşulunu kontrol et.',
  EOFError: 'Kod editöründeysen "input() girdileri" bölümünü aç, her satıra bir değer yaz. Alıştırmada girdiler hazır gelir; fazladan input() çağırmış olabilirsin.'
};
function explain(err) { if (!err) return ''; return HINTS[err.type] || ''; }

const NET = /XMLHttpRequest|NetworkError|Failed to fetch|getaddrinfo|Name or service|Connection|socket|ssl\b/i;
const explain0 = explain;
function explainAll(err) {
  if (!err) return '';
  if (/^(Süre sınırı|Durduruldu)$/.test(err.type)) return '';
  if (/[\u201C\u201D\u2018\u2019]/.test(String(err.msg || ''))) return 'Kıvrık tırnak: Python yalnız düz tırnağı tanır. “ ” yerine " yaz. Telefon klavyesi kıvrık tırnak üretebilir; akıllı noktalamayı kapatabilir ya da tırnağı buradaki gibi yazabilirsin.';
  if (err.type === 'NameError' && /name '[^']*[ıİ][^']*'/.test(String(err.msg || ''))) return 'Türkçe klavye: adda ı ya da İ var. Python komutları İngilizce harfle yazılır: prınt değil print, İnput değil input.';
  if (err.type === 'ModuleNotFoundError' && /'(openpyxl|xlsxwriter|pypdf|docx|reportlab|seaborn|plotly)/.test(String(err.msg || ''))) return 'Bu paket inemedi: bağlantı kesilmiş olabilir. Bağlantını kontrol edip yeniden çalıştır.';
  if (err.type === 'ModuleNotFoundError' && typeof navigator !== 'undefined' && navigator.onLine === false) return 'Bağlantı yok: bu paket bu cihaza henüz inmedi. Bağlantı gelince yeniden çalıştır.';
  if (NET.test(String(err.msg || '')) || /^(ConnectionError|JsException|URLError|gaierror|ProxyError|SSLError)$/.test(err.type)) return 'Ağ isteği: tarayıcıdaki Python başka sitelere doğrudan bağlanamaz (CORS). Bu kodu kendi bilgisayarında çalıştır; buradaki alıştırmalar sahte yanıtlarla çalışır.';
  return explain0(err);
}
window.PY_ENGINE = { boot, run, stop, running, resetNs, dataManifest, ensurePkgs, sameOut, explain: explainAll, onState, state: () => S.state, paketBilgi: () => S.paketBilgi || '', cached, stoppedBoot, error: () => S.err, generation: () => S.gen };
})();
