import sys
sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/b')
from jsb import C, emit

body = r'''
<h2>Neden önemli?</h2>
<p>Ilgaz Bank'ın mobil uygulamasında bir geliştirici, hata ayıklarken şu satırı yazıp unutuyor: <code>hesap.bakiye = -25000</code>. Kod çalışıyor, test geçiyor, ama müşterinin hesabı hiçbir işlem kaydı olmadan eksiye düşüyor. Sınıflar dersinde nesnenin veriyi ve davranışı bir arada tuttuğunu gördün. Bu derste o verinin <b>nasıl korunacağını</b> (kapsülleme, encapsulation) ve bir nesnenin içine çalışma anında <b>nasıl bakılacağını</b> (iç gözlem, introspection) öğreneceksin. İkisi de PCAP sınavının 4. bölümünün çekirdeğidir ve gerçek projelerde her gün kullanılır: doğrulayan setter'lar, salt okunur alanlar, nesneyi dinamik olarak JSON'a çeviren yardımcılar, eklenti sistemleri.</p>
<p>Kapsüllemenin özü şudur: nesnenin iç durumunu yalnızca kendi metotları değiştirsin, dışarıya kontrollü bir kapı açılsın. Python bunu derleyici zoruyla değil, <b>sözleşme ve araçlarla</b> yapar: alt çizgi adlandırması, name mangling ve <code>property</code>.</p>

<h2>Örnek değişkeni ve sınıf değişkeni: arama sırası</h2>
<p>Sınıflar dersinde ikisinin farkını gördün; şimdi işin mekaniğine bakalım. <code>nesne.ad</code> yazdığında Python önce <b>nesnenin</b> sözlüğüne, bulamazsa <b>sınıfın</b> sözlüğüne, sonra üst sınıflara bakar. Okurken bu zincir izlenir; ama <b>atama</b> her zaman nesnenin kendi sözlüğüne yazar. Bu yüzden <code>k1.oran = 35</code> sınıf değişkenini değiştirmez, onu gölgeleyen (shadowing) yeni bir örnek değişkeni yaratır.</p>
<pre class="py">class Kur:
    oran = 32.5            # sınıf değişkeni: tüm nesneler paylaşır

k1 = Kur()
k2 = Kur()
k1.oran = 33.0             # k1'e ÖZEL yeni değişken; sınıfa dokunmaz
Kur.oran = 34.0            # sınıfı değiştir: gölgelenmeyen herkes görür
print(k1.oran, k2.oran, Kur.oran)
print(k1.__dict__, k2.__dict__)
del k1.oran                # gölgeyi kaldır
print(k1.oran)             # artık sınıfınkini görür</pre>
<p>Asıl tehlike <b>değiştirilebilir</b> (mutable) bir sınıf değişkenidir. Liste ya da sözlük sınıf gövdesinde tanımlanıp <code>self.liste.append(...)</code> ile değiştirilirse atama olmadığı için gölge oluşmaz; herkes aynı listeye yazar.</p>
<pre class="py">class Musteri:
    siparisler = []                    # TUZAK: tek liste, herkes paylaşır
    def __init__(self, ad):
        self.ad = ad
    def siparis_ver(self, no):
        self.siparisler.append(no)

a = Musteri("Ayşe")
b = Musteri("Burak")
a.siparis_ver("AM-101")
print(b.siparisler)                     # Burak'ın siparişi yok ama görünüyor!

class MusteriDuzgun:
    def __init__(self, ad):
        self.ad = ad
        self.siparisler = []           # her nesneye kendi listesi
c = MusteriDuzgun("Can")
print(c.siparisler, "siparisler" in vars(c))</pre>
<div class="warn"><b>Kural</b>Sınıf değişkeni olarak yalnızca değişmez (immutable) değerler tut: sabitler, oranlar, sayaçlar. Liste, sözlük, küme gibi kaplar her zaman <code>__init__</code> içinde <code>self.</code> ile oluşturulur.</div>

<h2>__dict__ ve vars(): nesnenin içi</h2>
<p>Her nesnenin niteliklerini tutan bir sözlüğü vardır: <code>nesne.__dict__</code>. <code>vars(nesne)</code> aynı sözlüğü döndürür ve daha okunurdur. Sınıfın da bir <code>__dict__</code>'i vardır; metotlar, sınıf değişkenleri ve property'ler oradadır. Sınıfınki salt okunur bir <code>mappingproxy</code>'dir, doğrudan yazamazsın.</p>
<pre class="py">class Urun:
    kdv = 0.20
    def __init__(self, ad, fiyat):
        self.ad = ad
        self.fiyat = fiyat
    def kdvli(self):
        return round(self.fiyat * (1 + self.kdv), 2)

u = Urun("Kulaklık", 1000)
print(vars(u))                                  # yalnız örnek verisi
print([k for k in vars(Urun) if not k.startswith("__")])
print(type(vars(Urun)).__name__)
u.__dict__["stok"] = 7                          # sözlüğe yazmak = nitelik eklemek
print(u.stok, u.kdvli())</pre>
<p><code>vars()</code> özellikle hata ayıklarken ve nesneyi sözlüğe/JSON'a çevirirken işe yarar. Ama dikkat: property'ler ve sınıf değişkenleri nesnenin sözlüğünde <b>görünmez</b>.</p>

<h2>Tek alt çizgi, çift alt çizgi ve name mangling</h2>
<p>Python'da <code>private</code> anahtar sözcüğü yoktur. Bunun yerine iki adlandırma kuralı vardır:</p>
<div class="tbl-wrap"><table>
<tr><th>Yazım</th><th>Anlamı</th><th>Dışarıdan erişim</th></tr>
<tr><td><code>bakiye</code></td><td>Genel (public) arayüz</td><td>Serbest</td></tr>
<tr><td><code>_bakiye</code></td><td>Korunan (protected): "iç ayrıntı, dokunma" sözleşmesi</td><td>Teknik olarak serbest; <code>from m import *</code> almaz</td></tr>
<tr><td><code>__bakiye</code></td><td>Gizli (private): ad karıştırma (name mangling) uygulanır</td><td><code>_Hesap__bakiye</code> adıyla erişilir</td></tr>
<tr><td><code>__init__</code></td><td>Dunder (özel metot): iki yanda çift alt çizgi</td><td>Karıştırma YOK</td></tr>
</table></div>
<p>Sınıf gövdesinde <code>__ad</code> biçimindeki (sonunda çift alt çizgi olmayan) her ad, derleme sırasında <code>_SinifAdi__ad</code> olarak yeniden yazılır. Amaç gizlemek değil, <b>alt sınıflarla ad çakışmasını önlemektir</b>: alt sınıf da <code>__bakiye</code> tanımlarsa o <code>_AltSinif__bakiye</code> olur, üst sınıfınkini ezmez.</p>
<pre class="py">class Hesap:
    def __init__(self, sahip, bakiye):
        self.sahip = sahip
        self._limit = 5000          # korunan: sözleşme
        self.__bakiye = bakiye      # gizli: ad karıştırılır

h = Hesap("Ayşe", 1200)
print(sorted(vars(h)))
try:
    print(h.__bakiye)
except AttributeError as e:
    print("Hata:", e)
print(h._Hesap__bakiye)              # mümkün ama YAPMA
h.__bakiye = 0                       # sınıf dışında karıştırma olmaz: YENİ nitelik
print(sorted(vars(h)))</pre>
<p>Son satır PCAP'te sevilen bir tuzaktır: sınıf <b>dışında</b> yazılan <code>h.__bakiye = 0</code> karıştırılmaz; nesneye <code>__bakiye</code> adında ikinci bir nitelik ekler, gerçek bakiye yerinde durur.</p>

<h2>property: kontrollü kapı</h2>
<p><code>property</code>, bir metodu nitelik gibi okutur ve atamayı kendi kodundan geçirir. Getter (okuyucu), setter (yazıcı) ve deleter (silici) olmak üzere üç parçası vardır. Böylece dış arayüz <code>urun.fiyat = 250</code> gibi sade kalır ama içeride doğrulama çalışır.</p>
<pre class="py">class Urun:
    def __init__(self, ad, fiyat):
        self.ad = ad
        self.fiyat = fiyat          # setter'dan geçer, doğrulanır

    @property
    def fiyat(self):
        return self._fiyat

    @fiyat.setter
    def fiyat(self, deger):
        if not isinstance(deger, (int, float)) or deger &lt; 0:
            raise ValueError(f"Geçersiz fiyat: {deger!r}")
        self._fiyat = round(float(deger), 2)

    @fiyat.deleter
    def fiyat(self):
        print("Fiyat kaldırıldı")
        del self._fiyat

u = Urun("Termos", 349.999)
print(u.fiyat)
try:
    u.fiyat = -10
except ValueError as e:
    print(e)
print(vars(u))
del u.fiyat
print(hasattr(u, "fiyat"))</pre>
<p>İki ayrıntıya dikkat: değer <code>_fiyat</code> adında saklanır (property ile aynı adı kullanırsan setter kendini sonsuza kadar çağırır, RecursionError). Ve kurucuda <code>self.fiyat = fiyat</code> yazmak bilinçli bir seçimdir: doğrulama nesne ilk oluşturulurken de çalışır.</p>
<h3>Salt okunur nitelik</h3>
<p>Yalnız getter tanımlarsan nitelik salt okunur olur; atama <code>AttributeError</code> verir. Bakiye, müşteri numarası, oluşturma tarihi gibi değerler için idealdir. Bakiye değişecekse bunu <code>yatir</code>/<code>cek</code> gibi kurallı metotlar yapar.</p>
<pre class="py">class Hesap:
    def __init__(self, no, bakiye=0.0):
        self._no = no
        self.__bakiye = float(bakiye)

    @property
    def no(self):
        return self._no

    @property
    def bakiye(self):
        return self.__bakiye

    def yatir(self, tutar):
        if tutar &lt;= 0:
            raise ValueError("Tutar pozitif olmalı")
        self.__bakiye += tutar

h = Hesap("AB-001", 500)
h.yatir(250)
print(h.no, h.bakiye)
try:
    h.bakiye = 1_000_000
except AttributeError as e:
    print("Engellendi:", e)</pre>

<h2>getattr, setattr, hasattr, delattr: adı çalışma anında belli olan nitelikler</h2>
<p>Niteliğin adı bir değişkende (ör. formdan ya da CSV başlığından gelen bir metinde) duruyorsa nokta sözdizimi işe yaramaz. Dört yerleşik fonksiyon bu işi yapar:</p>
<div class="tbl-wrap"><table>
<tr><th>Fonksiyon</th><th>Eşdeğeri</th><th>Not</th></tr>
<tr><td><code>getattr(n, "ad")</code></td><td><code>n.ad</code></td><td>Üçüncü argüman varsayılan: <code>getattr(n, "ad", None)</code> hata vermez</td></tr>
<tr><td><code>setattr(n, "ad", d)</code></td><td><code>n.ad = d</code></td><td>Property setter'ı da çalışır</td></tr>
<tr><td><code>hasattr(n, "ad")</code></td><td>getattr dener, AttributeError olursa False</td><td>Property içindeki AttributeError da False'a döner</td></tr>
<tr><td><code>delattr(n, "ad")</code></td><td><code>del n.ad</code></td><td>Deleter varsa onu çağırır</td></tr>
</table></div>
<pre class="py">class Calisan:
    def __init__(self, ad, departman, maas):
        self.ad, self.departman, self.maas = ad, departman, maas

c = Calisan("Elif", "İK", 42000)
guncelleme = {"departman": "Finans", "maas": 45000, "unvan": "Uzman"}
for alan, deger in guncelleme.items():
    if hasattr(c, alan):
        setattr(c, alan, deger)
    else:
        print("Bilinmeyen alan atlandı:", alan)
print(vars(c))
print(getattr(c, "unvan", "belirtilmemiş"))
metot_adi = "upper"
print(getattr(c.ad, metot_adi)())     # metotlar da nitelik</pre>
<div class="tip"><b>Varsayılanı unutma</b><code>getattr(n, ad)</code> nitelik yoksa AttributeError fırlatır. Dışarıdan gelen adlarla çalışırken ya varsayılan ver ya da önce <code>hasattr</code> ile sor.</div>

<h2>İç gözlem nitelikleri: __name__, __module__, __bases__, __class__</h2>
<p>Sınıflar da nesnedir ve kendileri hakkında bilgi taşır. PCAP bunları doğrudan sorar:</p>
<pre class="py">class Hesap:
    pass
class VadeliHesap(Hesap):
    pass

v = VadeliHesap()
print(VadeliHesap.__name__)                     # sınıfın adı
print(VadeliHesap.__module__)                   # tanımlandığı modül
print(VadeliHesap.__bases__)                    # doğrudan üst sınıflar (demet)
print(v.__class__.__name__, type(v) is VadeliHesap)
print(isinstance(v, Hesap), type(v) is Hesap)   # isinstance kalıtımı gözetir
print(issubclass(VadeliHesap, Hesap), issubclass(Hesap, object))
print(Hesap.__bases__)</pre>
<p><code>type(n)</code> nesnenin tam sınıfını verir; <code>isinstance</code> ise alt sınıfları da kabul eder. "Bu bir Hesap mı?" sorusunda neredeyse her zaman <code>isinstance</code> doğrudur. <code>__bases__</code> yalnız <b>doğrudan</b> üst sınıfları içerir; tüm zinciri görmek için <code>__mro__</code> kullanılır (çoklu kalıtım dersinde).</p>

<h2>classmethod ile alternatif kurucu</h2>
<p>Bir sınıfı farklı kaynaklardan (CSV satırı, sözlük, API yanıtı) kurmak istediğinde <code>__init__</code>'i şişirmek yerine <code>@classmethod</code> ile adlandırılmış kurucular yazarsın. İlk parametre <code>cls</code>'dir; <code>cls(...)</code> çağırdığın için alt sınıflarda da doğru türü üretir.</p>
<pre class="py">class Hesap:
    _sayac = 0                                   # değişmez sayaç: sınıf değişkeni uygun

    def __init__(self, sahip, bakiye=0.0):
        Hesap._sayac += 1
        self.no = f"AB-{Hesap._sayac:04d}"
        self.sahip = sahip
        self.bakiye = float(bakiye)

    @classmethod
    def satirdan(cls, satir):
        sahip, bakiye = satir.split(";")
        return cls(sahip.strip(), float(bakiye))

    @classmethod
    def sozlukten(cls, d):
        return cls(d["sahip"], d.get("bakiye", 0))

    def __repr__(self):
        return f"{type(self).__name__}({self.no}, {self.sahip}, {self.bakiye:.2f})"

print(Hesap.satirdan("Ayşe Kaya; 1500.5"))
print(Hesap.sozlukten({"sahip": "Burak Demir"}))
print(Hesap._sayac)</pre>
<p>Sayaçta <code>Hesap._sayac += 1</code> yazdık, <code>self._sayac += 1</code> değil. İkincisi okumayı sınıftan yapar ama sonucu nesneye yazar; sayaç hiç artmamış gibi görünür. Gölgeleme kuralının pratik sonucu budur.</p>

<div class="note"><b>Gerçek işte</b>Bankacılık ve sağlık yazılımlarında denetim (audit) ekipleri "bakiye/teşhis alanı nerede değiştirilebiliyor?" diye sorar. Cevabın "yalnız şu iki metotta" olması kod incelemesini dakikalara indirir. Salt okunur property ve tek giriş noktalı metotlar bu cevabı mümkün kılar. Ayrıca pydantic, SQLAlchemy, Django ORM gibi kütüphaneler içeride tam olarak bu dersteki araçları kullanır: <code>setattr</code> ile alan doldurma, <code>__dict__</code> ile serileştirme, property ile hesaplanan alanlar.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>"Hepimiz yetişkiniz" felsefesi</h3>
<p>Python topluluğunun sözü: "We are all consenting adults." Dil seni <code>_Hesap__bakiye</code>'ye erişmekten alıkoymaz; alt çizgi bir uyarı levhasıdır, kilit değil. Gerçek güvenlik (yetkilendirme, şifreleme) uygulama katmanında sağlanır. Kapsülleme ise <b>hata önleme ve bakım kolaylığı</b> içindir. Bu yüzden çoğu proje <code>__gizli</code> yerine tek alt çizgi <code>_korunan</code> kullanır; çift alt çizgiyi yalnızca kalıtımda ad çakışması gerçek bir risk olduğunda seçer.</p>
<h3>Önce düz nitelik, sonra property</h3>
<p>Java alışkanlığıyla her alana <code>get_x</code>/<code>set_x</code> yazma. Python'da alanı düz nitelik olarak başlat; ileride doğrulama gerekirse aynı adla property'ye çevir. Çağıran kodun tek satırı bile değişmez. Bu, property'nin varlık sebebidir.</p>
<h3>__getattr__ ve __setattr__</h3>
<p><code>__getattr__(self, ad)</code> yalnız normal arama <b>başarısız olduğunda</b> çağrılır; eksik alanlara varsayılan vermek ya da başka bir nesneye yönlendirmek (delegation) için kullanılır. <code>__setattr__</code> ise <b>her</b> atamada çalışır; içinde <code>self.x = ...</code> yazarsan sonsuz döngüye girersin, <code>super().__setattr__(ad, deger)</code> kullanmalısın. Bu derste bir meydan okuma görevinde göreceksin. Tekrarlanan doğrulama mantığını birçok sınıfta kullanmak için descriptor'lar ve <code>__slots__</code> İleri OOP dersinde.</p>
<h3>PCAP için hızlı kontrol listesi</h3>
<ul>
<li><code>hasattr(Sinif, "x")</code> sınıf değişkenleri için True, yalnız <code>__init__</code>'te atanan örnek değişkenleri için False'tur.</li>
<li><code>__name__</code> sınıfta vardır, sıradan bir nesnede yoktur: <code>n.__class__.__name__</code> yazılır.</li>
<li><code>__bases__</code> demettir; <code>object</code>'ten türeyen sınıf için <code>(&lt;class 'object'&gt;,)</code>.</li>
<li>Name mangling yalnız sınıf gövdesi içinde yazılan adlara uygulanır.</li>
</ul>
</section>
'''

ex = []
# ---------- Isınma
ex += [
{'t': 'mc', 'stage': 'Isınma',
 'q': 'Hesap sınıfının <code>__init__</code> metodunda <code>self.__pin = "1234"</code> yazılmış. Sınıf dışından bu değere hangi adla erişilir?',
 'o': ['<code>h.__pin</code>', '<code>h._Hesap__pin</code>', '<code>h._pin</code>', 'Hiçbir şekilde erişilemez'], 'a': 1,
 'why': 'Sınıf gövdesinde yazılan __ad biçimli adlar _SinifAdi__ad olarak yeniden adlandırılır (name mangling). h.__pin AttributeError verir. Erişim mümkündür ama sözleşmeyi bozar; Python gerçek gizlilik sağlamaz.'},
{'t': 'mc', 'stage': 'Isınma',
 'q': '<code>class Kur: oran = 30</code> tanımından sonra <code>k = Kur(); k.oran = 35</code> çalıştırılıyor. Ne olur?',
 'o': ['Kur.oran 35 olur, tüm nesneler 35 görür', 'AttributeError: sınıf değişkenine atanamaz', 'k nesnesine özel yeni bir oran niteliği oluşur', 'Hem Kur.oran hem k.oran 35 olur'], 'a': 2,
 'why': 'Atama her zaman nesnenin kendi __dict__\'ine yazar. k.oran artık sınıf değişkenini gölgeler; Kur.oran ve diğer nesneler 30 görmeye devam eder.'},
{'t': 'mc', 'stage': 'Isınma',
 'q': 'Yalnız getter\'ı olan (setter tanımlanmamış) bir property\'ye <code>nesne.alan = 5</code> ile değer atamaya çalışırsan ne olur?',
 'o': ['Değer sessizce yok sayılır', 'AttributeError fırlatılır', 'Getter yeni değeri döndürmeye başlar', 'Nesnenin __dict__\'ine alan eklenir'], 'a': 1,
 'why': 'Setter\'ı olmayan property salt okunurdur; Python atamayı AttributeError ile reddeder. Sessizce yok sayma ya da __dict__\'e yazma olmaz, çünkü property sınıf düzeyinde tanımlıdır ve nesne sözlüğünden önce gelir.'},
]
# ---------- Kodu oku
ex += [
{'t': 'predict', 'stage': 'Kodu oku', 'q': 'Bu kod ne yazdırır?',
 'code': C('''
class Sepet:
    urunler = []
    def ekle(self, urun):
        self.urunler.append(urun)

a = Sepet()
b = Sepet()
a.ekle("elma")
print(b.urunler, len(Sepet.urunler))
'''),
 'o': ['[] 0', "['elma'] 1", '[] 1', "['elma'] 0"], 'a': 1,
 'why': 'urunler sınıf değişkenidir ve append bir atama değildir; gölge oluşmaz. a, b ve Sepet aynı listeyi paylaşır, bu yüzden b de "elma"yı görür.'},
{'t': 'predict', 'stage': 'Kodu oku', 'q': 'Bu kod ne yazdırır?',
 'code': C('''
class Kur:
    oran = 30

k1 = Kur()
k2 = Kur()
k1.oran = 35
Kur.oran = 40
print(k1.oran, k2.oran, Kur.oran)
'''),
 'o': ['35 35 40', '40 40 40', '35 40 40', '35 30 40'], 'a': 2,
 'why': 'k1.oran = 35 k1\'e özel gölge nitelik yaratır. Kur.oran = 40 sınıfı değiştirir; gölgesi olmayan k2 bunu görür, k1 kendi 35\'ini görür.'},
{'t': 'predict', 'stage': 'Kodu oku', 'q': 'Bu kod ne yazdırır?',
 'code': C('''
class Hesap:
    def __init__(self):
        self.__pin = "1234"
        self._limit = 500

h = Hesap()
h.__pin = "0000"
print(sorted(vars(h)))
'''),
 'o': ["['_Hesap__pin', '_limit']", "['__pin', '_limit']", "['__pin', '_Hesap__pin', '_limit']", "['_Hesap__pin', '__pin', '_limit']"], 'a': 3,
 'why': 'Kurucudaki self.__pin, _Hesap__pin olarak saklanır. Sınıf dışındaki h.__pin = "0000" karıştırılmaz ve __pin adında YENİ bir nitelik ekler. sorted karakter koduna göre sıralar; ikinci karakterler H < _ < l olduğundan sıra "_Hesap__pin", "__pin", "_limit" olur.'},
{'t': 'order', 'stage': 'Kodu oku',
 'q': '<p>Fiyatı doğrulayan property\'li <code>Urun</code> sınıfını ve kullanımını doğru sıraya koy. Çıktı önce <code>120.0</code>, sonra <code>Geçersiz fiyat</code> olmalı.</p>',
 'lines': ['class Urun:', '    @property', '    def fiyat(self):', '        return self._fiyat', '    @fiyat.setter', '    def fiyat(self, deger):', '        if deger < 0: raise ValueError("Geçersiz fiyat")', '        self._fiyat = float(deger)', 'u = Urun()', 'u.fiyat = 120', 'print(u.fiyat)', 'try: u.fiyat = -5', 'except ValueError as e: print(e)'],
 'expect': '120.0\nGeçersiz fiyat\n',
 'hint': 'Getter (@property) önce gelmeli; @fiyat.setter ancak fiyat adlı property var olduktan sonra yazılabilir.',
 'why': '@fiyat.setter, önceden tanımlanmış fiyat property\'sinin setter\'ını ekler; bu yüzden getter önce gelir. Önce geçerli değer atanıp yazdırılır; ardından geçersiz atama ValueError verir ve mesaj yazdırılır.'},
]
# ---------- Rehberli
ex += [
{'t': 'code', 'stage': 'Rehberli', 'id': 'kapsulleme-ozellik-1', 'diff': 1,
 'q': '<p>Anadolu Market için <code>Urun(ad, fiyat)</code> sınıfını yaz. <code>fiyat</code> bir <b>property</b> olsun: setter, değer sayı değilse ya da negatifse <code>ValueError("Geçersiz fiyat")</code> fırlatsın; geçerliyse <code>round(float(deger), 2)</code> olarak <code>_fiyat</code> içinde saklasın. Kurucu da setter\'dan geçsin ki <code>Urun("X", -1)</code> hata versin.</p>',
 'guide': ['Kurucuda self.ad = ad ve self.fiyat = fiyat yaz (alt çizgisiz: setter çalışsın).', '@property ile fiyat getter\'ını yaz: self._fiyat döndürsün.', '@fiyat.setter ile setter\'ı yaz; isinstance(deger, (int, float)) ve deger >= 0 kontrolü yap.', 'Geçerliyse self._fiyat = round(float(deger), 2) ata.'],
 'example': C('''
class Sicaklik:
    def __init__(self, derece):
        self.derece = derece

    @property
    def derece(self):
        return self._derece

    @derece.setter
    def derece(self, d):
        if d < -273.15:
            raise ValueError("Mutlak sıfırın altı olamaz")
        self._derece = d

s = Sicaklik(21)
print(s.derece)
'''),
 'start': C('''
class Urun:
    def __init__(self, ad, fiyat):
        self.ad = ad
        # TODO: fiyatı setter üzerinden ata

    # TODO: @property ile fiyat getter'ı

    # TODO: @fiyat.setter ile doğrulayan setter
'''),
 'sol': C('''
class Urun:
    def __init__(self, ad, fiyat):
        self.ad = ad
        self.fiyat = fiyat

    @property
    def fiyat(self):
        return self._fiyat

    @fiyat.setter
    def fiyat(self, deger):
        if isinstance(deger, bool) or not isinstance(deger, (int, float)) or deger < 0:
            raise ValueError("Geçersiz fiyat")
        self._fiyat = round(float(deger), 2)
'''),
 'tests': C('''
u = Urun("Termos", 349.999)
assert u.fiyat == 350.0, "fiyat round(..., 2) ile saklanmalı: 349.999 -> 350.0"
assert "_fiyat" in vars(u), "değer _fiyat adıyla nesnenin sözlüğünde durmalı"
assert isinstance(type(u).__dict__.get("fiyat"), property), "fiyat bir property olmalı"
u.fiyat = 120
assert u.fiyat == 120.0, "geçerli atama değeri güncellemeli"
for kotu in (-5, "100", None):
    try:
        u.fiyat = kotu
        assert False, f"{kotu!r} ataması ValueError vermeliydi"
    except ValueError:
        pass
assert u.fiyat == 120.0, "hatalı atama eski değeri bozmamalı"
try:
    Urun("Bozuk", -1)
    assert False, "kurucu da doğrulamalı: Urun('Bozuk', -1) ValueError vermeli"
except ValueError:
    pass
'''),
 'hints': ['Kavram: property + setter; değeri property ile AYNI adda saklama.', 'Setter içinde: if not isinstance(deger, (int, float)) or deger < 0: raise ValueError("Geçersiz fiyat")', 'Son satır: self._fiyat = round(float(deger), 2); kurucuda self.fiyat = fiyat.'],
 'why': 'Kurucu self.fiyat = fiyat yazdığı için setter ilk oluşturmada da çalışır. Değer _fiyat\'ta saklanır; property ile aynı ad kullanılsaydı setter kendini sonsuza kadar çağırırdı. bool, int\'in alt sınıfı olduğu için ayrıca elenebilir.'},
{'t': 'code', 'stage': 'Rehberli', 'id': 'kapsulleme-ozellik-2', 'diff': 1,
 'q': '<p>Rapor ekranı hangi alanların gösterileceğini bir listeden okuyor. <code>alan_raporu(nesne, alanlar)</code> fonksiyonunu yaz: her alan adı için nesnedeki değeri alsın, nitelik yoksa <code>"yok"</code> yazsın ve <code>{alan: deger}</code> sözlüğü döndürsün. Property\'ler de çalışmalı.</p>',
 'guide': ['Boş bir sonuç sözlüğü oluştur.', 'alanlar listesinde dön.', 'Her alan için getattr(nesne, alan, "yok") ile değeri al.', 'Sözlüğe yaz ve döngüden sonra döndür.'],
 'example': C('''
class Sehir:
    def __init__(self, ad):
        self.ad = ad

s = Sehir("Bursa")
print(getattr(s, "ad"))
print(getattr(s, "nufus", 0))
'''),
 'start': C('''
def alan_raporu(nesne, alanlar):
    sonuc = {}
    # TODO: her alan için getattr ile değeri (yoksa "yok") sözlüğe ekle
    return sonuc
'''),
 'sol': C('''
def alan_raporu(nesne, alanlar):
    sonuc = {}
    for alan in alanlar:
        sonuc[alan] = getattr(nesne, alan, "yok")
    return sonuc
'''),
 'tests': C('''
class Siparis:
    def __init__(self, no, tutar):
        self.no = no
        self.tutar = tutar
    @property
    def kdvli(self):
        return round(self.tutar * 1.2, 2)

s = Siparis("AM-101", 100)
r = alan_raporu(s, ["no", "kdvli", "kargo"])
assert r == {"no": "AM-101", "kdvli": 120.0, "kargo": "yok"}, f"beklenen no/kdvli/kargo raporu, gelen {r}"
assert alan_raporu(s, []) == {}, "boş alan listesi boş sözlük döndürmeli"
assert list(alan_raporu(s, ["tutar", "no"])) == ["tutar", "no"], "sözlük alan sırasını korumalı"
'''),
 'hints': ['Kavram: adı bir metinde duran niteliğe erişmek.', 'getattr\'ın üçüncü argümanı varsayılan değerdir.', 'Döngü içinde: sonuc[alan] = getattr(nesne, alan, "yok")'],
 'why': 'getattr(nesne, ad, varsayilan) hem düz nitelikleri hem property\'leri okur; nitelik yoksa hata yerine varsayılanı döndürür.'},
{'t': 'code', 'stage': 'Rehberli', 'id': 'kapsulleme-ozellik-3', 'diff': 2,
 'q': '<p>İK sistemi için <code>Calisan(ad, departman, maas)</code> sınıfını yaz. Sınıf değişkeni <code>toplam = 0</code> her yeni çalışanda 1 artsın ve çalışana <code>sicil</code> olarak <code>"IK-0001"</code>, <code>"IK-0002"</code>... verilsin. Ayrıca <code>@classmethod satirdan(cls, satir)</code> alternatif kurucusu <code>"Ayşe Kaya;Finans;42000"</code> biçimindeki metinden nesne üretsin (maas <code>int</code> olsun, boşluklar kırpılsın).</p>',
 'guide': ['Sınıf gövdesinde toplam = 0 tanımla.', '__init__ içinde Calisan.toplam += 1 yaz (self.toplam += 1 DEĞİL).', 'sicil\'i f"IK-{Calisan.toplam:04d}" ile oluştur.', 'satirdan içinde split(";") ile parçala, strip ve int uygula, cls(...) döndür.'],
 'example': C('''
class Bilet:
    satilan = 0
    def __init__(self, yolcu):
        Bilet.satilan += 1
        self.no = f"B{Bilet.satilan:03d}"
        self.yolcu = yolcu

    @classmethod
    def metinden(cls, metin):
        return cls(metin.strip().title())

print(Bilet.metinden("  ali veli ").no, Bilet.satilan)
'''),
 'start': C('''
class Calisan:
    toplam = 0

    def __init__(self, ad, departman, maas):
        self.ad = ad
        self.departman = departman
        self.maas = maas
        # TODO: sayacı sınıf üzerinden artır ve sicil üret

    # TODO: @classmethod satirdan(cls, satir)
'''),
 'sol': C('''
class Calisan:
    toplam = 0

    def __init__(self, ad, departman, maas):
        self.ad = ad
        self.departman = departman
        self.maas = maas
        Calisan.toplam += 1
        self.sicil = f"IK-{Calisan.toplam:04d}"

    @classmethod
    def satirdan(cls, satir):
        ad, departman, maas = [p.strip() for p in satir.split(";")]
        return cls(ad, departman, int(maas))
'''),
 'tests': C('''
Calisan.toplam = 0
a = Calisan("Elif", "İK", 40000)
b = Calisan.satirdan(" Ayşe Kaya ; Finans ; 42000 ")
assert a.sicil == "IK-0001" and b.sicil == "IK-0002", f"siciller sırayla verilmeli, gelen {a.sicil}, {b.sicil}"
assert Calisan.toplam == 2, "toplam sınıf değişkeni 2 olmalı: self.toplam += 1 sayacı nesneye yazar, sınıfı artırmaz"
assert "toplam" not in vars(a), "toplam nesnenin sözlüğüne düşmemeli (gölgeleme)"
assert (b.ad, b.departman, b.maas) == ("Ayşe Kaya", "Finans", 42000), "satirdan boşlukları kırpıp maaşı int yapmalı"
assert isinstance(b, Calisan), "satirdan Calisan nesnesi döndürmeli"
class Stajyer(Calisan):
    pass
s = Stajyer.satirdan("Can;BT;15000")
assert type(s) is Stajyer, "cls(...) kullanırsan alt sınıftan çağrı alt sınıf nesnesi üretir"
'''),
 'hints': ['Kavram: sınıf değişkeni sayaç + classmethod alternatif kurucu.', 'Sayaç: Calisan.toplam += 1; sicil: f"IK-{Calisan.toplam:04d}"', 'satirdan: ad, dep, maas = [p.strip() for p in satir.split(";")]; return cls(ad, dep, int(maas))'],
 'why': 'Sayaç sınıf üzerinden artırılınca tüm nesneler ortak değeri paylaşır. classmethod içinde cls(...) çağırmak alt sınıflarda da doğru türü üretir; Calisan(...) yazsaydın Stajyer.satirdan bir Calisan döndürürdü.'},
]
# ---------- Kendin yaz
ex += [
{'t': 'code', 'stage': 'Kendin yaz', 'id': 'kapsulleme-ozellik-4', 'diff': 2,
 'q': '<p>Ilgaz Bank için <code>Hesap(no, bakiye=0.0)</code> yaz. Bakiye <code>self.__bakiye</code> içinde (name mangling) dursun ve yalnız <b>salt okunur</b> <code>bakiye</code> property\'siyle okunabilsin. <code>yatir(tutar)</code> ve <code>cek(tutar)</code> pozitif olmayan tutar için <code>ValueError("Tutar pozitif olmalı")</code>, yetersiz bakiyede <code>ValueError("Yetersiz bakiye")</code> versin. Her başarılı işlem <code>islem_sayisi</code> (salt okunur property) değerini 1 artırsın.</p>',
 'start': C('''
class Hesap:
    def __init__(self, no, bakiye=0.0):
        self.no = no
        self.bakiye = bakiye
'''),
 'sol': C('''
class Hesap:
    def __init__(self, no, bakiye=0.0):
        self.no = no
        self.__bakiye = float(bakiye)
        self.__islem = 0

    @property
    def bakiye(self):
        return self.__bakiye

    @property
    def islem_sayisi(self):
        return self.__islem

    def yatir(self, tutar):
        if tutar <= 0:
            raise ValueError("Tutar pozitif olmalı")
        self.__bakiye += tutar
        self.__islem += 1

    def cek(self, tutar):
        if tutar <= 0:
            raise ValueError("Tutar pozitif olmalı")
        if tutar > self.__bakiye:
            raise ValueError("Yetersiz bakiye")
        self.__bakiye -= tutar
        self.__islem += 1
'''),
 'tests': C('''
h = Hesap("AB-001", 1000)
h.yatir(500)
h.cek(200)
assert h.bakiye == 1300, f"1000 + 500 - 200 = 1300 olmalı, gelen {h.bakiye}"
assert h.islem_sayisi == 2, "iki başarılı işlem sayılmalı"
assert "_Hesap__bakiye" in vars(h), "bakiye self.__bakiye olarak (karıştırılmış adla) saklanmalı"
try:
    h.bakiye = 10**6
    assert False, "bakiye salt okunur olmalı: atama AttributeError vermeli"
except AttributeError:
    pass
for f, t, msg in ((h.cek, 5000, "Yetersiz bakiye"), (h.yatir, 0, "Tutar pozitif olmalı"), (h.cek, -3, "Tutar pozitif olmalı")):
    try:
        f(t)
        assert False, f"{f.__name__}({t}) ValueError vermeliydi"
    except ValueError as e:
        assert str(e) == msg, f"mesaj {msg!r} olmalı, gelen {str(e)!r}"
assert h.bakiye == 1300 and h.islem_sayisi == 2, "hatalı işlemler bakiye ve sayacı değiştirmemeli"
'''),
 'hints': ['İki gizli alan tut: self.__bakiye ve self.__islem; ikisine de yalnız getter yaz.', 'Önce tutar <= 0 kontrolü, sonra (cek için) tutar > bakiye kontrolü; ikisi de geçerse değiştir ve sayacı artır.'],
 'why': 'Salt okunur property dışarıya okuma kapısı açar ama yazmayı kapatır; bakiye yalnız kurallı iki metotla değişir. Hata kontrolleri değişiklikten ÖNCE yapıldığı için hatalı işlem durumu bozmaz.'},
{'t': 'code', 'stage': 'Kendin yaz', 'id': 'kapsulleme-ozellik-5', 'diff': 2,
 'q': '<p>Bir web formundan gelen sözlükle nesneyi güncelleyen <code>nitelik_guncelle(nesne, degisiklikler)</code> fonksiyonunu yaz. Nesnede zaten var olan (<code>hasattr</code>) ve alt çizgiyle <b>başlamayan</b> alanları <code>setattr</code> ile güncellesin; diğerlerini atlasın. Atlanan anahtarları <b>sıralı liste</b> olarak döndürsün. Setter bir hata fırlatırsa hata yukarı çıksın (yutma).</p>',
 'start': C('''
def nitelik_guncelle(nesne, degisiklikler):
    pass
'''),
 'sol': C('''
def nitelik_guncelle(nesne, degisiklikler):
    atlanan = []
    for alan, deger in degisiklikler.items():
        if alan.startswith("_") or not hasattr(nesne, alan):
            atlanan.append(alan)
        else:
            setattr(nesne, alan, deger)
    return sorted(atlanan)
'''),
 'tests': C('''
class Musteri:
    def __init__(self, ad, sehir, puan):
        self.ad = ad
        self.sehir = sehir
        self._puan = puan
    @property
    def puan(self):
        return self._puan
    @puan.setter
    def puan(self, p):
        if not 0 <= p <= 100:
            raise ValueError("puan 0-100")
        self._puan = p

m = Musteri("Ayşe", "İzmir", 50)
r = nitelik_guncelle(m, {"sehir": "Ankara", "yas": 30, "_puan": 999, "puan": 80, "admin": True})
assert r == ["_puan", "admin", "yas"], f"atlananlar sıralı olmalı, gelen {r}"
assert m.sehir == "Ankara" and m.puan == 80, "var olan genel alanlar güncellenmeli"
assert not hasattr(m, "admin") and not hasattr(m, "yas"), "olmayan alanlar EKLENMEMELİ (toplu atama güvenlik açığı)"
try:
    nitelik_guncelle(m, {"puan": 500})
    assert False, "setter hatası yutulmamalı"
except ValueError:
    pass
'''),
 'hints': ['Kavram: hasattr ile kontrol, setattr ile dinamik atama.', 'Koşul: alan.startswith("_") or not hasattr(nesne, alan) ise atla; değilse setattr. En sonda sorted(atlanan).'],
 'why': 'Formdan gelen her anahtarı körü körüne setattr ile yazmak "toplu atama" (mass assignment) açığıdır: kötü niyetli biri admin=True gönderebilir. Yalnız var olan, genel alanlara izin vermek basit ama etkili bir korumadır; setattr property setter\'ını da çalıştırdığı için doğrulama korunur.'},
{'t': 'code', 'stage': 'Kendin yaz', 'id': 'kapsulleme-ozellik-6', 'diff': 2,
 'q': '<p>Bir sınıfı inceleyip özetleyen <code>sinif_bilgisi(cls)</code> fonksiyonunu yaz. Şu anahtarlarla sözlük döndürsün:</p><ul><li><code>"ad"</code>: sınıfın adı (<code>__name__</code>)</li><li><code>"ustler"</code>: doğrudan üst sınıfların adları listesi (<code>__bases__</code>)</li><li><code>"metotlar"</code>: sınıfın <b>kendi</b> <code>__dict__</code>\'inde tanımlı, alt çizgiyle başlamayan ve çağrılabilir (<code>callable</code>) adların sıralı listesi</li><li><code>"ozellikler"</code>: kendi <code>__dict__</code>\'indeki property adlarının sıralı listesi</li></ul>',
 'start': C('''
def sinif_bilgisi(cls):
    return {}
'''),
 'sol': C('''
def sinif_bilgisi(cls):
    kendi = vars(cls)
    return {
        "ad": cls.__name__,
        "ustler": [b.__name__ for b in cls.__bases__],
        "metotlar": sorted(k for k, v in kendi.items() if not k.startswith("_") and callable(v)),
        "ozellikler": sorted(k for k, v in kendi.items() if isinstance(v, property)),
    }
'''),
 'tests': C('''
class Hesap:
    faiz = 0.4
    def yatir(self, t): pass
    def cek(self, t): pass
class Vadeli(Hesap):
    def __init__(self): pass
    def vade_bozdur(self): pass
    def _hesapla(self): pass
    @property
    def getiri(self): return 0
r = sinif_bilgisi(Vadeli)
assert r["ad"] == "Vadeli", "ad __name__ olmalı"
assert r["ustler"] == ["Hesap"], f"üstler ['Hesap'] olmalı, gelen {r['ustler']}"
assert r["metotlar"] == ["vade_bozdur"], f"yalnız kendi, genel metotlar: ['vade_bozdur'], gelen {r['metotlar']}"
assert r["ozellikler"] == ["getiri"], "property listesi ['getiri'] olmalı (property callable değildir)"
r2 = sinif_bilgisi(Hesap)
assert r2["ustler"] == ["object"] and r2["metotlar"] == ["cek", "yatir"], f"Hesap için object ve ['cek', 'yatir'], gelen {r2}"
'''),
 'hints': ['vars(cls) sınıfın kendi sözlüğünü verir (miras alınanları içermez).', 'Metot: not k.startswith("_") and callable(v); property: isinstance(v, property). Üstler: [b.__name__ for b in cls.__bases__].'],
 'why': 'vars(cls) yalnız o sınıfta tanımlanan adları içerir; miras metotları görmek için MRO boyunca gezmek gerekir. Property nesnesi callable değildir, bu yüzden ayrı bir isinstance kontrolüyle bulunur. Bu tür iç gözlem; belge üreticileri, test araçları ve eklenti sistemlerinin temelidir.'},
]
# ---------- Hata avı
ex += [
{'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'kapsulleme-ozellik-7', 'diff': 2,
 'q': '<p>Stajyerin yazdığı <code>Urun</code> sınıfı nesne oluşturulur oluşturulmaz <b>RecursionError</b> veriyor. Hatayı bul ve düzelt. Davranış: fiyat property\'si negatif değerde <code>ValueError</code> versin, geçerli değeri saklasın.</p>',
 'start': C('''
class Urun:
    def __init__(self, ad, fiyat):
        self.ad = ad
        self.fiyat = fiyat

    @property
    def fiyat(self):
        return self.fiyat

    @fiyat.setter
    def fiyat(self, deger):
        if deger < 0:
            raise ValueError("Fiyat negatif olamaz")
        self.fiyat = deger
'''),
 'sol': C('''
class Urun:
    def __init__(self, ad, fiyat):
        self.ad = ad
        self.fiyat = fiyat

    @property
    def fiyat(self):
        return self._fiyat

    @fiyat.setter
    def fiyat(self, deger):
        if deger < 0:
            raise ValueError("Fiyat negatif olamaz")
        self._fiyat = deger
'''),
 'tests': C('''
u = Urun("Kalem", 25)
assert u.fiyat == 25, "fiyat okunabilmeli"
u.fiyat = 30
assert u.fiyat == 30, "fiyat güncellenebilmeli"
try:
    u.fiyat = -1
    assert False, "negatif fiyat ValueError vermeli"
except ValueError:
    pass
assert any(k != "ad" for k in vars(u)), "değer nesnede farklı bir adla (ör. _fiyat) saklanmalı"
'''),
 'hints': ['Setter içindeki self.fiyat = deger satırı neyi çağırır?', 'Property ile aynı adla atama yapmak setter\'ı tekrar çağırır. Değeri farklı bir adda (_fiyat) sakla; getter da oradan okusun.'],
 'why': 'self.fiyat = deger, setter\'ın içinde yine setter\'ı çağırır; getter\'daki return self.fiyat da getter\'ı. Sonsuz özyineleme oluşur. Çözüm: asıl veriyi _fiyat gibi farklı bir adda tutmak.'},
{'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'kapsulleme-ozellik-8', 'diff': 2,
 'q': '<p>Anadolu Market\'te müşteriler birbirinin sepetini görmeye başladı! Aşağıdaki <code>Musteri</code> sınıfında hatayı bul ve düzelt. Ayrıca toplam müşteri sayacı da yanlış: <code>Musteri.sayac</code> her zaman 0 kalıyor.</p>',
 'start': C('''
class Musteri:
    sayac = 0
    sepet = []

    def __init__(self, ad):
        self.ad = ad
        self.sayac += 1

    def ekle(self, urun):
        self.sepet.append(urun)
'''),
 'sol': C('''
class Musteri:
    sayac = 0

    def __init__(self, ad):
        self.ad = ad
        self.sepet = []
        Musteri.sayac += 1

    def ekle(self, urun):
        self.sepet.append(urun)
'''),
 'tests': C('''
Musteri.sayac = 0
a = Musteri("Ayşe")
b = Musteri("Burak")
a.ekle("Kulaklık")
assert b.sepet == [], f"Burak'ın sepeti boş olmalı, gelen {b.sepet}: liste sınıf değişkeni olarak paylaşılıyor"
assert a.sepet == ["Kulaklık"], "Ayşe'nin sepetinde kendi ürünü olmalı"
assert Musteri.sayac == 2, f"sayaç 2 olmalı, gelen {Musteri.sayac}: self.sayac += 1 nesneye yazar"
assert "sayac" not in vars(a), "sayac nesnenin sözlüğünde olmamalı"
'''),
 'hints': ['İki ayrı hata var: biri paylaşılan liste, biri gölgeleme.', 'sepet\'i __init__ içinde self.sepet = [] ile oluştur; sayacı Musteri.sayac += 1 ile artır.'],
 'why': 'Sınıf gövdesindeki liste tüm nesnelerce paylaşılır; append atama olmadığı için gölge oluşmaz. self.sayac += 1 ise sınıftan okur ama sonucu nesneye yazar, sınıf sayacı 0 kalır. İkisinin de çözümü değişkenin sahibini açıkça seçmektir.'},
]
# ---------- Meydan okuma
ex += [
{'t': 'code', 'stage': 'Meydan okuma', 'id': 'kapsulleme-ozellik-9', 'diff': 3,
 'q': '<p>Denetim ekibi, kayıt nesnelerine yalnız izinli alanların yazılmasını ve her değişikliğin izlenmesini istiyor. <code>KisitliKayit</code> sınıfını yaz:</p><ul><li>Sınıf değişkeni <code>IZINLI = frozenset()</code>; alt sınıflar bunu doldurur.</li><li><code>__setattr__(self, ad, deger)</code>: ad <code>IZINLI</code> içinde değilse <code>AttributeError(f"{ad} alanına yazılamaz")</code>; izinliyse yazsın ve <code>self.gecmis</code> listesine <code>(ad, eski, yeni)</code> eklesin (alan ilk kez yazılıyorsa eski <code>None</code>).</li><li><code>gecmis</code> listesi kurucuda oluşsun ama kendisi IZINLI\'de olmadan yazılabilsin (ipucu: <code>object.__setattr__</code> / <code>super().__setattr__</code>).</li></ul><p>Örnek: <code>class Hasta(KisitliKayit): IZINLI = frozenset({"ad", "doktor"})</code>.</p>',
 'start': C('''
class KisitliKayit:
    IZINLI = frozenset()

    def __init__(self):
        self.gecmis = []
'''),
 'sol': C('''
class KisitliKayit:
    IZINLI = frozenset()

    def __init__(self):
        super().__setattr__("gecmis", [])

    def __setattr__(self, ad, deger):
        if ad not in self.IZINLI:
            raise AttributeError(f"{ad} alanına yazılamaz")
        eski = getattr(self, ad, None)
        super().__setattr__(ad, deger)
        self.gecmis.append((ad, eski, deger))
'''),
 'tests': C('''
class Hasta(KisitliKayit):
    IZINLI = frozenset({"ad", "doktor"})
    def __init__(self, ad, doktor):
        super().__init__()
        self.ad = ad
        self.doktor = doktor

h = Hasta("Ali Yılmaz", "Dr. Kaya")
h.doktor = "Dr. Demir"
assert h.doktor == "Dr. Demir", "izinli alan yazılabilmeli"
assert h.gecmis == [("ad", None, "Ali Yılmaz"), ("doktor", None, "Dr. Kaya"), ("doktor", "Dr. Kaya", "Dr. Demir")], f"geçmiş yanlış: {h.gecmis}"
try:
    h.tani = "gizli"
    assert False, "izinsiz alan AttributeError vermeli"
except AttributeError as e:
    assert str(e) == "tani alanına yazılamaz", f"mesaj yanlış: {e}"
assert not hasattr(h, "tani"), "izinsiz alan nesneye eklenmemeli"
try:
    h.gecmis = []
    assert False, "gecmis dışarıdan yeniden atanamamalı (IZINLI'de değil)"
except AttributeError:
    pass
'''),
 'hints': ['__setattr__ HER atamada çalışır; içinde self.x = ... yazarsan kendini çağırır.', 'Gerçek yazma için super().__setattr__(ad, deger). Kurucuda da gecmis\'i böyle oluştur.', 'Eski değer: getattr(self, ad, None) — yazmadan ÖNCE al.'],
 'why': '__setattr__ tüm atamaları yakalar; gerçek yazmayı object\'in uygulamasına (super().__setattr__) devretmek sonsuz döngüyü önler. gecmis\'i kurucuda aynı yolla oluşturmak onu dışarıdan atanamaz ama içeriden append edilebilir kılar.'},
{'t': 'code', 'stage': 'Meydan okuma', 'id': 'kapsulleme-ozellik-10', 'diff': 3,
 'q': '<p>KVKK gereği müşteri TC kimlik numarası ekranda maskeli görünmeli. <code>Musteri(ad, tc)</code> sınıfını yaz:</p><ul><li><code>tc</code> property getter\'ı maskeli döndürsün: ilk 9 hane <code>*</code>, son 2 hane açık (<code>"*********46"</code>). Değer yoksa <code>None</code>.</li><li>Setter: değer 11 haneli, yalnız rakam ve <code>0</code> ile başlamayan bir metin değilse <code>ValueError("Geçersiz TC")</code>.</li><li>Deleter: değeri silsin (<code>None</code> yapsın) ve sınıf düzeyindeki <code>silme_kaydi</code> listesine müşterinin adını eklesin. Bu liste kasıtlı olarak sınıf değişkenidir (tüm silmelerin denetim kaydı); <b>append</b> ile kullan.</li><li><code>tc_dogrula(self, aday)</code>: ham değeri dışarı vermeden aday metnin kayıtlı TC ile aynı olup olmadığını döndürsün.</li></ul>',
 'start': C('''
class Musteri:
    silme_kaydi = []

    def __init__(self, ad, tc):
        self.ad = ad
        self.tc = tc
'''),
 'sol': C('''
class Musteri:
    silme_kaydi = []

    def __init__(self, ad, tc):
        self.ad = ad
        self.tc = tc

    @property
    def tc(self):
        if self.__tc is None:
            return None
        return "*" * 9 + self.__tc[-2:]

    @tc.setter
    def tc(self, deger):
        if not (isinstance(deger, str) and len(deger) == 11 and deger.isdigit() and deger[0] != "0"):
            raise ValueError("Geçersiz TC")
        self.__tc = deger

    @tc.deleter
    def tc(self):
        self.__tc = None
        Musteri.silme_kaydi.append(self.ad)

    def tc_dogrula(self, aday):
        return self.__tc is not None and aday == self.__tc
'''),
 'tests': C('''
Musteri.silme_kaydi.clear()
m = Musteri("Ayşe", "12345678946")
assert m.tc == "*********46", f"maskeli değer bekleniyordu, gelen {m.tc}"
assert m.tc_dogrula("12345678946") and not m.tc_dogrula("12345678900"), "tc_dogrula doğru karşılaştırmalı"
for kotu in ("0123456789", "01234567891", "1234567894a", 12345678946):
    try:
        Musteri("X", kotu)
        assert False, f"{kotu!r} geçersiz sayılmalı"
    except ValueError:
        pass
n = Musteri("Burak", "98765432110")
del m.tc
assert m.tc is None and not m.tc_dogrula("12345678946"), "silinen TC None olmalı, doğrulama False"
assert Musteri.silme_kaydi == ["Ayşe"], f"silme kaydı ['Ayşe'] olmalı, gelen {Musteri.silme_kaydi}"
assert n.tc == "*********10", "başka müşterinin TC'si etkilenmemeli"
assert "12345678946" not in str(m.__dict__.get("tc", "")), "ham TC public 'tc' adıyla saklanmamalı"
'''),
 'hints': ['Ham değeri self.__tc içinde sakla; getter maskeleyerek döndürsün.', 'Setter koşulu: isinstance(deger, str) and len(deger) == 11 and deger.isdigit() and deger[0] != "0".', 'Deleter: self.__tc = None; Musteri.silme_kaydi.append(self.ad).'],
 'why': 'Getter, setter ve deleter tek bir arayüzün (tc) üç yüzüdür: okurken maskeler, yazarken doğrular, silerken denetim kaydı tutar. Ham değer hiçbir zaman dışarı verilmez; karşılaştırma bile nesnenin içinde yapılır. Burada paylaşılan liste bilinçli bir sınıf değişkenidir, çünkü kayıt tüm müşterilere aittir.'},
]
# ---------- Mini proje
ex += [
{'t': 'code', 'stage': 'Mini proje', 'id': 'kapsulleme-ozellik-11', 'diff': 3,
 'q': '<p><b>Ilgaz Bank hesap modülü.</b> Aşağıdakileri yaz:</p><ol><li><code>Hesap</code> sınıfı: sınıf değişkeni <code>_sayac = 0</code>; <code>Hesap(sahip, bakiye=0.0)</code> her oluşturulduğunda <code>no</code> <code>"AB-0001"</code>, <code>"AB-0002"</code>... olsun. <code>bakiye</code> salt okunur property (değer <code>self._bakiye</code> içinde). <code>yatir(t)</code>/<code>cek(t)</code>: t &lt;= 0 ise <code>ValueError</code>, yetersiz bakiyede <code>ValueError</code>.</li><li><code>@classmethod sozlukten(cls, d)</code>: <code>{"sahip": ..., "bakiye": ...}</code> sözlüğünden (bakiye yoksa 0) nesne üretsin.</li><li><code>__repr__</code>: <code>Hesap(AB-0001, Ayşe, 1500.00)</code> biçiminde; sınıf adı <code>type(self).__name__</code> ile gelsin.</li><li>Modül düzeyinde <code>transfer(kaynak, hedef, tutar)</code>: önce kaynaktan çek, sonra hedefe yatır; çekim başarısızsa hiçbir bakiye değişmesin.</li><li><code>ozet(hesaplar)</code>: <code>{"adet": n, "toplam": toplam bakiye, "en_zengin": sahibin adı}</code> döndürsün (boş listede <code>{"adet": 0, "toplam": 0, "en_zengin": None}</code>).</li></ol>',
 'start': C('''
class Hesap:
    _sayac = 0

    def __init__(self, sahip, bakiye=0.0):
        # TODO
        pass


def transfer(kaynak, hedef, tutar):
    pass


def ozet(hesaplar):
    pass
'''),
 'sol': C('''
class Hesap:
    _sayac = 0

    def __init__(self, sahip, bakiye=0.0):
        Hesap._sayac += 1
        self._no = f"AB-{Hesap._sayac:04d}"
        self.sahip = sahip
        self._bakiye = float(bakiye)

    @property
    def no(self):
        return self._no

    @property
    def bakiye(self):
        return self._bakiye

    def yatir(self, t):
        if t <= 0:
            raise ValueError("Tutar pozitif olmalı")
        self._bakiye += t

    def cek(self, t):
        if t <= 0:
            raise ValueError("Tutar pozitif olmalı")
        if t > self._bakiye:
            raise ValueError("Yetersiz bakiye")
        self._bakiye -= t

    @classmethod
    def sozlukten(cls, d):
        return cls(d["sahip"], d.get("bakiye", 0))

    def __repr__(self):
        return f"{type(self).__name__}({self.no}, {self.sahip}, {self.bakiye:.2f})"


def transfer(kaynak, hedef, tutar):
    kaynak.cek(tutar)
    hedef.yatir(tutar)


def ozet(hesaplar):
    if not hesaplar:
        return {"adet": 0, "toplam": 0, "en_zengin": None}
    zengin = max(hesaplar, key=lambda h: h.bakiye)
    return {"adet": len(hesaplar), "toplam": sum(h.bakiye for h in hesaplar), "en_zengin": zengin.sahip}
'''),
 'tests': C('''
Hesap._sayac = 0
a = Hesap("Ayşe", 1500)
b = Hesap.sozlukten({"sahip": "Burak"})
assert (a.no, b.no) == ("AB-0001", "AB-0002"), f"numaralar sıralı olmalı: {a.no}, {b.no}"
assert repr(a) == "Hesap(AB-0001, Ayşe, 1500.00)", f"repr biçimi yanlış: {a!r}"
try:
    a.bakiye = 0
    assert False, "bakiye salt okunur olmalı"
except AttributeError:
    pass
transfer(a, b, 400)
assert (a.bakiye, b.bakiye) == (1100, 400), "transfer sonrası 1100 / 400 bekleniyordu"
try:
    transfer(b, a, 9999)
    assert False, "yetersiz bakiyede ValueError beklenir"
except ValueError:
    pass
assert (a.bakiye, b.bakiye) == (1100, 400), "başarısız transfer bakiyeleri değiştirmemeli"
assert ozet([a, b]) == {"adet": 2, "toplam": 1500, "en_zengin": "Ayşe"}, f"özet yanlış: {ozet([a, b])}"
assert ozet([]) == {"adet": 0, "toplam": 0, "en_zengin": None}, "boş liste özeti yanlış"
class Vadeli(Hesap):
    pass
v = Vadeli.sozlukten({"sahip": "Can", "bakiye": 50})
assert repr(v).startswith("Vadeli(AB-0003"), f"alt sınıf repr'ında kendi adı görünmeli: {v!r}"
'''),
 'hints': ['Sayaç için Hesap._sayac += 1, no için f"AB-{Hesap._sayac:04d}".', 'transfer\'de sıra önemli: önce cek (hata verirse hiçbir şey değişmez), sonra yatir.', 'ozet: max(hesaplar, key=lambda h: h.bakiye).sahip; boş liste için ayrı dönüş.'],
 'why': 'Salt okunur bakiye, kurallı metotlar ve doğru sıralı transfer birlikte "bakiye yalnız geçerli işlemle değişir" garantisini verir. classmethod ve type(self).__name__ sayesinde Vadeli gibi alt sınıflar ek kod yazmadan doğru davranır.'},
]

lesson = {
 'id': 'kapsulleme-ozellik', 'lv': 'orta', 'mod': 'Nesne Yönelimli Programlama', 'min': 40,
 'title': 'Kapsülleme ve iç gözlem: property, __dict__ ve getattr',
 'sum': 'Örnek ve sınıf değişkenini, paylaşım tuzağını, _korunan ve __gizli adları (name mangling), property ile doğrulamayı, salt okunur alanları ve getattr/setattr/vars ile çalışma anında nesne incelemeyi öğrenirsin.',
 'goals': [
  'Örnek ve sınıf değişkeninin arama sırasını açıklar, paylaşılan liste tuzağından kaçınabilirim.',
  '_korunan ve __gizli adları ayırt eder, name mangling sonucunu (_Sinif__ad) tahmin edebilirim.',
  'property getter/setter/deleter ile doğrulayan ve salt okunur alanlar yazabilirim.',
  'getattr, setattr, hasattr, delattr ve vars ile adı çalışma anında belli olan niteliklerle çalışabilirim.',
  '__name__, __bases__, __class__, type, isinstance ve classmethod alternatif kurucularını yerinde kullanabilirim.'
 ],
 'body': body, 'ex': ex,
 'faq': [
  {'q': 'Python\'da gerçekten private alan yok mu?', 'a': 'Yok. __ad yazımı yalnız adı _Sinif__ad olarak değiştirir; amaç alt sınıflarla ad çakışmasını önlemektir. Erişimi engellemez. Kapsülleme Python\'da bir sözleşmedir: alt çizgiyle başlayan adlar "iç ayrıntı" demektir ve kod incelemesinde bu sözleşme korunur.'},
  {'q': 'Her alana property yazmalı mıyım?', 'a': 'Hayır. Alanı düz nitelik olarak başlat. Doğrulama, hesaplama ya da salt okunurluk gerektiğinde aynı adla property\'ye çevir; çağıran kod değişmez. Gereksiz getter/setter, Java alışkanlığıdır ve Python\'da gürültü sayılır.'},
  {'q': 'vars(nesne) ile nesne.__dict__ arasında fark var mı?', 'a': 'Aynı sözlüğü döndürürler. vars() daha okunurdur ve __dict__ olmayan nesnelerde (ör. __slots__ kullanan sınıflar) anlaşılır bir TypeError verir. Sınıflar için vars(Sinif) salt okunur bir mappingproxy döndürür.'},
  {'q': 'type(n) == Sinif mi, isinstance(n, Sinif) mi?', 'a': 'Neredeyse her zaman isinstance. Alt sınıf nesnelerini de kabul eder ve demet alabilir: isinstance(x, (int, float)). type karşılaştırması yalnız "tam olarak bu sınıf, alt sınıfı değil" demek istediğinde gerekir.'},
  {'q': 'hasattr güvenilir mi?', 'a': 'hasattr içeride getattr çağırır ve yalnız AttributeError\'ı False\'a çevirir. Property getter\'ı başka bir hata (ör. ZeroDivisionError) fırlatırsa hasattr da o hatayı fırlatır. Getter içinde yanlışlıkla oluşan AttributeError ise "nitelik yok" gibi görünür; hata ayıklarken bunu aklında tut.'}
 ],
 'mistakes': [
  {'bad': C('''
class Sepet:
    urunler = []
'''), 'good': C('''
class Sepet:
    def __init__(self):
        self.urunler = []
'''), 'why': 'Sınıf gövdesindeki liste tüm nesnelerce paylaşılır; her nesnenin kendi listesi __init__ içinde oluşturulmalı.'},
  {'bad': C('''
@fiyat.setter
def fiyat(self, d):
    self.fiyat = d
'''), 'good': C('''
@fiyat.setter
def fiyat(self, d):
    self._fiyat = d
'''), 'why': 'Property ile aynı ada atama setter\'ı tekrar çağırır ve RecursionError oluşur; veriyi farklı bir adda sakla.'},
  {'bad': 'self.sayac += 1   # sınıf sayacı', 'good': 'Hesap.sayac += 1', 'why': 'self.sayac += 1 değeri sınıftan okur ama nesneye yazar; sınıf sayacı hiç artmaz, nesnede gölge oluşur.'},
  {'bad': 'h.__bakiye = 0   # sınıf dışında', 'good': 'h.cek(h.bakiye)   # kurallı metotla', 'why': 'Sınıf dışında name mangling olmaz; bu satır gerçek bakiyeyi değiştirmez, __bakiye adında yeni ve yanıltıcı bir nitelik ekler.'},
  {'bad': 'deger = getattr(nesne, alan)', 'good': 'deger = getattr(nesne, alan, None)', 'why': 'Dışarıdan gelen adlarda nitelik yoksa getattr AttributeError fırlatır; varsayılan değer ver ya da önce hasattr ile kontrol et.'}
 ]
}

emit(lesson, '/home/claude/py/v2/o2/kapsulleme-ozellik.js')
