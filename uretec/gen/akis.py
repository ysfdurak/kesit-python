from lib import *

TX = 'import veri\n\ntxns = veri.kayitlar("ilgaz_bank", "bank_txns")\n'

body = '''<h2>Neden önemli? Gece 02:09'daki 80 bin liralık harcama</h2>
<p>Ilgaz Bank'ın işlem tablosunda (<code>bank_txns</code>) gece yarısından sonra internetten yapılmış, 45 ile 94 bin lira arasında kart harcamaları var. Bunları ertesi sabah toplu (batch) raporda görmek, dolandırıcılık ekibi için "çok geç" demektir: kart çoktan boşalmıştır. Bu derste olaylar <b>geldiği anda</b> işlenir: işlem gerçekleşir, mesaj bir kuyruğa yazılır, saniyeler içinde bir tüketici onu okur, kuralı uygular, dakikalık sayacı günceller ve gerekirse alarm üretir. Bu dünyanın merkezinde Apache Kafka vardır; bankacılık, e-ticaret, lojistik ve oyun şirketlerinin çoğu olay akışlarını Kafka ya da benzeri bir sistemle taşır.</p>
<p>Kafka bir küme ve ağ ister, tarayıcıda çalışmaz. Gerçek kodu <code>&lt;pre class="code"&gt;</code> kutularında göreceksin; kavramları ise <b>bellek içi bir log</b> ve <code>asyncio.Queue</code> ile kendin kuracaksın: topic, partition, offset, tüketici grubu, teslim garantileri, pencereleme ve watermark. <b>orkestrasyon</b> dersinde zamanlanmış toplu işleri, <b>async</b> dersinde kuyruk ve işçi havuzunu gördün; burada ikisini birleştirip sürekli akan veriye geçiyoruz.</p>

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
'''
body += PY('''
import veri

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
    print(offset, t["account_id"], t["txn_time"], t["amount"])
''')
body += '''<p><b>Saklama süresi</b> (retention) mesajların ne kadar tutulacağını belirler (ör. 7 gün ya da 500 GB). Mesaj okundu diye silinmez; bu, bir kuyruktan (RabbitMQ) en büyük farkıdır. Yeni bir ekip aynı topic'i baştan okuyabilir, hata düzeltildikten sonra dünkü offset'e dönüp yeniden işleyebilirsin (replay).</p>
<p><b>Tüketici grubu</b> (consumer group) aynı işi paylaşan tüketicilerdir. Kafka her partition'ı gruptaki <b>tek</b> tüketiciye atar; böylece bir partition'ın sırası korunur. 6 partition ve 3 tüketici varsa her biri 2 partition okur; 8 tüketici varsa 2'si boşta bekler. Paralelliğin üst sınırı partition sayısıdır. Grup, her partition için okuduğu son konumu <b>commit</b> eder (<code>__consumer_offsets</code> topic'ine yazılır). Tüketici çöküp yeniden başlarsa commit edilen offset'ten devam eder. Bir tüketici gruba girip çıktığında atamaların yeniden dağıtılmasına <b>rebalance</b> denir.</p>
'''
body += CODE('''
# pip install confluent-kafka      (Kafka'yı yerelde: docker run -p 9092:9092 apache/kafka:3.8.0)
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
    tuketici.commit(msg, asynchronous=False)   # sonra commit: en az bir kez
''')
body += '''<div class="note"><b>Kendi bilgisayarında dene</b>Docker kuruluysa <code>docker run -d --name kafka -p 9092:9092 apache/kafka:3.8.0</code> tek düğümlü bir Kafka başlatır. Python istemcisi için <code>pip install confluent-kafka</code> (ya da saf Python <code>kafka-python</code>). Topic oluşturmak için: <code>docker exec kafka /opt/kafka/bin/kafka-topics.sh --create --topic bank.txns --partitions 3 --bootstrap-server localhost:9092</code>. Bulutta Confluent Cloud, AWS MSK ve Azure Event Hubs (Kafka uyumlu) yönetilen seçeneklerdir.</div>

<h2>Teslim garantileri ve idempotent tüketici</h2>
<div class="tbl-wrap"><table>
<tr><th>Garanti</th><th>Nasıl olur?</th><th>Risk</th></tr>
<tr><td>En çok bir kez (at-most-once)</td><td>Önce commit, sonra işle</td><td>Çökme olursa mesaj <b>kaybolur</b></td></tr>
<tr><td>En az bir kez (at-least-once)</td><td>Önce işle, sonra commit</td><td>Çökme olursa mesaj <b>iki kez</b> işlenir</td></tr>
<tr><td>Tam bir kez (exactly-once)</td><td>Kafka işlemleri (transactions) + idempotent üretici, ya da en az bir kez + idempotent tüketici</td><td>Karmaşık; dış sistemlere yazarken ancak idempotentlikle sağlanır</td></tr>
</table></div>
<p>Pratikte en sık seçilen yol "en az bir kez + <b>idempotent tüketici</b>"dir: aynı mesaj iki kez gelse de sonuç değişmez. Bunun için her olayın benzersiz bir kimliği (<code>txn_id</code>) olur ve tüketici işlediği kimlikleri hatırlar ya da hedef tabloya <code>INSERT ... ON CONFLICT DO NOTHING</code> ile yazar.</p>
'''
body += PY('''
# Ağ hatası yüzünden bazı mesajlar iki kez teslim edildi
teslimat = txns[:5] + txns[2:4] + txns[5:8]
islenen = set()
toplam = 0.0
for t in teslimat:
    if t["txn_id"] in islenen:        # idempotentlik: gördüysen atla
        continue
    islenen.add(t["txn_id"])
    toplam += t["amount"]
print(len(teslimat), "teslimat,", len(islenen), "benzersiz işlem, toplam:", round(toplam, 2))
''')
body += '''<h2>asyncio.Queue ile üretici ve tüketiciler</h2>
<p>Tek süreç içinde Kafka'nın üretici-tüketici ilişkisini <code>asyncio.Queue</code> ile kurabilirsin. Kuyruk dolarsa <code>put</code> bekler (geri basınç, backpressure); boşsa <code>get</code> bekler. Bitişi haber vermek için her tüketiciye bir "zehirli hap" (sentinel, ör. <code>None</code>) gönderilir. Bu derste olay döngüsünü <code>new_event_loop().run_until_complete</code> ile çalıştırıyoruz; betikte <code>asyncio.run(main())</code> aynı işi yapar.</p>
'''
body += PY('''
import asyncio


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
print(sorted(sonuc.items()), sum(sonuc.values()))
''')
body += '''<h2>Pencereleme: tumbling, sliding, session</h2>
<p>Sonsuz bir akışta "toplam" anlamsızdır; bunun yerine zamanı <b>pencerelere</b> (window) bölersin.</p>
<div class="tbl-wrap"><table>
<tr><th>Pencere</th><th>Tanım</th><th>Örnek</th></tr>
<tr><td>Tumbling (devrik)</td><td>Sabit boyutlu, çakışmayan, ardışık</td><td>Her dakikanın şüpheli işlem sayısı</td></tr>
<tr><td>Sliding / hopping (kayan)</td><td>Sabit boyutlu, belirli adımla kayan, çakışan</td><td>Son 60 dakika, her 30 dakikada bir</td></tr>
<tr><td>Session (oturum)</td><td>Etkinlik arası boşluk eşiği aşılınca kapanır; boyutu değişken</td><td>Bir müşterinin mobil oturumu</td></tr>
</table></div>
<p>Tumbling pencerede bir olayın penceresi, zamanın pencere boyutuna göre aşağı yuvarlanmasıyla bulunur. Dakikalık pencere için ISO tarih metninin ilk 16 karakteri yeter:</p>
'''
body += PY('''
from collections import Counter

gun = [t for t in txns if t["txn_time"].startswith("2024-03-15")]
dakika = Counter(t["txn_time"][:16] for t in gun)
print(len(gun), "işlem,", len(dakika), "dolu dakika")
print("en yoğun dakikalar:", dakika.most_common(2))
''')
body += '''<h2>Geç gelen veri ve watermark</h2>
<p>Olaylar sırasız gelebilir. Dakikalık pencereyi ne zaman "kapandı" sayıp sonucu yayınlayacaksın? Sonsuza kadar beklersen sonuç hiç çıkmaz; hemen yayınlarsan geç gelenler kaybolur. <b>Watermark</b> bu ikilemin uzlaşmasıdır: "şimdiye kadar gördüğüm en büyük olay zamanı eksi izin verilen gecikme". Watermark bir pencerenin bitişini geçince pencere kapanır ve yayınlanır; o pencereye sonradan gelen olay <b>geç</b> sayılır (atılır, ayrı bir yan çıkışa yazılır ya da düzeltme olarak gönderilir).</p>
'''
body += PY('''
olaylar = [("10:00:05", "a"), ("10:00:40", "b"), ("10:01:10", "c"),
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
    durum = "GEÇ" if pencere_sonu <= watermark else "zamanında"
    print(ad, zaman, "watermark =", watermark - sn("10:00:00"), "sn ->", durum)
''')
body += '''<p>"d" olayı sırasız gelmesine rağmen 30 saniyelik tolerans içinde kaldı; "f" ise 10:02:30 görüldükten sonra 10:00 penceresine düştüğü için geç sayıldı. Gecikme toleransı büyüdükçe doğruluk artar ama sonuç gecikir: bu, akış işlemenin temel takasıdır.</p>

<h2>Şema evrimi: Avro ve şema kayıt defteri</h2>
<p>Üretici mesaja yeni bir alan eklediğinde eski tüketiciler kırılmamalıdır. Bu yüzden kurumsal Kafka kurulumlarında mesajlar JSON yerine şemalı bir biçimle (<b>Avro</b>, Protobuf) yazılır ve şemalar bir <b>şema kayıt defterinde</b> (Schema Registry) sürümlenir. Kayıt defteri yeni şemayı kaydetmeden önce uyumluluğu denetler: <b>geriye uyumlu</b> (backward) değişiklikte yeni şemayla eski veri okunabilir; bunun için eklenen her alanın varsayılan değeri olmalıdır.</p>
'''
body += CODE('''
{"type": "record", "name": "Txn", "namespace": "ilgazbank",
 "fields": [
   {"name": "txn_id", "type": "long"},
   {"name": "account_id", "type": "long"},
   {"name": "amount", "type": "double"},
   {"name": "channel", "type": "string"},
   {"name": "risk_skoru", "type": ["null", "double"], "default": null}   // v2: varsayılanlı yeni alan
 ]}
''')
body += '''<h2>RabbitMQ, Redis Streams ve Kafka</h2>
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
'''
body += CODE('''
{"op": "u", "ts_ms": 1718000000000, "source": {"table": "bank_accounts", "lsn": 2451},
 "before": {"account_id": 100019, "status": "aktif", "credit_limit": 20000},
 "after":  {"account_id": 100019, "status": "aktif", "credit_limit": 35000}}
''')
body += '''<div class="tip"><b>Tüketici gecikmesi (lag) izlenir</b>Bir akış sisteminin en önemli sağlık ölçüsü <b>consumer lag</b>'dir: her partition için son offset ile grubun commit ettiği offset arasındaki fark. Lag sürekli büyüyorsa tüketiciler yetişemiyordur: partition ve tüketici sayısını artır ya da işlemeyi hızlandır. Burrow, Kafka UI ve Prometheus exporter'ları bu ölçüyü panoya taşır.</div>
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
'''

ex = []
ex.append({'t': 'mc', 'stage': 'Isınma',
    'q': 'Kafka\'da <b>offset</b> neyi ifade eder?',
    'o': ['Mesajın üretildiği saatin milisaniye cinsinden değeri', 'Mesajın partition log\'u içindeki sıra numarası', 'Tüketicinin bir saniyede okuduğu mesaj sayısı', 'Mesajın anahtarının hash değeri'],
    'a': 1,
    'why': 'Offset, partition içindeki konumdur ve 0\'dan başlayıp artar. Tüketici grubu "nerede kaldım?" bilgisini offset olarak commit eder; replay için de belirli bir offset\'e dönülür. Zaman damgası ve anahtar ayrı alanlardır.'})
ex.append({'t': 'mc', 'stage': 'Isınma',
    'q': '<code>bank.txns</code> topic\'inde 4 partition var ve aynı tüketici grubunda 6 tüketici çalışıyor. Ne olur?',
    'o': ['Her partition 1,5 tüketiciye bölünür, paralellik 6 olur', '4 tüketici birer partition okur, 2 tüketici boşta bekler', 'Kafka partition sayısını otomatik olarak 6\'ya çıkarır', 'Her mesaj 6 tüketicinin hepsine ayrı ayrı teslim edilir'],
    'a': 1,
    'why': 'Bir grup içinde her partition yalnız bir tüketiciye atanır; bu, partition içi sıranın korunmasını sağlar. Fazla tüketiciler yedek olarak bekler ve biri düşerse devreye girer. Paralelliği artırmak için partition sayısını artırmak gerekir. Mesajı herkese iletmek ise farklı grup kimlikleriyle olur.'})
ex.append({'t': 'mc', 'stage': 'Isınma',
    'q': 'Tüketici mesajı işleyip <b>sonra</b> offset\'i commit ediyor (en az bir kez). Commit\'ten hemen önce çökerse ne olur ve nasıl telafi edilir?',
    'o': ['Mesaj kaybolur; offset ilerlediği için telafisi yoktur', 'Kafka mesajı otomatik olarak siler; üreticinin yeniden göndermesi gerekir', 'Mesaj yeniden okunup ikinci kez işlenir; tüketiciyi idempotent yazmak gerekir', 'Tüketici grubu kalıcı olarak durur; offset\'leri elle sıfırlamak gerekir'],
    'a': 2,
    'why': 'Commit edilmemiş offset\'ten yeniden başlanacağı için aynı mesaj bir kez daha işlenir. Bu yüzden en az bir kez teslimat, işlenen kimlikleri tutan ya da upsert ile yazan idempotent bir tüketiciyle birleştirilir. Kayıp, önce commit edip sonra işlemede (en çok bir kez) olur.'})

ex.append({'t': 'predict', 'stage': 'Kodu oku',
    'q': 'Mesajlar hesap numarasına göre 2 partition\'a yazılıyor. Çıktı nedir?',
    'code': C('''
partitionlar = [[], []]
mesajlar = [(101, "yatir"), (102, "cek"), (101, "cek"), (103, "fatura"), (101, "fatura")]
for hesap, islem in mesajlar:
    partitionlar[hesap % 2].append(islem)
print(partitionlar[1], len(partitionlar[1]) - 1)
'''),
    'o': ["['yatir', 'cek', 'fatura', 'fatura'] 3", "['yatir', 'cek', 'fatura'] 3", "['cek'] 0", "['yatir', 'cek', 'fatura', 'fatura'] 4"],
    'a': 0,
    'why': '101 ve 103 tek sayıdır, partition 1\'e düşer: yatir, cek (101), fatura (103), fatura (101). Son mesajın offset\'i uzunluk eksi 1, yani 3. Hesap 101\'in üç işlemi kendi aralarındaki sırayı korur.'})
ex.append({'t': 'predict', 'stage': 'Kodu oku',
    'q': 'Saniye cinsinden olay zamanları 60 saniyelik tumbling pencerelere ayrılıyor. Çıktı nedir?',
    'code': C('''
from collections import Counter

zamanlar = [5, 59, 60, 61, 119, 120, 250]
pencereler = Counter(z // 60 * 60 for z in zamanlar)
print(sorted(pencereler.items()))
'''),
    'o': ['[(0, 2), (60, 3), (120, 1), (240, 1)]', '[(0, 3), (60, 2), (120, 1), (240, 1)]', '[(0, 2), (60, 2), (120, 2), (240, 1)]', '[(0, 2), (60, 3), (120, 2)]'],
    'a': 0,
    'why': 'Pencere başlangıcı aşağı yuvarlanır: 5 ve 59 → 0; 60, 61, 119 → 60; 120 → 120; 250 → 240. Pencere [başlangıç, başlangıç + 60) yarı açık aralıktır: 60 saniye bir sonraki pencereye aittir.'})
ex.append({'t': 'predict', 'stage': 'Kodu oku',
    'q': 'Tüketici gecikmesi (lag) hesaplanıyor. Çıktı nedir?',
    'code': C('''
son_offset = {0: 1200, 1: 980, 2: 1500}        # her partition'a yazılacak sıradaki offset
commitli = {0: 1200, 1: 700, 2: 1450}
lag = {p: son_offset[p] - commitli.get(p, 0) for p in son_offset}
print(lag, sum(lag.values()), max(lag, key=lag.get))
'''),
    'o': ['{0: 0, 1: 280, 2: 50} 330 1', '{0: 0, 1: 280, 2: 50} 330 2', '{0: 1200, 1: 280, 2: 50} 1530 0', '{0: 0, 1: 280, 2: 50} 280 1'],
    'a': 0,
    'why': 'Lag = son offset − commit edilen offset: 0, 280 ve 50; toplam 330. <code>max(lag, key=lag.get)</code> en yüksek değere sahip anahtarı, yani en çok geride kalan partition\'ı (1) döndürür.'})
ex.append({'t': 'order', 'stage': 'Kodu oku',
    'q': '<p><code>asyncio.Queue</code> ile üretim ve tüketim adımlarını sırala: önce kuyruğa üç mesaj ve bitiş sinyali (<code>None</code>) konur, sonra tüketim döngüsü <code>None</code> görene kadar mesajları alır.</p>',
    'lines': ['import asyncio',
              'async def main():',
              '    q = asyncio.Queue()',
              '    for i in range(3):',
              '        await q.put(i * 10)',
              '    await q.put(None)',
              '    while (x := await q.get()) is not None:',
              '        print("işlendi", x)',
              'asyncio.new_event_loop().run_until_complete(main())'],
    'expect': 'işlendi 0\nişlendi 10\nişlendi 20\n',
    'hint': 'İçe aktarma en üstte (PEP 8); coroutine içinde önce kuyruk, sonra üretim, sonra sentinel, sonra tüketim; en son olay döngüsü başlatılır.',
    'why': 'Kuyruk iki coroutine arasındaki tampondur. Sentinel (None) tüketiciye "akış bitti" der; o olmasa tüketici sonsuza kadar get() üzerinde bekler.'})

# Rehberli
ex.append({'t': 'code', 'id': 'akis-isleme-1', 'stage': 'Rehberli', 'diff': 1,
    'q': '<p>Kafka topic\'inin bellek içi benzetimini yaz. <code>Konu(n)</code> sınıfı <code>n</code> partition\'lı olsun:</p><ul><li><code>yaz(anahtar, deger)</code>: partition <code>anahtar % n</code>; değeri o partition\'ın sonuna ekler ve <code>(partition, offset)</code> döndürür.</li><li><code>oku(p, offset, maks)</code>: <code>p</code> partition\'ında <code>offset</code>\'ten başlayarak en çok <code>maks</code> mesajı <code>(offset, deger)</code> listesi olarak döndürür.</li><li><code>son_offset(p)</code>: partition\'a yazılacak <b>sıradaki</b> offset (yani uzunluk).</li></ul>',
    'guide': ['<code>__init__</code>\'te <code>n</code> boş listeden oluşan <code>self.partitionlar</code> kur.', '<code>yaz</code>: partition numarasını bul, ekle; offset eklenen elemanın indeksidir.', '<code>oku</code>: dilimle (<code>[offset:offset + maks]</code>) ve <code>enumerate(..., start=offset)</code> ile offset\'leri üret.', '<code>son_offset</code>: <code>len(...)</code>.'],
    'example': C('''
# Benzer teknik: raflara dağıtılan paketler ve raf içi sıra numarası
raflar = [[], []]
for paket in [7, 4, 9]:
    raf = paket % 2
    raflar[raf].append(paket)
    print(paket, "-> raf", raf, "sıra", len(raflar[raf]) - 1)
print(list(enumerate(raflar[1][0:5], start=0)))
'''),
    'start': C(TX + '''

class Konu:
    def __init__(self, n):
        self.partitionlar = []      # TODO 1: n tane boş liste

    def yaz(self, anahtar, deger):
        # TODO 2: partition'ı bul, ekle, (partition, offset) döndür
        pass

    def oku(self, p, offset, maks):
        # TODO 3: (offset, deger) listesi
        return []

    def son_offset(self, p):
        return 0
'''),
    'sol': C(TX + '''

class Konu:
    def __init__(self, n):
        self.partitionlar = [[] for _ in range(n)]

    def yaz(self, anahtar, deger):
        p = anahtar % len(self.partitionlar)
        self.partitionlar[p].append(deger)
        return p, len(self.partitionlar[p]) - 1

    def oku(self, p, offset, maks):
        return list(enumerate(self.partitionlar[p][offset:offset + maks], start=offset))

    def son_offset(self, p):
        return len(self.partitionlar[p])


konu = Konu(3)
for t in txns[:1000]:
    konu.yaz(t["account_id"], t["txn_id"])
print([konu.son_offset(p) for p in range(3)])
print(konu.oku(1, 0, 3))
'''),
    'tests': 'konu = Konu(3)\nr = [konu.yaz(t["account_id"], t["txn_id"]) for t in txns[:1000]]\nassert r[0] == (txns[0]["account_id"] % 3, 0), "İlk mesaj kendi partition\\\'ında offset 0 almalı; gelen " + str(r[0])\nassert [konu.son_offset(p) for p in range(3)] == [342, 315, 343], "İlk 1000 işlem partition\\\'lara 342, 315, 343 dağılmalı"\nassert konu.oku(1, 0, 3) == [(0, 3), (1, 7), (2, 11)], "Partition 1\\\'in ilk üç mesajı (offset, txn_id): (0,3), (1,7), (2,11)"\nassert konu.oku(1, 314, 10) == [(314, konu.partitionlar[1][314])], "Sona yakın okuma yalnız kalan mesajları vermeli"\nassert konu.oku(2, 343, 5) == [], "Son offset\\\'ten okuma boş liste dönmeli"\nk2 = Konu(2)\nassert k2.yaz(7, "a") == (1, 0) and k2.yaz(9, "b") == (1, 1) and k2.yaz(4, "c") == (0, 0), "Offset partition başına ayrı artmalı"\n',
    'hints': ['Liste üreteci: <code>[[] for _ in range(n)]</code>.', 'Eklemeden sonra offset <code>len(liste) - 1</code>\'dir.', '<code>enumerate(dilim, start=offset)</code> doğru offset numaralarını verir.'],
    'why': 'Kafka\'nın kalbi bu kadar basit bir veri yapısıdır: yalnız sona eklenen liste ve onun indeksleri. Okumak hiçbir şeyi silmez; bu yüzden aynı log\'u farklı gruplar farklı hızlarda okuyabilir.'})

ex.append({'t': 'code', 'id': 'akis-isleme-2', 'stage': 'Rehberli', 'diff': 1,
    'q': '<p>Dakikalık tumbling pencere. <code>dakika_sayaci(olaylar)</code>: olay sözlüklerinin <code>txn_time</code> alanından (<code>"2024-03-15 10:07:42"</code>) dakika anahtarını (<code>"2024-03-15 10:07"</code>) çıkar ve <code>{dakika: adet}</code> sözlüğü döndür. Sonra <code>yogun_dakikalar(sayac, esik)</code>: adedi <code>esik</code> ve üstünde olan dakikaları sıralı liste olarak döndür.</p><p>15 Mart 2024\'teki işlemlerle test edilecek.</p>',
    'guide': ['Boş sözlük kur; her olayın <code>txn_time[:16]</code> dilimini anahtar yap.', 'Sayacı <code>get(k, 0) + 1</code> ile artır.', '<code>yogun_dakikalar</code>: liste üreteciyle süz ve <code>sorted</code> ile sırala.'],
    'example': C('''
saatler = ["09:15:20", "09:15:59", "09:16:01"]
sayac = {}
for s in saatler:
    anahtar = s[:5]                  # "09:15"
    sayac[anahtar] = sayac.get(anahtar, 0) + 1
print(sayac, sorted(k for k, v in sayac.items() if v >= 2))
'''),
    'start': C(TX + '''
gun = [t for t in txns if t["txn_time"].startswith("2024-03-15")]


def dakika_sayaci(olaylar):
    sayac = {}
    for o in olaylar:
        pass  # TODO: dakika anahtarını çıkar ve say
    return sayac


def yogun_dakikalar(sayac, esik):
    return []  # TODO
'''),
    'sol': C(TX + '''
gun = [t for t in txns if t["txn_time"].startswith("2024-03-15")]


def dakika_sayaci(olaylar):
    sayac = {}
    for o in olaylar:
        k = o["txn_time"][:16]
        sayac[k] = sayac.get(k, 0) + 1
    return sayac


def yogun_dakikalar(sayac, esik):
    return sorted(k for k, v in sayac.items() if v >= esik)


s = dakika_sayaci(gun)
print(len(gun), len(s), yogun_dakikalar(s, 3))
'''),
    'tests': 's = dakika_sayaci(gun)\nassert len(gun) == 151 and len(s) == 141, "15 Mart\\\'ta 151 işlem 141 farklı dakikaya düşmeli; gelen " + str(len(s))\nassert sum(s.values()) == 151, "Sayaç toplamı işlem sayısına eşit olmalı"\nassert yogun_dakikalar(s, 3) == ["2024-03-15 11:56"], "3 ve üstü işlem yalnız 11:56\\\'da var"\nassert len(yogun_dakikalar(s, 2)) == 9, "2 ve üstü işlem olan 9 dakika olmalı"\nassert dakika_sayaci([{"txn_time": "2024-01-01 10:00:59"}, {"txn_time": "2024-01-01 10:01:00"}]) == {"2024-01-01 10:00": 1, "2024-01-01 10:01": 1}, "Dakika sınırı: 10:00:59 ve 10:01:00 farklı pencerelerdir"\n',
    'hints': ['ISO tarih metninde ilk 16 karakter dakikaya kadar olan kısımdır.', '<code>sorted(k for k, v in sayac.items() if v &gt;= esik)</code>'],
    'why': 'Tumbling pencerede pencere anahtarı, olay zamanının pencere boyutuna aşağı yuvarlanmış hâlidir. Dakika için metin dilimi, genel boyut için <code>epoch // boyut * boyut</code> kullanılır. 151 işlem 141 dolu dakikaya yayılmış; yoğun dakikalar maaş ve fatura talimatlarının toplu çalıştığı anlardır.'})

ex.append({'t': 'code', 'id': 'akis-isleme-3', 'stage': 'Rehberli', 'diff': 2,
    'q': '<p>En az bir kez teslimatta aynı mesaj birden çok kez gelebilir. <code>idempotent_bakiye(teslimatlar)</code>: mesajları sırayla işle, <code>txn_id</code>\'si daha önce görülen mesajı atla; hesap başına <code>amount</code> toplamını (2 basamak) içeren sözlük ve atlanan mesaj sayısını <code>(bakiye, atlanan)</code> olarak döndür.</p><p>Test, Ocak 2024 işlemlerini her 7. mesaj tekrar edilmiş biçimde gönderecek.</p>',
    'guide': ['Görülen kimlikler için bir <code>set</code>, bakiyeler için bir sözlük, atlananlar için sayaç tut.', 'Kimlik kümede varsa atlananı artır ve <code>continue</code>.', 'Yoksa kümeye ekle ve hesabın toplamına tutarı ekle.', 'Sonda her toplamı <code>round(..., 2)</code> ile yuvarla.'],
    'example': C('''
olaylar = [{"id": "a", "puan": 5}, {"id": "b", "puan": 3}, {"id": "a", "puan": 5}]
gorulen, toplam = set(), 0
for o in olaylar:
    if o["id"] in gorulen:
        continue
    gorulen.add(o["id"])
    toplam += o["puan"]
print(toplam)
'''),
    'start': C(TX + '''
ocak = [t for t in txns if t["txn_time"].startswith("2024-01")]
teslimatlar = []
for i, t in enumerate(ocak):
    teslimatlar.append(t)
    if i % 7 == 0:
        teslimatlar.append(t)          # ağ hatası: tekrar teslim


def idempotent_bakiye(teslimatlar):
    gorulen = set()
    bakiye = {}
    atlanan = 0
    for t in teslimatlar:
        # TODO 1: daha önce görüldüyse atla ve say
        # TODO 2: hesabın toplamına ekle
        pass
    return {h: round(v, 2) for h, v in bakiye.items()}, atlanan
'''),
    'sol': C(TX + '''
ocak = [t for t in txns if t["txn_time"].startswith("2024-01")]
teslimatlar = []
for i, t in enumerate(ocak):
    teslimatlar.append(t)
    if i % 7 == 0:
        teslimatlar.append(t)


def idempotent_bakiye(teslimatlar):
    gorulen = set()
    bakiye = {}
    atlanan = 0
    for t in teslimatlar:
        if t["txn_id"] in gorulen:
            atlanan += 1
            continue
        gorulen.add(t["txn_id"])
        bakiye[t["account_id"]] = bakiye.get(t["account_id"], 0) + t["amount"]
    return {h: round(v, 2) for h, v in bakiye.items()}, atlanan


b, atlanan = idempotent_bakiye(teslimatlar)
print(len(teslimatlar), atlanan, len(b), round(sum(b.values()), 2))
'''),
    'tests': 'b, atlanan = idempotent_bakiye(teslimatlar)\nassert len(teslimatlar) == 3837 and atlanan == 480, "3837 teslimattan 480\\\'i tekrar olarak atlanmalı; gelen " + str(atlanan)\nassert len(b) == 709, "Ocak\\\'ta işlem yapan 709 hesap olmalı"\nassert round(sum(b.values()), 2) == 8711801.34, "Toplam, tekrarsız Ocak toplamına (8711801.34) eşit olmalı"\ntek, _ = idempotent_bakiye(ocak)\nassert b == tek, "Tekrarlı ve tekrarsız teslimat aynı sonucu vermeli (idempotentlik)"\nassert idempotent_bakiye([]) == ({}, 0), "Boş girdide ({}, 0)"\n',
    'hints': ['Benzersizlik için <code>set</code> ve <code>in</code>.', 'Atla: <code>if t["txn_id"] in gorulen: atlanan += 1; continue</code>', 'Ekle: <code>bakiye[h] = bakiye.get(h, 0) + t["amount"]</code>'],
    'why': 'Tekrar edilen 480 mesaj atlandı ve Ocak toplamı tekrarsız sonuçla birebir aynı çıktı. Üretimde "görülen kimlikler" kümesi bellekte değil, hedef tablonun birincil anahtarında (<code>ON CONFLICT DO NOTHING</code>) ya da süreli bir Redis kümesinde tutulur.'})

ex.append({'t': 'code', 'id': 'akis-isleme-4', 'stage': 'Rehberli', 'diff': 2,
    'q': '<p>Bir üretici ve <code>n_tuketici</code> tüketiciyle <code>asyncio.Queue</code> hattı kur. <code>kanal_say(olaylar, n_tuketici)</code> fonksiyonu:</p><ul><li><code>maxsize=20</code> olan bir kuyruk açar,</li><li>üretici bütün olayları kuyruğa koyar, sonra her tüketici için bir <code>None</code> gönderir,</li><li>her tüketici <code>None</code> görene kadar olayları alır ve ortak sözlükte <code>channel</code> başına sayar,</li><li>sonunda <code>{channel: adet}</code> sözlüğünü döndürür (olay döngüsünü fonksiyon içinde <code>asyncio.new_event_loop()</code> ile kur, işin bitince kapat).</li></ul>',
    'guide': ['<code>async def uretici(q)</code>: <code>await q.put(o)</code> döngüsü, sonra <code>n_tuketici</code> kez <code>await q.put(None)</code>.', '<code>async def tuketici(q)</code>: <code>while (o := await q.get()) is not None:</code> ile ortak sözlüğü güncelle.', '<code>async def main()</code>: kuyruğu kur, <code>asyncio.gather</code> ile üreticiyi ve tüketicileri birlikte bekle.', '<code>loop = asyncio.new_event_loop()</code>, <code>loop.run_until_complete(main())</code>, <code>loop.close()</code>.'],
    'example': C('''
import asyncio

async def main():
    q = asyncio.Queue(maxsize=2)
    toplam = []
    async def uret():
        for x in [3, 4, 5]:
            await q.put(x)
        await q.put(None)
    async def tuket():
        while (x := await q.get()) is not None:
            toplam.append(x * 2)
    await asyncio.gather(uret(), tuket())
    return toplam

loop = asyncio.new_event_loop()
print(loop.run_until_complete(main()))
loop.close()
'''),
    'start': C(TX + '''
import asyncio

ocak = [t for t in txns if t["txn_time"].startswith("2024-01")]


def kanal_say(olaylar, n_tuketici):
    sayac = {}

    async def uretici(q):
        pass  # TODO 1: olayları ve n_tuketici kadar None gönder

    async def tuketici(q):
        pass  # TODO 2: None gelene kadar channel say

    async def main():
        q = asyncio.Queue(maxsize=20)
        # TODO 3: gather ile hepsini çalıştır

    loop = asyncio.new_event_loop()
    loop.run_until_complete(main())
    loop.close()
    return sayac
'''),
    'sol': C(TX + '''
import asyncio

ocak = [t for t in txns if t["txn_time"].startswith("2024-01")]


def kanal_say(olaylar, n_tuketici):
    sayac = {}

    async def uretici(q):
        for o in olaylar:
            await q.put(o)
        for _ in range(n_tuketici):
            await q.put(None)

    async def tuketici(q):
        while (o := await q.get()) is not None:
            sayac[o["channel"]] = sayac.get(o["channel"], 0) + 1

    async def main():
        q = asyncio.Queue(maxsize=20)
        await asyncio.gather(uretici(q), *(tuketici(q) for _ in range(n_tuketici)))

    loop = asyncio.new_event_loop()
    loop.run_until_complete(main())
    loop.close()
    return sayac


print(sorted(kanal_say(ocak, 3).items()))
'''),
    'tests': 'beklenen = {"atm": 243, "internet": 1195, "mobil": 966, "pos": 756, "sistem": 99, "sube": 98}\nassert kanal_say(ocak, 3) == beklenen, "Ocak kanal sayıları tutmuyor: " + str(kanal_say(ocak, 3))\nassert kanal_say(ocak, 1) == beklenen and kanal_say(ocak, 5) == beklenen, "Sonuç tüketici sayısından bağımsız olmalı (her tüketiciye bir None)"\nassert kanal_say([], 2) == {}, "Boş akışta boş sözlük; program takılmamalı"\n',
    'hints': ['Her tüketiciye bir sentinel gerekir; tek <code>None</code> yalnız bir tüketiciyi durdurur.', '<code>await asyncio.gather(uretici(q), *(tuketici(q) for _ in range(n_tuketici)))</code>', 'Walrus kalıbı: <code>while (o := await q.get()) is not None:</code>'],
    'why': '<code>maxsize</code> geri basınç sağlar: tüketiciler yavaşsa üretici <code>put</code>\'ta bekler, bellek şişmez. Kafka\'da bu rolü tüketicinin kendi hızında <code>poll</code> etmesi üstlenir. Tüketici sayısı ne olursa olsun sayım aynı çıkmalı: sonuç işçi sayısından bağımsızdır.'})

# Kendin yaz
ex.append({'t': 'code', 'id': 'akis-isleme-5', 'stage': 'Kendin yaz', 'diff': 2,
    'q': '<p>Kafka\'nın <b>RangeAssignor</b> stratejisini yaz. <code>range_ata(n_partition, tuketiciler)</code>: tüketici adlarını alfabetik sırala; her tüketiciye ardışık bir partition aralığı ver. Partition sayısı tüketici sayısına tam bölünmüyorsa <b>ilk</b> <code>n_partition % len(tuketiciler)</code> tüketici birer fazla partition alır. Dönüş: <code>{tuketici: [partition numaraları]}</code>; partition alamayan tüketicinin listesi boş olur.</p>',
    'start': C('''
def range_ata(n_partition, tuketiciler):
    pass
'''),
    'sol': C('''
def range_ata(n_partition, tuketiciler):
    sirali = sorted(tuketiciler)
    taban, fazla = divmod(n_partition, len(sirali))
    atama, bas = {}, 0
    for i, t in enumerate(sirali):
        adet = taban + (1 if i < fazla else 0)
        atama[t] = list(range(bas, bas + adet))
        bas += adet
    return atama


print(range_ata(7, ["c2", "c1", "c3"]))
'''),
    'tests': C('''
assert range_ata(6, ["b", "a", "c"]) == {"a": [0, 1], "b": [2, 3], "c": [4, 5]}, "6 partition 3 tüketiciye ikişer dağılmalı"
assert range_ata(7, ["c2", "c1", "c3"]) == {"c1": [0, 1, 2], "c2": [3, 4], "c3": [5, 6]}, "Artan partition ilk tüketiciye gitmeli"
r = range_ata(4, ["t1", "t2", "t3", "t4", "t5", "t6"])
assert r["t5"] == [] and r["t6"] == [], "Partition\\'dan fazla tüketici varsa son tüketiciler boşta kalmalı"
assert sorted(p for v in r.values() for p in v) == [0, 1, 2, 3], "Her partition tam bir kez atanmalı"
assert range_ata(1, ["x"]) == {"x": [0]}, "Tek tüketici tek partition"
'''),
    'hints': ['<code>divmod(n_partition, len(tuketiciler))</code> taban adedi ve artanı verir.', 'Bir başlangıç işaretçisi tut; her tüketiciye <code>range(bas, bas + adet)</code> ver ve işaretçiyi ilerlet.'],
    'why': 'Bu, tüketici grubundaki rebalance\'ın çıktısıdır. Partition\'dan fazla tüketici boşta kalır; bu yüzden paralellik planı partition sayısıyla yapılır. Kafka\'da RoundRobin ve CooperativeSticky gibi başka atama stratejileri de vardır; sticky olan, rebalance\'ta en az partition\'ı taşır.'})

ex.append({'t': 'code', 'id': 'akis-isleme-6', 'stage': 'Kendin yaz', 'diff': 2,
    'q': '<p>Kayan (hopping) pencere. <code>kayan_pencere(dakikalar, boyut, adim)</code>: <code>dakikalar</code> gün başından itibaren dakika cinsinden olay zamanlarıdır (ör. 10:07 → 607). Pencere başlangıçları <code>adim</code>\'ın katlarıdır ve her pencere <code>[bas, bas + boyut)</code> aralığını kapsar; bir olay birden çok pencereye düşebilir. Yalnız en az bir olayı olan pencereleri <code>(bas, adet)</code> listesi olarak, başlangıca göre sıralı döndür. <code>boyut</code>, <code>adim</code>\'ın tam katıdır.</p><p>Test: 15 Mart 2024 işlemleri, 60 dakikalık pencere, 30 dakikalık adım.</p>',
    'start': C(TX + '''
gun = [t for t in txns if t["txn_time"].startswith("2024-03-15")]
dakikalar = [int(t["txn_time"][11:13]) * 60 + int(t["txn_time"][14:16]) for t in gun]


def kayan_pencere(dakikalar, boyut, adim):
    pass
'''),
    'sol': C(TX + '''
gun = [t for t in txns if t["txn_time"].startswith("2024-03-15")]
dakikalar = [int(t["txn_time"][11:13]) * 60 + int(t["txn_time"][14:16]) for t in gun]


def kayan_pencere(dakikalar, boyut, adim):
    sayac = {}
    for d in dakikalar:
        son_bas = d // adim * adim
        for bas in range(son_bas, son_bas - boyut, -adim):
            if bas >= 0:
                sayac[bas] = sayac.get(bas, 0) + 1
    return sorted(sayac.items())


r = kayan_pencere(dakikalar, 60, 30)
print(len(r), r[:3], max(r, key=lambda x: x[1]))
'''),
    'tests': 'r = kayan_pencere(dakikalar, 60, 30)\nassert len(r) == 35, "60/30 kayan pencerede 35 dolu pencere olmalı; gelen " + str(len(r))\nassert r[:3] == [(150, 1), (180, 1), (450, 6)], "İlk pencereler (150,1), (180,1), (450,6) olmalı; gelen " + str(r[:3])\nassert sum(n for _, n in r) == 302, "Her olay 2 pencereye düşer: toplam 2 x 151 = 302"\nassert max(r, key=lambda x: x[1]) == (690, 16), "En yoğun pencere 11:30-12:30 (690) ve 16 işlem olmalı"\nassert kayan_pencere([0, 59, 60], 60, 30) == [(0, 2), (30, 2), (60, 1)], "Küçük örnek: 0 ve 59 [0,60) penceresinde; 59 ve 60 [30,90) penceresinde; 60 [60,120) penceresinde"\n',
    'hints': ['Bir olayın düştüğü en son pencere <code>d // adim * adim</code>\'da başlar.', 'Geriye doğru <code>adim</code> adımlarla <code>boyut / adim</code> pencere say: <code>range(son_bas, son_bas - boyut, -adim)</code>.', 'Negatif başlangıçlı pencereleri atla.'],
    'why': 'Her olay boyut/adım = 2 pencereye sayıldığı için pencere toplamları olay sayısının iki katıdır. Kayan pencere ani sıçramaları yumuşatır: "son 1 saatte, yarım saatte bir güncellenen işlem sayısı" gibi panolarda kullanılır.'})

ex.append({'t': 'code', 'id': 'akis-isleme-7', 'stage': 'Kendin yaz', 'diff': 2,
    'q': '<p>Oturum (session) penceresi. <code>oturumlar(zamanlar, bosluk_dk)</code>: sıralı <code>"YYYY-MM-DD HH:MM:SS"</code> metinlerinden oluşan listeyi oturumlara ayır. Ardışık iki olay arasındaki fark <code>bosluk_dk</code> dakikadan <b>büyükse</b> yeni oturum başlar. Dönüş: <code>(baslangic, bitis, adet)</code> demetlerinin listesi.</p><p>Test, en çok işlemi olan hesabın (100583) işlemlerini kullanacak.</p>',
    'start': C(TX + '''
from datetime import datetime

zamanlar = [t["txn_time"] for t in txns if t["account_id"] == 100583]


def oturumlar(zamanlar, bosluk_dk):
    pass
'''),
    'sol': C(TX + '''
from datetime import datetime

zamanlar = [t["txn_time"] for t in txns if t["account_id"] == 100583]


def oturumlar(zamanlar, bosluk_dk):
    sonuc = []
    for z in zamanlar:
        an = datetime.strptime(z, "%Y-%m-%d %H:%M:%S")
        if sonuc and (an - sonuc[-1][3]).total_seconds() <= bosluk_dk * 60:
            bas, _, adet, _ = sonuc[-1]
            sonuc[-1] = (bas, z, adet + 1, an)
        else:
            sonuc.append((z, z, 1, an))
    return [(b, e, n) for b, e, n, _ in sonuc]


o = oturumlar(zamanlar, 360)
print(len(zamanlar), len(o), max(o, key=lambda x: x[2]))
'''),
    'tests': 'o = oturumlar(zamanlar, 360)\nassert len(zamanlar) == 112 and len(o) == 105, "100583 hesabının 112 işlemi 6 saatlik boşlukla 105 oturuma ayrılmalı; gelen " + str(len(o))\nassert ("2024-02-13 16:06:22", "2024-02-13 23:21:14", 3) in o, "13 Şubat\\\'taki üç işlem tek oturum olmalı"\nassert sum(n for _, _, n in o) == 112, "Oturum adetleri toplamı işlem sayısına eşit olmalı"\nk = ["2024-01-01 10:00:00", "2024-01-01 10:30:00", "2024-01-01 11:30:01"]\nassert oturumlar(k, 30) == [("2024-01-01 10:00:00", "2024-01-01 10:30:00", 2), ("2024-01-01 11:30:01", "2024-01-01 11:30:01", 1)], "Tam 30 dakika fark aynı oturumdur; 60 dakikadan fazla fark yeni oturumdur"\nassert oturumlar([], 10) == [], "Boş listede boş sonuç"\n',
    'hints': ['Metni <code>datetime.strptime(z, "%Y-%m-%d %H:%M:%S")</code> ile çevir; farkın <code>total_seconds()</code>\'ını kullan.', 'Son oturumun bitişini tut; yeni olay yakınsa oturumu uzat, değilse yeni oturum aç.', 'Eşik "büyükse yeni oturum": tam <code>bosluk_dk</code> dakika fark aynı oturumdur.'],
    'why': 'Oturum pencereleri anahtar başına (hesap, kullanıcı) tutulur ve boyutları veriye göre değişir. Flink ve Spark Structured Streaming\'de <code>session_window(zaman, "6 hours")</code> ile tanımlanır; sırasız gelen bir olay iki oturumu birleştirebildiği için durum yönetimi tumbling\'e göre zordur.'})

ex.append({'t': 'code', 'id': 'akis-isleme-8', 'stage': 'Kendin yaz', 'diff': 2,
    'q': '<p>Şema kayıt defterinin <b>geriye uyumluluk</b> denetimini yaz. Şemalar <code>{alan: {"tip": ..., "varsayilan": ...}}</code> sözlükleridir (<code>varsayilan</code> anahtarı olmayabilir). <code>geriye_uyumlu(eski, yeni)</code> yeni şemanın eski veriyi okuyabilmesi için şunları denetlesin ve <code>(uyumlu_mu, sorunlar)</code> döndürsün:</p><ul><li>Yeni şemada olup eskide olmayan alanın <code>varsayilan</code> anahtarı olmalı; yoksa sorun: <code>"ekle:ALAN"</code>.</li><li>İki şemada da olan alanın tipi değişmişse sorun: <code>"tip:ALAN"</code>. İstisna: <code>int</code> → <code>long</code> ve <code>float</code> → <code>double</code> genişletmeleri uyumludur.</li><li>Eski şemadan silinen alan sorun değildir.</li></ul><p><code>sorunlar</code> alfabetik sıralı liste olsun.</p>',
    'start': C('''
def geriye_uyumlu(eski, yeni):
    pass
'''),
    'sol': C('''
GENISLEME = {("int", "long"), ("float", "double")}


def geriye_uyumlu(eski, yeni):
    sorunlar = []
    for alan, tanim in yeni.items():
        if alan not in eski:
            if "varsayilan" not in tanim:
                sorunlar.append("ekle:" + alan)
        elif eski[alan]["tip"] != tanim["tip"] and (eski[alan]["tip"], tanim["tip"]) not in GENISLEME:
            sorunlar.append("tip:" + alan)
    sorunlar.sort()
    return not sorunlar, sorunlar


v1 = {"txn_id": {"tip": "long"}, "amount": {"tip": "float"}, "channel": {"tip": "string"}}
v2 = {"txn_id": {"tip": "long"}, "amount": {"tip": "double"}, "risk": {"tip": "double", "varsayilan": None}}
print(geriye_uyumlu(v1, v2))
'''),
    'tests': C('''
v1 = {"txn_id": {"tip": "long"}, "amount": {"tip": "float"}, "channel": {"tip": "string"}}
v2 = {"txn_id": {"tip": "long"}, "amount": {"tip": "double"}, "risk": {"tip": "double", "varsayilan": None}}
assert geriye_uyumlu(v1, v2) == (True, []), "float->double genişlemesi ve varsayılanlı yeni alan uyumludur; silinen alan sorun değildir"
v3 = {"txn_id": {"tip": "string"}, "amount": {"tip": "float"}, "sube": {"tip": "int"}}
assert geriye_uyumlu(v1, v3) == (False, ["ekle:sube", "tip:txn_id"]), "Varsayılansız yeni alan ve long->string değişimi sorundur; liste sıralı olmalı"
assert geriye_uyumlu({"a": {"tip": "long"}}, {"a": {"tip": "int"}}) == (False, ["tip:a"]), "long->int daraltmadır, uyumsuzdur"
assert geriye_uyumlu({}, {"x": {"tip": "int", "varsayilan": 0}}) == (True, []), "Varsayılan 0 olsa da (falsy) anahtar var: uyumlu"
'''),
    'hints': ['Yeni şemanın alanlarını gez; iki durum var: alan eskide yok ya da var.', 'Varsayılanı <code>"varsayilan" in tanim</code> ile denetle; değeri None ya da 0 olabilir.', 'İzinli genişlemeleri bir küme demetinde tut: <code>{("int", "long"), ("float", "double")}</code>.'],
    'why': 'Confluent Schema Registry\'nin BACKWARD uyumluluk kuralı budur: yeni tüketici eski mesajları okuyabilmeli. Varsayılanı olmayan yeni alan eski mesajlarda bulunmadığı için okuma başarısız olur. FORWARD ve FULL modları ters yönü de denetler.'})

# Hata avı
ex.append({'t': 'code', 'id': 'akis-isleme-9', 'stage': 'Hata avı', 'diff': 2, 'kind': 'bug',
    'q': '<p>Dolandırıcılık tüketicisi çöküp yeniden başladıktan sonra bazı işlemlerin <b>hiç</b> incelenmediği fark edildi. <code>tuket(log, durum, islenen, coku_offset)</code> commit edilen offset\'ten okumaya başlıyor; <code>coku_offset</code> verilirse o mesajı işlerken çöküyor (<code>Coktu</code> fırlatıyor). <b>Hatayı bul ve düzelt</b>: çökme ve yeniden başlatma sonrasında hiçbir mesaj kaybolmamalı (en az bir kez).</p>',
    'start': C(TX + '''


class Coktu(Exception):
    pass


def tuket(log, durum, islenen, coku_offset=None):
    offset = durum.get("offset", 0)
    while offset < len(log):
        durum["offset"] = offset + 1            # commit
        if offset == coku_offset:
            raise Coktu(offset)
        islenen.append(log[offset]["txn_id"])   # işle
        offset += 1


log = txns[:50]
durum, islenen = {}, []
try:
    tuket(log, durum, islenen, coku_offset=20)
except Coktu:
    print("çöktü, yeniden başlatılıyor")
tuket(log, durum, islenen)
print(len(islenen), "işlendi")
'''),
    'sol': C(TX + '''


class Coktu(Exception):
    pass


def tuket(log, durum, islenen, coku_offset=None):
    offset = durum.get("offset", 0)
    while offset < len(log):
        if offset == coku_offset:
            raise Coktu(offset)
        islenen.append(log[offset]["txn_id"])   # önce işle
        durum["offset"] = offset + 1            # sonra commit
        offset += 1


log = txns[:50]
durum, islenen = {}, []
try:
    tuket(log, durum, islenen, coku_offset=20)
except Coktu:
    print("çöktü, yeniden başlatılıyor")
tuket(log, durum, islenen)
print(len(islenen), "işlendi")
'''),
    'tests': C('''
log = txns[:50]
durum, islenen = {}, []
try:
    tuket(log, durum, islenen, coku_offset=20)
except Coktu:
    pass
assert durum["offset"] == 20, "Çökmeden sonra commit edilen offset 20 olmalı (20. mesaj işlenmedi); gelen " + str(durum["offset"])
tuket(log, durum, islenen)
assert islenen == [t["txn_id"] for t in log], "Yeniden başlatınca 50 mesajın hepsi sırayla işlenmiş olmalı; kayıp: " + str(sorted(set(t["txn_id"] for t in log) - set(islenen)))
assert durum["offset"] == 50, "Sonunda offset 50 olmalı"
'''),
    'hints': ['Commit satırı nerede? Çökme commit ile işleme arasında olursa ne olur?', 'Sırayı değiştir: önce <code>islenen.append</code>, sonra <code>durum["offset"] = offset + 1</code>.'],
    'why': 'Önce commit sonra işleme "en çok bir kez" teslimattır: çökme anındaki mesaj kaybolur (txn_id 21 hiç incelenmezdi). Önce işleyip sonra commit etmek "en az bir kez"dir: çökme işleme ile commit arasında olursa mesaj tekrar gelir, bunu da idempotent tüketici karşılar. Dolandırıcılıkta kayıp, tekrardan çok daha pahalıdır.'})

ex.append({'t': 'code', 'id': 'akis-isleme-10', 'stage': 'Hata avı', 'diff': 2, 'kind': 'bug',
    'q': '<p>Mobil uygulama işlemleri gecikmeyle gönderiyor; her mesajda olay zamanı (<code>txn_time</code>) ve kuyruğa ulaşma zamanı (<code>alinma</code>) var. Dakikalık işlem panosu, muhasebenin olay zamanına göre yaptığı sayımla tutmuyor. <b>Hatayı bul ve düzelt</b>: <code>dakikalik_pano(mesajlar)</code> olay zamanına göre <code>{dakika: adet}</code> üretmeli.</p>',
    'start': C(TX + '''
from datetime import datetime, timedelta

gun = [t for t in txns if t["txn_time"].startswith("2024-03-15")]
mesajlar = []
for t in gun:
    gecikme = timedelta(seconds=(t["txn_id"] % 5) * 25)
    alinma = datetime.strptime(t["txn_time"], "%Y-%m-%d %H:%M:%S") + gecikme
    mesajlar.append({**t, "alinma": alinma.strftime("%Y-%m-%d %H:%M:%S")})


def dakikalik_pano(mesajlar):
    pano = {}
    for m in mesajlar:
        dakika = m["alinma"][:16]
        pano[dakika] = pano.get(dakika, 0) + 1
    return pano


print(len(dakikalik_pano(mesajlar)))
'''),
    'sol': C(TX + '''
from datetime import datetime, timedelta

gun = [t for t in txns if t["txn_time"].startswith("2024-03-15")]
mesajlar = []
for t in gun:
    gecikme = timedelta(seconds=(t["txn_id"] % 5) * 25)
    alinma = datetime.strptime(t["txn_time"], "%Y-%m-%d %H:%M:%S") + gecikme
    mesajlar.append({**t, "alinma": alinma.strftime("%Y-%m-%d %H:%M:%S")})


def dakikalik_pano(mesajlar):
    pano = {}
    for m in mesajlar:
        dakika = m["txn_time"][:16]
        pano[dakika] = pano.get(dakika, 0) + 1
    return pano


print(len(dakikalik_pano(mesajlar)))
'''),
    'tests': 'p = dakikalik_pano(mesajlar)\nfrom collections import Counter\nassert p == dict(Counter(t["txn_time"][:16] for t in gun)), "Pano olay zamanına (txn_time) göre sayılmalı"\nassert len(p) == 141, "Olay zamanına göre 141 dolu dakika olmalı; işlem zamanıyla 144 çıkar. Gelen " + str(len(p))\nassert p["2024-03-15 11:56"] == 3, "11:56\\\'da 3 işlem olmalı"\n',
    'hints': ['Hangi saat iş ölçüsüdür: işlemin olduğu an mı, mesajın geldiği an mı?', 'Pencere anahtarını <code>txn_time</code>\'dan üret.'],
    'why': 'İşlem zamanına göre pencereleme, gecikmeli olayları yanlış dakikaya yazar ve sonuç ağın o anki hızına bağlı olur: aynı veriyi yeniden işlediğinde farklı sayılar çıkar. Olay zamanı belirleyicidir (deterministik); gecikmeyi yönetmek watermark\'ın işidir.'})

# Meydan okuma
ex.append({'t': 'code', 'id': 'akis-isleme-11', 'stage': 'Meydan okuma', 'diff': 3,
    'q': '<p>Watermark ile pencere kapatma. <code>pencere_isle(olaylar, boyut, gecikme)</code>: <code>olaylar</code> geliş sırasına göre <b>olay zamanı</b> tamsayılarıdır (saniye). Kurallar:</p><ul><li>Pencere başlangıcı <code>z // boyut * boyut</code>; pencere <code>[bas, bas + boyut)</code>.</li><li>Her olaydan sonra watermark = şimdiye kadarki en büyük olay zamanı − <code>gecikme</code>.</li><li>Olay geldiğinde, penceresinin bitişi (<code>bas + boyut</code>) o ana kadarki watermark\'tan küçük ya da eşitse pencere kapanmış sayılır: olay <b>geç</b>tir, <code>gec</code> listesine eklenir ve sayılmaz. (İlk olaydan önce watermark yoktur.)</li><li>Olay işlendikten sonra, bitişi (<code>bas + boyut</code>) watermark\'tan küçük ya da eşit olan bütün açık pencereler başlangıca göre sırayla yayınlanır: <code>(bas, adet)</code>.</li><li>Akış bitince açık kalan pencereler başlangıca göre sırayla yayınlanır.</li></ul><p>Dönüş: <code>(yayinlanan, gec)</code>.</p>',
    'start': C('''
def pencere_isle(olaylar, boyut, gecikme):
    pass
'''),
    'sol': C('''
def pencere_isle(olaylar, boyut, gecikme):
    acik, yayinlanan, gec = {}, [], []
    watermark = None
    for z in olaylar:
        bas = z // boyut * boyut
        if watermark is not None and bas + boyut <= watermark:
            gec.append(z)
            continue
        acik[bas] = acik.get(bas, 0) + 1
        watermark = z - gecikme if watermark is None else max(watermark, z - gecikme)
        for b in sorted(acik):
            if b + boyut <= watermark:
                yayinlanan.append((b, acik.pop(b)))
    for b in sorted(acik):
        yayinlanan.append((b, acik[b]))
    return yayinlanan, gec


print(pencere_isle([5, 40, 70, 50, 130, 59, 61, 200], 60, 30))
'''),
    'tests': C('''
y, g = pencere_isle([5, 40, 70, 50, 130, 59, 61, 200], 60, 30)
assert y == [(0, 3), (60, 2), (120, 1), (180, 1)], "Yayın sırası/adetleri tutmuyor; gelen " + str(y)
assert g == [59], "130 görüldükten sonra watermark 100 olur, 0-60 penceresi kapanır; 59 geç kalır. Gelen " + str(g)
y2, g2 = pencere_isle([10, 20, 30], 60, 0)
assert y2 == [(0, 3)] and g2 == [], "Watermark pencere sonuna ulaşmazsa pencere akış sonunda yayınlanmalı"
y3, g3 = pencere_isle([125, 5, 61], 60, 0)
assert y3 == [(120, 1)] and g3 == [5, 61], "İlk olaydan sonra watermark 125 olur; bitişi 60 ve 120 olan pencereler kapanmış sayılır, 5 ve 61 geçtir. Gelen " + str((y3, g3))
'''),
    'hints': ['Açık pencereler için sözlük, watermark için başta <code>None</code> olan bir değişken tut.', 'Önce geç mi diye bak (<code>bas + boyut &lt;= watermark</code>); değilse say, sonra watermark\'ı güncelle.', 'Her olaydan sonra <code>sorted(acik)</code> üzerinde bitişi watermark\'ı geçmiş pencereleri <code>pop</code> edip yayınla.'],
    'why': 'Bu, Flink ve Spark Structured Streaming\'in olay zamanı pencerelerinin özüdür. Gecikme toleransı (burada 30 sn) tamlık ile güncellik arasındaki takastır. Gerçek sistemler geç olayları atmak yerine yan çıkışa (side output) yazar ya da pencere sonucunu düzeltme olarak yeniden yayınlar.'})

ex.append({'t': 'code', 'id': 'akis-isleme-12', 'stage': 'Meydan okuma', 'diff': 3,
    'q': '<p>Debezium tarzı CDC olaylarını hedef tabloya uygula. Her olay: <code>{"op": "c"|"u"|"d", "lsn": int, "before": {...}|None, "after": {...}|None}</code>. Anahtar <code>account_id</code>. <code>cdc_uygula(olaylar)</code>:</p><ul><li>Olayları <code>lsn</code>\'ye göre sırala (geliş sırası karışık olabilir).</li><li>Aynı <code>lsn</code> birden çok kez gelmişse yalnız birini uygula (tekrar).</li><li><code>c</code> ve <code>u</code>: <code>after</code> satırını tabloya yaz (upsert). <code>d</code>: <code>before</code> satırının anahtarını tablodan sil.</li></ul><p>Dönüş: <code>{account_id: satir}</code>.</p>',
    'start': C('''
import veri

hesaplar = veri.kayitlar("ilgaz_bank", "bank_accounts")[:4]


def cdc_uygula(olaylar):
    pass
'''),
    'sol': C('''
import veri

hesaplar = veri.kayitlar("ilgaz_bank", "bank_accounts")[:4]


def cdc_uygula(olaylar):
    tablo, gorulen = {}, set()
    for o in sorted(olaylar, key=lambda x: x["lsn"]):
        if o["lsn"] in gorulen:
            continue
        gorulen.add(o["lsn"])
        if o["op"] in ("c", "u"):
            tablo[o["after"]["account_id"]] = o["after"]
        elif o["op"] == "d":
            tablo.pop(o["before"]["account_id"], None)
    return tablo


olaylar = [{"op": "c", "lsn": i + 1, "before": None, "after": h} for i, h in enumerate(hesaplar)]
print(sorted(cdc_uygula(olaylar)))
'''),
    'tests': C('''
h = hesaplar
olaylar = [{"op": "c", "lsn": i + 1, "before": None, "after": dict(x)} for i, x in enumerate(h)]
kapandi = {**h[0], "status": "kapali", "closed_date": "2024-06-30"}
limit = {**h[2], "credit_limit": 50000.0}
olaylar += [
    {"op": "u", "lsn": 7, "before": h[0], "after": kapandi},
    {"op": "d", "lsn": 6, "before": h[1], "after": None},
    {"op": "u", "lsn": 5, "before": h[2], "after": limit},
    {"op": "u", "lsn": 5, "before": h[2], "after": limit},
    {"op": "c", "lsn": 8, "before": None, "after": {**h[1], "status": "aktif"}},
]
olaylar = olaylar[3:] + olaylar[:3]
t = cdc_uygula(olaylar)
ids = [x["account_id"] for x in h]
assert sorted(t) == sorted(ids), "4 hesap da tabloda olmalı (silinen hesap lsn 8 ile yeniden açıldı); gelen " + str(sorted(t))
assert t[ids[0]]["status"] == "kapali", "lsn 7 güncellemesi uygulanmalı"
assert t[ids[2]]["credit_limit"] == 50000.0, "lsn 5 limit güncellemesi uygulanmalı"
assert t[ids[3]] == h[3], "Dokunulmayan satır aynı kalmalı"
t2 = cdc_uygula([{"op": "d", "lsn": 2, "before": h[0], "after": None}, {"op": "c", "lsn": 1, "before": None, "after": h[0]}])
assert t2 == {}, "Olaylar lsn sırasıyla uygulanmalı: önce oluştur (1), sonra sil (2)"
'''),
    'hints': ['<code>sorted(olaylar, key=lambda x: x["lsn"])</code> ve görülen lsn kümesi.', 'Silmede olmayan anahtar hata vermesin: <code>tablo.pop(k, None)</code>.'],
    'why': 'CDC hattında olay sırası (LSN, binlog konumu) her şeydir: silme ile oluşturmanın sırası değişirse hedef tabloda hayalet satır kalır. Aynı LSN\'nin tekrar gelmesi en az bir kez teslimatın doğal sonucudur. Ambarlarda bu mantık <code>MERGE INTO ... WHEN MATCHED AND op = \'d\' THEN DELETE</code> ile yazılır.'})

# Mini proje
ex.append({'t': 'code', 'id': 'akis-isleme-13', 'stage': 'Mini proje', 'diff': 3,
    'q': '<p><b>Ilgaz Bank dakikalık şüpheli işlem sayacı.</b> Uçtan uca akış hattını kur:</p><ol><li><code>uret(txns, n)</code>: işlemleri <code>account_id % n</code> partition\'larına yaz; <code>n</code> listeden oluşan log döndür.</li><li><code>supheli_mi(t)</code>: tutar <code>-20000</code> ya da daha düşükse <b>veya</b> saat (txn_time\'ın 11-13. karakterleri) <code>"06"</code>\'dan küçük ve tutar negatifse <code>True</code>.</li><li><code>tuket(log, offsetler, sayac)</code>: her partition\'ı <code>offsetler[p]</code>\'den (yoksa 0) sonuna kadar oku; şüpheli işlemleri olay zamanının dakikasına (<code>txn_time[:16]</code>) göre <code>sayac</code>\'ta say; her partition\'ın offset\'ini sona taşı (commit). Yeni sayılan şüpheli adedini döndür.</li><li><code>alarmlar(sayac, esik)</code>: adedi eşik ve üstünde olan dakikaları sıralı liste olarak döndür.</li></ol>',
    'start': C(TX + '''


def uret(txns, n):
    pass


def supheli_mi(t):
    pass


def tuket(log, offsetler, sayac):
    pass


def alarmlar(sayac, esik):
    pass
'''),
    'sol': C(TX + '''


def uret(txns, n):
    log = [[] for _ in range(n)]
    for t in txns:
        log[t["account_id"] % n].append(t)
    return log


def supheli_mi(t):
    return t["amount"] <= -20000 or (t["txn_time"][11:13] < "06" and t["amount"] < 0)


def tuket(log, offsetler, sayac):
    yeni = 0
    for p, parca in enumerate(log):
        for t in parca[offsetler.get(p, 0):]:
            if supheli_mi(t):
                k = t["txn_time"][:16]
                sayac[k] = sayac.get(k, 0) + 1
                yeni += 1
        offsetler[p] = len(parca)
    return yeni


def alarmlar(sayac, esik):
    return sorted(k for k, v in sayac.items() if v >= esik)


log = uret(txns, 3)
offsetler, sayac = {}, {}
print("şüpheli:", tuket(log, offsetler, sayac), "dakika:", len(sayac))
print("tekrar çalıştırma:", tuket(log, offsetler, sayac))
print("alarm:", alarmlar(sayac, 2))
'''),
    'tests': 'log = uret(txns, 3)\nassert [len(p) for p in log] == [sum(1 for t in txns if t["account_id"] % 3 == i) for i in range(3)], "Partition\\\'lar account_id % 3\\\'e göre dolmalı"\nassert supheli_mi({"amount": -20000.0, "txn_time": "2024-05-05 14:00:00"}), "-20000 sınırı dahil şüpheli"\nassert supheli_mi({"amount": -100.0, "txn_time": "2024-05-05 05:59:59"}), "06:00 öncesi negatif işlem şüpheli"\nassert not supheli_mi({"amount": 500.0, "txn_time": "2024-05-05 02:00:00"}), "Gece gelen para (pozitif) şüpheli değil"\noffsetler, sayac = {}, {}\nassert tuket(log, offsetler, sayac) == 471, "Yıl boyunca 471 şüpheli işlem olmalı"\nassert len(sayac) == 470, "Şüpheliler 470 farklı dakikaya düşmeli"\nassert offsetler == {0: len(log[0]), 1: len(log[1]), 2: len(log[2])}, "Offset\\\'ler partition sonlarına commit edilmeli"\nassert tuket(log, offsetler, sayac) == 0 and sum(sayac.values()) == 471, "Yeniden çalıştırmada aynı mesajlar tekrar sayılmamalı"\nlog[1].append({"txn_id": 999999, "account_id": 100001, "txn_time": "2024-10-23 08:43:50", "amount": -30000.0})\nassert tuket(log, offsetler, sayac) == 1, "Yeni gelen tek şüpheli mesaj sayılmalı"\nassert alarmlar(sayac, 2) == ["2024-10-23 08:43"] and sayac["2024-10-23 08:43"] == 3, "08:43 dakikası artık 3 şüpheliyle alarm vermeli"\nassert alarmlar(sayac, 4) == [], "Eşik 4\\\'te alarm yok"\n',
    'hints': ['Gece kuralı için saat metnini karşılaştırmak yeter: <code>t["txn_time"][11:13] &lt; "06"</code>.', 'Tüketici her partition için <code>parca[offsetler.get(p, 0):]</code> dilimini okur ve sonunda <code>offsetler[p] = len(parca)</code> yapar.', 'İkinci çalıştırmada offset\'ler sonda olduğu için 0 yeni şüpheli dönmeli.'],
    'why': 'Bu küçük hat gerçek sistemin iskeletidir: anahtarla bölümlenmiş log, kural tabanlı skor, olay zamanına göre dakikalık sayaç ve commit edilen offset\'ler sayesinde yeniden çalıştırmada tekrar saymama. Üretimde sayaç durumu Redis ya da bir akış motorunun durum deposunda tutulur, alarmlar ise bir Slack/Teams webhook\'una ya da vaka yönetim sistemine gönderilir.'})

faq = [
    {'q': 'Kafka bir veritabanı mı, kuyruk mu?', 'a': 'İkisi de değil, ikisinin arası: dağıtık, kalıcı, sona eklemeli bir log. Kuyruk gibi üretici ve tüketiciyi ayırır, ama mesajı okununca silmez; veritabanı gibi saklar, ama anahtarla rastgele sorgu sunmaz. Sorgu gerekiyorsa veriyi Kafka\'dan bir veritabanına ya da ambara akıtırsın.'},
    {'q': 'Kaç partition seçmeliyim?', 'a': 'Hedef işlem hacmine ve tüketici paralelliğine göre. Kaba kural: bir tüketicinin saniyede işleyebildiği mesajı ölç, hedef hacmi buna böl ve büyüme payı ekle. Sonradan artırmak anahtar-partition eşlemesini bozduğu için orta ölçekli topic\'lerde 6-12 gibi cömert bir başlangıç yaygındır.'},
    {'q': 'Tam bir kez (exactly-once) mümkün mü?', 'a': 'Kafka içinde (oku-işle-Kafka\'ya yaz) idempotent üretici ve işlemlerle mümkündür. Dış bir sisteme (veritabanı, e-posta) yazarken ise teslimat en az bir kez olur; etkiyi tek kez yapmak için hedef tarafın idempotent olması gerekir: benzersiz anahtarla upsert, işlenen kimlik tablosu, ya da offset\'i sonuçla aynı veritabanı işleminde saklamak.'},
    {'q': 'Watermark gecikmesini nasıl seçerim?', 'a': 'Gerçek gecikme dağılımını ölç: olay zamanı ile geliş zamanı farkının yüzde 99\'u hangi değerin altında? Gecikmeyi buna göre seç, kalan geç olayları yan çıkışa yaz ve oranını izle. Pano için birkaç saniye, finansal mutabakat için saatler uygun olabilir.'},
    {'q': 'Küçük bir projede Kafka şart mı?', 'a': 'Hayır. Saniyede birkaç yüz olay için PostgreSQL tablosu + polling, Redis Streams ya da RabbitMQ çoğu zaman yeterli ve işletmesi kolaydır. Kafka; yüksek hacim, çok sayıda bağımsız tüketici, replay ve CDC gerektiğinde kendini amorti eder.'}
]
mistakes = [
    {'bad': 'tuketici.commit(msg)\nisle(msg)', 'good': 'isle(msg)\ntuketici.commit(msg)', 'why': 'Önce commit edip sonra işlemek, çökme anındaki mesajı kaybettirir (en çok bir kez). Önce işle, sonra commit et ve tüketiciyi idempotent yaz.'},
    {'bad': 'pencere = mesaj_alinma_zamani[:16]', 'good': 'pencere = olay["txn_time"][:16]', 'why': 'İş ölçüleri olay zamanına göre pencerelenir; işlem zamanı ağ gecikmesine bağlıdır ve yeniden işlemede farklı sonuç verir.'},
    {'bad': 'uretici.produce("bank.txns", value=json.dumps(t))  # anahtar yok', 'good': 'uretici.produce("bank.txns", key=str(t["account_id"]), value=json.dumps(t))', 'why': 'Anahtarsız mesajlar partition\'lara rastgele dağılır; aynı hesabın işlemleri farklı sırada işlenebilir. Sırası önemli varlığı anahtar yap.'},
    {'bad': 'for _ in range(1):\n    await q.put(None)   # 3 tüketici var', 'good': 'for _ in range(n_tuketici):\n    await q.put(None)', 'why': 'Her tüketici bir sentinel tüketir; eksik sentinel gönderirsen bazı tüketiciler sonsuza kadar get() üzerinde bekler ve program bitmez.'},
    {'bad': 'yeni_sema = {"risk_skoru": {"tip": "double"}}  # varsayılan yok', 'good': 'yeni_sema = {"risk_skoru": {"tip": "double", "varsayilan": None}}', 'why': 'Varsayılanı olmayan yeni alan eski mesajlarda bulunmadığı için yeni tüketici onları okuyamaz; geriye uyumluluk bozulur.'}
]

lesson = {
    'id': 'akis-isleme', 'lv': 'ileri', 'mod': 'Üretime Hazırlık', 'min': 60,
    'title': 'Akış işleme ve mesaj kuyrukları: Kafka kavramları',
    'sum': 'Toplu ile akış işlemeyi, olay ve işlem zamanını, Kafka\'nın topic, partition, offset ve tüketici grubu modelini, teslim garantilerini, idempotent tüketiciyi, tumbling/sliding/session pencereleri, watermark\'ı, şema evrimini ve CDC\'yi bellek içi log ve asyncio.Queue ile kurar; Ilgaz Bank işlem akışında dakikalık şüpheli işlem sayacı yazarsın.',
    'goals': ['Toplu, mikro-toplu ve akış işlemeyi; olay zamanı ile işlem zamanını ayırt edebilirim.', 'Topic, partition, offset, tüketici grubu ve commit kavramlarını bellek içi bir log ile modelleyebilirim.', 'En çok bir, en az bir ve tam bir kez teslimatı açıklar, idempotent tüketici yazabilirim.', 'Tumbling, kayan ve oturum pencerelerini; geç gelen veri için watermark\'ı uygulayabilirim.', 'Şema uyumluluğu, CDC olaylarını uygulama ve Kafka/RabbitMQ/Redis Streams seçimi hakkında karar verebilirim.'],
    'body': body, 'ex': ex, 'faq': faq, 'mistakes': mistakes}

if __name__ == '__main__':
    write('/home/claude/py/v2/n6/akis-isleme.js', 'Akış işleme ve mesaj kuyrukları', lesson)
