#!/usr/bin/env python3
"""proje-oto-mutabakat: aylık banka mutabakatı. Defter gerçek veri, ekstre kuralı açık bir üreteçle yazılır."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ortak import C, M, T, Y, pre, yaz

URET = r'''
def ornek_ekstre(defter, yol, satir_ekle=True):
    """Bankanın dökümünü taklit eder. Hatalar numaraya bağlı, kuralı açık: gerçek veride bu dosya yok."""
    from openpyxl import Workbook
    wb = Workbook(); ws = wb.active; ws.title = "Hareketler"
    ws.append(["ILGAZ BANK HESAP EKSTRESI"]); ws.append(["Hesap: TR00 0000", None, None]); ws.append([])
    ws.append(["Tarih", "Açıklama", "Tutar"])
    tr = lambda x: f"{x:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    for i, (no, tutar) in enumerate(sorted(defter.items()), 1):
        if i % 17 == 0:
            continue                       # bankaya gelmemiş
        t = round(tutar + (5 if i % 13 == 0 else 0), 2)   # tutar farkı
        ws.append([f"2024-11-{(i % 28) + 1:02d}", f"SIPARIS NO:{no} ODEME", tr(t)])
        if i % 19 == 0:
            ws.append([f"2024-11-{(i % 28) + 1:02d}", f"SIPARIS NO:{no} ODEME", tr(t)])     # çift
    ws.append(["2024-11-30", "HESAP ISLETIM UCRETI", "-12,50"])       # siparişle ilgisiz
    ws.append(["2024-11-30", "SIPARIS NO:999999 ODEME", "100,00"])    # defterde yok
    wb.save(yol)
'''
A1 = '''import hashlib, json, os, re
from openpyxl import Workbook, load_workbook
import veri

def defter(con, ay):
    s = con.execute("""
        SELECT o.order_id, ROUND(SUM(i.quantity * i.unit_price * (1 - i.discount)), 2)
        FROM orders o JOIN order_items i ON i.order_id = o.order_id
        WHERE substr(o.order_date, 1, 7) = ? AND o.status IN ('delivered', 'shipped')
        GROUP BY o.order_id""", (ay,)).fetchall()
    return dict(s)

def tutar_coz(metin):
    if isinstance(metin, (int, float)):
        return float(metin)
    return float(str(metin).strip().replace(".", "").replace(",", "."))

def ekstre_oku(yol):
    ws = load_workbook(yol, read_only=True, data_only=True).worksheets[0]
    baslik, cikti = None, {"hareket": [], "diger": []}
    for sat in ws.iter_rows(values_only=True):
        if baslik is None:
            if sat and sat[0] == "Tarih":
                baslik = [str(x) for x in sat if x is not None]
                eksik = [k for k in ("Tarih", "Açıklama", "Tutar") if k not in baslik]
                if eksik:
                    raise ValueError("eksik sütun: " + ", ".join(eksik))
            continue
        if not sat or sat[0] is None:
            continue
        d = dict(zip(baslik, sat))
        m = re.search(r"SIPARIS NO:(\\d+)", str(d["Açıklama"]))
        k = {"tarih": str(d["Tarih"]), "tutar": tutar_coz(d["Tutar"]), "aciklama": d["Açıklama"]}
        if m:
            cikti["hareket"].append({**k, "no": int(m.group(1))})
        else:
            cikti["diger"].append(k)
    if baslik is None:
        raise ValueError("başlık satırı bulunamadı")
    return cikti
'''
A1BAS = '''import hashlib, json, os, re
from openpyxl import Workbook, load_workbook
import veri

def defter(con, ay):
    pass  # {sipariş no: tutar}; yalnız delivered ve shipped

def tutar_coz(metin):
    pass  # "1.234,50" -> 1234.5

def ekstre_oku(yol):
    pass  # {"hareket": [{"tarih", "tutar", "aciklama", "no"}], "diger": [...]}
''' + URET
A1 = A1 + URET
A1T = '''import tempfile
_c = veri.baglan("anadolu_market", ["orders", "order_items"])
_d = defter(_c, "2024-11")
_o = veri.oku("anadolu_market", "orders"); _i = veri.oku("anadolu_market", "order_items")
_o = _o[(_o["order_date"].astype(str).str[:7] == "2024-11") & (_o["status"].isin(["delivered", "shipped"]))]
_m = _i.merge(_o, on="order_id"); _m["t"] = _m["quantity"] * _m["unit_price"] * (1 - _m["discount"])
_g = _m.groupby("order_id")["t"].sum()
assert set(_d) == set(_g.index), "Defter yalnız delivered ve shipped siparişleri içerir"
assert all(abs(_d[k] - _g[k]) < 0.01 for k in _d), "Tutarlar"
assert tutar_coz("1.234,50") == 1234.5 and tutar_coz("-12,50") == -12.5 and tutar_coz("100,00") == 100.0 and tutar_coz(77.5) == 77.5 and tutar_coz("1.000.000,25") == 1000000.25, "Türkçe tutar"
_y = tempfile.mkdtemp() + "/e.xlsx"
ornek_ekstre({10: 1234.5, 11: 50.0}, _y)
_e = ekstre_oku(_y)
assert [x["no"] for x in _e["hareket"]] == [10, 11, 999999], "Başlık üstündeki satırlar atlanır: " + repr(_e["hareket"])
assert _e["hareket"][0]["tutar"] == 1234.5 and _e["hareket"][0]["tarih"] == "2024-11-02", "Hareket alanları"
assert len(_e["diger"]) == 1 and _e["diger"][0]["tutar"] == -12.5, "Siparişle ilgisiz satır ayrı tutulur"
_w = Workbook(); _s = _w.active; _s.append(["Tarih", "Tutar"]); _s.append(["2024-11-01", "5,00"]); _y2 = _y + "2.xlsx"; _w.save(_y2)
try:
    ekstre_oku(_y2)
    raise AssertionError("Sütun eksikse hata")
except ValueError as _h:
    assert "Açıklama" in str(_h), "Hangi sütun eksik söylenmeli"
_w = Workbook(); _w.active.append(["x"]); _y3 = _y + "3.xlsx"; _w.save(_y3)
try:
    ekstre_oku(_y3)
    raise AssertionError("Başlık yoksa hata")
except ValueError:
    pass
'''
A1Y = [(A1.replace('''.replace(".", "").replace(",", ".")''', '''.replace(",", ".")'''), 'binlik noktasını silmiyor'),
       (A1.replace("o.status IN ('delivered', 'shipped')", "o.status != 'cancelled'"), 'iadeleri deftere katıyor'),
       (A1.replace('''        if m:
            cikti["hareket"].append({**k, "no": int(m.group(1))})
        else:
            cikti["diger"].append(k)
''', '''        cikti["hareket"].append({**k, "no": int(m.group(1)) if m else None})
'''), 'ilgisiz satırı hareket sayıyor'),
       (A1.replace('''    if baslik is None:
        raise ValueError("başlık satırı bulunamadı")
''', ''), 'başlıksız dosyayı boş kabul ediyor')]
A2 = '''
def eslestir(deft, hareketler, tolerans=0.01):
    gelen = {}
    for h in hareketler:
        gelen.setdefault(h["no"], []).append(h["tutar"])
    sonuc = []
    for no in sorted(set(deft) | set(gelen)):
        d, g = deft.get(no), gelen.get(no, [])
        if d is None:
            durum = "defterde_yok"
        elif not g:
            durum = "ekstrede_yok"
        elif len(g) > 1:
            durum = "mukerrer"
        elif abs(g[0] - d) > tolerans:
            durum = "tutar_farki"
        else:
            durum = "tamam"
        sonuc.append({"no": no, "defter": d, "banka": round(sum(g), 2) if g else None, "adet": len(g), "durum": durum})
    return sonuc
'''
A2BAS = '''
def eslestir(deft, hareketler, tolerans=0.01):
    pass  # [{"no", "defter", "banka", "adet", "durum"}] numaraya göre sıralı
'''
A2T = '''_D = {1: 100.0, 2: 50.0, 3: 75.0, 4: 10.0, 5: 20.0}
_H = lambda no, t: {"no": no, "tutar": t}
_r = {x["no"]: x for x in eslestir(_D, [_H(1, 100.0), _H(2, 55.0), _H(4, 10.0), _H(4, 10.0), _H(5, 20.005), _H(9, 7.0)])}
assert [k for k in sorted(_r)] == [1, 2, 3, 4, 5, 9], "Birleşim, sıralı"
assert _r[1]["durum"] == "tamam" and _r[1] == {"no": 1, "defter": 100.0, "banka": 100.0, "adet": 1, "durum": "tamam"}, repr(_r[1])
assert _r[2]["durum"] == "tutar_farki" and _r[2]["banka"] == 55.0, "Tutar farkı"
assert _r[3]["durum"] == "ekstrede_yok" and _r[3]["banka"] is None and _r[3]["adet"] == 0, "Ekstrede yok"
assert _r[4]["durum"] == "mukerrer" and _r[4]["banka"] == 20.0 and _r[4]["adet"] == 2, "Çift kayıt"
assert _r[5]["durum"] == "tamam", "Kuruş altı fark tolerans içinde"
assert _r[9]["durum"] == "defterde_yok" and _r[9]["defter"] is None, "Defterde yok"
_t = eslestir({1: 10.0, 2: 10.0}, [_H(1, 15.0), _H(2, 5.0)])
assert [x["durum"] for x in _t] == ["tutar_farki", "tutar_farki"], "Toplam tutsa da satır satır bakılır"
assert eslestir({1: 10.0}, [_H(1, 5.0), _H(1, 5.0)])[0]["durum"] == "mukerrer", "İki hareket toplamı tutsa da mükerrer"
'''
_b1 = A1
A2Y = [(_b1 + A2.replace('''        elif len(g) > 1:
            durum = "mukerrer"
        elif abs(g[0] - d) > tolerans:''', '''        elif abs(sum(g) - d) > tolerans:'''), 'toplam tutarsa çifti kaçırıyor'),
       (_b1 + A2.replace('sorted(set(deft) | set(gelen))', 'sorted(deft)').replace('''        if d is None:
            durum = "defterde_yok"
        elif not g:''', '''        if not g:'''), 'defterde olmayanı görmüyor'),
       (_b1 + A2.replace('abs(g[0] - d) > tolerans', 'g[0] != d'), 'tolerans yok')]
A3 = '''
from openpyxl.styles import Font, PatternFill

def rapor_yaz(ay, sonuc, diger, yol):
    wb = Workbook()
    oz = wb.active
    oz.title = "Özet"
    oz.append(["Ay", ay])
    oz.append(["Durum", "Adet"])
    n = len(sonuc) + 1
    for i, d in enumerate(["tamam", "tutar_farki", "ekstrede_yok", "defterde_yok", "mukerrer"], 3):
        oz.append([d, f'=COUNTIF(Detay!E2:E{n},A{i})'])
    oz.append(["Toplam", "=SUM(B3:B7)"])
    oz.append(["Defter toplamı", f"=SUM(Detay!B2:B{n})"])
    oz.append(["Banka toplamı", f"=SUM(Detay!C2:C{n})"])
    oz.append(["Diğer hareketler", round(sum(x["tutar"] for x in diger), 2)])
    de = wb.create_sheet("Detay")
    de.append(["No", "Defter", "Banka", "Adet", "Durum"])
    for h in de[1]:
        h.font = Font(bold=True)
    kirmizi = PatternFill("solid", fgColor="F8CBAD")
    for s in sonuc:
        de.append([s["no"], s["defter"], s["banka"], s["adet"], s["durum"]])
        if s["durum"] != "tamam":
            for h in de[de.max_row]:
                h.fill = kirmizi
    de.freeze_panes = "A2"
    de.auto_filter.ref = f"A1:E{n}"
    g = yol + ".tmp"
    wb.save(g)
    os.replace(g, yol)
'''
A3BAS = '''
from openpyxl.styles import Font, PatternFill

def rapor_yaz(ay, sonuc, diger, yol):
    pass
'''
A3T = '''import tempfile
_y = tempfile.mkdtemp() + "/r.xlsx"
_S = [{"no": 1, "defter": 100.0, "banka": 100.0, "adet": 1, "durum": "tamam"}, {"no": 2, "defter": 50.0, "banka": 55.0, "adet": 1, "durum": "tutar_farki"}, {"no": 3, "defter": 75.0, "banka": None, "adet": 0, "durum": "ekstrede_yok"}]
rapor_yaz("2024-11", _S, [{"tutar": -12.5}, {"tutar": -1.0}], _y)
_w = load_workbook(_y)
assert _w.sheetnames == ["Özet", "Detay"], "Sayfalar"
_o = _w["Özet"]; _d = _w["Detay"]
assert _o["A1"].value == "Ay" and _o["B1"].value == "2024-11", "Ay"
assert _o["A3"].value == "tamam" and str(_o["B3"].value).upper().startswith("=COUNTIF(") and "DETAY!E2:E4" in str(_o["B3"].value).upper(), "Sayım formülle: " + repr(_o["B3"].value)
assert _o["A7"].value == "mukerrer", "Beş durum sırayla"
assert _o["B8"].value == "=SUM(B3:B7)", "Toplam formül"
assert _o["B9"].value == "=SUM(Detay!B2:B4)" and _o["B10"].value == "=SUM(Detay!C2:C4)", "Defter ve banka toplamı formül"
assert _o["B11"].value == -13.5, "Diğer hareketler"
assert [c.value for c in _d[1]] == ["No", "Defter", "Banka", "Adet", "Durum"] and _d["A1"].font.bold, "Detay başlığı"
assert _d["E3"].value == "tutar_farki" and _d["C4"].value is None, "Satırlar"
assert _d["A2"].fill.fgColor.rgb in ("00000000",) or _d["A2"].fill.fill_type is None, "Tamam satırı boyanmaz"
assert _d["A3"].fill.fill_type == "solid" and _d["E4"].fill.fill_type == "solid", "Sorunlu satır boyanır"
assert _d.freeze_panes == "A2" and _d.auto_filter.ref == "A1:E4", "Dondurma ve süzgeç"
assert not [f for f in os.listdir(os.path.dirname(_y)) if f.endswith(".tmp")], "Geçici dosya kalmaz"
'''
_b2 = _b1 + A2
A3Y = [(_b2 + A3.replace("""f'=COUNTIF(Detay!E2:E{n},A{i})'""", """sum(1 for s in sonuc if s["durum"] == d)"""), 'sayım sabit değer, formül değil'),
       (_b2 + A3.replace('''        if s["durum"] != "tamam":
            for h in de[de.max_row]:
                h.fill = kirmizi
''', ''), 'sorunlu satırı işaretlemiyor'),
       (_b2 + A3.replace('''    g = yol + ".tmp"
    wb.save(g)
    os.replace(g, yol)
''', '''    wb.save(yol + ".tmp")
'''), 'taşımayı unutuyor')]
A4 = '''
def aylik_calistir(con, ay, ekstre_yolu, klasor):
    os.makedirs(klasor, exist_ok=True)
    with open(ekstre_yolu, "rb") as f:
        oz = hashlib.sha256(f.read()).hexdigest()
    gecmis_yol = os.path.join(klasor, "gecmis.jsonl")
    gecmis = []
    if os.path.exists(gecmis_yol):
        gecmis = [json.loads(s) for s in open(gecmis_yol, encoding="utf-8")]
    ayin = [g for g in gecmis if g["ay"] == ay]
    for g in ayin:
        if g["ozet"] == oz:
            return {"durum": "atlandi", "rapor": g["rapor"]}
    e = ekstre_oku(ekstre_yolu)
    aylar = {h["tarih"][:7] for h in e["hareket"]}
    if aylar - {ay}:
        raise ValueError("ekstrede başka ay var: " + ", ".join(sorted(aylar - {ay})))
    s = eslestir(defter(con, ay), e["hareket"])
    ad = f"mutabakat_{ay}.xlsx" if not ayin else f"mutabakat_{ay}_v{len(ayin) + 1}.xlsx"
    rapor_yaz(ay, s, e["diger"], os.path.join(klasor, ad))
    say = {}
    for x in s:
        say[x["durum"]] = say.get(x["durum"], 0) + 1
    with open(gecmis_yol, "a", encoding="utf-8") as f:
        f.write(json.dumps({"ay": ay, "ozet": oz, "rapor": ad, "sayim": say}, ensure_ascii=False) + "\\n")
    return {"durum": "yazildi", "rapor": ad, "sayim": say}
'''
A4BAS = '''
def aylik_calistir(con, ay, ekstre_yolu, klasor):
    pass  # {"durum": "yazildi" | "atlandi", "rapor", "sayim"}
'''
A4T = '''import tempfile
_c = veri.baglan("anadolu_market", ["orders", "order_items"])
_k = tempfile.mkdtemp(); _e = _k + "/ekstre.xlsx"; _o = _k + "/cikti"
_D = defter(_c, "2024-11")
ornek_ekstre(_D, _e)
_r = aylik_calistir(_c, "2024-11", _e, _o)
assert _r["durum"] == "yazildi" and _r["rapor"] == "mutabakat_2024-11.xlsx", repr(_r)
_n = sorted(_D)
_bek = {"tamam": 0, "tutar_farki": 0, "ekstrede_yok": 0, "mukerrer": 0, "defterde_yok": 1}
for _i, _x in enumerate(_n, 1):
    if _i % 17 == 0:
        _bek["ekstrede_yok"] += 1
    elif _i % 19 == 0:
        _bek["mukerrer"] += 1
    elif _i % 13 == 0:
        _bek["tutar_farki"] += 1
    else:
        _bek["tamam"] += 1
_bek = {k: v for k, v in _bek.items() if v}
assert _r["sayim"] == _bek, f"Sayım: {_r['sayim']}, beklenen {_bek}"
_w = load_workbook(_o + "/" + _r["rapor"])
assert _w["Detay"].max_row == len(_D) + 2, "Detay satır sayısı"
_z = os.path.getmtime(_o + "/" + _r["rapor"])
_r2 = aylik_calistir(_c, "2024-11", _e, _o)
assert _r2["durum"] == "atlandi" and _r2["rapor"] == _r["rapor"], "Aynı dosya yeniden işlenmez"
assert len(open(_o + "/gecmis.jsonl", encoding="utf-8").read().splitlines()) == 1, "Geçmiş tek satır"
_kopya = _k + "/baska_ad.xlsx"
import shutil
shutil.copy(_e, _kopya)
assert aylik_calistir(_c, "2024-11", _kopya, _o)["durum"] == "atlandi", "Dosya adı değil içerik önemli"
_w2 = load_workbook(_e); _w2.active.append(["2024-11-30", "SIPARIS NO:888888 ODEME", "1,00"]); _w2.save(_e)
_r3 = aylik_calistir(_c, "2024-11", _e, _o)
assert _r3["durum"] == "yazildi" and _r3["rapor"] == "mutabakat_2024-11_v2.xlsx", "Düzeltilmiş ekstre yeni sürüm olur: " + repr(_r3)
assert os.path.exists(_o + "/mutabakat_2024-11.xlsx"), "Eski rapor silinmez"
try:
    aylik_calistir(_c, "2024-10", _e, _o)
    raise AssertionError("Başka ayın ekstresi reddedilmeli")
except ValueError as _h:
    assert "2024-11" in str(_h), "Hangi ay söylenmeli"
'''
_b3 = _b2 + A3
A4Y = [(_b3 + A4.replace('''    for g in ayin:
        if g["ozet"] == oz:
            return {"durum": "atlandi", "rapor": g["rapor"]}
''', ''), 'her seferinde yeniden üretiyor'),
       (_b3 + A4.replace('''    aylar = {h["tarih"][:7] for h in e["hareket"]}
    if aylar - {ay}:
        raise ValueError("ekstrede başka ay var: " + ", ".join(sorted(aylar - {ay})))
''', ''), 'yanlış ayın dosyasını kabul ediyor'),
       (_b3 + A4.replace('''ad = f"mutabakat_{ay}.xlsx" if not ayin else f"mutabakat_{ay}_v{len(ayin) + 1}.xlsx"''', '''ad = f"mutabakat_{ay}.xlsx"'''), 'düzeltmede eski raporun üstüne yazıyor'),
       (_b3 + A4.replace('oz = hashlib.sha256(f.read()).hexdigest()', 'oz = os.path.basename(ekstre_yolu)'), 'özet yerine dosya adı')]
YEREL = r'''"""mutabakat.py: aylık banka mutabakatı. pip install openpyxl
python mutabakat.py --ornek           örnek defter.csv ve ekstre.xlsx üretir
python mutabakat.py 2024-11 defter.csv ekstre.xlsx --cikti raporlar
Çıkış kodu: 0 temiz, 1 fark var, 2 dosya sorunu."""
import argparse, csv, hashlib, json, logging, os, re, sys
from openpyxl import Workbook, load_workbook

log = logging.getLogger("mutabakat")

def tutar_coz(m):
    return float(m) if isinstance(m, (int, float)) else float(str(m).strip().replace(".", "").replace(",", "."))

def defter_oku(yol):
    with open(yol, encoding="utf-8", newline="") as f:
        return {int(s["no"]): float(s["tutar"]) for s in csv.DictReader(f)}

def ekstre_oku(yol):
    ws = load_workbook(yol, read_only=True, data_only=True).worksheets[0]
    hareket, baslik = [], None
    for sat in ws.iter_rows(values_only=True):
        if baslik is None:
            if sat and sat[0] == "Tarih":
                baslik = sat
            continue
        d = dict(zip(baslik, sat))
        m = re.search(r"SIPARIS NO:(\d+)", str(d.get("Açıklama")))
        if m:
            hareket.append({"no": int(m.group(1)), "tutar": tutar_coz(d["Tutar"])})
    if baslik is None:
        raise ValueError("başlık satırı yok")
    return hareket

def eslestir(deft, hareket):
    gelen = {}
    for h in hareket:
        gelen.setdefault(h["no"], []).append(h["tutar"])
    for no in sorted(set(deft) | set(gelen)):
        d, g = deft.get(no), gelen.get(no, [])
        durum = ("defterde_yok" if d is None else "ekstrede_yok" if not g else "mukerrer" if len(g) > 1
                 else "tutar_farki" if abs(g[0] - d) > 0.01 else "tamam")
        yield [no, d, sum(g) if g else None, durum]

def rapor(satirlar, yol):
    wb = Workbook()
    ws = wb.active
    ws.title = "Detay"
    ws.append(["No", "Defter", "Banka", "Durum"])
    for s in satirlar:
        ws.append(s)
    oz = wb.create_sheet("Özet", 0)
    for i, d in enumerate(["tamam", "tutar_farki", "ekstrede_yok", "defterde_yok", "mukerrer"], 1):
        oz.append([d, f"=COUNTIF(Detay!D:D,A{i})"])
    wb.save(yol + ".tmp")
    os.replace(yol + ".tmp", yol)

def ornek():
    with open("defter.csv", "w", encoding="utf-8", newline="") as f:
        f.write("no,tutar\n10,1234.50\n11,50.00\n12,75.00\n")
    wb = Workbook()
    ws = wb.active
    for s in [["ILGAZ BANK"], [], ["Tarih", "Açıklama", "Tutar"], ["2024-11-02", "SIPARIS NO:10 ODEME", "1.234,50"], ["2024-11-03", "SIPARIS NO:11 ODEME", "55,00"], ["2024-11-09", "SIPARIS NO:77 ODEME", "9,00"]]:
        ws.append(s)
    wb.save("ekstre.xlsx")
    print("defter.csv ve ekstre.xlsx yazıldı")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("ay", nargs="?")
    ap.add_argument("defter", nargs="?")
    ap.add_argument("ekstre", nargs="?")
    ap.add_argument("--cikti", default="raporlar")
    ap.add_argument("--ornek", action="store_true")
    a = ap.parse_args()
    logging.basicConfig(level=logging.INFO, stream=sys.stderr, format="%(asctime)s %(levelname)s %(message)s")
    if a.ornek:
        ornek()
        return 0
    try:
        with open(a.ekstre, "rb") as f:
            oz = hashlib.sha256(f.read()).hexdigest()
        os.makedirs(a.cikti, exist_ok=True)
        gecmis = os.path.join(a.cikti, "gecmis.jsonl")
        if os.path.exists(gecmis) and any(json.loads(s)["ozet"] == oz for s in open(gecmis, encoding="utf-8")):
            print("atlandi: bu ekstre işlenmiş")
            return 0
        sat = list(eslestir(defter_oku(a.defter), ekstre_oku(a.ekstre)))
    except (OSError, ValueError, KeyError) as e:
        log.error("dosya sorunu: %s", e)
        return 2
    rapor(sat, os.path.join(a.cikti, f"mutabakat_{a.ay}.xlsx"))
    with open(gecmis, "a", encoding="utf-8") as f:
        f.write(json.dumps({"ay": a.ay, "ozet": oz}) + "\n")
    fark = [s for s in sat if s[3] != "tamam"]
    print(f"{len(sat)} kayıt, {len(fark)} fark")
    return 1 if fark else 0

if __name__ == "__main__":
    sys.exit(main())
'''
if os.environ.get('P3_Y'): open(os.environ['P3_Y'] + '/mutabakat.py', 'w').write(YEREL)
_tum = _b3 + A4
ORNEK = '''# Toplam tutuyor, ama mutabakat tamam mı? Bu örnek projenin neden satır satır çalıştığını gösterir.
defter = {101: 100.0, 102: 50.0}
banka = {101: 120.0, 102: 30.0}
print("toplamlar:", sum(defter.values()), sum(banka.values()))
for no in defter:
    print(no, "tamam" if defter[no] == banka[no] else "fark: " + str(banka[no] - defter[no]))
'''
ders = dict(id='proje-oto-mutabakat', lv='ileri', mod='İleri bitirme', min=90, needs=['pandas', 'sqlite3'],
 title='Otomasyon projesi: aylık banka mutabakatı',
 sum='Her ay elle yapılan banka mutabakatını işe çevirirsin: dağınık Excel ekstresini okur, Anadolu Market defteriyle satır satır eşleştirir, formüllü rapor yazar, aynı dosyayı ikinci kez işlemez, düzeltilmiş ekstreyi yeni sürüm yapar.',
 goals=['Üstünde bilgi satırları olan gerçek bir Excel dökümünü sağlam okuyabilirim.', 'Türkçe biçimli tutarı doğru sayıya çevirebilirim.', 'Eksik, fazla, çift ve tutar farkını ayırabilirim.', 'Formüllü ve paydaşın açacağı bir rapor yazabilirim.', 'İşi içerik özetiyle idempotent yapabilirim.'],
 body=f'''<h2>İş</h2>
<p>Muhasebe her ayın başında bankadan gelen ekstreyi siparişlerle elle karşılaştırıyor. Dosya her ay aynı biçimde değil: üstte hesap bilgisi var, tutarlar metin ve Türkçe biçimde, araya işletim ücreti gibi ilgisiz satırlar giriyor. Defter gerçek <code>anadolu_market</code> verisinden gelir. Ekstre kurgudur, görevin içindeki <code>ornek_ekstre</code> üretir ve hataları numaraya bağlı açık bir kuralla ekler.</p>
{pre(ORNEK)}
<div class="tbl-wrap"><table><tr><th>Durum</th><th>Anlamı</th><th>Kim bakar</th></tr><tr><td><code>tamam</code></td><td>Tek hareket, tutar aynı</td><td>Kimse</td></tr><tr><td><code>tutar_farki</code></td><td>Tek hareket, tutar farklı</td><td>Muhasebe</td></tr><tr><td><code>ekstrede_yok</code></td><td>Sipariş var, para yok</td><td>Tahsilat</td></tr><tr><td><code>defterde_yok</code></td><td>Para var, sipariş yok</td><td>Muhasebe</td></tr><tr><td><code>mukerrer</code></td><td>Aynı siparişe birden çok hareket</td><td>Banka ile görüşme</td></tr></table></div>
<h2>Tasarım kararları</h2>
<ul><li><b>Başlığı ara, satır numarasına güvenme.</b> Banka dökümün başına bir satır eklerse sabit <code>skiprows</code> sessizce yanlış okur.</li><li><b>Sonuç özetini formülle yaz.</b> Muhasebeci detayda bir satırı düzeltince özet de değişir ve hesabı denetleyebilir.</li><li><b>Kimlik içerik özetidir.</b> <code>ekstre_son.xlsx</code> ile <code>ekstre.xlsx</code> aynı dosyaysa aynı iştir. İçerik değiştiyse eskiyi ezme, yeni sürüm yaz: denetimde önceki rapor gerekir.</li><li><b>Yanlış ayı reddet.</b> Ekim dosyasını kasım diye işlemek en pahalı ve en sessiz hatadır.</li></ul>
<h2>Adımlar</h2>
<ol><li>Defter ve dağınık ekstreyi oku.</li><li>Satır satır eşleştir.</li><li>Formüllü Excel raporu yaz.</li><li>İdempotent aylık iş.</li></ol>
<p>Son görevde üretilen dosyaları, kodunu <b>Oyun alanı</b>nda çalıştırıp indirerek Excel'de açabilirsin. Formüllerin değeri Excel açınca hesaplanır.</p>''',
 ex=[
 M('proje-oto-mutabakat-m1', '"1.234,50" metni için float("1.234,50".replace(",", ".")) ne yapar?', ['1234.5 sonucunu verir', 'ValueError verir', '1.2345 sonucunu verir', '123450 sonucunu verir'], 1, 'Sonuç "1.234.50" olur, iki nokta geçersizdir. Önce binlik noktası silinir.'),
 M('proje-oto-mutabakat-m2', 'Banka aynı siparişi 50 ve 50 olarak iki kez gösteriyor, defterde 100. Durum nedir?', ['tamam: toplam tutuyor', 'tutar_farki', 'ekstrede_yok', 'mukerrer'], 3, 'Toplam tutsa da iki hareket var, biri elle incelenmeli.'),
 M('proje-oto-mutabakat-m3', 'Aynı ekstre farklı adla geldi. İş ne yapmalı?', ['Yeni rapor yazmalı', 'Hata verip durmalı', 'İçerik özetiyle atlamalı', 'Önceki raporu tamamen silmeli'], 2, 'Dosya adı kimlik değildir.'),
 T('proje-oto-mutabakat-t1', 'Ne yazdırır?', '''g = {"a": [10.0], "b": []}
d = {"a": 10.0, "b": 5.0, "c": 7.0}
for k in sorted(set(d) | set(g)):
    print(k, len(g.get(k, [])), end=" ")''', ['a 1 b 0 c 0 ', 'a 1 b 0 ', 'a 1 b 1 c 1 ', 'a 0 b 0 c 0 '], 0, 'Birleşim üç anahtar verir, c gelende yok: boş liste.'),
 C('proje-oto-mutabakat-1', 'Rehberli', '<b>Okuma.</b> <code>defter(con, ay)</code>: <code>delivered</code> ve <code>shipped</code> siparişler için <code>{no: tutar}</code> (<code>quantity * unit_price * (1 - discount)</code>, 2 basamak). <code>tutar_coz</code>: <code>"1.234,50"</code> gibi metni ve sayıyı <code>float</code> yapar. <code>ekstre_oku(yol)</code>: ilk sütunu <code>Tarih</code> olan satırı başlık kabul eder, öncesini atlar; <code>Tarih, Açıklama, Tutar</code> eksikse adını söyleyen <code>ValueError</code>, başlık yoksa <code>ValueError</code>. Açıklamada <code>SIPARIS NO:123</code> geçiyorsa <code>hareket</code>e <code>{"tarih", "tutar", "aciklama", "no"}</code>, yoksa <code>diger</code>e yazar. <code>ornek_ekstre</code> hazır.', A1BAS, A1, A1T, ['load_workbook(yol, read_only=True, data_only=True).worksheets[0]', 'iter_rows(values_only=True)', 're.search(r"SIPARIS NO:(\\d+)", metin)'], 'Başlığı aramak, dosyanın üstündeki satır sayısı değişince işi bozmaz.', yanlis=A1Y),
 C('proje-oto-mutabakat-2', 'Kendin yaz', '<b>Eşleştirme.</b> <code>eslestir(deft, hareketler, tolerans=0.01)</code>: iki tarafın birleşimi, numaraya göre sıralı. Her satır <code>{"no", "defter", "banka", "adet", "durum"}</code>. <code>banka</code> hareket toplamı (yoksa <code>None</code>). Öncelik: <code>defterde_yok</code>, <code>ekstrede_yok</code>, <code>mukerrer</code> (birden çok hareket, toplam tutsa bile), <code>tutar_farki</code>, <code>tamam</code>.', _b1 + A2BAS, _b2, A2T, ['Önce hareketleri numaraya göre grupla.', 'set(deft) | set(gelen)'], 'Toplam karşılaştırması farkları birbirine götürür. İş satır düzeyinde yapılır.', yanlis=A2Y, diff=2),
 C('proje-oto-mutabakat-3', 'Kendin yaz', '<b>Rapor.</b> <code>rapor_yaz(ay, sonuc, diger, yol)</code>. <code>Özet</code>: <code>A1:B1</code> ay; 2. satır başlık; 3 ile 7 arası sırayla <code>tamam, tutar_farki, ekstrede_yok, defterde_yok, mukerrer</code> ve <code>Detay!E</code> üstünde <code>COUNTIF</code>; 8. satır toplam <code>=SUM(B3:B7)</code>; 9 ve 10 defter ve banka toplamı formülü; 11 diğer hareket toplamı (2 basamak). <code>Detay</code>: kalın başlık, satırlar, <code>tamam</code> dışı satırlar dolgulu, ilk satır dondurulmuş, süzgeç açık. Atomik yazılır.', _b2 + A3BAS, _b3, A3T, ['Formülde sayfa adı: Detay!E2:E10', 'de.freeze_panes = "A2"', 'de.auto_filter.ref'], 'Formül, okuyanın hesabı izlemesini sağlar; sabit sayı yalnız sonucu söyler.', yanlis=A3Y, diff=2),
 C('proje-oto-mutabakat-4', 'Mini proje', '<b>Aylık iş.</b> <code>aylik_calistir(con, ay, ekstre_yolu, klasor)</code>. Ekstrenin SHA-256 özeti <code>gecmis.jsonl</code>de bu ay için varsa <code>{"durum": "atlandi", "rapor"}</code>. Ekstrede başka ay varsa ayı söyleyen <code>ValueError</code>. Yoksa eşleştirip <code>mutabakat_AY.xlsx</code> yazar; bu ay için önceden rapor varsa <code>mutabakat_AY_v2.xlsx</code>, eskisi kalır. Geçmişe <code>{"ay", "ozet", "rapor", "sayim"}</code> ekler, <code>{"durum": "yazildi", "rapor", "sayim"}</code> döndürür.', _b3 + A4BAS, _tum, A4T, ['open(yol, "rb") ile oku, hashlib.sha256', 'Geçmiş satırlarını önce oku.'], 'Test, ekstre üretecinin kuralından sayımı ayrıca hesaplıyor: sonuç tek kaynağa dayanmıyor.', yanlis=A4Y, diff=3),
 Y('proje-oto-mutabakat-y1', 'Komut satırı sürümü. Bu betik burada çalıştırıldı ve aşağıdaki çıktı alındı. Gerçek ekstre gizlidir: depoya koyma.', ['<code>python -m venv .venv</code>, etkinleştir, <code>python -m pip install openpyxl</code>.', 'Kodu <code>mutabakat.py</code> olarak kaydet. <code>python mutabakat.py --ornek</code> örnek dosyaları üretir.', '<code>python mutabakat.py 2024-11 defter.csv ekstre.xlsx</code> çalıştır, <code>raporlar/mutabakat_2024-11.xlsx</code> dosyasını aç.', 'Aynı komutu tekrar çalıştır: <code>atlandi</code> yazar. <code>echo $?</code> ile çıkış koduna bak: fark varsa 1.', 'Her ayın 2\'sinde çalıştırmak için cron: <code>0 8 2 * * cd /yol && .venv/bin/python mutabakat.py $(date -d "last month" +\\%Y-\\%m) defter.csv ekstre.xlsx</code> (GNU date). Bu satır burada denenmedi.'], file=YEREL, fname='mutabakat.py', cmd='python mutabakat.py --ornek && python mutabakat.py 2024-11 defter.csv ekstre.xlsx', expect='defter.csv ve ekstre.xlsx yazıldı\n4 kayıt, 3 fark'),
 ],
 faq=[dict(q='Neden pandas değil openpyxl?', a='Bu dosyada üstte serbest satırlar var ve tutar metin. pandas ile de yapılır, ama başlığı aramak için önce yine bakman gerekir. İkisi de doğrudur.'), dict(q='Formüllerin değeri neden test edilmiyor?', a='openpyxl formülü yazar, hesaplamaz. Değeri Excel açınca oluşur. Test formül metnine bakar, tutarlılığı detay satırlarıyla ayrıca sınar.')],
 mistakes=[dict(bad='pd.read_excel(yol, skiprows=3)', good='for sat in ws.iter_rows(values_only=True):\n    if sat[0] == "Tarih": ...', why='Sabit satır atlamak dosya değişince sessizce yanlış okur.'), dict(bad='if sum(g) == d: durum = "tamam"', good='if len(g) > 1: durum = "mukerrer"', why='İki parça ödeme toplamı tutabilir, yine incelenir.'), dict(bad='wb.save(f"mutabakat_{ay}.xlsx")  # hep aynı ad', good='yeni sürümde _v2 ekle', why='Düzeltilen ekstre eski raporu silmemeli.')])
yaz('proje-oto-mutabakat', 'Otomasyon projesi: mutabakat', ders)
