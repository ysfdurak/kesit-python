html = f'''
<h2>Fonksiyona geçen ne? "Nesne referansıyla çağrı"</h2>
<p>Python'da fonksiyona ne değer kopyası ne de C++'taki gibi bir referans geçer; parametre adı, çağıranın verdiği <b>aynı nesneye</b> bağlanır (call by sharing / call by object reference). Sonuç iki kurala iner: fonksiyon içinde nesneyi <b>değiştirirsen</b> (append, anahtar atama) çağıran da görür; ada <b>yeni nesne atarsan</b> (<code>x = ...</code>) yalnızca yerel ad değişir.</p>
{pre("""
def indirim_uygula(sepet):
    sepet["indirim"] = 50            # nesneyi değiştirir: çağıran görür

def sepeti_sifirla(sepet):
    sepet = {}                       # yalnız yerel adı yeni nesneye bağlar

def kalem_ekle(kalemler):
    kalemler += ["kalem"]            # list için += yerinde değiştirir (extend)

def kalem_ekle_kopya(kalemler):
    kalemler = kalemler + ["kalem"]  # + yeni liste üretir

s = {"tutar": 400}
indirim_uygula(s); sepeti_sifirla(s)
print(s)

k1, k2 = ["defter"], ["defter"]
kalem_ekle(k1); kalem_ekle_kopya(k2)
print(k1, k2)
""")}
<div class="warn"><b>+= her türde aynı değil</b>Liste için <code>a += b</code> yerinde değiştirir (<code>__iadd__</code>); demet, str ve int değişmez olduğu için aynı satır yeni nesne üretir. Kodu okurken türü bilmeden <code>+=</code>'ın yan etkisini tahmin edemezsin.</div>

<h2>Liste neden "fazla" yer ayırır?</h2>
<p>Liste elemanları değil, elemanlara işaretçileri (pointer) yan yana tutar. Her <code>append</code>'te yeniden bellek istememek için CPython listeyi büyütürken <b>fazladan yer</b> (over-allocation) ayırır; bu yüzden <code>append</code> ortalamada O(1)'dir. Boyutu aşağıda kademeli artarken görürsün; tam sayılar sürüme göre değişebilir.</p>
{pre("""
import sys

liste = []
onceki = sys.getsizeof(liste)
print(f"boş: {onceki} bayt")
for i in range(20):
    liste.append(i)
    boyut = sys.getsizeof(liste)
    if boyut != onceki:
        print(f"{len(liste):2} eleman -> {boyut} bayt (yeniden ayırma)")
        onceki = boyut
""")}

<h2>Sayılar için kompakt kaplar: array, bytes, bytearray, memoryview</h2>
<p>Bir listede bir milyon tamsayı, bir milyon ayrı <code>int</code> nesnesi + bir milyon işaretçi demektir. Aynı türden çok sayıda sayıyı ham bayt olarak saklamak için <code>array</code> modülü, ikili veri için <code>bytes</code> (değişmez) ve <code>bytearray</code> (değişebilir) vardır. <code>memoryview</code> ise bu tamponların bir bölümüne <b>kopyalamadan</b> bakmanı sağlar: büyük bir dosya tamponunu dilimlemek bellek harcamaz.</p>
<div class="tbl-wrap"><table>
<tr><th>Kap</th><th>Eleman</th><th>Değişebilir?</th><th>Ne zaman?</th></tr>
<tr><td><code>list</code></td><td>Herhangi bir nesneye işaretçi</td><td>Evet</td><td>Genel amaçlı, karışık türler</td></tr>
<tr><td><code>array.array('d', ...)</code></td><td>Ham C double</td><td>Evet</td><td>Tek tip çok sayı, numpy yoksa</td></tr>
<tr><td><code>bytes</code></td><td>0-255 bayt</td><td>Hayır</td><td>Dosya/ağ verisi, hash, anahtar</td></tr>
<tr><td><code>bytearray</code></td><td>0-255 bayt</td><td>Evet</td><td>Tampon doldurma, protokol yazma</td></tr>
<tr><td><code>memoryview</code></td><td>Başka tampona görünüm</td><td>Kaynağa bağlı</td><td>Kopyasız dilimleme</td></tr>
<tr><td><code>numpy.ndarray</code></td><td>Ham, çok boyutlu</td><td>Evet</td><td>Sayısal hesap (numpy dersi)</td></tr>
</table></div>
{pre("""
import sys
from array import array

n = 100_000
liste = [float(i) for i in range(n)]
dizi = array("d", liste)
liste_toplam = sys.getsizeof(liste) + sum(sys.getsizeof(x) for x in liste)
print(f"list : {liste_toplam / 1024:7.0f} KB")
print(f"array: {sys.getsizeof(dizi) / 1024:7.0f} KB")

tampon = bytearray(b"HDR|ANADOLU-BANK|0001234500|TRY")
gorunum = memoryview(tampon)
tutar_alani = gorunum[17:27]          # kopya yok, aynı belleğe pencere
print(bytes(tutar_alani).decode())
tutar_alani[0:2] = b"99"              # pencereden yazmak kaynağı değiştirir
print(tampon.decode())
""")}

<h2>gc modülü: döngüsel çöp toplayıcıyı yönetmek</h2>
<p>Referans sayımı nesnelerin çoğunu anında temizler; yalnızca <b>döngüler</b> (a → b → a) için ayrı bir toplayıcı çalışır. Bu toplayıcı nesneleri üç kuşakta (generation 0, 1, 2) izler: yeni nesneler 0. kuşaktadır, bir toplamadan sağ çıkanlar yukarı kuşağa geçer. Eşikler <code>gc.get_threshold()</code> ile görülür.</p>
{pre("""
import gc

class Hesap:
    def __init__(self, no):
        self.no = no
        self.ortak = None

print("eşikler:", gc.get_threshold())
a, b = Hesap(1), Hesap(2)
a.ortak, b.ortak = b, a          # döngü
del a, b                         # referans sayısı 0'a inmez
print("toplanan nesne:", gc.collect() >= 2)
""")}
<ul>
<li><code>gc.collect()</code>: elle tam toplama; toplanan nesne sayısını döndürür. Büyük bir toplu işin sonunda belleği hemen geri istemek için kullanılır.</li>
<li><code>gc.disable()</code>: milyonlarca küçük nesne oluşturan kısa ömürlü bir betikte toplayıcının sık sık devreye girmesini engeller; iş bitince <code>gc.enable()</code>. Döngü üreten kodda bellek büyür, dikkat.</li>
<li><code>gc.freeze()</code> (3.7+): sunucu süreçleri çatallamadan (fork) önce mevcut nesneleri toplayıcıdan saklar; kopya-yazma (copy-on-write) sayfalarını korur.</li>
<li><code>__del__</code> metoduna güvenme: ne zaman çağrılacağı garanti değildir, içindeki hata yalnız uyarı basar. Kaynak kapatmak için <code>with</code> ve bağlam yöneticisi kullan.</li>
</ul>

<h2>Zayıf referanslı önbellek: WeakValueDictionary</h2>
<p>Bir önbellek nesneleri sözlükte tutarsa, nesneler hiç ölmez ve bellek sızıntısı (memory leak) başlar. <code>weakref.WeakValueDictionary</code> değerlere zayıf referans tutar: programda o nesneye başka güçlü referans kalmayınca kayıt kendiliğinden silinir. "Bellekte zaten varsa aynı nesneyi ver, yoksa yükle" (identity map) kalıbı ORM'lerde böyle çalışır.</p>
{pre("""
import weakref

class Urun:
    def __init__(self, kod):
        self.kod = kod

kayit = weakref.WeakValueDictionary()

def urun_getir(kod):
    u = kayit.get(kod)
    if u is None:
        u = Urun(kod)            # gerçekte veritabanından yüklenir
        kayit[kod] = u
    return u

x = urun_getir("AM-100")
print(x is urun_getir("AM-100"), len(kayit))
del x
print(len(kayit))               # kullanılmayan nesne önbellekten düştü
""")}
<div class="tip"><b>Sızıntı kontrol listesi</b>Uzun yaşayan süreçte bellek sürekli artıyorsa sırayla bak: sınırsız büyüyen modül düzeyi listeler/sözlükler (önbellek, olay kaydı), hiç çıkarılmayan gözlemci (observer) abonelikleri, kapanışların (closure) yakaladığı büyük nesneler, istisna nesnesinde saklanan traceback'in tuttuğu yerel değişkenler. <code>tracemalloc</code> anlık görüntü farkı (performans dersi) büyüyen satırı gösterir.</div>
<div class="note"><b>Gerçek işte</b>Bir web servisinin belleği günler içinde yavaşça artıp konteyner yeniden başlıyorsa klasik suçlu, istek başına bir şey ekleyip hiç silmeyen modül düzeyi bir sözlüktür. Önbelleğe her zaman bir sınır koy (<code>lru_cache(maxsize=...)</code>, TTL ya da WeakValueDictionary) ve servis metriklerinde süreç belleğini (RSS) izle. "Yeniden başlatınca düzeliyor" bir çözüm değil, bir belirtidir.</div>
'''

EX = []
EX.append(dict(t='mc', stage='Isınma',
    q='<code>def f(lst): lst.append(1)</code> ve <code>def g(lst): lst = [1]</code> tanımlı. <code>a = []</code> için <code>f(a); g(a)</code> sonrasında <code>a</code> nedir ve neden?',
    o=['[], çünkü Python argümanları her zaman kopyalar', '[1]; f aynı nesneyi değiştirir, g yalnız yerel adı bağlar', '[1, 1]; iki fonksiyon da listeye eleman ekler', '[1] ama yalnızca g tanımı f\'ten sonra geldiği için'],
    a=1, why='Parametre çağıranın nesnesine bağlanır. append nesneyi yerinde değiştirir, çağıran görür. lst = [1] ise yalnızca yerel adı yeni bir listeye bağlar; dışarıdaki a etkilenmez.'))
EX.append(dict(t='mc', stage='Isınma',
    q='200 MB\'lık bir <code>bytes</code> tamponundan 50 parçayı işleyeceksin. <code>memoryview</code> kullanmanın kazancı nedir?',
    o=['Dilimler kopyalanmaz; her parça aynı belleğe açılan bir penceredir', 'Veriyi otomatik olarak sıkıştırır ve diskte saklar', 'bytes nesnesini değişebilir yapar, böylece yerinde düzenlenir', 'Dilimleme paralel iş parçacıklarında çalıştırılır'],
    a=0, why='bytes[a:b] her seferinde yeni bir bytes kopyası üretir; memoryview dilimi ise kaynağın aynı belleğine bakar. Değişebilirlik kaynağa bağlıdır: bytes üzerindeki görünüm salt okunurdur.'))
EX.append(dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
    code='def ekle_a(x):\n    x += [9]\n\ndef ekle_b(x):\n    x = x + [9]\n\nl1, l2 = [1], [1]\nekle_a(l1)\nekle_b(l2)\nprint(l1, l2)\n',
    o=['[1, 9] [1]', '[1, 9] [1, 9]', '[1] [1]', '[1] [1, 9]'], a=0,
    why='Listede += yerinde extend yapar, çağıranın listesi değişir. x = x + [9] yeni liste üretip yerel ada bağlar; l2 etkilenmez.'))
EX.append(dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
    code='kayit = (["TR1"], 500)\ntry:\n    kayit[0] += ["TR2"]\nexcept TypeError:\n    print("hata")\nprint(kayit)\n',
    o=['hata\n([\'TR1\', \'TR2\'], 500)', 'hata\n([\'TR1\'], 500)', '([\'TR1\', \'TR2\'], 500)', 'TypeError'], a=0,
    why='Ünlü tuzak: += önce listeyi yerinde genişletir (başarılı), sonra sonucu demetin 0. elemanına atamaya çalışır ve demet değişmez olduğu için TypeError fırlar. Hata gelir ama liste zaten değişmiştir.'))
EX.append(dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
    code='import weakref\n\nclass Musteri:\n    pass\n\nd = weakref.WeakValueDictionary()\nm = Musteri()\nd["M1"] = m\nyedek = m\nprint(len(d), end=" ")\ndel m\nprint(len(d), end=" ")\ndel yedek\nprint(len(d))\n',
    o=['1 1 0', '1 0 0', '1 1 1', '0 0 0'], a=0,
    why='del m yalnız bir adı siler; yedek hâlâ güçlü referans tuttuğundan nesne yaşar. yedek de silinince referans sayısı 0 olur, nesne yok edilir ve zayıf sözlükten düşer.'))
EX.append(dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
    code='tampon = bytearray(b"ANADOLU")\npencere = memoryview(tampon)[0:3]\npencere[0] = ord("B")\nkopya = bytes(tampon[3:])\ntampon[3] = ord("X")\nprint(tampon.decode(), kopya.decode())\n',
    o=['BNAXOLU DOLU', 'ANADOLU DOLU', 'BNAXOLU XOLU', 'BNADOLU DOLU'], a=0,
    why='memoryview penceresinden yazmak kaynak tamponu değiştirir (A→B). bytearray dilimi ve bytes(...) ise kopyadır; tampon sonradan değişse de kopya "DOLU" olarak kalır.'))
EX.append(dict(t='order', stage='Kodu oku',
    q='<p>Döngüsel referansın referans sayımıyla değil çöp toplayıcıyla temizlendiğini gösteren programın satırlarını sırala. Çıktı <code>True</code> olmalı.</p>',
    lines=['import gc, weakref', 'class Dugum: pass', 'a, b = Dugum(), Dugum()', 'a.es, b.es = b, a', 'izci = weakref.ref(b.es)', 'del a, b', 'gc.collect()', 'print(izci() is None)'],
    expect='True\n', hint='İzci b.es üzerinden kurulduğu için bağlantılardan sonra gelir; toplama, adlar silindikten sonra.',
    why='a ve b birbirini gösterdiği için del sonrasında referans sayıları 0 olmaz; gc.collect döngüyü bulup temizler, zayıf referans None döner.'))
EX.append(dict(t='code', stage='Rehberli', id='bellek-ic-yapi-x1', diff=2,
    q='<p><code>derin_boyut(nesne)</code> fonksiyonunu yaz: <code>sys.getsizeof</code> yalnızca kabın kendisini ölçer. Sen list, tuple, set, frozenset ve dict içindekileri (sözlükte anahtar ve değerleri) de özyinelemeli olarak toplayan bayt sayısını döndür. Aynı nesne iki kez görülürse <b>bir kez</b> say (<code>id</code> kümesiyle); bu sayede döngüsel yapılar da sonsuz döngüye girmez.</p>',
    guide=['Görülen id\'ler için boş bir küme oluştur ve içte özyinelemeli bir yardımcı fonksiyon tanımla.', 'Yardımcı: id(x) kümede varsa 0 döndür; yoksa ekle ve boyutu sys.getsizeof(x) ile başlat.', 'x bir dict ise anahtar ve değerlerin boyutlarını ekle.', 'x list/tuple/set/frozenset ise elemanların boyutlarını ekle.', 'Toplamı döndür.'],
    example='def say(x, gorulen=None):\n    gorulen = set() if gorulen is None else gorulen\n    if id(x) in gorulen:\n        return 0\n    gorulen.add(id(x))\n    if isinstance(x, list):\n        return 1 + sum(say(e, gorulen) for e in x)\n    return 1\n\nortak = [1]\nprint(say([ortak, ortak, 2]))   # ortak liste bir kez sayılır\n',
    start='import sys\n\ndef derin_boyut(nesne):\n    gorulen = set()\n    def boyut(x):\n        # TODO: id(x) görülmüşse 0 dön, yoksa ekle\n        # TODO: dict ise anahtar+değer, kap ise elemanlar\n        return sys.getsizeof(x)\n    return boyut(nesne)\n',
    sol='import sys\n\ndef derin_boyut(nesne):\n    gorulen = set()\n    def boyut(x):\n        if id(x) in gorulen:\n            return 0\n        gorulen.add(id(x))\n        toplam = sys.getsizeof(x)\n        if isinstance(x, dict):\n            toplam += sum(boyut(k) + boyut(v) for k, v in x.items())\n        elif isinstance(x, (list, tuple, set, frozenset)):\n            toplam += sum(boyut(e) for e in x)\n        return toplam\n    return boyut(nesne)\n',
    tests='import sys\nassert derin_boyut([]) == sys.getsizeof([]), "Boş liste için getsizeof ile aynı olmalı"\nm = "Anadolu Market müşteri adı"\nassert derin_boyut([m]) == sys.getsizeof([m]) + sys.getsizeof(m), "Liste + içindeki string boyutu toplanmalı"\nassert derin_boyut([m, m]) == sys.getsizeof([m, m]) + sys.getsizeof(m), "Aynı nesne iki kez sayılmamalı"\nd = {"ad": m, "puan": [1, 2]}\nbeklenen = sys.getsizeof(d) + sys.getsizeof("ad") + sys.getsizeof(m) + sys.getsizeof("puan") + sys.getsizeof([1, 2]) + sys.getsizeof(1) + sys.getsizeof(2)\nassert derin_boyut(d) == beklenen, "Sözlükte anahtarlar ve değerler (iç içe) sayılmalı"\ndongu = []\ndongu.append(dongu)\nassert derin_boyut(dongu) == sys.getsizeof(dongu), "Döngüsel listede sonsuz özyinelemeye girmemeli"\n',
    hints=['Görülen nesneleri id(x) ile bir kümede tut.', 'isinstance(x, dict) ve isinstance(x, (list, tuple, set, frozenset)) ile iki dal yeterli.', 'toplam += sum(boyut(k) + boyut(v) for k, v in x.items())'],
    why='Gerçek bellek tüketimini tahmin etmek için içerik de sayılmalı. id kümesi hem paylaşılan nesnelerin iki kez sayılmasını hem de döngülerde sonsuz özyinelemeyi önler.'))
EX.append(dict(t='code', stage='Rehberli', id='bellek-ic-yapi-x2', diff=2,
    q='<p>Anadolu Market ürün nesnelerini bellekte tekrar tekrar oluşturmak istemiyor. <code>UrunHavuzu</code> sınıfını yaz: <code>getir(kod)</code> o kodla <b>hâlâ yaşayan</b> bir <code>Urun</code> varsa aynı nesneyi döndürsün, yoksa <code>Urun(kod)</code> oluşturup kaydetsin. Kayıt <code>weakref.WeakValueDictionary</code> olmalı ki kullanılmayan ürünler bellekte kalmasın. <code>yuklenen</code> özniteliği şimdiye kadar kaç kez yeni <code>Urun</code> oluşturulduğunu saysın; <code>len(havuz)</code> yaşayan ürün sayısını versin.</p>',
    guide=['__init__ içinde self._kayit = weakref.WeakValueDictionary() ve self.yuklenen = 0 tanımla.', 'getir: önce self._kayit.get(kod) ile bak.', 'None ise yeni Urun oluştur, kaydet, sayacı artır.', 'Nesneyi döndür.', '__len__ kayıttaki eleman sayısını döndürsün.'],
    example='import weakref\n\nclass Oturum:\n    pass\n\naktif = weakref.WeakValueDictionary()\no = Oturum()\naktif["ayse"] = o\nprint(len(aktif))\ndel o\nprint(len(aktif))\n',
    start='import weakref\n\nclass Urun:\n    def __init__(self, kod):\n        self.kod = kod\n\nclass UrunHavuzu:\n    def __init__(self):\n        self._kayit = {}          # TODO: zayıf referanslı sözlük olmalı\n        self.yuklenen = 0\n\n    def getir(self, kod):\n        # TODO: varsa aynı nesneyi dön, yoksa oluştur ve say\n        return Urun(kod)\n\n    def __len__(self):\n        return len(self._kayit)\n',
    sol='import weakref\n\nclass Urun:\n    def __init__(self, kod):\n        self.kod = kod\n\nclass UrunHavuzu:\n    def __init__(self):\n        self._kayit = weakref.WeakValueDictionary()\n        self.yuklenen = 0\n\n    def getir(self, kod):\n        u = self._kayit.get(kod)\n        if u is None:\n            u = Urun(kod)\n            self._kayit[kod] = u\n            self.yuklenen += 1\n        return u\n\n    def __len__(self):\n        return len(self._kayit)\n',
    tests='h = UrunHavuzu()\na = h.getir("AM-1")\nb = h.getir("AM-1")\nassert a is b, "Yaşayan ürün için aynı nesne dönmeli"\nassert h.yuklenen == 1, "İkinci getir yeni nesne oluşturmamalı"\nc = h.getir("AM-2")\nassert len(h) == 2, "İki farklı ürün yaşıyor"\ndel a, b\nassert len(h) == 1, "Referansı kalmayan AM-1 havuzdan düşmeli (WeakValueDictionary)"\nh.getir("AM-1")\nassert h.yuklenen == 3, "Ölen ürün tekrar istenince yeniden yüklenir"\n',
    hints=['weakref.WeakValueDictionary() normal sözlük gibi kullanılır.', 'u = self._kayit.get(kod); if u is None: ...', 'Yeni nesneyi kaydettikten sonra self.yuklenen += 1 yapmayı unutma.'],
    why='Kimlik haritası (identity map) aynı kayıt için tek nesne garantisi verir; zayıf referans sayesinde önbellek bellek sızıntısına dönüşmez.'))
EX.append(dict(t='code', stage='Rehberli', id='bellek-ic-yapi-x3', diff=2,
    q='<p><code>Sepet</code> sınıfına <code>__copy__</code> ekle: <code>copy.copy(sepet)</code> yeni bir <code>Sepet</code> döndürsün; <b>müşteri</b> nesnesi paylaşılsın (aynı nesne), ama <b>kalemler</b> listesi yeni bir liste olsun (kopyada kalem eklemek orijinali etkilemesin).</p>',
    guide=['copy.copy bir nesnede __copy__ tanımlıysa onu çağırır.', '__copy__(self) içinde yeni Sepet oluştur: musteri olarak self.musteri\'yi aynen ver.', 'Kalemler için list(self.kalemler) ile yeni liste geç.', 'Yeni nesneyi döndür.'],
    example='import copy\n\nclass Rapor:\n    def __init__(self, baslik, satirlar):\n        self.baslik = baslik\n        self.satirlar = satirlar\n    def __copy__(self):\n        return Rapor(self.baslik, self.satirlar[:])\n\nr = Rapor("Ocak", [1, 2])\nk = copy.copy(r)\nk.satirlar.append(3)\nprint(r.satirlar, k.satirlar)\n',
    start='import copy\n\nclass Musteri:\n    def __init__(self, ad):\n        self.ad = ad\n\nclass Sepet:\n    def __init__(self, musteri, kalemler):\n        self.musteri = musteri\n        self.kalemler = kalemler\n\n    # TODO: __copy__ metodunu yaz\n',
    sol='import copy\n\nclass Musteri:\n    def __init__(self, ad):\n        self.ad = ad\n\nclass Sepet:\n    def __init__(self, musteri, kalemler):\n        self.musteri = musteri\n        self.kalemler = kalemler\n\n    def __copy__(self):\n        return Sepet(self.musteri, list(self.kalemler))\n',
    tests='import copy\nm = Musteri("Ayşe")\ns = Sepet(m, ["çay", "şeker"])\nk = copy.copy(s)\nassert isinstance(k, Sepet) and k is not s, "Yeni bir Sepet dönmeli"\nassert k.musteri is s.musteri, "Müşteri nesnesi paylaşılmalı (aynı nesne)"\nk.kalemler.append("un")\nassert s.kalemler == ["çay", "şeker"], "Kopyaya kalem eklemek orijinali etkilememeli"\nassert k.kalemler == ["çay", "şeker", "un"]\n',
    hints=['copy.copy(nesne) özel bir __copy__ metodu arar.', 'return Sepet(self.musteri, list(self.kalemler))'],
    why='Varsayılan copy.copy tüm öznitelikleri paylaşır, deepcopy ise müşteriyi de kopyalar. __copy__ ile hangi alanın paylaşılıp hangisinin çoğaltılacağına sen karar verirsin.'))
EX.append(dict(t='code', stage='Kendin yaz', id='bellek-ic-yapi-x4', diff=2,
    q='<p><code>paylasilanlar(adlar: dict)</code> fonksiyonunu yaz: sözlükte ad → nesne eşlemeleri var. <b>Aynı nesneyi</b> (<code>is</code> anlamında, eşitlik değil) gösteren adları gruplayıp, iki ve daha fazla ad içeren grupları döndür. Her grup alfabetik sıralı liste, gruplar da ilk adlarına göre sıralı olsun.</p>',
    start='def paylasilanlar(adlar):\n    pass\n',
    sol='def paylasilanlar(adlar):\n    gruplar = {}\n    for ad, nesne in adlar.items():\n        gruplar.setdefault(id(nesne), []).append(ad)\n    return sorted(sorted(g) for g in gruplar.values() if len(g) > 1)\n',
    tests='sepet = ["çay"]\nkopya = ["çay"]\nayar = {"kdv": 20}\nadlar = {"sepet": sepet, "aktif": sepet, "kopya": kopya, "ayar": ayar, "varsayilan": ayar, "son": sepet}\nassert paylasilanlar(adlar) == [["aktif", "sepet", "son"], ["ayar", "varsayilan"]], "Aynı nesneyi gösteren adlar gruplanmalı"\nassert paylasilanlar({"a": [1], "b": [1]}) == [], "Eşit ama farklı nesneler aynı grup değildir"\n',
    hints=['Eşitlik (==) değil kimlik lazım: anahtar olarak id(nesne) kullan.', 'Önce id → ad listesi sözlüğü kur, sonra uzunluğu 1\'den büyük olanları sırala.'],
    why='Hata ayıklarken "bu iki değişken aynı listeyi mi gösteriyor?" sorusu sık çıkar; id ile gruplamak takma adları (alias) görünür kılar.'))
EX.append(dict(t='code', stage='Kendin yaz', id='bellek-ic-yapi-x5', diff=2,
    q='<p>Sabit uzunluklu banka dosya kayıtlarını parçalayacaksın. <code>parcala(tampon, boyut)</code> verilen <code>bytes</code> ya da <code>bytearray</code> tamponunu <code>boyut</code> baytlık parçalara bölüp parçaları <b>memoryview</b> listesi olarak döndürsün (kopya yok). Son parça kısa kalabilir. <code>boyut &lt;= 0</code> ise <code>ValueError</code>.</p>',
    start='def parcala(tampon, boyut):\n    pass\n',
    sol='def parcala(tampon, boyut):\n    if boyut <= 0:\n        raise ValueError("boyut pozitif olmalı")\n    mv = memoryview(tampon)\n    return [mv[i:i + boyut] for i in range(0, len(mv), boyut)]\n',
    tests='p = parcala(b"TR01TR02TR0", 4)\nassert all(isinstance(x, memoryview) for x in p), "Parçalar memoryview olmalı"\nassert [bytes(x) for x in p] == [b"TR01", b"TR02", b"TR0"], "Son parça kısa kalabilir"\nb = bytearray(b"AAAABBBB")\nq = parcala(b, 4)\nb[4] = ord("X")\nassert bytes(q[1]) == b"XBBB", "Parçalar kopya değil, kaynağa pencere olmalı"\ntry:\n    parcala(b"x", 0)\n    raise AssertionError("boyut=0 ValueError vermeli")\nexcept ValueError:\n    pass\nassert parcala(b"", 3) == [], "Boş tampon boş liste"\n',
    hints=['memoryview(tampon) bir kez oluştur, sonra onu dilimle.', 'range(0, len(mv), boyut) ile başlangıç indekslerini üret.'],
    why='Büyük ikili dosyaları (ör. EFT toplu dosyası) kayıtlara bölerken bytes dilimi her parça için kopya üretir; memoryview tek tamponu paylaşır.'))
EX.append(dict(t='code', stage='Hata avı', id='bellek-ic-yapi-x6', kind='bug', diff=1,
    q='<p>Hatayı bul ve düzelt. Depo raf matrisi oluşturan <code>raf_matrisi(satir, sutun)</code> fonksiyonu tek bir rafa ürün koyunca tüm satırlarda aynı sütun doluyor. Her satır bağımsız bir liste olmalı.</p>',
    start='def raf_matrisi(satir, sutun):\n    return [[0] * sutun] * satir\n',
    sol='def raf_matrisi(satir, sutun):\n    return [[0] * sutun for _ in range(satir)]\n',
    tests='m = raf_matrisi(3, 2)\nassert m == [[0, 0], [0, 0], [0, 0]], "3x2 sıfır matris olmalı"\nm[0][1] = 5\nassert m == [[0, 5], [0, 0], [0, 0]], "Bir hücreyi değiştirmek yalnız o satırı etkilemeli"\nassert len({id(r) for r in m}) == 3, "Her satır ayrı bir liste nesnesi olmalı"\n',
    hints=['[liste] * n aynı listeye n tane referans koyar.', 'Kapsam ifadesi (comprehension) her turda yeni liste üretir.'],
    why='Dış listedeki * işlemi iç listeyi kopyalamaz, aynı nesneye işaretçiyi çoğaltır. İç [0] * sutun sorun değildir çünkü int değişmezdir.'))
EX.append(dict(t='code', stage='Hata avı', id='bellek-ic-yapi-x7', kind='bug', diff=2,
    q='<p>Hatayı bul ve düzelt. <code>Sepet</code> sınıfında her müşterinin kendi kalemleri olmalı; ama bir müşteriye eklenen ürün diğer müşterilerin sepetinde de görünüyor. Sınıfı düzelt.</p>',
    start='class Sepet:\n    kalemler = []\n\n    def __init__(self, musteri):\n        self.musteri = musteri\n\n    def ekle(self, urun):\n        self.kalemler.append(urun)\n        return len(self.kalemler)\n',
    sol='class Sepet:\n    def __init__(self, musteri):\n        self.musteri = musteri\n        self.kalemler = []\n\n    def ekle(self, urun):\n        self.kalemler.append(urun)\n        return len(self.kalemler)\n',
    tests='a = Sepet("Ali")\nb = Sepet("Ayşe")\nassert a.ekle("çay") == 1\nassert b.kalemler == [], "Ali\'nin ürünü Ayşe\'nin sepetinde görünmemeli"\nassert b.ekle("un") == 1, "Ayşe\'nin sepetinde ilk ürün"\nassert a.kalemler is not b.kalemler, "Her örneğin kendi listesi olmalı"\n',
    hints=['Sınıf gövdesindeki öznitelik tüm örneklerce paylaşılır.', 'Listeyi __init__ içinde self.kalemler = [] olarak oluştur.'],
    why='Sınıf özniteliği bir kez oluşturulur; append onu yerinde değiştirdiği için tüm örnekler aynı listeyi görür. Değişebilir durum örnek özniteliği olmalıdır.'))
EX.append(dict(t='code', stage='Meydan okuma', id='bellek-ic-yapi-x8', diff=3,
    q='<p>JSON\'a yazılacak iç içe veride döngü varsa <code>json.dumps</code> "Circular reference detected" hatası verir. <code>dongu_var_mi(veri)</code> fonksiyonunu yaz: list ve dict\'lerden oluşan iç içe yapıda bir kabın <b>kendi atalarından birini</b> içerip içermediğini döndürsün. Dikkat: aynı listenin iki farklı dalda paylaşılması döngü <b>değildir</b>; yalnızca o anki yolda (atalar zincirinde) tekrar görülmesi döngüdür.</p>',
    start='def dongu_var_mi(veri):\n    pass\n',
    sol='def dongu_var_mi(veri):\n    yol = set()\n    def gez(x):\n        if not isinstance(x, (list, dict)):\n            return False\n        if id(x) in yol:\n            return True\n        yol.add(id(x))\n        cocuklar = x.values() if isinstance(x, dict) else x\n        sonuc = any(gez(c) for c in cocuklar)\n        yol.discard(id(x))\n        return sonuc\n    return gez(veri)\n',
    tests='assert dongu_var_mi({"a": [1, 2], "b": {"c": 3}}) is False, "Düz iç içe veri döngü içermez"\nortak = [1]\nassert dongu_var_mi([ortak, ortak, {"x": ortak}]) is False, "Paylaşılan alt liste döngü değildir"\nl = [1]\nl.append(l)\nassert dongu_var_mi(l) is True, "Kendini içeren liste döngüdür"\nd = {"musteri": {"siparisler": []}}\nd["musteri"]["siparisler"].append(d)\nassert dongu_var_mi(d) is True, "Derinde ataya dönen referans döngüdür"\nassert dongu_var_mi(5) is False\n',
    hints=['Tüm görülenleri değil, yalnızca o anki yolu (atalar) tut.', 'Bir kaba girerken id\'sini yola ekle, çıkarken (çocukları gezdikten sonra) çıkar.', 'Sözlükte değerleri, listede elemanları gez.'],
    why='Geri izleme (backtracking) ile yol kümesi tutmak, paylaşılan alt yapıları döngüyle karıştırmadan gerçek döngüleri bulur; json modülü de içeride benzer bir denetim yapar.'))

EXT = dict(id='bellek-ic-yapi', min=30, html=html, ex=EX,
    faq=[dict(q='gc.collect() çağırmak belleği işletim sistemine geri verir mi?', a='Nesneleri serbest bırakır, ama CPython küçük nesneler için ayırdığı bellek havuzlarını (arena) her zaman işletim sistemine iade etmez. Süreç belleği (RSS) bu yüzden düşmeyebilir; bellek Python içinde tekrar kullanılır. Büyük ve tek seferlik işleri ayrı bir süreçte çalıştırmak belleği kesin geri verir.'),
         dict(q='array mi numpy mi kullanmalıyım?', a='Yalnız kompakt saklama gerekiyorsa ve bağımlılık eklemek istemiyorsan array yeter. Vektörel hesap (toplama, filtreleme, istatistik) yapacaksan numpy hem daha hızlı hem çok daha zengin.')],
    mistakes=[dict(bad='kayit = (["TR1"], 500)\nkayit[0] += ["TR2"]   # TypeError ama liste değişti', good='kayit = (["TR1"], 500)\nkayit[0].extend(["TR2"])   # niyet açık, hata yok', why='Demet içindeki listeye += hem listeyi değiştirir hem de demete atama denediği için TypeError fırlatır. extend/append doğrudan listeyi değiştirir.'),
              dict(bad='class Baglanti:\n    def __del__(self):\n        self.kapat()', good='class Baglanti:\n    def __enter__(self):\n        return self\n    def __exit__(self, *a):\n        self.kapat()', why='__del__ ne zaman (hatta çalışıp çalışmayacağı) garanti değildir; döngüdeki nesnelerde gecikir. Kaynak kapatmayı bağlam yöneticisiyle (with) belirgin hale getir.')])
