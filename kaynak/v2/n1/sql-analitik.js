/* PythonPatika — v2/n1: Python'dan SQL ile analiz: CTE, pencere fonksiyonları ve pandas karşılıkları */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
  {
    id: 'sql-analitik',
    lv: 'ileri',
    mod: 'Veri Bilimi Araçları',
    min: 60,
    needs: ['pandas', 'sqlite3', 'duckdb'],
    title: 'Python\'dan SQL ile analiz: CTE, pencere fonksiyonları ve pandas karşılıkları',
    sum: 'Anadolu Market\'in gerçek şemasında CTE ile adım adım sorgu, ROW_NUMBER/RANK/LAG/LEAD, kümülatif toplam ve hareketli ortalama, tekilleştirme, boşluk-ada, kohort sorgusu, JOIN yayılması ve NULL tuzakları, tarih fonksiyonları ve her kalıbın pandas karşılığı.',
    goals: [
      'pd.read_sql ve parametreli sorguyla veritabanından güvenle DataFrame çekebilirim',
      'Karmaşık bir analizi CTE adımlarına bölüp her adımı ayrı test edebilirim',
      'ROW_NUMBER, RANK, LAG/LEAD, SUM OVER ve ROWS BETWEEN ile pencere hesapları yapabilirim',
      'JOIN yayılmasını, LEFT JOIN + WHERE tuzağını ve COUNT(*) ile COUNT(sütun) farkını fark edip düzeltebilirim',
      'Bir SQL kalıbını pandas karşılığına çevirebilir, işin nerede yapılacağına karar verebilirim'
    ],
    body: `<h2>Neden Python'dan SQL?</h2>
<p>Veri ilanlarının neredeyse hepsinde ilk satır aynıdır: "İleri düzey SQL". Şirketin verisi bir veritabanında ya da veri ambarında (data warehouse) durur; analist, bilimci ve veri mühendisi günün büyük kısmında SQL yazar, sonucu Python'a alıp pandas ile işler, grafiğe ya da modele verir. <b>sqlite3 ile Python</b> dersinde bağlantı, parametreli sorgu ve transaction'ı gördün. Bu ders bir üst katman: <b>analitik SQL</b>. Yani CTE (Common Table Expression) ile sorguyu adım adım kurmak, pencere fonksiyonları (window functions) ile "satırı kaybetmeden" grup hesabı yapmak ve aynı işin pandas karşılığını bilmek.</p>
<p>Bütün örnekler Anadolu Market'in gerçek şemasında: <code>orders</code> (910 sipariş), <code>order_items</code> (1.620 satır), <code>customers</code> (150), <code>products</code> (40). <code>veri.baglan("anadolu_market")</code> tüm tabloları bellek içi bir SQLite veritabanına yükler; SQLite 3.25 ve sonrası pencere fonksiyonlarını destekler (tarayıcıdaki sürüm çok daha yeni).</p>
<pre class="py">import veri
import pandas as pd

con = veri.baglan("anadolu_market")
print(con.execute("SELECT sqlite_version()").fetchone()[0])

# pd.read_sql: sorgu sonucunu doğrudan DataFrame yapar; değerleri ? ile parametre olarak ver
sql = """
SELECT channel, status, COUNT(*) AS siparis
FROM orders
WHERE order_date &gt;= ?
GROUP BY channel, status
ORDER BY channel, siparis DESC
"""
df = pd.read_sql(sql, con, params=("2024-01-01",))
print(df.head(6))
print(df.groupby("channel")["siparis"].sum())</pre>
<div class="warn"><b>f-string ile sorgu kurma</b>Kullanıcıdan ya da dosyadan gelen değeri <code>f"... WHERE city = '{sehir}'"</code> diye sorguya gömmek SQL enjeksiyonuna (SQL injection) kapı açar ve tırnaklı değerlerde (ör. "Ka'an") sorguyu bozar. Değerler için her zaman <code>?</code> (SQLite) ya da <code>%s</code>/<code>:ad</code> (PostgreSQL sürücüleri) parametresi kullan. Tablo ve sütun adları parametre olamaz; onları sabit bir izin listesinden seç.</div>

<h2>Ciro tanımı: önce sözleşme</h2>
<p>Analitik sorgunun ilk adımı SQL değil, tanımdır. Bu derste <b>net ciro</b> = <code>quantity * unit_price * (1 - discount)</code>; yalnız <code>status IN ('delivered', 'shipped')</code> siparişler sayılır (iptal ve iade hariç). Bu tanımı her sorguda yeniden yazmak yerine bir CTE'ye koyarız ve diğer adımlar onun üzerine kurulur.</p>

<h2>CTE: sorguyu adım adım kurmak</h2>
<p><code>WITH ad AS (...)</code> bir sorguya isim verir; sonraki adımlar bu ismi tablo gibi kullanır. İç içe alt sorgu (subquery) ile aynı işi yapar ama yukarıdan aşağı okunur, her adım ayrı test edilebilir ve aynı ara sonuç birden çok yerde kullanılabilir.</p>
<pre class="py">import veri
con = veri.baglan("anadolu_market")

sql = """
WITH gecerli AS (                 -- 1) iptal/iade dışı siparişler
    SELECT order_id, customer_id, order_date, channel
    FROM orders
    WHERE status IN ('delivered', 'shipped')
),
satir AS (                        -- 2) satır bazında net tutar
    SELECT g.order_id, g.channel, strftime('%Y', g.order_date) AS yil,
           i.quantity * i.unit_price * (1 - i.discount) AS net
    FROM gecerli g
    JOIN order_items i ON i.order_id = g.order_id
)
SELECT yil, channel, ROUND(SUM(net), 2) AS ciro,
       COUNT(DISTINCT order_id) AS siparis
FROM satir
GROUP BY yil, channel
ORDER BY yil, ciro DESC
"""
for satir in con.execute(sql):
    print(satir)</pre>
<div class="tbl-wrap"><table>
<tr><th></th><th>Alt sorgu</th><th>CTE</th></tr>
<tr><td>Okuma yönü</td><td>İçten dışa</td><td>Yukarıdan aşağı, adım adım</td></tr>
<tr><td>Tekrar kullanım</td><td>Aynı alt sorguyu iki kez yazarsın</td><td>Bir kez tanımla, istediğin kadar kullan</td></tr>
<tr><td>Hata ayıklama</td><td>Parçayı ayırmak zor</td><td>Son SELECT'i <code>SELECT * FROM adim2</code> yapıp ara sonucu gör</td></tr>
<tr><td>Performans</td><td colspan="2">Modern motorlarda çoğunlukla aynı plan; fark okunurlukta</td></tr>
</table></div>

<h2>Pencere fonksiyonları: satırı kaybetmeden grup hesabı</h2>
<p><code>GROUP BY</code> her grubu tek satıra indirir. Pencere fonksiyonu ise her satırı yerinde bırakır ve yanına "penceresine" göre hesaplanan bir değer ekler. Kalıp hep aynıdır:</p>
<pre class="code">FONKSIYON(...) OVER (PARTITION BY grup ORDER BY sıra ROWS BETWEEN ... )</pre>
<div class="tbl-wrap"><table>
<tr><th>Fonksiyon</th><th>Ne yapar</th><th>Tipik soru</th></tr>
<tr><td><code>ROW_NUMBER()</code></td><td>1, 2, 3… (eşitlikte de farklı numara)</td><td>Her müşterinin son siparişi (tekilleştirme)</td></tr>
<tr><td><code>RANK()</code></td><td>Eşitlere aynı sıra, sonra boşluk: 1, 2, 2, 4</td><td>Sıralama tablosu</td></tr>
<tr><td><code>DENSE_RANK()</code></td><td>Eşitlere aynı sıra, boşluksuz: 1, 2, 2, 3</td><td>"İkinci en yüksek maaş"</td></tr>
<tr><td><code>LAG(x) / LEAD(x)</code></td><td>Önceki / sonraki satırın değeri</td><td>Aylık değişim, iki sipariş arası süre</td></tr>
<tr><td><code>SUM(x) OVER (ORDER BY ...)</code></td><td>Kümülatif toplam</td><td>Yılbaşından bugüne (YTD) ciro</td></tr>
<tr><td><code>AVG(x) OVER (... ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)</code></td><td>Hareketli ortalama</td><td>3 aylık trend</td></tr>
<tr><td><code>SUM(x) OVER ()</code></td><td>Tüm tablonun toplamı her satırda</td><td>Pay (yüzde) hesabı</td></tr>
</table></div>
<pre class="py">import veri
con = veri.baglan("anadolu_market")

sql = """
WITH aylik AS (
    SELECT strftime('%Y-%m', o.order_date) AS ay,
           SUM(i.quantity * i.unit_price * (1 - i.discount)) AS ciro
    FROM orders o JOIN order_items i ON i.order_id = o.order_id
    WHERE o.status IN ('delivered', 'shipped')
    GROUP BY ay
),
hesap AS (
    SELECT ay, ciro,
           LAG(ciro) OVER (ORDER BY ay)                                   AS onceki,
           SUM(ciro) OVER (PARTITION BY substr(ay, 1, 4) ORDER BY ay)     AS ytd,
           AVG(ciro) OVER (ORDER BY ay ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS ort3
    FROM aylik
)
SELECT ay, ROUND(ciro) AS ciro,
       ROUND(100.0 * (ciro - onceki) / onceki, 1) AS mom_yuzde,
       ROUND(ytd) AS ytd, ROUND(ort3) AS ort3
FROM hesap
WHERE ay &gt;= '2024-01'          -- filtre pencereden SONRA: Ocak'ın LAG'i Aralık 2023'ü görür
ORDER BY ay
"""
for r in con.execute(sql).fetchall()[:6]:
    print(r)</pre>
<div class="warn"><b>WHERE pencereden önce çalışır</b>SQL'in mantıksal sırası: FROM → WHERE → GROUP BY → HAVING → pencere fonksiyonları → SELECT → ORDER BY. Aynı SELECT içinde <code>WHERE ay &gt;= '2024-01'</code> yazarsan Aralık 2023 satırı pencereye hiç girmez; Ocak'ın <code>LAG</code> değeri NULL olur. Çözüm: pencereyi bir CTE'de hesapla, filtreyi dış sorguya koy (yukarıdaki gibi). Aynı nedenle pencere sonucunu WHERE'de kullanamazsın (<code>WHERE ROW_NUMBER() ... = 1</code> hata verir); önce CTE, sonra filtre.</div>

<h3>Tekilleştirme: her müşterinin son siparişi</h3>
<p>Analitikte en sık kalıplardan biri "her X'in en son / en büyük / ilk satırı"dır. <code>ROW_NUMBER()</code> grubu numaralar, dış sorgu 1 numarayı alır. Eşitlik ihtimali varsa ORDER BY'a ikinci bir anahtar (ör. <code>order_id</code>) ekle ki sonuç her çalıştırmada aynı olsun.</p>
<pre class="py">import veri
con = veri.baglan("anadolu_market")

sql = """
WITH sirali AS (
    SELECT customer_id, order_id, order_date, channel,
           ROW_NUMBER() OVER (PARTITION BY customer_id
                              ORDER BY order_date DESC, order_id DESC) AS rn
    FROM orders
)
SELECT customer_id, order_id, order_date, channel
FROM sirali WHERE rn = 1
ORDER BY customer_id
LIMIT 4
"""
for r in con.execute(sql):
    print(r)</pre>

<h3>Boşluk ve ada (gaps and islands): ardışık günler</h3>
<p>"Art arda kaç gün sipariş aldık?" sorusunun klasik hilesi: tarihleri sırala, her tarihten sıra numarasını çıkar. Ardışık günlerde hem tarih hem numara birer artar; fark sabit kalır. Aynı farka sahip satırlar bir "ada"dır.</p>
<pre class="py">import veri
con = veri.baglan("anadolu_market")

sql = """
WITH gunler AS (SELECT DISTINCT order_date AS gun FROM orders),
adalar AS (
    SELECT gun, julianday(gun) - ROW_NUMBER() OVER (ORDER BY gun) AS grup
    FROM gunler
)
SELECT MIN(gun) AS bas, MAX(gun) AS son, COUNT(*) AS gun_sayisi
FROM adalar GROUP BY grup
ORDER BY gun_sayisi DESC, bas
LIMIT 3
"""
print(con.execute(sql).fetchall())</pre>

<h2>JOIN tuzakları: satır çoğalması ve NULL</h2>
<p>Sipariş tablosunu sipariş satırlarıyla birleştirdiğin anda tablo 910 satırdan 1.620 satıra çıkar: bir siparişte birden çok ürün vardır. Sonra <code>COUNT(*)</code> ile "sipariş sayısı" saymak ya da sipariş düzeyindeki bir alanı (ör. kargo ücreti) <code>SUM</code> ile toplamak sonucu şişirir. Buna yayılma (fan-out) denir. Üç kural:</p>
<ul>
<li>Birleştirmeden önce her tablonun <b>tanecik düzeyini (grain)</b> söyle: "orders: sipariş başına bir satır", "order_items: sipariş-ürün başına bir satır".</li>
<li>Çoğalan tabloda sipariş say: <code>COUNT(DISTINCT order_id)</code>. Daha iyisi: önce satırları sipariş düzeyine topla (CTE), sonra birleştir.</li>
<li><code>COUNT(*)</code> satır sayar; <code>COUNT(sutun)</code> NULL olmayanları sayar. <code>customers</code>'ta <code>COUNT(*)</code> 150, <code>COUNT(email)</code> 139'dur.</li>
</ul>
<p>LEFT JOIN'in ikinci tuzağı: sağ tablo için koşulu <code>WHERE</code>'e yazarsan eşleşmeyen satırlar (NULL'lar) elenir ve LEFT JOIN sessizce INNER JOIN'e döner. "2024'te hiç sipariş vermeyen müşteriler dahil" bir sayım istiyorsan tarih koşulu <code>ON</code> içinde olmalı.</p>
<pre class="py">import veri
con = veri.baglan("anadolu_market")

yanlis = """
SELECT COUNT(*) FROM (
  SELECT c.customer_id, COUNT(o.order_id) AS n
  FROM customers c LEFT JOIN orders o ON o.customer_id = c.customer_id
  WHERE o.order_date &gt;= '2024-01-01'            -- NULL'ları eler
  GROUP BY c.customer_id)
"""
dogru = """
SELECT COUNT(*), SUM(n = 0) FROM (
  SELECT c.customer_id, COUNT(o.order_id) AS n
  FROM customers c LEFT JOIN orders o
       ON o.customer_id = c.customer_id AND o.order_date &gt;= '2024-01-01'
  GROUP BY c.customer_id)
"""
print("WHERE ile müşteri sayısı:", con.execute(yanlis).fetchone()[0])
print("ON ile (toplam, 2024'te sıfır):", con.execute(dogru).fetchone())</pre>

<h2>Tarih fonksiyonları</h2>
<div class="tbl-wrap"><table>
<tr><th>İş</th><th>SQLite</th><th>DuckDB / PostgreSQL</th><th>pandas</th></tr>
<tr><td>Ay anahtarı</td><td><code>strftime('%Y-%m', d)</code></td><td><code>date_trunc('month', d)</code></td><td><code>s.dt.to_period("M")</code></td></tr>
<tr><td>Yıl</td><td><code>strftime('%Y', d)</code> (metin)</td><td><code>year(d)</code> / <code>EXTRACT(year FROM d)</code></td><td><code>s.dt.year</code></td></tr>
<tr><td>İki tarih farkı (gün)</td><td><code>julianday(b) - julianday(a)</code></td><td><code>b - a</code> / <code>date_diff('day', a, b)</code></td><td><code>(b - a).dt.days</code></td></tr>
<tr><td>Tarih ekle</td><td><code>date(d, '+7 days')</code></td><td><code>d + INTERVAL 7 DAY</code></td><td><code>s + pd.Timedelta(days=7)</code></td></tr>
</table></div>
<p>SQLite'ta tarih yoktur, ISO metni vardır (<code>'2024-03-05'</code>). ISO biçim metin olarak da doğru sıralanır, bu yüzden <code>order_date &gt;= '2024-01-01'</code> çalışır. <code>'05.03.2024'</code> gibi bir biçim ise sıralamayı bozar; önce dönüştür (bkz. veri temizleme dersi).</p>

<h2>Aynı iş pandas'ta: çeviri tablosu</h2>
<div class="tbl-wrap"><table>
<tr><th>SQL</th><th>pandas</th></tr>
<tr><td><code>WITH a AS (...)</code></td><td>Ara DataFrame'e isim ver ya da <code>.pipe()</code> zinciri</td></tr>
<tr><td><code>ROW_NUMBER() OVER (PARTITION BY k ORDER BY t)</code></td><td><code>df.sort_values(t).groupby(k).cumcount() + 1</code></td></tr>
<tr><td><code>RANK() / DENSE_RANK()</code></td><td><code>groupby(k)[x].rank(method="min")</code> / <code>method="dense"</code></td></tr>
<tr><td><code>LAG(x) OVER (PARTITION BY k ORDER BY t)</code></td><td><code>df.sort_values(t).groupby(k)[x].shift(1)</code></td></tr>
<tr><td><code>SUM(x) OVER (PARTITION BY k ORDER BY t)</code></td><td><code>groupby(k)[x].cumsum()</code></td></tr>
<tr><td><code>AVG(x) OVER (ROWS 2 PRECEDING)</code></td><td><code>x.rolling(3, min_periods=1).mean()</code></td></tr>
<tr><td><code>SUM(x) OVER (PARTITION BY k)</code></td><td><code>groupby(k)[x].transform("sum")</code></td></tr>
<tr><td>Son satır (rn = 1)</td><td><code>sort_values(...).drop_duplicates(k, keep="last")</code></td></tr>
</table></div>
<pre class="py">import veri
import pandas as pd

o = veri.oku("anadolu_market", "orders")
o = o.sort_values(["customer_id", "order_date", "order_id"])
o["rn"] = o.groupby("customer_id").cumcount() + 1                    # ROW_NUMBER
o["onceki"] = o.groupby("customer_id")["order_date"].shift(1)         # LAG
o["ara_gun"] = (pd.to_datetime(o["order_date"]) - pd.to_datetime(o["onceki"])).dt.days
son = o.drop_duplicates("customer_id", keep="last")                   # her müşterinin son siparişi
print(o[o["customer_id"] == 1][["order_id", "order_date", "rn", "ara_gun"]].head(4))
print(len(son), "müşteri;", "ortalama sipariş arası:", round(o["ara_gun"].mean(), 1), "gün")</pre>

<h3>DuckDB: DataFrame'e doğrudan SQL</h3>
<p>DuckDB, bellekteki DataFrame'i tablo gibi sorgulayan analitik bir motordur; <code>date_trunc</code>, <code>QUALIFY</code> (pencere sonucunu doğrudan filtreleme) gibi kolaylıkları vardır. Ayrıntısı <b>polars ve DuckDB</b> dersinde.</p>
<pre class="py">import duckdb
import veri

orders = veri.oku("anadolu_market", "orders")
sonuc = duckdb.sql("""
    SELECT customer_id, order_id, order_date
    FROM orders
    QUALIFY ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC, order_id DESC) = 1
    ORDER BY customer_id
    LIMIT 3
""").fetchall()
print(sonuc)</pre>

<h2>SQL'de mi, pandas'ta mı?</h2>
<div class="tbl-wrap"><table>
<tr><th>Durum</th><th>Tercih</th><th>Neden</th></tr>
<tr><td>Milyonlarca satırdan küçük bir özet lazım</td><td>SQL</td><td>Veri ağdan taşınmaz; motor indeks ve paralellik kullanır</td></tr>
<tr><td>Filtre, JOIN, GROUP BY, pencere</td><td>SQL</td><td>Tanım veritabanında kalır, BI aracı da aynı sorguyu kullanabilir</td></tr>
<tr><td>İstatistik testi, model, grafik</td><td>pandas</td><td>SQL'de yoktur ya da çok zahmetlidir</td></tr>
<tr><td>Karmaşık metin temizliği, regex, Python fonksiyonu</td><td>pandas</td><td>Python ekosistemi</td></tr>
<tr><td>Keşif, hızlı deneme</td><td>İkisi de</td><td>Özet SQL'den, ince ayar pandas'ta</td></tr>
</table></div>
<p>Kural: <b>veriyi küçült, sonra çek</b>. <code>SELECT *</code> ile 10 milyon satırı pandas'a alıp <code>groupby</code> yapmak yerine GROUP BY'ı veritabanına yaptır.</p>
<p>Sorgu yavaşsa motorun planına bak. SQLite'ta <code>EXPLAIN QUERY PLAN</code>, PostgreSQL'de <code>EXPLAIN ANALYZE</code>:</p>
<pre class="py">import veri
con = veri.baglan("anadolu_market", tablolar=["orders"])
plan = "EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = ?"
print(con.execute(plan, (5,)).fetchall())        # SCAN: tüm tablo taranıyor
con.execute("CREATE INDEX ix_orders_customer ON orders(customer_id)")
print(con.execute(plan, (5,)).fetchall())        # SEARCH ... USING INDEX</pre>

<div class="note"><b>Gerçek işte</b>Bir analist ekibinde en sık geri dönen hata ciro raporunun "neden Power BI ile tutmadığı" sorusudur. Neredeyse her seferinde neden aynı üç şeyden biridir: iptal/iade siparişlerin dahil edilip edilmediği, JOIN sonrası yayılma ya da filtrenin pencere hesabından önce uygulanması. Bu yüzden iyi ekipler ciro tanımını tek bir CTE'de (ya da veritabanında bir görünümde, view) tutar ve her rapor onu kullanır. Kod incelemesinde (code review) ilk sorulan soru da "bu tablonun tanecik düzeyi ne?" olur.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Pencere çerçevesi: ROWS ile RANGE</h3>
<p><code>ORDER BY</code> olan bir pencerede varsayılan çerçeve <code>RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code>'dur. RANGE, sıralama değeri <i>eşit</i> olan tüm satırları "şimdiki satır" sayar; aynı günde iki sipariş varsa kümülatif toplam ikisinde de iki siparişin toplamını gösterir. Satır satır birikim istiyorsan çerçeveyi açıkça <code>ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code> yaz.</p>
<h3>Özyinelemeli CTE</h3>
<p><code>WITH RECURSIVE</code> hiyerarşi (yönetici-çalışan ağacı) ve tarih serisi üretmek için kullanılır. Örnek: eksik ayları da gösteren bir takvim üretip ciroyu LEFT JOIN'le bağlamak, "sıfır satışlı ay"ların rapordan kaybolmasını önler.</p>
<pre class="py">import veri
con = veri.baglan("anadolu_market", tablolar=["employees"])
sql = """
WITH RECURSIVE agac(emp_id, ad, seviye) AS (
    SELECT emp_id, first_name, 0 FROM employees WHERE manager_id IS NULL
    UNION ALL
    SELECT e.emp_id, e.first_name, a.seviye + 1
    FROM employees e JOIN agac a ON e.manager_id = a.emp_id
)
SELECT seviye, COUNT(*) FROM agac GROUP BY seviye ORDER BY seviye
"""
print(con.execute(sql).fetchall())</pre>
<h3>Üretim ortamında</h3>
<p>PostgreSQL, BigQuery, Snowflake ve DuckDB'de aynı pencere sözdizimi geçerlidir; farklar tarih fonksiyonlarında ve <code>QUALIFY</code> gibi eklerdedir. Python tarafında bağlantıyı SQLAlchemy ile kurup <code>pd.read_sql(text(sql), engine, params={...})</code> yazarsın (bkz. SQLAlchemy dersi). Büyük sonuçları <code>chunksize</code> ile parça parça okumak belleği korur.</p>
</section>`,
    ex: [
      {
        t: 'mc',
        stage: 'Isınma',
        q: '<code>customers</code> tablosunda 150 müşteri var, 11 müşterinin e-postası boş (NULL). <code>SELECT COUNT(*), COUNT(email) FROM customers</code> ne döndürür?',
        o: ['(150, 150)', '(150, 139)', '(139, 139)', '(139, 150)'],
        a: 1,
        why: '<code>COUNT(*)</code> satır sayar; <code>COUNT(sutun)</code> yalnız NULL olmayan değerleri sayar. Bu fark, "e-postası olan müşteri oranı" gibi metriklerde paydayı doğru seçmeni sağlar.'
      },
      {
        t: 'mc',
        stage: 'Isınma',
        q: 'Puanlar 90, 85, 85, 70. Büyükten küçüğe <code>DENSE_RANK()</code> hangi sıraları verir?',
        o: ['1, 2, 3, 4', '1, 2, 2, 4', '1, 2, 2, 3', '1, 1, 2, 3'],
        a: 2,
        why: 'DENSE_RANK eşitlere aynı sırayı verir ve boşluk bırakmaz: 1, 2, 2, 3. RANK boşluk bırakır (1, 2, 2, 4), ROW_NUMBER eşitlikte bile farklı numara verir (1, 2, 3, 4). "İkinci en yüksek maaş" sorusunda DENSE_RANK seçilir.'
      },
      {
        t: 'mc',
        stage: 'Isınma',
        q: '<code>customers LEFT JOIN orders</code> yazdın ve <code>WHERE o.order_date &gt;= \'2024-01-01\'</code> ekledin. 2024\'te hiç siparişi olmayan müşterilere ne olur?',
        o: [
          'Listede kalırlar; sipariş sayıları 0, tarihleri NULL olarak görünür',
          'Sonuçtan düşerler; LEFT JOIN fiilen INNER JOIN olur',
          'Sorgu hata verir',
          'Tarihleri NULL, sayıları 1 görünür'
        ],
        a: 1,
        why: 'Eşleşmeyen satırlarda <code>o.order_date</code> NULL\'dır; <code>NULL &gt;= \'2024-01-01\'</code> doğru olmadığı için WHERE onları eler. Sağ tabloya ait koşulu <code>ON</code> içine taşırsan müşteriler kalır ve sayıları 0 olur.'
      },
      {
        t: 'predict',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE p (ad TEXT, puan INT)")\ncon.executemany("INSERT INTO p VALUES (?, ?)", [("Ali", 90), ("Can", 85), ("Ece", 85), ("Nur", 70)])\nsql = "SELECT ad, RANK() OVER (ORDER BY puan DESC) FROM p ORDER BY puan DESC, ad"\nprint([r[1] for r in con.execute(sql)])\n',
        o: ['[1, 2, 3, 4]', '[1, 2, 2, 3]', '[1, 2, 2, 4]', '[1, 1, 2, 3]'],
        a: 2,
        why: 'RANK eşit puanlılara aynı sırayı (2) verir, ardından eşit sayısı kadar atlar: sonraki 4 olur. Boşluksuz istersen DENSE_RANK kullanırsın.'
      },
      {
        t: 'predict',
        stage: 'Kodu oku',
        q: 'Pencere fonksiyonu ile WHERE aynı SELECT içinde. Bu kod ne yazdırır?',
        code: 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE t (ay INT, ciro INT)")\ncon.executemany("INSERT INTO t VALUES (?, ?)", [(1, 10), (2, 20), (3, 30), (4, 40)])\nsql = "SELECT ay, LAG(ciro) OVER (ORDER BY ay) FROM t WHERE ay >= 3"\nprint(con.execute(sql).fetchall())\n',
        o: ['[(3, 20), (4, 30)]', '[(3, None), (4, 30)]', '[(3, None), (4, None)]', '[(1, None), (2, 10), (3, 20), (4, 30)]'],
        a: 1,
        why: 'WHERE, pencere fonksiyonundan önce çalışır: pencere yalnız ay 3 ve 4\'ü görür, ay 3\'ün öncesi yoktur, LAG NULL (None) verir. Önceki ayı görmek için LAG\'ı bir CTE\'de hesapla, filtreyi dışarıda uygula.'
      },
      {
        t: 'predict',
        stage: 'Kodu oku',
        q: 'Anadolu Market verisinde: 910 sipariş var ve her siparişte en az bir ürün satırı bulunuyor (toplam 1.620 satır). Bu kod ne yazdırır?',
        code: 'import veri\ncon = veri.baglan("anadolu_market", tablolar=["orders", "order_items"])\nn1 = con.execute("SELECT COUNT(*) FROM orders").fetchone()[0]\nn2 = con.execute("SELECT COUNT(*) FROM orders o LEFT JOIN order_items i ON i.order_id = o.order_id").fetchone()[0]\nn3 = con.execute("SELECT COUNT(DISTINCT o.order_id) FROM orders o LEFT JOIN order_items i ON i.order_id = o.order_id").fetchone()[0]\nprint(n1, n2, n3)\n',
        o: ['910 910 910', '910 1620 1620', '910 1620 910', '1620 1620 910'],
        a: 2,
        why: 'LEFT JOIN sol tablodaki her satırı, sağda eşleşen her satır için bir kez yazar: 910 sipariş 1.620 satıra çoğalır (fan-out). <code>COUNT(DISTINCT order_id)</code> ise çoğalmadan etkilenmez ve 910 verir.'
      },
      {
        t: 'order',
        stage: 'Kodu oku',
        q: '<p>2024\'te en çok siparişin geldiği ayı CTE ile bulan programın satırlarını sırala.</p>',
        lines: [
          'import veri',
          'con = veri.baglan("anadolu_market", tablolar=["orders"])',
          'cte = "WITH aylik AS (SELECT strftime(\'%m\', order_date) AS ay, COUNT(*) AS n FROM orders WHERE order_date LIKE \'2024%\' GROUP BY ay)"',
          'sql = cte + " SELECT ay, n FROM aylik ORDER BY n DESC, ay LIMIT 1"',
          'ay, n = con.execute(sql).fetchone()',
          'print(ay, n)'
        ],
        expect: '11 62\n',
        hint: 'Bağlantı → CTE metni → ana sorgu (cte\'yi kullanır) → çalıştır → yazdır.',
        why: 'CTE metni ana sorgudan önce tanımlanmalı, çünkü <code>sql</code> onu birleştirerek kurar. Kasım ve Aralık 62\'şer siparişle eşit; <code>ORDER BY n DESC, ay</code> ikinci anahtar sayesinde sonucu belirli (deterministik) kılar.'
      },
      {
        t: 'code',
        stage: 'Rehberli',
        id: 'sql-analitik-1',
        diff: 1,
        needs: ['pandas', 'sqlite3'],
        q: '<p>Pazarlama, seçilen yıl için kanal bazında net ciroyu istiyor. <code>kanal_ciro(con, yil)</code> fonksiyonunu yaz: <code>pd.read_sql</code> ile <b>parametreli</b> bir sorgu çalıştırsın ve <code>channel</code>, <code>ciro</code> sütunlu, ciroya göre azalan sıralı bir DataFrame döndürsün.</p><ul><li>Net ciro: <code>quantity * unit_price * (1 - discount)</code>, <code>ROUND(..., 2)</code></li><li>Yalnız <code>status IN (\'delivered\', \'shipped\')</code></li><li>Yıl filtresi: <code>strftime(\'%Y\', order_date) = ?</code>; <code>yil</code> int gelebilir, <code>str(yil)</code> ver</li></ul>',
        guide: [
          'orders ile order_items\'ı order_id üzerinden JOIN et.',
          'WHERE\'e durum ve yıl koşulunu yaz; yıl için ? kullan.',
          'GROUP BY channel ile SUM al, ROUND(..., 2) uygula, ORDER BY ciro DESC.',
          'pd.read_sql(sql, con, params=(str(yil),)) döndür.'
        ],
        example: 'import sqlite3\nimport pandas as pd\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE s (sehir TEXT, yil TEXT, tutar REAL)")\ncon.executemany("INSERT INTO s VALUES (?, ?, ?)", [("Ankara", "2024", 10.5), ("Ankara", "2024", 4.5), ("İzmir", "2023", 7.0)])\nsql = "SELECT sehir, SUM(tutar) AS toplam FROM s WHERE yil = ? GROUP BY sehir ORDER BY toplam DESC"\nprint(pd.read_sql(sql, con, params=("2024",)))\n',
        start: 'import veri\nimport pandas as pd\n\ncon = veri.baglan("anadolu_market")\n\n\ndef kanal_ciro(con, yil):\n    sql = """\n    SELECT o.channel AS channel,\n           -- TODO: net ciroyu ROUND(SUM(...), 2) AS ciro olarak hesapla\n    FROM orders o\n    JOIN order_items i ON i.order_id = o.order_id\n    WHERE o.status IN (\'delivered\', \'shipped\')\n      -- TODO: yıl koşulu (parametreyle)\n    GROUP BY o.channel\n    ORDER BY ciro DESC\n    """\n    # TODO: pd.read_sql ile çalıştır ve döndür\n    return None\n\n\nprint(kanal_ciro(con, 2024))\n',
        sol: 'import veri\nimport pandas as pd\n\ncon = veri.baglan("anadolu_market")\n\n\ndef kanal_ciro(con, yil):\n    sql = """\n    SELECT o.channel AS channel,\n           ROUND(SUM(i.quantity * i.unit_price * (1 - i.discount)), 2) AS ciro\n    FROM orders o\n    JOIN order_items i ON i.order_id = o.order_id\n    WHERE o.status IN (\'delivered\', \'shipped\')\n      AND strftime(\'%Y\', o.order_date) = ?\n    GROUP BY o.channel\n    ORDER BY ciro DESC\n    """\n    return pd.read_sql(sql, con, params=(str(yil),))\n\n\nprint(kanal_ciro(con, 2024))\n',
        tests: 'd = kanal_ciro(con, 2024)\nassert isinstance(d, pd.DataFrame), "pd.read_sql bir DataFrame döndürür; onu return et"\nassert list(d.columns) == ["channel", "ciro"], "Sütunlar channel ve ciro olmalı (AS ile adlandır)"\nassert list(d["channel"]) == ["mobile", "web", "store"], "2024\'te sıra mobile > web > store olmalı (ORDER BY ciro DESC)"\nassert abs(d["ciro"].iloc[0] - 330854.2) < 0.01, "2024 mobil net ciro 330854.2 olmalı: iptal/iade hariç ve (1 - discount) ile"\nd3 = kanal_ciro(con, 2023)\nassert abs(d3["ciro"].sum() - 374833.8) < 0.01, "2023 toplamı 374833.8 olmalı; yıl parametresi doğru bağlanmalı"\nassert "?" in __source__, "Yılı sorguya f-string ile gömme; ? parametresi kullan"\n',
        hints: [
          'SQL\'de parametre yeri <code>?</code>, değerler <code>params=</code> ile demet olarak verilir.',
          '<code>AND strftime(\'%Y\', o.order_date) = ?</code>',
          'Son satır: <code>return pd.read_sql(sql, con, params=(str(yil),))</code>'
        ],
        why: 'Filtre ve toplama veritabanında yapılır, Python\'a yalnız 3 satır gelir. strftime metin döndürdüğü için yıl da metin olarak bağlanır; int bağlarsan <code>\'2024\' = 2024</code> SQLite\'ta yanlış olur ve boş tablo gelir.'
      },
      {
        t: 'code',
        stage: 'Rehberli',
        id: 'sql-analitik-2',
        diff: 2,
        needs: ['sqlite3'],
        q: '<p>Müşteri başına sipariş sayısı dağılımını CTE ile çıkar. <code>siparis_dagilimi(con)</code> fonksiyonu <code>{siparis_sayisi: musteri_sayisi}</code> sözlüğü döndürsün (tüm durumlar dahil, sipariş vermemiş müşteriler hariç). Örn. 1 sipariş vermiş 7 müşteri varsa <code>{1: 7, ...}</code>.</p>',
        guide: [
          'İlk CTE: müşteri başına sipariş sayısı (GROUP BY customer_id).',
          'Ana sorgu: bu CTE\'yi sipariş sayısına göre grupla ve say.',
          'fetchall() sonucunu dict() ile sözlüğe çevir.'
        ],
        example: 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE ziyaret (kisi TEXT)")\ncon.executemany("INSERT INTO ziyaret VALUES (?)", [("a",), ("a",), ("b",), ("c",), ("c",)])\nsql = """\nWITH k AS (SELECT kisi, COUNT(*) AS n FROM ziyaret GROUP BY kisi)\nSELECT n, COUNT(*) FROM k GROUP BY n\n"""\nprint(dict(con.execute(sql).fetchall()))\n',
        start: 'import veri\n\ncon = veri.baglan("anadolu_market", tablolar=["orders"])\n\n\ndef siparis_dagilimi(con):\n    sql = """\n    WITH musteri AS (\n        -- TODO: müşteri başına sipariş sayısı (n)\n        SELECT customer_id, 0 AS n FROM orders GROUP BY customer_id\n    )\n    SELECT n, COUNT(*) FROM musteri\n    -- TODO: n\'ye göre grupla\n    """\n    return dict(con.execute(sql).fetchall())\n\n\nprint(siparis_dagilimi(con))\n',
        sol: 'import veri\n\ncon = veri.baglan("anadolu_market", tablolar=["orders"])\n\n\ndef siparis_dagilimi(con):\n    sql = """\n    WITH musteri AS (\n        SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id\n    )\n    SELECT n, COUNT(*) FROM musteri\n    GROUP BY n ORDER BY n\n    """\n    return dict(con.execute(sql).fetchall())\n\n\nprint(siparis_dagilimi(con))\n',
        tests: 'd = siparis_dagilimi(con)\nassert isinstance(d, dict), "Sözlük döndür"\nassert d.get(1) == 7 and d.get(2) == 18 and d.get(4) == 23, "1 siparişli 7, 2 siparişli 18, 4 siparişli 23 müşteri olmalı"\nassert sum(d.values()) == 136, "Toplam 136 müşteri sipariş vermiş; her müşteri bir kez sayılmalı"\nassert sum(k * v for k, v in d.items()) == 910, "Sipariş sayısı × müşteri toplamı 910 siparişe eşit olmalı"\nassert max(d) == 26, "En sadık müşteri 26 sipariş vermiş"\n',
        hints: ['İki aşamalı GROUP BY: önce müşteri, sonra sipariş sayısı.', 'CTE içinde <code>COUNT(*) AS n</code>.', 'Ana sorguya <code>GROUP BY n</code> ekle.'],
        why: 'Bu "dağılımın dağılımı" kalıbı (histogram) iki GROUP BY gerektirir; CTE ilkini isimlendirdiği için okunur kalır. Sonuç, müşterilerin çoğunun 2–6 sipariş verdiğini, birkaç müşterinin ise 20\'nin üstünde olduğunu gösterir: uzun kuyruk.'
      },
      {
        t: 'code',
        stage: 'Rehberli',
        id: 'sql-analitik-3',
        diff: 2,
        needs: ['sqlite3'],
        q: '<p>CRM ekibi her müşterinin <b>son</b> siparişini istiyor. <code>son_siparisler(con)</code> fonksiyonunu ROW_NUMBER ile yaz; <code>(customer_id, order_id, order_date, channel)</code> demetlerinin listesini <code>customer_id</code>\'ye göre artan döndürsün. Aynı gün iki sipariş olursa büyük <code>order_id</code> son sayılsın.</p>',
        guide: [
          'CTE içinde ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC, order_id DESC) AS rn hesapla.',
          'Dış sorguda WHERE rn = 1 ile filtrele.',
          'ORDER BY customer_id ve fetchall() döndür.'
        ],
        example: 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE g (cihaz TEXT, zaman TEXT, olcum INT)")\ncon.executemany("INSERT INTO g VALUES (?, ?, ?)", [("A", "10:00", 5), ("A", "11:00", 7), ("B", "09:00", 3)])\nsql = """\nWITH s AS (SELECT cihaz, zaman, olcum,\n           ROW_NUMBER() OVER (PARTITION BY cihaz ORDER BY zaman DESC) AS rn FROM g)\nSELECT cihaz, zaman, olcum FROM s WHERE rn = 1 ORDER BY cihaz\n"""\nprint(con.execute(sql).fetchall())\n',
        start: 'import veri\n\ncon = veri.baglan("anadolu_market", tablolar=["orders"])\n\n\ndef son_siparisler(con):\n    sql = """\n    WITH sirali AS (\n        SELECT customer_id, order_id, order_date, channel,\n               1 AS rn  -- TODO: ROW_NUMBER() OVER (...)\n        FROM orders\n    )\n    SELECT customer_id, order_id, order_date, channel\n    FROM sirali\n    -- TODO: yalnız rn = 1\n    ORDER BY customer_id\n    """\n    return con.execute(sql).fetchall()\n\n\nprint(son_siparisler(con)[:3])\n',
        sol: 'import veri\n\ncon = veri.baglan("anadolu_market", tablolar=["orders"])\n\n\ndef son_siparisler(con):\n    sql = """\n    WITH sirali AS (\n        SELECT customer_id, order_id, order_date, channel,\n               ROW_NUMBER() OVER (PARTITION BY customer_id\n                                  ORDER BY order_date DESC, order_id DESC) AS rn\n        FROM orders\n    )\n    SELECT customer_id, order_id, order_date, channel\n    FROM sirali\n    WHERE rn = 1\n    ORDER BY customer_id\n    """\n    return con.execute(sql).fetchall()\n\n\nprint(son_siparisler(con)[:3])\n',
        tests: 'r = son_siparisler(con)\nassert len(r) == 136, "Sipariş vermiş 136 müşterinin her biri tam bir kez görünmeli"\nassert r[0] == (1, 8, "2023-12-17", "store"), "1 numaralı müşterinin son siparişi 8 (2023-12-17, store) olmalı"\nassert r[1] == (2, 18, "2024-12-09", "mobile"), "2 numaralı müşterinin son siparişi 18 olmalı: ORDER BY order_date DESC"\nassert [x[0] for x in r] == sorted(x[0] for x in r), "customer_id\'ye göre artan sırala"\n',
        hints: [
          'Pencere fonksiyonu WHERE\'de kullanılamaz; önce CTE\'de hesapla.',
          '<code>ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC, order_id DESC)</code>',
          'Dış sorguya <code>WHERE rn = 1</code> ekle.'
        ],
        why: 'PARTITION BY her müşteri için numaralamayı sıfırlar; DESC sıralama sayesinde 1 numara en yeni siparişe düşer. İkinci anahtar (order_id) eşitlikte sonucu deterministik yapar. pandas karşılığı: <code>sort_values(...).drop_duplicates("customer_id", keep="last")</code>.'
      },
      {
        t: 'code',
        stage: 'Rehberli',
        id: 'sql-analitik-4',
        diff: 2,
        needs: ['sqlite3'],
        q: '<p>Aylık net ciroyu ve bir önceki aya göre yüzde değişimi (MoM) hesapla. <code>aylik_degisim(con, baslangic)</code> fonksiyonu <code>baslangic</code> ayından (ör. <code>"2024-01"</code>) itibaren <code>(ay, ciro, yuzde)</code> demetleri döndürsün; <code>ciro</code> 2, <code>yuzde</code> 1 basamağa yuvarlanmış olsun. <b>Dikkat:</b> başlangıç ayının değişimi de hesaplanmalı (önceki ay filtre dışında kalsa bile).</p><p>Net ciro: <code>quantity * unit_price * (1 - discount)</code>, yalnız <code>delivered</code>/<code>shipped</code>.</p>',
        guide: [
          'CTE 1 (aylik): ay = strftime(\'%Y-%m\', order_date) ve SUM(net) — FİLTRESİZ, tüm aylar.',
          'CTE 2 (hesap): LAG(ciro) OVER (ORDER BY ay) AS onceki.',
          'Dış sorgu: WHERE ay &gt;= ? ile filtrele, yüzdeyi ROUND(100.0 * (ciro - onceki) / onceki, 1) olarak hesapla.',
          'ORDER BY ay ve fetchall().'
        ],
        example: 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE z (gun INT, ziyaret INT)")\ncon.executemany("INSERT INTO z VALUES (?, ?)", [(1, 100), (2, 120), (3, 90)])\nsql = """\nWITH h AS (SELECT gun, ziyaret, LAG(ziyaret) OVER (ORDER BY gun) AS onceki FROM z)\nSELECT gun, ROUND(100.0 * (ziyaret - onceki) / onceki, 1) FROM h WHERE gun >= ?\n"""\nprint(con.execute(sql, (2,)).fetchall())\n',
        start: 'import veri\n\ncon = veri.baglan("anadolu_market", tablolar=["orders", "order_items"])\n\n\ndef aylik_degisim(con, baslangic):\n    sql = """\n    WITH aylik AS (\n        SELECT strftime(\'%Y-%m\', o.order_date) AS ay,\n               SUM(i.quantity * i.unit_price * (1 - i.discount)) AS ciro\n        FROM orders o JOIN order_items i ON i.order_id = o.order_id\n        WHERE o.status IN (\'delivered\', \'shipped\')\n        GROUP BY ay\n    ),\n    hesap AS (\n        SELECT ay, ciro, NULL AS onceki   -- TODO: LAG ile önceki ayın cirosu\n        FROM aylik\n    )\n    SELECT ay, ROUND(ciro, 2), ROUND(100.0 * (ciro - onceki) / onceki, 1)\n    FROM hesap\n    -- TODO: başlangıç filtresi (parametreyle) ve sıralama\n    """\n    return con.execute(sql, ()).fetchall()\n\n\nfor r in aylik_degisim(con, "2024-01")[:4]:\n    print(r)\n',
        sol: 'import veri\n\ncon = veri.baglan("anadolu_market", tablolar=["orders", "order_items"])\n\n\ndef aylik_degisim(con, baslangic):\n    sql = """\n    WITH aylik AS (\n        SELECT strftime(\'%Y-%m\', o.order_date) AS ay,\n               SUM(i.quantity * i.unit_price * (1 - i.discount)) AS ciro\n        FROM orders o JOIN order_items i ON i.order_id = o.order_id\n        WHERE o.status IN (\'delivered\', \'shipped\')\n        GROUP BY ay\n    ),\n    hesap AS (\n        SELECT ay, ciro, LAG(ciro) OVER (ORDER BY ay) AS onceki\n        FROM aylik\n    )\n    SELECT ay, ROUND(ciro, 2), ROUND(100.0 * (ciro - onceki) / onceki, 1)\n    FROM hesap\n    WHERE ay >= ?\n    ORDER BY ay\n    """\n    return con.execute(sql, (baslangic,)).fetchall()\n\n\nfor r in aylik_degisim(con, "2024-01")[:4]:\n    print(r)\n',
        tests: 'r = aylik_degisim(con, "2024-01")\nassert len(r) == 12, "2024-01\'den 2024-12\'ye 12 ay dönmeli"\nassert r[0] == ("2024-01", 46389.85, 11.3), "Ocak 2024: ciro 46389.85, Aralık 2023\'e göre +%11.3 olmalı. None görüyorsan filtreyi LAG\'dan ÖNCE uyguluyorsun"\nassert r[3][2] == -49.0, "Nisan 2024 değişimi -49.0 olmalı"\nassert r[-1][0] == "2024-12", "Son ay 2024-12 olmalı (ORDER BY ay)"\nassert aylik_degisim(con, "2024-11")[0][2] == 21.2, "Kasım 2024 değişimi +21.2 olmalı"\n',
        hints: [
          'LAG önceki SATIRI görür; o satır pencereye girmezse NULL döner.',
          '<code>LAG(ciro) OVER (ORDER BY ay) AS onceki</code> CTE\'de; filtre dışarıda.',
          'Dış sorgu: <code>WHERE ay &gt;= ? ORDER BY ay</code> ve <code>con.execute(sql, (baslangic,))</code>.'
        ],
        why: 'Pencere hesabı tüm aylar üzerinde CTE\'de yapılır, filtre sonra uygulanır; böylece seçilen ilk ay da gerçek bir önceki aya karşılaştırılır. Bu, raporlarda "ilk ayın değişimi boş" hatasının en yaygın nedenidir.'
      },
      {
        t: 'code',
        stage: 'Kendin yaz',
        id: 'sql-analitik-5',
        diff: 2,
        needs: ['sqlite3'],
        q: '<p>Finans soruyor: "2024 hedefimizin yarısını hangi ayda geçtik?" <code>yari_yol_ayi(con, yil)</code> fonksiyonunu yaz. Ay bazında net ciroyu (delivered/shipped) hesapla, <code>SUM() OVER (ORDER BY ay)</code> ile kümülatif toplamı bul ve kümülatif toplamın yıllık toplamın <b>%50\'sine ilk kez ulaştığı ya da geçtiği</b> ayı <code>"YYYY-MM"</code> metni olarak döndür.</p>',
        start: 'import veri\n\ncon = veri.baglan("anadolu_market", tablolar=["orders", "order_items"])\n\n\ndef yari_yol_ayi(con, yil):\n    pass\n\n\nprint(yari_yol_ayi(con, 2024))\n',
        sol: 'import veri\n\ncon = veri.baglan("anadolu_market", tablolar=["orders", "order_items"])\n\n\ndef yari_yol_ayi(con, yil):\n    sql = """\n    WITH aylik AS (\n        SELECT strftime(\'%Y-%m\', o.order_date) AS ay,\n               SUM(i.quantity * i.unit_price * (1 - i.discount)) AS ciro\n        FROM orders o JOIN order_items i ON i.order_id = o.order_id\n        WHERE o.status IN (\'delivered\', \'shipped\')\n          AND strftime(\'%Y\', o.order_date) = ?\n        GROUP BY ay\n    ),\n    kum AS (\n        SELECT ay, SUM(ciro) OVER (ORDER BY ay) AS kumulatif,\n               SUM(ciro) OVER () AS toplam\n        FROM aylik\n    )\n    SELECT ay FROM kum WHERE kumulatif >= 0.5 * toplam ORDER BY ay LIMIT 1\n    """\n    satir = con.execute(sql, (str(yil),)).fetchone()\n    return satir[0] if satir else None\n\n\nprint(yari_yol_ayi(con, 2024))\n',
        tests: 'assert yari_yol_ayi(con, 2024) == "2024-08", "2024\'te kümülatif ciro yıllık toplamın yarısını Ağustos\'ta geçiyor (Temmuz sonunda %47.4)"\nassert yari_yol_ayi(con, 2023) is not None and yari_yol_ayi(con, 2023).startswith("2023-"), "2023 için de bir ay döndürmeli"\nassert yari_yol_ayi(con, 1999) is None, "Verisi olmayan yılda None döndür"\n',
        hints: [
          'İki pencere: <code>SUM(ciro) OVER (ORDER BY ay)</code> kümülatif, <code>SUM(ciro) OVER ()</code> yıllık toplam.',
          'Pencere sonucunu filtrelemek için bir CTE daha ekle; <code>WHERE kumulatif &gt;= 0.5 * toplam ORDER BY ay LIMIT 1</code>.'
        ],
        why: '<code>OVER ()</code> boş pencere tüm satırları kapsar; böylece toplamı ayrı bir sorguya gerek kalmadan her satıra yazarsın. Yıl filtresi burada CTE içinde olabilir, çünkü pencere zaten yalnız o yılı görmeli.'
      },
      {
        t: 'code',
        stage: 'Kendin yaz',
        id: 'sql-analitik-6',
        diff: 2,
        needs: ['sqlite3'],
        q: '<p>Aylık sipariş sayısı (tüm durumlar) ve <b>3 aylık hareketli ortalama</b> (o ay + önceki 2 ay) hesapla. <code>hareketli_ortalama(con)</code> fonksiyonu <code>{ay: (siparis, ort3)}</code> sözlüğü döndürsün; <code>ort3</code> 2 basamağa yuvarlansın. İlk aylarda pencere kısa kalırsa mevcut ayların ortalamasını al (SQL bunu kendisi yapar).</p>',
        start: 'import veri\n\ncon = veri.baglan("anadolu_market", tablolar=["orders"])\n\n\ndef hareketli_ortalama(con):\n    pass\n\n\nd = hareketli_ortalama(con)\nprint(d["2024-12"])\n',
        sol: 'import veri\n\ncon = veri.baglan("anadolu_market", tablolar=["orders"])\n\n\ndef hareketli_ortalama(con):\n    sql = """\n    WITH aylik AS (\n        SELECT strftime(\'%Y-%m\', order_date) AS ay, COUNT(*) AS n\n        FROM orders GROUP BY ay\n    )\n    SELECT ay, n,\n           ROUND(AVG(n) OVER (ORDER BY ay ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2)\n    FROM aylik\n    """\n    return {ay: (n, ort) for ay, n, ort in con.execute(sql)}\n\n\nd = hareketli_ortalama(con)\nprint(d["2024-12"])\n',
        tests: 'd = hareketli_ortalama(con)\nassert d["2024-12"] == (62, 59.67), "Aralık 2024: 62 sipariş, (55+62+62)/3 = 59.67 olmalı"\nassert d["2024-09"] == (43, 42.0), "Eylül 2024 ortalaması 42.0 olmalı"\nilk = min(d)\nassert d[ilk][1] == float(d[ilk][0]), "İlk ayda pencere tek satırdır; ortalama ayın kendi değeri olmalı"\nassert sum(v[0] for v in d.values()) == 910, "Aylık sayıların toplamı 910 olmalı"\n',
        hints: ['Önce aylık COUNT(*) CTE\'si, sonra pencere.', '<code>AVG(n) OVER (ORDER BY ay ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)</code>'],
        why: 'ROWS çerçevesi satır sayısıyla çalışır: "2 önceki satır + bu satır". Eksik ay olsaydı (o ay hiç sipariş yoksa) satır olmayacağı için pencere 3 takvim ayından fazlasına yayılırdı; bunu önlemek için önce tam bir ay takvimi üretip LEFT JOIN yapılır.'
      },
      {
        t: 'code',
        stage: 'Kendin yaz',
        id: 'sql-analitik-7',
        diff: 2,
        needs: ['sqlite3'],
        q: '<p>Müşteriler ilk siparişten sonra ne kadar sürede geri dönüyor? <code>ikinci_siparis_suresi(con)</code> fonksiyonu, en az 2 siparişi olan her müşteri için <code>{customer_id: gun}</code> döndürsün: ilk ve ikinci sipariş arasındaki gün sayısı (int). Sipariş sırası <code>order_date, order_id</code> ile belirlenir. LEAD ya da ROW_NUMBER ve <code>julianday</code> kullan.</p>',
        start: 'import veri\n\ncon = veri.baglan("anadolu_market", tablolar=["orders"])\n\n\ndef ikinci_siparis_suresi(con):\n    pass\n\n\nd = ikinci_siparis_suresi(con)\nprint(len(d), d.get(1))\n',
        sol: 'import veri\n\ncon = veri.baglan("anadolu_market", tablolar=["orders"])\n\n\ndef ikinci_siparis_suresi(con):\n    sql = """\n    WITH s AS (\n        SELECT customer_id, order_date,\n               LEAD(order_date) OVER (PARTITION BY customer_id ORDER BY order_date, order_id) AS sonraki,\n               ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date, order_id) AS rn\n        FROM orders\n    )\n    SELECT customer_id, CAST(julianday(sonraki) - julianday(order_date) AS INTEGER)\n    FROM s WHERE rn = 1 AND sonraki IS NOT NULL\n    """\n    return dict(con.execute(sql).fetchall())\n\n\nd = ikinci_siparis_suresi(con)\nprint(len(d), d.get(1))\n',
        tests: 'd = ikinci_siparis_suresi(con)\nassert len(d) == 129, "136 müşteriden 7\'si tek sipariş vermiş; 129 müşteri kalmalı"\nassert d[1] == 34 and d[5] == 137, "Müşteri 1 için 34, müşteri 5 için 137 gün olmalı"\nassert all(isinstance(v, int) for v in d.values()), "Gün sayıları int olmalı"\nassert round(sum(d.values()) / len(d), 1) == 86.2, "Ortalama geri dönüş süresi 86.2 gün olmalı"\n',
        hints: [
          'LEAD(order_date) her satıra müşterinin bir sonraki sipariş tarihini getirir.',
          'Yalnız ilk siparişin satırını al (rn = 1) ve sonraki NULL olmasın; fark: <code>julianday(sonraki) - julianday(order_date)</code>.'
        ],
        why: 'LEAD/LAG self-join yazmadan komşu satıra erişir. Ortalama ~86 gün; pazarlama "ikinci sipariş" kampanyasını ilk siparişten 30–60 gün sonra planlayabilir. pandas karşılığı: <code>groupby("customer_id")["order_date"].shift(-1)</code>.'
      },
      {
        t: 'code',
        stage: 'Kendin yaz',
        id: 'sql-analitik-8',
        diff: 2,
        needs: ['pandas'],
        q: '<p>Aynı tekilleştirmeyi pandas ile yap. <code>pandas_son_siparis(orders)</code> fonksiyonu <code>orders</code> DataFrame\'ini alsın ve her müşterinin son siparişini (en geç <code>order_date</code>, eşitlikte büyük <code>order_id</code>) içeren, <code>customer_id</code>\'ye göre sıralı, index\'i 0\'dan başlayan bir DataFrame döndürsün (sütunlar: <code>customer_id, order_id, order_date, channel</code>). Girdi DataFrame\'ini değiştirme.</p>',
        start: 'import veri\nimport pandas as pd\n\norders = veri.oku("anadolu_market", "orders")\n\n\ndef pandas_son_siparis(orders):\n    pass\n\n\nprint(pandas_son_siparis(orders).head(3))\n',
        sol: 'import veri\nimport pandas as pd\n\norders = veri.oku("anadolu_market", "orders")\n\n\ndef pandas_son_siparis(orders):\n    return (orders.sort_values(["customer_id", "order_date", "order_id"])\n                  .drop_duplicates("customer_id", keep="last")\n                  [["customer_id", "order_id", "order_date", "channel"]]\n                  .reset_index(drop=True))\n\n\nprint(pandas_son_siparis(orders).head(3))\n',
        tests: 'kopya = orders.copy()\nd = pandas_son_siparis(orders)\nassert orders.equals(kopya), "Girdi DataFrame\'ini yerinde değiştirme"\nassert list(d.columns) == ["customer_id", "order_id", "order_date", "channel"], "Sütunlar customer_id, order_id, order_date, channel olmalı"\nassert len(d) == 136 and d["customer_id"].is_unique, "Her müşteri bir kez: 136 satır"\nassert list(d.index[:3]) == [0, 1, 2], "reset_index(drop=True) ile index 0\'dan başlamalı"\nassert d.iloc[0].tolist() == [1, 8, "2023-12-17", "store"], "Müşteri 1\'in son siparişi 8 olmalı"\nassert d.iloc[1].tolist() == [2, 18, "2024-12-09", "mobile"], "Müşteri 2\'nin son siparişi 18 olmalı"\n',
        hints: [
          'ROW_NUMBER ... DESC = 1 kalıbının pandas karşılığı: sırala, sonra her grubun sonuncusunu tut.',
          '<code>sort_values([...]).drop_duplicates("customer_id", keep="last")</code>, ardından sütun seçimi ve <code>reset_index(drop=True)</code>.'
        ],
        why: 'Sıralayıp grubun son satırını tutmak, SQL\'deki <code>ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ... DESC) = 1</code> kalıbının birebir karşılığıdır. Alternatif: <code>groupby("customer_id").tail(1)</code> ya da <code>idxmax</code>; eşitlikleri ikinci anahtarla çözmeyi unutma.'
      },
      {
        t: 'code',
        stage: 'Hata avı',
        id: 'sql-analitik-9',
        diff: 2,
        kind: 'bug',
        needs: ['sqlite3'],
        q: '<p><b>Hatayı bul ve düzelt.</b> <code>musteri_2024(con)</code> her müşteri için 2024\'teki sipariş sayısını <code>{customer_id: sayi}</code> olarak döndürmeli; 2024\'te hiç siparişi olmayanlar da 0 ile listede olmalı (kampanya listesi bunlardan kurulacak). Fonksiyon 150 yerine 123 müşteri döndürüyor.</p>',
        start: 'import veri\n\ncon = veri.baglan("anadolu_market", tablolar=["customers", "orders"])\n\n\ndef musteri_2024(con):\n    sql = """\n    SELECT c.customer_id, COUNT(o.order_id)\n    FROM customers c\n    LEFT JOIN orders o ON o.customer_id = c.customer_id\n    WHERE o.order_date >= \'2024-01-01\'\n    GROUP BY c.customer_id\n    """\n    return dict(con.execute(sql).fetchall())\n\n\nd = musteri_2024(con)\nprint(len(d), sum(1 for v in d.values() if v == 0))\n',
        sol: 'import veri\n\ncon = veri.baglan("anadolu_market", tablolar=["customers", "orders"])\n\n\ndef musteri_2024(con):\n    sql = """\n    SELECT c.customer_id, COUNT(o.order_id)\n    FROM customers c\n    LEFT JOIN orders o\n           ON o.customer_id = c.customer_id\n          AND o.order_date >= \'2024-01-01\'\n    GROUP BY c.customer_id\n    """\n    return dict(con.execute(sql).fetchall())\n\n\nd = musteri_2024(con)\nprint(len(d), sum(1 for v in d.values() if v == 0))\n',
        tests: 'd = musteri_2024(con)\nassert len(d) == 150, "Tüm 150 müşteri listede olmalı; sağ tablo koşulu WHERE\'de olunca eşleşmeyenler eleniyor"\nassert sum(1 for v in d.values() if v == 0) == 27, "2024\'te siparişi olmayan 27 müşteri 0 ile görünmeli"\nassert d[1] == 0 and d[2] == 10, "Müşteri 1: 0, müşteri 2: 10 sipariş"\nassert sum(d.values()) == 537, "2024 sipariş toplamı 537 olmalı"\n',
        hints: ['Eşleşmeyen satırlarda <code>o.order_date</code> NULL; WHERE onları eler.', 'Tarih koşulunu <code>ON ... AND o.order_date &gt;= \'2024-01-01\'</code> içine taşı.'],
        why: 'LEFT JOIN\'de sağ tabloyu süzen koşul ON\'a yazılır: "2024 siparişlerini bağla, bağlanamayan müşteri yine kalsın". WHERE\'de ise birleşmeden sonra satır elenir. <code>COUNT(o.order_id)</code> (COUNT(*) değil) NULL\'ları saymadığı için eşleşmeyenler 0 olur.'
      },
      {
        t: 'code',
        stage: 'Hata avı',
        id: 'sql-analitik-10',
        diff: 2,
        kind: 'bug',
        needs: ['sqlite3'],
        q: '<p><b>Hatayı bul ve düzelt.</b> <code>kanal_aov(con)</code> her kanal için ortalama sepet tutarını (AOV = net ciro / sipariş sayısı; yalnız delivered/shipped) <code>{kanal: aov}</code> olarak, 2 basamağa yuvarlanmış döndürmeli. Rapor mobil AOV\'yi 846.65 TL gösteriyor, finansın hesabı ise yaklaşık 1.565 TL.</p>',
        start: 'import veri\n\ncon = veri.baglan("anadolu_market", tablolar=["orders", "order_items"])\n\n\ndef kanal_aov(con):\n    sql = """\n    SELECT o.channel,\n           ROUND(SUM(i.quantity * i.unit_price * (1 - i.discount)) / COUNT(*), 2)\n    FROM orders o JOIN order_items i ON i.order_id = o.order_id\n    WHERE o.status IN (\'delivered\', \'shipped\')\n    GROUP BY o.channel\n    """\n    return dict(con.execute(sql).fetchall())\n\n\nprint(kanal_aov(con))\n',
        sol: 'import veri\n\ncon = veri.baglan("anadolu_market", tablolar=["orders", "order_items"])\n\n\ndef kanal_aov(con):\n    sql = """\n    SELECT o.channel,\n           ROUND(SUM(i.quantity * i.unit_price * (1 - i.discount)) / COUNT(DISTINCT o.order_id), 2)\n    FROM orders o JOIN order_items i ON i.order_id = o.order_id\n    WHERE o.status IN (\'delivered\', \'shipped\')\n    GROUP BY o.channel\n    """\n    return dict(con.execute(sql).fetchall())\n\n\nprint(kanal_aov(con))\n',
        tests: 'd = kanal_aov(con)\nassert d["mobile"] == 1564.66, "Mobil AOV 1564.66 olmalı; payda sipariş sayısı (362), satır sayısı değil"\nassert d["store"] == 1516.54 and d["web"] == 1404.41, "Mağaza 1516.54, web 1404.41 olmalı"\n',
        hints: ['JOIN sonrası her satır bir sipariş değil, bir sipariş SATIRIdır.', 'Paydayı <code>COUNT(DISTINCT o.order_id)</code> yap.'],
        why: 'order_items ile birleşince tablo sipariş-ürün düzeyine iner (fan-out); COUNT(*) satır sayar ve AOV\'yi neredeyse yarıya düşürür. Ya COUNT(DISTINCT) kullan ya da önce sipariş başına tutarı bir CTE\'de toplayıp sonra kanal düzeyine çık.'
      },
      {
        t: 'code',
        stage: 'Meydan okuma',
        id: 'sql-analitik-11',
        diff: 3,
        needs: ['sqlite3'],
        q: '<p>Boşluk-ada problemi. <code>en_uzun_seri(con, kanal=None)</code> fonksiyonu, en az bir siparişin geldiği <b>ardışık takvim günlerinden</b> oluşan en uzun seriyi <code>(baslangic, bitis, gun_sayisi)</code> olarak döndürsün. <code>kanal</code> verilirse yalnız o kanalın siparişleri sayılsın (parametreyle). Eşit uzunlukta seriler varsa daha erken başlayanı döndür. Aynı günde birden çok sipariş tek gün sayılır.</p>',
        start: 'import veri\n\ncon = veri.baglan("anadolu_market", tablolar=["orders"])\n\n\ndef en_uzun_seri(con, kanal=None):\n    pass\n\n\nprint(en_uzun_seri(con))\nprint(en_uzun_seri(con, "store"))\n',
        sol: 'import veri\n\ncon = veri.baglan("anadolu_market", tablolar=["orders"])\n\n\ndef en_uzun_seri(con, kanal=None):\n    sql = """\n    WITH gunler AS (\n        SELECT DISTINCT order_date AS gun FROM orders\n        WHERE (? IS NULL OR channel = ?)\n    ),\n    adalar AS (\n        SELECT gun, julianday(gun) - ROW_NUMBER() OVER (ORDER BY gun) AS grup\n        FROM gunler\n    )\n    SELECT MIN(gun), MAX(gun), COUNT(*) AS n\n    FROM adalar GROUP BY grup\n    ORDER BY n DESC, MIN(gun)\n    LIMIT 1\n    """\n    return con.execute(sql, (kanal, kanal)).fetchone()\n\n\nprint(en_uzun_seri(con))\nprint(en_uzun_seri(con, "store"))\n',
        tests: 'assert en_uzun_seri(con) == ("2024-08-26", "2024-09-13", 19), "Tüm kanallarda en uzun seri 26 Ağustos – 13 Eylül 2024, 19 gün"\nassert en_uzun_seri(con, "store") == ("2024-08-26", "2024-08-29", 4), "Mağazada en uzun seri 4 gün (2024-08-26 → 2024-08-29)"\nassert en_uzun_seri(con, "web")[2] >= 2, "Web kanalı için de bir seri dönmeli"\nimport sqlite3\nk = sqlite3.connect(":memory:")\nk.execute("CREATE TABLE orders (order_date TEXT, channel TEXT)")\nk.executemany("INSERT INTO orders VALUES (?, ?)", [("2024-01-01", "web"), ("2024-01-01", "web"), ("2024-01-02", "web"), ("2024-01-05", "web"), ("2024-01-06", "web")])\nassert en_uzun_seri(k) == ("2024-01-01", "2024-01-02", 2), "Aynı gündeki iki sipariş tek gün sayılmalı; eşit serilerde erken olan seçilmeli"\n',
        hints: [
          'Önce DISTINCT gün listesi; sonra <code>julianday(gun) - ROW_NUMBER() OVER (ORDER BY gun)</code> ardışık günlerde sabit kalır.',
          'Bu farka göre grupla; isteğe bağlı filtre için <code>WHERE (? IS NULL OR channel = ?)</code> ve parametreyi iki kez ver.'
        ],
        why: 'Ardışık günlerde tarih ve sıra numarası birlikte artar, farkları sabittir; aynı farkı paylaşan günler bir adadır. DISTINCT şarttır: aynı gün iki kez sayılırsa numara ilerler, fark kayar ve ada bölünür. <code>? IS NULL OR</code> kalıbı isteğe bağlı filtreyi tek sorguda çözer.'
      },
      {
        t: 'code',
        stage: 'Meydan okuma',
        id: 'sql-analitik-12',
        diff: 3,
        needs: ['pandas', 'sqlite3'],
        q: '<p>Kohort tutundurma tablosu: SQL + pandas. <code>kohort_tablosu(con)</code> fonksiyonu şunu yapsın:</p><ul><li>Her müşterinin kohortu = ilk siparişinin ayı (<code>"YYYY-MM"</code>, tüm durumlar).</li><li><code>ay_farki</code> = sipariş ayı − kohort ayı (takvim ayı farkı: yıl farkı × 12 + ay farkı).</li><li>Her (kohort, ay_farki) için o ay sipariş veren <b>farklı</b> müşteri sayısı.</li><li>Sonucu pandas ile pivotla: index <code>kohort</code>, sütunlar <code>0, 1, 2, 3</code> (yalnız 0–3 ay), boş hücreler 0, değerler int.</li></ul>',
        start: 'import veri\nimport pandas as pd\n\ncon = veri.baglan("anadolu_market", tablolar=["orders"])\n\n\ndef kohort_tablosu(con):\n    pass\n\n\nprint(kohort_tablosu(con).loc["2024-01"])\n',
        sol: 'import veri\nimport pandas as pd\n\ncon = veri.baglan("anadolu_market", tablolar=["orders"])\n\n\ndef kohort_tablosu(con):\n    sql = """\n    WITH ilk AS (\n        SELECT customer_id, MIN(order_date) AS ilk_tarih\n        FROM orders GROUP BY customer_id\n    ),\n    akt AS (\n        SELECT DISTINCT o.customer_id,\n               strftime(\'%Y-%m\', i.ilk_tarih) AS kohort,\n               (CAST(strftime(\'%Y\', o.order_date) AS INTEGER) - CAST(strftime(\'%Y\', i.ilk_tarih) AS INTEGER)) * 12\n             + CAST(strftime(\'%m\', o.order_date) AS INTEGER) - CAST(strftime(\'%m\', i.ilk_tarih) AS INTEGER) AS ay_farki\n        FROM orders o JOIN ilk i ON i.customer_id = o.customer_id\n    )\n    SELECT kohort, ay_farki, COUNT(*) AS musteri\n    FROM akt WHERE ay_farki <= 3\n    GROUP BY kohort, ay_farki\n    """\n    uzun = pd.read_sql(sql, con)\n    tablo = uzun.pivot_table(index="kohort", columns="ay_farki", values="musteri",\n                             aggfunc="sum", fill_value=0)\n    tablo = tablo.reindex(columns=[0, 1, 2, 3], fill_value=0).astype(int)\n    tablo.columns.name = None\n    return tablo\n\n\nprint(kohort_tablosu(con).loc["2024-01"])\n',
        tests: 't = kohort_tablosu(con)\nassert list(t.columns) == [0, 1, 2, 3], "Sütunlar 0, 1, 2, 3 (ay farkı) olmalı"\nassert t.loc["2024-01"].tolist() == [11, 3, 2, 6], "2024-01 kohortu: 11 müşteri, 1. ay 3, 2. ay 2, 3. ay 6"\nassert t.loc["2022-12"].tolist() == [10, 4, 4, 8], "2022-12 kohortu: [10, 4, 4, 8]"\nassert t.loc["2024-04"].tolist() == [1, 0, 0, 0], "Boş hücreler 0 olmalı (2024-04: [1, 0, 0, 0])"\nassert int(t[0].sum()) == 136, "0. ay sütunu toplamı müşteri sayısına (136) eşit olmalı"\nassert t[0].dtype.kind == "i", "Değerler int olmalı"\n',
        hints: [
          'İlk CTE: müşteri başına MIN(order_date). İkinci CTE: her siparişi kohort ve ay_farki ile etiketle; aynı ayda birden çok sipariş için DISTINCT.',
          'strftime metin döndürür; ay farkı için CAST(... AS INTEGER) kullan.',
          'pandas: <code>pivot_table(..., fill_value=0)</code>, sonra <code>reindex(columns=[0, 1, 2, 3], fill_value=0).astype(int)</code>.'
        ],
        why: 'Ağır işi (ilk tarih, etiketleme, DISTINCT sayım) SQL yapar; şekil değiştirme (pivot) pandas\'ta daha doğaldır. Bu iş bölümü gerçek projelerde tipiktir. 0. ay sütunu kohort büyüklüğüdür; oranlar için <code>t.div(t[0], axis=0)</code> yeterli. Tutundurma yorumu <b>iş metrikleri</b> dersinde.'
      },
      {
        t: 'code',
        stage: 'Mini proje',
        id: 'sql-analitik-13',
        diff: 3,
        needs: ['pandas', 'sqlite3'],
        q: '<p><b>Aylık yönetim raporu.</b> <code>aylik_rapor(con, yil)</code> tek bir SQL sorgusu (CTE + pencere fonksiyonları) ve <code>pd.read_sql</code> ile, seçilen yılın her ayı için şu sütunları içeren, <code>ay</code> (<code>"YYYY-MM"</code>) index\'li bir DataFrame döndürsün:</p><ul><li><code>siparis</code>: delivered/shipped sipariş sayısı (farklı order_id)</li><li><code>ciro</code>: net ciro (2 basamak)</li><li><code>aov</code>: ciro / siparis (2 basamak)</li><li><code>mom</code>: önceki aya göre ciro değişimi % (1 basamak); yılın ilk ayı için önceki yılın Aralık\'ı kullanılır, o da yoksa NaN</li><li><code>ytd</code>: yılbaşından o aya kümülatif ciro (2 basamak)</li></ul>',
        start: 'import veri\nimport pandas as pd\n\ncon = veri.baglan("anadolu_market", tablolar=["orders", "order_items"])\n\n\ndef aylik_rapor(con, yil):\n    pass\n\n\nprint(aylik_rapor(con, 2024).head())\n',
        sol: 'import veri\nimport pandas as pd\n\ncon = veri.baglan("anadolu_market", tablolar=["orders", "order_items"])\n\n\ndef aylik_rapor(con, yil):\n    sql = """\n    WITH satir AS (\n        SELECT strftime(\'%Y-%m\', o.order_date) AS ay, o.order_id,\n               i.quantity * i.unit_price * (1 - i.discount) AS net\n        FROM orders o JOIN order_items i ON i.order_id = o.order_id\n        WHERE o.status IN (\'delivered\', \'shipped\')\n    ),\n    aylik AS (\n        SELECT ay, COUNT(DISTINCT order_id) AS siparis, SUM(net) AS ciro\n        FROM satir GROUP BY ay\n    ),\n    hesap AS (\n        SELECT ay, siparis, ciro,\n               LAG(ciro) OVER (ORDER BY ay) AS onceki,\n               SUM(ciro) OVER (PARTITION BY substr(ay, 1, 4) ORDER BY ay) AS ytd\n        FROM aylik\n    )\n    SELECT ay, siparis, ROUND(ciro, 2) AS ciro,\n           ROUND(ciro / siparis, 2) AS aov,\n           ROUND(100.0 * (ciro - onceki) / onceki, 1) AS mom,\n           ROUND(ytd, 2) AS ytd\n    FROM hesap\n    WHERE substr(ay, 1, 4) = ?\n    ORDER BY ay\n    """\n    return pd.read_sql(sql, con, params=(str(yil),)).set_index("ay")\n\n\nprint(aylik_rapor(con, 2024).head())\n',
        tests: 'r = aylik_rapor(con, 2024)\nassert list(r.columns) == ["siparis", "ciro", "aov", "mom", "ytd"], "Sütunlar: siparis, ciro, aov, mom, ytd"\nassert len(r) == 12 and r.index[0] == "2024-01", "2024\'ün 12 ayı, index ay metni olmalı"\nassert r.loc["2024-01", "mom"] == 11.3, "Ocak MoM +11.3: önceki Aralık\'ı görmek için yıl filtresi pencereden SONRA olmalı"\nassert r.loc["2024-12", "ytd"] == 703887.25, "Aralık YTD 703887.25 (2024 toplamı) olmalı"\nassert r.loc["2024-03", "ytd"] == 144329.75, "Mart YTD 144329.75 olmalı"\nassert abs(r["ciro"].sum() - 703887.25) < 0.05, "Aylık cirolar toplamı yıllık toplama eşit olmalı"\nassert abs(r.loc["2024-06", "aov"] - round(r.loc["2024-06", "ciro"] / r.loc["2024-06", "siparis"], 2)) < 0.011, "aov = ciro / siparis"\nassert r["siparis"].sum() < 537, "Yalnız delivered/shipped siparişler sayılmalı (2024\'te toplam sipariş 537)"\nr23 = aylik_rapor(con, 2023)\nassert r23.loc["2023-01", "ytd"] == r23.loc["2023-01", "ciro"], "YTD her yıl Ocak\'ta sıfırlanmalı (PARTITION BY yıl)"\nimport math\nr22 = aylik_rapor(con, 2022)\nassert math.isnan(r22["mom"].iloc[0]), "Verinin ilk ayında önceki ay yok; mom NaN olmalı"\n',
        hints: [
          'Üç CTE: satır düzeyi net tutar → aylık (COUNT DISTINCT ve SUM) → pencereler (LAG, SUM OVER PARTITION BY yıl).',
          'YTD için <code>SUM(ciro) OVER (PARTITION BY substr(ay, 1, 4) ORDER BY ay)</code>.',
          'Yıl filtresini en dıştaki SELECT\'e koy; <code>pd.read_sql(..., params=(str(yil),)).set_index("ay")</code>.'
        ],
        why: 'Bu sorgu dersin tüm parçalarını birleştirir: tanım CTE\'si, fan-out\'a karşı COUNT(DISTINCT), LAG ile MoM, PARTITION BY ile yıl içinde sıfırlanan YTD ve filtrenin pencereden sonra uygulanması. Aynı rapor Power BI\'da DAX ile de kurulabilir; SQL sürümü ise her araçtan çağrılabilen tek doğruluk kaynağı (single source of truth) olur.'
      }
    ],
    faq: [
      {
        q: 'SQLite öğrenmek gerçek işte (PostgreSQL, BigQuery) işe yarar mı?',
        a: 'Evet. CTE, JOIN, GROUP BY ve pencere fonksiyonlarının sözdizimi ANSI SQL\'dir ve hepsinde aynıdır. Farklar çoğunlukla tarih fonksiyonlarında (strftime yerine date_trunc/EXTRACT) ve QUALIFY gibi eklerdedir. Kalıbı öğrenmek, lehçeyi değiştirmekten çok daha zordur.'
      },
      {
        q: 'CTE mi, geçici tablo mu, görünüm (view) mü?',
        a: 'CTE tek sorgu içinde yaşar; okunurluk için idealdir. Aynı ara sonuç birçok sorguda tekrar kullanılacaksa geçici tablo (TEMP TABLE) ya da kalıcı görünüm (VIEW) tanımla. Ekipte ortak metrik tanımları (ör. net ciro) görünüm ya da dbt modeli olarak yaşar.'
      },
      {
        q: 'Pencere fonksiyonu ile GROUP BY\'ı aynı sorguda kullanabilir miyim?',
        a: 'Evet. Pencere fonksiyonları GROUP BY\'dan sonra çalışır, yani gruplanmış sonuç üzerinde hesaplanır: <code>SELECT ay, SUM(x), SUM(SUM(x)) OVER (ORDER BY ay) FROM t GROUP BY ay</code> geçerlidir. Okunurluk için çoğu zaman önce GROUP BY\'ı bir CTE\'ye almak daha anlaşılırdır.'
      },
      {
        q: 'pd.read_sql uyarı veriyor: "only supports SQLAlchemy connectable". Ne yapmalıyım?',
        a: 'sqlite3 bağlantısı pandas tarafından doğrudan desteklenir. PostgreSQL ya da MySQL gibi diğer veritabanlarında psycopg/pymysql bağlantısını doğrudan vermek yerine SQLAlchemy engine kullan: <code>pd.read_sql(text(sql), engine, params={...})</code>.'
      },
      {
        q: 'Büyük tabloda pencere fonksiyonu yavaş. Ne yapabilirim?',
        a: 'Önce filtrele (CTE içinde WHERE ile satırı azalt), PARTITION BY ve ORDER BY sütunlarına uygun indeks ekle, gereksiz sütunları seçme. Analitik iş yüklerinde DuckDB gibi sütun tabanlı motorlar SQLite\'tan çok daha hızlıdır.'
      }
    ],
    mistakes: [
      {
        why: 'WHERE pencereden önce çalışır; filtre dışında kalan önceki ay LAG\'a görünmez ve ilk satır NULL olur.',
        bad: 'sql = """\nSELECT ay, LAG(ciro) OVER (ORDER BY ay)\nFROM aylik\nWHERE ay >= \'2024-01\'\n"""',
        good: 'sql = """\nWITH h AS (SELECT ay, LAG(ciro) OVER (ORDER BY ay) AS onceki FROM aylik)\nSELECT * FROM h WHERE ay >= \'2024-01\'\n"""'
      },
      {
        why: 'JOIN sonrası satır sayısı sipariş sayısı değildir (fan-out); payda yanlış olur.',
        bad: 'sql = """\nSELECT channel, SUM(net) / COUNT(*) AS aov\nFROM orders JOIN order_items USING (order_id)\nGROUP BY channel\n"""',
        good: 'sql = """\nSELECT channel, SUM(net) / COUNT(DISTINCT order_id) AS aov\nFROM orders JOIN order_items USING (order_id)\nGROUP BY channel\n"""'
      },
      {
        why: 'Sağ tablo koşulu WHERE\'de olursa eşleşmeyen satırlar elenir ve LEFT JOIN INNER JOIN\'e döner.',
        bad: 'sql = """\nFROM customers c LEFT JOIN orders o ON o.customer_id = c.customer_id\nWHERE o.status = \'delivered\'\n"""',
        good: 'sql = """\nFROM customers c LEFT JOIN orders o\n  ON o.customer_id = c.customer_id AND o.status = \'delivered\'\n"""'
      },
      {
        why: 'f-string ile değer gömmek SQL enjeksiyonuna açıktır ve tırnaklı değerlerde sorguyu bozar.',
        bad: 'sql = f"SELECT * FROM orders WHERE channel = \'{kanal}\'"\ncon.execute(sql)',
        good: 'sql = "SELECT * FROM orders WHERE channel = ?"\ncon.execute(sql, (kanal,))'
      },
      {
        why: 'Aynı tarihte iki satır varsa hangisinin 1 olacağı belirsizdir; ikinci anahtar sonucu deterministik yapar.',
        bad: 'sql = """\nROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC)\n"""',
        good: 'sql = """\nROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC, order_id DESC)\n"""'
      }
    ]
  }
);
})(window);
