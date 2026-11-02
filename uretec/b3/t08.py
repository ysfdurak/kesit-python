SA_MODELS = r'''
from sqlalchemy import ForeignKey, String, create_engine, event, func, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, selectinload

class Base(DeclarativeBase):
    pass

class Musteri(Base):
    __tablename__ = "musteri"
    id: Mapped[int] = mapped_column(primary_key=True)
    ad: Mapped[str] = mapped_column(String(50))
    sehir: Mapped[str] = mapped_column(String(30))
    siparisler: Mapped[list["Siparis"]] = relationship(back_populates="musteri")

class Siparis(Base):
    __tablename__ = "siparis"
    id: Mapped[int] = mapped_column(primary_key=True)
    musteri_id: Mapped[int] = mapped_column(ForeignKey("musteri.id"))
    tutar: Mapped[int]
    musteri: Mapped[Musteri] = relationship(back_populates="siparisler")
'''

SA_SETUP = r'''
_engine = create_engine("sqlite://")
Base.metadata.create_all(_engine)
with Session(_engine) as _s:
    _s.add_all([
        Musteri(id=1, ad="Ayşe", sehir="Ankara"), Musteri(id=2, ad="Can", sehir="İzmir"),
        Musteri(id=3, ad="Deniz", sehir="Ankara"), Musteri(id=4, ad="Ece", sehir="Bursa"),
    ])
    _s.add_all([
        Siparis(musteri_id=1, tutar=100), Siparis(musteri_id=1, tutar=250),
        Siparis(musteri_id=2, tutar=400), Siparis(musteri_id=3, tutar=50),
    ])
    _s.commit()
'''

T = [
dict(id='b-381', topic='Tasarım Kalıpları', diff=3, kind='yaz',
  title='Birleştirilebilir iş kuralları (Specification)',
  q='<p>Kampanya ekibi hedef müşteri kurallarını kod yazmadan birleştirmek istiyor: <code>(SehirKurali("Ankara") &amp; MinHarcama(500)) | ~AktifKurali()</code>. <code>Kural</code> taban sınıfını yaz: <code>Kural(kosul)</code> bir yüklem (predicate) fonksiyonu sarar; <code>uygun(m)</code> sonucu bool döndürür; <code>&amp;</code>, <code>|</code>, <code>~</code> operatörleri yeni bir <code>Kural</code> üretir (<code>__and__</code>, <code>__or__</code>, <code>__invert__</code>). Ardından alt sınıfları yaz: <code>SehirKurali(sehir)</code>, <code>MinHarcama(tutar)</code> (harcama ≥ tutar), <code>AktifKurali()</code> (<code>m["aktif"]</code>). Müşteriler sözlüktür.</p>',
  start=r'''
class Kural:
    pass
''',
  sol=r'''
class Kural:
    def __init__(self, kosul):
        self.kosul = kosul

    def uygun(self, m):
        return bool(self.kosul(m))

    def __and__(self, diger):
        return Kural(lambda m: self.uygun(m) and diger.uygun(m))

    def __or__(self, diger):
        return Kural(lambda m: self.uygun(m) or diger.uygun(m))

    def __invert__(self):
        return Kural(lambda m: not self.uygun(m))


class SehirKurali(Kural):
    def __init__(self, sehir):
        super().__init__(lambda m: m["sehir"] == sehir)


class MinHarcama(Kural):
    def __init__(self, tutar):
        super().__init__(lambda m: m["harcama"] >= tutar)


class AktifKurali(Kural):
    def __init__(self):
        super().__init__(lambda m: m["aktif"])
''',
  tests=r'''
musteriler = [
    {"ad": "Ayşe", "sehir": "Ankara", "harcama": 800, "aktif": True},
    {"ad": "Can", "sehir": "Ankara", "harcama": 200, "aktif": True},
    {"ad": "Deniz", "sehir": "İzmir", "harcama": 900, "aktif": False},
    {"ad": "Ece", "sehir": "İzmir", "harcama": 100, "aktif": True},
]
k = (SehirKurali("Ankara") & MinHarcama(500)) | ~AktifKurali()
assert [m["ad"] for m in musteriler if k.uygun(m)] == ["Ayşe", "Deniz"], "Ankara ve ≥500 olanlar ya da aktif olmayanlar: Ayşe, Deniz"
assert isinstance(k, Kural), "Operatörler yeni bir Kural döndürmeli"
assert MinHarcama(200).uygun(musteriler[1]) is True, "Sınır dahil (≥) ve bool dönmeli"
k2 = ~(SehirKurali("İzmir") | MinHarcama(700))
assert [m["ad"] for m in musteriler if k2.uygun(m)] == ["Can"], "De Morgan: ne İzmir ne ≥700 → Can"
assert Kural(lambda m: m["harcama"] > 850).uygun(musteriler[2]), "Taban Kural doğrudan lambda ile de kullanılabilmeli"
''',
  hints=['Her operatör, iki kuralın <code>uygun</code> sonuçlarını birleştiren bir lambda ile yeni <code>Kural</code> döndürür.', '<code>&amp;</code> → <code>__and__</code>, <code>|</code> → <code>__or__</code>, <code>~</code> → <code>__invert__</code> (tek operandlı).', 'Alt sınıflar yalnız uygun lambda ile <code>super().__init__</code> çağırır.'],
  why='Specification kalıbı iş kurallarını küçük, test edilebilir nesnelere böler ve bunları mantıksal operatörlerle birleştirir; yeni kampanya için yeni if/else yazılmaz (açık/kapalı ilkesi). Operatör aşırı yükleme okunur bir alan dili (DSL) sağlar; and/or anahtar kelimeleri aşırı yüklenemediği için &, |, ~ kullanılır (polars/pandas ile aynı neden). Değerlendirme kural ağacının boyutuyla doğrusal; kısa devre korunur. ORM’lerde aynı fikir SQLAlchemy and_(), or_() ifadeleri olarak SQL’e çevrilir.',
  tags=['specification', 'operatör aşırı yükleme', 'bileşim'], min=12),

dict(id='b-382', topic='SQLAlchemy', diff=2, kind='predict', needs=['sqlalchemy'],
  title='Oturumun kimlik haritası (identity map)',
  q='<p>Aynı oturumda aynı müşteriyi iki kez getiren bu kod ne yazdırır?</p>',
  code=r'''
from sqlalchemy import String, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

class Base(DeclarativeBase):
    pass

class Musteri(Base):
    __tablename__ = "musteri"
    id: Mapped[int] = mapped_column(primary_key=True)
    ad: Mapped[str] = mapped_column(String(50))

engine = create_engine("sqlite://")
Base.metadata.create_all(engine)
with Session(engine) as s:
    s.add(Musteri(id=1, ad="Ayşe"))
    s.commit()
    a = s.get(Musteri, 1)
    b = s.get(Musteri, 1)
    a.ad = "Ayşe K."
    print(a is b, b.ad)
''',
  o=['True Ayşe K.', 'False Ayşe', 'False Ayşe K.', 'True Ayşe'], a=0,
  hints=['Session her birincil anahtar için bellekte tek bir nesne tutar.', 'İki değişken aynı nesneyi gösteriyorsa birindeki değişiklik diğerinde de görünür.'],
  why='Session bir kimlik haritası (identity map) tutar: aynı oturumda aynı birincil anahtar için hep aynı Python nesnesi döner; get() nesne haritadaysa veritabanına gitmez bile. Bu yüzden a is b True’dur ve değişiklik ikisinde de görünür; flush/commit ile tek bir UPDATE gider. Farklı oturumlar farklı nesneler görür. Uzun ömürlü oturumlar bayat veri tutabilir; web uygulamalarında istek başına bir oturum kalıbı kullanılır.',
  tags=['Session', 'identity map', 'ORM'], min=4),

dict(id='b-383', topic='SQLAlchemy', diff=2, kind='order', needs=['sqlalchemy'],
  title='Core ile parametreli sorgu',
  q='<p>SQLAlchemy Core ve <code>text()</code> ile tablo oluşturan, parametreli toplu ekleme yapan ve şehir bazında toplamı yazdıran programın satırlarını sırala.</p>',
  lines=[
    'from sqlalchemy import create_engine, text',
    'engine = create_engine("sqlite://")',
    'with engine.begin() as con:',
    '    con.execute(text("CREATE TABLE siparis (sehir TEXT, tutar INT)"))',
    '    con.execute(text("INSERT INTO siparis VALUES (:s, :t)"), [{"s": "Ankara", "t": 100}, {"s": "İzmir", "t": 50}, {"s": "Ankara", "t": 30}])',
    '    sonuc = con.execute(text("SELECT sehir, SUM(tutar) FROM siparis GROUP BY sehir ORDER BY sehir")).all()',
    'print(sonuc)',
  ],
  expect="[('Ankara', 130), ('İzmir', 50)]\n",
  hints=['Tablo, içine veri eklenmeden önce oluşturulmalı.', 'engine.begin() bloğu sonunda otomatik COMMIT yapar; print bloğun dışında olabilir.'],
  why='engine.begin() bir bağlantı açar ve blok başarıyla biterse COMMIT, hata olursa ROLLBACK yapar. text() içindeki :s, :t adlı parametreler sürücüye ayrı gönderilir; değerler SQL metnine yapıştırılmadığı için SQL enjeksiyonu engellenir. Sözlük listesi vermek executemany ile toplu ekleme yapar (tek tek execute’tan hızlı). .all() sonuçları Row listesi olarak alır.',
  tags=['Core', 'text', 'parametre', 'transaction'], min=4),

dict(id='b-384', topic='SQLAlchemy', diff=2, kind='rehberli', needs=['sqlalchemy'],
  title='ORM select ile filtreli ürün listesi',
  q='<p><code>stoktaki_ucuzlar(session, max_fiyat)</code> fonksiyonunu SQLAlchemy 2.0 tarzıyla yaz: stoğu 0\'dan büyük ve fiyatı <code>max_fiyat</code> veya altında olan ürünlerin <b>adlarını</b> fiyata göre artan (eşitlikte ada göre) sıralı liste olarak döndürsün. <code>Urun</code> modeli verilmiştir.</p>',
  guide=['<code>stmt = select(Urun.ad)</code> ile yalnız ad sütununu seç.', '<code>.where(Urun.stok &gt; 0, Urun.fiyat &lt;= max_fiyat)</code> — birden çok koşul VE ile birleşir.', '<code>.order_by(Urun.fiyat, Urun.ad)</code> ekle.', '<code>session.scalars(stmt).all()</code> tek sütunlu sonucu düz liste verir.'],
  example=r'''
from sqlalchemy import String, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

class B(DeclarativeBase):
    pass

class Personel(B):
    __tablename__ = "personel"
    id: Mapped[int] = mapped_column(primary_key=True)
    ad: Mapped[str] = mapped_column(String(40))
    maas: Mapped[int]

e = create_engine("sqlite://")
B.metadata.create_all(e)
with Session(e) as s:
    s.add_all([Personel(ad="Ali", maas=40), Personel(ad="Ece", maas=65)])
    s.commit()
    print(s.scalars(select(Personel.ad).where(Personel.maas > 50)).all())
''',
  start=r'''
from sqlalchemy import String, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

class Base(DeclarativeBase):
    pass

class Urun(Base):
    __tablename__ = "urun"
    id: Mapped[int] = mapped_column(primary_key=True)
    ad: Mapped[str] = mapped_column(String(50))
    fiyat: Mapped[float]
    stok: Mapped[int]

def stoktaki_ucuzlar(session, max_fiyat):
    stmt = select(Urun.ad)
    # TODO 1: stok > 0 ve fiyat <= max_fiyat koşullarını ekle
    # TODO 2: fiyat, sonra ad sırasıyla sırala
    # TODO 3: scalars(...).all() ile listeyi döndür
    return []
''',
  sol=r'''
from sqlalchemy import String, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

class Base(DeclarativeBase):
    pass

class Urun(Base):
    __tablename__ = "urun"
    id: Mapped[int] = mapped_column(primary_key=True)
    ad: Mapped[str] = mapped_column(String(50))
    fiyat: Mapped[float]
    stok: Mapped[int]

def stoktaki_ucuzlar(session, max_fiyat):
    stmt = (
        select(Urun.ad)
        .where(Urun.stok > 0, Urun.fiyat <= max_fiyat)
        .order_by(Urun.fiyat, Urun.ad)
    )
    return session.scalars(stmt).all()
''',
  tests=r'''
e = create_engine("sqlite://")
Base.metadata.create_all(e)
with Session(e) as s:
    s.add_all([
        Urun(ad="Kalem", fiyat=15, stok=100), Urun(ad="Defter", fiyat=40, stok=0),
        Urun(ad="Silgi", fiyat=15, stok=20), Urun(ad="Çanta", fiyat=450, stok=5),
        Urun(ad="Cetvel", fiyat=25, stok=8),
    ])
    s.commit()
    r = list(stoktaki_ucuzlar(s, 40))
    assert r == ["Kalem", "Silgi", "Cetvel"], f"Beklenen ['Kalem', 'Silgi', 'Cetvel'] (Defter stokta yok); gelen {r}"
    assert list(stoktaki_ucuzlar(s, 10)) == [], "Uygun ürün yoksa boş liste"
''',
  hints=['2.0 tarzında sorgu <code>select()</code> ile kurulur, <code>session.query</code> eski stildir.', '<code>where</code> içine virgülle birden çok koşul verilebilir.', '<code>return session.scalars(stmt).all()</code>'],
  why='select() ifadesi Python operatörlerini (>, <=) SQL’e çevirir ve değerleri parametre olarak bağlar; SQL enjeksiyonu riski yoktur. Yalnız ihtiyaç duyulan sütunu seçmek tüm nesneyi yüklemekten ucuzdur. scalars() ilk sütunu düz liste olarak verir, execute() ise Row nesneleri döndürür. Performans veritabanına bağlı: stok ve fiyat üzerinde indeks varsa filtre O(log n) arama ile başlar. Eşitlikte ikinci sıralama anahtarı sonucu deterministik yapar.',
  tags=['select', 'where', 'order_by', 'scalars'], min=6),

dict(id='b-385', topic='SQLAlchemy', diff=3, kind='bug', needs=['sqlalchemy'],
  title='N+1 sorgu sorunu',
  q='<p>Kodda bir performans hatası var, bul ve düzelt. <code>musteri_cirolari(session)</code> her müşterinin toplam sipariş tutarını <code>{ad: toplam}</code> olarak döndürüyor. Sonuç doğru, ama 1 müşteri sorgusunun ardından <b>her müşteri için ayrı</b> bir sipariş sorgusu gidiyor (N+1). Testte veritabanına giden sorgu sayısı ölçülüyor ve en fazla 2 olmalı. Modeller verilmiştir.</p>',
  start=SA_MODELS + r'''

def musteri_cirolari(session):
    sonuc = {}
    for m in session.scalars(select(Musteri)):
        sonuc[m.ad] = sum(s.tutar for s in m.siparisler)
    return sonuc
''',
  sol=SA_MODELS + r'''

def musteri_cirolari(session):
    stmt = select(Musteri).options(selectinload(Musteri.siparisler))
    sonuc = {}
    for m in session.scalars(stmt):
        sonuc[m.ad] = sum(s.tutar for s in m.siparisler)
    return sonuc
''',
  tests=SA_SETUP + r'''
sayac = [0]
def _say(*a, **k):
    sayac[0] += 1
event.listen(_engine, "before_cursor_execute", _say)
with Session(_engine) as s:
    r = musteri_cirolari(s)
assert r == {"Ayşe": 350, "Can": 400, "Deniz": 50, "Ece": 0}, f"Cirolar yanlış: {r}"
assert sayac[0] <= 2, f"{sayac[0]} sorgu çalıştı; en fazla 2 olmalı. İlişkiyi selectinload ile önceden yükle"
''',
  hints=['Tembel (lazy) ilişki <code>m.siparisler</code>\'e ilk erişimde ayrı bir SELECT çalıştırır.', 'İlişkiyi ana sorguyla birlikte yüklemek için sorguya yükleme seçeneği ekle.', '<code>select(Musteri).options(selectinload(Musteri.siparisler))</code> — tüm siparişleri tek bir IN sorgusuyla getirir.'],
  why='N+1 problemi ORM’lerin en yaygın performans tuzağıdır: N müşteri için N ek sorgu, her biri ağ gidiş-dönüşü demektir. selectinload ikinci bir SELECT ... WHERE musteri_id IN (...) ile tüm ilişkiyi toplar: toplam 2 sorgu. joinedload tek sorguda LEFT JOIN yapar ama satır çoğaltır (bire-çok ilişkide büyük veri). Yalnız toplam gerekiyorsa en verimlisi veritabanında toplamaktır: select(Musteri.ad, func.coalesce(func.sum(Siparis.tutar), 0)).outerjoin(...).group_by(Musteri.id) — tek sorgu ve nesne yüklemeden. Sorguları görmek için create_engine(..., echo=True).',
  tags=['N+1', 'selectinload', 'lazy loading', 'ORM performansı'], min=8),

dict(id='b-386', topic='SQLAlchemy', diff=2, kind='yaz', needs=['sqlalchemy'],
  title='Veritabanında toplama: şehir cirosu',
  q='<p><code>sehir_ciro(session)</code> fonksiyonunu yaz: tek bir SQL sorgusuyla (<code>select</code> + <code>join</code> + <code>group_by</code>) her şehrin toplam sipariş tutarını hesaplayıp <code>[(sehir, toplam), ...]</code> listesini <b>toplam azalan</b> sırada döndürsün. Siparişi olmayan şehirler listede yer almasın. <code>Musteri</code> ve <code>Siparis</code> modelleri ile <code>func</code> içe aktarılmıştır.</p>',
  start=SA_MODELS + r'''

def sehir_ciro(session):
    pass
''',
  sol=SA_MODELS + r'''

def sehir_ciro(session):
    toplam = func.sum(Siparis.tutar).label("toplam")
    stmt = (
        select(Musteri.sehir, toplam)
        .join(Siparis, Siparis.musteri_id == Musteri.id)
        .group_by(Musteri.sehir)
        .order_by(toplam.desc())
    )
    return [tuple(r) for r in session.execute(stmt).all()]
''',
  tests=SA_SETUP + r'''
with Session(_engine) as s:
    r = [tuple(x) for x in sehir_ciro(s)]
assert r == [("İzmir", 400), ("Ankara", 400)] or r == [("Ankara", 400), ("İzmir", 400)], f"Ankara (350+50) ve İzmir (400) toplamları 400 olmalı; Bursa (siparişsiz) yok; gelen {r}"
with Session(_engine) as s:
    s.add(Siparis(musteri_id=4, tutar=900))
    s.commit()
    r2 = [tuple(x) for x in sehir_ciro(s)]
assert r2[0] == ("Bursa", 900), f"Toplam azalan sırada olmalı; ilk satır ('Bursa', 900) beklenir, gelen {r2[0] if r2 else r2}"
assert len(r2) == 3, "Üç şehir"
''',
  hints=['Toplama ifadesi: <code>func.sum(Siparis.tutar)</code>; <code>.label("toplam")</code> ile adlandırırsan sıralamada da kullanabilirsin.', '<code>select(Musteri.sehir, toplam).join(Siparis, Siparis.musteri_id == Musteri.id)</code>', '<code>.group_by(Musteri.sehir).order_by(toplam.desc())</code>; sonuç için <code>session.execute(stmt).all()</code>.'],
  why='Toplamayı veritabanında yapmak yalnız sonuç satırlarını ağdan getirir; tüm siparişleri Python’a çekip toplamaktan çok daha hızlı ve az bellekli. INNER JOIN siparişsiz müşterileri doğal olarak eler (dahil etmek için outerjoin + coalesce). label ile adlandırılan ifade ORDER BY’da yeniden kullanılır. Karmaşıklık veritabanı planına bağlı (hash aggregate ~O(n)). Alternatif: aynı sorguyu text() ile yazmak ya da pandas.read_sql + groupby (küçük veri için).',
  tags=['func.sum', 'join', 'group_by', 'label'], min=7),

dict(id='b-387', topic='SQLAlchemy', diff=3, kind='yaz', needs=['sqlalchemy'],
  title='Atomik havale (transaction)',
  q='<p><code>havale(session, kaynak_id, hedef_id, tutar)</code> fonksiyonunu yaz: <code>with session.begin():</code> bloğu içinde iki hesabı <code>session.get</code> ile al, hesap yoksa <code>LookupError</code>, tutar ≤ 0 ya da bakiye yetersizse <code>ValueError</code> fırlat; değilse kaynaktan düşüp hedefe ekle. Hata durumunda veritabanında <b>hiçbir değişiklik</b> kalmamalı. <code>Hesap</code> modeli verilmiştir; fonksiyon her çağrıda yeni (transaction başlatmamış) bir oturum alır.</p>',
  start=r'''
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

class Base(DeclarativeBase):
    pass

class Hesap(Base):
    __tablename__ = "hesap"
    id: Mapped[int] = mapped_column(primary_key=True)
    bakiye: Mapped[int]

def havale(session, kaynak_id, hedef_id, tutar):
    pass
''',
  sol=r'''
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

class Base(DeclarativeBase):
    pass

class Hesap(Base):
    __tablename__ = "hesap"
    id: Mapped[int] = mapped_column(primary_key=True)
    bakiye: Mapped[int]

def havale(session, kaynak_id, hedef_id, tutar):
    with session.begin():
        kaynak = session.get(Hesap, kaynak_id)
        hedef = session.get(Hesap, hedef_id)
        if kaynak is None or hedef is None:
            raise LookupError("Hesap bulunamadı")
        if tutar <= 0:
            raise ValueError("Tutar pozitif olmalı")
        if kaynak.bakiye < tutar:
            raise ValueError("Yetersiz bakiye")
        kaynak.bakiye -= tutar
        hedef.bakiye += tutar
''',
  tests=r'''
e = create_engine("sqlite://")
Base.metadata.create_all(e)
with Session(e) as s:
    s.add_all([Hesap(id=1, bakiye=500), Hesap(id=2, bakiye=100)])
    s.commit()
def _bakiyeler():
    with Session(e) as s:
        return (s.get(Hesap, 1).bakiye, s.get(Hesap, 2).bakiye)
with Session(e) as s:
    havale(s, 1, 2, 200)
assert _bakiyeler() == (300, 300), f"Havale sonrası (300, 300) olmalı ve COMMIT edilmeli; gelen {_bakiyeler()}"
for args, hata in (((2, 1, 1000), ValueError), ((1, 2, 0), ValueError), ((1, 99, 10), LookupError)):
    with Session(e) as s:
        try:
            havale(s, *args)
            assert False, f"{args} için {hata.__name__} bekleniyordu"
        except hata:
            pass
assert _bakiyeler() == (300, 300), f"Başarısız havaleler hiçbir şeyi değiştirmemeli; gelen {_bakiyeler()}"
''',
  hints=['<code>with session.begin():</code> bloğu normal biterse COMMIT, istisnayla çıkarsa ROLLBACK yapar.', 'Tüm kontrolleri değişiklikten önce yap; istisna yine de bloktan çıkarsa geri alınır.', 'ORM nesnesinin niteliğini değiştirmek yeterli; commit sırasında UPDATE üretilir.'],
  why='Havale iki UPDATE’ten oluşur; ikisi birlikte ya hep ya hiç (atomiklik) olmalı. session.begin() bağlam yöneticisi bunu garanti eder: istisna → ROLLBACK, başarı → COMMIT; elle commit/rollback yazıp unutma riski ortadan kalkar. Eşzamanlı havalelerde iki işlem aynı bakiyeyi okuyabilir: üretimde SELECT ... FOR UPDATE (with_for_update()) ya da iyimser kilit (sürüm sütunu) gerekir; SQLite bunu desteklemez, PostgreSQL destekler. Ayrıca kilitlenmeyi önlemek için hesaplar her zaman id sırasıyla kilitlenir.',
  tags=['transaction', 'session.begin', 'atomiklik', 'rollback'], min=10),

dict(id='b-388', topic='Web Mantığı', diff=1, kind='order', needs=['jinja2'],
  title='Jinja2 ile güvenli HTML üretimi',
  q='<p>Kullanıcıdan gelen müşteri adını HTML listesine <b>güvenli</b> biçimde (otomatik kaçışla) yerleştiren programın satırlarını sırala.</p>',
  lines=[
    'from jinja2 import Environment',
    'env = Environment(autoescape=True)',
    'sablon = env.from_string("<li>{{ ad }}: {{ tutar }} TL</li>")',
    'html = sablon.render(ad="<b>Ayşe</b>", tutar=120)',
    'print(html)',
  ],
  expect='<li>&lt;b&gt;Ayşe&lt;/b&gt;: 120 TL</li>\n',
  hints=['Ortam (Environment) şablondan önce kurulur; şablon render\'dan önce.', 'autoescape=True ortam ayarıdır.'],
  why='autoescape=True değişkenlerdeki <, >, & ve tırnakları HTML varlıklarına çevirir; kullanıcı girdisi etiket olarak yorumlanmaz ve XSS (siteler arası betik) saldırısı engellenir. Flask şablonlarında autoescape varsayılan olarak açıktır; düz jinja2.Environment’ta değildir. Güvendiğin HTML’i kaçışsız basmak için {{ x|safe }} ya da markupsafe.Markup kullanılır — kullanıcı girdisinde asla.',
  tags=['jinja2', 'autoescape', 'XSS'], min=2),

dict(id='b-389', topic='Web Mantığı', diff=2, kind='rehberli', needs=['pydantic'],
  title='Pydantic ile sipariş isteği doğrulama',
  q='<p>API\'ye gelen sipariş JSON\'u doğrulanmalı. <code>SiparisGirdisi</code> pydantic modelini ve <code>dogrula(veri)</code> fonksiyonunu yaz. Alanlar: <code>urun_kodu</code> (<b>iki büyük harf, tire, üç rakam</b>: <code>AB-123</code>), <code>adet</code> (tam sayı, 1-100 arası), <code>email</code> (metin, içinde <code>@</code> olmalı; <code>field_validator</code> ile kontrol et ve küçük harfe çevir), <code>not_</code> (isteğe bağlı metin, varsayılan <code>None</code>). <code>dogrula</code>: geçerliyse <code>(True, model.model_dump())</code>, değilse <code>(False, hatalı_alan_adlarının_sıralı_listesi)</code> döndürsün.</p>',
  guide=['<code>class SiparisGirdisi(BaseModel):</code> içinde <code>urun_kodu: str = Field(pattern=r"^[A-Z]{2}-\\d{3}$")</code>, <code>adet: int = Field(ge=1, le=100)</code>.', '<code>@field_validator("email")</code> + <code>@classmethod</code> ile doğrulayıcı yaz: <code>@</code> yoksa <code>ValueError</code>, varsa <code>v.lower()</code> döndür.', '<code>not_: str | None = None</code>', '<code>dogrula</code>: <code>try: m = SiparisGirdisi(**veri)</code>; <code>except ValidationError as e:</code> içinde <code>e.errors()</code> listesindeki her hatanın <code>loc[0]</code> değerini topla.'],
  example=r'''
from pydantic import BaseModel, Field, ValidationError

class Personel(BaseModel):
    ad: str = Field(min_length=2)
    yas: int = Field(ge=18)

try:
    Personel(ad="A", yas=15)
except ValidationError as e:
    print(sorted(h["loc"][0] for h in e.errors()))
print(Personel(ad="Ece", yas="30").model_dump())   # "30" → 30 dönüştürülür
''',
  start=r'''
from pydantic import BaseModel, Field, ValidationError, field_validator

class SiparisGirdisi(BaseModel):
    # TODO 1: urun_kodu (desen), adet (1-100), email, not_ alanlarını tanımla
    urun_kodu: str
    adet: int

    # TODO 2: email için field_validator yaz

def dogrula(veri):
    # TODO 3: modeli kur; ValidationError'da hatalı alan adlarını sıralı döndür
    return True, veri
''',
  sol=r'''
from pydantic import BaseModel, Field, ValidationError, field_validator

class SiparisGirdisi(BaseModel):
    urun_kodu: str = Field(pattern=r"^[A-Z]{2}-\d{3}$")
    adet: int = Field(ge=1, le=100)
    email: str
    not_: str | None = None

    @field_validator("email")
    @classmethod
    def email_kontrol(cls, v):
        if "@" not in v:
            raise ValueError("geçersiz e-posta")
        return v.lower()

def dogrula(veri):
    try:
        m = SiparisGirdisi(**veri)
    except ValidationError as e:
        return False, sorted({str(h["loc"][0]) for h in e.errors()})
    return True, m.model_dump()
''',
  tests=r'''
ok, r = dogrula({"urun_kodu": "KT-101", "adet": "3", "email": "Ayse@Ornek.com"})
assert ok is True, f"Geçerli istek reddedildi: {r}"
assert r == {"urun_kodu": "KT-101", "adet": 3, "email": "ayse@ornek.com", "not_": None}, f"model_dump yanlış: {r} ('3' → 3, e-posta küçük harf)"
ok, r = dogrula({"urun_kodu": "kt-1", "adet": 0, "email": "ayse.ornek.com"})
assert ok is False and r == ["adet", "email", "urun_kodu"], f"Üç alan da hatalı olmalı ve sıralı dönmeli; gelen {r}"
ok, r = dogrula({"urun_kodu": "AB-123", "adet": 101, "email": "a@b.c", "not_": "kapıya bırakın"})
assert ok is False and r == ["adet"], "adet en fazla 100"
ok, r = dogrula({"urun_kodu": "AB-123", "email": "a@b.c"})
assert ok is False and r == ["adet"], "Eksik zorunlu alan (adet) hata vermeli"
''',
  hints=['Kısıtlar <code>Field(...)</code> ile: desen için <code>pattern</code>, aralık için <code>ge</code>/<code>le</code>.', 'Pydantic v2\'de <code>@field_validator("email")</code> + <code>@classmethod</code>; doğrulayıcı dönüştürülmüş değeri döndürür.', '<code>e.errors()</code> sözlük listesidir; her birinin <code>"loc"</code> demetinin ilk elemanı alan adıdır.'],
  why='Pydantic tip açıklamalarından doğrulama ve dönüştürme (coercion: "3" → 3) üretir; tüm hataları tek seferde toplar, böylece istemciye her alan için anlamlı 422 yanıtı verilebilir. FastAPI istek gövdelerini tam olarak bu modellerle doğrular. Doğrulama O(alan sayısı). Daha sıkı tip istersen model_config = ConfigDict(strict=True) dönüşümü kapatır; gerçek e-posta doğrulaması için pydantic.EmailStr (email-validator paketi) kullanılır. Alternatifler: dataclass + elle kontrol, marshmallow, attrs + cattrs.',
  tags=['pydantic', 'Field', 'field_validator', 'ValidationError'], min=9),

dict(id='b-390', topic='Web Mantığı', diff=2, kind='tamamla',
  title='Yol parametreli mini yönlendirici',
  q='<p>Flask/FastAPI\'deki <code>/siparis/&lt;no&gt;</code> gibi yolların arkasındaki mantığı taklit eden bir yönlendirici var: <code>@rota(desen)</code> dekoratörü deseni regex\'e çevirip (<code>&lt;ad&gt;</code> → adlandırılmış grup) fonksiyonu kaydediyor; <code>yonlendir(yol)</code> eşleşen ilk rotanın fonksiyonunu yol parametreleriyle çağırıyor, eşleşme yoksa <code>"404"</code> döndürüyor. <code>___</code> boşluklarını doldur.</p>',
  start=r'''
import re

ROTALAR = []

def rota(desen):
    regex = re.compile("^" + re.sub(r"<(\w+)>", r"(?P<\1>[^/]+)", desen) + "$")
    def kaydet(f):
        ROTALAR.append((regex, f))
        return f
    return kaydet

def yonlendir(yol):
    for regex, f in ROTALAR:
        m = regex.___(yol)
        if m:
            return f(**m.___())
    return "404"

@rota("/siparis/<no>")
def siparis_detay(no):
    return f"sipariş {no}"

@rota("/musteri/<mid>/siparis/<no>")
def musteri_siparis(mid, no):
    return f"müşteri {mid}, sipariş {no}"
''',
  sol=r'''
import re

ROTALAR = []

def rota(desen):
    regex = re.compile("^" + re.sub(r"<(\w+)>", r"(?P<\1>[^/]+)", desen) + "$")
    def kaydet(f):
        ROTALAR.append((regex, f))
        return f
    return kaydet

def yonlendir(yol):
    for regex, f in ROTALAR:
        m = regex.match(yol)
        if m:
            return f(**m.groupdict())
    return "404"

@rota("/siparis/<no>")
def siparis_detay(no):
    return f"sipariş {no}"

@rota("/musteri/<mid>/siparis/<no>")
def musteri_siparis(mid, no):
    return f"müşteri {mid}, sipariş {no}"
''',
  tests=r'''
assert yonlendir("/siparis/1042") == "sipariş 1042", "Tek parametreli rota"
assert yonlendir("/musteri/7/siparis/55") == "müşteri 7, sipariş 55", "İki parametre adla geçirilmeli"
assert yonlendir("/siparis/1042/iptal") == "404", "Fazladan parça varsa eşleşmemeli (^...$)"
assert yonlendir("/urun/3") == "404", "Bilinmeyen yol 404"
''',
  hints=['Desen başında ^ ve sonunda $ olduğu için baştan eşleştirme yeterli.', 'Regex nesnesinin <code>match</code> metodu; adlandırılmış grupları sözlük olarak veren eşleşme metodu <code>groupdict</code>.', '<code>regex.match(yol)</code> ve <code>f(**m.groupdict())</code>'],
  why='Web çerçeveleri rota desenlerini başlangıçta bir kez regex’e derler; istek geldiğinde rotalar sırayla denenir (O(r) rota sayısı; büyük uygulamalarda önek ağacı/trie kullanılır). Adlandırılmış gruplar (?P<ad>...) parametreleri sözlük olarak verir ve ** ile fonksiyona anahtar kelime argümanı olarak geçer. [^/]+ bir yol parçasını aşmamayı sağlar. Gerçek çerçeveler ayrıca tür dönüştürücü (<int:no>), HTTP metodu ve 405 yanıtı ekler.',
  tags=['routing', 'regex', 'groupdict', 'dekoratör'], min=4),
]
