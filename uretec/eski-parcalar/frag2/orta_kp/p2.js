/* ───────────────────────── 2. sqlite-python ───────────────────────── */
{
  id: 'sqlite-python',
  lv: 'orta',
  mod: 'Standart Kütüphane',
  min: 35,
  title: 'sqlite3 ile Python',
  sum: 'Bellek içi SQLite veritabanı kurar, parametreli sorguyla SQL enjeksiyonundan korunur, executemany ile toplu yükler, Row factory ile satırları sözlük gibi okur ve transaction mantığını kavrarsın.',
  goals: [
    'sqlite3 ile bellek içi veritabanı açıp tablo oluşturabilir, veri ekleyip sorgulayabilirim.',
    'Parametreli sorgu (?) ile SQL enjeksiyonunu engelleyebilir, executemany ile toplu ekleme yapabilirim.',
    'Row factory ile satırları sütun adıyla okuyup sözlüğe çevirebilirim.',
    'commit, rollback ve bağlam yöneticisi ile transaction davranışını yönetebilirim.',
    'Hangi işi SQL\'e, hangisini Python\'a bırakacağıma karar verebilirim.'
  ],
  body: `
<h2>Neden SQLite?</h2>
<p>SQLite, tek bir dosyada (ya da bellekte) yaşayan, sunucu gerektirmeyen bir ilişkisel veritabanıdır (relational database). Python ile birlikte gelen <code>sqlite3</code> modülü sayesinde kurulum yapmadan SQL yazabilirsin. Anadolu Market'te bir analist için tipik kullanım şu: binlerce satırlık sipariş CSV'sini bir SQLite tablosuna yükle, SQL ile grupla ve filtrele, sonucu Python ile raporla. Masaüstü uygulamaları, mobil uygulamalar ve tarayıcılar da yerel verisini SQLite'ta tutar; yani öğrendiğin şey oyuncak değil, dünyanın en yaygın veritabanı motoru.</p>
<p>SQLPatika'da SQL'in kendisini öğrendin. Bu derste sorulan soru farklı: <b>Python, SQL ile nasıl konuşur?</b> Üç kavram yeter: bağlantı (connection), imleç (cursor) ve transaction.</p>

<h2>Bağlantı, tablo, ekleme, sorgu</h2>
<p><code>sqlite3.connect(":memory:")</code> yalnızca RAM'de yaşayan bir veritabanı açar; program bitince kaybolur. Derste ve testte idealdir. Dosya istersen <code>connect("market.db")</code> yazarsın. <code>execute</code> bir SQL cümlesi çalıştırır, <code>fetchall</code> sonuç satırlarını demet listesi olarak getirir.</p>
<pre class="py">import sqlite3

con = sqlite3.connect(":memory:")
con.execute("""
    CREATE TABLE siparis (
        id INTEGER PRIMARY KEY,
        musteri TEXT NOT NULL,
        sehir TEXT NOT NULL,
        tutar REAL NOT NULL
    )
""")
con.execute("INSERT INTO siparis (musteri, sehir, tutar) VALUES (?, ?, ?)", ("Ayşe", "Ankara", 1250.0))
con.execute("INSERT INTO siparis (musteri, sehir, tutar) VALUES (?, ?, ?)", ("Mehmet", "İzmir", 480.5))
con.commit()

satirlar = con.execute("SELECT id, musteri, sehir, tutar FROM siparis ORDER BY id").fetchall()
print(satirlar)
print("ilk satır türü:", type(satirlar[0]).__name__)
toplam = con.execute("SELECT SUM(tutar) FROM siparis").fetchone()[0]
print("toplam:", toplam)
con.close()</pre>
<p>Dikkat edilecek nokta: <code>fetchall</code> demet (tuple) listesi döner, sütun adları yoktur. <code>fetchone</code> tek satır (ya da None) getirir; tek değerli sonuçlarda <code>[0]</code> ile içini alırsın. <code>con.execute</code>, arka planda bir imleç oluşturup çalıştırmanın kısa yoludur; <code>cur = con.cursor()</code> ile açık imleç de kullanabilirsin.</p>

<h2>Parametreli sorgu ve SQL enjeksiyonu</h2>
<p>Yukarıdaki <code>?</code> işaretleri yer tutucudur (placeholder). Değerleri SQL metnine f-string ile gömmek yerine ayrı bir demetle verirsin. Bunun iki nedeni var: sqlite3 tırnak ve özel karakterleri doğru kaçırır, ve kullanıcıdan gelen metin SQL olarak <b>yorumlanmaz</b>. Aşağıdaki örnek, kötü niyetli bir girdinin f-string'li sorguyu nasıl ele geçirdiğini, parametreli sorgunun ise aynı metni sadece veri olarak gördüğünü gösterir.</p>
<pre class="py">import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE musteri (ad TEXT, sehir TEXT)")
con.executemany("INSERT INTO musteri VALUES (?, ?)", [("Ayşe", "Ankara"), ("Can", "Bursa"), ("Elif", "Ankara")])

girdi = "Ankara' OR '1'='1"   # arama kutusuna yazılan kötü niyetli metin

# YANLIŞ: metin SQL'in parçası olur, koşul her zaman doğru çıkar
kotu = con.execute(f"SELECT ad FROM musteri WHERE sehir = '{girdi}'").fetchall()
print("f-string ile:", [r[0] for r in kotu])

# DOĞRU: metin yalnızca bir değerdir, hiçbir şehirle eşleşmez
iyi = con.execute("SELECT ad FROM musteri WHERE sehir = ?", (girdi,)).fetchall()
print("parametre ile:", [r[0] for r in iyi])

# İsimli parametre: okunur ve sıraya bağlı değil
isimli = con.execute("SELECT ad FROM musteri WHERE sehir = :s ORDER BY ad", {"s": "Ankara"}).fetchall()
print("isimli parametre:", [r[0] for r in isimli])</pre>
<div class="warn"><b>Tek değerli parametre demet olmalı</b><code>(girdi,)</code> sondaki virgüle dikkat. <code>(girdi)</code> yazarsan parantez bir işlem önceliği parantezi olur, demet değil; sqlite3 metni karakter karakter parametre sanıp hata verir.</div>
<p><code>executemany</code>, aynı sorguyu bir dizi parametreyle tekrar tekrar çalıştırır; CSV'den yüzlerce satır yüklerken döngüde tek tek <code>execute</code> çağırmaktan hem kısa hem hızlıdır.</p>

<h2>Row factory: satırı sözlük gibi okumak</h2>
<p><code>r[2]</code> yazıp "üçüncü sütun hangisiydi" diye düşünmek hata kaynağıdır. <code>con.row_factory = sqlite3.Row</code> dedikten sonra her satır hem indeksle hem sütun adıyla okunur; <code>dict(satir)</code> ile gerçek sözlüğe çevrilir ve JSON'a gitmeye hazır olur.</p>
<pre class="py">import json
import sqlite3

con = sqlite3.connect(":memory:")
con.row_factory = sqlite3.Row
con.execute("CREATE TABLE siparis (id INTEGER PRIMARY KEY, sehir TEXT, tutar REAL)")
con.executemany("INSERT INTO siparis (sehir, tutar) VALUES (?, ?)", [
    ("Ankara", 1250.0), ("İzmir", 480.5), ("Ankara", 300.0), ("Bursa", 920.0), ("İzmir", 150.0)
])

for row in con.execute("SELECT sehir, COUNT(*) AS adet, SUM(tutar) AS toplam FROM siparis GROUP BY sehir ORDER BY toplam DESC"):
    print(row["sehir"], row["adet"], row["toplam"])

ilk = con.execute("SELECT * FROM siparis WHERE id = ?", (1,)).fetchone()
print("sütunlar:", ilk.keys())
print("sözlük:", dict(ilk))
print(json.dumps([dict(r) for r in con.execute("SELECT id, sehir FROM siparis WHERE sehir = 'İzmir'")], ensure_ascii=False))</pre>
<p>GROUP BY, SUM ve ORDER BY işini SQL yaptı; Python yalnızca sonucu dolaştı. Bu iş bölümü dersin sonundaki "köprü" bölümünün özeti.</p>

<h2>Transaction: commit, rollback, bağlam yöneticisi</h2>
<p>Anadolu Bank'ta bir havale iki UPDATE'tir: gönderenden düş, alıcıya ekle. İlki olup ikincisi olmazsa para buharlaşır. Transaction (işlem bütünlüğü) tam bunu çözer: bir grup değişiklik ya hep birlikte kalıcı olur (<code>commit</code>) ya da hep birlikte geri alınır (<code>rollback</code>). sqlite3'te bağlantı nesnesi <code>with</code> ile kullanılınca blok hatasız biterse otomatik commit, istisna çıkarsa otomatik rollback yapar. Dikkat: <code>with con:</code> bağlantıyı <b>kapatmaz</b>, yalnızca transaction'ı yönetir.</p>
<pre class="py">import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE hesap (no TEXT PRIMARY KEY, bakiye REAL NOT NULL CHECK (bakiye &gt;= 0))")
con.executemany("INSERT INTO hesap VALUES (?, ?)", [("TR01", 1000.0), ("TR02", 200.0)])
con.commit()

def havale(gonderen: str, alici: str, tutar: float) -&gt; bool:
    try:
        with con:
            con.execute("UPDATE hesap SET bakiye = bakiye - ? WHERE no = ?", (tutar, gonderen))
            con.execute("UPDATE hesap SET bakiye = bakiye + ? WHERE no = ?", (tutar, alici))
        return True
    except sqlite3.IntegrityError as e:
        print("geri alındı:", e)
        return False

def bakiyeler():
    return dict(con.execute("SELECT no, bakiye FROM hesap ORDER BY no").fetchall())

print("başlangıç:", bakiyeler())
print("300 havale:", havale("TR01", "TR02", 300.0), bakiyeler())
print("5000 havale:", havale("TR01", "TR02", 5000.0), bakiyeler())</pre>
<p>İkinci havalede ilk UPDATE bakiyeyi eksiye düşürmeye çalışınca CHECK kısıtı <code>IntegrityError</code> fırlattı; <code>with con</code> bloğu bu istisnayı görüp her şeyi geri aldı. Bakiyeler ilk havaleden sonraki halinde kaldı. Kısıtı veritabanına yazmak, Python tarafındaki <code>if</code> kontrolünü unutsan bile veriyi korur.</p>
<div class="tip"><b>Bağlantıyı kapatmayı unutma</b>Dosya tabanlı veritabanında işin bitince <code>con.close()</code> çağır; en temizi bağlantıyı <code>contextlib.closing(sqlite3.connect(...))</code> ile açmak ya da sınıfına <code>__enter__/__exit__</code> yazmaktır. Bellek içi veritabanında kapatma, veriyi de siler.</div>
<div class="note"><b>Tür eşlemesi</b>SQLite'ın INTEGER, REAL, TEXT, BLOB türleri sırasıyla int, float, str, bytes olarak gelir. Tarih tipi yoktur: tarihleri ISO metni ("2024-03-15") olarak sakla, karşılaştırma yine doğru çalışır. NULL ise Python'da None olur.</div>

<h2>SQLPatika'ya köprü: SQL ne yapar, Python ne yapar?</h2>
<p>İki araç rakip değil, iş arkadaşı. Küme işlemleri (filtre, gruplama, birleştirme, sıralama) veritabanı motorunun uzmanlık alanıdır; milyon satırda Python döngüsünden kat kat hızlıdır ve veriyi belleğe taşımaz. Python ise SQL'in beceremediği yerde devreye girer: karmaşık iş kuralları, dış sistemlerle konuşma, rapor biçimleme, test.</p>
<div class="tbl-wrap"><table>
<tr><th>İş</th><th>SQL'e bırak</th><th>Python'a bırak</th></tr>
<tr><td>Şehre göre toplam ciro</td><td>GROUP BY sehir, SUM(tutar)</td><td>Sonucu tabloya/JSON'a dök</td></tr>
<tr><td>Son 30 günün siparişleri</td><td>WHERE tarih &gt;= ?</td><td>Tarih aralığını hesapla, parametre olarak ver</td></tr>
<tr><td>Şüpheli işlem kuralı (çok adımlı)</td><td>Ham satırları getir</td><td>Kuralı fonksiyonla uygula, test et</td></tr>
<tr><td>CSV'den yükleme</td><td>INSERT (executemany)</td><td>CSV'yi oku, temizle, türleri çevir</td></tr>
<tr><td>Müşteriye e-posta</td><td>Alıcı listesini seç</td><td>Şablon doldur, gönder</td></tr>
</table></div>
<p>Pratik kural: "Veriyi azaltan iş SQL'de, veriyi anlamlandıran iş Python'da." Bir SELECT'in döndürdüğü satır sayısı ne kadar azsa, Python tarafı o kadar hızlı ve basit olur.</p>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Üretimde sqlite3: kalıplar ve sınırlar</h3>
<p>Bir veri katmanı (data layer) yazarken sorguları uygulamanın her yerine dağıtma; bir <code>Depo</code> sınıfında topla. Sınıfın kurucusu bağlantıyı alır, metotları (<code>ekle</code>, <code>sehre_gore_toplam</code>) SQL'i saklar, geri kalan kod SQL görmez. Böylece bir gün PostgreSQL'e geçersen yalnızca bu sınıfı değiştirirsin. Testlerde ise aynı sınıfa <code>":memory:"</code> bağlantısı verirsin; her test temiz bir veritabanıyla başlar, dosya kirliliği olmaz.</p>
<p>Şema değişiklikleri (migration) için <code>CREATE TABLE IF NOT EXISTS</code> başlangıçtır; büyüyen projede <code>PRAGMA user_version</code> ile şema sürümü tutup sırayla ALTER TABLE betikleri çalıştırırsın. Performans için iki not: toplu eklemede her satırdan sonra commit yapma, executemany + tek commit kullan; sık filtrelenen sütuna <code>CREATE INDEX</code> ekle. SQLite'ın sınırı eşzamanlı yazmadır: aynı anda tek yazar kabul eder. Çok kullanıcılı web uygulaması ya da gigabaytlarca büyüyen veri için PostgreSQL gibi sunucu tabanlı bir motora geçersin; ama Python tarafındaki kalıp (bağlantı, parametreli sorgu, transaction) birebir aynı kalır, çünkü hepsi DB-API 2.0 standardını izler.</p>
</section>
`,
  ex: [
    { t: 'mc', q: 'Arama kutusundan gelen <code>sehir</code> değişkenini sorguya eklemenin güvenli yolu hangisidir?',
      o: ['con.execute(f"SELECT * FROM m WHERE sehir = \'{sehir}\'")', 'con.execute("SELECT * FROM m WHERE sehir = " + repr(sehir))', 'con.execute("SELECT * FROM m WHERE sehir = ?", (sehir,))', 'con.execute("SELECT * FROM m WHERE sehir = ?" % sehir)'],
      a: 2,
      why: 'Yer tutucu (?) ile değer ayrı geçirilir; sqlite3 onu asla SQL olarak yorumlamaz. f-string, + ve % ile metin birleştirme, girdiyi SQL\'in parçası yapar ve enjeksiyona açıktır.' },

    { t: 'code', id: 'sqlite-python-1',
      q: '<p>Anadolu Market için <code>veritabani_kur()</code> fonksiyonunu yaz: <code>":memory:"</code> bağlantısı açsın, <code>siparis</code> tablosunu <code>id INTEGER PRIMARY KEY, musteri TEXT, sehir TEXT, tutar REAL</code> sütunlarıyla oluştursun ve bağlantıyı döndürsün. Sonra <code>siparis_ekle(con, kayitlar)</code> fonksiyonunu yaz: <code>kayitlar</code> <code>(musteri, sehir, tutar)</code> demetlerinden oluşan bir listedir; <code>executemany</code> ile eklesin, <code>commit</code> yapsın ve eklenen satır sayısını döndürsün.</p>',
      start: 'import sqlite3\n\ndef veritabani_kur():\n    pass\n\ndef siparis_ekle(con, kayitlar):\n    pass\n',
      sol: 'import sqlite3\n\ndef veritabani_kur():\n    con = sqlite3.connect(":memory:")\n    con.execute("CREATE TABLE siparis (id INTEGER PRIMARY KEY, musteri TEXT, sehir TEXT, tutar REAL)")\n    return con\n\ndef siparis_ekle(con, kayitlar):\n    con.executemany("INSERT INTO siparis (musteri, sehir, tutar) VALUES (?, ?, ?)", kayitlar)\n    con.commit()\n    return len(kayitlar)\n',
      tests: 'import sqlite3\ncon = veritabani_kur()\nassert isinstance(con, sqlite3.Connection), "Bağlantı nesnesi dönmeli"\ncols = [r[1] for r in con.execute("PRAGMA table_info(siparis)")]\nassert cols == ["id", "musteri", "sehir", "tutar"], "Sütunlar id, musteri, sehir, tutar olmalı"\nn = siparis_ekle(con, [("Ayşe", "Ankara", 1250.0), ("Can", "Bursa", 300.0), ("Elif", "Ankara", 90.5)])\nassert n == 3, "Eklenen satır sayısı 3 dönmeli"\nassert con.execute("SELECT COUNT(*) FROM siparis").fetchone()[0] == 3, "Tabloda 3 satır olmalı"\nassert con.execute("SELECT musteri FROM siparis WHERE id = 1").fetchone()[0] == "Ayşe", "id otomatik artmalı (1 -> Ayşe)"\nassert siparis_ekle(con, []) == 0, "Boş listede 0 dönmeli"\n',
      hints: ['sqlite3.connect(":memory:") ve con.execute("CREATE TABLE ...")', 'executemany("INSERT ... VALUES (?, ?, ?)", kayitlar) sonra con.commit()'],
      why: 'INTEGER PRIMARY KEY sütunu verilmeyince SQLite otomatik numara atar; executemany tüm demetleri tek sorguyla işler.' },

    { t: 'code', id: 'sqlite-python-2',
      q: '<p><code>sehre_gore_toplam(con)</code> fonksiyonunu yaz. <code>con</code> içinde <code>siparis(sehir, tutar)</code> tablosu dolu gelir. Fonksiyon SQL ile (GROUP BY) şehir başına sipariş adedini ve toplam tutarı hesaplasın ve toplam tutara göre azalan sırada <code>[{"sehir": ..., "adet": ..., "toplam": ...}, ...]</code> listesi döndürsün. İpucu: <code>con.row_factory = sqlite3.Row</code> ile satırları <code>dict(...)</code>\'e çevirebilirsin.</p>',
      start: 'import sqlite3\n\ndef sehre_gore_toplam(con):\n    pass\n',
      sol: 'import sqlite3\n\ndef sehre_gore_toplam(con):\n    con.row_factory = sqlite3.Row\n    sql = "SELECT sehir, COUNT(*) AS adet, SUM(tutar) AS toplam FROM siparis GROUP BY sehir ORDER BY toplam DESC"\n    return [dict(r) for r in con.execute(sql)]\n',
      tests: 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE siparis (id INTEGER PRIMARY KEY, sehir TEXT, tutar REAL)")\ncon.executemany("INSERT INTO siparis (sehir, tutar) VALUES (?, ?)", [("Ankara", 1250.0), ("İzmir", 480.5), ("Ankara", 300.0), ("Bursa", 920.0), ("İzmir", 150.0)])\nr = sehre_gore_toplam(con)\nassert isinstance(r, list) and all(isinstance(x, dict) for x in r), "Sözlük listesi dönmeli"\nassert [x["sehir"] for x in r] == ["Ankara", "Bursa", "İzmir"], "Toplama göre azalan: Ankara, Bursa, İzmir"\nassert r[0]["adet"] == 2 and abs(r[0]["toplam"] - 1550.0) < 1e-6, "Ankara: adet 2, toplam 1550.0"\nassert r[2]["adet"] == 2 and abs(r[2]["toplam"] - 630.5) < 1e-6, "İzmir: adet 2, toplam 630.5"\nassert set(r[1]) == {"sehir", "adet", "toplam"}, "Anahtarlar sehir, adet, toplam olmalı"\n',
      hints: ['SELECT sehir, COUNT(*) AS adet, SUM(tutar) AS toplam FROM siparis GROUP BY sehir ORDER BY toplam DESC', 'row_factory = sqlite3.Row sonra [dict(r) for r in ...]'],
      why: 'Gruplama ve sıralama SQL\'de yapılır; AS ile verilen takma adlar Row üzerinden doğrudan sözlük anahtarı olur.' },

    { t: 'code', id: 'sqlite-python-3',
      q: '<p>Anadolu Bank için <code>havale(con, gonderen, alici, tutar)</code> fonksiyonunu yaz. <code>hesap(no TEXT PRIMARY KEY, bakiye REAL CHECK (bakiye &gt;= 0))</code> tablosu hazır gelir. Fonksiyon <code>with con:</code> bloğu içinde gönderenin bakiyesini düşüp alıcınınkini artırsın. Blok başarılı biterse <code>True</code> döndürsün; <code>sqlite3.IntegrityError</code> çıkarsa (bakiye eksiye düşerse) istisnayı yakalayıp <code>False</code> döndürsün. Başarısız havalede hiçbir bakiye değişmemeli.</p>',
      start: 'import sqlite3\n\ndef havale(con, gonderen, alici, tutar):\n    pass\n',
      sol: 'import sqlite3\n\ndef havale(con, gonderen, alici, tutar):\n    try:\n        with con:\n            con.execute("UPDATE hesap SET bakiye = bakiye - ? WHERE no = ?", (tutar, gonderen))\n            con.execute("UPDATE hesap SET bakiye = bakiye + ? WHERE no = ?", (tutar, alici))\n        return True\n    except sqlite3.IntegrityError:\n        return False\n',
      tests: 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE hesap (no TEXT PRIMARY KEY, bakiye REAL NOT NULL CHECK (bakiye >= 0))")\ncon.executemany("INSERT INTO hesap VALUES (?, ?)", [("TR01", 1000.0), ("TR02", 200.0)])\ncon.commit()\ndef bak(): return dict(con.execute("SELECT no, bakiye FROM hesap").fetchall())\nassert havale(con, "TR01", "TR02", 300.0) is True, "Yeterli bakiyede True dönmeli"\nassert bak() == {"TR01": 700.0, "TR02": 500.0}, "300 havale sonrası TR01=700, TR02=500 olmalı"\nassert havale(con, "TR01", "TR02", 5000.0) is False, "Yetersiz bakiyede False dönmeli"\nassert bak() == {"TR01": 700.0, "TR02": 500.0}, "Başarısız havalede bakiyeler değişmemeli (rollback)"\nassert havale(con, "TR02", "TR01", 500.0) is True, "Tam bakiye kadar havale geçerli"\nassert bak() == {"TR01": 1200.0, "TR02": 0.0}, "Son durum TR01=1200, TR02=0"\n',
      hints: ['with con: bloğu içinde iki UPDATE; istisna çıkarsa blok otomatik rollback yapar.', 'try/except sqlite3.IntegrityError ile False döndür.'],
      why: 'Bağlantı bağlam yöneticisi olarak kullanılınca hatasız çıkışta commit, istisnada rollback yapar; CHECK kısıtı eksi bakiyeyi veritabanı seviyesinde engeller.' },

    { t: 'mc', q: '<code>with con:</code> bloğu bittiğinde sqlite3 bağlantısına ne olur?',
      o: ['Bağlantı kapanır', 'Transaction commit edilir, bağlantı açık kalır', 'Tablolar silinir', 'Hiçbir şey; with yalnızca dosyalar içindir'],
      a: 1,
      why: 'sqlite3.Connection\'ın bağlam yöneticisi transaction\'ı yönetir: hatasız çıkışta commit, istisnada rollback. Bağlantıyı kapatmak için ayrıca close() gerekir.' },

    { t: 'code', id: 'sqlite-python-4',
      q: '<p><code>csv_den_yukle(con, metin)</code> fonksiyonunu yaz. <code>metin</code>, başlık satırı <code>musteri,sehir,tutar</code> olan bir CSV string\'idir. Fonksiyon <code>csv.DictReader</code> ile satırları okusun, <code>tutar</code>\'ı float\'a çevirsin, <code>siparis(musteri, sehir, tutar)</code> tablosuna <code>executemany</code> ile eklesin, commit yapsın ve eklenen satır sayısını döndürsün. Tablo hazır gelir.</p>',
      start: 'import csv\nimport io\nimport sqlite3\n\ndef csv_den_yukle(con, metin):\n    pass\n',
      sol: 'import csv\nimport io\nimport sqlite3\n\ndef csv_den_yukle(con, metin):\n    okuyucu = csv.DictReader(io.StringIO(metin))\n    kayitlar = [(r["musteri"], r["sehir"], float(r["tutar"])) for r in okuyucu]\n    con.executemany("INSERT INTO siparis (musteri, sehir, tutar) VALUES (?, ?, ?)", kayitlar)\n    con.commit()\n    return len(kayitlar)\n',
      tests: 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE siparis (id INTEGER PRIMARY KEY, musteri TEXT, sehir TEXT, tutar REAL)")\nmetin = "musteri,sehir,tutar\\nAyşe,Ankara,1250.0\\nCan,Bursa,300\\nElif,İzmir,90.5\\n"\nassert csv_den_yukle(con, metin) == 3, "3 satır eklenmeli"\nrows = con.execute("SELECT musteri, sehir, tutar FROM siparis ORDER BY id").fetchall()\nassert rows == [("Ayşe", "Ankara", 1250.0), ("Can", "Bursa", 300.0), ("Elif", "İzmir", 90.5)], "Satırlar doğru sırayla ve float tutarla eklenmeli"\nassert isinstance(rows[1][2], float), "tutar REAL (float) olarak saklanmalı"\nassert csv_den_yukle(con, "musteri,sehir,tutar\\n") == 0, "Yalnızca başlık varsa 0 dönmeli"\n',
      hints: ['csv.DictReader(io.StringIO(metin)) her satırı sözlük verir.', 'Önce (musteri, sehir, float(tutar)) demetleri listesini kur, sonra executemany.'],
      why: 'CSV\'yi okuyup türleri çevirmek Python\'un işi, satırları saklamak SQL\'in; executemany ikisini tek adımda bağlar.' },

    { t: 'mc', q: 'Bir milyon satırlık sipariş tablosunda şehir başına ciroyu hesaplayacaksın. En doğru yaklaşım hangisi?',
      o: ['SELECT * ile hepsini çekip Python sözlüğüyle toplamak', 'Her şehir için ayrı SELECT SUM sorgusu göndermek', 'GROUP BY ile tek sorguda özetleyip sonucu Python\'da raporlamak', 'Satırları pandas\'a aktarmak için önce CSV\'ye yazmak'],
      a: 2,
      why: 'Veriyi azaltan iş (gruplama) veritabanında yapılır; tek sorgu hem ağ/bellek yükünü düşürür hem hızlıdır. Her şehir için ayrı sorgu N kat yavaştır; tüm satırları Python\'a taşımak belleği boşa harcar.' }
  ],
  faq: [
    { q: 'executemany ile döngüde execute arasında gerçek fark var mı?', a: 'Sonuç aynı, hız farklı: executemany sorguyu bir kez derler ve parametreleri art arda uygular. Binlerce satırda belirgin kazanç sağlar; ayrıca kod kısalır.' },
    { q: 'Sorgu sonucunu neden tuple olarak alıyorum, sözlük daha kolay değil mi?', a: 'Varsayılan tuple hız içindir. con.row_factory = sqlite3.Row dersen hem indeks hem sütun adıyla erişirsin; dict(row) ile tam sözlüğe çevirirsin. Yeni projede row_factory ayarlamak iyi alışkanlıktır.' },
    { q: 'Tarihleri nasıl saklamalıyım?', a: 'ISO 8601 metni olarak: "2024-03-15" ya da "2024-03-15T10:30:00". Metin karşılaştırması kronolojik sırayla örtüşür, SQLite\'ın date() fonksiyonları da bu biçimi tanır.' },
    { q: 'Pyodide/tarayıcıda dosya veritabanı açabilir miyim?', a: 'Evet, sanal dosya sistemine yazılır ama sayfa yenilenince kaybolur. Derste ve testte ":memory:" kullan; kalıcı veri gerçek Python kurulumunda dosya ile tutulur.' }
  ],
  mistakes: [
    { bad: 'con.execute("SELECT * FROM m WHERE ad = ?", ad)', good: 'con.execute("SELECT * FROM m WHERE ad = ?", (ad,))', why: 'Parametreler bir dizi olmalı. Metin verilirse sqlite3 onu karakter karakter parametre sayar ve "Incorrect number of bindings" hatası verir.' },
    { bad: 'con.execute("INSERT INTO t VALUES (?)", (x,))\n# commit yok', good: 'con.execute("INSERT INTO t VALUES (?)", (x,))\ncon.commit()', why: 'Commit edilmeyen değişiklik bağlantı kapanınca kaybolur; başka bir bağlantı da onu göremez.' },
    { bad: 'with con:\n    ...\n# "bağlantı kapandı" sanmak', good: 'with con:\n    ...\ncon.close()', why: 'Bağlantı nesnesinin with bloğu yalnızca commit/rollback yapar; kaynağı serbest bırakmak için close gerekir.' },
    { bad: 'for sehir in sehirler:\n    con.execute(f"SELECT SUM(tutar) FROM s WHERE sehir=\'{sehir}\'")', good: 'con.execute("SELECT sehir, SUM(tutar) FROM s GROUP BY sehir")', why: 'Hem enjeksiyona açık hem de N ayrı sorgu; tek GROUP BY sorgusu hem güvenli hem hızlıdır.' }
  ]
},
