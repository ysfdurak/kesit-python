/* Kesit Python v2/n6 — PDF ve Word belgeleriyle otomasyon */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push({
  id: 'pdf-word-otomasyon',
  lv: 'orta',
  mod: 'Otomasyon ve Araçlar',
  min: 55,
  title: 'PDF ve Word belgeleriyle otomasyon',
  sum: 'PDF\'in metin katmanı ile taranmış görüntü farkını, pypdf ile birleştirme, bölme ve filigranı, pdfplumber ile tablo ve metin çıkarmayı, regex ile fatura ve ekstre alanı ayıklamayı, string.Template, Jinja2 ve docxtpl ile şablon doldurmayı, toplu işlemde hata dayanıklılığını ve KVKK maskelemeyi Lezzet Kurye ve Ilgaz Bank verisiyle öğrenirsin.',
  needs: ['jinja2'],
  goals: [
    'Dijital ve taranmış PDF\'i ayırt edip pypdf, pdfplumber ya da OCR arasında doğru aracı seçebilirim.',
    'Fatura ve ekstre metninden regex ile alanları ayıklar, Türkçe sayı biçimini doğru çevirir ve aritmetik tutarlılığı denetleyebilirim.',
    'string.Template, Jinja2 ve docxtpl ile sözleşme, fatura ve teklif şablonlarını eksik alan denetimiyle doldurabilirim.',
    'Bir klasördeki yüzlerce belgeyi hata listesi tutarak, tek dosyada durmadan toplu işleyebilirim.',
    'Ad, T.C. kimlik numarası, telefon, e-posta ve IBAN\'ı KVKK\'ya uygun biçimde maskeleyebilirim.'
  ],
  body: `<h2>Neden önemli? Her ay 200 PDF, bir Excel</h2>
<p>Lezzet Kurye'nin finans ekibi her ay sonunda 30 restorana komisyon faturası keser, bankadan gelen ekstreleri muhasebe sistemine işler ve tedarikçi faturalarındaki tutarları kontrol eder. Bunların hepsi PDF ve Word belgesidir. Bir çalışan bu işi elle yaparsa günler sürer ve kopyala-yapıştır hataları kaçınılmazdır. Python ile belge otomasyonu üç işten oluşur: <b>okumak</b> (PDF'ten metin ve tablo çıkarmak), <b>anlamlandırmak</b> (regex ile alan ayıklamak, doğrulamak) ve <b>üretmek</b> (şablonu doldurup fatura, sözleşme, teklif yazmak). Hepsinin üstünde de kişisel veri (KVKK) sorumluluğu durur.</p>
<p><b>ofis-otomasyon</b> dersinde PDF ve Word'e kısaca dokundun, <b>regex</b> dersinde kalıpları, <b>sablon-rapor</b> dersinde Jinja2'yi öğrendin. Burada bunları belge hattında birleştiriyoruz. pypdf, pdfplumber ve python-docx tarayıcıda çalışmaz; kodlarını gri kutularda göreceksin. Alıştırmalarda ise bu kütüphanelerin <b>döndürdüğü metinle</b> çalışacaksın: gerçek hayatta da işin zor kısmı PDF'i açmak değil, çıkan metni doğru ayıklamaktır.</p>

<h2>PDF'in yapısı: metin katmanı mı, taranmış görüntü mü?</h2>
<p>PDF bir "sayfa tarifi"dir: harflerin koordinatlarını, yazı tiplerini ve görüntüleri tutar; paragraf, satır ya da tablo kavramı yoktur. Bu yüzden iki tür PDF ile karşılaşırsın:</p>
<div class="tbl-wrap"><table>
<tr><th>Tür</th><th>Nasıl oluşur?</th><th>Nasıl okunur?</th><th>İpucu</th></tr>
<tr><td>Dijital (metin katmanlı)</td><td>Yazılımdan "PDF olarak kaydet", e-Fatura, banka ekstresi</td><td>pypdf, pdfplumber, PyMuPDF</td><td>Metni fareyle seçebiliyorsun</td></tr>
<tr><td>Taranmış (görüntü)</td><td>Tarayıcı, telefon fotoğrafı, faks</td><td>OCR: Tesseract (pytesseract), bulut OCR servisleri</td><td><code>extract_text()</code> boş döner</td></tr>
<tr><td>Karma</td><td>Taranmış belgeye sonradan OCR katmanı eklenmiş</td><td>Önce metni dene, kalite kötüyse OCR</td><td>Rakamlarda O/0, l/1 karışıklığı</td></tr>
</table></div>

<h2>pypdf ile okuma, birleştirme, bölme, döndürme, filigran</h2>
<pre class="code"># pip install pypdf
from pypdf import PdfReader, PdfWriter

okuyucu = PdfReader("faturalar/LK-2024-10-0001.pdf")
print(len(okuyucu.pages), okuyucu.metadata.title)
metin = okuyucu.pages[0].extract_text()

# Birleştirme: klasördeki tüm faturalar tek dosyada
yazici = PdfWriter()
for yol in sorted(Path("faturalar").glob("*.pdf")):
    for sayfa in PdfReader(yol).pages:
        yazici.add_page(sayfa)
yazici.write("ekim_faturalari.pdf")

# Bölme ve döndürme: 1-3. sayfalar ayrı dosyaya, 2. sayfa 90 derece
parca = PdfWriter()
for i in (0, 1, 2):
    sayfa = okuyucu.pages[i]
    if i == 1:
        sayfa.rotate(90)
    parca.add_page(sayfa)
parca.write("ilk_uc.pdf")

# Filigran: her sayfaya "TASLAK" PDF'ini bindir
damga = PdfReader("taslak_damga.pdf").pages[0]
for sayfa in yazici.pages:
    sayfa.merge_page(damga)</pre>
<div class="note"><b>Kendi bilgisayarında dene</b><code>pip install pypdf pdfplumber python-docx docxtpl</code>. pypdf saf Python'dur, ek kurulum istemez. OCR için Tesseract programını ayrıca kurman gerekir (Windows'ta UB-Mannheim kurulum paketi, macOS'ta <code>brew install tesseract tesseract-lang</code>, Linux'ta <code>apt install tesseract-ocr tesseract-ocr-tur</code>) ve <code>pip install pytesseract pdf2image</code>.</div>

<h2>pdfplumber ile tablo, regex ile alan</h2>
<p>pdfplumber harflerin koordinatlarını kullanarak satırları ve tabloları yeniden kurar. <code>page.extract_text()</code> okuma sırasına dizilmiş metni, <code>page.extract_tables()</code> hücre listelerini verir. Fatura gibi "etiket: değer" yapısındaki belgelerde ise en sağlam yol metni alıp <b>regex</b> ile alanları ayıklamaktır.</p>
<pre class="code"># pip install pdfplumber
import pdfplumber

with pdfplumber.open("ekstre_2024_03.pdf") as pdf:
    metin = "\\n".join(s.extract_text() or "" for s in pdf.pages)
    tablolar = [t for s in pdf.pages for t in s.extract_tables()]
print(tablolar[0][:3])     # [['Tarih', 'Açıklama', 'Tutar'], ['03.03.2024', 'HAVALE', '3.300,00'], ...]</pre>
<p>Aşağıda <code>extract_text()</code> çıktısı gibi bir fatura metni var (Lezzet Kurye'nin Ekim 2024 verisinden: Köşe Dönercisi'nin teslim edilen siparişlerinin brüt tutarı 44.005 TL, komisyon %15). Her alan için ayrı, satır başına çapalı (<code>^</code> ve <code>re.M</code>) bir kalıp yazıyoruz:</p>
<pre class="py">import re

fatura = """LEZZET KURYE TEKNOLOJİ A.Ş.
KOMİSYON FATURASI
Fatura No: LK-2024-10-0001
Fatura Tarihi: 31.10.2024
Alıcı: Köşe Dönercisi
VKN: 4810527396
Brüt satış: 44.005,00 TL
Komisyon oranı: %15
Ara Toplam: 6.600,75 TL
KDV (%20): 1.320,15 TL
Genel Toplam: 7.920,90 TL
"""


def tr_sayi(metin):
    """'44.005,00' -&gt; 44005.0  (binlik nokta, ondalık virgül)"""
    return float(metin.replace(".", "").replace(",", "."))


alanlar = {
    "no": re.search(r"^Fatura No:\\s*(\\S+)", fatura, re.M).group(1),
    "tarih": re.search(r"^Fatura Tarihi:\\s*(\\d{2}\\.\\d{2}\\.\\d{4})", fatura, re.M).group(1),
    "vkn": re.search(r"^VKN:\\s*(\\d{10})$", fatura, re.M).group(1),
    "toplam": tr_sayi(re.search(r"^Genel Toplam:\\s*([\\d.,]+)", fatura, re.M).group(1)),
}
print(alanlar)</pre>
<div class="warn"><b>Türkçe sayı biçimi ve ilk eşleşme tuzağı</b><code>float("44.005,00")</code> hata verir; daha kötüsü <code>float("1.430")</code> sessizce 1,43 olur. Önce binlik noktaları sil, sonra virgülü noktaya çevir. İkinci tuzak: <code>re.search(r"Toplam:")</code> metindeki <b>ilk</b> eşleşmeyi alır, yani "Ara Toplam"ı. Kalıbı satır başına çapala ve etiketi tam yaz.</div>

<h2>Şablon doldurma: string.Template, Jinja2 ve python-docx</h2>
<p>Sözleşme, teklif ve fatura metinleri sabit bir iskelet ile değişen alanlardan oluşur. Hukuk biriminden gelen ve kod bilmeyen birinin düzenleyeceği basit metinler için <code>string.Template</code> idealdir: <code>$ad</code> ve <code>&#36;{tutar}</code> yer tutucuları dışında hiçbir şey çalıştırmaz. <code>substitute</code> eksik alanda <code>KeyError</code> verir, <code>safe_substitute</code> yer tutucuyu olduğu gibi bırakır; bu yüzden ikincisini kullanıp geriye kalan <code>$</code> alanlarını denetlemek iyi bir kalıptır.</p>
<pre class="py">from string import Template
import re

sablon = Template("""KREDİ KARTI LİMİT ARTIŞ BİLDİRİMİ
Sayın $ad_soyad,
$hesap numaralı kartınızın limiti &#36;{yeni_limit} TL olarak güncellenmiştir.
Geçerlilik tarihi: $tarih""")

alanlar = {"ad_soyad": "İrem Çelik", "hesap": "100019", "yeni_limit": "35.000,00"}
metin = sablon.safe_substitute(alanlar)
eksik = sorted(set(re.findall(r"\\$\\{?(\\w+)\\}?", metin)))
print(metin)
print("Eksik alanlar:", eksik)</pre>
<p>Döngü, koşul ve biçimlendirme gereken belgelerde Jinja2 kullan (<b>sablon-rapor</b> dersinde ayrıntısıyla gördün). Kendi <code>tl</code> filtrenle Türkçe para biçimi kurabilirsin:</p>
<pre class="py">from jinja2 import Environment, StrictUndefined

def tr_para(x):
    return f"{x:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


env = Environment(undefined=StrictUndefined, trim_blocks=True, lstrip_blocks=True)
env.filters["tl"] = tr_para
sablon = env.from_string("""Fatura: {{ no }}
{% for s in satirlar %}
{{ "%-20s"|format(s.ad) }} {{ s.adet }} x {{ s.fiyat|tl }} = {{ (s.adet * s.fiyat)|tl }} TL
{% endfor %}
Toplam: {{ satirlar|sum(attribute="tutar")|tl }} TL""")

satirlar = [{"ad": "Tavuk Döner Dürüm", "adet": 3, "fiyat": 140.0},
            {"ad": "Patates Kızartması", "adet": 1, "fiyat": 65.0},
            {"ad": "Et Döner Porsiyon", "adet": 1, "fiyat": 245.0}]
for s in satirlar:
    s["tutar"] = s["adet"] * s["fiyat"]
print(sablon.render(no="SIP-2", satirlar=satirlar))</pre>
<p>Word belgesi için <b>python-docx</b> paragrafları ve tabloları düzenler; ama bir yer tutucu Word içinde birkaç "run"a bölünmüş olabileceği için düz <code>replace</code> çoğu zaman işe yaramaz. Bu yüzden şablon doldurmada Jinja2 sözdizimini Word içinde kullanan <b>docxtpl</b> tercih edilir:</p>
<pre class="code"># pip install python-docx docxtpl
from docx import Document
from docxtpl import DocxTemplate

belge = Document("teklif.docx")
for p in belge.paragraphs:
    print(p.style.name, p.text)
tablo = belge.tables[0]
tablo.add_row().cells[0].text = "Kurulum hizmeti"
belge.save("teklif_guncel.docx")

# Şablonda: "Sayın {{ musteri }}, {% for k in kalemler %}{{ k.ad }} ... {% endfor %}"
sablon = DocxTemplate("sozlesme_sablonu.docx")
sablon.render({"musteri": "Köşe Dönercisi", "oran": "%15", "kalemler": kalemler})
sablon.save("sozlesmeler/kose_donercisi.docx")</pre>
<h2>HTML'den PDF ve OCR</h2>
<p>Biçimli PDF üretmenin en rahat yolu önce Jinja2 ile HTML üretip <b>WeasyPrint</b> ile PDF'e çevirmektir: CSS ile sayfa düzeni, logo ve tablo biçimi tasarımcının bildiği dilde kalır. Taranmış belgede ise önce OCR gerekir; OCR çıktısı hatalı olabileceği için ayıkladığın alanları mutlaka <b>doğrula</b> (toplam = ara toplam + KDV mi? VKN 10 hane mi?).</p>
<pre class="code"># pip install weasyprint pytesseract pdf2image
from weasyprint import HTML
HTML(string=html_fatura).write_pdf("LK-2024-10-0001.pdf")

from pdf2image import convert_from_path
import pytesseract
sayfalar = convert_from_path("taranmis_fatura.pdf", dpi=300)
metin = "\\n".join(pytesseract.image_to_string(s, lang="tur") for s in sayfalar)</pre>
<h2>Toplu işlem ve hata dayanıklılığı</h2>
<p>Gerçek klasörde 200 dosyanın birkaçı mutlaka bozuktur: şifreli PDF, eksik alan, farklı şablon. Tek bir dosya yüzünden bütün işin düşmesi kabul edilemez. Her dosyayı <code>try/except</code> içinde işle, başarılıları özet tabloya, başarısızları sebebiyle birlikte hata listesine yaz; iş bitince ikisini de raporla. Aşağıdaki kod geçici bir klasöre faturalar yazıp toplu okuyor:</p>
<pre class="py">import tempfile
from pathlib import Path

klasor = Path(tempfile.mkdtemp())
(klasor / "LK-0001.txt").write_text(fatura, encoding="utf-8")
(klasor / "LK-0002.txt").write_text(fatura.replace("LK-2024-10-0001", "LK-2024-10-0002").replace("7.920,90", "5.104,12"), encoding="utf-8")
(klasor / "LK-0003.txt").write_text("Bu dosya bozuk", encoding="utf-8")

ozet, hatalar = [], []
for yol in sorted(klasor.glob("*.txt")):
    try:
        metin = yol.read_text(encoding="utf-8")
        no = re.search(r"^Fatura No:\\s*(\\S+)", metin, re.M).group(1)
        toplam = tr_sayi(re.search(r"^Genel Toplam:\\s*([\\d.,]+)", metin, re.M).group(1))
        ozet.append((no, toplam))
    except AttributeError:
        hatalar.append((yol.name, "alan bulunamadı"))
print(ozet)
print(hatalar)</pre>
<h2>Kişisel veri (KVKK) maskeleme</h2>
<p>Ekstre, sözleşme ve başvuru belgeleri ad soyad, T.C. kimlik numarası, IBAN, telefon ve e-posta içerir. Bu belgeleri test ortamına, bir yapay zekâ servisine ya da başka bir ekibe göndermeden önce <b>maskelemen</b> gerekir. Maskeleme ile anonimleştirme aynı şey değildir: maskelenmiş veri başka kaynaklarla birleştirilerek kişiye bağlanabiliyorsa hâlâ kişisel veridir. Yalnız gereken alanı paylaş (veri minimizasyonu), maskelemeyi <b>kaynağa en yakın</b> adımda yap ve log'lara ham veri yazma.</p>
<pre class="py">import re

def isim_maskele(ad_soyad):
    return " ".join(k[0] + "*" * (len(k) - 1) for k in ad_soyad.split())

def kvkk_maskele(metin):
    metin = re.sub(r"\\b(\\w)[\\w.]*@", r"\\1***@", metin)                     # e-posta
    metin = re.sub(r"\\b0?5\\d{2}[ ]?\\d{3}[ ]?\\d{2}[ ]?(\\d{2})\\b", r"05** *** ** \\1", metin)   # cep tel.
    metin = re.sub(r"\\bTR\\d{2}(?:[ ]?\\d{4}){5}[ ]?(\\d{2})\\b", r"TR** **** **** **** **** **\\1", metin)  # IBAN
    return metin

print(isim_maskele("İrem Çelik"))
print(kvkk_maskele("İletişim: irem.celik@ornek.com, 0532 123 45 67, IBAN TR33 0006 1005 1978 6457 8413 26"))</pre>
<div class="tip"><b>Doğrula, sonra güven</b>Ayıklanan her belgeye bir tutarlılık kontrolü ekle: ara toplam + KDV = genel toplam, satır tutarları toplamı = ara toplam, tarih dönemin içinde, VKN 10 hane, T.C. kimlik numarası sağlama algoritmasını geçiyor. Kontrolden geçmeyen belge otomatik işlenmez, insan onayı kuyruğuna düşer. Bu, "otomasyon yanlış tutarı muhasebeye işledi" vakalarının çoğunu önler.</div>
<div class="note"><b>Gerçek işte</b>Muhasebe, satın alma ve İK ekiplerinde en çok talep gören otomasyonlar şunlardır: tedarikçi faturalarından tutar ve vade çekip Excel'e dökmek, banka ekstrelerini muhasebe kodlarıyla eşleştirmek, yüzlerce kişiye kişiselleştirilmiş sözleşme ya da bordro PDF'i üretmek, bir klasördeki belgeleri birleştirip arşivlemek. RPA araçları (UiPath, Power Automate) da bu işlerde arka planda çoğu zaman bir Python adımı çalıştırır.</div>
<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Şablona göre ayrıştırıcı seçmek</h3>
<p>Farklı tedarikçilerin faturaları farklı düzendedir. Her şablon için bir ayrıştırıcı fonksiyon yaz ve metindeki imza ifadeye (ör. "LEZZET KURYE" ya da VKN) göre doğru fonksiyonu seçen bir <b>yönlendirici</b> kur. Yeni tedarikçi geldiğinde yalnız bir fonksiyon eklersin; tanınmayan şablon hata kuyruğuna gider.</p>
<h3>Koordinatlı ayıklama</h3>
<p>Etiketsiz alanlarda (ör. sağ üst köşedeki tarih) pdfplumber'ın <code>page.within_bbox((x0, top, x1, bottom))</code> ile belirli bir dikdörtgenin metnini alırsın. Bu yöntem şablona çok bağlıdır; şablon değişince kırılır, bu yüzden testlerle korunmalıdır.</p>
<h3>Belge yapay zekâsı</h3>
<p>Çok çeşitli ve dağınık belgelerde (el yazısı, karışık düzen) bulut belge servisleri (Azure Document Intelligence, Google Document AI, AWS Textract) ya da çok kipli dil modelleri alanları JSON olarak çıkarabilir. Yine de çıktıyı aynı doğrulama kurallarından geçirmek ve kişisel veriyi göndermeden önce maskelemek gerekir.</p>
</section>
`,
  ex: [
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Bir tedarikçi faturasında <code>PdfReader(yol).pages[0].extract_text()</code> boş metin döndürüyor; PDF\'i açınca fatura görünüyor ama fareyle metin seçilemiyor. En olası sebep ve çözüm hangisi?',
      o: ['PDF şifreli; şifreyi kaldırmak yeterli', 'Belge taranmış görüntü; önce OCR (ör. Tesseract) gerekir', 'pypdf Türkçe karakterleri okuyamadığı için metin silinmiş', 'Sayfa döndürülmüş; rotate(90) ile düzeltilince metin gelir'],
      a: 1,
      why: 'Metin katmanı olmayan PDF bir resimden ibarettir; extract_text okuyacak harf bulamaz. Görüntüyü OCR ile metne çevirmek gerekir. Şifreli PDF\'te pypdf hata verir; döndürme metin katmanını değiştirmez; pypdf Unicode metni okur.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Hukuk biriminin düzenleyeceği bir sözleşme metnini doldurmak için <code>string.Template</code>\'in <code>safe_substitute</code> metodunu kullanıyorsun. Sözlükte olmayan bir alan için ne olur?',
      o: ['KeyError fırlatılır ve belge üretilmez', 'Alan boş metinle değiştirilir', 'Yer tutucu metinde olduğu gibi kalır', 'Alanın yerine None yazılır'],
      a: 2,
      why: 'safe_substitute eksik yer tutucuyu ($alan) dokunmadan bırakır; substitute ise KeyError verir. Bu yüzden safe_substitute\'tan sonra metinde kalan $ alanlarını arayıp eksik listesi çıkarmak iyi bir kalıptır: belge sessizce boş alanla gitmez.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Müşteri ekstrelerini bir analiz ekibine göndermeden önce adları <code>İ*** Ç****</code> biçiminde maskeliyorsun. Hangisi doğrudur?',
      o: ['Maskelenen veri artık kişisel veri sayılmaz; istenen her ekibe ve servise gönderilebilir', 'Kişiye geri bağlanabiliyorsa veri hâlâ kişiseldir; yalnız gerekeni paylaş', 'Maskeleme yalnız log dosyalarında gereklidir, belge içeriğinde gerekmez', 'Maskelemeyi, verinin ulaştığı en son sistemde yapmak en güvenli yoldur'],
      a: 1,
      why: 'Maskeleme anonimleştirme değildir: hesap numarası, şehir ve doğum tarihi duruyorsa kişi yeniden tanımlanabilir. Veri minimizasyonu (yalnız gerekeni paylaşmak) ve maskeyi kaynağa en yakın adımda uygulamak KVKK\'nın temel beklentileridir.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Ekstre satırından tutarlar ayıklanıyor. Çıktı nedir?',
      code: 'import re\n\nsatir = "Tutar: 1.250,50 TL, iade -80,00 TL, adet 3"\nprint(re.findall(r"-?[\\d.]+,\\d{2}", satir))\n',
      o: ['[\'1.250,50\', \'-80,00\']', '[\'1.250,50\', \'80,00\']', '[\'1.250,50\', \'-80,00\', \'3\']', '[\'250,50\', \'-80,00\']'],
      a: 0,
      why: 'Kalıp isteğe bağlı eksi, ardından rakam ve nokta dizisi, virgül ve iki rakam ister. \'3\' virgül içermediği için eşleşmez; eksi işareti kalıba dahil olduğu için \'-80,00\' bütün olarak gelir.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Şablon eksik alanla dolduruluyor. Çıktı nedir?',
      code: 'from string import Template\n\nt = Template("Sayın $ad, ${tutar}TL borcunuz var. $not")\nprint(t.safe_substitute(ad="Ayşe", tutar="500"))\n',
      o: ['Sayın Ayşe, 500TL borcunuz var. $not', 'Sayın Ayşe, 500TL borcunuz var. ', 'KeyError hatası verir', 'Sayın Ayşe, ${tutar}TL borcunuz var. $not'],
      a: 0,
      why: '${tutar} biçimi, yer tutucunun hemen ardından harf geldiğinde (TL) adın nerede bittiğini belirtir. safe_substitute verilmeyen $not alanını olduğu gibi bırakır.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Telefon numarası maskeleniyor. Çıktı nedir?',
      code: 'import re\n\nprint(re.sub(r"\\d(?=\\d{2})", "*", "05321234567"))\n',
      o: ['*********67', '053*****567', '***********', '0*********7'],
      a: 0,
      why: '(?=\\d{2}) ileri bakıştır: ardından en az iki rakam gelen her rakam yıldızla değişir. Son iki rakamın ardından iki rakam gelmediği için onlar korunur: 11 haneden 9\'u maskelenir.'
    },
    {
      t: 'order',
      stage: 'Kodu oku',
      q: '<p>Fatura metninden <b>Genel Toplam</b>\'ı ayıklayıp sayıya çeviren programın satırlarını sırala.</p>',
      lines: ['import re', 'metin = "Ara Toplam: 6.600,75 TL\\nGenel Toplam: 7.920,90 TL"', 'm = re.search(r"^Genel Toplam:\\s*([\\d.,]+)", metin, re.M)', 'ham = m.group(1)', 'tutar = float(ham.replace(".", "").replace(",", "."))', 'print(tutar)'],
      expect: '7920.9\n',
      hint: 'Önce metin, sonra arama; eşleşmeden grup alınır, grup sayıya çevrilir.',
      why: 're.M ile ^ her satırın başına çapalanır; böylece \'Ara Toplam\' satırı eşleşmez. Türkçe sayı biçiminde önce binlik noktalar silinir, sonra ondalık virgül noktaya çevrilir.'
    },
    {
      t: 'code',
      id: 'pdf-word-otomasyon-1',
      stage: 'Rehberli',
      diff: 1,
      q: '<p><code>fatura</code> değişkeni pdfplumber\'ın bir Lezzet Kurye komisyon faturasından çıkardığı metni taklit ediyor. <code>fatura_alanlari(metin)</code> fonksiyonunu yaz; şu sözlüğü döndürsün:</p><ul><li><code>no</code>: Fatura No (ör. <code>LK-2024-10-0001</code>)</li><li><code>tarih</code>: Fatura Tarihi ISO biçiminde (<code>2024-10-31</code>)</li><li><code>vkn</code>: 10 haneli vergi numarası (metin)</li><li><code>toplam</code>: Genel Toplam, float</li></ul><p>Türkçe sayıyı çevirmek için <code>tr_sayi</code> hazır.</p>',
      guide: ['Her alan için satır başına çapalı bir kalıp yaz ve <code>re.M</code> bayrağını kullan.', 'Tarihi <code>(\\d{2})\\.(\\d{2})\\.(\\d{4})</code> gruplarıyla al, ters sırada <code>-</code> ile birleştir.', 'Genel Toplam için <code>^Genel Toplam:</code> etiketini tam yaz; \'Ara Toplam\' ile karışmasın.', 'Sayıyı <code>tr_sayi</code> ile çevir ve sözlüğü döndür.'],
      example: 'import re\nfis = "Kasa: 3\\nTarih: 05.01.2024\\nTutar: 1.250,50"\ng, a, y = re.search(r"^Tarih:\\s*(\\d{2})\\.(\\d{2})\\.(\\d{4})", fis, re.M).groups()\nprint(f"{y}-{a}-{g}")\n',
      start: 'import re\n\nfatura = """LEZZET KURYE TEKNOLOJİ A.Ş.\nKOMİSYON FATURASI\nFatura No: LK-2024-10-0001\nFatura Tarihi: 31.10.2024\nAlıcı: Köşe Dönercisi\nVKN: 4810527396\nBrüt satış: 44.005,00 TL\nKomisyon oranı: %15\nAra Toplam: 6.600,75 TL\nKDV (%20): 1.320,15 TL\nGenel Toplam: 7.920,90 TL\n"""\n\n\ndef tr_sayi(s):\n    return float(s.replace(".", "").replace(",", "."))\n\n\ndef fatura_alanlari(metin):\n    no = re.search(r"^Fatura No:\\s*(\\S+)", metin, re.M).group(1)\n    # TODO 1: tarih (ISO), vkn ve Genel Toplam\'ı ayıkla\n    return {"no": no}\n',
      sol: 'import re\n\nfatura = """LEZZET KURYE TEKNOLOJİ A.Ş.\nKOMİSYON FATURASI\nFatura No: LK-2024-10-0001\nFatura Tarihi: 31.10.2024\nAlıcı: Köşe Dönercisi\nVKN: 4810527396\nBrüt satış: 44.005,00 TL\nKomisyon oranı: %15\nAra Toplam: 6.600,75 TL\nKDV (%20): 1.320,15 TL\nGenel Toplam: 7.920,90 TL\n"""\n\n\ndef tr_sayi(s):\n    return float(s.replace(".", "").replace(",", "."))\n\n\ndef fatura_alanlari(metin):\n    no = re.search(r"^Fatura No:\\s*(\\S+)", metin, re.M).group(1)\n    g, a, y = re.search(r"^Fatura Tarihi:\\s*(\\d{2})\\.(\\d{2})\\.(\\d{4})", metin, re.M).groups()\n    vkn = re.search(r"^VKN:\\s*(\\d{10})\\s*$", metin, re.M).group(1)\n    toplam = tr_sayi(re.search(r"^Genel Toplam:\\s*([\\d.,]+)", metin, re.M).group(1))\n    return {"no": no, "tarih": f"{y}-{a}-{g}", "vkn": vkn, "toplam": toplam}\n\n\nprint(fatura_alanlari(fatura))\n',
      tests: 'r = fatura_alanlari(fatura)\nassert r == {"no": "LK-2024-10-0001", "tarih": "2024-10-31", "vkn": "4810527396", "toplam": 7920.9}, "Alanlar tutmuyor: " + str(r)\nf2 = fatura.replace("31.10.2024", "05.11.2024").replace("7.920,90", "12.480,00")\nr2 = fatura_alanlari(f2)\nassert r2["tarih"] == "2024-11-05" and r2["toplam"] == 12480.0, "Başka faturada da çalışmalı (Ara Toplam değil Genel Toplam alınmalı)"\n',
      hints: ['Tarih için üç grup: gün, ay, yıl; <code>.groups()</code> üçünü birden verir.', 'VKN: <code>r"^VKN:\\s*(\\d{10})\\s*$"</code>', 'Toplam: <code>r"^Genel Toplam:\\s*([\\d.,]+)"</code> ve <code>tr_sayi</code>.'],
      why: 'Etiket + çapa + dar karakter sınıfı, fatura ayıklamanın en sağlam üçlüsüdür. ISO tarih (YYYY-MM-DD) hem sıralanabilir hem de veritabanına doğrudan yazılabilir.'
    },
    {
      t: 'code',
      id: 'pdf-word-otomasyon-2',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Başlangıç kodu, Ilgaz Bank\'ın 100583 numaralı hesabının Mart 2024 ekstresini (<code>bank_txns</code> verisinden) pdfplumber çıktısı gibi metne döküyor. <code>ekstre_satirlari(metin)</code> fonksiyonunu yaz: başlık ve sayfa satırlarını atlayıp her işlem satırından <code>{"tarih": "2024-03-03", "tur": "HAVALE_GIRIS", "tutar": 3300.0}</code> sözlüğü üretsin. Sonra <code>ekstre_ozet(satirlar)</code>: <code>(toplam_giris, toplam_cikis, adet)</code> döndürsün (çıkış negatif, 2 basamak).</p>',
      guide: ['Önce <code>print(ekstre)</code> ile satır biçimini incele.', 'Satır kalıbı: tarih, saat, tür, kanal ve tutar; aralarında bir ya da daha fazla boşluk var.', '<code>re.finditer(kalip, metin, re.M)</code> ile tüm eşleşmeleri gez, tarihi ISO\'ya, tutarı float\'a çevir.', 'Özette pozitifleri ve negatifleri ayrı topla, <code>round(..., 2)</code> uygula.'],
      example: 'import re\nmetin = "BAŞLIK\\n01.02.2024 KIRA -5.000,00\\n02.02.2024 MAAS 40.000,00\\nSayfa 1"\nfor m in re.finditer(r"^(\\d{2})\\.(\\d{2})\\.(\\d{4}) (\\S+) (-?[\\d.]+,\\d{2})$", metin, re.M):\n    print(m.group(4), float(m.group(5).replace(".", "").replace(",", ".")))\n',
      start: 'import veri\n\ntxns = veri.kayitlar("ilgaz_bank", "bank_txns")\n\n\ndef tr_para(x):\n    return f"{x:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")\n\n\n# pdfplumber\'ın page.extract_text() çıktısını taklit eden ekstre metni\nsatirlar = ["ILGAZ BANK HESAP EKSTRESİ", "Hesap No: 100583   Dönem: 03/2024", ""]\nfor t in txns:\n    if t["account_id"] == 100583 and t["txn_time"].startswith("2024-03"):\n        g, s = t["txn_time"].split()\n        tarih = ".".join(reversed(g.split("-")))\n        satirlar.append(f"{tarih} {s[:5]}  {t[\'txn_type\'].upper()}  {t[\'channel\'].upper()}  {tr_para(t[\'amount\'])}")\nsatirlar.append("Sayfa 1/1")\nekstre = "\\n".join(satirlar)\n\nimport re\n\n\ndef ekstre_satirlari(metin):\n    sonuc = []\n    # TODO: işlem satırlarını regex ile ayıkla\n    return sonuc\n\n\ndef ekstre_ozet(satirlar):\n    # TODO: (giriş toplamı, çıkış toplamı, adet)\n    return 0, 0, 0\n',
      sol: 'import veri\n\ntxns = veri.kayitlar("ilgaz_bank", "bank_txns")\n\n\ndef tr_para(x):\n    return f"{x:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")\n\n\n# pdfplumber\'ın page.extract_text() çıktısını taklit eden ekstre metni\nsatirlar = ["ILGAZ BANK HESAP EKSTRESİ", "Hesap No: 100583   Dönem: 03/2024", ""]\nfor t in txns:\n    if t["account_id"] == 100583 and t["txn_time"].startswith("2024-03"):\n        g, s = t["txn_time"].split()\n        tarih = ".".join(reversed(g.split("-")))\n        satirlar.append(f"{tarih} {s[:5]}  {t[\'txn_type\'].upper()}  {t[\'channel\'].upper()}  {tr_para(t[\'amount\'])}")\nsatirlar.append("Sayfa 1/1")\nekstre = "\\n".join(satirlar)\n\nimport re\n\nKALIP = r"^(\\d{2})\\.(\\d{2})\\.(\\d{4}) \\d{2}:\\d{2}\\s+(\\S+)\\s+\\S+\\s+(-?[\\d.]+,\\d{2})$"\n\n\ndef ekstre_satirlari(metin):\n    sonuc = []\n    for m in re.finditer(KALIP, metin, re.M):\n        g, a, y, tur, tutar = m.groups()\n        sonuc.append({"tarih": f"{y}-{a}-{g}", "tur": tur,\n                      "tutar": float(tutar.replace(".", "").replace(",", "."))})\n    return sonuc\n\n\ndef ekstre_ozet(satirlar):\n    giris = round(sum(s["tutar"] for s in satirlar if s["tutar"] > 0), 2)\n    cikis = round(sum(s["tutar"] for s in satirlar if s["tutar"] < 0), 2)\n    return giris, cikis, len(satirlar)\n\n\nprint(ekstre)\ns = ekstre_satirlari(ekstre)\nprint(s[0])\nprint(ekstre_ozet(s))\n',
      tests: 's = ekstre_satirlari(ekstre)\nassert len(s) == 9, "Mart ekstresinde 9 işlem olmalı; başlık ve \'Sayfa 1/1\' satırı alınmamalı. Gelen " + str(len(s))\nassert s[0] == {"tarih": "2024-03-03", "tur": "HAVALE_GIRIS", "tutar": 3300.0}, "İlk satır: " + str(s[0])\nassert s[1]["tutar"] == -1235.25, "Negatif tutar korunmalı: -1.235,25 -> -1235.25"\nassert ekstre_ozet(s) == (49400.0, -9984.5, 9), "Özet (49400.0, -9984.5, 9) olmalı; gelen " + str(ekstre_ozet(s))\n',
      hints: ['Tutar kalıbı: <code>(-?[\\d.]+,\\d{2})</code>; satır sonuna <code>$</code> ile çapala.', 'Kanal sütununu yakalaman gerekmez: <code>\\s+\\S+\\s+</code> ile atla.', 'Çevirme: <code>float(t.replace(".", "").replace(",", "."))</code>.'],
      why: 'Ekstre ayıklamada satır kalıbını dar tutmak (tarih ile başla, tutarla bit) başlık, alt bilgi ve sayfa numarası gibi gürültüyü kendiliğinden eler. Toplamları bankanın ekstre altındaki toplamla karşılaştırmak, ayıklamanın eksiksiz olduğunu kanıtlar.'
    },
    {
      t: 'code',
      id: 'pdf-word-otomasyon-3',
      stage: 'Rehberli',
      diff: 1,
      q: '<p>Sözleşme şablonunu <code>string.Template</code> ile doldur. <code>sozlesme_doldur(sablon_metni, alanlar)</code>: <code>safe_substitute</code> ile doldursun, sonra metinde kalan yer tutucuların adlarını (<code>$ad</code> ya da <code>${ad}</code> biçimi) bulup <b>alfabetik, tekrarsız</b> liste yapsın. Dönüş: <code>(metin, eksikler)</code>.</p>',
      guide: ['<code>Template(sablon_metni).safe_substitute(alanlar)</code> ile doldur.', 'Kalan alanları <code>re.findall(r"\\$\\{?(\\w+)\\}?", metin)</code> ile bul.', '<code>sorted(set(...))</code> ile tekrarsız ve sıralı yap.'],
      example: 'from string import Template\nimport re\nm = Template("Merhaba $ad, ${gun} günü görüşelim. $ad").safe_substitute(gun="Salı")\nprint(m, sorted(set(re.findall(r"\\$\\{?(\\w+)\\}?", m))))\n',
      start: 'from string import Template\nimport re\n\nSABLON = """KOMİSYON SÖZLEŞMESİ\nTaraflar: Lezzet Kurye Teknoloji A.Ş. ile $restoran ($sehir)\nKomisyon oranı: %${oran}\nBaşlangıç: $baslangic\nYetkili: $yetkili, $restoran adına"""\n\n\ndef sozlesme_doldur(sablon_metni, alanlar):\n    metin = sablon_metni      # TODO 1: safe_substitute ile doldur\n    eksikler = []             # TODO 2: kalan yer tutucuları bul\n    return metin, eksikler\n',
      sol: 'from string import Template\nimport re\n\nSABLON = """KOMİSYON SÖZLEŞMESİ\nTaraflar: Lezzet Kurye Teknoloji A.Ş. ile $restoran ($sehir)\nKomisyon oranı: %${oran}\nBaşlangıç: $baslangic\nYetkili: $yetkili, $restoran adına"""\n\n\ndef sozlesme_doldur(sablon_metni, alanlar):\n    metin = Template(sablon_metni).safe_substitute(alanlar)\n    eksikler = sorted(set(re.findall(r"\\$\\{?(\\w+)\\}?", metin)))\n    return metin, eksikler\n\n\nprint(sozlesme_doldur(SABLON, {"restoran": "Köşe Dönercisi", "sehir": "İstanbul", "oran": 15})[0])\n',
      tests: 'm, e = sozlesme_doldur(SABLON, {"restoran": "Köşe Dönercisi", "sehir": "İstanbul", "oran": 15})\nassert "Köşe Dönercisi (İstanbul)" in m and "%15" in m, "Verilen alanlar doldurulmalı"\nassert m.count("Köşe Dönercisi") == 2, "Aynı yer tutucu iki yerde de doldurulmalı"\nassert e == ["baslangic", "yetkili"], "Eksik alanlar alfabetik: [\'baslangic\', \'yetkili\']; gelen " + str(e)\ntam = {"restoran": "Usta Döner", "sehir": "İstanbul", "oran": 22, "baslangic": "01.11.2024", "yetkili": "Ali Kaya"}\nassert sozlesme_doldur(SABLON, tam)[1] == [], "Tüm alanlar verilince eksik listesi boş olmalı"\n',
      hints: ['<code>Template(...).safe_substitute(alanlar)</code> eksik alanda hata vermez.', 'Süslü parantezli biçim de yakalansın: <code>\\{?</code> ve <code>\\}?</code>.'],
      why: 'Eksik alanı sessizce boş bırakmak yerine listelemek, belgeyi göndermeden önce durdurma şansı verir. Toplu üretimde eksik listesi boş olmayan belge \'insan onayı\' klasörüne gider.'
    },
    {
      t: 'code',
      id: 'pdf-word-otomasyon-4',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>KVKK için müşteri adlarını maskele. <code>isim_maskele(ad_soyad)</code>: her kelimenin ilk harfi kalsın, kalan harfler <code>*</code> olsun (<code>"İrem Çelik"</code> → <code>"İ*** Ç****"</code>). Fazla boşluklar tek boşluğa insin. Ardından <code>maskeli_rapor(musteriler, sehir)</code>: <code>veri.kayitlar("ilgaz_bank", "bank_customers")</code> listesinden verilen şehirdeki <b>pazarlama izni olmayan</b> (<code>kvkk_consent == 0</code>) müşterileri <code>(customer_id, maskeli_ad)</code> listesi olarak döndürsün (kimliğe göre sıralı).</p>',
      guide: ['<code>ad_soyad.split()</code> fazla boşlukları da temizler.', 'Her kelime için <code>k[0] + "*" * (len(k) - 1)</code>.', 'Kelimeleri <code>" ".join(...)</code> ile birleştir.', 'Raporda şehir ve izin koşuluyla süz, <code>isim_maskele</code> uygula, kimliğe göre sırala.'],
      example: 'kart = "4543 1234 5678 9012"\ngruplar = kart.split()\nprint(" ".join(g if i in (0, len(gruplar) - 1) else "*" * len(g) for i, g in enumerate(gruplar)))\n',
      start: 'import veri\n\nmusteriler = veri.kayitlar("ilgaz_bank", "bank_customers")\n\n\ndef isim_maskele(ad_soyad):\n    kelimeler = ad_soyad.split()\n    # TODO 1: her kelimeyi maskele ve birleştir\n    return ad_soyad\n\n\ndef maskeli_rapor(musteriler, sehir):\n    # TODO 2: şehir + izin yok koşuluyla süz, maskele, sırala\n    return []\n',
      sol: 'import veri\n\nmusteriler = veri.kayitlar("ilgaz_bank", "bank_customers")\n\n\ndef isim_maskele(ad_soyad):\n    kelimeler = ad_soyad.split()\n    return " ".join(k[0] + "*" * (len(k) - 1) for k in kelimeler)\n\n\ndef maskeli_rapor(musteriler, sehir):\n    return sorted((m["customer_id"], isim_maskele(m["full_name"]))\n                  for m in musteriler if m["city"] == sehir and m["kvkk_consent"] == 0)\n\n\nr = maskeli_rapor(musteriler, "Ankara")\nprint(len(r), r[:3])\n',
      tests: 'r = maskeli_rapor(musteriler, "Ankara")\nassert len(r) == 15, "Ankara\'da izni olmayan 15 müşteri olmalı; gelen " + str(len(r))\nassert r[:3] == [(2, "T**** Ş*****"), (5, "G**** Y*****"), (6, "S**** Y*******")], "İlk üç kayıt: " + str(r[:3])\nassert isim_maskele("İrem Çelik") == "İ*** Ç****", "İrem Çelik -> İ*** Ç****"\nassert isim_maskele("  Ali   Rıza  Kaya ") == "A** R*** K***", "Fazla boşluk tek boşluğa inmeli"\nassert all("*" in ad for _, ad in r), "Raporda maskelenmemiş ad olmamalı"\n',
      hints: ['Liste/üreteç ifadesi: <code>" ".join(k[0] + "*" * (len(k) - 1) for k in kelimeler)</code>.', 'Raporda demetleri <code>sorted</code> ile sıralamak ilk elemana (kimlik) göre sıralar.'],
      why: 'Maskeyi raporu üreten fonksiyonun içinde, kaynağa en yakın yerde uygulamak ham adın ileriki adımlara (dosya, e-posta, log) sızmasını engeller. İlk harfi bırakmak, operasyon ekibinin kaydı tanımasına yeter ama kimliği açık etmez.'
    },
    {
      t: 'code',
      id: 'pdf-word-otomasyon-5',
      stage: 'Kendin yaz',
      diff: 2,
      needs: ['jinja2'],
      q: '<p>Lezzet Kurye komisyon faturası metnini Jinja2 ile üret. <code>fatura_metni(no, restoran, brut, oran)</code> şu çıktıyı versin (para alanları Türkçe biçimde, iki basamak; <code>tr_para</code> hazır, Jinja2 filtresi olarak kaydet):</p><pre class="out">Fatura No: LK-2024-10-0001\nAlıcı: Köşe Dönercisi\nBrüt satış: 44.005,00 TL\nKomisyon (%15): 6.600,75 TL\nKDV (%20): 1.320,15 TL\nGenel Toplam: 7.920,90 TL</pre><p>Komisyon = brüt × oran / 100, KDV = komisyon × 0,20; ikisi de 2 basamağa yuvarlanır; genel toplam ikisinin toplamıdır. Oran tamsayı olarak yazılır.</p>',
      start: 'from jinja2 import Environment, StrictUndefined\n\ndef tr_para(x):\n    return f"{x:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")\n\n\ndef fatura_metni(no, restoran, brut, oran):\n    pass\n',
      sol: 'from jinja2 import Environment, StrictUndefined\n\ndef tr_para(x):\n    return f"{x:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")\n\nenv = Environment(undefined=StrictUndefined)\nenv.filters["tl"] = tr_para\nSABLON = env.from_string(\n    "Fatura No: {{ no }}\\n"\n    "Alıcı: {{ restoran }}\\n"\n    "Brüt satış: {{ brut|tl }} TL\\n"\n    "Komisyon (%{{ oran }}): {{ komisyon|tl }} TL\\n"\n    "KDV (%20): {{ kdv|tl }} TL\\n"\n    "Genel Toplam: {{ (komisyon + kdv)|tl }} TL"\n)\n\n\ndef fatura_metni(no, restoran, brut, oran):\n    komisyon = round(brut * oran / 100, 2)\n    kdv = round(komisyon * 0.20, 2)\n    return SABLON.render(no=no, restoran=restoran, brut=brut, oran=int(oran), komisyon=komisyon, kdv=kdv)\n\n\nprint(fatura_metni("LK-2024-10-0001", "Köşe Dönercisi", 44005.0, 15.0))\n',
      tests: 'beklenen = "Fatura No: LK-2024-10-0001\\nAlıcı: Köşe Dönercisi\\nBrüt satış: 44.005,00 TL\\nKomisyon (%15): 6.600,75 TL\\nKDV (%20): 1.320,15 TL\\nGenel Toplam: 7.920,90 TL"\nr = fatura_metni("LK-2024-10-0001", "Köşe Dönercisi", 44005.0, 15.0)\nassert r.strip() == beklenen, "Çıktı birebir tutmuyor:\\n" + r\nr2 = fatura_metni("LK-2024-10-0002", "Usta Döner", 48695.0, 22.0)\nassert "Komisyon (%22): 10.712,90 TL" in r2 and "Genel Toplam: 12.855,48 TL" in r2, "Usta Döner faturası tutmuyor:\\n" + r2\nassert "jinja2" in __source__ and "filters" in __source__, "Jinja2 şablonu ve tl filtresi kullanılmalı"\n',
      hints: ['<code>env.filters["tl"] = tr_para</code> ile filtreyi kaydet, şablonda <code>{{ brut|tl }}</code> yaz.', 'Komisyon ve KDV\'yi Python\'da hesaplayıp yuvarla, şablona hazır değer gönder.', 'Oranı <code>int(oran)</code> olarak gönder ki \'%15.0\' yazmasın.'],
      why: 'Hesabı Python\'da, biçimi şablonda tutmak iki sorumluluğu ayırır: tasarımcı şablonu değiştirebilir, muhasebe kuralları kodda test edilir. Aynı şablonu HTML\'e çevirip WeasyPrint ile PDF fatura üretebilirsin.'
    },
    {
      t: 'code',
      id: 'pdf-word-otomasyon-6',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>pypdf ile bölme yaparken kullanıcı sayfaları <code>"1-3,5,8-9"</code> gibi yazar. <code>sayfa_araligi(ifade, toplam)</code>: 1 tabanlı ifadeyi 0 tabanlı, <b>sıralı ve tekrarsız</b> indeks listesine çevirsin. Boşluklara izin ver. Sayfa numarası 1\'den küçük ya da <code>toplam</code>\'dan büyükse veya aralık ters yazılmışsa (<code>"5-3"</code>) <code>ValueError</code> fırlatsın.</p>',
      start: 'def sayfa_araligi(ifade, toplam):\n    pass\n',
      sol: 'def sayfa_araligi(ifade, toplam):\n    sayfalar = set()\n    for parca in ifade.replace(" ", "").split(","):\n        if not parca:\n            continue\n        bas, _, son = parca.partition("-")\n        a, b = int(bas), int(son or bas)\n        if a > b or a < 1 or b > toplam:\n            raise ValueError(f"geçersiz aralık: {parca}")\n        sayfalar.update(range(a - 1, b))\n    return sorted(sayfalar)\n\n\nprint(sayfa_araligi("1-3, 5, 8-9", 10))\n',
      tests: 'assert sayfa_araligi("1-3,5,8-9", 10) == [0, 1, 2, 4, 7, 8], "1-3,5,8-9 -> [0,1,2,4,7,8]"\nassert sayfa_araligi(" 2 , 1-2 ", 5) == [0, 1], "Boşluklar yok sayılmalı, tekrarlar tekilleşmeli, sonuç sıralı olmalı"\nassert sayfa_araligi("4", 4) == [3], "Tek sayfa ve son sayfa"\nfor kotu in ("0-2", "3-11", "5-3"):\n    try:\n        sayfa_araligi(kotu, 10)\n        assert False, kotu + " için ValueError bekleniyordu"\n    except ValueError:\n        pass\n',
      hints: ['Virgülle böl, her parçayı <code>partition("-")</code> ile başlangıç ve bitişe ayır; tire yoksa bitiş = başlangıç.', 'Bir kümede topla: <code>update(range(a - 1, b))</code>, sonda <code>sorted</code>.'],
      why: 'Kullanıcı girdisini erken ve yüksek sesle doğrulamak, yanlış sayfaların sessizce başka bir müşteriye gönderilmesini önler. Bu fonksiyonun çıktısı doğrudan <code>for i in indeksler: yazici.add_page(okuyucu.pages[i])</code> döngüsüne verilir.'
    },
    {
      t: 'code',
      id: 'pdf-word-otomasyon-7',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Başlangıç kodu Lezzet Kurye\'nin 2 numaralı siparişinin fişini (<code>lk_order_lines</code> + <code>lk_menu_items</code>) pdfplumber\'ın tablo metni gibi yazıyor: sütunlar <b>en az iki boşlukla</b> ayrılmış. <code>fis_tablosu(metin)</code>: başlık satırını sütun adı yap ve <code>Ürün</code>, <code>Adet</code>, <code>Birim</code>, <code>Tutar</code> sütunlarından sözlük listesi üretsin (Adet int, Birim ve Tutar float). Yalnız sütun sayısı başlıkla aynı olan satırları al. Sonra <code>fis_tutarli_mi(satirlar, toplam)</code>: her satırda adet × birim = tutar ve tutarlar toplamı = toplam ise <code>True</code>.</p>',
      start: 'import re\nimport veri\n\nmenu = {m["item_id"]: m["name"] for m in veri.kayitlar("lezzet_kurye", "lk_menu_items")}\nkalemler = [s for s in veri.kayitlar("lezzet_kurye", "lk_order_lines") if s["order_id"] == 2]\n\ndef tr_para(x):\n    return f"{x:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")\n\nsatirlar = ["LEZZET KURYE SİPARİŞ FİŞİ   No: 2", "Ürün                  Adet   Birim     Tutar"]\nfor k in kalemler:\n    satirlar.append(f"{menu[k[\'item_id\']]:<22}{k[\'qty\']:<7}{tr_para(k[\'unit_price\']):<10}{tr_para(k[\'qty\'] * k[\'unit_price\'])}")\nsatirlar.append("TOPLAM  " + tr_para(sum(k["qty"] * k["unit_price"] for k in kalemler)))\nfis = "\\n".join(satirlar)\n\n\ndef fis_tablosu(metin):\n    pass\n\n\ndef fis_tutarli_mi(satirlar, toplam):\n    pass\n',
      sol: 'import re\nimport veri\n\nmenu = {m["item_id"]: m["name"] for m in veri.kayitlar("lezzet_kurye", "lk_menu_items")}\nkalemler = [s for s in veri.kayitlar("lezzet_kurye", "lk_order_lines") if s["order_id"] == 2]\n\ndef tr_para(x):\n    return f"{x:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")\n\nsatirlar = ["LEZZET KURYE SİPARİŞ FİŞİ   No: 2", "Ürün                  Adet   Birim     Tutar"]\nfor k in kalemler:\n    satirlar.append(f"{menu[k[\'item_id\']]:<22}{k[\'qty\']:<7}{tr_para(k[\'unit_price\']):<10}{tr_para(k[\'qty\'] * k[\'unit_price\'])}")\nsatirlar.append("TOPLAM  " + tr_para(sum(k["qty"] * k["unit_price"] for k in kalemler)))\nfis = "\\n".join(satirlar)\n\n\ndef tr_sayi(s):\n    return float(s.replace(".", "").replace(",", "."))\n\n\ndef fis_tablosu(metin):\n    satirlar = [re.split(r"\\s{2,}", s.strip()) for s in metin.splitlines() if s.strip()]\n    bas_i = next(i for i, s in enumerate(satirlar) if s[0] == "Ürün")\n    basliklar = satirlar[bas_i]\n    sonuc = []\n    for s in satirlar[bas_i + 1:]:\n        if len(s) != len(basliklar):\n            continue\n        d = dict(zip(basliklar, s))\n        sonuc.append({"Ürün": d["Ürün"], "Adet": int(d["Adet"]), "Birim": tr_sayi(d["Birim"]), "Tutar": tr_sayi(d["Tutar"])})\n    return sonuc\n\n\ndef fis_tutarli_mi(satirlar, toplam):\n    return (all(abs(s["Adet"] * s["Birim"] - s["Tutar"]) < 0.005 for s in satirlar)\n            and abs(sum(s["Tutar"] for s in satirlar) - toplam) < 0.005)\n\n\nprint(fis)\nt = fis_tablosu(fis)\nprint(t, fis_tutarli_mi(t, 730.0))\n',
      tests: 't = fis_tablosu(fis)\nassert t == [{"Ürün": "Tavuk Döner Dürüm", "Adet": 3, "Birim": 140.0, "Tutar": 420.0},\n             {"Ürün": "Patates Kızartması", "Adet": 1, "Birim": 65.0, "Tutar": 65.0},\n             {"Ürün": "Et Döner Porsiyon", "Adet": 1, "Birim": 245.0, "Tutar": 245.0}], "Fiş satırları tutmuyor: " + str(t)\nassert fis_tutarli_mi(t, 730.0) is True, "Sipariş 2 tutarlı: toplam 730,00"\nassert fis_tutarli_mi(t, 735.0) is False, "Toplam farklıysa False"\nbozuk = [dict(t[0], Tutar=400.0)] + t[1:]\nassert fis_tutarli_mi(bozuk, 710.0) is False, "Satırda adet x birim tutmuyorsa False (toplam tutsa bile)"\n',
      hints: ['<code>re.split(r"\\s{2,}", satir.strip())</code> tek boşlukları (ürün adındaki) korur, iki ve fazlasında böler.', 'Başlık satırını <code>Ürün</code> ile başlamasından bul; sütun sayısı farklı satırları (başlık üstü, TOPLAM) atla.', 'Kayan nokta karşılaştırmasını küçük bir toleransla yap.'],
      why: 'pdfplumber\'ın extract_text çıktısında tablo sütunları boşluklarla hizalanır; \'iki veya daha fazla boşluk\' ayırıcısı pratikte çok işe yarar. Satır içi ve toplam tutarlılık kontrolü, OCR ya da ayıklama hatasını yakalamanın en ucuz yoludur.'
    },
    {
      t: 'code',
      id: 'pdf-word-otomasyon-8',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Toplu işlem. Başlangıç kodu geçici bir klasöre 5 fatura metni yazıyor; ikisi sorunlu. <code>klasor_ozet(klasor)</code>: klasördeki <code>*.txt</code> dosyalarını <b>ad sırasıyla</b> oku; her birinden <code>Fatura No</code> ve <code>Genel Toplam</code>\'ı ayıkla. Başarılı olanları <code>(no, toplam)</code> listesine, başarısız olanları <code>(dosya_adi, sebep)</code> listesine ekle. Sebep, alan yoksa <code>"alan yok"</code>, sayı çevrilemiyorsa <code>"sayı hatalı"</code>. Dönüş: <code>(ozet, hatalar)</code>. Hiçbir dosya işi durdurmamalı.</p>',
      start: 'import re\nimport tempfile\nfrom pathlib import Path\n\nklasor = Path(tempfile.mkdtemp())\nornek = "Fatura No: {no}\\nAra Toplam: 1.000,00 TL\\nGenel Toplam: {toplam} TL\\n"\n(klasor / "a.txt").write_text(ornek.format(no="LK-1", toplam="7.920,90"), encoding="utf-8")\n(klasor / "b.txt").write_text(ornek.format(no="LK-2", toplam="12.855,48"), encoding="utf-8")\n(klasor / "c.txt").write_text("Fatura No: LK-3\\nTutar okunamadı\\n", encoding="utf-8")\n(klasor / "d.txt").write_text(ornek.format(no="LK-4", toplam="1.2O0,00"), encoding="utf-8")\n(klasor / "e.txt").write_text(ornek.format(no="LK-5", toplam="980,25"), encoding="utf-8")\n(klasor / "not.md").write_text("bu dosya fatura değil", encoding="utf-8")\n\n\ndef klasor_ozet(klasor):\n    pass\n',
      sol: 'import re\nimport tempfile\nfrom pathlib import Path\n\nklasor = Path(tempfile.mkdtemp())\nornek = "Fatura No: {no}\\nAra Toplam: 1.000,00 TL\\nGenel Toplam: {toplam} TL\\n"\n(klasor / "a.txt").write_text(ornek.format(no="LK-1", toplam="7.920,90"), encoding="utf-8")\n(klasor / "b.txt").write_text(ornek.format(no="LK-2", toplam="12.855,48"), encoding="utf-8")\n(klasor / "c.txt").write_text("Fatura No: LK-3\\nTutar okunamadı\\n", encoding="utf-8")\n(klasor / "d.txt").write_text(ornek.format(no="LK-4", toplam="1.2O0,00"), encoding="utf-8")\n(klasor / "e.txt").write_text(ornek.format(no="LK-5", toplam="980,25"), encoding="utf-8")\n(klasor / "not.md").write_text("bu dosya fatura değil", encoding="utf-8")\n\n\ndef klasor_ozet(klasor):\n    ozet, hatalar = [], []\n    for yol in sorted(Path(klasor).glob("*.txt")):\n        metin = yol.read_text(encoding="utf-8")\n        m_no = re.search(r"^Fatura No:\\s*(\\S+)", metin, re.M)\n        m_top = re.search(r"^Genel Toplam:\\s*(\\S+)", metin, re.M)\n        if not (m_no and m_top):\n            hatalar.append((yol.name, "alan yok"))\n            continue\n        try:\n            toplam = float(m_top.group(1).replace(".", "").replace(",", "."))\n        except ValueError:\n            hatalar.append((yol.name, "sayı hatalı"))\n            continue\n        ozet.append((m_no.group(1), toplam))\n    return ozet, hatalar\n\n\nprint(klasor_ozet(klasor))\n',
      tests: 'ozet, hatalar = klasor_ozet(klasor)\nassert ozet == [("LK-1", 7920.9), ("LK-2", 12855.48), ("LK-5", 980.25)], "Başarılı faturalar: " + str(ozet)\nassert hatalar == [("c.txt", "alan yok"), ("d.txt", "sayı hatalı")], "Hata listesi: " + str(hatalar)\nassert klasor_ozet(tempfile.mkdtemp()) == ([], []), "Boş klasörde iki boş liste"\n',
      hints: ['<code>sorted(Path(klasor).glob("*.txt"))</code> yalnız .txt dosyalarını ad sırasıyla verir.', 'Önce iki eşleşmeyi kontrol et (None ise \'alan yok\'), sonra çevirmeyi <code>try/except ValueError</code> içine al.', 'Toplam kalıbında <code>(\\S+)</code> kullan ki OCR hatalı değer (\'1.2O0,00\') de yakalansın ve çevirmede hata versin.'],
      why: 'OCR\'nin \'0\' yerine \'O\' okuması gibi bozukluklar gerçek hayatta sık görülür. Toplu işte her dosyayı yalıtmak, iki bozuk dosya yüzünden 198 sağlam dosyanın işlenmemesini önler; hata listesi de insan incelemesine gider.'
    },
    {
      t: 'code',
      id: 'pdf-word-otomasyon-9',
      stage: 'Hata avı',
      diff: 2,
      kind: 'bug',
      q: '<p>Anadolu Market\'in bayilerden gelen PDF raporlarından çıkarılan tutarlar (<code>veri.kayitlar("kirli_veri", "bayi", cevir=False)</code>, <code>Column4</code> sütunu) toplanıyor. Rapor 2.631,68 TL diyor ama bayiler çok daha fazla satış bildirdi. <b>Hatayı bul ve düzelt</b>: <code>tr_sayi</code> Türkçe biçimi (<code>1.250,50</code>, <code>1.430</code>, <code>760,25</code>) doğru çevirsin, sayı olmayan hücrelerde (<code>-</code>, boş, başlık) <code>None</code> döndürsün; <code>bayi_toplam</code> doğru toplamı versin.</p>',
      start: 'import veri\n\nbayi = veri.kayitlar("kirli_veri", "bayi", cevir=False)\n\n\ndef tr_sayi(s):\n    try:\n        return float(s.replace(",", "."))\n    except ValueError:\n        return None\n\n\ndef bayi_toplam(kayitlar):\n    return round(sum(v for k in kayitlar if (v := tr_sayi(k["Column4"])) is not None), 2)\n\n\nprint(bayi_toplam(bayi))\n',
      sol: 'import veri\n\nbayi = veri.kayitlar("kirli_veri", "bayi", cevir=False)\n\n\ndef tr_sayi(s):\n    try:\n        return float(s.strip().replace(".", "").replace(",", "."))\n    except ValueError:\n        return None\n\n\ndef bayi_toplam(kayitlar):\n    return round(sum(v for k in kayitlar if (v := tr_sayi(k["Column4"])) is not None), 2)\n\n\nprint(bayi_toplam(bayi))\n',
      tests: 'assert tr_sayi("1.250,50") == 1250.5, "1.250,50 -> 1250.5"\nassert tr_sayi("1.430") == 1430.0, "1.430 binlik noktalı tamsayıdır: 1430.0 (1.43 değil)"\nassert tr_sayi("760,25") == 760.25 and tr_sayi("980") == 980.0, "Virgüllü ve düz tamsayı"\nassert tr_sayi("-") is None and tr_sayi("") is None and tr_sayi("Tutar") is None, "Sayı olmayan hücre None"\nassert bayi_toplam(bayi) == 9717.0, "Bayi toplamı 9717.0 olmalı; gelen " + str(bayi_toplam(bayi))\n',
      hints: ['\'1.250,50\' nokta→virgül değişiminden sonra ne oluyor? \'1.430\' ne oluyor?', 'Önce binlik noktaları sil, sonra virgülü noktaya çevir.'],
      why: 'Hatalı çevirme iki yoldan zarar veriyordu: \'1.250,50\' ValueError verip sessizce atlanıyor, \'1.430\' ise 1,43 olarak toplama giriyordu. Sessiz hata en tehlikelisidir; çevrilemeyen hücre sayısını da raporlamak (burada 4: başlık, başlık satırı, boş satır, \'-\') iyi bir alışkanlıktır. Not: veride Merkez Bayi satırı iki kez var; tekilleştirme ayrı bir karardır.'
    },
    {
      t: 'code',
      id: 'pdf-word-otomasyon-10',
      stage: 'Hata avı',
      diff: 2,
      kind: 'bug',
      q: '<p>Komisyon faturalarının toplamını muhasebeye aktaran betik, Ekim ayında tutarları olması gerekenden düşük aktardı. <code>fatura_toplam(metin)</code> Genel Toplam\'ı döndürmeli. <b>Hatayı bul ve düzelt.</b></p>',
      start: 'import re\n\nfatura = """LEZZET KURYE TEKNOLOJİ A.Ş.\nKOMİSYON FATURASI\nFatura No: LK-2024-10-0001\nFatura Tarihi: 31.10.2024\nAlıcı: Köşe Dönercisi\nVKN: 4810527396\nBrüt satış: 44.005,00 TL\nKomisyon oranı: %15\nAra Toplam: 6.600,75 TL\nKDV (%20): 1.320,15 TL\nGenel Toplam: 7.920,90 TL\n"""\n\n\ndef fatura_toplam(metin):\n    m = re.search(r"Toplam:\\s*([\\d.,]+)", metin)\n    return float(m.group(1).replace(".", "").replace(",", "."))\n\n\nprint(fatura_toplam(fatura))\n',
      sol: 'import re\n\nfatura = """LEZZET KURYE TEKNOLOJİ A.Ş.\nKOMİSYON FATURASI\nFatura No: LK-2024-10-0001\nFatura Tarihi: 31.10.2024\nAlıcı: Köşe Dönercisi\nVKN: 4810527396\nBrüt satış: 44.005,00 TL\nKomisyon oranı: %15\nAra Toplam: 6.600,75 TL\nKDV (%20): 1.320,15 TL\nGenel Toplam: 7.920,90 TL\n"""\n\n\ndef fatura_toplam(metin):\n    m = re.search(r"^Genel Toplam:\\s*([\\d.,]+)", metin, re.M)\n    return float(m.group(1).replace(".", "").replace(",", "."))\n\n\nprint(fatura_toplam(fatura))\n',
      tests: 'assert fatura_toplam(fatura) == 7920.9, "Genel Toplam 7920.9 olmalı (Ara Toplam 6600.75 değil); gelen " + str(fatura_toplam(fatura))\nf2 = "Genel Toplam: 100,00 TL\\nNot: Ara Toplam: 5,00"\nassert fatura_toplam(f2) == 100.0, "Etiket tam yazılmalı"\nf3 = "Açıklama: Genel Toplam: 1,00 dipnotu\\nGenel Toplam: 250,00 TL"\nassert fatura_toplam(f3) == 250.0, "Satır başına çapalanmalı (re.M ile ^)"\n',
      hints: ['re.search ilk eşleşmeyi döndürür. Metinde \'Toplam:\' kaç kez geçiyor?', 'Etiketi tam yaz ve satır başına çapala: <code>r"^Genel Toplam:..."</code> + <code>re.M</code>.'],
      why: 'Gevşek kalıp \'Ara Toplam: 6.600,75\' satırını yakaladı; KDV muhasebeye hiç aktarılmadı. Etiketi tam yazmak ve ^ ile satır başına çapalamak, aynı kelimeyi içeren başka satırların (dipnot, ara toplam) eşleşmesini engeller.'
    },
    {
      t: 'code',
      id: 'pdf-word-otomasyon-11',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Başvuru belgelerinde 11 haneli sayılar hem T.C. kimlik numarası hem de sipariş/poliçe numarası olabilir; yalnız <b>geçerli</b> kimlik numaraları maskelenmeli. </p><p><code>tckn_gecerli(s)</code>: 11 haneli rakam dizisi, ilk hane 0 değil, ve sağlama kuralları: <code>d10 = ((d1+d3+d5+d7+d9)*7 - (d2+d4+d6+d8)) % 10</code>, <code>d11 = (d1+...+d10) % 10</code>.</p><p><code>kimlik_maskele(metin)</code>: kelime sınırındaki her 11 haneli sayıdan geçerli olanların ilk 3 ve son 2 hanesi kalsın, aradaki 6 hane <code>*</code> olsun (<code>100*******46</code> değil, <code>100******46</code>). Geçersiz olanlara dokunma. Dönüş: <code>(maskeli_metin, maskelenen_adet)</code>.</p>',
      start: 'import re\n\n\ndef tckn_gecerli(s):\n    pass\n\n\ndef kimlik_maskele(metin):\n    pass\n',
      sol: 'import re\n\n\ndef tckn_gecerli(s):\n    if len(s) != 11 or not s.isdigit() or s[0] == "0":\n        return False\n    d = [int(c) for c in s]\n    d10 = ((d[0] + d[2] + d[4] + d[6] + d[8]) * 7 - (d[1] + d[3] + d[5] + d[7])) % 10\n    return d[9] == d10 and d[10] == sum(d[:10]) % 10\n\n\ndef kimlik_maskele(metin):\n    adet = 0\n\n    def degistir(m):\n        nonlocal adet\n        s = m.group(0)\n        if not tckn_gecerli(s):\n            return s\n        adet += 1\n        return s[:3] + "*" * 6 + s[-2:]\n\n    return re.sub(r"\\b\\d{11}\\b", degistir, metin), adet\n\n\nprint(kimlik_maskele("Başvuran TCKN 10000000146, sipariş 20240100001, eş TCKN 12345678950"))\n',
      tests: 'assert tckn_gecerli("10000000146") is True, "10000000146 geçerli bir örnek numaradır"\nassert tckn_gecerli("10000000147") is False, "Son hane yanlış"\nassert tckn_gecerli("01234567890") is False, "İlk hane 0 olamaz"\nassert tckn_gecerli("1234567895") is False, "10 hane geçersiz"\nassert tckn_gecerli("12345678950") is True, "12345678950 sağlamayı geçer"\nm, n = kimlik_maskele("Başvuran TCKN 10000000146, sipariş 20240100001, eş TCKN 12345678950")\nassert m == "Başvuran TCKN 100******46, sipariş 20240100001, eş TCKN 123******50", "Maskeli metin: " + m\nassert n == 2, "2 kimlik maskelenmeli"\nassert kimlik_maskele("IBAN TR330006100519786457841326")[1] == 0, "Daha uzun rakam dizisinin içindeki 11 hane kimlik sayılmamalı"\n',
      hints: ['Rakamları listeye çevir: <code>d = [int(c) for c in s]</code>; d1 = d[0].', '<code>re.sub</code>\'a fonksiyon ver; fonksiyon geçersizde eşleşmeyi aynen döndürsün.', 'Sayaç için iç fonksiyonda <code>nonlocal</code> ya da bir liste kullan; <code>\\b\\d{11}\\b</code> uzun sayıların parçasını yakalamaz.'],
      why: 'Kör bir <code>\\d{11}</code> maskesi sipariş ve poliçe numaralarını da bozar, belgeyi işe yaramaz hâle getirir. Sağlama algoritmasıyla doğrulamak yanlış pozitifleri büyük ölçüde azaltır. re.sub\'a fonksiyon vermek, eşleşme başına karar gerektiren her maskeleme işinin kalıbıdır.'
    },
    {
      t: 'code',
      id: 'pdf-word-otomasyon-12',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>OCR\'den gelen fatura metinlerinde tutarlılık denetimi. <code>fatura_denetle(metin)</code> şu alanları ayıklasın: <code>Ara Toplam</code>, <code>KDV (%NN)</code> (oran ve tutar), <code>Genel Toplam</code>. Para alanlarında OCR\'nin sık yaptığı hataları <b>yalnız sayı içinde</b> düzelt: <code>O</code>/<code>o</code> → <code>0</code>, <code>l</code>/<code>I</code> → <code>1</code>, <code>S</code> → <code>5</code>. Sonra şu sorunları sırayla kontrol edip liste döndür (sorun yoksa boş liste):</p><ul><li>bir alan bulunamazsa <code>"eksik:ALAN"</code> (ALAN: <code>ara</code>, <code>kdv</code>, <code>genel</code>) ve başka kontrol yapma,</li><li><code>round(ara * oran / 100, 2)</code> KDV tutarından farklıysa <code>"kdv"</code>,</li><li><code>round(ara + kdv, 2)</code> genel toplamdan farklıysa <code>"toplam"</code>.</li></ul>',
      start: 'import re\n\nfatura = """LEZZET KURYE TEKNOLOJİ A.Ş.\nKOMİSYON FATURASI\nFatura No: LK-2024-10-0001\nFatura Tarihi: 31.10.2024\nAlıcı: Köşe Dönercisi\nVKN: 4810527396\nBrüt satış: 44.005,00 TL\nKomisyon oranı: %15\nAra Toplam: 6.600,75 TL\nKDV (%20): 1.320,15 TL\nGenel Toplam: 7.920,90 TL\n"""\n\n\ndef fatura_denetle(metin):\n    pass\n',
      sol: 'import re\n\nfatura = """LEZZET KURYE TEKNOLOJİ A.Ş.\nKOMİSYON FATURASI\nFatura No: LK-2024-10-0001\nFatura Tarihi: 31.10.2024\nAlıcı: Köşe Dönercisi\nVKN: 4810527396\nBrüt satış: 44.005,00 TL\nKomisyon oranı: %15\nAra Toplam: 6.600,75 TL\nKDV (%20): 1.320,15 TL\nGenel Toplam: 7.920,90 TL\n"""\n\nOCR = str.maketrans({"O": "0", "o": "0", "l": "1", "I": "1", "S": "5"})\n\n\ndef para(ham):\n    return float(ham.translate(OCR).replace(".", "").replace(",", "."))\n\n\ndef fatura_denetle(metin):\n    kaliplar = {\n        "ara": r"^Ara Toplam:\\s*([\\dOolIS.,]+)",\n        "kdv": r"^KDV \\(%(\\d+)\\):\\s*([\\dOolIS.,]+)",\n        "genel": r"^Genel Toplam:\\s*([\\dOolIS.,]+)",\n    }\n    m = {k: re.search(v, metin, re.M) for k, v in kaliplar.items()}\n    eksik = ["eksik:" + k for k in ("ara", "kdv", "genel") if m[k] is None]\n    if eksik:\n        return eksik\n    ara = para(m["ara"].group(1))\n    oran, kdv = int(m["kdv"].group(1)), para(m["kdv"].group(2))\n    genel = para(m["genel"].group(1))\n    sorunlar = []\n    if round(ara * oran / 100, 2) != kdv:\n        sorunlar.append("kdv")\n    if round(ara + kdv, 2) != genel:\n        sorunlar.append("toplam")\n    return sorunlar\n\n\nprint(fatura_denetle(fatura))\n',
      tests: 'assert fatura_denetle(fatura) == [], "Örnek fatura tutarlı; gelen " + str(fatura_denetle(fatura))\nocr = fatura.replace("6.600,75", "6.6OO,7S").replace("1.320,15", "l.320,l5")\nassert fatura_denetle(ocr) == [], "OCR karakter hataları sayı içinde düzeltilmeli; gelen " + str(fatura_denetle(ocr))\nassert fatura_denetle(fatura.replace("KDV (%20): 1.320,15", "KDV (%20): 1.230,15")) == ["kdv", "toplam"], "KDV yanlışsa toplam da tutmaz"\nassert fatura_denetle(fatura.replace("7.920,90", "7.902,90")) == ["toplam"], "Yalnız genel toplam yanlış"\nassert fatura_denetle("Ara Toplam: 10,00\\nGenel Toplam: 12,00") == ["eksik:kdv"], "KDV satırı yok"\nassert fatura_denetle("") == ["eksik:ara", "eksik:kdv", "eksik:genel"], "Boş metinde üç alan da eksik"\n',
      hints: ['Karakter sınıfına OCR karakterlerini ekle: <code>[\\dOolIS.,]+</code>; çevirmeyi <code>str.maketrans</code> + <code>translate</code> ile yalnız yakalanan grupta yap.', 'Önce eşleşmeleri bir sözlükte topla, eksikleri sırayla listele ve varsa hemen döndür.', 'Para karşılaştırmasında iki tarafı da 2 basamağa yuvarla.'],
      why: 'OCR düzeltmesini bütün metne uygulamak \'Alıcı\' gibi kelimeleri bozardı; yalnız para alanının içinde yapmak güvenlidir. Aritmetik tutarlılık, ayıklamanın doğruluğunu belgenin kendisiyle kanıtlar: kontrolden geçmeyen fatura otomatik muhasebeleşmez, insan onayına gider.'
    },
    {
      t: 'code',
      id: 'pdf-word-otomasyon-13',
      stage: 'Mini proje',
      diff: 3,
      q: '<p><b>Lezzet Kurye Ekim 2024 komisyon fatura hattı.</b> Uçtan uca belge otomasyonu kur:</p><ol><li><code>brut_satislar(siparisler, satirlar)</code>: <code>placed_at</code>\'i <code>2024-10</code> ile başlayan ve <code>status == "teslim"</code> olan siparişlerin satırlarından (<code>qty * unit_price</code>) restoran başına brüt satış sözlüğü <code>{restaurant_id: tutar}</code>.</li><li><code>fatura_uret(restoran, brut, sira)</code>: <code>FATURA_SABLON</code> (string.Template) ile metin üretsin. Fatura no <code>LK-2024-10-</code> + 4 haneli sıra (<code>0001</code>); komisyon = round(brüt × <code>commission_pct</code> / 100, 2), KDV = round(komisyon × 0,20, 2), genel = komisyon + KDV; para alanları <code>tr_para</code> ile.</li><li><code>geri_oku(metin)</code>: üretilen metinden <code>(no, genel_toplam)</code> ayıklasın (round-trip testi).</li><li><code>ozet(restoranlar, brutler)</code>: restoranları kimlik sırasıyla gezip fatura üret, geri oku ve <code>(fatura_sayisi, toplam_genel)</code> döndürsün (toplam 2 basamak).</li></ol>',
      start: 'import re\nfrom string import Template\nimport veri\n\nsiparisler = veri.kayitlar("lezzet_kurye", "lk_orders")\nsatirlar = veri.kayitlar("lezzet_kurye", "lk_order_lines")\nrestoranlar = veri.kayitlar("lezzet_kurye", "lk_restaurants")\n\ndef tr_para(x):\n    return f"{x:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")\n\nFATURA_SABLON = Template("""KOMİSYON FATURASI\nFatura No: $no\nAlıcı: $alici\nBrüt satış: $brut TL\nKomisyon oranı: %$oran\nAra Toplam: $komisyon TL\nKDV (%20): $kdv TL\nGenel Toplam: $genel TL""")\n\n\ndef brut_satislar(siparisler, satirlar):\n    pass\n\n\ndef fatura_uret(restoran, brut, sira):\n    pass\n\n\ndef geri_oku(metin):\n    pass\n\n\ndef ozet(restoranlar, brutler):\n    pass\n',
      sol: 'import re\nfrom string import Template\nimport veri\n\nsiparisler = veri.kayitlar("lezzet_kurye", "lk_orders")\nsatirlar = veri.kayitlar("lezzet_kurye", "lk_order_lines")\nrestoranlar = veri.kayitlar("lezzet_kurye", "lk_restaurants")\n\ndef tr_para(x):\n    return f"{x:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")\n\nFATURA_SABLON = Template("""KOMİSYON FATURASI\nFatura No: $no\nAlıcı: $alici\nBrüt satış: $brut TL\nKomisyon oranı: %$oran\nAra Toplam: $komisyon TL\nKDV (%20): $kdv TL\nGenel Toplam: $genel TL""")\n\n\ndef brut_satislar(siparisler, satirlar):\n    gecerli = {s["order_id"]: s["restaurant_id"] for s in siparisler\n               if s["placed_at"].startswith("2024-10") and s["status"] == "teslim"}\n    brut = {}\n    for s in satirlar:\n        r = gecerli.get(s["order_id"])\n        if r is not None:\n            brut[r] = brut.get(r, 0) + s["qty"] * s["unit_price"]\n    return brut\n\n\ndef fatura_uret(restoran, brut, sira):\n    komisyon = round(brut * restoran["commission_pct"] / 100, 2)\n    kdv = round(komisyon * 0.20, 2)\n    return FATURA_SABLON.substitute(\n        no=f"LK-2024-10-{sira:04d}", alici=restoran["name"], brut=tr_para(brut),\n        oran=int(restoran["commission_pct"]), komisyon=tr_para(komisyon),\n        kdv=tr_para(kdv), genel=tr_para(komisyon + kdv))\n\n\ndef geri_oku(metin):\n    no = re.search(r"^Fatura No:\\s*(\\S+)", metin, re.M).group(1)\n    genel = re.search(r"^Genel Toplam:\\s*([\\d.,]+)", metin, re.M).group(1)\n    return no, float(genel.replace(".", "").replace(",", "."))\n\n\ndef ozet(restoranlar, brutler):\n    adet, toplam = 0, 0.0\n    for sira, r in enumerate(sorted(restoranlar, key=lambda x: x["restaurant_id"]), 1):\n        if r["restaurant_id"] not in brutler:\n            continue\n        _, genel = geri_oku(fatura_uret(r, brutler[r["restaurant_id"]], sira))\n        adet += 1\n        toplam += genel\n    return adet, round(toplam, 2)\n\n\nb = brut_satislar(siparisler, satirlar)\nprint(fatura_uret(restoranlar[0], b[1], 1))\nprint(ozet(restoranlar, b))\n',
      tests: 'b = brut_satislar(siparisler, satirlar)\nassert len(b) == 30 and b[1] == 44005.0 and b[2] == 48695.0, "Brüt satışlar: 30 restoran, b[1]=44005.0, b[2]=48695.0"\nf = fatura_uret(restoranlar[0], b[1], 1)\nassert "Fatura No: LK-2024-10-0001" in f and "Ara Toplam: 6.600,75 TL" in f and "Genel Toplam: 7.920,90 TL" in f, "Köşe Dönercisi faturası tutmuyor:\\n" + f\nassert "%15\\n" in f, "Oran tamsayı yazılmalı (%15)"\nassert geri_oku(f) == ("LK-2024-10-0001", 7920.9), "Round-trip: üretilen metinden aynı değerler okunmalı"\nassert ozet(restoranlar, b) == (30, 201585.66), "Ekim toplamı (30, 201585.66) olmalı; gelen " + str(ozet(restoranlar, b))\nassert ozet(restoranlar, {1: 1000.0}) == (1, 180.0), "Yalnız brütü olan restorana fatura kesilmeli"\n',
      hints: ['Önce geçerli siparişleri <code>{order_id: restaurant_id}</code> sözlüğüne al, sonra satırları tek geçişte topla.', 'Sıra numarası: <code>f"LK-2024-10-{sira:04d}"</code>; eksik alan hata versin diye <code>substitute</code> kullan.', 'Round-trip: ürettiğin metni kendi ayıklayıcınla oku ve toplamları bunlardan hesapla.'],
      why: 'Üretilen belgeyi kendi ayrıştırıcınla geri okumak (round-trip), şablon ile ayıklayıcının birbirine uyduğunu kanıtlar: biri değişip diğeri değişmezse test hemen kırılır. Gerçek hatta her metin WeasyPrint ile PDF\'e çevrilir, <code>arsiv/2024-10/</code> klasörüne yazılır ve özet bir Excel\'e dökülür.'
    }
  ],
  faq: [
    {
      q: 'pypdf mi, pdfplumber mı, PyMuPDF mi?',
      a: 'pypdf saf Python\'dur; birleştirme, bölme, döndürme, şifre ve form işlerinde yeterlidir. pdfplumber metni koordinatlarıyla okur, tablo çıkarmada en rahatıdır. PyMuPDF (fitz) çok hızlıdır ve görüntü çıkarma, sayfayı resme çevirme gibi işlerde güçlüdür ama lisansı (AGPL) ticari projelerde dikkat ister.'
    },
    {
      q: 'Word belgesini PDF\'e nasıl çeviririm?',
      a: 'python-docx dönüştürme yapmaz. Windows\'ta Word kuruluysa docx2pdf paketi, sunucuda LibreOffice\'in komut satırı (<code>soffice --headless --convert-to pdf</code>) kullanılır. Baştan PDF hedefliyorsan Jinja2 + HTML + WeasyPrint daha taşınabilir bir yoldur.'
    },
    {
      q: 'Tablo çıkarma hiç düzgün çalışmıyor, ne yapmalıyım?',
      a: 'pdfplumber\'da <code>table_settings</code> ile çizgi ya da metin hizasına göre strateji seç ve <code>page.to_image().debug_tablefinder()</code> ile ne bulduğuna bak. Çizgisiz tablolarda Camelot\'un stream modu ya da metni satır satır alıp "iki ve fazla boşluk" ile bölmek çoğu zaman daha sağlamdır.'
    },
    {
      q: 'OCR\'de Türkçe karakterler bozuluyor.',
      a: 'Tesseract\'a Türkçe dil paketini kurup <code>lang="tur"</code> ver, sayfayı en az 300 DPI\'da görüntüye çevir. Yine de para ve kimlik numarası gibi kritik alanları doğrulama kurallarından geçir ve şüphelileri insan onayına gönder.'
    },
    {
      q: 'Şifreli PDF\'leri toplu işlerken ne yapmalıyım?',
      a: 'pypdf\'te <code>reader.is_encrypted</code> ile kontrol et, şifre biliniyorsa <code>reader.decrypt(sifre)</code> çağır. Şifreyi koda yazma; ortam değişkeni ya da kasa (vault) kullan. Açılamayan dosyayı hata listesine yaz ve işi durdurma.'
    }
  ],
  mistakes: [
    {
      bad: 'tutar = float("1.250,50".replace(",", "."))',
      good: 'tutar = float("1.250,50".replace(".", "").replace(",", "."))',
      why: 'Türkçe biçimde nokta binlik ayırıcıdır; önce silinmeli. Aksi hâlde ValueError ya da daha kötüsü "1.430" → 1,43 gibi sessiz hata olur.'
    },
    {
      bad: 're.search(r"Toplam:\\s*([\\d.,]+)", metin)',
      good: 're.search(r"^Genel Toplam:\\s*([\\d.,]+)", metin, re.M)',
      why: 'Gevşek kalıp ilk "Toplam:" geçen satırı (Ara Toplam) yakalar; etiketi tam yaz ve satır başına çapala.'
    },
    {
      bad: 'for yol in klasor.glob("*.pdf"):\n    isle(yol)   # biri patlarsa hepsi durur',
      good: 'for yol in klasor.glob("*.pdf"):\n    try:\n        isle(yol)\n    except Exception as e:\n        hatalar.append((yol.name, str(e)))',
      why: 'Toplu işte her dosyayı yalıt; bozuk dosyayı hata listesine yaz, kalanını işlemeye devam et.'
    },
    {
      bad: 'metin = re.sub(r"\\d{11}", "***********", metin)',
      good: 'metin = re.sub(r"\\b\\d{11}\\b", lambda m: maske(m.group()) if tckn_gecerli(m.group()) else m.group(), metin)',
      why: 'Kör maskeleme sipariş ve IBAN numaralarını da bozar; kelime sınırı ve sağlama algoritmasıyla yalnız gerçek kimlikleri maskele.'
    },
    {
      bad: 'paragraf.text = paragraf.text.replace("{musteri}", ad)  # python-docx',
      good: 'DocxTemplate("sablon.docx").render({"musteri": ad})',
      why: 'Word bir yer tutucuyu birden çok "run"a bölebilir ve text atamak biçimi siler; şablon doldurmak için docxtpl kullan.'
    }
  ]
});
})(window);
