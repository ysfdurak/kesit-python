/* test */
(function (W) {
"use strict";
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
  { id: 'ileri-oop', lv: 'ileri', mod: 'Mimari', min: 40,
    title: 'İleri OOP: dunder metotlar, ABC, Protocol ve descriptor',
    sum: 'Sınıflarını Python\'ın yerleşik türleri gibi davranacak şekilde tasarla: eşitlik, sıralama, uzunluk, indeksleme, çağrılabilirlik, soyut sınıflar, Protocol, descriptor, __slots__ ve metaclass\'a kısa bakış.',
    goals: ['__eq__, __hash__, __lt__ gibi dunder metotlarla sınıfımı küme, sözlük ve sorted ile uyumlu yapabilirim', '__len__, __getitem__, __iter__ ve __call__ ile kendi koleksiyon ve çağrılabilir nesnelerimi yazabilirim', 'ABC ile zorunlu arayüz, Protocol ile yapısal tipleme arasında doğru seçimi yapabilirim', 'Descriptor ve property ile alan doğrulamasını tek yerde toplayabilirim', '__slots__, classmethod, staticmethod ve metaclass\'ın ne zaman gerektiğini açıklayabilirim'],
    body: `<h2>Neden önemli?</h2>
<p>Orta seviyede sınıf yazmayı, kalıtımı ve dataclass\'ı öğrendin. Kurumsal kodda ise sınıfların "Python gibi" davranması beklenir: bir <code>Para</code> nesnesi <code>==</code> ile karşılaştırılabilmeli, bir kümeye konabilmeli, <code>sorted</code> ile sıralanabilmeli; bir <code>Sepet</code> nesnesi <code>len()</code> ve <code>for</code> ile kullanılabilmeli. Ilgaz Bank\'ta bir işlem motoru yazarken "bu iki tutar eşit mi?" sorusunun cevabı <code>id()</code> karşılaştırması olursa raporlar yanlış çıkar. Bu dersin konusu, sınıflarını dil ile bütünleştiren <b>özel metotlar</b> (dunder methods, "double underscore") ve kodun sınırlarını tanımlayan soyutlama araçlarıdır.</p>

<h2>Eşitlik, hash ve sıralama</h2>
<p>Varsayılan olarak iki nesne yalnızca aynı nesneyse eşittir. <code>__eq__</code> yazarak "değer eşitliği" tanımlarsın. Dikkat: <code>__eq__</code> yazıp <code>__hash__</code> yazmazsan Python nesneyi <b>hashlenemez</b> yapar; küme ve sözlük anahtarı olarak kullanamazsın. Değişmez (immutable) nesnelerde <code>__hash__</code>\'i eşitlikte kullandığın alanlardan üret.</p>
<pre class="py">from functools import total_ordering

@total_ordering
class Para:
    """Ilgaz Bank: kuruş hassasiyetinde tutar."""
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
        q: '<p>Ilgaz Bank için <code>Tutar</code> sınıfı yaz. Kurucu <code>Tutar(kurus: int, birim: str = \'TRY\')</code> olsun. <code>__eq__</code> (kurus ve birim eşitse), <code>__hash__</code> (aynı alanlardan), <code>__lt__</code> (aynı birimde kurus karşılaştır) ve <code>__add__</code> (aynı birimde yeni Tutar döndür) metotlarını tanımla. Farklı tür ile karşılaştırmada <code>NotImplemented</code> döndür.</p>',
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
  },
  { id: 'tasarim-kaliplari', lv: 'ileri', mod: 'Mimari', min: 38,
    title: 'Tasarım kalıpları Python\'da',
    sum: 'Strateji, fabrika, gözlemci, tekil, adaptör ve komut kalıplarını Python\'a özgü biçimde uygula; fonksiyonların birinci sınıf olduğu yerde kalıbın gereksizleştiğini gör.',
    goals: ['Strateji kalıbını sınıf hiyerarşisi yerine fonksiyon sözlüğüyle kurabilirim', 'Fabrika ve kayıt (registry) ile nesne üretimini çağıran koddan ayırabilirim', 'Gözlemci ve komut kalıplarıyla olay ve geri alma mekanizması tasarlayabilirim', 'Tekil (singleton) yerine neden modül düzeyi nesne kullanıldığını açıklayabilirim', 'Adaptör ile uyumsuz arayüzleri değişiklik yapmadan bağlayabilirim'],
    body: `<h2>Neden önemli?</h2>
<p>Tasarım kalıpları (design patterns), tekrar eden tasarım sorunlarına verilmiş isimli çözümlerdir. Kod incelemesinde "burada strateji kalıbı daha uygun" cümlesi, dakikalarca anlatımın yerini tutar. Ama kalıpların çoğu Java/C++ dünyasında, fonksiyonların nesne olmadığı bir ortamda doğdu. Python\'da fonksiyonlar birinci sınıf (first-class) değerdir, sınıflar çalışma zamanında oluşturulabilir, modüller zaten tekil nesnedir. Bu yüzden bu derste her kalıbı iki kez göreceksin: klasik biçimi ve Python\'da sade biçimi. Hedef, kalıbı ezberlemek değil; <b>ne zaman gerektiğini ve ne zaman gerekmediğini</b> ayırt etmektir.</p>

<h2>Strateji: değiştirilebilir davranış</h2>
<p>Anadolu Market\'te kargo ücreti şehre, ağırlığa ve kampanyaya göre farklı kurallarla hesaplanıyor. Klasik çözüm bir <code>KargoStratejisi</code> soyut sınıfı ve alt sınıflarıdır. Python\'da aynı iş, aynı imzaya sahip fonksiyonlar ve bir sözlükle çözülür.</p>
<pre class="py">from typing import Callable

Strateji = Callable[[float, str], float]   # (agirlik_kg, sehir) -&gt; ücret

def sabit(agirlik, sehir):
    return 49.90

def agirlik_bazli(agirlik, sehir):
    return 20 + 8 * agirlik

def bolgesel(agirlik, sehir):
    uzak = {'Hakkari', 'Kars', 'Van'}
    return agirlik_bazli(agirlik, sehir) * (1.5 if sehir in uzak else 1.0)

STRATEJILER: dict[str, Strateji] = {
    'sabit': sabit, 'agirlik': agirlik_bazli, 'bolgesel': bolgesel,
}

def kargo_ucreti(agirlik, sehir, strateji: str = 'agirlik'):
    hesapla = STRATEJILER[strateji]
    return round(hesapla(agirlik, sehir), 2)

for s in STRATEJILER:
    print(f'{s:&lt;9}', kargo_ucreti(3.5, 'Van', s))
</pre>
<div class="tip"><b>Kalıp gerekmeyen durum</b>Strateji, "davranışı parametre olarak geçir" demektir. Python\'da bu zaten <code>sorted(key=...)</code>, <code>map</code>, dekoratör ile her gün yaptığın şeydir. Stratejinin durumu (state) ve birden fazla metodu varsa o zaman sınıf (ya da Protocol) düşün.</div>

<h2>Fabrika ve kayıt (registry)</h2>
<p>Fabrika (factory), "hangi sınıfın üretileceğini" çağıran koddan gizler. Ilgaz Bank\'ta rapor türüne göre farklı dışa aktarıcı üretmek gibi. Python\'da en temiz biçim: bir sözlükte sınıfları tut, <code>__init_subclass__</code> ya da dekoratörle otomatik kaydet. Sınıflar zaten çağrılabilir olduğu için ayrı bir "Creator" hiyerarşisine gerek kalmaz.</p>
<pre class="py">import json, csv, io

KAYIT: dict[str, type] = {}

def disa_aktarici(format_adi):
    def kaydet(cls):
        KAYIT[format_adi] = cls
        return cls
    return kaydet

@disa_aktarici('json')
class JsonAktar:
    def yaz(self, satirlar):
        return json.dumps(satirlar, ensure_ascii=False)

@disa_aktarici('csv')
class CsvAktar:
    def yaz(self, satirlar):
        buf = io.StringIO()
        w = csv.DictWriter(buf, fieldnames=list(satirlar[0]))
        w.writeheader(); w.writerows(satirlar)
        return buf.getvalue().strip()

def aktarici_uret(format_adi: str):
    try:
        return KAYIT[format_adi]()
    except KeyError:
        raise ValueError(f'desteklenmeyen format: {format_adi!r}; seçenekler: {sorted(KAYIT)}')

veri = [{'hesap': 'TR01', 'bakiye': 1500.0}, {'hesap': 'TR02', 'bakiye': -20.5}]
for f in ('json', 'csv'):
    print(aktarici_uret(f).yaz(veri))
try:
    aktarici_uret('xml')
except ValueError as e:
    print(e)
</pre>

<h2>Gözlemci: olaylara abone olmak</h2>
<p>Gözlemci (observer), bir olay olduğunda ilgilenen herkese haber verir; yayıncı aboneleri tanımaz. Sipariş onaylanınca stok düşsün, e-posta gitsin, muhasebe kaydı açılsın. Python\'da abone bir fonksiyon, abone listesi de bir listedir.</p>
<pre class="py">from collections import defaultdict

class OlayYayini:
    def __init__(self):
        self._aboneler = defaultdict(list)

    def abone_ol(self, olay, fn):
        self._aboneler[olay].append(fn)
        return fn                      # dekoratör olarak da kullanılabilir

    def yayinla(self, olay, **veri):
        for fn in self._aboneler[olay]:
            fn(**veri)

bus = OlayYayini()
stok = {'kahve': 10}

@bus.abone_ol('siparis_onay')
def stok_dus(urun, adet, **_):
    stok[urun] -= adet
    print(f'stok güncellendi: {urun}={stok[urun]}')

@bus.abone_ol('siparis_onay')
def eposta(musteri, **_):
    print(f'e-posta: {musteri} siparişiniz onaylandı')

bus.yayinla('siparis_onay', urun='kahve', adet=3, musteri='ayse@x.com')
bus.yayinla('iade', urun='kahve')     # abone yok, sessizce geçer
</pre>
<div class="warn"><b>Abone hataları</b>Bir abonenin fırlattığı istisna diğer abonelere ulaşmayı engeller. Üretim kodunda her aboneyi <code>try/except</code> ile sarıp loglamak, ya da hataları toplayıp sonunda raporlamak gerekir. Ayrıca abonelerin çağrı sırasına güvenme; sıraya bağımlılık varsa gözlemci yanlış kalıptır.</div>

<h2>Tekil (singleton) ve neden modül daha iyi</h2>
<p>Tekil, bir sınıftan yalnızca tek örnek olmasını garanti eder: yapılandırma, bağlantı havuzu, logger. Klasik gerçekleştirme <code>__new__</code> üzerinden yapılır. Ancak Python\'da her modül yalnızca bir kez yüklenir ve zaten tekildir: <code>config.py</code> içinde <code>AYARLAR = {...}</code> yazmak, aynı garantiyi sıfır kodla verir ve test ederken yerine sahte nesne koymak (monkeypatch) çok daha kolaydır.</p>
<pre class="py">class Ayarlar:
    _ornek = None
    def __new__(cls):
        if cls._ornek is None:
            cls._ornek = super().__new__(cls)
            cls._ornek.degerler = {'para_birimi': 'TRY'}
        return cls._ornek

a, b = Ayarlar(), Ayarlar()
print(a is b, a.degerler)

# Pythonic eşdeğer: modül düzeyinde tek nesne
import types
config = types.SimpleNamespace(para_birimi='TRY', kdv=0.20)
print(config.para_birimi, config.kdv)
</pre>
<div class="tbl-wrap"><table><tr><th>Kalıp</th><th>Çözdüğü sorun</th><th>Klasik biçim</th><th>Python\'da sade biçim</th></tr><tr><td>Strateji</td><td>Değiştirilebilir algoritma</td><td>Soyut sınıf + alt sınıflar</td><td>Fonksiyon sözlüğü, key=</td></tr><tr><td>Fabrika</td><td>Üretimi gizlemek</td><td>Creator hiyerarşisi</td><td>Kayıt sözlüğü + sınıf çağrısı</td></tr><tr><td>Gözlemci</td><td>Gevşek bağlı bildirim</td><td>Subject/Observer arayüzü</td><td>Fonksiyon listesi</td></tr><tr><td>Tekil</td><td>Tek örnek</td><td>__new__ ile kontrol</td><td>Modül düzeyi nesne</td></tr><tr><td>Adaptör</td><td>Uyumsuz arayüz</td><td>Sarmalayıcı sınıf</td><td>Sarmalayıcı sınıf ya da fonksiyon</td></tr><tr><td>Komut</td><td>İşlemi nesne yapmak, geri alma</td><td>execute/undo arayüzü</td><td>dataclass + Protocol</td></tr></table></div>

<h2>Adaptör: uyumsuz arayüzleri bağlamak</h2>
<p>Eski bir ödeme kütüphanesi <code>charge(amount_cents)</code> bekliyor, yeni kodun ise <code>tahsil_et(tutar_tl)</code> çağırıyor. Hiçbirini değiştirmeden ikisini bir adaptörle bağlarsın. Adaptör ince olmalı: dönüştür, yönlendir, bitir.</p>
<pre class="py">class EskiOdemeKutuphanesi:          # değiştiremediğin dış kod
    def charge(self, amount_cents: int) -&gt; dict:
        return {'ok': amount_cents &gt; 0, 'cents': amount_cents}

class OdemeAdaptoru:
    def __init__(self, eski):
        self._eski = eski
    def tahsil_et(self, tutar_tl: float) -&gt; bool:
        return self._eski.charge(round(tutar_tl * 100))['ok']

def siparisi_tamamla(saglayici, tutar):
    return 'tamam' if saglayici.tahsil_et(tutar) else 'reddedildi'

print(siparisi_tamamla(OdemeAdaptoru(EskiOdemeKutuphanesi()), 149.90))
print(siparisi_tamamla(OdemeAdaptoru(EskiOdemeKutuphanesi()), 0))
</pre>

<h2>Komut: işlemi nesne yapmak</h2>
<p>Komut (command) kalıbında her işlem; çalıştırılabilen ve geri alınabilen bir nesnedir. Geri al/yinele, işlem kuyruğu, denetim kaydı (audit log) için kullanılır. Ilgaz Bank\'ta hesap hareketlerini komut olarak modellemek, hatalı bir toplu işlemi tersine çevirmeyi mümkün kılar.</p>
<pre class="py">from dataclasses import dataclass, field

@dataclass
class YatirKomutu:
    hesaplar: dict
    hesap: str
    tutar: float
    def uygula(self):
        self.hesaplar[self.hesap] += self.tutar
    def geri_al(self):
        self.hesaplar[self.hesap] -= self.tutar

@dataclass
class TransferKomutu:
    hesaplar: dict
    kaynak: str
    hedef: str
    tutar: float
    def uygula(self):
        if self.hesaplar[self.kaynak] &lt; self.tutar:
            raise ValueError('yetersiz bakiye')
        self.hesaplar[self.kaynak] -= self.tutar
        self.hesaplar[self.hedef] += self.tutar
    def geri_al(self):
        self.hesaplar[self.hedef] -= self.tutar
        self.hesaplar[self.kaynak] += self.tutar

@dataclass
class Islemci:
    gecmis: list = field(default_factory=list)
    def calistir(self, komut):
        komut.uygula()
        self.gecmis.append(komut)
    def geri_al(self):
        if self.gecmis:
            self.gecmis.pop().geri_al()

h = {'TR01': 100.0, 'TR02': 0.0}
p = Islemci()
p.calistir(YatirKomutu(h, 'TR01', 50))
p.calistir(TransferKomutu(h, 'TR01', 'TR02', 120))
print(h)
p.geri_al(); print('transfer geri alındı:', h)
p.geri_al(); print('yatırma geri alındı:', h)
</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Kalıp seçiminde kurumsal refleksler</h3>
<p>Kod incelemelerinde en sık görülen kalıp hatası "fazla mimari"dir: üç satırlık bir koşul için strateji hiyerarşisi, iki format için fabrika sınıfı. Kuralı şöyle koy: kalıbı, aynı sorunu <b>ikinci kez</b> çözerken tanıt, birincide değil. Birinci sınıf fonksiyonlar, <code>functools.partial</code>, dataclass ve Protocol, klasik kalıpların büyük kısmını iki üç satıra indirir.</p>
<p>Buna karşılık bazı kalıplar Python\'da bile sınıf ister: komut (durum + geri alma), gözlemci (abone yönetimi, hata izolasyonu), adaptör (dış sistem sınırı). Bunların ortak noktası, kodun bir sınırda durmasıdır: dış kütüphane, ağ, veritabanı, kullanıcı etkileşimi. Sınırlarda açık arayüz (Protocol) tanımla; içeride sade fonksiyonlarla kal.</p>
<p>Testte kalıpların karşılığı: strateji sözlüğünü testte sahte fonksiyonla değiştir; gözlemcide aboneleri listeye toplayıp yayın sonrası kontrol et; komutlarda <code>uygula</code> + <code>geri_al</code> sonrası durumun başlangıca döndüğünü doğrula (round-trip testi). Tekil yerine modül düzeyi nesne kullanmanın en büyük getirisi de burada: <code>monkeypatch.setattr(config, 'kdv', 0)</code> ile tek satırda izole test.</p>
</section>`,
    ex: [
      { t: 'code', id: 'tasarim-kaliplari-1',
        q: '<p>Anadolu Market indirim stratejileri. Üç fonksiyon yaz: <code>yok(tutar)</code> tutarı döndürür; <code>yuzde10(tutar)</code> %10 indirir; <code>esik(tutar)</code> 500 ve üzerinde 50 TL düşer, altında aynen döndürür. Bunları <code>INDIRIMLER</code> sözlüğünde <code>\'yok\'</code>, <code>\'yuzde10\'</code>, <code>\'esik\'</code> anahtarlarıyla tut. <code>odenecek(tutar, strateji=\'yok\')</code> fonksiyonu sözlükten stratejiyi bulup sonucu 2 ondalığa yuvarlasın; bilinmeyen strateji için <code>ValueError</code> fırlatsın.</p>',
        start: 'def yok(tutar):\n    pass\n\n# yuzde10, esik, INDIRIMLER, odenecek\n',
        sol: 'def yok(tutar):\n    return tutar\n\ndef yuzde10(tutar):\n    return tutar * 0.9\n\ndef esik(tutar):\n    return tutar - 50 if tutar >= 500 else tutar\n\nINDIRIMLER = {\'yok\': yok, \'yuzde10\': yuzde10, \'esik\': esik}\n\ndef odenecek(tutar, strateji=\'yok\'):\n    if strateji not in INDIRIMLER:\n        raise ValueError(f\'bilinmeyen strateji: {strateji}\')\n    return round(INDIRIMLER[strateji](tutar), 2)\n',
        tests: 'assert odenecek(200) == 200, "Varsayılan strateji tutarı değiştirmemeli"\nassert abs(odenecek(199.9, \'yuzde10\') - 179.91) < 1e-6, "yuzde10 %10 indirmeli"\nassert odenecek(500, \'esik\') == 450 and odenecek(499, \'esik\') == 499, "esik 500 ve üzerinde 50 düşmeli"\nassert set(INDIRIMLER) == {\'yok\', \'yuzde10\', \'esik\'}, "INDIRIMLER anahtarları"\ntry:\n    odenecek(10, \'bilinmez\')\n    assert False, "Bilinmeyen strateji ValueError vermeli"\nexcept ValueError:\n    pass\n',
        hints: ['Sözlük değerleri fonksiyonun kendisi olmalı: yok, yok() değil.', 'odenecek içinde INDIRIMLER[strateji](tutar) çağrısı yap.'],
        why: 'Fonksiyonlar birinci sınıf olduğu için strateji kalıbı sözlük + çağrı ile biter; yeni strateji eklemek tek satırdır.' },
      { t: 'mc', q: 'Python\'da klasik tekil (singleton) sınıfı yerine modül düzeyi nesne önerilmesinin temel nedeni nedir?',
        o: ['Modüller daha hızlı yüklenir', 'Modül zaten tek kez yüklenir; testte değiştirmesi kolaydır', 'Sınıflar Python\'da tekil olamaz', 'Modül nesneleri değişmezdir'],
        a: 1, why: 'import sistemi bir modülü tek kez yükler ve sys.modules\'da tutar; bu zaten tekil garantisidir. Ayrıca modül öznitelikleri monkeypatch ile kolayca değiştirilir. Diğer seçenekler yanlış iddialardır.' },
      { t: 'code', id: 'tasarim-kaliplari-3',
        q: '<p>Kayıt tabanlı fabrika. <code>KAYIT</code> adlı boş sözlük ve <code>rapor(ad)</code> adlı sınıf dekoratörü yaz: dekoratör sınıfı <code>KAYIT[ad]</code> olarak kaydedip sınıfı aynen döndürsün. Sonra <code>@rapor(\'ozet\')</code> ile <code>OzetRapor</code> (metot <code>uret(self, satirlar)</code> -> <code>f\'{len(satirlar)} satır\'</code>) ve <code>@rapor(\'toplam\')</code> ile <code>ToplamRapor</code> (<code>uret</code> -> satırlardaki <code>\'tutar\'</code> toplamı, float) tanımla. <code>rapor_uret(ad)</code> ilgili sınıfın yeni örneğini döndürsün; yoksa <code>KeyError</code>.</p>',
        start: 'KAYIT = {}\n\ndef rapor(ad):\n    pass\n\n# OzetRapor, ToplamRapor, rapor_uret\n',
        sol: 'KAYIT = {}\n\ndef rapor(ad):\n    def kaydet(cls):\n        KAYIT[ad] = cls\n        return cls\n    return kaydet\n\n@rapor(\'ozet\')\nclass OzetRapor:\n    def uret(self, satirlar):\n        return f\'{len(satirlar)} satır\'\n\n@rapor(\'toplam\')\nclass ToplamRapor:\n    def uret(self, satirlar):\n        return float(sum(s[\'tutar\'] for s in satirlar))\n\ndef rapor_uret(ad):\n    return KAYIT[ad]()\n',
        tests: 'veri = [{\'tutar\': 10.5}, {\'tutar\': 4.5}]\nassert set(KAYIT) == {\'ozet\', \'toplam\'}, "Dekoratör iki sınıfı kaydetmeli"\nassert KAYIT[\'ozet\'] is OzetRapor, "Dekoratör sınıfı aynen döndürmeli"\nassert rapor_uret(\'ozet\').uret(veri) == \'2 satır\', "OzetRapor satır sayısı"\nassert abs(rapor_uret(\'toplam\').uret(veri) - 15.0) < 1e-6, "ToplamRapor toplam"\nassert rapor_uret(\'ozet\') is not rapor_uret(\'ozet\'), "Her çağrı yeni örnek üretmeli"\ntry:\n    rapor_uret(\'yok\')\n    assert False, "Kayıtsız ad KeyError vermeli"\nexcept KeyError:\n    pass\n',
        hints: ['Parametreli dekoratör iki katmanlı: rapor(ad) -> kaydet(cls) -> cls.', 'rapor_uret içinde KAYIT[ad]() ile örnek üret.'],
        why: 'Sınıflar çağrılabilir olduğundan fabrika bir sözlük aramasına iner; dekoratör kaydı tanım yerinde tutar, merkezi if/elif zincirine gerek kalmaz.' },
      { t: 'code', id: 'tasarim-kaliplari-4',
        q: '<p><code>OlayYayini</code> sınıfı yaz: <code>abone_ol(olay, fn)</code> fonksiyonu kaydeder ve fn\'i döndürür; <code>yayinla(olay, **veri)</code> o olayın tüm abonelerini sırayla <code>fn(**veri)</code> ile çağırır. Bir abone istisna fırlatırsa diğerleri yine çağrılmalı; yayinla, fırlatılan istisnaların listesini döndürsün (hata yoksa boş liste).</p>',
        start: 'from collections import defaultdict\n\nclass OlayYayini:\n    def __init__(self):\n        self._aboneler = defaultdict(list)\n    # abone_ol, yayinla\n',
        sol: 'from collections import defaultdict\n\nclass OlayYayini:\n    def __init__(self):\n        self._aboneler = defaultdict(list)\n\n    def abone_ol(self, olay, fn):\n        self._aboneler[olay].append(fn)\n        return fn\n\n    def yayinla(self, olay, **veri):\n        hatalar = []\n        for fn in self._aboneler[olay]:\n            try:\n                fn(**veri)\n            except Exception as e:\n                hatalar.append(e)\n        return hatalar\n',
        tests: 'bus = OlayYayini()\nlog = []\nbus.abone_ol(\'siparis\', lambda **v: log.append((\'a\', v[\'no\'])))\ndef bozuk(**v):\n    raise RuntimeError(\'patladı\')\nbus.abone_ol(\'siparis\', bozuk)\nf = bus.abone_ol(\'siparis\', lambda **v: log.append((\'c\', v[\'no\'])))\nassert callable(f), "abone_ol fonksiyonu geri döndürmeli"\nhatalar = bus.yayinla(\'siparis\', no=7)\nassert log == [(\'a\', 7), (\'c\', 7)], "Hatalı abone diğerlerini engellememeli"\nassert len(hatalar) == 1 and isinstance(hatalar[0], RuntimeError), "Hatalar listede dönmeli"\nassert bus.yayinla(\'yok\') == [], "Abonesi olmayan olay boş liste döndürmeli"\n',
        hints: ['Her aboneyi try/except Exception ile sar; istisnayı listeye ekle.', 'defaultdict(list) sayesinde olmayan olay için boş liste döner.'],
        why: 'Gözlemci kalıbında hata izolasyonu kritiktir: bir abonenin çökmesi diğer iş kurallarını atlatmamalı. Hataları döndürmek çağırana karar hakkı verir.' },
      { t: 'mc', q: 'Komut (command) kalıbının en belirgin faydası hangisi?',
        o: ['Daha az bellek kullanımı', 'Nesne üretimini gizlemek', 'İşlemleri geri alınabilir ve kuyruklanabilir nesneler yapmak', 'Arayüz uyumsuzluğunu gidermek'],
        a: 2, why: 'Komut, her işlemi uygula/geri_al metotlu bir nesne yapar; böylece geçmiş tutma, geri alma, kuyruk ve denetim kaydı kolaylaşır. Üretimi gizlemek fabrika, uyumsuzluk adaptör konusudur.' },
      { t: 'code', id: 'tasarim-kaliplari-6',
        q: '<p>Ilgaz Bank için komut kalıbı. <code>CekKomutu(hesaplar, hesap, tutar)</code> dataclass\'ı: <code>uygula()</code> bakiye yetersizse <code>ValueError</code> fırlatıp hiçbir şey değiştirmesin, yeterliyse düşsün; <code>geri_al()</code> tutarı geri eklesin. <code>Islemci</code> sınıfı: <code>calistir(komut)</code> uygula\'yı çağırıp başarılıysa geçmişe eklesin (hata fırlarsa geçmişe eklemeden hatayı yeniden fırlatsın), <code>geri_al()</code> son komutu geri alsın ve döndürsün (geçmiş boşsa None), <code>gecmis</code> listesi dışarıdan okunabilsin.</p>',
        start: 'from dataclasses import dataclass, field\n\n@dataclass\nclass CekKomutu:\n    hesaplar: dict\n    hesap: str\n    tutar: float\n    # uygula, geri_al\n\n@dataclass\nclass Islemci:\n    gecmis: list = field(default_factory=list)\n    # calistir, geri_al\n',
        sol: 'from dataclasses import dataclass, field\n\n@dataclass\nclass CekKomutu:\n    hesaplar: dict\n    hesap: str\n    tutar: float\n\n    def uygula(self):\n        if self.hesaplar[self.hesap] < self.tutar:\n            raise ValueError(\'yetersiz bakiye\')\n        self.hesaplar[self.hesap] -= self.tutar\n\n    def geri_al(self):\n        self.hesaplar[self.hesap] += self.tutar\n\n@dataclass\nclass Islemci:\n    gecmis: list = field(default_factory=list)\n\n    def calistir(self, komut):\n        komut.uygula()\n        self.gecmis.append(komut)\n\n    def geri_al(self):\n        if not self.gecmis:\n            return None\n        k = self.gecmis.pop()\n        k.geri_al()\n        return k\n',
        tests: 'h = {\'TR01\': 100.0}\np = Islemci()\np.calistir(CekKomutu(h, \'TR01\', 30))\nassert h[\'TR01\'] == 70 and len(p.gecmis) == 1, "Çekim bakiyeyi düşürmeli ve geçmişe girmeli"\ntry:\n    p.calistir(CekKomutu(h, \'TR01\', 500))\n    assert False, "Yetersiz bakiye ValueError vermeli"\nexcept ValueError:\n    pass\nassert h[\'TR01\'] == 70 and len(p.gecmis) == 1, "Başarısız komut bakiye ve geçmişi değiştirmemeli"\nk = p.geri_al()\nassert isinstance(k, CekKomutu) and h[\'TR01\'] == 100, "geri_al son komutu tersine çevirmeli"\nassert p.geri_al() is None, "Boş geçmişte None dönmeli"\n',
        hints: ['uygula içinde önce kontrol, sonra değişiklik: hata durumunda durum bozulmasın.', 'calistir\'da uygula başarılı olduktan sonra append yap.'],
        why: 'Komut nesnesi hem işlemi hem tersini taşır; Islemci yalnızca sıralamayı bilir. Başarısız komutun geçmişe girmemesi geri alma zincirini tutarlı tutar.' },
      { t: 'code', id: 'tasarim-kaliplari-7',
        q: '<p>Adaptör. Verilen <code>EskiSmsServisi.send(self, to: str, body: str) -> int</code> (gönderilen karakter sayısını döndürür) sınıfını değiştirmeden, <code>SmsAdaptoru(eski)</code> sınıfı yaz: <code>gonder(self, telefon: str, mesaj: str) -> bool</code>. Telefon numarasındaki boşluk ve tireleri temizleyip <code>+90</code> ile başlamıyorsa başına eklesin, eski servisi çağırsın ve dönen sayı 0\'dan büyükse True döndürsün. Ayrıca adaptör son gönderilen numarayı <code>son_numara</code> özniteliğinde tutsun.</p>',
        start: 'class EskiSmsServisi:\n    def send(self, to: str, body: str) -> int:\n        return len(body) if to.startswith(\'+\') else 0\n\nclass SmsAdaptoru:\n    def __init__(self, eski):\n        self._eski = eski\n        self.son_numara = None\n    # gonder\n',
        sol: 'class EskiSmsServisi:\n    def send(self, to: str, body: str) -> int:\n        return len(body) if to.startswith(\'+\') else 0\n\nclass SmsAdaptoru:\n    def __init__(self, eski):\n        self._eski = eski\n        self.son_numara = None\n\n    def gonder(self, telefon: str, mesaj: str) -> bool:\n        tel = telefon.replace(\' \', \'\').replace(\'-\', \'\')\n        if not tel.startswith(\'+90\'):\n            tel = \'+90\' + tel.lstrip(\'0\')\n        self.son_numara = tel\n        return self._eski.send(tel, mesaj) > 0\n',
        tests: 'a = SmsAdaptoru(EskiSmsServisi())\nassert a.gonder(\'0532 111-22-33\', \'Kodunuz 4821\') is True, "Geçerli gönderim True dönmeli"\nassert a.son_numara == \'+905321112233\', "Numara temizlenip +90 ile başlamalı"\nassert a.gonder(\'+90 532 000 00 00\', \'x\') is True and a.son_numara == \'+905320000000\', "+90 ile başlayan numara tekrar eklenmemeli"\nassert a.gonder(\'5321112233\', \'\') is False, "Boş mesaj 0 karakter -> False"\n',
        hints: ['Boşluk ve tireyi replace ile kaldır.', 'Başta 0 varsa kırp: tel.lstrip(\'0\'), sonra +90 ekle.'],
        why: 'Adaptör yalnızca biçim dönüştürür ve yönlendirir; eski servis ve yeni kod birbirinden habersiz kalır, ikisi de değişmez.' }
    ],
    faq: [
      { q: 'Kalıpları ezberlemeli miyim?', a: 'İsimlerini ve çözdükleri sorunu bil; ekip içinde ortak dil sağlar. Gerçekleştirme biçimi dile göre değişir; Python\'da çoğu kalıp fonksiyon ve sözlükle sadeleşir.' },
      { q: 'Strateji için sınıf mı fonksiyon mu?', a: 'Tek metot ve durum yoksa fonksiyon. Stratejinin yapılandırması, birden fazla metodu ya da tutması gereken durumu varsa sınıf (ve parametre tipi olarak Protocol).' },
      { q: 'Gözlemci yerine ne zaman kuyruk kullanmalıyım?', a: 'Aboneler ağır iş yapıyorsa, süreç dışına çıkıyorsa ya da yeniden deneme gerekiyorsa mesaj kuyruğu (Celery, RabbitMQ, Kafka) uygundur. Süreç içi, hafif ve senkron bildirimlerde liste tabanlı gözlemci yeter.' }
    ],
    mistakes: [
      { bad: 'if tur == \'json\': return JsonAktar()\nelif tur == \'csv\': return CsvAktar()\nelif ...', good: 'KAYIT = {\'json\': JsonAktar, \'csv\': CsvAktar}\nreturn KAYIT[tur]()', why: 'Uzun if/elif zinciri her yeni tür için değiştirilmek zorunda; sözlük kaydı açık-kapalı ilkesine uyar.' },
      { bad: 'class Strateji(ABC): ...\nclass Sabit(Strateji): ...\nclass Agirlik(Strateji): ...\n# her biri tek metot', good: 'STRATEJILER = {\'sabit\': sabit, \'agirlik\': agirlik_bazli}', why: 'Durumsuz tek metotlu sınıflar fonksiyonla aynı işi yapar; hiyerarşi gereksiz yük ekler.' },
      { bad: 'for fn in aboneler:\n    fn(**veri)  # ilk hata zinciri keser', good: 'for fn in aboneler:\n    try:\n        fn(**veri)\n    except Exception as e:\n        hatalar.append(e)', why: 'Gözlemcide bir abonenin hatası diğer iş kurallarının atlanmasına yol açmamalı.' }
    ]
  },
  { id: 'tip-sistemi-ileri', lv: 'ileri', mod: 'Mimari', min: 40,
    title: 'İleri tip sistemi: Generic, Protocol, TypedDict ve mypy',
    sum: 'Generic/TypeVar, Protocol, Literal, TypedDict, overload, NewType, Callable ve ParamSpec ile kodun sözleşmesini yaz; mypy/pyright\'ın nasıl çalıştığını ve strict modu öğren.',
    goals: ['TypeVar ve Generic ile türü koruyan konteyner ve fonksiyon yazabilirim', 'Literal, TypedDict ve NewType ile sözlük ve kimlik türlerini kesinleştirebilirim', 'overload ile girdiye göre değişen dönüş tipini bildirebilirim', 'Callable ve ParamSpec ile dekoratörün imzasını koruyabilirim', 'mypy/pyright\'ın çalışma mantığını ve strict modun ne denetlediğini açıklayabilirim'],
    body: `<h2>Neden önemli?</h2>
<p>Orta seviyede tip ipuçlarını (type hints) belgeleme aracı olarak kullandın. Kurumsal projelerde ipuçları bundan fazlasıdır: CI\'da çalışan <code>mypy</code> ya da <code>pyright</code>, kod çalışmadan önce "bu fonksiyona None gelebilir" ya da "bu sözlükte böyle bir anahtar yok" der. Ilgaz Bank\'ta bir müşteri numarasıyla hesap numarasını karıştıran kod, test edilmediyse üretimde patlar; <code>NewType</code> ile bu karışıklık derleme-benzeri aşamada yakalanır. Bu ders, tip sistemini bir sözleşme dili olarak kullanmayı öğretir. Unutma: Python çalışma zamanında ipuçlarını <b>denetlemez</b>; bu yüzden alıştırmalarda ipuçlarını <code>typing.get_type_hints</code> ve <code>inspect.signature</code> ile okuyarak kendimiz kontrol edeceğiz.</p>

<h2>TypeVar ve Generic</h2>
<p>Bir fonksiyon "ne verirsen onu döndürür" diyorsa <code>Any</code> yazmak bilgiyi kaybettirir. <code>TypeVar</code>, "burada bir tür var, adı T, giriş ve çıkışta aynı" der. Sınıfları da generic yapabilirsin: <code>Stack[int]</code>. Python 3.12 ile <code>def ilk[T](...)</code> ve <code>class Stack[T]:</code> kısa sözdizimi geldi; eski sözdizimini de tanıman gerekir çünkü kurumsal kodun çoğu onunla yazıldı.</p>
<pre class="py">from typing import TypeVar, Generic, get_type_hints

T = TypeVar('T')

def ilk(dizi: list[T], varsayilan: T) -&gt; T:
    return dizi[0] if dizi else varsayilan

class Stack(Generic[T]):
    def __init__(self) -&gt; None:
        self._v: list[T] = []
    def push(self, x: T) -&gt; None:
        self._v.append(x)
    def pop(self) -&gt; T:
        return self._v.pop()
    def __len__(self) -&gt; int:
        return len(self._v)

# Python 3.12 kısa sözdizimi
def son[U](dizi: list[U]) -&gt; U:
    return dizi[-1]

s: Stack[str] = Stack()
s.push('TR01'); s.push('TR02')
print(s.pop(), len(s))
print(ilk([], 0), ilk([3.5], 0.0), son(['a', 'b']))
print(get_type_hints(ilk))          # çalışma zamanında ipuçlarını oku
</pre>
<div class="note"><b>Sınırlı TypeVar</b><code>TypeVar('N', int, float)</code> yalnızca bu türlere izin verir; <code>TypeVar('C', bound=Comparable)</code> ise "bu Protocol\'ü sağlayan her tür" der. <code>sorted</code> benzeri fonksiyonlar bound ile yazılır.</div>

<h2>Literal, TypedDict, NewType</h2>
<p><code>Literal['TRY', 'USD']</code> bir parametrenin yalnızca belirli değerleri alabileceğini söyler; enum kadar ağır değildir. <code>TypedDict</code> JSON\'dan gelen sözlüklerin anahtarlarını ve tiplerini tanımlar; mypy yanlış anahtarı yakalar, çalışma zamanında ise sıradan <code>dict</code>\'tir. <code>NewType</code> aynı temel türden ayrı kimlikler üretir: <code>MusteriNo</code> ve <code>HesapNo</code> ikisi de <code>int</code> olsa bile birbirinin yerine geçemez.</p>
<pre class="py">from typing import Literal, TypedDict, NewType, NotRequired

ParaBirimi = Literal['TRY', 'USD', 'EUR']
MusteriNo = NewType('MusteriNo', int)
HesapNo = NewType('HesapNo', int)

class Islem(TypedDict):
    hesap: HesapNo
    tutar: float
    birim: ParaBirimi
    aciklama: NotRequired[str]        # isteğe bağlı anahtar

def bakiye_etkisi(i: Islem) -&gt; float:
    kur = {'TRY': 1.0, 'USD': 1.0, 'EUR': 1.0}   # örnek
    return i['tutar'] * kur[i['birim']]

i: Islem = {'hesap': HesapNo(1001), 'tutar': 250.0, 'birim': 'TRY'}
print(bakiye_etkisi(i), type(i).__name__)
print(Islem.__required_keys__, Islem.__optional_keys__)
m = MusteriNo(1001)
print(m == 1001, type(m))             # çalışma zamanında sıradan int
</pre>
<div class="warn"><b>Çalışma zamanı denetlemez</b><code>{'hesap': 1, 'tutar': 'yüz', 'birim': 'XXX'}</code> yazsan Python ses çıkarmaz; yalnızca mypy uyarır. Dış veriyi (API, dosya) gerçekten doğrulamak için pydantic ya da elle kontrol gerekir; TypedDict bir niyet beyanıdır.</div>

<h2>overload: girdiye göre dönüş tipi</h2>
<p>Bir fonksiyon <code>str</code> alınca <code>str</code>, <code>list[str]</code> alınca <code>list[str]</code> döndürüyorsa tek imza bunu anlatamaz. <code>@overload</code> ile "görünür imzaları" sıralar, en sonda gerçek gerçekleştirmeyi yazarsın. Overload gövdeleri <code>...</code> olur; çalışma zamanında yalnızca son tanım kalır.</p>
<pre class="py">from typing import overload

@overload
def normalize(x: str) -&gt; str: ...
@overload
def normalize(x: list[str]) -&gt; list[str]: ...
def normalize(x):
    if isinstance(x, str):
        return x.strip().lower()
    return [s.strip().lower() for s in x]

print(normalize('  AYŞE '), normalize([' A', 'b ']))
</pre>

<h2>Callable ve ParamSpec</h2>
<p><code>Callable[[int, str], bool]</code> "int ve str alıp bool döndüren" fonksiyon tipidir. Dekoratör yazarken sorun şudur: <code>Callable[..., T]</code> dönüş tipini korur ama parametre bilgisini yutar; editör artık yanlış argümanı göremez. <code>ParamSpec</code> parametre listesini bir değişken gibi taşır ve dekoratör imzayı olduğu gibi aktarır.</p>
<pre class="py">from typing import Callable, ParamSpec, TypeVar
from functools import wraps
import inspect

P = ParamSpec('P')
R = TypeVar('R')

def logla(fn: Callable[P, R]) -&gt; Callable[P, R]:
    @wraps(fn)
    def sarmal(*args: P.args, **kwargs: P.kwargs) -&gt; R:
        print(f'-&gt; {fn.__name__}{args}{kwargs or ""}')
        return fn(*args, **kwargs)
    return sarmal

@logla
def faiz(anapara: float, oran: float, ay: int = 12) -&gt; float:
    return round(anapara * oran * ay / 12, 2)

print(faiz(10_000, 0.3, ay=6))
print(inspect.signature(faiz))       # wraps sayesinde imza korunur
</pre>

<h2>mypy ve pyright nasıl çalışır?</h2>
<p>Her iki araç da kodu çalıştırmaz; kaynak dosyayı ayrıştırır, her ifadenin tipini <b>çıkarım</b> (inference) ile bulur ve ipuçlarıyla tutarsızlıkları raporlar. İpucu olmayan fonksiyon mypy için varsayılan olarak denetlenmez; <code>--strict</code> bunu değiştirir. Sık karşılaşılan bayraklar:</p>
<div class="tbl-wrap"><table><tr><th>Bayrak / ayar</th><th>Ne denetler</th><th>Tipik hata</th></tr><tr><td>disallow_untyped_defs</td><td>Her fonksiyon ipuçlu olmalı</td><td>Function is missing a type annotation</td></tr><tr><td>no_implicit_optional</td><td>Varsayılan None ise tip Optional olmalı</td><td>Incompatible default for argument</td></tr><tr><td>warn_return_any</td><td>Any döndüren fonksiyon uyarır</td><td>Returning Any from function</td></tr><tr><td>strict_equality</td><td>Asla eşit olamayacak türleri karşılaştırma</td><td>Non-overlapping equality check</td></tr><tr><td>warn_unused_ignores</td><td>Gereksiz # type: ignore</td><td>Unused "type: ignore" comment</td></tr></table></div>
<p><code>pyproject.toml</code> içinde <code>[tool.mypy] strict = true</code> ile hepsi açılır. Pyright (VS Code\'daki Pylance) daha katı çıkarım yapar ve daha hızlıdır; ekipler genelde birini CI\'da zorunlu kılar. Dar daraltma (narrowing) kavramını öğren: <code>if x is None: return</code> satırından sonra denetleyici <code>x</code>\'in artık None olmadığını bilir; <code>isinstance</code>, <code>in</code>, <code>assert</code> ve <code>match</code> de daraltır.</p>
<pre class="py">from typing import TypeGuard, assert_never, Literal

Durum = Literal['acik', 'kapali', 'askida']

def pozitif_floatlar(v: list[object]) -&gt; TypeGuard[list[float]]:
    return all(isinstance(x, (int, float)) and x &gt; 0 for x in v)

def etiket(d: Durum) -&gt; str:
    match d:
        case 'acik': return 'Aktif'
        case 'kapali': return 'Kapalı'
        case 'askida': return 'Askıda'
        case _: assert_never(d)      # yeni değer eklenirse mypy uyarır

veri: list[object] = [1.5, 2, 3.0]
if pozitif_floatlar(veri):
    print(sum(veri))                 # artık list[float]
print(etiket('askida'))
</pre>
<div class="tip"><b>Aşamalı sıkılaştırma</b>Büyük eski kod tabanında strict\'i bir anda açma. Önce <code>check_untyped_defs</code>, sonra modül modül <code>disallow_untyped_defs</code>; her adımda hata sayısını CI\'da ölç. Şu an geçmeyen dosyaları <code>[[tool.mypy.overrides]]</code> ile geçici muaf tut.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Tipleri sözleşme olarak kullanmak</h3>
<p>Olgun ekiplerde tip ipuçları belgelemeden çok tasarım aracıdır. Bir fonksiyon <code>dict[str, Any]</code> alıyorsa bu genelde "şeklini bilmiyorum" itirafıdır; TypedDict ya da dataclass\'a çevirmek sorunun yarısını çözer. <code>Optional</code> parametre çokluğu fonksiyonun iki iş yaptığına işarettir. <code>NewType</code> ile kimlikleri ayırmak, Ilgaz Bank örneğindeki gibi "müşteri no yerine hesap no gönderme" hatasını tamamen ortadan kaldırır.</p>
<p>Variance (değişinti) konusunu bil: <code>list[int]</code>, <code>list[float]</code>\'ın alt türü <b>değildir</b> (liste değişebilir, invariant); ama <code>Sequence[int]</code>, <code>Sequence[float]</code> yerine geçer (salt okunur, covariant). Parametre tiplerinde olabildiğince genel soyut tip (<code>Sequence</code>, <code>Mapping</code>, <code>Iterable</code>), dönüşte somut tip (<code>list</code>, <code>dict</code>) kullanmak bu sorunların çoğunu önler.</p>
<p>Çalışma zamanı doğrulaması gerekiyorsa pydantic, TypedDict\'in doğal devamıdır: aynı alan tanımı hem denetleyiciye hem çalışma zamanına hizmet eder. Ancak iç fonksiyonlarda doğrulama tekrarı maliyetlidir; doğrulamayı sınırda (API girişi, dosya okuma) yap, içeride tiplere güven.</p>
</section>`,
    ex: [
      { t: 'code', id: 'tip-sistemi-ileri-1',
        q: '<p>Generic <code>Kuyruk</code> sınıfı yaz: <code>class Kuyruk(Generic[T])</code>. Metotlar: <code>ekle(self, x: T) -> None</code>, <code>al(self) -> T</code> (en eski elemanı çıkarır; boşsa <code>IndexError</code>), <code>__len__(self) -> int</code>. Tip ipuçları zorunlu: testler <code>get_type_hints</code> ile <code>ekle</code>\'nin <code>x</code> parametresinin <code>T</code>, <code>al</code>\'ın dönüşünün <code>T</code> olduğunu kontrol edecek.</p>',
        start: 'from typing import TypeVar, Generic, get_type_hints\nfrom collections import deque\n\nT = TypeVar(\'T\')\n\nclass Kuyruk(Generic[T]):\n    pass\n',
        sol: 'from typing import TypeVar, Generic, get_type_hints\nfrom collections import deque\n\nT = TypeVar(\'T\')\n\nclass Kuyruk(Generic[T]):\n    def __init__(self) -> None:\n        self._d: deque[T] = deque()\n\n    def ekle(self, x: T) -> None:\n        self._d.append(x)\n\n    def al(self) -> T:\n        if not self._d:\n            raise IndexError(\'kuyruk boş\')\n        return self._d.popleft()\n\n    def __len__(self) -> int:\n        return len(self._d)\n',
        tests: 'k: Kuyruk[str] = Kuyruk()\nk.ekle(\'a\'); k.ekle(\'b\')\nassert len(k) == 2, "__len__ eleman sayısı"\nassert k.al() == \'a\' and k.al() == \'b\', "al FIFO sırasıyla vermeli"\ntry:\n    k.al()\n    assert False, "Boş kuyrukta IndexError"\nexcept IndexError:\n    pass\nh = get_type_hints(Kuyruk.ekle)\nassert h.get(\'x\') is T, "ekle parametresi T tipinde olmalı"\nassert get_type_hints(Kuyruk.al).get(\'return\') is T, "al dönüşü T olmalı"\nassert get_type_hints(Kuyruk.__len__).get(\'return\') is int, "__len__ dönüşü int olmalı"\nfrom typing import Generic as _G\nassert _G in Kuyruk.__mro__, "Kuyruk Generic[T] türetmeli"\n',
        hints: ['collections.deque ile popleft O(1).', 'Her metoda parametre ve dönüş ipucu yaz; T değişkenini kullan.'],
        why: 'Generic[T] sınıfın içindeki T\'yi dışarıdan verilen türe bağlar; Kuyruk[str] için denetleyici al() sonucunun str olduğunu bilir.' },
      { t: 'mc', q: '<code>TypedDict</code> ile tanımlanmış bir sözlüğe yanlış tipte değer atarsan çalışma zamanında ne olur?',
        o: ['TypeError fırlatılır', 'Hiçbir şey olmaz; yalnızca statik denetleyici uyarır', 'Değer otomatik dönüştürülür', 'KeyError fırlatılır'],
        a: 1, why: 'TypedDict çalışma zamanında sıradan dict\'tir; tip bilgisi yalnızca mypy/pyright içindir. Gerçek doğrulama için pydantic ya da elle kontrol gerekir.' },
      { t: 'code', id: 'tip-sistemi-ileri-3',
        q: '<p><code>MusteriNo = NewType(\'MusteriNo\', int)</code> ve <code>HesapNo = NewType(\'HesapNo\', int)</code> tanımla. <code>class Hesap(TypedDict)</code>: <code>no: HesapNo</code>, <code>sahip: MusteriNo</code>, <code>bakiye: float</code>. Fonksiyon <code>musteri_toplam(hesaplar: list[Hesap], m: MusteriNo) -> float</code>: m\'ye ait hesapların bakiye toplamını döndürsün. İpuçları tam olmalı (testler get_type_hints ile bakacak).</p>',
        start: 'from typing import NewType, TypedDict, get_type_hints\n\n# MusteriNo, HesapNo, Hesap, musteri_toplam\n',
        sol: 'from typing import NewType, TypedDict, get_type_hints\n\nMusteriNo = NewType(\'MusteriNo\', int)\nHesapNo = NewType(\'HesapNo\', int)\n\nclass Hesap(TypedDict):\n    no: HesapNo\n    sahip: MusteriNo\n    bakiye: float\n\ndef musteri_toplam(hesaplar: list[Hesap], m: MusteriNo) -> float:\n    return float(sum(h[\'bakiye\'] for h in hesaplar if h[\'sahip\'] == m))\n',
        tests: 'hs = [\n    {\'no\': HesapNo(1), \'sahip\': MusteriNo(10), \'bakiye\': 100.0},\n    {\'no\': HesapNo(2), \'sahip\': MusteriNo(10), \'bakiye\': 50.5},\n    {\'no\': HesapNo(3), \'sahip\': MusteriNo(11), \'bakiye\': 999.0},\n]\nassert abs(musteri_toplam(hs, MusteriNo(10)) - 150.5) < 1e-6, "Müşteri 10 toplamı 150.5"\nassert musteri_toplam(hs, MusteriNo(99)) == 0, "Hesabı olmayan müşteri 0"\nassert MusteriNo.__supertype__ is int and HesapNo.__supertype__ is int, "NewType int tabanlı olmalı"\nassert set(Hesap.__annotations__) == {\'no\', \'sahip\', \'bakiye\'}, "Hesap alanları"\nh = get_type_hints(musteri_toplam)\nassert h[\'m\'] is MusteriNo and h[\'return\'] is float, "musteri_toplam ipuçları"\nassert h[\'hesaplar\'] == list[Hesap], "hesaplar: list[Hesap] olmalı"\n',
        hints: ['NewType çağrısı bir fonksiyon gibi davranır: MusteriNo(10) int döndürür.', 'Toplamı float() ile sarmala ki boş durumda da float dönsün.'],
        why: 'NewType statik düzeyde iki int\'i ayırır; TypedDict JSON benzeri yapının şeklini belgeler. İkisi de çalışma zamanında maliyetsizdir.' },
      { t: 'code', id: 'tip-sistemi-ileri-4',
        q: '<p><code>@overload</code> ile <code>tl(x)</code> fonksiyonunu yaz: <code>float</code> alınca <code>str</code> döndürür (<code>f\'{x:,.2f} TL\'</code>), <code>list[float]</code> alınca <code>list[str]</code> döndürür (her eleman aynı biçimde). Overload imzaları + gerçek gerçekleştirme olmak üzere üç tanım olsun. Testler <code>typing.get_overloads</code> ile iki overload kaydedildiğini kontrol edecek.</p>',
        start: 'from typing import overload, get_overloads\n\n# tl overload\'ları ve gerçekleştirme\n',
        sol: 'from typing import overload, get_overloads\n\n@overload\ndef tl(x: float) -> str: ...\n@overload\ndef tl(x: list[float]) -> list[str]: ...\ndef tl(x):\n    if isinstance(x, list):\n        return [tl(v) for v in x]\n    return f\'{x:,.2f} TL\'\n',
        tests: 'assert tl(1234.5) == \'1,234.50 TL\', "float -> biçimli str"\nassert tl([1.0, 20.25]) == [\'1.00 TL\', \'20.25 TL\'], "list -> list[str]"\nassert tl([]) == [], "Boş liste boş liste"\novs = get_overloads(tl)\nassert len(ovs) == 2, "İki overload kaydedilmeli"\nfrom typing import get_type_hints\ndonusler = {get_type_hints(o)[\'return\'] for o in ovs}\nassert str in donusler and list[str] in donusler, "Overload dönüş tipleri str ve list[str]"\n',
        hints: ['Overload gövdeleri yalnızca ... olsun.', 'Gerçek gerçekleştirmede isinstance(x, list) ile ayır.'],
        why: 'Overload denetleyiciye "görünür imzaları" sunar; Python 3.11+ get_overloads ile bunlar çalışma zamanında da okunabilir. Gerçekleştirme tek ve dinamiktir.' },
      { t: 'mc', q: 'Dekoratörde <code>Callable[..., R]</code> yerine <code>ParamSpec</code> kullanmanın kazancı nedir?',
        o: ['Dekoratör daha hızlı çalışır', 'Sarmalanan fonksiyonun parametre imzası tip denetleyicide korunur', 'functools.wraps\'e gerek kalmaz', 'Dönüş tipi otomatik Any olur'],
        a: 1, why: 'ParamSpec parametre listesini taşır; böylece dekore edilmiş fonksiyona yanlış argüman verildiğinde mypy/pyright yakalar. Çalışma zamanı hızıyla ilgisi yok; wraps hâlâ __name__ ve imza için gerekir.' },
      { t: 'code', id: 'tip-sistemi-ileri-6',
        q: '<p><code>ParamSpec</code> ve <code>TypeVar</code> ile <code>sayac</code> dekoratörü yaz: <code>def sayac(fn: Callable[P, R]) -> Callable[P, R]</code>. Dekore edilen fonksiyon her çağrıldığında <code>sarmal.cagri</code> sayacı artsın; <code>functools.wraps</code> kullan. Sonra <code>@sayac</code> ile <code>komisyon(tutar: float, oran: float = 0.01) -> float</code> fonksiyonunu tanımla (<code>round(tutar * oran, 2)</code>). Testler <code>inspect.signature</code> ile imzanın korunduğunu kontrol edecek.</p>',
        start: 'from typing import Callable, ParamSpec, TypeVar\nfrom functools import wraps\nimport inspect\n\nP = ParamSpec(\'P\')\nR = TypeVar(\'R\')\n\n# sayac ve komisyon\n',
        sol: 'from typing import Callable, ParamSpec, TypeVar\nfrom functools import wraps\nimport inspect\n\nP = ParamSpec(\'P\')\nR = TypeVar(\'R\')\n\ndef sayac(fn: Callable[P, R]) -> Callable[P, R]:\n    @wraps(fn)\n    def sarmal(*args: P.args, **kwargs: P.kwargs) -> R:\n        sarmal.cagri += 1\n        return fn(*args, **kwargs)\n    sarmal.cagri = 0\n    return sarmal\n\n@sayac\ndef komisyon(tutar: float, oran: float = 0.01) -> float:\n    return round(tutar * oran, 2)\n',
        tests: 'assert komisyon(1000) == 10.0 and komisyon(200, oran=0.05) == 10.0, "komisyon hesabı"\nassert komisyon.cagri == 2, "Sayaç her çağrıda artmalı"\nassert komisyon.__name__ == \'komisyon\', "wraps ile ad korunmalı"\nsig = inspect.signature(komisyon)\nassert list(sig.parameters) == [\'tutar\', \'oran\'], "İmza (tutar, oran) olarak korunmalı"\nassert sig.parameters[\'oran\'].default == 0.01, "Varsayılan değer korunmalı"\nassert sig.return_annotation is float, "Dönüş ipucu korunmalı"\n',
        hints: ['Sayaç için fonksiyon özniteliği: sarmal.cagri = 0, içeride sarmal.cagri += 1.', 'wraps(fn) __wrapped__ ekler; inspect.signature bunu izler.'],
        why: 'ParamSpec statik imzayı, wraps ise çalışma zamanı imzasını korur; ikisi birlikte dekoratörü "görünmez" yapar.' },
      { t: 'code', id: 'tip-sistemi-ileri-7',
        q: '<p>Çalışma zamanı tip denetleyicisi yaz: <code>tip_kontrol(fn)</code> dekoratörü, <code>typing.get_type_hints(fn)</code> ve <code>inspect.signature(fn).bind(*args, **kwargs)</code> ile her argümanın ipucundaki türe <code>isinstance</code> uymasını kontrol etsin; uymuyorsa <code>TypeError</code> (mesajda parametre adı geçsin). İpucu olmayan parametreler atlanır; yalnızca basit sınıf ipuçları (int, str, float...) desteklenir. Sonra <code>@tip_kontrol</code> ile <code>kredi_skoru(musteri: str, gelir: float, gecikme: int) -> int</code> fonksiyonunu tanımla: <code>int(min(900, gelir / 100 - gecikme * 50))</code>.</p>',
        start: 'import inspect\nfrom typing import get_type_hints\nfrom functools import wraps\n\ndef tip_kontrol(fn):\n    pass\n\n# kredi_skoru\n',
        sol: 'import inspect\nfrom typing import get_type_hints\nfrom functools import wraps\n\ndef tip_kontrol(fn):\n    hints = get_type_hints(fn)\n    sig = inspect.signature(fn)\n\n    @wraps(fn)\n    def sarmal(*args, **kwargs):\n        bagli = sig.bind(*args, **kwargs)\n        for ad, deger in bagli.arguments.items():\n            tip = hints.get(ad)\n            if isinstance(tip, type) and not isinstance(deger, tip):\n                raise TypeError(f\'{ad}: {tip.__name__} bekleniyor, {type(deger).__name__} geldi\')\n        return fn(*args, **kwargs)\n    return sarmal\n\n@tip_kontrol\ndef kredi_skoru(musteri: str, gelir: float, gecikme: int) -> int:\n    return int(min(900, gelir / 100 - gecikme * 50))\n',
        tests: 'assert kredi_skoru(\'Ayşe\', 50000.0, 1) == 450, "Skor hesabı"\nassert kredi_skoru(\'Ali\', 1e6, gecikme=0) == 900, "Üst sınır 900"\ntry:\n    kredi_skoru(\'Ali\', \'çok\', 0)\n    assert False, "gelir str verilince TypeError"\nexcept TypeError as e:\n    assert \'gelir\' in str(e), "Hata mesajında parametre adı olmalı"\ntry:\n    kredi_skoru(123, 1000.0, 0)\n    assert False, "musteri int verilince TypeError"\nexcept TypeError:\n    pass\nassert kredi_skoru.__name__ == \'kredi_skoru\', "wraps kullanılmalı"\n',
        hints: ['sig.bind(*args, **kwargs).arguments, parametre adı -> değer sözlüğü verir.', 'hints[\'return\'] de sözlükte; parametre adlarıyla eşleştiğinden karışmaz ama yalnızca arguments üzerinde dön.'],
        why: 'get_type_hints ipuçlarını gerçek sınıflara çözer, signature.bind ise konumsal/anahtarlı argümanları adlara eşler. Bu iki araç, pydantic benzeri kütüphanelerin temelidir.' },
      { t: 'mc', q: 'Aşağıdakilerden hangisi mypy için bir daraltma (narrowing) ifadesi DEĞİLDİR?',
        o: ['if x is None: return', 'isinstance(x, str)', 'print(x)', 'match x: case int(): ...'],
        a: 2, why: 'print çağrısı x\'in tipi hakkında bilgi vermez. None kontrolü, isinstance ve match desenleri denetleyicinin sonraki satırlarda tipi daraltmasını sağlar.' }
    ],
    faq: [
      { q: 'Python 3.12 sözdizimi (def f[T]) ile TypeVar aynı mı?', a: 'Aynı kavram, daha kısa yazım. Yeni sözdizimi değişkeni fonksiyona/sınıfa özel tanımlar ve variance\'ı otomatik çıkarır. Eski kod tabanları ve 3.11 altı projeler için TypeVar bilmek gerekir.' },
      { q: 'Any ile object arasındaki fark?', a: 'Any denetimi kapatır: her şey yapılabilir. object en genel türdür ama metot çağırmak için önce daraltman gerekir. Bilinmeyen girdi için object + isinstance daha güvenlidir.' },
      { q: 'mypy mi pyright mı?', a: 'İkisi de standart uyumlu. Pyright daha hızlı ve katı çıkarım yapar, VS Code ile bütünleşiktir; mypy eklenti ekosistemi (django-stubs vb.) ile daha yaygındır. Ekibin seçtiğini CI\'da strict ile çalıştır.' },
      { q: 'Tip ipuçları performansı etkiler mi?', a: 'İpuçları modül yüklenirken bir kez değerlendirilir; from __future__ import annotations ile string olarak ertelenir. Çalışma zamanı hızına etkisi yok denecek kadar azdır.' }
    ],
    mistakes: [
      { bad: 'def bul(ad: str, varsayilan: str = None) -> str: ...', good: 'def bul(ad: str, varsayilan: str | None = None) -> str | None: ...', why: 'Varsayılan None ise tip Optional olmalı; strict mod "implicit Optional" hatası verir.' },
      { bad: 'def ilk(xs: list[Any]) -> Any:\n    return xs[0]', good: 'def ilk[T](xs: list[T]) -> T:\n    return xs[0]', why: 'Any bilgiyi yutar; çağıran taraf dönüşün tipini kaybeder. TypeVar girdi-çıktı ilişkisini korur.' },
      { bad: 'def topla(xs: list[float]) -> float: ...\ntopla([1, 2, 3])  # list[int] -> hata', good: 'from collections.abc import Sequence\ndef topla(xs: Sequence[float]) -> float: ...', why: 'list invariant\'tır: list[int], list[float] yerine geçmez. Parametrede Sequence/Iterable gibi salt okunur soyut tip kullan.' },
      { bad: 'x: Islem = json.loads(metin)  # doğrulandı sanmak', good: 'ham = json.loads(metin)\nif not isinstance(ham.get(\'tutar\'), (int, float)):\n    raise ValueError(\'tutar sayı olmalı\')\nx: Islem = ham', why: 'TypedDict çalışma zamanında doğrulama yapmaz; dış veri sınırda elle ya da pydantic ile doğrulanmalı.' }
    ]
  },
  {
    id: 'json-csv', lv: 'orta', mod: 'Standart Kütüphane', min: 30,
    title: 'JSON ve CSV: veri alışverişinin iki ortak dili',
    sum: 'json ile dumps/loads, Türkçe karakter ve tarih gibi özel tipleri yönetir; csv ile reader/DictReader/DictWriter kullanır; iç içe veriyi düz tabloya çevirirsin.',
    goals: [
      'json.dumps/loads ve dump/load ile Python nesnelerini JSON\'a çevirip geri okuyabilirim.',
      'ensure_ascii, indent, sort_keys ve default parametrelerini doğru kullanabilirim.',
      'csv.reader/DictReader ile CSV okuyup DictWriter ile yazabilirim.',
      'io.StringIO ile dosya yazmadan CSV/JSON metinleriyle çalışabilirim.',
      'İç içe JSON verisini düz satırlara (CSV) çevirebilirim.'
    ],
    body: `
<h2>Neden önemli?</h2>
<p>Anadolu Market'in sipariş API'si JSON döner; muhasebe ekibi ise Excel'de açacağı CSV ister. Ilgaz Bank'ın eski sistemi CSV üretir, yeni mikroservisler JSON konuşur. Bir veri analisti ya da geliştirici olarak işinin önemli bir kısmı bu iki biçim arasında güvenle dönüşüm yapmaktır. İkisi de "düz metin" olduğu için basit görünür; ama Türkçe karakter, tarih, ondalık sayı ve iç içe yapılar en çok hatanın çıktığı yerlerdir.</p>

<h2>JSON (JavaScript Object Notation)</h2>
<p>JSON'da altı tip vardır: nesne (object, Python'da dict), dizi (array, list), metin (str), sayı (int/float), boolean (true/false) ve null (None). Demet, küme, tarih ve Decimal gibi tipler JSON'da <b>yoktur</b>; onları sen dönüştürürsün.</p>
<div class="tbl-wrap"><table>
<tr><th>Python</th><th>JSON</th><th>Geri dönüşte</th></tr>
<tr><td>dict</td><td>object { }</td><td>dict</td></tr>
<tr><td>list, tuple</td><td>array [ ]</td><td>list (demet listeye döner!)</td></tr>
<tr><td>str</td><td>string</td><td>str</td></tr>
<tr><td>int, float</td><td>number</td><td>int / float</td></tr>
<tr><td>True / False / None</td><td>true / false / null</td><td>True / False / None</td></tr>
<tr><td>datetime, Decimal, set, dataclass</td><td>desteklenmez</td><td>default= ile çevir</td></tr>
</table></div>

<h3>dumps ve loads</h3>
<p><code>dumps</code> (dump string) nesneyi JSON metnine, <code>loads</code> metni nesneye çevirir. Dosyayla çalışırken <code>dump(obj, f)</code> ve <code>load(f)</code> kullanılır.</p>
<pre class="py">import json

siparis = {
    "no": "S-1001", "musteri": "Ayşe Yılmaz", "sehir": "İzmir",
    "kalemler": [{"urun": "laptop", "adet": 1, "fiyat": 25999.9}, {"urun": "mouse", "adet": 2, "fiyat": 349.0}],
    "odendi": True, "kupon": None,
}
print(json.dumps(siparis))                      # Türkçe harfler \\u ile kaçırıldı
print(json.dumps(siparis, ensure_ascii=False))  # okunur Türkçe
print(json.dumps({"b": 1, "a": 2}, indent=2, sort_keys=True))

geri = json.loads('{"no": "S-1", "tutar": 120.5, "etiketler": ["hızlı", "kargo"], "iptal": null}')
print(geri["tutar"] + 1, geri["iptal"], type(geri["etiketler"]).__name__)</pre>
<div class="tip"><b>ensure_ascii=False</b>Varsayılan <code>ensure_ascii=True</code>, "İzmir"i <code>"\\u0130zmir"</code> yapar. Geçerli JSON'dur ama insan okuyamaz ve dosya büyür. Türkçe veri yazarken hep <code>ensure_ascii=False</code> ve dosyayı <code>encoding="utf-8"</code> ile aç.</div>

<h3>default: desteklenmeyen tipleri çevirmek</h3>
<p><code>json.dumps</code> tanımadığı bir nesneyle karşılaşınca <code>TypeError</code> verir. <code>default=fonksiyon</code> parametresi bu durumda çağrılır; sen tipi JSON'un bildiği bir şeye çevirirsin.</p>
<pre class="py">import json
from datetime import date, datetime
from decimal import Decimal
from dataclasses import dataclass, asdict

@dataclass
class Islem:
    hesap: str
    tutar: Decimal
    tarih: date

def json_uyumlu(o):
    if isinstance(o, (date, datetime)):
        return o.isoformat()
    if isinstance(o, Decimal):
        return str(o)            # para için float'a çevirme, hassasiyet kaybolur
    if isinstance(o, set):
        return sorted(o)
    if hasattr(o, "__dataclass_fields__"):
        return asdict(o)
    raise TypeError(f"JSON'a çevrilemiyor: {type(o).__name__}")

kayit = {"islem": Islem("TR01", Decimal("1250.75"), date(2026, 3, 15)), "etiketler": {"eft", "acil"}}
print(json.dumps(kayit, default=json_uyumlu, ensure_ascii=False, indent=2))

try:
    json.dumps({"t": date.today()})
except TypeError as e:
    print("default olmadan:", e)</pre>

<h3>Okurken hata yakalama</h3>
<pre class="py">import json

ham = ['{"a": 1}', "{'a': 1}", '{"a": 1,}', '']
for h in ham:
    try:
        print(repr(h), "→", json.loads(h))
    except json.JSONDecodeError as e:
        print(repr(h), "→ HATA:", e.msg, "konum", e.pos)</pre>
<div class="warn"><b>JSON Python değildir</b>Tek tırnak, sondaki virgül, yorum satırı ve <code>True</code> (büyük T) JSON'da geçersizdir. Elle JSON yazma; <code>json.dumps</code> ürettirsin.</div>

<h2>CSV (Comma-Separated Values)</h2>
<p>CSV, her satırın bir kayıt ve alanların virgülle (Türkiye'de Excel çoğu zaman noktalı virgülle) ayrıldığı düz metindir. <code>"İstanbul, Avrupa"</code> gibi virgül içeren değer tırnak içine alınır; bu yüzden <code>split(",")</code> ile ayrıştırmak <b>yanlıştır</b>, <code>csv</code> modülü tırnak kurallarını bilir.</p>
<p>Derste dosya yerine <code>io.StringIO</code> kullanıyoruz: bellekte bir "dosya gibi" nesne. Gerçek dosyada tek fark <code>open("x.csv", newline="", encoding="utf-8")</code> yazmaktır.</p>
<pre class="py">import csv, io

ham = """no,musteri,sehir,tutar
S-1,Ayşe Yılmaz,İzmir,1250.50
S-2,"Mehmet, Ali",Ankara,80
S-3,Zeynep Kaya,"İstanbul, Avrupa",349.90
"""
# reader: liste listesi
for satir in csv.reader(io.StringIO(ham)):
    print(satir)

# DictReader: başlıkları anahtar yapar
toplam = 0.0
for kayit in csv.DictReader(io.StringIO(ham)):
    toplam += float(kayit["tutar"])    # CSV'de her şey metindir!
    print(kayit["musteri"], "-", kayit["sehir"])
print("Toplam:", round(toplam, 2))

print("Yanlış yol:", 'S-2,"Mehmet, Ali",Ankara,80'.split(","))</pre>

<h3>Yazma: writer ve DictWriter</h3>
<pre class="py">import csv, io

kayitlar = [
    {"hesap": "TR01", "tutar": 1250.5, "aciklama": "Kira, Mart"},
    {"hesap": "TR02", "tutar": -80, "aciklama": "Kart ödemesi"},
]
cikti = io.StringIO()
yazici = csv.DictWriter(cikti, fieldnames=["hesap", "tutar", "aciklama"], delimiter=";")
yazici.writeheader()
yazici.writerows(kayitlar)
print(cikti.getvalue())

# Noktalı virgüllü Türkçe Excel CSV'sini geri okuma
for k in csv.DictReader(io.StringIO(cikti.getvalue()), delimiter=";"):
    print(k)

# Satır listesi için writer
c2 = io.StringIO()
w = csv.writer(c2)
w.writerow(["ad", "not"])
w.writerow(["Ali", 'Dedi ki: "tamam"'])      # tırnak otomatik kaçırılır
print(c2.getvalue())</pre>
<div class="note"><b>newline="" neden?</b>Gerçek dosya açarken <code>open(..., newline="")</code> ver; aksi halde Windows'ta her kayıt arasına boş satır girer. Excel'in Türkçe ayarları için <code>delimiter=";"</code> ve ondalık virgül gerekebilir; dosya başına BOM için <code>encoding="utf-8-sig"</code> kullanılır.</div>

<h2>İç içe veriyi düzleştirme</h2>
<p>JSON doğal olarak iç içedir (sipariş → kalemler → ürün). CSV ise düzdür. Dönüşüm için iki yaygın strateji var: (1) iç sözlükleri <code>"adres.sehir"</code> gibi noktalı anahtarlara aç; (2) listeleri her eleman bir satır olacak şekilde "patlat" (explode). İkisini birlikte gösterelim.</p>
<pre class="py">import csv, io, json

ham = json.loads("""[
  {"no": "S-1", "musteri": {"ad": "Ayşe", "sehir": "İzmir"},
   "kalemler": [{"urun": "laptop", "adet": 1}, {"urun": "mouse", "adet": 2}]},
  {"no": "S-2", "musteri": {"ad": "Ali", "sehir": "Ankara"},
   "kalemler": [{"urun": "çanta", "adet": 1}]}
]""")

def duzlestir(d, onek=""):
    """İç içe sözlüğü noktalı anahtarlarla tek seviyeye indir (listeleri olduğu gibi bırak)."""
    duz = {}
    for k, v in d.items():
        ad = f"{onek}{k}"
        if isinstance(v, dict):
            duz.update(duzlestir(v, ad + "."))
        else:
            duz[ad] = v
    return duz

satirlar = []
for s in ham:
    temel = duzlestir({k: v for k, v in s.items() if k != "kalemler"})
    for kalem in s["kalemler"]:            # her kalem ayrı satır
        satirlar.append({**temel, **kalem})

print(satirlar[0])
cikti = io.StringIO()
w = csv.DictWriter(cikti, fieldnames=list(satirlar[0].keys()))
w.writeheader(); w.writerows(satirlar)
print(cikti.getvalue())</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Büyük dosyalar, şema ve güvenlik</h3>
<p><code>json.load</code> tüm dosyayı belleğe alır; yüz megabaytlık bir dışa aktarımda bu sorun olabilir. Çözüm genellikle <b>JSON Lines</b> (her satırda bir JSON nesnesi, .jsonl) biçimidir: satır satır okur, her satıra <code>json.loads</code> uygularsın; log sistemleri ve veri hatları bu biçimi sever. CSV'de ise <code>csv.reader</code> zaten tembeldir; dosyayı satır satır tüketir.</p>
<p>Şema (schema): CSV'de her alan metindir; "tutar" sütununun sayı olduğunu sen bilirsin. Üretim kodunda okuduğun her satırı bir <code>dataclass</code>'a ya da <code>pydantic</code> modeline geçirip tip dönüşümünü tek yerde yapmak, hataları (boş hücre, "1.250,50" gibi Türk biçimi) erkenden yakalar. Para için <code>float</code> yerine <code>Decimal</code> kullan; JSON'a yazarken <code>str</code> olarak çık.</p>
<p>Güvenlik: <code>json.loads</code> güvenlidir (kod çalıştırmaz) ama <code>pickle</code> ve <code>eval</code> değildir; dış kaynaktan veri alırken asla kullanma. CSV'de "CSV enjeksiyonu" diye bir şey var: <code>=HYPERLINK(...)</code> ile başlayan hücre Excel'de formül olarak çalışır. Kullanıcı girdisini CSV'ye yazarken <code>=</code>, <code>+</code>, <code>-</code>, <code>@</code> ile başlayan hücrelerin önüne tek tırnak koymak yaygın önlemdir. Son olarak, iki sistem arasında veri taşırken <code>sort_keys=True</code> ve sabit <code>indent</code> ile üretilen JSON, git farklarını okunur tutar.</p>
</section>
`,
    ex: [
      { t: 'mc', q: '<code>json.loads(json.dumps((1, 2)))</code> ifadesinin sonucu nedir?',
        o: ['(1, 2)', '[1, 2]', '"(1, 2)"', 'TypeError'], a: 1,
        why: 'JSON\'da demet yoktur; dumps demeti diziye çevirir, loads diziyi liste olarak okur. Hata vermez, sessizce tip değişir.' },
      { t: 'mc', q: 'Türkçe karakterli veriyi insanların okuyacağı JSON dosyasına yazarken hangi parametre gerekir?',
        o: ['indent=4', 'sort_keys=True', 'ensure_ascii=False', 'default=str'], a: 2,
        why: 'ensure_ascii=False Türkçe harfleri \\u kaçışı yerine olduğu gibi yazar. indent biçimlendirir, sort_keys sıralar, default desteklenmeyen tipleri çevirir.' },
      { t: 'code', id: 'json-csv-1',
        q: '<p>Anadolu Market CSV dışa aktarımından toplam ciroyu hesaplayan <code>sehir_cirosu(csv_metni: str) -> dict</code> fonksiyonunu yaz. CSV başlıkları <code>no,sehir,tutar</code>; alanlar virgülle ayrılmış, bazı değerler tırnak içinde olabilir. Şehir bazında tutar toplamını (float, 2 basamağa yuvarlanmış) sözlük olarak döndür. <code>csv.DictReader</code> ve <code>io.StringIO</code> kullan.</p>',
        start: 'import csv, io\n\ndef sehir_cirosu(csv_metni):\n    # buraya yaz\n    pass\n',
        sol: 'import csv, io\n\ndef sehir_cirosu(csv_metni):\n    toplam = {}\n    for k in csv.DictReader(io.StringIO(csv_metni)):\n        toplam[k["sehir"]] = toplam.get(k["sehir"], 0.0) + float(k["tutar"])\n    return {s: round(t, 2) for s, t in toplam.items()}\n',
        tests: 'ham = "no,sehir,tutar\\nS-1,İzmir,100.5\\nS-2,\\"İstanbul, Avrupa\\",50\\nS-3,İzmir,19.5\\n"\nr = sehir_cirosu(ham)\nassert r == {"İzmir": 120.0, "İstanbul, Avrupa": 50.0}, "Şehir ciroları yanlış: " + str(r)\nassert sehir_cirosu("no,sehir,tutar\\n") == {}, "Yalnızca başlık varsa boş sözlük"\n',
        hints: ['csv.DictReader(io.StringIO(metin)) her satırı sözlük olarak verir.', 'CSV değerleri metindir; float(k["tutar"]) ile çevir.'],
        why: 'DictReader tırnaklı alanları doğru ayrıştırır; dict.get ile toplama yapılır; sonunda yuvarlanır.' },
      { t: 'code', id: 'json-csv-2',
        q: '<p>Ilgaz Bank işlem kayıtlarını JSON\'a çeviren <code>islem_json(islemler: list[dict]) -> str</code> fonksiyonunu yaz. Her işlem sözlüğünde <code>tarih</code> alanı <code>datetime.date</code>, <code>tutar</code> alanı <code>Decimal</code> olabilir. Tarihi ISO metnine, Decimal\'i <code>str</code>\'ye çeviren bir <code>default</code> fonksiyonu kullan; çıktıda Türkçe karakterler kaçırılmasın (<code>ensure_ascii=False</code>) ve anahtarlar sıralı olsun (<code>sort_keys=True</code>). Girinti kullanma.</p>',
        start: 'import json\nfrom datetime import date\nfrom decimal import Decimal\n\ndef islem_json(islemler):\n    # buraya yaz\n    pass\n',
        sol: 'import json\nfrom datetime import date\nfrom decimal import Decimal\n\ndef _cevir(o):\n    if isinstance(o, date):\n        return o.isoformat()\n    if isinstance(o, Decimal):\n        return str(o)\n    raise TypeError(type(o).__name__)\n\ndef islem_json(islemler):\n    return json.dumps(islemler, default=_cevir, ensure_ascii=False, sort_keys=True)\n',
        tests: 'from datetime import date\nfrom decimal import Decimal\nimport json\ns = islem_json([{"tutar": Decimal("1250.75"), "hesap": "TR01", "aciklama": "Kira Şubat", "tarih": date(2026, 2, 1)}])\nassert s == \'[{"aciklama": "Kira Şubat", "hesap": "TR01", "tarih": "2026-02-01", "tutar": "1250.75"}]\', "JSON metni beklenenden farklı: " + s\nassert "\\\\u015e" not in s, "Türkçe karakter kaçırılmamalı (ensure_ascii=False)"\nassert json.loads(islem_json([])) == [], "Boş liste için [] dönmeli"\n',
        hints: ['default parametresine isinstance ile tip ayıran bir fonksiyon ver.', 'json.dumps(..., default=f, ensure_ascii=False, sort_keys=True).'],
        why: 'default fonksiyonu yalnızca JSON\'un tanımadığı tiplerde çağrılır; sort_keys deterministik çıktı, ensure_ascii=False okunur Türkçe sağlar.' },
      { t: 'code', id: 'json-csv-3',
        q: '<p>Muhasebe için CSV üreten <code>csv_uret(kayitlar: list[dict], alanlar: list[str]) -> str</code> fonksiyonunu yaz. <code>csv.DictWriter</code> ile noktalı virgül (<code>;</code>) ayırıcılı, başlık satırlı CSV metni döndür. Satır sonu olarak <code>"\\n"</code> kullan (<code>lineterminator="\\n"</code>). Kayıtlarda <code>alanlar</code> dışındaki anahtarlar yok sayılsın (<code>extrasaction="ignore"</code>).</p>',
        start: 'import csv, io\n\ndef csv_uret(kayitlar, alanlar):\n    # buraya yaz\n    pass\n',
        sol: 'import csv, io\n\ndef csv_uret(kayitlar, alanlar):\n    cikti = io.StringIO()\n    w = csv.DictWriter(cikti, fieldnames=alanlar, delimiter=";", lineterminator="\\n", extrasaction="ignore")\n    w.writeheader()\n    w.writerows(kayitlar)\n    return cikti.getvalue()\n',
        tests: 'r = csv_uret([{"hesap": "TR01", "tutar": 100, "gizli": 1}, {"hesap": "TR02", "tutar": "a;b"}], ["hesap", "tutar"])\nassert r == \'hesap;tutar\\nTR01;100\\nTR02;"a;b"\\n\', "CSV çıktısı beklenenden farklı: " + repr(r)\nassert csv_uret([], ["x"]) == "x\\n", "Kayıt yoksa yalnızca başlık"\n',
        hints: ['io.StringIO() üzerine DictWriter kur, writeheader ve writerows çağır.', 'delimiter=";", lineterminator="\\n", extrasaction="ignore" parametrelerini unutma.'],
        why: 'DictWriter başlığı ve satırları tırnak kurallarına uygun yazar; ayırıcı içeren değer otomatik tırnaklanır.' },
      { t: 'code', id: 'json-csv-4',
        q: '<p>İç içe sözlüğü düzleştiren <code>duzlestir(d: dict, onek: str = "") -> dict</code> fonksiyonunu yaz. İç sözlüklerin anahtarları noktayla birleşsin: <code>{"a": {"b": 1, "c": {"d": 2}}, "e": 3}</code> → <code>{"a.b": 1, "a.c.d": 2, "e": 3}</code>. Listeler ve diğer değerler olduğu gibi kalsın. Özyineleme (recursion) kullan.</p>',
        start: 'def duzlestir(d, onek=""):\n    # buraya yaz\n    pass\n',
        sol: 'def duzlestir(d, onek=""):\n    duz = {}\n    for k, v in d.items():\n        ad = f"{onek}{k}"\n        if isinstance(v, dict):\n            duz.update(duzlestir(v, ad + "."))\n        else:\n            duz[ad] = v\n    return duz\n',
        tests: 'assert duzlestir({"a": {"b": 1, "c": {"d": 2}}, "e": 3}) == {"a.b": 1, "a.c.d": 2, "e": 3}, "Düzleştirme yanlış"\nassert duzlestir({"musteri": {"ad": "Ayşe", "etiket": [1, 2]}}) == {"musteri.ad": "Ayşe", "musteri.etiket": [1, 2]}, "Listeler olduğu gibi kalmalı"\nassert duzlestir({}) == {}, "Boş sözlük boş dönmeli"\nassert duzlestir({"a": {}}) == {}, "Boş iç sözlük hiç anahtar üretmemeli"\n',
        hints: ['Her değer için isinstance(v, dict) kontrol et.', 'İç sözlük için duzlestir(v, ad + ".") sonucunu update ile birleştir.'],
        why: 'Özyineleme iç sözlükleri açar; onek parametresi yolu taşır; dict olmayan değerler olduğu gibi yazılır.' },
      { t: 'code', id: 'json-csv-5',
        q: '<p>Güvenli JSON okuma: <code>guvenli_yukle(metin: str, varsayilan=None)</code> fonksiyonu metni <code>json.loads</code> ile çözsün; metin geçersiz JSON ise (<code>json.JSONDecodeError</code>) ya da sonuç bir <code>dict</code> değilse <code>varsayilan</code> değerini döndürsün.</p>',
        start: 'import json\n\ndef guvenli_yukle(metin, varsayilan=None):\n    # buraya yaz\n    pass\n',
        sol: 'import json\n\ndef guvenli_yukle(metin, varsayilan=None):\n    try:\n        veri = json.loads(metin)\n    except json.JSONDecodeError:\n        return varsayilan\n    return veri if isinstance(veri, dict) else varsayilan\n',
        tests: 'assert guvenli_yukle(\'{"a": 1}\') == {"a": 1}, "Geçerli sözlük döndürülmeli"\nassert guvenli_yukle("{\'a\': 1}") is None, "Tek tırnaklı JSON geçersiz, None dönmeli"\nassert guvenli_yukle("[1, 2]", {}) == {}, "Liste dict değil, varsayılan dönmeli"\nassert guvenli_yukle("", {"bos": True}) == {"bos": True}, "Boş metin için varsayılan"\n',
        hints: ['json.JSONDecodeError yakala (ValueError alt sınıfıdır).', 'Sonucu isinstance(veri, dict) ile kontrol et.'],
        why: 'try/except çözümleme hatasını, isinstance tip kontrolünü ele alır; her iki durumda da güvenli varsayılan döner.' }
    ],
    faq: [
      { q: 'json.dump ile json.dumps farkı ne?', a: 'dumps metin (string) döndürür; dump doğrudan açık bir dosya nesnesine yazar. load/loads için de aynı ilişki geçerlidir.' },
      { q: 'CSV okurken sayılar neden metin geliyor?', a: 'CSV\'nin tip bilgisi yoktur; her hücre metindir. int()/float()/Decimal() ile kendin çevirirsin. Türk biçimli "1.250,50" için önce noktayı sil, virgülü noktaya çevir.' },
      { q: 'Neden split(",") yerine csv modülü?', a: 'Tırnak içindeki virgüller, kaçırılmış tırnaklar ve çok satırlı hücreler split ile bozulur; csv modülü RFC 4180 kurallarını uygular.' },
      { q: 'Excel CSV\'mi Türkçe karakterleri bozuk açıyor.', a: 'Dosyayı encoding="utf-8-sig" ile yaz; başa eklenen BOM Excel\'e UTF-8 olduğunu söyler. Ayrıca Türkçe Excel noktalı virgül ayırıcı bekler.' }
    ],
    mistakes: [
      { bad: 'json.loads("{\'ad\': \'Ali\'}")', good: 'json.loads(\'{"ad": "Ali"}\')', why: 'JSON yalnızca çift tırnak kabul eder; tek tırnak JSONDecodeError verir.' },
      { bad: 'satir.split(",")', good: 'next(csv.reader([satir]))', why: 'Tırnak içindeki virgüller split ile yanlış bölünür; csv modülü tırnakları anlar.' },
      { bad: 'json.dumps({"t": date.today()})', good: 'json.dumps({"t": date.today()}, default=str)', why: 'date JSON\'da yoktur; default ile çevirmezsen TypeError alırsın.' },
      { bad: 'open("rapor.csv", "w")', good: 'open("rapor.csv", "w", newline="", encoding="utf-8")', why: 'newline="" olmadan Windows\'ta boş satırlar oluşur; encoding belirtilmezse Türkçe karakter bozulabilir.' }
    ]
  },
  {}
);
})(window);
