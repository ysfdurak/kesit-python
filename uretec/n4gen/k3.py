import sys
sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/n4gen')
from n4jsgen import py, code, emit

# Alıştırmalarda hazır verilen sahte Redis (dict + TTL + sabit saat)
FR = '''class Saat:
    def __init__(self, t=0.0):
        self.t = t
    def __call__(self):
        return self.t
    def ilerle(self, s):
        self.t += s

class FakeRedis:
    def __init__(self, saat):
        self.saat, self.v, self.bitis = saat, {}, {}
    def _canli(self, k):
        b = self.bitis.get(k)
        if b is not None and self.saat() >= b:
            self.v.pop(k, None)
            self.bitis.pop(k, None)
        return k in self.v
    def get(self, k):
        return self.v[k] if self._canli(k) else None
    def set(self, k, deger, ex=None, px=None, nx=False):
        if nx and self._canli(k):
            return False
        self.v[k] = deger
        self.bitis.pop(k, None)
        if ex is not None or px is not None:
            self.bitis[k] = self.saat() + (ex if ex is not None else px / 1000)
        return True
    def delete(self, *anahtarlar):
        n = 0
        for k in anahtarlar:
            if self._canli(k):
                n += 1
            self.v.pop(k, None)
            self.bitis.pop(k, None)
        return n
    def incr(self, k):
        self.v[k] = int(self.get(k) or 0) + 1
        return self.v[k]
    def expire(self, k, s):
        if not self._canli(k):
            return False
        self.bitis[k] = self.saat() + s
        return True
    def zadd(self, k, eslesme):
        z = self.v.setdefault(k, {}) if self._canli(k) else self.v.setdefault(k, {})
        z.update(eslesme)
    def zremrangebyscore(self, k, mn, mx):
        z = self.v.get(k, {}) if self._canli(k) else {}
        for m in [m for m, p in z.items() if mn <= p <= mx]:
            del z[m]
    def zcard(self, k):
        return len(self.v[k]) if self._canli(k) else 0
'''

body = '<h2>Neden önemli?</h2>\n<p>Lezzet Kurye\'nin uygulamasında restoran menüsü saniyede yüzlerce kez okunur ama günde birkaç kez değişir; her okumada veritabanına gitmek gereksiz yüktür. Sipariş verildiğinde müşteriye SMS, restorana bildirim, kuryeye atama gider; bunları HTTP isteğinin içinde yapmak yanıtı saniyelerce geciktirir ve SMS sağlayıcısı çökünce sipariş de çöker. Bir müşteri dakikada 200 istek atınca diğerlerini etkilememelidir. Bu üç sorunun ortak aracı <b>Redis</b>\'tir: bellek içi, çok hızlı bir anahtar-değer veri yapısı sunucusu. Önbellek (cache), hız sınırlayıcı, oturum deposu, dağıtık kilit ve görev kuyruğu aracısı (broker) olarak kullanılır.</p>\n<div class="warn"><b>Redis ve Celery tarayıcıda çalışmaz</b>Redis bir sunucudur; <code>redis</code>, <code>celery</code> ve <code>rq</code> kodları <code>pre</code> kutularında gösterimdir. Çalıştırılabilir kutular ve alıştırmalar, sözlük + TTL\'den oluşan bir <code>FakeRedis</code> ve <code>asyncio</code> işçi havuzu ile aynı mantığı kurar. Saat dışarıdan verildiği (enjekte edildiği) için TTL davranışını beklemeden, deterministik olarak test edebilirsin.</div>\n\n<h2>Redis veri türleri</h2>\n<div class="tbl-wrap"><table>\n<tr><th>Tür</th><th>Temel komutlar</th><th>Lezzet Kurye\'de kullanım</th></tr>\n<tr><td>String</td><td><code>SET k v EX 300</code>, <code>GET</code>, <code>INCR</code>, <code>SET k v NX PX 30000</code></td><td>Önbelleğe alınmış menü JSON\'u, sayaçlar, kilit</td></tr>\n<tr><td>Hash</td><td><code>HSET oturum:abc kullanici 870 sepet 3</code>, <code>HGETALL</code></td><td>Oturum verisi, kurye son konumu</td></tr>\n<tr><td>List</td><td><code>LPUSH</code>, <code>BRPOP</code>, <code>LRANGE</code></td><td>Basit iş kuyruğu (RQ bunu kullanır), son 10 sipariş</td></tr>\n<tr><td>Set</td><td><code>SADD</code>, <code>SISMEMBER</code>, <code>SINTER</code></td><td>Bugün sipariş veren tekil müşteriler, iptal listesi</td></tr>\n<tr><td>Sorted set</td><td><code>ZADD</code>, <code>ZINCRBY</code>, <code>ZREVRANGE ... WITHSCORES</code>, <code>ZREMRANGEBYSCORE</code></td><td>Kurye liderlik tablosu, kayan pencere hız sınırı</td></tr>\n<tr><td>Stream</td><td><code>XADD</code>, <code>XREADGROUP</code>, <code>XACK</code></td><td>Kalıcı olay akışı, tüketici grupları</td></tr>\n</table></div>\n' + code(r'''
# docker run -d -p 6379:6379 redis:7     ;     pip install redis
import json, redis

r = redis.Redis(host="localhost", port=6379, decode_responses=True)
r.set("menu:5", json.dumps([{"ad": "İskender", "fiyat": 295}]), ex=300)   # 5 dk TTL
print(r.get("menu:5"), r.ttl("menu:5"))
r.hset("kurye:47", mapping={"enlem": 41.01, "boylam": 29.03, "durum": "yolda"})
r.zincrby("lider:2024-10", 1, "kurye:47")
print(r.zrevrange("lider:2024-10", 0, 2, withscores=True))
''') + '\n<div class="note"><b>Kendi bilgisayarında dene</b>Docker kuruluysa <code>docker run -d -p 6379:6379 redis:7</code> ile sunucuyu başlat, <code>pip install redis</code> ile istemciyi kur. Docker yoksa Windows\'ta WSL, macOS\'ta <code>brew install redis</code> kullanabilirsin. <code>redis-cli monitor</code> gelen her komutu canlı gösterir.</div>\n<p>Redis tek iş parçacıklı bir olay döngüsüyle komutları sırayla işler; bu yüzden <code>INCR</code> gibi tekil komutlar atomiktir. Ama "oku, Python\'da karar ver, yaz" dizisi atomik <b>değildir</b>; araya başka istemci girebilir. Bunun için ya tek komut (<code>SET NX</code>, <code>INCR</code>), ya <code>MULTI/EXEC</code> işlemi, ya da sunucuda çalışan Lua betiği kullanılır.</p>\n\n<h2>FakeRedis: sözlük + TTL + enjekte edilen saat</h2>\n<p>Gerçek Redis\'in temel sözleşmesini küçük bir sınıfla taklit edelim. Her anahtarın bir bitiş anı olabilir; süresi dolan anahtar okunduğunda silinir (Redis de bunu "tembel silme" ve arka plan örneklemesiyle yapar). Saat bir fonksiyon olarak verilir: testte <code>saat.ilerle(301)</code> demek, 5 dakika beklemekle aynıdır.</p>\n' + py(r'''
class Saat:
    def __init__(self, t=0.0):
        self.t = t
    def __call__(self):
        return self.t
    def ilerle(self, s):
        self.t += s

class MiniRedis:
    def __init__(self, saat):
        self.saat, self.v, self.bitis = saat, {}, {}
    def _canli(self, k):
        if k in self.bitis and self.saat() >= self.bitis[k]:
            del self.v[k], self.bitis[k]
        return k in self.v
    def set(self, k, deger, ex=None):
        self.v[k] = deger
        self.bitis.pop(k, None)
        if ex is not None:
            self.bitis[k] = self.saat() + ex
    def get(self, k):
        return self.v[k] if self._canli(k) else None
    def ttl(self, k):
        if not self._canli(k):
            return -2
        return -1 if k not in self.bitis else int(self.bitis[k] - self.saat())

saat = Saat()
r = MiniRedis(saat)
r.set("menu:5", "[...]", ex=300)
r.set("ayar:komisyon", "18")
print(r.get("menu:5"), r.ttl("menu:5"), r.ttl("ayar:komisyon"), r.ttl("yok"))
saat.ilerle(300)
print(r.get("menu:5"), r.ttl("menu:5"))
''') + '\n\n<h2>Önbellek desenleri</h2>\n<div class="tbl-wrap"><table>\n<tr><th>Desen</th><th>Okuma</th><th>Yazma</th><th>Artı / eksi</th></tr>\n<tr><td>Cache-aside (lazy loading)</td><td>Önce önbellek; yoksa veritabanı, sonra önbelleğe yaz</td><td>Veritabanına yaz, önbellekteki anahtarı <b>sil</b></td><td>En yaygın; ilk okuma yavaş, kısa süre bayat veri olabilir</td></tr>\n<tr><td>Write-through</td><td>Önbellekten</td><td>Veritabanına ve önbelleğe birlikte yaz</td><td>Önbellek hep güncel; hiç okunmayan veri de önbelleğe girer</td></tr>\n<tr><td>Write-behind</td><td>Önbellekten</td><td>Önbelleğe yaz, veritabanına sonra toplu yaz</td><td>Çok hızlı yazma; çökmede veri kaybı riski</td></tr>\n</table></div>\n<p>Geçersizleştirme (invalidation) için iki araç birlikte kullanılır: veri değişince anahtarı silmek ve her anahtara TTL vermek (silmeyi unuttuğun yol için emniyet ağı). TTL\'lere küçük rastgele bir pay (jitter) eklemek, aynı anda doldurulan binlerce anahtarın aynı anda düşmesini önler.</p>\n' + py(r'''
import json
import veri

con = veri.baglan("lezzet_kurye", tablolar=["lk_menu_items"])
r = MiniRedis(saat)
db_sorgu = 0

def menu_getir(restoran_id):
    global db_sorgu
    anahtar = f"menu:{restoran_id}"
    onbellek = r.get(anahtar)
    if onbellek is not None:
        return json.loads(onbellek)                     # isabet (hit)
    db_sorgu += 1                                       # ıskalama (miss)
    satirlar = con.execute("SELECT name, price FROM lk_menu_items WHERE restaurant_id = ? ORDER BY item_id",
                           (restoran_id,)).fetchall()
    r.set(anahtar, json.dumps(satirlar), ex=300)
    return satirlar

def fiyat_guncelle(item_id, fiyat, restoran_id):
    con.execute("UPDATE lk_menu_items SET price = ? WHERE item_id = ?", (fiyat, item_id))
    r.v.pop(f"menu:{restoran_id}", None)                # DEL: bir sonraki okuma tazeler

for _ in range(1000):
    menu = menu_getir(5)
print("1000 okuma, veritabanı sorgusu:", db_sorgu, "| İskender:", menu[2])
fiyat_guncelle(26, 310.0, 5)
print("güncelleme sonrası:", menu_getir(5)[2], "| sorgu:", db_sorgu)
''') + '\n<h3>Cache stampede (önbellek hücumu)</h3>\n<p>Çok okunan bir anahtarın süresi dolduğu anda yüzlerce istek aynı anda ıskalar ve hepsi veritabanına gider; veritabanı yavaşlar, yavaşladıkça daha çok istek birikir. Çözümler: <b>tek uçuş</b> (single-flight; anahtar başına yalnız bir yükleyici, diğerleri onun sonucunu bekler; dağıtık ortamda kısa bir Redis kilidiyle), <b>erken tazeleme</b> (TTL bitmeden, olasılıksal olarak bir isteğin yenilemesi) ve bayat veriyi kısa süre sunmak (stale-while-revalidate).</p>\n\n<h2>Hız sınırlama: token bucket ve kayan pencere</h2>\n<div class="tbl-wrap"><table>\n<tr><th>Algoritma</th><th>Redis ile</th><th>Özelliği</th></tr>\n<tr><td>Sabit pencere</td><td><code>INCR oran:870:2024-10-01T11:07</code> + <code>EXPIRE 60</code></td><td>Basit; pencere sınırında iki kat patlamaya izin verir</td></tr>\n<tr><td>Kayan pencere (log)</td><td>Sorted set: <code>ZREMRANGEBYSCORE</code> eskiler, <code>ZCARD</code>, <code>ZADD</code></td><td>Kesin; her istek için bir kayıt (bellek)</td></tr>\n<tr><td>Token bucket</td><td>Hash: jeton sayısı + son dolum anı (Lua ile atomik)</td><td>Kısa patlamalara izin verir, ortalama hızı korur</td></tr>\n</table></div>\n<p>Token bucket\'ta kova <code>kapasite</code> kadar jeton alır ve saniyede <code>hiz</code> jeton dolar. Her istek bir jeton harcar; jeton yoksa istek 429 alır. Durum yalnız iki sayıdır; dolum, istek geldiğinde geçen süreyle hesaplanır.</p>\n' + py(r'''
def token_bucket(durum, simdi, kapasite=5, hiz=1.0):
    jeton, son = durum.get("jeton", kapasite), durum.get("son", simdi)
    jeton = min(kapasite, jeton + (simdi - son) * hiz)    # geçen süre kadar doldur
    izin = jeton >= 1
    durum.update(jeton=jeton - 1 if izin else jeton, son=simdi)
    return izin

durum = {}
zamanlar = [0, 0, 0, 0, 0, 0, 0, 0.5, 1.0, 3.0]
print([token_bucket(durum, t) for t in zamanlar])
''') + '\n<p>İlk 5 istek kovayı boşaltır, 6. ve 7. reddedilir; 1. saniyede bir jeton dolduğu için izin çıkar, 3. saniyede ise iki jeton birikmiştir. Redis\'te bu hesap birden çok sunucu arasında paylaşılır ve yarışı önlemek için Lua betiği olarak tek adımda çalıştırılır.</p>\n\n<h2>Dağıtık kilit ve oturum deposu</h2>\n<p>"Bu siparişe aynı anda iki kurye atanmasın" gibi durumlarda birden çok sunucu arasında kilit gerekir. Doğru desen: <code>SET kilit:siparis:42 &lt;rastgele_token&gt; NX PX 30000</code>. <code>NX</code> anahtar yoksa yazar (kilidi alan tek istemci olur), <code>PX</code> süre verir (süreç çökerse kilit sonsuza kalmaz), token ise bırakırken "bu kilit hâlâ benim mi?" kontrolü içindir; bırakma bu yüzden karşılaştır-ve-sil yapan bir Lua betiğiyle yapılır.</p>\n<div class="warn"><b>Kilidin tuzakları</b>İşin kilit süresinden uzun sürerse kilit düşer ve ikinci süreç de girer; token kontrolü olmadan birinci süreç, ikincinin kilidini silebilir. Çöp toplama duraklaması ya da ağ gecikmesi bunu tetikleyebilir. Kritik yazmalarda veritabanı tarafında da korunma gerekir: artan bir "fencing token" ya da <code>UPDATE ... WHERE kurye_id IS NULL</code> gibi koşullu yazma. Kilit bir verimlilik aracıdır; doğruluk garantisini tek başına verme.</div>\n<p>Oturum deposu olarak Redis, oturum kimliğini anahtar, kullanıcı verisini hash olarak tutar ve her istekte <code>EXPIRE</code> ile süreyi uzatır (kayan oturum süresi). Django\'da <code>SESSION_ENGINE = "django.contrib.sessions.backends.cache"</code> ve Redis önbellek ayarı bunu yapar; birden çok uygulama sunucusu aynı oturumları görür.</p>\n\n<h2>Görev kuyrukları: üretici, aracı, işçi</h2>\n<p>Web isteği (üretici) "SMS gönder" işini bir mesaj olarak aracıya (broker: Redis ya da RabbitMQ) bırakır ve hemen 201 döner. Ayrı süreçlerde çalışan işçiler (worker) kuyruktan mesaj alıp işi yapar. Sonucu saklamak gerekiyorsa sonuç deposu (result backend) kullanılır. Periyodik işler (her gece rapor) bir zamanlayıcı (Celery beat) tarafından kuyruğa atılır; Flower ise işçileri ve görevleri izleyen web arayüzüdür.</p>\n' + code(r'''
# pip install "celery[redis]"      ->   celery -A gorevler worker -l info     /     celery -A gorevler beat
from celery import Celery
from celery.schedules import crontab

app = Celery("lezzet", broker="redis://localhost:6379/0", backend="redis://localhost:6379/1")
app.conf.task_acks_late = True              # iş BİTİNCE onayla; işçi çökerse mesaj geri döner
app.conf.worker_prefetch_multiplier = 1

@app.task(bind=True, autoretry_for=(ConnectionError,), retry_backoff=2, retry_backoff_max=300,
          retry_jitter=True, max_retries=5)
def sms_gonder(self, siparis_id):
    if Bildirim.objects.filter(siparis_id=siparis_id, tur="sms").exists():   # idempotent
        return "zaten gönderildi"
    saglayici.gonder(...)
    Bildirim.objects.create(siparis_id=siparis_id, tur="sms")

app.conf.beat_schedule = {
    "gece-raporu": {"task": "gorevler.gunluk_rapor", "schedule": crontab(hour=3, minute=0)},
}
# Django view içinde:  transaction.on_commit(lambda: sms_gonder.delay(siparis.id))
''') + '\n' + code(r'''
# RQ: daha sade bir alternatif   ->  pip install rq   ;   rq worker bildirim
from redis import Redis
from rq import Queue, Retry
q = Queue("bildirim", connection=Redis())
is_ = q.enqueue(sms_gonder, 42, retry=Retry(max=3, interval=[10, 30, 60]))
''') + '\n<p>Aynı model tarayıcıda <code>asyncio.Queue</code> ve sabit sayıda işçi göreviyle kurulabilir. Aşağıda üç işçi, Lezzet Kurye\'nin ilk 12 siparişi için bildirim kuyruğunu boşaltıyor.</p>\n' + py(r'''
import asyncio
import veri

siparisler = veri.kayitlar("lezzet_kurye", "lk_orders")[:12]

async def isci(ad, kuyruk, kayit):
    while True:
        s = await kuyruk.get()
        try:
            await asyncio.sleep(0.001)                  # SMS servisine gidiyormuş gibi
            kayit.append((ad, s["order_id"], s["status"]))
        finally:
            kuyruk.task_done()

async def main():
    kuyruk, kayit = asyncio.Queue(), []
    for s in siparisler:
        kuyruk.put_nowait(s)                            # üretici
    iscilar = [asyncio.create_task(isci(f"i{n}", kuyruk, kayit)) for n in range(3)]
    await kuyruk.join()                                 # tüm işler bitene kadar bekle
    for t in iscilar:
        t.cancel()
    await asyncio.gather(*iscilar, return_exceptions=True)
    return kayit

kayit = asyncio.run(main())
print(len(kayit), "bildirim;", sorted({ad for ad, _, _ in kayit}))
''') + '\n\n<h2>Yeniden deneme, idempotentlik ve ölü mektup kuyruğu</h2>\n<p>Kuyruk sistemleri genelde "en az bir kez" (at-least-once) teslim eder: işçi işi bitirip onay göndermeden çökerse mesaj başka işçiye tekrar verilir. Bu yüzden görevler <b>idempotent</b> olmalıdır: iki kez çalışması bir kez çalışmasıyla aynı sonucu vermeli (aynı müşteriye iki SMS, iki kez iade olmamalı). Yöntem: bir idempotency anahtarı (<code>siparis:42:sms</code>) ile işi önce <code>SET NX</code> ya da benzersiz kısıtlı bir tabloyla "kaydet", sonra yap.</p>\n<p>Geçici hatalar (zaman aşımı, 503) <b>üstel geri çekilme</b> (exponential backoff) ile yeniden denenir: <code>bekleme = min(tavan, taban × 2^deneme)</code>. Tüm işçilerin aynı anda yeniden denemesini önlemek için <b>jitter</b> eklenir (tam jitter: <code>random.uniform(0, bekleme)</code>). Kalıcı hatalar (geçersiz telefon) ya da deneme hakkı biten işler <b>ölü mektup kuyruğuna</b> (dead letter queue, DLQ) gider; orada bir insan inceler, düzeltir ve gerekirse yeniden kuyruğa atar.</p>\n' + py(r'''
import random

def bekleme_plani(deneme_sayisi, taban=1, tavan=60, jitter=False, rng=random.Random(7)):
    plan = []
    for n in range(deneme_sayisi):
        b = min(tavan, taban * 2 ** n)
        plan.append(round(rng.uniform(0, b), 2) if jitter else b)
    return plan

print("üstel      :", bekleme_plani(8))
print("tam jitter :", bekleme_plani(8, jitter=True))
''') + '\n\n<h2>Pub/sub ile basit bildirim</h2>\n<p><code>PUBLISH siparis:durum "42 yolda"</code> ile gönderilen mesaj, o anda <code>SUBSCRIBE</code> olmuş herkese iletilir; abone o an bağlı değilse mesaj <b>kaybolur</b> (at-most-once). Canlı panel güncellemesi, önbellek geçersizleştirme duyurusu gibi kaybı tolere edilen işler için uygundur. Kalıcılık ve yeniden okuma gerekiyorsa Redis Streams ya da Kafka kullan (akış işleme dersinde).</p>\n<div class="note"><b>Gerçek işte</b>Backend mülakatlarında "Redis\'i ne için kullandınız?" sorusunun iyi cevabı somut desenlerdir: cache-aside ve TTL stratejisi, geçersizleştirme, hız sınırı, idempotent Celery görevleri, acks_late ve DLQ. Üretimde sık görülen sorunlar da aynı yerden çıkar: TTL\'siz büyüyen anahtarlar ve bellek dolması, hücum (stampede), çift çalışan görevler, yeniden denemelerin dış servisi boğması.</div>\n\n<section class="deep"><span class="eyebrow">Uzmanlaş</span>\n<h3>Bellek ve kalıcılık</h3>\n<p>Redis bellek dolunca <code>maxmemory-policy</code>\'ye göre davranır: önbellek için <code>allkeys-lru</code> ya da <code>allkeys-lfu</code>, kuyruk ve kilit için <code>noeviction</code> (veri sessizce silinmesin). Kalıcılık için RDB anlık görüntüsü ve AOF günlüğü vardır; önbellek ile kuyruğu aynı Redis\'te tutmak bu ayarlar çeliştiği için önerilmez.</p>\n<h3>Outbox deseni</h3>\n<p>"Veritabanına yaz ve kuyruğa mesaj at" iki ayrı sistemdir; biri başarılı diğeri başarısız olabilir. Outbox deseninde mesaj aynı veritabanı transaction\'ında bir <code>outbox</code> tablosuna yazılır, ayrı bir süreç bu tabloyu okuyup kuyruğa iletir. Böylece "kayıt var ama bildirim hiç gitmedi" durumu olmaz.</p>\n<h3>Görünürlük zaman aşımı ve tüketici grupları</h3>\n<p>SQS ve Redis Streams, alınan mesajı onaylanana kadar başkalarına göstermez; süre dolarsa mesaj yeniden görünür olur ve teslim sayısı artar. Teslim sayısı eşiği aşan mesaj DLQ\'ya taşınır. Celery\'deki <code>acks_late</code> + <code>visibility_timeout</code> ayarı aynı fikirdir; görev süresinden kısa bir zaman aşımı, işin iki işçide birden çalışmasına yol açar.</p>\n</section>\n'

ex = []
ex.append({'t': 'mc', 'stage': 'Isınma',
  'q': 'Lezzet Kurye\'de ay boyunca en çok teslimat yapan ilk 10 kuryeyi canlı gösteren bir liderlik tablosu için en uygun Redis veri türü hangisi?',
  'o': ['String ve her kurye için ayrı bir INCR sayacı', 'Sorted set (ZINCRBY + ZREVRANGE)', 'List (her teslimatı LPUSH ile ekleyip sayarak)', 'Set (SADD ile teslimat yapan kuryeleri ekleyip)'],
  'a': 1,
  'why': 'Sorted set her üyeyi bir puanla tutar ve puana göre sıralı okumayı (ZREVRANGE 0 9) logaritmik maliyetle verir; ZINCRBY puanı atomik artırır. Ayrı string sayaçlarda sıralama için tüm anahtarları okuman gerekir; list ve set puan tutmaz.'})
ex.append({'t': 'mc', 'stage': 'Isınma',
  'q': 'Celery görevi <code>acks_late=True</code> ile çalışıyor ve işçiler arada çöküyor. Görevi yazarken en önemli özellik hangisi olmalı?',
  'o': ['Görev olabildiğince hızlı bitmeli ki çökme penceresi daralsın', 'Görev idempotent olmalı', 'Görev hiçbir koşulda istisna fırlatmamalı, hataları yutmalı', 'Görev sonucu mutlaka sonuç deposuna (backend) yazılmalı'],
  'a': 1,
  'why': 'acks_late ile mesaj iş bitince onaylanır; işçi onaydan önce çökerse mesaj başka işçiye tekrar teslim edilir (en az bir kez teslim). Görev idempotent değilse müşteri iki SMS alır ya da iki kez iade yapılır. Hız ve sonuç deposu bu sorunu çözmez; istisna fırlatmak ise yeniden deneme için gereklidir.'})
ex.append({'t': 'mc', 'stage': 'Isınma',
  'q': 'Kurye paneli sipariş durumlarını Redis pub/sub ile alıyor. Panel 2 dakika bağlantısız kaldıktan sonra o aralıkta yayınlanan mesajlara ne olur?',
  'o': ['Redis onları kanal başına saklar ve panel bağlanınca sırayla iletir', 'Kaybolur; o an bağlı olmayan aboneye teslim edilmez', 'PUBLISH komutu yayıncıya hata olarak geri döner', 'Mesajlar kanala abone olan bir sonraki istemciye aktarılır'],
  'a': 1,
  'why': 'Redis pub/sub "ateşle ve unut" modelidir (at-most-once): mesaj yalnız o anda bağlı abonelere gider, hiçbir yerde saklanmaz. Kaçırılmaması gereken olaylar için Redis Streams (XADD/XREADGROUP) ya da kalıcı bir kuyruk kullanılır.'})
ex.append({'t': 'predict', 'stage': 'Kodu oku',
  'q': 'Enjekte edilen saatle TTL: bu kod ne yazdırır?',
  'code': FR + '\nsaat = Saat()\nr = FakeRedis(saat)\nr.set("menu:5", "A", ex=300)\nsaat.ilerle(200)\nr.expire("menu:5", 300)\nsaat.ilerle(200)\nprint(r.get("menu:5"))\nr.set("menu:5", "B")\nsaat.ilerle(10_000)\nprint(r.get("menu:5"), r.set("menu:5", "C", nx=True))\n',
  'o': ['A\nB False', 'None\nB False', 'A\nNone True', 'None\nNone True'],
  'a': 0,
  'why': 'expire 200. saniyede süreyi yeniden 300 sn yapar (bitiş 500); 400. saniyede değer hâlâ canlıdır: A. Ardından ex vermeden set, TTL\'yi kaldırır (Redis\'te de SET varsayılan olarak TTL\'yi sıfırlar); B süresizdir. nx=True anahtar varken yazmaz ve False döner.'})
ex.append({'t': 'predict', 'stage': 'Kodu oku',
  'q': 'Üstel geri çekilme planı: bu kod ne yazdırır?',
  'code': 'def plan(n, taban, tavan):\n    return [min(tavan, taban * 2 ** i) for i in range(n)]\n\nprint(plan(6, 2, 30))\nprint(sum(plan(6, 2, 30)))\n',
  'o': ['[2, 4, 8, 16, 32, 64]\n126', '[2, 4, 8, 16, 30, 30]\n90', '[1, 2, 4, 8, 16, 30]\n61', '[2, 4, 8, 16, 30, 60]\n120'],
  'a': 1,
  'why': 'taban × 2^i dizisi 2, 4, 8, 16, 32, 64 olur ama tavan 30\'da kesilir: 2, 4, 8, 16, 30, 30. Toplam bekleme 90 saniye. Tavan, beklemenin sonsuz büyümesini, jitter ise tüm istemcilerin aynı anlarda yeniden denemesini önler.'})
ex.append({'t': 'predict', 'stage': 'Kodu oku',
  'q': 'Cache-aside isabet oranı: bu kod ne yazdırır?',
  'code': 'onbellek, db = {}, 0\n\ndef getir(k):\n    global db\n    if k in onbellek:\n        return onbellek[k]\n    db += 1\n    onbellek[k] = k * 10\n    return onbellek[k]\n\nfor k in [5, 5, 7, 5, 7, 9]:\n    getir(k)\nonbellek.pop(5)\ngetir(5)\nprint(db, len(onbellek))\n',
  'o': ['3 3', '4 3', '4 2', '7 3'],
  'a': 1,
  'why': 'İlk geçişte 5, 7 ve 9 birer kez ıskalar (3 veritabanı çağrısı), diğer okumalar isabettir. 5 silinince (geçersizleştirme) bir sonraki okuma yine veritabanına gider: toplam 4. Önbellekte 5, 7 ve 9 vardır: 3 anahtar.'})
ex.append({'t': 'order', 'stage': 'Kodu oku',
  'q': '<p>Token bucket\'ın bir isteği değerlendiren adımlarını sırala: geçen süre kadar doldur, kapasiteyle sınırla, jeton varsa harca.</p>',
  'lines': ['kapasite, hiz = 3, 0.5', 'jeton, son = 0.0, 10.0', 'simdi = 14.0', 'jeton = min(kapasite, jeton + (simdi - son) * hiz)', 'son = simdi', 'izin = jeton >= 1', 'jeton = jeton - 1 if izin else jeton', 'print(izin, jeton)'],
  'expect': 'True 1.0\n',
  'hint': 'Önce sabitler ve durum, sonra dolum; izin kararı dolumdan sonra, harcama karardan sonra.',
  'why': '4 saniyede 0.5 hızla 2 jeton dolar (kapasite 3\'ü aşmaz). Jeton 1\'den büyük olduğu için istek geçer ve kalan 1.0 olur. Dolumu karardan önce yapmazsan kova hep boş görünür.'})

ex.append({'id': 'redis-kuyruk-1', 't': 'code', 'stage': 'Rehberli', 'diff': 1,
  'q': '<p>Sahte bir Redis yaz: <code>FakeRedis(saat)</code>. <code>saat()</code> şimdiki zamanı saniye olarak döndüren bir fonksiyondur (hazır <code>Saat</code> sınıfı). Metotlar:</p><ul><li><code>set(k, v, ex=None)</code>: değeri yazar; <code>ex</code> verilirse <code>ex</code> saniye sonra süresi dolar, verilmezse eski TTL kalkar.</li><li><code>get(k)</code>: değer ya da (yoksa / süresi dolmuşsa) <code>None</code>. Süre <code>simdi &gt;= bitis</code> anında dolar.</li><li><code>ttl(k)</code>: kalan tam saniye (<code>int</code>); anahtar yoksa <code>-2</code>, TTL\'siz ise <code>-1</code>.</li><li><code>incr(k)</code>: değeri 1 artırıp döndürür (yoksa 0\'dan başlar); mevcut TTL\'ye dokunmaz.</li><li><code>delete(k)</code>: silinen anahtar sayısını (0/1) döndürür.</li></ul>',
  'guide': ['İki sözlük tut: değerler ve bitiş anları.', '_canli(k) yardımcı metodu yaz: bitiş geçmişse anahtarı iki sözlükten de sil; sonra k in degerler döndür.', 'Diğer tüm metotlar önce _canli ile kontrol etsin.', 'set\'te ex yoksa bitiş kaydını sil (pop).'],
  'example': 'bitis = {"a": 10}\nsimdi = 12\nif "a" in bitis and simdi >= bitis["a"]:\n    del bitis["a"]\nprint(bitis)\n',
  'start': 'class Saat:\n    def __init__(self, t=0.0):\n        self.t = t\n    def __call__(self):\n        return self.t\n    def ilerle(self, s):\n        self.t += s\n\nclass FakeRedis:\n    def __init__(self, saat):\n        self.saat = saat\n        self.deger = {}\n        self.bitis = {}\n\n    def _canli(self, k):\n        # TODO: süresi dolduysa sil; canlı mı döndür\n        return k in self.deger\n\n    def set(self, k, v, ex=None):\n        self.deger[k] = v\n        # TODO: TTL\n\n    def get(self, k):\n        return self.deger.get(k)\n\n    # TODO: ttl, incr, delete\n',
  'sol': 'class Saat:\n    def __init__(self, t=0.0):\n        self.t = t\n    def __call__(self):\n        return self.t\n    def ilerle(self, s):\n        self.t += s\n\nclass FakeRedis:\n    def __init__(self, saat):\n        self.saat = saat\n        self.deger = {}\n        self.bitis = {}\n\n    def _canli(self, k):\n        b = self.bitis.get(k)\n        if b is not None and self.saat() >= b:\n            self.deger.pop(k, None)\n            self.bitis.pop(k, None)\n        return k in self.deger\n\n    def set(self, k, v, ex=None):\n        self.deger[k] = v\n        self.bitis.pop(k, None)\n        if ex is not None:\n            self.bitis[k] = self.saat() + ex\n\n    def get(self, k):\n        return self.deger[k] if self._canli(k) else None\n\n    def ttl(self, k):\n        if not self._canli(k):\n            return -2\n        if k not in self.bitis:\n            return -1\n        return int(self.bitis[k] - self.saat())\n\n    def incr(self, k):\n        yeni = int(self.get(k) or 0) + 1\n        self.deger[k] = yeni\n        return yeni\n\n    def delete(self, k):\n        var = self._canli(k)\n        self.deger.pop(k, None)\n        self.bitis.pop(k, None)\n        return 1 if var else 0\n',
  'tests': 's = Saat()\nr = FakeRedis(s)\nr.set("menu:5", "[...]", ex=300)\nassert r.get("menu:5") == "[...]" and r.ttl("menu:5") == 300, "yeni anahtarın TTL\'si 300"\ns.ilerle(299.5)\nassert r.get("menu:5") == "[...]" and r.ttl("menu:5") == 0, "299.5. saniyede hâlâ canlı, kalan int(0.5) = 0"\ns.ilerle(0.5)\nassert r.get("menu:5") is None and r.ttl("menu:5") == -2, "simdi >= bitis anında süre dolmalı"\nr.set("a", 1, ex=10)\nr.set("a", 2)\ns.ilerle(100)\nassert r.get("a") == 2 and r.ttl("a") == -1, "ex\'siz set eski TTL\'yi kaldırmalı"\nassert r.incr("sayac") == 1 and r.incr("sayac") == 2, "incr 0\'dan başlar"\nr.set("dk", 5, ex=60)\nassert r.incr("dk") == 6 and r.ttl("dk") == 60, "incr TTL\'ye dokunmamalı"\ns.ilerle(60)\nassert r.incr("dk") == 1, "süresi dolan sayaç yeniden 1\'den başlar"\nassert r.delete("a") == 1 and r.delete("a") == 0, "delete silinen sayıyı döndürür"\nassert r.ttl("yok") == -2, "olmayan anahtar -2"\n',
  'hints': ['Süre kontrolünü tek yere (_canli) koy; get, ttl, incr, delete hepsi onu çağırsın.', 'Redis gibi: SET ex olmadan TTL\'yi siler, INCR TTL\'yi korur.', 'ttl: return int(self.bitis[k] - self.saat())'],
  'why': 'Redis süresi dolan anahtarları okunduklarında siler (tembel silme) ve arka planda örnekleyerek temizler. Saati fonksiyon olarak enjekte etmek, 5 dakikalık TTL\'yi beklemeden test etmeni sağlar; bu, zamana bağlı her kodda (token süresi, önbellek, hız sınırı) uygulanacak bir tasarım alışkanlığıdır.'})

ex.append({'id': 'redis-kuyruk-2', 't': 'code', 'stage': 'Rehberli', 'diff': 2,
  'q': '<p>Sorted set ile kurye liderlik tablosu. Hazır <code>Zset</code> sınıfına iki metot ekle: <code>zincrby(uye, miktar)</code> üyenin puanını artırıp yeni puanı döndürsün (yoksa 0\'dan); <code>zrevrange(bas, son, withscores=False)</code> puana göre <b>azalan</b> sıralayıp <code>bas</code>..<code>son</code> (dahil, Redis gibi <code>-1</code> son eleman) aralığını döndürsün; eşit puanda üye adı artan sırada. <code>withscores=True</code> ise <code>(uye, puan)</code> demetleri. Sonra <code>liderlik(siparisler, ay)</code> yaz: <code>veri.kayitlar("lezzet_kurye", "lk_orders")</code>\'dan <code>status == "teslim"</code> ve <code>placed_at</code> verilen ayla (<code>"2024-10"</code>) başlayan siparişler için <code>"kurye:&lt;id&gt;"</code> üyesini 1 artırsın ve ilk 3\'ü puanlarıyla döndürsün.</p>',
  'guide': ['zincrby: self.puan[uye] = self.puan.get(uye, 0) + miktar.', 'zrevrange: sorted(self.puan.items(), key=lambda x: (-x[1], x[0])).', 'son == -1 ise son = len - 1; sonra dilim [bas:son + 1].', 'liderlik: siparişleri gez, koşulu sağlayanlarda zincrby, sonunda zrevrange(0, 2, withscores=True).'],
  'example': 'puan = {"b": 3, "a": 3, "c": 5}\nprint(sorted(puan.items(), key=lambda x: (-x[1], x[0])))\n',
  'start': 'import veri\n\nclass Zset:\n    def __init__(self):\n        self.puan = {}\n\n    def zincrby(self, uye, miktar):\n        # TODO\n        pass\n\n    def zrevrange(self, bas, son, withscores=False):\n        # TODO\n        pass\n\ndef liderlik(siparisler, ay):\n    z = Zset()\n    # TODO\n    return z.zrevrange(0, 2, withscores=True)\n\nsiparisler = veri.kayitlar("lezzet_kurye", "lk_orders")\nprint(liderlik(siparisler, "2024-10"))\n',
  'sol': 'import veri\n\nclass Zset:\n    def __init__(self):\n        self.puan = {}\n\n    def zincrby(self, uye, miktar):\n        self.puan[uye] = self.puan.get(uye, 0) + miktar\n        return self.puan[uye]\n\n    def zrevrange(self, bas, son, withscores=False):\n        sirali = sorted(self.puan.items(), key=lambda x: (-x[1], x[0]))\n        if son < 0:\n            son = len(sirali) + son\n        dilim = sirali[bas:son + 1]\n        return dilim if withscores else [u for u, _ in dilim]\n\ndef liderlik(siparisler, ay):\n    z = Zset()\n    for s in siparisler:\n        if s["status"] == "teslim" and s["placed_at"].startswith(ay) and s["courier_id"] is not None:\n            z.zincrby(f"kurye:{s[\'courier_id\']}", 1)\n    return z.zrevrange(0, 2, withscores=True)\n\nsiparisler = veri.kayitlar("lezzet_kurye", "lk_orders")\nprint(liderlik(siparisler, "2024-10"))\n',
  'tests': 'z = Zset()\nassert z.zincrby("kurye:1", 2) == 2 and z.zincrby("kurye:1", 1) == 3, "zincrby yeni puanı döndürmeli"\nz.zincrby("kurye:2", 5); z.zincrby("kurye:0", 3)\nassert z.zrevrange(0, -1) == ["kurye:2", "kurye:0", "kurye:1"], "azalan puan, eşitlikte ad artan"\nassert z.zrevrange(0, 0, withscores=True) == [("kurye:2", 5)], "withscores demet döndürmeli"\nassert z.zrevrange(1, -1) == ["kurye:0", "kurye:1"], "-1 son elemanı gösterir"\n_s = veri.kayitlar("lezzet_kurye", "lk_orders")\nassert liderlik(_s, "2024-10") == [("kurye:47", 60), ("kurye:55", 53), ("kurye:26", 48)], f"Ekim 2024 liderleri beklenenden farklı: {liderlik(_s, \'2024-10\')}"\nassert sum(p for _, p in liderlik(_s, "2024-10")) == 161, "ilk üçün toplamı 161"\n',
  'hints': ['Sıralama anahtarı (-puan, uye): eksi işareti azalan, ikinci alan eşitlik bozucu.', 'Redis aralıkları her iki uçta dahildir: dilimde son + 1 kullan.', 'Teslim edilmemiş (iptal/iade) siparişleri ve courier_id\'si None olanları sayma.'],
  'why': 'ZINCRBY ve ZREVRANGE ile liderlik tablosu her teslimatta O(log N) güncellenir ve tek komutla okunur; veritabanında her sayfa açılışında GROUP BY + ORDER BY çalıştırmaktan çok ucuzdur. Ay adını anahtara koymak (lider:2024-10) ve eski aylara TTL vermek tabloyu dönemlere böler.'})

ex.append({'id': 'redis-kuyruk-3', 't': 'code', 'stage': 'Rehberli', 'diff': 2, 'needs': ['sqlite3'],
  'q': '<p>Lezzet Kurye menüsü için cache-aside yaz. <code>MenuServisi(r, con)</code>: <code>r</code> hazır <code>FakeRedis</code>, <code>con</code> <code>veri.baglan("lezzet_kurye", tablolar=["lk_menu_items"])</code>. <code>self.db_sorgu</code> veritabanına giden sorgu sayısını tutsun.</p><ul><li><code>menu(restoran_id)</code>: önce <code>menu:&lt;id&gt;</code> anahtarına bak (değer JSON metni); yoksa <code>(item_id, name, price)</code> listesini <code>item_id</code> sırasıyla oku, JSON olarak 300 sn TTL ile yaz ve <b>liste listesi</b> döndür (JSON demeti listeye çevirir; isabet ve ıskalamada aynı tip dönsün).</li><li><code>fiyat_guncelle(item_id, fiyat)</code>: veritabanını güncelle ve ürünün restoranının önbellek anahtarını sil.</li></ul>',
  'guide': ['Anahtar: f"menu:{restoran_id}".', 'r.get ile bak; None değilse json.loads ile döndür.', 'Değilse sorgu sayısını artır, satırları oku, [list(s) for s in satirlar] yap, json.dumps ile ex=300 yaz.', 'fiyat_guncelle: önce item\'ın restaurant_id\'sini bul, UPDATE yap, r.delete ile anahtarı sil.'],
  'example': 'import json\nham = [(24, "Dürüm", 140.0)]\nmetin = json.dumps(ham)\nprint(metin, json.loads(metin))\n',
  'start': FR + '\nimport json\nimport veri\n\nclass MenuServisi:\n    def __init__(self, r, con):\n        self.r, self.con, self.db_sorgu = r, con, 0\n\n    def menu(self, restoran_id):\n        # TODO: önbellek -> yoksa veritabanı + önbelleğe yaz\n        self.db_sorgu += 1\n        return [list(s) for s in self.con.execute("SELECT item_id, name, price FROM lk_menu_items WHERE restaurant_id = ? ORDER BY item_id", (restoran_id,))]\n\n    def fiyat_guncelle(self, item_id, fiyat):\n        # TODO: güncelle + geçersizleştir\n        pass\n',
  'sol': FR + '\nimport json\nimport veri\n\nclass MenuServisi:\n    def __init__(self, r, con):\n        self.r, self.con, self.db_sorgu = r, con, 0\n\n    def menu(self, restoran_id):\n        anahtar = f"menu:{restoran_id}"\n        onbellek = self.r.get(anahtar)\n        if onbellek is not None:\n            return json.loads(onbellek)\n        self.db_sorgu += 1\n        satirlar = [list(s) for s in self.con.execute(\n            "SELECT item_id, name, price FROM lk_menu_items WHERE restaurant_id = ? ORDER BY item_id", (restoran_id,))]\n        self.r.set(anahtar, json.dumps(satirlar), ex=300)\n        return satirlar\n\n    def fiyat_guncelle(self, item_id, fiyat):\n        (rid,) = self.con.execute("SELECT restaurant_id FROM lk_menu_items WHERE item_id = ?", (item_id,)).fetchone()\n        self.con.execute("UPDATE lk_menu_items SET price = ? WHERE item_id = ?", (fiyat, item_id))\n        self.r.delete(f"menu:{rid}")\n',
  'tests': 's = Saat()\nm = MenuServisi(FakeRedis(s), veri.baglan("lezzet_kurye", tablolar=["lk_menu_items"]))\nilk = m.menu(5)\nassert ilk[2] == [26, "İskender", 295.0], f"Sultan Döner menüsünün 3. ürünü İskender olmalı: {ilk[2]}"\nfor _ in range(50):\n    assert m.menu(5) == ilk, "isabet ve ıskalamada aynı veri (liste listesi) dönmeli"\nassert m.db_sorgu == 1, f"51 okumada 1 veritabanı sorgusu bekleniyordu, {m.db_sorgu} oldu"\nm.menu(6)\nassert m.db_sorgu == 2, "her restoranın kendi anahtarı olmalı"\nm.fiyat_guncelle(26, 310.0)\nassert m.menu(5)[2] == [26, "İskender", 310.0] and m.db_sorgu == 3, "güncelleme anahtarı silmeli; sonraki okuma taze veri getirmeli"\nm.menu(6)\nassert m.db_sorgu == 3, "başka restoranın önbelleği silinmemeli"\ns.ilerle(300)\nm.menu(6)\nassert m.db_sorgu == 4, "TTL dolunca yeniden yüklenmeli"\n',
  'hints': ['Isabet yolunda json.loads, ıskalama yolunda da aynı tipi döndür: [list(s) for s in ...].', 'Geçersizleştirmede doğru anahtarı silmek için önce ürünün restaurant_id\'sini sorgula.', 'self.r.set(anahtar, json.dumps(satirlar), ex=300)'],
  'why': 'Cache-aside\'da yazma yolu önbelleği güncellemez, siler: iki eşzamanlı güncelleme olursa "son yazan kazanır" yarışında eski değeri önbelleğe yazma riskini azaltır. TTL ise silmeyi unutan bir kod yolu (toplu içe aktarma, admin paneli) için emniyet ağıdır.'})

ex.append({'id': 'redis-kuyruk-4', 't': 'code', 'stage': 'Rehberli', 'diff': 2,
  'q': '<p><code>TokenBucket(kapasite, hiz, saat)</code> sınıfını yaz. Kova başta doludur. <code>al(maliyet=1)</code>: önce son çağrıdan bu yana geçen süre × <code>hiz</code> kadar jeton ekle (kapasiteyi aşmadan), sonra yeterli jeton varsa düş ve <code>True</code>, yoksa jetona dokunmadan <code>False</code> döndür. <code>bekle_sure(maliyet=1)</code>: şu an yetmiyorsa kaç saniye sonra yeteceğini (yetiyorsa 0.0) döndürsün; bu metot jeton harcamaz (ama dolumu uygulayabilir). Bu değer HTTP 429 yanıtındaki <code>Retry-After</code> başlığı olur.</p>',
  'guide': ['__init__: jeton = kapasite, son = saat().', '_doldur(): simdi = saat(); jeton = min(kapasite, jeton + (simdi - son) * hiz); son = simdi.', 'al: _doldur, sonra jeton >= maliyet ise düş.', 'bekle_sure: _doldur, eksik = maliyet - jeton; eksik <= 0 ise 0.0, değilse eksik / hiz.'],
  'example': 'kapasite, jeton, gecen, hiz = 10, 2, 3, 2\nprint(min(kapasite, jeton + gecen * hiz))\n',
  'start': 'class Saat:\n    def __init__(self, t=0.0):\n        self.t = t\n    def __call__(self):\n        return self.t\n    def ilerle(self, s):\n        self.t += s\n\nclass TokenBucket:\n    def __init__(self, kapasite, hiz, saat):\n        self.kapasite, self.hiz, self.saat = kapasite, hiz, saat\n        self.jeton = kapasite\n        self.son = saat()\n\n    def _doldur(self):\n        # TODO\n        pass\n\n    def al(self, maliyet=1):\n        # TODO\n        return True\n\n    def bekle_sure(self, maliyet=1):\n        # TODO\n        return 0.0\n',
  'sol': 'class Saat:\n    def __init__(self, t=0.0):\n        self.t = t\n    def __call__(self):\n        return self.t\n    def ilerle(self, s):\n        self.t += s\n\nclass TokenBucket:\n    def __init__(self, kapasite, hiz, saat):\n        self.kapasite, self.hiz, self.saat = kapasite, hiz, saat\n        self.jeton = kapasite\n        self.son = saat()\n\n    def _doldur(self):\n        simdi = self.saat()\n        self.jeton = min(self.kapasite, self.jeton + (simdi - self.son) * self.hiz)\n        self.son = simdi\n\n    def al(self, maliyet=1):\n        self._doldur()\n        if self.jeton >= maliyet:\n            self.jeton -= maliyet\n            return True\n        return False\n\n    def bekle_sure(self, maliyet=1):\n        self._doldur()\n        eksik = maliyet - self.jeton\n        return 0.0 if eksik <= 0 else eksik / self.hiz\n',
  'tests': 's = Saat()\nk = TokenBucket(5, 1.0, s)\nassert [k.al() for _ in range(6)] == [True] * 5 + [False], "dolu kova 5 isteğe izin verip 6.\'yı reddetmeli"\nassert abs(k.bekle_sure() - 1.0) < 1e-9, "1 jeton için 1 sn beklemeli (Retry-After)"\ns.ilerle(0.5)\nassert k.al() is False and abs(k.bekle_sure() - 0.5) < 1e-9, "0.5 sn sonra yarım jeton var, 0.5 sn daha"\ns.ilerle(0.5)\nassert k.al() is True, "1 sn sonra 1 jeton dolmuş olmalı"\ns.ilerle(100)\nassert [k.al() for _ in range(6)].count(True) == 5, "uzun beklemede kapasiteyi (5) aşmamalı"\nk2 = TokenBucket(10, 2.0, s)\nassert k2.al(maliyet=8) is True and k2.al(maliyet=3) is False, "maliyetli istek (toplu sorgu) desteklenmeli"\nassert abs(k2.bekle_sure(3) - 0.5) < 1e-9, "2 jeton var, 3 için 1 eksik: 1/2 = 0.5 sn"\nassert k2.bekle_sure(1) == 0.0, "yetiyorsa 0.0"\nassert k2.jeton == 2, "bekle_sure jeton harcamamalı"\n',
  'hints': ['Dolum her çağrının başında yapılır; ayrı bir zamanlayıcı gerekmez.', 'Reddedilen istekte jetonu değiştirme; yalnız dolumu uygula.', 'Gereken süre: (maliyet - jeton) / hiz.'],
  'why': 'Token bucket kısa patlamalara (kapasite kadar) izin verip uzun vadede ortalama hızı korur; durum yalnız iki sayıdır ve dolum tembel hesaplanır. Redis\'te bu iki sayı bir hash\'te tutulur ve hesap bir Lua betiğiyle atomik yapılır; aksi hâlde iki sunucu aynı jetonu birlikte harcayabilir.'})

ex.append({'id': 'redis-kuyruk-5', 't': 'code', 'stage': 'Kendin yaz', 'diff': 2,
  'q': '<p>Sorted set ile kayan pencere (sliding window log) hız sınırlayıcı yaz: <code>kayan_pencere(r, musteri_id, simdi, limit, pencere, istek_id)</code>. Hazır <code>FakeRedis</code>\'te <code>zremrangebyscore</code>, <code>zcard</code>, <code>zadd</code>, <code>expire</code> var. Anahtar <code>oran:&lt;musteri_id&gt;</code>. Adımlar: pencere dışında kalan kayıtları sil (<code>puan &lt;= simdi - pencere</code>), say; sayı <code>limit</code>\'ten küçükse isteği <code>{istek_id: simdi}</code> olarak ekle, anahtara <code>pencere</code> saniyelik TTL ver ve <code>True</code> döndür; değilse eklemeden <code>False</code>.</p>',
  'start': FR + '\ndef kayan_pencere(r, musteri_id, simdi, limit, pencere, istek_id):\n    pass\n',
  'sol': FR + '\ndef kayan_pencere(r, musteri_id, simdi, limit, pencere, istek_id):\n    k = f"oran:{musteri_id}"\n    r.zremrangebyscore(k, float("-inf"), simdi - pencere)\n    if r.zcard(k) >= limit:\n        return False\n    r.zadd(k, {istek_id: simdi})\n    r.expire(k, pencere)\n    return True\n',
  'tests': 's = Saat()\nr = FakeRedis(s)\nsonuc = []\nfor i, t in enumerate([0, 10, 20, 30, 59, 60, 61, 75]):\n    s.t = t\n    sonuc.append(kayan_pencere(r, 870, t, 3, 60, f"i{i}"))\nassert sonuc == [True, True, True, False, False, True, False, True], f"60 sn\'de en çok 3 istek (61. saniyede pencerede 10, 20, 60 var; 75\'te 10 düşer): {sonuc}"\nassert kayan_pencere(r, 348, 75, 3, 60, "x") is True, "her müşterinin kendi penceresi var"\nassert r.zcard("oran:870") == 3, "pencere içindeki kayıtlar tutulmalı, reddedilenler eklenmemeli"\ns.t = 200\nassert r.get("oran:870") is None, "anahtar TTL ile kendiliğinden silinmeli (boşta bellek tutmasın)"\n',
  'hints': ['Sıra önemli: önce eskileri sil, sonra say, sonra (izin varsa) ekle.', 'Sınır: puanı tam simdi - pencere olan kayıt pencere dışıdır (zremrangebyscore iki ucu da dahil siler).', 'Reddedilen isteği ekleme; yoksa saldırgan sürekli istek atarak kendini sonsuza kadar kilitler (ya da tam tersi sayımı şişirir).'],
  'why': 'Kayan pencere log\'u, sabit pencerenin sınırdaki iki kat patlama sorununu çözer: her an son 60 saniyeye bakar. Bedeli, her istek için bir kayıt tutmaktır. Gerçek Redis\'te bu dört komut MULTI/EXEC ya da Lua ile tek atomik adımda çalıştırılır; aksi hâlde iki eşzamanlı istek ikisi de "2 kayıt var" görüp limiti aşar.'})

ex.append({'id': 'redis-kuyruk-6', 't': 'code', 'stage': 'Kendin yaz', 'diff': 2,
  'q': '<p>Dağıtık kilit yaz: <code>Kilit(r, ad, ttl_ms, token)</code>. <code>token</code> bu sahibin benzersiz kimliğidir (gerçekte <code>secrets.token_hex</code>). Hazır <code>FakeRedis.set(k, v, px=..., nx=True)</code> anahtar yoksa yazar ve <code>True</code>, varsa <code>False</code> döner.</p><ul><li><code>al()</code>: <code>kilit:&lt;ad&gt;</code> anahtarına token\'ı <code>NX</code> ve <code>PX</code> ile yazmayı dener; sonucu döndürür.</li><li><code>birak()</code>: anahtar hâlâ <b>bu token</b>\'a aitse siler ve <code>True</code>; değilse (süresi dolmuş ve başkası almış ya da hiç yok) dokunmadan <code>False</code>.</li><li><code>with</code> ile kullanılabilsin: <code>__enter__</code> alamazsa <code>RuntimeError("kilit meşgul")</code> fırlatsın, <code>__exit__</code> bıraksın.</li></ul>',
  'start': FR + '\nclass Kilit:\n    def __init__(self, r, ad, ttl_ms, token):\n        pass\n',
  'sol': FR + '\nclass Kilit:\n    def __init__(self, r, ad, ttl_ms, token):\n        self.r, self.anahtar, self.ttl_ms, self.token = r, f"kilit:{ad}", ttl_ms, token\n\n    def al(self):\n        return self.r.set(self.anahtar, self.token, px=self.ttl_ms, nx=True)\n\n    def birak(self):\n        # gerçek Redis\'te bu iki adım tek bir Lua betiğinde yapılır\n        if self.r.get(self.anahtar) == self.token:\n            self.r.delete(self.anahtar)\n            return True\n        return False\n\n    def __enter__(self):\n        if not self.al():\n            raise RuntimeError("kilit meşgul")\n        return self\n\n    def __exit__(self, *hata):\n        self.birak()\n        return False\n',
  'tests': 's = Saat()\nr = FakeRedis(s)\na = Kilit(r, "siparis:42", 30_000, "isci-A")\nb = Kilit(r, "siparis:42", 30_000, "isci-B")\nassert a.al() is True, "ilk alan kilidi almalı"\nassert b.al() is False, "kilit tutulurken ikincisi alamamalı"\ns.ilerle(31)\nassert b.al() is True, "süre dolunca (A çöktü varsay) B alabilmeli"\nassert a.birak() is False, "A\'nın süresi dolmuş; B\'nin kilidini silmemeli (token kontrolü)"\nassert r.get("kilit:siparis:42") == "isci-B", "kilit B\'de kalmalı"\nassert b.birak() is True and r.get("kilit:siparis:42") is None, "sahibi bırakabilmeli"\nwith Kilit(r, "siparis:7", 5_000, "c"):\n    try:\n        with Kilit(r, "siparis:7", 5_000, "d"):\n            assert False, "meşgul kilit RuntimeError vermeli"\n    except RuntimeError:\n        pass\nassert r.get("kilit:siparis:7") is None, "with bloğu bitince kilit bırakılmalı"\ntry:\n    with Kilit(r, "siparis:8", 5_000, "e"):\n        raise ValueError("iş patladı")\nexcept ValueError:\n    pass\nassert r.get("kilit:siparis:8") is None, "hata olsa da kilit bırakılmalı ve hata yutulmamalı"\n',
  'hints': ['al: return self.r.set(anahtar, token, px=ttl_ms, nx=True)', 'birak: önce r.get ile değerin kendi token\'ın olduğunu kontrol et, sonra sil.', '__exit__ False döndürsün ki with içindeki hata dışarı çıksın.'],
  'why': 'Token\'sız bırakma en sık kilit hatasıdır: işi uzun süren süreç, süresi dolup başkasına geçen kilidi siler ve üçüncü bir süreç de içeri girer. Gerçek Redis\'te "get + karşılaştır + delete" arasına başka istemci girebileceği için bu üçlü bir Lua betiğinde (EVAL) atomik çalıştırılır.'})

ex.append({'id': 'redis-kuyruk-7', 't': 'code', 'stage': 'Kendin yaz', 'diff': 2,
  'q': '<p>Yeniden deneme yürütücüsü yaz: <code>yeniden_dene(is_, deneme_max, taban, tavan, rng, uyu)</code>. <code>is_()</code> çağrılır; <code>GeciciHata</code> fırlatırsa <code>bekleme = rng.uniform(0, min(tavan, taban * 2 ** n))</code> (tam jitter; <code>n</code> o ana kadarki başarısız deneme sayısı - 1, yani ilk beklemede 0) kadar <code>uyu(bekleme)</code> çağrılıp tekrar denenir. <code>KaliciHata</code> hiç yeniden denenmez. Dönüş:</p><ul><li>başarı: <code>("tamam", sonuc, deneme_sayisi)</code></li><li>kalıcı hata ya da <code>deneme_max</code> deneme tükenince: <code>("dlq", hata_nesnesi, deneme_sayisi)</code></li></ul><p>Son denemeden sonra uyunmaz. Hata sınıfları hazır.</p>',
  'start': 'import random\n\nclass GeciciHata(Exception):\n    pass\n\nclass KaliciHata(Exception):\n    pass\n\ndef yeniden_dene(is_, deneme_max, taban, tavan, rng, uyu):\n    pass\n',
  'sol': 'import random\n\nclass GeciciHata(Exception):\n    pass\n\nclass KaliciHata(Exception):\n    pass\n\ndef yeniden_dene(is_, deneme_max, taban, tavan, rng, uyu):\n    for deneme in range(1, deneme_max + 1):\n        try:\n            return ("tamam", is_(), deneme)\n        except KaliciHata as e:\n            return ("dlq", e, deneme)\n        except GeciciHata as e:\n            son = e\n            if deneme < deneme_max:\n                uyu(rng.uniform(0, min(tavan, taban * 2 ** (deneme - 1))))\n    return ("dlq", son, deneme_max)\n',
  'tests': 'def sirali(sonuclar):\n    it = iter(sonuclar)\n    def is_():\n        x = next(it)\n        if isinstance(x, Exception):\n            raise x\n        return x\n    return is_\nuykular = []\nr = yeniden_dene(sirali([GeciciHata("503"), GeciciHata("zaman aşımı"), "SMS gitti"]), 5, 1, 30, random.Random(42), uykular.append)\nassert r == ("tamam", "SMS gitti", 3), f"3. denemede başarı bekleniyordu: {r}"\nrng = random.Random(42)\nassert uykular == [rng.uniform(0, 1), rng.uniform(0, 2)], "bekleme tam jitter: uniform(0, min(tavan, taban * 2**n)), n=0,1,..."\nuykular = []\nr = yeniden_dene(sirali([GeciciHata("x")] * 4), 4, 1, 3, random.Random(1), uykular.append)\nassert r[0] == "dlq" and r[2] == 4 and isinstance(r[1], GeciciHata), "deneme hakkı tükenince dlq"\nassert len(uykular) == 3, "son denemeden sonra uyunmamalı (4 deneme, 3 bekleme)"\nrng = random.Random(1)\nassert uykular == [rng.uniform(0, 1), rng.uniform(0, 2), rng.uniform(0, 3)], "tavan (3) uygulanmalı"\nuykular = []\nr = yeniden_dene(sirali([GeciciHata("x"), KaliciHata("geçersiz numara")]), 5, 1, 30, random.Random(0), uykular.append)\nassert r[0] == "dlq" and str(r[1]) == "geçersiz numara" and r[2] == 2 and len(uykular) == 1, "kalıcı hata yeniden denenmemeli"\nassert yeniden_dene(sirali(["ilk"]), 3, 1, 30, random.Random(0), uykular.append) == ("tamam", "ilk", 1), "ilk denemede başarı"\n',
  'hints': ['for deneme in range(1, deneme_max + 1) döngüsünde try/except ile iki hata türünü ayrı yakala.', 'Bekleme üssü (deneme - 1): ilk beklemede taban * 1.', 'Uyuma koşulu: deneme < deneme_max.'],
  'why': 'Geçici ve kalıcı hatayı ayırmak, işe yaramayacak denemelerle dış servisi boğmayı önler. Tam jitter (AWS mimari blogundaki öneri), tüm istemcilerin aynı saniyede yeniden denemesini (thundering herd) dağıtır. uyu ve rng\'yi parametre almak testi anlık ve deterministik yapar; Celery\'de retry_backoff, retry_backoff_max ve retry_jitter aynı mantıktır.'})

ex.append({'id': 'redis-kuyruk-8', 't': 'code', 'stage': 'Kendin yaz', 'diff': 2,
  'q': '<p>İdempotent iade görevi yaz: <code>iade_et(r, hesaplar, siparis_id, tutar, musteri_id)</code>. Aynı sipariş için görev kaç kez çalışırsa çalışsın müşteri hesabına yalnız bir kez iade yapılmalı.</p><ul><li>Anahtar <code>idem:iade:&lt;siparis_id&gt;</code>; hazır <code>FakeRedis.set(..., nx=True, ex=86400)</code> ile önce <code>"isleniyor"</code> yazmayı dene.</li><li>Yazabildiysen: <code>hesaplar[musteri_id] += tutar</code>, anahtarı <code>"tamam"</code> yap (86400 sn TTL) ve <code>"iade yapıldı"</code> döndür. İade sırasında hata çıkarsa anahtarı sil (sonraki deneme yapabilsin) ve hatayı yeniden fırlat.</li><li>Yazamadıysan: değer <code>"tamam"</code> ise <code>"zaten yapıldı"</code>, <code>"isleniyor"</code> ise <code>"devam ediyor"</code> döndür.</li></ul><p><code>tutar &lt;= 0</code> ise hiçbir şey yazmadan <code>ValueError</code>.</p>',
  'start': FR + '\ndef iade_et(r, hesaplar, siparis_id, tutar, musteri_id):\n    pass\n',
  'sol': FR + '\ndef iade_et(r, hesaplar, siparis_id, tutar, musteri_id):\n    if tutar <= 0:\n        raise ValueError("tutar pozitif olmalı")\n    k = f"idem:iade:{siparis_id}"\n    if not r.set(k, "isleniyor", ex=86400, nx=True):\n        return "zaten yapıldı" if r.get(k) == "tamam" else "devam ediyor"\n    try:\n        hesaplar[musteri_id] += tutar\n    except Exception:\n        r.delete(k)\n        raise\n    r.set(k, "tamam", ex=86400)\n    return "iade yapıldı"\n',
  'tests': 's = Saat()\nr = FakeRedis(s)\nh = {870: 0.0, 348: 10.0}\nassert iade_et(r, h, 12, 185.5, 870) == "iade yapıldı", "ilk çalıştırma iade yapmalı"\nassert iade_et(r, h, 12, 185.5, 870) == "zaten yapıldı", "ikinci çalıştırma tekrar iade etmemeli"\nassert h[870] == 185.5, "hesaba yalnız bir kez eklenmeli"\nr.set("idem:iade:99", "isleniyor", ex=86400)\nassert iade_et(r, h, 99, 50, 348) == "devam ediyor" and h[348] == 10.0, "başka işçi işlerken bekle"\ntry:\n    iade_et(r, h, 13, 20, 999)\n    assert False, "olmayan hesap KeyError vermeli"\nexcept KeyError:\n    pass\nassert r.get("idem:iade:13") is None, "hata olunca anahtar silinmeli ki yeniden denenebilsin"\nh[999] = 0\nassert iade_et(r, h, 13, 20, 999) == "iade yapıldı" and h[999] == 20, "düzeltmeden sonra yeniden deneme çalışmalı"\ntry:\n    iade_et(r, h, 14, 0, 870)\n    assert False, "sıfır tutar ValueError"\nexcept ValueError:\n    pass\nassert r.get("idem:iade:14") is None, "geçersiz tutarda anahtar yazılmamalı"\ns.ilerle(86400)\nassert r.get("idem:iade:12") is None, "idempotency kaydı TTL ile temizlenmeli"\n',
  'hints': ['SET NX "kilidi" ve idempotency kaydını aynı anda sağlar: yalnız ilk çağıran yazabilir.', 'Hata durumunda try/except içinde r.delete(k) ve raise.', 'Başarıda değeri "tamam" yap; böylece sonraki çağrılar neden reddedildiğini bilir.'],
  'why': 'En az bir kez teslim eden kuyruklarda yan etkili her görev (ödeme, iade, SMS) bir idempotency anahtarıyla korunmalıdır. "isleniyor" ara durumu, aynı anda çalışan iki kopyayı ayırır; hata olunca kaydı silmek yeniden denemeye izin verir. Para hareketlerinde bu kayıt Redis yerine veritabanında, iade kaydıyla aynı transaction\'da tutulur.'})

ex.append({'id': 'redis-kuyruk-9', 't': 'code', 'stage': 'Hata avı', 'diff': 2, 'kind': 'bug', 'needs': ['sqlite3'],
  'q': '<p><b>Hatayı bul ve düzelt.</b> Bir stajyer restoran bilgisi için önbellek yazmış. Müşteriler iki şikâyette bulunuyor: (1) Kadıköy\'deki restoranın sayfasında bazen başka bir restoranın adı görünüyor; (2) restoran kapatılınca (<code>is_active = 0</code>) sayfası saatlerce açık görünüyor. Ayrıca olmayan restoran id\'leri (botlar <code>/restoran/999</code> deniyor) her seferinde veritabanına gidiyor. Düzelt: anahtar restorana özgü olsun, <code>kapat</code> önbelleği geçersizleştirsin, olmayan kayıt da kısa süreli (60 sn) <code>"YOK"</code> değeriyle önbelleğe alınsın (negatif önbellek) ve fonksiyon <code>None</code> döndürsün. Normal kayıt TTL\'si 3600 sn.</p>',
  'start': FR + '\nimport json\nimport veri\n\ncon = veri.baglan("lezzet_kurye", tablolar=["lk_restaurants"])\n\nclass RestoranOnbellek:\n    def __init__(self, r, con):\n        self.r, self.con, self.db = r, con, 0\n\n    def getir(self, rid):\n        c = self.r.get("restoran")\n        if c is not None:\n            return json.loads(c)\n        self.db += 1\n        s = self.con.execute("SELECT restaurant_id, name, is_active FROM lk_restaurants WHERE restaurant_id = ?", (rid,)).fetchone()\n        if s is None:\n            return None\n        kayit = {"id": s[0], "ad": s[1], "aktif": bool(s[2])}\n        self.r.set("restoran", json.dumps(kayit), ex=3600)\n        return kayit\n\n    def kapat(self, rid):\n        self.con.execute("UPDATE lk_restaurants SET is_active = 0 WHERE restaurant_id = ?", (rid,))\n',
  'sol': FR + '\nimport json\nimport veri\n\ncon = veri.baglan("lezzet_kurye", tablolar=["lk_restaurants"])\n\nclass RestoranOnbellek:\n    def __init__(self, r, con):\n        self.r, self.con, self.db = r, con, 0\n\n    def getir(self, rid):\n        k = f"restoran:{rid}"\n        c = self.r.get(k)\n        if c == "YOK":\n            return None\n        if c is not None:\n            return json.loads(c)\n        self.db += 1\n        s = self.con.execute("SELECT restaurant_id, name, is_active FROM lk_restaurants WHERE restaurant_id = ?", (rid,)).fetchone()\n        if s is None:\n            self.r.set(k, "YOK", ex=60)\n            return None\n        kayit = {"id": s[0], "ad": s[1], "aktif": bool(s[2])}\n        self.r.set(k, json.dumps(kayit), ex=3600)\n        return kayit\n\n    def kapat(self, rid):\n        self.con.execute("UPDATE lk_restaurants SET is_active = 0 WHERE restaurant_id = ?", (rid,))\n        self.r.delete(f"restoran:{rid}")\n',
  'tests': 's = Saat()\no = RestoranOnbellek(FakeRedis(s), veri.baglan("lezzet_kurye", tablolar=["lk_restaurants"]))\nassert o.getir(1)["ad"] == "Köşe Dönercisi", "1 numara Köşe Dönercisi"\nassert o.getir(2)["ad"] == "Usta Döner", "2 numara için 1\'in önbelleği dönmemeli: anahtar restorana özgü olmalı"\nassert o.getir(1)["ad"] == "Köşe Dönercisi" and o.db == 2, "ikinci okuma önbellekten gelmeli"\no.kapat(2)\nassert o.getir(2)["aktif"] is False, "kapatma önbelleği geçersizleştirmeli"\nfor _ in range(20):\n    assert o.getir(999) is None, "olmayan restoran None"\nassert o.db == 4, f"olmayan kayıt bir kez sorgulanıp negatif önbelleğe alınmalı (db={o.db})"\ns.ilerle(60)\no.getir(999)\nassert o.db == 5, "negatif önbellek 60 sn sonra düşmeli"\ns.ilerle(3599)\no.getir(1)\nassert o.db == 6, "normal kayıt TTL\'si 3600 sn"\n',
  'hints': ['"restoran" sabit anahtarı tüm restoranlarca paylaşılıyor; id\'yi anahtara ekle.', 'Veriyi değiştiren her yol, ilgili anahtarı silmeli.', 'Bulunamayan kayıt için kısa TTL ile bir işaret değeri ("YOK") yaz ve okurken önce onu kontrol et.'],
  'why': 'Anahtar tasarımı önbelleğin doğruluğudur: anahtar, yanıtı belirleyen her şeyi (id, dil, kullanıcı rolü) içermeli. Geçersizleştirme unutulursa TTL kadar bayat veri sunulur. Negatif önbellek, olmayan anahtarlarla yapılan taramaların (cache penetration) veritabanını delmesini engeller; TTL\'si kısa tutulur ki kayıt sonradan oluşursa hemen görünsün.'})

ex.append({'id': 'redis-kuyruk-10', 't': 'code', 'stage': 'Hata avı', 'diff': 2, 'kind': 'bug',
  'q': '<p><b>Hatayı bul ve düzelt.</b> <code>havuz_calistir(isler, isci_sayisi, isle)</code> bir <code>asyncio.Queue</code> ve sabit sayıda işçiyle işleri işliyor; <code>(basarili, dlq)</code> döndürmeli: <code>basarili</code> işlenen işlerin sonuçları, <code>dlq</code> hata veren işlerin <code>(is_, hata_metni)</code> çiftleri. Sorun: bir iş hata verince işçi ölüyor; 2 işçi ve 2 hatalı iş olduğunda kuyrukta kalan işler hiç işlenmiyor ve hatalar kayboluyor. Düzelt: işçi her işi <code>try/except</code> ile işlesin, hatayı <code>dlq</code>\'ya yazıp döngüye devam etsin. Sonuç listeleri işlenme sırasından bağımsız olarak <b>sıralı</b> dönsün.</p>',
  'start': 'import asyncio\n\nasync def havuz_calistir(isler, isci_sayisi, isle):\n    kuyruk = asyncio.Queue()\n    for i in isler:\n        kuyruk.put_nowait(i)\n    basarili, dlq = [], []\n\n    async def isci():\n        while not kuyruk.empty():\n            is_ = kuyruk.get_nowait()\n            basarili.append(await isle(is_))\n\n    await asyncio.gather(*(isci() for _ in range(isci_sayisi)), return_exceptions=True)\n    return sorted(basarili), sorted(dlq)\n',
  'sol': 'import asyncio\n\nasync def havuz_calistir(isler, isci_sayisi, isle):\n    kuyruk = asyncio.Queue()\n    for i in isler:\n        kuyruk.put_nowait(i)\n    basarili, dlq = [], []\n\n    async def isci():\n        while not kuyruk.empty():\n            is_ = kuyruk.get_nowait()\n            try:\n                basarili.append(await isle(is_))\n            except Exception as e:\n                dlq.append((is_, str(e)))\n\n    await asyncio.gather(*(isci() for _ in range(isci_sayisi)), return_exceptions=True)\n    return sorted(basarili), sorted(dlq)\n',
  'tests': 'async def isle(n):\n    await asyncio.sleep(0)\n    if n % 5 == 0:\n        raise ValueError(f"sipariş {n} için telefon yok")\n    return n * 10\nb, d = asyncio.run(havuz_calistir(range(1, 13), 2, isle))\nassert b == [10, 20, 30, 40, 60, 70, 80, 90, 110, 120], f"tüm sağlam işler işlenmeli: {b}"\nassert d == [(5, "sipariş 5 için telefon yok"), (10, "sipariş 10 için telefon yok")], f"hatalı işler DLQ\'ya gitmeli: {d}"\nb, d = asyncio.run(havuz_calistir([5, 10, 15, 1], 3, isle))\nassert b == [10] and len(d) == 3, "işçi sayısı kadar hata olsa da havuz durmamalı"\nassert asyncio.run(havuz_calistir([], 2, isle)) == ([], []), "boş kuyruk"\n',
  'hints': ['Hata await isle(is_) satırında çıkıyor ve işçinin while döngüsünü sonlandırıyor.', 'gather(..., return_exceptions=True) hatayı yutar; hatanın görünmemesinin sebebi bu.', 'try: basarili.append(await isle(is_)) / except Exception as e: dlq.append((is_, str(e)))'],
  'why': 'İşçi döngüsü tek bir işin hatasıyla ölmemelidir; aksi hâlde havuz sessizce küçülür ve kuyruk birikir. return_exceptions=True hatayı gather\'ın sonucuna gömdüğü için kimse fark etmez. Celery ve RQ işçileri de her görevi ayrı bir try içinde çalıştırır, hatayı kaydedip bir sonraki göreve geçer; deneme hakkı biten görevler DLQ\'ya düşer.'})

ex.append({'id': 'redis-kuyruk-11', 't': 'code', 'stage': 'Meydan okuma', 'diff': 3,
  'q': '<p>Cache stampede\'e karşı tek uçuşlu (single-flight) asenkron önbellek yaz: <code>TekUcus(saat, ttl)</code>. <code>async getir(anahtar, yukle)</code>:</p><ul><li>Taze bir değer varsa (süresi <code>simdi &gt;= bitis</code> ile dolmamışsa) onu döndürür.</li><li>Yoksa ve o anahtar için devam eden bir yükleme varsa <b>yeni yükleme başlatmadan</b> onun sonucunu bekler.</li><li>Yoksa <code>await yukle()</code> ile yükler, sonucu <code>ttl</code> ile saklar ve döndürür.</li><li>Yükleme hata verirse bekleyen herkes aynı hatayı alır; hata önbelleğe <b>yazılmaz</b> ve sonraki çağrı yeniden dener.</li></ul><p>İpucu: devam eden yüklemeleri <code>{anahtar: asyncio.Future ya da Task}</code> sözlüğünde tut.</p>',
  'start': 'import asyncio\n\nclass TekUcus:\n    def __init__(self, saat, ttl):\n        self.saat, self.ttl = saat, ttl\n\n    async def getir(self, anahtar, yukle):\n        return await yukle()\n',
  'sol': 'import asyncio\n\nclass TekUcus:\n    def __init__(self, saat, ttl):\n        self.saat, self.ttl = saat, ttl\n        self.deger = {}\n        self.ucusta = {}\n\n    async def getir(self, anahtar, yukle):\n        kayit = self.deger.get(anahtar)\n        if kayit is not None and self.saat() < kayit[1]:\n            return kayit[0]\n        gorev = self.ucusta.get(anahtar)\n        if gorev is None:\n            gorev = asyncio.ensure_future(yukle())\n            self.ucusta[anahtar] = gorev\n            try:\n                sonuc = await gorev\n            finally:\n                self.ucusta.pop(anahtar, None)\n            self.deger[anahtar] = (sonuc, self.saat() + self.ttl)\n            return sonuc\n        return await asyncio.shield(gorev)\n',
  'tests': 'class Saat:\n    t = 0.0\n    def __call__(self):\n        return self.t\nsaat = Saat()\nonb = TekUcus(saat, 300)\ncagri = {"n": 0}\nasync def menu_yukle():\n    cagri["n"] += 1\n    await asyncio.sleep(0.01)\n    return ["İskender", "Ayran"]\nasync def hucum(n):\n    return await asyncio.gather(*(onb.getir("menu:5", menu_yukle) for _ in range(n)))\nsonuclar = asyncio.run(hucum(50))\nassert cagri["n"] == 1, f"50 eşzamanlı ıskalamada tek yükleme bekleniyordu, {cagri[\'n\']} oldu"\nassert all(s == ["İskender", "Ayran"] for s in sonuclar), "herkes aynı sonucu almalı"\nasyncio.run(hucum(10))\nassert cagri["n"] == 1, "TTL içinde yeniden yükleme olmamalı"\nsaat.t = 300\nasyncio.run(hucum(10))\nassert cagri["n"] == 2, "TTL dolunca bir kez yeniden yüklenmeli"\nhata = {"n": 0}\nasync def bozuk():\n    hata["n"] += 1\n    await asyncio.sleep(0.01)\n    raise ConnectionError("veritabanı yok")\nasync def bozuk_hucum():\n    return await asyncio.gather(*(onb.getir("menu:6", bozuk) for _ in range(5)), return_exceptions=True)\nr = asyncio.run(bozuk_hucum())\nassert hata["n"] == 1 and all(isinstance(x, ConnectionError) for x in r), "hata tüm bekleyenlere tek yüklemeyle iletilmeli"\nasync def tek():\n    try:\n        await onb.getir("menu:6", bozuk)\n    except ConnectionError:\n        pass\nasyncio.run(tek())\nassert hata["n"] == 2, "hata önbelleğe yazılmamalı; sonraki çağrı yeniden denemeli"\n',
  'hints': ['İlk ıskalayan bir Task oluşturup sözlüğe koyar; sonra gelenler aynı Task\'ı await eder.', 'Yükleme bitince (başarılı ya da hatalı) Task\'ı sözlükten finally ile çıkar.', 'Değeri yalnız başarıda (sonuc, simdi + ttl) olarak sakla.'],
  'why': 'Tek uçuş, önbellek hücumunun klasik çözümüdür (Go\'daki singleflight paketi): aynı anahtar için eşzamanlı ıskalamalar tek bir yüklemeye indirgenir. Dağıtık sistemde aynı fikir Redis üzerinde kısa ömürlü bir kilitle (SET NX PX) uygulanır; kilidi alamayanlar kısa bekleyip önbelleği yeniden okur. Hatayı önbelleğe yazmamak, geçici bir arızanın TTL boyunca kalıcı hale gelmesini önler.'})

ex.append({'id': 'redis-kuyruk-12', 't': 'code', 'stage': 'Meydan okuma', 'diff': 3,
  'q': '<p>Görünürlük zaman aşımı (visibility timeout) olan bir aracı (broker) yaz: <code>Broker(gorunurluk, max_teslim)</code>.</p><ul><li><code>gonder(mesaj)</code>: mesajı sona ekler, <code>"m1"</code>, <code>"m2"</code>... kimliğini döndürür.</li><li><code>al(simdi)</code>: önce süresi dolan uçuştaki mesajları (alış + <code>gorunurluk</code> &lt;= <code>simdi</code>) kuyruğun <b>başına</b>, alınma sıralarıyla geri koyar. Sonra baştaki mesajı alır: teslim sayısını 1 artırır; sayı <code>max_teslim</code>\'i aşıyorsa mesajı <code>self.dlq</code> listesine (<code>(kimlik, mesaj)</code>) taşır ve sıradakine geçer. Bulursa <code>(kimlik, mesaj, teslim_sayisi)</code>, kuyruk boşsa <code>None</code> döndürür.</li><li><code>onayla(kimlik)</code>: mesaj hâlâ uçuştaysa siler ve <code>True</code>; zaman aşımına uğrayıp geri dönmüş ya da bilinmiyorsa <code>False</code>.</li></ul>',
  'start': 'from collections import deque\n\nclass Broker:\n    def __init__(self, gorunurluk, max_teslim):\n        self.gorunurluk, self.max_teslim = gorunurluk, max_teslim\n        self.kuyruk = deque()\n        self.dlq = []\n',
  'sol': 'from collections import deque\n\nclass Broker:\n    def __init__(self, gorunurluk, max_teslim):\n        self.gorunurluk, self.max_teslim = gorunurluk, max_teslim\n        self.kuyruk = deque()\n        self.ucusta = {}\n        self.teslim = {}\n        self.mesaj = {}\n        self.dlq = []\n        self.no = 0\n\n    def gonder(self, mesaj):\n        self.no += 1\n        k = f"m{self.no}"\n        self.mesaj[k], self.teslim[k] = mesaj, 0\n        self.kuyruk.append(k)\n        return k\n\n    def _geri_al(self, simdi):\n        dolan = sorted((t, k) for k, t in self.ucusta.items() if t + self.gorunurluk <= simdi)\n        for _, k in reversed(dolan):\n            del self.ucusta[k]\n            self.kuyruk.appendleft(k)\n\n    def al(self, simdi):\n        self._geri_al(simdi)\n        while self.kuyruk:\n            k = self.kuyruk.popleft()\n            self.teslim[k] += 1\n            if self.teslim[k] > self.max_teslim:\n                self.dlq.append((k, self.mesaj[k]))\n                continue\n            self.ucusta[k] = simdi\n            return (k, self.mesaj[k], self.teslim[k])\n        return None\n\n    def onayla(self, k):\n        if k in self.ucusta:\n            del self.ucusta[k]\n            return True\n        return False\n',
  'tests': 'b = Broker(gorunurluk=30, max_teslim=2)\nassert [b.gonder(m) for m in ("sms:1", "sms:2", "sms:3")] == ["m1", "m2", "m3"], "kimlikler m1, m2, m3"\nassert b.al(0) == ("m1", "sms:1", 1), "ilk mesaj"\nassert b.al(5) == ("m2", "sms:2", 1), "ikinci mesaj"\nassert b.onayla("m2") is True and b.onayla("m2") is False, "onay bir kez"\nassert b.al(30) == ("m1", "sms:1", 2), "m1 30 sn içinde onaylanmadı: kuyruğun başına dönüp yeniden teslim edilmeli"\nassert b.onayla("m1") is True, "ikinci teslimde onaylanabilir"\nassert b.al(31) == ("m3", "sms:3", 1), "sıradaki m3"\nassert b.al(61) == ("m3", "sms:3", 2), "m3 zaman aşımıyla geri döndü"\nassert b.onayla("m3") is True\nb.gonder("sms:4")\nb.al(100)\nb.al(130)\nassert b.al(160) is None, "max_teslim (2) aşılınca mesaj teslim edilmemeli"\nassert b.dlq == [("m4", "sms:4")], f"m4 DLQ\'ya taşınmalı: {b.dlq}"\nc = Broker(10, 5)\nfor m in "abc":\n    c.gonder(m)\nc.al(0); c.al(1)\nassert [c.al(20)[0], c.al(20)[0], c.al(20)[0]] == ["m1", "m2", "m3"], "zaman aşımına uğrayanlar alınma sırasıyla başa dönmeli"\nassert c.onayla("m9") is False, "bilinmeyen kimlik"\n',
  'hints': ['Uçuştaki mesajları {kimlik: alış_anı} sözlüğünde tut; teslim sayısını ayrı sözlükte.', 'Süresi dolanları alış anına göre sırala ve ters sırayla appendleft yap; böylece en eski başa gelir.', 'DLQ kontrolünü teslim sayısını artırdıktan sonra yap ve while döngüsüyle sıradakine geç.'],
  'why': 'SQS, Redis Streams (XPENDING/XCLAIM) ve Celery acks_late bu modeli kullanır: alınan mesaj silinmez, yalnız görünmez olur; işçi onaylamazsa (çöktü, takıldı) süre sonunda başkasına teslim edilir. Teslim sayısı eşiği, sürekli çökerten "zehirli mesajın" (poison message) kuyruğu sonsuza dek meşgul etmesini önler. Görünürlük süresi en uzun iş süresinden uzun olmalı, yoksa sağlıklı iş iki kez çalışır.'})

ex.append({'id': 'redis-kuyruk-13', 't': 'code', 'stage': 'Mini proje', 'diff': 3,
  'q': '<p><b>Lezzet Kurye bildirim hattı.</b> <code>bildirim_hatti(siparisler, servis, isci_sayisi=3, deneme_max=3)</code> asenkron fonksiyonunu yaz. <code>siparisler</code> <code>veri.kayitlar("lezzet_kurye", "lk_orders")</code>\'dan gelen ilk 40 kayıttır; hazır <code>servis</code> nesnesinin <code>async gonder(siparis)</code> metodu bildirimi gönderir ve <code>GeciciHata</code> ya da <code>KaliciHata</code> fırlatabilir.</p><ul><li>Yalnız <code>status == "teslim"</code> siparişler için bildirim gider; diğerleri <code>atlanan</code> sayılır.</li><li>Her sipariş <code>asyncio.Queue</code>\'ya konur, <code>isci_sayisi</code> işçi işler.</li><li><code>GeciciHata</code>\'da aynı sipariş <code>deneme_max</code> denemeye kadar yeniden denenir (bekleme için <code>await asyncio.sleep(0)</code> yeterli). Deneme biterse ya da <code>KaliciHata</code> gelirse sipariş DLQ\'ya gider.</li><li>Aynı sipariş listede iki kez gelse bile (en az bir kez teslim) <b>bir kez</b> işlenmeli: idempotency için gönderilen ya da DLQ\'ya düşen <code>order_id</code>\'leri bir kümede tut; ikinci kopya (ilki hâlâ işleniyor olsa bile) <code>tekrar_engellenen</code> sayılır.</li></ul><p>Dönüş sözlüğü: <code>{"gonderilen": n, "atlanan": n, "tekrar_engellenen": n, "dlq": [order_id, ...] (sıralı), "deneme": toplam gonder çağrısı}</code>.</p>',
  'start': 'import asyncio\nimport veri\n\nclass GeciciHata(Exception):\n    pass\n\nclass KaliciHata(Exception):\n    pass\n\nclass SmsServisi:\n    """Nakit ödemeli siparişlerde ilk iki deneme zaman aşımı; müşteri 52 kalıcı olarak geçersiz numara."""\n    def __init__(self):\n        self.deneme = {}\n        self.giden = []\n    async def gonder(self, s):\n        await asyncio.sleep(0)\n        n = self.deneme[s["order_id"]] = self.deneme.get(s["order_id"], 0) + 1\n        if s["customer_id"] == 52:\n            raise KaliciHata("geçersiz numara")\n        if s["payment"] == "nakit" and n <= 2:\n            raise GeciciHata("zaman aşımı")\n        self.giden.append(s["order_id"])\n\nasync def bildirim_hatti(siparisler, servis, isci_sayisi=3, deneme_max=3):\n    # TODO\n    pass\n',
  'sol': 'import asyncio\nimport veri\n\nclass GeciciHata(Exception):\n    pass\n\nclass KaliciHata(Exception):\n    pass\n\nclass SmsServisi:\n    """Nakit ödemeli siparişlerde ilk iki deneme zaman aşımı; müşteri 52 kalıcı olarak geçersiz numara."""\n    def __init__(self):\n        self.deneme = {}\n        self.giden = []\n    async def gonder(self, s):\n        await asyncio.sleep(0)\n        n = self.deneme[s["order_id"]] = self.deneme.get(s["order_id"], 0) + 1\n        if s["customer_id"] == 52:\n            raise KaliciHata("geçersiz numara")\n        if s["payment"] == "nakit" and n <= 2:\n            raise GeciciHata("zaman aşımı")\n        self.giden.append(s["order_id"])\n\nasync def bildirim_hatti(siparisler, servis, isci_sayisi=3, deneme_max=3):\n    kuyruk = asyncio.Queue()\n    for s in siparisler:\n        kuyruk.put_nowait(s)\n    rapor = {"gonderilen": 0, "atlanan": 0, "tekrar_engellenen": 0, "dlq": [], "deneme": 0}\n    bitti, islemde = set(), set()\n\n    async def isle(s):\n        oid = s["order_id"]\n        if s["status"] != "teslim":\n            rapor["atlanan"] += 1\n            return\n        if oid in bitti or oid in islemde:\n            rapor["tekrar_engellenen"] += 1\n            return\n        islemde.add(oid)\n        try:\n            for deneme in range(1, deneme_max + 1):\n                rapor["deneme"] += 1\n                try:\n                    await servis.gonder(s)\n                except KaliciHata:\n                    rapor["dlq"].append(oid)\n                    bitti.add(oid)\n                    return\n                except GeciciHata:\n                    if deneme == deneme_max:\n                        rapor["dlq"].append(oid)\n                        bitti.add(oid)\n                        return\n                    await asyncio.sleep(0)\n                else:\n                    bitti.add(oid)\n                    rapor["gonderilen"] += 1\n                    return\n        finally:\n            islemde.discard(oid)\n\n    async def isci():\n        while True:\n            s = await kuyruk.get()\n            try:\n                await isle(s)\n            finally:\n                kuyruk.task_done()\n\n    iscilar = [asyncio.create_task(isci()) for _ in range(isci_sayisi)]\n    await kuyruk.join()\n    for t in iscilar:\n        t.cancel()\n    await asyncio.gather(*iscilar, return_exceptions=True)\n    rapor["dlq"].sort()\n    return rapor\n',
  'tests': '_s = veri.kayitlar("lezzet_kurye", "lk_orders")[:40]\nsv = SmsServisi()\nr = asyncio.run(bildirim_hatti(_s, sv))\nassert r["atlanan"] == 4, f"40 siparişten 4\'ü teslim değil (iptal/iade): {r[\'atlanan\']}"\nassert r["dlq"] == [5, 21], f"müşteri 52\'nin siparişleri (5, 21) kalıcı hatayla DLQ\'ya gitmeli: {r[\'dlq\']}"\nassert r["gonderilen"] == 34 and sorted(sv.giden) == sorted(set(sv.giden)), "34 bildirim, her biri bir kez"\nassert r["deneme"] == 44, f"30 sipariş 1 denemede, nakit ödemeli 4 sipariş 3 denemede, kalıcı hatalı 2 sipariş 1 denemede: 30 + 12 + 2 = 44 bekleniyordu, {r[\'deneme\']}"\nassert r["tekrar_engellenen"] == 0, "tekrar yok"\nsv2 = SmsServisi()\nr2 = asyncio.run(bildirim_hatti(_s[:10] + _s[:10], sv2, isci_sayisi=4))\nassert r2["gonderilen"] == 9 and r2["tekrar_engellenen"] == 10 and r2["dlq"] == [5], f"aynı sipariş ikinci kez gelince yeniden işlenmemeli (DLQ\'ya düşen de): {r2}"\nassert len(sv2.giden) == len(set(sv2.giden)), "müşteri aynı SMS\'i iki kez almamalı"\nsv3 = SmsServisi()\nr3 = asyncio.run(bildirim_hatti(_s, sv3, deneme_max=2))\nassert r3["dlq"] == [5, 10, 19, 21, 26, 27] and r3["gonderilen"] == 30, "deneme_max=2 iken nakit siparişler (ilk iki deneme hata) DLQ\'ya düşmeli"\n',
  'hints': ['İşi işçiden ayır: isle(s) tek bir siparişin tüm yeniden deneme mantığını içersin; işçi yalnız kuyruktan alıp isle\'yi çağırsın.', 'İdempotency için iki küme: gönderilmiş ve şu an işlenen. İkisinden birinde varsa tekrar_engellenen.', 'kuyruk.join() tüm task_done çağrılarını bekler; sonra işçileri cancel et.'],
  'why': 'Bu küçük hat bir Celery kurulumunun tüm parçalarını içerir: üretici (siparişleri kuyruğa koyan), aracı (Queue), işçi havuzu, geçici/kalıcı hata ayrımı, sınırlı yeniden deneme, DLQ ve idempotency. Gerçekte gönderilmiş kümesi Redis\'te (SET NX ile) ya da veritabanında benzersiz kısıtla tutulur; böylece işçiler farklı makinelerde olsa da tekrar engellenir.'})

lesson = {
  'id': 'redis-kuyruk',
  'lv': 'ileri',
  'mod': 'Web ve API',
  'min': 85,
  'title': 'Redis, önbellek ve arka plan işleri (Celery/RQ)',
  'sum': 'Redis veri türlerini ve kullanım yerlerini tanır; enjekte edilen saatli bir FakeRedis ile cache-aside, TTL, geçersizleştirme ve stampede korumasını, token bucket ve kayan pencere hız sınırlamayı, dağıtık kilidi kurar; asyncio işçi havuzuyla yeniden deneme, idempotentlik ve ölü mektup kuyruğu olan bir görev hattını Lezzet Kurye verisiyle yazarsın.',
  'goals': [
    'Redis veri türlerini (string, hash, list, set, sorted set) doğru iş için seçebilirim.',
    'Cache-aside desenini TTL, geçersizleştirme, negatif önbellek ve tek uçuş (stampede koruması) ile uygulayabilirim.',
    'Token bucket ve kayan pencere hız sınırlayıcı ile token kontrollü dağıtık kilit yazabilirim.',
    'Üretici, aracı ve işçi modelini Celery/RQ ile açıklar, asyncio işçi havuzu kurabilirim.',
    'Üstel geri çekilme + jitter ile yeniden deneme, idempotent görev, görünürlük zaman aşımı ve ölü mektup kuyruğu tasarlayabilirim.'
  ],
  'needs': ['sqlite3'],
  'body': body,
  'ex': ex,
  'faq': [
    {'q': 'Redis mi, Memcached mı?', 'a': 'Yalnız basit anahtar-değer önbelleği gerekiyorsa ikisi de olur. Redis zengin veri türleri (sorted set, hash, stream), kalıcılık, pub/sub ve Lua betikleriyle önbelleğin ötesine geçer (hız sınırı, kilit, kuyruk); bu yüzden çoğu projede varsayılan seçimdir.'},
    {'q': 'Celery mi, RQ mu, yoksa FastAPI BackgroundTasks mı?', 'a': 'BackgroundTasks aynı süreçte, yanıttan sonra çalışır: süreç çökerse iş kaybolur, yeniden deneme yoktur; küçük işler içindir. RQ Redis üzerinde sade bir kuyruktur. Celery zamanlanmış görevler, zincirler, farklı aracılar, oran sınırı ve olgun izleme (Flower) sunar; büyük Django projelerinde standarttır.'},
    {'q': 'Önbelleğe ne kadar TTL vermeliyim?', 'a': 'Verinin ne kadar bayat olmasına tahammül edildiğine göre: menü için 5-15 dakika, kur bilgisi için saniyeler, kullanıcı profili için saatler. Değişiklikte anahtarı siliyorsan TTL yalnız emniyet ağıdır ve uzun olabilir. Aynı anda doldurulan anahtarlara jitter ekle.'},
    {'q': 'Kuyruk kullanınca "tam olarak bir kez" (exactly-once) çalıştırma mümkün mü?', 'a': 'Dağıtık sistemlerde pratikte hayır; aracılar en az bir kez ya da en çok bir kez teslim eder. Gerçekçi hedef "en az bir kez teslim + idempotent işleme"dir; bu birleşim etkide bir kezlik (effectively-once) sağlar.'}
  ],
  'mistakes': [
    {'why': 'TTL\'siz önbellek anahtarları sonsuza dek büyür ve geçersizleştirmesi unutulan veri hiç tazelenmez.', 'bad': 'r.set(f"menu:{rid}", json.dumps(menu))', 'good': 'r.set(f"menu:{rid}", json.dumps(menu), ex=300 + random.randint(0, 30))'},
    {'why': 'Kilidi token kontrolü olmadan silmek, süresi dolup başkasına geçmiş kilidi de siler.', 'bad': 'r.set("kilit:42", "1", nx=True, px=30000)\nis_yap()\nr.delete("kilit:42")', 'good': 'token = secrets.token_hex(16)\nr.set("kilit:42", token, nx=True, px=30000)\nis_yap()\nbirak_lua(keys=["kilit:42"], args=[token])   # get == token ise del'},
    {'why': 'Yan etkili görevi idempotent yazmamak, yeniden teslimde çift ödeme/SMS demektir.', 'bad': '@app.task(acks_late=True)\ndef iade(siparis_id, tutar):\n    hesap.yatir(tutar)', 'good': '@app.task(acks_late=True)\ndef iade(siparis_id, tutar):\n    if not r.set(f"idem:iade:{siparis_id}", "1", nx=True, ex=86400):\n        return\n    hesap.yatir(tutar)'},
    {'why': 'Sabit aralıklı ve sınırsız yeniden deneme, arızalı servisi tüm işçilerle aynı anda dövmeye devam eder.', 'bad': 'while True:\n    try:\n        return gonder()\n    except Exception:\n        time.sleep(1)', 'good': '@app.task(autoretry_for=(ConnectionError,), retry_backoff=2,\n          retry_backoff_max=300, retry_jitter=True, max_retries=5)'},
    {'why': 'Uzun işi HTTP isteği içinde yapmak yanıtı geciktirir ve dış servis hatası isteği düşürür.', 'bad': 'def siparis_ver(request):\n    s = Siparis.objects.create(...)\n    sms.gonder(s.musteri.tel, "Siparişin alındı")\n    return JsonResponse(...)', 'good': 'def siparis_ver(request):\n    s = Siparis.objects.create(...)\n    transaction.on_commit(lambda: sms_gonder.delay(s.id))\n    return JsonResponse(..., status=201)'}
  ]
}

emit(lesson, '/home/claude/py/v2/n4/redis-kuyruk.js')
