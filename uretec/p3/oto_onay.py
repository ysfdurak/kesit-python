#!/usr/bin/env python3
"""proje-oto-onay: çok adımlı satın alma onayı. Durum makinesi, yetki sınırı, kesintiden dönüş, Word sipariş belgesi."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ortak import C, M, T, Y, pre, yaz

A1 = '''import hashlib, json, os
from docx import Document

LIMIT = {"yonetici": 10000, "direktor": 100000, "cfo": 10 ** 9}
SIRA = ["yonetici", "direktor", "cfo"]

def gereken_onaylar(tutar):
    g = []
    for r in SIRA:
        g.append(r)
        if tutar <= LIMIT[r]:
            return g
    raise ValueError("tutar çok yüksek")

GECIS = {"taslak": {"gonder": "onayda"}, "onayda": {"onayla": "onayda", "reddet": "reddedildi", "sure_doldu": "onayda"},
         "onaylandi": {"siparis": "siparis_verildi"}, "reddedildi": {}, "siparis_verildi": {}}

class Gecersiz(Exception):
    pass

def yeni_talep(no, isteyen, tedarikci, tutar):
    if tutar <= 0:
        raise ValueError("tutar pozitif olmalı")
    return {"no": no, "isteyen": isteyen, "tedarikci": tedarikci, "tutar": tutar, "durum": "taslak", "kalan": gereken_onaylar(tutar), "onaylar": []}

def uygula(t, olay, kisi=None, rol=None):
    if olay not in GECIS[t["durum"]]:
        raise Gecersiz(f"{t['durum']} durumunda {olay} yapılamaz")
    t = json.loads(json.dumps(t))
    if olay in ("onayla", "reddet"):
        if kisi == t["isteyen"]:
            raise Gecersiz("kendi talebini onaylayamazsın")
        if not t["kalan"] or rol != t["kalan"][0]:
            raise Gecersiz("sıra " + str(t["kalan"][:1]) + " rolünde")
        if any(o["kisi"] == kisi for o in t["onaylar"]):
            raise Gecersiz("aynı kişi iki kez onaylayamaz")
    t["durum"] = GECIS[t["durum"]][olay]
    if olay == "onayla":
        t["onaylar"].append({"kisi": kisi, "rol": t["kalan"].pop(0)})
        if not t["kalan"]:
            t["durum"] = "onaylandi"
    return t
'''
A1BAS = '''import hashlib, json, os
from docx import Document

LIMIT = {"yonetici": 10000, "direktor": 100000, "cfo": 10 ** 9}
SIRA = ["yonetici", "direktor", "cfo"]

def gereken_onaylar(tutar):
    pass

GECIS = {"taslak": {"gonder": "onayda"}, "onayda": {"onayla": "onayda", "reddet": "reddedildi", "sure_doldu": "onayda"},
         "onaylandi": {"siparis": "siparis_verildi"}, "reddedildi": {}, "siparis_verildi": {}}

class Gecersiz(Exception):
    pass

def yeni_talep(no, isteyen, tedarikci, tutar):
    pass  # {"no", "isteyen", "tedarikci", "tutar", "durum", "kalan", "onaylar"}

def uygula(t, olay, kisi=None, rol=None):
    pass  # yeni talep döndürür, verilen sözlüğü değiştirmez
'''
A1T = '''assert gereken_onaylar(10000) == ["yonetici"] and gereken_onaylar(10001) == ["yonetici", "direktor"], "Sınır dahil"
assert gereken_onaylar(100001) == ["yonetici", "direktor", "cfo"], "Üç kademe"
_t = yeni_talep("T1", "ali", "Delta", 50000)
assert _t["durum"] == "taslak" and _t["kalan"] == ["yonetici", "direktor"] and _t["onaylar"] == [], repr(_t)
try:
    yeni_talep("T", "a", "b", 0)
    raise AssertionError("Sıfır tutar reddedilmeli")
except ValueError:
    pass
def _red(*a, **k):
    try:
        uygula(*a, **k)
    except Gecersiz:
        return True
    return False
assert _red(_t, "onayla", "ayse", "yonetici"), "Taslak onaylanamaz"
assert _red(_t, "siparis"), "Taslaktan sipariş çıkmaz"
_a = uygula(_t, "gonder")
assert _t["durum"] == "taslak" and _a["durum"] == "onayda", "Girdi değişmez, yeni nesne döner"
assert _red(_a, "onayla", "ali", "yonetici"), "İsteyen kendi talebini onaylayamaz"
assert _red(_a, "onayla", "veli", "direktor"), "Sıra atlanamaz"
assert _red(_a, "onayla", "veli", "stajyer"), "Rolü olmayan onaylayamaz"
assert _red(_a, "siparis"), "Onay bitmeden sipariş yok"
_b = uygula(_a, "onayla", "ayse", "yonetici")
assert _b["durum"] == "onayda" and _b["kalan"] == ["direktor"] and _b["onaylar"] == [{"kisi": "ayse", "rol": "yonetici"}], repr(_b)
assert _a["kalan"] == ["yonetici", "direktor"], "Önceki durum korunur: iç listeler de"
assert _red(_b, "onayla", "ayse", "direktor"), "Aynı kişi iki kademeyi geçemez"
_c = uygula(_b, "onayla", "veli", "direktor")
assert _c["durum"] == "onaylandi" and _c["kalan"] == [], "Son onayla biter"
assert _red(_c, "reddet", "veli", "direktor"), "Biten talep reddedilemez"
assert uygula(_c, "siparis")["durum"] == "siparis_verildi", "Sipariş"
_d = uygula(_a, "reddet", "ayse", "yonetici")
assert _d["durum"] == "reddedildi" and _red(_d, "onayla", "veli", "yonetici") and _red(_d, "gonder"), "Ret son durumdur"
'''
A1Y = [(A1.replace('''        if kisi == t["isteyen"]:
            raise Gecersiz("kendi talebini onaylayamazsın")
''', ''), 'kendi talebini onaylıyor'),
       (A1.replace('''        if not t["kalan"] or rol != t["kalan"][0]:
            raise Gecersiz("sıra " + str(t["kalan"][:1]) + " rolünde")
''', ''), 'sıra atlanabiliyor'),
       (A1.replace('''        if any(o["kisi"] == kisi for o in t["onaylar"]):
            raise Gecersiz("aynı kişi iki kez onaylayamaz")
''', ''), 'aynı kişi iki kademeyi geçiyor'),
       (A1.replace('t = json.loads(json.dumps(t))', 't = dict(t)'), 'yüzeysel kopya: önceki durum bozuluyor'),
       (A1.replace('if tutar <= LIMIT[r]:', 'if tutar < LIMIT[r]:'), 'sınır dışarıda')]
A2 = '''
class Defter:
    """Olay kaydı: durum bundan yeniden hesaplanır."""
    def __init__(self, yol):
        self.yol = yol

    def _satirlar(self):
        if not os.path.exists(self.yol):
            return []
        return [json.loads(s) for s in open(self.yol, encoding="utf-8")]

    def ekle(self, olay):
        s = self._satirlar()
        onceki = s[-1]["ozet"] if s else ""
        oz = hashlib.sha256((onceki + json.dumps(olay, sort_keys=True, ensure_ascii=False)).encode()).hexdigest()
        with open(self.yol, "a", encoding="utf-8") as f:
            f.write(json.dumps({"olay": olay, "onceki": onceki, "ozet": oz}, ensure_ascii=False) + "\\n")
            f.flush()
            os.fsync(f.fileno())

    def durum(self):
        talepler = {}
        onceki = ""
        for s in self._satirlar():
            if s["onceki"] != onceki or s["ozet"] != hashlib.sha256((onceki + json.dumps(s["olay"], sort_keys=True, ensure_ascii=False)).encode()).hexdigest():
                raise ValueError("kayıt bozulmuş")
            onceki = s["ozet"]
            o = s["olay"]
            if o["tur"] == "talep":
                talepler[o["no"]] = yeni_talep(o["no"], o["isteyen"], o["tedarikci"], o["tutar"])
            elif o["tur"] == "olay":
                talepler[o["no"]] = uygula(talepler[o["no"]], o["olay"], o.get("kisi"), o.get("rol"))
        return talepler

def islem(defter, no, olay, kisi=None, rol=None):
    t = defter.durum()[no]
    uygula(t, olay, kisi, rol)
    defter.ekle({"tur": "olay", "no": no, "olay": olay, "kisi": kisi, "rol": rol})
    return defter.durum()[no]
'''
A2BAS = '''
class Defter:
    """Olay kaydı: durum bundan yeniden hesaplanır."""
    def __init__(self, yol):
        self.yol = yol

    def ekle(self, olay):
        pass

    def durum(self):
        pass  # {no: talep}; kayıt bozuksa ValueError

def islem(defter, no, olay, kisi=None, rol=None):
    pass  # geçersizse kayda yazmaz, Gecersiz yükselir
'''
A2T = '''import tempfile, json as _j
_y = tempfile.mkdtemp() + "/olay.jsonl"
_d = Defter(_y)
_d.ekle({"tur": "talep", "no": "T1", "isteyen": "ali", "tedarikci": "Delta", "tutar": 50000})
assert _d.durum()["T1"]["durum"] == "taslak", "Talep"
assert islem(_d, "T1", "gonder")["durum"] == "onayda", "Gönder"
islem(_d, "T1", "onayla", "ayse", "yonetici")
_n = len(open(_y, encoding="utf-8").read().splitlines())
try:
    islem(_d, "T1", "onayla", "ali", "direktor")
    raise AssertionError("Kendi talebi")
except Gecersiz:
    pass
assert len(open(_y, encoding="utf-8").read().splitlines()) == _n, "Geçersiz olay kayda yazılmaz"
_d2 = Defter(_y)
_t = _d2.durum()["T1"]
assert _t["kalan"] == ["direktor"] and _t["onaylar"][0]["kisi"] == "ayse", "Yeni süreç durumu kayıttan kurar: " + repr(_t)
_d2.ekle({"tur": "talep", "no": "T2", "isteyen": "can", "tedarikci": "Ege", "tutar": 500})
assert set(_d2.durum()) == {"T1", "T2"}, "Birden çok talep"
_s = open(_y, encoding="utf-8").read().splitlines()
_o = _j.loads(_s[0]); _o["olay"]["tutar"] = 5
open(_y, "w", encoding="utf-8").write("\\n".join([_j.dumps(_o, ensure_ascii=False)] + _s[1:]) + "\\n")
try:
    _d2.durum()
    raise AssertionError("Değiştirilen tutar yakalanmalı")
except ValueError:
    pass
open(_y, "w", encoding="utf-8").write("\\n".join(_s[:1] + _s[2:]) + "\\n")
try:
    _d2.durum()
    raise AssertionError("Silinen olay yakalanmalı")
except ValueError:
    pass
'''
_b1 = A1
A2Y = [(_b1 + A2.replace('''    uygula(t, olay, kisi, rol)
    defter.ekle''', '''    defter.ekle'''), 'önce yazıyor, sonra sınıyor'),
       (_b1 + A2.replace('''            if s["onceki"] != onceki or s["ozet"] != hashlib.sha256((onceki + json.dumps(s["olay"], sort_keys=True, ensure_ascii=False)).encode()).hexdigest():
                raise ValueError("kayıt bozulmuş")
''', ''), 'zinciri denetlemiyor')]
A3 = '''
def siparis_belgesi(t, yol):
    d = Document()
    d.add_heading("Satın Alma Siparişi " + t["no"], 1)
    d.add_paragraph("Tedarikçi: " + t["tedarikci"])
    d.add_paragraph("Tutar: " + f"{t['tutar']:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".") + " TL")
    d.add_paragraph("Talep eden: " + t["isteyen"])
    tablo = d.add_table(rows=1, cols=2)
    tablo.rows[0].cells[0].text = "Rol"
    tablo.rows[0].cells[1].text = "Onaylayan"
    for o in t["onaylar"]:
        r = tablo.add_row().cells
        r[0].text = o["rol"]
        r[1].text = o["kisi"]
    d.save(yol + ".tmp")
    os.replace(yol + ".tmp", yol)

def siparis_ver(defter, no, klasor, gonder):
    t = defter.durum()[no]
    if t["durum"] == "siparis_verildi":
        return "zaten"
    if t["durum"] != "onaylandi":
        raise Gecersiz("durum: " + t["durum"])
    os.makedirs(klasor, exist_ok=True)
    y = os.path.join(klasor, no + ".docx")
    siparis_belgesi(t, y)
    gonder(no, y)
    defter.ekle({"tur": "olay", "no": no, "olay": "siparis"})
    return "verildi"
'''
A3BAS = '''
def siparis_belgesi(t, yol):
    pass

def siparis_ver(defter, no, klasor, gonder):
    pass  # "verildi" ya da "zaten". gonder(no, yol) tedarikçi sistemine gider, anahtar no'dur
'''
A3T = '''import tempfile
_k = tempfile.mkdtemp(); _d = Defter(_k + "/o.jsonl")
_d.ekle({"tur": "talep", "no": "T1", "isteyen": "ali", "tedarikci": "Delta Elektronik", "tutar": 12345.5})
for _x in [("gonder",), ("onayla", "ayse", "yonetici"), ("onayla", "veli", "direktor")]:
    islem(_d, "T1", *_x)
_d.ekle({"tur": "talep", "no": "T2", "isteyen": "can", "tedarikci": "Ege", "tutar": 10})
_g = []
try:
    siparis_ver(_d, "T2", _k + "/b", lambda n, y: _g.append(n))
    raise AssertionError("Onaysız sipariş olmaz")
except Gecersiz:
    pass
assert _g == [], "Onaysız gönderim yok"
class _Kesinti(Exception):
    pass
_n = {"kez": 0, "gercek": set()}
def _gonder(no, y):
    assert os.path.getsize(y) > 0, "Belge gönderimden önce hazır olmalı"
    _n["gercek"].add(no)            # idempotent: aynı numara ikinci siparişi açmaz
    _n["kez"] += 1
    if _n["kez"] == 1:
        raise _Kesinti("gönderildi ama kayıt yazılamadan süreç öldü")
try:
    siparis_ver(_d, "T1", _k + "/b", _gonder)
    raise AssertionError("Kesinti yükselmeli")
except _Kesinti:
    pass
assert Defter(_k + "/o.jsonl").durum()["T1"]["durum"] == "onaylandi", "Kesintide kayıt ilerlemez"
assert siparis_ver(Defter(_k + "/o.jsonl"), "T1", _k + "/b", _gonder) == "verildi" and _n["kez"] == 2, "Yeniden çalışınca sürer"
assert _d.durum()["T1"]["durum"] == "siparis_verildi", "Durum"
assert siparis_ver(_d, "T1", _k + "/b", _gonder) == "zaten" and _n["kez"] == 2, "Üçüncü çalışma tedarikçiye gitmez"
_b = Document(_k + "/b/T1.docx")
_m = "\\n".join(p.text for p in _b.paragraphs)
assert "Satın Alma Siparişi T1" in _m and "Delta Elektronik" in _m and "12.345,50" in _m and "ali" in _m, "Word içeriği: " + _m
_t = _b.tables[0]
assert [[c.text for c in r.cells] for r in _t.rows] == [["Rol", "Onaylayan"], ["yonetici", "ayse"], ["direktor", "veli"]], "Onay tablosu"
'''
_b2 = _b1 + A2
A3Y = [(_b2 + A3.replace('''    if t["durum"] != "onaylandi":
        raise Gecersiz("durum: " + t["durum"])
''', ''), 'onaysız sipariş veriyor'),
       (_b2 + A3.replace('''    gonder(no, y)
    defter.ekle({"tur": "olay", "no": no, "olay": "siparis"})
''', '''    defter.ekle({"tur": "olay", "no": no, "olay": "siparis"})
    gonder(no, y)
'''), 'önce kayıt, sonra gönderim: kesintide sipariş kaybolur'),
       (_b2 + A3.replace('''    if t["durum"] == "siparis_verildi":
        return "zaten"
''', ''), 'tekrar çalışmada tedarikçiye gidiyor'),
       (_b2 + A3.replace('''    for o in t["onaylar"]:
        r = tablo.add_row().cells
        r[0].text = o["rol"]
        r[1].text = o["kisi"]
''', ''), 'onay tablosu boş')]
A4 = '''
def sure_denetle(defter, simdi, olaylar_saat, sure=48):
    uyarilar = []
    for no, t in sorted(defter.durum().items()):
        if t["durum"] != "onayda":
            continue
        son = olaylar_saat[no]
        if simdi - son >= sure:
            rol = t["kalan"][0]
            yukari = SIRA[min(SIRA.index(rol) + 1, len(SIRA) - 1)]
            uyarilar.append({"no": no, "bekleyen": rol, "yukselt": yukari, "saat": simdi - son})
    return uyarilar

def rapor(defter):
    d = defter.durum()
    say = {}
    for t in d.values():
        say[t["durum"]] = say.get(t["durum"], 0) + 1
    return {"say": say, "acik_tutar": sum(t["tutar"] for t in d.values() if t["durum"] in ("onayda", "onaylandi")), "bekleyen": {r: sorted(n for n, t in d.items() if t["durum"] == "onayda" and t["kalan"][0] == r) for r in SIRA}}
'''
A4BAS = '''
def sure_denetle(defter, simdi, olaylar_saat, sure=48):
    pass  # [{"no", "bekleyen", "yukselt", "saat"}]

def rapor(defter):
    pass  # {"say", "acik_tutar", "bekleyen": {rol: [no]}}
'''
A4T = '''import tempfile
_d = Defter(tempfile.mkdtemp() + "/o.jsonl")
for _n, _tu in [("A", 500), ("B", 50000), ("C", 200000), ("D", 700), ("E", 900)]:
    _d.ekle({"tur": "talep", "no": _n, "isteyen": "ali", "tedarikci": "x", "tutar": _tu})
    islem(_d, _n, "gonder")
islem(_d, "B", "onayla", "ayse", "yonetici")
islem(_d, "D", "onayla", "ayse", "yonetici")
islem(_d, "E", "reddet", "ayse", "yonetici")
_C = {"A": 100, "B": 90, "C": 10, "D": 100, "E": 100}
_u = sure_denetle(_d, 100, _C)
assert [x["no"] for x in _u] == ["C"], "48 saati dolduran açık talep: " + repr(_u)
assert _u[0] == {"no": "C", "bekleyen": "yonetici", "yukselt": "direktor", "saat": 90}, repr(_u[0])
_u = sure_denetle(_d, 148, _C)
assert [x["no"] for x in _u] == ["A", "B", "C"], "Tam 48 saat dahil; biten ve reddedilen yok: " + repr(_u)
assert _u[1]["bekleyen"] == "direktor" and _u[1]["yukselt"] == "cfo", "Bir üst kademe"
_d2 = Defter(tempfile.mkdtemp() + "/o.jsonl")
_d2.ekle({"tur": "talep", "no": "Z", "isteyen": "ali", "tedarikci": "x", "tutar": 200000})
islem(_d2, "Z", "gonder"); islem(_d2, "Z", "onayla", "a", "yonetici"); islem(_d2, "Z", "onayla", "b", "direktor")
assert sure_denetle(_d2, 100, {"Z": 0})[0]["yukselt"] == "cfo", "En üst kademe yine en üst"
_r = rapor(_d)
assert _r["say"] == {"onayda": 3, "onaylandi": 1, "reddedildi": 1}, repr(_r["say"])
assert _r["acik_tutar"] == 500 + 50000 + 200000 + 700, "Açık tutar: ret hariç"
assert _r["bekleyen"] == {"yonetici": ["A", "C"], "direktor": ["B"], "cfo": []}, repr(_r["bekleyen"])
'''
_b3 = _b2 + A3
A4Y = [(_b3 + A4.replace('''        if t["durum"] != "onayda":
            continue
''', '''        if not t["kalan"]:
            continue
'''), 'reddedilen talebi de yükseltiyor'),
       (_b3 + A4.replace('simdi - son >= sure', 'simdi - son > sure'), 'sınır dışarıda'),
       (_b3 + A4.replace('SIRA[min(SIRA.index(rol) + 1, len(SIRA) - 1)]', 'SIRA[SIRA.index(rol) + 1]'), 'en üst kademede patlıyor')]
YEREL = r'''"""onay.py: çok adımlı satın alma onayı. pip install python-docx
python onay.py talep T1 ali "Delta Elektronik" 50000
python onay.py gonder T1
python onay.py onayla T1 ayse yonetici
python onay.py onayla T1 veli direktor
python onay.py siparis T1
python onay.py durum"""
import argparse, hashlib, json, os, sys
from docx import Document

KAYIT = os.environ.get("KESIT_ONAY_KAYIT", "olaylar.jsonl")
LIMIT = {"yonetici": 10000, "direktor": 100000, "cfo": 10 ** 9}
SIRA = list(LIMIT)

class Gecersiz(Exception):
    pass

def gereken(tutar):
    g = []
    for r in SIRA:
        g.append(r)
        if tutar <= LIMIT[r]:
            return g
    raise Gecersiz("tutar çok yüksek")

def uygula(t, o):
    tur = o["olay"]
    if tur == "gonder" and t["durum"] == "taslak":
        return {**t, "durum": "onayda"}
    if tur in ("onayla", "reddet") and t["durum"] == "onayda":
        if o["kisi"] == t["isteyen"] or any(x["kisi"] == o["kisi"] for x in t["onaylar"]):
            raise Gecersiz("bu kişi onaylayamaz")
        if o["rol"] != t["kalan"][0]:
            raise Gecersiz("sıra " + t["kalan"][0] + " rolünde")
        if tur == "reddet":
            return {**t, "durum": "reddedildi"}
        kalan = t["kalan"][1:]
        return {**t, "kalan": kalan, "onaylar": t["onaylar"] + [{"kisi": o["kisi"], "rol": o["rol"]}], "durum": "onayda" if kalan else "onaylandi"}
    if tur == "siparis" and t["durum"] == "onaylandi":
        return {**t, "durum": "siparis_verildi"}
    raise Gecersiz(f"{t['durum']} durumunda {tur} yapılamaz")

def satirlar():
    return [json.loads(s) for s in open(KAYIT, encoding="utf-8")] if os.path.exists(KAYIT) else []

def durum():
    d, onceki = {}, ""
    for s in satirlar():
        if s["onceki"] != onceki or s["ozet"] != hashlib.sha256((onceki + json.dumps(s["o"], sort_keys=True, ensure_ascii=False)).encode()).hexdigest():
            raise SystemExit("kayıt bozulmuş: " + KAYIT)
        onceki, o = s["ozet"], s["o"]
        if o["olay"] == "talep":
            d[o["no"]] = {"isteyen": o["isteyen"], "tedarikci": o["tedarikci"], "tutar": o["tutar"], "durum": "taslak", "kalan": gereken(o["tutar"]), "onaylar": []}
        else:
            d[o["no"]] = uygula(d[o["no"]], o)
    return d

def yaz(o):
    L = satirlar()
    onceki = L[-1]["ozet"] if L else ""
    oz = hashlib.sha256((onceki + json.dumps(o, sort_keys=True, ensure_ascii=False)).encode()).hexdigest()
    with open(KAYIT, "a", encoding="utf-8") as f:
        f.write(json.dumps({"o": o, "onceki": onceki, "ozet": oz}, ensure_ascii=False) + "\n")

def belge(no, t):
    b = Document()
    b.add_heading("Satın Alma Siparişi " + no, 1)
    b.add_paragraph(f"Tedarikçi: {t['tedarikci']}, Tutar: {t['tutar']} TL")
    for x in t["onaylar"]:
        b.add_paragraph(f"{x['rol']}: {x['kisi']}")
    b.save(no + ".docx.tmp")
    os.replace(no + ".docx.tmp", no + ".docx")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("komut", choices=["talep", "gonder", "onayla", "reddet", "siparis", "durum"])
    ap.add_argument("arg", nargs="*")
    a = ap.parse_args()
    try:
        d = durum()
        if a.komut == "durum":
            for no, t in sorted(d.items()):
                print(no, t["durum"], "bekleyen:", t["kalan"][:1])
            return 0
        no = a.arg[0]
        if a.komut == "talep":
            if no in d:
                raise Gecersiz("bu numara var")
            o = {"olay": "talep", "no": no, "isteyen": a.arg[1], "tedarikci": a.arg[2], "tutar": float(a.arg[3])}
            gereken(o["tutar"])
        else:
            o = {"olay": a.komut, "no": no, "kisi": a.arg[1] if len(a.arg) > 1 else None, "rol": a.arg[2] if len(a.arg) > 2 else None}
            uygula(d[no], o)
            if a.komut == "siparis":
                belge(no, d[no])
        yaz(o)
        print(no, durum()[no]["durum"])
        return 0
    except Gecersiz as e:
        print("reddedildi:", e, file=sys.stderr)
        return 1

if __name__ == "__main__":
    sys.exit(main())
'''
if os.environ.get('P3_Y'): open(os.environ['P3_Y'] + '/onay.py', 'w').write(YEREL)
_tum = _b3 + A4
ORNEK = '''# Durum makinesi: hangi olay hangi durumda geçerli? Tablo kodun kendisi olunca kural tek yerde kalır.
GECIS = {"taslak": {"gonder": "onayda"}, "onayda": {"onayla": "onaylandi", "reddet": "reddedildi"}, "onaylandi": {"siparis": "bitti"}, "reddedildi": {}, "bitti": {}}
d = "taslak"
for olay in ["gonder", "siparis", "onayla", "siparis", "reddet"]:
    if olay in GECIS[d]:
        d = GECIS[d][olay]
        print(olay, "->", d)
    else:
        print(olay, "reddedildi:", d, "durumunda geçersiz")
'''
ders = dict(id='proje-oto-onay', lv='ileri', mod='İleri bitirme', min=90, needs=[],
 title='Otomasyon projesi: çok adımlı onaylı satın alma',
 sum='Satın alma talebini durum makinesiyle yürütürsün: tutara göre onay kademesi, görevler ayrılığı, olay kaydından yeniden hesaplanan durum, kesintiden dönüş, gerçek Word sipariş belgesi, süresi dolan onayı yükseltme.',
 goals=['İş akışını geçiş tablolu bir durum makinesiyle yazabilirim.', 'Görevler ayrılığını ve kademe sırasını kodla zorlayabilirim.', 'Durumu, değişince fark edilen bir olay kaydından yeniden kurabilirim.', 'Kesintide kaybolmayan, tekrarda çiftlenmeyen bir adım yazabilirim.', 'Word belgesi üretip içeriğini sınayabilirim.'],
 body=f'''<h2>İş</h2>
<p>Satın alma talepleri e-postayla dolaşıyor: kim onayladı belli değil, onay sırası atlanıyor, sistem kapanınca kimse nerede kaldığını bilmiyor. Tutar 10.000 TL'ye kadar yönetici, 100.000 TL'ye kadar yönetici ve direktör, üstünde CFO da onaylar. Kişiler ve tutarlar kurgudur.</p>
{pre(ORNEK)}
<h2>Tasarım</h2>
<div class="tbl-wrap"><table><tr><th>Sorun</th><th>Çözüm</th></tr><tr><td>Sıra atlanıyor</td><td>Geçiş tablosu ve kalan onay listesi</td></tr><tr><td>Kendi talebini onaylıyor</td><td>Görevler ayrılığı: isteyen onaylayamaz, aynı kişi iki kademeyi geçemez</td></tr><tr><td>Kim ne zaman?</td><td>Olay kaydı: durum tutmak yerine olayları tut, durumu hesapla</td></tr><tr><td>Sistem kapandı</td><td>Yeni süreç kayıttan aynı durumu kurar</td></tr><tr><td>Sipariş iki kez gitti</td><td>Numara anahtarıyla idempotent gönderim, yan etki kayıttan önce</td></tr><tr><td>Onaycı izinde</td><td>Süre denetimi ve üst kademeye uyarı</td></tr></table></div>
<h2>Sıra neden önemli?</h2>
<p>İki seçenek var. <b>Önce kayıt, sonra gönderim:</b> gönderimden önce süreç ölürse kayıt "verildi" der ama sipariş gitmemiştir, kimse fark etmez. <b>Önce gönderim, sonra kayıt:</b> kayıttan önce ölürse sipariş gitmiştir, yeniden çalışınca bir daha gider. İkinci hata, tedarikçi numarayı anahtar sayıyorsa zararsızdır. Bu yüzden ikinciyi seçip gönderimi idempotent yapıyoruz. Karşı taraf bunu desteklemiyorsa gerçek çözüm yoktur, insan denetimi gerekir: bunu tasarım toplantısında söyle.</p>
<h2>Kapsam dışı</h2>
<p>Burada kimlik doğrulama yok: <code>kisi</code> ve <code>rol</code> parametre olarak gelir. Gerçek sistemde bunlar oturumdan gelmeli, istemciden alınmamalı. Rol değişimi, vekâlet ve e-imza da kapsam dışıdır.</p>''',
 ex=[
 M('proje-oto-onay-m1', 'Neden durumu değil olayları saklıyoruz?', ['Kim ne yaptı görülsün', 'Dosya daha az yer kaplasın diye', 'Kod her durumda daha kısa olsun', 'Kayıtları şifrelemek kolay olsun'], 0, 'Son durum nasıl gelindiğini anlatmaz. Olay kaydı denetim izidir, durum ondan türetilir. Bedeli: kayıt büyüdükçe yeniden hesap uzar.'),
 M('proje-oto-onay-m2', 'Süreç gönderimden sonra, kayıttan önce öldü. Yeniden çalışınca ne olur?', ['Sipariş tamamen kaybolur', 'Olay kaydı bozulur', 'Tekrar gönderilir', 'Talep kendiliğinden silinir'], 2, 'Tekrar gönderilir. Karşı taraf numarayı anahtar sayıyorsa zarar yoktur.'),
 T('proje-oto-onay-t1', 'Ne yazdırır?', '''import json
a = {"kalan": ["x", "y"]}
b = dict(a)
c = json.loads(json.dumps(a))
b["kalan"].pop(0)
c["kalan"].pop(0)
print(a["kalan"])''', ["['x', 'y']", "['y']", '[]', "['x']"], 1, 'dict(a) yüzeysel kopyadır, liste ortaktır. c ayrıdır. Bu yüzden görevde derin kopya gerekir.'),
 C('proje-oto-onay-1', 'Rehberli', '<b>Durum makinesi.</b> <code>gereken_onaylar(tutar)</code>: sırayla rol ekler, tutar o rolün limiti içindeyse durur (limit dahil). <code>yeni_talep</code>: tutar pozitif değilse <code>ValueError</code>; durum <code>taslak</code>. <code>uygula(t, olay, kisi, rol)</code>: <code>GECIS</code>te yoksa <code>Gecersiz</code>. <code>onayla</code> ve <code>reddet</code> için: isteyen olamaz, rol ilk kalan rol olmalı, aynı kişi iki kez olamaz. <code>onayla</code> kalan listesinden düşer, <code>onaylar</code>a <code>{"kisi", "rol"}</code> ekler, liste bitince <code>onaylandi</code>. Girdi değişmez, iç listeler dahil.', A1BAS, A1, A1T, ['Derin kopya: json.loads(json.dumps(t))', 'Önce geçişi denetle.'], 'Kuralları tek işlevde toplamak, hangi yoldan gelinirse gelinsin aynı denetimi garanti eder.', yanlis=A1Y),
 C('proje-oto-onay-2', 'Kendin yaz', '<b>Olay kaydı.</b> <code>Defter(yol)</code>: <code>ekle(olay)</code> zincirli satır yazar (<code>olay, onceki, ozet</code>). <code>durum()</code> dosyadan <code>{no: talep}</code> kurar: <code>{"tur": "talep", "no", "isteyen", "tedarikci", "tutar"}</code> yeni talep, <code>{"tur": "olay", "no", "olay", "kisi", "rol"}</code> geçiş; zincir bozuksa <code>ValueError</code>. <code>islem(defter, no, olay, kisi, rol)</code>: önce sınar, geçersizse kayda dokunmaz, sonra yazar, güncel talebi döndürür.', _b1 + A2BAS, _b2, A2T, ['Bellekte durum tutma, her seferinde dosyadan hesapla.', 'uygula geçersizde hata yükseltir, yazmadan önce çağır.'], 'Reddedilen olayı kayda yazarsan sonraki durum() hesaplaması patlar.', yanlis=A2Y, diff=3),
 C('proje-oto-onay-3', 'Hata avı', '<b>Sipariş ve Word.</b> <code>siparis_belgesi(t, yol)</code>: başlık <code>Satın Alma Siparişi NO</code>, tedarikçi, Türkçe biçimli tutar (<code>12.345,50 TL</code>), talep eden, <code>Rol, Onaylayan</code> tablosu, atomik yazım. <code>siparis_ver(defter, no, klasor, gonder)</code>: <code>siparis_verildi</code> ise <code>"zaten"</code> ve gönderim yok; <code>onaylandi</code> değilse <code>Gecersiz</code>; belgeyi yazar, <code>gonder(no, yol)</code> çağırır, <b>sonra</b> kayda yazar, <code>"verildi"</code>. Test gönderimden hemen sonra süreci öldürür.', _b2 + A3BAS, _b3, A3T, ['Document(), add_heading, add_paragraph, add_table', 'Sıra: belge, gönderim, kayıt.'], 'Önce kayıt yazılırsa kesintide sipariş sessizce kaybolur.', yanlis=A3Y, diff=3),
 C('proje-oto-onay-4', 'Mini proje', '<b>Süre ve rapor.</b> <code>sure_denetle(defter, simdi, olaylar_saat, sure=48)</code>: <code>onayda</code> olup son olayı <code>sure</code> saat ve daha eskiyse <code>{"no", "bekleyen", "yukselt", "saat"}</code>, numaraya göre; <code>yukselt</code> bir üst rol, en üstte kendisi. <code>rapor(defter)</code>: <code>{"say", "acik_tutar", "bekleyen"}</code>: <code>acik_tutar</code> <code>onayda</code> ve <code>onaylandi</code> toplamı, <code>bekleyen</code> her rol için bekleyen numaralar.', _b3 + A4BAS, _tum, A4T, ['SIRA.index(rol) + 1, sınırı aşmasın.', 'Biten ve reddedilen talep beklemez.'], 'Onay akışının en sık arızası teknik değil, bekleyen insandır. Bunu görünür kılmak işin yarısıdır.', yanlis=A4Y, diff=2),
 Y('proje-oto-onay-y1', 'Komut satırından gerçek dosyalarla. Bu betik burada çalıştırıldı, çıktı aşağıda. Kimlik doğrulama yoktur, öğrenme içindir.', ['<code>python -m venv .venv</code>, etkinleştir, <code>python -m pip install python-docx</code>.', 'Kodu <code>onay.py</code> olarak kaydet.', 'Sırayla: <code>python onay.py talep T1 ali "Delta Elektronik" 50000</code>, <code>gonder T1</code>, <code>onayla T1 ali yonetici</code> (reddedilir, çıkış kodu 1), <code>onayla T1 ayse yonetici</code>, <code>onayla T1 veli direktor</code>, <code>siparis T1</code>.', '<code>T1.docx</code> dosyasını Word\'de aç.', '<code>olaylar.jsonl</code> içindeki tutarı elle değiştir, <code>durum</code> komutunu çalıştır: kayıt bozuk der.'], file=YEREL, fname='onay.py', cmd='python onay.py talep T1 ali Delta 50000 && python onay.py gonder T1 && python onay.py onayla T1 ayse yonetici && python onay.py onayla T1 veli direktor && python onay.py siparis T1', expect='T1 taslak\nT1 onayda\nT1 onayda\nT1 onaylandi\nT1 siparis_verildi'),
 ],
 faq=[dict(q='Bunun yerine hazır iş akışı aracı kullansak?', a='Çoğu kurumda doğrusu odur. Bu proje, o araçların ne garanti etmesi gerektiğini anlamak ve küçük işlerde hafif bir çözüm kurmak içindir.'), dict(q='Olay kaydı büyürse?', a='Belirli aralıkla anlık görüntü alınır, durum oradan devam eder. Bu proje büyüklüğünde gerekmez.')],
 mistakes=[dict(bad='t = dict(t); t["kalan"].pop(0)', good='t = json.loads(json.dumps(t))', why='Yüzeysel kopya önceki durumu da değiştirir.'), dict(bad='defter.ekle(olay); uygula(t, olay)', good='uygula(t, olay); defter.ekle(olay)', why='Geçersiz olay kayda girerse durum hesabı patlar.'), dict(bad='if rol in LIMIT: onayla()', good='if rol == t["kalan"][0]: onayla()', why='Rolün var olması sıranın ona geldiği anlamına gelmez.')])
yaz('proje-oto-onay', 'Otomasyon projesi: onaylı akış', ders)
