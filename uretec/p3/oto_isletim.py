#!/usr/bin/env python3
"""otomasyon-isletim dersi: betiği işletilebilir bir işe çeviren parçalar."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ortak import C, M, T, Y, pre, kod, yaz

O1 = '''class HttpHata(Exception):
    def __init__(self, kod, tekrar_sonra=None):
        super().__init__(f"HTTP {kod}")
        self.kod, self.tekrar_sonra = kod, tekrar_sonra

GECICI = {408, 429, 500, 502, 503, 504}

def bekleme_suresi(i, taban, ust, rastgele):
    return min(ust, taban * 2 ** i) * (0.5 + rastgele() / 2)

def yeniden_dene(fn, deneme=4, taban=1, ust=30, bekle=lambda s: None, rastgele=lambda: 1.0):
    for i in range(deneme):
        try:
            return fn()
        except (TimeoutError, ConnectionError):
            if i == deneme - 1:
                raise
            bekle(bekleme_suresi(i, taban, ust, rastgele))
        except HttpHata as e:
            if e.kod not in GECICI or i == deneme - 1:
                raise
            if e.tekrar_sonra is not None:
                bekle(min(e.tekrar_sonra, ust))
            else:
                bekle(bekleme_suresi(i, taban, ust, rastgele))
'''
O1BAS = '''class HttpHata(Exception):
    def __init__(self, kod, tekrar_sonra=None):
        super().__init__(f"HTTP {kod}")
        self.kod, self.tekrar_sonra = kod, tekrar_sonra

GECICI = {408, 429, 500, 502, 503, 504}

def bekleme_suresi(i, taban, ust, rastgele):
    pass

def yeniden_dene(fn, deneme=4, taban=1, ust=30, bekle=lambda s: None, rastgele=lambda: 1.0):
    pass
'''
O1T = '''def _F(*olay):
    k = list(olay)
    s = {"n": 0}
    def f():
        s["n"] += 1
        o = k.pop(0)
        if isinstance(o, Exception):
            raise o
        return o
    f.s = s
    return f
_b = []
_f = _F(HttpHata(503), TimeoutError(), "ok")
assert yeniden_dene(_f, bekle=_b.append) == "ok" and _f.s["n"] == 3, "Geçici hatalar tekrarlanır"
assert _b == [1.0, 2.0], "Üstel bekleme: " + repr(_b)
for _kod in [400, 401, 403, 404, 422]:
    _f = _F(HttpHata(_kod), "ok")
    try:
        yeniden_dene(_f)
        raise AssertionError(f"{_kod} tekrarlanmamalı")
    except HttpHata:
        pass
    assert _f.s["n"] == 1, f"{_kod}: tek deneme"
_b = []
_f = _F(HttpHata(429, tekrar_sonra=7), "ok")
yeniden_dene(_f, bekle=_b.append)
assert _b == [7], "Retry-After üstel beklemenin yerine geçer: " + repr(_b)
_b = []
yeniden_dene(_F(HttpHata(429, tekrar_sonra=900), "ok"), ust=60, bekle=_b.append)
assert _b == [60], "Sunucu saatlerce bekle derse üst sınır geçerli"
_b = []
yeniden_dene(_F(TimeoutError(), TimeoutError(), TimeoutError(), "ok"), taban=10, ust=25, bekle=_b.append)
assert _b == [10.0, 20.0, 25.0], "Bekleme üst sınırı: " + repr(_b)
_b = []
yeniden_dene(_F(TimeoutError(), "ok"), bekle=_b.append, rastgele=lambda: 0.0)
assert _b == [0.5], "Rastgele: aynı anda dönen işler yayılsın"
_b = []
_f = _F(*[TimeoutError() for _ in range(9)])
try:
    yeniden_dene(_f, deneme=3, bekle=_b.append)
    raise AssertionError("Denemeler bitince son hata yükselmeli")
except TimeoutError:
    pass
assert _f.s["n"] == 3 and len(_b) == 2, "Üç deneme, iki bekleme"
_f = _F(ValueError("kötü veri"), "ok")
try:
    yeniden_dene(_f)
    raise AssertionError("Programlama hatası tekrarlanmaz")
except ValueError:
    pass
'''
O1Y = [(O1.replace('except (TimeoutError, ConnectionError):', 'except Exception:').replace('''        except HttpHata as e:
            if e.kod not in GECICI or i == deneme - 1:
                raise
            if e.tekrar_sonra is not None:
                bekle(min(e.tekrar_sonra, ust))
            else:
                bekle(bekleme_suresi(i, taban, ust, rastgele))
''', ''), 'her hatayı tekrarlıyor'),
 (O1.replace('''            if e.tekrar_sonra is not None:
                bekle(min(e.tekrar_sonra, ust))
            else:
                bekle(bekleme_suresi(i, taban, ust, rastgele))
''', '''            bekle(bekleme_suresi(i, taban, ust, rastgele))
'''), 'Retry-After görmezden geliyor'),
 (O1.replace('min(e.tekrar_sonra, ust)', 'e.tekrar_sonra'), 'Retry-After sınırsız'),
 (O1.replace('return min(ust, taban * 2 ** i) * (0.5 + rastgele() / 2)', 'return min(ust, taban * 2 ** i)'), 'rastgelelik yok')]
# ---------- 2
O2 = '''import json, os, tempfile

def atomik_yaz(yol, metin):
    klasor = os.path.dirname(os.path.abspath(yol))
    fd, gecici = tempfile.mkstemp(dir=klasor, suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(metin)
            f.flush()
            os.fsync(f.fileno())
        os.replace(gecici, yol)
    except BaseException:
        os.unlink(gecici)
        raise

class KilitDolu(Exception):
    pass

class Kilit:
    def __init__(self, yol, saat, bayat=3600):
        self.yol, self.saat, self.bayat = yol, saat, bayat

    def __enter__(self):
        for _ in range(2):
            try:
                fd = os.open(self.yol, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            except FileExistsError:
                with open(self.yol, encoding="utf-8") as f:
                    t = json.load(f)["t"]
                if self.saat() - t <= self.bayat:
                    raise KilitDolu(self.yol)
                os.unlink(self.yol)
                continue
            with os.fdopen(fd, "w", encoding="utf-8") as f:
                json.dump({"t": self.saat()}, f)
            return self
        raise KilitDolu(self.yol)

    def __exit__(self, *a):
        os.unlink(self.yol)
        return False
'''
O2BAS = '''import json, os, tempfile

def atomik_yaz(yol, metin):
    pass

class KilitDolu(Exception):
    pass

class Kilit:
    def __init__(self, yol, saat, bayat=3600):
        self.yol, self.saat, self.bayat = yol, saat, bayat

    def __enter__(self):
        pass

    def __exit__(self, *a):
        pass
'''
O2T = '''import tempfile as _t, os as _o
_d = _t.mkdtemp(); _y = _d + "/durum.json"
atomik_yaz(_y, "bir")
assert open(_y, encoding="utf-8").read() == "bir", "Yazıldı"
atomik_yaz(_y, "iki")
assert open(_y, encoding="utf-8").read() == "iki" and _o.listdir(_d) == ["durum.json"], "Geçici dosya kalmaz: " + repr(_o.listdir(_d))
_es = _o.replace
_sp = []
def _say(a, b):
    _sp.append((a, b))
    return _es(a, b)
_o.replace = _say
atomik_yaz(_y, "üç")
_o.replace = _es
assert _sp and _sp[0][1] == _y and _o.path.dirname(_sp[0][0]) == _d, "Geçici dosya aynı klasörde olup os.replace ile taşınmalı"
class _Bozuk:
    def __str__(self):
        return "x"
try:
    atomik_yaz(_y, _Bozuk())
    raise AssertionError("Metin olmayan yazılamaz")
except TypeError:
    pass
assert open(_y, encoding="utf-8").read() == "üç" and _o.listdir(_d) == ["durum.json"], "Yarım kalan yazma eski dosyayı bozmaz, çöp bırakmaz"
_s = [100]; _k = _d + "/is.kilit"
with Kilit(_k, lambda: _s[0]):
    assert _o.path.exists(_k), "Kilit dosyası oluşur"
    try:
        with Kilit(_k, lambda: _s[0]):
            raise AssertionError("İkinci çalışma girememeli")
    except KilitDolu:
        pass
    assert _o.path.exists(_k), "Reddedilen çalışma kilidi silmemeli"
assert not _o.path.exists(_k), "Çıkışta kilit kalkar"
try:
    with Kilit(_k, lambda: _s[0]):
        raise RuntimeError("iş patladı")
except RuntimeError:
    pass
assert not _o.path.exists(_k), "Hata olsa da kilit kalkar"
with open(_k, "w", encoding="utf-8") as _f:
    _f.write('{"t": 100}')
_s[0] = 100 + 3601
with Kilit(_k, lambda: _s[0], bayat=3600):
    assert _o.path.exists(_k), "Bayat kilit devralınır (ölmüş süreçten kalmış)"
with open(_k, "w", encoding="utf-8") as _f:
    _f.write('{"t": 100}')
_s[0] = 100 + 3600
try:
    with Kilit(_k, lambda: _s[0], bayat=3600):
        raise AssertionError("Taze kilit devralınmaz")
except KilitDolu:
    pass
'''
O2Y = [(O2.replace('''    fd, gecici = tempfile.mkstemp(dir=klasor, suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(metin)
            f.flush()
            os.fsync(f.fileno())
        os.replace(gecici, yol)
    except BaseException:
        os.unlink(gecici)
        raise
''', '''    with open(yol, "w", encoding="utf-8") as f:
        f.write(metin)
'''), 'doğrudan üstüne yazıyor'),
 (O2.replace('tempfile.mkstemp(dir=klasor, suffix=".tmp")', 'tempfile.mkstemp(suffix=".tmp")'), 'geçici dosya başka klasörde: taşıma atomik olmayabilir'),
 (O2.replace('''    except BaseException:
        os.unlink(gecici)
        raise
''', '''    finally:
        pass
'''), 'hatada çöp dosya bırakıyor'),
 (O2.replace('''                if self.saat() - t <= self.bayat:
                    raise KilitDolu(self.yol)
                os.unlink(self.yol)
                continue
''', '''                raise KilitDolu(self.yol)
'''), 'bayat kilitte sonsuza dek takılıyor'),
 (O2.replace('''                if self.saat() - t <= self.bayat:
                    raise KilitDolu(self.yol)
''', ''), 'her kilidi devralıyor'),
 (O2.replace('''        os.unlink(self.yol)
        return False
''', '''        return False
'''), 'kilidi bırakmıyor')]
# ---------- 3
O3 = '''import tomllib

GIZLI = {"api_anahtari", "smtp_parola"}

def ayar_yukle(varsayilan, toml_metni, ortam, cli, zorunlu=()):
    d = tomllib.loads(toml_metni) if toml_metni else {}
    yasak = sorted(GIZLI & set(d))
    if yasak:
        raise ValueError("gizli değer dosyada olamaz: " + ", ".join(yasak))
    a = {**varsayilan, **d}
    for k, v in ortam.items():
        if not k.startswith("KESIT_"):
            continue
        ad = k[len("KESIT_"):].lower()
        if ad not in a and ad not in GIZLI:
            continue
        ornek = a.get(ad)
        if isinstance(ornek, bool):
            if v.lower() not in ("1", "true", "0", "false"):
                raise ValueError(f"{ad}: mantıksal değer bekleniyor")
            v = v.lower() in ("1", "true")
        elif isinstance(ornek, int):
            v = int(v)
        elif isinstance(ornek, float):
            v = float(v)
        a[ad] = v
    a.update({k: v for k, v in cli.items() if v is not None})
    eksik = [k for k in zorunlu if a.get(k) in (None, "")]
    if eksik:
        raise ValueError("eksik ayar: " + ", ".join(eksik))
    return a

def goster(a):
    return {k: ("***" if k in GIZLI and a[k] else v) for k, v in a.items()}
'''
O3BAS = '''import tomllib

GIZLI = {"api_anahtari", "smtp_parola"}

def ayar_yukle(varsayilan, toml_metni, ortam, cli, zorunlu=()):
    pass

def goster(a):
    pass
'''
O3T = '''_V = {"klasor": "gelen", "deneme": 3, "kuru": False, "oran": 0.5}
_a = ayar_yukle(_V, 'klasor = "dosya"\\ndeneme = 5\\n', {"KESIT_DENEME": "7", "PATH": "/bin"}, {"deneme": None, "kuru": True})
assert _a["klasor"] == "dosya" and _a["deneme"] == 7 and _a["kuru"] is True and _a["oran"] == 0.5, "Sıra: varsayılan < dosya < ortam < komut satırı: " + repr(_a)
assert "path" not in _a, "İlgisiz ortam değişkeni ayara girmez"
assert ayar_yukle(_V, 'deneme = 5', {"KESIT_DENEME": "7"}, {"deneme": 9})["deneme"] == 9, "Komut satırı en üstte"
assert ayar_yukle(_V, 'deneme = 5', {}, {})["deneme"] == 5, "Dosya varsayılanı ezer"
assert ayar_yukle(_V, '', {"KESIT_KURU": "false"}, {})["kuru"] is False, "'false' metni False olmalı"
assert ayar_yukle(_V, '', {"KESIT_KURU": "1"}, {})["kuru"] is True, "1 True"
assert ayar_yukle(_V, '', {"KESIT_ORAN": "0.25"}, {})["oran"] == 0.25, "Ondalık dönüşümü"
_b = ayar_yukle(_V, '', {"KESIT_DENEME": "4"}, {})["deneme"]
assert _b == 4 and isinstance(_b, int), "Ortam metni sayıya dönmeli"
for _bad in ["abc"]:
    try:
        ayar_yukle(_V, '', {"KESIT_DENEME": _bad}, {})
        raise AssertionError("Geçersiz sayı hata vermeli")
    except ValueError:
        pass
try:
    ayar_yukle(_V, '', {"KESIT_KURU": "evet"}, {})
    raise AssertionError("Geçersiz mantıksal hata vermeli")
except ValueError:
    pass
try:
    ayar_yukle(_V, 'api_anahtari = "abc123"', {}, {})
    raise AssertionError("Dosyada gizli değer reddedilmeli")
except ValueError as _e:
    assert "abc123" not in str(_e), "Hata mesajı gizli değeri taşımamalı"
_g = ayar_yukle(_V, '', {"KESIT_API_ANAHTARI": "gizli-1"}, {}, zorunlu=["api_anahtari"])
assert _g["api_anahtari"] == "gizli-1", "Gizli değer ortamdan gelir"
assert goster(_g)["api_anahtari"] == "***" and goster(_g)["deneme"] == 3 and "gizli-1" not in str(goster(_g)), "Gösterimde maskelenir"
try:
    ayar_yukle(_V, '', {}, {}, zorunlu=["api_anahtari"])
    raise AssertionError("Zorunlu ayar eksikse hata")
except ValueError as _e:
    assert "api_anahtari" in str(_e), "Hangi ayar eksik söylenmeli"
'''
O3Y = [(O3.replace('''    yasak = sorted(GIZLI & set(d))
    if yasak:
        raise ValueError("gizli değer dosyada olamaz: " + ", ".join(yasak))
''', ''), 'dosyada gizliye izin veriyor'),
 (O3.replace('v = v.lower() in ("1", "true")', 'v = bool(v)').replace('''            if v.lower() not in ("1", "true", "0", "false"):
                raise ValueError(f"{ad}: mantıksal değer bekleniyor")
''', ''), "bool('false') True olur"),
 (O3.replace('''        elif isinstance(ornek, int):
            v = int(v)
        elif isinstance(ornek, float):
            v = float(v)
''', ''), 'ortam değeri metin kalıyor'),
 (O3.replace('a.update({k: v for k, v in cli.items() if v is not None})', 'a.update(cli)'), 'verilmeyen argüman None ile eziyor'),
 (O3.replace('return {k: ("***" if k in GIZLI and a[k] else v) for k, v in a.items()}', 'return dict(a)'), 'gösterim maskelemiyor')]
# ---------- 4
O4 = '''import json, logging, re

GIZLI_DESEN = re.compile(r"(?i)\\b(token|parola|password|api[_-]?key|authorization)(\\s*[=:]\\s*)(bearer\\s+)?\\S+")

class Maskele(logging.Filter):
    def filter(self, kayit):
        kayit.msg = GIZLI_DESEN.sub(lambda m: m.group(1) + m.group(2) + "***", kayit.getMessage())
        kayit.args = ()
        return True

class JsonBicim(logging.Formatter):
    def __init__(self, kosu):
        super().__init__()
        self.kosu = kosu

    def format(self, kayit):
        d = {"kosu": self.kosu, "seviye": kayit.levelname, "mesaj": kayit.getMessage()}
        if kayit.exc_info:
            d["hata"] = kayit.exc_info[0].__name__
        return json.dumps(d, ensure_ascii=False)

def gunluk_kur(ad, akis, kosu):
    g = logging.getLogger(ad)
    g.handlers.clear()
    g.setLevel(logging.INFO)
    g.propagate = False
    h = logging.StreamHandler(akis)
    h.setFormatter(JsonBicim(kosu))
    h.addFilter(Maskele())
    g.addHandler(h)
    return g
'''
O4BAS = '''import json, logging, re

class Maskele(logging.Filter):
    def filter(self, kayit):
        pass

class JsonBicim(logging.Formatter):
    def __init__(self, kosu):
        super().__init__()
        self.kosu = kosu

    def format(self, kayit):
        pass

def gunluk_kur(ad, akis, kosu):
    pass
'''
O4T = '''import io, json as _j
_a = io.StringIO()
_g = gunluk_kur("t1", _a, "k-7")
_g.info("başladı %d dosya", 3)
_g.warning("istek token=abc123 ile gitti")
_g.info("Authorization: Bearer xyz.789 başlığı")
_g.info("parola: %s", "gizli9")
_g.debug("görünmez")
try:
    1 / 0
except ZeroDivisionError:
    _g.exception("bölme")
_s = [_j.loads(x) for x in _a.getvalue().splitlines()]
assert len(_s) == 5, "Her kayıt tek JSON satırı, DEBUG yok: " + repr(_a.getvalue())
assert _s[0] == {"kosu": "k-7", "seviye": "INFO", "mesaj": "başladı 3 dosya"}, repr(_s[0])
_m = _a.getvalue()
for _x in ["abc123", "xyz.789", "gizli9"]:
    assert _x not in _m, "Gizli değer günlükte: " + _x
assert "token=***" in _s[1]["mesaj"], "Maske: " + _s[1]["mesaj"]
assert _s[1]["seviye"] == "WARNING", "Seviye"
assert "başlığı" in _s[2]["mesaj"], "Gizli olmayan kısım kalır"
assert _s[4]["hata"] == "ZeroDivisionError", "Hata türü kayıtta"
_g2 = gunluk_kur("t1", _a, "k-8")
_n = len(_a.getvalue().splitlines())
_g2.info("tek")
assert len(_a.getvalue().splitlines()) == _n + 1, "İkinci kurulum çift yazmamalı"
_g.info("metin token gizli değil")
assert "token gizli değil" in _a.getvalue(), "'token' kelimesi tek başına maskelenmez"
'''
O4Y = [(O4.replace('kayit.getMessage())\n        kayit.args = ()', 'str(kayit.msg))'), 'argümanla gelen gizliyi kaçırıyor'),
 (O4.replace('    g.handlers.clear()\n', ''), 'ikinci kurulum çift yazıyor'),
 (O4.replace('(bearer\\s+)?', ''), 'Bearer değerini kaçırıyor'),
 (O4.replace('''        if kayit.exc_info:
            d["hata"] = kayit.exc_info[0].__name__
''', ''), 'hata türü yok')]
# ---------- 5
O5 = '''from urllib.robotparser import RobotFileParser
from urllib.parse import urlsplit

class KibarIstemci:
    def __init__(self, ajan, robots, getir, saat, bekle, aralik=2.0):
        self.ajan, self.getir, self.saat, self.bekle = ajan, getir, saat, bekle
        self.aralik, self.son, self.onbellek = aralik, {}, {}
        self.kurallar = {}
        for alan, metin in robots.items():
            r = RobotFileParser()
            r.parse(metin.splitlines())
            self.kurallar[alan] = r

    def al(self, adres):
        if adres in self.onbellek:
            return self.onbellek[adres]
        alan = urlsplit(adres).netloc
        r = self.kurallar.get(alan)
        if r is None or not r.can_fetch(self.ajan, adres):
            return None
        gecikme = max(self.aralik, r.crawl_delay(self.ajan) or 0)
        if alan in self.son:
            kalan = self.son[alan] + gecikme - self.saat()
            if kalan > 0:
                self.bekle(kalan)
        sonuc = self.getir(adres, {"User-Agent": self.ajan})
        self.son[alan] = self.saat()
        self.onbellek[adres] = sonuc
        return sonuc
'''
O5BAS = '''from urllib.robotparser import RobotFileParser
from urllib.parse import urlsplit

class KibarIstemci:
    def __init__(self, ajan, robots, getir, saat, bekle, aralik=2.0):
        pass

    def al(self, adres):
        pass  # sayfa metni; izin yoksa None
'''
O5T = '''_R = {"a.test": "User-agent: *\\nDisallow: /ozel/\\nCrawl-delay: 5\\n", "b.test": "User-agent: *\\nAllow: /\\n", "c.test": "User-agent: kesit\\nDisallow: /\\n\\nUser-agent: *\\nAllow: /\\n"}
_t = [0.0]; _bek = []; _ist = []
def _ge(u, h):
    _ist.append((u, h["User-Agent"]))
    return "içerik:" + u
def _be(s):
    _bek.append(s)
    _t[0] += s
_k = KibarIstemci("kesit", _R, _ge, lambda: _t[0], _be, aralik=2.0)
assert _k.al("https://a.test/liste") == "içerik:https://a.test/liste", "İzinli sayfa"
assert _ist[0][1] == "kesit", "Kimliğini söyle: User-Agent"
assert _k.al("https://a.test/ozel/x") is None and len(_ist) == 1, "robots.txt yasağına uyulur, istek gitmez"
assert _k.al("https://c.test/x") is None, "Bu ajana özel yasak"
assert _k.al("https://yok.test/") is None, "robots.txt bilinmiyorsa gitme"
_k.al("https://a.test/iki")
assert _bek == [5.0], "Crawl-delay daha uzunsa o beklenir: " + repr(_bek)
assert _k.al("https://b.test/1") and _bek == [5.0], "Başka site beklemez"
_k.al("https://b.test/2")
assert _bek == [5.0, 2.0], "En az aralık: " + repr(_bek)
_n = len(_ist)
_k.al("https://b.test/2")
assert len(_ist) == _n and _bek == [5.0, 2.0], "Aynı adres önbellekten, istek ve bekleme yok"
_t[0] += 100
_k.al("https://b.test/3")
assert _bek == [5.0, 2.0], "Yeterince zaman geçtiyse bekleme yok"
'''
O5Y = [(O5.replace('''        if r is None or not r.can_fetch(self.ajan, adres):
            return None
''', '''        if r is None:
            return self.getir(adres, {"User-Agent": self.ajan})
'''), 'robots.txt yok sayılıyor'),
 (O5.replace('max(self.aralik, r.crawl_delay(self.ajan) or 0)', 'self.aralik'), 'Crawl-delay yok sayılıyor'),
 (O5.replace('''        if adres in self.onbellek:
            return self.onbellek[adres]
''', ''), 'önbellek yok'),
 (O5.replace('alan = urlsplit(adres).netloc', 'alan = urlsplit(adres).netloc\n        self.son = {alan: self.son.get(alan)} if alan in self.son else {}'), 'siteler arası durum siliniyor') ]
O5Y = O5Y[:3]
# ---------- 6
O6 = '''import json

def parti_isle(kayitlar, isle, karantina_yolu, hata_orani=0.5, en_az=4):
    ok, bad, durdu = 0, 0, False
    for i, k in enumerate(kayitlar):
        try:
            isle(k)
            ok += 1
        except Exception as e:
            bad += 1
            with open(karantina_yolu, "a", encoding="utf-8") as f:
                f.write(json.dumps({"kayit": k, "hata": type(e).__name__, "mesaj": str(e)}, ensure_ascii=False) + "\\n")
            if ok + bad >= en_az and bad / (ok + bad) > hata_orani:
                durdu = True
                break
    kod = 2 if durdu else (1 if bad else 0)
    return {"basarili": ok, "hatali": bad, "islenmeyen": len(kayitlar) - ok - bad, "cikis": kod}
'''
O6BAS = '''import json

def parti_isle(kayitlar, isle, karantina_yolu, hata_orani=0.5, en_az=4):
    # {"basarili", "hatali", "islenmeyen", "cikis"}: 0 temiz, 1 bazı kayıtlar hatalı, 2 durduruldu
    pass
'''
O6T = '''import tempfile, os, json as _j
_d = tempfile.mkdtemp(); _y = _d + "/k.jsonl"
_c = []
def _is(k):
    if k < 0:
        raise ValueError("negatif tutar")
    _c.append(k)
assert parti_isle([1, 2, 3], _is, _y) == {"basarili": 3, "hatali": 0, "islenmeyen": 0, "cikis": 0}, "Temiz parti"
assert not os.path.exists(_y) or not open(_y).read(), "Hatasız partide karantina boş"
_c.clear()
_r = parti_isle([1, -2, 3, 4, 5], _is, _y)
assert _r == {"basarili": 4, "hatali": 1, "islenmeyen": 0, "cikis": 1} and _c == [1, 3, 4, 5], "Tek kötü kayıt işi durdurmaz: " + repr(_r)
_s = [_j.loads(x) for x in open(_y, encoding="utf-8").read().splitlines()]
assert _s == [{"kayit": -2, "hata": "ValueError", "mesaj": "negatif tutar"}], "Karantina kaydı: " + repr(_s)
_c.clear()
_r = parti_isle([-1, -2, -3, -4, 5, 6, 7, 8], _is, _d + "/k2.jsonl")
assert _r["cikis"] == 2 and _r["hatali"] == 4 and _r["islenmeyen"] == 4 and _c == [], "Hata oranı aşınca durur: kaynak bozuk olabilir: " + repr(_r)
_c.clear()
_r = parti_isle([-1, 2, 3, 4], _is, _d + "/k3.jsonl")
assert _r["cikis"] == 1, "İlk kayıt kötü diye hemen durma: en az sayı var: " + repr(_r)
_r = parti_isle([-1, -2, -3, 4], _is, _d + "/k4.jsonl", en_az=10)
assert _r["cikis"] == 1 and _r["islenmeyen"] == 0, "en_az dolmadan durmaz"
parti_isle([-9], _is, _y)
assert len(open(_y, encoding="utf-8").read().splitlines()) == 2, "Karantina önceki kayıtları korur"
'''
O6Y = [(O6.replace('''            if ok + bad >= en_az and bad / (ok + bad) > hata_orani:
                durdu = True
                break
''', ''), 'sınırsız devam ediyor'),
 (O6.replace('''            bad += 1
            with open(karantina_yolu, "a", encoding="utf-8") as f:
                f.write(json.dumps({"kayit": k, "hata": type(e).__name__, "mesaj": str(e)}, ensure_ascii=False) + "\\n")
''', '''            bad += 1
'''), 'hatalı kaydı atıyor'),
 (O6.replace('if ok + bad >= en_az and bad', 'if bad'), 'en az sayı yok: ilk hatada durur'),
 (O6.replace('open(karantina_yolu, "a"', 'open(karantina_yolu, "w"'), 'karantinanın üstüne yazıyor')]
# ---------- 7
O7 = '''from datetime import date, timedelta

def kacan_gunler(son_basarili, bugun, tatiller=(), en_cok=31):
    tatiller = set(tatiller)
    g = son_basarili + timedelta(days=1)
    cikti = []
    while g <= bugun:
        if g.weekday() < 5 and g not in tatiller:
            cikti.append(g)
        g += timedelta(days=1)
    if len(cikti) > en_cok:
        raise ValueError(f"{len(cikti)} gün kaçmış, elle bakılmalı")
    return cikti
'''
O7BAS = '''from datetime import date, timedelta

def kacan_gunler(son_basarili, bugun, tatiller=(), en_cok=31):
    pass
'''
O7T = '''_D = date
assert kacan_gunler(_D(2026, 11, 3), _D(2026, 11, 3)) == [], "Bugün çalıştıysa kaçan yok"
assert kacan_gunler(_D(2026, 11, 2), _D(2026, 11, 3)) == [_D(2026, 11, 3)], "Dünkü başarılı, bugün çalışır"
_r = kacan_gunler(_D(2026, 11, 5), _D(2026, 11, 10))
assert _r == [_D(2026, 11, 6), _D(2026, 11, 9), _D(2026, 11, 10)], "Hafta sonu atlanır: " + repr(_r)
_r = kacan_gunler(_D(2026, 11, 5), _D(2026, 11, 10), tatiller=[_D(2026, 11, 9)])
assert _r == [_D(2026, 11, 6), _D(2026, 11, 10)], "Tatil atlanır"
_r = kacan_gunler(_D(2026, 10, 30), _D(2026, 11, 2))
assert _r == [_D(2026, 11, 2)], "Ay geçişi"
assert kacan_gunler(_D(2026, 11, 7), _D(2026, 11, 8)) == [], "Yalnız hafta sonu"
assert kacan_gunler(_D(2026, 11, 10), _D(2026, 11, 3)) == [], "Saat geride olsa da boş"
try:
    kacan_gunler(_D(2020, 1, 1), _D(2026, 11, 3))
    raise AssertionError("Çok fazla gün kaçtıysa kendi kendine çalışma")
except ValueError:
    pass
assert len(kacan_gunler(_D(2020, 1, 1), _D(2026, 11, 3), en_cok=9999)) > 1000, "Sınır ayarlanabilir"
'''
O7Y = [('''from datetime import date, timedelta
def kacan_gunler(son_basarili, bugun, tatiller=(), en_cok=31):
    return [bugun] if son_basarili < bugun else []
''', 'yalnız bugünü çalıştırıyor'),
 (O7.replace('g.weekday() < 5 and ', ''), 'hafta sonunu çalıştırıyor'),
 (O7.replace('''    if len(cikti) > en_cok:
        raise ValueError(f"{len(cikti)} gün kaçmış, elle bakılmalı")
''', ''), 'üst sınır yok'),
 (O7.replace('g <= bugun', 'g < bugun'), 'bugünü dışarıda bırakıyor')]
PY = '''[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"

[project]
name = "kesit-rapor"
version = "0.1.0"
requires-python = ">=3.11"

[project.scripts]
kesit-rapor = "kesit_rapor:ana"

[tool.setuptools]
py-modules = ["kesit_rapor"]
'''
YT = '''import json
from kesit_rapor import ana, calis

def test_ilk_calisma_rapor_yazar(tmp_path):
    assert calis(tmp_path, "2026-11-03") == {"durum": "yazildi"}
    assert json.loads((tmp_path / "2026-11-03.json").read_text("utf-8"))["gun"] == "2026-11-03"

def test_ikinci_calisma_atlar(tmp_path):
    calis(tmp_path, "2026-11-03")
    assert calis(tmp_path, "2026-11-03") == {"durum": "atlandi"}

def test_cikis_kodu(tmp_path, capsys):
    assert ana(["--klasor", str(tmp_path), "--gun", "2026-11-03"]) == 0
    assert "yazildi" in capsys.readouterr().out
    assert ana(["--klasor", str(tmp_path / "yok"), "--gun", "bozuk"]) == 2
'''
YA = '''"""kesit_rapor.py: paketlenebilir küçük bir iş. Zamanlayıcı yalnız çıkış koduna bakar."""
import argparse, json, logging, os, sys, tempfile
from datetime import date
from pathlib import Path

log = logging.getLogger("kesit_rapor")

def calis(klasor, gun):
    date.fromisoformat(gun)
    y = Path(klasor) / f"{gun}.json"
    if y.exists():
        return {"durum": "atlandi"}
    Path(klasor).mkdir(parents=True, exist_ok=True)
    fd, g = tempfile.mkstemp(dir=klasor)
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        json.dump({"gun": gun}, f)
    os.replace(g, y)
    return {"durum": "yazildi"}

def ana(argv=None):
    ap = argparse.ArgumentParser(prog="kesit-rapor")
    ap.add_argument("--klasor", default=os.environ.get("KESIT_KLASOR", "raporlar"))
    ap.add_argument("--gun", default=date.today().isoformat())
    a = ap.parse_args(argv)
    logging.basicConfig(level=logging.INFO, stream=sys.stderr)
    try:
        s = calis(a.klasor, a.gun)
    except ValueError as e:
        log.error("geçersiz girdi: %s", e)
        return 2
    print(s["durum"])
    return 0

if __name__ == "__main__":
    sys.exit(ana())
'''
import json as _json
if os.environ.get('P3_PAKET'):
    _json.dump({'pyproject.toml': PY, 'test_kesit_rapor.py': YT, 'kesit_rapor.py': YA}, open(os.environ['P3_PAKET'], 'w'))
ORNEK = '''# Aynı iş, iki yazım. Çalışan betik ile işletilebilen iş arasındaki fark tablodaki sorulardır.
import json, os, tempfile

def rapor_kirilgan(klasor, veri):
    with open(os.path.join(klasor, "rapor.json"), "w") as f:     # yarıda kesilirse bozuk dosya
        f.write(json.dumps(veri))

def rapor_saglam(klasor, veri):
    yol = os.path.join(klasor, "rapor.json")
    fd, gecici = tempfile.mkstemp(dir=klasor)
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        f.write(json.dumps(veri, ensure_ascii=False))
    os.replace(gecici, yol)                                      # ya eski dosya ya yeni dosya, arası yok

d = tempfile.mkdtemp()
rapor_saglam(d, {"toplam": 42})
print(os.listdir(d), open(os.path.join(d, "rapor.json")).read())
'''
ders = dict(id='otomasyon-isletim', lv='ileri', mod='Otomasyon, web ve araçlar', min=70, needs=[],
 title='Otomasyonu işletmek: hata, tekrar, kilit, günlük',
 sum='Çalışan betiği gece kimse bakmadan çalışan işe çevirirsin: geçici hatayı tekrarlama, atomik yazma, kilit, katmanlı ayar ve gizli değer, maskeli JSON günlük, robots.txt ve hız sınırı, karantina, kaçan gün hesabı, paketleme ve test.',
 goals=['Geçici ve kalıcı hatayı ayırıp güvenle yeniden deneyebilirim.', 'Yarım dosya bırakmayan yazma ve çift çalışmayı önleyen kilit kurabilirim.', 'Ayarları katmanlı okuyup gizli değeri dosyadan ve günlükten uzak tutabilirim.', 'Web verisi çekerken robots.txt ve hız sınırına uyabilirim.', 'Kötü kaydı karantinaya alıp işi sürdürebilir, ne zaman duracağını bilirim.', 'İşi paketleyip pytest ile sınayabilir, zamanlayıcıya verebilirim.'],
 body=f'''<h2>Betik ile iş arasındaki fark</h2>
<p>Dosya, Excel, PDF, e-posta ve web işlerinin nasıl yapıldığını <b>ofis-otomasyon</b>, <b>pdf-word-otomasyon</b>, <b>excel-otomasyon</b> ve <b>web-scraping</b> derslerinde gördün. Bu ders işin görünmeyen yarısını anlatır: kimse başında değilken ne olur?</p>
<div class="tbl-wrap"><table><tr><th>Soru</th><th>Parça</th></tr><tr><td>Ağ gidip geldi</td><td>Yeniden deneme: yalnız geçici hata</td></tr><tr><td>Elektrik kesildi, dosya yarım kaldı</td><td>Atomik yazma</td></tr><tr><td>Dünkü iş bitmeden bugünkü başladı</td><td>Kilit</td></tr><tr><td>İki kez çalıştı</td><td>İdempotent tasarım: işlenmiş kaydı dosyada tut</td></tr><tr><td>Sunucu değişti, parola değişti</td><td>Katmanlı ayar, gizli değer ortamda</td></tr><tr><td>Gece 3'te patladı, neden?</td><td>JSON günlük, koşu numarası, maskeleme</td></tr><tr><td>1000 satırın 3'ü bozuk</td><td>Karantina ve hata oranı</td></tr><tr><td>Bilgisayar 4 gün kapalıydı</td><td>Kaçan gün hesabı</td></tr><tr><td>Başka makinede nasıl çalışacak?</td><td>Paket, test, zamanlayıcı</td></tr></table></div>
{pre(ORNEK)}
<h2>Yeniden deneme</h2>
<p>Yalnız düzelebilecek hatayı tekrarla: zaman aşımı, bağlantı kopması, 429, 5xx. 400, 401, 404 tekrarla düzelmez, sunucuyu yorarsın. Bekleme üstel artar, üst sınırı olur, biraz rastgelelik eklenir ki aynı anda düşen işler aynı anda dönmesin. Sunucu <code>Retry-After</code> gönderdiyse ona uy. Yan etkili işlemlerde (para, e-posta) önce idempotent yap, sonra tekrarla.</p>
<h2>Atomik yazma ve kilit</h2>
<p><code>os.replace</code> aynı dosya sisteminde atomiktir: okuyan ya eski dosyayı ya yeniyi görür. Geçici dosya bu yüzden hedefle <b>aynı klasörde</b> açılır. Kilit için <code>O_CREAT | O_EXCL</code> kullanılır: dosyayı oluşturma ve var mı bakma tek adımdır, "önce bak sonra oluştur" iki sürecin de geçmesine izin verir. Süreç ölürse kilit kalır; bu yüzden zaman damgası tutulur ve bayat kilit devralınır. Bu kilit paylaşımlı ağ sürücüsünde güvenilir olmayabilir, tek makine için düşün.</p>
<h2>Ayar ve gizli değer</h2>
<p>Sıra: varsayılan, dosya, ortam değişkeni, komut satırı. Sonraki öncekini ezer. Ortamdan gelen değer hep metindir: <code>bool("false")</code> <code>True</code> verir, dönüştürmeyi kendin yap. Parola ve anahtar dosyaya, koda ve Git'e girmez, ortam değişkeni ya da kurumun gizli değer kasasından gelir. Dosyada bulursan çalışmayı reddet.</p>
<h2>Günlük</h2>
<p>Satır başına bir JSON, her satırda koşu numarası. Böylece <code>grep</code> ve pandas ile okunur. Maskeleme filtrede yapılır, çağıran kişinin hatırlamasına bırakılmaz. Maskelemeyi biçimlenmiş mesajda yap: gizli değer <code>%s</code> argümanı olarak da gelebilir. Bu desen her sızıntıyı yakalamaz; en iyisi gizli değeri günlüğe hiç vermemektir.</p>
<h2>Web veri çekmede etik ve sınırlar</h2>
<ul><li><b>Önce API.</b> Sitenin resmî API'si ya da dışa aktarma özelliği varsa onu kullan.</li><li><b>Kullanım koşulları.</b> Sitenin şartlarını oku. <code>robots.txt</code> erişim kuralını bildirir, ama izin veya hukuk belgesi değildir: yasaklıyorsa uy, izin veriyor diye her şey serbest olmaz.</li><li><b>Kişisel veri.</b> Herkese açık olması serbestçe toplanabileceği anlamına gelmez; KVKK gibi düzenlemeler geçerlidir. Şüphede hukuk birimine sor. Bu ders hukuki danışmanlık değildir.</li><li><b>Yük.</b> Kimliğini <code>User-Agent</code> ile söyle, aralık bırak, aynı sayfayı önbellekten oku.</li><li><b>Kimlik doğrulaması ve engel.</b> Girişle korunan alanı ya da CAPTCHA'yı aşmaya çalışma.</li></ul>
<h2>Kötü kayıt: durmak mı, devam mı?</h2>
<p>Tek bozuk satır bütün işi durdurmamalı, ama sessizce de atılmamalı: <b>karantina</b> dosyasına nedenle yazılır. Hata oranı çok yükselince devam etmek de yanlıştır, kaynak bozuk olabilir. Çıkış kodu zamanlayıcıya durumu söyler: 0 temiz, 1 kısmi, 2 durdu.</p>
<h2>Zamanlama</h2>
<p>Zamanlayıcı (cron, Windows Görev Zamanlayıcı) işi başlatır, sonucu umursamaz; kaçırılan çalışmayı da telafi etmez. Bu yüzden son başarılı günü dosyada tut, kaçan iş günlerini hesapla, çok fazlaysa kendi başına çalışma, insana sor. Tarih ve saat için tek bir saat dilimi seç.</p>''',
 ex=[
 M('otomasyon-isletim-m1', 'API 401 döndü. İş ne yapmalı?', ['Durup anahtarı bildirmeli', 'Üstel bekleyip tekrarlamalı', 'Yeni anahtar uydurmalı', 'Sonucu boş kabul etmeli'], 0, '401 tekrarla düzelmez, kimlik sorunudur.'),
 M('otomasyon-isletim-m2', 'Geçici dosya neden hedefle aynı klasörde açılır?', ['Daha az yer kaplasın', 'Dosya adı kısa olsun', 'Taşıma atomik olsun', 'İzin istemesin diye'], 2, 'Farklı dosya sistemleri arasında os.replace atomik olmaz, hata da verebilir.'),
 M('otomasyon-isletim-m3', 'robots.txt bir sayfaya izin veriyor. Ne anlama gelir?', ['Veri her amaçla kullanılabilir', 'Kişisel veri toplanabilir', 'Kullanım koşullarına bakılmaz', 'Yalnız erişim kuralı geçer'], 3, 'robots.txt hukuki izin değildir; şartlar ve kişisel veri mevzuatı ayrıca geçerlidir.'),
 M('otomasyon-isletim-m4', '1000 satırın 600\'ü hatalı geliyor. Doğrusu hangisi?', ['Hepsini karantinaya yazıp bitir', 'İşi durdur, kaynağa bak', 'Hatalıları sessizce at', 'Satırları tahminle düzelt'], 1, 'Bu oran kaynağın bozulduğunu gösterir. Eşik aşılınca durmak doğrudur.'),
 T('otomasyon-isletim-t1', 'Ne yazdırır?', '''import os
ayar = {"kuru": False}
ortam = {"KURU": "false"}
ayar["kuru"] = bool(ortam["KURU"])
print(ayar["kuru"], ortam["KURU"].lower() in ("1", "true"))''', ['False False', 'True False', 'True True', 'False True'], 1, 'Boş olmayan her metin bool ile True olur. Bu yüzden elle dönüştürülür.'),
 C('otomasyon-isletim-1', 'Rehberli', '<b>Yeniden deneme.</b> <code>bekleme_suresi(i, taban, ust, rastgele)</code>: <code>min(ust, taban * 2**i) * (0.5 + rastgele() / 2)</code>. <code>yeniden_dene(fn, deneme=4, taban=1, ust=30, bekle=..., rastgele=...)</code>: <code>TimeoutError</code>, <code>ConnectionError</code> ve <code>GECICI</code> kodlu <code>HttpHata</code> tekrarlanır; denemeler bitince son hata yükselir, son denemeden sonra beklenmez. <code>tekrar_sonra</code> varsa üst sınırla birlikte o beklenir. Başka her hata hemen yükselir.', O1BAS, O1, O1T, ['bekle ve rastgele dışarıdan gelir, test zaman harcamaz.', 'Python\'da sırayla except yaz.'], 'Her hatayı tekrarlamak kötü veriyi dört kez işler, sunucuyu da yorar.', yanlis=O1Y, diff=2),
 C('otomasyon-isletim-2', 'Kendin yaz', '<b>Atomik yazma ve kilit.</b> <code>atomik_yaz(yol, metin)</code>: aynı klasörde geçici dosya, <code>os.replace</code>; hata olursa geçici dosya silinir, eski dosya bozulmaz. <code>Kilit(yol, saat, bayat=3600)</code>: bağlam yöneticisi. <code>O_CREAT | O_EXCL</code> ile oluşturup <code>{"t": saat()}</code> yazar. Kilit varsa ve taze ise <code>KilitDolu</code>; yaşı <code>bayat</code>ı aşmışsa siler, yeniden dener. Çıkışta, hata olsa da kaldırır.', O2BAS, O2, O2T, ['tempfile.mkstemp(dir=klasor)', 'os.open ile O_EXCL; FileExistsError yakala.', '__exit__ False döndürsün, hata yutulmasın.'], '"Önce var mı diye bak" iki sürecin birden geçmesine izin verir. O_EXCL tek adımdır.', yanlis=O2Y, diff=3),
 C('otomasyon-isletim-3', 'Kendin yaz', '<b>Katmanlı ayar.</b> <code>ayar_yukle(varsayilan, toml_metni, ortam, cli, zorunlu=())</code>. Sıra: varsayılan, TOML, <code>KESIT_</code> ile başlayan ortam değişkenleri (küçük harfe çevrilir, yalnız bilinen ayar ve <code>GIZLI</code> adlar), <code>None</code> olmayan <code>cli</code>. Ortam değeri varsayılanın türüne çevrilir: <code>bool</code> yalnız <code>1, true, 0, false</code>; geçersizse <code>ValueError</code>. TOML içinde gizli alan varsa değeri söylemeden <code>ValueError</code>. Zorunlu eksikse adını söyleyen <code>ValueError</code>. <code>goster(a)</code> gizlileri <code>***</code> yapar.', O3BAS, O3, O3T, ['tomllib.loads', 'isinstance(ornek, bool) int\'ten önce gelmeli.'], 'bool("false") True verir: ortam değişkeninin en bilinen tuzağı.', yanlis=O3Y, diff=2),
 C('otomasyon-isletim-4', 'Hata avı', '<b>Maskeli JSON günlük.</b> <code>gunluk_kur(ad, akis, kosu)</code> <code>logging</code> kaydedicisi döndürür: <code>INFO</code> seviye, üst kaydediciye geçmez, ikinci kurulum çift yazmaz. <code>JsonBicim</code> satıra <code>kosu, seviye, mesaj</code> ve hata varsa <code>hata</code> (tür adı) yazar. <code>Maskele</code> filtresi biçimlenmiş mesajda <code>token, parola, password, api_key, authorization</code> sonrası <code>=</code> ya da <code>:</code> ile gelen değeri <code>***</code> yapar (<code>Bearer</code> dahil). Yalnız "token" kelimesi maskelenmez.', O4BAS, O4, O4T, ['kayit.getMessage() biçimlenmiş metni verir, sonra kayit.args = ().', 'g.handlers.clear() ve g.propagate = False.'], 'Gizli değer %s argümanı olarak da gelir. Ham kalıba bakan filtre bunu kaçırır.', yanlis=O4Y, diff=2),
 C('otomasyon-isletim-5', 'Kendin yaz', '<b>Kibar istemci.</b> <code>KibarIstemci(ajan, robots, getir, saat, bekle, aralik=2.0)</code>: <code>robots</code> alan adından <code>robots.txt</code> metnine sözlük. <code>al(adres)</code>: önbellekteyse hemen döner. robots.txt bilinmiyorsa ya da yasaklıyorsa <code>None</code>, istek gitmez. Aynı alan adında son istekten beri <code>max(aralik, Crawl-delay)</code> geçmediyse kalan süre beklenir. <code>getir(adres, {"User-Agent": ajan})</code>.', O5BAS, O5, O5T, ['RobotFileParser().parse(metin.splitlines())', 'r.can_fetch ve r.crawl_delay', 'urlsplit(adres).netloc'], 'Bilinmeyen robots.txt için izinli saymak en sık yapılan kolaycılıktır. Burada güvenli taraf seçildi.', yanlis=O5Y, diff=2),
 C('otomasyon-isletim-6', 'Hata avı', '<b>Karantina.</b> <code>parti_isle(kayitlar, isle, karantina_yolu, hata_orani=0.5, en_az=4)</code>. İstisna veren kayıt <code>{"kayit", "hata", "mesaj"}</code> olarak ekleme kipinde yazılır, iş sürer. En az <code>en_az</code> kayıt işlenmişken hata oranı <code>hata_orani</code>nı aşarsa durur. Dönüş: <code>{"basarili", "hatali", "islenmeyen", "cikis"}</code>, çıkış 0 temiz, 1 kısmi, 2 durdu.', O6BAS, O6, O6T, ['Oranı her hatada hesapla.', 'type(e).__name__'], 'Tek bozuk satır işi durdurmaz; bozuk kaynak da sona kadar işlenmez.', yanlis=O6Y, diff=2),
 C('otomasyon-isletim-7', 'Kendin yaz', '<b>Kaçan iş günleri.</b> <code>kacan_gunler(son_basarili, bugun, tatiller=(), en_cok=31)</code>: <code>son_basarili</code>dan sonraki günden <code>bugun</code>e kadar (dahil) hafta içi ve tatil olmayan günlerin listesi. <code>en_cok</code>tan fazlaysa <code>ValueError</code>.', O7BAS, O7, O7T, ['weekday() &lt; 5 hafta içidir.', 'timedelta(days=1) ile ilerle.'], 'Dört gün kapalı kalan bilgisayarda yalnız bugünü çalıştırmak üç raporu kaybeder.', yanlis=O7Y, diff=1),
 Y('otomasyon-isletim-y1', 'İşi paketle, sına, zamanlayıcıya ver. Paketleme ve testler burada çalıştırıldı: <code>pip install -e .</code>, <code>kesit-rapor</code> komutu ve üç pytest testi geçti. cron ve Görev Zamanlayıcı satırları burada çalıştırılmadı.', ['Boş klasörde sanal ortam aç. Aşağıdaki kodu <code>kesit_rapor.py</code> olarak kaydet.', '<code>pyproject.toml</code> dosyası:<pre class="code">' + PY + '</pre>', '<code>test_kesit_rapor.py</code> dosyası:<pre class="code">' + YT + '</pre>', '<code>python -m pip install -e . pytest</code>, sonra <code>python -m pytest -q</code> ve <code>kesit-rapor --gun 2026-11-03</code>. İkinci çalıştırmada <code>atlandi</code> yazar. <code>echo $?</code> çıkış kodunu gösterir.', 'Linux ve macOS cron: <code>30 7 * * 1-5 cd /yol && .venv/bin/kesit-rapor &gt;&gt; is.log 2&gt;&amp;1</code>.', 'Windows: <code>schtasks /Create /SC WEEKLY /D MON,TUE,WED,THU,FRI /ST 07:30 /TN KesitRapor /TR "C:\\yol\\.venv\\Scripts\\kesit-rapor.exe"</code>.', 'Zamanlayıcı ortam değişkenlerini kabuktan almaz: gerekli ayarları açıkça ver.'], file=YA, fname='kesit_rapor.py', cmd='python -m pytest -q && kesit-rapor --gun 2026-11-03', expect='3 passed\nyazildi'),
 ],
 faq=[dict(q='Bunların hepsi küçük bir betik için fazla değil mi?', a='Elle başlatıp başında durduğun betik için fazla. Zamanlanmış ve parayla, müşteriyle ilgili işler için değil. Önce atomik yazma ve idempotent tasarımı ekle, gerisini ihtiyaç olunca.'), dict(q='tenacity gibi hazır kütüphane kullanayım mı?', a='Kullanabilirsin, olgun bir araçtır. Burada amaç neyi tekrarlaman gerektiğini anlamak; o kararı yine sen verirsin.'), dict(q='Web verisi çekmek yasal mı?', a='Tek cevabı yok: siteye, verinin türüne, kullanım amacına ve ülkeye bağlıdır. Bu ders hukuki danışmanlık değildir. Kişisel veri ya da ticari kullanım varsa hukuk birimine sor.')],
 mistakes=[dict(bad='if not os.path.exists(kilit):\n    open(kilit, "w")', good='os.open(kilit, os.O_CREAT | os.O_EXCL | os.O_WRONLY)', why='Bakmak ve oluşturmak ayrı adımsa iki süreç de geçer.'), dict(bad='except Exception:\n    time.sleep(5)\n    continue', good='except (TimeoutError, ConnectionError):', why='Programlama hatasını sonsuza dek tekrarlar.'), dict(bad='log.info("giriş " + parola)', good='log.info("giriş denendi: %s", kullanici)', why='Filtre yardımcıdır, gizli değeri günlüğe hiç vermemek esastır.')])
yaz('otomasyon-isletim', 'Otomasyonu işletmek', ders)
