(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
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
  }
);
})(window);
