#!/usr/bin/env python3
"""Gerçek dosyayla görevler ve yerel köprüler: kaynak/v2/p2/*.js üretir. Çalıştırma: python3 uretec/p2/gercek.py
Testler dosyayı gerçekten yazıp okur; beklenenler test içinde bağımsız hesaplanır."""
import html, json, os
KOK = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
def pre(s): return '<pre class="py">' + html.escape(s.strip('\n'), quote=False) + '</pre>'
def C(id, stage, q, start, sol, tests, hints, why, diff=2, needs=None, kind=None, **k):
    d = dict(t='code', id=id, stage=stage, diff=diff, q='<p>' + q + '</p>', start=start, sol=sol, tests=tests, hints=hints, why=why)
    if needs: d['needs'] = needs
    if kind: d['kind'] = kind
    d.update(k); return d
def M(id, q, o, a, why): return dict(t='mc', id=id, stage='Isınma', q=q, o=o, a=a, why=why)
def Y(id, q, steps, **k): return dict(t='local', id=id, stage='Kendi bilgisayarında', q='<p>' + q + '</p>', steps=steps, **k)
def yaz(ad, baslik, ext):
    s = "/* Kesit Python: " + baslik + ". uretec/p2/gercek.py üretir, elle düzenleme. */\n(function (W) {\n'use strict';\nconst X = W.PY_EXT = W.PY_EXT || [];\nX.push(\n" + ',\n'.join(json.dumps(e, ensure_ascii=False, indent=1) for e in ext) + "\n);\n})(window);\n"
    open(f'{KOK}/kaynak/v2/p2/{ad}.js', 'w', encoding='utf-8').write(s); print(ad, len(s))
TMP = 'import tempfile, os\n_d = tempfile.mkdtemp()\n_y = os.path.join(_d, "t.xlsx")\n'
SEED = '''from openpyxl import Workbook
_w = Workbook(); _s = _w.active; _s.title = "Satış"
for _r in [["Ürün", "Adet", "Fiyat"], ["Çay", 2, 50.0], ["Kahve", 3, 120.5], ["Şeker", 1, 30.0]]:
    _s.append(_r)
_w.save(_y)
'''
# ---------- Excel ----------
g1 = '''from openpyxl import Workbook, load_workbook

def rapor_yaz(yol, satirlar):
    wb = Workbook()
    ws = wb.active
    ws.title = "Satış"
    ws.append(["Ürün", "Adet", "Fiyat"])
    for s in satirlar:
        ws.append(list(s))
    oz = wb.create_sheet("Özet")
    oz["A1"] = "Toplam"
    oz["B1"] = sum(a * f for _, a, f in satirlar)
    wb.save(yol)

def toplam_oku(yol):
    ws = load_workbook(yol)["Satış"]
    return sum(a * f for _, a, f in ws.iter_rows(min_row=2, values_only=True))
'''
g2 = '''from openpyxl import load_workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side

def bicimle(yol):
    wb = load_workbook(yol)
    ws = wb.active
    for h in ws[1]:
        h.font = Font(bold=True)
        h.fill = PatternFill("solid", fgColor="DDEBF7")
        h.alignment = Alignment(horizontal="center")
        h.border = Border(bottom=Side(style="thin"))
    for sat in ws.iter_rows(min_row=2, min_col=3, max_col=3):
        sat[0].number_format = "#,##0.00"
    ws.column_dimensions["A"].width = 24
    ws.freeze_panes = "A2"
    wb.save(yol)
'''
g3 = '''from openpyxl import load_workbook

def formul_ekle(yol):
    wb = load_workbook(yol)
    ws = wb.active
    son = ws.max_row
    ws["D1"] = "Tutar"
    for r in range(2, son + 1):
        ws[f"D{r}"] = f"=B{r}*C{r}"
    ws[f"D{son + 1}"] = f"=SUM(D2:D{son})"
    wb.save(yol)
'''
g4 = '''import re
from openpyxl import load_workbook

def sablon_doldur(sablon, cikti, veri):
    wb = load_workbook(sablon)
    for ws in wb.worksheets:
        for sat in ws.iter_rows():
            for h in sat:
                if isinstance(h.value, str) and "{{" in h.value:
                    def koy(m):
                        if m.group(1) not in veri:
                            raise ValueError("bilinmeyen alan: " + m.group(1))
                        return str(veri[m.group(1)])
                    h.value = re.sub(r"\\{\\{(\\w+)\\}\\}", koy, h.value)
    wb.save(cikti)
'''
g5 = '''import pandas as pd

def rapor(yol, df):
    ozet = df.groupby("sehir", as_index=False)["tutar"].sum()
    with pd.ExcelWriter(yol) as w:
        df.to_excel(w, sheet_name="Ham", index=False)
        ozet.to_excel(w, sheet_name="Şehir", index=False)

def oku(yol):
    return pd.read_excel(yol, sheet_name="Ham", usecols=["sehir", "tutar"], dtype={"sehir": str})
'''
g6 = '''from pathlib import Path
import pandas as pd

def birlestir(klasor):
    parcalar = []
    for dosya in sorted(Path(klasor).glob("*.xlsx")):
        if dosya.name.startswith("~$"):
            continue
        d = pd.read_excel(dosya)
        d["kaynak"] = dosya.name
        parcalar.append(d)
    return pd.concat(parcalar, ignore_index=True)
'''
g7 = '''from openpyxl import load_workbook
from openpyxl.formatting.rule import CellIsRule, ColorScaleRule
from openpyxl.styles import PatternFill
from openpyxl.worksheet.table import Table, TableStyleInfo

def tablo_ekle(yol):
    wb = load_workbook(yol)
    ws = wb.active
    t = Table(displayName="Satislar", ref=ws.dimensions)
    t.tableStyleInfo = TableStyleInfo(name="TableStyleMedium2", showRowStripes=True)
    ws.add_table(t)
    son = ws.max_row
    ws.conditional_formatting.add(f"B2:B{son}", CellIsRule(operator="lessThan", formula=["2"], fill=PatternFill("solid", bgColor="FFC7CE")))
    ws.conditional_formatting.add(f"C2:C{son}", ColorScaleRule(start_type="min", start_color="FFFFFF", end_type="max", end_color="63BE7B"))
    wb.save(yol)

def filtre_ekle(yol):
    wb = load_workbook(yol)
    ws = wb.active
    ws.auto_filter.ref = ws.dimensions
    wb.save(yol)
'''
g8 = '''from openpyxl import load_workbook
from openpyxl.chart import BarChart, Reference

def grafik_ekle(yol):
    wb = load_workbook(yol)
    ws = wb.active
    g = BarChart()
    g.title = "Adet"
    veri = Reference(ws, min_col=2, min_row=1, max_row=ws.max_row)
    g.add_data(veri, titles_from_data=True)
    g.set_categories(Reference(ws, min_col=1, min_row=2, max_row=ws.max_row))
    ws.add_chart(g, "E2")
    wb.save(yol)
'''
g9 = '''import xlsxwriter

def xw_rapor(yol, satirlar):
    wb = xlsxwriter.Workbook(yol)
    ws = wb.add_worksheet("Rapor")
    kalin = wb.add_format({"bold": True})
    para = wb.add_format({"num_format": "#,##0.00"})
    kirmizi = wb.add_format({"bg_color": "#FFC7CE"})
    ws.write_row(0, 0, ["Şehir", "Ciro"], kalin)
    for i, (s, c) in enumerate(satirlar, 1):
        ws.write(i, 0, s)
        ws.write(i, 1, c, para)
    n = len(satirlar)
    ws.conditional_format(1, 1, n, 1, {"type": "cell", "criteria": ">", "value": 1000, "format": kirmizi})
    g = wb.add_chart({"type": "column"})
    g.add_series({"categories": ["Rapor", 1, 0, n, 0], "values": ["Rapor", 1, 1, n, 1], "name": "Ciro"})
    ws.insert_chart("D2", g)
    wb.close()
'''
g10b = '''import pandas as pd

def toplam(yol):
    d = pd.read_excel(yol)
    return d["Tutar"].sum()
'''
g10s = '''import pandas as pd

def toplam(yol):
    d = pd.read_excel(yol, header=2)
    return d["Tutar"].sum()
'''
excel = dict(id='excel-otomasyon', min=30, html=f'''<h2>Gerçek .xlsx dosyasıyla çalışmak</h2><p>Bu bölümdeki kod tarayıcıda gerçek Excel dosyası yazar ve okur. Dosya tarayıcının belleğinde durur; çıktının altındaki <b>İndir</b> düğmesiyle alıp Excel'de açabilirsin. openpyxl ilk kullanımda iner (yaklaşık 270 KB), XlsxWriter yaklaşık 180 KB.</p>
{pre("""from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font

wb = Workbook()
ws = wb.active
ws.title = "Satış"
ws.append(["Ürün", "Adet"])
ws.append(["Çay", 3])
ws["A1"].font = Font(bold=True)
ws["C2"] = "=B2*2"
wb.save("ornek.xlsx")

okunan = load_workbook("ornek.xlsx")
print(okunan.sheetnames, okunan["Satış"]["C2"].value)
print(load_workbook("ornek.xlsx", data_only=True)["Satış"]["C2"].value)""")}
<p>Son satır <code>None</code> yazar: openpyxl formülü hesaplamaz, yalnız yazar. Hesaplanmış değer dosyaya Excel açıp kaydedince girer. Bu yüzden Python'da hesap yapıp sonucu ayrıca denetlemek gerekir.</p>
<div class="tbl-wrap"><table><tr><th>Araç</th><th>Ne zaman</th></tr><tr><td>openpyxl</td><td>Var olan dosyayı açmak, şablon doldurmak, okumak</td></tr><tr><td>XlsxWriter</td><td>Sıfırdan biçimli ve grafikli rapor; var olan dosyayı açamaz</td></tr><tr><td>pandas</td><td>Tabloyu toplu okumak ve yazmak; arka planda ikisini kullanır</td></tr></table></div>
<div class="note"><b>Sınır</b>Tarayıcıda gerçek Excel yok: grafik ve koşullu biçim dosyaya doğru yazılır ve testler dosyayı yeniden okuyarak denetler, ama görünümü ancak indirip Excel'de açınca görürsün. xlwings ve makro bilgisayarında kurulu Excel ister; burada çalışmaz.</div>''', ex=[
 M('excel-otomasyon-gm1', 'openpyxl ile <code>=SUM(A1:A3)</code> yazdın, dosyayı Excel\'de hiç açmadan <code>load_workbook(yol, data_only=True)</code> ile okudun. Hücre ne döner?', ['Toplamın sayı değeri', 'Formül metni', 'None', 'ValueError'], 2, 'data_only son hesaplanan değeri okur. Dosyayı yalnız openpyxl yazdıysa hesaplayan olmamıştır, değer boştur.'),
 M('excel-otomasyon-gm2', 'Elinde biçimli bir şablon var, içine veri yazacaksın. Hangi araç uygun?', ['XlsxWriter, çünkü yalnız yeni dosya yazar', 'openpyxl, çünkü var olan dosyayı açar', 'csv modülü, çünkü en hafifi', 'read_excel, çünkü biçimi korur'], 1, 'XlsxWriter var olan dosyayı açamaz. read_excel biçimi atar, csv biçim taşımaz.'),
 C('excel-otomasyon-g1', 'Rehberli', '<b>Hücre, sayfa, okuma.</b> <code>rapor_yaz(yol, satirlar)</code>: <code>satirlar</code> <code>(urun, adet, fiyat)</code> demetleridir. <code>Satış</code> adlı sayfaya başlık <code>Ürün, Adet, Fiyat</code> ve satırları yaz. <code>Özet</code> adlı ikinci sayfada <code>A1</code> <code>Toplam</code>, <code>B1</code> adet × fiyat toplamı olsun. Kaydet. <code>toplam_oku(yol)</code>: dosyayı <code>load_workbook</code> ile aç, <code>Satış</code> sayfasını <code>iter_rows(min_row=2, values_only=True)</code> ile gez, toplamı döndür.',
   'from openpyxl import Workbook, load_workbook\n\ndef rapor_yaz(yol, satirlar):\n    pass\n\ndef toplam_oku(yol):\n    pass\n', g1,
   TMP + '''rapor_yaz(_y, [("Çay", 2, 50.0), ("Kahve", 3, 100.0)])
assert os.path.exists(_y), "Dosya kaydedilmedi"
_w = load_workbook(_y)
assert _w.sheetnames == ["Satış", "Özet"], "Sayfalar: " + repr(_w.sheetnames)
assert [c.value for c in _w["Satış"][1]] == ["Ürün", "Adet", "Fiyat"], "Başlık satırı yanlış"
assert _w["Satış"]["A3"].value == "Kahve" and _w["Satış"].max_row == 3, "Satırlar yanlış"
assert _w["Özet"]["A1"].value == "Toplam" and _w["Özet"]["B1"].value == 400.0, "Özet B1 400 olmalı"
assert toplam_oku(_y) == 400.0, "toplam_oku yanlış"
_y2 = os.path.join(_d, "t2.xlsx")
rapor_yaz(_y2, [("Su", 4, 5.0)])
assert load_workbook(_y2)["Özet"]["B1"].value == 20.0, "Özet toplamı satırlardan hesaplanmalı"
_w["Satış"].append(["Şeker", 1, 10.0]); _w.save(_y)
assert toplam_oku(_y) == 410.0, "Toplam dosyadan okunmalı, sabit olmamalı"
''', ['wb.create_sheet("Özet") yeni sayfa açar; wb["Satış"] adla erişir.', 'values_only=True hücre nesnesi yerine değeri verir.'], 'Dosya gerçekten yazılıp yeniden açıldı. İndirip Excel\'de açabilirsin.'),
 C('excel-otomasyon-g2', 'Kendin yaz', '<b>Biçim.</b> <code>bicimle(yol)</code> var olan dosyayı açıp aynı dosyaya kaydetsin (ilk sayfa). Başlık satırı: kalın, <code>DDEBF7</code> dolgu, ortalı, altta ince kenarlık. C sütununda veri hücreleri <code>#,##0.00</code> sayı biçimi. A sütunu genişliği 24. İlk satır dondurulsun.',
   'from openpyxl import load_workbook\nfrom openpyxl.styles import Alignment, Border, Font, PatternFill, Side\n\ndef bicimle(yol):\n    pass\n', g2,
   TMP + SEED + '''bicimle(_y)
_s = load_workbook(_y).active
_h = _s["B1"]
assert _h.font.bold, "Başlık kalın olmalı"
assert _h.fill.fgColor.rgb.endswith("DDEBF7"), "Dolgu DDEBF7 olmalı"
assert _h.alignment.horizontal == "center", "Başlık ortalı olmalı"
assert _h.border.bottom.style == "thin", "Alt kenarlık ince olmalı"
assert _s["C2"].number_format == "#,##0.00" and _s["C4"].number_format == "#,##0.00", "C sütunu sayı biçimi eksik"
assert _s["C1"].number_format == "General", "Başlık hücresine sayı biçimi verme"
assert _s.column_dimensions["A"].width == 24, "A sütunu genişliği 24 olmalı"
assert _s.freeze_panes == "A2", "İlk satır dondurulmalı"
assert _s["B3"].value == 3, "Veri bozulmamalı"
''', ['ws[1] ilk satırın hücrelerini verir.', 'PatternFill("solid", fgColor="DDEBF7")', 'iter_rows(min_row=2, min_col=3, max_col=3)'], 'Biçim dosyada kalır; test dosyayı yeniden açıp okuyor.'),
 C('excel-otomasyon-g3', 'Kendin yaz', '<b>Formül.</b> <code>formul_ekle(yol)</code>: ilk sayfada B adet, C fiyat, ilk satır başlık. D1\'e <code>Tutar</code> yaz. Her veri satırına <code>=B2*C2</code> biçiminde formül yaz. Son satırın altına D sütununa <code>=SUM(D2:Dn)</code> ekle. Kaydet.',
   'from openpyxl import load_workbook\n\ndef formul_ekle(yol):\n    pass\n', g3,
   TMP + SEED + '''formul_ekle(_y)
_s = load_workbook(_y).active
assert _s["D1"].value == "Tutar", "D1 Tutar olmalı"
assert _s["D2"].value == "=B2*C2" and _s["D4"].value == "=B4*C4", "Satır formülü yanlış: " + repr(_s["D2"].value)
assert _s["D5"].value == "=SUM(D2:D4)", "Toplam formülü yanlış: " + repr(_s["D5"].value)
assert load_workbook(_y, data_only=True).active["D5"].value is None, "Formül metin olarak yazılmalı, sonucu elle koyma"
''', ['ws.max_row son dolu satırı verir; onu değişkende tut, yazdıkça büyür.'], 'Formül hücrede yaşar; Excel açınca hesaplar. Kaynak veri değişince sonuç da değişir, elle yazılan sayı değişmezdi.'),
 C('excel-otomasyon-g4', 'Kendin yaz', '<b>Şablon doldurma.</b> <code>sablon_doldur(sablon, cikti, veri)</code>: şablonu aç, tüm sayfalardaki <code>{{{{alan}}}}</code> yer tutucularını <code>veri</code> sözlüğünden doldur, <code>cikti</code>\'ya kaydet. Şablon değişmesin, biçim kalsın. Hücrede başka metin de olabilir. Sözlükte olmayan alan için <code>ValueError</code> fırlat.'.replace('{{{{', '{{').replace('}}}}', '}}'),
   'from openpyxl import load_workbook\n\ndef sablon_doldur(sablon, cikti, veri):\n    pass\n', g4,
   TMP + '''from openpyxl import Workbook
from openpyxl.styles import Font
_c = os.path.join(_d, "c.xlsx")
_w = Workbook(); _s = _w.active
_s["A1"] = "Sayın {{musteri}}"; _s["A1"].font = Font(bold=True)
_s["B2"] = "{{tutar}}"; _s["B3"] = 7
_i = _w.create_sheet("İkinci"); _i["A1"] = "Dönem: {{ay}} / {{yil}}"
_w.save(_y)
sablon_doldur(_y, _c, {"musteri": "Ayşe", "tutar": 150, "ay": "Ekim", "yil": 2024})
_o = load_workbook(_c)
assert _o.active["A1"].value == "Sayın Ayşe", "A1: " + repr(_o.active["A1"].value)
assert str(_o.active["B2"].value) == "150", "B2: " + repr(_o.active["B2"].value)
assert _o.active["B3"].value == 7, "Sayı hücresine dokunma"
assert _o["İkinci"]["A1"].value == "Dönem: Ekim / 2024", "Tüm sayfalar ve aynı hücrede iki alan doldurulmalı"
assert _o.active["A1"].font.bold, "Şablonun biçimi korunmalı"
assert load_workbook(_y).active["A1"].value == "Sayın {{musteri}}", "Şablon dosyası değişmemeli"
try:
    sablon_doldur(_y, _c, {"musteri": "Ayşe"})
    assert False, "Eksik alanda ValueError beklenir"
except ValueError:
    pass
''', ['isinstance(h.value, str) ile yalnız metin hücrelerine bak.', 're.sub içinde fonksiyon vererek bilinmeyen alanı yakalarsın.'], 'İşte en sık gelen istek budur: biçimi tasarlanmış dosyayı kodla doldurmak. Şablonu değiştirmemek için farklı dosyaya kaydedilir.'),
 C('excel-otomasyon-g5', 'Rehberli', '<b>pandas ile Excel.</b> <code>rapor(yol, df)</code>: <code>pd.ExcelWriter</code> ile iki sayfa yaz, indeksiz: <code>Ham</code> (df) ve <code>Şehir</code> (<code>sehir</code> başına <code>tutar</code> toplamı; <code>sehir</code>, <code>tutar</code> sütunları). <code>oku(yol)</code>: <code>read_excel</code> ile yalnız <code>Ham</code> sayfasından <code>sehir</code> ve <code>tutar</code> sütunlarını al, <code>sehir</code> türü <code>str</code> olsun.',
   'import pandas as pd\n\ndef rapor(yol, df):\n    pass\n\ndef oku(yol):\n    pass\n', g5,
   TMP + '''_df = pd.DataFrame({"no": [1, 2, 3], "sehir": ["İzmir", "Van", "İzmir"], "tutar": [100.0, 50.0, 25.0]})
rapor(_y, _df)
_t = pd.read_excel(_y, sheet_name=None)
assert list(_t) == ["Ham", "Şehir"], "Sayfalar: " + repr(list(_t))
assert list(_t["Ham"].columns) == ["no", "sehir", "tutar"], "İndeks yazılmamalı: " + repr(list(_t["Ham"].columns))
assert _t["Şehir"].set_index("sehir")["tutar"].to_dict() == {"İzmir": 125.0, "Van": 50.0}, "Şehir sayfası yanlış"
_o = oku(_y)
assert list(_o.columns) == ["sehir", "tutar"] and len(_o) == 3, "usecols ile iki sütun gelmeli: " + repr(list(_o.columns))
_df2 = pd.DataFrame({"sehir": [34, 35], "tutar": [1.0, 2.0]})
rapor(_y, _df2)
assert oku(_y)["sehir"].tolist() == ["34", "35"], "Plaka kodu metin kalmalı: dtype kullan"
''', ['with pd.ExcelWriter(yol) as w: bloğu dosyayı kapatır.', 'df.to_excel(w, sheet_name="Ham", index=False)', 'dtype={"sehir": str}'], 'dtype özellikle kod sütunlarında önemlidir: 007 sayı olarak okunursa baştaki sıfırlar gider.', needs=['pandas']),
 C('excel-otomasyon-g6', 'Kendin yaz', '<b>Klasördeki tüm dosyalar.</b> <code>birlestir(klasor)</code>: klasördeki <code>.xlsx</code> dosyalarını ad sırasıyla oku, Excel\'in geçici dosyalarını (<code>~$</code> ile başlar) atla, her satıra dosya adını <code>kaynak</code> sütunu olarak ekle, tek DataFrame döndür. İndeks 0\'dan başlasın.',
   'from pathlib import Path\nimport pandas as pd\n\ndef birlestir(klasor):\n    pass\n', g6,
   TMP + '''for _a, _v in [("subat.xlsx", [2, 3]), ("ocak.xlsx", [1])]:
    pd.DataFrame({"adet": _v}).to_excel(os.path.join(_d, _a), index=False)
open(os.path.join(_d, "not.txt"), "w").close()
if os.path.exists(_y): os.remove(_y)
open(os.path.join(_d, "~$ocak.xlsx"), "wb").write(b"kilit")
_r = birlestir(_d)
assert len(_r) == 3, "3 satır beklenir: " + str(len(_r))
assert _r["kaynak"].tolist() == ["ocak.xlsx", "subat.xlsx", "subat.xlsx"], "Ad sırası ve kaynak: " + repr(_r["kaynak"].tolist())
assert _r["adet"].tolist() == [1, 2, 3] and list(_r.index) == [0, 1, 2], "İndeks sıfırlanmalı"
''', ['Path(klasor).glob("*.xlsx") ile bul, sorted ile sırala.', 'pd.concat(parcalar, ignore_index=True)'], 'Excel açıkken yanında ~$ kilit dosyası oluşur; okumaya kalkarsan iş çöker. Kaynak sütunu hatalı satırı geri izlemeyi sağlar.', needs=['pandas']),
 C('excel-otomasyon-g7', 'Kendin yaz', '<b>Tablo, koşullu biçim, filtre.</b> <code>tablo_ekle(yol)</code>: ilk sayfanın dolu alanını <code>Satislar</code> adlı Excel tablosu yap (<code>TableStyleMedium2</code>). B sütununda veri hücrelerine: 2\'den küçükse kırmızı dolgu (<code>CellIsRule</code>). C sütununda veri hücrelerine renk skalası (<code>ColorScaleRule</code>). <code>filtre_ekle(yol)</code>: tablo olmayan dosyada dolu alana otomatik filtre koysun. İkisi de aynı dosyaya kaydeder.',
   'from openpyxl import load_workbook\nfrom openpyxl.formatting.rule import CellIsRule, ColorScaleRule\nfrom openpyxl.styles import PatternFill\nfrom openpyxl.worksheet.table import Table, TableStyleInfo\n\ndef tablo_ekle(yol):\n    pass\n\ndef filtre_ekle(yol):\n    pass\n', g7,
   TMP + SEED + '''tablo_ekle(_y)
_s = load_workbook(_y).active
assert "Satislar" in _s.tables, "Satislar tablosu yok"
assert _s.tables["Satislar"].ref == "A1:C4", "Tablo alanı: " + _s.tables["Satislar"].ref
assert _s.tables["Satislar"].tableStyleInfo.name == "TableStyleMedium2", "Tablo stili yanlış"
_k = {str(r.sqref): [x.type for x in r.rules] for r in _s.conditional_formatting}
assert _k.get("B2:B4") == ["cellIs"], "B sütununda CellIsRule: " + repr(_k)
assert _k.get("C2:C4") == ["colorScale"], "C sütununda renk skalası: " + repr(_k)
_r = _s.conditional_formatting
_ku = [x for r in _r if str(r.sqref) == "B2:B4" for x in r.rules][0]
assert _ku.operator == "lessThan" and _ku.formula == ["2"], "Kural 2'den küçük olmalı"
''' + SEED + '''filtre_ekle(_y)
assert load_workbook(_y).active.auto_filter.ref == "A1:C4", "Otomatik filtre alanı yanlış"
''', ['ws.dimensions dolu alanı "A1:C4" olarak verir.', 'ws.add_table(t) tabloyu ekler; adında boşluk olamaz.', 'Excel tablosu ile aynı alanda ayrı auto_filter kullanma; tablonun kendi filtresi var.'], 'Tablo, kullanıcının filtre ve toplam satırını hazır verir. Koşullu biçim yeni veriyle kendini günceller.'),
 C('excel-otomasyon-g8', 'Kendin yaz', '<b>Grafik.</b> <code>grafik_ekle(yol)</code>: ilk sayfada A ürün, B adet, ilk satır başlık. Başlığı <code>Adet</code> olan <code>BarChart</code> kur, veri B sütunu (başlık serinin adı), kategori A sütunu. <code>E2</code> hücresine ekle, kaydet.',
   'from openpyxl import load_workbook\nfrom openpyxl.chart import BarChart, Reference\n\ndef grafik_ekle(yol):\n    pass\n', g8,
   TMP + SEED + '''grafik_ekle(_y)
_s = load_workbook(_y).active
assert len(_s._charts) == 1, "Bir grafik beklenir"
_g = _s._charts[0]
assert type(_g).__name__ == "BarChart", "BarChart olmalı"
assert len(_g.series) == 1, "Tek seri beklenir"
_f = _g.series[0].val.numRef.f
assert _f.endswith("$B$2:$B$4"), "Veri aralığı B2:B4 olmalı: " + _f
assert _g.series[0].cat.strRef is not None or _g.series[0].cat.numRef is not None, "Kategori verilmeli"
_cf = (_g.series[0].cat.strRef or _g.series[0].cat.numRef).f
assert _cf.endswith("$A$2:$A$4"), "Kategori A2:A4 olmalı: " + _cf
assert _g.anchor._from.col == 4 and _g.anchor._from.row == 1, "Grafik E2'de olmalı"
''', ['Reference(ws, min_col=2, min_row=1, max_row=ws.max_row): başlık dahil.', 'g.add_data(veri, titles_from_data=True)'], 'Grafik veriye bağlıdır, resim değildir: kullanıcı Excel\'de sayıyı değiştirince çubuk da değişir.'),
 C('excel-otomasyon-g9', 'Meydan okuma', '<b>XlsxWriter.</b> <code>xw_rapor(yol, satirlar)</code>: <code>satirlar</code> <code>(sehir, ciro)</code> demetleridir. <code>Rapor</code> sayfası: kalın başlık <code>Şehir, Ciro</code>; ciro <code>#,##0.00</code> biçiminde; 1000\'den büyük ciroya koşullu kırmızı dolgu; sütun grafiği <code>D2</code>\'de. Test dosyayı openpyxl ile okur.',
   'import xlsxwriter\n\ndef xw_rapor(yol, satirlar):\n    pass\n', g9,
   TMP + '''xw_rapor(_y, [("İzmir", 1500.5), ("Van", 200.0)])
from openpyxl import load_workbook
_s = load_workbook(_y)["Rapor"]
assert [c.value for c in _s[1]] == ["Şehir", "Ciro"] and _s["A1"].font.bold, "Başlık kalın olmalı"
assert _s["B2"].value == 1500.5 and _s["B2"].number_format == "#,##0.00", "Ciro biçimi yanlış"
_k = [x for r in _s.conditional_formatting if str(r.sqref) == "B2:B3" for x in r.rules]
assert _k and _k[0].operator == "greaterThan" and _k[0].formula == ["1000"], "Koşullu biçim B2:B3, 1000'den büyük"
assert len(_s._charts) == 1 and type(_s._charts[0]).__name__ == "BarChart", "Sütun grafiği beklenir"
assert _s._charts[0].anchor._from.col == 3, "Grafik D sütununda olmalı"
''', ['wb.close() dosyayı yazar; unutursan dosya oluşmaz.', 'Satır ve sütun 0\'dan başlar: A1 = (0, 0).'], 'XlsxWriter yalnız yazar, ama biçim ve grafik seçenekleri geniştir. Sıfırdan rapor için çoğu zaman en kısa yol budur.', diff=3),
 C('excel-otomasyon-g10', 'Hata avı', '<b>Hatayı bul ve düzelt.</b> Dosyanın ilk iki satırı rapor başlığı, gerçek başlık üçüncü satırda. <code>toplam(yol)</code> <code>KeyError: \'Tutar\'</code> veriyor. Düzelt.',
   g10b, g10s, TMP + '''from openpyxl import Workbook
_w = Workbook(); _s = _w.active
for _r in [["Bayi raporu"], ["Ocak 2024"], ["Bayi", "Tutar"], ["A", 10], ["B", 5]]:
    _s.append(_r)
_w.save(_y)
assert toplam(_y) == 15, "Toplam 15 olmalı"
''', ['pandas ilk satırı başlık sanar.', 'header=2: üçüncü satır (0\'dan sayılır).'], 'Elle hazırlanan Excel dosyalarında tablo nadiren ilk satırdan başlar. Önce head() ile bak.', kind='bug', needs=['pandas']),
])
# ---------- SQL ----------
s1 = '''import pandas as pd
from sqlalchemy import create_engine, text

def sehir_cirosu(engine, en_az):
    sql = text("SELECT sehir, SUM(tutar) AS ciro FROM satis GROUP BY sehir HAVING SUM(tutar) >= :en_az ORDER BY ciro DESC")
    return pd.read_sql(sql, engine, params={"en_az": en_az})
'''
s2 = '''import pandas as pd
import veri
from sqlalchemy import create_engine

def yukle(engine):
    d = veri.oku("anadolu_market", "orders")
    d.to_sql("siparis", engine, if_exists="replace", index=False)
    return pd.read_sql("SELECT status, COUNT(*) AS adet FROM siparis GROUP BY status ORDER BY status", engine)

def ekle(engine, df):
    df.to_sql("gunluk", engine, if_exists="append", index=False)
    return pd.read_sql("SELECT COUNT(*) AS n FROM gunluk", engine)["n"][0]
'''
sql = dict(id='sql-analitik', min=20, html=f'''<h2>pandas ve SQLAlchemy: read_sql ve to_sql</h2><p>İşte veri çoğu zaman bir veritabanındadır. pandas, SQLAlchemy motoru (engine) üzerinden okur ve yazar. Burada SQLite kullanıyoruz; aynı kod bağlantı adresi değişince başka veritabanında da çalışır.</p>
{pre("""import pandas as pd
from sqlalchemy import create_engine, text

engine = create_engine("sqlite:///:memory:")
pd.DataFrame({"sehir": ["İzmir", "Van"], "tutar": [100, 40]}).to_sql("satis", engine, index=False)
print(pd.read_sql(text("SELECT * FROM satis WHERE tutar > :esik"), engine, params={"esik": 50}))""")}
<p>Değeri f-string ile değil parametreyle ver: SQL enjeksiyonunu önler. <code>to_sql</code> için <code>if_exists</code> üç değer alır: <code>fail</code> (varsayılan), <code>replace</code>, <code>append</code>. <code>replace</code> tabloyu silip yeniden kurar; indeks ve kısıtlar da gider, bu yüzden üretimde dikkatli kullan.</p>
<h3>SQL Server, Oracle, MySQL</h3><p>Değişen yalnız bağlantı adresi ve sürücüdür. Bu sürücüler ağ ister, tarayıcıda çalışmaz; aşağıdaki görevi kendi bilgisayarında yap.</p>
<div class="tbl-wrap"><table><tr><th>Veritabanı</th><th>Sürücü</th><th>SQLAlchemy adresi</th><th>İlk 10 satır</th></tr>
<tr><td>SQL Server</td><td>pyodbc</td><td><code>mssql+pyodbc://kul:sifre@sunucu/db?driver=ODBC+Driver+18+for+SQL+Server</code></td><td><code>SELECT TOP 10 ...</code></td></tr>
<tr><td>Oracle</td><td>oracledb</td><td><code>oracle+oracledb://kul:sifre@sunucu:1521/?service_name=ORCL</code></td><td><code>FETCH FIRST 10 ROWS ONLY</code></td></tr>
<tr><td>MySQL</td><td>pymysql</td><td><code>mysql+pymysql://kul:sifre@sunucu:3306/db</code></td><td><code>LIMIT 10</code></td></tr>
<tr><td>PostgreSQL</td><td>psycopg</td><td><code>postgresql+psycopg://kul:sifre@sunucu:5432/db</code></td><td><code>LIMIT 10</code></td></tr></table></div>
<div class="warn"><b>Şifreyi koda yazma</b>Adresi ortam değişkeninden oku. Sorgunun türü de değişir: SQL Server'da T-SQL, Oracle'da PL/SQL. Söz dizimi farkları Kesit SQL'de anlatılır.</div>''', ex=[
 C('sql-analitik-g1', 'Rehberli', '<b>read_sql ve parametre.</b> <code>sehir_cirosu(engine, en_az)</code>: <code>satis(sehir, tutar)</code> tablosundan şehir başına toplamı <code>ciro</code> adıyla, toplamı <code>en_az</code> ve üstü olan şehirleri, ciroya göre azalan döndür. <code>pd.read_sql</code> ve parametre kullan; değeri metne gömme.',
   'import pandas as pd\nfrom sqlalchemy import create_engine, text\n\ndef sehir_cirosu(engine, en_az):\n    pass\n', s1,
   '''_e = create_engine("sqlite:///:memory:")
pd.DataFrame({"sehir": ["İzmir", "Van", "İzmir", "Kars"], "tutar": [100, 40, 50, 5]}).to_sql("satis", _e, index=False)
_r = sehir_cirosu(_e, 40)
assert list(_r.columns) == ["sehir", "ciro"], "Sütunlar: " + repr(list(_r.columns))
assert _r["sehir"].tolist() == ["İzmir", "Van"] and _r["ciro"].tolist() == [150, 40], "Sonuç: " + repr(_r.to_dict("list"))
assert sehir_cirosu(_e, 100)["sehir"].tolist() == ["İzmir"], "Eşik parametreden gelmeli"
assert "params" in __kod__, "Değeri params ile ver"
''', ['text("... :en_az") ve params={"en_az": en_az}', 'Toplam üzerinde koşul için HAVING.'], 'read_sql sonucu doğrudan DataFrame verir. Filtreyi SQL\'de yapmak büyük tabloda satırları Python\'a hiç taşımaz.', needs=['pandas', 'sqlalchemy', 'sqlite3']),
 C('sql-analitik-g2', 'Kendin yaz', '<b>to_sql.</b> <code>yukle(engine)</code>: <code>veri.oku("anadolu_market", "orders")</code> tablosunu <code>siparis</code> adıyla, indeksiz, varsa üzerine yazarak yükle; sonra SQL ile <code>status</code> başına sayıyı (<code>status</code>, <code>adet</code>; <code>status</code> sıralı) döndür. <code>ekle(engine, df)</code>: df\'i <code>gunluk</code> tablosuna ekleyerek yazsın ve tablodaki toplam satır sayısını döndürsün.',
   'import pandas as pd\nimport veri\nfrom sqlalchemy import create_engine\n\ndef yukle(engine):\n    pass\n\ndef ekle(engine, df):\n    pass\n', s2,
   '''_e = create_engine("sqlite:///:memory:")
_b = veri.oku("anadolu_market", "orders")
_r = yukle(_e); _r = yukle(_e)
assert _r["adet"].sum() == len(_b), "İki kez yüklemede satır çiftlenmemeli (replace)"
assert _r.set_index("status")["adet"].to_dict() == _b.groupby("status").size().to_dict(), "Durum sayıları yanlış"
assert _r["status"].tolist() == sorted(_r["status"]), "status sıralı olmalı"
assert "index" not in pd.read_sql("SELECT * FROM siparis LIMIT 1", _e).columns, "İndeks tabloya yazılmamalı"
_d = pd.DataFrame({"a": [1, 2]})
assert ekle(_e, _d) == 2 and ekle(_e, _d) == 4, "append ile eklenmeli"
''', ['df.to_sql("siparis", engine, if_exists="replace", index=False)', 'if_exists="append" mevcut tabloya ekler.'], 'replace basit ama tabloyu yeniden kurar; append idempotent değildir. Çift satır önlemek için ETL bitirmesindeki doğal anahtar yöntemi gerekir.', needs=['pandas', 'sqlalchemy', 'sqlite3']),
 Y('sql-analitik-gy1', 'Gerçek bir sunucuya bağlan. Sunucu yoksa MySQL ya da SQL Server\'ın Docker imajı işe yarar. Bu betik bu ortamda çalıştırılmadı; adresi kendi sunucuna göre düzenle.', ['Sürücüyü kur: <code>python -m pip install sqlalchemy pandas pymysql</code> (SQL Server için <code>pyodbc</code> ve ODBC sürücüsü, Oracle için <code>oracledb</code>).', 'Adresi ortam değişkenine yaz, koda yazma: <code>VERITABANI_URL</code>.', 'Betiği çalıştır. Sürüm satırı görünmeli.'], file='import os\n\nimport pandas as pd\nfrom sqlalchemy import create_engine, text\n\nengine = create_engine(os.environ["VERITABANI_URL"])\nwith engine.connect() as con:\n    print(con.execute(text("SELECT VERSION()")).scalar())   # SQL Server: SELECT @@VERSION; Oracle: SELECT banner FROM v$version\n\ndf = pd.DataFrame({"a": [1, 2]})\ndf.to_sql("kesit_deneme", engine, if_exists="replace", index=False)\nprint(pd.read_sql("SELECT * FROM kesit_deneme", engine))\n', fname='baglan.py', cmd='python baglan.py'),
])
# ---------- Word, PDF ----------
d1 = '''from docx import Document

def belge_yaz(yol, baslik, maddeler, satirlar):
    d = Document()
    d.add_heading(baslik, level=1)
    for m in maddeler:
        d.add_paragraph(m)
    t = d.add_table(rows=1, cols=2)
    t.rows[0].cells[0].text = "Ürün"
    t.rows[0].cells[1].text = "Tutar"
    for ad, tutar in satirlar:
        h = t.add_row().cells
        h[0].text = ad
        h[1].text = str(tutar)
    d.save(yol)

def belge_oku(yol):
    d = Document(yol)
    return {"paragraflar": [p.text for p in d.paragraphs], "tablo": [[h.text for h in r.cells] for r in d.tables[0].rows]}
'''
d2 = '''import re
from docx import Document

def _doldur(p, veri):
    if "{{" not in p.text:
        return
    yeni = re.sub(r"\\{\\{(\\w+)\\}\\}", lambda m: str(veri[m.group(1)]), p.text)
    p.runs[0].text = yeni
    for r in p.runs[1:]:
        r.text = ""

def word_doldur(sablon, cikti, veri):
    d = Document(sablon)
    for p in d.paragraphs:
        _doldur(p, veri)
    for t in d.tables:
        for s in t.rows:
            for h in s.cells:
                for p in h.paragraphs:
                    _doldur(p, veri)
    d.save(cikti)
'''
p1 = '''from reportlab.pdfgen import canvas

def fatura_pdf(yol, no, satirlar):
    c = canvas.Canvas(yol)
    c.drawString(72, 780, f"Fatura No: {no}")
    y = 750
    for ad, tutar in satirlar:
        c.drawString(72, y, f"{ad}: {tutar}")
        y -= 20
    c.showPage()
    c.drawString(72, 780, f"Toplam: {sum(t for _, t in satirlar)}")
    c.save()
'''
p2 = '''import re
from pypdf import PdfReader

def toplam_oku(yol):
    r = PdfReader(yol)
    metin = "\\n".join(s.extract_text() for s in r.pages)
    m = re.search(r"Toplam:\\s*(\\d+)", metin)
    return {"sayfa": len(r.pages), "toplam": int(m.group(1)) if m else None}
'''
p3 = '''from pypdf import PdfReader, PdfWriter

def birlestir(yollar, cikti):
    w = PdfWriter()
    for y in yollar:
        for s in PdfReader(y).pages:
            w.add_page(s)
    w.write(cikti)

def bol(yol, kalip):
    adlar = []
    for i, s in enumerate(PdfReader(yol).pages, 1):
        w = PdfWriter()
        w.add_page(s)
        ad = kalip.format(i)
        w.write(ad)
        adlar.append(ad)
    return adlar
'''
PDFSEED = '''from reportlab.pdfgen import canvas
def _pdf(y, sayfalar):
    c = canvas.Canvas(y)
    for s in sayfalar:
        c.drawString(72, 780, s); c.showPage()
    c.save()
'''
ofis = dict(id='pdf-word-otomasyon', min=25, html=f'''<h2>Gerçek Word ve PDF dosyası</h2><p>Aşağıdaki görevler tarayıcıda gerçek <code>.docx</code> ve <code>.pdf</code> yazar, açar ve okur; sonucu indirip kendi programında görebilirsin. İlk kullanımda inenler: python-docx yaklaşık 250 KB, pypdf yaklaşık 410 KB, reportlab yaklaşık 2 MB.</p>
{pre("""from docx import Document

d = Document()
d.add_heading("Kira sözleşmesi", level=1)
d.add_paragraph("Taraflar aşağıdadır.")
d.save("ornek.docx")
print([p.text for p in Document("ornek.docx").paragraphs])""")}
<div class="tbl-wrap"><table><tr><th>İş</th><th>Burada</th><th>Bilgisayarında</th></tr><tr><td>Word okuma, yazma, şablon</td><td>python-docx</td><td>docxtpl ile Jinja2 şablon</td></tr><tr><td>PDF metin okuma, birleştirme, bölme</td><td>pypdf</td><td>Tablo için pdfplumber</td></tr><tr><td>PDF üretme</td><td>reportlab</td><td>HTML'den WeasyPrint</td></tr><tr><td>Taranmış PDF (OCR)</td><td>Yok</td><td>pytesseract</td></tr></table></div>
<div class="warn"><b>Türkçe harf</b>reportlab'ın hazır yazı tiplerinde ş, ğ, ı gibi harfler yoktur. Gerçek belgede <code>pdfmetrics.registerFont(TTFont(...))</code> ile bir TTF yazı tipi kaydet. Görevler bu yüzden İngilizce harflerle yazılmış metin kullanır.</div>
<h3>RPA araçları ve Python</h3><p>UiPath ve Power Automate ekrandaki düğmelere basar; API'si olmayan eski programlar için uygundur, kod bilmeyen ekipler de kullanır ama lisans ister ve ekran değişince kırılır. Python dosya ve veri işinde daha sağlamdır, test edilir, ücretsizdir ama ekran otomasyonu zayıftır. Önce API ya da dosya yolunu ara; yoksa RPA düşün.</p>''', ex=[
 C('pdf-word-otomasyon-g1', 'Rehberli', '<b>Word yaz ve oku.</b> <code>belge_yaz(yol, baslik, maddeler, satirlar)</code>: 1. düzey başlık, her madde için paragraf, başlığı <code>Ürün, Tutar</code> olan tablo. <code>belge_oku(yol)</code>: <code>{"paragraflar": [...metinler], "tablo": [[hücre metinleri], ...]}</code> döndürsün (başlık da bir paragraftır).',
   'from docx import Document\n\ndef belge_yaz(yol, baslik, maddeler, satirlar):\n    pass\n\ndef belge_oku(yol):\n    pass\n', d1,
   '''import tempfile, os
_y = os.path.join(tempfile.mkdtemp(), "t.docx")
belge_yaz(_y, "Teklif", ["Birinci madde", "İkinci madde"], [("Çay", 50), ("Kahve", 120)])
_o = belge_oku(_y)
assert _o["paragraflar"] == ["Teklif", "Birinci madde", "İkinci madde"], "Paragraflar: " + repr(_o["paragraflar"])
assert _o["tablo"] == [["Ürün", "Tutar"], ["Çay", "50"], ["Kahve", "120"]], "Tablo: " + repr(_o["tablo"])
_d = Document(_y)
assert _d.paragraphs[0].style.name == "Heading 1", "İlk paragraf başlık olmalı"
_d.add_paragraph("Ek"); _d.save(_y)
assert belge_oku(_y)["paragraflar"][-1] == "Ek", "belge_oku dosyadan okumalı"
''', ['d.add_heading(baslik, level=1)', 't.add_row().cells yeni satırın hücrelerini verir.', 'Hücreye metin yazılır: str(tutar).'], 'docx bir zip içinde XML\'dir. python-docx bunu paragraf ve tablo olarak gösterir.'),
 C('pdf-word-otomasyon-g2', 'Kendin yaz', '<b>Word şablonu.</b> <code>word_doldur(sablon, cikti, veri)</code>: paragraflardaki ve tablo hücrelerindeki <code>{{alan}}</code> yer tutucularını doldur. Dikkat: Word bir yer tutucuyu birkaç parçaya (run) bölebilir; yalnız tek parçaya bakan kod onu bulamaz. Şablon değişmesin.',
   'import re\nfrom docx import Document\n\ndef word_doldur(sablon, cikti, veri):\n    pass\n', d2,
   '''import tempfile, os
_k = tempfile.mkdtemp(); _s = os.path.join(_k, "s.docx"); _c = os.path.join(_k, "c.docx")
_d = Document()
_p = _d.add_paragraph(); _p.add_run("Sayın {{mus"); _p.add_run("teri}}, borcunuz ").bold = False; _p.add_run("{{tutar}} TL")
_d.add_paragraph("Değişmeyen satır")
_t = _d.add_table(rows=1, cols=1); _t.rows[0].cells[0].text = "Vade: {{vade}}"
_d.save(_s)
word_doldur(_s, _c, {"musteri": "Ayşe", "tutar": 150, "vade": "Ekim"})
_o = Document(_c)
assert _o.paragraphs[0].text == "Sayın Ayşe, borcunuz 150 TL", "Parçalara bölünmüş alan: " + repr(_o.paragraphs[0].text)
assert _o.paragraphs[1].text == "Değişmeyen satır", "Yer tutucusuz paragrafa dokunma"
assert _o.tables[0].rows[0].cells[0].text == "Vade: Ekim", "Tablo hücresi doldurulmalı"
assert "{{" in Document(_s).paragraphs[0].text, "Şablon değişmemeli"
''', ['p.text tüm parçaları birleştirir; yeni metni ilk parçaya yaz, diğerlerini boşalt.', 'Tablo hücrelerinin de .paragraphs listesi vardır.'], 'Word\'de yazım denetimi bile metni parçalara böler. Bu tuzağı bilmeyen kod bazı belgelerde sessizce çalışmaz. Karmaşık şablon için docxtpl daha rahattır.'),
 C('pdf-word-otomasyon-g3', 'Kendin yaz', '<b>PDF üret.</b> <code>fatura_pdf(yol, no, satirlar)</code>: reportlab ile iki sayfa yaz. Birinci sayfa: <code>Fatura No: {no}</code> ve her satır için <code>{ad}: {tutar}</code>. İkinci sayfa: <code>Toplam: {toplam}</code>. Test dosyayı pypdf ile okur.',
   'from reportlab.pdfgen import canvas\n\ndef fatura_pdf(yol, no, satirlar):\n    pass\n', p1,
   '''import tempfile, os
from pypdf import PdfReader
_y = os.path.join(tempfile.mkdtemp(), "f.pdf")
fatura_pdf(_y, "A-12", [("Cay", 50), ("Kahve", 120)])
_r = PdfReader(_y)
assert len(_r.pages) == 2, "İki sayfa beklenir: " + str(len(_r.pages))
_a = _r.pages[0].extract_text()
assert "Fatura No: A-12" in _a and "Cay: 50" in _a and "Kahve: 120" in _a, "Birinci sayfa: " + repr(_a)
assert "Toplam: 170" in _r.pages[1].extract_text(), "Toplam ikinci sayfada 170 olmalı"
''', ['c.drawString(x, y, metin); y yukarıdan aşağı azalır.', 'c.showPage() sayfayı bitirir; c.save() dosyayı yazar.'], 'PDF sayfaya konum vererek yazılır, Word gibi akmaz. Uzun tabloda sayfa taşmasını sen yönetirsin.'),
 C('pdf-word-otomasyon-g4', 'Kendin yaz', '<b>PDF oku.</b> <code>toplam_oku(yol)</code>: pypdf ile tüm sayfaların metnini birleştir, <code>Toplam: 170</code> kalıbındaki sayıyı bul. <code>{"sayfa": sayfa_sayısı, "toplam": sayı ya da None}</code> döndür.',
   'import re\nfrom pypdf import PdfReader\n\ndef toplam_oku(yol):\n    pass\n', p2,
   'import tempfile, os\n' + PDFSEED + '''_k = tempfile.mkdtemp()
_a = os.path.join(_k, "a.pdf"); _pdf(_a, ["Fatura", "Toplam: 170"])
assert toplam_oku(_a) == {"sayfa": 2, "toplam": 170}, repr(toplam_oku(_a))
_b = os.path.join(_k, "b.pdf"); _pdf(_b, ["Toplam yok"])
assert toplam_oku(_b) == {"sayfa": 1, "toplam": None}, "Kalıp yoksa None"
''', ['s.extract_text() her sayfanın metnini verir.', 're.search(r"Toplam:\\s*(\\d+)", metin)'], 'Metin katmanı olan PDF\'lerde çalışır. Taranmış belgede extract_text boş döner; OCR gerekir. Boş sonucu her zaman denetle.'),
 C('pdf-word-otomasyon-g5', 'Kendin yaz', '<b>Birleştir ve böl.</b> <code>birlestir(yollar, cikti)</code>: PDF\'leri sırayla tek dosyada birleştirsin. <code>bol(yol, kalip)</code>: her sayfayı ayrı dosyaya yazsın; dosya adı <code>kalip.format(sayfa_no)</code> (1\'den başlar), ad listesini döndürsün.',
   'from pypdf import PdfReader, PdfWriter\n\ndef birlestir(yollar, cikti):\n    pass\n\ndef bol(yol, kalip):\n    pass\n', p3,
   'import tempfile, os\n' + PDFSEED + '''_k = tempfile.mkdtemp()
_a = os.path.join(_k, "a.pdf"); _b = os.path.join(_k, "b.pdf"); _c = os.path.join(_k, "c.pdf")
_pdf(_a, ["Bir", "Iki"]); _pdf(_b, ["Uc"])
birlestir([_b, _a], _c)
_r = PdfReader(_c)
assert [s.extract_text().strip() for s in _r.pages] == ["Uc", "Bir", "Iki"], "Sıra korunmalı"
_ad = bol(_c, os.path.join(_k, "p{}.pdf"))
assert [os.path.basename(x) for x in _ad] == ["p1.pdf", "p2.pdf", "p3.pdf"], repr(_ad)
assert PdfReader(_ad[2]).pages[0].extract_text().strip() == "Iki" and len(PdfReader(_ad[2]).pages) == 1, "Her dosyada tek sayfa"
''', ['w = PdfWriter(); w.add_page(sayfa); w.write(yol)', 'bol içinde her sayfa için yeni PdfWriter aç.'], 'Yeni PdfWriter açmayı unutursan her dosya öncekileri de taşır; en sık hata budur.'),
])
ofis2 = dict(id='ofis-otomasyon', min=8, ex=[
 Y('ofis-otomasyon-gy1', 'E-postayı gerçekten gönder, ama dışarı çıkmadan: bilgisayarında sahte bir SMTP sunucusu aç, mesaj terminaline düşsün. Bu görev bu ortamda çalıştırıldı.', ['<code>python -m pip install aiosmtpd</code> yaz.', 'Bir terminalde sunucuyu başlat: <code>python -m aiosmtpd -n -l 127.0.0.1:8025</code>.', 'Kodu <code>gonder.py</code> olarak kaydet, ikinci terminalde çalıştır.', 'İlk terminalde mesajı gör. Gerçek sunucuda <code>starttls()</code> ve <code>login()</code> eklenir; şifre ortam değişkeninden okunur.'], file='import smtplib\nfrom email.message import EmailMessage\n\nm = EmailMessage()\nm["Subject"] = "Haftalik rapor"\nm["From"] = "rapor@ornek.test"\nm["To"] = "mudur@ornek.test"\nm.set_content("Rapor ektedir.")\nm.add_attachment(b"a,b\\n1,2\\n", maintype="text", subtype="csv", filename="rapor.csv")\n\nwith smtplib.SMTP("127.0.0.1", 8025) as s:\n    s.send_message(m)\nprint("gonderildi")\n', fname='gonder.py', cmd='python gonder.py', expect='gonderildi'),
])
# ---------- XML ----------
FAT = '''_XML = """<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2">
  <cbc:ID>KST2024000000123</cbc:ID>
  <cbc:IssueDate>2024-10-15</cbc:IssueDate>
  <cac:AccountingSupplierParty><cac:Party><cac:PartyName><cbc:Name>Anadolu Market A.Ş.</cbc:Name></cac:PartyName></cac:Party></cac:AccountingSupplierParty>
  <cac:InvoiceLine><cbc:InvoicedQuantity unitCode="C62">2</cbc:InvoicedQuantity><cbc:LineExtensionAmount currencyID="TRY">100.50</cbc:LineExtensionAmount><cac:Item><cbc:Name>Çay</cbc:Name></cac:Item></cac:InvoiceLine>
  <cac:InvoiceLine><cbc:InvoicedQuantity unitCode="C62">1</cbc:InvoicedQuantity><cbc:LineExtensionAmount currencyID="TRY">49.50</cbc:LineExtensionAmount><cac:Item><cbc:Name>Kahve</cbc:Name></cac:Item></cac:InvoiceLine>
  <cac:LegalMonetaryTotal><cbc:PayableAmount currencyID="TRY">150.00</cbc:PayableAmount></cac:LegalMonetaryTotal>
</Invoice>
"""
'''
NSD = '''NS = {"inv": "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
      "cbc": "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
      "cac": "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"}
'''
x1 = '''import xml.etree.ElementTree as ET
from decimal import Decimal
''' + NSD + '''
def fatura_oku(yol):
    kok = ET.parse(yol).getroot()
    kalemler = []
    for s in kok.findall("cac:InvoiceLine", NS):
        kalemler.append({"ad": s.find("cac:Item/cbc:Name", NS).text,
                         "miktar": int(s.find("cbc:InvoicedQuantity", NS).text),
                         "tutar": Decimal(s.find("cbc:LineExtensionAmount", NS).text)})
    return {"no": kok.find("cbc:ID", NS).text,
            "satici": kok.find(".//cac:PartyName/cbc:Name", NS).text,
            "toplam": Decimal(kok.find("cac:LegalMonetaryTotal/cbc:PayableAmount", NS).text),
            "kalemler": kalemler}

def tutarli_mi(f):
    return sum(k["tutar"] for k in f["kalemler"]) == f["toplam"]
'''
x2 = '''import xml.etree.ElementTree as ET

def siparis_xml(no, kalemler):
    kok = ET.Element("Siparis", {"no": str(no)})
    for ad, adet in kalemler:
        k = ET.SubElement(kok, "Kalem", {"adet": str(adet)})
        k.text = ad
    return ET.tostring(kok, encoding="unicode")

def adet_toplam(metin):
    return sum(int(k.get("adet")) for k in ET.fromstring(metin).findall("Kalem"))
'''
x3b = '''import xml.etree.ElementTree as ET

def satir_sayisi(metin):
    kok = ET.fromstring(metin)
    return len(kok.findall("InvoiceLine"))
'''
x3s = '''import xml.etree.ElementTree as ET

def satir_sayisi(metin):
    kok = ET.fromstring(metin)
    return len(kok.findall("{urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2}InvoiceLine"))
'''
xml = dict(id='json-csv', min=18, html=f'''<h2>XML ve ElementTree</h2><p>Kurumsal entegrasyonlarda JSON kadar XML de karşına çıkar: e-Fatura, banka dosyaları, eski servisler. Python'ın standart kütüphanesi okur ve yazar, paket gerekmez.</p>
{pre("""import xml.etree.ElementTree as ET

kok = ET.fromstring('<Siparis no="7"><Kalem adet="2">Çay</Kalem><Kalem adet="1">Kahve</Kalem></Siparis>')
print(kok.tag, kok.get("no"))
for k in kok.findall("Kalem"):
    print(k.text, k.get("adet"))""")}
<p><code>.text</code> etiketin içindeki metni, <code>.get()</code> özniteliği verir. Her şey metindir; sayıya kendin çevirirsin, para için <code>Decimal</code> kullan.</p>
<h3>Ad alanları (namespace)</h3><p>e-Fatura gibi belgelerde her etiketin bir ad alanı vardır. <code>findall("InvoiceLine")</code> burada boş döner ve hata vermez; en sık yapılan hata budur. Ön ek sözlüğü vererek ararsın: <code>kok.findall("cac:InvoiceLine", NS)</code>.</p>
<div class="note"><b>Kurgu örnek</b>Görevdeki fatura UBL biçimine benzetilmiş kurgu bir örnektir, geçerli bir e-Fatura değildir. Gerçek UBL-TR belgesi çok daha geniştir; şeması için Gelir İdaresi Başkanlığı kılavuzlarına bak. Güvenilmeyen kaynaktan gelen XML için <code>defusedxml</code> kullan.</div>''', ex=[
 M('json-csv-gm1', 'Ad alanlı bir belgede <code>kok.findall("InvoiceLine")</code> ne döner?', ['Boş liste', 'Tüm satırlar', 'Hata fırlatır', 'None'], 0, 'Etiketin tam adı ad alanını da içerir, bu ad eşleşmez ve boş liste döner. Hata çıkmadığı için fark etmek zordur.'),
 C('json-csv-g1', 'Rehberli', '<b>e-Fatura benzeri XML oku.</b> <code>fatura_oku(yol)</code>: dosyayı <code>ET.parse</code> ile aç. Döndür: <code>no</code>, <code>satici</code>, <code>toplam</code> (Decimal), <code>kalemler</code> (<code>{"ad", "miktar": int, "tutar": Decimal}</code> listesi). <code>tutarli_mi(f)</code>: kalem tutarları toplamı toplama eşit mi? Kurgu örnek test dosyasında; yapısı: <code>cbc:ID</code>, <code>cac:AccountingSupplierParty/cac:Party/cac:PartyName/cbc:Name</code>, <code>cac:InvoiceLine</code> içinde <code>cbc:InvoicedQuantity</code>, <code>cbc:LineExtensionAmount</code>, <code>cac:Item/cbc:Name</code>, <code>cac:LegalMonetaryTotal/cbc:PayableAmount</code>.',
   'import xml.etree.ElementTree as ET\nfrom decimal import Decimal\n' + NSD + '\ndef fatura_oku(yol):\n    pass\n\ndef tutarli_mi(f):\n    pass\n', x1,
   FAT + '''import tempfile, os
_y = os.path.join(tempfile.mkdtemp(), "f.xml")
open(_y, "w", encoding="utf-8").write(_XML)
_f = fatura_oku(_y)
assert _f["no"] == "KST2024000000123" and _f["satici"] == "Anadolu Market A.Ş.", "Başlık alanları: " + repr(_f)
assert _f["toplam"] == Decimal("150.00") and isinstance(_f["toplam"], Decimal), "Toplam Decimal olmalı"
assert _f["kalemler"] == [{"ad": "Çay", "miktar": 2, "tutar": Decimal("100.50")}, {"ad": "Kahve", "miktar": 1, "tutar": Decimal("49.50")}], "Kalemler: " + repr(_f["kalemler"])
assert tutarli_mi(_f) is True, "Tutarlı fatura"
_f["toplam"] = Decimal("151"); assert tutarli_mi(_f) is False, "Tutarsız fatura yakalanmalı"
''', ['ET.parse(yol).getroot()', 'kok.findall("cac:InvoiceLine", NS)', 'Derin arama: kok.find(".//cac:PartyName/cbc:Name", NS)'], 'Kalem toplamıyla belge toplamını karşılaştırmak gerçek bir kabul denetimidir. Para için Decimal, float yuvarlama farkı üretmez.'),
 C('json-csv-g2', 'Kendin yaz', '<b>XML üret.</b> <code>siparis_xml(no, kalemler)</code>: kök <code>Siparis</code> (öznitelik <code>no</code>), her <code>(ad, adet)</code> için <code>Kalem</code> (öznitelik <code>adet</code>, metni ad). Metin döndür. <code>adet_toplam(metin)</code>: metni çözüp adetleri toplasın.',
   'import xml.etree.ElementTree as ET\n\ndef siparis_xml(no, kalemler):\n    pass\n\ndef adet_toplam(metin):\n    pass\n', x2,
   '''_m = siparis_xml(7, [("Çay & Kek", 2), ("Kahve", 3)])
assert isinstance(_m, str), "Metin döndürmeli: encoding='unicode'"
_k = ET.fromstring(_m)
assert _k.tag == "Siparis" and _k.get("no") == "7", "Kök yanlış"
assert [(x.text, x.get("adet")) for x in _k] == [("Çay & Kek", "2"), ("Kahve", "3")], "Kalemler yanlış"
assert "&amp;" in _m, "Özel karakter kaçırılmalı; XML'i elle birleştirme"
assert adet_toplam(_m) == 5, "Toplam 5"
''', ['ET.SubElement(kok, "Kalem", {"adet": str(adet)})', 'ET.tostring(kok, encoding="unicode")'], 'XML\'i f-string ile kurma: & ve &lt; belgeyi bozar. Kütüphane kaçırmayı kendisi yapar.'),
 C('json-csv-g3', 'Hata avı', '<b>Hatayı bul ve düzelt.</b> <code>satir_sayisi(metin)</code> fatura satırlarını saymalı ama hep 0 döndürüyor, hata da vermiyor.', x3b, x3s,
   '''_m = """<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"><cac:InvoiceLine/><cac:InvoiceLine/></Invoice>"""
assert satir_sayisi(_m) == 2, "İki satır beklenir"
''', ['Etiketin gerçek adını görmek için print(kok[0].tag).', '{ad_alani}InvoiceLine ya da findall("cac:InvoiceLine", NS).'], 'Sessiz sıfır, hata mesajından kötüdür. Beklenen en az bir satır varsa bunu ayrıca denetle.', kind='bug'),
])
# ---------- pandas ----------
t1 = '''import pandas as pd

def tur_ayir(df):
    return list(df.select_dtypes(include="number").columns), list(df.select_dtypes(exclude="number").columns)

def sayisal_ozet(df):
    return df.select_dtypes(include="number").agg(["min", "max"])
'''
t2 = '''import pandas as pd

def kalem_tablosu(kayitlar):
    d = pd.DataFrame(kayitlar).explode("urunler", ignore_index=True)
    return d.dropna(subset=["urunler"]).rename(columns={"urunler": "urun"}).reset_index(drop=True)
'''
t3 = '''import pandas as pd
import veri

def tutar_ekle(d):
    return d.assign(tutar=d["quantity"] * d["unit_price"] * (1 - d["discount"]))

def buyuk_kalemler(esik):
    d = veri.oku("anadolu_market", "order_items")
    return d.pipe(tutar_ekle).query("tutar > @esik and discount > 0").sort_values("item_id")
'''
g11 = '''import pandas as pd

def en_buyuk_n(df, n):
    return df.groupby("sehir").apply(lambda g: g.nlargest(n, "tutar"), include_groups=False).reset_index(level=0).reset_index(drop=True)
'''
g12 = '''import pandas as pd
import veri

def aylik_kanal():
    d = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])
    return d.groupby([pd.Grouper(key="order_date", freq="MS"), "channel"]).size().rename("adet").reset_index()
'''
pt = dict(id='pandas-temizlik', min=12, html=f'''<h2>Dört küçük araç: select_dtypes, explode, query, pipe</h2>
{pre("""import pandas as pd

d = pd.DataFrame({"no": [1, 2], "sehir": ["Van", "Kars"], "urunler": [["çay", "kek"], ["kahve"]], "tutar": [40.0, 25.0]})
print(d.select_dtypes(include="number").columns.tolist())
print(d.explode("urunler"))
print(d.query("tutar > 30")["sehir"].tolist())
print(d.pipe(lambda x: x.assign(kdvli=x["tutar"] * 1.2))["kdvli"].round(1).tolist())""")}
<p><code>select_dtypes</code> keşfin ilk adımıdır: hangi sütunlar sayı, hangileri metin? Sayı olması gereken sütun metin çıkıyorsa temizlik başlar. <code>explode</code> API'den gelen liste sütununu satırlara açar; diğer sütunlar tekrar eder, toplam alırken dikkat et. <code>query</code> uzun filtreleri okunur yapar, dış değişkeni <code>@</code> ile alır. <code>pipe</code> kendi fonksiyonunu zincire sokar.</p>''', ex=[
 C('pandas-temizlik-g1', 'Rehberli', '<b>select_dtypes.</b> <code>tur_ayir(df)</code>: <code>(sayısal_sütunlar, diğerleri)</code> iki liste döndürsün. <code>sayisal_ozet(df)</code>: yalnız sayısal sütunların <code>min</code> ve <code>max</code> satırlarını versin. Sütun adlarını elle yazma.',
   'import pandas as pd\n\ndef tur_ayir(df):\n    pass\n\ndef sayisal_ozet(df):\n    pass\n', t1,
   '''_d = pd.DataFrame({"a": [1, 5], "b": ["x", "y"], "c": [0.5, 2.5], "d": [True, False]})
_n, _o = tur_ayir(_d)
assert _n == ["a", "c"], "Sayısal: " + repr(_n)
assert _o == ["b", "d"], "Diğerleri: " + repr(_o)
_s = sayisal_ozet(_d)
assert list(_s.columns) == ["a", "c"] and _s.loc["max", "c"] == 2.5 and _s.loc["min", "a"] == 1, repr(_s)
assert tur_ayir(pd.DataFrame({"t": [1], "u": ["k"]})) == (["t"], ["u"]), "Sütun adlarına bağlı olmamalı"
''', ['df.select_dtypes(include="number")', 'agg(["min", "max"])'], 'Sütun adı yazmadan çalışan kod, yeni sütun gelince de doğru kalır. bool sayı sayılmaz.', needs=['pandas']),
 C('pandas-temizlik-g2', 'Kendin yaz', '<b>explode.</b> <code>kalem_tablosu(kayitlar)</code>: API\'den gelen <code>{"no", "urunler": [...]}</code> kayıtlarını her ürün bir satır olacak biçimde aç. Sütun adı <code>urun</code> olsun. Boş listeli kayıt satır üretmesin. İndeks 0\'dan başlasın.',
   'import pandas as pd\n\ndef kalem_tablosu(kayitlar):\n    pass\n', t2,
   '''_r = kalem_tablosu([{"no": 1, "urunler": ["çay", "kek"]}, {"no": 2, "urunler": []}, {"no": 3, "urunler": ["kahve"]}])
assert list(_r.columns) == ["no", "urun"], "Sütunlar: " + repr(list(_r.columns))
assert _r["no"].tolist() == [1, 1, 3] and _r["urun"].tolist() == ["çay", "kek", "kahve"], repr(_r.to_dict("list"))
assert list(_r.index) == [0, 1, 2], "İndeks sıfırlanmalı"
''', ['Boş liste explode sonrası NaN olur; dropna ile at.', 'rename(columns={"urunler": "urun"})'], 'explode satırları çoğaltır: sipariş düzeyinde bir tutar varsa artık birkaç kez sayılır. Bire çok birleştirmeyle aynı tuzak.', needs=['pandas']),
 C('pandas-temizlik-g3', 'Kendin yaz', '<b>pipe ve query, gerçek veri.</b> <code>tutar_ekle(d)</code>: kopya üzerinde <code>tutar = quantity × unit_price × (1 − discount)</code> eklesin. <code>buyuk_kalemler(esik)</code>: <code>anadolu_market</code> <code>order_items</code> tablosunu oku, <code>pipe</code> ile <code>tutar_ekle</code>\'den geçir, <code>query</code> ile tutarı <code>esik</code>\'ten büyük ve indirimli satırları al, <code>item_id</code> sıralı döndür.',
   'import pandas as pd\nimport veri\n\ndef tutar_ekle(d):\n    pass\n\ndef buyuk_kalemler(esik):\n    pass\n', t3,
   '''_b = veri.oku("anadolu_market", "order_items")
_e = _b["quantity"] * _b["unit_price"] * (1 - _b["discount"])
_w = _b[(_e > 5000) & (_b["discount"] > 0)]["item_id"].tolist()
_r = buyuk_kalemler(5000)
assert _r["item_id"].tolist() == _w, f"{len(_w)} satır beklenir: {len(_r)}"
assert ".pipe(" in __kod__ and ".query(" in __kod__, "pipe ve query kullan"
_k = _b.head(); tutar_ekle(_k); assert "tutar" not in _k.columns, "Girdiyi değiştirme"
assert buyuk_kalemler(10 ** 9).empty, "Eşik dış değişkenden gelmeli"
''', ['d.assign(tutar=...) kopya döndürür.', 'query içinde dış değişken: "tutar > @esik"'], 'Temizlik adımlarını küçük fonksiyonlara bölüp pipe ile dizersen her biri ayrı test edilir.', needs=['pandas']),
])
pg = dict(id='pandas-groupby', min=8, html='''<h2>groupby.apply ve pd.Grouper</h2><p><code>agg</code> her gruptan tek değer üretir. Grup başına birkaç satır gerekiyorsa, örneğin her şehrin en büyük üç siparişi, <code>apply</code> kullanırsın; daha yavaştır, önce agg ya da transform dene. <code>include_groups=False</code> grup sütununu fonksiyona vermez; pandas 2.2 ve 3 için aynı sonucu verir. Zamanı dönemlere bölüp başka sütunla birlikte gruplamak için <code>pd.Grouper(key="tarih", freq="MS")</code> kullanılır; <code>MS</code> ay başı demektir.</p>''', ex=[
 C('pandas-groupby-g1', 'Kendin yaz', '<b>groupby.apply.</b> <code>en_buyuk_n(df, n)</code>: her <code>sehir</code> için <code>tutar</code>\'ı en büyük <code>n</code> satırı döndürsün. Sonuçta <code>sehir</code> sütun olsun, indeks 0\'dan başlasın. Şehirler artan, şehir içinde tutar azalan sırada.',
   'import pandas as pd\n\ndef en_buyuk_n(df, n):\n    pass\n', g11,
   '''_d = pd.DataFrame({"sehir": ["Van", "İzmir", "Van", "İzmir", "Van"], "no": [1, 2, 3, 4, 5], "tutar": [10, 40, 30, 20, 20]})
_r = en_buyuk_n(_d, 2)
assert "sehir" in _r.columns and list(_r.index) == list(range(4)), "sehir sütun, indeks düz: " + repr(_r)
assert _r[["sehir", "no"]].values.tolist() == [["Van", 3], ["Van", 5], ["İzmir", 2], ["İzmir", 4]] or _r[["sehir", "no"]].values.tolist() == [["İzmir", 2], ["İzmir", 4], ["Van", 3], ["Van", 5]], repr(_r)
assert len(en_buyuk_n(_d, 1)) == 2, "n parametresi kullanılmalı"
''', ['groupby("sehir").apply(lambda g: g.nlargest(n, "tutar"), include_groups=False)', 'Sonuç çok düzeyli indeks taşır: reset_index(level=0) sehir\'i sütuna alır.'], 'apply her grubu ayrı DataFrame olarak verir, esnektir ama yavaştır. Büyük veride sort_values ve groupby.head(n) daha hızlıdır.', needs=['pandas']),
 C('pandas-groupby-g2', 'Kendin yaz', '<b>pd.Grouper.</b> <code>aylik_kanal()</code>: <code>anadolu_market</code> <code>orders</code> tablosunda her ay ve <code>channel</code> için sipariş sayısını versin. Sütunlar <code>order_date</code> (ay başı), <code>channel</code>, <code>adet</code>.',
   'import pandas as pd\nimport veri\n\ndef aylik_kanal():\n    pass\n', g12,
   '''_b = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])
_r = aylik_kanal()
assert list(_r.columns) == ["order_date", "channel", "adet"], "Sütunlar: " + repr(list(_r.columns))
assert _r["adet"].sum() == len(_b), "Toplam sipariş sayısı tutmalı"
_m = _b.assign(ay=_b["order_date"].dt.strftime("%Y-%m-01")).groupby(["ay", "channel"]).size().to_dict()
_g = {(a.strftime("%Y-%m-%d"), c): n for a, c, n in _r.values.tolist()}
assert _g == _m, "Ay ve kanal sayıları farklı"
assert "Grouper" in __kod__, "pd.Grouper kullan"
''', ['groupby([pd.Grouper(key="order_date", freq="MS"), "channel"])', '.size().rename("adet").reset_index()'], 'resample tek başına diğer sütunla gruplamaz; Grouper ikisini tek groupby içinde birleştirir.', needs=['pandas']),
])
# ---------- seaborn, plotly ----------
v1 = '''import matplotlib.pyplot as plt
import seaborn as sns

def dagilim(df):
    fig, (a, b) = plt.subplots(1, 2, figsize=(9, 3))
    sns.histplot(data=df, x="tutar", bins=5, ax=a)
    sns.boxplot(data=df, x="sehir", y="tutar", ax=b)
    a.set_title("Tutar dağılımı")
    b.set_title("Şehre göre tutar")
    return fig
'''
v2 = '''import matplotlib.pyplot as plt
import seaborn as sns

def panel(df):
    fig, ax = plt.subplots(2, 2, figsize=(9, 6))
    sns.countplot(data=df, x="sehir", ax=ax[0, 0])
    sns.barplot(data=df, x="sehir", y="tutar", estimator="sum", errorbar=None, ax=ax[0, 1])
    sns.lineplot(data=df, x="gun", y="tutar", errorbar=None, ax=ax[1, 0])
    sns.scatterplot(data=df, x="gun", y="tutar", hue="sehir", ax=ax[1, 1])
    return fig
'''
v3 = '''import seaborn as sns

def yuzey(df):
    g = sns.FacetGrid(df, col="sehir")
    g.map_dataframe(sns.scatterplot, x="gun", y="tutar")
    return g

def egilim(df):
    return sns.regplot(data=df, x="gun", y="tutar", ci=None)

def ciftler(df):
    return sns.pairplot(df[["gun", "tutar"]])
'''
v4 = '''import plotly.express as px

def grafikler(df):
    return {"cizgi": px.line(df, x="gun", y="tutar", color="sehir", title="Günlük tutar"),
            "cubuk": px.bar(df, x="sehir", y="tutar", title="Şehre göre tutar"),
            "nokta": px.scatter(df, x="gun", y="tutar", hover_data=["sehir"], title="Tutar")}
'''
v5 = '''import plotly.graph_objects as go

def elle_figur(df, yol):
    f = go.Figure()
    f.add_trace(go.Bar(x=df["sehir"], y=df["tutar"], name="Tutar", hovertemplate="%{x}: %{y} TL<extra></extra>"))
    f.update_layout(title="Tutar", yaxis_title="TL")
    f.write_html(yol, include_plotlyjs=True)
    return f
'''
VD = 'import pandas as _pd\n_df = _pd.DataFrame({"gun": [1, 2, 3, 4, 5, 6], "sehir": ["Van", "İzmir", "Van", "İzmir", "Van", "İzmir"], "tutar": [10, 40, 30, 20, 25, 35]})\n'
vis = dict(id='seaborn-plotly', min=20, html=f'''<h2>seaborn ve plotly'yi çalıştır</h2><p>İki kütüphane de tarayıcıda çalışır. İlk kullanımda inerler: seaborn yaklaşık 295 KB, plotly yaklaşık 9,7 MB. plotly büyüktür; mobil veride uzun sürebilir. <code>fig.show()</code> grafiği çıktının içinde etkileşimli gösterir, ayrıca 4,5 MB'lık bir çizim kitaplığını taşır.</p>
{pre("""import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

d = pd.DataFrame({"sehir": ["Van", "İzmir", "Van", "İzmir"], "tutar": [10, 40, 30, 20]})
sns.barplot(data=d, x="sehir", y="tutar", estimator="sum", errorbar=None)
plt.show()""")}
<div class="tbl-wrap"><table><tr><th>Soru</th><th>Grafik</th></tr><tr><td>Dağılım nasıl?</td><td><code>histplot</code>, <code>boxplot</code></td></tr><tr><td>Grup karşılaştırması</td><td><code>barplot</code>, <code>countplot</code></td></tr><tr><td>Zaman içinde</td><td><code>lineplot</code></td></tr><tr><td>İki sayı ilişkisi</td><td><code>scatterplot</code>, <code>regplot</code></td></tr><tr><td>Gruba göre küçük panolar</td><td><code>FacetGrid</code>, <code>catplot</code></td></tr><tr><td>Etkileşim gerekiyor</td><td>plotly</td></tr></table></div><div class="note"><b>Çalışmayan</b>Streamlit ve Dash sunucu ister, burada çalışmaz. plotly'nin PNG kaydı (kaleido) da burada yoktur; HTML olarak kaydedersin.</div>''', ex=[
 C('seaborn-plotly-g1', 'Rehberli', '<b>Dağılım.</b> <code>dagilim(df)</code>: yan yana iki eksenli figür döndür. Soldaki <code>histplot</code> (<code>tutar</code>, 5 kutu, başlık <code>Tutar dağılımı</code>), sağdaki <code>boxplot</code> (<code>sehir</code>e göre <code>tutar</code>, başlık <code>Şehre göre tutar</code>).',
   'import matplotlib.pyplot as plt\nimport seaborn as sns\n\ndef dagilim(df):\n    pass\n', v1,
   VD + '''_f = dagilim(_df)
_a, _b = _f.axes
assert len(_a.patches) == 5, "5 kutu: " + str(len(_a.patches))
assert _a.get_title() == "Tutar dağılımı" and _b.get_title() == "Şehre göre tutar", "Başlıklar"
assert [t.get_text() for t in _b.get_xticklabels()] == ["Van", "İzmir"], "x ekseninde şehirler"
assert _a.get_xlabel() == "tutar" and _b.get_ylabel() == "tutar", "Sütunlar seaborn ile verilmeli"
assert "seaborn" in __source__ and "sns.histplot" in __kod__ and "sns.boxplot" in __kod__, "seaborn kullan"
plt.close("all")
''', ['ax=a ile hangi eksene çizeceğini söyle.', 'sns.histplot(data=df, x="tutar", bins=5, ax=a)'], 'Kutu grafiği dağılımı ve aykırı değeri tek bakışta gösterir, ortalama bunu saklar.', needs=['pandas', 'matplotlib']),
 C('seaborn-plotly-g2', 'Kendin yaz', '<b>Dört temel grafik.</b> <code>panel(df)</code>: 2×2 figür. Sol üst <code>countplot</code> (<code>sehir</code>). Sağ üst <code>barplot</code> (şehre göre <code>tutar</code> toplamı, hata çubuğu yok). Sol alt <code>lineplot</code> (<code>gun</code>, <code>tutar</code>). Sağ alt <code>scatterplot</code> (<code>gun</code>, <code>tutar</code>, renk <code>sehir</code>).',
   'import matplotlib.pyplot as plt\nimport seaborn as sns\n\ndef panel(df):\n    pass\n', v2,
   VD + '''_x = panel(_df).axes
assert len(_x) == 4, "Dört eksen"
assert sorted(round(p.get_height()) for p in _x[0].patches if p.get_height()) == [3, 3], "countplot her şehir 3"
assert sorted(round(p.get_height()) for p in _x[1].patches if p.get_height()) == [65, 95], "barplot toplam olmalı: estimator='sum'"
assert len(_x[1].lines) == 0, "Hata çubuğu olmamalı: errorbar=None"
assert list(_x[2].lines[0].get_xdata()) == [1, 2, 3, 4, 5, 6], "lineplot gun ekseninde"
assert len(_x[3].collections[0].get_offsets()) == 6 and _x[3].get_legend() is not None, "scatterplot 6 nokta ve renk açıklaması"
plt.close("all")
''', ['fig, ax = plt.subplots(2, 2); ax[0, 0] sol üst.', 'estimator="sum", errorbar=None'], 'barplot varsayılan olarak ortalama çizer; "toplam" sanılıp yanlış okunur.', needs=['pandas', 'matplotlib']),
 C('seaborn-plotly-g3', 'Meydan okuma', '<b>Çok panelli ve eğilim.</b> <code>yuzey(df)</code>: <code>sehir</code> başına panel açan <code>FacetGrid</code> döndürsün, her panele <code>scatterplot</code> (<code>gun</code>, <code>tutar</code>). <code>egilim(df)</code>: <code>regplot</code> ekseni döndürsün, güven bandı olmasın. <code>ciftler(df)</code>: <code>gun</code> ve <code>tutar</code> için <code>pairplot</code> döndürsün.',
   'import seaborn as sns\n\ndef yuzey(df):\n    pass\n\ndef egilim(df):\n    pass\n\ndef ciftler(df):\n    pass\n', v3,
   VD + '''import matplotlib.pyplot as _plt
_g = yuzey(_df)
assert len(_g.axes.flat) == 2, "İki panel"
assert all(len(a.collections[0].get_offsets()) == 3 for a in _g.axes.flat), "Her panelde 3 nokta"
_plt.close("all")
_e = egilim(_df)
assert len(_e.lines) == 1 and len(_e.collections) == 1, "Tek eğilim çizgisi, güven bandı yok: ci=None"
_plt.close("all")
_c = ciftler(_df)
assert _c.axes.shape == (2, 2), "2x2 ızgara"
_plt.close("all")
''', ['g.map_dataframe(sns.scatterplot, x="gun", y="tutar")', 'sns.regplot(..., ci=None)', 'df[["gun", "tutar"]]'], 'Küçük panolar aynı ölçekle grupları karşılaştırır. pairplot büyük veride yavaştır, önce örnekle.', diff=3, needs=['pandas', 'matplotlib']),
 C('seaborn-plotly-g4', 'Kendin yaz', '<b>plotly express.</b> <code>grafikler(df)</code>: üç figürlü sözlük döndür. <code>cizgi</code>: <code>px.line</code> (<code>gun</code>, <code>tutar</code>, renk <code>sehir</code>). <code>cubuk</code>: <code>px.bar</code> (<code>sehir</code>, <code>tutar</code>). <code>nokta</code>: <code>px.scatter</code> (<code>gun</code>, <code>tutar</code>, üzerine gelince <code>sehir</code>). Hepsinde başlık olsun. İlk kullanımda plotly iner (yaklaşık 9,7 MB).',
   'import plotly.express as px\n\ndef grafikler(df):\n    pass\n', v4,
   VD + '''_g = grafikler(_df)
assert set(_g) == {"cizgi", "cubuk", "nokta"}, "Anahtarlar: " + repr(sorted(_g))
assert len(_g["cizgi"].data) == 2 and _g["cizgi"].data[0].type == "scatter" and _g["cizgi"].data[0].mode == "lines", "Şehir başına birer çizgi"
assert _g["cubuk"].data[0].type == "bar" and list(_g["cubuk"].data[0].x) == list(_df["sehir"]), "Çubuk şehir ekseninde"
assert _g["nokta"].data[0].mode == "markers" and "sehir" in _g["nokta"].data[0].hovertemplate, "Üzerine gelince sehir görünmeli"
assert all(f.layout.title.text for f in _g.values()), "Başlıklar eksik"
''', ['px.line(df, x="gun", y="tutar", color="sehir", title="...")', 'hover_data=["sehir"]'], 'plotly figürü aslında veri ve ayar taşıyan bir sözlüktür; test de onu okuyor. Kendi kodunda fig.show() yazarsan grafiği görürsün.', needs=['pandas']),
 C('seaborn-plotly-g5', 'Kendin yaz', '<b>go.Figure ve HTML.</b> <code>elle_figur(df, yol)</code>: <code>go.Figure</code> kur, <code>go.Bar</code> ekle (<code>sehir</code>, <code>tutar</code>, ad <code>Tutar</code>, üzerine gelince <code>Van: 10 TL</code> gibi: <code>hovertemplate</code>). Başlık <code>Tutar</code>, y ekseni <code>TL</code>. <code>write_html</code> ile dosyaya yaz (<code>include_plotlyjs=True</code>), figürü döndür. Dosya internetsiz açılır.',
   'import plotly.graph_objects as go\n\ndef elle_figur(df, yol):\n    pass\n', v5,
   VD + '''import tempfile, os
_y = os.path.join(tempfile.mkdtemp(), "g.html")
_f = elle_figur(_df, _y)
assert isinstance(_f, go.Figure), "go.Figure döndür"
assert _f.data[0].type == "bar" and _f.data[0].name == "Tutar", "Bar izi"
assert "%{x}" in _f.data[0].hovertemplate and "TL" in _f.data[0].hovertemplate, "hovertemplate"
assert _f.layout.title.text == "Tutar" and _f.layout.yaxis.title.text == "TL", "Başlıklar"
assert os.path.getsize(_y) > 1000000, "Tek dosya olmalı: include_plotlyjs=True"
assert "Plotly.newPlot" in open(_y, encoding="utf-8").read(), "Geçerli plotly HTML'i değil"
''', ['f.add_trace(go.Bar(...))', 'f.update_layout(title="Tutar", yaxis_title="TL")'], 'Tek dosyalık HTML e-postayla gönderilir, Excel eki gibi açılır; sunucu gerekmez.', needs=['pandas']),
])
# ---------- köprüler ----------
bulut = dict(id='bulut-temelleri', min=8, html='''<h2>Azure ve BigQuery karşılıkları</h2><p>Türkiye'deki ilanlarda Azure ve BigQuery sık geçer. Kavramlar aynı, adlar farklıdır. İstemciler ağ ve hesap ister; tarayıcıda çalışmaz.</p><div class="tbl-wrap"><table><tr><th>Kavram</th><th>AWS</th><th>Azure</th><th>Google Cloud</th></tr><tr><td>Nesne depolama</td><td>S3</td><td>Blob Storage</td><td>Cloud Storage (GCS)</td></tr><tr><td>Veri ambarı</td><td>Redshift</td><td>Synapse, Fabric</td><td>BigQuery</td></tr><tr><td>Veri taşıma ve zamanlama</td><td>Glue, Step Functions</td><td>Data Factory</td><td>Dataflow, Composer</td></tr><tr><td>Python kütüphanesi</td><td>boto3</td><td>azure-storage-blob</td><td>google-cloud-storage, google-cloud-bigquery</td></tr></table></div>''', ex=[
 Y('bulut-temelleri-gy1', 'Azure hesabı açmadan Blob Storage kodu dene: Azurite, Microsoft\'un yerel öykünücüsüdür. Bu betik bu ortamda çalıştırılmadı.', ['<code>npx azurite --silent --location ./azurite</code> ile öykünücüyü başlat.', '<code>python -m pip install azure-storage-blob</code> yaz.', 'Kodu <code>blob.py</code> olarak kaydet. Bağlantı metni Azurite\'in belgelerde yayımlanan geliştirme hesabıdır; gerçek anahtarı koda yazma.', 'Komutu çalıştır: yüklediğin metin geri gelmeli.'], file='from azure.storage.blob import BlobServiceClient\n\nservis = BlobServiceClient.from_connection_string("UseDevelopmentStorage=true")\nkap = servis.get_container_client("rapor")\nif not kap.exists():\n    kap.create_container()\nkap.upload_blob("merhaba.txt", b"Merhaba Azure", overwrite=True)\nprint(kap.download_blob("merhaba.txt").readall().decode())\n', fname='blob.py', cmd='python blob.py', expect='Merhaba Azure'),
 Y('bulut-temelleri-gy2', 'BigQuery\'de herkese açık bir veri kümesini sorgula. Google hesabı ister; sandbox kartsız açılır, kota uygulanır. Bu betik bu ortamda çalıştırılmadı.', ['Google Cloud\'da proje aç, <code>gcloud auth application-default login</code> yap.', '<code>python -m pip install google-cloud-bigquery pandas db-dtypes</code> yaz.', 'Kodu kaydet, <code>PROJE</code> ortam değişkenine proje kimliğini yaz.', 'Çalıştır. BigQuery taranan veriye göre ücretlendirir: önce <code>dry_run</code> ile boyuta bak, <code>SELECT *</code> yazma.'], file='import os\nfrom google.cloud import bigquery\n\nc = bigquery.Client(project=os.environ["PROJE"])\nsql = "SELECT name, SUM(number) AS n FROM `bigquery-public-data.usa_names.usa_1910_2013` GROUP BY name ORDER BY n DESC LIMIT 5"\nprova = c.query(sql, job_config=bigquery.QueryJobConfig(dry_run=True))\nprint("Taranacak bayt:", prova.total_bytes_processed)\nprint(c.query(sql).to_dataframe())\n', fname='bq.py', cmd='python bq.py'),
])
derin = dict(id='derin-ogrenme-giris', min=6, ex=[
 Y('derin-ogrenme-giris-gy1', 'İlk gerçek PyTorch modelini bilgisayarında eğit. PyTorch tarayıcıda çalışmaz. Bu betik bu ortamda çalıştırılmadı; kayıp değeri her makinede biraz farklı çıkar, azalıyor olması yeterli.', ['<code>python -m pip install torch</code> yaz (GPU gerekmez).', 'Kodu <code>egit.py</code> olarak kaydet, çalıştır.', 'Kayıp azalmalı. Keras tercih edersen <code>python -m pip install keras torch</code>, <code>keras.Sequential</code> ile aynı ağ üç satırda kurulur; ilanlarda ikisi de geçer.'], file='import torch\nfrom torch import nn\n\ntorch.manual_seed(0)\nX = torch.rand(200, 2)\ny = (X.sum(dim=1) > 1).float().unsqueeze(1)\nmodel = nn.Sequential(nn.Linear(2, 8), nn.ReLU(), nn.Linear(8, 1))\nkayip_f = nn.BCEWithLogitsLoss()\nopt = torch.optim.Adam(model.parameters(), lr=0.05)\nfor tur in range(100):\n    opt.zero_grad()\n    kayip = kayip_f(model(X), y)\n    kayip.backward()\n    opt.step()\n    if tur % 25 == 0:\n        print(tur, round(kayip.item(), 3))\nprint("son", round(kayip.item(), 3))\n', fname='egit.py', cmd='python egit.py'),
])
airflow = dict(id='orkestrasyon', min=8, ex=[
 Y('orkestrasyon-gy1', 'Dersteki küçük DAG benzetiminin gerçeğini kur. Airflow tarayıcıda çalışmaz, Windows\'ta WSL ya da Docker ister. Bu dosya bu ortamda çalıştırılmadı.', ['Sanal ortamda Airflow\'u kur: resmî kurulum sayfasındaki sürüm kısıtlı komutu kullan.', '<code>airflow standalone</code> ile başlat; arayüz <code>http://localhost:8080</code>.', 'Kodu <code>~/airflow/dags/satis.py</code> olarak kaydet.', 'Komutla bir tarih için dene. Sonra arayüzden yeniden deneme ve <code>catchup</code> davranışına bak.'], file='from datetime import datetime, timedelta\n\nfrom airflow.decorators import dag, task\n\n@dag(schedule="@daily", start_date=datetime(2024, 10, 1), catchup=False, default_args={"retries": 2, "retry_delay": timedelta(minutes=5)})\ndef satis_etl():\n    @task\n    def cikar(ds=None):\n        return {"tarih": ds, "satir": 3}\n\n    @task\n    def yukle(sonuc):\n        print("yuklendi", sonuc)\n\n    yukle(cikar())\n\nsatis_etl()\n', fname='satis.py', cmd='airflow dags test satis_etl 2024-10-01'),
])
selenium = dict(id='web-scraping', min=6, ex=[
 Y('web-scraping-gy1', 'Gerçek tarayıcıyı Selenium ile sür. Tarayıcı içinde tarayıcı çalışmaz, bu yüzden görev bilgisayarında. Sayfayı önce <code>python -m http.server</code> ile kendin sunarsın; izinsiz siteye gitmezsin. Bu betik bu ortamda çalıştırılmadı.', ['<code>python -m pip install selenium</code> yaz. Chrome kuruluysa sürücüyü Selenium kendisi bulur.', 'Aynı klasörde içinde <code>&lt;h1&gt;Kesit&lt;/h1&gt;</code> olan bir <code>index.html</code> oluştur, <code>python -m http.server 8000</code> başlat.', 'Kodu kaydet, ikinci terminalde çalıştır.', 'Ekran değişince kırılır: <code>WebDriverWait</code> kullan, <code>time.sleep</code> kullanma. Playwright de aynı işi görür.'], file='from selenium import webdriver\nfrom selenium.webdriver.common.by import By\nfrom selenium.webdriver.support import expected_conditions as EC\nfrom selenium.webdriver.support.ui import WebDriverWait\n\nsec = webdriver.ChromeOptions()\nsec.add_argument("--headless=new")\nd = webdriver.Chrome(options=sec)\ntry:\n    d.get("http://localhost:8000/")\n    h = WebDriverWait(d, 10).until(EC.presence_of_element_located((By.TAG_NAME, "h1")))\n    print(h.text)\nfinally:\n    d.quit()\n', fname='sur.py', cmd='python sur.py', expect='Kesit'),
])
mongo = dict(id='veri-modelleme', min=6, html='''<h2>Belge veritabanı: MongoDB</h2><p>İlişkisel tabloda sipariş ve kalemler ayrı durur. MongoDB\'de kalemler siparişin içinde tek belgedir: birlikte okunan veri için hızlı, şeması esnek. Karşılığında birleştirme zayıf, tutarlılık daha çok senin işin. Raporlama ve çok tablolu analizde ilişkisel model hâlâ daha rahattır.</p>''', ex=[
 Y('veri-modelleme-gy1', 'pymongo ile gerçek bir MongoDB\'ye yaz ve topla. Sürücü ağ ister, tarayıcıda çalışmaz. Bu betik bu ortamda çalıştırılmadı.', ['MongoDB\'yi başlat: <code>docker run -d -p 27017:27017 mongo</code> ya da Atlas\'ın ücretsiz katmanı.', '<code>python -m pip install pymongo</code> yaz.', 'Kodu kaydet, çalıştır.'], file='from pymongo import MongoClient\n\nc = MongoClient("mongodb://localhost:27017")\ns = c.kesit.siparis\ns.drop()\ns.insert_many([\n    {"no": 1, "sehir": "Van", "kalemler": [{"ad": "cay", "tutar": 50}, {"ad": "kek", "tutar": 30}]},\n    {"no": 2, "sehir": "Kars", "kalemler": [{"ad": "kahve", "tutar": 120}]},\n])\nprint(s.find_one({"sehir": "Van"})["no"])\nhat = [{"$unwind": "$kalemler"}, {"$group": {"_id": "$sehir", "ciro": {"$sum": "$kalemler.tutar"}}}, {"$sort": {"ciro": -1}}]\nprint(list(s.aggregate(hat)))\n', fname='mongo.py', cmd='python mongo.py'),
])
yaz('gercek_excel', 'gerçek Excel görevleri', [excel])
yaz('gercek_sql', 'read_sql, to_sql, sunucu bağlantıları', [sql])
yaz('gercek_belge', 'gerçek Word ve PDF görevleri, RPA, e-posta', [ofis, ofis2])
yaz('gercek_xml', 'XML ve ElementTree', [xml])
yaz('gercek_pandas', 'select_dtypes, explode, query, pipe, groupby.apply, Grouper', [pt, pg])
yaz('gercek_grafik', 'seaborn ve plotly', [vis])
yaz('gercek_kopru', 'bulut, derin öğrenme, Airflow, Selenium, MongoDB için yerel görevler', [bulut, derin, airflow, selenium, mongo])
