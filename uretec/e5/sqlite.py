import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from h import py, pc, d

html = (
'<h2>Derinleş: sqlite3 ile gerçek uygulama kalıpları</h2>\n'
'<p>Tablo kurmayı, parametreli sorguyu ve transaction\'ı öğrendin. Gerçek bir stok ya da müşteri uygulamasında ise şu sorular gelir: "Eklediğim satırın id\'si ne?", "Ürün varsa stoğu artır, yoksa ekle", "Kaç satır güncellendi?", "Sipariş silinmiş müşteriye bağlı kalmasın", "Liste uzunluğu belli olmayan IN sorgusu nasıl yazılır?", "Sorgu neden yavaş?". Bu bölüm bunları yanıtlar. SQL dilinin kendisi (JOIN, GROUP BY, pencere fonksiyonları) için SQLPatika\'ya; ORM için <i>sqlalchemy-orm</i>, DataFrame\'e okumak için <i>pandas-giris</i> dersine bakabilirsin.</p>\n'

'<h3>İmlecin verdiği bilgiler: lastrowid, rowcount, fetchmany</h3>\n'
+ py('''
    import sqlite3

    con = sqlite3.connect(":memory:")
    con.execute("CREATE TABLE musteri (id INTEGER PRIMARY KEY, ad TEXT, sehir TEXT)")
    cur = con.execute("INSERT INTO musteri (ad, sehir) VALUES (?, ?)", ("Ayşe", "İzmir"))
    print("yeni id:", cur.lastrowid)
    con.executemany("INSERT INTO musteri (ad, sehir) VALUES (?, ?)", [("Can", "Van"), ("Ece", "Van"), ("Ali", "Bursa")])

    cur = con.execute("UPDATE musteri SET sehir = ? WHERE sehir = ?", ("Van Merkez", "Van"))
    print("güncellenen satır:", cur.rowcount)

    cur = con.execute("SELECT id, ad FROM musteri ORDER BY id")
    while parca := cur.fetchmany(2):      # büyük sonuçları parça parça çek
        print("parça:", parca)
    print("sütunlar:", [k[0] for k in con.execute("SELECT * FROM musteri").description])
''') +

'<h3>UPSERT: varsa güncelle, yoksa ekle</h3>\n'
'<p>Depodan gelen stok dosyasında bazı ürünler yeni, bazıları mevcut. Önce SELECT ile bakıp sonra INSERT ya da UPDATE yazmak hem yavaş hem de iki işlem arasında yarış durumuna (race condition) açıktır. SQLite 3.24+ <code>INSERT ... ON CONFLICT ... DO UPDATE</code> sözdizimini destekler; <code>excluded</code> eklenmeye çalışılan satırı temsil eder.</p>\n'
+ py('''
    import sqlite3

    con = sqlite3.connect(":memory:")
    con.execute("CREATE TABLE stok (sku TEXT PRIMARY KEY, ad TEXT, adet INTEGER NOT NULL)")
    con.execute("INSERT INTO stok VALUES ('LP-1', 'Laptop', 5)")

    gelen = [("LP-1", "Laptop", 3), ("MS-7", "Mouse", 40)]
    with con:
        con.executemany("""
            INSERT INTO stok (sku, ad, adet) VALUES (?, ?, ?)
            ON CONFLICT(sku) DO UPDATE SET adet = adet + excluded.adet
        """, gelen)
    print(con.execute("SELECT * FROM stok ORDER BY sku").fetchall())

    # Yalnızca yoksa ekle, varsa dokunma:
    con.execute("INSERT OR IGNORE INTO stok VALUES ('MS-7', 'Mouse', 999)")
    print(con.execute("SELECT adet FROM stok WHERE sku = 'MS-7'").fetchone()[0])
''') +
'<div class="warn"><b>INSERT OR REPLACE tuzağı</b><code>OR REPLACE</code> çakışan satırı <b>silip</b> yeniden ekler: belirtmediğin sütunlar varsayılana döner ve yabancı anahtarla bağlı satırlar etkilenebilir. Güncelleme niyetin varsa <code>ON CONFLICT DO UPDATE</code> kullan.</div>\n'

'<h3>Yabancı anahtar, kısıt ve IntegrityError</h3>\n'
'<p>SQLite geriye uyumluluk için yabancı anahtar (foreign key) denetimini <b>varsayılan olarak kapalı</b> tutar. Her bağlantıda <code>PRAGMA foreign_keys = ON</code> çalıştırmazsan var olmayan müşteriye sipariş yazabilirsin. Kısıt ihlallerinin hepsi <code>sqlite3.IntegrityError</code> olarak gelir; yakalayıp anlamlı mesaja çevir.</p>\n'
+ py('''
    import sqlite3

    con = sqlite3.connect(":memory:")
    con.execute("PRAGMA foreign_keys = ON")
    con.executescript("""
        CREATE TABLE musteri (id INTEGER PRIMARY KEY, eposta TEXT UNIQUE NOT NULL);
        CREATE TABLE siparis (
            id INTEGER PRIMARY KEY,
            musteri_id INTEGER NOT NULL REFERENCES musteri(id) ON DELETE CASCADE,
            tutar REAL CHECK (tutar > 0)
        );
        INSERT INTO musteri (eposta) VALUES ('ayse@ornek.com');
        INSERT INTO siparis (musteri_id, tutar) VALUES (1, 120);
    """)
    for sql, p in [("INSERT INTO musteri (eposta) VALUES (?)", ("ayse@ornek.com",)),
                   ("INSERT INTO siparis (musteri_id, tutar) VALUES (?, ?)", (99, 10)),
                   ("INSERT INTO siparis (musteri_id, tutar) VALUES (?, ?)", (1, -5))]:
        try:
            con.execute(sql, p)
        except sqlite3.IntegrityError as e:
            print("Reddedildi:", e)
    con.execute("DELETE FROM musteri WHERE id = 1")
    print("kalan sipariş:", con.execute("SELECT COUNT(*) FROM siparis").fetchone()[0])
''') +

'<h3>Dinamik IN listesi, indeks ve sorgu planı</h3>\n'
'<p>Kullanıcı birden çok şehir seçtiğinde <code>IN (?, ?, ?)</code> yer tutucularını listenin uzunluğu kadar üretirsin; değerleri yine parametre olarak verirsin. Sık filtrelenen sütuna indeks eklemek sorguyu tam tablo taramasından (SCAN) indeks aramasına (SEARCH) çevirir; <code>EXPLAIN QUERY PLAN</code> bunu gösterir.</p>\n'
+ py('''
    import sqlite3

    con = sqlite3.connect(":memory:")
    con.execute("CREATE TABLE siparis (id INTEGER PRIMARY KEY, sehir TEXT, tutar REAL)")
    con.executemany("INSERT INTO siparis (sehir, tutar) VALUES (?, ?)",
                    [("Ankara", 10), ("Van", 20), ("İzmir", 30), ("Ankara", 5)])

    secilen = ["Ankara", "İzmir"]
    yer = ", ".join("?" * len(secilen))
    sql = f"SELECT sehir, SUM(tutar) FROM siparis WHERE sehir IN ({yer}) GROUP BY sehir ORDER BY sehir"
    print(sql)
    print(con.execute(sql, secilen).fetchall())

    plan = lambda: con.execute("EXPLAIN QUERY PLAN SELECT * FROM siparis WHERE sehir = ?", ("Van",)).fetchall()[0][-1]
    print("indeks yok:", plan())
    con.execute("CREATE INDEX ix_siparis_sehir ON siparis(sehir)")
    print("indeks var:", plan())

    # Python fonksiyonunu SQL içinde kullan
    con.create_function("kdvli", 1, lambda t: round(t * 1.2, 2), deterministic=True)
    print(con.execute("SELECT id, kdvli(tutar) FROM siparis ORDER BY id LIMIT 2").fetchall())
''') +
'<div class="tip"><b>f-string burada neden güvenli?</b>f-string yalnızca <code>?, ?</code> yer tutucularını üretir; kullanıcı değerleri hâlâ ayrı parametre listesindedir. Kural: SQL metnine yalnızca <b>senin kontrolündeki</b> parçalar (yer tutucu, beyaz listeden seçilmiş sütun adı) girer, kullanıcı verisi asla.</div>\n'

'<div class="tbl-wrap"><table>'
'<tr><th>Araç</th><th>Ne işe yarar</th><th>Not</th></tr>'
'<tr><td><code>cur.lastrowid</code></td><td>Son eklenen satırın id\'si</td><td>executemany sonrası güvenilmez</td></tr>'
'<tr><td><code>cur.rowcount</code></td><td>UPDATE/DELETE\'in etkilediği satır</td><td>SELECT\'te -1</td></tr>'
'<tr><td><code>fetchone / fetchmany / fetchall</code></td><td>Tek, parça, tümü</td><td>Büyük sonuçta fetchmany ya da imleçte döngü</td></tr>'
'<tr><td><code>executescript</code></td><td>Çok cümleli SQL (şema)</td><td>Parametre almaz, önce COMMIT yapar</td></tr>'
'<tr><td><code>ON CONFLICT DO UPDATE</code></td><td>UPSERT</td><td>Çakışma hedefi UNIQUE/PK olmalı</td></tr>'
'<tr><td><code>PRAGMA foreign_keys = ON</code></td><td>Yabancı anahtar denetimi</td><td>Her bağlantıda tekrar</td></tr>'
'<tr><td><code>PRAGMA journal_mode = WAL</code></td><td>Okuyucular yazarı beklemez</td><td>Dosya veritabanında</td></tr>'
'<tr><td><code>create_function</code></td><td>Python fonksiyonunu SQL\'de kullan</td><td>deterministic=True indekslenebilir</td></tr>'
'<tr><td><code>con.backup(hedef)</code></td><td>Canlı veritabanını kopyala</td><td>Dosyayı elle kopyalamaktan güvenli</td></tr>'
'</table></div>\n'

'<h3>Tarihleri saklamak ve dosya veritabanı</h3>\n'
'<p>SQLite\'ın ayrı bir tarih tipi yoktur. Tarihi <b>ISO 8601 metni</b> (<code>2026-03-15</code>, <code>2026-03-15T14:30:00</code>) olarak sakla: alfabetik sıralama kronolojik sıralamayla aynı olur ve <code>date()</code>, <code>strftime()</code> SQL fonksiyonları çalışır. Python 3.12\'de sqlite3\'ün varsayılan tarih dönüştürücüleri kullanımdan kaldırıldı (deprecated); dönüşümü kendin açıkça yap. Kendi bilgisayarında gerçek dosyayla çalışırken şu iskeleti kullan:</p>\n'
+ pc('''
    import sqlite3
    from contextlib import closing

    with closing(sqlite3.connect("anadolu.db", timeout=10)) as con:
        con.execute("PRAGMA foreign_keys = ON")
        con.execute("PRAGMA journal_mode = WAL")
        with con:                       # transaction: başarıda commit, hatada rollback
            con.execute("INSERT INTO log (zaman, mesaj) VALUES (?, ?)", ("2026-03-15T09:00:00", "başladı"))
        with closing(sqlite3.connect("yedek.db")) as hedef:
            con.backup(hedef)
''') +
'<p>Komut satırından incelemek için <code>sqlite3 anadolu.db</code> (Windows\'ta sqlite.org\'dan <code>sqlite-tools</code> indir), içinde <code>.tables</code>, <code>.schema siparis</code>, <code>.mode box</code> komutlarını kullan. Görsel araç istersen "DB Browser for SQLite" ücretsizdir. <code>database is locked</code> hatası alırsan başka bir program (ya da kapanmamış bir bağlantı) yazma kilidini tutuyordur: <code>timeout</code> ver, bağlantıları <code>closing</code> ile kapat, WAL modunu aç.</p>\n'
'<div class="note"><b>Gerçek işte</b>SQLite telefonlarda, tarayıcılarda, masaüstü uygulamalarında ve test ortamlarında her yerde. Anadolu Market\'in depo el terminalleri çevrimdışı çalışırken taramaları yerel SQLite\'a UPSERT ile yazar, bağlantı gelince merkeze aktarır. Ekipler ayrıca birim testlerde üretim PostgreSQL\'i yerine <code>:memory:</code> SQLite kullanır; ama dikkat: tip denetimi ve bazı SQL özellikleri farklıdır, kritik sorguları gerçek veritabanında da test et.</div>\n'
)

ex = [
  dict(t='mc', stage='Isınma', q='Şemada <code>REFERENCES musteri(id)</code> tanımlı olduğu hâlde var olmayan müşteri id\'siyle sipariş eklenebildi. En olası neden nedir?',
       o=['REFERENCES yalnızca INTEGER sütunlarda çalışır', 'Bağlantıda PRAGMA foreign_keys = ON çalıştırılmamış', 'commit() çağrılmadığı için kontrol yapılmadı', ':memory: veritabanı kısıt desteklemez'], a=1,
       why='SQLite yabancı anahtar denetimini geriye uyumluluk için varsayılan olarak kapalı tutar ve bu ayar bağlantıya özeldir. Her yeni bağlantıda PRAGMA foreign_keys = ON çalıştırılmalıdır.'),
  dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
       code=d('''
           import sqlite3
           con = sqlite3.connect(":memory:")
           con.execute("CREATE TABLE h (no TEXT, sube TEXT)")
           con.executemany("INSERT INTO h VALUES (?, ?)", [("1", "A"), ("2", "B"), ("3", "A")])
           cur = con.execute("UPDATE h SET sube = 'C' WHERE sube = 'A'")
           print(cur.rowcount, con.execute("SELECT COUNT(*) FROM h WHERE sube = 'C'").fetchone())
       '''),
       o=['2 2', '2 (2,)', '1 (2,)', '-1 (2,)'], a=1,
       why='rowcount UPDATE\'in etkilediği satır sayısıdır (2). fetchone ise her zaman bir demet döndürür; tek sütunlu sonuçta bile (2,) gelir, değeri almak için [0] gerekir.'),
  dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
       code=d('''
           import sqlite3
           con = sqlite3.connect(":memory:")
           con.execute("CREATE TABLE stok (sku TEXT PRIMARY KEY, adet INT)")
           con.execute("INSERT INTO stok VALUES ('A', 5)")
           sql = "INSERT INTO stok VALUES (?, ?) ON CONFLICT(sku) DO UPDATE SET adet = adet + excluded.adet"
           con.executemany(sql, [("A", 3), ("B", 2), ("A", 1)])
           print(con.execute("SELECT * FROM stok ORDER BY sku").fetchall())
       '''),
       o=["[('A', 9), ('B', 2)]", "[('A', 1), ('B', 2)]", "[('A', 5), ('B', 2)]", 'IntegrityError'], a=0,
       why='Her çakışmada mevcut adet ile eklenmek istenen (excluded.adet) toplanır: 5 + 3 + 1 = 9. B çakışmadığı için normal eklenir.'),
  dict(t='predict', stage='Kodu oku', q='Bu kod ne olur?',
       code=d('''
           import sqlite3
           con = sqlite3.connect(":memory:")
           con.execute("CREATE TABLE m (id INTEGER PRIMARY KEY, eposta TEXT UNIQUE)")
           con.execute("INSERT INTO m (eposta) VALUES ('a@x.com')")
           con.execute("INSERT INTO m (eposta) VALUES ('A@x.com')")
           con.execute("INSERT INTO m (eposta) VALUES ('a@x.com')")
           print("bitti")
       '''),
       o=['bitti yazdırır', 'Üçüncü INSERT\'te IntegrityError hatası verir', 'İkinci INSERT\'te IntegrityError hatası verir', 'OperationalError hatası verir'], a=1, raises=True,
       why='UNIQUE karşılaştırması varsayılan olarak büyük-küçük harf duyarlıdır; A@x.com farklı bir değerdir. Üçüncü satır birebir aynı olduğu için IntegrityError fırlatılır. E-postaları kaydetmeden önce lower() ile normalleştirmek iyi pratiktir.'),
  dict(t='order', stage='Kodu oku',
       q='<p>Ürün ekleyip yeni satırın id\'sini alan ve fiyatı güncelleyip etkilenen satır sayısını yazdıran kodun satırlarını sırala.</p>',
       lines=['import sqlite3', 'con = sqlite3.connect(":memory:")', 'con.execute("CREATE TABLE urun (id INTEGER PRIMARY KEY, ad TEXT, fiyat REAL)")', 'yeni_id = con.execute("INSERT INTO urun (ad, fiyat) VALUES (?, ?)", ("Kalem", 10)).lastrowid', 'cur = con.execute("UPDATE urun SET fiyat = fiyat * 1.1 WHERE id = ?", (yeni_id,))', 'print(yeni_id, cur.rowcount)'],
       expect='1 1\n',
       hint='Tablo olmadan ekleme, ekleme olmadan id, id olmadan güncelleme olmaz.',
       why='lastrowid INSERT\'in imlecinden okunur; sonraki UPDATE bu id\'yi parametre olarak kullanır ve rowcount 1 döner.'),
  dict(t='code', stage='Rehberli', id='sqlite-python-x1', diff=2,
       q='<p>Raporlama ekranında kullanıcı birden çok şehir seçebiliyor. <code>sehir_ciro(con, sehirler)</code> fonksiyonunu yaz: <code>siparis(sehir, tutar)</code> tablosundan yalnızca verilen şehirlerin toplam cirosunu <code>[(sehir, toplam), ...]</code> olarak, şehre göre sıralı döndürsün. Değerler <b>parametre</b> olarak geçmeli (f-string ile değer gömme). <code>sehirler</code> boşsa sorgu çalıştırmadan <code>[]</code> döndür.</p>',
       guide=['Liste boşsa hemen [] döndür (IN () geçersiz SQL\'dir).', 'Yer tutucu metnini üret: ", ".join("?" * len(sehirler)).', 'SQL\'i bu metinle kur: WHERE sehir IN (...) GROUP BY sehir ORDER BY sehir.', 'con.execute(sql, list(sehirler)).fetchall() döndür.'],
       example=d('''
           import sqlite3
           con = sqlite3.connect(":memory:")
           con.execute("CREATE TABLE u (id INT, ad TEXT)")
           con.executemany("INSERT INTO u VALUES (?, ?)", [(1, "a"), (2, "b"), (3, "c")])
           idler = [1, 3]
           yer = ",".join("?" for _ in idler)
           print(con.execute(f"SELECT ad FROM u WHERE id IN ({yer})", idler).fetchall())
       '''),
       start=d('''
           def sehir_ciro(con, sehirler):
               # TODO: boş liste kontrolü
               # TODO: yer tutucuları üret ve parametreli sorguyu çalıştır
               return con.execute("SELECT sehir, SUM(tutar) FROM siparis GROUP BY sehir ORDER BY sehir").fetchall()
       '''),
       sol=d('''
           def sehir_ciro(con, sehirler):
               if not sehirler:
                   return []
               yer = ", ".join("?" * len(sehirler))
               sql = f"SELECT sehir, SUM(tutar) FROM siparis WHERE sehir IN ({yer}) GROUP BY sehir ORDER BY sehir"
               return con.execute(sql, list(sehirler)).fetchall()
       '''),
       tests=d('''
           import sqlite3 as _s
           _c = _s.connect(":memory:")
           _c.execute("CREATE TABLE siparis (sehir TEXT, tutar REAL)")
           _c.executemany("INSERT INTO siparis VALUES (?, ?)", [("Ankara", 10), ("Van", 20), ("İzmir", 30), ("Ankara", 5)])
           assert sehir_ciro(_c, ["İzmir", "Ankara"]) == [("Ankara", 15.0), ("İzmir", 30.0)], f"yanlış: {sehir_ciro(_c, ['İzmir', 'Ankara'])}"
           assert sehir_ciro(_c, ("Van",)) == [("Van", 20.0)], "demet de kabul edilmeli"
           assert sehir_ciro(_c, []) == [], "boş seçim boş liste döndürmeli"
           assert sehir_ciro(_c, ["x' OR '1'='1"]) == [], "kötü niyetli metin veri olarak kalmalı"
       '''),
       hints=['IN listesinin uzunluğu kadar ? üretmen gerekiyor.', '"?" * 3 == "???"; ", ".join bunları virgülle ayırır.', 'return con.execute(sql, list(sehirler)).fetchall()'],
       why='Yer tutucuların sayısını program üretir, değerleri yine sürücü bağlar; böylece hem dinamik hem güvenli sorgu yazılır. Boş IN listesi SQL sözdizimi hatası verdiği için önceden ele alınır.'),
  dict(t='code', stage='Rehberli', id='sqlite-python-x2', diff=2,
       q='<p>Depodan gelen sayım listesini işleyen <code>stok_isle(con, kalemler)</code> fonksiyonunu yaz. <code>stok(sku TEXT PRIMARY KEY, adet INTEGER)</code> tablosu hazır. <code>kalemler</code> <code>(sku, adet)</code> demetlerinin listesidir. Ürün varsa adedi <b>artır</b>, yoksa ekle; hepsini tek transaction içinde <code>executemany</code> ile yap. Fonksiyon işlem sonunda tablodaki toplam ürün çeşidi sayısını döndürsün.</p>',
       guide=['UPSERT SQL\'ini yaz: INSERT ... VALUES (?, ?) ON CONFLICT(sku) DO UPDATE SET adet = adet + excluded.adet.', 'with con: bloğu aç (commit/rollback için).', 'Blok içinde con.executemany(sql, kalemler).', 'SELECT COUNT(*) ile çeşit sayısını al ve [0] ile döndür.'],
       example=d('''
           import sqlite3
           con = sqlite3.connect(":memory:")
           con.execute("CREATE TABLE sayac (ad TEXT PRIMARY KEY, n INT)")
           sql = "INSERT INTO sayac VALUES (?, 1) ON CONFLICT(ad) DO UPDATE SET n = n + 1"
           for ad in ["giris", "cikis", "giris"]:
               con.execute(sql, (ad,))
           print(con.execute("SELECT * FROM sayac ORDER BY ad").fetchall())
       '''),
       start=d('''
           def stok_isle(con, kalemler):
               sql = "INSERT INTO stok (sku, adet) VALUES (?, ?)"   # TODO: çakışmada adet artırılsın
               # TODO: with con: içinde executemany
               # TODO: çeşit sayısını döndür
               pass
       '''),
       sol=d('''
           def stok_isle(con, kalemler):
               sql = "INSERT INTO stok (sku, adet) VALUES (?, ?) ON CONFLICT(sku) DO UPDATE SET adet = adet + excluded.adet"
               with con:
                   con.executemany(sql, kalemler)
               return con.execute("SELECT COUNT(*) FROM stok").fetchone()[0]
       '''),
       tests=d('''
           import sqlite3 as _s
           _c = _s.connect(":memory:")
           _c.execute("CREATE TABLE stok (sku TEXT PRIMARY KEY, adet INTEGER)")
           _c.execute("INSERT INTO stok VALUES ('LP-1', 5)")
           _c.commit()
           assert stok_isle(_c, [("LP-1", 3), ("MS-7", 10), ("MS-7", 2)]) == 2, "iki çeşit ürün olmalı"
           assert dict(_c.execute("SELECT * FROM stok")) == {"LP-1": 8, "MS-7": 12}, f"adetler yanlış: {_c.execute('SELECT * FROM stok').fetchall()}"
           assert not _c.in_transaction, "işlem commit edilmiş olmalı (with con:)"
       '''),
       hints=['Çakışma hedefi PRIMARY KEY olan sku sütunudur.', 'excluded.adet eklenmeye çalışılan satırın adedidir.', 'with con: con.executemany(sql, kalemler)'],
       why='UPSERT tek cümlede "varsa güncelle yoksa ekle" yapar; executemany ile yüzlerce kalem tek transaction\'da işlenir. Bağlantının with bloğu başarıda commit, hatada rollback yapar.'),
  dict(t='code', stage='Rehberli', id='sqlite-python-x3', diff=2,
       q='<p>Anadolu Market müşteri-sipariş şemasını kuran <code>veritabani()</code> fonksiyonunu yaz: <code>:memory:</code> bağlantısı aç, <b>yabancı anahtarları aç</b>, şu tabloları oluştur ve bağlantıyı döndür: <code>musteri(id INTEGER PRIMARY KEY, eposta TEXT UNIQUE NOT NULL)</code>, <code>siparis(id INTEGER PRIMARY KEY, musteri_id INTEGER NOT NULL REFERENCES musteri(id) ON DELETE CASCADE, tutar REAL NOT NULL CHECK (tutar &gt; 0))</code>. Ayrıca <code>musteri_ekle(con, eposta)</code> yaz: e-postayı küçük harfe ve boşluksuz hâle getirip ekle, yeni id\'yi döndür.</p>',
       guide=['sqlite3.connect(":memory:") ile bağlan.', 'con.execute("PRAGMA foreign_keys = ON").', 'executescript ile iki CREATE TABLE cümlesini çalıştır.', 'musteri_ekle: eposta.strip().lower() ile normalleştir, INSERT\'in imlecinden lastrowid döndür.'],
       example=d('''
           import sqlite3
           con = sqlite3.connect(":memory:")
           con.execute("PRAGMA foreign_keys = ON")
           con.executescript("""
               CREATE TABLE kategori (id INTEGER PRIMARY KEY, ad TEXT);
               CREATE TABLE urun (id INTEGER PRIMARY KEY, kategori_id INTEGER REFERENCES kategori(id));
           """)
           print(con.execute("PRAGMA foreign_keys").fetchone())
       '''),
       start=d('''
           import sqlite3

           def veritabani():
               con = sqlite3.connect(":memory:")
               # TODO: yabancı anahtarları aç
               # TODO: musteri ve siparis tablolarını oluştur
               return con

           def musteri_ekle(con, eposta):
               # TODO: normalleştir, ekle, lastrowid döndür
               pass
       '''),
       sol=d('''
           import sqlite3

           def veritabani():
               con = sqlite3.connect(":memory:")
               con.execute("PRAGMA foreign_keys = ON")
               con.executescript("""
                   CREATE TABLE musteri (id INTEGER PRIMARY KEY, eposta TEXT UNIQUE NOT NULL);
                   CREATE TABLE siparis (
                       id INTEGER PRIMARY KEY,
                       musteri_id INTEGER NOT NULL REFERENCES musteri(id) ON DELETE CASCADE,
                       tutar REAL NOT NULL CHECK (tutar > 0)
                   );
               """)
               return con

           def musteri_ekle(con, eposta):
               return con.execute("INSERT INTO musteri (eposta) VALUES (?)", (eposta.strip().lower(),)).lastrowid
       '''),
       tests=d('''
           import sqlite3 as _s
           _c = veritabani()
           _a = musteri_ekle(_c, " Ayse@Ornek.com ")
           assert _a == 1, "ilk müşterinin id'si 1 olmalı"
           assert _c.execute("SELECT eposta FROM musteri").fetchone()[0] == "ayse@ornek.com", "e-posta küçük harf ve boşluksuz kaydedilmeli"
           for _sql, _p, _neden in [("INSERT INTO musteri (eposta) VALUES (?)", ("ayse@ornek.com",), "aynı e-posta"), ("INSERT INTO siparis (musteri_id, tutar) VALUES (?, ?)", (42, 10), "olmayan müşteri (foreign key)"), ("INSERT INTO siparis (musteri_id, tutar) VALUES (?, ?)", (1, 0), "sıfır tutar (CHECK)")]:
               try:
                   _c.execute(_sql, _p)
               except _s.IntegrityError:
                   pass
               else:
                   raise AssertionError(f"{_neden} IntegrityError vermeli")
           try:
               musteri_ekle(_c, "AYSE@ornek.com")
           except _s.IntegrityError:
               pass
           else:
               raise AssertionError("normalleştirme sonrası aynı e-posta reddedilmeli")
           _c.execute("INSERT INTO siparis (musteri_id, tutar) VALUES (1, 50)")
           _c.execute("DELETE FROM musteri WHERE id = 1")
           assert _c.execute("SELECT COUNT(*) FROM siparis").fetchone()[0] == 0, "ON DELETE CASCADE siparişleri de silmeli"
       '''),
       hints=['PRAGMA foreign_keys = ON tablolar kurulmadan ÖNCE ya da sonra çalışabilir; önemli olan aynı bağlantıda olması.', 'executescript birden çok cümleyi ; ile ayrılmış olarak çalıştırır.', 'return con.execute("INSERT ...", (eposta.strip().lower(),)).lastrowid'],
       why='Kısıtları veritabanı katmanında tanımlamak, kodun hangi yolundan gelirse gelsin hatalı verinin girmesini engeller. Normalleştirme (strip + lower) UNIQUE kısıtının gerçekten anlamlı olmasını sağlar.'),
  dict(t='code', stage='Kendin yaz', id='sqlite-python-x4', diff=2,
       q='<p>Yönetim panelindeki sipariş listesi sayfalı gösterilecek. <code>sayfala(con, sayfa, boyut=10)</code> yaz: <code>siparis(id, musteri, tutar)</code> tablosundan id\'ye göre sıralı, <code>sayfa</code> 1 tabanlı olacak şekilde ilgili satırları döndürsün (<code>LIMIT</code>/<code>OFFSET</code>, parametreli). Ayrıca <code>sayfa_sayisi(con, boyut=10)</code> toplam sayfa sayısını döndürsün (boş tabloda 0). <code>sayfa &lt; 1</code> ise <code>ValueError</code>.</p>',
       start=d('''
           def sayfala(con, sayfa, boyut=10):
               pass

           def sayfa_sayisi(con, boyut=10):
               pass
       '''),
       sol=d('''
           def sayfala(con, sayfa, boyut=10):
               if sayfa < 1:
                   raise ValueError("sayfa 1'den başlar")
               return con.execute("SELECT id, musteri, tutar FROM siparis ORDER BY id LIMIT ? OFFSET ?",
                                  (boyut, (sayfa - 1) * boyut)).fetchall()

           def sayfa_sayisi(con, boyut=10):
               n = con.execute("SELECT COUNT(*) FROM siparis").fetchone()[0]
               return -(-n // boyut)
       '''),
       tests=d('''
           import sqlite3 as _s
           _c = _s.connect(":memory:")
           _c.execute("CREATE TABLE siparis (id INTEGER PRIMARY KEY, musteri TEXT, tutar REAL)")
           assert sayfa_sayisi(_c, 10) == 0, "boş tabloda 0 sayfa"
           _c.executemany("INSERT INTO siparis (musteri, tutar) VALUES (?, ?)", [(f"m{i}", i) for i in range(1, 24)])
           assert [r[0] for r in sayfala(_c, 1)] == list(range(1, 11)), "1. sayfa id 1-10"
           assert [r[0] for r in sayfala(_c, 3)] == [21, 22, 23], "3. sayfa id 21-23"
           assert sayfala(_c, 4) == [], "olmayan sayfa boş liste"
           assert sayfa_sayisi(_c, 10) == 3 and sayfa_sayisi(_c, 23) == 1 and sayfa_sayisi(_c, 5) == 5, "sayfa sayısı yukarı yuvarlanmalı"
           try:
               sayfala(_c, 0)
           except ValueError:
               pass
           else:
               raise AssertionError("sayfa 0 ValueError vermeli")
       '''),
       hints=['OFFSET = (sayfa - 1) * boyut.', 'LIMIT ve OFFSET de ? ile parametre olarak verilebilir.', 'Yukarı yuvarlama: math.ceil(n / boyut) ya da -(-n // boyut).'],
       why='ORDER BY olmadan sayfalama tutarsızdır: SQL satır sırasını garanti etmez. Çok büyük tablolarda OFFSET yavaşlar; o durumda "son görülen id\'den büyük" (keyset pagination) kullanılır.'),
  dict(t='code', stage='Kendin yaz', id='sqlite-python-x5', diff=2,
       q='<p><code>kdv_raporu(con, oran)</code> fonksiyonunu yaz. <code>con.create_function</code> ile SQL içinde kullanılabilen <code>KDVLI(tutar)</code> fonksiyonu kaydet: <code>round(tutar * (1 + oran), 2)</code> döndürsün. Sonra <code>SELECT sehir, SUM(KDVLI(tutar)) ... GROUP BY sehir ORDER BY sehir</code> sorgusunun sonucunu <code>[(sehir, toplam), ...]</code> olarak döndür (toplamı da <code>round(..., 2)</code> ile yuvarla).</p>',
       start=d('''
           def kdv_raporu(con, oran):
               pass
       '''),
       sol=d('''
           def kdv_raporu(con, oran):
               con.create_function("KDVLI", 1, lambda t: round(t * (1 + oran), 2))
               sql = "SELECT sehir, ROUND(SUM(KDVLI(tutar)), 2) FROM siparis GROUP BY sehir ORDER BY sehir"
               return con.execute(sql).fetchall()
       '''),
       tests=d('''
           import sqlite3 as _s
           _c = _s.connect(":memory:")
           _c.execute("CREATE TABLE siparis (sehir TEXT, tutar REAL)")
           _c.executemany("INSERT INTO siparis VALUES (?, ?)", [("Van", 100), ("Ankara", 10.5), ("Van", 50)])
           assert kdv_raporu(_c, 0.20) == [("Ankara", 12.6), ("Van", 180.0)], f"yanlış: {kdv_raporu(_c, 0.20)}"
           assert kdv_raporu(_c, 0.10) == [("Ankara", 11.55), ("Van", 165.0)], "farklı oranla yeniden kayıt çalışmalı"
           assert _c.execute("SELECT KDVLI(100)").fetchone()[0] == 110.0, "KDVLI SQL içinde çağrılabilmeli"
       '''),
       hints=['create_function(ad, arg_sayisi, fonksiyon).', 'SQL içinde ROUND(SUM(KDVLI(tutar)), 2) ya da Python\'da round ile yuvarla.'],
       why='create_function Python mantığını SQL içinde kullanılabilir yapar; aynı adla yeniden kayıt öncekini değiştirir. Toplamı yuvarlamak float birikim farklarını gizler (para için yine Decimal tercih edilir).'),
  dict(t='code', stage='Hata avı', kind='bug', id='sqlite-python-x6', diff=2,
       q='<p>Müşteri hizmetleri ekranı, var olmayan hesap numarası girildiğinde <code>TypeError: \'NoneType\' object is not subscriptable</code> ile çöküyor. <code>bakiye(con, no)</code> hesap yoksa <code>None</code> döndürmeli, varsa bakiyeyi. Ayrıca hesap numarası <code>"TR01"</code> gibi bir metin; sorgu da yanlış parametre veriyor olabilir. <b>Hataları bul ve düzelt.</b></p>',
       start=d('''
           def bakiye(con, no):
               return con.execute("SELECT bakiye FROM hesap WHERE no = ?", no).fetchone()[0]
       '''),
       sol=d('''
           def bakiye(con, no):
               satir = con.execute("SELECT bakiye FROM hesap WHERE no = ?", (no,)).fetchone()
               return satir[0] if satir else None
       '''),
       tests=d('''
           import sqlite3 as _s
           _c = _s.connect(":memory:")
           _c.execute("CREATE TABLE hesap (no TEXT PRIMARY KEY, bakiye REAL)")
           _c.execute("INSERT INTO hesap VALUES ('TR01', 1500.0), ('TR02', 0)")
           assert bakiye(_c, "TR01") == 1500.0, "TR01 bakiyesi 1500.0"
           assert bakiye(_c, "TR02") == 0, "sıfır bakiye None değil 0 dönmeli"
           assert bakiye(_c, "TR99") is None, "olmayan hesap None dönmeli"
       '''),
       hints=['Parametre bir dizi olmalı: "TR01" metni 4 ayrı parametre sayılır.', 'fetchone() satır yoksa None döndürür; None[0] çöker.', 'satir = ...fetchone(); return satir[0] if satir else None'],
       why='İki klasik hata: metni parametre dizisi olarak vermek (her karakter bir parametre olur) ve fetchone\'un None olabileceğini unutmak. satir is None kontrolü, 0 bakiyeyi de doğru döndürür; "if satir[0]" yazsaydık 0 bakiye yanlış yorumlanırdı.'),
  dict(t='code', stage='Hata avı', kind='bug', id='sqlite-python-x7', diff=2,
       q='<p>"Son siparişler" ekranı yanlış sırada: 15 Ocak 2026\'daki sipariş, 3 Mart 2026\'dakinden daha yeni görünüyor. <code>kaydet(con, no, tarih)</code> <code>date</code> nesnesi alıp kaydediyor, <code>son_siparisler(con, n)</code> en yeni n siparişin numarasını döndürüyor. <b>Hatayı bul ve düzelt</b> (ekranda gösterim biçimi bu fonksiyonların işi değil).</p>',
       start=d('''
           def kaydet(con, no, tarih):
               con.execute("INSERT INTO siparis (no, tarih) VALUES (?, ?)", (no, tarih.strftime("%d.%m.%Y")))

           def son_siparisler(con, n):
               return [r[0] for r in con.execute("SELECT no FROM siparis ORDER BY tarih DESC LIMIT ?", (n,))]
       '''),
       sol=d('''
           def kaydet(con, no, tarih):
               con.execute("INSERT INTO siparis (no, tarih) VALUES (?, ?)", (no, tarih.isoformat()))

           def son_siparisler(con, n):
               return [r[0] for r in con.execute("SELECT no FROM siparis ORDER BY tarih DESC LIMIT ?", (n,))]
       '''),
       tests=d('''
           import sqlite3 as _s
           from datetime import date as _d
           _c = _s.connect(":memory:")
           _c.execute("CREATE TABLE siparis (no TEXT, tarih TEXT)")
           for _no, _t in [("S-1", _d(2026, 3, 3)), ("S-2", _d(2026, 1, 15)), ("S-3", _d(2025, 12, 31)), ("S-4", _d(2026, 2, 28))]:
               kaydet(_c, _no, _t)
           assert son_siparisler(_c, 2) == ["S-1", "S-4"], f"en yeni iki sipariş S-1 ve S-4 olmalı: {son_siparisler(_c, 2)}"
           assert son_siparisler(_c, 10) == ["S-1", "S-4", "S-2", "S-3"], "tüm sıralama kronolojik olmalı"
       '''),
       hints=['Metin sütunu alfabetik sıralanır: "15.01.2026" &gt; "03.03.2026" çünkü "1" &gt; "0".', 'Alfabetik sıra = kronolojik sıra olan biçim: YYYY-MM-DD.', 'tarih.isoformat() kullan.'],
       why='SQLite tarihleri metin olarak karşılaştırır. Gün-ay-yıl biçimi alfabetik olarak kronolojik değildir; ISO 8601 (yıl-ay-gün) ise öyledir ve SQL tarih fonksiyonları da bu biçimi bekler. Görüntüleme biçimi yalnızca sunum katmanında uygulanmalıdır.'),
  dict(t='code', stage='Meydan okuma', id='sqlite-python-x8', diff=3,
       q='<p>Anadolu Market sadakat programı: her şehirde en çok harcayan <code>n</code> müşteriyi bul. <code>sehir_liderleri(con, n)</code> fonksiyonu <code>siparis(musteri, sehir, tutar)</code> tablosunu kullanarak <code>{sehir: [musteri, ...]}</code> döndürsün; listeler toplam harcamaya göre azalan, eşitlikte müşteri adına göre artan sıralı olsun. Tek bir SQL sorgusu (ör. pencere fonksiyonu <code>ROW_NUMBER() OVER (PARTITION BY ...)</code>) kullanman önerilir; Python tarafında da çözebilirsin.</p>',
       start=d('''
           def sehir_liderleri(con, n):
               return {}
       '''),
       sol=d('''
           def sehir_liderleri(con, n):
               sql = """
                   SELECT sehir, musteri FROM (
                       SELECT sehir, musteri,
                              ROW_NUMBER() OVER (PARTITION BY sehir ORDER BY SUM(tutar) DESC, musteri) AS sira
                       FROM siparis GROUP BY sehir, musteri
                   ) WHERE sira <= ? ORDER BY sehir, sira
               """
               sonuc = {}
               for sehir, musteri in con.execute(sql, (n,)):
                   sonuc.setdefault(sehir, []).append(musteri)
               return sonuc
       '''),
       tests=d('''
           import sqlite3 as _s
           _c = _s.connect(":memory:")
           _c.execute("CREATE TABLE siparis (musteri TEXT, sehir TEXT, tutar REAL)")
           _c.executemany("INSERT INTO siparis VALUES (?, ?, ?)", [
               ("Ayşe", "Ankara", 100), ("Can", "Ankara", 70), ("Can", "Ankara", 40), ("Ece", "Ankara", 90),
               ("Ali", "Van", 50), ("Bora", "Van", 50), ("Cem", "Van", 10), ("Deniz", "İzmir", 5)])
           _r = sehir_liderleri(_c, 2)
           assert _r == {"Ankara": ["Can", "Ayşe"], "Van": ["Ali", "Bora"], "İzmir": ["Deniz"]}, f"yanlış: {_r}"
           assert sehir_liderleri(_c, 1)["Ankara"] == ["Can"], "Can'ın tek siparişleri küçük ama toplamı (110) en büyük: önce müşteri bazında topla"
       '''),
       hints=['Önce müşteri bazında toplamak gerekir: GROUP BY sehir, musteri.', 'ROW_NUMBER() OVER (PARTITION BY sehir ORDER BY SUM(tutar) DESC, musteri) her şehirde sıra numarası verir.', 'Dış sorguda sira &lt;= ? filtrele; Python\'da setdefault ile grupla.'],
       why='Pencere fonksiyonu gruplanmış satırlar üzerinde şehir bazında sıralama yapar; böylece "grup başına ilk n" problemi tek sorguda çözülür. Eşitlikte ikinci sıralama anahtarı (müşteri adı) sonucu deterministik yapar.'),
]

faq = [
  dict(q='SQLite ne zaman yetmez, PostgreSQL\'e ne zaman geçmeliyim?', a='Aynı anda çok sayıda yazan istemci (web uygulamasında yoğun eşzamanlı yazma), ağ üzerinden birden çok sunucunun erişimi, ileri kullanıcı/yetki yönetimi ya da çok büyük veri gerekiyorsa. Tek süreçli araçlar, masaüstü/mobil uygulamalar, gömülü sistemler, test ve analiz için SQLite çoğu zaman fazlasıyla yeterlidir.'),
  dict(q='Sorgu sonucunu doğrudan pandas DataFrame\'e alabilir miyim?', a='Evet: pandas.read_sql_query("SELECT ...", con, params=[...]) aynı sqlite3 bağlantısıyla çalışır; DataFrame\'i geri yazmak için df.to_sql("tablo", con, if_exists="append", index=False). Ayrıntısı pandas derslerinde.'),
]
mistakes = [
  dict(bad='con.execute("SELECT * FROM m WHERE id IN (?)", ([1, 2, 3],))', good='ids = [1, 2, 3]\nyer = ", ".join("?" * len(ids))\ncon.execute(f"SELECT * FROM m WHERE id IN ({yer})", ids)', why='Tek ? tek değere bağlanır; liste bağlanamaz. Yer tutucuları liste uzunluğu kadar üret, değerleri yine parametre ver.'),
  dict(bad='con.execute("INSERT OR REPLACE INTO stok (sku, adet) VALUES (?, ?)", (sku, 5))', good='con.execute("INSERT INTO stok (sku, adet) VALUES (?, ?) ON CONFLICT(sku) DO UPDATE SET adet = excluded.adet", (sku, 5))', why='OR REPLACE satırı silip yeniden ekler; belirtilmeyen sütunlar kaybolur ve CASCADE ile bağlı satırlar silinebilir. Güncelleme için ON CONFLICT DO UPDATE kullan.'),
]

EXT = dict(id='sqlite-python', min=30, html=html, ex=ex, faq=faq, mistakes=mistakes)
