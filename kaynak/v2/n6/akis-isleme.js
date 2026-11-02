/* Kesit Python v2/n6 — Akış işleme ve mesaj kuyrukları */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push({
  id: 'akis-isleme',
  lv: 'ileri',
  mod: 'Üretime Hazırlık',
  min: 60,
  title: 'Akış işleme ve mesaj kuyrukları: Kafka kavramları',
  sum: 'Toplu ile akış işlemeyi, olay ve işlem zamanını, Kafka\'nın topic, partition, offset ve tüketici grubu modelini, teslim garantilerini, idempotent tüketiciyi, tumbling/sliding/session pencereleri, watermark\'ı, şema evrimini ve CDC\'yi bellek içi log ve asyncio.Queue ile kurar; Ilgaz Bank işlem akışında dakikalık şüpheli işlem sayacı yazarsın.',
  goals: [
    'Toplu, mikro-toplu ve akış işlemeyi; olay zamanı ile işlem zamanını ayırt edebilirim.',
    'Topic, partition, offset, tüketici grubu ve commit kavramlarını bellek içi bir log ile modelleyebilirim.',
    'En çok bir, en az bir ve tam bir kez teslimatı açıklar, idempotent tüketici yazabilirim.',
    'Tumbling, kayan ve oturum pencerelerini; geç gelen veri için watermark\'ı uygulayabilirim.',
    'Şema uyumluluğu, CDC olaylarını uygulama ve Kafka/RabbitMQ/Redis Streams seçimi hakkında karar verebilirim.'
  ],
  body: `<h2>Neden önemli? Gece 02:09'daki 80 bin liralık harcama</h2>
<p>Ilgaz Bank'ın işlem tablosunda (<code>bank_txns</code>) gece yarısından sonra internetten yapılmış, 45 ile 94 bin lira arasında kart harcamaları var. Bunları ertesi sabah toplu (batch) raporda görmek, dolandırıcılık ekibi için "çok geç" demektir: kart çoktan boşalmıştır. Bu derste olaylar <b>geldiği anda</b> işlenir: işlem gerçekleşir, mesaj bir kuyruğa yazılır, saniyeler içinde bir tüketici onu okur, kuralı uygular, dakikalık sayacı günceller ve gerekirse alarm üretir. Bu dünyanın merkezinde Apache Kafka vardır; bankacılık, e-ticaret, lojistik ve oyun şirketlerinin çoğu olay akışlarını Kafka ya da benzeri bir sistemle taşır.</p>
<p>Kafka bir küme ve ağ ister, tarayıcıda çalışmaz. Gerçek kodu gri kutularda göreceksin; kavramları ise <b>bellek içi bir log</b> ve <code>asyncio.Queue</code> ile kendin kuracaksın: topic, partition, offset, tüketici grubu, teslim garantileri, pencereleme ve watermark. <b>orkestrasyon</b> dersinde zamanlanmış toplu işleri, <b>async</b> dersinde kuyruk ve işçi havuzunu gördün; burada ikisini birleştirip sürekli akan veriye geçiyoruz.</p>

<h2>Toplu, mikro-toplu ve akış; olay zamanı ile işlem zamanı</h2>
<div class="tbl-wrap"><table>
<tr><th>Model</th><th>Gecikme</th><th>Örnek araç</th><th>Tipik iş</th></tr>
<tr><td>Toplu (batch)</td><td>Saatler</td><td>Airflow + Spark, dbt</td><td>Gece muhasebe kapanışı, aylık rapor</td></tr>
<tr><td>Mikro-toplu (micro-batch)</td><td>Saniyeler – dakikalar</td><td>Spark Structured Streaming</td><td>5 dakikalık satış panosu</td></tr>
<tr><td>Akış (streaming)</td><td>Milisaniyeler – saniyeler</td><td>Kafka Streams, Flink, Faust/Bytewax</td><td>Dolandırıcılık skoru, stok rezervasyonu</td></tr>
</table></div>
<p>Akışta iki saat vardır. <b>Olay zamanı</b> (event time) işlemin gerçekten olduğu andır (<code>txn_time</code>). <b>İşlem zamanı</b> (processing time) mesajın senin kodunla karşılaştığı andır. Mobil uygulama çevrimdışıyken yapılan bir ödeme 3 dakika sonra gelebilir; "dakikalık işlem sayısı" gibi iş ölçüleri olay zamanına göre hesaplanmalıdır, yoksa geciken olaylar yanlış dakikaya yazılır.</p>

<h2>Kafka'nın temel parçaları</h2>
<p><b>Topic</b> (konu) bir olay türünün adıdır: <code>bank.txns</code>. Her topic birden çok <b>partition</b>'a bölünür; partition, yalnız sonuna ekleme yapılan, değişmez bir <b>log</b>'dur. Her mesajın partition içindeki sıra numarasına <b>offset</b> denir. Mesaj anahtarı (ör. hesap numarası) partition'ı belirler: aynı hesabın işlemleri hep aynı partition'a gider ve <b>o partition içinde sırası korunur</b>. Partition'lar arasında ise genel bir sıra yoktur.</p>
<pre class="py">import veri

txns = veri.kayitlar("ilgaz_bank", "bank_txns")


class Konu:
    """Kafka topic'inin bellek içi benzetimi: her partition bir liste (log)."""
    def __init__(self, ad, n_partition):
        self.ad = ad
        self.partitionlar = [[] for _ in range(n_partition)]

    def yaz(self, anahtar, deger):
        p = anahtar % len(self.partitionlar)
        self.partitionlar[p].append(deger)
        return p, len(self.partitionlar[p]) - 1        # (partition, offset)

    def oku(self, p, offset, maks=3):
        return list(enumerate(self.partitionlar[p][offset:offset + maks], start=offset))


konu = Konu("bank.txns", 3)
for t in txns[:12]:
    konu.yaz(t["account_id"], t)

print([len(p) for p in konu.partitionlar])
for offset, t in konu.oku(1, 0):
    print(offset, t["account_id"], t["txn_time"], t["amount"])</pre>
<p><b>Saklama süresi</b> (retention) mesajların ne kadar tutulacağını belirler (ör. 7 gün ya da 500 GB). Mesaj okundu diye silinmez; bu, bir kuyruktan (RabbitMQ) en büyük farkıdır. Yeni bir ekip aynı topic'i baştan okuyabilir, hata düzeltildikten sonra dünkü offset'e dönüp yeniden işleyebilirsin (replay).</p>
<p><b>Tüketici grubu</b> (consumer group) aynı işi paylaşan tüketicilerdir. Kafka her partition'ı gruptaki <b>tek</b> tüketiciye atar; böylece bir partition'ın sırası korunur. 6 partition ve 3 tüketici varsa her biri 2 partition okur; 8 tüketici varsa 2'si boşta bekler. Paralelliğin üst sınırı partition sayısıdır. Grup, her partition için okuduğu son konumu <b>commit</b> eder (<code>__consumer_offsets</code> topic'ine yazılır). Tüketici çöküp yeniden başlarsa commit edilen offset'ten devam eder. Bir tüketici gruba girip çıktığında atamaların yeniden dağıtılmasına <b>rebalance</b> denir.</p>
<pre class="code"># pip install confluent-kafka      (Kafka'yı yerelde: docker run -p 9092:9092 apache/kafka:3.8.0)
from confluent_kafka import Producer, Consumer
import json

uretici = Producer({"bootstrap.servers": "localhost:9092", "enable.idempotence": True, "acks": "all"})
uretici.produce("bank.txns", key=str(t["account_id"]), value=json.dumps(t))
uretici.flush()

tuketici = Consumer({
    "bootstrap.servers": "localhost:9092",
    "group.id": "dolandiricilik-v1",
    "auto.offset.reset": "earliest",
    "enable.auto.commit": False,          # commit'i biz yapacağız
})
tuketici.subscribe(["bank.txns"])
while True:
    msg = tuketici.poll(1.0)
    if msg is None or msg.error():
        continue
    isle(json.loads(msg.value()))          # önce işle
    tuketici.commit(msg, asynchronous=False)   # sonra commit: en az bir kez</pre>
<div class="note"><b>Kendi bilgisayarında dene</b>Docker kuruluysa <code>docker run -d --name kafka -p 9092:9092 apache/kafka:3.8.0</code> tek düğümlü bir Kafka başlatır. Python istemcisi için <code>pip install confluent-kafka</code> (ya da saf Python <code>kafka-python</code>). Topic oluşturmak için: <code>docker exec kafka /opt/kafka/bin/kafka-topics.sh --create --topic bank.txns --partitions 3 --bootstrap-server localhost:9092</code>. Bulutta Confluent Cloud, AWS MSK ve Azure Event Hubs (Kafka uyumlu) yönetilen seçeneklerdir.</div>

<h2>Teslim garantileri ve idempotent tüketici</h2>
<div class="tbl-wrap"><table>
<tr><th>Garanti</th><th>Nasıl olur?</th><th>Risk</th></tr>
<tr><td>En çok bir kez (at-most-once)</td><td>Önce commit, sonra işle</td><td>Çökme olursa mesaj <b>kaybolur</b></td></tr>
<tr><td>En az bir kez (at-least-once)</td><td>Önce işle, sonra commit</td><td>Çökme olursa mesaj <b>iki kez</b> işlenir</td></tr>
<tr><td>Tam bir kez (exactly-once)</td><td>Kafka işlemleri (transactions) + idempotent üretici, ya da en az bir kez + idempotent tüketici</td><td>Karmaşık; dış sistemlere yazarken ancak idempotentlikle sağlanır</td></tr>
</table></div>
<p>Pratikte en sık seçilen yol "en az bir kez + <b>idempotent tüketici</b>"dir: aynı mesaj iki kez gelse de sonuç değişmez. Bunun için her olayın benzersiz bir kimliği (<code>txn_id</code>) olur ve tüketici işlediği kimlikleri hatırlar ya da hedef tabloya <code>INSERT ... ON CONFLICT DO NOTHING</code> ile yazar.</p>
<pre class="py"># Ağ hatası yüzünden bazı mesajlar iki kez teslim edildi
teslimat = txns[:5] + txns[2:4] + txns[5:8]
islenen = set()
toplam = 0.0
for t in teslimat:
    if t["txn_id"] in islenen:        # idempotentlik: gördüysen atla
        continue
    islenen.add(t["txn_id"])
    toplam += t["amount"]
print(len(teslimat), "teslimat,", len(islenen), "benzersiz işlem, toplam:", round(toplam, 2))</pre>
<h2>asyncio.Queue ile üretici ve tüketiciler</h2>
<p>Tek süreç içinde Kafka'nın üretici-tüketici ilişkisini <code>asyncio.Queue</code> ile kurabilirsin. Kuyruk dolarsa <code>put</code> bekler (geri basınç, backpressure); boşsa <code>get</code> bekler. Bitişi haber vermek için her tüketiciye bir "zehirli hap" (sentinel, ör. <code>None</code>) gönderilir. Bu derste olay döngüsünü <code>new_event_loop().run_until_complete</code> ile çalıştırıyoruz; betikte <code>asyncio.run(main())</code> aynı işi yapar.</p>
<pre class="py">import asyncio


async def uretici(kuyruk, olaylar, n_tuketici):
    for o in olaylar:
        await kuyruk.put(o)
    for _ in range(n_tuketici):
        await kuyruk.put(None)                   # bitti sinyali


async def tuketici(ad, kuyruk, sayac):
    while (o := await kuyruk.get()) is not None:
        sayac[ad] = sayac.get(ad, 0) + 1
        await asyncio.sleep(0)                   # sırayı başkasına ver


async def main():
    kuyruk = asyncio.Queue(maxsize=10)
    sayac = {}
    await asyncio.gather(uretici(kuyruk, txns[:100], 3),
                         *(tuketici(f"t{i}", kuyruk, sayac) for i in range(3)))
    return sayac


loop = asyncio.new_event_loop()
sonuc = loop.run_until_complete(main())
loop.close()
print(sorted(sonuc.items()), sum(sonuc.values()))</pre>
<h2>Pencereleme: tumbling, sliding, session</h2>
<p>Sonsuz bir akışta "toplam" anlamsızdır; bunun yerine zamanı <b>pencerelere</b> (window) bölersin.</p>
<div class="tbl-wrap"><table>
<tr><th>Pencere</th><th>Tanım</th><th>Örnek</th></tr>
<tr><td>Tumbling (devrik)</td><td>Sabit boyutlu, çakışmayan, ardışık</td><td>Her dakikanın şüpheli işlem sayısı</td></tr>
<tr><td>Sliding / hopping (kayan)</td><td>Sabit boyutlu, belirli adımla kayan, çakışan</td><td>Son 60 dakika, her 30 dakikada bir</td></tr>
<tr><td>Session (oturum)</td><td>Etkinlik arası boşluk eşiği aşılınca kapanır; boyutu değişken</td><td>Bir müşterinin mobil oturumu</td></tr>
</table></div>
<p>Tumbling pencerede bir olayın penceresi, zamanın pencere boyutuna göre aşağı yuvarlanmasıyla bulunur. Dakikalık pencere için ISO tarih metninin ilk 16 karakteri yeter:</p>
<pre class="py">from collections import Counter

gun = [t for t in txns if t["txn_time"].startswith("2024-03-15")]
dakika = Counter(t["txn_time"][:16] for t in gun)
print(len(gun), "işlem,", len(dakika), "dolu dakika")
print("en yoğun dakikalar:", dakika.most_common(2))</pre>
<h2>Geç gelen veri ve watermark</h2>
<p>Olaylar sırasız gelebilir. Dakikalık pencereyi ne zaman "kapandı" sayıp sonucu yayınlayacaksın? Sonsuza kadar beklersen sonuç hiç çıkmaz; hemen yayınlarsan geç gelenler kaybolur. <b>Watermark</b> bu ikilemin uzlaşmasıdır: "şimdiye kadar gördüğüm en büyük olay zamanı eksi izin verilen gecikme". Watermark bir pencerenin bitişini geçince pencere kapanır ve yayınlanır; o pencereye sonradan gelen olay <b>geç</b> sayılır (atılır, ayrı bir yan çıkışa yazılır ya da düzeltme olarak gönderilir).</p>
<pre class="py">olaylar = [("10:00:05", "a"), ("10:00:40", "b"), ("10:01:10", "c"),
           ("10:00:50", "d"), ("10:02:30", "e"), ("10:00:59", "f")]

def sn(s):
    h, m, x = map(int, s.split(":"))
    return h * 3600 + m * 60 + x

gecikme = 30
en_buyuk = 0
for zaman, ad in olaylar:
    en_buyuk = max(en_buyuk, sn(zaman))
    watermark = en_buyuk - gecikme
    pencere_sonu = sn(zaman) // 60 * 60 + 60
    durum = "GEÇ" if pencere_sonu &lt;= watermark else "zamanında"
    print(ad, zaman, "watermark =", watermark - sn("10:00:00"), "sn -&gt;", durum)</pre>
<p>"d" olayı sırasız gelmesine rağmen 30 saniyelik tolerans içinde kaldı; "f" ise 10:02:30 görüldükten sonra 10:00 penceresine düştüğü için geç sayıldı. Gecikme toleransı büyüdükçe doğruluk artar ama sonuç gecikir: bu, akış işlemenin temel takasıdır.</p>

<h2>Şema evrimi: Avro ve şema kayıt defteri</h2>
<p>Üretici mesaja yeni bir alan eklediğinde eski tüketiciler kırılmamalıdır. Bu yüzden kurumsal Kafka kurulumlarında mesajlar JSON yerine şemalı bir biçimle (<b>Avro</b>, Protobuf) yazılır ve şemalar bir <b>şema kayıt defterinde</b> (Schema Registry) sürümlenir. Kayıt defteri yeni şemayı kaydetmeden önce uyumluluğu denetler: <b>geriye uyumlu</b> (backward) değişiklikte yeni şemayla eski veri okunabilir; bunun için eklenen her alanın varsayılan değeri olmalıdır.</p>
<pre class="code">{"type": "record", "name": "Txn", "namespace": "ilgazbank",
 "fields": [
   {"name": "txn_id", "type": "long"},
   {"name": "account_id", "type": "long"},
   {"name": "amount", "type": "double"},
   {"name": "channel", "type": "string"},
   {"name": "risk_skoru", "type": ["null", "double"], "default": null}   // v2: varsayılanlı yeni alan
 ]}</pre>
<h2>RabbitMQ, Redis Streams ve Kafka</h2>
<div class="tbl-wrap"><table>
<tr><th>Ölçüt</th><th>Kafka</th><th>RabbitMQ</th><th>Redis Streams</th></tr>
<tr><td>Model</td><td>Dağıtık, kalıcı log</td><td>Mesaj aracısı (kuyruk, exchange)</td><td>Bellek içi log veri yapısı</td></tr>
<tr><td>Okununca silinir mi?</td><td>Hayır, saklama süresine göre</td><td>Evet, onaylanınca (ack)</td><td>Hayır, <code>XTRIM</code> ile kırpılır</td></tr>
<tr><td>Yeniden okuma (replay)</td><td>Offset'e dönerek kolay</td><td>Yok (ayrı kurgu gerekir)</td><td>ID'ye göre mümkün</td></tr>
<tr><td>İşlem hacmi</td><td>Çok yüksek (saniyede milyonlar)</td><td>Orta-yüksek</td><td>Yüksek, bellekle sınırlı</td></tr>
<tr><td>Tipik kullanım</td><td>Olay akışı, CDC, analitik boru hattı</td><td>Görev kuyruğu, yönlendirme, RPC</td><td>Hafif akış, zaten Redis olan sistemler</td></tr>
</table></div>

<h2>CDC: veritabanından ambara akış</h2>
<p><b>Change Data Capture</b> (değişiklik yakalama), veritabanının işlem günlüğünü (PostgreSQL WAL, MySQL binlog) okuyup her INSERT, UPDATE ve DELETE'i bir olaya çevirir. <b>Debezium</b> bunu Kafka Connect üzerinde yapar; olaylar Kafka'ya, oradan ambara (Snowflake, BigQuery) ya da göle akar. Gece toplu kopyalama yerine dakikalar içinde güncel bir ambar elde edilir ve kaynak veritabanına sorgu yükü binmez.</p>
<pre class="code">{"op": "u", "ts_ms": 1718000000000, "source": {"table": "bank_accounts", "lsn": 2451},
 "before": {"account_id": 100019, "status": "aktif", "credit_limit": 20000},
 "after":  {"account_id": 100019, "status": "aktif", "credit_limit": 35000}}</pre>
<div class="tip"><b>Tüketici gecikmesi (lag) izlenir</b>Bir akış sisteminin en önemli sağlık ölçüsü <b>consumer lag</b>'dir: her partition için son offset ile grubun commit ettiği offset arasındaki fark. Lag sürekli büyüyorsa tüketiciler yetişemiyordur: partition ve tüketici sayısını artır ya da işlemeyi hızlandır. Burrow, Kafka UI ve Prometheus exporter'ları bu ölçüyü panoya taşır.</div>
<div class="warn"><b>Sıra yalnız partition içinde garanti</b>Bir hesabın "para yatır" ve "para çek" olayları farklı partition'lara düşerse tüketici onları ters sırada görebilir. Sıranın önemli olduğu varlık (hesap, sipariş) mesaj <b>anahtarı</b> yapılmalıdır. Partition sayısını sonradan artırmak anahtar-partition eşlemesini değiştirir; bu yüzden baştan cömert seçilir.</div>
<div class="note"><b>Gerçek işte</b>Bankacılıkta dolandırıcılık tespiti, e-ticarette stok ve fiyat güncellemesi, lojistikte araç konumu ve veri ekiplerinde CDC ile ambar besleme tipik Kafka kullanımlarıdır. Veri mühendisi mülakatlarında "tam bir kez neden zor?", "geç gelen veriyi nasıl ele alırsın?", "tüketici grubunda partition sayısından fazla tüketici olursa ne olur?" soruları neredeyse her zaman sorulur. Cevabın omurgası bu derste kurduğun kavramlardır.</div>
<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Durumlu akış işleme</h3>
<p>Pencere sayaçları, oturumlar ve "bu hesabın son 10 işlemi" gibi bilgiler tüketicinin <b>durumu</b>dur (state). Flink ve Kafka Streams bu durumu yerel diskte (RocksDB) tutar, düzenli aralıklarla <b>checkpoint</b> alır ve çökmede offset ile durumu birlikte geri yükler; tam bir kez garantisi bu eşzamanlı geri yüklemeye dayanır.</p>
<h3>Outbox kalıbı</h3>
<p>Uygulama hem veritabanına yazıp hem Kafka'ya mesaj gönderiyorsa ikisinden biri başarısız olabilir. <b>Transactional outbox</b>: mesajı aynı veritabanı işleminde bir <code>outbox</code> tablosuna yaz, Debezium o tabloyu Kafka'ya taşısın. Böylece "veritabanında var ama olay yok" tutarsızlığı ortadan kalkar.</p>
<h3>Python'da akış araçları</h3>
<p>confluent-kafka (istemci), Faust (Kafka Streams benzeri), Bytewax (Rust çekirdekli dataflow), PyFlink ve Spark Structured Streaming (PySpark). Basit tüketiciler için istemci + idempotent yazma çoğu zaman yeterlidir; pencere ve durum karmaşıklaşınca bir akış çatısına geçilir.</p>
</section>
`,
  ex: [
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Kafka\'da <b>offset</b> neyi ifade eder?',
      o: ['Mesajın üretildiği saatin milisaniye cinsinden değeri', 'Mesajın partition log\'u içindeki sıra numarası', 'Tüketicinin bir saniyede okuduğu mesaj sayısı', 'Mesajın anahtarının hash değeri'],
      a: 1,
      why: 'Offset, partition içindeki konumdur ve 0\'dan başlayıp artar. Tüketici grubu "nerede kaldım?" bilgisini offset olarak commit eder; replay için de belirli bir offset\'e dönülür. Zaman damgası ve anahtar ayrı alanlardır.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: '<code>bank.txns</code> topic\'inde 4 partition var ve aynı tüketici grubunda 6 tüketici çalışıyor. Ne olur?',
      o: ['Her partition 1,5 tüketiciye bölünür, paralellik 6 olur', '4 tüketici birer partition okur, 2 tüketici boşta bekler', 'Kafka partition sayısını otomatik olarak 6\'ya çıkarır', 'Her mesaj 6 tüketicinin hepsine ayrı ayrı teslim edilir'],
      a: 1,
      why: 'Bir grup içinde her partition yalnız bir tüketiciye atanır; bu, partition içi sıranın korunmasını sağlar. Fazla tüketiciler yedek olarak bekler ve biri düşerse devreye girer. Paralelliği artırmak için partition sayısını artırmak gerekir. Mesajı herkese iletmek ise farklı grup kimlikleriyle olur.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Tüketici mesajı işleyip <b>sonra</b> offset\'i commit ediyor (en az bir kez). Commit\'ten hemen önce çökerse ne olur ve nasıl telafi edilir?',
      o: ['Mesaj kaybolur; offset ilerlediği için telafisi yoktur', 'Kafka mesajı otomatik olarak siler; üreticinin yeniden göndermesi gerekir', 'Mesaj yeniden okunup ikinci kez işlenir; tüketiciyi idempotent yazmak gerekir', 'Tüketici grubu kalıcı olarak durur; offset\'leri elle sıfırlamak gerekir'],
      a: 2,
      why: 'Commit edilmemiş offset\'ten yeniden başlanacağı için aynı mesaj bir kez daha işlenir. Bu yüzden en az bir kez teslimat, işlenen kimlikleri tutan ya da upsert ile yazan idempotent bir tüketiciyle birleştirilir. Kayıp, önce commit edip sonra işlemede (en çok bir kez) olur.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Mesajlar hesap numarasına göre 2 partition\'a yazılıyor. Çıktı nedir?',
      code: 'partitionlar = [[], []]\nmesajlar = [(101, "yatir"), (102, "cek"), (101, "cek"), (103, "fatura"), (101, "fatura")]\nfor hesap, islem in mesajlar:\n    partitionlar[hesap % 2].append(islem)\nprint(partitionlar[1], len(partitionlar[1]) - 1)\n',
      o: ['[\'yatir\', \'cek\', \'fatura\', \'fatura\'] 3', '[\'yatir\', \'cek\', \'fatura\'] 3', '[\'cek\'] 0', '[\'yatir\', \'cek\', \'fatura\', \'fatura\'] 4'],
      a: 0,
      why: '101 ve 103 tek sayıdır, partition 1\'e düşer: yatir, cek (101), fatura (103), fatura (101). Son mesajın offset\'i uzunluk eksi 1, yani 3. Hesap 101\'in üç işlemi kendi aralarındaki sırayı korur.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Saniye cinsinden olay zamanları 60 saniyelik tumbling pencerelere ayrılıyor. Çıktı nedir?',
      code: 'from collections import Counter\n\nzamanlar = [5, 59, 60, 61, 119, 120, 250]\npencereler = Counter(z // 60 * 60 for z in zamanlar)\nprint(sorted(pencereler.items()))\n',
      o: ['[(0, 2), (60, 3), (120, 1), (240, 1)]', '[(0, 3), (60, 2), (120, 1), (240, 1)]', '[(0, 2), (60, 2), (120, 2), (240, 1)]', '[(0, 2), (60, 3), (120, 2)]'],
      a: 0,
      why: 'Pencere başlangıcı aşağı yuvarlanır: 5 ve 59 → 0; 60, 61, 119 → 60; 120 → 120; 250 → 240. Pencere [başlangıç, başlangıç + 60) yarı açık aralıktır: 60 saniye bir sonraki pencereye aittir.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Tüketici gecikmesi (lag) hesaplanıyor. Çıktı nedir?',
      code: 'son_offset = {0: 1200, 1: 980, 2: 1500}        # her partition\'a yazılacak sıradaki offset\ncommitli = {0: 1200, 1: 700, 2: 1450}\nlag = {p: son_offset[p] - commitli.get(p, 0) for p in son_offset}\nprint(lag, sum(lag.values()), max(lag, key=lag.get))\n',
      o: ['{0: 0, 1: 280, 2: 50} 330 1', '{0: 0, 1: 280, 2: 50} 330 2', '{0: 1200, 1: 280, 2: 50} 1530 0', '{0: 0, 1: 280, 2: 50} 280 1'],
      a: 0,
      why: 'Lag = son offset − commit edilen offset: 0, 280 ve 50; toplam 330. <code>max(lag, key=lag.get)</code> en yüksek değere sahip anahtarı, yani en çok geride kalan partition\'ı (1) döndürür.'
    },
    {
      t: 'order',
      stage: 'Kodu oku',
      q: '<p><code>asyncio.Queue</code> ile üretim ve tüketim adımlarını sırala: önce kuyruğa üç mesaj ve bitiş sinyali (<code>None</code>) konur, sonra tüketim döngüsü <code>None</code> görene kadar mesajları alır.</p>',
      lines: ['import asyncio', 'async def main():', '    q = asyncio.Queue()', '    for i in range(3):', '        await q.put(i * 10)', '    await q.put(None)', '    while (x := await q.get()) is not None:', '        print("işlendi", x)', 'asyncio.new_event_loop().run_until_complete(main())'],
      expect: 'işlendi 0\nişlendi 10\nişlendi 20\n',
      hint: 'İçe aktarma en üstte (PEP 8); coroutine içinde önce kuyruk, sonra üretim, sonra sentinel, sonra tüketim; en son olay döngüsü başlatılır.',
      why: 'Kuyruk iki coroutine arasındaki tampondur. Sentinel (None) tüketiciye "akış bitti" der; o olmasa tüketici sonsuza kadar get() üzerinde bekler.'
    },
    {
      t: 'code',
      id: 'akis-isleme-1',
      stage: 'Rehberli',
      diff: 1,
      q: '<p>Kafka topic\'inin bellek içi benzetimini yaz. <code>Konu(n)</code> sınıfı <code>n</code> partition\'lı olsun:</p><ul><li><code>yaz(anahtar, deger)</code>: partition <code>anahtar % n</code>; değeri o partition\'ın sonuna ekler ve <code>(partition, offset)</code> döndürür.</li><li><code>oku(p, offset, maks)</code>: <code>p</code> partition\'ında <code>offset</code>\'ten başlayarak en çok <code>maks</code> mesajı <code>(offset, deger)</code> listesi olarak döndürür.</li><li><code>son_offset(p)</code>: partition\'a yazılacak <b>sıradaki</b> offset (yani uzunluk).</li></ul>',
      guide: ['<code>__init__</code>\'te <code>n</code> boş listeden oluşan <code>self.partitionlar</code> kur.', '<code>yaz</code>: partition numarasını bul, ekle; offset eklenen elemanın indeksidir.', '<code>oku</code>: dilimle (<code>[offset:offset + maks]</code>) ve <code>enumerate(..., start=offset)</code> ile offset\'leri üret.', '<code>son_offset</code>: <code>len(...)</code>.'],
      example: '# Benzer teknik: raflara dağıtılan paketler ve raf içi sıra numarası\nraflar = [[], []]\nfor paket in [7, 4, 9]:\n    raf = paket % 2\n    raflar[raf].append(paket)\n    print(paket, "-> raf", raf, "sıra", len(raflar[raf]) - 1)\nprint(list(enumerate(raflar[1][0:5], start=0)))\n',
      start: 'import veri\n\ntxns = veri.kayitlar("ilgaz_bank", "bank_txns")\n\n\nclass Konu:\n    def __init__(self, n):\n        self.partitionlar = []      # TODO 1: n tane boş liste\n\n    def yaz(self, anahtar, deger):\n        # TODO 2: partition\'ı bul, ekle, (partition, offset) döndür\n        pass\n\n    def oku(self, p, offset, maks):\n        # TODO 3: (offset, deger) listesi\n        return []\n\n    def son_offset(self, p):\n        return 0\n',
      sol: 'import veri\n\ntxns = veri.kayitlar("ilgaz_bank", "bank_txns")\n\n\nclass Konu:\n    def __init__(self, n):\n        self.partitionlar = [[] for _ in range(n)]\n\n    def yaz(self, anahtar, deger):\n        p = anahtar % len(self.partitionlar)\n        self.partitionlar[p].append(deger)\n        return p, len(self.partitionlar[p]) - 1\n\n    def oku(self, p, offset, maks):\n        return list(enumerate(self.partitionlar[p][offset:offset + maks], start=offset))\n\n    def son_offset(self, p):\n        return len(self.partitionlar[p])\n\n\nkonu = Konu(3)\nfor t in txns[:1000]:\n    konu.yaz(t["account_id"], t["txn_id"])\nprint([konu.son_offset(p) for p in range(3)])\nprint(konu.oku(1, 0, 3))\n',
      tests: 'konu = Konu(3)\nr = [konu.yaz(t["account_id"], t["txn_id"]) for t in txns[:1000]]\nassert r[0] == (txns[0]["account_id"] % 3, 0), "İlk mesaj kendi partition\\\'ında offset 0 almalı; gelen " + str(r[0])\nassert [konu.son_offset(p) for p in range(3)] == [342, 315, 343], "İlk 1000 işlem partition\\\'lara 342, 315, 343 dağılmalı"\nassert konu.oku(1, 0, 3) == [(0, 3), (1, 7), (2, 11)], "Partition 1\\\'in ilk üç mesajı (offset, txn_id): (0,3), (1,7), (2,11)"\nassert konu.oku(1, 314, 10) == [(314, konu.partitionlar[1][314])], "Sona yakın okuma yalnız kalan mesajları vermeli"\nassert konu.oku(2, 343, 5) == [], "Son offset\\\'ten okuma boş liste dönmeli"\nk2 = Konu(2)\nassert k2.yaz(7, "a") == (1, 0) and k2.yaz(9, "b") == (1, 1) and k2.yaz(4, "c") == (0, 0), "Offset partition başına ayrı artmalı"\n',
      hints: ['Liste üreteci: <code>[[] for _ in range(n)]</code>.', 'Eklemeden sonra offset <code>len(liste) - 1</code>\'dir.', '<code>enumerate(dilim, start=offset)</code> doğru offset numaralarını verir.'],
      why: 'Kafka\'nın kalbi bu kadar basit bir veri yapısıdır: yalnız sona eklenen liste ve onun indeksleri. Okumak hiçbir şeyi silmez; bu yüzden aynı log\'u farklı gruplar farklı hızlarda okuyabilir.'
    },
    {
      t: 'code',
      id: 'akis-isleme-2',
      stage: 'Rehberli',
      diff: 1,
      q: '<p>Dakikalık tumbling pencere. <code>dakika_sayaci(olaylar)</code>: olay sözlüklerinin <code>txn_time</code> alanından (<code>"2024-03-15 10:07:42"</code>) dakika anahtarını (<code>"2024-03-15 10:07"</code>) çıkar ve <code>{dakika: adet}</code> sözlüğü döndür. Sonra <code>yogun_dakikalar(sayac, esik)</code>: adedi <code>esik</code> ve üstünde olan dakikaları sıralı liste olarak döndür.</p><p>15 Mart 2024\'teki işlemlerle test edilecek.</p>',
      guide: ['Boş sözlük kur; her olayın <code>txn_time[:16]</code> dilimini anahtar yap.', 'Sayacı <code>get(k, 0) + 1</code> ile artır.', '<code>yogun_dakikalar</code>: liste üreteciyle süz ve <code>sorted</code> ile sırala.'],
      example: 'saatler = ["09:15:20", "09:15:59", "09:16:01"]\nsayac = {}\nfor s in saatler:\n    anahtar = s[:5]                  # "09:15"\n    sayac[anahtar] = sayac.get(anahtar, 0) + 1\nprint(sayac, sorted(k for k, v in sayac.items() if v >= 2))\n',
      start: 'import veri\n\ntxns = veri.kayitlar("ilgaz_bank", "bank_txns")\n\ngun = [t for t in txns if t["txn_time"].startswith("2024-03-15")]\n\n\ndef dakika_sayaci(olaylar):\n    sayac = {}\n    for o in olaylar:\n        pass  # TODO: dakika anahtarını çıkar ve say\n    return sayac\n\n\ndef yogun_dakikalar(sayac, esik):\n    return []  # TODO\n',
      sol: 'import veri\n\ntxns = veri.kayitlar("ilgaz_bank", "bank_txns")\n\ngun = [t for t in txns if t["txn_time"].startswith("2024-03-15")]\n\n\ndef dakika_sayaci(olaylar):\n    sayac = {}\n    for o in olaylar:\n        k = o["txn_time"][:16]\n        sayac[k] = sayac.get(k, 0) + 1\n    return sayac\n\n\ndef yogun_dakikalar(sayac, esik):\n    return sorted(k for k, v in sayac.items() if v >= esik)\n\n\ns = dakika_sayaci(gun)\nprint(len(gun), len(s), yogun_dakikalar(s, 3))\n',
      tests: 's = dakika_sayaci(gun)\nassert len(gun) == 151 and len(s) == 141, "15 Mart\\\'ta 151 işlem 141 farklı dakikaya düşmeli; gelen " + str(len(s))\nassert sum(s.values()) == 151, "Sayaç toplamı işlem sayısına eşit olmalı"\nassert yogun_dakikalar(s, 3) == ["2024-03-15 11:56"], "3 ve üstü işlem yalnız 11:56\\\'da var"\nassert len(yogun_dakikalar(s, 2)) == 9, "2 ve üstü işlem olan 9 dakika olmalı"\nassert dakika_sayaci([{"txn_time": "2024-01-01 10:00:59"}, {"txn_time": "2024-01-01 10:01:00"}]) == {"2024-01-01 10:00": 1, "2024-01-01 10:01": 1}, "Dakika sınırı: 10:00:59 ve 10:01:00 farklı pencerelerdir"\n',
      hints: ['ISO tarih metninde ilk 16 karakter dakikaya kadar olan kısımdır.', '<code>sorted(k for k, v in sayac.items() if v &gt;= esik)</code>'],
      why: 'Tumbling pencerede pencere anahtarı, olay zamanının pencere boyutuna aşağı yuvarlanmış hâlidir. Dakika için metin dilimi, genel boyut için <code>epoch // boyut * boyut</code> kullanılır. 151 işlem 141 dolu dakikaya yayılmış; yoğun dakikalar maaş ve fatura talimatlarının toplu çalıştığı anlardır.'
    },
    {
      t: 'code',
      id: 'akis-isleme-3',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>En az bir kez teslimatta aynı mesaj birden çok kez gelebilir. <code>idempotent_bakiye(teslimatlar)</code>: mesajları sırayla işle, <code>txn_id</code>\'si daha önce görülen mesajı atla; hesap başına <code>amount</code> toplamını (2 basamak) içeren sözlük ve atlanan mesaj sayısını <code>(bakiye, atlanan)</code> olarak döndür.</p><p>Test, Ocak 2024 işlemlerini her 7. mesaj tekrar edilmiş biçimde gönderecek.</p>',
      guide: ['Görülen kimlikler için bir <code>set</code>, bakiyeler için bir sözlük, atlananlar için sayaç tut.', 'Kimlik kümede varsa atlananı artır ve <code>continue</code>.', 'Yoksa kümeye ekle ve hesabın toplamına tutarı ekle.', 'Sonda her toplamı <code>round(..., 2)</code> ile yuvarla.'],
      example: 'olaylar = [{"id": "a", "puan": 5}, {"id": "b", "puan": 3}, {"id": "a", "puan": 5}]\ngorulen, toplam = set(), 0\nfor o in olaylar:\n    if o["id"] in gorulen:\n        continue\n    gorulen.add(o["id"])\n    toplam += o["puan"]\nprint(toplam)\n',
      start: 'import veri\n\ntxns = veri.kayitlar("ilgaz_bank", "bank_txns")\n\nocak = [t for t in txns if t["txn_time"].startswith("2024-01")]\nteslimatlar = []\nfor i, t in enumerate(ocak):\n    teslimatlar.append(t)\n    if i % 7 == 0:\n        teslimatlar.append(t)          # ağ hatası: tekrar teslim\n\n\ndef idempotent_bakiye(teslimatlar):\n    gorulen = set()\n    bakiye = {}\n    atlanan = 0\n    for t in teslimatlar:\n        # TODO 1: daha önce görüldüyse atla ve say\n        # TODO 2: hesabın toplamına ekle\n        pass\n    return {h: round(v, 2) for h, v in bakiye.items()}, atlanan\n',
      sol: 'import veri\n\ntxns = veri.kayitlar("ilgaz_bank", "bank_txns")\n\nocak = [t for t in txns if t["txn_time"].startswith("2024-01")]\nteslimatlar = []\nfor i, t in enumerate(ocak):\n    teslimatlar.append(t)\n    if i % 7 == 0:\n        teslimatlar.append(t)\n\n\ndef idempotent_bakiye(teslimatlar):\n    gorulen = set()\n    bakiye = {}\n    atlanan = 0\n    for t in teslimatlar:\n        if t["txn_id"] in gorulen:\n            atlanan += 1\n            continue\n        gorulen.add(t["txn_id"])\n        bakiye[t["account_id"]] = bakiye.get(t["account_id"], 0) + t["amount"]\n    return {h: round(v, 2) for h, v in bakiye.items()}, atlanan\n\n\nb, atlanan = idempotent_bakiye(teslimatlar)\nprint(len(teslimatlar), atlanan, len(b), round(sum(b.values()), 2))\n',
      tests: 'b, atlanan = idempotent_bakiye(teslimatlar)\nassert len(teslimatlar) == 3837 and atlanan == 480, "3837 teslimattan 480\\\'i tekrar olarak atlanmalı; gelen " + str(atlanan)\nassert len(b) == 709, "Ocak\\\'ta işlem yapan 709 hesap olmalı"\nassert round(sum(b.values()), 2) == 8711801.34, "Toplam, tekrarsız Ocak toplamına (8711801.34) eşit olmalı"\ntek, _ = idempotent_bakiye(ocak)\nassert b == tek, "Tekrarlı ve tekrarsız teslimat aynı sonucu vermeli (idempotentlik)"\nassert idempotent_bakiye([]) == ({}, 0), "Boş girdide ({}, 0)"\n',
      hints: ['Benzersizlik için <code>set</code> ve <code>in</code>.', 'Atla: <code>if t["txn_id"] in gorulen: atlanan += 1; continue</code>', 'Ekle: <code>bakiye[h] = bakiye.get(h, 0) + t["amount"]</code>'],
      why: 'Tekrar edilen 480 mesaj atlandı ve Ocak toplamı tekrarsız sonuçla birebir aynı çıktı. Üretimde "görülen kimlikler" kümesi bellekte değil, hedef tablonun birincil anahtarında (<code>ON CONFLICT DO NOTHING</code>) ya da süreli bir Redis kümesinde tutulur.'
    },
    {
      t: 'code',
      id: 'akis-isleme-4',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Bir üretici ve <code>n_tuketici</code> tüketiciyle <code>asyncio.Queue</code> hattı kur. <code>kanal_say(olaylar, n_tuketici)</code> fonksiyonu:</p><ul><li><code>maxsize=20</code> olan bir kuyruk açar,</li><li>üretici bütün olayları kuyruğa koyar, sonra her tüketici için bir <code>None</code> gönderir,</li><li>her tüketici <code>None</code> görene kadar olayları alır ve ortak sözlükte <code>channel</code> başına sayar,</li><li>sonunda <code>{channel: adet}</code> sözlüğünü döndürür (olay döngüsünü fonksiyon içinde <code>asyncio.new_event_loop()</code> ile kur, işin bitince kapat).</li></ul>',
      guide: [
        '<code>async def uretici(q)</code>: <code>await q.put(o)</code> döngüsü, sonra <code>n_tuketici</code> kez <code>await q.put(None)</code>.',
        '<code>async def tuketici(q)</code>: <code>while (o := await q.get()) is not None:</code> ile ortak sözlüğü güncelle.',
        '<code>async def main()</code>: kuyruğu kur, <code>asyncio.gather</code> ile üreticiyi ve tüketicileri birlikte bekle.',
        '<code>loop = asyncio.new_event_loop()</code>, <code>loop.run_until_complete(main())</code>, <code>loop.close()</code>.'
      ],
      example: 'import asyncio\n\nasync def main():\n    q = asyncio.Queue(maxsize=2)\n    toplam = []\n    async def uret():\n        for x in [3, 4, 5]:\n            await q.put(x)\n        await q.put(None)\n    async def tuket():\n        while (x := await q.get()) is not None:\n            toplam.append(x * 2)\n    await asyncio.gather(uret(), tuket())\n    return toplam\n\nloop = asyncio.new_event_loop()\nprint(loop.run_until_complete(main()))\nloop.close()\n',
      start: 'import veri\n\ntxns = veri.kayitlar("ilgaz_bank", "bank_txns")\n\nimport asyncio\n\nocak = [t for t in txns if t["txn_time"].startswith("2024-01")]\n\n\ndef kanal_say(olaylar, n_tuketici):\n    sayac = {}\n\n    async def uretici(q):\n        pass  # TODO 1: olayları ve n_tuketici kadar None gönder\n\n    async def tuketici(q):\n        pass  # TODO 2: None gelene kadar channel say\n\n    async def main():\n        q = asyncio.Queue(maxsize=20)\n        # TODO 3: gather ile hepsini çalıştır\n\n    loop = asyncio.new_event_loop()\n    loop.run_until_complete(main())\n    loop.close()\n    return sayac\n',
      sol: 'import veri\n\ntxns = veri.kayitlar("ilgaz_bank", "bank_txns")\n\nimport asyncio\n\nocak = [t for t in txns if t["txn_time"].startswith("2024-01")]\n\n\ndef kanal_say(olaylar, n_tuketici):\n    sayac = {}\n\n    async def uretici(q):\n        for o in olaylar:\n            await q.put(o)\n        for _ in range(n_tuketici):\n            await q.put(None)\n\n    async def tuketici(q):\n        while (o := await q.get()) is not None:\n            sayac[o["channel"]] = sayac.get(o["channel"], 0) + 1\n\n    async def main():\n        q = asyncio.Queue(maxsize=20)\n        await asyncio.gather(uretici(q), *(tuketici(q) for _ in range(n_tuketici)))\n\n    loop = asyncio.new_event_loop()\n    loop.run_until_complete(main())\n    loop.close()\n    return sayac\n\n\nprint(sorted(kanal_say(ocak, 3).items()))\n',
      tests: 'beklenen = {"atm": 243, "internet": 1195, "mobil": 966, "pos": 756, "sistem": 99, "sube": 98}\nassert kanal_say(ocak, 3) == beklenen, "Ocak kanal sayıları tutmuyor: " + str(kanal_say(ocak, 3))\nassert kanal_say(ocak, 1) == beklenen and kanal_say(ocak, 5) == beklenen, "Sonuç tüketici sayısından bağımsız olmalı (her tüketiciye bir None)"\nassert kanal_say([], 2) == {}, "Boş akışta boş sözlük; program takılmamalı"\n',
      hints: ['Her tüketiciye bir sentinel gerekir; tek <code>None</code> yalnız bir tüketiciyi durdurur.', '<code>await asyncio.gather(uretici(q), *(tuketici(q) for _ in range(n_tuketici)))</code>', 'Walrus kalıbı: <code>while (o := await q.get()) is not None:</code>'],
      why: '<code>maxsize</code> geri basınç sağlar: tüketiciler yavaşsa üretici <code>put</code>\'ta bekler, bellek şişmez. Kafka\'da bu rolü tüketicinin kendi hızında <code>poll</code> etmesi üstlenir. Tüketici sayısı ne olursa olsun sayım aynı çıkmalı: sonuç işçi sayısından bağımsızdır.'
    },
    {
      t: 'code',
      id: 'akis-isleme-5',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Kafka\'nın <b>RangeAssignor</b> stratejisini yaz. <code>range_ata(n_partition, tuketiciler)</code>: tüketici adlarını alfabetik sırala; her tüketiciye ardışık bir partition aralığı ver. Partition sayısı tüketici sayısına tam bölünmüyorsa <b>ilk</b> <code>n_partition % len(tuketiciler)</code> tüketici birer fazla partition alır. Dönüş: <code>{tuketici: [partition numaraları]}</code>; partition alamayan tüketicinin listesi boş olur.</p>',
      start: 'def range_ata(n_partition, tuketiciler):\n    pass\n',
      sol: 'def range_ata(n_partition, tuketiciler):\n    sirali = sorted(tuketiciler)\n    taban, fazla = divmod(n_partition, len(sirali))\n    atama, bas = {}, 0\n    for i, t in enumerate(sirali):\n        adet = taban + (1 if i < fazla else 0)\n        atama[t] = list(range(bas, bas + adet))\n        bas += adet\n    return atama\n\n\nprint(range_ata(7, ["c2", "c1", "c3"]))\n',
      tests: 'assert range_ata(6, ["b", "a", "c"]) == {"a": [0, 1], "b": [2, 3], "c": [4, 5]}, "6 partition 3 tüketiciye ikişer dağılmalı"\nassert range_ata(7, ["c2", "c1", "c3"]) == {"c1": [0, 1, 2], "c2": [3, 4], "c3": [5, 6]}, "Artan partition ilk tüketiciye gitmeli"\nr = range_ata(4, ["t1", "t2", "t3", "t4", "t5", "t6"])\nassert r["t5"] == [] and r["t6"] == [], "Partition\\\'dan fazla tüketici varsa son tüketiciler boşta kalmalı"\nassert sorted(p for v in r.values() for p in v) == [0, 1, 2, 3], "Her partition tam bir kez atanmalı"\nassert range_ata(1, ["x"]) == {"x": [0]}, "Tek tüketici tek partition"\n',
      hints: ['<code>divmod(n_partition, len(tuketiciler))</code> taban adedi ve artanı verir.', 'Bir başlangıç işaretçisi tut; her tüketiciye <code>range(bas, bas + adet)</code> ver ve işaretçiyi ilerlet.'],
      why: 'Bu, tüketici grubundaki rebalance\'ın çıktısıdır. Partition\'dan fazla tüketici boşta kalır; bu yüzden paralellik planı partition sayısıyla yapılır. Kafka\'da RoundRobin ve CooperativeSticky gibi başka atama stratejileri de vardır; sticky olan, rebalance\'ta en az partition\'ı taşır.'
    },
    {
      t: 'code',
      id: 'akis-isleme-6',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Kayan (hopping) pencere. <code>kayan_pencere(dakikalar, boyut, adim)</code>: <code>dakikalar</code> gün başından itibaren dakika cinsinden olay zamanlarıdır (ör. 10:07 → 607). Pencere başlangıçları <code>adim</code>\'ın katlarıdır ve her pencere <code>[bas, bas + boyut)</code> aralığını kapsar; bir olay birden çok pencereye düşebilir. Yalnız en az bir olayı olan pencereleri <code>(bas, adet)</code> listesi olarak, başlangıca göre sıralı döndür. <code>boyut</code>, <code>adim</code>\'ın tam katıdır.</p><p>Test: 15 Mart 2024 işlemleri, 60 dakikalık pencere, 30 dakikalık adım.</p>',
      start: 'import veri\n\ntxns = veri.kayitlar("ilgaz_bank", "bank_txns")\n\ngun = [t for t in txns if t["txn_time"].startswith("2024-03-15")]\ndakikalar = [int(t["txn_time"][11:13]) * 60 + int(t["txn_time"][14:16]) for t in gun]\n\n\ndef kayan_pencere(dakikalar, boyut, adim):\n    pass\n',
      sol: 'import veri\n\ntxns = veri.kayitlar("ilgaz_bank", "bank_txns")\n\ngun = [t for t in txns if t["txn_time"].startswith("2024-03-15")]\ndakikalar = [int(t["txn_time"][11:13]) * 60 + int(t["txn_time"][14:16]) for t in gun]\n\n\ndef kayan_pencere(dakikalar, boyut, adim):\n    sayac = {}\n    for d in dakikalar:\n        son_bas = d // adim * adim\n        for bas in range(son_bas, son_bas - boyut, -adim):\n            if bas >= 0:\n                sayac[bas] = sayac.get(bas, 0) + 1\n    return sorted(sayac.items())\n\n\nr = kayan_pencere(dakikalar, 60, 30)\nprint(len(r), r[:3], max(r, key=lambda x: x[1]))\n',
      tests: 'r = kayan_pencere(dakikalar, 60, 30)\nassert len(r) == 35, "60/30 kayan pencerede 35 dolu pencere olmalı; gelen " + str(len(r))\nassert r[:3] == [(150, 1), (180, 1), (450, 6)], "İlk pencereler (150,1), (180,1), (450,6) olmalı; gelen " + str(r[:3])\nassert sum(n for _, n in r) == 302, "Her olay 2 pencereye düşer: toplam 2 x 151 = 302"\nassert max(r, key=lambda x: x[1]) == (690, 16), "En yoğun pencere 11:30-12:30 (690) ve 16 işlem olmalı"\nassert kayan_pencere([0, 59, 60], 60, 30) == [(0, 2), (30, 2), (60, 1)], "Küçük örnek: 0 ve 59 [0,60) penceresinde; 59 ve 60 [30,90) penceresinde; 60 [60,120) penceresinde"\n',
      hints: ['Bir olayın düştüğü en son pencere <code>d // adim * adim</code>\'da başlar.', 'Geriye doğru <code>adim</code> adımlarla <code>boyut / adim</code> pencere say: <code>range(son_bas, son_bas - boyut, -adim)</code>.', 'Negatif başlangıçlı pencereleri atla.'],
      why: 'Her olay boyut/adım = 2 pencereye sayıldığı için pencere toplamları olay sayısının iki katıdır. Kayan pencere ani sıçramaları yumuşatır: "son 1 saatte, yarım saatte bir güncellenen işlem sayısı" gibi panolarda kullanılır.'
    },
    {
      t: 'code',
      id: 'akis-isleme-7',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Oturum (session) penceresi. <code>oturumlar(zamanlar, bosluk_dk)</code>: sıralı <code>"YYYY-MM-DD HH:MM:SS"</code> metinlerinden oluşan listeyi oturumlara ayır. Ardışık iki olay arasındaki fark <code>bosluk_dk</code> dakikadan <b>büyükse</b> yeni oturum başlar. Dönüş: <code>(baslangic, bitis, adet)</code> demetlerinin listesi.</p><p>Test, en çok işlemi olan hesabın (100583) işlemlerini kullanacak.</p>',
      start: 'import veri\n\ntxns = veri.kayitlar("ilgaz_bank", "bank_txns")\n\nfrom datetime import datetime\n\nzamanlar = [t["txn_time"] for t in txns if t["account_id"] == 100583]\n\n\ndef oturumlar(zamanlar, bosluk_dk):\n    pass\n',
      sol: 'import veri\n\ntxns = veri.kayitlar("ilgaz_bank", "bank_txns")\n\nfrom datetime import datetime\n\nzamanlar = [t["txn_time"] for t in txns if t["account_id"] == 100583]\n\n\ndef oturumlar(zamanlar, bosluk_dk):\n    sonuc = []\n    for z in zamanlar:\n        an = datetime.strptime(z, "%Y-%m-%d %H:%M:%S")\n        if sonuc and (an - sonuc[-1][3]).total_seconds() <= bosluk_dk * 60:\n            bas, _, adet, _ = sonuc[-1]\n            sonuc[-1] = (bas, z, adet + 1, an)\n        else:\n            sonuc.append((z, z, 1, an))\n    return [(b, e, n) for b, e, n, _ in sonuc]\n\n\no = oturumlar(zamanlar, 360)\nprint(len(zamanlar), len(o), max(o, key=lambda x: x[2]))\n',
      tests: 'o = oturumlar(zamanlar, 360)\nassert len(zamanlar) == 112 and len(o) == 105, "100583 hesabının 112 işlemi 6 saatlik boşlukla 105 oturuma ayrılmalı; gelen " + str(len(o))\nassert ("2024-02-13 16:06:22", "2024-02-13 23:21:14", 3) in o, "13 Şubat\\\'taki üç işlem tek oturum olmalı"\nassert sum(n for _, _, n in o) == 112, "Oturum adetleri toplamı işlem sayısına eşit olmalı"\nk = ["2024-01-01 10:00:00", "2024-01-01 10:30:00", "2024-01-01 11:30:01"]\nassert oturumlar(k, 30) == [("2024-01-01 10:00:00", "2024-01-01 10:30:00", 2), ("2024-01-01 11:30:01", "2024-01-01 11:30:01", 1)], "Tam 30 dakika fark aynı oturumdur; 60 dakikadan fazla fark yeni oturumdur"\nassert oturumlar([], 10) == [], "Boş listede boş sonuç"\n',
      hints: ['Metni <code>datetime.strptime(z, "%Y-%m-%d %H:%M:%S")</code> ile çevir; farkın <code>total_seconds()</code>\'ını kullan.', 'Son oturumun bitişini tut; yeni olay yakınsa oturumu uzat, değilse yeni oturum aç.', 'Eşik "büyükse yeni oturum": tam <code>bosluk_dk</code> dakika fark aynı oturumdur.'],
      why: 'Oturum pencereleri anahtar başına (hesap, kullanıcı) tutulur ve boyutları veriye göre değişir. Flink ve Spark Structured Streaming\'de <code>session_window(zaman, "6 hours")</code> ile tanımlanır; sırasız gelen bir olay iki oturumu birleştirebildiği için durum yönetimi tumbling\'e göre zordur.'
    },
    {
      t: 'code',
      id: 'akis-isleme-8',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Şema kayıt defterinin <b>geriye uyumluluk</b> denetimini yaz. Şemalar <code>{alan: {"tip": ..., "varsayilan": ...}}</code> sözlükleridir (<code>varsayilan</code> anahtarı olmayabilir). <code>geriye_uyumlu(eski, yeni)</code> yeni şemanın eski veriyi okuyabilmesi için şunları denetlesin ve <code>(uyumlu_mu, sorunlar)</code> döndürsün:</p><ul><li>Yeni şemada olup eskide olmayan alanın <code>varsayilan</code> anahtarı olmalı; yoksa sorun: <code>"ekle:ALAN"</code>.</li><li>İki şemada da olan alanın tipi değişmişse sorun: <code>"tip:ALAN"</code>. İstisna: <code>int</code> → <code>long</code> ve <code>float</code> → <code>double</code> genişletmeleri uyumludur.</li><li>Eski şemadan silinen alan sorun değildir.</li></ul><p><code>sorunlar</code> alfabetik sıralı liste olsun.</p>',
      start: 'def geriye_uyumlu(eski, yeni):\n    pass\n',
      sol: 'GENISLEME = {("int", "long"), ("float", "double")}\n\n\ndef geriye_uyumlu(eski, yeni):\n    sorunlar = []\n    for alan, tanim in yeni.items():\n        if alan not in eski:\n            if "varsayilan" not in tanim:\n                sorunlar.append("ekle:" + alan)\n        elif eski[alan]["tip"] != tanim["tip"] and (eski[alan]["tip"], tanim["tip"]) not in GENISLEME:\n            sorunlar.append("tip:" + alan)\n    sorunlar.sort()\n    return not sorunlar, sorunlar\n\n\nv1 = {"txn_id": {"tip": "long"}, "amount": {"tip": "float"}, "channel": {"tip": "string"}}\nv2 = {"txn_id": {"tip": "long"}, "amount": {"tip": "double"}, "risk": {"tip": "double", "varsayilan": None}}\nprint(geriye_uyumlu(v1, v2))\n',
      tests: 'v1 = {"txn_id": {"tip": "long"}, "amount": {"tip": "float"}, "channel": {"tip": "string"}}\nv2 = {"txn_id": {"tip": "long"}, "amount": {"tip": "double"}, "risk": {"tip": "double", "varsayilan": None}}\nassert geriye_uyumlu(v1, v2) == (True, []), "float->double genişlemesi ve varsayılanlı yeni alan uyumludur; silinen alan sorun değildir"\nv3 = {"txn_id": {"tip": "string"}, "amount": {"tip": "float"}, "sube": {"tip": "int"}}\nassert geriye_uyumlu(v1, v3) == (False, ["ekle:sube", "tip:txn_id"]), "Varsayılansız yeni alan ve long->string değişimi sorundur; liste sıralı olmalı"\nassert geriye_uyumlu({"a": {"tip": "long"}}, {"a": {"tip": "int"}}) == (False, ["tip:a"]), "long->int daraltmadır, uyumsuzdur"\nassert geriye_uyumlu({}, {"x": {"tip": "int", "varsayilan": 0}}) == (True, []), "Varsayılan 0 olsa da (falsy) anahtar var: uyumlu"\n',
      hints: ['Yeni şemanın alanlarını gez; iki durum var: alan eskide yok ya da var.', 'Varsayılanı <code>"varsayilan" in tanim</code> ile denetle; değeri None ya da 0 olabilir.', 'İzinli genişlemeleri bir küme demetinde tut: <code>{("int", "long"), ("float", "double")}</code>.'],
      why: 'Confluent Schema Registry\'nin BACKWARD uyumluluk kuralı budur: yeni tüketici eski mesajları okuyabilmeli. Varsayılanı olmayan yeni alan eski mesajlarda bulunmadığı için okuma başarısız olur. FORWARD ve FULL modları ters yönü de denetler.'
    },
    {
      t: 'code',
      id: 'akis-isleme-9',
      stage: 'Hata avı',
      diff: 2,
      kind: 'bug',
      q: '<p>Dolandırıcılık tüketicisi çöküp yeniden başladıktan sonra bazı işlemlerin <b>hiç</b> incelenmediği fark edildi. <code>tuket(log, durum, islenen, coku_offset)</code> commit edilen offset\'ten okumaya başlıyor; <code>coku_offset</code> verilirse o mesajı işlerken çöküyor (<code>Coktu</code> fırlatıyor). <b>Hatayı bul ve düzelt</b>: çökme ve yeniden başlatma sonrasında hiçbir mesaj kaybolmamalı (en az bir kez).</p>',
      start: 'import veri\n\ntxns = veri.kayitlar("ilgaz_bank", "bank_txns")\n\n\n\nclass Coktu(Exception):\n    pass\n\n\ndef tuket(log, durum, islenen, coku_offset=None):\n    offset = durum.get("offset", 0)\n    while offset < len(log):\n        durum["offset"] = offset + 1            # commit\n        if offset == coku_offset:\n            raise Coktu(offset)\n        islenen.append(log[offset]["txn_id"])   # işle\n        offset += 1\n\n\nlog = txns[:50]\ndurum, islenen = {}, []\ntry:\n    tuket(log, durum, islenen, coku_offset=20)\nexcept Coktu:\n    print("çöktü, yeniden başlatılıyor")\ntuket(log, durum, islenen)\nprint(len(islenen), "işlendi")\n',
      sol: 'import veri\n\ntxns = veri.kayitlar("ilgaz_bank", "bank_txns")\n\n\n\nclass Coktu(Exception):\n    pass\n\n\ndef tuket(log, durum, islenen, coku_offset=None):\n    offset = durum.get("offset", 0)\n    while offset < len(log):\n        if offset == coku_offset:\n            raise Coktu(offset)\n        islenen.append(log[offset]["txn_id"])   # önce işle\n        durum["offset"] = offset + 1            # sonra commit\n        offset += 1\n\n\nlog = txns[:50]\ndurum, islenen = {}, []\ntry:\n    tuket(log, durum, islenen, coku_offset=20)\nexcept Coktu:\n    print("çöktü, yeniden başlatılıyor")\ntuket(log, durum, islenen)\nprint(len(islenen), "işlendi")\n',
      tests: 'log = txns[:50]\ndurum, islenen = {}, []\ntry:\n    tuket(log, durum, islenen, coku_offset=20)\nexcept Coktu:\n    pass\nassert durum["offset"] == 20, "Çökmeden sonra commit edilen offset 20 olmalı (20. mesaj işlenmedi); gelen " + str(durum["offset"])\ntuket(log, durum, islenen)\nassert islenen == [t["txn_id"] for t in log], "Yeniden başlatınca 50 mesajın hepsi sırayla işlenmiş olmalı; kayıp: " + str(sorted(set(t["txn_id"] for t in log) - set(islenen)))\nassert durum["offset"] == 50, "Sonunda offset 50 olmalı"\n',
      hints: ['Commit satırı nerede? Çökme commit ile işleme arasında olursa ne olur?', 'Sırayı değiştir: önce <code>islenen.append</code>, sonra <code>durum["offset"] = offset + 1</code>.'],
      why: 'Önce commit sonra işleme "en çok bir kez" teslimattır: çökme anındaki mesaj kaybolur (txn_id 21 hiç incelenmezdi). Önce işleyip sonra commit etmek "en az bir kez"dir: çökme işleme ile commit arasında olursa mesaj tekrar gelir, bunu da idempotent tüketici karşılar. Dolandırıcılıkta kayıp, tekrardan çok daha pahalıdır.'
    },
    {
      t: 'code',
      id: 'akis-isleme-10',
      stage: 'Hata avı',
      diff: 2,
      kind: 'bug',
      q: '<p>Mobil uygulama işlemleri gecikmeyle gönderiyor; her mesajda olay zamanı (<code>txn_time</code>) ve kuyruğa ulaşma zamanı (<code>alinma</code>) var. Dakikalık işlem panosu, muhasebenin olay zamanına göre yaptığı sayımla tutmuyor. <b>Hatayı bul ve düzelt</b>: <code>dakikalik_pano(mesajlar)</code> olay zamanına göre <code>{dakika: adet}</code> üretmeli.</p>',
      start: 'import veri\n\ntxns = veri.kayitlar("ilgaz_bank", "bank_txns")\n\nfrom datetime import datetime, timedelta\n\ngun = [t for t in txns if t["txn_time"].startswith("2024-03-15")]\nmesajlar = []\nfor t in gun:\n    gecikme = timedelta(seconds=(t["txn_id"] % 5) * 25)\n    alinma = datetime.strptime(t["txn_time"], "%Y-%m-%d %H:%M:%S") + gecikme\n    mesajlar.append({**t, "alinma": alinma.strftime("%Y-%m-%d %H:%M:%S")})\n\n\ndef dakikalik_pano(mesajlar):\n    pano = {}\n    for m in mesajlar:\n        dakika = m["alinma"][:16]\n        pano[dakika] = pano.get(dakika, 0) + 1\n    return pano\n\n\nprint(len(dakikalik_pano(mesajlar)))\n',
      sol: 'import veri\n\ntxns = veri.kayitlar("ilgaz_bank", "bank_txns")\n\nfrom datetime import datetime, timedelta\n\ngun = [t for t in txns if t["txn_time"].startswith("2024-03-15")]\nmesajlar = []\nfor t in gun:\n    gecikme = timedelta(seconds=(t["txn_id"] % 5) * 25)\n    alinma = datetime.strptime(t["txn_time"], "%Y-%m-%d %H:%M:%S") + gecikme\n    mesajlar.append({**t, "alinma": alinma.strftime("%Y-%m-%d %H:%M:%S")})\n\n\ndef dakikalik_pano(mesajlar):\n    pano = {}\n    for m in mesajlar:\n        dakika = m["txn_time"][:16]\n        pano[dakika] = pano.get(dakika, 0) + 1\n    return pano\n\n\nprint(len(dakikalik_pano(mesajlar)))\n',
      tests: 'p = dakikalik_pano(mesajlar)\nfrom collections import Counter\nassert p == dict(Counter(t["txn_time"][:16] for t in gun)), "Pano olay zamanına (txn_time) göre sayılmalı"\nassert len(p) == 141, "Olay zamanına göre 141 dolu dakika olmalı; işlem zamanıyla 144 çıkar. Gelen " + str(len(p))\nassert p["2024-03-15 11:56"] == 3, "11:56\\\'da 3 işlem olmalı"\n',
      hints: ['Hangi saat iş ölçüsüdür: işlemin olduğu an mı, mesajın geldiği an mı?', 'Pencere anahtarını <code>txn_time</code>\'dan üret.'],
      why: 'İşlem zamanına göre pencereleme, gecikmeli olayları yanlış dakikaya yazar ve sonuç ağın o anki hızına bağlı olur: aynı veriyi yeniden işlediğinde farklı sayılar çıkar. Olay zamanı belirleyicidir (deterministik); gecikmeyi yönetmek watermark\'ın işidir.'
    },
    {
      t: 'code',
      id: 'akis-isleme-11',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Watermark ile pencere kapatma. <code>pencere_isle(olaylar, boyut, gecikme)</code>: <code>olaylar</code> geliş sırasına göre <b>olay zamanı</b> tamsayılarıdır (saniye). Kurallar:</p><ul><li>Pencere başlangıcı <code>z // boyut * boyut</code>; pencere <code>[bas, bas + boyut)</code>.</li><li>Her olaydan sonra watermark = şimdiye kadarki en büyük olay zamanı − <code>gecikme</code>.</li><li>Olay geldiğinde, penceresinin bitişi (<code>bas + boyut</code>) o ana kadarki watermark\'tan küçük ya da eşitse pencere kapanmış sayılır: olay <b>geç</b>tir, <code>gec</code> listesine eklenir ve sayılmaz. (İlk olaydan önce watermark yoktur.)</li><li>Olay işlendikten sonra, bitişi (<code>bas + boyut</code>) watermark\'tan küçük ya da eşit olan bütün açık pencereler başlangıca göre sırayla yayınlanır: <code>(bas, adet)</code>.</li><li>Akış bitince açık kalan pencereler başlangıca göre sırayla yayınlanır.</li></ul><p>Dönüş: <code>(yayinlanan, gec)</code>.</p>',
      start: 'def pencere_isle(olaylar, boyut, gecikme):\n    pass\n',
      sol: 'def pencere_isle(olaylar, boyut, gecikme):\n    acik, yayinlanan, gec = {}, [], []\n    watermark = None\n    for z in olaylar:\n        bas = z // boyut * boyut\n        if watermark is not None and bas + boyut <= watermark:\n            gec.append(z)\n            continue\n        acik[bas] = acik.get(bas, 0) + 1\n        watermark = z - gecikme if watermark is None else max(watermark, z - gecikme)\n        for b in sorted(acik):\n            if b + boyut <= watermark:\n                yayinlanan.append((b, acik.pop(b)))\n    for b in sorted(acik):\n        yayinlanan.append((b, acik[b]))\n    return yayinlanan, gec\n\n\nprint(pencere_isle([5, 40, 70, 50, 130, 59, 61, 200], 60, 30))\n',
      tests: 'y, g = pencere_isle([5, 40, 70, 50, 130, 59, 61, 200], 60, 30)\nassert y == [(0, 3), (60, 2), (120, 1), (180, 1)], "Yayın sırası/adetleri tutmuyor; gelen " + str(y)\nassert g == [59], "130 görüldükten sonra watermark 100 olur, 0-60 penceresi kapanır; 59 geç kalır. Gelen " + str(g)\ny2, g2 = pencere_isle([10, 20, 30], 60, 0)\nassert y2 == [(0, 3)] and g2 == [], "Watermark pencere sonuna ulaşmazsa pencere akış sonunda yayınlanmalı"\ny3, g3 = pencere_isle([125, 5, 61], 60, 0)\nassert y3 == [(120, 1)] and g3 == [5, 61], "İlk olaydan sonra watermark 125 olur; bitişi 60 ve 120 olan pencereler kapanmış sayılır, 5 ve 61 geçtir. Gelen " + str((y3, g3))\n',
      hints: ['Açık pencereler için sözlük, watermark için başta <code>None</code> olan bir değişken tut.', 'Önce geç mi diye bak (<code>bas + boyut &lt;= watermark</code>); değilse say, sonra watermark\'ı güncelle.', 'Her olaydan sonra <code>sorted(acik)</code> üzerinde bitişi watermark\'ı geçmiş pencereleri <code>pop</code> edip yayınla.'],
      why: 'Bu, Flink ve Spark Structured Streaming\'in olay zamanı pencerelerinin özüdür. Gecikme toleransı (burada 30 sn) tamlık ile güncellik arasındaki takastır. Gerçek sistemler geç olayları atmak yerine yan çıkışa (side output) yazar ya da pencere sonucunu düzeltme olarak yeniden yayınlar.'
    },
    {
      t: 'code',
      id: 'akis-isleme-12',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Debezium tarzı CDC olaylarını hedef tabloya uygula. Her olay: <code>{"op": "c"|"u"|"d", "lsn": int, "before": {...}|None, "after": {...}|None}</code>. Anahtar <code>account_id</code>. <code>cdc_uygula(olaylar)</code>:</p><ul><li>Olayları <code>lsn</code>\'ye göre sırala (geliş sırası karışık olabilir).</li><li>Aynı <code>lsn</code> birden çok kez gelmişse yalnız birini uygula (tekrar).</li><li><code>c</code> ve <code>u</code>: <code>after</code> satırını tabloya yaz (upsert). <code>d</code>: <code>before</code> satırının anahtarını tablodan sil.</li></ul><p>Dönüş: <code>{account_id: satir}</code>.</p>',
      start: 'import veri\n\nhesaplar = veri.kayitlar("ilgaz_bank", "bank_accounts")[:4]\n\n\ndef cdc_uygula(olaylar):\n    pass\n',
      sol: 'import veri\n\nhesaplar = veri.kayitlar("ilgaz_bank", "bank_accounts")[:4]\n\n\ndef cdc_uygula(olaylar):\n    tablo, gorulen = {}, set()\n    for o in sorted(olaylar, key=lambda x: x["lsn"]):\n        if o["lsn"] in gorulen:\n            continue\n        gorulen.add(o["lsn"])\n        if o["op"] in ("c", "u"):\n            tablo[o["after"]["account_id"]] = o["after"]\n        elif o["op"] == "d":\n            tablo.pop(o["before"]["account_id"], None)\n    return tablo\n\n\nolaylar = [{"op": "c", "lsn": i + 1, "before": None, "after": h} for i, h in enumerate(hesaplar)]\nprint(sorted(cdc_uygula(olaylar)))\n',
      tests: 'h = hesaplar\nolaylar = [{"op": "c", "lsn": i + 1, "before": None, "after": dict(x)} for i, x in enumerate(h)]\nkapandi = {**h[0], "status": "kapali", "closed_date": "2024-06-30"}\nlimit = {**h[2], "credit_limit": 50000.0}\nolaylar += [\n    {"op": "u", "lsn": 7, "before": h[0], "after": kapandi},\n    {"op": "d", "lsn": 6, "before": h[1], "after": None},\n    {"op": "u", "lsn": 5, "before": h[2], "after": limit},\n    {"op": "u", "lsn": 5, "before": h[2], "after": limit},\n    {"op": "c", "lsn": 8, "before": None, "after": {**h[1], "status": "aktif"}},\n]\nolaylar = olaylar[3:] + olaylar[:3]\nt = cdc_uygula(olaylar)\nids = [x["account_id"] for x in h]\nassert sorted(t) == sorted(ids), "4 hesap da tabloda olmalı (silinen hesap lsn 8 ile yeniden açıldı); gelen " + str(sorted(t))\nassert t[ids[0]]["status"] == "kapali", "lsn 7 güncellemesi uygulanmalı"\nassert t[ids[2]]["credit_limit"] == 50000.0, "lsn 5 limit güncellemesi uygulanmalı"\nassert t[ids[3]] == h[3], "Dokunulmayan satır aynı kalmalı"\nt2 = cdc_uygula([{"op": "d", "lsn": 2, "before": h[0], "after": None}, {"op": "c", "lsn": 1, "before": None, "after": h[0]}])\nassert t2 == {}, "Olaylar lsn sırasıyla uygulanmalı: önce oluştur (1), sonra sil (2)"\n',
      hints: ['<code>sorted(olaylar, key=lambda x: x["lsn"])</code> ve görülen lsn kümesi.', 'Silmede olmayan anahtar hata vermesin: <code>tablo.pop(k, None)</code>.'],
      why: 'CDC hattında olay sırası (LSN, binlog konumu) her şeydir: silme ile oluşturmanın sırası değişirse hedef tabloda hayalet satır kalır. Aynı LSN\'nin tekrar gelmesi en az bir kez teslimatın doğal sonucudur. Ambarlarda bu mantık <code>MERGE INTO ... WHEN MATCHED AND op = \'d\' THEN DELETE</code> ile yazılır.'
    },
    {
      t: 'code',
      id: 'akis-isleme-13',
      stage: 'Mini proje',
      diff: 3,
      q: '<p><b>Ilgaz Bank dakikalık şüpheli işlem sayacı.</b> Uçtan uca akış hattını kur:</p><ol><li><code>uret(txns, n)</code>: işlemleri <code>account_id % n</code> partition\'larına yaz; <code>n</code> listeden oluşan log döndür.</li><li><code>supheli_mi(t)</code>: tutar <code>-20000</code> ya da daha düşükse <b>veya</b> saat (txn_time\'ın 11-13. karakterleri) <code>"06"</code>\'dan küçük ve tutar negatifse <code>True</code>.</li><li><code>tuket(log, offsetler, sayac)</code>: her partition\'ı <code>offsetler[p]</code>\'den (yoksa 0) sonuna kadar oku; şüpheli işlemleri olay zamanının dakikasına (<code>txn_time[:16]</code>) göre <code>sayac</code>\'ta say; her partition\'ın offset\'ini sona taşı (commit). Yeni sayılan şüpheli adedini döndür.</li><li><code>alarmlar(sayac, esik)</code>: adedi eşik ve üstünde olan dakikaları sıralı liste olarak döndür.</li></ol>',
      start: 'import veri\n\ntxns = veri.kayitlar("ilgaz_bank", "bank_txns")\n\n\n\ndef uret(txns, n):\n    pass\n\n\ndef supheli_mi(t):\n    pass\n\n\ndef tuket(log, offsetler, sayac):\n    pass\n\n\ndef alarmlar(sayac, esik):\n    pass\n',
      sol: 'import veri\n\ntxns = veri.kayitlar("ilgaz_bank", "bank_txns")\n\n\n\ndef uret(txns, n):\n    log = [[] for _ in range(n)]\n    for t in txns:\n        log[t["account_id"] % n].append(t)\n    return log\n\n\ndef supheli_mi(t):\n    return t["amount"] <= -20000 or (t["txn_time"][11:13] < "06" and t["amount"] < 0)\n\n\ndef tuket(log, offsetler, sayac):\n    yeni = 0\n    for p, parca in enumerate(log):\n        for t in parca[offsetler.get(p, 0):]:\n            if supheli_mi(t):\n                k = t["txn_time"][:16]\n                sayac[k] = sayac.get(k, 0) + 1\n                yeni += 1\n        offsetler[p] = len(parca)\n    return yeni\n\n\ndef alarmlar(sayac, esik):\n    return sorted(k for k, v in sayac.items() if v >= esik)\n\n\nlog = uret(txns, 3)\noffsetler, sayac = {}, {}\nprint("şüpheli:", tuket(log, offsetler, sayac), "dakika:", len(sayac))\nprint("tekrar çalıştırma:", tuket(log, offsetler, sayac))\nprint("alarm:", alarmlar(sayac, 2))\n',
      tests: 'log = uret(txns, 3)\nassert [len(p) for p in log] == [sum(1 for t in txns if t["account_id"] % 3 == i) for i in range(3)], "Partition\\\'lar account_id % 3\\\'e göre dolmalı"\nassert supheli_mi({"amount": -20000.0, "txn_time": "2024-05-05 14:00:00"}), "-20000 sınırı dahil şüpheli"\nassert supheli_mi({"amount": -100.0, "txn_time": "2024-05-05 05:59:59"}), "06:00 öncesi negatif işlem şüpheli"\nassert not supheli_mi({"amount": 500.0, "txn_time": "2024-05-05 02:00:00"}), "Gece gelen para (pozitif) şüpheli değil"\noffsetler, sayac = {}, {}\nassert tuket(log, offsetler, sayac) == 471, "Yıl boyunca 471 şüpheli işlem olmalı"\nassert len(sayac) == 470, "Şüpheliler 470 farklı dakikaya düşmeli"\nassert offsetler == {0: len(log[0]), 1: len(log[1]), 2: len(log[2])}, "Offset\\\'ler partition sonlarına commit edilmeli"\nassert tuket(log, offsetler, sayac) == 0 and sum(sayac.values()) == 471, "Yeniden çalıştırmada aynı mesajlar tekrar sayılmamalı"\nlog[1].append({"txn_id": 999999, "account_id": 100001, "txn_time": "2024-10-23 08:43:50", "amount": -30000.0})\nassert tuket(log, offsetler, sayac) == 1, "Yeni gelen tek şüpheli mesaj sayılmalı"\nassert alarmlar(sayac, 2) == ["2024-10-23 08:43"] and sayac["2024-10-23 08:43"] == 3, "08:43 dakikası artık 3 şüpheliyle alarm vermeli"\nassert alarmlar(sayac, 4) == [], "Eşik 4\\\'te alarm yok"\n',
      hints: ['Gece kuralı için saat metnini karşılaştırmak yeter: <code>t["txn_time"][11:13] &lt; "06"</code>.', 'Tüketici her partition için <code>parca[offsetler.get(p, 0):]</code> dilimini okur ve sonunda <code>offsetler[p] = len(parca)</code> yapar.', 'İkinci çalıştırmada offset\'ler sonda olduğu için 0 yeni şüpheli dönmeli.'],
      why: 'Bu küçük hat gerçek sistemin iskeletidir: anahtarla bölümlenmiş log, kural tabanlı skor, olay zamanına göre dakikalık sayaç ve commit edilen offset\'ler sayesinde yeniden çalıştırmada tekrar saymama. Üretimde sayaç durumu Redis ya da bir akış motorunun durum deposunda tutulur, alarmlar ise bir Slack/Teams webhook\'una ya da vaka yönetim sistemine gönderilir.'
    }
  ],
  faq: [
    {
      q: 'Kafka bir veritabanı mı, kuyruk mu?',
      a: 'İkisi de değil, ikisinin arası: dağıtık, kalıcı, sona eklemeli bir log. Kuyruk gibi üretici ve tüketiciyi ayırır, ama mesajı okununca silmez; veritabanı gibi saklar, ama anahtarla rastgele sorgu sunmaz. Sorgu gerekiyorsa veriyi Kafka\'dan bir veritabanına ya da ambara akıtırsın.'
    },
    {
      q: 'Kaç partition seçmeliyim?',
      a: 'Hedef işlem hacmine ve tüketici paralelliğine göre. Kaba kural: bir tüketicinin saniyede işleyebildiği mesajı ölç, hedef hacmi buna böl ve büyüme payı ekle. Sonradan artırmak anahtar-partition eşlemesini bozduğu için orta ölçekli topic\'lerde 6-12 gibi cömert bir başlangıç yaygındır.'
    },
    {
      q: 'Tam bir kez (exactly-once) mümkün mü?',
      a: 'Kafka içinde (oku-işle-Kafka\'ya yaz) idempotent üretici ve işlemlerle mümkündür. Dış bir sisteme (veritabanı, e-posta) yazarken ise teslimat en az bir kez olur; etkiyi tek kez yapmak için hedef tarafın idempotent olması gerekir: benzersiz anahtarla upsert, işlenen kimlik tablosu, ya da offset\'i sonuçla aynı veritabanı işleminde saklamak.'
    },
    {
      q: 'Watermark gecikmesini nasıl seçerim?',
      a: 'Gerçek gecikme dağılımını ölç: olay zamanı ile geliş zamanı farkının yüzde 99\'u hangi değerin altında? Gecikmeyi buna göre seç, kalan geç olayları yan çıkışa yaz ve oranını izle. Pano için birkaç saniye, finansal mutabakat için saatler uygun olabilir.'
    },
    {
      q: 'Küçük bir projede Kafka şart mı?',
      a: 'Hayır. Saniyede birkaç yüz olay için PostgreSQL tablosu + polling, Redis Streams ya da RabbitMQ çoğu zaman yeterli ve işletmesi kolaydır. Kafka; yüksek hacim, çok sayıda bağımsız tüketici, replay ve CDC gerektiğinde kendini amorti eder.'
    }
  ],
  mistakes: [
    {
      bad: 'tuketici.commit(msg)\nisle(msg)',
      good: 'isle(msg)\ntuketici.commit(msg)',
      why: 'Önce commit edip sonra işlemek, çökme anındaki mesajı kaybettirir (en çok bir kez). Önce işle, sonra commit et ve tüketiciyi idempotent yaz.'
    },
    {
      bad: 'pencere = mesaj_alinma_zamani[:16]',
      good: 'pencere = olay["txn_time"][:16]',
      why: 'İş ölçüleri olay zamanına göre pencerelenir; işlem zamanı ağ gecikmesine bağlıdır ve yeniden işlemede farklı sonuç verir.'
    },
    {
      bad: 'uretici.produce("bank.txns", value=json.dumps(t))  # anahtar yok',
      good: 'uretici.produce("bank.txns", key=str(t["account_id"]), value=json.dumps(t))',
      why: 'Anahtarsız mesajlar partition\'lara rastgele dağılır; aynı hesabın işlemleri farklı sırada işlenebilir. Sırası önemli varlığı anahtar yap.'
    },
    {
      bad: 'for _ in range(1):\n    await q.put(None)   # 3 tüketici var',
      good: 'for _ in range(n_tuketici):\n    await q.put(None)',
      why: 'Her tüketici bir sentinel tüketir; eksik sentinel gönderirsen bazı tüketiciler sonsuza kadar get() üzerinde bekler ve program bitmez.'
    },
    {
      bad: 'yeni_sema = {"risk_skoru": {"tip": "double"}}  # varsayılan yok',
      good: 'yeni_sema = {"risk_skoru": {"tip": "double", "varsayilan": None}}',
      why: 'Varsayılanı olmayan yeni alan eski mesajlarda bulunmadığı için yeni tüketici onları okuyamaz; geriye uyumluluk bozulur.'
    }
  ]
});
})(window);
