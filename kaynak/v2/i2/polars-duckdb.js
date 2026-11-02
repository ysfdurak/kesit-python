/* Kesit Python — ileri: polars-duckdb */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push({
  id: 'polars-duckdb',
  lv: 'ileri',
  mod: 'Veri Bilimi Araçları',
  min: 55,
  needs: ['pandas', 'polars', 'duckdb', 'pyarrow'],
  title: 'Büyük veri araçları: polars, DuckDB, Parquet ve PySpark',
  sum: 'pandas\'ın bellek ve tek çekirdek sınırını aşarsın: chunksize ile parçalı okuma, polars ifadeleri ve lazy API, DuckDB ile DataFrame\'e SQL, Arrow/Parquet ve PySpark\'a giriş; veri boyutuna göre araç seçersin.',
  goals: [
    'pandas\'ın neden ve hangi boyutta zorlandığını açıklayıp chunksize ile parçalı okuma yapabilirim.',
    'polars ile filter, with_columns, group_by().agg ve join zincirleri kurup lazy API ile scan/collect kullanabilirim.',
    'DuckDB ile pandas/polars DataFrame\'lerini ve Parquet dosyalarını SQL ile güvenli parametrelerle sorgulayabilirim.',
    'Parquet ve Arrow\'un sütun tabanlı yapısını kullanarak yalnızca gereken sütunları okuyabilirim.',
    'Veri boyutu ve ekip koşullarına göre pandas, polars, DuckDB ve PySpark arasında gerekçeli seçim yapabilirim.'
  ],
  body: `
<h2>pandas yetmediğinde</h2>
<p>Anadolu Market'in sipariş tablosu ilk yıl 200 bin satırdı; pandas ile saniyeler içinde gruplayıp raporladın (bunu <i>pandas-groupby</i> dersinde gördün). Üç yıl sonra tablo 400 milyon satır, CSV dosyası 60 GB. Dizüstü bilgisayarında 16 GB bellek var. <code>pd.read_csv</code> birkaç dakika diskle boğuştuktan sonra <b>MemoryError</b> verir ya da makine kilitlenir. Sorun senin kodunda değil, aracın tasarımında: pandas veriyi <b>tamamen belleğe</b> (eager, in-memory) yükler, çoğu işlemi <b>tek çekirdekte</b> çalıştırır ve ara sonuçlar için sık sık kopya üretir. Kabaca söylersek pandas'ın rahat çalıştığı sınır, verinin bellekte kapladığı alanın RAM'in beşte biri ile üçte biri arasında olmasıdır.</p>
<p>Bu derste o sınırı aşmanın dört yolunu öğreneceksin: veriyi <b>parça parça okumak</b> (chunksize), çok çekirdekli ve tembel çalışan <b>polars</b>, DataFrame'leri doğrudan SQL ile sorgulayan gömülü veritabanı <b>DuckDB</b> ve hepsinin ortak dili olan <b>Apache Arrow / Parquet</b>. Son olarak veri tek makineye sığmadığında devreye giren <b>PySpark</b>'ı tanıyacak ve "hangi boyutta hangi araç" kararını vereceksin.</p>

<h2>1. Parça parça okuma: chunksize</h2>
<p>En basit çözüm pandas'tan çıkmadan dosyayı dilimlerle okumaktır. <code>chunksize</code> verdiğinde <code>read_csv</code> tek bir DataFrame yerine bir <b>yineleyici</b> (iterator) döndürür; her adımda yalnızca o parça bellektedir. Toplam, sayım, en büyük gibi "birleştirilebilir" (associative) hesaplar için idealdir: her parçanın sonucunu bir sözlükte biriktirirsin.</p>
<pre class="py">import io
import pandas as pd

csv_metni = """siparis_id,sehir,tutar
1,İzmir,1500
2,Ankara,250
3,İzmir,90
4,Bursa,3200
5,Ankara,610
"""
ciro = {}
parca_sayisi = 0
for parca in pd.read_csv(io.StringIO(csv_metni), chunksize=2):
    parca_sayisi += 1
    for sehir, toplam in parca.groupby("sehir")["tutar"].sum().items():
        ciro[sehir] = ciro.get(sehir, 0) + int(toplam)
print("parça:", parca_sayisi)
print(dict(sorted(ciro.items())))
</pre>
<p>Gerçek hayatta <code>io.StringIO</code> yerine dosya yolu verirsin ve <code>chunksize=1_000_000</code> gibi bir değer seçersin. Ayrıca yalnızca gereken sütunları <code>usecols=["sehir", "tutar"]</code> ile, uygun türlerle (<code>dtype={"sehir": "category"}</code>) okumak belleği yarı yarıya düşürebilir.</p>
<div class="warn"><b>Parçalı okuma her hesabı kurtarmaz</b>Ortalama doğrudan birleştirilemez: parça ortalamalarının ortalaması yanlış sonuç verir. Bunun yerine toplam ve adet biriktirip en sonda böl. Medyan, benzersiz sayısı ya da sıralama gibi tüm veriyi görmesi gereken işlemler için parçalama zorlaşır; o noktada polars veya DuckDB'ye geç.</div>

<h2>2. polars: hızlı ve tembel DataFrame</h2>
<p><b>polars</b>, Rust ile yazılmış, Apache Arrow bellek düzenini kullanan bir DataFrame kütüphanesidir. pandas'tan üç büyük farkı var: işlemleri <b>tüm çekirdeklere</b> dağıtır, <b>indeks</b> (index) kavramı yoktur ve en önemlisi <b>ifade</b> (expression) tabanlı bir dili vardır. <code>pl.col("tutar")</code> bir sütunu değil, "tutar sütunu üzerinde yapılacak hesabın tarifini" temsil eder; bu tarifleri <code>select</code>, <code>with_columns</code>, <code>filter</code> ve <code>agg</code> içinde kullanırsın.</p>
<pre class="py">import polars as pl

siparisler = pl.DataFrame({
    "siparis_id": [1, 2, 3, 4, 5, 6],
    "sehir": ["İzmir", "Ankara", "İzmir", "Bursa", "Ankara", "İzmir"],
    "tutar": [1500, 250, 90, 3200, 610, 720],
})
print(siparisler.shape, siparisler.columns)

buyukler = siparisler.filter(pl.col("tutar") &gt;= 500)
print(buyukler["siparis_id"].to_list())

kdvli = siparisler.with_columns(
    (pl.col("tutar") * 1.2).round(2).alias("kdvli"),
    (pl.col("tutar") &gt;= 1000).alias("buyuk_siparis"),
)
print(kdvli.columns)

ozet = (
    siparisler.group_by("sehir")
    .agg(pl.col("tutar").sum().alias("ciro"), pl.len().alias("adet"))
    .sort("ciro", descending=True)
)
print(ozet.rows())
</pre>
<p>Okurken şuna dikkat et: hiçbir yerde <code>df["yeni"] = ...</code> gibi yerinde atama yok. polars'ta her işlem <b>yeni bir DataFrame</b> döndürür; zincirleme yazarsın. <code>with_columns</code> sütun ekler ya da değiştirir, <code>select</code> yalnızca istediğin sütunları bırakır, <code>alias</code> sonucun adını verir. <code>group_by</code> çıktısının satır sırası garanti değildir; raporda her zaman <code>sort</code> ekle.</p>

<div class="tbl-wrap"><table>
<tr><th>İş</th><th>pandas</th><th>polars</th></tr>
<tr><td>Satır süzme</td><td><code>df[df["tutar"] &gt; 500]</code></td><td><code>df.filter(pl.col("tutar") &gt; 500)</code></td></tr>
<tr><td>Sütun ekleme</td><td><code>df["kdvli"] = df["tutar"] * 1.2</code></td><td><code>df.with_columns((pl.col("tutar") * 1.2).alias("kdvli"))</code></td></tr>
<tr><td>Sütun seçme</td><td><code>df[["sehir", "tutar"]]</code></td><td><code>df.select("sehir", "tutar")</code></td></tr>
<tr><td>Gruplama</td><td><code>df.groupby("sehir")["tutar"].sum()</code></td><td><code>df.group_by("sehir").agg(pl.col("tutar").sum())</code></td></tr>
<tr><td>Birleştirme</td><td><code>df.merge(m, on="id", how="left")</code></td><td><code>df.join(m, on="id", how="left")</code></td></tr>
<tr><td>Grup içi hesap</td><td><code>groupby(...).transform("mean")</code></td><td><code>pl.col("tutar").mean().over("sehir")</code></td></tr>
<tr><td>Tek değer alma</td><td><code>df["tutar"].sum()</code></td><td><code>df.select(pl.col("tutar").sum()).item()</code></td></tr>
</table></div>

<h3>Lazy API: önce plan, sonra çalıştır</h3>
<p>polars'ın asıl gücü <b>tembel</b> (lazy) moddur. <code>df.lazy()</code> ya da doğrudan dosyadan <code>pl.scan_csv(...)</code> / <code>pl.scan_parquet(...)</code> bir <b>LazyFrame</b> döndürür. Üzerine yazdığın filter, group_by, select hemen çalışmaz; polars bir <b>sorgu planı</b> (query plan) kurar. <code>collect()</code> dediğinde planı <b>optimize eder</b>: süzmeyi okumanın içine iter (predicate pushdown), kullanılmayan sütunları hiç okumaz (projection pushdown) ve gerekiyorsa veriyi akış hâlinde (streaming) işler. Sonuç: 60 GB'lık dosyanın yalnızca iki sütununu ve ilgili satırlarını okursun.</p>
<p class="muted"><small>Tarayıcıdaki polars derlemesi dosyadan tembel okumayı (<code>scan_csv</code>, <code>scan_parquet</code>) ve polars\'ın kendi Parquet okuyucusunu desteklemiyor. Bu sayfadaki çalışan örnekler aynı planı <code>pl.read_csv(...).lazy()</code> ile kuruyor; kendi bilgisayarında <code>pl.scan_csv(...)</code> yazman yeterli, gerisi aynı.</small></p>
<pre class="py">import polars as pl

with open("siparisler.csv", "w", encoding="utf-8") as f:
    f.write("gun,sehir,tutar,iade\\n")
    f.write("2025-03-01,İzmir,1500,0\\n2025-03-01,Ankara,250,1\\n")
    f.write("2025-03-02,İzmir,90,0\\n2025-03-02,Bursa,3200,0\\n")

plan = (
    pl.read_csv("siparisler.csv").lazy()   # bilgisayarında: pl.scan_csv("siparisler.csv")
    .filter(pl.col("iade") == 0)
    .group_by("gun")
    .agg(pl.col("tutar").sum().alias("ciro"))
    .sort("gun")
)
print(type(plan).__name__)          # henüz hiçbir şey okunmadı
print(plan.collect().rows())        # şimdi çalıştı
</pre>
<div class="tip"><b>Kural: dosyadan okuyorsan scan ile başla</b><code>read_csv</code> her şeyi okur, <code>scan_csv</code> yalnızca gerekeni. Etkileşimli keşifte eager mod rahattır; üretimdeki rapor betiklerinde lazy zinciri kur, en sonda bir kez <code>collect()</code> çağır. <code>plan.explain()</code> optimize edilmiş planı metin olarak gösterir.</div>

<h2>3. DuckDB: DataFrame'e SQL</h2>
<p>Ekipte herkes SQL biliyorsa (Kesit SQL'den hatırlarsın) <b>DuckDB</b> en kısa yoldur. Kurulum gerektirmeyen, süreç içinde çalışan (in-process) bir analitik veritabanıdır; SQLite'ın analitik kardeşi gibi düşün. En sevilen özelliği: Python değişkenindeki bir pandas ya da polars DataFrame'ini <b>tablo adıymış gibi</b> sorgulayabilirsin. Sonucu <code>.fetchall()</code> ile demet listesi, <code>.df()</code> ile pandas, <code>.pl()</code> ile polars olarak alırsın.</p>
<pre class="py">import duckdb
import polars as pl

siparisler = pl.DataFrame({
    "musteri": ["Ayşe", "Mert", "Ayşe", "Zeynep", "Mert", "Ayşe"],
    "sehir": ["İzmir", "Ankara", "İzmir", "Bursa", "Ankara", "İzmir"],
    "tutar": [1500, 250, 90, 3200, 610, 720],
})
sorgu = """
    SELECT musteri, SUM(tutar) AS toplam, COUNT(*) AS adet
    FROM siparisler
    WHERE sehir &lt;&gt; 'Bursa'
    GROUP BY musteri
    ORDER BY toplam DESC
"""
print(duckdb.sql(sorgu).fetchall())
pdf = duckdb.sql(sorgu).df()          # pandas DataFrame
print(list(pdf.columns), len(pdf))
</pre>
<p>DuckDB de sütun tabanlıdır, tüm çekirdekleri kullanır ve bellekten büyük veride diske taşarak çalışabilir. Üstelik dosyaları doğrudan sorgular: <code>SELECT * FROM 'satislar/*.parquet'</code> yazman yeterli; yükleme adımı yok.</p>
<div class="warn"><b>SQL'de metin tek tırnakla yazılır</b>DuckDB'de <code>"İzmir"</code> bir <b>sütun adı</b> sayılır ve "Referenced column İzmir not found" hatası alırsın. Metin sabitleri için <code>'İzmir'</code> kullan. Kullanıcıdan gelen değeri f-string ile sorguya gömme; <code>duckdb.execute("... WHERE sehir = ?", [sehir])</code> ile parametre geçir (SQL enjeksiyonunu önler).</div>

<h2>4. Arrow ve Parquet: ortak dil</h2>
<p><b>Apache Arrow</b>, sütun tabanlı bir bellek biçimidir; polars, DuckDB ve pandas 2+ bu biçimi konuşur, böylece araçlar arasında veri <b>kopyalanmadan</b> el değiştirir. <b>Parquet</b> ise Arrow'un diskteki karşılığı gibidir: sütun tabanlı, şemalı (her sütunun türü dosyada yazar) ve sıkıştırılmış bir dosya biçimi. CSV'ye göre genellikle birkaç kat küçük ve okuması çok daha hızlıdır; çünkü yalnızca istenen sütunlar okunur ve her blokta min/max istatistikleri sayesinde ilgisiz bloklar atlanır.</p>
<pre class="py">import pyarrow as pa
import pyarrow.parquet as pq
import polars as pl
import duckdb

tablo = pa.table({
    "musteri_id": [101, 102, 103, 104],
    "segment": ["Bireysel", "KOBİ", "Bireysel", "Kurumsal"],
    "bakiye": [12500.0, 98000.5, 430.0, 1250000.0],
})
pq.write_table(tablo, "musteriler.parquet")

sadece_iki = pq.read_table("musteriler.parquet", columns=["musteri_id", "bakiye"])
print(sadece_iki.column_names, sadece_iki.num_rows)
print(pq.read_schema("musteriler.parquet").field("bakiye").type)

df = pl.from_arrow(pq.read_table("musteriler.parquet"))   # bilgisayarında: pl.read_parquet(...)
print(df.filter(pl.col("segment") == "Bireysel")["musteri_id"].to_list())
print(duckdb.sql("SELECT segment, COUNT(*) FROM 'musteriler.parquet' GROUP BY segment ORDER BY segment").fetchall())
</pre>
<div class="tbl-wrap"><table>
<tr><th>Özellik</th><th>CSV</th><th>Parquet</th></tr>
<tr><td>Düzen</td><td>Satır tabanlı metin</td><td>Sütun tabanlı ikili</td></tr>
<tr><td>Tür bilgisi</td><td>Yok, her okumada tahmin</td><td>Şemada saklı</td></tr>
<tr><td>Boyut</td><td>Büyük</td><td>Sıkıştırılmış, genelde birkaç kat küçük</td></tr>
<tr><td>Birkaç sütun okumak</td><td>Yine tüm dosya taranır</td><td>Yalnızca o sütunlar</td></tr>
<tr><td>İnsan okuyabilir mi</td><td>Evet</td><td>Hayır, araç gerekir</td></tr>
</table></div>

<h2>5. PySpark: veri tek makineye sığmadığında</h2>
<p>Veri terabaytlar seviyesine çıktığında ya da sürekli büyüyen bir veri gölünde (data lake) onlarca ekip aynı veriye eriştiğinde tek makine yetmez. <b>Apache Spark</b> işi bir <b>küme</b> (cluster) üzerindeki birçok makineye dağıtır; <b>PySpark</b> bunun Python arayüzüdür. API'si polars'a benzer: tembel DataFrame, ifadeler ve sonuç için bir eylem (action).</p>
<pre class="code">from pyspark.sql import SparkSession
from pyspark.sql import functions as F

spark = SparkSession.builder.appName("anadolu-market").getOrCreate()
df = spark.read.parquet("s3://anadolu-market/siparisler/")   # yüzlerce dosya
ozet = (
    df.filter(F.col("iade") == 0)
      .groupBy("sehir")
      .agg(F.sum("tutar").alias("ciro"), F.count("*").alias("adet"))
      .orderBy(F.desc("ciro"))
)
ozet.show(10)          # eylem: plan burada kümede çalışır
spark.stop()
</pre>
<div class="note"><b>Kendi bilgisayarında dene</b>PySpark tarayıcıda çalışmaz; Java gerektirir. Kurulum: <code>pip install pyspark</code> (ayrıca Java 17). Küçük denemeler için tek makinede <code>local[*]</code> modunda çalışır ama 10 GB altı veride polars veya DuckDB'den genellikle <b>daha yavaştır</b>: küme koordinasyonunun sabit bir maliyeti vardır. Spark'ı "veri gerçekten dağıtık" olduğunda seç.</div>

<h2>Hangi boyutta hangi araç?</h2>
<div class="tbl-wrap"><table>
<tr><th>Veri boyutu (kabaca)</th><th>Önerilen araç</th><th>Neden</th></tr>
<tr><td>RAM'in beşte birinden az (ör. 16 GB'ta ~3 GB)</td><td>pandas</td><td>Ekosistem en geniş, ekip biliyor, yeterince hızlı</td></tr>
<tr><td>RAM'e yakın ya da birkaç katı, tek makine</td><td>polars (lazy/streaming) veya DuckDB</td><td>Çok çekirdek, sütun okuma, bellekten taşınca diske döker</td></tr>
<tr><td>Yüzlerce GB - TB, çok dosya, paylaşılan veri gölü</td><td>PySpark (ya da bulut veri ambarı)</td><td>Dağıtık işlem, hata toleransı</td></tr>
<tr><td>Ekip SQL konuşuyor, hızlı ad-hoc analiz</td><td>DuckDB</td><td>Sıfır kurulum, dosyayı doğrudan sorgular</td></tr>
</table></div>
<p>Bu sınırlar kesin değildir; verinin bellekte kapladığı alan sütun türlerine göre CSV boyutundan büyük ya da küçük olabilir. Pratik yol: önce küçük bir örnekle ölç (<i>performans</i> dersindeki gibi), sonra karar ver.</p>

<div class="note"><b>Gerçek işte</b>Bir e-ticaret şirketinde günlük sipariş dökümleri genellikle bulut depolamada tarihe göre bölümlenmiş (partitioned) Parquet dosyaları olarak durur: <code>siparisler/yil=2025/ay=03/gun=01/part-0.parquet</code>. Analist sabah raporunu DuckDB ile doğrudan bu klasörlerden sorgular, veri mühendisi gece çalışan dönüşümleri polars ile yazar, aylık tüm geçmişi tarayan modeller ise Spark kümesinde koşar. Aynı Parquet dosyalarını üç araç da okuyabildiği için kimse veriyi kopyalamaz.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Grup içi hesap: over</h3>
<p>polars'ta <code>pl.col("tutar").mean().over("sehir")</code> her satıra kendi şehrinin ortalamasını yazar; SQL'deki pencere fonksiyonunun (window function) karşılığıdır. "Şehir ortalamasının iki katından büyük siparişleri işaretle" gibi anomali kuralları tek satıra iner. DuckDB'de aynı iş <code>AVG(tutar) OVER (PARTITION BY sehir)</code> ile yapılır.</p>
<pre class="py">import polars as pl

df = pl.DataFrame({
    "siparis_id": [1, 2, 3, 4, 5, 6],
    "sehir": ["İzmir", "İzmir", "İzmir", "Ankara", "Ankara", "Bursa"],
    "tutar": [100, 120, 900, 300, 320, 50],
})
isaretli = df.with_columns(
    pl.col("tutar").mean().over("sehir").round(1).alias("sehir_ort")
).with_columns(
    (pl.col("tutar") &gt; 2 * pl.col("sehir_ort")).alias("supheli")
)
print(isaretli.filter(pl.col("supheli"))["siparis_id"].to_list())
print(isaretli["sehir_ort"].to_list())
</pre>
<h3>Araçlar arasında sıfır kopya</h3>
<p><code>pl.from_pandas(pdf)</code>, <code>df.to_pandas()</code>, <code>df.to_arrow()</code> ve <code>duckdb.sql(...).pl()</code> Arrow sayesinde çoğu zaman veriyi kopyalamadan dönüştürür. Bu yüzden "tek araç seç" zorunluluğu yok: ağır birleştirmeyi DuckDB'de, sütun mühendisliğini polars'ta yapıp sonucu görselleştirme için pandas'a verebilirsin.</p>
<h3>Bellek ölçümü</h3>
<p>Karar vermeden önce ölç: pandas'ta <code>df.memory_usage(deep=True).sum()</code>, polars'ta <code>df.estimated_size("mb")</code>. Metin sütunlarını kategoriye çevirmek ve 64 bit sayıları 32 bite indirmek (<code>pl.Int32</code>, <code>pl.Float32</code>) belleği ciddi azaltır; ancak para tutarlarında hassasiyet kaybını göze almadan float32 kullanma.</p>
</section>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: '16 GB RAM\'li bir bilgisayarda 60 GB\'lık sipariş CSV\'sinden şehir bazlı ciro çıkarman gerekiyor. <code>pd.read_csv("siparisler.csv")</code> neden büyük olasılıkla başarısız olur?',
      o: [
        'pandas CSV dosyalarını yalnızca 2 GB\'a kadar açabilir',
        'pandas tüm veriyi belleğe yükler; veri RAM\'den büyük olunca yetmez',
        'pandas yalnızca tek çekirdek kullandığı için işlem zaman aşımına uğrar',
        'CSV biçimi 60 GB boyutunu desteklemez'
      ],
      a: 1,
      why: 'pandas eager çalışır: dosyanın tamamını belleğe alır ve ara kopyalar üretir. Tek çekirdek yavaşlatır ama asıl engel bellektir. CSV\'nin ya da pandas\'ın sabit bir dosya boyutu sınırı yoktur.' },
    { t: 'mc',
      stage: 'Isınma',
      q: '<code>plan = pl.scan_csv("s.csv").filter(pl.col("iade") == 0).group_by("gun").agg(pl.col("tutar").sum())</code> satırı çalıştığında ne olur?',
      o: [
        'Dosya okunur ve süzülmüş sonuç plan değişkenine yazılır',
        'Yalnızca ilk 1000 satır okunup önizleme hazırlanır',
        'Hiçbir şey okunmaz; collect() çağrılınca optimize edilip çalışır',
        'Hata verir; scan_csv sonrasında filter kullanılamaz'
      ],
      a: 2,
      why: 'scan_csv bir LazyFrame döndürür; zincir yalnızca sorgu planı kurar. collect() çağrıldığında polars planı optimize eder (süzmeyi okumaya iter, gereksiz sütunları atlar) ve çalıştırır.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Analist, 200 sütunluk müşteri tablosundan yalnızca <code>musteri_id</code> ve <code>bakiye</code> sütunlarını okumak istiyor. Parquet bu işte CSV\'den neden belirgin biçimde hızlıdır?',
      o: [
        'Parquet dosyaları her zaman RAM\'de tutulur',
        'Parquet metin olduğu için daha kolay ayrıştırılır',
        'Parquet satırları sıralı sakladığından arama yapılabilir',
        'Sütun tabanlıdır; yalnızca istenen iki sütunun verisi okunur'
      ],
      a: 3,
      why: 'Parquet veriyi sütun sütun saklar; okuyucu yalnızca istenen sütunların bloklarını diskten çeker. CSV satır tabanlı metin olduğu için iki sütun için bile tüm dosya taranır. Parquet ikilidir, metin değildir.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu polars kodu ne yazdırır?',
      code: 'import polars as pl\n\ndf = pl.DataFrame({\n    "id": [1, 2, 3, 4],\n    "sehir": ["İzmir", "Ankara", "İzmir", "Bursa"],\n    "tutar": [1500, 250, 90, 3200],\n})\nsonuc = df.filter(pl.col("tutar") > 100).with_columns((pl.col("tutar") // 100).alias("yuz"))\nprint(sonuc["yuz"].to_list())\n',
      o: ['[15, 2, 0, 32]', '[15, 2, 32]', '[15, 32]', '[1500, 250, 3200]'],
      a: 1,
      why: 'filter tutarı 100\'den büyük üç satırı (1500, 250, 3200) bırakır; 90 elenir. with_columns bu satırlarda tutar // 100 değerini hesaplar: 15, 2, 32. Süzme önce yapıldığı için 0 değeri listede yer almaz.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'DuckDB sorgusu ne yazdırır?',
      code: 'import duckdb\nimport pandas as pd\n\nsiparisler = pd.DataFrame({\n    "sehir": ["İzmir", "Ankara", "İzmir", "Ankara", "Bursa"],\n    "tutar": [100, 200, 300, 50, 450],\n})\nprint(duckdb.sql("""\n    SELECT sehir, SUM(tutar) AS ciro\n    FROM siparisler\n    GROUP BY sehir\n    HAVING SUM(tutar) > 300\n    ORDER BY ciro DESC\n""").fetchall())\n',
      o: ['[(\'Bursa\', 450), (\'İzmir\', 400)]', '[(\'Bursa\', 450), (\'İzmir\', 400), (\'Ankara\', 250)]', '[(\'İzmir\', 400), (\'Bursa\', 450)]', 'Hata verir: siparisler bir tablo değil'],
      a: 0,
      why: 'DuckDB, Python değişkenindeki pandas DataFrame\'ini tablo adıyla bulur. Toplamlar: İzmir 400, Ankara 250, Bursa 450. HAVING grupları toplamdan sonra süzer ve Ankara\'yı eler; ORDER BY ciro DESC Bursa\'yı öne alır. WHERE satırları gruplamadan önce, HAVING grupları gruplamadan sonra süzer.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'chunksize ile okuma ne yazdırır?',
      code: 'import io\nimport pandas as pd\n\nmetin = "id,tutar\\n1,10\\n2,20\\n3,30\\n4,40\\n5,50\\n"\nboyutlar = []\ntoplam = 0\nfor parca in pd.read_csv(io.StringIO(metin), chunksize=2):\n    boyutlar.append(len(parca))\n    toplam += int(parca["tutar"].sum())\nprint(boyutlar, toplam)\n',
      o: ['[2, 2, 2] 150', '[5] 150', '[2, 2] 100', '[2, 2, 1] 150'],
      a: 3,
      why: 'Beş veri satırı ikişerli okunur: 2, 2 ve kalan 1 satır. Başlık satırı parçalara sayılmaz. Her parçanın toplamı biriktirildiği için sonuç tüm verinin toplamıdır: 150.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Anadolu Market siparişlerinden iade edilmeyenlerin şehir bazlı cirosunu <b>lazy</b> modda hesaplayan programın satırlarını sırala.</p>',
      lines: [
        'import polars as pl',
        'df = pl.DataFrame({"sehir": ["İzmir", "Ankara", "İzmir"], "tutar": [500, 250, 90], "iade": [0, 0, 1]})',
        'lf = df.lazy()',
        'lf = lf.filter(pl.col("iade") == 0)',
        'lf = lf.group_by("sehir").agg(pl.col("tutar").sum().alias("ciro"))',
        'sonuc = lf.sort("sehir").collect()',
        'print(sonuc.rows())'
      ],
      expect: '[(\'Ankara\', 250), (\'İzmir\', 500)]\n',
      hint: 'Süzme gruplamadan önce gelmeli: gruplamadan sonra iade sütunu artık yok. collect en sonda.',
      why: 'Lazy zincir: önce LazyFrame\'e geç, satırları süz, grupla, sırala ve en sonda collect ile çalıştır. group_by sonrası yalnızca sehir ve ciro kalır; filter\'ı sonra yazsaydın iade sütunu bulunamazdı.' },
    { t: 'code',
      stage: 'Rehberli',
      id: 'polars-duckdb-1',
      diff: 1,
      q: '<p><code>sehir_ciro(df)</code> fonksiyonunu yaz. Girdi: <code>sehir</code> ve <code>tutar</code> sütunlu bir polars DataFrame. Çıktı: her şehir için <code>sehir</code>, <code>ciro</code> (tutar toplamı) ve <code>adet</code> (sipariş sayısı) sütunlarını içeren, <b>ciroya göre büyükten küçüğe</b> sıralı bir polars DataFrame.</p>',
      guide: [
        'df.group_by("sehir") ile şehre göre grupla.',
        'agg içinde iki ifade ver: tutarların toplamı (adı ciro) ve satır sayısı (adı adet).',
        'Sonucu ciro sütununa göre azalan sırala.',
        'DataFrame\'i döndür.'
      ],
      example: 'import polars as pl\n\nsubeler = pl.DataFrame({"bolge": ["Ege", "Ege", "İç Anadolu"], "personel": [12, 8, 20]})\nozet = (\n    subeler.group_by("bolge")\n    .agg(pl.col("personel").sum().alias("toplam"), pl.len().alias("sube"))\n    .sort("toplam")\n)\nprint(ozet.rows())\n',
      start: 'import polars as pl\n\n\ndef sehir_ciro(df):\n    # TODO: şehre göre grupla\n    # TODO: ciro (toplam) ve adet (satır sayısı) hesapla\n    # TODO: ciroya göre azalan sırala ve döndür\n    pass\n\n\nsiparisler = pl.DataFrame({\n    "sehir": ["İzmir", "Ankara", "İzmir", "Bursa", "Ankara"],\n    "tutar": [1500, 250, 90, 3200, 610],\n})\nprint(sehir_ciro(siparisler))\n',
      sol: 'import polars as pl\n\n\ndef sehir_ciro(df):\n    return (\n        df.group_by("sehir")\n        .agg(pl.col("tutar").sum().alias("ciro"), pl.len().alias("adet"))\n        .sort("ciro", descending=True)\n    )\n\n\nsiparisler = pl.DataFrame({\n    "sehir": ["İzmir", "Ankara", "İzmir", "Bursa", "Ankara"],\n    "tutar": [1500, 250, 90, 3200, 610],\n})\nprint(sehir_ciro(siparisler))\n',
      tests: 'import polars as pl\n_s = sehir_ciro(siparisler)\nassert isinstance(_s, pl.DataFrame), "sehir_ciro bir polars DataFrame döndürmeli (agg sonucu)"\nassert set(_s.columns) == {"sehir", "ciro", "adet"}, "sütunlar sehir, ciro, adet olmalı; alias ile adlandır"\n_r = [(r["sehir"], r["ciro"], r["adet"]) for r in _s.to_dicts()]\nassert _r == [("Bursa", 3200, 1), ("İzmir", 1590, 2), ("Ankara", 860, 2)], f"ciroya göre azalan sıralı olmalı: Bursa 3200, İzmir 1590, Ankara 860; gelen {_r}"\n_t = sehir_ciro(pl.DataFrame({"sehir": ["Van"], "tutar": [5]}))\nassert [(r["sehir"], r["ciro"], r["adet"]) for r in _t.to_dicts()] == [("Van", 5, 1)], "tek satırlık veride de çalışmalı"\n',
      hints: [
        'Gruplama ve toplama: group_by(...).agg(...).',
        'pl.col("tutar").sum().alias("ciro") ve pl.len().alias("adet").',
        '.sort("ciro", descending=True) ekle.'
      ],
      why: 'polars\'ta toplama ifadeleri agg içine liste gibi verilir; her ifadeye alias ile ad koyarsın. group_by sırası garanti olmadığından sonuca açık bir sort eklemek raporu deterministik yapar.' },
    { t: 'code',
      stage: 'Rehberli',
      id: 'polars-duckdb-2',
      diff: 1,
      q: '<p><code>kdv_ekle(df, oran)</code> fonksiyonunu yaz: <code>tutar</code> sütunlu polars DataFrame\'e iki yeni sütun eklesin: <code>kdvli</code> = tutar × (1 + oran), 2 basamağa yuvarlanmış; <code>buyuk</code> = kdvli değeri 1000 ve üzeriyse <code>True</code>. Orijinal sütunlar korunsun.</p>',
      guide: [
        'with_columns ile yeni sütun ekle; yerinde atama yok, sonuç yeni DataFrame.',
        'kdvli için pl.col("tutar") * (1 + oran) ifadesini round(2) ve alias ile tamamla.',
        'buyuk sütunu kdvli\'ye bağlı; aynı with_columns içinde henüz oluşmamış sütuna başvuramazsın, ikinci bir with_columns kullan.',
        'Sonucu döndür.'
      ],
      example: 'import polars as pl\n\nmaas = pl.DataFrame({"personel": ["Ali", "Ece"], "brut": [40000, 65000]})\nyeni = maas.with_columns((pl.col("brut") * 0.85).round(2).alias("net")).with_columns(\n    (pl.col("net") > 50000).alias("yuksek")\n)\nprint(yeni.rows())\n',
      start: 'import polars as pl\n\n\ndef kdv_ekle(df, oran):\n    # TODO: kdvli sütununu ekle (2 basamak)\n    # TODO: buyuk sütununu kdvli >= 1000 olarak ekle\n    return df\n\n\nsiparisler = pl.DataFrame({"siparis_id": [1, 2, 3], "tutar": [900.0, 250.5, 1200.0]})\nprint(kdv_ekle(siparisler, 0.20))\n',
      sol: 'import polars as pl\n\n\ndef kdv_ekle(df, oran):\n    return df.with_columns(\n        (pl.col("tutar") * (1 + oran)).round(2).alias("kdvli")\n    ).with_columns(\n        (pl.col("kdvli") >= 1000).alias("buyuk")\n    )\n\n\nsiparisler = pl.DataFrame({"siparis_id": [1, 2, 3], "tutar": [900.0, 250.5, 1200.0]})\nprint(kdv_ekle(siparisler, 0.20))\n',
      tests: '_k = kdv_ekle(siparisler, 0.20)\nassert _k.columns == ["siparis_id", "tutar", "kdvli", "buyuk"], f"sütunlar sırasıyla siparis_id, tutar, kdvli, buyuk olmalı; gelen {_k.columns}"\n_v = _k["kdvli"].to_list()\nassert all(abs(a - b) < 1e-6 for a, b in zip(_v, [1080.0, 300.6, 1440.0])), f"kdvli %20 ile [1080.0, 300.6, 1440.0] olmalı; gelen {_v}"\nassert _k["buyuk"].to_list() == [True, False, True], "buyuk: kdvli 1000 ve üzeriyse True (900 TL KDV\'li 1080 olur, büyük sayılır)"\n_z = kdv_ekle(siparisler, 0.0)\nassert _z["buyuk"].to_list() == [False, False, True], "oran 0 iken yalnızca 1200 TL büyük olmalı; oranı parametreden al"\nassert siparisler.columns == ["siparis_id", "tutar"], "orijinal DataFrame değişmemeli"\n',
      hints: [
        'with_columns(ifade.alias("ad")) yeni sütun ekler.',
        '(pl.col("tutar") * (1 + oran)).round(2).alias("kdvli")',
        'İkinci adım: .with_columns((pl.col("kdvli") >= 1000).alias("buyuk"))'
      ],
      why: 'polars ifadeleri aynı with_columns içinde paralel hesaplanır; bu yüzden birbirine bağlı sütunları zincirleme iki with_columns ile eklersin. Her işlem yeni DataFrame döndürdüğü için orijinal veri korunur.' },
    { t: 'code',
      stage: 'Rehberli',
      id: 'polars-duckdb-3',
      diff: 2,
      q: '<p><code>en_cok_harcayanlar(siparisler, n)</code> fonksiyonunu <b>DuckDB SQL</b> ile yaz. <code>siparisler</code> sütunları <code>musteri</code>, <code>tutar</code> olan bir pandas DataFrame. Fonksiyon toplam harcamaya göre en yüksek <code>n</code> müşteriyi <code>(musteri, toplam)</code> demetlerinden oluşan liste olarak döndürsün. Eşit toplamda müşteri adı alfabetik sırayla gelsin.</p>',
      guide: [
        'import duckdb; sorguyu üç tırnaklı metin olarak yaz.',
        'FROM siparisler: DuckDB fonksiyonun yerel değişkenini tablo adı olarak bulur.',
        'GROUP BY musteri, SUM(tutar) AS toplam; ORDER BY toplam DESC, musteri.',
        'LIMIT ile n satır al; n\'yi parametre olarak ver: duckdb.execute(sorgu, [n]).',
        'fetchall() ile demet listesi döndür.'
      ],
      example: 'import duckdb\nimport pandas as pd\n\nkrediler = pd.DataFrame({"sube": ["Konak", "Kızılay", "Konak"], "tutar": [50, 80, 40]})\nsorgu = "SELECT sube, SUM(tutar) AS t FROM krediler GROUP BY sube ORDER BY t DESC LIMIT ?"\nprint(duckdb.execute(sorgu, [1]).fetchall())\n',
      start: 'import duckdb\nimport pandas as pd\n\n\ndef en_cok_harcayanlar(siparisler, n):\n    sorgu = """\n        -- TODO: musteri ve SUM(tutar) AS toplam seç\n        -- TODO: grupla, sırala, LIMIT ?\n    """\n    # TODO: duckdb.execute(sorgu, [n]).fetchall() döndür\n    return []\n\n\nveri = pd.DataFrame({\n    "musteri": ["Ayşe", "Mert", "Ayşe", "Zeynep", "Mert", "Can"],\n    "tutar": [1500, 250, 90, 1340, 1340, 700],\n})\nprint(en_cok_harcayanlar(veri, 3))\n',
      sol: 'import duckdb\nimport pandas as pd\n\n\ndef en_cok_harcayanlar(siparisler, n):\n    sorgu = """\n        SELECT musteri, SUM(tutar) AS toplam\n        FROM siparisler\n        GROUP BY musteri\n        ORDER BY toplam DESC, musteri\n        LIMIT ?\n    """\n    return duckdb.execute(sorgu, [n]).fetchall()\n\n\nveri = pd.DataFrame({\n    "musteri": ["Ayşe", "Mert", "Ayşe", "Zeynep", "Mert", "Can"],\n    "tutar": [1500, 250, 90, 1340, 1340, 700],\n})\nprint(en_cok_harcayanlar(veri, 3))\n',
      tests: '_r = en_cok_harcayanlar(veri, 3)\nassert [(a, int(b)) for a, b in _r] == [("Ayşe", 1590), ("Mert", 1590), ("Zeynep", 1340)], f"ilk 3: Ayşe 1590, Mert 1590 (eşitlikte alfabetik), Zeynep 1340 olmalı; gelen {_r}"\nassert len(en_cok_harcayanlar(veri, 1)) == 1, "n=1 iken tek satır dönmeli (LIMIT ?)"\nassert len(en_cok_harcayanlar(veri, 10)) == 4, "n müşteri sayısından büyükse tüm müşteriler (4) dönmeli"\nassert "duckdb" in __source__, "çözümde DuckDB kullanılmalı"\n',
      hints: [
        'SELECT musteri, SUM(tutar) AS toplam FROM siparisler GROUP BY musteri',
        'Bağ çözmek için ORDER BY toplam DESC, musteri',
        'LIMIT ? ve duckdb.execute(sorgu, [n]).fetchall()'
      ],
      why: 'DuckDB yerel değişkendeki DataFrame\'i tablo gibi tarar (replacement scan). ORDER BY\'a ikinci ölçüt eklemek eşitlikte sırayı deterministik yapar; ? yer tutucusu değeri güvenle sorguya geçirir.' },
    { t: 'code',
      stage: 'Kendin yaz',
      id: 'polars-duckdb-4',
      diff: 2,
      q: '<p><code>parcali_ciro(csv_metni, parca)</code> fonksiyonu yaz: <code>siparis_id,sehir,tutar</code> başlıklı CSV metnini <code>pd.read_csv(io.StringIO(csv_metni), chunksize=parca)</code> ile <b>parça parça</b> okuyup şehir başına toplam tutarı bir sözlükte döndürsün (değerler <code>int</code>). Ayrıca kaç parça okunduğunu da döndür: <code>return ciro, parca_sayisi</code>.</p>',
      start: 'import io\nimport pandas as pd\n\n\ndef parcali_ciro(csv_metni, parca):\n    pass\n',
      sol: 'import io\nimport pandas as pd\n\n\ndef parcali_ciro(csv_metni, parca):\n    ciro = {}\n    parca_sayisi = 0\n    for blok in pd.read_csv(io.StringIO(csv_metni), chunksize=parca):\n        parca_sayisi += 1\n        for sehir, toplam in blok.groupby("sehir")["tutar"].sum().items():\n            ciro[sehir] = ciro.get(sehir, 0) + int(toplam)\n    return ciro, parca_sayisi\n',
      tests: '_csv = "siparis_id,sehir,tutar\\n1,İzmir,1500\\n2,Ankara,250\\n3,İzmir,90\\n4,Bursa,3200\\n5,Ankara,610\\n6,İzmir,10\\n7,Van,5\\n"\n_c, _n = parcali_ciro(_csv, 3)\nassert _c == {"İzmir": 1600, "Ankara": 860, "Bursa": 3200, "Van": 5}, f"şehir toplamları yanlış: {_c}"\nassert _n == 3, f"7 satır 3\'erli okununca 3 parça olmalı; gelen {_n}"\n_c2, _n2 = parcali_ciro(_csv, 100)\nassert _c2 == _c and _n2 == 1, "parça boyutu değişse de sonuç aynı olmalı"\nassert all(type(v) is int for v in _c.values()), "değerler int olmalı (int() ile çevir)"\nassert "chunksize" in __source__, "chunksize ile parça parça okumalısın"\n',
      hints: [
        'for blok in pd.read_csv(..., chunksize=parca): her blok küçük bir DataFrame.',
        'Her blokta groupby("sehir")["tutar"].sum() alıp sözlüğe ekle: ciro.get(sehir, 0) + int(toplam).'
      ],
      why: 'Toplam birleştirilebilir bir hesaptır: parça sonuçlarını toplamak tüm verinin sonucunu verir. Bellekte aynı anda yalnızca bir parça durduğu için dosya boyutundan bağımsız çalışır.' },
    { t: 'code',
      stage: 'Kendin yaz',
      id: 'polars-duckdb-5',
      diff: 2,
      q: '<p><code>siparis_musteri(siparisler, musteriler)</code> fonksiyonu yaz (ikisi de polars DataFrame). <code>musteri_id</code> üzerinden <b>sol birleştirme</b> (left join) yapsın; müşteri tablosunda karşılığı olmayan siparişlerin <code>segment</code> değeri <code>"Bilinmiyor"</code> olsun. Sonucu <code>siparis_id</code>\'ye göre sıralı döndür.</p>',
      start: 'import polars as pl\n\n\ndef siparis_musteri(siparisler, musteriler):\n    pass\n',
      sol: 'import polars as pl\n\n\ndef siparis_musteri(siparisler, musteriler):\n    return (\n        siparisler.join(musteriler, on="musteri_id", how="left")\n        .with_columns(pl.col("segment").fill_null("Bilinmiyor"))\n        .sort("siparis_id")\n    )\n',
      tests: 'import polars as pl\n_s = pl.DataFrame({"siparis_id": [3, 1, 2, 4], "musteri_id": [10, 11, 99, 10], "tutar": [100, 200, 300, 400]})\n_m = pl.DataFrame({"musteri_id": [10, 11, 12], "segment": ["Altın", "Gümüş", "Bronz"]})\n_r = siparis_musteri(_s, _m)\nassert _r.height == 4, "sol birleştirmede sipariş sayısı (4) korunmalı; how=\\"left\\""\nassert _r["siparis_id"].to_list() == [1, 2, 3, 4], "siparis_id\'ye göre sıralı olmalı"\nassert _r["segment"].to_list() == ["Gümüş", "Bilinmiyor", "Altın", "Altın"], f"segmentler yanlış: {_r[\'segment\'].to_list()}; eşleşmeyen için fill_null"\n',
      hints: [
        'siparisler.join(musteriler, on="musteri_id", how="left")',
        'Eşleşmeyen satırlarda segment null gelir: pl.col("segment").fill_null("Bilinmiyor").'
      ],
      why: 'Sol birleştirme soldaki tüm satırları korur; sağda karşılığı yoksa null üretir. fill_null ile raporda boş görünmek yerine anlamlı bir etiket verirsin.' },
    { t: 'code',
      stage: 'Kendin yaz',
      id: 'polars-duckdb-6',
      diff: 2,
      q: '<p><code>parquet_ozet(veri, yol)</code> fonksiyonu yaz. <code>veri</code> sütun adı → liste sözlüğüdür (<code>sube</code>, <code>musteri_id</code>, <code>bakiye</code> ve başka sütunlar olabilir). Fonksiyon <code>pyarrow</code> ile bu veriyi <code>yol</code>\'a Parquet olarak yazsın, sonra dosyadan <b>yalnızca</b> <code>sube</code> ve <code>bakiye</code> sütunlarını okuyup şube başına toplam bakiyeyi alfabetik şube sırasıyla <code>[(sube, toplam), ...]</code> listesi olarak döndürsün (DuckDB ya da polars kullanabilirsin).</p>',
      start: 'import pyarrow as pa\nimport pyarrow.parquet as pq\n\n\ndef parquet_ozet(veri, yol):\n    pass\n',
      sol: 'import pyarrow as pa\nimport pyarrow.parquet as pq\nimport polars as pl\n\n\ndef parquet_ozet(veri, yol):\n    pq.write_table(pa.table(veri), yol)\n    tablo = pq.read_table(yol, columns=["sube", "bakiye"])\n    df = pl.from_arrow(tablo)\n    ozet = df.group_by("sube").agg(pl.col("bakiye").sum()).sort("sube")\n    return ozet.rows()\n',
      tests: 'import pyarrow.parquet as pq\n_v = {"musteri_id": [1, 2, 3, 4], "sube": ["Konak", "Kızılay", "Konak", "Alsancak"], "bakiye": [100.5, 2000.0, 49.5, 10.0], "not": ["a", "b", "c", "d"]}\n_r = parquet_ozet(_v, "bakiye.parquet")\nassert [(s, round(b, 2)) for s, b in _r] == [("Alsancak", 10.0), ("Konak", 150.0), ("Kızılay", 2000.0)], f"şube toplamları alfabetik olmalı: Alsancak, Konak, Kızılay; gelen {_r}"\nassert pq.read_table("bakiye.parquet").num_rows == 4, "dosya 4 satırla yazılmalı"\nassert "columns" in __source__, "okurken yalnızca gereken sütunları columns= ile seç"\n',
      hints: [
        'Yazmak için pq.write_table(pa.table(veri), yol).',
        'Okurken pq.read_table(yol, columns=["sube", "bakiye"]); pl.from_arrow ile polars\'a çevirip grupla.'
      ],
      why: 'Parquet sütun tabanlı olduğu için columns= ile yalnızca iki sütunu okursun. Arrow tablosu polars\'a kopyasız geçer. Not: Python\'un metin sıralaması Unicode kod noktasına göredir; "Konak" ile "Kızılay"ı karşılaştırırken o ile ı harflerinin kodları belirleyicidir.' },
    { t: 'code',
      stage: 'Kendin yaz',
      id: 'polars-duckdb-7',
      diff: 1,
      q: '<p><code>arac_sec(veri_gb, ram_gb)</code> fonksiyonu yaz. Kurallar: veri RAM\'in beşte birinden <b>küçükse</b> <code>"pandas"</code>; değilse ve veri 500 GB\'tan <b>küçükse</b> <code>"polars/duckdb"</code>; aksi hâlde <code>"pyspark"</code>. Negatif ya da sıfır <code>ram_gb</code> için <code>ValueError</code> fırlat.</p>',
      start: 'def arac_sec(veri_gb, ram_gb):\n    pass\n',
      sol: 'def arac_sec(veri_gb, ram_gb):\n    if ram_gb <= 0:\n        raise ValueError("ram_gb pozitif olmalı")\n    if veri_gb < ram_gb / 5:\n        return "pandas"\n    if veri_gb < 500:\n        return "polars/duckdb"\n    return "pyspark"\n',
      tests: 'assert arac_sec(2, 16) == "pandas", "2 GB veri, 16 GB RAM: beşte birin (3.2) altında, pandas"\nassert arac_sec(3.2, 16) == "polars/duckdb", "tam sınırda (3.2 = 16/5) artık pandas değil"\nassert arac_sec(60, 16) == "polars/duckdb", "60 GB tek makinede polars/duckdb ile işlenir"\nassert arac_sec(500, 64) == "pyspark", "500 GB ve üzeri pyspark"\nassert arac_sec(4000, 256) == "pyspark", "4 TB pyspark"\ntry:\n    arac_sec(1, 0)\n    assert False, "ram_gb 0 iken ValueError bekleniyordu"\nexcept ValueError:\n    pass\n',
      hints: [
        'Önce geçersiz girdiyi kontrol et: if ram_gb &lt;= 0: raise ValueError(...)',
        'Koşulları küçükten büyüğe sırala: veri_gb &lt; ram_gb / 5, sonra veri_gb &lt; 500.'
      ],
      why: 'Karar kuralını kod olarak yazmak ekipte tutarlılık sağlar. Sınır değerlerini (tam 3.2, tam 500) testlemek, &lt; ile &lt;= farkından doğan hataları yakalar.' },
    { t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      id: 'polars-duckdb-8',
      diff: 2,
      q: '<p>Veri mühendisi <code>gunluk_ozet(lf)</code> fonksiyonunu yazdı ama raporlama ekibi "DataFrame yerine garip bir plan nesnesi geliyor, <code>.rows()</code> çalışmıyor" diyor. <b>Hatayı bul ve düzelt.</b> Fonksiyon bir polars <code>DataFrame</code> döndürmeli.</p>',
      start: 'import polars as pl\n\n\ndef gunluk_ozet(lf):\n    return (\n        lf.filter(pl.col("iade") == 0)\n        .group_by("gun")\n        .agg(pl.col("tutar").sum().alias("ciro"))\n        .sort("gun")\n    )\n\n\nveri = pl.DataFrame({\n    "gun": ["03-01", "03-01", "03-02"],\n    "tutar": [100, 50, 70],\n    "iade": [0, 1, 0],\n}).lazy()\nprint(gunluk_ozet(veri))\n',
      sol: 'import polars as pl\n\n\ndef gunluk_ozet(lf):\n    return (\n        lf.filter(pl.col("iade") == 0)\n        .group_by("gun")\n        .agg(pl.col("tutar").sum().alias("ciro"))\n        .sort("gun")\n        .collect()\n    )\n\n\nveri = pl.DataFrame({\n    "gun": ["03-01", "03-01", "03-02"],\n    "tutar": [100, 50, 70],\n    "iade": [0, 1, 0],\n}).lazy()\nprint(gunluk_ozet(veri))\n',
      tests: 'import polars as pl\n_r = gunluk_ozet(veri)\nassert isinstance(_r, pl.DataFrame), f"DataFrame bekleniyordu, {type(_r).__name__} geldi: lazy zincir collect() ile çalıştırılmalı"\nassert _r.rows() == [("03-01", 100), ("03-02", 70)], f"iade edilmeyenlerin günlük cirosu yanlış: {_r.rows()}"\n',
      hints: [
        'Girdi bir LazyFrame; üzerindeki işlemler de LazyFrame döndürür.',
        'Zincirin sonuna .collect() ekle.'
      ],
      why: 'Lazy zincir yalnızca plan kurar; collect() çağrılmadan hiçbir veri hesaplanmaz. Fonksiyonun sözleşmesi DataFrame döndürmekse collect sorumluluğu fonksiyondadır.' },
    { t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      id: 'polars-duckdb-9',
      diff: 2,
      q: '<p><code>sehir_siparisleri(siparisler, sehir)</code> belirli bir şehrin sipariş sayısını ve toplam tutarını DuckDB ile döndürmeli. Ancak çalıştırınca <i>Binder Error: Referenced column ... not found</i> hatası alınıyor; üstelik sorgu metni f-string ile kuruluyor. <b>Hatayı bul ve düzelt</b>: şehri sorguya <code>?</code> parametresiyle geçir.</p>',
      start: 'import duckdb\nimport pandas as pd\n\n\ndef sehir_siparisleri(siparisler, sehir):\n    sorgu = f"""\n        SELECT COUNT(*) AS adet, SUM(tutar) AS toplam\n        FROM siparisler\n        WHERE sehir = "{sehir}"\n    """\n    return duckdb.sql(sorgu).fetchone()\n\n\nveri = pd.DataFrame({"sehir": ["İzmir", "Ankara", "İzmir"], "tutar": [100, 250, 40]})\nprint(sehir_siparisleri(veri, "İzmir"))\n',
      sol: 'import duckdb\nimport pandas as pd\n\n\ndef sehir_siparisleri(siparisler, sehir):\n    sorgu = """\n        SELECT COUNT(*) AS adet, SUM(tutar) AS toplam\n        FROM siparisler\n        WHERE sehir = ?\n    """\n    return duckdb.execute(sorgu, [sehir]).fetchone()\n\n\nveri = pd.DataFrame({"sehir": ["İzmir", "Ankara", "İzmir"], "tutar": [100, 250, 40]})\nprint(sehir_siparisleri(veri, "İzmir"))\n',
      tests: '_a, _t = sehir_siparisleri(veri, "İzmir")\nassert (_a, int(_t)) == (2, 140), f"İzmir için (2, 140) bekleniyordu; gelen {(_a, _t)}"\n_a2, _t2 = sehir_siparisleri(veri, "Ankara")\nassert (_a2, int(_t2)) == (1, 250), "Ankara için (1, 250)"\n_a3, _t3 = sehir_siparisleri(veri, "Ordu\' OR \'1\'=\'1")\nassert _a3 == 0, "kötü niyetli girdi tüm satırları döndürmemeli; değeri ? parametresiyle geçir"\n',
      hints: [
        'SQL\'de çift tırnak sütun adı demektir; metin sabiti tek tırnakla yazılır.',
        'En güvenlisi: WHERE sehir = ? ve duckdb.execute(sorgu, [sehir]).fetchone().'
      ],
      why: 'Çift tırnaklı "İzmir" DuckDB\'de tanımlayıcıdır (sütun adı), bu yüzden binder hatası çıkar. Değeri parametreyle geçirmek hem tırnak sorununu hem de SQL enjeksiyonunu ortadan kaldırır.' },
    { t: 'code',
      stage: 'Meydan okuma',
      id: 'polars-duckdb-10',
      diff: 3,
      q: '<p>Ilgaz Bank dolandırıcılık ekibi için <code>supheli_islemler(df, kat=2.0)</code> fonksiyonu yaz. <code>df</code>: <code>islem_id</code>, <code>musteri_id</code>, <code>tutar</code> sütunlu polars DataFrame. Bir işlem, <b>aynı müşterinin diğer işlemlerinin ortalamasının</b> <code>kat</code> katından büyükse şüphelidir (işlemin kendisi ortalamaya katılmaz). Tek işlemi olan müşterinin işlemleri şüpheli sayılmaz. Şüpheli <code>islem_id</code>\'leri artan sırada liste olarak döndür. Döngü kullanmadan polars ifadeleriyle (<code>over</code>) çöz.</p>',
      start: 'import polars as pl\n\n\ndef supheli_islemler(df, kat=2.0):\n    pass\n',
      sol: 'import polars as pl\n\n\ndef supheli_islemler(df, kat=2.0):\n    toplam = pl.col("tutar").sum().over("musteri_id")\n    adet = pl.len().over("musteri_id")\n    sonuc = (\n        df.with_columns(\n            ((toplam - pl.col("tutar")) / (adet - 1)).alias("diger_ort"),\n            adet.alias("adet"),\n        )\n        .filter((pl.col("adet") > 1) & (pl.col("tutar") > kat * pl.col("diger_ort")))\n        .sort("islem_id")\n    )\n    return sonuc["islem_id"].to_list()\n',
      tests: 'import polars as pl\n_d = pl.DataFrame({\n    "islem_id": [1, 2, 3, 4, 5, 6, 7, 8],\n    "musteri_id": [10, 10, 10, 20, 20, 30, 10, 20],\n    "tutar": [100.0, 120.0, 900.0, 300.0, 320.0, 5000.0, 110.0, 650.0],\n})\nassert supheli_islemler(_d) == [3, 8], f"[3, 8] bekleniyordu: 900 > 2*110 ve 650 > 2*310; tek işlemli müşteri 30 şüpheli değil. Gelen {supheli_islemler(_d)}"\nassert supheli_islemler(_d, kat=10) == [], "kat=10 iken şüpheli yok"\nassert supheli_islemler(_d, kat=1.05) == [3, 8], "kat=1.05 iken de yalnızca 3 ve 8 şüpheli: diğer işlemler kendi dışındaki ortalamanın altında"\nassert supheli_islemler(_d.filter(pl.col("musteri_id") == 30)) == [], "tek işlem varsa boş liste"\nassert "over" in __source__, "grup içi hesap için over kullan"\n',
      hints: [
        'Diğer işlemlerin ortalaması = (müşteri toplamı - bu tutar) / (müşteri işlem sayısı - 1).',
        'pl.col("tutar").sum().over("musteri_id") ve pl.len().over("musteri_id") her satıra müşteri toplamını ve adedini yazar.',
        'adet > 1 koşulunu filtreye ekle; sıfıra bölme sonucu (inf/NaN) bu satırları zaten dışarıda bırakır ama açık koşul daha okunur.'
      ],
      why: 'Kendisini hariç tutan ortalama (leave-one-out), aşırı uç bir işlemin kendi eşiğini yükseltmesini engeller. over sayesinde gruplayıp geri birleştirmeden her satıra grup istatistiği yazılır; işlem tamamen vektörleştirilmiştir.' },
    { t: 'code',
      stage: 'Mini proje',
      id: 'polars-duckdb-11',
      diff: 3,
      q: '<p>Anadolu Market sabah raporu. <code>sabah_raporu(csv_yolu)</code> fonksiyonu yaz:</p><ol><li><code>pl.read_csv(...).lazy()</code> ile dosyayı <b>lazy</b> plana çevir (bilgisayarında <code>pl.scan_csv</code>) (sütunlar: <code>gun, sehir, tutar, iade</code>).</li><li>İade edilmeyen (<code>iade == 0</code>) siparişlerden gün bazında <code>ciro</code> (toplam) ve <code>adet</code> hesapla, güne göre sırala, <code>collect</code> et.</li><li>Aynı süzülmüş veri üzerinde <b>DuckDB</b> ile en yüksek ciroya sahip şehri bul (eşitlikte alfabetik ilk).</li><li><code>{"gunluk": [(gun, ciro, adet), ...], "en_iyi_sehir": "..."}</code> sözlüğünü döndür.</li></ol>',
      start: 'import polars as pl\nimport duckdb\n\n\ndef sabah_raporu(csv_yolu):\n    pass\n',
      sol: 'import polars as pl\nimport duckdb\n\n\ndef sabah_raporu(csv_yolu):\n    gecerli = pl.read_csv(csv_yolu).lazy().filter(pl.col("iade") == 0)\n    gunluk = (\n        gecerli.group_by("gun")\n        .agg(pl.col("tutar").sum().alias("ciro"), pl.len().alias("adet"))\n        .sort("gun")\n        .collect()\n    )\n    satirlar = gecerli.collect()\n    en_iyi = duckdb.sql("""\n        SELECT sehir FROM satirlar\n        GROUP BY sehir\n        ORDER BY SUM(tutar) DESC, sehir\n        LIMIT 1\n    """).fetchall()[0][0]\n    return {"gunluk": gunluk.rows(), "en_iyi_sehir": en_iyi}\n',
      tests: 'with open("rapor.csv", "w", encoding="utf-8") as _f:\n    _f.write("gun,sehir,tutar,iade\\n2025-03-02,İzmir,500,0\\n2025-03-01,Ankara,900,0\\n2025-03-01,İzmir,300,0\\n2025-03-01,Bursa,5000,1\\n2025-03-02,Ankara,100,0\\n2025-03-03,Bursa,200,0\\n")\n_r = sabah_raporu("rapor.csv")\nassert _r["gunluk"] == [("2025-03-01", 1200, 2), ("2025-03-02", 600, 2), ("2025-03-03", 200, 1)], f"günlük özet yanlış (iade satırı dışarıda olmalı, güne göre sıralı): {_r[\'gunluk\']}"\nassert _r["en_iyi_sehir"] in ("Ankara", "İzmir"), "iadeler çıkarılınca Bursa en iyi olamaz"\nassert _r["en_iyi_sehir"] == "Ankara", "Ankara 1000 ile İzmir 800\'ü geçer"\nassert ".lazy()" in __source__ and "duckdb" in __source__, "lazy plan (.lazy()) ve DuckDB birlikte kullanılmalı"\n',
      hints: [
        'Ortak başlangıç: gecerli = pl.read_csv(yol).lazy().filter(pl.col("iade") == 0)',
        'Günlük özet: group_by("gun").agg(... sum ..., pl.len()...).sort("gun").collect().rows()',
        'DuckDB için LazyFrame\'i collect edip bir değişkene ata, sorguda o değişkenin adını kullan; ORDER BY SUM(tutar) DESC, sehir LIMIT 1.'
      ],
      why: 'Gerçek pipeline\'larda aynı süzülmüş veri birden fazla rapora beslenir. Süzmeyi bir kez tanımlayıp farklı araçlarla tüketmek tekrarı azaltır; polars ve DuckDB Arrow üzerinden aynı veriyi kopyasız paylaşır.' }
  ],
  faq: [
    { q: 'polars öğrenince pandas\'ı bırakmalı mıyım?',
      a: 'Hayır. pandas\'ın ekosistemi (scikit-learn, görselleştirme, eğitim kaynakları) çok geniş ve küçük-orta veride gayet yeterli. polars\'ı büyük ya da performans kritik işlerde kullan; to_pandas() ve from_pandas() ile iki dünya arasında kolayca geçersin.' },
    { q: 'DuckDB ile SQLite arasındaki fark ne?',
      a: 'İkisi de gömülü, sunucusuz veritabanıdır. SQLite satır tabanlı ve işlem (OLTP) odaklıdır: tek tek kayıt ekleme/güncelleme için idealdir. DuckDB sütun tabanlı ve analitik (OLAP) odaklıdır: milyonlarca satırda toplama, gruplama ve birleştirme için çok daha hızlıdır.' },
    { q: 'Lazy modda hata nerede çıkar?',
      a: 'Çoğu şema hatası (olmayan sütun gibi) collect() anında ortaya çıkar, zincirin yazıldığı satırda değil. Hata ayıklarken zincirin bir kısmını collect edip ara sonuca bakmak ya da lf.collect_schema() ile sütunları görmek işe yarar.' },
    { q: 'Parquet dosyasını Excel\'de açabilir miyim?',
      a: 'Doğrudan açamazsın; ikili bir biçimdir. İş birimine teslim edeceğin küçük özetleri CSV ya da Excel\'e çevir; ham veriyi ve ara katmanları Parquet\'te tut.' },
    { q: 'Spark öğrenmek için küme kurmam gerekiyor mu?',
      a: 'Hayır. pip install pyspark ile kendi bilgisayarında local[*] modunda çalıştırıp API\'yi öğrenebilirsin. Gerçek ölçek için şirketler genellikle yönetilen servisler (Databricks, EMR, Dataproc gibi) kullanır.' }
  ],
  mistakes: [
    { bad: 'plan = pl.scan_csv("s.csv").filter(pl.col("tutar") > 0)\nprint(plan.rows())',
      good: 'plan = pl.scan_csv("s.csv").filter(pl.col("tutar") > 0)\nprint(plan.collect().rows())',
      why: 'LazyFrame bir plandır, veri değildir; sonucu almak için collect() gerekir.' },
    { bad: 'df["kdvli"] = df["tutar"] * 1.2   # polars',
      good: 'df = df.with_columns((pl.col("tutar") * 1.2).alias("kdvli"))',
      why: 'polars DataFrame\'leri yerinde atamayı desteklemez; with_columns yeni DataFrame döndürür, sonucu değişkene ata.' },
    { bad: 'duckdb.sql("SELECT * FROM df WHERE sehir = \\"İzmir\\"")',
      good: 'duckdb.execute("SELECT * FROM df WHERE sehir = ?", ["İzmir"])',
      why: 'SQL\'de çift tırnak sütun adıdır; metin için tek tırnak ya da daha iyisi parametre kullan.' },
    { bad: 'ortalama = sum(parca["tutar"].mean() for parca in parcalar) / parca_sayisi',
      good: 'toplam = adet = 0\nfor parca in parcalar:\n    toplam += parca["tutar"].sum(); adet += len(parca)\nortalama = toplam / adet',
      why: 'Parça ortalamalarının ortalaması, parçalar eşit boyutta değilse yanlıştır; toplam ve adet biriktir.' },
    { bad: 'ozet = df.group_by("sehir").agg(pl.col("tutar").sum())\nprint(ozet.rows()[0])  # en büyük şehir sanılıyor',
      good: 'ozet = df.group_by("sehir").agg(pl.col("tutar").sum()).sort("tutar", descending=True)\nprint(ozet.rows()[0])',
      why: 'group_by çıktısının sırası garanti değildir; sıralamaya dayanıyorsan açıkça sort ekle.' }
  ]
});
})(window);
