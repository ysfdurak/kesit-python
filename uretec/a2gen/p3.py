from a2common import *

S = 'Sınıflar'
F = 'Fonksiyonel'
R = 'Regex'
probs = []

# ---------------------------------------------------------------- SINIFLAR (101–105)
probs.append(dict(
    id='a-101', title='Bisiklet konum vektörü', track=S, diff='Orta', tags=['operatör aşırı yükleme', '__iter__', '__bool__'],
    src='Vector2D (Fluent Python, Bölüm 1 benzeri)', mode='func', fn='Vektor',
    statement=P('Pedal İzmir, bisikletlerin istasyona göre konumunu metre cinsinden 2 boyutlu vektörlerle izliyor. `Vektor(x, y)` sınıfını yaz:',
                '<ul><li>`v + w`, `v - w` → yeni `Vektor`; `Vektor` olmayanla `NotImplemented` (Python `TypeError` verir).</li><li>`v * k` ve `k * v` → sayı ile çarpım.</li><li>`abs(v)` → uzunluk (`math.hypot`).</li><li>`v == w` → bileşenler eşitse.</li><li>`bool(v)` → sıfır vektör `False`.</li><li>`x, y = v` → açılabilsin (`__iter__`).</li><li>`v.mesafe(w)` → iki nokta arası uzaklık.</li><li>`repr(v)` → `\'Vektor(3, 4)\'`.</li></ul>'),
    constraints='',
    samples=[('abs(Vektor(3, 4))', ''), ('repr(Vektor(1, 2) + Vektor(3, -5))', ''), ('repr(2 * Vektor(1.5, -1))', 'Sağdan çarpma için __rmul__.')],
    checks=["Vektor(0, 0).mesafe(Vektor(6, 8))", "(bool(Vektor(0, 0)), bool(Vektor(0, 0.1)))", "x, y = Vektor(7, -2)\n(x, y)",
            "Vektor(1, 1) == Vektor(1.0, 1.0)", "Vektor(1, 1) == (1, 1)", "repr(Vektor(5, 5) - Vektor(5, 5) * 1)",
            "round(abs(Vektor(1, 1)), 6)", "sorted([Vektor(3, 4), Vektor(1, 0), Vektor(0, 2)], key=abs)[0] == Vektor(1, 0)"],
    raises=[('TypeError', 'Vektor(1, 2) + 5', 'sayı ile toplama')],
    start='import math\n\nclass Vektor:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n',
    sol='''
import math

class Vektor:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        return f'Vektor({self.x!r}, {self.y!r})'

    def __add__(self, other):
        if not isinstance(other, Vektor):
            return NotImplemented
        return Vektor(self.x + other.x, self.y + other.y)

    def __sub__(self, other):
        if not isinstance(other, Vektor):
            return NotImplemented
        return Vektor(self.x - other.x, self.y - other.y)

    def __mul__(self, k):
        if not isinstance(k, (int, float)):
            return NotImplemented
        return Vektor(self.x * k, self.y * k)

    __rmul__ = __mul__

    def __abs__(self):
        return math.hypot(self.x, self.y)

    def __bool__(self):
        return bool(self.x or self.y)

    def __eq__(self, other):
        if not isinstance(other, Vektor):
            return NotImplemented
        return self.x == other.x and self.y == other.y

    def __hash__(self):
        return hash((self.x, self.y))

    def __iter__(self):
        yield self.x
        yield self.y

    def mesafe(self, other):
        return abs(self - other)
''',
    editorial=ed('Her operatör bir dunder metoda karşılık gelir: `+` `__add__`, `*` `__mul__`, `k * v` ise önce `int.__mul__` dener, o `NotImplemented` dönünce Python `v.__rmul__(k)` çağırır. `abs()` `__abs__`\'ü, `bool()` `__bool__`\'u, açma (unpacking) `__iter__`\'i kullanır. `mesafe` mevcut operatörlerle tek satırdır: `abs(self - other)`.',
                 'Tüm işlemler O(1).',
                 '`typing.NamedTuple` ya da `@dataclass(frozen=True)` ile değişmez (immutable) bir vektör kurup operatörleri eklemek de yaygındır. Çok boyutlu ve hızlı vektör işlemleri için numpy dizileri kullanılır.',
                 'Desteklenmeyen türde `False` ya da hata döndürmek yerine `NotImplemented` döndürmeyi unutmak. `__eq__` tanımlayıp `__hash__`\'i unutmak (nesne kümeye konamaz). `__iter__`\'te liste döndürmek: `__iter__` bir yineleyici döndürmelidir (`return iter((self.x, self.y))` ya da `yield`).'),
    hints=['k * v için __rmul__ gerekir; __rmul__ = __mul__ yeterli.', 'abs → __abs__, bool → __bool__, x, y = v → __iter__ (yield ile).']))

probs.append(dict(
    id='a-102', title='Bordro: kalıtım ve çok biçimlilik', track=S, diff='Orta', tags=['kalıtım', 'super()', 'çok biçimlilik'],
    src='OOP: inheritance & polymorphism (Employee payroll klasik örneği)', mode='func', fn='bordro',
    statement=P('Pusula İK bordro modülü farklı çalışan türlerini tek bir listede işliyor. Sınıfları yaz:',
                '<ul><li>`Calisan(ad)` — temel sınıf; `maas()` çağrılırsa `NotImplementedError`. `str(c)` → `\'Ayşe (TamZamanli): 45000.00 TL\'` (sınıf adı ve maaş, iki ondalık).</li><li>`TamZamanli(ad, aylik)` — maaş `aylik`.</li><li>`SaatUcretli(ad, saat, ucret)` — ilk 160 saat normal, aşan saatler <b>1,5 kat</b> ücret.</li><li>`Yonetici(ad, aylik, prim_yuzde)` — `TamZamanli`dan türer; maaş = aylik × (1 + prim_yuzde / 100). `super()` kullan.</li></ul>',
                'Ardından `bordro(calisanlar)` fonksiyonu `(toplam, en_yuksek_ad)` döndürsün: toplam 2 ondalığa yuvarlanmış; en yüksek maaşlı çalışanın adı (eşitlikte listede önce gelen). Boş listede `(0, None)`.'),
    constraints='',
    samples=[("bordro([TamZamanli('Ayşe', 45000), SaatUcretli('Can', 170, 200), Yonetici('Ece', 60000, 15)])", 'Can: 160·200 + 10·300 = 35 000; Ece: 69 000.'),
             ("str(SaatUcretli('Can', 170, 200))", '')],
    checks=["bordro([])", "SaatUcretli('Mert', 160, 100).maas()", "SaatUcretli('Mert', 0, 100).maas()", "str(Yonetici('Zeynep', 50000, 0))",
            "(isinstance(Yonetici('a', 1, 1), TamZamanli), isinstance(Yonetici('a', 1, 1), Calisan))",
            "bordro([TamZamanli('A', 100), TamZamanli('B', 100)])", "bordro([SaatUcretli('S', 160.5, 33.33)])",
            "type(Yonetici('Y', 1000, 10)).__mro__[1].__name__"],
    raises=[('NotImplementedError', "Calisan('X').maas()", 'temel sınıf maaşı')],
    start='class Calisan:\n    def __init__(self, ad):\n        self.ad = ad\n\n    def maas(self):\n        raise NotImplementedError\n\n# TamZamanli, SaatUcretli, Yonetici sınıflarını yaz\n\ndef bordro(calisanlar):\n    pass\n',
    sol='''
class Calisan:
    def __init__(self, ad):
        self.ad = ad

    def maas(self):
        raise NotImplementedError('Alt sınıf maas() tanımlamalı')

    def __str__(self):
        return f'{self.ad} ({type(self).__name__}): {self.maas():.2f} TL'

class TamZamanli(Calisan):
    def __init__(self, ad, aylik):
        super().__init__(ad)
        self.aylik = aylik

    def maas(self):
        return self.aylik

class SaatUcretli(Calisan):
    NORMAL_SAAT = 160

    def __init__(self, ad, saat, ucret):
        super().__init__(ad)
        self.saat = saat
        self.ucret = ucret

    def maas(self):
        normal = min(self.saat, self.NORMAL_SAAT)
        fazla = max(self.saat - self.NORMAL_SAAT, 0)
        return normal * self.ucret + fazla * self.ucret * 1.5

class Yonetici(TamZamanli):
    def __init__(self, ad, aylik, prim_yuzde):
        super().__init__(ad, aylik)
        self.prim_yuzde = prim_yuzde

    def maas(self):
        return super().maas() * (1 + self.prim_yuzde / 100)

def bordro(calisanlar):
    if not calisanlar:
        return (0, None)
    toplam = round(sum(c.maas() for c in calisanlar), 2)
    en_yuksek = max(calisanlar, key=lambda c: c.maas())
    return (toplam, en_yuksek.ad)
''',
    editorial=ed('Ortak davranış (`ad`, `__str__`) temel sınıfta; değişen davranış (`maas`) her alt sınıfta yeniden tanımlanır (override). `bordro` hangi türle uğraştığını bilmeden `c.maas()` çağırır: çok biçimlilik (polymorphism). `Yonetici` maaşını sıfırdan hesaplamaz, `super().maas()` ile üst sınıfın sonucunu genişletir. `__str__` içinde `type(self).__name__` gerçek alt sınıf adını verir.',
                 '`bordro` O(n).',
                 '`abc.ABC` ve `@abstractmethod` ile `Calisan`\'ın kendisinin örneklenmesi tamamen engellenebilir (`TypeError`). Bileşim (composition) alternatifi: maaş kuralını ayrı bir strateji nesnesi olarak çalışana vermek.',
                 '`isinstance` ile tür kontrol eden uzun `if` zincirleri yazmak (çok biçimliliğin tam tersi). Alt sınıf `__init__`\'inde `super().__init__` çağırmayı unutmak (`ad` hiç atanmaz). `max` ile eşitlikte ilk elemanın döndüğünü bilmemek — burada istenen tam da bu.'),
    hints=['Alt sınıflarda super().__init__(ad) çağır ve maas() metodunu yeniden tanımla.', 'Yonetici.maas içinde super().maas() ile aylığı al; bordro\'da max(..., key=lambda c: c.maas()).']))

probs.append(dict(
    id='a-103', title='Görev kuyruğu: dataclass sıralama', track=S, diff='Orta', tags=['dataclass', 'field', '__post_init__'],
    src='dataclasses modülü (order=True, field(compare=False))', mode='func', fn='planla',
    statement=P('Lezzet Kurye operasyon ekibinin görev listesi için bir `Gorev` veri sınıfı yaz (`@dataclass(order=True)`). Alan sırası şöyle olmalı:',
                '<ol><li>`oncelik: int` — 1 (en acil) … 5</li><li>`son_tarih: str` — ISO tarih (`\'2026-11-05\'`)</li><li>`ad: str` — karşılaştırmaya <b>katılmaz</b></li><li>`etiketler: list` — varsayılan boş liste, karşılaştırmaya katılmaz</li></ol>',
                '`__post_init__` içinde: öncelik 1–5 dışındaysa `ValueError`; son tarih geçerli bir ISO tarih değilse `ValueError` (`date.fromisoformat` bunu zaten fırlatır).',
                'Sonra `planla(gorevler)`: görev adlarını önce önceliğe, sonra son tarihe göre sıralı liste olarak döndürsün (eşitlerde giriş sırası korunur).'),
    constraints='',
    samples=[("planla([Gorev(2, '2026-11-05', 'fatura'), Gorev(1, '2026-11-09', 'kaza raporu'), Gorev(2, '2026-11-03', 'vardiya')])", 'Önce öncelik 1, sonra öncelik 2 içinde erken tarih.'),
             ("repr(Gorev(3, '2026-12-01', 'envanter'))", 'dataclass repr\'i otomatik üretir.')],
    checks=["Gorev(2, '2026-11-05', 'a') == Gorev(2, '2026-11-05', 'b', ['x'])", "Gorev(1, '2026-12-31', 'a') < Gorev(2, '2026-01-01', 'b')",
            "g1 = Gorev(1, '2026-11-01', 'a')\ng2 = Gorev(1, '2026-11-01', 'b')\ng1.etiketler.append('acil')\ng2.etiketler",
            "planla([])", "planla([Gorev(5, '2026-01-01', 'x'), Gorev(5, '2026-01-01', 'y'), Gorev(4, '2027-01-01', 'z')])",
            "import dataclasses\n[f.name for f in dataclasses.fields(Gorev)]"],
    raises=[('ValueError', "Gorev(0, '2026-11-01', 'x')", 'öncelik 0'), ('ValueError', "Gorev(6, '2026-11-01', 'x')", 'öncelik 6'),
            ('ValueError', "Gorev(3, '2026-02-30', 'x')", 'geçersiz tarih')],
    start='from dataclasses import dataclass, field\nfrom datetime import date\n\n# @dataclass(order=True) ile Gorev sınıfını yaz\n\ndef planla(gorevler):\n    pass\n',
    sol='''
from dataclasses import dataclass, field
from datetime import date

@dataclass(order=True)
class Gorev:
    oncelik: int
    son_tarih: str
    ad: str = field(compare=False)
    etiketler: list = field(default_factory=list, compare=False)

    def __post_init__(self):
        if not 1 <= self.oncelik <= 5:
            raise ValueError('Öncelik 1 ile 5 arasında olmalı')
        date.fromisoformat(self.son_tarih)

def planla(gorevler):
    return [g.ad for g in sorted(gorevler)]
''',
    editorial=ed('`@dataclass` `__init__`, `__repr__` ve `__eq__`\'yu alan tanımlarından üretir; `order=True` ise `&lt;`, `&gt;` … metotlarını alanları sırayla bir demet gibi karşılaştıracak şekilde ekler. `field(compare=False)` bir alanı eşitlik ve sıralamadan çıkarır. Değişebilir varsayılan için `field(default_factory=list)` şarttır. ISO tarihler metin olarak da doğru sıralanır (`\'2026-11-03\' &lt; \'2026-11-05\'`). `sorted` kararlıdır (stable): eşitlerde giriş sırası korunur.',
                 'Sıralama O(n log n).',
                 '`sorted(gorevler, key=lambda g: (g.oncelik, g.son_tarih))` ile sınıfa sıralama eklemeden de çözebilirsin; birden çok farklı sıralama gerekiyorsa bu daha esnektir. Öncelik kuyruğu için `heapq` ile `order=True` dataclass\'lar çok iyi çalışır.',
                 '`etiketler: list = []` yazmak: dataclass bunu reddeder (`ValueError: mutable default`). `ad` alanını karşılaştırmadan çıkarmayı unutmak: eşit öncelik/tarihte adlara göre sıralanır. `__post_init__` yerine `__init__` yazıp otomatik kurucuyu ezmek.'),
    hints=['ad: str = field(compare=False) ve etiketler: list = field(default_factory=list, compare=False)', '__post_init__ doğrulama için; order=True sayesinde sorted(gorevler) doğrudan çalışır.']))

probs.append(dict(
    id='a-104', title='Fiyat eğrisi polinomu', track=S, diff='Zor', tags=['__call__', '__str__', 'operatörler'],
    src='Polynomial class (MIT 6.0001 / Codewars benzeri)', mode='func', fn='Polinom',
    statement=P('Anadolu Market fiyatlama ekibi talep eğrilerini polinomlarla modelliyor. `Polinom(katsayilar)` sınıfını yaz; katsayılar <b>küçük dereceden büyüğe</b> verilir: `[5, -1, 3]` → 3x^2 − x + 5. Sondaki sıfırlar atılır.',
                '<ul><li>`derece` — property; sıfır polinomda 0.</li><li>`p(x)` — değeri hesapla (`__call__`, Horner yöntemi).</li><li>`p + q`, `p * q` — `Polinom` ya da sayı ile; sayı sağda ya da solda olabilir.</li><li>`p == q` — katsayılar aynıysa.</li><li>`turev()` — türev polinomu.</li><li>`str(p)` — `\'3x^2 - x + 5\'`: büyük dereceden küçüğe; katsayı 1 ise yazılmaz (`x`, `-x^3`); x^1 → `x`; sıfır terimler atlanır; sıfır polinom `\'0\'`; ilk terim negatifse `-` bitişik yazılır.</li><li>`repr(p)` — `\'Polinom([5, -1, 3])\'`.</li></ul>'),
    constraints='Katsayılar tam sayı; uzunluk ≤ 500',
    samples=[('str(Polinom([5, -1, 3]))', ''), ('Polinom([5, -1, 3])(2)', '3·4 − 2 + 5 = 15'), ('str(Polinom([1, 1]) * Polinom([-1, 1]))', '(x + 1)(x − 1) = x² − 1')],
    checks=["str(Polinom([0, 0, 0]))", "Polinom([0, 0, 0]).derece", "str(Polinom([0, -1, 0, -2]))", "str(Polinom([-7]))",
            "repr(Polinom([1, 2, 3]).turev())", "str(Polinom([4, 0, 0, 1]).turev().turev())", "Polinom([1, 2]) + Polinom([-1, -2]) == Polinom([])",
            "str(2 * Polinom([1, 1]) + 3)", "(Polinom([2, 0, 1]) == Polinom([2, 0, 1, 0, 0]), Polinom([1]) == 1)",
            "Polinom([1] * 500)(1)"],
    start='class Polinom:\n    def __init__(self, katsayilar):\n        self.k = list(katsayilar)\n',
    sol='''
class Polinom:
    def __init__(self, katsayilar):
        k = list(katsayilar)
        while k and k[-1] == 0:
            k.pop()
        self.k = k

    @property
    def derece(self):
        return max(len(self.k) - 1, 0)

    def __call__(self, x):
        sonuc = 0
        for a in reversed(self.k):
            sonuc = sonuc * x + a
        return sonuc

    @staticmethod
    def _cevir(diger):
        if isinstance(diger, Polinom):
            return diger
        if isinstance(diger, (int, float)):
            return Polinom([diger])
        return None

    def __add__(self, diger):
        q = self._cevir(diger)
        if q is None:
            return NotImplemented
        n = max(len(self.k), len(q.k))
        a = self.k + [0] * (n - len(self.k))
        b = q.k + [0] * (n - len(q.k))
        return Polinom([x + y for x, y in zip(a, b)])

    __radd__ = __add__

    def __mul__(self, diger):
        q = self._cevir(diger)
        if q is None:
            return NotImplemented
        if not self.k or not q.k:
            return Polinom([])
        sonuc = [0] * (len(self.k) + len(q.k) - 1)
        for i, a in enumerate(self.k):
            for j, b in enumerate(q.k):
                sonuc[i + j] += a * b
        return Polinom(sonuc)

    __rmul__ = __mul__

    def __eq__(self, diger):
        q = self._cevir(diger)
        if q is None:
            return NotImplemented
        return self.k == q.k

    def turev(self):
        return Polinom([i * a for i, a in enumerate(self.k)][1:])

    def __repr__(self):
        return f'Polinom({self.k!r})'

    def __str__(self):
        parcalar = []
        for us in range(len(self.k) - 1, -1, -1):
            a = self.k[us]
            if a == 0:
                continue
            mutlak = abs(a)
            if us == 0:
                govde = str(mutlak)
            else:
                katsayi = '' if mutlak == 1 else str(mutlak)
                govde = katsayi + ('x' if us == 1 else f'x^{us}')
            if not parcalar:
                parcalar.append(('-' if a < 0 else '') + govde)
            else:
                parcalar.append(('- ' if a < 0 else '+ ') + govde)
        return ' '.join(parcalar) if parcalar else '0'
''',
    editorial=ed('Katsayıları liste olarak tut, kurucuda sondaki sıfırları at: böylece eşitlik ve derece kendiliğinden doğru olur. Değer için Horner: `((3)·x − 1)·x + 5` — en büyük katsayıdan başlayıp “çarp, ekle”. Toplama: kısa listeyi sıfırla doldurup eleman eleman topla. Çarpma: her `a<sub>i</sub>·b<sub>j</sub>` çarpımı `i + j` dereceye eklenir (konvolüsyon). Sayılarla işlem için sayıyı sabit polinoma çeviren tek bir yardımcı yazıp `__radd__ = __add__`, `__rmul__ = __mul__` kullan.',
                 'Değer O(n), toplama O(n), çarpma O(n·m), `str` O(n).',
                 '`numpy.polynomial.Polynomial` aynı arayüzü (ve kökler, uydurma/fit) hazır sunar; büyük derecede çarpma FFT ile O(n log n) yapılabilir.',
                 'Sondaki sıfırları atmayıp `[1] != [1, 0]` sonucuna düşmek. `str`\'de katsayı 1/−1 ve x^1/x^0 özel durumlarını unutmak; sıfır polinomda boş metin döndürmek. `x ** i` ile her terimi ayrı ayrı üs alarak hesaplamak (O(n²) çarpma, Horner O(n)).'),
    hints=['Kurucuda sondaki sıfırları at; değer hesabında Horner: sonuc = sonuc * x + a (büyük dereceden başla).', 'Sayıyı Polinom([sayi])\'ya çeviren bir yardımcı yaz; __radd__ = __add__, __rmul__ = __mul__.']))

probs.append(dict(
    id='a-105', title='Dönüşüm matrisi sınıfı', track=S, diff='Zor', tags=['__matmul__', '__getitem__', 'classmethod'],
    src='Matrix class (Python veri modeli, @ operatörü — PEP 465)', mode='func', fn='Matris',
    statement=P('Kesit BI ekibi şehirler arası müşteri geçişlerini (Markov zinciri) matrislerle hesaplıyor. Saf Python ile bir `Matris` sınıfı yaz:',
                '<ul><li>`Matris(satirlar)` — liste listesi; boşsa ya da satır uzunlukları farklıysa `ValueError`. Veriyi kopyala (dışarıdaki liste değişince matris değişmesin).</li><li>`boyut` — property, `(satir, sutun)`.</li><li>`m[i, j]` — eleman okuma (`__getitem__` demet alır).</li><li>`m + n` — aynı boyut, yoksa `ValueError`.</li><li>`m @ n` — matris çarpımı; `m` sütun sayısı `n` satır sayısına eşit değilse `ValueError`.</li><li>`m * k`, `k * m` — sayı ile çarpım.</li><li>`m ** p` — p ≥ 0 tam sayı kuvvet (yalnız kare matris; değilse `ValueError`). `p = 0` birim matris.</li><li>`transpoz()`, `Matris.birim(n)` (classmethod), `==`, `repr` → `\'Matris([[1, 2], [3, 4]])\'`.</li></ul>'),
    constraints='Boyutlar ≤ 60, kuvvet ≤ 10^9 (hızlı üs gerekli)',
    samples=[('repr(Matris([[1, 2], [3, 4]]) @ Matris([[5, 6], [7, 8]]))', '[1·5+2·7, 1·6+2·8] = [19, 22] …'),
             ('repr(Matris([[1, 1], [1, 0]]) ** 10)', 'Fibonacci matrisi: F(11) = 89.')],
    checks=["m = Matris([[1, 2, 3], [4, 5, 6]])\n(m.boyut, m[1, 2], repr(m.transpoz()))", "repr(Matris.birim(3))",
            "satir = [1, 2]\nm = Matris([satir])\nsatir[0] = 99\nm[0, 0]", "repr(2 * Matris([[1, -1]]) + Matris([[0, 1]]) * 3)",
            "Matris([[1, 2], [3, 4]]) ** 0 == Matris.birim(2)", "(Matris([[1, 1], [1, 0]]) ** 90)[0, 1]",
            "repr(Matris([[1, 2, 3]]) @ Matris([[1], [2], [3]]))", "Matris([[1]]) == [[1]]"],
    raises=[('ValueError', 'Matris([[1, 2], [3]])', 'düzensiz satırlar'), ('ValueError', 'Matris([])', 'boş matris'),
            ('ValueError', 'Matris([[1, 2]]) @ Matris([[1, 2]])', 'çarpım boyutu'), ('ValueError', 'Matris([[1, 2]]) ** 2', 'kare olmayan kuvvet')],
    start='class Matris:\n    def __init__(self, satirlar):\n        self.v = satirlar\n',
    sol='''
class Matris:
    def __init__(self, satirlar):
        if not satirlar or not satirlar[0]:
            raise ValueError('Matris boş olamaz')
        n = len(satirlar[0])
        if any(len(s) != n for s in satirlar):
            raise ValueError('Tüm satırlar aynı uzunlukta olmalı')
        self.v = [list(s) for s in satirlar]

    @property
    def boyut(self):
        return (len(self.v), len(self.v[0]))

    @classmethod
    def birim(cls, n):
        return cls([[1 if i == j else 0 for j in range(n)] for i in range(n)])

    def __getitem__(self, ij):
        i, j = ij
        return self.v[i][j]

    def __eq__(self, diger):
        if not isinstance(diger, Matris):
            return NotImplemented
        return self.v == diger.v

    def __repr__(self):
        return f'Matris({self.v!r})'

    def __add__(self, diger):
        if not isinstance(diger, Matris):
            return NotImplemented
        if self.boyut != diger.boyut:
            raise ValueError('Toplama için boyutlar aynı olmalı')
        return Matris([[a + b for a, b in zip(r1, r2)] for r1, r2 in zip(self.v, diger.v)])

    def __mul__(self, k):
        if not isinstance(k, (int, float)):
            return NotImplemented
        return Matris([[a * k for a in r] for r in self.v])

    __rmul__ = __mul__

    def __matmul__(self, diger):
        if not isinstance(diger, Matris):
            return NotImplemented
        if self.boyut[1] != diger.boyut[0]:
            raise ValueError('Çarpım için sütun sayısı satır sayısına eşit olmalı')
        sutunlar = list(zip(*diger.v))
        return Matris([[sum(a * b for a, b in zip(r, s)) for s in sutunlar] for r in self.v])

    def __pow__(self, p):
        m, n = self.boyut
        if m != n:
            raise ValueError('Kuvvet yalnız kare matriste tanımlı')
        if not isinstance(p, int) or p < 0:
            raise ValueError('Kuvvet negatif olmayan tam sayı olmalı')
        sonuc = Matris.birim(n)
        taban = self
        while p:
            if p & 1:
                sonuc = sonuc @ taban
            taban = taban @ taban
            p >>= 1
        return sonuc

    def transpoz(self):
        return Matris([list(s) for s in zip(*self.v)])
''',
    editorial=ed('Kurucu doğrular ve satırları <b>kopyalar</b> (savunmacı kopya / defensive copy). `m[i, j]` yazıldığında Python `__getitem__`\'e `(i, j)` demetini verir. `@` operatörü `__matmul__`\'e bağlıdır; ikinci matrisin sütunlarını `zip(*diger.v)` ile bir kez çıkarıp her satır-sütun çiftinin iç çarpımını al. Kuvvet için a-067\'deki hızlı üs algoritmasını matrislere uygula: O(log p) matris çarpımı. Birim matris için `@classmethod` alternatif kurucu.',
                 'Çarpım O(n³), kuvvet O(n³ log p).',
                 'Gerçek işte `numpy`: `A @ B`, `np.linalg.matrix_power(A, p)`. Saf Python sürümü veri modeli ve algoritmayı öğretir; numpy aynı işi C/BLAS ile yüzlerce kat hızlı yapar.',
                 'Kopya almamak: `Matris(liste)` sonrası dış liste değişince matris de değişir. `[[0] * n] * n` ile satır oluşturmak: tüm satırlar aynı liste nesnesidir! `**` için p kez çarpmak: p = 10^9 için bitmez. `*` ile eleman eleman çarpım ve `@` ile matris çarpımını karıştırmak.'),
    hints=['m[i, j] → __getitem__((i, j)); sütunlar için zip(*diger.v).', 'Kuvvette hızlı üs: p tekse sonucu taban ile çarp, tabanın karesini al, p\'yi yarıla.']))

# ---------------------------------------------------------------- FONKSİYONEL
probs.append(dict(
    id='a-106', title='KDV\'li vitrin fiyatları', track=F, diff='Kolay', tags=['filter', 'map', 'lambda', 'sorted'],
    src='HackerRank Python: Map and Lambda Function benzeri', mode='func', fn='vitrin',
    statement=P('Anadolu Market\'in ana sayfa vitrininde yalnız belirli bir fiyatın üstündeki ürünler, KDV dahil fiyatlarıyla gösterilecek.',
                '`vitrin(urunler, esik, kdv=20)` fonksiyonunu yaz. `urunler` `(ad, kdv_haric_fiyat)` listesi.',
                '<ol><li>KDV hariç fiyatı `esik`ten <b>küçük olmayanları</b> süz (`filter`),</li><li>her birini `(ad, round(fiyat * (1 + kdv / 100), 2))` biçimine dönüştür (`map`),</li><li>KDV\'li fiyata göre <b>azalan</b>, eşitlikte ada göre artan sırala.</li></ol>',
                'Çözümünde en az bir `lambda` kullan (test kontrol eder).'),
    constraints='0 ≤ len(urunler) ≤ 10^5',
    samples=[("vitrin([('kahve', 250), ('cay', 80), ('bal', 400), ('lokum', 250)], 100)", 'cay elendi; kahve ve lokum eşit fiyatta → ada göre.')],
    checks=["vitrin([], 0)", "vitrin([('a', 10)], 10)", "vitrin([('a', 9.99)], 10)", "vitrin([('su', 5), ('ayran', 12.5)], 0, 10)",
            "vitrin([('x', 100), ('y', 100.0), ('w', 99.5)], 50, 0)", "vitrin([('zeytinyagi', 333.33)], 1, 1)",
            "len(vitrin([('u' + str(i), i) for i in range(100000)], 50000))"],
    extra=["assert 'lambda' in __source__, 'Çözümde en az bir lambda kullanmalısın'"],
    start='def vitrin(urunler, esik, kdv=20):\n    # filter, map ve sorted kullan\n    pass\n',
    sol='''
def vitrin(urunler, esik, kdv=20):
    secilen = filter(lambda u: u[1] >= esik, urunler)
    kdvli = map(lambda u: (u[0], round(u[1] * (1 + kdv / 100), 2)), secilen)
    return sorted(kdvli, key=lambda u: (-u[1], u[0]))
''',
    editorial=ed('`filter(koşul, dizi)` koşulu sağlayanları, `map(dönüşüm, dizi)` dönüştürülmüş değerleri <b>tembel</b> (lazy) olarak üretir: ara liste oluşmaz, değerler `sorted` tükettikçe hesaplanır. Azalan fiyat + artan ad için anahtar `(-fiyat, ad)`.',
                 'O(n log n) — sıralama baskın.',
                 'Pythonca genelde liste kavrayışı tercih edilir ve daha okunurdur: `sorted(((a, round(f * (1 + kdv / 100), 2)) for a, f in urunler if f &gt;= esik), key=...)`. `lambda u: u[1]` yerine `operator.itemgetter(1)` hem okunur hem biraz hızlıdır.',
                 '`map`/`filter` sonucunu iki kez tüketmeye çalışmak: yineleyici (iterator) bir kez gezilir, ikinci gezintide boştur. `reverse=True` ile sıralayıp adları da ters çevirmek. Eşiği `&gt;` ile karşılaştırıp tam eşik fiyatlı ürünü elemek.'),
    hints=['filter(lambda u: u[1] >= esik, urunler) eşik altını eler.', 'sorted(..., key=lambda u: (-u[1], u[0])) azalan fiyat, artan ad verir.']))

probs.append(dict(
    id='a-107', title='Kasa fiş numaratörü', track=F, diff='Kolay', tags=['closure', 'nonlocal'],
    src='Closure ile durum tutma (counter factory)', mode='func', fn='fis_numaratoru',
    statement=P('Anadolu Market\'in her kasası kendi fiş numarasını üretiyor. Sınıf yazmadan, <b>closure</b> ile bir numaratör üret:',
                '`fis_numaratoru(onek, baslangic=1)` bir fonksiyon döndürsün. Döndürülen fonksiyon her çağrıldığında sıradaki fiş numarasını `\'<onek>-0001\'` biçiminde (en az 4 haneli, sıfır dolgulu) döndürür ve sayacı bir artırır. Her numaratör <b>bağımsızdır</b>. `baslangic` 1\'den küçükse `ValueError` (numaratör oluşturulurken).'),
    constraints='',
    samples=[("k1 = fis_numaratoru('K1')\n[k1(), k1(), k1()]", ''), ("fis_numaratoru('K7', 9999)()", '4 haneyi aşınca dolgu yok.')],
    checks=["a = fis_numaratoru('A')\nb = fis_numaratoru('B', 50)\n[a(), b(), a(), b()]", "k = fis_numaratoru('X', 9998)\n[k(), k(), k()]",
            "k = fis_numaratoru('Z')\nfor _ in range(1233):\n    k()\nk()", "fis_numaratoru('')()",
            "k = fis_numaratoru('M')\nk.__closure__ is not None", "callable(fis_numaratoru('Q'))"],
    raises=[('ValueError', "fis_numaratoru('K', 0)", 'başlangıç 0')],
    start='def fis_numaratoru(onek, baslangic=1):\n    # iç fonksiyon tanımla ve döndür\n    pass\n',
    sol='''
def fis_numaratoru(onek, baslangic=1):
    if baslangic < 1:
        raise ValueError('Başlangıç en az 1 olmalı')
    sayac = baslangic

    def sonraki():
        nonlocal sayac
        no = f'{onek}-{sayac:04d}'
        sayac += 1
        return no

    return sonraki
''',
    editorial=ed('İç fonksiyon, dış fonksiyonun yerel değişkenlerini (`onek`, `sayac`) dış fonksiyon bittikten sonra da “hatırlar”: buna closure denir (değerler `sonraki.__closure__` hücrelerinde yaşar). Dış değişkene <b>atama</b> yapacaksan `nonlocal` bildirmen gerekir; yoksa Python `sayac`\'ı iç fonksiyonun yerel değişkeni sanar.',
                 'Her çağrı O(1).',
                 'Aynı iş `itertools.count(baslangic)` ile de yapılır: `c = count(b); return lambda: f\'{onek}-{next(c):04d}\'`. Durum karmaşıklaşırsa (sıfırlama, son numarayı okuma) sınıf daha uygundur.',
                 '`nonlocal`\'ı unutup `UnboundLocalError` almak. Sayacı modül düzeyinde global tutmak: tüm kasalar aynı sayacı paylaşır. Doğrulamayı iç fonksiyona koymak: hata ancak ilk çağrıda görülür, oluşturma anında değil.'),
    hints=['Dış fonksiyonda sayac = baslangic tanımla, iç fonksiyonu döndür.', 'İç fonksiyonda sayacı artırmak için nonlocal sayac yaz; {sayac:04d} sıfır dolgu yapar.']))

probs.append(dict(
    id='a-108', title='Çok ölçütlü personel listesi', track=F, diff='Kolay', tags=['sorted', 'key', 'lambda'],
    src='HackerRank Python: Athlete Sort benzeri', mode='func', fn='personel_sirala',
    statement=P('Pusula İK\'nın raporunda çalışanlar şu sırayla listelenecek: önce <b>departman</b> adına göre A→Z, aynı departmanda <b>maaşa göre yüksekten düşüğe</b>, maaş da eşitse <b>ada göre</b> A→Z.',
                '`personel_sirala(calisanlar)` fonksiyonunu yaz: `calisanlar` `{\'ad\', \'departman\', \'maas\'}` anahtarlı sözlüklerin listesi. Sıralanmış <b>adların</b> listesini döndür. Girdi listesi <b>değişmesin</b>.'),
    constraints='0 ≤ len(calisanlar) ≤ 10^5',
    samples=[("personel_sirala([{'ad': 'Ece', 'departman': 'Satis', 'maas': 40000}, {'ad': 'Ali', 'departman': 'IK', 'maas': 38000}, {'ad': 'Can', 'departman': 'Satis', 'maas': 52000}, {'ad': 'Bora', 'departman': 'Satis', 'maas': 40000}])", 'IK önce; Satış içinde Can (52 bin), sonra 40 binde Bora ve Ece alfabetik.')],
    checks=["personel_sirala([])", "personel_sirala([{'ad': 'Z', 'departman': 'A', 'maas': 1}])",
            "personel_sirala([{'ad': 'b', 'departman': 'X', 'maas': 5}, {'ad': 'a', 'departman': 'X', 'maas': 5}, {'ad': 'c', 'departman': 'W', 'maas': 1}])",
            "veri = [{'ad': 'b', 'departman': 'B', 'maas': 1}, {'ad': 'a', 'departman': 'A', 'maas': 1}]\npersonel_sirala(veri)\n[v['ad'] for v in veri]",
            "personel_sirala([{'ad': 'x', 'departman': 'D', 'maas': 100.5}, {'ad': 'y', 'departman': 'D', 'maas': 100.25}, {'ad': 'w', 'departman': 'C', 'maas': 0}])",
            "import random\nrandom.seed(108)\nv = [{'ad': 'p' + str(i), 'departman': random.choice('ABC'), 'maas': random.randint(1, 50)} for i in range(5000)]\npersonel_sirala(v)[:5]"],
    start='def personel_sirala(calisanlar):\n    # kodunu yaz\n    pass\n',
    sol='''
def personel_sirala(calisanlar):
    sirali = sorted(calisanlar, key=lambda c: (c['departman'], -c['maas'], c['ad']))
    return [c['ad'] for c in sirali]
''',
    editorial=ed('`sorted` için anahtar fonksiyonu bir demet döndürsün: demetler soldan sağa karşılaştırılır. Sayısal ölçütü ters çevirmek için eksi işareti yeterli: `(departman, -maas, ad)`. `sorted` yeni liste döndürür; `list.sort()` ise yerinde sıralar ve girdiyi değiştirir.',
                 'O(n log n).',
                 'Ters çevrilemeyen bir ölçüt (ör. metni azalan sıralamak) gerekirse kararlı sıralamanın gücünü kullan: en az önemli ölçütten başlayarak birden çok `sort` çağrısı yap (`sort(key=ad)`, `sort(key=maas, reverse=True)`, `sort(key=departman)`). `operator.itemgetter` çoklu anahtar için de kullanılabilir ama eksi işareti eklenemez.',
                 '`reverse=True` kullanıp departmanları da ters sıralamak. `calisanlar.sort(...)` ile çağıranın listesini bozmak. Üç ayrı `sorted` çağrısını yanlış sırada (önce en önemli ölçüt) yapmak.'),
    hints=['key=lambda c: (c[\'departman\'], -c[\'maas\'], c[\'ad\'])', 'sorted yeni liste döndürür; list.sort() girdiyi değiştirir.']))

probs.append(dict(
    id='a-109', title='Çağrı sayan dekoratör', track=F, diff='Orta', tags=['dekoratör', 'functools.wraps', 'öznitelik'],
    src='Decorator temel kalıbı (Real Python: Primer on Decorators benzeri)', mode='func', fn='sayac',
    statement=P('Ilgaz Bank\'ın API katmanında hangi fonksiyonun kaç kez çağrıldığını izlemek istiyorsun. `@sayac` dekoratörünü yaz:',
                '<ul><li>Süslenen fonksiyon aynı argümanlarla (konumsal ve isimli) aynı sonucu döndürmeli.</li><li>Sarmalayıcının `cagri` özniteliği o ana kadarki çağrı sayısını tutmalı (hata fırlatan çağrılar da sayılır).</li><li>`sifirla()` özniteliği sayacı 0 yapmalı.</li><li>`__name__` ve `__doc__` korunmalı (`functools.wraps`).</li><li>Her süslenen fonksiyonun sayacı ayrı olmalı.</li></ul>'),
    constraints='',
    setup='''
@sayac
def faiz(tutar, oran=0.4):
    """Basit faiz hesaplar."""
    return round(tutar * oran / 100, 2)

@sayac
def hata_ver():
    raise RuntimeError('servis hatası')
''',
    samples=[('faiz(1000)\nfaiz(2500, oran=1)\n(faiz(100, 2), faiz.cagri)', 'Üç çağrı sayıldı.')],
    checks=["(faiz.__name__, faiz.__doc__)", "faiz.sifirla()\nfaiz.cagri", "faiz.sifirla()\nfor _ in range(25):\n    faiz(1)\nfaiz.cagri",
            "try:\n    hata_ver()\nexcept RuntimeError:\n    pass\nhata_ver.cagri", "faiz.sifirla()\nfaiz(1)\n(faiz.cagri, hata_ver.cagri)",
            "@sayac\ndef topla(*a, **k):\n    return sum(a) + sum(k.values())\n(topla(1, 2, x=3), topla.cagri)"],
    start='import functools\n\ndef sayac(f):\n    # sarmalayıcı yaz, öznitelikleri ekle ve döndür\n    pass\n',
    sol='''
import functools

def sayac(f):
    @functools.wraps(f)
    def sarmalayici(*args, **kwargs):
        sarmalayici.cagri += 1
        return f(*args, **kwargs)

    def sifirla():
        sarmalayici.cagri = 0

    sarmalayici.cagri = 0
    sarmalayici.sifirla = sifirla
    return sarmalayici
''',
    editorial=ed('Dekoratör, fonksiyon alıp fonksiyon döndüren bir fonksiyondur: `@sayac` yazmak `faiz = sayac(faiz)` demektir. Sarmalayıcı `*args, **kwargs` ile her imzayı kabul eder. Fonksiyonlar nesnedir; üzerlerine öznitelik ekleyebilirsin (`sarmalayici.cagri`). Sayacı çağrıdan <b>önce</b> artırırsan hata veren çağrılar da sayılır. `functools.wraps` ad, belge metni ve `__wrapped__` gibi üst verileri kopyalar.',
                 'Çağrı başına O(1) ek yük.',
                 'Sayacı closure içinde `nonlocal` ile tutup okuma için ayrı bir fonksiyon sunmak da olur; ancak öznitelik dışarıdan okunabilirlik için pratiktir. Sınıf tabanlı dekoratör (`__call__` tanımlı sınıf) de aynı işi yapar.',
                 '`wraps`\'ı unutmak: hata mesajlarında ve belgelerde her şey “sarmalayici” görünür. Sayacı modül düzeyinde tutmak: tüm fonksiyonlar aynı sayacı paylaşır. Sarmalayıcıda `return` yazmayı unutup her zaman `None` döndürmek.'),
    hints=['def sayac(f): içinde @functools.wraps(f) ile def sarmalayici(*args, **kwargs) tanımla.', 'sarmalayici.cagri = 0 ile başlat, çağrıda artır; sifirla için küçük bir iç fonksiyon ekle.']))

probs.append(dict(
    id='a-110', title='Tip denetleyen dekoratör fabrikası', track=F, diff='Orta', tags=['dekoratör fabrikası', 'inspect.signature', '**kwargs'],
    src='Parametreli dekoratör (decorator factory)', mode='func', fn='tip_denetle',
    statement=P('Kanat Havayolları\'nın rezervasyon servisinde yanlış türde argümanlar geç fark ediliyor. Parametre alan bir dekoratör yaz: `@tip_denetle(yolcu=str, koltuk=int)`.',
                '<ul><li>Fonksiyon çağrıldığında, verilen parametre adlarına bağlanan argümanların türü denetlenir; argüman konumsal ya da isimli gelebilir, varsayılan değer kullanılan parametreler de denetlenir.</li><li>Tür uymazsa `TypeError` ve mesaj: `\'koltuk için int bekleniyordu, str geldi\'`.</li><li>Tür bir demet de olabilir (`(int, float)`): mesajda adlar `\'int/float\'` diye birleşir.</li><li>Dekoratöre fonksiyonda olmayan bir parametre adı verilirse, dekoratör <b>uygulanırken</b> `ValueError`.</li><li>`functools.wraps` kullan.</li></ul>',
                'İpucu: `inspect.signature(f).bind(*args, **kwargs)` ve `apply_defaults()` argümanları parametre adlarına bağlar.'),
    constraints='',
    setup='''
@tip_denetle(yolcu=str, koltuk=int, ucret=(int, float))
def rezervasyon(yolcu, koltuk, ucret=0, notlar=''):
    """Rezervasyon özeti."""
    return f'{yolcu}:{koltuk}:{ucret}'
''',
    samples=[("rezervasyon('Ayşe', 12, 1499.9)", ''), ("try:\n    rezervasyon('Ayşe', '12A')\nexcept TypeError as e:\n    m = str(e)\nm", 'Konumsal argüman da denetlenir.')],
    checks=["rezervasyon(koltuk=3, yolcu='Can')", "try:\n    rezervasyon('Can', 3, ucret='bedava')\nexcept TypeError as e:\n    m = str(e)\nm",
            "rezervasyon('Ece', 7, notlar=123)", "rezervasyon.__name__",
            "@tip_denetle(adet=int)\ndef f(adet=None):\n    return adet\ntry:\n    f()\nexcept TypeError as e:\n    m = str(e)\nm",
            "try:\n    rezervasyon(5, 5)\nexcept TypeError as e:\n    m = str(e)\nm"],
    raises=[('ValueError', "@tip_denetle(yok=int)\ndef g(a):\n    return a", 'olmayan parametre'), ('TypeError', "rezervasyon('A', 1, 2, 3, 4)", 'fazla argüman')],
    start='import functools\nimport inspect\n\ndef tip_denetle(**tipler):\n    # dekoratörü döndür\n    pass\n',
    sol='''
import functools
import inspect

def _ad(tip):
    if isinstance(tip, tuple):
        return '/'.join(t.__name__ for t in tip)
    return tip.__name__

def tip_denetle(**tipler):
    def dekorator(f):
        imza = inspect.signature(f)
        for ad in tipler:
            if ad not in imza.parameters:
                raise ValueError(f'{f.__name__} fonksiyonunda {ad} parametresi yok')

        @functools.wraps(f)
        def sarmalayici(*args, **kwargs):
            bag = imza.bind(*args, **kwargs)
            bag.apply_defaults()
            for ad, tip in tipler.items():
                deger = bag.arguments[ad]
                if not isinstance(deger, tip):
                    raise TypeError(f'{ad} için {_ad(tip)} bekleniyordu, {type(deger).__name__} geldi')
            return f(*args, **kwargs)
        return sarmalayici
    return dekorator
''',
    editorial=ed('Parametreli dekoratör üç katmandır: `tip_denetle(**tipler)` → `dekorator(f)` → `sarmalayici(*args, **kwargs)`. Parametre adı kontrolü `dekorator` katmanında yapılır, böylece hata fonksiyon tanımlanırken görülür. `inspect.signature(f).bind(...)` argümanları Python\'un kendi kurallarıyla adlara eşler (fazla/eksik argümanda zaten `TypeError` verir); `apply_defaults()` varsayılanları da ekler. `isinstance` ikinci argüman olarak demet kabul eder.',
                 'İmza dekorasyon anında bir kez çıkarılır; her çağrıda O(p) bağlama ve denetim.',
                 'Tip ipuçlarından (annotations) otomatik denetim yapan kütüphaneler var: `pydantic.validate_call`, `typeguard`. Python tip ipuçlarını çalışma anında denetlemez; bu dekoratör o boşluğu doldurmanın basit bir yolu.',
                 'Yalnız `kwargs`\'a bakıp konumsal argümanları atlamak. `bool`\'un `int` alt sınıfı olduğunu unutmak (`True` int denetimini geçer — burada kabul ediyoruz). İmzayı her çağrıda yeniden çıkarmak (gereksiz maliyet). Üç katmandan birini döndürmeyi unutmak: `@tip_denetle(...)` `None` döndürürse fonksiyon `None` olur.'),
    hints=['Üç katman: tip_denetle(**tipler) → dekorator(f) → sarmalayici(*args, **kwargs).', 'imza.bind(*args, **kwargs) + apply_defaults() sonrası bag.arguments[ad] ile değeri al.']))

probs.append(dict(
    id='a-111', title='Veri temizleme boru hattı', track=F, diff='Orta', tags=['reduce', 'fonksiyon bileşimi', 'partial'],
    src='Function composition / pipe (toolz.pipe benzeri)', mode='func', fn='boru_hatti',
    statement=P('Pusula İK\'nın aday formlarındaki metinler birkaç adımda temizleniyor. Adımları birleştiren bir `boru_hatti(*adimlar)` fonksiyonu yaz: tek argüman alan bir fonksiyon döndürsün ve bu fonksiyon adımları <b>soldan sağa</b> uygulasın.',
                '<ul><li>Bir adım ya bir fonksiyon (`str.strip`) ya da `(fonksiyon, ek_arg1, ...)` demeti olabilir; demet `fonksiyon(deger, ek_arg1, ...)` olarak uygulanır (ör. `(str.replace, \'  \', \' \')`).</li><li>Adım verilmezse kimlik fonksiyonu (değeri aynen döndüren) döner.</li><li>Çağrılabilir olmayan bir adım verilirse `boru_hatti` oluşturulurken `TypeError`.</li><li>`functools.reduce` kullanmayı dene.</li></ul>'),
    constraints='',
    samples=[("temizle = boru_hatti(str.strip, str.lower, (str.replace, ' ', '_'))\ntemizle('  Veri Analisti ')", ''),
             ('boru_hatti()(42)', 'Adım yok: kimlik.')],
    checks=["boru_hatti(lambda x: x + 1, lambda x: x * 2)(3)", "boru_hatti(lambda x: x * 2, lambda x: x + 1)(3)",
            "boru_hatti((round, 2))(3.14159)", "boru_hatti(str.split, len)('ali veli 49 elli')",
            "boru_hatti(sorted, (lambda xs, n: xs[:n], 2))([5, 3, 9, 1])", "p = boru_hatti(abs)\n[p(-1), p(-2)]",
            "boru_hatti(*([lambda x: x + 1] * 1000))(0)"],
    raises=[('TypeError', "boru_hatti(str.strip, 5)", 'çağrılamaz adım'), ('TypeError', "boru_hatti(('metin', 1))", 'demetin başı çağrılamaz')],
    start='from functools import reduce, partial\n\ndef boru_hatti(*adimlar):\n    # kodunu yaz\n    pass\n',
    sol='''
from functools import reduce, partial

def _fonksiyona_cevir(adim):
    if isinstance(adim, tuple):
        f, *ek = adim
        if not callable(f):
            raise TypeError(f'Adım çağrılabilir değil: {f!r}')
        return lambda x: f(x, *ek)
    if not callable(adim):
        raise TypeError(f'Adım çağrılabilir değil: {adim!r}')
    return adim

def boru_hatti(*adimlar):
    fonksiyonlar = [_fonksiyona_cevir(a) for a in adimlar]

    def calistir(deger):
        return reduce(lambda acc, f: f(acc), fonksiyonlar, deger)

    return calistir
''',
    editorial=ed('Adımları baştan (oluşturma anında) normalize et: demetleri `lambda x: f(x, *ek)` biçiminde tek argümanlı fonksiyona çevir, çağrılamayanları reddet. Sonra `reduce(lambda acc, f: f(acc), fonksiyonlar, deger)`: başlangıç değeri `deger`; her adım bir önceki sonucu alır. Boş listede `reduce` başlangıç değerini döndürür — kimlik bedavaya gelir.',
                 'Oluşturma O(k), her çağrı O(k) adım.',
                 'Düz `for f in fonksiyonlar: deger = f(deger)` döngüsü aynı işi yapar ve çoğu ekipte daha okunur bulunur. `functools.partial(f, ...)` argümanları <b>soldan</b> sabitler; burada değer ilk argüman olduğu için `lambda` gerekti. pandas\'ta aynı fikir `df.pipe(f).pipe(g)` olarak vardır.',
                 'Fonksiyonları iç içe bileşik (`f(g(x))`) yazıp sırayı tersine çevirmek. Demetleri her çağrıda yeniden çözmek. `reduce`\'a başlangıç değeri vermeyip ilk fonksiyonu “değer” sanmak. Döngü içinde `lambda x: f(x, *ek)` oluştururken geç bağlama (late binding) tuzağı: burada ayrı bir fonksiyon içinde oluşturduğumuz için her lambda kendi `f`\'ini yakalar.'),
    hints=['Önce her adımı tek argümanlı bir fonksiyona çevir; demet için lambda x: f(x, *ek).', 'reduce(lambda acc, f: f(acc), fonksiyonlar, deger) adımları soldan sağa uygular.']))

probs.append(dict(
    id='a-112', title='Currying: adım adım fiyatlama', track=F, diff='Zor', tags=['curry', 'closure', 'inspect'],
    src='Currying (toolz.curry / Haskell benzeri)', mode='func', fn='curry',
    statement=P('Anadolu Market\'in fiyat motorunda kurallar parça parça uygulanıyor: önce kategori indirimi sabitleniyor, sonra kampanya, en son ürün fiyatı geliyor. Bunun için bir `curry(f)` fonksiyonu yaz.',
                '`curry(f)`, f\'nin <b>varsayılanı olmayan konumsal</b> parametre sayısı (n) kadar argüman toplanana dek yeni fonksiyonlar döndürür; yeterli argüman birikince f\'yi çağırır:',
                '```\n@curry\ndef fiyat(indirim, kdv, tutar):\n    ...\nfiyat(10)(20)(100) == fiyat(10, 20)(100) == fiyat(10)(20, 100) == fiyat(10, 20, 100)\n```',
                '<ul><li>Her ara fonksiyon bağımsızdır: `f10 = fiyat(10)` ile `f10(20)` ve `f10(8)` birbirini etkilemez.</li><li>Toplam argüman n\'yi aşarsa `TypeError`.</li><li>Argümansız çağrı (`g()`) hiçbir şey eklemez, aynı durumu döndürür; n = 0 ise `curry(f)()` f\'yi çağırır.</li><li>İsimli argümanlar desteklenmez; yalnız konumsal.</li><li>`functools.wraps` ile adı koru.</li></ul>'),
    constraints='',
    setup='''
def fiyat(indirim, kdv, tutar):
    return round(tutar * (1 - indirim / 100) * (1 + kdv / 100), 2)

def topla4(a, b, c, d):
    return a + b + c + d
''',
    samples=[('curry(fiyat)(10)(20)(100)', '%10 indirim, %20 KDV, 100 TL.'), ('curry(fiyat)(10, 20)(250)', '')],
    checks=["c = curry(topla4)\n[c(1)(2)(3)(4), c(1, 2)(3, 4), c(1)(2, 3, 4), c(1, 2, 3, 4)]",
            "c = curry(topla4)\nyarim = c(100)\n(yarim(1)(1)(1), yarim(2)(2)(2))", "c = curry(topla4)\nc()(1)()(2, 3)()(4)",
            "curry(lambda: 'hazir')()", "curry(lambda a, b=5: a + b)(1)", "curry(fiyat).__name__",
            "c = curry(topla4)\ns1 = c(1, 2)\ns2 = s1(3)\ns3 = s1(30)\n(s2(4), s3(40))"],
    raises=[('TypeError', 'curry(topla4)(1, 2)(3, 4, 5)', 'fazla argüman'), ('TypeError', 'curry(topla4)(1, 2, 3, 4, 5)', 'tek seferde fazla argüman')],
    start='import functools\nimport inspect\n\ndef curry(f):\n    # kodunu yaz\n    pass\n',
    sol='''
import functools
import inspect

def curry(f):
    n = sum(
        1 for p in inspect.signature(f).parameters.values()
        if p.kind in (p.POSITIONAL_ONLY, p.POSITIONAL_OR_KEYWORD) and p.default is p.empty
    )

    def topla(birikmis):
        @functools.wraps(f)
        def ara(*yeni):
            tum = birikmis + yeni
            if len(tum) > n:
                raise TypeError(f'{f.__name__} en fazla {n} argüman alır, {len(tum)} verildi')
            if len(tum) == n:
                return f(*tum)
            return topla(tum)
        return ara

    return topla(())
''',
    editorial=ed('Biriken argümanları <b>değişmez bir demet</b> olarak closure\'da tut. Her çağrı `birikmis + yeni` ile <b>yeni</b> bir demet oluşturup ya f\'yi çağırır ya da bu demeti yakalayan yeni bir ara fonksiyon döndürür. Liste kullansaydın ve `append` etseydin, `f10(20)` ile `f10(8)` aynı listeyi değiştirip birbirini bozardı. Parametre sayısı `inspect.signature` ile bulunur: konumsal ve varsayılanı olmayanlar.',
                 'Her çağrı O(k) (demet kopyası); k = n en fazla birkaç argüman.',
                 '`functools.partial` tek seferde argüman sabitler ama sayıyı takip etmez: `partial(fiyat, 10)(20)` hatadır. `toolz.curry` isimli argümanları da destekleyen olgun bir uygulamadır.',
                 'Biriken argümanları paylaşılan bir listede tutmak (yan etki). n\'yi `f.__code__.co_argcount` ile alıp varsayılanlı parametreleri de saymak. n = 0 durumunda argümansız çağrının f\'yi hiç çağırmaması. Fazla argümanı sessizce kırpmak.'),
    hints=['Biriken argümanları demette tut; her çağrıda birikmis + yeni ile yeni demet oluştur.', 'n\'yi inspect.signature(f).parameters içinden varsayılanı olmayan konumsal parametreleri sayarak bul.']))

# ---------------------------------------------------------------- REGEX
probs.append(dict(
    id='a-113', title='Üyelik formu e-posta denetimi', track=R, diff='Kolay', tags=['re.fullmatch', 'karakter sınıfı', 'doğrulama'],
    src='HackerRank Regex: Validating Email Addresses benzeri', mode='stdin',
    statement=P('Anadolu Market üyelik formunda e-posta adresleri basit kurallarla denetleniyor:',
                '<ul><li>Biçim: `yerel@alan`; tam olarak bir `@`.</li><li><b>Yerel kısım:</b> harf (A–Z, a–z), rakam ve `. _ + -` karakterleri; nokta ile başlayamaz/bitemez, iki nokta yan yana gelemez.</li><li><b>Alan:</b> noktayla ayrılmış en az iki etiket. Etiketler harf, rakam ve `-` içerir; `-` ile başlayamaz/bitemez.</li><li><b>Son etiket</b> (uzantı) yalnız harflerden oluşur ve 2–10 karakterdir.</li></ul>',
                'Her satır için `GECERLI` ya da `GECERSIZ` yaz. Satırın başı ve sonundaki boşluklar adresin parçası değildir.'),
    input='İlk satırda `n`, sonra `n` adres.',
    output='Her adres için bir satır.',
    constraints='1 ≤ n ≤ 10^4, adres uzunluğu ≤ 254',
    samples=[('5\nayse.yilmaz@anadolumarket.com.tr\nmehmet..kaya@ornek.com\n.can@ornek.com\nece+kampanya@posta-kutusu.net\nali@ornek\n', '2: iki nokta yan yana; 3: nokta ile başlıyor; 5: uzantı yok (tek etiket).')],
    hidden=['3\na@b.co\na@b.c\na@b.abcdefghijk\n', '3\nx@-ornek.com\nx@ornek-.com\nx@or-nek.com\n', '2\nx@@ornek.com\n@ornek.com\n',
            '3\nx.@ornek.com\nx_y-z@sub.ornek.org\nX@ORNEK.COM\n', '2\nçağrı@ornek.com\nx@ornek.c0m\n', '2\n   bosluk@ornek.com   \nara bosluk@ornek.com\n',
            '2\nx@ornek..com\nx@ornek.com.\n',
            {'gen': 'import random\nrandom.seed(113)\nh = "abcXYZ019._+-@"\nn = 10000\nprint(n)\nfor _ in range(n):\n    if random.random() < 0.5:\n        print("".join(random.choice(h) for _ in range(random.randint(1, 30))))\n    else:\n        print("kullanici" + str(random.randint(1, 999)) + "@ornek" + random.choice(["", "-tr"]) + "." + random.choice(["com", "net", "com.tr", "x"]))'}],
    start='import re\n\nn = int(input())\nfor _ in range(n):\n    adres = input().strip()\n    # kodunu yaz\n',
    sol=r'''
import re

YEREL = r'[A-Za-z0-9_+-]+(?:\.[A-Za-z0-9_+-]+)*'
ETIKET = r'[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?'
DESEN = re.compile(YEREL + '@' + r'(?:' + ETIKET + r'\.)+' + r'[A-Za-z]{2,10}')

n = int(input())
for _ in range(n):
    adres = input().strip()
    print('GECERLI' if DESEN.fullmatch(adres) else 'GECERSIZ')
''',
    editorial=ed('Kuralları küçük parçalara böl ve birleştir. Yerel kısım: “nokta içermeyen blok, ardından sıfır ya da daha fazla `.blok`” — bu kalıp başta/sonda nokta ve çift noktayı kendiliğinden engeller. Etiket: harf/rakamla başlar, isteğe bağlı orta kısım harf/rakamla biter. Alan: bir ya da daha fazla `etiket.` + harf uzantısı. `re.fullmatch` tüm metnin eşleşmesini ister; `re.match` yalnız başı kontrol eder.',
                 'Adres başına doğrusal; desen bir kez `re.compile` edilir.',
                 'Gerçek hayatta e-posta doğrulamanın tek güvenilir yolu doğrulama bağlantısı göndermektir; RFC 5322\'nin tamamını regex ile yazmak pratik değildir. `email-validator` kütüphanesi IDN ve DNS kontrolleri yapar.',
                 '`re.match` + `$` unutmak (sonu denetlenmez). Noktayı kaçırmadan `.` yazmak (her karakterle eşleşir). `\\w` kullanmak: Python 3\'te Unicode harfleri (ç, ğ) ve `_` de kapsar, kurala aykırı.'),
    hints=['Yerel kısım: blok(\\.blok)* kalıbı çift noktayı ve uçtaki noktayı engeller.', 're.fullmatch tüm metni eşleştirir; \\w yerine açık karakter sınıfı [A-Za-z0-9] kullan.']))

probs.append(dict(
    id='a-114', title='Sipariş kodlarını ayıkla', track=R, diff='Kolay', tags=['re.findall', 'sınır', 'tekrarsız'],
    src='Metinden desen çıkarma (findall + word boundary)', mode='func', fn='siparis_kodlari',
    statement=P('Anadolu Market müşteri hizmetleri e-postalarında sipariş kodları `AM-` ve ardından tam <b>6 rakam</b> biçimindedir (ör. `AM-204815`). Kodu otomatik bulup kayda bağlamak istiyorsun.',
                '`siparis_kodlari(metin)` fonksiyonunu yaz: metinde geçen geçerli kodları <b>ilk görülme sırasıyla ve tekrarsız</b> liste olarak döndürsün. Kurallar: büyük harf `AM`; kodun hemen öncesinde ya da sonrasında harf, rakam ya da `_` olmamalı (ör. `XAM-123456`, `AM-1234567` kod değildir).'),
    constraints='len(metin) ≤ 10^6',
    samples=[("siparis_kodlari('Merhaba, AM-204815 ve AM-118200 nolu siparişlerim gelmedi. AM-204815 acil!')", 'Tekrar eden kod bir kez.')],
    checks=["siparis_kodlari('')", "siparis_kodlari('am-123456 AM-12345 AM-1234567')", "siparis_kodlari('(AM-000001), AM-999999.')",
            "siparis_kodlari('XAM-123456 AM-123456X AM-123456_ _AM-654321')", "siparis_kodlari('AM-111111AM-222222')",
            "siparis_kodlari('Kod:AM-555555;AM-444444/AM-555555')", "len(siparis_kodlari(' '.join('AM-' + str(i).zfill(6) for i in range(50000))))"],
    start='import re\n\ndef siparis_kodlari(metin):\n    # kodunu yaz\n    pass\n',
    sol=r'''
import re

DESEN = re.compile(r'\bAM-\d{6}\b')

def siparis_kodlari(metin):
    return list(dict.fromkeys(DESEN.findall(metin)))
''',
    editorial=ed('`\\b` kelime sınırıdır: bir yanda kelime karakteri (harf, rakam, `_`), diğer yanda kelime olmayan karakter ya da metnin başı/sonu olmalı. `\\bAM-\\d{6}\\b` hem öncesine yapışık harfi hem de 7. rakamı engeller. `findall` tüm eşleşmeleri sırayla verir; `dict.fromkeys` sırayı koruyarak tekrarları atar (sözlükler ekleme sırasını korur).',
                 'O(n).',
                 'Kümeyle tekrar atmak (`set`) sırayı bozar. Ara yollar: `seen` kümesi + liste döngüsü. Sınırları daha net vermek için bakınma (lookaround) da kullanılabilir: `(?&lt;![A-Za-z0-9_])AM-\\d{6}(?!\\d)`.',
                 '`\\b` olmadan `AM-\\d{6}` yazmak: `AM-1234567` içinden ilk 6 rakamı “kod” diye alır. `AM-111111AM-222222` gibi yapışık metinde ikisini de saymak (ilkinin sonunda kelime sınırı yok). Ham string (`r\'...\'`) kullanmamak: `\'\\b\'` Python\'da geri silme (backspace) karakteridir!'),
    hints=['\\b kelime sınırı; \\d{6} tam altı rakam.', 'list(dict.fromkeys(liste)) sırayı koruyarak tekrarları atar.']))

probs.append(dict(
    id='a-115', title='Mesajlardaki tutarların toplamı', track=R, diff='Kolay', tags=['re.finditer', 'gruplar', 'Türkçe sayı biçimi'],
    src='Para birimi ayrıştırma (Türkçe yerel biçim)', mode='func', fn='tutar_topla',
    statement=P('Lezzet Kurye müşteri temsilcileri iade notlarında tutarları Türkçe biçimde yazıyor: binlik ayırıcı nokta, ondalık ayırıcı virgül, sonda `TL` (aradaki boşluk isteğe bağlı). Örnekler: `1.250,50 TL`, `99 TL`, `12,5TL`, `2.000TL`.',
                '`tutar_topla(metin)` metindeki tüm tutarların toplamını 2 ondalığa yuvarlanmış `float` olarak döndürsün. Kurallar: binlik gruplar tam 3 rakamdır (`1.25 TL` geçersiz bir binlik olduğu için tutar sayılmaz); ondalık kısım 1 ya da 2 rakam; tutarın hemen önünde rakam, nokta ya da virgül olmamalı; `TL`den sonra harf gelmemeli (`TLX` sayılmaz).'),
    constraints='len(metin) ≤ 10^5',
    samples=[("tutar_topla('Sipariş 1.250,50 TL idi, 99 TL iade edildi, kalan 12,5TL.')", '1250.50 + 99 + 12.50'), ("tutar_topla('tutar yok')", '')],
    checks=["tutar_topla('2.000TL ve 1.000.000 TL')", "tutar_topla('1.25 TL')", "tutar_topla('0,99 TL + 0,01 TL')", "tutar_topla('10 TLX 20 TL')",
            "tutar_topla('1234 TL ve 1.234 TL')", "tutar_topla('12,345 TL')", "tutar_topla('Toplam: 7,05 TL.')", "tutar_topla('Kod: B-1.000 TL ve 5 TL')"],
    start='import re\n\ndef tutar_topla(metin):\n    # kodunu yaz\n    pass\n',
    sol=r'''
import re

DESEN = re.compile(r'(?<![\d.,])(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?\s?TL(?![A-Za-z])')

def tutar_topla(metin):
    toplam = 0.0
    for m in DESEN.finditer(metin):
        tam = int(m.group(1).replace('.', ''))
        ondalik = (m.group(2) or '0').ljust(2, '0')
        toplam += tam + int(ondalik) / 100
    return round(toplam, 2)
''',
    editorial=ed('Desen: tam kısım ya binlik gruplu (`\\d{1,3}(?:\\.\\d{3})+`) ya düz (`\\d+`); ardından isteğe bağlı `,dd` ve `\\s?TL`. Sol tarafta rakam, nokta ya da virgül olmamasını `(?&lt;![\\d.,])` arkaya bakma (negative lookbehind), `TL`den sonra harf olmamasını `(?![A-Za-z])` ileriye bakma ile sağlarsın. Gruplarla parçaları al: tam kısımdan noktaları sil, ondalığı iki haneye tamamla (`,5` → 50 kuruş).',
                 'O(n).',
                 'Metni `float(\'1.250,50\'.replace(\'.\', \'\').replace(\',\', \'.\'))` ile de çevirebilirsin. Kuruş hassasiyeti için toplamı tam sayı kuruşla tutmak (a-100) ya da `Decimal` daha güvenlidir. `babel.numbers.parse_decimal(\'1.250,50\', locale=\'tr_TR\')` yerel biçimleri çözer.',
                 '`12,345 TL`\'yi 12.345 diye okumak: ondalık en fazla 2 hane; desen eşleşmez çünkü `,34`ten sonra `5` gelir ve `TL` beklenir. Ondalık `,5`\'i 5 kuruş saymak. `|` alternatiflerinde kısa olanı önce yazmak (`\\d+|...`): regex ilk uyan alternatifi seçer ve `1.000`\'in yalnız `1`\'ini alabilir.'),
    hints=['Tam kısım için (\\d{1,3}(?:\\.\\d{3})+|\\d+) — uzun alternatif önce.', 'Ondalık grubu ,5 ise 50 kuruş: ljust(2, \'0\') ile tamamla.']))

probs.append(dict(
    id='a-116', title='Plaka doğrulama ve biçimleme', track=R, diff='Orta', tags=['regex grupları', 'alternatifler', 'normalizasyon'],
    src='Türkiye plaka biçimi doğrulama', mode='stdin',
    statement=P('Pedal İzmir otoparkındaki kamera sistemi plakaları farklı biçimlerde okuyor: küçük harf, fazla boşluk ya da hiç boşluk olmayabilir. Kurallar:',
                '<ul><li>İl kodu: `01`–`81` (iki hane).</li><li>Harf grubu: 1–3 büyük harf; yalnız A–Z, ama `Q`, `W`, `X` <b>yok</b>.</li><li>Rakam grubu: 1 harf → 4 rakam; 2 harf → 3 ya da 4 rakam; 3 harf → 2 ya da 3 rakam.</li></ul>',
                'Önce tüm boşlukları sil ve büyük harfe çevir. Geçerliyse `İL HARF RAKAM` biçiminde tek boşlukla yaz (ör. `35 ABC 123`), değilse `GECERSIZ`.'),
    input='İlk satırda `n`, sonra `n` satır.',
    output='Her satır için biçimlenmiş plaka ya da `GECERSIZ`.',
    constraints='1 ≤ n ≤ 10^4',
    samples=[('5\n35 abc 123\n34A1234\n06  BK 4521\n82 AB 123\n35 AQ 123\n', '4: il kodu 82 yok; 5: Q harfi kullanılmaz.')],
    hidden=['4\n00 A 1234\n01 A 1234\n81 ZZ 99\n81 ZZ 999\n', '4\n34 A 123\n34 A 12345\n34 AB 12\n34 ABC 1234\n', '3\n34ABCD12\n3 4 A B 1 2 3\n35 abc 12\n',
            '3\n09 Y 0001\n10 XY 123\n70 W 1234\n', '2\n34-AB-123\n34 ab 1234\n', '2\n  45  r  1000  \n100 A 1234\n',
            {'gen': 'import random\nrandom.seed(116)\nn = 10000\nprint(n)\nh = "ABCDEFGHIJKLMNOPRSTUVYZQWX"\nfor _ in range(n):\n    il = str(random.randint(0, 90)).zfill(2)\n    hr = "".join(random.choice(h) for _ in range(random.randint(1, 4)))\n    rk = "".join(random.choice("0123456789") for _ in range(random.randint(1, 5)))\n    print(il, hr.lower() if random.random() < 0.3 else hr, rk)'}],
    start='import re\n\nn = int(input())\nfor _ in range(n):\n    plaka = input()\n    # kodunu yaz\n',
    sol=r'''
import re

HARF = '[A-PR-VYZ]'
DESEN = re.compile(
    r'(0[1-9]|[1-7]\d|8[01])'
    r'(?:(' + HARF + r')(\d{4})'
    r'|(' + HARF + r'{2})(\d{3,4})'
    r'|(' + HARF + r'{3})(\d{2,3}))'
)

n = int(input())
for _ in range(n):
    p = re.sub(r'\s+', '', input()).upper()
    m = DESEN.fullmatch(p)
    if not m:
        print('GECERSIZ')
        continue
    il = m.group(1)
    harf = m.group(2) or m.group(4) or m.group(6)
    rakam = m.group(3) or m.group(5) or m.group(7)
    print(il, harf, rakam)
''',
    editorial=ed('Önce normalize et: `re.sub(r\'\\s+\', \'\', s).upper()`. İl kodu için sayısal aralığı regex\'e çevir: `0[1-9]|[1-7]\\d|8[01]`. Harf/rakam kombinasyonları birbirine bağlı olduğu için üç alternatifli bir grup kullan; her alternatifin kendi yakalama grupları vardır ve eşleşmeyenler `None` döner (`or` ile ilk dolu olanı al). Harf sınıfı `[A-PR-VYZ]`: A–P, R–V, Y, Z (Q, W, X dışarıda).',
                 'Satır başına doğrusal.',
                 'İsimli gruplar (`(?P&lt;il&gt;...)`) okunurluğu artırır; ancak Python aynı adı iki alternatifte kullanmaya izin vermez. Alternatif: regex ile kaba biçimi yakala (`(\\d{2})([A-Z]{1,3})(\\d{2,4})`), uzunluk kuralını Python\'da `if` ile denetle — çoğu zaman daha okunur.',
                 'İl kodunu `\\d{2}` ile alıp 00 ve 82–99\'u kabul etmek. Sınıfı `[A-Z]` bırakıp Q/W/X\'i kaçırmak. `fullmatch` yerine `search` kullanıp `34ABCD12` içinden “BCD12”yi geçerli saymak. Büyük harfe çevirmeden önce Türkçe `ı`/`i` gibi harflerin dönüşümünü düşünmemek (burada zaten geçersiz).'),
    hints=['İl kodu: 0[1-9]|[1-7]\\d|8[01]; harf sınıfı: [A-PR-VYZ].', 'Üç alternatif: harf{1}\\d{4} | harf{2}\\d{3,4} | harf{3}\\d{2,3}; dolu grubu or ile seç.']))

probs.append(dict(
    id='a-117', title='Telefon numaralarını standartla', track=R, diff='Orta', tags=['re.finditer', 'bakınma', 'normalizasyon'],
    src='Telefon numarası çıkarma ve E.164 biçimine çevirme', mode='func', fn='telefon_bul',
    statement=P('Pusula İK aday notlarındaki cep telefonlarını CRM\'e <b>E.164</b> biçiminde (`+905321234567`) aktarmak istiyor. Numaralar farklı yazılmış:',
                '`0532 123 45 67`, `+90 (532) 123-45-67`, `5321234567`, `0 532 1234567`, `90 532 123 45 67`',
                '`telefon_bul(metin)` fonksiyonunu yaz. Kurallar:',
                '<ul><li>İsteğe bağlı ön ek: `+90`, `90` ya da `0`, ardından isteğe bağlı tek boşluk.</li><li>Operatör kodu `5` ile başlayan 3 rakamdır, isteğe bağlı parantez içinde.</li><li>Kalan 7 rakam 3-2-2 gruplanabilir; gruplar arasında en fazla bir boşluk ya da `-`.</li><li>Numaranın hemen öncesinde ve sonrasında rakam olmamalı.</li></ul>',
                'Numaraları metindeki sırayla, <b>tekrarsız</b>, E.164 biçiminde liste olarak döndür. Sabit hatlar (ör. `0212 ...`) dahil edilmez.'),
    constraints='len(metin) ≤ 10^5',
    samples=[("telefon_bul('Ayşe: 0532 123 45 67, iş: 0212 555 44 33, yedek +90 (544) 987-65-43')", 'Sabit hat (0212) alınmadı.'),
             ("telefon_bul('Tel 5321234567 / 0 532 1234567')", 'Aynı numara iki kez yazılmış.')],
    checks=["telefon_bul('')", "telefon_bul('90 555 000 11 22 ve +905550001122')", "telefon_bul('05321234567890')",
            "telefon_bul('Sipariş no 1234567890')", "telefon_bul('(505)1112233')", "telefon_bul('0532--123 45 67')",
            "telefon_bul('a+90 542 111 22 33b')", "telefon_bul('0 (533) 444 55 66; 0533 444 5566')"],
    start='import re\n\ndef telefon_bul(metin):\n    # kodunu yaz\n    pass\n',
    sol=r'''
import re

AYRAC = r'[ -]?'
DESEN = re.compile(
    r'(?<!\d)(?:\+?90|0)? ?'
    r'(?:\((5\d{2})\)|(5\d{2}))' + AYRAC +
    r'(\d{3})' + AYRAC + r'(\d{2})' + AYRAC + r'(\d{2})(?!\d)'
)

def telefon_bul(metin):
    sonuc = []
    for m in DESEN.finditer(metin):
        operator = m.group(1) or m.group(2)
        numara = '+90' + operator + m.group(3) + m.group(4) + m.group(5)
        if numara not in sonuc:
            sonuc.append(numara)
    return sonuc
''',
    editorial=ed('Parçalara ayır: `(?&lt;!\\d)` öncesinde rakam yok; ön ek `(?:\\+?90|0)?` ve isteğe bağlı boşluk; operatör kodu parantezli ya da parantezsiz `5\\d{2}` (iki ayrı grup); sonra `[ -]?` ayraçlarıyla 3-2-2 rakam; `(?!\\d)` sonrasında rakam yok. Eşleşmeden yalnız rakam gruplarını alıp `+90` ile birleştir: biçim farklılıkları (boşluk, tire, parantez) kendiliğinden yok olur.',
                 'O(n).',
                 'Önce metindeki tüm rakam dışı karakterleri silip arama yapmak bağlamı (hangi rakamlar yan yana) bozar; doğru yaklaşım eşleşmeyi bulup sonra normalize etmektir. Üretimde `phonenumbers` kütüphanesi (Google libphonenumber) tüm ülke kurallarını bilir.',
                 '`(?&lt;!\\d)` / `(?!\\d)` olmadan uzun rakam dizilerinin (sipariş no) ortasından numara çıkarmak. Ayraçta `[ -]*` kullanıp `0532--123` gibi bozuk yazımları kabul etmek. Tekrarları kümeyle atıp sırayı kaybetmek.'),
    hints=['Operatör kodu için iki alternatif grup: \\((5\\d{2})\\) | (5\\d{2}); hangisi doluysa onu al.', 'Başa (?<!\\d), sona (?!\\d) koy; sonucu \'+90\' + rakam grupları olarak kur.']))

probs.append(dict(
    id='a-118', title='Servis log raporu', track=R, diff='Orta', tags=['isimli gruplar', 'log ayrıştırma', 'Counter'],
    src='Log dosyası ayrıştırma (gerçek DevOps görevi)', mode='stdin',
    statement=P('Anadolu Market\'in mikroservis logları şu biçimde:',
                '```\n2026-03-14 08:15:02 [ERROR] odeme-servisi: Zaman aşımı (1200 ms)\n```',
                'Tarih `YYYY-MM-DD`, saat `SS:DD:ss`, seviye `INFO`, `WARN` ya da `ERROR` (köşeli parantez içinde), servis adı küçük harf/rakam/tire, iki nokta ve boşluktan sonra mesaj. Mesaj isteğe bağlı olarak `(<sayı> ms)` ile biter. Bu biçime uymayan satırlar <b>bozuk</b>tur.',
                'Rapor: seviye sayıları, bozuk satır sayısı, ERROR veren servisler (adet azalan, eşitlikte ad artan) ve süresi en uzun olan satırın servisi ile süresi (eşitlikte ilk görülen).'),
    input='İlk satırda `n`, sonra `n` log satırı.',
    output='```\nINFO a\nWARN b\nERROR c\nBOZUK d\nHATA servis adet      (ERROR veren her servis için)\nEN_YAVAS servis ms     (ya da EN_YAVAS YOK)\n```',
    constraints='1 ≤ n ≤ 10^5',
    samples=[('6\n2026-03-14 08:15:02 [ERROR] odeme-servisi: Zaman aşımı (1200 ms)\n2026-03-14 08:15:03 [INFO] sepet: Ürün eklendi\n2026-03-14 08:16:00 [WARN] stok: Az kaldı (300 ms)\nbu satır bozuk\n2026-03-14 08:17:10 [ERROR] stok: DB bağlantısı yok\n2026-03-14 08:18:00 [ERROR] odeme-servisi: Kart reddedildi (85 ms)\n',
              'odeme-servisi 2 hata, stok 1 hata. En yavaş satır 1200 ms.')],
    hidden=['1\nbozuk\n', '1\n2026-03-14 08:15:02 [INFO] a: b\n', '3\n2026-03-14 08:15:02 [DEBUG] a: b\n2026-03-14 8:15:02 [INFO] a: b\n2026-03-14 08:15:02 [INFO] A: b\n',
            '3\n2026-01-01 00:00:00 [ERROR] b: x (5 ms)\n2026-01-01 00:00:00 [ERROR] a: y (5 ms)\n2026-01-01 00:00:00 [ERROR] c: z\n',
            '2\n2026-01-01 00:00:00 [WARN] api-v2: mesaj (ms)\n2026-01-01 00:00:00 [WARN] api-v2: (12 ms) ortada\n',
            '2\n2026-01-01 00:00:00 [INFO] svc:mesaj\n2026-01-01 00:00:00 [INFO] svc: \n',
            {'gen': 'import random\nrandom.seed(118)\nn = 100000\nprint(n)\nsv = ["odeme", "sepet", "stok", "kargo-api", "kullanici"]\nfor i in range(n):\n    r = random.random()\n    if r < 0.03:\n        print("bozuk satir", i)\n    else:\n        sure = " (" + str(random.randint(1, 5000)) + " ms)" if random.random() < 0.5 else ""\n        print(f"2026-03-{random.randint(10, 28)} {random.randint(10, 23)}:{random.randint(10, 59)}:{random.randint(10, 59)} [{random.choice([\'INFO\', \'INFO\', \'WARN\', \'ERROR\'])}] {random.choice(sv)}: islem {i}{sure}")'}],
    start='import re\nimport sys\n\nsatirlar = sys.stdin.read().split(\'\\n\')\nn = int(satirlar[0])\n# kodunu yaz\n',
    sol=r'''
import re
import sys
from collections import Counter

DESEN = re.compile(
    r'(?P<tarih>\d{4}-\d{2}-\d{2}) (?P<saat>\d{2}:\d{2}:\d{2}) '
    r'\[(?P<seviye>INFO|WARN|ERROR)\] (?P<servis>[a-z0-9-]+): (?P<mesaj>.*?)'
    r'(?: \((?P<ms>\d+) ms\))?'
)

satirlar = sys.stdin.read().split('\n')
n = int(satirlar[0])
seviye = Counter()
hatalar = Counter()
bozuk = 0
en_yavas = None
for satir in satirlar[1:1 + n]:
    m = DESEN.fullmatch(satir)
    if not m:
        bozuk += 1
        continue
    seviye[m['seviye']] += 1
    if m['seviye'] == 'ERROR':
        hatalar[m['servis']] += 1
    if m['ms'] is not None:
        ms = int(m['ms'])
        if en_yavas is None or ms > en_yavas[1]:
            en_yavas = (m['servis'], ms)
for s in ('INFO', 'WARN', 'ERROR'):
    print(s, seviye[s])
print('BOZUK', bozuk)
for servis, adet in sorted(hatalar.items(), key=lambda t: (-t[1], t[0])):
    print('HATA', servis, adet)
print('EN_YAVAS', *(en_yavas if en_yavas else ('YOK',)))
''',
    editorial=ed('İsimli gruplar (`(?P&lt;ad&gt;...)`) deseni belgelendirir ve sonucu `m[\'seviye\']` ile okutur. Mesaj kısmı tembel (`.*?`) olmalı ki sondaki isteğe bağlı `(1200 ms)` grubu mesajın içine yutulmasın; `fullmatch` bütün satırı zorunlu kıldığı için tembel kalıp yine de satır sonuna kadar uzanır. Sayımlar için `Counter`; en yavaş için tek geçişte maksimum takibi.',
                 'O(toplam karakter) + hatalı servislerin sıralaması.',
                 '`re.VERBOSE` bayrağı ile deseni satırlara bölüp yorum ekleyebilirsin. Büyük log dosyalarında dosyayı satır satır okuyup (`for satir in dosya`) bellek dostu işle. Yapılandırılmış log (JSON) kullanmak, regex ihtiyacını baştan ortadan kaldırır.',
                 'Mesajı açgözlü `.*` ile yazmak: `(1200 ms)` mesajın parçası olur ve süre hiç yakalanmaz. Seviyeyi `\\w+` ile alıp DEBUG gibi tanımsız seviyeleri geçerli saymak. Eşitlikte `&gt;=` kullanıp son görüleni seçmek.'),
    hints=['Mesaj için tembel .*? ve sonda isteğe bağlı (?: \\((?P<ms>\\d+) ms\\))? kullan; fullmatch ile tüm satırı eşleştir.', 'Seviye ve hata sayıları için Counter; sıralamada key=lambda t: (-t[1], t[0]).']))

probs.append(dict(
    id='a-119', title='IBAN doğrulama ve biçimleme', track=R, diff='Zor', tags=['regex', 'mod 97', 'ISO 13616'],
    src='IBAN doğrulama (ISO 13616 mod-97 algoritması)', mode='func', fn='iban_dogrula',
    statement=P('Ilgaz Bank\'ın havale ekranında IBAN alanı yazarken denetlenecek. Türkiye IBAN\'ı 26 karakterdir:',
                '`TR` + 2 kontrol hanesi + 5 hane banka kodu + 1 hane rezerv (<b>0</b> olmalı) + 16 hane hesap numarası.',
                'Doğrulama adımları (ISO 13616):',
                '<ol><li>Tüm boşlukları sil, büyük harfe çevir. Biçim `TR` + 24 rakam olmalı ve rezerv hanesi (11. karakter) `0` olmalı.</li><li>İlk 4 karakteri sona taşı.</li><li>Her harfi sayıya çevir: A = 10, B = 11, … Z = 35.</li><li>Ortaya çıkan sayının 97\'ye bölümünden kalan <b>1</b> ise IBAN geçerlidir.</li></ol>',
                'İki fonksiyon yaz: `iban_dogrula(metin)` → `True`/`False`; `iban_bicimle(metin)` → geçerliyse 4\'erli gruplanmış metin (`\'TR33 0006 1005 1978 6457 8413 26\'`), değilse `ValueError`.'),
    constraints='',
    samples=[("iban_dogrula('TR33 0006 1005 1978 6457 8413 26')", ''), ("iban_dogrula('TR34 0006 1005 1978 6457 8413 26')", 'Kontrol hanesi tutmuyor.'),
             ("iban_bicimle('tr690001000000000000000000')", 'Küçük harf ve boşluksuz giriş de kabul.')],
    checks=["iban_dogrula('TR470006200111100006299999')", "iban_dogrula('TR97 0012 3450 9000 0000 0123 45')", "iban_dogrula('TR33000610051978645784132')",
            "iban_dogrula('DE89370400440532013000')", "iban_dogrula('TR33 0006 1005 1978 6457 8413 2X')", "iban_dogrula('')",
            "iban_dogrula('  tr33 0006 1005 1978 6457 8413 26  ')", "iban_bicimle('TR47 00062001111 0000 6299999')"],
    raises=[('ValueError', "iban_bicimle('TR34 0006 1005 1978 6457 8413 26')", 'geçersiz IBAN')],
    start='import re\n\ndef iban_dogrula(metin):\n    # kodunu yaz\n    pass\n\ndef iban_bicimle(metin):\n    pass\n',
    sol=r'''
import re

DESEN = re.compile(r'TR\d{2}\d{5}0\d{16}')

def _temizle(metin):
    return re.sub(r'\s+', '', metin).upper()

def iban_dogrula(metin):
    iban = _temizle(metin)
    if not DESEN.fullmatch(iban):
        return False
    yeniden = iban[4:] + iban[:4]
    sayi = ''.join(str(int(c, 36)) for c in yeniden)
    return int(sayi) % 97 == 1

def iban_bicimle(metin):
    if not iban_dogrula(metin):
        raise ValueError('Geçersiz IBAN')
    iban = _temizle(metin)
    return ' '.join(re.findall(r'.{1,4}', iban))
''',
    editorial=ed('İki katmanlı doğrulama: önce regex ile <b>biçim</b> (`TR\\d{2}\\d{5}0\\d{16}` — rezerv hanesi doğrudan desende `0`), sonra mod-97 ile <b>sağlama</b> (checksum). Harf→sayı dönüşümü için hile: `int(\'T\', 36)` = 29 — 36 tabanında A–Z zaten 10–35\'tir. Python tam sayıları sınırsız olduğu için 30 haneli sayıyı doğrudan `% 97` ile işleyebilirsin. Gruplama için `re.findall(r\'.{1,4}\', iban)`.',
                 'O(L), L = 26.',
                 'Sınırlı tam sayılı dillerde sayı parça parça işlenir: `kalan = (kalan * 10 + rakam) % 97`. Tüm ülkeler için `schwifty` ya da `python-stdnum` kütüphaneleri ülke uzunluk tablolarını da bilir.',
                 'İlk 4 karakteri sona taşımayı unutmak. Harfleri `ord(c) - 64` ile 1–26 diye çevirmek (doğrusu 10–35). Kalanın 0 olmasını beklemek (1 olmalı). Yalnız regex ile doğrulayıp sağlamayı atlamak: tek hane hatalarını yakalayamazsın.'),
    hints=['Biçim: TR\\d{2}\\d{5}0\\d{16}; sağlama: ilk 4 karakteri sona al, harfleri int(c, 36) ile çevir.', 'Oluşan sayının % 97 sonucu 1 olmalı; gruplama için re.findall(r\'.{1,4}\', iban).']))

probs.append(dict(
    id='a-120', title='Bildirim şablon motoru', track=R, diff='Zor', tags=['re.sub', 'geri çağırma', 'isimli gruplar'],
    src='Mini şablon motoru (Jinja2/Mustache benzeri)', mode='func', fn='sablon_doldur',
    statement=P('Lezzet Kurye SMS bildirimleri şablonlardan üretiliyor: `Merhaba {{ musteri.ad | buyuk }}, {{ tutar | para }} tutarlı siparişin yolda.`',
                '`sablon_doldur(sablon, veri)` fonksiyonunu `re.sub` + fonksiyon (geri çağırma) ile yaz:',
                '<ul><li>Yer tutucu: `{{` + isteğe bağlı boşluk + anahtar + isteğe bağlı `| filtre` (ya da `| filtre:arguman`) + isteğe bağlı boşluk + `}}`.</li><li>Anahtar harf/`_` ile başlar; harf, rakam, `_` ve noktalar içerebilir. Nokta iç içe sözlüklere iner: `musteri.ad` → `veri[\'musteri\'][\'ad\']`.</li><li>Filtreler: `buyuk` (Türkçe kurala uygun büyük harf: `i`→`İ`, `ı`→`I`), `para` (sayıyı `1.250,50 TL` biçimine), `varsayilan:metin` (anahtar yoksa `metin`).</li><li>Anahtar yoksa ve `varsayilan` yoksa `KeyError`; bilinmeyen filtre `ValueError`.</li><li>Kalıba uymayan süslü parantezler olduğu gibi kalır.</li></ul>'),
    constraints='',
    samples=[("sablon_doldur('Merhaba {{ musteri.ad | buyuk }}, {{tutar|para}} tutarlı siparişin yolda.', {'musteri': {'ad': 'İlknur ılık'}, 'tutar': 1250.5})", ''),
             ("sablon_doldur('Kurye: {{ kurye | varsayilan:atanmadı }}', {})", 'Anahtar yok, varsayılan kullanıldı.')],
    checks=["sablon_doldur('Düz metin', {})", "sablon_doldur('{{a}}{{ a }}{{  a  }}', {'a': 7})", "sablon_doldur('{{ x | para }}', {'x': 0.5})",
            "sablon_doldur('{{ x | para }}', {'x': 1234567.891})", "sablon_doldur('{ tek } ve {{ }} ve {{1a}}', {})",
            "sablon_doldur('{{ s.a.b }}', {'s': {'a': {'b': 'derin'}}})", "sablon_doldur('{{ ad|buyuk }}', {'ad': 'çiğdem işık'})",
            "sablon_doldur('{{ k | varsayilan:yok }}', {'k': 'var'})"],
    raises=[('KeyError', "sablon_doldur('{{ eksik }}', {})", 'eksik anahtar'), ('ValueError', "sablon_doldur('{{ a | ters }}', {'a': 'x'})", 'bilinmeyen filtre'),
            ('KeyError', "sablon_doldur('{{ m.yok }}', {'m': {}})", 'iç içe eksik anahtar')],
    start='import re\n\ndef sablon_doldur(sablon, veri):\n    # kodunu yaz\n    pass\n',
    sol=r'''
import re

DESEN = re.compile(
    r'\{\{\s*(?P<anahtar>[A-Za-z_][\w.]*)\s*'
    r'(?:\|\s*(?P<filtre>\w+)(?::(?P<arg>[^}]*?))?\s*)?\}\}'
)

def _bul(veri, anahtar):
    deger = veri
    for parca in anahtar.split('.'):
        deger = deger[parca]
    return deger

def _buyuk(metin):
    return str(metin).replace('i', 'İ').replace('ı', 'I').upper()

def _para(sayi):
    kurus = round(float(sayi) * 100)
    isaret = '-' if kurus < 0 else ''
    lira, k = divmod(abs(kurus), 100)
    return isaret + f'{lira:,}'.replace(',', '.') + f',{k:02d} TL'

def sablon_doldur(sablon, veri):
    def degistir(m):
        anahtar, filtre, arg = m['anahtar'], m['filtre'], m['arg']
        if filtre not in (None, 'buyuk', 'para', 'varsayilan'):
            raise ValueError(f'Bilinmeyen filtre: {filtre}')
        try:
            deger = _bul(veri, anahtar)
        except (KeyError, TypeError):
            if filtre == 'varsayilan':
                return arg or ''
            raise KeyError(anahtar)
        if filtre == 'buyuk':
            return _buyuk(deger)
        if filtre == 'para':
            return _para(deger)
        return str(deger)
    return DESEN.sub(degistir, sablon)
''',
    editorial=ed('`re.sub(desen, fonksiyon, metin)` her eşleşme için fonksiyonu çağırır ve dönen metni yerine koyar: koşullu değiştirmenin en güçlü yolu. İsimli gruplar anahtar, filtre ve argümanı ayırır. Süslü parantezler regex\'te özel anlam taşıdığı için kaçırılır (`\\{\\{`). Noktalı anahtarlar `split(\'.\')` ile adım adım sözlükte ilerletilir. Türkçe büyük harf için önce `i`→`İ`, `ı`→`I` dönüşümü, sonra `upper()`; Python\'un `upper()`\'ı yerel ayardan bağımsızdır ve `i`\'yi `I` yapar.',
                 'O(n + çıktı uzunluğu).',
                 'Gerçek projede `jinja2` kullan: filtreler, döngüler, otomatik HTML kaçışı (XSS koruması) hazırdır. Standart kütüphanede `string.Template` (`$ad`) basit yer tutucular için yeterlidir.',
                 'Geri çağırma yerine `str.replace` döngüsü kurmak: filtreler ve boşluk varyasyonları için kırılgan. Açgözlü `.*` ile `{{a}} ve {{b}}`\'yi tek eşleşme sanmak. `\'i\'.upper()` sonucunun Türkçede yanlış (`I`) olduğunu unutmak. Hata türünü kaybetmek: eksik anahtarda yakalanan iç hatayı `KeyError(anahtar)` olarak yeniden fırlatmak çağırana hangi anahtarın eksik olduğunu söyler.'),
    hints=['re.sub\'a ikinci argüman olarak fonksiyon ver; m[\'anahtar\'], m[\'filtre\'], m[\'arg\'] ile parçaları oku.', 'İç içe anahtar için for parca in anahtar.split(\'.\'): deger = deger[parca].']))

emit('/home/claude/py/v3/a2/arena_03.js', probs)
