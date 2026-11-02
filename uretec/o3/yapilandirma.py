LESSON = {
'id': 'yapilandirma',
'lv': 'orta',
'mod': 'Standart Kütüphane',
'min': 40,
'title': 'Yapılandırma dosyaları: JSON, YAML, TOML, INI ve ortam değişkenleri',
'sum': 'Ayarları koddan ayırır; JSON, YAML, TOML, INI ve .env dosyalarını okur, dev/test/prod ortamlarını katmanlı birleştirir, şemayı doğrular ve sırları koda gömmeden 12-factor ilkeleriyle yönetirsin.',
'goals': [
    'JSON, YAML (safe_load), TOML (tomllib) ve INI (configparser) dosyalarını okuyup doğru tiplere çevirebilirim.',
    'os.environ ve .env dosyalarıyla ortam değişkenlerini okur, metin değerleri güvenle int/bool\'a dönüştürebilirim.',
    'Varsayılan + dosya + ortam katmanlarını iç içe (deep) birleştirerek dev/test/prod ayarı üretebilirim.',
    'Yapılandırmayı elle şema doğrulamasından geçirip tüm hataları tek seferde raporlayabilirim.',
    'Sırları koddan ve depodan uzak tutar, loglarda maskeleyip 12-factor ilkelerini uygulayabilirim.',
],
'body': r'''
<h2>Neden önemli?</h2>
<p>Ilgaz Bank'ın kredi başvuru servisi üç yerde çalışıyor: geliştiricinin bilgisayarında (dev), test sunucusunda (test) ve gerçek müşterilere hizmet veren canlı ortamda (prod). Kod aynı; değişen şeyler veritabanı adresi, günlük kredi limiti, log seviyesi, e-posta gönderilip gönderilmeyeceği ve API anahtarları. Bunları kodun içine yazarsan her ortam için kodu değiştirmen, yeniden paketlemen gerekir; daha kötüsü, prod parolası bir gün GitHub'a gider.</p>
<p><b>Yapılandırma</b> (configuration, kısaca config), kod değişmeden programın davranışını değiştiren her şeydir. Bu derste yaygın beş biçimi okumayı, ortamları katmanlı birleştirmeyi, ayarı doğrulamayı ve sırları güvenle yönetmeyi öğreneceksin. JSON'un temelini <b>JSON ve CSV</b> dersinde, <code>tomllib</code>'e ilk bakışı <b>Sanal ortam ve paket yönetimi</b> dersinde gördün; burada hepsini yapılandırma gözüyle birleştiriyoruz.</p>

<h2>Biçimleri tanı</h2>
<div class="tbl-wrap"><table>
<tr><th>Biçim</th><th>Okuma</th><th>Yorum</th><th>Tipler</th><th>Nerede görürsün?</th></tr>
<tr><td>JSON</td><td><code>json</code> (standart)</td><td>Yok</td><td>str, sayı, bool, null, liste, nesne</td><td>API'ler, frontend ayarları</td></tr>
<tr><td>YAML</td><td><code>yaml.safe_load</code> (pyyaml)</td><td><code>#</code></td><td>JSON + tarih, çok satırlı metin, referans</td><td>Docker Compose, Kubernetes, GitHub Actions</td></tr>
<tr><td>TOML</td><td><code>tomllib</code> (3.11+, yalnız okuma)</td><td><code>#</code></td><td>Açık tipler, tarih-saat</td><td><code>pyproject.toml</code>, Rust/Cargo</td></tr>
<tr><td>INI</td><td><code>configparser</code> (standart)</td><td><code>#</code> <code>;</code></td><td>Hepsi metin; getint/getboolean ile çevirirsin</td><td>Eski uygulamalar, <code>setup.cfg</code>, Windows</td></tr>
<tr><td>.env</td><td><code>os.environ</code> + python-dotenv</td><td><code>#</code></td><td>Hepsi metin</td><td>Sırlar, ortama özel değerler</td></tr>
</table></div>
<p>Kural: insanın düzenleyeceği ayar dosyası için TOML ya da YAML, makinelerin alışverişi için JSON, sırlar ve ortama özgü küçük değerler için ortam değişkeni (environment variable).</p>

<h2>YAML: okunaklı ama tuzaklı</h2>
<p>YAML girinti ile yapı kurar, yorum destekler ve çok okunaklıdır. Python'da üçüncü parti <code>pyyaml</code> ile okursun (<code>pip install pyyaml</code>; bu uygulamada hazır). Her zaman <code>yaml.safe_load</code> kullan: <code>yaml.load</code> uygun olmayan bir yükleyiciyle dosyadaki etiketlerden (tag) Python nesnesi oluşturabilir, bu da güvenilmeyen dosyada kod çalıştırma açığı demektir.</p>
<pre class="py">import yaml
metin = """
uygulama: kredi-servisi
surum: "1.4"
veritabani:
  host: db.ilgazbank.local
  port: 5432
subeler: [Ankara, İzmir, Bursa]
eposta_gonder: true
"""
ayar = yaml.safe_load(metin)
print(ayar["veritabani"]["port"] + 1, type(ayar["eposta_gonder"]).__name__)
print(ayar["subeler"][1])
print(yaml.dump(ayar, allow_unicode=True, sort_keys=False))</pre>
<p>YAML 1.1 kuralları (pyyaml bunları uygular) bazı değerleri sessizce başka tipe çevirir. Bu tuzaklar gerçek projelerde hataya yol açar:</p>
<pre class="py">import yaml
print(yaml.safe_load("ulke: NO\naktif: no\nevet: yes"))   # NO ve no -&gt; False!
print(yaml.safe_load("surum: 3.10"))                       # 3.1 (float)
print(yaml.safe_load("saat: 12:30"))                       # 750 (60'lık taban!)
print(yaml.safe_load("kod: 010"))                          # 8 (sekizlik taban)
print(yaml.safe_load('surum: "3.10"\nkod: "010"'))         # tırnakla metin kalır</pre>
<div class="warn"><b>Şüpheli her değeri tırnakla</b>Ülke kodu, sürüm numarası, başında sıfır olan kodlar, saat ve "yes/no/on/off" gibi kelimeler YAML'da tırnak içine yazılmalı. Bu sorun o kadar yaygındır ki adı bile vardır: "Norveç problemi" (Norway problem).</div>

<h2>TOML: açık tipler</h2>
<p>TOML, Python 3.11'den beri standart kütüphanededir (<code>tomllib</code>). Tipleri açıktır: metin her zaman tırnaklıdır, sayı ve tarih kendi tipindedir; YAML'daki sürprizler yoktur. <code>tomllib</code> yalnızca <b>okur</b>; yazmak için <code>tomli-w</code> paketi gerekir. Dosyadan okurken <code>tomllib.load</code> ikili modda açılmış dosya ister.</p>
<pre class="py">import tomllib
metin = """
[uygulama]
ad = "kredi-servisi"
baslangic = 2026-01-15

[veritabani]
host = "db.ilgazbank.local"
port = 5432

[[sube]]
ad = "Kızılay"
sehir = "Ankara"

[[sube]]
ad = "Alsancak"
sehir = "İzmir"
"""
ayar = tomllib.loads(metin)
print(ayar["uygulama"]["baslangic"].year, ayar["veritabani"]["port"])
print([s["ad"] for s in ayar["sube"]])
try:
    tomllib.loads("port = 5432\nport = 5433")
except tomllib.TOMLDecodeError as e:
    print("Hatalı TOML:", e)</pre>
<p><code>[[sube]]</code> bir <b>tablo dizisi</b> (array of tables) tanımlar; her blok listeye bir sözlük ekler. Aynı anahtarın iki kez yazılması TOML'da hatadır; YAML ise sessizce sonuncuyu alır.</p>

<h2>INI: configparser</h2>
<p>INI dosyası bölümlerden (<code>[bolum]</code>) ve <code>anahtar = değer</code> satırlarından oluşur. <code>configparser</code> her değeri <b>metin</b> olarak saklar; tipi sen istersin: <code>getint</code>, <code>getfloat</code>, <code>getboolean</code>. <code>getboolean</code> 1/yes/true/on ve 0/no/false/off değerlerini tanır. <code>[DEFAULT]</code> bölümündeki anahtarlar her bölüme miras kalır; anahtar adları büyük-küçük harf duyarsızdır.</p>
<pre class="py">import configparser
metin = """
[DEFAULT]
zaman_asimi = 30

[veritabani]
Host = localhost
port = 5432
debug = yes

[odeme_api]
url = https://odeme.example/v1
zaman_asimi = 5
"""
c = configparser.ConfigParser()
c.read_string(metin)
db = c["veritabani"]
print(db["host"], type(db["port"]).__name__, db.getint("port"))
print(db.getboolean("debug"), db.getint("zaman_asimi"))
print(c.getint("odeme_api", "zaman_asimi"), c.getint("odeme_api", "tekrar", fallback=3))
print(c.sections())</pre>
<p><code>fallback</code> eksik anahtar için varsayılan değer verir; vermezsen <code>c.getint(bolum, anahtar)</code> <code>NoOptionError</code> verir. <code>[DEFAULT]</code> bölümü <code>sections()</code> listesinde görünmez.</p>
<div class="tip"><b>Bölüm nesnesi ile parser farkı</b><code>c["veritabani"].getint("yok")</code> eksik anahtarda hata vermez, sessizce <code>None</code> döndürür. Zorunlu bir alanı bu yolla okursan hata ancak <code>None + 1</code> gibi bir işlemde, çok sonra çıkar. Zorunlu alanlar için <code>c.getint("veritabani", "port")</code> ya da <code>c["veritabani"]["port"]</code> (KeyError verir) kullan.</div>

<h2>Ortam değişkenleri ve .env</h2>
<p>İşletim sistemi her sürece bir ortam değişkenleri sözlüğü verir; Python'da <code>os.environ</code>'dur. Değerler <b>her zaman metindir</b>. Okurken <code>os.environ["AD"]</code> eksikse KeyError verir (zorunlu ayar için doğrusu bu), <code>os.environ.get("AD", varsayilan)</code> ise varsayılana düşer.</p>
<pre class="py">import os
os.environ["ANADOLU_PORT"] = "8080"
os.environ["ANADOLU_DEBUG"] = "false"
port = int(os.environ.get("ANADOLU_PORT", "8000"))
yanlis_debug = bool(os.environ["ANADOLU_DEBUG"])          # boş olmayan metin -&gt; True!
dogru_debug = os.environ["ANADOLU_DEBUG"].lower() in {"1", "true", "yes", "on", "evet"}
print(port + 1, yanlis_debug, dogru_debug)
print(os.environ.get("ANADOLU_YOK", "varsayılan"))
try:
    os.environ["ANADOLU_DB_PAROLA"]
except KeyError as e:
    print("Zorunlu ayar eksik:", e)</pre>
<p>Geliştirme sırasında onlarca değişkeni elle tanımlamak yerine proje kökünde bir <code>.env</code> dosyası tutulur ve <code>python-dotenv</code> paketi onu <code>os.environ</code>'a yükler:</p>
<pre class="code"># .env  (DEPOYA GİRMEZ, .gitignore'da)
APP_ENV=dev
ANADOLU_DB_URL=postgresql://localhost:5432/kredi
ANADOLU_DB_PAROLA="gizli parola"

# uygulama.py
from dotenv import load_dotenv
import os
load_dotenv()                      # .env'i okur, var olan değişkenleri EZMEZ
print(os.environ["APP_ENV"])</pre>
<div class="note"><b>Kendi bilgisayarında dene</b>python-dotenv tarayıcıda yüklü değildir: <code>pip install python-dotenv</code>. Mantığı basittir; alıştırmalarda kendi .env ayrıştırıcını yazacaksın. <code>load_dotenv</code> varsayılan olarak var olan ortam değişkenini değiştirmez; böylece sunucuda tanımlanan gerçek değer, unutulmuş bir .env dosyasından üstün gelir.</div>

<h2>Ortama göre ayar: katmanlı birleştirme</h2>
<p>Ölçeklenen projelerde ayar katmanlardan oluşur; sonraki katman öncekinin üzerine yazar:</p>
<div class="steps-list"><ol>
<li>Koddaki güvenli <b>varsayılanlar</b> (her ortamda ortak).</li>
<li>Ortak ayar dosyası (<code>ayar.yaml</code>).</li>
<li>Ortama özel bölüm ya da dosya (<code>ayar.prod.yaml</code>), <code>APP_ENV</code> değişkeniyle seçilir.</li>
<li>Ortam değişkenleri (sırlar ve son dakika değişiklikleri).</li>
<li>Gerekirse komut satırı argümanları.</li>
</ol></div>
<p>Sözlükleri <code>{**a, **b}</code> ya da <code>a | b</code> ile birleştirmek <b>yüzeyseldir</b> (shallow): iç içe bir sözlük komple değiştirilir. Prod dosyası yalnız <code>veritabani.host</code> değerini verdiyse <code>port</code> kaybolur. Bu yüzden iç içe (deep) birleştirme yazılır:</p>
<pre class="py">import copy
def birlestir(temel, ust):
    sonuc = copy.deepcopy(temel)
    for anahtar, deger in ust.items():
        if isinstance(deger, dict) and isinstance(sonuc.get(anahtar), dict):
            sonuc[anahtar] = birlestir(sonuc[anahtar], deger)
        else:
            sonuc[anahtar] = copy.deepcopy(deger)
    return sonuc

varsayilan = {"veritabani": {"host": "localhost", "port": 5432}, "log": "DEBUG", "limit": 50_000}
ortamlar = {
    "test": {"veritabani": {"host": "test-db"}},
    "prod": {"veritabani": {"host": "prod-db"}, "log": "WARNING"},
}
print(varsayilan | ortamlar["prod"])          # yüzeysel: port kayboldu
for ad in ["dev", "test", "prod"]:
    print(ad, birlestir(varsayilan, ortamlar.get(ad, {})))
print(varsayilan["veritabani"]["host"])         # varsayılan bozulmadı</pre>

<h2>Şema doğrulama: hızlı ve yüksek sesle hata ver</h2>
<p>Yanlış yazılmış bir ayar (port yerine "5432a", limit yerine eksi sayı) programın başlangıcında yakalanmalı; gece 3'te ilk kredi başvurusunda değil. Bu ilkeye <b>hızlı hata</b> (fail fast) denir. Büyük projelerde <code>pydantic</code> ya da JSON Schema kullanılır; mantığı anlamak için elle yazmak öğreticidir. İyi bir doğrulayıcı ilk hatada durmaz, <b>tüm hataları</b> toplayıp birlikte söyler.</p>
<pre class="py">SEMA = {"host": str, "port": int, "debug": bool, "limit": float}

def dogrula(ayar):
    hatalar = []
    for anahtar, tur in SEMA.items():
        if anahtar not in ayar:
            hatalar.append(f"eksik: {anahtar}")
            continue
        deger = ayar[anahtar]
        if tur is float and isinstance(deger, int) and not isinstance(deger, bool):
            deger = float(deger)                     # 50000 da float sayılır
        if not isinstance(deger, tur) or (tur is int and isinstance(deger, bool)):
            hatalar.append(f"tür: {anahtar} {tur.__name__} olmalı")
    if isinstance(ayar.get("port"), int) and not 1 &lt;= ayar["port"] &lt;= 65535:
        hatalar.append("aralık: port 1-65535 olmalı")
    return hatalar

print(dogrula({"host": "db", "port": 5432, "debug": False, "limit": 50000}))
print(dogrula({"host": "db", "port": True, "limit": "çok"}))
print(dogrula({"host": "db", "port": 70000, "debug": True, "limit": 1.5}))</pre>
<p><code>bool</code>, <code>int</code>'in alt sınıfıdır: <code>isinstance(True, int)</code> True döner. Port için <code>True</code> kabul etmemek adına bu durumu ayrıca eledik. Doğrulanan ayarı bir <code>@dataclass(frozen=True)</code> nesnesine çevirirsen program çalışırken kimse yanlışlıkla ayarı değiştiremez ve editörün otomatik tamamlama yapar.</p>

<h2>Sırlar ve 12-factor</h2>
<p>Parola, API anahtarı, token gibi <b>sırlar</b> (secrets) asla koda, depoya giren bir dosyaya ya da loga yazılmaz. Depoya yalnızca değerleri boş bir <code>.env.example</code> girer; gerçek <code>.env</code> <code>.gitignore</code>'dadır. Canlı ortamda sırlar bir sır yöneticisinden (Vault, AWS Secrets Manager, Azure Key Vault) ya da dağıtım platformunun ortam değişkenlerinden gelir. Bir sır bir kez depoya girdiyse, silmek yetmez: geçmişte durur; o sırrı <b>değiştirmen</b> (rotate) gerekir.</p>
<p><b>12-factor app</b>, bulutta çalışan uygulamalar için yaygın kabul görmüş bir ilkeler listesidir. Yapılandırmayla ilgili olanlar:</p>
<div class="tbl-wrap"><table>
<tr><th>İlke</th><th>Ne der?</th><th>Pratikte</th></tr>
<tr><td>III. Config</td><td>Ortama göre değişen her şey ortamda tutulur, kodda değil</td><td><code>os.environ</code>; kod depoyu açık kaynak yapsan bile sır sızmaz</td></tr>
<tr><td>IV. Backing services</td><td>Veritabanı, kuyruk gibi servisler adresle bağlanan kaynaklardır</td><td><code>DATABASE_URL</code> değiştirerek kod değişmeden başka veritabanına geçersin</td></tr>
<tr><td>V. Build, release, run</td><td>Derleme çıktısı + config = sürüm</td><td>Aynı paket dev, test ve prod'a gider; yalnız config değişir</td></tr>
<tr><td>X. Dev/prod parity</td><td>Ortamlar birbirine benzesin</td><td>Dev'de SQLite, prod'da PostgreSQL farkı sürpriz hata doğurur</td></tr>
</table></div>
<pre class="py">def maskele(deger, gorunur=4):
    deger = str(deger)
    return "*" * max(len(deger) - gorunur, 3) + deger[-gorunur:] if len(deger) &gt; gorunur else "***"

ayar = {"db_url": "postgresql://kredi@prod-db/kredi", "api_token": "tok_9f8e7d6c5b4a", "parola": "123"}
for anahtar, deger in ayar.items():
    gizli = any(k in anahtar for k in ("token", "parola", "secret", "key"))
    print(anahtar, "=", maskele(deger) if gizli else deger)</pre>
<div class="note"><b>Gerçek işte</b>Ekiplerde en sık görülen olay raporlarından biri, bir geliştiricinin test için koda yazdığı anahtarın açık depoya itilmesidir; otomatik tarayıcı botlar dakikalar içinde bulur. Bu yüzden şirketler depoya <code>gitleaks</code>, <code>detect-secrets</code> gibi tarayıcılar ve pre-commit kancaları ekler. Kod incelemesinde (code review) "bu değer nereden geliyor, prod'da ne olacak?" sorusu standarttır; başlangıçta ayarı doğrulayan ve eksik değişkenin adını açıkça söyleyen bir yükleyici, dağıtım gecesini kurtarır.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>İç içe ayarlar için ortam değişkeni adlandırma</h3>
<p>Ortam değişkenleri düzdür; iç içe yapıyı ad içinde kodlarsın: <code>ANADOLU_VERITABANI__HOST=prod-db</code>. Önek (<code>ANADOLU_</code>) başka uygulamaların değişkenleriyle çakışmayı, çift alt çizgi (<code>__</code>) iç içe anahtarı gösterir. pydantic-settings ve Dynaconf bu kuralı hazır uygular; Meydan okuma alıştırmasında kendin yazacaksın.</p>
<h3>Tipi varsayılandan çıkarmak</h3>
<p>Ortamdan gelen her şey metin olduğu için, değeri varsayılan ayardaki tipe göre çevirmek pratik bir yoldur: varsayılan int ise <code>int(...)</code>, bool ise evet/hayır tablosu. Bilinmeyen bir anahtar gelirse sessizce yok saymak yerine hata vermek, <code>ANADOLU_VERITABNI__HOST</code> gibi yazım hatalarını yakalar.</p>
<h3>Değişmez ayar nesnesi</h3>
<p><code>types.MappingProxyType(sozluk)</code> salt okunur bir sözlük görünümü verir; <code>@dataclass(frozen=True)</code> ise alan atamasını engeller. Ayarı tek bir yerde yükleyip uygulamaya değişmez nesne olarak dağıtmak, "bu değeri kim değiştirdi" sorusunu ortadan kaldırır.</p>
<h3>Özellik bayrakları</h3>
<p>Yeni bir özelliği kodla birlikte kapalı yayına alıp yapılandırmayla açmak (feature flag), riskli değişiklikleri geri almayı kolaylaştırır. Bayrakların ömrü kısa tutulmalı; açıldıktan sonra kod temizlenmezse yapılandırma dosyası zamanla anlaşılmaz hâle gelir.</p>
</section>
''',
'ex': [
# ---------------- Isınma
{'t': 'mc', 'stage': 'Isınma',
 'q': 'Ilgaz Bank kredi servisinin prod veritabanı parolası nerede tutulmalı?',
 'o': ['Kodda bir sabit olarak, örn. DB_PAROLA = "..."', 'Depoya giren ayar.yaml dosyasında', 'Ortam değişkeninde ya da sır yöneticisinde', 'README dosyasında, ekip bulabilsin diye'], 'a': 2,
 'why': 'Sırlar ortamdan (ortam değişkeni, sır yöneticisi) gelmelidir. Koda ya da depodaki bir dosyaya yazılan parola, git geçmişinde sonsuza kadar kalır ve depoya erişen herkes görür.'},
{'t': 'mc', 'stage': 'Isınma',
 'q': 'Kullanıcının yüklediği bir YAML dosyasını okurken neden <code>yaml.safe_load</code> kullanmalısın?',
 'o': ['safe_load belirgin biçimde daha hızlı çalışır', 'Yalnız temel tipleri üretir, keyfi nesne kurmaz', 'safe_load yorum satırlarını da sözlüğe ekler', 'yaml.load Python 3 sürümünde tamamen kaldırıldı'], 'a': 1,
 'why': 'yaml.load uygun olmayan bir yükleyiciyle YAML etiketlerinden Python nesneleri kurabilir; bu güvenilmeyen dosyada kod çalıştırma açığıdır. safe_load yalnızca sözlük, liste, metin, sayı, bool, null ve tarih üretir. Hız farkı ve yorum okuma konuyla ilgisizdir; yaml.load hâlâ vardır.'},
{'t': 'mc', 'stage': 'Isınma',
 'q': 'configparser ile okunan bir INI dosyasında <code>c["veritabani"]["port"]</code> ifadesinin türü nedir (dosyada <code>port = 5432</code> yazıyor)?',
 'o': ['int', 'str', 'float', 'Dosyadaki değere göre değişir'], 'a': 1,
 'why': 'configparser tüm değerleri metin olarak saklar. Sayı için c.getint("veritabani", "port") ya da bölüm üzerinde getint kullanmalısın. JSON, TOML ve YAML ise tipleri kendileri çözer.'},
# ---------------- Kodu oku
{'t': 'predict', 'stage': 'Kodu oku', 'q': 'pyyaml (YAML 1.1) ile bu kod ne yazdırır?',
 'code': r'''
import yaml
ayar = yaml.safe_load("ulke: NO\nsurum: 3.10\nkod: '010'")
print(ayar)
''',
 'o': ["{'ulke': 'NO', 'surum': '3.10', 'kod': '010'}", "{'ulke': False, 'surum': 3.1, 'kod': '010'}", "{'ulke': False, 'surum': 3.1, 'kod': 8}", "{'ulke': 'NO', 'surum': 3.1, 'kod': 8}"], 'a': 1,
 'why': 'YAML 1.1\'de NO bir bool değeridir (False), 3.10 bir float\'tır ve 3.1 olur. Tırnak içindeki \'010\' ise metin olarak kalır; tırnaksız 010 yazılsaydı sekizlik tabanda 8 olurdu.'},
{'t': 'predict', 'stage': 'Kodu oku', 'q': 'Bu kod ne yazdırır?',
 'code': r'''
import configparser
c = configparser.ConfigParser()
c.read_string("[DEFAULT]\nzaman_asimi = 30\n[odeme]\nzaman_asimi = 5\n[sms]\nsaglayici = x\n")
print(c.getint("odeme", "zaman_asimi"), c.getint("sms", "zaman_asimi"), len(c.sections()))
''',
 'o': ['5 30 3', '5 30 2', '30 30 2', 'NoOptionError hatası verir'], 'a': 1,
 'why': 'odeme bölümü kendi değerini (5) kullanır; sms bölümünde anahtar olmadığı için [DEFAULT]\'tan 30 miras alır. DEFAULT bölümü sections() listesinde sayılmaz, bu yüzden 2.'},
{'t': 'predict', 'stage': 'Kodu oku', 'q': 'Bu kod ne yazdırır?',
 'code': r'''
import os
os.environ["ANADOLU_LIMIT"] = "5"
limit = os.environ.get("ANADOLU_LIMIT", 10)
print(limit * 2)
''',
 'o': ['10', '20', '55', 'TypeError hatası verir'], 'a': 2,
 'why': 'Değişken tanımlı olduğu için varsayılan 10 kullanılmaz; gelen değer "5" metnidir. Metni 2 ile çarpmak onu tekrarlar: "55". Ortam değişkenlerini int(...) ile çevirmeyi unutmak sinsi bir hatadır çünkü program çökmez.'},
{'t': 'order', 'stage': 'Kodu oku',
 'q': '<p>İç içe sözlükleri birleştiren (deep merge) <code>birlestir(temel, ust)</code> fonksiyonunun satırlarını sırala. <code>ust</code>\'teki değerler önceliklidir; ikisinde de sözlük olan anahtarlar özyinelemeli birleştirilir.</p>',
 'lines': [
    'def birlestir(temel, ust):',
    '    sonuc = dict(temel)',
    '    for anahtar, deger in ust.items():',
    '        if isinstance(deger, dict) and isinstance(sonuc.get(anahtar), dict):',
    '            sonuc[anahtar] = birlestir(sonuc[anahtar], deger)',
    '        else:',
    '            sonuc[anahtar] = deger',
    '    return sonuc',
 ],
 'tests': r'''
_t = {"db": {"host": "localhost", "port": 5432}, "log": "DEBUG"}
_s = birlestir(_t, {"db": {"host": "prod-db"}, "log": "WARNING"})
assert _s == {"db": {"host": "prod-db", "port": 5432}, "log": "WARNING"}, "port korunmalı, host ve log ezilmeli"
assert _t["db"]["host"] == "localhost", "temel sözlük değişmemeli"
''',
 'hint': 'Önce sonuç sözlüğünü kopyala; döngüde iki tarafta da sözlük varsa kendini çağır, yoksa değeri doğrudan yaz.',
 'why': 'dict(temel) yeni bir dış sözlük oluşturur; iç sözlükler özyinelemeli çağrıda yeniden kopyalandığı için temel bozulmaz. Sözlük olmayan değerler (ya da temelde olmayan anahtarlar) doğrudan üzerine yazılır.'},
# ---------------- Rehberli
{'t': 'code', 'stage': 'Rehberli', 'id': 'yapilandirma-1', 'diff': 1,
 'q': '<p>Ortam değişkenlerini doğru tipe çeviren <code>env_oku(ad, varsayilan, tur=str)</code> fonksiyonunu yaz:</p><ul><li>Değişken <code>os.environ</code>\'da yoksa <code>varsayilan</code>\'ı <b>olduğu gibi</b> döndür.</li><li><code>tur</code> <code>int</code> ya da <code>float</code> ise metni o tipe çevir.</li><li><code>tur</code> <code>bool</code> ise küçük harfe çevrilmiş değer <code>"1", "true", "yes", "on", "evet"</code> → True; <code>"0", "false", "no", "off", "hayir", ""</code> → False; başka bir değer → <code>ValueError</code>.</li><li><code>tur</code> <code>str</code> ise metni döndür.</li></ul>',
 'guide': ['os.environ.get(ad) ile değeri al; None ise varsayılanı döndür.', 'tur is bool durumunu AYRICA ele al (bool("false") True verir!).', 'Doğru ve yanlış kelimeleri iki küme olarak tanımla, değeri .strip().lower() ile karşılaştır.', 'Kalan durumlarda tur(deger) yeterli: int("8080"), float("0.5"), str("x").'],
 'example': r'''
EVET = {"e", "evet"}
HAYIR = {"h", "hayir"}
for cevap in ["Evet", "h", "belki"]:
    c = cevap.lower()
    print(cevap, "->", True if c in EVET else False if c in HAYIR else "anlaşılmadı")
''',
 'start': r'''
import os

DOGRU = {"1", "true", "yes", "on", "evet"}
YANLIS = {"0", "false", "no", "off", "hayir", ""}

def env_oku(ad, varsayilan, tur=str):
    deger = os.environ.get(ad)
    # TODO: değer yoksa varsayılanı döndür
    # TODO: bool için kümelerle karşılaştır, değilse ValueError
    # TODO: diğer tipler için tur(deger)
    return deger
''',
 'sol': r'''
import os

DOGRU = {"1", "true", "yes", "on", "evet"}
YANLIS = {"0", "false", "no", "off", "hayir", ""}

def env_oku(ad, varsayilan, tur=str):
    deger = os.environ.get(ad)
    if deger is None:
        return varsayilan
    if tur is bool:
        d = deger.strip().lower()
        if d in DOGRU:
            return True
        if d in YANLIS:
            return False
        raise ValueError(f"{ad} için geçersiz bool değeri: {deger!r}")
    return tur(deger)
''',
 'tests': r'''
import os as _os
_os.environ.update({"T_PORT": "8080", "T_DEBUG": "False", "T_MAIL": "Evet", "T_ORAN": "0.25", "T_AD": "kredi", "T_BOZUK": "belki"})
_os.environ.pop("T_YOK", None)
assert env_oku("T_PORT", 8000, int) == 8080, "\"8080\" int\'e çevrilmeli"
assert env_oku("T_DEBUG", True, bool) is False, "\"False\" metni False olmalı (bool(\"False\") True verir, dikkat)"
assert env_oku("T_MAIL", False, bool) is True, "\"Evet\" büyük-küçük harf duyarsız True olmalı"
assert abs(env_oku("T_ORAN", 0.1, float) - 0.25) < 1e-9, "float çevrimi"
assert env_oku("T_AD", "x") == "kredi", "varsayılan tür str"
assert env_oku("T_YOK", 42, int) == 42, "değişken yoksa varsayılan döndürülmeli"
try:
    env_oku("T_BOZUK", False, bool)
    assert False, "\"belki\" için ValueError bekleniyordu"
except ValueError:
    pass
''',
 'hints': ['Önce "yok" durumunu ele al: if deger is None: return varsayilan', 'bool için: d = deger.strip().lower(); if d in DOGRU: return True; if d in YANLIS: return False; raise ValueError(...)', 'Son satır: return tur(deger)'],
 'why': 'Ortam değişkenleri her zaman metindir; bool("False") boş olmayan metin olduğu için True verir. Açık doğru/yanlış tablosu ve tanınmayan değerde hata vermek, "debug kapalı sanıyordum" türü prod kazalarını önler.'},
{'t': 'code', 'stage': 'Rehberli', 'id': 'yapilandirma-2', 'diff': 1,
 'q': '<p>Eski bir sistemden gelen INI metnini okuyan <code>db_ayari(ini_metni)</code> fonksiyonunu yaz. <code>[veritabani]</code> bölümünden şu sözlüğü döndürsün: <code>{"host": str, "port": int, "debug": bool, "zaman_asimi": float}</code>. <code>debug</code> yoksa False, <code>zaman_asimi</code> yoksa 30.0 olsun (<code>[DEFAULT]</code> bölümünde tanımlıysa oradan gelir). <code>host</code> ya da <code>port</code> eksikse configparser\'ın <code>NoOptionError</code> hatası yükselsin. Dikkat: bölüm nesnesindeki <code>b.getint("port")</code> eksik anahtarda hata vermez, <code>None</code> döndürür; zorunlu alanlar için <code>c.get(bolum, anahtar)</code> / <code>c.getint(bolum, anahtar)</code> kullan.</p>',
 'guide': ['configparser.ConfigParser() oluştur ve read_string ile metni yükle.', 'b = c["veritabani"] ile bölümü al.', 'c.get("veritabani", "host") ve c.getint("veritabani", "port") ile zorunlu alanları oku (eksikse hata verirler).', 'b.getboolean("debug", fallback=False) ve b.getfloat("zaman_asimi", fallback=30.0) ile isteğe bağlıları oku.'],
 'example': r'''
import configparser
c = configparser.ConfigParser()
c.read_string("[sms]\nadet = 3\naktif = on\n")
s = c["sms"]
print(s.getint("adet"), s.getboolean("aktif"), s.getfloat("ucret", fallback=0.5))
''',
 'start': r'''
import configparser

def db_ayari(ini_metni):
    c = configparser.ConfigParser()
    # TODO: metni oku, [veritabani] bölümünü al
    # TODO: tipleri getint/getboolean/getfloat ile çevir
    return {}
''',
 'sol': r'''
import configparser

def db_ayari(ini_metni):
    c = configparser.ConfigParser()
    c.read_string(ini_metni)
    b = c["veritabani"]
    return {
        "host": c.get("veritabani", "host"),
        "port": c.getint("veritabani", "port"),
        "debug": b.getboolean("debug", fallback=False),
        "zaman_asimi": b.getfloat("zaman_asimi", fallback=30.0),
    }
''',
 'tests': r'''
import configparser as _cp
_a = db_ayari("[veritabani]\nHOST = db.local\nport = 5432\ndebug = yes\nzaman_asimi = 2.5\n")
assert _a == {"host": "db.local", "port": 5432, "debug": True, "zaman_asimi": 2.5}, f"tam ayar yanlış okundu: {_a}"
_b = db_ayari("[veritabani]\nhost = db\nport = 6543\n")
assert _b["debug"] is False and _b["zaman_asimi"] == 30.0, "eksik debug False, eksik zaman_asimi 30.0 olmalı"
_c = db_ayari("[DEFAULT]\nzaman_asimi = 12\n[veritabani]\nhost = db\nport = 1\n")
assert _c["zaman_asimi"] == 12.0, "DEFAULT bölümündeki değer miras alınmalı"
assert isinstance(_a["port"], int), "port int olmalı"
try:
    db_ayari("[veritabani]\nhost = db\n")
    assert False, "port eksikken hata bekleniyordu"
except _cp.NoOptionError:
    pass
''',
 'hints': ['c.read_string(ini_metni) metni yükler; c["veritabani"] bir bölüm nesnesi verir.', 'Bölüm üzerinde getint, getboolean, getfloat metotları vardır ve fallback parametresi alır.', 'Zorunlu alanlar: c.get("veritabani", "host"), c.getint("veritabani", "port"); anahtar adları büyük-küçük harf duyarsızdır.'],
 'why': 'configparser her şeyi metin tutar; get* metotları hem çevirir hem DEFAULT mirasını uygular. fallback yalnız isteğe bağlı alanlarda kullanılır; zorunlu alan eksikse hatanın yükselmesi hızlı hata ilkesine uygundur.'},
{'t': 'code', 'stage': 'Rehberli', 'id': 'yapilandirma-3', 'diff': 2,
 'q': '<p>python-dotenv\'in çekirdeğini yaz: <code>env_ayristir(metin)</code> bir <code>.env</code> dosyasının içeriğini sözlüğe çevirsin. Kurallar:</p><ul><li>Boş satırlar ve <code>#</code> ile başlayan satırlar atlanır.</li><li>Satır başındaki isteğe bağlı <code>export </code> öneki yok sayılır.</li><li>Anahtar ve değer <b>ilk</b> <code>=</code> işaretinden bölünür; ikisinin de baş/son boşlukları kırpılır (değerde <code>=</code> olabilir: URL\'ler).</li><li>Değer tek ya da çift tırnakla sarılmışsa tırnaklar kaldırılır.</li><li><code>=</code> içermeyen satırlar atlanır.</li></ul>',
 'guide': ['Metni splitlines() ile satırlara böl ve her satırı strip et.', 'Boş, # ile başlayan ya da = içermeyen satırda continue.', 'removeprefix("export ") ile öneki at.', 'partition("=") ile ilk = işaretinden böl.', 'Değer en az 2 karakterse ve ilk ve son karakteri aynı tırnaksa [1:-1] ile soy.'],
 'example': r'''
satir = "URL = https://x.com/?a=1&b=2"
anahtar, _, deger = satir.partition("=")
print(repr(anahtar.strip()), repr(deger.strip()))
print("'abc'"[1:-1], "export X=1".removeprefix("export "))
''',
 'start': r'''
def env_ayristir(metin):
    sonuc = {}
    for satir in metin.splitlines():
        satir = satir.strip()
        # TODO: boş, yorum ve = içermeyen satırları atla
        # TODO: export önekini at, ilk = işaretinden böl
        # TODO: tırnakları soy ve sözlüğe ekle
    return sonuc
''',
 'sol': r'''
def env_ayristir(metin):
    sonuc = {}
    for satir in metin.splitlines():
        satir = satir.strip()
        if not satir or satir.startswith("#") or "=" not in satir:
            continue
        satir = satir.removeprefix("export ")
        anahtar, _, deger = satir.partition("=")
        anahtar, deger = anahtar.strip(), deger.strip()
        if len(deger) >= 2 and deger[0] == deger[-1] and deger[0] in "\"'":
            deger = deger[1:-1]
        sonuc[anahtar] = deger
    return sonuc
''',
 'tests': r'''
_m = """
# Ilgaz Bank kredi servisi
APP_ENV=dev
export DB_URL = postgresql://kredi:x@localhost:5432/kredi?ssl=1

DB_PAROLA="gizli = parola"
API_TOKEN='tok_123'
BOS=
bozuk satir
"""
_s = env_ayristir(_m)
assert _s.get("APP_ENV") == "dev", "basit KEY=VALUE okunmalı"
assert _s.get("DB_URL") == "postgresql://kredi:x@localhost:5432/kredi?ssl=1", "export öneki atılmalı, değer ilk = işaretinden sonra bütün kalmalı"
assert _s.get("DB_PAROLA") == "gizli = parola", "çift tırnak soyulmalı, içerideki = korunmalı"
assert _s.get("API_TOKEN") == "tok_123", "tek tırnak soyulmalı"
assert _s.get("BOS") == "", "boş değer boş metin olmalı"
assert len(_s) == 5, f"yorum ve bozuk satır atlanmalı, 5 anahtar bekleniyordu: {list(_s)}"
''',
 'hints': ['satir.partition("=") yalnızca ilk = işaretinden böler ve (önce, "=", sonra) döndürür.', 'Tırnak kontrolü: deger[0] == deger[-1] and deger[0] in "\\"\'"', 'Sırayla: atla → removeprefix → partition → strip → tırnak soy → ekle.'],
 'why': 'partition ilk ayraçta böldüğü için URL ve parola gibi = içeren değerler bozulmaz. Tırnak soyma yalnız iki uç aynı tırnaksa yapılır; böylece içinde tırnak geçen değerler yanlışlıkla kırpılmaz.'},
# ---------------- Kendin yaz
{'t': 'code', 'stage': 'Kendin yaz', 'id': 'yapilandirma-4', 'diff': 2,
 'q': '<p>Anadolu Market\'in YAML ayar dosyasında ortak ayarlar <code>varsayilan</code> anahtarında, ortama özel ayarlar <code>ortamlar</code> altında duruyor. <code>ortam_ayari(yaml_metni, ortam)</code> fonksiyonunu yaz: metni <code>yaml.safe_load</code> ile okusun, <code>varsayilan</code> ile <code>ortamlar[ortam]</code>\'ı <b>iç içe</b> birleştirsin (ortam öncelikli) ve sonucu döndürsün. Ortam tanımlı değilse <code>ValueError(f"Bilinmeyen ortam: {ortam}")</code> yükselsin. Bir ortamın bölümü boşsa (YAML\'da <code>dev:</code> → None) varsayılan aynen kullanılır.</p>',
 'start': r'''
import yaml

def ortam_ayari(yaml_metni, ortam):
    pass
''',
 'sol': r'''
import copy
import yaml

def _birlestir(temel, ust):
    sonuc = copy.deepcopy(temel)
    for k, v in ust.items():
        if isinstance(v, dict) and isinstance(sonuc.get(k), dict):
            sonuc[k] = _birlestir(sonuc[k], v)
        else:
            sonuc[k] = copy.deepcopy(v)
    return sonuc

def ortam_ayari(yaml_metni, ortam):
    veri = yaml.safe_load(yaml_metni)
    ortamlar = veri.get("ortamlar") or {}
    if ortam not in ortamlar:
        raise ValueError(f"Bilinmeyen ortam: {ortam}")
    return _birlestir(veri.get("varsayilan") or {}, ortamlar[ortam] or {})
''',
 'tests': r'''
_y = """
varsayilan:
  veritabani: {host: localhost, port: 5432}
  log: DEBUG
  odeme: {saglayici: sahte, zaman_asimi: 10}
ortamlar:
  dev:
  test:
    veritabani: {host: test-db}
  prod:
    veritabani: {host: prod-db}
    log: WARNING
    odeme: {saglayici: "gercek-pos"}
"""
assert ortam_ayari(_y, "dev") == {"veritabani": {"host": "localhost", "port": 5432}, "log": "DEBUG", "odeme": {"saglayici": "sahte", "zaman_asimi": 10}}, "boş dev bölümünde varsayılan aynen dönmeli"
_p = ortam_ayari(_y, "prod")
assert _p["veritabani"] == {"host": "prod-db", "port": 5432}, "port korunmalı (iç içe birleştirme): " + str(_p["veritabani"])
assert _p["odeme"] == {"saglayici": "gercek-pos", "zaman_asimi": 10}, "odeme.zaman_asimi korunmalı"
assert _p["log"] == "WARNING", "log ezilmeli"
assert ortam_ayari(_y, "test")["veritabani"]["host"] == "test-db"
try:
    ortam_ayari(_y, "staging")
    assert False, "tanımsız ortam için ValueError bekleniyordu"
except ValueError as e:
    assert "staging" in str(e), "hata mesajı ortam adını içermeli"
''',
 'hints': ['Yüzeysel birleştirme ({**a, **b}) iç sözlükleri komple değiştirir; özyinelemeli bir yardımcı fonksiyon yaz.', 'YAML\'da "dev:" boş bırakılırsa değeri None\'dır; "or {}" ile boş sözlüğe çevir.', 'Ortam yoksa: if ortam not in ortamlar: raise ValueError(f"Bilinmeyen ortam: {ortam}")'],
 'why': 'Ortam dosyası yalnızca farkı yazar; geri kalan her şey varsayılandan gelir. İç içe birleştirme olmadan prod\'da port, zaman aşımı gibi alanlar sessizce kaybolur ve hata ancak çalışma anında ortaya çıkar.'},
{'t': 'code', 'stage': 'Kendin yaz', 'id': 'yapilandirma-5', 'diff': 2,
 'q': '<p>Elle şema doğrulayıcı yaz: <code>dogrula(ayar, sema)</code>. <code>sema</code>, <code>{"anahtar": tip}</code> sözlüğüdür (tip: <code>str</code>, <code>int</code>, <code>float</code>, <code>bool</code>). Fonksiyon <b>tüm</b> hataları şu biçimdeki metinlerin listesi olarak, şemadaki anahtar sırasıyla döndürsün:</p><ul><li>Anahtar yoksa: <code>"eksik: &lt;anahtar&gt;"</code></li><li>Tip uymuyorsa: <code>"tür: &lt;anahtar&gt; &lt;tip_adı&gt; olmalı"</code></li></ul><p>Kurallar: <code>bool</code> değer <code>int</code> ya da <code>float</code> sayılmaz; <code>float</code> beklenen yerde <code>int</code> kabul edilir. Şemada olmayan anahtarlar için <code>"bilinmeyen: &lt;anahtar&gt;"</code> hatası en sona, alfabetik sırayla eklensin (yazım hatalarını yakalamak için). Hata yoksa boş liste.</p>',
 'start': r'''
def dogrula(ayar, sema):
    pass
''',
 'sol': r'''
def _uygun(deger, tip):
    if isinstance(deger, bool):
        return tip is bool
    if tip is float:
        return isinstance(deger, (int, float))
    return isinstance(deger, tip)

def dogrula(ayar, sema):
    hatalar = []
    for anahtar, tip in sema.items():
        if anahtar not in ayar:
            hatalar.append(f"eksik: {anahtar}")
        elif not _uygun(ayar[anahtar], tip):
            hatalar.append(f"tür: {anahtar} {tip.__name__} olmalı")
    for anahtar in sorted(set(ayar) - set(sema)):
        hatalar.append(f"bilinmeyen: {anahtar}")
    return hatalar
''',
 'tests': r'''
_S = {"host": str, "port": int, "debug": bool, "limit": float}
assert dogrula({"host": "db", "port": 5432, "debug": False, "limit": 50000}, _S) == [], "int, float alanında kabul edilmeli"
assert dogrula({"host": "db", "port": True, "debug": 1, "limit": 2.5}, _S) == ["tür: port int olmalı", "tür: debug bool olmalı"], "True int sayılmamalı, 1 bool sayılmamalı"
assert dogrula({"port": "5432", "limit": False}, _S) == ["eksik: host", "tür: port int olmalı", "eksik: debug", "tür: limit float olmalı"], "tüm hatalar şema sırasıyla toplanmalı"
assert dogrula({"host": "db", "port": 1, "debug": True, "limit": 1.0, "zaman_asmi": 5, "Debug": 1}, _S) == ["bilinmeyen: Debug", "bilinmeyen: zaman_asmi"], "bilinmeyen anahtarlar alfabetik sırayla sona eklenmeli"
''',
 'hints': ['Tip kontrolünü bir yardımcı fonksiyona al; önce isinstance(deger, bool) durumunu ele al çünkü bool, int\'in alt sınıfıdır.', 'float beklenirken isinstance(deger, (int, float)) yeterli (bool önceden elendi).', 'Bilinmeyenler: sorted(set(ayar) - set(sema))'],
 'why': 'Python\'da True == 1 ve isinstance(True, int) True olduğu için bool ayrı ele alınmazsa "port: true" gibi bir YAML hatası doğrulamadan geçer. Tüm hataları toplamak, dağıtımda tek tek düzeltip yeniden denemekten kurtarır.'},
{'t': 'code', 'stage': 'Kendin yaz', 'id': 'yapilandirma-6', 'diff': 2,
 'q': '<p>Uygulama açılışta ayarları loglamak istiyor ama sırlar loga düşmemeli. <code>maskele(ayar)</code> fonksiyonunu yaz: iç içe sözlüklerde de çalışsın; anahtar adı (büyük-küçük harf duyarsız) <code>"parola", "sifre", "secret", "token", "key"</code> parçalarından birini içeren her değeri <code>"***"</code> yapsın. Listelerin içindeki sözlükler de maskelensin. Orijinal sözlük <b>değişmesin</b>, yeni bir yapı döndürülsün.</p>',
 'start': r'''
GIZLI = ("parola", "sifre", "secret", "token", "key")

def maskele(ayar):
    pass
''',
 'sol': r'''
GIZLI = ("parola", "sifre", "secret", "token", "key")

def _gizli_mi(anahtar):
    a = str(anahtar).lower()
    return any(g in a for g in GIZLI)

def maskele(ayar):
    if isinstance(ayar, dict):
        return {k: "***" if _gizli_mi(k) else maskele(v) for k, v in ayar.items()}
    if isinstance(ayar, list):
        return [maskele(x) for x in ayar]
    return ayar
''',
 'tests': r'''
_a = {"app": "kredi", "db": {"host": "prod-db", "Parola": "S3cr3t!"}, "API_KEY": "abc", "entegrasyonlar": [{"ad": "pos", "token": "t-1"}, {"ad": "sms", "url": "https://sms"}], "limit": 5}
_m = maskele(_a)
assert _m == {"app": "kredi", "db": {"host": "prod-db", "Parola": "***"}, "API_KEY": "***", "entegrasyonlar": [{"ad": "pos", "token": "***"}, {"ad": "sms", "url": "https://sms"}], "limit": 5}, f"maskeleme yanlış: {_m}"
assert _a["db"]["Parola"] == "S3cr3t!" and _a["entegrasyonlar"][0]["token"] == "t-1", "orijinal sözlük değişmemeli"
assert maskele({"db_sifresi": {"x": 1}}) == {"db_sifresi": "***"}, "gizli anahtarın değeri sözlük olsa bile tamamen maskelenmeli"
''',
 'hints': ['Özyineleme: sözlük → her anahtar için karar ver; liste → her elemanı maskele; diğer → olduğu gibi döndür.', 'any(g in anahtar.lower() for g in GIZLI) ile anahtarı kontrol et.', 'Yeni sözlüğü comprehension ile kurarsan orijinal değişmez.'],
 'why': 'Loglar genellikle sırlardan daha geniş bir kitleye açıktır (destek ekibi, log servisi). Anahtar adına göre maskelemek basit ve etkilidir; yeni yapı döndürmek, maskelenmiş değerin yanlışlıkla uygulamada kullanılmasını engeller.'},
{'t': 'code', 'stage': 'Kendin yaz', 'id': 'yapilandirma-7', 'diff': 2,
 'q': '<p>Anadolu Market lojistik servisinin ayarı TOML\'da. <code>lojistik_ayari(toml_metni)</code> fonksiyonunu <code>tomllib</code> ile yaz. Dönüş: <code>{"adres": "host:port", "depolar": [...], "acilis": "YYYY-MM-DD"}</code>. <code>depolar</code>, <code>[[depo]]</code> tablolarından <b>aktif</b> olanların (<code>aktif</code> anahtarı yoksa aktif sayılır) adları, şehre sonra ada göre sıralı olsun. <code>acilis</code>, <code>[sunucu].acilis</code> tarihinin ISO metni. TOML hatalıysa <code>ValueError</code> yükselsin ve mesajı <code>"Geçersiz TOML"</code> ile başlasın.</p>',
 'start': r'''
import tomllib

def lojistik_ayari(toml_metni):
    pass
''',
 'sol': r'''
import tomllib

def lojistik_ayari(toml_metni):
    try:
        veri = tomllib.loads(toml_metni)
    except tomllib.TOMLDecodeError as e:
        raise ValueError(f"Geçersiz TOML: {e}") from e
    s = veri["sunucu"]
    aktifler = [d for d in veri.get("depo", []) if d.get("aktif", True)]
    aktifler.sort(key=lambda d: (d["sehir"], d["ad"]))
    return {"adres": f"{s['host']}:{s['port']}", "depolar": [d["ad"] for d in aktifler], "acilis": s["acilis"].isoformat()}
''',
 'tests': r'''
_t = """
[sunucu]
host = "lojistik.anadolumarket.local"
port = 9100
acilis = 2026-03-01

[[depo]]
ad = "Gebze-2"
sehir = "Kocaeli"

[[depo]]
ad = "Esenyurt"
sehir = "İstanbul"
aktif = false

[[depo]]
ad = "Gebze-1"
sehir = "Kocaeli"

[[depo]]
ad = "Sincan"
sehir = "Ankara"
aktif = true
"""
assert lojistik_ayari(_t) == {"adres": "lojistik.anadolumarket.local:9100", "depolar": ["Sincan", "Gebze-1", "Gebze-2"], "acilis": "2026-03-01"}, f"sonuç yanlış: {lojistik_ayari(_t)}"
try:
    lojistik_ayari("[sunucu]\nport = 1\nport = 2\n")
    assert False, "çift anahtar içeren TOML için ValueError bekleniyordu"
except ValueError as e:
    assert str(e).startswith("Geçersiz TOML"), "mesaj Geçersiz TOML ile başlamalı"
''',
 'hints': ['tomllib.loads metni sözlüğe çevirir; [[depo]] blokları veri["depo"] listesinde sözlük olarak gelir.', 'TOML tarihleri datetime.date olarak gelir; .isoformat() ile metne çevir.', 'Sıralama: key=lambda d: (d["sehir"], d["ad"]); hata: except tomllib.TOMLDecodeError → raise ValueError(...) from e'],
 'why': 'TOML tipleri açıktır: port int, acilis date gelir, çevirmen gerekmez. Kütüphane hatasını kendi alan hatana (ValueError) çevirmek, ayar yükleyiciyi kullanan kodun tomllib\'i bilmek zorunda kalmamasını sağlar.'},
# ---------------- Hata avı
{'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'yapilandirma-8', 'diff': 2,
 'q': '<p>Prod\'da <code>ANADOLU_DEBUG=false</code> tanımlı olduğu hâlde servis debug modunda açılıyor ve port hesabı da garip sonuç veriyor. <code>sunucu_ayari()</code> fonksiyonundaki <b>hataları bul ve düzelt</b>. Beklenen: <code>{"debug": bool, "port": int, "isci": int}</code>; <code>debug</code> yalnızca <code>"1", "true", "yes", "on"</code> (harf duyarsız) için True; <code>port</code> varsayılanı 8000; <code>isci</code> (worker) sayısı <code>port</code>\'tan bağımsız, <code>ANADOLU_ISCI</code> yoksa 4.</p>',
 'start': r'''
import os

def sunucu_ayari():
    debug = bool(os.environ.get("ANADOLU_DEBUG", "false"))
    port = os.environ.get("ANADOLU_PORT", 8000)
    isci = os.environ.get("ANADOLU_ISCI", 4)
    return {"debug": debug, "port": port, "isci": isci}
''',
 'sol': r'''
import os

def sunucu_ayari():
    debug = os.environ.get("ANADOLU_DEBUG", "false").strip().lower() in {"1", "true", "yes", "on"}
    port = int(os.environ.get("ANADOLU_PORT", "8000"))
    isci = int(os.environ.get("ANADOLU_ISCI", "4"))
    return {"debug": debug, "port": port, "isci": isci}
''',
 'tests': r'''
import os as _os
_os.environ.update({"ANADOLU_DEBUG": "false", "ANADOLU_PORT": "9000"})
_os.environ.pop("ANADOLU_ISCI", None)
_a = sunucu_ayari()
assert _a["debug"] is False, "\"false\" metni False olmalı; bool(\"false\") True verir"
assert _a["port"] == 9000, "port int olmalı (\"9000\" metni değil)"
assert _a["isci"] == 4, "varsayılan işçi sayısı 4"
_os.environ.update({"ANADOLU_DEBUG": "TRUE", "ANADOLU_ISCI": "8"})
_os.environ.pop("ANADOLU_PORT")
_b = sunucu_ayari()
assert _b == {"debug": True, "port": 8000, "isci": 8}, f"beklenen debug True, port 8000, isci 8: {_b}"
assert all(type(_b[k]) is int for k in ("port", "isci")), "port ve isci her durumda int olmalı"
''',
 'hints': ['bool() boş olmayan her metne True verir; metni bir doğru-kümesiyle karşılaştır.', 'Ortam değişkeni varsa metin, yoksa varsayılan (int) döner; iki durumda da tip aynı olsun diye int(...) ile sar.', 'Varsayılanları da metin yazmak ("8000") tek bir int(...) çağrısını yeterli kılar.'],
 'why': 'İki klasik hata: bool("false") True\'dur ve os.environ.get değişken varsa metin, yoksa senin verdiğin varsayılanı döndürür; tip ortama göre değişir. Tüm ortam değerlerini tek noktada açıkça çevirmek bu hataları kökten keser.'},
{'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'yapilandirma-9', 'diff': 2,
 'q': '<p>Testler tek tek çalışınca geçiyor ama birlikte çalışınca prod ayarı dev\'e sızıyor. <code>ayar_yukle(ust)</code> fonksiyonu <code>VARSAYILAN</code> üzerine <code>ust</code> sözlüğünü iç içe birleştirmeli ve <b>VARSAYILAN hiçbir zaman değişmemeli</b>. <b>Hatayı bul ve düzelt.</b></p>',
 'start': r'''
VARSAYILAN = {"db": {"host": "localhost", "port": 5432}, "debug": False, "subeler": ["Ankara"]}

def ayar_yukle(ust):
    sonuc = VARSAYILAN.copy()
    for k, v in ust.items():
        if isinstance(v, dict):
            sonuc[k].update(v)
        elif isinstance(v, list):
            sonuc[k].extend(v)
        else:
            sonuc[k] = v
    return sonuc
''',
 'sol': r'''
import copy

VARSAYILAN = {"db": {"host": "localhost", "port": 5432}, "debug": False, "subeler": ["Ankara"]}

def ayar_yukle(ust):
    sonuc = copy.deepcopy(VARSAYILAN)
    for k, v in ust.items():
        if isinstance(v, dict):
            sonuc[k].update(v)
        elif isinstance(v, list):
            sonuc[k].extend(v)
        else:
            sonuc[k] = v
    return sonuc
''',
 'tests': r'''
_p = ayar_yukle({"db": {"host": "prod-db"}, "debug": True, "subeler": ["İzmir"]})
assert _p == {"db": {"host": "prod-db", "port": 5432}, "debug": True, "subeler": ["Ankara", "İzmir"]}, f"prod ayarı yanlış: {_p}"
_d = ayar_yukle({})
assert _d["db"]["host"] == "localhost", "prod yüklemesi varsayılanı bozmamalı (yüzeysel kopya iç sözlüğü paylaşır)"
assert _d["subeler"] == ["Ankara"], "listeler de paylaşılmamalı"
assert VARSAYILAN == {"db": {"host": "localhost", "port": 5432}, "debug": False, "subeler": ["Ankara"]}, "VARSAYILAN hiç değişmemeli"
''',
 'hints': ['dict.copy() yüzeysel kopyadır: dış sözlük yeni, ama içteki sözlük ve liste aynı nesnelerdir.', 'sonuc[k].update(v) bu yüzden VARSAYILAN["db"]\'yi değiştirir.', 'copy.deepcopy(VARSAYILAN) ile tamamen bağımsız bir kopya al.'],
 'why': 'Yüzeysel kopyada iç sözlük ve liste paylaşılır; update ve extend onları yerinde değiştirdiği için modül düzeyindeki VARSAYILAN kirlenir ve sonraki her çağrı prod değerlerini görür. deepcopy her seviyeyi kopyalar.'},
# ---------------- Meydan okuma
{'t': 'code', 'stage': 'Meydan okuma', 'id': 'yapilandirma-10', 'diff': 3,
 'q': '<p>pydantic-settings tarzı bir ortam katmanı yaz: <code>ortamdan_uygula(ayar, ortam, onek="ANADOLU_")</code>.</p><ul><li><code>ortam</code> bir sözlüktür (os.environ gibi). Yalnızca <code>onek</code> ile başlayan değişkenler dikkate alınır.</li><li>Önekten sonraki ad küçük harfe çevrilir ve <code>__</code> (çift alt çizgi) ile iç içe yola bölünür: <code>ANADOLU_DB__HOST</code> → <code>ayar["db"]["host"]</code>.</li><li>Değer, ayardaki <b>mevcut değerin tipine</b> çevrilir: <code>bool</code> → "1/true/yes/on" True, "0/false/no/off" False, diğeri ValueError; <code>int</code>, <code>float</code> → çevir; <code>str</code> → olduğu gibi.</li><li>Yol ayarda yoksa ya da yol bir sözlüğün kendisini gösteriyorsa <code>KeyError</code> yükselsin (yazım hatası koruması), mesajda değişken adı geçsin.</li><li><code>ayar</code> değişmesin; yeni sözlük döndür.</li></ul>',
 'start': r'''
import copy

def ortamdan_uygula(ayar, ortam, onek="ANADOLU_"):
    pass
''',
 'sol': r'''
import copy

DOGRU = {"1", "true", "yes", "on"}
YANLIS = {"0", "false", "no", "off"}

def _cevir(metin, ornek, ad):
    if isinstance(ornek, bool):
        m = metin.strip().lower()
        if m in DOGRU:
            return True
        if m in YANLIS:
            return False
        raise ValueError(f"{ad}: bool bekleniyordu, gelen {metin!r}")
    if isinstance(ornek, (int, float)):
        return type(ornek)(metin)
    return metin

def ortamdan_uygula(ayar, ortam, onek="ANADOLU_"):
    sonuc = copy.deepcopy(ayar)
    for ad in sorted(ortam):
        if not ad.startswith(onek):
            continue
        yol = ad[len(onek):].lower().split("__")
        hedef = sonuc
        for parca in yol[:-1]:
            if not isinstance(hedef.get(parca), dict):
                raise KeyError(f"Bilinmeyen ayar: {ad}")
            hedef = hedef[parca]
        son = yol[-1]
        if son not in hedef or isinstance(hedef[son], dict):
            raise KeyError(f"Bilinmeyen ayar: {ad}")
        hedef[son] = _cevir(ortam[ad], hedef[son], ad)
    return sonuc
''',
 'tests': r'''
_a = {"db": {"host": "localhost", "port": 5432, "havuz": {"boyut": 5}}, "debug": False, "oran": 0.1, "ad": "kredi"}
_e = {"ANADOLU_DB__HOST": "prod-db", "ANADOLU_DB__HAVUZ__BOYUT": "20", "ANADOLU_DEBUG": "On", "ANADOLU_ORAN": "0.35", "PATH": "/usr/bin", "DIGER_DB__HOST": "x"}
_s = ortamdan_uygula(_a, _e)
assert _s == {"db": {"host": "prod-db", "port": 5432, "havuz": {"boyut": 20}}, "debug": True, "oran": 0.35, "ad": "kredi"}, f"sonuç yanlış: {_s}"
assert type(_s["db"]["havuz"]["boyut"]) is int and type(_s["oran"]) is float, "tipler mevcut değerden çıkarılmalı"
assert _a["db"]["host"] == "localhost" and _a["debug"] is False, "orijinal ayar değişmemeli"
for _bozuk in ({"ANADOLU_DB__HSOT": "x"}, {"ANADOLU_DB": "x"}, {"ANADOLU_YOK__ALT": "1"}):
    try:
        ortamdan_uygula(_a, _bozuk)
        assert False, f"{_bozuk} için KeyError bekleniyordu"
    except KeyError as e:
        assert list(_bozuk)[0] in str(e), "hata mesajında değişken adı geçmeli"
try:
    ortamdan_uygula(_a, {"ANADOLU_DEBUG": "belki"})
    assert False, "geçersiz bool için ValueError bekleniyordu"
except ValueError:
    pass
''',
 'hints': ['Önce copy.deepcopy ile kopyala; sonra her uygun değişken için yol = ad[len(onek):].lower().split("__").', 'Son parça hariç yolu gezerek hedef sözlüğe in; her adımda bir sözlük olduğundan emin ol, değilse KeyError.', 'bool kontrolünü int\'ten ÖNCE yap (bool, int\'in alt sınıfı); int/float için type(ornek)(metin).'],
 'why': 'Ortam değişkenleri düz ve metin olduğu için ad kuralıyla yol, mevcut değerle tip çıkarılır. Bilinmeyen anahtarda hata vermek, ANADOLU_DB__HSOT gibi bir yazım hatasının sessizce yok sayılıp prod\'un localhost\'a bağlanmasını önler.'},
# ---------------- Mini proje
{'t': 'code', 'stage': 'Mini proje', 'id': 'yapilandirma-11', 'diff': 3,
 'q': '<p><b>Ayar yükleyici:</b> Ilgaz Bank kredi servisi için <code>ayarlari_yukle(yaml_metni, ortam)</code> fonksiyonunu yaz. <code>ortam</code> bir sözlüktür (os.environ yerine).</p><ol><li>YAML\'ı <code>safe_load</code> ile oku; <code>varsayilan</code> ile <code>ortamlar[APP_ENV]</code>\'ı iç içe birleştir. <code>APP_ENV</code> ortamda yoksa <code>"dev"</code>.</li><li>Ortamdaki <code>KREDI_DB_PAROLA</code> değerini <code>ayar["db"]["parola"]</code> olarak ekle.</li><li>Doğrula ve tüm hataları topla: <code>db.host</code> (str) ve <code>db.port</code> (int, bool değil, 1-65535) zorunlu; <code>gunluk_limit</code> pozitif sayı; prod\'da <code>debug</code> True olamaz; YAML içinde <code>parola</code> anahtarı <b>herhangi bir seviyede</b> bulunursa "sır dosyada olmamalı"; parola ortamdan gelmemişse "KREDI_DB_PAROLA eksik".</li><li>Hata varsa <code>ValueError</code> yükselt; mesaj hataların <code>"; "</code> ile birleşimi olsun. Yoksa birleştirilmiş ayarı döndür.</li></ol><p>Hata metinleri (aynen): <code>"db.host eksik"</code>, <code>"db.port geçersiz"</code>, <code>"gunluk_limit pozitif olmalı"</code>, <code>"prod ortamında debug açık olamaz"</code>, <code>"sır dosyada olmamalı"</code>, <code>"KREDI_DB_PAROLA eksik"</code>. Sıra bu listedeki gibi olsun; bilinmeyen ortam için <code>ValueError("Bilinmeyen ortam: &lt;ad&gt;")</code>.</p>',
 'start': r'''
import copy
import yaml

def ayarlari_yukle(yaml_metni, ortam):
    pass
''',
 'sol': r'''
import copy
import yaml

def _birlestir(temel, ust):
    sonuc = copy.deepcopy(temel)
    for k, v in (ust or {}).items():
        if isinstance(v, dict) and isinstance(sonuc.get(k), dict):
            sonuc[k] = _birlestir(sonuc[k], v)
        else:
            sonuc[k] = copy.deepcopy(v)
    return sonuc

def _parola_var(veri):
    if isinstance(veri, dict):
        return any(k == "parola" or _parola_var(v) for k, v in veri.items())
    if isinstance(veri, list):
        return any(_parola_var(x) for x in veri)
    return False

def ayarlari_yukle(yaml_metni, ortam):
    veri = yaml.safe_load(yaml_metni) or {}
    ad = ortam.get("APP_ENV", "dev")
    ortamlar = veri.get("ortamlar") or {}
    if ad not in ortamlar:
        raise ValueError(f"Bilinmeyen ortam: {ad}")
    ayar = _birlestir(veri.get("varsayilan") or {}, ortamlar[ad])
    hatalar = []
    db = ayar.get("db") if isinstance(ayar.get("db"), dict) else {}
    if not isinstance(db.get("host"), str) or not db.get("host"):
        hatalar.append("db.host eksik")
    port = db.get("port")
    if not (isinstance(port, int) and not isinstance(port, bool) and 1 <= port <= 65535):
        hatalar.append("db.port geçersiz")
    limit = ayar.get("gunluk_limit")
    if not (isinstance(limit, (int, float)) and not isinstance(limit, bool) and limit > 0):
        hatalar.append("gunluk_limit pozitif olmalı")
    if ad == "prod" and ayar.get("debug") is True:
        hatalar.append("prod ortamında debug açık olamaz")
    if _parola_var(veri):
        hatalar.append("sır dosyada olmamalı")
    if not ortam.get("KREDI_DB_PAROLA"):
        hatalar.append("KREDI_DB_PAROLA eksik")
    if hatalar:
        raise ValueError("; ".join(hatalar))
    ayar.setdefault("db", {})["parola"] = ortam["KREDI_DB_PAROLA"]
    return ayar
''',
 'tests': r'''
_Y = """
varsayilan:
  db: {host: localhost, port: 5432}
  gunluk_limit: 250000
  debug: true
ortamlar:
  dev: {}
  prod:
    db: {host: prod-db}
    debug: false
"""
_a = ayarlari_yukle(_Y, {"KREDI_DB_PAROLA": "dev-pw"})
assert _a == {"db": {"host": "localhost", "port": 5432, "parola": "dev-pw"}, "gunluk_limit": 250000, "debug": True}, f"dev ayarı yanlış: {_a}"
_p = ayarlari_yukle(_Y, {"APP_ENV": "prod", "KREDI_DB_PAROLA": "pw"})
assert _p["db"]["host"] == "prod-db" and _p["debug"] is False and _p["db"]["port"] == 5432, "prod iç içe birleşmeli"
_B = """
varsayilan:
  db: {port: true, parola: "123"}
  gunluk_limit: -5
  debug: true
ortamlar:
  prod: {}
"""
try:
    ayarlari_yukle(_B, {"APP_ENV": "prod"})
    assert False, "hatalı ayar için ValueError bekleniyordu"
except ValueError as e:
    assert str(e) == "db.host eksik; db.port geçersiz; gunluk_limit pozitif olmalı; prod ortamında debug açık olamaz; sır dosyada olmamalı; KREDI_DB_PAROLA eksik", f"tüm hatalar sırasıyla toplanmalı, gelen: {e}"
_G = "varsayilan:\n  db: {host: h, port: 1}\n  gunluk_limit: 1\n  entegrasyon: [{ad: pos, parola: x}]\nortamlar:\n  dev:\n"
try:
    ayarlari_yukle(_G, {"KREDI_DB_PAROLA": "x"})
    assert False, "listedeki parola da yakalanmalı"
except ValueError as e:
    assert str(e) == "sır dosyada olmamalı", f"gelen: {e}"
try:
    ayarlari_yukle(_Y, {"APP_ENV": "staging", "KREDI_DB_PAROLA": "x"})
    assert False, "bilinmeyen ortam"
except ValueError as e:
    assert "staging" in str(e)
''',
 'hints': ['Görevi küçük yardımcılara böl: _birlestir (deep merge), _parola_var (özyinelemeli arama), sonra doğrulama listesi.', 'YAML\'da "dev:" boş olabilir (None); birleştirirken "ust or {}" kullan. Port ve limit kontrollerinde bool\'u ayrıca ele.', 'Hataları listeye ekle, en sonda if hatalar: raise ValueError("; ".join(hatalar)); parolayı ancak doğrulama geçtikten sonra ekle.'],
 'why': 'Bu, kurumsal bir ayar yükleyicinin özüdür: katmanlı birleştirme, sırların yalnız ortamdan gelmesi, ortama özgü kurallar (prod\'da debug kapalı) ve tüm hataların tek mesajda raporlanması. Uygulama hatalı ayarla hiç ayağa kalkmaz; bu, gece yarısı çökmesinden çok daha ucuzdur.'},
],
'faq': [
    {'q': 'YAML mı TOML mu seçmeliyim?', 'a': 'Python projesinin kendi ayarı için TOML iyi bir varsayılandır: standart kütüphanede okunur, tipleri açıktır, pyproject.toml ile aynı dildir. Kubernetes, Docker Compose, CI gibi YAML konuşan araçlarla çalışıyorsan YAML kaçınılmazdır; o zaman şüpheli değerleri tırnakla ve safe_load kullan.'},
    {'q': 'JSON\'a yorum yazabilir miyim?', 'a': 'Standart JSON yorum desteklemez; json modülü // ya da # içeren dosyada hata verir. İnsanların düzenleyeceği ayarlar için yorum desteği olan TOML veya YAML tercih edilir. Bazı ekipler "_aciklama" gibi alanlar ekler ama bu bir geçici çözümdür.'},
    {'q': '.env dosyası prod\'da da kullanılmalı mı?', 'a': '.env geliştirici kolaylığıdır. Prod\'da değişkenler dağıtım platformu (Kubernetes secret, sistem servisi tanımı, bulut sır yöneticisi) tarafından verilir. load_dotenv var olan değişkenleri ezmediği için, yanlışlıkla sunucuya giden bir .env gerçek değerlerin önüne geçmez.'},
    {'q': 'Ayarları her yerde os.environ ile mi okumalıyım?', 'a': 'Hayır. Ayarları açılışta tek bir yerde oku, doğrula ve bir ayar nesnesine (frozen dataclass ya da pydantic modeli) çevir; uygulamanın geri kalanı bu nesneyi kullansın. Dağınık os.environ çağrıları hem test etmeyi zorlaştırır hem de eksik ayarın ancak o satır çalışınca fark edilmesine yol açar.'},
    {'q': 'Yanlışlıkla bir API anahtarını depoya ittim, commit\'i silsem yeter mi?', 'a': 'Yetmez. Anahtar git geçmişinde, çatallanmış kopyalarda ve önbelleklerde kalabilir. İlk iş anahtarı sağlayıcıda iptal edip yenisini üret (rotate), sonra geçmişi temizle ve tekrar olmaması için bir sır tarayıcısı ekle.'},
],
'mistakes': [
    {'bad': 'debug = bool(os.environ.get("DEBUG", "False"))', 'good': 'debug = os.environ.get("DEBUG", "false").lower() in {"1", "true", "yes", "on"}', 'why': 'Ortam değişkeni metindir ve boş olmayan her metin bool() ile True olur; "False" yazmak debug\'ı kapatmaz.'},
    {'bad': 'ayar = yaml.load(open("ayar.yaml"), Loader=yaml.Loader)', 'good': 'with open("ayar.yaml", encoding="utf-8") as f:\n    ayar = yaml.safe_load(f)', 'why': 'Tam yükleyici YAML etiketlerinden keyfi Python nesnesi oluşturabilir; güvenilmeyen dosyada kod çalıştırma açığıdır. safe_load yalnız temel tipleri üretir.'},
    {'bad': 'prod = {**varsayilan, **prod_dosyasi}', 'good': 'prod = birlestir(varsayilan, prod_dosyasi)  # iç içe (deep) birleştirme', 'why': 'Yüzeysel birleştirmede prod dosyası yalnız db.host verdiyse db sözlüğü komple değişir ve db.port kaybolur.'},
    {'bad': 'DB_PAROLA = "S3cr3t!"  # sonra değiştiririm', 'good': 'DB_PAROLA = os.environ["KREDI_DB_PAROLA"]', 'why': 'Koda yazılan sır depoya ve geçmişe girer; "sonra" hiç gelmez. Zorunlu sırrı os.environ[...] ile okumak eksikse açılışta açık bir KeyError verir.'},
    {'bad': 'surum: 3.10\nulke: NO', 'good': 'surum: "3.10"\nulke: "NO"', 'why': 'YAML 1.1 tırnaksız 3.10\'u 3.1 float\'ına, NO\'yu False\'a çevirir. Sürüm, kod ve kısaltmaları tırnakla yaz.'},
],
}
