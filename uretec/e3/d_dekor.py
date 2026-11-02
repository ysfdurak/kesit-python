EXT = dict(id='dekoratorler', min=45)

EXT['html'] = r'''
<h2>Derinleş: dekoratör ve bağlam yöneticisinin ince işleri</h2>
<p>Sarıcı fonksiyonu, <code>functools.wraps</code>'u, parametreli dekoratörü, <code>lru_cache</code>'i ve bağlam yöneticilerini gördün. Bu bölüm, çerçevelerin (Flask, pytest, Click) içinde her gün karşılaştığın ama nadiren açıklanan noktaları topluyor: dekoratörün <b>ne zaman</b> çalıştığı, kayıt (registry) dekoratörleri, üst üste dekoratörlerin çalışma sırası, hem parantezli hem parantezsiz kullanılabilen dekoratörler, önbelleği yönetmek ve <code>contextlib</code>'in az bilinen araçları. Sınıfın içindeki <code>@property</code>, <code>@staticmethod</code> gibi yerleşik dekoratörler <b>Kapsülleme ve özellikler</b> dersinde, metasınıflar ve sınıf dekoratörlerinin derini <b>Metaprogramlama</b> dersinde.</p>

<h3>Dekoratör tanım anında çalışır</h3>
<p><code>@dekorator</code> satırı fonksiyon <b>tanımlanırken</b>, yani modül yüklenirken (import anında) bir kez çalışır; sarıcı ise her çağrıda çalışır. Bu fark sayesinde "kayıt dekoratörü" yazabilirsin: fonksiyonu hiç sarmadan bir sözlüğe ekler ve aynen geri döndürür. Flask'ın <code>@app.route("/")</code>'u ve pytest'in fikstürleri bu kalıbı kullanır.</p>
<pre class="py">
RAPORLAR = {}

def rapor(ad):
    def kaydet(fonk):
        print(f"kayıt: {ad} → {fonk.__name__}")
        RAPORLAR[ad] = fonk
        return fonk                 # sarmadan aynen döndür
    return kaydet

@rapor("ciro")
def ciro_raporu(veri):
    return sum(veri)

@rapor("adet")
def adet_raporu(veri):
    return len(veri)

print("Program başladı, kayıtlı raporlar:", list(RAPORLAR))
for ad in ["adet", "ciro"]:
    print(ad, "=", RAPORLAR[ad]([120, 80, 300]))
</pre>
<div class="tip"><b>if/elif yerine kayıt</b>Yeni bir rapor eklemek için ana programa dokunmazsın; yeni fonksiyonu yazar, üstüne <code>@rapor("yeni")</code> koyarsın. Ana program yalnız <code>RAPORLAR</code> sözlüğünü dolaşır.</div>

<h3>Üst üste dekoratörler: içten dışa sarar, dıştan içe çalışır</h3>
<p><code>@a</code> üstte, <code>@b</code> altta ise sonuç <code>a(b(f))</code> olur: önce b sarar, sonra a onu sarar. Çağrı geldiğinde ise en dıştaki (a) sarıcı ilk çalışır. Bu yüzden sıra anlamlıdır: yetki kontrolü önbellekten <b>önce</b> (daha dışta) olmalı, yoksa yetkisiz kullanıcı önbellekteki sonucu alır.</p>
<pre class="py">
from functools import wraps

def etiket(ad):
    def dekorator(fonk):
        @wraps(fonk)
        def sarici(*args, **kwargs):
            print(f"{ad} girdi")
            sonuc = fonk(*args, **kwargs)
            print(f"{ad} çıktı")
            return sonuc
        return sarici
    return dekorator

@etiket("DIŞ")
@etiket("İÇ")
def hesapla():
    print("  asıl iş")
    return 42

print(hesapla())
</pre>

<h3>Parantezli de parantezsiz de çalışan dekoratör</h3>
<p>Parametreli dekoratörde <code>@logla</code> yazıp parantezi unutmak sık hatadır. Bazı kütüphaneler iki kullanımı da kabul eder: <code>@logla</code> ve <code>@logla(onek="BANKA")</code>. Hile: ilk parametre fonksiyon olarak gelirse doğrudan sar, gelmezse (yalnız anahtar sözcüklü argümanlar) dekoratör döndür. Ayarların <code>*</code> sonrasında yalnız anahtar sözcükle verilmesi bu ayrımı güvenli kılar.</p>
<pre class="py">
from functools import wraps

def logla(fonk=None, *, onek="LOG"):
    def dekorator(f):
        @wraps(f)
        def sarici(*args, **kwargs):
            print(f"[{onek}] {f.__name__}{args}")
            return f(*args, **kwargs)
        return sarici
    if fonk is None:            # @logla(onek=...) biçimi
        return dekorator
    return dekorator(fonk)      # @logla biçimi

@logla
def topla(a, b):
    return a + b

@logla(onek="BANKA")
def faiz(anapara, oran):
    return round(anapara * oran, 2)

print(topla(2, 3), faiz(10000, 0.035))
</pre>

<h3>Önbelleği yönetmek</h3>
<p><code>@lru_cache(maxsize=128)</code> sınırlı sayıda sonuç tutar ve en uzun süredir kullanılmayanı atar; <code>@functools.cache</code> (3.9+) sınırsız sürümdür. Dekore edilen fonksiyona iki metot eklenir: <code>cache_info()</code> isabet (hit) ve ıska (miss) sayılarını verir, <code>cache_clear()</code> önbelleği boşaltır. Kur tablosu gibi zamanla değişen veride önbelleği gün başında temizlemek gerekir.</p>
<pre class="py">
from functools import lru_cache

@lru_cache(maxsize=2)
def kur(birim):
    print("  servisten çekildi:", birim)
    return {"USD": 34.2, "EUR": 37.1, "GBP": 44.0}[birim]

for b in ["USD", "USD", "EUR", "GBP", "USD"]:
    kur(b)
print(kur.cache_info())
kur.cache_clear()
print("Temizlendi:", kur.cache_info().currsize)
</pre>
<div class="warn"><b>Önbellek ve değiştirilebilir sonuç</b>Önbellekli fonksiyon liste ya da sözlük döndürüyorsa her çağrı <b>aynı nesneyi</b> verir. Çağıranlardan biri onu değiştirirse sonraki herkes bozuk veriyi alır. Değiştirilemez tür (tuple, frozenset) döndür ya da çağıran taraf kopya alsın. Argümanların da hashlenebilir olması gerekir: liste değil demet ver.</div>

<h3>contextlib araç kutusu</h3>
<div class="tbl-wrap"><table>
<tr><th>Araç</th><th>Ne yapar?</th><th>Örnek kullanım</th></tr>
<tr><td><code>@contextmanager</code></td><td>Üreteçten bağlam yöneticisi</td><td>Geçici ayar, zamanlama</td></tr>
<tr><td><code>suppress(*hatalar)</code></td><td>Belirtilen hataları sessizce yutar</td><td><code>with suppress(FileNotFoundError): os.remove(y)</code></td></tr>
<tr><td><code>ExitStack</code></td><td>Sayısı çalışma anında belli olan bağlamları tek yerde toplar</td><td>Klasördeki tüm dosyaları aynı anda açmak</td></tr>
<tr><td><code>redirect_stdout(f)</code></td><td>print çıktısını başka akışa yönlendirir</td><td>Eski fonksiyonun çıktısını yakalamak</td></tr>
<tr><td><code>closing(nesne)</code></td><td>Çıkışta <code>nesne.close()</code> çağırır</td><td>with desteklemeyen eski bağlantılar</td></tr>
<tr><td><code>nullcontext()</code></td><td>Hiçbir şey yapmayan bağlam</td><td>Koşullu kilit/işlem</td></tr>
</table></div>
<p>Sınıf tabanlı bağlam yöneticisinde <code>__exit__</code>'in <b>dönüş değeri</b> önemlidir: <code>True</code> döndürürse bloktaki hata yutulur, <code>False</code>/<code>None</code> ise hata yukarı çıkar. <code>suppress</code> tam olarak bunu yapar.</p>
<pre class="py">
import io
from contextlib import suppress, ExitStack, redirect_stdout

class HataSay:
    def __init__(self, *turler):
        self.turler, self.sayi = turler, 0
    def __enter__(self):
        return self
    def __exit__(self, tur, deger, iz):
        if tur is not None and issubclass(tur, self.turler):
            self.sayi += 1
            return True           # hatayı yut
        return False

sayac = HataSay(ValueError)
for ham in ["10", "x", "7", "?"]:
    with sayac:
        print("geçerli:", int(ham))
print("yutulan hata:", sayac.sayi)

with suppress(KeyError):
    {}["yok"]
print("suppress sonrası devam")

with ExitStack() as yigin:
    dosyalar = [yigin.enter_context(io.StringIO(f"şube {i}")) for i in range(3)]
    print([f.read() for f in dosyalar])

tampon = io.StringIO()
with redirect_stdout(tampon):
    print("bu ekrana değil tampona")
print("yakalandı:", tampon.getvalue().strip())
</pre>

<div class="note"><b>Gerçek işte</b>Kurumsal kodda dekoratörler çoğu zaman sen yazmadan önce oradadır: web çerçevesinde <code>@app.route</code> ve <code>@login_required</code>, testte <code>@pytest.fixture</code> ve <code>@pytest.mark.parametrize</code>, komut satırında <code>@click.command</code>, veri hatlarında <code>@task</code>. Bu kalıpların hepsi bu bölümdeki iki fikre dayanır: kayıt dekoratörü (tanım anında listeye ekle) ve sarıcı (her çağrıda önce/sonra iş yap). Kendi yazacağın dekoratörler genelde üç türdür: tekrar deneme, zamanlama/loglama ve yetki kontrolü. Her birine <code>@wraps</code> eklemeyi unutursan loglarda bütün fonksiyonların adı "sarici" görünür ve hata ayıklamak zorlaşır.</div>
'''

EXT['ex'] = [
dict(t='mc', stage='Isınma', q='Bir modülde <code>@rapor("ciro")</code> ile işaretli fonksiyonun dekoratör gövdesi (sarıcı değil, dış kısım) ne zaman çalışır?',
     o=['Fonksiyon ilk kez çağrıldığında', 'Modül yüklenirken, fonksiyon tanımlandığı anda bir kez', 'Fonksiyon her çağrıldığında, asıl koddan önce', 'Program sonlanırken'], a=1,
     why='@ satırı, def tamamlanır tamamlanmaz dekoratörü fonksiyonla çağırır. Bu, import anında olur. Her çağrıda çalışan kısım yalnız sarıcı (wrapper) fonksiyondur.'),
dict(t='mc', stage='Isınma', q='Sınıf tabanlı bir bağlam yöneticisinde <code>__exit__</code> <code>True</code> döndürürse ne olur?',
     o=['Bloktaki hata yutulur, program with sonrasından devam eder', 'Hata önce loglanır, ardından iki kez fırlatılır', 'with bloğu hatanın olduğu yerden baştan yeniden çalıştırılır', '__enter__ yeniden çağrılır'], a=0,
     why='__exit__\'in doğru (truthy) dönüşü "hatayı ben hallettim" demektir; istisna yutulur. False ya da None dönerse hata yukarı çıkar. contextlib.suppress bu davranışı hazır sunar.'),
dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
     code=r'''
def a(f):
    def w():
        return "a(" + f() + ")"
    return w

def b(f):
    def w():
        return "b(" + f() + ")"
    return w

@a
@b
def f():
    return "x"

print(f())
''', o=['b(a(x))', 'a(b(x))', 'a(x)', 'x'], a=1,
     why='Üst üste dekoratörler aşağıdan yukarı uygulanır: f = a(b(f)). Çağrıda dıştaki a\'nın sarıcısı, içteki b\'nin sarıcısını çağırır; b de asıl f\'yi.'),
dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
     code=r'''
def kaydet(f):
    print("kayıt:", f.__name__)
    return f

print("başla")

@kaydet
def rapor():
    print("rapor çalıştı")

print("bitti")
''', o=['başla\nkayıt: rapor\nbitti', 'başla\nbitti', 'başla\nkayıt: rapor\nrapor çalıştı\nbitti', 'kayıt: rapor\nbaşla\nbitti'], a=0,
     why='Dekoratör tanım anında çalışır: "başla" yazıldıktan sonra def satırına gelinir ve kaydet çağrılır. rapor hiç çağrılmadığı için "rapor çalıştı" yazılmaz.'),
dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
     code=r'''
class Bolge:
    def __init__(self, ad):
        self.ad = ad
    def __enter__(self):
        print("gir", self.ad)
    def __exit__(self, *hata):
        print("çık", self.ad)

with Bolge("1"), Bolge("2"):
    print("gövde")
''', o=['gir 1\ngir 2\ngövde\nçık 1\nçık 2', 'gir 1\ngir 2\ngövde\nçık 2\nçık 1', 'gir 1\ngövde\nçık 1\ngir 2\nçık 2', 'gir 2\ngir 1\ngövde\nçık 1\nçık 2'], a=1,
     why='Tek with satırındaki bağlamlar soldan sağa açılır ve ters sırayla (yığın gibi) kapanır: son açılan ilk kapanır. İç içe iki with yazmakla aynıdır.'),
dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
     code=r'''
from functools import lru_cache

@lru_cache
def liste_ver(n):
    return [0] * n

a = liste_ver(2)
a.append(9)
print(liste_ver(2))
''', o=['[0, 0]', '[0, 0, 9]', '[9]', 'TypeError'], a=1,
     why='Önbellek ikinci çağrıda yeni liste üretmez, ilk çağrıdaki AYNI listeyi döndürür. Onu değiştirdiğin için önbellekteki sonuç da bozuldu. Önbellekli fonksiyonlar değiştirilemez tür döndürmeli.'),
dict(t='order', stage='Kodu oku', q='<p>Kayıt dekoratörüyle komut tablosu kuran ve "ozet" komutunu çalıştıran programın satırlarını sırala.</p>',
     lines=['KOMUTLAR = {}',
            'def komut(f):',
            '    KOMUTLAR[f.__name__] = f',
            '    return f',
            '@komut',
            'def ozet(veri):',
            '    return f"{len(veri)} kayıt, toplam {sum(veri)}"',
            'print(KOMUTLAR["ozet"]([5, 10]))'],
     expect='2 kayıt, toplam 15\n',
     hint='Tablo → dekoratör → @ satırı hemen def\'in üstünde → çağrı en sonda.',
     why='Kayıt dekoratörü fonksiyonu tabloya ekleyip aynen döndürür. Tanım anında kayıt yapıldığı için son satırda komut adıyla bulunabilir.'),
dict(t='code', id='dekoratorler-x1', stage='Rehberli', diff=2,
     q='<p>Ilgaz Bank işlem motoru için bir kayıt dekoratörü yaz. <code>ISLEMLER</code> adında boş bir sözlük ve parametreli <code>islem(tur)</code> dekoratörü tanımla:</p><ul><li><code>@islem("havale")</code> ile işaretlenen fonksiyon <code>ISLEMLER["havale"]</code> altına kaydedilsin ve <b>sarılmadan, aynen</b> döndürülsün.</li><li>Aynı tür ikinci kez kaydedilmeye çalışılırsa <code>ValueError(f"{tur} zaten kayıtlı")</code> fırlatılsın.</li></ul><p>Sonra <code>calistir(tur, *args)</code>: kayıtlı fonksiyonu argümanlarla çağırıp sonucunu döndürsün; tür kayıtlı değilse <code>KeyError</code> kendiliğinden fırlasın.</p>',
     guide=['ISLEMLER = {} ile başla.', 'islem(tur) iç bir kaydet(fonk) fonksiyonu döndürsün (iki katman yeter, sarıcı yok).', 'kaydet içinde tür zaten varsa ValueError, yoksa sözlüğe ekle ve fonk\'u döndür.', 'calistir içinde ISLEMLER[tur](*args) döndür.'],
     example=r'''
EKRANLAR = {}

def ekran(ad):
    def kaydet(f):
        EKRANLAR[ad] = f
        return f
    return kaydet

@ekran("ana")
def ana_sayfa():
    return "Hoş geldin"

print(EKRANLAR["ana"](), ana_sayfa.__name__)
''',
     start=r'''
ISLEMLER = {}

def islem(tur):
    def kaydet(fonk):
        # TODO: tür zaten kayıtlıysa ValueError
        # TODO: ISLEMLER'e ekle ve fonk'u aynen döndür
        return fonk
    return kaydet

def calistir(tur, *args):
    # TODO: kayıtlı fonksiyonu çağır
    pass
''',
     sol=r'''
ISLEMLER = {}

def islem(tur):
    def kaydet(fonk):
        if tur in ISLEMLER:
            raise ValueError(f"{tur} zaten kayıtlı")
        ISLEMLER[tur] = fonk
        return fonk
    return kaydet

def calistir(tur, *args):
    return ISLEMLER[tur](*args)
''',
     tests=r'''
@islem("havale")
def havale(bakiye, tutar):
    return bakiye - tutar

@islem("faiz")
def faiz(bakiye, oran):
    return round(bakiye * (1 + oran), 2)

assert ISLEMLER["havale"] is havale, "Fonksiyon sarılmadan, aynen kaydedilmeli ve döndürülmeli"
assert calistir("havale", 1000, 250) == 750
assert calistir("faiz", 1000, 0.035) == 1035.0
assert havale(10, 3) == 7, "Dekore edilen ad hâlâ normal fonksiyon gibi çalışmalı (fonk'u döndür)"
try:
    @islem("havale")
    def baska(b, t):
        return 0
    assert False, "Aynı tür ikinci kez kaydedilince ValueError bekleniyordu"
except ValueError as e:
    assert str(e) == "havale zaten kayıtlı"
assert ISLEMLER["havale"] is havale, "Hatalı kayıt eskisini ezmemeli"
try:
    calistir("swift", 1)
    assert False, "Kayıtsız tür KeyError vermeli"
except KeyError:
    pass
''',
     hints=['Kayıt dekoratörü sarıcı gerektirmez: kaydet(fonk) doğrudan fonk döndürür.', 'Kontrolü eklemeden önce yap: if tur in ISLEMLER: raise ValueError(...)', 'calistir: return ISLEMLER[tur](*args)'],
     why='Kayıt dekoratörü tanım anında tabloyu doldurur; ana program yalnız tabloya bakar. Çakışma kontrolü, iki modülün aynı adı sessizce ezmesini önler.'),
dict(t='code', id='dekoratorler-x2', stage='Rehberli', diff=2,
     q='<p><code>lru_cache</code>\'in nasıl çalıştığını anlamak için kendi <code>onbellek</code> dekoratörünü yaz:</p><ul><li>Sarıcı, konumsal argümanların demetini (<code>args</code>) anahtar olarak kullanan bir sözlükte sonuçları tutsun; aynı argümanla ikinci çağrıda asıl fonksiyonu çağırmadan sonucu döndürsün.</li><li>Sözlük, sarıcının <code>onbellek</code> özniteliği olarak erişilebilir olsun (<code>fonk.onbellek</code>).</li><li><code>functools.wraps</code> kullan.</li></ul>',
     guide=['Dış fonksiyon fonk alır; içinde @wraps(fonk) ile sarici(*args) tanımla.', 'Sarıcı: args sözlükte varsa onu döndür; yoksa fonk(*args) hesapla, kaydet, döndür.', 'Sarıcıyı döndürmeden önce sarici.onbellek = {} ata.', 'Sarıcının içinde sözlüğe sarici.onbellek ile eriş.'],
     example=r'''
from functools import wraps

def say(fonk):
    @wraps(fonk)
    def sarici(*args):
        sarici.cagri += 1          # durum sarıcının özniteliğinde
        return fonk(*args)
    sarici.cagri = 0
    return sarici

@say
def kare(x):
    return x * x

kare(2); kare(3)
print(kare.__name__, kare.cagri)
''',
     start=r'''
from functools import wraps

def onbellek(fonk):
    @wraps(fonk)
    def sarici(*args):
        # TODO: args önbellekteyse onu döndür
        # TODO: değilse hesapla, sarici.onbellek[args] = sonuc, döndür
        return fonk(*args)
    # TODO: sarici.onbellek = {}
    return sarici
''',
     sol=r'''
from functools import wraps

def onbellek(fonk):
    @wraps(fonk)
    def sarici(*args):
        if args in sarici.onbellek:
            return sarici.onbellek[args]
        sonuc = fonk(*args)
        sarici.onbellek[args] = sonuc
        return sonuc
    sarici.onbellek = {}
    return sarici
''',
     tests=r'''
cagri = []

@onbellek
def kur(birim, gun):
    cagri.append((birim, gun))
    return {"USD": 34.2, "EUR": 37.1}[birim] + gun / 100

assert kur("USD", 1) == 34.21 and kur("USD", 1) == 34.21 and kur("EUR", 1) == 37.11
assert cagri == [("USD", 1), ("EUR", 1)], "Aynı argümanla ikinci çağrı asıl fonksiyonu çalıştırmamalı: " + str(cagri)
assert kur.onbellek == {("USD", 1): 34.21, ("EUR", 1): 37.11}, "Önbellek sözlüğü args demetlerini anahtar olarak tutmalı"
assert kur.__name__ == "kur", "functools.wraps ile fonksiyon adı korunmalı"

@onbellek
def hic():
    cagri.append("hic")
    return None
hic(); hic()
assert cagri.count("hic") == 1, "Sonuç None olsa bile önbellekten dönmeli ('in' kontrolü kullan, get(...) is None değil)"
''',
     hints=['Durum için sarıcıya öznitelik ekleyebilirsin: sarici.onbellek = {} (sarıcı tanımlandıktan sonra).', 'Kontrolü "if args in sarici.onbellek" ile yap; get ile None kontrolü, None döndüren fonksiyonlarda yanılır.', 'sonuc = fonk(*args); sarici.onbellek[args] = sonuc; return sonuc'],
     why='lru_cache\'in çekirdeği budur: argüman demeti → sonuç sözlüğü. Demet hashlenebildiği için anahtar olur; bu yüzden liste argümanlı fonksiyonlar önbelleğe alınamaz. "in" kontrolü None sonuçları da doğru önbelleğe alır.'),
dict(t='code', id='dekoratorler-x3', stage='Rehberli', diff=2,
     q='<p>Toplu veri yüklemesinde bozuk satırları yutup kaydeden bir bağlam yöneticisi yaz: <code>contextlib.contextmanager</code> ile <code>hata_topla(liste)</code>.</p><ul><li>with bloğunda <code>ValueError</code> oluşursa hata <b>yutulsun</b> ve mesajı (<code>str(e)</code>) <code>liste</code>\'ye eklensin.</li><li>Başka hata türleri yutulmasın, yukarı çıksın.</li><li>Hata olmazsa liste değişmesin.</li></ul>',
     guide=['@contextmanager ile bir üreteç fonksiyonu tanımla.', 'yield satırını try bloğunun içine al: bloktaki hata yield satırında fırlar.', 'except ValueError as e: içinde liste.append(str(e)); tekrar fırlatma (yutulur).', 'Başka except yazma; diğer hatalar kendiliğinden çıkar.'],
     example=r'''
from contextlib import contextmanager

@contextmanager
def bolum(ad):
    print("başla:", ad)
    try:
        yield
    finally:
        print("bitti:", ad)

with bolum("yükleme"):
    print("  çalışıyor")
''',
     start=r'''
from contextlib import contextmanager

@contextmanager
def hata_topla(liste):
    # TODO: try: yield / except ValueError as e: liste.append(str(e))
    yield
''',
     sol=r'''
from contextlib import contextmanager

@contextmanager
def hata_topla(liste):
    try:
        yield
    except ValueError as e:
        liste.append(str(e))
''',
     tests=r'''
hatalar, toplam = [], 0
for ham in ["100", "yok", "250", "", "50"]:
    with hata_topla(hatalar):
        toplam += int(ham)
assert toplam == 400, "Geçerli satırlar toplanmalı: " + str(toplam)
assert len(hatalar) == 2 and "yok" in hatalar[0], "İki ValueError mesajı kaydedilmeli: " + str(hatalar)
temiz = []
with hata_topla(temiz):
    x = 1
assert temiz == [], "Hata yoksa liste değişmemeli"
try:
    with hata_topla([]):
        {}["eksik"]
    assert False, "KeyError yutulmamalı"
except KeyError:
    pass
''',
     hints=['contextmanager\'da bloktaki istisna yield satırında yeniden fırlatılır.', 'try: yield / except ValueError as e: liste.append(str(e)) — except\'ten çıkınca hata yutulmuş olur.'],
     why='contextmanager\'da yield\'i saran try/except, with bloğundaki hatayı yakalar; except bloğu tekrar fırlatmazsa hata yutulur. Yalnız ValueError yakalamak, gerçek programcı hatalarının (KeyError) gizlenmesini önler.'),
dict(t='code', id='dekoratorler-x4', stage='Kendin yaz', diff=2,
     q='<p>Parametreli <code>yetki(*roller)</code> dekoratörünü yaz. Dekore edilen fonksiyonun <b>ilk argümanı</b> bir kullanıcı sözlüğüdür (<code>{"ad": ..., "rol": ...}</code>). Kullanıcının rolü <code>roller</code> içinde değilse <code>PermissionError(f"{ad} bu işlem için yetkili değil")</code> fırlat; yetkiliyse fonksiyonu çağırıp sonucunu döndür. <code>functools.wraps</code> kullan; anahtar sözcüklü argümanlar da geçebilmeli.</p>',
     sol=r'''
from functools import wraps

def yetki(*roller):
    def dekorator(fonk):
        @wraps(fonk)
        def sarici(kullanici, *args, **kwargs):
            if kullanici.get("rol") not in roller:
                raise PermissionError(f"{kullanici.get('ad')} bu işlem için yetkili değil")
            return fonk(kullanici, *args, **kwargs)
        return sarici
    return dekorator
''',
     tests=r'''
@yetki("mudur", "denetci")
def kredi_onayla(kullanici, basvuru_no, *, not_=""):
    return f"{basvuru_no} onaylandı ({kullanici['ad']}) {not_}".strip()

mudur = {"ad": "Ayşe", "rol": "mudur"}
gise = {"ad": "Can", "rol": "gise"}
assert kredi_onayla(mudur, "K-17") == "K-17 onaylandı (Ayşe)"
assert kredi_onayla({"ad": "Elif", "rol": "denetci"}, "K-18", not_="acil") == "K-18 onaylandı (Elif) acil", "kwargs geçmeli"
try:
    kredi_onayla(gise, "K-19")
    assert False, "Yetkisiz rol PermissionError vermeli"
except PermissionError as e:
    assert str(e) == "Can bu işlem için yetkili değil", str(e)
assert kredi_onayla.__name__ == "kredi_onayla", "wraps ile ad korunmalı"
''',
     hints=['Üç katman: yetki(*roller) → dekorator(fonk) → sarici(kullanici, *args, **kwargs).', 'Kontrol sarıcının içinde, fonk çağrısından önce yapılır.'],
     why='Yetki kontrolünü dekoratöre almak, iş fonksiyonlarını güvenlik kodundan temizler ve kuralı tek yerde toplar. Kullanıcıyı ayrı parametre olarak almak, args\'ın geri kalanını olduğu gibi iletmeyi kolaylaştırır.'),
dict(t='code', id='dekoratorler-x5', stage='Kendin yaz', diff=2,
     q='<p>Sınıf tabanlı <code>Yoksay</code> bağlam yöneticisini yaz: <code>Yoksay(*turler)</code> verilen hata türlerini (ve alt sınıflarını) yutsun, yuttuğu hata sayısını <code>sayi</code> özniteliğinde biriktirsin ve son yutulan hatanın nesnesini <code>son</code> özniteliğinde tutsun (başta <code>None</code>). Aynı nesne birden çok with bloğunda kullanılabilmeli. <code>__enter__</code> nesnenin kendisini döndürsün.</p>',
     sol=r'''
class Yoksay:
    def __init__(self, *turler):
        self.turler = turler
        self.sayi = 0
        self.son = None

    def __enter__(self):
        return self

    def __exit__(self, tur, deger, iz):
        if tur is not None and issubclass(tur, self.turler):
            self.sayi += 1
            self.son = deger
            return True
        return False
''',
     tests=r'''
y = Yoksay(KeyError, ZeroDivisionError)
for veri in [{"tutar": 5}, {}, {"tutar": 0}]:
    with y:
        100 / veri["tutar"]
assert y.sayi == 2, "Bir KeyError ve bir ZeroDivisionError yutulmalı: " + str(y.sayi)
assert isinstance(y.son, ZeroDivisionError), "son, en son yutulan hata nesnesi olmalı"
with Yoksay(LookupError) as z:
    [1][5]
assert z.sayi == 1, "IndexError, LookupError'ın alt sınıfı olarak yutulmalı; with ... as z nesneyi vermeli"
try:
    with Yoksay(KeyError):
        int("x")
    assert False, "Listede olmayan tür (ValueError) yutulmamalı"
except ValueError:
    pass
bos = Yoksay(KeyError)
with bos:
    pass
assert bos.sayi == 0 and bos.son is None
''',
     hints=['__exit__(self, tur, deger, iz): hata yoksa tur None gelir.', 'issubclass(tur, self.turler) demetle alt sınıfları da kapsar; yutmak için True döndür.'],
     why='__exit__\'in dönüş değeri hatanın kaderini belirler: True yutar, False iletir. Hata türünü issubclass ile denetlemek, except\'in davranışını taklit eder.'),
dict(t='code', id='dekoratorler-x6', stage='Hata avı', kind='bug', diff=1,
     q='<p><b>Hatayı bul ve düzelt.</b> <code>logla</code> dekoratörü çağrıları <code>LOG</code> listesine <code>"ad(argümanlar)"</code> biçiminde yazmalı ve fonksiyonun sonucunu aynen döndürmeli. Ama dekore edilen fonksiyonlar <code>None</code> döndürüyor ve logda hep <code>"sarici(...)"</code> görünüyor.</p>',
     start=r'''
LOG = []

def logla(fonk):
    def sarici(*args, **kwargs):
        LOG.append(f"{sarici.__name__}{args}")
        fonk(*args, **kwargs)
    return sarici
''',
     sol=r'''
from functools import wraps

LOG = []

def logla(fonk):
    @wraps(fonk)
    def sarici(*args, **kwargs):
        LOG.append(f"{fonk.__name__}{args}")
        return fonk(*args, **kwargs)
    return sarici
''',
     tests=r'''
@logla
def kdvli(tutar, oran=0.2):
    """KDV ekler."""
    return round(tutar * (1 + oran), 2)

assert kdvli(100) == 120.0, "Sarıcı sonucu döndürmeli (return unutulmuş)"
assert kdvli(50, oran=0.1) == 55.0
assert LOG == ["kdvli(100,)", "kdvli(50,)"], "Logda asıl fonksiyonun adı görünmeli: " + str(LOG)
assert kdvli.__name__ == "kdvli" and kdvli.__doc__ == "KDV ekler.", "functools.wraps ile ad ve belge korunmalı"
''',
     hints=['İki eksik: sarıcıda return yok ve kimlik (ad, docstring) korunmuyor.', 'return fonk(*args, **kwargs) yaz; sarıcının üstüne @wraps(fonk) ekle ve logda fonk.__name__ kullan.'],
     why='return\'süz sarıcı her zaman None döndürür. wraps olmadan dekore edilen fonksiyonun adı ve belgesi sarıcınınki olur; loglar, hata ayıklayıcı ve belge araçları yanıltıcı bilgi gösterir.'),
dict(t='code', id='dekoratorler-x7', stage='Hata avı', kind='bug', diff=2,
     q='<p><b>Hatayı bul ve düzelt.</b> <code>kdvli_toplam(tutarlar)</code> bir tutar <b>listesi</b> alır ve KDV\'li toplamı döndürür. Hesap pahalı olduğu için önbelleğe alınmak istendi ama çağrı <code>TypeError: unhashable type: \'list\'</code> veriyor. Fonksiyon liste ile çağrılabilmeli <b>ve</b> aynı tutarlarla ikinci çağrıda hesap tekrar yapılmamalı (<code>HESAP</code> sayacı artmamalı).</p>',
     start=r'''
from functools import lru_cache

HESAP = {"n": 0}

@lru_cache(maxsize=64)
def kdvli_toplam(tutarlar):
    HESAP["n"] += 1
    return round(sum(tutarlar) * 1.2, 2)
''',
     sol=r'''
from functools import lru_cache

HESAP = {"n": 0}

@lru_cache(maxsize=64)
def _kdvli_toplam(tutarlar):
    HESAP["n"] += 1
    return round(sum(tutarlar) * 1.2, 2)

def kdvli_toplam(tutarlar):
    return _kdvli_toplam(tuple(tutarlar))
''',
     tests=r'''
assert kdvli_toplam([100, 250]) == 420.0, "Liste ile çağrılabilmeli"
assert kdvli_toplam([100, 250]) == 420.0
assert HESAP["n"] == 1, "Aynı tutarlarla ikinci çağrı önbellekten gelmeli; hesap sayısı: " + str(HESAP["n"])
assert kdvli_toplam((100, 250)) == 420.0 and HESAP["n"] == 1, "Demet ile de aynı önbellek kaydı kullanılmalı"
assert kdvli_toplam([1]) == 1.2 and HESAP["n"] == 2
''',
     hints=['lru_cache argümanları sözlük anahtarı yapar; liste hashlenemez, demet hashlenebilir.', 'Önbellekli iç fonksiyon demet alsın; dışarıya açık fonksiyon listeyi tuple(...) ile çevirip onu çağırsın.'],
     why='Önbellek anahtarı argümanlardan oluşur ve hashlenebilir olmalıdır. Listeyi demete çeviren ince bir dış katman, çağıranın arayüzünü değiştirmeden önbelleği çalıştırır.'),
dict(t='code', id='dekoratorler-x8', stage='Meydan okuma', diff=3,
     q='<p><b>İki biçimde de çalışan dekoratör.</b> <code>yuvarla</code> dekoratörünü yaz; fonksiyonun sayısal (int/float) sonucunu yuvarlasın, sayı olmayan sonuçları (None, metin, liste) aynen döndürsün:</p><ul><li><code>@yuvarla</code> (parantezsiz): 2 ondalığa yuvarlar.</li><li><code>@yuvarla(ondalik=0)</code> ya da <code>@yuvarla()</code>: verilen ondalığa (varsayılan 2) yuvarlar.</li><li><code>ondalik</code> yalnız anahtar sözcükle verilebilsin; negatifse dekoratör uygulanırken <code>ValueError</code>.</li><li><code>bool</code> sonuçlar (True/False) sayı sayılmasın, aynen dönsün. <code>functools.wraps</code> kullan.</li></ul>',
     sol=r'''
from functools import wraps

def yuvarla(fonk=None, *, ondalik=2):
    if ondalik < 0:
        raise ValueError("ondalik negatif olamaz")
    def dekorator(f):
        @wraps(f)
        def sarici(*args, **kwargs):
            sonuc = f(*args, **kwargs)
            if isinstance(sonuc, (int, float)) and not isinstance(sonuc, bool):
                return round(sonuc, ondalik)
            return sonuc
        return sarici
    if fonk is None:
        return dekorator
    return dekorator(fonk)
''',
     tests=r'''
@yuvarla
def ortalama(liste):
    """Ortalama."""
    return sum(liste) / len(liste) if liste else None

@yuvarla(ondalik=0)
def faiz(anapara, oran):
    return anapara * oran

@yuvarla()
def oran(a, b):
    return a / b

@yuvarla
def onayli(x):
    return x > 0

assert ortalama([1, 2, 2]) == 1.67, "Parantezsiz kullanım: 2 ondalık"
assert ortalama([]) is None, "Sayı olmayan sonuç aynen dönmeli"
assert faiz(12345, 0.0375) == 463.0, "ondalik=0"
assert oran(1, 3) == 0.33, "@yuvarla() varsayılan 2 ondalık"
assert onayli(5) is True, "bool sonuç sayı sayılmamalı, True aynen dönmeli"
assert ortalama.__name__ == "ortalama" and ortalama.__doc__ == "Ortalama.", "wraps kullan"
try:
    @yuvarla(ondalik=-1)
    def f():
        return 1.0
    assert False, "Negatif ondalık ValueError vermeli"
except ValueError:
    pass
try:
    yuvarla(None, 3)
    assert False, "ondalik yalnız anahtar sözcükle verilebilmeli (* kullan)"
except TypeError:
    pass
''',
     hints=['İmza: def yuvarla(fonk=None, *, ondalik=2). Parantezsiz kullanımda fonk dolu gelir, parantezlide None.', 'İçte dekorator(f) tanımla; fonk None ise dekorator\'ü, değilse dekorator(fonk)\'u döndür.', 'bool, int\'in alt sınıfıdır: isinstance(sonuc, (int, float)) and not isinstance(sonuc, bool).'],
     why='Tek bir isteğe bağlı konumsal parametre (fonk) ile yalnız anahtar sözcüklü ayarlar, iki kullanım biçimini kesin olarak ayırır. bool\'un int alt sınıfı olması, tür kontrollerinde sık gözden kaçan bir kenar durumdur.'),
]

EXT['faq'] = [
 dict(q='Dekoratörde durum (sayaç, önbellek) nerede tutulmalı?', a='Üç seçenek var: sarıcının özniteliği (sarici.sayi = 0), dış fonksiyondaki bir değişken (nonlocal ile) ya da sınıf tabanlı dekoratörün self\'i. Öznitelik yöntemi dışarıdan okunabilir olduğu için test ve izleme açısından en pratiğidir; lru_cache de cache_info\'yu bu yolla sunar.'),
 dict(q='suppress mı, try/except/pass mı?', a='İkisi aynı işi yapar. Tek satırlık "olmasa da olur" işlemlerinde (geçici dosyayı silmek gibi) with suppress(FileNotFoundError): daha okunaklıdır. Hata olduğunda başka bir şey yapacaksan (log, sayaç) try/except yaz. Her iki durumda da yalnız beklediğin türü yut.'),
]
EXT['mistakes'] = [
 dict(bad='@lru_cache\ndef musteri_listesi(sehir):\n    return [m for m in TUM if m["sehir"] == sehir]\n\nliste = musteri_listesi("Ankara")\nliste.append(yeni)   # önbellek bozuldu', good='@lru_cache\ndef musteri_listesi(sehir):\n    return tuple(m for m in TUM if m["sehir"] == sehir)', why='Önbellekli fonksiyon her çağrıda aynı nesneyi döndürür; değiştirilebilir sonucu bir çağıran değiştirirse herkes bozuk veriyi görür. Değiştirilemez tür döndür.'),
 dict(bad='@onbellek       # dışta: yetkisiz kullanıcı önbellekten alır\n@yetki("mudur")\ndef rapor(kullanici, ay): ...', good='@yetki("mudur")  # dışta: önce yetki denetlenir\n@onbellek\ndef rapor(kullanici, ay): ...', why='Üst üste dekoratörlerde çağrı en dıştakinden başlar. Güvenlik kontrolleri en dışta olmalı; aksi hâlde iç katmanlar (önbellek) kontrolü atlatabilir.'),
]
