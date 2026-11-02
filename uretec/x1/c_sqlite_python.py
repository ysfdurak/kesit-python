import sys; sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/x1')
from lib import *

SIP = '''WITH sip AS (
    SELECT o.order_id, o.customer_id, o.order_date, o.channel,
           SUM(oi.quantity * oi.unit_price * (1 - oi.discount)) AS tutar
    FROM orders o JOIN order_items oi ON oi.order_id = o.order_id
    WHERE o.status = 'delivered'
    GROUP BY o.order_id
)'''
BAG = 'import veri\n\ncon = veri.baglan("anadolu_market", tablolar=["orders", "order_items", "customers", "products"])\n'

html = '<h2>Derinleş: pencere fonksiyonları ve CTE ile analitik SQL</h2>' \
'<p>Derste <code>GROUP BY</code> ile özet çıkarmayı gördün. GROUP BY satırları <b>daraltır</b>: 910 sipariş, kanal başına 3 satıra iner. Analist sorularının çoğu ise satırları koruyup yanına bir özet eklemeyi ister: "her siparişin, müşterinin kaçıncı siparişi olduğu", "her ayın bir önceki aya göre değişimi", "her şehirde en çok harcayan müşteri". Bunun aracı <b>pencere fonksiyonlarıdır</b> (window functions). Uzun sorguları okunur adımlara bölmek için de <b>CTE</b> (common table expression, <code>WITH ... AS</code>) kullanılır. SQLite 3.25\'ten beri ikisini de destekler; tarayıcıdaki ve Python\'la gelen sqlite3 bu sürümlerin çok üstündedir. Bu bölümde gerçek Anadolu Market verisini <code>veri.baglan</code> ile yükleyeceğiz. Konunun tam hâli Kesit SQL\'nın analitik SQL derslerindedir; burada Python tarafından nasıl kullanılacağına odaklanıyoruz.</p>' \
'<h3>CTE: sorguyu adımlara bölmek</h3><p>Sipariş tutarı kalemlerden hesaplanır. Bunu her sorguda alt sorgu olarak tekrar yazmak yerine bir kez <code>sip</code> adlı CTE olarak tanımlarız; sonraki adımlar onu tablo gibi kullanır. Birden çok CTE virgülle zincirlenir ve her biri öncekileri görebilir.</p>' + py(BAG + 'SQL = """\n' + SIP + ''',
aylik AS (
    SELECT substr(order_date, 1, 7) AS ay, ROUND(SUM(tutar), 2) AS ciro
    FROM sip WHERE order_date >= '2024-01-01'
    GROUP BY ay
)
SELECT ay, ciro FROM aylik ORDER BY ciro DESC LIMIT 3
"""
for satir in con.execute(SQL):
    print(satir)
''') + \
'<h3>Pencere fonksiyonunun anatomisi</h3><p><code>fonksiyon() OVER (PARTITION BY ... ORDER BY ... çerçeve)</code>. <code>PARTITION BY</code> pencereyi gruplara böler (GROUP BY gibi ama satırları daraltmadan), <code>ORDER BY</code> pencere içindeki sırayı, çerçeve (<code>ROWS BETWEEN 2 PRECEDING AND CURRENT ROW</code>) ise hesaba hangi satırların gireceğini belirler.</p>' \
'<div class="tbl-wrap"><table><tr><th>Fonksiyon</th><th>Ne verir</th><th>Tipik soru</th></tr>' \
'<tr><td><code>ROW_NUMBER()</code></td><td>1, 2, 3... (eşitlikte de farklı)</td><td>Müşterinin ilk siparişi, her gruptan tek satır</td></tr>' \
'<tr><td><code>RANK()</code> / <code>DENSE_RANK()</code></td><td>Eşitlere aynı sıra; RANK sonra boşluk bırakır (5, 5, 7), DENSE_RANK bırakmaz (5, 5, 6)</td><td>Satış liderleri tablosu</td></tr>' \
'<tr><td><code>LAG(x)</code> / <code>LEAD(x)</code></td><td>Önceki / sonraki satırın değeri</td><td>Aydan aya değişim, siparişler arası gün</td></tr>' \
'<tr><td><code>SUM(x) OVER (ORDER BY ...)</code></td><td>Kümülatif toplam</td><td>Yıl başından bugüne ciro, Pareto</td></tr>' \
'<tr><td><code>AVG(x) OVER (... ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)</code></td><td>Hareketli ortalama</td><td>3 aylık trend</td></tr>' \
'<tr><td><code>SUM(x) OVER ()</code></td><td>Tüm tablonun toplamı her satırda</td><td>Pay (yüzde) hesabı</td></tr>' \
'</table></div>' + py(BAG + 'SQL = """\n' + SIP + ''',
aylik AS (
    SELECT substr(order_date, 1, 7) AS ay, SUM(tutar) AS ciro
    FROM sip WHERE order_date >= '2024-01-01' GROUP BY ay
)
SELECT ay, ROUND(ciro, 0) AS ciro,
       ROUND(100.0 * (ciro - LAG(ciro) OVER (ORDER BY ay)) / LAG(ciro) OVER (ORDER BY ay), 1) AS degisim,
       ROUND(AVG(ciro) OVER (ORDER BY ay ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 0) AS ort3
FROM aylik ORDER BY ay
"""
for satir in con.execute(SQL).fetchall()[-4:]:
    print(satir)
''') + \
'<h3>Grup içinde ilk N: CTE + ROW_NUMBER</h3><p>Pencere fonksiyonları <code>WHERE</code>\'den <b>sonra</b> hesaplanır; bu yüzden <code>WHERE sira &lt;= 3</code> aynı SELECT içinde yazılamaz. Kalıp her zaman aynıdır: sırayı bir CTE\'de hesapla, dış sorguda filtrele.</p>' + py(BAG + 'SQL = """\n' + SIP + ''',
siralama AS (
    SELECT c.city, c.customer_id, ROUND(SUM(s.tutar), 2) AS harcama,
           ROW_NUMBER() OVER (PARTITION BY c.city ORDER BY SUM(s.tutar) DESC) AS sira
    FROM sip s JOIN customers c ON c.customer_id = s.customer_id
    WHERE c.city IS NOT NULL
    GROUP BY c.city, c.customer_id
)
SELECT city, customer_id, harcama FROM siralama WHERE sira = 1
ORDER BY harcama DESC LIMIT 4
"""
print(con.execute(SQL).fetchall())
''') + \
'<div class="tip"><b>SQL mi pandas mı?</b>Aynı hesapları pandas\'ta <code>groupby().cumcount()</code>, <code>shift()</code>, <code>rolling()</code> ve <code>rank()</code> ile yaparsın. Veri bir veritabanında duruyorsa hesabı SQL\'de yapıp yalnızca sonucu Python\'a çekmek, milyonlarca satırı ağdan taşımaktan çok daha hızlıdır. Python\'un işi burada sorguyu parametreyle çalıştırmak, sonucu test etmek ve raporlamaktır.</div>' \
'<div class="note"><b>Gerçek işte</b>Analist mülakatlarının SQL bölümü büyük ölçüde bu kalıplardan oluşur: "her departmanda en yüksek maaşlı 3 kişi", "aydan aya büyüme", "ardışık günler", "kümülatif pay". Üretimde ise bu sorgular bir <code>.sql</code> dosyasında durur; Python betiği dosyayı okuyup <code>con.execute(sql, parametreler)</code> ile çalıştırır ve sonucu testle doğrular.</div>'

Q = 'import veri\n\n'

ex = [
 dict(t='predict', stage='Kodu oku', q='Müşterilerin toplam aldığı ürün adedine göre sıralama yapılıyor. 145 numaralı müşteri (54 adet) önünde 66, 62, 59, 58, 55, 55 adetli altı müşteri var. Bu kod ne yazdırır?', needs=['sqlite3'],
      code='import veri\ncon = veri.baglan("anadolu_market", tablolar=["orders", "order_items"])\nsql = """\nWITH t AS (\n    SELECT o.customer_id, SUM(oi.quantity) AS adet\n    FROM orders o JOIN order_items oi ON oi.order_id = o.order_id\n    GROUP BY o.customer_id\n)\nSELECT customer_id, RANK() OVER (ORDER BY adet DESC), DENSE_RANK() OVER (ORDER BY adet DESC)\nFROM t\n"""\nprint([r for r in con.execute(sql) if r[0] == 145])\n',
      o=['[(145, 7, 6)]', '[(145, 6, 6)]', '[(145, 7, 7)]', '[(145, 6, 7)]'], a=0,
      why='İki müşteri 55 adetle 5. sırayı paylaşır. RANK bir sonraki sırayı atlar (7), DENSE_RANK atlamaz (6).'),
 dict(t='predict', stage='Kodu oku', q='Bir müşterinin ilk dört siparişinde kümülatif sayım yapılıyor. Bu kod ne yazdırır?', needs=['sqlite3'],
      code='import veri\ncon = veri.baglan("anadolu_market", tablolar=["orders"])\nsql = """\nWITH s AS (SELECT order_id, order_date FROM orders WHERE customer_id = 4 ORDER BY order_date LIMIT 4)\nSELECT order_id, COUNT(*) OVER (ORDER BY order_date), COUNT(*) OVER () FROM s\n"""\nprint(con.execute(sql).fetchall())\n',
      o=['[(25, 1, 4), (26, 2, 4), (27, 3, 4), (28, 4, 4)]', '[(25, 4, 4), (26, 4, 4), (27, 4, 4), (28, 4, 4)]', '[(25, 1, 1), (26, 2, 2), (27, 3, 3), (28, 4, 4)]', '[(25, 1, 4)]'], a=0,
      why='ORDER BY içeren pencere varsayılan olarak "baştan bu satıra kadar" çerçevesini kullanır: kümülatif sayım. Boş OVER () tüm pencereyi görür: her satırda 4. GROUP BY olmadığı için satırlar daralmaz.'),
 dict(t='order', stage='Kodu oku', q='<p>CTE ile müşterilerin ilk siparişini bulup ilk siparişin kanalına göre müşteri sayısını yazdıran programın satırlarını sırala.</p>', needs=['sqlite3'],
      lines=['import veri', 'con = veri.baglan("anadolu_market", tablolar=["orders"])',
             'sql = "WITH f AS (SELECT customer_id, channel, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date, order_id) AS rn FROM orders) "',
             'sql += "SELECT channel, COUNT(*) FROM f WHERE rn = 1 GROUP BY channel ORDER BY 2 DESC, channel"', 'print(con.execute(sql).fetchall())'],
      expect="[('mobile', 56), ('web', 56), ('store', 24)]\n", hint='Önce CTE metni, sonra ona eklenen dış sorgu.',
      why='ROW_NUMBER her müşterinin siparişlerini tarihe göre numaralar; rn = 1 ilk siparişi seçer. Eşitlikte kanal adına göre sıralamak sonucu deterministik yapar.'),
 dict(t='code', id='sqlite-python-v1', stage='Rehberli', diff=2, needs=['sqlite3'],
      q='<p><code>aylik_buyume(con, yil)</code>: teslim edilmiş siparişlerden (<code>sip</code> CTE\'si verildi) verilen yılın aylık cirosunu (2 basamak) ve bir önceki aya göre yüzde değişimini (1 basamak; ilk ayda <code>None</code>) <code>LAG</code> ile hesapla. <code>[(ay, ciro, degisim), ...]</code> listesini aya göre sıralı döndür. Yıl parametreyle (<code>?</code>) verilsin.</p>',
      guide=['sip CTE\'sinden sonra virgülle ikinci bir CTE (aylik) yaz: substr(order_date, 1, 7) ile ay.', 'Yıl filtresi: substr(order_date, 1, 4) = ?', 'Dış sorguda LAG(ciro) OVER (ORDER BY ay) ile önceki ay.', 'ROUND(100.0 * (ciro - önceki) / önceki, 1)'],
      example='import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE t (ay TEXT, v REAL)")\ncon.executemany("INSERT INTO t VALUES (?, ?)", [("01", 10), ("02", 15), ("03", 12)])\nprint(con.execute("SELECT ay, v, LAG(v) OVER (ORDER BY ay) FROM t").fetchall())\n',
      start='import veri\n\nSIP = """' + SIP + '"""\n\ndef aylik_buyume(con, yil):\n    sql = SIP + """\n    SELECT 1\n    """  # TODO: aylik CTE ve LAG\n    return con.execute(sql).fetchall()\n',
      sol='import veri\n\nSIP = """' + SIP + '"""\n\ndef aylik_buyume(con, yil):\n    sql = SIP + """,\n    aylik AS (\n        SELECT substr(order_date, 1, 7) AS ay, ROUND(SUM(tutar), 2) AS ciro\n        FROM sip WHERE substr(order_date, 1, 4) = ?\n        GROUP BY ay\n    )\n    SELECT ay, ciro,\n           ROUND(100.0 * (ciro - LAG(ciro) OVER (ORDER BY ay)) / LAG(ciro) OVER (ORDER BY ay), 1)\n    FROM aylik ORDER BY ay\n    """\n    return con.execute(sql, (str(yil),)).fetchall()\n',
      tests='con = veri.baglan("anadolu_market", tablolar=["orders", "order_items"])\nr = aylik_buyume(con, 2024)\nassert len(r) == 12, f"12 ay olmalı, {len(r)} geldi"\nassert r[0] == ("2024-01", 43298.5, None), f"Ocak: {r[0]}"\nassert r[3] == ("2024-04", 26728.15, -47.0), f"Nisan: {r[3]}"\nassert r[10] == ("2024-11", 82739.55, 31.4), f"Kasım: {r[10]}"\nassert aylik_buyume(con, 2023)[0][0] == "2023-01", "Yıl parametresi çalışmalı"\n',
      hints=['İkinci CTE\'den önce virgül gerekir: WITH a AS (...), b AS (...).', 'LAG ilk satırda NULL döndürür; Python\'da None olur.'],
      why='Nisan 2024\'te ciro %47 düşüyor, Kasım\'da %31 artıyor. LAG sayesinde ay ayın yanına önceki ay gelir; Python\'da döngü yazmaya gerek kalmaz.'),
 dict(t='code', id='sqlite-python-v2', stage='Rehberli', diff=2, needs=['sqlite3'],
      q='<p><code>sehir_liderleri(con, n=1)</code>: teslim edilmiş siparişlerde her şehirde (şehri boş olmayan müşteriler) en çok harcayan <code>n</code> müşteriyi <code>ROW_NUMBER() OVER (PARTITION BY city ...)</code> ile bul. <code>[(şehir, customer_id, harcama), ...]</code> döndür: harcamaya göre azalan, harcama 2 basamak. <code>sip</code> CTE\'si verildi.</p>',
      guide=['sip\'ten sonra siralama adlı ikinci CTE: customers ile birleştir, city ve customer_id\'ye göre grupla.', 'Aynı SELECT\'te ROW_NUMBER() OVER (PARTITION BY c.city ORDER BY SUM(s.tutar) DESC) AS sira.', 'Dış sorguda WHERE sira <= ? ve ORDER BY harcama DESC.'],
      example='import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE s (sehir TEXT, ad TEXT, t REAL)")\ncon.executemany("INSERT INTO s VALUES (?, ?, ?)", [("A", "x", 5), ("A", "y", 9), ("B", "z", 3)])\nsql = "WITH r AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY sehir ORDER BY t DESC) AS n FROM s) SELECT sehir, ad FROM r WHERE n = 1"\nprint(con.execute(sql).fetchall())\n',
      start='import veri\n\nSIP = """' + SIP + '"""\n\ndef sehir_liderleri(con, n=1):\n    # TODO: siralama CTE\'si ve dış filtre\n    return []\n',
      sol='import veri\n\nSIP = """' + SIP + '"""\n\ndef sehir_liderleri(con, n=1):\n    sql = SIP + """,\n    siralama AS (\n        SELECT c.city, c.customer_id, ROUND(SUM(s.tutar), 2) AS harcama,\n               ROW_NUMBER() OVER (PARTITION BY c.city ORDER BY SUM(s.tutar) DESC) AS sira\n        FROM sip s JOIN customers c ON c.customer_id = s.customer_id\n        WHERE c.city IS NOT NULL\n        GROUP BY c.city, c.customer_id\n    )\n    SELECT city, customer_id, harcama FROM siralama WHERE sira <= ?\n    ORDER BY harcama DESC\n    """\n    return con.execute(sql, (n,)).fetchall()\n',
      tests='con = veri.baglan("anadolu_market", tablolar=["orders", "order_items", "customers"])\nr = sehir_liderleri(con)\nassert r[:3] == [("Antalya", 49, 33235.0), ("İstanbul", 107, 32735.55), ("İzmir", 39, 31560.2)], f"İlk üç: {r[:3]}"\nassert len(r) == 12, f"Şehri bilinen 12 şehir olmalı, {len(r)} geldi"\nassert len(set(s for s, _, _ in r)) == len(r), "n=1 iken her şehirden tek müşteri"\nr2 = sehir_liderleri(con, 2)\nassert len(r2) == 24, "n=2 iken her şehirden iki müşteri"\n',
      hints=['Pencere fonksiyonunda toplam fonksiyonu kullanabilirsin: ORDER BY SUM(s.tutar) DESC.', 'sira filtresi mutlaka dış sorguda olmalı.'],
      why='Grup içinde ilk N, analitik SQL\'in en sık kalıbıdır: sırayı CTE\'de hesapla, dışarıda filtrele.'),
 dict(t='code', id='sqlite-python-v3', stage='Kendin yaz', diff=2, needs=['sqlite3'],
      q='<p><code>siparis_araligi(con)</code>: teslim edilmiş siparişlerde her müşterinin ardışık iki siparişi arasındaki gün farkını <code>LAG</code> ve <code>julianday</code> ile hesapla (eşit tarihlerde <code>order_id</code> ile sırala). <code>(ortalama_gün (1 basamak), fark_sayısı, en_uzun_ara)</code> demetini döndür; en uzun ara <code>int</code>.</p>',
      start=Q + 'def siparis_araligi(con):\n    pass\n',
      sol=Q + 'def siparis_araligi(con):\n    sql = """\n    WITH g AS (\n        SELECT julianday(order_date) - julianday(LAG(order_date) OVER (\n                   PARTITION BY customer_id ORDER BY order_date, order_id)) AS fark\n        FROM orders WHERE status = \'delivered\'\n    )\n    SELECT ROUND(AVG(fark), 1), COUNT(fark), MAX(fark) FROM g\n    """\n    ort, adet, en_uzun = con.execute(sql).fetchone()\n    return ort, adet, int(en_uzun)\n',
      tests='con = veri.baglan("anadolu_market", tablolar=["orders"])\nassert siparis_araligi(con) == (75.5, 577, 398), f"Sonuç: {siparis_araligi(con)}"\n',
      hints=['Her müşterinin ilk siparişinde LAG NULL verir; AVG ve COUNT NULL\'ları atlar.', 'julianday(a) - julianday(b) iki tarih arasındaki gün sayısıdır.'],
      why='712 teslim edilmiş siparişten 135 müşterinin ilk siparişi çıkınca 577 aralık kalır. Ortalama 75 gün: churn tanımında "90 gün sipariş yok" eşiği bu dağılıma bakılarak seçilir.'),
 dict(t='code', id='sqlite-python-v4', stage='Hata avı', kind='bug', diff=2, needs=['sqlite3'],
      q='<p>Hatayı bul ve düzelt. <code>ilk_siparis_kanali(con)</code> her müşterinin ilk siparişinin kanalını sayıp <code>{kanal: müşteri_sayısı}</code> döndürmeli. Ama <code>sqlite3.OperationalError</code> veriyor.</p>',
      start=Q + 'def ilk_siparis_kanali(con):\n    sql = """\n    SELECT channel, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date, order_id) AS rn\n    FROM orders\n    WHERE rn = 1\n    """\n    sayim = {}\n    for kanal, _ in con.execute(sql):\n        sayim[kanal] = sayim.get(kanal, 0) + 1\n    return sayim\n',
      sol=Q + 'def ilk_siparis_kanali(con):\n    sql = """\n    WITH f AS (\n        SELECT channel, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date, order_id) AS rn\n        FROM orders\n    )\n    SELECT channel, rn FROM f WHERE rn = 1\n    """\n    sayim = {}\n    for kanal, _ in con.execute(sql):\n        sayim[kanal] = sayim.get(kanal, 0) + 1\n    return sayim\n',
      tests='con = veri.baglan("anadolu_market", tablolar=["orders"])\nassert ilk_siparis_kanali(con) == {"mobile": 56, "web": 56, "store": 24}, f"Sonuç: {ilk_siparis_kanali(con)}"\n',
      hints=['SQL\'de WHERE, SELECT\'teki pencere fonksiyonundan önce çalışır.', 'Pencere sonucunu bir CTE\'ye al, filtreyi dışarıda yap.'],
      why='Mantıksal sıra FROM → WHERE → GROUP BY → HAVING → pencere → SELECT → ORDER BY\'dır. WHERE çalışırken rn henüz yoktur.'),
 dict(t='code', id='sqlite-python-v5', stage='Meydan okuma', diff=3, needs=['sqlite3'],
      q='<p><code>pareto(con, esik=0.5)</code>: teslim edilmiş siparişlerde ürün adına göre ciroyu topla; ürünleri ciroya göre azalan sıralayıp kümülatif payı <code>SUM(...) OVER (ORDER BY ... ROWS UNBOUNDED PRECEDING) / SUM(...) OVER ()</code> ile hesapla. Kümülatif payı <code>esik</code>\'e ulaşana kadar (ulaştığı ürün dahil) kaç ürün gerektiğini ve bunun satılan ürün sayısına oranını (yüzde, 1 basamak) <code>(adet, yuzde)</code> olarak döndür. Hepsi tek SQL sorgusunda olsun.</p>',
      start=Q + 'def pareto(con, esik=0.5):\n    pass\n',
      sol=Q + 'def pareto(con, esik=0.5):\n    sql = """\n    WITH u AS (\n        SELECT p.name, SUM(oi.quantity * oi.unit_price * (1 - oi.discount)) AS c\n        FROM order_items oi\n        JOIN orders o ON o.order_id = oi.order_id\n        JOIN products p ON p.product_id = oi.product_id\n        WHERE o.status = \'delivered\'\n        GROUP BY p.name\n    ),\n    k AS (\n        SELECT name, SUM(c) OVER (ORDER BY c DESC ROWS UNBOUNDED PRECEDING) / SUM(c) OVER () AS pay,\n               COUNT(*) OVER () AS toplam\n        FROM u\n    )\n    SELECT COUNT(*) + 1, MAX(toplam) FROM k WHERE pay < ?\n    """\n    adet, toplam = con.execute(sql, (esik,)).fetchone()\n    return adet, round(100.0 * adet / toplam, 1)\n',
      tests='con = veri.baglan("anadolu_market", tablolar=["orders", "order_items", "products"])\nassert pareto(con) == (13, 34.2), f"%50 için: {pareto(con)}"\nassert pareto(con, 0.8)[0] > 13, "%80 için daha çok ürün gerekir"\n',
      hints=['ROWS UNBOUNDED PRECEDING eşit cirolu ürünlerde kümülatifin sıçramasını önler.', 'Payı eşiğin altında kalanları say, eşiği aşan ilk ürün için 1 ekle.', 'Toplam ürün sayısını COUNT(*) OVER () ile aynı sorguda al.'],
      why='38 ürünün 13\'ü (yaklaşık üçte biri) teslim edilmiş cironun yarısını getiriyor. Pareto analizi stok ve kampanya önceliği için temel bir rapordur.'),
]

faq = [
 dict(q='ROWS ile RANGE çerçevesi arasındaki fark nedir?', a='<code>ROWS</code> fiziksel satır sayar; <code>RANGE</code> ise ORDER BY değeri eşit olan satırları birlikte ele alır. ORDER BY olan pencerede çerçeve vermezsen varsayılan <code>RANGE UNBOUNDED PRECEDING</code>\'dir: eşit değerli satırlar aynı kümülatif toplamı alır. Kümülatif toplamda sıçrama istemiyorsan <code>ROWS</code> yaz.'),
]

mistakes = [
 dict(bad='SELECT *, ROW_NUMBER() OVER (...) AS rn FROM t WHERE rn = 1', good='WITH r AS (SELECT *, ROW_NUMBER() OVER (...) AS rn FROM t)\nSELECT * FROM r WHERE rn = 1', why='Pencere fonksiyonları WHERE\'den sonra hesaplanır; filtre CTE\'nin dışında yapılmalıdır.'),
]

emit('sqlite-python', dict(id='sqlite-python', min=25, needs=['sqlite3'], html=html, ex=ex, faq=faq, mistakes=mistakes), 'Pencere fonksiyonları ve CTE')
