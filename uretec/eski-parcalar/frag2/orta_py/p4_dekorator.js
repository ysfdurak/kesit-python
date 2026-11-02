/* ───────────────────────── 4. dekoratorler ───────────────────────── */
{
  id: 'dekoratorler',
  lv: 'orta',
  mod: 'Pythonic Kod',
  min: 32,
  title: 'Dekoratörler ve bağlam yöneticileri',
  sum: 'Fonksiyonu saran fonksiyon fikrinden dekoratöre, functools.wraps ve parametreli dekoratöre geçer; zamanlama, loglama, yeniden deneme ve lru_cache yazar; with, contextlib.contextmanager ve sınıf tabanlı bağlam yöneticisi kurarsın.',
  goals: [
    'Bir fonksiyonu saran fonksiyon yazıp @ sözdizimiyle dekoratör olarak uygulayabilirim.',
    'functools.wraps ile sarılan fonksiyonun adını ve docstring\'ini koruyabilirim.',
    'Parametre alan dekoratör (üç katmanlı) yazabilirim.',
    'Zamanlama, loglama, yeniden deneme ve lru_cache gibi iş hayatı dekoratörlerini kullanabilirim.',
    'with bloğunun mantığını açıklayıp contextmanager ve __enter__/__exit__ ile kendi bağlam yöneticimi yazabilirim.'
  ],
  body: `
<h2>Neden önemli?</h2>
<p>Anadolu Bank'ın işlem servisinde on farklı fonksiyon var: para transferi, bakiye sorgusu, kredi başvurusu... Hepsinde aynı üç şey isteniyor: çağrı loglansın, süresi ölçülsün, geçici hata olursa yeniden denensin. Bu üç davranışı on fonksiyona tek tek kopyalamak hem tekrar hem bakım kâbusudur. Dekoratör (decorator), bir fonksiyonu alıp etrafına davranış ekleyen ve yeni fonksiyon döndüren bir araçtır; <code>@zamanla</code> yazarsın, iş biter. Bağlam yöneticisi (context manager) ise aynı fikrin "bir blok öncesi ve sonrası" sürümüdür: dosyayı aç ve ne olursa olsun kapat, bağlantıyı kur ve bırak, işlemi başlat ve hata olursa geri al. İkisi de önceki dersteki closure ve "fonksiyon bir değerdir" fikrinin üstüne kuruludur.</p>

<h2>Fonksiyonu saran fonksiyon</h2>
<p>Dekoratör mekanizmasını önce elle kur. Bir fonksiyon alan, içinde onu çağıran yeni bir fonksiyon tanımlayan ve bu yeni fonksiyonu döndüren bir fonksiyon yaz.</p>
<pre class="py">def logla(fonk):
    def sarici(*args, **kwargs):
        print(f"-&gt; {fonk.__name__} çağrıldı, args={args}")
        sonuc = fonk(*args, **kwargs)
        print(f"&lt;- {fonk.__name__} bitti, sonuç={sonuc}")
        return sonuc
    return sarici

def transfer(kaynak, hedef, tutar):
    return f"{kaynak}-&gt;{hedef}: {tutar}"

transfer = logla(transfer)      # elle sarmalama
print(transfer("TR1", "TR2", 500))</pre>
<p>Üç parça: <code>sarici</code> her türlü argümanı kabul etsin diye <code>*args, **kwargs</code> alır; asıl fonksiyonu çağırıp sonucunu <b>döndürür</b> (unutulursa dekore edilen fonksiyon None vermeye başlar); <code>logla</code> sarıcıyı döndürür. <code>transfer = logla(transfer)</code> satırı, ismi yeni fonksiyona bağlar. Python bu satırı yazmanın kısa yolunu sunar:</p>
<pre class="py">def logla(fonk):
    def sarici(*args, **kwargs):
        print(f"-&gt; {fonk.__name__}")
        return fonk(*args, **kwargs)
    return sarici

@logla
def bakiye_sorgu(hesap):
    return 12500

print(bakiye_sorgu("TR1"))
print(bakiye_sorgu.__name__)   # sarici! asıl adı kayboldu</pre>
<p><code>@logla</code>, tam olarak <code>bakiye_sorgu = logla(bakiye_sorgu)</code> demektir; <code>def</code> biter bitmez uygulanır. Son satır bir sorunu gösteriyor: dekore edilen fonksiyonun adı ve docstring'i sarıcınınkiyle değişti. Hata izlerinde, yardım metinlerinde ve testlerde bu kafa karıştırır.</p>

<h2>functools.wraps: kimliği koru</h2>
<pre class="py">from functools import wraps

def logla(fonk):
    @wraps(fonk)
    def sarici(*args, **kwargs):
        print(f"-&gt; {fonk.__name__}")
        return fonk(*args, **kwargs)
    return sarici

@logla
def bakiye_sorgu(hesap):
    """Hesabın güncel bakiyesini döndürür."""
    return 12500

print(bakiye_sorgu.__name__)
print(bakiye_sorgu.__doc__)
print(bakiye_sorgu.__wrapped__("TR1"))   # dekoratörsüz asıl fonksiyon</pre>
<div class="tip"><b>Kural</b>Her dekoratörün sarıcısına <code>@wraps(fonk)</code> koy. İstisnası yoktur; unutmak kod incelemesinde kesin bir not getirir.</div>

<h2>Parametreli dekoratör: üç katman</h2>
<p>"3 kez yeniden dene" gibi ayar alan dekoratör için bir katman daha gerekir: dıştaki fonksiyon ayarı alır ve asıl dekoratörü döndürür. <code>@yeniden_dene(3)</code> önce <code>yeniden_dene(3)</code>'ü çağırır, dönen dekoratör fonksiyona uygulanır.</p>
<pre class="py">from functools import wraps

def yeniden_dene(deneme):
    def dekorator(fonk):
        @wraps(fonk)
        def sarici(*args, **kwargs):
            son_hata = None
            for i in range(1, deneme + 1):
                try:
                    return fonk(*args, **kwargs)
                except ConnectionError as e:
                    son_hata = e
                    print(f"  deneme {i} başarısız: {e}")
            raise son_hata
        return sarici
    return dekorator

sayac = {"cagri": 0}

@yeniden_dene(3)
def banka_servisi():
    sayac["cagri"] += 1
    if sayac["cagri"] &lt; 3:
        raise ConnectionError("zaman aşımı")
    return "OK"

print(banka_servisi())
print("toplam çağrı:", sayac["cagri"])</pre>
<p>Katmanları ezberleme, oku: ayar → dekoratör → sarıcı. Sarıcı asıl işi yapar; dekoratör sarıcıyı üretir; en dıştaki katman ayarı closure'a hapseder. Gerçek sistemlerde denemeler arasına <code>time.sleep</code> ile artan bekleme konur; burada çıktıyı sade tutmak için atlandı.</p>

<h2>İş hayatından dört dekoratör</h2>
<h3>Zamanlama</h3>
<pre class="py">import time
from functools import wraps

def zamanla(fonk):
    @wraps(fonk)
    def sarici(*args, **kwargs):
        t0 = time.perf_counter()
        try:
            return fonk(*args, **kwargs)
        finally:
            sure = time.perf_counter() - t0
            print(f"{fonk.__name__}: {sure:.4f} sn")
    return sarici

@zamanla
def toplam_ciro(siparisler):
    return sum(s["tutar"] for s in siparisler)

veri = [{"tutar": i % 500} for i in range(200_000)]
print(toplam_ciro(veri))</pre>
<p>Ölçülen süre her çalıştırmada farklı çıkar; bu doğaldır. <code>finally</code> sayesinde fonksiyon hata fırlatsa da süre basılır. <code>time.perf_counter</code>, süre ölçümü için <code>time.time</code>'dan daha hassastır.</p>

<h3>Önbellek: functools.lru_cache</h3>
<p>Aynı argümanla tekrar tekrar çağrılan pahalı bir fonksiyonun sonucunu hatırlamak için dekoratör yazmana gerek yok; standart kütüphanede hazır.</p>
<pre class="py">from functools import lru_cache

hesap_sayisi = {"n": 0}

@lru_cache(maxsize=128)
def kur_sorgula(para_birimi):
    hesap_sayisi["n"] += 1       # "pahalı" servis çağrısını temsil eder
    return {"USD": 32.5, "EUR": 35.1}[para_birimi]

for pb in ["USD", "EUR", "USD", "USD", "EUR"]:
    kur_sorgula(pb)
print("gerçek hesap:", hesap_sayisi["n"])
print(kur_sorgula.cache_info())
kur_sorgula.cache_clear()

@lru_cache(maxsize=None)
def fib(n):
    return n if n &lt; 2 else fib(n - 1) + fib(n - 2)
print(fib(80))</pre>
<div class="warn"><b>lru_cache'in sınırları</b>Argümanlar hashlenebilir olmalı: liste ya da sözlük geçiremezsin (demet ya da frozenset kullan). Sonuç zamanla değişiyorsa (kur, stok) önbellek bayatlar; süreli önbellek için ayrı çözüm gerekir. Ve <code>maxsize=None</code> sınırsız bellek demektir; uzun süren süreçlerde sınır koy.</div>

<h3>Loglama ve yetki kontrolü</h3>
<p>Dekoratörler üst üste konabilir; en yakındaki önce uygulanır. Aşağıda <code>yetki_gerekli</code> önce <code>transfer</code>'i sarar, sonra <code>logla</code> o sarılmış hali sarar.</p>
<pre class="py">from functools import wraps

def logla(fonk):
    @wraps(fonk)
    def sarici(*args, **kwargs):
        print(f"[LOG] {fonk.__name__} {kwargs}")
        return fonk(*args, **kwargs)
    return sarici

def yetki_gerekli(fonk):
    @wraps(fonk)
    def sarici(*args, kullanici, **kwargs):
        if kullanici.get("rol") != "yonetici":
            raise PermissionError(f"{kullanici['ad']} yetkisiz")
        return fonk(*args, kullanici=kullanici, **kwargs)
    return sarici

@logla
@yetki_gerekli
def transfer(tutar, *, kullanici):
    return f"{tutar} TL gönderildi"

print(transfer(500, kullanici={"ad": "Ayşe", "rol": "yonetici"}))
try:
    transfer(500, kullanici={"ad": "Ali", "rol": "stajyer"})
except PermissionError as e:
    print("Hata:", e)</pre>

<div class="tbl-wrap"><table>
<tr><th>İhtiyaç</th><th>Araç</th><th>Not</th></tr>
<tr><td>Çağrıları kaydet</td><td>Kendi <code>logla</code> dekoratörün</td><td>Gerçekte <code>logging</code> modülüne yazar</td></tr>
<tr><td>Süre ölç</td><td><code>zamanla</code> + <code>perf_counter</code></td><td>finally ile hata durumunda da ölç</td></tr>
<tr><td>Geçici hatada tekrar</td><td><code>yeniden_dene(n)</code></td><td>Yalnız geçici hataları yakala; mantık hatasını tekrarlama</td></tr>
<tr><td>Sonucu hatırla</td><td><code>functools.lru_cache</code></td><td>Hashlenebilir argüman; bayatlama riski</td></tr>
<tr><td>Kimlik koru</td><td><code>functools.wraps</code></td><td>Her sarıcıda zorunlu</td></tr>
<tr><td>Blok öncesi/sonrası</td><td>Bağlam yöneticisi</td><td>Kaynak aç/kapat, işlem başlat/bitir</td></tr>
</table></div>

<h2>with ve bağlam yöneticileri</h2>
<p><code>with open(...) as f:</code> yazdığında Python iki şey garanti eder: bloğa girerken <code>__enter__</code> çağrılır (dosya açılır, dönen değer <code>f</code> olur), bloktan çıkarken, hata olsa bile, <code>__exit__</code> çağrılır (dosya kapanır). Bu "kur-kullan-temizle" kalıbı dosyadan çok daha geniş: veritabanı işlemi, kilit, geçici ayar, zaman ölçümü.</p>

<h3>contextlib.contextmanager: üreteçten bağlam yöneticisi</h3>
<p>En kısa yol, tek <code>yield</code> içeren bir üreteç fonksiyonunu <code>@contextmanager</code> ile süslemek. <code>yield</code>'den öncesi girişte, sonrası çıkışta çalışır; <code>yield</code> ettiğin değer <code>as</code> ile alınır.</p>
<pre class="py">from contextlib import contextmanager

@contextmanager
def banka_islemi(hesap):
    print("işlem başladı, bakiye:", hesap["bakiye"])
    yedek = hesap["bakiye"]
    try:
        yield hesap
        print("işlem onaylandı, bakiye:", hesap["bakiye"])
    except Exception as e:
        hesap["bakiye"] = yedek
        print(f"hata ({e}); geri alındı, bakiye: {hesap['bakiye']}")

hesap = {"bakiye": 1000}

with banka_islemi(hesap) as h:
    h["bakiye"] -= 300

with banka_islemi(hesap) as h:
    h["bakiye"] -= 900
    if h["bakiye"] &lt; 0:
        raise ValueError("yetersiz bakiye")

print("son bakiye:", hesap["bakiye"])</pre>
<p><code>try/except</code> <code>yield</code>'i sarar; blok içinde fırlayan hata, üreteçte tam <code>yield</code> satırında ortaya çıkar. Burada hatayı yutup geri alma yaptık; hatanın yukarı devam etmesini istiyorsan <code>except</code> bloğunun sonunda <code>raise</code> yaz ya da <code>try/finally</code> kullan.</p>

<h3>Sınıf tabanlı bağlam yöneticisi</h3>
<p>Durum karmaşıksa ya da nesnenin başka metotları da olacaksa <code>__enter__</code> ve <code>__exit__</code> metotlu bir sınıf yazarsın. <code>__exit__</code> üç argüman alır (hata türü, hata nesnesi, iz); hata yoksa üçü de None'dır. <code>True</code> döndürürse hata bastırılır.</p>
<pre class="py">import time

class Kronometre:
    def __init__(self, etiket):
        self.etiket = etiket
        self.sure = None

    def __enter__(self):
        self.t0 = time.perf_counter()
        return self

    def __exit__(self, hata_turu, hata, iz):
        self.sure = time.perf_counter() - self.t0
        durum = "hata ile" if hata_turu else "başarıyla"
        print(f"{self.etiket} {durum} bitti")
        return False   # hatayı bastırma

with Kronometre("rapor") as k:
    toplam = sum(range(300_000))
print("süre ölçüldü mü:", k.sure is not None, "| toplam:", toplam)

try:
    with Kronometre("hatalı iş"):
        raise ValueError("beklenmedik")
except ValueError as e:
    print("dışarıda yakalandı:", e)</pre>
<div class="note"><b>Birden çok bağlam</b><code>with A() as a, B() as b:</code> ikisini sırayla açar ve ters sırayla kapatır. Python 3.10 ve sonrasında parantezle çok satıra bölebilirsin. <code>contextlib</code>'de ayrıca <code>suppress(FileNotFoundError)</code> (hatayı sessizce yut), <code>redirect_stdout</code> ve <code>ExitStack</code> gibi hazır yöneticiler vardır.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Sınıf tabanlı dekoratör ve metot dekoratörleri</h3>
<p>Dekoratör, çağrılabilir herhangi bir şey olabilir; <code>__call__</code> metodu olan bir sınıf da. Çağrı sayısı gibi durumu tutmak için bu yol closure'dan daha açıktır. Sınıf metotlarını dekore ederken <code>self</code> sarıcının <code>*args</code>'ının ilk öğesi olarak gelir; bu yüzden <code>*args, **kwargs</code> kalıbı metotlarda da sorunsuz çalışır. <code>@property</code>, <code>@staticmethod</code>, <code>@classmethod</code> ve <code>@dataclass</code> zaten her gün kullandığın yerleşik dekoratörlerdir; OOP derslerinde ayrıntıya gireceksin.</p>
<h3>Dekoratörün gizli maliyeti</h3>
<p>Her dekoratör bir katman ekler; çok katmanlı dekoratör yığınlarında hata izleri uzar ve davranış "sihirli" görünmeye başlar. Ekip kuralı genellikle şudur: dekoratör yalnız fonksiyonun <b>işinden bağımsız</b> çapraz kaygıları (logging, cache, retry, yetki, ölçüm) taşısın; iş mantığı dekoratöre sızmasın. Test ederken <code>fonk.__wrapped__</code> ile dekoratörsüz hale erişebilmen için <code>wraps</code> şarttır.</p>
<h3>İş hayatında nasıl görünür?</h3>
<p>Web çerçevelerinde <code>@app.get("/siparis")</code> bir fonksiyonu URL'ye bağlar; pytest'te <code>@pytest.fixture</code> ve <code>@pytest.mark.parametrize</code> test davranışını şekillendirir; <code>tenacity</code> gibi paketler burada yazdığın yeniden deneme dekoratörünün üretim sürümüdür. Bağlam yöneticisi tarafında veritabanı kütüphanelerinin <code>with conn:</code> (otomatik commit/rollback), <code>threading.Lock</code>'un <code>with kilit:</code> kullanımı ve <code>tempfile.TemporaryDirectory</code> aynı kalıptır. Bir kaynağı açıp kapatan her kodu gördüğünde "bu bir bağlam yöneticisi olmalı" refleksi, Python'da olgunluğun işaretidir.</p>
</section>
`,
  ex: [
    { t: 'mc', q: '<code>@logla</code> satırının tam karşılığı hangisidir?',
      o: ['logla()', 'f = logla(f)', 'f = logla', 'logla(f())'], a: 1,
      why: 'Dekoratör sözdizimi, def biter bitmez fonksiyonu dekoratöre verir ve dönen değeri aynı ada bağlar: f = logla(f).' },
    { t: 'code', id: 'dekoratorler-1',
      q: '<p><code>cagri_say</code> dekoratörünü yaz: sarılan fonksiyon her çağrıldığında sarıcı üzerindeki <code>sayi</code> özniteliğini bir artırsın ve asıl fonksiyonun sonucunu aynen döndürsün. <code>functools.wraps</code> kullan ki <code>__name__</code> korunsun. Başlangıçta <code>sayi = 0</code> olmalı.</p>',
      start: 'from functools import wraps\n\ndef cagri_say(fonk):\n    pass\n',
      sol: 'from functools import wraps\n\ndef cagri_say(fonk):\n    @wraps(fonk)\n    def sarici(*args, **kwargs):\n        sarici.sayi += 1\n        return fonk(*args, **kwargs)\n    sarici.sayi = 0\n    return sarici\n',
      tests: '@cagri_say\ndef topla(a, b):\n    """iki sayıyı toplar"""\n    return a + b\n\nassert topla.sayi == 0, "başlangıçta sayi 0 olmalı"\nassert topla(2, 3) == 5, "sonuç aynen dönmeli"\ntopla(1, 1); topla(a=1, b=2)\nassert topla.sayi == 3, "üç çağrıdan sonra sayi 3 olmalı"\nassert topla.__name__ == "topla", "wraps ile ad korunmalı"\nassert topla.__doc__ == "iki sayıyı toplar", "wraps ile docstring korunmalı"\n',
      hints: ['Sarıcı fonksiyona def\'ten sonra sarici.sayi = 0 ile öznitelik ekleyebilirsin.', 'Sarıcı içinde sarici.sayi += 1 ve return fonk(*args, **kwargs).'],
      why: 'Fonksiyonlar nesnedir; öznitelik taşıyabilir. wraps, asıl fonksiyonun adını ve docstring\'ini sarıcıya kopyalar.' },
    { t: 'code', id: 'dekoratorler-2',
      q: '<p>Parametreli <code>yeniden_dene(deneme)</code> dekoratörünü yaz: sarılan fonksiyon <code>ConnectionError</code> fırlatırsa en fazla <code>deneme</code> kez denesin; başarılı olursa sonucu döndürsün; hepsi başarısızsa son hatayı yeniden fırlatsın. Başka hata türlerini yakalama. <code>wraps</code> kullan; <code>time.sleep</code> koyma.</p>',
      start: 'from functools import wraps\n\ndef yeniden_dene(deneme):\n    def dekorator(fonk):\n        pass\n    return dekorator\n',
      sol: 'from functools import wraps\n\ndef yeniden_dene(deneme):\n    def dekorator(fonk):\n        @wraps(fonk)\n        def sarici(*args, **kwargs):\n            son = None\n            for _ in range(deneme):\n                try:\n                    return fonk(*args, **kwargs)\n                except ConnectionError as e:\n                    son = e\n            raise son\n        return sarici\n    return dekorator\n',
      tests: 'durum = {"n": 0}\n\n@yeniden_dene(3)\ndef servis():\n    durum["n"] += 1\n    if durum["n"] < 3:\n        raise ConnectionError("zaman aşımı")\n    return "OK"\n\nassert servis() == "OK", "üçüncü denemede OK dönmeli"\nassert durum["n"] == 3, "tam üç kez çağrılmalı"\nassert servis.__name__ == "servis", "wraps ile ad korunmalı"\n\nsayac = {"n": 0}\n@yeniden_dene(2)\ndef hep_hata():\n    sayac["n"] += 1\n    raise ConnectionError("yok")\ntry:\n    hep_hata()\n    assert False, "tüm denemeler başarısızsa ConnectionError fırlamalı"\nexcept ConnectionError:\n    pass\nassert sayac["n"] == 2, "deneme=2 ise tam iki kez çağrılmalı"\n\n@yeniden_dene(3)\ndef mantik_hatasi():\n    raise ValueError("bu tekrarlanmamalı")\ntry:\n    mantik_hatasi()\n    assert False, "ValueError yakalanmamalı"\nexcept ValueError:\n    pass\n',
      hints: ['Üç katman: yeniden_dene(deneme) -> dekorator(fonk) -> sarici(*args, **kwargs).', 'for döngüsünde try: return fonk(...) except ConnectionError as e: son = e.', 'Döngü biterse raise son.'],
      why: 'Dış katman ayarı closure\'da tutar; sarıcı döngüde dener, başarıda hemen döner, sonunda son hatayı fırlatır. Yalnız geçici hata türü yakalanır.' },
    { t: 'mc', q: 'Sarıcıya <code>@functools.wraps(fonk)</code> eklemeyi unutursan ne olur?',
      o: ['Dekoratör hiç çalışmaz', '__name__ ve __doc__ sarıcınınki olur', 'SyntaxError alırsın', 'Sarılan fonksiyon her çağrıda iki kez çalışır'], a: 1,
      why: 'wraps yalnız meta veriyi (ad, docstring, __wrapped__) kopyalar. Olmadan kod çalışır ama hata izlerinde ve yardım metninde "sarici" görünür.' },
    { t: 'code', id: 'dekoratorler-3',
      q: '<p><code>@lru_cache</code> ile <code>kur(para_birimi)</code> fonksiyonunu önbellekle. Fonksiyon her gerçek çalışmada global <code>cagri["n"]</code> değerini 1 artırsın ve <code>{"USD": 32.5, "EUR": 35.1}</code> sözlüğünden kuru döndürsün. Aynı para birimi ikinci kez sorulduğunda fonksiyon gövdesi çalışmamalı.</p>',
      start: 'from functools import lru_cache\n\ncagri = {"n": 0}\n\ndef kur(para_birimi):\n    cagri["n"] += 1\n    return {"USD": 32.5, "EUR": 35.1}[para_birimi]\n',
      sol: 'from functools import lru_cache\n\ncagri = {"n": 0}\n\n@lru_cache(maxsize=32)\ndef kur(para_birimi):\n    cagri["n"] += 1\n    return {"USD": 32.5, "EUR": 35.1}[para_birimi]\n',
      tests: 'kur.cache_clear()\ncagri["n"] = 0\nfor pb in ["USD", "EUR", "USD", "USD", "EUR"]:\n    kur(pb)\nassert cagri["n"] == 2, "yalnız iki farklı para birimi için gövde çalışmalı (önbellek)"\nassert kur("USD") == 32.5, "USD 32.5 dönmeli"\nassert hasattr(kur, "cache_info"), "lru_cache dekoratörü uygulanmalı"\nassert kur.cache_info().hits >= 3, "tekrarlar önbellekten gelmeli"\n',
      hints: ['def satırının üstüne @lru_cache(maxsize=32) yaz.', 'from functools import lru_cache zaten hazır.'],
      why: 'lru_cache argümanı anahtar yapıp sonucu saklar; aynı argümanla ikinci çağrı gövdeye girmez.' },
    { t: 'code', id: 'dekoratorler-4',
      q: '<p><code>contextlib.contextmanager</code> ile <code>gecici_ayar(ayarlar, anahtar, deger)</code> bağlam yöneticisini yaz: <code>with</code> bloğuna girerken <code>ayarlar[anahtar]</code>\'ı <code>deger</code> yapsın, bloktan çıkarken (hata olsa bile) eski değeri geri koysun. Anahtar önceden yoksa çıkışta silinsin.</p>',
      start: 'from contextlib import contextmanager\n\n@contextmanager\ndef gecici_ayar(ayarlar, anahtar, deger):\n    pass\n',
      sol: 'from contextlib import contextmanager\n\n@contextmanager\ndef gecici_ayar(ayarlar, anahtar, deger):\n    vardi = anahtar in ayarlar\n    eski = ayarlar.get(anahtar)\n    ayarlar[anahtar] = deger\n    try:\n        yield ayarlar\n    finally:\n        if vardi:\n            ayarlar[anahtar] = eski\n        else:\n            del ayarlar[anahtar]\n',
      tests: 'ayar = {"dil": "tr", "tema": "açık"}\nwith gecici_ayar(ayar, "dil", "en"):\n    assert ayar["dil"] == "en", "blok içinde yeni değer görünmeli"\nassert ayar["dil"] == "tr", "çıkışta eski değer dönmeli"\n\ntry:\n    with gecici_ayar(ayar, "tema", "koyu"):\n        raise RuntimeError("patladı")\nexcept RuntimeError:\n    pass\nassert ayar["tema"] == "açık", "hata olsa da eski değer geri gelmeli"\n\nwith gecici_ayar(ayar, "debug", True):\n    assert ayar["debug"] is True\nassert "debug" not in ayar, "önceden olmayan anahtar çıkışta silinmeli"\n',
      hints: ['Girişte eski değeri ve anahtarın var olup olmadığını sakla.', 'try: yield ... finally: geri al. finally hata durumunda da çalışır.'],
      why: 'yield öncesi giriş, sonrası çıkış kodudur; finally bloğu hata fırlasa bile temizliği garanti eder.' },
    { t: 'code', id: 'dekoratorler-5',
      q: '<p>Sınıf tabanlı <code>Islem</code> bağlam yöneticisini yaz. <code>Islem(hesap)</code> bir sözlük alsın (<code>{"bakiye": ...}</code>). <code>__enter__</code> bakiyenin yedeğini alıp hesabı döndürsün. <code>__exit__</code>: blokta hata olmadıysa hiçbir şey yapmasın; hata olduysa bakiyeyi yedeğe geri alsın ve hatayı <b>bastırmasın</b> (False döndürsün).</p>',
      start: 'class Islem:\n    def __init__(self, hesap):\n        self.hesap = hesap\n\n    def __enter__(self):\n        pass\n\n    def __exit__(self, hata_turu, hata, iz):\n        pass\n',
      sol: 'class Islem:\n    def __init__(self, hesap):\n        self.hesap = hesap\n\n    def __enter__(self):\n        self.yedek = self.hesap["bakiye"]\n        return self.hesap\n\n    def __exit__(self, hata_turu, hata, iz):\n        if hata_turu is not None:\n            self.hesap["bakiye"] = self.yedek\n        return False\n',
      tests: 'h = {"bakiye": 1000}\nwith Islem(h) as hesap:\n    hesap["bakiye"] -= 300\nassert h["bakiye"] == 700, "başarılı blokta değişiklik kalmalı"\n\ntry:\n    with Islem(h) as hesap:\n        hesap["bakiye"] -= 900\n        raise ValueError("yetersiz bakiye")\n    assert False, "hata bastırılmamalı (__exit__ False döndürmeli)"\nexcept ValueError:\n    pass\nassert h["bakiye"] == 700, "hata durumunda bakiye geri alınmalı"\n',
      hints: ['__enter__ içinde self.yedek = self.hesap["bakiye"]; return self.hesap.', '__exit__ içinde hata_turu None değilse geri al; sonda return False.'],
      why: '__exit__ hata bilgisini üç argümanla alır; None değilse geri alma yapılır. False döndürmek hatanın with dışına çıkmasını sağlar.' },
    { t: 'mc', q: 'Bir fonksiyona üst üste <code>@a</code> ve altına <code>@b</code> yazıldığında (<code>@a</code> üstte) uygulama sırası nedir?',
      o: ['f = a(b(f))', 'f = b(a(f))', 'f = a(f); b çalışmaz', 'Sıra fark etmez'], a: 0,
      why: 'Dekoratörler fonksiyona en yakından başlayarak uygulanır: önce b sarar, sonra a o sarılmış hali sarar; yani a(b(f)). Çağrıda dıştaki a önce koşar.' }
  ],
  faq: [
    { q: 'Dekoratör neden *args, **kwargs alıyor?', a: 'Sarıcı, sarılan fonksiyonun hangi parametreleri aldığını bilmez. *args ve **kwargs her türlü argümanı toplar ve aynen iletir; böylece tek dekoratör her fonksiyonla çalışır.' },
    { q: 'Sarıcıda return yazmayı unutursam ne olur?', a: 'Asıl fonksiyon çalışır ama sonucu kaybolur; dekore edilmiş fonksiyon None döndürür. Bu, dekoratör yazarken en sık yapılan hatadır.' },
    { q: 'lru_cache metotlarda kullanılabilir mi?', a: 'Teknik olarak evet ama self de önbellek anahtarının parçası olur ve nesneler bellekte tutulur. Nesne sayısı çoksa bellek sızıntısına yol açar; metotlarda dikkatli kullan ya da functools.cached_property\'yi düşün.' },
    { q: 'contextmanager ile sınıf tabanlı bağlam yöneticisi arasında nasıl seçim yaparım?', a: 'Tek bir kur/temizle adımı için contextmanager kısa ve okunur. Nesnenin başka metotları olacaksa, durumu dışarıdan okunacaksa (Kronometre.sure gibi) ya da yeniden kullanılacaksa sınıf yaz.' }
  ],
  mistakes: [
    { bad: 'def logla(fonk):\n    def sarici(*args, **kwargs):\n        print("çağrı")\n        fonk(*args, **kwargs)\n    return sarici', good: 'def logla(fonk):\n    @wraps(fonk)\n    def sarici(*args, **kwargs):\n        print("çağrı")\n        return fonk(*args, **kwargs)\n    return sarici', why: 'return olmadan dekore edilen fonksiyon None döndürür; wraps olmadan adı ve docstring\'i kaybolur.' },
    { bad: '@yeniden_dene\ndef servis():\n    ...', good: '@yeniden_dene(3)\ndef servis():\n    ...', why: 'Parametreli dekoratör çağrılmadan kullanılırsa fonksiyon "deneme" parametresi yerine geçer ve servis bir dekoratör fonksiyonuna dönüşür; çağrı anlamsız hata verir.' },
    { bad: '@lru_cache\ndef toplam(liste):\n    return sum(liste)\ntoplam([1, 2])', good: '@lru_cache\ndef toplam(demet):\n    return sum(demet)\ntoplam((1, 2))', why: 'lru_cache argümanı hashlemeli; liste hashlenemez ve "unhashable type: list" hatası fırlar. Demet geçir.' },
    { bad: '@contextmanager\ndef baglanti():\n    kur()\n    yield\n    kapat()', good: '@contextmanager\ndef baglanti():\n    kur()\n    try:\n        yield\n    finally:\n        kapat()', why: 'Blok içinde hata olursa yield satırında fırlar ve kapat() hiç çalışmaz; finally temizliği garanti eder.' }
  ]
}
);
})(window);
