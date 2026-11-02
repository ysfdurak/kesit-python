html = f'''
<h2>Python 3.12 tip sözdizimi</h2>
<p>Derste <code>TypeVar</code> ve <code>Generic</code> ile generic yazdın. Python 3.12 (PEP 695) aynı şeyi çok daha kısa yazmanı sağlar: tip parametresi köşeli parantezle fonksiyonun ya da sınıfın adının yanına yazılır, tip takma adı (type alias) için <code>type</code> deyimi gelir. Eski yazım çalışmaya devam eder; yeni projede yeni yazımı, 3.11 ve öncesini destekleyen kütüphanede eskisini kullan.</p>
<div class="tbl-wrap"><table>
<tr><th>Amaç</th><th>Eski yazım (3.8+)</th><th>3.12 yazımı</th></tr>
<tr><td>Generic fonksiyon</td><td><code>T = TypeVar("T")</code><br><code>def ilk(x: list[T]) -&gt; T</code></td><td><code>def ilk[T](x: list[T]) -&gt; T</code></td></tr>
<tr><td>Generic sınıf</td><td><code>class Kutu(Generic[T])</code></td><td><code>class Kutu[T]:</code></td></tr>
<tr><td>Üst sınır (bound)</td><td><code>TypeVar("N", bound=Sayi)</code></td><td><code>def f[N: Sayi](x: N)</code></td></tr>
<tr><td>Kısıtlı seçenek</td><td><code>TypeVar("S", int, float)</code></td><td><code>def f[S: (int, float)](x: S)</code></td></tr>
<tr><td>Tip takma adı</td><td><code>Tutar: TypeAlias = int | float</code></td><td><code>type Tutar = int | float</code></td></tr>
</table></div>
{pre("""
from collections.abc import Iterable, Callable

type Tutar = int | float
type Kural[T] = Callable[[T], bool]

def ilk_uygun[T](ogeler: Iterable[T], kural: Kural[T]) -> T | None:
    for x in ogeler:
        if kural(x):
            return x
    return None

class Kutu[T]:
    def __init__(self, icerik: T) -> None:
        self.icerik = icerik

print(ilk_uygun([120, 900, 4500], lambda t: t > 500))
print(Tutar.__value__, Kutu.__type_params__, ilk_uygun.__type_params__)
""")}

<h2>Varyans: list[int] neden list[float] değildir?</h2>
<p><code>int</code>, <code>float</code> beklenen yere verilebilir. Ama <code>list[int]</code>, <code>list[float]</code> beklenen yere verilemez: fonksiyon listeye <code>3.5</code> eklerse senin "tamsayı listen" bozulur. Değiştirilebilir kaplar bu yüzden <b>değişmez (invariant)</b>dir. Yalnız okunan kaplar (<code>Sequence</code>, <code>Mapping</code>, <code>Iterable</code>) <b>eşdeğişkendir (covariant)</b>: <code>Sequence[int]</code>, <code>Sequence[float]</code> yerine geçer. Kural: fonksiyon parametresinde ihtiyacın olan <b>en dar yeteneği</b> iste; yalnız okuyorsan <code>list</code> değil <code>Sequence</code>/<code>Iterable</code> yaz, böylece çağıran demet, liste ya da üreteç verebilir.</p>
{precode("""
def ortalama(tutarlar: list[float]) -> float: ...
def ortalama2(tutarlar: Sequence[float]) -> float: ...

adetler: list[int] = [3, 5, 8]
ortalama(adetler)    # mypy: Argument 1 has incompatible type "list[int]"; expected "list[float]"
ortalama2(adetler)   # geçerli: Sequence eşdeğişkendir
""")}

<h2>Küçük ama değerli araçlar</h2>
<div class="tbl-wrap"><table>
<tr><th>Araç</th><th>Ne söyler?</th><th>Çalışma anında etkisi</th></tr>
<tr><td><code>Final</code></td><td>Bu ad yeniden atanmamalı (sabit)</td><td>Yok; yalnız denetleyici uyarır</td></tr>
<tr><td><code>ClassVar[int]</code></td><td>Sınıf düzeyi alan, örnek alanı değil</td><td>dataclass bu alanı alan saymaz</td></tr>
<tr><td><code>Self</code></td><td>Metot kendi sınıfının (alt sınıf dahil) örneğini döndürür</td><td>Yok</td></tr>
<tr><td><code>Annotated[int, ...]</code></td><td>Tipe ek bilgi (metadata) iliştirir</td><td><code>get_type_hints(..., include_extras=True)</code> ile okunur; pydantic ve FastAPI kullanır</td></tr>
<tr><td><code>TypeGuard[X]</code> / <code>TypeIs[X]</code></td><td>bool dönen fonksiyon, True ise argüman X'tir</td><td>Yok; <code>TypeIs</code> 3.13+ (öncesinde <code>typing_extensions</code>)</td></tr>
<tr><td><code>assert_never(x)</code></td><td>Bu satıra hiçbir tip ulaşamamalı</td><td>Ulaşılırsa <code>AssertionError</code></td></tr>
<tr><td><code>NotRequired[...]</code></td><td>TypedDict'te isteğe bağlı anahtar</td><td><code>__optional_keys__</code>'ta görünür</td></tr>
</table></div>
{pre("""
from typing import Annotated, Literal, assert_never, get_type_hints
from dataclasses import dataclass

@dataclass(frozen=True)
class Aralik:
    alt: float
    ust: float

def faiz(oran: Annotated[float, Aralik(0, 0.6)], ay: int) -> float:
    return round(oran / 12 * ay, 4)

ipucu = get_type_hints(faiz, include_extras=True)["oran"]
print(ipucu.__origin__, ipucu.__metadata__)

type Kanal = Literal["sube", "mobil", "atm"]

def komisyon(kanal: Kanal) -> float:
    match kanal:
        case "sube":
            return 5.0
        case "mobil":
            return 0.0
        case "atm":
            return 2.5
        case _:
            assert_never(kanal)   # yeni kanal eklenip burası unutulursa mypy hata verir

print(komisyon("atm"))
try:
    komisyon("faks")              # tip denetleyici bunu zaten reddeder
except AssertionError as h:
    print("AssertionError:", str(h)[:30])
""")}

<h3>Self ve ClassVar: akıcı sınıflarda doğru dönüş tipi</h3>
<p>Bir metot <code>return self</code> yapıyorsa dönüş tipini sınıf adıyla yazmak alt sınıflarda yanlış olur: <code>OzelSorgu().filtre(...)</code> tip denetleyiciye göre <code>Sorgu</code> döner ve alt sınıfın metotları "yok" görünür. <code>Self</code> "hangi sınıftan çağrıldıysa o" demektir. <code>ClassVar</code> ise alanın sınıfa ait olduğunu söyler; dataclass onu kurucu parametresi yapmaz.</p>
{pre("""
from dataclasses import dataclass, field, fields
from typing import ClassVar, Self

@dataclass
class Sorgu:
    tablo: str
    kosullar: list[str] = field(default_factory=list)
    olusturulan: ClassVar[int] = 0          # alan değil, sınıf sayacı

    def __post_init__(self) -> None:
        Sorgu.olusturulan += 1

    def filtre(self, kosul: str) -> Self:
        self.kosullar.append(kosul)
        return self

class SiparisSorgusu(Sorgu):
    def buyukler(self) -> Self:
        return self.filtre("tutar > 1000")

s = SiparisSorgusu("siparis").filtre("sehir = 'İzmir'").buyukler()
print(type(s).__name__, s.kosullar, Sorgu.olusturulan)
print("kurucu alanları:", [f.name for f in fields(Sorgu)])   # ClassVar yok
""")}

<h2>mypy'ı projeye kurmak</h2>
<p>Tip ipuçları ancak bir denetleyici çalıştırıldığında işe yarar. Aşağıdaki adımları kendi bilgisayarında, projenin sanal ortamında uygula (tarayıcıda çalışmaz).</p>
{precode("""
pip install mypy                 # ya da: pip install pyright
mypy src/                        # klasörü denetle
mypy --strict src/               # en sıkı mod: tipsiz fonksiyon, Any sızıntısı yasak

# pyproject.toml
[tool.mypy]
python_version = "3.12"
strict = true
warn_unused_ignores = true
[[tool.mypy.overrides]]
module = ["eski_modul.*"]
ignore_errors = true             # eski kodu kademeli tiplemek için

# kodun içinde
reveal_type(sonuc)               # mypy çıktısında çıkarılan tipi gösterir
x = eski_fn()  # type: ignore[no-untyped-call]   # her zaman hata koduyla sustur
""")}
<div class="tbl-wrap"><table>
<tr><th>mypy mesajı</th><th>Anlamı</th><th>Çözüm</th></tr>
<tr><td><code>Library stubs not installed for "requests"</code></td><td>Paketin tip bilgisi ayrı dağıtılıyor</td><td><code>pip install types-requests</code> ya da <code>mypy --install-types</code></td></tr>
<tr><td><code>Item "None" of "X | None" has no attribute ...</code></td><td>Değer None olabilir, kontrol yok</td><td><code>if x is None: ...</code> ile daralt ya da erken dön</td></tr>
<tr><td><code>Incompatible types in assignment</code></td><td>Değişkenin ilk tipi başka</td><td>Değişkeni baştan geniş tiple bildir ya da yeni ad kullan</td></tr>
<tr><td><code>Function is missing a type annotation</code></td><td><code>--strict</code> tipsiz fonksiyona izin vermez</td><td>Parametre ve dönüş tiplerini ekle</td></tr>
<tr><td><code>Returning Any from function declared to return "int"</code></td><td><code>json.loads</code> gibi Any dönen değer sızıyor</td><td>Sınırda doğrula (TypedDict/pydantic) ya da <code>cast</code></td></tr>
</table></div>
<div class="tip"><b>Kademeli geçiş</b>Büyük bir kod tabanına bir günde <code>--strict</code> uygulanmaz. Önce varsayılan modla CI'a ekle, yeni dosyaları strict tut (<code>overrides</code>), her sprintte bir modülü tiple. <code>warn_unused_ignores</code> artık gereksiz olan susturmaları gösterir.</div>
<div class="note"><b>Gerçek işte</b>Tip ipucunun en büyük faydası, kodu değiştirirken gelir: bir fonksiyonun dönüş tipini <code>float</code>'tan <code>Decimal</code>'e çevirdiğinde mypy etkilenen her çağrıyı saniyeler içinde listeler. Pull request'te CI'ın mypy adımı kırmızıysa, bu çoğu zaman üretimde patlayacak bir <code>None</code> hatasının erken uyarısıdır.</div>
'''

EX = []
EX.append(dict(t='mc', stage='Isınma',
    q='<code>def ortalama(x: list[float])</code> fonksiyonuna <code>list[int]</code> verince mypy hata veriyor, <code>Sequence[float]</code> yazınca vermiyor. Neden?',
    o=['mypy, int ile float arasındaki alt tip ilişkisini hiç bilmez', 'list değişebilir (invariant), Sequence salt okunur (covariant)', 'Sequence, herhangi bir tipi kabul eden Any ile aynı anlama gelir', 'list[int] çalışma anında hata verdiği için mypy önceden uyarır'],
    a=1, why='Fonksiyon list[float] alırsa listeye 3.5 ekleyebilir ve çağıranın tamsayı listesini bozar; bu yüzden list değişmezdir. Sequence ekleme metodu sunmaz, okuma güvenlidir; Sequence[int] bu yüzden Sequence[float] yerine geçer.'))
EX.append(dict(t='mc', stage='Isınma',
    q='<code>Annotated[int, Aralik(0, 100)]</code> çalışma anında ne yapar?',
    o=['Değeri otomatik olarak 0-100 aralığında doğrular', 'Hiçbir şey denetlemez; tipe okunabilir bir ek bilgi (metadata) iliştirir', 'int tipini Aralik tipine dönüştürür', 'Yalnızca mypy çalıştırıldığında var olur, çalışma anında silinir'],
    a=1, why='Annotated yalnızca bilgi taşır; denetimi yapan ayrı bir koddur. pydantic ve FastAPI bu ek bilgiyi get_type_hints(include_extras=True) ile okuyup doğrulama uygular.'))
EX.append(dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
    code='from typing import Final\n\nKDV: Final = 0.20\nKDV = 0.18\nprint(KDV)\n',
    o=['0.18', '0.2', 'TypeError', 'AttributeError'], a=0,
    why='Final yalnızca tip denetleyiciye bir sözdür; mypy "Cannot assign to final name" der ama Python çalışma anında yeniden atamayı engellemez.'))
EX.append(dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
    code='from typing import Annotated, get_type_hints\n\ndef tahsil(tutar: Annotated[int, "kurus"]) -> str:\n    return str(tutar)\n\nsade = get_type_hints(tahsil)["tutar"]\ndetay = get_type_hints(tahsil, include_extras=True)["tutar"]\nprint(sade.__name__, detay.__metadata__)\n',
    o=['int (\'kurus\',)', 'Annotated (\'kurus\',)', 'int kurus', 'int ()'], a=0,
    why='get_type_hints varsayılan olarak Annotated katmanını soyar ve yalın int döndürür. include_extras=True ile Annotated korunur; ek bilgiler __metadata__ demetindedir.'))
EX.append(dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
    code='from typing import TypedDict, NotRequired\n\nclass Musteri(TypedDict):\n    ad: str\n    sehir: str\n    telefon: NotRequired[str]\n\nm: Musteri = {"ad": "Ayşe", "sehir": "İzmir", "yas": 30}\nprint(sorted(Musteri.__optional_keys__), type(m).__name__, len(m))\n',
    o=['[\'telefon\'] dict 3', '[\'telefon\'] Musteri 3', '[] dict 2', 'TypeError'], a=0,
    why='TypedDict çalışma anında sıradan bir dict üretir ve fazladan "yas" anahtarını engellemez (bunu yalnız mypy yakalar). NotRequired alanlar __optional_keys__ içinde listelenir.'))
EX.append(dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
    code='def eslestir[K, V](anahtarlar: list[K], degerler: list[V]) -> dict[K, V]:\n    return dict(zip(anahtarlar, degerler))\n\nprint(len(eslestir.__type_params__), eslestir(["a", "b"], [1, 2, 3]))\n',
    o=['2 {\'a\': 1, \'b\': 2}', '0 {\'a\': 1, \'b\': 2}', '2 ValueError', '1 {\'a\': 1, \'b\': 2, None: 3}'], a=0,
    why='3.12 sözdiziminde köşeli parantezdeki her ad bir tip parametresidir ve __type_params__ içinde durur. zip en kısa girdide durur; tipler çalışma anında denetlenmez.'))
EX.append(dict(t='order', stage='Kodu oku',
    q='<p><code>TypeGuard</code> ile bir listenin yalnız metin içerdiğini doğrulayıp güvenle birleştiren programın satırlarını sırala.</p>',
    lines=['from typing import TypeGuard', 'def metin_listesi(x: list[object]) -> TypeGuard[list[str]]:', '    return all(isinstance(e, str) for e in x)', 'veri: list[object] = ["İzmir", "Bursa"]', 'if metin_listesi(veri):', '    print(", ".join(veri))'],
    expect='İzmir, Bursa\n', hint='Önce içe aktarma, sonra koruyucu fonksiyon, sonra veri ve koşullu kullanım.',
    why='TypeGuard dönen fonksiyon True verdiğinde mypy if bloğunda veri\'yi list[str] olarak görür; join güvenle çağrılır.'))
EX.append(dict(t='code', stage='Rehberli', id='tip-sistemi-ileri-x1', diff=2,
    q='<p>Mini pydantic: <code>Annotated</code> ek bilgisini okuyarak doğrula. Verilen <code>Aralik(alt, ust)</code> ve <code>Desen(regex)</code> sınıflarını kullan. <code>dogrula(model, veri: dict) -&gt; list[str]</code> fonksiyonunu yaz: <code>get_type_hints(model, include_extras=True)</code> ile modelin her alanını gez; alan veride yoksa <code>"alan: eksik"</code>; değer varsa alanın Annotated ek bilgilerindeki her <code>Aralik</code> için <code>alt &lt;= değer &lt;= ust</code> değilse <code>"alan: aralık dışı"</code>, her <code>Desen</code> için <code>re.fullmatch</code> uymuyorsa <code>"alan: desen"</code> hatasını listeye ekle. Hataları alan tanım sırasıyla döndür.</p>',
    guide=['get_type_hints(model, include_extras=True) sözlüğünü al (sıra alan tanım sırasıdır).', 'Her alan için veride olup olmadığını kontrol et.', 'Tipin __metadata__ niteliği varsa (getattr(tip, "__metadata__", ())) ek bilgileri gez.', 'isinstance ile Aralik ve Desen\'i ayırt et, kurala uymayanlar için mesaj ekle.', 'Hata listesini döndür.'],
    example='from typing import Annotated, get_type_hints\n\nclass Urun:\n    ad: Annotated[str, "zorunlu"]\n    stok: int\n\nfor alan, tip in get_type_hints(Urun, include_extras=True).items():\n    print(alan, getattr(tip, "__metadata__", ()))\n',
    start='import re\nfrom dataclasses import dataclass\nfrom typing import Annotated, get_type_hints\n\n@dataclass(frozen=True)\nclass Aralik:\n    alt: float\n    ust: float\n\n@dataclass(frozen=True)\nclass Desen:\n    regex: str\n\ndef dogrula(model, veri):\n    hatalar = []\n    # TODO: get_type_hints(model, include_extras=True) ile alanları gez\n    # TODO: eksik / aralık dışı / desen hatalarını ekle\n    return hatalar\n',
    sol='import re\nfrom dataclasses import dataclass\nfrom typing import Annotated, get_type_hints\n\n@dataclass(frozen=True)\nclass Aralik:\n    alt: float\n    ust: float\n\n@dataclass(frozen=True)\nclass Desen:\n    regex: str\n\ndef dogrula(model, veri):\n    hatalar = []\n    for alan, tip in get_type_hints(model, include_extras=True).items():\n        if alan not in veri:\n            hatalar.append(f"{alan}: eksik")\n            continue\n        deger = veri[alan]\n        for kural in getattr(tip, "__metadata__", ()):\n            if isinstance(kural, Aralik) and not (kural.alt <= deger <= kural.ust):\n                hatalar.append(f"{alan}: aralık dışı")\n            elif isinstance(kural, Desen) and not re.fullmatch(kural.regex, str(deger)):\n                hatalar.append(f"{alan}: desen")\n    return hatalar\n',
    tests='class Basvuru:\n    tc: Annotated[str, Desen(r"[1-9][0-9]{10}")]\n    yas: Annotated[int, Aralik(18, 75)]\n    gelir: Annotated[float, Aralik(0, 10_000_000)]\n    not_: str\n\nassert dogrula(Basvuru, {"tc": "12345678901", "yas": 30, "gelir": 45000, "not_": ""}) == [], "Geçerli başvuruda hata olmamalı"\nassert dogrula(Basvuru, {"tc": "0123", "yas": 17, "not_": "x"}) == ["tc: desen", "yas: aralık dışı", "gelir: eksik"], "Hatalar alan sırasıyla dönmeli"\nassert dogrula(Basvuru, {"tc": "12345678901", "yas": 75, "gelir": -1, "not_": ""}) == ["gelir: aralık dışı"], "Sınır değeri 75 geçerli, negatif gelir değil"\n',
    hints=['Annotated olmayan tiplerde __metadata__ yoktur; getattr(tip, "__metadata__", ()) boş demet verir.', 'Desen için re.fullmatch(kural.regex, str(deger)) None ise hata.', 'Eksik alanda continue ile sonraki alana geç.'],
    why='pydantic ve FastAPI tam olarak bu fikri kullanır: tip ipucu hem belge hem de çalışma anında okunan doğrulama kuralıdır.'))
EX.append(dict(t='code', stage='Rehberli', id='tip-sistemi-ileri-x2', diff=2,
    q='<p>Kanal bazlı ücret hesabını kapsamlı (exhaustive) yaz. <code>Kanal = Literal["sube", "mobil", "atm", "cagri"]</code> tanımla. <code>ucret(kanal: Kanal, tutar: float) -&gt; float</code>: sube %0.5 (en az 5), mobil 0, atm sabit 2.5, cagri sabit 7.5 döndürsün; <code>match</code> kullan ve son durumda <code>assert_never(kanal)</code> çağır. Sonuçlar 2 basamak yuvarlanmış olsun.</p>',
    guide=['from typing import Literal, assert_never', 'Kanal takma adını Literal ile tanımla.', 'match kanal: her değer için bir case yaz.', 'case _: assert_never(kanal) ile kapat.', 'Şubede max(5, tutar * 0.005) hesapla.'],
    example='from enum import Enum\nfrom typing import assert_never\n\nclass Renk(Enum):\n    KIRMIZI = 1\n    YESIL = 2\n\ndef anlam(r: Renk) -> str:\n    match r:\n        case Renk.KIRMIZI:\n            return "dur"\n        case Renk.YESIL:\n            return "geç"\n        case _:\n            assert_never(r)\n\nprint(anlam(Renk.YESIL))\n',
    start='from typing import Literal, assert_never\n\nKanal = Literal["sube", "mobil", "atm", "cagri"]\n\ndef ucret(kanal: Kanal, tutar: float) -> float:\n    match kanal:\n        case "mobil":\n            return 0.0\n        # TODO: sube, atm, cagri\n        # TODO: case _: assert_never(kanal)\n    return 0.0\n',
    sol='from typing import Literal, assert_never\n\nKanal = Literal["sube", "mobil", "atm", "cagri"]\n\ndef ucret(kanal: Kanal, tutar: float) -> float:\n    match kanal:\n        case "sube":\n            return round(max(5.0, tutar * 0.005), 2)\n        case "mobil":\n            return 0.0\n        case "atm":\n            return 2.5\n        case "cagri":\n            return 7.5\n        case _:\n            assert_never(kanal)\n',
    tests='assert ucret("sube", 10000) == 50.0, "Şube %0.5"\nassert ucret("sube", 200) == 5.0, "Şubede en az 5"\nassert ucret("mobil", 9999) == 0.0 and ucret("atm", 1) == 2.5 and ucret("cagri", 1) == 7.5\ntry:\n    ucret("faks", 100)\n    raise AssertionError("Tanımsız kanal assert_never ile AssertionError vermeli")\nexcept AssertionError as h:\n    assert "faks" in str(h), "assert_never hata mesajında değeri göstermeli"\nassert "assert_never" in __source__\n',
    hints=['Literal değerleri match\'te dize kalıbı olarak yakalanır: case "sube":', 'assert_never çalışma anında AssertionError fırlatır; mypy ise o satıra ulaşılabiliyorsa derleme sırasında uyarır.'],
    why='Yarın Literal\'e "kiosk" eklendiğinde mypy, assert_never satırına str ulaşabildiğini söyler ve unutulan dalı daha kod çalışmadan gösterir.'))
EX.append(dict(t='code', stage='Rehberli', id='tip-sistemi-ileri-x3', diff=2,
    q='<p><code>TypeGuard</code> ile dış veriyi daralt. <code>siparis_mi(x: object) -&gt; TypeGuard[dict[str, object]]</code> fonksiyonu x bir dict ise ve <code>"no"</code> anahtarı int (bool değil), <code>"tutar"</code> anahtarı int ya da float (bool değil) ise True döndürsün. <code>gecerli_siparisler(kayitlar: list[object]) -&gt; list[dict]</code> yalnızca siparis_mi True olanları döndürsün. Dönüş tipi ipucu gerçekten <code>TypeGuard[dict[str, object]]</code> olmalı.</p>',
    guide=['from typing import TypeGuard', 'isinstance(x, dict) değilse False.', 'x.get("no") için isinstance(..., int) and not isinstance(..., bool) kontrolü yap.', 'tutar için (int, float) kabul et, bool\'u ele.', 'gecerli_siparisler bir liste kapsamıyla süzsün.'],
    example='from typing import TypeGuard\n\ndef sayi_mi(x: object) -> TypeGuard[int]:\n    return isinstance(x, int) and not isinstance(x, bool)\n\nprint([v for v in [1, True, "2", 3] if sayi_mi(v)])\n',
    start='from typing import TypeGuard\n\ndef siparis_mi(x: object) -> bool:   # TODO: dönüş tipi TypeGuard olmalı\n    # TODO: dict mi, no int mi, tutar sayı mı?\n    return isinstance(x, dict)\n\ndef gecerli_siparisler(kayitlar):\n    return [k for k in kayitlar if siparis_mi(k)]\n',
    sol='from typing import TypeGuard\n\ndef _sayi(v, tipler):\n    return isinstance(v, tipler) and not isinstance(v, bool)\n\ndef siparis_mi(x: object) -> TypeGuard[dict[str, object]]:\n    return isinstance(x, dict) and _sayi(x.get("no"), int) and _sayi(x.get("tutar"), (int, float))\n\ndef gecerli_siparisler(kayitlar: list[object]) -> list[dict]:\n    return [k for k in kayitlar if siparis_mi(k)]\n',
    tests='from typing import TypeGuard, get_type_hints\nham = [{"no": 1, "tutar": 99.9}, {"no": "2", "tutar": 5}, {"no": 3}, [1, 2], {"no": True, "tutar": 1}, {"no": 4, "tutar": False}, {"no": 5, "tutar": 10}]\nassert [k["no"] for k in gecerli_siparisler(ham)] == [1, 5], "Yalnız no int ve tutar sayı olanlar geçmeli (bool hariç)"\nassert get_type_hints(siparis_mi)["return"] == TypeGuard[dict[str, object]], "Dönüş tipi TypeGuard[dict[str, object]] olmalı"\n',
    hints=['bool, int\'in alt sınıfıdır: isinstance(True, int) True döner.', 'Dönüş ipucunu -> TypeGuard[dict[str, object]] olarak değiştir.'],
    why='JSON\'dan gelen veri object tipindedir; TypeGuard ile yazılmış kontrol fonksiyonu hem çalışma anında süzer hem de mypy\'ye "bundan sonra bu bir sözlük" bilgisini verir.'))
EX.append(dict(t='code', stage='Kendin yaz', id='tip-sistemi-ileri-x4', diff=2,
    q='<p>Python 3.12 generic sözdizimiyle <code>grupla</code> yaz: <code>def grupla[T, K](ogeler: Iterable[T], anahtar: Callable[[T], K]) -&gt; dict[K, list[T]]</code>. Her öğeyi anahtar fonksiyonunun sonucuna göre gruplasın; grup içindeki sıra korunsun. <code>TypeVar</code> kullanma, köşeli parantezli yeni sözdizimini kullan.</p>',
    start='from collections.abc import Iterable, Callable\n\ndef grupla(ogeler, anahtar):\n    pass\n',
    sol='from collections.abc import Iterable, Callable\n\ndef grupla[T, K](ogeler: Iterable[T], anahtar: Callable[[T], K]) -> dict[K, list[T]]:\n    sonuc: dict[K, list[T]] = {}\n    for x in ogeler:\n        sonuc.setdefault(anahtar(x), []).append(x)\n    return sonuc\n',
    tests='sip = [("İzmir", 100), ("Bursa", 50), ("İzmir", 70)]\nassert grupla(sip, lambda s: s[0]) == {"İzmir": [("İzmir", 100), ("İzmir", 70)], "Bursa": [("Bursa", 50)]}\nassert grupla(range(6), lambda n: n % 2 == 0) == {True: [0, 2, 4], False: [1, 3, 5]}\nassert grupla([], len) == {}\nassert [p.__name__ for p in grupla.__type_params__] == ["T", "K"], "def grupla[T, K](...) sözdizimini kullanmalısın"\nassert "TypeVar" not in __source__, "TypeVar yerine 3.12 sözdizimi"\n',
    hints=['Tip parametreleri fonksiyon adından hemen sonra: def grupla[T, K](...).', 'dict.setdefault(k, []).append(x) gruplamanın kısa yoludur.'],
    why='Yeni sözdizimi tip parametresinin kapsamını fonksiyonla sınırlar; modül düzeyinde TypeVar tanımı gerekmez.'))
EX.append(dict(t='code', stage='Kendin yaz', id='tip-sistemi-ileri-x5', diff=2,
    q='<p>TypedDict ile isteğe bağlı alanlar. <code>Musteri</code> adlı TypedDict tanımla: zorunlu <code>id: int</code>, <code>ad: str</code>; isteğe bağlı (<code>NotRequired</code>) <code>telefon: str</code> ve <code>eposta: str</code>. <code>iletisim(m: Musteri) -&gt; str</code> fonksiyonu varsa e-postayı, yoksa telefonu, ikisi de yoksa <code>"yok"</code> döndürsün.</p>',
    start='from typing import TypedDict, NotRequired\n\n# TODO: Musteri\n\ndef iletisim(m):\n    pass\n',
    sol='from typing import TypedDict, NotRequired\n\nclass Musteri(TypedDict):\n    id: int\n    ad: str\n    telefon: NotRequired[str]\n    eposta: NotRequired[str]\n\ndef iletisim(m: Musteri) -> str:\n    return m.get("eposta") or m.get("telefon") or "yok"\n',
    tests='assert Musteri.__required_keys__ == frozenset({"id", "ad"}), "Zorunlu alanlar id ve ad"\nassert Musteri.__optional_keys__ == frozenset({"telefon", "eposta"}), "telefon ve eposta NotRequired olmalı"\nassert iletisim({"id": 1, "ad": "Ayşe", "telefon": "0555", "eposta": "a@x.com"}) == "a@x.com"\nassert iletisim({"id": 2, "ad": "Can", "telefon": "0532"}) == "0532"\nassert iletisim({"id": 3, "ad": "Ece"}) == "yok"\n',
    hints=['class Musteri(TypedDict): gövdesinde alanları tip ipucuyla yaz.', 'İsteğe bağlı alanları NotRequired[str] ile sar; okurken .get kullan.'],
    why='API yanıtlarında bazı alanlar hep gelmez; NotRequired bunu belgeler ve mypy\'nin m["telefon"] gibi güvensiz erişimleri yakalamasını sağlar.'))
EX.append(dict(t='code', stage='Hata avı', id='tip-sistemi-ileri-x6', kind='bug', diff=1,
    q='<p>Hatayı bul ve düzelt. <code>tamsayi_listesi_mi(x)</code> x bir liste ve tüm elemanları int (bool hariç) ise True dönmeli. Fonksiyon her çağrıda <code>TypeError</code> veriyor.</p>',
    start='def tamsayi_listesi_mi(x):\n    return isinstance(x, list[int])\n',
    sol='def tamsayi_listesi_mi(x):\n    return isinstance(x, list) and all(isinstance(e, int) and not isinstance(e, bool) for e in x)\n',
    tests='assert tamsayi_listesi_mi([1, 2, 3]) is True\nassert tamsayi_listesi_mi([]) is True, "Boş liste koşulu sağlar"\nassert tamsayi_listesi_mi([1, "2"]) is False\nassert tamsayi_listesi_mi([1, True]) is False, "bool tamsayı sayılmamalı"\nassert tamsayi_listesi_mi((1, 2)) is False, "Demet liste değildir"\n',
    hints=['isinstance parametreli generic (list[int]) kabul etmez: "isinstance() argument 2 cannot be a parameterized generic".', 'Önce isinstance(x, list), sonra elemanları all(...) ile tek tek denetle.'],
    why='Tip parametreleri çalışma anında silinir (type erasure); list[int] yalnızca denetleyici içindir. Çalışma anında elemanları kendin kontrol etmelisin.'))
EX.append(dict(t='code', stage='Hata avı', id='tip-sistemi-ileri-x7', kind='bug', diff=1,
    q='<p>Hatayı bul ve düzelt. <code>kapat_hepsini(nesneler)</code> listede <code>kapat()</code> metodu olan nesneleri kapatıp sayısını döndürmeli. <code>Kapatilabilir</code> bir Protocol; ama isinstance çağrısı <code>TypeError</code> veriyor.</p>',
    start='from typing import Protocol\n\nclass Kapatilabilir(Protocol):\n    def kapat(self) -> None: ...\n\ndef kapat_hepsini(nesneler):\n    sayi = 0\n    for n in nesneler:\n        if isinstance(n, Kapatilabilir):\n            n.kapat()\n            sayi += 1\n    return sayi\n',
    sol='from typing import Protocol, runtime_checkable\n\n@runtime_checkable\nclass Kapatilabilir(Protocol):\n    def kapat(self) -> None: ...\n\ndef kapat_hepsini(nesneler):\n    sayi = 0\n    for n in nesneler:\n        if isinstance(n, Kapatilabilir):\n            n.kapat()\n            sayi += 1\n    return sayi\n',
    tests='kapanan = []\nclass Dosya:\n    def kapat(self): kapanan.append("dosya")\nclass Baglanti:\n    def kapat(self): kapanan.append("db")\nassert kapat_hepsini([Dosya(), 42, "metin", Baglanti()]) == 2, "Yalnız kapat() metodu olanlar kapatılmalı"\nassert kapanan == ["dosya", "db"]\n',
    hints=['Protocol sınıfları varsayılan olarak isinstance ile kullanılamaz.', 'typing.runtime_checkable dekoratörünü Protocol sınıfına ekle.'],
    why='@runtime_checkable, isinstance\'ın yalnızca metot ADLARININ varlığını kontrol etmesine izin verir (imzaları değil). Ayrıntılı denetim yine mypy\'nin işidir.'))
EX.append(dict(t='code', stage='Meydan okuma', id='tip-sistemi-ileri-x8', diff=3,
    q='<p>Çalışma anı tip doğrulayıcı. <code>uyuyor_mu(deger, tip) -&gt; bool</code> yaz; şu tipleri desteklesin: <code>int</code>, <code>float</code> (int de kabul edilir), <code>str</code>, <code>bool</code>, <code>None</code>/<code>type(None)</code>, <code>list[X]</code>, <code>dict[K, V]</code>, <code>tuple[X, ...]</code> (değişken uzunluk) ve <code>tuple[X, Y]</code> (sabit uzunluk), <code>X | Y</code> ve <code>Optional[X]</code>, <code>Literal[...]</code> ve iç içe kullanımlar. bool, int ya da float yerine <b>geçmemeli</b>. <code>typing.get_origin</code> ve <code>get_args</code> kullan.</p>',
    start='from typing import get_origin, get_args, Literal, Union\nimport types\n\ndef uyuyor_mu(deger, tip):\n    pass\n',
    sol='from typing import get_origin, get_args, Literal, Union\nimport types\n\ndef uyuyor_mu(deger, tip):\n    if tip is None or tip is type(None):\n        return deger is None\n    koken, argumanlar = get_origin(tip), get_args(tip)\n    if koken in (Union, types.UnionType):\n        return any(uyuyor_mu(deger, a) for a in argumanlar)\n    if koken is Literal:\n        return any(deger == a and type(deger) is type(a) for a in argumanlar)\n    if koken is list:\n        return isinstance(deger, list) and all(uyuyor_mu(e, argumanlar[0]) for e in deger)\n    if koken is dict:\n        k, v = argumanlar\n        return isinstance(deger, dict) and all(uyuyor_mu(a, k) and uyuyor_mu(b, v) for a, b in deger.items())\n    if koken is tuple:\n        if not isinstance(deger, tuple):\n            return False\n        if len(argumanlar) == 2 and argumanlar[1] is Ellipsis:\n            return all(uyuyor_mu(e, argumanlar[0]) for e in deger)\n        return len(deger) == len(argumanlar) and all(uyuyor_mu(e, a) for e, a in zip(deger, argumanlar))\n    if tip is bool:\n        return isinstance(deger, bool)\n    if tip is int:\n        return isinstance(deger, int) and not isinstance(deger, bool)\n    if tip is float:\n        return isinstance(deger, (int, float)) and not isinstance(deger, bool)\n    return isinstance(deger, tip)\n',
    tests='from typing import Optional, Literal\nassert uyuyor_mu(5, int) and not uyuyor_mu(True, int), "bool int yerine geçmemeli"\nassert uyuyor_mu(5, float) and uyuyor_mu(2.5, float) and not uyuyor_mu(False, float), "float int kabul eder, bool\'u etmez"\nassert uyuyor_mu(None, None) and uyuyor_mu(None, Optional[str]) and uyuyor_mu("a", str | None)\nassert not uyuyor_mu(3, str | None)\nassert uyuyor_mu([1, 2], list[int]) and not uyuyor_mu([1, "2"], list[int]) and uyuyor_mu([], list[int])\nassert uyuyor_mu({"İzmir": [1.5, 2]}, dict[str, list[float]]), "İç içe tipler"\nassert not uyuyor_mu({"İzmir": [1.5, "x"]}, dict[str, list[float]])\nassert uyuyor_mu((1, 2, 3), tuple[int, ...]) and not uyuyor_mu((1, "a"), tuple[int, ...])\nassert uyuyor_mu(("TR1", 500), tuple[str, int]) and not uyuyor_mu(("TR1",), tuple[str, int])\nK = Literal["sube", "mobil"]\nassert uyuyor_mu("mobil", K) and not uyuyor_mu("atm", K)\nassert uyuyor_mu(1, Literal[1]) and not uyuyor_mu(True, Literal[1]), "Literal[1] True kabul etmemeli"\nassert not uyuyor_mu([1], tuple[int, ...]), "Liste demet değildir"\n',
    hints=['get_origin(list[int]) list, get_args(list[int]) (int,) verir; int | None için origin types.UnionType, Optional[int] için typing.Union.', 'Özyineleme: kap tiplerinde her eleman için uyuyor_mu\'yu yeniden çağır.', 'bool kontrolünü int ve float\'tan önce yap; tuple[X, ...] için ikinci argüman Ellipsis\'tir.'],
    why='pydantic, typeguard ve beartype gibi kütüphanelerin çekirdeği bu özyinelemeli get_origin/get_args gezintisidir.'))

EXT = dict(id='tip-sistemi-ileri', min=30, html=html, ex=EX,
    faq=[dict(q='Tip ipuçlarını çalışma anında zorlamak istersem ne kullanmalıyım?', a='Dış veri sınırında pydantic (modeller), fonksiyon çağrılarında typeguard ya da beartype gibi kütüphaneler ipuçlarını çalışma anında denetler. Uygulamanın içinde ise mypy/pyright statik denetimi genellikle yeterlidir ve hiçbir çalışma maliyeti yoktur.'),
         dict(q='TypeGuard ile TypeIs farkı nedir?', a='TypeGuard yalnız True dalında tipi daraltır ve daraltılan tip ile girdi tipi ilişkisiz olabilir. TypeIs (3.13, öncesinde typing_extensions) hem True hem False dalında daraltır (False dalında o tip çıkarılır) ama daraltılan tip girdi tipinin alt tipi olmalıdır. Yeni kodda çoğu durum için TypeIs daha doğal davranır.')],
    mistakes=[dict(bad='def toplam(tutarlar: list[float]) -> float:\n    return sum(tutarlar)', good='from collections.abc import Iterable\ndef toplam(tutarlar: Iterable[float]) -> float:\n    return sum(tutarlar)', why='Yalnız okuyan bir fonksiyon list istediğinde list[int], demet ve üreteç reddedilir. Gereken en dar yeteneği (Iterable/Sequence) istemek fonksiyonu hem esnek hem doğru yapar.'),
              dict(bad='sonuc = hesapla()  # type: ignore', good='sonuc = hesapla()  # type: ignore[no-untyped-call]', why='Kodsuz type: ignore o satırdaki gelecekteki tüm hataları da gizler. Hata koduyla susturmak yalnızca bilinen sorunu kapatır; warn_unused_ignores gereksiz kalanları gösterir.')])
