/* PythonPatika — Ofis ve iş akışı otomasyonu (v2/o5) */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{ id: 'ofis-otomasyon',
  lv: 'orta',
  mod: 'Otomasyon ve Araçlar',
  min: 45,
  title: 'Ofis ve iş akışı otomasyonu',
  sum: 'pathlib ve shutil ile klasör düzenler, toplu yeniden adlandırır ve tarih damgalı yedek alırsın; EmailMessage ile ekli e-posta hazırlar, zamanlama ve dosya izlemeyi kurar, dry-run, log ve geri alma ile otomasyonu güvenli hale getirirsin.',
  goals: [
    'Bir klasördeki dosyaları uzantıya göre kategorilere taşıyan ve toplu yeniden adlandıran betik yazabilirim.',
    'Tarih damgalı yedek alıp eski yedekleri rotasyonla temizleyebilirim.',
    'EmailMessage ile düz metin, HTML ve ekli e-posta oluşturup smtplib ile güvenli göndermenin yolunu bilirim.',
    'Betiği cron, Görev Zamanlayıcı ya da schedule ile zamanlayabilir, klasör değişikliklerini yoklamayla izleyebilirim.',
    'Dry-run, loglama ve geri alma günlüğüyle otomasyonun riskini yönetebilirim.'
  ],
  body: `<h2>Neden önemli?</h2>
<p>Anadolu Market'in muhasebe ekibinde her pazartesi aynı tören yaşanır: "Gelen" klasörüne düşen 40-50 fatura PDF'i, Excel dökümü ve fiş fotoğrafı tek tek açılır, doğru klasöre sürüklenir, adı "2026-10-26_fatura_01.pdf" biçimine çevrilir, klasörün yedeği alınır ve haftalık özet e-postayla yöneticiye gider. Bu iş yarım gün sürer, sıkıcıdır ve sıkıcı işte hata yapılır. Aynı işi 60 satırlık bir Python betiği birkaç saniyede, her seferinde aynı biçimde yapar. Buna <b>ofis otomasyonu</b> (office automation) ya da iş akışı otomasyonu (workflow automation) denir.</p>
<p>Bu derste gerçek bir otomasyon betiğinin parçalarını kuracaksın: klasör düzenleme, toplu yeniden adlandırma, tarih damgalı yedek, e-posta hazırlama, PDF/Word dokunuşları, zamanlama ve dosya izleme. En önemlisi, otomasyonun <b>güvenli</b> olmasını sağlayan üç alışkanlığı öğreneceksin: kuru çalıştırma (dry-run), loglama ve geri alma. <code>pathlib</code> ve <code>shutil</code> ile ilk tanışmanı <i>Dosya işlemleri</i> ve <i>Standart kütüphane turu</i> derslerinde yapmıştın; burada onları bir iş sürecine dönüştürüyoruz.</p>
<div class="tbl-wrap"><table>
<tr><th>İş</th><th>Sıklık</th><th>Elle süre</th><th>Otomasyona değer mi?</th></tr>
<tr><td>Gelen klasörünü uzantıya göre ayırmak</td><td>Her gün</td><td>15 dk</td><td>Kesinlikle: kural net, risk düşük</td></tr>
<tr><td>Haftalık satış raporunu e-postalamak</td><td>Haftada bir</td><td>30 dk</td><td>Evet: biçim sabit, veri değişken</td></tr>
<tr><td>Yıllık bütçe sunumunu hazırlamak</td><td>Yılda bir</td><td>2 gün</td><td>Kısmen: yorum insan işi, tablolar otomatik</td></tr>
<tr><td>Müşteri şikâyetine cevap yazmak</td><td>Her gün</td><td>Değişken</td><td>Hayır: yargı gerektirir; yalnız taslak hazırla</td></tr>
</table></div>
<p>Kural basit: <b>sık tekrarlanan, kuralı yazıya dökülebilen ve hatası geri alınabilen</b> işler otomasyonun ilk adaylarıdır.</p>

<h2>Güvenli oyun alanı: geçici klasör</h2>
<p>Otomasyon kodunu ilk kez gerçek "Belgeler" klasöründe denemek, yeni sürücünün otoyola çıkması gibidir. Her zaman önce geçici bir klasörde (temporary directory) dene. Bu sayfadaki örnekler tarayıcıdaki bellek içi dosya sisteminde çalışır; kendi bilgisayarında da aynı kod geçici klasör kullandığı için gerçek dosyalarına dokunmaz.</p>
<pre class="py">import tempfile
from pathlib import Path

kok = Path(tempfile.mkdtemp()) / "Gelen"
kok.mkdir()
for ad in ["Fatura_Ekim.PDF", "satislar.csv", "fis 01.jpg", "notlar.txt", "stok.xlsx"]:
    (kok / ad).write_text("örnek içerik", encoding="utf-8")

for dosya in sorted(kok.iterdir()):
    print(f"{dosya.name:20} uzantı={dosya.suffix.lower():6} boyut={dosya.stat().st_size} bayt")</pre>
<p><code>Path.iterdir()</code> klasördeki öğeleri, <code>suffix</code> uzantıyı, <code>stat()</code> boyut ve değişiklik zamanını verir. Uzantıyı her zaman <code>.lower()</code> ile karşılaştır: Windows'tan gelen dosyalar sıkça <code>.PDF</code> ya da <code>.JPG</code> olur.</p>

<h2>Klasör düzenleme: uzantıya göre taşıma</h2>
<p>İlk otomasyonumuz klasik "indirilenler temizliği". Önce bir kural tablosu (uzantı → kategori) kur, sonra her dosya için hedefi hesapla. Kodun iki aşamalı olduğuna dikkat et: <b>önce plan</b> (ne yapılacağını listele), <b>sonra uygula</b>. Bu ayrım dry-run'ı bedavaya getirir.</p>
<pre class="py">import tempfile, shutil
from pathlib import Path

KURAL = {".pdf": "Belgeler", ".docx": "Belgeler", ".txt": "Belgeler",
         ".csv": "Tablolar", ".xlsx": "Tablolar", ".jpg": "Görseller", ".png": "Görseller"}

def plan_yap(kok):
    plan = []
    for dosya in sorted(p for p in kok.iterdir() if p.is_file()):
        kategori = KURAL.get(dosya.suffix.lower(), "Diğer")
        plan.append((dosya, kok / kategori / dosya.name))
    return plan

def uygula(plan, dry_run=True):
    for kaynak, hedef in plan:
        etiket = "[DRY-RUN] " if dry_run else ""
        print(f"{etiket}{kaynak.name} -&gt; {hedef.parent.name}/")
        if not dry_run:
            hedef.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(kaynak, hedef)

kok = Path(tempfile.mkdtemp())
for ad in ["Fatura_Ekim.PDF", "satislar.csv", "fis01.jpg", "README"]:
    (kok / ad).write_text("x")

uygula(plan_yap(kok))              # önce yalnızca göster
uygula(plan_yap(kok), dry_run=False)
print(sorted(str(p.relative_to(kok)) for p in kok.rglob("*") if p.is_file()))</pre>
<div class="tip"><b>Plan-uygula ayrımı</b>Planı bir liste olarak döndürmek; onu test etmeyi, ekrana basmayı, kullanıcıdan onay almayı ve log'a yazmayı kolaylaştırır. Dosyaya dokunan kod ne kadar küçük olursa hata ihtimali o kadar düşer.</div>
<p><code>mkdir(parents=True, exist_ok=True)</code> ara klasörleri de oluşturur ve klasör zaten varsa hata vermez. <code>shutil.move</code> farklı disk bölümleri arasında da çalışır; <code>Path.rename</code> ise aynı bölüm içinde daha hızlıdır ama Windows'ta hedef varsa hata verir.</p>

<h2>Toplu yeniden adlandırma</h2>
<p>Fiş fotoğrafları "IMG_4821.JPG", "Fiş - Şubat (son).jpg" gibi adlarla gelir. Arşiv için tutarlı bir ad kuralı belirle: tarih öneki + Türkçe karakter ve boşluk içermeyen gövde + sıra numarası. Tarih önekini <b>YYYYMMDD</b> biçiminde yazarsan dosya adına göre sıralama aynı zamanda kronolojik sıralama olur.</p>
<pre class="py">import re

TR = str.maketrans("çğıöşüÇĞİÖŞÜ", "cgiosuCGIOSU")

def sade(metin):
    metin = metin.translate(TR).lower()
    metin = re.sub(r"[^a-z0-9]+", "_", metin)
    return metin.strip("_")

adlar = ["Fiş - Şubat (son).JPG", "IMG_4821.jpg", "Kargo İrsaliyesi.jpg"]
for i, ad in enumerate(sorted(adlar), start=1):
    govde, _, uzanti = ad.rpartition(".")
    yeni = f"20261026_{i:03d}_{sade(govde)}.{uzanti.lower()}"
    print(f"{ad:25} -&gt; {yeni}")</pre>
<div class="warn"><b>Çakışma kontrolü</b>İki farklı dosya aynı yeni ada dönüşebilir ("Rapor.pdf" ve "rapor.PDF"). Yeniden adlandırmadan önce hedefin var olup olmadığına (<code>hedef.exists()</code>) bak; varsa atla ya da sonuna sayaç ekle. Aksi halde bir dosyanın üzerine sessizce yazarsın ve veri kaybı olur.</div>

<h2>Tarih damgalı yedek</h2>
<p>Bir klasörü değiştirmeden önce yedeğini almak en ucuz sigortadır. Yedek adına zaman damgası (timestamp) koy; eskileri belirli bir sayının üzerinde sil (rotasyon). Testlerde ve örneklerde sabit bir tarih kullan ki sonuç her çalıştırmada aynı olsun; gerçek betikte <code>datetime.now()</code> kullanırsın.</p>
<pre class="py">import tempfile, shutil
from datetime import datetime
from pathlib import Path

alan = Path(tempfile.mkdtemp())
kaynak = alan / "Muhasebe"
kaynak.mkdir()
(kaynak / "ekim.csv").write_text("tutar\\n100\\n")
yedekler = alan / "Yedekler"

for gun in [20, 21, 22, 23, 24]:
    an = datetime(2026, 10, gun, 18, 0)
    hedef = yedekler / f"Muhasebe_{an:%Y%m%d_%H%M}"
    shutil.copytree(kaynak, hedef)

# rotasyon: yalnızca en yeni 3 yedek kalsın
hepsi = sorted(p for p in yedekler.iterdir() if p.is_dir())
for eski in hepsi[:-3]:
    shutil.rmtree(eski)
    print("silindi:", eski.name)
print("kalan:", [p.name for p in sorted(yedekler.iterdir())])</pre>
<p>Tek dosyalık arşiv istersen <code>shutil.make_archive(str(hedef), "zip", kaynak)</code> klasörü zip'ler. <code>shutil.copy2</code> tek dosyayı değiştirilme zamanıyla birlikte kopyalar.</p>

<h2>Otomasyonun riskleri: dry-run, log, geri alma</h2>
<p>Elle yapılan hata bir dosyayı bozar; otomasyon hatası binlercesini aynı anda bozar. Bu yüzden profesyonel otomasyon betiklerinde üç emniyet kemeri vardır:</p>
<div class="steps-list"><ol>
<li><b>Kuru çalıştırma (dry-run):</b> Betik yapacaklarını yazdırır ama hiçbir dosyaya dokunmaz. Varsayılan mod dry-run olsun; gerçek çalıştırma için açıkça <code>--uygula</code> gibi bir bayrak iste.</li>
<li><b>Loglama (logging):</b> Her işlemi zamanıyla birlikte bir log dosyasına yaz. "Dün gece betik ne yaptı?" sorusunun cevabı <code>print</code> çıktısında değil, log dosyasındadır.</li>
<li><b>Geri alma (undo):</b> Yapılan her taşımayı (kaynak, hedef) çifti olarak kaydet; ters sırayla uygulayarak işlemi geri al.</li>
</ol></div>
<pre class="py">import logging, tempfile, shutil, io
from pathlib import Path

akis = io.StringIO()
logging.basicConfig(stream=akis, level=logging.INFO, format="%(levelname)s %(message)s", force=True)
log = logging.getLogger("duzenleyici")

kok = Path(tempfile.mkdtemp())
for ad in ["a.pdf", "b.csv"]:
    (kok / ad).write_text("x")

gunluk = []                       # geri alma günlüğü
for dosya in sorted(kok.glob("*.*")):
    hedef = kok / dosya.suffix[1:].upper() / dosya.name
    hedef.parent.mkdir(exist_ok=True)
    shutil.move(dosya, hedef)
    gunluk.append((dosya, hedef))
    log.info("taşındı %s -&gt; %s", dosya.name, hedef.parent.name)

for kaynak, hedef in reversed(gunluk):  # GERİ AL
    shutil.move(hedef, kaynak)
    log.warning("geri alındı %s", kaynak.name)

print(akis.getvalue())
print(sorted(p.name for p in kok.iterdir() if p.is_file()))</pre>
<p><code>logging</code> modülünde mesajı <code>%s</code> yer tutucularıyla ver (f-string değil): seviye kapalıysa metin hiç oluşturulmaz. Gerçek betikte <code>stream</code> yerine <code>filename="otomasyon.log"</code> verirsin.</p>

<h2>E-posta: mesajı oluşturmak ve göndermek</h2>
<p>E-posta iki ayrı iştir: <b>mesajı oluşturmak</b> (başlıklar, gövde, ekler) ve <b>göndermek</b> (SMTP sunucusuna bağlanmak). Birincisi tamamen <code>email.message.EmailMessage</code> ile yapılır ve tarayıcıda da çalışır; ikincisi ağ ister.</p>
<pre class="py">from email.message import EmailMessage

msg = EmailMessage()
msg["From"] = "rapor@anadolumarket.com.tr"
msg["To"] = ", ".join(["mudur@anadolumarket.com.tr", "finans@anadolumarket.com.tr"])
msg["Subject"] = "Haftalık satış özeti - 43. hafta"
msg.set_content("Merhaba,\\n\\nBu haftanın özeti ektedir.\\n\\nOtomasyon Botu")
msg.add_alternative("&lt;h3&gt;Haftalık özet&lt;/h3&gt;&lt;p&gt;Toplam ciro: &lt;b&gt;182.450 TL&lt;/b&gt;&lt;/p&gt;", subtype="html")
msg.add_attachment("magaza,ciro\\nKadıköy,98200\\nÇankaya,84250\\n", subtype="csv", filename="ozet.csv")

print(msg["Subject"])
print(msg.get_content_type())
print([p.get_content_type() for p in msg.iter_parts()])
print([p.get_filename() for p in msg.iter_attachments()])</pre>
<p><code>set_content</code> düz metin gövdeyi, <code>add_alternative</code> aynı içeriğin HTML sürümünü ekler (istemci hangisini gösterebiliyorsa onu seçer). <code>add_attachment</code> metin için <code>subtype</code>, ikili veri (PDF, resim) için <code>maintype</code> ve <code>subtype</code> ister: <code>msg.add_attachment(pdf_bytes, maintype="application", subtype="pdf", filename="fatura.pdf")</code>. Ek eklenince mesaj otomatik olarak <code>multipart/mixed</code> olur.</p>
<p>Göndermek için <code>smtplib</code> kullanırsın. Bu kod ağ gerektirdiği için burada yalnızca gösterim:</p>
<pre class="code">import os, smtplib

kullanici = os.environ["SMTP_KULLANICI"]
sifre = os.environ["SMTP_SIFRE"]          # uygulama şifresi, ASLA koda yazma

with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=30) as sunucu:
    sunucu.login(kullanici, sifre)
    sunucu.send_message(msg)</pre>
<div class="note"><b>Kendi bilgisayarında dene</b>Gmail ve Outlook, hesap şifrenle SMTP girişine izin vermez. İki adımlı doğrulamayı aç, hesap ayarlarından 16 karakterlik bir <b>uygulama şifresi</b> (app password) üret ve ortam değişkenine koy: Windows'ta <code>setx SMTP_SIFRE "..."</code>, macOS/Linux'ta <code>export SMTP_SIFRE="..."</code>. Kurumsal ortamda genellikle şirketin iç SMTP sunucusu (port 587 + <code>starttls()</code>) kullanılır. Denemelerde mesajı göndermek yerine <code>open("taslak.eml", "wb").write(bytes(msg))</code> ile dosyaya yazıp e-posta istemcinde açabilirsin.</div>

<h2>PDF ve Word dokunuşları</h2>
<p>Ofiste en sık istenen iki iş: birçok PDF'i birleştirmek ve şablon bir Word belgesine veri doldurmak. <code>pypdf</code> ve <code>python-docx</code> tarayıcıda çalışmaz; kendi bilgisayarında <code>pip install pypdf python-docx</code> ile kur.</p>
<pre class="code">from pathlib import Path
from pypdf import PdfReader, PdfWriter

yazici = PdfWriter()
for yol in sorted(Path("faturalar").glob("*.pdf")):
    okuyucu = PdfReader(yol)
    print(yol.name, len(okuyucu.pages), "sayfa")
    for sayfa in okuyucu.pages:
        yazici.add_page(sayfa)
yazici.write("ekim_faturalari.pdf")
print(PdfReader("ekim_faturalari.pdf").pages[0].extract_text()[:200])</pre><pre class="code">from docx import Document

belge = Document()
belge.add_heading("Anadolu Market - Haftalık Rapor", level=1)
belge.add_paragraph("Bu hafta toplam ciro 182.450 TL oldu.")
tablo = belge.add_table(rows=1, cols=2)
tablo.rows[0].cells[0].text, tablo.rows[0].cells[1].text = "Mağaza", "Ciro"
for magaza, ciro in [("Kadıköy", "98.200"), ("Çankaya", "84.250")]:
    hucreler = tablo.add_row().cells
    hucreler[0].text, hucreler[1].text = magaza, ciro
belge.save("haftalik_rapor.docx")</pre>
<p>Word şablonunda "{{musteri}}" gibi yer tutucuları değiştirmek gerekiyorsa <i>Şablonla rapor üretme</i> dersindeki Jinja mantığını <code>docxtpl</code> paketiyle Word'e taşıyabilirsin.</p>

<h2>Zamanlama: betik kendiliğinden çalışsın</h2>
<p>Betiği her pazartesi elle çalıştırmak otomasyonun yarısıdır. Üç yol var:</p>
<div class="tbl-wrap"><table>
<tr><th>Araç</th><th>Nerede</th><th>Örnek</th><th>Not</th></tr>
<tr><td><code>schedule</code> paketi</td><td>Her yerde, Python içinde</td><td><code>schedule.every().monday.at("08:30").do(is)</code></td><td>Betik sürekli açık kalmalı</td></tr>
<tr><td>cron</td><td>Linux / macOS</td><td><code>30 8 * * 1 /usr/bin/python3 /opt/rapor.py</code></td><td>Sunucularda standart</td></tr>
<tr><td>Görev Zamanlayıcı</td><td>Windows</td><td><code>schtasks /create /sc weekly /d MON /st 08:30 /tn Rapor /tr "py C:\\is\\rapor.py"</code></td><td>Arayüzden de kurulur</td></tr>
</table></div>
<p>Cron ifadesi beş alandan oluşur: <b>dakika saat gün ay haftagünü</b>. <code>*</code> "her", <code>1-5</code> aralık, <code>8,12</code> liste, <code>*/15</code> "15'te bir" demektir; haftagünü 0 (ya da 7) pazardır. Yani <code>*/15 9-17 * * 1-5</code> "hafta içi 09:00-17:45 arası çeyrek saatte bir" anlamına gelir.</p>
<pre class="code"># pip install schedule
import time, schedule

def haftalik_rapor():
    print("rapor hazırlanıyor...")

schedule.every().monday.at("08:30").do(haftalik_rapor)
while True:
    schedule.run_pending()
    time.sleep(30)</pre>
<div class="warn"><b>Zamanlanmış betiğin tuzakları</b>Cron ve Görev Zamanlayıcı betiği <i>senin terminalinden farklı</i> bir ortamda çalıştırır: çalışma klasörü farklıdır (göreli yollar bozulur), sanal ortam etkin değildir, ortam değişkenleri eksik olabilir. Yolları <code>Path(__file__).parent</code> ile mutlak kur, sanal ortamın python'unu tam yoluyla çağır ve çıktıyı log dosyasına yönlendir.</div>

<h2>Dosya izleme</h2>
<p>"Klasöre yeni fatura düşer düşmez işle" senaryosu için iki yol var: <code>watchdog</code> paketi işletim sisteminin bildirimlerini dinler (<code>pip install watchdog</code>); daha basit ve her yerde çalışan yol ise <b>yoklama</b> (polling): belirli aralıkla klasörün anlık görüntüsünü (snapshot) alıp öncekiyle karşılaştırmak.</p>
<pre class="py">def anlik(dosyalar):
    """ad -&gt; (boyut, değiştirilme zamanı) sözlüğü; gerçekte Path.stat() ile doldurulur"""
    return dict(dosyalar)

once = anlik({"a.pdf": (120, 1000), "b.csv": (40, 1000)})
sonra = anlik({"a.pdf": (150, 1060), "c.jpg": (900, 1061)})

eklenen = sorted(sonra.keys() - once.keys())
silinen = sorted(once.keys() - sonra.keys())
degisen = sorted(ad for ad in once.keys() &amp; sonra.keys() if once[ad] != sonra[ad])
print("eklenen:", eklenen, "| silinen:", silinen, "| değişen:", degisen)</pre>
<p>Sözlüklerin <code>keys()</code> görünümleri küme gibi davranır: fark (<code>-</code>) ve kesişim (<code>&amp;</code>) doğrudan çalışır. Yarım kopyalanmış bir dosyayı işlememek için boyutun iki ardışık yoklamada değişmediğini görmeyi beklemek yaygın bir hiledir.</p>

<div class="note"><b>Gerçek işte</b>Bir lojistik firmasında irsaliye PDF'lerini müşteri koduna göre klasörleyen betik, ilk gün "Diğer" klasörüne 300 dosya taşıdı: tedarikçi dosya adındaki ayıracı "-" yerine "_" yapmıştı. Ekip betiği dry-run modunda çalıştırıp planı bir CSV'ye yazdırmayı ve "Diğer"e düşen dosya sayısı eşiği aşarsa uyarı e-postası atmayı ekledi. Otomasyonun asıl değeri işi hızlı yapmasında değil, <b>beklenmedik durumu fark edip durmasındadır</b>.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Etkisiz (idempotent) betik</h3>
<p>İyi bir otomasyon betiğini iki kez üst üste çalıştırmak bir kez çalıştırmakla aynı sonucu vermelidir. Zaten taşınmış dosyayı tekrar taşımaya çalışmamak, var olan yedeği ezmemek, aynı e-postayı iki kez göndermemek (gönderildi bilgisini bir durum dosyasına yazmak) bu ilkenin parçalarıdır. Zamanlanmış görevler bazen iki kez tetiklenir ya da yarıda kesilir; idempotent betik bu durumları sorunsuz atlatır.</p>
<h3>Kilit dosyası ve çakışan çalıştırmalar</h3>
<p>Betik 15 dakikada bir çalışıyorsa ve bir çalıştırma 20 dakika sürerse ikisi aynı dosyalar üzerinde yarışır. Başta <code>Path("calisiyor.lock").touch(exist_ok=False)</code> ile kilit al, <code>FileExistsError</code> gelirse çık, <code>finally</code> içinde kilidi sil.</p>
<h3>Atomik yazma ve geri dönüşüm kutusu</h3>
<p>Raporu önce <code>rapor.tmp</code>'ye yazıp sonra <code>os.replace</code> ile asıl ada çevir; yarım dosya oluşmaz. Silme yerine <code>send2trash</code> paketiyle geri dönüşüm kutusuna gönder ya da "Silinecekler" klasörüne taşı ve 30 gün sonra temizle.</p>
<h3>Gizli bilgiler ve yetki</h3>
<p>Şifre, API anahtarı ve SMTP bilgileri koda değil ortam değişkenine ya da <code>.env</code> dosyasına (git'e eklenmeyen) yazılır. Otomasyon hesabına yalnızca gereken klasörlerde yetki ver; "her yere yazabilen bot" en tehlikeli kullanıcıdır.</p>
</section>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: 'Bir otomasyon betiğinin <b>dry-run</b> (kuru çalıştırma) modu ne yapar?',
      o: [
        'Dosyaları önce geçici klasöre kopyalar, sonra asıl yere taşır',
        'Yapacağı işlemleri listeler ve loglar ama hiçbir dosyaya dokunmaz',
        'Betiği hata ayıklayıcıda satır satır çalıştırır',
        'Yalnızca boş klasörleri ve geçici dosyaları siler'
      ],
      a: 1,
      why: 'Dry-run, planın ne yapacağını gösterir ama yan etki üretmez. Gerçek çalıştırmadan önce sonucu gözle denetlemeni sağlar; profesyonel betiklerde varsayılan mod genellikle budur.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Şirketin Gmail hesabından <code>smtplib</code> ile haftalık rapor göndereceksin. Kod bir git deposunda duruyor. En doğru yaklaşım hangisi?',
      o: [
        'Hesap şifresini koda yaz; depo özel olduğu için kimse göremez',
        'Uygulama şifresi üret ve os.environ ile ortam değişkeninden oku',
        'Şifreyi base64 ile kodlayıp sabit olarak betiğe göm',
        'Şifreyi her çalıştırmada input() ile sor, cron da yazar'
      ],
      a: 1,
      why: 'Gmail/Outlook hesap şifresiyle SMTP girişine izin vermez; iki adımlı doğrulama sonrası üretilen uygulama şifresi gerekir. Şifre koda (base64 dahil, o şifreleme değildir) girmemeli; ortam değişkeninden okunmalı. Zamanlanmış betik input() bekleyemez.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Cron ifadesi <code>30 8 * * 1</code> betiği ne zaman çalıştırır?',
      o: ['Her ayın 1\'inde saat 08:30\'da', 'Her pazartesi saat 08:30\'da', 'Her gün 08:30 ile 08:31 arasında bir kez', 'Her gün 30 dakikada bir, 8 kez'],
      a: 1,
      why: 'Alanlar sırasıyla dakika (30), saat (8), ayın günü (*), ay (*), haftagünü (1 = pazartesi). Ayın gününü kısıtlamak için üçüncü alan kullanılırdı.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'from pathlib import Path\np = Path("gelen/Fatura_Ekim.2026.PDF")\nprint(p.name)\nprint(p.stem, p.suffix)\nprint(p.suffix.lower() == ".pdf")\n',
      o: ['Fatura_Ekim.2026.PDF\nFatura_Ekim.2026 .PDF\nTrue', 'Fatura_Ekim.2026.PDF\nFatura_Ekim .2026.PDF\nFalse', 'gelen/Fatura_Ekim.2026.PDF\nFatura_Ekim.2026 .PDF\nTrue', 'Fatura_Ekim.2026.PDF\nFatura_Ekim.2026 .pdf\nFalse'],
      a: 0,
      why: 'name klasörsüz tam addır. suffix yalnızca SON noktadan sonrasını alır (.PDF), stem geri kalanıdır (Fatura_Ekim.2026). Büyük harfli uzantı lower() ile ".pdf" olur, karşılaştırma True.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Toplu yeniden adlandırma planı ne yazdırır?',
      code: 'dosyalar = ["fis_b.jpg", "fis_a.jpg", "fis_c.jpg"]\nfor i, ad in enumerate(sorted(dosyalar), start=1):\n    print(f"{i:03d}_{ad}")\n',
      o: ['001_fis_b.jpg\n002_fis_a.jpg\n003_fis_c.jpg', '000_fis_a.jpg\n001_fis_b.jpg\n002_fis_c.jpg', '001_fis_a.jpg\n002_fis_b.jpg\n003_fis_c.jpg', '1_fis_a.jpg\n2_fis_b.jpg\n3_fis_c.jpg'],
      a: 2,
      why: 'sorted ada göre sıralar (a, b, c); enumerate start=1 ile 1\'den sayar; :03d sayıyı üç haneye sıfırla tamamlar. Sıfır dolgusu, dosya gezgininde 10\'un 2\'den önce gelmesini engeller.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'E-postaya ek eklendiğinde içerik türü nasıl değişir?',
      code: 'from email.message import EmailMessage\nmsg = EmailMessage()\nmsg["Subject"] = "Haftalık rapor"\nmsg.set_content("Rapor ektedir.")\nprint(msg.get_content_type())\nmsg.add_attachment("ad,tutar\\nÇay,45\\n", subtype="csv", filename="satis.csv")\nprint(msg.get_content_type())\nprint([p.get_filename() for p in msg.iter_attachments()])\n',
      o: ['text/plain\ntext/plain\n[\'satis.csv\']', 'text/plain\nmultipart/mixed\n[\'satis.csv\']', 'multipart/mixed\nmultipart/mixed\n[\'satis.csv\']', 'text/plain\ntext/csv\n[\'satis.csv\']'],
      a: 1,
      why: 'Yalnızca set_content ile mesaj tek parçalı text/plain\'dir. add_attachment mesajı otomatik olarak multipart/mixed\'e çevirir: gövde bir parça, ek ayrı bir parça olur. iter_attachments yalnız ekleri gezer.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Tarih damgalı yedek adını üreten programın satırlarını sırala. Çıktı <code>satislar_20261026_0905.zip</code> olmalı.</p>',
      lines: ['from datetime import datetime', 'an = datetime(2026, 10, 26, 9, 5)', 'damga = an.strftime("%Y%m%d_%H%M")', 'yedek_adi = f"satislar_{damga}.zip"', 'print(yedek_adi)'],
      expect: 'satislar_20261026_0905.zip\n',
      hint: 'Önce içe aktar, sonra zamanı oluştur; damga zamandan, ad damgadan türer.',
      why: 'Her satır bir öncekinin ürettiği adı kullanır: datetime → an → damga → yedek_adi. %Y%m%d_%H%M biçimi adların kronolojik sıralanmasını sağlar.' },
    { id: 'ofis-otomasyon-8',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p><code>kategori_bul(dosya_adi)</code> fonksiyonunu tamamla. Uzantıya göre <code>KATEGORILER</code> sözlüğündeki kategori adını döndürsün; uzantı büyük harfli olabilir (<code>.PDF</code>). Hiçbir kategoriye uymayan ya da uzantısı olmayan dosya için <code>"Diğer"</code> döndürsün.</p><p>Örnek: <code>kategori_bul("Fatura.PDF")</code> → <code>"Belgeler"</code>, <code>kategori_bul("README")</code> → <code>"Diğer"</code></p>',
      guide: [
        'Path(dosya_adi).suffix ile uzantıyı al ve .lower() ile küçült.',
        'KATEGORILER.items() üzerinde dön: her kategori için bir uzantı kümesi var.',
        'Uzantı kümede ise kategori adını hemen döndür.',
        'Döngü bitince "Diğer" döndür.'
      ],
      example: 'from pathlib import Path\n\nDILLER = {"Python": {".py"}, "Web": {".html", ".css", ".js"}}\n# ters sözlük: uzantı -> dil\nuzanti_dil = {u: dil for dil, kume in DILLER.items() for u in kume}\n\nfor ad in ["APP.JS", "main.py", "Makefile"]:\n    print(ad, uzanti_dil.get(Path(ad).suffix.lower(), "Bilinmiyor"))\n',
      start: 'from pathlib import Path\n\nKATEGORILER = {\n    "Belgeler": {".pdf", ".docx", ".txt"},\n    "Tablolar": {".xlsx", ".csv"},\n    "Görseller": {".jpg", ".jpeg", ".png"},\n}\n\ndef kategori_bul(dosya_adi):\n    # TODO: uzantıyı küçük harfe çevirerek al\n    # TODO: KATEGORILER içinde uzantıyı ara, bulursan kategori adını döndür\n    # TODO: bulamazsan "Diğer" döndür\n    pass\n',
      sol: 'from pathlib import Path\n\nKATEGORILER = {\n    "Belgeler": {".pdf", ".docx", ".txt"},\n    "Tablolar": {".xlsx", ".csv"},\n    "Görseller": {".jpg", ".jpeg", ".png"},\n}\n\ndef kategori_bul(dosya_adi):\n    uzanti = Path(dosya_adi).suffix.lower()\n    for kategori, uzantilar in KATEGORILER.items():\n        if uzanti in uzantilar:\n            return kategori\n    return "Diğer"\n',
      tests: 'assert kategori_bul("Fatura.PDF") == "Belgeler", "Büyük harfli .PDF de Belgeler olmalı: uzantıyı lower() ile küçült"\nassert kategori_bul("satis.csv") == "Tablolar"\nassert kategori_bul("fis 01.JPEG") == "Görseller"\nassert kategori_bul("rapor.final.docx") == "Belgeler", "Yalnız son uzantı önemli"\nassert kategori_bul("README") == "Diğer", "Uzantısız dosya Diğer olmalı"\nassert kategori_bul("arsiv.zip") == "Diğer", "Bilinmeyen uzantı Diğer olmalı"\n',
      hints: ['Uzantıyı pathlib verir: Path(ad).suffix.', 'for kategori, uzantilar in KATEGORILER.items(): ve if uzanti in uzantilar:', 'Döngüden sonra return "Diğer" yazmayı unutma; pass None döndürür.'],
      why: 'Kural tablosunu veri olarak (sözlük) tutmak, yeni bir uzantı eklendiğinde kodu değil yalnızca tabloyu değiştirmeni sağlar. suffix.lower() büyük-küçük harf farkını ortadan kaldırır.' },
    { id: 'ofis-otomasyon-9',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p><code>duzenle(kok, dry_run=True)</code> fonksiyonunu tamamla. <code>kok</code> klasöründeki (alt klasörlere inmeden) her <b>dosyayı</b> ada göre sıralı gez; <code>kategori_bul</code> ile kategorisini bul ve planı <code>(dosya_adi, kategori)</code> demetlerinin listesi olarak döndür.</p><ul><li><code>dry_run=True</code> ise hiçbir dosyaya dokunma.</li><li><code>dry_run=False</code> ise <code>kok/kategori/</code> klasörünü oluştur (varsa hata verme) ve dosyayı oraya taşı.</li></ul>',
      guide: [
        'kok = Path(kok) ile yolu nesneye çevir.',
        'sorted(kok.iterdir()) içinde yalnızca p.is_file() olanları al.',
        'Her dosya için kategoriyi bul ve plan listesine (ad, kategori) ekle.',
        'dry_run False ise hedef klasörü mkdir(exist_ok=True) ile oluştur ve shutil.move ile taşı.',
        'Planı döndür.'
      ],
      example: 'import tempfile, shutil\nfrom pathlib import Path\n\nkok = Path(tempfile.mkdtemp())\nfor ad in ["x.log", "y.log", "z.txt"]:\n    (kok / ad).write_text("-")\n\narsiv = kok / "Arsiv"\nfor p in sorted(kok.glob("*.log")):\n    arsiv.mkdir(exist_ok=True)\n    shutil.move(p, arsiv / p.name)\nprint(sorted(p.name for p in arsiv.iterdir()))\n',
      start: 'from pathlib import Path\n\nKATEGORILER = {\n    "Belgeler": {".pdf", ".docx", ".txt"},\n    "Tablolar": {".xlsx", ".csv"},\n    "Görseller": {".jpg", ".jpeg", ".png"},\n}\n\ndef kategori_bul(dosya_adi):\n    uzanti = Path(dosya_adi).suffix.lower()\n    for kategori, uzantilar in KATEGORILER.items():\n        if uzanti in uzantilar:\n            return kategori\n    return "Diğer"\n\nimport shutil\n\ndef duzenle(kok, dry_run=True):\n    kok = Path(kok)\n    plan = []\n    # TODO: kok içindeki dosyaları (klasörleri değil) ada göre sıralı gez\n    # TODO: her dosya için (ad, kategori) demetini plana ekle\n    # TODO: dry_run False ise hedef klasörü oluştur ve dosyayı taşı\n    return plan\n',
      sol: 'from pathlib import Path\n\nKATEGORILER = {\n    "Belgeler": {".pdf", ".docx", ".txt"},\n    "Tablolar": {".xlsx", ".csv"},\n    "Görseller": {".jpg", ".jpeg", ".png"},\n}\n\ndef kategori_bul(dosya_adi):\n    uzanti = Path(dosya_adi).suffix.lower()\n    for kategori, uzantilar in KATEGORILER.items():\n        if uzanti in uzantilar:\n            return kategori\n    return "Diğer"\n\nimport shutil\n\ndef duzenle(kok, dry_run=True):\n    kok = Path(kok)\n    plan = []\n    for dosya in sorted(p for p in kok.iterdir() if p.is_file()):\n        kategori = kategori_bul(dosya.name)\n        plan.append((dosya.name, kategori))\n        if not dry_run:\n            hedef = kok / kategori\n            hedef.mkdir(exist_ok=True)\n            shutil.move(dosya, hedef / dosya.name)\n    return plan\n',
      tests: 'import tempfile\nfrom pathlib import Path\ndef _alan(adlar):\n    kok = Path(tempfile.mkdtemp())\n    for ad in adlar:\n        (kok / ad).write_text("veri " + ad, encoding="utf-8")\n    return kok\ndef _dosyalar(kok):\n    return sorted(str(p.relative_to(kok)).replace("\\\\", "/") for p in kok.rglob("*") if p.is_file())\nkok = _alan(["b.csv", "A.PDF", "foto.jpg", "notlar"])\n(kok / "Eski").mkdir()\nbeklenen = [("A.PDF", "Belgeler"), ("b.csv", "Tablolar"), ("foto.jpg", "Görseller"), ("notlar", "Diğer")]\nplan = duzenle(kok)\nassert plan == beklenen, f"Plan yanlış: {plan}. Dosyalar ada göre sıralı olmalı, Eski klasörü plana girmemeli"\nassert _dosyalar(kok) == ["A.PDF", "b.csv", "foto.jpg", "notlar"], "dry_run=True iken hiçbir dosya taşınmamalı"\nassert duzenle(kok, dry_run=False) == beklenen\nassert _dosyalar(kok) == ["Belgeler/A.PDF", "Diğer/notlar", "Görseller/foto.jpg", "Tablolar/b.csv"], f"Taşıma sonrası: {_dosyalar(kok)}"\nassert duzenle(kok) == [], "Kökte dosya kalmadıysa plan boş olmalı (betik idempotent)"\n',
      hints: [
        'Klasörleri elemek için is_file() kullan.',
        'Plan her durumda dolmalı; taşıma yalnızca if not dry_run: bloğunda olmalı.',
        'hedef = kok / kategori; hedef.mkdir(exist_ok=True); shutil.move(dosya, hedef / dosya.name)'
      ],
      why: 'Plan her iki modda da aynı üretilir; tek fark yan etkinin uygulanıp uygulanmamasıdır. Bu sayede dry-run çıktısı gerçek çalıştırmanın birebir önizlemesi olur. İkinci çağrının boş plan döndürmesi betiğin güvenle tekrar çalıştırılabildiğini gösterir.' },
    { id: 'ofis-otomasyon-10',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p><code>rapor_epostasi(alicilar, konu, govde, ekler)</code> fonksiyonunu tamamla. Bir <code>EmailMessage</code> döndürsün:</p><ul><li>From: <code>rapor@anadolumarket.com.tr</code></li><li>To: alıcılar <code>", "</code> ile birleştirilmiş</li><li>Subject: <code>konu</code>, düz metin gövde: <code>govde</code></li><li><code>ekler</code> bir sözlük: dosya adı → CSV metni. Her biri <code>subtype="csv"</code> ile ek olarak eklensin.</li></ul>',
      guide: [
        'EmailMessage() oluştur.',
        'msg["From"], msg["To"], msg["Subject"] başlıklarını ata; To için ", ".join kullan.',
        'set_content(govde) ile gövdeyi koy.',
        'ekler.items() üzerinde dönüp add_attachment(icerik, subtype="csv", filename=ad) çağır.',
        'Mesajı döndür.'
      ],
      example: 'from email.message import EmailMessage\n\nm = EmailMessage()\nm["From"] = "ik@anadolubank.com.tr"\nm["To"] = "personel@anadolubank.com.tr"\nm["Subject"] = "Bordro"\nm.set_content("Bordronuz ektedir.")\nm.add_attachment("ad,net\\nAyşe,42000\\n", subtype="csv", filename="bordro.csv")\nprint(m["Subject"], [p.get_filename() for p in m.iter_attachments()])\n',
      start: 'from email.message import EmailMessage\n\ndef rapor_epostasi(alicilar, konu, govde, ekler):\n    msg = EmailMessage()\n    # TODO: From, To ve Subject başlıklarını ata\n    # TODO: düz metin gövdeyi ekle\n    # TODO: her CSV ekini ekle\n    return msg\n',
      sol: 'from email.message import EmailMessage\n\ndef rapor_epostasi(alicilar, konu, govde, ekler):\n    msg = EmailMessage()\n    msg["From"] = "rapor@anadolumarket.com.tr"\n    msg["To"] = ", ".join(alicilar)\n    msg["Subject"] = konu\n    msg.set_content(govde)\n    for ad, icerik in ekler.items():\n        msg.add_attachment(icerik, subtype="csv", filename=ad)\n    return msg\n',
      tests: 'm = rapor_epostasi(["mudur@anadolumarket.com.tr", "finans@anadolumarket.com.tr"], "Haftalık özet", "Rapor ektedir.", {"ozet.csv": "magaza,ciro\\nKadıköy,100\\n", "iade.csv": "urun,adet\\nÇay,2\\n"})\nassert m["From"] == "rapor@anadolumarket.com.tr", "Gönderen adresi rapor@anadolumarket.com.tr olmalı"\nassert m["To"] == "mudur@anadolumarket.com.tr, finans@anadolumarket.com.tr", "Alıcılar virgül ve boşlukla birleşmeli"\nassert m["Subject"] == "Haftalık özet"\nassert m.get_body(("plain",)).get_content().strip() == "Rapor ektedir.", "Düz metin gövde set_content ile eklenmeli"\nekler = {p.get_filename(): p.get_content() for p in m.iter_attachments()}\nassert set(ekler) == {"ozet.csv", "iade.csv"}, f"İki ek bekleniyordu, gelen: {list(ekler)}"\nassert "Kadıköy" in ekler["ozet.csv"], "Ek içeriği korunmalı"\nassert [p.get_content_type() for p in m.iter_attachments()] == ["text/csv", "text/csv"], "Ekler text/csv olmalı"\nbos = rapor_epostasi(["a@b.com"], "Ek yok", "Merhaba", {})\nassert bos.get_content_type() == "text/plain", "Ek yoksa mesaj tek parçalı kalmalı"\n',
      hints: ['Başlıklar sözlük gibi atanır: msg["Subject"] = konu.', '", ".join(alicilar) ve msg.set_content(govde).', 'for ad, icerik in ekler.items(): msg.add_attachment(icerik, subtype="csv", filename=ad)'],
      why: 'EmailMessage başlıkları, gövdeyi ve ekleri doğru MIME yapısına kendisi çevirir. Gönderim (smtplib) ayrı bir adım olduğu için mesaj oluşturan fonksiyon ağsız ve kolayca test edilebilir kalır.' },
    { id: 'ofis-otomasyon-11',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p><code>guvenli_ad(ad)</code> fonksiyonunu yaz. Dosya adını arşive uygun hale getirsin:</p><ul><li>Türkçe karakterler ASCII\'ye çevrilsin (ç→c, ğ→g, ı/İ→i, ö→o, ş→s, ü→u), gövde küçük harf olsun.</li><li>Boşluk ve tire <code>_</code> olsun; harf, rakam ve <code>_</code> dışındaki karakterler silinsin; ardışık <code>_</code> teke insin; baştaki/sondaki <code>_</code> atılsın.</li><li>Uzantı korunsun ama küçük harfe çevrilsin.</li></ul><p>Örnek: <code>"Şubat Satış Raporu (Son).XLSX"</code> → <code>"subat_satis_raporu_son.xlsx"</code></p>',
      start: 'from pathlib import Path\nimport re\n\ndef guvenli_ad(ad):\n    pass\n',
      sol: 'from pathlib import Path\nimport re\n\nTR = str.maketrans("çğıöşüÇĞİÖŞÜ", "cgiosuCGIOSU")\n\ndef guvenli_ad(ad):\n    p = Path(ad)\n    govde = p.stem.translate(TR).lower()\n    govde = re.sub(r"[\\s\\-]+", "_", govde)\n    govde = re.sub(r"[^a-z0-9_]", "", govde)\n    govde = re.sub(r"_+", "_", govde).strip("_")\n    return govde + p.suffix.lower()\n',
      tests: 'assert guvenli_ad("Şubat Satış Raporu (Son).XLSX") == "subat_satis_raporu_son.xlsx"\nassert guvenli_ad("İZMİR Şube - Ekim.pdf") == "izmir_sube_ekim.pdf", "İ harfi önce i\'ye çevrilmeli, sonra lower(); aksi halde noktalı i oluşur"\nassert guvenli_ad("  çiğ   köfte  .txt") == "cig_kofte.txt", "Baştaki/sondaki boşluklar ve ardışık alt çizgiler temizlenmeli"\nassert guvenli_ad("fatura#12!.PDF") == "fatura12.pdf", "Özel karakterler silinmeli"\nassert guvenli_ad("README") == "readme", "Uzantısız ad da çalışmalı"\n',
      hints: [
        'str.maketrans ile bir çeviri tablosu kur ve lower()\'dan ÖNCE translate uygula ("İ".lower() iki karakterdir).',
        'Path(ad).stem ve Path(ad).suffix ile gövde ve uzantıyı ayır; gövdeye re.sub uygula.',
        'Sıra: translate → lower → boşluk/tireyi _ yap → izinsizleri sil → _+ yerine _ → strip("_").'
      ],
      why: 'Dosya adlarındaki Türkçe karakter ve boşluklar farklı işletim sistemleri, zip araçları ve e-posta ekleri arasında bozulabilir. "İ".lower() Python\'da "i̇" (i + birleşik nokta) üretir; bu yüzden çeviri tablosu küçültmeden önce uygulanır.' },
    { id: 'ofis-otomasyon-12',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p><code>toplu_yeniden_adlandir(kok, onek, tarih, dry_run=False)</code> fonksiyonunu yaz. <code>kok</code> içindeki tüm PDF dosyalarını (uzantı büyük/küçük fark etmez) ada göre sıralı olarak <code>{onek}_{tarih}_{sıra:02d}.pdf</code> biçiminde yeniden adlandırsın (sıra 1\'den başlar). <code>(eski_ad, yeni_ad)</code> listesini döndürsün. <code>dry_run=True</code> ise yalnızca listeyi döndürsün, dosyalara dokunmasın. Diğer dosyalar olduğu gibi kalsın.</p><p>Örnek: <code>toplu_yeniden_adlandir(kok, "fatura", "20261026")</code> → <code>[("a.PDF", "fatura_20261026_01.pdf"), ...]</code></p>',
      start: 'from pathlib import Path\n\ndef toplu_yeniden_adlandir(kok, onek, tarih, dry_run=False):\n    pass\n',
      sol: 'from pathlib import Path\n\ndef toplu_yeniden_adlandir(kok, onek, tarih, dry_run=False):\n    kok = Path(kok)\n    pdfler = sorted(p for p in kok.iterdir() if p.is_file() and p.suffix.lower() == ".pdf")\n    sonuc = []\n    for sira, dosya in enumerate(pdfler, start=1):\n        yeni = f"{onek}_{tarih}_{sira:02d}.pdf"\n        sonuc.append((dosya.name, yeni))\n        if not dry_run:\n            dosya.rename(kok / yeni)\n    return sonuc\n',
      tests: 'import tempfile\nfrom pathlib import Path\ndef _alan(adlar):\n    kok = Path(tempfile.mkdtemp())\n    for ad in adlar:\n        (kok / ad).write_text("veri " + ad, encoding="utf-8")\n    return kok\ndef _dosyalar(kok):\n    return sorted(str(p.relative_to(kok)).replace("\\\\", "/") for p in kok.rglob("*") if p.is_file())\nkok = _alan(["c.pdf", "a.PDF", "b.Pdf", "liste.csv"])\nplan = toplu_yeniden_adlandir(kok, "fatura", "20261026", dry_run=True)\nassert plan == [("a.PDF", "fatura_20261026_01.pdf"), ("b.Pdf", "fatura_20261026_02.pdf"), ("c.pdf", "fatura_20261026_03.pdf")], f"Plan: {plan}"\nassert _dosyalar(kok) == ["a.PDF", "b.Pdf", "c.pdf", "liste.csv"], "dry_run iken dosya adı değişmemeli"\ntoplu_yeniden_adlandir(kok, "fatura", "20261026")\nassert _dosyalar(kok) == ["fatura_20261026_01.pdf", "fatura_20261026_02.pdf", "fatura_20261026_03.pdf", "liste.csv"], f"Sonuç: {_dosyalar(kok)}"\nassert (kok / "fatura_20261026_01.pdf").read_text(encoding="utf-8") == "veri a.PDF", "İçerik korunmalı: ilk dosya a.PDF idi"\n',
      hints: [
        'Önce listeyi çıkar (sorted ile), sonra yeniden adlandır: döngü içinde klasör değişirken iterdir kullanma.',
        'p.suffix.lower() == ".pdf" ve enumerate(..., start=1).',
        'dosya.rename(kok / yeni) dosyayı aynı klasörde yeni ada taşır.'
      ],
      why: 'Listeyi rename\'den önce sabitlemek, yeni adlandırılan dosyanın tekrar yakalanmasını önler. Sıfır dolgulu sıra numarası (01, 02 ... 10) dosya gezgininde doğru sıralanır.' },
    { id: 'ofis-otomasyon-13',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p><code>yedek_al(kaynak, yedek_kok, an)</code> fonksiyonunu yaz. <code>kaynak</code> klasörünün tamamını <code>yedek_kok/&lt;kaynak_adı&gt;_&lt;YYYYMMDD_HHMM&gt;</code> klasörüne kopyalasın (alt klasörler dahil) ve oluşan yedek klasörün <code>Path</code>\'ini döndürsün. <code>yedek_kok</code> yoksa oluşturulsun. <code>an</code> bir <code>datetime</code>\'dır.</p><p>Örnek: kaynak <code>Muhasebe</code>, an 2026-10-26 18:05 → <code>Muhasebe_20261026_1805</code></p>',
      start: 'import shutil\nfrom pathlib import Path\n\ndef yedek_al(kaynak, yedek_kok, an):\n    pass\n',
      sol: 'import shutil\nfrom pathlib import Path\n\ndef yedek_al(kaynak, yedek_kok, an):\n    kaynak, yedek_kok = Path(kaynak), Path(yedek_kok)\n    yedek_kok.mkdir(parents=True, exist_ok=True)\n    hedef = yedek_kok / f"{kaynak.name}_{an:%Y%m%d_%H%M}"\n    shutil.copytree(kaynak, hedef)\n    return hedef\n',
      tests: 'import tempfile\nfrom datetime import datetime\nalan = Path(tempfile.mkdtemp())\nk = alan / "Muhasebe"\n(k / "Ekim").mkdir(parents=True)\n(k / "ozet.csv").write_text("toplam\\n100\\n")\n(k / "Ekim" / "f1.pdf").write_text("pdf")\ny = yedek_al(k, alan / "Yedekler" / "2026", datetime(2026, 10, 26, 18, 5))\nassert isinstance(y, Path), "Yedek klasörün Path nesnesi döndürülmeli"\nassert y.name == "Muhasebe_20261026_1805", f"Yedek adı: {y.name}"\nassert (y / "Ekim" / "f1.pdf").read_text() == "pdf", "Alt klasörler de kopyalanmalı (copytree)"\nassert (k / "ozet.csv").exists(), "Kaynak yerinde kalmalı: yedek kopyalar, taşımaz"\ntry:\n    yedek_al(k, alan / "Yedekler" / "2026", datetime(2026, 10, 26, 18, 5))\n    assert False, "Aynı dakikada ikinci yedek mevcut yedeği ezmemeli; FileExistsError beklenir"\nexcept FileExistsError:\n    pass\n',
      hints: [
        'Yedek kök için mkdir(parents=True, exist_ok=True).',
        'f-string içinde datetime biçimi: f"{an:%Y%m%d_%H%M}".',
        'shutil.copytree(kaynak, hedef) hedef varsa zaten FileExistsError verir; bunu yakalama, yukarı geçsin.'
      ],
      why: 'copytree hedef klasör varsa hata verir; bu davranış istemeden yedek ezilmesini önleyen bir emniyettir. Zaman damgası dakikaya kadar inerse aynı gün birden fazla yedek çakışmadan alınabilir.' },
    { id: 'ofis-otomasyon-14',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p><code>eski_yedekleri_temizle(yedek_kok, tut=3, dry_run=False)</code> fonksiyonunu yaz. <code>yedek_kok</code> içindeki alt klasörleri (ad sırası = tarih sırası) sıralasın, en yeni <code>tut</code> tanesi dışındakileri silsin (<code>shutil.rmtree</code>) ve silinen klasör adlarını sıralı liste olarak döndürsün. <code>dry_run=True</code> ise silmeden aynı listeyi döndürsün. Kökteki düz dosyalara dokunmasın.</p>',
      start: 'import shutil\nfrom pathlib import Path\n\ndef eski_yedekleri_temizle(yedek_kok, tut=3, dry_run=False):\n    pass\n',
      sol: 'import shutil\nfrom pathlib import Path\n\ndef eski_yedekleri_temizle(yedek_kok, tut=3, dry_run=False):\n    klasorler = sorted(p for p in Path(yedek_kok).iterdir() if p.is_dir())\n    silinecek = klasorler[:-tut] if tut > 0 else klasorler\n    if not dry_run:\n        for p in silinecek:\n            shutil.rmtree(p)\n    return [p.name for p in silinecek]\n',
      tests: 'import tempfile\nkok = Path(tempfile.mkdtemp())\nfor g in ["20261020", "20261024", "20261021", "20261023", "20261022"]:\n    (kok / f"Muhasebe_{g}_1800").mkdir()\n(kok / "okubeni.txt").write_text("dokunma")\nassert eski_yedekleri_temizle(kok, tut=3, dry_run=True) == ["Muhasebe_20261020_1800", "Muhasebe_20261021_1800"], "En eski iki yedek silinecek olarak listelenmeli"\nassert len([p for p in kok.iterdir() if p.is_dir()]) == 5, "dry_run iken hiçbir şey silinmemeli"\nassert eski_yedekleri_temizle(kok, tut=3) == ["Muhasebe_20261020_1800", "Muhasebe_20261021_1800"]\nassert sorted(p.name for p in kok.iterdir()) == ["Muhasebe_20261022_1800", "Muhasebe_20261023_1800", "Muhasebe_20261024_1800", "okubeni.txt"], "En yeni 3 yedek ve düz dosya kalmalı"\nassert eski_yedekleri_temizle(kok, tut=5) == [], "Yedek sayısı tut değerinden azsa hiçbir şey silinmemeli"\nassert eski_yedekleri_temizle(kok, tut=0, dry_run=True) == ["Muhasebe_20261022_1800", "Muhasebe_20261023_1800", "Muhasebe_20261024_1800"], "tut=0 hepsini silmeli; dikkat: liste[:-0] boş listedir"\n',
      hints: [
        'Yalnızca klasörler: is_dir(). sorted ile eskiden yeniye sırala.',
        'Silinecekler: liste[:-tut]. Ama tut=0 olursa [:-0] == [:0] boş döner; bu durumu ayrıca ele al.',
        'dry_run kontrolünü yalnızca rmtree çağrısının etrafına koy.'
      ],
      why: 'Zaman damgası YYYYMMDD olduğu için alfabetik sıra kronolojik sıradır. liste[:-0] tuzağı gerçek bir kenar durumdur: Python\'da -0 sıfırdır, dilim boş liste verir ve "hepsini sil" isteği sessizce hiçbir şey yapmaz.' },
    { id: 'ofis-otomasyon-15',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Bu fonksiyon kökteki tüm PDF\'leri <code>PDF</code> alt klasörüne taşımalı ve taşınan adların sıralı listesini döndürmeli. Ama <code>B.PDF</code> taşınmıyor, iki PDF olunca da çöküyor. <b>Hataları bul ve düzelt.</b></p>',
      start: 'import shutil\nfrom pathlib import Path\n\ndef pdfleri_topla(kok):\n    kok = Path(kok)\n    tasinan = []\n    for dosya in kok.iterdir():\n        if dosya.suffix == ".pdf":\n            hedef = kok / "PDF"\n            hedef.mkdir()\n            shutil.move(dosya, hedef / dosya.name)\n            tasinan.append(dosya.name)\n    return sorted(tasinan)\n',
      sol: 'import shutil\nfrom pathlib import Path\n\ndef pdfleri_topla(kok):\n    kok = Path(kok)\n    hedef = kok / "PDF"\n    tasinan = []\n    for dosya in sorted(kok.iterdir()):\n        if dosya.is_file() and dosya.suffix.lower() == ".pdf":\n            hedef.mkdir(exist_ok=True)\n            shutil.move(dosya, hedef / dosya.name)\n            tasinan.append(dosya.name)\n    return sorted(tasinan)\n',
      tests: 'import tempfile\nfrom pathlib import Path\ndef _alan(adlar):\n    kok = Path(tempfile.mkdtemp())\n    for ad in adlar:\n        (kok / ad).write_text("veri " + ad, encoding="utf-8")\n    return kok\ndef _dosyalar(kok):\n    return sorted(str(p.relative_to(kok)).replace("\\\\", "/") for p in kok.rglob("*") if p.is_file())\nkok = _alan(["a.pdf", "B.PDF", "c.txt", "d.pdf"])\nassert pdfleri_topla(kok) == ["B.PDF", "a.pdf", "d.pdf"], "Büyük harfli uzantılı B.PDF de taşınmalı"\nassert _dosyalar(kok) == ["PDF/B.PDF", "PDF/a.pdf", "PDF/d.pdf", "c.txt"], f"Sonuç: {_dosyalar(kok)}"\nassert pdfleri_topla(kok) == [], "İkinci çalıştırma hata vermemeli ve boş liste döndürmeli"\n',
      hints: ['İki hata var: uzantı karşılaştırması ve mkdir.', '.suffix.lower() kullan; mkdir(exist_ok=True) yaz.', 'Ek güvenlik: kok.iterdir() yerine sorted(kok.iterdir()) ile listeyi döngüden önce sabitle.'],
      why: 'suffix büyük-küçük harfe duyarlıdır. mkdir() klasör varken FileExistsError fırlatır; exist_ok=True bunu engeller. Üzerinde döndüğün klasörü değiştirirken listeyi önceden sabitlemek de iyi bir alışkanlıktır.' },
    { id: 'ofis-otomasyon-16',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Klasör izleyici iki anlık görüntüyü (ad → (boyut, zaman)) karşılaştırıp <code>{"eklenen": [...], "silinen": [...], "degisen": [...]}</code> döndürmeli (listeler sıralı). Ama eklenen ve silinen ters çıkıyor, bir dosya silinince de <code>KeyError</code> veriyor. <b>Hataları bul ve düzelt.</b></p>',
      start: 'def degisiklikleri_bul(once, sonra):\n    eklenen = sorted(set(once) - set(sonra))\n    silinen = sorted(set(sonra) - set(once))\n    degisen = sorted(ad for ad in once if once[ad] != sonra[ad])\n    return {"eklenen": eklenen, "silinen": silinen, "degisen": degisen}\n',
      sol: 'def degisiklikleri_bul(once, sonra):\n    eklenen = sorted(set(sonra) - set(once))\n    silinen = sorted(set(once) - set(sonra))\n    degisen = sorted(ad for ad in set(once) & set(sonra) if once[ad] != sonra[ad])\n    return {"eklenen": eklenen, "silinen": silinen, "degisen": degisen}\n',
      tests: 'once = {"a.pdf": (120, 1000), "b.csv": (40, 1000), "c.txt": (5, 900)}\nsonra = {"a.pdf": (150, 1060), "c.txt": (5, 900), "d.jpg": (900, 1061)}\nr = degisiklikleri_bul(once, sonra)\nassert r["eklenen"] == ["d.jpg"], "Eklenen: sonrada olup öncede olmayan"\nassert r["silinen"] == ["b.csv"], "Silinen: öncede olup sonrada olmayan"\nassert r["degisen"] == ["a.pdf"], "Değişen yalnızca iki görüntüde de olan ve değeri farklı olan dosyalar"\nassert degisiklikleri_bul({}, {}) == {"eklenen": [], "silinen": [], "degisen": []}\n',
      hints: ['Küme farkının yönü önemli: A - B, A\'da olup B\'de olmayanlardır.', 'Değişen dosyaları ararken yalnızca iki tarafta da var olan adlara bak.', 'set(once) & set(sonra) kesişimi üzerinde dön.'],
      why: 'Fark işlemi yön bağımlıdır: yeni eklenen dosya "sonra - önce"dir. Silinen dosya sonra sözlüğünde olmadığı için sonra[ad] KeyError verir; karşılaştırmayı kesişimle sınırlamak gerekir.' },
    { id: 'ofis-otomasyon-17',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Zamanlayıcının kalbini yaz: <code>cron_eslesir(ifade, an)</code>, beş alanlı cron ifadesinin (<code>dakika saat gün ay haftagünü</code>) verilen <code>datetime</code> ile eşleşip eşleşmediğini döndürsün.</p><ul><li>Her alan: <code>*</code>, tek sayı (<code>8</code>), liste (<code>8,12</code>), aralık (<code>1-5</code>), adım (<code>*/15</code> ya da <code>9-17/2</code>) ve bunların virgülle karışımı olabilir.</li><li>Haftagünü: 0 ve 7 pazar, 1 pazartesi ... 6 cumartesi.</li><li>Gerçek cron kuralı: gün ve haftagünü alanlarının <b>ikisi de</b> <code>*</code> değilse, ikisinden <b>biri</b> tutması yeterlidir; aksi halde tüm alanlar tutmalıdır.</li></ul>',
      start: 'from datetime import datetime\n\ndef cron_eslesir(ifade, an):\n    pass\n',
      sol: 'from datetime import datetime\n\ndef alan_eslesir(alan, deger, en_kucuk, en_buyuk):\n    for parca in alan.split(","):\n        adim = 1\n        if "/" in parca:\n            parca, adim_metni = parca.split("/")\n            adim = int(adim_metni)\n        if parca == "*":\n            bas, son = en_kucuk, en_buyuk\n        elif "-" in parca:\n            bas, son = map(int, parca.split("-"))\n        else:\n            bas = son = int(parca)\n        if bas <= deger <= son and (deger - bas) % adim == 0:\n            return True\n    return False\n\ndef cron_eslesir(ifade, an):\n    dk, sa, gun, ay, hg = ifade.split()\n    haftagunu = an.isoweekday() % 7\n    temel = (alan_eslesir(dk, an.minute, 0, 59)\n             and alan_eslesir(sa, an.hour, 0, 23)\n             and alan_eslesir(ay, an.month, 1, 12))\n    gun_ok = alan_eslesir(gun, an.day, 1, 31)\n    hg_ok = alan_eslesir(hg, haftagunu, 0, 6) or (haftagunu == 0 and alan_eslesir(hg, 7, 0, 7))\n    if gun != "*" and hg != "*":\n        return temel and (gun_ok or hg_ok)\n    return temel and gun_ok and hg_ok\n',
      tests: 'D = datetime\nassert cron_eslesir("30 8 * * 1", D(2026, 10, 26, 8, 30)) is True, "26 Ekim 2026 pazartesi, 08:30 eşleşmeli"\nassert cron_eslesir("30 8 * * 1", D(2026, 10, 26, 8, 31)) is False\nassert cron_eslesir("30 8 * * 1", D(2026, 10, 27, 8, 30)) is False, "Salı eşleşmemeli"\nassert cron_eslesir("*/15 9-17 * * 1-5", D(2026, 10, 26, 10, 45)) is True, "*/15: 0,15,30,45"\nassert cron_eslesir("*/15 9-17 * * 1-5", D(2026, 10, 26, 10, 50)) is False\nassert cron_eslesir("*/15 9-17 * * 1-5", D(2026, 10, 31, 10, 45)) is False, "Cumartesi (6) 1-5 aralığında değil"\nassert cron_eslesir("*/15 9-17 * * 1-5", D(2026, 10, 26, 18, 0)) is False\nassert cron_eslesir("0 9-17/4 * * *", D(2026, 10, 26, 13, 0)) is True, "9-17/4: 9, 13, 17"\nassert cron_eslesir("0 9-17/4 * * *", D(2026, 10, 26, 11, 0)) is False\nassert cron_eslesir("0 0 1 * *", D(2026, 11, 1, 0, 0)) is True\nassert cron_eslesir("0 8,12 * * *", D(2026, 10, 26, 12, 0)) is True\nassert cron_eslesir("0 9 * * 7", D(2026, 10, 25, 9, 0)) is True, "7 de pazar demek"\nassert cron_eslesir("0 9 * * 0", D(2026, 10, 25, 9, 0)) is True, "0 pazar demek"\nassert cron_eslesir("0 9 1 * 1", D(2026, 10, 26, 9, 0)) is True, "Gün ve haftagünü ikisi de kısıtlıysa biri yeter (pazartesi)"\nassert cron_eslesir("0 9 1 * 1", D(2026, 10, 1, 9, 0)) is True, "Ayın 1\'i (perşembe) da eşleşmeli"\nassert cron_eslesir("0 9 1 * 1", D(2026, 10, 27, 9, 0)) is False\nassert cron_eslesir("0 9 1 * *", D(2026, 10, 26, 9, 0)) is False, "Haftagünü * iken yalnız gün belirleyici"\n',
      hints: [
        'Her alanı ayrı bir yardımcı fonksiyonla değerlendir: alan_eslesir(alan, deger, en_kucuk, en_buyuk).',
        'Bir parçayı önce "/" ile adım, sonra "-" ile aralık olarak ayrıştır; "*" tüm aralık demektir. Eşleşme: bas <= deger <= son ve (deger - bas) % adim == 0.',
        'Python\'da isoweekday() pazartesi=1 ... pazar=7 verir; % 7 ile cron düzenine (pazar=0) çevir.'
      ],
      why: 'Her alanı aynı küçük ayrıştırıcıyla değerlendirmek kodu sade tutar. Adımı aralığın başından saymak (9-17/4 → 9, 13, 17) cron\'un davranışıdır. Gün/haftagünü VEYA kuralı cron\'un en çok şaşırtan kenar durumudur; zamanlanmış görevlerin "neden bugün çalıştı?" sorusunun cevabı genelde budur.' },
    { id: 'ofis-otomasyon-18',
      t: 'code',
      stage: 'Mini proje',
      diff: 3,
      q: '<p><b>Gelen kutusu otomasyonu.</b> <code>kategori_bul</code> ve <code>guvenli_ad</code> hazır verildi. İki fonksiyon yaz:</p><ol><li><code>gelen_kutusu_isle(kok, an, dry_run=True)</code>: <code>kok</code>\'teki her dosyayı (ada göre sıralı) <code>kok/&lt;kategori&gt;/&lt;YYYYMMDD&gt;_&lt;guvenli_ad&gt;</code> yoluna taşısın. Hedef zaten varsa taşımasın, atlasın. Bir sözlük döndürsün:<ul><li><code>"log"</code>: her dosya için bir satır: <code>"TAŞI eski -&gt; Kategori/yeni"</code> ya da <code>"ATLA eski (hedef var)"</code>; dry_run ise her satırın başında <code>"[DRY-RUN] "</code></li><li><code>"islemler"</code>: gerçekten yapılan taşımaların <code>(eski_ad, "Kategori/yeni")</code> listesi (dry_run\'da boş)</li><li><code>"tasinan"</code> ve <code>"atlanan"</code> sayıları (dry_run\'da tasinan, taşınacak dosya sayısıdır)</li></ul></li><li><code>geri_al(kok, islemler)</code>: işlemleri ters sırayla geri alıp dosyaları eski adlarıyla köke döndürsün; geri alınan dosya sayısını döndürsün.</li></ol>',
      start: 'from pathlib import Path\n\nKATEGORILER = {\n    "Belgeler": {".pdf", ".docx", ".txt"},\n    "Tablolar": {".xlsx", ".csv"},\n    "Görseller": {".jpg", ".jpeg", ".png"},\n}\n\ndef kategori_bul(dosya_adi):\n    uzanti = Path(dosya_adi).suffix.lower()\n    for kategori, uzantilar in KATEGORILER.items():\n        if uzanti in uzantilar:\n            return kategori\n    return "Diğer"\nimport re\n\nTR = str.maketrans("çğıöşüÇĞİÖŞÜ", "cgiosuCGIOSU")\n\ndef guvenli_ad(ad):\n    p = Path(ad)\n    govde = p.stem.translate(TR).lower()\n    govde = re.sub(r"[\\s\\-]+", "_", govde)\n    govde = re.sub(r"[^a-z0-9_]", "", govde)\n    govde = re.sub(r"_+", "_", govde).strip("_")\n    return govde + p.suffix.lower()\n\nimport shutil\n\ndef gelen_kutusu_isle(kok, an, dry_run=True):\n    pass\n\ndef geri_al(kok, islemler):\n    pass\n',
      sol: 'from pathlib import Path\n\nKATEGORILER = {\n    "Belgeler": {".pdf", ".docx", ".txt"},\n    "Tablolar": {".xlsx", ".csv"},\n    "Görseller": {".jpg", ".jpeg", ".png"},\n}\n\ndef kategori_bul(dosya_adi):\n    uzanti = Path(dosya_adi).suffix.lower()\n    for kategori, uzantilar in KATEGORILER.items():\n        if uzanti in uzantilar:\n            return kategori\n    return "Diğer"\nimport re\n\nTR = str.maketrans("çğıöşüÇĞİÖŞÜ", "cgiosuCGIOSU")\n\ndef guvenli_ad(ad):\n    p = Path(ad)\n    govde = p.stem.translate(TR).lower()\n    govde = re.sub(r"[\\s\\-]+", "_", govde)\n    govde = re.sub(r"[^a-z0-9_]", "", govde)\n    govde = re.sub(r"_+", "_", govde).strip("_")\n    return govde + p.suffix.lower()\n\nimport shutil\n\ndef gelen_kutusu_isle(kok, an, dry_run=True):\n    kok = Path(kok)\n    sonuc = {"log": [], "islemler": [], "tasinan": 0, "atlanan": 0}\n    on = "[DRY-RUN] " if dry_run else ""\n    for dosya in sorted(p for p in kok.iterdir() if p.is_file()):\n        kategori = kategori_bul(dosya.name)\n        yeni = f"{an:%Y%m%d}_{guvenli_ad(dosya.name)}"\n        hedef = kok / kategori / yeni\n        if hedef.exists():\n            sonuc["atlanan"] += 1\n            sonuc["log"].append(f"{on}ATLA {dosya.name} (hedef var)")\n            continue\n        sonuc["tasinan"] += 1\n        sonuc["log"].append(f"{on}TAŞI {dosya.name} -> {kategori}/{yeni}")\n        if not dry_run:\n            hedef.parent.mkdir(exist_ok=True)\n            shutil.move(dosya, hedef)\n            sonuc["islemler"].append((dosya.name, f"{kategori}/{yeni}"))\n    return sonuc\n\ndef geri_al(kok, islemler):\n    kok = Path(kok)\n    for eski, yeni in reversed(islemler):\n        shutil.move(kok / yeni, kok / eski)\n    return len(islemler)\n',
      tests: 'import tempfile\nfrom pathlib import Path\ndef _alan(adlar):\n    kok = Path(tempfile.mkdtemp())\n    for ad in adlar:\n        (kok / ad).write_text("veri " + ad, encoding="utf-8")\n    return kok\ndef _dosyalar(kok):\n    return sorted(str(p.relative_to(kok)).replace("\\\\", "/") for p in kok.rglob("*") if p.is_file())\nfrom datetime import datetime\nan = datetime(2026, 10, 26, 9, 0)\nkok = _alan(["Fatura Ekim.PDF", "Satış Özeti.csv", "fiş 1.jpg"])\n(kok / "Belgeler").mkdir()\n(kok / "Belgeler" / "20261026_fatura_ekim.pdf").write_text("eski")\nr = gelen_kutusu_isle(kok, an)\nassert r["log"] == ["[DRY-RUN] ATLA Fatura Ekim.PDF (hedef var)", "[DRY-RUN] TAŞI Satış Özeti.csv -> Tablolar/20261026_satis_ozeti.csv", "[DRY-RUN] TAŞI fiş 1.jpg -> Görseller/20261026_fis_1.jpg"], f"Dry-run logu: {r[\'log\']}"\nassert r["islemler"] == [] and r["tasinan"] == 2 and r["atlanan"] == 1, "Dry-run\'da islemler boş, tasinan 2, atlanan 1"\nassert "Satış Özeti.csv" in _dosyalar(kok), "Dry-run dosyalara dokunmamalı"\nr = gelen_kutusu_isle(kok, an, dry_run=False)\nassert r["log"][1] == "TAŞI Satış Özeti.csv -> Tablolar/20261026_satis_ozeti.csv", "Gerçek çalıştırmada DRY-RUN öneki olmamalı"\nassert r["islemler"] == [("Satış Özeti.csv", "Tablolar/20261026_satis_ozeti.csv"), ("fiş 1.jpg", "Görseller/20261026_fis_1.jpg")]\nassert _dosyalar(kok) == ["Belgeler/20261026_fatura_ekim.pdf", "Fatura Ekim.PDF", "Görseller/20261026_fis_1.jpg", "Tablolar/20261026_satis_ozeti.csv"], f"Taşıma sonrası: {_dosyalar(kok)}"\nassert (kok / "Belgeler" / "20261026_fatura_ekim.pdf").read_text() == "eski", "Var olan hedefin üzerine yazılmamalı"\nassert geri_al(kok, r["islemler"]) == 2\nassert "Satış Özeti.csv" in _dosyalar(kok) and "fiş 1.jpg" in _dosyalar(kok), "Geri alma dosyaları eski adlarıyla köke döndürmeli"\n',
      hints: [
        'Önce hedef yolu hesapla: kok / kategori / f"{an:%Y%m%d}_{guvenli_ad(ad)}".',
        'hedef.exists() ise ATLA logu yaz ve continue; değilse TAŞI logu yaz, dry_run değilse klasörü oluştur, taşı ve islemler\'e ekle.',
        'geri_al: for eski, yeni in reversed(islemler): shutil.move(kok / yeni, kok / eski)'
      ],
      why: 'Bu küçük betik profesyonel otomasyonun tüm emniyet kemerlerini taşır: varsayılan dry-run, okunur log, çakışmada atlama (veri kaybı yok) ve geri alma günlüğü. islemler listesini JSON\'a yazarsan geri alma ertesi gün bile mümkündür.' }
  ],
  faq: [
    { q: 'shutil.move ile Path.rename arasındaki fark ne?',
      a: 'Path.rename aynı disk bölümü içinde adı değiştirir; farklı bir sürücüye taşımada hata verir ve Windows\'ta hedef varsa FileExistsError fırlatır. shutil.move gerekirse kopyalayıp siler, bu yüzden her durumda çalışır. Hedefin üzerine yazmamak için iki durumda da önce hedef.exists() kontrolü yap.' },
    { q: 'Otomasyonu cron ile mi yoksa schedule paketiyle mi zamanlamalıyım?',
      a: 'Sunucuda ya da sürekli açık bir makinede cron (Windows\'ta Görev Zamanlayıcı) tercih edilir: betik yalnızca gerektiğinde çalışır, çökerse bir sonraki tetikte yeniden başlar. schedule, betiğin zaten sürekli açık olduğu (ör. bir servis içinde) ya da işletim sistemi zamanlayıcısına erişimin olmadığı durumlar için uygundur.' },
    { q: 'E-postayı test ederken gerçekten göndermem gerekiyor mu?',
      a: 'Hayır. Mesajı bytes(msg) ile .eml dosyasına yaz ve e-posta istemcinde aç; ya da yerelde python -m aiosmtpd -n -l localhost:1025 gibi bir sahte SMTP sunucusu çalıştırıp smtplib.SMTP("localhost", 1025) ile gönder. Testlerde yalnızca başlıkları ve ekleri kontrol etmek çoğu zaman yeterlidir.' },
    { q: 'Excel dosyalarını da otomatikleştirebilir miyim?',
      a: 'Evet. Kendi bilgisayarında openpyxl (pip install openpyxl) hücre okuma-yazma ve biçimlendirme yapar; pandas read_excel/to_excel ile tabloyu toptan işler. Tarayıcı motorunda bu paketler çalışmadığı için bu derste CSV kullandık; mantık aynıdır.' },
    { q: 'Betik yanlış dosyaları taşırsa ne yapmalıyım?',
      a: 'Önce durdur, sonra geri alma günlüğünü (kaynak, hedef çiftleri) ters sırayla uygula. Bu yüzden her taşımayı log\'a ve bir günlük listesine yazmak zorunlu bir alışkanlıktır. Günlük yoksa yedekten geri dön; yedek de yoksa bir dahaki sefere varsayılan modu dry-run yap.' }
  ],
  mistakes: [
    { why: 'Windows ve tarayıcılardan gelen dosyalar sıkça büyük harfli uzantı taşır (.PDF, .JPG). Karşılaştırmadan önce küçük harfe çevir.',
      bad: 'if dosya.suffix == ".pdf":\n    ...',
      good: 'if dosya.suffix.lower() == ".pdf":\n    ...' },
    { why: 'mkdir ikinci turda FileExistsError verir; ayrıca üzerinde döndüğün klasörü değiştirmek beklenmedik sonuç doğurur. Klasörü bir kez oluştur, listeyi önceden çıkar.',
      bad: 'for dosya in kok.iterdir():\n    (kok / "PDF").mkdir()\n    shutil.move(dosya, kok / "PDF")',
      good: 'hedef = kok / "PDF"\nhedef.mkdir(exist_ok=True)\nfor dosya in sorted(kok.glob("*.pdf")):\n    shutil.move(dosya, hedef / dosya.name)' },
    { why: 'Koda yazılan şifre git geçmişine ve ekran paylaşımlarına girer. Ortam değişkeni ve uygulama şifresi kullan.',
      bad: 'sunucu.login("rapor@sirket.com", "Sifre123!")',
      good: 'sunucu.login(os.environ["SMTP_KULLANICI"], os.environ["SMTP_SIFRE"])' },
    { why: 'Hedefte aynı adlı dosya varsa üzerine yazılabilir ve eski dosya geri dönüşsüz kaybolur.',
      bad: 'shutil.move(kaynak, hedef)  # hedef var mı bakmadan',
      good: 'if hedef.exists():\n    log.warning("atlandı: %s", hedef)\nelse:\n    shutil.move(kaynak, hedef)' },
    { why: 'Gün-ay-yıl sırası adlara göre sıralamada kronolojiyi bozar ve aynı gün iki yedek çakışır. Yıl-ay-gün-saat biçimi hem sıralanır hem benzersizdir.',
      bad: 'yedek = f"yedek_{datetime.now():%d-%m-%Y}"',
      good: 'yedek = f"yedek_{datetime.now():%Y%m%d_%H%M}"' }
  ] }
);
})(window);
