/* Kesit Python — pratik bankası: ileri görevler (b-381 … b-390) */
(function (W) {
'use strict';
const B = W.PY_BANK = W.PY_BANK || [];
B.push(
  {
    id: 'b-381',
    lv: 'ileri',
    topic: 'Tasarım Kalıpları',
    diff: 3,
    kind: 'yaz',
    title: 'Birleştirilebilir iş kuralları (Specification)',
    q: '<p>Kampanya ekibi hedef müşteri kurallarını kod yazmadan birleştirmek istiyor: <code>(SehirKurali("Ankara") &amp; MinHarcama(500)) | ~AktifKurali()</code>. <code>Kural</code> taban sınıfını yaz: <code>Kural(kosul)</code> bir yüklem (predicate) fonksiyonu sarar; <code>uygun(m)</code> sonucu bool döndürür; <code>&amp;</code>, <code>|</code>, <code>~</code> operatörleri yeni bir <code>Kural</code> üretir (<code>__and__</code>, <code>__or__</code>, <code>__invert__</code>). Ardından alt sınıfları yaz: <code>SehirKurali(sehir)</code>, <code>MinHarcama(tutar)</code> (harcama ≥ tutar), <code>AktifKurali()</code> (<code>m["aktif"]</code>). Müşteriler sözlüktür.</p>',
    start: 'class Kural:\n    pass\n',
    sol: 'class Kural:\n    def __init__(self, kosul):\n        self.kosul = kosul\n\n    def uygun(self, m):\n        return bool(self.kosul(m))\n\n    def __and__(self, diger):\n        return Kural(lambda m: self.uygun(m) and diger.uygun(m))\n\n    def __or__(self, diger):\n        return Kural(lambda m: self.uygun(m) or diger.uygun(m))\n\n    def __invert__(self):\n        return Kural(lambda m: not self.uygun(m))\n\n\nclass SehirKurali(Kural):\n    def __init__(self, sehir):\n        super().__init__(lambda m: m["sehir"] == sehir)\n\n\nclass MinHarcama(Kural):\n    def __init__(self, tutar):\n        super().__init__(lambda m: m["harcama"] >= tutar)\n\n\nclass AktifKurali(Kural):\n    def __init__(self):\n        super().__init__(lambda m: m["aktif"])\n',
    tests: 'musteriler = [\n    {"ad": "Ayşe", "sehir": "Ankara", "harcama": 800, "aktif": True},\n    {"ad": "Can", "sehir": "Ankara", "harcama": 200, "aktif": True},\n    {"ad": "Deniz", "sehir": "İzmir", "harcama": 900, "aktif": False},\n    {"ad": "Ece", "sehir": "İzmir", "harcama": 100, "aktif": True},\n]\nk = (SehirKurali("Ankara") & MinHarcama(500)) | ~AktifKurali()\nassert [m["ad"] for m in musteriler if k.uygun(m)] == ["Ayşe", "Deniz"], "Ankara ve ≥500 olanlar ya da aktif olmayanlar: Ayşe, Deniz"\nassert isinstance(k, Kural), "Operatörler yeni bir Kural döndürmeli"\nassert MinHarcama(200).uygun(musteriler[1]) is True, "Sınır dahil (≥) ve bool dönmeli"\nk2 = ~(SehirKurali("İzmir") | MinHarcama(700))\nassert [m["ad"] for m in musteriler if k2.uygun(m)] == ["Can"], "De Morgan: ne İzmir ne ≥700 → Can"\nassert Kural(lambda m: m["harcama"] > 850).uygun(musteriler[2]), "Taban Kural doğrudan lambda ile de kullanılabilmeli"\n',
    hints: ['Her operatör, iki kuralın <code>uygun</code> sonuçlarını birleştiren bir lambda ile yeni <code>Kural</code> döndürür.', '<code>&amp;</code> → <code>__and__</code>, <code>|</code> → <code>__or__</code>, <code>~</code> → <code>__invert__</code> (tek operandlı).', 'Alt sınıflar yalnız uygun lambda ile <code>super().__init__</code> çağırır.'],
    why: 'Specification kalıbı iş kurallarını küçük, test edilebilir nesnelere böler ve bunları mantıksal operatörlerle birleştirir; yeni kampanya için yeni if/else yazılmaz (açık/kapalı ilkesi). Operatör aşırı yükleme okunur bir alan dili (DSL) sağlar; and/or anahtar kelimeleri aşırı yüklenemediği için &, |, ~ kullanılır (polars/pandas ile aynı neden). Değerlendirme kural ağacının boyutuyla doğrusal; kısa devre korunur. ORM’lerde aynı fikir SQLAlchemy and_(), or_() ifadeleri olarak SQL’e çevrilir.',
    tags: ['specification', 'operatör aşırı yükleme', 'bileşim'],
    min: 12
  },

  {
    id: 'b-382',
    lv: 'ileri',
    topic: 'SQLAlchemy',
    diff: 2,
    kind: 'predict',
    t: 'predict',
    needs: ['sqlalchemy'],
    title: 'Oturumun kimlik haritası (identity map)',
    q: '<p>Aynı oturumda aynı müşteriyi iki kez getiren bu kod ne yazdırır?</p>',
    code: 'from sqlalchemy import String, create_engine\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column\n\nclass Base(DeclarativeBase):\n    pass\n\nclass Musteri(Base):\n    __tablename__ = "musteri"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    ad: Mapped[str] = mapped_column(String(50))\n\nengine = create_engine("sqlite://")\nBase.metadata.create_all(engine)\nwith Session(engine) as s:\n    s.add(Musteri(id=1, ad="Ayşe"))\n    s.commit()\n    a = s.get(Musteri, 1)\n    b = s.get(Musteri, 1)\n    a.ad = "Ayşe K."\n    print(a is b, b.ad)\n',
    o: ['False Ayşe K.', 'True Ayşe', 'True Ayşe K.', 'False Ayşe'],
    a: 2,
    hints: ['Session her birincil anahtar için bellekte tek bir nesne tutar.', 'İki değişken aynı nesneyi gösteriyorsa birindeki değişiklik diğerinde de görünür.'],
    why: 'Session bir kimlik haritası (identity map) tutar: aynı oturumda aynı birincil anahtar için hep aynı Python nesnesi döner; get() nesne haritadaysa veritabanına gitmez bile. Bu yüzden a is b True’dur ve değişiklik ikisinde de görünür; flush/commit ile tek bir UPDATE gider. Farklı oturumlar farklı nesneler görür. Uzun ömürlü oturumlar bayat veri tutabilir; web uygulamalarında istek başına bir oturum kalıbı kullanılır.',
    tags: ['Session', 'identity map', 'ORM'],
    min: 4
  },

  {
    id: 'b-383',
    lv: 'ileri',
    topic: 'SQLAlchemy',
    diff: 2,
    kind: 'order',
    t: 'order',
    needs: ['sqlalchemy'],
    title: 'Core ile parametreli sorgu',
    q: '<p>SQLAlchemy Core ve <code>text()</code> ile tablo oluşturan, parametreli toplu ekleme yapan ve şehir bazında toplamı yazdıran programın satırlarını sırala.</p>',
    lines: ['from sqlalchemy import create_engine, text', 'engine = create_engine("sqlite://")', 'with engine.begin() as con:', '    con.execute(text("CREATE TABLE siparis (sehir TEXT, tutar INT)"))', '    con.execute(text("INSERT INTO siparis VALUES (:s, :t)"), [{"s": "Ankara", "t": 100}, {"s": "İzmir", "t": 50}, {"s": "Ankara", "t": 30}])', '    sonuc = con.execute(text("SELECT sehir, SUM(tutar) FROM siparis GROUP BY sehir ORDER BY sehir")).all()', 'print(sonuc)'],
    expect: '[(\'Ankara\', 130), (\'İzmir\', 50)]\n',
    hints: ['Tablo, içine veri eklenmeden önce oluşturulmalı.', 'engine.begin() bloğu sonunda otomatik COMMIT yapar; print bloğun dışında olabilir.'],
    why: 'engine.begin() bir bağlantı açar ve blok başarıyla biterse COMMIT, hata olursa ROLLBACK yapar. text() içindeki :s, :t adlı parametreler sürücüye ayrı gönderilir; değerler SQL metnine yapıştırılmadığı için SQL enjeksiyonu engellenir. Sözlük listesi vermek executemany ile toplu ekleme yapar (tek tek execute’tan hızlı). .all() sonuçları Row listesi olarak alır.',
    tags: ['Core', 'text', 'parametre', 'transaction'],
    min: 4
  },

  {
    id: 'b-384',
    lv: 'ileri',
    topic: 'SQLAlchemy',
    diff: 2,
    kind: 'rehberli',
    needs: ['sqlalchemy'],
    title: 'ORM select ile filtreli ürün listesi',
    q: '<p><code>stoktaki_ucuzlar(session, max_fiyat)</code> fonksiyonunu SQLAlchemy 2.0 tarzıyla yaz: stoğu 0\'dan büyük ve fiyatı <code>max_fiyat</code> veya altında olan ürünlerin <b>adlarını</b> fiyata göre artan (eşitlikte ada göre) sıralı liste olarak döndürsün. <code>Urun</code> modeli verilmiştir.</p>',
    guide: ['<code>stmt = select(Urun.ad)</code> ile yalnız ad sütununu seç.', '<code>.where(Urun.stok &gt; 0, Urun.fiyat &lt;= max_fiyat)</code> — birden çok koşul VE ile birleşir.', '<code>.order_by(Urun.fiyat, Urun.ad)</code> ekle.', '<code>session.scalars(stmt).all()</code> tek sütunlu sonucu düz liste verir.'],
    example: 'from sqlalchemy import String, create_engine, select\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column\n\nclass B(DeclarativeBase):\n    pass\n\nclass Personel(B):\n    __tablename__ = "personel"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    ad: Mapped[str] = mapped_column(String(40))\n    maas: Mapped[int]\n\ne = create_engine("sqlite://")\nB.metadata.create_all(e)\nwith Session(e) as s:\n    s.add_all([Personel(ad="Ali", maas=40), Personel(ad="Ece", maas=65)])\n    s.commit()\n    print(s.scalars(select(Personel.ad).where(Personel.maas > 50)).all())\n',
    start: 'from sqlalchemy import String, create_engine, select\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column\n\nclass Base(DeclarativeBase):\n    pass\n\nclass Urun(Base):\n    __tablename__ = "urun"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    ad: Mapped[str] = mapped_column(String(50))\n    fiyat: Mapped[float]\n    stok: Mapped[int]\n\ndef stoktaki_ucuzlar(session, max_fiyat):\n    stmt = select(Urun.ad)\n    # TODO 1: stok > 0 ve fiyat <= max_fiyat koşullarını ekle\n    # TODO 2: fiyat, sonra ad sırasıyla sırala\n    # TODO 3: scalars(...).all() ile listeyi döndür\n    return []\n',
    sol: 'from sqlalchemy import String, create_engine, select\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column\n\nclass Base(DeclarativeBase):\n    pass\n\nclass Urun(Base):\n    __tablename__ = "urun"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    ad: Mapped[str] = mapped_column(String(50))\n    fiyat: Mapped[float]\n    stok: Mapped[int]\n\ndef stoktaki_ucuzlar(session, max_fiyat):\n    stmt = (\n        select(Urun.ad)\n        .where(Urun.stok > 0, Urun.fiyat <= max_fiyat)\n        .order_by(Urun.fiyat, Urun.ad)\n    )\n    return session.scalars(stmt).all()\n',
    tests: 'e = create_engine("sqlite://")\nBase.metadata.create_all(e)\nwith Session(e) as s:\n    s.add_all([\n        Urun(ad="Kalem", fiyat=15, stok=100), Urun(ad="Defter", fiyat=40, stok=0),\n        Urun(ad="Silgi", fiyat=15, stok=20), Urun(ad="Çanta", fiyat=450, stok=5),\n        Urun(ad="Cetvel", fiyat=25, stok=8),\n    ])\n    s.commit()\n    r = list(stoktaki_ucuzlar(s, 40))\n    assert r == ["Kalem", "Silgi", "Cetvel"], f"Beklenen [\'Kalem\', \'Silgi\', \'Cetvel\'] (Defter stokta yok); gelen {r}"\n    assert list(stoktaki_ucuzlar(s, 10)) == [], "Uygun ürün yoksa boş liste"\n',
    hints: ['2.0 tarzında sorgu <code>select()</code> ile kurulur, <code>session.query</code> eski stildir.', '<code>where</code> içine virgülle birden çok koşul verilebilir.', '<code>return session.scalars(stmt).all()</code>'],
    why: 'select() ifadesi Python operatörlerini (>, <=) SQL’e çevirir ve değerleri parametre olarak bağlar; SQL enjeksiyonu riski yoktur. Yalnız ihtiyaç duyulan sütunu seçmek tüm nesneyi yüklemekten ucuzdur. scalars() ilk sütunu düz liste olarak verir, execute() ise Row nesneleri döndürür. Performans veritabanına bağlı: stok ve fiyat üzerinde indeks varsa filtre O(log n) arama ile başlar. Eşitlikte ikinci sıralama anahtarı sonucu deterministik yapar.',
    tags: ['select', 'where', 'order_by', 'scalars'],
    min: 6
  },

  {
    id: 'b-385',
    lv: 'ileri',
    topic: 'SQLAlchemy',
    diff: 3,
    kind: 'bug',
    needs: ['sqlalchemy'],
    title: 'N+1 sorgu sorunu',
    q: '<p>Kodda bir performans hatası var, bul ve düzelt. <code>musteri_cirolari(session)</code> her müşterinin toplam sipariş tutarını <code>{ad: toplam}</code> olarak döndürüyor. Sonuç doğru, ama 1 müşteri sorgusunun ardından <b>her müşteri için ayrı</b> bir sipariş sorgusu gidiyor (N+1). Testte veritabanına giden sorgu sayısı ölçülüyor ve en fazla 2 olmalı. Modeller verilmiştir.</p>',
    start: 'from sqlalchemy import ForeignKey, String, create_engine, event, func, select\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, selectinload\n\nclass Base(DeclarativeBase):\n    pass\n\nclass Musteri(Base):\n    __tablename__ = "musteri"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    ad: Mapped[str] = mapped_column(String(50))\n    sehir: Mapped[str] = mapped_column(String(30))\n    siparisler: Mapped[list["Siparis"]] = relationship(back_populates="musteri")\n\nclass Siparis(Base):\n    __tablename__ = "siparis"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    musteri_id: Mapped[int] = mapped_column(ForeignKey("musteri.id"))\n    tutar: Mapped[int]\n    musteri: Mapped[Musteri] = relationship(back_populates="siparisler")\n\n\ndef musteri_cirolari(session):\n    sonuc = {}\n    for m in session.scalars(select(Musteri)):\n        sonuc[m.ad] = sum(s.tutar for s in m.siparisler)\n    return sonuc\n',
    sol: 'from sqlalchemy import ForeignKey, String, create_engine, event, func, select\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, selectinload\n\nclass Base(DeclarativeBase):\n    pass\n\nclass Musteri(Base):\n    __tablename__ = "musteri"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    ad: Mapped[str] = mapped_column(String(50))\n    sehir: Mapped[str] = mapped_column(String(30))\n    siparisler: Mapped[list["Siparis"]] = relationship(back_populates="musteri")\n\nclass Siparis(Base):\n    __tablename__ = "siparis"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    musteri_id: Mapped[int] = mapped_column(ForeignKey("musteri.id"))\n    tutar: Mapped[int]\n    musteri: Mapped[Musteri] = relationship(back_populates="siparisler")\n\n\ndef musteri_cirolari(session):\n    stmt = select(Musteri).options(selectinload(Musteri.siparisler))\n    sonuc = {}\n    for m in session.scalars(stmt):\n        sonuc[m.ad] = sum(s.tutar for s in m.siparisler)\n    return sonuc\n',
    tests: '_engine = create_engine("sqlite://")\nBase.metadata.create_all(_engine)\nwith Session(_engine) as _s:\n    _s.add_all([\n        Musteri(id=1, ad="Ayşe", sehir="Ankara"), Musteri(id=2, ad="Can", sehir="İzmir"),\n        Musteri(id=3, ad="Deniz", sehir="Ankara"), Musteri(id=4, ad="Ece", sehir="Bursa"),\n    ])\n    _s.add_all([\n        Siparis(musteri_id=1, tutar=100), Siparis(musteri_id=1, tutar=250),\n        Siparis(musteri_id=2, tutar=400), Siparis(musteri_id=3, tutar=50),\n    ])\n    _s.commit()\n\nsayac = [0]\ndef _say(*a, **k):\n    sayac[0] += 1\nevent.listen(_engine, "before_cursor_execute", _say)\nwith Session(_engine) as s:\n    r = musteri_cirolari(s)\nassert r == {"Ayşe": 350, "Can": 400, "Deniz": 50, "Ece": 0}, f"Cirolar yanlış: {r}"\nassert sayac[0] <= 2, f"{sayac[0]} sorgu çalıştı; en fazla 2 olmalı. İlişkiyi selectinload ile önceden yükle"\n',
    hints: ['Tembel (lazy) ilişki <code>m.siparisler</code>\'e ilk erişimde ayrı bir SELECT çalıştırır.', 'İlişkiyi ana sorguyla birlikte yüklemek için sorguya yükleme seçeneği ekle.', '<code>select(Musteri).options(selectinload(Musteri.siparisler))</code> — tüm siparişleri tek bir IN sorgusuyla getirir.'],
    why: 'N+1 problemi ORM’lerin en yaygın performans tuzağıdır: N müşteri için N ek sorgu, her biri ağ gidiş-dönüşü demektir. selectinload ikinci bir SELECT ... WHERE musteri_id IN (...) ile tüm ilişkiyi toplar: toplam 2 sorgu. joinedload tek sorguda LEFT JOIN yapar ama satır çoğaltır (bire-çok ilişkide büyük veri). Yalnız toplam gerekiyorsa en verimlisi veritabanında toplamaktır: select(Musteri.ad, func.coalesce(func.sum(Siparis.tutar), 0)).outerjoin(...).group_by(Musteri.id) — tek sorgu ve nesne yüklemeden. Sorguları görmek için create_engine(..., echo=True).',
    tags: ['N+1', 'selectinload', 'lazy loading', 'ORM performansı'],
    min: 8
  },

  {
    id: 'b-386',
    lv: 'ileri',
    topic: 'SQLAlchemy',
    diff: 2,
    kind: 'yaz',
    needs: ['sqlalchemy'],
    title: 'Veritabanında toplama: şehir cirosu',
    q: '<p><code>sehir_ciro(session)</code> fonksiyonunu yaz: tek bir SQL sorgusuyla (<code>select</code> + <code>join</code> + <code>group_by</code>) her şehrin toplam sipariş tutarını hesaplayıp <code>[(sehir, toplam), ...]</code> listesini <b>toplam azalan</b> sırada döndürsün. Siparişi olmayan şehirler listede yer almasın. <code>Musteri</code> ve <code>Siparis</code> modelleri ile <code>func</code> içe aktarılmıştır.</p>',
    start: 'from sqlalchemy import ForeignKey, String, create_engine, event, func, select\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, selectinload\n\nclass Base(DeclarativeBase):\n    pass\n\nclass Musteri(Base):\n    __tablename__ = "musteri"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    ad: Mapped[str] = mapped_column(String(50))\n    sehir: Mapped[str] = mapped_column(String(30))\n    siparisler: Mapped[list["Siparis"]] = relationship(back_populates="musteri")\n\nclass Siparis(Base):\n    __tablename__ = "siparis"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    musteri_id: Mapped[int] = mapped_column(ForeignKey("musteri.id"))\n    tutar: Mapped[int]\n    musteri: Mapped[Musteri] = relationship(back_populates="siparisler")\n\n\ndef sehir_ciro(session):\n    pass\n',
    sol: 'from sqlalchemy import ForeignKey, String, create_engine, event, func, select\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, selectinload\n\nclass Base(DeclarativeBase):\n    pass\n\nclass Musteri(Base):\n    __tablename__ = "musteri"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    ad: Mapped[str] = mapped_column(String(50))\n    sehir: Mapped[str] = mapped_column(String(30))\n    siparisler: Mapped[list["Siparis"]] = relationship(back_populates="musteri")\n\nclass Siparis(Base):\n    __tablename__ = "siparis"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    musteri_id: Mapped[int] = mapped_column(ForeignKey("musteri.id"))\n    tutar: Mapped[int]\n    musteri: Mapped[Musteri] = relationship(back_populates="siparisler")\n\n\ndef sehir_ciro(session):\n    toplam = func.sum(Siparis.tutar).label("toplam")\n    stmt = (\n        select(Musteri.sehir, toplam)\n        .join(Siparis, Siparis.musteri_id == Musteri.id)\n        .group_by(Musteri.sehir)\n        .order_by(toplam.desc())\n    )\n    return [tuple(r) for r in session.execute(stmt).all()]\n',
    tests: '_engine = create_engine("sqlite://")\nBase.metadata.create_all(_engine)\nwith Session(_engine) as _s:\n    _s.add_all([\n        Musteri(id=1, ad="Ayşe", sehir="Ankara"), Musteri(id=2, ad="Can", sehir="İzmir"),\n        Musteri(id=3, ad="Deniz", sehir="Ankara"), Musteri(id=4, ad="Ece", sehir="Bursa"),\n    ])\n    _s.add_all([\n        Siparis(musteri_id=1, tutar=100), Siparis(musteri_id=1, tutar=250),\n        Siparis(musteri_id=2, tutar=400), Siparis(musteri_id=3, tutar=50),\n    ])\n    _s.commit()\n\nwith Session(_engine) as s:\n    r = [tuple(x) for x in sehir_ciro(s)]\nassert r == [("İzmir", 400), ("Ankara", 400)] or r == [("Ankara", 400), ("İzmir", 400)], f"Ankara (350+50) ve İzmir (400) toplamları 400 olmalı; Bursa (siparişsiz) yok; gelen {r}"\nwith Session(_engine) as s:\n    s.add(Siparis(musteri_id=4, tutar=900))\n    s.commit()\n    r2 = [tuple(x) for x in sehir_ciro(s)]\nassert r2[0] == ("Bursa", 900), f"Toplam azalan sırada olmalı; ilk satır (\'Bursa\', 900) beklenir, gelen {r2[0] if r2 else r2}"\nassert len(r2) == 3, "Üç şehir"\n',
    hints: ['Toplama ifadesi: <code>func.sum(Siparis.tutar)</code>; <code>.label("toplam")</code> ile adlandırırsan sıralamada da kullanabilirsin.', '<code>select(Musteri.sehir, toplam).join(Siparis, Siparis.musteri_id == Musteri.id)</code>', '<code>.group_by(Musteri.sehir).order_by(toplam.desc())</code>; sonuç için <code>session.execute(stmt).all()</code>.'],
    why: 'Toplamayı veritabanında yapmak yalnız sonuç satırlarını ağdan getirir; tüm siparişleri Python’a çekip toplamaktan çok daha hızlı ve az bellekli. INNER JOIN siparişsiz müşterileri doğal olarak eler (dahil etmek için outerjoin + coalesce). label ile adlandırılan ifade ORDER BY’da yeniden kullanılır. Karmaşıklık veritabanı planına bağlı (hash aggregate ~O(n)). Alternatif: aynı sorguyu text() ile yazmak ya da pandas.read_sql + groupby (küçük veri için).',
    tags: ['func.sum', 'join', 'group_by', 'label'],
    min: 7
  },

  {
    id: 'b-387',
    lv: 'ileri',
    topic: 'SQLAlchemy',
    diff: 3,
    kind: 'yaz',
    needs: ['sqlalchemy'],
    title: 'Atomik havale (transaction)',
    q: '<p><code>havale(session, kaynak_id, hedef_id, tutar)</code> fonksiyonunu yaz: <code>with session.begin():</code> bloğu içinde iki hesabı <code>session.get</code> ile al, hesap yoksa <code>LookupError</code>, tutar ≤ 0 ya da bakiye yetersizse <code>ValueError</code> fırlat; değilse kaynaktan düşüp hedefe ekle. Hata durumunda veritabanında <b>hiçbir değişiklik</b> kalmamalı. <code>Hesap</code> modeli verilmiştir; fonksiyon her çağrıda yeni (transaction başlatmamış) bir oturum alır.</p>',
    start: 'from sqlalchemy import create_engine\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column\n\nclass Base(DeclarativeBase):\n    pass\n\nclass Hesap(Base):\n    __tablename__ = "hesap"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    bakiye: Mapped[int]\n\ndef havale(session, kaynak_id, hedef_id, tutar):\n    pass\n',
    sol: 'from sqlalchemy import create_engine\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column\n\nclass Base(DeclarativeBase):\n    pass\n\nclass Hesap(Base):\n    __tablename__ = "hesap"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    bakiye: Mapped[int]\n\ndef havale(session, kaynak_id, hedef_id, tutar):\n    with session.begin():\n        kaynak = session.get(Hesap, kaynak_id)\n        hedef = session.get(Hesap, hedef_id)\n        if kaynak is None or hedef is None:\n            raise LookupError("Hesap bulunamadı")\n        if tutar <= 0:\n            raise ValueError("Tutar pozitif olmalı")\n        if kaynak.bakiye < tutar:\n            raise ValueError("Yetersiz bakiye")\n        kaynak.bakiye -= tutar\n        hedef.bakiye += tutar\n',
    tests: 'e = create_engine("sqlite://")\nBase.metadata.create_all(e)\nwith Session(e) as s:\n    s.add_all([Hesap(id=1, bakiye=500), Hesap(id=2, bakiye=100)])\n    s.commit()\ndef _bakiyeler():\n    with Session(e) as s:\n        return (s.get(Hesap, 1).bakiye, s.get(Hesap, 2).bakiye)\nwith Session(e) as s:\n    havale(s, 1, 2, 200)\nassert _bakiyeler() == (300, 300), f"Havale sonrası (300, 300) olmalı ve COMMIT edilmeli; gelen {_bakiyeler()}"\nfor args, hata in (((2, 1, 1000), ValueError), ((1, 2, 0), ValueError), ((1, 99, 10), LookupError)):\n    with Session(e) as s:\n        try:\n            havale(s, *args)\n            assert False, f"{args} için {hata.__name__} bekleniyordu"\n        except hata:\n            pass\nassert _bakiyeler() == (300, 300), f"Başarısız havaleler hiçbir şeyi değiştirmemeli; gelen {_bakiyeler()}"\n',
    hints: ['<code>with session.begin():</code> bloğu normal biterse COMMIT, istisnayla çıkarsa ROLLBACK yapar.', 'Tüm kontrolleri değişiklikten önce yap; istisna yine de bloktan çıkarsa geri alınır.', 'ORM nesnesinin niteliğini değiştirmek yeterli; commit sırasında UPDATE üretilir.'],
    why: 'Havale iki UPDATE’ten oluşur; ikisi birlikte ya hep ya hiç (atomiklik) olmalı. session.begin() bağlam yöneticisi bunu garanti eder: istisna → ROLLBACK, başarı → COMMIT; elle commit/rollback yazıp unutma riski ortadan kalkar. Eşzamanlı havalelerde iki işlem aynı bakiyeyi okuyabilir: üretimde SELECT ... FOR UPDATE (with_for_update()) ya da iyimser kilit (sürüm sütunu) gerekir; SQLite bunu desteklemez, PostgreSQL destekler. Ayrıca kilitlenmeyi önlemek için hesaplar her zaman id sırasıyla kilitlenir.',
    tags: ['transaction', 'session.begin', 'atomiklik', 'rollback'],
    min: 10
  },

  {
    id: 'b-388',
    lv: 'ileri',
    topic: 'Web Mantığı',
    diff: 1,
    kind: 'order',
    t: 'order',
    needs: ['jinja2'],
    title: 'Jinja2 ile güvenli HTML üretimi',
    q: '<p>Kullanıcıdan gelen müşteri adını HTML listesine <b>güvenli</b> biçimde (otomatik kaçışla) yerleştiren programın satırlarını sırala.</p>',
    lines: ['from jinja2 import Environment', 'env = Environment(autoescape=True)', 'sablon = env.from_string("<li>{{ ad }}: {{ tutar }} TL</li>")', 'html = sablon.render(ad="<b>Ayşe</b>", tutar=120)', 'print(html)'],
    expect: '<li>&lt;b&gt;Ayşe&lt;/b&gt;: 120 TL</li>\n',
    hints: ['Ortam (Environment) şablondan önce kurulur; şablon render\'dan önce.', 'autoescape=True ortam ayarıdır.'],
    why: 'autoescape=True değişkenlerdeki <, >, & ve tırnakları HTML varlıklarına çevirir; kullanıcı girdisi etiket olarak yorumlanmaz ve XSS (siteler arası betik) saldırısı engellenir. Flask şablonlarında autoescape varsayılan olarak açıktır; düz jinja2.Environment’ta değildir. Güvendiğin HTML’i kaçışsız basmak için {{ x|safe }} ya da markupsafe.Markup kullanılır — kullanıcı girdisinde asla.',
    tags: ['jinja2', 'autoescape', 'XSS'],
    min: 2
  },

  {
    id: 'b-389',
    lv: 'ileri',
    topic: 'Web Mantığı',
    diff: 2,
    kind: 'rehberli',
    needs: ['pydantic'],
    title: 'Pydantic ile sipariş isteği doğrulama',
    q: '<p>API\'ye gelen sipariş JSON\'u doğrulanmalı. <code>SiparisGirdisi</code> pydantic modelini ve <code>dogrula(veri)</code> fonksiyonunu yaz. Alanlar: <code>urun_kodu</code> (<b>iki büyük harf, tire, üç rakam</b>: <code>AB-123</code>), <code>adet</code> (tam sayı, 1-100 arası), <code>email</code> (metin, içinde <code>@</code> olmalı; <code>field_validator</code> ile kontrol et ve küçük harfe çevir), <code>not_</code> (isteğe bağlı metin, varsayılan <code>None</code>). <code>dogrula</code>: geçerliyse <code>(True, model.model_dump())</code>, değilse <code>(False, hatalı_alan_adlarının_sıralı_listesi)</code> döndürsün.</p>',
    guide: ['<code>class SiparisGirdisi(BaseModel):</code> içinde <code>urun_kodu: str = Field(pattern=r"^[A-Z]{2}-\\d{3}$")</code>, <code>adet: int = Field(ge=1, le=100)</code>.', '<code>@field_validator("email")</code> + <code>@classmethod</code> ile doğrulayıcı yaz: <code>@</code> yoksa <code>ValueError</code>, varsa <code>v.lower()</code> döndür.', '<code>not_: str | None = None</code>', '<code>dogrula</code>: <code>try: m = SiparisGirdisi(**veri)</code>; <code>except ValidationError as e:</code> içinde <code>e.errors()</code> listesindeki her hatanın <code>loc[0]</code> değerini topla.'],
    example: 'from pydantic import BaseModel, Field, ValidationError\n\nclass Personel(BaseModel):\n    ad: str = Field(min_length=2)\n    yas: int = Field(ge=18)\n\ntry:\n    Personel(ad="A", yas=15)\nexcept ValidationError as e:\n    print(sorted(h["loc"][0] for h in e.errors()))\nprint(Personel(ad="Ece", yas="30").model_dump())   # "30" → 30 dönüştürülür\n',
    start: 'from pydantic import BaseModel, Field, ValidationError, field_validator\n\nclass SiparisGirdisi(BaseModel):\n    # TODO 1: urun_kodu (desen), adet (1-100), email, not_ alanlarını tanımla\n    urun_kodu: str\n    adet: int\n\n    # TODO 2: email için field_validator yaz\n\ndef dogrula(veri):\n    # TODO 3: modeli kur; ValidationError\'da hatalı alan adlarını sıralı döndür\n    return True, veri\n',
    sol: 'from pydantic import BaseModel, Field, ValidationError, field_validator\n\nclass SiparisGirdisi(BaseModel):\n    urun_kodu: str = Field(pattern=r"^[A-Z]{2}-\\d{3}$")\n    adet: int = Field(ge=1, le=100)\n    email: str\n    not_: str | None = None\n\n    @field_validator("email")\n    @classmethod\n    def email_kontrol(cls, v):\n        if "@" not in v:\n            raise ValueError("geçersiz e-posta")\n        return v.lower()\n\ndef dogrula(veri):\n    try:\n        m = SiparisGirdisi(**veri)\n    except ValidationError as e:\n        return False, sorted({str(h["loc"][0]) for h in e.errors()})\n    return True, m.model_dump()\n',
    tests: 'ok, r = dogrula({"urun_kodu": "KT-101", "adet": "3", "email": "Ayse@Ornek.com"})\nassert ok is True, f"Geçerli istek reddedildi: {r}"\nassert r == {"urun_kodu": "KT-101", "adet": 3, "email": "ayse@ornek.com", "not_": None}, f"model_dump yanlış: {r} (\'3\' → 3, e-posta küçük harf)"\nok, r = dogrula({"urun_kodu": "kt-1", "adet": 0, "email": "ayse.ornek.com"})\nassert ok is False and r == ["adet", "email", "urun_kodu"], f"Üç alan da hatalı olmalı ve sıralı dönmeli; gelen {r}"\nok, r = dogrula({"urun_kodu": "AB-123", "adet": 101, "email": "a@b.c", "not_": "kapıya bırakın"})\nassert ok is False and r == ["adet"], "adet en fazla 100"\nok, r = dogrula({"urun_kodu": "AB-123", "email": "a@b.c"})\nassert ok is False and r == ["adet"], "Eksik zorunlu alan (adet) hata vermeli"\n',
    hints: ['Kısıtlar <code>Field(...)</code> ile: desen için <code>pattern</code>, aralık için <code>ge</code>/<code>le</code>.', 'Pydantic v2\'de <code>@field_validator("email")</code> + <code>@classmethod</code>; doğrulayıcı dönüştürülmüş değeri döndürür.', '<code>e.errors()</code> sözlük listesidir; her birinin <code>"loc"</code> demetinin ilk elemanı alan adıdır.'],
    why: 'Pydantic tip açıklamalarından doğrulama ve dönüştürme (coercion: "3" → 3) üretir; tüm hataları tek seferde toplar, böylece istemciye her alan için anlamlı 422 yanıtı verilebilir. FastAPI istek gövdelerini tam olarak bu modellerle doğrular. Doğrulama O(alan sayısı). Daha sıkı tip istersen model_config = ConfigDict(strict=True) dönüşümü kapatır; gerçek e-posta doğrulaması için pydantic.EmailStr (email-validator paketi) kullanılır. Alternatifler: dataclass + elle kontrol, marshmallow, attrs + cattrs.',
    tags: ['pydantic', 'Field', 'field_validator', 'ValidationError'],
    min: 9
  },

  {
    id: 'b-390',
    lv: 'ileri',
    topic: 'Web Mantığı',
    diff: 2,
    kind: 'tamamla',
    title: 'Yol parametreli mini yönlendirici',
    q: '<p>Flask/FastAPI\'deki <code>/siparis/&lt;no&gt;</code> gibi yolların arkasındaki mantığı taklit eden bir yönlendirici var: <code>@rota(desen)</code> dekoratörü deseni regex\'e çevirip (<code>&lt;ad&gt;</code> → adlandırılmış grup) fonksiyonu kaydediyor; <code>yonlendir(yol)</code> eşleşen ilk rotanın fonksiyonunu yol parametreleriyle çağırıyor, eşleşme yoksa <code>"404"</code> döndürüyor. <code>___</code> boşluklarını doldur.</p>',
    start: 'import re\n\nROTALAR = []\n\ndef rota(desen):\n    regex = re.compile("^" + re.sub(r"<(\\w+)>", r"(?P<\\1>[^/]+)", desen) + "$")\n    def kaydet(f):\n        ROTALAR.append((regex, f))\n        return f\n    return kaydet\n\ndef yonlendir(yol):\n    for regex, f in ROTALAR:\n        m = regex.___(yol)\n        if m:\n            return f(**m.___())\n    return "404"\n\n@rota("/siparis/<no>")\ndef siparis_detay(no):\n    return f"sipariş {no}"\n\n@rota("/musteri/<mid>/siparis/<no>")\ndef musteri_siparis(mid, no):\n    return f"müşteri {mid}, sipariş {no}"\n',
    sol: 'import re\n\nROTALAR = []\n\ndef rota(desen):\n    regex = re.compile("^" + re.sub(r"<(\\w+)>", r"(?P<\\1>[^/]+)", desen) + "$")\n    def kaydet(f):\n        ROTALAR.append((regex, f))\n        return f\n    return kaydet\n\ndef yonlendir(yol):\n    for regex, f in ROTALAR:\n        m = regex.match(yol)\n        if m:\n            return f(**m.groupdict())\n    return "404"\n\n@rota("/siparis/<no>")\ndef siparis_detay(no):\n    return f"sipariş {no}"\n\n@rota("/musteri/<mid>/siparis/<no>")\ndef musteri_siparis(mid, no):\n    return f"müşteri {mid}, sipariş {no}"\n',
    tests: 'assert yonlendir("/siparis/1042") == "sipariş 1042", "Tek parametreli rota"\nassert yonlendir("/musteri/7/siparis/55") == "müşteri 7, sipariş 55", "İki parametre adla geçirilmeli"\nassert yonlendir("/siparis/1042/iptal") == "404", "Fazladan parça varsa eşleşmemeli (^...$)"\nassert yonlendir("/urun/3") == "404", "Bilinmeyen yol 404"\n',
    hints: ['Desen başında ^ ve sonunda $ olduğu için baştan eşleştirme yeterli.', 'Regex nesnesinin <code>match</code> metodu; adlandırılmış grupları sözlük olarak veren eşleşme metodu <code>groupdict</code>.', '<code>regex.match(yol)</code> ve <code>f(**m.groupdict())</code>'],
    why: 'Web çerçeveleri rota desenlerini başlangıçta bir kez regex’e derler; istek geldiğinde rotalar sırayla denenir (O(r) rota sayısı; büyük uygulamalarda önek ağacı/trie kullanılır). Adlandırılmış gruplar (?P<ad>...) parametreleri sözlük olarak verir ve ** ile fonksiyona anahtar kelime argümanı olarak geçer. [^/]+ bir yol parçasını aşmamayı sağlar. Gerçek çerçeveler ayrıca tür dönüştürücü (<int:no>), HTTP metodu ve 405 yanıtı ekler.',
    tags: ['routing', 'regex', 'groupdict', 'dekoratör'],
    min: 4
  }
);
})(window);
