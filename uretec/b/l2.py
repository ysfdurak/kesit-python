import sys
sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/b')
from jsb import C, emit

body = r'''
<h2>Neden önemli?</h2>
<p>Kalıtım ve polimorfizm dersinde tek bir üst sınıftan türetmeyi, <code>super()</code> ile kurucuyu genişletmeyi ve mixin fikrine kısa bir girişi gördün. Gerçek kod tabanlarında ise sınıfların çoğu birden fazla kaynaktan yetenek alır: Anadolu Market'in <code>Siparis</code> sınıfı hem bir <code>Kayit</code>'tır, hem JSON'a çevrilebilir, hem işlemlerini loglar, hem de tutarına göre sıralanabilir. Django'nun sınıf tabanlı görünümleri, scikit-learn'ün tahmin edicileri, <code>socketserver.ThreadingMixIn</code> hep bu kalıpla yazılmıştır.</p>
<p>Çoklu kalıtım (multiple inheritance) güçlüdür ama bir soruyu doğurur: iki üst sınıfta aynı adlı metot varsa hangisi çalışır? Python bu soruyu <b>MRO</b> (Method Resolution Order, metot çözümleme sırası) ile kesin olarak yanıtlar. Bu dersin sonunda bir sınıfın MRO'sunu kâğıt üzerinde hesaplayabilecek, <code>super()</code>'nün aslında "üst sınıf" değil "MRO'da sıradaki sınıf" demek olduğunu bilecek ve temiz mixin'ler tasarlayabileceksin. Bunlar PCAP 4.5 konusunun tamamıdır.</p>

<h2>Tekli ve çoklu kalıtım sözdizimi</h2>
<p>Parantez içine birden fazla sınıf yazarsın. Arama soldan sağa yapılır: önce sınıfın kendisi, sonra ilk yazılan üst sınıf ve onun ataları (ortak ata hariç), sonra ikinci üst sınıf...</p>
<pre class="py">class Kargolanabilir:
    def teslimat(self):
        return "Kargo ile 2 gün"
    def etiket(self):
        return "KARGO"

class Indirilebilir:
    def teslimat(self):
        return "Anında indirme"
    def boyut(self):
        return "120 MB"

class EKitapPaketi(Indirilebilir, Kargolanabilir):   # basılı kitap + PDF
    pass

p = EKitapPaketi()
print(p.teslimat())            # soldaki kazanır
print(p.etiket(), p.boyut())   # ikisinin yetenekleri de var
print([k.__name__ for k in EKitapPaketi.__mro__])</pre>
<p><code>__mro__</code> sınıfın arama sırasını demet olarak tutar; <code>EKitapPaketi.mro()</code> aynı bilgiyi liste olarak verir. Her sınıfın zinciri <code>object</code> ile biter.</p>

<h2>Elmas problemi</h2>
<p>İki üst sınıf ortak bir atadan türüyorsa kalıtım grafiği elmas biçimini alır. Eski dillerde ortak atanın metodu iki kez mi çalışacak, hangi yoldan mı gelinecek belirsizdi. Python'da ortak ata MRO'da <b>bir kez</b> ve <b>tüm alt sınıflarından sonra</b> yer alır.</p>
<pre class="py">class Hesap:
    def aciklama(self):
        return "Hesap"

class Vadeli(Hesap):
    def aciklama(self):
        return "Vadeli"

class Dovizli(Hesap):
    def aciklama(self):
        return "Dövizli"

class DovizliVadeli(Vadeli, Dovizli):
    pass

print([k.__name__ for k in DovizliVadeli.__mro__])
print(DovizliVadeli().aciklama())
print(Hesap in DovizliVadeli.__mro__, DovizliVadeli.__mro__.count(Hesap))</pre>

<h2>C3 doğrusallaştırma: MRO nasıl hesaplanır?</h2>
<p>Python 2.3'ten beri MRO, <b>C3 doğrusallaştırma</b> (C3 linearization) algoritmasıyla bulunur. Üç kuralı garanti eder:</p>
<ol>
<li><b>Çocuk önce:</b> bir sınıf her zaman üst sınıflarından önce gelir.</li>
<li><b>Yerel sıra korunur:</b> <code>class D(B, C)</code> yazdıysan B, C'den önce gelir.</li>
<li><b>Tutarlılık (monotonluk):</b> üst sınıfların kendi MRO'larındaki sıra bozulmaz.</li>
</ol>
<p>Hesap şöyle yapılır: <code>L[D] = D + birleştir(L[B], L[C], [B, C])</code>. Birleştirme adımında listelerin başlarına bakarsın; başka hiçbir listenin <b>kuyruğunda</b> (ilk eleman dışındaki kısmında) geçmeyen ilk baş adayı seçilir, tüm listelerden çıkarılır, tekrar edilir. Aday kalmazsa sıralama imkânsızdır ve Python sınıfı oluşturmayı reddeder:</p>
<pre class="py">class A: pass
class B(A): pass

try:
    class C(A, B):      # A, B'den önce olsun diyorsun ama B, A'nın çocuğu!
        pass
except TypeError as e:
    print("TypeError:", e)

class C(B, A):          # tutarlı sıra
    pass
print([k.__name__ for k in C.mro()])</pre>
<div class="tbl-wrap"><table>
<tr><th>Tanım</th><th>MRO</th><th>Not</th></tr>
<tr><td><code>class B(A)</code></td><td>B, A, object</td><td>Tekli kalıtım: düz zincir</td></tr>
<tr><td><code>class D(B, C)</code>; B(A), C(A)</td><td>D, B, C, A, object</td><td>Elmas: A en sonda, bir kez</td></tr>
<tr><td><code>class E(C, B)</code>; B(A), C(A)</td><td>E, C, B, A, object</td><td>Yerel sıra değişti, MRO da değişti</td></tr>
<tr><td><code>class X(A, B)</code>; B(A)</td><td>TypeError</td><td>Çocuk-önce kuralıyla çelişir</td></tr>
</table></div>

<h2>super() üst sınıfı değil, MRO'da sıradakini çağırır</h2>
<p>Bu cümle çoklu kalıtımın anahtarıdır. <code>super().metot()</code>, <b>nesnenin</b> MRO'sunda, içinde bulunduğun sınıftan sonra gelen sınıfın metodunu çağırır. Aynı <code>Vadeli</code> sınıfındaki <code>super()</code>, tek başına kullanıldığında Hesap'a, <code>DovizliVadeli</code> nesnesinde ise Dovizli'ye gider.</p>
<pre class="py">class Hesap:
    def kaydet(self):
        print("Hesap: veritabanına yazıldı")

class Vadeli(Hesap):
    def kaydet(self):
        print("Vadeli: vade tablosu güncellendi")
        super().kaydet()

class Dovizli(Hesap):
    def kaydet(self):
        print("Dövizli: kur kaydı eklendi")
        super().kaydet()

class DovizliVadeli(Vadeli, Dovizli):
    def kaydet(self):
        print("DövizliVadeli: başlıyor")
        super().kaydet()

DovizliVadeli().kaydet()
print("---")
Vadeli().kaydet()</pre>
<p>Hesap'ın <code>kaydet</code>'i <b>bir kez</b> çalıştı ve her sınıf yalnız kendi işini yaptı. Bu düzene <b>işbirlikçi çoklu kalıtım</b> (cooperative multiple inheritance) denir. Şartı basittir: zincirdeki her sınıf <code>super()</code> çağırır ve kimse üst sınıfı adıyla (<code>Hesap.kaydet(self)</code>) çağırmaz. Adıyla çağırırsan zincir kopar ya da ortak ata iki kez çalışır.</p>

<h3>Kurucularda **kwargs ile işbirliği</h3>
<p>Farklı sınıfların kurucuları farklı parametreler ister. Çözüm: her sınıf kendi parametresini <b>adıyla</b> alır, kalanını <code>**kwargs</code> ile <code>super().__init__</code>'e iletir. Zincirin sonunda object'e boş kwargs ulaşmalıdır.</p>
<pre class="py">class Kayit:
    def __init__(self, *, kimlik, **kwargs):
        super().__init__(**kwargs)
        self.kimlik = kimlik

class ZamanDamgasi:
    def __init__(self, *, tarih="2026-01-15", **kwargs):
        super().__init__(**kwargs)
        self.tarih = tarih

class Sahipli:
    def __init__(self, *, sahip, **kwargs):
        super().__init__(**kwargs)
        self.sahip = sahip

class Fatura(ZamanDamgasi, Sahipli, Kayit):
    def __init__(self, *, tutar, **kwargs):
        super().__init__(**kwargs)
        self.tutar = tutar

f = Fatura(kimlik="F-1001", sahip="Anadolu Market", tutar=1250.0)
print(vars(f))
print([k.__name__ for k in Fatura.__mro__])</pre>
<div class="tip"><b>Yalnız-anahtar parametre</b>Parametre listesindeki <code>*</code>, sonrasındaki argümanların adla verilmesini zorunlu kılar. İşbirlikçi kurucularda konuma bağlı argüman sırası MRO'ya göre değişeceği için adla geçmek tek güvenli yoldur.</div>

<h2>Mixin tasarımı</h2>
<p><b>Mixin</b>, tek başına örneklenmesi amaçlanmayan, tek bir yeteneği (JSON'a çevirme, loglama, karşılaştırma) başka sınıflara "karıştırmak" için yazılmış küçük bir sınıftır. İyi bir mixin:</p>
<ul>
<li>Tek bir iş yapar ve adı <code>...Mixin</code> ile biter.</li>
<li>Kendi <code>__init__</code>'ini mümkünse tanımlamaz; tanımlarsa işbirlikçi yazar.</li>
<li>Ev sahibi sınıftan beklediğini (ör. <code>_anahtar()</code> metodu) belgelendirir.</li>
<li>Sınıf tanımında <b>solda</b>, asıl taban sınıf en <b>sağda</b> yazılır: <code>class Siparis(JsonMixin, LogMixin, Kayit)</code>.</li>
</ul>
<pre class="py">import json
from functools import total_ordering

class JsonMixin:
    def to_json(self):
        return json.dumps(vars(self), ensure_ascii=False, sort_keys=True)

class LogMixin:
    def log(self, mesaj):
        self.__dict__.setdefault("_kayitlar", [])
        self._kayitlar.append(f"[{type(self).__name__}] {mesaj}")

@total_ordering
class KarsilastirmaMixin:
    # Ev sahibi _anahtar() tanımlamalı
    def __eq__(self, other):
        if not isinstance(other, KarsilastirmaMixin):
            return NotImplemented
        return self._anahtar() == other._anahtar()
    def __lt__(self, other):
        if not isinstance(other, KarsilastirmaMixin):
            return NotImplemented
        return self._anahtar() &lt; other._anahtar()

class Urun(JsonMixin, KarsilastirmaMixin):
    def __init__(self, ad, fiyat):
        self.ad, self.fiyat = ad, fiyat
    def _anahtar(self):
        return self.fiyat
    def __repr__(self):
        return f"Urun({self.ad!r}, {self.fiyat})"

urunler = [Urun("Termos", 349.9), Urun("Kalem", 25.0), Urun("Çanta", 899.0)]
print(sorted(urunler))
print(urunler[0] > urunler[1], max(urunler).ad)
print(urunler[1].to_json())</pre>
<p><code>functools.total_ordering</code>, <code>__eq__</code> ve <code>__lt__</code>'den diğer dört karşılaştırmayı türetir. <code>to_json</code> ise <code>vars(self)</code> ile nesnenin sözlüğünü kullanır; kapsülleme dersindeki iç gözlem araçlarının pratik bir uygulaması.</p>

<h2>Metot ezme, __str__ ve __repr__</h2>
<p>Alt sınıf bir metodu yeniden tanımlayınca (ezme, overriding) MRO'da önce o bulunur. <code>__repr__</code>'ı taban sınıfta bir kez, <code>type(self).__name__</code> kullanarak yazarsan tüm alt sınıflar doğru adı kendiliğinden gösterir. <code>__str__</code> son kullanıcıya, <code>__repr__</code> geliştiriciye yöneliktir; <code>__str__</code> yoksa <code>print</code> <code>__repr__</code>'a düşer.</p>

<h2>Polimorfizm ve duck typing</h2>
<p>Polimorfizmin Python'daki en yaygın biçimi <b>duck typing</b>'dir: "Ördek gibi yürüyor ve ötüyorsa ördektir." Bir fonksiyon nesnenin türünü değil, <b>yapabildiklerini</b> önemser. Ortak üst sınıf zorunlu değildir.</p>
<pre class="py">class KargoUcreti:
    def __init__(self, desi): self.desi = desi
    def ucret(self): return 30 + self.desi * 4.5

class Sigorta:
    def __init__(self, deger): self.deger = deger
    def ucret(self): return round(self.deger * 0.01, 2)

class HediyePaketi:
    def ucret(self): return 25

class Not:                      # ucret() yok
    metin = "Kapıya bırakın"

kalemler = [KargoUcreti(3), Sigorta(2000), HediyePaketi(), Not()]
toplam = 0
for k in kalemler:
    try:
        toplam += k.ucret()
    except AttributeError:
        print("Ücretsiz kalem atlandı:", type(k).__name__)
print("Toplam ek ücret:", toplam)</pre>
<p><code>try/except AttributeError</code> yaklaşımına EAFP ("izin isteme, af dile") denir ve Python'da <code>hasattr</code> ile önceden sormaktan (LBYL) genellikle daha deyimseldir.</p>

<h2>Ne zaman kompozisyon?</h2>
<p>Kalıtım "<b>bir</b> ... dır" (is-a), kompozisyon "<b>bir ... sahiptir</b>" (has-a) ilişkisidir. Çoklu kalıtım cazip gelse de şu durumlarda kompozisyonu seç:</p>
<div class="tbl-wrap"><table>
<tr><th>Durum</th><th>Tercih</th><th>Neden</th></tr>
<tr><td>Küçük, durumsuz yetenek (JSON, log, karşılaştırma)</td><td>Mixin</td><td>Kod tekrarı yok, MRO basit</td></tr>
<tr><td>Davranış çalışma anında değişecek (SMS mi e-posta mı)</td><td>Kompozisyon</td><td>Nesneyi değiştirmek sınıf değiştirmekten kolay</td></tr>
<tr><td>Parça kendi durumunu taşıyor (adres, sepet)</td><td>Kompozisyon</td><td>Yaşam döngüleri ayrı</td></tr>
<tr><td>Aynı yetenekten iki tane gerekiyor (iki adres)</td><td>Kompozisyon</td><td>Bir sınıftan iki kez kalıtım alınamaz</td></tr>
<tr><td>Çerçeve (Django, unittest) sınıf bekliyor</td><td>Kalıtım + mixin</td><td>Çerçevenin sözleşmesi</td></tr>
</table></div>

<div class="note"><b>Gerçek işte</b>Kurumsal Python projelerinde sık görülen bir kod inceleme yorumu: "Bu mixin neden kendi <code>__init__</code>'inde <code>super()</code> çağırmıyor?" İşbirliğini bozan tek bir sınıf, zincirin geri kalanını sessizce devre dışı bırakır ve hata ancak belirli bir sınıf bileşiminde ortaya çıkar. Ekipler bu yüzden mixin'leri durumsuz tutar, <code>__mro__</code>'yu testte doğrular ve kalıtım derinliğini sınırlar.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>super() perde arkasında</h3>
<p>Argümansız <code>super()</code>, derleyicinin eklediği <code>__class__</code> hücresi ve metodun ilk argümanı (<code>self</code>) ile <code>super(SuAnkiSinif, self)</code>'e dönüşür. Bu nesne <code>type(self).__mro__</code>'yu alır, <code>SuAnkiSinif</code>'ı bulur ve aramaya ondan <b>sonraki</b> sınıftan başlar. Bu yüzden aynı satır, farklı nesnelerde farklı sınıflara gidebilir. <code>super(Vadeli, self).kaydet()</code> biçimi hâlâ geçerlidir ama yalnız bir sınıfı bilerek atlamak istediğinde kullanılır.</p>
<h3>Mixin ile ABC birlikte</h3>
<p>Mixin'in ev sahibinden beklediği metodu belgelemek yetmezse <code>abc.abstractmethod</code> ile zorunlu kılabilirsin; ya da tip denetleyicileri için <code>typing.Protocol</code> tanımlarsın (İleri OOP dersinde). <code>isinstance(x, JsonMixin)</code> sorgusu çalışır ama duck typing ruhuna aykırıdır; yeteneği kullanmayı dene, yoksa hatayı yakala.</p>
<h3>PCAP için hızlı kontrol listesi</h3>
<ul>
<li><code>issubclass(D, A)</code> dolaylı atalar için de True'dur; <code>D.__bases__</code> yalnız doğrudan üstleri gösterir.</li>
<li>Aynı adlı nitelik hem sınıf değişkeni hem metot olarak farklı üstlerde varsa MRO'da önce gelen kazanır; türü önemli değildir.</li>
<li>Tutarsız MRO, sınıf <b>tanımlanırken</b> TypeError verir; nesne oluşturulurken değil.</li>
<li>Tüm sınıflar örtük olarak <code>object</code>'ten türer; <code>class A:</code> ile <code>class A(object):</code> Python 3'te aynıdır.</li>
</ul>
</section>
'''

ex = []
ex += [
{'t': 'mc', 'stage': 'Isınma',
 'q': '<code>class C(A, B): pass</code> tanımında A ve B\'nin ikisi de <code>rapor()</code> metodu tanımlıyor (ortak atası object). <code>C().rapor()</code> hangisini çalıştırır?',
 'o': ['B\'ninkini, çünkü sonra yazılan üst sınıf öncekini ezer', 'A\'nınkini, çünkü MRO soldan sağa ilerler', 'İkisini de yazılış sırasıyla çalıştırır', 'Hiçbirini; TypeError: belirsiz metot adı'], 'a': 1,
 'why': 'MRO C, A, B, object sırasıdır; arama ilk bulduğu yerde durur. Python ikisini birden çalıştırmaz; zincirleme ancak metotlar super() çağırırsa olur.'},
{'t': 'mc', 'stage': 'Isınma',
 'q': 'Çoklu kalıtımda bir metodun içindeki <code>super().kaydet()</code> çağrısı hangi sınıfın <code>kaydet</code> metoduna gider?',
 'o': ['Her zaman metodun yazıldığı sınıfın ilk yazılan üst sınıfına', 'Her zaman doğrudan object sınıfına, ara sınıfları atlayarak', 'Nesnenin MRO\'sunda, bulunulan sınıftan sonra gelen sınıfa', 'Elmas yapısındaki ortak ata sınıfa, kardeşleri atlayarak'], 'a': 2,
 'why': 'super() "üst sınıf" değil, nesnenin MRO\'sunda sıradaki sınıf demektir. Bu yüzden aynı satır, nesnenin türüne göre farklı bir kardeş sınıfa gidebilir; işbirlikçi kalıtım buna dayanır.'},
{'t': 'mc', 'stage': 'Isınma',
 'q': 'Aşağıdakilerden hangisi iyi tasarlanmış bir <b>mixin</b>\'i en iyi tanımlar?',
 'o': ['Tüm iş mantığını içeren ana taban sınıf', 'Tek bir yeteneği ekleyen, tek başına örneklenmeyen küçük sınıf', 'Yalnız soyut metotlardan oluşan arayüz', 'Başka sınıfların nesnelerini içinde tutan kap sınıf'], 'a': 1,
 'why': 'Mixin tek bir yeteneği (JSON, log, karşılaştırma) ekler ve başka sınıflarla birlikte kullanılmak üzere tasarlanır. Soyut arayüz ABC\'dir; nesneleri içinde tutmak ise kompozisyondur.'},
]
ex += [
{'t': 'predict', 'stage': 'Kodu oku', 'q': 'Bu kod ne yazdırır?',
 'code': C('''
class A: pass
class B(A): pass
class C(A): pass
class D(B, C): pass
print([k.__name__ for k in D.__mro__])
'''),
 'o': ["['D', 'B', 'A', 'C', 'object']", "['D', 'B', 'C', 'A', 'object']", "['D', 'C', 'B', 'A', 'object']", "['D', 'B', 'C', 'object']"], 'a': 1,
 'why': 'C3 kuralı: çocuk her zaman atasından önce gelir. A, hem B\'nin hem C\'nin atası olduğu için ikisinden de sonra, bir kez yer alır. Derinlik öncelikli arama (D, B, A, C) bu kuralı bozardı.'},
{'t': 'predict', 'stage': 'Kodu oku', 'q': 'Bu kod ne yazdırır?',
 'code': C('''
class A:
    def selam(self):
        print("A")

class B(A):
    def selam(self):
        print("B")
        super().selam()

class C(A):
    def selam(self):
        print("C")
        super().selam()

class D(B, C):
    def selam(self):
        print("D")
        super().selam()

D().selam()
'''),
 'o': ['D\nB\nA', 'D\nB\nA\nC\nA', 'D\nB\nC\nA', 'D\nC\nB\nA'], 'a': 2,
 'why': 'MRO D, B, C, A. B\'deki super() D nesnesi için A\'ya değil C\'ye gider; C\'deki super() A\'ya. Her sınıf bir kez çalışır.'},
{'t': 'predict', 'stage': 'Kodu oku', 'q': 'Bu kod ne yazdırır?', 'raises': True,
 'code': C('''
class Hesap: pass
class Vadeli(Hesap): pass
class Ozel(Hesap, Vadeli): pass
print("tanımlandı")
'''),
 'o': ['tanımlandı', 'TypeError hatası verir', 'AttributeError hatası verir', 'RecursionError hatası verir'], 'a': 1,
 'why': 'Ozel(Hesap, Vadeli) "Hesap, Vadeli\'den önce" der; oysa Vadeli Hesap\'ın çocuğudur ve ondan önce gelmelidir. C3 tutarlı bir sıra bulamaz ve sınıf tanımlanırken TypeError (Cannot create a consistent MRO) verir.'},
{'t': 'order', 'stage': 'Kodu oku',
 'q': '<p>Her sınıfın kendi etiketini ekleyip <code>super()</code> ile zinciri sürdürdüğü programın satırlarını sırala. Çıktı <code>Vadeli>Hesap>Kayit</code> olmalı.</p>',
 'lines': ['class Kayit:', '    def etiket(self): return "Kayit"', 'class Hesap(Kayit):', '    def etiket(self): return "Hesap>" + super().etiket()', 'class Vadeli(Hesap):', '    def etiket(self): return "Vadeli>" + super().etiket()', 'print(Vadeli().etiket())'],
 'expect': 'Vadeli>Hesap>Kayit\n',
 'hint': 'Bir sınıf, üst sınıfı tanımlandıktan sonra yazılabilir; zinciri sonlandıran metot super() çağırmaz.',
 'why': 'super().etiket() MRO\'da sıradaki sınıfa gider: Vadeli → Hesap → Kayit. Kayit zinciri bitirir çünkü object\'te etiket yoktur; o da super() çağırsaydı AttributeError alırdın.'},
]
ex += [
{'t': 'code', 'stage': 'Rehberli', 'id': 'coklu-kalitim-1', 'diff': 1,
 'q': '<p><code>JsonMixin</code> yaz: <code>to_json(self)</code> nesnenin sözlüğünü (<code>vars</code>) <b>alt çizgiyle başlayan anahtarlar hariç</b>, <code>ensure_ascii=False</code> ve <code>sort_keys=True</code> ile JSON metnine çevirsin. Sonra <code>Musteri(ad, sehir)</code> sınıfını bu mixin\'le tanımla.</p>',
 'guide': ['json modülünü içe aktar.', 'JsonMixin içinde to_json metodunu yaz.', 'vars(self) üzerinde gezip alt çizgiyle başlamayanlardan yeni bir sözlük kur.', 'json.dumps(..., ensure_ascii=False, sort_keys=True) döndür.', 'class Musteri(JsonMixin) ile kurucuyu yaz.'],
 'example': C('''
class SozlukMixin:
    def sozluk(self):
        return {k: v for k, v in vars(self).items() if v is not None}

class Adres(SozlukMixin):
    def __init__(self, il, ilce=None):
        self.il, self.ilce = il, ilce

print(Adres("Bursa").sozluk())
'''),
 'start': C('''
import json

class JsonMixin:
    def to_json(self):
        # TODO: alt çizgili anahtarları atla, json.dumps ile döndür
        pass

# TODO: class Musteri(JsonMixin) ... __init__(self, ad, sehir)
'''),
 'sol': C('''
import json

class JsonMixin:
    def to_json(self):
        veri = {k: v for k, v in vars(self).items() if not k.startswith("_")}
        return json.dumps(veri, ensure_ascii=False, sort_keys=True)

class Musteri(JsonMixin):
    def __init__(self, ad, sehir):
        self.ad = ad
        self.sehir = sehir
'''),
 'tests': C('''
m = Musteri("Ayşe", "İzmir")
m._parola = "gizli"
assert m.to_json() == '{"ad": "Ayşe", "sehir": "İzmir"}', f"beklenen JSON farklı: {m.to_json()}"
assert JsonMixin in Musteri.__mro__, "Musteri JsonMixin'den türemeli"
class Urun(JsonMixin):
    def __init__(self):
        self.fiyat = 10
        self.ad = "Çay"
assert Urun().to_json() == '{"ad": "Çay", "fiyat": 10}', "mixin başka sınıflarda da çalışmalı (sort_keys)"
'''),
 'hints': ['Kavram: mixin, vars(self) ile ev sahibinin verisine erişir.', 'Sözlük kavrayışı: {k: v for k, v in vars(self).items() if not k.startswith("_")}', 'return json.dumps(veri, ensure_ascii=False, sort_keys=True)'],
 'why': 'Mixin ev sahibi sınıfın ne olduğunu bilmeden vars(self) üzerinden çalışır; bu yüzden her sınıfa eklenebilir. Alt çizgili alanları atlamak iç ayrıntıların (parola, önbellek) dışarı sızmasını önler.'},
{'t': 'code', 'stage': 'Rehberli', 'id': 'coklu-kalitim-2', 'diff': 2,
 'q': '<p>İşbirlikçi kurucular yaz. Her sınıf kendi parametresini <b>yalnız-anahtar</b> olarak alsın ve kalanını <code>super().__init__(**kwargs)</code> ile iletsin:</p><ul><li><code>Kayit</code>: <code>kimlik</code></li><li><code>ZamanDamgasiMixin</code>: <code>tarih</code> (varsayılan <code>"2026-01-01"</code>)</li><li><code>SahipMixin</code>: <code>sahip</code></li><li><code>Belge(ZamanDamgasiMixin, SahipMixin, Kayit)</code>: <code>baslik</code></li></ul><p><code>Belge(kimlik="B-1", sahip="İK", baslik="Sözleşme")</code> tüm alanları kurmalı.</p>',
 'guide': ['Kayit.__init__(self, *, kimlik, **kwargs): super().__init__(**kwargs), sonra self.kimlik.', 'İki mixin\'i aynı kalıpla yaz; tarih için varsayılan değer ver.', 'Belge\'nin kurucusu baslik\'i alıp kalanını super()\'ye iletsin.', 'Hiçbir sınıf başka bir sınıfı adıyla çağırmasın.'],
 'example': C('''
class Renkli:
    def __init__(self, *, renk="mavi", **kw):
        super().__init__(**kw)
        self.renk = renk

class Boyutlu:
    def __init__(self, *, boyut, **kw):
        super().__init__(**kw)
        self.boyut = boyut

class Kutu(Renkli, Boyutlu):
    pass

print(vars(Kutu(boyut="L")))
'''),
 'start': C('''
class Kayit:
    def __init__(self, *, kimlik, **kwargs):
        # TODO: zinciri sürdür, sonra kimliği ata
        self.kimlik = kimlik


class ZamanDamgasiMixin:
    # TODO
    pass


class SahipMixin:
    # TODO
    pass


class Belge(ZamanDamgasiMixin, SahipMixin, Kayit):
    def __init__(self, *, baslik, **kwargs):
        # TODO
        self.baslik = baslik
'''),
 'sol': C('''
class Kayit:
    def __init__(self, *, kimlik, **kwargs):
        super().__init__(**kwargs)
        self.kimlik = kimlik


class ZamanDamgasiMixin:
    def __init__(self, *, tarih="2026-01-01", **kwargs):
        super().__init__(**kwargs)
        self.tarih = tarih


class SahipMixin:
    def __init__(self, *, sahip, **kwargs):
        super().__init__(**kwargs)
        self.sahip = sahip


class Belge(ZamanDamgasiMixin, SahipMixin, Kayit):
    def __init__(self, *, baslik, **kwargs):
        super().__init__(**kwargs)
        self.baslik = baslik
'''),
 'tests': C('''
b = Belge(kimlik="B-1", sahip="İK", baslik="Sözleşme")
assert vars(b) == {"kimlik": "B-1", "sahip": "İK", "tarih": "2026-01-01", "baslik": "Sözleşme"}, f"tüm alanlar kurulmalı: {vars(b)}"
b2 = Belge(kimlik="B-2", sahip="Finans", baslik="Fatura", tarih="2026-03-10")
assert b2.tarih == "2026-03-10", "tarih adla verilince kullanılmalı"
try:
    Belge(kimlik="B-3", sahip="X", baslik="Y", fazla=1)
    assert False, "bilinmeyen argüman zincirin sonunda object'e ulaşıp TypeError vermeli"
except TypeError:
    pass
try:
    Belge("B-4", "X", "Y")
    assert False, "konumsal argüman kabul edilmemeli (yalnız-anahtar)"
except TypeError:
    pass
'''),
 'hints': ['Kavram: her sınıf kendi parçasını alır, gerisini super()\'ye iletir.', 'Mixin kalıbı: def __init__(self, *, sahip, **kwargs): super().__init__(**kwargs); self.sahip = sahip', 'Kayit ve Belge\'ye de super().__init__(**kwargs) satırını ekle.'],
 'why': 'MRO Belge → ZamanDamgasi → Sahip → Kayit → object. Her kurucu kendi anahtarını kwargs\'tan çıkarır ve kalanını iletir; object\'e boş sözlük ulaşır. Fazladan bir anahtar object.__init__\'e kadar gider ve TypeError ile yakalanır: sessiz yazım hatası kalmaz.'},
{'t': 'code', 'stage': 'Rehberli', 'id': 'coklu-kalitim-3', 'diff': 2,
 'q': '<p><code>KarsilastirmaMixin</code> yaz: ev sahibi sınıf <code>_anahtar()</code> metodu sağlar; mixin bu anahtara göre <code>__eq__</code> ve <code>__lt__</code> tanımlasın (diğer nesne mixin\'den değilse <code>NotImplemented</code> döndürsün) ve <code>functools.total_ordering</code> ile kalan karşılaştırmalar türesin. Sonra <code>Calisan(ad, maas)</code> sınıfını maaşa göre karşılaştırılacak biçimde yaz.</p>',
 'guide': ['from functools import total_ordering', 'Mixin\'i @total_ordering ile süsle.', '__eq__ ve __lt__ içinde önce isinstance(other, KarsilastirmaMixin) kontrolü yap.', 'Karşılaştırmayı self._anahtar() ve other._anahtar() ile yap.', 'Calisan._anahtar maaşı döndürsün.'],
 'example': C('''
from functools import total_ordering

@total_ordering
class Surum:
    def __init__(self, metin):
        self.parca = tuple(int(x) for x in metin.split("."))
    def __eq__(self, o):
        return self.parca == o.parca
    def __lt__(self, o):
        return self.parca < o.parca

print(Surum("3.12.1") > Surum("3.9.0"))
'''),
 'start': C('''
from functools import total_ordering

@total_ordering
class KarsilastirmaMixin:
    def __eq__(self, other):
        # TODO
        pass

    def __lt__(self, other):
        # TODO
        pass


class Calisan(KarsilastirmaMixin):
    def __init__(self, ad, maas):
        self.ad = ad
        self.maas = maas
    # TODO: _anahtar
'''),
 'sol': C('''
from functools import total_ordering

@total_ordering
class KarsilastirmaMixin:
    def __eq__(self, other):
        if not isinstance(other, KarsilastirmaMixin):
            return NotImplemented
        return self._anahtar() == other._anahtar()

    def __lt__(self, other):
        if not isinstance(other, KarsilastirmaMixin):
            return NotImplemented
        return self._anahtar() < other._anahtar()


class Calisan(KarsilastirmaMixin):
    def __init__(self, ad, maas):
        self.ad = ad
        self.maas = maas

    def _anahtar(self):
        return self.maas
'''),
 'tests': C('''
a, b, c = Calisan("Elif", 42000), Calisan("Can", 38000), Calisan("Deniz", 42000)
assert [x.ad for x in sorted([a, b, c])] == ["Can", "Elif", "Deniz"], "maaşa göre artan sıralanmalı (eşitlerde sıra korunur)"
assert a == c and a != b, "eşit maaş eşit sayılmalı"
assert a >= c and b <= a and a > b, "total_ordering diğer karşılaştırmaları türetmeli"
assert max([a, b]).ad == "Elif", "max çalışmalı"
assert (a == 42000) is False, "farklı türle karşılaştırmada NotImplemented döndürülmeli; sonuç False"
try:
    a < 5
    assert False, "sayıyla < karşılaştırması TypeError vermeli"
except TypeError:
    pass
'''),
 'hints': ['Kavram: mixin, ev sahibinin _anahtar() sözleşmesine dayanır.', 'if not isinstance(other, KarsilastirmaMixin): return NotImplemented', 'return self._anahtar() < other._anahtar(); Calisan\'da def _anahtar(self): return self.maas'],
 'why': 'Mixin karşılaştırma mantığını bir kez yazar; ev sahibi yalnız neye göre karşılaştırılacağını söyler. NotImplemented döndürmek Python\'a "öbür tarafa sor" der; iki taraf da bilmiyorsa == False, < ise TypeError olur.'},
]
ex += [
{'t': 'code', 'stage': 'Kendin yaz', 'id': 'coklu-kalitim-4', 'diff': 2,
 'q': '<p>İki iç gözlem fonksiyonu yaz:</p><ul><li><code>mro_adlari(cls)</code>: sınıfın MRO\'sundaki adlar, <code>object</code> hariç, liste olarak.</li><li><code>ilk_tanimlayan(cls, ad)</code>: MRO sırasıyla gezip <code>ad</code>\'ı <b>kendi</b> <code>__dict__</code>\'inde tanımlayan ilk sınıfın adını döndürsün; hiçbiri tanımlamıyorsa <code>None</code>.</li></ul>',
 'start': C('''
def mro_adlari(cls):
    pass


def ilk_tanimlayan(cls, ad):
    pass
'''),
 'sol': C('''
def mro_adlari(cls):
    return [k.__name__ for k in cls.__mro__ if k is not object]


def ilk_tanimlayan(cls, ad):
    for k in cls.__mro__:
        if ad in vars(k):
            return k.__name__
    return None
'''),
 'tests': C('''
class Hesap:
    def kaydet(self): pass
    def rapor(self): pass
class Vadeli(Hesap):
    def kaydet(self): pass
class Dovizli(Hesap):
    def rapor(self): pass
class DV(Vadeli, Dovizli):
    pass
assert mro_adlari(DV) == ["DV", "Vadeli", "Dovizli", "Hesap"], f"MRO yanlış: {mro_adlari(DV)}"
assert ilk_tanimlayan(DV, "kaydet") == "Vadeli", "kaydet ilk Vadeli'de bulunur"
assert ilk_tanimlayan(DV, "rapor") == "Dovizli", "rapor Hesap'tan önce Dovizli'de bulunur (elmas)"
assert ilk_tanimlayan(DV, "yok_boyle") is None, "bulunamazsa None"
assert ilk_tanimlayan(DV, "__repr__") == "object", "object da aramaya dahil (yalnız mro_adlari'ndan çıkarılır)"
'''),
 'hints': ['cls.__mro__ demetini gez; k is object olanı listeye alma.', 'ilk_tanimlayan: if ad in vars(k): return k.__name__'],
 'why': 'Python\'un nitelik araması tam olarak ilk_tanimlayan\'ın yaptığıdır: MRO boyunca her sınıfın kendi sözlüğüne bakmak. rapor için Hesap değil Dovizli kazanır, çünkü elmasta ortak ata en sondadır.'},
{'t': 'code', 'stage': 'Kendin yaz', 'id': 'coklu-kalitim-5', 'diff': 2,
 'q': '<p><code>LogMixin</code> yaz: <code>log(self, mesaj)</code> nesnenin <code>kayitlar</code> listesine <code>"[SinifAdi] mesaj"</code> eklesin. Liste ilk log çağrısında oluşsun (mixin kurucu tanımlamasın). Sonra <code>Siparis(no)</code> sınıfını <code>LogMixin</code> ile yaz: <code>onayla()</code> durumu <code>"onaylı"</code> yapıp <code>"AM-101 onaylandı"</code> biçiminde loglasın; <code>iptal(neden)</code> durumu <code>"iptal"</code> yapıp <code>"AM-101 iptal: neden"</code> loglasın. Başlangıç durumu <code>"yeni"</code>.</p>',
 'start': C('''
class LogMixin:
    pass


class Siparis(LogMixin):
    pass
'''),
 'sol': C('''
class LogMixin:
    def log(self, mesaj):
        if not hasattr(self, "kayitlar"):
            self.kayitlar = []
        self.kayitlar.append(f"[{type(self).__name__}] {mesaj}")


class Siparis(LogMixin):
    def __init__(self, no):
        self.no = no
        self.durum = "yeni"

    def onayla(self):
        self.durum = "onaylı"
        self.log(f"{self.no} onaylandı")

    def iptal(self, neden):
        self.durum = "iptal"
        self.log(f"{self.no} iptal: {neden}")
'''),
 'tests': C('''
s = Siparis("AM-101")
assert s.durum == "yeni", "başlangıç durumu yeni olmalı"
s.onayla()
s.iptal("stok yok")
assert s.kayitlar == ["[Siparis] AM-101 onaylandı", "[Siparis] AM-101 iptal: stok yok"], f"kayıtlar yanlış: {s.kayitlar}"
assert s.durum == "iptal", "durum iptal olmalı"
s2 = Siparis("AM-102")
s2.onayla()
assert s2.kayitlar == ["[Siparis] AM-102 onaylandı"], "her nesnenin kendi kayıt listesi olmalı"
assert "__init__" not in vars(LogMixin), "mixin kendi kurucusunu tanımlamamalı"
class Iade(LogMixin):
    pass
i = Iade(); i.log("başladı")
assert i.kayitlar == ["[Iade] başladı"], "sınıf adı type(self).__name__ ile gelmeli"
'''),
 'hints': ['Liste yoksa oluştur: if not hasattr(self, "kayitlar"): self.kayitlar = []', 'Sınıf adını sabit yazma; type(self).__name__ kullan.'],
 'why': 'Kurucusu olmayan mixin, ev sahibinin __init__ zincirine hiç karışmaz; durumu tembel (lazy) biçimde ilk kullanımda oluşturur. type(self).__name__ sayesinde aynı mixin her sınıfta doğru etiketi basar.'},
{'t': 'code', 'stage': 'Kendin yaz', 'id': 'coklu-kalitim-6', 'diff': 2,
 'q': '<p>Duck typing: <code>toplam_ucret(kalemler)</code> fonksiyonunu yaz. Her kalemin <code>ucret()</code> metodunu çağırıp toplasın; metodu olmayan kalemleri <b>atlasın</b>. <code>(toplam, atlanan_sayisi)</code> demeti döndürsün; toplam <code>round(..., 2)</code> olsun. Tür kontrolü (<code>isinstance</code>) KULLANMA; EAFP ile <code>AttributeError</code> yakala. Dikkat: <code>ucret()</code> içinde oluşan başka hatalar yutulmamalı.</p>',
 'start': C('''
def toplam_ucret(kalemler):
    return 0, 0
'''),
 'sol': C('''
def toplam_ucret(kalemler):
    toplam = 0
    atlanan = 0
    for k in kalemler:
        try:
            metot = k.ucret
        except AttributeError:
            atlanan += 1
            continue
        toplam += metot()
    return round(toplam, 2), atlanan
'''),
 'tests': C('''
class Kargo:
    def __init__(self, desi): self.desi = desi
    def ucret(self): return 30 + self.desi * 4.5
class Sigorta:
    def ucret(self): return 19.99
class Not:
    pass
class Bozuk:
    def ucret(self): return 1 / 0
assert toplam_ucret([Kargo(2), Sigorta(), Not(), "metin"]) == (58.99, 2), f"gelen {toplam_ucret([Kargo(2), Sigorta(), Not(), 'metin'])}"
assert toplam_ucret([]) == (0, 0), "boş liste (0, 0)"
try:
    toplam_ucret([Bozuk()])
    assert False, "ucret() içindeki ZeroDivisionError yutulmamalı"
except ZeroDivisionError:
    pass
assert "isinstance" not in __source__, "isinstance kullanmadan çöz (duck typing)"
'''),
 'hints': ['try bloğunu dar tut: yalnız metodu almayı (k.ucret) dene, çağırmayı try dışında yap.', 'try: metot = k.ucret / except AttributeError: atlanan += 1; continue / toplam += metot()'],
 'why': 'try bloğu yalnız k.ucret erişimini kapsadığı için "metot yok" ile "metot çalışırken hata verdi" ayrılır. Geniş bir try, ucret() içindeki gerçek hataları da "metodu yok" diye yutabilirdi.'},
]
ex += [
{'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'coklu-kalitim-7', 'diff': 2,
 'q': '<p>Lojistik ekibinin sınıflarında <code>Taban.__init__</code> iki kez çalışıyor ve <code>Taban.kurulum</code> sayacı her nesnede 2 artıyor. Üstelik <code>KargoTakip</code>\'in <code>bolge</code> alanı bazen kayboluyor. Hatayı bul ve düzelt: her kurucu tam bir kez çalışmalı, tüm alanlar kurulmalı.</p>',
 'start': C('''
class Taban:
    kurulum = 0
    def __init__(self, **kwargs):
        Taban.kurulum += 1
        self.olusturuldu = True


class Konumlu(Taban):
    def __init__(self, bolge, **kwargs):
        Taban.__init__(self)
        self.bolge = bolge


class Takipli(Taban):
    def __init__(self, takip_no, **kwargs):
        Taban.__init__(self)
        self.takip_no = takip_no


class KargoTakip(Konumlu, Takipli):
    def __init__(self, bolge, takip_no):
        Konumlu.__init__(self, bolge)
        Takipli.__init__(self, takip_no)
'''),
 'sol': C('''
class Taban:
    kurulum = 0
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        Taban.kurulum += 1
        self.olusturuldu = True


class Konumlu(Taban):
    def __init__(self, bolge, **kwargs):
        super().__init__(**kwargs)
        self.bolge = bolge


class Takipli(Taban):
    def __init__(self, takip_no, **kwargs):
        super().__init__(**kwargs)
        self.takip_no = takip_no


class KargoTakip(Konumlu, Takipli):
    def __init__(self, bolge, takip_no):
        super().__init__(bolge=bolge, takip_no=takip_no)
'''),
 'tests': C('''
Taban.kurulum = 0
k = KargoTakip("Marmara", "TR-555")
assert Taban.kurulum == 1, f"Taban kurucusu tam 1 kez çalışmalı, çalıştı: {Taban.kurulum}"
assert (k.bolge, k.takip_no, k.olusturuldu) == ("Marmara", "TR-555", True), "tüm alanlar kurulmalı"
Taban.kurulum = 0
t = Takipli("TR-1")
assert Taban.kurulum == 1 and t.takip_no == "TR-1", "sınıflar tek başına da çalışmalı"
assert "Taban.__init__" not in __source__ and "Konumlu.__init__" not in __source__, "üst sınıfları adıyla çağırma; super() kullan"
'''),
 'hints': ['Kurucuları adıyla çağırmak (Taban.__init__(self)) MRO zincirini atlar.', 'Her sınıfta super().__init__(**kwargs) kullan; KargoTakip tüm parametreleri ADLA iletsin: super().__init__(bolge=bolge, takip_no=takip_no).'],
 'why': 'KargoTakip iki üstünü ayrı ayrı çağırınca her biri Taban\'ı da çağırır: ortak ata iki kez kurulur. super() zincirinde MRO KargoTakip → Konumlu → Takipli → Taban sırasıyla her kurucu bir kez çalışır; parametreler kwargs içinde doğru sınıfa ulaşır.'},
{'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'coklu-kalitim-8', 'diff': 2,
 'q': '<p>Anadolu Market\'in ürün deposuna önbellek eklendi ama veritabanı hâlâ her çağrıda sorgulanıyor (<code>sorgu_sayisi</code> artmaya devam ediyor). Hatayı bul ve düzelt; mixin ve depo kodunun mantığını değiştirmeden çözülebilir.</p>',
 'start': C('''
class OnbellekMixin:
    def getir(self, anahtar):
        if not hasattr(self, "_onbellek"):
            self._onbellek = {}
        if anahtar not in self._onbellek:
            self._onbellek[anahtar] = super().getir(anahtar)
        return self._onbellek[anahtar]


class UrunDeposu:
    def __init__(self):
        self.sorgu_sayisi = 0
        self._veri = {"U1": "Termos", "U2": "Kalem"}

    def getir(self, anahtar):
        self.sorgu_sayisi += 1
        return self._veri.get(anahtar)


class HizliDepo(UrunDeposu, OnbellekMixin):
    pass
'''),
 'sol': C('''
class OnbellekMixin:
    def getir(self, anahtar):
        if not hasattr(self, "_onbellek"):
            self._onbellek = {}
        if anahtar not in self._onbellek:
            self._onbellek[anahtar] = super().getir(anahtar)
        return self._onbellek[anahtar]


class UrunDeposu:
    def __init__(self):
        self.sorgu_sayisi = 0
        self._veri = {"U1": "Termos", "U2": "Kalem"}

    def getir(self, anahtar):
        self.sorgu_sayisi += 1
        return self._veri.get(anahtar)


class HizliDepo(OnbellekMixin, UrunDeposu):
    pass
'''),
 'tests': C('''
d = HizliDepo()
assert d.getir("U1") == "Termos" and d.getir("U1") == "Termos" and d.getir("U2") == "Kalem", "değerler doğru gelmeli"
assert d.sorgu_sayisi == 2, f"U1 ikinci kez önbellekten gelmeli; 2 sorgu bekleniyordu, olan: {d.sorgu_sayisi}"
assert HizliDepo.__mro__[1] is OnbellekMixin, "mixin MRO'da depodan önce gelmeli"
'''),
 'hints': ['HizliDepo.__mro__\'yu yazdır: getir ilk hangi sınıfta bulunuyor?', 'Mixin\'ler solda, taban sınıf sağda: class HizliDepo(OnbellekMixin, UrunDeposu)'],
 'why': 'MRO HizliDepo → UrunDeposu → OnbellekMixin olduğunda getir ilk depoda bulunur ve mixin hiç çalışmaz. Mixin\'i sola almak onu öne koyar; mixin\'deki super().getir() de MRO\'da sıradaki UrunDeposu\'na gider.'},
]
ex += [
{'t': 'code', 'stage': 'Meydan okuma', 'id': 'coklu-kalitim-9', 'diff': 3,
 'q': '<p>C3 doğrusallaştırmayı kendin uygula. <code>c3(sinif, ustler)</code> fonksiyonu; <code>ustler</code> her sınıf adını doğrudan üst sınıf adlarının listesine eşleyen bir sözlük (<code>{"D": ["B", "C"], "B": ["A"], "C": ["A"], "A": []}</code>). Fonksiyon <code>sinif</code> için MRO\'yu ad listesi olarak döndürsün (object yok). Tutarlı sıra yoksa <code>TypeError("tutarsız MRO")</code> fırlatsın.</p><p>Algoritma: <code>L[X] = [X] + birleştir(L[U1], L[U2], ..., [U1, U2, ...])</code>. Birleştirmede listelerin başlarından, hiçbir listenin kuyruğunda (ilk eleman hariç kısmında) geçmeyen ilk adayı seç, sonuca ekle, tüm listelerden çıkar; listeler boşalana dek tekrarla.</p>',
 'start': C('''
def c3(sinif, ustler):
    return [sinif]
'''),
 'sol': C('''
def c3(sinif, ustler):
    def birlestir(listeler):
        listeler = [l[:] for l in listeler if l]
        sonuc = []
        while listeler:
            for liste in listeler:
                aday = liste[0]
                if not any(aday in l[1:] for l in listeler):
                    break
            else:
                raise TypeError("tutarsız MRO")
            sonuc.append(aday)
            listeler = [[x for x in l if x != aday] for l in listeler]
            listeler = [l for l in listeler if l]
        return sonuc

    def L(x):
        u = ustler.get(x, [])
        return [x] + birlestir([L(b) for b in u] + [list(u)])

    return L(sinif)
'''),
 'tests': C('''
h = {"D": ["B", "C"], "B": ["A"], "C": ["A"], "A": []}
assert c3("D", h) == ["D", "B", "C", "A"], f"elmas: {c3('D', h)}"
h2 = {"Z": ["K1", "K2", "K3"], "K1": ["A", "B", "C"], "K2": ["D", "B", "E"], "K3": ["D", "A"], "A": [], "B": [], "C": [], "D": [], "E": []}
assert c3("Z", h2) == ["Z", "K1", "K2", "K3", "D", "A", "B", "C", "E"], f"Wikipedia örneği: {c3('Z', h2)}"
try:
    c3("X", {"X": ["A", "B"], "B": ["A"], "A": []})
    assert False, "X(A, B) ve B(A) tutarsız: TypeError beklenir"
except TypeError as e:
    assert str(e) == "tutarsız MRO"
# Python ile karşılaştır
class A: pass
class B(A): pass
class C(A): pass
class E(C, B): pass
assert c3("E", {"E": ["C", "B"], "B": ["A"], "C": ["A"], "A": []}) == [k.__name__ for k in E.__mro__][:-1], "Python'un MRO'su ile aynı olmalı"
'''),
 'hints': ['İki iç fonksiyon yaz: L(x) özyinelemeli doğrusallaştırma, birlestir(listeler) ise birleştirme.', 'Aday kontrolü: not any(aday in l[1:] for l in listeler). for-else ile aday bulunamazsa TypeError.', 'Adayı seçince tüm listelerden çıkar ve boşalan listeleri at.'],
 'why': 'C3, çocuk-önce ve yerel sıra kurallarını aynı anda gözeten bir birleştirmedir. Bir aday başka bir listenin kuyruğundaysa, o listede kendisinden önce gelmesi gereken bir sınıf vardır; bu yüzden beklemesi gerekir. Hiçbir aday seçilemiyorsa kısıtlar çelişir.'},
{'t': 'code', 'stage': 'Meydan okuma', 'id': 'coklu-kalitim-10', 'diff': 3,
 'q': '<p>Form doğrulamayı işbirlikçi mixin\'lerle kur. Taban <code>Dogrulayici.dogrula(self)</code> boş liste döndürür. Her mixin <code>dogrula</code>\'yı ezip <b>önce kendi hatalarını</b> ekler, sonra <code>super().dogrula()</code> sonucunu sona ekleyip döndürür:</p><ul><li><code>ZorunluMixin</code>: sınıf niteliği <code>ZORUNLU</code> (ad demeti) içindeki her alan boş/None ise <code>"&lt;alan&gt; zorunlu"</code></li><li><code>EpostaMixin</code>: <code>self.eposta</code> doluysa ve tam bir <code>@</code> içermiyor ya da <code>@</code>\'den sonra nokta yoksa <code>"eposta geçersiz"</code></li><li><code>TelefonMixin</code>: <code>self.telefon</code> doluysa boşluklar atıldıktan sonra 10 haneli ve <code>5</code> ile başlayan rakam dizisi değilse <code>"telefon geçersiz"</code></li></ul><p>Son olarak <code>BasvuruFormu(ZorunluMixin, EpostaMixin, TelefonMixin, Dogrulayici)</code> yaz: <code>ZORUNLU = ("ad", "eposta")</code>, kurucusu <code>ad, eposta, telefon=None</code> alsın.</p>',
 'start': C('''
class Dogrulayici:
    def dogrula(self):
        return []


class ZorunluMixin:
    ZORUNLU = ()


class EpostaMixin:
    pass


class TelefonMixin:
    pass


class BasvuruFormu(ZorunluMixin, EpostaMixin, TelefonMixin, Dogrulayici):
    ZORUNLU = ("ad", "eposta")

    def __init__(self, ad, eposta, telefon=None):
        self.ad, self.eposta, self.telefon = ad, eposta, telefon
'''),
 'sol': C('''
class Dogrulayici:
    def dogrula(self):
        return []


class ZorunluMixin:
    ZORUNLU = ()

    def dogrula(self):
        hatalar = [f"{a} zorunlu" for a in self.ZORUNLU if not getattr(self, a, None)]
        return hatalar + super().dogrula()


class EpostaMixin:
    def dogrula(self):
        hatalar = []
        e = getattr(self, "eposta", None)
        if e:
            parca = e.split("@")
            if len(parca) != 2 or "." not in parca[1]:
                hatalar.append("eposta geçersiz")
        return hatalar + super().dogrula()


class TelefonMixin:
    def dogrula(self):
        hatalar = []
        t = getattr(self, "telefon", None)
        if t:
            t = t.replace(" ", "")
            if not (len(t) == 10 and t.isdigit() and t[0] == "5"):
                hatalar.append("telefon geçersiz")
        return hatalar + super().dogrula()


class BasvuruFormu(ZorunluMixin, EpostaMixin, TelefonMixin, Dogrulayici):
    ZORUNLU = ("ad", "eposta")

    def __init__(self, ad, eposta, telefon=None):
        self.ad, self.eposta, self.telefon = ad, eposta, telefon
'''),
 'tests': C('''
assert BasvuruFormu("Ayşe", "ayse@ornek.com", "532 111 22 33").dogrula() == [], "geçerli form hatasız olmalı"
assert BasvuruFormu("", "ayse@ornek", "432").dogrula() == ["ad zorunlu", "eposta geçersiz", "telefon geçersiz"], f"sıra MRO'ya uymalı: {BasvuruFormu('', 'ayse@ornek', '432').dogrula()}"
assert BasvuruFormu("Can", None).dogrula() == ["eposta zorunlu"], "boş e-posta yalnız zorunlu hatası vermeli"
assert BasvuruFormu("Can", "a@@b.com").dogrula() == ["eposta geçersiz"], "iki @ geçersiz"
class SadeceTelefon(TelefonMixin, Dogrulayici):
    telefon = "5321112233x"
assert SadeceTelefon().dogrula() == ["telefon geçersiz"], "mixin'ler bağımsız da kullanılabilmeli"
'''),
 'hints': ['Her mixin kalıbı: hatalar = [...kendi kontrolleri...]; return hatalar + super().dogrula()', 'Zorunlu: [f"{a} zorunlu" for a in self.ZORUNLU if not getattr(self, a, None)]', 'Telefonu kontrol etmeden önce replace(" ", ""), sonra len == 10, isdigit, t[0] == "5".'],
 'why': 'Her mixin kendi kuralını uygular ve zinciri sürdürür; hataların sırası MRO\'yu izler. Yeni bir kural eklemek yeni bir mixin yazıp sınıf tanımına eklemek kadar kolaydır ve mevcut kod değişmez (açık/kapalı ilkesi).'},
]
ex += [
{'t': 'code', 'stage': 'Mini proje', 'id': 'coklu-kalitim-11', 'diff': 3,
 'q': '<p><b>Anadolu Market personel sistemi.</b></p><ol><li><code>Calisan</code>: yalnız-anahtar <code>ad</code>, <code>maas</code>; <code>prim()</code> 0 döndürür; <code>__repr__</code> <code>"SinifAdi(ad)"</code> biçiminde (<code>type(self).__name__</code>).</li><li><code>Yonetici(Calisan)</code>: ek <code>ekip</code> (kişi sayısı); <code>prim()</code> = ekip * 1000 + <code>super().prim()</code>.</li><li><code>Teknik(Calisan)</code>: ek <code>sertifika</code> (adet); <code>prim()</code> = sertifika * 500 + <code>super().prim()</code>.</li><li><code>TeknikYonetici(Yonetici, Teknik)</code>: ek kod yazmadan iki primi de alsın.</li><li><code>JsonMixin</code>: <code>to_json()</code> → <code>vars(self)</code>\'e <code>"prim": self.prim()</code> ve <code>"tur": SinifAdi</code> eklenmiş, <code>sort_keys=True, ensure_ascii=False</code> JSON. Tüm sınıflar bunu kullanabilsin (Calisan\'a karıştır).</li><li><code>bordro(calisanlar)</code>: <code>[(ad, maas + prim), ...]</code> listesini toplam ödemeye göre <b>azalan</b> sırala.</li></ol><p>Kurucular işbirlikçi olmalı: <code>TeknikYonetici(ad="Elif", maas=60000, ekip=4, sertifika=2)</code> çalışmalı.</p>',
 'start': C('''
import json


class JsonMixin:
    pass


class Calisan(JsonMixin):
    pass


class Yonetici(Calisan):
    pass


class Teknik(Calisan):
    pass


class TeknikYonetici(Yonetici, Teknik):
    pass


def bordro(calisanlar):
    return []
'''),
 'sol': C('''
import json


class JsonMixin:
    def to_json(self):
        veri = dict(vars(self))
        veri["prim"] = self.prim()
        veri["tur"] = type(self).__name__
        return json.dumps(veri, sort_keys=True, ensure_ascii=False)


class Calisan(JsonMixin):
    def __init__(self, *, ad, maas, **kwargs):
        super().__init__(**kwargs)
        self.ad = ad
        self.maas = maas

    def prim(self):
        return 0

    def __repr__(self):
        return f"{type(self).__name__}({self.ad})"


class Yonetici(Calisan):
    def __init__(self, *, ekip, **kwargs):
        super().__init__(**kwargs)
        self.ekip = ekip

    def prim(self):
        return self.ekip * 1000 + super().prim()


class Teknik(Calisan):
    def __init__(self, *, sertifika, **kwargs):
        super().__init__(**kwargs)
        self.sertifika = sertifika

    def prim(self):
        return self.sertifika * 500 + super().prim()


class TeknikYonetici(Yonetici, Teknik):
    pass


def bordro(calisanlar):
    satirlar = [(c.ad, c.maas + c.prim()) for c in calisanlar]
    return sorted(satirlar, key=lambda s: s[1], reverse=True)
'''),
 'tests': C('''
e = TeknikYonetici(ad="Elif", maas=60000, ekip=4, sertifika=2)
assert e.prim() == 5000, f"4*1000 + 2*500 = 5000 olmalı, gelen {e.prim()}"
assert [k.__name__ for k in TeknikYonetici.__mro__][:4] == ["TeknikYonetici", "Yonetici", "Teknik", "Calisan"], "MRO beklenen sırada olmalı"
assert repr(e) == "TeknikYonetici(Elif)", f"repr yanlış: {e!r}"
y = Yonetici(ad="Can", maas=50000, ekip=3)
t = Teknik(ad="Deniz", maas=45000, sertifika=6)
c = Calisan(ad="Ece", maas=30000)
assert (y.prim(), t.prim(), c.prim()) == (3000, 3000, 0), "tekil primler yanlış"
j = json.loads(t.to_json())
assert j == {"ad": "Deniz", "maas": 45000, "sertifika": 6, "prim": 3000, "tur": "Teknik"}, f"JSON yanlış: {j}"
assert '"tur": "TeknikYonetici"' in e.to_json(), "tur alanı alt sınıf adını göstermeli"
assert bordro([c, y, e, t]) == [("Elif", 65000), ("Can", 53000), ("Deniz", 48000), ("Ece", 30000)], f"bordro yanlış: {bordro([c, y, e, t])}"
assert "prim" not in vars(e), "to_json nesnenin kendi sözlüğünü değiştirmemeli (kopya kullan)"
'''),
 'hints': ['Her kurucu: def __init__(self, *, kendi_param, **kwargs): super().__init__(**kwargs); self.kendi_param = ...', 'prim zinciri: return self.ekip * 1000 + super().prim(). TeknikYonetici\'de Yonetici\'nin super()\'si Teknik\'e gider.', 'to_json içinde veri = dict(vars(self)) ile kopya al, sonra prim ve tur ekle.'],
 'why': 'İşbirlikçi kurucular ve prim zinciri sayesinde TeknikYonetici tek satır kod yazmadan iki yeteneği de birleştirir: MRO TeknikYonetici → Yonetici → Teknik → Calisan, her prim bir kez eklenir. Mixin ise tüm hiyerarşiye ortak bir yetenek ekler; vars(self)\'in kopyası alınarak nesnenin durumu korunur.'},
]

lesson = {
 'id': 'coklu-kalitim', 'lv': 'orta', 'mod': 'Nesne Yönelimli Programlama', 'min': 45,
 'title': 'Çoklu kalıtım, MRO ve mixin\'ler',
 'sum': 'Birden fazla üst sınıftan kalıtımı, elmas problemini, C3 ile MRO hesaplamayı, super() zincirini ve **kwargs ile işbirlikçi kurucuları, JSON/log/karşılaştırma mixin\'leri tasarlamayı ve duck typing ile kompozisyonu ne zaman seçeceğini öğrenirsin.',
 'goals': [
  'Bir sınıfın MRO\'sunu C3 kurallarıyla tahmin eder, __mro__ ile doğrulayabilirim.',
  'super()\'nün MRO\'da sıradaki sınıfı çağırdığını açıklar, işbirlikçi metot zinciri kurabilirim.',
  '**kwargs ve yalnız-anahtar parametrelerle çoklu kalıtımda kurucuları doğru zincirleyebilirim.',
  'Tek sorumluluklu mixin\'ler (JSON, log, karşılaştırma) yazıp doğru sırayla karıştırabilirim.',
  'Duck typing ile polimorfik kod yazar, kalıtım yerine kompozisyonu ne zaman seçeceğime karar verebilirim.'
 ],
 'body': body, 'ex': ex,
 'faq': [
  {'q': 'Çoklu kalıtım kötü bir uygulama mı?', 'a': 'Hayır, ama disiplin ister. Python standart kütüphanesi ve büyük çerçeveler (Django, socketserver) mixin\'leri yoğun kullanır. Sorun, birden fazla "durumlu" ve "büyük" üst sınıfı birleştirmektir. Kural: bir ana taban sınıf + küçük, durumsuz mixin\'ler.'},
  {'q': 'Mixin neden solda yazılıyor?', 'a': 'MRO soldan sağa ilerler. Mixin\'in metodu taban sınıfınkinden önce bulunmalı ki onu sarabilsin (önbellek, log) ve super() ile tabana devredebilsin. Mixin sağda olursa taban sınıfın metodu önce bulunur ve mixin hiç çalışmaz.'},
  {'q': 'object.__init__ fazladan argüman alırsa ne olur?', 'a': 'TypeError: object.__init__() takes exactly one argument. Bu aslında faydalıdır: işbirlikçi zincirde hiçbir sınıfın tüketmediği bir anahtar (yazım hatası) sona ulaşır ve sessizce kaybolmak yerine hata verir.'},
  {'q': 'mro() ile __mro__ farkı nedir?', 'a': '__mro__ sınıf oluşturulurken hesaplanan ve saklanan demettir. mro() bunu hesaplayan metottur ve liste döndürür; metasınıflar ezebilir. Günlük kullanımda ikisi aynı sırayı verir.'}
 ],
 'mistakes': [
  {'bad': C('''
class Konumlu(Taban):
    def __init__(self, bolge):
        Taban.__init__(self)
'''), 'good': C('''
class Konumlu(Taban):
    def __init__(self, bolge, **kw):
        super().__init__(**kw)
'''), 'why': 'Üst sınıfı adıyla çağırmak MRO\'yu atlar; elmasta ortak ata iki kez çalışır ya da kardeş sınıf hiç çalışmaz.'},
  {'bad': 'class HizliDepo(UrunDeposu, OnbellekMixin): pass', 'good': 'class HizliDepo(OnbellekMixin, UrunDeposu): pass', 'why': 'Mixin sağda kalırsa taban sınıfın metodu önce bulunur ve mixin\'in davranışı hiç devreye girmez.'},
  {'bad': C('''
class LogMixin:
    def __init__(self):
        self.kayitlar = []
'''), 'good': C('''
class LogMixin:
    def __init__(self, **kw):
        super().__init__(**kw)
        self.kayitlar = []
'''), 'why': 'super() çağırmayan mixin kurucusu zinciri koparır; MRO\'da ondan sonraki sınıfların __init__\'i hiç çalışmaz.'},
  {'bad': 'class Ozel(Hesap, Vadeli): ...   # Vadeli(Hesap)', 'good': 'class Ozel(Vadeli, Hesap): ...   # ya da yalnız Vadeli', 'why': 'Ata sınıfı çocuğundan önce yazmak C3 ile çelişir ve sınıf tanımı TypeError verir; zaten Vadeli Hesap\'ı içerdiği için Hesap\'ı yazmak gereksizdir.'}
 ]
}

emit(lesson, '/home/claude/py/v2/o2/coklu-kalitim.js')
