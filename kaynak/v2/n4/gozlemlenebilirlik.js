/* Kesit Python v2 — gozlemlenebilirlik */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{
  id: 'gozlemlenebilirlik',
  lv: 'ileri',
  mod: 'Üretime Hazırlık',
  min: 85,
  title: 'Gözlemlenebilirlik: log, metrik, iz ve SLO',
  sum: 'Log, metrik ve izi birbirine bağlar; contextvars ile istek kimliğini taşır, sayaç/ölçer/histogram tasarlar, gerçek Lezzet Kurye teslim sürelerinden p50/p95 hesaplar, span ve trace simüle eder, SLO ve hata bütçesini ölçüp gürültüsüz yanma hızı alarmı kurar, veri hattının tazelik/hacim/şema sağlığını denetlersin.',
  goals: [
    'Log, metrik ve izin hangi soruyu cevapladığını açıklar, contextvars ile istek kimliğini loglara taşıyabilirim.',
    'Counter, gauge ve histogram arasında doğru seçimi yapar, yüzdelikleri (p50/p95/p99) doğru hesaplar ve birleştirebilirim.',
    'RED ve USE yöntemleriyle servis panosu tasarlar, span/trace ve traceparent ile dağıtık izi kurabilirim.',
    'SLI, SLO ve hata bütçesini hesaplar, çok pencereli yanma hızı alarmı tasarlayabilirim.',
    'Liveness/readiness ayrımını uygular, veri hattında tazelik, hacim ve şema kontrollerini yazabilirim.'
  ],
  body: `
<h2>Neden önemli?</h2>
<p>Cuma akşamı Lezzet Kurye'ye "siparişim bir saattir gelmedi" şikâyetleri yağıyor. Sunucular ayakta, CPU normal, hata logu yok. Sorun nerede: restoranın onayında mı, kurye atamasında mı, ödeme servisinin yavaşlamasında mı? <b>İzleme</b> (monitoring) önceden bildiğin soruları sorar: "CPU %90'ı geçti mi?". <b>Gözlemlenebilirlik</b> (observability) ise sistemin dışarı verdiği sinyallerle <b>önceden düşünmediğin</b> soruları da cevaplayabilmektir: "Bu akşam Kadıköy'deki nakit ödemeli siparişlerde kurye atama adımı neden 4 kat yavaş?". Bu dersin sonunda bir servisin log, metrik ve izlerini tasarlayabilecek, "iyi çalışıyor"u bir SLO ile sayıya dökebilecek ve gürültüsüz alarm kurabileceksin.</p>

<h2>Üç sütun ve aralarındaki ilişki</h2>
<div class="tbl-wrap"><table>
<tr><th>Sinyal</th><th>Ne?</th><th>Cevapladığı soru</th><th>Maliyet / risk</th></tr>
<tr><td>Log</td><td>Zaman damgalı tek tek olaylar (tercihen JSON)</td><td>Bu istekte tam olarak ne oldu?</td><td>Hacim büyük; kişisel veri sızma riski</td></tr>
<tr><td>Metrik</td><td>Zaman içinde toplanmış sayılar (sayaç, ölçer, histogram)</td><td>Genel durum ne? Eğilim nereye gidiyor?</td><td>Ucuz; ama etiket (label) çeşitliliği patlarsa pahalı</td></tr>
<tr><td>İz (trace)</td><td>Bir isteğin servisler arasındaki yolculuğu, adım adım süreleri (span)</td><td>Zaman nerede harcandı? Hangi servis yavaş?</td><td>Genelde örneklenir (sampling)</td></tr>
</table></div>
<p>Üçü birbirine bağlandığında güçlenir: metrik panelinde p95'in sıçradığını görürsün, o andaki yavaş bir isteğin <code>trace_id</code>'sine (exemplar) tıklarsın, izde ödeme servisinin 3 saniye beklediğini görürsün, aynı <code>trace_id</code> ile loglarda hata mesajını bulursun. Bu bağı kuran şey <b>korelasyon kimliğidir</b>. Logging dersinde yapılandırılmış (JSON) log ve <code>Filter</code> ile bağlam eklemeyi görmüştün; şimdi o bağlamı istek boyunca taşıyacağız.</p>

<h2>Korelasyon ve istek kimliği: contextvars</h2>
<p>Her gelen isteğe bir kimlik (request id) verilir; istemci <code>X-Request-ID</code> başlığıyla gönderdiyse o kullanılır, yoksa üretilir. Bu kimliği her fonksiyona parametre olarak geçirmek yerine <code>contextvars.ContextVar</code> kullanılır: asyncio'da her görev kendi bağlam kopyasında çalıştığı için aynı anda işlenen iki isteğin kimlikleri karışmaz (global değişkende karışır). Bir logging filtresi de kimliği her log kaydına ekler.</p>
<pre class="py">import asyncio, contextvars, io, logging

istek_kimligi = contextvars.ContextVar("istek_kimligi", default="-")

class KimlikFiltresi(logging.Filter):
    def filter(self, kayit):
        kayit.istek_kimligi = istek_kimligi.get()
        return True

akim = io.StringIO()
h = logging.StreamHandler(akim)
h.setFormatter(logging.Formatter("%(istek_kimligi)s %(message)s"))
h.addFilter(KimlikFiltresi())
log = logging.getLogger("lezzet.siparis")
log.handlers[:] = [h]
log.setLevel(logging.INFO)
log.propagate = False

async def siparis_al(kimlik, siparis_id):
    istek_kimligi.set(kimlik)                 # middleware bunu yapar
    log.info("sipariş alındı %s", siparis_id)
    await asyncio.sleep(0.001)                # bu arada diğer istek çalışır
    log.info("kurye atandı %s", siparis_id)

async def main():
    await asyncio.gather(siparis_al("req-a1", 1), siparis_al("req-b2", 2))

asyncio.run(main())
print(akim.getvalue(), end="")
print("ana bağlamda:", istek_kimligi.get())</pre>
<p>İki istek iç içe geçerek çalıştı ama her log satırı doğru kimliği taşıyor; ana bağlam etkilenmedi. Senkron web çatılarında (Django, Flask) middleware <code>token = istek_kimligi.set(...)</code> ile değeri koyar ve yanıt bitince <code>istek_kimligi.reset(token)</code> ile geri alır; iş parçacığı havuzunda bir sonraki istek eski kimliği görmesin diye bu reset önemlidir.</p>

<h2>Metrik türleri ve yüzdelikler</h2>
<div class="tbl-wrap"><table>
<tr><th>Tür</th><th>Davranış</th><th>Örnek</th><th>Sorgu</th></tr>
<tr><td>Counter (sayaç)</td><td>Yalnız artar (süreç yeniden başlarsa sıfırlanır)</td><td><code>siparis_toplam{durum="teslim"}</code></td><td>Artış hızı: <code>rate(...[5m])</code></td></tr>
<tr><td>Gauge (ölçer)</td><td>Artar ve azalır; anlık değer</td><td>Kuyruktaki bildirim sayısı, aktif kurye</td><td>Değerin kendisi</td></tr>
<tr><td>Histogram</td><td>Gözlemleri kovalara (bucket) sayar + toplam + adet</td><td>Teslim süresi, istek süresi</td><td><code>histogram_quantile(0.95, ...)</code></td></tr>
<tr><td>Summary</td><td>Yüzdeliği istemcide hesaplar</td><td>Tek süreç gecikmesi</td><td>Süreçler arasında birleştirilemez</td></tr>
</table></div>
<pre class="code"># pip install prometheus-client   -&gt;  http://localhost:8000/metrics
from prometheus_client import Counter, Gauge, Histogram, start_http_server

SIPARIS = Counter("siparis_toplam", "Alınan siparişler", ["sehir", "odeme"])
KUYRUK = Gauge("bildirim_kuyrugu", "Bekleyen bildirim sayısı")
TESLIM = Histogram("teslim_suresi_dakika", "Sipariş -&gt; teslim süresi",
                   buckets=[15, 20, 30, 40, 45, 60, 75, 90])

start_http_server(8000)
SIPARIS.labels(sehir="İstanbul", odeme="kart").inc()
KUYRUK.set(12)
TESLIM.observe(36.8)</pre>
<div class="warn"><b>Etiket kardinalitesi</b>Her farklı etiket birleşimi ayrı bir zaman serisidir. <code>musteri_id</code>, <code>order_id</code> ya da tam URL gibi sınırsız değerleri etikete koyma; 1.209 müşteri × 4 ödeme × 3 şehir binlerce seri eder ve metrik sistemini çökertir. Bu tür yüksek kardinaliteli bilgiler log ve izlere aittir.</div>
<p>Gecikmeyi <b>ortalama</b> ile izlemek yanıltır: birkaç çok yavaş istek ortalamayı az etkiler ama o kullanıcılar çok mutsuzdur. Bunun yerine yüzdelik (percentile) kullanılır: p50 (medyan) tipik deneyimi, p95 ve p99 kuyruğu (en kötü %5 ve %1) gösterir. Lezzet Kurye'nin gerçek teslim sürelerine bakalım:</p>
<pre class="py">import datetime as dt
import veri

def teslim_sureleri():
    """Teslim edilen siparişlerin sipariş -&gt; teslim süresi (dakika)."""
    sonuc = []
    for s in veri.kayitlar("lezzet_kurye", "lk_orders"):
        if s["status"] == "teslim":
            a = dt.datetime.fromisoformat(s["placed_at"])
            b = dt.datetime.fromisoformat(s["delivered_at"])
            sonuc.append((b - a).total_seconds() / 60)
    return sonuc

import math, statistics

def yuzdelik(degerler, p):                     # en yakın sıra (nearest-rank) yöntemi
    s = sorted(degerler)
    k = max(1, math.ceil(p / 100 * len(s)))
    return s[k - 1]

sureler = teslim_sureleri()
print("teslim edilen sipariş:", len(sureler))
print(f"ortalama = {statistics.mean(sureler):.1f} dk")
for p in (50, 95, 99):
    print(f"p{p} = {yuzdelik(sureler, p):.1f} dk")
print(f"60 dk içinde teslim oranı = %{100 * sum(x &lt;= 60 for x in sureler) / len(sureler):.2f}")</pre>
<p>Medyan müşteri siparişini 37 dakikada alıyor, ama her 20 müşteriden biri 57 dakikadan fazla bekliyor. Yüzdelik hesaplamanın birden çok yöntemi vardır (en yakın sıra, doğrusal ara değer; <code>statistics.quantiles</code> ve numpy farklı varsayılanlar kullanır); panolarda hangi yöntemin kullanıldığını bil ve <b>yüzdelikleri asla ortalamasını alarak birleştirme</b>: iki sunucunun p95'lerinin ortalaması toplam p95 değildir. Birleştirilebilir olan histogram kovalarıdır.</p>

<h2>RED ve USE yöntemleri</h2>
<div class="tbl-wrap"><table>
<tr><th>Yöntem</th><th>Neye uygulanır?</th><th>Ölçülenler</th></tr>
<tr><td>RED</td><td>İstek alan servisler (API, sipariş servisi)</td><td><b>R</b>ate (saniyedeki istek), <b>E</b>rrors (hata oranı), <b>D</b>uration (süre dağılımı, p50/p95/p99)</td></tr>
<tr><td>USE</td><td>Kaynaklar (CPU, disk, bağlantı havuzu, kuyruk)</td><td><b>U</b>tilization (doluluk), <b>S</b>aturation (bekleyen iş), <b>E</b>rrors</td></tr>
</table></div>
<p>Google SRE kitabındaki "dört altın sinyal" (gecikme, trafik, hata, doygunluk) da bu ikisinin birleşimidir. Her servisin ilk panosu RED olmalı; doygunluk ise sorunun nedenini (veritabanı bağlantı havuzu dolu) gösterir.</p>

<h2>Dağıtık iz: span, trace, örnekleme</h2>
<p>Bir sipariş isteği API ağ geçidinden geçer, sipariş servisi restoran servisini ve ödeme servisini çağırır, sonra kuyruğa bildirim bırakır. <b>Trace</b> bu yolculuğun tamamıdır ve bir <code>trace_id</code> taşır; her adım bir <b>span</b>'dir (ad, başlangıç, bitiş, üst span kimliği, öznitelikler). Servisler arasında bağlam HTTP başlığıyla taşınır; W3C standardı <code>traceparent: 00-&lt;trace_id 32 hex&gt;-&lt;span_id 16 hex&gt;-01</code> biçimindedir (son bayt örneklenme bayrağı).</p>
<pre class="code"># pip install opentelemetry-sdk opentelemetry-instrumentation-fastapi
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
from opentelemetry.sdk.trace.sampling import ParentBased, TraceIdRatioBased

saglayici = TracerProvider(sampler=ParentBased(TraceIdRatioBased(0.1)))   # izlerin %10'u
saglayici.add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))    # gerçekte OTLP -&gt; Jaeger/Tempo
trace.set_tracer_provider(saglayici)
izci = trace.get_tracer("lezzet.siparis")

def siparis_ver(s):
    with izci.start_as_current_span("siparis_ver") as span:
        span.set_attribute("siparis.sehir", s.sehir)
        with izci.start_as_current_span("odeme_al"):
            odeme.tahsil(s)
        with izci.start_as_current_span("kurye_ata"):
            kurye.ata(s)</pre>
<p>Aşağıdaki simülasyon aynı fikri <code>contextvars</code> ile kuruyor: etkin span bir bağlam değişkeninde durur, yeni span onu üst (parent) olarak alır; saat enjekte edildiği için süreler deterministiktir.</p>
<pre class="py">import contextvars, itertools
from contextlib import contextmanager

etkin = contextvars.ContextVar("etkin_span", default=None)
saat = {"t": 0}
sayac = itertools.count(1)
spanlar = []

@contextmanager
def span(ad):
    ust = etkin.get()
    s = {"ad": ad, "id": next(sayac), "ust": ust["id"] if ust else None, "bas": saat["t"]}
    token = etkin.set(s)
    try:
        yield s
    finally:
        s["sure"] = saat["t"] - s["bas"]
        etkin.reset(token)
        spanlar.append(s)

with span("POST /siparis"):
    saat["t"] += 5
    with span("odeme_al"):
        saat["t"] += 120
    with span("kurye_ata"):
        saat["t"] += 40
        with span("sql: SELECT kurye"):
            saat["t"] += 35

def yaz(ust=None, girinti=0):
    for s in sorted((x for x in spanlar if x["ust"] == ust), key=lambda x: x["bas"]):
        print("  " * girinti + f"{s['ad']:{24 - 2 * girinti}} {s['sure']:4} ms")
        yaz(s["id"], girinti + 1)

yaz()</pre>
<p>Bütün izleri saklamak pahalıdır; bu yüzden <b>örnekleme</b> yapılır. <i>Baştan örnekleme</i> (head sampling) kararı istek başında verir (ör. %10) ve ucuzdur ama nadir hatalı istekleri kaçırabilir. <i>Kuyruktan örnekleme</i> (tail sampling) iz bittikten sonra karar verir: tüm hatalı ve yavaş izleri, normallerin ise küçük bir kısmını saklar; OpenTelemetry Collector'da yapılır.</p>

<h2>SLI, SLO ve hata bütçesi</h2>
<p><b>SLI</b> (Service Level Indicator) kullanıcı deneyimini ölçen bir orandır: <code>iyi olaylar / tüm olaylar</code>. <b>SLO</b> (Objective) bu oran için hedeftir: "Bir ay içinde teslim edilen siparişlerin %95'i 60 dakika içinde teslim edilmeli." <b>SLA</b> ise müşteriyle yapılan, cezası olan sözleşmedir ve SLO'dan gevşek tutulur. <b>Hata bütçesi</b> = <code>(1 - hedef) × toplam olay</code>: hedefin izin verdiği "kötü" olay sayısıdır. Bütçe varken yeni özellik çıkarılır; bütçe bitince ekip güvenilirliğe odaklanır. Bu, "hiç hata olmasın" yerine ölçülebilir bir risk dengesi kurar.</p>
<pre class="py">import datetime as dt
import veri

def teslim_sureleri():
    """Teslim edilen siparişlerin sipariş -&gt; teslim süresi (dakika)."""
    sonuc = []
    for s in veri.kayitlar("lezzet_kurye", "lk_orders"):
        if s["status"] == "teslim":
            a = dt.datetime.fromisoformat(s["placed_at"])
            b = dt.datetime.fromisoformat(s["delivered_at"])
            sonuc.append((b - a).total_seconds() / 60)
    return sonuc

from collections import defaultdict

ay = defaultdict(lambda: [0, 0])                    # ay -&gt; [iyi, toplam]
for s in veri.kayitlar("lezzet_kurye", "lk_orders"):
    if s["status"] != "teslim":
        continue
    sure = (dt.datetime.fromisoformat(s["delivered_at"]) - dt.datetime.fromisoformat(s["placed_at"])).total_seconds() / 60
    a = ay[s["placed_at"][:7]]
    a[0] += sure &lt;= 60
    a[1] += 1

HEDEF = 0.95
for k in ("2024-10", "2024-11", "2024-12"):
    iyi, toplam = ay[k]
    butce = (1 - HEDEF) * toplam
    harcanan = (toplam - iyi) / butce
    print(f"{k}: SLI=%{100 * iyi / toplam:.2f}  bütçe={butce:.0f} kötü olay  harcanan=%{100 * harcanan:.0f}")</pre>
<h3>Gürültüsüz alarm: yanma hızı (burn rate)</h3>
<p>"Hata oranı %5'i geçti" gibi anlık eşikler ya her küçük dalgalanmada çalar ya da yavaş sızan sorunu kaçırır. SRE yaklaşımı <b>yanma hızına</b> bakar: <code>yanma = gözlenen hata oranı / (1 - hedef)</code>. Yanma 1 ise bütçe tam dönem sonunda biter; 14.4 ise 30 günlük bütçenin %2'si 1 saatte yanar. Önerilen desen <b>çok pencereli</b> alarmdır: uzun pencere (1 saat) ve kısa pencere (5 dakika) birlikte eşiği aşınca sayfa (page) at; uzun pencere ciddiyeti, kısa pencere sorunun hâlâ sürdüğünü kanıtlar ve düzelince alarmın çabuk susmasını sağlar. Her alarmın bir runbook'u (ne yapılacağı) olmalı; eyleme dönüşmeyen alarm silinmeli.</p>

<h2>Hata takibi ve sağlık uç noktaları</h2>
<p>Sentry gibi hata takip araçları yakalanmamış istisnaları yığın izi, istek bağlamı, sürüm ve kullanıcı sayısıyla toplar; aynı hatayı tek bir "sorun" altında gruplar ve yeni sürümle gelen hatayı ilk dakikada bildirir. Kişisel veriyi göndermemek için <code>send_default_pii=False</code> ve <code>before_send</code> ile maskeleme yapılır.</p>
<pre class="code"># pip install "sentry-sdk[fastapi]"
import sentry_sdk
sentry_sdk.init(dsn=os.environ["SENTRY_DSN"], release="lezzet-api@2.4.1", environment="prod",
                traces_sample_rate=0.1, send_default_pii=False)

@app.get("/saglik/canli")        # liveness: süreç yanıt veriyor mu? (bağımlılıklara BAKMA)
def canli():
    return {"durum": "ok"}

@app.get("/saglik/hazir")        # readiness: trafik alabilir mi? (veritabanı, Redis)
def hazir():
    sorunlar = [ad for ad, kontrol in (("db", db_ping), ("redis", redis_ping)) if not kontrol()]
    if sorunlar:
        raise HTTPException(503, {"durum": "hazir_degil", "sorunlar": sorunlar})
    return {"durum": "ok"}</pre>
<p>Docker ve dağıtım dersinde <code>HEALTHCHECK</code>'i görmüştün. Kubernetes iki ayrı sonda kullanır: <b>liveness</b> başarısız olursa konteyner yeniden başlatılır; <b>readiness</b> başarısız olursa yalnız trafik kesilir. Veritabanı çökünce liveness'ı da başarısız yaparsan tüm podlar sürekli yeniden başlar ve sorun büyür; bağımlılık kontrolleri readiness'a aittir.</p>

<h2>Veri hattı gözlemlenebilirliği</h2>
<p>Veri mühendisliğinde "servis ayakta" yetmez: gece çalışan ETL hatasız bitip <b>boş</b> tablo yazabilir. Veri hatları için beş temel sinyal izlenir: <b>tazelik</b> (son kayıt ne kadar eski?), <b>hacim</b> (bugünkü satır sayısı olağan aralıkta mı?), <b>şema</b> (sütun eklendi/silindi/tipi değişti mi?), <b>dağılım</b> (boş değer oranı, değer aralığı) ve <b>soy</b> (lineage: bu tablo hangi kaynaktan besleniyor?). Orkestrasyon dersindeki görevlerin sonuna bu kontrolleri eklemek, bozuk verinin panolara ulaşmasını engeller.</p>
<pre class="py">import datetime as dt, statistics
from collections import Counter
import veri

siparisler = veri.kayitlar("lezzet_kurye", "lk_orders")
simdi = dt.datetime(2025, 1, 1, 2, 0)

son = max(dt.datetime.fromisoformat(s["placed_at"]) for s in siparisler)
print("tazelik:", round((simdi - son).total_seconds() / 60, 1), "dk önce son sipariş")

gunluk = Counter(s["placed_at"][:10] for s in siparisler)
son7 = [gunluk[(dt.date(2024, 12, 31) - dt.timedelta(days=i)).isoformat()] for i in range(1, 8)]
ort, sapma = statistics.mean(son7), statistics.stdev(son7)
print(f"31 Aralık hacmi: {gunluk['2024-12-31']} (önceki 7 gün ort. {ort:.1f}, z = {(gunluk['2024-12-31'] - ort) / sapma:.2f})")

beklenen = {"order_id", "customer_id", "restaurant_id", "courier_id", "placed_at", "picked_at",
            "delivered_at", "status", "payment", "delivery_fee", "discount", "tip"}
print("şema farkı:", set(siparisler[0]) ^ beklenen or "yok")</pre>
<div class="note"><b>Gerçek işte</b>Bir olay (incident) sonrası incelemede ilk sorulan, "bunu kullanıcıdan önce biz mi fark ettik?" sorusudur. Yeni bir servis yayına alınırken beklenen asgari set: JSON log + istek kimliği, RED metrikleri, temel izler, ayrı liveness/readiness uç noktaları, hata takibi ve en az bir kullanıcı odaklı SLO ile ona bağlı yanma hızı alarmı. Mülakatlarda "p95 ile ortalama farkı", "counter ile gauge", "SLO ve hata bütçesi" ve "alarm yorgunluğu" sık sorulur.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Exemplar ve sinyalleri birleştirmek</h3>
<p>Prometheus ve OpenTelemetry, histogram kovalarına örnek bir <code>trace_id</code> (exemplar) iliştirebilir; panelde yavaş noktaya tıklayıp doğrudan o ize gidersin. Loglara <code>trace_id</code> ve <code>span_id</code> eklemek (OpenTelemetry logging enstrümantasyonu bunu yapar) üç sütunu tek bir arama deneyimine bağlar.</p>
<h3>Maliyet yönetimi</h3>
<p>Gözlemlenebilirlik verisi hızla büyük bir fatura kalemine dönüşür. Debug logları üretimde örnekle, metrik etiketlerini sınırla, izlerde kuyruktan örnekleme kullan, saklama süresini sinyal türüne göre ayır (ham loglar 7 gün, toplanmış metrikler 13 ay).</p>
<h3>SLO'yu kullanıcıdan başlat</h3>
<p>İyi SLI kullanıcının gördüğü şeydir: "sipariş butonuna basınca 2 saniye içinde onay" ya da "60 dakikada teslim"; "CPU %80 altında" değil. Önce kullanıcı yolculuklarını (sipariş ver, kurye takip et, öde) belirle, her biri için bir ya da iki SLI seç, hedefi geçmiş verinin biraz altına koy ve hata bütçesi politikasını ürün ekibiyle birlikte yaz.</p>
</section>
`,
  ex: [
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Bildirim kuyruğunda <b>şu an</b> bekleyen mesaj sayısını hangi metrik türüyle yayınlamalısın?',
      o: ['Counter, çünkü mesajlar sayılıyor', 'Gauge', 'Histogram, çünkü dağılım önemli', 'Summary, çünkü yüzdelik gerekiyor'],
      a: 1,
      why: 'Kuyruk uzunluğu artar ve azalır; anlık değeri gösteren gauge\'dur. Counter yalnız artar ve "şimdiye kadar kaç mesaj geldi" sorusuna uygundur; artış hızı rate() ile alınır. Histogram ve summary tek tek gözlemlerin (süre, boyut) dağılımı içindir.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Ortalama teslim süresi 38 dakikada sabit kalırken müşteri şikâyetleri artıyor. Hangi gösterge sorunu en iyi ortaya çıkarır?',
      o: ['Ortalamanın günlük ortalaması', 'p95 ve p99 teslim süresi', 'Toplam sipariş sayısı', 'Medyanın (p50) haftalık ortalaması'],
      a: 1,
      why: 'Az sayıda çok uzun teslimat ortalamayı az oynatır ama o müşteriler şikâyet eder. p95 ve p99 dağılımın kuyruğunu, yani en kötü deneyimi gösterir. Medyan tipik müşteriyi gösterir, kuyruğu göstermez; yüzdeliklerin ortalamasını almak da matematiksel olarak anlamsızdır.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Kubernetes\'te çalışan API\'nin veritabanı 5 dakikalığına erişilemez oldu. Doğru sonda davranışı hangisi?',
      o: ['Liveness başarısız olmalı ki podlar yeniden başlasın', 'Readiness başarısız, liveness başarılı kalmalı', 'İkisi de başarısız olmalı', 'İkisi de başarılı kalmalı, hata zaten loglanıyor'],
      a: 1,
      why: 'Readiness başarısız olunca pod trafikten çıkarılır ama süreç yaşar; veritabanı dönünce hemen hazır olur. Liveness\'ı bağımlılığa bağlamak tüm podları sürekli yeniden başlatır (yeniden başlatma fırtınası) ve iyileşmeyi geciktirir. Liveness yalnız "süreç takıldı mı" sorusunu cevaplamalı.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'contextvars ve asyncio görevleri: bu kod ne yazdırır?',
      code: 'import asyncio, contextvars\n\nkimlik = contextvars.ContextVar("kimlik", default="yok")\n\nasync def istek(ad):\n    kimlik.set(ad)\n    await asyncio.sleep(0)\n    return kimlik.get()\n\nasync def main():\n    kimlik.set("ana")\n    sonuc = await asyncio.gather(istek("a"), istek("b"))\n    return sonuc, kimlik.get()\n\nprint(asyncio.run(main()))\n',
      o: ['([\'a\', \'b\'], \'ana\')', '([\'b\', \'b\'], \'b\')', '([\'a\', \'b\'], \'b\')', '([\'ana\', \'ana\'], \'ana\')'],
      a: 0,
      why: 'gather her coroutine\'i bir göreve sarar ve her görev, oluşturulduğu andaki bağlamın bir kopyasında çalışır. Görev içindeki set yalnız o kopyayı değiştirir: a ve b birbirini ezmez, ana bağlam da "ana" olarak kalır. Global değişken kullansaydın ikisi de "b" görebilirdi.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'En yakın sıra yöntemiyle yüzdelik: bu kod ne yazdırır?',
      code: 'import math\n\ndef yuzdelik(v, p):\n    s = sorted(v)\n    return s[max(1, math.ceil(p / 100 * len(s))) - 1]\n\nsureler = [31, 22, 95, 40, 28, 35, 44, 38, 29, 50]\nprint(yuzdelik(sureler, 50), yuzdelik(sureler, 90), yuzdelik(sureler, 95), sum(sureler) / len(sureler))\n',
      o: ['35 50 95 41.2', '36.5 50 95 41.2', '35 95 95 41.2', '38 50 95 41.2'],
      a: 0,
      why: 'Sıralı liste: 22, 28, 29, 31, 35, 38, 40, 44, 50, 95. p50: ceil(5) = 5. eleman 35; p90: ceil(9) = 9. eleman 50; p95: ceil(9.5) = 10. eleman 95. Tek bir 95 dakikalık teslimat ortalamayı medyanın üstüne (41.2) çekiyor. 36.5 doğrusal ara değer yöntemiyle bulunurdu.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Hata bütçesi hesabı: bu kod ne yazdırır?',
      code: 'toplam, kotu, hedef = 2537, 96, 0.95\nbutce = round((1 - hedef) * toplam)\nprint(butce, f"%{100 * kotu / butce:.0f}", "dondur" if kotu > butce else "devam")\nyanma = (kotu / toplam) / (1 - hedef)\nprint(round(yanma, 2))\n',
      o: ['127 %76 devam\n0.76', '127 %76 devam\n0.04', '96 %100 dondur\n1.0', '127 %24 devam\n0.76'],
      a: 0,
      why: '%5 bütçe 2537 olayın 126.85 ≈ 127\'sidir. 96 kötü olay bütçenin %76\'sı; bütçe bitmediği için yeni özellik çıkarmaya devam edilebilir. Yanma hızı gözlenen hata oranının (96/2537 ≈ %3.78) izin verilen orana (%5) bölümüdür: 0.76, yani bütçe dönem bitmeden tükenmeyecek.'
    },
    {
      t: 'order',
      stage: 'Kodu oku',
      q: '<p>Prometheus tarzı <b>kümülatif</b> histogram kovalarını (her kova kendi sınırına kadar olan tüm gözlemleri sayar, <code>le</code> = küçük ya da eşit) üreten programın satırlarını sırala.</p>',
      lines: ['sinirlar = [30, 45, 60, float("inf")]', 'gozlemler = [22, 36, 41, 58, 75, 30]', 'kovalar = {s: 0 for s in sinirlar}', 'for g in gozlemler:', '    for s in sinirlar:', '        if g <= s:', '            kovalar[s] += 1', 'print(list(kovalar.values()), sum(gozlemler), len(gozlemler))'],
      expect: '[2, 4, 5, 6] 262 6\n',
      hint: 'Kova sözlüğü döngüden önce kurulur; her gözlem, sınırı kendisinden büyük ya da eşit olan TÜM kovaları artırır.',
      why: 'Kümülatif kovalarda her gözlem birden çok kovayı artırır; +Inf kovası toplam adede eşittir. _sum ve _count ile birlikte bu yapı, birden çok sunucunun histogramlarını kovaları toplayarak birleştirmeye ve yüzdeliği sonradan tahmin etmeye izin verir.'
    },
    {
      id: 'gozlemlenebilirlik-1',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p>Gerçek Lezzet Kurye teslim sürelerinin özetini çıkar. <code>yuzdelik(degerler, p)</code> en yakın sıra yöntemiyle p. yüzdeliği döndürsün: listeyi sırala, <code>k = ceil(p / 100 × n)</code> (en az 1), <code>k</code>. eleman (1 tabanlı). Boş listede <code>ValueError</code>. Sonra <code>ozet(degerler)</code> <code>{"adet", "ortalama", "p50", "p95", "p99", "max"}</code> sözlüğü döndürsün (sayılar 1 ondalığa yuvarlanmış; adet tam sayı). Hazır <code>teslim_sureleri()</code> dakika listesi verir.</p>',
      guide: ['yuzdelik: önce boş liste kontrolü, sonra sorted.', 'k = max(1, math.ceil(p / 100 * len(s))); dönüş s[k - 1].', 'ozet: statistics.mean ile ortalama; her değeri round(..., 1) ile yuvarla.'],
      example: 'import math\nn = 20\nfor p in (50, 95, 99):\n    print(p, math.ceil(p / 100 * n))\n',
      start: 'import datetime as dt\nimport veri\n\ndef teslim_sureleri():\n    """Teslim edilen siparişlerin sipariş -> teslim süresi (dakika)."""\n    sonuc = []\n    for s in veri.kayitlar("lezzet_kurye", "lk_orders"):\n        if s["status"] == "teslim":\n            a = dt.datetime.fromisoformat(s["placed_at"])\n            b = dt.datetime.fromisoformat(s["delivered_at"])\n            sonuc.append((b - a).total_seconds() / 60)\n    return sonuc\n\nimport math, statistics\n\ndef yuzdelik(degerler, p):\n    # TODO: en yakın sıra yöntemi\n    pass\n\ndef ozet(degerler):\n    # TODO\n    pass\n\nprint(ozet(teslim_sureleri()))\n',
      sol: 'import datetime as dt\nimport veri\n\ndef teslim_sureleri():\n    """Teslim edilen siparişlerin sipariş -> teslim süresi (dakika)."""\n    sonuc = []\n    for s in veri.kayitlar("lezzet_kurye", "lk_orders"):\n        if s["status"] == "teslim":\n            a = dt.datetime.fromisoformat(s["placed_at"])\n            b = dt.datetime.fromisoformat(s["delivered_at"])\n            sonuc.append((b - a).total_seconds() / 60)\n    return sonuc\n\nimport math, statistics\n\ndef yuzdelik(degerler, p):\n    if not degerler:\n        raise ValueError("boş liste")\n    s = sorted(degerler)\n    k = max(1, math.ceil(p / 100 * len(s)))\n    return s[k - 1]\n\ndef ozet(degerler):\n    return {\n        "adet": len(degerler),\n        "ortalama": round(statistics.mean(degerler), 1),\n        "p50": round(yuzdelik(degerler, 50), 1),\n        "p95": round(yuzdelik(degerler, 95), 1),\n        "p99": round(yuzdelik(degerler, 99), 1),\n        "max": round(max(degerler), 1),\n    }\n\nprint(ozet(teslim_sureleri()))\n',
      tests: 'assert yuzdelik([31, 22, 95, 40, 28, 35, 44, 38, 29, 50], 50) == 35, "10 elemanda p50 5. sıradaki eleman"\nassert yuzdelik([7], 99) == 7 and yuzdelik([5, 1], 1) == 1, "küçük listeler; k en az 1"\nassert yuzdelik([3, 1, 2], 100) == 3, "p100 en büyük eleman"\ntry:\n    yuzdelik([], 50)\n    assert False, "boş listede ValueError bekleniyordu"\nexcept ValueError:\n    pass\no = ozet(teslim_sureleri())\nassert o["adet"] == 6638, f"6638 teslim edilmiş sipariş var: {o[\'adet\']}"\nassert o["p50"] == 36.8 and o["p95"] == 57.1 and o["p99"] == 69.1, f"yüzdelikler beklenenden farklı: {o}"\nassert o["max"] == 85.1, "en uzun teslim 85.1 dk"\nassert o["ortalama"] < o["p95"], "ortalama kuyruğu göstermez"\n',
      hints: ['Yöntem: sırala, k = ceil(p/100 × n), k. eleman (indeks k - 1).', 'max(1, ...) p çok küçükken indeksin -1 olmasını önler.', 'round(yuzdelik(degerler, 95), 1)'],
      why: 'En yakın sıra yöntemi her zaman gerçekten gözlenmiş bir değer döndürür ve açıklaması kolaydır: "siparişlerin %95\'i 57.1 dakikada ya da daha kısa sürede teslim edildi". numpy.percentile varsayılan olarak doğrusal ara değer kullanır ve biraz farklı sonuç verebilir; raporda yöntemi belirtmek gerekir.'
    },
    {
      id: 'gozlemlenebilirlik-2',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Etiketli sayaç ve ölçer tutan <code>MetrikKaydi</code> sınıfını yaz ve Prometheus metin biçiminde dışarı ver.</p><ul><li><code>sayac_artir(ad, etiketler=None, n=1)</code>: <code>n &lt; 0</code> ise <code>ValueError</code> (sayaç azalamaz).</li><li><code>olcer_ayarla(ad, deger, etiketler=None)</code>: anlık değeri yazar.</li><li><code>metin()</code>: her seri için bir satır: <code>ad{etiket="deger",...} sayı</code>; etiket yoksa yalnız <code>ad sayı</code>. Etiketler ada göre sıralı, seriler (ad, etiketler) sırasına göre sıralı, satırlar <code>\\n</code> ile birleşik. Sayılar <code>int</code> ise tam sayı, değilse olduğu gibi yazılsın.</li></ul>',
      guide: ['Seriyi (ad, tuple(sorted(etiketler.items()))) anahtarıyla bir sözlükte tut; aynı etiketler aynı seri olur.', 'sayac_artir: n kontrolü, sonra get(anahtar, 0) + n.', 'metin: sorted(self.seriler.items()) üzerinde gez; etiket metnini ",".join(f\'{k}="{v}"\') ile kur.', 'Etiket varsa "{...}" ekle, yoksa ekleme.'],
      example: 'etiketler = {"sehir": "İzmir", "durum": "teslim"}\nanahtar = tuple(sorted(etiketler.items()))\nprint(anahtar)\nprint(",".join(f\'{k}="{v}"\' for k, v in anahtar))\n',
      start: 'class MetrikKaydi:\n    def __init__(self):\n        self.seriler = {}\n\n    def _anahtar(self, ad, etiketler):\n        return (ad, tuple(sorted((etiketler or {}).items())))\n\n    def sayac_artir(self, ad, etiketler=None, n=1):\n        # TODO\n        pass\n\n    def olcer_ayarla(self, ad, deger, etiketler=None):\n        # TODO\n        pass\n\n    def metin(self):\n        # TODO\n        return ""\n',
      sol: 'class MetrikKaydi:\n    def __init__(self):\n        self.seriler = {}\n\n    def _anahtar(self, ad, etiketler):\n        return (ad, tuple(sorted((etiketler or {}).items())))\n\n    def sayac_artir(self, ad, etiketler=None, n=1):\n        if n < 0:\n            raise ValueError("sayaç azalamaz")\n        k = self._anahtar(ad, etiketler)\n        self.seriler[k] = self.seriler.get(k, 0) + n\n\n    def olcer_ayarla(self, ad, deger, etiketler=None):\n        self.seriler[self._anahtar(ad, etiketler)] = deger\n\n    def metin(self):\n        satirlar = []\n        for (ad, etiket), deger in sorted(self.seriler.items()):\n            ek = "{" + ",".join(f\'{k}="{v}"\' for k, v in etiket) + "}" if etiket else ""\n            satirlar.append(f"{ad}{ek} {deger}")\n        return "\\n".join(satirlar)\n',
      tests: 'm = MetrikKaydi()\nm.sayac_artir("siparis_toplam", {"sehir": "İzmir", "odeme": "kart"})\nm.sayac_artir("siparis_toplam", {"odeme": "kart", "sehir": "İzmir"}, 2)\nm.sayac_artir("siparis_toplam", {"sehir": "Ankara", "odeme": "nakit"})\nm.olcer_ayarla("bildirim_kuyrugu", 12)\nm.olcer_ayarla("bildirim_kuyrugu", 7)\nm.olcer_ayarla("aktif_kurye", 4.5, {"sehir": "İzmir"})\nbeklenen = \'aktif_kurye{sehir="İzmir"} 4.5\\nbildirim_kuyrugu 7\\nsiparis_toplam{odeme="kart",sehir="İzmir"} 3\\nsiparis_toplam{odeme="nakit",sehir="Ankara"} 1\'\nassert m.metin() == beklenen, f"çıktı farklı:\\n{m.metin()}"\ntry:\n    m.sayac_artir("siparis_toplam", n=-1)\n    assert False, "negatif artış ValueError vermeli"\nexcept ValueError:\n    pass\nassert MetrikKaydi().metin() == "", "boş kayıt boş metin"\n',
      hints: ['Etiket sırası farklı gelse de aynı seri olmalı: sorted(etiketler.items()).', 'Gauge son değeri tutar (atama), counter biriktirir (toplama).', 'Etiket metni: "{" + ",".join(f\'{k}="{v}"\' for k, v in etiket) + "}"'],
      why: 'Prometheus\'un metin biçimi (exposition format) tam olarak budur ve her (ad, etiket kümesi) birleşimi ayrı bir zaman serisidir. Sayaçların yalnız artması, rate() hesabının ve süreç yeniden başlayınca sıfırlanmanın tespit edilebilmesinin temelidir; azalan bir şey ölçüyorsan gauge kullan.'
    },
    {
      id: 'gozlemlenebilirlik-3',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>İstek kimliğini loglara taşıyan bir ara katman yaz.</p><ul><li><code>istek_kimligi</code>: varsayılanı <code>"-"</code> olan bir <code>ContextVar</code>.</li><li><code>KimlikFiltresi(logging.Filter)</code>: her kayda <code>request_id</code> özniteliğini ekleyip <code>True</code> döndürsün.</li><li><code>kimlikle(fonk)</code> dekoratörü: sarılan fonksiyon <code>(basliklar, *args)</code> alır; <code>basliklar.get("X-Request-ID")</code> varsa onu, yoksa <code>yeni_kimlik()</code>\'i kullanarak değişkeni ayarlasın, fonksiyonu çağırsın ve <b>hata olsa bile</b> <code>reset(token)</code> ile eski değere dönsün.</li></ul><p>Log biçimi ve <code>yeni_kimlik</code> hazır.</p>',
      guide: ['ContextVar("istek_kimligi", default="-") tanımla.', 'Filtrede kayit.request_id = istek_kimligi.get().', 'Dekoratörde: kimlik = basliklar.get("X-Request-ID") or yeni_kimlik(); token = istek_kimligi.set(kimlik).', 'try: return fonk(...) finally: istek_kimligi.reset(token).'],
      example: 'import contextvars\nv = contextvars.ContextVar("v", default=0)\ntoken = v.set(5)\nprint(v.get())\nv.reset(token)\nprint(v.get())\n',
      start: 'import contextvars, functools, io, itertools, logging\n\n_sayac = itertools.count(1)\ndef yeni_kimlik():\n    return f"req-{next(_sayac):04d}"\n\n# TODO: istek_kimligi ContextVar\n\nclass KimlikFiltresi(logging.Filter):\n    def filter(self, kayit):\n        # TODO\n        return True\n\ndef kimlikle(fonk):\n    # TODO\n    return fonk\n\nakim = io.StringIO()\n_h = logging.StreamHandler(akim)\n_h.setFormatter(logging.Formatter("%(request_id)s %(levelname)s %(message)s"))\n_h.addFilter(KimlikFiltresi())\nlog = logging.getLogger("lezzet.api")\nlog.handlers[:] = [_h]\nlog.setLevel(logging.INFO)\nlog.propagate = False\n',
      sol: 'import contextvars, functools, io, itertools, logging\n\n_sayac = itertools.count(1)\ndef yeni_kimlik():\n    return f"req-{next(_sayac):04d}"\n\nistek_kimligi = contextvars.ContextVar("istek_kimligi", default="-")\n\nclass KimlikFiltresi(logging.Filter):\n    def filter(self, kayit):\n        kayit.request_id = istek_kimligi.get()\n        return True\n\ndef kimlikle(fonk):\n    @functools.wraps(fonk)\n    def sarmal(basliklar, *args, **kwargs):\n        token = istek_kimligi.set(basliklar.get("X-Request-ID") or yeni_kimlik())\n        try:\n            return fonk(basliklar, *args, **kwargs)\n        finally:\n            istek_kimligi.reset(token)\n    return sarmal\n\nakim = io.StringIO()\n_h = logging.StreamHandler(akim)\n_h.setFormatter(logging.Formatter("%(request_id)s %(levelname)s %(message)s"))\n_h.addFilter(KimlikFiltresi())\nlog = logging.getLogger("lezzet.api")\nlog.handlers[:] = [_h]\nlog.setLevel(logging.INFO)\nlog.propagate = False\n',
      tests: '@kimlikle\ndef siparis_ver(basliklar, siparis_id):\n    log.info("sipariş %s alındı", siparis_id)\n    if siparis_id < 0:\n        raise ValueError("geçersiz")\n    return istek_kimligi.get()\nassert siparis_ver({"X-Request-ID": "abc-123"}, 7) == "abc-123", "başlıktaki kimlik kullanılmalı"\nassert siparis_ver({}, 8) == "req-0001", "başlık yoksa yeni kimlik üretilmeli"\ntry:\n    siparis_ver({"X-Request-ID": "hata-1"}, -1)\nexcept ValueError:\n    pass\nassert istek_kimligi.get() == "-", "istek bitince (hata olsa da) kimlik sıfırlanmalı"\nlog.info("arka plan işi")\nassert akim.getvalue().splitlines() == ["abc-123 INFO sipariş 7 alındı", "req-0001 INFO sipariş 8 alındı", "hata-1 INFO sipariş -1 alındı", "- INFO arka plan işi"], f"log satırları farklı:\\n{akim.getvalue()}"\nassert siparis_ver.__name__ == "siparis_ver", "functools.wraps ile adı koru"\n',
      hints: ['Filtre kaydı değiştirebilir: kayit.request_id = ...; formatter %(request_id)s ile okur.', 'set() bir token döndürür; reset(token) önceki değere döner.', 'reset\'i finally bloğuna koy ki istisna da temizlensin.'],
      why: 'İstek kimliği, binlerce satır log arasında tek bir isteğin hikâyesini bulmanın anahtarıdır; istemciden gelen X-Request-ID\'yi kullanmak, kimliği servisler arasında taşır. reset unutulursa iş parçacığı havuzunda sonraki istek (ya da arka plan işi) önceki isteğin kimliğiyle loglanır ve inceleme yanlış yöne gider.'
    },
    {
      id: 'gozlemlenebilirlik-4',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Prometheus tarzı <code>Histogram(sinirlar)</code> yaz. <code>sinirlar</code> artan sayılardır; sona otomatik olarak <code>float("inf")</code> eklenir.</p><ul><li><code>gozlemle(deger)</code>: değeri, sınırı değerden büyük ya da eşit olan <b>ilk</b> kovaya sayar; <code>toplam</code> ve <code>adet</code>\'i günceller.</li><li><code>kumulatif()</code>: <code>[(sinir, o sınıra kadarki toplam adet), ...]</code> listesi (son eleman <code>(inf, adet)</code>).</li></ul><p>Sonra gerçek teslim süreleriyle <code>[20, 30, 40, 45, 60, 75]</code> sınırlı bir histogram doldur ve <code>sure_hist</code> adıyla bırak.</p>',
      guide: ['Kovaları kümülatif değil, ayrık (her kova yalnız kendi aralığı) tut; kumulatif() hesaplasın.', 'bisect.bisect_left(sinirlar, deger) değerin gireceği ilk kovanın indeksini verir (eşitlik o kovaya girer).', 'kumulatif: itertools.accumulate ile ayrık sayıları topla, sınırlarla zip et.', 'Teslim sürelerini döngüyle gözlemle.'],
      example: 'import bisect, itertools\nsinirlar = [10, 20, float("inf")]\nprint(bisect.bisect_left(sinirlar, 10), bisect.bisect_left(sinirlar, 15), bisect.bisect_left(sinirlar, 99))\nprint(list(itertools.accumulate([2, 3, 1])))\n',
      start: 'import datetime as dt\nimport veri\n\ndef teslim_sureleri():\n    """Teslim edilen siparişlerin sipariş -> teslim süresi (dakika)."""\n    sonuc = []\n    for s in veri.kayitlar("lezzet_kurye", "lk_orders"):\n        if s["status"] == "teslim":\n            a = dt.datetime.fromisoformat(s["placed_at"])\n            b = dt.datetime.fromisoformat(s["delivered_at"])\n            sonuc.append((b - a).total_seconds() / 60)\n    return sonuc\n\nimport bisect, itertools\n\nclass Histogram:\n    def __init__(self, sinirlar):\n        self.sinirlar = list(sinirlar) + [float("inf")]\n        self.kovalar = [0] * len(self.sinirlar)\n        self.toplam = 0.0\n        self.adet = 0\n\n    def gozlemle(self, deger):\n        # TODO\n        pass\n\n    def kumulatif(self):\n        # TODO\n        return []\n\nsure_hist = Histogram([20, 30, 40, 45, 60, 75])\n# TODO: teslim sürelerini gözlemle\n',
      sol: 'import datetime as dt\nimport veri\n\ndef teslim_sureleri():\n    """Teslim edilen siparişlerin sipariş -> teslim süresi (dakika)."""\n    sonuc = []\n    for s in veri.kayitlar("lezzet_kurye", "lk_orders"):\n        if s["status"] == "teslim":\n            a = dt.datetime.fromisoformat(s["placed_at"])\n            b = dt.datetime.fromisoformat(s["delivered_at"])\n            sonuc.append((b - a).total_seconds() / 60)\n    return sonuc\n\nimport bisect, itertools\n\nclass Histogram:\n    def __init__(self, sinirlar):\n        self.sinirlar = list(sinirlar) + [float("inf")]\n        self.kovalar = [0] * len(self.sinirlar)\n        self.toplam = 0.0\n        self.adet = 0\n\n    def gozlemle(self, deger):\n        self.kovalar[bisect.bisect_left(self.sinirlar, deger)] += 1\n        self.toplam += deger\n        self.adet += 1\n\n    def kumulatif(self):\n        return list(zip(self.sinirlar, itertools.accumulate(self.kovalar)))\n\nsure_hist = Histogram([20, 30, 40, 45, 60, 75])\nfor _d in teslim_sureleri():\n    sure_hist.gozlemle(_d)\n',
      tests: 'h = Histogram([30, 45, 60])\nfor g in [22, 36, 41, 58, 75, 30]:\n    h.gozlemle(g)\nassert h.kumulatif() == [(30, 2), (45, 4), (60, 5), (float("inf"), 6)], f"kümülatif kovalar farklı: {h.kumulatif()}"\nassert h.toplam == 262 and h.adet == 6, "_sum ve _count tutulmalı"\nk = dict(sure_hist.kumulatif())\nassert sure_hist.adet == 6638 and k[float("inf")] == 6638, "tüm teslim süreleri gözlemlenmeli"\nassert k[45] == 5130 and k[60] == 6416, f"45 ve 60 dk kovaları beklenenden farklı: {k}"\nassert abs(k[60] / sure_hist.adet - 0.9666) < 0.0001, "60 dk içinde teslim oranı yaklaşık %96.66"\nassert list(k.values()) == sorted(k.values()), "kümülatif sayılar azalmamalı"\n',
      hints: ['Eşitlik kuralı: değer tam sınıra eşitse o kovaya girer (le); bisect_left bunu sağlar.', 'kumulatif: list(zip(self.sinirlar, itertools.accumulate(self.kovalar)))', 'for d in teslim_sureleri(): sure_hist.gozlemle(d)'],
      why: 'Histogram yalnız kova sayılarını tutar, tek tek değerleri değil; bu yüzden bellek sabittir ve farklı sunuculardaki histogramlar kovalar toplanarak birleştirilir. Bedeli çözünürlüktür: kova sınırlarını SLO eşiğine (60 dk) ve ilgilendiğin bölgeye göre seçmezsen yüzdelik tahmini kaba olur.'
    },
    {
      id: 'gozlemlenebilirlik-5',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Lezzet Kurye teslimat SLO raporu: <i>"Her ay, teslim edilen siparişlerin <code>hedef</code> oranı <code>esik_dk</code> dakika içinde teslim edilmeli."</i> <code>slo_raporu(siparisler, esik_dk, hedef)</code> yalnız <code>status == "teslim"</code> siparişleri <code>placed_at</code>\'in ayına (<code>"2024-10"</code>) göre gruplayıp şu sözlüğü döndürsün: <code>{ay: {"toplam", "iyi", "sli", "butce", "harcanan", "durum"}}</code></p><ul><li><code>sli</code> = iyi / toplam × 100 (2 ondalık)</li><li><code>butce</code> = (1 - hedef) × toplam (2 ondalık): izin verilen kötü olay sayısı</li><li><code>harcanan</code> = kötü / bütçe × 100 (1 ondalık); bütçe 0 ise kötü olay varsa <code>float("inf")</code>, yoksa 0.0</li><li><code>durum</code>: harcanan 100\'ü aşarsa <code>"ihlal"</code>, 75\'i aşarsa <code>"riskli"</code>, değilse <code>"saglikli"</code></li></ul><p>Süre <code>delivered_at - placed_at</code> (dakika); eşik dahil (<code>&lt;=</code>).</p>',
      start: 'import datetime as dt\nimport veri\n\ndef slo_raporu(siparisler, esik_dk, hedef):\n    pass\n\nprint(slo_raporu(veri.kayitlar("lezzet_kurye", "lk_orders"), 60, 0.95)["2024-10"])\n',
      sol: 'import datetime as dt\nfrom collections import defaultdict\nimport veri\n\ndef slo_raporu(siparisler, esik_dk, hedef):\n    sayim = defaultdict(lambda: [0, 0])\n    for s in siparisler:\n        if s["status"] != "teslim":\n            continue\n        sure = (dt.datetime.fromisoformat(s["delivered_at"]) - dt.datetime.fromisoformat(s["placed_at"])).total_seconds() / 60\n        a = sayim[s["placed_at"][:7]]\n        a[0] += sure <= esik_dk\n        a[1] += 1\n    rapor = {}\n    for ay, (iyi, toplam) in sorted(sayim.items()):\n        kotu = toplam - iyi\n        butce = (1 - hedef) * toplam\n        if butce > 0:\n            harcanan = round(kotu / butce * 100, 1)\n        else:\n            harcanan = float("inf") if kotu else 0.0\n        durum = "ihlal" if harcanan > 100 else "riskli" if harcanan > 75 else "saglikli"\n        rapor[ay] = {"toplam": toplam, "iyi": iyi, "sli": round(iyi / toplam * 100, 2),\n                     "butce": round(butce, 2), "harcanan": harcanan, "durum": durum}\n    return rapor\n\nprint(slo_raporu(veri.kayitlar("lezzet_kurye", "lk_orders"), 60, 0.95)["2024-10"])\n',
      tests: '_o = veri.kayitlar("lezzet_kurye", "lk_orders")\nr = slo_raporu(_o, 60, 0.95)\nassert r["2024-10"] == {"toplam": 1931, "iyi": 1869, "sli": 96.79, "butce": 96.55, "harcanan": 64.2, "durum": "saglikli"}, f"Ekim raporu farklı: {r[\'2024-10\']}"\nassert r["2024-12"]["iyi"] == 2441 and r["2024-12"]["durum"] == "riskli", f"Aralık riskli olmalı (bütçenin %75\'inden fazlası yandı): {r[\'2024-12\']}"\nassert r["2024-11"]["sli"] == 97.05, "Kasım SLI %97.05"\nr45 = slo_raporu(_o, 45, 0.95)\nassert r45["2024-10"]["iyi"] == 1484 and r45["2024-10"]["durum"] == "ihlal", "45 dk eşiğinde Ekim SLO\'yu ihlal eder"\nassert r["2025-01"]["harcanan"] == 0.0 and r["2025-01"]["butce"] == 0.05, "tek siparişli ay"\nassert slo_raporu([{"status": "teslim", "placed_at": "2024-10-01 10:00:00", "delivered_at": "2024-10-01 11:30:00"}], 60, 1.0)["2024-10"]["harcanan"] == float("inf"), "bütçe 0 ve kötü olay varsa sonsuz"\n',
      hints: ['Önce ay başına [iyi, toplam] say; sonra her ay için oranları hesapla.', 'bütçe = (1 - hedef) × toplam; harcanan = (toplam - iyi) / bütçe × 100.', '%100 hedef "hiç hata yok" demektir; bütçe sıfırdır ve bölme hatasını ayrıca ele alman gerekir.'],
      why: 'Hata bütçesi SLO\'yu bir karar aracına çevirir: Ekim\'de bütçenin %64\'ü harcandı (yeni özellik çıkarılabilir), Aralık\'ta %80\'i (riskli: dağıtımlar yavaşlatılır, kök neden çalışması yapılır). Aynı veride eşiği 45 dakikaya çekmek SLO\'yu ihlal ettirir; hedef ve eşik geçmiş veriye bakılarak, kullanıcı beklentisiyle birlikte seçilir.'
    },
    {
      id: 'gozlemlenebilirlik-6',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Erişim loglarından RED metrikleri çıkar. <code>red_ozeti(kayitlar)</code>; her kayıt <code>{"zaman": saniye, "yol": "/siparis", "durum": 200, "sure_ms": 84}</code> biçimindedir. Her <code>yol</code> için:</p><ul><li><code>hiz</code>: istek/saniye = adet / (son zaman - ilk zaman); süre 0 ise <code>float(adet)</code> (2 ondalık)</li><li><code>hata_orani</code>: durum kodu 500 ve üzeri olanların yüzdesi (2 ondalık; 4xx istemci hatasıdır, sayma)</li><li><code>p50</code>, <code>p95</code>: <code>sure_ms</code> için en yakın sıra yüzdeliği</li></ul><p><code>{yol: {"adet", "hiz", "hata_orani", "p50", "p95"}}</code> döndür. Zamanlar global değil, <b>o yolun</b> ilk ve son kaydından hesaplanır.</p>',
      start: 'import math\n\ndef red_ozeti(kayitlar):\n    pass\n',
      sol: 'import math\nfrom collections import defaultdict\n\ndef _yuzdelik(v, p):\n    s = sorted(v)\n    return s[max(1, math.ceil(p / 100 * len(s))) - 1]\n\ndef red_ozeti(kayitlar):\n    gruplar = defaultdict(list)\n    for k in kayitlar:\n        gruplar[k["yol"]].append(k)\n    sonuc = {}\n    for yol, g in gruplar.items():\n        zamanlar = [k["zaman"] for k in g]\n        sure = max(zamanlar) - min(zamanlar)\n        adet = len(g)\n        hata = sum(k["durum"] >= 500 for k in g)\n        sureler = [k["sure_ms"] for k in g]\n        sonuc[yol] = {\n            "adet": adet,\n            "hiz": round(adet / sure, 2) if sure else float(adet),\n            "hata_orani": round(100 * hata / adet, 2),\n            "p50": _yuzdelik(sureler, 50),\n            "p95": _yuzdelik(sureler, 95),\n        }\n    return sonuc\n',
      tests: 'import random\nrng = random.Random(3)\nkayit = []\nfor i in range(200):\n    kayit.append({"zaman": i * 0.5, "yol": "/siparis", "durum": 503 if i % 40 == 0 else (404 if i % 25 == 0 else 200), "sure_ms": 80 + (i % 20) * 5})\nkayit.append({"zaman": 10, "yol": "/saglik", "durum": 200, "sure_ms": 2})\nrng.shuffle(kayit)\nr = red_ozeti(kayit)\ns = r["/siparis"]\nassert s["adet"] == 200 and s["hiz"] == 2.01, f"200 istek / 99.5 sn = 2.01 rps: {s}"\nassert s["hata_orani"] == 2.5, "yalnız 5xx hata sayılır: 5/200 = %2.5 (404\'ler hariç)"\nassert s["p50"] == 125 and s["p95"] == 170, f"süre yüzdelikleri farklı: {s}"\nassert r["/saglik"] == {"adet": 1, "hiz": 1.0, "hata_orani": 0.0, "p50": 2, "p95": 2}, "tek kayıtlı yol"\nassert red_ozeti([]) == {}, "boş log"\n',
      hints: ['Önce yola göre grupla (defaultdict(list)).', 'Hata sayımı: sum(k["durum"] >= 500 for k in g).', 'Kayıtlar karışık sırada gelebilir: zaman için min/max, yüzdelik için sorted kullan.'],
      why: 'RED üçlüsü her servis panosunun ilk satırıdır. 4xx kodları çoğunlukla istemcinin hatasıdır (yanlış id, yetkisiz istek) ve servisin sağlığını ölçen hata oranına katılmaz; aksi hâlde bir botun 404 taraması gereksiz alarm üretir. Gerçekte bu hesap logdan değil, servisin kendi yayınladığı sayaç ve histogramlardan yapılır.'
    },
    {
      id: 'gozlemlenebilirlik-7',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Bir iz (trace) toplayıcı yaz: <code>Izci(saat)</code>; <code>saat()</code> milisaniye döndürür.</p><ul><li><code>span(ad, **oznitelik)</code> bir bağlam yöneticisi döndürsün (<code>contextlib.contextmanager</code> kullanabilirsin). Etkin span bir <code>ContextVar</code>\'da tutulur. Yeni span: üst span varsa onun <code>trace_id</code>\'sini alır, yoksa yeni <code>trace_id</code> (<code>"t1"</code>, <code>"t2"</code>...) üretir. <code>span_id</code> <code>"s1"</code>, <code>"s2"</code>... Bitince <code>{"ad", "trace_id", "span_id", "ust", "bas", "son", "oznitelik", "hata"}</code> sözlüğü <code>self.bitenler</code>\'e eklenir; <code>ust</code> üst span\'in id\'si ya da <code>None</code>.</li><li>Blok içinde istisna çıkarsa <code>"hata"</code> istisnanın sınıf adı olur (yoksa <code>None</code>) ve istisna <b>dışarı yayılır</b>.</li><li><code>kritik_yol(trace_id)</code>: kök span\'den başlayıp her adımda en uzun süren çocuğa inerek span adlarının listesini döndürsün.</li></ul>',
      start: 'import contextvars, itertools\nfrom contextlib import contextmanager\n\nclass Izci:\n    def __init__(self, saat):\n        self.saat = saat\n        self.bitenler = []\n',
      sol: 'import contextvars, itertools\nfrom contextlib import contextmanager\n\nclass Izci:\n    def __init__(self, saat):\n        self.saat = saat\n        self.bitenler = []\n        self.etkin = contextvars.ContextVar("etkin_span", default=None)\n        self._span_no = itertools.count(1)\n        self._iz_no = itertools.count(1)\n\n    @contextmanager\n    def span(self, ad, **oznitelik):\n        ust = self.etkin.get()\n        s = {"ad": ad,\n             "trace_id": ust["trace_id"] if ust else f"t{next(self._iz_no)}",\n             "span_id": f"s{next(self._span_no)}",\n             "ust": ust["span_id"] if ust else None,\n             "bas": self.saat(), "son": None, "oznitelik": oznitelik, "hata": None}\n        token = self.etkin.set(s)\n        try:\n            yield s\n        except BaseException as e:\n            s["hata"] = type(e).__name__\n            raise\n        finally:\n            s["son"] = self.saat()\n            self.etkin.reset(token)\n            self.bitenler.append(s)\n\n    def kritik_yol(self, trace_id):\n        spanlar = [s for s in self.bitenler if s["trace_id"] == trace_id]\n        dugum = next(s for s in spanlar if s["ust"] is None)\n        yol = [dugum["ad"]]\n        while True:\n            cocuklar = [s for s in spanlar if s["ust"] == dugum["span_id"]]\n            if not cocuklar:\n                return yol\n            dugum = max(cocuklar, key=lambda s: s["son"] - s["bas"])\n            yol.append(dugum["ad"])\n',
      tests: 'class Saat:\n    t = 0\n    def __call__(self):\n        return self.t\nsaat = Saat()\niz = Izci(saat)\nwith iz.span("POST /siparis", sehir="İzmir") as kok:\n    saat.t += 5\n    with iz.span("odeme_al"):\n        saat.t += 120\n    with iz.span("kurye_ata"):\n        saat.t += 40\n        with iz.span("sql: SELECT kurye"):\n            saat.t += 135\n    try:\n        with iz.span("sms_kuyruga_at"):\n            saat.t += 3\n            raise TimeoutError("redis")\n    except TimeoutError:\n        pass\nb = {s["ad"]: s for s in iz.bitenler}\nassert len(iz.bitenler) == 5 and all(s["trace_id"] == "t1" for s in iz.bitenler), "aynı istekteki tüm spanlar aynı trace_id\'yi taşımalı"\nassert b["POST /siparis"]["ust"] is None and b["odeme_al"]["ust"] == b["POST /siparis"]["span_id"], "üst ilişkisi"\nassert b["sql: SELECT kurye"]["ust"] == b["kurye_ata"]["span_id"], "iç içe span üst olarak kurye_ata\'yı almalı"\nassert (b["kurye_ata"]["bas"], b["kurye_ata"]["son"]) == (125, 300), "başlangıç ve bitiş saatten alınmalı"\nassert b["sms_kuyruga_at"]["hata"] == "TimeoutError" and b["odeme_al"]["hata"] is None, "hata bilgisi kaydedilmeli"\nassert b["POST /siparis"]["oznitelik"] == {"sehir": "İzmir"}, "öznitelikler"\nassert iz.kritik_yol("t1") == ["POST /siparis", "kurye_ata", "sql: SELECT kurye"], f"kritik yol: {iz.kritik_yol(\'t1\')}"\nassert iz.etkin.get() is None, "bitince etkin span temizlenmeli"\nwith iz.span("GET /saglik"):\n    pass\nassert iz.bitenler[-1]["trace_id"] == "t2" and iz.bitenler[-1]["span_id"] == "s6", "yeni kök yeni trace açmalı"\n',
      hints: ['@contextmanager ile yield öncesi başlangıç, finally içinde bitiş kaydı.', 'Üst span\'i etkin.get() ile al; set() token\'ını finally\'de reset et.', 'except BaseException as e: s["hata"] = type(e).__name__; raise'],
      why: 'OpenTelemetry\'nin start_as_current_span\'i tam olarak böyle çalışır: etkin span bağlamda durur, yeni span onu üst alır ve trace_id\'yi devralır. Kritik yol (critical path) analizi, "zaman nerede harcandı?" sorusunun cevabıdır: bu istekte yavaşlık ödemede değil, kurye atamasındaki SQL sorgusunda.'
    },
    {
      id: 'gozlemlenebilirlik-8',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>W3C <code>traceparent</code> başlığını işle. Biçim: <code>sürüm-traceid-parentid-bayraklar</code>, örn. <code>00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01</code>.</p><ul><li><code>coz(baslik)</code>: geçerliyse <code>{"trace_id", "parent_id", "orneklendi"}</code> (bayrakların en düşük biti 1 ise <code>True</code>), değilse <code>None</code>. Geçerlilik: tam 4 parça; sürüm <code>"00"</code>; trace_id 32, parent_id 16, bayraklar 2 <b>küçük harf</b> onaltılık karakter; trace_id tamamı sıfır ya da parent_id tamamı sıfır olamaz.</li><li><code>alt_baslik(ust, yeni_span_id)</code>: gelen bağlamdan aşağı akış çağrısı için yeni başlık üretir: aynı trace_id, parent_id yerine <code>yeni_span_id</code>, bayraklar aynı (<code>"01"</code> ya da <code>"00"</code>).</li></ul>',
      start: 'import re\n\ndef coz(baslik):\n    pass\n\ndef alt_baslik(ust, yeni_span_id):\n    pass\n',
      sol: 'import re\n\n_HEX = re.compile(r"[0-9a-f]+")\n\ndef coz(baslik):\n    if not isinstance(baslik, str):\n        return None\n    p = baslik.strip().split("-")\n    if len(p) != 4:\n        return None\n    surum, tid, pid, bayrak = p\n    if surum != "00" or len(tid) != 32 or len(pid) != 16 or len(bayrak) != 2:\n        return None\n    if not all(_HEX.fullmatch(x) for x in (tid, pid, bayrak)):\n        return None\n    if set(tid) == {"0"} or set(pid) == {"0"}:\n        return None\n    return {"trace_id": tid, "parent_id": pid, "orneklendi": bool(int(bayrak, 16) & 1)}\n\ndef alt_baslik(ust, yeni_span_id):\n    return f"00-{ust[\'trace_id\']}-{yeni_span_id}-{\'01\' if ust[\'orneklendi\'] else \'00\'}"\n',
      tests: 'B = "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01"\nassert coz(B) == {"trace_id": "4bf92f3577b34da6a3ce929d0e0e4736", "parent_id": "00f067aa0ba902b7", "orneklendi": True}, "W3C örnek başlığı çözülmeli"\nassert coz(B[:-2] + "00")["orneklendi"] is False, "bayrak 00 ise örneklenmemiş"\nassert coz(B[:-2] + "03")["orneklendi"] is True, "en düşük bit belirleyici"\nfor kotu in [B.upper(), "01" + B[2:], B.replace("4bf9", "4bf"), "00-" + "0" * 32 + "-00f067aa0ba902b7-01", "00-4bf92f3577b34da6a3ce929d0e0e4736-" + "0" * 16 + "-01", B + "-ek", "", None, "00-4bf92f3577b34da6a3ce929d0e0e473g-00f067aa0ba902b7-01"]:\n    assert coz(kotu) is None, f"geçersiz başlık None vermeli: {kotu!r}"\nassert alt_baslik(coz(B), "b7ad6b7169203331") == "00-4bf92f3577b34da6a3ce929d0e0e4736-b7ad6b7169203331-01", "alt çağrı aynı trace_id\'yi taşımalı"\nassert alt_baslik(coz(B[:-2] + "00"), "b7ad6b7169203331").endswith("-00"), "örnekleme kararı aşağı akışa aynen geçmeli"\n',
      hints: ['split("-") ile 4 parçaya ayır; uzunlukları ve "00" sürümünü kontrol et.', 'Küçük harf onaltılık: re.fullmatch(r"[0-9a-f]+", x).', 'Bayrak: int(bayrak, 16) & 1.'],
      why: 'traceparent, farklı dillerde ve farklı araçlarla yazılmış servislerin aynı izi paylaşmasını sağlayan ortak dildir. Geçersiz başlığı sessizce reddedip yeni iz başlatmak doğru davranıştır (istemciden gelen bozuk veri izlemeyi bozmamalı). Örnekleme bayrağını aşağı akışa aynen geçirmek (ParentBased örnekleyici), izlerin yarım kalmasını önler.'
    },
    {
      id: 'gozlemlenebilirlik-9',
      t: 'code',
      stage: 'Hata avı',
      diff: 2,
      kind: 'bug',
      q: '<p><b>Hatayı bul ve düzelt.</b> Panodaki p95 teslim süresi sürekli olduğundan düşük görünüyor ve küçük örneklemlerde garip sonuçlar veriyor. <code>p95(degerler)</code> en yakın sıra yöntemiyle 95. yüzdeliği döndürmeli; <code>sehir_p95(siparisler)</code> ise <code>{sehir: p95}</code>\'yi her şehrin <b>kendi</b> teslim sürelerinden hesaplamalı. Kodda üç hata var: liste sıralanmıyor, indeks bir kayık, ve şehir p95\'i "restoran p95\'lerinin ortalaması" ile hesaplanıyor (yüzdelikler ortalanamaz).</p>',
      start: 'import math, statistics\nfrom collections import defaultdict\n\ndef p95(degerler):\n    k = math.ceil(0.95 * len(degerler))\n    return degerler[k]\n\ndef sehir_p95(siparisler):\n    restoran = defaultdict(list)\n    for s in siparisler:\n        restoran[(s["sehir"], s["restoran"])].append(s["sure"])\n    sehir = defaultdict(list)\n    for (sh, _), sureler in restoran.items():\n        sehir[sh].append(p95(sureler))\n    return {sh: statistics.mean(v) for sh, v in sehir.items()}\n',
      sol: 'import math, statistics\nfrom collections import defaultdict\n\ndef p95(degerler):\n    s = sorted(degerler)\n    k = max(1, math.ceil(0.95 * len(s)))\n    return s[k - 1]\n\ndef sehir_p95(siparisler):\n    sehir = defaultdict(list)\n    for s in siparisler:\n        sehir[s["sehir"]].append(s["sure"])\n    return {sh: p95(v) for sh, v in sehir.items()}\n',
      tests: 'assert p95([5, 1, 4, 2, 3]) == 5, "sıralanmamış listede p95 en büyük eleman (5) olmalı"\nassert p95(list(range(1, 21))) == 19, "20 elemanda k = 19, değer 19"\nassert p95([42]) == 42, "tek eleman"\nveri_ = [{"sehir": "İzmir", "restoran": "A", "sure": d} for d in [30] * 19 + [90]] + [{"sehir": "İzmir", "restoran": "B", "sure": d} for d in [35, 36]]\nveri_ += [{"sehir": "Ankara", "restoran": "C", "sure": d} for d in range(10, 50, 2)]\nr = sehir_p95(veri_)\nassert r["İzmir"] == 36, f"İzmir p95 tüm İzmir siparişlerinden hesaplanmalı (22 gözlem, 21. sıradaki 36): {r}"\nassert r["Ankara"] == 46, f"Ankara: {r}"\n',
      hints: ['Yüzdelik sıralı veri ister: sorted().', 'k 1 tabanlı sıradır; Python indeksi k - 1.', 'Şehir yüzdeliği için şehirdeki tüm gözlemleri tek listede topla; alt grupların yüzdeliklerini ortalama.'],
      why: 'Sıralamasız indeks rastgele bir değer verir; bir kayık indeks n küçükken IndexError ya da yanlış eleman üretir. Asıl sinsi hata üçüncüsü: yüzdeliklerin ortalaması yüzdelik değildir. Bu örnekte A restoranının tek uç değeri (90) ortalamayı şişirirken asıl şehir p95\'i 36\'dır. Bu yüzden servisler arası birleştirmede ham değerler ya da histogram kovaları toplanır.'
    },
    {
      id: 'gozlemlenebilirlik-10',
      t: 'code',
      stage: 'Hata avı',
      diff: 2,
      kind: 'bug',
      q: '<p><b>Hatayı bul ve düzelt.</b> Asenkron sipariş API\'sinde istek kimliği global bir değişkende tutuluyor. Aynı anda gelen iki isteğin logları birbirine karışıyor: <code>req-1</code>\'in "kurye atandı" satırı <code>req-2</code> kimliğiyle yazılıyor. <code>isle(kimlik, siparis_id, kayit)</code> her log satırını <code>(kimlik, mesaj)</code> olarak <code>kayit</code> listesine ekliyor. Düzelt: kimliği <code>contextvars.ContextVar</code> ile taşı (adı <code>istek_kimligi</code>, varsayılan <code>"-"</code>).</p>',
      start: 'import asyncio\n\nISTEK_KIMLIGI = "-"\n\ndef logla(kayit, mesaj):\n    kayit.append((ISTEK_KIMLIGI, mesaj))\n\nasync def kurye_ata(siparis_id, kayit):\n    await asyncio.sleep(0)\n    logla(kayit, f"kurye atandı {siparis_id}")\n\nasync def isle(kimlik, siparis_id, kayit):\n    global ISTEK_KIMLIGI\n    ISTEK_KIMLIGI = kimlik\n    logla(kayit, f"sipariş alındı {siparis_id}")\n    await kurye_ata(siparis_id, kayit)\n',
      sol: 'import asyncio, contextvars\n\nistek_kimligi = contextvars.ContextVar("istek_kimligi", default="-")\n\ndef logla(kayit, mesaj):\n    kayit.append((istek_kimligi.get(), mesaj))\n\nasync def kurye_ata(siparis_id, kayit):\n    await asyncio.sleep(0)\n    logla(kayit, f"kurye atandı {siparis_id}")\n\nasync def isle(kimlik, siparis_id, kayit):\n    istek_kimligi.set(kimlik)\n    logla(kayit, f"sipariş alındı {siparis_id}")\n    await kurye_ata(siparis_id, kayit)\n',
      tests: 'async def main():\n    kayit = []\n    await asyncio.gather(isle("req-1", 101, kayit), isle("req-2", 202, kayit), isle("req-3", 303, kayit))\n    return kayit\nk = asyncio.run(main())\nfor kimlik, mesaj in k:\n    beklenen = {"101": "req-1", "202": "req-2", "303": "req-3"}[mesaj.split()[-1]]\n    assert kimlik == beklenen, f"\'{mesaj}\' satırı {beklenen} ile loglanmalıydı, {kimlik} geldi"\nassert len(k) == 6, "her istek 2 satır"\nson = []\nlogla(son, "arka plan")\nassert son == [("-", "arka plan")], "istek dışındaki kod varsayılan kimliği görmeli"\nassert "ContextVar" in __source__, "contextvars.ContextVar kullan"\n',
      hints: ['await noktasında olay döngüsü diğer isteğe geçer; global değişkeni o istek değiştirir.', 'ContextVar her asyncio görevinde ayrı kopyalanır.', 'istek_kimligi = contextvars.ContextVar("istek_kimligi", default="-"); logla içinde istek_kimligi.get().'],
      why: 'Global durum eşzamanlı kodda paylaşılan tek bir kutudur; her await, başka bir isteğin onu değiştirmesine fırsat verir. ContextVar, asyncio görevlerinde ve (contextvars.copy_context ile) iş parçacıklarında bağlamı izole eder. threading.local iş parçacıkları için çalışır ama aynı iş parçacığındaki asyncio görevlerini ayırmaz; asenkron kodda doğru araç ContextVar\'dır.'
    },
    {
      id: 'gozlemlenebilirlik-11',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Prometheus\'un <code>histogram_quantile</code> fonksiyonunu yaz: <code>kovadan_yuzdelik(q, kovalar)</code>. <code>kovalar</code> kümülatif <code>[(sinir, adet), ...]</code> listesidir, sınıra göre artan, son sınır <code>inf</code>. Algoritma:</p><ol><li>Toplam = son kovanın adedi; 0 ise <code>float("nan")</code>.</li><li>Sıra = q × toplam. Adedi sıra\'dan büyük ya da eşit olan <b>ilk</b> kovayı bul.</li><li>Bu kova <code>inf</code> ise bir önceki kovanın sınırını döndür.</li><li>Kovanın alt sınırı önceki kovanın sınırıdır (ilk kova için 0); önceki adet de benzer şekilde (ilk kova için 0).</li><li>Doğrusal ara değer: <code>alt + (ust - alt) × (sira - onceki_adet) / (kova_adedi - onceki_adet)</code>.</li></ol><p><code>q</code> 0–1 dışındaysa <code>ValueError</code>. Testler gerçek teslim sürelerinin histogramıyla yapılır.</p>',
      start: 'import math\n\ndef kovadan_yuzdelik(q, kovalar):\n    pass\n',
      sol: 'import math\n\ndef kovadan_yuzdelik(q, kovalar):\n    if not 0 <= q <= 1:\n        raise ValueError("q 0 ile 1 arasında olmalı")\n    toplam = kovalar[-1][1]\n    if toplam == 0:\n        return float("nan")\n    sira = q * toplam\n    for i, (ust, adet) in enumerate(kovalar):\n        if adet >= sira:\n            break\n    if math.isinf(ust):\n        return kovalar[i - 1][0] if i > 0 else float("nan")\n    alt, onceki = (kovalar[i - 1][0], kovalar[i - 1][1]) if i > 0 else (0.0, 0)\n    if adet == onceki:\n        return ust\n    return alt + (ust - alt) * (sira - onceki) / (adet - onceki)\n',
      tests: 'import datetime as dt\nimport veri, bisect, itertools\n\ndef teslim_sureleri():\n    """Teslim edilen siparişlerin sipariş -> teslim süresi (dakika)."""\n    sonuc = []\n    for s in veri.kayitlar("lezzet_kurye", "lk_orders"):\n        if s["status"] == "teslim":\n            a = dt.datetime.fromisoformat(s["placed_at"])\n            b = dt.datetime.fromisoformat(s["delivered_at"])\n            sonuc.append((b - a).total_seconds() / 60)\n    return sonuc\nINF = float("inf")\nK = [(30, 2), (45, 4), (60, 5), (INF, 6)]\nassert kovadan_yuzdelik(0.5, K) == 37.5, "sıra 3: 30-45 kovasında ortada: 30 + 15 * (3-2)/(4-2) = 37.5"\nassert kovadan_yuzdelik(0.25, K) == 22.5, "ilk kova için alt sınır 0"\nassert kovadan_yuzdelik(0.99, K) == 60, "sıra +Inf kovasına düşerse önceki sınır"\nassert math.isnan(kovadan_yuzdelik(0.5, [(10, 0), (INF, 0)])), "boş histogram nan"\nfor kotu in (-0.1, 1.5):\n    try:\n        kovadan_yuzdelik(kotu, K)\n        assert False, "q aralık dışı ValueError"\n    except ValueError:\n        pass\nsinir = [15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 75, 90]\nayrik = [0] * (len(sinir) + 1)\nfor d in teslim_sureleri():\n    ayrik[bisect.bisect_left(sinir, d)] += 1\nkum = list(zip(sinir + [INF], itertools.accumulate(ayrik)))\nt95 = kovadan_yuzdelik(0.95, kum)\nassert 55 <= t95 <= 60 and abs(t95 - 57.13) < 1.0, f"histogramdan p95 tahmini gerçek p95\'e (57.13) yakın olmalı: {t95:.2f}"\nassert abs(kovadan_yuzdelik(0.5, kum) - 36.8) < 1.0, "p50 tahmini gerçek medyana (36.8) yakın"\n',
      hints: ['İlk kümülatif adedi >= q × toplam olan kovayı bul; o kova yüzdeliğin bulunduğu aralıktır.', 'Kova içindeki gözlemlerin düzgün dağıldığı varsayılır: doğrusal ara değer.', 'Sonsuz kovada ara değer yapılamaz; önceki kovanın sınırı döndürülür.'],
      why: 'Prometheus yüzdeliği sunucuda, kovaların toplanmış sayılarından tahmin eder; bu yüzden binlerce podun histogramı toplanarak tek bir p95 elde edilebilir. Tahminin hatası kova genişliğiyle sınırlıdır: 5 dakikalık kovalarla gerçek p95\'e (57.13) yaklaşık bir dakika içinde yaklaşırsın. SLO eşiğini (60) bir kova sınırı yapmak, "eşik altı oranı"nı ise tam olarak hesaplanabilir kılar.'
    },
    {
      id: 'gozlemlenebilirlik-12',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Çok pencereli yanma hızı (burn rate) alarmı yaz: <code>yanma_alarmi(seri, hedef, uzun=60, kisa=5, esik=14.4)</code>. <code>seri</code> dakikalık <code>(iyi, toplam)</code> demetleri listesidir (indeks = dakika). Her dakika <code>t</code> için, <code>t</code> dahil son <code>uzun</code> ve son <code>kisa</code> dakikanın toplam hata oranı hesaplanır: <code>(toplam - iyi) / toplam</code> (pencerede hiç istek yoksa 0). Yanma = hata oranı / (1 - hedef). Pencere başta kısaysa eldeki dakikalar kullanılır. <b>İki</b> pencerenin yanması da <code>esik</code>\'ten büyük ya da eşitse o dakikada alarm <i>aktif</i>tir. Fonksiyon alarmın <b>başladığı</b> ve <b>bittiği</b> dakikaları <code>[(baslangic, bitis), ...]</code> olarak döndürsün; <code>bitis</code> alarmın aktif olmadığı ilk dakikadır, seri sonunda hâlâ aktifse <code>None</code>.</p>',
      start: 'def yanma_alarmi(seri, hedef, uzun=60, kisa=5, esik=14.4):\n    pass\n',
      sol: 'def yanma_alarmi(seri, hedef, uzun=60, kisa=5, esik=14.4):\n    butce = 1 - hedef\n    on_iyi, on_top = [0], [0]\n    for iyi, top in seri:\n        on_iyi.append(on_iyi[-1] + iyi)\n        on_top.append(on_top[-1] + top)\n\n    def yanma(t, pencere):\n        a = max(0, t + 1 - pencere)\n        top = on_top[t + 1] - on_top[a]\n        if top == 0:\n            return 0.0\n        hata = top - (on_iyi[t + 1] - on_iyi[a])\n        return hata / top / butce\n\n    olaylar, bas = [], None\n    for t in range(len(seri)):\n        aktif = yanma(t, uzun) >= esik and yanma(t, kisa) >= esik\n        if aktif and bas is None:\n            bas = t\n        elif not aktif and bas is not None:\n            olaylar.append((bas, t))\n            bas = None\n    if bas is not None:\n        olaylar.append((bas, None))\n    return olaylar\n',
      tests: 'seri = [(1000, 1000)] * 120\nseri += [(500, 1000)] * 10\nseri += [(1000, 1000)] * 30\nseri += [(990, 1000)] * 40\nseri += [(0, 1000)] * 3\nr = yanma_alarmi(seri, 0.999)\nassert r[0] == (121, 134), f"10 dakikalık %50 hata: uzun pencere 121\'de eşiği geçer (120\'de yanma yalnız 8.2), kısa pencere 134\'te temizlenir: {r}"\nassert r[1] == (200, None), f"seri sonundaki tam kesinti: alarm 200\'de başlamalı ve sürmeli: {r}"\nassert len(r) == 2, "yavaş sızan %1 hata (yanma 10) eşiği geçmemeli"\nassert yanma_alarmi([(0, 0)] * 10, 0.999) == [], "trafik yokken alarm yok"\nassert yanma_alarmi([(1, 2)], 0.99) == [(0, None)], "tek dakika: iki pencere de aynı"\nsivri = [(1000, 1000)] * 100 + [(0, 1000)] + [(1000, 1000)] * 10\nassert yanma_alarmi(sivri, 0.999) == [(100, 105)], f"tek dakikalık sivrilik kısa pencerede 5 dk (100-104) sürer, 105\'te biter: {yanma_alarmi(sivri, 0.999)}"\n',
      hints: ['Önek toplamları (prefix sum) ile her pencerenin iyi/toplam sayısını O(1)\'de hesapla.', 'Pencere başlangıcı max(0, t + 1 - pencere); t dahil.', 'Durum makinesi: aktif değilken aktif olursa başlangıç kaydet, aktifken pasife dönerse (baslangic, t) ekle.'],
      why: 'Google SRE Workbook\'taki çok pencereli yanma hızı alarmı, hem hızlı (1 saatte bütçenin %2\'si) hem kalıcı sorunu yakalar. Uzun pencere tek bir sivri dakikanın tek başına sayfa atmasını zorlaştırır ve ciddiyeti gösterir; kısa pencere sorun bitince alarmın dakikalar içinde susmasını sağlar (uzun pencere tek başına bir saat daha çalardı). %1 sızıntı (yanma 10) daha düşük eşikli, uzun pencereli bir "bilet" (ticket) alarmının işidir.'
    },
    {
      id: 'gozlemlenebilirlik-13',
      t: 'code',
      stage: 'Mini proje',
      diff: 3,
      q: '<p><b>Lezzet Kurye veri hattı sağlık raporu.</b> Gece ETL\'i <code>lk_orders</code> tablosunu ambara yüklüyor. <code>hat_saglik(kayitlar, simdi, beklenen_sutunlar)</code> şu kontrolleri yapıp <code>{"tazelik": {...}, "hacim": {...}, "sema": {...}, "bosluk": {...}, "durum": "ok"|"uyari"}</code> döndürsün:</p><ul><li><b>tazelik</b>: <code>{"dakika": son placed_at\'ten simdi\'ye geçen dakika (1 ondalık), "durum"}</code>; 120 dakikadan eskiyse <code>"uyari"</code>.</li><li><b>hacim</b>: <code>simdi</code>\'den önceki son <b>tam</b> gün (dün) için: <code>{"gun": "YYYY-AA-GG", "adet", "ort": önceki 7 günün ortalaması (1 ondalık), "z": (adet - ort) / örneklem std (2 ondalık), "durum"}</code>; <code>|z| &gt; 3</code> ise <code>"uyari"</code>.</li><li><b>sema</b>: <code>{"eksik": sıralı liste, "fazla": sıralı liste, "durum"}</code>; ilk kaydın anahtarları ile <code>beklenen_sutunlar</code> farkı; fark varsa <code>"uyari"</code>.</li><li><b>bosluk</b>: <code>status == "teslim"</code> kayıtlarda <code>delivered_at</code>\'i <code>None</code> olanların yüzdesi (2 ondalık) <code>{"oran", "durum"}</code>; %1\'i aşarsa <code>"uyari"</code>.</li><li><b>durum</b>: herhangi biri uyarıysa <code>"uyari"</code>.</li></ul><p>Tüm alt sözlüklerde <code>"durum"</code> <code>"ok"</code> ya da <code>"uyari"</code>. Boş <code>kayitlar</code> gelirse her şey uyarı olsun: <code>{"durum": "uyari", "neden": "veri yok"}</code>.</p>',
      start: 'import datetime as dt, statistics\nfrom collections import Counter\nimport veri\n\nBEKLENEN = ["order_id", "customer_id", "restaurant_id", "courier_id", "placed_at", "picked_at",\n            "delivered_at", "status", "payment", "delivery_fee", "discount", "tip"]\n\ndef hat_saglik(kayitlar, simdi, beklenen_sutunlar):\n    pass\n\nprint(hat_saglik(veri.kayitlar("lezzet_kurye", "lk_orders"), dt.datetime(2025, 1, 1, 2, 0), BEKLENEN))\n',
      sol: 'import datetime as dt, statistics\nfrom collections import Counter\nimport veri\n\nBEKLENEN = ["order_id", "customer_id", "restaurant_id", "courier_id", "placed_at", "picked_at",\n            "delivered_at", "status", "payment", "delivery_fee", "discount", "tip"]\n\ndef _d(ok):\n    return "ok" if ok else "uyari"\n\ndef hat_saglik(kayitlar, simdi, beklenen_sutunlar):\n    if not kayitlar:\n        return {"durum": "uyari", "neden": "veri yok"}\n    son = max(dt.datetime.fromisoformat(k["placed_at"]) for k in kayitlar)\n    dakika = round((simdi - son).total_seconds() / 60, 1)\n    tazelik = {"dakika": dakika, "durum": _d(dakika <= 120)}\n\n    gunluk = Counter(k["placed_at"][:10] for k in kayitlar)\n    dun = simdi.date() - dt.timedelta(days=1)\n    onceki = [gunluk[(dun - dt.timedelta(days=i)).isoformat()] for i in range(1, 8)]\n    ort = statistics.mean(onceki)\n    sapma = statistics.stdev(onceki)\n    adet = gunluk[dun.isoformat()]\n    z = round((adet - ort) / sapma, 2) if sapma else 0.0\n    hacim = {"gun": dun.isoformat(), "adet": adet, "ort": round(ort, 1), "z": z, "durum": _d(abs(z) <= 3)}\n\n    var, bek = set(kayitlar[0]), set(beklenen_sutunlar)\n    eksik, fazla = sorted(bek - var), sorted(var - bek)\n    sema = {"eksik": eksik, "fazla": fazla, "durum": _d(not eksik and not fazla)}\n\n    teslim = [k for k in kayitlar if k.get("status") == "teslim"]\n    bos = sum(1 for k in teslim if k.get("delivered_at") is None)\n    oran = round(100 * bos / len(teslim), 2) if teslim else 0.0\n    bosluk = {"oran": oran, "durum": _d(oran <= 1)}\n\n    parcalar = {"tazelik": tazelik, "hacim": hacim, "sema": sema, "bosluk": bosluk}\n    parcalar["durum"] = _d(all(p["durum"] == "ok" for p in parcalar.values()))\n    return parcalar\n\nprint(hat_saglik(veri.kayitlar("lezzet_kurye", "lk_orders"), dt.datetime(2025, 1, 1, 2, 0), BEKLENEN))\n',
      tests: '_k = veri.kayitlar("lezzet_kurye", "lk_orders")\nr = hat_saglik(_k, dt.datetime(2025, 1, 1, 2, 0), BEKLENEN)\nassert r["tazelik"] == {"dakika": 74.2, "durum": "ok"}, f"son sipariş 00:45:49, 74.2 dk önce: {r[\'tazelik\']}"\nassert r["hacim"]["gun"] == "2024-12-31" and r["hacim"]["adet"] == 74, f"dün 31 Aralık, 74 sipariş: {r[\'hacim\']}"\nassert r["hacim"]["ort"] == 94.3 and r["hacim"]["durum"] == "uyari", f"31 Aralık önceki haftanın çok altında (z < -3): {r[\'hacim\']}"\nassert r["sema"] == {"eksik": [], "fazla": [], "durum": "ok"} and r["bosluk"] == {"oran": 0.0, "durum": "ok"}, "şema ve boşluk temiz"\nassert r["durum"] == "uyari", "bir kontrol uyarıdaysa genel durum uyarı"\nr2 = hat_saglik(_k, dt.datetime(2024, 12, 30, 23, 0), BEKLENEN)\nassert r2["hacim"]["gun"] == "2024-12-29" and r2["hacim"]["durum"] == "ok", f"29 Aralık olağan: {r2[\'hacim\']}"\nbozuk = [dict(k) for k in _k]\nfor k in bozuk:\n    k["teslim_zamani"] = k.pop("delivered_at")\nr3 = hat_saglik(bozuk, dt.datetime(2025, 1, 1, 2, 0), BEKLENEN)\nassert r3["sema"] == {"eksik": ["delivered_at"], "fazla": ["teslim_zamani"], "durum": "uyari"}, f"yeniden adlandırılan sütun yakalanmalı: {r3[\'sema\']}"\nassert r3["bosluk"]["oran"] == 100.0 and r3["bosluk"]["durum"] == "uyari", "teslim edilenlerde delivered_at yok"\nassert hat_saglik(_k, dt.datetime(2025, 1, 2, 9, 0), BEKLENEN)["tazelik"]["durum"] == "uyari", "32 saat eski veri uyarı"\nassert hat_saglik([], dt.datetime(2025, 1, 1), BEKLENEN) == {"durum": "uyari", "neden": "veri yok"}, "boş veri"\n',
      hints: ['Dün = simdi.date() - timedelta(days=1); önceki 7 gün dünden geriye 1..7 gün.', 'Counter(k["placed_at"][:10]) günlük hacmi verir; olmayan gün 0 sayılır.', 'Şema: set farkları, sonra sorted; boşluk: yalnız teslim edilen kayıtlarda delivered_at None oranı.'],
      why: 'Veri hatlarında en pahalı hatalar sessiz olanlardır: iş "başarılı" biter ama veri eksik, eski ya da şeması değişmiştir. Tazelik, hacim, şema ve boşluk kontrolleri her yüklemenin sonuna eklenir (Great Expectations, dbt testleri, Monte Carlo gibi araçlar bunu ölçekli yapar). 31 Aralık\'taki düşüş gerçek bir anomali mi (yılbaşı gecesi) yoksa eksik yükleme mi? Kontrol karar vermez, bir insana sorar; mevsimsellik bilinen günler için eşikler ayrıca ayarlanır.'
    }
  ],
  faq: [
    {
      q: 'İzleme ile gözlemlenebilirlik arasındaki fark nedir?',
      a: 'İzleme önceden belirlenmiş soruları (CPU, hata oranı eşiği) sürekli kontrol eder. Gözlemlenebilirlik sistemin yeterince zengin sinyal (yüksek kardinaliteli olaylar, izler) üretmesidir; böylece yeni ve beklenmedik soruları kod değiştirmeden sorabilirsin. İzleme, gözlemlenebilir bir sistemin üzerine kurulan bir kullanım biçimidir.'
    },
    {
      q: 'Hangi araçlarla başlamalıyım?',
      a: 'Açık kaynak yığın: OpenTelemetry (enstrümantasyon standardı), Prometheus (metrik), Grafana (pano ve alarm), Loki (log), Tempo ya da Jaeger (iz), Sentry (hata takibi). Bulutta Datadog, New Relic, Grafana Cloud ya da bulut sağlayıcının kendi araçları aynı kavramları sunar. OpenTelemetry ile enstrümante edersen sağlayıcı değiştirmek kolaylaşır.'
    },
    {
      q: 'SLO hedefini %100 koysam olmaz mı?',
      a: 'Olmaz; %100 hiçbir zaman sağlanamaz ve hata bütçesini sıfırlayarak her değişikliği yasaklar. Kullanıcılar da %99.9 ile %100 arasındaki farkı genelde fark etmez (ağları, telefonları zaten daha az güvenilirdir). Hedefi geçmiş performansın biraz altına ve kullanıcının fark edeceği eşiğe göre koy.'
    },
    {
      q: 'Her şeyi loglasam sonradan bakarım, yeterli olmaz mı?',
      a: 'Hacim ve maliyet hızla büyür, aramalar yavaşlar ve kişisel veri riski artar. Eğilim ve alarm için metrik, tek isteğin hikâyesi için iz, ayrıntılı bağlam için yapılandırılmış log kullan; debug loglarını üretimde örnekle.'
    }
  ],
  mistakes: [
    {
      why: 'Sınırsız değerli etiketler her kullanıcı için ayrı zaman serisi açar ve metrik sistemini çökertir.',
      bad: 'ISTEK.labels(musteri_id=str(m.id), yol=request.url).inc()',
      good: 'ISTEK.labels(yol=route_sablonu, durum=str(yanit.status_code)).inc()\nlog.info("istek", extra={"musteri_id": m.id})   # ayrıntı loga'
    },
    {
      why: 'Yüzdeliklerin ortalaması yüzdelik değildir; birleştirme kovalar ya da ham değerlerle yapılır.',
      bad: 'genel_p95 = statistics.mean([sunucu_a_p95, sunucu_b_p95])',
      good: 'genel_p95 = histogram_quantile(0.95, kovalar_a + kovalar_b)   # kovaları topla'
    },
    {
      why: 'Liveness sondasını bağımlılıklara bağlamak, veritabanı kesintisinde tüm podların sürekli yeniden başlamasına yol açar.',
      bad: '@app.get("/saglik")\ndef saglik():\n    db.execute("SELECT 1")   # liveness olarak kullanılıyor\n    return "ok"',
      good: '@app.get("/saglik/canli")\ndef canli():\n    return "ok"\n\n@app.get("/saglik/hazir")\ndef hazir():\n    db.execute("SELECT 1")\n    return "ok"'
    },
    {
      why: 'Asenkron kodda global değişkenle taşınan istek kimliği eşzamanlı isteklerde karışır.',
      bad: 'ISTEK_ID = None\nasync def middleware(req):\n    global ISTEK_ID\n    ISTEK_ID = req.headers.get("X-Request-ID")',
      good: 'istek_id = contextvars.ContextVar("istek_id", default="-")\nasync def middleware(req):\n    token = istek_id.set(req.headers.get("X-Request-ID") or yeni_id())\n    try:\n        return await sonraki(req)\n    finally:\n        istek_id.reset(token)'
    },
    {
      why: 'Anlık eşik alarmları her dalgalanmada çalar ve ekip alarmları görmezden gelmeye başlar (alarm yorgunluğu).',
      bad: 'if hata_orani_son_1dk > 0.01:\n    sayfa_at()',
      good: 'if yanma(60) >= 14.4 and yanma(5) >= 14.4:\n    sayfa_at(runbook="https://wiki/runbook/siparis-slo")'
    }
  ]
}
);
})(window);
