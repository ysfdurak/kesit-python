/* Kesit Python — Python motoru (Web Worker).
   Gerçek CPython'ı (Pyodide/WebAssembly) ayrı iş parçacığında çalıştırır; sonsuz döngü sayfayı dondurmaz,
   ana sayfa bu işçiyi sonlandırıp yenisini başlatabilir. Ana sayfa arayüzü: engine.js */
'use strict';
const PYODIDE_URL = 'https://cdn.jsdelivr.net/npm/pyodide@0.27.8/pyodide.js';
const INDEX_URL = 'https://cdn.jsdelivr.net/npm/pyodide@0.27.8/';
const VERI_SRC = "\"\"\"Kesit Python veri setleri (Kesit SQL ve Kesit Power BI ile ortak, tamamen kurgusal).\n\nKullanım:\n    import veri\n    veri.liste()                                  # veri setlerini listeler\n    veri.tablolar(\"anadolu_market\")               # bir setin tablolarını ve satır sayılarını yazar\n    df = veri.oku(\"anadolu_market\", \"orders\")     # pandas DataFrame\n    kayitlar = veri.kayitlar(\"ilgaz_bank\", \"bank_accounts\")   # pandas'sız: sözlük listesi\n    con = veri.baglan(\"anadolu_market\")           # tüm tabloları içeren bellek içi SQLite bağlantısı\n    yol = veri.yol(\"pedal_izmir\", \"bk_trips\")     # CSV dosyasının yolu (pd.read_csv(yol) ile de okunur)\n\"\"\"\nimport csv, json, os, re\n\nKOK = os.environ.get(\"PP_VERI\", \"/data\")\n_MAN = None\n\n\ndef _manifest():\n    global _MAN\n    if _MAN is None:\n        with open(os.path.join(KOK, \"manifest.json\"), encoding=\"utf-8\") as f:\n            _MAN = json.load(f)[\"datasets\"]\n    return _MAN\n\n\ndef _kontrol(set_adi, tablo=None):\n    m = _manifest()\n    if set_adi not in m:\n        raise KeyError(f\"Veri seti yok: {set_adi!r}. Seçenekler: {', '.join(m)}\")\n    if tablo is not None and tablo not in m[set_adi][\"tables\"]:\n        raise KeyError(f\"{set_adi} içinde {tablo!r} tablosu yok. Tablolar: {', '.join(m[set_adi]['tables'])}\")\n\n\ndef liste():\n    \"\"\"Veri setlerini adı, kaynağı ve tablo sayısıyla yazdırır.\"\"\"\n    for k, d in _manifest().items():\n        n = sum(t[\"rows\"] for t in d[\"tables\"].values())\n        print(f\"{k:<18} {d['name']:<32} {len(d['tables']):>3} tablo  {n:>8,} satır  ({d['source']})\")\n\n\ndef tablolar(set_adi):\n    \"\"\"Bir veri setinin tablolarını satır sayısı ve sütunlarıyla yazdırır.\"\"\"\n    _kontrol(set_adi)\n    for t, info in _manifest()[set_adi][\"tables\"].items():\n        print(f\"{t:<20} {info['rows']:>8,} satır  \" + \", \".join(c[0] for c in info[\"cols\"]))\n\n\ndef sutunlar(set_adi, tablo):\n    \"\"\"Sütun adlarını liste olarak döndürür.\"\"\"\n    _kontrol(set_adi, tablo)\n    return [c[0] for c in _manifest()[set_adi][\"tables\"][tablo][\"cols\"]]\n\n\ndef yol(set_adi, tablo):\n    \"\"\"CSV dosyasının tam yolunu döndürür.\"\"\"\n    _kontrol(set_adi, tablo)\n    return os.path.join(KOK, set_adi, tablo + \".csv\")\n\n\ndef _cevir(v):\n    if v == \"\":\n        return None\n    try:\n        return int(v)\n    except ValueError:\n        pass\n    try:\n        return float(v)\n    except ValueError:\n        return v\n\n\ndef _cevir_kirli(v):\n    \"\"\"Kirli veride \"1.430\" Türkçe binlik yazımdır: 1,43'e dönmesin, metin kalsın.\"\"\"\n    if re.fullmatch(r\"\\d{1,3}(\\.\\d{3})+\", v):\n        return v\n    return _cevir(v)\n\n\ndef kayitlar(set_adi, tablo, cevir=True):\n    \"\"\"Tabloyu sözlük listesi olarak okur (pandas gerekmez). cevir=True ise sayılar int/float, boşlar None olur.\"\"\"\n    with open(yol(set_adi, tablo), encoding=\"utf-8\", newline=\"\") as f:\n        r = csv.DictReader(f)\n        if not cevir:\n            return list(r)\n        c = _cevir_kirli if set_adi == \"kirli_veri\" else _cevir\n        return [{k: c(v) for k, v in row.items()} for row in r]\n\n\ndef oku(set_adi, tablo, **kw):\n    \"\"\"Tabloyu pandas DataFrame olarak okur. Ek argümanlar pd.read_csv'ye geçer (ör. parse_dates=[\"order_date\"]).\"\"\"\n    import pandas as pd\n    return pd.read_csv(yol(set_adi, tablo), **kw)\n\n\ndef hepsi(set_adi):\n    \"\"\"Veri setindeki tüm tabloları {ad: DataFrame} sözlüğü olarak döndürür.\"\"\"\n    _kontrol(set_adi)\n    return {t: oku(set_adi, t) for t in _manifest()[set_adi][\"tables\"]}\n\n\ndef baglan(set_adi, tablolar=None):\n    \"\"\"Veri setini bellek içi SQLite veritabanına yükler ve bağlantıyı döndürür.\n    tablolar=[\"orders\", \"customers\"] verirsen yalnız onları yükler (büyük setlerde hızlıdır).\"\"\"\n    import sqlite3\n    _kontrol(set_adi)\n    con = sqlite3.connect(\":memory:\")\n    c = _cevir_kirli if set_adi == \"kirli_veri\" else _cevir\n    for t, info in _manifest()[set_adi][\"tables\"].items():\n        if tablolar and t not in tablolar:\n            continue\n        cols = [k[0] for k in info[\"cols\"]]\n        con.execute(f'CREATE TABLE \"{t}\" (' + \", \".join(f'\"{c}\"' for c in cols) + \")\")\n        with open(yol(set_adi, t), encoding=\"utf-8\", newline=\"\") as f:\n            r = csv.reader(f)\n            next(r)\n            con.executemany(f'INSERT INTO \"{t}\" VALUES (' + \", \".join(\"?\" * len(cols)) + \")\",\n                            ([c(v) for v in row] for row in r))\n    con.commit()\n    return con\n";
const S = { py: null, pkgs: new Set() };
const state = s => postMessage({ state: s });
self._pp_partial = t => postMessage({ partial: String(t) });

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

class _PPOut(io.StringIO):
    """Çıktıyı biriktirir, Durdur'da kaybolmasın diye aralıklarla ana sayfaya gönderir, aşırı büyümeyi keser."""
    LIMIT = 2_000_000
    def __init__(self):
        super().__init__(); self._n = 0; self._t = 0.0; self._kesik = False
    def write(self, s):
        s = str(s)
        if self._kesik: return len(s)
        self._n += len(s)
        if self._n > self.LIMIT:
            super().write("\\n… çıktı çok uzadı, burada kesildi …\\n"); self._kesik = True; return len(s)
        r = super().write(s)
        if _pp_partial is not None:
            import time as _tm
            now = _tm.monotonic()
            if now - self._t > 0.3:
                self._t = now
                try: _pp_partial(self.getvalue()[-20000:])
                except Exception: pass
        return r
try:
    from js import _pp_partial
except Exception:
    _pp_partial = None

def _pp_kaynak(code):
    """__source__ için: yorumları ayıklar; öğrencinin yorumu kaynak denetimlerini bozmasın."""
    import tokenize, io as _io
    try:
        satirlar = code.splitlines(keepends=True)
        toks = list(tokenize.generate_tokens(_io.StringIO(code).readline))
        for t in sorted((t for t in toks if t.type == tokenize.COMMENT), key=lambda t: t.start, reverse=True):
            s = satirlar[t.start[0] - 1]
            satirlar[t.start[0] - 1] = s[:t.start[1]] + s[t.end[1]:]
        return "".join(satirlar)
    except Exception:
        return code

def _pp_kod(code):
    """__kod__ için: yorumları ve metin içlerini ayıklar; yalnız gerçek kod kalır ("for" yasak denetimi print metnine takılmaz)."""
    import tokenize, io as _io
    try:
        satirlar = code.splitlines(keepends=True)
        bas = [0]
        for s in satirlar: bas.append(bas[-1] + len(s))
        off = lambda p: bas[p[0] - 1] + p[1]
        adlar = {tokenize.COMMENT, tokenize.STRING}
        for ad in ("FSTRING_MIDDLE", "TSTRING_MIDDLE"):
            if hasattr(tokenize, ad): adlar.add(getattr(tokenize, ad))
        toks = [t for t in tokenize.generate_tokens(_io.StringIO(code).readline) if t.type in adlar]
        for t in sorted(toks, key=lambda t: t.start, reverse=True):
            code = code[:off(t.start)] + ('""' if t.type == tokenize.STRING else "") + code[off(t.end):]
        return code
    except Exception:
        return code

def _pp_grafikler():
    """Açık matplotlib şekillerini PNG (base64) olarak toplar ve kapatır."""
    plt = sys.modules.get("matplotlib.pyplot")
    if plt is None: return []
    import base64
    out = []
    try:
        for n in list(plt.get_fignums())[:6]:
            b = io.BytesIO(); plt.figure(n).savefig(b, format="png", dpi=110, bbox_inches="tight")
            out.append(base64.b64encode(b.getvalue()).decode())
        plt.close("all")
    except Exception:
        pass
    return out

_PP_HTML = []
def _pp_html_al():
    h = list(_PP_HTML); _PP_HTML.clear(); return h
def _pp_plotly_kur():
    import plotly.basedatatypes as _b
    def _goster(self, *a, **k):
        _PP_HTML.append(self.to_html(include_plotlyjs=True, full_html=True))
    _b.BaseFigure.show = _goster
_PP_UZANTI = (".xlsx", ".docx", ".pdf", ".html", ".csv", ".xml")
def _pp_dosya_durum():
    import os
    d = {}
    for kok, _, ad in os.walk("."):
        for a in ad:
            if a.lower().endswith(_PP_UZANTI):
                y = os.path.join(kok, a)
                try:
                    s = os.stat(y); d[y] = (s.st_mtime, s.st_size)
                except OSError:
                    pass
    return d
def _pp_dosya_fark(once):
    import base64
    out = []
    for y, v in _pp_dosya_durum().items():
        if once.get(y) != v and v[1] <= 8000000 and len(out) < 6:
            with open(y, "rb") as f:
                out.append({"ad": y[2:], "b64": base64.b64encode(f.read()).decode()})
    return out
def _pp_run(code, tests, inputs, filename="<kodun>", nskey="", raw=None, grafik=False):
    _once = _pp_dosya_durum() if grafik else {}
    try: _pp_fix_lazy()
    except Exception: pass
    _PP.inputs = list(inputs or [])
    _PP.raw = raw is not None
    old_in = sys.stdin
    sys.stdin = io.StringIO(raw if raw is not None else "\\n".join(str(x) for x in _PP.inputs) + "\\n")
    buf = _PPOut(); ebuf = io.StringIO()
    old_out, old_err = sys.stdout, sys.stderr
    sys.stdout = buf; sys.stderr = ebuf
    if nskey:
        ns = _PP_NS.setdefault(nskey, {"__name__": "__main__"})
        ns["__source__"] = _pp_kaynak(code); ns["__kod__"] = _pp_kod(code)
    else:
        ns = {"__name__": "__main__", "__source__": _pp_kaynak(code), "__kod__": _pp_kod(code)}
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
    return json.dumps({"out": buf.getvalue(), "stderr": ebuf.getvalue(), "err": err, "images": _pp_grafikler() if grafik else [], "htmls": _pp_html_al(), "dosyalar": _pp_dosya_fark(_once) if grafik else []})
`;

async function boot() {
  if (S.py) return S.py;
  state('yukleniyor');
  importScripts(PYODIDE_URL);
  const py = await self.loadPyodide({ indexURL: INDEX_URL });
  py.FS.mkdirTree('/pp_lib'); py.FS.mkdirTree('/data'); py.FS.writeFile('/pp_lib/veri.py', VERI_SRC);
  await py.runPythonAsync('import os, sys\nos.environ["MPLBACKEND"] = "Agg"\nsys.path.insert(0, "/pp_lib")');
  await py.runPythonAsync(PRELUDE);
  S.py = py; state('hazir');
  return py;
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
      state('paket');
      try { py.FS.mkdirTree('/data/' + k); } catch (e) {}
      await Promise.all(Object.keys(DATA.man[k].tables).map(async t => { const r = await fetch('data/' + k + '/' + t + '.csv'); py.FS.writeFile('/data/' + k + '/' + t + '.csv', new Uint8Array(await r.arrayBuffer())); }));
      DATA.got.add(k);
    }
    const need = [];
    if (/veri\.(oku|hepsi)\b/.test(src) && !S.pkgs.has('pandas')) need.push('pandas');
    if (/veri\.baglan\b/.test(src) && !S.pkgs.has('sqlite3')) need.push('sqlite3');
    if (need.length) { await py.loadPackage(need); need.forEach(p => S.pkgs.add(p)); }
  } finally { state('hazir'); }
}

async function mplReady(py) {
  if (S.pkgs.has('mpl-agg')) return;
  await py.runPythonAsync('import warnings, matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.font_manager\nwarnings.filterwarnings("ignore", message=".*non-interactive.*")\nwarnings.filterwarnings("ignore", message=".*Glyph.*")');
  S.pkgs.add('mpl-agg');
}

/*YEREL*/
/* Pyodide'ın kendi paketlerinde olmayan saf Python tekerlekleri: sitenin pypaket/ klasöründen, sürümü sabit, gerekince iner. Lisanslar: pypaket/LISANSLAR.md */
const YEREL = {
  openpyxl: { kb: 270, whl: ['et_xmlfile-2.0.0-py3-none-any.whl', 'openpyxl-3.1.5-py2.py3-none-any.whl'], dep: [] },
  xlsxwriter: { kb: 180, whl: ['xlsxwriter-3.3.1-py3-none-any.whl'], dep: [] },
  pypdf: { kb: 410, whl: ['pypdf-6.21.4-py3-none-any.whl'], dep: [] },
  docx: { kb: 250, whl: ['python_docx-1.2.0-py3-none-any.whl'], dep: ['lxml', 'typing-extensions'] },
  reportlab: { kb: 2020, whl: ['reportlab-5.1.0-py3-none-any.whl'], dep: ['pillow', 'charset-normalizer'] },
  seaborn: { kb: 295, whl: ['seaborn-0.13.2-py3-none-any.whl'], dep: ['matplotlib', 'pandas', 'numpy'] },
  plotly: { kb: 9700, whl: ['plotly-7.1.0-py3-none-any.whl'], dep: ['narwhals', 'packaging', 'numpy'] }
};
function yerelGerek(src) {
  const ad = Object.keys(YEREL).filter(k => new RegExp('^\\s*(?:import|from)\\s+' + k + '\\b', 'm').test(src));
  if (/\b(?:read_excel|to_excel|ExcelWriter|ExcelFile)\b/.test(src) && !ad.includes('openpyxl')) ad.push('openpyxl');
  if (/engine\s*=\s*["']xlsxwriter/.test(src) && !ad.includes('xlsxwriter')) ad.push('xlsxwriter');
  return ad;
}
/*/YEREL*/
const boyutYaz = kb => kb >= 1000 ? (kb / 1000).toFixed(1).replace('.', ',') + ' MB' : kb + ' KB';
async function ensureYerel(py, ad) {
  const need = ad.filter(k => !S.pkgs.has('yerel:' + k));
  if (!need.length) return;
  postMessage({ paketBilgi: need.map(k => k + ', yaklaşık ' + boyutYaz(YEREL[k].kb)).join('; ') });
  state('paket');
  const adres = f => new URL('pypaket/' + f, self.location.href).href;
  const dep = [...new Set(need.flatMap(k => YEREL[k].dep))], whl = [...new Set(need.flatMap(k => YEREL[k].whl))];
  try {
    await py.loadPackage(dep.concat(whl.map(adres)));
    const yok = py.runPython('import importlib, importlib.util as _iu\nimportlib.invalidate_caches()\n[m for m in ' + JSON.stringify(need) + ' if _iu.find_spec(m) is None]').toJs();
    need.filter(k => !yok.includes(k)).forEach(k => S.pkgs.add('yerel:' + k));
    if (need.includes('seaborn') && !yok.includes('seaborn')) await mplReady(py);
    if (need.includes('plotly') && !yok.includes('plotly')) await py.runPythonAsync('_pp_plotly_kur()');
  } finally { postMessage({ paketBilgi: '' }); state('hazir'); }
}

async function ensurePkgs(list) {
  if (!list || !list.length) return;
  const py = await boot();
  const yerel = list.filter(p => YEREL[p]);
  if (yerel.length) await ensureYerel(py, yerel);
  const need = list.filter(p => !YEREL[p] && !S.pkgs.has(p));
  if (!need.length) return;
  state('paket');
  try { await py.loadPackage(need); need.forEach(p => S.pkgs.add(p)); if (need.includes('matplotlib')) await mplReady(py); }
  finally { state('hazir'); }
}

async function run(opt) {
  const py = await boot();
  await ensurePkgs(opt.needs);
  const src = String(opt.code || '') + '\n' + String(opt.tests || '');
  await ensureData(py, src);
  try { await ensureYerel(py, yerelGerek(src)); } catch (e) {}
  try {
    if (/\bhashlib\b/.test(src) && !S.pkgs.has('hashlib')) {
      try { await py.loadPackage(['hashlib']); S.pkgs.add('hashlib'); await py.runPythonAsync('import sys\nfor _m in ("hashlib", "_hashlib", "hmac", "secrets"): sys.modules.pop(_m, None)'); } catch (e) {}
    }
    if (/^\s*(import|from)\s/m.test(src)) {
      state('paket');
      await py.loadPackagesFromImports(src);
      if (/matplotlib/.test(src)) await mplReady(py);
      if (/\bpolars\b/.test(src)) {
        if (/parquet|duckdb|to_arrow|to_pandas|pyarrow/.test(src) && !S.pkgs.has('pyarrow')) { try { await py.loadPackage(['pyarrow']); S.pkgs.add('pyarrow'); } catch (e) {} }
        await py.runPythonAsync('_pp_polars_patch()');
      }
    }
  } catch (e) {} finally { state('hazir'); }
  const fn = py.globals.get('_pp_run');
  postMessage({ started: opt.__id });
  let res;
  try {
    const raw = fn(String(opt.code || ''), String(opt.tests || ''), (opt.stdin || []).map(String), '<kodun>', String(opt.ns || ''), opt.raw == null ? null : String(opt.raw), true);
    res = JSON.parse(raw);
  } finally { fn.destroy && fn.destroy(); }
  return res;
}

async function handle(m) {
  if (m.cmd === 'boot') { await boot(); return true; }
  if (m.cmd === 'ensurePkgs') { await ensurePkgs(m.list); return true; }
  if (m.cmd === 'resetNs') { if (S.py) await S.py.runPythonAsync('_PP_NS.pop(' + JSON.stringify(String(m.key)) + ', None)'); return true; }
  if (m.cmd === 'run') return run(Object.assign({ __id: m.id }, m.opt));
  throw new Error('bilinmeyen komut');
}
let queue = Promise.resolve();
self.onmessage = ev => {
  const m = ev.data;
  queue = queue.then(() => handle(m)).then(r => postMessage({ id: m.id, ok: true, res: r }), e => postMessage({ id: m.id, ok: false, msg: String(e && e.message || e) }));
};
