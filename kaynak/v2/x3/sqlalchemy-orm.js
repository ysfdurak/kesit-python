/* Kesit Python — 'sqlalchemy-orm' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'sqlalchemy-orm',
    min: 25,
    needs: ['sqlite3'],
    html: `<p>Derste Alembic'i yalnız komutlarıyla gördün ve async'e bir paragrafla değindik. Bu bölüm ikisini de gerçek iş akışına taşıyor: bir migration dosyasının içi, veri taşıyan migration, canlı sistemde kesintisiz şema değişikliği ve FastAPI gibi async çatılarda SQLAlchemy.</p>
<h2>Bir migration dosyasının anatomisi</h2>
<p><code>alembic revision --autogenerate -m "musteriye telefon ekle"</code> komutu <code>migrations/versions/</code> altında bir Python dosyası üretir. Alembic sürümleri bir <b>zincir</b> olarak tutar: her dosya kendi kimliğini (<code>revision</code>) ve bir öncekini (<code>down_revision</code>) bilir. Veritabanında ise <code>alembic_version</code> adlı tek satırlık bir tablo, şemanın şu an hangi halkada olduğunu saklar.</p>
<pre class="code">"""musteriye telefon ekle"""
from alembic import op
import sqlalchemy as sa

revision = "b7c2e1"
down_revision = "a41f09"      # bir önceki halka; ilk migration'da None

def upgrade() -&gt; None:
    op.add_column("musteri", sa.Column("telefon", sa.String(20), nullable=True))
    op.create_index("ix_musteri_telefon", "musteri", ["telefon"])

def downgrade() -&gt; None:
    op.drop_index("ix_musteri_telefon", table_name="musteri")
    op.drop_column("musteri", "telefon")</pre>
<p>Günlük akış şöyledir: modeli değiştir, <code>revision --autogenerate</code> çalıştır, üretilen dosyayı <b>satır satır oku</b> (autogenerate bir taslaktır), yerelde <code>upgrade head</code> ve hemen ardından <code>downgrade -1</code> ile geri alınabildiğini dene, dosyayı modelle aynı commit'e koy. CI'da boş bir veritabanına <code>alembic upgrade head</code> çalıştırmak, zincirin kırılmadığını kanıtlar. İki geliştirici aynı halkadan dal açarsa "iki head" oluşur; <code>alembic heads</code> bunu gösterir, <code>alembic merge</code> ile birleştirilir.</p>
<div class="tbl-wrap"><table><tr><th>autogenerate şunu yakalar</th><th>Şunu yakalamaz ya da yanlış anlar</th></tr>
<tr><td>Tablo ve sütun ekleme/silme</td><td>Sütun yeniden adlandırma (sil + ekle sanır, veri gider)</td></tr>
<tr><td>nullable değişikliği, indeks, yabancı anahtar</td><td>Tablo adı değişikliği, CHECK kısıtlarının çoğu</td></tr>
<tr><td>Sütun türü (<code>compare_type</code> açıksa)</td><td>Veri dönüşümü: eski değerleri yeni sütuna taşımak</td></tr></table></div>
<h2>Veri migration'ı</h2>
<p>Şema değişikliği bazen veriyi de taşımayı gerektirir: <code>ad_soyad</code> sütununu <code>ad</code> ve <code>soyad</code>'a bölmek, şehir adından şehir kodu türetmek gibi. Bunu migration içinde <code>op.execute</code> ile SQL olarak yaz; ORM modellerini import etme, çünkü model ileride değişir ve eski migration bozulur. Büyük tablolarda tek dev <code>UPDATE</code> yerine parti parti güncelle ki kilitler kısa sürsün. SQLite <code>ALTER TABLE</code> desteği sınırlı olduğundan Alembic orada <code>op.batch_alter_table</code> ile tabloyu yeniden kurar.</p>
<p>Aşağıdaki çalıştırılabilir örnek Alembic'in yaptığını sqlite3 ile taklit ediyor: sürüm tablosu, sırayla uygulanan halkalar ve bir veri migration'ı. Veri, Anadolu Market'in gerçek <code>customers</code> tablosu.</p>
<pre class="py">import veri
conn = veri.baglan("anadolu_market", tablolar=["customers"])
conn.execute("CREATE TABLE alembic_version (version_num TEXT)")
conn.execute("INSERT INTO alembic_version VALUES ('base')")

KODLAR = {"İstanbul": 34, "Ankara": 6, "İzmir": 35, "Bursa": 16}

def m001_upgrade(c):
    c.execute("ALTER TABLE customers ADD COLUMN plaka INTEGER")    # 1) boş (nullable) sütun

def m002_upgrade(c):                                              # 2) veri migration'ı
    for sehir, kod in KODLAR.items():
        c.execute("UPDATE customers SET plaka = ? WHERE city = ?", (kod, sehir))

zincir = [("m001", m001_upgrade), ("m002", m002_upgrade)]
for rev, fn in zincir:
    with conn:                                   # her halka kendi transaction'ında
        fn(conn)
        conn.execute("UPDATE alembic_version SET version_num = ?", (rev,))

print(conn.execute("SELECT version_num FROM alembic_version").fetchone()[0])
print(conn.execute("SELECT plaka, COUNT(*) FROM customers GROUP BY plaka ORDER BY plaka").fetchall())</pre>
<p><code>None</code> grubu, kodu tabloda olmayan şehirleri ve şehri boş müşterileri gösteriyor. Gerçek migration'da bu sayıyı loglar, sıfır değilse kararı veri sahibine bırakırsın.</p>
<h2>Sıfır kesintili migration: genişlet ve daralt</h2>
<p>Canlıda dağıtım sırasında eski ve yeni kod bir süre <b>aynı anda</b> çalışır (sırayla güncellenen konteynerler). Bu yüzden her şema değişikliği hem eski hem yeni kodla uyumlu olmalı. Kalıbın adı genişlet ve daralt (expand and contract):</p>
<div class="steps-list"><ol>
<li><b>Genişlet:</b> yeni sütunu nullable ya da varsayılanlı ekle. Eski kod onu görmez, bozulmaz.</li>
<li><b>Çift yaz:</b> yeni kod hem eski hem yeni sütuna yazar.</li>
<li><b>Geri doldur (backfill):</b> eski satırları partiler hâlinde doldur.</li>
<li><b>Geçiş:</b> okumalar yeni sütuna geçer; doğrulama yap.</li>
<li><b>Daralt:</b> ayrı bir sürümde NOT NULL ekle, eski sütunu sil.</li>
</ol></div>
<div class="warn"><b>Tek adımda yeniden adlandırma</b><code>ALTER TABLE ... RENAME COLUMN</code> şemayı bir anda değiştirir; o sırada çalışan eski kod eski adı arar ve hata verir. Kesinti istemiyorsan yeniden adlandırmayı yukarıdaki beş adıma böl. PostgreSQL'de büyük tabloya indeks eklerken de <code>CREATE INDEX CONCURRENTLY</code> kullan (Alembic'te <code>postgresql_concurrently=True</code>, transaction dışında).</div>
<h2>Async SQLAlchemy</h2>
<p>FastAPI gibi async çatılarda veritabanı çağrısı beklenirken olay döngüsü başka istekleri işleyebilsin diye async sürücü kullanılır: PostgreSQL için <code>asyncpg</code>, SQLite için <code>aiosqlite</code>. API, bildiğin 2.0 API'sinin <code>await</code>'li hâlidir.</p>
<pre class="code">from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import selectinload

engine = create_async_engine("postgresql+asyncpg://app:gizli@db/market", pool_size=10)
Oturum = async_sessionmaker(engine, expire_on_commit=False)

async def musteri_siparisleri(musteri_id: int):
    async with Oturum() as s:
        sorgu = (select(Musteri)
                 .where(Musteri.id == musteri_id)
                 .options(selectinload(Musteri.siparisler)))   # tembel yükleme yok: önceden yükle
        m = (await s.execute(sorgu)).scalar_one()
        return [x.tutar for x in m.siparisler]

async def tablolari_kur():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)   # senkron API'yi async içinde çalıştır</pre>
<div class="note"><b>Kendi bilgisayarında dene</b><code>pip install "sqlalchemy[asyncio]" aiosqlite alembic</code> ile kur; adres olarak <code>sqlite+aiosqlite:///magaza.db</code> kullan. Tarayıcıda async sürücü yok; aşağıdaki alıştırmalar kalıbı asyncio ve sahte oturumla çalıştırıyor.</div>
<p>Üç kural akılda kalsın. Bir: <code>AsyncSession</code> eşzamanlı görevler arasında <b>paylaşılmaz</b>; <code>asyncio.gather</code> ile paralel sorgu atacaksan her göreve ayrı oturum aç. İki: async'te tembel yükleme <code>MissingGreenlet</code> hatası verir; ilişkileri <code>selectinload</code> ile önceden yükle. Üç: <code>expire_on_commit=False</code> vermezsen commit sonrası özniteliğe erişmek gizli bir sorgu tetikler ve yine aynı hataya düşersin.</p>
<div class="note"><b>Gerçek işte</b>Ekiplerde migration dosyası kod incelemesinin en dikkatli bakılan parçasıdır. İncelemede sorulan sorular hep aynıdır: downgrade gerçekten çalışıyor mu, büyük tabloyu kilitler mi, eski kod bu şemayla çalışmaya devam eder mi, veri kaybı var mı?</div>`,
    ex: [
      {
        t: 'mc',
        id: 'sqlalchemy-orm-y1',
        stage: 'Isınma',
        q: 'Modelde <code>ad</code> sütununun adını <code>tam_ad</code> yaptın ve <code>alembic revision --autogenerate</code> çalıştırdın. Üretilen dosyada büyük olasılıkla ne görürsün?',
        o: [
          'Tek bir <code>op.alter_column(..., new_column_name=...)</code> satırı',
          '<code>ad</code> sütununu silen ve <code>tam_ad</code> ekleyen iki işlem',
          'Hiçbir işlem; autogenerate ad değişikliğini görmez',
          'Tabloyu silip yeniden oluşturan tek bir <code>op.drop_table</code>'
        ],
        a: 1,
        why: 'Autogenerate yalnız modeli şemayla karşılaştırır; adı değişen sütunu "biri gitmiş, biri gelmiş" diye yorumlar. Dosyayı olduğu gibi uygularsan ad sütunundaki veri kaybolur. Elle op.alter_column ile düzeltmen ya da genişlet-daralt kalıbını uygulaman gerekir.'
      },
      {
        t: 'mc',
        id: 'sqlalchemy-orm-y2',
        stage: 'Isınma',
        q: 'Canlı sistemde <code>siparis</code> tablosuna zorunlu (<code>NOT NULL</code>) <code>kanal</code> sütunu eklemek istiyorsun. Kesintisiz yol hangisi?',
        o: [
          'Önce NOT NULL sütunu ekle, sonra kodu dağıt',
          'Kodu dağıt, sonra NOT NULL sütunu ekle',
          'Nullable ekle, yeni kod yazsın, eskileri doldur, sonra NOT NULL yap',
          'Tabloyu yeni adla kopyalayıp eski tabloyla tek seferde yer değiştir'
        ],
        a: 2,
        why: 'NOT NULL sütun eklendiği anda eski kodun INSERT\'leri hata verir; yeni kod önce dağıtılırsa olmayan sütuna yazmaya çalışır. Genişlet-daralt kalıbında sütun önce nullable eklenir, veri doldurulur, kısıt en son ayrı bir sürümde eklenir.'
      },
      {
        t: 'predict',
        id: 'sqlalchemy-orm-y3',
        stage: 'Kodu oku',
        q: 'Alembic zincirini taklit eden bu kod ne yazdırır?',
        o: ['[\'c3\', \'d4\']', '[\'d4\', \'c3\']', '[\'b2\', \'c3\', \'d4\']', '[\'a1\', \'b2\', \'c3\', \'d4\']'],
        a: 0,
        code: 'zincir = {"a1": None, "b2": "a1", "c3": "b2", "d4": "c3"}\nmevcut = "b2"\nyol = []\nr = "d4"\nwhile r != mevcut:\n    yol.append(r)\n    r = zincir[r]\nprint(list(reversed(yol)))\n',
        why: 'Döngü head\'den (d4) başlayıp down_revision bağlantılarıyla mevcut halkaya (b2) kadar geri yürür: d4, c3. b2 zaten uygulandığı için listeye girmez. Ters çevrilince uygulama sırası çıkar: c3, sonra d4.'
      },
      {
        t: 'predict',
        id: 'sqlalchemy-orm-y4',
        stage: 'Kodu oku',
        q: 'SQLite\'ta bu migration ne yazdırır?',
        o: ['eklendi', '[(1, \'Ece\', None)]', '[(1, \'Ece\', \'bilinmiyor\')]', '[(1, \'Ece\')]'],
        a: 2,
        code: 'import sqlite3\nc = sqlite3.connect(":memory:")\nc.execute("CREATE TABLE m (id INTEGER, ad TEXT)")\nc.execute("INSERT INTO m VALUES (1, \'Ece\')")\ntry:\n    c.execute("ALTER TABLE m ADD COLUMN sehir TEXT NOT NULL")\n    print("eklendi")\nexcept sqlite3.OperationalError:\n    c.execute("ALTER TABLE m ADD COLUMN sehir TEXT NOT NULL DEFAULT \'bilinmiyor\'")\n    print(c.execute("SELECT * FROM m").fetchall())\n',
        why: 'Var olan satırlar yeni sütunda NULL alacağı için varsayılansız NOT NULL sütun eklenemez; SQLite OperationalError verir. Varsayılan verilince mevcut satır o değerle doldurulur.'
      },
      {
        t: 'order',
        id: 'sqlalchemy-orm-y5',
        stage: 'Kodu oku',
        needs: ['sqlite3'],
        q: '<p>Anadolu Market <code>customers</code> tablosuna genişlet ve geri doldur adımlarıyla <code>alan</code> (e-posta alan adı) sütunu ekleyen satırları sırala. Program boş kalan satır sayısını yazdırır.</p>',
        lines: [
          'import veri',
          'conn = veri.baglan("anadolu_market", tablolar=["customers"])',
          'conn.execute("ALTER TABLE customers ADD COLUMN alan TEXT")',
          'conn.execute("UPDATE customers SET alan = substr(email, instr(email, \'@\') + 1) WHERE email IS NOT NULL")',
          'bos = conn.execute("SELECT COUNT(*) FROM customers WHERE alan IS NULL").fetchone()[0]',
          'print("boş kalan:", bos)'
        ],
        expect: 'boş kalan: 11\n',
        hint: 'Önce sütun eklenmeli (genişlet), sonra doldurulmalı (backfill), en son doğrulanmalı.',
        why: 'Sütun yokken UPDATE hata verir; doldurmadan önce sayarsan 150 boş görürsün. E-postası olmayan 11 müşteri NULL kalır; bu sayıyı loglamak veri migration\'ının doğrulama adımıdır.'
      },
      {
        t: 'code',
        id: 'sqlalchemy-orm-y6',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Alembic\'in <code>upgrade head</code> planını hesapla. <code>yukseltme_plani(zincir, mevcut)</code> yaz: <code>zincir</code> sözlüğü her revizyonu <code>down_revision</code>\'ına eşler (ilk halkanın değeri <code>None</code>). Head, hiçbir revizyonun <code>down_revision</code>\'ı olmayan revizyondur. <code>mevcut</code> veritabanındaki sürümdür (<code>None</code> ise hiç migration uygulanmamış). Uygulanacak revizyonları eski→yeni sırada liste döndür. Birden çok head varsa <code>ValueError("birden çok head")</code> fırlat.</p>',
        guide: [
          'Tüm down_revision değerlerinden bir küme yap; zincirde olup bu kümede olmayanlar head\'dir.',
          'Head sayısı 1 değilse ValueError fırlat.',
          'Head\'den başla, mevcut\'a gelene kadar zincir[r] ile geri yürü, her adımı listeye ekle.',
          'Listeyi ters çevirip döndür.'
        ],
        example: 'ebeveyn = {"ali": None, "veli": "ali", "can": "veli"}\nr, soy = "can", []\nwhile r is not None:\n    soy.append(r)\n    r = ebeveyn[r]\nprint(soy)\n',
        start: 'def yukseltme_plani(zincir, mevcut):\n    onceller = set(zincir.values())\n    # TODO: head\'leri bul (önceller içinde olmayan revizyonlar)\n    headler = []\n    # TODO: birden çok head varsa ValueError\n    plan = []\n    # TODO: head\'den mevcut\'a kadar geri yürü\n    return plan\n',
        sol: 'def yukseltme_plani(zincir, mevcut):\n    onceller = set(zincir.values())\n    headler = [r for r in zincir if r not in onceller]\n    if len(headler) != 1:\n        raise ValueError("birden çok head")\n    plan = []\n    r = headler[0]\n    while r != mevcut:\n        plan.append(r)\n        r = zincir[r]\n    return list(reversed(plan))\n',
        tests: 'z = {"a1": None, "b2": "a1", "c3": "b2", "d4": "c3"}\nassert yukseltme_plani(z, "b2") == ["c3", "d4"], "b2\'den sonra c3 ve d4 uygulanmalı"\nassert yukseltme_plani(z, None) == ["a1", "b2", "c3", "d4"], "Boş veritabanında tüm zincir uygulanır"\nassert yukseltme_plani(z, "d4") == [], "Zaten head\'deysen plan boş olmalı"\ntry:\n    yukseltme_plani({"a1": None, "b2": "a1", "x9": "a1"}, "a1")\n    assert False, "İki dal aynı halkadan ayrılınca ValueError beklenir (alembic merge gerekir)"\nexcept ValueError:\n    pass\n',
        hints: ['Head, başka hiçbir revizyonun önceli olmayan halkadır.', 'set(zincir.values()) öncelleri verir; head = zincirde olup orada olmayan.', 'while r != mevcut: plan.append(r); r = zincir[r]'],
        why: 'Alembic sürüm dosyalarını bu bağlı liste mantığıyla okur. İki head, iki geliştiricinin aynı halkadan dal açtığını gösterir; alembic merge ile ortak bir halka eklenene kadar upgrade head çalışmaz.'
      },
      {
        t: 'code',
        id: 'sqlalchemy-orm-y7',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['sqlite3'],
        q: '<p>Küçük bir migration çalıştırıcısı yaz: <code>calistir(conn, migrationlar, hedef)</code>. <code>migrationlar</code> sıralı bir listedir: <code>(rev, upgrade_sql, downgrade_sql)</code>. Sürüm <code>alembic_version(version_num)</code> tablosunda tek satırdır; tablo yoksa oluştur ve <code>\'base\'</code> yaz. <code>hedef</code> listedeki bir rev ya da <code>\'base\'</code> olabilir: ileri gerekiyorsa sıradaki upgrade\'leri, geri gerekiyorsa downgrade\'leri ters sırada uygula. Her adım kendi transaction\'ında çalışsın ve sürüm her adımda güncellensin. Fonksiyon uygulanan rev\'lerin listesini döndürsün.</p>',
        start: 'def calistir(conn, migrationlar, hedef):\n    # alembic_version tablosu, ileri ve geri yön\n    pass\n',
        sol: 'def calistir(conn, migrationlar, hedef):\n    conn.execute("CREATE TABLE IF NOT EXISTS alembic_version (version_num TEXT)")\n    if conn.execute("SELECT COUNT(*) FROM alembic_version").fetchone()[0] == 0:\n        conn.execute("INSERT INTO alembic_version VALUES (\'base\')")\n        conn.commit()\n    sira = ["base"] + [m[0] for m in migrationlar]\n    mevcut = conn.execute("SELECT version_num FROM alembic_version").fetchone()[0]\n    i, j = sira.index(mevcut), sira.index(hedef)\n    uygulanan = []\n    if j > i:\n        for rev, up, down in migrationlar[i:j]:\n            with conn:\n                conn.execute(up)\n                conn.execute("UPDATE alembic_version SET version_num = ?", (rev,))\n            uygulanan.append(rev)\n    else:\n        for k in range(i, j, -1):\n            rev, up, down = migrationlar[k - 1]\n            with conn:\n                conn.execute(down)\n                conn.execute("UPDATE alembic_version SET version_num = ?", (sira[k - 1],))\n            uygulanan.append(rev)\n    return uygulanan\n',
        tests: 'import sqlite3\nc = sqlite3.connect(":memory:")\nM = [("r1", "CREATE TABLE urun (id INTEGER)", "DROP TABLE urun"),\n     ("r2", "ALTER TABLE urun ADD COLUMN fiyat REAL", "ALTER TABLE urun DROP COLUMN fiyat"),\n     ("r3", "CREATE INDEX ix_fiyat ON urun(fiyat)", "DROP INDEX ix_fiyat")]\nsurum = lambda: c.execute("SELECT version_num FROM alembic_version").fetchone()[0]\nassert calistir(c, M, "r3") == ["r1", "r2", "r3"], "base\'den r3\'e üç migration uygulanmalı"\nassert surum() == "r3", "Sürüm tablosu r3 göstermeli"\nassert calistir(c, M, "r1") == ["r3", "r2"], "Geri giderken önce r3, sonra r2 geri alınır"\nassert surum() == "r1", "Downgrade sonrası sürüm r1 olmalı"\ncols = [r[1] for r in c.execute("PRAGMA table_info(urun)")]\nassert cols == ["id"], "r2 geri alınınca fiyat sütunu silinmiş olmalı"\nassert calistir(c, M, "base") == ["r1"], "base\'e inince r1 geri alınır"\nassert c.execute("SELECT COUNT(*) FROM sqlite_master WHERE name=\'urun\'").fetchone()[0] == 0, "urun tablosu silinmiş olmalı"\nassert calistir(c, M, "base") == [], "Zaten hedefteysen hiçbir şey yapılmamalı"\n',
        hints: [
          'Sıra listesi ["base", "r1", "r2", ...] kur; mevcut ve hedefin indekslerini karşılaştır.',
          'İleri: migrationlar[i:j]; geri: k = i, i-1, ..., j+1 için migrationlar[k-1]\'in downgrade\'i ve sürüm sira[k-1].',
          'with conn: bloğu adımı ve sürüm güncellemesini aynı transaction\'da tutar.'
        ],
        why: 'Alembic\'in çekirdeği budur: sıralı halkalar, tek satırlık sürüm tablosu ve her adımın atomik uygulanması. Adım ile sürüm güncellemesi aynı transaction\'da olmazsa yarıda kalan bir dağıtım şemayla sürüm tablosunu birbirinden koparır.'
      },
      {
        t: 'code',
        id: 'sqlalchemy-orm-y8',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        needs: ['sqlite3'],
        q: '<p>Hatayı bul ve düzelt. <code>plaka_ekle(conn)</code> Anadolu Market <code>customers</code> tablosuna zorunlu <code>plaka</code> sütunu ekleyip bilinen şehirleri doldurmalı; bilinmeyen şehirler <code>0</code> almalı. Fonksiyon SQLite\'ta hata veriyor. Genişlet-daralt mantığıyla düzelt: sütunu önce boş değerlere izin vererek ekle, doldur, sonra kalan boşları 0 yap. Fonksiyon doldurulan (0 olmayan) satır sayısını döndürsün.</p>',
        start: 'KODLAR = {"İstanbul": 34, "Ankara": 6, "İzmir": 35}\n\ndef plaka_ekle(conn):\n    conn.execute("ALTER TABLE customers ADD COLUMN plaka INTEGER NOT NULL")\n    for sehir, kod in KODLAR.items():\n        conn.execute("UPDATE customers SET plaka = ? WHERE city = ?", (kod, sehir))\n    conn.commit()\n    return conn.execute("SELECT COUNT(*) FROM customers WHERE plaka != 0").fetchone()[0]\n',
        sol: 'KODLAR = {"İstanbul": 34, "Ankara": 6, "İzmir": 35}\n\ndef plaka_ekle(conn):\n    conn.execute("ALTER TABLE customers ADD COLUMN plaka INTEGER")\n    for sehir, kod in KODLAR.items():\n        conn.execute("UPDATE customers SET plaka = ? WHERE city = ?", (kod, sehir))\n    conn.execute("UPDATE customers SET plaka = 0 WHERE plaka IS NULL")\n    conn.commit()\n    return conn.execute("SELECT COUNT(*) FROM customers WHERE plaka != 0").fetchone()[0]\n',
        tests: 'import veri\nc = veri.baglan("anadolu_market", tablolar=["customers"])\nn = plaka_ekle(c)\nassert n == 59, f"İstanbul (28) + Ankara (15) + İzmir (16) = 59 satır dolmalı, gelen {n}"\nassert c.execute("SELECT COUNT(*) FROM customers WHERE plaka IS NULL").fetchone()[0] == 0, "Hiç NULL kalmamalı; bilinmeyenler 0 olmalı"\nassert c.execute("SELECT COUNT(*) FROM customers WHERE plaka = 0").fetchone()[0] == 91, "Kalan 91 müşteri 0 almalı"\n',
        hints: ['Hata mesajı: varsayılansız NOT NULL sütun eklenemez.', 'Sütunu NOT NULL olmadan ekle, doldurduktan sonra boşları 0 yap.', 'UPDATE customers SET plaka = 0 WHERE plaka IS NULL'],
        why: 'Var olan satırlar yeni sütunda NULL olacağından NOT NULL kısıtı ekleme anında sağlanamaz. Önce genişlet, sonra doldur; kısıtı gerçek sistemde ayrı bir migration ile (SQLite\'ta batch_alter_table ile) eklersin.'
      },
      {
        t: 'code',
        id: 'sqlalchemy-orm-y9',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Async kalıbı: <code>AsyncSession</code> eşzamanlı görevler arasında paylaşılmaz. Sahte bir <code>Oturum</code> sınıfı hazır: aynı oturum aynı anda iki sorgu çalıştırırsa <code>RuntimeError</code> verir. <code>async def toplu_ciro(oturum_fabrikasi, musteri_idleri)</code> yaz: her müşteri için <b>ayrı oturum</b> açıp (<code>async with oturum_fabrikasi() as s</code>) <code>await s.ciro(mid)</code> çağırsın, tüm sorguları <code>asyncio.gather</code> ile eşzamanlı çalıştırsın ve sonuçları <code>{musteri_id: ciro}</code> sözlüğü olarak döndürsün.</p>',
        start: 'import asyncio\n\nCIRO = {1: 1250.0, 2: 980.5, 3: 0.0, 4: 3100.0}\n\nclass Oturum:\n    acilan = 0\n    aktif = 0\n    en_fazla = 0\n    def __init__(self):\n        self.mesgul = False\n        Oturum.acilan += 1\n    async def __aenter__(self):\n        return self\n    async def __aexit__(self, *a):\n        return False\n    async def ciro(self, mid):\n        if self.mesgul:\n            raise RuntimeError("Bu oturum başka bir sorguyla meşgul")\n        self.mesgul = True\n        Oturum.aktif += 1\n        Oturum.en_fazla = max(Oturum.en_fazla, Oturum.aktif)\n        await asyncio.sleep(0.01)\n        Oturum.aktif -= 1\n        self.mesgul = False\n        return CIRO[mid]\n\nasync def toplu_ciro(oturum_fabrikasi, musteri_idleri):\n    async with oturum_fabrikasi() as s:\n        sonuclar = await asyncio.gather(*(s.ciro(m) for m in musteri_idleri))\n    return dict(zip(musteri_idleri, sonuclar))\n',
        sol: 'import asyncio\n\nCIRO = {1: 1250.0, 2: 980.5, 3: 0.0, 4: 3100.0}\n\nclass Oturum:\n    acilan = 0\n    aktif = 0\n    en_fazla = 0\n    def __init__(self):\n        self.mesgul = False\n        Oturum.acilan += 1\n    async def __aenter__(self):\n        return self\n    async def __aexit__(self, *a):\n        return False\n    async def ciro(self, mid):\n        if self.mesgul:\n            raise RuntimeError("Bu oturum başka bir sorguyla meşgul")\n        self.mesgul = True\n        Oturum.aktif += 1\n        Oturum.en_fazla = max(Oturum.en_fazla, Oturum.aktif)\n        await asyncio.sleep(0.01)\n        Oturum.aktif -= 1\n        self.mesgul = False\n        return CIRO[mid]\n\nasync def toplu_ciro(oturum_fabrikasi, musteri_idleri):\n    async def tek(mid):\n        async with oturum_fabrikasi() as s:\n            return await s.ciro(mid)\n    sonuclar = await asyncio.gather(*(tek(m) for m in musteri_idleri))\n    return dict(zip(musteri_idleri, sonuclar))\n',
        tests: 'Oturum.acilan = 0\nOturum.en_fazla = 0\nsonuc = asyncio.run(toplu_ciro(Oturum, [1, 2, 3, 4]))\nassert sonuc == {1: 1250.0, 2: 980.5, 3: 0.0, 4: 3100.0}, f"Sonuç sözlüğü yanlış: {sonuc}"\nassert Oturum.acilan == 4, f"Her görev kendi oturumunu açmalı (4 beklenir), açılan: {Oturum.acilan}"\nassert Oturum.en_fazla == 4, "Dört sorgu aynı anda çalışmalı (gather); sırayla await etmek eşzamanlılığı yok eder"\nassert asyncio.run(toplu_ciro(Oturum, [])) == {}, "Boş liste boş sözlük döndürmeli"\n',
        hints: [
          'Paylaşılan oturumda ikinci sorgu ilki bitmeden başlıyor; hata bu yüzden.',
          'Tek müşteriyi işleyen iç bir async fonksiyon yaz; oturumu onun içinde aç.',
          'sonuclar = await asyncio.gather(*(tek(m) for m in musteri_idleri))'
        ],
        why: 'Gerçek AsyncSession da tek bir bağlantı üzerinde sırayla çalışır; paylaşılınca "another operation is in progress" hatası alırsın. Her eşzamanlı görev kendi oturumunu açar; bağlantıları havuz (pool) yönetir.'
      }
    ],
    faq: [
      {
        q: 'Migration dosyalarını sonradan düzenleyebilir miyim?',
        a: 'Henüz hiçbir ortama (staging, prod, takım arkadaşının makinesi) uygulanmadıysa evet. Uygulandıktan sonra düzenlersen o ortamlar değişikliği hiç görmez, çünkü Alembic yalnız sürüm numarasına bakar. Uygulanmış bir migration\'ı düzeltmek için yeni bir migration yaz.'
      },
      {
        q: 'Async SQLAlchemy her zaman daha mı hızlı?',
        a: 'Hayır. Tek bir sorgu async ile hızlanmaz; kazanç, aynı süreçte çok sayıda eşzamanlı isteğin veritabanını beklerken birbirini bloklamamasıdır. Toplu iş, betik ve Django/Flask gibi senkron uygulamalarda senkron SQLAlchemy daha basit ve yeterlidir.'
      }
    ],
    mistakes: [
      {
        why: 'Migration içinde uygulama modelini import etmek, model ileride değişince eski migration\'ı bozar. Veri migration\'larında op.execute ile SQL ya da migration içinde tanımlanan hafif tablo nesnesi kullan.',
        bad: 'def upgrade():\n    from app.models import Musteri\n    for m in session.query(Musteri): ...',
        good: 'def upgrade():\n    op.execute("UPDATE musteri SET plaka = 34 WHERE sehir = \'İstanbul\'")'
      }
    ]
  }
);
})(window);
