/* Kesit Python — Python motoru.
   Tarayıcıda gerçek CPython (Pyodide/WebAssembly) çalıştırır: kod + testler, stdout/stderr yakalama,
   input() için önceden verilen girdiler, pandas/numpy/matplotlib paketlerini isteğe bağlı yükleme.
   Hiç ağ yoksa motor "yok" durumuna düşer; uygulama örnek çözümleri okunur olarak sunmaya devam eder. */
(function () {
'use strict';
const PYODIDE_URL = 'https://cdn.jsdelivr.net/npm/pyodide@0.27.8/pyodide.js';
const INDEX_URL = 'https://cdn.jsdelivr.net/npm/pyodide@0.27.8/';
const VERI_SRC = "\"\"\"Kesit Python veri setleri (Kesit SQL ve Kesit Power BI ile ortak, tamamen kurgusal).\n\nKullanım:\n    import veri\n    veri.liste()                                  # veri setlerini listeler\n    veri.tablolar(\"anadolu_market\")               # bir setin tablolarını ve satır sayılarını yazar\n    df = veri.oku(\"anadolu_market\", \"orders\")     # pandas DataFrame\n    kayitlar = veri.kayitlar(\"ilgaz_bank\", \"bank_accounts\")   # pandas'sız: sözlük listesi\n    con = veri.baglan(\"anadolu_market\")           # tüm tabloları içeren bellek içi SQLite bağlantısı\n    yol = veri.yol(\"pedal_izmir\", \"bk_trips\")     # CSV dosyasının yolu (pd.read_csv(yol) ile de okunur)\n\"\"\"\nimport csv, json, os, re\n\nKOK = os.environ.get(\"PP_VERI\", \"/data\")\n_MAN = None\n\n\ndef _manifest():\n    global _MAN\n    if _MAN is None:\n        with open(os.path.join(KOK, \"manifest.json\"), encoding=\"utf-8\") as f:\n            _MAN = json.load(f)[\"datasets\"]\n    return _MAN\n\n\ndef _kontrol(set_adi, tablo=None):\n    m = _manifest()\n    if set_adi not in m:\n        raise KeyError(f\"Veri seti yok: {set_adi!r}. Seçenekler: {', '.join(m)}\")\n    if tablo is not None and tablo not in m[set_adi][\"tables\"]:\n        raise KeyError(f\"{set_adi} içinde {tablo!r} tablosu yok. Tablolar: {', '.join(m[set_adi]['tables'])}\")\n\n\ndef liste():\n    \"\"\"Veri setlerini adı, kaynağı ve tablo sayısıyla yazdırır.\"\"\"\n    for k, d in _manifest().items():\n        n = sum(t[\"rows\"] for t in d[\"tables\"].values())\n        print(f\"{k:<18} {d['name']:<32} {len(d['tables']):>3} tablo  {n:>8,} satır  ({d['source']})\")\n\n\ndef tablolar(set_adi):\n    \"\"\"Bir veri setinin tablolarını satır sayısı ve sütunlarıyla yazdırır.\"\"\"\n    _kontrol(set_adi)\n    for t, info in _manifest()[set_adi][\"tables\"].items():\n        print(f\"{t:<20} {info['rows']:>8,} satır  \" + \", \".join(c[0] for c in info[\"cols\"]))\n\n\ndef sutunlar(set_adi, tablo):\n    \"\"\"Sütun adlarını liste olarak döndürür.\"\"\"\n    _kontrol(set_adi, tablo)\n    return [c[0] for c in _manifest()[set_adi][\"tables\"][tablo][\"cols\"]]\n\n\ndef yol(set_adi, tablo):\n    \"\"\"CSV dosyasının tam yolunu döndürür.\"\"\"\n    _kontrol(set_adi, tablo)\n    return os.path.join(KOK, set_adi, tablo + \".csv\")\n\n\ndef _cevir(v):\n    if v == \"\":\n        return None\n    try:\n        return int(v)\n    except ValueError:\n        pass\n    try:\n        return float(v)\n    except ValueError:\n        return v\n\n\ndef _cevir_kirli(v):\n    \"\"\"Kirli veride \"1.430\" Türkçe binlik yazımdır: 1,43'e dönmesin, metin kalsın.\"\"\"\n    if re.fullmatch(r\"\\d{1,3}(\\.\\d{3})+\", v):\n        return v\n    return _cevir(v)\n\n\ndef kayitlar(set_adi, tablo, cevir=True):\n    \"\"\"Tabloyu sözlük listesi olarak okur (pandas gerekmez). cevir=True ise sayılar int/float, boşlar None olur.\"\"\"\n    with open(yol(set_adi, tablo), encoding=\"utf-8\", newline=\"\") as f:\n        r = csv.DictReader(f)\n        if not cevir:\n            return list(r)\n        c = _cevir_kirli if set_adi == \"kirli_veri\" else _cevir\n        return [{k: c(v) for k, v in row.items()} for row in r]\n\n\ndef oku(set_adi, tablo, **kw):\n    \"\"\"Tabloyu pandas DataFrame olarak okur. Ek argümanlar pd.read_csv'ye geçer (ör. parse_dates=[\"order_date\"]).\"\"\"\n    import pandas as pd\n    return pd.read_csv(yol(set_adi, tablo), **kw)\n\n\ndef hepsi(set_adi):\n    \"\"\"Veri setindeki tüm tabloları {ad: DataFrame} sözlüğü olarak döndürür.\"\"\"\n    _kontrol(set_adi)\n    return {t: oku(set_adi, t) for t in _manifest()[set_adi][\"tables\"]}\n\n\ndef baglan(set_adi, tablolar=None):\n    \"\"\"Veri setini bellek içi SQLite veritabanına yükler ve bağlantıyı döndürür.\n    tablolar=[\"orders\", \"customers\"] verirsen yalnız onları yükler (büyük setlerde hızlıdır).\"\"\"\n    import sqlite3\n    _kontrol(set_adi)\n    con = sqlite3.connect(\":memory:\")\n    c = _cevir_kirli if set_adi == \"kirli_veri\" else _cevir\n    for t, info in _manifest()[set_adi][\"tables\"].items():\n        if tablolar and t not in tablolar:\n            continue\n        cols = [k[0] for k in info[\"cols\"]]\n        con.execute(f'CREATE TABLE \"{t}\" (' + \", \".join(f'\"{c}\"' for c in cols) + \")\")\n        with open(yol(set_adi, t), encoding=\"utf-8\", newline=\"\") as f:\n            r = csv.reader(f)\n            next(r)\n            con.executemany(f'INSERT INTO \"{t}\" VALUES (' + \", \".join(\"?\" * len(cols)) + \")\",\n                            ([c(v) for v in row] for row in r))\n    con.commit()\n    return con\n";
const S = { state: 'bos', py: null, err: '', loading: null, pkgs: new Set(), listeners: [] };
const emit = () => S.listeners.forEach(f => { try { f(S.state); } catch (e) {} });
function onState(f) { S.listeners.push(f); }

function loadScript(src) {
  return new Promise((ok, bad) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => bad(new Error('yüklenemedi: ' + src)); document.head.appendChild(s); });
}

const PRELUDE = `
# --- Kesit Python tarayıcı uyumluluk katmanı (Pyodide) ---
import sys
if sys.platform == "emscripten":
    import asyncio, asyncio.events, time as _t, threading, concurrent.futures as _cf
    _pp_sleep = _t.sleep   # öğrenci kodu time.sleep'i değiştirse de döngü etkilenmesin
    class _NoSel:
        def select(self, timeout=None):
            if timeout and timeout > 0: _pp_sleep(min(timeout, 5))
            return []
        def close(self): pass
    class _PPLoop(asyncio.BaseEventLoop):
        """JSPI gerektirmeyen, zamanlayıcı tabanlı olay döngüsü: sleep/gather/wait_for/Semaphore/Queue çalışır."""
        def __init__(self):
            super().__init__(); self._selector = _NoSel()
        def _process_events(self, event_list): pass
        def run_until_complete(self, future):
            prev = asyncio.events._get_running_loop()
            asyncio.events._set_running_loop(None)
            try: return super().run_until_complete(future)
            finally: asyncio.events._set_running_loop(prev)
        def run_forever(self):
            # Pyodide'nin kendi WebLoop'u "çalışıyor" görünebilir; bu döngüyü onun içinde eşzamanlı çalıştır.
            prev = asyncio.events._get_running_loop()
            asyncio.events._set_running_loop(None)
            try: return super().run_forever()
            finally: asyncio.events._set_running_loop(prev)
        def _write_to_self(self): pass
        def close(self):
            if not self.is_closed(): super().close()
    class _PPPolicy(asyncio.events.BaseDefaultEventLoopPolicy):
        _loop_factory = _PPLoop
    asyncio.set_event_loop_policy(_PPPolicy())
    asyncio.SelectorEventLoop = _PPLoop
    def _pp_async_run(main, *, debug=None, loop_factory=None):
        loop = _PPLoop(); asyncio.set_event_loop(loop)
        try: return loop.run_until_complete(main)
        finally:
            try: loop.run_until_complete(loop.shutdown_asyncgens())
            except Exception: pass
            asyncio.set_event_loop(None); loop.close()
    asyncio.run = _pp_async_run
    asyncio.Runner = None
    # İş parçacıkları: tarayıcıda gerçek thread yok. start() iş parçacığını sıraya koyar; hedef fonksiyon
    # join() çağrıldığında (ya da boş bir kuyruktan okunmak istendiğinde, ya da program sonunda) sırayla çalışır.
    import queue as _q
    _PENDING = []
    def _run_thread(th):
        if getattr(th, "_pp_done", False): return
        th._pp_done = True
        if th in _PENDING: _PENDING.remove(th)
        try: th.run()
        except BaseException as e:
            threading.excepthook(threading.ExceptHookArgs((type(e), e, e.__traceback__, th)))
    def _run_pending():
        while _PENDING: _run_thread(_PENDING[0])
    def _th_start(self):
        if getattr(self, "_pp_started", False): raise RuntimeError("threads can only be started once")
        self._pp_started = True; _PENDING.append(self)
    threading.Thread.start = _th_start
    threading.Thread.join = lambda self, timeout=None: _run_thread(self) if getattr(self, "_pp_started", False) else None
    threading.Thread.is_alive = lambda self: getattr(self, "_pp_started", False) and not getattr(self, "_pp_done", False)
    _orig_get = _q.Queue.get
    def _q_get(self, block=True, timeout=None):
        if block and self.empty():
            for th in list(_PENDING):
                if self.empty(): _run_thread(th)
            if self.empty():
                if timeout is not None: raise _q.Empty
                raise RuntimeError("Tarayıcı ortamında gerçek iş parçacığı yok: boş kuyruktan get() sonsuza dek bekler. Bu kodu kendi bilgisayarında dene.")
        return _orig_get(self, block, timeout)
    _q.Queue.get = _q_get
    _orig_qjoin = _q.Queue.join
    def _q_join(self):
        if self.unfinished_tasks: _run_pending()
        if self.unfinished_tasks:
            raise RuntimeError("Tarayıcı ortamında gerçek iş parçacığı yok: task_done() çağrılmayan işler varken Queue.join() sonsuza dek bekler.")
        return _orig_qjoin(self)
    _q.Queue.join = _q_join
    _orig_wait = threading.Event.wait
    def _ev_wait(self, timeout=None):
        if not self.is_set(): _run_pending()
        if not self.is_set() and timeout is None:
            raise RuntimeError("Tarayıcı ortamında gerçek iş parçacığı yok: hiç kurulmayan Event.wait() sonsuza dek bekler.")
        return _orig_wait(self, 0 if not self.is_set() else timeout)
    threading.Event.wait = _ev_wait
    class _PPExecutor(_cf.Executor):
        def __init__(self, max_workers=None, *a, **k): self._max_workers = max_workers or 4
        def submit(self, fn, /, *args, **kwargs):
            f = _cf.Future()
            try: f.set_result(fn(*args, **kwargs))
            except BaseException as e: f.set_exception(e)
            return f
        def shutdown(self, wait=True, *, cancel_futures=False): pass
    _cf.ThreadPoolExecutor = _PPExecutor
    _cf.ProcessPoolExecutor = _PPExecutor
    async def _to_thread(func, /, *args, **kwargs): return func(*args, **kwargs)
    asyncio.to_thread = _to_thread


import sys, io, builtins, json, traceback
class _PP:
    inputs = []
    out = None
def _pp_input(prompt=""):
    if getattr(_PP, "raw", False):
        # Arena modu: HackerRank gibi; girdi standart girdiden okunur, ekrana yansıtılmaz
        satir = sys.stdin.readline()
        if not satir:
            raise EOFError("Standart girdide okunacak satır kalmadı.")
        return satir.rstrip("\\n")
    sys.stdout.write(str(prompt))
    if not _PP.inputs:
        raise EOFError("input() için girdi kalmadı. Bu alıştırma girdi beklemiyor ya da verilen girdiler bitti.")
    v = _PP.inputs.pop(0)
    sys.stdout.write(str(v) + "\\n")
    return str(v)
builtins.input = _pp_input
_PP_NS = {}
def _pp_flush_threads():
    try: _run_pending()
    except NameError: pass
def _pp_polars_patch():
    # Tarayıcıdaki polars derlemesinde dosyadan tembel okuma ve Parquet G/Ç yok (çağrılınca motor çöker).
    # Aynı API'yi eager okuma + .lazy() ve pyarrow üzerinden sağla.
    import sys
    if sys.platform != "emscripten": return
    try:
        import polars as pl
    except Exception:
        return
    if getattr(pl, "_pp_patched", False): return
    _rc = pl.read_csv
    def scan_csv(source, **kw):
        for k in ("low_memory", "rechunk", "cache", "glob", "storage_options", "retries", "file_cache_ttl", "include_file_paths", "credential_provider"):
            kw.pop(k, None)
        return _rc(source, **kw).lazy()
    def read_parquet(source, columns=None, **kw):
        import pyarrow.parquet as pq
        return pl.from_arrow(pq.read_table(source, columns=columns))
    def scan_parquet(source, **kw):
        return read_parquet(source).lazy()
    def write_parquet(self, file, **kw):
        import pyarrow.parquet as pq
        pq.write_table(self.to_arrow(), file)
    def sink_csv(self, path, **kw):
        return self.collect().write_csv(path)
    # wasm32 derlemesinde CSV'den gelen metin sütunlarını Arrow'a aktarmak bazen "capacity overflow" paniği veriyor;
    # o durumda veriyi Python listeleri üzerinden aktar (DuckDB ve to_pandas da bu yoldan geçer)
    def _panik(e): return type(e).__name__ == "PanicException"
    _ta = pl.DataFrame.to_arrow
    def to_arrow(self, *a, **k):
        try: return _ta(self, *a, **k)
        except BaseException as e:
            if not _panik(e): raise
            import pyarrow as pa
            return pa.Table.from_pydict(self.to_dict(as_series=False))
    _tp = pl.DataFrame.to_pandas
    def to_pandas(self, *a, **k):
        try: return _tp(self, *a, **k)
        except BaseException as e:
            if not _panik(e): raise
            import pandas as pd
            return pd.DataFrame(self.to_dict(as_series=False))
    pl.DataFrame.to_arrow = to_arrow; pl.DataFrame.to_pandas = to_pandas
    pl.DataFrame.__arrow_c_stream__ = lambda self, requested_schema=None: self.to_arrow().__arrow_c_stream__(requested_schema)
    pl.scan_csv = scan_csv; pl.read_parquet = read_parquet; pl.scan_parquet = scan_parquet
    pl.DataFrame.write_parquet = write_parquet; pl.LazyFrame.sink_csv = sink_csv
    pl._pp_patched = True

def _pp_fix_lazy():
    # polars, isteğe bağlı paketleri (pyarrow, pandas...) içe aktarıldığı anda bir kez yoklar;
    # paket sonradan yüklenirse tembel vekilleri ve bayrakları güncelle
    import sys, importlib.util as _u
    d = sys.modules.get("polars.dependencies")
    if d is None: return
    yeni = []
    for v in list(vars(d).values()):
        if isinstance(v, d._LazyModule) and not v._module_available:
            try: ok = _u.find_spec(v._module_name) is not None
            except Exception: ok = False
            if ok: v._module_available = True; yeni.append(v._module_name)
    if not yeni: return
    flags = ["_%s_AVAILABLE" % n.upper().replace(".", "_") for n in yeni]
    for name, m in list(sys.modules.items()):
        if m is not None and (name == "polars" or name.startswith("polars.")):
            for f in flags:
                if getattr(m, f, None) is False: setattr(m, f, True)

def _pp_run(code, tests, inputs, filename="<kodun>", nskey="", raw=None):
    try: _pp_fix_lazy()
    except Exception: pass
    _PP.inputs = list(inputs or [])
    _PP.raw = raw is not None
    old_in = sys.stdin
    sys.stdin = io.StringIO(raw if raw is not None else "\\n".join(str(x) for x in _PP.inputs) + "\\n")
    buf = io.StringIO(); ebuf = io.StringIO()
    old_out, old_err = sys.stdout, sys.stderr
    sys.stdout = buf; sys.stderr = ebuf
    if nskey:
        ns = _PP_NS.setdefault(nskey, {"__name__": "__main__"})
        ns["__source__"] = code
    else:
        ns = {"__name__": "__main__", "__source__": code}
    err = None; phase = "kod"
    try:
        exec(compile(code, filename, "exec"), ns)
        _pp_flush_threads()
        if tests:
            phase = "test"
            exec(compile(tests, "<test>", "exec"), ns)
    except SystemExit as e:
        if e.code not in (0, None):
            err = {"type": "SystemExit", "msg": "program " + repr(e.code) + " çıkış koduyla sonlandı", "line": None, "where": "", "phase": phase}
    except BaseException as e:
        tb = traceback.extract_tb(e.__traceback__)
        tb = [f for f in tb if f.filename in (filename, "<test>")]
        line = tb[-1].lineno if tb else None
        where = tb[-1].filename if tb else ""
        err = {"type": type(e).__name__, "msg": str(e), "line": line, "where": where, "phase": phase}
    finally:
        sys.stdout = old_out; sys.stderr = old_err; sys.stdin = old_in
    return json.dumps({"out": buf.getvalue(), "stderr": ebuf.getvalue(), "err": err})
`;

async function boot() {
  if (S.py) return S.py;
  if (S.loading) return S.loading;
  S.state = 'yukleniyor'; emit();
  S.loading = (async () => {
    try {
      if (!window.loadPyodide) await loadScript(PYODIDE_URL);
      const py = await window.loadPyodide({ indexURL: INDEX_URL });
      await py.runPythonAsync(PRELUDE);
      try { py.FS.mkdirTree('/pp_lib'); py.FS.mkdirTree('/data'); py.FS.writeFile('/pp_lib/veri.py', VERI_SRC); await py.runPythonAsync('import sys\nsys.path.insert(0, "/pp_lib")'); } catch (e) {}
      S.py = py; S.state = 'hazir'; emit();
      return py;
    } catch (e) { S.state = 'yok'; S.err = String(e && e.message || e); emit(); throw e; }
  })();
  return S.loading;
}


/* Veri setleri: kod bir veri setinin adını ya da veri modülünü kullanıyorsa ilgili CSV'ler sanal dosya sistemine (/data) indirilir. */
const DATA = { man: null, got: new Set() };
async function ensureData(py, src) {
  if (!/\bveri\b|\/data\//.test(src)) return;
  try {
    if (!DATA.man) { const r = await fetch('data/manifest.json'); const txt = await r.text(); DATA.man = JSON.parse(txt).datasets; py.FS.writeFile('/data/manifest.json', txt); }
    const keys = Object.keys(DATA.man).filter(k => src.includes(k));
    for (const k of keys) {
      if (DATA.got.has(k)) continue;
      S.state = 'paket'; emit();
      try { py.FS.mkdirTree('/data/' + k); } catch (e) {}
      await Promise.all(Object.keys(DATA.man[k].tables).map(async t => { const r = await fetch('data/' + k + '/' + t + '.csv'); py.FS.writeFile('/data/' + k + '/' + t + '.csv', new Uint8Array(await r.arrayBuffer())); }));
      DATA.got.add(k);
    }
    const need = [];
    if (/veri\.(oku|hepsi)\b/.test(src) && !S.pkgs.has('pandas')) need.push('pandas');
    if (/veri\.baglan\b/.test(src) && !S.pkgs.has('sqlite3')) need.push('sqlite3');
    if (need.length) { await py.loadPackage(need); need.forEach(p => S.pkgs.add(p)); }
  } finally { if (S.state === 'paket') { S.state = 'hazir'; emit(); } }
}
function dataManifest() { return DATA.man ? Promise.resolve(DATA.man) : fetch('data/manifest.json').then(r => r.json()).then(j => (DATA.man = j.datasets)); }

async function ensurePkgs(list) {
  if (!list || !list.length) return;
  const py = await boot();
  const need = list.filter(p => !S.pkgs.has(p));
  if (!need.length) return;
  S.state = 'paket'; emit();
  try { await py.loadPackage(need); need.forEach(p => S.pkgs.add(p)); if (need.includes('matplotlib')) { await py.runPythonAsync('import matplotlib\nmatplotlib.use("Agg")'); } }
  finally { S.state = 'hazir'; emit(); }
}

/* run({code, tests, stdin, needs}) → {ok, out, err:{type,msg,line,where,phase}|null, ms} */
async function resetNs(key) { if (!S.py) return; try { await S.py.runPythonAsync('_PP_NS.pop(' + JSON.stringify(String(key)) + ', None)'); } catch (e) {} }
async function run(opt) {
  const t0 = performance.now();
  const py = await boot();
  await ensurePkgs(opt.needs);
  await ensureData(py, String(opt.code || '') + '\n' + String(opt.tests || ''));
  try { const src = String(opt.code || '') + '\n' + String(opt.tests || ''); if (/\bhashlib\b/.test(src) && !S.pkgs.has('hashlib')) { try { await py.loadPackage(['hashlib']); S.pkgs.add('hashlib'); await py.runPythonAsync('import sys\nfor _m in ("hashlib", "_hashlib", "hmac", "secrets"): sys.modules.pop(_m, None)'); } catch (e) {} } if (/^\s*(import|from)\s/m.test(src)) { S.state = 'paket'; emit(); await py.loadPackagesFromImports(src); if (/matplotlib/.test(src) && !S.pkgs.has('mpl-agg')) { await py.runPythonAsync('import matplotlib\nmatplotlib.use("Agg")'); S.pkgs.add('mpl-agg'); }  if (/\bpolars\b/.test(src)) { if (/parquet|duckdb|to_arrow|to_pandas|pyarrow/.test(src) && !S.pkgs.has('pyarrow')) { try { await py.loadPackage(['pyarrow']); S.pkgs.add('pyarrow'); } catch (e) {} } await py.runPythonAsync('_pp_polars_patch()'); } } } catch (e) {} finally { if (S.state === 'paket') { S.state = 'hazir'; emit(); } }
  const fn = py.globals.get('_pp_run');
  let res;
  try {
    const raw = fn(String(opt.code || ''), String(opt.tests || ''), (opt.stdin || []).map(String), '<kodun>', String(opt.ns || ''), opt.raw == null ? null : String(opt.raw));
    res = JSON.parse(raw);
  } finally { fn.destroy && fn.destroy(); }
  res.ms = Math.round(performance.now() - t0);
  res.ok = !res.err;
  return res;
}

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
  ModuleNotFoundError: 'Modül bulunamadı: tarayıcı ortamında standart kütüphane ve bilimsel paketler (pandas, numpy, scikit-learn, scipy, matplotlib, SQLAlchemy, pydantic, BeautifulSoup, polars, duckdb…) var; Flask, FastAPI, openpyxl gibi paketler yalnızca kendi bilgisayarında çalışır.',
  RecursionError: 'Özyineleme derinliği aşıldı: durma koşulunu kontrol et.',
  EOFError: 'input() için girdi kalmadı.'
};
function explain(err) { if (!err) return ''; return HINTS[err.type] || ''; }

window.PY_ENGINE = { boot, run, resetNs, dataManifest, ensurePkgs, sameOut, explain, onState, state: () => S.state, error: () => S.err };
})();
