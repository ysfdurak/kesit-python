/* Kesit Python — 'proje-api' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'proje-api',
    min: 35,
    html: `<p>Projenin çekirdeği hazır: şemalar, depo, servis, uç noktalar, testler ve tek konteynerlik bir Dockerfile. Gerçek bir backend portföy projesinde işverenin görmek istediği bir sonraki katman şudur: kalıcı bir veritabanı ve onun migration'ları, sık okunan veriler için önbellek, isteği bekletmeyen arka plan işleri ve kötüye kullanımı sınırlayan hız sınırı. Bu bölüm dört parçayı tek bir <code>docker compose</code> dosyasında birleştiriyor.</p>
<h2>Hedef mimari</h2>
<div class="tbl-wrap"><table><tr><th>Servis</th><th>Görev</th><th>Derste nerede gördün?</th></tr>
<tr><td><code>api</code></td><td>FastAPI + uvicorn; istekleri karşılar</td><td>fastapi, bu proje</td></tr>
<tr><td><code>db</code></td><td>PostgreSQL 16; kalıcı veri (adlandırılmış birim)</td><td>postgresql-python</td></tr>
<tr><td><code>migrate</code></td><td>Tek seferlik: <code>alembic upgrade head</code>, sonra çıkar</td><td>sqlalchemy-orm (Derinleş)</td></tr>
<tr><td><code>redis</code></td><td>Ürün kataloğu önbelleği, hız sınırı sayaçları, iş kuyruğu</td><td>redis-kuyruk</td></tr>
<tr><td><code>worker</code></td><td>Kuyruktan iş alır: sipariş onay e-postası</td><td>redis-kuyruk</td></tr></table></div>
<pre class="code"># compose.yaml
services:
  db:
    image: postgres:16
    environment: {POSTGRES_USER: market, POSTGRES_PASSWORD: $\{DB_SIFRE}, POSTGRES_DB: market}
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck: {test: ["CMD-SHELL", "pg_isready -U market"], interval: 5s, retries: 10}
  redis:
    image: redis:7-alpine
    healthcheck: {test: ["CMD", "redis-cli", "ping"], interval: 5s}
  migrate:
    build: .
    command: alembic upgrade head
    environment: &amp;ortam
      DATABASE_URL: postgresql+psycopg://market:$\{DB_SIFRE}@db/market
      REDIS_URL: redis://redis:6379/0
    depends_on: {db: {condition: service_healthy}}
  api:
    build: .
    command: uvicorn market.app:app --host 0.0.0.0 --port 8000
    environment: *ortam
    ports: ["8000:8000"]
    depends_on:
      migrate: {condition: service_completed_successfully}
      redis: {condition: service_healthy}
  worker:
    build: .
    command: python -m market.worker
    environment: *ortam
    depends_on:
      migrate: {condition: service_completed_successfully}
      redis: {condition: service_healthy}
volumes:
  pgdata:</pre>
<p><code>service_completed_successfully</code> sayesinde API, migration bitmeden başlamaz; birden çok API kopyası aynı anda migration çalıştırmaya kalkmaz. <code>&amp;ortam</code> / <code>*ortam</code> YAML çapası, ortam değişkenlerini tek yerde tanımlar. <code>$\{DB_SIFRE}</code> depoya girmeyen <code>.env</code> dosyasından gelir.</p>
<h2>Önbellek: önce Redis'e bak</h2>
<p>Ürün listesi sık okunur, seyrek değişir: önbellek kalıbı (cache-aside) için ideal. Okurken önce Redis'e bak, yoksa veritabanından oku ve süreli (TTL) yaz; ürün güncellenince anahtarı sil.</p>
<pre class="code">async def urunleri_getir(kategori: str) -&gt; list[dict]:
    anahtar = f"urunler:{kategori}:v1"
    if (hazir := await redis.get(anahtar)) is not None:
        return json.loads(hazir)
    urunler = await depo.kategoriye_gore(kategori)
    await redis.set(anahtar, json.dumps(urunler), ex=300)     # 5 dakika
    return urunler

async def urun_guncelle(urun_id, alanlar):
    urun = await depo.guncelle(urun_id, alanlar)
    await redis.delete(f"urunler:{urun.kategori}:v1")         # geçersiz kıl
    return urun</pre>
<h2>Arka plan işi: onay e-postası isteği bekletmesin</h2>
<p>Sipariş oluşturan istek, SMTP sunucusunun 2 saniyelik yanıtını beklememeli. Uç nokta siparişi kaydedip kuyruğa bir iş bırakır ve hemen 201 döner; <code>worker</code> işi alıp e-postayı gönderir, başarısız olursa artan aralıklarla yeniden dener. İş, siparişle <b>aynı transaction'da</b> bir "giden kutusu" (outbox) tablosuna yazılırsa sipariş kaydedilip iş kaybolamaz.</p>
<pre class="code"># market/worker.py  (RQ ile; Celery ya da arq da olur)
from redis import Redis
from rq import Worker, Queue
Worker([Queue("eposta", connection=Redis.from_url(REDIS_URL))]).work()

# uç noktada
kuyruk.enqueue("market.isler.onay_epostasi", siparis.id, retry=Retry(max=3, interval=[10, 60, 300]))</pre>
<h2>Hız sınırı</h2>
<p>Giriş ve sipariş uç noktaları kaba kuvvete ve kötüye kullanıma açıktır. En yaygın iki algoritma: <b>sabit pencere</b> (her dakika için bir sayaç: <code>INCR</code> + <code>EXPIRE</code>; basit ama pencere sınırında iki kat patlamaya izin verir) ve <b>jeton kovası</b> (token bucket: kova saniyede r jetonla dolar, en fazla b jeton tutar; her istek bir jeton harcar; kısa patlamalara izin verip ortalamayı sınırlar). Sınır aşılınca <b>429 Too Many Requests</b> ve <code>Retry-After</code> başlığı dönülür. Anahtar olarak giriş yapmış kullanıcının kimliği, yoksa istemci IP'si kullanılır (Nginx arkasında <code>X-Forwarded-For</code>'a dikkat). Redis'te tutmak, birden çok API kopyasının aynı sayacı paylaşmasını sağlar.</p>
<pre class="py">import time

class JetonKovasi:
    def __init__(self, hiz, kapasite, saat=time.monotonic):
        self.hiz, self.kapasite, self.saat = hiz, kapasite, saat
        self.durum = {}                            # anahtar -&gt; (jeton, son_zaman)

    def izin(self, anahtar):
        simdi = self.saat()
        jeton, son = self.durum.get(anahtar, (self.kapasite, simdi))
        jeton = min(self.kapasite, jeton + (simdi - son) * self.hiz)
        if jeton &gt;= 1:
            self.durum[anahtar] = (jeton - 1, simdi)
            return True, 0.0
        self.durum[anahtar] = (jeton, simdi)
        return False, round((1 - jeton) / self.hiz, 2)    # Retry-After (sn)

zaman = [0.0]
kova = JetonKovasi(hiz=1, kapasite=3, saat=lambda: zaman[0])
for t in [0, 0, 0, 0, 0.5, 1.2, 5]:
    zaman[0] = t
    print(t, kova.izin("ip:10.0.0.7"))</pre>
<div class="note"><b>Kendi bilgisayarında dene</b><code>docker compose up --build</code> ile tüm yığını başlat; <code>docker compose logs -f worker</code> ile e-posta işini izle. E-postayı gerçekten göndermemek için compose'a <code>mailpit</code> servisini ekleyip SMTP adresini ona yönlendir; gönderilen postaları tarayıcıda görürsün. Hız sınırını <code>for i in $(seq 20); do curl -s -o /dev/null -w "%{http_code}\\n" localhost:8000/giris; done</code> ile dene.</div>
<div class="note"><b>Gerçek işte</b>README'de bu mimarinin bir şeması, "tek komutla çalıştır" talimatı ve her bileşenin neden orada olduğunu açıklayan birer cümle, portföy projesini sıradan bir CRUD örneğinden ayırır. Mülakatta "Redis çökerse ne olur?" sorusuna hazır ol: önbellek atlanır (veritabanından okunur), hız sınırı ya gevşek moda geçer ya da istekleri reddeder; bu bir tasarım kararıdır.</div>`,
    ex: [
      {
        t: 'mc',
        id: 'proje-api-y1',
        stage: 'Isınma',
        q: 'compose\'da <code>api</code> servisi <code>migrate: {condition: service_completed_successfully}</code> ile bekliyor. Bunun kazancı nedir?',
        o: [
          'API, gelen ilk istekte migration\'ı kendisi çalıştırır',
          'Şema güncellenmeden API başlamaz; migration bir kez çalışır',
          'Migration başarısız olsa bile API eski şemayla açılmaya devam eder',
          'Veritabanı için ayrıca sağlık kontrolü yazmak gereksiz hâle gelir'
        ],
        a: 1,
        why: 'migrate servisi bir kez çalışıp çıkar; API yalnız o başarıyla bitince başlar. API kopyalarının her biri başlarken migration çalıştırsaydı aynı anda yarışırlardı. Migration başarısız olursa API hiç başlamaz; bu, yanlış şemayla çalışmaktan iyidir.'
      },
      {
        t: 'mc',
        id: 'proje-api-y2',
        stage: 'Isınma',
        q: 'Sabit pencereli hız sınırı (dakikada 100 istek) için hangisi doğru bir eleştiridir?',
        o: [
          'Redis olmadan hiçbir şekilde uygulanamaz, bellekte çalışmaz',
          'Pencere sınırında iki saniyede 200 istek geçebilir',
          'Her istek için tüm zaman damgası geçmişini saklamak gerekir',
          'Kullanıcı başına değil yalnızca tüm sistem için uygulanabilir'
        ],
        a: 1,
        why: 'Sabit pencere sayaç sınırında sıfırlanır; iki pencerenin kenarında sınırın iki katı kısa sürede geçebilir. Kayan pencere ya da jeton kovası bunu yumuşatır. Sabit pencere ise bellekte de uygulanabilir ve tüm geçmişi değil yalnız bir sayaç tutar.'
      },
      {
        t: 'predict',
        id: 'proje-api-y3',
        stage: 'Kodu oku',
        q: 'Jeton kovası (hız 1/sn, kapasite 2): bu kod ne yazdırır?',
        o: ['✓✓✗✗✓✗✓✓✗', '✓✓✗✓✓✗✓✓✓', '✓✓✓✗✓✗✓✓✗', '✓✓✗✗✓✓✓✓✗'],
        a: 0,
        code: 'class Kova:\n    def __init__(self, hiz, kap):\n        self.hiz, self.kap, self.jeton, self.son = hiz, kap, kap, 0.0\n    def izin(self, t):\n        self.jeton = min(self.kap, self.jeton + (t - self.son) * self.hiz)\n        self.son = t\n        if self.jeton >= 1:\n            self.jeton -= 1\n            return "✓"\n        return "✗"\n\nk = Kova(1, 2)\nprint("".join(k.izin(t) for t in [0, 0, 0, 0.5, 1.0, 1.0, 4.0, 4.0, 4.0]))\n',
        why: 'Kova 2 jetonla başlar: ilk iki istek geçer, üçüncü reddedilir. 0,5 sn\'de yarım jeton vardır (geçmez); 1,0\'da bir tam jeton olur, biri geçer, aynı andaki ikinci geçmez. 4,0\'da kova kapasiteye (2) dolmuştur: iki geçer, üçüncü reddedilir. Kapasite, patlamanın üst sınırıdır.'
      },
      {
        t: 'order',
        id: 'proje-api-y4',
        stage: 'Kodu oku',
        q: '<p>Önbellek kalıbını (cache-aside) sözlükle taklit eden programı sırala: ilk çağrı veritabanına gider, ikinci önbellekten gelir. Beklenen çıktı:</p><pre class="out">db 1\nönbellek 1</pre>',
        lines: [
          'onbellek, db_okuma = {}, [0]',
          'def urunler(kategori):',
          '    if kategori in onbellek:',
          '        return "önbellek", db_okuma[0]',
          '    db_okuma[0] += 1',
          '    onbellek[kategori] = ["Termos", "Yoga Matı"]',
          '    return "db", db_okuma[0]',
          'ilk = urunler("Spor")',
          'print(*ilk)',
          'print(*urunler("Spor"))'
        ],
        expect: 'db 1\nönbellek 1\n',
        hint: 'Önbellek kontrolü fonksiyonun ilk işidir; veritabanı okuması yalnız ıska (miss) durumunda olur.',
        why: 'Cache-aside\'da uygulama önce önbelleğe bakar; ıskada kaynaktan okur ve önbelleğe yazar. Gerçek sistemde yazarken TTL verilir ve veri değişince anahtar silinir.'
      },
      {
        t: 'code',
        id: 'proje-api-y5',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Sabit pencereli hız sınırlayıcı yaz: <code>SabitPencere(limit, pencere_sn, saat)</code>, <code>izin(anahtar)</code> metodu <code>(izinli, kalan, retry_after)</code> döndürsün. Pencere numarası <code>int(saat() // pencere_sn)</code>; sayaç <code>(anahtar, pencere_no)</code> için tutulur (Redis\'teki <code>INCR oran:&lt;anahtar&gt;:&lt;no&gt;</code> gibi). İzinliyse <code>kalan = limit - sayac</code>, <code>retry_after = 0</code>; değilse <code>kalan = 0</code> ve <code>retry_after</code> pencerenin bitmesine kalan tam saniye (yukarı yuvarlanmış). Eski pencerelerin sayaçlarını sil ki bellek büyümesin.</p>',
        guide: [
          'saat() ile şimdiki zamanı, // ile pencere numarasını hesapla.',
          'Sayaç sözlüğünde (anahtar, no) değerini 1 artır; eski numaralı girdileri temizle.',
          'sayac <= limit ise izinli.',
          'Değilse retry_after = ceil((no + 1) * pencere_sn - simdi).'
        ],
        example: 'import math\nsimdi, pencere = 125.3, 60\nno = int(simdi // pencere)\nprint(no, math.ceil((no + 1) * pencere - simdi))\n',
        start: 'import math\n\nclass SabitPencere:\n    def __init__(self, limit, pencere_sn, saat):\n        self.limit, self.pencere, self.saat = limit, pencere_sn, saat\n        self.sayac = {}\n\n    def izin(self, anahtar):\n        simdi = self.saat()\n        no = int(simdi // self.pencere)\n        # TODO: eski pencereleri sil, sayacı artır\n        # TODO: izin ve retry_after\n        return True, self.limit, 0\n',
        sol: 'import math\n\nclass SabitPencere:\n    def __init__(self, limit, pencere_sn, saat):\n        self.limit, self.pencere, self.saat = limit, pencere_sn, saat\n        self.sayac = {}\n\n    def izin(self, anahtar):\n        simdi = self.saat()\n        no = int(simdi // self.pencere)\n        for k in [k for k in self.sayac if k[1] < no]:\n            del self.sayac[k]\n        n = self.sayac.get((anahtar, no), 0) + 1\n        self.sayac[(anahtar, no)] = n\n        if n <= self.limit:\n            return True, self.limit - n, 0\n        return False, 0, math.ceil((no + 1) * self.pencere - simdi)\n',
        tests: 't = [0.0]\ns = SabitPencere(3, 60, lambda: t[0])\nt[0] = 10\nassert [s.izin("ip:1") for _ in range(4)] == [(True, 2, 0), (True, 1, 0), (True, 0, 0), (False, 0, 50)], "4. istek reddedilmeli, pencere 50 sn sonra biter"\nassert s.izin("ip:2") == (True, 2, 0), "Başka anahtarın sayacı ayrı"\nt[0] = 59.5\nassert s.izin("ip:1")[2] == 1, "Kalan 0,5 sn yukarı yuvarlanır: 1"\nt[0] = 60\nassert s.izin("ip:1") == (True, 2, 0), "Yeni pencerede sayaç sıfırlanır"\nassert all(k[1] == 1 for k in s.sayac), "Eski pencere sayaçları silinmiş olmalı"\n',
        hints: [
          'Sayaç anahtarı (anahtar, pencere_no) demetidir.',
          'Temizlik: no\'dan küçük pencere numaralı anahtarları listeye alıp sil (gezerken sözlüğü değiştirme).',
          'retry_after = math.ceil((no + 1) * self.pencere - simdi)'
        ],
        why: 'Redis\'te bu kalıp INCR + EXPIRE ile iki komuttur ve tüm API kopyaları aynı sayacı paylaşır. Eski pencereleri silmek Redis\'te EXPIRE\'ın işidir; bellekte ise senin sorumluluğundadır. Saat fonksiyonunu dışarıdan almak testleri deterministik yapar.'
      },
      {
        t: 'code',
        id: 'proje-api-y6',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Hız sınırını bir uç nokta sarmalayıcısına bağla: <code>sinirla(sinirlayici, isleyici)</code> bir fonksiyon döndürsün; dönen fonksiyon <code>istek</code> sözlüğü alır (<code>{"kullanici": str | None, "ip": str, ...}</code>). Anahtar: kullanıcı varsa <code>"k:" + kullanici</code>, yoksa <code>"ip:" + ip</code>. İzin varsa <code>isleyici(istek)</code>\'in döndürdüğü <code>(durum, govde, basliklar)</code> yanıtına <code>X-RateLimit-Remaining</code> başlığını (metin) ekle; izin yoksa <code>(429, {"hata": "çok fazla istek"}, {"Retry-After": "&lt;sn&gt;", "X-RateLimit-Remaining": "0"})</code> döndür ve işleyiciyi çağırma. Sınırlayıcı önceki görevdeki arayüze sahip: <code>izin(anahtar) -&gt; (izinli, kalan, retry_after)</code>.</p>',
        start: 'def sinirla(sinirlayici, isleyici):\n    pass\n',
        sol: 'def sinirla(sinirlayici, isleyici):\n    def sarmal(istek):\n        anahtar = "k:" + istek["kullanici"] if istek.get("kullanici") else "ip:" + istek["ip"]\n        izinli, kalan, sonra = sinirlayici.izin(anahtar)\n        if not izinli:\n            return 429, {"hata": "çok fazla istek"}, {"Retry-After": str(sonra), "X-RateLimit-Remaining": "0"}\n        durum, govde, basliklar = isleyici(istek)\n        return durum, govde, {**basliklar, "X-RateLimit-Remaining": str(kalan)}\n    return sarmal\n',
        tests: 'class Sahte:\n    def __init__(self):\n        self.say = {}\n    def izin(self, a):\n        self.say[a] = self.say.get(a, 0) + 1\n        return (True, 2 - self.say[a], 0) if self.say[a] <= 2 else (False, 0, 30)\ncagri = []\ndef giris(istek):\n    cagri.append(istek["ip"])\n    return 200, {"ok": True}, {"Content-Type": "application/json"}\nuc = sinirla(Sahte(), giris)\nassert uc({"kullanici": None, "ip": "10.0.0.7"}) == (200, {"ok": True}, {"Content-Type": "application/json", "X-RateLimit-Remaining": "1"}), "İlk istek geçer, kalan başlığı eklenir"\nuc({"kullanici": None, "ip": "10.0.0.7"})\nassert uc({"kullanici": None, "ip": "10.0.0.7"}) == (429, {"hata": "çok fazla istek"}, {"Retry-After": "30", "X-RateLimit-Remaining": "0"}), "Üçüncü istek 429"\nassert len(cagri) == 2, "429 durumunda işleyici çağrılmamalı"\nassert uc({"kullanici": "ece", "ip": "10.0.0.7"})[0] == 200, "Giriş yapmış kullanıcı kendi anahtarıyla sınırlanır"\n',
        hints: ['Bir iç fonksiyon tanımla ve onu döndür (kapanış).', 'Anahtar seçimi: istek.get("kullanici") doluysa kullanıcı, değilse IP.', 'Başlık değerleri HTTP\'de metindir: str(kalan).'],
        why: 'Hız sınırını iş mantığından ayırıp sarmalayıcıya (FastAPI\'de middleware ya da bağımlılık) koymak, her uç noktaya aynı kuralı tek satırla uygulatır. Retry-After başlığı istemcinin ne kadar bekleyeceğini bilmesini sağlar; iyi istemciler buna uyar.'
      },
      {
        t: 'code',
        id: 'proje-api-y7',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Hatayı bul ve düzelt. <code>Katalog</code> sınıfı ürünleri önbellekle sunuyor. Fiyat güncellendikten sonra API saatlerce eski fiyatı gösteriyor ve önbellekteki listeyi değiştiren bir çağıran tüm kullanıcıları etkiliyor. İki düzeltme: güncellemede ilgili kategori anahtarını sil; önbelleğe ve önbellekten <b>kopya</b> ver (Redis\'teki JSON gibi).</p>',
        start: 'class Katalog:\n    def __init__(self, db):\n        self.db = db                 # {urun_id: {"ad", "kategori", "fiyat"}}\n        self.onbellek = {}\n        self.db_okuma = 0\n\n    def kategori(self, k):\n        if k not in self.onbellek:\n            self.db_okuma += 1\n            self.onbellek[k] = [u for u in self.db.values() if u["kategori"] == k]\n        return self.onbellek[k]\n\n    def fiyat_guncelle(self, urun_id, fiyat):\n        self.db[urun_id] = {**self.db[urun_id], "fiyat": fiyat}\n',
        sol: 'import copy\n\nclass Katalog:\n    def __init__(self, db):\n        self.db = db\n        self.onbellek = {}\n        self.db_okuma = 0\n\n    def kategori(self, k):\n        if k not in self.onbellek:\n            self.db_okuma += 1\n            self.onbellek[k] = copy.deepcopy([u for u in self.db.values() if u["kategori"] == k])\n        return copy.deepcopy(self.onbellek[k])\n\n    def fiyat_guncelle(self, urun_id, fiyat):\n        self.db[urun_id] = {**self.db[urun_id], "fiyat": fiyat}\n        self.onbellek.pop(self.db[urun_id]["kategori"], None)\n',
        tests: 'k = Katalog({1: {"ad": "Termos", "kategori": "Spor", "fiyat": 459}, 2: {"ad": "Suç ve Ceza", "kategori": "Kitap", "fiyat": 145}})\nk.kategori("Spor"); k.kategori("Spor")\nassert k.db_okuma == 1, "İkinci okuma önbellekten gelmeli"\nliste = k.kategori("Spor")\nliste[0]["fiyat"] = 1\nliste.append({"ad": "sahte"})\nassert k.kategori("Spor") == [{"ad": "Termos", "kategori": "Spor", "fiyat": 459}], "Çağıranın değişikliği önbelleği bozmamalı"\nk.kategori("Kitap")\nk.fiyat_guncelle(1, 399)\nassert k.kategori("Spor")[0]["fiyat"] == 399, "Güncellemeden sonra yeni fiyat görülmeli"\nassert k.db_okuma == 3, "Yalnız Spor anahtarı silinmeli; Kitap önbellekte kalmalı"\nk.kategori("Kitap")\nassert k.db_okuma == 3, "Kitap kategorisi hâlâ önbellekten gelmeli"\n',
        hints: ['İki ayrı sorun: geçersiz kılma yok ve aynı liste nesnesi paylaşılıyor.', 'Güncellemede onbellek.pop(kategori, None).', 'copy.deepcopy ile hem yazarken hem okurken kopya ver.'],
        why: 'Önbellekte en sık iki hata, değişikliğin önbelleği geçersiz kılmaması (bayat veri) ve bellek içi önbellekte paylaşılan değişebilir nesnelerdir. Redis\'te veri JSON olarak saklandığı için ikincisi doğal olarak çözülür; Python içi önbellekte (functools.lru_cache dahil) ise senin sorumluluğundadır.'
      },
      {
        t: 'code',
        id: 'proje-api-y8',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Arka plan işçisini yeniden deneme ile simüle et: <code>isci_calistir(isler, gonder, gecikmeler=(10, 60, 300))</code>. <code>isler</code> <code>(zaman, is_id)</code> listesidir (kuyruğa giriş zamanı). <code>gonder(is_id, deneme)</code> başarılıysa <code>True</code>, değilse <code>False</code> döner (deneme 1\'den başlar). Başarısız iş, <code>gecikmeler[deneme-1]</code> saniye sonra yeniden kuyruğa girer; gecikmeler bitince iş "ölü" kuyruğa (dead letter) gider. İşçi işleri her zaman <b>en erken zamanlı</b> olandan (eşitlikte is_id küçük olandan) işler. <code>{"basarili": [(is_id, zaman, deneme), ...], "olu": [is_id, ...]}</code> döndür (oluş sırasıyla).</p>',
        start: 'import heapq\n\ndef isci_calistir(isler, gonder, gecikmeler=(10, 60, 300)):\n    return {"basarili": [], "olu": []}\n',
        sol: 'import heapq\n\ndef isci_calistir(isler, gonder, gecikmeler=(10, 60, 300)):\n    kuyruk = [(z, i, 1) for z, i in isler]\n    heapq.heapify(kuyruk)\n    sonuc = {"basarili": [], "olu": []}\n    while kuyruk:\n        z, i, d = heapq.heappop(kuyruk)\n        if gonder(i, d):\n            sonuc["basarili"].append((i, z, d))\n        elif d <= len(gecikmeler):\n            heapq.heappush(kuyruk, (z + gecikmeler[d - 1], i, d + 1))\n        else:\n            sonuc["olu"].append(i)\n    return sonuc\n',
        tests: 'hata_sayisi = {101: 1, 102: 0, 103: 9, 104: 2}\ndef gonder(i, d):\n    return d > hata_sayisi[i]\nr = isci_calistir([(0, 101), (0, 102), (5, 103), (20, 104)], gonder)\nassert r["basarili"] == [(102, 0, 1), (101, 10, 2), (104, 90, 3)], f"Başarılar: {r[\'basarili\']}"\nassert r["olu"] == [103], "103 dört denemede de başarısız: ölü kuyruğa"\nassert isci_calistir([], gonder) == {"basarili": [], "olu": []}, "Boş kuyruk"\nr2 = isci_calistir([(0, 7)], lambda i, d: False, gecikmeler=())\nassert r2 == {"basarili": [], "olu": [7]}, "Yeniden deneme yoksa ilk hatada ölü"\n',
        hints: [
          'Öncelik kuyruğu: heapq ile (zaman, is_id, deneme) demetleri; en küçük önce çıkar.',
          'Başarısızlıkta deneme <= len(gecikmeler) ise yeni zamanla geri koy.',
          '104: 20\'de ilk deneme, +10 → 30\'da ikinci, +60 → 90\'da üçüncü (başarılı).'
        ],
        why: 'RQ, Celery ve arq\'ın yeniden deneme mantığı budur: artan gecikmeler geçici hataları (SMTP yoğunluğu) atlatır, sınırlı deneme sayısı kalıcı hataları (geçersiz adres) sonsuz döngüden kurtarır. Ölü kuyruk, elle incelenecek işlerin kaybolmamasını sağlar.'
      }
    ],
    faq: [
      {
        q: 'Celery mi, RQ mu, arq mı?',
        a: 'RQ en basitidir: Redis ve sıradan Python fonksiyonları. arq async (FastAPI ile doğal). Celery en kapsamlısıdır: zamanlanmış görevler, iş akışları, RabbitMQ desteği; ama yapılandırması ağırdır. Portföy projesinde RQ ya da arq yeterlidir; mülakatta seçimi gerekçelendirebilmek önemlidir.'
      }
    ]
  }
);
})(window);
