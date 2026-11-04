/* Kesit Python: gerçek Word ve PDF görevleri, RPA, e-posta. uretec/p2/gercek.py üretir, elle düzenleme. */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
{
 "id": "pdf-word-otomasyon",
 "min": 25,
 "html": "<h2>Gerçek Word ve PDF dosyası</h2><p>Aşağıdaki görevler tarayıcıda gerçek <code>.docx</code> ve <code>.pdf</code> yazar, açar ve okur; sonucu indirip kendi programında görebilirsin. İlk kullanımda inenler: python-docx yaklaşık 250 KB, pypdf yaklaşık 410 KB, reportlab yaklaşık 2 MB.</p>\n<pre class=\"py\">from docx import Document\n\nd = Document()\nd.add_heading(\"Kira sözleşmesi\", level=1)\nd.add_paragraph(\"Taraflar aşağıdadır.\")\nd.save(\"ornek.docx\")\nprint([p.text for p in Document(\"ornek.docx\").paragraphs])</pre>\n<div class=\"tbl-wrap\"><table><tr><th>İş</th><th>Burada</th><th>Bilgisayarında</th></tr><tr><td>Word okuma, yazma, şablon</td><td>python-docx</td><td>docxtpl ile Jinja2 şablon</td></tr><tr><td>PDF metin okuma, birleştirme, bölme</td><td>pypdf</td><td>Tablo için pdfplumber</td></tr><tr><td>PDF üretme</td><td>reportlab</td><td>HTML'den WeasyPrint</td></tr><tr><td>Taranmış PDF (OCR)</td><td>Yok</td><td>pytesseract</td></tr></table></div>\n<div class=\"warn\"><b>Türkçe harf</b>reportlab'ın hazır yazı tiplerinde ş, ğ, ı gibi harfler yoktur. Gerçek belgede <code>pdfmetrics.registerFont(TTFont(...))</code> ile bir TTF yazı tipi kaydet. Görevler bu yüzden İngilizce harflerle yazılmış metin kullanır.</div>\n<h3>RPA araçları ve Python</h3><p>UiPath ve Power Automate ekrandaki düğmelere basar; API'si olmayan eski programlar için uygundur, kod bilmeyen ekipler de kullanır ama lisans ister ve ekran değişince kırılır. Python dosya ve veri işinde daha sağlamdır, test edilir, ücretsizdir ama ekran otomasyonu zayıftır. Önce API ya da dosya yolunu ara; yoksa RPA düşün.</p>",
 "ex": [
  {
   "t": "code",
   "id": "pdf-word-otomasyon-g1",
   "stage": "Rehberli",
   "diff": 2,
   "q": "<p><b>Word yaz ve oku.</b> <code>belge_yaz(yol, baslik, maddeler, satirlar)</code>: 1. düzey başlık, her madde için paragraf, başlığı <code>Ürün, Tutar</code> olan tablo. <code>belge_oku(yol)</code>: <code>{\"paragraflar\": [...metinler], \"tablo\": [[hücre metinleri], ...]}</code> döndürsün (başlık da bir paragraftır).</p>",
   "start": "from docx import Document\n\ndef belge_yaz(yol, baslik, maddeler, satirlar):\n    pass\n\ndef belge_oku(yol):\n    pass\n",
   "sol": "from docx import Document\n\ndef belge_yaz(yol, baslik, maddeler, satirlar):\n    d = Document()\n    d.add_heading(baslik, level=1)\n    for m in maddeler:\n        d.add_paragraph(m)\n    t = d.add_table(rows=1, cols=2)\n    t.rows[0].cells[0].text = \"Ürün\"\n    t.rows[0].cells[1].text = \"Tutar\"\n    for ad, tutar in satirlar:\n        h = t.add_row().cells\n        h[0].text = ad\n        h[1].text = str(tutar)\n    d.save(yol)\n\ndef belge_oku(yol):\n    d = Document(yol)\n    return {\"paragraflar\": [p.text for p in d.paragraphs], \"tablo\": [[h.text for h in r.cells] for r in d.tables[0].rows]}\n",
   "tests": "import tempfile, os\n_y = os.path.join(tempfile.mkdtemp(), \"t.docx\")\nbelge_yaz(_y, \"Teklif\", [\"Birinci madde\", \"İkinci madde\"], [(\"Çay\", 50), (\"Kahve\", 120)])\n_o = belge_oku(_y)\nassert _o[\"paragraflar\"] == [\"Teklif\", \"Birinci madde\", \"İkinci madde\"], \"Paragraflar: \" + repr(_o[\"paragraflar\"])\nassert _o[\"tablo\"] == [[\"Ürün\", \"Tutar\"], [\"Çay\", \"50\"], [\"Kahve\", \"120\"]], \"Tablo: \" + repr(_o[\"tablo\"])\n_d = Document(_y)\nassert _d.paragraphs[0].style.name == \"Heading 1\", \"İlk paragraf başlık olmalı\"\n_d.add_paragraph(\"Ek\"); _d.save(_y)\nassert belge_oku(_y)[\"paragraflar\"][-1] == \"Ek\", \"belge_oku dosyadan okumalı\"\n",
   "hints": [
    "d.add_heading(baslik, level=1)",
    "t.add_row().cells yeni satırın hücrelerini verir.",
    "Hücreye metin yazılır: str(tutar)."
   ],
   "why": "docx bir zip içinde XML'dir. python-docx bunu paragraf ve tablo olarak gösterir."
  },
  {
   "t": "code",
   "id": "pdf-word-otomasyon-g2",
   "stage": "Kendin yaz",
   "diff": 2,
   "q": "<p><b>Word şablonu.</b> <code>word_doldur(sablon, cikti, veri)</code>: paragraflardaki ve tablo hücrelerindeki <code>{{alan}}</code> yer tutucularını doldur. Dikkat: Word bir yer tutucuyu birkaç parçaya (run) bölebilir; yalnız tek parçaya bakan kod onu bulamaz. Şablon değişmesin.</p>",
   "start": "import re\nfrom docx import Document\n\ndef word_doldur(sablon, cikti, veri):\n    pass\n",
   "sol": "import re\nfrom docx import Document\n\ndef _doldur(p, veri):\n    if \"{{\" not in p.text:\n        return\n    yeni = re.sub(r\"\\{\\{(\\w+)\\}\\}\", lambda m: str(veri[m.group(1)]), p.text)\n    p.runs[0].text = yeni\n    for r in p.runs[1:]:\n        r.text = \"\"\n\ndef word_doldur(sablon, cikti, veri):\n    d = Document(sablon)\n    for p in d.paragraphs:\n        _doldur(p, veri)\n    for t in d.tables:\n        for s in t.rows:\n            for h in s.cells:\n                for p in h.paragraphs:\n                    _doldur(p, veri)\n    d.save(cikti)\n",
   "tests": "import tempfile, os\n_k = tempfile.mkdtemp(); _s = os.path.join(_k, \"s.docx\"); _c = os.path.join(_k, \"c.docx\")\n_d = Document()\n_p = _d.add_paragraph(); _p.add_run(\"Sayın {{mus\"); _p.add_run(\"teri}}, borcunuz \").bold = False; _p.add_run(\"{{tutar}} TL\")\n_d.add_paragraph(\"Değişmeyen satır\")\n_t = _d.add_table(rows=1, cols=1); _t.rows[0].cells[0].text = \"Vade: {{vade}}\"\n_d.save(_s)\nword_doldur(_s, _c, {\"musteri\": \"Ayşe\", \"tutar\": 150, \"vade\": \"Ekim\"})\n_o = Document(_c)\nassert _o.paragraphs[0].text == \"Sayın Ayşe, borcunuz 150 TL\", \"Parçalara bölünmüş alan: \" + repr(_o.paragraphs[0].text)\nassert _o.paragraphs[1].text == \"Değişmeyen satır\", \"Yer tutucusuz paragrafa dokunma\"\nassert _o.tables[0].rows[0].cells[0].text == \"Vade: Ekim\", \"Tablo hücresi doldurulmalı\"\nassert \"{{\" in Document(_s).paragraphs[0].text, \"Şablon değişmemeli\"\n",
   "hints": [
    "p.text tüm parçaları birleştirir; yeni metni ilk parçaya yaz, diğerlerini boşalt.",
    "Tablo hücrelerinin de .paragraphs listesi vardır."
   ],
   "why": "Word'de yazım denetimi bile metni parçalara böler. Bu tuzağı bilmeyen kod bazı belgelerde sessizce çalışmaz. Karmaşık şablon için docxtpl daha rahattır."
  },
  {
   "t": "code",
   "id": "pdf-word-otomasyon-g3",
   "stage": "Kendin yaz",
   "diff": 2,
   "q": "<p><b>PDF üret.</b> <code>fatura_pdf(yol, no, satirlar)</code>: reportlab ile iki sayfa yaz. Birinci sayfa: <code>Fatura No: {no}</code> ve her satır için <code>{ad}: {tutar}</code>. İkinci sayfa: <code>Toplam: {toplam}</code>. Test dosyayı pypdf ile okur.</p>",
   "start": "from reportlab.pdfgen import canvas\n\ndef fatura_pdf(yol, no, satirlar):\n    pass\n",
   "sol": "from reportlab.pdfgen import canvas\n\ndef fatura_pdf(yol, no, satirlar):\n    c = canvas.Canvas(yol)\n    c.drawString(72, 780, f\"Fatura No: {no}\")\n    y = 750\n    for ad, tutar in satirlar:\n        c.drawString(72, y, f\"{ad}: {tutar}\")\n        y -= 20\n    c.showPage()\n    c.drawString(72, 780, f\"Toplam: {sum(t for _, t in satirlar)}\")\n    c.save()\n",
   "tests": "import tempfile, os\nfrom pypdf import PdfReader\n_y = os.path.join(tempfile.mkdtemp(), \"f.pdf\")\nfatura_pdf(_y, \"A-12\", [(\"Cay\", 50), (\"Kahve\", 120)])\n_r = PdfReader(_y)\nassert len(_r.pages) == 2, \"İki sayfa beklenir: \" + str(len(_r.pages))\n_a = _r.pages[0].extract_text()\nassert \"Fatura No: A-12\" in _a and \"Cay: 50\" in _a and \"Kahve: 120\" in _a, \"Birinci sayfa: \" + repr(_a)\nassert \"Toplam: 170\" in _r.pages[1].extract_text(), \"Toplam ikinci sayfada 170 olmalı\"\n",
   "hints": [
    "c.drawString(x, y, metin); y yukarıdan aşağı azalır.",
    "c.showPage() sayfayı bitirir; c.save() dosyayı yazar."
   ],
   "why": "PDF sayfaya konum vererek yazılır, Word gibi akmaz. Uzun tabloda sayfa taşmasını sen yönetirsin."
  },
  {
   "t": "code",
   "id": "pdf-word-otomasyon-g4",
   "stage": "Kendin yaz",
   "diff": 2,
   "q": "<p><b>PDF oku.</b> <code>toplam_oku(yol)</code>: pypdf ile tüm sayfaların metnini birleştir, <code>Toplam: 170</code> kalıbındaki sayıyı bul. <code>{\"sayfa\": sayfa_sayısı, \"toplam\": sayı ya da None}</code> döndür.</p>",
   "start": "import re\nfrom pypdf import PdfReader\n\ndef toplam_oku(yol):\n    pass\n",
   "sol": "import re\nfrom pypdf import PdfReader\n\ndef toplam_oku(yol):\n    r = PdfReader(yol)\n    metin = \"\\n\".join(s.extract_text() for s in r.pages)\n    m = re.search(r\"Toplam:\\s*(\\d+)\", metin)\n    return {\"sayfa\": len(r.pages), \"toplam\": int(m.group(1)) if m else None}\n",
   "tests": "import tempfile, os\nfrom reportlab.pdfgen import canvas\ndef _pdf(y, sayfalar):\n    c = canvas.Canvas(y)\n    for s in sayfalar:\n        c.drawString(72, 780, s); c.showPage()\n    c.save()\n_k = tempfile.mkdtemp()\n_a = os.path.join(_k, \"a.pdf\"); _pdf(_a, [\"Fatura\", \"Toplam: 170\"])\nassert toplam_oku(_a) == {\"sayfa\": 2, \"toplam\": 170}, repr(toplam_oku(_a))\n_b = os.path.join(_k, \"b.pdf\"); _pdf(_b, [\"Toplam yok\"])\nassert toplam_oku(_b) == {\"sayfa\": 1, \"toplam\": None}, \"Kalıp yoksa None\"\n",
   "hints": [
    "s.extract_text() her sayfanın metnini verir.",
    "re.search(r\"Toplam:\\s*(\\d+)\", metin)"
   ],
   "why": "Metin katmanı olan PDF'lerde çalışır. Taranmış belgede extract_text boş döner; OCR gerekir. Boş sonucu her zaman denetle."
  },
  {
   "t": "code",
   "id": "pdf-word-otomasyon-g5",
   "stage": "Kendin yaz",
   "diff": 2,
   "q": "<p><b>Birleştir ve böl.</b> <code>birlestir(yollar, cikti)</code>: PDF'leri sırayla tek dosyada birleştirsin. <code>bol(yol, kalip)</code>: her sayfayı ayrı dosyaya yazsın; dosya adı <code>kalip.format(sayfa_no)</code> (1'den başlar), ad listesini döndürsün.</p>",
   "start": "from pypdf import PdfReader, PdfWriter\n\ndef birlestir(yollar, cikti):\n    pass\n\ndef bol(yol, kalip):\n    pass\n",
   "sol": "from pypdf import PdfReader, PdfWriter\n\ndef birlestir(yollar, cikti):\n    w = PdfWriter()\n    for y in yollar:\n        for s in PdfReader(y).pages:\n            w.add_page(s)\n    w.write(cikti)\n\ndef bol(yol, kalip):\n    adlar = []\n    for i, s in enumerate(PdfReader(yol).pages, 1):\n        w = PdfWriter()\n        w.add_page(s)\n        ad = kalip.format(i)\n        w.write(ad)\n        adlar.append(ad)\n    return adlar\n",
   "tests": "import tempfile, os\nfrom reportlab.pdfgen import canvas\ndef _pdf(y, sayfalar):\n    c = canvas.Canvas(y)\n    for s in sayfalar:\n        c.drawString(72, 780, s); c.showPage()\n    c.save()\n_k = tempfile.mkdtemp()\n_a = os.path.join(_k, \"a.pdf\"); _b = os.path.join(_k, \"b.pdf\"); _c = os.path.join(_k, \"c.pdf\")\n_pdf(_a, [\"Bir\", \"Iki\"]); _pdf(_b, [\"Uc\"])\nbirlestir([_b, _a], _c)\n_r = PdfReader(_c)\nassert [s.extract_text().strip() for s in _r.pages] == [\"Uc\", \"Bir\", \"Iki\"], \"Sıra korunmalı\"\n_ad = bol(_c, os.path.join(_k, \"p{}.pdf\"))\nassert [os.path.basename(x) for x in _ad] == [\"p1.pdf\", \"p2.pdf\", \"p3.pdf\"], repr(_ad)\nassert PdfReader(_ad[2]).pages[0].extract_text().strip() == \"Iki\" and len(PdfReader(_ad[2]).pages) == 1, \"Her dosyada tek sayfa\"\n",
   "hints": [
    "w = PdfWriter(); w.add_page(sayfa); w.write(yol)",
    "bol içinde her sayfa için yeni PdfWriter aç."
   ],
   "why": "Yeni PdfWriter açmayı unutursan her dosya öncekileri de taşır; en sık hata budur."
  }
 ]
},
{
 "id": "ofis-otomasyon",
 "min": 8,
 "ex": [
  {
   "t": "local",
   "id": "ofis-otomasyon-gy1",
   "stage": "Kendi bilgisayarında",
   "q": "<p>E-postayı gerçekten gönder, ama dışarı çıkmadan: bilgisayarında sahte bir SMTP sunucusu aç, mesaj terminaline düşsün. Bu görev bu ortamda çalıştırıldı.</p>",
   "steps": [
    "<code>python -m pip install aiosmtpd</code> yaz.",
    "Bir terminalde sunucuyu başlat: <code>python -m aiosmtpd -n -l 127.0.0.1:8025</code>.",
    "Kodu <code>gonder.py</code> olarak kaydet, ikinci terminalde çalıştır.",
    "İlk terminalde mesajı gör. Gerçek sunucuda <code>starttls()</code> ve <code>login()</code> eklenir; şifre ortam değişkeninden okunur."
   ],
   "file": "import smtplib\nfrom email.message import EmailMessage\n\nm = EmailMessage()\nm[\"Subject\"] = \"Haftalik rapor\"\nm[\"From\"] = \"rapor@ornek.test\"\nm[\"To\"] = \"mudur@ornek.test\"\nm.set_content(\"Rapor ektedir.\")\nm.add_attachment(b\"a,b\\n1,2\\n\", maintype=\"text\", subtype=\"csv\", filename=\"rapor.csv\")\n\nwith smtplib.SMTP(\"127.0.0.1\", 8025) as s:\n    s.send_message(m)\nprint(\"gonderildi\")\n",
   "fname": "gonder.py",
   "cmd": "python gonder.py",
   "expect": "gonderildi"
  }
 ]
}
);
})(window);
