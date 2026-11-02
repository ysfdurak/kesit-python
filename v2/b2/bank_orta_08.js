/* PythonPatika — pratik bankası (orta): Dosya İşlemleri, SQLite, Veri Yapıları (b-281…b-290) */
(function (W) {
'use strict';
const B = W.PY_BANK = W.PY_BANK || [];
B.push(
  {
    id: 'b-281',
    lv: 'orta',
    topic: 'Dosya İşlemleri',
    diff: 2,
    kind: 'rehberli',
    title: 'Yarım kalmayan dosya yazımı',
    q: '<p>Fiyat listesi dosyası her saat yeniden yazılıyor; yazma ortasında süreç çökerse web sitesi yarım dosya okuyor. <code>guvenli_yaz(yol, metin)</code> fonksiyonunu yaz: metni önce <b>aynı klasörde</b> geçici bir dosyaya (<code>yol</code> + <code>".tmp"</code>) yazsın, sonra <code>os.replace</code> ile hedefin üzerine taşısın. <code>yol</code> bir <code>pathlib.Path</code>; UTF-8 kullan. İşlem sonunda klasörde <code>.tmp</code> dosyası kalmamalı.</p>',
    guide: ['Geçici yol: <code>gecici = yol.with_name(yol.name + ".tmp")</code>.', 'Geçici dosyaya <code>write_text(metin, encoding="utf-8")</code> ile yaz.', '<code>os.replace(gecici, yol)</code> ile tek adımda yer değiştir (hedef varsa üzerine yazar).', 'Yazma sırasında hata olursa geçici dosyayı silip hatayı yeniden fırlat (<code>try/except</code> + <code>unlink(missing_ok=True)</code>).'],
    example: 'import os, tempfile, pathlib\nd = pathlib.Path(tempfile.mkdtemp())\n(d / "a.txt").write_text("eski", encoding="utf-8")\n(d / "b.txt").write_text("yeni", encoding="utf-8")\nos.replace(d / "b.txt", d / "a.txt")   # b, a\'nın yerine geçer\nprint(sorted(p.name for p in d.iterdir()), (d / "a.txt").read_text(encoding="utf-8"))\n',
    start: 'import os\nfrom pathlib import Path\n\ndef guvenli_yaz(yol, metin):\n    # TODO 1: geçici dosya yolunu oluştur\n    # TODO 2: geçici dosyaya yaz\n    # TODO 3: os.replace ile hedefe taşı (hata olursa geçiciyi sil)\n    pass\n',
    sol: 'import os\nfrom pathlib import Path\n\ndef guvenli_yaz(yol, metin):\n    gecici = yol.with_name(yol.name + ".tmp")\n    try:\n        gecici.write_text(metin, encoding="utf-8")\n        os.replace(gecici, yol)\n    except BaseException:\n        gecici.unlink(missing_ok=True)\n        raise\n',
    tests: 'import tempfile\nd = Path(tempfile.mkdtemp())\nhedef = d / "fiyatlar.csv"\nguvenli_yaz(hedef, "urun;fiyat\\nkalem;15\\n")\nassert hedef.read_text(encoding="utf-8") == "urun;fiyat\\nkalem;15\\n", "hedef dosya yeni içeriği taşımalı"\nguvenli_yaz(hedef, "urun;fiyat\\nkalem;17\\n")\nassert "17" in hedef.read_text(encoding="utf-8"), "var olan dosyanın üzerine yazılmalı"\nassert sorted(p.name for p in d.iterdir()) == ["fiyatlar.csv"], "klasörde .tmp dosyası kalmamalı"\ntry:\n    guvenli_yaz(hedef, None)\n    assert False, "metin None ise hata fırlamalı"\nexcept TypeError:\n    pass\nassert sorted(p.name for p in d.iterdir()) == ["fiyatlar.csv"] and "17" in hedef.read_text(encoding="utf-8"), "hata olduğunda eski dosya bozulmamalı ve .tmp temizlenmeli"\n',
    hints: ['Doğrudan hedefe yazmak, yazma süresince dosyayı yarım bırakır.', '<code>os.replace</code> aynı dosya sisteminde atomiktir: okuyan ya eski ya yeni dosyayı görür.', 'Hata yolunda <code>gecici.unlink(missing_ok=True)</code> ve <code>raise</code>.'],
    why: '"Önce geçiciye yaz, sonra yeniden adlandır" kalıbı, okuyucuların hiçbir zaman yarım dosya görmemesini sağlar; çünkü aynı dosya sistemindeki yeniden adlandırma atomiktir. Geçici dosyanın aynı klasörde olması bu yüzden önemlidir (farklı disk arasında taşıma kopyalamaya dönüşür). Daha da sağlam sürümde yazma sonrası <code>f.flush()</code> ve <code>os.fsync(f.fileno())</code> çağrılır; çakışmayı önlemek için geçici ad <code>tempfile.NamedTemporaryFile(dir=..., delete=False)</code> ile üretilebilir.',
    tags: ['pathlib', 'os.replace', 'atomik yazma'],
    min: 8
  },

  {
    id: 'b-282',
    lv: 'orta',
    topic: 'Dosya İşlemleri',
    diff: 2,
    kind: 'yaz',
    title: 'Disk dolmadan büyük dosyaları bul',
    q: '<p>Sunucuda disk doluyor. <code>buyuk_dosyalar(klasor, esik_bayt)</code> fonksiyonunu yaz: <code>klasor</code> (bir <code>Path</code>) altındaki <b>tüm alt klasörler dahil</b> dosyalardan boyutu <code>esik_bayt</code>\'tan büyük olanları <code>(göreli_yol, boyut)</code> demetleri olarak, boyuta göre <b>azalan</b> sırada döndürsün. Göreli yol <code>"loglar/2026/mart.log"</code> gibi <code>/</code> ayırıcılı metin olsun. Klasörleri listeye koyma.</p>',
    start: 'from pathlib import Path\n\ndef buyuk_dosyalar(klasor, esik_bayt):\n    # buraya yaz\n    pass\n',
    sol: 'from pathlib import Path\n\ndef buyuk_dosyalar(klasor, esik_bayt):\n    sonuc = []\n    for p in klasor.rglob("*"):\n        if p.is_file():\n            boyut = p.stat().st_size\n            if boyut > esik_bayt:\n                sonuc.append((p.relative_to(klasor).as_posix(), boyut))\n    return sorted(sonuc, key=lambda x: (-x[1], x[0]))\n',
    tests: 'import tempfile\nk = Path(tempfile.mkdtemp())\n(k / "loglar" / "2026").mkdir(parents=True)\n(k / "loglar" / "2026" / "mart.log").write_bytes(b"x" * 500)\n(k / "loglar" / "kucuk.log").write_bytes(b"x" * 10)\n(k / "yedek.zip").write_bytes(b"x" * 900)\n(k / "bos_klasor").mkdir()\nr = buyuk_dosyalar(k, 100)\nassert r == [("yedek.zip", 900), ("loglar/2026/mart.log", 500)], f"alt klasörler dahil, boyuta göre azalan bekleniyordu, gelen {r}"\nassert buyuk_dosyalar(k, 10_000) == [], "eşiği aşan yoksa boş liste"\n',
    hints: ['<code>rglob("*")</code> tüm alt klasörleri özyinelemeli dolaşır; klasörleri <code>is_file()</code> ile ele.', 'Boyut: <code>p.stat().st_size</code>; göreli yol: <code>p.relative_to(klasor).as_posix()</code>.'],
    why: '<code>Path.rglob</code> klasör ağacını gezmenin en kısa yoludur; <code>relative_to</code> ve <code>as_posix</code> çıktıyı işletim sisteminden bağımsız yapar (Windows\'ta da <code>/</code>). Sıralamada boyut eşitliğinde ada göre sıralamak sonucu deterministik kılar. Çok büyük ağaçlarda <code>os.scandir</code>/<code>os.walk</code> daha hızlıdır çünkü dosya bilgisini dizin okurken alır; ama çoğu otomasyon için pathlib yeterli ve okunurdur.',
    tags: ['pathlib', 'rglob', 'stat'],
    min: 6
  },

  {
    id: 'b-283',
    lv: 'orta',
    topic: 'Dosya İşlemleri',
    diff: 1,
    kind: 'bug',
    title: 'Hep son satırı tutan log dosyası',
    q: '<p>Hatayı bul ve düzelt. <code>log_ekle(yol, mesaj)</code> her çağrıda dosyanın <b>sonuna</b> bir satır eklemeli. Şu an dosyada hep yalnızca son mesaj kalıyor.</p>',
    start: 'def log_ekle(yol, mesaj):\n    with open(yol, "w", encoding="utf-8") as f:\n        f.write(mesaj + "\\n")\n',
    sol: 'def log_ekle(yol, mesaj):\n    with open(yol, "a", encoding="utf-8") as f:\n        f.write(mesaj + "\\n")\n',
    tests: 'import tempfile, os\nyol = os.path.join(tempfile.mkdtemp(), "islem.log")\nfor m in ["giriş: ece", "ödeme: 150 TL", "çıkış: ece"]:\n    log_ekle(yol, m)\nwith open(yol, encoding="utf-8") as f:\n    icerik = f.read()\nassert icerik == "giriş: ece\\nödeme: 150 TL\\nçıkış: ece\\n", f"üç satır da korunmalı; \'w\' kipi dosyayı her açılışta sıfırlar. İçerik: {icerik!r}"\n',
    hints: ['<code>open</code>\'ın ikinci argümanı (kip) dosyaya ne yapılacağını belirler.', '<code>"w"</code> dosyayı sıfırlar; ekleme için başka bir kip var.'],
    why: '<code>"w"</code> kipi dosyayı açarken içeriğini siler; <code>"a"</code> (append) imleci sona koyar ve dosya yoksa oluşturur. <code>"x"</code> ise yalnızca yeni dosya oluşturur, varsa hata verir. Gerçek projelerde log için elle dosya açmak yerine <code>logging.FileHandler</code> (varsayılan kipi <code>"a"</code>) ya da boyut/tarih ile döndüren <code>RotatingFileHandler</code> kullanılır.',
    tags: ['open', 'dosya kipi', 'append'],
    min: 2
  },

  {
    id: 'b-284',
    lv: 'orta',
    topic: 'Dosya İşlemleri',
    diff: 2,
    kind: 'tamamla',
    title: 'Parça parça dosya özeti (SHA-256)',
    q: '<p>Bankaya gönderilen toplu ödeme dosyalarının bütünlüğü SHA-256 özetiyle doğrulanıyor. Dosyalar büyük olabileceği için <b>tamamı belleğe alınmadan</b> 4096 baytlık parçalarla okunmalı. <code>dosya_ozeti(yol)</code> fonksiyonundaki boşluğu tamamla: <code>iter(fonksiyon, nöbetçi)</code> biçimini kullan; okuma boş bayt (<code>b""</code>) döndürünce döngü bitsin.</p>',
    start: 'import hashlib\n\ndef dosya_ozeti(yol):\n    h = hashlib.sha256()\n    with open(yol, "rb") as f:\n        for parca in iter(___):\n            h.update(parca)\n    return h.hexdigest()\n',
    sol: 'import hashlib\n\ndef dosya_ozeti(yol):\n    h = hashlib.sha256()\n    with open(yol, "rb") as f:\n        for parca in iter(lambda: f.read(4096), b""):\n            h.update(parca)\n    return h.hexdigest()\n',
    tests: 'import tempfile, os, hashlib as _h\nyol = os.path.join(tempfile.mkdtemp(), "odeme.txt")\nveri = ("TR12;150.00\\n" * 1000).encode("utf-8")\nwith open(yol, "wb") as f:\n    f.write(veri)\nassert dosya_ozeti(yol) == _h.sha256(veri).hexdigest(), "parça parça hesaplanan özet tüm verinin özetine eşit olmalı"\nbos = os.path.join(tempfile.mkdtemp(), "bos.txt")\nopen(bos, "wb").close()\nassert dosya_ozeti(bos) == _h.sha256(b"").hexdigest(), "boş dosyada da çalışmalı"\n',
    hints: ['<code>iter</code>\'in iki argümanlı biçimi: argümansız bir fonksiyonu nöbetçi değer dönene dek çağırır.', '<code>iter(lambda: f.read(4096), b"")</code>'],
    why: '<code>iter(çağrılabilir, nöbetçi)</code>, "nöbetçi dönene kadar çağır" döngüsünü tek satıra indirir; ikili (binary) kipte dosya sonu <code>b""</code> olduğundan nöbetçi de bayt olmalı (<code>""</code> verirsen döngü hiç bitmez). Parça parça okuma bellek kullanımını dosya boyutundan bağımsız kılar. Python 3.11+ aynı iş için <code>hashlib.file_digest(f, "sha256")</code> fonksiyonunu sunar; eski sürümler ve özel işleme (ilerleme çubuğu gibi) için bu kalıp hâlâ standarttır.',
    tags: ['hashlib', 'iter sentinel', 'binary'],
    min: 4
  },

  {
    id: 'b-285',
    lv: 'orta',
    topic: 'SQLite',
    diff: 2,
    t: 'predict',
    kind: 'predict',
    title: 'rowcount, boş sonuç ve SUM',
    q: '<p>Bir bakiye güncellemesinin ardından üç değer yazdırılıyor. Bu kod ne yazdırır?</p>',
    code: 'import sqlite3\n\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE h(no TEXT PRIMARY KEY, bakiye REAL)")\ncon.executemany("INSERT INTO h VALUES (?, ?)", [("TR1", 100), ("TR2", 50)])\ncur = con.execute("UPDATE h SET bakiye = bakiye - 30 WHERE bakiye >= 60")\nprint(cur.rowcount)\nprint(con.execute("SELECT bakiye FROM h WHERE no = \'TR3\'").fetchone())\nprint(con.execute("SELECT SUM(bakiye) FROM h").fetchone())\n',
    o: ['2\nNone\n(120.0,)', '1\n()\n120.0', '1\nNone\n(120.0,)', '1\n[]\n(150.0,)'],
    a: 2,
    hints: ['<code>rowcount</code> UPDATE\'in etkilediği satır sayısıdır.', '<code>fetchone()</code> satır yoksa ne döner? Varsa satır her zaman demettir.'],
    why: 'Yalnızca TR1 (100 ≥ 60) güncellenir: <code>rowcount</code> 1. Eşleşmeyen sorguda <code>fetchone()</code> <code>None</code> döndürür (<code>fetchall()</code> ise <code>[]</code>). Tek sütunlu sonuç bile demettir: <code>(120.0,)</code>; değeri almak için <code>[0]</code> gerekir. "Satır güncellendi mi?" kontrolünde <code>rowcount</code>\'a bakmak, örneğin olmayan hesaba transfer yapılmasını yakalamanın en kolay yoludur.',
    tags: ['sqlite3', 'rowcount', 'fetchone'],
    min: 3
  },

  {
    id: 'b-286',
    lv: 'orta',
    topic: 'SQLite',
    diff: 2,
    t: 'order',
    kind: 'order',
    title: 'HAVING ile büyük şehirler raporu',
    q: '<p>Siparişleri tabloya yükleyip toplam cirosu 50 TL\'yi geçen şehirleri sipariş adediyle yazdıran programı sırala. Çıktı <code>Ankara: 2 sipariş, 160.0 TL</code> olmalı.</p>',
    lines: ['import sqlite3', 'con = sqlite3.connect(":memory:")', 'con.execute("CREATE TABLE siparis(sehir TEXT, tutar REAL)")', 'con.executemany("INSERT INTO siparis VALUES (?, ?)", [("Ankara", 100), ("İzmir", 40), ("Ankara", 60)])', 'for sehir, adet, toplam in con.execute("SELECT sehir, COUNT(*), SUM(tutar) FROM siparis GROUP BY sehir HAVING SUM(tutar) > ?", (50,)):', '    print(f"{sehir}: {adet} sipariş, {toplam} TL")'],
    expect: 'Ankara: 2 sipariş, 160.0 TL\n',
    hint: 'Bağlantı → tablo → veri → sorgu sırası; sorgu sonucu imleç (cursor) olarak doğrudan for ile gezilebilir.',
    hints: ['Bağlantı → tablo → veri → sorgu sırası; sorgu sonucu imleç (cursor) olarak doğrudan for ile gezilebilir.'],
    why: '<code>WHERE</code> satırları gruplamadan önce, <code>HAVING</code> ise grupları toplulaştırmadan sonra süzer; "toplamı 50\'yi geçen şehir" koşulu bu yüzden HAVING\'dedir. Eşik değeri de <code>?</code> parametresiyle verilir. <code>execute</code> bir imleç döndürür ve imleç yinelenebilir olduğundan <code>fetchall</code> çağırmadan satır satır dolaşılabilir; büyük sonuçlarda bellek dostudur.',
    tags: ['sqlite3', 'GROUP BY', 'HAVING'],
    min: 3
  },

  {
    id: 'b-287',
    lv: 'orta',
    topic: 'SQLite',
    diff: 2,
    kind: 'rehberli',
    title: 'Stok girişinde UPSERT',
    q: '<p>Depoya mal kabulünde ürün tabloda yoksa eklenmeli, varsa adedi <b>artırılmalı</b>. <code>stok_ekle(con, sku, adet)</code> fonksiyonunu tek bir SQL ifadesiyle yaz: <code>INSERT ... ON CONFLICT(sku) DO UPDATE SET ...</code> (UPSERT). Tablo: <code>stok(sku TEXT PRIMARY KEY, adet INTEGER)</code>. İşlemi commit et ve güncel adedi döndür.</p>',
    guide: ['Normal bir parametreli <code>INSERT INTO stok(sku, adet) VALUES (?, ?)</code> ile başla.', 'Arkasına <code>ON CONFLICT(sku) DO UPDATE SET adet = adet + excluded.adet</code> ekle; <code>excluded</code> eklenmeye çalışılan satırdır.', '<code>con.commit()</code> çağır.', 'Güncel adedi <code>SELECT adet FROM stok WHERE sku = ?</code> ile okuyup döndür.'],
    example: 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE ziyaret(sayfa TEXT PRIMARY KEY, sayi INTEGER)")\nfor s in ["/", "/urun", "/"]:\n    con.execute("INSERT INTO ziyaret VALUES (?, 1) ON CONFLICT(sayfa) DO UPDATE SET sayi = sayi + 1", (s,))\nprint(con.execute("SELECT * FROM ziyaret ORDER BY sayfa").fetchall())\n',
    start: 'import sqlite3\n\ndef stok_ekle(con, sku, adet):\n    # TODO 1: INSERT ... ON CONFLICT ... DO UPDATE\n    # TODO 2: commit\n    # TODO 3: güncel adedi döndür\n    con.execute("INSERT OR REPLACE INTO stok(sku, adet) VALUES (?, ?)", (sku, adet))\n    return adet\n',
    sol: 'import sqlite3\n\ndef stok_ekle(con, sku, adet):\n    con.execute(\n        "INSERT INTO stok(sku, adet) VALUES (?, ?) "\n        "ON CONFLICT(sku) DO UPDATE SET adet = adet + excluded.adet",\n        (sku, adet),\n    )\n    con.commit()\n    return con.execute("SELECT adet FROM stok WHERE sku = ?", (sku,)).fetchone()[0]\n',
    tests: 'con = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE stok(sku TEXT PRIMARY KEY, adet INTEGER)")\nassert stok_ekle(con, "K-01", 10) == 10, "yeni ürün 10 adetle eklenmeli"\nassert stok_ekle(con, "K-01", 5) == 15, "var olan ürünün adedi artmalı (INSERT OR REPLACE eskiyi siler, toplamaz)"\nstok_ekle(con, "D-02", 3)\nassert con.execute("SELECT COUNT(*) FROM stok").fetchone()[0] == 2, "her SKU tek satır olmalı"\nassert not con.in_transaction, "commit edilmeli"\n',
    hints: ['<code>INSERT OR REPLACE</code> satırı silip yeniden ekler; adet toplanmaz.', '<code>excluded.adet</code> yeni gelen değeri, çıplak <code>adet</code> tablodaki değeri gösterir.', 'Uzun SQL\'i yan yana iki metin olarak yazabilirsin; Python bitişik metinleri birleştirir.'],
    why: 'UPSERT, "var mı kontrol et, sonra ekle ya da güncelle" ikilisini tek atomik ifadeye indirir; iki sorgulu sürümde iki eşzamanlı istek aynı SKU\'yu iki kez eklemeye çalışabilir. <code>excluded</code> sözde tablosu çakışan yeni değerleri verir. <code>INSERT OR REPLACE</code> ise satırı silip yeniden yazdığından diğer sütunları ve tetikleyicileri bozabilir. PostgreSQL\'de sözdizimi aynıdır; MySQL\'de karşılığı <code>ON DUPLICATE KEY UPDATE</code>\'dir.',
    tags: ['sqlite3', 'UPSERT', 'ON CONFLICT'],
    min: 7
  },

  {
    id: 'b-288',
    lv: 'orta',
    topic: 'SQLite',
    diff: 2,
    kind: 'yaz',
    title: 'Siparişi olmayan müşteriler dahil özet',
    q: '<p>Pazarlama, <b>hiç sipariş vermemiş</b> müşterileri de görmek istiyor. Tablolar: <code>musteri(id INTEGER, ad TEXT)</code> ve <code>siparis(musteri_id INTEGER, tutar REAL)</code>. <code>musteri_ozeti(con)</code> fonksiyonunu yaz: her müşteri için <code>(ad, siparis_sayisi, toplam_tutar)</code> döndürsün; siparişi olmayanlarda <code>0</code> ve <code>0.0</code> olsun. Sıra: toplam azalan, eşitse ad artan.</p>',
    start: 'import sqlite3\n\ndef musteri_ozeti(con):\n    # buraya yaz\n    pass\n',
    sol: 'import sqlite3\n\ndef musteri_ozeti(con):\n    sorgu = """\n        SELECT m.ad, COUNT(s.musteri_id), COALESCE(SUM(s.tutar), 0.0) AS toplam\n        FROM musteri m\n        LEFT JOIN siparis s ON s.musteri_id = m.id\n        GROUP BY m.id, m.ad\n        ORDER BY toplam DESC, m.ad\n    """\n    return con.execute(sorgu).fetchall()\n',
    tests: 'con = sqlite3.connect(":memory:")\ncon.executescript("""\n    CREATE TABLE musteri(id INTEGER, ad TEXT);\n    CREATE TABLE siparis(musteri_id INTEGER, tutar REAL);\n    INSERT INTO musteri VALUES (1, \'Ece\'), (2, \'Can\'), (3, \'Ada\'), (4, \'Ali\');\n    INSERT INTO siparis VALUES (1, 100), (1, 50), (2, 150);\n""")\nr = musteri_ozeti(con)\nassert r == [("Can", 1, 150.0), ("Ece", 2, 150.0), ("Ada", 0, 0.0), ("Ali", 0, 0.0)], f"beklenmeyen özet: {r}"\n',
    hints: ['INNER JOIN eşleşmeyen müşterileri düşürür; <code>LEFT JOIN</code> kullan.', '<code>COUNT(*)</code> eşleşmesiz satırı da 1 sayar; <code>COUNT(s.musteri_id)</code> NULL\'ları saymaz.', '<code>SUM</code> hiç satır yoksa NULL döner: <code>COALESCE(SUM(s.tutar), 0.0)</code>.'],
    why: 'LEFT JOIN sol tablonun tüm satırlarını korur, eşleşmeyen sağ sütunları NULL doldurur. Bu yüzden sayımı NULL olmayan bir sağ sütunla yapmak (<code>COUNT(s.musteri_id)</code>) ve toplamı <code>COALESCE</code> ile 0\'a çevirmek gerekir; aksi halde siparişsiz müşteri 1 sipariş ve <code>None</code> tutarla görünür. Alternatif: alt sorguyla (<code>SELECT ... (SELECT COUNT(*) FROM siparis WHERE musteri_id = m.id)</code>) yazmak; küçük tablolarda okunur, büyüklerde genelde JOIN daha verimlidir.',
    tags: ['sqlite3', 'LEFT JOIN', 'COALESCE'],
    min: 7
  },

  {
    id: 'b-289',
    lv: 'orta',
    topic: 'SQLite',
    diff: 1,
    kind: 'bug',
    title: 'Tek sütunlu toplu eklemede bağlama hatası',
    q: '<p>Hatayı bul ve düzelt. <code>kategorileri_yukle(con, adlar)</code> ad listesini <code>kategori(ad TEXT)</code> tablosuna eklemeli. Şu an <code>ProgrammingError: Incorrect number of bindings supplied</code> hatası alınıyor.</p>',
    start: 'import sqlite3\n\ndef kategorileri_yukle(con, adlar):\n    con.executemany("INSERT INTO kategori(ad) VALUES (?)", adlar)\n    con.commit()\n',
    sol: 'import sqlite3\n\ndef kategorileri_yukle(con, adlar):\n    con.executemany("INSERT INTO kategori(ad) VALUES (?)", [(ad,) for ad in adlar])\n    con.commit()\n',
    tests: 'con = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE kategori(ad TEXT)")\nkategorileri_yukle(con, ["Kırtasiye", "Elektronik", "Ev"])\nr = [x[0] for x in con.execute("SELECT ad FROM kategori ORDER BY rowid")]\nassert r == ["Kırtasiye", "Elektronik", "Ev"], "her ad tek elemanlı demet olarak verilmeli: [(ad,), ...]"\n',
    hints: ['<code>executemany</code> her eleman için bir parametre DİZİSİ bekler.', 'Metin de bir dizidir: "Ev" iki parametre (E, v) sayılır.'],
    why: '<code>executemany</code> listedeki her elemanı parametre dizisi olarak açar; "Kırtasiye" bir metin olduğu için 9 karakterlik dizi sayılır ve tek <code>?</code> ile uyuşmaz. Her adı tek elemanlı demete sarmak gerekir: <code>(ad,)</code> (sondaki virgül şart; <code>(ad)</code> sadece paranteze alınmış metindir). Aynı tuzak tek parametreli <code>execute("... = ?", (deger,))</code> çağrısında da vardır.',
    tags: ['sqlite3', 'executemany', 'tek elemanlı demet'],
    min: 2
  },

  {
    id: 'b-290',
    lv: 'orta',
    topic: 'Veri Yapıları',
    diff: 1,
    t: 'predict',
    kind: 'predict',
    title: 'Kanal bazlı müşteri kümeleri',
    q: '<p>Web ve mağaza müşterileri kümelerde tutuluyor. Bu kod ne yazdırır?</p>',
    code: 'web = {"Ece", "Can", "Ali"}\nmagaza = {"Can", "Ada"}\nprint(sorted(web & magaza), sorted(web - magaza), sorted(web ^ magaza))\n',
    o: ['[\'Can\'] [\'Ali\', \'Ece\'] [\'Ada\', \'Ali\', \'Can\', \'Ece\']', '[\'Can\'] [\'Ada\', \'Ali\', \'Ece\'] [\'Ada\', \'Ali\', \'Ece\']', '[\'Can\'] [\'Ali\', \'Ece\'] [\'Ada\', \'Ali\', \'Ece\']', '[\'Ada\', \'Ali\', \'Can\', \'Ece\'] [\'Ali\', \'Ece\'] [\'Can\']'],
    a: 2,
    hints: ['<code>&amp;</code> kesişim, <code>-</code> fark, <code>^</code> simetrik fark (yalnızca birinde olanlar).'],
    why: 'Kesişim iki kanalda da alışveriş yapan Can\'dır. <code>web - magaza</code> yalnızca web\'de olanlar (Ali, Ece). Simetrik fark <code>^</code>, iki kümeden yalnızca birinde olanlar: Ada, Ali, Ece (Can ikisinde de olduğu için dışarıda). Küme işlemleri ortalama O(len) sürede çalışır; iki müşteri listesini iç içe döngülerle karşılaştırmaktan çok daha hızlıdır.',
    tags: ['set', 'kesişim', 'simetrik fark'],
    min: 2
  }
);
})(window);
