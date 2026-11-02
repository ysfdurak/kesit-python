/* PythonPatika — ileri: postgresql-python */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push({
  id: 'postgresql-python',
  lv: 'ileri',
  mod: 'Mimari',
  min: 60,
  needs: ['sqlite3', 'duckdb'],
  title: 'PostgreSQL ile Python: psycopg, transaction, indeks ve toplu yükleme',
  sum: 'Üretim veritabanı PostgreSQL\'e psycopg 3 ile bağlanırsın: parametreli sorgu, havuz, transaction ve kilit, ON CONFLICT ile upsert, RETURNING, COPY ile toplu yükleme, indeks ve EXPLAIN; alıştırmalar sqlite3 ve DuckDB eşdeğerleriyle çalışır.',
  goals: [
    'SQLite ile PostgreSQL arasındaki mimari farkları açıklayıp hangisinin ne zaman seçileceğine karar verebilirim.',
    'psycopg 3 ile parametreli sorgu, dict_row ve bağlantı havuzu kullanan güvenli veri erişim kodu yazabilirim.',
    'Transaction, izolasyon seviyesi, FOR UPDATE ve koşullu UPDATE ile yarış durumlarını önleyebilirim.',
    'ON CONFLICT ile idempotent upsert, RETURNING ile üretilen değerleri alma ve COPY/executemany ile toplu yükleme yapabilirim.',
    'İndeks türlerini seçip EXPLAIN çıktısında tarama ile indeks kullanımını ayırt edebilirim.'
  ],
  body: `
<h2>Neden PostgreSQL?</h2>
<p>Anadolu Market'in ilk sürümü tek bir SQLite dosyasıyla çalıştı. Sonra mobil uygulama, mağaza kasaları ve depo sistemi aynı anda sipariş yazmaya başladı. SQLite tek dosya ve tek yazar (single writer) mantığıyla tasarlanmıştır: aynı anda iki işlem yazmak isterse biri bekler, ağ üzerinden erişim yoktur, kullanıcı ve yetki kavramı yoktur. Bu noktada ekipler çoğunlukla <b>PostgreSQL</b>'e geçer: istemci-sunucu (client-server) mimarisinde çalışan, aynı anda yüzlerce bağlantıyı MVCC (çok sürümlü eşzamanlılık denetimi, multi-version concurrency control) ile yöneten, rolleri, şemaları, zengin türleri (JSONB, dizi, aralık, UUID) ve gelişmiş indeksleri olan açık kaynak ilişkisel veritabanı.</p>
<p>Bu derste PostgreSQL'e Python'dan <b>psycopg 3</b> ile bağlanmayı, transaction ve kilitleri, <code>ON CONFLICT</code> ile upsert'i, <code>RETURNING</code>'i, <code>COPY</code> ile toplu yüklemeyi, indeks ve <code>EXPLAIN</code> okumayı öğreneceksin. SQL'in temelini <i>sqlite-python</i> dersinde gördün; ORM katmanı <i>sqlalchemy-orm</i> dersinde gelecek. Bu ders ikisinin arasındaki köprüdür: ham sürücü (driver) ile üretim veritabanı.</p>
<div class="note"><b>Kendi bilgisayarında dene</b>PostgreSQL bir sunucu ister ve bu sayfadaki tarayıcı motorunda çalışmaz. Gri kutulardaki (<code>psycopg</code>) kodları kendi bilgisayarında Docker ile dene. Yeşil kutular ve tüm alıştırmalar aynı kavramları <b>sqlite3</b> ve <b>DuckDB</b> ile burada çalıştırır; sözdizimi çoğu yerde bire bir aynıdır (<code>ON CONFLICT</code>, <code>RETURNING</code>, <code>EXPLAIN</code>). Kurulum: <code>pip install "psycopg[binary]" psycopg-pool</code></div>

<h2>SQLite ile PostgreSQL arasındaki farklar</h2>
<div class="tbl-wrap"><table>
<tr><th>Konu</th><th>SQLite</th><th>PostgreSQL</th></tr>
<tr><td>Mimari</td><td>Gömülü kütüphane, tek dosya</td><td>Ağ üzerinden erişilen sunucu</td></tr>
<tr><td>Eşzamanlı yazma</td><td>Aynı anda tek yazar (veritabanı kilidi)</td><td>Satır düzeyinde kilit, MVCC; okuyan yazanı beklemez</td></tr>
<tr><td>Türler</td><td>Esnek tür (type affinity): TEXT sütuna sayı girer</td><td>Katı türler: <code>numeric</code>, <code>timestamptz</code>, <code>jsonb</code>, <code>uuid</code>, diziler</td></tr>
<tr><td>Kullanıcılar</td><td>Yok; dosya izni neyse o</td><td>Roller, <code>GRANT</code>, satır düzeyi güvenlik (RLS)</td></tr>
<tr><td>Parametre</td><td><code>?</code> ve <code>:ad</code></td><td>psycopg'de <code>%s</code> ve <code>%(ad)s</code></td></tr>
<tr><td>Toplu yükleme</td><td><code>executemany</code></td><td><code>COPY</code> (çok daha hızlı)</td></tr>
<tr><td>İndeks</td><td>B-tree, kısmi indeks</td><td>B-tree, GIN, GiST, BRIN, hash, kısmi ve ifade indeksi</td></tr>
<tr><td>Ne zaman?</td><td>Masaüstü, mobil, test, tek süreçli araç</td><td>Çok kullanıcılı web/API, üretim verisi</td></tr>
</table></div>

<h2>Docker'da PostgreSQL başlatmak</h2>
<p>Bilgisayarına PostgreSQL kurmak yerine resmi Docker imajını çalıştırmak en temiz yoldur (Docker'ı <i>docker-deploy</i> dersinde göreceksin):</p>
<pre class="code">docker run --name pg-anadolu -e POSTGRES_PASSWORD=gizli -e POSTGRES_DB=market \\
  -p 5432:5432 -d postgres:16
docker exec -it pg-anadolu psql -U postgres -d market   # SQL kabuğu</pre>
<p>Bağlantı bilgisi tek bir metinle (DSN ya da bağlantı URL'si) verilir: <code>postgresql://postgres:gizli@localhost:5432/market</code>. Parolayı koda yazma; ortam değişkeninden oku (<i>yapilandirma</i> dersi).</p>

<h2>psycopg 3: bağlantı, imleç ve parametreler</h2>
<pre class="code">import os
import psycopg
from psycopg.rows import dict_row

DSN = os.environ["DATABASE_URL"]

with psycopg.connect(DSN, row_factory=dict_row) as con:      # çıkışta commit (hata varsa rollback) + kapanış
    with con.cursor() as cur:
        cur.execute(
            "SELECT customer_id, city FROM customers WHERE city = %s AND segment = %s",
            ("İzmir", "Premium"),
        )
        for satir in cur.fetchall():
            print(satir["customer_id"], satir["city"])      # dict_row: sözlük gibi erişim</pre>
<p>Üç kural: (1) değerleri <b>her zaman</b> parametre olarak ver, asla f-string ile SQL'e gömme (SQL enjeksiyonu); (2) <code>%s</code> Python'un yüzde biçimlendirmesi <i>değildir</i>, psycopg'nin yer tutucusudur ve tırnaksız yazılır; (3) bağlantıyı <code>with</code> ile aç ki hata olsa da kapansın. Aynı fikir sqlite3'te <code>?</code> ve <code>row_factory</code> ile çalışır:</p>
<pre class="py">import sqlite3
import veri

con = veri.baglan("anadolu_market", tablolar=["customers"])
con.row_factory = sqlite3.Row                  # psycopg'deki dict_row'un karşılığı
sql = "SELECT customer_id, city, segment FROM customers WHERE city = ? AND segment = ? ORDER BY customer_id LIMIT 3"
for satir in con.execute(sql, ("İzmir", "Premium")):
    print(dict(satir))</pre>
<div class="tbl-wrap"><table>
<tr><th>Sürücü</th><th>Konumsal</th><th>Adlı</th></tr>
<tr><td>psycopg (PostgreSQL)</td><td><code>%s</code></td><td><code>%(sehir)s</code></td></tr>
<tr><td>sqlite3</td><td><code>?</code></td><td><code>:sehir</code></td></tr>
<tr><td>duckdb</td><td><code>?</code> ya da <code>$1</code></td><td><code>$sehir</code></td></tr>
</table></div>

<h3>Bağlantı havuzu</h3>
<p>Her HTTP isteğinde yeni bağlantı açmak pahalıdır (TCP, kimlik doğrulama, sunucuda yeni süreç). Web uygulamaları bir <b>bağlantı havuzu</b> (connection pool) kullanır: birkaç bağlantı açık tutulur, istek gelince ödünç verilir, iş bitince geri alınır.</p>
<pre class="code">from psycopg_pool import ConnectionPool

havuz = ConnectionPool(DSN, min_size=2, max_size=10, timeout=5)   # 5 sn içinde boş bağlantı yoksa PoolTimeout

def musteri_getir(musteri_id):
    with havuz.connection() as con:             # ödünç al; blok bitince commit + havuza iade
        return con.execute("SELECT * FROM customers WHERE customer_id = %s", (musteri_id,)).fetchone()</pre>

<h2>Transaction, izolasyon ve kilitler</h2>
<p>Transaction (işlem bütünlüğü), birden çok SQL komutunun "ya hep ya hiç" çalışmasıdır. psycopg'de bağlantı açıldığında ilk komutla transaction kendiliğinden başlar; <code>with psycopg.connect(...)</code> bloğu başarıyla biterse <code>commit</code>, hata çıkarsa <code>rollback</code> yapılır. Bir bağlantı içinde ayrı bir alt blok için <code>with con.transaction():</code> kullanılır.</p>
<div class="tbl-wrap"><table>
<tr><th>İzolasyon seviyesi</th><th>Ne garanti eder?</th><th>Ne zaman?</th></tr>
<tr><td>READ COMMITTED (varsayılan)</td><td>Yalnız onaylanmış veriyi görürsün; aynı sorgu iki kez farklı sonuç verebilir</td><td>Çoğu web isteği</td></tr>
<tr><td>REPEATABLE READ</td><td>Transaction boyunca aynı anlık görüntü (snapshot)</td><td>Tutarlı rapor, dışa aktarım</td></tr>
<tr><td>SERIALIZABLE</td><td>Sanki işlemler sırayla çalışmış gibi; çakışmada hata verir, yeniden denersin</td><td>Para, envanter gibi kritik kurallar</td></tr>
</table></div>
<p>Klasik yarış durumu (race condition): iki müşteri son kalan ürünü aynı anda alıyor. İkisi de "stok 1" okur, ikisi de 0'a düşürür, depo eksiye girer. PostgreSQL'de çözüm satırı okurken kilitlemektir: <code>SELECT ... FOR UPDATE</code>. Aynı satırı kilitlemek isteyen ikinci işlem birincinin commit'ini bekler. Havayolu koltuk seçimi gibi kuyruk işlerinde <code>FOR UPDATE SKIP LOCKED</code> kilitli satırları atlayıp boş olana geçer.</p>
<pre class="code">with psycopg.connect(DSN) as con:
    with con.transaction():
        stok = con.execute(
            "SELECT stock FROM products WHERE product_id = %s FOR UPDATE", (urun_id,)
        ).fetchone()[0]
        if stok &lt; adet:
            raise ValueError("Yetersiz stok")
        con.execute("UPDATE products SET stock = stock - %s WHERE product_id = %s", (adet, urun_id))</pre>
<p>Çoğu zaman daha basit ve aynı derecede güvenli bir yol vardır: <b>koşullu güncelleme</b>. Kontrolü ve değişikliği tek bir atomik <code>UPDATE</code> içine koyar, kaç satırın etkilendiğine bakarsın. Bu kalıp SQLite'ta da, PostgreSQL'de de çalışır:</p>
<pre class="py">import veri

con = veri.baglan("anadolu_market", tablolar=["products"])

def stok_dus(con, urun_id, adet):
    with con:                                   # commit ya da hata olursa rollback
        cur = con.execute(
            "UPDATE products SET stock = stock - ? WHERE product_id = ? AND stock &gt;= ?",
            (adet, urun_id, adet),
        )
    return cur.rowcount == 1                    # 0 ise stok yetmedi (ya da ürün yok)

print("ilk stok:", con.execute("SELECT stock FROM products WHERE product_id = 1").fetchone()[0])
print(stok_dus(con, 1, 70), stok_dus(con, 1, 10))
print("son stok:", con.execute("SELECT stock FROM products WHERE product_id = 1").fetchone()[0])</pre>

<h2>Upsert ve RETURNING</h2>
<p>Tedarikçiden fiyat listesi geliyor: bazı ürünler yeni, bazıları mevcut. "Varsa güncelle, yoksa ekle" işlemine <b>upsert</b> denir. PostgreSQL ve SQLite aynı sözdizimini kullanır: <code>INSERT ... ON CONFLICT (anahtar) DO UPDATE SET ...</code>. <code>excluded</code> eklenmek istenen satırdır. <code>RETURNING</code> ise eklenen ya da güncellenen satırı ayrı bir SELECT'e gerek kalmadan geri döndürür; sunucunun ürettiği id'yi almanın standart yoludur.</p>
<pre class="py">import veri

con = veri.baglan("anadolu_market", tablolar=["price_updates"])
con.execute("CREATE TABLE guncel_fiyat (product_id INTEGER PRIMARY KEY, fiyat REAL, guncellendi TEXT)")

guncellemeler = con.execute(
    "SELECT product_id, new_price, updated_at FROM price_updates ORDER BY updated_at"
).fetchall()
with con:
    for urun, fiyat, zaman in guncellemeler:
        con.execute("""
            INSERT INTO guncel_fiyat VALUES (?, ?, ?)
            ON CONFLICT (product_id) DO UPDATE
               SET fiyat = excluded.fiyat, guncellendi = excluded.guncellendi
             WHERE excluded.guncellendi &gt; guncel_fiyat.guncellendi
        """, (urun, fiyat, zaman))

print(len(guncellemeler), "güncelleme -&gt;", con.execute("SELECT COUNT(*) FROM guncel_fiyat").fetchone()[0], "ürün")
print(con.execute("SELECT * FROM guncel_fiyat WHERE product_id IN (30, 31) ORDER BY product_id").fetchall())

cur = con.execute("INSERT INTO guncel_fiyat VALUES (99, 120.0, '2025-01-01') RETURNING product_id, fiyat")
print("RETURNING:", cur.fetchall())</pre>
<p>Upsert'teki <code>WHERE</code> koşulu çok önemlidir: dosyalar geç ya da sırasız gelirse eski fiyatın yenisinin üstüne yazılmasını engeller. Böylece aynı dosyayı iki kez yüklemek de sonucu değiştirmez (idempotent yükleme, <i>veri-boru-hatti</i>).</p>

<h2>Toplu yükleme: COPY ve executemany</h2>
<p>Satır satır <code>INSERT</code> her satır için sunucuya bir gidiş-dönüş demektir. 100 bin satırda bu dakikalar sürer. Hız sıralaması kabaca şöyledir: döngüde tek tek <code>execute</code> &lt; <code>executemany</code> &lt; çok satırlı <code>VALUES</code> &lt; <code>COPY</code>. psycopg 3'te <code>COPY</code> Python'dan akış olarak beslenebilir:</p>
<pre class="code">with psycopg.connect(DSN) as con, con.cursor() as cur:
    with cur.copy("COPY order_items (item_id, order_id, product_id, quantity, unit_price, discount) FROM STDIN") as cp:
        for satir in satirlar:            # demetler
            cp.write_row(satir)</pre>
<p>DuckDB'de de aynı <code>COPY ... FROM</code> komutu vardır ve CSV dosyasını tek komutla tabloya yükler. Gerçek veriyle dene:</p>
<pre class="py">import duckdb
import veri

con = duckdb.connect()
con.execute("""CREATE TABLE siparis (order_id INTEGER PRIMARY KEY, customer_id INTEGER,
               order_date DATE, status TEXT, channel TEXT)""")
con.execute(f"COPY siparis FROM '{veri.yol('anadolu_market', 'orders')}' (HEADER)")
print(con.execute("SELECT status, COUNT(*) FROM siparis GROUP BY status ORDER BY status").fetchall())</pre>
<div class="warn"><b>Dosya yolu f-string ile, değer asla</b>Yukarıdaki f-string yalnızca senin kontrolündeki dosya yolunu SQL'e koyar. Kullanıcıdan gelen bir değeri (şehir, ad, filtre) asla bu şekilde gömme; onları <code>?</code> ile parametre geçir.</div>

<h2>İndeks ve EXPLAIN</h2>
<p>İndeks, kitabın sonundaki dizin gibidir: tüm sayfaları taramak yerine doğrudan ilgili yere gider. PostgreSQL'de en sık iki tür:</p>
<ul>
<li><b>B-tree</b> (varsayılan): eşitlik, aralık (<code>&lt;</code>, <code>BETWEEN</code>), sıralama. <code>customer_id</code>, <code>order_date</code> gibi sütunlar.</li>
<li><b>GIN</b>: bir değerin içindeki parçaları indeksler; JSONB anahtarları, diziler ve tam metin arama için.</li>
</ul>
<p><code>EXPLAIN ANALYZE</code> sorguyu gerçekten çalıştırır ve planı süreleriyle gösterir. <code>Seq Scan</code> tüm tabloyu taramak, <code>Index Scan</code> indeksle gitmektir. Tahmini satır (<code>rows=</code>) ile gerçek satır arasında büyük fark varsa istatistikler eskidir (<code>ANALYZE tablo</code>).</p>
<pre class="code">CREATE INDEX ix_orders_customer ON orders (customer_id);
EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 42;
--  Index Scan using ix_orders_customer on orders  (cost=0.28..8.40 rows=6 width=40)
--                                      (actual time=0.015..0.019 rows=6 loops=1)
--  Planning Time: 0.08 ms   Execution Time: 0.04 ms</pre>
<p>SQLite'ta karşılığı <code>EXPLAIN QUERY PLAN</code>'dır: <code>SCAN</code> tam tarama, <code>SEARCH ... USING INDEX</code> indeks kullanımıdır.</p>
<pre class="py">import veri

con = veri.baglan("anadolu_market", tablolar=["orders"])
sql = "SELECT * FROM orders WHERE customer_id = ?"
plan = lambda: con.execute("EXPLAIN QUERY PLAN " + sql, (42,)).fetchall()[0][-1]
print("önce :", plan())
con.execute("CREATE INDEX ix_orders_customer ON orders (customer_id)")
print("sonra:", plan())
print(len(con.execute(sql, (42,)).fetchall()), "sipariş")</pre>
<div class="tip"><b>İndeks bedava değildir</b>Her indeks her INSERT/UPDATE'te güncellenir ve disk kaplar. Sık filtrelenen, birleştirilen (JOIN) ve sıralanan sütunlara indeks koy; "her sütuna bir indeks" yaklaşımı yazmayı yavaşlatır.</div>

<h2>JSONB ve pgvector'a kısa bakış</h2>
<p>PostgreSQL yarı yapılandırılmış veriyi <code>jsonb</code> sütununda ikili biçimde saklar ve GIN ile indeksler. Örneğin ürün özellikleri: <code>WHERE ozellik @&gt; '{"renk": "siyah"}'</code>. <b>pgvector</b> eklentisi ise embedding vektörlerini saklayıp en yakın komşu araması yapar; RAG uygulamalarında ayrı bir vektör veritabanı yerine sık seçilir. SQLite'ta da JSON fonksiyonları vardır:</p>
<pre class="py">import json
import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE urun (id INTEGER PRIMARY KEY, ozellik TEXT)")
con.executemany("INSERT INTO urun VALUES (?, ?)", [
    (1, json.dumps({"renk": "siyah", "garanti": 2})),
    (2, json.dumps({"renk": "beyaz", "garanti": 1})),
])
print(con.execute("SELECT id, json_extract(ozellik, '$.garanti') FROM urun WHERE json_extract(ozellik, '$.renk') = ?", ("siyah",)).fetchall())</pre>

<h2>Migration disiplini, sızıntı ve zaman aşımı</h2>
<p>Üretim veritabanında tabloyu elle <code>ALTER</code> etmezsin. Her şema değişikliği sürüm numaralı bir <b>migration</b> dosyasıdır ve kodla birlikte gözden geçirilir; Python dünyasında araç <b>Alembic</b>'tir (<i>sqlalchemy-orm</i> dersinde). İki işletim hatası da sık görülür:</p>
<ul>
<li><b>Bağlantı sızıntısı</b>: <code>with</code> kullanmadan açılan ve hata yolunda kapanmayan bağlantılar havuzu tüketir; uygulama "PoolTimeout" ile kilitlenir.</li>
<li><b>Açık kalan transaction</b>: <code>idle in transaction</code> durumundaki bağlantı kilitleri tutar, diğer işlemleri bekletir.</li>
</ul>
<pre class="code">psycopg.connect(DSN, connect_timeout=5, options="-c statement_timeout=3000")   # 3 sn'den uzun sorguyu iptal et
-- sunucuda: ALTER ROLE uygulama SET idle_in_transaction_session_timeout = '30s';</pre>
<div class="note"><b>Gerçek işte</b>Bir e-ticaret kampanyasında en sık görülen veritabanı olayı yavaş bir sorgu değil, havuzun tükenmesidir: bir uç nokta hata yolunda bağlantıyı iade etmez, birkaç dakika içinde tüm istekler beklemeye düşer. Kıdemli ekipler üç şeyi standart yapar: bağlantı her zaman <code>with</code> bloğunda, her sorguda <code>statement_timeout</code>, ve stok, bakiye gibi sayaçlarda koşullu <code>UPDATE ... WHERE stok &gt;= ?</code> ya da <code>FOR UPDATE</code>. Kod incelemesinde f-string ile kurulmuş SQL gören herkes durdurur.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>MVCC ve VACUUM</h3>
<p>PostgreSQL bir satırı güncellediğinde eskisinin üstüne yazmaz; yeni bir sürüm oluşturur. Eski sürümler, onu görebilecek açık transaction kalmayınca <b>VACUUM</b> ile temizlenir. Uzun süre açık kalan bir transaction temizliği durdurur ve tablo şişer (bloat). Bu yüzden rapor sorgularını kısa tut ya da ayrı bir okuma kopyasına (read replica) yönlendir.</p>
<h3>Havuz boyutu</h3>
<p>Havuzu büyütmek her zaman hızlandırmaz. Sunucu çekirdek sayısının birkaç katından fazla eşzamanlı sorgu, bağlam değişimi ve kilit rekabeti yüzünden yavaşlatır. Çok sayıda uygulama örneğin varsa araya <b>PgBouncer</b> gibi bir havuzlayıcı koy.</p>
<h3>Serileştirme hatasını yeniden denemek</h3>
<p>SERIALIZABLE kullanıyorsan çakışan işlem <code>SerializationFailure</code> ile reddedilir. Doğru tepki, işlemi baştan, kısa bir bekleme ile birkaç kez yeniden denemektir; bunu bir dekoratörle (<i>dekoratorler</i>) sarmak yaygındır.</p>
<h3>Async sürücü</h3>
<p>psycopg 3 aynı API'yi <code>psycopg.AsyncConnection</code> ile async olarak da sunar; FastAPI gibi async çatılarda <code>await cur.execute(...)</code> yazarsın. Alternatif hızlı async sürücü <b>asyncpg</b>'dir (yer tutucusu <code>$1</code>).</p>
</section>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: 'psycopg ile <code>cur.execute("SELECT * FROM customers WHERE city = %s", (sehir,))</code> yazıldı. <code>%s</code> burada ne işe yarar?',
      o: [
        'Python\'un yüzde biçimlendirmesi; değer metne gömülür',
        'Sürücünün yer tutucusu; değer ayrı ve güvenli gönderilir',
        'Yalnızca metin (str) değerler için kullanılan bir şablon',
        'PostgreSQL\'in kendi değişken sözdizimi; Python karışmaz'
      ],
      a: 1,
      why: 'psycopg %s\'yi bir yer tutucu (placeholder) olarak kullanır ve değeri SQL metninden ayrı, doğru tırnaklama ve türle iletir. Sayı, tarih, None için de %s yazılır. Metne kendin gömersen (f-string ya da %) SQL enjeksiyonuna açık olursun.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'İki kasa aynı anda son kalan ürünü satmaya çalışıyor. Aşağıdakilerden hangisi stoğun eksiye düşmesini <b>engellemez</b>?',
      o: [
        'SELECT ... FOR UPDATE ile satırı kilitleyip sonra güncellemek',
        'UPDATE ... SET stok = stok - 1 WHERE id = ? AND stok >= 1 ve rowcount kontrolü',
        'Önce SELECT ile stoğa bakıp Python\'da kontrol edip ayrı bir UPDATE yazmak',
        'Stok sütununa CHECK (stok >= 0) kısıtı eklemek'
      ],
      a: 2,
      why: 'Kilitsiz "oku, kontrol et, yaz" iki işlem arasında yarış durumuna açıktır: ikisi de aynı eski değeri okur. FOR UPDATE satırı kilitler, koşullu UPDATE kontrolü atomik yapar, CHECK kısıtı ise veritabanının ihlali reddetmesini sağlar.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Ürünlerin <code>ozellik jsonb</code> sütununda <code>ozellik @&gt; \'{"renk": "siyah"}\'</code> sorgusunu hızlandırmak için hangi indeks türü uygundur?',
      o: ['B-tree', 'GIN', 'Hash', 'İndeks gerekmez; jsonb kendiliğinden hızlıdır'],
      a: 1,
      why: 'GIN (generalized inverted index) bir değerin içindeki anahtar ve elemanları ayrı ayrı indeksler; jsonb içerme (@>), diziler ve tam metin arama için tasarlanmıştır. B-tree bütün değeri sıralar, içerik sorgusunda işe yaramaz.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Upsert sonrası tablo ne olur? Bu kod ne yazdırır?',
      code: 'import sqlite3\n\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE stok (sku TEXT PRIMARY KEY, adet INTEGER)")\ncon.execute("INSERT INTO stok VALUES (\'A\', 5)")\nfor sku, adet in [("A", 3), ("B", 2), ("A", 1)]:\n    con.execute(\n        "INSERT INTO stok VALUES (?, ?) ON CONFLICT (sku) DO UPDATE SET adet = adet + excluded.adet",\n        (sku, adet),\n    )\nprint(con.execute("SELECT * FROM stok ORDER BY sku").fetchall())\n',
      o: [
        '[(\'A\', 9), (\'B\', 2)]',
        '[(\'A\', 1), (\'B\', 2)]',
        '[(\'A\', 4), (\'B\', 2)]',
        'IntegrityError'
      ],
      a: 0,
      why: 'Çakışmada mevcut adet ile eklenmek istenen (excluded.adet) toplanır: 5 + 3 + 1 = 9. B ilk kez geldiği için normal eklenir. "SET adet = excluded.adet" yazılsaydı son değer (1) kalırdı.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Havale yarıda hata verdi. Bu kod ne yazdırır?',
      code: 'import sqlite3\n\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE hesap (no TEXT PRIMARY KEY, bakiye INTEGER CHECK (bakiye >= 0))")\ncon.executemany("INSERT INTO hesap VALUES (?, ?)", [("A", 100), ("B", 50)])\ncon.commit()\ntry:\n    with con:\n        con.execute("UPDATE hesap SET bakiye = bakiye + 80 WHERE no = \'B\'")\n        con.execute("UPDATE hesap SET bakiye = bakiye - 80 WHERE no = \'A\'")\n        con.execute("UPDATE hesap SET bakiye = bakiye - 80 WHERE no = \'A\'")\nexcept sqlite3.IntegrityError:\n    print("reddedildi")\nprint(con.execute("SELECT bakiye FROM hesap ORDER BY no").fetchall())\n',
      o: [
        'reddedildi\n[(20,), (130,)]',
        'reddedildi\n[(100,), (50,)]',
        '[(-60,), (130,)]',
        'reddedildi\n[(100,), (130,)]'
      ],
      a: 1,
      why: 'Üçüncü UPDATE CHECK kısıtını ihlal eder (20 - 80 < 0). with con bloğu hata görünce bütün transaction\'ı geri alır; önceki iki UPDATE de iptal olur ve bakiyeler başlangıçtaki gibi kalır.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'RETURNING ne döndürür? Bu kod ne yazdırır?',
      code: 'import sqlite3\n\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE siparis (id INTEGER PRIMARY KEY, musteri TEXT, durum TEXT DEFAULT \'yeni\')")\ncon.execute("INSERT INTO siparis (musteri) VALUES (\'Ayşe\')")\ncur = con.execute("INSERT INTO siparis (musteri) VALUES (?), (?) RETURNING id, durum", ("Can", "Ece"))\nprint(cur.fetchall())\n',
      o: [
        '[(2, \'yeni\'), (3, \'yeni\')]',
        '[(1, \'yeni\'), (2, \'yeni\')]',
        '[(3, \'yeni\')]',
        '[(2, None), (3, None)]'
      ],
      a: 0,
      why: 'RETURNING eklenen her satırı, varsayılan değerler ve üretilen id dahil, geri döndürür. Ayşe id=1 aldığı için yeni satırlar 2 ve 3; durum sütunu DEFAULT ile \'yeni\' olur.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Anadolu Market fiyat güncellemelerini sırayla uygulayıp son fiyatı tutan programın satırlarını sırala.</p>',
      lines: [
        'import veri',
        'con = veri.baglan("anadolu_market", tablolar=["price_updates"])',
        'con.execute("CREATE TABLE fiyat (product_id INTEGER PRIMARY KEY, fiyat REAL)")',
        'satirlar = con.execute("SELECT product_id, new_price FROM price_updates ORDER BY updated_at").fetchall()',
        'con.executemany("INSERT INTO fiyat VALUES (?, ?) ON CONFLICT (product_id) DO UPDATE SET fiyat = excluded.fiyat", satirlar)',
        'print(con.execute("SELECT fiyat FROM fiyat WHERE product_id = 30").fetchone()[0])'
      ],
      needs: ['sqlite3'],
      expect: '16584.0\n',
      hint: 'Tablo, kendisine yazılacak upsert\'ten önce oluşturulmalı; güncellemeler zamana göre sıralı okunmalı.',
      why: 'Ürün 30 iki kez güncellenmiştir (17536, sonra 16584). Zaman sırasıyla uygulanan upsert her seferinde fiyatı ezer ve son değer kalır.' },
    { t: 'code',
      stage: 'Rehberli',
      id: 'postgresql-python-1',
      diff: 2,
      needs: ['sqlite3'],
      q: '<p><code>fiyatlari_uygula(con)</code> fonksiyonunu yaz. <code>con</code>, <code>anadolu_market</code> setinden <code>price_updates</code> tablosunu içeren bir sqlite3 bağlantısıdır. Fonksiyon <code>guncel_fiyat(product_id INTEGER PRIMARY KEY, fiyat REAL, guncellendi TEXT)</code> tablosunu yoksa oluştursun ve her güncellemeyi upsert ile uygulasın: bir ürün için yalnızca <b>daha yeni</b> (<code>updated_at</code> büyük) kayıt eski fiyatın üstüne yazabilir. Güncellemeleri <b>bilerek ters sırada</b> (en yeniden eskiye) oku; sonuç yine doğru olmalı. Fonksiyon <code>guncel_fiyat</code> tablosundaki satır sayısını döndürsün.</p>',
      guide: [
        'CREATE TABLE IF NOT EXISTS ile hedef tabloyu kur.',
        'price_updates\'ı ORDER BY updated_at DESC ile oku.',
        'Her satır için INSERT ... ON CONFLICT (product_id) DO UPDATE SET ... yaz.',
        'Güncellemeye WHERE excluded.guncellendi > guncel_fiyat.guncellendi koşulu ekle.',
        'with con: bloğu içinde çalış ve sonunda COUNT(*) döndür.'
      ],
      example: 'import sqlite3\n\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE son_konum (arac TEXT PRIMARY KEY, konum TEXT, zaman TEXT)")\nolaylar = [("34 AB 1", "Bursa", "10:05"), ("34 AB 1", "İzmit", "09:40")]   # sırasız\nfor arac, konum, zaman in olaylar:\n    con.execute("""INSERT INTO son_konum VALUES (?, ?, ?)\n                   ON CONFLICT (arac) DO UPDATE SET konum = excluded.konum, zaman = excluded.zaman\n                   WHERE excluded.zaman > son_konum.zaman""", (arac, konum, zaman))\nprint(con.execute("SELECT * FROM son_konum").fetchall())\n',
      start: 'import veri\n\n\ndef fiyatlari_uygula(con):\n    # TODO: guncel_fiyat tablosunu (yoksa) oluştur\n    guncellemeler = con.execute(\n        "SELECT product_id, new_price, updated_at FROM price_updates ORDER BY updated_at DESC"\n    ).fetchall()\n    with con:\n        for urun, fiyat, zaman in guncellemeler:\n            pass  # TODO: yalnızca daha yeni kayıt üstüne yazan upsert\n    # TODO: guncel_fiyat satır sayısını döndür\n    return 0\n\n\ncon = veri.baglan("anadolu_market", tablolar=["price_updates"])\nprint(fiyatlari_uygula(con))\n',
      sol: 'import veri\n\n\ndef fiyatlari_uygula(con):\n    con.execute("""CREATE TABLE IF NOT EXISTS guncel_fiyat (\n        product_id INTEGER PRIMARY KEY, fiyat REAL, guncellendi TEXT)""")\n    guncellemeler = con.execute(\n        "SELECT product_id, new_price, updated_at FROM price_updates ORDER BY updated_at DESC"\n    ).fetchall()\n    with con:\n        for urun, fiyat, zaman in guncellemeler:\n            con.execute("""\n                INSERT INTO guncel_fiyat VALUES (?, ?, ?)\n                ON CONFLICT (product_id) DO UPDATE\n                   SET fiyat = excluded.fiyat, guncellendi = excluded.guncellendi\n                 WHERE excluded.guncellendi > guncel_fiyat.guncellendi\n            """, (urun, fiyat, zaman))\n    return con.execute("SELECT COUNT(*) FROM guncel_fiyat").fetchone()[0]\n\n\ncon = veri.baglan("anadolu_market", tablolar=["price_updates"])\nprint(fiyatlari_uygula(con))\n',
      tests: '_n = fiyatlari_uygula(con)\nassert _n == 16, f"18 güncelleme 16 farklı ürüne ait; tabloda 16 satır olmalı, gelen {_n}"\n_f = dict(con.execute("SELECT product_id, fiyat FROM guncel_fiyat").fetchall())\nassert _f[30] == 16584.0, f"Ürün 30\'un son fiyatı 16584 (2024-12-09); eski kayıt yenisini ezmemeli. Gelen {_f[30]}"\nassert _f[31] == 508.0, f"Ürün 31\'in son fiyatı 508 olmalı, gelen {_f[31]}"\nassert fiyatlari_uygula(con) == 16, "ikinci çalıştırma (idempotent) aynı sonucu vermeli"\nassert dict(con.execute("SELECT product_id, fiyat FROM guncel_fiyat").fetchall())[30] == 16584.0, "tekrar çalıştırınca fiyat değişmemeli"\n',
      hints: [
        'Upsert: INSERT ... ON CONFLICT (product_id) DO UPDATE SET ...',
        'excluded eklenmek istenen satırdır; mevcut satıra tablo adıyla erişirsin: guncel_fiyat.guncellendi',
        'DO UPDATE SET fiyat = excluded.fiyat, guncellendi = excluded.guncellendi WHERE excluded.guncellendi > guncel_fiyat.guncellendi'
      ],
      why: 'Koşullu upsert, kayıtlar hangi sırada gelirse gelsin son durumu doğru kurar ve tekrar çalıştırmaya dayanıklıdır. Aynı SQL PostgreSQL\'de de birebir çalışır; yalnızca yer tutucu %s olur.' },
    { t: 'code',
      stage: 'Rehberli',
      id: 'postgresql-python-2',
      diff: 2,
      q: '<p><code>siparis_olustur(con, musteri_id, kalemler)</code> yaz. <code>kalemler</code>: <code>(urun_id, adet, birim_fiyat)</code> demetleri. Tek transaction içinde <code>siparis</code> tablosuna bir satır ekle ve üretilen id\'yi <b>RETURNING</b> ile al; sonra her kalemi bu id ile <code>kalem</code> tablosuna ekle. Siparişin <code>toplam</code> sütununu kalemlerin adet × fiyat toplamıyla güncelle. Herhangi bir kalem hata verirse (ör. adet 0, CHECK ihlali) <b>hiçbir şey</b> kaydedilmemeli ve hata yukarı fırlatılmalı. Yeni sipariş id\'sini döndür.</p>',
      guide: [
        'with con: bloğu aç (hepsi ya da hiçbiri).',
        'INSERT INTO siparis (musteri_id) VALUES (?) RETURNING id ile id\'yi al: fetchone()[0].',
        'executemany ile kalemleri ekle; her demete sipariş id\'sini ekle.',
        'UPDATE siparis SET toplam = ? WHERE id = ? ile toplamı yaz ve id\'yi döndür.'
      ],
      example: 'import sqlite3\n\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE fatura (id INTEGER PRIMARY KEY, firma TEXT)")\nwith con:\n    fatura_id = con.execute("INSERT INTO fatura (firma) VALUES (?) RETURNING id", ("Ege Lojistik",)).fetchone()[0]\nprint("yeni fatura:", fatura_id)\n',
      start: 'import sqlite3\n\nSEMA = """\nCREATE TABLE siparis (id INTEGER PRIMARY KEY, musteri_id INTEGER NOT NULL, toplam REAL DEFAULT 0);\nCREATE TABLE kalem (siparis_id INTEGER REFERENCES siparis(id), urun_id INTEGER,\n                    adet INTEGER CHECK (adet > 0), birim_fiyat REAL);\n"""\n\n\ndef siparis_olustur(con, musteri_id, kalemler):\n    # TODO: with con: içinde siparişi ekle, RETURNING id ile id\'yi al\n    # TODO: kalemleri ekle\n    # TODO: toplamı güncelle ve id\'yi döndür\n    pass\n\n\ncon = sqlite3.connect(":memory:")\ncon.executescript(SEMA)\nprint(siparis_olustur(con, 7, [(27, 1, 584.0), (9, 2, 131.0)]))\n',
      sol: 'import sqlite3\n\nSEMA = """\nCREATE TABLE siparis (id INTEGER PRIMARY KEY, musteri_id INTEGER NOT NULL, toplam REAL DEFAULT 0);\nCREATE TABLE kalem (siparis_id INTEGER REFERENCES siparis(id), urun_id INTEGER,\n                    adet INTEGER CHECK (adet > 0), birim_fiyat REAL);\n"""\n\n\ndef siparis_olustur(con, musteri_id, kalemler):\n    with con:\n        sid = con.execute(\n            "INSERT INTO siparis (musteri_id) VALUES (?) RETURNING id", (musteri_id,)\n        ).fetchone()[0]\n        con.executemany(\n            "INSERT INTO kalem VALUES (?, ?, ?, ?)",\n            [(sid, u, a, f) for u, a, f in kalemler],\n        )\n        toplam = sum(a * f for _, a, f in kalemler)\n        con.execute("UPDATE siparis SET toplam = ? WHERE id = ?", (toplam, sid))\n    return sid\n\n\ncon = sqlite3.connect(":memory:")\ncon.executescript(SEMA)\nprint(siparis_olustur(con, 7, [(27, 1, 584.0), (9, 2, 131.0)]))\n',
      tests: 'import sqlite3 as _s\n_c = _s.connect(":memory:")\n_c.executescript(SEMA)\n_id1 = siparis_olustur(_c, 7, [(27, 1, 584.0), (9, 2, 131.0)])\nassert _id1 == 1, f"ilk sipariş id 1 olmalı, gelen {_id1}"\nassert _c.execute("SELECT toplam FROM siparis WHERE id = 1").fetchone()[0] == 846.0, "toplam 584 + 2*131 = 846 olmalı"\nassert _c.execute("SELECT COUNT(*) FROM kalem WHERE siparis_id = 1").fetchone()[0] == 2, "iki kalem eklenmeli"\ntry:\n    siparis_olustur(_c, 8, [(5, 1, 1899.0), (6, 0, 50.0)])\n    assert False, "adet 0 olan kalem CHECK hatası vermeli ve hata yukarı fırlatılmalı"\nexcept _s.IntegrityError:\n    pass\nassert _c.execute("SELECT COUNT(*) FROM siparis").fetchone()[0] == 1, "hatalı siparişin başlığı da geri alınmalı (yarım sipariş kalmamalı)"\nassert _c.execute("SELECT COUNT(*) FROM kalem").fetchone()[0] == 2, "hatalı siparişin ilk kalemi de geri alınmalı"\n_id3 = siparis_olustur(_c, 9, [(1, 3, 10.0)])\nassert _c.execute("SELECT musteri_id, toplam FROM siparis WHERE id = ?", (_id3,)).fetchone() == (9, 30.0), "hatalı denemeden sonra yeni sipariş sorunsuz eklenmeli ve döndürülen id o siparişi göstermeli"\nassert "RETURNING" in __source__.upper(), "id\'yi RETURNING ile al"\n',
      hints: [
        'Tüm işlemleri tek bir with con: bloğuna koy; hata olursa sqlite3 geri alır.',
        'sid = con.execute("INSERT ... RETURNING id", (musteri_id,)).fetchone()[0]',
        'Kalem demetlerine sid\'yi başa ekle: [(sid, u, a, f) for u, a, f in kalemler]'
      ],
      why: 'Başlık ve kalemler tek transaction\'da yazılınca "kalemsiz sipariş" ya da "yarım sipariş" oluşamaz. RETURNING, sunucunun ürettiği id\'yi ek bir sorgu ve yarış riski olmadan verir; PostgreSQL\'de lastrowid yoktur, standart yol budur.' },
    { t: 'code',
      stage: 'Rehberli',
      id: 'postgresql-python-3',
      diff: 2,
      needs: ['sqlite3'],
      q: '<p><code>sepeti_dus(con, sepet)</code> yaz. <code>sepet</code>: <code>{urun_id: adet}</code> sözlüğü; <code>con</code>: <code>anadolu_market</code> setinin <code>products</code> tablosunu içeren bağlantı. Her ürünün stoğunu <b>koşullu UPDATE</b> ile düş (<code>WHERE stock &gt;= ?</code>). Bir ürünün bile stoğu yetmezse <b>hiçbir</b> ürünün stoğu değişmemeli ve fonksiyon <code>False</code> döndürmeli; hepsi başarılıysa <code>True</code>. İpucu: rowcount 0 ise bir istisna fırlatıp <code>with con:</code>\'un geri almasını sağla.</p>',
      guide: [
        'Kendine küçük bir istisna sınıfı tanımla: class StokYok(Exception).',
        'try içinde with con: aç ve sepetteki her ürün için koşullu UPDATE çalıştır.',
        'cur.rowcount != 1 ise StokYok fırlat (with bloğu rollback yapar).',
        'Başarıda True, StokYok yakalanınca False döndür.'
      ],
      example: 'import sqlite3\n\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE koltuk (no TEXT PRIMARY KEY, bos INTEGER)")\ncon.executemany("INSERT INTO koltuk VALUES (?, ?)", [("1A", 1), ("1B", 0)])\ncur = con.execute("UPDATE koltuk SET bos = 0 WHERE no = ? AND bos = 1", ("1B",))\nprint("ayrıldı mı?", cur.rowcount == 1)\n',
      start: 'import veri\n\n\nclass StokYok(Exception):\n    pass\n\n\ndef sepeti_dus(con, sepet):\n    # TODO: try / with con: ile tüm sepeti tek transaction\'da düş\n    # TODO: rowcount 1 değilse StokYok fırlat\n    for urun_id, adet in sepet.items():\n        con.execute("UPDATE products SET stock = stock - ? WHERE product_id = ?", (adet, urun_id))\n    return True\n\n\ncon = veri.baglan("anadolu_market", tablolar=["products"])\nprint(sepeti_dus(con, {1: 4, 2: 1}))\n',
      sol: 'import veri\n\n\nclass StokYok(Exception):\n    pass\n\n\ndef sepeti_dus(con, sepet):\n    try:\n        with con:\n            for urun_id, adet in sepet.items():\n                cur = con.execute(\n                    "UPDATE products SET stock = stock - ? WHERE product_id = ? AND stock >= ?",\n                    (adet, urun_id, adet),\n                )\n                if cur.rowcount != 1:\n                    raise StokYok(urun_id)\n    except StokYok:\n        return False\n    return True\n\n\ncon = veri.baglan("anadolu_market", tablolar=["products"])\nprint(sepeti_dus(con, {1: 4, 2: 1}))\n',
      tests: '_c = veri.baglan("anadolu_market", tablolar=["products"])\n_s = lambda i: _c.execute("SELECT stock FROM products WHERE product_id = ?", (i,)).fetchone()[0]\nassert (_s(1), _s(2)) == (74, 71), "başlangıç stokları 74 ve 71"\nassert sepeti_dus(_c, {1: 4, 2: 1}) is True, "stok yeterliyse True"\nassert (_s(1), _s(2)) == (70, 70), f"stoklar 70 ve 70 olmalı, gelen {(_s(1), _s(2))}"\nassert sepeti_dus(_c, {1: 5, 2: 500}) is False, "ürün 2\'nin stoğu 500\'e yetmez: False"\nassert _s(1) == 70, "bir ürün yetmeyince diğerinin stoğu da geri alınmalı (ürün 1 hâlâ 70)"\nassert sepeti_dus(_c, {999: 1}) is False, "olmayan ürün de başarısız sayılmalı (rowcount 0)"\nassert sepeti_dus(_c, {1: 70}) is True and _s(1) == 0, "stoğun tamamı satılabilir (>=)"\n',
      hints: [
        'Koşul: WHERE product_id = ? AND stock >= ?',
        'Hata fırlatmak with con: bloğunun rollback yapmasını sağlar; istisnayı bloğun dışında yakala.',
        'if cur.rowcount != 1: raise StokYok(urun_id)'
      ],
      why: 'Her UPDATE kendi kontrolünü atomik yapar; sepetin tamamı tek transaction\'da olduğu için "yarım sepet" düşülmez. PostgreSQL\'de aynı kod %s ile çalışır; FOR UPDATE\'e gerek kalmadan yarış durumunu çözer.' },
    { t: 'code',
      stage: 'Rehberli',
      id: 'postgresql-python-4',
      diff: 2,
      needs: ['sqlite3'],
      q: '<p><code>plan_turu(con, sql, params)</code> yaz: sorgunun SQLite planını <code>EXPLAIN QUERY PLAN</code> ile al ve ilk plan satırının açıklama metni (son sütun) <code>"SEARCH"</code> ile başlıyorsa <code>"indeks"</code>, <code>"SCAN"</code> ile başlıyorsa <code>"tarama"</code> döndür. Sonra <code>indeksle(con)</code> yaz: <code>orders</code> tablosunda <code>customer_id</code> sütununa <code>ix_orders_customer</code> adlı indeksi <b>yoksa</b> oluştursun (iki kez çağrılınca hata vermesin).</p>',
      guide: [
        'con.execute("EXPLAIN QUERY PLAN " + sql, params).fetchall() satır listesi döndürür.',
        'İlk satırın son elemanı ([0][-1]) plan metnidir.',
        'startswith ile SEARCH / SCAN ayrımı yap.',
        'CREATE INDEX IF NOT EXISTS ix_orders_customer ON orders (customer_id)'
      ],
      example: 'import sqlite3\n\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE personel (id INTEGER PRIMARY KEY, birim TEXT)")\nsatir = con.execute("EXPLAIN QUERY PLAN SELECT * FROM personel WHERE id = 3").fetchall()[0]\nprint(satir[-1])\n',
      start: 'import veri\n\n\ndef plan_turu(con, sql, params=()):\n    # TODO: EXPLAIN QUERY PLAN ile ilk satırın açıklamasını al\n    # TODO: SEARCH -> "indeks", SCAN -> "tarama"\n    return None\n\n\ndef indeksle(con):\n    # TODO: indeksi yoksa oluştur\n    pass\n\n\ncon = veri.baglan("anadolu_market", tablolar=["orders"])\nsql = "SELECT * FROM orders WHERE customer_id = ?"\nprint(plan_turu(con, sql, (42,)))\nindeksle(con)\nprint(plan_turu(con, sql, (42,)))\n',
      sol: 'import veri\n\n\ndef plan_turu(con, sql, params=()):\n    aciklama = con.execute("EXPLAIN QUERY PLAN " + sql, params).fetchall()[0][-1]\n    if aciklama.startswith("SEARCH"):\n        return "indeks"\n    if aciklama.startswith("SCAN"):\n        return "tarama"\n    return None\n\n\ndef indeksle(con):\n    con.execute("CREATE INDEX IF NOT EXISTS ix_orders_customer ON orders (customer_id)")\n\n\ncon = veri.baglan("anadolu_market", tablolar=["orders"])\nsql = "SELECT * FROM orders WHERE customer_id = ?"\nprint(plan_turu(con, sql, (42,)))\nindeksle(con)\nprint(plan_turu(con, sql, (42,)))\n',
      tests: '_c = veri.baglan("anadolu_market", tablolar=["orders"])\n_q = "SELECT * FROM orders WHERE customer_id = ?"\nassert plan_turu(_c, _q, (42,)) == "tarama", "indeks yokken customer_id filtresi tam tarama (SCAN) olmalı"\nindeksle(_c)\nindeksle(_c)\nassert plan_turu(_c, _q, (42,)) == "indeks", "indeks kurulunca plan SEARCH olmalı"\nassert plan_turu(_c, "SELECT * FROM orders WHERE customer_id = ? AND status = ?", (42, "delivered")) == "indeks", "customer_id filtresi içeren sorgu da indeksi kullanmalı"\nassert plan_turu(_c, "SELECT * FROM orders WHERE channel = ?", ("web",)) == "tarama", "channel sütununda indeks yok"\nassert len(_c.execute(_q, (42,)).fetchall()) == 4, "42 numaralı müşterinin 4 siparişi var"\n',
      hints: [
        'Plan satırları (id, parent, notused, detail) demetleridir; detail son sütundur.',
        'aciklama = con.execute("EXPLAIN QUERY PLAN " + sql, params).fetchall()[0][-1]',
        'IF NOT EXISTS indeksi ikinci kez kurmaya çalışınca hata vermez.'
      ],
      why: 'Sorgu planı okumak performans işinin ilk adımıdır. PostgreSQL\'de aynı karşılaştırmayı EXPLAIN ANALYZE çıktısındaki Seq Scan / Index Scan ile yaparsın; migration\'larda IF NOT EXISTS tekrar çalıştırmayı güvenli kılar.' },
    { t: 'code',
      stage: 'Kendin yaz',
      id: 'postgresql-python-5',
      diff: 2,
      needs: ['sqlite3'],
      q: '<p>psycopg\'deki <code>dict_row</code> davranışını taklit et. <code>sozluk_sorgu(con, sql, params=())</code> sorguyu çalıştırıp her satırı <code>{sütun_adı: değer}</code> sözlüğü olarak içeren bir liste döndürsün. Sütun adlarını <code>cursor.description</code>\'dan al; bağlantının <code>row_factory</code> ayarını <b>değiştirme</b>. <code>anadolu_market</code> müşterileriyle dene: <code>SELECT city, COUNT(*) AS n FROM customers GROUP BY city ORDER BY n DESC, city LIMIT 3</code>.</p>',
      start: 'import veri\n\n\ndef sozluk_sorgu(con, sql, params=()):\n    pass\n\n\ncon = veri.baglan("anadolu_market", tablolar=["customers"])\nprint(sozluk_sorgu(con, "SELECT city, COUNT(*) AS n FROM customers GROUP BY city ORDER BY n DESC, city LIMIT 3"))\n',
      sol: 'import veri\n\n\ndef sozluk_sorgu(con, sql, params=()):\n    cur = con.execute(sql, params)\n    adlar = [d[0] for d in cur.description]\n    return [dict(zip(adlar, satir)) for satir in cur.fetchall()]\n\n\ncon = veri.baglan("anadolu_market", tablolar=["customers"])\nprint(sozluk_sorgu(con, "SELECT city, COUNT(*) AS n FROM customers GROUP BY city ORDER BY n DESC, city LIMIT 3"))\n',
      tests: '_c = veri.baglan("anadolu_market", tablolar=["customers"])\n_r = sozluk_sorgu(_c, "SELECT city, COUNT(*) AS n FROM customers GROUP BY city ORDER BY n DESC, city LIMIT 3")\nassert _r == [{"city": "İstanbul", "n": 28}, {"city": "Eskişehir", "n": 17}, {"city": "İzmir", "n": 16}], f"ilk üç şehir yanlış: {_r}"\n_p = sozluk_sorgu(_c, "SELECT customer_id AS id, segment FROM customers WHERE city = ? AND segment = ? ORDER BY customer_id", ("Ankara", "Premium"))\nassert all(set(d) == {"id", "segment"} for d in _p) and len(_p) > 0, "parametreli sorgu ve takma adlar (AS) çalışmalı"\nassert sozluk_sorgu(_c, "SELECT * FROM customers WHERE city = ?", ("Atlantis",)) == [], "sonuç yoksa boş liste"\nassert _c.row_factory is None, "bağlantının row_factory ayarı değiştirilmemeli"\n',
      hints: [
        'cur.description her sütun için bir demet verir; adı ilk elemandır.',
        'dict(zip(adlar, satir)) bir satırı sözlüğe çevirir.'
      ],
      why: 'Sözlük satırları, sütun sırası değişince bozulmayan okunur kod sağlar. psycopg\'de row_factory=dict_row, sqlite3\'te sqlite3.Row aynı işi yapar; cursor.description ise DB-API standardı olduğu için her sürücüde çalışır.' },
    { t: 'code',
      stage: 'Kendin yaz',
      id: 'postgresql-python-6',
      diff: 2,
      needs: ['sqlite3'],
      q: '<p>Toplu yükleme. <code>parti_yukle(hedef, satirlar, parti=500)</code> yaz: <code>satirlar</code> bir yineleyicidir (iterator; uzunluğu bilinmez, tamamını listeye çevirme). Satırları <code>parti</code> boyutlu gruplar halinde <code>executemany</code> ile <code>kalem(item_id, order_id, product_id, quantity, unit_price, discount)</code> tablosuna yaz; hepsi tek transaction olsun. Kaç <b>parti</b> gönderildiğini ve toplam satır sayısını <code>(parti_sayisi, satir_sayisi)</code> olarak döndür. Kaynak: <code>anadolu_market</code> <code>order_items</code>.</p>',
      start: 'import sqlite3\nimport itertools\nimport veri\n\n\ndef parti_yukle(hedef, satirlar, parti=500):\n    pass\n\n\nkaynak = veri.baglan("anadolu_market", tablolar=["order_items"])\nhedef = sqlite3.connect(":memory:")\nhedef.execute("CREATE TABLE kalem (item_id INTEGER PRIMARY KEY, order_id, product_id, quantity, unit_price, discount)")\nprint(parti_yukle(hedef, kaynak.execute("SELECT * FROM order_items")))\n',
      sol: 'import sqlite3\nimport itertools\nimport veri\n\n\ndef parti_yukle(hedef, satirlar, parti=500):\n    satirlar = iter(satirlar)\n    parti_sayisi = satir_sayisi = 0\n    with hedef:\n        while grup := list(itertools.islice(satirlar, parti)):\n            hedef.executemany("INSERT INTO kalem VALUES (?, ?, ?, ?, ?, ?)", grup)\n            parti_sayisi += 1\n            satir_sayisi += len(grup)\n    return parti_sayisi, satir_sayisi\n\n\nkaynak = veri.baglan("anadolu_market", tablolar=["order_items"])\nhedef = sqlite3.connect(":memory:")\nhedef.execute("CREATE TABLE kalem (item_id INTEGER PRIMARY KEY, order_id, product_id, quantity, unit_price, discount)")\nprint(parti_yukle(hedef, kaynak.execute("SELECT * FROM order_items")))\n',
      tests: 'import sqlite3 as _s\n_k = veri.baglan("anadolu_market", tablolar=["order_items"])\ndef _yeni():\n    h = _s.connect(":memory:")\n    h.execute("CREATE TABLE kalem (item_id INTEGER PRIMARY KEY, order_id, product_id, quantity, unit_price, discount)")\n    return h\n_h = _yeni()\nassert parti_yukle(_h, _k.execute("SELECT * FROM order_items")) == (4, 1620), "1620 satır 500\'lük partilerle 4 partide gider"\nassert _h.execute("SELECT COUNT(*), ROUND(SUM(quantity * unit_price), 2) FROM kalem").fetchone()[0] == 1620, "tüm satırlar yüklenmeli"\n_h2 = _yeni()\nassert parti_yukle(_h2, iter([(1, 1, 1, 1, 10.0, 0.0), (2, 1, 2, 1, 5.0, 0.0), (3, 2, 1, 2, 10.0, 0.0)]), parti=2) == (2, 3), "3 satır, parti=2 -> 2 parti"\nassert parti_yukle(_yeni(), iter([])) == (0, 0), "boş girdide parti gönderilmemeli"\nassert parti_yukle(_yeni(), (r for r in _k.execute("SELECT * FROM order_items LIMIT 1000")), parti=1000) == (1, 1000), "tam bölünen durumda boş son parti olmamalı"\n',
      hints: [
        'itertools.islice(yineleyici, n) en fazla n eleman alır.',
        'while grup := list(islice(satirlar, parti)): ... boş liste gelince durur.',
        'Girdiyi önce iter() ile yineleyiciye çevir ki liste de verilse çalışsın.'
      ],
      why: 'Partili yükleme belleği sabit tutar ve gidiş-dönüş sayısını azaltır. PostgreSQL\'de daha da hızlısı COPY\'dir; ama executemany + parti kalıbı her sürücüde çalışır ve hata durumunda hangi partide kaldığını raporlamayı kolaylaştırır.' },
    { t: 'code',
      stage: 'Kendin yaz',
      id: 'postgresql-python-7',
      diff: 2,
      needs: ['duckdb'],
      q: '<p>DuckDB ile COPY. <code>siparis_yukle(con, yol)</code> yaz: <code>siparis(order_id INTEGER PRIMARY KEY, customer_id INTEGER, order_date DATE, status TEXT, channel TEXT)</code> tablosunu oluştursun, <code>COPY ... FROM</code> ile CSV\'yi (başlık satırlı) yüklesin ve <code>{kanal: iptal_orani}</code> sözlüğü döndürsün. İptal oranı: o kanaldaki <code>status = \'cancelled\'</code> siparişlerin oranı, 3 basamağa yuvarlanmış. Dosya: <code>veri.yol("anadolu_market", "orders")</code>.</p>',
      start: 'import duckdb\nimport veri\n\n\ndef siparis_yukle(con, yol):\n    pass\n\n\nprint(siparis_yukle(duckdb.connect(), veri.yol("anadolu_market", "orders")))\n',
      sol: 'import duckdb\nimport veri\n\n\ndef siparis_yukle(con, yol):\n    con.execute("""CREATE TABLE siparis (order_id INTEGER PRIMARY KEY, customer_id INTEGER,\n                   order_date DATE, status TEXT, channel TEXT)""")\n    con.execute(f"COPY siparis FROM \'{yol}\' (HEADER)")\n    satirlar = con.execute("""\n        SELECT channel, ROUND(AVG(CASE WHEN status = \'cancelled\' THEN 1 ELSE 0 END), 3)\n        FROM siparis GROUP BY channel\n    """).fetchall()\n    return {k: float(v) for k, v in satirlar}\n\n\nprint(siparis_yukle(duckdb.connect(), veri.yol("anadolu_market", "orders")))\n',
      tests: 'import duckdb as _d\n_c = _d.connect()\n_r = siparis_yukle(_c, veri.yol("anadolu_market", "orders"))\nassert set(_r) == {"mobile", "store", "web"}, f"üç kanal bekleniyordu: {_r}"\n_b = {k: round(v, 3) for k, v in _c.execute("SELECT channel, AVG((status = \'cancelled\')::INT) FROM siparis GROUP BY 1").fetchall()}\nassert _c.execute("SELECT COUNT(*) FROM siparis").fetchone()[0] == 910, "910 sipariş yüklenmeli"\nassert all(abs(_r[k] - _b[k]) < 1e-9 for k in _b), f"iptal oranları yanlış: {_r} / beklenen {_b}"\nassert "COPY" in __source__.upper(), "yükleme COPY ile yapılmalı"\n',
      hints: [
        'COPY tablo FROM \'yol.csv\' (HEADER) komutunda yol bir metin sabitidir.',
        'Oran için AVG(CASE WHEN status = \'cancelled\' THEN 1 ELSE 0 END) kullan.',
        'DuckDB ROUND sonucu Decimal/float olabilir; float() ile çevir.'
      ],
      why: 'COPY satırları tek akışta okur; satır başına INSERT yükünü ortadan kaldırır. PostgreSQL\'de COPY FROM STDIN, DuckDB\'de COPY FROM dosya aynı fikirdir: toplu yüklemeyi veritabanının kendisine bırak.' },
    { t: 'code',
      stage: 'Kendin yaz',
      id: 'postgresql-python-8',
      diff: 2,
      q: '<p>Sürücüler arası taşıma. Ekip psycopg\'den sqlite3\'e test ortamı kuruyor. <code>yer_tutucu_cevir(sql)</code> yaz: psycopg\'nin konumsal <code>%s</code> yer tutucularını <code>?</code>\'ye, adlı <code>%(ad)s</code> yer tutucularını <code>:ad</code>\'a çevirsin. psycopg\'de gerçek yüzde işareti <code>%%</code> olarak yazılır; bunu tek <code>%</code>\'ye çevir. Tek tırnaklı SQL metinlerinin <b>içindeki</b> karakterlere dokunma (ör. <code>\'%s\'</code> bir metin sabitidir, olduğu gibi kalsın).</p>',
      start: 'def yer_tutucu_cevir(sql):\n    return sql.replace("%s", "?")\n\n\nprint(yer_tutucu_cevir("SELECT * FROM t WHERE ad LIKE \'A%%\' AND sehir = %(sehir)s AND yas > %s"))\n',
      sol: 'import re\n\n_DESEN = re.compile(r"\'(?:[^\']|\'\')*\'|%\\((\\w+)\\)s|%s|%%")\n\n\ndef yer_tutucu_cevir(sql):\n    def degistir(m):\n        parca = m.group(0)\n        if parca.startswith("\'"):\n            return parca\n        if m.group(1):\n            return ":" + m.group(1)\n        if parca == "%s":\n            return "?"\n        return "%"\n    return _DESEN.sub(degistir, sql)\n\n\nprint(yer_tutucu_cevir("SELECT * FROM t WHERE ad LIKE \'A%%\' AND sehir = %(sehir)s AND yas > %s"))\n',
      tests: 'assert yer_tutucu_cevir("SELECT * FROM c WHERE city = %s AND segment = %s") == "SELECT * FROM c WHERE city = ? AND segment = ?", "konumsal %s -> ?"\nassert yer_tutucu_cevir("UPDATE p SET stock = %(adet)s WHERE id = %(id)s") == "UPDATE p SET stock = :adet WHERE id = :id", "adlı -> :ad"\nassert yer_tutucu_cevir("SELECT 100 %% 7, %s") == "SELECT 100 % 7, ?", "%% gerçek yüzde işaretidir"\nassert yer_tutucu_cevir("SELECT \'%s\', %s") == "SELECT \'%s\', ?", "tırnak içindeki metne dokunma"\nassert yer_tutucu_cevir("SELECT \'O\'\'Brien %s\', %s") == "SELECT \'O\'\'Brien %s\', ?", "metin içindeki kaçışlı tırnak (\'\') metni bitirmez"\nimport sqlite3 as _s\n_c = _s.connect(":memory:")\nassert _c.execute(yer_tutucu_cevir("SELECT %(a)s + %(b)s"), {"a": 2, "b": 3}).fetchone()[0] == 5, "çevrilmiş sorgu sqlite3\'te çalışmalı"\n',
      hints: [
        'Soldan sağa tek geçişte dört şeyi ayırt et: tırnaklı metin, %(ad)s, %s, %%.',
        're.sub ile bir fonksiyon ver; eşleşme türüne göre farklı değer döndür. Tırnaklı metin deseni: \'(?:[^\']|\'\')*\'',
        'Desendeki sıra önemli: önce tırnaklı metin, sonra %(ad)s, sonra %s ve %%.'
      ],
      why: 'Basit replace tırnak içindeki metinleri ve %% kaçışını bozar. Tek geçişli bir düzenli ifade (regex) metin sabitlerini atlayarak yalnız gerçek yer tutucuları çevirir; ORM\'lerin "paramstyle" çevirisi de bu mantıkla çalışır.' },
    { t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      id: 'postgresql-python-9',
      diff: 2,
      needs: ['sqlite3'],
      q: '<p>Hatayı bul ve düzelt. <code>sehir_musterileri(con, sehir)</code> bir şehrin müşteri sayısını döndürmeli. Test ortamında "İstanbul" çalışıyor ama destek ekibi arama kutusuna <code>x\' OR \'1\'=\'1</code> yazınca bütün müşterileri saydığını, <code>Ka\'ş</code> gibi kesme işaretli bir girdide ise programın çöktüğünü bildirdi. Sorguyu parametreli hale getir.</p>',
      start: 'import veri\n\n\ndef sehir_musterileri(con, sehir):\n    sql = f"SELECT COUNT(*) FROM customers WHERE city = \'{sehir}\'"\n    return con.execute(sql).fetchone()[0]\n\n\ncon = veri.baglan("anadolu_market", tablolar=["customers"])\nprint(sehir_musterileri(con, "İstanbul"))\n',
      sol: 'import veri\n\n\ndef sehir_musterileri(con, sehir):\n    sql = "SELECT COUNT(*) FROM customers WHERE city = ?"\n    return con.execute(sql, (sehir,)).fetchone()[0]\n\n\ncon = veri.baglan("anadolu_market", tablolar=["customers"])\nprint(sehir_musterileri(con, "İstanbul"))\n',
      tests: '_c = veri.baglan("anadolu_market", tablolar=["customers"])\nassert sehir_musterileri(_c, "İstanbul") == 28, "İstanbul\'da 28 müşteri var"\nassert sehir_musterileri(_c, "x\' OR \'1\'=\'1") == 0, "enjeksiyon girdisi 150 değil 0 döndürmeli: değeri parametreyle geçir"\nassert sehir_musterileri(_c, "Ka\'ş") == 0, "kesme işaretli girdi çökmemeli"\n',
      hints: [
        'Değeri SQL metnine gömmek yerine yer tutucu kullan.',
        'SQLite\'ta ? ; psycopg\'de %s. Değer ikinci argümanda demet olarak gider: (sehir,)'
      ],
      why: 'Parametreli sorguda değer SQL\'in parçası olmaz; veritabanı onu her zaman veri olarak görür. Bu hem enjeksiyonu hem de tırnak hatalarını kökten çözer. Kendi kaçış fonksiyonunu yazmak çözüm değildir.' },
    { t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      id: 'postgresql-python-10',
      diff: 2,
      q: '<p>Hatayı bul ve düzelt. Anadolu Bank\'ın <code>havale(con, kimden, kime, tutar)</code> fonksiyonu önce gönderenden düşüyor, sonra alıcıya ekliyor. Alıcı hesap numarası yanlış yazıldığında para gönderenden düşüyor ama hiçbir hesaba geçmiyor: toplam bakiye azalıyor! Fonksiyon alıcı yoksa ya da bakiye yetmiyorsa <code>ValueError</code> fırlatmalı ve <b>hiçbir</b> bakiye değişmemeli; başarıda <code>True</code> döndürmeli.</p>',
      start: 'import sqlite3\n\n\ndef havale(con, kimden, kime, tutar):\n    cur = con.execute("UPDATE hesap SET bakiye = bakiye - ? WHERE no = ? AND bakiye >= ?", (tutar, kimden, tutar))\n    if cur.rowcount != 1:\n        raise ValueError("Gönderen yok ya da bakiye yetersiz")\n    con.commit()\n    cur = con.execute("UPDATE hesap SET bakiye = bakiye + ? WHERE no = ?", (tutar, kime))\n    con.commit()\n    return True\n\n\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE hesap (no TEXT PRIMARY KEY, bakiye INTEGER)")\ncon.executemany("INSERT INTO hesap VALUES (?, ?)", [("TR01", 1000), ("TR02", 200)])\ncon.commit()\nprint(havale(con, "TR01", "TR02", 300))\n',
      sol: 'import sqlite3\n\n\ndef havale(con, kimden, kime, tutar):\n    with con:\n        cur = con.execute("UPDATE hesap SET bakiye = bakiye - ? WHERE no = ? AND bakiye >= ?", (tutar, kimden, tutar))\n        if cur.rowcount != 1:\n            raise ValueError("Gönderen yok ya da bakiye yetersiz")\n        cur = con.execute("UPDATE hesap SET bakiye = bakiye + ? WHERE no = ?", (tutar, kime))\n        if cur.rowcount != 1:\n            raise ValueError("Alıcı hesap bulunamadı")\n    return True\n\n\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE hesap (no TEXT PRIMARY KEY, bakiye INTEGER)")\ncon.executemany("INSERT INTO hesap VALUES (?, ?)", [("TR01", 1000), ("TR02", 200)])\ncon.commit()\nprint(havale(con, "TR01", "TR02", 300))\n',
      tests: 'import sqlite3 as _s\n_c = _s.connect(":memory:")\n_c.execute("CREATE TABLE hesap (no TEXT PRIMARY KEY, bakiye INTEGER)")\n_c.executemany("INSERT INTO hesap VALUES (?, ?)", [("TR01", 1000), ("TR02", 200)])\n_c.commit()\n_b = lambda: dict(_c.execute("SELECT no, bakiye FROM hesap").fetchall())\nassert havale(_c, "TR01", "TR02", 300) is True and _b() == {"TR01": 700, "TR02": 500}, "başarılı havale"\ntry:\n    havale(_c, "TR01", "TR99", 100)\n    assert False, "olmayan alıcıda ValueError fırlatılmalı"\nexcept ValueError:\n    pass\nassert _b() == {"TR01": 700, "TR02": 500}, f"başarısız havalede gönderenin bakiyesi geri alınmalı: {_b()}"\ntry:\n    havale(_c, "TR02", "TR01", 10_000)\n    assert False, "yetersiz bakiyede ValueError"\nexcept ValueError:\n    pass\nassert sum(_b().values()) == 1200, "sistemdeki toplam para korunmalı"\n',
      hints: [
        'Sorun commit\'in iki adımın arasında olması: ilk adım kalıcı oluyor.',
        'İki UPDATE\'i tek bir with con: bloğuna al; ara commit\'leri kaldır.',
        'Alıcı için de rowcount kontrolü ekle ve 1 değilse ValueError fırlat (with bloğu rollback yapar).'
      ],
      why: 'Transaction sınırı iş kuralının sınırıyla aynı olmalı: "para düşüldü ve eklendi" tek bir bütündür. Ara commit, yarım işi kalıcı yapar. PostgreSQL\'de de with con.transaction(): bloğu aynı garantiyi verir.' },
    { t: 'code',
      stage: 'Meydan okuma',
      id: 'postgresql-python-11',
      diff: 3,
      q: '<p>Bağlantı havuzu yaz (psycopg_pool\'un sadeleştirilmiş hali). <code>Havuz(fabrika, boyut)</code>: <code>fabrika()</code> yeni bir bağlantı üreten fonksiyondur; bağlantılar <b>tembel</b> açılır (ilk ihtiyaçta), toplam açık bağlantı <code>boyut</code>\'u geçemez.</p><ul><li><code>al()</code>: boşta bağlantı varsa onu, yoksa ve sınır dolmadıysa yenisini verir; sınır doluysa <code>HavuzDolu</code> fırlatır.</li><li><code>birak(con)</code>: bağlantıyı boşa geri koyar. Bu havuzdan alınmamış bir bağlantı verilirse <code>ValueError</code>.</li><li><code>baglanti()</code>: bir bağlam yöneticisi (context manager). Blok başarıyla biterse <code>commit</code>, hata çıkarsa <code>rollback</code> yapar; her iki durumda da bağlantıyı havuza iade eder ve hatayı yutmaz.</li><li><code>acik</code> (toplam açılmış) ve <code>bosta</code> (bekleyen) sayıları özellik olarak okunabilsin.</li></ul>',
      start: 'import sqlite3\nfrom contextlib import contextmanager\n\n\nclass HavuzDolu(Exception):\n    pass\n\n\nclass Havuz:\n    def __init__(self, fabrika, boyut):\n        pass\n\n\nh = Havuz(lambda: sqlite3.connect(":memory:"), 2)\n',
      sol: 'import sqlite3\nfrom contextlib import contextmanager\n\n\nclass HavuzDolu(Exception):\n    pass\n\n\nclass Havuz:\n    def __init__(self, fabrika, boyut):\n        self._fabrika = fabrika\n        self._boyut = boyut\n        self._bos = []\n        self._kullanimda = set()\n\n    @property\n    def acik(self):\n        return len(self._bos) + len(self._kullanimda)\n\n    @property\n    def bosta(self):\n        return len(self._bos)\n\n    def al(self):\n        if self._bos:\n            con = self._bos.pop()\n        elif self.acik < self._boyut:\n            con = self._fabrika()\n        else:\n            raise HavuzDolu(f"{self._boyut} bağlantının hepsi kullanımda")\n        self._kullanimda.add(con)\n        return con\n\n    def birak(self, con):\n        if con not in self._kullanimda:\n            raise ValueError("Bu bağlantı havuzdan alınmamış")\n        self._kullanimda.remove(con)\n        self._bos.append(con)\n\n    @contextmanager\n    def baglanti(self):\n        con = self.al()\n        try:\n            yield con\n            con.commit()\n        except BaseException:\n            con.rollback()\n            raise\n        finally:\n            self.birak(con)\n\n\nh = Havuz(lambda: sqlite3.connect(":memory:"), 2)\n',
      tests: 'import sqlite3 as _s\n_acilan = []\ndef _fab():\n    c = _s.connect(":memory:")\n    c.execute("CREATE TABLE t (x INTEGER)")\n    c.commit()\n    _acilan.append(c)\n    return c\n_h = Havuz(_fab, 2)\nassert (_h.acik, _h.bosta) == (0, 0), "bağlantılar tembel açılmalı: başta hiç açık bağlantı yok"\n_a = _h.al(); _b = _h.al()\nassert _a is not _b and _h.acik == 2, "iki farklı bağlantı açılmalı"\ntry:\n    _h.al(); assert False, "sınır doluyken HavuzDolu fırlatılmalı"\nexcept HavuzDolu:\n    pass\n_h.birak(_a)\nassert _h.bosta == 1 and _h.al() is _a, "bırakılan bağlantı yeniden kullanılmalı (yeni açılmamalı)"\nassert len(_acilan) == 2, "toplam yalnız 2 bağlantı açılmalı"\ntry:\n    _h.birak(_s.connect(":memory:")); assert False, "yabancı bağlantı ValueError"\nexcept ValueError:\n    pass\n_h.birak(_a); _h.birak(_b)\nwith _h.baglanti() as _c:\n    _c.execute("INSERT INTO t VALUES (1)")\n_kim = _c\nassert _kim.execute("SELECT COUNT(*) FROM t").fetchone()[0] == 1, "başarılı blok commit etmeli"\ntry:\n    with _h.baglanti() as _c2:\n        _c2.execute("INSERT INTO t VALUES (2)")\n        raise RuntimeError("iş hatası")\nexcept RuntimeError:\n    pass\nelse:\n    assert False, "hata yutulmamalı"\nassert _c2.execute("SELECT COUNT(*) FROM t").fetchone()[0] == (1 if _c2 is _kim else 0), "hatalı blok rollback yapmalı"\nassert _h.bosta == 2 and _h.acik == 2, "hata olsa da bağlantı havuza dönmeli (sızıntı yok)"\n',
      hints: [
        'Boştakiler için liste, kullanımdakiler için küme tut; acik = ikisinin toplamı.',
        'Bağlantı nesneleri hashlenebilir; kümede doğrudan saklayabilirsin (ya da id(con)).',
        'contextmanager içinde: con = self.al(); try: yield con; con.commit() except: con.rollback(); raise; finally: self.birak(con)'
      ],
      why: 'Gerçek havuzlar (psycopg_pool, SQLAlchemy QueuePool) aynı üç sorumluluğu taşır: sınırlı kaynak, yeniden kullanım ve her yolda iade. finally içinde iade, bağlantı sızıntısını önleyen tek güvenilir yerdir; hatayı yeniden fırlatmak ise çağıranın durumdan haberdar olmasını sağlar.' },
    { t: 'code',
      stage: 'Meydan okuma',
      id: 'postgresql-python-12',
      diff: 3,
      needs: ['sqlite3'],
      q: '<p>Kanat Havayolları\'nda aynı uçuşta aynı koltuk iki yolcuya satılmış (koltuk kilidi yokmuş). İki fonksiyon yaz:</p><ol><li><code>cift_satilanlar(con)</code>: <code>hv_bookings</code>\'te iptal edilmemiş (<code>status != \'cancelled\'</code>) rezervasyonlarda aynı <code>(flight_id, seat)</code> için birden fazla kayıt olan çiftleri <code>[(flight_id, seat), ...]</code> olarak <code>flight_id, seat</code> sırasıyla döndürsün.</li><li><code>koltuk_ayir(con, flight_id, seat, passenger_id)</code>: <code>rezervasyon(id INTEGER PRIMARY KEY, flight_id, seat, passenger_id, status)</code> tablosuna <code>status=\'active\'</code> satır eklesin. Tabloda <code>(flight_id, seat)</code> üzerinde yalnız <code>status = \'active\'</code> satırları kapsayan bir <b>kısmi benzersiz indeks</b> (partial unique index) olsun (yoksa oluştur). Koltuk doluysa <code>None</code>, başarıdaysa <code>INSERT ... RETURNING id</code> ile gelen id\'yi döndür. Hata yakalamak yerine <code>ON CONFLICT DO NOTHING</code> kullan.</li></ol>',
      start: 'import sqlite3\nimport veri\n\n\ndef cift_satilanlar(con):\n    pass\n\n\ndef koltuk_ayir(con, flight_id, seat, passenger_id):\n    pass\n\n\ncon = veri.baglan("kanat_havayollari", tablolar=["hv_bookings"])\nprint(cift_satilanlar(con)[:3])\n',
      sol: 'import sqlite3\nimport veri\n\n\ndef cift_satilanlar(con):\n    return con.execute("""\n        SELECT flight_id, seat FROM hv_bookings\n        WHERE status != \'cancelled\'\n        GROUP BY flight_id, seat\n        HAVING COUNT(*) > 1\n        ORDER BY flight_id, seat\n    """).fetchall()\n\n\ndef koltuk_ayir(con, flight_id, seat, passenger_id):\n    con.execute("""CREATE TABLE IF NOT EXISTS rezervasyon (\n        id INTEGER PRIMARY KEY, flight_id INTEGER, seat TEXT, passenger_id INTEGER, status TEXT)""")\n    con.execute("""CREATE UNIQUE INDEX IF NOT EXISTS ux_koltuk\n        ON rezervasyon (flight_id, seat) WHERE status = \'active\'""")\n    with con:\n        satir = con.execute("""\n            INSERT INTO rezervasyon (flight_id, seat, passenger_id, status)\n            VALUES (?, ?, ?, \'active\')\n            ON CONFLICT DO NOTHING\n            RETURNING id\n        """, (flight_id, seat, passenger_id)).fetchone()\n    return satir[0] if satir else None\n\n\ncon = veri.baglan("kanat_havayollari", tablolar=["hv_bookings"])\nprint(cift_satilanlar(con)[:3])\n',
      tests: '_c = veri.baglan("kanat_havayollari", tablolar=["hv_bookings"])\n_r = cift_satilanlar(_c)\nassert len(_r) == 20, f"iptal edilmemiş 20 çift satış var, gelen {len(_r)}"\nassert _r[:3] == [(219, "27B"), (258, "22D"), (378, "32D")], f"ilk üç çift yanlış ya da sırasız: {_r[:3]}"\nassert (2509, "18C") not in _r, "iptal edilenler sayılmamalı"\n_k1 = koltuk_ayir(_c, 3200, "1A", 10)\nassert _k1 == 1, f"ilk rezervasyon id 1 olmalı, gelen {_k1}"\nassert koltuk_ayir(_c, 3200, "1A", 11) is None, "dolu koltuk ikinci kez satılmamalı (None)"\nassert koltuk_ayir(_c, 3200, "1B", 11) == 2, "boş koltuk 1B ayrılabilmeli (id 2)"\nassert koltuk_ayir(_c, 3201, "1A", 12) is not None, "başka uçuşta aynı koltuk serbest"\n_c.execute("UPDATE rezervasyon SET status = \'cancelled\' WHERE id = 1"); _c.commit()\nassert koltuk_ayir(_c, 3200, "1A", 13) is not None, "iptal edilen koltuk yeniden satılabilmeli (kısmi indeks)"\nassert "ON CONFLICT" in __source__.upper() and "RETURNING" in __source__.upper(), "ON CONFLICT DO NOTHING ve RETURNING kullan"\n',
      hints: [
        'Çiftler: GROUP BY flight_id, seat HAVING COUNT(*) > 1',
        'Kısmi indeks: CREATE UNIQUE INDEX IF NOT EXISTS ad ON rezervasyon (flight_id, seat) WHERE status = \'active\'',
        'ON CONFLICT DO NOTHING RETURNING id çakışmada hiç satır döndürmez; fetchone() None olur.'
      ],
      why: 'Uygulama kodundaki kontrol yarış durumunda delinir; kuralı veritabanına (benzersiz indeks) koymak en güçlü kilittir. Kısmi indeks yalnız aktif rezervasyonları kısıtlar, iptaller koltuğu serbest bırakır. Aynı sözdizimi PostgreSQL\'de de geçerlidir.' },
    { t: 'code',
      stage: 'Mini proje',
      id: 'postgresql-python-13',
      diff: 3,
      needs: ['duckdb'],
      q: '<p>Anadolu Market gece stok senkronu (DuckDB ile, PostgreSQL\'deki akışın aynısı). <code>senkron(con, urunler_yolu, gelen)</code> yaz:</p><ol><li><code>stok(product_id INTEGER PRIMARY KEY, name TEXT, stock INTEGER, guncelleme INTEGER DEFAULT 0)</code> tablosunu yoksa oluştur; boşsa <code>products</code> CSV\'sinden (<code>urunler_yolu</code>) <code>product_id, name, stock</code> sütunlarını yükle.</li><li><code>gelen</code>: depo sisteminden gelen <code>(product_id, name, giris_adedi)</code> listesi. Upsert ile uygula: ürün varsa <code>stock</code>\'a giriş adedini <b>ekle</b> ve <code>guncelleme</code>\'yi 1 artır; yoksa yeni ürün olarak ekle (<code>guncelleme = 1</code>).</li><li><code>RETURNING</code> ile etkilenen satırların <code>product_id</code>\'lerini topla.</li><li><code>{"etkilenen": sıralı id listesi, "toplam_stok": tablodaki stok toplamı, "yeni": yeni eklenen ürün sayısı}</code> döndür.</li></ol>',
      start: 'import duckdb\nimport veri\n\n\ndef senkron(con, urunler_yolu, gelen):\n    pass\n\n\ncon = duckdb.connect()\nprint(senkron(con, veri.yol("anadolu_market", "products"), [(1, "Kablosuz Kulaklık", 6), (41, "Termos", 30)]))\n',
      sol: 'import duckdb\nimport veri\n\n\ndef senkron(con, urunler_yolu, gelen):\n    con.execute("""CREATE TABLE IF NOT EXISTS stok (\n        product_id INTEGER PRIMARY KEY, name TEXT, stock INTEGER, guncelleme INTEGER DEFAULT 0)""")\n    if con.execute("SELECT COUNT(*) FROM stok").fetchone()[0] == 0:\n        con.execute(\n            "INSERT INTO stok (product_id, name, stock) SELECT product_id, name, stock FROM read_csv(?)",\n            [urunler_yolu],\n        )\n    onceki = {r[0] for r in con.execute("SELECT product_id FROM stok").fetchall()}\n    etkilenen = []\n    for urun_id, ad, adet in gelen:\n        satir = con.execute("""\n            INSERT INTO stok (product_id, name, stock, guncelleme) VALUES (?, ?, ?, 1)\n            ON CONFLICT (product_id) DO UPDATE\n               SET stock = stok.stock + excluded.stock, guncelleme = stok.guncelleme + 1\n            RETURNING product_id\n        """, [urun_id, ad, adet]).fetchone()\n        etkilenen.append(satir[0])\n    yeni = len({u for u in etkilenen if u not in onceki})\n    toplam = con.execute("SELECT SUM(stock) FROM stok").fetchone()[0]\n    return {"etkilenen": sorted(set(etkilenen)), "toplam_stok": int(toplam), "yeni": yeni}\n\n\ncon = duckdb.connect()\nprint(senkron(con, veri.yol("anadolu_market", "products"), [(1, "Kablosuz Kulaklık", 6), (41, "Termos", 30)]))\n',
      tests: 'import duckdb as _d\n_c = _d.connect()\n_y = veri.yol("anadolu_market", "products")\n_r = senkron(_c, _y, [(1, "Kablosuz Kulaklık", 6), (41, "Termos", 30)])\nassert _r == {"etkilenen": [1, 41], "toplam_stok": 5682 + 36, "yeni": 1}, f"ilk senkron yanlış: {_r}"\nassert _c.execute("SELECT stock, guncelleme FROM stok WHERE product_id = 1").fetchone() == (80, 1), "ürün 1: 74 + 6 = 80, guncelleme 1"\n_r2 = senkron(_c, _y, [(41, "Termos", 5), (2, "Akıllı Saat", 9), (41, "Termos", 5)])\nassert _r2["etkilenen"] == [2, 41] and _r2["yeni"] == 0, f"ikinci senkronda yeni ürün yok: {_r2}"\nassert _c.execute("SELECT stock, guncelleme FROM stok WHERE product_id = 41").fetchone() == (40, 3), "ürün 41: 30 + 5 + 5 = 40, üç güncelleme"\nassert _r2["toplam_stok"] == 5718 + 19, "toplam stok 5737 olmalı"\nassert _c.execute("SELECT COUNT(*) FROM stok").fetchone()[0] == 41, "CSV ikinci kez yüklenmemeli (41 ürün)"\nassert "RETURNING" in __source__.upper(), "etkilenen id\'leri RETURNING ile al"\n',
      hints: [
        'CSV yükleme: INSERT INTO stok (...) SELECT product_id, name, stock FROM read_csv(?) ve parametre olarak yol.',
        'DuckDB upsert: ON CONFLICT (product_id) DO UPDATE SET stock = stok.stock + excluded.stock',
        'Yeni ürünleri bulmak için senkrondan önceki id kümesini sakla.'
      ],
      why: 'Gece senkronu tipik bir üretim işidir: başlangıç yüklemesi bir kez, ardından artımlı upsert. RETURNING hangi satırların değiştiğini ek sorgu olmadan verir; bu liste denetim kaydına (audit log) ya da önbellek temizliğine beslenir. Kod PostgreSQL\'e %s ve COPY ile neredeyse aynen taşınır.' }
  ],
  faq: [
    { q: 'psycopg2 mi psycopg 3 mü?',
      a: 'Yeni projede psycopg 3 (paket adı psycopg). Async desteği, COPY API\'si, row_factory ve havuz paketi (psycopg_pool) ile daha moderndir. psycopg2 hâlâ çok yaygındır; API\'leri benzer olduğu için geçiş kolaydır.' },
    { q: 'ORM varken ham SQL yazmaya gerek var mı?',
      a: 'Evet. ORM (SQLAlchemy, Django ORM) günlük CRUD\'u kolaylaştırır, ama toplu yükleme, karmaşık rapor sorguları, kilitler ve performans incelemesi için alttaki SQL\'i ve sürücüyü bilmek gerekir. ORM\'nin ürettiği sorguyu EXPLAIN ile okuyabilmelisin.' },
    { q: 'Testlerde gerçek PostgreSQL mi kullanmalıyım, SQLite mı?',
      a: 'Mantık testleri için SQLite hızlıdır, ama tür, kilit ve sözdizimi farkları yüzünden entegrasyon testlerini gerçek PostgreSQL ile (Docker ya da testcontainers) çalıştır. Üretimde PostgreSQL kullanıp testte yalnız SQLite kullanmak, ancak üretimde ortaya çıkan hatalara yol açar.' },
    { q: 'Upsert mi, önce SELECT sonra INSERT/UPDATE mi?',
      a: 'Upsert. Tek komut olduğu için atomiktir ve iki istek arasındaki yarışa açık değildir. Ayrı SELECT + INSERT kalıbı eşzamanlı isteklerde benzersizlik hatası ya da çift kayıt üretir.' },
    { q: 'Hangi sütunlara indeks koymalıyım?',
      a: 'WHERE, JOIN ve ORDER BY\'da sık geçen, seçici (çok farklı değeri olan) sütunlara. Kararı tahminle değil EXPLAIN ANALYZE ile ver; yazma yoğun tablolarda her indeksin ekleme maliyetini de hesaba kat.' }
  ],
  mistakes: [
    { bad: 'cur.execute(f"SELECT * FROM customers WHERE city = \'{sehir}\'")',
      good: 'cur.execute("SELECT * FROM customers WHERE city = %s", (sehir,))',
      why: 'f-string ile kurulan SQL enjeksiyona açıktır ve kesme işaretli değerlerde çöker. Değeri her zaman yer tutucuyla ver.' },
    { bad: 'cur.execute("SELECT * FROM t WHERE id = %s", sehir_id)',
      good: 'cur.execute("SELECT * FROM t WHERE id = %s", (sehir_id,))',
      why: 'Parametreler bir dizi (demet/liste) olmalıdır. Tek elemanlı demette virgülü unutma.' },
    { bad: 'stok = cur.execute("SELECT stock ...").fetchone()[0]\nif stok >= adet:\n    cur.execute("UPDATE products SET stock = stock - %s ...", (adet,))',
      good: 'cur.execute("UPDATE products SET stock = stock - %s WHERE product_id = %s AND stock >= %s", (adet, urun_id, adet))\nbasarili = cur.rowcount == 1',
      why: 'Kilitsiz oku-kontrol et-yaz kalıbı yarış durumuna açıktır; kontrolü UPDATE\'in içine koy ya da FOR UPDATE kullan.' },
    { bad: 'con = psycopg.connect(DSN)\ncon.execute("UPDATE ...")\n# commit ve close unutuldu',
      good: 'with psycopg.connect(DSN) as con:\n    con.execute("UPDATE ...")',
      why: 'with bloğu başarıda commit, hatada rollback ve her durumda kapanış sağlar; aksi halde bağlantı ve kilitler sızar.' },
    { bad: 'for s in satirlar:\n    cur.execute("INSERT INTO t VALUES (%s, %s)", s)\n    con.commit()',
      good: 'with con.transaction():\n    cur.executemany("INSERT INTO t VALUES (%s, %s)", satirlar)',
      why: 'Her satırda commit hem çok yavaştır hem de yarıda kalan yüklemeyi tutarsız bırakır. Toplu yaz, tek transaction kullan (daha hızlısı COPY).' }
  ]
});
})(window);
