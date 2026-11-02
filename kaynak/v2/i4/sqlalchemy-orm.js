/* Kesit Python v2 — sqlalchemy-orm */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{id: 'sqlalchemy-orm',
  lv: 'ileri',
  mod: 'Mimari',
  min: 60,
  title: 'SQLAlchemy 2.0: Core, ORM, ilişkiler ve transaction',
  sum: 'Engine ve bağlı parametrelerle güvenli SQL çalıştırır, Core ile sorgu kurar, Mapped/mapped_column ile ORM modelleri ve ilişkiler tanımlar, Session ile CRUD yapar, N+1 problemini eager loading ile çözer, transaction ve Alembic migration mantığını öğrenirsin.',
  goals: ['Engine kurar, text() ve bağlı parametrelerle güvenli SQL çalıştırabilirim.', 'Core ile Table, select, insert ve GROUP BY sorgularını Python ifadesiyle yazabilirim.', 'DeclarativeBase, Mapped, mapped_column ve relationship ile bire-çok modeller tanımlayabilirim.', 'Session ile CRUD yapar, transaction\'ı begin/commit/rollback ile yönetirim.', 'N+1 problemini sorgu sayarak teşhis eder, selectinload/joinedload ile çözerim.'],
  body: `
<h2>Neden önemli?</h2>
<p>sqlite3 ile Python dersinde veritabanına doğrudan SQL metni gönderdin. Küçük betiklerde bu yeterlidir. Ama gerçek bir uygulamada onlarca tablo, yüzlerce sorgu, farklı veritabanları (geliştirmede SQLite, üretimde PostgreSQL) ve iş nesneleri (müşteri, sipariş, hesap) vardır. Her sorgunun sonucunu elle sözlüğe çevirmek, her tabloda aynı INSERT kalıbını tekrar yazmak, bağlantıları ve transaction'ları doğru yönetmek zorlaşır.</p>
<p><b>SQLAlchemy</b>, Python dünyasının en yaygın veritabanı araç takımıdır. İki katmanı vardır: <b>Core</b> (SQL'i Python ifadeleriyle kuran, veritabanından bağımsız katman) ve <b>ORM</b> (Object Relational Mapper: tablo satırlarını Python nesnelerine eşleyen katman). Flask, FastAPI, Airflow ve pandas (<code>read_sql</code>) gibi araçların hepsi SQLAlchemy ile konuşur. Bu derste 2.0 sürümünün modern API'sini kullanacağız; eski <code>session.query(...)</code> tarzını da yerinde göreceksin.</p>
<div class="tip"><b>Kesit SQL'e köprü</b>Kesit SQL'de öğrendiğin SELECT, WHERE, JOIN, GROUP BY ve transaction kavramlarının hepsi burada aynen geçerli. SQLAlchemy SQL'i bilmeyi gereksiz kılmaz; tersine, ORM'in ürettiği SQL'i okuyabilen geliştirici performans sorunlarını çok daha hızlı çözer.</div>

<div class="tbl-wrap"><table>
<tr><th>Katman</th><th>Ne yapar?</th><th>Örnek</th></tr>
<tr><td>DBAPI sürücüsü</td><td>Veritabanıyla gerçekten konuşur</td><td><code>sqlite3</code>, <code>psycopg</code>, <code>pymysql</code></td></tr>
<tr><td>Engine</td><td>Bağlantı havuzu ve SQL lehçesi (dialect)</td><td><code>create_engine("sqlite+pysqlite:///:memory:")</code></td></tr>
<tr><td>Core</td><td>SQL'i Python ifadesiyle kurar</td><td><code>select(siparis).where(siparis.c.tutar &gt; 100)</code></td></tr>
<tr><td>ORM</td><td>Satır ↔ nesne eşlemesi, Session, ilişkiler</td><td><code>session.scalars(select(Musteri))</code></td></tr>
</table></div>

<h2>Engine, bağlantı ve text()</h2>
<p>Her şey bir <b>Engine</b> ile başlar. Bağlantı adresi (URL) <code>lehçe+sürücü://kullanıcı:şifre@sunucu/veritabanı</code> biçimindedir. Bellek içi SQLite için <code>sqlite+pysqlite:///:memory:</code> yazarsın; PostgreSQL'e geçmek çoğu zaman yalnızca bu adresi değiştirmektir.</p>
<pre class="py">from sqlalchemy import create_engine, text

engine = create_engine("sqlite+pysqlite:///:memory:")

# engine.begin(): blok başarıyla biterse COMMIT, hata olursa ROLLBACK
with engine.begin() as conn:
    conn.execute(text("CREATE TABLE siparis (id INTEGER PRIMARY KEY, sehir TEXT, tutar REAL)"))
    conn.execute(
        text("INSERT INTO siparis (sehir, tutar) VALUES (:sehir, :tutar)"),
        [{"sehir": "İzmir", "tutar": 120.0}, {"sehir": "Ankara", "tutar": 300.0},
         {"sehir": "İzmir", "tutar": 80.0}],
    )

# engine.connect(): yalnız okuma; yazarsan conn.commit() gerekir
with engine.connect() as conn:
    sonuc = conn.execute(text("SELECT sehir, SUM(tutar) AS ciro FROM siparis "
                              "WHERE tutar &gt;= :alt GROUP BY sehir ORDER BY ciro DESC"),
                         {"alt": 50})
    for satir in sonuc:
        print(satir.sehir, satir.ciro)       # satıra adla erişim
    print(conn.execute(text("SELECT COUNT(*) FROM siparis")).scalar())</pre>

<p><code>:sehir</code> gibi adlandırılmış yer tutucular <b>bağlı parametrelerdir</b> (bound parameters). Değerler SQL metnine yapıştırılmaz, sürücüye ayrıca gönderilir; bu yüzden SQL enjeksiyonu (SQL injection) mümkün değildir. Bir liste sözlük verdiğinde SQLAlchemy işlemi <code>executemany</code> olarak toplu çalıştırır.</p>
<div class="warn"><b>f-string ile SQL yazma</b><code>text(f"... WHERE sehir = '{sehir}'")</code> yazmak sqlite3 dersindeki enjeksiyon açığının aynısıdır; <code>text()</code> sihirli bir koruma sağlamaz. Kullanıcıdan gelen her değer <code>:ad</code> yer tutucusuyla gitmeli.</div>

<h2>Core: tabloyu Python nesnesiyle tanımlamak</h2>
<p>Core'da tablo bir <code>Table</code> nesnesidir. Sorgular <code>select</code>, <code>insert</code>, <code>update</code>, <code>delete</code> fonksiyonlarıyla kurulur ve SQLAlchemy bunları kullandığın veritabanının lehçesine çevirir. Sorguyu <code>print</code> edersen üretilen SQL'i görürsün.</p>
<pre class="py">from sqlalchemy import (create_engine, MetaData, Table, Column, Integer, String,
                        Float, select, insert, func)

engine = create_engine("sqlite+pysqlite:///:memory:")
meta = MetaData()
urun = Table("urun", meta,
             Column("id", Integer, primary_key=True),
             Column("ad", String(80), nullable=False),
             Column("kategori", String(40)),
             Column("fiyat", Float))
meta.create_all(engine)

with engine.begin() as conn:
    conn.execute(insert(urun), [
        {"ad": "Çay", "kategori": "İçecek", "fiyat": 85.5},
        {"ad": "Kahve", "kategori": "İçecek", "fiyat": 240.0},
        {"ad": "Bisküvi", "kategori": "Atıştırmalık", "fiyat": 25.0},
    ])

sorgu = (select(urun.c.kategori, func.count().label("adet"), func.avg(urun.c.fiyat).label("ort"))
         .group_by(urun.c.kategori)
         .order_by(urun.c.kategori))
print(sorgu)                                 # üretilen SQL
with engine.connect() as conn:
    for k, adet, ort in conn.execute(sorgu):
        print(k, adet, round(ort, 2))</pre>


<h2>ORM: modeller, Mapped ve mapped_column</h2>
<p>ORM'de her tablo bir Python sınıfıdır. 2.0 stilinde sınıflar <code>DeclarativeBase</code>'ten türeyen bir <code>Base</code> sınıfından türetilir; sütunlar <code>Mapped[tip]</code> tip ipucuyla bildirilir. <code>Mapped[str]</code> NOT NULL, <code>Mapped[str | None]</code> boş bırakılabilir sütun demektir. Ek ayarlar (birincil anahtar, varsayılan, benzersizlik) <code>mapped_column</code> ile verilir. Metaprogramlama dersinde kurduğun mini model katmanını hatırla: SQLAlchemy de sınıf gövdesini inceleyip tabloyu böyle çıkarır.</p>
<pre class="py">from sqlalchemy import create_engine, select, func, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, Session


class Base(DeclarativeBase):
    pass


class Musteri(Base):
    __tablename__ = "musteri"
    id: Mapped[int] = mapped_column(primary_key=True)
    ad: Mapped[str]
    sehir: Mapped[str]
    siparisler: Mapped[list["Siparis"]] = relationship(back_populates="musteri")


class Siparis(Base):
    __tablename__ = "siparis"
    id: Mapped[int] = mapped_column(primary_key=True)
    tutar: Mapped[float]
    musteri_id: Mapped[int] = mapped_column(ForeignKey("musteri.id"))
    musteri: Mapped["Musteri"] = relationship(back_populates="siparisler")


engine = create_engine("sqlite+pysqlite:///:memory:")
Base.metadata.create_all(engine)            # CREATE TABLE ifadelerini üretir
print(Musteri.__table__.c.keys(), Siparis.__table__.c.keys())
print(repr(Siparis.__table__.c.musteri_id.type), Musteri.__table__.c.ad.nullable)</pre>

<p><code>relationship</code> sütun değil, Python tarafındaki bağlantıdır: <code>musteri.siparisler</code> bir liste, <code>siparis.musteri</code> tek bir nesne verir. <code>back_populates</code> iki tarafı birbirine bağlar; birine eklediğin diğerinde de görünür. Asıl ilişkiyi veritabanında taşıyan şey <code>ForeignKey("musteri.id")</code> sütunudur.</p>

<h2>Session ve CRUD</h2>
<p><b>Session</b>, ORM'in çalışma birimidir (unit of work): nesneleri izler, değişiklikleri toplar ve <code>commit()</code> anında doğru sırada INSERT/UPDATE/DELETE üretir. Aynı oturumda aynı birincil anahtarlı satır her zaman aynı Python nesnesidir (identity map).</p>
<pre class="py">from sqlalchemy import create_engine, select, func, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, Session


class Base(DeclarativeBase):
    pass


class Musteri(Base):
    __tablename__ = "musteri"
    id: Mapped[int] = mapped_column(primary_key=True)
    ad: Mapped[str]
    sehir: Mapped[str]
    siparisler: Mapped[list["Siparis"]] = relationship(back_populates="musteri")


class Siparis(Base):
    __tablename__ = "siparis"
    id: Mapped[int] = mapped_column(primary_key=True)
    tutar: Mapped[float]
    musteri_id: Mapped[int] = mapped_column(ForeignKey("musteri.id"))
    musteri: Mapped["Musteri"] = relationship(back_populates="siparisler")


engine = create_engine("sqlite+pysqlite:///:memory:")
Base.metadata.create_all(engine)

with Session(engine) as s:
    # CREATE
    ayse = Musteri(ad="Ayşe", sehir="İzmir")
    ayse.siparisler.append(Siparis(tutar=120.0))
    s.add_all([ayse, Musteri(ad="Mehmet", sehir="Ankara")])
    s.commit()
    print("id:", ayse.id)

with Session(engine) as s:
    # READ
    m = s.get(Musteri, 1)                              # birincil anahtarla
    izmirliler = s.scalars(select(Musteri).where(Musteri.sehir == "İzmir")).all()
    print(m.ad, [x.ad for x in izmirliler])
    # UPDATE: nesneyi değiştir, commit et
    m.sehir = "Manisa"
    # DELETE
    s.delete(s.scalars(select(Musteri).where(Musteri.ad == "Mehmet")).one())
    s.commit()
    print(s.scalars(select(Musteri.ad)).all(), m.sehir)
    print(s.scalar(select(func.count()).select_from(Siparis)))</pre>

<div class="tbl-wrap"><table>
<tr><th>Amaç</th><th>2.0 stili</th><th>Eski (1.x) stil</th></tr>
<tr><td>Birincil anahtarla getir</td><td><code>s.get(Musteri, 1)</code></td><td><code>s.query(Musteri).get(1)</code></td></tr>
<tr><td>Filtreli liste</td><td><code>s.scalars(select(Musteri).where(...)).all()</code></td><td><code>s.query(Musteri).filter(...).all()</code></td></tr>
<tr><td>Tek sonuç (yoksa hata)</td><td><code>.one()</code></td><td><code>.one()</code></td></tr>
<tr><td>Tek sonuç ya da None</td><td><code>.first()</code> / <code>.one_or_none()</code></td><td>aynı</td></tr>
<tr><td>Tek değer (sayı, toplam)</td><td><code>s.scalar(select(func.count())...)</code></td><td><code>s.query(func.count(...)).scalar()</code></td></tr>
</table></div>
<p><code>scalars()</code> her satırın ilk sütununu (burada model nesnesini) verir. Birden çok sütun seçtiğinde (<code>select(Musteri.ad, Musteri.sehir)</code>) <code>s.execute(...)</code> ile satır demetleri alırsın.</p>

<h2>Lazy loading ve N+1 problemi</h2>
<p>Varsayılan olarak ilişkiler <b>tembel</b> (lazy) yüklenir: <code>musteri.siparisler</code>'e ilk eriştiğinde ayrı bir SELECT çalışır. 100 müşteriyi listeleyip her birinin siparişlerine dokunursan 1 + 100 sorgu atarsın. Buna <b>N+1 problemi</b> denir ve ORM kullanan uygulamalardaki en yaygın performans sorunudur. Çözüm, ilişkiyi <b>istekli</b> (eager) yüklemektir.</p>
<pre class="py">from sqlalchemy import create_engine, select, func, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, Session


class Base(DeclarativeBase):
    pass


class Musteri(Base):
    __tablename__ = "musteri"
    id: Mapped[int] = mapped_column(primary_key=True)
    ad: Mapped[str]
    sehir: Mapped[str]
    siparisler: Mapped[list["Siparis"]] = relationship(back_populates="musteri")


class Siparis(Base):
    __tablename__ = "siparis"
    id: Mapped[int] = mapped_column(primary_key=True)
    tutar: Mapped[float]
    musteri_id: Mapped[int] = mapped_column(ForeignKey("musteri.id"))
    musteri: Mapped["Musteri"] = relationship(back_populates="siparisler")

from sqlalchemy import event
from sqlalchemy.orm import selectinload, joinedload

engine = create_engine("sqlite+pysqlite:///:memory:")
Base.metadata.create_all(engine)
with Session(engine) as s:
    s.add_all([
        Musteri(ad="Ayşe", sehir="İzmir", siparisler=[Siparis(tutar=120.0), Siparis(tutar=80.0)]),
        Musteri(ad="Mehmet", sehir="Ankara", siparisler=[Siparis(tutar=300.0)]),
        Musteri(ad="Zeynep", sehir="İzmir", siparisler=[Siparis(tutar=50.0)]),
        Musteri(ad="Can", sehir="Bursa"),
    ])
    s.commit()

sorgular = []
event.listen(engine, "before_cursor_execute",
             lambda conn, cur, sql, params, ctx, many: sorgular.append(sql))

def rapor(secenek=None):
    sorgular.clear()
    with Session(engine) as s:
        q = select(Musteri).order_by(Musteri.id)
        if secenek is not None:
            q = q.options(secenek)
        # joinedload koleksiyonda satırları çoğaltır; unique() tekrarları birleştirir
        satirlar = [(m.ad, len(m.siparisler)) for m in s.scalars(q).unique()]
    return satirlar, len(sorgular)

print("lazy        :", rapor())
print("selectinload:", rapor(selectinload(Musteri.siparisler)))
print("joinedload  :", rapor(joinedload(Musteri.siparisler))[1], "sorgu")</pre>

<div class="tbl-wrap"><table>
<tr><th>Strateji</th><th>Nasıl yükler?</th><th>Ne zaman?</th></tr>
<tr><td><code>lazyload</code> (varsayılan)</td><td>Erişimde ayrı SELECT</td><td>İlişkiye nadiren dokunuluyorsa</td></tr>
<tr><td><code>selectinload</code></td><td>İkinci bir <code>SELECT ... WHERE id IN (...)</code></td><td>Bire-çok koleksiyonlar için çoğu zaman en iyisi</td></tr>
<tr><td><code>joinedload</code></td><td>Aynı sorguda LEFT OUTER JOIN</td><td>Çoka-bir (sipariş → müşteri) ilişkiler</td></tr>
<tr><td><code>raiseload</code></td><td>Erişimde hata fırlatır</td><td>Gizli N+1'leri testte yakalamak için</td></tr>
</table></div>

<p><code>joinedload</code> bire-çok ilişkide JOIN yüzünden her müşteriyi sipariş sayısı kadar satırda döndürür; bu yüzden 2.0'da sonucu <code>.unique()</code> ile tekilleştirmen zorunludur. <code>selectinload</code>'da böyle bir gereklilik yoktur; koleksiyonlar için çoğu zaman onu tercih etmen bundandır.</p>

<h2>Transaction: ya hep ya hiç</h2>
<p>Session her zaman bir transaction içindedir. <code>commit()</code> kalıcı yapar, <code>rollback()</code> geri alır. <code>with Session(engine) as s, s.begin():</code> kalıbı blok başarıyla biterse commit, istisna olursa rollback yapar. Ilgaz Bank'ta havale gibi birden çok satırı değiştiren işlemler mutlaka tek transaction'da olmalı.</p>
<pre class="py">from sqlalchemy import create_engine, select, CheckConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session

class Base(DeclarativeBase):
    pass

class Hesap(Base):
    __tablename__ = "hesap"
    no: Mapped[str] = mapped_column(primary_key=True)
    bakiye: Mapped[float] = mapped_column(CheckConstraint("bakiye &gt;= 0"))

engine = create_engine("sqlite+pysqlite:///:memory:")
Base.metadata.create_all(engine)
with Session(engine) as s, s.begin():
    s.add_all([Hesap(no="TR-1", bakiye=1000), Hesap(no="TR-2", bakiye=50)])

def havale(gonderen, alici, tutar):
    with Session(engine) as s, s.begin():          # hata olursa otomatik rollback
        g, a = s.get(Hesap, gonderen), s.get(Hesap, alici)
        a.bakiye += tutar
        g.bakiye -= tutar
        if g.bakiye &lt; 0:
            raise ValueError("Yetersiz bakiye")

havale("TR-1", "TR-2", 300)
try:
    havale("TR-2", "TR-1", 9999)
except ValueError as h:
    print("İptal:", h)
with Session(engine) as s:
    print([(h.no, h.bakiye) for h in s.scalars(select(Hesap).order_by(Hesap.no))])</pre>

<p>İkinci havalede önce alıcıya para eklendi, sonra hata fırladı; ama rollback sayesinde hiçbir değişiklik kalıcı olmadı. Ayrıca veritabanındaki <code>CHECK</code> kısıtı ikinci bir savunma hattıdır: Python kodunda hata olsa bile negatif bakiye kaydedilemez.</p>

<h2>Alembic ile migration (gösterim)</h2>
<p><code>create_all</code> yalnız eksik tabloları oluşturur; mevcut tabloya sütun eklemez. Üretimde şema değişiklikleri <b>Alembic</b> ile sürümlenir: her değişiklik bir migration dosyasıdır, git'te saklanır, tüm ortamlara aynı sırayla uygulanır.</p>
<pre class="code">pip install alembic
alembic init migrations              # migrations/ klasörü ve alembic.ini
# alembic.ini: sqlalchemy.url = postgresql+psycopg://...
# migrations/env.py: target_metadata = Base.metadata
alembic revision --autogenerate -m "musteriye telefon ekle"
alembic upgrade head                 # bekleyen tüm migration'ları uygula
alembic downgrade -1                 # son migration'ı geri al</pre>
<pre class="code"># migrations/versions/3f2a_musteriye_telefon_ekle.py (otomatik üretilir, gözden geçirilir)
def upgrade():
    op.add_column("musteri", sa.Column("telefon", sa.String(20), nullable=True))

def downgrade():
    op.drop_column("musteri", "telefon")</pre>

<div class="note"><b>Kendi bilgisayarında dene</b>Alembic komut satırı aracıdır ve dosya sistemi ister; tarayıcıda çalışmaz. Yerelde <code>pip install sqlalchemy alembic</code> ile kurup bir SQLite dosyası (<code>sqlite:///magaza.db</code>) üzerinde deneyebilirsin. <code>--autogenerate</code> çıktısını her zaman gözle kontrol et: sütun yeniden adlandırmayı "sil + ekle" olarak algılayıp veri kaybettirebilir.</div>

<h2>Ham SQL mi, ORM mi?</h2>
<div class="tbl-wrap"><table>
<tr><th>Durum</th><th>Tercih</th><th>Neden</th></tr>
<tr><td>İş nesneleri üzerinde CRUD, ilişkiler</td><td>ORM</td><td>Okunur kod, identity map, unit of work</td></tr>
<tr><td>Rapor, büyük GROUP BY, pencere fonksiyonları</td><td>Core ya da <code>text()</code></td><td>Nesneye çevirmeye gerek yok; SQL daha açık</td></tr>
<tr><td>Milyonlarca satır toplu yükleme</td><td>Core <code>insert()</code> + liste, ya da veritabanının COPY aracı</td><td>Nesne başına maliyet yok</td></tr>
<tr><td>Veritabanına özgü özellik (JSONB, CTE)</td><td>Core/text</td><td>Lehçe özelliklerine tam erişim</td></tr>
<tr><td>Analiz için DataFrame</td><td><code>pd.read_sql(sorgu, engine)</code></td><td>Doğrudan tabloya</td></tr>
</table></div>

<div class="note"><b>Gerçek işte</b>Anadolu Market'in sipariş paneli yavaşladığında ilk bakılan şey, sayfa başına kaç SQL sorgusu atıldığıdır. Tipik bulgu: sipariş listesi 50 sipariş gösteriyor, şablon her siparişte <code>siparis.musteri.ad</code> ve <code>siparis.kalemler</code>'e dokunuyor ve sayfa 101 sorgu atıyor. Sorguya <code>selectinload(Siparis.kalemler)</code> ve <code>joinedload(Siparis.musteri)</code> eklemek sayfayı 2-3 sorguya indirir. Ekipler bunu kalıcı kılmak için testlerde sorgu sayısını sayan bir yardımcı (bu dersin meydan okuma görevi) kullanır ve sınırı aşan değişikliği CI'da reddeder.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Session'ın ömrü</h3>
<p>Session uzun yaşayan küresel bir nesne olmamalı. Web uygulamalarında kural "istek başına bir session"dır: istek gelince açılır, yanıt dönünce kapanır. Flask-SQLAlchemy ve FastAPI'nin <code>Depends(get_db)</code> kalıbı bunu senin için yapar. <code>sessionmaker(engine)</code> ile ayarları bir kez belirleyip <code>with SessionLocal() as s:</code> şeklinde kullanırsın.</p>
<h3>expire_on_commit</h3>
<p>Varsayılan olarak commit'ten sonra nesnelerin öznitelikleri "süresi dolmuş" sayılır ve bir sonraki erişimde yeniden okunur. Session kapandıktan sonra böyle bir özniteliğe erişirsen <code>DetachedInstanceError</code> alırsın. Nesneyi session dışında kullanacaksan ya gereken alanları kapanmadan oku ya da <code>Session(engine, expire_on_commit=False)</code> kullan.</p>
<h3>Bağlantı havuzu ve async</h3>
<p>Engine bağlantıları havuzda (pool) tutar; uygulama başına bir engine oluşturulur, her istekte yeniden oluşturulmaz. <code>pool_size</code>, <code>max_overflow</code> ve <code>pool_pre_ping=True</code> üretim ayarlarıdır. FastAPI gibi async çatılarda <code>sqlalchemy.ext.asyncio</code> içindeki <code>create_async_engine</code> ve <code>AsyncSession</code> kullanılır; async ortamda tembel yükleme yasaktır, bu yüzden eager loading orada zorunluluk hâline gelir.</p>
</section>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: '<code>conn.execute(text("SELECT * FROM musteri WHERE sehir = :sehir"), {"sehir": girdi})</code> kalıbının f-string ile sorgu kurmaya göre en önemli faydası nedir?',
      o: ['Sorguyu her veritabanında her zaman daha hızlı çalıştırır', 'Değer SQL metnine yapıştırılmaz, enjeksiyon engellenir', 'Sonuçları otomatik olarak Python nesnelerine çevirir', 'Sorguyu bağlı olduğu PostgreSQL lehçesine çevirir'],
      a: 1,
      why: 'Bağlı parametre değeri sürücüye ayrı gönderilir; içinde tırnak ya da SQL olsa bile kod olarak yorumlanmaz. Hız farkı ikincil, nesne eşlemesi ORM\'in işi, lehçe çevirisi ise Core ifadelerinin işidir.' },
    { t: 'mc',
      stage: 'Isınma',
      q: 'Bir sayfa 50 siparişi listeliyor ve her siparişin müşteri adını gösteriyor. SQL günlüğünde 51 sorgu görüyorsun. Sorun ve çözüm nedir?',
      o: ['Veritabanı yavaş; indeks eklemek yeter', 'N+1 problemi; ilişkiyi joinedload/selectinload ile istekli yükle', 'Session çok uzun açık kalmış; her siparişte yeni session aç', 'Bağlantı havuzu küçük; pool_size değerini artır'],
      a: 1,
      why: '1 sorgu siparişleri, sonraki 50 sorgu her siparişin müşterisini tembel yüklüyor. Eager loading bunu 1-2 sorguya indirir. İndeks ya da havuz ayarı sorgu sayısını azaltmaz; her siparişte yeni session açmak durumu daha da kötüleştirir.' },
    { t: 'mc',
      stage: 'Isınma',
      q: '<code>with Session(engine) as s:</code> bloğunda <code>s.add(Musteri(ad="Ece"))</code> yaptın ama <code>commit()</code> çağırmadın. Blok bitince ne olur?',
      o: ['Kayıt blok sonunda otomatik olarak kalıcı biçimde kaydedilir', 'Session kapanır, açık transaction geri alınır; kayıt kaydedilmez', 'Kaydedilmemiş nesne olduğu için IntegrityError fırlatılır', 'Kayıt bir sonraki session açıldığında veritabanına yazılır'],
      a: 1,
      why: 'Session\'ı with ile kapatmak commit yapmaz; açık transaction geri alınır. Otomatik commit isteniyorsa with Session(engine) as s, s.begin(): kalıbı kullanılır. Kaydetmemek bir hata değildir, bu yüzden istisna da fırlamaz.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Core ile filtre ve sıralama: bu kod ne yazdırır?',
      code: 'from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, Float, select, insert\n\nengine = create_engine("sqlite+pysqlite:///:memory:")\nmeta = MetaData()\nsiparis = Table("siparis", meta, Column("id", Integer, primary_key=True),\n                Column("sehir", String), Column("tutar", Float))\nmeta.create_all(engine)\nwith engine.begin() as conn:\n    conn.execute(insert(siparis), [{"sehir": "İzmir", "tutar": 120.0},\n                                   {"sehir": "Ankara", "tutar": 90.0},\n                                   {"sehir": "Bursa", "tutar": 300.0}])\n    q = select(siparis.c.sehir).where(siparis.c.tutar > 100).order_by(siparis.c.tutar.desc())\n    print(conn.execute(q).scalars().all())\n',
      o: ['[\'İzmir\', \'Bursa\']', '[\'Bursa\', \'İzmir\']', '[\'Bursa\', \'İzmir\', \'Ankara\']', '[(\'Bursa\',), (\'İzmir\',)]'],
      a: 1,
      why: 'Filtre 90\'ı eler; azalan sıralamada 300 (Bursa) önce gelir. .scalars() her satırın ilk sütununu verdiği için demet değil, düz metin listesi döner.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Identity map: bu kod ne yazdırır?',
      code: 'from sqlalchemy import create_engine, select, func, ForeignKey\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, Session\n\n\nclass Base(DeclarativeBase):\n    pass\n\n\nclass Musteri(Base):\n    __tablename__ = "musteri"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    ad: Mapped[str]\n    sehir: Mapped[str]\n    siparisler: Mapped[list["Siparis"]] = relationship(back_populates="musteri")\n\n\nclass Siparis(Base):\n    __tablename__ = "siparis"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    tutar: Mapped[float]\n    musteri_id: Mapped[int] = mapped_column(ForeignKey("musteri.id"))\n    musteri: Mapped["Musteri"] = relationship(back_populates="siparisler")\n\n\nengine = create_engine("sqlite+pysqlite:///:memory:")\nBase.metadata.create_all(engine)\nwith Session(engine) as s:\n    s.add(Musteri(ad="Ayşe", sehir="İzmir"))\n    s.commit()\n    a = s.get(Musteri, 1)\n    b = s.scalars(select(Musteri).where(Musteri.ad == "Ayşe")).one()\n    a.sehir = "Manisa"\n    print(a is b, b.sehir)\n',
      o: ['False İzmir', 'True Manisa', 'True İzmir', 'False Manisa'],
      a: 1,
      why: 'Aynı session içinde aynı birincil anahtarlı satır hep aynı Python nesnesidir (identity map). a ve b aynı nesne olduğundan a üzerindeki değişiklik b\'de de görünür; henüz commit edilmemiş olması bunu değiştirmez.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Transaction ve rollback: bu kod ne yazdırır?',
      code: 'from sqlalchemy import create_engine, select, func, ForeignKey\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, Session\n\n\nclass Base(DeclarativeBase):\n    pass\n\n\nclass Musteri(Base):\n    __tablename__ = "musteri"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    ad: Mapped[str]\n    sehir: Mapped[str]\n    siparisler: Mapped[list["Siparis"]] = relationship(back_populates="musteri")\n\n\nclass Siparis(Base):\n    __tablename__ = "siparis"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    tutar: Mapped[float]\n    musteri_id: Mapped[int] = mapped_column(ForeignKey("musteri.id"))\n    musteri: Mapped["Musteri"] = relationship(back_populates="siparisler")\n\n\nengine = create_engine("sqlite+pysqlite:///:memory:")\nBase.metadata.create_all(engine)\nwith Session(engine) as s, s.begin():\n    s.add(Musteri(ad="Ayşe", sehir="İzmir"))\ntry:\n    with Session(engine) as s, s.begin():\n        s.add(Musteri(ad="Mehmet", sehir="Ankara"))\n        s.add(Musteri(ad="Can", sehir="Bursa"))\n        raise RuntimeError("ödeme servisi yanıt vermedi")\nexcept RuntimeError:\n    pass\nwith Session(engine) as s:\n    print(s.scalar(select(func.count()).select_from(Musteri)))\n',
      o: ['3', '1', '2', '0'],
      a: 1,
      why: 'İlk blok başarıyla bittiği için commit edildi (1 kayıt). İkinci blokta istisna fırladı; s.begin() bağlamı transaction\'ı geri aldı, iki ekleme de kaybolur. Sonuç 1.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Core ve <code>text()</code> ile tablo oluşturup iki şube ekleyen ve şube sayısını yazdıran programın satırlarını sırala.</p>',
      lines: ['from sqlalchemy import create_engine, text', 'engine = create_engine("sqlite+pysqlite:///:memory:")', 'with engine.begin() as conn:', '    conn.execute(text("CREATE TABLE sube (ad TEXT, sehir TEXT)"))', '    conn.execute(text("INSERT INTO sube VALUES (:a, :s)"), [{"a": "Konak", "s": "İzmir"}, {"a": "Çankaya", "s": "Ankara"}])', '    sayi = conn.execute(text("SELECT COUNT(*) FROM sube")).scalar()', 'print(sayi)'],
      expect: '2\n',
      hint: 'İçe aktarma → engine → transaction bloğu; tablo eklemeden önce, sayım eklemeden sonra.',
      why: 'engine.begin() bloğu bir transaction açar; tablo oluşturulur, iki satır executemany ile eklenir, sayım alınır ve blok bitince commit edilir.' },
    { id: 'sqlalchemy-orm-1',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p><code>sehir_ciro(engine, sehir)</code> fonksiyonunu yaz. <code>siparis(sehir, tutar)</code> tablosunda verilen şehrin toplam tutarını <code>text()</code> ve <b>bağlı parametre</b> (<code>:sehir</code>) ile hesaplayıp döndürsün. O şehirde sipariş yoksa <code>0</code> döndürsün.</p>',
      guide: ['engine.connect() ile bir bağlantı aç (with bloğu).', 'text("SELECT SUM(tutar) FROM siparis WHERE sehir = :sehir") sorgusu kur.', 'conn.execute(sorgu, {"sehir": sehir}).scalar() ile tek değeri al.', 'Sonuç None ise (hiç satır yoksa SUM NULL döner) 0 döndür.'],
      example: 'from sqlalchemy import create_engine, text\n\nengine = create_engine("sqlite+pysqlite:///:memory:")\nwith engine.begin() as conn:\n    conn.execute(text("CREATE TABLE personel (ad TEXT, bolum TEXT, maas REAL)"))\n    conn.execute(text("INSERT INTO personel VALUES (:a, :b, :m)"),\n                 [{"a": "Ali", "b": "İK", "m": 40000}, {"a": "Ece", "b": "Satış", "m": 45000}])\nwith engine.connect() as conn:\n    adet = conn.execute(text("SELECT COUNT(*) FROM personel WHERE bolum = :b"), {"b": "İK"}).scalar()\nprint(adet)\n',
      start: 'from sqlalchemy import text\n\ndef sehir_ciro(engine, sehir):\n    # TODO: bağlantı aç\n    # TODO: :sehir yer tutuculu SUM sorgusunu çalıştır\n    # TODO: None ise 0 döndür\n    pass\n',
      sol: 'from sqlalchemy import text\n\ndef sehir_ciro(engine, sehir):\n    with engine.connect() as conn:\n        toplam = conn.execute(\n            text("SELECT SUM(tutar) FROM siparis WHERE sehir = :sehir"),\n            {"sehir": sehir},\n        ).scalar()\n    return toplam or 0\n',
      tests: 'from sqlalchemy import create_engine, text\nengine = create_engine("sqlite+pysqlite:///:memory:")\nwith engine.begin() as conn:\n    conn.execute(text("CREATE TABLE siparis (sehir TEXT, tutar REAL)"))\n    conn.execute(text("INSERT INTO siparis VALUES (:s, :t)"),\n                 [{"s": "İzmir", "t": 120.0}, {"s": "Ankara", "t": 300.0}, {"s": "İzmir", "t": 80.5}])\nassert sehir_ciro(engine, "İzmir") == 200.5, "İzmir toplamı 120 + 80.5 = 200.5 olmalı"\nassert sehir_ciro(engine, "Ankara") == 300.0, "Ankara toplamı 300"\nassert sehir_ciro(engine, "Bursa") == 0, "siparişi olmayan şehirde SUM NULL döner; 0 döndürmelisin"\nassert sehir_ciro(engine, "x\' OR \'1\'=\'1") == 0, "zararlı girdi bağlı parametreyle etkisiz kalmalı"\nassert ":sehir" in __source__, "sorguda :sehir bağlı parametresini kullanmalısın"\n',
      hints: ['Tek bir değer döndüren sorguda .scalar() kullan.', 'SUM hiç satır yoksa NULL (Python\'da None) döndürür.', 'return toplam or 0 hem None\'u hem de geçerli sayıları doğru ele alır.'],
      why: 'Bağlı parametre girdiyi sorgu metninden ayırır. SUM\'un boş kümede NULL döndürmesi SQL\'in standart davranışıdır; Python tarafında varsayılan vermek gerekir (ya da SQL\'de COALESCE(SUM(tutar), 0)).' },
    { id: 'sqlalchemy-orm-2',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p>Anadolu Market için <code>Urun</code> ORM modelini yaz. Tablo adı <code>"urun"</code>. Sütunlar:</p><ul><li><code>id</code>: <code>int</code>, birincil anahtar</li><li><code>ad</code>: <code>str</code>, zorunlu ve <b>benzersiz</b> (<code>unique=True</code>)</li><li><code>fiyat</code>: <code>float</code>, zorunlu</li><li><code>stok</code>: <code>int</code>, varsayılan <code>0</code></li><li><code>kategori</code>: <code>str | None</code> (boş bırakılabilir)</li></ul>',
      guide: ['Base sınıfı hazır; Urun(Base) sınıfında __tablename__ = "urun" yaz.', 'Her sütunu Mapped[tip] ipucuyla bildir.', 'Ek ayarı olanlarda mapped_column kullan: primary_key=True, unique=True, default=0.', 'Boş bırakılabilir sütun için Mapped[str | None] yeterli.'],
      example: 'from sqlalchemy import create_engine, select\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session\n\nclass Base(DeclarativeBase):\n    pass\n\nclass Sube(Base):\n    __tablename__ = "sube"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    kod: Mapped[str] = mapped_column(unique=True)\n    calisan: Mapped[int] = mapped_column(default=1)\n    telefon: Mapped[str | None]\n\nengine = create_engine("sqlite+pysqlite:///:memory:")\nBase.metadata.create_all(engine)\nwith Session(engine) as s:\n    s.add(Sube(kod="IZM-01"))\n    s.commit()\n    sube = s.scalars(select(Sube)).one()\n    print(sube.kod, sube.calisan, sube.telefon)\n',
      start: 'from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column\n\n\nclass Base(DeclarativeBase):\n    pass\n\n\nclass Urun(Base):\n    __tablename__ = "urun"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    # TODO: ad (zorunlu, benzersiz)\n    # TODO: fiyat (zorunlu)\n    # TODO: stok (varsayılan 0)\n    # TODO: kategori (boş olabilir)\n',
      sol: 'from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column\n\n\nclass Base(DeclarativeBase):\n    pass\n\n\nclass Urun(Base):\n    __tablename__ = "urun"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    ad: Mapped[str] = mapped_column(unique=True)\n    fiyat: Mapped[float]\n    stok: Mapped[int] = mapped_column(default=0)\n    kategori: Mapped[str | None]\n',
      tests: 'from sqlalchemy import create_engine, select\nfrom sqlalchemy.orm import Session\nfrom sqlalchemy.exc import IntegrityError\nt = Urun.__table__\nassert t.name == "urun", "tablo adı urun olmalı"\nassert set(t.c.keys()) == {"id", "ad", "fiyat", "stok", "kategori"}, f"sütunlar id, ad, fiyat, stok, kategori olmalı; gelen {t.c.keys()}"\nassert not t.c.ad.nullable and not t.c.fiyat.nullable, "ad ve fiyat zorunlu (NOT NULL) olmalı"\nassert t.c.kategori.nullable, "kategori boş bırakılabilmeli: Mapped[str | None]"\nengine = create_engine("sqlite+pysqlite:///:memory:")\nBase.metadata.create_all(engine)\nwith Session(engine) as s:\n    s.add(Urun(ad="Çay", fiyat=85.5))\n    s.commit()\n    u = s.scalars(select(Urun)).one()\n    assert u.stok == 0 and u.kategori is None, "stok varsayılanı 0, kategori None olmalı"\n    s.add(Urun(ad="Çay", fiyat=90.0))\n    try:\n        s.commit()\n        assert False, "aynı adla ikinci ürün IntegrityError vermeli (unique=True)"\n    except IntegrityError:\n        s.rollback()\n',
      hints: ['Mapped[str] NOT NULL, Mapped[str | None] NULL olabilir anlamına gelir.', 'Ek ayar gerekmeyen sütunda mapped_column yazmak zorunlu değildir: fiyat: Mapped[float]', 'ad: Mapped[str] = mapped_column(unique=True) ve stok: Mapped[int] = mapped_column(default=0)'],
      why: '2.0 stilinde tip ipucu sütunun türünü ve boş olabilirliğini belirler; mapped_column yalnız ek kısıtlar için gerekir. Benzersizlik veritabanı düzeyinde bir UNIQUE kısıtı üretir.' },
    { id: 'sqlalchemy-orm-3',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Model hazır. <code>ucuz_urunler(session, esik, kategori=None)</code> fonksiyonunu yaz: fiyatı <code>esik</code>\'ten <b>küçük</b> ürünlerin adlarını fiyata göre artan sırada (eşitlikte ada göre) liste olarak döndürsün. <code>kategori</code> verilirse yalnız o kategoriyi filtrelesin.</p>',
      guide: ['q = select(Urun).where(Urun.fiyat &lt; esik) ile başla.', 'kategori None değilse q = q.where(Urun.kategori == kategori) ile filtre ekle (sorgular zincirlenebilir).', '.order_by(Urun.fiyat, Urun.ad) ile sırala.', 'session.scalars(q) nesneleri verir; adlarını listeye topla.'],
      example: 'from sqlalchemy import create_engine, select\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session\n\nclass Base(DeclarativeBase):\n    pass\n\nclass Calisan(Base):\n    __tablename__ = "calisan"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    ad: Mapped[str]\n    bolum: Mapped[str]\n    maas: Mapped[float]\n\nengine = create_engine("sqlite+pysqlite:///:memory:")\nBase.metadata.create_all(engine)\nwith Session(engine) as s:\n    s.add_all([Calisan(ad="Ali", bolum="İK", maas=40000), Calisan(ad="Ece", bolum="Satış", maas=52000)])\n    q = select(Calisan).where(Calisan.maas > 45000)\n    q = q.where(Calisan.bolum == "Satış").order_by(Calisan.ad)\n    print([c.ad for c in s.scalars(q)])\n',
      start: 'from sqlalchemy import select\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column\n\n\nclass Base(DeclarativeBase):\n    pass\n\n\nclass Urun(Base):\n    __tablename__ = "urun"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    ad: Mapped[str]\n    fiyat: Mapped[float]\n    kategori: Mapped[str]\n\n\ndef ucuz_urunler(session, esik, kategori=None):\n    q = select(Urun)\n    # TODO: fiyat filtresi\n    # TODO: kategori verildiyse kategori filtresi\n    # TODO: fiyat ve ada göre sırala, adları listele\n    return []\n',
      sol: 'from sqlalchemy import select\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column\n\n\nclass Base(DeclarativeBase):\n    pass\n\n\nclass Urun(Base):\n    __tablename__ = "urun"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    ad: Mapped[str]\n    fiyat: Mapped[float]\n    kategori: Mapped[str]\n\n\ndef ucuz_urunler(session, esik, kategori=None):\n    q = select(Urun).where(Urun.fiyat < esik)\n    if kategori is not None:\n        q = q.where(Urun.kategori == kategori)\n    q = q.order_by(Urun.fiyat, Urun.ad)\n    return [u.ad for u in session.scalars(q)]\n',
      tests: 'from sqlalchemy import create_engine\nfrom sqlalchemy.orm import Session\nengine = create_engine("sqlite+pysqlite:///:memory:")\nBase.metadata.create_all(engine)\nwith Session(engine) as s:\n    s.add_all([Urun(ad="Kahve", fiyat=240, kategori="İçecek"), Urun(ad="Çay", fiyat=85.5, kategori="İçecek"),\n               Urun(ad="Bisküvi", fiyat=25, kategori="Atıştırmalık"), Urun(ad="Gofret", fiyat=25, kategori="Atıştırmalık"),\n               Urun(ad="Su", fiyat=10, kategori="İçecek")])\n    s.commit()\n    assert ucuz_urunler(s, 100) == ["Su", "Bisküvi", "Gofret", "Çay"], "fiyata göre artan, eşitlikte ada göre sıralı olmalı"\n    assert ucuz_urunler(s, 100, "İçecek") == ["Su", "Çay"], "kategori filtresi uygulanmalı"\n    assert ucuz_urunler(s, 25) == ["Su"], "eşik dahil değil: fiyat < esik"\n    assert ucuz_urunler(s, 5) == [], "sonuç yoksa boş liste"\n',
      hints: ['select nesneleri değişmezdir; q = q.where(...) ile yeni sorguyu aynı ada atarsın.', 'Birden çok sıralama ölçütü: .order_by(Urun.fiyat, Urun.ad)', 'return [u.ad for u in session.scalars(q)]'],
      why: 'Koşullu filtreleri zincirlemek, if/else ile birden çok SQL metni yazmaktan çok daha temizdir ve enjeksiyon riski taşımaz; arama ekranlarının tipik kalıbıdır.' },
    { id: 'sqlalchemy-orm-4',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Model hazır. <code>stok_guncelle(session, urun_id, miktar)</code> fonksiyonunu yaz: ürünün stoğuna <code>miktar</code> ekler (negatif miktar düşer) ve <b>commit eder</b>, yeni stoğu döndürür. Ürün yoksa <code>LookupError</code>; yeni stok negatif olacaksa <code>ValueError</code> fırlatır ve stok <b>değişmez</b>.</p>',
      start: 'from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column\n\n\nclass Base(DeclarativeBase):\n    pass\n\n\nclass Urun(Base):\n    __tablename__ = "urun"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    ad: Mapped[str]\n    stok: Mapped[int] = mapped_column(default=0)\n\n\ndef stok_guncelle(session, urun_id, miktar):\n    pass\n',
      sol: 'from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column\n\n\nclass Base(DeclarativeBase):\n    pass\n\n\nclass Urun(Base):\n    __tablename__ = "urun"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    ad: Mapped[str]\n    stok: Mapped[int] = mapped_column(default=0)\n\n\ndef stok_guncelle(session, urun_id, miktar):\n    urun = session.get(Urun, urun_id)\n    if urun is None:\n        raise LookupError(f"Ürün bulunamadı: {urun_id}")\n    yeni = urun.stok + miktar\n    if yeni < 0:\n        raise ValueError(f"Stok yetersiz: {urun.stok}")\n    urun.stok = yeni\n    session.commit()\n    return yeni\n',
      tests: 'from sqlalchemy import create_engine\nfrom sqlalchemy.orm import Session\nengine = create_engine("sqlite+pysqlite:///:memory:")\nBase.metadata.create_all(engine)\nwith Session(engine) as s:\n    s.add_all([Urun(ad="Çay", stok=10), Urun(ad="Kahve", stok=3)])\n    s.commit()\n    assert stok_guncelle(s, 1, 5) == 15, "10 + 5 = 15 döndürmeli"\n    assert stok_guncelle(s, 2, -3) == 0, "stok tam sıfıra inebilir"\n    try:\n        stok_guncelle(s, 2, -1)\n        assert False, "negatif stokta ValueError beklenir"\n    except ValueError:\n        pass\n    try:\n        stok_guncelle(s, 99, 1)\n        assert False, "olmayan üründe LookupError beklenir"\n    except LookupError:\n        pass\nwith Session(engine) as s2:\n    assert s2.get(Urun, 1).stok == 15, "değişiklik commit edilmiş olmalı (yeni session\'dan okunuyor)"\n    assert s2.get(Urun, 2).stok == 0, "hatalı güncelleme stoğu değiştirmemeli"\n',
      hints: ['Birincil anahtarla tek kayıt: session.get(Urun, urun_id); yoksa None döner.', 'Kontrolü atamadan ÖNCE yap; böylece hatalı durumda nesne değişmeden kalır.', 'Nesnenin özniteliğini değiştir ve session.commit() çağır; UPDATE ifadesini SQLAlchemy üretir.'],
      why: 'ORM\'de güncelleme, nesneyi değiştirip commit etmektir; Session değişen alanları izler ve yalnız onlar için UPDATE üretir. Doğrulamayı değişiklikten önce yapmak, yarım kalmış durum bırakmamanın en basit yoludur.' },
    { id: 'sqlalchemy-orm-5',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Bire-çok ilişki kur. <code>Base</code> hazır; şu iki modeli yaz:</p><ul><li><code>Musteri</code> (tablo <code>"musteri"</code>): <code>id</code> (PK), <code>ad: str</code>, <code>siparisler</code>: <code>Siparis</code> listesine <code>relationship</code>, <code>back_populates="musteri"</code>.</li><li><code>Siparis</code> (tablo <code>"siparis"</code>): <code>id</code> (PK), <code>tutar: float</code>, <code>musteri_id</code>: <code>ForeignKey("musteri.id")</code>, <code>musteri</code>: <code>Musteri</code>\'ye <code>relationship</code>, <code>back_populates="siparisler"</code>.</li></ul><p>Ayrıca <code>musteri_toplam(session, musteri_id)</code> yaz: müşterinin siparişlerinin tutar toplamını ilişki üzerinden hesaplasın (siparişi yoksa 0).</p>',
      start: 'from sqlalchemy import ForeignKey\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship\n\n\nclass Base(DeclarativeBase):\n    pass\n',
      sol: 'from sqlalchemy import ForeignKey\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship\n\n\nclass Base(DeclarativeBase):\n    pass\n\n\nclass Musteri(Base):\n    __tablename__ = "musteri"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    ad: Mapped[str]\n    siparisler: Mapped[list["Siparis"]] = relationship(back_populates="musteri")\n\n\nclass Siparis(Base):\n    __tablename__ = "siparis"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    tutar: Mapped[float]\n    musteri_id: Mapped[int] = mapped_column(ForeignKey("musteri.id"))\n    musteri: Mapped["Musteri"] = relationship(back_populates="siparisler")\n\n\ndef musteri_toplam(session, musteri_id):\n    musteri = session.get(Musteri, musteri_id)\n    return sum(s.tutar for s in musteri.siparisler)\n',
      tests: 'from sqlalchemy import create_engine, select\nfrom sqlalchemy.orm import Session\nengine = create_engine("sqlite+pysqlite:///:memory:")\nBase.metadata.create_all(engine)\nfk = list(Siparis.__table__.c.musteri_id.foreign_keys)\nassert fk and fk[0].target_fullname == "musteri.id", "musteri_id, musteri.id\'ye yabancı anahtar olmalı"\nwith Session(engine) as s:\n    ayse = Musteri(ad="Ayşe")\n    ayse.siparisler.append(Siparis(tutar=120.0))\n    sp = Siparis(tutar=80.0)\n    sp.musteri = ayse\n    assert sp in ayse.siparisler, "back_populates: siparis.musteri atanınca müşterinin listesine de eklenmeli"\n    s.add_all([ayse, Musteri(ad="Can")])\n    s.commit()\n    assert musteri_toplam(s, 1) == 200.0, "Ayşe\'nin toplamı 200 olmalı"\n    assert musteri_toplam(s, 2) == 0, "siparişi olmayan müşteri için 0"\n    sp2 = s.scalars(select(Siparis).where(Siparis.tutar == 80.0)).one()\n    assert sp2.musteri.ad == "Ayşe" and sp2.musteri_id == 1, "siparişten müşteriye ilişki ve yabancı anahtar dolu olmalı"\n',
      hints: ['Liste ilişki: siparisler: Mapped[list["Siparis"]] = relationship(back_populates="musteri"). Sınıf henüz tanımlı olmadığı için ad tırnak içinde.', 'Yabancı anahtar: musteri_id: Mapped[int] = mapped_column(ForeignKey("musteri.id"))', 'Toplam: sum(s.tutar for s in musteri.siparisler); boş listede sum 0 verir.'],
      why: 'Veritabanındaki bağı ForeignKey sütunu taşır; relationship ise Python tarafında gezinmeyi sağlar. back_populates iki yönü senkron tutar, böylece hangi taraftan bağlarsan bağla nesne grafı tutarlı kalır.' },
    { id: 'sqlalchemy-orm-6',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Modeller ve veri hazır (Musteri ↔ Siparis). <code>sehir_raporu(session)</code> fonksiyonunu yaz: SQL tarafında <b>JOIN + GROUP BY</b> ile her şehir için <code>(sehir, siparis_adedi, toplam_tutar)</code> demetlerinin listesini döndürsün; toplam tutara göre <b>azalan</b> sırada. Siparişi olmayan şehirler listede yer almasın. Python döngüsüyle toplama yapma.</p>',
      start: 'from sqlalchemy import create_engine, select, func, ForeignKey\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, Session\n\n\nclass Base(DeclarativeBase):\n    pass\n\n\nclass Musteri(Base):\n    __tablename__ = "musteri"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    ad: Mapped[str]\n    sehir: Mapped[str]\n    siparisler: Mapped[list["Siparis"]] = relationship(back_populates="musteri")\n\n\nclass Siparis(Base):\n    __tablename__ = "siparis"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    tutar: Mapped[float]\n    musteri_id: Mapped[int] = mapped_column(ForeignKey("musteri.id"))\n    musteri: Mapped["Musteri"] = relationship(back_populates="siparisler")\n\n\ndef sehir_raporu(session):\n    pass\n',
      sol: 'from sqlalchemy import create_engine, select, func, ForeignKey\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, Session\n\n\nclass Base(DeclarativeBase):\n    pass\n\n\nclass Musteri(Base):\n    __tablename__ = "musteri"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    ad: Mapped[str]\n    sehir: Mapped[str]\n    siparisler: Mapped[list["Siparis"]] = relationship(back_populates="musteri")\n\n\nclass Siparis(Base):\n    __tablename__ = "siparis"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    tutar: Mapped[float]\n    musteri_id: Mapped[int] = mapped_column(ForeignKey("musteri.id"))\n    musteri: Mapped["Musteri"] = relationship(back_populates="siparisler")\n\n\ndef sehir_raporu(session):\n    toplam = func.sum(Siparis.tutar)\n    q = (select(Musteri.sehir, func.count(Siparis.id), toplam)\n         .join(Siparis, Siparis.musteri_id == Musteri.id)\n         .group_by(Musteri.sehir)\n         .order_by(toplam.desc()))\n    return [tuple(satir) for satir in session.execute(q)]\n',
      tests: 'engine = create_engine("sqlite+pysqlite:///:memory:")\nBase.metadata.create_all(engine)\nwith Session(engine) as s:\n    s.add_all([\n        Musteri(ad="Ayşe", sehir="İzmir", siparisler=[Siparis(tutar=120.0), Siparis(tutar=80.0)]),\n        Musteri(ad="Mehmet", sehir="Ankara", siparisler=[Siparis(tutar=300.0)]),\n        Musteri(ad="Zeynep", sehir="İzmir", siparisler=[Siparis(tutar=50.0)]),\n        Musteri(ad="Can", sehir="Bursa"),\n    ])\n    s.commit()\nfrom sqlalchemy import event\nsorgu = []\nevent.listen(engine, "before_cursor_execute", lambda *a: sorgu.append(a[2]))\nwith Session(engine) as s:\n    r = sehir_raporu(s)\nassert r == [("Ankara", 1, 300.0), ("İzmir", 3, 250.0)], f"beklenen [(\'Ankara\', 1, 300.0), (\'İzmir\', 3, 250.0)], gelen {r}"\nassert len(sorgu) == 1 and "GROUP BY" in sorgu[0], "rapor tek bir GROUP BY sorgusuyla üretilmeli"\n',
      hints: ['Birden çok sütun seçerken session.execute(select(a, b, c)) satır demetleri verir.', 'Siparişi olmayan müşterileri dışarıda bırakmak için iç birleşim (join) yeterli: .join(Siparis, Siparis.musteri_id == Musteri.id)', 'func.count(Siparis.id) ve func.sum(Siparis.tutar); sıralama: .order_by(func.sum(Siparis.tutar).desc())'],
      why: 'Toplama işini veritabanına bırakmak, binlerce nesneyi Python\'a taşıyıp döngüde toplamaktan çok daha hızlıdır. Rapor sorgularında ORM nesnesi yerine sütun seçmek tipik ve doğru kullanımdır.' },
    { id: 'sqlalchemy-orm-7',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Ilgaz Bank. <code>Hesap</code> modeli hazır. <code>havale(engine, gonderen, alici, tutar)</code> fonksiyonunu yaz. Kendi session\'ını ve transaction\'ını açsın (<code>with Session(engine) as s, s.begin():</code>).</p><ul><li><code>tutar &lt;= 0</code> ise <code>ValueError</code></li><li>Hesaplardan biri yoksa <code>LookupError</code></li><li>Gönderenin bakiyesi yetmiyorsa <code>ValueError</code></li></ul><p>Hata durumunda <b>hiçbir</b> bakiye değişmemeli. Başarılıysa gönderenin yeni bakiyesini döndürsün.</p>',
      start: 'from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session\n\n\nclass Base(DeclarativeBase):\n    pass\n\n\nclass Hesap(Base):\n    __tablename__ = "hesap"\n    no: Mapped[str] = mapped_column(primary_key=True)\n    bakiye: Mapped[float]\n\n\ndef havale(engine, gonderen, alici, tutar):\n    pass\n',
      sol: 'from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session\n\n\nclass Base(DeclarativeBase):\n    pass\n\n\nclass Hesap(Base):\n    __tablename__ = "hesap"\n    no: Mapped[str] = mapped_column(primary_key=True)\n    bakiye: Mapped[float]\n\n\ndef havale(engine, gonderen, alici, tutar):\n    if tutar <= 0:\n        raise ValueError("Tutar pozitif olmalı")\n    with Session(engine) as s, s.begin():\n        g = s.get(Hesap, gonderen)\n        a = s.get(Hesap, alici)\n        if g is None or a is None:\n            raise LookupError("Hesap bulunamadı")\n        a.bakiye += tutar\n        g.bakiye -= tutar\n        if g.bakiye < 0:\n            raise ValueError("Yetersiz bakiye")\n        return g.bakiye\n',
      tests: 'from sqlalchemy import create_engine, select\nengine = create_engine("sqlite+pysqlite:///:memory:")\nBase.metadata.create_all(engine)\nwith Session(engine) as s, s.begin():\n    s.add_all([Hesap(no="TR-1", bakiye=1000.0), Hesap(no="TR-2", bakiye=50.0)])\ndef bakiyeler():\n    with Session(engine) as s:\n        return {h.no: h.bakiye for h in s.scalars(select(Hesap))}\nassert havale(engine, "TR-1", "TR-2", 300) == 700.0, "başarılı havalede gönderenin yeni bakiyesi döner"\nassert bakiyeler() == {"TR-1": 700.0, "TR-2": 350.0}, "havale commit edilmiş olmalı"\nfor args, hata in [(("TR-2", "TR-1", 5000), ValueError), (("TR-1", "TR-9", 10), LookupError), (("TR-1", "TR-2", 0), ValueError)]:\n    try:\n        havale(engine, *args)\n        assert False, f"{args} için {hata.__name__} beklenir"\n    except hata:\n        pass\nassert bakiyeler() == {"TR-1": 700.0, "TR-2": 350.0}, "hatalı havaleler hiçbir bakiyeyi değiştirmemeli (rollback)"\n',
      hints: ['with Session(engine) as s, s.begin(): bloğundan istisna ile çıkılırsa transaction otomatik geri alınır.', 'Bakiyeyi değiştirdikten sonra hata fırlatsan bile rollback sayesinde değişiklik kalıcı olmaz; yine de kontrolü önce yapmak daha okunur.', 'Bloktan return ile normal çıkış commit anlamına gelir.'],
      why: 'Transaction "ya hep ya hiç" garantisi verir: iki hesabın güncellenmesi tek iş birimidir. begin() bağlam yöneticisi commit/rollback kararını senin yerine verir; elle rollback unutma riskini ortadan kaldırır.' },
    { id: 'sqlalchemy-orm-8',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Müşteri arama fonksiyonu çalışıyor gibi görünüyor ama güvenlik testinden kaldı: arama kutusuna <code>x\' OR \'1\'=\'1</code> yazan biri tüm müşterileri görebiliyor. <b>Hatayı bul ve düzelt.</b> Fonksiyon verilen şehirdeki müşteri adlarını alfabetik sırayla döndürmeli.</p>',
      start: 'from sqlalchemy import text\n\ndef sehirdeki_musteriler(engine, sehir):\n    with engine.connect() as conn:\n        sorgu = text(f"SELECT ad FROM musteri WHERE sehir = \'{sehir}\' ORDER BY ad")\n        return [satir.ad for satir in conn.execute(sorgu)]\n',
      sol: 'from sqlalchemy import text\n\ndef sehirdeki_musteriler(engine, sehir):\n    with engine.connect() as conn:\n        sorgu = text("SELECT ad FROM musteri WHERE sehir = :sehir ORDER BY ad")\n        return [satir.ad for satir in conn.execute(sorgu, {"sehir": sehir})]\n',
      tests: 'from sqlalchemy import create_engine, text\nengine = create_engine("sqlite+pysqlite:///:memory:")\nwith engine.begin() as conn:\n    conn.execute(text("CREATE TABLE musteri (ad TEXT, sehir TEXT)"))\n    conn.execute(text("INSERT INTO musteri VALUES (:a, :s)"),\n                 [{"a": "Zeynep", "s": "İzmir"}, {"a": "Ayşe", "s": "İzmir"}, {"a": "Mehmet", "s": "Ankara"}, {"a": "Ali", "s": "O\'Neil Köyü"}])\nassert sehirdeki_musteriler(engine, "İzmir") == ["Ayşe", "Zeynep"], "İzmir\'deki müşteriler alfabetik"\nassert sehirdeki_musteriler(engine, "x\' OR \'1\'=\'1") == [], "enjeksiyon girdisi hiçbir satır döndürmemeli"\nassert sehirdeki_musteriler(engine, "O\'Neil Köyü") == ["Ali"], "tırnak içeren gerçek değerler de çalışmalı"\n',
      hints: ['Sorun f-string ile SQL metni kurmak; text() bunu düzeltmez.', 'Değer yerine :sehir yer tutucusu yaz.', 'conn.execute(sorgu, {"sehir": sehir})'],
      why: 'Bağlı parametre hem güvenlik açığını kapatır hem de tırnak içeren meşru değerlerde (O\'Neil) sorgunun bozulmasını önler. İki sorun da aynı kökten gelir: veriyi kodun içine yapıştırmak.' },
    { id: 'sqlalchemy-orm-9',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p><code>musteri_ekle(engine, ad, sehir)</code> yeni müşteriyi kaydedip <b>veritabanının verdiği id</b>\'yi döndürmeli. Ama fonksiyon <code>None</code> döndürüyor ve kayıt da kalıcı olmuyor. <b>Hatayı bul ve düzelt.</b></p>',
      start: 'from sqlalchemy import create_engine, select, func, ForeignKey\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, Session\n\n\nclass Base(DeclarativeBase):\n    pass\n\n\nclass Musteri(Base):\n    __tablename__ = "musteri"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    ad: Mapped[str]\n    sehir: Mapped[str]\n    siparisler: Mapped[list["Siparis"]] = relationship(back_populates="musteri")\n\n\nclass Siparis(Base):\n    __tablename__ = "siparis"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    tutar: Mapped[float]\n    musteri_id: Mapped[int] = mapped_column(ForeignKey("musteri.id"))\n    musteri: Mapped["Musteri"] = relationship(back_populates="siparisler")\n\n\ndef musteri_ekle(engine, ad, sehir):\n    with Session(engine) as s:\n        m = Musteri(ad=ad, sehir=sehir)\n        s.add(m)\n    return m.id\n',
      sol: 'from sqlalchemy import create_engine, select, func, ForeignKey\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, Session\n\n\nclass Base(DeclarativeBase):\n    pass\n\n\nclass Musteri(Base):\n    __tablename__ = "musteri"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    ad: Mapped[str]\n    sehir: Mapped[str]\n    siparisler: Mapped[list["Siparis"]] = relationship(back_populates="musteri")\n\n\nclass Siparis(Base):\n    __tablename__ = "siparis"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    tutar: Mapped[float]\n    musteri_id: Mapped[int] = mapped_column(ForeignKey("musteri.id"))\n    musteri: Mapped["Musteri"] = relationship(back_populates="siparisler")\n\n\ndef musteri_ekle(engine, ad, sehir):\n    with Session(engine) as s:\n        m = Musteri(ad=ad, sehir=sehir)\n        s.add(m)\n        s.commit()\n        return m.id\n',
      tests: 'engine = create_engine("sqlite+pysqlite:///:memory:")\nBase.metadata.create_all(engine)\ni1 = musteri_ekle(engine, "Ayşe", "İzmir")\ni2 = musteri_ekle(engine, "Mehmet", "Ankara")\nassert i1 == 1 and i2 == 2, f"veritabanının verdiği id\'ler 1 ve 2 olmalı, gelen {i1}, {i2}"\nwith Session(engine) as s:\n    adlar = s.scalars(select(Musteri.ad).order_by(Musteri.id)).all()\nassert adlar == ["Ayşe", "Mehmet"], "kayıtlar kalıcı olmalı: commit unutulmuş olabilir"\n',
      hints: ['add() yalnız nesneyi session\'a tanıtır; INSERT flush/commit anında çalışır, id de o zaman atanır.', 'Session with bloğu commit etmez; kapanırken açık transaction geri alınır.', 's.commit() çağır ve m.id\'yi session kapanmadan (blok içinde) oku.'],
      why: 'Birincil anahtar veritabanı INSERT\'ü çalıştırınca belli olur. commit sonrası nesne süresi dolmuş sayılır; m.id\'ye session açıkken erişmek değeri yeniden okur. Session kapandıktan sonra erişmek DetachedInstanceError riski taşır.' },
    { id: 'sqlalchemy-orm-10',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>N+1 problemini çöz ve kanıtla. Modeller ve veri hazır.</p><ol><li><code>sorgu_say(engine)</code> adında bir <b>bağlam yöneticisi</b> yaz: blok içinde çalıştırılan SQL ifadelerini sayan bir liste versin (<code>with sorgu_say(engine) as sayac:</code> → blok sonunda <code>len(sayac)</code>). Blok bitince dinleyiciyi kaldırsın (<code>event.remove</code>).</li><li><code>musteri_ozeti(session)</code>: her müşteri için <code>(ad, siparis_adedi, toplam)</code> demetlerini müşteri id sırasıyla döndürsün; siparişsiz müşteriler <code>(ad, 0, 0)</code> ile yer alsın. Müşteri sayısından bağımsız olarak <b>en fazla 2 sorgu</b> atmalı.</li></ol>',
      start: 'from sqlalchemy import create_engine, select, func, ForeignKey\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, Session\n\n\nclass Base(DeclarativeBase):\n    pass\n\n\nclass Musteri(Base):\n    __tablename__ = "musteri"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    ad: Mapped[str]\n    sehir: Mapped[str]\n    siparisler: Mapped[list["Siparis"]] = relationship(back_populates="musteri")\n\n\nclass Siparis(Base):\n    __tablename__ = "siparis"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    tutar: Mapped[float]\n    musteri_id: Mapped[int] = mapped_column(ForeignKey("musteri.id"))\n    musteri: Mapped["Musteri"] = relationship(back_populates="siparisler")\nfrom contextlib import contextmanager\nfrom sqlalchemy import event\n\n\ndef sorgu_say(engine):\n    pass\n\n\ndef musteri_ozeti(session):\n    sonuc = []\n    for m in session.scalars(select(Musteri).order_by(Musteri.id)):\n        sonuc.append((m.ad, len(m.siparisler), sum(s.tutar for s in m.siparisler)))\n    return sonuc\n',
      sol: 'from sqlalchemy import create_engine, select, func, ForeignKey\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, Session\n\n\nclass Base(DeclarativeBase):\n    pass\n\n\nclass Musteri(Base):\n    __tablename__ = "musteri"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    ad: Mapped[str]\n    sehir: Mapped[str]\n    siparisler: Mapped[list["Siparis"]] = relationship(back_populates="musteri")\n\n\nclass Siparis(Base):\n    __tablename__ = "siparis"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    tutar: Mapped[float]\n    musteri_id: Mapped[int] = mapped_column(ForeignKey("musteri.id"))\n    musteri: Mapped["Musteri"] = relationship(back_populates="siparisler")\nfrom contextlib import contextmanager\nfrom sqlalchemy import event\nfrom sqlalchemy.orm import selectinload\n\n\n@contextmanager\ndef sorgu_say(engine):\n    sayac = []\n\n    def dinle(conn, cursor, sql, params, context, executemany):\n        sayac.append(sql)\n\n    event.listen(engine, "before_cursor_execute", dinle)\n    try:\n        yield sayac\n    finally:\n        event.remove(engine, "before_cursor_execute", dinle)\n\n\ndef musteri_ozeti(session):\n    q = select(Musteri).options(selectinload(Musteri.siparisler)).order_by(Musteri.id)\n    sonuc = []\n    for m in session.scalars(q):\n        sonuc.append((m.ad, len(m.siparisler), sum(s.tutar for s in m.siparisler)))\n    return sonuc\n',
      tests: 'engine = create_engine("sqlite+pysqlite:///:memory:")\nBase.metadata.create_all(engine)\nwith Session(engine) as s:\n    s.add_all([\n        Musteri(ad="Ayşe", sehir="İzmir", siparisler=[Siparis(tutar=120.0), Siparis(tutar=80.0)]),\n        Musteri(ad="Mehmet", sehir="Ankara", siparisler=[Siparis(tutar=300.0)]),\n        Musteri(ad="Zeynep", sehir="İzmir", siparisler=[Siparis(tutar=50.0)]),\n        Musteri(ad="Can", sehir="Bursa"),\n    ])\n    s.commit()\nwith Session(engine) as s:\n    s.add_all([Musteri(ad=f"Müşteri {i}", sehir="Bursa", siparisler=[Siparis(tutar=10.0)]) for i in range(20)])\n    s.commit()\nwith sorgu_say(engine) as sayac:\n    with Session(engine) as s:\n        s.execute(select(func.count()).select_from(Musteri)).scalar()\nassert len(sayac) == 1, f"sorgu_say tek sorguyu 1 saymalı, gelen {len(sayac)}"\nwith Session(engine) as s:\n    with sorgu_say(engine) as sayac:\n        r = musteri_ozeti(s)\n    assert len(sayac) <= 2, f"musteri_ozeti en fazla 2 sorgu atmalı, {len(sayac)} attı (N+1)"\nassert r[:4] == [("Ayşe", 2, 200.0), ("Mehmet", 1, 300.0), ("Zeynep", 1, 50.0), ("Can", 0, 0)], f"ilk dört satır hatalı: {r[:4]}"\nassert len(r) == 24 and r[-1] == ("Müşteri 19", 1, 10.0), "tüm müşteriler id sırasıyla yer almalı"\nwith Session(engine) as s:\n    with sorgu_say(engine) as sayac:\n        pass\n    s.execute(select(Musteri)).all()\nassert len(sayac) == 0, "blok bittikten sonra dinleyici kaldırılmalı (event.remove)"\n',
      hints: ['@contextmanager ile: dinleyiciyi event.listen ile ekle, try içinde yield sayac, finally içinde event.remove.', 'before_cursor_execute dinleyicisi (conn, cursor, statement, parameters, context, executemany) argümanlarını alır.', 'Sorguya .options(selectinload(Musteri.siparisler)) ekle: tüm siparişler tek ek sorguda gelir.'],
      why: 'Sorgu sayısını ölçmeden yapılan performans iyileştirmesi tahmindir. selectinload, müşteri sayısı ne olursa olsun 2 sorgu atar (müşteriler + IN listesiyle siparişler). Sayacı testlere koymak, birinin ileride ilişkiye tembel erişim ekleyip sorunu geri getirmesini engeller.' },
    { id: 'sqlalchemy-orm-11',
      t: 'code',
      stage: 'Mini proje',
      diff: 3,
      q: '<p>Anadolu Market sipariş servisi. <code>Urun(id, ad, fiyat, stok)</code> ve <code>Siparis(id, musteri, tutar)</code> modelleri hazır. <code>siparis_olustur(engine, musteri, kalemler)</code> fonksiyonunu yaz; <code>kalemler</code> <code>{urun_id: adet}</code> sözlüğüdür.</p><ul><li>Boş sepet ya da pozitif olmayan adet: <code>ValueError</code></li><li>Olmayan ürün: <code>LookupError</code></li><li>Herhangi bir üründe stok yetmezse: <code>ValueError</code> ve <b>hiçbir</b> stok değişmez, sipariş oluşmaz</li><li>Başarılıysa: stoklar düşer, tutar = Σ fiyat × adet (2 basamağa yuvarlanmış) olan bir <code>Siparis</code> eklenir; fonksiyon <code>(siparis_id, tutar)</code> döndürür.</li></ul><p>Ayrıca <code>musteri_cirosu(engine, musteri)</code>: o müşterinin sipariş tutarları toplamı (SQL <code>SUM</code> ile; yoksa 0).</p>',
      start: 'from sqlalchemy import create_engine, select, func\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session\n\n\nclass Base(DeclarativeBase):\n    pass\n\n\nclass Urun(Base):\n    __tablename__ = "urun"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    ad: Mapped[str]\n    fiyat: Mapped[float]\n    stok: Mapped[int]\n\n\nclass Siparis(Base):\n    __tablename__ = "siparis"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    musteri: Mapped[str]\n    tutar: Mapped[float]\n\n\ndef siparis_olustur(engine, musteri, kalemler):\n    pass\n\n\ndef musteri_cirosu(engine, musteri):\n    pass\n',
      sol: 'from sqlalchemy import create_engine, select, func\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session\n\n\nclass Base(DeclarativeBase):\n    pass\n\n\nclass Urun(Base):\n    __tablename__ = "urun"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    ad: Mapped[str]\n    fiyat: Mapped[float]\n    stok: Mapped[int]\n\n\nclass Siparis(Base):\n    __tablename__ = "siparis"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    musteri: Mapped[str]\n    tutar: Mapped[float]\n\n\ndef siparis_olustur(engine, musteri, kalemler):\n    if not kalemler or any(adet <= 0 for adet in kalemler.values()):\n        raise ValueError("Sepet boş ya da adet hatalı")\n    with Session(engine) as s, s.begin():\n        urunler = {u.id: u for u in s.scalars(select(Urun).where(Urun.id.in_(list(kalemler))))}\n        eksik = set(kalemler) - set(urunler)\n        if eksik:\n            raise LookupError(f"Ürün yok: {sorted(eksik)}")\n        tutar = 0.0\n        for uid, adet in kalemler.items():\n            u = urunler[uid]\n            if u.stok < adet:\n                raise ValueError(f"{u.ad} için stok yetersiz")\n            u.stok -= adet\n            tutar += u.fiyat * adet\n        siparis = Siparis(musteri=musteri, tutar=round(tutar, 2))\n        s.add(siparis)\n        s.flush()\n        return siparis.id, siparis.tutar\n\n\ndef musteri_cirosu(engine, musteri):\n    with Session(engine) as s:\n        toplam = s.scalar(select(func.sum(Siparis.tutar)).where(Siparis.musteri == musteri))\n    return toplam or 0\n',
      tests: 'engine = create_engine("sqlite+pysqlite:///:memory:")\nBase.metadata.create_all(engine)\nwith Session(engine) as s, s.begin():\n    s.add_all([Urun(ad="Çay", fiyat=85.5, stok=10), Urun(ad="Kahve", fiyat=240.0, stok=2), Urun(ad="Şeker", fiyat=32.25, stok=5)])\ndef stoklar():\n    with Session(engine) as s:\n        return [u.stok for u in s.scalars(select(Urun).order_by(Urun.id))]\nassert siparis_olustur(engine, "Ayşe", {1: 2, 3: 1}) == (1, 203.25), "2 x 85.5 + 32.25 = 203.25 ve ilk sipariş id 1"\nassert stoklar() == [8, 2, 4], "stoklar düşmeli"\nfor kalem, hata in [({2: 3, 1: 1}, ValueError), ({1: 1, 99: 1}, LookupError), ({}, ValueError), ({1: 0}, ValueError)]:\n    try:\n        siparis_olustur(engine, "Mehmet", kalem)\n        assert False, f"{kalem} için {hata.__name__} beklenir"\n    except hata:\n        pass\nassert stoklar() == [8, 2, 4], "başarısız siparişler hiçbir stoğu değiştirmemeli"\nassert siparis_olustur(engine, "Ayşe", {2: 2}) == (2, 480.0), "ikinci sipariş id 2, tutar 480"\nassert musteri_cirosu(engine, "Ayşe") == 683.25, "Ayşe cirosu 203.25 + 480 = 683.25"\nassert musteri_cirosu(engine, "Mehmet") == 0, "siparişi olmayan müşteri cirosu 0"\n',
      hints: ['Tüm işi tek with Session(engine) as s, s.begin(): bloğunda yap; herhangi bir hata her şeyi geri alır.', 'Ürünleri tek sorguda çek: select(Urun).where(Urun.id.in_(list(kalemler))) ve id → nesne sözlüğü kur.', 'Siparişin id\'sini commit\'ten önce öğrenmek için s.add(...) sonrası s.flush() çağır.'],
      why: 'Gerçek bir sipariş servisi tam olarak böyle çalışır: tüm doğrulamalar ve güncellemeler tek transaction\'da, ürünler tek sorguda (N+1 yok), sipariş numarası flush ile alınır. Herhangi bir adım başarısız olursa rollback stokları korur.' }
  ],
  faq: [
    { q: 'ORM öğrenince SQL bilmeme gerek kalır mı?',
      a: 'Hayır. ORM SQL üretir; yavaş bir sayfayı düzeltmek, doğru indeksi seçmek ya da karmaşık bir raporu yazmak için üretilen SQL\'i okuyabilmen gerekir. Kesit SQL\'de öğrendiklerin burada doğrudan işe yarar. create_engine(..., echo=True) ile üretilen her SQL\'i günlükte görebilirsin.' },
    { q: 'session.query() ile select() arasındaki fark ne?',
      a: 'session.query() 1.x döneminin API\'sidir ve hâlâ çalışır ama "eski" (legacy) kabul edilir. 2.0 stilinde aynı select() ifadesi hem Core\'da hem ORM\'de kullanılır, tip denetleyicileriyle daha iyi çalışır. Yeni kodda select() kullan; eski projelerde query() göreceğini bil.' },
    { q: 'SQLite ile geliştirip PostgreSQL\'e geçmek sorun çıkarır mı?',
      a: 'Basit CRUD\'da genelde çıkarmaz, ama tarih/saat türleri, büyük-küçük harf duyarlılığı, eşzamanlı yazma ve JSON gibi özelliklerde farklar vardır. Testlerini üretimdekiyle aynı veritabanında (ör. Docker ile PostgreSQL) da çalıştırmak en güvenli yoldur.' },
    { q: 'Flask-SQLAlchemy ile SQLAlchemy aynı şey mi?',
      a: 'Flask-SQLAlchemy, SQLAlchemy\'yi Flask uygulamasına bağlayan ince bir katmandır: yapılandırmadan engine kurar, istek başına session yönetir, db.Model taban sınıfını sağlar. Altta çalışan yine bu derste öğrendiğin SQLAlchemy\'dir.' }
  ],
  mistakes: [
    { why: 'f-string ile kurulan SQL, text() içinde bile enjeksiyona açıktır; değerleri bağlı parametreyle gönder.',
      bad: 'conn.execute(text(f"SELECT * FROM musteri WHERE ad = \'{ad}\'"))',
      good: 'conn.execute(text("SELECT * FROM musteri WHERE ad = :ad"), {"ad": ad})' },
    { why: 'Session with bloğu commit yapmaz; kapanırken değişiklikler geri alınır.',
      bad: 'with Session(engine) as s:\n    s.add(Musteri(ad="Ece", sehir="İzmir"))',
      good: 'with Session(engine) as s:\n    s.add(Musteri(ad="Ece", sehir="İzmir"))\n    s.commit()' },
    { why: 'Döngüde ilişkiye tembel erişim her müşteri için ayrı sorgu atar (N+1).',
      bad: 'for m in s.scalars(select(Musteri)):\n    print(m.ad, len(m.siparisler))',
      good: 'q = select(Musteri).options(selectinload(Musteri.siparisler))\nfor m in s.scalars(q):\n    print(m.ad, len(m.siparisler))' },
    { why: 'Toplamı Python\'da hesaplamak tüm satırları belleğe taşır; SQL\'de SUM tek satır döndürür.',
      bad: 'toplam = sum(x.tutar for x in s.scalars(select(Siparis)))',
      good: 'toplam = s.scalar(select(func.sum(Siparis.tutar)))' },
    { why: 'Session kapandıktan sonra süresi dolmuş özniteliğe erişmek DetachedInstanceError verir.',
      bad: 'with Session(engine) as s:\n    m = s.get(Musteri, 1)\n    s.commit()\nprint(m.ad)',
      good: 'with Session(engine) as s:\n    m = s.get(Musteri, 1)\n    s.commit()\n    ad = m.ad\nprint(ad)' }
  ] }
);
})(window);
