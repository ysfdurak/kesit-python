import sys; sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad')
from gen import PY, CODE, emit

body = '''
<h2>Neden önemli?</h2>
<p>Metaprogramlama (metaprogramming), <b>kodu yöneten kod</b> yazmaktır: sınıfları çalışma anında üretmek, bir sınıf tanımlandığı anda onu bir kayda eklemek, öznitelik atamasını araya girip doğrulamak, bir fonksiyonun imzasını okuyup ona göre davranmak ya da bir Python dosyasını çalıştırmadan çözümlemek. Kulağa egzotik gelir ama her gün kullandığın kütüphanelerin hepsi bunun üzerine kuruludur: <code>@dataclass</code> sınıfına <code>__init__</code> yazar, Django ve SQLAlchemy modelleri sınıf gövdesindeki alanları toplayıp tabloya çevirir, pytest test fonksiyonlarının parametre adlarına bakıp fixture enjekte eder, FastAPI fonksiyon imzasından API şeması çıkarır.</p>
<p>Bu dersin amacı sana "her şeyi metaclass ile yaz" demek değil; tam tersi. Hangi ihtiyaca <b>en basit</b> aracın yettiğini bilmeni istiyoruz. İleri OOP dersinde descriptor ve metaclass'a kısaca baktın, Dekoratörler dersinde fonksiyon saran fonksiyonları gördün. Burada hepsini bir araya getirip Anadolu Market ve Anadolu Bank için gerçekçi araçlar kuracağız.</p>

<h2>Her şey nesnedir</h2>
<p>Python'da sayılar, metinler, fonksiyonlar, sınıflar ve modüller birer nesnedir (object). Fonksiyonu bir değişkene atayabilir, listeye koyabilir, ona öznitelik ekleyebilirsin. Sınıf da bir nesnedir ve onu üreten sınıfa <b>metaclass</b> denir; varsayılan metaclass <code>type</code>'tır.</p>
''' + PY(r'''
def kdv_ekle(tutar):
    return round(tutar * 1.20, 2)

islem = kdv_ekle                 # fonksiyon bir değerdir
print(islem(100), islem.__name__)
kdv_ekle.surum = "2.1"           # fonksiyona öznitelik eklenebilir
print(kdv_ekle.surum)

class Urun:
    pass

print(type(42), type(kdv_ekle).__name__)
print(type(Urun))                # sınıfın türü: type
print(type(type))                # type kendisinin örneği
print(isinstance(Urun, object), isinstance(kdv_ekle, object))
''') + '''
<p>Zincir şöyledir: <code>u</code> nesnesi <code>Urun</code>'un örneğidir, <code>Urun</code> de <code>type</code>'ın örneğidir. Bu, "sınıfı da bir fonksiyon çağrısıyla üretebilirim" demektir.</p>

<h2>type() ile çalışma anında sınıf üretmek</h2>
<p><code>type</code> tek argümanla türü söyler; üç argümanla <b>yeni bir sınıf üretir</b>: <code>type(ad, tabanlar, sozluk)</code>. <code>class</code> ifadesi aslında arka planda tam olarak bunu yapar.</p>
''' + PY(r'''
def fiyatla(self, adet):
    return self.birim_fiyat * adet

# class Kampanya: birim_fiyat = 50; fiyatla = fiyatla  ile aynı
Kampanya = type("Kampanya", (object,), {"birim_fiyat": 50, "fiyatla": fiyatla})
k = Kampanya()
print(Kampanya.__name__, k.fiyatla(3))

# Bir yapılandırma tablosundan rapor sınıfları üretmek
tanimlar = {"GunlukRapor": "gün", "HaftalikRapor": "hafta"}
siniflar = {ad: type(ad, (), {"donem": d}) for ad, d in tanimlar.items()}
for ad, sinif in siniflar.items():
    print(ad, "->", sinif.donem)
''') + '''
<p>Ne zaman işe yarar? Bir JSON şemasından, veritabanı tablosundan ya da yapılandırma dosyasından gelen tanımlara göre sınıf üretmen gerektiğinde. Elle yazacağın onlarca neredeyse aynı sınıfı tek döngüyle üretirsin. Ama okunabilirlik düşer: IDE'n bu sınıfları göremez, otomatik tamamlama çalışmaz. Az sayıda sınıf için <code>class</code> ile yazmak hâlâ en iyisidir.</p>

<h2>__init_subclass__: alt sınıfı otomatik kaydet</h2>
<p>Eklenti (plugin) sistemlerinde klasik ihtiyaç şudur: "Bu temel sınıftan türeyen her sınıf kendiliğinden bir kayda (registry) girsin; kimse elle listeye eklemeyi unutmasın." Python 3.6'dan beri bunun için metaclass'a gerek yok: temel sınıfa <code>__init_subclass__</code> yazarsın. Bir alt sınıf tanımlandığı anda Python bu metodu o alt sınıfla çağırır.</p>
''' + PY(r'''
class Disari:
    kayit = {}

    def __init_subclass__(cls, bicim, **kwargs):
        super().__init_subclass__(**kwargs)
        if bicim in Disari.kayit:
            raise ValueError(f"{bicim} zaten kayıtlı")
        cls.bicim = bicim
        Disari.kayit[bicim] = cls

class CsvDisari(Disari, bicim="csv"):
    def yaz(self, satirlar):
        return "\n".join(",".join(map(str, s)) for s in satirlar)

class JsonDisari(Disari, bicim="json"):
    def yaz(self, satirlar):
        import json
        return json.dumps(satirlar)

print(sorted(Disari.kayit))
veri = [["AM-1", 120], ["AM-2", 80]]
for b in ["csv", "json"]:
    print(b, "=>", Disari.kayit[b]().yaz(veri))
''') + '''
<p>Sınıf satırındaki <code>bicim="csv"</code> gibi anahtar kelime argümanları doğrudan <code>__init_subclass__</code>'a gider. <code>super().__init_subclass__(**kwargs)</code> çağrısı, çoklu kalıtımda diğer tabanların da kendi kancalarını çalıştırabilmesi için önemlidir. Yeni bir dışa aktarım biçimi eklemek artık tek bir sınıf yazmaktan ibarettir; hiçbir <code>if/elif</code> zincirine dokunmazsın. Tasarım Kalıpları dersindeki kayıt tabanlı fabrikanın en temiz Python hâli budur.</p>

<h2>Sınıf dekoratörleri</h2>
<p>Dekoratör yalnızca fonksiyonlar için değildir. Sınıf dekoratörü sınıfı alır, değiştirir (ya da kaydeder) ve geri döndürür. <code>@dataclass</code>, <code>@functools.total_ordering</code> ve <code>@enum.unique</code> birer sınıf dekoratörüdür. Kalıtım gerektirmediği için mevcut sınıflara "yapıştırması" kolaydır.</p>
''' + PY(r'''
def alanlari_say(cls):
    alanlar = [ad for ad in cls.__annotations__]
    cls.alan_sayisi = len(alanlar)

    def __repr__(self):
        icerik = ", ".join(f"{a}={getattr(self, a)!r}" for a in alanlar)
        return f"{cls.__name__}({icerik})"

    cls.__repr__ = __repr__
    return cls                     # sınıfı geri döndürmeyi unutma!

@alanlari_say
class Musteri:
    ad: str
    sehir: str

    def __init__(self, ad, sehir):
        self.ad, self.sehir = ad, sehir

print(Musteri("Ayşe", "İzmir"), Musteri.alan_sayisi)
''') + '''
<div class="tbl-wrap"><table>
<tr><th>İhtiyaç</th><th>En basit araç</th><th>Neden</th></tr>
<tr><td>Bir fonksiyonun davranışını sarmak</td><td>Fonksiyon dekoratörü</td><td>Tek fonksiyonu etkiler, okunur</td></tr>
<tr><td>Bir sınıfa metot/öznitelik eklemek</td><td>Sınıf dekoratörü</td><td>Kalıtım gerekmez, açıkça görünür</td></tr>
<tr><td>Alt sınıfları kaydetmek ya da denetlemek</td><td><code>__init_subclass__</code></td><td>Kalıtımla otomatik, metaclass çatışması yok</td></tr>
<tr><td>Tek bir alanın okuma/yazmasını denetlemek</td><td><code>property</code> ya da descriptor</td><td>Alan düzeyinde kural</td></tr>
<tr><td>Sınıf gövdesinin oluşumunu değiştirmek</td><td>Metaclass</td><td>Son çare; nadiren gerekir</td></tr>
</table></div>

<h2>Descriptor protokolü: doğrulanan alanlar</h2>
<p><code>property</code> tek bir alan için harikadır ama on alanın hepsine "pozitif sayı olmalı" kuralı koyacaksan aynı kodu on kez yazarsın. Descriptor, öznitelik erişimini yöneten <b>yeniden kullanılabilir</b> bir nesnedir. Sınıf düzeyinde tanımlanır ve şu metotlardan birini taşır:</p>
<ul>
<li><code>__set_name__(self, sahip, ad)</code>: sınıf oluşturulurken bir kez çağrılır; descriptor hangi ada atandığını öğrenir.</li>
<li><code>__get__(self, nesne, sahip)</code>: <code>u.fiyat</code> okunurken çağrılır. Sınıf üzerinden okunursa <code>nesne</code> <code>None</code> gelir.</li>
<li><code>__set__(self, nesne, deger)</code>: <code>u.fiyat = 10</code> yazılırken çağrılır; doğrulamanın yeri burasıdır.</li>
</ul>
''' + PY(r'''
class Pozitif:
    def __set_name__(self, sahip, ad):
        self.ad = ad

    def __get__(self, nesne, sahip=None):
        if nesne is None:
            return self                      # Urun.fiyat -> descriptor'ın kendisi
        return nesne.__dict__[self.ad]

    def __set__(self, nesne, deger):
        if not isinstance(deger, (int, float)) or deger <= 0:
            raise ValueError(f"{self.ad} pozitif sayı olmalı, gelen: {deger!r}")
        nesne.__dict__[self.ad] = deger      # değeri NESNEDE sakla

class Urun:
    fiyat = Pozitif()
    stok = Pozitif()

    def __init__(self, ad, fiyat, stok):
        self.ad, self.fiyat, self.stok = ad, fiyat, stok

cay = Urun("Çay", 85.5, 40)
kahve = Urun("Kahve", 240, 12)
print(cay.fiyat, kahve.fiyat)
try:
    cay.stok = -3
except ValueError as h:
    print("Hata:", h)
''') + '''
<p>Değeri descriptor'ın kendisinde (<code>self.deger</code>) saklamak en sık yapılan hatadır: descriptor <b>sınıfa</b> aittir, yani tüm örnekler aynı descriptor'ı paylaşır ve bir ürünün fiyatı diğerini ezer. Değer her zaman <code>nesne.__dict__</code> içinde, <code>__set_name__</code> ile öğrenilen adla tutulur.</p>
<div class="note"><b>Arama sırası</b><code>u.x</code> okunurken Python önce sınıfta <code>__set__</code> taşıyan bir <b>veri descriptor'ı</b> (data descriptor) arar; varsa o kazanır. Yoksa nesnenin <code>__dict__</code>'ine bakar, sonra sınıftaki sıradan öznitelik ya da yalnız <code>__get__</code> taşıyan descriptor'a (fonksiyonlar, <code>functools.cached_property</code>) gelir. Bu yüzden veri descriptor'ı değeri <code>__dict__</code>'te aynı adla saklasa da kontrolü kaybetmez.</div>

<h2>__getattr__, __getattribute__ ve __setattr__</h2>
<p>Bu üç kanca nesnenin öznitelik erişiminin tamamına araya girer:</p>
<div class="tbl-wrap"><table>
<tr><th>Kanca</th><th>Ne zaman çağrılır</th><th>Tipik kullanım</th><th>Risk</th></tr>
<tr><td><code>__getattr__</code></td><td>Yalnızca normal arama başarısız olunca</td><td>Vekil (proxy), varsayılan değer, tembel yükleme</td><td>Düşük</td></tr>
<tr><td><code>__getattribute__</code></td><td>HER öznitelik okumasında</td><td>Erişim günlüğü, çok özel durumlar</td><td>Yüksek: sonsuz özyineleme, yavaşlık</td></tr>
<tr><td><code>__setattr__</code></td><td>HER atamada (<code>__init__</code> içindekiler dahil)</td><td>Salt okunur nesne, değişiklik izleme</td><td>Orta: içeride <code>self.x = ...</code> yazarsan özyineleme</td></tr>
</table></div>
''' + PY(r'''
class Ayarlar:
    """Eksik ayarlarda varsayılana düşen, değiştirilemeyen ayar nesnesi."""
    VARSAYILAN = {"para_birimi": "TRY", "sayfa_boyu": 20}

    def __init__(self, **degerler):
        object.__setattr__(self, "_degerler", degerler)   # __setattr__'ı atla

    def __getattr__(self, ad):          # yalnız bulunamayan adlarda çalışır
        if ad in self._degerler:
            return self._degerler[ad]
        if ad in self.VARSAYILAN:
            return self.VARSAYILAN[ad]
        raise AttributeError(f"Bilinmeyen ayar: {ad}")

    def __setattr__(self, ad, deger):
        raise AttributeError("Ayarlar salt okunurdur")

a = Ayarlar(sayfa_boyu=50)
print(a.sayfa_boyu, a.para_birimi)
for islem in (lambda: a.tema, lambda: setattr(a, "sayfa_boyu", 5)):
    try:
        islem()
    except AttributeError as h:
        print("AttributeError:", h)
''') + '''
<div class="warn"><b>Özyineleme tuzağı</b><code>__setattr__</code> içinde <code>self.ad = deger</code> ya da <code>setattr(self, ad, deger)</code> yazarsan Python yine <code>__setattr__</code>'ı çağırır ve <code>RecursionError</code> alırsın. Gerçek atamayı <code>object.__setattr__(self, ad, deger)</code> ya da <code>self.__dict__[ad] = deger</code> ile yap. Aynı kural <code>__getattribute__</code> için de geçerlidir: içeride <code>object.__getattribute__(self, ad)</code> kullan.</div>

<h2>Metaclass: ne zaman gerçekten gerekir?</h2>
<p>Metaclass, sınıfın sınıfıdır; <code>type</code>'tan türetilir ve sınıf <b>oluşturulurken</b> araya girer. Python çekirdek geliştiricisi Tim Peters'ın sözü meşhurdur: "Metaclass'a ihtiyacın olup olmadığını merak ediyorsan, ihtiyacın yoktur." Yukarıdaki tablodaki araçlar vakaların çok büyük bölümünü çözer. Metaclass'ın gerçekten gerektiği yerler: sınıf gövdesinin sözlüğünü değiştirmek (<code>__prepare__</code>), sınıfın kendisine operatör kazandırmak (Enum'un <code>len(Renk)</code> ve <code>Renk["KIRMIZI"]</code> desteği gibi), ABC'nin <code>isinstance</code> davranışı gibi tür sistemi oyunları.</p>
''' + PY(r'''
class ZorunluMetotMeta(type):
    """Alt sınıflarda 'hesapla' metodunu zorunlu kılar (gösterim)."""
    def __new__(mcs, ad, tabanlar, sozluk):
        cls = super().__new__(mcs, ad, tabanlar, sozluk)
        if tabanlar and "hesapla" not in sozluk:
            raise TypeError(f"{ad} sınıfı hesapla() tanımlamalı")
        return cls

    def __len__(cls):                  # sınıfın kendisine len() kazandırır
        return len([a for a in vars(cls) if not a.startswith("_")])

class Komisyon(metaclass=ZorunluMetotMeta):
    pass

class EftKomisyonu(Komisyon):
    oran = 0.002
    def hesapla(self, tutar):
        return round(tutar * self.oran, 2)

print(EftKomisyonu().hesapla(15000), len(EftKomisyonu))
try:
    class HataliKomisyon(Komisyon):
        oran = 0.01
except TypeError as h:
    print("TypeError:", h)
''') + '''
<p>Aynı zorunluluğu <code>abc.ABC</code> ve <code>@abstractmethod</code> ile ya da <code>__init_subclass__</code> içinde <code>hasattr</code> kontrolüyle de kurabilirsin; ikisi de daha okunurdur. <code>len(EftKomisyonu)</code> gibi sınıfın kendisine davranış eklemek ise yalnız metaclass ile mümkündür. Ayrıca iki farklı metaclass'a sahip tabanlardan türetmek "metaclass conflict" hatası verir; kütüphane kodunda metaclass kullanmak, kullanıcılarının elini bağlar.</p>

<h2>inspect: kodu çalışırken incelemek</h2>
<p><code>inspect</code> modülü fonksiyonların imzasını, sınıfların üyelerini ve çağrı yığınını okumanı sağlar. pytest'in fixture enjeksiyonu ve FastAPI'nin parametre çözümlemesi tam olarak <code>inspect.signature</code> üzerine kuruludur.</p>
''' + PY(r'''
import inspect

def kredi_teklifi(musteri_no: int, tutar: float, vade: int = 12, *, sigorta: bool = False):
    """Kredi teklifi üretir."""
    return {"musteri_no": musteri_no, "tutar": tutar, "vade": vade}

imza = inspect.signature(kredi_teklifi)
print(imza)
for p in imza.parameters.values():
    varsayilan = "zorunlu" if p.default is inspect.Parameter.empty else p.default
    print(f"{p.name:12} {p.kind.name:22} {varsayilan}")

# Sözlükten yalnız fonksiyonun kabul ettiği alanları seçip çağır
istek = {"musteri_no": 7, "tutar": 50000, "kanal": "mobil"}
kabul = {k: v for k, v in istek.items() if k in imza.parameters}
print(kredi_teklifi(**kabul))

class Hesap:
    def yatir(self, t): ...
    def cek(self, t): ...
    def _ic(self): ...

print([ad for ad, _ in inspect.getmembers(Hesap, inspect.isfunction) if not ad.startswith("_")])
''') + '''
<div class="tip"><b>Kaynak koda erişim</b><code>inspect.getsource</code> fonksiyonun kaynak dosyasını okur; tarayıcıda ve etkileşimli ortamlarda çoğu zaman çalışmaz. Kod çözümlemek istiyorsan kaynağı bir metin olarak al ve <code>ast</code> ile işle.</div>

<h2>ast: kodu çalıştırmadan çözümlemek</h2>
<p><code>ast.parse</code> Python kaynağını soyut sözdizimi ağacına (abstract syntax tree) çevirir. ruff, black, mypy ve bandit gibi araçlar böyle çalışır: kodu çalıştırmadan okur, kural ihlallerini bulur. <code>ast.NodeVisitor</code>'dan türetip <code>visit_DugumAdi</code> metotları yazarak ilgilendiğin düğümleri yakalarsın.</p>
''' + PY(r'''
import ast

kaynak = """
import os
def rapor(siparisler, esik=100):
    print("başladı")
    return [s for s in siparisler if s > esik]

def temizle(metin):
    return eval(metin)
"""

agac = ast.parse(kaynak)

class Denetci(ast.NodeVisitor):
    def __init__(self):
        self.fonksiyonlar, self.uyarilar = {}, []

    def visit_FunctionDef(self, dugum):
        self.fonksiyonlar[dugum.name] = len(dugum.args.args)
        self.generic_visit(dugum)          # iç düğümleri de gez

    def visit_Call(self, dugum):
        if isinstance(dugum.func, ast.Name) and dugum.func.id in {"eval", "exec", "print"}:
            self.uyarilar.append(f"satır {dugum.lineno}: {dugum.func.id}() kullanımı")
        self.generic_visit(dugum)

d = Denetci()
d.visit(agac)
print(d.fonksiyonlar)
print(*d.uyarilar, sep="\n")
print(ast.dump(ast.parse("tutar * 1.2", mode="eval").body))
''') + '''

<h2>Dinamik import ve eklenti yükleme</h2>
<p>Modül adını çalışma anında bir metinden alıp yüklemek için <code>importlib.import_module</code> kullanılır; içinden nesneyi <code>getattr</code> ile çekersin. Yapılandırma dosyasında <code>"rapor.bicim": "json"</code> yazıyorsa ilgili modülü bu yolla yüklersin.</p>
''' + PY(r'''
import importlib

def nesne_yukle(yol):
    """'paket.modul:nesne' biçimindeki yolu yükler."""
    modul_adi, _, nesne_adi = yol.partition(":")
    modul = importlib.import_module(modul_adi)
    return getattr(modul, nesne_adi) if nesne_adi else modul

dumps = nesne_yukle("json:dumps")
karekok = nesne_yukle("math:sqrt")
print(dumps({"sehir": "İzmir"}, ensure_ascii=False), karekok(144))
try:
    nesne_yukle("olmayan_modul:x")
except ModuleNotFoundError as h:
    print("Yüklenemedi:", h.name)
''') + '''
<p>Bu kalıp gunicorn'un <code>app:create_app</code> sözdiziminde, Django'nun <code>INSTALLED_APPS</code> listesinde ve setuptools'un <code>entry_points</code> tanımlarında karşına çıkar. Yalnızca <b>güvendiğin</b> yollardan yükle; kullanıcının yazdığı bir modül adını doğrudan import etmek, keyfi kod çalıştırmaya kapı açar.</p>

<h2>exec ve eval: neden tehlikeli?</h2>
<p><code>eval</code> bir ifadeyi, <code>exec</code> bir kod bloğunu çalıştırır. Kullanıcıdan gelen metni bunlara vermek, kullanıcıya sunucunda Python çalıştırma yetkisi vermektir. <code>eval(girdi, {"__builtins__": {}})</code> gibi "kısıtlama" denemeleri de bilinen yöntemlerle aşılır; güvenli kum havuzu (sandbox) değildir.</p>
''' + PY(r'''
import ast

girdi = "[('AM-1', 120), ('AM-2', 80)]"
veri = ast.literal_eval(girdi)        # yalnız sabit değerler: sayı, metin, liste, sözlük...
print(veri, type(veri).__name__)

for kotu in ["__import__('os').getcwd()", "open('x.txt', 'w')"]:
    try:
        ast.literal_eval(kotu)
    except ValueError:
        print("Reddedildi:", kotu)
''') + '''
<div class="warn"><b>Kural</b>Dışarıdan gelen veriyi asla <code>eval</code>/<code>exec</code>'e verme. Sabit veri için <code>json.loads</code> ya da <code>ast.literal_eval</code>, formül için <code>ast</code> ile yalnız izin verilen düğümleri değerlendiren küçük bir yorumlayıcı (bu dersin meydan okuma görevi) kullan.</div>

<div class="note"><b>Gerçek işte</b>Anadolu Bank'ın kampanya ekibi faiz indirimi kurallarını bir yönetim panelinden formül olarak giriyor: <code>bakiye * 0.01 if segment == "premium" else 0</code>. İlk sürümde bu formüller <code>eval</code> ile çalıştırılıyordu; güvenlik denetiminde paneli kullanan biri sunucu dosyalarını okuyabildiği ortaya çıktı. Çözüm, <code>ast</code> ile yalnız sayı, izinli değişken adları ve aritmetik/karşılaştırma düğümlerini kabul eden bir değerlendiriciydi. Aynı ekip yeni kampanya türlerini <code>__init_subclass__</code> ile kaydedilen sınıflarla ekliyor; yeni tür eklemek merkezi koda dokunmayı gerektirmiyor.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Sınıf oluşturma sırası</h3>
<p>Bir <code>class</code> ifadesi çalıştığında sıra şudur: metaclass'ın <code>__prepare__</code>'i gövde sözlüğünü hazırlar, gövde çalışır, <code>type.__new__</code> sınıfı oluşturur, bu sırada her descriptor için <code>__set_name__</code> çağrılır, ardından taban sınıfın <code>__init_subclass__</code>'ı çalışır, en son sınıf dekoratörleri aşağıdan yukarıya uygulanır. Bir kütüphane hata ayıklarken bu sırayı bilmek, "alan neden henüz kayıtlı değil?" sorusunu çözer.</p>
<h3>Tip ipuçlarını okumak</h3>
<p><code>cls.__annotations__</code> ham ipuçlarını verir; <code>from __future__ import annotations</code> kullanılan modüllerde bunlar metindir. Gerçek türler için <code>typing.get_type_hints(cls)</code> kullan. dataclass, pydantic ve SQLAlchemy'nin <code>Mapped[...]</code> sözdizimi bu bilgiyle alan üretir.</p>
<h3>Maliyet</h3>
<p>Her sihir bir bedel öder: hata izleri (traceback) uzar, IDE ve tip denetleyicisi dinamik üretilen öznitelikleri göremez, yeni gelen ekip arkadaşı kodun ne yaptığını anlamakta zorlanır. Kurumsal kodda kural: önce sade fonksiyon ve sınıf, sonra dekoratör, sonra <code>__init_subclass__</code>/descriptor, en son metaclass. Metaprogramlamayı uygulama kodunda değil, <b>çerçeve ve altyapı</b> katmanında, iyi test edilmiş ve belgelenmiş olarak kullan.</p>
</section>
'''

ex = [
  dict(t='mc', stage='Isınma',
       q='<code>class Siparis: pass</code> tanımından sonra <code>type(Siparis)</code> ne döndürür?',
       o=['<code>&lt;class \'object\'&gt;</code>', '<code>&lt;class \'type\'&gt;</code>', '<code>&lt;class \'Siparis\'&gt;</code>', '<code>&lt;class \'class\'&gt;</code>'], a=1,
       why='Sınıflar da nesnedir ve varsayılan olarak type metaclass\'ının örneğidir. object, Siparis\'in taban sınıfıdır, türü değil. Siparis\'in örneklerinin türü Siparis olur.'),
  dict(t='mc', stage='Isınma',
       q='Bir sınıfa hem <code>__getattr__</code> hem normal bir <code>ad</code> özniteliği tanımlandı. <code>nesne.ad</code> okunduğunda <code>__getattr__</code> çağrılır mı?',
       o=['Evet, her öznitelik okumasında önce o çağrılır', 'Hayır; yalnız normal arama başarısız olduğunda çağrılır', 'Evet, ama sonucu yok sayılır', 'Yalnızca ad özel (_ile başlayan) ise çağrılır'], a=1,
       why='__getattr__ bir "son çare" kancasıdır: nesnenin __dict__\'inde ve sınıfta bulunamayan adlar için çalışır. Her okumada çalışan kanca __getattribute__\'tur ve bu yüzden çok daha risklidir.'),
  dict(t='mc', stage='Isınma',
       q='Anadolu Market\'te bir temel sınıftan türeyen her ödeme yöntemi sınıfı tanımlandığı anda bir kayda eklensin istiyorsun. En basit doğru araç hangisi?',
       o=['Özel bir metaclass yazmak', 'Temel sınıfa __init_subclass__ yazmak', 'Her alt sınıfı exec ile oluşturmak', 'Her alt sınıfın __init__ metodunda kaydetmek'], a=1,
       why='__init_subclass__ alt sınıf tanımlandığı anda çalışır ve metaclass gerektirmez. __init__ ise sınıf değil örnek oluşturulurken çalışır; hiç örnek oluşturulmazsa kayıt olmaz. exec gereksiz ve güvensizdir.'),
  dict(t='predict', stage='Kodu oku', q='type() ile üretilen bu sınıf ne yazdırır?',
       code=r'''def fiyatla(self, tutar):
    return tutar * (1 + self.kdv)

Urun = type("Urun", (), {"kdv": 0.2, "fiyatla": fiyatla})
u = Urun()
u.kdv = 0.1
print(Urun.__name__, Urun.kdv, u.fiyatla(100))
''',
       o=['Urun 0.2 120.0', 'Urun 0.1 110.00000000000001', 'Urun 0.2 110.00000000000001', 'TypeError'], a=2,
       why='kdv sınıf özniteliğidir (0.2); u.kdv = 0.1 yalnız örneğe yeni bir öznitelik ekler ve sınıfınkini değiştirmez. fiyatla self.kdv\'yi okurken önce örneğe bakar ve 0.1 bulur: 100 * 1.1 kayan noktada 110.00000000000001 verir.'),
  dict(t='predict', stage='Kodu oku', q='__getattr__ ile vekil nesne: bu kod ne yazdırır?',
       code=r'''class Vekil:
    def __init__(self, veri):
        self.veri = veri

    def __getattr__(self, ad):
        return self.veri.get(ad, f"<{ad} yok>")

m = Vekil({"ad": "Ayşe", "sehir": "İzmir"})
print(m.sehir, m.telefon, type(m.veri).__name__)
''',
       o=['İzmir <telefon yok> dict', 'İzmir None dict', '<sehir yok> <telefon yok> dict', 'AttributeError'], a=0,
       why='sehir ve telefon nesnede normal öznitelik olmadığı için __getattr__ çalışır ve sözlükten okur; telefon yoksa varsayılan metin döner. veri ise normal özniteliktir, __getattr__ hiç devreye girmez ve sözlüğün kendisi gelir.'),
  dict(t='predict', stage='Kodu oku', raises=True, q='Descriptor ile doğrulanan alan: bu kod ne yapar?',
       code=r'''class Pozitif:
    def __set_name__(self, sahip, ad):
        self.ad = ad
    def __get__(self, nesne, sahip=None):
        return nesne.__dict__[self.ad]
    def __set__(self, nesne, deger):
        if deger <= 0:
            raise ValueError(f"{self.ad} pozitif olmalı")
        nesne.__dict__[self.ad] = deger

class Hesap:
    limit = Pozitif()
    def __init__(self, limit):
        self.limit = limit

h = Hesap(5000)
h.limit = 0
print(h.limit)
''',
       o=['0 yazdırır', '5000 yazdırır', 'ValueError hatası verir', 'AttributeError hatası verir'], a=2,
       why='limit bir veri descriptor\'ıdır; h.limit = 0 ataması doğrudan __set__\'i çağırır. 0 &lt;= 0 olduğundan ValueError fırlar ve print satırına hiç gelinmez.'),
  dict(t='order', stage='Kodu oku',
       q='<p>Alt sınıfları <code>__init_subclass__</code> ile büyük harfli biçim adıyla kaydeden programın satırlarını sırala.</p>',
       lines=['KAYIT = {}', 'class Disari:', '    def __init_subclass__(cls, bicim, **kw):', '        cls.bicim = bicim.upper()', '        KAYIT[cls.bicim] = cls', 'class CsvDisari(Disari, bicim="csv"):', '    uzanti = ".csv"', 'print(KAYIT["CSV"].uzanti)'],
       expect='.csv\n',
       hint='Kayıt sözlüğü en önce; biçim adı önce sınıfa yazılır, sonra o adla kayda eklenir; alt sınıf temel sınıftan sonra tanımlanır.',
       why='CsvDisari tanımlandığı anda Disari.__init_subclass__ bicim="csv" ile çalışır, cls.bicim "CSV" olur ve sınıf KAYIT["CSV"] altına girer.'),
  dict(id='metaprogramlama-1', t='code', stage='Rehberli', diff=1,
       q='<p><code>sinif_uret(ad, alanlar)</code> fonksiyonunu yaz. <code>type()</code> ile adı <code>ad</code> olan yeni bir sınıf üretip döndürsün. Üretilen sınıf:</p><ul><li><code>alanlar</code> adlı bir sınıf özniteliği taşısın: alan adlarının <b>demeti</b> (tuple).</li><li><code>__init__(self, *degerler)</code>: değer sayısı alan sayısına eşit değilse <code>TypeError</code> fırlatsın; eşitse her değeri sırasıyla ilgili alan adına atasın.</li></ul><p>Örnek: <code>Musteri = sinif_uret("Musteri", ["ad", "sehir"])</code>, <code>Musteri("Ayşe", "İzmir").sehir == "İzmir"</code>.</p>',
       guide=['İçeride __init__(self, *degerler) adlı bir fonksiyon tanımla.', 'Değer sayısını len(alanlar) ile karşılaştır; farklıysa TypeError fırlat.', 'zip ile alan adlarını ve değerleri eşleyip setattr(self, alan, deger) yap.', 'type(ad, (), {...}) ile sınıfı oluştur; sözlükte "alanlar" ve "__init__" olsun.', 'Sınıfı döndür.'],
       example=r'''def selamla(self):
    return f"Merhaba, ben {self.ad}"

Personel = type("Personel", (), {"ad": "isimsiz", "selamla": selamla})
p = Personel()
setattr(p, "ad", "Can")
print(Personel.__name__, p.selamla())
''',
       start=r'''def sinif_uret(ad, alanlar):
    alanlar = tuple(alanlar)

    def __init__(self, *degerler):
        # TODO: sayı uyuşmazsa TypeError fırlat
        # TODO: her alanı setattr ile ata
        pass

    # TODO: type(...) ile sınıfı oluşturup döndür
    return None
''',
       sol=r'''def sinif_uret(ad, alanlar):
    alanlar = tuple(alanlar)

    def __init__(self, *degerler):
        if len(degerler) != len(alanlar):
            raise TypeError(f"{ad} {len(alanlar)} değer bekler, {len(degerler)} geldi")
        for alan, deger in zip(alanlar, degerler):
            setattr(self, alan, deger)

    return type(ad, (), {"alanlar": alanlar, "__init__": __init__})
''',
       tests=r'''Musteri = sinif_uret("Musteri", ["ad", "sehir"])
assert isinstance(Musteri, type), "sinif_uret bir sınıf döndürmeli (type(...) sonucu)"
assert Musteri.__name__ == "Musteri", "sınıfın adı ilk argüman olmalı"
assert Musteri.alanlar == ("ad", "sehir"), "alanlar sınıf özniteliği alan adlarının demeti olmalı"
m = Musteri("Ayşe", "İzmir")
assert m.ad == "Ayşe" and m.sehir == "İzmir", "değerler sırayla alanlara atanmalı"
try:
    Musteri("Ayşe")
    assert False, "eksik değerde TypeError fırlatılmalı"
except TypeError:
    pass
Urun = sinif_uret("Urun", ("kod", "fiyat", "stok"))
u = Urun("U-1", 85.5, 40)
assert (u.kod, u.fiyat, u.stok) == ("U-1", 85.5, 40), "farklı alan listesiyle de çalışmalı"
''',
       hints=['type üç argümanla çağrılınca yeni sınıf üretir: type(ad, tabanlar, sozluk).', 'Sözlüğe {"alanlar": alanlar, "__init__": __init__} ver; tabanlar boş demet () olabilir.', 'return type(ad, (), {"alanlar": alanlar, "__init__": __init__})'],
       why='class ifadesinin arkasında da type(ad, tabanlar, sozluk) çağrısı vardır. İç fonksiyon alanlar değişkenini kapanış (closure) olarak yakalar, böylece her üretilen sınıf kendi alan listesini bilir.'),
  dict(id='metaprogramlama-2', t='code', stage='Rehberli', diff=2,
       q='<p><code>Pozitif</code> adlı bir descriptor yaz ve onu kullanan <code>Urun</code> sınıfını tamamla.</p><ul><li><code>__set_name__</code> alan adını <code>self.ad</code>\'a kaydetsin.</li><li><code>__get__</code>: sınıf üzerinden erişimde (<code>nesne is None</code>) descriptor\'ın kendisini, aksi hâlde <code>nesne.__dict__[self.ad]</code> değerini döndürsün.</li><li><code>__set__</code>: değer <code>int</code> ya da <code>float</code> değilse (ya da <code>bool</code> ise) <code>TypeError</code>, sıfır ya da negatifse <code>ValueError</code> fırlatsın; hata mesajında alan adı geçsin. Geçerliyse değeri <b>nesnenin</b> <code>__dict__</code>\'ine yazsın.</li></ul>',
       guide=['__set_name__(self, sahip, ad) içinde self.ad = ad yap.', '__get__ içinde önce nesne None mu diye bak; öyleyse self döndür.', '__set__ içinde önce tür kontrolü: bool da int sayıldığı için ayrıca dışla.', 'Sonra değer kontrolü: deger &lt;= 0 ise ValueError.', 'Son olarak nesne.__dict__[self.ad] = deger.'],
       example=r'''class BuyukHarf:
    def __set_name__(self, sahip, ad):
        self.ad = ad
    def __get__(self, nesne, sahip=None):
        if nesne is None:
            return self
        return nesne.__dict__[self.ad]
    def __set__(self, nesne, deger):
        nesne.__dict__[self.ad] = str(deger).upper()

class Sube:
    sehir = BuyukHarf()

s = Sube()
s.sehir = "izmir"
print(s.sehir, type(Sube.sehir).__name__)
''',
       start=r'''class Pozitif:
    def __set_name__(self, sahip, ad):
        # TODO: alan adını sakla
        pass

    def __get__(self, nesne, sahip=None):
        # TODO: sınıf erişiminde self, değilse nesnedeki değer
        pass

    def __set__(self, nesne, deger):
        # TODO: tür ve değer kontrolü, sonra nesne.__dict__'e yaz
        pass


class Urun:
    fiyat = Pozitif()
    stok = Pozitif()

    def __init__(self, ad, fiyat, stok):
        self.ad = ad
        self.fiyat = fiyat
        self.stok = stok
''',
       sol=r'''class Pozitif:
    def __set_name__(self, sahip, ad):
        self.ad = ad

    def __get__(self, nesne, sahip=None):
        if nesne is None:
            return self
        return nesne.__dict__[self.ad]

    def __set__(self, nesne, deger):
        if isinstance(deger, bool) or not isinstance(deger, (int, float)):
            raise TypeError(f"{self.ad} sayı olmalı")
        if deger <= 0:
            raise ValueError(f"{self.ad} pozitif olmalı")
        nesne.__dict__[self.ad] = deger


class Urun:
    fiyat = Pozitif()
    stok = Pozitif()

    def __init__(self, ad, fiyat, stok):
        self.ad = ad
        self.fiyat = fiyat
        self.stok = stok
''',
       tests=r'''cay = Urun("Çay", 85.5, 40)
kahve = Urun("Kahve", 240, 12)
assert cay.fiyat == 85.5 and kahve.fiyat == 240, "her ürün kendi fiyatını tutmalı (değeri nesnede sakla, descriptor'da değil)"
assert cay.stok == 40, "stok okunabilmeli"
assert isinstance(Urun.fiyat, Pozitif), "Urun.fiyat (sınıf erişimi) descriptor'ın kendisini döndürmeli"
for kotu, hata in [(-5, ValueError), (0, ValueError), ("10", TypeError), (True, TypeError)]:
    try:
        cay.stok = kotu
        assert False, f"stok = {kotu!r} için {hata.__name__} bekleniyordu"
    except hata as h:
        assert "stok" in str(h), "hata mesajında alan adı (stok) geçmeli"
assert cay.stok == 40, "geçersiz atama eski değeri bozmamalı"
''',
       hints=['Descriptor sınıf düzeyinde tek bir nesnedir; değeri nesne.__dict__ içinde self.ad anahtarıyla tut.', 'bool, int\'in alt sınıfıdır: isinstance(True, int) True verir; önce isinstance(deger, bool) kontrol et.', 'raise ValueError(f"{self.ad} pozitif olmalı") ve sonunda nesne.__dict__[self.ad] = deger'],
       why='__set_name__ sayesinde descriptor hangi ada bağlandığını bilir ve aynı sınıf iki alan için yeniden kullanılır. Değeri nesnenin __dict__\'inde tutmak her örneğin kendi değerine sahip olmasını sağlar.'),
  dict(id='metaprogramlama-3', t='code', stage='Rehberli', diff=2,
       q='<p><code>zorunlu_parametreler(fn)</code> fonksiyonunu yaz. <code>inspect.signature</code> ile <code>fn</code>\'in parametrelerini gezsin ve <b>varsayılan değeri olmayan</b>, <code>*args</code> ya da <code>**kwargs</code> türünde <b>olmayan</b> parametrelerin adlarını sırasıyla bir liste olarak döndürsün.</p><p>Örnek: <code>def f(a, b=1, *args, c, d=2, **kw)</code> için <code>["a", "c"]</code>.</p>',
       guide=['inspect modülünü içe aktar ve inspect.signature(fn) ile imzayı al.', 'imza.parameters.values() üzerinde gez.', 'p.default is inspect.Parameter.empty ise varsayılanı yoktur.', 'p.kind VAR_POSITIONAL (*args) ya da VAR_KEYWORD (**kwargs) ise atla.', 'Uyanların adını (p.name) listeye ekle ve döndür.'],
       example=r'''import inspect

def havale(gonderen, alici, tutar=0, *, aciklama=""):
    pass

for p in inspect.signature(havale).parameters.values():
    print(p.name, p.kind.name, p.default is inspect.Parameter.empty)
''',
       start=r'''import inspect

def zorunlu_parametreler(fn):
    sonuc = []
    # TODO: imzayı al, parametreleri gez
    # TODO: varsayılanı olmayan ve *args/**kwargs olmayanları ekle
    return sonuc
''',
       sol=r'''import inspect

def zorunlu_parametreler(fn):
    sonuc = []
    for p in inspect.signature(fn).parameters.values():
        if p.kind in (p.VAR_POSITIONAL, p.VAR_KEYWORD):
            continue
        if p.default is inspect.Parameter.empty:
            sonuc.append(p.name)
    return sonuc
''',
       tests=r'''def f(a, b=1, *args, c, d=2, **kw):
    pass
assert zorunlu_parametreler(f) == ["a", "c"], "f için ['a', 'c'] beklenir: b ve d'nin varsayılanı var, args/kw değişken sayılı"
def kredi(musteri_no, tutar, vade=12):
    pass
assert zorunlu_parametreler(kredi) == ["musteri_no", "tutar"], "kredi için ['musteri_no', 'tutar']"
assert zorunlu_parametreler(lambda: 0) == [], "parametresiz fonksiyon için boş liste"
assert zorunlu_parametreler(lambda *a, **k: 0) == [], "*args ve **kwargs zorunlu sayılmaz"
''',
       hints=['Parametrenin varsayılanı yoksa p.default değeri özel inspect.Parameter.empty nesnesidir.', 'p.kind == inspect.Parameter.VAR_POSITIONAL *args, VAR_KEYWORD **kwargs demektir.', 'if p.kind not in (p.VAR_POSITIONAL, p.VAR_KEYWORD) and p.default is inspect.Parameter.empty: sonuc.append(p.name)'],
       why='pytest ve FastAPI gibi çerçeveler aynı yöntemle bir fonksiyonun hangi bilgileri istediğini okur ve çağırırken bunları sağlar.'),
  dict(id='metaprogramlama-4', t='code', stage='Kendin yaz', diff=2,
       q='<p>Bildirim eklenti sistemi kur. <code>Bildirim</code> temel sınıfını yaz:</p><ul><li><code>kanallar</code> adlı boş bir sözlük sınıf özniteliği olsun.</li><li><code>__init_subclass__</code>: alt sınıfın <code>kanal</code> sınıf özniteliği (metin) yoksa <code>TypeError</code>; aynı kanal zaten kayıtlıysa <code>ValueError</code> fırlatsın; aksi hâlde <code>Bildirim.kanallar[kanal] = alt_sinif</code> yapsın.</li></ul><p>Ayrıca <code>bildirim_gonder(kanal, mesaj)</code> fonksiyonunu yaz: kayıtlı sınıftan bir örnek oluşturup <code>gonder(mesaj)</code> sonucunu döndürsün; kanal kayıtlı değilse <code>KeyError</code> fırlasın.</p>',
       start=r'''class Bildirim:
    pass


def bildirim_gonder(kanal, mesaj):
    pass
''',
       sol=r'''class Bildirim:
    kanallar = {}

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        kanal = cls.__dict__.get("kanal")
        if not isinstance(kanal, str):
            raise TypeError(f"{cls.__name__} bir kanal adı tanımlamalı")
        if kanal in Bildirim.kanallar:
            raise ValueError(f"{kanal} kanalı zaten kayıtlı")
        Bildirim.kanallar[kanal] = cls


def bildirim_gonder(kanal, mesaj):
    return Bildirim.kanallar[kanal]().gonder(mesaj)
''',
       tests=r'''class Sms(Bildirim):
    kanal = "sms"
    def gonder(self, mesaj):
        return f"SMS: {mesaj[:20]}"
class Eposta(Bildirim):
    kanal = "eposta"
    def gonder(self, mesaj):
        return f"E-posta: {mesaj}"
assert set(Bildirim.kanallar) == {"sms", "eposta"}, "tanımlanan iki alt sınıf otomatik kaydedilmeli"
assert Bildirim.kanallar["sms"] is Sms, "kayıtta sınıfın kendisi tutulmalı"
assert bildirim_gonder("eposta", "Siparişin kargoda") == "E-posta: Siparişin kargoda", "bildirim_gonder kayıtlı sınıfın gonder sonucunu döndürmeli"
try:
    class Faks(Bildirim):
        def gonder(self, m):
            return m
    assert False, "kanal özniteliği olmayan alt sınıf TypeError vermeli"
except TypeError:
    pass
try:
    class Sms2(Bildirim):
        kanal = "sms"
    assert False, "aynı kanal ikinci kez kaydedilince ValueError beklenir"
except ValueError:
    pass
try:
    bildirim_gonder("guvercin", "x")
    assert False, "kayıtsız kanal KeyError vermeli"
except KeyError:
    pass
''',
       hints=['__init_subclass__(cls, **kwargs) alt sınıf tanımlanınca o sınıfla çağrılır.', 'Kanal adını cls.__dict__.get("kanal") ile oku; getattr kullanırsan alt sınıfın alt sınıfı da üst sınıfın kanalını görür ve yanlışlıkla çakışır.', 'Kayıt için Bildirim.kanallar[kanal] = cls; gönderimde Bildirim.kanallar[kanal]().gonder(mesaj).'],
       why='Yeni bir kanal eklemek artık yalnızca bir alt sınıf yazmaktır; merkezi kodda if/elif zinciri yoktur. Doğrulama sınıf tanımı anında çalıştığı için eksik tanım uygulama açılırken hemen yakalanır.'),
  dict(id='metaprogramlama-5', t='code', stage='Kendin yaz', diff=2,
       q='<p><code>otomatik_repr</code> adlı bir <b>sınıf dekoratörü</b> yaz. Dekoratör sınıfa bir <code>__repr__</code> eklesin ve sınıfın kendisini döndürsün. <code>repr(nesne)</code> şu biçimde olsun: <code>SinifAdi(alan1=deger1!r, alan2=deger2!r)</code>; alanlar nesnenin <code>__dict__</code>\'indeki sırayla gelsin. Örnek: <code>Urun(ad=\'Çay\', fiyat=85.5)</code>. Alanı olmayan nesne için <code>SinifAdi()</code>.</p>',
       start=r'''def otomatik_repr(cls):
    pass
''',
       sol=r'''def otomatik_repr(cls):
    def __repr__(self):
        icerik = ", ".join(f"{k}={v!r}" for k, v in vars(self).items())
        return f"{type(self).__name__}({icerik})"
    cls.__repr__ = __repr__
    return cls
''',
       tests=r'''@otomatik_repr
class Urun:
    def __init__(self, ad, fiyat):
        self.ad = ad
        self.fiyat = fiyat
assert isinstance(Urun, type), "dekoratör sınıfı geri döndürmeli (return cls unutulmuş olabilir)"
assert repr(Urun("Çay", 85.5)) == "Urun(ad='Çay', fiyat=85.5)", "repr alan=değer!r biçiminde olmalı"
@otomatik_repr
class Bos:
    pass
assert repr(Bos()) == "Bos()", "alansız nesne için SinifAdi()"
class OzelUrun(Urun):
    pass
assert repr(OzelUrun("Kahve", 240)) == "OzelUrun(ad='Kahve', fiyat=240)", "alt sınıfta kendi adı görünmeli: type(self).__name__ kullan"
''',
       hints=['Sınıf dekoratörü sınıfı parametre olarak alır, üzerine öznitelik atar ve sınıfı döndürür.', 'vars(self) nesnenin __dict__\'ini verir; ekleme sırası korunur.', 'Sınıf adını cls.__name__ yerine type(self).__name__ ile al ki alt sınıflar doğru görünsün.'],
       why='dataclass da aynı yöntemle çalışır: sınıfı inceler, üzerine __init__/__repr__/__eq__ ekler ve aynı sınıfı döndürür.'),
  dict(id='metaprogramlama-6', t='code', stage='Kendin yaz', diff=2,
       q='<p><code>SaltOkunurAyar</code> sınıfını yaz. Kurucu <code>SaltOkunurAyar(degerler: dict, varsayilan: dict)</code>.</p><ul><li><code>a.ad</code> okunduğunda önce <code>degerler</code>, sonra <code>varsayilan</code> sözlüğüne bakılsın; ikisinde de yoksa mesajında adın geçtiği <code>AttributeError</code> fırlasın.</li><li>Nesneye her türlü atama (<code>a.x = ...</code>) <code>AttributeError("salt okunur")</code> fırlatsın.</li></ul><p>İpucu: <code>__setattr__</code> yasaklandığı için kurucu içinde kendi alanlarını başka bir yolla kaydetmen gerekecek.</p>',
       start=r'''class SaltOkunurAyar:
    def __init__(self, degerler, varsayilan):
        self.degerler = degerler
        self.varsayilan = varsayilan
''',
       sol=r'''class SaltOkunurAyar:
    def __init__(self, degerler, varsayilan):
        object.__setattr__(self, "_degerler", dict(degerler))
        object.__setattr__(self, "_varsayilan", dict(varsayilan))

    def __getattr__(self, ad):
        if ad.startswith("_"):
            raise AttributeError(ad)
        if ad in self._degerler:
            return self._degerler[ad]
        if ad in self._varsayilan:
            return self._varsayilan[ad]
        raise AttributeError(f"Bilinmeyen ayar: {ad}")

    def __setattr__(self, ad, deger):
        raise AttributeError("salt okunur")
''',
       tests=r'''a = SaltOkunurAyar({"sayfa_boyu": 50}, {"sayfa_boyu": 20, "para_birimi": "TRY"})
assert a.sayfa_boyu == 50, "degerler sözlüğü varsayılandan önce gelmeli"
assert a.para_birimi == "TRY", "degerler'de yoksa varsayılana düşmeli"
try:
    a.tema
    assert False, "bilinmeyen ayar AttributeError vermeli"
except AttributeError as h:
    assert "tema" in str(h), "hata mesajında ayarın adı geçmeli"
try:
    a.sayfa_boyu = 5
    assert False, "atama AttributeError vermeli"
except AttributeError:
    pass
assert a.sayfa_boyu == 50, "başarısız atama değeri değiştirmemeli"
assert hasattr(a, "para_birimi") and not hasattr(a, "yok"), "hasattr doğru çalışmalı (AttributeError fırlatılmalı, başka hata değil)"
''',
       hints=['__getattr__ yalnız bulunamayan adlarda çalışır; sözlükleri kendin ara.', '__setattr__ her atamada çalışır, __init__ içindekiler dahil. Kurucuda object.__setattr__(self, "_degerler", ...) kullan.', '__getattr__ içinde _ ile başlayan iç adlar için doğrudan AttributeError fırlat; aksi hâlde kopyalama/pickle sırasında sonsuz döngüye girebilir.'],
       why='Salt okunur nesnelerde gerçek atama object.__setattr__ ile __setattr__ kancası atlanarak yapılır. Python\'un kendi frozen dataclass\'ı da tam olarak bu yöntemi kullanır.'),
  dict(id='metaprogramlama-7', t='code', stage='Kendin yaz', diff=2,
       q='<p><code>fonksiyon_raporu(kaynak)</code> fonksiyonunu yaz. <code>kaynak</code> bir Python kodu metnidir. <code>ast</code> ile ayrıştırıp kod içindeki <b>tüm</b> fonksiyon tanımlarını (iç içe olanlar ve sınıf metotları dahil, <code>async def</code> dahil) bulsun ve <code>{fonksiyon_adı: konumsal_parametre_sayısı}</code> sözlüğü döndürsün. Parametre sayısı <code>dugum.args.args</code> listesinin uzunluğudur. Kodu <b>çalıştırma</b>.</p>',
       start=r'''import ast

def fonksiyon_raporu(kaynak):
    return {}
''',
       sol=r'''import ast

def fonksiyon_raporu(kaynak):
    rapor = {}
    for dugum in ast.walk(ast.parse(kaynak)):
        if isinstance(dugum, (ast.FunctionDef, ast.AsyncFunctionDef)):
            rapor[dugum.name] = len(dugum.args.args)
    return rapor
''',
       tests=r'''kod = """
import os
def topla(a, b):
    def ic(x):
        return x
    return a + b

class Hesap:
    def yatir(self, tutar, aciklama=""):
        os.remove("x")

async def getir(url):
    pass
"""
r = fonksiyon_raporu(kod)
assert r == {"topla": 2, "ic": 1, "yatir": 3, "getir": 1}, f"beklenen {{'topla': 2, 'ic': 1, 'yatir': 3, 'getir': 1}}, gelen {r}"
assert fonksiyon_raporu("x = 1") == {}, "fonksiyonsuz kod için boş sözlük"
assert "remove" not in str(r), "kod çalıştırılmamalı, yalnız ağaç okunmalı"
''',
       hints=['ast.parse(kaynak) ağacı verir; ast.walk(agac) tüm düğümleri tek tek gezer.', 'async def için ayrı düğüm türü vardır: ast.AsyncFunctionDef.', 'isinstance(dugum, (ast.FunctionDef, ast.AsyncFunctionDef)) ise rapor[dugum.name] = len(dugum.args.args)'],
       why='ast.walk, NodeVisitor yazmadan tüm ağacı gezmenin en kısa yoludur; sıra önemli değilse yeterlidir. Kodu çalıştırmadan analiz ettiğin için zararlı kod bile güvenle incelenir.'),
  dict(id='metaprogramlama-8', t='code', stage='Hata avı', kind='bug', diff=2,
       q='<p>Anadolu Bank\'ın müşteri kayıtlarında <code>Metin</code> descriptor\'ı ad alanlarını boşluklardan temizleyip doğruluyor. Ama ikinci müşteri oluşturulunca birincinin adı da değişiyor. <b>Hatayı bul ve düzelt.</b> Davranış: boş ya da yalnız boşluktan oluşan metinde <code>ValueError</code>, aksi hâlde kırpılmış metin saklanır.</p>',
       start=r'''class Metin:
    def __set_name__(self, sahip, ad):
        self.ad = ad

    def __get__(self, nesne, sahip=None):
        if nesne is None:
            return self
        return self.deger

    def __set__(self, nesne, deger):
        deger = str(deger).strip()
        if not deger:
            raise ValueError(f"{self.ad} boş olamaz")
        self.deger = deger


class Musteri:
    ad = Metin()
    sehir = Metin()

    def __init__(self, ad, sehir):
        self.ad = ad
        self.sehir = sehir
''',
       sol=r'''class Metin:
    def __set_name__(self, sahip, ad):
        self.ad = ad

    def __get__(self, nesne, sahip=None):
        if nesne is None:
            return self
        return nesne.__dict__[self.ad]

    def __set__(self, nesne, deger):
        deger = str(deger).strip()
        if not deger:
            raise ValueError(f"{self.ad} boş olamaz")
        nesne.__dict__[self.ad] = deger


class Musteri:
    ad = Metin()
    sehir = Metin()

    def __init__(self, ad, sehir):
        self.ad = ad
        self.sehir = sehir
''',
       tests=r'''m1 = Musteri("  Ayşe ", "İzmir")
m2 = Musteri("Mehmet", " Ankara")
assert m1.ad == "Ayşe", "ikinci müşteri birincinin adını ezmemeli: değeri descriptor'da değil nesnede sakla"
assert m2.ad == "Mehmet" and m2.sehir == "Ankara", "değerler kırpılmış saklanmalı"
assert m1.sehir == "İzmir", "her nesne kendi şehrini tutmalı"
try:
    m1.ad = "   "
    assert False, "boş ad ValueError vermeli"
except ValueError:
    pass
assert m1.ad == "Ayşe", "başarısız atama eski değeri korumalı"
''',
       hints=['Descriptor nesnesi sınıfa ait tek bir nesnedir; Musteri\'nin tüm örnekleri onu paylaşır.', 'self.deger tüm müşteriler için ortak bir kutudur.', 'Değeri nesne.__dict__[self.ad] içine yaz ve oradan oku.'],
       why='Descriptor\'da tutulan durum, sınıf özniteliği gibi davranır: tüm örnekler paylaşır. Örneğe özgü veri her zaman örneğin __dict__\'inde (ya da WeakKeyDictionary\'de) tutulmalıdır.'),
  dict(id='metaprogramlama-9', t='code', stage='Hata avı', kind='bug', diff=2,
       q='<p><code>IzlenenKayit</code> sınıfı, kurucudan sonra değeri <b>gerçekten değişen</b> alanların adlarını <code>degisenler</code> listesinde sırayla tutmalı (aynı değer yeniden atanırsa kaydetmemeli). Ama nesne oluşturmaya çalışınca program çöküyor. <b>Hataları bul ve düzelt.</b> Kurucudaki atamalar değişiklik sayılmaz.</p>',
       start=r'''class IzlenenKayit:
    def __init__(self, **alanlar):
        self.degisenler = []
        for ad, deger in alanlar.items():
            setattr(self, ad, deger)

    def __setattr__(self, ad, deger):
        if getattr(self, ad, None) != deger:
            self.degisenler.append(ad)
        setattr(self, ad, deger)
''',
       sol=r'''class IzlenenKayit:
    def __init__(self, **alanlar):
        object.__setattr__(self, "degisenler", [])
        for ad, deger in alanlar.items():
            object.__setattr__(self, ad, deger)

    def __setattr__(self, ad, deger):
        if getattr(self, ad, None) != deger:
            self.degisenler.append(ad)
        object.__setattr__(self, ad, deger)
''',
       tests=r'''k = IzlenenKayit(ad="Ayşe", sehir="İzmir", bakiye=100)
assert k.degisenler == [], "kurucudaki atamalar değişiklik sayılmamalı"
k.sehir = "Ankara"
k.bakiye = 100
k.bakiye = 250
k.telefon = "555"
assert k.sehir == "Ankara" and k.bakiye == 250, "atamalar gerçekten uygulanmalı"
assert k.degisenler == ["sehir", "bakiye", "telefon"], f"yalnız değeri değişen alanlar sırayla tutulmalı, gelen {k.degisenler}"
''',
       hints=['__setattr__ içindeki setattr(self, ...) yine __setattr__\'ı çağırır: sonsuz özyineleme.', 'Kurucudaki self.degisenler = [] de __setattr__\'a gider; o anda degisenler henüz yoktur.', 'Gerçek atamaları object.__setattr__(self, ad, deger) ile yap.'],
       why='__setattr__ her atamayı yakalar, kendi içindeki atamaları da. Kancayı atlayan object.__setattr__ hem özyinelemeyi bitirir hem de kurucudaki ilk değerlerin "değişiklik" sayılmasını önler.'),
  dict(id='metaprogramlama-10', t='code', stage='Meydan okuma', diff=3,
       q='<p>Kampanya ekibi formülleri metin olarak giriyor. <code>eval</code> kullanmadan <code>guvenli_hesapla(ifade, degiskenler)</code> fonksiyonunu yaz. <code>ast.parse(ifade, mode="eval")</code> ile ağacı al ve özyinelemeli olarak değerlendir. İzin verilenler:</p><ul><li>Sayı sabitleri (<code>int</code>, <code>float</code>; <code>bool</code> ve metin değil)</li><li><code>degiskenler</code> sözlüğündeki adlar</li><li>İkili işlemler: <code>+ - * / // % **</code>; tekli <code>-</code> ve <code>+</code></li></ul><p>Bunların dışındaki her şey (fonksiyon çağrısı, öznitelik erişimi, bilinmeyen ad, metin, karşılaştırma, sözdizimi hatası) <code>ValueError</code> fırlatsın.</p>',
       start=r'''import ast

def guvenli_hesapla(ifade, degiskenler):
    return eval(ifade, {}, degiskenler)
''',
       sol=r'''import ast
import operator

IKILI = {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul,
         ast.Div: operator.truediv, ast.FloorDiv: operator.floordiv,
         ast.Mod: operator.mod, ast.Pow: operator.pow}
TEKLI = {ast.USub: operator.neg, ast.UAdd: operator.pos}

def guvenli_hesapla(ifade, degiskenler):
    try:
        agac = ast.parse(ifade, mode="eval")
    except SyntaxError as h:
        raise ValueError(f"Sözdizimi hatası: {h}") from None

    def degerlendir(d):
        if isinstance(d, ast.Expression):
            return degerlendir(d.body)
        if isinstance(d, ast.Constant) and type(d.value) in (int, float):
            return d.value
        if isinstance(d, ast.Name):
            if d.id not in degiskenler:
                raise ValueError(f"Bilinmeyen ad: {d.id}")
            return degiskenler[d.id]
        if isinstance(d, ast.BinOp) and type(d.op) in IKILI:
            return IKILI[type(d.op)](degerlendir(d.left), degerlendir(d.right))
        if isinstance(d, ast.UnaryOp) and type(d.op) in TEKLI:
            return TEKLI[type(d.op)](degerlendir(d.operand))
        raise ValueError(f"İzin verilmeyen ifade: {type(d).__name__}")

    return degerlendir(agac)
''',
       tests=r'''v = {"fiyat": 200, "adet": 3, "indirim": 0.25}
assert guvenli_hesapla("fiyat * adet * (1 - indirim)", v) == 450.0, "aritmetik ve parantez çalışmalı"
assert guvenli_hesapla("-fiyat + 2 ** 3 // 3 % 5", v) == -198, "tekli eksi, üs, tam bölme, mod çalışmalı"
assert guvenli_hesapla("10 / 4", {}) == 2.5, "sabitlerle bölme"
kotuler = ["__import__('os').getcwd()", "fiyat.real", "bilinmeyen + 1", "'a' * 3", "fiyat > 5", "fiyat +", "True + 1", "[1, 2]"]
for k in kotuler:
    try:
        guvenli_hesapla(k, v)
        assert False, f"{k!r} reddedilmeliydi (ValueError)"
    except ValueError:
        pass
''',
       hints=['ast.parse(ifade, mode="eval") bir ast.Expression döndürür; asıl ifade .body içindedir.', 'Düğüm türüne göre dallan: Constant, Name, BinOp, UnaryOp; operatörleri ast.Add → operator.add gibi bir sözlükle eşle.', 'Sabitte type(d.value) in (int, float) kontrolü bool\'u da dışlar (type(True) bool\'dur). Tanımadığın her düğümde ValueError fırlat; SyntaxError\'ı da ValueError\'a çevir.'],
       why='Beyaz liste (whitelist) yaklaşımı: yalnız tanıdığın düğümleri değerlendirir, gerisini reddedersin. Kara liste (ör. "__ geçiyorsa reddet") her zaman aşılabilir; beyaz liste ise yeni bir saldırı tekniğinde bile varsayılan olarak "hayır" der.'),
  dict(id='metaprogramlama-11', t='code', stage='Mini proje', diff=3,
       q='<p>Mini bir model katmanı kur (SQLAlchemy/Django modellerinin özü).</p><ul><li><code>Alan(tip, zorunlu=True)</code> descriptor\'ı: <code>__set_name__</code> ile adını öğrensin; <code>__set__</code> değer <code>None</code> değilse ve <code>tip</code> örneği değilse <code>TypeError</code> fırlatsın, değeri nesnenin <code>__dict__</code>\'ine yazsın; <code>__get__</code> değeri döndürsün (atanmamışsa <code>None</code>; sınıf erişiminde descriptor\'ın kendisi).</li><li><code>Model</code> temel sınıfı: <code>kayit</code> sözlüğü (sınıf adı → sınıf). <code>__init_subclass__</code> alt sınıfı kaydetsin ve alt sınıfın gövdesindeki <code>Alan</code> adlarını tanım sırasıyla <code>cls.alanlar</code> listesine koysun.</li><li><code>Model.__init__(self, **veri)</code>: bilinmeyen anahtar varsa <code>TypeError</code>; zorunlu alan eksikse <code>TypeError</code>; değerleri ata.</li><li><code>sozluk(self)</code>: <code>{alan: değer}</code> sözlüğü (alan sırasıyla).</li></ul>',
       start=r'''class Alan:
    def __init__(self, tip, zorunlu=True):
        self.tip = tip
        self.zorunlu = zorunlu


class Model:
    kayit = {}
''',
       sol=r'''class Alan:
    def __init__(self, tip, zorunlu=True):
        self.tip = tip
        self.zorunlu = zorunlu

    def __set_name__(self, sahip, ad):
        self.ad = ad

    def __get__(self, nesne, sahip=None):
        if nesne is None:
            return self
        return nesne.__dict__.get(self.ad)

    def __set__(self, nesne, deger):
        if deger is not None and not isinstance(deger, self.tip):
            raise TypeError(f"{self.ad} {self.tip.__name__} olmalı")
        nesne.__dict__[self.ad] = deger


class Model:
    kayit = {}

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        cls.alanlar = [ad for ad, d in cls.__dict__.items() if isinstance(d, Alan)]
        Model.kayit[cls.__name__] = cls

    def __init__(self, **veri):
        bilinmeyen = set(veri) - set(self.alanlar)
        if bilinmeyen:
            raise TypeError(f"Bilinmeyen alan: {sorted(bilinmeyen)}")
        for ad in self.alanlar:
            alan = type(self).__dict__[ad]
            if alan.zorunlu and veri.get(ad) is None:
                raise TypeError(f"{ad} zorunlu")
            setattr(self, ad, veri.get(ad))

    def sozluk(self):
        return {ad: getattr(self, ad) for ad in self.alanlar}
''',
       tests=r'''class Musteri(Model):
    ad = Alan(str)
    sehir = Alan(str)
    yas = Alan(int, zorunlu=False)
class Siparis(Model):
    no = Alan(str)
    tutar = Alan((int, float))
assert Model.kayit == {"Musteri": Musteri, "Siparis": Siparis}, "alt sınıflar adlarıyla kaydedilmeli"
assert Musteri.alanlar == ["ad", "sehir", "yas"], "alanlar tanım sırasıyla toplanmalı"
m = Musteri(ad="Ayşe", sehir="İzmir")
assert m.sozluk() == {"ad": "Ayşe", "sehir": "İzmir", "yas": None}, "zorunlu olmayan atanmamış alan None olmalı"
assert Siparis(no="AM-1", tutar=99.9).sozluk() == {"no": "AM-1", "tutar": 99.9}, "tip demeti de kabul edilmeli"
for kotu in [dict(ad="Ayşe"), dict(ad="Ayşe", sehir="İzmir", eposta="x"), dict(ad="Ayşe", sehir=34)]:
    try:
        Musteri(**kotu)
        assert False, f"{kotu} TypeError vermeliydi"
    except TypeError:
        pass
try:
    m.yas = "otuz"
    assert False, "yanlış tipte atama TypeError vermeli"
except TypeError:
    pass
m.yas = 30
assert m.yas == 30 and isinstance(Musteri.ad, Alan), "geçerli atama çalışmalı; sınıf erişimi descriptor döndürmeli"
''',
       hints=['Alanları toplamak için __init_subclass__ içinde cls.__dict__.items() üzerinde gez ve isinstance(d, Alan) olanları al; sözlük tanım sırasını korur.', 'Zorunluluk kontrolü için descriptor\'a type(self).__dict__[ad] ile eriş; atamayı setattr(self, ad, deger) ile yap ki __set__ çalışsın.', 'Bilinmeyen anahtarlar: set(veri) - set(self.alanlar) boş değilse TypeError.'],
       why='Bu yapı Django modellerinin ve SQLAlchemy\'nin bildirimsel (declarative) katmanının sadeleştirilmiş hâlidir: descriptor alan düzeyinde doğrular, __init_subclass__ sınıf düzeyinde alanları toplar ve kaydeder.'),
]

L = dict(
  id='metaprogramlama', lv='ileri', mod='Mimari', min=55,
  title='Metaprogramlama: type, descriptor, __init_subclass__, inspect ve ast',
  sum='Kodu yöneten kod: type() ile sınıf üretir, __init_subclass__ ile eklenti kaydı kurar, descriptor ile alan doğrular, öznitelik kancalarını, metaclass\'ı, inspect ve ast\'ı doğru yerde kullanır, eval tuzağından kaçınırsın.',
  goals=['type() ile çalışma anında sınıf üretebilir, sınıfların da nesne olduğunu açıklayabilirim.', '__init_subclass__ ve sınıf dekoratörleriyle eklenti kaydı ve otomatik davranış ekleyebilirim.', 'Descriptor protokolüyle yeniden kullanılabilir doğrulanan alanlar yazabilirim.', '__getattr__, __setattr__ ve metaclass\'ı ne zaman kullanacağımı, ne zaman kaçınacağımı bilirim.', 'inspect ile imza okur, ast ile kodu çalıştırmadan çözümler, eval yerine güvenli alternatif kurarım.'],
  body=body, ex=ex,
  faq=[
    dict(q='Metaclass öğrenmeden ileri Python geliştiricisi olabilir miyim?', a='Evet. Metaclass\'ı okuyabilmek (ör. Enum ya da ABC\'nin nasıl çalıştığını anlamak) yeterlidir. Kendi kodunda ihtiyaçların neredeyse tamamını sınıf dekoratörü, __init_subclass__ ve descriptor karşılar.'),
    dict(q='property ile descriptor arasındaki fark ne?', a='property, tek bir alan için yazılmış hazır bir descriptor\'dır. Aynı kuralı birçok alana ya da birçok sınıfa uygulayacaksan kendi descriptor sınıfını yazarsın; property\'yi her alan için tekrar tekrar yazmak zorunda kalmazsın.'),
    dict(q='ast.literal_eval güvenli mi?', a='Yalnız sabit değerleri (sayı, metin, demet, liste, sözlük, küme, True/False/None) kabul eder, fonksiyon çağıramaz; bu anlamda güvenlidir. Ancak çok büyük ya da derin girdilerde bellek ve süre tüketebilir, bu yüzden girdinin boyutunu yine sınırla. JSON verisi için json.loads tercih et.'),
    dict(q='__init_subclass__ temel sınıfın kendisi için de çalışır mı?', a='Hayır. Yalnızca o sınıftan türeyen alt sınıflar tanımlandığında çalışır. Temel sınıfı da kayda eklemek istiyorsan bunu sınıf tanımından sonra elle yaparsın.'),
    dict(q='Dinamik import yerine her şeyi en başta import etmek daha iyi değil mi?', a='Genelde evet: açık import\'lar okunur ve araçlar tarafından denetlenir. Dinamik import, hangi modülün yükleneceği yapılandırmaya ya da eklentiye bağlı olduğunda (gunicorn app yolu, eklenti listesi) ya da ağır bir modülü yalnız gerektiğinde yüklemek istediğinde kullanılır.'),
  ],
  mistakes=[
    dict(why='Descriptor sınıfa aittir; değeri self\'te tutmak tüm örneklerin aynı değeri paylaşmasına yol açar.',
         bad='def __set__(self, nesne, deger):\n    self.deger = deger', good='def __set__(self, nesne, deger):\n    nesne.__dict__[self.ad] = deger'),
    dict(why='__setattr__ içinde normal atama kancayı yeniden çağırır ve RecursionError verir.',
         bad='def __setattr__(self, ad, deger):\n    setattr(self, ad, deger)', good='def __setattr__(self, ad, deger):\n    object.__setattr__(self, ad, deger)'),
    dict(why='Sınıf dekoratörü sınıfı döndürmezse sınıf adı None olur ve ilk kullanımda TypeError alırsın.',
         bad='def kaydet(cls):\n    KAYIT[cls.__name__] = cls', good='def kaydet(cls):\n    KAYIT[cls.__name__] = cls\n    return cls'),
    dict(why='Dışarıdan gelen metni eval\'e vermek keyfi kod çalıştırmaya izin verir; sabit veri için literal_eval ya da json kullan.',
         bad='veri = eval(istek_govdesi)', good='import ast\nveri = ast.literal_eval(istek_govdesi)'),
    dict(why='__init_subclass__ içinde super() çağrılmazsa çoklu kalıtımda diğer tabanların kancaları çalışmaz.',
         bad='def __init_subclass__(cls, **kw):\n    KAYIT.append(cls)', good='def __init_subclass__(cls, **kw):\n    super().__init_subclass__(**kw)\n    KAYIT.append(cls)'),
  ])

emit(L, '/home/claude/py/v2/i4/metaprogramlama.js')
