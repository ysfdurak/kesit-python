/* PythonPatika — v2/o4: Web kazıma (orta / Otomasyon ve Araçlar) */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push({
  id: 'web-scraping',
  lv: 'orta',
  mod: 'Otomasyon ve Araçlar',
  min: 50,
  title: 'Web kazıma: HTML, BeautifulSoup ve etik',
  sum: 'HTML\'in ağaç yapısını okur; BeautifulSoup ile find, find_all ve CSS seçicilerle veri çıkarır, tablo ve sayfalamayı kazır, robots.txt, KVKK ve nezaket kurallarına uyan bir kazıyıcı kurarsın.',
  goals: [
    'HTML etiketini, özniteliği ve DOM ağacını tanıyıp aradığım verinin yolunu bulabilirim.',
    'BeautifulSoup ile find, find_all, select, get_text ve attrs kullanarak kart ve tablolardan veri çıkarabilirim.',
    'urllib.parse ile göreli bağlantıları mutlak adrese çevirip sayfalamayı güvenle takip edebilirim.',
    'robots.txt, kullanım koşulları, KVKK ve nezaket (gecikme, User-Agent) kurallarını uygulayabilirim.',
    'Statik ve dinamik sayfa farkını bilip gerektiğinde Playwright/Selenium\'a ya da resmi API\'ye yönelebilirim.'
  ],
  body: `
<h2>Neden önemli?</h2>
<p>Anadolu Market'in fiyatlama ekibi, kendi ürünlerinin tedarikçi kataloglarındaki liste fiyatlarını her sabah kontrol etmek istiyor. Tedarikçinin API'si yok; yalnızca herkese açık bir ürün kataloğu sayfası var. Bir çalışanın 300 ürünü tek tek açıp Excel'e yazması yarım gün sürer. Web kazıma (web scraping), bir web sayfasının HTML'ini programla okuyup içindeki yapılandırılmış veriyi (ürün adı, fiyat, stok) çıkarmaktır.</p>
<p>Kazıma güçlü ama hassas bir araçtır: başkasının sunucusuna yük bindirir, telif ve kişisel veri konularına dokunur. Bu yüzden derste teknik kadar <b>kural</b> da öğreneceksin. Altın kural: resmi bir API ya da veri dosyası varsa önce onu kullan; kazıma son çaredir.</p>

<h2>HTML'in yapısı: etiket, öznitelik, ağaç</h2>
<p>HTML, iç içe geçmiş <b>etiketlerden</b> (tag) oluşur. Her etiketin adı (<code>div</code>, <code>span</code>, <code>a</code>), <b>öznitelikleri</b> (attribute: <code>class</code>, <code>id</code>, <code>href</code>, <code>data-sku</code>) ve içeriği vardır. Tarayıcı bu metni bir ağaca, <b>DOM</b>'a (Document Object Model) çevirir: her etiket bir düğümdür, içindeki etiketler çocuklarıdır.</p>
<pre class="code">&lt;div class="urun" data-sku="AM-101"&gt;          ← ebeveyn düğüm, iki özniteliği var
  &lt;h3 class="ad"&gt;Çay Bardağı 6'lı&lt;/h3&gt;          ← çocuk: ürün adı
  &lt;span class="fiyat"&gt;149,90 TL&lt;/span&gt;          ← çocuk: fiyat metni
  &lt;a href="/urun/101"&gt;İncele&lt;/a&gt;             ← göreli bağlantı
&lt;/div&gt;</pre>
<p>Kazımanın ilk adımı tarayıcıda sayfaya sağ tıklayıp <b>İncele</b> (Inspect) demek ve aradığın verinin hangi etiket ve sınıfta durduğunu görmektir. Kararlı bir "yol" ararsın: <code>id</code> ve <code>data-*</code> öznitelikleri genelde tasarım değişikliklerinden en az etkilenenlerdir.</p>

<h2>Sayfayı çekmek: requests</h2>
<p>Gerçek kazıyıcıda HTML'i <code>requests</code> ile indirirsin. Tarayıcı motorunda ağ olmadığı için bu kodu kendi bilgisayarında dene; derste HTML'i metin olarak vereceğiz.</p>
<pre class="code">import requests

BASLIK = {"User-Agent": "AnadoluMarketFiyatBot/1.0 (veri@anadolumarket.example)"}
yanit = requests.get("https://tedarikci.example/katalog?sayfa=1", headers=BASLIK, timeout=10)
yanit.raise_for_status()                 # 4xx/5xx ise hata fırlat
yanit.encoding = yanit.apparent_encoding # Türkçe karakter sorunu varsa
html = yanit.text</pre>
<div class="note"><b>Kendi bilgisayarında dene</b>Kurulum: <code>pip install requests beautifulsoup4 lxml</code>. BeautifulSoup ve lxml tarayıcıda da çalışır; requests ile gerçek ağ isteği yalnızca kendi bilgisayarında çalışır. HTTP ayrıntılarını bir sonraki "HTTP ve REST API" dersinde göreceksin.</div>

<h2>BeautifulSoup: HTML'i ağaç olarak gezmek</h2>
<p><code>BeautifulSoup(html, "html.parser")</code> metni gezilebilir bir nesneye çevirir. İkinci argüman ayrıştırıcıdır (parser): <code>"html.parser"</code> Python ile gelir; <code>"lxml"</code> daha hızlıdır ve kurulum ister.</p>
<pre class="py">from bs4 import BeautifulSoup

html = """
&lt;div id="katalog"&gt;
  &lt;div class="urun" data-sku="AM-101"&gt;&lt;h3 class="ad"&gt; Çay Bardağı &lt;/h3&gt;&lt;span class="fiyat"&gt;149,90 TL&lt;/span&gt;&lt;/div&gt;
  &lt;div class="urun indirim" data-sku="AM-102"&gt;&lt;h3 class="ad"&gt;Demlik&lt;/h3&gt;&lt;span class="fiyat"&gt;1.299,00 TL&lt;/span&gt;&lt;/div&gt;
  &lt;div class="urun" data-sku="AM-103"&gt;&lt;h3 class="ad"&gt;Kupa&lt;/h3&gt;&lt;span class="tukendi"&gt;Stokta yok&lt;/span&gt;&lt;/div&gt;
&lt;/div&gt;
"""
soup = BeautifulSoup(html, "html.parser")
ilk = soup.find("div", class_="urun")          # ilk eşleşme ya da None
print(ilk["data-sku"], ilk.h3.get_text(strip=True))
kartlar = soup.find_all("div", class_="urun")  # tüm eşleşmeler (liste)
print(len(kartlar))
for kart in kartlar:
    fiyat = kart.find("span", class_="fiyat")
    print(kart.get("data-sku"), fiyat.get_text() if fiyat else "-")</pre>
<div class="tbl-wrap"><table>
<tr><th>Araç</th><th>Ne döndürür</th><th>Bulamazsa</th></tr>
<tr><td><code>find(ad, class_=..., attrs={...})</code></td><td>İlk eşleşen etiket</td><td><code>None</code></td></tr>
<tr><td><code>find_all(ad, ..., limit=n)</code></td><td>Tüm eşleşmeler (liste)</td><td><code>[]</code></td></tr>
<tr><td><code>select("css")</code> / <code>select_one("css")</code></td><td>CSS seçiciye uyan liste / ilk eleman</td><td><code>[]</code> / <code>None</code></td></tr>
<tr><td><code>etiket.get_text(strip=True)</code></td><td>İçteki tüm metin, kenar boşlukları atılmış</td><td>Boş metin</td></tr>
<tr><td><code>etiket["href"]</code> / <code>etiket.get("href")</code></td><td>Öznitelik değeri</td><td><code>KeyError</code> / <code>None</code></td></tr>
<tr><td><code>etiket.attrs</code></td><td>Tüm öznitelikler sözlüğü</td><td><code>{}</code></td></tr>
</table></div>
<div class="warn"><b>class bir Python anahtar sözcüğüdür</b><code>find("span", class="fiyat")</code> sözdizimi hatası verir; BeautifulSoup bu yüzden <code>class_</code> adını kullanır. Ayrıca <code>class</code> çok değerli bir özniteliktir: <code>kart["class"]</code> metin değil liste döner (<code>["urun", "indirim"]</code>).</div>

<h3>CSS seçiciler</h3>
<p><code>select</code> tarayıcıdaki CSS seçicilerini kullanır; karmaşık yolları tek satırda yazmanı sağlar.</p>
<div class="tbl-wrap"><table>
<tr><th>Seçici</th><th>Anlamı</th></tr>
<tr><td><code>div.urun</code></td><td>class'ı urun olan div</td></tr>
<tr><td><code>#katalog</code></td><td>id'si katalog olan etiket</td></tr>
<tr><td><code>div.urun.indirim</code></td><td>hem urun hem indirim sınıfı olan div</td></tr>
<tr><td><code>#katalog span.fiyat</code></td><td>katalog içindeki (her derinlikte) fiyat span'leri</td></tr>
<tr><td><code>div.urun &gt; h3</code></td><td>urun div'inin doğrudan çocuğu olan h3</td></tr>
<tr><td><code>a[href]</code>, <code>[data-sku="AM-102"]</code></td><td>özniteliği olan / değeri eşleşen etiket</td></tr>
<tr><td><code>a[href^="https"]</code>, <code>a[href$=".pdf"]</code></td><td>ile başlayan / ile biten değer</td></tr>
<tr><td><code>tr:nth-of-type(2)</code></td><td>türünün ikinci elemanı</td></tr>
</table></div>
<pre class="py">from bs4 import BeautifulSoup

html = """&lt;ul id="liste"&gt;
&lt;li class="urun" data-sku="AM-1"&gt;&lt;a href="/u/1"&gt;Kalem&lt;/a&gt; &lt;b&gt;12,50&lt;/b&gt;&lt;/li&gt;
&lt;li class="urun indirim" data-sku="AM-2"&gt;&lt;a href="/u/2"&gt;Defter&lt;/a&gt; &lt;b&gt;40,00&lt;/b&gt;&lt;/li&gt;
&lt;/ul&gt;"""
soup = BeautifulSoup(html, "html.parser")
print([a.get_text() for a in soup.select("#liste li.urun &gt; a")])
print(soup.select_one("li.indirim")["data-sku"])
print(soup.select_one('[data-sku="AM-1"] b').get_text())
li = soup.select_one("li.urun")
print(li.find_next_sibling("li")["data-sku"], li.parent["id"])</pre>
<p>Ağaçta gezinme için <code>.parent</code>, <code>.children</code>, <code>.find_next_sibling()</code>, <code>.find_parent()</code> kullanılır. Örneğin "Fiyat:" yazan bir etiketin hemen yanındaki değeri bulmak için önce etiketi bulur, sonra kardeşine geçersin.</p>

<h2>Tablo kazımak</h2>
<p>Belediye duyuruları, kur tabloları, sınav sonuçları gibi veriler çoğu zaman <code>&lt;table&gt;</code> içindedir. Kalıp hep aynıdır: başlıkları <code>th</code>'lerden al, her <code>tr</code> için <code>td</code> metinlerini topla, ikisini <code>zip</code> ile sözlüğe çevir.</p>
<pre class="py">from bs4 import BeautifulSoup

html = """&lt;table id="nobet"&gt;
&lt;tr&gt;&lt;th&gt;Eczane&lt;/th&gt;&lt;th&gt;İlçe&lt;/th&gt;&lt;th&gt;Telefon&lt;/th&gt;&lt;/tr&gt;
&lt;tr&gt;&lt;td&gt;Şifa&lt;/td&gt;&lt;td&gt;Konak&lt;/td&gt;&lt;td&gt;0232 000 00 01&lt;/td&gt;&lt;/tr&gt;
&lt;tr&gt;&lt;td&gt;Hayat&lt;/td&gt;&lt;td&gt;Bornova&lt;/td&gt;&lt;td&gt;0232 000 00 02&lt;/td&gt;&lt;/tr&gt;
&lt;/table&gt;"""
soup = BeautifulSoup(html, "html.parser")
tablo = soup.find("table", id="nobet")
basliklar = [th.get_text(strip=True) for th in tablo.find_all("th")]
kayitlar = []
for tr in tablo.find_all("tr")[1:]:
    hucreler = [td.get_text(strip=True) for td in tr.find_all("td")]
    kayitlar.append(dict(zip(basliklar, hucreler)))
print(kayitlar)</pre>
<p>Basit tablolar için <code>pandas.read_html(html)</code> tüm tabloları DataFrame listesi olarak tek satırda verir (arka planda lxml kullanır). Birleştirilmiş hücreli, iç içe karmaşık tablolarda ise elle ayrıştırma daha güvenilirdir.</p>

<h2>Bağlantılar ve sayfalama: urllib.parse</h2>
<p>Sayfadaki bağlantılar çoğu zaman <b>göreli</b>dir: <code>/urun/42</code>, <code>?sayfa=2</code>, <code>../kampanya</code>. İsteği atmak için bunları mevcut sayfanın adresiyle birleştirip <b>mutlak</b> adrese çevirmen gerekir. Bunu asla metin birleştirmeyle yapma; <code>urljoin</code> tüm kuralları bilir.</p>
<pre class="py">from urllib.parse import urljoin, urlparse, parse_qs, urlencode, urldefrag

sayfa = "https://tedarikci.example/katalog/mutfak/?sayfa=1"
for href in ["/urun/42", "?sayfa=2", "../banyo/", "detay.html#yorumlar", "https://baska.example/x"]:
    print(href, "→", urljoin(sayfa, href))

parca = urlparse("https://tedarikci.example/ara?q=çay+bardağı&amp;sayfa=3")
print(parca.netloc, parca.path, parse_qs(parca.query))
print(urlencode({"q": "çay bardağı", "sayfa": 4}))
print(urldefrag("https://tedarikci.example/u/1#yorum").url)</pre>
<p>Sayfalama (pagination) için iki yaygın yol vardır: "Sonraki" bağlantısını izlemek (<code>a[rel~=next]</code> ya da <code>a.sonraki</code>) veya sayfa numarasını sorgu parametresinde artırmak. Her iki durumda da <b>ziyaret edilenler kümesi</b> tut; aksi halde döngüye giren bir site seni sonsuza kadar meşgul eder. Bir de üst sınır koy: "en fazla 50 sayfa".</p>

<h2>lxml ve XPath</h2>
<p>lxml hem BeautifulSoup için hızlı bir ayrıştırıcıdır (<code>BeautifulSoup(html, "lxml")</code>) hem de kendi başına XPath sorgu dili sunar. Büyük sayfalarda belirgin hız farkı yaratır.</p>
<pre class="py">from lxml import html as lh

agac = lh.fromstring('&lt;div&gt;&lt;p class="fiyat"&gt;149,90&lt;/p&gt;&lt;p class="fiyat"&gt;89,00&lt;/p&gt;&lt;a href="/x"&gt;X&lt;/a&gt;&lt;/div&gt;')
print(agac.xpath('//p[@class="fiyat"]/text()'))
print(agac.xpath("//a/@href"))</pre>

<h2>Kurallar: robots.txt, kullanım koşulları, KVKK</h2>
<p>Teknik olarak kazıyabilmen, kazıyabileceğin anlamına gelmez. Bir kazıyıcıyı canlıya almadan önce şu soruları cevapla:</p>
<div class="tbl-wrap"><table>
<tr><th>Konu</th><th>Ne yapmalısın?</th></tr>
<tr><td>robots.txt</td><td>Sitenin kökündeki <code>/robots.txt</code> dosyasında senin kullanıcı ajanına kapalı (<code>Disallow</code>) yolları kazıma; <code>Crawl-delay</code> varsa uy.</td></tr>
<tr><td>Kullanım koşulları</td><td>Site otomatik erişimi yasaklıyorsa ya da veriyi ticari kullanıma kapatıyorsa hukuk ekibine danış; çoğu zaman izin ya da lisans gerekir.</td></tr>
<tr><td>Kişisel veri (KVKK)</td><td>Ad, telefon, e-posta, yorum yazarı gibi kişisel verileri toplama. Gerekliyse hukuki dayanak, aydınlatma ve saklama süresi şarttır; "herkese açık" olması serbestçe işlenebileceği anlamına gelmez.</td></tr>
<tr><td>Telif ve veri tabanı hakkı</td><td>Metin, görsel ve derlenmiş veri tabanları korunabilir; içeriği kopyalayıp yayımlamak yerine yalnızca gereken olgusal alanları (fiyat, stok) al.</td></tr>
<tr><td>Giriş gerektiren alanlar</td><td>Oturum açarak, CAPTCHA aşarak ya da erişim engelini dolanarak kazıma; bu hem sözleşme hem ceza hukuku riski taşır.</td></tr>
</table></div>
<p>Python, robots.txt'yi okumak için hazır bir modülle gelir. Dosyayı ağdan çekmek yerine metin olarak da verebilirsin:</p>
<pre class="py">from urllib.robotparser import RobotFileParser

robots = """User-agent: *
Disallow: /sepet/
Disallow: /hesap/
Crawl-delay: 2
"""
rp = RobotFileParser()
rp.parse(robots.splitlines())
for yol in ["/katalog?sayfa=1", "/sepet/ekle", "/hesap/siparisler"]:
    print(yol, rp.can_fetch("AnadoluBot", "https://tedarikci.example" + yol))
print("bekleme:", rp.crawl_delay("AnadoluBot"))</pre>

<h3>Nezaket kuralları</h3>
<ul>
<li><b>Yavaş ol:</b> istekler arasında en az 1–2 saniye bekle (<code>time.sleep</code>); <code>Crawl-delay</code> varsa daha uzun. Paralel istekle siteyi boğma.</li>
<li><b>Kendini tanıt:</b> açıklayıcı bir <code>User-Agent</code> ve iletişim adresi gönder; tarayıcı taklidi yapma.</li>
<li><b>Önbellekle:</b> aynı sayfayı gün içinde tekrar indirme; HTML'i diske kaydet, ayrıştırmayı oradan tekrarla.</li>
<li><b>Hataya saygı:</b> 429 ya da 503 alırsan dur, <code>Retry-After</code> kadar bekle; ısrar etme.</li>
<li><b>Gece çalış:</b> sitenin yoğun olmadığı saatlerde, gerektiği kadar sık.</li>
</ul>

<h2>Dinamik sayfalar: Playwright ve Selenium</h2>
<p>Bazı sitelerde HTML ilk geldiğinde ürünler yoktur; JavaScript sonradan bir API'den çekip sayfaya yerleştirir. <code>requests</code> JavaScript çalıştırmadığı için boş liste görürsün. İki seçenek vardır: tarayıcının <b>Ağ</b> (Network) sekmesinde sayfanın çağırdığı JSON adresini bulup onu kullanmak (çoğu zaman daha temiz ve hızlı), ya da gerçek bir tarayıcıyı programla sürmek.</p>
<pre class="code">from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    tarayici = p.chromium.launch(headless=True)
    sayfa = tarayici.new_page(user_agent="AnadoluMarketFiyatBot/1.0")
    sayfa.goto("https://tedarikci.example/katalog", timeout=15000)
    sayfa.wait_for_selector("div.urun")          # JavaScript ürünleri yükleyene kadar bekle
    html = sayfa.content()                        # sonra BeautifulSoup'a ver
    tarayici.close()</pre>
<div class="note"><b>Kendi bilgisayarında dene</b><code>pip install playwright</code> ve ardından <code>playwright install chromium</code>. Selenium alternatifi için <code>pip install selenium</code>. Tarayıcı sürmek yavaş ve kaynak yiyicidir; yalnızca gerçekten gerektiğinde kullan.</div>

<div class="note"><b>Gerçek işte</b>Bir perakende şirketinde fiyat izleme kazıyıcısı genelde şu biçimdedir: gece 03:00'te çalışan bir zamanlanmış görev, izin verilen tedarikçi sayfalarını robots.txt'yi denetleyerek ve 2 saniye arayla indirir, ham HTML'i tarihli klasöre kaydeder, ayrıştırıcı yalnızca SKU ve fiyatı çıkarır, önceki günle karşılaştırıp yalnızca değişenleri kategori yöneticisine raporlar. Ayrıştırıcı kaydedilmiş HTML örnekleriyle test edilir; site tasarımı değişip testler kırılınca ekip haberdar olur.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Kırılgan seçicilerden kaçın</h3>
<p><code>div &gt; div:nth-of-type(3) &gt; span</code> gibi konuma bağlı seçiciler ilk tasarım değişikliğinde kırılır. Sırasıyla tercih et: <code>id</code> ve <code>data-*</code> öznitelikleri, anlamlı sınıf adları, metin etiketleri ("Fiyat:" yazan hücrenin kardeşi). Seçicileri dosyanın başında sabit olarak topla; değişiklik tek yerde yapılır.</p>
<h3>Gizli yapılandırılmış veri: JSON-LD</h3>
<p>Birçok e-ticaret sayfası arama motorları için ürün bilgisini <code>&lt;script type="application/ld+json"&gt;</code> içinde JSON olarak verir. Bu veri görsel HTML'den çok daha kararlıdır: <code>json.loads(soup.find("script", type="application/ld+json").string)</code> ile ad, fiyat ve para birimini doğrudan alırsın.</p>
<h3>Test edilebilir kazıyıcı</h3>
<p>Ağ katmanını (indir) ve ayrıştırma katmanını (çöz) ayır. Ayrıştırıcı yalnızca HTML metni alan saf bir fonksiyon olsun; testlerde kaydedilmiş örnek sayfaları kullan. Bu derste alıştırmaların hepsi bu kalıpla kurulu: HTML metni girer, sözlük çıkar.</p>
<h3>Ölçek</h3>
<p>Yüzlerce siteyi düzenli kazıyacaksan Scrapy çerçevesi; istek kuyruğu, gecikme, yeniden deneme, robots.txt ve dışa aktarma işlerini hazır verir. Ama kurallar aynı kalır: izin, nezaket, minimum veri.</p>
</section>
`,
  ex: [
    { t: 'mc', stage: 'Isınma',
      q: '<code>soup.select("div.urun &gt; span.fiyat")</code> neyi seçer?',
      o: ['urun sınıflı div içindeki her derinlikteki tüm span\'leri', 'urun sınıflı div\'in doğrudan çocuğu olan, fiyat sınıflı span\'leri', 'Yalnızca ilk eşleşen fiyat span\'ini', 'fiyat sınıflı span\'lerin içindeki div\'leri'], a: 1,
      why: '> doğrudan çocuk bağlacıdır; nokta sınıf seçer. Her derinlik için boşluk (div.urun span.fiyat) kullanılır. select her zaman liste döner; tek eleman için select_one vardır.' },
    { t: 'mc', stage: 'Isınma',
      q: 'Bir sitenin robots.txt dosyasında <code>User-agent: *</code> altında <code>Disallow: /hesap/</code> var. Ne anlama gelir?',
      o: ['/hesap/ altındaki sayfalar teknik olarak açılamaz', 'Yalnızca Googlebot\'un /hesap/ altına girmesi yasaktır', 'Kazıyıcı /hesap/ dışında her şeyi kişisel veri dahil serbestçe toplayabilir', 'Tüm botlardan /hesap/ altındaki yolları taramamaları istenir'], a: 3,
      why: 'robots.txt teknik bir engel değil, site sahibinin botlara ricasıdır; * tüm ajanları kapsar. Uymak etik ve çoğu zaman hukuki gerekliliktir. İzin verilen yollarda bile KVKK ve kullanım koşulları ayrıca geçerlidir.' },
    { t: 'mc', stage: 'Isınma',
      q: 'Sayfada hiç <code>table</code> yoksa <code>soup.find("table")</code> ve <code>soup.find_all("table")</code> sırasıyla ne döndürür?',
      o: ['None ve []', '[] ve None', 'Her ikisi de None', 'İkisi de AttributeError fırlatır'], a: 0,
      why: 'find tek eleman arar, bulamazsa None döner; find_all her zaman liste döner, bulamazsa boş liste. None üzerinde .get_text() çağırmak AttributeError verir; bu yüzden find sonucunu kullanmadan önce kontrol et.' },
    { t: 'predict', stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'from bs4 import BeautifulSoup\nfrom urllib.parse import urljoin\nsoup = BeautifulSoup(\'<a href="/urun/42?renk=mavi">Kupa</a>\', "html.parser")\nprint(urljoin("https://tedarikci.example/kategori/mutfak/", soup.a["href"]))\n',
      o: ['https://tedarikci.example/kategori/mutfak/urun/42?renk=mavi', '/urun/42?renk=mavi', 'https://tedarikci.example/urun/42?renk=mavi', 'https://tedarikci.example/kategori/urun/42?renk=mavi'], a: 2,
      why: '/ ile başlayan bağlantı sitenin köküne göredir; urljoin yolu tamamen değiştirir, alan adını korur. Bağlantı / ile başlamasaydı (urun/42) mevcut klasöre eklenirdi.' },
    { t: 'predict', stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'from bs4 import BeautifulSoup\nsoup = BeautifulSoup(\'<p class="fiyat"><b>149</b>,90 TL</p>\', "html.parser")\np = soup.find("p")\nprint(p.string, "|", p.get_text())\n',
      o: ['149,90 TL | 149,90 TL', 'None | 149,90 TL', '149 | 149,90 TL', 'None | 149'], a: 1,
      why: '.string yalnızca etiketin tek bir metin çocuğu varsa çalışır; burada b etiketi ve ayrı bir metin parçası olduğu için None döner. get_text() tüm alt metinleri birleştirir. Kazımada get_text(strip=True) daha güvenlidir.' },
    { t: 'predict', stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'from bs4 import BeautifulSoup\nhtml = \'<ul><li class="urun stok">A</li><li class="urun">B</li><li class="stok urun yeni">C</li></ul>\'\nsoup = BeautifulSoup(html, "html.parser")\nprint(len(soup.select("li.stok")), soup.select_one("li.urun.yeni").text)\n',
      o: ['1 C', '2 B', '0 C', '2 C'], a: 3,
      why: 'class çok değerlidir: "urun stok" ve "stok urun yeni" ikisi de stok sınıfını içerir, sıra önemsizdir. li.urun.yeni her iki sınıfı birden isteyen seçicidir ve yalnız C\'ye uyar.' },
    { t: 'order', stage: 'Kodu oku',
      q: '<p>Stok tablosunu kazıyıp her şehrin stokunu iki katına çıkararak yazdıran kodu sırala.</p>',
      lines: ['from bs4 import BeautifulSoup', 'soup = BeautifulSoup("<table><tr><th>Şehir</th><th>Stok</th></tr><tr><td>İzmir</td><td>12</td></tr><tr><td>Van</td><td>7</td></tr></table>", "html.parser")', 'satirlar = soup.find_all("tr")[1:]', 'for tr in satirlar:', '    sehir, stok = [td.get_text(strip=True) for td in tr.find_all("td")]', '    print(sehir, int(stok) * 2)', 'print("Satır sayısı:", len(satirlar))'],
      expect: 'İzmir 24\nVan 14\nSatır sayısı: 2\n',
      hint: 'Başlık satırını atlamak için find_all sonucunu [1:] ile dilimle. Son print döngünün dışında, en sonda.',
      why: 'Önce içe aktar, sonra ayrıştır, sonra veri satırlarını seç (başlık hariç), her satırda td metinlerini aç. get_text sonucu metindir; sayısal işlem için int gerekir.' },
    { t: 'code', stage: 'Rehberli', id: 'web-scraping-1', diff: 1,
      q: '<p><code>urun_listesi(html)</code> fonksiyonunu yaz: <code>div.urun</code> kartlarından her biri için <code>{"sku": ..., "ad": ..., "fiyat": ...}</code> sözlüğü üretsin. <code>sku</code> kartın <code>data-sku</code> özniteliği, <code>ad</code> içteki <code>h3</code> metni (kenar boşlukları atılmış), <code>fiyat</code> <code>span.fiyat</code> metninden float (<code>"1.299,90 TL"</code> → <code>1299.9</code>). <code>span.fiyat</code> olmayan kartları (stokta yok) atla. Sıra sayfadaki sırayla aynı olsun.</p>',
      guide: ['BeautifulSoup(html, "html.parser") ile ayrıştır.', 'soup.select("div.urun") ile kartları gez.', 'Her kartta select_one("span.fiyat") ile fiyatı bul; None ise continue.', 'Fiyat metninden "TL"yi at, noktaları sil, virgülü noktaya çevir, float yap.', 'Sözlüğü listeye ekle ve listeyi döndür.'],
      example: '# Benzer teknik: duyuru kartlarından başlık ve tarih\nfrom bs4 import BeautifulSoup\nhtml = \'<div class="duyuru" data-no="7"><h2> Su kesintisi </h2><time>28.10.2026</time></div><div class="duyuru" data-no="8"><h2>Yol çalışması</h2></div>\'\nsoup = BeautifulSoup(html, "html.parser")\nfor d in soup.select("div.duyuru"):\n    zaman = d.select_one("time")\n    if zaman is None:\n        continue\n    print(d["data-no"], d.h2.get_text(strip=True), zaman.get_text())\n',
      start: 'from bs4 import BeautifulSoup\n\ndef urun_listesi(html):\n    soup = BeautifulSoup(html, "html.parser")\n    urunler = []\n    # TODO: her div.urun kartı için sku, ad, fiyat çıkar\n    # TODO: fiyatı olmayan kartı atla, fiyatı Türkçe biçimden float\'a çevir\n    return urunler\n',
      sol: 'from bs4 import BeautifulSoup\n\ndef urun_listesi(html):\n    soup = BeautifulSoup(html, "html.parser")\n    urunler = []\n    for kart in soup.select("div.urun"):\n        fiyat_etiket = kart.select_one("span.fiyat")\n        if fiyat_etiket is None:\n            continue\n        metin = fiyat_etiket.get_text(strip=True).replace("TL", "").strip()\n        fiyat = float(metin.replace(".", "").replace(",", "."))\n        urunler.append({"sku": kart["data-sku"], "ad": kart.h3.get_text(strip=True), "fiyat": fiyat})\n    return urunler\n',
      tests: 'html = \'<div id="k"><div class="urun" data-sku="AM-101"><h3> Çay Bardağı </h3><span class="fiyat">149,90 TL</span></div><div class="urun indirim" data-sku="AM-102"><h3>Demlik</h3><span class="fiyat">1.299,90 TL</span></div><div class="urun" data-sku="AM-103"><h3>Kupa</h3><span class="tukendi">Stokta yok</span></div></div>\'\nu = urun_listesi(html)\nassert len(u) == 2, "stokta olmayan kart atlanmalı, 2 ürün kalmalı"\nassert u[0] == {"sku": "AM-101", "ad": "Çay Bardağı", "fiyat": 149.9}, "ilk ürün: kenar boşlukları atılmış ad ve float fiyat; bulunan: " + str(u[0])\nassert u[1]["fiyat"] == 1299.9, "1.299,90 → 1299.9 olmalı"\nassert urun_listesi("<p>boş</p>") == [], "kart yoksa boş liste"\n',
      hints: ['find/select_one bulamazsa None döner; önce kontrol et.', 'Öznitelik: kart["data-sku"]; metin: kart.h3.get_text(strip=True).', 'float(metin.replace(".", "").replace(",", "."))'],
      why: 'Kart kalıbı (her ürün bir kapsayıcı, alanlar içinde) e-ticaret sayfalarının çoğunda aynıdır. Eksik alanı None kontrolüyle atlamak tek bir bozuk kartın tüm kazımayı çökertmesini önler.' },
    { t: 'code', stage: 'Rehberli', id: 'web-scraping-2', diff: 2,
      q: '<p><code>linkleri_topla(html, taban)</code> fonksiyonunu yaz: sayfadaki tüm <code>a</code> etiketlerinin <code>href</code> değerlerini <code>taban</code> adresine göre mutlak adrese çevirip <b>tekrarsız ve alfabetik sıralı</b> liste döndürsün. Kurallar: <code>href</code>\'i olmayan ya da boş olan etiketleri atla; <code>#</code>, <code>mailto:</code>, <code>tel:</code>, <code>javascript:</code> ile başlayanları atla; adresteki <code>#bolum</code> parçasını (fragment) at.</p>',
      guide: ['Atlanacak önekleri bir demette tut: ("#", "mailto:", "tel:", "javascript:").', 'soup.find_all("a", href=True) yalnızca href\'i olan etiketleri verir.', 'href\'i strip et; boşsa ya da yasak önekle başlıyorsa atla.', 'urljoin(taban, href) ile mutlak yap, urldefrag(...).url ile # kısmını at, bir kümeye ekle.', 'sorted(küme) döndür.'],
      example: '# Benzer teknik: görsel adreslerini mutlak yapmak\nfrom bs4 import BeautifulSoup\nfrom urllib.parse import urljoin\nsoup = BeautifulSoup(\'<img src="/img/a.png"><img src="b.png"><img>\', "html.parser")\nadresler = {urljoin("https://site.example/galeri/", i["src"]) for i in soup.find_all("img", src=True)}\nprint(sorted(adresler))\n',
      start: 'from bs4 import BeautifulSoup\nfrom urllib.parse import urljoin, urldefrag\n\nATLA = ("#", "mailto:", "tel:", "javascript:")\n\ndef linkleri_topla(html, taban):\n    soup = BeautifulSoup(html, "html.parser")\n    adresler = set()\n    # TODO: href\'i olan a etiketlerini gez, atlanacakları atla\n    # TODO: mutlak adrese çevir, fragment\'ı at, kümeye ekle\n    return sorted(adresler)\n',
      sol: 'from bs4 import BeautifulSoup\nfrom urllib.parse import urljoin, urldefrag\n\nATLA = ("#", "mailto:", "tel:", "javascript:")\n\ndef linkleri_topla(html, taban):\n    soup = BeautifulSoup(html, "html.parser")\n    adresler = set()\n    for a in soup.find_all("a", href=True):\n        href = a["href"].strip()\n        if not href or href.lower().startswith(ATLA):\n            continue\n        adresler.add(urldefrag(urljoin(taban, href)).url)\n    return sorted(adresler)\n',
      tests: 'html = \'<a href="/urun/1">1</a><a href="urun/2#yorum">2</a><a href="/urun/1">tekrar</a><a href="#ust">üst</a><a href="mailto:satis@x.example">mail</a><a>bos</a><a href="  ">bosluk</a><a href="https://baska.example/a">dış</a><a href="TEL:0212">tel</a>\'\nl = linkleri_topla(html, "https://tedarikci.example/katalog/")\nassert l == ["https://baska.example/a", "https://tedarikci.example/katalog/urun/2", "https://tedarikci.example/urun/1"], "beklenen 3 mutlak adres, bulunan: " + str(l)\nassert linkleri_topla("<p>yok</p>", "https://a.example/") == [], "bağlantı yoksa boş liste"\n',
      hints: ['find_all("a", href=True) href\'siz etiketleri baştan eler.', 'str.startswith bir demet de kabul eder; büyük/küçük harf için lower() kullan.', 'urldefrag(urljoin(taban, href)).url'],
      why: 'urljoin göreli/mutlak tüm durumları doğru çözer; fragment aynı sayfanın bir bölümünü gösterdiği için atılmazsa aynı sayfa iki kez indirilir. Küme tekrarı, sorted ise kararlı çıktıyı sağlar.' },
    { t: 'code', stage: 'Rehberli', id: 'web-scraping-3', diff: 2,
      q: '<p><code>tablo_oku(html, tablo_id=None)</code> fonksiyonunu yaz: <code>tablo_id</code> verilmişse o id\'li tabloyu, verilmemişse sayfadaki ilk tabloyu okusun. Başlıkları <code>th</code>\'lerden alıp her veri satırını <code>{başlık: hücre_metni}</code> sözlüğüne çevirsin (metinler strip edilmiş). Hücresi olmayan satırları (yalnızca th içeren başlık satırı gibi) atla. Tablo bulunamazsa <code>ValueError</code> fırlat.</p>',
      guide: ['tablo_id varsa soup.find("table", id=tablo_id), yoksa soup.find("table").', 'Tablo None ise ValueError fırlat.', 'Başlıklar: [th.get_text(strip=True) for th in tablo.find_all("th")]', 'Her tr için td metinlerini topla; liste boşsa atla.', 'dict(zip(basliklar, hucreler)) ile sözlüğe çevirip listeye ekle.'],
      example: '# Benzer teknik: tanım listesinden (dl) sözlük\nfrom bs4 import BeautifulSoup\nsoup = BeautifulSoup("<dl><dt>Marka</dt><dd>Anadolu</dd><dt>Renk</dt><dd>Mavi</dd></dl>", "html.parser")\nanahtar = [d.get_text() for d in soup.find_all("dt")]\ndeger = [d.get_text() for d in soup.find_all("dd")]\nprint(dict(zip(anahtar, deger)))\n',
      start: 'from bs4 import BeautifulSoup\n\ndef tablo_oku(html, tablo_id=None):\n    soup = BeautifulSoup(html, "html.parser")\n    # TODO: doğru tabloyu bul, yoksa ValueError\n    # TODO: başlıkları ve satırları oku\n    return []\n',
      sol: 'from bs4 import BeautifulSoup\n\ndef tablo_oku(html, tablo_id=None):\n    soup = BeautifulSoup(html, "html.parser")\n    tablo = soup.find("table", id=tablo_id) if tablo_id else soup.find("table")\n    if tablo is None:\n        raise ValueError("Tablo bulunamadı")\n    basliklar = [th.get_text(strip=True) for th in tablo.find_all("th")]\n    kayitlar = []\n    for tr in tablo.find_all("tr"):\n        hucreler = [td.get_text(strip=True) for td in tr.find_all("td")]\n        if hucreler:\n            kayitlar.append(dict(zip(basliklar, hucreler)))\n    return kayitlar\n',
      tests: 'html = \'<table id="eski"><tr><th>X</th></tr><tr><td>1</td></tr></table><table id="nobet"><tr><th>Eczane</th><th>İlçe</th></tr><tr><td> Şifa </td><td>Konak</td></tr><tr><td>Hayat</td><td>Bornova</td></tr></table>\'\nassert tablo_oku(html, "nobet") == [{"Eczane": "Şifa", "İlçe": "Konak"}, {"Eczane": "Hayat", "İlçe": "Bornova"}], "id ile seçilen tablo sözlük listesine çevrilmeli"\nassert tablo_oku(html) == [{"X": "1"}], "id verilmezse ilk tablo okunmalı"\ntry:\n    tablo_oku(html, "yok")\n    assert False, "bulunamayan tablo ValueError vermeli"\nexcept ValueError:\n    pass\ntry:\n    tablo_oku("<p>tablo yok</p>")\n    assert False, "tablosuz sayfa ValueError vermeli"\nexcept ValueError:\n    pass\n',
      hints: ['find("table", id=...) id\'ye göre arar.', 'Başlık satırında td yoktur; boş hücre listesi o satırın atlanacağını gösterir.', 'kayitlar.append(dict(zip(basliklar, hucreler)))'],
      why: 'th → anahtar, td → değer kalıbı tablo kazımanın temelidir. Belirli tabloyu id ile seçmek, sayfaya yeni bir tablo eklendiğinde kodun yanlış tabloyu okumasını önler.' },
    { t: 'code', stage: 'Kendin yaz', id: 'web-scraping-4', diff: 1,
      q: '<p><code>sonraki_sayfa(html, mevcut_url)</code> fonksiyonunu yaz: sayfadaki "sonraki sayfa" bağlantısının <b>mutlak</b> adresini döndürsün. Önce <code>rel</code> özniteliğinde <code>next</code> geçen <code>a</code> etiketine bak; yoksa metni (strip edilmiş) <code>"Sonraki"</code> olan <code>a</code> etiketine bak. Hiçbiri yoksa ya da bağlantının <code>href</code>\'i yoksa <code>None</code> döndür.</p>',
      start: 'from bs4 import BeautifulSoup\nfrom urllib.parse import urljoin\n\ndef sonraki_sayfa(html, mevcut_url):\n    pass\n',
      sol: 'from bs4 import BeautifulSoup\nfrom urllib.parse import urljoin\n\ndef sonraki_sayfa(html, mevcut_url):\n    soup = BeautifulSoup(html, "html.parser")\n    a = soup.select_one("a[rel~=next]")\n    if a is None:\n        a = next((x for x in soup.find_all("a") if x.get_text(strip=True) == "Sonraki"), None)\n    if a is None or not a.get("href"):\n        return None\n    return urljoin(mevcut_url, a["href"])\n',
      tests: 'u = "https://tedarikci.example/katalog?sayfa=1"\nassert sonraki_sayfa(\'<a href="?sayfa=2" rel="next">›</a>\', u) == "https://tedarikci.example/katalog?sayfa=2", "rel=next bağlantısı mutlak adrese çevrilmeli"\nassert sonraki_sayfa(\'<a href="/a">Önceki</a><a href="/katalog?sayfa=5"> Sonraki </a>\', u) == "https://tedarikci.example/katalog?sayfa=5", "rel yoksa metni Sonraki olan bağlantı kullanılmalı"\nassert sonraki_sayfa(\'<a rel="nofollow next" href="p3.html">x</a>\', "https://a.example/liste/p2.html") == "https://a.example/liste/p3.html", "rel birden çok değer içerebilir"\nassert sonraki_sayfa("<p>son sayfa</p>", u) is None, "bağlantı yoksa None"\nassert sonraki_sayfa(\'<a rel="next">kırık</a>\', u) is None, "href yoksa None"\n',
      hints: ['rel çok değerli bir özniteliktir; CSS\'te [rel~=next] "değerlerden biri next" demektir.', 'Metne göre arama için find_all("a") üzerinde get_text(strip=True) == "Sonraki" kontrolü yap.', 'Son adım: urljoin(mevcut_url, a["href"])'],
      why: 'rel="next" standart sayfalama işaretidir ve metinden daha kararlıdır; metin yedek yoldur. Göreli href\'i mevcut sayfaya göre çözmek, sayfalama zincirinin doğru ilerlemesi için şarttır.' },
    { t: 'code', stage: 'Kendin yaz', id: 'web-scraping-5', diff: 2,
      q: '<p>Sahte bir "indirici" ile sayfalama. <code>sayfalar</code> sözlüğü <code>{mutlak_url: html}</code> biçiminde (gerçekte requests ile çekilirdi). <code>tum_urun_adlari(sayfalar, baslangic, en_fazla=20)</code> fonksiyonunu yaz: başlangıç sayfasından başlayıp her sayfadaki <code>h3.ad</code> metinlerini (strip) sırayla toplasın, <code>a.sonraki</code> bağlantısını (göreli olabilir) izleyerek ilerlesin. Duracağı durumlar: sonraki bağlantı yok, sayfa sözlükte yok, daha önce ziyaret edilmiş sayfa (döngü), ya da <code>en_fazla</code> sayfa indirildi.</p>',
      start: 'from bs4 import BeautifulSoup\nfrom urllib.parse import urljoin\n\ndef tum_urun_adlari(sayfalar, baslangic, en_fazla=20):\n    pass\n',
      sol: 'from bs4 import BeautifulSoup\nfrom urllib.parse import urljoin\n\ndef tum_urun_adlari(sayfalar, baslangic, en_fazla=20):\n    adlar = []\n    goruldu = set()\n    url = baslangic\n    while url and url in sayfalar and url not in goruldu and len(goruldu) < en_fazla:\n        goruldu.add(url)\n        soup = BeautifulSoup(sayfalar[url], "html.parser")\n        adlar += [h.get_text(strip=True) for h in soup.select("h3.ad")]\n        a = soup.select_one("a.sonraki[href]")\n        url = urljoin(url, a["href"]) if a else None\n    return adlar\n',
      tests: 'T = "https://t.example/k"\ns = {T + "?s=1": \'<h3 class="ad">Kalem</h3><h3 class="ad"> Silgi </h3><a class="sonraki" href="?s=2">›</a>\', T + "?s=2": \'<h3 class="ad">Defter</h3><a class="sonraki" href="/k?s=3">›</a>\', T + "?s=3": \'<h3 class="ad">Cetvel</h3>\'}\nassert tum_urun_adlari(s, T + "?s=1") == ["Kalem", "Silgi", "Defter", "Cetvel"], "üç sayfa da gezilmeli ve adlar sırayla toplanmalı"\nd = {T + "?s=1": \'<h3 class="ad">A</h3><a class="sonraki" href="?s=2">›</a>\', T + "?s=2": \'<h3 class="ad">B</h3><a class="sonraki" href="?s=1">›</a>\'}\nassert tum_urun_adlari(d, T + "?s=1") == ["A", "B"], "döngüde ziyaret edilmiş sayfaya dönülmemeli"\nassert tum_urun_adlari(s, T + "?s=1", en_fazla=2) == ["Kalem", "Silgi", "Defter"], "en_fazla=2 ise iki sayfa indirilmeli"\neksik = {T + "?s=1": \'<h3 class="ad">X</h3><a class="sonraki" href="?s=9">›</a>\'}\nassert tum_urun_adlari(eksik, T + "?s=1") == ["X"], "olmayan sayfada durulmalı"\n',
      hints: ['Ziyaret edilenleri bir kümede tut; while koşuluna tüm durma şartlarını koy.', 'Sonraki adresi mevcut sayfanın adresiyle urljoin\'le çöz.', 'a.sonraki[href] seçicisi href\'i olan bağlantıyı bulur.'],
      why: 'Gerçek sitelerde sayfalama bazen kendi kendine döner ya da sınırsız uzar; ziyaret kümesi ve sayfa sınırı kazıyıcıyı ve hedef siteyi korur. İndirme işini sözlükle taklit etmek, ayrıştırma mantığını ağ olmadan test etmeni sağlar.' },
    { t: 'code', stage: 'Kendin yaz', id: 'web-scraping-6', diff: 2,
      q: '<p>robots.txt denetimi. İki fonksiyon yaz (<code>urllib.robotparser</code> kullan, robots içeriği metin olarak gelir):</p><ul><li><code>izinli_mi(robots_metni, url, ajan="AnadoluBot")</code>: bu ajan bu adresi tarayabilir mi (<code>True</code>/<code>False</code>).</li><li><code>bekleme_suresi(robots_metni, ajan="AnadoluBot", varsayilan=1.0)</code>: <code>Crawl-delay</code> değerini float olarak döndürsün; tanımlı değilse <code>varsayilan</code>. Dönen süre hiçbir zaman <code>varsayilan</code>\'dan küçük olmasın (nezaket alt sınırı).</li></ul>',
      start: 'from urllib.robotparser import RobotFileParser\n\ndef izinli_mi(robots_metni, url, ajan="AnadoluBot"):\n    pass\n\ndef bekleme_suresi(robots_metni, ajan="AnadoluBot", varsayilan=1.0):\n    pass\n',
      sol: 'from urllib.robotparser import RobotFileParser\n\ndef _ayristir(metin):\n    rp = RobotFileParser()\n    rp.parse(metin.splitlines())\n    return rp\n\ndef izinli_mi(robots_metni, url, ajan="AnadoluBot"):\n    return _ayristir(robots_metni).can_fetch(ajan, url)\n\ndef bekleme_suresi(robots_metni, ajan="AnadoluBot", varsayilan=1.0):\n    gecikme = _ayristir(robots_metni).crawl_delay(ajan)\n    if gecikme is None:\n        return float(varsayilan)\n    return max(float(gecikme), float(varsayilan))\n',
      tests: 'r = "User-agent: *\\nDisallow: /sepet/\\nCrawl-delay: 3\\n\\nUser-agent: KotuBot\\nDisallow: /\\n"\nassert izinli_mi(r, "https://t.example/katalog") is True, "katalog herkese açık"\nassert izinli_mi(r, "https://t.example/sepet/ekle") is False, "/sepet/ kapalı"\nassert izinli_mi(r, "https://t.example/katalog", "KotuBot") is False, "KotuBot için tüm site kapalı"\nassert bekleme_suresi(r) == 3.0, "Crawl-delay 3 olmalı"\nassert bekleme_suresi("User-agent: *\\nDisallow:\\n") == 1.0, "tanımsızsa varsayılan 1.0"\nassert bekleme_suresi("User-agent: *\\nCrawl-delay: 0.2\\n", varsayilan=2) == 2.0, "varsayılandan küçük süre alt sınıra yükseltilmeli"\n',
      hints: ['RobotFileParser().parse(satır_listesi) ağsız ayrıştırma yapar.', 'can_fetch(ajan, url) ve crawl_delay(ajan) metotları vardır; crawl_delay tanımsızsa None döner.', 'max(gecikme, varsayilan) alt sınırı uygular.'],
      why: 'robots.txt\'yi kendin ayrıştırmaya çalışmak yerine standart kütüphaneye güvenmek, ajan grupları ve öncelik kuralları gibi ayrıntıları doğru uygular. Alt sınır, site gecikme belirtmese de seni nazik tutar.' },
    { t: 'code', stage: 'Kendin yaz', id: 'web-scraping-7', diff: 2,
      q: '<p>Birçok ürün sayfası veriyi JSON-LD olarak da verir. <code>json_ld_urun(html)</code> fonksiyonunu yaz: <code>script[type="application/ld+json"]</code> etiketlerini sırayla oku, içeriği <code>json.loads</code> ile çöz (içerik tek nesne ya da nesne listesi olabilir), <code>"@type"</code> değeri <code>"Product"</code> olan ilk nesneden <code>{"ad": name, "fiyat": float(offers.price), "para": offers.priceCurrency}</code> döndürsün. Bozuk JSON içeren script\'i atla. Ürün yoksa <code>None</code>.</p>',
      start: 'import json\nfrom bs4 import BeautifulSoup\n\ndef json_ld_urun(html):\n    pass\n',
      sol: 'import json\nfrom bs4 import BeautifulSoup\n\ndef json_ld_urun(html):\n    soup = BeautifulSoup(html, "html.parser")\n    for s in soup.find_all("script", type="application/ld+json"):\n        try:\n            veri = json.loads(s.get_text())\n        except json.JSONDecodeError:\n            continue\n        nesneler = veri if isinstance(veri, list) else [veri]\n        for n in nesneler:\n            if isinstance(n, dict) and n.get("@type") == "Product":\n                teklif = n.get("offers", {})\n                return {"ad": n.get("name"), "fiyat": float(teklif.get("price")), "para": teklif.get("priceCurrency")}\n    return None\n',
      tests: 'html = \'<script type="application/ld+json">{bozuk</script><script type="application/ld+json">{"@type": "Organization", "name": "Tedarikçi"}</script><script type="application/ld+json">[{"@type": "BreadcrumbList"}, {"@type": "Product", "name": "Demlik", "offers": {"price": "1299.90", "priceCurrency": "TRY"}}]</script>\'\nassert json_ld_urun(html) == {"ad": "Demlik", "fiyat": 1299.9, "para": "TRY"}, "liste içindeki Product nesnesi bulunmalı, bozuk JSON atlanmalı"\nassert json_ld_urun(\'<script type="application/ld+json">{"@type": "Product", "name": "Kupa", "offers": {"price": 89, "priceCurrency": "TRY"}}</script>\')["fiyat"] == 89.0, "tek nesne de desteklenmeli, fiyat float olmalı"\nassert json_ld_urun("<p>yok</p>") is None, "JSON-LD yoksa None"\n',
      hints: ['find_all("script", type="application/ld+json") ile etiketleri bul; içerik s.get_text().', 'json.JSONDecodeError yakalayıp continue de.', 'Tek nesneyi [veri] listesine sararak iki durumu aynı döngüyle işle.'],
      why: 'JSON-LD arama motorları için yayımlanan yapılandırılmış veridir; görsel tasarım değişse de genellikle sabit kalır. Bozuk bir script\'in tüm işlemi durdurmaması için hata yerelde yakalanır.' },
    { t: 'code', stage: 'Hata avı', kind: 'bug', id: 'web-scraping-8', diff: 2,
      q: '<p>Fiyat kazıyıcı bazı sayfalarda çöküyor, bazılarında yanlış sonuç veriyor. <code>fiyatlar(html)</code> ürün adı → fiyat sözlüğü döndürmeli; adlar kenar boşluksuz olmalı, fiyatı olmayan kart atlanmalı, <code>"1.299,90 TL"</code> → <code>1299.9</code>. Kodda <b>üç hata</b> var. <b>Hataları bul ve düzelt.</b></p>',
      start: 'from bs4 import BeautifulSoup\n\ndef fiyatlar(html):\n    soup = BeautifulSoup(html, "html.parser")\n    sonuc = {}\n    for kart in soup.find_all("div", class_="urun"):\n        ad = kart.find("h3").text\n        fiyat = kart.find("span", class_="fiyat").text\n        sonuc[ad] = float(fiyat.replace("TL", "").replace(",", "."))\n    return sonuc\n',
      sol: 'from bs4 import BeautifulSoup\n\ndef fiyatlar(html):\n    soup = BeautifulSoup(html, "html.parser")\n    sonuc = {}\n    for kart in soup.find_all("div", class_="urun"):\n        ad = kart.find("h3").get_text(strip=True)\n        etiket = kart.find("span", class_="fiyat")\n        if etiket is None:\n            continue\n        fiyat = etiket.get_text(strip=True).replace("TL", "").strip()\n        sonuc[ad] = float(fiyat.replace(".", "").replace(",", "."))\n    return sonuc\n',
      tests: 'html = \'<div class="urun"><h3> Kalem </h3><span class="fiyat">12,50 TL</span></div><div class="urun"><h3>Kupa</h3><span class="tukendi">Yok</span></div><div class="urun"><h3>Demlik</h3><span class="fiyat">1.299,90 TL</span></div>\'\nf = fiyatlar(html)\nassert "Kalem" in f, "ad kenar boşluklarından arındırılmalı (get_text(strip=True))"\nassert "Kupa" not in f, "fiyatı olmayan kart atlanmalı"\nassert f["Demlik"] == 1299.9, "binlik nokta doğru işlenmeli: 1.299,90 → 1299.9"\nassert f["Kalem"] == 12.5\n',
      hints: ['.text kenar boşluklarını korur; " Kalem " ile "Kalem" farklı anahtardır.', 'find bulamazsa None döner; None.text AttributeError verir.', 'Türkçe tutarda önce binlik noktayı sil, sonra virgülü noktaya çevir.'],
      why: 'Gerçek sayfalar düzensizdir: boşluklar, eksik alanlar, farklı sayı biçimleri. get_text(strip=True), None kontrolü ve doğru sıralı replace bu üç tuzağı kapatır.' },
    { t: 'code', stage: 'Hata avı', kind: 'bug', id: 'web-scraping-9', diff: 2,
      q: '<p>Haber başlıklarını sayfa sayfa toplayan fonksiyon ikinci sayfada <code>KeyError</code> veriyor. <code>sayfalar</code> sözlüğünün anahtarları mutlak adres; sayfalardaki <code>a.sonraki</code> bağlantıları ise göreli. <b>Hatayı bul ve düzelt.</b></p>',
      start: 'from bs4 import BeautifulSoup\nfrom urllib.parse import urljoin\n\ndef tum_basliklar(sayfalar, baslangic):\n    url = baslangic\n    goruldu = set()\n    basliklar = []\n    while url and url not in goruldu:\n        goruldu.add(url)\n        soup = BeautifulSoup(sayfalar[url], "html.parser")\n        basliklar += [h.get_text(strip=True) for h in soup.select("h2")]\n        sonraki = soup.select_one("a.sonraki")\n        url = sonraki["href"] if sonraki else None\n    return basliklar\n',
      sol: 'from bs4 import BeautifulSoup\nfrom urllib.parse import urljoin\n\ndef tum_basliklar(sayfalar, baslangic):\n    url = baslangic\n    goruldu = set()\n    basliklar = []\n    while url and url not in goruldu:\n        goruldu.add(url)\n        soup = BeautifulSoup(sayfalar[url], "html.parser")\n        basliklar += [h.get_text(strip=True) for h in soup.select("h2")]\n        sonraki = soup.select_one("a.sonraki")\n        url = urljoin(url, sonraki["href"]) if sonraki else None\n    return basliklar\n',
      tests: 'B = "https://belediye.example/duyurular"\ns = {B + "?s=1": \'<h2>Su kesintisi</h2><a class="sonraki" href="?s=2">›</a>\', B + "?s=2": \'<h2>Yol çalışması</h2><a class="sonraki" href="?s=1">›</a>\'}\nassert tum_basliklar(s, B + "?s=1") == ["Su kesintisi", "Yol çalışması"], "göreli bağlantı mutlak adrese çevrilmeli ve döngüde durulmalı"\n',
      hints: ['Döngünün ikinci turunda url değişkeninin değerini yazdır.', '"?s=2" sözlükte anahtar değil; anahtarlar mutlak adres.', 'urljoin(url, sonraki["href"])'],
      why: 'Göreli bağlantı, mevcut sayfanın adresiyle birleştirilmeden kullanılamaz. Bu düzeltme aynı zamanda ziyaret kümesinin de mutlak adreslerle çalışmasını sağlar; böylece "?s=1"e geri dönüş döngü olarak yakalanır.' },
    { t: 'code', stage: 'Meydan okuma', id: 'web-scraping-10', diff: 3,
      q: '<p>Fiyat değişimi raporu. <code>fiyat_farki(eski_html, yeni_html)</code> fonksiyonunu yaz. Her iki sayfada ürünler <code>div.urun[data-sku]</code> kartlarıdır, fiyat <code>span.fiyat</code> içinde Türkçe biçimdedir; fiyatı olmayan kart yok sayılır. Şu sözlüğü döndür:</p><ul><li><code>"degisen"</code>: iki sayfada da olan ve fiyatı değişen ürünler için <code>(sku, eski, yeni, yuzde)</code> demetleri; <code>yuzde</code> = <code>round((yeni - eski) / eski * 100, 1)</code>; mutlak yüzdeye göre büyükten küçüğe, eşitlikte sku\'ya göre sıralı.</li><li><code>"eklenen"</code> ve <code>"kaldirilan"</code>: yalnız yeni / yalnız eski sayfada olan sku\'ların sıralı listesi.</li></ul><p>Aynı sku bir sayfada iki kez geçerse <b>son</b> görülen fiyat geçerlidir.</p>',
      start: 'from bs4 import BeautifulSoup\n\ndef fiyat_farki(eski_html, yeni_html):\n    pass\n',
      sol: 'from bs4 import BeautifulSoup\n\ndef _fiyatlar(html):\n    soup = BeautifulSoup(html, "html.parser")\n    d = {}\n    for kart in soup.select("div.urun[data-sku]"):\n        f = kart.select_one("span.fiyat")\n        if f is None:\n            continue\n        metin = f.get_text(strip=True).replace("TL", "").strip()\n        d[kart["data-sku"]] = float(metin.replace(".", "").replace(",", "."))\n    return d\n\ndef fiyat_farki(eski_html, yeni_html):\n    eski, yeni = _fiyatlar(eski_html), _fiyatlar(yeni_html)\n    degisen = []\n    for sku in eski.keys() & yeni.keys():\n        e, y = eski[sku], yeni[sku]\n        if e != y:\n            degisen.append((sku, e, y, round((y - e) / e * 100, 1)))\n    degisen.sort(key=lambda t: (-abs(t[3]), t[0]))\n    return {"degisen": degisen, "eklenen": sorted(yeni.keys() - eski.keys()), "kaldirilan": sorted(eski.keys() - yeni.keys())}\n',
      tests: 'eski = \'<div class="urun" data-sku="A"><span class="fiyat">100,00 TL</span></div><div class="urun" data-sku="B"><span class="fiyat">1.000,00 TL</span></div><div class="urun" data-sku="C"><span class="fiyat">50,00</span></div><div class="urun" data-sku="D"><span class="fiyat">80,00</span></div><div class="urun" data-sku="X"><span>yok</span></div>\'\nyeni = \'<div class="urun" data-sku="A"><span class="fiyat">110,00 TL</span></div><div class="urun" data-sku="B"><span class="fiyat">900,00 TL</span></div><div class="urun" data-sku="C"><span class="fiyat">50,00</span></div><div class="urun" data-sku="E"><span class="fiyat">10,00</span></div><div class="urun" data-sku="D"><span class="fiyat">60,00</span></div><div class="urun" data-sku="D"><span class="fiyat">100,00</span></div>\'\nr = fiyat_farki(eski, yeni)\nassert r["degisen"] == [("D", 80.0, 100.0, 25.0), ("A", 100.0, 110.0, 10.0), ("B", 1000.0, 900.0, -10.0)], "mutlak yüzdeye göre sıralı, eşitlikte sku; D için son fiyat (100) geçerli. Bulunan: " + str(r["degisen"])\nassert r["eklenen"] == ["E"], "yalnız yeni sayfada olan E eklenen olmalı"\nassert r["kaldirilan"] == [], "fiyatsız X hiç sayılmamalı, kaldırılan yok"\nassert fiyat_farki("", "") == {"degisen": [], "eklenen": [], "kaldirilan": []}, "boş sayfalar boş rapor vermeli"\n',
      hints: ['Önce her sayfayı sku → fiyat sözlüğüne çeviren yardımcı yaz; sözlüğe yazmak "son görülen geçerli" kuralını kendiliğinden sağlar.', 'Küme işlemleri: ortak = eski.keys() & yeni.keys(), eklenen = yeni.keys() - eski.keys().', 'Sıralama anahtarı: (-abs(yuzde), sku).'],
      why: 'Karşılaştırmayı sözlük ve küme işlemlerine indirgemek, iki sayfadaki ürün sırasından bağımsız ve O(n) bir çözüm verir. Kenar durumları (çift kayıt, fiyatsız kart, boş sayfa) gerçek kazıma verisinde her gün görülür.' },
    { t: 'code', stage: 'Mini proje', id: 'web-scraping-11', diff: 3,
      q: '<p>Kurallara uyan katalog kazıyıcı. <code>katalog_kaziyici(sayfalar, baslangic, robots_metni, ajan="AnadoluBot")</code> şunu yapsın:</p><ol><li>Başlangıçtan itibaren <code>a.sonraki</code> bağlantılarını (göreli olabilir) izleyerek sayfaları gez; döngüye girme, sözlükte olmayan sayfada dur.</li><li>Her sayfayı indirmeden önce robots.txt ile izni denetle; izin yoksa o sayfayı <b>indirme</b>, adresini <code>"atlanan"</code> listesine ekle ve gezintiyi bitir.</li><li>İndirilen sayfalardan <code>div.urun</code> kartlarını oku: <code>data-sku</code>, <code>h3</code> adı, Türkçe fiyat; fiyatsız kartları atla; aynı sku ikinci kez gelirse yok say.</li><li><code>{"urunler": [...], "indirilen": n, "atlanan": [...], "ortalama": x}</code> döndür. <code>urunler</code> fiyata göre artan (eşitlikte sku) sıralı <code>{"sku", "ad", "fiyat"}</code> sözlükleri; <code>ortalama</code> fiyat ortalaması 2 basamak (ürün yoksa <code>0.0</code>).</li></ol>',
      start: 'from bs4 import BeautifulSoup\nfrom urllib.parse import urljoin\nfrom urllib.robotparser import RobotFileParser\n\ndef katalog_kaziyici(sayfalar, baslangic, robots_metni, ajan="AnadoluBot"):\n    pass\n',
      sol: 'from bs4 import BeautifulSoup\nfrom urllib.parse import urljoin\nfrom urllib.robotparser import RobotFileParser\n\ndef _kartlar(soup):\n    for kart in soup.select("div.urun[data-sku]"):\n        f = kart.select_one("span.fiyat")\n        if f is None:\n            continue\n        metin = f.get_text(strip=True).replace("TL", "").strip()\n        yield kart["data-sku"], kart.h3.get_text(strip=True), float(metin.replace(".", "").replace(",", "."))\n\ndef katalog_kaziyici(sayfalar, baslangic, robots_metni, ajan="AnadoluBot"):\n    rp = RobotFileParser()\n    rp.parse(robots_metni.splitlines())\n    urunler, atlanan, goruldu = {}, [], set()\n    url = baslangic\n    while url and url in sayfalar and url not in goruldu:\n        if not rp.can_fetch(ajan, url):\n            atlanan.append(url)\n            break\n        goruldu.add(url)\n        soup = BeautifulSoup(sayfalar[url], "html.parser")\n        for sku, ad, fiyat in _kartlar(soup):\n            urunler.setdefault(sku, {"sku": sku, "ad": ad, "fiyat": fiyat})\n        a = soup.select_one("a.sonraki[href]")\n        url = urljoin(url, a["href"]) if a else None\n    liste = sorted(urunler.values(), key=lambda u: (u["fiyat"], u["sku"]))\n    ort = round(sum(u["fiyat"] for u in liste) / len(liste), 2) if liste else 0.0\n    return {"urunler": liste, "indirilen": len(goruldu), "atlanan": atlanan, "ortalama": ort}\n',
      tests: 'K = "https://t.example/katalog/"\nrobots = "User-agent: *\\nDisallow: /katalog/gizli\\n"\ns = {\n    K + "s1": \'<div class="urun" data-sku="AM-2"><h3>Demlik</h3><span class="fiyat">1.299,90 TL</span></div><div class="urun" data-sku="AM-1"><h3> Kupa </h3><span class="fiyat">89,90 TL</span></div><a class="sonraki" href="s2">›</a>\',\n    K + "s2": \'<div class="urun" data-sku="AM-1"><h3>Kupa (tekrar)</h3><span class="fiyat">1,00</span></div><div class="urun" data-sku="AM-3"><h3>Tepsi</h3></div><div class="urun" data-sku="AM-4"><h3>Bardak</h3><span class="fiyat">89,90</span></div><a class="sonraki" href="gizli?s=3">›</a>\',\n    K + "gizli?s=3": \'<div class="urun" data-sku="AM-9"><h3>Gizli</h3><span class="fiyat">5,00</span></div>\'\n}\nr = katalog_kaziyici(s, K + "s1", robots)\nassert [u["sku"] for u in r["urunler"]] == ["AM-1", "AM-4", "AM-2"], "fiyata göre artan, eşitlikte sku; bulunan: " + str([u["sku"] for u in r["urunler"]])\nassert r["urunler"][0] == {"sku": "AM-1", "ad": "Kupa", "fiyat": 89.9}, "ilk görülen kayıt korunmalı, tekrar yok sayılmalı"\nassert r["indirilen"] == 2, "robots ile kapalı sayfa indirilmemeli"\nassert r["atlanan"] == [K + "gizli?s=3"], "kapalı sayfa atlanan listesinde olmalı"\nassert r["ortalama"] == 493.23, "(89.9 + 89.9 + 1299.9) / 3 = 493.23"\nbos = katalog_kaziyici({}, K + "s1", robots)\nassert bos == {"urunler": [], "indirilen": 0, "atlanan": [], "ortalama": 0.0}, "hiç sayfa yoksa boş rapor"\n',
      hints: ['Ayrıştırmayı (kartları oku) ve gezintiyi (sayfalama + robots) ayrı fonksiyonlara böl.', 'İzin denetimi indirmeden ÖNCE yapılmalı; izin yoksa atlanana ekle ve döngüden çık.', 'İlk görüleni korumak için urunler.setdefault(sku, {...}).'],
      why: 'Bu yapı gerçek bir kazıyıcının iskeletidir: izin → indir → ayrıştır → tekilleştir → raporla. Gerçekte sayfalar[url] yerine requests.get ve her istek arasında time.sleep(bekleme) olur; geri kalan kod aynen çalışır.' }
  ],
  faq: [
    { q: 'Web kazıma yasal mı?', a: 'Tek bir cevabı yok; ülkeye, sitenin kullanım koşullarına, toplanan verinin türüne ve kullanım amacına bağlı. Herkese açık olgusal verileri (fiyat, stok) nazikçe ve robots.txt\'ye uyarak toplamak genelde düşük risklidir; kişisel veri, telifli içerik, giriş gerektiren alanlar ve engelleri aşmak yüksek risklidir. Ticari bir proje için mutlaka hukuk ekibine danış.' },
    { q: 'html.parser mı lxml mi?', a: 'html.parser kurulum gerektirmez ve küçük sayfalarda yeterlidir. lxml çok daha hızlıdır ve bozuk HTML\'i farklı biçimde onarabilir; büyük ölçekte tercih edilir. Ayrıştırıcıyı değiştirince sonuçların küçük farklılıklar gösterebileceğini unutma ve testlerini aynı ayrıştırıcıyla çalıştır.' },
    { q: 'requests ile gelen HTML\'de ürünler yok ama tarayıcıda görüyorum.', a: 'Sayfa içeriği JavaScript ile sonradan yükleniyordur. Tarayıcının geliştirici araçlarındaki Ağ sekmesinde sayfanın çağırdığı JSON adresini bul; izinliyse onu doğrudan kullan. Olmazsa Playwright ile gerçek tarayıcı sür.' },
    { q: 'Site beni engelledi (403/429). Ne yapmalıyım?', a: 'Dur. Bekleme süreni artır, istek sayını azalt, User-Agent\'ında iletişim bilgisi olduğundan emin ol ve site sahibine ulaşıp izin ya da API iste. Engeli proxy değiştirerek ya da tarayıcı taklidiyle aşmaya çalışmak etik değildir ve hukuki risk doğurur.' }
  ],
  mistakes: [
    { bad: 'soup.find("span", class="fiyat")', good: 'soup.find("span", class_="fiyat")', why: 'class Python\'da ayrılmış sözcüktür; BeautifulSoup class_ adını kullanır.' },
    { bad: 'fiyat = kart.find("span", class_="fiyat").text', good: 'etiket = kart.find("span", class_="fiyat")\nfiyat = etiket.get_text(strip=True) if etiket else None', why: 'find bulamazsa None döner ve .text AttributeError verir; ayrıca .text kenar boşluklarını korur.' },
    { bad: 'sonraki = taban + a["href"]', good: 'sonraki = urljoin(mevcut_url, a["href"])', why: 'Metin birleştirme "/", "../", "?" ve tam adres durumlarını yanlış çözer; urljoin tarayıcı kurallarını uygular.' },
    { bad: 'for url in adresler:\n    html = requests.get(url).text', good: 'for url in adresler:\n    html = requests.get(url, headers=BASLIK, timeout=10).text\n    time.sleep(2)', why: 'Zaman aşımı olmayan istek sonsuza kadar asılabilir; gecikmesiz döngü hedef siteyi yorar ve engellenmene yol açar.' },
    { bad: 'veriler.append({"ad": yorumcu_adi, "telefon": tel, "yorum": metin})', good: 'veriler.append({"sku": sku, "puan": puan})', why: 'Kişisel verileri toplamak KVKK kapsamına girer; işin için gereken en az veriyi (olgusal alanları) topla.' }
  ]
});
})(window);
