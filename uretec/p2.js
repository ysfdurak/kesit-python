  {
    id: 'siniflar-oop', lv: 'orta', mod: 'Nesne Yönelimli Programlama', min: 35,
    title: 'Sınıflar: veri ve davranışı bir arada tutmak',
    sum: 'class, __init__, self, nitelik ve metotlarla kendi veri tipini tanımlar; __repr__, sınıf niteliği ve property ile Anadolu Bank Hesap sınıfını kurarsın.',
    goals: [
      'class ve __init__ ile nesne oluşturup self\'in ne olduğunu açıklayabilirim.',
      'Örnek niteliği ile sınıf niteliği arasındaki farkı gösterebilirim.',
      '__repr__ ve __str__ yazıp nesnemi okunur biçimde yazdırabilirim.',
      'property ile hesaplanan ve korunan nitelik tanımlayabilirim.',
      'classmethod ve staticmethod\'un ne zaman gerektiğini söyleyebilirim.'
    ],
    body: `
<h2>Neden önemli?</h2>
<p>Anadolu Bank\'ta bir hesabı temsil etmek için şimdiye kadar sözlük kullandın: <code>{"no": "TR01", "sahip": "Ayşe", "bakiye": 1200}</code>. Para çekme fonksiyonunu ayrı yazdın, bakiye kontrolünü başka bir yere koydun; üç ay sonra "bakiye" anahtarını birisi "balance" yazdı ve raporlar sessizce boş geldi. <b>Sınıf</b> (class), veriyi ve o veriye ait davranışı tek bir çatı altında toplar: hesap kendi bakiyesini bilir, kendi para çekme kuralını uygular, kendini okunur biçimde yazdırır. Nesne yönelimli programlama (OOP) büyük projelerin, kütüphanelerin ve iş mantığının yazılma biçimidir; bu derste temeli kuruyoruz.</p>

<h2>class, __init__ ve self</h2>
<p><code>class</code> bir kalıp tanımlar; o kalıptan üretilen her nesneye <b>örnek</b> (instance) denir. <code>__init__</code> örnek oluşturulurken otomatik çalışan kurucu metottur. <code>self</code>, metodun üzerinde çalıştığı örneğin kendisidir; Python onu ilk parametre olarak otomatik geçirir.</p>
<pre class="py">class Hesap:
    def __init__(self, no, sahip, bakiye=0.0):
        self.no = no            # örnek niteliği (instance attribute)
        self.sahip = sahip
        self.bakiye = bakiye

    def yatir(self, tutar):
        self.bakiye += tutar

    def cek(self, tutar):
        if tutar &gt; self.bakiye:
            return False
        self.bakiye -= tutar
        return True

h = Hesap("TR01", "Ayşe Kaya", 1200.0)
h.yatir(300)
print(h.cek(2000))
print(h.cek(500))
print(h.sahip, h.bakiye)

# h.cek(500) aslında Hesap.cek(h, 500) demektir
print(Hesap.cek(h, 100), h.bakiye)</pre>

<div class="note"><b>self bir anahtar kelime değil</b>İlk parametreye istediğin adı verebilirsin ama tüm Python dünyası <code>self</code> der; farklı yazmak kodu okuyan herkesi yavaşlatır.</div>

<h2>__repr__ ve __str__: nesneyi yazdırmak</h2>
<p>Yukarıdaki <code>h</code>\'yi doğrudan yazdırırsan <code>&lt;__main__.Hesap object at 0x...&gt;</code> görürsün; işe yaramaz. <code>__repr__</code> geliştiriciye yönelik, mümkünse nesneyi yeniden oluşturacak biçimde bir dize döndürür; <code>__str__</code> son kullanıcıya yönelik güzel gösterimdir. Yalnızca birini yazacaksan <code>__repr__</code> yaz: <code>__str__</code> tanımlı değilse Python ona düşer.</p>
<pre class="py">class Hesap:
    def __init__(self, no, sahip, bakiye=0.0):
        self.no, self.sahip, self.bakiye = no, sahip, bakiye

    def __repr__(self):
        return f"Hesap(no={self.no!r}, sahip={self.sahip!r}, bakiye={self.bakiye})"

    def __str__(self):
        return f"{self.no} - {self.sahip}: {self.bakiye:,.2f} TL"

h = Hesap("TR01", "Ayşe Kaya", 1200.0)
print(h)              # __str__
print(repr(h))        # __repr__
print([h])            # liste içinde __repr__ kullanılır</pre>

<div class="tip"><b>!r ne yapıyor?</b>f-string içinde <code>{x!r}</code>, <code>repr(x)</code> çağırır: dizeler tırnaklı görünür, böylece "TR01" ile TR01 karışmaz.</div>

<h2>Sınıf niteliği ile örnek niteliği</h2>
<p><code>__init__</code> içinde <code>self.x = ...</code> ile tanımlanan nitelik her örneğe aittir. Sınıf gövdesine doğrudan yazılan nitelik ise <b>tüm örneklerce paylaşılır</b>: sabitler, sayaçlar, varsayılan ayarlar için kullanılır.</p>
<pre class="py">class Hesap:
    faiz_orani = 0.30          # sınıf niteliği: tüm hesaplar için ortak
    adet = 0                   # kaç hesap açıldı

    def __init__(self, no, bakiye=0.0):
        self.no = no           # örnek niteliği
        self.bakiye = bakiye
        Hesap.adet += 1        # sınıf niteliğini güncelle

    def yillik_faiz(self):
        return round(self.bakiye * self.faiz_orani, 2)

a = Hesap("TR01", 1000)
b = Hesap("TR02", 5000)
print(Hesap.adet)
print(a.yillik_faiz(), b.yillik_faiz())

Hesap.faiz_orani = 0.35       # tüm örnekler etkilenir
print(a.yillik_faiz(), b.yillik_faiz())

a.faiz_orani = 0.10           # yalnızca a için örnek niteliği oluşur, sınıfı gölgeler
print(a.yillik_faiz(), b.yillik_faiz())</pre>

<div class="warn"><b>Değiştirilebilir sınıf niteliği tuzağı</b><code>islemler = []</code> satırını sınıf gövdesine yazarsan tüm hesaplar aynı listeyi paylaşır; birine eklenen işlem hepsinde görünür. Liste, sözlük gibi değiştirilebilir nitelikleri <b>her zaman</b> <code>__init__</code> içinde <code>self.islemler = []</code> olarak tanımla.</div>

<h2>property: metodu nitelik gibi okutmak</h2>
<p>Bazen bir değer saklanmaz, hesaplanır (kullanılabilir bakiye = bakiye + kredili mevduat). Bazen de doğrudan atanmasını engellemek, kural koymak istersin. <code>@property</code> bir metodu parantezsiz okunan nitelik yapar; <code>@ad.setter</code> ise atamada çalışacak doğrulamayı ekler.</p>
<pre class="py">class Hesap:
    def __init__(self, no, bakiye=0.0, limit=0.0):
        self.no = no
        self._bakiye = bakiye      # alt çizgi: "dışarıdan doğrudan dokunma"
        self.limit = limit

    @property
    def bakiye(self):
        return self._bakiye

    @bakiye.setter
    def bakiye(self, deger):
        if deger &lt; -self.limit:
            raise ValueError(f"bakiye {-self.limit} altına inemez")
        self._bakiye = deger

    @property
    def kullanilabilir(self):      # salt okunur, hesaplanan nitelik
        return self._bakiye + self.limit

h = Hesap("TR01", 500, limit=1000)
print(h.bakiye, h.kullanilabilir)
h.bakiye = -800                   # setter çalışır, limit içinde
print(h.bakiye, h.kullanilabilir)
try:
    h.bakiye = -2000
except ValueError as e:
    print("Reddedildi:", e)
try:
    h.kullanilabilir = 1
except AttributeError as e:
    print("Salt okunur:", e)</pre>

<div class="tbl-wrap"><table>
<tr><th>Yapı</th><th>Nasıl erişilir</th><th>Ne zaman</th></tr>
<tr><td>Örnek niteliği <code>self.x</code></td><td><code>h.x</code></td><td>Her nesnenin kendi verisi</td></tr>
<tr><td>Sınıf niteliği</td><td><code>Hesap.x</code> ya da <code>h.x</code></td><td>Tüm örneklerde ortak sabit/sayaç</td></tr>
<tr><td>Metot</td><td><code>h.cek(100)</code></td><td>Nesnenin davranışı</td></tr>
<tr><td><code>@property</code></td><td><code>h.kullanilabilir</code></td><td>Hesaplanan ya da korunan değer</td></tr>
<tr><td><code>@classmethod</code></td><td><code>Hesap.csv_den(...)</code></td><td>Alternatif kurucu, sınıf düzeyi iş</td></tr>
<tr><td><code>@staticmethod</code></td><td><code>Hesap.iban_gecerli(...)</code></td><td>Sınıfla ilgili ama ne self ne cls kullanan yardımcı</td></tr>
</table></div>

<h2>classmethod ve staticmethod</h2>
<p><code>@classmethod</code> ilk parametre olarak örneği değil <b>sınıfı</b> (<code>cls</code>) alır; en yaygın kullanımı farklı girdiden nesne üreten <b>alternatif kurucular</b>dır. <code>@staticmethod</code> ne örnek ne sınıf alır; sadece sınıfın ad alanında yaşayan sıradan bir fonksiyondur.</p>
<pre class="py">class Hesap:
    def __init__(self, no, sahip, bakiye=0.0):
        self.no, self.sahip, self.bakiye = no, sahip, bakiye

    def __repr__(self):
        return f"Hesap({self.no!r}, {self.sahip!r}, {self.bakiye})"

    @classmethod
    def csv_den(cls, satir):
        no, sahip, bakiye = satir.split(",")
        return cls(no.strip(), sahip.strip(), float(bakiye))

    @staticmethod
    def no_gecerli(no):
        return no.startswith("TR") and no[2:].isdigit()

print(Hesap.csv_den("TR07, Mehmet Demir, 2500.50"))
print(Hesap.no_gecerli("TR07"), Hesap.no_gecerli("07TR"))

hesaplar = [Hesap.csv_den(s) for s in ["TR01,Ayşe,100", "TR02,Can,250"]]
print(sum(h.bakiye for h in hesaplar))</pre>

<h2>Bir araya getirelim: işlem geçmişli Hesap</h2>
<pre class="py">from datetime import date

class Hesap:
    para_birimi = "TL"

    def __init__(self, no, sahip, bakiye=0.0):
        self.no = no
        self.sahip = sahip
        self._bakiye = bakiye
        self.islemler = []           # her örneğe ait, __init__ içinde

    @property
    def bakiye(self):
        return self._bakiye

    def _kaydet(self, tur, tutar):
        self.islemler.append((date.today().isoformat(), tur, tutar))

    def yatir(self, tutar):
        if tutar &lt;= 0:
            raise ValueError("tutar pozitif olmalı")
        self._bakiye += tutar
        self._kaydet("yatırma", tutar)

    def cek(self, tutar):
        if tutar &gt; self._bakiye:
            raise ValueError("yetersiz bakiye")
        self._bakiye -= tutar
        self._kaydet("çekme", tutar)

    def __repr__(self):
        return f"Hesap({self.no!r}, bakiye={self._bakiye} {self.para_birimi})"

h = Hesap("TR01", "Ayşe Kaya")
h.yatir(1000)
h.cek(250)
try:
    h.cek(5000)
except ValueError as e:
    print("Hata:", e)
print(h)
print(len(h.islemler), "işlem;", [t for _, t, _ in h.islemler])</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Alt çizgi sözleşmesi</h3>
<p>Python\'da gerçek "private" yoktur. <code>_bakiye</code> tek alt çizgi "iç kullanım, dışarıdan dokunma" uyarısıdır; <code>__bakiye</code> çift alt çizgi ise ad karıştırma (name mangling) ile <code>_Hesap__bakiye</code> olur ve alt sınıflarla çakışmayı önler. Günlük kodda tek alt çizgi yeterlidir.</p>
<h3>__eq__ ve __hash__</h3>
<p>İki Hesap nesnesi varsayılan olarak yalnızca aynı nesneyse eşittir. "Aynı hesap numarası = aynı hesap" istiyorsan <code>__eq__</code> yazarsın; o zaman küme ve sözlük anahtarı olarak kullanmak için <code>__hash__</code> da tanımlaman gerekir. Bir sonraki derslerde dataclass bunları senin yerine üretecek.</p>
<h3>__slots__ ile bellek</h3>
<p>Milyonlarca küçük nesne yaratacaksan <code>__slots__ = ("no", "bakiye")</code> satırı her örnekteki <code>__dict__</code> sözlüğünü kaldırıp belleği ciddi azaltır; karşılığında örneğe sonradan yeni nitelik ekleyemezsin. "Bellek ve iç yapı" dersinde ölçeceksin.</p>
<h3>Ne zaman sınıf, ne zaman sözlük?</h3>
<p>Veri sadece taşınıyorsa ve davranışı yoksa sözlük ya da dataclass yeter. Verinin kuralları (bakiye eksiye inemez), davranışı (çek, yatır) ve tutarlılığı (işlem kaydı) varsa sınıf yaz. Fonksiyonlarına hep aynı sözlüğü ilk parametre olarak geçiriyorsan bu bir sınıf olmak istiyor demektir.</p>
</section>
`,
    ex: [
      { t: 'mc', q: '<code>h.cek(500)</code> çağrısında <code>self</code> neyi temsil eder?',
        o: ['Hesap sınıfının kendisini', 'cek metodunu', 'h örneğini', '500 değerini'],
        a: 2, why: 'Python, metodu çağıran örneği (h) otomatik olarak ilk parametre self\'e geçirir; çağrı Hesap.cek(h, 500) ile eşdeğerdir.' },
      { t: 'code', id: 'siniflar-oop-1',
        q: '<p>Anadolu Bank için <code>Hesap</code> sınıfını yaz. <code>Hesap(no, sahip, bakiye=0.0)</code> ile kurulsun; <code>yatir(tutar)</code> bakiyeyi artırsın, <code>cek(tutar)</code> yeterli bakiye varsa düşüp <code>True</code>, yoksa bakiyeyi değiştirmeden <code>False</code> döndürsün. <code>__repr__</code> tam olarak <code>Hesap(\'TR01\', \'Ayşe\', 100.0)</code> biçiminde olsun (bakiye float, dizeler tırnaklı).</p>',
        start: 'class Hesap:\n    def __init__(self, no, sahip, bakiye=0.0):\n        pass\n\n    def yatir(self, tutar):\n        pass\n\n    def cek(self, tutar):\n        pass\n\n    def __repr__(self):\n        pass\n',
        sol: 'class Hesap:\n    def __init__(self, no, sahip, bakiye=0.0):\n        self.no = no\n        self.sahip = sahip\n        self.bakiye = bakiye\n\n    def yatir(self, tutar):\n        self.bakiye += tutar\n\n    def cek(self, tutar):\n        if tutar > self.bakiye:\n            return False\n        self.bakiye -= tutar\n        return True\n\n    def __repr__(self):\n        return f"Hesap({self.no!r}, {self.sahip!r}, {float(self.bakiye)})"\n',
        tests: 'h = Hesap("TR01", "Ayşe", 100.0)\nassert h.no == "TR01" and h.sahip == "Ayşe", "no ve sahip nitelikleri saklanmalı"\nassert h.bakiye == 100.0, "başlangıç bakiyesi"\nh.yatir(50)\nassert h.bakiye == 150.0, "yatir bakiyeyi artırmalı"\nassert h.cek(200) is False and h.bakiye == 150.0, "yetersizse False ve bakiye değişmemeli"\nassert h.cek(100) is True and h.bakiye == 50.0, "yeterliyse True ve düşmeli"\nassert repr(Hesap("TR01", "Ayşe", 100.0)) == "Hesap(\'TR01\', \'Ayşe\', 100.0)", "__repr__ biçimi"\nassert Hesap("TR09", "Can").bakiye == 0.0, "varsayılan bakiye 0.0"\n',
        hints: ['__init__ içinde self.no = no gibi üç atama yap', 'cek: önce tutar > self.bakiye kontrolü, False döndür', '__repr__: f"Hesap({self.no!r}, {self.sahip!r}, {float(self.bakiye)})"'],
        why: 'Veri (no, sahip, bakiye) ve davranış (yatir, cek) tek sınıfta; !r dizeleri tırnaklı yazar.' },
      { t: 'code', id: 'siniflar-oop-2',
        q: '<p><code>Urun</code> sınıfını yaz: <code>Urun(ad, fiyat)</code>. Sınıf niteliği <code>kdv = 0.20</code> olsun. <code>kdvli</code> adında bir <b>property</b> KDV dahil fiyatı (<code>round(fiyat * (1 + kdv), 2)</code>) döndürsün. Ayrıca <code>adet</code> sınıf niteliği kaç Urun oluşturulduğunu saysın (her __init__ bir artırsın).</p>',
        start: 'class Urun:\n    kdv = 0.20\n    adet = 0\n\n    def __init__(self, ad, fiyat):\n        pass\n',
        sol: 'class Urun:\n    kdv = 0.20\n    adet = 0\n\n    def __init__(self, ad, fiyat):\n        self.ad = ad\n        self.fiyat = fiyat\n        Urun.adet += 1\n\n    @property\n    def kdvli(self):\n        return round(self.fiyat * (1 + self.kdv), 2)\n',
        tests: 'Urun.adet = 0\nk = Urun("Klavye", 100.0)\nm = Urun("Mouse", 50.0)\nassert Urun.adet == 2, "iki ürün sonrası adet 2 olmalı"\nassert abs(k.kdvli - 120.0) < 1e-6, "100 -> 120.0"\nassert abs(m.kdvli - 60.0) < 1e-6, "50 -> 60.0"\nUrun.kdv = 0.10\nassert abs(k.kdvli - 110.0) < 1e-6, "sınıf niteliği değişince property yeni oranı kullanmalı"\ntry:\n    k.kdvli = 5\n    assert False, "kdvli salt okunur olmalı (property, setter yok)"\nexcept AttributeError:\n    pass\nUrun.kdv = 0.20\n',
        hints: ['Sayacı Urun.adet += 1 ile sınıf üzerinden artır (self.adet += 1 örnek niteliği yaratır)', '@property ile def kdvli(self): tanımla; self.kdv sınıf niteliğine ulaşır'],
        why: 'Sınıf niteliği tüm örneklerde ortaktır; property hesaplanan değeri parantezsiz okutur ve setter olmadığı için atama AttributeError verir.' },
      { t: 'mc', q: 'Aşağıdaki sınıfta ne sorun vardır?<br><code>class Hesap:<br>&nbsp;&nbsp;&nbsp;&nbsp;islemler = []<br>&nbsp;&nbsp;&nbsp;&nbsp;def ekle(self, x):<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;self.islemler.append(x)</code>',
        o: ['append yerine insert kullanılmalı', 'Tüm örnekler aynı listeyi paylaşır', 'self parametresi eksik', 'Sözdizimi hatası var'],
        a: 1, why: 'Sınıf gövdesindeki liste bir kez oluşturulur ve her örnek aynı nesneyi görür. Değiştirilebilir nitelikler __init__ içinde self.islemler = [] ile tanımlanmalıdır.' },
      { t: 'code', id: 'siniflar-oop-3',
        q: '<p><code>Musteri</code> sınıfına <code>@classmethod</code> ile alternatif kurucu ekle: <code>Musteri.satirdan("Ayşe Kaya;ayse@mail.com;Ankara")</code> noktalı virgülle ayrılmış dizeden nesne üretsin (boşluklar <code>strip</code> ile temizlensin). Ayrıca <code>@staticmethod</code> <code>eposta_gecerli(e)</code> dizede tam bir <code>@</code> ve ondan sonra en az bir <code>.</code> varsa <code>True</code> döndürsün.</p>',
        start: 'class Musteri:\n    def __init__(self, ad, eposta, sehir):\n        self.ad = ad\n        self.eposta = eposta\n        self.sehir = sehir\n\n    # classmethod satirdan ve staticmethod eposta_gecerli ekle\n',
        sol: 'class Musteri:\n    def __init__(self, ad, eposta, sehir):\n        self.ad = ad\n        self.eposta = eposta\n        self.sehir = sehir\n\n    @classmethod\n    def satirdan(cls, satir):\n        ad, eposta, sehir = [p.strip() for p in satir.split(";")]\n        return cls(ad, eposta, sehir)\n\n    @staticmethod\n    def eposta_gecerli(e):\n        if e.count("@") != 1:\n            return False\n        return "." in e.split("@")[1]\n',
        tests: 'm = Musteri.satirdan("Ayşe Kaya ; ayse@mail.com; Ankara")\nassert isinstance(m, Musteri), "satirdan Musteri örneği döndürmeli"\nassert (m.ad, m.eposta, m.sehir) == ("Ayşe Kaya", "ayse@mail.com", "Ankara"), "alanlar strip edilmiş olmalı"\nassert Musteri.eposta_gecerli("ayse@mail.com") is True, "geçerli e-posta"\nassert Musteri.eposta_gecerli("ayse.mail.com") is False, "@ yoksa geçersiz"\nassert Musteri.eposta_gecerli("a@@b.com") is False, "iki @ geçersiz"\nassert Musteri.eposta_gecerli("a@bcom") is False, "@ sonrası nokta yoksa geçersiz"\nassert m.eposta_gecerli("x@y.z") is True, "örnek üzerinden de çağrılabilmeli"\n',
        hints: ['classmethod ilk parametre olarak cls alır; return cls(...) ile nesne üret', 'staticmethod self almaz; e.count("@") == 1 ve "." in e.split("@")[1]'],
        why: 'classmethod alternatif kurucu kalıbıdır; staticmethod sınıfla ilgili ama örnek gerektirmeyen yardımcıdır.' },
      { t: 'code', id: 'siniflar-oop-4',
        q: '<p><code>Sepet</code> sınıfı: <code>ekle(ad, fiyat, adet=1)</code> ile kalem ekler (her nesnenin kendi listesi olsun), <code>toplam</code> property tüm kalemlerin <code>fiyat * adet</code> toplamını döndürür, <code>__len__</code> kalem sayısını verir, <code>__str__</code> <code>"Sepet: N kalem, X.XX TL"</code> biçiminde olsun (toplam iki ondalık).</p>',
        start: 'class Sepet:\n    def __init__(self):\n        pass\n\n    def ekle(self, ad, fiyat, adet=1):\n        pass\n',
        sol: 'class Sepet:\n    def __init__(self):\n        self.kalemler = []\n\n    def ekle(self, ad, fiyat, adet=1):\n        self.kalemler.append((ad, fiyat, adet))\n\n    @property\n    def toplam(self):\n        return sum(f * a for _, f, a in self.kalemler)\n\n    def __len__(self):\n        return len(self.kalemler)\n\n    def __str__(self):\n        return f"Sepet: {len(self)} kalem, {self.toplam:.2f} TL"\n',
        tests: 's = Sepet()\nassert len(s) == 0, "boş sepet 0 kalem"\ns.ekle("Klavye", 850.0)\ns.ekle("Mouse", 320.0, 2)\nassert len(s) == 2, "iki kalem"\nassert abs(s.toplam - 1490.0) < 1e-6, "850 + 2*320 = 1490"\nassert str(s) == "Sepet: 2 kalem, 1490.00 TL", "__str__ biçimi"\ns2 = Sepet()\nassert len(s2) == 0, "yeni sepet diğerinin kalemlerini paylaşmamalı"\n',
        hints: ['Listeyi __init__ içinde self.kalemler = [] olarak kur', '__len__ tanımlanınca len(s) çalışır; __str__ içinde len(self) kullanabilirsin', 'toplam için üreteç ifadesi ile sum'],
        why: 'Özel metotlar (__len__, __str__) nesneni yerleşik fonksiyonlarla uyumlu yapar; property toplamı her seferinde güncel hesaplar.' },
      { t: 'mc', q: 'Hem <code>__repr__</code> hem <code>__str__</code> tanımlanan bir nesne liste içinde yazdırıldığında (<code>print([h])</code>) hangisi kullanılır?',
        o: ['__str__', '__repr__', 'İkisi birden', 'Hiçbiri, bellek adresi görünür'],
        a: 1, why: 'Kapsayıcılar (liste, sözlük) öğeleri repr ile gösterir; __str__ yalnızca doğrudan print(h) ve str(h) çağrılarında kullanılır.' }
    ],
    faq: [
      { q: 'Nitelikleri __init__ dışında da ekleyebilir miyim?', a: 'Teknik olarak evet (<code>h.yeni = 1</code>) ama yapma: sınıfı okuyan kişi tüm nitelikleri __init__\'te görmeli. __slots__ kullanırsan zaten engellenir.' },
      { q: 'property ne zaman gereksizdir?', a: 'Sadece değeri döndüren getter/setter çiftleri Java alışkanlığıdır; Python\'da düz nitelik kullan. property\'yi hesaplama, doğrulama ya da sonradan düz niteliği geriye uyumlu biçimde değiştirmek için ekle.' },
      { q: 'Sınıf adını neden büyük harfle yazıyoruz?', a: 'PEP 8: sınıflar CapWords (Hesap, KrediBasvurusu), fonksiyon ve nitelikler snake_case. Bu sayede okurken sınıf ile fonksiyon ayrımı anında görülür.' }
    ],
    mistakes: [
      { bad: 'class Hesap:\n    def cek(tutar):\n        ...', good: 'class Hesap:\n    def cek(self, tutar):\n        ...', why: 'Metodun ilk parametresi self olmalı; aksi halde h.cek(100) çağrısında "takes 1 positional argument but 2 were given" hatası alırsın.' },
      { bad: 'class Hesap:\n    def __init__(self, no):\n        no = no', good: 'class Hesap:\n    def __init__(self, no):\n        self.no = no', why: 'self. olmadan yapılan atama yerel değişken oluşturur ve metot bitince kaybolur; nitelik asla saklanmaz.' },
      { bad: 'h = Hesap\nh.yatir(100)', good: 'h = Hesap("TR01", "Ayşe")\nh.yatir(100)', why: 'Parantezsiz yazınca sınıfın kendisini atarsın, örnek oluşturmazsın; örnek için sınıfı çağırman gerekir.' }
    ]
  },
  {
    id: 'kalitim-polimorfizm', lv: 'orta', mod: 'Nesne Yönelimli Programlama', min: 35,
    title: 'Kalıtım ve polimorfizm',
    sum: 'Ortak davranışı üst sınıfta toplar, super() ve metot ezmeyle özelleştirir, polimorfizmle farklı nesneleri aynı arayüzden kullanır; kompozisyon ve ABC ile tasarımı sağlamlaştırırsın.',
    goals: [
      'Üst sınıftan kalıtım alıp super() ile kurucuyu genişletebilirim.',
      'Metot ezme (override) ile alt sınıfın davranışını özelleştirebilirim.',
      'Polimorfizmi açıklayıp farklı türdeki nesneleri tek döngüde işleyebilirim.',
      'isinstance ile tür kontrolü yapıp ne zaman kaçınmam gerektiğini söyleyebilirim.',
      'Kompozisyon ile kalıtım arasında seçim yapıp ABC ile soyut sınıf tanımlayabilirim.'
    ],
    body: `
<h2>Neden önemli?</h2>
<p>Anadolu Bank\'ta üç hesap türü var: vadesiz, vadeli ve kredili. Üçü de para yatırma, bakiye gösterme ve işlem kaydı tutma işini aynı yapar; ama para çekme kuralı farklıdır (vadelide vade dolmadan çekilmez, kredilide eksiye inilebilir). Üç ayrı sınıf yazıp ortak kodu kopyalarsan bir hata düzeltmesini üç yerde yapmak zorunda kalırsın. <b>Kalıtım</b> (inheritance) ortak kısmı bir üst sınıfa koyar, alt sınıflar yalnızca farkı yazar. <b>Polimorfizm</b> (polymorphism) ise bu üç türü tek bir döngüde "hesap" olarak işlemeni sağlar: her nesne kendi <code>cek</code> metodunu bilir.</p>

<h2>Üst sınıf ve alt sınıf</h2>
<p><code>class Alt(Ust):</code> yazımı Alt sınıfın Ust\'ün tüm nitelik ve metotlarını miras almasını sağlar. Alt sınıf hiçbir şey eklemese bile çalışır.</p>
<pre class="py">class Hesap:
    def __init__(self, no, sahip, bakiye=0.0):
        self.no, self.sahip, self.bakiye = no, sahip, bakiye

    def yatir(self, tutar):
        self.bakiye += tutar

    def cek(self, tutar):
        if tutar &gt; self.bakiye:
            raise ValueError("yetersiz bakiye")
        self.bakiye -= tutar

    def __repr__(self):
        return f"{type(self).__name__}({self.no!r}, bakiye={self.bakiye})"

class VadesizHesap(Hesap):
    pass                       # her şeyi miras alır

v = VadesizHesap("TR01", "Ayşe", 500)
v.yatir(100)
print(v)
print(isinstance(v, VadesizHesap), isinstance(v, Hesap))
print(VadesizHesap.__mro__)</pre>

<div class="note"><b>type(self).__name__</b>__repr__ içinde sınıf adını sabit yazmak yerine <code>type(self).__name__</code> kullanırsan alt sınıflar kendi adlarıyla görünür. MRO (method resolution order) Python\'ın bir metodu hangi sırayla aradığını gösterir.</div>

<h2>super() ve kurucuyu genişletme</h2>
<p>Alt sınıf <code>__init__</code> yazarsa üst sınıfınki <b>otomatik çağrılmaz</b>. <code>super().__init__(...)</code> ile üst sınıfın kurucusunu çağırıp ardından kendi niteliklerini eklersin.</p>
<pre class="py">class Hesap:
    def __init__(self, no, sahip, bakiye=0.0):
        self.no, self.sahip, self.bakiye = no, sahip, bakiye

    def cek(self, tutar):
        if tutar &gt; self.bakiye:
            raise ValueError("yetersiz bakiye")
        self.bakiye -= tutar

    def __repr__(self):
        return f"{type(self).__name__}({self.no!r}, bakiye={self.bakiye})"

class Kredili(Hesap):
    def __init__(self, no, sahip, bakiye=0.0, limit=1000.0):
        super().__init__(no, sahip, bakiye)    # ortak kısım üst sınıfta
        self.limit = limit                      # ek nitelik

    def cek(self, tutar):                       # metot ezme (override)
        if tutar &gt; self.bakiye + self.limit:
            raise ValueError("limit aşıldı")
        self.bakiye -= tutar

k = Kredili("TR02", "Mehmet", 200, limit=500)
k.cek(600)
print(k)
try:
    k.cek(200)
except ValueError as e:
    print("Hata:", e)</pre>

<h3>Ezerken üst sınıfı da çağırmak</h3>
<p>Bazen davranışı tamamen değiştirmek değil, <b>önüne bir kural eklemek</b> istersin. Kuralı kontrol edip gerisini <code>super()</code> ile üst sınıfa bırakmak kod tekrarını önler.</p>
<pre class="py">from datetime import date

class Hesap:
    def __init__(self, no, bakiye=0.0):
        self.no, self.bakiye = no, bakiye
        self.islemler = []

    def cek(self, tutar):
        if tutar &gt; self.bakiye:
            raise ValueError("yetersiz bakiye")
        self.bakiye -= tutar
        self.islemler.append(("çekme", tutar))

class Vadeli(Hesap):
    def __init__(self, no, bakiye, vade_bitis):
        super().__init__(no, bakiye)
        self.vade_bitis = vade_bitis

    def cek(self, tutar):
        if date.today() &lt; self.vade_bitis:
            raise ValueError("vade dolmadan çekilemez")
        super().cek(tutar)            # kural geçtiyse normal çekme

v = Vadeli("TR03", 10000, date(2099, 1, 1))
try:
    v.cek(100)
except ValueError as e:
    print("Hata:", e)

v2 = Vadeli("TR04", 10000, date(2000, 1, 1))
v2.cek(100)
print(v2.bakiye, v2.islemler)</pre>

<h2>Polimorfizm: aynı çağrı, farklı davranış</h2>
<p>Üç farklı hesap türünü tek listede tutup hepsine <code>cek</code> dersin; her nesne kendi sınıfının metodunu çalıştırır. Çağıran kod türleri bilmek zorunda değildir. Yeni bir hesap türü eklediğinde bu döngü değişmez; buna <b>açık-kapalı ilkesi</b> denir: genişlemeye açık, değişikliğe kapalı.</p>
<pre class="py">class Hesap:
    def __init__(self, no, bakiye):
        self.no, self.bakiye = no, bakiye
    def aylik_masraf(self):
        return 0.0
    def __repr__(self):
        return f"{type(self).__name__}({self.no})"

class Vadesiz(Hesap):
    def aylik_masraf(self):
        return 15.0

class Kredili(Hesap):
    def aylik_masraf(self):
        return 25.0 if self.bakiye &lt; 0 else 0.0

class Vadeli(Hesap):
    pass        # masraf yok, üst sınıftan 0.0 gelir

hesaplar = [Vadesiz("TR01", 500), Kredili("TR02", -300), Vadeli("TR03", 10000), Kredili("TR04", 50)]
for h in hesaplar:
    print(h, h.aylik_masraf())
print("Toplam masraf:", sum(h.aylik_masraf() for h in hesaplar))</pre>

<div class="tip"><b>Ördek tipleme (duck typing)</b>Python\'da polimorfizm için kalıtım şart değildir: <code>aylik_masraf()</code> metodu olan herhangi bir nesne bu döngüye girebilir. "Ördek gibi yürüyüp ördek gibi ses çıkarıyorsa ördektir." Kalıtım ortak kodu paylaşmak için, ördek tipleme esneklik için kullanılır.</div>

<h2>isinstance: ne zaman, ne zaman değil</h2>
<p><code>isinstance(nesne, Sinif)</code> alt sınıfları da kapsar; <code>type(nesne) is Sinif</code> kapsamaz, bu yüzden neredeyse hep isinstance tercih edilir. Ama kodunun içinde <code>if isinstance(h, Vadeli): ... elif isinstance(h, Kredili): ...</code> zinciri görüyorsan bu bir koku: o dallanma aslında her sınıfın kendi metodunda olmalı (polimorfizm).</p>
<pre class="py">class Hesap: pass
class Vadeli(Hesap): pass

v = Vadeli()
print(isinstance(v, Hesap), type(v) is Hesap)
print(isinstance(v, (Vadeli, int)))        # demet: herhangi biri
print(issubclass(Vadeli, Hesap), issubclass(Hesap, Vadeli))

# Meşru kullanım: dış girdiyi doğrulama
def tutar_dogrula(x):
    if not isinstance(x, (int, float)) or isinstance(x, bool):
        raise TypeError(f"sayı bekleniyordu: {x!r}")
    return float(x)

print(tutar_dogrula(42))
try:
    tutar_dogrula("42")
except TypeError as e:
    print(e)</pre>

<h2>Kompozisyon mu kalıtım mı?</h2>
<p>Kalıtım "<b>-dır</b>" ilişkisidir: Vadeli hesap bir Hesap<b>tır</b>. Kompozisyon "<b>-ı var</b>" ilişkisidir: Müşterinin hesapları <b>vardır</b>; Müşteri Hesap\'tan türemez, hesapları nitelik olarak tutar. Kalıtımı yalnızca gerçek -dır ilişkisinde ve ortak kod paylaşımı için kullan; "birkaç metodunu kullanmak istiyorum" diye kalıtım alma.</p>
<pre class="py">class Hesap:
    def __init__(self, no, bakiye):
        self.no, self.bakiye = no, bakiye

class Bildirim:
    def gonder(self, kime, mesaj):
        print(f"[SMS {kime}] {mesaj}")

class Musteri:
    def __init__(self, ad, telefon, bildirim):
        self.ad = ad
        self.telefon = telefon
        self.hesaplar = []            # kompozisyon: hesapları var
        self.bildirim = bildirim      # kompozisyon: bildirim kanalı var

    def hesap_ac(self, no, bakiye=0.0):
        h = Hesap(no, bakiye)
        self.hesaplar.append(h)
        self.bildirim.gonder(self.telefon, f"{no} hesabınız açıldı")
        return h

    @property
    def toplam_varlik(self):
        return sum(h.bakiye for h in self.hesaplar)

m = Musteri("Ayşe Kaya", "05xx", Bildirim())
m.hesap_ac("TR01", 1500)
m.hesap_ac("TR02", 250)
print(m.toplam_varlik)</pre>

<div class="tbl-wrap"><table>
<tr><th>Soru</th><th>Kalıtım</th><th>Kompozisyon</th></tr>
<tr><td>İlişki</td><td>Alt, Üst\'ün bir türüdür (-dır)</td><td>Nesne başka nesneyi içerir (-ı var)</td></tr>
<tr><td>Bağlılık</td><td>Sıkı: üst sınıf değişince alt etkilenir</td><td>Gevşek: parça değiştirilebilir</td></tr>
<tr><td>Test</td><td>Üst sınıfla birlikte test edilir</td><td>Parça sahte (mock) ile değiştirilir</td></tr>
<tr><td>Örnek</td><td>Vadeli(Hesap)</td><td>Musteri.hesaplar, Musteri.bildirim</td></tr>
<tr><td>Varsayılan tercih</td><td>Ortak kod + gerçek -dır ilişkisi</td><td>Diğer her durum</td></tr>
</table></div>

<h2>ABC: soyut sınıfa giriş</h2>
<p>Bazen üst sınıfın tek amacı "alt sınıfların şu metotları tanımlaması <b>zorunludur</b>" demektir. <code>abc</code> modülünden <code>ABC</code> ve <code>@abstractmethod</code> bunu zorlar: soyut metodu tanımlamayan alt sınıf örneklenemez.</p>
<pre class="py">from abc import ABC, abstractmethod

class OdemeYontemi(ABC):
    @abstractmethod
    def ode(self, tutar):
        """Ödemeyi yapar, işlem referansı döndürür."""

    def makbuz(self, tutar):            # somut metot, miras alınır
        return f"{type(self).__name__}: {tutar:.2f} TL -&gt; {self.ode(tutar)}"

class KrediKarti(OdemeYontemi):
    def ode(self, tutar):
        return "KK-" + str(int(tutar * 100))

class Havale(OdemeYontemi):
    pass                               # ode tanımlanmadı

print(KrediKarti().makbuz(149.9))
try:
    Havale()
except TypeError as e:
    print("Hata:", e)</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Çoklu kalıtım ve mixin</h3>
<p>Python birden çok üst sınıfa izin verir: <code>class Rapor(JsonMixin, CsvMixin, Temel)</code>. Mixin, tek bir yetenek (JSON\'a çevirme gibi) ekleyen, kendi başına örneklenmeyen küçük sınıftır. MRO soldan sağa, derinlemesine ama tutarlı bir sırayla arar (C3 doğrusallaştırma). Çoklu kalıtımda <code>super()</code> "üst sınıf" değil "MRO\'daki sonraki" demektir; bu yüzden mixin\'lerde <code>super().__init__(**kwargs)</code> zincirini bozmamak gerekir.</p>
<h3>Liskov yerine koyma ilkesi</h3>
<p>Alt sınıf, üst sınıfın kullanıldığı her yerde sorunsuz kullanılabilmelidir. Vadeli hesabın <code>cek</code> metodu hata yükseltiyorsa bu, Hesap\'ın da hata yükseltebildiği bir sözleşmeyle tutarlıdır. Ama alt sınıfta <code>cek</code>\'in imzasını değiştirmek ya da üst sınıfın garanti ettiği bir davranışı bozmak kalıtımın yanlış kullanıldığını gösterir; o zaman kompozisyona dön.</p>
<h3>Kalıtım derinliği</h3>
<p>İki-üç seviye derin hiyerarşiler okunabilir sınırdır. Beş seviye derin bir "Hesap → Mevduat → Vadeli → DövizVadeli → AltınVadeli" zinciri, bir metodun nerede ezildiğini bulmayı işkenceye çevirir. Derinleşiyorsa stratejiyi (vade kuralı, masraf kuralı) ayrı küçük nesnelere taşı ve kompozisyonla birleştir; "Tasarım kalıpları" dersinde bunun adı Strategy olacak.</p>
</section>
`,
    ex: [
      { t: 'mc', q: 'Alt sınıfta <code>__init__</code> tanımlanırsa üst sınıfın <code>__init__</code> metodu ne olur?',
        o: ['Otomatik olarak önce çalışır', 'Otomatik olarak sonra çalışır', 'Çağrılmaz; super().__init__ ile açıkça çağrılmalıdır', 'SyntaxError oluşur'],
        a: 2, why: 'Python üst sınıf kurucusunu örtük çağırmaz; alt sınıf kurucu yazıyorsa ortak nitelikler için super().__init__(...) çağırmak alt sınıfın sorumluluğudur.' },
      { t: 'code', id: 'kalitim-polimorfizm-1',
        q: '<p>Verilen <code>Hesap</code> sınıfından türeyen <code>Kredili</code> sınıfını yaz: <code>Kredili(no, bakiye=0.0, limit=1000.0)</code>; kurucu ortak alanlar için <code>super().__init__</code> kullansın ve <code>limit</code> niteliğini eklesin. <code>cek(tutar)</code> metodunu ez: <code>tutar &gt; bakiye + limit</code> ise <code>ValueError</code> yükseltsin, değilse bakiyeden düşsün (eksiye inebilir).</p>',
        start: 'class Hesap:\n    def __init__(self, no, bakiye=0.0):\n        self.no = no\n        self.bakiye = bakiye\n\n    def cek(self, tutar):\n        if tutar > self.bakiye:\n            raise ValueError("yetersiz bakiye")\n        self.bakiye -= tutar\n\n\nclass Kredili(Hesap):\n    pass\n',
        sol: 'class Hesap:\n    def __init__(self, no, bakiye=0.0):\n        self.no = no\n        self.bakiye = bakiye\n\n    def cek(self, tutar):\n        if tutar > self.bakiye:\n            raise ValueError("yetersiz bakiye")\n        self.bakiye -= tutar\n\n\nclass Kredili(Hesap):\n    def __init__(self, no, bakiye=0.0, limit=1000.0):\n        super().__init__(no, bakiye)\n        self.limit = limit\n\n    def cek(self, tutar):\n        if tutar > self.bakiye + self.limit:\n            raise ValueError("limit aşıldı")\n        self.bakiye -= tutar\n',
        tests: 'k = Kredili("TR02", 200, limit=500)\nassert isinstance(k, Hesap), "Kredili, Hesap\'tan türemeli"\nassert k.no == "TR02" and k.bakiye == 200 and k.limit == 500, "nitelikler kurulmalı"\nk.cek(600)\nassert k.bakiye == -400, "limit içinde eksiye inebilmeli"\ntry:\n    k.cek(200)\n    assert False, "limit aşılınca ValueError"\nexcept ValueError:\n    pass\nassert k.bakiye == -400, "hata durumunda bakiye değişmemeli"\nassert Kredili("TR09").limit == 1000.0, "varsayılan limit 1000.0"\n',
        hints: ['class Kredili(Hesap): ve __init__ içinde super().__init__(no, bakiye)', 'cek metodunu aynı adla yeniden tanımla; koşulda self.bakiye + self.limit'],
        why: 'super() ortak kurulumu üst sınıfa bırakır; aynı adlı metot alt sınıfta tanımlanınca üst sınıfınkini ezer.' },
      { t: 'code', id: 'kalitim-polimorfizm-2',
        q: '<p>Polimorfizm: <code>Calisan</code> üst sınıfı <code>ad</code> ve <code>maas</code> tutar, <code>prim()</code> 0 döndürür. <code>Satisci(Calisan)</code> ek olarak <code>satis</code> alır ve <code>prim()</code> satışın %5\'ini döndürür. <code>Mudur(Calisan)</code> <code>prim()</code> maaşın %20\'sini döndürür. <code>toplam_prim(calisanlar)</code> fonksiyonu listedeki herkesin primini toplasın (tür kontrolü yapmadan).</p>',
        start: 'class Calisan:\n    def __init__(self, ad, maas):\n        self.ad = ad\n        self.maas = maas\n\n    def prim(self):\n        return 0\n\n\nclass Satisci(Calisan):\n    pass\n\n\nclass Mudur(Calisan):\n    pass\n\n\ndef toplam_prim(calisanlar):\n    pass\n',
        sol: 'class Calisan:\n    def __init__(self, ad, maas):\n        self.ad = ad\n        self.maas = maas\n\n    def prim(self):\n        return 0\n\n\nclass Satisci(Calisan):\n    def __init__(self, ad, maas, satis):\n        super().__init__(ad, maas)\n        self.satis = satis\n\n    def prim(self):\n        return self.satis * 0.05\n\n\nclass Mudur(Calisan):\n    def prim(self):\n        return self.maas * 0.20\n\n\ndef toplam_prim(calisanlar):\n    return sum(c.prim() for c in calisanlar)\n',
        tests: 'ekip = [Calisan("Ali", 30000), Satisci("Ayşe", 25000, 200000), Mudur("Can", 60000)]\nassert ekip[0].prim() == 0, "düz çalışan prim almaz"\nassert abs(ekip[1].prim() - 10000) < 1e-6, "satışın yüzde 5\'i: 10000"\nassert abs(ekip[2].prim() - 12000) < 1e-6, "maaşın yüzde 20\'si: 12000"\nassert abs(toplam_prim(ekip) - 22000) < 1e-6, "toplam 22000"\nassert toplam_prim([]) == 0, "boş liste 0"\nassert isinstance(ekip[1], Calisan) and ekip[1].satis == 200000, "Satisci satis niteliğini tutmalı"\n',
        hints: ['Satisci kurucusu üç parametre alır; super().__init__(ad, maas) sonra self.satis', 'toplam_prim: sum(c.prim() for c in calisanlar); isinstance kullanma'],
        why: 'Her sınıf prim kuralını kendi içinde taşır; toplam_prim türleri bilmeden aynı metodu çağırır. Yeni çalışan türü eklemek fonksiyonu değiştirmez.' },
      { t: 'mc', q: '"Müşterinin hesapları vardır" ilişkisi için doğru tasarım hangisidir?',
        o: ['class Musteri(Hesap)', 'class Hesap(Musteri)', 'Musteri sınıfında self.hesaplar listesi (kompozisyon)', 'class Musteri(Hesap, list)'],
        a: 2, why: '"-ı var" ilişkisi kompozisyondur: Musteri, Hesap nesnelerini nitelik olarak tutar. Kalıtım yalnızca "-dır" ilişkisinde (Vadeli bir Hesap\'tır) kullanılır.' },
      { t: 'code', id: 'kalitim-polimorfizm-3',
        q: '<p><code>abc</code> ile soyut sınıf yaz: <code>Bildirim(ABC)</code> içinde soyut <code>gonder(self, mesaj)</code> metodu olsun. <code>Sms(Bildirim)</code> <code>gonder</code> çağrılınca <code>"SMS: " + mesaj</code>, <code>Eposta(Bildirim)</code> ise <code>"E-posta: " + mesaj</code> döndürsün. Bildirim doğrudan örneklenememeli.</p>',
        start: 'from abc import ABC, abstractmethod\n\nclass Bildirim(ABC):\n    pass\n\nclass Sms(Bildirim):\n    pass\n\nclass Eposta(Bildirim):\n    pass\n',
        sol: 'from abc import ABC, abstractmethod\n\nclass Bildirim(ABC):\n    @abstractmethod\n    def gonder(self, mesaj):\n        pass\n\nclass Sms(Bildirim):\n    def gonder(self, mesaj):\n        return "SMS: " + mesaj\n\nclass Eposta(Bildirim):\n    def gonder(self, mesaj):\n        return "E-posta: " + mesaj\n',
        tests: 'assert Sms().gonder("merhaba") == "SMS: merhaba", "Sms çıktısı"\nassert Eposta().gonder("merhaba") == "E-posta: merhaba", "Eposta çıktısı"\nassert issubclass(Sms, Bildirim) and issubclass(Eposta, Bildirim), "ikisi de Bildirim alt sınıfı"\ntry:\n    Bildirim()\n    assert False, "soyut sınıf örneklenememeli"\nexcept TypeError:\n    pass\nkanallar = [Sms(), Eposta()]\nassert [k.gonder("x") for k in kanallar] == ["SMS: x", "E-posta: x"], "polimorfik çağrı"\n',
        hints: ['class Bildirim(ABC): içinde @abstractmethod def gonder(self, mesaj): ...', 'Alt sınıflarda gonder metodunu tanımla, aksi halde onlar da örneklenemez'],
        why: 'ABC + abstractmethod sözleşmeyi zorlar: soyut metodu tanımlamayan sınıf TypeError ile örneklenemez.' },
      { t: 'code', id: 'kalitim-polimorfizm-4',
        q: '<p>Verilen <code>Hesap.cek</code> işlem kaydı tutuyor. <code>Vadeli(Hesap)</code> sınıfını yaz: <code>Vadeli(no, bakiye, kilitli)</code>; <code>kilitli</code> True iken <code>cek</code> <code>ValueError("vade dolmadı")</code> yükseltsin, False iken <b>üst sınıfın</b> <code>cek</code> metodunu <code>super()</code> ile çağırsın ki işlem kaydı korunsun.</p>',
        start: 'class Hesap:\n    def __init__(self, no, bakiye=0.0):\n        self.no = no\n        self.bakiye = bakiye\n        self.islemler = []\n\n    def cek(self, tutar):\n        if tutar > self.bakiye:\n            raise ValueError("yetersiz bakiye")\n        self.bakiye -= tutar\n        self.islemler.append(("çekme", tutar))\n\n\nclass Vadeli(Hesap):\n    pass\n',
        sol: 'class Hesap:\n    def __init__(self, no, bakiye=0.0):\n        self.no = no\n        self.bakiye = bakiye\n        self.islemler = []\n\n    def cek(self, tutar):\n        if tutar > self.bakiye:\n            raise ValueError("yetersiz bakiye")\n        self.bakiye -= tutar\n        self.islemler.append(("çekme", tutar))\n\n\nclass Vadeli(Hesap):\n    def __init__(self, no, bakiye, kilitli):\n        super().__init__(no, bakiye)\n        self.kilitli = kilitli\n\n    def cek(self, tutar):\n        if self.kilitli:\n            raise ValueError("vade dolmadı")\n        super().cek(tutar)\n',
        tests: 'v = Vadeli("TR03", 1000, True)\ntry:\n    v.cek(100)\n    assert False, "kilitliyken ValueError"\nexcept ValueError:\n    pass\nassert v.bakiye == 1000 and v.islemler == [], "kilitliyken bakiye ve kayıt değişmemeli"\nv.kilitli = False\nv.cek(100)\nassert v.bakiye == 900, "kilit açılınca çekilmeli"\nassert v.islemler == [("çekme", 100)], "üst sınıfın kaydı korunmalı (super().cek)"\ntry:\n    v.cek(5000)\n    assert False, "üst sınıf yetersiz bakiye kuralı çalışmalı"\nexcept ValueError:\n    pass\n',
        hints: ['__init__ içinde super().__init__(no, bakiye) sonra self.kilitli = kilitli', 'cek içinde kilit kontrolünden sonra super().cek(tutar) çağır'],
        why: 'Alt sınıf yalnızca ek kuralı yazar, gerisini super() ile üst sınıfa bırakır; kayıt tutma mantığı tek yerde kalır.' },
      { t: 'mc', q: 'Kodda <code>if isinstance(h, Vadeli): ... elif isinstance(h, Kredili): ...</code> zinciri görmek genellikle neye işaret eder?',
        o: ['Kodun doğru yazıldığına', 'O dallanmanın her sınıfın kendi metodunda olması gerektiğine', 'ABC kullanılması gerektiğine', 'Kompozisyonun yanlış olduğuna'],
        a: 1, why: 'Tür bazlı dallanma, polimorfizmin yapması gereken işi elle yapmaktır; davranışı ilgili sınıfların metoduna taşıyınca yeni tür eklemek zinciri değiştirmeyi gerektirmez.' }
    ],
    faq: [
      { q: 'super() içine neden argüman yazmıyoruz?', a: 'Python 3\'te super() sınıfı ve örneği otomatik bulur; super(Alt, self) yazımı eski Python 2 biçimidir ve çalışır ama gereksizdir.' },
      { q: 'Üst sınıfın metodunu ezmeden ona ek davranış ekleyebilir miyim?', a: 'Evet: alt sınıfta aynı adla metot yaz, ek işi yap, sonra super().metot(...) çağır. Önce mi sonra mı çağıracağın istediğin sıraya bağlı.' },
      { q: 'ABC yerine Protocol ne zaman?', a: 'ABC kalıtım gerektirir ve çalışma zamanında zorlar; Protocol (typing) kalıtım gerektirmez, tip denetleyici "bu metotlara sahip olan" her nesneyi kabul eder. Dataclass ve typing dersinde göreceksin.' }
    ],
    mistakes: [
      { bad: 'class Kredili(Hesap):\n    def __init__(self, no, limit):\n        self.limit = limit', good: 'class Kredili(Hesap):\n    def __init__(self, no, limit):\n        super().__init__(no)\n        self.limit = limit', why: 'Üst kurucu çağrılmayınca no ve bakiye nitelikleri hiç oluşmaz; ilk cek çağrısında AttributeError alırsın.' },
      { bad: 'def toplam(hesaplar):\n    t = 0\n    for h in hesaplar:\n        if isinstance(h, Vadesiz):\n            t += 15\n        elif isinstance(h, Kredili):\n            t += 25\n    return t', good: 'def toplam(hesaplar):\n    return sum(h.aylik_masraf() for h in hesaplar)', why: 'Tür zinciri her yeni sınıfta bu fonksiyonu değiştirmeyi gerektirir; masrafı her sınıf kendi metodunda bilsin.' },
      { bad: 'class Musteri(list):\n    ...', good: 'class Musteri:\n    def __init__(self):\n        self.hesaplar = []', why: 'Müşteri bir liste değildir; listeyi kullanmak için ondan kalıtım almak yerine onu nitelik olarak tut (kompozisyon).' }
    ]
  },
  {
    id: 'dataclass-typing', lv: 'orta', mod: 'Nesne Yönelimli Programlama', min: 35,
    title: 'dataclass ve tip ipuçları',
    sum: 'dataclass ile boilerplate\'siz veri sınıfı tanımlar; tip ipuçları, Optional, TypedDict ve Protocol ile kodu kendini belgeleyen ve mypy ile denetlenebilir hale getirirsin.',
    goals: [
      '@dataclass ile __init__/__repr__/__eq__ üreten veri sınıfı yazabilirim.',
      'field(default_factory), frozen ve order seçeneklerini doğru yerde kullanabilirim.',
      'list[int], dict[str, float], X | None gibi tip ipuçlarını fonksiyon ve sınıflara ekleyebilirim.',
      'TypedDict ve Protocol\'ün ne işe yaradığını açıklayabilirim.',
      'mypy\'nin tip ipuçlarını nasıl denetlediğini ve çalışma zamanını etkilemediğini söyleyebilirim.'
    ],
    body: `
<h2>Neden önemli?</h2>
<p>Önceki derste Hesap sınıfı için <code>__init__</code>, <code>__repr__</code> yazdın; iki hesabı karşılaştırmak için <code>__eq__</code> de gerekti. Anadolu Market\'in sipariş, müşteri, ürün, kargo gibi onlarca veri tipi için bunu tekrarlamak hem sıkıcı hem hataya açıktır. <b>dataclass</b> bu metotları tip ipuçlarına bakarak otomatik üretir. <b>Tip ipuçları</b> (type hints) ise kodun "bu fonksiyon ne alır, ne döner" sorusunu okuyana ve araçlara söyler: editör otomatik tamamlar, <code>mypy</code> hataları çalıştırmadan yakalar, ekip arkadaşın fonksiyonu açmadan kullanır. Kurumsal Python kodunun bugünkü standardı budur.</p>

<h2>dataclass temelleri</h2>
<pre class="py">from dataclasses import dataclass

@dataclass
class Urun:
    kod: str
    ad: str
    fiyat: float
    stok: int = 0          # varsayılanlı alanlar sona

k = Urun("K-100", "Klavye", 850.0, 12)
m = Urun("M-200", "Mouse", fiyat=320.0)
print(k)                                   # __repr__ hazır
print(m.stok)
print(k == Urun("K-100", "Klavye", 850.0, 12))   # __eq__ alan bazlı
k.stok -= 1
print(k.stok)</pre>

<p>Dataclass sıradan bir sınıftır: metot, property, classmethod ekleyebilirsin. Kurucudan sonra çalışması gereken doğrulama için <code>__post_init__</code> vardır.</p>
<pre class="py">from dataclasses import dataclass

@dataclass
class Urun:
    kod: str
    ad: str
    fiyat: float
    stok: int = 0

    def __post_init__(self):
        if self.fiyat &lt; 0:
            raise ValueError("fiyat negatif olamaz")
        self.kod = self.kod.upper()

    @property
    def kdvli(self) -&gt; float:
        return round(self.fiyat * 1.2, 2)

    def satis(self, adet: int) -&gt; float:
        if adet &gt; self.stok:
            raise ValueError("stok yetersiz")
        self.stok -= adet
        return round(self.kdvli * adet, 2)

u = Urun("k-100", "Klavye", 850.0, 5)
print(u.kod, u.kdvli)
print(u.satis(2), "TL;", u.stok, "kaldı")
try:
    Urun("x", "Bozuk", -1)
except ValueError as e:
    print("Hata:", e)</pre>

<h2>field, frozen, order, asdict</h2>
<p>Değiştirilebilir varsayılan (liste, sözlük) doğrudan yazılamaz; sınıf niteliği tuzağını hatırla. Bunun için <code>field(default_factory=list)</code> kullanılır. <code>frozen=True</code> nesneyi değiştirilemez (ve hashlenebilir) yapar; <code>order=True</code> karşılaştırma metotlarını alan sırasına göre üretir; <code>asdict</code> nesneyi iç içe sözlüğe çevirir (JSON\'a hazırlamak için).</p>
<pre class="py">from dataclasses import dataclass, field, asdict

@dataclass(frozen=True, order=True)
class Para:
    tutar: float
    birim: str = "TL"

@dataclass
class Siparis:
    no: int
    musteri: str
    kalemler: list[str] = field(default_factory=list)   # her örneğe yeni liste
    toplam: Para = Para(0.0)
    notlar: dict[str, str] = field(default_factory=dict, repr=False)

s1 = Siparis(1001, "Ayşe")
s2 = Siparis(1002, "Can")
s1.kalemler.append("K-100")
print(s1.kalemler, s2.kalemler)       # paylaşılmıyor

p = Para(100.0)
try:
    p.tutar = 5
except Exception as e:
    print(type(e).__name__)
print(sorted([Para(30), Para(5), Para(12)]))      # order=True
print({Para(1), Para(1)})                          # frozen -&gt; hashlenebilir

print(asdict(s1))</pre>

<div class="warn"><b>field(default=[]) de olmaz</b>dataclass liste/sözlük/küme varsayılanı görünce <code>ValueError</code> ile seni durdurur. Doğru yol her zaman <code>default_factory</code>: çağrılabilir bir şey ver, her örnek için yeniden çağrılsın.</div>

<div class="tbl-wrap"><table>
<tr><th>Seçenek</th><th>Nerede</th><th>Ne yapar</th></tr>
<tr><td><code>default=</code></td><td>field</td><td>Sabit varsayılan (değişmez değerler için)</td></tr>
<tr><td><code>default_factory=</code></td><td>field</td><td>Her örnek için yeni nesne üretir (list, dict, set)</td></tr>
<tr><td><code>repr=False</code></td><td>field</td><td>Alanı __repr__ dışında bırakır (uzun ya da gizli veri)</td></tr>
<tr><td><code>compare=False</code></td><td>field</td><td>Alanı __eq__ ve sıralamadan çıkarır</td></tr>
<tr><td><code>frozen=True</code></td><td>dataclass</td><td>Değiştirilemez, hashlenebilir (küme/sözlük anahtarı)</td></tr>
<tr><td><code>order=True</code></td><td>dataclass</td><td>&lt;, &gt; vb. alan sırasına göre</td></tr>
<tr><td><code>slots=True</code></td><td>dataclass (3.10+)</td><td>__slots__ üretir, bellek azalır</td></tr>
<tr><td><code>kw_only=True</code></td><td>dataclass (3.10+)</td><td>Tüm alanlar anahtar kelimeyle verilir</td></tr>
</table></div>

<h2>Tip ipuçları: sözdizimi</h2>
<p>Parametreye <code>ad: tip</code>, dönüşe <code>-&gt; tip</code> yazılır. Python 3.9+ ile yerleşik koleksiyonlar doğrudan genel tip olur (<code>list[int]</code>, <code>dict[str, float]</code>); 3.10+ ile <code>X | None</code>, eski <code>Optional[X]</code>\'in yerini alır. Tip ipuçları <b>çalışma zamanında zorlanmaz</b>: yanlış tip verirsen Python ses çıkarmaz; denetim editörün ve mypy\'nin işidir.</p>
<pre class="py">def ortalama(tutarlar: list[float]) -&gt; float:
    return sum(tutarlar) / len(tutarlar) if tutarlar else 0.0

def musteri_bul(musteriler: dict[str, str], no: str) -&gt; str | None:
    return musteriler.get(no)          # yoksa None: imza bunu açıkça söylüyor

def etiketle(no: int, kalemler: list[str], oncelik: bool = False) -&gt; tuple[int, str]:
    etiket = ("ACİL " if oncelik else "") + ", ".join(kalemler)
    return no, etiket

print(ortalama([450.0, 120.0, 980.0]))
print(musteri_bul({"M1": "Ayşe"}, "M1"), musteri_bul({"M1": "Ayşe"}, "M9"))
print(etiketle(1001, ["K-100", "M-200"], oncelik=True))

# Çalışma zamanında zorlanmaz:
print(ortalama.__annotations__)
print(etiketle("hatalı", []))      # mypy bunu yakalar, Python çalıştırır</pre>

<div class="tip"><b>None dönebilen fonksiyonlar</b><code>-&gt; str | None</code> yazdığında çağıran taraf None kontrolü yapmak zorunda kalır (mypy uyarır). Bu, "boş sonuç" hatalarının yarısını kodu çalıştırmadan yakalar.</div>

<h3>Takma ad, Literal ve Callable</h3>
<pre class="py">from typing import Literal, Callable

HesapNo = str                                 # tip takma adı: okunurluk
Durum = Literal["bekliyor", "onaylandi", "reddedildi"]

def durum_guncelle(no: HesapNo, durum: Durum) -&gt; str:
    return f"{no}: {durum}"

def uygula(tutarlar: list[float], f: Callable[[float], float]) -&gt; list[float]:
    return [f(t) for t in tutarlar]

print(durum_guncelle("TR01", "onaylandi"))
print(uygula([100.0, 250.0], lambda t: round(t * 1.2, 2)))</pre>

<h2>TypedDict ve Protocol (kısa)</h2>
<p><b>TypedDict</b>, elindeki veri zaten sözlükse (JSON\'dan geldi, dataclass\'a çevirmek istemiyorsun) anahtarlarını ve tiplerini belgelemeni sağlar; çalışma zamanında düz sözlüktür. <b>Protocol</b>, "şu metotlara sahip olan her nesne" demektir; ördek tiplemenin tip sistemindeki karşılığıdır ve kalıtım gerektirmez.</p>
<pre class="py">from typing import TypedDict, Protocol

class SiparisKaydi(TypedDict):
    no: int
    sehir: str
    tutar: float

def sehir_toplam(kayitlar: list[SiparisKaydi], sehir: str) -&gt; float:
    return sum(k["tutar"] for k in kayitlar if k["sehir"] == sehir)

veri: list[SiparisKaydi] = [
    {"no": 1, "sehir": "Ankara", "tutar": 450.0},
    {"no": 2, "sehir": "İzmir", "tutar": 120.0},
    {"no": 3, "sehir": "Ankara", "tutar": 980.0},
]
print(sehir_toplam(veri, "Ankara"))
print(type(veri[0]).__name__)        # düz dict

class Odenebilir(Protocol):
    def ode(self, tutar: float) -&gt; str: ...

class KrediKarti:                    # Odenebilir'den kalıtım almıyor
    def ode(self, tutar: float) -&gt; str:
        return f"KK ile {tutar} ödendi"

def tahsil_et(yontem: Odenebilir, tutar: float) -&gt; str:
    return yontem.ode(tutar)

print(tahsil_et(KrediKarti(), 149.9))</pre>

<h2>mypy mantığı</h2>
<p><code>mypy dosya.py</code> komutu kodu çalıştırmadan tip ipuçlarını denetler: <code>ortalama("abc")</code> gibi çağrıları, None kontrolü yapılmadan kullanılan değerleri, eksik dönüşleri raporlar. Tarayıcıdaki bu ortamda mypy yok, ama mantığı şudur: tip ipucu <b>belgeleme + statik denetim</b>dir, performans ya da çalışma zamanı güvenliği değildir. Gerçek projede CI\'da mypy (ya da pyright) çalıştırılır; "Kalite ve CI" dersinde kuracaksın.</p>

<div class="note"><b>Aşamalı tipleme</b>Her şeyi tiplemek zorunda değilsin. Önce fonksiyon imzalarını, özellikle modül sınırlarını ve veri sınıflarını tiple; iç değişkenleri Python zaten çıkarsar. mypy varsayılan olarak tiplenmemiş fonksiyonları denetlemez; <code>--strict</code> ile hepsini ister.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>dataclass mı NamedTuple mı sözlük mü?</h3>
<ul>
<li><b>dataclass</b>: varsayılan seçim; değiştirilebilir ya da frozen, metotlu, tipli.</li>
<li><b>typing.NamedTuple</b>: küçük, değişmez, demet gibi açılabilir kayıtlar (koordinat, tarih aralığı).</li>
<li><b>TypedDict</b>: veri zaten JSON/sözlük biçimindeyse ve öyle kalacaksa.</li>
<li><b>düz sözlük</b>: anahtarlar çalışma zamanında belirleniyorsa (ör. şehir → toplam).</li>
</ul>
<h3>Generic ve TypeVar</h3>
<p><code>def ilk(x: list[T]) -&gt; T</code> gibi "içeri ne girerse o çıkar" imzalar <code>TypeVar</code> ile yazılır; Python 3.12 bunu <code>def ilk[T](x: list[T]) -&gt; T</code> kısa sözdizimine indirdi. "İleri tip sistemi" dersinde Generic sınıflar, ParamSpec ve overload gelecek.</p>
<h3>Çalışma zamanı doğrulama</h3>
<p>Dış dünyadan (API, dosya) gelen veriyi tip ipucu korumaz. Üretim ortamında <code>pydantic</code> gibi kütüphaneler dataclass benzeri sınıfları çalışma zamanında doğrular ve JSON\'dan güvenle kurar. Standart kütüphanede kalacaksan <code>__post_init__</code> içinde elle kontrol et.</p>
</section>
`,
    ex: [
      { t: 'mc', q: 'Bir dataclass alanına liste varsayılanı vermek için doğru yazım hangisidir?',
        o: ['kalemler: list = []', 'kalemler: list = field(default=[])', 'kalemler: list[str] = field(default_factory=list)', 'kalemler: list = list'],
        a: 2, why: 'Değiştirilebilir varsayılanlar paylaşım tuzağı yarattığı için dataclass bunları reddeder; default_factory her örnek için list() çağırır.' },
      { t: 'code', id: 'dataclass-typing-1',
        q: '<p><code>Urun</code> dataclass\'ını yaz: alanlar <code>kod: str</code>, <code>ad: str</code>, <code>fiyat: float</code>, <code>stok: int = 0</code>. <code>kdvli</code> property <code>round(fiyat * 1.2, 2)</code> döndürsün. <code>__post_init__</code> ile negatif fiyat için <code>ValueError</code> yükselt.</p>',
        start: 'from dataclasses import dataclass\n\n@dataclass\nclass Urun:\n    pass\n',
        sol: 'from dataclasses import dataclass\n\n@dataclass\nclass Urun:\n    kod: str\n    ad: str\n    fiyat: float\n    stok: int = 0\n\n    def __post_init__(self):\n        if self.fiyat < 0:\n            raise ValueError("fiyat negatif olamaz")\n\n    @property\n    def kdvli(self) -> float:\n        return round(self.fiyat * 1.2, 2)\n',
        tests: 'import dataclasses\nassert dataclasses.is_dataclass(Urun), "@dataclass kullanılmalı"\nu = Urun("K-100", "Klavye", 100.0)\nassert u.stok == 0, "varsayılan stok 0"\nassert u == Urun("K-100", "Klavye", 100.0, 0), "alan bazlı eşitlik üretilmeli"\nassert abs(u.kdvli - 120.0) < 1e-6, "kdvli 120.0"\nassert "Klavye" in repr(u), "__repr__ alanları göstermeli"\ntry:\n    Urun("X", "Bozuk", -5.0)\n    assert False, "negatif fiyat ValueError vermeli"\nexcept ValueError:\n    pass\n',
        hints: ['Alanları tip ipucuyla sınıf gövdesine yaz; varsayılanlı alan sona', '__post_init__(self) dataclass kurucusundan sonra otomatik çalışır'],
        why: 'dataclass __init__/__repr__/__eq__ üretir; doğrulama __post_init__ içinde, hesaplanan değer property ile yapılır.' },
      { t: 'code', id: 'dataclass-typing-2',
        q: '<p><code>Siparis</code> dataclass\'ı: <code>no: int</code>, <code>musteri: str</code>, <code>kalemler: list[float]</code> (varsayılan boş liste, <code>default_factory</code>). <code>ekle(fiyat)</code> listeye ekler; <code>toplam</code> property kalemlerin toplamını döndürür. Ayrıca <code>frozen=True</code> ve <code>order=True</code> bir <code>Para</code> dataclass\'ı yaz: <code>tutar: float</code>, <code>birim: str = "TL"</code>.</p>',
        start: 'from dataclasses import dataclass, field\n\n@dataclass\nclass Siparis:\n    pass\n\n\n@dataclass\nclass Para:\n    pass\n',
        sol: 'from dataclasses import dataclass, field\n\n@dataclass\nclass Siparis:\n    no: int\n    musteri: str\n    kalemler: list[float] = field(default_factory=list)\n\n    def ekle(self, fiyat: float) -> None:\n        self.kalemler.append(fiyat)\n\n    @property\n    def toplam(self) -> float:\n        return sum(self.kalemler)\n\n\n@dataclass(frozen=True, order=True)\nclass Para:\n    tutar: float\n    birim: str = "TL"\n',
        tests: 's1 = Siparis(1, "Ayşe")\ns2 = Siparis(2, "Can")\ns1.ekle(100.0); s1.ekle(50.0)\nassert s1.kalemler == [100.0, 50.0], "ekle listeye eklemeli"\nassert s2.kalemler == [], "listeler örnekler arasında paylaşılmamalı"\nassert abs(s1.toplam - 150.0) < 1e-6, "toplam 150"\np = Para(100.0)\nassert p.birim == "TL", "varsayılan birim TL"\ntry:\n    p.tutar = 1.0\n    assert False, "frozen dataclass değiştirilememeli"\nexcept Exception:\n    pass\nassert Para(5.0) < Para(10.0), "order=True ile karşılaştırma"\nassert len({Para(1.0), Para(1.0)}) == 1, "frozen -> hashlenebilir, küme tekilleştirir"\n',
        hints: ['kalemler: list[float] = field(default_factory=list)', '@dataclass(frozen=True, order=True) class Para'],
        why: 'default_factory her örneğe ayrı liste verir; frozen değiştirilemez ve hashlenebilir yapar, order karşılaştırma metotlarını üretir.' },
      { t: 'mc', q: '<code>def bul(no: str) -> str | None</code> imzası çağıran tarafa ne söyler?',
        o: ['Fonksiyon her zaman str döndürür', 'Sonuç None olabilir, kullanmadan önce kontrol gerekir', 'Parametre isteğe bağlıdır', 'Fonksiyon hata yükseltebilir'],
        a: 1, why: '| None dönüş tipi "bulunamayabilir" anlamına gelir; mypy, None kontrolü yapılmadan .upper() gibi kullanımları hata olarak raporlar.' },
      { t: 'code', id: 'dataclass-typing-3',
        q: '<p>Tip ipuçlarıyla iki fonksiyon yaz. <code>sehir_toplam(kayitlar: list[dict[str, object]], sehir: str) -> float</code>: her kayıt <code>"sehir"</code> ve <code>"tutar"</code> anahtarlı sözlük; verilen şehrin tutar toplamını döndürsün. <code>musteri_bul(musteriler: dict[str, str], no: str) -> str | None</code>: anahtar yoksa <code>None</code> döndürsün. Her iki fonksiyonun dönüş tipi ipucu (<code>__annotations__["return"]</code>) tanımlı olmalı.</p>',
        start: 'def sehir_toplam(kayitlar, sehir):\n    pass\n\n\ndef musteri_bul(musteriler, no):\n    pass\n',
        sol: 'def sehir_toplam(kayitlar: list[dict[str, object]], sehir: str) -> float:\n    return float(sum(k["tutar"] for k in kayitlar if k["sehir"] == sehir))\n\n\ndef musteri_bul(musteriler: dict[str, str], no: str) -> str | None:\n    return musteriler.get(no)\n',
        tests: 'veri = [{"no": 1, "sehir": "Ankara", "tutar": 450.0}, {"no": 2, "sehir": "İzmir", "tutar": 120.0}, {"no": 3, "sehir": "Ankara", "tutar": 980.0}]\nassert abs(sehir_toplam(veri, "Ankara") - 1430.0) < 1e-6, "Ankara toplamı 1430"\nassert sehir_toplam(veri, "Bursa") == 0, "şehir yoksa 0"\nassert musteri_bul({"M1": "Ayşe"}, "M1") == "Ayşe", "varsa adı döndür"\nassert musteri_bul({"M1": "Ayşe"}, "M9") is None, "yoksa None"\nassert "return" in sehir_toplam.__annotations__, "sehir_toplam dönüş tipi yazılmalı"\nassert "return" in musteri_bul.__annotations__, "musteri_bul dönüş tipi yazılmalı"\nassert "kayitlar" in sehir_toplam.__annotations__, "parametre tipi yazılmalı"\n',
        hints: ['Dönüş tipi -> ile yazılır: def f(x: int) -> float:', 'dict.get(no) anahtar yoksa None döndürür'],
        why: 'Tip ipuçları __annotations__ sözlüğünde saklanır; çalışma zamanını değiştirmez ama okuyucuya ve mypy\'ye sözleşmeyi söyler.' },
      { t: 'code', id: 'dataclass-typing-4',
        q: '<p><code>Protocol</code> ile <code>Odenebilir</code> tanımla: <code>ode(self, tutar: float) -> str</code> metodu. <code>KrediKarti</code> ve <code>Havale</code> sınıfları (Protocol\'den kalıtım <b>almadan</b>) <code>ode</code> metodunu tanımlasın: sırasıyla <code>"KK: {tutar}"</code> ve <code>"Havale: {tutar}"</code> döndürsün. <code>tahsil_et(yontem: Odenebilir, tutar: float) -> str</code> yöntemin <code>ode</code> metodunu çağırsın.</p>',
        start: 'from typing import Protocol\n\nclass Odenebilir(Protocol):\n    pass\n\nclass KrediKarti:\n    pass\n\nclass Havale:\n    pass\n\ndef tahsil_et(yontem, tutar):\n    pass\n',
        sol: 'from typing import Protocol\n\nclass Odenebilir(Protocol):\n    def ode(self, tutar: float) -> str: ...\n\nclass KrediKarti:\n    def ode(self, tutar: float) -> str:\n        return f"KK: {tutar}"\n\nclass Havale:\n    def ode(self, tutar: float) -> str:\n        return f"Havale: {tutar}"\n\ndef tahsil_et(yontem: Odenebilir, tutar: float) -> str:\n    return yontem.ode(tutar)\n',
        tests: 'assert tahsil_et(KrediKarti(), 100.0) == "KK: 100.0", "kredi kartı"\nassert tahsil_et(Havale(), 50.0) == "Havale: 50.0", "havale"\nassert Odenebilir not in KrediKarti.__bases__, "KrediKarti Protocol\'den kalıtım almamalı"\nassert Odenebilir not in Havale.__bases__, "Havale Protocol\'den kalıtım almamalı"\nassert hasattr(Odenebilir, "ode"), "Protocol ode metodunu tanımlamalı"\n',
        hints: ['Protocol gövdesinde metot imzasını yazıp gövdeye ... koy', 'Sınıflar sadece aynı imzalı ode metodunu tanımlar; kalıtım yok'],
        why: 'Protocol yapısal tipleme sağlar: uygun metodu olan her nesne kabul edilir, kalıtım gerekmez. Bu ördek tiplemenin tip denetleyicideki karşılığıdır.' },
      { t: 'mc', q: 'Tip ipucu olan <code>def kare(x: int) -> int</code> fonksiyonuna <code>kare("3")</code> ile dize verilirse Python ne yapar?',
        o: ['TypeError yükseltir', 'Dizeyi int\'e çevirir', 'Tip ipucunu dikkate almaz, fonksiyonu çalıştırır', 'Uyarı yazdırıp devam eder'],
        a: 2, why: 'Tip ipuçları çalışma zamanında zorlanmaz; yalnızca mypy gibi statik araçlar ve editörler denetler. Fonksiyon gövdesi "3" * "3" gibi bir işlemde ancak kendi hatasıyla durur.' }
    ],
    faq: [
      { q: 'dataclass alanlarına tip yazmak zorunlu mu?', a: 'Evet; dataclass hangi sınıf niteliklerinin alan olduğunu tip ipucundan anlar. Tipi bilmiyorsan <code>typing.Any</code> yaz ama bu nadiren gerekir.' },
      { q: 'Optional[str] ile str | None aynı mı?', a: 'Evet, 3.10+ ile | yazımı tercih edilir. Optional "parametre isteğe bağlı" demek değildir; "None olabilir" demektir. İsteğe bağlılık varsayılan değerle (= None) sağlanır.' },
      { q: 'frozen dataclass içinde listeyi değiştirebilir miyim?', a: 'frozen yalnızca alan atamasını engeller; alandaki listenin içeriği değiştirilebilir. Tam değişmezlik için tuple kullan.' }
    ],
    mistakes: [
      { bad: '@dataclass\nclass Siparis:\n    kalemler: list = []', good: '@dataclass\nclass Siparis:\n    kalemler: list[str] = field(default_factory=list)', why: 'dataclass değiştirilebilir varsayılanı ValueError ile reddeder; default_factory her örnek için yeni liste üretir.' },
      { bad: '@dataclass\nclass Urun:\n    stok: int = 0\n    ad: str', good: '@dataclass\nclass Urun:\n    ad: str\n    stok: int = 0', why: 'Varsayılanlı alan varsayılansızdan önce gelemez; üretilen __init__ imzası geçersiz olur ve TypeError alırsın.' },
      { bad: 'def bul(no: str) -> str:\n    return sozluk.get(no)', good: 'def bul(no: str) -> str | None:\n    return sozluk.get(no)', why: 'get None döndürebilir; dönüş tipi bunu söylemezse çağıran None kontrolünü atlar ve mypy de yanlış bir imzaya güvenir.' }
    ]
  },
  {
    id: 'hata-tasarim', lv: 'orta', mod: 'Nesne Yönelimli Programlama', min: 35,
    title: 'Hata tasarımı: özel istisnalar, logging, EAFP',
    sum: 'Kendi istisna hiyerarşini kurar, raise from ile nedeni korur, logging ile iz bırakır, EAFP ve assert\'i doğru yerde kullanırsın.',
    goals: [
      'Exception\'dan türeyen özel istisna hiyerarşisi tasarlayabilirim.',
      'raise ... from ... ile alt seviye hatayı iş hatasına çevirirken nedeni koruyabilirim.',
      'logging modülünü seviye ve biçimle yapılandırıp print yerine kullanabilirim.',
      'EAFP ile LBYL yaklaşımlarını karşılaştırıp doğru olanı seçebilirim.',
      'assert\'in nerede uygun, nerede tehlikeli olduğunu söyleyebilirim.'
    ],
    body: `
<h2>Neden önemli?</h2>
<p>Temel seviyede <code>try/except</code> ile hatayı yakaladın. Ama Anadolu Bank\'ın transfer servisinde "bir hata oldu" demek yetmez: yetersiz bakiye mi, hesap bulunamadı mı, günlük limit mi aşıldı? Çağıran kod bunları ayırt edip farklı tepki vermeli: birinde müşteriye mesaj, diğerinde operasyon ekibine alarm. Hata <b>tasarımı</b> bu ayrımı kodun bir parçası yapar: anlamlı istisna sınıfları, nedeni koruyan zincirleme, sonradan araştırılabilen log kayıtları. Üretimde gece üçte uyandıran hataların çoğu, kötü yakalanmış ve sessizce yutulmuş istisnalardır.</p>

<h2>Özel istisna hiyerarşisi</h2>
<p><code>Exception</code>\'dan türeyen bir temel sınıf ve ondan türeyen özel sınıflar tanımlarsın. Hiyerarşi sayesinde çağıran, ister tek tek ister hepsini birden yakalar. Gövde genellikle boştur (<code>pass</code> ya da docstring); gerekirse ek nitelik taşır.</p>
<pre class="py">class BankaHatasi(Exception):
    """Anadolu Bank iş kurallarının temel hatası."""

class HesapBulunamadi(BankaHatasi):
    def __init__(self, no):
        super().__init__(f"hesap bulunamadı: {no}")
        self.no = no

class YetersizBakiye(BankaHatasi):
    def __init__(self, hesap_no, istenen, mevcut):
        super().__init__(f"{hesap_no}: {istenen} istendi, {mevcut} var")
        self.eksik = istenen - mevcut

class LimitAsildi(BankaHatasi):
    pass

hesaplar = {"TR01": 500.0, "TR02": 12000.0}

def cek(no, tutar):
    if no not in hesaplar:
        raise HesapBulunamadi(no)
    if tutar &gt; 10000:
        raise LimitAsildi(f"günlük limit 10000, istenen {tutar}")
    if tutar &gt; hesaplar[no]:
        raise YetersizBakiye(no, tutar, hesaplar[no])
    hesaplar[no] -= tutar
    return hesaplar[no]

for no, t in [("TR01", 100), ("TR09", 50), ("TR01", 900), ("TR02", 11000)]:
    try:
        print("Kalan:", cek(no, t))
    except YetersizBakiye as e:
        print("Müşteriye:", e, "| eksik:", e.eksik)
    except BankaHatasi as e:           # kalan tüm banka hataları
        print("Operasyona:", type(e).__name__, "-", e)</pre>

<div class="tip"><b>Sıralama önemli</b>except blokları yukarıdan aşağı denenir. Özel sınıfı (<code>YetersizBakiye</code>) temel sınıftan (<code>BankaHatasi</code>) önce yaz; tersini yazarsan özel blok hiç çalışmaz.</div>

<h3>Hiyerarşi nasıl kurulur?</h3>
<div class="tbl-wrap"><table>
<tr><th>Katman</th><th>Örnek</th><th>Kim yakalar</th></tr>
<tr><td>Kök</td><td><code>BankaHatasi(Exception)</code></td><td>En dış katman: "bizim hatamız mı, Python\'ın mı"</td></tr>
<tr><td>Alan</td><td><code>HesapHatasi</code>, <code>TransferHatasi</code></td><td>Servis katmanı: alana göre tepki</td></tr>
<tr><td>Somut</td><td><code>YetersizBakiye</code>, <code>HesapBulunamadi</code></td><td>Kullanıcı arayüzü: anlamlı mesaj</td></tr>
<tr><td>Yerleşik</td><td><code>ValueError</code>, <code>KeyError</code></td><td>Genel programlama hataları; iş hatasına çevrilir</td></tr>
</table></div>

<h2>raise from: nedeni koru</h2>
<p>Alt seviyede <code>KeyError</code> ya da <code>ValueError</code> fırladı, sen bunu iş diline çevirmek istiyorsun. <code>raise YeniHata(...) from eski</code> yazarsan Python iki hatayı zincirler: iz kaydında "The above exception was the direct cause of the following exception" satırıyla asıl neden görünür. <code>from None</code> ise zinciri bilinçli olarak keser (nedeni gizlemek istediğin, örneğin kullanıcıya iç detay sızdırmamak gerektiği durumlarda).</p>
<pre class="py">class VeriHatasi(Exception):
    pass

def tutar_oku(kayit):
    try:
        return float(kayit["tutar"])
    except KeyError as e:
        raise VeriHatasi(f"kayıtta 'tutar' alanı yok: {kayit}") from e
    except ValueError as e:
        raise VeriHatasi(f"tutar sayı değil: {kayit['tutar']!r}") from e

for k in [{"tutar": "12.5"}, {"fiyat": 3}, {"tutar": "abc"}]:
    try:
        print(tutar_oku(k))
    except VeriHatasi as e:
        print("VeriHatasi:", e)
        print("   neden:", type(e.__cause__).__name__, "-", e.__cause__)</pre>

<div class="note"><b>except içinde çıplak raise</b>Hatayı sadece loglayıp yukarı iletmek istiyorsan <code>raise</code> yaz (argümansız); aynı istisna izi kaybolmadan devam eder. <code>raise e</code> yazmak da çalışır ama iz kaydına gereksiz bir satır ekler.</div>

<h2>logging: print değil</h2>
<p>Üretim kodunda <code>print</code> ile hata takibi yapılmaz: seviyesi yok, zamanı yok, kapatılamaz, dosyaya yönlendirilemez. <code>logging</code> modülü bunları verir. Beş seviye vardır: DEBUG &lt; INFO &lt; WARNING &lt; ERROR &lt; CRITICAL; yapılandırılan eşiğin altındakiler yazılmaz. Bu ortamda çıktıyı stdout\'a yönlendiriyoruz.</p>
<pre class="py">import logging, sys

logging.basicConfig(
    stream=sys.stdout,
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("anadolu.transfer")

def transfer(gonderen, alici, tutar):
    log.info("transfer başlıyor %s -&gt; %s, %.2f", gonderen, alici, tutar)
    if tutar &gt; 10000:
        log.warning("yüksek tutar, ek onay gerekebilir: %.2f", tutar)
    log.debug("bu satır görünmez: seviye INFO")
    return True

transfer("TR01", "TR02", 250)
transfer("TR01", "TR03", 25000)</pre>

<p>Dikkat: mesajı <code>%s</code> ile ve argümanları ayrı veriyoruz, f-string ile değil. Böylece seviye kapalıysa dize hiç biçimlenmez ve log kayıtları toplayan araçlar (Sentry, ELK) aynı mesaj şablonunu gruplayabilir.</p>

<h3>İstisnayı logla: exception()</h3>
<p>except bloğunda <code>log.exception("...")</code> çağırırsan mesajla birlikte tam iz kaydı (traceback) yazılır; seviye ERROR\'dur. Hatayı yutmadan loglayıp yeniden yükseltmek en sağlıklı kalıptır.</p>
<pre class="py">import logging, sys

logging.basicConfig(stream=sys.stdout, level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger("anadolu.rapor")

def kayit_isle(kayit):
    try:
        return kayit["tutar"] / kayit["adet"]
    except ZeroDivisionError:
        log.exception("adet sıfır, kayıt atlandı: %s", kayit)
        return None

print(kayit_isle({"tutar": 100, "adet": 4}))
print(kayit_isle({"tutar": 100, "adet": 0}))</pre>

<div class="warn"><b>except Exception: pass</b>En tehlikeli üç satır. Hata yutulur, program yanlış veriyle devam eder, kimse fark etmez. En azından <code>log.exception</code> yaz; mümkünse yakaladığın hatayı dar tut (<code>except KeyError</code>) ve gerisini yukarı bırak.</div>

<h2>EAFP ile LBYL</h2>
<p>İki yaklaşım: <b>LBYL</b> (Look Before You Leap, önce bak sonra atla) koşulla kontrol eder; <b>EAFP</b> (Easier to Ask Forgiveness than Permission, izin istemektense af dile) dener ve hatayı yakalar. Python topluluğu çoğunlukla EAFP\'yi tercih eder: daha az kod, daha az yarış durumu (kontrol ile kullanım arasında dünya değişebilir), ve istisna yolu nadir durumsa daha hızlıdır.</p>
<pre class="py">musteriler = {"M1": {"ad": "Ayşe", "eposta": "ayse@mail.com"}, "M2": {"ad": "Can"}}

# LBYL
def eposta_lbyl(no):
    if no in musteriler and "eposta" in musteriler[no]:
        return musteriler[no]["eposta"]
    return None

# EAFP
def eposta_eafp(no):
    try:
        return musteriler[no]["eposta"]
    except KeyError:
        return None

for no in ["M1", "M2", "M9"]:
    print(no, eposta_lbyl(no), eposta_eafp(no))

# Tip kontrolü yerine davranışa güven (ördek tipleme ile EAFP)
def toplam(kaynak):
    try:
        return sum(kaynak.values())      # sözlük mü?
    except AttributeError:
        return sum(kaynak)               # değilse liste gibi davran

print(toplam({"a": 1, "b": 2}), toplam([3, 4]))</pre>

<p>LBYL\'in haklı olduğu yerler: kontrol ucuzsa ve hata yolu pahalıysa (dosya silmeden önce var mı diye bakmak), ya da istisna çok sık oluşuyorsa (istisna yakalamak başarılı yoldan daha yavaştır).</p>

<h2>assert'in yeri</h2>
<p><code>assert koşul, "mesaj"</code> koşul yanlışsa <code>AssertionError</code> yükseltir. Amacı <b>programcı varsayımlarını</b> geliştirme sırasında doğrulamaktır: "bu noktada liste boş olamaz". Kullanıcı girdisi, dış veri ya da iş kuralı doğrulamak için <b>kullanılmaz</b>, çünkü Python <code>-O</code> bayrağıyla çalıştırıldığında tüm assert\'ler silinir ve kontroller yok olur.</p>
<pre class="py">def ortalama(tutarlar):
    assert isinstance(tutarlar, list), "iç kullanım: liste bekleniyor"   # programcı varsayımı
    if not tutarlar:                                                      # iş kuralı: gerçek istisna
        raise ValueError("boş liste için ortalama tanımsız")
    return sum(tutarlar) / len(tutarlar)

print(ortalama([10, 20]))
try:
    ortalama([])
except ValueError as e:
    print("ValueError:", e)
try:
    ortalama("abc")
except AssertionError as e:
    print("AssertionError:", e)</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>İstisna gruplarıyla toplu doğrulama (3.11+)</h3>
<p>Bir formda beş alan hatalıysa kullanıcıya ilkini değil hepsini göstermek istersin. <code>ExceptionGroup("doğrulama", [h1, h2, ...])</code> birden çok istisnayı tek nesnede taşır; <code>except*</code> sözdizimi gruptan türe göre seçer. Toplu veri yükleme ve eşzamanlı görevlerde (asyncio TaskGroup) standart araçtır.</p>
<h3>Hata mesajı yazma kuralları</h3>
<ul>
<li>Ne bekleniyordu, ne geldi: <code>"tutar pozitif olmalı, gelen: -5"</code>.</li>
<li>Bağlam ekle: hangi hesap, hangi satır, hangi dosya.</li>
<li>Çözümü ima et: <code>"hesap bulunamadı: TR09 (numara TR ile başlamalı)"</code>.</li>
<li>Kullanıcıya giden mesajla loga giden mesajı ayır: iç detay (SQL, dosya yolu) loga, sade cümle kullanıcıya.</li>
</ul>
<h3>Logger hiyerarşisi</h3>
<p><code>getLogger("anadolu.transfer")</code> adı noktayla ayrılmış bir ağaçtır: <code>anadolu</code> logger\'ının seviyesi ve işleyicileri alt loggerlara miras geçer. Modül başında <code>log = logging.getLogger(__name__)</code> yazmak standarttır; uygulama girişinde bir kez <code>basicConfig</code> ya da <code>dictConfig</code> ile yapılandırma yapılır, kütüphane kodu asla basicConfig çağırmaz.</p>
<h3>Hata yönetimi stratejisi</h3>
<p>Her katman yalnızca anlamlı tepki verebildiği hatayı yakalar; gerisini yukarı bırakır. Hatayı en altta yakalayıp None döndürmek sorunu ertelemektir: "None nereden geldi?" sorusu üç katman yukarıda, saatler sonra sorulur. En dış katmanda (CLI giriş noktası, web isteği işleyicisi) tek bir <code>except BankaHatasi</code> kullanıcı mesajını, tek bir <code>except Exception</code> ile <code>log.exception</code> beklenmeyeni raporlar.</p>
</section>
`,
    ex: [
      { t: 'mc', q: '<code>raise VeriHatasi("bozuk") from e</code> yazımının amacı nedir?',
        o: ['e istisnasını bastırmak', 'Yeni istisnayı yükseltirken asıl nedeni (e) zincire eklemek', 'İki istisnayı aynı anda yükseltmek', 'e istisnasını yeniden denemek'],
        a: 1, why: 'from, yeni istisnanın __cause__ alanına eskisini koyar; iz kaydında her iki hata da görünür. from None ise zinciri keser.' },
      { t: 'code', id: 'hata-tasarim-1',
        q: '<p>İstisna hiyerarşisi kur: <code>BankaHatasi(Exception)</code>, ondan türeyen <code>HesapBulunamadi</code> ve <code>YetersizBakiye</code>. <code>YetersizBakiye</code> kurucusu <code>(istenen, mevcut)</code> alsın, mesajı <code>f"{istenen} istendi, {mevcut} var"</code> olsun ve <code>eksik</code> niteliğinde farkı tutsun. <code>cek(hesaplar, no, tutar)</code> fonksiyonu: hesap yoksa <code>HesapBulunamadi(no)</code>, bakiye yetmezse <code>YetersizBakiye</code> yükseltsin; başarılıysa bakiyeyi düşüp yeni bakiyeyi döndürsün.</p>',
        start: 'class BankaHatasi(Exception):\n    pass\n\n# HesapBulunamadi ve YetersizBakiye\n\ndef cek(hesaplar, no, tutar):\n    pass\n',
        sol: 'class BankaHatasi(Exception):\n    pass\n\nclass HesapBulunamadi(BankaHatasi):\n    pass\n\nclass YetersizBakiye(BankaHatasi):\n    def __init__(self, istenen, mevcut):\n        super().__init__(f"{istenen} istendi, {mevcut} var")\n        self.eksik = istenen - mevcut\n\ndef cek(hesaplar, no, tutar):\n    if no not in hesaplar:\n        raise HesapBulunamadi(no)\n    if tutar > hesaplar[no]:\n        raise YetersizBakiye(tutar, hesaplar[no])\n    hesaplar[no] -= tutar\n    return hesaplar[no]\n',
        tests: 'assert issubclass(HesapBulunamadi, BankaHatasi) and issubclass(YetersizBakiye, BankaHatasi), "ikisi de BankaHatasi\'ndan türemeli"\nh = {"TR01": 500.0}\nassert cek(h, "TR01", 100) == 400.0, "başarılı çekim yeni bakiyeyi döndürmeli"\ntry:\n    cek(h, "TR09", 1)\n    assert False, "hesap yoksa HesapBulunamadi"\nexcept HesapBulunamadi:\n    pass\ntry:\n    cek(h, "TR01", 1000)\n    assert False, "yetersizse YetersizBakiye"\nexcept YetersizBakiye as e:\n    assert e.eksik == 600.0, "eksik 600 olmalı"\n    assert str(e) == "1000 istendi, 400.0 var", "mesaj biçimi"\nassert h["TR01"] == 400.0, "hata durumunda bakiye değişmemeli"\ntry:\n    cek(h, "TR09", 1)\nexcept BankaHatasi:\n    pass\n',
        hints: ['class HesapBulunamadi(BankaHatasi): pass yeterli', 'YetersizBakiye.__init__ içinde super().__init__(mesaj) ve self.eksik = istenen - mevcut'],
        why: 'Ortak temel sınıf, çağıranın tüm banka hatalarını tek except ile yakalamasını sağlar; ek nitelik (eksik) hatayı programatik olarak kullanılabilir kılar.' },
      { t: 'code', id: 'hata-tasarim-2',
        q: '<p><code>VeriHatasi(Exception)</code> tanımla. <code>tutar_oku(kayit)</code> fonksiyonu <code>kayit["tutar"]</code> değerini <code>float</code>\'a çevirip döndürsün. Anahtar yoksa (<code>KeyError</code>) ya da değer sayıya çevrilemiyorsa (<code>ValueError</code>), <code>raise VeriHatasi(...) from</code> ile asıl hatayı neden olarak zincirle. Mesaj serbest ama boş olmasın.</p>',
        start: 'class VeriHatasi(Exception):\n    pass\n\ndef tutar_oku(kayit):\n    pass\n',
        sol: 'class VeriHatasi(Exception):\n    pass\n\ndef tutar_oku(kayit):\n    try:\n        return float(kayit["tutar"])\n    except KeyError as e:\n        raise VeriHatasi(f"tutar alanı yok: {kayit}") from e\n    except ValueError as e:\n        raise VeriHatasi(f"tutar sayı değil: {kayit[\'tutar\']!r}") from e\n',
        tests: 'assert tutar_oku({"tutar": "12.5"}) == 12.5, "geçerli değer float dönmeli"\ntry:\n    tutar_oku({"fiyat": 3})\n    assert False, "anahtar yoksa VeriHatasi"\nexcept VeriHatasi as e:\n    assert isinstance(e.__cause__, KeyError), "neden KeyError olmalı (raise ... from)"\n    assert str(e), "mesaj boş olmamalı"\ntry:\n    tutar_oku({"tutar": "abc"})\n    assert False, "sayı değilse VeriHatasi"\nexcept VeriHatasi as e:\n    assert isinstance(e.__cause__, ValueError), "neden ValueError olmalı"\n',
        hints: ['try içinde float(kayit["tutar"]); iki ayrı except yaz', 'except KeyError as e: raise VeriHatasi("...") from e'],
        why: 'Alt seviye hatayı iş diline çevirirken from ile neden korunur; e.__cause__ üzerinden hâlâ ulaşılabilir.' },
      { t: 'mc', q: 'Hangi durumda <code>assert</code> kullanmak <b>yanlıştır</b>?',
        o: ['Bir algoritmanın ara adımındaki değişmezi (invariant) doğrulamak', 'Test fonksiyonunda beklenen sonucu kontrol etmek', 'Kullanıcıdan gelen tutarın pozitif olduğunu doğrulamak', 'Geliştirme sırasında bir fonksiyonun hiç None dönmediğini kontrol etmek'],
        a: 2, why: 'Kullanıcı girdisi ve iş kuralları gerçek istisnalarla (ValueError vb.) doğrulanır; Python -O ile çalıştırıldığında assert satırları silinir ve kontrol yok olur.' },
      { t: 'code', id: 'hata-tasarim-3',
        q: '<p><code>logging</code> kullan: <code>logging.basicConfig(stream=sys.stdout, level=logging.INFO, format="%(levelname)s:%(message)s")</code> ile yapılandır. <code>bolu(a, b)</code> fonksiyonu <code>a / b</code> sonucunu döndürsün; <code>b</code> sıfırsa <code>log.error("sıfıra bölme: a=%s", a)</code> ile loglayıp <code>None</code> döndürsün. Ana kodda <code>bolu(10, 2)</code> ve <code>bolu(5, 0)</code> sonuçlarını <code>print</code> ile yazdır. Beklenen çıktıya tam uy.</p>',
        start: 'import logging, sys\n\nlogging.basicConfig(stream=sys.stdout, level=logging.INFO, format="%(levelname)s:%(message)s")\nlog = logging.getLogger("anadolu")\n\ndef bolu(a, b):\n    pass\n\nprint(bolu(10, 2))\nprint(bolu(5, 0))\n',
        sol: 'import logging, sys\n\nlogging.basicConfig(stream=sys.stdout, level=logging.INFO, format="%(levelname)s:%(message)s")\nlog = logging.getLogger("anadolu")\n\ndef bolu(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        log.error("sıfıra bölme: a=%s", a)\n        return None\n\nprint(bolu(10, 2))\nprint(bolu(5, 0))\n',
        expect: '5.0\nERROR:sıfıra bölme: a=5\nNone\n',
        tests: 'assert bolu(9, 3) == 3.0, "normal bölme"\nassert bolu(1, 0) is None, "sıfıra bölmede None"\n',
        hints: ['try/except ZeroDivisionError (EAFP)', 'log.error mesajını %s ile ve argümanı ayrı ver'],
        why: 'logging stdout\'a yönlendirildiği için ERROR satırı print çıktılarının arasında görünür; mesaj şablonu ve argüman ayrı tutulur.' },
      { t: 'code', id: 'hata-tasarim-4',
        q: '<p>EAFP ile yaz: <code>eposta_al(musteriler, no)</code> fonksiyonu <code>musteriler[no]["eposta"]</code> değerini döndürsün; müşteri ya da eposta anahtarı yoksa <code>None</code> döndürsün. <b>if ... in</b> kontrolü kullanma; <code>try/except KeyError</code> kullan. Ayrıca <code>sayiya_cevir(metin)</code>: <code>int(metin)</code> dene, olmazsa <code>float(metin)</code> dene, o da olmazsa <code>None</code> döndür.</p>',
        start: 'def eposta_al(musteriler, no):\n    pass\n\ndef sayiya_cevir(metin):\n    pass\n',
        sol: 'def eposta_al(musteriler, no):\n    try:\n        return musteriler[no]["eposta"]\n    except KeyError:\n        return None\n\ndef sayiya_cevir(metin):\n    try:\n        return int(metin)\n    except ValueError:\n        try:\n            return float(metin)\n        except ValueError:\n            return None\n',
        tests: 'm = {"M1": {"ad": "Ayşe", "eposta": "a@x.com"}, "M2": {"ad": "Can"}}\nassert eposta_al(m, "M1") == "a@x.com", "varsa e-posta"\nassert eposta_al(m, "M2") is None, "eposta anahtarı yoksa None"\nassert eposta_al(m, "M9") is None, "müşteri yoksa None"\nassert sayiya_cevir("42") == 42 and isinstance(sayiya_cevir("42"), int), "int olarak 42"\nassert sayiya_cevir("3.5") == 3.5, "float olarak 3.5"\nassert sayiya_cevir("abc") is None, "çevrilemezse None"\n',
        hints: ['Tek try: musteriler[no]["eposta"]; KeyError her iki eksikliği de kapsar', 'İç içe try: önce int, except ValueError içinde float'],
        why: 'EAFP dener ve hatayı yakalar; iki anahtarı tek except KeyError ile ele almak LBYL\'deki çift kontrolden kısa.' },
      { t: 'mc', q: 'Aşağıdaki except sıralamasında ne sorun vardır?<br><code>except BankaHatasi: ...<br>except YetersizBakiye: ...</code> (YetersizBakiye, BankaHatasi\'ndan türer)',
        o: ['İkinci blok hiç çalışmaz, çünkü ilk blok onu da yakalar', 'SyntaxError oluşur', 'Her iki blok da çalışır', 'Sorun yok'],
        a: 0, why: 'except blokları sırayla denenir ve isinstance mantığıyla eşleşir; alt sınıf üst sınıf bloğuna takılır. Özel sınıflar önce, genel olanlar sonra yazılmalıdır.' },
      { t: 'mc', q: '<code>log.info("bakiye %s", bakiye)</code> yerine <code>log.info(f"bakiye {bakiye}")</code> yazmanın sakıncası nedir?',
        o: ['f-string logging içinde çalışmaz', 'Seviye kapalı olsa bile dize biçimlenir ve log araçları mesajı gruplayamaz', 'Mesaj iki kez yazılır', 'Sadece DEBUG seviyesinde çalışır'],
        a: 1, why: 'Şablon ve argüman ayrı verilince logging dizeyi yalnızca gerektiğinde biçimler; log toplayıcılar aynı şablonu tek olay olarak gruplar. f-string çalışır ama bu avantajları kaybeder.' }
    ],
    faq: [
      { q: 'Özel istisnamı Exception\'dan mı BaseException\'dan mı türetmeliyim?', a: 'Her zaman Exception\'dan. BaseException, KeyboardInterrupt ve SystemExit gibi programı durdurma amaçlı istisnalar içindir; ondan türetirsen except Exception blokları seni yakalayamaz.' },
      { q: 'Hatayı yakalayıp None döndürmek ne zaman kabul edilebilir?', a: 'None gerçekten "bulunamadı" anlamı taşıyorsa ve çağıran bunu bekliyorsa (dict.get gibi). Beklenmeyen hataları None\'a çevirmek sorunu gizler; o durumda logla ve yeniden yükselt.' },
      { q: 'logging.basicConfig ikinci kez çağrılınca neden etkisi olmuyor?', a: 'Kök logger zaten işleyici aldıysa basicConfig sessizce hiçbir şey yapmaz. force=True ile zorlayabilirsin; normalde yapılandırma uygulama girişinde bir kez yapılır.' }
    ],
    mistakes: [
      { bad: 'try:\n    islem()\nexcept Exception:\n    pass', good: 'try:\n    islem()\nexcept VeriHatasi:\n    log.exception("işlem atlandı")\n    raise', why: 'Tüm hataları sessizce yutmak programı yanlış veriyle sürdürür; dar yakala, logla, gerekirse yeniden yükselt.' },
      { bad: 'assert tutar > 0, "tutar pozitif olmalı"', good: 'if tutar <= 0:\n    raise ValueError("tutar pozitif olmalı")', why: 'İş kuralı doğrulaması assert ile yapılmaz; -O bayrağıyla assert silinir ve kontrol kaybolur.' },
      { bad: 'except KeyError:\n    raise VeriHatasi("alan yok")', good: 'except KeyError as e:\n    raise VeriHatasi("alan yok") from e', why: 'from olmadan da zincir ("During handling...") görünür ama bu "yeni hata eski hatayı işlerken oluştu" demektir; from, nedeni açıkça işaretler ve niyeti belgeler.' }
    ]
  }
