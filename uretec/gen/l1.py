import sys
sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/gen')
from emit import PY, CODE, write

body = '''
<h2>Neden sistem tasarımı?</h2>
<p>Bir fonksiyonu doğru yazmak ile bir <b>sistemi</b> doğru kurmak farklı becerilerdir. Lezzet Kurye akşam 19:00'da binlerce sipariş alır; restoran tableti donarsa, ödeme sağlayıcısı yavaşlarsa ya da veritabanı diski dolarsa müşteri yalnızca "uygulama çalışmıyor" der. Sistem tasarımı (system design), bu tür yükleri ve arızaları <b>önceden</b> düşünüp bileşenleri (servis, veritabanı, önbellek, kuyruk) doğru yere koyma işidir. Orta ve kıdemli backend mülakatlarının neredeyse hepsinde 45 dakikalık bir tasarım oturumu vardır; işte de her yeni özellik küçük bir tasarım belgesiyle başlar.</p>
<p>Bu derste ezber mimari şemalar yerine <b>hesap yapan ve simülasyon kuran</b> bir yaklaşım izleyeceksin: kaba kapasite tahmini, tutarlı hash, önbellek, circuit breaker, idempotent ödeme ve sipariş durum makinesi gibi parçaları Python ile modelleyeceksin. Gerçek teknolojilerin (Redis, Kafka, PostgreSQL, Nginx) kodunu gri kutularda göreceksin; mantığını ise tarayıcıda çalışan sahte sınıflarla deneyeceksin.</p>

<h2>1. Gereksinim çıkarma ve kaba tahmin</h2>
<p>Tasarıma kutu çizerek değil <b>soru sorarak</b> başlanır. İşlevsel gereksinimler (functional requirements) sistemin ne yaptığıdır: "müşteri sipariş verir, kurye konum paylaşır". İşlevsel olmayan gereksinimler (non-functional requirements) ise nasıl yaptığıdır: gecikme hedefi, erişilebilirlik (availability), tutarlılık, maliyet. Ardından kaba tahmin (back-of-the-envelope estimation) gelir: saniyedeki istek (QPS, queries per second), depolama ve bant genişliği.</p>
<div class="tbl-wrap"><table>
<tr><th>Akılda tutulacak sayı</th><th>Yaklaşık değer</th><th>Kullanım</th></tr>
<tr><td>Bir gün</td><td>86 400 sn ≈ 10<sup>5</sup> sn</td><td>Günlük istek / 10<sup>5</sup> ≈ ortalama QPS</td></tr>
<tr><td>Tepe çarpanı</td><td>Ortalamanın 2–10 katı</td><td>Yemek siparişinde akşam tepesi çok sivridir</td></tr>
<tr><td>Bellekten okuma</td><td>Mikrosaniyeler</td><td>Önbellek neden hızlı?</td></tr>
<tr><td>Aynı veri merkezinde ağ turu</td><td>~0,5 ms</td><td>Servisler arası çağrı maliyeti</td></tr>
<tr><td>SSD'den rastgele okuma</td><td>~0,1 ms</td><td>Veritabanı indeks okuması</td></tr>
<tr><td>Kıtalar arası ağ turu</td><td>~100–150 ms</td><td>CDN neden gerekli?</td></tr>
<tr><td>%99,9 erişilebilirlik</td><td>Yılda ~8,8 saat kesinti</td><td>SLA pazarlığı</td></tr>
</table></div>
''' + PY(r'''
GUNLUK_SIPARIS = 2_000_000   # hedef: günde 2 milyon sipariş
TEPE_CARPANI = 7             # akşam tepesi ortalamanın ~7 katı
OKUMA_ORANI = 20             # her siparişe ~20 okuma (menü, durum, takip)
KAYIT_KB = 2                 # bir sipariş kaydı ~2 KB
SANIYE_GUN = 24 * 60 * 60

yazma_qps = GUNLUK_SIPARIS / SANIYE_GUN
tepe_yazma = yazma_qps * TEPE_CARPANI
tepe_okuma = tepe_yazma * OKUMA_ORANI
yillik_gb = GUNLUK_SIPARIS * KAYIT_KB * 365 / 1024 / 1024

print(f"Ortalama yazma : {yazma_qps:,.0f}/sn")
print(f"Tepe yazma     : {tepe_yazma:,.0f}/sn")
print(f"Tepe okuma     : {tepe_okuma:,.0f}/sn")
print(f"Yıllık veri    : {yillik_gb:,.0f} GB")
''') + '''
<p>Sonuçlar kesin değil, <b>büyüklük mertebesi</b> (order of magnitude) önemli: saniyede 160 yazma tek bir PostgreSQL sunucusu için rahattır; saniyede 3 000 okuma için ise önbellek ve okuma replikası düşünmeye başlarsın. Tepe çarpanını uydurmak yerine gerçek veriden ölçebilirsin. Lezzet Kurye'nin sipariş tablosunda saatlik dağılıma bakalım:</p>
''' + PY(r'''
import veri
from collections import Counter

siparisler = veri.kayitlar("lezzet_kurye", "lk_orders")
saatlik = Counter(s["placed_at"][:13] for s in siparisler)   # "2024-11-10 20"
gun_sayisi = len({s["placed_at"][:10] for s in siparisler})
ortalama = len(siparisler) / (gun_sayisi * 24)
tepe_saat, tepe = saatlik.most_common(1)[0]
print(f"{len(siparisler)} sipariş, {gun_sayisi} gün")
print(f"Saatlik ortalama {ortalama:.2f}, en yoğun saat {tepe_saat}: {tepe}")
print(f"Tepe çarpanı ≈ {tepe / ortalama:.1f}")
''') + '''
<div class="tip"><b>Mülakatta yüksek sesle hesapla</b>Değerlendirici kesin sayıyı değil, varsayımlarını açıkça söyleyip yuvarlayarak ilerlemeni ister: "Günde 2 milyon, yaklaşık 10<sup>5</sup> saniye; ortalama 20 QPS... hayır, 2·10<sup>6</sup>/10<sup>5</sup> = 20 değil, 2·10<sup>6</sup>/8,64·10<sup>4</sup> ≈ 23". Kendi hatanı yakalaman artı puandır.</div>

<h2>2. Ölçekleme: dikey, yatay ve durumsuz servis</h2>
<p><b>Dikey ölçekleme</b> (scale up) sunucuya daha çok CPU/RAM eklemektir: basit ama tavanı ve tek arıza noktası vardır. <b>Yatay ölçekleme</b> (scale out) aynı servisten çok kopya çalıştırıp önüne <b>yük dengeleyici</b> (load balancer) koymaktır. Yatay ölçeklemenin ön koşulu servisin <b>durumsuz</b> (stateless) olmasıdır: oturum, sepet ya da yüklenen dosya sunucunun belleğinde değil, ortak bir depoda (Redis, veritabanı, nesne deposu) durur. Böylece herhangi bir istek herhangi bir kopyaya gidebilir ve bir kopya ölünce kimse fark etmez.</p>
<div class="tbl-wrap"><table>
<tr><th>Dengeleme stratejisi</th><th>Nasıl seçer?</th><th>Ne zaman?</th></tr>
<tr><td>Sırayla (round robin)</td><td>Sıradaki sunucu</td><td>İstekler benzer maliyetteyse</td></tr>
<tr><td>En az bağlantı (least connections)</td><td>Açık isteği en az olan</td><td>Uzun süren isteklerde</td></tr>
<tr><td>Hash (IP, kullanıcı)</td><td>Aynı anahtar aynı sunucuya</td><td>Yerel önbellek isabeti önemliyse</td></tr>
</table></div>
''' + CODE(r'''
# nginx.conf — üç uygulama kopyasının önünde yük dengeleyici
upstream siparis_api {
    least_conn;
    server 10.0.0.11:8000 max_fails=3 fail_timeout=10s;
    server 10.0.0.12:8000 max_fails=3 fail_timeout=10s;
    server 10.0.0.13:8000 max_fails=3 fail_timeout=10s;
}
server {
    listen 80;
    location / { proxy_pass http://siparis_api; proxy_read_timeout 5s; }
}
''') + '''
<div class="note"><b>Kendi bilgisayarında dene</b>Nginx ve Docker Compose ile üç kopyalı bir FastAPI servisi kurmayı <code>docker-deploy</code> dersinde gördün. <code>docker compose up --scale api=3</code> ile kopyaları artırıp yukarıdaki yapılandırmayı deneyebilirsin.</div>

<h2>3. Önbellek katmanları ve CDN</h2>
<p>Okuma yazmadan çok fazlaysa önbellek (cache) ilk silahtır. En yaygın kalıp <b>cache-aside</b> (tembel yükleme): uygulama önce önbelleğe bakar, yoksa veritabanından okur ve önbelleğe <b>TTL</b> (yaşam süresi) ile yazar. Statik dosyalar (menü fotoğrafları, JS) kullanıcıya yakın sunuculardan, yani <b>CDN</b>'den (Content Delivery Network) servis edilir. Katmanlar: tarayıcı → CDN → uygulama içi bellek → dağıtık önbellek (Redis) → veritabanı.</p>
''' + PY(r'''
class TTLOnbellek:
    def __init__(self, ttl, saat):
        self.ttl, self.saat, self.veri = ttl, saat, {}
        self.isabet = self.kacirma = 0

    def al(self, anahtar, yukle):
        simdi = self.saat()
        kayit = self.veri.get(anahtar)
        if kayit and simdi - kayit[1] < self.ttl:
            self.isabet += 1
            return kayit[0]
        self.kacirma += 1
        deger = yukle(anahtar)              # veritabanına git
        self.veri[anahtar] = (deger, simdi)
        return deger

zaman = [0, 1, 2, 31, 32]
saat = iter(zaman).__next__
menu = TTLOnbellek(ttl=30, saat=saat)
for _ in zaman:
    menu.al("restoran:5", lambda k: f"{k} menüsü (DB)")
print("isabet:", menu.isabet, "kaçırma:", menu.kacirma)
''') + '''
<div class="warn"><b>Önbelleğin iki zor problemi</b>1) <b>Geçersiz kılma</b> (invalidation): fiyat değişince eski menü 30 saniye daha görünür; kabul edilebilir mi? Kritik veride yazınca anahtarı silmek gerekir. 2) <b>Sürü etkisi</b> (thundering herd / cache stampede): popüler bir anahtarın süresi dolunca yüzlerce istek aynı anda veritabanına koşar; çözüm kilit, erken yenileme ya da TTL'ye rastgele sapma eklemektir.</div>
''' + CODE(r'''
# Gerçek dünyada: redis-py ile cache-aside (pip install redis)
import json, redis
r = redis.Redis(host="localhost", port=6379)

def menu_getir(restoran_id, db):
    anahtar = f"menu:{restoran_id}"
    if (veri := r.get(anahtar)) is not None:
        return json.loads(veri)
    menu = db.menu_oku(restoran_id)
    r.set(anahtar, json.dumps(menu), ex=300)   # 5 dk TTL
    return menu
''') + '''

<h2>4. Veri katmanı: replikasyon, sharding ve tutarlı hash</h2>
<p><b>Replikasyon</b> (replication) verinin kopyalarını tutmaktır. Lider-takipçi (leader-follower) düzeninde yazmalar lidere gider, okumalar takipçilere dağıtılır. Takipçiler birkaç milisaniye-saniye geride kalabilir (replication lag): müşteri adresini güncelleyip sayfayı yenilediğinde eski adresi görebilir. Bunun yaygın çözümü "kendi yazdığını oku" (read-your-writes) kuralıdır: kullanıcı yeni yazdıysa bir süre onun okumalarını lidere yönlendir.</p>
<p><b>Sharding</b> (bölümleme) veri tek makineye sığmadığında veriyi anahtara göre parçalara ayırmaktır. Aralık bazlı (A–M, N–Z) bölümleme sıcak noktalar üretebilir; hash bazlı bölümleme dengelidir. Ama naif <code>hash(anahtar) % N</code> yönteminin büyük bir kusuru var: sunucu sayısı değişince anahtarların neredeyse tamamı yer değiştirir. <b>Tutarlı hash</b> (consistent hashing) anahtarları ve sunucuları aynı halkaya yerleştirir; her anahtar saat yönünde ilk sunucuya gider. Yeni sunucu eklenince yalnız onun komşu dilimindeki anahtarlar taşınır. Dengeyi sağlamak için her sunucu halkaya birçok <b>sanal düğüm</b> (virtual node) ile konur.</p>
''' + PY(r'''
import hashlib, bisect

def ozet(s):
    return int(hashlib.md5(s.encode()).hexdigest(), 16)   # süreçten bağımsız, kararlı

anahtarlar = [f"siparis-{i}" for i in range(3000)]
mod3 = {a: ozet(a) % 3 for a in anahtarlar}
mod4 = {a: ozet(a) % 4 for a in anahtarlar}
print("mod N ile taşınan:", sum(mod3[a] != mod4[a] for a in anahtarlar))

def halka_kur(dugumler, sanal=100):
    halka = sorted((ozet(f"{d}#{i}"), d) for d in dugumler for i in range(sanal))
    return [h for h, _ in halka], [d for _, d in halka]

def bul(halka, anahtar):
    noktalar, sahipler = halka
    i = bisect.bisect(noktalar, ozet(anahtar)) % len(noktalar)
    return sahipler[i]

h3, h4 = halka_kur("ABC"), halka_kur("ABCD")
tasinan = [a for a in anahtarlar if bul(h3, a) != bul(h4, a)]
print("tutarlı hash ile taşınan:", len(tasinan), "→ hepsi", set(bul(h4, a) for a in tasinan))
''') + '''
<p>3 000 anahtarın mod N ile yaklaşık dörtte üçü taşınırken tutarlı hash ile yalnız yeni düğüme düşen ~dörtte biri taşınır. Cassandra, DynamoDB ve birçok dağıtık önbellek istemcisi bu fikri kullanır.</p>
<h3>CAP ve PACELC</h3>
<p><b>CAP</b> teoremi: ağ bölünmesi (Partition) olduğunda sistem ya <b>tutarlılık</b> (Consistency: herkes son yazılanı görür) ya da <b>erişilebilirlik</b> (Availability: her istek cevap alır) seçer. <b>PACELC</b> bunu tamamlar: bölünme yokken (Else) bile <b>gecikme</b> (Latency) ile tutarlılık arasında seçim yaparsın.</p>
<div class="tbl-wrap"><table>
<tr><th>Veri</th><th>Seçim</th><th>Gerekçe</th></tr>
<tr><td>Cüzdan bakiyesi, ödeme</td><td>Tutarlılık (CP)</td><td>Çift harcama kabul edilemez; gerekirse hata ver</td></tr>
<tr><td>Restoran puanı, beğeni sayısı</td><td>Erişilebilirlik (AP)</td><td>Birkaç saniye eski olması sorun değil</td></tr>
<tr><td>Kurye konumu</td><td>Düşük gecikme (EL)</td><td>2 saniye eski konum, bekleyen bir cevaptan iyidir</td></tr>
</table></div>

<h2>5. Kuyruklar ve olay güdümlü mimari</h2>
<p><b>Senkron</b> iletişimde servis A, B'nin cevabını bekler (HTTP/gRPC). <b>Asenkron</b> iletişimde A bir mesajı kuyruğa (RabbitMQ, Kafka, Redis Streams, SQS) bırakır ve devam eder; B kendi hızında tüketir. Sipariş verildiğinde müşteriye "alındı" demek için SMS, fatura, puan ve analitik işlerinin bitmesini beklemek gerekmez: "siparis_olustu" olayı (event) yayınlanır, her servis kendi işini yapar. Bu <b>olay güdümlü</b> (event-driven) mimari servisleri birbirinden ayırır ve tepe yükü kuyrukta biriktirerek yumuşatır.</p>
<p>Bedeli: mesajlar <b>en az bir kez</b> (at-least-once) teslim edilir, yani aynı olay iki kez gelebilir. Bu yüzden tüketiciler <b>idempotent</b> olmalıdır (aynı olayı ikinci kez işlemek sonucu değiştirmemeli). Ödeme gibi dış çağrılarda istemci her isteğe bir <b>idempotency key</b> ekler; sunucu aynı anahtarı gördüğünde ilk sonucu döndürür. Veritabanına yazıp olayı yayınlamak arasında çökme olursa olay kaybolmasın diye olaylar aynı işlemde bir "giden kutusu" (outbox) tablosuna yazılır ve ayrı bir süreç onları kuyruğa aktarır (transactional outbox).</p>

<h2>6. Dayanıklılık: zaman aşımı, retry, circuit breaker, backpressure</h2>
<p>Dağıtık sistemde bir bağımlılık er geç yavaşlar. <code>http-api</code> dersinde gördüğün <b>zaman aşımı</b> (timeout) ve <b>üstel geri çekilmeli yeniden deneme</b> (exponential backoff + jitter) ilk savunmadır. Ama ödeme sağlayıcısı tamamen çökmüşse her isteği 3 kez denemek yükü üçe katlar. <b>Circuit breaker</b> (sigorta) üst üste hatalardan sonra "açılır" ve bir süre çağrıyı hiç yapmadan hızlıca hata döndürür; süre dolunca "yarı açık" duruma geçip tek bir deneme isteğine izin verir; başarılıysa kapanır, değilse yeniden açılır.</p>
''' + PY(r'''
class SigortaAcik(Exception):
    pass

class Sigorta:
    def __init__(self, esik=3, bekleme=10):
        self.esik, self.bekleme = esik, bekleme
        self.durum, self.hata, self.acilma = "kapali", 0, None

    def cagir(self, fn, t):
        if self.durum == "acik" and t - self.acilma >= self.bekleme:
            self.durum = "yari_acik"
        if self.durum == "acik":
            raise SigortaAcik("bağımlılık dinleniyor")
        try:
            sonuc = fn()
        except Exception:
            self.hata += 1
            if self.durum == "yari_acik" or self.hata >= self.esik:
                self.durum, self.acilma = "acik", t
            raise
        self.durum, self.hata = "kapali", 0
        return sonuc

def odeme_coktu():
    raise ConnectionError("ödeme servisi cevap vermiyor")

s = Sigorta(esik=3, bekleme=10)
for t, fn in [(0, odeme_coktu), (1, odeme_coktu), (2, odeme_coktu), (3, odeme_coktu), (13, lambda: "onay")]:
    try:
        print(t, s.cagir(fn, t), s.durum)
    except Exception as e:
        print(t, type(e).__name__, s.durum)
''') + '''
<p><b>Backpressure</b> (geri basınç) üreticinin tüketiciden hızlı olduğu durumda sistemin "yavaşla" diyebilmesidir: sınırlı kuyruk dolunca yeni işi reddetmek (HTTP 429/503), hız sınırlama (rate limiting, ör. token bucket) ya da üreticiyi bekletmek. Sınırsız kuyruk backpressure değildir; yalnızca belleğin dolmasını erteler. <b>Bulkhead</b> (bölme) ise farklı bağımlılıklar için ayrı bağlantı havuzları kullanarak birinin tükenmesinin diğerlerini boğmasını engeller.</p>

<h2>7. Örnek tasarımlar</h2>
<h3>URL kısaltıcı</h3>
<p>Okuma ağırlıklıdır (bir link milyonlarca kez açılır). Kısa kod, artan bir sayacın <b>base62</b> gösterimidir (0-9, a-z, A-Z): 7 karakter 62<sup>7</sup> ≈ 3,5 trilyon link demektir. Kod → URL eşlemesi anahtar-değer deposunda tutulur, popüler kodlar önbellekte durur, yönlendirme 301/302 ile yapılır. Sayacın tek arıza noktası olmaması için her sunucuya sayı blokları dağıtılır.</p>
''' + PY(r'''
ALFABE = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

def kodla(n):
    if n == 0:
        return ALFABE[0]
    parcalar = []
    while n:
        n, kalan = divmod(n, 62)
        parcalar.append(ALFABE[kalan])
    return "".join(reversed(parcalar))

for sayi in [61, 62, 125, 3_521_614_606_207]:
    print(sayi, "→", kodla(sayi))
''') + '''
<h3>Bildirim servisi</h3>
<p>Diğer servisler "şu kullanıcıya şu şablonla bildir" olayı yayınlar. Bildirim servisi kullanıcı tercihlerine (SMS mi, push mu, sessiz saatler) bakar, kanal başına ayrı kuyruklara dağıtır, sağlayıcı hız sınırlarına uyar, başarısızları geri çekilmeyle yeniden dener ve olay numarasıyla tekrarları eler (aynı SMS'in iki kez gitmesi müşteri şikâyetidir).</p>
<h3>Lezzet Kurye sipariş akışı</h3>
<div class="steps-list"><ol>
<li><b>Sipariş API</b> isteği idempotency key ile alır; sepeti doğrular, siparişi <code>olusturuldu</code> durumunda yazar ve aynı işlemde outbox'a <code>siparis_olustu</code> olayını ekler.</li>
<li><b>Ödeme servisi</b> olayı tüketir, sağlayıcıyı circuit breaker arkasından çağırır; sonuç olayını yayınlar.</li>
<li><b>Restoran servisi</b> tablete bildirim gönderir; restoran onaylayınca durum <code>hazirlaniyor</code> olur.</li>
<li><b>Kurye atama servisi</b> yakındaki uygun kuryeleri (konum indeksi, ör. geohash) bulur, teklif gönderir; kabul edilince <code>yolda</code>.</li>
<li>Teslimde <code>teslim</code>; her geçiş bir olaydır. Bildirim, analitik ve puanlama servisleri bu olayları bağımsız tüketir.</li>
</ol></div>
<p>Durumlar arasındaki izinli geçişleri bir <b>durum makinesi</b> (state machine) ile açıkça tanımlamak, "teslim edilmiş sipariş iptal edildi" gibi imkânsız durumları kod düzeyinde engeller.</p>

<h2>8. Tasarım mülakatı: format ve rubrik</h2>
<div class="tbl-wrap"><table>
<tr><th>Süre</th><th>Adım</th><th>Değerlendirici neye bakar?</th></tr>
<tr><td>5 dk</td><td>Gereksinimleri netleştir</td><td>Doğru soruları sordun mu, kapsamı daralttın mı?</td></tr>
<tr><td>5 dk</td><td>Kaba tahmin</td><td>QPS, depolama, okuma/yazma oranı mantıklı mı?</td></tr>
<tr><td>10 dk</td><td>Üst düzey tasarım ve API</td><td>Bileşenler ve veri akışı tutarlı mı?</td></tr>
<tr><td>15 dk</td><td>Derinleşme (veri modeli, ölçekleme, darboğaz)</td><td>Ödünleşimleri (trade-off) gerekçelendirebiliyor musun?</td></tr>
<tr><td>5 dk</td><td>Arızalar, izleme, özet</td><td>Tek arıza noktası, gözlemlenebilirlik, gelecekteki büyüme</td></tr>
</table></div>
<div class="note"><b>Gerçek işte</b>Şirketlerde tasarım genelde bir RFC ya da "tasarım belgesi" ile yürür: bağlam, hedefler ve hedef olmayanlar, alternatifler ve neden elendikleri, kapasite tahmini, geçiş planı, izleme ve geri dönüş planı. Ekip belgeyi yorumlar, ardından küçük bir prototip ve yük testiyle varsayımlar doğrulanır. En pahalı hatalar yanlış teknolojiden değil, sorulmamış bir gereksinimden ("iptal edilen siparişin parası kaç dakikada iade edilmeli?") çıkar.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Dağıtık işlemler ve saga</h3>
<p>Sipariş, ödeme ve stok farklı veritabanlarındaysa tek bir ACID işlem yoktur. <b>Saga</b> kalıbı her adımı yerel bir işlem olarak yapar ve hata olursa önceki adımları <b>telafi eden işlemlerle</b> (ödemeyi iade et, stoğu geri ekle) geri alır. Koreografi (olaylarla) ya da orkestrasyon (merkezi bir yönetici) ile kurulur.</p>
<h3>CQRS ve okuma modelleri</h3>
<p>Yazma modeli normalleştirilmiş kalırken okuma için olaylardan beslenen ayrı, sorguya hazır tablolar (materialized view) tutulur. Restoran paneli "bugünkü siparişlerim" sorgusunu ağır JOIN'ler yerine hazır bir tablodan okur. Bedeli: okuma modeli birkaç saniye gecikmeli tutarlıdır (eventual consistency).</p>
<h3>Ölçmeden ölçekleme</h3>
<p>Tasarım varsayımlarını yük testiyle (Locust, k6) doğrula, p50/p95/p99 gecikmeyi izle; <code>gozlemlenebilirlik</code> yaklaşımıyla SLO'ları tanımla. Çoğu sistem ilk gün tek bir veritabanı ve birkaç uygulama kopyasıyla gayet iyi çalışır; sharding'i gerçekten gerektiğinde, ölçüme dayanarak ekle.</p>
</section>
'''

ex = []
ex.append(dict(t='mc', stage='Isınma',
    q='Bir servis günde 8 640 000 istek alıyor ve yük gün boyunca eşit dağılıyor. Ortalama QPS (saniyedeki istek) yaklaşık kaçtır?',
    o=['10', '100', '1 000', '8 640'], a=1,
    why='Bir gün 86 400 saniyedir; 8 640 000 / 86 400 = 100. Gerçekte yük eşit dağılmaz; tasarımda tepe çarpanıyla (ör. ×5) tepe QPS de hesaplanır.'))
ex.append(dict(t='mc', stage='Isınma',
    q='Sipariş API\'sini 3 kopyaya çıkardın ama kullanıcılar zaman zaman sepetlerinin boşaldığını söylüyor. En olası neden?',
    o=['Yük dengeleyici round robin yerine least connections stratejisini kullanmalıydı',
       'Sepet sunucunun belleğinde tutuluyor; istek başka kopyaya gidince görünmüyor',
       'Üç kopya fazla geliyor; onun yerine sunucu dikey olarak ölçeklenmeliydi',
       'Veritabanı replikasyonu açık olduğu için sepet kayıtları arada siliniyor'], a=1,
    why='Yatay ölçeklemenin ön koşulu durumsuz servistir. Oturum ve sepet gibi durum ortak bir depoda (Redis, veritabanı) tutulmalıdır; yoksa her kopya farklı bir "gerçek" görür. Yapışkan oturum (sticky session) geçici bir yamadır.'))
ex.append(dict(t='mc', stage='Isınma',
    q='Ağ bölünmesi sırasında Lezzet Kurye cüzdan bakiyesi için hangi davranış doğrudur?',
    o=['Her iki tarafta da harcamaya izin ver; bölünme bitince farkı kapatırsın',
       'Bakiyenin kesin bilinemediği tarafta harcamayı reddet ya da beklet (tutarlılığı seç)',
       'Bakiyeyi önbellekten oku; önbellek her zaman erişilebilirdir',
       'CAP teoremi yalnızca NoSQL veritabanlarında geçerlidir, burada önemsizdir'], a=1,
    why='Para hareketinde çift harcama kabul edilemez; bu yüzden bölünmede tutarlılık (CP) seçilir ve emin olunamayan istek reddedilir. Beğeni sayısı gibi verilerde ise erişilebilirlik tercih edilebilir.'))
ex.append(dict(t='predict', stage='Kodu oku',
    q='Naif <code>anahtar % N</code> sharding\'de sunucu sayısı 4\'ten 5\'e çıkıyor. Bu kod ne yazdırır?',
    code='tasinan = sum(1 for k in range(1000) if k % 4 != k % 5)\nprint(tasinan)\n',
    o=['200', '250', '800', '1000'], a=2,
    why='k % 4 ile k % 5 yalnızca k mod 20 ∈ {0, 1, 2, 3} olduğunda eşittir (20\'de 4, yani %20). Anahtarların %80\'i taşınır. Tutarlı hash bu oranı yaklaşık 1/5\'e indirir.'))
ex.append(dict(t='predict', stage='Kodu oku',
    q='Basit bir cache-aside önbelleği. Bu kod ne yazdırır?',
    code='onbellek = {}\ndb_okuma = 0\n\ndef getir(k):\n    global db_okuma\n    if k not in onbellek:\n        db_okuma += 1\n        onbellek[k] = k.upper()\n    return onbellek[k]\n\nfor k in ["menu5", "menu7", "menu5", "menu5", "menu9", "menu7"]:\n    getir(k)\nprint(db_okuma, len(onbellek))\n',
    o=['6 3', '3 3', '3 6', '2 3'], a=1,
    why='Her farklı anahtar yalnız ilk istekte veritabanına gider: menu5, menu7, menu9 → 3 okuma; önbellekte 3 anahtar kalır. 6 istekten 3\'ü isabet, isabet oranı %50.'))
ex.append(dict(t='predict', stage='Kodu oku',
    q='Bu basit sigorta (circuit breaker) sayacı ne yazdırır?',
    code='class Sigorta:\n    def __init__(self, esik):\n        self.esik, self.hata, self.durum = esik, 0, "kapalı"\n\n    def kaydet(self, basarili):\n        if basarili:\n            self.hata = 0\n        else:\n            self.hata += 1\n            if self.hata >= self.esik:\n                self.durum = "açık"\n        return self.durum\n\ns = Sigorta(3)\nprint([s.kaydet(b)[0] for b in [False, False, True, False, False, False]])\n',
    o=["['k', 'k', 'k', 'k', 'k', 'a']", "['k', 'k', 'a', 'a', 'a', 'a']", "['k', 'k', 'k', 'a', 'a', 'a']", "['k', 'k', 'k', 'k', 'a', 'a']"], a=0,
    why='Üçüncü çağrıdaki başarı sayacı sıfırlar. Sonra üç ardışık hata gerekir; eşik ancak altıncı çağrıda aşılır. Sigortalar genelde "ardışık" hata sayar ki seyrek hatalar devreyi açmasın.'))
ex.append(dict(t='order', stage='Kodu oku',
    q='<p>URL kısaltıcı için bir sayıyı base62 koda çeviren programın satırlarını sırala.</p>',
    lines=['ALFABE = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"',
           'def kodla(n, alfabe=ALFABE):',
           '    parcalar = []',
           '    while n > 0:',
           '        n, kalan = divmod(n, 62)',
           '        parcalar.append(alfabe[kalan])',
           '    return "".join(reversed(parcalar))',
           'print(kodla(125), kodla(3843))'],
    expect='21 ZZ\n',
    hint='Varsayılan argüman tanım anında değerlendirilir; ALFABE önce tanımlanmalı. Basamaklar sondan başa üretildiği için ters çevrilir.',
    why='divmod her adımda son basamağı (kalan) ve kalan sayıyı verir: 125 = 2·62 + 1 → "21"; 3843 = 61·62 + 61 → "ZZ".'))

ex.append(dict(t='code', id='sistem-tasarimi-1', stage='Rehberli', diff=1,
    q='<p>Kaba kapasite hesabı. <code>kapasite(gunluk_istek, tepe_carpani, kayit_kb, saklama_gun)</code> şu anahtarlarla bir sözlük döndürsün:</p><ul><li><code>ort_qps</code>: günlük istek / 86 400, 1 ondalığa yuvarlı</li><li><code>tepe_qps</code>: ort_qps (yuvarlanmamış) × tepe_carpani, 1 ondalığa yuvarlı</li><li><code>depolama_gb</code>: gunluk_istek × kayit_kb × saklama_gun / (1024 × 1024), 2 ondalığa yuvarlı</li></ul>',
    guide=['Bir gündeki saniye sayısını sabit olarak yaz: 24 * 60 * 60.', 'Ortalama QPS\'yi hesapla ama yuvarlamayı en sonda yap.', 'Tepe QPS = ortalama × çarpan.', 'KB → GB için iki kez 1024\'e böl; sonuçları round ile sözlüğe koy.'],
    example='gunluk_ziyaret = 432_000\nsaniye = 24 * 60 * 60\nprint(round(gunluk_ziyaret / saniye, 1), "ziyaret/sn")\n',
    start='SANIYE_GUN = 24 * 60 * 60\n\ndef kapasite(gunluk_istek, tepe_carpani, kayit_kb, saklama_gun):\n    ort = gunluk_istek / SANIYE_GUN\n    # TODO: tepe ve depolama hesapla\n    return {"ort_qps": round(ort, 1)}\n',
    sol='SANIYE_GUN = 24 * 60 * 60\n\ndef kapasite(gunluk_istek, tepe_carpani, kayit_kb, saklama_gun):\n    ort = gunluk_istek / SANIYE_GUN\n    tepe = ort * tepe_carpani\n    depolama = gunluk_istek * kayit_kb * saklama_gun / (1024 * 1024)\n    return {"ort_qps": round(ort, 1), "tepe_qps": round(tepe, 1), "depolama_gb": round(depolama, 2)}\n',
    tests='r = kapasite(2_000_000, 7, 2, 365)\nassert r["ort_qps"] == 23.1, f"2 milyon/86400 ≈ 23.1 olmalı, gelen {r.get(\'ort_qps\')}"\nassert r.get("tepe_qps") == 162.0, f"Tepe 23.15 × 7 ≈ 162.0 olmalı (yuvarlamayı en sonda yap), gelen {r.get(\'tepe_qps\')}"\nassert r.get("depolama_gb") == 1392.36, f"2e6 × 2 KB × 365 gün ≈ 1392.36 GB olmalı, gelen {r.get(\'depolama_gb\')}"\nr2 = kapasite(86_400, 3, 1, 1)\nassert r2 == {"ort_qps": 1.0, "tepe_qps": 3.0, "depolama_gb": 0.08}, f"Basit durum yanlış: {r2}"\n',
    hints=['Tepe QPS\'yi yuvarlanmış ort_qps ile değil, ham ort ile çarp; yoksa 23.1 × 7 = 161.7 çıkar.', 'depolama = gunluk_istek * kayit_kb * saklama_gun / (1024 * 1024)'],
    why='Kaba tahminde ara sonuçları yuvarlamak hatayı büyütür; yuvarlamayı rapor ederken yap. Bu üç sayı (ortalama, tepe, depolama) tasarımın geri kalanını belirler.'))

ex.append(dict(t='code', id='sistem-tasarimi-2', stage='Rehberli', diff=2,
    q='<p>Tepe çarpanını gerçek veriden ölç. <code>tepe_analizi(siparisler)</code>: her siparişin <code>placed_at</code> alanının ilk 13 karakteri ("2024-11-10 20") saat anahtarıdır. Şu demeti döndür: <code>(tepe_saat, tepe_adet, carpan)</code>. <code>carpan</code> = tepe_adet / saatlik ortalama; saatlik ortalama = sipariş sayısı / (farklı gün sayısı × 24); 2 ondalığa yuvarla. Eşit tepe varsa en erken saati seç. Testler Lezzet Kurye\'nin gerçek <code>lk_orders</code> tablosunu kullanır.</p>',
    guide=['Counter ile saat anahtarlarını say.', 'Farklı günleri bir kümeyle bul (placed_at[:10]).', 'En yüksek adedi bul; o adede sahip saatlerin en küçüğünü seç.', 'Çarpanı hesaplayıp round(..., 2) ile döndür.'],
    example='from collections import Counter\nzamanlar = ["2024-01-01 12:05", "2024-01-01 12:40", "2024-01-02 19:10"]\nc = Counter(z[:13] for z in zamanlar)\nen_cok = max(c.values())\nprint(min(k for k, v in c.items() if v == en_cok), en_cok)\n',
    start='from collections import Counter\nimport veri\n\ndef tepe_analizi(siparisler):\n    saatlik = Counter(s["placed_at"][:13] for s in siparisler)\n    # TODO: gün sayısı, tepe saat (eşitlikte en erken), çarpan\n    return None\n\nsiparisler = veri.kayitlar("lezzet_kurye", "lk_orders")\nprint(tepe_analizi(siparisler))\n',
    sol='from collections import Counter\nimport veri\n\ndef tepe_analizi(siparisler):\n    saatlik = Counter(s["placed_at"][:13] for s in siparisler)\n    gunler = {s["placed_at"][:10] for s in siparisler}\n    tepe_adet = max(saatlik.values())\n    tepe_saat = min(k for k, v in saatlik.items() if v == tepe_adet)\n    ortalama = len(siparisler) / (len(gunler) * 24)\n    return (tepe_saat, tepe_adet, round(tepe_adet / ortalama, 2))\n\nsiparisler = veri.kayitlar("lezzet_kurye", "lk_orders")\nprint(tepe_analizi(siparisler))\n',
    tests='import veri\nsp = veri.kayitlar("lezzet_kurye", "lk_orders")\nr = tepe_analizi(sp)\nassert r is not None and r[:2] == ("2024-11-10 20", 23), f"Gerçek veride en yoğun saat 2024-11-10 20 (23 sipariş) olmalı, gelen {r}"\nassert r[2] == 7.15, f"7178 sipariş / (93 gün × 24) ≈ 3.22; 23 / 3.22 ≈ 7.15 olmalı, gelen {r[2]}"\nkucuk = [{"placed_at": "2024-01-01 12:00:00"}, {"placed_at": "2024-01-01 19:00:00"}, {"placed_at": "2024-01-02 12:30:00"}, {"placed_at": "2024-01-02 12:45:00"}, {"placed_at": "2024-01-01 12:10:00"}]\nassert tepe_analizi(kucuk)[:2] == ("2024-01-01 12", 2), "Eşitlikte en erken saat seçilmeli"\n',
    hints=['Eşitlik kuralı için most_common yerine max değeri bulup min(k for k, v in ... if v == tepe) kullan.', 'Ortalama: len(siparisler) / (len(gunler) * 24)'],
    why='Lezzet Kurye\'de en yoğun saat ortalamanın 7 katından fazla. Kapasiteyi ortalamaya göre planlasaydın akşam 20:00\'de sistem çökerdi. Gerçek veriden ölçülen çarpan, tahminin en güvenilir girdisidir.'))

ex.append(dict(t='code', id='sistem-tasarimi-3', stage='Rehberli', diff=2,
    q='<p>Cache-aside önbellek. <code>TTLOnbellek(ttl, saat)</code> sınıfını yaz; <code>saat</code> çağrıldığında şimdiki zamanı (saniye) döndüren bir fonksiyondur (test edilebilirlik için enjekte edilir).</p><ul><li><code>al(anahtar, yukle)</code>: kayıt varsa ve <code>simdi - yazilma &lt; ttl</code> ise değeri döndür (isabet). Yoksa <code>yukle(anahtar)</code> çağır, değeri zamanla sakla, döndür (kaçırma).</li><li><code>sil(anahtar)</code>: kaydı kaldırır (yoksa hata vermez).</li><li><code>isabet_orani()</code>: isabet / toplam; hiç çağrı yoksa 0.0.</li></ul>',
    guide=['__init__ içinde ttl, saat, bir sözlük ve iki sayaç tut.', 'al içinde saat()\'i bir kez çağır ve simdi değişkenine koy.', 'Kayıt geçerliyse isabet sayacını artırıp değeri döndür; değilse yukle çağır, (deger, simdi) sakla.', 'sil için dict.pop(anahtar, None) kullan.'],
    example='kayit = ("menü", 100)\nsimdi, ttl = 125, 30\nprint("geçerli" if simdi - kayit[1] < ttl else "süresi doldu")\n',
    start='class TTLOnbellek:\n    def __init__(self, ttl, saat):\n        self.ttl = ttl\n        self.saat = saat\n        self.veri = {}\n        self.isabet = 0\n        self.kacirma = 0\n\n    def al(self, anahtar, yukle):\n        # TODO: geçerli kayıt varsa döndür, yoksa yükle ve sakla\n        return yukle(anahtar)\n\n    def sil(self, anahtar):\n        pass   # TODO\n\n    def isabet_orani(self):\n        return 0.0   # TODO\n',
    sol='class TTLOnbellek:\n    def __init__(self, ttl, saat):\n        self.ttl = ttl\n        self.saat = saat\n        self.veri = {}\n        self.isabet = 0\n        self.kacirma = 0\n\n    def al(self, anahtar, yukle):\n        simdi = self.saat()\n        kayit = self.veri.get(anahtar)\n        if kayit is not None and simdi - kayit[1] < self.ttl:\n            self.isabet += 1\n            return kayit[0]\n        self.kacirma += 1\n        deger = yukle(anahtar)\n        self.veri[anahtar] = (deger, simdi)\n        return deger\n\n    def sil(self, anahtar):\n        self.veri.pop(anahtar, None)\n\n    def isabet_orani(self):\n        toplam = self.isabet + self.kacirma\n        return self.isabet / toplam if toplam else 0.0\n',
    tests='zaman = [0]\nc = TTLOnbellek(30, lambda: zaman[0])\nassert c.isabet_orani() == 0.0, "Hiç çağrı yokken oran 0.0 olmalı"\ndb = []\ndef yukle(k):\n    db.append(k)\n    return f"{k}-v{len(db)}"\nassert c.al("m5", yukle) == "m5-v1"\nzaman[0] = 29\nassert c.al("m5", yukle) == "m5-v1" and len(db) == 1, "TTL dolmadan (29 < 30) veritabanına gidilmemeli"\nzaman[0] = 30\nassert c.al("m5", yukle) == "m5-v2" and len(db) == 2, "30. saniyede kayıt süresi dolmuş sayılmalı (simdi - yazilma < ttl koşulu)"\nc.sil("m5")\nc.sil("yok")\nassert c.al("m5", yukle) == "m5-v3", "sil sonrası yeniden yüklenmeli"\nassert c.isabet == 1 and c.kacirma == 3, f"1 isabet 3 kaçırma bekleniyordu: {c.isabet}, {c.kacirma}"\nassert abs(c.isabet_orani() - 0.25) < 1e-9, "Oran 1/4 olmalı"\nc2 = TTLOnbellek(10, lambda: 0)\nassert c2.al("x", lambda k: 0) == 0 and c2.al("x", lambda k: 99) == 0, "Değeri 0 olan kayıt da önbellekten dönmeli"\n',
    hints=['saat bir fonksiyondur: self.saat() ile çağır.', 'Kayıt kontrolünde "if kayit:" değil "if kayit is not None" kullan; değer 0 ya da boş olabilir.', 'if kayit is not None and simdi - kayit[1] < self.ttl: ...'],
    why='Saati dışarıdan almak, zamana bağlı mantığı beklemeden test etmeni sağlar. Redis\'teki "SET anahtar deger EX 30" bu sınıfın dağıtık hâlidir; sil ise "yazınca geçersiz kıl" stratejisinin karşılığıdır.'))

ex.append(dict(t='code', id='sistem-tasarimi-4', stage='Rehberli', diff=2,
    q='<p>URL kısaltıcı servisi. <code>kodla(n)</code> hazır verildi. <code>Kisaltici</code> sınıfını yaz:</p><ul><li>Sayaç <code>100000</code>\'den başlar (kısa kodlar en az 3 karakter olsun diye).</li><li><code>kisalt(url)</code>: aynı URL ikinci kez gelirse <b>aynı kodu</b> döndürür (idempotent); yeni URL\'de sayacı kullanır, sonra 1 artırır. URL <code>http://</code> ya da <code>https://</code> ile başlamıyorsa <code>ValueError</code>.</li><li><code>ac(kod)</code>: URL\'yi döndürür ve o kodun tıklanma sayısını 1 artırır; bilinmeyen kodda <code>KeyError</code>.</li><li><code>tiklanma(kod)</code>: tıklanma sayısı (hiç açılmadıysa 0).</li></ul>',
    guide=['İki sözlük tut: kod → url ve url → kod (ikincisi idempotentlik için).', 'Tıklanmaları ayrı bir sözlükte (ya da Counter) say.', 'kisalt: önce URL\'yi doğrula, sonra url → kod sözlüğüne bak.', 'ac: kod yoksa KeyError fırlat.'],
    example='kayit = {}\nfor eposta in ["a@x.com", "b@x.com", "a@x.com"]:\n    if eposta not in kayit:\n        kayit[eposta] = len(kayit) + 1\nprint(kayit)\n',
    start='ALFABE = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"\n\ndef kodla(n):\n    parcalar = []\n    while n > 0:\n        n, kalan = divmod(n, 62)\n        parcalar.append(ALFABE[kalan])\n    return "".join(reversed(parcalar)) or "0"\n\nclass Kisaltici:\n    def __init__(self):\n        self.sayac = 100000\n        self.kod_url = {}\n        # TODO: url → kod ve tıklanma sözlükleri\n\n    def kisalt(self, url):\n        # TODO: doğrula, aynı URL için aynı kodu döndür\n        kod = kodla(self.sayac)\n        self.sayac += 1\n        return kod\n\n    def ac(self, kod):\n        pass   # TODO\n\n    def tiklanma(self, kod):\n        return 0   # TODO\n',
    sol='ALFABE = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"\n\ndef kodla(n):\n    parcalar = []\n    while n > 0:\n        n, kalan = divmod(n, 62)\n        parcalar.append(ALFABE[kalan])\n    return "".join(reversed(parcalar)) or "0"\n\nclass Kisaltici:\n    def __init__(self):\n        self.sayac = 100000\n        self.kod_url = {}\n        self.url_kod = {}\n        self.tik = {}\n\n    def kisalt(self, url):\n        if not url.startswith(("http://", "https://")):\n            raise ValueError("geçersiz URL")\n        if url in self.url_kod:\n            return self.url_kod[url]\n        kod = kodla(self.sayac)\n        self.sayac += 1\n        self.kod_url[kod] = url\n        self.url_kod[url] = kod\n        return kod\n\n    def ac(self, kod):\n        if kod not in self.kod_url:\n            raise KeyError(kod)\n        self.tik[kod] = self.tik.get(kod, 0) + 1\n        return self.kod_url[kod]\n\n    def tiklanma(self, kod):\n        return self.tik.get(kod, 0)\n',
    tests='k = Kisaltici()\na = k.kisalt("https://lezzetkurye.example/kampanya/pizza")\nassert a == "q0U", f"100000 sayısının base62 kodu q0U olmalı, gelen {a}"\nb = k.kisalt("https://lezzetkurye.example/menu/5")\nassert b == "q0V", "Sayaç her yeni URL\'de 1 artmalı"\nassert k.kisalt("https://lezzetkurye.example/kampanya/pizza") == a, "Aynı URL aynı kodu almalı (idempotent)"\nassert k.kisalt("https://lezzetkurye.example/yeni") == "q0W", "Tekrarlanan URL sayacı tüketmemeli"\nassert k.ac(a) == "https://lezzetkurye.example/kampanya/pizza"\nk.ac(a); k.ac(b)\nassert k.tiklanma(a) == 2 and k.tiklanma(b) == 1 and k.tiklanma("q0W") == 0, "Tıklanmalar kod başına sayılmalı"\ntry:\n    k.ac("yok")\n    assert False, "Bilinmeyen kod KeyError vermeli"\nexcept KeyError:\n    pass\ntry:\n    k.kisalt("javascript:alert(1)")\n    assert False, "http/https olmayan URL ValueError vermeli (güvenlik)"\nexcept ValueError:\n    pass\n',
    hints=['url.startswith(("http://", "https://")) demet alabilir.', 'Yeni kod üretmeden önce if url in self.url_kod: return self.url_kod[url]'],
    why='Gerçek kısaltıcılarda kod → URL eşlemesi bir anahtar-değer deposunda, tıklanmalar ise ayrı bir sayaçta (çoğu zaman asenkron toplanarak) tutulur. URL doğrulaması "javascript:" gibi tehlikeli şemaların yönlendirme aracı olmasını engeller.'))

ex.append(dict(t='code', id='sistem-tasarimi-5', stage='Kendin yaz', diff=3,
    q='<p>Tutarlı hash halkası. <code>TutarliHash(sanal=100)</code> sınıfını yaz. Özet fonksiyonu olarak <code>int(hashlib.md5(s.encode()).hexdigest(), 16)</code> kullan.</p><ul><li><code>ekle(dugum)</code>: düğümü halkaya <code>f"{dugum}#{i}"</code> (i = 0..sanal-1) anahtarlarıyla <code>sanal</code> kez yerleştirir.</li><li><code>cikar(dugum)</code>: o düğümün tüm sanal noktalarını kaldırır.</li><li><code>bul(anahtar)</code>: anahtarın özetinden <b>büyük</b> ilk noktanın sahibini döndürür; sona gelinirse başa sar. Halka boşsa <code>LookupError</code>.</li></ul>',
    start='import hashlib\nimport bisect\n\nclass TutarliHash:\n    def __init__(self, sanal=100):\n        pass\n',
    sol='import hashlib\nimport bisect\n\ndef _ozet(s):\n    return int(hashlib.md5(s.encode()).hexdigest(), 16)\n\nclass TutarliHash:\n    def __init__(self, sanal=100):\n        self.sanal = sanal\n        self.noktalar = []\n        self.sahip = {}\n\n    def ekle(self, dugum):\n        for i in range(self.sanal):\n            h = _ozet(f"{dugum}#{i}")\n            bisect.insort(self.noktalar, h)\n            self.sahip[h] = dugum\n\n    def cikar(self, dugum):\n        for i in range(self.sanal):\n            h = _ozet(f"{dugum}#{i}")\n            j = bisect.bisect_left(self.noktalar, h)\n            if j < len(self.noktalar) and self.noktalar[j] == h:\n                self.noktalar.pop(j)\n                del self.sahip[h]\n\n    def bul(self, anahtar):\n        if not self.noktalar:\n            raise LookupError("halka boş")\n        i = bisect.bisect(self.noktalar, _ozet(anahtar)) % len(self.noktalar)\n        return self.sahip[self.noktalar[i]]\n',
    tests='from collections import Counter\nh = TutarliHash()\ntry:\n    h.bul("x")\n    assert False, "Boş halkada LookupError bekleniyordu"\nexcept LookupError:\n    pass\nfor d in "ABC":\n    h.ekle(d)\nanahtarlar = [f"siparis-{i}" for i in range(3000)]\nonce = {a: h.bul(a) for a in anahtarlar}\nassert h.bul("siparis-42") == "A" and h.bul("musteri-7") == "C", "md5 ve f\\"{dugum}#{i}\\" biçimiyle sonuçlar belirlenimci olmalı"\nsay = Counter(once.values())\nassert all(800 < v < 1200 for v in say.values()), f"Sanal düğümlerle dağılım dengeli olmalı: {say}"\nh.ekle("D")\nsonra = {a: h.bul(a) for a in anahtarlar}\ntasinan = [a for a in anahtarlar if once[a] != sonra[a]]\nassert len(tasinan) == 749, f"D eklenince 749 anahtar taşınmalı, gelen {len(tasinan)}"\nassert all(sonra[a] == "D" for a in tasinan), "Taşınan her anahtar yalnızca yeni düğüme gitmeli"\nh.cikar("D")\nassert all(h.bul(a) == once[a] for a in anahtarlar), "D çıkarılınca eşleme eski hâline dönmeli"\n',
    hints=['Sıralı nokta listesi + nokta → düğüm sözlüğü tut; bisect.insort ile sıralı ekle.', 'bul: i = bisect.bisect(noktalar, ozet(anahtar)) % len(noktalar) — mod, sona gelince başa sarar.', 'cikar için bisect_left ile noktanın yerini bul ve pop et.'],
    why='Sanal düğümler her fiziksel düğümü halkada 100 küçük dilime böler; bu hem yükü dengeler hem de bir düğüm eklenince yükün tüm düğümlerden eşit alınmasını sağlar. Taşınan anahtar oranı ~1/4 (yeni düğümün payı) kalır.'))

ex.append(dict(t='code', id='sistem-tasarimi-6', stage='Kendin yaz', diff=2,
    q='<p>Hız sınırlama (rate limiting) için token kovası. <code>TokenKova(kapasite, dolum_hizi)</code>: kova başlangıçta dolu; <code>dolum_hizi</code> saniyede eklenen jetondur, kapasiteyi aşamaz. <code>izin_ver(t)</code> (t: saniye, artan): önce geçen süre kadar jeton ekle, sonra en az 1 jeton varsa 1 jeton harca ve <code>True</code>, yoksa <code>False</code> döndür (HTTP 429).</p>',
    start='class TokenKova:\n    def __init__(self, kapasite, dolum_hizi):\n        pass\n\n    def izin_ver(self, t):\n        return True\n',
    sol='class TokenKova:\n    def __init__(self, kapasite, dolum_hizi):\n        self.kapasite = kapasite\n        self.hiz = dolum_hizi\n        self.jeton = float(kapasite)\n        self.son = None\n\n    def izin_ver(self, t):\n        if self.son is not None:\n            self.jeton = min(self.kapasite, self.jeton + (t - self.son) * self.hiz)\n        self.son = t\n        if self.jeton >= 1:\n            self.jeton -= 1\n            return True\n        return False\n',
    tests='k = TokenKova(3, 1)\nassert [k.izin_ver(0) for _ in range(4)] == [True, True, True, False], "Dolu kova 3 ani isteğe izin vermeli, 4.\'yü reddetmeli"\nassert k.izin_ver(0.5) is False, "Yarım saniyede yalnızca 0.5 jeton dolar"\nassert k.izin_ver(1.0) is True, "1. saniyede toplam 1 jeton birikmiş olmalı"\nassert k.izin_ver(100) and k.izin_ver(100) and k.izin_ver(100) and not k.izin_ver(100), "Uzun beklemede kova kapasiteyi (3) aşmamalı"\nk2 = TokenKova(1, 2)\nassert k2.izin_ver(10) and not k2.izin_ver(10.25) and k2.izin_ver(10.5), "Saniyede 2 jeton: 0.5 sn sonra 1 jeton"\n',
    hints=['Jetonu ondalıklı tut; son istek zamanını sakla.', 'jeton = min(kapasite, jeton + (t - son) * hiz)'],
    why='Token kovası ani patlamalara (burst) kapasite kadar izin verirken uzun vadede ortalama hızı sınırlar. API ağ geçitleri ve Nginx limit_req bu fikri kullanır; dağıtık sürümünde jeton sayısı Redis\'te atomik olarak güncellenir.'))

ex.append(dict(t='code', id='sistem-tasarimi-7', stage='Kendin yaz', diff=2,
    q='<p>İdempotent ödeme. <code>OdemeServisi</code> sınıfında <code>ode(anahtar, musteri, tutar)</code> yaz:</p><ul><li><code>tutar &lt;= 0</code> ise <code>ValueError</code>.</li><li>Anahtar ilk kez geliyorsa tahsilatı <code>self.tahsilatlar</code> listesine <code>(musteri, tutar)</code> olarak ekle ve <code>{"islem_no": n, "tutar": tutar, "durum": "onaylandi"}</code> döndür (n 1\'den başlar).</li><li>Aynı anahtar <b>aynı</b> musteri ve tutarla tekrar gelirse yeni tahsilat yapma, ilk sonucu aynen döndür.</li><li>Aynı anahtar farklı musteri ya da tutarla gelirse <code>ValueError</code> (anahtar yanlış kullanımı).</li></ul>',
    start='class OdemeServisi:\n    def __init__(self):\n        self.tahsilatlar = []\n\n    def ode(self, anahtar, musteri, tutar):\n        self.tahsilatlar.append((musteri, tutar))\n        return {"islem_no": len(self.tahsilatlar), "tutar": tutar, "durum": "onaylandi"}\n',
    sol='class OdemeServisi:\n    def __init__(self):\n        self.tahsilatlar = []\n        self.kayit = {}\n\n    def ode(self, anahtar, musteri, tutar):\n        if tutar <= 0:\n            raise ValueError("tutar pozitif olmalı")\n        if anahtar in self.kayit:\n            istek, sonuc = self.kayit[anahtar]\n            if istek != (musteri, tutar):\n                raise ValueError("aynı anahtar farklı istekle kullanılamaz")\n            return sonuc\n        self.tahsilatlar.append((musteri, tutar))\n        sonuc = {"islem_no": len(self.tahsilatlar), "tutar": tutar, "durum": "onaylandi"}\n        self.kayit[anahtar] = ((musteri, tutar), sonuc)\n        return sonuc\n',
    tests='o = OdemeServisi()\nr1 = o.ode("k-1", 870, 249.9)\nr1b = o.ode("k-1", 870, 249.9)\nassert r1 == r1b == {"islem_no": 1, "tutar": 249.9, "durum": "onaylandi"}, "Tekrarlanan istek ilk sonucu döndürmeli"\nassert o.tahsilatlar == [(870, 249.9)], "Ağ hatası sonrası yeniden deneme müşteriyi iki kez ücretlendirmemeli"\nr2 = o.ode("k-2", 870, 249.9)\nassert r2["islem_no"] == 2 and len(o.tahsilatlar) == 2, "Farklı anahtar yeni bir ödemedir (aynı tutar olsa bile)"\nfor arg in [("k-1", 870, 300), ("k-1", 12, 249.9)]:\n    try:\n        o.ode(*arg)\n        assert False, f"{arg}: aynı anahtar farklı istekle ValueError vermeli"\n    except ValueError:\n        pass\ntry:\n    o.ode("k-3", 1, 0)\n    assert False, "Sıfır tutar ValueError vermeli"\nexcept ValueError:\n    pass\nassert len(o.tahsilatlar) == 2, "Hatalı istekler tahsilat oluşturmamalı"\n',
    hints=['Anahtar → (istek, sonuc) sözlüğü tut.', 'Önce doğrula, sonra anahtara bak, en son tahsilat yap.'],
    why='İstemci zaman aşımı alınca ödemenin yapılıp yapılmadığını bilemez ve yeniden dener. Idempotency key sayesinde yeniden deneme güvenli olur. Stripe gibi ödeme API\'leri aynı anahtarın farklı gövdeyle kullanılmasını da hata olarak reddeder.'))

ex.append(dict(t='code', id='sistem-tasarimi-8', stage='Kendin yaz', diff=2,
    q='<p>Lezzet Kurye sipariş durum makinesi. İzinli geçişler:</p><ul><li><code>olusturuldu</code> —onayla→ <code>hazirlaniyor</code> —kuryeye_ver→ <code>yolda</code> —teslim_et→ <code>teslim</code></li><li><code>iptal_et</code> olayı yalnızca <code>olusturuldu</code> ve <code>hazirlaniyor</code> durumlarından <code>iptal</code>\'e götürür.</li></ul><p><code>gecis(durum, olay)</code> yeni durumu döndürsün; izinsiz geçişte <code>ValueError(f"{durum} durumunda {olay} yapılamaz")</code>. <code>son_durum(olaylar)</code> <code>olusturuldu</code>\'dan başlayıp olayları sırayla uygulasın.</p>',
    start='def gecis(durum, olay):\n    pass\n\ndef son_durum(olaylar):\n    pass\n',
    sol='GECISLER = {\n    ("olusturuldu", "onayla"): "hazirlaniyor",\n    ("hazirlaniyor", "kuryeye_ver"): "yolda",\n    ("yolda", "teslim_et"): "teslim",\n    ("olusturuldu", "iptal_et"): "iptal",\n    ("hazirlaniyor", "iptal_et"): "iptal",\n}\n\ndef gecis(durum, olay):\n    try:\n        return GECISLER[(durum, olay)]\n    except KeyError:\n        raise ValueError(f"{durum} durumunda {olay} yapılamaz") from None\n\ndef son_durum(olaylar):\n    durum = "olusturuldu"\n    for olay in olaylar:\n        durum = gecis(durum, olay)\n    return durum\n',
    tests='assert son_durum([]) == "olusturuldu"\nassert son_durum(["onayla", "kuryeye_ver", "teslim_et"]) == "teslim"\nassert son_durum(["onayla", "iptal_et"]) == "iptal"\nfor olaylar, mesaj in [(["onayla", "kuryeye_ver", "iptal_et"], "yolda durumunda iptal_et yapılamaz"), (["teslim_et"], "olusturuldu durumunda teslim_et yapılamaz"), (["iptal_et", "onayla"], "iptal durumunda onayla yapılamaz")]:\n    try:\n        son_durum(olaylar)\n        assert False, f"{olaylar} izinsiz geçiş içeriyor, ValueError bekleniyordu"\n    except ValueError as e:\n        assert str(e) == mesaj, f"Mesaj {mesaj!r} olmalı, gelen {str(e)!r}"\n',
    hints=['(durum, olay) demetini anahtar yapan bir sözlük, if/elif zincirinden okunaklıdır.', 'KeyError\'ı yakalayıp ValueError fırlat.'],
    why='Geçiş tablosu iş kuralını tek bir yerde, okunur biçimde toplar; yeni bir durum (ör. "restoran_reddetti") eklemek bir satırdır. Yolda olan bir siparişin iptali gibi kurallar ürün ekibiyle bu tablo üzerinden konuşulur.'))

ex.append(dict(t='code', id='sistem-tasarimi-9', stage='Hata avı', kind='bug', diff=2,
    q='<p><b>Hatayı bul ve düzelt.</b> Sipariş verisi 4 veritabanı parçasına (shard) <code>shard_sec(anahtar, n)</code> ile dağıtılıyor. Geliştirme ortamında her şey yolunda, ama üretimde birden fazla uygulama süreci aynı siparişi <b>farklı</b> parçalarda arıyor ve "sipariş bulunamadı" hataları geliyor. Fonksiyonu süreçten bağımsız, kararlı bir özetle düzelt: <code>zlib.crc32(anahtar.encode("utf-8")) % n</code>. Ayrıca <code>n &lt; 1</code> için <code>ValueError</code> fırlatsın.</p>',
    start='def shard_sec(anahtar, n):\n    return hash(anahtar) % n\n',
    sol='import zlib\n\ndef shard_sec(anahtar, n):\n    if n < 1:\n        raise ValueError("en az bir parça olmalı")\n    return zlib.crc32(anahtar.encode("utf-8")) % n\n',
    tests='import zlib\nbeklenen = {"siparis-1": 0, "siparis-2": 2, "musteri-870": 2, "çiğköfte-42": 0}\nfor k, v in beklenen.items():\n    assert shard_sec(k, 4) == v, f"{k}: crc32 ile parça {v} olmalı, gelen {shard_sec(k, 4)}"\nassert "hash(" not in __source__.replace("zlib.crc32(", ""), "Yerleşik hash() kullanma: str özetleri her süreçte farklı tuzla (PYTHONHASHSEED) hesaplanır"\ntry:\n    shard_sec("x", 0)\n    assert False, "n=0 ValueError vermeli (ZeroDivisionError değil)"\nexcept ValueError:\n    pass\n',
    hints=['Python\'ın hash() fonksiyonu str için her süreç başlangıcında rastgele tuz kullanır (hash randomization).', 'import zlib; return zlib.crc32(anahtar.encode("utf-8")) % n'],
    why='hash("abc") her Python sürecinde farklı olabilir; bu güvenlik özelliği sözlükleri saldırılara karşı korur ama süreçler arası anahtar dağıtımını bozar. Sharding, önbellek anahtarı ve A/B test ataması için crc32, md5 ya da xxhash gibi kararlı özetler kullanılır.'))

ex.append(dict(t='code', id='sistem-tasarimi-10', stage='Hata avı', kind='bug', diff=3,
    q='<p><b>Hatayı bul ve düzelt.</b> Ödeme sağlayıcısını koruyan sigorta (circuit breaker) üç kurala uymalı:</p><ol><li>Başarılı çağrı ardışık hata sayacını sıfırlar ve durumu <code>"kapali"</code> yapar.</li><li><code>"acik"</code> durumunda <code>t - acilma &gt;= bekleme</code> olunca <code>"yari_acik"</code> olur ve bir deneme çağrısına izin verilir.</li><li><code>"yari_acik"</code> durumundaki çağrı başarısız olursa sigorta <b>hemen</b> yeniden açılır (<code>acilma = t</code>).</li></ol><p>Mevcut kodda bu kuralların üçü de bozuk. <code>cagir(fn, t)</code> açıkken <code>SigortaAcik</code> fırlatmalı, fn hata verirse hatayı yeniden fırlatmalı.</p>',
    start='class SigortaAcik(Exception):\n    pass\n\nclass Sigorta:\n    def __init__(self, esik=3, bekleme=10):\n        self.esik, self.bekleme = esik, bekleme\n        self.durum, self.hata, self.acilma = "kapali", 0, None\n\n    def cagir(self, fn, t):\n        if self.durum == "acik" and t - self.acilma > self.bekleme:\n            self.durum = "yari_acik"\n        if self.durum == "acik":\n            raise SigortaAcik()\n        try:\n            sonuc = fn()\n        except Exception:\n            self.hata += 1\n            if self.hata >= self.esik:\n                self.durum, self.acilma = "acik", t\n            raise\n        self.durum = "kapali"\n        return sonuc\n',
    sol='class SigortaAcik(Exception):\n    pass\n\nclass Sigorta:\n    def __init__(self, esik=3, bekleme=10):\n        self.esik, self.bekleme = esik, bekleme\n        self.durum, self.hata, self.acilma = "kapali", 0, None\n\n    def cagir(self, fn, t):\n        if self.durum == "acik" and t - self.acilma >= self.bekleme:\n            self.durum = "yari_acik"\n        if self.durum == "acik":\n            raise SigortaAcik()\n        try:\n            sonuc = fn()\n        except Exception:\n            self.hata += 1\n            if self.durum == "yari_acik" or self.hata >= self.esik:\n                self.durum, self.acilma = "acik", t\n            raise\n        self.durum, self.hata = "kapali", 0\n        return sonuc\n',
    tests='def hata():\n    raise ConnectionError("zaman aşımı")\ndef iyi():\n    return "ok"\ndef dene(s, fn, t):\n    try:\n        s.cagir(fn, t)\n        return "ok"\n    except SigortaAcik:\n        return "acik"\n    except ConnectionError:\n        return "hata"\ns = Sigorta(3, 10)\nsonuc = [dene(s, f, t) for f, t in [(hata, 0), (hata, 1), (iyi, 2), (hata, 3), (hata, 4)]]\nassert s.durum == "kapali", f"Başarı sayacı sıfırlamalı; araya başarı giren 4 hata sigortayı açmamalı: {sonuc}, durum {s.durum}"\nassert dene(s, hata, 5) == "hata" and s.durum == "acik", "Başarıdan sonraki 3. ardışık hata sigortayı açmalı"\nassert dene(s, iyi, 14) == "acik", "Bekleme dolmadan (14 - 5 < 10) çağrı yapılmamalı"\nassert dene(s, hata, 15) == "hata" and s.durum == "acik" and s.acilma == 15, "t - acilma == bekleme anında yarı açılmalı; deneme başarısızsa hemen yeniden açılmalı"\nassert dene(s, iyi, 20) == "acik", "Yeniden açılan sigorta yeni bekleme süresini (15 + 10) beklemeli"\nassert dene(s, iyi, 25) == "ok" and s.durum == "kapali" and s.hata == 0, "Yarı açıkta başarılı deneme sigortayı kapatmalı ve sayacı sıfırlamalı"\n',
    hints=['Üç yer: karşılaştırma işareti, except bloğundaki koşul ve başarı yolundaki sayaç.', '> yerine >=; except içinde "self.durum == \\"yari_acik\\" or ..."; başarıda self.hata = 0.'],
    why='Yarı açık durum "tek bir keşif isteği" demektir; başarısız olursa sayacın yeniden eşiğe ulaşmasını beklemek bağımlılığa tekrar yük bindirir. Başarıda sayacı sıfırlamamak ise seyrek hataların günler içinde birikip sigortayı yersiz açmasına yol açar.'))

ex.append(dict(t='code', id='sistem-tasarimi-11', stage='Meydan okuma', diff=3,
    q='<p>Kullanıcı başına kayan pencere hız sınırlayıcı. <code>KayanPencere(limit, pencere)</code>:</p><ul><li><code>izin_ver(kullanici, t)</code>: son <code>pencere</code> saniyede (<code>t - pencere &lt; zaman &lt;= t</code>) o kullanıcının kabul edilmiş istek sayısı <code>limit</code>\'ten azsa isteği kaydedip <code>True</code>, değilse <code>False</code> döndürür (reddedilen istekler sayılmaz). İş, süresi dolan kayıt sayısıyla orantılı olmalı (<code>collections.deque</code> kullan).</li><li><code>temizle(t)</code>: penceresi <code>t</code> anında tamamen boşalmış kullanıcıların kaydını sözlükten siler (bellek sızıntısını önleyen periyodik iş) ve silinen kullanıcı sayısını döndürür.</li><li><code>aktif_kullanici()</code>: kaydı olan kullanıcı sayısı.</li></ul>',
    start='class KayanPencere:\n    def __init__(self, limit, pencere):\n        pass\n\n    def izin_ver(self, kullanici, t):\n        return True\n\n    def temizle(self, t):\n        return 0\n\n    def aktif_kullanici(self):\n        return 0\n',
    sol='from collections import deque\n\nclass KayanPencere:\n    def __init__(self, limit, pencere):\n        self.limit = limit\n        self.pencere = pencere\n        self.kayit = {}\n\n    def _dus(self, q, t):\n        while q and q[0] <= t - self.pencere:\n            q.popleft()\n\n    def izin_ver(self, kullanici, t):\n        q = self.kayit.setdefault(kullanici, deque())\n        self._dus(q, t)\n        if len(q) < self.limit:\n            q.append(t)\n            return True\n        return False\n\n    def temizle(self, t):\n        bos = []\n        for k, q in self.kayit.items():\n            self._dus(q, t)\n            if not q:\n                bos.append(k)\n        for k in bos:\n            del self.kayit[k]\n        return len(bos)\n\n    def aktif_kullanici(self):\n        return len(self.kayit)\n',
    tests='s = KayanPencere(2, 10)\nassert [s.izin_ver("ali", t) for t in (0, 1, 2)] == [True, True, False], "10 sn içinde 2 istekten sonrası reddedilmeli"\nassert s.izin_ver("ayse", 2) is True, "Limit kullanıcı başına olmalı"\nassert s.izin_ver("ali", 9.9) is False, "0. saniyedeki istek 9.9\'da hâlâ pencerede"\nassert s.izin_ver("ali", 10) is True, "t=10\'da 0. saniyedeki istek pencereden çıkar (t - pencere < zaman)"\nassert s.izin_ver("ali", 10.5) is False, "Pencerede 1 ve 10 var; reddedilen 2 ve 9.9 sayılmamalı"\nassert s.aktif_kullanici() == 2\nassert s.temizle(15) == 1 and s.aktif_kullanici() == 1, "t=15\'te ayşe\'nin penceresi boş (2 <= 5), ali\'nin 10\'daki isteği duruyor"\nassert s.temizle(100) == 1 and s.aktif_kullanici() == 0, "t=100\'de tüm kayıtlar silinmeli"\nassert s.izin_ver("ali", 100) is True, "Silinen kullanıcı yeniden başlayabilmeli"\n',
    hints=['Her kullanıcı için zaman damgalarını tutan bir deque; baştan süresi dolanları popleft ile at.', 'Dolan kayıt koşulu: q[0] <= t - pencere.', 'temizle: sözlükte gezerken silme; önce silinecekleri bir listeye topla.'],
    why='Sabit pencere (her dakika sıfırla) dakika sınırında 2×limit patlamaya izin verir; kayan pencere günlüğü bunu engeller. Redis\'te bu kalıp sıralı küme (ZADD + ZREMRANGEBYSCORE) ile kurulur ve anahtara TTL verilerek bellek sızıntısı önlenir.'))

ex.append(dict(t='code', id='sistem-tasarimi-12', stage='Meydan okuma', diff=3,
    q='<p>Replikasyon gecikmesine karşı "kendi yazdığını oku" (read-your-writes). <code>OkumaYonlendirici(replikalar, tutarlilik_sn)</code>:</p><ul><li><code>yaz(kullanici, t)</code>: yazma her zaman lidere gider; <code>"lider"</code> döndür ve kullanıcının son yazma zamanını kaydet.</li><li><code>oku(kullanici, t)</code>: kullanıcı son <code>tutarlilik_sn</code> saniye içinde yazdıysa (<code>t - son_yazma &lt; tutarlilik_sn</code>) ya da hiç replika yoksa <code>"lider"</code>; değilse replikaları <b>sırayla</b> (round robin, tüm kullanıcılar için ortak sıra) döndür.</li><li><code>replika_dustu(ad)</code>: replikayı listeden çıkarır; sıra kalan replikalarla devam eder.</li></ul>',
    start='class OkumaYonlendirici:\n    def __init__(self, replikalar, tutarlilik_sn):\n        self.replikalar = list(replikalar)\n\n    def yaz(self, kullanici, t):\n        return "lider"\n\n    def oku(self, kullanici, t):\n        return self.replikalar[0]\n\n    def replika_dustu(self, ad):\n        pass\n',
    sol='class OkumaYonlendirici:\n    def __init__(self, replikalar, tutarlilik_sn):\n        self.replikalar = list(replikalar)\n        self.esik = tutarlilik_sn\n        self.son_yazma = {}\n        self.sira = 0\n\n    def yaz(self, kullanici, t):\n        self.son_yazma[kullanici] = t\n        return "lider"\n\n    def oku(self, kullanici, t):\n        son = self.son_yazma.get(kullanici)\n        if not self.replikalar or (son is not None and t - son < self.esik):\n            return "lider"\n        ad = self.replikalar[self.sira % len(self.replikalar)]\n        self.sira += 1\n        return ad\n\n    def replika_dustu(self, ad):\n        if ad in self.replikalar:\n            self.replikalar.remove(ad)\n',
    tests='y = OkumaYonlendirici(["r1", "r2"], 5)\nassert [y.oku("ali", 0), y.oku("ayse", 0), y.oku("ali", 1)] == ["r1", "r2", "r1"], "Okumalar replikalar arasında sırayla dağıtılmalı"\nassert y.yaz("ali", 10) == "lider"\nassert y.oku("ali", 12) == "lider", "Yazdıktan 2 sn sonra ali lidere gitmeli (replika geride olabilir)"\nassert y.oku("ayse", 12) == "r2", "Yazmayan kullanıcı replikadan okur; lidere giden okuma sırayı ilerletmez"\nassert y.oku("ali", 15) == "r1", "t - son_yazma == 5 olunca yeniden replikaya dönmeli"\ny.replika_dustu("r1")\nassert [y.oku("x", 20), y.oku("x", 21)] == ["r2", "r2"], "Düşen replika seçilmemeli"\ny.replika_dustu("r2")\ny.replika_dustu("r9")\nassert y.oku("x", 30) == "lider", "Replika kalmadıysa lidere gidilmeli"\n',
    hints=['Kullanıcı → son yazma zamanı sözlüğü ve global bir sıra sayacı tut.', 'Sıradaki replika: replikalar[sira % len(replikalar)]; yalnızca replikaya gidince sira += 1.'],
    why='Takipçiler lideri birkaç saniye geriden izleyebilir. Kullanıcı kendi değişikliğini göremezse "kaydetmedi" sanıp tekrar dener. Yazan kullanıcının kısa süre lidere yönlendirilmesi, liderin tüm okumaları üstlenmesine gerek kalmadan bu sorunu çözer.'))

ex.append(dict(t='code', id='sistem-tasarimi-13', stage='Mini proje', diff=3,
    q='<p><b>Lezzet Kurye sipariş akışı</b> (outbox + en az bir kez teslim + idempotent tüketici). İki sınıf yaz.</p><p><code>SiparisAkisi</code>:</p><ul><li><code>olustur(istek_anahtari, musteri, tutar)</code>: aynı istek anahtarı tekrar gelirse aynı sipariş numarasını döndür, yeni sipariş açma. Yeni siparişler 1\'den numaralanır, durumu <code>"olusturuldu"</code>; giden kutusuna (<code>self.outbox</code> listesi) <code>{"olay_no": k, "siparis": no, "tur": "olusturuldu"}</code> ekle (olay_no 1\'den artar).</li><li><code>ilerlet(siparis_no, olay)</code>: geçiş tablosu sistem-tasarimi-8 ile aynı (onayla → hazirlaniyor, kuryeye_ver → yolda, teslim_et → teslim, iptal_et → iptal yalnız olusturuldu/hazirlaniyor\'dan). İzinsiz geçişte <code>ValueError</code>, bilinmeyen siparişte <code>KeyError</code>. Başarılı geçişte yeni durumu kaydet ve outbox\'a <code>tur</code> = yeni durum olan olay ekle; yeni durumu döndür.</li><li><code>durum(siparis_no)</code>.</li><li><code>yayinla(kuyruk)</code>: outbox\'taki olayları sırayla kuyruğa (<code>collections.deque</code>) ekler, outbox\'u boşaltır, eklenen sayıyı döndürür.</li></ul><p><code>BildirimServisi</code>: <code>tuket(kuyruk)</code> kuyruğu boşaltana kadar olay alır; daha önce işlenmiş <code>olay_no</code>\'ları atlar (tekrar teslim); diğerleri için <code>self.gonderilen</code> listesine <code>f"#{siparis}: {tur}"</code> ekler. İşlenen (atlanmayan) olay sayısını döndürür.</p>',
    start='from collections import deque\n\nclass SiparisAkisi:\n    def __init__(self):\n        self.outbox = []\n        # TODO\n\n    def olustur(self, istek_anahtari, musteri, tutar):\n        pass\n\n    def ilerlet(self, siparis_no, olay):\n        pass\n\n    def durum(self, siparis_no):\n        pass\n\n    def yayinla(self, kuyruk):\n        return 0\n\nclass BildirimServisi:\n    def __init__(self):\n        self.gonderilen = []\n\n    def tuket(self, kuyruk):\n        return 0\n',
    sol='from collections import deque\n\nGECISLER = {\n    ("olusturuldu", "onayla"): "hazirlaniyor",\n    ("hazirlaniyor", "kuryeye_ver"): "yolda",\n    ("yolda", "teslim_et"): "teslim",\n    ("olusturuldu", "iptal_et"): "iptal",\n    ("hazirlaniyor", "iptal_et"): "iptal",\n}\n\nclass SiparisAkisi:\n    def __init__(self):\n        self.outbox = []\n        self.siparisler = {}\n        self.istekler = {}\n        self.olay_sayac = 0\n\n    def _olay(self, no, tur):\n        self.olay_sayac += 1\n        self.outbox.append({"olay_no": self.olay_sayac, "siparis": no, "tur": tur})\n\n    def olustur(self, istek_anahtari, musteri, tutar):\n        if istek_anahtari in self.istekler:\n            return self.istekler[istek_anahtari]\n        no = len(self.siparisler) + 1\n        self.siparisler[no] = {"musteri": musteri, "tutar": tutar, "durum": "olusturuldu"}\n        self.istekler[istek_anahtari] = no\n        self._olay(no, "olusturuldu")\n        return no\n\n    def ilerlet(self, siparis_no, olay):\n        s = self.siparisler[siparis_no]\n        yeni = GECISLER.get((s["durum"], olay))\n        if yeni is None:\n            raise ValueError(f"{s[\'durum\']} durumunda {olay} yapılamaz")\n        s["durum"] = yeni\n        self._olay(siparis_no, yeni)\n        return yeni\n\n    def durum(self, siparis_no):\n        return self.siparisler[siparis_no]["durum"]\n\n    def yayinla(self, kuyruk):\n        n = len(self.outbox)\n        kuyruk.extend(self.outbox)\n        self.outbox = []\n        return n\n\nclass BildirimServisi:\n    def __init__(self):\n        self.gonderilen = []\n        self.islenen = set()\n\n    def tuket(self, kuyruk):\n        n = 0\n        while kuyruk:\n            olay = kuyruk.popleft()\n            if olay["olay_no"] in self.islenen:\n                continue\n            self.islenen.add(olay["olay_no"])\n            self.gonderilen.append(f"#{olay[\'siparis\']}: {olay[\'tur\']}")\n            n += 1\n        return n\n',
    tests='from collections import deque\na = SiparisAkisi()\nno = a.olustur("istek-abc", 870, 249.9)\nassert no == 1 and a.olustur("istek-abc", 870, 249.9) == 1, "Aynı istek anahtarı aynı siparişi döndürmeli"\nassert len(a.outbox) == 1, "Tekrarlanan istek yeni olay üretmemeli"\nno2 = a.olustur("istek-xyz", 348, 120.0)\nassert no2 == 2 and a.durum(2) == "olusturuldu"\nassert a.ilerlet(1, "onayla") == "hazirlaniyor"\na.ilerlet(1, "kuryeye_ver")\ntry:\n    a.ilerlet(1, "iptal_et")\n    assert False, "Yoldaki sipariş iptal edilememeli"\nexcept ValueError:\n    pass\ntry:\n    a.ilerlet(99, "onayla")\n    assert False, "Bilinmeyen sipariş KeyError vermeli"\nexcept KeyError:\n    pass\nassert a.durum(1) == "yolda", "Başarısız geçiş durumu değiştirmemeli"\nkuyruk = deque()\nassert a.yayinla(kuyruk) == 4 and a.outbox == [], "4 olay (2 oluşturma + 2 geçiş) yayınlanmalı ve outbox boşalmalı"\nassert [o["olay_no"] for o in kuyruk] == [1, 2, 3, 4], "Olaylar sırasını korumalı"\nkuyruk.append(dict(kuyruk[0]))\nb = BildirimServisi()\nassert b.tuket(kuyruk) == 4, "Tekrar teslim edilen olay (olay_no 1) atlanmalı"\nassert b.gonderilen == ["#1: olusturuldu", "#2: olusturuldu", "#1: hazirlaniyor", "#1: yolda"], f"Bildirimler: {b.gonderilen}"\na.ilerlet(1, "teslim_et")\na.yayinla(kuyruk)\nkuyruk.appendleft({"olay_no": 3, "siparis": 1, "tur": "hazirlaniyor"})\nassert b.tuket(kuyruk) == 1 and b.gonderilen[-1] == "#1: teslim" and not kuyruk, "Sonraki turda yalnız yeni olay işlenmeli, kuyruk boşalmalı"\n',
    hints=['Geçiş tablosunu sistem-tasarimi-8\'den yeniden kullan; olay eklemeyi tek bir yardımcı metoda topla.', 'İdempotentlik iki yerde: olustur (istek anahtarı → sipariş no) ve tüketici (işlenmiş olay_no kümesi).', 'yayinla: kuyruk.extend(self.outbox); self.outbox = []'],
    why='Bu, gerçek sipariş sistemlerinin iskeletidir: durum değişikliği ve olayı aynı yerde kaydetmek (outbox) olay kaybını, istek anahtarı çift siparişi, tüketicideki tekrar kontrolü ise en az bir kez teslimin yan etkisini (aynı SMS\'in iki kez gitmesi) önler.'))

faq = [
    dict(q='Sistem tasarımı mülakatına nasıl hazırlanmalıyım?', a='Önce bu dersteki yapı taşlarını (önbellek, replikasyon, sharding, kuyruk, dayanıklılık kalıpları) kendi cümlelerinle açıklayabilir hâle gel. Sonra URL kısaltıcı, bildirim servisi, sohbet uygulaması, yemek siparişi gibi klasik soruları 45 dakikalık süreyle sesli çöz. Her tasarımda kaba tahmini ve en az iki ödünleşimi söylemeye alış.'),
    dict(q='Mikroservis mi, monolit mi?', a='Küçük bir ekip ve yeni bir ürün için iyi modüllenmiş bir monolit genelde daha hızlı ve ucuzdur. Mikroservisler bağımsız dağıtım ve ekip ölçeklemesi getirir ama ağ çağrısı, dağıtık işlem ve gözlemlenebilirlik maliyeti ekler. Mülakatta "neden" sorusuna ekip boyutu ve değişim hızıyla cevap ver.'),
    dict(q='Hangi veritabanını seçmeliyim: SQL mi NoSQL mi?', a='İlişkisel veri, işlem (transaction) ihtiyacı ve esnek sorgular için PostgreSQL gibi bir SQL veritabanı güvenli varsayılandır. Çok yüksek yazma hacmi, basit anahtar erişimi ya da esnek şema gerektiğinde anahtar-değer veya belge depoları düşünülür. Seçimi erişim kalıbına göre yap, modaya göre değil.'),
    dict(q='Kaba tahminde rakamlarım yanlış çıkarsa ne olur?', a='Sorun değil; değerlendirici yöntemine bakar. Varsayımlarını açıkça söyle, yuvarlayarak hesapla ve sonucun tasarımı nasıl etkilediğini belirt ("saniyede 3 000 okuma: tek veritabanı zorlanır, önbellek gerekir"). Hatanı kendin yakalayıp düzeltmek olumlu sinyaldir.'),
]
mistakes = [
    dict(bad='shard = hash(musteri_id_str) % 4', good='shard = zlib.crc32(musteri_id_str.encode()) % 4', why='Yerleşik hash() str için süreç başına tuzlanır; farklı süreçler aynı anahtarı farklı parçada arar.'),
    dict(bad='for deneme in range(5):\n    try:\n        return odeme_api(tutar)\n    except Exception:\n        continue', good='for deneme in range(3):\n    try:\n        return odeme_api(tutar, idempotency_key=anahtar, timeout=2)\n    except GeciciHata:\n        time.sleep(min(2 ** deneme, 8) * random.random())', why='Idempotency key olmadan yeniden deneme çift tahsilat yaratır; zaman aşımı, geri çekilme ve hata türü ayrımı olmadan retry çöken servisi daha da boğar.'),
    dict(bad='kuyruk = []          # sınırsız\nkuyruk.append(is_)', good='kuyruk = queue.Queue(maxsize=1000)\nkuyruk.put(is_, timeout=0.1)   # dolarsa queue.Full → 503', why='Sınırsız kuyruk backpressure değildir; tüketici yavaşlayınca bellek dolar ve sistem bütünüyle çöker.'),
    dict(bad='cache.set(anahtar, deger)   # TTL yok, güncellemede silinmiyor', good='cache.set(anahtar, deger, ex=300)\n# fiyat güncellenince:\ncache.delete(anahtar)', why='TTL ve geçersiz kılma olmadan önbellek sonsuza kadar eski veri döndürebilir.'),
]

lesson = dict(id='sistem-tasarimi', lv='ileri', mod='Üretime Hazırlık', min=65,
    title='Sistem tasarımı temelleri: ölçekleme, tutarlılık ve tasarım mülakatı',
    sum='Gereksinim çıkarma ve kaba kapasite hesabından yük dengeleme, önbellek, replikasyon, tutarlı hash, CAP/PACELC, kuyruklar, idempotentlik ve circuit breaker\'a; URL kısaltıcı ve Lezzet Kurye sipariş akışı tasarımlarına kadar sistem tasarımının yapı taşlarını Python simülasyonlarıyla öğrenirsin.',
    goals=['Gereksinimleri netleştirip QPS, tepe yükü ve depolama için kaba tahmin yapabilirim.',
           'Durumsuz servis, yük dengeleyici, önbellek ve replikasyonla okuma ağırlıklı bir sistemi ölçekleyebilirim.',
           'Mod N sharding ile tutarlı hash arasındaki farkı açıklayıp tutarlı hash halkası kodlayabilirim.',
           'Timeout, retry, idempotency key, circuit breaker ve hız sınırlamayla dayanıklı servis çağrıları tasarlayabilirim.',
           'Lezzet Kurye sipariş akışı gibi bir sistemi 45 dakikalık mülakat formatında uçtan uca anlatabilirim.'],
    body=body, ex=ex, faq=faq, mistakes=mistakes)

write('/home/claude/py/v2/n5/sistem-tasarimi.js', lesson, 'İleri: sistem-tasarimi (Sistem tasarımı temelleri)')
