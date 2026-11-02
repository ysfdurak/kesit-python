(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{ id: 'ileri-oop', lv: 'ileri', mod: 'Mimari', min: 40,
    title: 'İleri OOP: dunder metotlar, ABC, Protocol ve descriptor',
    sum: 'Sınıflarını Python\'ın yerleşik türleri gibi davranacak şekilde tasarla: eşitlik, sıralama, uzunluk, indeksleme, çağrılabilirlik, soyut sınıflar, Protocol, descriptor, __slots__ ve metaclass\'a kısa bakış.',
    goals: ['__eq__, __hash__, __lt__ gibi dunder metotlarla sınıfımı küme, sözlük ve sorted ile uyumlu yapabilirim', '__len__, __getitem__, __iter__ ve __call__ ile kendi koleksiyon ve çağrılabilir nesnelerimi yazabilirim', 'ABC ile zorunlu arayüz, Protocol ile yapısal tipleme arasında doğru seçimi yapabilirim', 'Descriptor ve property ile alan doğrulamasını tek yerde toplayabilirim', '__slots__, classmethod, staticmethod ve metaclass\'ın ne zaman gerektiğini açıklayabilirim'],
    body: `<h2>Neden önemli?</h2>
<p>Orta seviyede sınıf yazmayı, kalıtımı ve dataclass\'ı öğrendin. Kurumsal kodda ise sınıfların "Python gibi" davranması beklenir: bir <code>Para</code> nesnesi <code>==</code> ile karşılaştırılabilmeli, bir kümeye konabilmeli, <code>sorted</code> ile sıralanabilmeli; bir <code>Sepet</code> nesnesi <code>len()</code> ve <code>for</code> ile kullanılabilmeli. Anadolu Bank\'ta bir işlem motoru yazarken "bu iki tutar eşit mi?" sorusunun cevabı <code>id()</code> karşılaştırması olursa raporlar yanlış çıkar. Bu dersin konusu, sınıflarını dil ile bütünleştiren <b>özel metotlar</b> (dunder methods, "double underscore") ve kodun sınırlarını tanımlayan soyutlama araçlarıdır.</p>

<h2>Eşitlik, hash ve sıralama</h2>
<p>Varsayılan olarak iki nesne yalnızca aynı nesneyse eşittir. <code>__eq__</code> yazarak "değer eşitliği" tanımlarsın. Dikkat: <code>__eq__</code> yazıp <code>__hash__</code> yazmazsan Python nesneyi <b>hashlenemez</b> yapar; küme ve sözlük anahtarı olarak kullanamazsın. Değişmez (immutable) nesnelerde <code>__hash__</code>\'i eşitlikte kullandığın alanlardan üret.</p>
<pre class="py">from functools import total_ordering

@total_ordering
class Para:
    """Anadolu Bank: kuruş hassasiyetinde tutar."""
    __slots__ = ('kurus', 'birim')

    def __init__(self, tutar: float, birim: str = 'TRY'):
        self.kurus = round(tutar * 100)
        self.birim = birim

    def __repr__(self):
        return f'Para({self.kurus / 100:.2f}, {self.birim!r})'

    def __eq__(self, other):
        if not isinstance(other, Para):
            return NotImplemented
        return (self.kurus, self.birim) == (other.kurus, other.birim)

    def __hash__(self):
        return hash((self.kurus, self.birim))

    def __lt__(self, other):
        if not isinstance(other, Para) or self.birim != other.birim:
            return NotImplemented
        return self.kurus &lt; other.kurus

    def __add__(self, other):
        if not isinstance(other, Para) or self.birim != other.birim:
            return NotImplemented
        return Para((self.kurus + other.kurus) / 100, self.birim)

a, b, c = Para(10.10), Para(10.10), Para(3.5)
print(a == b, a is b)          # True False
print(len({a, b, c}))          # 2  -&gt; hash tutarlı
print(sorted([a, c, Para(7)])) # küçükten büyüğe
print(a + c, a &gt; c)
</pre>
<div class="tip"><b>total_ordering</b><code>functools.total_ordering</code>, yalnızca <code>__eq__</code> ve bir karşılaştırma metodu (örneğin <code>__lt__</code>) tanımladığında geri kalan <code>__le__</code>, <code>__gt__</code>, <code>__ge__</code> metotlarını üretir. <code>NotImplemented</code> döndürmek, "ben bilmiyorum, karşı taraf denesin" demektir; <code>raise</code> etmekten farklıdır.</div>

<h2>Koleksiyon gibi davranmak</h2>
<p>Dört metot yeter: <code>__len__</code>, <code>__getitem__</code>, <code>__iter__</code>, <code>__contains__</code>. Yalnızca <code>__getitem__</code> yazarsan Python 0, 1, 2 diye indeksleyerek <code>for</code> döngüsünü ve <code>in</code> kontrolünü bile üretir; ama açıkça <code>__iter__</code> yazmak daha hızlı ve nettir.</p>
<pre class="py">class Sepet:
    def __init__(self):
        self._kalemler: list[tuple[str, int, float]] = []

    def ekle(self, urun, adet, fiyat):
        self._kalemler.append((urun, adet, fiyat))
        return self            # zincirleme için

    def __len__(self):
        return len(self._kalemler)

    def __getitem__(self, i):          # int ve dilim (slice) destekler
        return self._kalemler[i]

    def __iter__(self):
        return iter(self._kalemler)

    def __contains__(self, urun):
        return any(k[0] == urun for k in self._kalemler)

    def __call__(self, kdv=0.20):      # sepet(0.2) -&gt; toplam
        return round(sum(a * f for _, a, f in self._kalemler) * (1 + kdv), 2)

    def __bool__(self):
        return bool(self._kalemler)

s = Sepet().ekle('kahve', 2, 150.0).ekle('bardak', 4, 40.0)
print(len(s), 'kahve' in s, 'çay' in s)
print(s[0], s[-1:])
for urun, adet, fiyat in s:
    print(f'{urun:&lt;8}{adet:&gt;3} x {fiyat:&gt;7.2f}')
print('KDV dahil:', s())
print('boş sepet:', bool(Sepet()))
</pre>
<div class="note"><b>__bool__ yoksa __len__ kullanılır</b>Bir nesnenin doğruluk değeri önce <code>__bool__</code>, o yoksa <code>__len__</code> ile belirlenir. Koleksiyon sınıflarında <code>__len__</code> yazdığında <code>if sepet:</code> otomatik olarak "sepet boş mu?" anlamına gelir.</div>

<h2>ABC: zorunlu arayüz</h2>
<p><code>abc.ABC</code> ve <code>@abstractmethod</code>, alt sınıfın mutlaka gerçekleştirmesi gereken metotları tanımlar. Eksik bırakılan metot varsa sınıf <b>örneklenemez</b>; hata, nesne yaratılırken, yani erken çıkar. Ödeme sağlayıcıları, bildirim kanalları, depolama katmanları gibi "birden fazla gerçekleştirme, tek sözleşme" durumlarında kullan.</p>
<pre class="py">from abc import ABC, abstractmethod

class OdemeSaglayici(ABC):
    @abstractmethod
    def tahsil_et(self, tutar: float) -&gt; str: ...

    def makbuz(self, tutar):            # somut metot: alt sınıflara miras
        return f'{self.__class__.__name__}: {tutar:.2f} TL tahsil edildi'

class KrediKarti(OdemeSaglayici):
    def tahsil_et(self, tutar):
        return self.makbuz(tutar)

class Havale(OdemeSaglayici):
    pass                                 # tahsil_et eksik!

print(KrediKarti().tahsil_et(250))
try:
    Havale()
except TypeError as e:
    print('Hata:', e)
print(issubclass(KrediKarti, OdemeSaglayici), isinstance(KrediKarti(), OdemeSaglayici))
</pre>

<h2>Protocol: yapısal tipleme</h2>
<p>ABC "kalıtımla sözleşme" kurar; <code>typing.Protocol</code> ise "bu metotlara sahip olan herkes uyar" der (ördek tipleme, duck typing). Alt sınıf olmak gerekmez; <code>@runtime_checkable</code> eklersen <code>isinstance</code> da çalışır. Dış kütüphanelerin sınıflarını değiştiremediğin, ama onları kendi fonksiyonlarına parametre olarak almak istediğin durumlarda Protocol tek çözümdür.</p>
<pre class="py">from typing import Protocol, runtime_checkable

@runtime_checkable
class Raporlanabilir(Protocol):
    def satir(self) -&gt; str: ...

class Siparis:
    def __init__(self, no, tutar): self.no, self.tutar = no, tutar
    def satir(self): return f'SIP-{self.no} {self.tutar:.2f}'

class Musteri:
    def __init__(self, ad): self.ad = ad
    def satir(self): return f'MUS {self.ad}'

def yazdir(kayitlar: list[Raporlanabilir]):
    for k in kayitlar:
        print(k.satir())

yazdir([Siparis(1, 99.9), Musteri('Ayşe')])
print(isinstance(Siparis(2, 1), Raporlanabilir), isinstance(3, Raporlanabilir))
</pre>
<div class="tbl-wrap"><table><tr><th>Özellik</th><th>ABC</th><th>Protocol</th></tr><tr><td>İlişki</td><td>Nominal: alt sınıf olmalı</td><td>Yapısal: metotlar uyuşmalı</td></tr><tr><td>Eksik metot</td><td>Örnekleme anında TypeError</td><td>Statik denetleyici (mypy) uyarır</td></tr><tr><td>Somut metot paylaşımı</td><td>Evet, miras alınır</td><td>Hayır (yalnızca imza)</td></tr><tr><td>Dış kütüphane sınıfı</td><td>Uyarlamak gerekir</td><td>Olduğu gibi uyar</td></tr><tr><td>Tipik kullanım</td><td>Kendi eklenti sistemin</td><td>Fonksiyon parametresi sözleşmesi</td></tr></table></div>

<h2>Descriptor ve property</h2>
<p><code>property</code> tek alana doğrulama eklemek için idealdir. Aynı doğrulamayı on sınıfta yirmi alana uygulayacaksan <b>descriptor</b> yaz: <code>__set_name__</code>, <code>__get__</code>, <code>__set__</code> metotlarına sahip bir sınıf. Pydantic, Django ORM ve dataclass\'ın <code>field</code> mekanizması bu altyapıya dayanır.</p>
<pre class="py">class Pozitif:
    """Alan değeri pozitif sayı olmalı; aksi halde ValueError."""
    def __set_name__(self, owner, name):
        self.ad = name
        self.gizli = '_' + name

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return getattr(obj, self.gizli)

    def __set__(self, obj, deger):
        if not isinstance(deger, (int, float)) or deger &lt;= 0:
            raise ValueError(f'{self.ad} pozitif olmalı, gelen: {deger!r}')
        setattr(obj, self.gizli, deger)

class KrediBasvurusu:
    tutar = Pozitif()
    vade_ay = Pozitif()

    def __init__(self, tutar, vade_ay):
        self.tutar = tutar
        self.vade_ay = vade_ay

    @property
    def aylik_taksit(self):             # salt okunur hesaplanmış alan
        return round(self.tutar / self.vade_ay, 2)

k = KrediBasvurusu(120_000, 24)
print(k.tutar, k.vade_ay, k.aylik_taksit)
try:
    k.vade_ay = 0
except ValueError as e:
    print('Hata:', e)
</pre>

<h2>__slots__, classmethod, staticmethod</h2>
<p><code>__slots__</code> nesnenin <code>__dict__</code> sözlüğünü kaldırır: bellek düşer, öznitelik erişimi hızlanır, yanlışlıkla <code>self.tutr = 5</code> yazmak AttributeError verir. Milyonlarca küçük nesne ürettiğin (işlem kayıtları, log satırları) sınıflarda değerlidir; dinamik öznitelik eklemen gereken yerlerde kullanma.</p>
<p><code>@classmethod</code> alternatif kurucu (constructor) yazmanın standart yoludur: <code>Siparis.from_dict(...)</code>, <code>datetime.fromisoformat(...)</code>. İlk parametresi sınıfın kendisidir; alt sınıftan çağrılınca alt sınıfı üretir. <code>@staticmethod</code> ise sınıfla ilgili ama ne örneğe ne sınıfa ihtiyaç duyan yardımcı fonksiyondur (ör. doğrulama).</p>
<pre class="py">from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class Islem:
    hesap: str
    tutar: float

    @staticmethod
    def hesap_gecerli(hesap: str) -&gt; bool:
        return hesap.startswith('TR') and len(hesap) == 26

    @classmethod
    def from_dict(cls, d: dict):
        if not cls.hesap_gecerli(d['hesap']):
            raise ValueError('IBAN geçersiz')
        return cls(hesap=d['hesap'], tutar=float(d['tutar']))

i = Islem.from_dict({'hesap': 'TR' + '0' * 24, 'tutar': '150.75'})
print(i)
try:
    i.ekstra = 1
except AttributeError as e:
    print('slots engelledi:', type(e).__name__)
</pre>
<div class="warn"><b>Kalıtım ve __slots__</b>Alt sınıf da <code>__slots__</code> tanımlamazsa <code>__dict__</code> geri gelir ve kazanım kaybolur. Çoklu kalıtımda iki ebeveynin ikisi de boş olmayan <code>__slots__</code> taşıyorsa "layout conflict" hatası alırsın.</div>

<h2>Metaclass\'a kısa bakış</h2>
<p>Metaclass, sınıfın sınıfıdır: <code>type</code>. <code>class X:</code> ifadesi aslında <code>type('X', (), {...})</code> çağrısıdır. Kendi metaclass\'ını yazarak sınıf tanımlanırken müdahale edebilirsin (otomatik kayıt, alan doğrulama). Uygulama kodunda nadiren gerekir; çoğu ihtiyaç <code>__init_subclass__</code> ile daha basit çözülür:</p>
<pre class="py">class Eklenti:
    kayit: dict[str, type] = {}

    def __init_subclass__(cls, anahtar=None, **kw):
        super().__init_subclass__(**kw)
        Eklenti.kayit[anahtar or cls.__name__.lower()] = cls

class CsvDisaAktar(Eklenti, anahtar='csv'): ...
class JsonDisaAktar(Eklenti, anahtar='json'): ...

print(sorted(Eklenti.kayit))
print(type(Eklenti), type(type))
</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Kurumsal kodda dunder disiplini</h3>
<p>İş hayatında sık görülen hatalar: <code>__eq__</code> yazıp <code>__hash__</code> unutmak (nesne kümeye girince TypeError), değişebilir (mutable) nesneye <code>__hash__</code> vermek (sözlükte kaybolan anahtarlar), <code>__repr__</code> yazmamak (log dosyasında <code>&lt;Siparis object at 0x...&gt;</code>). Pratik kural: değer nesneleri için <code>@dataclass(frozen=True)</code> kullan, eşitlik ve hash hazır gelir; davranış sınıflarında yalnızca gerçekten gereken dunder\'ları yaz.</p>
<p>ABC mi Protocol mü sorusunda ekip kuralı genelde şudur: kendi yazdığın eklenti sistemi ve paylaşılan somut metotlar varsa ABC; fonksiyon parametresi için "şu metoda sahip olsun" diyorsan Protocol. İkisini birlikte de kullanabilirsin: ABC gerçekleştirmeyi zorunlu kılar, Protocol test çiftlerinin (test double) kalıtım olmadan geçmesini sağlar.</p>
<p>Descriptor yazarken <code>__set_name__</code> kullan; alan adını elle tekrar etmek hata kaynağıdır. Performans kritik sınıflarda <code>__slots__</code> ile dataclass\'ın <code>slots=True</code> seçeneğini birleştir. Metaclass\'ı yalnızca bir çerçeve (framework) yazıyorsan düşün; uygulama kodunda görürsen önce <code>__init_subclass__</code> ya da sınıf dekoratörü ile çözülüp çözülemeyeceğini sor.</p>
</section>`,
    ex: [
      { t: 'code', id: 'ileri-oop-1',
        q: '<p>Anadolu Bank için <code>Tutar</code> sınıfı yaz. Kurucu <code>Tutar(kurus: int, birim: str = \'TRY\')</code> olsun. <code>__eq__</code> (kurus ve birim eşitse), <code>__hash__</code> (aynı alanlardan), <code>__lt__</code> (aynı birimde kurus karşılaştır) ve <code>__add__</code> (aynı birimde yeni Tutar döndür) metotlarını tanımla. Farklı tür ile karşılaştırmada <code>NotImplemented</code> döndür.</p>',
        start: 'class Tutar:\n    def __init__(self, kurus: int, birim: str = \'TRY\'):\n        self.kurus = kurus\n        self.birim = birim\n\n    # __eq__, __hash__, __lt__, __add__ yaz\n',
        sol: 'class Tutar:\n    def __init__(self, kurus: int, birim: str = \'TRY\'):\n        self.kurus = kurus\n        self.birim = birim\n\n    def __eq__(self, other):\n        if not isinstance(other, Tutar):\n            return NotImplemented\n        return (self.kurus, self.birim) == (other.kurus, other.birim)\n\n    def __hash__(self):\n        return hash((self.kurus, self.birim))\n\n    def __lt__(self, other):\n        if not isinstance(other, Tutar) or self.birim != other.birim:\n            return NotImplemented\n        return self.kurus < other.kurus\n\n    def __add__(self, other):\n        if not isinstance(other, Tutar) or self.birim != other.birim:\n            return NotImplemented\n        return Tutar(self.kurus + other.kurus, self.birim)\n',
        tests: 'assert Tutar(100) == Tutar(100), "Aynı kuruş ve birim eşit olmalı"\nassert Tutar(100) != Tutar(100, \'USD\'), "Farklı birim eşit olmamalı"\nassert Tutar(100) != 100, "Farklı türle eşit olmamalı"\nassert len({Tutar(5), Tutar(5), Tutar(6)}) == 2, "Hash eşitlikle tutarlı olmalı"\nassert Tutar(3) < Tutar(4), "__lt__ kuruşa göre karşılaştırmalı"\nassert sorted([Tutar(9), Tutar(1), Tutar(5)])[0] == Tutar(1), "sorted çalışmalı"\nt = Tutar(150) + Tutar(50)\nassert isinstance(t, Tutar) and t.kurus == 200, "__add__ yeni Tutar döndürmeli"\nimport operator\ntry:\n    operator.lt(Tutar(1), Tutar(1, \'USD\'))\n    assert False, "Farklı birimde < TypeError vermeli"\nexcept TypeError:\n    pass\n',
        hints: ['__eq__ içinde önce isinstance kontrolü yap; değilse NotImplemented döndür.', '__hash__ için hash((self.kurus, self.birim)) yeterli.', '__add__ aynı birimde Tutar(self.kurus + other.kurus, self.birim) döndürsün.'],
        why: 'NotImplemented döndürmek Python\'a "karşı tarafın metodunu dene" der; ikisi de bilmiyorsa TypeError oluşur. Hash, eşitlikte kullanılan alanlardan üretildiği için küme doğru çalışır.' },
      { t: 'mc', q: 'Bir sınıfa yalnızca <code>__eq__</code> yazdın, <code>__hash__</code> yazmadın. Ne olur?',
        o: ['Hiçbir şey değişmez, varsayılan hash kullanılır', 'Nesne hashlenemez olur; kümeye konamaz', 'Python otomatik olarak __eq__ alanlarından hash üretir', 'Sınıf tanımı SyntaxError verir'],
        a: 1, why: '__eq__ tanımlanıp __hash__ tanımlanmazsa Python __hash__ = None atar; nesne set/dict anahtarı olarak kullanılınca TypeError: unhashable type alırsın. Otomatik üretim yalnızca frozen dataclass gibi yapılarda vardır.' },
      { t: 'code', id: 'ileri-oop-3',
        q: '<p>Anadolu Market için <code>Katalog</code> sınıfı yaz. Kurucu <code>Katalog(urunler: dict[str, float])</code> (ürün adı -> fiyat). Şunları destekle: <code>len(k)</code> ürün sayısı, <code>k[\'kahve\']</code> fiyat (yoksa KeyError), <code>\'kahve\' in k</code>, <code>for ad in k</code> ürün adları üzerinde döner (alfabetik), <code>k(oran)</code> çağrısı tüm fiyatları oran ile çarpılmış yeni bir Katalog döndürür.</p>',
        start: 'class Katalog:\n    def __init__(self, urunler: dict[str, float]):\n        self._urunler = dict(urunler)\n    # __len__, __getitem__, __contains__, __iter__, __call__\n',
        sol: 'class Katalog:\n    def __init__(self, urunler: dict[str, float]):\n        self._urunler = dict(urunler)\n\n    def __len__(self):\n        return len(self._urunler)\n\n    def __getitem__(self, ad):\n        return self._urunler[ad]\n\n    def __contains__(self, ad):\n        return ad in self._urunler\n\n    def __iter__(self):\n        return iter(sorted(self._urunler))\n\n    def __call__(self, oran):\n        return Katalog({a: round(f * oran, 2) for a, f in self._urunler.items()})\n',
        tests: 'k = Katalog({\'kahve\': 150.0, \'bardak\': 40.0, \'çay\': 80.0})\nassert len(k) == 3, "len ürün sayısını vermeli"\nassert k[\'kahve\'] == 150.0, "__getitem__ fiyatı döndürmeli"\nassert \'çay\' in k and \'süt\' not in k, "__contains__ çalışmalı"\nassert list(k) == [\'bardak\', \'kahve\', \'çay\'], "__iter__ alfabetik ad vermeli"\ntry:\n    k[\'süt\']\n    assert False, "Olmayan ürün KeyError vermeli"\nexcept KeyError:\n    pass\nz = k(1.1)\nassert isinstance(z, Katalog) and abs(z[\'kahve\'] - 165.0) < 1e-6, "__call__ zamlı yeni katalog döndürmeli"\nassert k[\'kahve\'] == 150.0, "Orijinal katalog değişmemeli"\n',
        hints: ['__iter__ için iter(sorted(self._urunler)) döndür.', '__call__ içinde sözlük comprehension ile yeni Katalog üret.'],
        why: 'Dört dunder ile sınıf yerleşik koleksiyon gibi davranır; __call__ nesneyi fonksiyon gibi çağrılabilir yapar ve orijinali değiştirmeden yeni nesne döndürmek yan etkiyi önler.' },
      { t: 'code', id: 'ileri-oop-4',
        q: '<p><code>abc</code> modülüyle <code>Bildirim</code> soyut sınıfını yaz: soyut metot <code>gonder(self, mesaj) -> str</code>, somut metot <code>etiketle(self, mesaj)</code> = <code>f\'[{self.__class__.__name__}] {mesaj}\'</code>. <code>Eposta</code> ve <code>Sms</code> alt sınıfları <code>gonder</code> içinde <code>etiketle</code> sonucunu döndürsün. Ayrıca hiçbir metot gerçekleştirmeyen <code>Eksik(Bildirim)</code> sınıfı tanımla (örneklenemeyecek).</p>',
        start: 'from abc import ABC, abstractmethod\n\n# Bildirim, Eposta, Sms, Eksik\n',
        sol: 'from abc import ABC, abstractmethod\n\nclass Bildirim(ABC):\n    @abstractmethod\n    def gonder(self, mesaj) -> str: ...\n\n    def etiketle(self, mesaj):\n        return f\'[{self.__class__.__name__}] {mesaj}\'\n\nclass Eposta(Bildirim):\n    def gonder(self, mesaj):\n        return self.etiketle(mesaj)\n\nclass Sms(Bildirim):\n    def gonder(self, mesaj):\n        return self.etiketle(mesaj)\n\nclass Eksik(Bildirim):\n    pass\n',
        tests: 'assert Eposta().gonder(\'merhaba\') == \'[Eposta] merhaba\', "Eposta etiketli mesaj döndürmeli"\nassert Sms().gonder(\'kod 1234\') == \'[Sms] kod 1234\', "Sms etiketli mesaj döndürmeli"\nassert issubclass(Sms, Bildirim), "Sms Bildirim alt sınıfı olmalı"\nimport inspect\nassert inspect.isabstract(Bildirim), "Bildirim soyut olmalı"\ntry:\n    Eksik()\n    assert False, "Eksik örneklenemez olmalı (TypeError)"\nexcept TypeError:\n    pass\n',
        hints: ['class Bildirim(ABC): ve metodun üstüne @abstractmethod.', 'Somut etiketle metodu ABC içinde normal şekilde tanımlanır.'],
        why: 'ABC, alt sınıfın sözleşmeyi erken (örnekleme anında) ihlal ettiğini söyler; somut metotlar ise ortak davranışı paylaşır.' },
      { t: 'mc', q: '<code>__slots__</code> kullanmanın doğru gerekçesi hangisi?',
        o: ['Nesneye dinamik öznitelik ekleyebilmek', 'Çok sayıda küçük nesnede bellek ve erişim hızı kazanmak', 'Sınıfı otomatik olarak hashlenebilir yapmak', 'Kalıtımı engellemek'],
        a: 1, why: '__slots__ nesne başına __dict__ sözlüğünü kaldırır; bellek düşer, öznitelik erişimi hızlanır. Dinamik öznitelik eklemeyi engeller, hash ya da kalıtımla ilgisi yoktur.' },
      { t: 'code', id: 'ileri-oop-6',
        q: '<p><code>Aralik</code> adlı descriptor yaz: <code>Aralik(alt, ust)</code>. <code>__set_name__</code> ile alan adını öğrensin, <code>__get__</code> değeri döndürsün, <code>__set__</code> değer <code>alt &lt;= deger &lt;= ust</code> değilse <code>ValueError</code> fırlatsın (mesajda alan adı geçsin). Sonra <code>Kampanya</code> sınıfında <code>indirim = Aralik(0, 70)</code> ve <code>stok = Aralik(0, 10_000)</code> alanlarını kullan; kurucu <code>Kampanya(indirim, stok)</code>.</p>',
        start: 'class Aralik:\n    def __init__(self, alt, ust):\n        self.alt, self.ust = alt, ust\n    # __set_name__, __get__, __set__\n\nclass Kampanya:\n    indirim = Aralik(0, 70)\n    stok = Aralik(0, 10_000)\n    def __init__(self, indirim, stok):\n        self.indirim = indirim\n        self.stok = stok\n',
        sol: 'class Aralik:\n    def __init__(self, alt, ust):\n        self.alt, self.ust = alt, ust\n\n    def __set_name__(self, owner, name):\n        self.ad = name\n        self.gizli = \'_\' + name\n\n    def __get__(self, obj, objtype=None):\n        if obj is None:\n            return self\n        return getattr(obj, self.gizli)\n\n    def __set__(self, obj, deger):\n        if not (self.alt <= deger <= self.ust):\n            raise ValueError(f\'{self.ad}: {deger} [{self.alt}, {self.ust}] dışında\')\n        setattr(obj, self.gizli, deger)\n\nclass Kampanya:\n    indirim = Aralik(0, 70)\n    stok = Aralik(0, 10_000)\n    def __init__(self, indirim, stok):\n        self.indirim = indirim\n        self.stok = stok\n',
        tests: 'k = Kampanya(25, 500)\nassert k.indirim == 25 and k.stok == 500, "__get__ değeri döndürmeli"\nk.indirim = 70\nassert k.indirim == 70, "Sınır değer kabul edilmeli"\ntry:\n    k.indirim = 71\n    assert False, "71 ValueError vermeli"\nexcept ValueError as e:\n    assert \'indirim\' in str(e), "Hata mesajında alan adı olmalı"\ntry:\n    Kampanya(-1, 5)\n    assert False, "Negatif indirim ValueError vermeli"\nexcept ValueError:\n    pass\nk2 = Kampanya(10, 20)\nassert k.indirim == 70 and k2.indirim == 10, "Her nesne kendi değerini tutmalı"\nassert isinstance(Kampanya.indirim, Aralik), "Sınıftan erişimde descriptor dönmeli"\n',
        hints: ['__set_name__(self, owner, name) içinde self.ad = name; self.gizli = \'_\' + name.', 'Değeri nesnenin üzerinde gizli adla sakla: setattr(obj, self.gizli, deger).', '__get__ içinde obj None ise self döndür.'],
        why: 'Descriptor, doğrulamayı tek sınıfta toplar; her alan için property yazmak yerine Aralik(0, 70) demek yeter. Değer nesnede tutulduğu için örnekler birbirini etkilemez.' },
      { t: 'code', id: 'ileri-oop-7',
        q: '<p><code>Musteri</code> sınıfı yaz: alanlar <code>ad</code>, <code>eposta</code>. <code>@staticmethod eposta_gecerli(eposta) -> bool</code> (tam bir <code>@</code> ve ondan sonra en az bir nokta içermeli). <code>@classmethod from_dict(cls, d)</code>: <code>d[\'ad\']</code> boşluklarını kırpsın, e-posta geçersizse <code>ValueError</code>, geçerliyse e-postayı küçük harfe çevirip nesne döndürsün. Bir <code>KurumsalMusteri(Musteri)</code> alt sınıfı da tanımla (gövdesi pass); from_dict alt sınıftan çağrılınca alt sınıf örneği üretmeli.</p>',
        start: 'class Musteri:\n    def __init__(self, ad, eposta):\n        self.ad, self.eposta = ad, eposta\n    # eposta_gecerli, from_dict\n\nclass KurumsalMusteri(Musteri):\n    pass\n',
        sol: 'class Musteri:\n    def __init__(self, ad, eposta):\n        self.ad, self.eposta = ad, eposta\n\n    @staticmethod\n    def eposta_gecerli(eposta) -> bool:\n        if eposta.count(\'@\') != 1:\n            return False\n        return \'.\' in eposta.split(\'@\')[1]\n\n    @classmethod\n    def from_dict(cls, d):\n        eposta = d[\'eposta\'].strip()\n        if not cls.eposta_gecerli(eposta):\n            raise ValueError(\'e-posta geçersiz\')\n        return cls(d[\'ad\'].strip(), eposta.lower())\n\nclass KurumsalMusteri(Musteri):\n    pass\n',
        tests: 'assert Musteri.eposta_gecerli(\'a@b.com\') and not Musteri.eposta_gecerli(\'ab.com\') and not Musteri.eposta_gecerli(\'a@b\'), "eposta_gecerli kuralları"\nm = Musteri.from_dict({\'ad\': \'  Ayşe \', \'eposta\': \'AYSE@Anadolu.com\'})\nassert m.ad == \'Ayşe\' and m.eposta == \'ayse@anadolu.com\', "from_dict kırpmalı ve küçültmeli"\nk = KurumsalMusteri.from_dict({\'ad\': \'Acme\', \'eposta\': \'x@acme.com.tr\'})\nassert type(k) is KurumsalMusteri, "Alt sınıftan çağrı alt sınıf örneği üretmeli"\ntry:\n    Musteri.from_dict({\'ad\': \'X\', \'eposta\': \'bozuk\'})\n    assert False, "Geçersiz e-posta ValueError vermeli"\nexcept ValueError:\n    pass\n',
        hints: ['classmethod içinde cls(...) kullan, Musteri(...) değil.', 'Geçerlilik: eposta.count(\'@\') == 1 ve \'@\' sonrası parçada nokta var.'],
        why: 'cls ile üretmek alt sınıfların alternatif kurucuyu miras almasını sağlar. staticmethod ne self ne cls ister; saf yardımcı fonksiyondur.' },
      { t: 'mc', q: 'Dış bir kütüphanenin sınıfını değiştiremiyorsun ama <code>kapat()</code> metoduna sahip her nesneyi kabul eden bir fonksiyon yazmak istiyorsun. En uygun araç?',
        o: ['abc.ABC ile soyut sınıf', 'typing.Protocol', 'Metaclass', '__slots__'],
        a: 1, why: 'Protocol yapısal tipleme sağlar: kalıtım gerekmeden metodu olan her nesne uyar. ABC alt sınıf olmayı gerektirir; dış kütüphane sınıfını değiştiremezsin.' }
    ],
    faq: [
      { q: 'NotImplemented ile NotImplementedError aynı şey mi?', a: 'Hayır. NotImplemented, ikili operatör metotlarından döndürülen özel bir değerdir; Python karşı tarafın yansıma metodunu dener. NotImplementedError ise fırlatılan bir istisnadır, soyut gövdelerde ya da "henüz yazılmadı" durumunda kullanılır.' },
      { q: 'dataclass varken dunder yazmaya gerek var mı?', a: 'Değer nesneleri için çoğunlukla yok: @dataclass(frozen=True, order=True) eşitlik, hash ve sıralama üretir. Koleksiyon davranışı (__len__, __getitem__), __call__ ya da özel aritmetik gerekiyorsa elle yazarsın.' },
      { q: 'Descriptor ne zaman property\'den iyidir?', a: 'Aynı doğrulama mantığı birden fazla alan ya da sınıfta tekrar ediyorsa. Tek bir hesaplanmış alan için property daha okunur.' },
      { q: 'Metaclass öğrenmeli miyim?', a: 'Kavramı bil, nadiren yaz. Çerçeve (ORM, doğrulama kütüphanesi) yazmıyorsan __init_subclass__ ve sınıf dekoratörleri ihtiyaçların çoğunu karşılar.' }
    ],
    mistakes: [
      { bad: 'class P:\n    def __eq__(self, o): return self.x == o.x', good: 'class P:\n    def __eq__(self, o):\n        if not isinstance(o, P): return NotImplemented\n        return self.x == o.x\n    def __hash__(self): return hash(self.x)', why: 'Tür kontrolü olmadan P() == 5 AttributeError verir; __hash__ olmadan nesne kümeye giremez.' },
      { bad: 'class Liste:\n    def __len__(self): return self.n\n# if liste: ... her zaman n != 0 kontrolü', good: 'class Liste:\n    def __len__(self): return self.n\n    def __bool__(self): return True  # gerçekten istiyorsan', why: '__len__ tanımlayınca doğruluk değeri uzunluktan türer; boş koleksiyonun False sayılmasını istemiyorsan __bool__ yazmalısın.' },
      { bad: 'class A:\n    __slots__ = (\'x\',)\nclass B(A):\n    pass  # B nesnelerinde __dict__ geri gelir', good: 'class A:\n    __slots__ = (\'x\',)\nclass B(A):\n    __slots__ = (\'y\',)', why: 'Alt sınıf __slots__ tanımlamazsa __dict__ oluşur ve bellek kazanımı kaybolur.' },
      { bad: 'class M:\n    def from_dict(d):\n        return M(d[\'ad\'])', good: 'class M:\n    @classmethod\n    def from_dict(cls, d):\n        return cls(d[\'ad\'])', why: 'Dekoratörsüz metot örnek metodudur; sınıftan çağrı d parametresini self sanır. classmethod + cls alt sınıflarda da doğru tür üretir.' }
    ]
  }
);
})(window);
