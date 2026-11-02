import sys
sys.path.insert(0, '.')
from jsgen import emit, ded, check_body

BODY = r'''
<h2>Neden önemli? "Benim bilgisayarımda çalışıyordu"</h2>
<p>Anadolu Market'in sipariş API'sini yazdın; testler yeşil, kendi bilgisayarında her şey kusursuz. Sunucuya kurduğunda ise bambaşka bir Python sürümü, eksik bir sistem kütüphanesi ve farklı bir saat dilimiyle karşılaşıyorsun. Bu derste uygulamanı <b>konteyner</b> (container) içine paketleyip her ortamda aynı şekilde çalıştırmayı, veritabanıyla birlikte ayağa kaldırmayı ve buluta göndermeyi öğreneceksin. Paketleme dersinde wheel ve <code>pyproject.toml</code> ile kütüphane dağıtmayı gördün; burada konu <b>uygulamayı</b> dağıtmak.</p>
<p>Tarayıcıda Docker çalışmaz; bu yüzden komutları <code>&lt;pre class="code"&gt;</code> kutularında göreceksin, alıştırmalarda ise Docker'ın mantığını Python ile kuracaksın: Dockerfile denetleyen bir "linter", compose dosyasından başlatma sırası çıkaran bir planlayıcı, ortam değişkeninden ayar okuyan bir sınıf ve sağlık kontrolü işleyicisi. Bunlar gerçek ekiplerin CI hattında koşturduğu araçların küçük kardeşleri.</p>

<h2>Konteyner mi, sanal makine mi?</h2>
<p><b>Sanal makine</b> (virtual machine, VM) bütün bir işletim sistemini çekirdeğiyle birlikte taklit eder. <b>Konteyner</b> ise ana makinenin çekirdeğini paylaşır; yalnızca uygulamanın dosya sistemini, kütüphanelerini ve süreçlerini yalıtır. <b>İmaj</b> (image) salt okunur bir şablondur, konteyner o imajın çalışan bir kopyasıdır: sınıf ile nesne gibi düşünebilirsin.</p>
<div class="tbl-wrap"><table>
<tr><th>Özellik</th><th>Sanal makine</th><th>Konteyner</th></tr>
<tr><td>Yalıtım</td><td>Ayrı çekirdek, güçlü yalıtım</td><td>Ortak çekirdek, süreç düzeyinde yalıtım</td></tr>
<tr><td>Açılış süresi</td><td>Dakikalar</td><td>Saniyeler</td></tr>
<tr><td>Boyut</td><td>GB düzeyinde</td><td>Onlarca–yüzlerce MB</td></tr>
<tr><td>Tipik kullanım</td><td>Farklı işletim sistemleri, eski sistemler</td><td>Mikroservis, API, toplu iş, CI</td></tr>
<tr><td>Tanım dosyası</td><td>Kurulum betikleri, Packer şablonu</td><td><code>Dockerfile</code></td></tr>
</table></div>

<h2>İlk Dockerfile</h2>
<p>Dockerfile, imajı adım adım nasıl inşa edeceğini anlatan bir tariftir. Her satır bir <b>komut</b> (instruction) ve bir argümandan oluşur:</p>
<pre class="code"># Dockerfile — Anadolu Market API
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN useradd --create-home app
USER app
EXPOSE 8000
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000", "market.main:app"]</pre>
<pre class="code">docker build -t anadolu-market-api:1.4.0 .
docker run --rm -p 8000:8000 --env-file .env anadolu-market-api:1.4.0
docker ps            # çalışan konteynerler
docker logs -f &lt;id&gt;  # stdout'a yazılan loglar</pre>
<div class="tbl-wrap"><table>
<tr><th>Komut</th><th>Ne yapar</th><th>Dikkat</th></tr>
<tr><td><code>FROM</code></td><td>Temel imajı seçer</td><td>Her zaman ilk komut; <code>latest</code> yerine sabit sürüm (<code>3.12-slim</code>)</td></tr>
<tr><td><code>WORKDIR</code></td><td>Çalışma klasörünü ayarlar (yoksa oluşturur)</td><td><code>RUN cd</code> kalıcı değildir; WORKDIR kullan</td></tr>
<tr><td><code>COPY</code></td><td>Dosyaları imaja kopyalar</td><td><code>.dockerignore</code> ile gereksizleri dışla</td></tr>
<tr><td><code>RUN</code></td><td>İnşa sırasında komut çalıştırır, yeni katman üretir</td><td><code>--no-cache-dir</code> pip önbelleğini imaja koymaz</td></tr>
<tr><td><code>ENV</code></td><td>Ortam değişkeni tanımlar</td><td>Sır (şifre, token) asla buraya yazılmaz</td></tr>
<tr><td><code>USER</code></td><td>Sonraki komutların kullanıcısı</td><td>Varsayılan root'tur; yetkisiz kullanıcıya geç</td></tr>
<tr><td><code>EXPOSE</code></td><td>Uygulamanın dinlediği portu belgeler</td><td>Portu açmaz; <code>-p</code> açar</td></tr>
<tr><td><code>CMD</code></td><td>Konteyner başlarken çalışacak komut</td><td>JSON (exec) biçimi sinyalleri doğru iletir</td></tr>
</table></div>
<p>Dockerfile düz bir metin olduğu için Python ile kolayca ayrıştırılır. Aşağıdaki kod yorumları atlayıp her satırı (komut, argüman) çiftine ayırıyor; alıştırmalarda bunu bir denetleyiciye dönüştüreceksin.</p>
<pre class="py">dockerfile = """
# Anadolu Market
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "app.py"]
"""

adimlar = []
for satir in dockerfile.splitlines():
    satir = satir.strip()
    if not satir or satir.startswith("#"):
        continue
    komut, _, arguman = satir.partition(" ")
    adimlar.append((komut.upper(), arguman))

for no, (komut, arguman) in enumerate(adimlar, 1):
    print(f"{no}. {komut:&lt;8} {arguman}")</pre>

<h2>Katman önbelleği ve .dockerignore</h2>
<p>Her <code>RUN</code>, <code>COPY</code> ve <code>ADD</code> yeni bir <b>katman</b> (layer) üretir. Docker bir adımı yeniden inşa ederken önceki inşadan kalan katmanı kullanabilir: komut metni aynıysa ve kopyalanan dosyalar değişmediyse adım <b>önbellekten</b> gelir. Bir adım değiştiği anda ondan sonraki <b>bütün</b> adımlar yeniden çalışır. Bu yüzden sık değişen şeyler (uygulama kodu) sona, seyrek değişenler (bağımlılıklar) başa yazılır.</p>
<pre class="py">adimlar = ["FROM python:3.12-slim", "COPY requirements.txt .",
           "RUN pip install -r requirements.txt", "COPY . .", "CMD python app.py"]

def yeniden_insa(adimlar, ilk_degisen):
    for i, adim in enumerate(adimlar):
        durum = "önbellek" if i &lt; ilk_degisen else "YENİDEN"
        print(f"  {durum:&lt;9} {adim}")

print("Yalnızca kod değişti:")
yeniden_insa(adimlar, 3)
print("requirements.txt değişti:")
yeniden_insa(adimlar, 1)</pre>
<p>İlk durumda en pahalı adım olan <code>pip install</code> önbellekten gelir ve inşa saniyeler sürer. <code>COPY . .</code>'yu en başa koysaydın her kod değişikliğinde bütün paketler yeniden inerdi.</p>
<p><code>.dockerignore</code>, <code>.gitignore</code> gibi çalışır: inşa bağlamına (build context) girmeyecek dosyaları listeler. Hem imajı küçültür hem de <code>.env</code> gibi sır dosyalarının yanlışlıkla imaja girmesini engeller.</p>
<pre class="code">.git
.venv
__pycache__/
*.pyc
.env
tests/
*.log</pre>

<h2>Çok aşamalı yapı (multi-stage build)</h2>
<p>Bazı paketler derlenirken derleyici ister (<code>gcc</code>, başlık dosyaları), ama çalışırken istemez. Çok aşamalı yapıda ilk aşama "inşaat alanı"dır; ikinci aşama yalnızca bitmiş ürünü alır. Sonuç: daha küçük ve saldırı yüzeyi daha dar bir imaj.</p>
<pre class="code">FROM python:3.12-slim AS insa
RUN apt-get update &amp;&amp; apt-get install -y --no-install-recommends build-essential
COPY requirements.txt .
RUN pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt

FROM python:3.12-slim
WORKDIR /app
COPY --from=insa /wheels /wheels
RUN pip install --no-cache-dir /wheels/* &amp;&amp; rm -rf /wheels
COPY . .
RUN useradd --create-home app
USER app
CMD ["python", "-m", "market"]</pre>
<div class="warn"><b>root ve latest tuzakları</b>USER yazmazsan konteyner içindeki süreç root olarak çalışır; uygulamadaki bir açık, saldırgana konteyner içinde tam yetki verir. <code>FROM python</code> ya da <code>FROM python:latest</code> ise bugün 3.12, yarın 3.13 demektir: aynı Dockerfile bir gün habersizce farklı imaj üretir. Sürümü her zaman sabitle.</div>

<h2>docker compose: uygulama + PostgreSQL</h2>
<p>Gerçek uygulama tek başına yaşamaz; veritabanı, önbellek, kuyruk ister. <b>docker compose</b> birden fazla servisi tek bir YAML dosyasıyla tanımlar ve birlikte başlatır.</p>
<pre class="code"># compose.yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: market
      POSTGRES_PASSWORD: $POSTGRES_PASSWORD
    volumes: ["pgdata:/var/lib/postgresql/data"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      retries: 5
  api:
    build: .
    ports: ["8000:8000"]
    environment:
      DATABASE_URL: postgresql://postgres:$POSTGRES_PASSWORD@db:5432/market
    depends_on:
      db:
        condition: service_healthy
volumes:
  pgdata: {}</pre>
<pre class="code">docker compose up -d --build   # inşa et ve arka planda başlat
docker compose logs -f api      # api servisinin logları
docker compose down             # durdur (volume'lar kalır)</pre>
<p>Servisler birbirine adıyla ulaşır: API, veritabanına <code>localhost</code> ile değil <code>db</code> adıyla bağlanır. <code>depends_on</code> başlatma sırasını belirler; <code>condition: service_healthy</code> ise "veritabanı sağlık kontrolünü geçene kadar bekle" der. Compose dosyası YAML olduğu için <code>yaml.safe_load</code> ile okunur ve bağımlılıklardan başlatma sırası <b>topolojik sıralama</b> (topological sort) ile çıkarılır:</p>
<pre class="py">import yaml

metin = """
services:
  api:
    depends_on: [db, cache]
  worker:
    depends_on: [db]
  db: {}
  cache: {}
"""
servisler = yaml.safe_load(metin)["services"]
bagimlilik = {ad: set(s.get("depends_on", [])) for ad, s in servisler.items()}

sira = []
while bagimlilik:
    hazir = sorted(ad for ad, b in bagimlilik.items() if b &lt;= set(sira))
    sira.extend(hazir)
    for ad in hazir:
        del bagimlilik[ad]
print("Başlatma sırası:", sira)</pre>
<div class="tip"><b>safe_load, load değil</b><code>yaml.load</code> uygun yükleyiciyle keyfi Python nesnesi oluşturabilir; dışarıdan gelen YAML'ı her zaman <code>yaml.safe_load</code> ile oku.</div>

<h2>Ortam değişkenleri, sırlar ve 12-factor</h2>
<p><b>12-factor uygulama</b> (twelve-factor app), bulutta çalışan uygulamalar için yaygın kabul görmüş bir ilkeler listesidir. En sık başvurulanları:</p>
<div class="tbl-wrap"><table>
<tr><th>İlke</th><th>Anlamı</th><th>Python'da karşılığı</th></tr>
<tr><td>Yapılandırma ortamda</td><td>Ortama göre değişen her şey ortam değişkenidir</td><td><code>os.environ</code>, pydantic-settings</td></tr>
<tr><td>Bağımlılıklar açık</td><td>Her paket sürümüyle beyan edilir</td><td><code>requirements.txt</code>, kilit dosyası</td></tr>
<tr><td>Destek servisleri eklenti</td><td>Veritabanı bir URL'dir, kod değişmeden değişir</td><td><code>DATABASE_URL</code></td></tr>
<tr><td>Durumsuz süreçler</td><td>Oturum, dosya yerel diskte tutulmaz</td><td>Redis, nesne deposu</td></tr>
<tr><td>Port bağlama</td><td>Uygulama kendi portunu dinler</td><td>gunicorn/uvicorn <code>-b 0.0.0.0:$PORT</code></td></tr>
<tr><td>Atılabilirlik</td><td>Hızlı açılır, SIGTERM'de düzgün kapanır</td><td>signal işleyici, bağlantıları kapat</td></tr>
<tr><td>Loglar akıştır</td><td>Dosyaya değil stdout'a yazılır</td><td><code>logging.StreamHandler(sys.stdout)</code></td></tr>
</table></div>
<p>Ortam değişkenleri her zaman <b>metin</b> gelir. <code>"8000"</code> sayıya, <code>"false"</code> mantıksal değere senin çevirmen gerekir; <code>bool("false")</code> <b>True</b> verir çünkü boş olmayan her metin doğrudur. Ayarları tek bir yerde, açılışta doğrulayan bir sınıf yazmak bu hataları erkenden yakalar:</p>
<pre class="py">from dataclasses import dataclass

DOGRU = {"1", "true", "yes", "evet", "on"}

@dataclass(frozen=True)
class Ayarlar:
    database_url: str
    port: int = 8000
    debug: bool = False

    @classmethod
    def ortamdan(cls, env):
        if "DATABASE_URL" not in env:
            raise ValueError("DATABASE_URL tanımlı değil")
        return cls(
            database_url=env["DATABASE_URL"],
            port=int(env.get("PORT", "8000")),
            debug=env.get("DEBUG", "").strip().lower() in DOGRU,
        )

ayar = Ayarlar.ortamdan({"DATABASE_URL": "postgresql://db/market", "DEBUG": "false", "PORT": "9000"})
print(ayar)
print("bool('false') =", bool("false"))</pre>
<p>Gerçek kodda <code>env</code> yerine <code>os.environ</code> verirsin; testte ise küçük bir sözlük. Bu, bağımlılık enjeksiyonunun (dependency injection) en basit hâlidir. <b>Sırlar</b> (secrets: veritabanı şifresi, API anahtarı) imaja, Dockerfile'a ya da git'e girmez; çalışma anında ortam değişkeni ya da bulutun sır yöneticisiyle (AWS Secrets Manager, GCP Secret Manager, Azure Key Vault) verilir.</p>

<h2>Sağlık kontrolü ve loglama</h2>
<p>Orkestratör (Docker, Kubernetes, Render) uygulamanın yaşayıp yaşamadığını HTTP uç noktalarıyla sorar. İki ayrı soru vardır: <b>canlılık</b> (liveness, <code>/health</code>): "Süreç takıldı mı?" ve <b>hazırlık</b> (readiness, <code>/ready</code>): "Veritabanına ulaşıp istek alabilir misin?" Hazırlık başarısızsa trafik o kopyaya yönlendirilmez; canlılık başarısızsa konteyner yeniden başlatılır.</p>
<pre class="py">def hazirlik(kontroller):
    sonuc = {}
    for ad, kontrol in kontroller.items():
        try:
            kontrol()
            sonuc[ad] = "ok"
        except Exception as e:
            sonuc[ad] = f"hata: {e}"
    kod = 200 if all(v == "ok" for v in sonuc.values()) else 503
    return kod, sonuc

def veritabani():
    return True

def onbellek():
    raise ConnectionError("redis:6379 yanıt vermiyor")

print(hazirlik({"db": veritabani}))
print(hazirlik({"db": veritabani, "cache": onbellek}))</pre>
<p>Loglar konteyner içinde dosyaya yazılırsa konteyner silinince kaybolur. 12-factor kuralı: <b>stdout'a yaz</b>, toplamayı platform yapsın (Docker <code>docker logs</code>, bulutta CloudWatch, Cloud Logging). Makinenin okuyabilmesi için tek satırlık JSON en iyisidir:</p>
<pre class="py">import io, json, logging

class JsonBicim(logging.Formatter):
    def format(self, kayit):
        return json.dumps({"seviye": kayit.levelname, "kaydedici": kayit.name,
                           "mesaj": kayit.getMessage()}, ensure_ascii=False)

akis = io.StringIO()            # gerçekte sys.stdout
isleyici = logging.StreamHandler(akis)
isleyici.setFormatter(JsonBicim())
log = logging.getLogger("market.api")
log.addHandler(isleyici)
log.setLevel(logging.INFO)

log.info("sipariş alındı: %s", "S-1001")
log.warning("stok azaldı: %d adet", 3)
print(akis.getvalue(), end="")</pre>

<h2>gunicorn, uvicorn ve bulut seçenekleri</h2>
<p>Geliştirme sunucusu (<code>flask run</code>, <code>uvicorn --reload</code>) üretim için değildir. Üretimde bir <b>süreç yöneticisi</b> birden fazla işçi (worker) başlatır: WSGI (Flask, Django) için <b>gunicorn</b>, ASGI (FastAPI) için <b>uvicorn</b> ya da uvicorn işçili gunicorn. İşçi sayısı için başlangıç kuralı <code>2 × çekirdek + 1</code>'dir, ama ölçerek ayarlanır.</p>
<pre class="code">gunicorn -w 4 -b 0.0.0.0:8000 market.wsgi:app                    # Flask/Django
uvicorn market.main:app --host 0.0.0.0 --port 8000 --workers 4    # FastAPI
gunicorn -k uvicorn.workers.UvicornWorker -w 4 market.main:app    # ikisi birlikte</pre>
<div class="tbl-wrap"><table>
<tr><th>Platform</th><th>Model</th><th>Ne zaman?</th></tr>
<tr><td>Render, Railway</td><td>Git'e bağla, Dockerfile'ı kendisi inşa etsin; yönetilen PostgreSQL</td><td>Prototip, küçük ekip, hızlı başlangıç</td></tr>
<tr><td>Fly.io</td><td>Konteyneri dünyanın farklı bölgelerinde çalıştırır</td><td>Kullanıcıya yakın, düşük gecikme</td></tr>
<tr><td>AWS (ECS/Fargate, App Runner)</td><td>Konteyner servisleri, RDS veritabanı</td><td>Kurumsal ölçek, ayrıntılı ağ ve yetki</td></tr>
<tr><td>GCP Cloud Run</td><td>İstek geldikçe ölçeklenen konteyner</td><td>Değişken trafik, sıfıra ölçeklenme</td></tr>
<tr><td>Azure Container Apps / App Service</td><td>Yönetilen konteyner ve web uygulaması</td><td>Microsoft ekosistemindeki şirketler</td></tr>
</table></div>
<div class="note"><b>Gerçek işte</b>Bir bankacılık ekibinde canlıya çıkış genellikle şöyle akar: geliştirici birleştirme isteği (pull request) açar, CI testleri koşturur, Dockerfile'ı hadolint gibi bir denetleyiciden geçirir, imajı git commit kimliğiyle etiketleyip (<code>api:3f2a9c1</code>) şirketin imaj deposuna iter, imaj güvenlik açığı taramasından geçer ve önce test ortamına, onaydan sonra üretime aynı imaj gönderilir. "Aynı imaj" kısmı kritiktir: test edilen şey ile canlıya çıkan şey bit bit aynıdır, yalnızca ortam değişkenleri farklıdır.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>PID 1 ve düzgün kapanma</h3>
<p>Konteynerde <code>CMD</code> ile başlayan süreç PID 1 olur ve <code>docker stop</code> ona SIGTERM gönderir. <code>CMD python app.py</code> (shell biçimi) önce <code>/bin/sh</code> başlatır ve sinyal Python'a ulaşmayabilir; 10 saniye sonra SIGKILL gelir, yarım kalan istekler kopar. JSON biçimi (<code>CMD ["python", "app.py"]</code>) kullan ve Python'da <code>signal.signal(signal.SIGTERM, ...)</code> ile bağlantı havuzunu kapat.</p>
<h3>İmaj boyutu ve güvenlik</h3>
<p><code>python:3.12</code> yaklaşık 1 GB, <code>python:3.12-slim</code> çok daha küçüktür; <code>alpine</code> daha da küçük ama musl libc yüzünden bazı tekerlek (wheel) paketleri derleme ister. Trivy ya da Docker Scout ile imajı bilinen açıklara karşı tara; temel imajı düzenli güncelle. Etiket yerine özet (digest: <code>python:3.12-slim@sha256:...</code>) ile sabitlemek tam tekrarlanabilirlik sağlar.</p>
<h3>Yapılandırmayı doğrulamak</h3>
<p>Büyük projelerde ayar sınıfı elle yazılmaz: <code>pydantic-settings</code> ortam değişkenlerini tip ipuçlarına göre çevirir ve eksikse açılışta hata verir. Mantık bu dersteki <code>Ayarlar.ortamdan</code> ile aynıdır: <b>hızlı başarısız ol</b> (fail fast), yanlış yapılandırmayla asla istek kabul etme.</p>
</section>
'''

LESSON = {
 'id': 'docker-deploy', 'lv': 'ileri', 'mod': 'Üretime Hazırlık', 'min': 55,
 'title': 'Docker ve dağıtım: konteyner, compose, bulut',
 'sum': 'Python uygulamanı Dockerfile ile konteynere paketler, katman önbelleği ve çok aşamalı yapıyla imajı küçültür, compose ile PostgreSQL\'le birlikte çalıştırır, ortam değişkeni, sağlık kontrolü ve stdout loglamayla 12-factor uyumlu biçimde buluta gönderirsin.',
 'goals': [
  'Konteyner ile sanal makineyi karşılaştırıp Python uygulaması için doğru Dockerfile\'ı yazabilirim.',
  'Katman önbelleğini, .dockerignore\'u ve çok aşamalı yapıyı kullanarak hızlı inşa edilen küçük imajlar üretebilirim.',
  'docker compose ile uygulamayı PostgreSQL\'le birlikte ayağa kaldırır, servis bağımlılık sırasını Python ile çıkarabilirim.',
  'Yapılandırmayı ortam değişkenlerinden doğrulayarak okur, sırları imajın dışında tutarım.',
  'Sağlık kontrolü uç noktası ve stdout\'a JSON loglama ile uygulamayı Render, Fly.io ya da AWS/GCP/Azure\'a hazırlarım.'],
 'body': BODY,
}

EX = []
# ---------- Isınma ----------
EX += [
 {'t': 'mc', 'stage': 'Isınma', 'q': 'Konteyneri sanal makineden ayıran temel fark hangisidir?',
  'o': ['Konteyner yalnızca Linux\'ta çalışabilir', 'Konteyner ana makinenin çekirdeğini paylaşır, ayrı bir işletim sistemi açmaz', 'Konteyner, sanal makineye göre her koşulda daha güçlü bir güvenlik yalıtımı sağlar', 'Konteyner içinde ağ bağlantısı kurulamaz'],
  'a': 1, 'why': 'Sanal makine çekirdeğiyle birlikte bütün bir işletim sistemini taklit eder; konteyner ana makinenin çekirdeğini paylaşıp yalnızca süreçleri ve dosya sistemini yalıtır. Bu yüzden saniyeler içinde açılır ve küçüktür. Yalıtımı ise VM\'den daha zayıftır, "her zaman daha güvenli" değildir.'},
 {'t': 'mc', 'stage': 'Isınma', 'q': 'Dockerfile\'da neden önce <code>COPY requirements.txt .</code> ve <code>RUN pip install</code>, sonra <code>COPY . .</code> yazılır?',
  'o': ['pip, uygulama kodu kopyalanmışken çalışmaz', 'Docker, COPY komutlarını Dockerfile\'daki sıradan bağımsız olarak alfabetik dosya adına göre işler', 'Kod değişince bağımlılık katmanı önbellekten gelsin, paketler yeniden inmesin', 'requirements.txt imajda en üstte durmalıdır'],
  'a': 2, 'why': 'Bir adım değişince ondan sonraki tüm adımlar yeniden inşa edilir. Seyrek değişen bağımlılıkları öne alırsan, sık değişen kod yalnızca son katmanları geçersiz kılar ve pahalı pip install adımı önbellekten gelir.'},
 {'t': 'mc', 'stage': 'Isınma', 'q': '12-factor ilkelerine göre üretim veritabanı şifresi nerede durmalıdır?',
  'o': ['Dockerfile içinde ENV satırında', 'Çalışma anında verilen ortam değişkeninde ya da sır yöneticisinde', 'Kodun içinde, sürüm kontrolündeki ayarlar.py dosyasında sabit olarak; böylece her ortam aynı değeri görür', 'Git deposundaki .env dosyasında'],
  'a': 1, 'why': 'Ortama göre değişen yapılandırma, özellikle sırlar, imaja ve koda gömülmez. ENV satırı imajın katmanlarında kalır, git\'teki dosya ise depoya erişen herkese açıktır. Şifre çalışma anında ortam değişkeni ya da AWS Secrets Manager, Key Vault gibi bir sır yöneticisiyle verilir.'},
]
# ---------- Kodu oku ----------
EX += [
 {'t': 'predict', 'stage': 'Kodu oku', 'q': 'Bu kod ne yazdırır?',
  'code': ded('''
    satirlar = ["FROM python:3.12-slim", "WORKDIR /app", "COPY . .", "RUN pip install -r requirements.txt"]
    komutlar = [s.split(maxsplit=1)[0] for s in satirlar]
    print(komutlar.index("COPY"), komutlar[-1])
  '''),
  'o': ['3 RUN', '2 RUN', '2 pip', 'COPY RUN'], 'a': 1,
  'why': 'split(maxsplit=1) satırı ilk boşluktan ikiye böler; [0] komut adıdır. Liste indeksleri 0\'dan başladığı için COPY 2. indekste, son eleman da "RUN".'},
 {'t': 'predict', 'stage': 'Kodu oku', 'q': 'Ortam değişkenleri sözlükle taklit ediliyor. Bu kod ne yazdırır?',
  'code': ded('''
    env = {"DEBUG": "false", "PORT": "8000"}
    debug = bool(env.get("DEBUG"))
    port = env.get("PORT", 80) + "0"
    print(debug, port)
  '''),
  'o': ['False 8000', 'True 80000', 'False 80000', 'TypeError hatası verir'], 'a': 1,
  'why': 'Ortam değişkenleri metindir. bool("false") boş olmayan bir metin olduğu için True; "8000" + "0" ise metin birleştirmesiyle "80000" olur. Bu yüzden ayarları açıkça çevirip doğrulamak gerekir.'},
 {'t': 'predict', 'stage': 'Kodu oku', 'q': 'compose dosyası yaml.safe_load ile okunuyor. Çıktı nedir?',
  'code': ded('''
    import yaml

    metin = """
    services:
      web:
        image: market-api:1.4
        depends_on: [db, cache]
        ports: ["8000:8000"]
      db:
        image: postgres:16
    """
    c = yaml.safe_load(metin)
    web = c["services"]["web"]
    print(sorted(c["services"]), web["depends_on"][1], web["ports"][0].split(":")[0])
  '''),
  'o': ["['db', 'web'] cache 8000", "['web', 'db'] cache 8000", "['db', 'web'] db 8000", "['db', 'web'] cache 8000:8000"], 'a': 0,
  'why': 'sorted bir sözlüğün anahtarlarını alfabetik sıralar: db, web. depends_on listesinin 1. indeksi "cache"; "8000:8000".split(":")[0] ise "8000".'},
 {'t': 'order', 'stage': 'Kodu oku', 'q': '<p>Katman önbelleğini iyi kullanan bir Dockerfile <b>üreten</b> Python fonksiyonunun satırlarını sırala. Bağımlılıklar koddan önce kurulmalı, CMD en sonda olmalı.</p>',
  'lines': ['def dockerfile(surum):', '    satirlar = [f"FROM python:{surum}-slim", "WORKDIR /app"]', '    satirlar.append("COPY requirements.txt .")', '    satirlar.append("RUN pip install --no-cache-dir -r requirements.txt")', '    satirlar.append("COPY . .")', '    satirlar.append(\'CMD ["python", "app.py"]\')', '    return "\\n".join(satirlar)', 'print(dockerfile("3.12"))'],
  'expect': 'FROM python:3.12-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY . .\nCMD ["python", "app.py"]\n',
  'hint': 'Önce yalnızca requirements.txt kopyalanır, sonra pip install, en son tüm kod.',
  'why': 'FROM her zaman ilk satırdır. requirements.txt\'yi tek başına kopyalayıp kurmak, kod değiştiğinde pip install katmanının önbellekten gelmesini sağlar. CMD konteyner başlarken çalışacak komuttur ve sona yazılır.'},
]
# ---------- Rehberli ----------
EX += [
 {'t': 'code', 'id': 'docker-deploy-1', 'stage': 'Rehberli', 'diff': 1,
  'q': '<p><code>dockerfile_ayristir(metin)</code> fonksiyonunu yaz. Dockerfile metnini <code>(KOMUT, argüman)</code> demetlerinin listesine çevirsin:</p><ul><li>Boş satırları ve <code>#</code> ile başlayan yorum satırlarını atla.</li><li>Komut adını büyük harfe çevir (<code>run</code> → <code>RUN</code>).</li><li>Argümanın başındaki/sonundaki boşlukları kırp.</li><li>Sonu <code>\\</code> ile biten satır bir sonraki satırla <b>tek boşlukla</b> birleşir (devam satırı).</li></ul>',
  'guide': ['Sonuç listesi ve birikmiş satır için boş bir metin (tampon) tut.', 'Her satırı strip et; boşsa ya da # ile başlıyorsa atla.', 'Satır \\ ile bitiyorsa sondaki \\\'yi atıp tampona ekle ve sonraki satıra geç.', 'Bitmeyen satırda tampon + satırı partition(" ") ile komut ve argümana ayır.', 'Komutu upper(), argümanı strip() yapıp listeye ekle ve tamponu sıfırla.'],
  'example': ded('''
    ini = """
    ; yorum
    host = db
    port = 5432
    """
    ayarlar = []
    for satir in ini.splitlines():
        satir = satir.strip()
        if not satir or satir.startswith(";"):
            continue
        anahtar, _, deger = satir.partition("=")
        ayarlar.append((anahtar.strip().upper(), deger.strip()))
    print(ayarlar)
  '''),
  'start': ded('''
    def dockerfile_ayristir(metin):
        adimlar = []
        tampon = ""
        for satir in metin.splitlines():
            satir = satir.strip()
            # TODO: boş ve yorum satırlarını atla
            # TODO: \\ ile biten satırı tampona ekleyip devam et
            komut, _, arguman = satir.partition(" ")
            adimlar.append((komut, arguman))
        return adimlar
  '''),
  'sol': ded('''
    def dockerfile_ayristir(metin):
        adimlar = []
        tampon = ""
        for satir in metin.splitlines():
            satir = satir.strip()
            if not satir or satir.startswith("#"):
                continue
            if satir.endswith("\\\\"):
                tampon += satir[:-1].strip() + " "
                continue
            tam = tampon + satir
            tampon = ""
            komut, _, arguman = tam.partition(" ")
            adimlar.append((komut.upper(), arguman.strip()))
        return adimlar
  '''),
  'tests': ded('''
    df = """
    # Anadolu Market
    FROM python:3.12-slim

    workdir /app
    RUN apt-get update && \\\\
        apt-get install -y curl
    CMD ["python", "app.py"]
    """
    s = dockerfile_ayristir(df)
    assert s[0] == ("FROM", "python:3.12-slim"), "İlk adım ('FROM', 'python:3.12-slim') olmalı; yorum ve boş satırlar atlanmalı"
    assert s[1] == ("WORKDIR", "/app"), "Komut adı büyük harfe çevrilmeli: workdir -> WORKDIR"
    assert s[2] == ("RUN", "apt-get update && apt-get install -y curl"), "Devam satırı (\\\\) tek boşlukla birleşmeli; gelen: " + repr(s[2] if len(s) > 2 else None)
    assert len(s) == 4, f"4 adım bekleniyordu, {len(s)} geldi"
    assert dockerfile_ayristir("") == [], "Boş metin boş liste vermeli"
  '''),
  'hints': ['Yorum ve boş satırı ayıklamak için tek bir if yeter: if not satir or satir.startswith("#").', 'Devam satırı için satir.endswith("\\\\") ve satir[:-1] kullan; parçaları bir tamponda biriktir.', 'Tamponu kullandıktan sonra sıfırlamayı unutma: tam = tampon + satir; tampon = "".'],
  'why': 'Dockerfile\'ı yapısal veriye çevirmek, üzerine kural denetimi yazmanın ilk adımıdır. hadolint gibi gerçek denetleyiciler de önce metni bu şekilde komutlara ayırır; devam satırları uzun RUN komutlarında çok yaygındır.'},
 {'t': 'code', 'id': 'docker-deploy-2', 'stage': 'Rehberli', 'diff': 2,
  'q': '<p>Ortam değişkeninden yapılandırma okuyan <code>Ayarlar</code> sınıfını tamamla. <code>Ayarlar.ortamdan(env)</code> sınıf metodu bir sözlük (gerçekte <code>os.environ</code>) alıp nesne döndürsün:</p><ul><li><code>database_url</code>: <code>DATABASE_URL</code> zorunlu; yoksa <code>ValueError("DATABASE_URL eksik")</code>.</li><li><code>port</code>: <code>PORT</code>, int, varsayılan 8000.</li><li><code>debug</code>: <code>DEBUG</code> küçük harfe çevrilip <code>{"1", "true", "yes", "evet"}</code> içindeyse True, yoksa False (varsayılan False).</li><li><code>log_seviyesi</code>: <code>LOG_LEVEL</code> büyük harfe çevrilmiş, varsayılan <code>"INFO"</code>.</li></ul>',
  'guide': ['Önce DATABASE_URL anahtarının env içinde olup olmadığını kontrol et.', 'PORT\'u env.get("PORT", "8000") ile alıp int\'e çevir.', 'DEBUG için .strip().lower() yapıp DOGRU kümesinde mi diye bak.', 'LOG_LEVEL\'ı upper() ile büyüt.', 'cls(...) ile nesneyi oluşturup döndür.'],
  'example': ded('''
    from dataclasses import dataclass

    @dataclass(frozen=True)
    class Kuyruk:
        url: str
        deneme: int = 3

        @classmethod
        def ortamdan(cls, env):
            if "QUEUE_URL" not in env:
                raise ValueError("QUEUE_URL eksik")
            return cls(url=env["QUEUE_URL"], deneme=int(env.get("RETRIES", "3")))

    print(Kuyruk.ortamdan({"QUEUE_URL": "amqp://mq", "RETRIES": "5"}))
  '''),
  'start': ded('''
    from dataclasses import dataclass

    DOGRU = {"1", "true", "yes", "evet"}

    @dataclass(frozen=True)
    class Ayarlar:
        database_url: str
        port: int = 8000
        debug: bool = False
        log_seviyesi: str = "INFO"

        @classmethod
        def ortamdan(cls, env):
            # TODO: DATABASE_URL yoksa ValueError fırlat
            return cls(
                database_url=env.get("DATABASE_URL"),
                port=env.get("PORT", 8000),          # TODO: int'e çevir
                debug=bool(env.get("DEBUG")),        # TODO: metni doğru yorumla
                log_seviyesi=env.get("LOG_LEVEL", "INFO"),  # TODO: büyük harf
            )
  '''),
  'sol': ded('''
    from dataclasses import dataclass

    DOGRU = {"1", "true", "yes", "evet"}

    @dataclass(frozen=True)
    class Ayarlar:
        database_url: str
        port: int = 8000
        debug: bool = False
        log_seviyesi: str = "INFO"

        @classmethod
        def ortamdan(cls, env):
            if "DATABASE_URL" not in env:
                raise ValueError("DATABASE_URL eksik")
            return cls(
                database_url=env["DATABASE_URL"],
                port=int(env.get("PORT", "8000")),
                debug=env.get("DEBUG", "").strip().lower() in DOGRU,
                log_seviyesi=env.get("LOG_LEVEL", "INFO").upper(),
            )
  '''),
  'tests': ded('''
    a = Ayarlar.ortamdan({"DATABASE_URL": "postgresql://db/market"})
    assert a.port == 8000 and a.debug is False and a.log_seviyesi == "INFO", "Varsayılanlar: port 8000, debug False, log INFO"
    b = Ayarlar.ortamdan({"DATABASE_URL": "x", "PORT": "9000", "DEBUG": "False", "LOG_LEVEL": "debug"})
    assert b.port == 9000 and isinstance(b.port, int), "PORT '9000' metni int 9000 olmalı"
    assert b.debug is False, "DEBUG='False' False olmalı: bool('False') True verir, metni yorumlamalısın"
    assert b.log_seviyesi == "DEBUG", "LOG_LEVEL büyük harfe çevrilmeli"
    assert Ayarlar.ortamdan({"DATABASE_URL": "x", "DEBUG": " Evet "}).debug is True, "' Evet ' boşluk kırpılıp küçültülünce True olmalı"
    try:
        Ayarlar.ortamdan({"PORT": "80"})
        assert False, "DATABASE_URL yoksa ValueError fırlatılmalı (fail fast)"
    except ValueError as e:
        assert "DATABASE_URL" in str(e), "Hata mesajı eksik değişkenin adını içermeli"
  '''),
  'hints': ['Ortam değişkenleri her zaman str gelir; tür dönüşümünü sen yapmalısın.', 'Mantıksal değer için küme üyeliği: env.get("DEBUG", "").strip().lower() in DOGRU', 'Varsayılanı da metin ver: int(env.get("PORT", "8000")).'],
  'why': 'Yapılandırmayı açılışta tek noktada doğrulamak "hızlı başarısız ol" ilkesidir: eksik DATABASE_URL ile uygulama hiç ayağa kalkmaz, ilk istekte gizemli bir hatayla çökmez. env\'i parametre almak sınıfı os.environ\'a dokunmadan test edilebilir yapar.'},
 {'t': 'code', 'id': 'docker-deploy-3', 'stage': 'Rehberli', 'diff': 2,
  'q': '<p>Hazırlık (readiness) uç noktasının işleyicisini yaz: <code>saglik(kontroller)</code>. <code>kontroller</code> bir sözlük: ad → argümansız fonksiyon. Fonksiyon istisna fırlatırsa o kontrol başarısızdır.</p><p>Dönüş: <code>(durum_kodu, govde)</code>. <code>govde</code> şöyle bir sözlük: <code>{"durum": "ok" ya da "hata", "kontroller": {ad: "ok" ya da "hata: &lt;mesaj&gt;"}}</code>. Hepsi başarılıysa kod <b>200</b> ve durum <code>"ok"</code>; en az biri başarısızsa <b>503</b> ve <code>"hata"</code>. Hiç kontrol yoksa 200.</p>',
  'guide': ['Sonuçlar için boş bir sözlük oluştur.', 'Her kontrolü try içinde çağır; başarılıysa "ok" yaz.', 'except Exception as e ile f"hata: {e}" yaz.', 'Bütün değerler "ok" ise 200, değilse 503 seç (all kullan).', 'Gövde sözlüğünü kurup (kod, govde) döndür.'],
  'example': ded('''
    def disk_kontrol():
        return True

    def kuyruk_kontrol():
        raise TimeoutError("mq zaman aşımı")

    sonuc = {}
    for ad, f in {"disk": disk_kontrol, "kuyruk": kuyruk_kontrol}.items():
        try:
            f()
            sonuc[ad] = "ok"
        except Exception as e:
            sonuc[ad] = f"hata: {e}"
    print(sonuc, all(v == "ok" for v in sonuc.values()))
  '''),
  'start': ded('''
    def saglik(kontroller):
        sonuc = {}
        for ad, kontrol in kontroller.items():
            # TODO: kontrolü çağır, istisnayı yakala
            sonuc[ad] = "ok"
        # TODO: hepsi ok ise 200, değilse 503
        kod = 200
        return kod, {"durum": "ok", "kontroller": sonuc}
  '''),
  'sol': ded('''
    def saglik(kontroller):
        sonuc = {}
        for ad, kontrol in kontroller.items():
            try:
                kontrol()
                sonuc[ad] = "ok"
            except Exception as e:
                sonuc[ad] = f"hata: {e}"
        basarili = all(v == "ok" for v in sonuc.values())
        kod = 200 if basarili else 503
        return kod, {"durum": "ok" if basarili else "hata", "kontroller": sonuc}
  '''),
  'tests': ded('''
    def db():
        return 1
    def redis():
        raise ConnectionError("redis kapalı")
    kod, govde = saglik({"db": db})
    assert kod == 200 and govde == {"durum": "ok", "kontroller": {"db": "ok"}}, "Tüm kontroller başarılıysa 200 ve durum ok"
    kod, govde = saglik({"db": db, "redis": redis})
    assert kod == 503, "Bir kontrol başarısızsa 503 dönmeli: orkestratör bu kopyaya trafik göndermemeli"
    assert govde["durum"] == "hata", "Başarısızlıkta durum 'hata' olmalı"
    assert govde["kontroller"]["redis"] == "hata: redis kapalı", "Başarısız kontrolün mesajı 'hata: <mesaj>' biçiminde olmalı"
    assert govde["kontroller"]["db"] == "ok", "Diğer kontroller yine raporlanmalı"
    assert saglik({})[0] == 200, "Hiç kontrol yoksa 200"
  '''),
  'hints': ['Her kontrol try/except içinde çağrılmalı ki biri çökünce diğerleri yine denensin.', 'all(v == "ok" for v in sonuc.values()) boş sözlükte True verir.', 'kod = 200 if basarili else 503'],
  'why': '503 (Service Unavailable), yük dengeleyiciye "bu kopya şu an trafik alamaz" der. Her bağımlılığı ayrı raporlamak, olay anında hangi bileşenin çöktüğünü tek bakışta gösterir.'},
 {'t': 'code', 'id': 'docker-deploy-4', 'stage': 'Rehberli', 'diff': 2,
  'q': '<p><code>.dockerignore</code> kurallarını taklit eden <code>dahil_mi(yol, desenler)</code> fonksiyonunu yaz. Dosya inşa bağlamına girecekse True döndürsün.</p><ul><li>Desenler sırayla değerlendirilir; <b>son eşleşen</b> desen kazanır.</li><li><code>!</code> ile başlayan desen istisnadır: eşleşirse dosyayı geri dahil eder.</li><li>Bir desen eşleşir: <code>fnmatch(yol, desen)</code> doğruysa ya da yol <code>desen + "/"</code> ile başlıyorsa (klasör).</li><li>Hiçbir desen eşleşmezse dosya dahildir.</li></ul>',
  'guide': ['dahil = True ile başla.', 'Her desende ! ile başlayıp başlamadığını kontrol et ve !\'yi ayıkla.', 'Eşleşmeyi fnmatch ya da klasör öneki ile denetle.', 'Eşleştiyse dahil = (istisna mı?) olarak güncelle.', 'Döngü bitince dahil değerini döndür.'],
  'example': ded('''
    from fnmatch import fnmatch

    kurallar = ["*.log", "!onemli.log"]
    for dosya in ["hata.log", "onemli.log", "app.py"]:
        sonuc = "dahil"
        for k in kurallar:
            ters = k.startswith("!")
            if fnmatch(dosya, k.lstrip("!")):
                sonuc = "dahil" if ters else "hariç"
        print(dosya, sonuc)
  '''),
  'start': ded('''
    from fnmatch import fnmatch

    def dahil_mi(yol, desenler):
        for desen in desenler:
            # TODO: ! istisnasını ve klasör önekini ele al
            if fnmatch(yol, desen):
                return False
        return True
  '''),
  'sol': ded('''
    from fnmatch import fnmatch

    def dahil_mi(yol, desenler):
        dahil = True
        for desen in desenler:
            istisna = desen.startswith("!")
            d = desen[1:] if istisna else desen
            d = d.rstrip("/")
            if fnmatch(yol, d) or yol.startswith(d + "/"):
                dahil = istisna
        return dahil
  '''),
  'tests': ded('''
    kurallar = [".git", ".env", "*.log", "!audit.log", "tests/", "__pycache__"]
    assert dahil_mi("app.py", kurallar) is True, "Eşleşmeyen dosya dahil olmalı"
    assert dahil_mi(".env", kurallar) is False, ".env sırlar içerir, imaja girmemeli"
    assert dahil_mi("hata.log", kurallar) is False, "*.log deseni hata.log'u dışlamalı"
    assert dahil_mi("audit.log", kurallar) is True, "!audit.log istisnası dosyayı geri dahil etmeli (son eşleşen kazanır)"
    assert dahil_mi(".git/config", kurallar) is False, ".git klasörünün içindekiler de dışlanmalı"
    assert dahil_mi("tests/test_api.py", kurallar) is False, "tests/ deseni klasördeki dosyaları dışlamalı"
    assert dahil_mi("market/tests.py", kurallar) is True, "tests/ deseni market/tests.py dosyasını dışlamamalı"
    assert dahil_mi("x.log", ["!x.log", "*.log"]) is False, "Sıra önemli: sonraki *.log istisnayı ezer"
  '''),
  'hints': ['Hemen return etme; tüm desenleri gez ve son eşleşmeyi hatırla.', 'Klasör eşleşmesi: yol.startswith(d + "/"); "tests/" desenindeki sondaki / işaretini önce rstrip ile at.', 'Eşleşince dahil = istisna yazmak yeterli: istisna desen True, normal desen False verir.'],
  'why': 'Docker da .dockerignore\'u "son eşleşen kazanır" kuralıyla değerlendirir; bu yüzden istisnalar genel desenden sonra yazılır. .env ve .git\'i dışlamak hem imajı küçültür hem de sızıntıyı önler.'},
]
# ---------- Kendin yaz ----------
EX += [
 {'t': 'code', 'id': 'docker-deploy-5', 'stage': 'Kendin yaz', 'diff': 2,
  'q': '<p>Mini bir Dockerfile denetleyicisi yaz: <code>dockerfile_denetle(metin)</code> uyarı kodlarının listesini döndürsün (her kod en fazla bir kez, aşağıdaki sırayla):</p><ol><li><code>"FROM_ILK_DEGIL"</code>: yorum/boş satırlar dışındaki ilk komut FROM değil.</li><li><code>"LATEST"</code>: herhangi bir FROM imajı etiketsiz (<code>python</code>) ya da <code>:latest</code> etiketli. <code>FROM imaj AS ad</code> biçiminde imaj ikinci kelimedir.</li><li><code>"ROOT"</code>: hiç USER komutu yok ya da son USER <code>root</code> veya <code>0</code>.</li></ol><p>Komut adları büyük/küçük harf duyarsızdır. Devam satırlarını düşünmene gerek yok.</p>',
  'sol': ded('''
    def dockerfile_denetle(metin):
        komutlar = []
        for satir in metin.splitlines():
            satir = satir.strip()
            if not satir or satir.startswith("#"):
                continue
            k, _, arg = satir.partition(" ")
            komutlar.append((k.upper(), arg.strip()))
        uyarilar = []
        if not komutlar or komutlar[0][0] != "FROM":
            uyarilar.append("FROM_ILK_DEGIL")
        for k, arg in komutlar:
            if k == "FROM":
                imaj = arg.split()[0] if arg else ""
                son = imaj.rsplit("/", 1)[-1]
                if ":" not in son or son.endswith(":latest"):
                    uyarilar.append("LATEST")
                    break
        kullanicilar = [arg for k, arg in komutlar if k == "USER"]
        if not kullanicilar or kullanicilar[-1].split(":")[0] in ("root", "0"):
            uyarilar.append("ROOT")
        return uyarilar
  '''),
  'tests': ded('''
    iyi = "FROM python:3.12-slim\\nWORKDIR /app\\nCOPY . .\\nUSER app\\nCMD [\\"python\\", \\"app.py\\"]"
    assert dockerfile_denetle(iyi) == [], "Kusursuz Dockerfile hiç uyarı üretmemeli"
    assert dockerfile_denetle("# yorum\\nFROM python:3.12\\nUSER app") == [], "Yorum satırı FROM'dan önce olabilir"
    assert dockerfile_denetle("WORKDIR /app\\nFROM python:3.12\\nUSER app") == ["FROM_ILK_DEGIL"], "İlk komut FROM değilse FROM_ILK_DEGIL"
    assert dockerfile_denetle("FROM python\\nUSER app") == ["LATEST"], "Etiketsiz imaj latest demektir"
    assert dockerfile_denetle("from python:latest AS insa\\nFROM python:3.12-slim\\nUSER app") == ["LATEST"], "Küçük harf from ve AS'li aşama da denetlenmeli"
    assert dockerfile_denetle("FROM python:3.12-slim\\nCMD x") == ["ROOT"], "USER yoksa süreç root çalışır"
    assert dockerfile_denetle("FROM python:3.12\\nUSER app\\nUSER root") == ["ROOT"], "Son USER root ise uyarı"
    assert dockerfile_denetle("RUN x\\nFROM ubuntu") == ["FROM_ILK_DEGIL", "LATEST", "ROOT"], "Üç kural birden, belirtilen sırayla"
    assert dockerfile_denetle("FROM registry.local:5000/market/api\\nUSER app") == ["LATEST"], "Kayıt adresindeki port (:5000) etiket sayılmamalı"
  '''),
  'hints': ['Önce yorum/boş satırları atlayıp (komut, argüman) listesi çıkar; sonra üç kuralı ayrı ayrı uygula.', 'Etiketi bulmak için imajın son / sonrası parçasına bak: imaj.rsplit("/", 1)[-1]; içinde ":" yoksa etiket yok.', 'USER için yalnızca son USER önemlidir; "app:app" gibi kullanıcı:grup biçimini split(":")[0] ile ayır.'],
  'why': 'hadolint gibi araçlar CI\'da tam olarak bu tür kurallar koşturur. Kuralları veri üzerinde (komut listesi) çalıştırmak, her birini ayrı test etmeyi kolaylaştırır. Kayıt adresindeki port kenar durumu, gerçek denetleyicilerin de dikkat ettiği bir tuzaktır.'},
 {'t': 'code', 'id': 'docker-deploy-6', 'stage': 'Kendin yaz', 'diff': 2,
  'q': '<p><code>servis_sirasi(yaml_metin)</code> fonksiyonunu yaz: compose YAML\'ını <code>yaml.safe_load</code> ile okuyup servislerin başlatma sırasını liste olarak döndürsün. Bir servis, <code>depends_on</code> listesindeki bütün servisler başlatıldıktan sonra başlar. Aynı anda başlayabilecek servisler <b>alfabetik</b> sırayla eklenir. <code>depends_on</code> yoksa servisin bağımlılığı yoktur.</p>',
  'sol': ded('''
    import yaml

    def servis_sirasi(yaml_metin):
        servisler = yaml.safe_load(yaml_metin)["services"]
        kalan = {ad: set((s or {}).get("depends_on", [])) for ad, s in servisler.items()}
        sira = []
        while kalan:
            hazir = sorted(ad for ad, b in kalan.items() if b <= set(sira))
            if not hazir:
                raise ValueError("döngüsel bağımlılık")
            for ad in hazir:
                sira.append(ad)
                del kalan[ad]
        return sira
  '''),
  'tests': ded('''
    c = """
    services:
      web:
        build: .
        depends_on: [api]
      api:
        depends_on: [db, cache]
      worker:
        depends_on: [db]
      db:
        image: postgres:16
      cache:
        image: redis:7
    """
    s = servis_sirasi(c)
    assert sorted(s) == ["api", "cache", "db", "web", "worker"], "Her servis tam bir kez yer almalı"
    assert s.index("db") < s.index("api") and s.index("cache") < s.index("api"), "api, db ve cache'ten sonra başlamalı"
    assert s.index("api") < s.index("web"), "web, api'den sonra başlamalı"
    assert s == ["cache", "db", "api", "worker", "web"], f"Hazır servisler alfabetik eklenmeli; beklenen ['cache', 'db', 'api', 'worker', 'web'], gelen {s}"
    assert servis_sirasi("services:\\n  b: {}\\n  a: {}\\n") == ["a", "b"], "Bağımlılıksız servisler alfabetik"
  '''),
  'hints': ['Her servis için bağımlılıkları küme olarak tut: {ad: set(depends_on)}.', 'Her turda bağımlılıkları sıradakilerin alt kümesi olan servisleri bul: b <= set(sira).', 'Bir turda bulunan hazır servisleri sorted ile alfabetik ekle, sonra kalanlardan sil.'],
  'why': 'Bu, topolojik sıralamanın (Kahn algoritması) tur tur hâlidir. Compose, Kubernetes ve Airflow gibi araçlar bağımlılık grafından çalışma sırasını aynı mantıkla çıkarır.'},
 {'t': 'code', 'id': 'docker-deploy-7', 'stage': 'Kendin yaz', 'diff': 2,
  'q': '<p>Ekibindeki her servis için aynı standartta Dockerfile üretmek istiyorsun. <code>dockerfile_uret(surum="3.12", komut=("python", "app.py"), port=None, kullanici="app")</code> metni döndürsün (satırlar <code>\\n</code> ile birleşik, sonda <code>\\n</code> yok):</p><pre class="out">FROM python:&lt;surum&gt;-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY . .\nRUN useradd --create-home &lt;kullanici&gt;\nUSER &lt;kullanici&gt;\nEXPOSE &lt;port&gt;\nCMD &lt;komutun JSON listesi&gt;</pre><ul><li><code>kullanici</code> None ise useradd ve USER satırları yazılmaz.</li><li><code>port</code> None ise EXPOSE satırı yazılmaz.</li><li>CMD, <code>json.dumps(list(komut))</code> ile JSON (exec) biçiminde yazılır.</li></ul>',
  'sol': ded('''
    import json

    def dockerfile_uret(surum="3.12", komut=("python", "app.py"), port=None, kullanici="app"):
        s = [f"FROM python:{surum}-slim", "WORKDIR /app", "COPY requirements.txt .",
             "RUN pip install --no-cache-dir -r requirements.txt", "COPY . ."]
        if kullanici:
            s += [f"RUN useradd --create-home {kullanici}", f"USER {kullanici}"]
        if port is not None:
            s.append(f"EXPOSE {port}")
        s.append("CMD " + json.dumps(list(komut)))
        return "\\n".join(s)
  '''),
  'tests': ded('''
    v = dockerfile_uret()
    beklenen = "FROM python:3.12-slim\\nWORKDIR /app\\nCOPY requirements.txt .\\nRUN pip install --no-cache-dir -r requirements.txt\\nCOPY . .\\nRUN useradd --create-home app\\nUSER app\\nCMD [\\"python\\", \\"app.py\\"]"
    assert v == beklenen, "Varsayılan çıktı şablonla birebir aynı olmalı:\\n" + v
    g = dockerfile_uret("3.11", ("uvicorn", "main:app", "--port", "8000"), port=8000, kullanici="market")
    assert g.splitlines()[0] == "FROM python:3.11-slim", "Sürüm FROM satırına yansımalı"
    assert "EXPOSE 8000" in g and "USER market" in g, "Port ve kullanıcı satırları eklenmeli"
    assert g.endswith('CMD ["uvicorn", "main:app", "--port", "8000"]'), "CMD JSON listesi biçiminde olmalı"
    assert g.index("EXPOSE") > g.index("USER"), "EXPOSE, USER'dan sonra gelmeli"
    r = dockerfile_uret(kullanici=None)
    assert "USER" not in r and "useradd" not in r, "kullanici=None ise USER satırları yazılmamalı"
    assert not v.endswith("\\n"), "Sonda satır sonu olmamalı"
  '''),
  'hints': ['Satırları bir listede biriktirip sonda "\\n".join ile birleştir.', 'Koşullu satırlar için if kullanıcı: ve if port is not None: blokları yeterli.', 'CMD için "CMD " + json.dumps(list(komut)); json.dumps çift tırnak üretir.'],
  'why': 'Şablondan üretilen Dockerfile\'lar ekipteki tüm servislerin aynı iyi pratikleri (slim imaj, önbellek dostu sıra, root olmayan kullanıcı, exec biçimli CMD) izlemesini garanti eder. json.dumps, CMD\'nin sinyalleri doğru ileten JSON biçiminde yazılmasını sağlar.'},
 {'t': 'code', 'id': 'docker-deploy-8', 'stage': 'Kendin yaz', 'diff': 2,
  'q': '<p>Konteyner loglarını makinenin okuyabileceği tek satırlık JSON olarak üret:</p><ul><li><code>JsonBicimleyici(logging.Formatter)</code> sınıfı: <code>format(kayit)</code> şu anahtarlarla JSON metni döndürsün: <code>"seviye"</code> (levelname), <code>"kaydedici"</code> (name), <code>"mesaj"</code> (<code>getMessage()</code>). Kayıtta <code>istek_id</code> özniteliği varsa (<code>extra={"istek_id": ...}</code>) onu da ekle. <code>ensure_ascii=False</code> kullan.</li><li><code>kaydedici_kur(ad, akis)</code>: <code>logging.getLogger(ad)</code>\'u alıp önceki işleyicilerini temizlesin, <code>akis</code>\'a yazan bir <code>StreamHandler</code> eklesin, seviyeyi INFO yapsın, <code>propagate = False</code> yapsın ve kaydediciyi döndürsün.</li></ul>',
  'sol': ded('''
    import json, logging

    class JsonBicimleyici(logging.Formatter):
        def format(self, kayit):
            veri = {"seviye": kayit.levelname, "kaydedici": kayit.name, "mesaj": kayit.getMessage()}
            if hasattr(kayit, "istek_id"):
                veri["istek_id"] = kayit.istek_id
            return json.dumps(veri, ensure_ascii=False)

    def kaydedici_kur(ad, akis):
        log = logging.getLogger(ad)
        log.handlers.clear()
        h = logging.StreamHandler(akis)
        h.setFormatter(JsonBicimleyici())
        log.addHandler(h)
        log.setLevel(logging.INFO)
        log.propagate = False
        return log
  '''),
  'tests': ded('''
    import io, json
    akis = io.StringIO()
    log = kaydedici_kur("market.siparis", akis)
    log.debug("görünmemeli")
    log.info("sipariş %s alındı", "S-7")
    log.error("ödeme reddedildi", extra={"istek_id": "r-42"})
    satirlar = akis.getvalue().strip().splitlines()
    assert len(satirlar) == 2, f"DEBUG yazılmamalı, 2 satır bekleniyordu; {len(satirlar)} geldi"
    a, b = json.loads(satirlar[0]), json.loads(satirlar[1])
    assert a == {"seviye": "INFO", "kaydedici": "market.siparis", "mesaj": "sipariş S-7 alındı"}, f"İlk satır yanlış: {a}"
    assert b["istek_id"] == "r-42" and b["seviye"] == "ERROR", "extra ile gelen istek_id JSON'a eklenmeli"
    assert "ş" in satirlar[0], "ensure_ascii=False ile Türkçe karakterler kaçırılmadan yazılmalı"
    kaydedici_kur("market.siparis", akis)
    assert len(log.handlers) == 1, "Tekrar kurulumda işleyiciler çoğalmamalı (önce temizle)"
  '''),
  'hints': ['Formatter alt sınıfında format metodunu ezersin; mesajı kayit.getMessage() ile al ki %s argümanları yerleşsin.', 'extra ile verilen alanlar kaydın özniteliği olur: hasattr(kayit, "istek_id").', 'Aynı ada getLogger hep aynı nesneyi verir; log.handlers.clear() ile çift loglamayı önle.'],
  'why': 'Konteyner platformları stdout\'u toplar; JSON satırları CloudWatch, Loki ya da Elasticsearch\'te alan alan aranabilir. istek_id gibi bağlam alanları bir isteğin bütün loglarını birleştirmenin anahtarıdır.'},
]
# ---------- Hata avı ----------
EX += [
 {'t': 'code', 'id': 'docker-deploy-9', 'stage': 'Hata avı', 'kind': 'bug', 'diff': 2,
  'q': '<p><b>Hatayı bul ve düzelt.</b> <code>ayarlari_oku(env)</code> konteynere verilen ortam değişkenlerinden ayar sözlüğü üretiyor. Canlıda <code>DEBUG=false</code> verilmesine rağmen hata ayıklama açık kaldı ve <code>WEB_CONCURRENCY=4</code> ile işçi sayısı hesaplanırken çöktü. Beklenen: <code>debug</code> bool (<code>"1"</code>, <code>"true"</code>, <code>"yes"</code> büyük/küçük harf duyarsız True; diğerleri ve yokluğu False), <code>port</code> int (varsayılan 8000), <code>isci</code> int (varsayılan 2).</p>',
  'start': ded('''
    def ayarlari_oku(env):
        return {
            "debug": bool(env.get("DEBUG", False)),
            "port": env.get("PORT", 8000),
            "isci": env.get("WEB_CONCURRENCY", 2),
        }

    def toplam_baglanti(ayar, havuz=5):
        return ayar["isci"] * havuz
  '''),
  'sol': ded('''
    def ayarlari_oku(env):
        return {
            "debug": env.get("DEBUG", "").strip().lower() in {"1", "true", "yes"},
            "port": int(env.get("PORT", "8000")),
            "isci": int(env.get("WEB_CONCURRENCY", "2")),
        }

    def toplam_baglanti(ayar, havuz=5):
        return ayar["isci"] * havuz
  '''),
  'tests': ded('''
    a = ayarlari_oku({"DEBUG": "false", "PORT": "9000", "WEB_CONCURRENCY": "4"})
    assert a["debug"] is False, "DEBUG='false' False olmalı: bool('false') True verir"
    assert a["port"] == 9000, "PORT int'e çevrilmeli"
    assert toplam_baglanti(a) == 20, "4 işçi x 5 bağlantı = 20 olmalı ('4' * 5 = '44444' değil)"
    assert ayarlari_oku({"DEBUG": "TRUE"})["debug"] is True, "TRUE büyük harfle de True olmalı"
    b = ayarlari_oku({})
    assert b == {"debug": False, "port": 8000, "isci": 2}, f"Varsayılanlar yanlış: {b}"
  '''),
  'hints': ['İki tür hatası var: ortam değişkenleri her zaman str gelir.', 'bool("false") True\'dur; metni küme üyeliğiyle yorumla.', '"4" * 5 metin tekrarı yapar; int() ile çevir.'],
  'why': 'Ortam değişkenleri metindir; tür dönüşümü yapılmazsa hata ya hemen değil (bool("false")), ya da ileride beklenmedik yerde (metin * sayı) ortaya çıkar. Ayarları okurken türü kesinleştirmek bu sınıf hataları kökten keser.'},
 {'t': 'code', 'id': 'docker-deploy-10', 'stage': 'Hata avı', 'kind': 'bug', 'diff': 2,
  'q': '<p><b>Hatayı bul ve düzelt.</b> <code>hazirlik(kontroller)</code>, bütün bağımlılıklar sağlamsa <code>(200, sonuc)</code>, herhangi biri başarısızsa <code>(503, sonuc)</code> döndürmeli; <code>sonuc</code> her kontrol için True/False içerir. Canlıda Redis çökmüşken yük dengeleyici trafiği göndermeye devam etti ve raporda yalnızca ilk kontrol görünüyordu.</p>',
  'start': ded('''
    def hazirlik(kontroller):
        sonuc = {}
        for ad, kontrol in kontroller.items():
            try:
                kontrol()
                sonuc[ad] = True
            except Exception:
                sonuc[ad] = False
            durum = 200 if any(sonuc.values()) else 503
            return durum, sonuc
  '''),
  'sol': ded('''
    def hazirlik(kontroller):
        sonuc = {}
        for ad, kontrol in kontroller.items():
            try:
                kontrol()
                sonuc[ad] = True
            except Exception:
                sonuc[ad] = False
        durum = 200 if all(sonuc.values()) else 503
        return durum, sonuc
  '''),
  'tests': ded('''
    def iyi():
        pass
    def kotu():
        raise ConnectionError("kapalı")
    d, s = hazirlik({"db": iyi, "redis": kotu})
    assert s == {"db": True, "redis": False}, "Tüm kontroller raporlanmalı; return döngünün dışında olmalı"
    assert d == 503, "Bir kontrol başarısızsa 503 dönmeli (any değil all)"
    assert hazirlik({"db": iyi, "mq": iyi}) == (200, {"db": True, "mq": True}), "Hepsi sağlamsa 200"
    assert hazirlik({})[0] == 200, "Kontrol yoksa 200 (ve None değil)"
  '''),
  'hints': ['İki hata var: biri girinti, biri mantık.', 'return döngünün içinde olduğu için ilk kontrolden sonra fonksiyon bitiyor.', 'Hazır olmak için kontrollerin hepsi geçmeli: any yerine all.'],
  'why': 'Yanlış girinti, döngüyü ilk turda bitirir ve geri kalan bağımlılıklar hiç kontrol edilmez. any ise "en az biri sağlam" demektir; hazırlık için "hepsi sağlam" (all) gerekir. İkisi birlikte, çökmüş bir kopyaya trafik gitmesine yol açar.'},
]
# ---------- Meydan okuma ----------
EX += [
 {'t': 'code', 'id': 'docker-deploy-11', 'stage': 'Meydan okuma', 'diff': 3,
  'q': '<p>Docker\'ın katman önbelleğini taklit et. <code>onbellek_plani(adimlar, onceki, degisen)</code>:</p><ul><li><code>adimlar</code> ve <code>onceki</code>: <code>{"komut": str, "dosyalar": [..]}</code> sözlüklerinin listesi (bu ve önceki inşa). COPY olmayan adımların dosya listesi boştur. <code>"."</code> tüm dosyalar demektir.</li><li><code>degisen</code>: önceki inşadan beri değişen dosya yolları kümesi.</li><li>Adım i önbellekten gelir ⇔ önceki tüm adımlar önbellekten geldiyse <b>ve</b> <code>onceki</code>\'de aynı indekste aynı komut varsa <b>ve</b> adımın dosyalarından hiçbiri değişmediyse. Dosyalar <code>"."</code> içeriyorsa herhangi bir değişiklik adımı bozar.</li></ul><p>Dönüş: <code>(onbellekten_sayisi, yeniden_insa_edilen_komutlar_listesi)</code>.</p>',
  'sol': ded('''
    def onbellek_plani(adimlar, onceki, degisen):
        degisen = set(degisen)
        kirik = False
        kullanilan = 0
        yeniden = []
        for i, adim in enumerate(adimlar):
            if not kirik:
                ayni = i < len(onceki) and onceki[i]["komut"] == adim["komut"]
                dosyalar = adim["dosyalar"]
                if "." in dosyalar:
                    bozuk = bool(degisen)
                else:
                    bozuk = any(d in degisen for d in dosyalar)
                if not ayni or bozuk:
                    kirik = True
            if kirik:
                yeniden.append(adim["komut"])
            else:
                kullanilan += 1
        return kullanilan, yeniden
  '''),
  'tests': ded('''
    A = [
        {"komut": "FROM python:3.12-slim", "dosyalar": []},
        {"komut": "COPY requirements.txt .", "dosyalar": ["requirements.txt"]},
        {"komut": "RUN pip install -r requirements.txt", "dosyalar": []},
        {"komut": "COPY . .", "dosyalar": ["."]},
        {"komut": "CMD python app.py", "dosyalar": []},
    ]
    assert onbellek_plani(A, A, set()) == (5, []), "Hiçbir şey değişmediyse tüm adımlar önbellekten"
    assert onbellek_plani(A, A, {"app.py"}) == (3, ["COPY . .", "CMD python app.py"]), "Yalnızca kod değişince pip install önbellekten gelmeli"
    n, y = onbellek_plani(A, A, {"requirements.txt"})
    assert n == 1 and y[0] == "COPY requirements.txt ." and len(y) == 4, "requirements değişince 2. adımdan itibaren her şey yeniden inşa edilmeli"
    B = [dict(x) for x in A]
    B[2] = {"komut": "RUN pip install --no-cache-dir -r requirements.txt", "dosyalar": []}
    assert onbellek_plani(B, A, set()) == (2, [x["komut"] for x in B[2:]]), "Komut metni değişirse o adım ve sonrası yeniden inşa edilir"
    assert onbellek_plani(A + [{"komut": "EXPOSE 8000", "dosyalar": []}], A, set()) == (5, ["EXPOSE 8000"]), "Önceki inşada olmayan yeni adım önbellekten gelemez"
    assert onbellek_plani(A, [], set())[0] == 0, "İlk inşada önbellek boştur"
  '''),
  'hints': ['Bir kez kırılan önbellek bir daha düzelmez: kirik bayrağı tut.', 'Aynılık kontrolünde onceki kısa olabilir: önce i < len(onceki).', '"." için bozuk = bool(degisen); aksi hâlde any(d in degisen for d in dosyalar).'],
  'why': 'Bu, katman önbelleğinin özü: zincirin ilk kırıldığı yerden sonrası her zaman yeniden çalışır. Dockerfile sırasını tasarlarken hangi değişikliğin kaç adımı bozduğunu böyle düşünürsün.'},
 {'t': 'code', 'id': 'docker-deploy-12', 'stage': 'Meydan okuma', 'diff': 3,
  'q': '<p>Gelişmiş compose planlayıcısı: <code>baslatma_dalgalari(yaml_metin)</code> paralel başlatılabilecek servis gruplarını (dalgaları) liste listesi olarak döndürsün; her dalga alfabetik sıralı.</p><ul><li><code>depends_on</code> liste (<code>[db]</code>) ya da sözlük (<code>{db: {condition: service_healthy}}</code>) olabilir.</li><li>Tanımlı olmayan bir servise bağımlılık varsa <code>ValueError</code> ve mesajında o servisin adı.</li><li>Döngüsel bağımlılık varsa <code>ValueError</code> ve mesajında <code>"döngü"</code> kelimesi.</li></ul>',
  'sol': ded('''
    import yaml

    def baslatma_dalgalari(yaml_metin):
        servisler = yaml.safe_load(yaml_metin).get("services") or {}
        bag = {}
        for ad, tanim in servisler.items():
            dep = (tanim or {}).get("depends_on") or []
            if isinstance(dep, dict):
                dep = list(dep)
            for d in dep:
                if d not in servisler:
                    raise ValueError(f"{ad} tanımsız servise bağlı: {d}")
            bag[ad] = set(dep)
        dalgalar, baslayan = [], set()
        while bag:
            hazir = sorted(a for a, b in bag.items() if b <= baslayan)
            if not hazir:
                raise ValueError("döngü var: " + ", ".join(sorted(bag)))
            dalgalar.append(hazir)
            baslayan.update(hazir)
            for a in hazir:
                del bag[a]
        return dalgalar
  '''),
  'tests': ded('''
    c = """
    services:
      api:
        depends_on:
          db: {condition: service_healthy}
          cache: {condition: service_started}
      worker:
        depends_on: [db]
      web:
        depends_on: [api]
      db: {image: postgres:16}
      cache: {image: redis:7}
    """
    assert baslatma_dalgalari(c) == [["cache", "db"], ["api", "worker"], ["web"]], "Dalgalar: [cache, db] -> [api, worker] -> [web]"
    try:
        baslatma_dalgalari("services:\\n  a:\\n    depends_on: [b]\\n  b:\\n    depends_on: [a]\\n")
        assert False, "Döngüsel bağımlılıkta ValueError fırlatılmalı (sonsuz döngü değil)"
    except ValueError as e:
        assert "döngü" in str(e), "Hata mesajı 'döngü' kelimesini içermeli"
    try:
        baslatma_dalgalari("services:\\n  api:\\n    depends_on: [postgres]\\n")
        assert False, "Tanımsız servise bağımlılıkta ValueError fırlatılmalı"
    except ValueError as e:
        assert "postgres" in str(e), "Mesaj eksik servisin adını içermeli"
    assert baslatma_dalgalari("services:\\n  tek: {}\\n") == [["tek"]], "Tek servis tek dalga"
  '''),
  'hints': ['Sözlük biçimli depends_on için list(dep) anahtarları verir.', 'Her turda hazır kümesi boşsa ama hâlâ servis kaldıysa bu bir döngüdür.', 'Bilinmeyen bağımlılığı sıralamaya başlamadan önce, ilk geçişte denetle.'],
  'why': 'Dalga dalga başlatma, aynı dalgadakilerin paralel çalışabileceğini gösterir; CI hatları ve iş akışı araçları (Airflow, Prefect) da bağımlılık grafını böyle katmanlara ayırır. Döngü ve eksik düğüm denetimi, sonsuz döngü ya da sessiz hata yerine anlamlı bir mesaj üretir.'},
]
# ---------- Mini proje ----------
EX += [
 {'t': 'code', 'id': 'docker-deploy-13', 'stage': 'Mini proje', 'diff': 3,
  'q': '<p><b>Dağıtım ön kontrolü.</b> Anadolu Market API\'sini canlıya göndermeden önce CI\'da çalışacak <code>dagitim_raporu(dockerfile, compose, env)</code> fonksiyonunu yaz. Sözlük döndürsün:</p><ul><li><code>"uyarilar"</code>: Dockerfile uyarı kodları (<code>FROM_ILK_DEGIL</code>, <code>LATEST</code>, <code>ROOT</code> — Kendin yaz aşamasındaki kurallar).</li><li><code>"sira"</code>: compose servis başlatma sırası (depends_on liste ya da sözlük; aynı anda hazır olanlar alfabetik).</li><li><code>"eksik_ortam"</code>: compose\'taki <code>environment</code> değerlerinde <code>$AD</code> ya da <code>$</code><code>{AD}</code> biçiminde başvurulan ama <code>env</code>\'de olmayan değişken adları, alfabetik ve tekrarsız. <code>$</code><code>{AD:-varsayılan}</code> biçimi varsayılan verdiği için eksik sayılmaz.</li><li><code>"hazir"</code>: uyarı yoksa ve eksik ortam değişkeni yoksa True.</li></ul><p>Önceki görevlerde yazdığın fonksiyonları buraya kopyalayıp kullanabilirsin.</p>',
  'sol': ded('''
    import re
    import yaml

    def dockerfile_denetle(metin):
        komutlar = []
        for satir in metin.splitlines():
            satir = satir.strip()
            if not satir or satir.startswith("#"):
                continue
            k, _, arg = satir.partition(" ")
            komutlar.append((k.upper(), arg.strip()))
        uyarilar = []
        if not komutlar or komutlar[0][0] != "FROM":
            uyarilar.append("FROM_ILK_DEGIL")
        for k, arg in komutlar:
            if k == "FROM":
                son = (arg.split() or [""])[0].rsplit("/", 1)[-1]
                if ":" not in son or son.endswith(":latest"):
                    uyarilar.append("LATEST")
                    break
        kullanicilar = [a for k, a in komutlar if k == "USER"]
        if not kullanicilar or kullanicilar[-1].split(":")[0] in ("root", "0"):
            uyarilar.append("ROOT")
        return uyarilar

    def servis_sirasi(servisler):
        kalan = {}
        for ad, t in servisler.items():
            dep = (t or {}).get("depends_on") or []
            kalan[ad] = set(dep)
        sira = []
        while kalan:
            hazir = sorted(a for a, b in kalan.items() if b <= set(sira))
            if not hazir:
                raise ValueError("döngü")
            sira += hazir
            for a in hazir:
                del kalan[a]
        return sira

    DESEN = re.compile(r"\\$\\{(\\w+)(:-[^}]*)?\\}|\\$(\\w+)")

    def eksik_degiskenler(servisler, env):
        eksik = set()
        for t in servisler.values():
            ortam = (t or {}).get("environment") or {}
            degerler = ortam.values() if isinstance(ortam, dict) else ortam
            for deger in degerler:
                for m in DESEN.finditer(str(deger)):
                    ad = m.group(1) or m.group(3)
                    varsayilanli = m.group(2) is not None
                    if not varsayilanli and ad not in env:
                        eksik.add(ad)
        return sorted(eksik)

    def dagitim_raporu(dockerfile, compose, env):
        servisler = yaml.safe_load(compose)["services"]
        uyarilar = dockerfile_denetle(dockerfile)
        eksik = eksik_degiskenler(servisler, env)
        return {"uyarilar": uyarilar, "sira": servis_sirasi(servisler),
                "eksik_ortam": eksik, "hazir": not uyarilar and not eksik}
  '''),
  'tests': ded('''
    DF = "FROM python:3.12-slim\\nWORKDIR /app\\nCOPY . .\\nUSER app\\nCMD [\\"python\\", \\"-m\\", \\"market\\"]"
    CMP = """
    services:
      api:
        build: .
        environment:
          DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/market
          SECRET_KEY: $SECRET_KEY
          LOG_LEVEL: ${LOG_LEVEL:-INFO}
        depends_on:
          db: {condition: service_healthy}
      db:
        image: postgres:16
        environment:
          POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    """
    r = dagitim_raporu(DF, CMP, {"POSTGRES_PASSWORD": "x", "SECRET_KEY": "y"})
    assert r == {"uyarilar": [], "sira": ["db", "api"], "eksik_ortam": [], "hazir": True}, f"Her şey tamamken rapor hazır olmalı: {r}"
    r = dagitim_raporu(DF, CMP, {})
    assert r["eksik_ortam"] == ["POSTGRES_PASSWORD", "SECRET_KEY"], "Eksik değişkenler alfabetik ve tekrarsız; LOG_LEVEL varsayılanlı olduğu için eksik değil: " + str(r["eksik_ortam"])
    assert r["hazir"] is False, "Eksik ortam değişkeni varken dağıtım hazır değildir"
    r = dagitim_raporu("FROM python\\nCMD x", CMP, {"POSTGRES_PASSWORD": "x", "SECRET_KEY": "y"})
    assert r["uyarilar"] == ["LATEST", "ROOT"] and r["hazir"] is False, "Dockerfile uyarıları rapora yansımalı"
    liste_ortam = "services:\\n  w:\\n    environment:\\n      - TOKEN=$API_TOKEN\\n"
    assert dagitim_raporu(DF, liste_ortam, {})["eksik_ortam"] == ["API_TOKEN"], "environment liste biçiminde (- AD=deger) de olabilir"
  '''),
  'hints': ['İşi üç küçük fonksiyona böl: Dockerfile denetimi, sıralama, eksik değişken bulma; dagitim_raporu yalnızca birleştirir.', 'Değişken deseni için tek regex: r"\\$\\{(\\w+)(:-[^}]*)?\\}|\\$(\\w+)"; ad ya 1. ya 3. grupta, 2. grup varsayılanı yakalar.', 'environment sözlükse .values(), listeyse elemanların kendisi taranır.'],
  'why': 'Gerçek CI hatlarında dağıtım öncesi "ön uçuş kontrolü" (preflight) tam olarak budur: imaj kuralları, servis grafiği ve eksik sırlar canlıya çıkmadan yakalanır. Küçük, test edilebilir fonksiyonlara bölmek her kuralın ayrı geliştirilmesini sağlar.'},
]

LESSON['ex'] = EX
LESSON['faq'] = [
 {'q': 'Docker\'ı bilgisayarıma nasıl kurarım?', 'a': 'Windows ve macOS\'ta Docker Desktop\'ı kur (Windows\'ta WSL 2 arka ucu önerilir). Linux\'ta dağıtımının paket yöneticisiyle Docker Engine ve compose eklentisini kur, kullanıcını docker grubuna ekle. Kurulumu <code>docker run --rm hello-world</code> ile doğrula.'},
 {'q': 'Geliştirirken her değişiklikte imajı yeniden inşa etmem mi gerekiyor?', 'a': 'Hayır. Geliştirmede kaynak klasörünü konteynere bağla (compose\'ta <code>volumes: [".:/app"]</code>) ve sunucuyu <code>--reload</code> ile çalıştır; kod değişince süreç kendini yeniler. Üretim imajı ise kodu COPY ile içine alır ve bağlama kullanmaz.'},
 {'q': 'Veritabanını da konteynerde mi çalıştırmalıyım?', 'a': 'Geliştirme ve test için evet, compose ile çok pratik. Üretimde ise çoğu ekip yönetilen veritabanı (AWS RDS, Cloud SQL, Render PostgreSQL) kullanır: yedekleme, yükseltme ve yüksek erişilebilirlik sağlayıcıdadır. Uygulama yalnızca DATABASE_URL\'ini değiştirir.'},
 {'q': 'Kubernetes öğrenmem gerekiyor mu?', 'a': 'Başlangıçta hayır. Render, Railway, Fly.io ya da Cloud Run gibi platformlar konteynerini doğrudan çalıştırır. Kubernetes çok sayıda servisi olan, ayrıntılı ölçekleme ve ağ denetimi isteyen kurumsal ekiplerde karşına çıkar; buradaki kavramlar (imaj, ortam değişkeni, sağlık kontrolü, stdout log) orada da aynıdır.'},
]
LESSON['mistakes'] = [
 {'bad': 'COPY . .\nRUN pip install -r requirements.txt', 'good': 'COPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY . .', 'why': 'Kod her değiştiğinde bağımlılık katmanı da geçersiz olur ve tüm paketler yeniden iner; önce yalnızca requirements.txt\'yi kopyala.'},
 {'bad': 'debug = bool(os.environ.get("DEBUG"))', 'good': 'debug = os.environ.get("DEBUG", "").lower() in {"1", "true", "yes"}', 'why': 'Ortam değişkenleri metindir; bool("false") True verir ve üretimde hata ayıklama açık kalır.'},
 {'bad': 'ENV DATABASE_PASSWORD=GizliSifre123', 'good': '# docker run -e DATABASE_PASSWORD=... ya da sır yöneticisi\npassword = os.environ["DATABASE_PASSWORD"]', 'why': 'ENV ile yazılan değer imaj katmanlarında kalır ve imajı çeken herkes görür; sırlar çalışma anında verilir.'},
 {'bad': 'CMD python app.py', 'good': 'CMD ["python", "app.py"]', 'why': 'Shell biçimi süreci /bin/sh altında başlatır, SIGTERM Python\'a ulaşmayabilir ve konteyner düzgün kapanmaz; exec (JSON) biçimini kullan.'},
 {'bad': 'logging.basicConfig(filename="/app/app.log")', 'good': 'logging.basicConfig(stream=sys.stdout, level=logging.INFO)', 'why': 'Konteyner içindeki dosya konteynerle birlikte silinir; 12-factor\'a göre loglar stdout\'a yazılır, platform toplar.'},
]

check_body(BODY)
emit(LESSON, '/home/claude/py/v2/i6/docker-deploy.js', 'Docker ve dağıtım')
