/* Kesit Python: gerçek Excel görevleri. uretec/p2/gercek.py üretir, elle düzenleme. */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
{
 "id": "excel-otomasyon",
 "min": 30,
 "html": "<h2>Gerçek .xlsx dosyasıyla çalışmak</h2><p>Bu bölümdeki kod tarayıcıda gerçek Excel dosyası yazar ve okur. Dosya tarayıcının belleğinde durur; çıktının altındaki <b>İndir</b> düğmesiyle alıp Excel'de açabilirsin. openpyxl ilk kullanımda iner (yaklaşık 270 KB), XlsxWriter yaklaşık 180 KB.</p>\n<pre class=\"py\">from openpyxl import Workbook, load_workbook\nfrom openpyxl.styles import Font\n\nwb = Workbook()\nws = wb.active\nws.title = \"Satış\"\nws.append([\"Ürün\", \"Adet\"])\nws.append([\"Çay\", 3])\nws[\"A1\"].font = Font(bold=True)\nws[\"C2\"] = \"=B2*2\"\nwb.save(\"ornek.xlsx\")\n\nokunan = load_workbook(\"ornek.xlsx\")\nprint(okunan.sheetnames, okunan[\"Satış\"][\"C2\"].value)\nprint(load_workbook(\"ornek.xlsx\", data_only=True)[\"Satış\"][\"C2\"].value)</pre>\n<p>Son satır <code>None</code> yazar: openpyxl formülü hesaplamaz, yalnız yazar. Hesaplanmış değer dosyaya Excel açıp kaydedince girer. Bu yüzden Python'da hesap yapıp sonucu ayrıca denetlemek gerekir.</p>\n<div class=\"tbl-wrap\"><table><tr><th>Araç</th><th>Ne zaman</th></tr><tr><td>openpyxl</td><td>Var olan dosyayı açmak, şablon doldurmak, okumak</td></tr><tr><td>XlsxWriter</td><td>Sıfırdan biçimli ve grafikli rapor; var olan dosyayı açamaz</td></tr><tr><td>pandas</td><td>Tabloyu toplu okumak ve yazmak; arka planda ikisini kullanır</td></tr></table></div>\n<div class=\"note\"><b>Sınır</b>Tarayıcıda gerçek Excel yok: grafik ve koşullu biçim dosyaya doğru yazılır ve testler dosyayı yeniden okuyarak denetler, ama görünümü ancak indirip Excel'de açınca görürsün. xlwings ve makro bilgisayarında kurulu Excel ister; burada çalışmaz.</div>",
 "ex": [
  {
   "t": "mc",
   "id": "excel-otomasyon-gm1",
   "stage": "Isınma",
   "q": "openpyxl ile <code>=SUM(A1:A3)</code> yazdın, dosyayı Excel'de hiç açmadan <code>load_workbook(yol, data_only=True)</code> ile okudun. Hücre ne döner?",
   "o": [
    "Toplamın sayı değeri",
    "Formül metni",
    "None",
    "ValueError"
   ],
   "a": 2,
   "why": "data_only son hesaplanan değeri okur. Dosyayı yalnız openpyxl yazdıysa hesaplayan olmamıştır, değer boştur."
  },
  {
   "t": "mc",
   "id": "excel-otomasyon-gm2",
   "stage": "Isınma",
   "q": "Elinde biçimli bir şablon var, içine veri yazacaksın. Hangi araç uygun?",
   "o": [
    "XlsxWriter, çünkü yalnız yeni dosya yazar",
    "openpyxl, çünkü var olan dosyayı açar",
    "csv modülü, çünkü en hafifi",
    "read_excel, çünkü biçimi korur"
   ],
   "a": 1,
   "why": "XlsxWriter var olan dosyayı açamaz. read_excel biçimi atar, csv biçim taşımaz."
  },
  {
   "t": "code",
   "id": "excel-otomasyon-g1",
   "stage": "Rehberli",
   "diff": 2,
   "q": "<p><b>Hücre, sayfa, okuma.</b> <code>rapor_yaz(yol, satirlar)</code>: <code>satirlar</code> <code>(urun, adet, fiyat)</code> demetleridir. <code>Satış</code> adlı sayfaya başlık <code>Ürün, Adet, Fiyat</code> ve satırları yaz. <code>Özet</code> adlı ikinci sayfada <code>A1</code> <code>Toplam</code>, <code>B1</code> adet × fiyat toplamı olsun. Kaydet. <code>toplam_oku(yol)</code>: dosyayı <code>load_workbook</code> ile aç, <code>Satış</code> sayfasını <code>iter_rows(min_row=2, values_only=True)</code> ile gez, toplamı döndür.</p>",
   "start": "from openpyxl import Workbook, load_workbook\n\ndef rapor_yaz(yol, satirlar):\n    pass\n\ndef toplam_oku(yol):\n    pass\n",
   "sol": "from openpyxl import Workbook, load_workbook\n\ndef rapor_yaz(yol, satirlar):\n    wb = Workbook()\n    ws = wb.active\n    ws.title = \"Satış\"\n    ws.append([\"Ürün\", \"Adet\", \"Fiyat\"])\n    for s in satirlar:\n        ws.append(list(s))\n    oz = wb.create_sheet(\"Özet\")\n    oz[\"A1\"] = \"Toplam\"\n    oz[\"B1\"] = sum(a * f for _, a, f in satirlar)\n    wb.save(yol)\n\ndef toplam_oku(yol):\n    ws = load_workbook(yol)[\"Satış\"]\n    return sum(a * f for _, a, f in ws.iter_rows(min_row=2, values_only=True))\n",
   "tests": "import tempfile, os\n_d = tempfile.mkdtemp()\n_y = os.path.join(_d, \"t.xlsx\")\nrapor_yaz(_y, [(\"Çay\", 2, 50.0), (\"Kahve\", 3, 100.0)])\nassert os.path.exists(_y), \"Dosya kaydedilmedi\"\n_w = load_workbook(_y)\nassert _w.sheetnames == [\"Satış\", \"Özet\"], \"Sayfalar: \" + repr(_w.sheetnames)\nassert [c.value for c in _w[\"Satış\"][1]] == [\"Ürün\", \"Adet\", \"Fiyat\"], \"Başlık satırı yanlış\"\nassert _w[\"Satış\"][\"A3\"].value == \"Kahve\" and _w[\"Satış\"].max_row == 3, \"Satırlar yanlış\"\nassert _w[\"Özet\"][\"A1\"].value == \"Toplam\" and _w[\"Özet\"][\"B1\"].value == 400.0, \"Özet B1 400 olmalı\"\nassert toplam_oku(_y) == 400.0, \"toplam_oku yanlış\"\n_y2 = os.path.join(_d, \"t2.xlsx\")\nrapor_yaz(_y2, [(\"Su\", 4, 5.0)])\nassert load_workbook(_y2)[\"Özet\"][\"B1\"].value == 20.0, \"Özet toplamı satırlardan hesaplanmalı\"\n_w[\"Satış\"].append([\"Şeker\", 1, 10.0]); _w.save(_y)\nassert toplam_oku(_y) == 410.0, \"Toplam dosyadan okunmalı, sabit olmamalı\"\n",
   "hints": [
    "wb.create_sheet(\"Özet\") yeni sayfa açar; wb[\"Satış\"] adla erişir.",
    "values_only=True hücre nesnesi yerine değeri verir."
   ],
   "why": "Dosya gerçekten yazılıp yeniden açıldı. İndirip Excel'de açabilirsin."
  },
  {
   "t": "code",
   "id": "excel-otomasyon-g2",
   "stage": "Kendin yaz",
   "diff": 2,
   "q": "<p><b>Biçim.</b> <code>bicimle(yol)</code> var olan dosyayı açıp aynı dosyaya kaydetsin (ilk sayfa). Başlık satırı: kalın, <code>DDEBF7</code> dolgu, ortalı, altta ince kenarlık. C sütununda veri hücreleri <code>#,##0.00</code> sayı biçimi. A sütunu genişliği 24. İlk satır dondurulsun.</p>",
   "start": "from openpyxl import load_workbook\nfrom openpyxl.styles import Alignment, Border, Font, PatternFill, Side\n\ndef bicimle(yol):\n    pass\n",
   "sol": "from openpyxl import load_workbook\nfrom openpyxl.styles import Alignment, Border, Font, PatternFill, Side\n\ndef bicimle(yol):\n    wb = load_workbook(yol)\n    ws = wb.active\n    for h in ws[1]:\n        h.font = Font(bold=True)\n        h.fill = PatternFill(\"solid\", fgColor=\"DDEBF7\")\n        h.alignment = Alignment(horizontal=\"center\")\n        h.border = Border(bottom=Side(style=\"thin\"))\n    for sat in ws.iter_rows(min_row=2, min_col=3, max_col=3):\n        sat[0].number_format = \"#,##0.00\"\n    ws.column_dimensions[\"A\"].width = 24\n    ws.freeze_panes = \"A2\"\n    wb.save(yol)\n",
   "tests": "import tempfile, os\n_d = tempfile.mkdtemp()\n_y = os.path.join(_d, \"t.xlsx\")\nfrom openpyxl import Workbook\n_w = Workbook(); _s = _w.active; _s.title = \"Satış\"\nfor _r in [[\"Ürün\", \"Adet\", \"Fiyat\"], [\"Çay\", 2, 50.0], [\"Kahve\", 3, 120.5], [\"Şeker\", 1, 30.0]]:\n    _s.append(_r)\n_w.save(_y)\nbicimle(_y)\n_s = load_workbook(_y).active\n_h = _s[\"B1\"]\nassert _h.font.bold, \"Başlık kalın olmalı\"\nassert _h.fill.fgColor.rgb.endswith(\"DDEBF7\"), \"Dolgu DDEBF7 olmalı\"\nassert _h.alignment.horizontal == \"center\", \"Başlık ortalı olmalı\"\nassert _h.border.bottom.style == \"thin\", \"Alt kenarlık ince olmalı\"\nassert _s[\"C2\"].number_format == \"#,##0.00\" and _s[\"C4\"].number_format == \"#,##0.00\", \"C sütunu sayı biçimi eksik\"\nassert _s[\"C1\"].number_format == \"General\", \"Başlık hücresine sayı biçimi verme\"\nassert _s.column_dimensions[\"A\"].width == 24, \"A sütunu genişliği 24 olmalı\"\nassert _s.freeze_panes == \"A2\", \"İlk satır dondurulmalı\"\nassert _s[\"B3\"].value == 3, \"Veri bozulmamalı\"\n",
   "hints": [
    "ws[1] ilk satırın hücrelerini verir.",
    "PatternFill(\"solid\", fgColor=\"DDEBF7\")",
    "iter_rows(min_row=2, min_col=3, max_col=3)"
   ],
   "why": "Biçim dosyada kalır; test dosyayı yeniden açıp okuyor."
  },
  {
   "t": "code",
   "id": "excel-otomasyon-g3",
   "stage": "Kendin yaz",
   "diff": 2,
   "q": "<p><b>Formül.</b> <code>formul_ekle(yol)</code>: ilk sayfada B adet, C fiyat, ilk satır başlık. D1'e <code>Tutar</code> yaz. Her veri satırına <code>=B2*C2</code> biçiminde formül yaz. Son satırın altına D sütununa <code>=SUM(D2:Dn)</code> ekle. Kaydet.</p>",
   "start": "from openpyxl import load_workbook\n\ndef formul_ekle(yol):\n    pass\n",
   "sol": "from openpyxl import load_workbook\n\ndef formul_ekle(yol):\n    wb = load_workbook(yol)\n    ws = wb.active\n    son = ws.max_row\n    ws[\"D1\"] = \"Tutar\"\n    for r in range(2, son + 1):\n        ws[f\"D{r}\"] = f\"=B{r}*C{r}\"\n    ws[f\"D{son + 1}\"] = f\"=SUM(D2:D{son})\"\n    wb.save(yol)\n",
   "tests": "import tempfile, os\n_d = tempfile.mkdtemp()\n_y = os.path.join(_d, \"t.xlsx\")\nfrom openpyxl import Workbook\n_w = Workbook(); _s = _w.active; _s.title = \"Satış\"\nfor _r in [[\"Ürün\", \"Adet\", \"Fiyat\"], [\"Çay\", 2, 50.0], [\"Kahve\", 3, 120.5], [\"Şeker\", 1, 30.0]]:\n    _s.append(_r)\n_w.save(_y)\nformul_ekle(_y)\n_s = load_workbook(_y).active\nassert _s[\"D1\"].value == \"Tutar\", \"D1 Tutar olmalı\"\nassert _s[\"D2\"].value == \"=B2*C2\" and _s[\"D4\"].value == \"=B4*C4\", \"Satır formülü yanlış: \" + repr(_s[\"D2\"].value)\nassert _s[\"D5\"].value == \"=SUM(D2:D4)\", \"Toplam formülü yanlış: \" + repr(_s[\"D5\"].value)\nassert load_workbook(_y, data_only=True).active[\"D5\"].value is None, \"Formül metin olarak yazılmalı, sonucu elle koyma\"\n",
   "hints": [
    "ws.max_row son dolu satırı verir; onu değişkende tut, yazdıkça büyür."
   ],
   "why": "Formül hücrede yaşar; Excel açınca hesaplar. Kaynak veri değişince sonuç da değişir, elle yazılan sayı değişmezdi."
  },
  {
   "t": "code",
   "id": "excel-otomasyon-g4",
   "stage": "Kendin yaz",
   "diff": 2,
   "q": "<p><b>Şablon doldurma.</b> <code>sablon_doldur(sablon, cikti, veri)</code>: şablonu aç, tüm sayfalardaki <code>{{alan}}</code> yer tutucularını <code>veri</code> sözlüğünden doldur, <code>cikti</code>'ya kaydet. Şablon değişmesin, biçim kalsın. Hücrede başka metin de olabilir. Sözlükte olmayan alan için <code>ValueError</code> fırlat.</p>",
   "start": "from openpyxl import load_workbook\n\ndef sablon_doldur(sablon, cikti, veri):\n    pass\n",
   "sol": "import re\nfrom openpyxl import load_workbook\n\ndef sablon_doldur(sablon, cikti, veri):\n    wb = load_workbook(sablon)\n    for ws in wb.worksheets:\n        for sat in ws.iter_rows():\n            for h in sat:\n                if isinstance(h.value, str) and \"{{\" in h.value:\n                    def koy(m):\n                        if m.group(1) not in veri:\n                            raise ValueError(\"bilinmeyen alan: \" + m.group(1))\n                        return str(veri[m.group(1)])\n                    h.value = re.sub(r\"\\{\\{(\\w+)\\}\\}\", koy, h.value)\n    wb.save(cikti)\n",
   "tests": "import tempfile, os\n_d = tempfile.mkdtemp()\n_y = os.path.join(_d, \"t.xlsx\")\nfrom openpyxl import Workbook\nfrom openpyxl.styles import Font\n_c = os.path.join(_d, \"c.xlsx\")\n_w = Workbook(); _s = _w.active\n_s[\"A1\"] = \"Sayın {{musteri}}\"; _s[\"A1\"].font = Font(bold=True)\n_s[\"B2\"] = \"{{tutar}}\"; _s[\"B3\"] = 7\n_i = _w.create_sheet(\"İkinci\"); _i[\"A1\"] = \"Dönem: {{ay}} / {{yil}}\"\n_w.save(_y)\nsablon_doldur(_y, _c, {\"musteri\": \"Ayşe\", \"tutar\": 150, \"ay\": \"Ekim\", \"yil\": 2024})\n_o = load_workbook(_c)\nassert _o.active[\"A1\"].value == \"Sayın Ayşe\", \"A1: \" + repr(_o.active[\"A1\"].value)\nassert str(_o.active[\"B2\"].value) == \"150\", \"B2: \" + repr(_o.active[\"B2\"].value)\nassert _o.active[\"B3\"].value == 7, \"Sayı hücresine dokunma\"\nassert _o[\"İkinci\"][\"A1\"].value == \"Dönem: Ekim / 2024\", \"Tüm sayfalar ve aynı hücrede iki alan doldurulmalı\"\nassert _o.active[\"A1\"].font.bold, \"Şablonun biçimi korunmalı\"\nassert load_workbook(_y).active[\"A1\"].value == \"Sayın {{musteri}}\", \"Şablon dosyası değişmemeli\"\ntry:\n    sablon_doldur(_y, _c, {\"musteri\": \"Ayşe\"})\n    assert False, \"Eksik alanda ValueError beklenir\"\nexcept ValueError:\n    pass\n",
   "hints": [
    "isinstance(h.value, str) ile yalnız metin hücrelerine bak.",
    "re.sub içinde fonksiyon vererek bilinmeyen alanı yakalarsın."
   ],
   "why": "İşte en sık gelen istek budur: biçimi tasarlanmış dosyayı kodla doldurmak. Şablonu değiştirmemek için farklı dosyaya kaydedilir."
  },
  {
   "t": "code",
   "id": "excel-otomasyon-g5",
   "stage": "Rehberli",
   "diff": 2,
   "q": "<p><b>pandas ile Excel.</b> <code>rapor(yol, df)</code>: <code>pd.ExcelWriter</code> ile iki sayfa yaz, indeksiz: <code>Ham</code> (df) ve <code>Şehir</code> (<code>sehir</code> başına <code>tutar</code> toplamı; <code>sehir</code>, <code>tutar</code> sütunları). <code>oku(yol)</code>: <code>read_excel</code> ile yalnız <code>Ham</code> sayfasından <code>sehir</code> ve <code>tutar</code> sütunlarını al, <code>sehir</code> türü <code>str</code> olsun.</p>",
   "start": "import pandas as pd\n\ndef rapor(yol, df):\n    pass\n\ndef oku(yol):\n    pass\n",
   "sol": "import pandas as pd\n\ndef rapor(yol, df):\n    ozet = df.groupby(\"sehir\", as_index=False)[\"tutar\"].sum()\n    with pd.ExcelWriter(yol) as w:\n        df.to_excel(w, sheet_name=\"Ham\", index=False)\n        ozet.to_excel(w, sheet_name=\"Şehir\", index=False)\n\ndef oku(yol):\n    return pd.read_excel(yol, sheet_name=\"Ham\", usecols=[\"sehir\", \"tutar\"], dtype={\"sehir\": str})\n",
   "tests": "import tempfile, os\n_d = tempfile.mkdtemp()\n_y = os.path.join(_d, \"t.xlsx\")\n_df = pd.DataFrame({\"no\": [1, 2, 3], \"sehir\": [\"İzmir\", \"Van\", \"İzmir\"], \"tutar\": [100.0, 50.0, 25.0]})\nrapor(_y, _df)\n_t = pd.read_excel(_y, sheet_name=None)\nassert list(_t) == [\"Ham\", \"Şehir\"], \"Sayfalar: \" + repr(list(_t))\nassert list(_t[\"Ham\"].columns) == [\"no\", \"sehir\", \"tutar\"], \"İndeks yazılmamalı: \" + repr(list(_t[\"Ham\"].columns))\nassert _t[\"Şehir\"].set_index(\"sehir\")[\"tutar\"].to_dict() == {\"İzmir\": 125.0, \"Van\": 50.0}, \"Şehir sayfası yanlış\"\n_o = oku(_y)\nassert list(_o.columns) == [\"sehir\", \"tutar\"] and len(_o) == 3, \"usecols ile iki sütun gelmeli: \" + repr(list(_o.columns))\n_df2 = pd.DataFrame({\"sehir\": [34, 35], \"tutar\": [1.0, 2.0]})\nrapor(_y, _df2)\nassert oku(_y)[\"sehir\"].tolist() == [\"34\", \"35\"], \"Plaka kodu metin kalmalı: dtype kullan\"\n",
   "hints": [
    "with pd.ExcelWriter(yol) as w: bloğu dosyayı kapatır.",
    "df.to_excel(w, sheet_name=\"Ham\", index=False)",
    "dtype={\"sehir\": str}"
   ],
   "why": "dtype özellikle kod sütunlarında önemlidir: 007 sayı olarak okunursa baştaki sıfırlar gider.",
   "needs": [
    "pandas"
   ]
  },
  {
   "t": "code",
   "id": "excel-otomasyon-g6",
   "stage": "Kendin yaz",
   "diff": 2,
   "q": "<p><b>Klasördeki tüm dosyalar.</b> <code>birlestir(klasor)</code>: klasördeki <code>.xlsx</code> dosyalarını ad sırasıyla oku, Excel'in geçici dosyalarını (<code>~$</code> ile başlar) atla, her satıra dosya adını <code>kaynak</code> sütunu olarak ekle, tek DataFrame döndür. İndeks 0'dan başlasın.</p>",
   "start": "from pathlib import Path\nimport pandas as pd\n\ndef birlestir(klasor):\n    pass\n",
   "sol": "from pathlib import Path\nimport pandas as pd\n\ndef birlestir(klasor):\n    parcalar = []\n    for dosya in sorted(Path(klasor).glob(\"*.xlsx\")):\n        if dosya.name.startswith(\"~$\"):\n            continue\n        d = pd.read_excel(dosya)\n        d[\"kaynak\"] = dosya.name\n        parcalar.append(d)\n    return pd.concat(parcalar, ignore_index=True)\n",
   "tests": "import tempfile, os\n_d = tempfile.mkdtemp()\n_y = os.path.join(_d, \"t.xlsx\")\nfor _a, _v in [(\"subat.xlsx\", [2, 3]), (\"ocak.xlsx\", [1])]:\n    pd.DataFrame({\"adet\": _v}).to_excel(os.path.join(_d, _a), index=False)\nopen(os.path.join(_d, \"not.txt\"), \"w\").close()\nif os.path.exists(_y): os.remove(_y)\nopen(os.path.join(_d, \"~$ocak.xlsx\"), \"wb\").write(b\"kilit\")\n_r = birlestir(_d)\nassert len(_r) == 3, \"3 satır beklenir: \" + str(len(_r))\nassert _r[\"kaynak\"].tolist() == [\"ocak.xlsx\", \"subat.xlsx\", \"subat.xlsx\"], \"Ad sırası ve kaynak: \" + repr(_r[\"kaynak\"].tolist())\nassert _r[\"adet\"].tolist() == [1, 2, 3] and list(_r.index) == [0, 1, 2], \"İndeks sıfırlanmalı\"\n",
   "hints": [
    "Path(klasor).glob(\"*.xlsx\") ile bul, sorted ile sırala.",
    "pd.concat(parcalar, ignore_index=True)"
   ],
   "why": "Excel açıkken yanında ~$ kilit dosyası oluşur; okumaya kalkarsan iş çöker. Kaynak sütunu hatalı satırı geri izlemeyi sağlar.",
   "needs": [
    "pandas"
   ]
  },
  {
   "t": "code",
   "id": "excel-otomasyon-g7",
   "stage": "Kendin yaz",
   "diff": 2,
   "q": "<p><b>Tablo, koşullu biçim, filtre.</b> <code>tablo_ekle(yol)</code>: ilk sayfanın dolu alanını <code>Satislar</code> adlı Excel tablosu yap (<code>TableStyleMedium2</code>). B sütununda veri hücrelerine: 2'den küçükse kırmızı dolgu (<code>CellIsRule</code>). C sütununda veri hücrelerine renk skalası (<code>ColorScaleRule</code>). <code>filtre_ekle(yol)</code>: tablo olmayan dosyada dolu alana otomatik filtre koysun. İkisi de aynı dosyaya kaydeder.</p>",
   "start": "from openpyxl import load_workbook\nfrom openpyxl.formatting.rule import CellIsRule, ColorScaleRule\nfrom openpyxl.styles import PatternFill\nfrom openpyxl.worksheet.table import Table, TableStyleInfo\n\ndef tablo_ekle(yol):\n    pass\n\ndef filtre_ekle(yol):\n    pass\n",
   "sol": "from openpyxl import load_workbook\nfrom openpyxl.formatting.rule import CellIsRule, ColorScaleRule\nfrom openpyxl.styles import PatternFill\nfrom openpyxl.worksheet.table import Table, TableStyleInfo\n\ndef tablo_ekle(yol):\n    wb = load_workbook(yol)\n    ws = wb.active\n    t = Table(displayName=\"Satislar\", ref=ws.dimensions)\n    t.tableStyleInfo = TableStyleInfo(name=\"TableStyleMedium2\", showRowStripes=True)\n    ws.add_table(t)\n    son = ws.max_row\n    ws.conditional_formatting.add(f\"B2:B{son}\", CellIsRule(operator=\"lessThan\", formula=[\"2\"], fill=PatternFill(\"solid\", bgColor=\"FFC7CE\")))\n    ws.conditional_formatting.add(f\"C2:C{son}\", ColorScaleRule(start_type=\"min\", start_color=\"FFFFFF\", end_type=\"max\", end_color=\"63BE7B\"))\n    wb.save(yol)\n\ndef filtre_ekle(yol):\n    wb = load_workbook(yol)\n    ws = wb.active\n    ws.auto_filter.ref = ws.dimensions\n    wb.save(yol)\n",
   "tests": "import tempfile, os\n_d = tempfile.mkdtemp()\n_y = os.path.join(_d, \"t.xlsx\")\nfrom openpyxl import Workbook\n_w = Workbook(); _s = _w.active; _s.title = \"Satış\"\nfor _r in [[\"Ürün\", \"Adet\", \"Fiyat\"], [\"Çay\", 2, 50.0], [\"Kahve\", 3, 120.5], [\"Şeker\", 1, 30.0]]:\n    _s.append(_r)\n_w.save(_y)\ntablo_ekle(_y)\n_s = load_workbook(_y).active\nassert \"Satislar\" in _s.tables, \"Satislar tablosu yok\"\nassert _s.tables[\"Satislar\"].ref == \"A1:C4\", \"Tablo alanı: \" + _s.tables[\"Satislar\"].ref\nassert _s.tables[\"Satislar\"].tableStyleInfo.name == \"TableStyleMedium2\", \"Tablo stili yanlış\"\n_k = {str(r.sqref): [x.type for x in r.rules] for r in _s.conditional_formatting}\nassert _k.get(\"B2:B4\") == [\"cellIs\"], \"B sütununda CellIsRule: \" + repr(_k)\nassert _k.get(\"C2:C4\") == [\"colorScale\"], \"C sütununda renk skalası: \" + repr(_k)\n_r = _s.conditional_formatting\n_ku = [x for r in _r if str(r.sqref) == \"B2:B4\" for x in r.rules][0]\nassert _ku.operator == \"lessThan\" and _ku.formula == [\"2\"], \"Kural 2'den küçük olmalı\"\nfrom openpyxl import Workbook\n_w = Workbook(); _s = _w.active; _s.title = \"Satış\"\nfor _r in [[\"Ürün\", \"Adet\", \"Fiyat\"], [\"Çay\", 2, 50.0], [\"Kahve\", 3, 120.5], [\"Şeker\", 1, 30.0]]:\n    _s.append(_r)\n_w.save(_y)\nfiltre_ekle(_y)\nassert load_workbook(_y).active.auto_filter.ref == \"A1:C4\", \"Otomatik filtre alanı yanlış\"\n",
   "hints": [
    "ws.dimensions dolu alanı \"A1:C4\" olarak verir.",
    "ws.add_table(t) tabloyu ekler; adında boşluk olamaz.",
    "Excel tablosu ile aynı alanda ayrı auto_filter kullanma; tablonun kendi filtresi var."
   ],
   "why": "Tablo, kullanıcının filtre ve toplam satırını hazır verir. Koşullu biçim yeni veriyle kendini günceller."
  },
  {
   "t": "code",
   "id": "excel-otomasyon-g8",
   "stage": "Kendin yaz",
   "diff": 2,
   "q": "<p><b>Grafik.</b> <code>grafik_ekle(yol)</code>: ilk sayfada A ürün, B adet, ilk satır başlık. Başlığı <code>Adet</code> olan <code>BarChart</code> kur, veri B sütunu (başlık serinin adı), kategori A sütunu. <code>E2</code> hücresine ekle, kaydet.</p>",
   "start": "from openpyxl import load_workbook\nfrom openpyxl.chart import BarChart, Reference\n\ndef grafik_ekle(yol):\n    pass\n",
   "sol": "from openpyxl import load_workbook\nfrom openpyxl.chart import BarChart, Reference\n\ndef grafik_ekle(yol):\n    wb = load_workbook(yol)\n    ws = wb.active\n    g = BarChart()\n    g.title = \"Adet\"\n    veri = Reference(ws, min_col=2, min_row=1, max_row=ws.max_row)\n    g.add_data(veri, titles_from_data=True)\n    g.set_categories(Reference(ws, min_col=1, min_row=2, max_row=ws.max_row))\n    ws.add_chart(g, \"E2\")\n    wb.save(yol)\n",
   "tests": "import tempfile, os\n_d = tempfile.mkdtemp()\n_y = os.path.join(_d, \"t.xlsx\")\nfrom openpyxl import Workbook\n_w = Workbook(); _s = _w.active; _s.title = \"Satış\"\nfor _r in [[\"Ürün\", \"Adet\", \"Fiyat\"], [\"Çay\", 2, 50.0], [\"Kahve\", 3, 120.5], [\"Şeker\", 1, 30.0]]:\n    _s.append(_r)\n_w.save(_y)\ngrafik_ekle(_y)\n_s = load_workbook(_y).active\nassert len(_s._charts) == 1, \"Bir grafik beklenir\"\n_g = _s._charts[0]\nassert type(_g).__name__ == \"BarChart\", \"BarChart olmalı\"\nassert len(_g.series) == 1, \"Tek seri beklenir\"\n_f = _g.series[0].val.numRef.f\nassert _f.endswith(\"$B$2:$B$4\"), \"Veri aralığı B2:B4 olmalı: \" + _f\nassert _g.series[0].cat.strRef is not None or _g.series[0].cat.numRef is not None, \"Kategori verilmeli\"\n_cf = (_g.series[0].cat.strRef or _g.series[0].cat.numRef).f\nassert _cf.endswith(\"$A$2:$A$4\"), \"Kategori A2:A4 olmalı: \" + _cf\nassert _g.anchor._from.col == 4 and _g.anchor._from.row == 1, \"Grafik E2'de olmalı\"\n",
   "hints": [
    "Reference(ws, min_col=2, min_row=1, max_row=ws.max_row): başlık dahil.",
    "g.add_data(veri, titles_from_data=True)"
   ],
   "why": "Grafik veriye bağlıdır, resim değildir: kullanıcı Excel'de sayıyı değiştirince çubuk da değişir."
  },
  {
   "t": "code",
   "id": "excel-otomasyon-g9",
   "stage": "Meydan okuma",
   "diff": 3,
   "q": "<p><b>XlsxWriter.</b> <code>xw_rapor(yol, satirlar)</code>: <code>satirlar</code> <code>(sehir, ciro)</code> demetleridir. <code>Rapor</code> sayfası: kalın başlık <code>Şehir, Ciro</code>; ciro <code>#,##0.00</code> biçiminde; 1000'den büyük ciroya koşullu kırmızı dolgu; sütun grafiği <code>D2</code>'de. Test dosyayı openpyxl ile okur.</p>",
   "start": "import xlsxwriter\n\ndef xw_rapor(yol, satirlar):\n    pass\n",
   "sol": "import xlsxwriter\n\ndef xw_rapor(yol, satirlar):\n    wb = xlsxwriter.Workbook(yol)\n    ws = wb.add_worksheet(\"Rapor\")\n    kalin = wb.add_format({\"bold\": True})\n    para = wb.add_format({\"num_format\": \"#,##0.00\"})\n    kirmizi = wb.add_format({\"bg_color\": \"#FFC7CE\"})\n    ws.write_row(0, 0, [\"Şehir\", \"Ciro\"], kalin)\n    for i, (s, c) in enumerate(satirlar, 1):\n        ws.write(i, 0, s)\n        ws.write(i, 1, c, para)\n    n = len(satirlar)\n    ws.conditional_format(1, 1, n, 1, {\"type\": \"cell\", \"criteria\": \">\", \"value\": 1000, \"format\": kirmizi})\n    g = wb.add_chart({\"type\": \"column\"})\n    g.add_series({\"categories\": [\"Rapor\", 1, 0, n, 0], \"values\": [\"Rapor\", 1, 1, n, 1], \"name\": \"Ciro\"})\n    ws.insert_chart(\"D2\", g)\n    wb.close()\n",
   "tests": "import tempfile, os\n_d = tempfile.mkdtemp()\n_y = os.path.join(_d, \"t.xlsx\")\nxw_rapor(_y, [(\"İzmir\", 1500.5), (\"Van\", 200.0)])\nfrom openpyxl import load_workbook\n_s = load_workbook(_y)[\"Rapor\"]\nassert [c.value for c in _s[1]] == [\"Şehir\", \"Ciro\"] and _s[\"A1\"].font.bold, \"Başlık kalın olmalı\"\nassert _s[\"B2\"].value == 1500.5 and _s[\"B2\"].number_format == \"#,##0.00\", \"Ciro biçimi yanlış\"\n_k = [x for r in _s.conditional_formatting if str(r.sqref) == \"B2:B3\" for x in r.rules]\nassert _k and _k[0].operator == \"greaterThan\" and _k[0].formula == [\"1000\"], \"Koşullu biçim B2:B3, 1000'den büyük\"\nassert len(_s._charts) == 1 and type(_s._charts[0]).__name__ == \"BarChart\", \"Sütun grafiği beklenir\"\nassert _s._charts[0].anchor._from.col == 3, \"Grafik D sütununda olmalı\"\n",
   "hints": [
    "wb.close() dosyayı yazar; unutursan dosya oluşmaz.",
    "Satır ve sütun 0'dan başlar: A1 = (0, 0)."
   ],
   "why": "XlsxWriter yalnız yazar, ama biçim ve grafik seçenekleri geniştir. Sıfırdan rapor için çoğu zaman en kısa yol budur."
  },
  {
   "t": "code",
   "id": "excel-otomasyon-g10",
   "stage": "Hata avı",
   "diff": 2,
   "q": "<p><b>Hatayı bul ve düzelt.</b> Dosyanın ilk iki satırı rapor başlığı, gerçek başlık üçüncü satırda. <code>toplam(yol)</code> <code>KeyError: 'Tutar'</code> veriyor. Düzelt.</p>",
   "start": "import pandas as pd\n\ndef toplam(yol):\n    d = pd.read_excel(yol)\n    return d[\"Tutar\"].sum()\n",
   "sol": "import pandas as pd\n\ndef toplam(yol):\n    d = pd.read_excel(yol, header=2)\n    return d[\"Tutar\"].sum()\n",
   "tests": "import tempfile, os\n_d = tempfile.mkdtemp()\n_y = os.path.join(_d, \"t.xlsx\")\nfrom openpyxl import Workbook\n_w = Workbook(); _s = _w.active\nfor _r in [[\"Bayi raporu\"], [\"Ocak 2024\"], [\"Bayi\", \"Tutar\"], [\"A\", 10], [\"B\", 5]]:\n    _s.append(_r)\n_w.save(_y)\nassert toplam(_y) == 15, \"Toplam 15 olmalı\"\n",
   "hints": [
    "pandas ilk satırı başlık sanar.",
    "header=2: üçüncü satır (0'dan sayılır)."
   ],
   "why": "Elle hazırlanan Excel dosyalarında tablo nadiren ilk satırdan başlar. Önce head() ile bak.",
   "needs": [
    "pandas"
   ],
   "kind": "bug"
  }
 ]
}
);
})(window);
