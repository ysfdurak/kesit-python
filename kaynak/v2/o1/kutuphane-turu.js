/* Kesit Python — Orta: Python kütüphane haritası ve paket seçme */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push({
  id: 'kutuphane-turu',
  lv: 'orta',
  mod: 'Modüller ve Paketler',
  min: 40,
  title: 'Python kütüphane haritası: hangi iş için hangi paket?',
  sum: 'Veri, görselleştirme, makine öğrenmesi, web, kazıma, ofis otomasyonu, CLI, test, veritabanı ve doğrulama için doğru kütüphaneyi seçmeyi; PyPI\'da paket değerlendirmeyi, belge okumayı (help, __doc__, inspect.signature), sürüm uyumunu ve typosquatting gibi güvenlik risklerini öğrenirsin.',
  goals: [
    'Bir iş ihtiyacı için hangi kütüphane ailesine bakacağımı ve kurulum komutunu söyleyebilirim.',
    'PyPI\'da bir paketi bakım, lisans, sürüm ve indirme ölçütleriyle değerlendirebilirim.',
    'help, __doc__, inspect.signature ve inspect.getdoc ile bir fonksiyonu belgesinden öğrenebilirim.',
    'importlib.util.find_spec ile paketin kurulu olup olmadığını yüklemeden denetleyebilirim.',
    'Sürüm metinlerini doğru karşılaştırır, typosquatting riskini fark edebilirim.'
  ],
  body: `
<h2>Neden önemli?</h2>
<p>Python'ın gücünün yarısı dilin kendisi, diğer yarısı da PyPI'daki (Python Package Index) yarım milyonu aşkın pakettir. Anadolu Market'te yeni başlayan bir analiste "aylık satış Excel'ini oku, grafiğini çiz, PDF raporunu e-postayla gönder" denildiğinde işin çoğu doğru kütüphaneyi seçmektir: Excel için openpyxl, analiz için pandas, grafik için matplotlib. Yanlış seçim haftalar kaybettirir; bakımı bırakılmış ya da sahte bir paket ise güvenlik açığı demektir.</p>
<p>Bu ders bir harita sunar: her iş alanında sektörde yaygın kabul gören kütüphaneler, kurulum komutları, bu uygulamada tarayıcıda çalışıp çalışmadıkları ve hangi derste derinleştirileceği. Ardından paketi nasıl değerlendireceğini, belgesini nasıl okuyacağını ve güvenlik tuzaklarını öğreneceksin. Sanal ortam ve pip ayrıntılarını Sanal ortam ve paket yönetimi dersinde, standart kütüphaneyi Standart kütüphane turu dersinde gördün; burada bakış açısı "dışarıdan ne alırım?" sorusudur.</p>

<h2>Büyük harita</h2>
<div class="tbl-wrap"><table>
<tr><th>Alan</th><th>Kütüphane</th><th>Ne işe yarar</th><th>Kurulum</th><th>Tarayıcıda</th><th>Nerede derinleşir</th></tr>
<tr><td>Veri</td><td>pandas</td><td>Tablo verisi: oku, temizle, grupla, birleştir</td><td><code>pip install pandas</code></td><td>Evet</td><td>pandas giriş, temizlik, groupby</td></tr>
<tr><td>Veri</td><td>polars</td><td>Çok hızlı, tembel (lazy) değerlendirmeli DataFrame</td><td><code>pip install polars</code></td><td>Evet</td><td>Veri boru hattı (ETL)</td></tr>
<tr><td>Veri</td><td>numpy</td><td>Sayısal diziler, vektör işlemleri, lineer cebir</td><td><code>pip install numpy</code></td><td>Evet</td><td>numpy dersi</td></tr>
<tr><td>Veri</td><td>duckdb</td><td>Dosya ve DataFrame üzerinde SQL</td><td><code>pip install duckdb</code></td><td>Evet</td><td>Veri boru hattı</td></tr>
<tr><td>Görsel</td><td>matplotlib</td><td>Her tür statik grafik, tam kontrol</td><td><code>pip install matplotlib</code></td><td>Evet</td><td>matplotlib ile görselleştirme</td></tr>
<tr><td>Görsel</td><td>seaborn</td><td>İstatistiksel grafiklerin kısa yolu (matplotlib üstüne)</td><td><code>pip install seaborn</code></td><td>Hayır</td><td>Görselleştirme (not)</td></tr>
<tr><td>Görsel</td><td>plotly</td><td>Etkileşimli, tarayıcıda yakınlaştırılabilir grafik</td><td><code>pip install plotly</code></td><td>Hayır</td><td>Görselleştirme (not)</td></tr>
<tr><td>ML</td><td>scikit-learn</td><td>Klasik makine öğrenmesi: regresyon, sınıflandırma, kümeleme</td><td><code>pip install scikit-learn</code></td><td>Evet</td><td>İleri seviye projeler</td></tr>
<tr><td>ML</td><td>xgboost</td><td>Gradyan artırma; tablo verisinde yarışma favorisi</td><td><code>pip install xgboost</code></td><td>Hayır</td><td>Kendi bilgisayarında</td></tr>
<tr><td>ML</td><td>pytorch</td><td>Derin öğrenme, sinir ağları, GPU</td><td><code>pip install torch</code></td><td>Hayır</td><td>Kendi bilgisayarında</td></tr>
<tr><td>Web</td><td>Django</td><td>Her şey dahil web çatısı: yönetim paneli, ORM, oturum</td><td><code>pip install django</code></td><td>Hayır</td><td>API ve web</td></tr>
<tr><td>Web</td><td>Flask</td><td>Küçük, esnek web çatısı</td><td><code>pip install flask</code></td><td>Hayır</td><td>API ve web</td></tr>
<tr><td>Web</td><td>FastAPI</td><td>Tip ipuçlarıyla hızlı REST API, otomatik belge</td><td><code>pip install "fastapi[standard]"</code></td><td>Hayır</td><td>API ve web</td></tr>
<tr><td>Kazıma</td><td>requests / httpx</td><td>HTTP istekleri; httpx async da destekler</td><td><code>pip install requests httpx</code></td><td>httpx (ağsız)</td><td>API ve web</td></tr>
<tr><td>Kazıma</td><td>BeautifulSoup</td><td>HTML ayrıştırma ve veri çekme</td><td><code>pip install beautifulsoup4</code></td><td>Evet</td><td>API ve web</td></tr>
<tr><td>Kazıma</td><td>Playwright</td><td>Gerçek tarayıcı sürerek JavaScript'li sayfa kazıma, test</td><td><code>pip install playwright</code></td><td>Hayır</td><td>Kendi bilgisayarında</td></tr>
<tr><td>Ofis</td><td>openpyxl</td><td>Excel (.xlsx) oku, yaz, biçimlendir</td><td><code>pip install openpyxl</code></td><td>Hayır</td><td>Kendi bilgisayarında</td></tr>
<tr><td>Ofis</td><td>python-docx</td><td>Word belgesi üret ve düzenle</td><td><code>pip install python-docx</code></td><td>Hayır</td><td>Kendi bilgisayarında</td></tr>
<tr><td>Ofis</td><td>pypdf</td><td>PDF birleştir, böl, metin çıkar</td><td><code>pip install pypdf</code></td><td>Hayır</td><td>Kendi bilgisayarında</td></tr>
<tr><td>CLI</td><td>argparse</td><td>Komut satırı argümanları (standart kütüphane)</td><td>Kurulum yok</td><td>Evet</td><td>Standart kütüphane turu</td></tr>
<tr><td>CLI</td><td>click / typer</td><td>Dekoratörle CLI; typer tip ipuçlarından üretir</td><td><code>pip install click typer</code></td><td>click evet</td><td>Paketleme ve dağıtım</td></tr>
<tr><td>CLI</td><td>rich</td><td>Renkli tablo, ilerleme çubuğu, güzel hata çıktısı</td><td><code>pip install rich</code></td><td>Evet</td><td>Bu ders</td></tr>
<tr><td>Test</td><td>pytest</td><td>Düz assert ile test, fixture, parametrize</td><td><code>pip install pytest pytest-cov</code></td><td>Modül olarak</td><td>pytest ile test</td></tr>
<tr><td>Veritabanı</td><td>SQLAlchemy</td><td>ORM ve SQL ifade dili, veritabanından bağımsız</td><td><code>pip install sqlalchemy</code></td><td>Evet</td><td>sqlite3 ile Python (not)</td></tr>
<tr><td>Veritabanı</td><td>psycopg</td><td>PostgreSQL sürücüsü</td><td><code>pip install "psycopg[binary]"</code></td><td>Hayır</td><td>Kendi bilgisayarında</td></tr>
<tr><td>Doğrulama</td><td>pydantic</td><td>Tip ipuçlarıyla veri doğrulama ve dönüştürme</td><td><code>pip install pydantic</code></td><td>Evet</td><td>API ve web</td></tr>
<tr><td>Tarih</td><td>python-dateutil</td><td>Esnek tarih ayrıştırma, "ayın son günü" gibi göreli tarihler</td><td><code>pip install python-dateutil</code></td><td>Evet</td><td>Tarih ve saat</td></tr>
<tr><td>Tarih</td><td>pendulum</td><td>Saat dilimi dostu, okunur tarih API'si</td><td><code>pip install pendulum</code></td><td>Hayır</td><td>Kendi bilgisayarında</td></tr>
<tr><td>Görev</td><td>celery</td><td>Dağıtık arka plan görev kuyruğu (Redis/RabbitMQ ile)</td><td><code>pip install celery</code></td><td>Hayır</td><td>Kendi bilgisayarında</td></tr>
<tr><td>Görev</td><td>APScheduler</td><td>Uygulama içinde zamanlanmış görev (cron benzeri)</td><td><code>pip install apscheduler</code></td><td>Hayır</td><td>Kendi bilgisayarında</td></tr>
</table></div>
<div class="tip"><b>Önce standart kütüphane</b>İhtiyacın csv, json, sqlite3, datetime, pathlib, argparse ya da statistics ile çözülüyorsa paket ekleme. Her bağımlılık güncelleme, güvenlik ve lisans takibi demektir. "Bir fonksiyon için bir paket" alışkanlığı projeyi kırılgan yapar.</div>

<h3>Kendi bilgisayarında: tarayıcıda çalışmayan iki örnek</h3>
<pre class="code"># pip install openpyxl
from openpyxl import Workbook

wb = Workbook()
ws = wb.active
ws.append(["Şehir", "Ciro"])
ws.append(["İzmir", 125000])
ws["B2"].number_format = "#,##0 TL"
wb.save("ciro.xlsx")</pre>
<pre class="code"># pip install typer
import typer

def rapor(sehir: str, ay: int = 1, detay: bool = False):
    """Şehir bazlı aylık satış raporu üretir."""
    print(f"{sehir} için {ay}. ay raporu, detay={detay}")

if __name__ == "__main__":
    typer.run(rapor)        # python rapor.py Ankara --ay 3 --detay</pre>
<div class="note"><b>Kendi bilgisayarında dene</b>Bu iki örnek tarayıcıda çalışmaz. Sanal ortamını etkinleştirip yorumdaki <code>pip install</code> komutunu çalıştır, kodu bir .py dosyasına kaydet ve terminalden çalıştır.</div>

<h2>rich: tarayıcıda da çalışan güzel çıktı</h2>
<p>rich, terminal çıktısını tablolar ve renklerle okunur yapar. Komut satırı araçlarında ve hata ayıklamada çok yaygındır:</p>
<pre class="py">from rich.console import Console
from rich.table import Table

tablo = Table(title="Anadolu Market: kütüphane seçimi")
tablo.add_column("İş", style="cyan")
tablo.add_column("Kütüphane")
tablo.add_column("Tarayıcıda", justify="center")
tablo.add_row("Satış analizi", "pandas", "evet")
tablo.add_row("Excel raporu", "openpyxl", "hayır")
tablo.add_row("REST API", "FastAPI", "hayır")
Console(width=70).print(tablo)</pre>

<h2>PyPI'da paket seçmek: beş ölçüt</h2>
<div class="tbl-wrap"><table>
<tr><th>Ölçüt</th><th>Nereye bakarsın?</th><th>Kırmızı bayrak</th></tr>
<tr><td>Bakım</td><td>Son sürüm tarihi, açık issue'lara yanıt, son commit</td><td>2 yıldır sürüm yok, issue'lar yanıtsız</td></tr>
<tr><td>Sürüm olgunluğu</td><td>1.0 üstü mü, değişiklik günlüğü (changelog) düzenli mi</td><td>0.0.x, her sürümde kırıcı değişiklik</td></tr>
<tr><td>Lisans</td><td>PyPI sayfası "License", depodaki LICENSE dosyası</td><td>Lisans yok ya da ticari kullanımı kısıtlayan GPL/AGPL (şirket politikasına bak)</td></tr>
<tr><td>Kullanım</td><td>İndirme istatistikleri, bağımlı proje sayısı</td><td>Popüler bir pakete benzeyen adla çok az indirme</td></tr>
<tr><td>Uyumluluk</td><td><code>Requires-Python</code>, desteklenen işletim sistemleri, wheel var mı</td><td>Senin Python sürümünü desteklemiyor</td></tr>
</table></div>
<div class="warn"><b>Typosquatting: sahte ikiz paketler</b>Saldırganlar popüler paketlere bir harf farkla benzeyen adlarla (ör. <code>reqeusts</code>, <code>pandsa</code>) kötü amaçlı paketler yükler. <code>pip install</code> kurulum sırasında paketin kodunu çalıştırabildiği için tek bir yazım hatası makineni ele geçirtebilir. Komutu kopyalamadan önce adı resmî belgeden doğrula, requirements dosyalarını kod incelemesinden geçir, kurumda iç PyPI aynası kullan.</div>
<p>Bir de <b>pip adı ile import adı</b> farklı olabilir: <code>pip install scikit-learn</code> ama <code>import sklearn</code>; <code>beautifulsoup4</code> → <code>bs4</code>; <code>python-dateutil</code> → <code>dateutil</code>; <code>pyyaml</code> → <code>yaml</code>; <code>pillow</code> → <code>PIL</code>. Bu farkı bilmeyenler "kurdum ama import edemiyorum" diye saatlerini harcar.</p>

<h2>Belge okumak: help, __doc__, inspect</h2>
<p>Yeni bir kütüphaneyi öğrenmenin sırası: resmî belgenin "Quickstart" bölümü, sonra API referansı. Kod içinden ise dört araç vardır:</p>
<pre class="py">import inspect, statistics

def kdv_hesapla(tutar: float, oran: float = 0.20, *, yuvarla: bool = True) -&gt; float:
    """Tutara KDV ekler.

    oran ondalık verilir (0.20 = yüzde 20).
    """
    sonuc = tutar * (1 + oran)
    return round(sonuc, 2) if yuvarla else sonuc

imza = inspect.signature(kdv_hesapla)
print(imza)
for ad, p in imza.parameters.items():
    varsayilan = "zorunlu" if p.default is inspect.Parameter.empty else p.default
    print(f"  {ad:8} tür={p.kind.name:22} varsayılan={varsayilan}")
print(inspect.getdoc(kdv_hesapla).splitlines()[0])
print(inspect.signature(statistics.median))
print(statistics.median.__doc__.strip().splitlines()[0])</pre>
<p><code>help(nesne)</code> tüm bunları biçimlendirilmiş bir sayfa olarak yazdırır; etkileşimli kabukta en hızlı keşif aracıdır. <code>dir(modul)</code> içindeki adları, <code>inspect.getdoc</code> girintisi temizlenmiş belgeyi, <code>inspect.signature</code> parametreleri türleriyle birlikte verir. Parametre türleri PCAP ve gerçek API okuması için önemlidir: <code>*</code> sonrası parametreler yalnızca adla verilebilir (<code>KEYWORD_ONLY</code>).</p>

<h2>Kurulu mu, hangi sürüm?</h2>
<p>Bir paketi import etmek kodunu çalıştırır; yalnızca var olup olmadığını öğrenmek için <code>importlib.util.find_spec</code> kullan. Kurulu sürüm için <code>importlib.metadata.version</code> vardır.</p>
<pre class="py">import importlib.util
from importlib.metadata import version, PackageNotFoundError

for ad in ["json", "sqlite3", "olmayan_paket_xyz"]:
    print(ad, "kurulu" if importlib.util.find_spec(ad) else "YOK")

try:
    print("pip sürümü:", version("pip"))
except PackageNotFoundError:
    print("pip bu ortamda paket olarak kayıtlı değil")

# Sürüm karşılaştırma: metin değil, sayı demeti
a, b = "2.10.0", "2.9.3"
print(a &gt; b)                                                    # yanlış sonuç!
print(tuple(map(int, a.split("."))) &gt; tuple(map(int, b.split("."))))</pre>
<p>Gerçek projede sürüm karşılaştırması için <code>packaging.version.Version</code> kullanılır; <code>"2.0.0rc1"</code> gibi ön sürüm etiketlerini de doğru sıralar. Semver (anlamsal sürümleme) kuralı: <b>BÜYÜK.küçük.yama</b>; büyük artış kırıcı değişiklik, küçük artış geriye uyumlu yeni özellik, yama artışı hata düzeltmesidir.</p>

<h2>requirements dosyasından rapor</h2>
<p>Yeni bir projeye katıldığında ilk iş <code>requirements.txt</code> ya da <code>pyproject.toml</code> dosyasını okumaktır; projenin ne yaptığını büyük ölçüde oradan anlarsın:</p>
<pre class="py">import re
from collections import defaultdict

requirements = """
pandas&gt;=2.2       # analiz
openpyxl==3.1.2
fastapi[standard]&gt;=0.110
pydantic~=2.7
pytest ; extra == 'test'
"""
KATALOG = {"pandas": "veri", "openpyxl": "ofis", "fastapi": "web", "pydantic": "doğrulama", "pytest": "test"}

rapor = defaultdict(list)
for satir in requirements.splitlines():
    satir = satir.split("#")[0].strip()
    if not satir:
        continue
    ad = re.split(r"[\\[&lt;&gt;=!~; ]", satir, maxsplit=1)[0].lower()
    rapor[KATALOG.get(ad, "diğer")].append(ad)
for kategori, paketler in sorted(rapor.items()):
    print(f"{kategori:10} {', '.join(paketler)}")</pre>

<div class="note"><b>Gerçek işte</b>Kurumsal ekiplerde yeni bir paket eklemek genelde bir onay sürecinden geçer: lisans kontrolü (hukuk), güvenlik taraması (<code>pip-audit</code>, Dependabot), bakım durumu ve "standart kütüphane ya da zaten kullandığımız bir paket bu işi yapıyor mu?" sorusu. Pull request açıklamasına "neden bu paket, alternatifleri neydi" yazmak iyi bir alışkanlıktır. Excel raporu, PDF birleştirme ve zamanlanmış görev gibi otomasyon işleri Python'a geçişin en sık nedenidir; bu işlerde openpyxl, pypdf ve APScheduler üçlüsü çok yaygındır.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Bağımlılık ağacı ve çakışma</h3>
<p>Bir paket kurmak onun bağımlılıklarını da kurar. <code>pip install pandas</code> numpy, python-dateutil, pytz ve tzdata'yı da getirir. İki paket aynı bağımlılığın uyumsuz sürümlerini isterse çakışma (dependency conflict) çıkar. <code>pip check</code> çakışmaları raporlar, <code>pipdeptree</code> ağacı gösterir. Az bağımlılıklı paketi tercih etmek uzun vadede kazandırır.</p>
<h3>Wheel, saf Python ve derlenmiş paketler</h3>
<p>numpy ve pandas gibi paketler C/Rust ile derlenmiş kod içerir; PyPI bunları işletim sistemi ve Python sürümüne özel <b>wheel</b> (.whl) dosyaları olarak sunar. Yeni bir Python sürümü çıktığında wheel henüz yoksa pip kaynaktan derlemeye çalışır ve derleyici hatası alırsın. Bu yüzden kurumlar yeni Python sürümüne birkaç ay gecikmeyle geçer. Tarayıcıdaki Pyodide da paketlerin WebAssembly'ye derlenmiş hâllerini kullanır; tablodaki "Hayır" satırlarının çoğu bu yüzdendir.</p>
<h3>Belgeyi koddan üretmek</h3>
<p>Kütüphanelerin API referans sayfaları çoğunlukla docstring'lerden otomatik üretilir (Sphinx, MkDocs + mkdocstrings). Kendi kodunda iyi docstring yazarsan aynı araçlarla belge siteni bedavaya alırsın ve <code>help()</code> senin kodunda da işe yarar.</p>
</section>
`,
  ex: [
    { t: 'mc', stage: 'Isınma',
      q: 'Muhasebe ekibi her ay elle hazırladığı, hücre biçimli ve formüllü bir <b>.xlsx</b> raporunu otomatikleştirmek istiyor. İlk bakacağın kütüphane hangisi?',
      o: ['python-docx', 'openpyxl', 'BeautifulSoup', 'APScheduler'], a: 1,
      why: 'openpyxl .xlsx dosyasını hücre, biçim ve formül düzeyinde okur ve yazar. python-docx Word, BeautifulSoup HTML içindir; APScheduler işi zamanlar ama Excel üretmez (ikisi birlikte kullanılabilir).' },
    { t: 'mc', stage: 'Isınma',
      q: 'Bir blog yazısındaki komut <code>pip install reqeusts</code>. Ne yapmalısın?',
      o: ['Çalıştır; pip yanlış yazılan adı en yakın pakete otomatik düzeltir', 'Çalıştırma; olası sahte paket, adı resmî belgeden doğrula', 'Önce --user ile kendi kullanıcına kur, sonra dene', 'Çalıştır; zararlı olsa bile import etmedikçe kod çalışmaz'], a: 1,
      why: 'Bu klasik typosquatting örneğidir. pip adı düzeltmez; ayrıca kaynak dağıtımlar kurulum sırasında kod çalıştırabildiği için import etmesen de zarar görebilirsin. Adı her zaman resmî kaynaktan doğrula.' },
    { t: 'mc', stage: 'Isınma',
      q: 'İki PDF kütüphanesi arasında seçim yapıyorsun. Hangisi en güçlü <b>kırmızı bayrak</b>dır?',
      o: ['Paket 2.x sürümünde ve düzenli changelog yayımlıyor', 'Son sürümü üç yıl önce çıkmış, açık issue\'lar yanıtsız', 'Saf Python, derlenmiş kod içermiyor', 'BSD lisanslı ve Requires-Python &gt;=3.9'], a: 1,
      why: 'Bakımı bırakılmış paket yeni Python sürümlerinde kırılır ve güvenlik açıkları kapanmaz. Düzenli changelog, saf Python ve izin veren lisans olumlu işaretlerdir.' },
    { t: 'predict', stage: 'Kodu oku', q: 'Bu kod ne yazdırır?',
      code: 'import inspect\n\ndef kdv(tutar, oran=0.2, *, yuvarla=True):\n    return tutar * (1 + oran)\n\nimza = inspect.signature(kdv)\nprint(imza)\nprint([p.kind.name for p in imza.parameters.values()])\n',
      o: ["(tutar, oran=0.2, *, yuvarla=True)\n['POSITIONAL_OR_KEYWORD', 'POSITIONAL_OR_KEYWORD', 'KEYWORD_ONLY']", "(tutar, oran=0.2, yuvarla=True)\n['POSITIONAL_OR_KEYWORD', 'POSITIONAL_OR_KEYWORD', 'POSITIONAL_OR_KEYWORD']", "(tutar, oran=0.2, *, yuvarla=True)\n['POSITIONAL_ONLY', 'KEYWORD_ONLY', 'KEYWORD_ONLY']", "<Signature kdv>\n['tutar', 'oran', 'yuvarla']"], a: 0,
      why: 'Signature nesnesi yazdırılınca parantezli imza metni çıkar ve * işareti korunur. * öncesi parametreler hem konumla hem adla verilebilir (POSITIONAL_OR_KEYWORD); sonrası yalnızca adla (KEYWORD_ONLY).' },
    { t: 'predict', stage: 'Kodu oku', q: 'Bu kod ne yazdırır?',
      code: 'surumler = ["2.9.1", "2.10.0", "2.2.3"]\nprint(max(surumler))\nprint(max(surumler, key=lambda s: tuple(map(int, s.split(".")))))\n',
      o: ['2.10.0\n2.10.0', '2.9.1\n2.10.0', '2.9.1\n2.9.1', '2.2.3\n2.10.0'], a: 1,
      why: 'Metinler karakter karakter karşılaştırılır: "2.9" ile "2.1" karşılaştırmasında "9" > "1" olduğundan metin olarak en büyük "2.9.1" çıkar. Sayı demetine çevirince (2, 10, 0) en büyüktür.' },
    { t: 'predict', stage: 'Kodu oku', q: 'Bu kod ne yazdırır?',
      code: 'import importlib.util, sys\n\nprint(importlib.util.find_spec("json") is not None)\nprint(importlib.util.find_spec("olmayan_paket_xyz"))\nprint("olmayan_paket_xyz" in sys.modules)\n',
      o: ['True\nNone\nFalse', 'True\nModuleNotFoundError\nFalse', 'True\nNone\nTrue', 'True\nFalse\nFalse'], a: 0,
      why: 'find_spec bulamadığı üst düzey modül için hata fırlatmaz, None döndürür. Modülü yüklemediği için sys.modules\'e de bir şey eklemez. (Noktalı adda üst paket yoksa ModuleNotFoundError fırlatır.)' },
    { t: 'order', stage: 'Kodu oku',
      q: '<p>Bir requirements satırından paket adını çıkaran kodu sırala. Çıktı <code>fastapi</code> olmalı.</p>',
      lines: ['import re', 'ham = "FastAPI[standard]>=0.110  # web"', 'satir = ham.split("#")[0].strip()', 'ad = re.split(r"[\\[<>=!~; ]", satir, maxsplit=1)[0]', 'print(ad.lower())'],
      expect: 'fastapi\n',
      hint: 'Önce yorum kısmı atılır, sonra ilk özel karakterden bölünür, en son küçük harfe çevrilir.',
      why: 'Yorum # sonrasıdır; ad, ekstralar ([standard]) ya da sürüm belirteçlerinden (>=) önce gelir. PyPI adları büyük-küçük harfe duyarsızdır, bu yüzden lower ile normalleştirilir.' },
    { t: 'code', stage: 'Rehberli', id: 'kutuphane-turu-1', diff: 2,
      q: '<p>Yeni bir kütüphanenin fonksiyonlarını hızla anlamak için <code>imza_ozeti(fonk)</code> yaz. <code>inspect.signature</code> ile şu sözlüğü döndürsün: <code>"zorunlu"</code>: varsayılanı olmayan parametre adları (liste, sırayla); <code>"varsayilanli"</code>: <code>{ad: varsayılan}</code>; <code>"sadece_ad"</code>: yalnızca adla verilebilen (KEYWORD_ONLY) parametre adları. <code>*args</code> ve <code>**kwargs</code> hiçbir listeye girmesin.</p>',
      guide: ['inspect.signature(fonk).parameters ile parametreleri gez.', 'p.kind VAR_POSITIONAL ya da VAR_KEYWORD ise atla.', 'p.default is inspect.Parameter.empty ise zorunlu, değilse varsayilanli sözlüğüne ekle.', 'p.kind KEYWORD_ONLY ise sadece_ad listesine de ekle.'],
      example: 'import inspect\n\ndef f(a, b=2, *args, c, **kw):\n    pass\n\nfor ad, p in inspect.signature(f).parameters.items():\n    print(ad, p.kind.name, p.default is inspect.Parameter.empty)\n',
      start: 'import inspect\n\ndef imza_ozeti(fonk):\n    ozet = {"zorunlu": [], "varsayilanli": {}, "sadece_ad": []}\n    # TODO: inspect.signature(fonk).parameters üzerinde dön\n    # TODO: *args / **kwargs atla, zorunlu / varsayilanli / sadece_ad ayır\n    return ozet\n',
      sol: 'import inspect\n\ndef imza_ozeti(fonk):\n    ozet = {"zorunlu": [], "varsayilanli": {}, "sadece_ad": []}\n    for ad, p in inspect.signature(fonk).parameters.items():\n        if p.kind in (p.VAR_POSITIONAL, p.VAR_KEYWORD):\n            continue\n        if p.default is inspect.Parameter.empty:\n            ozet["zorunlu"].append(ad)\n        else:\n            ozet["varsayilanli"][ad] = p.default\n        if p.kind is p.KEYWORD_ONLY:\n            ozet["sadece_ad"].append(ad)\n    return ozet\n\ndef rapor(sehir, ay=1, *ekler, bicim, detay=False, **ayar):\n    pass\nprint(imza_ozeti(rapor))\n',
      tests: 'def rapor(sehir, ay=1, *ekler, bicim, detay=False, **ayar):\n    pass\no = imza_ozeti(rapor)\nassert o["zorunlu"] == ["sehir", "bicim"], "varsayılanı olmayanlar: sehir ve bicim (sadece adla ama zorunlu)"\nassert o["varsayilanli"] == {"ay": 1, "detay": False}, "varsayılanlı parametreler ve değerleri"\nassert o["sadece_ad"] == ["bicim", "detay"], "* sonrası parametreler KEYWORD_ONLY"\nassert "ekler" not in str(o) and "ayar" not in str(o), "*args ve **kwargs hiçbir yerde olmamalı"\nimport statistics\nassert imza_ozeti(statistics.median)["zorunlu"] == ["data"], "statistics.median(data) tek zorunlu parametre alır"\n',
      hints: ['Parametre nesnesinin kind, default ve name alanları var.', 'Boş varsayılan, inspect.Parameter.empty ile karşılaştırılır (is ile).', 'p.kind in (p.VAR_POSITIONAL, p.VAR_KEYWORD) ise continue'],
      why: 'inspect.signature, belge okumadan bir fonksiyonun nasıl çağrılacağını söyler; IDE\'lerin parametre ipucu göstermesi ve FastAPI\'nin parametreleri otomatik okuması bu mekanizmaya dayanır.' },
    { t: 'code', stage: 'Rehberli', id: 'kutuphane-turu-2', diff: 1,
      q: '<p><code>belge_ozeti(nesne)</code> fonksiyonunu yaz: nesnenin belgesinin (docstring) <b>ilk satırını</b> döndürsün. Belgeyi <code>inspect.getdoc</code> ile al (girintiyi temizler). Belge yoksa <code>"Belge yok"</code> döndür.</p>',
      guide: ['inspect.getdoc(nesne) belgeyi ya da None verir.', 'None ya da boşsa "Belge yok" döndür.', 'Değilse splitlines()[0] ile ilk satırı al ve strip et.'],
      example: 'import inspect, json\nmetin = inspect.getdoc(json.loads)\nprint(metin.splitlines()[0][:40])\nprint(type(inspect.getdoc(lambda: 0)))\n',
      start: 'import inspect\n\ndef belge_ozeti(nesne):\n    # TODO: inspect.getdoc ile belgeyi al\n    # TODO: yoksa "Belge yok", varsa ilk satır\n    pass\n',
      sol: 'import inspect\n\ndef belge_ozeti(nesne):\n    belge = inspect.getdoc(nesne)\n    if not belge:\n        return "Belge yok"\n    return belge.splitlines()[0].strip()\n\nimport statistics\nprint(belge_ozeti(statistics.mean))\n',
      tests: 'import statistics, inspect\ndef kdv(t):\n    """\n    Tutara KDV ekler.\n\n    Uzun açıklama.\n    """\n    return t\nassert belge_ozeti(kdv) == "Tutara KDV ekler.", "girinti ve baştaki boş satır temizlenmeli; inspect.getdoc kullan"\nassert belge_ozeti(lambda x: x) == "Belge yok", "belgesiz fonksiyonda Belge yok"\nassert belge_ozeti(statistics.mean) == inspect.getdoc(statistics.mean).splitlines()[0], "statistics.mean belgesinin ilk satırı"\n',
      hints: ['__doc__ ham metni verir; getdoc baştaki boşluğu ve girintiyi temizler.', 'if not belge: return "Belge yok"'],
      why: 'PEP 257\'ye göre docstring\'in ilk satırı tek cümlelik özettir; help ve IDE\'ler onu öne çıkarır. getdoc girinti temizliği yaptığı için çok satırlı belgelerde güvenlidir.' },
    { t: 'code', stage: 'Rehberli', id: 'kutuphane-turu-3', diff: 2,
      q: '<p>Proje başlamadan ortam denetimi: <code>kurulum_durumu(adlar)</code> fonksiyonunu yaz. Her modül adı için kurulu olup olmadığını <code>importlib.util.find_spec</code> ile, <b>modülü yüklemeden</b> denetleyip <code>{ad: True/False}</code> sözlüğü döndürsün. Noktalı adlarda (<code>"yok_paket.alt"</code>) üst paket yoksa <code>find_spec</code> <code>ModuleNotFoundError</code> fırlatır; bunu yakalayıp False say.</p>',
      guide: ['Boş bir sonuç sözlüğü oluştur.', 'Her ad için try içinde importlib.util.find_spec(ad) is not None hesapla.', 'except ModuleNotFoundError durumunda False yaz.', 'Sözlüğü döndür.'],
      example: 'import importlib.util\nfor ad in ["csv", "yok_xyz"]:\n    print(ad, importlib.util.find_spec(ad) is not None)\n',
      start: 'import importlib.util\n\ndef kurulum_durumu(adlar):\n    sonuc = {}\n    # TODO: her ad için find_spec ile denetle, hatayı yakala\n    return sonuc\n',
      sol: 'import importlib.util\n\ndef kurulum_durumu(adlar):\n    sonuc = {}\n    for ad in adlar:\n        try:\n            sonuc[ad] = importlib.util.find_spec(ad) is not None\n        except ModuleNotFoundError:\n            sonuc[ad] = False\n    return sonuc\n\nprint(kurulum_durumu(["json", "csv", "yok_paket_xyz", "yok_paket_xyz.alt"]))\n',
      tests: 'import sys\nd = kurulum_durumu(["json", "json.decoder", "yok_paket_xyz", "yok_paket_xyz.alt"])\nassert d == {"json": True, "json.decoder": True, "yok_paket_xyz": False, "yok_paket_xyz.alt": False}, f"beklenen sonuç farklı: {d}"\nassert kurulum_durumu([]) == {}, "boş liste boş sözlük"\nsys.modules.pop("tomllib", None)\nkurulum_durumu(["tomllib"])\nassert "tomllib" not in sys.modules, "find_spec modülü YÜKLEMEMELİ; import kullanma"\n',
      hints: ['find_spec bulamazsa None döndürür.', 'Noktalı adda üst paket yoksa ModuleNotFoundError gelir: try/except ile yakala.', 'sonuc[ad] = importlib.util.find_spec(ad) is not None'],
      why: 'find_spec modülün nerede olduğunu bulur ama kodunu çalıştırmaz; import ise yan etkileri (yavaş başlatma, bağlantı açma) tetikleyebilir. İsteğe bağlı bağımlılık kontrolünde (pandas varsa şunu kullan) bu kalıp yaygındır.' },
    { t: 'code', stage: 'Rehberli', id: 'kutuphane-turu-4', diff: 2,
      q: '<p>Yeni katıldığın projenin bağımlılıklarını tanı: <code>kategori_raporu(metin, katalog)</code> yaz. <code>metin</code> bir requirements.txt içeriği. Boş satırları ve yorumları (<code>#</code> sonrası) at; her satırdan paket adını çıkar (ad, <code>[</code> <code>&lt;</code> <code>&gt;</code> <code>=</code> <code>!</code> <code>~</code> <code>;</code> ya da boşluktan önce biter), küçük harfe çevir ve <code>_</code> karakterlerini <code>-</code> yap. <code>katalog</code> <code>{paket: kategori}</code>; katalogda olmayanlar <code>"diğer"</code>. <code>{kategori: [paketler]}</code> döndür; listeler alfabetik sıralı olsun.</p>',
      guide: ['metin.splitlines() ile satırları gez; # sonrasını at ve strip et, boşsa geç.', 're.split ile ilk özel karakterden böl, ilk parçayı al.', 'lower() ve replace("_", "-") ile normalleştir.', 'katalog.get(ad, "diğer") kategorisine ekle; sonunda listeleri sırala.'],
      example: 'import re\nfor s in ["numpy==1.26", "Scikit_Learn>=1.4", "httpx[http2]"]:\n    ad = re.split(r"[\\[<>=!~; ]", s, maxsplit=1)[0]\n    print(ad.lower().replace("_", "-"))\n',
      start: 'import re\n\ndef kategori_raporu(metin, katalog):\n    rapor = {}\n    # TODO: satırları gez, yorum/boş satırı at\n    # TODO: adı çıkar ve normalleştir\n    # TODO: kategoriye ekle, listeleri sırala\n    return rapor\n',
      sol: 'import re\n\ndef kategori_raporu(metin, katalog):\n    rapor = {}\n    for satir in metin.splitlines():\n        satir = satir.split("#")[0].strip()\n        if not satir:\n            continue\n        ad = re.split(r"[\\[<>=!~; ]", satir, maxsplit=1)[0].lower().replace("_", "-")\n        rapor.setdefault(katalog.get(ad, "diğer"), []).append(ad)\n    return {k: sorted(v) for k, v in rapor.items()}\n\nkatalog = {"pandas": "veri", "numpy": "veri", "fastapi": "web"}\nprint(kategori_raporu("pandas>=2.2\\nFastAPI[standard]\\n# yorum\\nnumpy==1.26 # sayısal\\nrich\\n", katalog))\n',
      tests: 'katalog = {"pandas": "veri", "numpy": "veri", "fastapi": "web", "scikit-learn": "ml", "pytest": "test"}\nmetin = "# Anadolu Market analitik\\npandas>=2.2\\nFastAPI[standard]>=0.110\\n\\nnumpy==1.26.4  # sayısal\\nscikit_learn~=1.4\\nrich\\npytest ; python_version >= \\"3.10\\"\\n"\nr = kategori_raporu(metin, katalog)\nassert r == {"veri": ["numpy", "pandas"], "web": ["fastapi"], "ml": ["scikit-learn"], "diğer": ["rich"], "test": ["pytest"]}, f"rapor beklenenden farklı: {r}"\nassert kategori_raporu("\\n# sadece yorum\\n", katalog) == {}, "yalnızca yorum içeren dosyada boş sözlük"\n',
      hints: ['satir.split("#")[0] yorumdan önceki kısmı verir.', 'Düzenli ifade: r"[\\[<>=!~; ]" ve maxsplit=1.', 'rapor.setdefault(kategori, []).append(ad) ve sonunda {k: sorted(v) ...}'],
      why: 'PyPI adları büyük-küçük harf ve _/- farkına duyarsızdır (PEP 503 normalleştirmesi); scikit_learn ile scikit-learn aynı pakettir. Bu tür bir rapor, projenin ne yaptığını birkaç saniyede gösterir.' },
    { t: 'code', stage: 'Kendin yaz', id: 'kutuphane-turu-5', diff: 2,
      q: '<p>Güncelleme planı için <code>guncelleme_turu(kurulu, son)</code> yaz. İki sürüm metni (<code>"2.1.4"</code> gibi; eksik parçalar 0 sayılır, <code>"2.2"</code> = <code>"2.2.0"</code>) alsın ve şunlardan birini döndürsün: <code>"güncel"</code> (eşit ya da kurulu daha yeni), <code>"büyük"</code> (ilk parça farklı: kırıcı değişiklik olabilir), <code>"küçük"</code> (ikinci parça farklı), <code>"yama"</code> (yalnızca üçüncü parça farklı).</p>',
      start: 'def guncelleme_turu(kurulu, son):\n    pass\n',
      sol: 'def _demet(surum):\n    parcalar = [int(p) for p in surum.split(".")]\n    return tuple((parcalar + [0, 0, 0])[:3])\n\ndef guncelleme_turu(kurulu, son):\n    k, s = _demet(kurulu), _demet(son)\n    if k >= s:\n        return "güncel"\n    if k[0] != s[0]:\n        return "büyük"\n    if k[1] != s[1]:\n        return "küçük"\n    return "yama"\n\nprint(guncelleme_turu("1.26.4", "2.1.0"), guncelleme_turu("2.1.4", "2.2"))\n',
      tests: 'assert guncelleme_turu("1.26.4", "2.1.0") == "büyük", "1.x -> 2.x büyük güncelleme"\nassert guncelleme_turu("2.1.4", "2.2") == "küçük", "2.1 -> 2.2 küçük; 2.2 = 2.2.0"\nassert guncelleme_turu("2.2.0", "2.2.3") == "yama"\nassert guncelleme_turu("2.10.0", "2.9.5") == "güncel", "2.10 > 2.9; metin olarak karşılaştırma yanlış sonuç verir"\nassert guncelleme_turu("3.1", "3.1.0") == "güncel", "eksik parça 0 sayılır"\nassert guncelleme_turu("2.9.0", "2.10.0") == "küçük"\n',
      hints: ['Sürümü int demetine çevir ve 3 parçaya tamamla.', 'Önce kurulu >= son mu bak, sonra hangi parçanın farklı olduğuna.'],
      why: 'Semver\'e göre büyük sürüm farkı kırıcı değişiklik riski taşır ve test gerektirir; yama güncellemeleri genelde güvenle uygulanır. Bu ayrım Dependabot gibi araçların güncelleme gruplamasının temelidir.' },
    { t: 'code', stage: 'Kendin yaz', id: 'kutuphane-turu-6', diff: 2,
      q: '<p>Aşağıdaki <code>KATALOG</code> verildi. <code>kutuphane_oner(etiket, tarayicida=False)</code> yaz: <code>etiketler</code> listesinde <code>etiket</code> geçen kütüphanelerin adlarını döndürsün. <code>tarayicida=True</code> ise yalnızca tarayıcıda çalışanlar. Sonuç <code>populerlik</code> değerine göre büyükten küçüğe, eşitlikte ada göre alfabetik sıralı olsun.</p>',
      start: 'KATALOG = [\n    {"ad": "pandas", "etiketler": ["veri", "analiz", "excel"], "tarayici": True, "populerlik": 98},\n    {"ad": "polars", "etiketler": ["veri", "analiz", "hiz"], "tarayici": True, "populerlik": 80},\n    {"ad": "openpyxl", "etiketler": ["excel", "ofis"], "tarayici": False, "populerlik": 85},\n    {"ad": "matplotlib", "etiketler": ["grafik"], "tarayici": True, "populerlik": 95},\n    {"ad": "plotly", "etiketler": ["grafik", "etkilesimli"], "tarayici": False, "populerlik": 85},\n    {"ad": "seaborn", "etiketler": ["grafik", "istatistik"], "tarayici": False, "populerlik": 85},\n]\n\ndef kutuphane_oner(etiket, tarayicida=False):\n    pass\n',
      sol: 'KATALOG = [\n    {"ad": "pandas", "etiketler": ["veri", "analiz", "excel"], "tarayici": True, "populerlik": 98},\n    {"ad": "polars", "etiketler": ["veri", "analiz", "hiz"], "tarayici": True, "populerlik": 80},\n    {"ad": "openpyxl", "etiketler": ["excel", "ofis"], "tarayici": False, "populerlik": 85},\n    {"ad": "matplotlib", "etiketler": ["grafik"], "tarayici": True, "populerlik": 95},\n    {"ad": "plotly", "etiketler": ["grafik", "etkilesimli"], "tarayici": False, "populerlik": 85},\n    {"ad": "seaborn", "etiketler": ["grafik", "istatistik"], "tarayici": False, "populerlik": 85},\n]\n\ndef kutuphane_oner(etiket, tarayicida=False):\n    adaylar = [k for k in KATALOG if etiket in k["etiketler"] and (k["tarayici"] or not tarayicida)]\n    adaylar.sort(key=lambda k: (-k["populerlik"], k["ad"]))\n    return [k["ad"] for k in adaylar]\n\nprint(kutuphane_oner("grafik"), kutuphane_oner("excel", tarayicida=True))\n',
      tests: 'assert kutuphane_oner("grafik") == ["matplotlib", "plotly", "seaborn"], "popülerlik azalan, eşitlikte (85) ada göre"\nassert kutuphane_oner("grafik", tarayicida=True) == ["matplotlib"], "tarayıcı filtresi"\nassert kutuphane_oner("excel") == ["pandas", "openpyxl"], "excel etiketi: pandas 98, openpyxl 85"\nassert kutuphane_oner("excel", tarayicida=True) == ["pandas"]\nassert kutuphane_oner("oyun") == [], "eşleşme yoksa boş liste"\n',
      hints: ['Önce süz, sonra sırala.', 'Karışık yönlü sıralama: key=lambda k: (-k["populerlik"], k["ad"])'],
      why: 'Sayısal alanı eksiye çevirerek tek sort çağrısında azalan + artan sıralama yapılır. Gerçek hayatta bu katalog, ekibin onaylı paket listesidir.' },
    { t: 'code', stage: 'Kendin yaz', id: 'kutuphane-turu-7', diff: 2,
      q: '<p>Typosquatting avcısı: <code>supheli_paketler(adlar, bilinenler)</code> yaz. <code>adlar</code> içindeki her paket için: <code>bilinenler</code>\'de birebir varsa (küçük harfle karşılaştır) atla; yoksa <code>difflib.get_close_matches(ad, bilinenler, n=1, cutoff=0.8)</code> ile en yakın bilinen adı bul. Bulunursa sonuca <code>{ad: benzedigi}</code> ekle. Sözlük döndür.</p>',
      start: 'import difflib\n\ndef supheli_paketler(adlar, bilinenler):\n    pass\n',
      sol: 'import difflib\n\ndef supheli_paketler(adlar, bilinenler):\n    bilinen = [b.lower() for b in bilinenler]\n    sonuc = {}\n    for ad in adlar:\n        kucuk = ad.lower()\n        if kucuk in bilinen:\n            continue\n        yakin = difflib.get_close_matches(kucuk, bilinen, n=1, cutoff=0.8)\n        if yakin:\n            sonuc[ad] = yakin[0]\n    return sonuc\n\nprint(supheli_paketler(["reqeusts", "pandas", "djnago"], ["requests", "pandas", "django"]))\n',
      tests: 'bilinen = ["requests", "pandas", "numpy", "django", "flask", "urllib3"]\nr = supheli_paketler(["reqeusts", "pandas", "pandsa", "djnago", "Flask", "urlib3", "polars"], bilinen)\nassert r == {"reqeusts": "requests", "pandsa": "pandas", "djnago": "django", "urlib3": "urllib3"}, f"beklenen şüpheliler farklı: {r}"\nassert "Flask" not in r, "büyük-küçük harf farkı şüpheli sayılmamalı"\nassert "polars" not in r, "hiçbir bilinene yeterince benzemeyen ad şüpheli değil (yeni paket olabilir)"\nassert supheli_paketler([], bilinen) == {}\n',
      hints: ['difflib.get_close_matches liste döndürür; boşsa eşleşme yoktur.', 'Birebir eşleşmeyi önce kontrol et; yoksa paket kendisine benzediği için şüpheli görünür.'],
      why: 'Benzerlik oranı yüksek ama birebir aynı olmayan ad, typosquatting\'in tipik işaretidir. Gerçek güvenlik araçları bunu indirme sayısı ve yayımlanma tarihi gibi sinyallerle birleştirir.' },
    { t: 'code', stage: 'Kendin yaz', id: 'kutuphane-turu-8', diff: 2,
      q: '<p>rich ile rapor: <code>tablo_metni(satirlar, baslik)</code> fonksiyonunu yaz. <code>satirlar</code> <code>(kutuphane, alan)</code> demetleri listesi. <code>rich.table.Table(title=baslik)</code> oluştur, <code>"Kütüphane"</code> ve <code>"Alan"</code> sütunlarını ekle, satırları ekle. Tabloyu <code>Console(file=io.StringIO(), width=60)</code> ile yazdır ve oluşan metni döndür.</p>',
      start: 'import io\n\ndef tablo_metni(satirlar, baslik):\n    pass\n',
      sol: 'import io\nfrom rich.console import Console\nfrom rich.table import Table\n\ndef tablo_metni(satirlar, baslik):\n    tablo = Table(title=baslik)\n    tablo.add_column("Kütüphane")\n    tablo.add_column("Alan")\n    for kutuphane, alan in satirlar:\n        tablo.add_row(kutuphane, alan)\n    tampon = io.StringIO()\n    Console(file=tampon, width=60).print(tablo)\n    return tampon.getvalue()\n\nprint(tablo_metni([("pandas", "veri"), ("pytest", "test")], "Seçimler"))\n',
      tests: 'm = tablo_metni([("pandas", "veri"), ("FastAPI", "web"), ("pytest", "test")], "Yığın")\nassert isinstance(m, str) and m.strip(), "metin döndürülmeli (StringIO içeriği)"\nfor parca in ["Yığın", "Kütüphane", "Alan", "pandas", "FastAPI", "pytest", "web"]:\n    assert parca in m, f"tablo metninde {parca} olmalı"\nassert m.count("\\n") >= 7, "başlık, sütun başlığı, çizgiler ve 3 satırla en az 7 satır olmalı"\nassert "rich" in __source__, "tabloyu rich ile üret"\n',
      hints: ['Console(file=...) çıktıyı ekrana değil, verdiğin dosya benzeri nesneye yazar.', 'tampon.getvalue() yazılan metni verir.'],
      why: 'rich çıktısını StringIO\'ya yönlendirmek, aynı tabloyu hem terminalde göstermeye hem de log dosyasına ya da teste koymaya yarar. Testte de çıktıyı böyle yakalarsın.' },
    { t: 'code', stage: 'Hata avı', kind: 'bug', id: 'kutuphane-turu-9', diff: 2,
      q: '<p><b>Hatayı bul ve düzelt.</b> Sürüm yönetim betiği, bir paketin yayımlanmış sürümleri arasından en yenisini seçmeli. <code>en_yeni_surum(["2.9.1", "2.10.0", "2.2.3"])</code> <code>"2.10.0"</code> vermeli ama <code>"2.9.1"</code> veriyor.</p>',
      start: 'def en_yeni_surum(surumler):\n    if not surumler:\n        return None\n    return max(surumler)\n\nprint(en_yeni_surum(["2.9.1", "2.10.0", "2.2.3"]))\n',
      sol: 'def en_yeni_surum(surumler):\n    if not surumler:\n        return None\n    return max(surumler, key=lambda s: tuple(int(p) for p in s.split(".")))\n\nprint(en_yeni_surum(["2.9.1", "2.10.0", "2.2.3"]))\n',
      tests: 'assert en_yeni_surum(["2.9.1", "2.10.0", "2.2.3"]) == "2.10.0", "2.10.0 en yeni; metin karşılaştırması 9 > 1 der"\nassert en_yeni_surum(["1.0.10", "1.0.9"]) == "1.0.10", "yama numarası da sayısal karşılaştırılmalı"\nassert en_yeni_surum(["3.0"]) == "3.0"\nassert en_yeni_surum([]) is None, "boş listede None"\n',
      hints: ['max metinleri alfabetik karşılaştırır.', 'max(..., key=...) ile karşılaştırmayı sayı demeti üzerinden yap.'],
      why: 'Metin karşılaştırması karakter karakter gider ve "2.9" ile "2.10" arasında "9" > "1" diye karar verir. key ile her sürümü int demetine çevirince doğru sıra çıkar; orijinal metin yine döndürülür.' },
    { t: 'code', stage: 'Hata avı', kind: 'bug', id: 'kutuphane-turu-10', diff: 2,
      q: '<p><b>Hatayı bul ve düzelt.</b> <code>ice_aktarma_adi(pip_adi)</code> pip ile kurulan paketin import adını tahmin ediyor: <code>-</code> işaretlerini <code>_</code> yapıp küçük harfe çeviriyor. Ama ekip "scikit-learn kurdum, scikit_learn import edilemiyor" diye şikâyet ediyor. Bilinen istisnaları (<code>scikit-learn</code>→<code>sklearn</code>, <code>beautifulsoup4</code>→<code>bs4</code>, <code>python-dateutil</code>→<code>dateutil</code>, <code>pyyaml</code>→<code>yaml</code>, <code>pillow</code>→<code>PIL</code>) doğru döndürecek şekilde düzelt. pip adları büyük-küçük harf duyarsızdır.</p>',
      start: 'def ice_aktarma_adi(pip_adi):\n    return pip_adi.replace("-", "_").lower()\n\nprint(ice_aktarma_adi("scikit-learn"))\n',
      sol: 'ISTISNALAR = {\n    "scikit-learn": "sklearn",\n    "beautifulsoup4": "bs4",\n    "python-dateutil": "dateutil",\n    "pyyaml": "yaml",\n    "pillow": "PIL",\n}\n\ndef ice_aktarma_adi(pip_adi):\n    anahtar = pip_adi.lower().replace("_", "-")\n    if anahtar in ISTISNALAR:\n        return ISTISNALAR[anahtar]\n    return anahtar.replace("-", "_")\n\nprint(ice_aktarma_adi("scikit-learn"))\n',
      tests: 'assert ice_aktarma_adi("scikit-learn") == "sklearn", "scikit-learn import adı sklearn"\nassert ice_aktarma_adi("BeautifulSoup4") == "bs4", "büyük harfli yazım da tanınmalı"\nassert ice_aktarma_adi("python-dateutil") == "dateutil"\nassert ice_aktarma_adi("PyYAML") == "yaml"\nassert ice_aktarma_adi("Pillow") == "PIL", "PIL büyük harfle import edilir; istisna değeri olduğu gibi dönmeli"\nassert ice_aktarma_adi("typing-extensions") == "typing_extensions", "istisna olmayanlarda - yerine _"\nassert ice_aktarma_adi("Django") == "django"\n',
      hints: ['Kural her paket için geçerli değil; istisnalar için bir sözlük gerekir.', 'Önce adı normalleştir (küçük harf, _ yerine -), sonra sözlükte ara.', 'PIL\'i lower() ile bozmamak için istisna değerini dönüştürmeden döndür.'],
      why: 'Dağıtım adı (pip) ile modül adı (import) arasında zorunlu bir bağ yoktur. Normalleştirilmiş adla istisna tablosuna bakmak, araçların (ör. pipreqs) kullandığı yöntemdir.' },
    { t: 'code', stage: 'Meydan okuma', id: 'kutuphane-turu-11', diff: 3,
      q: '<p>PyPI JSON API\'sinden (<code>https://pypi.org/pypi/&lt;paket&gt;/json</code>) gelen yanıtı tarayıcıda taklit ediyoruz. <code>paket_karnesi(json_metni, bugun)</code> yaz. <code>bugun</code> bir <code>datetime.date</code>. Döndüreceğin sözlük:</p><ul><li><code>"ad"</code>, <code>"son_surum"</code> (<code>info.version</code>), <code>"lisans"</code> (<code>info.license</code>; boş ya da None ise <code>"BELİRSİZ"</code>)</li><li><code>"surum_sayisi"</code>: <code>releases</code> içinde en az bir dosyası olan sürüm sayısı</li><li><code>"son_yayin"</code>: tüm dosyaların <code>upload_time</code> değerlerinin en yenisinin tarihi (<code>"YYYY-MM-DD"</code> metni)</li><li><code>"bakimli"</code>: son yayın <code>bugun</code>\'den en fazla 365 gün önceyse True</li><li><code>"puan"</code>: bakımlıysa 2, lisans belirliyse 1, sürüm sayısı 5 ya da fazlaysa 1 puan; toplam</li></ul>',
      start: 'import json\nfrom datetime import date, datetime\n\ndef paket_karnesi(json_metni, bugun):\n    pass\n',
      sol: 'import json\nfrom datetime import date, datetime\n\ndef paket_karnesi(json_metni, bugun):\n    veri = json.loads(json_metni)\n    info = veri["info"]\n    dolu = {s: dosyalar for s, dosyalar in veri.get("releases", {}).items() if dosyalar}\n    zamanlar = [datetime.fromisoformat(d["upload_time"]).date() for dosyalar in dolu.values() for d in dosyalar]\n    son = max(zamanlar) if zamanlar else None\n    bakimli = son is not None and (bugun - son).days <= 365\n    lisans = info.get("license") or "BELİRSİZ"\n    puan = (2 if bakimli else 0) + (1 if lisans != "BELİRSİZ" else 0) + (1 if len(dolu) >= 5 else 0)\n    return {\n        "ad": info["name"],\n        "son_surum": info["version"],\n        "lisans": lisans,\n        "surum_sayisi": len(dolu),\n        "son_yayin": son.isoformat() if son else None,\n        "bakimli": bakimli,\n        "puan": puan,\n    }\n\nornek = \'{"info": {"name": "am-pdf", "version": "1.2.0", "license": "MIT"}, "releases": {"1.2.0": [{"upload_time": "2026-05-01T10:00:00"}]}}\'\nprint(paket_karnesi(ornek, date(2026, 10, 28)))\n',
      tests: 'import json\nfrom datetime import date\nbugun = date(2026, 10, 28)\nveri = {"info": {"name": "am-rapor", "version": "2.1.0", "license": "BSD-3-Clause"},\n        "releases": {"1.0.0": [{"upload_time": "2023-01-10T09:00:00"}], "1.1.0": [{"upload_time": "2023-06-01T09:00:00"}],\n                     "2.0.0": [{"upload_time": "2025-02-02T09:00:00"}, {"upload_time": "2025-02-03T11:30:00"}],\n                     "2.0.1": [], "2.1.0": [{"upload_time": "2026-03-15T08:00:00"}],\n                     "0.9.0": [{"upload_time": "2022-12-01T09:00:00"}]}}\nk = paket_karnesi(json.dumps(veri), bugun)\nassert k["ad"] == "am-rapor" and k["son_surum"] == "2.1.0", "ad ve son sürüm info\'dan"\nassert k["lisans"] == "BSD-3-Clause"\nassert k["surum_sayisi"] == 5, "dosyası olmayan 2.0.1 sayılmaz: 5 sürüm"\nassert k["son_yayin"] == "2026-03-15", "en yeni upload_time tarihi"\nassert k["bakimli"] is True, "227 gün önce: bakımlı"\nassert k["puan"] == 4, "2 (bakımlı) + 1 (lisans) + 1 (5 sürüm)"\neski = {"info": {"name": "am-eski", "version": "0.3", "license": ""}, "releases": {"0.3": [{"upload_time": "2025-10-27T23:59:00"}]}}\nk2 = paket_karnesi(json.dumps(eski), bugun)\nassert k2["lisans"] == "BELİRSİZ", "boş lisans BELİRSİZ"\nassert k2["bakimli"] is False, "366 gün önce: bakımlı değil"\nassert k2["puan"] == 0\nsinir = {"info": {"name": "x", "version": "1", "license": None}, "releases": {"1": [{"upload_time": "2025-10-28T00:00:00"}]}}\nassert paket_karnesi(json.dumps(sinir), bugun)["bakimli"] is True, "tam 365 gün önce hâlâ bakımlı"\n',
      hints: ['json.loads ile sözlüğe çevir; releases değerleri dosya listeleridir.', 'datetime.fromisoformat("2026-03-15T08:00:00").date() tarih verir; tarih farkı timedelta, .days gün sayısı.', 'info.get("license") or "BELİRSİZ" hem None hem boş metni yakalar.'],
      why: 'Paket değerlendirmesini otomatikleştirmek, onlarca bağımlılığı olan projelerde riskli paketleri hızla bulur. Gerçek API ağ gerektirir; mantık burada aynen çalışır, yalnızca veri kaynağı değişir.' },
    { t: 'code', stage: 'Mini proje', id: 'kutuphane-turu-12', diff: 3,
      q: '<p>Ilgaz Bank bağımlılık denetçisi. <code>bagimlilik_denetimi(metin, katalog)</code> yaz; <code>metin</code> requirements.txt, <code>katalog</code> onaylı paketlerin <code>{ad: kategori}</code> sözlüğü. Her satırda (yorum ve boş satırları atla) adı önceki alıştırmalardaki gibi çıkar ve normalleştir (küçük harf, <code>_</code> → <code>-</code>). Döndür:</p><ul><li><code>"kategoriler"</code>: <code>{kategori: adet}</code> (yalnızca katalogdakiler)</li><li><code>"sabitlenmemis"</code>: <code>==</code> ya da <code>~=</code> içermeyen satırların adları</li><li><code>"supheli"</code>: katalogda olmayıp katalogdaki bir ada <code>difflib</code> ile 0.8 ve üzeri benzeyenler: <code>{ad: benzedigi}</code></li><li><code>"onaysiz"</code>: katalogda olmayan ve şüpheli de olmayanlar</li><li><code>"gecti"</code>: şüpheli ve onaysız hiç yoksa True</li></ul><p>Listeler satır sırasını korusun.</p>',
      start: 'import re, difflib\n\ndef bagimlilik_denetimi(metin, katalog):\n    pass\n',
      sol: 'import re, difflib\n\ndef _ad(satir):\n    return re.split(r"[\\[<>=!~; ]", satir, maxsplit=1)[0].lower().replace("_", "-")\n\ndef bagimlilik_denetimi(metin, katalog):\n    rapor = {"kategoriler": {}, "sabitlenmemis": [], "supheli": {}, "onaysiz": []}\n    for satir in metin.splitlines():\n        satir = satir.split("#")[0].strip()\n        if not satir:\n            continue\n        ad = _ad(satir)\n        if "==" not in satir and "~=" not in satir:\n            rapor["sabitlenmemis"].append(ad)\n        if ad in katalog:\n            kat = katalog[ad]\n            rapor["kategoriler"][kat] = rapor["kategoriler"].get(kat, 0) + 1\n            continue\n        yakin = difflib.get_close_matches(ad, list(katalog), n=1, cutoff=0.8)\n        if yakin:\n            rapor["supheli"][ad] = yakin[0]\n        else:\n            rapor["onaysiz"].append(ad)\n    rapor["gecti"] = not rapor["supheli"] and not rapor["onaysiz"]\n    return rapor\n\nkatalog = {"pandas": "veri", "requests": "web", "pytest": "test"}\nprint(bagimlilik_denetimi("pandas==2.2.2\\nreqeusts>=2.31\\npytest\\n", katalog))\n',
      tests: 'katalog = {"pandas": "veri", "numpy": "veri", "requests": "web", "pydantic": "doğrulama", "pytest": "test", "scikit-learn": "ml"}\nmetin = "# Ilgaz Bank risk servisi\\npandas==2.2.2\\nNumPy~=1.26.0\\nreqeusts>=2.31  # dikkat\\nscikit_learn==1.4.2\\n\\npydantic>=2\\nleftpad==0.1\\npytest\\n"\nr = bagimlilik_denetimi(metin, katalog)\nassert r["kategoriler"] == {"veri": 2, "ml": 1, "doğrulama": 1, "test": 1}, f"kategori sayıları: {r[\'kategoriler\']}"\nassert r["sabitlenmemis"] == ["reqeusts", "pydantic", "pytest"], f"== ya da ~= içermeyenler satır sırasıyla: {r[\'sabitlenmemis\']}"\nassert r["supheli"] == {"reqeusts": "requests"}, "reqeusts, requests\'e çok benziyor"\nassert r["onaysiz"] == ["leftpad"], "katalogda olmayan, benzemeyen paket"\nassert r["gecti"] is False\ntemiz = bagimlilik_denetimi("pandas==2.2.2\\npytest==8.2.0\\n", katalog)\nassert temiz["gecti"] is True and temiz["sabitlenmemis"] == [] and temiz["supheli"] == {}, "temiz dosya geçmeli"\nassert bagimlilik_denetimi("", katalog) == {"kategoriler": {}, "sabitlenmemis": [], "supheli": {}, "onaysiz": [], "gecti": True}\n',
      hints: ['Ad çıkarma için küçük bir yardımcı fonksiyon yaz; normalleştirmeyi orada yap.', 'Sabitleme denetimini adı çıkarmadan önce, satırın tamamı üzerinde yap.', 'difflib.get_close_matches(ad, list(katalog), n=1, cutoff=0.8)'],
      why: 'Bu denetçi, kurumsal CI hattında pull request\'leri otomatik inceleyen bir adımın çekirdeğidir: onaysız ya da şüpheli paket ve sabitlenmemiş sürüm, birleştirmeyi durdurur. Önceki alıştırmalardaki parçaları (ad çıkarma, normalleştirme, typosquatting) tek bir iş kuralında birleştirdin.' }
  ],
  faq: [
    { q: 'pandas mı polars mı öğrenmeliyim?', a: 'Önce pandas: iş ilanlarında, eğitimlerde ve mevcut kod tabanlarında en yaygını odur. Polars, büyük veri ve hız gereken yeni projelerde hızla yayılıyor; pandas\'ı bilen biri polars\'ın ifade (expression) mantığını birkaç günde öğrenir.' },
    { q: 'Flask, Django ve FastAPI arasında nasıl seçerim?', a: 'Yönetim paneli, kullanıcı girişi ve veritabanı modelleri hazır gelsin istiyorsan Django. Yalnızca JSON döndüren bir API yazıyorsan FastAPI (tip ipuçlarıyla doğrulama ve otomatik belge). Küçük, esnek ve öğrenmesi kolay bir şey istiyorsan Flask. Üçü de üretimde yaygındır.' },
    { q: 'Tarayıcıda çalışmayan bir kütüphaneyi nasıl öğreneceğim?', a: 'Derste mantığını taklit eden alıştırmaları burada yap, gerçek kütüphaneyi kendi bilgisayarında sanal ortamda kur. Belgedeki "Quickstart" örneğini birebir çalıştırmak, sonra kendi verinle değiştirmek en hızlı yoldur.' },
    { q: 'Bir paketin güvenli olduğundan nasıl emin olurum?', a: 'Kesin garanti yoktur ama riski azaltırsın: adı resmî belgeden kopyala, indirme ve bakım durumuna bak, sürümleri sabitle (==), pip-audit ile bilinen açıkları tara, kurumdaysan iç paket aynasını kullan. Hash denetimi için pip install --require-hashes de kullanılabilir.' },
    { q: 'GPL lisanslı bir paketi şirkette kullanabilir miyim?', a: 'Bu hukuki bir sorudur ve şirket politikasına bağlıdır. Genel kural: MIT, BSD ve Apache 2.0 izin verici lisanslardır, ticari kullanımda sorun çıkarmaz; GPL ve özellikle AGPL dağıttığın yazılım için kaynak açma yükümlülüğü getirebilir. Emin değilsen hukuk ekibine sor.' }
  ],
  mistakes: [
    { bad: 'pip install sklearn', good: 'pip install scikit-learn\n# kodda: import sklearn', why: 'pip adı ile import adı farklıdır; sklearn adlı PyPI paketi gerçek kütüphane değildir (kullanımdan kaldırılmış bir yer tutucudur).' },
    { bad: 'if "2.10.0" > "2.9.0":\n    guncelle()', good: 'if (2, 10, 0) > (2, 9, 0):\n    guncelle()', why: 'Sürüm metinleri karakter karakter karşılaştırılır ve "2.10" "2.9"dan küçük çıkar; sayı demetine ya da packaging.version\'a çevir.' },
    { bad: 'try:\n    import pandas\n    VAR = True\nexcept ImportError:\n    VAR = False', good: 'import importlib.util\nVAR = importlib.util.find_spec("pandas") is not None', why: 'Yalnızca var olup olmadığını öğrenmek için import etmek paketi yükler ve zaman alır; find_spec yüklemeden bakar. (Kullanacaksan try/import doğru kalıptır.)' },
    { bad: '# requirements.txt\npandas\nrequests\nopenpyxl', good: '# requirements.txt\npandas==2.2.2\nrequests==2.32.3\nopenpyxl==3.1.5', why: 'Sürümsüz bağımlılık her kurulumda farklı sürüm getirir; bir gün kırıcı bir sürüm sessizce gelir ve dün çalışan kod bugün çalışmaz.' }
  ]
});
})(window);
