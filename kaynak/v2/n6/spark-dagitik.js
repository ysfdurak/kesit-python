/* Kesit Python v2/n6 — PySpark ile dağıtık veri işleme */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push({
  id: 'spark-dagitik',
  lv: 'ileri',
  mod: 'Veri Bilimi Araçları',
  min: 60,
  title: 'PySpark ile dağıtık veri işleme: partition, shuffle ve Spark SQL',
  sum: 'Spark\'ın sürücü, yürütücü ve partition modelini, tembel değerlendirmeyi, dar ve geniş dönüşümleri, shuffle\'ın bedelini, broadcast join\'i, çarpıklık ve salting\'i, Spark SQL pencere fonksiyonlarını ve bölümlü Parquet gölünü Pedal İzmir verisiyle saf Python, polars ve DuckDB üzerinde kurarak öğrenirsin.',
  needs: ['polars', 'duckdb'],
  goals: [
    'Sürücü, yürütücü, partition, görev ve aşama kavramlarıyla bir Spark işinin nasıl çalıştığını anlatabilirim.',
    'Dönüşüm ile eylemi, dar ile geniş dönüşümü ayırt edip bir işin kaç kez shuffle yapacağını tahmin edebilirim.',
    'Hash bölümleme, map-reduce, broadcast join, sort-merge join ve salting\'i saf Python ile kurabilirim.',
    'Spark SQL pencere fonksiyonlarını ve DataFrame zincirlerini DuckDB ve polars karşılıklarıyla yazabilirim.',
    'partitionBy, Parquet, Delta/Iceberg ve UDF maliyetini değerlendirip Spark\'ın gerekip gerekmediğine karar verebilirim.'
  ],
  body: `<h2>Neden önemli? Veri tek makineye sığmadığında</h2>
<p>Pedal İzmir'in bisiklet paylaşım sistemi üç yaz ayında 116.517 yolculuk üretti. Bu boyut bir dizüstü bilgisayar için çocuk oyuncağı: polars ya da DuckDB saniyeler içinde özetler (bunu <b>polars-duckdb</b> dersinde gördün). Şimdi aynı şirketin 30 şehre yayıldığını, her bisikletin 5 saniyede bir GPS konumu gönderdiğini düşün: günde milyarlarca satır, yılda yüzlerce terabayt. Tek makinenin belleği, diski ve işlemcisi yetmez. Çözüm işi <b>parçalara bölüp</b> çok sayıda makineye dağıtmaktır. Apache Spark bu işin endüstri standardıdır; Databricks, AWS EMR, Google Dataproc ve Azure Synapse'in kalbinde o çalışır.</p>
<p>Spark, Java sanal makinesi (JVM) ve bir küme ister; tarayıcıda çalışmaz. Bu yüzden derste PySpark kodunu <code>&lt;pre class="code"&gt;</code> kutularında okuyacak, Spark'ın arka planda yaptığı işi ise saf Python, polars ve DuckDB ile <b>kendin kuracaksın</b>: bölümleme (partitioning), map-reduce, shuffle, broadcast join, salting ve pencere fonksiyonları. Mülakatlarda sorulan da tam olarak bu iç işleyiştir; API'yi bir öğleden sonrada öğrenirsin, ama "bu iş neden 40 dakika sürüyor?" sorusunu iç işleyişi bilen cevaplar.</p>

<h2>Dağıtık hesaplamanın parçaları: sürücü, yürütücü, partition</h2>
<p>Bir Spark uygulamasında tek bir <b>sürücü</b> (driver) programı ve birçok <b>yürütücü</b> (executor) süreci vardır. Sürücü senin Python kodunu çalıştırır, planı çıkarır ve işi küçük <b>görevlere</b> (task) bölüp yürütücülere dağıtır. Veri, <b>partition</b> denen parçalara ayrılmıştır; her görev tek bir partition üzerinde çalışır. 200 partition ve 50 çekirdek varsa görevler dört dalgada biter.</p>
<div class="tbl-wrap"><table>
<tr><th>Kavram</th><th>Ne demek?</th><th>Benzetme</th></tr>
<tr><td>Sürücü (driver)</td><td>Planı yapar, görevleri dağıtır, sonucu toplar</td><td>Şantiye şefi</td></tr>
<tr><td>Yürütücü (executor)</td><td>Görevleri çalıştıran JVM süreci; bellek ve çekirdek sahibi</td><td>Usta ekipleri</td></tr>
<tr><td>Partition</td><td>Verinin bağımsız işlenebilen parçası</td><td>Bir ustaya verilen tuğla yığını</td></tr>
<tr><td>Görev (task)</td><td>Bir partition üzerinde bir aşamanın işi</td><td>"Bu yığını duvara ör"</td></tr>
<tr><td>Aşama (stage)</td><td>Shuffle gerektirmeden art arda yapılabilen görevler</td><td>Malzeme taşınmadan yapılan iş bloğu</td></tr>
<tr><td>İş (job)</td><td>Bir eylemin (action) tetiklediği aşamalar bütünü</td><td>Bir katın tamamı</td></tr>
</table></div>
<p>Bölümlemenin en yaygın yolu <b>hash bölümleme</b>dir: anahtarın özeti (hash) partition sayısına bölünür, kalan partition numarasını verir. Aynı anahtar her zaman aynı partition'a düşer. Aşağıda Pedal İzmir yolculuklarını başlangıç istasyonuna göre 4 partition'a dağıtıyoruz (tamsayı anahtarda <code>% n</code> yeterli):</p>
<pre class="py">import veri

trips = veri.kayitlar("pedal_izmir", "bk_trips")
print(len(trips), "yolculuk")

n = 4
bolumler = [[] for _ in range(n)]
for t in trips:
    bolumler[t["start_station"] % n].append(t)

for i, b in enumerate(bolumler):
    print(f"partition {i}: {len(b):&gt;6} kayıt")</pre>
<div class="warn"><b>Metin anahtarda hash() tuzağı</b>Python'da <code>hash("Konak")</code> her süreçte farklı değer üretir (PYTHONHASHSEED rastgeledir). Spark kendi kararlı hash fonksiyonunu (Murmur3) kullanır. Kendi simülasyonunda metin anahtarı bölmek istersen <code>zlib.crc32(anahtar.encode())</code> gibi kararlı bir özet kullan.</div>

<h2>SparkSession, DataFrame API ve tembel değerlendirme</h2>
<p>PySpark'ta her şey bir <code>SparkSession</code> ile başlar. DataFrame API'si pandas'tan çok polars'ın lazy API'sine benzer: <code>filter</code>, <code>select</code>, <code>groupBy</code> gibi <b>dönüşümler</b> (transformation) hiçbir şey hesaplamaz, yalnız plan kurar. <code>count</code>, <code>show</code>, <code>collect</code>, <code>write</code> gibi <b>eylemler</b> (action) gelince Catalyst iyileştiricisi planı optimize eder ve küme çalışmaya başlar.</p>
<pre class="code">from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.appName("pedal-izmir").getOrCreate()

trips = spark.read.csv("s3://pedal/bk_trips/", header=True, inferSchema=True)
stations = spark.read.parquet("s3://pedal/bk_stations/")

gunluk = (trips
          .filter(F.col("distance_km") &gt; 0)                 # dönüşüm: plan
          .withColumn("gun", F.to_date("started_at"))       # dönüşüm: plan
          .groupBy("gun")                                   # dönüşüm: plan (geniş)
          .agg(F.count("*").alias("yolculuk"),
               F.round(F.avg("fare"), 2).alias("ort_ucret")))

gunluk.explain()          # fiziksel planı yazdırır, veri okumaz
gunluk.show(5)            # EYLEM: iş burada başlar</pre>
<div class="note"><b>Kendi bilgisayarında dene</b>PySpark için Java 17 gerekir. <code>pip install pyspark</code> ile kurulur; <code>spark = SparkSession.builder.master("local[*]").getOrCreate()</code> tek makinede tüm çekirdekleri yürütücü gibi kullanır. Çalışırken <code>http://localhost:4040</code> adresinde Spark UI açılır. Kurulumsuz denemek için Databricks Free Edition ya da Google Colab'da <code>!pip install pyspark</code> yeterli.</div>
<p>Aynı tembel mantığı tarayıcıda polars ile görebilirsin: <code>.lazy()</code> (bilgisayarında doğrudan dosyadan <code>scan_csv</code>) plan kurar, <code>collect</code> çalıştırır.</p>
<pre class="py">import polars as pl

plan = (pl.read_csv(veri.yol("pedal_izmir", "bk_trips")).lazy()   # bilgisayarında: pl.scan_csv(...)
        .filter(pl.col("distance_km") &gt; 0)
        .with_columns(pl.col("started_at").str.slice(0, 7).alias("ay"))
        .group_by("ay")
        .agg(pl.len().alias("yolculuk"), pl.col("fare").mean().round(2).alias("ort_ucret"))
        .sort("ay"))
print(type(plan).__name__)      # henüz veri yok, yalnız plan
print(plan.collect())           # eylem</pre>
<h2>Dar ve geniş dönüşümler: shuffle'ın bedeli</h2>
<p><b>Dar dönüşüm</b> (narrow) her çıktı partition'ının yalnız bir girdi partition'ına bağlı olduğu işlemdir: <code>filter</code>, <code>select</code>, <code>withColumn</code>. Ağ trafiği yoktur, her yürütücü kendi parçasını işler. <b>Geniş dönüşüm</b> (wide) ise aynı anahtara sahip kayıtların aynı yere toplanmasını gerektirir: <code>groupBy</code>, <code>join</code>, <code>distinct</code>, <code>orderBy</code>. Bu toplanmaya <b>shuffle</b> denir: veriler diske yazılır, ağdan taşınır, yeniden okunur. Spark işlerinin yavaşlığının bir numaralı sebebi shuffle'dır.</p>
<div class="tbl-wrap"><table>
<tr><th>Dönüşüm</th><th>Tür</th><th>Shuffle?</th><th>Not</th></tr>
<tr><td><code>filter</code>, <code>select</code>, <code>withColumn</code></td><td>Dar</td><td>Hayır</td><td>Aynı aşamada zincirlenir</td></tr>
<tr><td><code>groupBy().agg()</code></td><td>Geniş</td><td>Evet</td><td>Önce partition içinde kısmi toplam (combiner) yapılır</td></tr>
<tr><td><code>join</code></td><td>Geniş</td><td>Çoğunlukla</td><td>Küçük tablo yayınlanırsa (broadcast) shuffle olmaz</td></tr>
<tr><td><code>orderBy</code></td><td>Geniş</td><td>Evet</td><td>Aralık bölümleme için önce örnekleme yapar</td></tr>
<tr><td><code>repartition(n)</code></td><td>Geniş</td><td>Evet</td><td>Tam karıştırma; <code>coalesce(n)</code> ise azaltırken shuffle yapmaz</td></tr>
</table></div>
<p>Spark'ın <code>groupBy</code>'ı akıllıdır: shuffle'dan önce her partition kendi içinde <b>kısmi toplam</b> çıkarır (map-side combine), ağdan yalnız bu özetler gider. Aşağıda dosyanın ardışık parçalara bölündüğü durumu (HDFS ya da S3 blokları gibi) taklit ediyoruz ve combiner'ın ağ trafiğini ne kadar düşürdüğünü sayıyoruz:</p>
<pre class="py">from collections import Counter

def parcala(kayitlar, n):
    boy = -(-len(kayitlar) // n)              # yukarı yuvarlayan bölme
    return [kayitlar[i * boy:(i + 1) * boy] for i in range(n)]

parcalar = parcala(trips, 4)

# MAP + COMBINE: her parça kendi içinde sayar
kismi = [Counter(t["start_station"] for t in p) for p in parcalar]
print("combiner olmasa ağdan giden kayıt:", sum(len(p) for p in parcalar))
print("combiner ile ağdan giden kayıt   :", sum(len(k) for k in kismi))

# SHUFFLE + REDUCE: aynı anahtarlar birleşir
toplam = Counter()
for k in kismi:
    toplam.update(k)
print("en yoğun 3 istasyon:", toplam.most_common(3))</pre>
<p>116 binden 248'e: combiner sayesinde shuffle'a binlerce kat daha az kayıt girer. Ortalama gibi <b>birleştirilebilir olmayan</b> ölçülerde ise kısmi sonuç olarak (toplam, adet) çifti taşınır; ortalamaların ortalaması yanlış sonuç verir (alıştırmalarda bu hatayı avlayacaksın).</p>

<h2>Join stratejileri, veri çarpıklığı ve salting</h2>
<p>İki büyük tabloyu birleştirmek için Spark varsayılan olarak <b>sort-merge join</b> kullanır: iki taraf da anahtara göre shuffle edilip sıralanır, sonra fermuar gibi birleştirilir. Taraflardan biri küçükse (varsayılan eşik 10 MB, <code>spark.sql.autoBroadcastJoinThreshold</code>) <b>broadcast hash join</b> seçilir: küçük tablo her yürütücüye kopyalanır, büyük tablo yerinden kıpırdamaz. 62 satırlık istasyon tablosu bunun ders kitabı örneğidir.</p>
<pre class="code">from pyspark.sql.functions import broadcast

zengin = trips.join(broadcast(stations),
                    trips.start_station == stations.station_id, "left")
zengin.groupBy("district").count().orderBy(F.desc("count")).show()</pre>
<pre class="py">stations = veri.kayitlar("pedal_izmir", "bk_stations")
ilce = {s["station_id"]: s["district"] for s in stations}   # her yürütücüye giden küçük sözlük

sayac = Counter(ilce[t["start_station"]] for t in trips)     # büyük tablo yerinde kalır
for ad, n in sayac.most_common(3):
    print(ad, n)</pre>
<p><b>Veri çarpıklığı</b> (skew), bazı anahtarların diğerlerinden çok daha sık görülmesidir. Alsancak Çarşı istasyonu tek başına 4.257 yolculukla öndedir; gerçek hayatta bu oran 1'e 1000 olabilir (ör. "bilinmiyor" müşteri kimliği). Hash bölümlemede o anahtarın bütün kayıtları tek göreve düşer; 199 görev 10 saniyede biterken bir görev 40 dakika sürer. Spark UI'da bu durum "görev sürelerinin max değeri medyanın çok üstünde" diye görünür.</p>
<p>Çözümlerden biri <b>salting</b> (tuzlama): sıcak anahtara yapay bir son ek eklenir (<code>12#0</code>, <code>12#1</code>...), böylece yük birkaç göreve yayılır. İlk aşamada tuzlu anahtarlarla kısmi toplam alınır, ikinci aşamada tuz atılıp yeniden toplanır. Spark 3'ün <b>AQE</b> (adaptive query execution) özelliği join'lerdeki çarpıklığı çoğu zaman kendisi böler (<code>spark.sql.adaptive.skewJoin.enabled</code>), ama groupBy çarpıklığında ve eski sürümlerde salting hâlâ elle yapılır.</p>
<pre class="py">sade = Counter(t["start_station"] for t in trips)
sicak = {k for k, _ in sade.most_common(2)}
tuzlu = Counter((t["start_station"], t["trip_id"] % 4 if t["start_station"] in sicak else 0) for t in trips)
print("tuzsuz en büyük grup:", max(sade.values()))
print("tuzlu en büyük grup :", max(tuzlu.values()))</pre>
<h2>Spark SQL ve pencere fonksiyonları</h2>
<p>DataFrame'i geçici görünüm olarak kaydedip SQL yazabilirsin; Spark SQL ve DataFrame API aynı iyileştiriciye gider, performans farkı yoktur. Pencere fonksiyonları (<code>ROW_NUMBER</code>, <code>RANK</code>, <code>LAG</code>, kayan toplam) da aynıdır. <code>PARTITION BY</code> ifadesi Spark'ta gerçekten bir shuffle'a dönüşür: aynı ilçenin satırları aynı göreve toplanır.</p>
<pre class="code">trips.createOrReplaceTempView("trips")
stations.createOrReplaceTempView("stations")
spark.sql("""
    WITH s AS (
        SELECT st.district, st.name, COUNT(*) AS n
        FROM trips t JOIN stations st ON t.start_station = st.station_id
        GROUP BY st.district, st.name)
    SELECT * FROM (
        SELECT *, ROW_NUMBER() OVER (PARTITION BY district ORDER BY n DESC) AS sira
        FROM s) WHERE sira = 1
""").show()</pre>
<p>Aynı sorguyu DuckDB ile tarayıcıda çalıştırabilirsin; SQL neredeyse harfi harfine aynı:</p>
<pre class="py">import duckdb

t_yol = veri.yol("pedal_izmir", "bk_trips")
s_yol = veri.yol("pedal_izmir", "bk_stations")
sorgu = f"""
WITH s AS (
    SELECT st.district, st.name, COUNT(*) AS n
    FROM read_csv('{t_yol}') t JOIN read_csv('{s_yol}') st ON t.start_station = st.station_id
    GROUP BY st.district, st.name)
SELECT district, name, n FROM (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY district ORDER BY n DESC, name) AS sira FROM s)
WHERE sira = 1 ORDER BY n DESC LIMIT 3
"""
for satir in duckdb.sql(sorgu).fetchall():
    print(satir)</pre>
<h2>Parquet, partitionBy, Delta ve Iceberg</h2>
<p>Spark'ın doğal dosya biçimi Parquet'tir: sütunsal, sıkıştırılmış ve şemalı. <code>partitionBy</code> ile yazınca veri <b>hive tarzı</b> klasörlere ayrılır (<code>ay=2024-06/</code>). Sorgu <code>WHERE ay = '2024-07'</code> içerirse Spark öteki klasörleri hiç açmaz; buna <b>bölüm budama</b> (partition pruning) denir. Bölüm sütunu, filtrede sık kullanılan ve <b>az sayıda</b> farklı değeri olan bir sütun olmalıdır: gün ya da ay iyi, müşteri kimliği felakettir (milyonlarca küçük dosya).</p>
<pre class="code">(trips.withColumn("ay", F.substring("started_at", 1, 7))
      .repartition("ay")                       # her ay tek görevde: az ve büyük dosya
      .write.mode("overwrite")
      .partitionBy("ay")
      .parquet("s3://pedal/lake/trips/"))

# Delta Lake: Parquet + işlem günlüğü (ACID, MERGE, zaman yolculuğu)
trips.write.format("delta").mode("append").save("s3://pedal/delta/trips")
spark.read.format("delta").option("versionAsOf", 3).load("s3://pedal/delta/trips")</pre>
<div class="tbl-wrap"><table>
<tr><th>Biçim</th><th>Ne ekler?</th><th>Nerede görürsün?</th></tr>
<tr><td>Parquet</td><td>Sütunsal depolama, sıkıştırma, istatistik</td><td>Her yerde</td></tr>
<tr><td>Delta Lake</td><td>ACID işlem günlüğü, MERGE/UPSERT, zaman yolculuğu</td><td>Databricks</td></tr>
<tr><td>Apache Iceberg</td><td>Tablo biçimi, gizli bölümleme, şema evrimi, motor bağımsız</td><td>Snowflake, AWS Athena, Trino</td></tr>
<tr><td>Apache Hudi</td><td>Artımlı upsert, CDC odaklı</td><td>Uber kökenli göller</td></tr>
</table></div>

<h2>UDF'nin bedeli ve pandas UDF</h2>
<p>Spark'ın hazır fonksiyonları (<code>F.when</code>, <code>F.regexp_extract</code>...) JVM içinde, Catalyst'in optimize ettiği kodla çalışır. Python ile yazdığın sıradan bir <b>UDF</b> ise her satırı JVM'den Python sürecine taşır, sonucu geri getirir: serileştirme maliyeti işi 10 kat yavaşlatabilir ve iyileştirici fonksiyonun içini göremez. Önce hazır fonksiyon ara; yoksa Arrow ile toplu (vektörel) çalışan <b>pandas UDF</b> kullan.</p>
<pre class="code">from pyspark.sql.functions import pandas_udf
import pandas as pd

@F.udf("double")                       # yavaş: satır satır
def kdv_ekle(tutar):
    return tutar * 1.2

@pandas_udf("double")                  # hızlı: Arrow ile toplu
def kdv_ekle_vek(tutar: pd.Series) -&gt; pd.Series:
    return tutar * 1.2

trips.select(F.col("fare") * 1.2)      # en hızlı: hazır ifade, UDF yok</pre>
<h2>Ne zaman Spark gereksizdir?</h2>
<div class="tbl-wrap"><table>
<tr><th>Veri boyutu</th><th>Önerilen araç</th><th>Neden?</th></tr>
<tr><td>Belleğe rahat sığar (birkaç GB)</td><td>pandas, polars</td><td>Kurulum yok, en hızlı geliştirme</td></tr>
<tr><td>Tek makine diskine sığar (10 GB – 1 TB)</td><td>DuckDB, polars lazy/streaming</td><td>Tek düğümde Spark'tan hızlı, küme maliyeti yok</td></tr>
<tr><td>Çok TB, sürekli büyüyen göl, çok ekip</td><td>Spark (Databricks, EMR), Trino</td><td>Yatay ölçek, hata toleransı, yönetişim</td></tr>
</table></div>
<div class="tip"><b>Spark UI'yı okumak</b>Bir iş yavaşsa önce Spark UI'nın <i>Stages</i> sekmesine bak: en uzun aşamada "Shuffle Read" ve "Shuffle Write" boyutları shuffle'ın bedelini, görev sürelerinin min/medyan/max dağılımı çarpıklığı, "Spill (disk)" sütunu bellek yetmezliğini gösterir. <i>SQL</i> sekmesindeki plan grafiğinde "BroadcastHashJoin" ile "SortMergeJoin" ayrımını görürsün.</div>
<div class="note"><b>Gerçek işte</b>Veri mühendisliği ekiplerinde Spark işinin süresini yarıya indiren değişiklikler çoğu zaman koddaki bir döngü değil, plandaki bir tercihtir: küçük boyut tablosunu broadcast etmek, filtreyi join'den önceye almak, çarpık anahtarı ayrı işlemek, gereksiz <code>orderBy</code> ve <code>collect</code>'i kaldırmak, küçük dosya sorununu <code>repartition</code> ile çözmek. Kod incelemesinde ilk sorulan soru "Bu iş kaç kez shuffle yapıyor?" olur.</div>
<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Partition sayısını ayarlamak</h3>
<p>Shuffle sonrası partition sayısı <code>spark.sql.shuffle.partitions</code> ile belirlenir (varsayılan 200). Kural olarak partition başına 100–200 MB hedeflenir: 1 TB'lık shuffle için 200 çok azdır (her görev 5 GB, belleğe sığmaz, diske taşar), 1 GB için fazladır (5 MB'lık 200 minik görev, zamanlama yükü). AQE açıkken Spark küçük partition'ları kendisi birleştirir (<code>coalescePartitions</code>).</p>
<h3>cache ve persist</h3>
<p>Aynı DataFrame'i birden çok eylemde kullanıyorsan her eylem planı baştan çalıştırır. <code>df.cache()</code> sonucu yürütücü belleğinde tutar; ama gereksiz cache belleği yer ve diske taşmaya yol açar. Yalnız gerçekten tekrar kullanılan, pahalı hesaplanan ara sonucu önbelleğe al, işin bitince <code>unpersist()</code> çağır.</p>
<h3>collect() ve toPandas() tuzağı</h3>
<p><code>collect</code> bütün veriyi sürücüye çeker. 50 GB'lık sonucu sürücüye çekmek OutOfMemory demektir. Sürücüye yalnız küçük özetler gelmeli; büyük sonuçlar <code>write</code> ile göle yazılmalı.</p>
</section>
`,
  ex: [
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Aşağıdaki PySpark satırlarından hangisi <b>eylem</b> (action) olduğu için kümede gerçekten hesaplama başlatır?',
      o: ['<code>df.filter(F.col("fare") &gt; 50)</code>', '<code>df.groupBy("district").count()</code>', '<code>df.write.parquet("s3://gol/")</code>', '<code>df.withColumn("ay", F.month("started_at"))</code>'],
      a: 2,
      why: 'filter, groupBy ve withColumn yalnız plana eklenen dönüşümlerdir (groupBy().count() bile DataFrame döndürür). write, count, show ve collect gibi eylemler planı çalıştırır. Tembel değerlendirme sayesinde Spark bütün zinciri görüp optimize edebilir.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Hangi işlem bir <b>shuffle</b> (verinin ağ üzerinden yeniden dağıtılması) gerektirir?',
      o: ['Her satıra yeni bir sütun eklemek (<code>withColumn</code>)', 'Müşteri kimliğine göre gruplayıp toplam almak (<code>groupBy</code>)', 'Belirli koşulu sağlayan satırları süzmek (<code>filter</code>)', 'Yalnız iki sütunu seçmek (<code>select</code>)'],
      a: 1,
      why: 'Gruplama için aynı müşteri kimliğine sahip bütün satırların aynı göreve toplanması gerekir; bu geniş bir dönüşümdür. withColumn, filter ve select her partition\'da bağımsız çalışan dar dönüşümlerdir.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: '300 milyon satırlık yolculuk tablosunu 62 satırlık istasyon tablosuyla birleştireceksin. En uygun join stratejisi hangisi?',
      o: ['Sort-merge join: iki tabloyu da anahtara göre shuffle edip sırala', 'Önce iki tabloyu da sürücüye collect edip Python\'da birleştir', 'İstasyon tablosunu broadcast et; büyük tablo yerinde kalsın', 'Yolculuk tablosunu tek partition\'a indirip birleştir'],
      a: 2,
      why: 'Küçük tablo her yürütücüye kopyalanınca büyük tablo hiç shuffle edilmez (broadcast hash join). Sort-merge iki büyük tablo için doğrudur; burada gereksiz yere 300 milyon satırı ağdan taşır. collect sürücünün belleğini patlatır, tek partition ise paralelliği öldürür.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'İstasyon kimlikleri 3 partition\'a hash bölümleme ile dağıtılıyor. Çıktı nedir?',
      code: 'istasyonlar = [41, 51, 7, 12, 9]\nbolumler = {0: [], 1: [], 2: []}\nfor s in istasyonlar:\n    bolumler[s % 3].append(s)\nprint(bolumler[0], len(bolumler[1]))\n',
      o: ['[51, 12, 9] 1', '[51, 12, 9] 2', '[12, 9] 1', '[41, 51, 7] 2'],
      a: 0,
      why: '41 % 3 = 2, 51 % 3 = 0, 7 % 3 = 1, 12 % 3 = 0, 9 % 3 = 0. Partition 0\'da 51, 12, 9 vardır; partition 1\'de yalnız 7.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Tembel değerlendirmeyi taklit eden bu sınıf ne yazdırır?',
      code: 'class Plan:\n    def __init__(self, adimlar=()):\n        self.adimlar = list(adimlar)\n    def filter(self, ad):\n        return Plan(self.adimlar + [ad])\n    def count(self):\n        print("çalışıyor:", " -> ".join(self.adimlar))\n        return len(self.adimlar)\n\np = Plan(["oku"]).filter("ucret>0").filter("ay=6")\nprint("plan hazır")\nprint(p.count())\n',
      o: ['çalışıyor: oku -> ucret>0 -> ay=6\nplan hazır\n3', 'plan hazır\nçalışıyor: oku -> ucret>0 -> ay=6\n3', 'plan hazır\nçalışıyor: oku -> ucret>0 -> ay=6\n2', 'plan hazır\n3'],
      a: 1,
      why: 'filter yalnız yeni bir Plan döndürür, hiçbir şey yazdırmaz. count bir eylemdir: önce zinciri yazdırır, sonra adım sayısını (3) döndürür. Spark\'ta da hata ya da yavaşlık, dönüşüm satırında değil eylem satırında ortaya çıkar.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'DuckDB pencere fonksiyonu ne yazdırır?',
      code: 'import duckdb\n\nsorgu = """\nSELECT ilce, istasyon, n,\n       ROW_NUMBER() OVER (PARTITION BY ilce ORDER BY n DESC) AS sira\nFROM (VALUES (\'Konak\', \'Meydan\', 30), (\'Konak\', \'İskele\', 45),\n             (\'Buca\', \'Park\', 12)) AS t(ilce, istasyon, n)\nORDER BY ilce, sira\n"""\nfor satir in duckdb.sql(sorgu).fetchall():\n    print(satir)\n',
      o: ['(\'Buca\', \'Park\', 12, 1)\n(\'Konak\', \'İskele\', 45, 1)\n(\'Konak\', \'Meydan\', 30, 2)', '(\'Buca\', \'Park\', 12, 3)\n(\'Konak\', \'İskele\', 45, 1)\n(\'Konak\', \'Meydan\', 30, 2)', '(\'Konak\', \'İskele\', 45, 1)\n(\'Konak\', \'Meydan\', 30, 2)\n(\'Buca\', \'Park\', 12, 1)', '(\'Buca\', \'Park\', 12, 1)\n(\'Konak\', \'Meydan\', 30, 1)\n(\'Konak\', \'İskele\', 45, 2)'],
      a: 0,
      why: 'PARTITION BY ilce sıra numarasını her ilçede 1\'den başlatır. Konak içinde n\'e göre azalan sırada İskele (45) birinci, Meydan (30) ikincidir. Dış ORDER BY ilce ise Buca\'yı alfabetik olarak öne alır.'
    },
    {
      t: 'order',
      stage: 'Kodu oku',
      q: '<p>İki partition\'daki kanal bilgisinden map-reduce ile kanal başına işlem sayısını çıkaran programın satırlarını sırala: önce her partition kendi içinde sayar (map + combine), sonra kısmi sonuçlar birleşir (reduce).</p>',
      lines: ['bolumler = [["mobil", "pos", "mobil"], ["pos", "atm"]]', 'kismi = [{k: b.count(k) for k in set(b)} for b in bolumler]', 'toplam = dict(kismi[0])', 'for k in kismi[1:]:', '    for kanal, n in k.items():', '        toplam[kanal] = toplam.get(kanal, 0) + n', 'print(sorted(toplam.items()))'],
      expect: '[(\'atm\', 1), (\'mobil\', 2), (\'pos\', 2)]\n',
      hint: 'Önce veri, sonra her partition\'ın kısmi sayımı (map + combine); birleştirme ilk kısmi sonuçtan başlar ve kalanları ekler.',
      why: 'Map aşaması her partition\'da bağımsız çalışır ve küçük bir özet üretir; reduce aşaması özetleri anahtar bazında toplar. Spark groupBy().count() işinin iç yapısı budur.'
    },
    {
      t: 'code',
      id: 'spark-dagitik-1',
      stage: 'Rehberli',
      diff: 1,
      q: '<p><code>bolumle(kayitlar, n, anahtar)</code> fonksiyonunu yaz: kayıtları <b>hash bölümleme</b> ile <code>n</code> partition\'a dağıtsın. Tamsayı anahtar için partition numarası <code>kayit[anahtar] % n</code>. Dönüş: <code>n</code> elemanlı liste; her eleman o partition\'daki kayıtların listesi (sıra korunur).</p><p>Pedal İzmir yolculuklarını (<code>veri.kayitlar("pedal_izmir", "bk_trips")</code>) başlangıç istasyonuna göre bölünce partition boyutları ne çıkıyor?</p>',
      guide: ['<code>n</code> tane boş liste içeren bir liste oluştur (<code>[[] for _ in range(n)]</code>).', 'Her kaydın anahtar değerini al ve <code>% n</code> ile partition numarasını bul.', 'Kaydı o numaralı listeye ekle.', 'Listeyi döndür.'],
      example: '# Benzer teknik: siparişleri müşteri kimliğine göre 3 kasaya dağıtmak\nsiparisler = [{"musteri": 10, "tutar": 50}, {"musteri": 11, "tutar": 20}, {"musteri": 13, "tutar": 70}]\nkasalar = [[] for _ in range(3)]\nfor s in siparisler:\n    kasalar[s["musteri"] % 3].append(s["tutar"])\nprint(kasalar)\n',
      start: 'import veri\n\ntrips = veri.kayitlar("pedal_izmir", "bk_trips")\n\n\ndef bolumle(kayitlar, n, anahtar):\n    bolumler = []          # TODO 1: n tane boş liste oluştur\n    for k in kayitlar:\n        # TODO 2: partition numarasını bul ve kaydı oraya ekle\n        pass\n    return bolumler\n',
      sol: 'import veri\n\ntrips = veri.kayitlar("pedal_izmir", "bk_trips")\n\n\ndef bolumle(kayitlar, n, anahtar):\n    bolumler = [[] for _ in range(n)]\n    for k in kayitlar:\n        bolumler[k[anahtar] % n].append(k)\n    return bolumler\n\n\nprint([len(b) for b in bolumle(trips, 4, "start_station")])\n',
      tests: 'b = bolumle(trips, 4, "start_station")\nassert len(b) == 4, "4 partition dönmeli"\nassert [len(x) for x in b] == [27697, 30444, 27055, 31321], "Partition boyutları tutmuyor: start_station % 4 kullandın mı?"\nassert all(t["start_station"] % 4 == 1 for t in b[1]), "Partition 1\\\'deki her kaydın anahtarı % 4 == 1 olmalı"\nornek = bolumle([{"k": 5}, {"k": 2}, {"k": 7}], 2, "k")\nassert ornek == [[{"k": 2}], [{"k": 5}, {"k": 7}]], "Sıra korunmalı ve anahtar parametresi kullanılmalı"\nassert bolumle([], 3, "k") == [[], [], []], "Boş girdide n tane boş liste dönmeli"\n',
      hints: ['Liste çarpımı <code>[[]] * n</code> aynı listeyi n kez gösterir; liste üreteci kullan.', '<code>bolumler[k[anahtar] % n].append(k)</code>'],
      why: 'Hash bölümleme, aynı anahtarın her zaman aynı partition\'a gitmesini garanti eder; groupBy ve join bu garantiye dayanır. Partition boyutlarının birbirine yakın olması (27–31 bin) iyi bir dağılım demektir.'
    },
    {
      t: 'code',
      id: 'spark-dagitik-2',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Map-reduce ile istasyon başına yolculuk sayısı. İki fonksiyon yaz:</p><ul><li><code>kismi_sayim(parca)</code>: bir partition\'daki kayıtlardan <code>{start_station: adet}</code> sözlüğü (map + combine).</li><li><code>birlestir(kismiler)</code>: kısmi sözlüklerin listesini tek sözlükte toplar (reduce).</li></ul><p>Başlangıç kodundaki <code>parcala</code>, dosyanın 4 ardışık bloğa bölünmesini taklit ediyor.</p>',
      guide: ['<code>kismi_sayim</code> içinde boş sözlük kur, her kaydın istasyonunu 1 artır.', '<code>birlestir</code> içinde boş bir sonuç sözlüğü kur.', 'Her kısmi sözlüğün <code>items()</code>\'ını gez ve adetleri sonuca ekle.', 'Sonucu döndür.'],
      example: '# Benzer teknik: iki şubenin günlük kısmi cirolarını birleştirmek\nsube_a = {"pzt": 100, "sal": 80}\nsube_b = {"sal": 20, "car": 50}\ntoplam = {}\nfor kismi in [sube_a, sube_b]:\n    for gun, tutar in kismi.items():\n        toplam[gun] = toplam.get(gun, 0) + tutar\nprint(toplam)\n',
      start: 'import veri\n\ntrips = veri.kayitlar("pedal_izmir", "bk_trips")\n\n\ndef parcala(kayitlar, n):\n    boy = -(-len(kayitlar) // n)\n    return [kayitlar[i * boy:(i + 1) * boy] for i in range(n)]\n\n\ndef kismi_sayim(parca):\n    sayac = {}\n    # TODO: her kaydın start_station değerini say\n    return sayac\n\n\ndef birlestir(kismiler):\n    sonuc = {}\n    # TODO: kısmi sözlükleri topla\n    return sonuc\n',
      sol: 'import veri\n\ntrips = veri.kayitlar("pedal_izmir", "bk_trips")\n\n\ndef parcala(kayitlar, n):\n    boy = -(-len(kayitlar) // n)\n    return [kayitlar[i * boy:(i + 1) * boy] for i in range(n)]\n\n\ndef kismi_sayim(parca):\n    sayac = {}\n    for t in parca:\n        sayac[t["start_station"]] = sayac.get(t["start_station"], 0) + 1\n    return sayac\n\n\ndef birlestir(kismiler):\n    sonuc = {}\n    for kismi in kismiler:\n        for anahtar, adet in kismi.items():\n            sonuc[anahtar] = sonuc.get(anahtar, 0) + adet\n    return sonuc\n\n\nkismiler = [kismi_sayim(p) for p in parcala(trips, 4)]\nprint("shuffle edilen özet kaydı:", sum(len(k) for k in kismiler))\nprint(sorted(birlestir(kismiler).items(), key=lambda x: -x[1])[:3])\n',
      tests: 'kismiler = [kismi_sayim(p) for p in parcala(trips, 4)]\nassert sum(len(k) for k in kismiler) == 248, "4 parçanın kısmi sözlüklerinde toplam 248 anahtar olmalı (combiner etkisi)"\ns = birlestir(kismiler)\nassert len(s) == 62, "62 istasyonun hepsi sonuçta olmalı"\nassert s[12] == 4257 and s[9] == 4157, "En yoğun iki istasyon 12 (4257) ve 9 (4157) olmalı"\nassert sum(s.values()) == 116517, "Toplam adet yolculuk sayısına (116517) eşit olmalı"\nassert birlestir([{"a": 1}, {"a": 2, "b": 1}]) == {"a": 3, "b": 1}, "Aynı anahtarlar toplanmalı"\nassert birlestir([]) == {}, "Boş listede boş sözlük dönmeli"\n',
      hints: ['İki fonksiyon da aynı "sözlükte say" kalıbını kullanır: <code>d[k] = d.get(k, 0) + n</code>.', '<code>birlestir</code>\'de iç içe iki döngü: kısmi sözlükler ve onların <code>items()</code>\'ı.', 'Toplam kontrolü: <code>sum(sonuc.values())</code> yolculuk sayısına eşit olmalı.'],
      why: '116 bin kayıt yerine yalnız 248 özet satırı "ağdan" taşındı. Spark\'ın map-side combine (partial aggregation) adımı tam olarak budur; collections.Counter ile de yazılabilirdi (<code>sum(kismiler, Counter())</code>).'
    },
    {
      t: 'code',
      id: 'spark-dagitik-3',
      stage: 'Rehberli',
      diff: 2,
      needs: ['polars'],
      q: '<p>polars ile Spark DataFrame API\'sinin karşılığını yaz. <code>ilce_ozet(trips, stations)</code>: iki polars DataFrame alır; yolculukları <b>başlangıç</b> istasyonu üzerinden istasyonlarla birleştirir ve ilçe (<code>district</code>) başına <code>yolculuk</code> (satır sayısı) ve <code>ort_km</code> (<code>distance_km</code> ortalaması, 2 basamak) sütunlarını üretir. Sonuç <code>yolculuk</code>\'a göre azalan sıralı olmalı. Sütunlar: <code>district, yolculuk, ort_km</code>.</p>',
      guide: ['<code>trips.join(stations, left_on="start_station", right_on="station_id")</code> ile birleştir.', '<code>group_by("district")</code> ile grupla.', '<code>agg</code> içinde <code>pl.len().alias("yolculuk")</code> ve <code>pl.col("distance_km").mean().round(2).alias("ort_km")</code>.', '<code>sort("yolculuk", descending=True)</code> ile sırala ve döndür.'],
      example: 'import polars as pl\nsatis = pl.DataFrame({"urun": [1, 1, 2], "adet": [3, 5, 2]})\nurun = pl.DataFrame({"urun_id": [1, 2], "kategori": ["meyve", "sebze"]})\nprint(satis.join(urun, left_on="urun", right_on="urun_id")\n      .group_by("kategori").agg(pl.len().alias("satir"), pl.col("adet").sum())\n      .sort("satir", descending=True))\n',
      start: 'import polars as pl\nimport veri\n\ntrips = pl.read_csv(veri.yol("pedal_izmir", "bk_trips"))\nstations = pl.read_csv(veri.yol("pedal_izmir", "bk_stations"))\n\n\ndef ilce_ozet(trips, stations):\n    birlesik = trips  # TODO 1: stations ile başlangıç istasyonu üzerinden birleştir\n    # TODO 2: district\'e göre grupla, yolculuk ve ort_km hesapla\n    # TODO 3: yolculuk\'a göre azalan sırala\n    return birlesik\n',
      sol: 'import polars as pl\nimport veri\n\ntrips = pl.read_csv(veri.yol("pedal_izmir", "bk_trips"))\nstations = pl.read_csv(veri.yol("pedal_izmir", "bk_stations"))\n\n\ndef ilce_ozet(trips, stations):\n    return (trips.join(stations, left_on="start_station", right_on="station_id")\n            .group_by("district")\n            .agg(pl.len().alias("yolculuk"),\n                 pl.col("distance_km").mean().round(2).alias("ort_km"))\n            .sort("yolculuk", descending=True))\n\n\nprint(ilce_ozet(trips, stations).head(3))\n',
      tests: 'r = ilce_ozet(trips, stations)\nassert r.columns == ["district", "yolculuk", "ort_km"], "Sütunlar district, yolculuk, ort_km olmalı; gelen: " + str(r.columns)\nassert r.height == 10, "10 ilçe olmalı"\nassert r.row(0) == ("Konak", 21000, 3.93), "İlk satır (\\\'Konak\\\', 21000, 3.93) olmalı; gelen: " + str(r.row(0))\nassert r.row(1)[:2] == ("Alsancak", 20841), "İkinci sırada Alsancak (20841) olmalı"\nassert r.row(-1) == ("Balçova", 5139, 6.94), "Son satır Balçova olmalı: sıralama azalan mı?"\nassert r["yolculuk"].sum() == 116517, "Toplam yolculuk 116517 olmalı"\n',
      hints: ['Birleştirme anahtarlarının adları farklı: <code>left_on</code> ve <code>right_on</code>.', '<code>pl.len()</code> grup başına satır sayısını verir.', 'Zincirin sonu: <code>.sort("yolculuk", descending=True)</code>'],
      why: 'Bu zincir PySpark\'ta neredeyse aynıdır: <code>trips.join(stations, trips.start_station == stations.station_id).groupBy("district").agg(F.count("*").alias("yolculuk"), F.round(F.avg("distance_km"), 2).alias("ort_km")).orderBy(F.desc("yolculuk"))</code>. Spark\'ta istasyon tablosu küçük olduğu için otomatik broadcast edilirdi.'
    },
    {
      t: 'code',
      id: 'spark-dagitik-4',
      stage: 'Rehberli',
      diff: 2,
      needs: ['duckdb'],
      q: '<p>Spark SQL\'in pencere fonksiyonunu DuckDB ile kullan. <code>ilce_liderleri(t_yol, s_yol)</code> fonksiyonu, her ilçede <b>en çok yolculuğun başladığı</b> istasyonu bulsun. Dönüş: <code>(district, name, n)</code> demetlerinin listesi; <code>n</code>\'e göre azalan sıralı. Eşitlikte istasyon adı alfabetik önde olan seçilsin.</p>',
      guide: ['CTE\'de iki CSV\'yi <code>start_station = station_id</code> ile birleştirip <code>district, name</code> başına <code>COUNT(*) AS n</code> hesapla.', 'Dış sorguda <code>ROW_NUMBER() OVER (PARTITION BY district ORDER BY n DESC, name)</code> ile sıra numarası ver.', 'Sıra numarası 1 olanları <code>ORDER BY n DESC</code> ile al.', '<code>duckdb.sql(sorgu).fetchall()</code> ile listeyi döndür.'],
      example: 'import duckdb\nprint(duckdb.sql("""\n    SELECT magaza, urun, adet FROM (\n        SELECT *, ROW_NUMBER() OVER (PARTITION BY magaza ORDER BY adet DESC) AS sira\n        FROM (VALUES (\'A\', \'elma\', 5), (\'A\', \'armut\', 9), (\'B\', \'kiraz\', 3)) t(magaza, urun, adet))\n    WHERE sira = 1 ORDER BY adet DESC\n""").fetchall())\n',
      start: 'import duckdb\nimport veri\n\nt_yol = veri.yol("pedal_izmir", "bk_trips")\ns_yol = veri.yol("pedal_izmir", "bk_stations")\n\n\ndef ilce_liderleri(t_yol, s_yol):\n    sorgu = f"""\n    WITH s AS (\n        SELECT st.district, st.name, COUNT(*) AS n\n        FROM read_csv(\'{t_yol}\') t\n        JOIN read_csv(\'{s_yol}\') st ON t.start_station = st.station_id\n        GROUP BY st.district, st.name\n    )\n    SELECT district, name, n FROM s   -- TODO: ROW_NUMBER ile ilçe başına 1. istasyonu seç\n    ORDER BY n DESC\n    """\n    return duckdb.sql(sorgu).fetchall()\n',
      sol: 'import duckdb\nimport veri\n\nt_yol = veri.yol("pedal_izmir", "bk_trips")\ns_yol = veri.yol("pedal_izmir", "bk_stations")\n\n\ndef ilce_liderleri(t_yol, s_yol):\n    sorgu = f"""\n    WITH s AS (\n        SELECT st.district, st.name, COUNT(*) AS n\n        FROM read_csv(\'{t_yol}\') t\n        JOIN read_csv(\'{s_yol}\') st ON t.start_station = st.station_id\n        GROUP BY st.district, st.name\n    )\n    SELECT district, name, n FROM (\n        SELECT *, ROW_NUMBER() OVER (PARTITION BY district ORDER BY n DESC, name) AS sira\n        FROM s\n    )\n    WHERE sira = 1\n    ORDER BY n DESC\n    """\n    return duckdb.sql(sorgu).fetchall()\n\n\nfor satir in ilce_liderleri(t_yol, s_yol)[:3]:\n    print(satir)\n',
      tests: 'r = ilce_liderleri(t_yol, s_yol)\nassert len(r) == 10, "Her ilçeden tek satır: 10 satır olmalı; gelen " + str(len(r))\nassert r[0] == ("Alsancak", "Alsancak Çarşı", 4257), "İlk satır Alsancak Çarşı (4257) olmalı; gelen " + str(r[0])\nassert r[1] == ("Karşıyaka", "Karşıyaka Meydan", 3318), "İkinci satır Karşıyaka Meydan (3318) olmalı"\nassert ("Konak", "Konak Meydan", 3274) in r, "Konak\\\'ın lideri Konak Meydan (3274) olmalı"\nassert r[-1] == ("Buca", "Buca Meydan", 1390), "Son satır Buca Meydan (1390) olmalı"\n',
      hints: ['Pencere fonksiyonu WHERE içinde kullanılamaz; önce alt sorguda sıra sütunu üret, sonra dışarıda süz.', '<code>ROW_NUMBER() OVER (PARTITION BY district ORDER BY n DESC, name) AS sira</code>'],
      why: '"Her grubun en iyisi" kalıbı (top-1 per group) ROW_NUMBER ile yazılır. Spark\'ta PARTITION BY district bir shuffle\'dır; Alsancak\'ın lideri Konak\'ınkinden fazla yolculuk alsa da ilçe içi sıralama birbirinden bağımsızdır.'
    },
    {
      t: 'code',
      id: 'spark-dagitik-5',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Shuffle\'ın bedelini ölç. Veri başta dosya bloklarına göre ardışık parçalara bölünmüş (<code>parcala</code>). <code>groupBy(anahtar)</code> için her kaydın <code>kayit[anahtar] % n</code> numaralı partition\'a gitmesi gerekiyor. <code>tasinan_kayit(parcalar, anahtar)</code> fonksiyonu, <b>bulunduğu partition\'dan başka bir partition\'a taşınması gereken</b> kayıt sayısını döndürsün (<code>n = len(parcalar)</code>).</p>',
      start: 'import veri\n\ntrips = veri.kayitlar("pedal_izmir", "bk_trips")\n\n\ndef parcala(kayitlar, n):\n    boy = -(-len(kayitlar) // n)\n    return [kayitlar[i * boy:(i + 1) * boy] for i in range(n)]\n\n\ndef tasinan_kayit(parcalar, anahtar):\n    pass\n',
      sol: 'import veri\n\ntrips = veri.kayitlar("pedal_izmir", "bk_trips")\n\n\ndef parcala(kayitlar, n):\n    boy = -(-len(kayitlar) // n)\n    return [kayitlar[i * boy:(i + 1) * boy] for i in range(n)]\n\n\ndef tasinan_kayit(parcalar, anahtar):\n    n = len(parcalar)\n    return sum(1 for i, parca in enumerate(parcalar)\n               for k in parca if k[anahtar] % n != i)\n\n\np = parcala(trips, 4)\nprint(tasinan_kayit(p, "start_station"), "/", len(trips))\n',
      tests: 'p = parcala(trips, 4)\nr = tasinan_kayit(p, "start_station")\nassert r == 87374, "4 parçada 87374 kayıt yer değiştirmeli; gelen " + str(r)\nassert tasinan_kayit([[{"k": 0}, {"k": 1}], [{"k": 3}]], "k") == 1, "Yalnız {k:1} partition 0\\\'dan 1\\\'e taşınır"\nassert tasinan_kayit([[{"k": 2}]], "k") == 0, "Tek partition\\\'da hiçbir şey taşınmaz"\n',
      hints: ['<code>enumerate(parcalar)</code> sana kaydın şu anki partition numarasını verir.', 'Hedef partition <code>k[anahtar] % n</code>; mevcut numaradan farklıysa say.'],
      why: 'Rastgele dağılmış veride kayıtların yaklaşık (n-1)/n\'i yer değiştirir: 4 partition\'da %75. Combiner olmadan bu 87 bin kayıt diske yazılıp ağdan taşınırdı. Veri zaten anahtara göre bölümlenmiş olsaydı (ör. aynı anahtarla <code>repartition</code> yapılmış ya da bucket\'lanmış tablo) shuffle sıfır olurdu.'
    },
    {
      t: 'code',
      id: 'spark-dagitik-6',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Broadcast join\'i elle yaz. <code>ilceler_arasi(trips, stations, k)</code>: istasyon tablosundan <code>{station_id: district}</code> sözlüğü kur (yayınlanan küçük tablo), yolculukları gezerek <b>farklı ilçeler arasındaki</b> akışları <code>(baslangic_ilce, bitis_ilce)</code> çiftine göre say ve en çok olan <code>k</code> akışı <code>((bas, bit), adet)</code> listesi olarak döndür (adede göre azalan). <code>end_station</code> değeri boş (None) olan yolculukları atla.</p>',
      start: 'import veri\n\ntrips = veri.kayitlar("pedal_izmir", "bk_trips")\n\nstations = veri.kayitlar("pedal_izmir", "bk_stations")\n\n\ndef ilceler_arasi(trips, stations, k):\n    pass\n',
      sol: 'import veri\n\ntrips = veri.kayitlar("pedal_izmir", "bk_trips")\n\nstations = veri.kayitlar("pedal_izmir", "bk_stations")\nfrom collections import Counter\n\n\ndef ilceler_arasi(trips, stations, k):\n    ilce = {s["station_id"]: s["district"] for s in stations}\n    akis = Counter()\n    for t in trips:\n        if t["end_station"] is None:\n            continue\n        bas, bit = ilce[t["start_station"]], ilce[t["end_station"]]\n        if bas != bit:\n            akis[(bas, bit)] += 1\n    return akis.most_common(k)\n\n\nprint(ilceler_arasi(trips, stations, 3))\n',
      tests: 'r = ilceler_arasi(trips, stations, 4)\nassert r[0] == (("Konak", "Alsancak"), 2025), "En yoğun akış Konak→Alsancak (2025) olmalı; gelen " + str(r[:1])\nassert r[1] == (("Alsancak", "Konak"), 2024), "İkinci akış Alsancak→Konak (2024) olmalı"\nassert [x[0] for x in r[2:]] == [("Karşıyaka", "Konak"), ("Konak", "Karşıyaka")], "3. ve 4. akışlar Karşıyaka↔Konak olmalı"\nassert all(a != b for (a, b), _ in ilceler_arasi(trips, stations, 20)), "Aynı ilçe içindeki yolculuklar sayılmamalı"\n',
      hints: ['Önce küçük tabloyu sözlüğe çevir; büyük tabloyu tek geçişte gez.', 'Boş bitiş istasyonu <code>None</code> gelir; sözlükte aramadan önce atla.', '<code>Counter.most_common(k)</code> istenen biçimi verir.'],
      why: 'Her yürütücü 62 satırlık sözlüğün kopyasını alır, 116 bin satırlık tablo hiç taşınmaz. 316 yolculuğun bitiş istasyonu boştur (bisiklet teslim edilmemiş); dağıtık işlerde tek bir kirli satır bütün işi KeyError ile düşürebilir.'
    },
    {
      t: 'code',
      id: 'spark-dagitik-7',
      stage: 'Kendin yaz',
      diff: 3,
      q: '<p>Salting ile çarpıklığı kır. <code>tuzlu_sayim(kayitlar, anahtar, sicaklar, n_tuz)</code> iki aşamalı sayım yapsın:</p><ol><li>Aşama 1: her kayıt için tuzlu anahtar <code>(kayit[anahtar], tuz)</code>. Anahtar <code>sicaklar</code> kümesindeyse <code>tuz = kayit["trip_id"] % n_tuz</code>, değilse <code>tuz = 0</code>. Tuzlu anahtarlara göre say.</li><li>Aşama 2: tuzu at, aynı anahtarın sayılarını topla.</li></ol><p>Dönüş: <code>(sonuc_sozlugu, asama1_en_buyuk_grup)</code>.</p>',
      start: 'import veri\n\ntrips = veri.kayitlar("pedal_izmir", "bk_trips")\n\n\ndef tuzlu_sayim(kayitlar, anahtar, sicaklar, n_tuz):\n    pass\n',
      sol: 'import veri\n\ntrips = veri.kayitlar("pedal_izmir", "bk_trips")\n\n\n\ndef tuzlu_sayim(kayitlar, anahtar, sicaklar, n_tuz):\n    asama1 = {}\n    for k in kayitlar:\n        a = k[anahtar]\n        tuz = k["trip_id"] % n_tuz if a in sicaklar else 0\n        asama1[(a, tuz)] = asama1.get((a, tuz), 0) + 1\n    sonuc = {}\n    for (a, _), adet in asama1.items():\n        sonuc[a] = sonuc.get(a, 0) + adet\n    return sonuc, max(asama1.values(), default=0)\n\n\ns, en_buyuk = tuzlu_sayim(trips, "start_station", {12, 9}, 4)\nprint(s[12], s[9], en_buyuk)\n',
      tests: 's, en_buyuk = tuzlu_sayim(trips, "start_station", {12, 9}, 4)\nassert s[12] == 4257 and s[9] == 4157, "Tuz atıldıktan sonra sayılar tuzsuz sayımla aynı olmalı"\nassert len(s) == 62 and sum(s.values()) == 116517, "Bütün istasyonlar ve toplam korunmalı"\nassert en_buyuk == 3656, "Tuzlamadan sonra en büyük grup 3656 (istasyon 11) olmalı; gelen " + str(en_buyuk)\ns2, b2 = tuzlu_sayim([{"k": 1, "trip_id": i} for i in range(10)], "k", {1}, 5)\nassert s2 == {1: 10} and b2 == 2, "10 kayıt 5 tuza bölününce her grupta 2 kayıt kalmalı"\nassert tuzlu_sayim([], "k", set(), 3) == ({}, 0), "Boş girdide ({}, 0) dönmeli"\n',
      hints: ['Aşama 1\'in anahtarı bir demettir: <code>(anahtar, tuz)</code>.', 'Aşama 2\'de demeti açarken tuzu yok say: <code>for (a, _), adet in asama1.items()</code>.', 'Boş girdi için <code>max(..., default=0)</code>.'],
      why: 'En sıcak grup 4257\'den 3656\'ya indi; artık en büyük görev sıcak anahtar değil sıradaki istasyon. Gerçek hayatta çarpıklık 1\'e 1000 olduğunda salting görev süresini dakikalardan saniyelere indirir. Bedeli ikinci bir toplama aşamasıdır.'
    },
    {
      t: 'code',
      id: 'spark-dagitik-8',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p><code>partitionBy</code> ile yazılan veri gölünün klasör yapısını çıkar. <code>bolum_plani(kayitlar)</code>: her yolculuğun <code>started_at</code> değerinden hive tarzı yolu <code>"yil=2024/ay=06"</code> biçiminde üret ve <b>yol → kayıt sayısı</b> sözlüğü döndür. Ardından <code>budanmis(plan, ay)</code>: <code>WHERE ay = ...</code> filtresinde okunacak kayıt sayısını döndürsün (<code>ay</code> <code>"07"</code> gibi iki haneli metin; eşleşen bölüm yoksa 0).</p>',
      start: 'import veri\n\ntrips = veri.kayitlar("pedal_izmir", "bk_trips")\n\n\ndef bolum_plani(kayitlar):\n    pass\n\n\ndef budanmis(plan, ay):\n    pass\n',
      sol: 'import veri\n\ntrips = veri.kayitlar("pedal_izmir", "bk_trips")\n\n\n\ndef bolum_plani(kayitlar):\n    plan = {}\n    for t in kayitlar:\n        yil, ay = t["started_at"][:4], t["started_at"][5:7]\n        yol = f"yil={yil}/ay={ay}"\n        plan[yol] = plan.get(yol, 0) + 1\n    return plan\n\n\ndef budanmis(plan, ay):\n    return sum(n for yol, n in plan.items() if yol.endswith(f"/ay={ay}"))\n\n\nplan = bolum_plani(trips)\nprint(plan)\nprint("Temmuz sorgusu okur:", budanmis(plan, "07"), "/", len(trips))\n',
      tests: 'plan = bolum_plani(trips)\nassert plan == {"yil=2024/ay=06": 37906, "yil=2024/ay=07": 39222, "yil=2024/ay=08": 39389}, "Üç bölüm ve sayıları tutmuyor: " + str(plan)\nassert budanmis(plan, "07") == 39222, "Temmuz filtresi yalnız ay=07 bölümünü okumalı"\nassert budanmis(plan, "12") == 0, "Olmayan bölüm için 0 dönmeli"\nassert bolum_plani([{"started_at": "2025-01-03 10:00:00"}]) == {"yil=2025/ay=01": 1}, "Ay iki haneli yazılmalı"\n',
      hints: ['Tarih metninin <code>[:4]</code> ve <code>[5:7]</code> dilimleri yıl ve ayı verir.', '<code>budanmis</code>: <code>yol.endswith(f"/ay={ay}")</code> olan bölümlerin sayılarını topla.'],
      why: 'Temmuz sorgusu 116 bin yerine 39 bin satır okur: bölüm budama. Spark, DuckDB, Athena ve BigQuery hive tarzı klasör adlarını tanıyıp filtreye göre klasör atlar. Bölüm sütunu az değerli (ay, gün) seçilmelidir; yüksek kardinaliteli sütun "küçük dosya" felaketi yaratır.'
    },
    {
      t: 'code',
      id: 'spark-dagitik-9',
      stage: 'Hata avı',
      diff: 2,
      kind: 'bug',
      q: '<p>Ilgaz Bank\'ın işlem tablosu (<code>bank_txns</code>) kanala göre partition\'lanmış. Ekip ortalama işlem tutarını (mutlak değer) dağıtık hesaplamak için her partition\'ın ortalamasını alıp bunların ortalamasını almış. Sonuç pandas\'taki <code>abs().mean()</code> ile tutmuyor. <b>Hatayı bul ve düzelt</b>: <code>dagitik_ortalama(bolumler)</code> doğru genel ortalamayı (2 basamak) döndürsün.</p>',
      start: 'import veri\n\ntxns = veri.kayitlar("ilgaz_bank", "bank_txns")\nbolumler = {}\nfor t in txns:\n    bolumler.setdefault(t["channel"], []).append(abs(t["amount"]))\n\n\ndef dagitik_ortalama(bolumler):\n    kismi = [sum(b) / len(b) for b in bolumler.values()]\n    return round(sum(kismi) / len(kismi), 2)\n\n\nprint(dagitik_ortalama(bolumler))\n',
      sol: 'import veri\n\ntxns = veri.kayitlar("ilgaz_bank", "bank_txns")\nbolumler = {}\nfor t in txns:\n    bolumler.setdefault(t["channel"], []).append(abs(t["amount"]))\n\n\ndef dagitik_ortalama(bolumler):\n    kismi = [(sum(b), len(b)) for b in bolumler.values()]\n    toplam = sum(s for s, _ in kismi)\n    adet = sum(n for _, n in kismi)\n    return round(toplam / adet, 2)\n\n\nprint(dagitik_ortalama(bolumler))\n',
      tests: 'r = dagitik_ortalama(bolumler)\nassert r == 7506.73, "Genel ortalama 7506.73 olmalı (ortalamaların ortalaması 6528.9 verir); gelen " + str(r)\nassert dagitik_ortalama({"a": [10, 10, 10], "b": [40]}) == 17.5, "3 tane 10 ve 1 tane 40\\\'ın ortalaması 17.5\\\'tir, 25 değil"\n',
      hints: ['Partition boyutları çok farklı: internet 14.802, şube 1.224 işlem.', 'Her partition\'dan ortalama değil (toplam, adet) çifti taşı.', 'Genel ortalama = toplamların toplamı / adetlerin toplamı.'],
      why: 'Ortalamaların ortalaması, partition boyutları eşit değilse yanlıştır: 1.224 işlemlik şube kanalı 14.802 işlemlik internet kanalıyla aynı ağırlığı alır. Spark avg() fonksiyonunu kısmi olarak (sum, count) taşıyarak hesaplar. Aynı kural medyan için daha da sert işler: medyan birleştirilebilir değildir, yaklaşık algoritma (percentile_approx) gerekir.'
    },
    {
      t: 'code',
      id: 'spark-dagitik-10',
      stage: 'Hata avı',
      diff: 2,
      kind: 'bug',
      q: '<p>Gece çalışan "ilçe denge" işi <code>KeyError: None</code> ile düştü; yeniden denemeler de aynı yerde patladı. <code>ilce_dengesi(trips, stations)</code> her ilçe için <code>çıkan - gelen</code> yolculuk farkını hesaplıyor (istasyon tablosu broadcast sözlüğü olarak kullanılıyor). <b>Hatayı bul ve düzelt</b>: bitiş istasyonu boş (None) olan yolculuk yalnız çıkış olarak sayılsın, gelen tarafına eklenmesin. Dönüş: <code>{ilce: fark}</code>.</p>',
      start: 'import veri\n\ntrips = veri.kayitlar("pedal_izmir", "bk_trips")\n\nstations = veri.kayitlar("pedal_izmir", "bk_stations")\n\n\ndef ilce_dengesi(trips, stations):\n    ilce = {s["station_id"]: s["district"] for s in stations}\n    fark = {}\n    for t in trips:\n        bas = ilce[t["start_station"]]\n        bit = ilce[t["end_station"]]\n        fark[bas] = fark.get(bas, 0) + 1\n        fark[bit] = fark.get(bit, 0) - 1\n    return fark\n\n\nprint(ilce_dengesi(trips, stations))\n',
      sol: 'import veri\n\ntrips = veri.kayitlar("pedal_izmir", "bk_trips")\n\nstations = veri.kayitlar("pedal_izmir", "bk_stations")\n\n\ndef ilce_dengesi(trips, stations):\n    ilce = {s["station_id"]: s["district"] for s in stations}\n    fark = {}\n    for t in trips:\n        bas = ilce[t["start_station"]]\n        fark[bas] = fark.get(bas, 0) + 1\n        if t["end_station"] is None:\n            continue\n        bit = ilce[t["end_station"]]\n        fark[bit] = fark.get(bit, 0) - 1\n    return fark\n\n\nprint(ilce_dengesi(trips, stations))\n',
      tests: 'd = ilce_dengesi(trips, stations)\nassert d == {"Buca": 11, "Karşıyaka": 16, "Göztepe": 139, "Konak": 72, "Alsancak": 7, "Narlıdere": 2, "Bostanlı": 86, "Balçova": -9, "Bornova": 29, "Bayraklı": -37}, "İlçe farkları tutmuyor: " + str(d)\nassert sum(d.values()) == 316, "Farkların toplamı bitişi boş 316 yolculuğa eşit olmalı"\nassert None not in d, "Sözlükte None anahtarı olmamalı"\n',
      hints: ['Hata hangi satırda? <code>ilce[None]</code> sözlükte yok.', 'Çıkışı her zaman say; bitiş None ise gelen kısmını atla (<code>continue</code>).', 'Kontrol: bütün farkların toplamı, bitişi boş yolculuk sayısına (316) eşit olmalı.'],
      why: 'Dağıtık işlerde kirli tek bir satır, saatler süren işi düşürür ve yeniden denemeler aynı satırda tekrar patlar. Boş değerleri baştan ele almak (Spark\'ta <code>when(col.isNull(), ...)</code> ya da ayrı bir karantina tablosuna yazmak) bu sınıf hataları önler. Farkların toplamı = teslim edilmemiş bisiklet sayısı: güzel bir tutarlılık kontrolü.'
    },
    {
      t: 'code',
      id: 'spark-dagitik-11',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Sort-merge join\'i kendin yaz. <code>sort_merge_join(sol, sag, anahtar)</code>: iki sözlük listesini önce anahtara göre sırala, sonra iki işaretçiyle (fermuar gibi) ilerleyerek <b>iç birleştirme</b> (inner join) yap. Her eşleşmede iki sözlüğün birleşimini (<code>{**l, **r}</code>) üret. Aynı anahtar <b>iki tarafta da</b> birden çok kez geçebilir (çoka çok); her kombinasyon üretilmeli. Sonuç anahtara göre artan sırada olmalı. Sözlükle arama (hash join) kullanma.</p><p>Test, ilk 2.000 yolculuğu bisiklet tablosuyla (<code>bk_bikes</code>) birleştirip modellere göre sayacak.</p>',
      start: 'import veri\n\ntrips = veri.kayitlar("pedal_izmir", "bk_trips")[:2000]\nbikes = veri.kayitlar("pedal_izmir", "bk_bikes")\n\n\ndef sort_merge_join(sol, sag, anahtar):\n    pass\n',
      sol: 'import veri\n\ntrips = veri.kayitlar("pedal_izmir", "bk_trips")[:2000]\nbikes = veri.kayitlar("pedal_izmir", "bk_bikes")\n\n\ndef sort_merge_join(sol, sag, anahtar):\n    a = sorted(sol, key=lambda x: x[anahtar])\n    b = sorted(sag, key=lambda x: x[anahtar])\n    i = j = 0\n    sonuc = []\n    while i < len(a) and j < len(b):\n        ka, kb = a[i][anahtar], b[j][anahtar]\n        if ka < kb:\n            i += 1\n        elif ka > kb:\n            j += 1\n        else:\n            i2 = i\n            while i2 < len(a) and a[i2][anahtar] == ka:\n                i2 += 1\n            j2 = j\n            while j2 < len(b) and b[j2][anahtar] == ka:\n                j2 += 1\n            for l in a[i:i2]:\n                for r in b[j:j2]:\n                    sonuc.append({**l, **r})\n            i, j = i2, j2\n    return sonuc\n\n\nj = sort_merge_join(trips, bikes, "bike_id")\nfrom collections import Counter\nprint(len(j), Counter(x["model"] for x in j))\n',
      tests: 'from collections import Counter\nj = sort_merge_join(trips, bikes, "bike_id")\nassert len(j) == 2000, "Her yolculuğun bisikleti tabloda var: 2000 satır olmalı; gelen " + str(len(j))\nassert Counter(x["model"] for x in j) == {"klasik": 1485, "elektrikli": 515}, "Model dağılımı klasik 1485, elektrikli 515 olmalı"\nassert [x["bike_id"] for x in j] == sorted(x["bike_id"] for x in j), "Sonuç anahtara göre sıralı olmalı"\ns = [{"k": 1, "a": "x"}, {"k": 2, "a": "y"}, {"k": 2, "a": "z"}, {"k": 5, "a": "w"}]\nr = [{"k": 2, "b": 1}, {"k": 2, "b": 2}, {"k": 3, "b": 3}, {"k": 5, "b": 4}]\nout = sort_merge_join(s, r, "k")\nassert len(out) == 5, "Çoka çok eşleşmede 2x2 + 1 = 5 satır olmalı; gelen " + str(len(out))\nassert {(x["a"], x["b"]) for x in out} == {("y", 1), ("y", 2), ("z", 1), ("z", 2), ("w", 4)}, "Bütün kombinasyonlar üretilmeli"\nassert sort_merge_join([], r, "k") == [], "Boş tarafla sonuç boş olmalı"\nassert "dict(" not in __source__ and "{x[anahtar]" not in __source__, "Sözlükle arama (hash join) değil, sıralı birleştirme yaz"\n',
      hints: ['İki işaretçi <code>i</code> ve <code>j</code>: küçük olan anahtarı ilerlet.', 'Anahtarlar eşitse iki tarafta da o anahtarın bittiği yeri (<code>i2</code>, <code>j2</code>) bul ve iki dilimin çarpımını üret.', 'Sonra <code>i, j = i2, j2</code> ile iki bloğu da geç.'],
      why: 'Spark\'ta iki büyük tablo birleşirken iki taraf da anahtara göre shuffle edilip partition içinde sıralanır, sonra bu fermuar algoritması çalışır. Sıralama O(n log n), birleştirme doğrusal; bellekte tek tarafın hash tablosunu tutmak gerekmez, bu yüzden belleğe sığmayan tablolarda da çalışır.'
    },
    {
      t: 'code',
      id: 'spark-dagitik-12',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Dağıtık "en yoğun k rota". <code>en_yogun_rotalar(bolumler, k)</code>: <code>bolumler</code> yolculuk listelerinin listesidir (ardışık bloklar). Her partition\'da <code>(start_station, end_station)</code> rotalarını say (başlangıç ve bitişi aynı olan ve bitişi boş olan yolculukları atla), kısmi sayıları birleştir ve en yoğun <code>k</code> rotayı <code>(rota, adet)</code> listesi olarak döndür. Sıralama: adede göre azalan, eşitlikte rota demetine göre artan.</p><p>Dikkat: her partition\'ın kendi ilk k\'sını alıp birleştirmek <b>yanlış</b> sonuç verebilir; önce tam birleştir, sonra seç.</p>',
      start: 'import veri\n\ntrips = veri.kayitlar("pedal_izmir", "bk_trips")\n\n\ndef parcala(kayitlar, n):\n    boy = -(-len(kayitlar) // n)\n    return [kayitlar[i * boy:(i + 1) * boy] for i in range(n)]\n\n\ndef en_yogun_rotalar(bolumler, k):\n    pass\n',
      sol: 'import veri\n\ntrips = veri.kayitlar("pedal_izmir", "bk_trips")\n\nfrom collections import Counter\n\n\ndef parcala(kayitlar, n):\n    boy = -(-len(kayitlar) // n)\n    return [kayitlar[i * boy:(i + 1) * boy] for i in range(n)]\n\n\ndef en_yogun_rotalar(bolumler, k):\n    toplam = Counter()\n    for b in bolumler:\n        kismi = Counter((t["start_station"], t["end_station"]) for t in b\n                        if t["end_station"] is not None and t["start_station"] != t["end_station"])\n        toplam.update(kismi)\n    return sorted(toplam.items(), key=lambda x: (-x[1], x[0]))[:k]\n\n\nprint(en_yogun_rotalar(parcala(trips, 8), 4))\n',
      tests: 'r = en_yogun_rotalar(parcala(trips, 8), 6)\nassert r[:4] == [((12, 9), 338), ((9, 12), 329), ((12, 11), 321), ((9, 10), 320)], "İlk 4 rota tutmuyor; gelen " + str(r[:4])\nassert r[4:] == [((43, 45), 314), ((43, 44), 310)], "5. ve 6. rotalar (43,45) ve (43,44) olmalı"\nassert r == en_yogun_rotalar(parcala(trips, 3), 6), "Sonuç partition sayısından bağımsız olmalı"\nb = [[{"start_station": 1, "end_station": 2}] * 3 + [{"start_station": 3, "end_station": 4}] * 2,\n     [{"start_station": 5, "end_station": 6}] * 3 + [{"start_station": 3, "end_station": 4}] * 2]\nassert en_yogun_rotalar(b, 1) == [((3, 4), 4)], "Yerel ilk-1\\\'leri birleştirmek (1,2) ya da (5,6) verir; doğrusu (3,4): 4"\nassert en_yogun_rotalar(b, 3) == [((3, 4), 4), ((1, 2), 3), ((5, 6), 3)], "Eşitlikte rota demeti artan sırada olmalı"\n',
      hints: ['Her partition için bir Counter, sonra hepsini tek Counter\'da topla.', 'Seçimi en sonda yap: <code>sorted(toplam.items(), key=lambda x: (-x[1], x[0]))[:k]</code>.', '<code>most_common</code> eşitlikte ekleme sırasını korur; belirli sıralama için kendi anahtarını ver.'],
      why: 'Yerel top-k\'ların birleşimi ancak veri anahtara göre bölümlenmişse doğrudur; ardışık bloklarda bir rota her partition\'da 4. sırada kalıp toplamda 1. olabilir. Spark\'ta <code>groupBy(...).count().orderBy(desc).limit(k)</code> önce tam toplama yapar, sonra her partition\'dan ilk k\'yı alıp sürücüde birleştirir (TakeOrderedAndProject).'
    },
    {
      t: 'code',
      id: 'spark-dagitik-13',
      stage: 'Mini proje',
      diff: 3,
      needs: ['duckdb'],
      q: '<p><b>Pedal İzmir aylık kıyı raporu.</b> Yönetim, sahil (<code>is_coastal = 1</code>) istasyonlarından başlayan yolculukların aylara göre payını ve gelirini istiyor. DuckDB ile <code>aylik_rapor(t_yol, s_yol)</code> yaz. Her ay için şu sütunlar (bu sırayla):</p><ul><li><code>ay</code>: <code>"2024-06"</code> biçiminde (started_at\'in ilk 7 karakteri)</li><li><code>yolculuk</code>: o ayın toplam yolculuk sayısı</li><li><code>kiyi_payi</code>: sahil istasyonundan başlayanların yüzdesi (1 basamak)</li><li><code>kiyi_gelir</code>: sahil istasyonundan başlayanların <code>fare</code> toplamı (2 basamak)</li></ul><p>Dönüş: aya göre artan sıralı demet listesi. Ardından <code>en_iyi_ay(rapor)</code>: kıyı payı en yüksek ayı döndürsün.</p>',
      start: 'import duckdb\nimport veri\n\nt_yol = veri.yol("pedal_izmir", "bk_trips")\ns_yol = veri.yol("pedal_izmir", "bk_stations")\n\n\ndef aylik_rapor(t_yol, s_yol):\n    pass\n\n\ndef en_iyi_ay(rapor):\n    pass\n',
      sol: 'import duckdb\nimport veri\n\nt_yol = veri.yol("pedal_izmir", "bk_trips")\ns_yol = veri.yol("pedal_izmir", "bk_stations")\n\n\ndef aylik_rapor(t_yol, s_yol):\n    sorgu = f"""\n    SELECT substr(CAST(t.started_at AS VARCHAR), 1, 7) AS ay,\n           COUNT(*) AS yolculuk,\n           ROUND(100.0 * SUM(CASE WHEN s.is_coastal = 1 THEN 1 ELSE 0 END) / COUNT(*), 1) AS kiyi_payi,\n           ROUND(SUM(CASE WHEN s.is_coastal = 1 THEN t.fare ELSE 0 END), 2) AS kiyi_gelir\n    FROM read_csv(\'{t_yol}\') t\n    JOIN read_csv(\'{s_yol}\') s ON t.start_station = s.station_id\n    GROUP BY ay\n    ORDER BY ay\n    """\n    return duckdb.sql(sorgu).fetchall()\n\n\ndef en_iyi_ay(rapor):\n    return max(rapor, key=lambda r: r[2])[0]\n\n\nrapor = aylik_rapor(t_yol, s_yol)\nfor satir in rapor:\n    print(satir)\nprint("Kıyı payı en yüksek ay:", en_iyi_ay(rapor))\n',
      tests: 'r = aylik_rapor(t_yol, s_yol)\nassert len(r) == 3, "Üç ay olmalı (Haziran-Ağustos 2024)"\nassert r[0] == ("2024-06", 37906, 53.2, 634703.14), "Haziran satırı tutmuyor: " + str(r[0])\nassert r[1] == ("2024-07", 39222, 53.4, 661244.22), "Temmuz satırı tutmuyor: " + str(r[1])\nassert r[2] == ("2024-08", 39389, 53.5, 662771.18), "Ağustos satırı tutmuyor: " + str(r[2])\nassert en_iyi_ay(r) == "2024-08", "Kıyı payı en yüksek ay 2024-08 olmalı"\nassert en_iyi_ay([("2025-01", 10, 70.0, 1.0), ("2025-02", 10, 20.0, 1.0)]) == "2025-01", "en_iyi_ay kıyı payına (3. sütun) bakmalı"\n',
      hints: ['DuckDB CSV\'deki tarih sütununu TIMESTAMP okur; metne çevirip ilk 7 karakteri al: <code>substr(CAST(started_at AS VARCHAR), 1, 7)</code>.', 'Koşullu sayım ve toplam: <code>SUM(CASE WHEN s.is_coastal = 1 THEN ... ELSE 0 END)</code>.', 'Yüzde için tamsayı bölmesinden kaçın: <code>100.0 * ...</code>'],
      why: 'Bu sorgu Spark SQL\'de değişmeden çalışır (<code>substr</code>, <code>CASE WHEN</code>, <code>ROUND</code> ortak). Gerçek bir gölde aylık partition\'lar sayesinde her ay ayrı klasörden okunur; istasyon tablosu broadcast edilir; tek shuffle <code>GROUP BY ay</code>\'dır.'
    }
  ],
  faq: [
    {
      q: 'Spark öğrenmek için bir küme kurmam gerekiyor mu?',
      a: 'Hayır. <code>pip install pyspark</code> ve Java 17 ile <code>local[*]</code> modunda tek makinede bütün API\'yi çalıştırabilirsin. Databricks Free Edition ve Colab da kurulumsuz deneme ortamı sunar. Küme yalnız veri büyüdüğünde gerekir; kod aynı kalır.'
    },
    {
      q: 'PySpark mı, Scala Spark mı?',
      a: 'DataFrame ve SQL API\'lerinde ikisi de aynı iyileştiriciye gider, performans neredeyse aynıdır. Fark Python UDF\'lerinde çıkar; hazır fonksiyonlar ve pandas UDF kullandıkça PySpark yeterlidir. Veri mühendisi ilanlarının çoğu PySpark ister.'
    },
    {
      q: 'pandas API on Spark (pyspark.pandas) nedir?',
      a: 'pandas sözdizimini Spark üzerinde çalıştıran katmandır (eski adı Koalas). Geçişi kolaylaştırır ama her pandas işlemi dağıtık dünyada ucuz değildir (ör. satır sırasına bağlı işlemler). Yeni kodda Spark DataFrame API\'sini öğrenmek uzun vadede daha sağlamdır.'
    },
    {
      q: 'Spark yerine DuckDB yeterli olur mu?',
      a: 'Veri tek makinenin diskine sığıyorsa (yüzlerce GB\'a kadar) çoğu zaman evet, hatta daha hızlıdır. Spark; çok TB\'lık veri, çok sayıda eşzamanlı iş, hata toleransı ve kurumsal göl yönetişimi gerektiğinde değerlidir.'
    },
    {
      q: 'repartition ile coalesce farkı nedir?',
      a: 'repartition(n) tam shuffle yapar ve partition sayısını artırabilir ya da azaltabilir, dağılımı dengeler. coalesce(n) yalnız azaltır ve komşu partition\'ları shuffle olmadan birleştirir; ucuzdur ama dengesiz partition bırakabilir. Yazmadan önce dosya sayısını azaltmak için genelde coalesce yeterlidir.'
    }
  ],
  mistakes: [
    {
      bad: 'sonuc = df.groupBy("sehir").count().collect()  # 50 milyon satır sürücüye',
      good: 'df.groupBy("sehir").count().write.parquet("s3://gol/sehir_sayim/")',
      why: 'collect bütün sonucu sürücünün belleğine çeker; büyük sonuçlar göle yazılmalı, sürücüye yalnız küçük özetler gelmeli.'
    },
    {
      bad: 'ort = sum(b_ort for b_ort in partition_ortalamalari) / len(partition_ortalamalari)',
      good: 'ort = sum(toplamlar) / sum(adetler)',
      why: 'Ortalamaların ortalaması partition boyutları eşit değilse yanlıştır; kısmi sonuç olarak (toplam, adet) taşınmalı.'
    },
    {
      bad: '@F.udf("double")\ndef kdv(x):\n    return x * 1.2\ndf.select(kdv("fare"))',
      good: 'df.select(F.col("fare") * 1.2)',
      why: 'Python UDF her satırı JVM ile Python arasında taşır ve iyileştiricinin önünü kapatır; hazır ifade ya da pandas UDF kullan.'
    },
    {
      bad: 'df.write.partitionBy("musteri_id").parquet(yol)',
      good: 'df.write.partitionBy("ay").parquet(yol)',
      why: 'Yüksek kardinaliteli sütunla bölümlemek milyonlarca küçük dosya üretir; az değerli ve filtrede sık kullanılan sütun seç.'
    },
    {
      bad: 'buyuk.join(kucuk_boyut, "id")  # boyut tablosu 5 MB ama istatistik yok',
      good: 'buyuk.join(broadcast(kucuk_boyut), "id")',
      why: 'Spark tablo boyutunu bilemezse sort-merge join seçip büyük tabloyu shuffle eder; küçük tabloyu açıkça broadcast etmek shuffle\'ı kaldırır.'
    }
  ]
});
})(window);
