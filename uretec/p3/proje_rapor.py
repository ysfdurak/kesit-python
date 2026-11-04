#!/usr/bin/env python3
"""proje-rapor-ajani: anadolu_market üstünde sabit SQL araçlarıyla rapor. Model sahte; sayı denetimi uydurma rakamı yakalar."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ortak import C, M, T, Y, pre, kod, yaz

R1 = '''import json, re, os
import veri

CIRO = "SUM(i.quantity * i.unit_price * (1 - i.discount))"

def aylik_ciro(con, ay):
    if not re.fullmatch(r"\\d{4}-\\d{2}", str(ay)):
        raise ValueError("ay biçimi YYYY-AA olmalı")
    r = con.execute(f"""SELECT ROUND({CIRO}, 2), COUNT(DISTINCT o.order_id)
        FROM orders o JOIN order_items i ON i.order_id = o.order_id
        WHERE substr(o.order_date, 1, 7) = ? AND o.status != 'cancelled'""", (ay,)).fetchone()
    return {"ay": ay, "ciro": r[0] or 0.0, "siparis": r[1]}

def kategori_ciro(con, ay):
    aylik_ciro(con, ay)
    s = con.execute(f"""SELECT p.category, ROUND({CIRO}, 2)
        FROM orders o JOIN order_items i ON i.order_id = o.order_id JOIN products p ON p.product_id = i.product_id
        WHERE substr(o.order_date, 1, 7) = ? AND o.status != 'cancelled'
        GROUP BY p.category ORDER BY 2 DESC, 1""", (ay,)).fetchall()
    return [{"kategori": a, "ciro": b} for a, b in s]

def iade_orani(con, ay):
    aylik_ciro(con, ay)
    r = con.execute("""SELECT SUM(status = 'returned'), COUNT(*) FROM orders
        WHERE substr(order_date, 1, 7) = ? AND status != 'cancelled'""", (ay,)).fetchone()
    return {"ay": ay, "oran": round((r[0] or 0) / r[1], 4) if r[1] else 0.0}
'''
R1BAS = '''import json, re, os
import veri

CIRO = "SUM(i.quantity * i.unit_price * (1 - i.discount))"

def aylik_ciro(con, ay):
    pass  # {"ay", "ciro", "siparis"}; biçim yanlışsa ValueError

def kategori_ciro(con, ay):
    pass  # [{"kategori", "ciro"}] çok olandan aza

def iade_orani(con, ay):
    pass  # {"ay", "oran"}
'''
R1T = '''_c = veri.baglan("anadolu_market", ["orders", "order_items", "products"])
_o = veri.oku("anadolu_market", "orders"); _i = veri.oku("anadolu_market", "order_items"); _p = veri.oku("anadolu_market", "products")
_o["ay"] = _o["order_date"].astype(str).str[:7]
_m = _i.merge(_o, on="order_id").merge(_p, on="product_id")
_m["c"] = _m["quantity"] * _m["unit_price_x" if "unit_price_x" in _m else "unit_price"] * (1 - _m["discount"])
for _a in ["2024-11", "2024-03", "2023-07"]:
    _f = _m[(_m["ay"] == _a) & (_m["status"] != "cancelled")]
    _r = aylik_ciro(_c, _a)
    assert abs(_r["ciro"] - _f["c"].sum()) < 0.01, f"{_a} cirosu: {round(_f['c'].sum(), 2)} olmalı, senin {_r['ciro']}"
    assert _r["siparis"] == _f["order_id"].nunique(), f"{_a} sipariş sayısı"
    _k = _f.groupby("category")["c"].sum().sort_values(ascending=False)
    _s = kategori_ciro(_c, _a)
    assert [x["kategori"] for x in _s] == list(_k.index), "Kategori sırası"
    assert abs(sum(x["ciro"] for x in _s) - _k.sum()) < 0.05, "Kategori toplamı"
    _oo = _o[(_o["ay"] == _a) & (_o["status"] != "cancelled")]
    assert iade_orani(_c, _a)["oran"] == round((_oo["status"] == "returned").mean(), 4), "İade oranı: paydada iptal yok"
assert aylik_ciro(_c, "1999-01") == {"ay": "1999-01", "ciro": 0.0, "siparis": 0}, "Boş ay: sıfır"
assert iade_orani(_c, "1999-01")["oran"] == 0.0 and kategori_ciro(_c, "1999-01") == [], "Boş ay"
for _f2 in [aylik_ciro, kategori_ciro, iade_orani]:
    for _bad in ["2024-11' OR 1=1 --", "2024", 202411]:
        try:
            _f2(_c, _bad)
            raise AssertionError("Biçimsiz ay reddedilmeli: " + repr(_bad))
        except ValueError:
            pass
'''
R1Y = [(R1.replace(" AND o.status != 'cancelled'", ""), 'iptali ciroya katıyor'),
       (R1.replace("(1 - i.discount)", "1"), 'indirim yok'),
       (R1.replace("COUNT(DISTINCT o.order_id)", "COUNT(*)"), 'kalem sayısını sipariş sanıyor'),
       (R1.replace("    aylik_ciro(con, ay)\n", ""), 'iki araçta biçim denetimi yok'),
       (R1.replace('''        WHERE substr(order_date, 1, 7) = ? AND status != 'cancelled\'""", (ay,))''', '''        WHERE substr(order_date, 1, 7) = ?""", (ay,))'''), 'iade paydasında iptal var')]
R2 = '''
SAYI = re.compile(r"(?<![\\w.,])\\d{1,3}(?:\\.\\d{3})+(?:,\\d+)?|(?<![\\w.,])\\d+(?:[.,]\\d+)?")

def sayi_coz(s):
    if "." in s and "," in s:
        s = s.replace(".", "").replace(",", ".")
    elif "," in s:
        s = s.replace(",", ".")
    elif re.fullmatch(r"\\d{1,3}(\\.\\d{3})+", s):
        s = s.replace(".", "")
    return float(s)

def gozlem_sayilari(v, cikti=None):
    cikti = set() if cikti is None else cikti
    if isinstance(v, bool):
        return cikti
    if isinstance(v, (int, float)):
        cikti.add(round(float(v), 2))
    elif isinstance(v, dict):
        for x in v.values():
            gozlem_sayilari(x, cikti)
    elif isinstance(v, (list, tuple)):
        for x in v:
            gozlem_sayilari(x, cikti)
    return cikti

def uydurma_sayilar(metin, gozlemler, izinli=()):
    bilinen = gozlem_sayilari(gozlemler) | {round(float(i), 2) for i in izinli}
    temiz = re.sub(r"\\b\\d{4}-\\d{2}\\b", " ", metin)
    bulunan = [sayi_coz(m.group()) for m in SAYI.finditer(temiz)]
    return [s for s in bulunan if not any(abs(s - b) <= 0.01 for b in bilinen)]
'''
R2BAS = '''
def uydurma_sayilar(metin, gozlemler, izinli=()):
    # Metindeki sayılardan gözlemlerde bulunmayanların listesi. Türkçe biçim: 12.345,60 ve 450
    pass
'''
R2T = '''_G = [{"ay": "2024-11", "ciro": 12345.6, "siparis": 42}, [{"kategori": "Kitap", "ciro": 800.5}], {"oran": 0.0714}]
assert uydurma_sayilar("Kasım cirosu 12.345,60 TL, 42 sipariş.", _G) == [], "Türkçe biçimli doğru sayı"
assert uydurma_sayilar("2024-11 ayında ciro 12345.6 TL", _G) == [], "Ay etiketi sayı sayılmaz, düz biçim de geçer"
assert uydurma_sayilar("Kitap 800,50 TL getirdi.", _G) == [], "İç içe gözlem"
assert uydurma_sayilar("Ciro 13.000,00 TL oldu.", _G) == [13000.0], "Uydurma sayı yakalanmalı: " + repr(uydurma_sayilar("Ciro 13.000,00 TL oldu.", _G))
assert uydurma_sayilar("42 sipariş ve 43 müşteri.", _G) == [43.0], "Yalnız uydurma olan döner"
assert uydurma_sayilar("Ciro 12.345 TL", _G) == [12345.0], "Yuvarlanmış sayı doğrulanmaz, kaynakta yok"
assert uydurma_sayilar("İlk 3 kategori", _G, izinli=[3]) == [], "İzinli sayı"
assert uydurma_sayilar("İlk 3 kategori", _G) == [3.0], "İzin yoksa 3 de uydurmadır"
assert uydurma_sayilar("Rakam yok.", _G) == [], "Sayı yoksa boş"
assert uydurma_sayilar("Oran 0,0714.", _G) == [], "Oran"
assert uydurma_sayilar("Doğru: True", [{"x": True}]) == [], "Mantıksal değer sayı değildir"
assert uydurma_sayilar("1 adet", [{"x": True}]) == [1.0], "True, 1 sayılmamalı"
'''
_R = lambda a, b: R1 + R2.replace(a, b)
R2Y = [(_R('''    return [s for s in bulunan if not any(abs(s - b) <= 0.01 for b in bilinen)]''', '''    return [s for s in bulunan if not any(abs(s - b) <= max(1, b * 0.01) for b in bilinen)]'''), 'yuvarlamaya ve %1 farka izin veriyor'),
       (_R('''    if isinstance(v, bool):
        return cikti
''', ''), 'True değerini 1 sayıyor'),
       (_R('''    temiz = re.sub(r"\\b\\d{4}-\\d{2}\\b", " ", metin)\n''', '''    temiz = metin\n'''), 'ay etiketini sayı sanıyor'),
       ('''import re
def uydurma_sayilar(metin, gozlemler, izinli=()):
    return []
''', 'denetlemiyor')]
R3 = '''
class SahteModel:
    """Gerçek LLM değil: senaryodaki cevapları sırayla verir, senaryo biterse sonuncuyu tekrarlar."""
    def __init__(self, senaryo):
        self.senaryo, self.cagri = list(senaryo), 0

    def yanit(self, mesajlar):
        a = self.senaryo[min(self.cagri, len(self.senaryo) - 1)]
        self.cagri += 1
        return a(mesajlar) if callable(a) else a

def rapor_ajani(model, con, istek, en_cok=6):
    araclar = {"aylik_ciro": aylik_ciro, "kategori_ciro": kategori_ciro, "iade_orani": iade_orani}
    mesajlar, gozlemler = [{"rol": "kullanici", "metin": istek}], []
    for _ in range(en_cok):
        y = model.yanit(mesajlar)
        if "cevap" in y:
            if not gozlemler:
                return {"durum": "veri_yok", "metin": None, "gozlem": []}
            kalan = uydurma_sayilar(y["cevap"], gozlemler)
            if kalan:
                mesajlar.append({"rol": "denetim", "sonuc": {"hata": "kaynakta olmayan sayı", "sayilar": kalan}})
                continue
            return {"durum": "tamam", "metin": y["cevap"], "gozlem": gozlemler}
        ad = y["arac"]
        if ad not in araclar:
            mesajlar.append({"rol": "arac", "ad": ad, "sonuc": {"hata": "bilinmeyen araç"}})
            continue
        try:
            s = araclar[ad](con, **y["girdi"])
            gozlemler.append(s)
            mesajlar.append({"rol": "arac", "ad": ad, "sonuc": s})
        except (ValueError, TypeError) as e:
            mesajlar.append({"rol": "arac", "ad": ad, "sonuc": {"hata": str(e)}})
    return {"durum": "adim_siniri", "metin": None, "gozlem": gozlemler}
'''
R3BAS = '''
class SahteModel:
    """Gerçek LLM değil: senaryodaki cevapları sırayla verir, senaryo biterse sonuncuyu tekrarlar."""
    def __init__(self, senaryo):
        self.senaryo, self.cagri = list(senaryo), 0

    def yanit(self, mesajlar):
        a = self.senaryo[min(self.cagri, len(self.senaryo) - 1)]
        self.cagri += 1
        return a(mesajlar) if callable(a) else a

def rapor_ajani(model, con, istek, en_cok=6):
    pass  # {"durum": "tamam" | "veri_yok" | "adim_siniri", "metin", "gozlem"}
'''
R3T = '''_c = veri.baglan("anadolu_market", ["orders", "order_items", "products"])
_a = aylik_ciro(_c, "2024-11")
_tr = lambda x: f"{x:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
_A = lambda **k: {"arac": "aylik_ciro", "girdi": {"ay": "2024-11"}, **k}
_dogru = "Kasım cirosu " + _tr(_a["ciro"]) + " TL, " + str(_a["siparis"]) + " sipariş."
_r = rapor_ajani(SahteModel([_A(), {"cevap": _dogru}]), _c, "kasım raporu")
assert _r["durum"] == "tamam" and _r["metin"] == _dogru and _r["gozlem"] == [_a], "Doğru rapor: " + repr(_r["durum"])
_m = SahteModel([_A(), {"cevap": "Kasım cirosu 99.999,00 TL."}, {"cevap": _dogru}])
_r = rapor_ajani(_m, _c, "kasım")
assert _r["durum"] == "tamam" and _r["metin"] == _dogru and _m.cagri == 3, "Uydurma sayı reddedilip düzeltme istenir"
_gor = []
def _kay(m):
    _gor.append(m[-1])
    return {"cevap": _dogru}
rapor_ajani(SahteModel([_A(), {"cevap": "1.234,00 TL"}, _kay]), _c, "x")
assert _gor[0]["sonuc"]["sayilar"] == [1234.0], "Model hangi sayının reddedildiğini görür: " + repr(_gor)
_r = rapor_ajani(SahteModel([_A(), {"cevap": "Ciro 99.999,00 TL."}]), _c, "x")
assert _r["durum"] == "adim_siniri" and _r["metin"] is None, "Düzeltmeyen model: rapor çıkmaz"
_r = rapor_ajani(SahteModel([{"cevap": "Her şey harika gidiyor."}]), _c, "x")
assert _r["durum"] == "veri_yok" and _r["metin"] is None, "Hiç araç çağırmadan rapor olmaz"
_m = SahteModel([{"arac": "aylik_ciro", "girdi": {"ay": "kasım"}}, _A(), {"cevap": _dogru}])
_r = rapor_ajani(_m, _c, "x")
assert _r["durum"] == "tamam" and len(_r["gozlem"]) == 1, "Hatalı araç çağrısı düzeltilebilir, gözlem olmaz"
_m = SahteModel([{"arac": "sql_calistir", "girdi": {"q": "DROP TABLE orders"}}, _A(), {"cevap": _dogru}])
_r = rapor_ajani(_m, _c, "x")
assert _r["durum"] == "tamam" and _c.execute("select count(*) from orders").fetchone()[0] > 0, "Serbest SQL aracı yok"
'''
_b2 = R1 + R2
R3Y = [(_b2 + R3.replace('''            kalan = uydurma_sayilar(y["cevap"], gozlemler)
            if kalan:
                mesajlar.append({"rol": "denetim", "sonuc": {"hata": "kaynakta olmayan sayı", "sayilar": kalan}})
                continue
''', ''), 'modelin rakamına güveniyor'),
       (_b2 + R3.replace('''            if not gozlemler:
                return {"durum": "veri_yok", "metin": None, "gozlem": []}
''', ''), 'araçsız raporu kabul ediyor'),
       (_b2 + R3.replace('''araclar = {"aylik_ciro": aylik_ciro, "kategori_ciro": kategori_ciro, "iade_orani": iade_orani}''', '''araclar = {"aylik_ciro": aylik_ciro, "kategori_ciro": kategori_ciro, "iade_orani": iade_orani, "sql_calistir": lambda con, q: con.executescript(q) and {}}'''), 'serbest SQL aracı ekliyor')]
R4 = '''
from openpyxl import Workbook, load_workbook

def rapor_dosyasi(con, ay, klasor, model):
    os.makedirs(klasor, exist_ok=True)
    yol = os.path.join(klasor, f"rapor_{ay}.xlsx")
    if os.path.exists(yol):
        return {"durum": "zaten_var", "yol": yol}
    r = rapor_ajani(model, con, ay + " aylık raporu")
    if r["durum"] != "tamam":
        return {"durum": r["durum"], "yol": None}
    wb = Workbook()
    oz = wb.active
    oz.title = "Özet"
    oz["A1"] = "Ay"
    oz["B1"] = ay
    oz["A2"] = "Ciro"
    oz["B2"] = aylik_ciro(con, ay)["ciro"]
    oz["A3"] = "Yorum"
    oz["B3"] = r["metin"]
    ka = wb.create_sheet("Kategori")
    ka.append(["Kategori", "Ciro"])
    s = kategori_ciro(con, ay)
    for x in s:
        ka.append([x["kategori"], x["ciro"]])
    ka.append(["Toplam", f"=SUM(B2:B{len(s) + 1})"])
    gecici = yol + ".tmp"
    wb.save(gecici)
    os.replace(gecici, yol)
    return {"durum": "tamam", "yol": yol}
'''
R4BAS = '''
from openpyxl import Workbook, load_workbook

def rapor_dosyasi(con, ay, klasor, model):
    pass
'''
R4T = '''import tempfile
_c = veri.baglan("anadolu_market", ["orders", "order_items", "products"])
_d = tempfile.mkdtemp()
_a = aylik_ciro(_c, "2024-11")
_tr = lambda x: f"{x:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
_ok = lambda: SahteModel([{"arac": "aylik_ciro", "girdi": {"ay": "2024-11"}}, {"cevap": "Ciro " + _tr(_a["ciro"]) + " TL."}])
_r = rapor_dosyasi(_c, "2024-11", _d, _ok())
assert _r["durum"] == "tamam" and os.path.basename(_r["yol"]) == "rapor_2024-11.xlsx", repr(_r)
_w = load_workbook(_r["yol"])
assert _w.sheetnames == ["Özet", "Kategori"], "Sayfalar: " + repr(_w.sheetnames)
assert _w["Özet"]["B2"].value == _a["ciro"] and _w["Özet"]["B1"].value == "2024-11", "Özet doğrudan veriden"
assert _tr(_a["ciro"]) in _w["Özet"]["B3"].value, "Yorum yazılmalı"
_K = kategori_ciro(_c, "2024-11")
_ws = _w["Kategori"]
assert [c.value for c in _ws[1]] == ["Kategori", "Ciro"] and _ws["A2"].value == _K[0]["kategori"] and _ws["B2"].value == _K[0]["ciro"], "Kategori sayfası"
assert _ws.cell(len(_K) + 2, 1).value == "Toplam" and _ws.cell(len(_K) + 2, 2).value == f"=SUM(B2:B{len(_K) + 1})", "Toplam gerçek Excel formülü olmalı"
_z = os.path.getmtime(_r["yol"]); _m = _ok()
assert rapor_dosyasi(_c, "2024-11", _d, _m)["durum"] == "zaten_var" and _m.cagri == 0, "Aynı ay yeniden üretilmez, model de çağrılmaz"
_r = rapor_dosyasi(_c, "2024-10", _d, SahteModel([{"arac": "aylik_ciro", "girdi": {"ay": "2024-10"}}, {"cevap": "Ciro 1,00 TL."}]))
assert _r["durum"] == "adim_siniri" and _r["yol"] is None, "Denetimden geçmeyen rapor yazılmaz"
assert not [f for f in os.listdir(_d) if "2024-10" in f], "Başarısız raporun dosyası kalmamalı: " + repr(os.listdir(_d))
assert not [f for f in os.listdir(_d) if f.endswith(".tmp")], "Geçici dosya kalmamalı"
'''
_b3 = _b2 + R3
R4Y = [(_b3 + R4.replace('''f"=SUM(B2:B{len(s) + 1})"''', '''sum(x["ciro"] for x in s)'''), 'sabit toplam, formül değil'),
       (_b3 + R4.replace('''    if os.path.exists(yol):
        return {"durum": "zaten_var", "yol": yol}
''', ''), 'her seferinde yeniden üretiyor'),
       (_b3 + R4.replace('''    if r["durum"] != "tamam":
        return {"durum": r["durum"], "yol": None}
''', '''    if r["durum"] != "tamam":
        r["metin"] = "rapor üretilemedi"
''').replace('return {"durum": "tamam", "yol": yol}', 'return {"durum": r["durum"], "yol": None if r["durum"] != "tamam" else yol}'), 'başarısız raporun dosyasını da yazıyor')]
YEREL = r'''"""rapor_ajani.py: aylık rapor. Varsayılan sahte model; --gercek ile anthropic. Veri aynı klasördeki satis.db dosyasından.
Önce: python rapor_ajani.py --kur"""
import argparse, json, os, re, sqlite3, sys

DB = "satis.db"
ARACLAR = [{"name": "aylik_ciro", "description": "Bir ayın cirosunu döndürür.", "input_schema": {"type": "object", "properties": {"ay": {"type": "string", "description": "YYYY-AA"}}, "required": ["ay"], "additionalProperties": False}}]

def kur():
    c = sqlite3.connect(DB)
    c.executescript("DROP TABLE IF EXISTS satis; CREATE TABLE satis(ay TEXT, tutar REAL);")
    c.executemany("INSERT INTO satis VALUES (?,?)", [("2024-11", 1200.5), ("2024-11", 800.0), ("2024-10", 950.0)])
    c.commit()
    print("satis.db hazır")

def aylik_ciro(ay):
    if not re.fullmatch(r"\d{4}-\d{2}", ay):
        raise ValueError("ay biçimi YYYY-AA olmalı")
    c = sqlite3.connect(f"file:{DB}?mode=ro", uri=True)   # salt okunur bağlantı
    return {"ay": ay, "ciro": c.execute("SELECT ROUND(COALESCE(SUM(tutar), 0), 2) FROM satis WHERE ay = ?", (ay,)).fetchone()[0]}

def uydurma(metin, gozlemler):
    bilinen = {round(float(v), 2) for g in gozlemler for v in g.values() if isinstance(v, (int, float))}
    temiz = re.sub(r"\b\d{4}-\d{2}\b", " ", metin).replace(".", "").replace(",", ".")
    return [float(s) for s in re.findall(r"\d+(?:\.\d+)?", temiz) if round(float(s), 2) not in bilinen]

def sahte(mesajlar, gozlemler):
    """Gerçek LLM değil: önce aracı ister, sonra gözlemi yazar."""
    if not gozlemler:
        return {"arac": "aylik_ciro", "girdi": {"ay": "2024-11"}}
    return {"cevap": f"{gozlemler[-1]['ay']} cirosu {gozlemler[-1]['ciro']:.2f}".replace(".", ",") + " TL."}

def gercek(mesajlar, gozlemler, durum={}):
    import anthropic
    istemci = durum.setdefault("i", anthropic.Anthropic())
    y = istemci.messages.create(model=os.environ["KESIT_MODEL"], max_tokens=300, tools=ARACLAR, messages=mesajlar,
                                system="Sayıları yalnız araç sonucundan al. Türkçe bir cümlelik rapor yaz.")
    mesajlar.append({"role": "assistant", "content": y.content})
    for b in y.content:
        if b.type == "tool_use":
            return {"arac": b.name, "girdi": b.input, "id": b.id}
    return {"cevap": "".join(b.text for b in y.content if b.type == "text")}

def calistir(model, istek, en_cok=5):
    mesajlar, gozlemler = [{"role": "user", "content": istek}], []
    for _ in range(en_cok):
        y = model(mesajlar, gozlemler)
        if "cevap" in y:
            if not gozlemler:
                return "veri_yok", None
            k = uydurma(y["cevap"], gozlemler)
            if k:
                mesajlar.append({"role": "user", "content": f"Şu sayılar araç sonucunda yok: {k}. Düzelt."})
                continue
            return "tamam", y["cevap"]
        try:
            s = aylik_ciro(**y["girdi"])
            gozlemler.append(s)
            sonuc, hata = json.dumps(s), False
        except (ValueError, TypeError) as e:
            sonuc, hata = str(e), True
        mesajlar.append({"role": "user", "content": [{"type": "tool_result", "tool_use_id": y.get("id", "sahte"), "content": sonuc, "is_error": hata}]})
    return "adim_siniri", None

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--kur", action="store_true")
    ap.add_argument("--gercek", action="store_true")
    a = ap.parse_args()
    if a.kur:
        kur()
        sys.exit()
    if a.gercek and not (os.environ.get("ANTHROPIC_API_KEY") and os.environ.get("KESIT_MODEL")):
        sys.exit("ANTHROPIC_API_KEY ve KESIT_MODEL ortam değişkenlerini ayarla")
    print(*calistir(gercek if a.gercek else sahte, "2024-11 ayının cirosunu raporla."))
'''
open(os.environ.get('P3_RAPOR_YEREL', '/dev/null'), 'w').write(YEREL)
ORNEK = '''# Modelin yazdığı raporda her sayının kaynağı var mı? Bu denetim modelden bağımsızdır.
import re
gozlem = {"ciro": 12345.6, "siparis": 42}
for metin in ["Ciro 12.345,60 TL, 42 sipariş.", "Ciro 13.000,00 TL, 42 sipariş."]:
    sayilar = [float(s.replace(".", "").replace(",", ".")) for s in re.findall(r"\\d[\\d.,]*\\d|\\d", metin)]
    print(metin, "->", "geçti" if all(s in gozlem.values() for s in sayilar) else "uydurma sayı var")
'''
ders = dict(id='proje-rapor-ajani', lv='ileri', mod='İleri bitirme', min=90, needs=['pandas', 'sqlite3'],
 title='Bitirme projesi: raporlama ajanı',
 sum='Anadolu Market verisinde sabit SQL araçlarıyla aylık rapor yazan ajan kurarsın. Modelin metnindeki her sayı araç sonucuyla karşılaştırılır; uydurma rakam reddedilir, rapor gerçek Excel dosyası olur.',
 goals=['Serbest SQL yerine sabit ve parametreli araçlar tasarlayabilirim.', 'Metindeki sayıları Türkçe biçimiyle çözüp kaynakla karşılaştırabilirim.', 'Düzeltme döngüsü ve adım sınırı olan bir rapor ajanı yazabilirim.', 'Sonucu formüllü bir Excel dosyasına atomik yazabilirim.'],
 body=f'''<div class="note"><b>Model yine sahte</b>Tarayıcıda LLM çağrısı yok. Görevlerdeki <code>SahteModel</code> senaryoya yazılan cevapları verir; bazıları bilerek yanlış rakam içerir. Ölçtüğümüz şey yazı kalitesi değil, <b>yanlış rakamın rapora girememesi</b>. Veri gerçek <code>anadolu_market</code> setidir.</div>
<h2>İş</h2>
<p>Yönetim her ay kısa bir ciro yorumu istiyor. Modele "raporu yaz" demek kolay, ama dil modeli akıcı cümle içinde yanlış sayı yazabilir ve okuyan fark etmez. Bu projede güven modele değil denetime dayanır.</p>
{pre(ORNEK)}
<h2>İki karar</h2>
<p><b>Serbest SQL aracı yok.</b> <b>llm-ajanlar</b> dersinde metinden SQL gördün; orada salt okunur denetim ve doğrulama gerekiyordu. Raporlamada soru kümesi bellidir: üç sabit araç, ay parametresi, hepsi biçim denetimli. Kapsam daralır, risk daha çok daralır. Yeni bir soru gelince yeni araç yazarsın; bu da bilinçli bir bedeldir.</p>
<p><b>Sayıyı denetim doğrular, yorum modele kalır.</b> Metindeki sayılar çıkarılır, araç sonuçlarıyla karşılaştırılır. Yuvarlama da uydurma sayılır: 12.345,60 için "12.345" kabul edilmez. Bu sıkı bir seçim; istersen "yaklaşık 12 bin" gibi yazımlara izin veren bir kural koyarsın, ama ne kadar gevşettiğini bil.</p>
<h2>Bu denetim neyi yakalamaz?</h2>
<p>Sayı doğru ama yorum yanlış olabilir: düşüşe "artış" diyebilir, doğru rakamı yanlış aya yazabilir, 42 siparişi 42 müşteri sanabilir. Sayı denetimi tek bir hata türünü kapatır. Yönü denetlemek için geçen ayı da araçtan alıp "arttı" ve "azaldı" kelimelerini ayrıca sınayabilirsin. Önemli raporlarda son göz yine insandır.</p>
<h2>Adımlar</h2>
<ol><li>Üç sabit araç: bağımsız pandas hesabıyla sınanır.</li><li>Sayı denetimi: Türkçe biçim, iç içe gözlem, ay etiketi.</li><li>Ajan döngüsü: rakamı reddet, düzeltme iste, sınırda dur.</li><li>Excel raporu: formüllü, atomik, aynı ay ikinci kez üretilmez.</li></ol>''',
 ex=[
 M('proje-rapor-ajani-m1', 'Rapor ajanında serbest SQL aracı yerine sabit araçların bedeli nedir?', ['Verinin tamamı silinebilir', 'Yeni soru için yeni araç', 'Hiç bedeli yoktur', 'Model daha çok uydurur'], 1, 'Esneklik azalır. Karşılığında yanlış tablo, ağır sorgu ve yıkıcı komut riski düşer.'),
 M('proje-rapor-ajani-m2', 'Araç 12345.6 döndürdü, model "yaklaşık 12 bin" yazdı. Bu dersteki denetim ne yapar?', ['Geçirir: yakın sayılır', 'Modeli kapatır', 'Reddeder: 12 yok', 'Sayıyı kendi düzeltir'], 2, 'Sıkı denetim yalnız kaynaktaki sayıları kabul eder. Daha gevşek bir kural istersen bunu bilinçli yazarsın.'),
 M('proje-rapor-ajani-m3', 'Sayı denetiminden geçen raporda hangi hata hâlâ olabilir?', ['Ciro rakamını uydurmak', 'Kaynakta olmayan bir tutar', 'Yuvarlanmış bir tutar yazmak', 'Düşüşe artış demek'], 3, 'Denetim sayının kaynağını sınar, cümlenin anlamını sınamaz.'),
 T('proje-rapor-ajani-t1', 'Ne yazdırır?', '''import re
m = "2024-11 ayında 42 sipariş"
print(re.findall(r"\\d+", re.sub(r"\\b\\d{4}-\\d{2}\\b", " ", m)))''', ["['2024', '11', '42']", "['42']", "['2024-11', '42']", '[]'], 1, 'Önce ay etiketi temizlenir, geriye 42 kalır. Temizlemeseydik 2024 ve 11 uydurma sayılırdı.'),
 C('proje-rapor-ajani-1', 'Rehberli', '<b>Sabit araçlar.</b> <code>con = veri.baglan("anadolu_market", ["orders", "order_items", "products"])</code>. Ciro: <code>quantity * unit_price * (1 - discount)</code>, iptal (<code>cancelled</code>) hariç. <code>aylik_ciro(con, ay)</code>: <code>{"ay", "ciro", "siparis"}</code>. <code>kategori_ciro(con, ay)</code>: <code>[{"kategori", "ciro"}]</code> çoktan aza. <code>iade_orani(con, ay)</code>: <code>{"ay", "oran"}</code>: iptal dışı siparişlerde <code>returned</code> payı, 4 basamak. Ciro 2 basamak. Üç araç da <code>YYYY-AA</code> dışındaki ayda <code>ValueError</code>; boş ayda sıfır döner.', R1BAS, R1, R1T, ['substr(order_date, 1, 7) = ?', 'COUNT(DISTINCT o.order_id): birleştirme satırları çoğaltır.', 're.fullmatch ile ayı denetle, str(ay) kullan.'], 'Test beklenenleri pandas ile ayrı hesaplıyor: iki yol aynı sonucu vermeli.', yanlis=R1Y),
 C('proje-rapor-ajani-2', 'Kendin yaz', '<b>Sayı denetimi.</b> <code>uydurma_sayilar(metin, gozlemler, izinli=())</code>: metindeki sayılardan gözlemlerde karşılığı olmayanları <code>float</code> listesi döndürür. Biçimler: <code>12.345,60</code>, <code>12.345</code> (binlik), <code>800,5</code>, <code>12345.6</code>. <code>2024-11</code> gibi ay etiketleri sayı değildir. Gözlemler iç içe sözlük ve liste olabilir, <code>True</code> sayı değildir. Eşleşme 0,01 toleranslı.', _b2.replace(R2, '') + R2BAS, _b2, R2T, ['Önce ay etiketlerini re.sub ile sil.', 'Hem nokta hem virgül varsa nokta binliktir.', 'isinstance(True, int) doğrudur, bool\'u önce ele.'], 'Tek bir yanlış rakam raporun tamamına güveni bitirir. Kontrol modelden bağımsız olmalı.', yanlis=R2Y, diff=3),
 C('proje-rapor-ajani-3', 'Kendin yaz', '<b>Ajan döngüsü.</b> <code>rapor_ajani(model, con, istek, en_cok=6)</code>. Model <code>{"arac", "girdi"}</code> ya da <code>{"cevap"}</code> döndürür. Yalnız üç araç vardır; bilinmeyen araç ve araç hatası sonuç olarak döner, gözlem sayılmaz. Hiç gözlem yokken cevap: <code>veri_yok</code>. Cevapta uydurma sayı varsa mesajlara <code>{"rol": "denetim", "sonuc": {"hata": ..., "sayilar": [...]}}</code> ekle, modele tekrar sor. Adımlar biterse <code>adim_siniri</code>, <code>metin</code> <code>None</code>.', _b2 + R3BAS, _b3, R3T, ['Gözlemleri ayrı listede biriktir.', 'continue ile döngüye dön, adım sayılır.'], 'Reddedilen sayıyı modele söylemek düzeltme şansı verir. Düzeltmezse rapor çıkmaz, boş kalmak yanlış rakamdan iyidir.', yanlis=R3Y, diff=3),
 C('proje-rapor-ajani-4', 'Mini proje', '<b>Excel raporu.</b> <code>rapor_dosyasi(con, ay, klasor, model)</code>: <code>rapor_AY.xlsx</code> varsa modeli çağırmadan <code>{"durum": "zaten_var", "yol"}</code>. Ajan başarısızsa dosya yazmadan <code>{"durum": ..., "yol": None}</code>. Başarılıysa: <code>Özet</code> sayfası (<code>B1</code> ay, <code>B2</code> doğrudan veriden ciro, <code>B3</code> yorum), <code>Kategori</code> sayfası (başlık, satırlar, son satırda <code>Toplam</code> ve gerçek <code>SUM</code> formülü). Önce geçici dosyaya yaz, <code>os.replace</code> ile taşı.', _b3 + R4BAS, _b3 + R4, R4T, ['Ciroyu modelden değil aylik_ciro\'dan yaz.', 'Toplam satırı len(s) + 2\'dedir.', 'wb.save(gecici); os.replace(gecici, yol)'], 'Atomik yazma yarım dosya bırakmaz. "Zaten var" denetimi tekrar çalışmayı ücretsiz yapar.', yanlis=R4Y, diff=2),
 Y('proje-rapor-ajani-y1', 'Komut satırı sürümü. Sahte modelle burada çalıştırıldı, çıktı aşağıda. <code>--gercek</code> yolu burada yalnız yerel sahte bir HTTP sunucusuna karşı <code>anthropic</code> 2.5.0 ile sınandı. Gerçek modelle ücretlidir, anahtarı koda yazma.', ['<code>python rapor_ajani.py --kur</code> ile küçük veritabanını oluştur. Sahte model için paket gerekmez.', '<code>python rapor_ajani.py</code> ile çalıştır.', 'Gerçek model için <code>python -m pip install anthropic</code>, ortam değişkenlerini ayarla: <code>ANTHROPIC_API_KEY</code>, <code>KESIT_MODEL</code>. Sonra <code>python rapor_ajani.py --gercek</code>.', '<code>sahte</code> işlevini yanlış sayı yazacak biçimde değiştir: <code>adim_siniri</code> görmelisin.'], file=YEREL, fname='rapor_ajani.py', cmd='python rapor_ajani.py --kur && python rapor_ajani.py', expect='satis.db hazır\ntamam 2024-11 cirosu 2000,50 TL.'),
 ],
 faq=[dict(q='Sayı denetimi her raporda şart mı?', a='Rakamın karar için kullanıldığı raporda evet. Modeller akıcı biçimde yanlış sayı yazabilir ve bu okurken göze çarpmaz.'), dict(q='Yuvarlamaya neden izin vermiyoruz?', a='Basit tutmak ve uydurmayı yakalamak için. Gerçek sistemde "yaklaşık" yazımına izin veren bir kural yazabilirsin, ama ne kadar gevşediğini bilerek.')],
 mistakes=[dict(bad='araclar["sql"] = lambda q: con.execute(q).fetchall()', good='araclar = {"aylik_ciro": aylik_ciro, ...}', why='Serbest SQL raporlama için gereksiz bir yetkidir.'), dict(bad='ws["B2"] = model_cevabindan_cikan_ciro', good='ws["B2"] = aylik_ciro(con, ay)["ciro"]', why='Tablodaki sayı modelden değil kaynaktan gelmeli.'), dict(bad='wb.save(yol)', good='wb.save(yol + ".tmp"); os.replace(yol + ".tmp", yol)', why='Yarıda kesilen yazma bozuk dosya bırakır.')])
yaz('proje-rapor-ajani', 'Bitirme: raporlama ajanı', ders)
