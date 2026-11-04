#!/usr/bin/env python3
"""proje-oto-fatura: klasör izleme, gerçek PDF'ten alan ayıklama, defter, arşiv ve Excel özeti."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ortak import C, M, T, Y, pre, yaz

URET = r'''
def ornek_fatura(yol, no, tarih, vkn, tutar, kdv=20):
    """Örnek fatura PDF'i. Kurgudur: VKN ve şirketler gerçek değildir."""
    from reportlab.pdfgen import canvas
    c = canvas.Canvas(yol)
    for i, s in enumerate(["ORNEK TEDARIK AS", f"Fatura No: {no}", f"Tarih: {tarih}", f"VKN: {vkn}", f"Matrah: {tutar:,.2f} TL".replace(",", "X").replace(".", ",").replace("X", "."), f"KDV %{kdv}: {tutar * kdv / 100:,.2f} TL".replace(",", "X").replace(".", ",").replace("X", "."), f"Genel Toplam: {tutar * (100 + kdv) / 100:,.2f} TL".replace(",", "X").replace(".", ",").replace("X", ".")]):
        c.drawString(72, 760 - i * 20, s)
    c.save()
'''
A1 = '''import hashlib, json, os, re, shutil
from pypdf import PdfReader
from openpyxl import Workbook

ALAN = {"no": r"Fatura No:\\s*(\\S+)", "tarih": r"Tarih:\\s*(\\d{4}-\\d{2}-\\d{2})", "vkn": r"VKN:\\s*(\\d{10})",
        "matrah": r"Matrah:\\s*([\\d.,]+)", "kdv": r"KDV\\s*%\\d+:\\s*([\\d.,]+)", "toplam": r"Genel Toplam:\\s*([\\d.,]+)"}

def _tl(m):
    return float(m.replace(".", "").replace(",", "."))

def pdf_metni(yol):
    return "\\n".join(s.extract_text() or "" for s in PdfReader(yol).pages)

def ayikla(metin):
    d, eksik = {}, []
    for ad, desen in ALAN.items():
        m = re.search(desen, metin)
        if m:
            d[ad] = m.group(1)
        else:
            eksik.append(ad)
    if eksik:
        raise ValueError("alan bulunamadı: " + ", ".join(eksik))
    for ad in ("matrah", "kdv", "toplam"):
        d[ad] = _tl(d[ad])
    if abs(d["matrah"] + d["kdv"] - d["toplam"]) > 0.01:
        raise ValueError("toplam tutmuyor")
    return d
'''
A1BAS = '''import hashlib, json, os, re, shutil
from pypdf import PdfReader
from openpyxl import Workbook

def pdf_metni(yol):
    pass

def ayikla(metin):
    pass  # {"no", "tarih", "vkn", "matrah", "kdv", "toplam"}; bulunamazsa ya da toplam tutmazsa ValueError
''' + URET
A1 = A1 + URET
A1T = '''import tempfile
_d = tempfile.mkdtemp(); _y = _d + "/f.pdf"
ornek_fatura(_y, "FTR-2024-001", "2024-11-05", "1234567890", 1234.5)
_m = pdf_metni(_y)
assert "FTR-2024-001" in _m and "1.234,50" in _m, "PDF gerçekten okunmalı: " + repr(_m[:80])
_a = ayikla(_m)
assert _a == {"no": "FTR-2024-001", "tarih": "2024-11-05", "vkn": "1234567890", "matrah": 1234.5, "kdv": 246.9, "toplam": 1481.4}, repr(_a)
_T = "Fatura No: A1\\nTarih: 2024-11-05\\nVKN: 1234567890\\nMatrah: 100,00 TL\\nKDV %10: 10,00 TL\\nGenel Toplam: 110,00 TL"
assert ayikla(_T)["toplam"] == 110.0, "Farklı KDV oranı"
for _kotu, _ne in [(_T.replace("Fatura No: A1", ""), "no"), (_T.replace("2024-11-05", "05.11.2024"), "tarih"), (_T.replace("1234567890", "123"), "vkn"), (_T.replace("110,00", "120,00"), "toplam tutmuyor")]:
    try:
        ayikla(_kotu)
        raise AssertionError("Reddedilmeli: " + _ne)
    except ValueError as _h:
        assert _ne in str(_h), "Mesaj nedeni söylemeli: " + str(_h)
'''
A1Y = [(A1.replace('''    if abs(d["matrah"] + d["kdv"] - d["toplam"]) > 0.01:
        raise ValueError("toplam tutmuyor")
''', ''), 'toplamı denetlemiyor'),
       (A1.replace('''        if m:
            d[ad] = m.group(1)
        else:
            eksik.append(ad)
''', '''        d[ad] = m.group(1) if m else "0"
'''), 'eksik alanı sıfır sayıyor'),
       (A1.replace('m.replace(".", "").replace(",", ".")', 'm.replace(",", ".")'), 'binlik noktası kalıyor')]
A2 = '''
class Defter:
    def __init__(self, yol):
        self.yol = yol
        self.ozetler, self.nolar = {}, {}
        if os.path.exists(yol):
            for s in open(yol, encoding="utf-8"):
                k = json.loads(s)
                self.ozetler[k["ozet"]] = k
                if "no" in k:
                    self.nolar[(k["vkn"], k["no"])] = k

    def ekle(self, k):
        with open(self.yol, "a", encoding="utf-8") as f:
            f.write(json.dumps(k, ensure_ascii=False) + "\\n")
        self.ozetler[k["ozet"]] = k
        if "no" in k:
            self.nolar[(k["vkn"], k["no"])] = k

def ozet(yol):
    with open(yol, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()

def tasi(kaynak, klasor):
    os.makedirs(klasor, exist_ok=True)
    ad = os.path.basename(kaynak)
    hedef = os.path.join(klasor, ad)
    if os.path.exists(hedef):
        kok, uz = os.path.splitext(ad)
        hedef = os.path.join(klasor, kok + "_" + ozet(kaynak)[:8] + uz)
    shutil.move(kaynak, hedef)
    return hedef

def dosya_isle(yol, defter, arsiv, hatali):
    oz = ozet(yol)
    if oz in defter.ozetler:
        tasi(yol, os.path.join(hatali, "tekrar"))
        return {"dosya": os.path.basename(yol), "durum": "tekrar"}
    try:
        a = ayikla(pdf_metni(yol))
    except Exception as e:
        hedef = tasi(yol, hatali)
        with open(hedef + ".neden.txt", "w", encoding="utf-8") as f:
            f.write(type(e).__name__ + ": " + str(e))
        defter.ekle({"ozet": oz, "durum": "hatali"})
        return {"dosya": os.path.basename(yol), "durum": "hatali", "neden": str(e)}
    if (a["vkn"], a["no"]) in defter.nolar:
        tasi(yol, os.path.join(hatali, "tekrar"))
        defter.ekle({"ozet": oz, "durum": "numara_tekrar"})
        return {"dosya": os.path.basename(yol), "durum": "numara_tekrar"}
    hedef = tasi(yol, os.path.join(arsiv, a["tarih"][:7]))
    defter.ekle({**a, "ozet": oz, "durum": "tamam", "arsiv": hedef})
    return {"dosya": os.path.basename(yol), "durum": "tamam", **a}
'''
A2BAS = '''
class Defter:
    def __init__(self, yol):
        self.yol = yol
        self.ozetler, self.nolar = {}, {}
        # dosya varsa oku

    def ekle(self, k):
        pass

def ozet(yol):
    pass

def tasi(kaynak, klasor):
    pass  # ad çakışırsa üstüne yazma

def dosya_isle(yol, defter, arsiv, hatali):
    pass  # {"dosya", "durum": "tamam" | "tekrar" | "numara_tekrar" | "hatali", ...}
'''
A2T = '''import tempfile, glob
_k = tempfile.mkdtemp(); _g = _k + "/gelen"; os.makedirs(_g)
_A, _H, _Dy = _k + "/arsiv", _k + "/hatali", _k + "/defter.jsonl"
_d = Defter(_Dy)
ornek_fatura(_g + "/a.pdf", "F-1", "2024-11-05", "1234567890", 100.0)
_r = dosya_isle(_g + "/a.pdf", _d, _A, _H)
assert _r["durum"] == "tamam" and _r["no"] == "F-1" and _r["toplam"] == 120.0, repr(_r)
assert os.path.exists(_A + "/2024-11/a.pdf") and not os.path.exists(_g + "/a.pdf"), "Aya göre arşive taşınır"
shutil.copy(_A + "/2024-11/a.pdf", _g + "/kopya.pdf")
_r = dosya_isle(_g + "/kopya.pdf", _d, _A, _H)
assert _r["durum"] == "tekrar" and os.path.exists(_H + "/tekrar/kopya.pdf"), "Aynı içerik farklı adla: tekrar: " + repr(_r)
ornek_fatura(_g + "/yeniden.pdf", "F-1", "2024-11-05", "1234567890", 999.0)
_r = dosya_isle(_g + "/yeniden.pdf", _d, _A, _H)
assert _r["durum"] == "numara_tekrar", "Farklı içerik, aynı VKN ve numara: " + repr(_r)
ornek_fatura(_g + "/baska.pdf", "F-1", "2024-11-06", "9999999999", 50.0)
assert dosya_isle(_g + "/baska.pdf", _d, _A, _H)["durum"] == "tamam", "Başka firmanın aynı numarası geçerli"
open(_g + "/bozuk.pdf", "wb").write(b"bu pdf degil")
_r = dosya_isle(_g + "/bozuk.pdf", _d, _A, _H)
assert _r["durum"] == "hatali" and os.path.exists(_H + "/bozuk.pdf"), "Bozuk dosya işi durdurmaz, karantinaya gider"
assert os.path.exists(_H + "/bozuk.pdf.neden.txt") and open(_H + "/bozuk.pdf.neden.txt", encoding="utf-8").read(), "Neden dosyası yazılır"
ornek_fatura(_g + "/a.pdf", "F-2", "2024-11-05", "1234567890", 77.0)
assert dosya_isle(_g + "/a.pdf", _d, _A, _H)["durum"] == "tamam", "Aynı adlı yeni fatura"
assert len(glob.glob(_A + "/2024-11/*.pdf")) == 3, "Ad çakışması eski dosyayı ezmez: " + repr(glob.glob(_A + "/2024-11/*"))
_d2 = Defter(_Dy)
assert ("1234567890", "F-1") in _d2.nolar and len(_d2.ozetler) >= 5, "Defter dosyadan geri yüklenir"
ornek_fatura(_g + "/s.pdf", "F-1", "2024-11-05", "1234567890", 888.0)
assert dosya_isle(_g + "/s.pdf", _d2, _A, _H)["durum"] == "numara_tekrar", "Yeniden başlatınca da hatırlanır"
'''
_b1 = A1
A2Y = [(_b1 + A2.replace('''    if (a["vkn"], a["no"]) in defter.nolar:
        tasi(yol, os.path.join(hatali, "tekrar"))
        defter.ekle({"ozet": oz, "durum": "numara_tekrar"})
        return {"dosya": os.path.basename(yol), "durum": "numara_tekrar"}
''', ''), 'aynı fatura yeniden düzenlenmişse iki kez yazıyor'),
       (_b1 + A2.replace('self.nolar[(k["vkn"], k["no"])] = k', 'self.nolar[k["no"]] = k').replace('(a["vkn"], a["no"]) in defter.nolar', 'a["no"] in defter.nolar'), 'numarayı firmasız tutuyor'),
       (_b1 + A2.replace('''    if os.path.exists(hedef):
        kok, uz = os.path.splitext(ad)
        hedef = os.path.join(klasor, kok + "_" + ozet(kaynak)[:8] + uz)
''', ''), 'aynı adlı dosyanın üstüne yazıyor'),
       (_b1 + A2.replace('''    try:
        a = ayikla(pdf_metni(yol))
    except Exception as e:
        hedef = tasi(yol, hatali)
        with open(hedef + ".neden.txt", "w", encoding="utf-8") as f:
            f.write(type(e).__name__ + ": " + str(e))
        defter.ekle({"ozet": oz, "durum": "hatali"})
        return {"dosya": os.path.basename(yol), "durum": "hatali", "neden": str(e)}
''', '''    a = ayikla(pdf_metni(yol))
'''), 'bozuk dosya işi durduruyor')]
A3 = '''
def hazir_dosyalar(klasor, onceki):
    hazir, simdi = [], {}
    for ad in sorted(os.listdir(klasor)):
        y = os.path.join(klasor, ad)
        if not os.path.isfile(y) or not ad.lower().endswith(".pdf") or ad.startswith("."):
            continue
        b = os.path.getsize(y)
        simdi[ad] = b
        if onceki.get(ad) == b and b > 0:
            hazir.append(y)
    return hazir, simdi

def tara(klasor, defter, arsiv, hatali, onceki):
    hazir, simdi = hazir_dosyalar(klasor, onceki)
    sonuc = [dosya_isle(y, defter, arsiv, hatali) for y in hazir]
    for y in hazir:
        simdi.pop(os.path.basename(y), None)
    return sonuc, simdi
'''
A3BAS = '''
def hazir_dosyalar(klasor, onceki):
    pass  # (hazır yollar, {ad: boyut})

def tara(klasor, defter, arsiv, hatali, onceki):
    pass  # (dosya_isle sonuçları, yeni durum)
'''
A3T = '''import tempfile
_k = tempfile.mkdtemp(); _g = _k + "/gelen"; os.makedirs(_g + "/alt")
_d = Defter(_k + "/d.jsonl"); _A, _H = _k + "/ar", _k + "/ha"
ornek_fatura(_g + "/x.pdf", "F-9", "2024-11-05", "1234567890", 10.0)
open(_g + "/notlar.txt", "w").write("pdf değil")
open(_g + "/.gizli.pdf", "w").write("geçici")
_h, _s = hazir_dosyalar(_g, {})
assert _h == [] and set(_s) == {"x.pdf"}, "İlk görüşte hazır değil: boyut iki kez aynı olmalı: " + repr((_h, _s))
_h, _s2 = hazir_dosyalar(_g, _s)
assert _h == [_g + "/x.pdf"], "İki taramada boyut aynıysa hazır"
_b = open(_g + "/x.pdf", "rb").read()
with open(_g + "/y.pdf", "wb") as _f:
    _f.write(_b[:50])
_r, _d1 = tara(_g, _d, _A, _H, {})
assert _r == [] and os.path.exists(_g + "/y.pdf"), "İlk tarama bir şey işlemez"
with open(_g + "/y.pdf", "wb") as _f:
    _f.write(_b)
_r, _d2 = tara(_g, _d, _A, _H, _d1)
assert [x["durum"] for x in _r] == ["tamam"] and os.path.exists(_g + "/y.pdf"), "Yazılmakta olan dosya beklenir, yarım okunmaz: " + repr(_r)
assert "x.pdf" not in _d2, "İşlenen dosya durumdan çıkar"
_r, _d3 = tara(_g, _d, _A, _H, _d2)
assert [x["durum"] for x in _r] == ["tekrar"] and not os.path.exists(_g + "/y.pdf"), "Boyut durdu, işlendi"
open(_g + "/bos.pdf", "w").close()
_, _s = hazir_dosyalar(_g, {})
assert hazir_dosyalar(_g, _s)[0] == [], "Boş dosya hazır sayılmaz"
'''
_b2 = _b1 + A2
A3Y = [(_b2 + A3.replace('if onceki.get(ad) == b and b > 0:', 'if b > 0:'), 'yazılmakta olan dosyayı işliyor'),
       (_b2 + A3.replace(' and not ad.lower().endswith(".pdf")', '').replace('or not ad.lower().endswith(".pdf") ', ''), 'PDF olmayanı da alıyor'),
       (_b2 + A3.replace('''    for y in hazir:
        simdi.pop(os.path.basename(y), None)
''', ''), 'işlenen dosya durumda kalıyor')]
A4 = '''
def ozet_excel(defter, yol):
    tamam = sorted((k for k in defter.ozetler.values() if k.get("durum") == "tamam"), key=lambda k: (k["tarih"], k["no"]))
    wb = Workbook()
    ws = wb.active
    ws.title = "Faturalar"
    ws.append(["No", "Tarih", "VKN", "Matrah", "KDV", "Toplam"])
    for k in tamam:
        ws.append([k["no"], k["tarih"], k["vkn"], k["matrah"], k["kdv"], k["toplam"]])
    n = len(tamam) + 1
    ws.append(["Toplam", None, None, f"=SUM(D2:D{n})", f"=SUM(E2:E{n})", f"=SUM(F2:F{n})"])
    ay = wb.create_sheet("Aylık")
    ay.append(["Ay", "Adet", "Toplam"])
    d = {}
    for k in tamam:
        a = d.setdefault(k["tarih"][:7], [0, 0.0])
        a[0] += 1
        a[1] = round(a[1] + k["toplam"], 2)
    for a in sorted(d):
        ay.append([a, d[a][0], d[a][1]])
    wb.save(yol + ".tmp")
    os.replace(yol + ".tmp", yol)

def gun_isi(gelen, kok):
    os.makedirs(kok, exist_ok=True)
    durum_yol = os.path.join(kok, "tarama.json")
    onceki = json.load(open(durum_yol, encoding="utf-8")) if os.path.exists(durum_yol) else {}
    d = Defter(os.path.join(kok, "defter.jsonl"))
    r, s = tara(gelen, d, os.path.join(kok, "arsiv"), os.path.join(kok, "hatali"), onceki)
    g = durum_yol + ".tmp"
    with open(g, "w", encoding="utf-8") as f:
        json.dump(s, f)
    os.replace(g, durum_yol)
    if r:
        ozet_excel(d, os.path.join(kok, "faturalar.xlsx"))
    say = {}
    for x in r:
        say[x["durum"]] = say.get(x["durum"], 0) + 1
    return say
'''
A4BAS = '''
def ozet_excel(defter, yol):
    pass

def gun_isi(gelen, kok):
    pass  # durum sayımı; çalışmalar arası tarama durumu dosyada
'''
A4T = '''import tempfile
from openpyxl import load_workbook
_k = tempfile.mkdtemp(); _g = _k + "/gelen"; os.makedirs(_g); _K = _k + "/is"
ornek_fatura(_g + "/1.pdf", "F-2", "2024-11-20", "1234567890", 100.0)
ornek_fatura(_g + "/2.pdf", "F-1", "2024-11-05", "1234567890", 200.0)
ornek_fatura(_g + "/3.pdf", "F-3", "2024-12-01", "1234567890", 50.0)
open(_g + "/4.pdf", "wb").write(b"bozuk")
assert gun_isi(_g, _K) == {}, "İlk geçiş yalnız boyut kaydeder"
_r = gun_isi(_g, _K)
assert _r == {"tamam": 3, "hatali": 1}, "İkinci geçiş işler; durum dosyadan okunur: " + repr(_r)
assert os.listdir(_g) == [], "Gelen klasörü boşalır: " + repr(os.listdir(_g))
_w = load_workbook(_K + "/faturalar.xlsx")
_f = _w["Faturalar"]; _a = _w["Aylık"]
assert [_f.cell(i, 1).value for i in range(2, 5)] == ["F-1", "F-2", "F-3"], "Tarihe göre sıralı"
assert _f.cell(2, 6).value == 240.0 and _f.cell(5, 1).value == "Toplam" and _f.cell(5, 6).value == "=SUM(F2:F4)", "Satırlar ve formül"
assert [[c.value for c in s] for s in _a["A2:C3"]] == [["2024-11", 2, 360.0], ["2024-12", 1, 60.0]], "Aylık özet"
assert gun_isi(_g, _K) == {}, "Yeni dosya yoksa bir şey yapmaz"
ornek_fatura(_g + "/5.pdf", "F-1", "2024-11-05", "1234567890", 200.0)
gun_isi(_g, _K)
_r = gun_isi(_g, _K)
assert _r in ({"tekrar": 1}, {"numara_tekrar": 1}), "Tekrar eden fatura özeti değiştirmez: " + repr(_r)
assert load_workbook(_K + "/faturalar.xlsx")["Faturalar"].cell(5, 1).value == "Toplam", "Tekrar eklenmez"
'''
_b3 = _b2 + A3
A4Y = [(_b3 + A4.replace('''    onceki = json.load(open(durum_yol, encoding="utf-8")) if os.path.exists(durum_yol) else {}
''', '''    onceki = {}
''').replace('''    g = durum_yol + ".tmp"
    with open(g, "w", encoding="utf-8") as f:
        json.dump(s, f)
    os.replace(g, durum_yol)
''', ''), 'tarama durumunu saklamıyor, dosya hiç işlenmez'),
       (_b3 + A4.replace('key=lambda k: (k["tarih"], k["no"])', 'key=lambda k: k["no"], reverse=True'), 'sıralama yanlış'),
       (_b3 + A4.replace('if k.get("durum") == "tamam"', 'if "toplam" in k or True'), 'hatalı kayıtları da özete katıyor')]
YEREL = r'''"""fatura_izle.py: klasörü izler, PDF faturaları ayıklar, arşivler. pip install pypdf openpyxl reportlab
python fatura_izle.py --ornek        gelen/ içine örnek PDF yazar
python fatura_izle.py gelen is --bir-kez  iki tarama yapıp çıkar; zamanlayıcıdan çalıştırmak için
python fatura_izle.py gelen is            Ctrl+C ile durana dek 30 saniyede bir tarar"""
import argparse, hashlib, json, logging, os, re, shutil, sys, time
from pypdf import PdfReader
from openpyxl import Workbook

log = logging.getLogger("fatura")
ALAN = {"no": r"Fatura No:\s*(\S+)", "tarih": r"Tarih:\s*(\d{4}-\d{2}-\d{2})", "vkn": r"VKN:\s*(\d{10})", "toplam": r"Genel Toplam:\s*([\d.,]+)"}

def ayikla(yol):
    m = "\n".join(s.extract_text() or "" for s in PdfReader(yol).pages)
    d = {}
    for ad, de in ALAN.items():
        b = re.search(de, m)
        if not b:
            raise ValueError("alan yok: " + ad)
        d[ad] = b.group(1)
    d["toplam"] = float(d["toplam"].replace(".", "").replace(",", "."))
    return d

def tasi(y, klasor):
    os.makedirs(klasor, exist_ok=True)
    h = os.path.join(klasor, os.path.basename(y))
    if os.path.exists(h):
        k, u = os.path.splitext(os.path.basename(y))
        with open(y, "rb") as f:
            h = os.path.join(klasor, k + "_" + hashlib.sha256(f.read()).hexdigest()[:8] + u)
    shutil.move(y, h)

def tara(gelen, kok, onceki):
    defter_yol = os.path.join(kok, "defter.jsonl")
    gorulen = set()
    if os.path.exists(defter_yol):
        gorulen = {json.loads(s)["ozet"] for s in open(defter_yol, encoding="utf-8")}
    simdi = {}
    for ad in sorted(os.listdir(gelen)):
        y = os.path.join(gelen, ad)
        if not ad.lower().endswith(".pdf") or not os.path.isfile(y):
            continue
        b = os.path.getsize(y)
        if onceki.get(ad) != b or b == 0:
            simdi[ad] = b
            continue
        with open(y, "rb") as f:
            oz = hashlib.sha256(f.read()).hexdigest()
        if oz in gorulen:
            tasi(y, os.path.join(kok, "hatali", "tekrar"))
            log.info("tekrar: %s", ad)
            continue
        try:
            d = ayikla(y)
        except Exception as e:
            log.warning("hatalı: %s: %s", ad, e)
            tasi(y, os.path.join(kok, "hatali"))
            d = {"hata": str(e)}
        else:
            tasi(y, os.path.join(kok, "arsiv", d["tarih"][:7]))
            print("işlendi:", ad, d["no"], d["toplam"])
        with open(defter_yol, "a", encoding="utf-8") as f:
            f.write(json.dumps({**d, "ozet": oz}, ensure_ascii=False) + "\n")
        gorulen.add(oz)
    return simdi

def excel(kok):
    y = os.path.join(kok, "defter.jsonl")
    if not os.path.exists(y):
        return
    wb = Workbook()
    ws = wb.active
    ws.append(["No", "Tarih", "Toplam"])
    for s in open(y, encoding="utf-8"):
        k = json.loads(s)
        if "no" in k:
            ws.append([k["no"], k["tarih"], k["toplam"]])
    wb.save(os.path.join(kok, "faturalar.xlsx.tmp"))
    os.replace(os.path.join(kok, "faturalar.xlsx.tmp"), os.path.join(kok, "faturalar.xlsx"))

def ornek():
    from reportlab.pdfgen import canvas
    os.makedirs("gelen", exist_ok=True)
    for ad, no, t in [("a.pdf", "F-1", "1.200,00"), ("b.pdf", "F-2", "360,00")]:
        c = canvas.Canvas(os.path.join("gelen", ad))
        for i, s in enumerate([f"Fatura No: {no}", "Tarih: 2024-11-05", "VKN: 1234567890", f"Genel Toplam: {t} TL"]):
            c.drawString(72, 760 - i * 20, s)
        c.save()
    print("gelen/ hazır")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("gelen", nargs="?")
    ap.add_argument("kok", nargs="?")
    ap.add_argument("--bir-kez", action="store_true")
    ap.add_argument("--aralik", type=float, default=30)
    ap.add_argument("--ornek", action="store_true")
    a = ap.parse_args()
    logging.basicConfig(level=logging.INFO, stream=sys.stderr)
    if a.ornek:
        return ornek()
    os.makedirs(a.kok, exist_ok=True)
    durum, gecis = {}, 0
    while True:
        durum = tara(a.gelen, a.kok, durum)
        excel(a.kok)
        gecis += 1
        if a.bir_kez and gecis == 2:
            return
        time.sleep(0 if a.bir_kez else a.aralik)

if __name__ == "__main__":
    main()
'''
if os.environ.get('P3_Y'): open(os.environ['P3_Y'] + '/fatura_izle.py', 'w').write(YEREL)
_tum = _b3 + A4
ORNEK = '''# Dosya kimliği neden ad değil de içerik özetidir?
import hashlib
a = b"Fatura No: F-1 Toplam: 120,00"
b = b"Fatura No: F-1 Toplam: 120,00"
c = b"Fatura No: F-1 Toplam: 999,00"
oz = lambda x: hashlib.sha256(x).hexdigest()[:12]
print("aynı içerik, farklı dosya adı:", oz(a) == oz(b))
print("aynı numara, farklı içerik:", oz(a) == oz(c), "(bunu VKN ve numara yakalar)")
'''
ders = dict(id='proje-oto-fatura', lv='ileri', mod='İleri bitirme', min=100, needs=[],
 title='Otomasyon projesi: klasör izleme ve fatura ayıklama',
 sum='Gelen klasörüne düşen PDF faturaları gerçekten okur, alanları ayıklar, toplamı denetler, tekrarı içerik ve numarayla yakalar, bozuk dosyayı nedeniyle karantinaya alır, yazılmakta olan dosyayı bekler, Excel özeti çıkarır.',
 goals=['Metin katmanı olan PDF\'ten düzenli ifadeyle alan ayıklayabilirim.', 'Ayıklanan alanları kendi içinde sınayabilirim.', 'Tekrarı dosya özeti ve iş anahtarıyla ayrı ayrı yakalayabilirim.', 'Yarım yazılmış dosyayı işlemeyen tarama kurabilirim.', 'Bozuk dosyayla işi durdurmadan devam edebilirim.'],
 body=f'''<h2>İş</h2>
<p>Tedarikçilerin faturaları ortak klasöre düşüyor, biri her gün tek tek açıp tabloya yazıyor. Görevlerdeki PDF'ler <code>reportlab</code> ile gerçekten üretilir, <code>pypdf</code> ile gerçekten okunur, tarayıcının belleğindeki dosya sisteminde arşive taşınır. Faturalar, VKN ve firma kurgudur.</p>
<div class="warn"><b>Bu yöntemin sınırı</b>Yalnız metin katmanı olan PDF okunur. Taranmış görüntü için OCR gerekir, bu ders onu kapsamaz. Her tedarikçi biçimi farklıysa desen listesi büyür; biçim değişince alan bulunamaz, dosya karantinaya gider. Sessizce yanlış okumaktan iyisi budur. e-Fatura kullanıyorsan kaynağı PDF değil UBL XML'dir: <b>json-csv</b> dersindeki XML yöntemi çok daha güvenilirdir.</div>
{pre(ORNEK)}
<h2>Tekrarın iki yüzü</h2>
<div class="tbl-wrap"><table><tr><th>Durum</th><th>Yakalayan</th></tr><tr><td>Aynı dosya farklı adla</td><td>SHA-256 özeti</td></tr><tr><td>Tedarikçi aynı faturayı yeniden düzenledi</td><td>VKN ve fatura numarası</td></tr><tr><td>Başka firmanın aynı numarası</td><td>Tekrar değil: anahtar VKN ile birlikte</td></tr></table></div>
<h2>Yarım dosya</h2>
<p>Ağ paylaşımına kopyalanan büyük dosya yazılırken görünür. Hemen okursan bozuk sanırsın. Basit ve taşınabilir yöntem: <b>iki taramada boyut aynıysa hazırdır</b>. Kesin bir garanti değildir; en temiz yol, gönderenin önce geçici adla yazıp sonra adlandırmasıdır. <code>watchdog</code> gibi kütüphaneler olay bildirir, ama ağ sürücüsünde olay kaçabilir; bu yüzden düzenli tarama sağlam bir başlangıçtır.</p>
<h2>Adımlar</h2>
<ol><li>PDF metni ve alan ayıklama, tutar denetimi.</li><li>Defter, arşiv, karantina, tekrar.</li><li>Boyut kararlılığıyla tarama.</li><li>Excel özeti ve zamanlanabilir iş.</li></ol>''',
 ex=[
 M('proje-oto-fatura-m1', 'Aynı numaralı fatura başka VKN ile geldi. Ne yapılmalı?', ['Tekrar sayılır', 'Normal işlenir', 'Silinir', 'İkisi birleştirilir'], 1, 'Fatura numarası firmaya özgüdür. Anahtar VKN ile birliktedir.'),
 M('proje-oto-fatura-m2', 'Matrah + KDV, genel toplama eşit değil. Doğru davranış?', ['Karantinaya alıp nedeni yazmak', 'Toplamı yeniden hesaplayıp yazmak', 'Matrahı değiştirip eşitlemek', 'Satırı Excel\'de boş bırakmak'], 0, 'Okuma yanlış olabilir, belge de hatalı olabilir. İnsan bakmalı.'),
 M('proje-oto-fatura-m3', 'Fatura taranmış görüntü. pypdf ne verir?', ['Sayfadaki doğru metni', 'Bir hata mesajını', 'Boş ya da eksik metin', 'Görüntünün tam dosyasını'], 2, 'Metin katmanı yoksa çıkarılacak metin yoktur. OCR gerekir.'),
 T('proje-oto-fatura-t1', 'Ne yazdırır?', '''onceki = {"a.pdf": 100}
simdi = {"a.pdf": 100, "b.pdf": 80, "c.pdf": 0}
print([ad for ad, b in simdi.items() if onceki.get(ad) == b and b > 0])''', ["['a.pdf']", "['a.pdf', 'b.pdf']", "['b.pdf']", '[]'], 0, 'b ilk kez görüldü, c boş. Yalnız a iki taramada aynı.'),
 C('proje-oto-fatura-1', 'Rehberli', '<b>PDF ve alanlar.</b> <code>pdf_metni(yol)</code>: tüm sayfaların metni. <code>ayikla(metin)</code>: <code>{"no", "tarih", "vkn", "matrah", "kdv", "toplam"}</code>; tarih <code>YYYY-AA-GG</code>, VKN 10 hane, tutarlar <code>float</code> (<code>1.234,50</code> biçimi). Bulunamayan alan için adını söyleyen <code>ValueError</code>. <code>matrah + kdv</code> toplama 0,01 içinde eşit değilse mesajında <code>toplam tutmuyor</code> geçen <code>ValueError</code>. <code>ornek_fatura</code> hazır.', A1BAS, A1, A1T, ['PdfReader(yol).pages, her sayfada extract_text()', 'KDV oranı değişebilir: KDV\\s*%\\d+:', 'Bütün eksikleri toplayıp tek hatada söyle.'], 'Toplam denetimi yanlış okunan sayıyı yakalar. Alanın var olması yetmez, tutarlı da olmalı.', yanlis=A1Y),
 C('proje-oto-fatura-2', 'Kendin yaz', '<b>Defter ve arşiv.</b> <code>Defter(yol)</code>: JSON Lines; <code>ozetler</code> (özetten kayda), <code>nolar</code> (<code>(vkn, no)</code>dan kayda), açılışta dosyadan dolar. <code>ozet(yol)</code>: SHA-256. <code>tasi(kaynak, klasor)</code>: ad çakışırsa özetin ilk 8 harfini ekler, üstüne yazmaz. <code>dosya_isle(yol, defter, arsiv, hatali)</code>: özet varsa <code>hatali/tekrar</code>, durum <code>tekrar</code>; okunamazsa <code>hatali/</code>, yanına <code>.neden.txt</code>, durum <code>hatali</code>; <code>(vkn, no)</code> varsa <code>numara_tekrar</code>; yoksa <code>arsiv/AY/</code>, durum <code>tamam</code>.', _b1 + A2BAS, _b2, A2T, ['Özet denetimi okumadan önce: pahalı işi atla.', 'Defteri bellekte değil dosyada tut.'], 'İki tür tekrar iki ayrı anahtar ister. Bozuk dosya tek başına işi durdurmamalı.', yanlis=A2Y, diff=3),
 C('proje-oto-fatura-3', 'Hata avı', '<b>Yarım dosya.</b> <code>hazir_dosyalar(klasor, onceki)</code>: alt klasör, <code>.pdf</code> olmayan ve nokta ile başlayan dosyaları atlar; önceki taramayla boyutu aynı ve boş olmayanları hazır sayar; <code>(hazır yollar, {ad: boyut})</code> döndürür. <code>tara(klasor, defter, arsiv, hatali, onceki)</code>: hazırları işler, işlenenleri yeni durumdan çıkarır, <code>(sonuçlar, yeni durum)</code> döndürür.', _b2 + A3BAS, _b3, A3T, ['onceki.get(ad) == boyut', 'ad.lower().endswith(".pdf")'], 'Dosya görünür olduğu anda bitmiş değildir.', yanlis=A3Y, diff=2),
 C('proje-oto-fatura-4', 'Mini proje', '<b>Zamanlanabilir iş.</b> <code>ozet_excel(defter, yol)</code>: <code>Faturalar</code> sayfası tarih ve numaraya göre sıralı <code>tamam</code> kayıtlar ve son satırda <code>Toplam</code> ile matrah, KDV, toplam formülleri; <code>Aylık</code> sayfası <code>Ay, Adet, Toplam</code>. <code>gun_isi(gelen, kok)</code>: tarama durumunu <code>tarama.json</code> dosyasından alır, atomik yazar, defteri <code>kok/defter.jsonl</code>, arşivi ve karantinayı <code>kok</code> altında tutar; işlenen varsa Excel yazar; durum sayımı döndürür.', _b3 + A4BAS, _tum, A4T, ['Durum süreçler arası korunmalı: her çalışma ayrı süreçtir.', 'Sıralama: key=lambda k: (k["tarih"], k["no"])'], 'Zamanlayıcıdan çalışan iş her seferinde sıfırdan başlar, hatırlaması gereken her şey dosyadadır.', yanlis=A4Y, diff=2),
 Y('proje-oto-fatura-y1', 'Klasörü bilgisayarında izle. Bu betik burada çalıştırıldı, çıktı aşağıda. Gerçek fatura kişisel ve ticari veri içerir: depoya koyma.', ['<code>python -m venv .venv</code>, etkinleştir, <code>python -m pip install pypdf openpyxl reportlab</code>.', 'Kodu <code>fatura_izle.py</code> olarak kaydet. <code>python fatura_izle.py --ornek</code> ile örnek PDF üret.', '<code>python fatura_izle.py gelen is --bir-kez</code>: iki tarama yapar, işler, çıkar. <code>is/faturalar.xlsx</code> dosyasını aç.', 'Sürekli izlemek için <code>--bir-kez</code> olmadan çalıştır, başka terminalden <code>gelen/</code> içine dosya kopyala.', 'Bozuk bir dosya koy: <code>is/hatali/</code> altına gider.'], file=YEREL, fname='fatura_izle.py', cmd='python fatura_izle.py --ornek && python fatura_izle.py gelen is --bir-kez', expect='gelen/ hazır\nişlendi: a.pdf F-1 1200.0\nişlendi: b.pdf F-2 360.0'),
 ],
 faq=[dict(q='OCR eklemek istesem?', a='Tesseract gibi bir araç metni çıkarır, ayıklama adımı aynı kalır. OCR hata yapar: toplam denetimi burada daha da önem kazanır. Bu ders OCR\'ı kapsamıyor.'), dict(q='e-Fatura için de PDF mi okumalıyım?', a='Hayır. UBL XML varsa onu oku: alanlar etiketlidir, biçim değişmez. PDF son çaredir.'), dict(q='LLM ile fatura ayıklasam olmaz mı?', a='Olur, birçok biçimde esnektir, ama rakam uydurma riski vardır. Toplam denetimi ve insan yükseltmesi yine gerekir: proje-iade-ajani yapısı burada da geçerlidir.')],
 mistakes=[dict(bad='shutil.move(y, os.path.join(arsiv, ad))', good='ad çakışırsa özetle yeni ad üret', why='shutil.move aynı adda dosyanın üstüne yazabilir: eski fatura kaybolur.'), dict(bad='a = ayikla(pdf_metni(y))  # döngü içinde, korumasız', good='try: ... except Exception: karantina', why='Tek bozuk dosya bütün geceyi durdurmamalı.'), dict(bad='float(m.replace(",", "."))', good='float(m.replace(".", "").replace(",", "."))', why='Binlik noktası kalırsa çevrilemez ya da yanlış sayı olur.')])
yaz('proje-oto-fatura', 'Otomasyon projesi: fatura', ders)
