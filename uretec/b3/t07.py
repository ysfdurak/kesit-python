T = [
dict(id='b-371', topic='İleri OOP ve Metaprogramlama', diff=3, kind='rehberli',
  title='Doğrulayan tanımlayıcı (descriptor)',
  q='<p>Ürün kataloğunda fiyat ve stok alanlarının pozitif olması gerekiyor; her sınıfa ayrı ayrı <code>property</code> yazmak yerine yeniden kullanılabilir bir <b>tanımlayıcı</b> (descriptor) yaz. <code>Pozitif</code> sınıfı: <code>__set_name__</code> ile alan adını öğrensin, <code>__set__</code> sıfır ya da negatif değerde <code>ValueError</code> fırlatsın, değeri örneğin <code>__dict__</code>\'inde <code>"_" + ad</code> anahtarıyla saklasın; <code>__get__</code> sınıf üzerinden erişimde (<code>obj is None</code>) tanımlayıcının kendisini, örnekten erişimde değeri döndürsün. <code>Urun</code> sınıfı verilmiştir.</p>',
  guide=['<code>__set_name__(self, sahip, ad)</code> içinde <code>self.ozel = "_" + ad</code> sakla; Python bunu sınıf oluşurken otomatik çağırır.', '<code>__get__(self, obj, tip=None)</code>: <code>obj is None</code> ise <code>self</code>, değilse <code>obj.__dict__[self.ozel]</code>.', '<code>__set__(self, obj, deger)</code>: <code>deger &lt;= 0</code> ise <code>ValueError</code>; değilse <code>obj.__dict__[self.ozel] = deger</code>.', 'Hata mesajında alan adını göster (ör. "fiyat pozitif olmalı").'],
  example=r'''
class Buyuk:
    def __set_name__(self, sahip, ad):
        self.ad = ad
    def __get__(self, obj, tip=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.ad, "").upper()
    def __set__(self, obj, deger):
        obj.__dict__[self.ad] = deger

class Sehir:
    ad = Buyuk()

s = Sehir()
s.ad = "ankara"
print(s.ad, type(Sehir.ad).__name__)
''',
  start=r'''
class Pozitif:
    def __set_name__(self, sahip, ad):
        # TODO 1: saklama anahtarını belirle ("_" + ad)
        pass

    def __get__(self, obj, tip=None):
        # TODO 2: sınıftan erişimde self, örnekten erişimde değeri döndür
        pass

    def __set__(self, obj, deger):
        # TODO 3: <= 0 ise ValueError, değilse sakla
        pass


class Urun:
    fiyat = Pozitif()
    stok = Pozitif()

    def __init__(self, ad, fiyat, stok):
        self.ad = ad
        self.fiyat = fiyat
        self.stok = stok
''',
  sol=r'''
class Pozitif:
    def __set_name__(self, sahip, ad):
        self.ad = ad
        self.ozel = "_" + ad

    def __get__(self, obj, tip=None):
        if obj is None:
            return self
        return obj.__dict__[self.ozel]

    def __set__(self, obj, deger):
        if deger <= 0:
            raise ValueError(f"{self.ad} pozitif olmalı")
        obj.__dict__[self.ozel] = deger


class Urun:
    fiyat = Pozitif()
    stok = Pozitif()

    def __init__(self, ad, fiyat, stok):
        self.ad = ad
        self.fiyat = fiyat
        self.stok = stok
''',
  tests=r'''
u = Urun("Kalem", 12.5, 100)
assert u.fiyat == 12.5 and u.stok == 100, "Değerler okunabilmeli"
u.stok = 40
assert u.stok == 40, "Güncelleme çalışmalı"
assert u.__dict__.get("_stok") == 40, "Değer örneğin __dict__'inde '_stok' anahtarıyla saklanmalı"
for alan, kotu in (("fiyat", 0), ("stok", -3)):
    try:
        setattr(u, alan, kotu)
        assert False, f"{alan}={kotu} için ValueError bekleniyordu"
    except ValueError as e:
        assert alan in str(e), f"Hata mesajı alan adını ('{alan}') içermeli"
try:
    Urun("Silgi", -1, 5)
    assert False, "__init__ içindeki atama da doğrulanmalı"
except ValueError:
    pass
assert isinstance(Urun.fiyat, Pozitif), "Sınıf üzerinden erişim tanımlayıcının kendisini döndürmeli"
v = Urun("Defter", 30, 7)
assert u.stok == 40 and v.stok == 7, "Her örnek kendi değerini tutmalı (değeri tanımlayıcıda saklama!)"
''',
  hints=['Tanımlayıcı sınıf düzeyinde tek nesnedir; değeri <b>self</b>\'te saklarsan tüm örnekler aynı değeri paylaşır.', '<code>obj.__dict__</code> örneğe özgü depodur; anahtarı alan adından farklı (<code>"_fiyat"</code>) seç.', '__get__ başında: <code>if obj is None: return self</code>.'],
  why='Veri tanımlayıcısı (__set__ tanımlı) örnek __dict__’inden önce gelir; bu yüzden u.fiyat = x her seferinde __set__’ten geçer ve doğrulama tek yerde toplanır (property’nin genelleştirilmiş hâli). __set_name__ (3.6+) alan adını tekrar yazmadan öğrenmeyi sağlar. Değeri tanımlayıcı nesnesinde saklamak en sık hatadır: tüm örnekler paylaşır. Erişim O(1). Alternatifler: property (tek alan için), pydantic/attrs doğrulayıcıları, dataclass + __post_init__.',
  tags=['descriptor', '__set_name__', 'doğrulama'], min=10),

dict(id='b-372', topic='İleri OOP ve Metaprogramlama', diff=2, kind='yaz',
  title='Para değer nesnesi (value object)',
  q='<p>Kayan nokta yuvarlama hataları ve TL ile USD\'nin yanlışlıkla toplanması muhasebede sorun çıkarıyor. <code>Para</code> sınıfını yaz: <code>Para(tutar, doviz="TRY")</code> tutarı <code>Decimal(str(tutar))</code> olarak 2 ondalığa (<code>ROUND_HALF_UP</code>) yuvarlayıp saklasın. Desteklenecekler: <code>+</code> (farklı dövizde <code>ValueError</code>), <code>==</code> ve <code>hash</code> (tutar + döviz), <code>&lt;</code> ile karşılaştırma (<code>functools.total_ordering</code> ile diğerleri), <code>repr</code> → <code>Para(\'10.50\', \'TRY\')</code>. Nesne değişmez olsun: tutar ve döviz salt okunur <code>property</code>.</p>',
  start=r'''
from decimal import Decimal, ROUND_HALF_UP
from functools import total_ordering

class Para:
    pass
''',
  sol=r'''
from decimal import Decimal, ROUND_HALF_UP
from functools import total_ordering

@total_ordering
class Para:
    def __init__(self, tutar, doviz="TRY"):
        self._tutar = Decimal(str(tutar)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        self._doviz = doviz

    @property
    def tutar(self):
        return self._tutar

    @property
    def doviz(self):
        return self._doviz

    def _ayni_doviz(self, other):
        if not isinstance(other, Para):
            return NotImplemented
        if self.doviz != other.doviz:
            raise ValueError(f"Farklı döviz: {self.doviz} ve {other.doviz}")
        return True

    def __add__(self, other):
        r = self._ayni_doviz(other)
        if r is NotImplemented:
            return r
        return Para(self.tutar + other.tutar, self.doviz)

    def __eq__(self, other):
        if not isinstance(other, Para):
            return NotImplemented
        return (self.tutar, self.doviz) == (other.tutar, other.doviz)

    def __hash__(self):
        return hash((self.tutar, self.doviz))

    def __lt__(self, other):
        r = self._ayni_doviz(other)
        if r is NotImplemented:
            return r
        return self.tutar < other.tutar

    def __repr__(self):
        return f"Para('{self.tutar}', '{self.doviz}')"
''',
  tests=r'''
a = Para(0.1) + Para(0.2)
assert a == Para("0.30"), "0.1 + 0.2 tam 0.30 olmalı (Decimal(str(...)))"
assert repr(Para(10.5)) == "Para('10.50', 'TRY')", f"repr biçimi yanlış: {Para(10.5)!r}"
assert Para(2.675).tutar == Decimal("2.68"), "ROUND_HALF_UP: 2.675 → 2.68"
try:
    Para(5) + Para(5, "USD")
    assert False, "Farklı dövizler toplanamaz"
except ValueError:
    pass
assert Para(5) < Para(7) and Para(7) >= Para(5), "Karşılaştırma ve total_ordering"
assert len({Para(1), Para("1.00"), Para(1, "USD")}) == 2, "Eşit nesnelerin hash'i eşit olmalı"
assert Para(3) != 3, "Para ile int eşit sayılmamalı"
try:
    Para(1).tutar = 5
    assert False, "tutar salt okunur olmalı"
except AttributeError:
    pass
''',
  hints=['<code>Decimal(str(0.1))</code> → <code>Decimal("0.1")</code>; <code>Decimal(0.1)</code> ise ikili kayan nokta hatasını taşır.', '<code>quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)</code> 2 ondalığa yuvarlar.', '__eq__ tanımlayınca __hash__ None olur; ikisini birlikte tanımla. Para olmayan nesnede <code>NotImplemented</code> döndür.'],
  why='Değer nesnesi kimliğiyle değil değeriyle eşittir ve değişmezdir; bu sayede sözlük anahtarı/küme elemanı olabilir (hash tutarlı). Decimal ondalık tabanda tam hesaplar; muhasebede float kullanmak kuruş kayıplarına yol açar. Döviz kontrolü tür sistemi yerine çalışma zamanında yanlış toplamayı engeller. total_ordering yalnız __eq__ ve __lt__’den diğer karşılaştırmaları üretir (küçük bir çağrı maliyetiyle). Alternatif: @dataclass(frozen=True, order=True) daha kısa ama döviz kontrolünü ve yuvarlamayı __post_init__’te yazman gerekir; hazır kütüphane: py-moneyed.',
  tags=['Decimal', 'total_ordering', '__hash__', 'value object'], min=12),

dict(id='b-373', topic='İleri OOP ve Metaprogramlama', diff=2, kind='bug',
  title='Bütün müşterilerin sepeti aynı',
  q='<p>Kodda bir hata var, bul ve düzelt. Ayşe sepetine çay ekleyince Can\'ın sepetinde de çay görünüyor.</p>',
  start=r'''
class Sepet:
    urunler = []

    def __init__(self, musteri):
        self.musteri = musteri

    def ekle(self, urun):
        self.urunler.append(urun)
        return self
''',
  sol=r'''
class Sepet:
    def __init__(self, musteri):
        self.musteri = musteri
        self.urunler = []

    def ekle(self, urun):
        self.urunler.append(urun)
        return self
''',
  tests=r'''
a = Sepet("Ayşe").ekle("çay")
c = Sepet("Can").ekle("kahve")
assert a.urunler == ["çay"], f"Ayşe'nin sepeti ['çay'] olmalı; gelen {a.urunler}. Sınıf niteliği tüm örneklerce paylaşılır"
assert c.urunler == ["kahve"], f"Can'ın sepeti ['kahve'] olmalı; gelen {c.urunler}"
assert "urunler" in vars(a), "urunler örnek niteliği olmalı (__init__ içinde self.urunler = [])"
''',
  hints=['Sınıf gövdesindeki atama sınıfa aittir; tüm örnekler aynı listeyi görür.', 'self.urunler.append önce örnekte arar, bulamazsa sınıftaki listeye ekler.', 'Listeyi <code>__init__</code> içinde <code>self.urunler = []</code> ile oluştur.'],
  why='Nitelik araması önce örnek __dict__’ine, sonra sınıfa bakar. append atama değil yerinde değişiklik (mutation) olduğu için sınıftaki tek liste değişir ve herkes etkilenir. Sabitler ve paylaşılması istenen sayaçlar sınıf niteliği olabilir; değiştirilebilir (list, dict, set) durum her zaman __init__ içinde oluşturulmalı. Aynı tuzak def f(x=[]) varsayılan argümanında da vardır. dataclass bunu field(default_factory=list) ile zorunlu kılar.',
  tags=['sınıf niteliği', 'mutable', '__init__'], min=3),

dict(id='b-374', topic='İleri OOP ve Metaprogramlama', diff=3, kind='yaz',
  title='Kendi mini dataclass dekoratörün',
  q='<p><code>dataclasses</code> modülünü kullanmadan bir sınıf dekoratörü yaz: <code>kayit(cls)</code>, sınıfın tip açıklamalarından (<code>cls.__annotations__</code>, tanım sırasıyla) alan listesini alıp sınıfa üç metot eklesin ve sınıfı döndürsün: <code>__init__</code> (alanları sırayla konumsal ya da adla alır; sınıfta varsayılan değeri olan alan verilmezse o değeri kullanır, verilmeyen zorunlu alanda <code>TypeError</code>), <code>__repr__</code> → <code>Musteri(ad=\'Ayşe\', puan=0)</code>, <code>__eq__</code> (aynı sınıf ve aynı alan değerleri).</p>',
  start=r'''
def kayit(cls):
    pass
''',
  sol=r'''
def kayit(cls):
    alanlar = list(cls.__dict__.get("__annotations__", {}))
    yok = object()
    varsayilan = {a: cls.__dict__.get(a, yok) for a in alanlar}

    def __init__(self, *args, **kwargs):
        if len(args) > len(alanlar):
            raise TypeError("Fazla argüman")
        degerler = dict(zip(alanlar, args))
        for k, v in kwargs.items():
            if k not in alanlar:
                raise TypeError(f"Bilinmeyen alan: {k}")
            if k in degerler:
                raise TypeError(f"{k} iki kez verildi")
            degerler[k] = v
        for a in alanlar:
            if a not in degerler:
                if varsayilan[a] is yok:
                    raise TypeError(f"Eksik alan: {a}")
                degerler[a] = varsayilan[a]
            setattr(self, a, degerler[a])

    def __repr__(self):
        ic = ", ".join(f"{a}={getattr(self, a)!r}" for a in alanlar)
        return f"{type(self).__name__}({ic})"

    def __eq__(self, other):
        if type(other) is not type(self):
            return NotImplemented
        return all(getattr(self, a) == getattr(other, a) for a in alanlar)

    cls.__init__ = __init__
    cls.__repr__ = __repr__
    cls.__eq__ = __eq__
    return cls
''',
  tests=r'''
@kayit
class Musteri:
    ad: str
    sehir: str = "Ankara"
    puan: int = 0

m = Musteri("Ayşe", puan=5)
assert (m.ad, m.sehir, m.puan) == ("Ayşe", "Ankara", 5), "Konumsal + adlı argüman ve varsayılan değer"
assert repr(m) == "Musteri(ad='Ayşe', sehir='Ankara', puan=5)", f"repr yanlış: {m!r}"
assert Musteri("Can") == Musteri(ad="Can"), "Aynı değerli nesneler eşit olmalı"
assert Musteri("Can") != Musteri("Can", "İzmir"), "Farklı alan değeri → eşit değil"
try:
    Musteri()
    assert False, "Zorunlu alan (ad) eksikse TypeError"
except TypeError:
    pass
try:
    Musteri("A", yas=3)
    assert False, "Bilinmeyen alan adı TypeError"
except TypeError:
    pass
assert "dataclass" not in __source__, "dataclasses kullanma; metotları kendin üret"
''',
  hints=['Alan sırası: <code>list(cls.__dict__.get("__annotations__", {}))</code>; sözlükler ekleme sırasını korur.', 'Varsayılan değer sınıf niteliği olarak durur: <code>cls.__dict__.get(ad, YOK)</code>; "yok" için özel bir nöbetçi nesne kullan (None geçerli bir varsayılan olabilir).', 'İç fonksiyonları tanımlayıp <code>cls.__init__ = __init__</code> gibi sınıfa ata, sonra <code>return cls</code>.'],
  why='Sınıf dekoratörü sınıf oluştuktan sonra onu alıp değiştirir; metaprogramlamanın metaclass’a göre en okunur yoludur. Fonksiyonlar kapanış (closure) ile alan listesini hatırlar. Nöbetçi object() None’u geçerli varsayılan olarak ayırt eder. Gerçek dataclasses kaynak kod üretip exec eder (daha hızlı __init__) ve kalıtım, frozen, order, slots gibi seçenekleri destekler; üretimde onu ya da attrs/pydantic’i kullan. Her işlem alan sayısıyla doğrusal: O(k).',
  tags=['sınıf dekoratörü', '__annotations__', 'metaprogramlama', 'closure'], min=15),

dict(id='b-375', topic='İleri OOP ve Metaprogramlama', diff=2, kind='rehberli',
  title='Hata olursa geri al: işlem bağlam yöneticisi',
  q='<p>Hesap bakiyelerini tutan bir sözlük üzerinde toplu güncelleme yapılıyor; ortada bir hata çıkarsa <b>hiçbir</b> değişiklik kalmamalı. <code>Islem(hesaplar)</code> bağlam yöneticisi sınıfını yaz: <code>__enter__</code> sözlüğün bir kopyasını (anlık görüntü) alıp sözlüğün kendisini döndürsün; <code>__exit__</code> istisna varsa sözlüğü anlık görüntüye geri döndürsün (aynı nesneyi yerinde: <code>clear</code> + <code>update</code>) ve istisnayı <b>bastırmasın</b> (<code>False</code> döndürsün).</p>',
  guide=['<code>__init__</code>: sözlüğü <code>self.hesaplar</code> olarak sakla.', '<code>__enter__</code>: <code>self.yedek = dict(self.hesaplar)</code>, sonra <code>return self.hesaplar</code>.', '<code>__exit__(self, tip, deger, iz)</code>: <code>tip is not None</code> ise <code>clear()</code> + <code>update(self.yedek)</code>.', '<code>return False</code> ile istisnanın yukarı çıkmasına izin ver.'],
  example=r'''
class Gecici:
    def __init__(self, ayar, anahtar, deger):
        self.ayar, self.anahtar, self.deger = ayar, anahtar, deger
    def __enter__(self):
        self.eski = self.ayar.get(self.anahtar)
        self.ayar[self.anahtar] = self.deger
        return self.ayar
    def __exit__(self, tip, deger, iz):
        self.ayar[self.anahtar] = self.eski   # her durumda geri yükle
        return False

ayar = {"mod": "canli"}
with Gecici(ayar, "mod", "test"):
    print("içeride:", ayar)
print("dışarıda:", ayar)
''',
  start=r'''
class Islem:
    def __init__(self, hesaplar):
        self.hesaplar = hesaplar

    def __enter__(self):
        # TODO 1: anlık görüntü al, sözlüğü döndür
        return self.hesaplar

    def __exit__(self, tip, deger, iz):
        # TODO 2: hata varsa sözlüğü yerinde geri yükle
        # TODO 3: istisnayı bastırma
        return True
''',
  sol=r'''
class Islem:
    def __init__(self, hesaplar):
        self.hesaplar = hesaplar

    def __enter__(self):
        self.yedek = dict(self.hesaplar)
        return self.hesaplar

    def __exit__(self, tip, deger, iz):
        if tip is not None:
            self.hesaplar.clear()
            self.hesaplar.update(self.yedek)
        return False
''',
  tests=r'''
h = {"TR1": 500, "TR2": 100}
ref = h
with Islem(h) as d:
    d["TR1"] -= 200
    d["TR2"] += 200
assert h == {"TR1": 300, "TR2": 300}, "Hata yoksa değişiklikler kalmalı"
try:
    with Islem(h) as d:
        d["TR1"] -= 1000
        d["TR3"] = 1000
        raise ValueError("limit aşıldı")
    assert False, "İstisna bastırılmamalı (__exit__ False döndürmeli)"
except ValueError:
    pass
assert h == {"TR1": 300, "TR2": 300}, f"Hata sonrası tüm değişiklikler geri alınmalı (TR3 de silinmeli); gelen {h}"
assert h is ref, "Aynı sözlük nesnesi yerinde geri yüklenmeli (yeni sözlük atama)"
''',
  hints=['Sığ kopya: <code>dict(self.hesaplar)</code> değerler sayı olduğu için yeterli.', 'Yeni anahtarları da silmek için önce <code>clear()</code>, sonra <code>update(yedek)</code>.', '<code>__exit__</code> doğru (True) döndürürse istisna yutulur; burada <code>False</code> döndür.'],
  why='Bağlam yöneticisi "kaynak al - kullan - her durumda temizle" kalıbını garanti eder; __exit__ istisna bilgisini (tip, değer, iz) alır ve True döndürürse istisnayı bastırır — hataları gizlememek için genelde False döndürülür. Yerinde geri yükleme, sözlüğe başka yerlerden tutulan referansların da tutarlı kalmasını sağlar. Anlık görüntü O(n) bellek/zaman; büyük durumlarda yalnız değişen anahtarları kaydeden bir günlük (undo log) daha verimlidir. Veritabanlarında aynı fikir transaction/ROLLBACK; fonksiyon tabanlı alternatif contextlib.contextmanager.',
  tags=['context manager', '__exit__', 'rollback'], min=7),

dict(id='b-376', topic='Tasarım Kalıpları', diff=2, kind='predict',
  title='__new__ ile tekil (singleton) tuzağı',
  q='<p>Uygulama ayarlarını tekil nesneyle tutan bu kod ne yazdırır?</p>',
  code=r'''
class Ayar:
    _ornek = None

    def __new__(cls, *args, **kwargs):
        if cls._ornek is None:
            cls._ornek = super().__new__(cls)
        return cls._ornek

    def __init__(self, ortam):
        self.ortam = ortam

a = Ayar("test")
b = Ayar("canli")
print(a is b, a.ortam)
''',
  o=['True canli', 'True test', 'False test', 'False canli'], a=0,
  hints=['__new__ aynı nesneyi döndürse de Python her çağrıda __init__\'i yeniden çalıştırır.', 'İkinci çağrı aynı nesnenin ortam alanının üzerine yazar.'],
  why='Ayar(...) çağrısı önce __new__’i, dönen nesne o sınıfın örneğiyse __init__’i çalıştırır. __new__ hep aynı nesneyi verdiği için a is b True’dur ama __init__ ikinci kez çalışıp ortam’ı "canli" yapar — gizli bir durum değişikliği. Python’da tekil için en sade yol modül düzeyinde tek bir nesne oluşturmaktır (modüller zaten bir kez yüklenir); ya da functools.cache ile sarılmış bir fabrika fonksiyonu. Tekiller test edilebilirliği düşürür; bağımlılık enjeksiyonu çoğu zaman daha iyidir.',
  tags=['singleton', '__new__', '__init__'], min=3),

dict(id='b-377', topic='Tasarım Kalıpları', diff=1, kind='order',
  title='Değiştirilebilir strateji sözlüğü',
  q='<p>Müşteri segmentine göre fiyatlama stratejisi seçen, strateji tablosunu varsayılan argümanla enjekte eden programın satırlarını sırala.</p>',
  lines=[
    'STRATEJI = {"standart": lambda t: t, "premium": lambda t: t * 0.9}',
    'def fiyatla(tutar, segment, strateji=STRATEJI):',
    '    hesapla = strateji.get(segment, strateji["standart"])',
    '    return round(hesapla(tutar), 2)',
    'print(fiyatla(200, "premium"), fiyatla(200, "bilinmeyen"))',
  ],
  expect='180.0 200\n',
  hints=['Varsayılan argüman değeri fonksiyon TANIMLANDIĞI anda hesaplanır; tablo önce var olmalı.', 'Stratejiyi seç, sonra uygula.'],
  why='Strateji kalıbında algoritmalar birbirinin yerine geçebilen nesnelerdir; Python’da fonksiyonlar birinci sınıf olduğundan bir sözlük yeterlidir, if/elif zinciri gerekmez ve yeni segment eklemek tek satırdır (açık/kapalı ilkesi). strateji parametresi testte farklı bir tablo vermeyi sağlar (bağımlılık enjeksiyonu). Bilinmeyen segment için güvenli varsayılan seçilir. Karmaşıklık O(1) seçim.',
  tags=['strateji', 'dict dispatch', 'dependency injection'], min=2),

dict(id='b-378', topic='Tasarım Kalıpları', diff=2, kind='rehberli',
  title='Eski kargo API\'si için adaptör',
  q='<p>Anadolu Market yeni kodu <code>fiyat_al(desi) -&gt; float (TL)</code> arayüzünü bekliyor. Eski kargo firmasının istemcisi ise <code>EskiKargo().hesapla({"agirlik_kg": ..., "tip": "STD"})</code> çağrısıyla <code>{"durum": "OK", "ucret_kurus": 4590}</code> döndürüyor. <code>KargoAdaptoru(eski)</code> sınıfını yaz: <code>fiyat_al(desi)</code> desiyi kg\'a çevirsin (<b>1 desi = 1/3 kg</b>, 2 ondalık), eski istemciyi çağırsın, <code>durum</code> "OK" değilse <code>RuntimeError</code> fırlatsın, kuruşu TL\'ye çevirip float döndürsün.</p>',
  guide=['<code>__init__</code>\'te eski istemciyi <code>self.eski</code> olarak sakla (kalıtım değil, bileşim).', 'kg = <code>round(desi / 3, 2)</code>; istek sözlüğünü <code>{"agirlik_kg": kg, "tip": "STD"}</code> olarak kur.', 'Yanıtta <code>durum != "OK"</code> ise <code>RuntimeError</code>.', '<code>ucret_kurus / 100</code> değerini döndür.'],
  example=r'''
class EskiTermometre:
    def oku_f(self):
        return 98.6   # Fahrenheit

class SantigratAdaptoru:
    def __init__(self, eski):
        self.eski = eski
    def sicaklik(self):
        return round((self.eski.oku_f() - 32) * 5 / 9, 1)

print(SantigratAdaptoru(EskiTermometre()).sicaklik())
''',
  start=r'''
class EskiKargo:
    def hesapla(self, istek):
        kg = istek["agirlik_kg"]
        if kg <= 0:
            return {"durum": "HATA", "ucret_kurus": 0}
        return {"durum": "OK", "ucret_kurus": int(2990 + kg * 800)}


class KargoAdaptoru:
    def __init__(self, eski):
        self.eski = eski

    def fiyat_al(self, desi):
        # TODO 1: desiyi kg'a çevir (1/3, 2 ondalık)
        # TODO 2: eski istemciyi doğru biçimdeki istekle çağır
        # TODO 3: durum OK değilse RuntimeError
        # TODO 4: kuruşu TL'ye çevirip döndür
        return 0.0
''',
  sol=r'''
class EskiKargo:
    def hesapla(self, istek):
        kg = istek["agirlik_kg"]
        if kg <= 0:
            return {"durum": "HATA", "ucret_kurus": 0}
        return {"durum": "OK", "ucret_kurus": int(2990 + kg * 800)}


class KargoAdaptoru:
    def __init__(self, eski):
        self.eski = eski

    def fiyat_al(self, desi):
        kg = round(desi / 3, 2)
        yanit = self.eski.hesapla({"agirlik_kg": kg, "tip": "STD"})
        if yanit["durum"] != "OK":
            raise RuntimeError(f"Kargo hatası: {yanit['durum']}")
        return yanit["ucret_kurus"] / 100
''',
  tests=r'''
k = KargoAdaptoru(EskiKargo())
assert k.fiyat_al(6) == 45.9, f"6 desi = 2 kg → 2990 + 1600 = 4590 kuruş = 45.9 TL; gelen {k.fiyat_al(6)}"
assert k.fiyat_al(3) == 37.9, "3 desi = 1 kg → 37.9 TL"
assert isinstance(k.fiyat_al(1), float), "float TL döndür"
try:
    k.fiyat_al(0)
    assert False, "Eski API HATA döndürürse RuntimeError"
except RuntimeError:
    pass
class _Sahte:
    def __init__(self):
        self.istekler = []
    def hesapla(self, istek):
        self.istekler.append(istek)
        return {"durum": "OK", "ucret_kurus": 100}
s = _Sahte()
KargoAdaptoru(s).fiyat_al(5)
assert s.istekler == [{"agirlik_kg": 1.67, "tip": "STD"}], f"İstek biçimi yanlış: {s.istekler}"
''',
  hints=['Adaptör eski nesneyi sarar (bileşim); yeni arayüzü kendisi sunar.', '<code>yanit = self.eski.hesapla({"agirlik_kg": kg, "tip": "STD"})</code>', 'Kuruş → TL: <code>yanit["ucret_kurus"] / 100</code>'],
  why='Adaptör (yapısal kalıp) uyumsuz bir arayüzü, istemci kodunu değiştirmeden beklenen arayüze çevirir; birim dönüşümleri (desi→kg, kuruş→TL) ve hata modeli (durum kodu → istisna) tek yerde toplanır. Bileşim sayesinde testte eski istemci yerine sahte nesne verilebilir (yukarıdaki _Sahte). Eski sistem değiştiğinde yalnız adaptör güncellenir. Maliyet O(1). Python’da resmî arayüz için typing.Protocol ile fiyat_al imzası tanımlanabilir.',
  tags=['adaptör', 'bileşim', 'arayüz'], min=6),

dict(id='b-379', topic='Tasarım Kalıpları', diff=2, kind='tamamla',
  title='Geri alınabilir komutlar (Command)',
  q='<p>Depo yönetim ekranında stok işlemleri geri alınabilmeli. Her komut <code>uygula()</code> ve <code>geri_al()</code> metotlarına sahip; <code>KomutYoneticisi</code> çalışan komutları bir yığında (stack) tutar ve <code>geri_al()</code> en son komutu geri alır. <code>___</code> boşluklarını doldur.</p>',
  start=r'''
class StokEkle:
    def __init__(self, stok, urun, adet):
        self.stok, self.urun, self.adet = stok, urun, adet

    def uygula(self):
        self.stok[self.urun] = self.stok.get(self.urun, 0) + self.adet

    def geri_al(self):
        self.stok[self.urun] -= self.adet


class KomutYoneticisi:
    def __init__(self):
        self.gecmis = []

    def calistir(self, komut):
        komut.uygula()
        self.gecmis.___(komut)

    def geri_al(self):
        if not self.gecmis:
            return False
        self.gecmis.___().geri_al()
        return True
''',
  sol=r'''
class StokEkle:
    def __init__(self, stok, urun, adet):
        self.stok, self.urun, self.adet = stok, urun, adet

    def uygula(self):
        self.stok[self.urun] = self.stok.get(self.urun, 0) + self.adet

    def geri_al(self):
        self.stok[self.urun] -= self.adet


class KomutYoneticisi:
    def __init__(self):
        self.gecmis = []

    def calistir(self, komut):
        komut.uygula()
        self.gecmis.append(komut)

    def geri_al(self):
        if not self.gecmis:
            return False
        self.gecmis.pop().geri_al()
        return True
''',
  tests=r'''
stok = {"çay": 10}
y = KomutYoneticisi()
y.calistir(StokEkle(stok, "çay", 5))
y.calistir(StokEkle(stok, "kahve", 3))
assert stok == {"çay": 15, "kahve": 3}, "Komutlar uygulanmalı"
assert y.geri_al() is True and stok == {"çay": 15, "kahve": 0}, "İlk geri alma EN SON komutu (kahve) geri almalı"
assert y.geri_al() is True and stok["çay"] == 10, "Sonra çay işlemi geri alınmalı"
assert y.geri_al() is False, "Geçmiş boşken False"
''',
  hints=['Yığın: son giren ilk çıkar (LIFO).', 'Listeye sondan eklemek <code>append</code>, sondan çıkarmak <code>pop()</code>.', '<code>self.gecmis.append(komut)</code> ve <code>self.gecmis.pop().geri_al()</code>'],
  why='Komut kalıbı bir işlemi nesneye çevirir: kuyruğa alınabilir, günlüğe yazılabilir, geri alınabilir. Geri alma LIFO olmalı, çünkü sonraki komutlar öncekilerin sonucuna dayanabilir. list.append/pop sonda O(1). İleri alma (redo) için ikinci bir yığın eklenir ve yeni bir komut çalışınca o yığın temizlenir. Bellek sınırı gerekiyorsa collections.deque(maxlen=N) kullanılır.',
  tags=['command', 'undo', 'stack'], min=3),

dict(id='b-380', topic='Tasarım Kalıpları', diff=2, kind='yaz',
  title='Sipariş durum makinesi (State)',
  q='<p>Sipariş yaşam döngüsü: <code>yeni</code> → (<code>ode</code>) → <code>odendi</code> → (<code>kargola</code>) → <code>kargoda</code> → (<code>teslim</code>) → <code>teslim_edildi</code>. Ayrıca <code>yeni</code> ve <code>odendi</code> durumlarından <code>iptal</code> olayıyla <code>iptal</code> durumuna geçilebilir. <code>Siparis</code> sınıfını yaz: <code>durum</code> niteliği <code>"yeni"</code> başlar; <code>ilerle(olay)</code> geçerli geçişte durumu güncelleyip yeni durumu döndürür, geçersizde <code>ValueError</code> fırlatır ve durumu değiştirmez; <code>gecmis</code> listesi tüm durumları sırayla tutar (ilk eleman "yeni"). Geçişleri bir sözlük tablosunda tut.</p>',
  start=r'''
class Siparis:
    pass
''',
  sol=r'''
class Siparis:
    GECISLER = {
        ("yeni", "ode"): "odendi",
        ("yeni", "iptal"): "iptal",
        ("odendi", "kargola"): "kargoda",
        ("odendi", "iptal"): "iptal",
        ("kargoda", "teslim"): "teslim_edildi",
    }

    def __init__(self):
        self.durum = "yeni"
        self.gecmis = ["yeni"]

    def ilerle(self, olay):
        anahtar = (self.durum, olay)
        if anahtar not in self.GECISLER:
            raise ValueError(f"'{self.durum}' durumunda '{olay}' yapılamaz")
        self.durum = self.GECISLER[anahtar]
        self.gecmis.append(self.durum)
        return self.durum
''',
  tests=r'''
s = Siparis()
assert s.durum == "yeni"
assert s.ilerle("ode") == "odendi"
assert s.ilerle("kargola") == "kargoda"
try:
    s.ilerle("iptal")
    assert False, "Kargodaki sipariş iptal edilemez"
except ValueError:
    pass
assert s.durum == "kargoda", "Geçersiz olay durumu değiştirmemeli"
s.ilerle("teslim")
assert s.gecmis == ["yeni", "odendi", "kargoda", "teslim_edildi"], f"Geçmiş yanlış: {s.gecmis}"
t = Siparis()
assert t.ilerle("iptal") == "iptal"
try:
    t.ilerle("ode")
    assert False, "İptal edilmiş sipariş ödenemez"
except ValueError:
    pass
assert Siparis().gecmis == ["yeni"], "Her siparişin geçmişi ayrı olmalı"
''',
  hints=['Anahtarı <code>(mevcut_durum, olay)</code>, değeri yeni durum olan bir sözlük kur.', 'Anahtar tabloda yoksa önce hata fırlat, sonra durumu değiştir (sıra önemli).', 'gecmis listesini <code>__init__</code> içinde oluştur, sınıf düzeyinde değil.'],
  why='Geçiş tablosu iş kurallarını veriye çevirir: yeni bir durum eklemek if/elif labirentini değiştirmek yerine tabloya satır eklemektir, geçerli geçişler de tek bakışta görülür. Arama O(1). Klasik State kalıbında her durum ayrı bir sınıftır ve davranış (ör. iptal ücreti) duruma göre değişir; davranış farkı yoksa tablo daha sadedir. Geçmiş, denetim izi (audit log) sağlar. Hazır alternatif: transitions kütüphanesi; veritabanında durum sütunu + CHECK kısıtı.',
  tags=['state machine', 'durum', 'geçiş tablosu'], min=8),
]
