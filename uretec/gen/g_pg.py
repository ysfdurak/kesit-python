import sys
sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/gen')
from emit import write, ded, py, pc

body = '''
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
''' + pc('''
docker run --name pg-anadolu -e POSTGRES_PASSWORD=gizli -e POSTGRES_DB=market \\
  -p 5432:5432 -d postgres:16
docker exec -it pg-anadolu psql -U postgres -d market   # SQL kabuğu
''') + '''
<p>Bağlantı bilgisi tek bir metinle (DSN ya da bağlantı URL'si) verilir: <code>postgresql://postgres:gizli@localhost:5432/market</code>. Parolayı koda yazma; ortam değişkeninden oku (<i>yapilandirma</i> dersi).</p>

<h2>psycopg 3: bağlantı, imleç ve parametreler</h2>
''' + pc('''
import os
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
            print(satir["customer_id"], satir["city"])      # dict_row: sözlük gibi erişim
''') + '''
<p>Üç kural: (1) değerleri <b>her zaman</b> parametre olarak ver, asla f-string ile SQL'e gömme (SQL enjeksiyonu); (2) <code>%s</code> Python'un yüzde biçimlendirmesi <i>değildir</i>, psycopg'nin yer tutucusudur ve tırnaksız yazılır; (3) bağlantıyı <code>with</code> ile aç ki hata olsa da kapansın. Aynı fikir sqlite3'te <code>?</code> ve <code>row_factory</code> ile çalışır:</p>
''' + py('''
import sqlite3
import veri

con = veri.baglan("anadolu_market", tablolar=["customers"])
con.row_factory = sqlite3.Row                  # psycopg'deki dict_row'un karşılığı
sql = "SELECT customer_id, city, segment FROM customers WHERE city = ? AND segment = ? ORDER BY customer_id LIMIT 3"
for satir in con.execute(sql, ("İzmir", "Premium")):
    print(dict(satir))
''') + '''
<div class="tbl-wrap"><table>
<tr><th>Sürücü</th><th>Konumsal</th><th>Adlı</th></tr>
<tr><td>psycopg (PostgreSQL)</td><td><code>%s</code></td><td><code>%(sehir)s</code></td></tr>
<tr><td>sqlite3</td><td><code>?</code></td><td><code>:sehir</code></td></tr>
<tr><td>duckdb</td><td><code>?</code> ya da <code>$1</code></td><td><code>$sehir</code></td></tr>
</table></div>

<h3>Bağlantı havuzu</h3>
<p>Her HTTP isteğinde yeni bağlantı açmak pahalıdır (TCP, kimlik doğrulama, sunucuda yeni süreç). Web uygulamaları bir <b>bağlantı havuzu</b> (connection pool) kullanır: birkaç bağlantı açık tutulur, istek gelince ödünç verilir, iş bitince geri alınır.</p>
''' + pc('''
from psycopg_pool import ConnectionPool

havuz = ConnectionPool(DSN, min_size=2, max_size=10, timeout=5)   # 5 sn içinde boş bağlantı yoksa PoolTimeout

def musteri_getir(musteri_id):
    with havuz.connection() as con:             # ödünç al; blok bitince commit + havuza iade
        return con.execute("SELECT * FROM customers WHERE customer_id = %s", (musteri_id,)).fetchone()
''') + '''

<h2>Transaction, izolasyon ve kilitler</h2>
<p>Transaction (işlem bütünlüğü), birden çok SQL komutunun "ya hep ya hiç" çalışmasıdır. psycopg'de bağlantı açıldığında ilk komutla transaction kendiliğinden başlar; <code>with psycopg.connect(...)</code> bloğu başarıyla biterse <code>commit</code>, hata çıkarsa <code>rollback</code> yapılır. Bir bağlantı içinde ayrı bir alt blok için <code>with con.transaction():</code> kullanılır.</p>
<div class="tbl-wrap"><table>
<tr><th>İzolasyon seviyesi</th><th>Ne garanti eder?</th><th>Ne zaman?</th></tr>
<tr><td>READ COMMITTED (varsayılan)</td><td>Yalnız onaylanmış veriyi görürsün; aynı sorgu iki kez farklı sonuç verebilir</td><td>Çoğu web isteği</td></tr>
<tr><td>REPEATABLE READ</td><td>Transaction boyunca aynı anlık görüntü (snapshot)</td><td>Tutarlı rapor, dışa aktarım</td></tr>
<tr><td>SERIALIZABLE</td><td>Sanki işlemler sırayla çalışmış gibi; çakışmada hata verir, yeniden denersin</td><td>Para, envanter gibi kritik kurallar</td></tr>
</table></div>
<p>Klasik yarış durumu (race condition): iki müşteri son kalan ürünü aynı anda alıyor. İkisi de "stok 1" okur, ikisi de 0'a düşürür, depo eksiye girer. PostgreSQL'de çözüm satırı okurken kilitlemektir: <code>SELECT ... FOR UPDATE</code>. Aynı satırı kilitlemek isteyen ikinci işlem birincinin commit'ini bekler. Havayolu koltuk seçimi gibi kuyruk işlerinde <code>FOR UPDATE SKIP LOCKED</code> kilitli satırları atlayıp boş olana geçer.</p>
''' + pc('''
with psycopg.connect(DSN) as con:
    with con.transaction():
        stok = con.execute(
            "SELECT stock FROM products WHERE product_id = %s FOR UPDATE", (urun_id,)
        ).fetchone()[0]
        if stok < adet:
            raise ValueError("Yetersiz stok")
        con.execute("UPDATE products SET stock = stock - %s WHERE product_id = %s", (adet, urun_id))
''') + '''
<p>Çoğu zaman daha basit ve aynı derecede güvenli bir yol vardır: <b>koşullu güncelleme</b>. Kontrolü ve değişikliği tek bir atomik <code>UPDATE</code> içine koyar, kaç satırın etkilendiğine bakarsın. Bu kalıp SQLite'ta da, PostgreSQL'de de çalışır:</p>
''' + py('''
import veri

con = veri.baglan("anadolu_market", tablolar=["products"])

def stok_dus(con, urun_id, adet):
    with con:                                   # commit ya da hata olursa rollback
        cur = con.execute(
            "UPDATE products SET stock = stock - ? WHERE product_id = ? AND stock >= ?",
            (adet, urun_id, adet),
        )
    return cur.rowcount == 1                    # 0 ise stok yetmedi (ya da ürün yok)

print("ilk stok:", con.execute("SELECT stock FROM products WHERE product_id = 1").fetchone()[0])
print(stok_dus(con, 1, 70), stok_dus(con, 1, 10))
print("son stok:", con.execute("SELECT stock FROM products WHERE product_id = 1").fetchone()[0])
''') + '''

<h2>Upsert ve RETURNING</h2>
<p>Tedarikçiden fiyat listesi geliyor: bazı ürünler yeni, bazıları mevcut. "Varsa güncelle, yoksa ekle" işlemine <b>upsert</b> denir. PostgreSQL ve SQLite aynı sözdizimini kullanır: <code>INSERT ... ON CONFLICT (anahtar) DO UPDATE SET ...</code>. <code>excluded</code> eklenmek istenen satırdır. <code>RETURNING</code> ise eklenen ya da güncellenen satırı ayrı bir SELECT'e gerek kalmadan geri döndürür; sunucunun ürettiği id'yi almanın standart yoludur.</p>
''' + py('''
import veri

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
             WHERE excluded.guncellendi > guncel_fiyat.guncellendi
        """, (urun, fiyat, zaman))

print(len(guncellemeler), "güncelleme ->", con.execute("SELECT COUNT(*) FROM guncel_fiyat").fetchone()[0], "ürün")
print(con.execute("SELECT * FROM guncel_fiyat WHERE product_id IN (30, 31) ORDER BY product_id").fetchall())

cur = con.execute("INSERT INTO guncel_fiyat VALUES (99, 120.0, '2025-01-01') RETURNING product_id, fiyat")
print("RETURNING:", cur.fetchall())
''') + '''
<p>Upsert'teki <code>WHERE</code> koşulu çok önemlidir: dosyalar geç ya da sırasız gelirse eski fiyatın yenisinin üstüne yazılmasını engeller. Böylece aynı dosyayı iki kez yüklemek de sonucu değiştirmez (idempotent yükleme, <i>veri-boru-hatti</i>).</p>

<h2>Toplu yükleme: COPY ve executemany</h2>
<p>Satır satır <code>INSERT</code> her satır için sunucuya bir gidiş-dönüş demektir. 100 bin satırda bu dakikalar sürer. Hız sıralaması kabaca şöyledir: döngüde tek tek <code>execute</code> &lt; <code>executemany</code> &lt; çok satırlı <code>VALUES</code> &lt; <code>COPY</code>. psycopg 3'te <code>COPY</code> Python'dan akış olarak beslenebilir:</p>
''' + pc('''
with psycopg.connect(DSN) as con, con.cursor() as cur:
    with cur.copy("COPY order_items (item_id, order_id, product_id, quantity, unit_price, discount) FROM STDIN") as cp:
        for satir in satirlar:            # demetler
            cp.write_row(satir)
''') + '''
<p>DuckDB'de de aynı <code>COPY ... FROM</code> komutu vardır ve CSV dosyasını tek komutla tabloya yükler. Gerçek veriyle dene:</p>
''' + py('''
import duckdb
import veri

con = duckdb.connect()
con.execute("""CREATE TABLE siparis (order_id INTEGER PRIMARY KEY, customer_id INTEGER,
               order_date DATE, status TEXT, channel TEXT)""")
con.execute(f"COPY siparis FROM '{veri.yol('anadolu_market', 'orders')}' (HEADER)")
print(con.execute("SELECT status, COUNT(*) FROM siparis GROUP BY status ORDER BY status").fetchall())
''') + '''
<div class="warn"><b>Dosya yolu f-string ile, değer asla</b>Yukarıdaki f-string yalnızca senin kontrolündeki dosya yolunu SQL'e koyar. Kullanıcıdan gelen bir değeri (şehir, ad, filtre) asla bu şekilde gömme; onları <code>?</code> ile parametre geçir.</div>

<h2>İndeks ve EXPLAIN</h2>
<p>İndeks, kitabın sonundaki dizin gibidir: tüm sayfaları taramak yerine doğrudan ilgili yere gider. PostgreSQL'de en sık iki tür:</p>
<ul>
<li><b>B-tree</b> (varsayılan): eşitlik, aralık (<code>&lt;</code>, <code>BETWEEN</code>), sıralama. <code>customer_id</code>, <code>order_date</code> gibi sütunlar.</li>
<li><b>GIN</b>: bir değerin içindeki parçaları indeksler; JSONB anahtarları, diziler ve tam metin arama için.</li>
</ul>
<p><code>EXPLAIN ANALYZE</code> sorguyu gerçekten çalıştırır ve planı süreleriyle gösterir. <code>Seq Scan</code> tüm tabloyu taramak, <code>Index Scan</code> indeksle gitmektir. Tahmini satır (<code>rows=</code>) ile gerçek satır arasında büyük fark varsa istatistikler eskidir (<code>ANALYZE tablo</code>).</p>
''' + pc('''
CREATE INDEX ix_orders_customer ON orders (customer_id);
EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 42;
--  Index Scan using ix_orders_customer on orders  (cost=0.28..8.40 rows=6 width=40)
--                                      (actual time=0.015..0.019 rows=6 loops=1)
--  Planning Time: 0.08 ms   Execution Time: 0.04 ms
''') + '''
<p>SQLite'ta karşılığı <code>EXPLAIN QUERY PLAN</code>'dır: <code>SCAN</code> tam tarama, <code>SEARCH ... USING INDEX</code> indeks kullanımıdır.</p>
''' + py('''
import veri

con = veri.baglan("anadolu_market", tablolar=["orders"])
sql = "SELECT * FROM orders WHERE customer_id = ?"
plan = lambda: con.execute("EXPLAIN QUERY PLAN " + sql, (42,)).fetchall()[0][-1]
print("önce :", plan())
con.execute("CREATE INDEX ix_orders_customer ON orders (customer_id)")
print("sonra:", plan())
print(len(con.execute(sql, (42,)).fetchall()), "sipariş")
''') + '''
<div class="tip"><b>İndeks bedava değildir</b>Her indeks her INSERT/UPDATE'te güncellenir ve disk kaplar. Sık filtrelenen, birleştirilen (JOIN) ve sıralanan sütunlara indeks koy; "her sütuna bir indeks" yaklaşımı yazmayı yavaşlatır.</div>

<h2>JSONB ve pgvector'a kısa bakış</h2>
<p>PostgreSQL yarı yapılandırılmış veriyi <code>jsonb</code> sütununda ikili biçimde saklar ve GIN ile indeksler. Örneğin ürün özellikleri: <code>WHERE ozellik @&gt; '{"renk": "siyah"}'</code>. <b>pgvector</b> eklentisi ise embedding vektörlerini saklayıp en yakın komşu araması yapar; RAG uygulamalarında ayrı bir vektör veritabanı yerine sık seçilir. SQLite'ta da JSON fonksiyonları vardır:</p>
''' + py('''
import json
import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE urun (id INTEGER PRIMARY KEY, ozellik TEXT)")
con.executemany("INSERT INTO urun VALUES (?, ?)", [
    (1, json.dumps({"renk": "siyah", "garanti": 2})),
    (2, json.dumps({"renk": "beyaz", "garanti": 1})),
])
print(con.execute("SELECT id, json_extract(ozellik, '$.garanti') FROM urun WHERE json_extract(ozellik, '$.renk') = ?", ("siyah",)).fetchall())
''') + '''

<h2>Migration disiplini, sızıntı ve zaman aşımı</h2>
<p>Üretim veritabanında tabloyu elle <code>ALTER</code> etmezsin. Her şema değişikliği sürüm numaralı bir <b>migration</b> dosyasıdır ve kodla birlikte gözden geçirilir; Python dünyasında araç <b>Alembic</b>'tir (<i>sqlalchemy-orm</i> dersinde). İki işletim hatası da sık görülür:</p>
<ul>
<li><b>Bağlantı sızıntısı</b>: <code>with</code> kullanmadan açılan ve hata yolunda kapanmayan bağlantılar havuzu tüketir; uygulama "PoolTimeout" ile kilitlenir.</li>
<li><b>Açık kalan transaction</b>: <code>idle in transaction</code> durumundaki bağlantı kilitleri tutar, diğer işlemleri bekletir.</li>
</ul>
''' + pc('''
psycopg.connect(DSN, connect_timeout=5, options="-c statement_timeout=3000")   # 3 sn'den uzun sorguyu iptal et
-- sunucuda: ALTER ROLE uygulama SET idle_in_transaction_session_timeout = '30s';
''') + '''
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
'''

SQL_STATE = ded('''
import sqlite3
con = sqlite3.connect(":memory:")
''')

ex = []
# ---------- Isınma
ex += [
    {'t': 'mc', 'stage': 'Isınma',
     'q': 'psycopg ile <code>cur.execute("SELECT * FROM customers WHERE city = %s", (sehir,))</code> yazıldı. <code>%s</code> burada ne işe yarar?',
     'o': ['Python\'un yüzde biçimlendirmesi; değer metne gömülür', 'Sürücünün yer tutucusu; değer ayrı ve güvenli gönderilir', 'Yalnızca metin (str) değerler için kullanılan bir şablon', 'PostgreSQL\'in kendi değişken sözdizimi; Python karışmaz'],
     'a': 1,
     'why': 'psycopg %s\'yi bir yer tutucu (placeholder) olarak kullanır ve değeri SQL metninden ayrı, doğru tırnaklama ve türle iletir. Sayı, tarih, None için de %s yazılır. Metne kendin gömersen (f-string ya da %) SQL enjeksiyonuna açık olursun.'},
    {'t': 'mc', 'stage': 'Isınma',
     'q': 'İki kasa aynı anda son kalan ürünü satmaya çalışıyor. Aşağıdakilerden hangisi stoğun eksiye düşmesini <b>engellemez</b>?',
     'o': ['SELECT ... FOR UPDATE ile satırı kilitleyip sonra güncellemek', 'UPDATE ... SET stok = stok - 1 WHERE id = ? AND stok >= 1 ve rowcount kontrolü', 'Önce SELECT ile stoğa bakıp Python\'da kontrol edip ayrı bir UPDATE yazmak', 'Stok sütununa CHECK (stok >= 0) kısıtı eklemek'],
     'a': 2,
     'why': 'Kilitsiz "oku, kontrol et, yaz" iki işlem arasında yarış durumuna açıktır: ikisi de aynı eski değeri okur. FOR UPDATE satırı kilitler, koşullu UPDATE kontrolü atomik yapar, CHECK kısıtı ise veritabanının ihlali reddetmesini sağlar.'},
    {'t': 'mc', 'stage': 'Isınma',
     'q': 'Ürünlerin <code>ozellik jsonb</code> sütununda <code>ozellik @&gt; \'{"renk": "siyah"}\'</code> sorgusunu hızlandırmak için hangi indeks türü uygundur?',
     'o': ['B-tree', 'GIN', 'Hash', 'İndeks gerekmez; jsonb kendiliğinden hızlıdır'],
     'a': 1,
     'why': 'GIN (generalized inverted index) bir değerin içindeki anahtar ve elemanları ayrı ayrı indeksler; jsonb içerme (@>), diziler ve tam metin arama için tasarlanmıştır. B-tree bütün değeri sıralar, içerik sorgusunda işe yaramaz.'},
]
# ---------- Kodu oku
ex += [
    {'t': 'predict', 'stage': 'Kodu oku', 'q': 'Upsert sonrası tablo ne olur? Bu kod ne yazdırır?',
     'code': ded('''
import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE stok (sku TEXT PRIMARY KEY, adet INTEGER)")
con.execute("INSERT INTO stok VALUES ('A', 5)")
for sku, adet in [("A", 3), ("B", 2), ("A", 1)]:
    con.execute(
        "INSERT INTO stok VALUES (?, ?) ON CONFLICT (sku) DO UPDATE SET adet = adet + excluded.adet",
        (sku, adet),
    )
print(con.execute("SELECT * FROM stok ORDER BY sku").fetchall())
'''),
     'o': ["[('A', 9), ('B', 2)]", "[('A', 1), ('B', 2)]", "[('A', 4), ('B', 2)]", 'IntegrityError'],
     'a': 0,
     'why': 'Çakışmada mevcut adet ile eklenmek istenen (excluded.adet) toplanır: 5 + 3 + 1 = 9. B ilk kez geldiği için normal eklenir. "SET adet = excluded.adet" yazılsaydı son değer (1) kalırdı.'},
    {'t': 'predict', 'stage': 'Kodu oku', 'q': 'Havale yarıda hata verdi. Bu kod ne yazdırır?',
     'code': ded('''
import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE hesap (no TEXT PRIMARY KEY, bakiye INTEGER CHECK (bakiye >= 0))")
con.executemany("INSERT INTO hesap VALUES (?, ?)", [("A", 100), ("B", 50)])
con.commit()
try:
    with con:
        con.execute("UPDATE hesap SET bakiye = bakiye + 80 WHERE no = 'B'")
        con.execute("UPDATE hesap SET bakiye = bakiye - 80 WHERE no = 'A'")
        con.execute("UPDATE hesap SET bakiye = bakiye - 80 WHERE no = 'A'")
except sqlite3.IntegrityError:
    print("reddedildi")
print(con.execute("SELECT bakiye FROM hesap ORDER BY no").fetchall())
'''),
     'o': ['reddedildi\n[(20,), (130,)]', 'reddedildi\n[(100,), (50,)]', '[(-60,), (130,)]', 'reddedildi\n[(100,), (130,)]'],
     'a': 1,
     'why': 'Üçüncü UPDATE CHECK kısıtını ihlal eder (20 - 80 < 0). with con bloğu hata görünce bütün transaction\'ı geri alır; önceki iki UPDATE de iptal olur ve bakiyeler başlangıçtaki gibi kalır.'},
    {'t': 'predict', 'stage': 'Kodu oku', 'q': 'RETURNING ne döndürür? Bu kod ne yazdırır?',
     'code': ded('''
import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE siparis (id INTEGER PRIMARY KEY, musteri TEXT, durum TEXT DEFAULT 'yeni')")
con.execute("INSERT INTO siparis (musteri) VALUES ('Ayşe')")
cur = con.execute("INSERT INTO siparis (musteri) VALUES (?), (?) RETURNING id, durum", ("Can", "Ece"))
print(cur.fetchall())
'''),
     'o': ["[(2, 'yeni'), (3, 'yeni')]", "[(1, 'yeni'), (2, 'yeni')]", "[(3, 'yeni')]", "[(2, None), (3, None)]"],
     'a': 0,
     'why': 'RETURNING eklenen her satırı, varsayılan değerler ve üretilen id dahil, geri döndürür. Ayşe id=1 aldığı için yeni satırlar 2 ve 3; durum sütunu DEFAULT ile \'yeni\' olur.'},
    {'t': 'order', 'stage': 'Kodu oku',
     'q': '<p>Anadolu Market fiyat güncellemelerini sırayla uygulayıp son fiyatı tutan programın satırlarını sırala.</p>',
     'lines': [
         'import veri',
         'con = veri.baglan("anadolu_market", tablolar=["price_updates"])',
         'con.execute("CREATE TABLE fiyat (product_id INTEGER PRIMARY KEY, fiyat REAL)")',
         'satirlar = con.execute("SELECT product_id, new_price FROM price_updates ORDER BY updated_at").fetchall()',
         'con.executemany("INSERT INTO fiyat VALUES (?, ?) ON CONFLICT (product_id) DO UPDATE SET fiyat = excluded.fiyat", satirlar)',
         'print(con.execute("SELECT fiyat FROM fiyat WHERE product_id = 30").fetchone()[0])',
     ],
     'needs': ['sqlite3'],
     'expect': '16584.0\n',
     'hint': 'Tablo, kendisine yazılacak upsert\'ten önce oluşturulmalı; güncellemeler zamana göre sıralı okunmalı.',
     'why': 'Ürün 30 iki kez güncellenmiştir (17536, sonra 16584). Zaman sırasıyla uygulanan upsert her seferinde fiyatı ezer ve son değer kalır.'},
]
# ---------- Rehberli
ex.append({'t': 'code', 'stage': 'Rehberli', 'id': 'postgresql-python-1', 'diff': 2, 'needs': ['sqlite3'],
  'q': '<p><code>fiyatlari_uygula(con)</code> fonksiyonunu yaz. <code>con</code>, <code>anadolu_market</code> setinden <code>price_updates</code> tablosunu içeren bir sqlite3 bağlantısıdır. Fonksiyon <code>guncel_fiyat(product_id INTEGER PRIMARY KEY, fiyat REAL, guncellendi TEXT)</code> tablosunu yoksa oluştursun ve her güncellemeyi upsert ile uygulasın: bir ürün için yalnızca <b>daha yeni</b> (<code>updated_at</code> büyük) kayıt eski fiyatın üstüne yazabilir. Güncellemeleri <b>bilerek ters sırada</b> (en yeniden eskiye) oku; sonuç yine doğru olmalı. Fonksiyon <code>guncel_fiyat</code> tablosundaki satır sayısını döndürsün.</p>',
  'guide': ['CREATE TABLE IF NOT EXISTS ile hedef tabloyu kur.', 'price_updates\'ı ORDER BY updated_at DESC ile oku.', 'Her satır için INSERT ... ON CONFLICT (product_id) DO UPDATE SET ... yaz.', 'Güncellemeye WHERE excluded.guncellendi > guncel_fiyat.guncellendi koşulu ekle.', 'with con: bloğu içinde çalış ve sonunda COUNT(*) döndür.'],
  'example': ded('''
import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE son_konum (arac TEXT PRIMARY KEY, konum TEXT, zaman TEXT)")
olaylar = [("34 AB 1", "Bursa", "10:05"), ("34 AB 1", "İzmit", "09:40")]   # sırasız
for arac, konum, zaman in olaylar:
    con.execute("""INSERT INTO son_konum VALUES (?, ?, ?)
                   ON CONFLICT (arac) DO UPDATE SET konum = excluded.konum, zaman = excluded.zaman
                   WHERE excluded.zaman > son_konum.zaman""", (arac, konum, zaman))
print(con.execute("SELECT * FROM son_konum").fetchall())
'''),
  'start': ded('''
import veri


def fiyatlari_uygula(con):
    # TODO: guncel_fiyat tablosunu (yoksa) oluştur
    guncellemeler = con.execute(
        "SELECT product_id, new_price, updated_at FROM price_updates ORDER BY updated_at DESC"
    ).fetchall()
    with con:
        for urun, fiyat, zaman in guncellemeler:
            pass  # TODO: yalnızca daha yeni kayıt üstüne yazan upsert
    # TODO: guncel_fiyat satır sayısını döndür
    return 0


con = veri.baglan("anadolu_market", tablolar=["price_updates"])
print(fiyatlari_uygula(con))
'''),
  'sol': ded('''
import veri


def fiyatlari_uygula(con):
    con.execute("""CREATE TABLE IF NOT EXISTS guncel_fiyat (
        product_id INTEGER PRIMARY KEY, fiyat REAL, guncellendi TEXT)""")
    guncellemeler = con.execute(
        "SELECT product_id, new_price, updated_at FROM price_updates ORDER BY updated_at DESC"
    ).fetchall()
    with con:
        for urun, fiyat, zaman in guncellemeler:
            con.execute("""
                INSERT INTO guncel_fiyat VALUES (?, ?, ?)
                ON CONFLICT (product_id) DO UPDATE
                   SET fiyat = excluded.fiyat, guncellendi = excluded.guncellendi
                 WHERE excluded.guncellendi > guncel_fiyat.guncellendi
            """, (urun, fiyat, zaman))
    return con.execute("SELECT COUNT(*) FROM guncel_fiyat").fetchone()[0]


con = veri.baglan("anadolu_market", tablolar=["price_updates"])
print(fiyatlari_uygula(con))
'''),
  'tests': ded('''
_n = fiyatlari_uygula(con)
assert _n == 16, f"18 güncelleme 16 farklı ürüne ait; tabloda 16 satır olmalı, gelen {_n}"
_f = dict(con.execute("SELECT product_id, fiyat FROM guncel_fiyat").fetchall())
assert _f[30] == 16584.0, f"Ürün 30'un son fiyatı 16584 (2024-12-09); eski kayıt yenisini ezmemeli. Gelen {_f[30]}"
assert _f[31] == 508.0, f"Ürün 31'in son fiyatı 508 olmalı, gelen {_f[31]}"
assert fiyatlari_uygula(con) == 16, "ikinci çalıştırma (idempotent) aynı sonucu vermeli"
assert dict(con.execute("SELECT product_id, fiyat FROM guncel_fiyat").fetchall())[30] == 16584.0, "tekrar çalıştırınca fiyat değişmemeli"
'''),
  'hints': ['Upsert: INSERT ... ON CONFLICT (product_id) DO UPDATE SET ...', 'excluded eklenmek istenen satırdır; mevcut satıra tablo adıyla erişirsin: guncel_fiyat.guncellendi', 'DO UPDATE SET fiyat = excluded.fiyat, guncellendi = excluded.guncellendi WHERE excluded.guncellendi > guncel_fiyat.guncellendi'],
  'why': 'Koşullu upsert, kayıtlar hangi sırada gelirse gelsin son durumu doğru kurar ve tekrar çalıştırmaya dayanıklıdır. Aynı SQL PostgreSQL\'de de birebir çalışır; yalnızca yer tutucu %s olur.'})

ex.append({'t': 'code', 'stage': 'Rehberli', 'id': 'postgresql-python-2', 'diff': 2,
  'q': '<p><code>siparis_olustur(con, musteri_id, kalemler)</code> yaz. <code>kalemler</code>: <code>(urun_id, adet, birim_fiyat)</code> demetleri. Tek transaction içinde <code>siparis</code> tablosuna bir satır ekle ve üretilen id\'yi <b>RETURNING</b> ile al; sonra her kalemi bu id ile <code>kalem</code> tablosuna ekle. Siparişin <code>toplam</code> sütununu kalemlerin adet × fiyat toplamıyla güncelle. Herhangi bir kalem hata verirse (ör. adet 0, CHECK ihlali) <b>hiçbir şey</b> kaydedilmemeli ve hata yukarı fırlatılmalı. Yeni sipariş id\'sini döndür.</p>',
  'guide': ['with con: bloğu aç (hepsi ya da hiçbiri).', 'INSERT INTO siparis (musteri_id) VALUES (?) RETURNING id ile id\'yi al: fetchone()[0].', 'executemany ile kalemleri ekle; her demete sipariş id\'sini ekle.', 'UPDATE siparis SET toplam = ? WHERE id = ? ile toplamı yaz ve id\'yi döndür.'],
  'example': ded('''
import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE fatura (id INTEGER PRIMARY KEY, firma TEXT)")
with con:
    fatura_id = con.execute("INSERT INTO fatura (firma) VALUES (?) RETURNING id", ("Ege Lojistik",)).fetchone()[0]
print("yeni fatura:", fatura_id)
'''),
  'start': ded('''
import sqlite3

SEMA = """
CREATE TABLE siparis (id INTEGER PRIMARY KEY, musteri_id INTEGER NOT NULL, toplam REAL DEFAULT 0);
CREATE TABLE kalem (siparis_id INTEGER REFERENCES siparis(id), urun_id INTEGER,
                    adet INTEGER CHECK (adet > 0), birim_fiyat REAL);
"""


def siparis_olustur(con, musteri_id, kalemler):
    # TODO: with con: içinde siparişi ekle, RETURNING id ile id'yi al
    # TODO: kalemleri ekle
    # TODO: toplamı güncelle ve id'yi döndür
    pass


con = sqlite3.connect(":memory:")
con.executescript(SEMA)
print(siparis_olustur(con, 7, [(27, 1, 584.0), (9, 2, 131.0)]))
'''),
  'sol': ded('''
import sqlite3

SEMA = """
CREATE TABLE siparis (id INTEGER PRIMARY KEY, musteri_id INTEGER NOT NULL, toplam REAL DEFAULT 0);
CREATE TABLE kalem (siparis_id INTEGER REFERENCES siparis(id), urun_id INTEGER,
                    adet INTEGER CHECK (adet > 0), birim_fiyat REAL);
"""


def siparis_olustur(con, musteri_id, kalemler):
    with con:
        sid = con.execute(
            "INSERT INTO siparis (musteri_id) VALUES (?) RETURNING id", (musteri_id,)
        ).fetchone()[0]
        con.executemany(
            "INSERT INTO kalem VALUES (?, ?, ?, ?)",
            [(sid, u, a, f) for u, a, f in kalemler],
        )
        toplam = sum(a * f for _, a, f in kalemler)
        con.execute("UPDATE siparis SET toplam = ? WHERE id = ?", (toplam, sid))
    return sid


con = sqlite3.connect(":memory:")
con.executescript(SEMA)
print(siparis_olustur(con, 7, [(27, 1, 584.0), (9, 2, 131.0)]))
'''),
  'tests': ded('''
import sqlite3 as _s
_c = _s.connect(":memory:")
_c.executescript(SEMA)
_id1 = siparis_olustur(_c, 7, [(27, 1, 584.0), (9, 2, 131.0)])
assert _id1 == 1, f"ilk sipariş id 1 olmalı, gelen {_id1}"
assert _c.execute("SELECT toplam FROM siparis WHERE id = 1").fetchone()[0] == 846.0, "toplam 584 + 2*131 = 846 olmalı"
assert _c.execute("SELECT COUNT(*) FROM kalem WHERE siparis_id = 1").fetchone()[0] == 2, "iki kalem eklenmeli"
try:
    siparis_olustur(_c, 8, [(5, 1, 1899.0), (6, 0, 50.0)])
    assert False, "adet 0 olan kalem CHECK hatası vermeli ve hata yukarı fırlatılmalı"
except _s.IntegrityError:
    pass
assert _c.execute("SELECT COUNT(*) FROM siparis").fetchone()[0] == 1, "hatalı siparişin başlığı da geri alınmalı (yarım sipariş kalmamalı)"
assert _c.execute("SELECT COUNT(*) FROM kalem").fetchone()[0] == 2, "hatalı siparişin ilk kalemi de geri alınmalı"
assert siparis_olustur(_c, 9, [(1, 3, 10.0)]) == 3, "hatalı denemeden sonra yeni sipariş sorunsuz eklenmeli (id 3: SQLite geri alınan id'yi yeniden kullanabilir ya da atlayabilir)"
assert "RETURNING" in __source__.upper(), "id'yi RETURNING ile al"
'''),
  'hints': ['Tüm işlemleri tek bir with con: bloğuna koy; hata olursa sqlite3 geri alır.', 'sid = con.execute("INSERT ... RETURNING id", (musteri_id,)).fetchone()[0]', 'Kalem demetlerine sid\'yi başa ekle: [(sid, u, a, f) for u, a, f in kalemler]'],
  'why': 'Başlık ve kalemler tek transaction\'da yazılınca "kalemsiz sipariş" ya da "yarım sipariş" oluşamaz. RETURNING, sunucunun ürettiği id\'yi ek bir sorgu ve yarış riski olmadan verir; PostgreSQL\'de lastrowid yoktur, standart yol budur.'})

ex.append({'t': 'code', 'stage': 'Rehberli', 'id': 'postgresql-python-3', 'diff': 2, 'needs': ['sqlite3'],
  'q': '<p><code>sepeti_dus(con, sepet)</code> yaz. <code>sepet</code>: <code>{urun_id: adet}</code> sözlüğü; <code>con</code>: <code>anadolu_market</code> setinin <code>products</code> tablosunu içeren bağlantı. Her ürünün stoğunu <b>koşullu UPDATE</b> ile düş (<code>WHERE stock &gt;= ?</code>). Bir ürünün bile stoğu yetmezse <b>hiçbir</b> ürünün stoğu değişmemeli ve fonksiyon <code>False</code> döndürmeli; hepsi başarılıysa <code>True</code>. İpucu: rowcount 0 ise bir istisna fırlatıp <code>with con:</code>\'un geri almasını sağla.</p>',
  'guide': ['Kendine küçük bir istisna sınıfı tanımla: class StokYok(Exception).', 'try içinde with con: aç ve sepetteki her ürün için koşullu UPDATE çalıştır.', 'cur.rowcount != 1 ise StokYok fırlat (with bloğu rollback yapar).', 'Başarıda True, StokYok yakalanınca False döndür.'],
  'example': ded('''
import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE koltuk (no TEXT PRIMARY KEY, bos INTEGER)")
con.executemany("INSERT INTO koltuk VALUES (?, ?)", [("1A", 1), ("1B", 0)])
cur = con.execute("UPDATE koltuk SET bos = 0 WHERE no = ? AND bos = 1", ("1B",))
print("ayrıldı mı?", cur.rowcount == 1)
'''),
  'start': ded('''
import veri


class StokYok(Exception):
    pass


def sepeti_dus(con, sepet):
    # TODO: try / with con: ile tüm sepeti tek transaction'da düş
    # TODO: rowcount 1 değilse StokYok fırlat
    for urun_id, adet in sepet.items():
        con.execute("UPDATE products SET stock = stock - ? WHERE product_id = ?", (adet, urun_id))
    return True


con = veri.baglan("anadolu_market", tablolar=["products"])
print(sepeti_dus(con, {1: 4, 2: 1}))
'''),
  'sol': ded('''
import veri


class StokYok(Exception):
    pass


def sepeti_dus(con, sepet):
    try:
        with con:
            for urun_id, adet in sepet.items():
                cur = con.execute(
                    "UPDATE products SET stock = stock - ? WHERE product_id = ? AND stock >= ?",
                    (adet, urun_id, adet),
                )
                if cur.rowcount != 1:
                    raise StokYok(urun_id)
    except StokYok:
        return False
    return True


con = veri.baglan("anadolu_market", tablolar=["products"])
print(sepeti_dus(con, {1: 4, 2: 1}))
'''),
  'tests': ded('''
_c = veri.baglan("anadolu_market", tablolar=["products"])
_s = lambda i: _c.execute("SELECT stock FROM products WHERE product_id = ?", (i,)).fetchone()[0]
assert (_s(1), _s(2)) == (74, 71), "başlangıç stokları 74 ve 71"
assert sepeti_dus(_c, {1: 4, 2: 1}) is True, "stok yeterliyse True"
assert (_s(1), _s(2)) == (70, 70), f"stoklar 70 ve 70 olmalı, gelen {(_s(1), _s(2))}"
assert sepeti_dus(_c, {1: 5, 2: 500}) is False, "ürün 2'nin stoğu 500'e yetmez: False"
assert _s(1) == 70, "bir ürün yetmeyince diğerinin stoğu da geri alınmalı (ürün 1 hâlâ 70)"
assert sepeti_dus(_c, {999: 1}) is False, "olmayan ürün de başarısız sayılmalı (rowcount 0)"
assert sepeti_dus(_c, {1: 70}) is True and _s(1) == 0, "stoğun tamamı satılabilir (>=)"
'''),
  'hints': ['Koşul: WHERE product_id = ? AND stock >= ?', 'Hata fırlatmak with con: bloğunun rollback yapmasını sağlar; istisnayı bloğun dışında yakala.', 'if cur.rowcount != 1: raise StokYok(urun_id)'],
  'why': 'Her UPDATE kendi kontrolünü atomik yapar; sepetin tamamı tek transaction\'da olduğu için "yarım sepet" düşülmez. PostgreSQL\'de aynı kod %s ile çalışır; FOR UPDATE\'e gerek kalmadan yarış durumunu çözer.'})

ex.append({'t': 'code', 'stage': 'Rehberli', 'id': 'postgresql-python-4', 'diff': 2, 'needs': ['sqlite3'],
  'q': '<p><code>plan_turu(con, sql, params)</code> yaz: sorgunun SQLite planını <code>EXPLAIN QUERY PLAN</code> ile al ve ilk plan satırının açıklama metni (son sütun) <code>"SEARCH"</code> ile başlıyorsa <code>"indeks"</code>, <code>"SCAN"</code> ile başlıyorsa <code>"tarama"</code> döndür. Sonra <code>indeksle(con)</code> yaz: <code>orders</code> tablosunda <code>customer_id</code> sütununa <code>ix_orders_customer</code> adlı indeksi <b>yoksa</b> oluştursun (iki kez çağrılınca hata vermesin).</p>',
  'guide': ['con.execute("EXPLAIN QUERY PLAN " + sql, params).fetchall() satır listesi döndürür.', 'İlk satırın son elemanı ([0][-1]) plan metnidir.', 'startswith ile SEARCH / SCAN ayrımı yap.', 'CREATE INDEX IF NOT EXISTS ix_orders_customer ON orders (customer_id)'],
  'example': ded('''
import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE personel (id INTEGER PRIMARY KEY, birim TEXT)")
satir = con.execute("EXPLAIN QUERY PLAN SELECT * FROM personel WHERE id = 3").fetchall()[0]
print(satir[-1])
'''),
  'start': ded('''
import veri


def plan_turu(con, sql, params=()):
    # TODO: EXPLAIN QUERY PLAN ile ilk satırın açıklamasını al
    # TODO: SEARCH -> "indeks", SCAN -> "tarama"
    return None


def indeksle(con):
    # TODO: indeksi yoksa oluştur
    pass


con = veri.baglan("anadolu_market", tablolar=["orders"])
sql = "SELECT * FROM orders WHERE customer_id = ?"
print(plan_turu(con, sql, (42,)))
indeksle(con)
print(plan_turu(con, sql, (42,)))
'''),
  'sol': ded('''
import veri


def plan_turu(con, sql, params=()):
    aciklama = con.execute("EXPLAIN QUERY PLAN " + sql, params).fetchall()[0][-1]
    if aciklama.startswith("SEARCH"):
        return "indeks"
    if aciklama.startswith("SCAN"):
        return "tarama"
    return None


def indeksle(con):
    con.execute("CREATE INDEX IF NOT EXISTS ix_orders_customer ON orders (customer_id)")


con = veri.baglan("anadolu_market", tablolar=["orders"])
sql = "SELECT * FROM orders WHERE customer_id = ?"
print(plan_turu(con, sql, (42,)))
indeksle(con)
print(plan_turu(con, sql, (42,)))
'''),
  'tests': ded('''
_c = veri.baglan("anadolu_market", tablolar=["orders"])
_q = "SELECT * FROM orders WHERE customer_id = ?"
assert plan_turu(_c, _q, (42,)) == "tarama", "indeks yokken customer_id filtresi tam tarama (SCAN) olmalı"
indeksle(_c)
indeksle(_c)
assert plan_turu(_c, _q, (42,)) == "indeks", "indeks kurulunca plan SEARCH olmalı"
assert plan_turu(_c, "SELECT * FROM orders WHERE order_id = ?", (5,)) == "indeks", "INTEGER PRIMARY KEY her zaman indekslidir"
assert plan_turu(_c, "SELECT * FROM orders WHERE channel = ?", ("web",)) == "tarama", "channel sütununda indeks yok"
assert len(_c.execute(_q, (42,)).fetchall()) == 6, "42 numaralı müşterinin 6 siparişi var"
'''),
  'hints': ['Plan satırları (id, parent, notused, detail) demetleridir; detail son sütundur.', 'aciklama = con.execute("EXPLAIN QUERY PLAN " + sql, params).fetchall()[0][-1]', 'IF NOT EXISTS indeksi ikinci kez kurmaya çalışınca hata vermez.'],
  'why': 'Sorgu planı okumak performans işinin ilk adımıdır. PostgreSQL\'de aynı karşılaştırmayı EXPLAIN ANALYZE çıktısındaki Seq Scan / Index Scan ile yaparsın; migration\'larda IF NOT EXISTS tekrar çalıştırmayı güvenli kılar.'})

# ---------- Kendin yaz
ex.append({'t': 'code', 'stage': 'Kendin yaz', 'id': 'postgresql-python-5', 'diff': 2, 'needs': ['sqlite3'],
  'q': '<p>psycopg\'deki <code>dict_row</code> davranışını taklit et. <code>sozluk_sorgu(con, sql, params=())</code> sorguyu çalıştırıp her satırı <code>{sütun_adı: değer}</code> sözlüğü olarak içeren bir liste döndürsün. Sütun adlarını <code>cursor.description</code>\'dan al; bağlantının <code>row_factory</code> ayarını <b>değiştirme</b>. <code>anadolu_market</code> müşterileriyle dene: <code>SELECT city, COUNT(*) AS n FROM customers GROUP BY city ORDER BY n DESC, city LIMIT 3</code>.</p>',
  'start': ded('''
import veri


def sozluk_sorgu(con, sql, params=()):
    pass


con = veri.baglan("anadolu_market", tablolar=["customers"])
print(sozluk_sorgu(con, "SELECT city, COUNT(*) AS n FROM customers GROUP BY city ORDER BY n DESC, city LIMIT 3"))
'''),
  'sol': ded('''
import veri


def sozluk_sorgu(con, sql, params=()):
    cur = con.execute(sql, params)
    adlar = [d[0] for d in cur.description]
    return [dict(zip(adlar, satir)) for satir in cur.fetchall()]


con = veri.baglan("anadolu_market", tablolar=["customers"])
print(sozluk_sorgu(con, "SELECT city, COUNT(*) AS n FROM customers GROUP BY city ORDER BY n DESC, city LIMIT 3"))
'''),
  'tests': ded('''
_c = veri.baglan("anadolu_market", tablolar=["customers"])
_r = sozluk_sorgu(_c, "SELECT city, COUNT(*) AS n FROM customers GROUP BY city ORDER BY n DESC, city LIMIT 3")
assert _r == [{"city": "İstanbul", "n": 28}, {"city": "Eskişehir", "n": 17}, {"city": "İzmir", "n": 16}], f"ilk üç şehir yanlış: {_r}"
_p = sozluk_sorgu(_c, "SELECT customer_id AS id, segment FROM customers WHERE city = ? AND segment = ? ORDER BY customer_id", ("Ankara", "Premium"))
assert all(set(d) == {"id", "segment"} for d in _p) and len(_p) > 0, "parametreli sorgu ve takma adlar (AS) çalışmalı"
assert sozluk_sorgu(_c, "SELECT * FROM customers WHERE city = ?", ("Atlantis",)) == [], "sonuç yoksa boş liste"
assert _c.row_factory is None, "bağlantının row_factory ayarı değiştirilmemeli"
'''),
  'hints': ['cur.description her sütun için bir demet verir; adı ilk elemandır.', 'dict(zip(adlar, satir)) bir satırı sözlüğe çevirir.'],
  'why': 'Sözlük satırları, sütun sırası değişince bozulmayan okunur kod sağlar. psycopg\'de row_factory=dict_row, sqlite3\'te sqlite3.Row aynı işi yapar; cursor.description ise DB-API standardı olduğu için her sürücüde çalışır.'})

ex.append({'t': 'code', 'stage': 'Kendin yaz', 'id': 'postgresql-python-6', 'diff': 2, 'needs': ['sqlite3'],
  'q': '<p>Toplu yükleme. <code>parti_yukle(hedef, satirlar, parti=500)</code> yaz: <code>satirlar</code> bir yineleyicidir (iterator; uzunluğu bilinmez, tamamını listeye çevirme). Satırları <code>parti</code> boyutlu gruplar halinde <code>executemany</code> ile <code>kalem(item_id, order_id, product_id, quantity, unit_price, discount)</code> tablosuna yaz; hepsi tek transaction olsun. Kaç <b>parti</b> gönderildiğini ve toplam satır sayısını <code>(parti_sayisi, satir_sayisi)</code> olarak döndür. Kaynak: <code>anadolu_market</code> <code>order_items</code>.</p>',
  'start': ded('''
import sqlite3
import itertools
import veri


def parti_yukle(hedef, satirlar, parti=500):
    pass


kaynak = veri.baglan("anadolu_market", tablolar=["order_items"])
hedef = sqlite3.connect(":memory:")
hedef.execute("CREATE TABLE kalem (item_id INTEGER PRIMARY KEY, order_id, product_id, quantity, unit_price, discount)")
print(parti_yukle(hedef, kaynak.execute("SELECT * FROM order_items")))
'''),
  'sol': ded('''
import sqlite3
import itertools
import veri


def parti_yukle(hedef, satirlar, parti=500):
    satirlar = iter(satirlar)
    parti_sayisi = satir_sayisi = 0
    with hedef:
        while grup := list(itertools.islice(satirlar, parti)):
            hedef.executemany("INSERT INTO kalem VALUES (?, ?, ?, ?, ?, ?)", grup)
            parti_sayisi += 1
            satir_sayisi += len(grup)
    return parti_sayisi, satir_sayisi


kaynak = veri.baglan("anadolu_market", tablolar=["order_items"])
hedef = sqlite3.connect(":memory:")
hedef.execute("CREATE TABLE kalem (item_id INTEGER PRIMARY KEY, order_id, product_id, quantity, unit_price, discount)")
print(parti_yukle(hedef, kaynak.execute("SELECT * FROM order_items")))
'''),
  'tests': ded('''
import sqlite3 as _s
_k = veri.baglan("anadolu_market", tablolar=["order_items"])
def _yeni():
    h = _s.connect(":memory:")
    h.execute("CREATE TABLE kalem (item_id INTEGER PRIMARY KEY, order_id, product_id, quantity, unit_price, discount)")
    return h
_h = _yeni()
assert parti_yukle(_h, _k.execute("SELECT * FROM order_items")) == (4, 1620), "1620 satır 500'lük partilerle 4 partide gider"
assert _h.execute("SELECT COUNT(*), ROUND(SUM(quantity * unit_price), 2) FROM kalem").fetchone()[0] == 1620, "tüm satırlar yüklenmeli"
_h2 = _yeni()
assert parti_yukle(_h2, iter([(1, 1, 1, 1, 10.0, 0.0), (2, 1, 2, 1, 5.0, 0.0), (3, 2, 1, 2, 10.0, 0.0)]), parti=2) == (2, 3), "3 satır, parti=2 -> 2 parti"
assert parti_yukle(_yeni(), iter([])) == (0, 0), "boş girdide parti gönderilmemeli"
assert parti_yukle(_yeni(), (r for r in _k.execute("SELECT * FROM order_items LIMIT 1000")), parti=1000) == (1, 1000), "tam bölünen durumda boş son parti olmamalı"
'''),
  'hints': ['itertools.islice(yineleyici, n) en fazla n eleman alır.', 'while grup := list(islice(satirlar, parti)): ... boş liste gelince durur.', 'Girdiyi önce iter() ile yineleyiciye çevir ki liste de verilse çalışsın.'],
  'why': 'Partili yükleme belleği sabit tutar ve gidiş-dönüş sayısını azaltır. PostgreSQL\'de daha da hızlısı COPY\'dir; ama executemany + parti kalıbı her sürücüde çalışır ve hata durumunda hangi partide kaldığını raporlamayı kolaylaştırır.'})

ex.append({'t': 'code', 'stage': 'Kendin yaz', 'id': 'postgresql-python-7', 'diff': 2, 'needs': ['duckdb'],
  'q': '<p>DuckDB ile COPY. <code>siparis_yukle(con, yol)</code> yaz: <code>siparis(order_id INTEGER PRIMARY KEY, customer_id INTEGER, order_date DATE, status TEXT, channel TEXT)</code> tablosunu oluştursun, <code>COPY ... FROM</code> ile CSV\'yi (başlık satırlı) yüklesin ve <code>{kanal: iptal_orani}</code> sözlüğü döndürsün. İptal oranı: o kanaldaki <code>status = \'cancelled\'</code> siparişlerin oranı, 3 basamağa yuvarlanmış. Dosya: <code>veri.yol("anadolu_market", "orders")</code>.</p>',
  'start': ded('''
import duckdb
import veri


def siparis_yukle(con, yol):
    pass


print(siparis_yukle(duckdb.connect(), veri.yol("anadolu_market", "orders")))
'''),
  'sol': ded('''
import duckdb
import veri


def siparis_yukle(con, yol):
    con.execute("""CREATE TABLE siparis (order_id INTEGER PRIMARY KEY, customer_id INTEGER,
                   order_date DATE, status TEXT, channel TEXT)""")
    con.execute(f"COPY siparis FROM '{yol}' (HEADER)")
    satirlar = con.execute("""
        SELECT channel, ROUND(AVG(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 3)
        FROM siparis GROUP BY channel
    """).fetchall()
    return {k: float(v) for k, v in satirlar}


print(siparis_yukle(duckdb.connect(), veri.yol("anadolu_market", "orders")))
'''),
  'tests': ded('''
import duckdb as _d
_c = _d.connect()
_r = siparis_yukle(_c, veri.yol("anadolu_market", "orders"))
assert set(_r) == {"mobile", "store", "web"}, f"üç kanal bekleniyordu: {_r}"
_b = {k: round(v, 3) for k, v in _c.execute("SELECT channel, AVG((status = 'cancelled')::INT) FROM siparis GROUP BY 1").fetchall()}
assert _c.execute("SELECT COUNT(*) FROM siparis").fetchone()[0] == 910, "910 sipariş yüklenmeli"
assert all(abs(_r[k] - _b[k]) < 1e-9 for k in _b), f"iptal oranları yanlış: {_r} / beklenen {_b}"
assert "COPY" in __source__.upper(), "yükleme COPY ile yapılmalı"
'''),
  'hints': ['COPY tablo FROM \'yol.csv\' (HEADER) komutunda yol bir metin sabitidir.', 'Oran için AVG(CASE WHEN status = \'cancelled\' THEN 1 ELSE 0 END) kullan.', 'DuckDB ROUND sonucu Decimal/float olabilir; float() ile çevir.'],
  'why': 'COPY satırları tek akışta okur; satır başına INSERT yükünü ortadan kaldırır. PostgreSQL\'de COPY FROM STDIN, DuckDB\'de COPY FROM dosya aynı fikirdir: toplu yüklemeyi veritabanının kendisine bırak.'})

ex.append({'t': 'code', 'stage': 'Kendin yaz', 'id': 'postgresql-python-8', 'diff': 2,
  'q': '<p>Sürücüler arası taşıma. Ekip psycopg\'den sqlite3\'e test ortamı kuruyor. <code>yer_tutucu_cevir(sql)</code> yaz: psycopg\'nin konumsal <code>%s</code> yer tutucularını <code>?</code>\'ye, adlı <code>%(ad)s</code> yer tutucularını <code>:ad</code>\'a çevirsin. psycopg\'de gerçek yüzde işareti <code>%%</code> olarak yazılır; bunu tek <code>%</code>\'ye çevir. Tek tırnaklı SQL metinlerinin <b>içindeki</b> karakterlere dokunma (ör. <code>\'%s\'</code> bir metin sabitidir, olduğu gibi kalsın).</p>',
  'start': ded('''
def yer_tutucu_cevir(sql):
    return sql.replace("%s", "?")


print(yer_tutucu_cevir("SELECT * FROM t WHERE ad LIKE 'A%%' AND sehir = %(sehir)s AND yas > %s"))
'''),
  'sol': ded('''
import re

_DESEN = re.compile(r"'(?:[^']|'')*'|%\\((\\w+)\\)s|%s|%%")


def yer_tutucu_cevir(sql):
    def degistir(m):
        parca = m.group(0)
        if parca.startswith("'"):
            return parca
        if m.group(1):
            return ":" + m.group(1)
        if parca == "%s":
            return "?"
        return "%"
    return _DESEN.sub(degistir, sql)


print(yer_tutucu_cevir("SELECT * FROM t WHERE ad LIKE 'A%%' AND sehir = %(sehir)s AND yas > %s"))
'''),
  'tests': ded('''
assert yer_tutucu_cevir("SELECT * FROM c WHERE city = %s AND segment = %s") == "SELECT * FROM c WHERE city = ? AND segment = ?", "konumsal %s -> ?"
assert yer_tutucu_cevir("UPDATE p SET stock = %(adet)s WHERE id = %(id)s") == "UPDATE p SET stock = :adet WHERE id = :id", "adlı -> :ad"
assert yer_tutucu_cevir("SELECT 100 %% 7, %s") == "SELECT 100 % 7, ?", "%% gerçek yüzde işaretidir"
assert yer_tutucu_cevir("SELECT '%s', %s") == "SELECT '%s', ?", "tırnak içindeki metne dokunma"
assert yer_tutucu_cevir("SELECT 'O''Brien %s', %s") == "SELECT 'O''Brien %s', ?", "metin içindeki kaçışlı tırnak ('') metni bitirmez"
import sqlite3 as _s
_c = _s.connect(":memory:")
assert _c.execute(yer_tutucu_cevir("SELECT %(a)s + %(b)s"), {"a": 2, "b": 3}).fetchone()[0] == 5, "çevrilmiş sorgu sqlite3'te çalışmalı"
'''),
  'hints': ['Soldan sağa tek geçişte dört şeyi ayırt et: tırnaklı metin, %(ad)s, %s, %%.', 're.sub ile bir fonksiyon ver; eşleşme türüne göre farklı değer döndür. Tırnaklı metin deseni: \'(?:[^\']|\'\')*\'', 'Desendeki sıra önemli: önce tırnaklı metin, sonra %(ad)s, sonra %s ve %%.'],
  'why': 'Basit replace tırnak içindeki metinleri ve %% kaçışını bozar. Tek geçişli bir düzenli ifade (regex) metin sabitlerini atlayarak yalnız gerçek yer tutucuları çevirir; ORM\'lerin "paramstyle" çevirisi de bu mantıkla çalışır.'})

# ---------- Hata avı
ex.append({'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'postgresql-python-9', 'diff': 2, 'needs': ['sqlite3'],
  'q': '<p>Hatayı bul ve düzelt. <code>sehir_musterileri(con, sehir)</code> bir şehrin müşteri sayısını döndürmeli. Test ortamında "İstanbul" çalışıyor ama destek ekibi arama kutusuna <code>x\' OR \'1\'=\'1</code> yazınca bütün müşterileri saydığını, <code>Ka\'ş</code> gibi kesme işaretli bir girdide ise programın çöktüğünü bildirdi. Sorguyu parametreli hale getir.</p>',
  'start': ded('''
import veri


def sehir_musterileri(con, sehir):
    sql = f"SELECT COUNT(*) FROM customers WHERE city = '{sehir}'"
    return con.execute(sql).fetchone()[0]


con = veri.baglan("anadolu_market", tablolar=["customers"])
print(sehir_musterileri(con, "İstanbul"))
'''),
  'sol': ded('''
import veri


def sehir_musterileri(con, sehir):
    sql = "SELECT COUNT(*) FROM customers WHERE city = ?"
    return con.execute(sql, (sehir,)).fetchone()[0]


con = veri.baglan("anadolu_market", tablolar=["customers"])
print(sehir_musterileri(con, "İstanbul"))
'''),
  'tests': ded('''
_c = veri.baglan("anadolu_market", tablolar=["customers"])
assert sehir_musterileri(_c, "İstanbul") == 28, "İstanbul'da 28 müşteri var"
assert sehir_musterileri(_c, "x' OR '1'='1") == 0, "enjeksiyon girdisi 150 değil 0 döndürmeli: değeri parametreyle geçir"
assert sehir_musterileri(_c, "Ka'ş") == 0, "kesme işaretli girdi çökmemeli"
'''),
  'hints': ['Değeri SQL metnine gömmek yerine yer tutucu kullan.', 'SQLite\'ta ? ; psycopg\'de %s. Değer ikinci argümanda demet olarak gider: (sehir,)'],
  'why': 'Parametreli sorguda değer SQL\'in parçası olmaz; veritabanı onu her zaman veri olarak görür. Bu hem enjeksiyonu hem de tırnak hatalarını kökten çözer. Kendi kaçış fonksiyonunu yazmak çözüm değildir.'})

ex.append({'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'postgresql-python-10', 'diff': 2,
  'q': '<p>Hatayı bul ve düzelt. Anadolu Bank\'ın <code>havale(con, kimden, kime, tutar)</code> fonksiyonu önce gönderenden düşüyor, sonra alıcıya ekliyor. Alıcı hesap numarası yanlış yazıldığında para gönderenden düşüyor ama hiçbir hesaba geçmiyor: toplam bakiye azalıyor! Fonksiyon alıcı yoksa ya da bakiye yetmiyorsa <code>ValueError</code> fırlatmalı ve <b>hiçbir</b> bakiye değişmemeli; başarıda <code>True</code> döndürmeli.</p>',
  'start': ded('''
import sqlite3


def havale(con, kimden, kime, tutar):
    cur = con.execute("UPDATE hesap SET bakiye = bakiye - ? WHERE no = ? AND bakiye >= ?", (tutar, kimden, tutar))
    if cur.rowcount != 1:
        raise ValueError("Gönderen yok ya da bakiye yetersiz")
    con.commit()
    cur = con.execute("UPDATE hesap SET bakiye = bakiye + ? WHERE no = ?", (tutar, kime))
    con.commit()
    return True


con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE hesap (no TEXT PRIMARY KEY, bakiye INTEGER)")
con.executemany("INSERT INTO hesap VALUES (?, ?)", [("TR01", 1000), ("TR02", 200)])
con.commit()
print(havale(con, "TR01", "TR02", 300))
'''),
  'sol': ded('''
import sqlite3


def havale(con, kimden, kime, tutar):
    with con:
        cur = con.execute("UPDATE hesap SET bakiye = bakiye - ? WHERE no = ? AND bakiye >= ?", (tutar, kimden, tutar))
        if cur.rowcount != 1:
            raise ValueError("Gönderen yok ya da bakiye yetersiz")
        cur = con.execute("UPDATE hesap SET bakiye = bakiye + ? WHERE no = ?", (tutar, kime))
        if cur.rowcount != 1:
            raise ValueError("Alıcı hesap bulunamadı")
    return True


con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE hesap (no TEXT PRIMARY KEY, bakiye INTEGER)")
con.executemany("INSERT INTO hesap VALUES (?, ?)", [("TR01", 1000), ("TR02", 200)])
con.commit()
print(havale(con, "TR01", "TR02", 300))
'''),
  'tests': ded('''
import sqlite3 as _s
_c = _s.connect(":memory:")
_c.execute("CREATE TABLE hesap (no TEXT PRIMARY KEY, bakiye INTEGER)")
_c.executemany("INSERT INTO hesap VALUES (?, ?)", [("TR01", 1000), ("TR02", 200)])
_c.commit()
_b = lambda: dict(_c.execute("SELECT no, bakiye FROM hesap").fetchall())
assert havale(_c, "TR01", "TR02", 300) is True and _b() == {"TR01": 700, "TR02": 500}, "başarılı havale"
try:
    havale(_c, "TR01", "TR99", 100)
    assert False, "olmayan alıcıda ValueError fırlatılmalı"
except ValueError:
    pass
assert _b() == {"TR01": 700, "TR02": 500}, f"başarısız havalede gönderenin bakiyesi geri alınmalı: {_b()}"
try:
    havale(_c, "TR02", "TR01", 10_000)
    assert False, "yetersiz bakiyede ValueError"
except ValueError:
    pass
assert sum(_b().values()) == 1200, "sistemdeki toplam para korunmalı"
'''),
  'hints': ['Sorun commit\'in iki adımın arasında olması: ilk adım kalıcı oluyor.', 'İki UPDATE\'i tek bir with con: bloğuna al; ara commit\'leri kaldır.', 'Alıcı için de rowcount kontrolü ekle ve 1 değilse ValueError fırlat (with bloğu rollback yapar).'],
  'why': 'Transaction sınırı iş kuralının sınırıyla aynı olmalı: "para düşüldü ve eklendi" tek bir bütündür. Ara commit, yarım işi kalıcı yapar. PostgreSQL\'de de with con.transaction(): bloğu aynı garantiyi verir.'})

# ---------- Meydan okuma
ex.append({'t': 'code', 'stage': 'Meydan okuma', 'id': 'postgresql-python-11', 'diff': 3,
  'q': '<p>Bağlantı havuzu yaz (psycopg_pool\'un sadeleştirilmiş hali). <code>Havuz(fabrika, boyut)</code>: <code>fabrika()</code> yeni bir bağlantı üreten fonksiyondur; bağlantılar <b>tembel</b> açılır (ilk ihtiyaçta), toplam açık bağlantı <code>boyut</code>\'u geçemez.</p><ul><li><code>al()</code>: boşta bağlantı varsa onu, yoksa ve sınır dolmadıysa yenisini verir; sınır doluysa <code>HavuzDolu</code> fırlatır.</li><li><code>birak(con)</code>: bağlantıyı boşa geri koyar. Bu havuzdan alınmamış bir bağlantı verilirse <code>ValueError</code>.</li><li><code>baglanti()</code>: bir bağlam yöneticisi (context manager). Blok başarıyla biterse <code>commit</code>, hata çıkarsa <code>rollback</code> yapar; her iki durumda da bağlantıyı havuza iade eder ve hatayı yutmaz.</li><li><code>acik</code> (toplam açılmış) ve <code>bosta</code> (bekleyen) sayıları özellik olarak okunabilsin.</li></ul>',
  'start': ded('''
import sqlite3
from contextlib import contextmanager


class HavuzDolu(Exception):
    pass


class Havuz:
    def __init__(self, fabrika, boyut):
        pass


h = Havuz(lambda: sqlite3.connect(":memory:"), 2)
'''),
  'sol': ded('''
import sqlite3
from contextlib import contextmanager


class HavuzDolu(Exception):
    pass


class Havuz:
    def __init__(self, fabrika, boyut):
        self._fabrika = fabrika
        self._boyut = boyut
        self._bos = []
        self._kullanimda = set()

    @property
    def acik(self):
        return len(self._bos) + len(self._kullanimda)

    @property
    def bosta(self):
        return len(self._bos)

    def al(self):
        if self._bos:
            con = self._bos.pop()
        elif self.acik < self._boyut:
            con = self._fabrika()
        else:
            raise HavuzDolu(f"{self._boyut} bağlantının hepsi kullanımda")
        self._kullanimda.add(con)
        return con

    def birak(self, con):
        if con not in self._kullanimda:
            raise ValueError("Bu bağlantı havuzdan alınmamış")
        self._kullanimda.remove(con)
        self._bos.append(con)

    @contextmanager
    def baglanti(self):
        con = self.al()
        try:
            yield con
            con.commit()
        except BaseException:
            con.rollback()
            raise
        finally:
            self.birak(con)


h = Havuz(lambda: sqlite3.connect(":memory:"), 2)
'''),
  'tests': ded('''
import sqlite3 as _s
_acilan = []
def _fab():
    c = _s.connect(":memory:")
    c.execute("CREATE TABLE t (x INTEGER)")
    c.commit()
    _acilan.append(c)
    return c
_h = Havuz(_fab, 2)
assert (_h.acik, _h.bosta) == (0, 0), "bağlantılar tembel açılmalı: başta hiç açık bağlantı yok"
_a = _h.al(); _b = _h.al()
assert _a is not _b and _h.acik == 2, "iki farklı bağlantı açılmalı"
try:
    _h.al(); assert False, "sınır doluyken HavuzDolu fırlatılmalı"
except HavuzDolu:
    pass
_h.birak(_a)
assert _h.bosta == 1 and _h.al() is _a, "bırakılan bağlantı yeniden kullanılmalı (yeni açılmamalı)"
assert len(_acilan) == 2, "toplam yalnız 2 bağlantı açılmalı"
try:
    _h.birak(_s.connect(":memory:")); assert False, "yabancı bağlantı ValueError"
except ValueError:
    pass
_h.birak(_a); _h.birak(_b)
with _h.baglanti() as _c:
    _c.execute("INSERT INTO t VALUES (1)")
_kim = _c
assert _kim.execute("SELECT COUNT(*) FROM t").fetchone()[0] == 1, "başarılı blok commit etmeli"
try:
    with _h.baglanti() as _c2:
        _c2.execute("INSERT INTO t VALUES (2)")
        raise RuntimeError("iş hatası")
except RuntimeError:
    pass
else:
    assert False, "hata yutulmamalı"
assert _c2.execute("SELECT COUNT(*) FROM t").fetchone()[0] == (1 if _c2 is _kim else 0), "hatalı blok rollback yapmalı"
assert _h.bosta == 2 and _h.acik == 2, "hata olsa da bağlantı havuza dönmeli (sızıntı yok)"
'''),
  'hints': ['Boştakiler için liste, kullanımdakiler için küme tut; acik = ikisinin toplamı.', 'Bağlantı nesneleri hashlenebilir; kümede doğrudan saklayabilirsin (ya da id(con)).', 'contextmanager içinde: con = self.al(); try: yield con; con.commit() except: con.rollback(); raise; finally: self.birak(con)'],
  'why': 'Gerçek havuzlar (psycopg_pool, SQLAlchemy QueuePool) aynı üç sorumluluğu taşır: sınırlı kaynak, yeniden kullanım ve her yolda iade. finally içinde iade, bağlantı sızıntısını önleyen tek güvenilir yerdir; hatayı yeniden fırlatmak ise çağıranın durumdan haberdar olmasını sağlar.'})

ex.append({'t': 'code', 'stage': 'Meydan okuma', 'id': 'postgresql-python-12', 'diff': 3, 'needs': ['sqlite3'],
  'q': '<p>Kanat Havayolları\'nda aynı uçuşta aynı koltuk iki yolcuya satılmış (koltuk kilidi yokmuş). İki fonksiyon yaz:</p><ol><li><code>cift_satilanlar(con)</code>: <code>hv_bookings</code>\'te iptal edilmemiş (<code>status != \'cancelled\'</code>) rezervasyonlarda aynı <code>(flight_id, seat)</code> için birden fazla kayıt olan çiftleri <code>[(flight_id, seat), ...]</code> olarak <code>flight_id, seat</code> sırasıyla döndürsün.</li><li><code>koltuk_ayir(con, flight_id, seat, passenger_id)</code>: <code>rezervasyon(id INTEGER PRIMARY KEY, flight_id, seat, passenger_id, status)</code> tablosuna <code>status=\'active\'</code> satır eklesin. Tabloda <code>(flight_id, seat)</code> üzerinde yalnız <code>status = \'active\'</code> satırları kapsayan bir <b>kısmi benzersiz indeks</b> (partial unique index) olsun (yoksa oluştur). Koltuk doluysa <code>None</code>, başarıdaysa <code>INSERT ... RETURNING id</code> ile gelen id\'yi döndür. Hata yakalamak yerine <code>ON CONFLICT DO NOTHING</code> kullan.</li></ol>',
  'start': ded('''
import sqlite3
import veri


def cift_satilanlar(con):
    pass


def koltuk_ayir(con, flight_id, seat, passenger_id):
    pass


con = veri.baglan("kanat_havayollari", tablolar=["hv_bookings"])
print(cift_satilanlar(con)[:3])
'''),
  'sol': ded('''
import sqlite3
import veri


def cift_satilanlar(con):
    return con.execute("""
        SELECT flight_id, seat FROM hv_bookings
        WHERE status != 'cancelled'
        GROUP BY flight_id, seat
        HAVING COUNT(*) > 1
        ORDER BY flight_id, seat
    """).fetchall()


def koltuk_ayir(con, flight_id, seat, passenger_id):
    con.execute("""CREATE TABLE IF NOT EXISTS rezervasyon (
        id INTEGER PRIMARY KEY, flight_id INTEGER, seat TEXT, passenger_id INTEGER, status TEXT)""")
    con.execute("""CREATE UNIQUE INDEX IF NOT EXISTS ux_koltuk
        ON rezervasyon (flight_id, seat) WHERE status = 'active'""")
    with con:
        satir = con.execute("""
            INSERT INTO rezervasyon (flight_id, seat, passenger_id, status)
            VALUES (?, ?, ?, 'active')
            ON CONFLICT DO NOTHING
            RETURNING id
        """, (flight_id, seat, passenger_id)).fetchone()
    return satir[0] if satir else None


con = veri.baglan("kanat_havayollari", tablolar=["hv_bookings"])
print(cift_satilanlar(con)[:3])
'''),
  'tests': ded('''
_c = veri.baglan("kanat_havayollari", tablolar=["hv_bookings"])
_r = cift_satilanlar(_c)
assert len(_r) == 20, f"iptal edilmemiş 20 çift satış var, gelen {len(_r)}"
assert _r[:3] == [(219, "27B"), (258, "22D"), (378, "32D")], f"ilk üç çift yanlış ya da sırasız: {_r[:3]}"
assert (2509, "18C") not in _r, "iptal edilenler sayılmamalı"
_k1 = koltuk_ayir(_c, 3200, "1A", 10)
assert _k1 == 1, f"ilk rezervasyon id 1 olmalı, gelen {_k1}"
assert koltuk_ayir(_c, 3200, "1A", 11) is None, "dolu koltuk ikinci kez satılmamalı (None)"
assert koltuk_ayir(_c, 3200, "1B", 11) == 2, "boş koltuk 1B ayrılabilmeli (id 2)"
assert koltuk_ayir(_c, 3201, "1A", 12) is not None, "başka uçuşta aynı koltuk serbest"
_c.execute("UPDATE rezervasyon SET status = 'cancelled' WHERE id = 1"); _c.commit()
assert koltuk_ayir(_c, 3200, "1A", 13) is not None, "iptal edilen koltuk yeniden satılabilmeli (kısmi indeks)"
assert "ON CONFLICT" in __source__.upper() and "RETURNING" in __source__.upper(), "ON CONFLICT DO NOTHING ve RETURNING kullan"
'''),
  'hints': ['Çiftler: GROUP BY flight_id, seat HAVING COUNT(*) > 1', 'Kısmi indeks: CREATE UNIQUE INDEX IF NOT EXISTS ad ON rezervasyon (flight_id, seat) WHERE status = \'active\'', 'ON CONFLICT DO NOTHING RETURNING id çakışmada hiç satır döndürmez; fetchone() None olur.'],
  'why': 'Uygulama kodundaki kontrol yarış durumunda delinir; kuralı veritabanına (benzersiz indeks) koymak en güçlü kilittir. Kısmi indeks yalnız aktif rezervasyonları kısıtlar, iptaller koltuğu serbest bırakır. Aynı sözdizimi PostgreSQL\'de de geçerlidir.'})

# ---------- Mini proje
ex.append({'t': 'code', 'stage': 'Mini proje', 'id': 'postgresql-python-13', 'diff': 3, 'needs': ['duckdb'],
  'q': '<p>Anadolu Market gece stok senkronu (DuckDB ile, PostgreSQL\'deki akışın aynısı). <code>senkron(con, urunler_yolu, gelen)</code> yaz:</p><ol><li><code>stok(product_id INTEGER PRIMARY KEY, name TEXT, stock INTEGER, guncelleme INTEGER DEFAULT 0)</code> tablosunu yoksa oluştur; boşsa <code>products</code> CSV\'sinden (<code>urunler_yolu</code>) <code>product_id, name, stock</code> sütunlarını yükle.</li><li><code>gelen</code>: depo sisteminden gelen <code>(product_id, name, giris_adedi)</code> listesi. Upsert ile uygula: ürün varsa <code>stock</code>\'a giriş adedini <b>ekle</b> ve <code>guncelleme</code>\'yi 1 artır; yoksa yeni ürün olarak ekle (<code>guncelleme = 1</code>).</li><li><code>RETURNING</code> ile etkilenen satırların <code>product_id</code>\'lerini topla.</li><li><code>{"etkilenen": sıralı id listesi, "toplam_stok": tablodaki stok toplamı, "yeni": yeni eklenen ürün sayısı}</code> döndür.</li></ol>',
  'start': ded('''
import duckdb
import veri


def senkron(con, urunler_yolu, gelen):
    pass


con = duckdb.connect()
print(senkron(con, veri.yol("anadolu_market", "products"), [(1, "Kablosuz Kulaklık", 6), (41, "Termos", 30)]))
'''),
  'sol': ded('''
import duckdb
import veri


def senkron(con, urunler_yolu, gelen):
    con.execute("""CREATE TABLE IF NOT EXISTS stok (
        product_id INTEGER PRIMARY KEY, name TEXT, stock INTEGER, guncelleme INTEGER DEFAULT 0)""")
    if con.execute("SELECT COUNT(*) FROM stok").fetchone()[0] == 0:
        con.execute(
            "INSERT INTO stok (product_id, name, stock) SELECT product_id, name, stock FROM read_csv(?)",
            [urunler_yolu],
        )
    onceki = {r[0] for r in con.execute("SELECT product_id FROM stok").fetchall()}
    etkilenen = []
    for urun_id, ad, adet in gelen:
        satir = con.execute("""
            INSERT INTO stok (product_id, name, stock, guncelleme) VALUES (?, ?, ?, 1)
            ON CONFLICT (product_id) DO UPDATE
               SET stock = stok.stock + excluded.stock, guncelleme = stok.guncelleme + 1
            RETURNING product_id
        """, [urun_id, ad, adet]).fetchone()
        etkilenen.append(satir[0])
    yeni = len({u for u in etkilenen if u not in onceki})
    toplam = con.execute("SELECT SUM(stock) FROM stok").fetchone()[0]
    return {"etkilenen": sorted(set(etkilenen)), "toplam_stok": int(toplam), "yeni": yeni}


con = duckdb.connect()
print(senkron(con, veri.yol("anadolu_market", "products"), [(1, "Kablosuz Kulaklık", 6), (41, "Termos", 30)]))
'''),
  'tests': ded('''
import duckdb as _d
_c = _d.connect()
_y = veri.yol("anadolu_market", "products")
_r = senkron(_c, _y, [(1, "Kablosuz Kulaklık", 6), (41, "Termos", 30)])
assert _r == {"etkilenen": [1, 41], "toplam_stok": 5682 + 36, "yeni": 1}, f"ilk senkron yanlış: {_r}"
assert _c.execute("SELECT stock, guncelleme FROM stok WHERE product_id = 1").fetchone() == (80, 1), "ürün 1: 74 + 6 = 80, guncelleme 1"
_r2 = senkron(_c, _y, [(41, "Termos", 5), (2, "Akıllı Saat", 9), (41, "Termos", 5)])
assert _r2["etkilenen"] == [2, 41] and _r2["yeni"] == 0, f"ikinci senkronda yeni ürün yok: {_r2}"
assert _c.execute("SELECT stock, guncelleme FROM stok WHERE product_id = 41").fetchone() == (40, 3), "ürün 41: 30 + 5 + 5 = 40, üç güncelleme"
assert _r2["toplam_stok"] == 5718 + 19, "toplam stok 5737 olmalı"
assert _c.execute("SELECT COUNT(*) FROM stok").fetchone()[0] == 41, "CSV ikinci kez yüklenmemeli (41 ürün)"
assert "RETURNING" in __source__.upper(), "etkilenen id'leri RETURNING ile al"
'''),
  'hints': ['CSV yükleme: INSERT INTO stok (...) SELECT product_id, name, stock FROM read_csv(?) ve parametre olarak yol.', 'DuckDB upsert: ON CONFLICT (product_id) DO UPDATE SET stock = stok.stock + excluded.stock', 'Yeni ürünleri bulmak için senkrondan önceki id kümesini sakla.'],
  'why': 'Gece senkronu tipik bir üretim işidir: başlangıç yüklemesi bir kez, ardından artımlı upsert. RETURNING hangi satırların değiştiğini ek sorgu olmadan verir; bu liste denetim kaydına (audit log) ya da önbellek temizliğine beslenir. Kod PostgreSQL\'e %s ve COPY ile neredeyse aynen taşınır.'})

lesson = {
  'id': 'postgresql-python', 'lv': 'ileri', 'mod': 'Mimari', 'min': 60,
  'needs': ['sqlite3', 'duckdb'],
  'title': 'PostgreSQL ile Python: psycopg, transaction, indeks ve toplu yükleme',
  'sum': 'Üretim veritabanı PostgreSQL\'e psycopg 3 ile bağlanırsın: parametreli sorgu, havuz, transaction ve kilit, ON CONFLICT ile upsert, RETURNING, COPY ile toplu yükleme, indeks ve EXPLAIN; alıştırmalar sqlite3 ve DuckDB eşdeğerleriyle çalışır.',
  'goals': [
    'SQLite ile PostgreSQL arasındaki mimari farkları açıklayıp hangisinin ne zaman seçileceğine karar verebilirim.',
    'psycopg 3 ile parametreli sorgu, dict_row ve bağlantı havuzu kullanan güvenli veri erişim kodu yazabilirim.',
    'Transaction, izolasyon seviyesi, FOR UPDATE ve koşullu UPDATE ile yarış durumlarını önleyebilirim.',
    'ON CONFLICT ile idempotent upsert, RETURNING ile üretilen değerleri alma ve COPY/executemany ile toplu yükleme yapabilirim.',
    'İndeks türlerini seçip EXPLAIN çıktısında tarama ile indeks kullanımını ayırt edebilirim.'
  ],
  'body': body,
  'ex': ex,
  'faq': [
    {'q': 'psycopg2 mi psycopg 3 mü?', 'a': 'Yeni projede psycopg 3 (paket adı psycopg). Async desteği, COPY API\'si, row_factory ve havuz paketi (psycopg_pool) ile daha moderndir. psycopg2 hâlâ çok yaygındır; API\'leri benzer olduğu için geçiş kolaydır.'},
    {'q': 'ORM varken ham SQL yazmaya gerek var mı?', 'a': 'Evet. ORM (SQLAlchemy, Django ORM) günlük CRUD\'u kolaylaştırır, ama toplu yükleme, karmaşık rapor sorguları, kilitler ve performans incelemesi için alttaki SQL\'i ve sürücüyü bilmek gerekir. ORM\'nin ürettiği sorguyu EXPLAIN ile okuyabilmelisin.'},
    {'q': 'Testlerde gerçek PostgreSQL mi kullanmalıyım, SQLite mı?', 'a': 'Mantık testleri için SQLite hızlıdır, ama tür, kilit ve sözdizimi farkları yüzünden entegrasyon testlerini gerçek PostgreSQL ile (Docker ya da testcontainers) çalıştır. Üretimde PostgreSQL kullanıp testte yalnız SQLite kullanmak, ancak üretimde ortaya çıkan hatalara yol açar.'},
    {'q': 'Upsert mi, önce SELECT sonra INSERT/UPDATE mi?', 'a': 'Upsert. Tek komut olduğu için atomiktir ve iki istek arasındaki yarışa açık değildir. Ayrı SELECT + INSERT kalıbı eşzamanlı isteklerde benzersizlik hatası ya da çift kayıt üretir.'},
    {'q': 'Hangi sütunlara indeks koymalıyım?', 'a': 'WHERE, JOIN ve ORDER BY\'da sık geçen, seçici (çok farklı değeri olan) sütunlara. Kararı tahminle değil EXPLAIN ANALYZE ile ver; yazma yoğun tablolarda her indeksin ekleme maliyetini de hesaba kat.'}
  ],
  'mistakes': [
    {'bad': 'cur.execute(f"SELECT * FROM customers WHERE city = \'{sehir}\'")', 'good': 'cur.execute("SELECT * FROM customers WHERE city = %s", (sehir,))', 'why': 'f-string ile kurulan SQL enjeksiyona açıktır ve kesme işaretli değerlerde çöker. Değeri her zaman yer tutucuyla ver.'},
    {'bad': 'cur.execute("SELECT * FROM t WHERE id = %s", sehir_id)', 'good': 'cur.execute("SELECT * FROM t WHERE id = %s", (sehir_id,))', 'why': 'Parametreler bir dizi (demet/liste) olmalıdır. Tek elemanlı demette virgülü unutma.'},
    {'bad': 'stok = cur.execute("SELECT stock ...").fetchone()[0]\nif stok >= adet:\n    cur.execute("UPDATE products SET stock = stock - %s ...", (adet,))', 'good': 'cur.execute("UPDATE products SET stock = stock - %s WHERE product_id = %s AND stock >= %s", (adet, urun_id, adet))\nbasarili = cur.rowcount == 1', 'why': 'Kilitsiz oku-kontrol et-yaz kalıbı yarış durumuna açıktır; kontrolü UPDATE\'in içine koy ya da FOR UPDATE kullan.'},
    {'bad': 'con = psycopg.connect(DSN)\ncon.execute("UPDATE ...")\n# commit ve close unutuldu', 'good': 'with psycopg.connect(DSN) as con:\n    con.execute("UPDATE ...")', 'why': 'with bloğu başarıda commit, hatada rollback ve her durumda kapanış sağlar; aksi halde bağlantı ve kilitler sızar.'},
    {'bad': 'for s in satirlar:\n    cur.execute("INSERT INTO t VALUES (%s, %s)", s)\n    con.commit()', 'good': 'with con.transaction():\n    cur.executemany("INSERT INTO t VALUES (%s, %s)", satirlar)', 'why': 'Her satırda commit hem çok yavaştır hem de yarıda kalan yüklemeyi tutarsız bırakır. Toplu yaz, tek transaction kullan (daha hızlısı COPY).'}
  ],
}

write(lesson, '/home/claude/py/v2/n3/postgresql-python.js')
