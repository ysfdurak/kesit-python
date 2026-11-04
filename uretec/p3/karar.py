#!/usr/bin/env python3
"""karar-mimarisi dersi. 'Karar odaklı yapay zekâ mimarisi' yerleşik bir standart değildir; ders kendi yorumunu açıkça söyler."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ortak import C, M, T, Y, pre, kod, yaz

K1 = '''from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, ValidationError, model_validator

class Karar(BaseModel):
    model_config = ConfigDict(extra="forbid")
    karar: Literal["onayla", "reddet", "yukselt"]
    tutar: float = Field(ge=0)
    guven: float = Field(ge=0, le=1)
    gerekce: list[Literal["GEC_TESLIM", "HASAR", "SURE_ASIMI", "BILGI_EKSIK"]] = Field(min_length=1)
    kanit: list[str] = Field(min_length=1)

    @model_validator(mode="after")
    def tutar_tutarli(self):
        if self.karar != "onayla" and self.tutar != 0:
            raise ValueError("onay dışında tutar 0 olmalı")
        if self.karar == "onayla" and self.tutar == 0:
            raise ValueError("onayda tutar 0 olamaz")
        return self

def coz(metin):
    try:
        return Karar.model_validate_json(metin), None
    except ValidationError as e:
        return None, [str(h["loc"]) + ": " + h["msg"] for h in e.errors()]
'''
K1BAS = '''from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, ValidationError, model_validator

class Karar(BaseModel):
    pass

def coz(metin):
    # (Karar, None) ya da (None, hata listesi)
    pass
'''
K1T = '''import json as _j
_D = {"karar": "onayla", "tutar": 450.0, "guven": 0.9, "gerekce": ["GEC_TESLIM"], "kanit": ["teslim 72 dk"]}
_k, _h = coz(_j.dumps(_D))
assert _h is None and _k.karar == "onayla" and _k.tutar == 450, "Geçerli karar: " + repr(_h)
for _n, _d in [("serbest metin", "Bence onaylayalım, müşteri haklı."), ("bilinmeyen karar", {**_D, "karar": "belki"}), ("güven 1 üstü", {**_D, "guven": 1.2}),
               ("negatif tutar", {**_D, "tutar": -1}), ("bilinmeyen gerekçe", {**_D, "gerekce": ["HISSETTIM"]}), ("boş gerekçe", {**_D, "gerekce": []}),
               ("kanıt yok", {**_D, "kanit": []}), ("fazla alan", {**_D, "not": "x"}), ("eksik alan", {"karar": "onayla"}),
               ("ret ve tutar", {**_D, "karar": "reddet"}), ("onay ve sıfır", {**_D, "tutar": 0})]:
    _m = _d if isinstance(_d, str) else _j.dumps(_d)
    _k, _h = coz(_m)
    assert _k is None and _h, "Reddedilmeli: " + _n
_k, _h = coz(_j.dumps({**_D, "karar": "yukselt", "tutar": 0}))
assert _h is None, "Yükseltme tutarı 0"
'''
K1Y = [('''import json
def coz(metin):
    try:
        d = json.loads(metin)
    except ValueError as e:
        return None, [str(e)]
    if d.get("karar") not in ("onayla", "reddet", "yukselt"):
        return None, ["karar"]
    return type("K", (), d), None
''', 'yalnız JSON ve karar alanı'),
 (K1.replace('    model_config = ConfigDict(extra="forbid")\n', ''), 'fazla alana izin veriyor'),
 (K1.replace('''    @model_validator(mode="after")
    def tutar_tutarli(self):
        if self.karar != "onayla" and self.tutar != 0:
            raise ValueError("onay dışında tutar 0 olmalı")
        if self.karar == "onayla" and self.tutar == 0:
            raise ValueError("onayda tutar 0 olamaz")
        return self
''', ''), 'alanlar arası denetim yok'),
 (K1.replace('Field(ge=0, le=1)', 'Field(ge=0)'), 'güven üst sınırı yok'),
 (K1.replace('list[Literal["GEC_TESLIM", "HASAR", "SURE_ASIMI", "BILGI_EKSIK"]]', 'list[str]'), 'gerekçe serbest metin')]
K2 = '''POLITIKA = {"sure_gun": 14, "kucuk_tutar": 50, "surum": "2026-11"}

def kural_karari(t, p=POLITIKA):
    if t["durum"] != "teslim":
        return {"karar": "reddet", "kod": "TESLIM_DEGIL"}
    if t["gun"] > p["sure_gun"]:
        return {"karar": "reddet", "kod": "SURE_ASIMI"}
    if t["istenen"] > t["odenen"]:
        return {"karar": "yukselt", "kod": "TUTAR_ASIMI"}
    if t["istenen"] <= p["kucuk_tutar"]:
        return {"karar": "onayla", "kod": "KUCUK_TUTAR"}
    return None

def karar_ver(t, model):
    k = kural_karari(t)
    if k:
        return {**k, "kaynak": "kural", "tutar": t["istenen"] if k["karar"] == "onayla" else 0}
    o = model(t)
    if o is None:
        return {"karar": "yukselt", "kod": "MODEL_GECERSIZ", "kaynak": "kural", "tutar": 0}
    tutar = o["tutar"] if o["karar"] == "onayla" else 0
    if tutar > t["istenen"]:
        return {"karar": "yukselt", "kod": "MODEL_TUTAR_ASIMI", "kaynak": "kural", "tutar": 0}
    return {"karar": o["karar"], "kod": o["gerekce"][0], "kaynak": "model", "tutar": tutar, "guven": o["guven"]}
'''
K2BAS = '''POLITIKA = {"sure_gun": 14, "kucuk_tutar": 50, "surum": "2026-11"}

def kural_karari(t, p=POLITIKA):
    pass  # kesin karar ya da None

def karar_ver(t, model):
    pass
'''
K2T = '''_T = lambda **k: {"durum": "teslim", "gun": 3, "odenen": 500, "istenen": 200, **k}
_C = []
def _m(ka="onayla", tu=200, gu=0.9):
    def f(t):
        _C.append(t)
        return {"karar": ka, "tutar": tu, "guven": gu, "gerekce": ["HASAR"]}
    return f
_r = karar_ver(_T(durum="iptal"), _m())
assert _r["karar"] == "reddet" and _r["kaynak"] == "kural" and _r["tutar"] == 0 and _C == [], "Kural kesinse model çağrılmaz: " + repr(_r)
_r = karar_ver(_T(gun=15), _m())
assert _r["karar"] == "reddet" and _r["kod"] == "SURE_ASIMI" and _C == [], "Model onaylasa da süre aşımı reddedilir"
assert karar_ver(_T(gun=14), _m())["kaynak"] == "model", "14. gün sınırı içindedir"
_C.clear()
_r = karar_ver(_T(istenen=900), _m(tu=900))
assert _r["karar"] == "yukselt" and _r["kod"] == "TUTAR_ASIMI" and _C == [], "Ödenenden fazla istek insana gider"
_r = karar_ver(_T(istenen=50), _m())
assert _r["karar"] == "onayla" and _r["kaynak"] == "kural" and _r["tutar"] == 50 and _C == [], "Küçük tutar kuralla onay"
_r = karar_ver(_T(), _m())
assert _r == {"karar": "onayla", "kod": "HASAR", "kaynak": "model", "tutar": 200, "guven": 0.9}, "Gri alan modelin: " + repr(_r)
_r = karar_ver(_T(), _m(tu=450))
assert _r["karar"] == "yukselt" and _r["kaynak"] == "kural", "Model istenenden çok veremez"
_r = karar_ver(_T(), lambda t: None)
assert _r["karar"] == "yukselt" and _r["kod"] == "MODEL_GECERSIZ", "Model çıktısı geçersizse insana"
_r = karar_ver(_T(), _m("reddet", 0))
assert _r["karar"] == "reddet" and _r["tutar"] == 0, "Model reddi"
'''
K2Y = [(K2.replace('''    k = kural_karari(t)
    if k:
        return {**k, "kaynak": "kural", "tutar": t["istenen"] if k["karar"] == "onayla" else 0}
    o = model(t)
''', '''    o = model(t)
    k = kural_karari(t)
    if k and o is None:
        return {**k, "kaynak": "kural", "tutar": t["istenen"] if k["karar"] == "onayla" else 0}
'''), 'önce modele soruyor, kural geride'),
 (K2.replace('if t["gun"] > p["sure_gun"]:', 'if t["gun"] >= p["sure_gun"]:'), '14. günü dışarıda bırakıyor'),
 (K2.replace('''    if tutar > t["istenen"]:
        return {"karar": "yukselt", "kod": "MODEL_TUTAR_ASIMI", "kaynak": "kural", "tutar": 0}
''', ''), 'modelin tutarını sınırlamıyor'),
 (K2.replace('''    if o is None:
        return {"karar": "yukselt", "kod": "MODEL_GECERSIZ", "kaynak": "kural", "tutar": 0}
''', '''    if o is None:
        return {"karar": "reddet", "kod": "MODEL_GECERSIZ", "kaynak": "kural", "tutar": 0}
'''), 'geçersiz çıktıyı reddediyor')]
K3 = '''def toplam_maliyet(vakalar, esik, yanlis, insan):
    m = 0
    for v in vakalar:
        if v["guven"] >= esik:
            m += 0 if v["dogru"] else yanlis
        else:
            m += insan
    return m

def esik_sec(vakalar, yanlis, insan):
    adaylar = sorted({v["guven"] for v in vakalar} | {1.01})
    enIyi, enAz = None, None
    for e in adaylar:
        m = toplam_maliyet(vakalar, e, yanlis, insan)
        if enAz is None or m <= enAz:
            enIyi, enAz = e, m
    return enIyi, enAz

def kalibrasyon(vakalar, kova=5):
    d = {}
    for v in vakalar:
        i = min(int(v["guven"] * kova), kova - 1)
        d.setdefault(i, []).append(v)
    out = []
    for i in sorted(d):
        L = d[i]
        ort = sum(x["guven"] for x in L) / len(L)
        dog = sum(1 for x in L if x["dogru"]) / len(L)
        out.append({"alt": i / kova, "adet": len(L), "guven": round(ort, 3), "dogruluk": round(dog, 3), "fark": round(ort - dog, 3)})
    return out
'''
K3BAS = '''def toplam_maliyet(vakalar, esik, yanlis, insan):
    pass

def esik_sec(vakalar, yanlis, insan):
    pass  # (eşik, maliyet)

def kalibrasyon(vakalar, kova=5):
    pass
'''
K3T = '''_V = [{"guven": g, "dogru": d} for g, d in [(0.95, True), (0.93, True), (0.9, False), (0.85, True), (0.8, True), (0.7, False), (0.65, True), (0.6, False), (0.4, False), (0.3, False)]]
assert toplam_maliyet(_V, 0.9, 100, 5) == 100 + 7 * 5, "Maliyet: " + repr(toplam_maliyet(_V, 0.9, 100, 5))
assert toplam_maliyet(_V, 0.0, 10, 5) == 50, "Hepsi otomatik"
assert toplam_maliyet(_V, 2.0, 10, 5) == 50, "Hepsi insan"
def _kaba(y, i):
    return min(toplam_maliyet(_V, e / 100, y, i) for e in range(0, 102))
for _y, _i in [(100, 5), (10, 5), (1000, 1), (2, 5), (30, 30)]:
    _e, _m = esik_sec(_V, _y, _i)
    assert _m == _kaba(_y, _i), f"yanlis={_y} insan={_i}: en düşük maliyet {_kaba(_y, _i)}, senin {_m}"
    assert toplam_maliyet(_V, _e, _y, _i) == _m, "Dönen eşik o maliyeti vermeli"
_e, _ = esik_sec(_V, 1000, 1)
assert _e > 0.9, "Yanlış çok pahalıysa eşik yanlış vakanın üstüne çıkar: " + repr(_e)
_e2, _ = esik_sec(_V, 100, 5)
_e3, _ = esik_sec(_V, 2, 5)
assert _e3 < _e2, "İnsan pahalılaşınca eşik düşmeli"
_e4, _ = esik_sec(_V, 30, 30)
assert esik_sec([{"guven": 0.9, "dogru": False}, {"guven": 0.8, "dogru": False}], 10, 1)[1] == 2, "Model hep yanlışsa en ucuzu hepsini insana vermek"
_k = kalibrasyon(_V, 5)
assert [x["alt"] for x in _k] == [0.2, 0.4, 0.6, 0.8], "Kovalar: " + repr(_k)
assert _k[3] == {"alt": 0.8, "adet": 5, "guven": 0.886, "dogruluk": 0.8, "fark": 0.086}, repr(_k[3])
assert kalibrasyon([{"guven": 1.0, "dogru": True}], 5)[0]["alt"] == 0.8, "Güven 1.0 son kovaya düşer"
'''
K3Y = [(K3.replace('''    enIyi, enAz = None, None
    for e in adaylar:
        m = toplam_maliyet(vakalar, e, yanlis, insan)
        if enAz is None or m <= enAz:
            enIyi, enAz = e, m
    return enIyi, enAz
''', '''    enIyi, oran = None, -1
    for e in adaylar:
        L = [v for v in vakalar if v["guven"] >= e]
        d = sum(v["dogru"] for v in L) / len(L) if L else 0
        if d > oran:
            enIyi, oran = e, d
    return enIyi, toplam_maliyet(vakalar, enIyi, yanlis, insan)
'''), 'en yüksek otomatik doğruluğu seçiyor, maliyete bakmıyor'),
 (K3.replace('adaylar = sorted({v["guven"] for v in vakalar} | {1.01})', 'adaylar = sorted({v["guven"] for v in vakalar})'), 'hepsini insana verme seçeneği yok'),
 (K3.replace('i = min(int(v["guven"] * kova), kova - 1)', 'i = int(v["guven"] * kova)'), 'güven 1.0 ayrı kovaya düşüyor')]
K4 = '''import hashlib, json

ZORUNLU = ("girdi_ozeti", "kural_surumu", "model_surumu", "esik", "karar", "yapan")

def _ozet(onceki, kayit):
    return hashlib.sha256((onceki + json.dumps(kayit, sort_keys=True, ensure_ascii=False)).encode()).hexdigest()

def son_ozet(yol):
    try:
        with open(yol, encoding="utf-8") as f:
            satirlar = f.read().splitlines()
    except FileNotFoundError:
        return ""
    return json.loads(satirlar[-1])["ozet"] if satirlar else ""

def ekle(yol, kayit):
    eksik = [k for k in ZORUNLU if k not in kayit]
    if eksik:
        raise ValueError("eksik alan: " + ", ".join(eksik))
    onceki = son_ozet(yol)
    with open(yol, "a", encoding="utf-8") as f:
        f.write(json.dumps({"kayit": kayit, "onceki": onceki, "ozet": _ozet(onceki, kayit)}, ensure_ascii=False) + "\\n")

def dogrula(yol, beklenen_son=None):
    onceki = ""
    with open(yol, encoding="utf-8") as f:
        for i, s in enumerate(f.read().splitlines(), 1):
            d = json.loads(s)
            if d["onceki"] != onceki or d["ozet"] != _ozet(onceki, d["kayit"]):
                return False, i
            onceki = d["ozet"]
    if beklenen_son is not None and onceki != beklenen_son:
        return False, "son"
    return True, None
'''
K4BAS = '''import hashlib, json

ZORUNLU = ("girdi_ozeti", "kural_surumu", "model_surumu", "esik", "karar", "yapan")

def ekle(yol, kayit):
    pass

def son_ozet(yol):
    pass

def dogrula(yol, beklenen_son=None):
    pass  # (True, None) ya da (False, satır no ya da "son")
'''
K4T = '''import os, tempfile, json as _j
_y = os.path.join(tempfile.mkdtemp(), "iz.jsonl")
_K = lambda n, k="onayla": {"girdi_ozeti": "a" + str(n), "kural_surumu": "2026-11", "model_surumu": "sahte-1", "esik": 0.8, "karar": k, "yapan": "sistem"}
assert son_ozet(_y) == "", "Dosya yoksa boş"
for _i in range(1, 5):
    ekle(_y, _K(_i))
assert dogrula(_y) == (True, None), "Sağlam zincir: " + repr(dogrula(_y))
try:
    ekle(_y, {"karar": "x"})
    raise AssertionError("Eksik alan reddedilmeli")
except ValueError:
    pass
assert len(open(_y, encoding="utf-8").read().splitlines()) == 4, "Eksik kayıt yazılmamalı"
_s = open(_y, encoding="utf-8").read().splitlines()
_son = son_ozet(_y)
assert dogrula(_y, _son) == (True, None), "Doğru bağ"
def _dene(sat):
    open(_y, "w", encoding="utf-8").write("\\n".join(sat) + "\\n")
    return dogrula(_y)
_d = _j.loads(_s[1]); _d["kayit"]["karar"] = "reddet"
assert _dene([_s[0], _j.dumps(_d, ensure_ascii=False), _s[2], _s[3]]) == (False, 2), "Değişen kayıt 2. satırda yakalanmalı"
assert _dene([_s[0], _s[2], _s[3]]) == (False, 2), "Silinen satır yakalanmalı"
assert _dene([_s[1], _s[0], _s[2], _s[3]]) == (False, 1), "Sıra değişimi yakalanmalı"
_h = _j.loads(_s[1]); _h["kayit"]["karar"] = "reddet"; _h["ozet"] = "sahte"
assert _dene([_s[0], _j.dumps(_h, ensure_ascii=False), _s[2], _s[3]])[0] is False, "Sahte özet"
_dene(_s[:3])
assert dogrula(_y)[0] is True, "Sondan silme zincirle anlaşılmaz"
assert dogrula(_y, _son) == (False, "son"), "Dışarıda saklanan son özet sondan silmeyi yakalar"
'''
K4Y = [(K4.replace('''if d["onceki"] != onceki or d["ozet"] != _ozet(onceki, d["kayit"]):''', '''if d["ozet"] != _ozet(d["onceki"], d["kayit"]):'''), 'zinciri izlemiyor, yalnız satır özeti'),
 (K4.replace('''if d["onceki"] != onceki or d["ozet"] != _ozet(onceki, d["kayit"]):''', '''if d["onceki"] != onceki:'''), 'kayıt özetini denetlemiyor'),
 (K4.replace('''    if beklenen_son is not None and onceki != beklenen_son:
        return False, "son"
''', ''), 'sondan silmeyi yakalamıyor')]
K5 = '''class Uygulayici:
    def __init__(self, saat):
        self.saat, self.eylemler, self.kayit = saat, {}, {}

    def tanimla(self, ad, yap, geri=None, pencere=None):
        self.eylemler[ad] = {"yap": yap, "geri": geri, "pencere": pencere}

    def geri_alinabilir(self, ad):
        return self.eylemler[ad]["geri"] is not None

    def uygula(self, ad, girdi, onaylayan=None):
        e = self.eylemler[ad]
        if e["geri"] is None and onaylayan is None:
            raise PermissionError("geri alınamaz eylem insan onayı ister")
        no = len(self.kayit) + 1
        s = e["yap"](**girdi)
        self.kayit[no] = {"ad": ad, "girdi": girdi, "sonuc": s, "t": self.saat(), "geri_alindi": False}
        return no

    def geri_al(self, no):
        k = self.kayit[no]
        e = self.eylemler[k["ad"]]
        if e["geri"] is None:
            raise ValueError("bu eylem geri alınamaz")
        if k["geri_alindi"]:
            return False
        if e["pencere"] is not None and self.saat() - k["t"] > e["pencere"]:
            raise ValueError("geri alma süresi doldu")
        e["geri"](k["sonuc"])
        k["geri_alindi"] = True
        return True
'''
K5BAS = '''class Uygulayici:
    def __init__(self, saat):
        self.saat, self.eylemler, self.kayit = saat, {}, {}

    def tanimla(self, ad, yap, geri=None, pencere=None):
        self.eylemler[ad] = {"yap": yap, "geri": geri, "pencere": pencere}

    def geri_alinabilir(self, ad):
        pass

    def uygula(self, ad, girdi, onaylayan=None):
        pass  # eylem numarası

    def geri_al(self, no):
        pass  # True; zaten geri alındıysa False
'''
K5T = '''_t = [0]; _bak = {"c": 100}; _gon = []
_U = Uygulayici(lambda: _t[0])
def _yuk(t):
    _bak["c"] += t
    return t
_U.tanimla("kupon", _yuk, lambda s: _bak.__setitem__("c", _bak["c"] - s), pencere=60)
_U.tanimla("havale", lambda t: _gon.append(t))
assert _U.geri_alinabilir("kupon") is True and _U.geri_alinabilir("havale") is False, "Geri alınabilirlik"
_n = _U.uygula("kupon", {"t": 30})
assert _bak["c"] == 130, "Uygulandı"
assert _U.geri_al(_n) is True and _bak["c"] == 100, "Telafi eylemi çalışmalı"
assert _U.geri_al(_n) is False and _bak["c"] == 100, "İkinci geri alma bakiyeyi bozmamalı"
_n = _U.uygula("kupon", {"t": 5}); _t[0] = 61
try:
    _U.geri_al(_n)
    raise AssertionError("Süresi dolan eylem geri alınmamalı")
except ValueError:
    pass
assert _bak["c"] == 105, "Süre dolunca bakiye aynı kalır"
try:
    _U.uygula("havale", {"t": 9})
    raise AssertionError("Geri alınamaz eylem onaysız çalışmamalı")
except PermissionError:
    pass
assert _gon == [], "Havale gitmemeli"
_h = _U.uygula("havale", {"t": 9}, onaylayan="ayse")
assert _gon == [9], "Onayla çalışır"
try:
    _U.geri_al(_h)
    raise AssertionError("Havale geri alınamaz")
except ValueError:
    pass
'''
K5Y = [(K5.replace('''        if k["geri_alindi"]:
            return False
''', ''), 'iki kez geri alıyor'),
 (K5.replace('''        if e["geri"] is None and onaylayan is None:
            raise PermissionError("geri alınamaz eylem insan onayı ister")
''', ''), 'geri alınamaz eylemi onaysız çalıştırıyor'),
 (K5.replace('''        if e["pencere"] is not None and self.saat() - k["t"] > e["pencere"]:
            raise ValueError("geri alma süresi doldu")
''', ''), 'süre yok')]
K6 = '''def kalite(kayitlar):
    n = len(kayitlar)
    oto = [k for k in kayitlar if k["yapan"] == "sistem"]
    yuk = [k for k in kayitlar if k["yapan"] == "insan"]
    etiketli = [k for k in oto if k.get("gercek") is not None]
    dogru = [k for k in etiketli if k["gercek"] == k["karar"]]
    onerili = [k for k in yuk if k.get("model_onerisi") is not None]
    degisen = [k for k in onerili if k["model_onerisi"] != k["karar"]]
    gruplar = {}
    for k in etiketli:
        gruplar.setdefault(k["grup"], []).append(k["gercek"] == k["karar"])
    return {"otomatik_oran": len(oto) / n, "yukseltme_orani": len(yuk) / n,
            "etiket_orani": len(etiketli) / len(oto) if oto else 0,
            "otomatik_dogruluk": len(dogru) / len(etiketli) if etiketli else None,
            "insan_degistirme": len(degisen) / len(onerili) if onerili else None,
            "grup_dogruluk": {g: sum(v) / len(v) for g, v in sorted(gruplar.items())},
            "maliyet": sum(k.get("maliyet", 0) for k in kayitlar)}
'''
K6BAS = '''def kalite(kayitlar):
    pass
'''
K6T = '''_R = lambda y, k, g=None, o=None, gr="A", m=0: {"yapan": y, "karar": k, "gercek": g, "model_onerisi": o, "grup": gr, "maliyet": m}
_K = [_R("sistem", "onayla", "onayla", m=1), _R("sistem", "onayla", "reddet", gr="B", m=1), _R("sistem", "reddet", "reddet", gr="B"), _R("sistem", "onayla", None),
      _R("insan", "onayla", "onayla", "onayla", m=20), _R("insan", "reddet", "reddet", "onayla", m=20), _R("insan", "onayla", None, None, m=20), _R("sistem", "reddet", None)]
_s = kalite(_K)
assert _s["otomatik_oran"] == 5 / 8, "Otomatik oran: " + repr(_s["otomatik_oran"])
assert _s["yukseltme_orani"] == 3 / 8, "Yükseltme oranı"
assert _s["etiket_orani"] == 3 / 5, "Etiket oranı: otomatik kararların ne kadarında sonuç biliniyor"
assert abs(_s["otomatik_dogruluk"] - 2 / 3) < 1e-9, "Doğruluk yalnız etiketli otomatik kararlardan: " + repr(_s["otomatik_dogruluk"])
assert _s["insan_degistirme"] == 1 / 2, "Modelin önerisini insan kaç kez değiştirdi: " + repr(_s["insan_degistirme"])
assert _s["grup_dogruluk"] == {"A": 1.0, "B": 0.5}, "Grup: " + repr(_s["grup_dogruluk"])
assert _s["maliyet"] == 62, "Maliyet"
_b = kalite([_R("insan", "onayla", None)])
assert _b["otomatik_dogruluk"] is None and _b["otomatik_oran"] == 0, "Hiç otomatik karar yoksa doğruluk bilinmez, 0 değil"
'''
K6Y = [(K6.replace('len(degisen) / len(onerili) if onerili', 'len(degisen) / len(yuk) if yuk'), 'önerisi olmayanı paydaya katıyor'),
 (K6.replace('etiketli = [k for k in oto if k.get("gercek") is not None]', 'etiketli = [k for k in kayitlar if k.get("gercek") is not None]'), 'insan kararlarını doğruluğa katıyor'),
 (K6.replace('"otomatik_dogruluk": len(dogru) / len(etiketli) if etiketli else None', '"otomatik_dogruluk": len(dogru) / len(oto) if oto else None'), 'etiketsizi yanlış sayıyor'),
 (K6.replace('if etiketli else None', 'if etiketli else 0'), 'bilinmeyeni 0 sayıyor')]
ORNEK = '''# Aynı iade talebi, iki çıktı biçimi. Hangisini kod işleyebilir, hangisi denetlenebilir?
serbest = "Müşteri haklı görünüyor, sanırım iade edilebilir ama tutar biraz yüksek."
karar = {"karar": "yukselt", "tutar": 0, "guven": 0.55, "gerekce": ["BILGI_EKSIK"], "kanit": ["fotoğraf yok"]}

print("serbest metinde 'iade' var mı:", "iade" in serbest)  # peki onay mı, ret mi?
print("karar türü:", karar["karar"], "| güven:", karar["guven"])
print("insana gitmeli mi:", karar["karar"] == "yukselt" or karar["guven"] < 0.8)
'''
ders = dict(id='karar-mimarisi', lv='ileri', mod='Yapay Zekâ', min=65, needs=['pydantic'],
 title='Karar odaklı yapay zekâ mimarisi',
 sum='Modeli serbest metin yazan değil, denetlenebilir karar üreten bir bileşen olarak kurarsın: karar şeması, kurallarla birlikte çalışma, güven eşiği, insana yükseltme, denetim izi, geri alınabilirlik, karar kalitesi ölçümü.',
 goals=['Modelin çıktısını doğrulanan bir karar şemasına bağlayabilirim.', 'Kuralın kesin olduğu yerde modeli devre dışı bırakabilirim.', 'Güven eşiğini maliyete göre seçebilir, kalibrasyonu sınayabilirim.', 'Geri alınamaz eylemi insana yönlendirebilirim.', 'Sonradan değiştirilince fark edilen bir denetim izi yazabilirim.', 'Karar kalitesini doğru paydalarla ölçebilirim.'],
 body=f'''<div class="note"><b>Bu başlık hakkında dürüst bir not</b>"Karar odaklı yapay zekâ mimarisi" yerleşik bir standart ya da tek tanımı olan bir terim <b>değildir</b>. Benzer ifadeleri ("decision-centric architecture", "decision intelligence") danışmanlık ve ürün yazılarında farklı anlamlarla görürsün; bilinen bir standart kurumu tanımı bulamadık. Bu derste ifadeyi şöyle <b>yorumluyoruz</b>: <b>modelin serbest metin değil, kararı ürettiği, kararın da kurallar ve insanla birlikte denetlendiği yapı</b>. Parçaların her biri (şemalı çıktı, kural motoru, insan onayı, denetim izi) yerleşik uygulamalardır; bir araya getiriş bizim önerimizdir. Mülakatta bu adı duyarsan önce ne kastedildiğini sor.</div>
<h2>Neden serbest metin yetmez?</h2>
<p>İade, kredi ön değerlendirme, destek önceliği gibi işlerde sonuç bir cümle değil, bir <b>karardır</b>: kim, neye, ne kadar, neden. Serbest metin ne kodla işlenir ne de ölçülür.</p>
{pre(ORNEK)}
<p>Bu derste de model yok: görevlerdeki model yerine sabit bir işlev ya da sahte öneri kullanıyoruz. Amaç modelin kararını değil, kararın etrafındaki yapıyı sınamak.</p>
<h2>Altı parça</h2>
<div class="tbl-wrap"><table><tr><th>Parça</th><th>Soru</th><th>Yoksa ne olur</th></tr>
<tr><td><b>Karar şeması</b></td><td>Çıktı hangi alanlardan oluşur?</td><td>Metni kim yorumlayacak belli olmaz</td></tr>
<tr><td><b>Kural ve model</b></td><td>Kim neye karar verir?</td><td>Model politikayı çiğner</td></tr>
<tr><td><b>Güven eşiği</b></td><td>Ne zaman otomatik?</td><td>Ya her şey otomatik ya her şey insanda</td></tr>
<tr><td><b>Yükseltme</b></td><td>İnsan ne görür?</td><td>İnsan önüne bağlamsız iş düşer</td></tr>
<tr><td><b>Denetim izi</b></td><td>Altı ay sonra neden sorulursa?</td><td>Karar savunulamaz</td></tr>
<tr><td><b>Geri alınabilirlik</b></td><td>Yanlışsa dönüş var mı?</td><td>Küçük hata büyük zarar olur</td></tr></table></div>
<h2>Karar şeması</h2>
<p>Modelden doğrudan bu şemaya uyan JSON iste, sağlayıcının yapılandırılmış çıktı özelliği varsa kullan, ama <b>sonucu yine kendin doğrula</b>. Gerekçe serbest metin değil, kapalı bir kod listesi olsun: sayılabilir, kümelenebilir. Kanıt alanı zorunlu olsun. Alanlar arası kuralları da yaz: ret kararında tutar sıfır olmalı. Doğrulamadan geçemeyen çıktı insana gider, sessizce düzeltilmez.</p>
<h2>Kural önce, model gri alanda</h2>
<p>Politikanın kesin olduğu yerde model çağırmak hem para kaybıdır hem risktir. Süre dolduysa cevap bellidir. Sıra şöyledir: kesin kurallar, sonra model, sonra modelin sonucunu sınırlayan kurallar. Model "onayla" dese bile <b>istenenden fazla tutar veremez</b>. Kuralları sürüm numarasıyla sakla; karar hangi sürümle verildi, izde görünür.</p>
<h2>Güven eşiği</h2>
<p>İki yanılgı var. Birincisi modelin söylediği güvene olduğu gibi inanmak: dil modellerinin kendi bildirdiği güven genellikle kalibre değildir, 0,9 dediği işlerde doğruluk 0,9 çıkmayabilir. Bu yüzden önce etiketli veriyle <b>kalibrasyon tablosu</b> çıkarırsın. İkincisi eşiği "yüksek olsun" diye seçmek. Eşik bir iş kararıdır: yanlış otomatik karar ne kadara mal oluyor, insan incelemesi ne kadara? Bu iki rakamla eşik hesaplanır. Yanlışın bedeli büyükse eşik yükselir, insan pahalıysa düşer.</p>
<h2>Yükseltme ve geri alınabilirlik</h2>
<p>Eylemleri geri alınabilirliğe göre ayır. Kupon tanımlamak geri alınır, para göndermek alınmaz. Geri alınamaz eylem güven kaç olursa olsun insan onayı ister. Geri alma "silmek" değil <b>telafi eylemidir</b>, tek kez çalışır, süresi olabilir ve o da izde görünür. Yükseltmede insan modelin önerisini, kanıtı ve kuralın sonucunu görür; yalnız önerinin kopyasını onaylayan insan ise gerçek bir denetim sayılmaz, bu yüzden değiştirme oranını da ölçersin.</p>
<h2>Denetim izi</h2>
<p>Her karar için girdi özeti, kural ve model sürümü, eşik, sonuç ve kararı veren yazılır. Her kayıt öncekinin özetini içerirse sonradan değişiklik zincirde görünür. Zincirin sınırı da var: <b>sondan silinen kayıt zincirle anlaşılmaz</b>, son özeti başka bir yerde saklamak gerekir. Dosya yazma izni olan biri zinciri baştan da üretebilir; gerçek sistemde kayıt yetkisi ayrı tutulur. Kişisel veriyi ize açık yazma: özet ya da numara yeter.</p>
<h2>Karar kalitesi</h2>
<div class="tbl-wrap"><table><tr><th>Ölçü</th><th>Payda</th><th>Tuzak</th></tr>
<tr><td>Otomatik oran</td><td>Tüm kararlar</td><td>Tek başına hedef olursa kalite düşer</td></tr>
<tr><td>Otomatik doğruluk</td><td>Sonucu bilinen <b>otomatik</b> kararlar</td><td>İnsan kararları ve etiketsizler karışmasın</td></tr>
<tr><td>Etiket oranı</td><td>Otomatik kararlar</td><td>Düşükse doğruluk rakamı zayıf kanıttır</td></tr>
<tr><td>İnsanın değiştirme oranı</td><td>Model önerisi olan yükseltmeler</td><td>Sıfıra yakınsa insan körlemesine onaylıyor olabilir</td></tr>
<tr><td>Grup kırılımı</td><td>Şehir, kanal, müşteri tipi</td><td>Ortalama, bir grubun kötü sonucunu gizler</td></tr></table></div>
<p>Etiketler geç gelir: iadenin doğru olup olmadığı haftalar sonra anlaşılır. Bilinmeyeni yanlış saymak da doğru saymak da hatadır, "bilinmiyor" olarak bırak.</p>''',
 ex=[
 M('karar-mimarisi-m1', '"Karar odaklı yapay zekâ mimarisi" için hangisi doğru?', ['ISO tarafından tanımlanmış bir standarttır', 'Yerleşik tek tanımı olmayan bir ifadedir', 'Yalnız bir bulut sağlayıcısının ürün adıdır', 'MCP protokolünün başka bir adıdır'], 1, 'Bu ders ifadeyi kendi yorumuyla kullanıyor ve bunu açıkça söylüyor.'),
 M('karar-mimarisi-m2', 'İade süresi dolmuş bir talep için model "onayla, güven 0,99" diyor. Doğru sonuç?', ['Güven yüksek, onaylanır', 'Kural reddeder', 'İnsana sorulur', 'Model tekrar çağrılır'], 1, 'Kesin kural modelden önce gelir. Bu durumda model hiç çağrılmamalıydı.'),
 M('karar-mimarisi-m3', 'Yanlış otomatik karar 100 TL, insan incelemesi 5 TL. Eşik nasıl seçilir?', ['Toplam maliyeti en az yapan değer', 'Her iş için sabit 0,95 değeri alınarak', 'Modele kendi eşiği sorularak belirlenir', 'En çok kararı otomatik yapan değer seçilir'], 0, 'Eşik bir maliyet hesabıdır. Sabit "güvenli" rakam, veriye ve bedele bakmaz.'),
 M('karar-mimarisi-m4', 'Otomatik doğruluk hesabında sonucu henüz bilinmeyen kararlar ne yapılır?', ['Yanlış sayılır', 'Doğru sayılır', 'Paydaya girmez', 'Rastgele etiketlenir'], 2, 'Bilinmeyeni sayıya katmak raporu iki yönde de bozar. Etiket oranı rakamın ne kadar güvenilir olduğunu söyler.'),
 T('karar-mimarisi-t1', 'Toplam maliyeti ne yazdırır?', '''v = [(0.9, True), (0.8, False), (0.5, True)]
esik, yanlis, insan = 0.7, 100, 5
m = 0
for g, d in v:
    m += (0 if d else yanlis) if g >= esik else insan
print(m)''', ['100', '105', '110', '5'], 1, '0,9 doğru: 0. 0,8 yanlış: 100. 0,5 eşik altı: insan 5. Toplam 105.'),
 C('karar-mimarisi-1', 'Rehberli', '<b>Karar şeması.</b> Pydantic ile <code>Karar</code>: <code>karar</code> (<code>onayla, reddet, yukselt</code>), <code>tutar</code> (0 ve üstü), <code>guven</code> (0 ile 1), <code>gerekce</code> (en az bir kod: <code>GEC_TESLIM, HASAR, SURE_ASIMI, BILGI_EKSIK</code>), <code>kanit</code> (en az bir metin). Fazla alan yasak. Onay dışında tutar 0, onayda 0 olamaz. <code>coz(metin)</code>: <code>(Karar, None)</code> ya da <code>(None, hata listesi)</code>. Serbest metin de hata listesi verir.', K1BAS, K1, K1T, ['Karar.model_validate_json(metin) hem JSON hem şema denetler.', 'ConfigDict(extra="forbid")', '@model_validator(mode="after") alanlar arası denetim için.'], 'Çıktı şemaya girince kod işleyebilir, kapalı gerekçe kodları da sayılabilir.', yanlis=K1Y),
 C('karar-mimarisi-2', 'Kendin yaz', '<b>Kural ve model.</b> <code>kural_karari(t)</code>: teslim değilse <code>reddet TESLIM_DEGIL</code>; <code>gun</code> süreyi aşarsa <code>reddet SURE_ASIMI</code>; <code>istenen &gt; odenen</code> ise <code>yukselt TUTAR_ASIMI</code>; <code>istenen</code> küçük tutar ve altındaysa <code>onayla KUCUK_TUTAR</code>; yoksa <code>None</code>. <code>karar_ver(t, model)</code>: kural kesinse modeli çağırma, <code>{"karar", "kod", "kaynak": "kural", "tutar"}</code>. Model <code>None</code> dönerse <code>yukselt MODEL_GECERSIZ</code>. Model istenenden çok tutar verirse <code>yukselt MODEL_TUTAR_ASIMI</code>. Yoksa <code>kaynak: "model"</code>, <code>kod</code> ilk gerekçe, <code>guven</code> ile.', K2BAS, K2, K2T, ['Modeli yalnız kural None dönünce çağır.', 'Tutar onayda istenen, diğerlerinde 0.'], 'Modeli çağırmadan verilen karar hem ucuzdur hem savunulur.', yanlis=K2Y, diff=2),
 C('karar-mimarisi-3', 'Meydan okuma', '<b>Eşik hesabı.</b> Vaka: <code>{"guven", "dogru"}</code>. <code>toplam_maliyet(vakalar, esik, yanlis, insan)</code>: eşik ve üstü otomatik (yanlışsa <code>yanlis</code>), altı <code>insan</code>. <code>esik_sec</code> en az maliyetli <code>(esik, maliyet)</code> döndürür; "hepsini insana ver" de bir seçenektir. <code>kalibrasyon(vakalar, kova=5)</code>: dolu kovalar için <code>{"alt", "adet", "guven", "dogruluk", "fark"}</code>, üçü de 3 basamak yuvarlanır, güven 1.0 son kovaya düşer.', K3BAS, K3, K3T, ['Aday eşikler vakalardaki güven değerleri ve 1\'in üstünde bir değer.', 'min(int(g * kova), kova - 1)'], 'Eşiği maliyet belirler. En yüksek doğruluğu veren eşik çoğu zaman en ucuz olan değildir.', yanlis=K3Y, diff=3),
 C('karar-mimarisi-4', 'Kendin yaz', '<b>Zincirli denetim izi.</b> <code>ekle(yol, kayit)</code>: <code>ZORUNLU</code> alan eksikse <code>ValueError</code>, yazmaz. Satır: <code>{"kayit", "onceki", "ozet"}</code>; <code>ozet</code>, önceki özet ve kaydın sıralı JSON\'unun SHA-256\'sıdır. <code>son_ozet(yol)</code>: yoksa boş metin. <code>dogrula(yol, beklenen_son=None)</code>: <code>(True, None)</code>; bozuk ilk satırda <code>(False, satır_no)</code>; son özet tutmazsa <code>(False, "son")</code>.', K4BAS, K4, K4T, ['Doğrulamada önceki özeti kendin taşı, satırdakine güvenme.', 'sort_keys=True'], 'Her satır öncekine bağlı olduğu için ortadaki değişiklik zinciri kırar. Sondan silme için dışarıda bir özet gerekir.', yanlis=K4Y, diff=3),
 C('karar-mimarisi-5', 'Kendin yaz', '<b>Geri alınabilirlik.</b> <code>Uygulayici</code>: <code>geri_alinabilir(ad)</code> telafi işlevi var mı söyler. <code>uygula(ad, girdi, onaylayan=None)</code>: geri alınamaz eylem onaysızsa <code>PermissionError</code>; eylemi çalıştırır, numara döndürür. <code>geri_al(no)</code>: telafiyi sonucu vererek çalıştırır, <code>True</code> döner; ikinci kez <code>False</code> ve etkisiz; süre dolmuş ya da eylem geri alınamaz ise <code>ValueError</code>.', K5BAS, K5, K5T, ['Kayda t, sonuc ve geri_alindi yaz.', 'Pencere None ise süre sınırı yok.'], 'Geri alma da yan etkidir. İki kez çalışırsa bakiye bozulur.', yanlis=K5Y, diff=2),
 C('karar-mimarisi-6', 'Hata avı', '<b>Doğru paydalar.</b> Kayıt: <code>{"yapan", "karar", "gercek", "model_onerisi", "grup", "maliyet"}</code>. <code>kalite(kayitlar)</code>: <code>otomatik_oran, yukseltme_orani, etiket_orani</code> (otomatiklerin kaçında gerçek biliniyor), <code>otomatik_dogruluk</code> (etiketli otomatiklerden; yoksa <code>None</code>), <code>insan_degistirme</code> (model önerisi olan yükseltmelerde önerisi değişenlerin payı; yoksa <code>None</code>), <code>grup_dogruluk</code>, <code>maliyet</code> toplamı.', K6BAS, K6, K6T, ['yapan sistem ya da insan.', 'gercek None ise etiket yok.'], 'Yanlış payda iyi görünen ama yanlış bir rakam verir. Bilinmeyen 0 değildir.', yanlis=K6Y, diff=2),
 ],
 faq=[dict(q='Her yapay zekâ işi böyle mi kurulmalı?', a='Hayır. Özetleme ya da taslak üretme gibi işlerde son kararı zaten insan verir, bu yapı fazladır. Bu mimari, çıktısı doğrudan eylem başlatan ve sonradan hesabı sorulacak işler içindir.'), dict(q='Model kendi güvenini söyleyebiliyor mu?', a='Söyler, ama bu rakam olasılık gibi davranmayabilir. Etiketli veriyle kalibrasyon tablosu çıkar; tutmuyorsa rakama değil tabloya güven.'), dict(q='Kural mı model mi, nasıl ayırırım?', a='Politikada yazılı, tek cevabı olan her şey kuraldır. Yorum isteyen kısım, örneğin şikâyet metninin ne anlattığı, modele kalır.')],
 mistakes=[dict(bad='if "onay" in cevap: uygula()', good='k, hata = coz(cevap)\nif k and k.karar == "onayla": uygula()', why='Metin içinde "onaylanamaz" da geçer. Karar şemadan okunur.'), dict(bad='esik = 0.95  # güvenli olsun', good='esik, _ = esik_sec(etiketli, yanlis=100, insan=5)', why='Eşik, yanlışın ve insanın bedeline bağlıdır.'), dict(bad='dogruluk = dogru / len(tum_kararlar)', good='dogruluk = dogru / len(etiketli_otomatik)', why='Payda yanlışsa rakam bir şey söylemez.')])
yaz('karar-mimarisi', 'Karar odaklı yapay zekâ mimarisi', ders)
