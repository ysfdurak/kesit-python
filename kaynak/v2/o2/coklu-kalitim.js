/* Kesit Python — v2 o2: coklu-kalitim */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{
  id: 'coklu-kalitim',
  lv: 'orta',
  mod: 'Nesne Yönelimli Programlama',
  min: 45,
  title: 'Çoklu kalıtım, MRO ve mixin\'ler',
  sum: 'Birden fazla üst sınıftan kalıtımı, elmas problemini, C3 ile MRO hesaplamayı, super() zincirini ve **kwargs ile işbirlikçi kurucuları, JSON/log/karşılaştırma mixin\'leri tasarlamayı ve duck typing ile kompozisyonu ne zaman seçeceğini öğrenirsin.',
  goals: [
    'Bir sınıfın MRO\'sunu C3 kurallarıyla tahmin eder, __mro__ ile doğrulayabilirim.',
    'super()\'nün MRO\'da sıradaki sınıfı çağırdığını açıklar, işbirlikçi metot zinciri kurabilirim.',
    '**kwargs ve yalnız-anahtar parametrelerle çoklu kalıtımda kurucuları doğru zincirleyebilirim.',
    'Tek sorumluluklu mixin\'ler (JSON, log, karşılaştırma) yazıp doğru sırayla karıştırabilirim.',
    'Duck typing ile polimorfik kod yazar, kalıtım yerine kompozisyonu ne zaman seçeceğime karar verebilirim.'
  ],
  body: `
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
`,
  ex: [
    {
      t: 'mc',
      stage: 'Isınma',
      q: '<code>class C(A, B): pass</code> tanımında A ve B\'nin ikisi de <code>rapor()</code> metodu tanımlıyor (ortak atası object). <code>C().rapor()</code> hangisini çalıştırır?',
      o: ['B\'ninkini, çünkü sonra yazılan üst sınıf öncekini ezer', 'A\'nınkini, çünkü MRO soldan sağa ilerler', 'İkisini de yazılış sırasıyla çalıştırır', 'Hiçbirini; TypeError: belirsiz metot adı'],
      a: 1,
      why: 'MRO C, A, B, object sırasıdır; arama ilk bulduğu yerde durur. Python ikisini birden çalıştırmaz; zincirleme ancak metotlar super() çağırırsa olur.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Çoklu kalıtımda bir metodun içindeki <code>super().kaydet()</code> çağrısı hangi sınıfın <code>kaydet</code> metoduna gider?',
      o: [
        'Her zaman metodun yazıldığı sınıfın ilk yazılan üst sınıfına',
        'Her zaman doğrudan object sınıfına, ara sınıfları atlayarak',
        'Nesnenin MRO\'sunda, bulunulan sınıftan sonra gelen sınıfa',
        'Elmas yapısındaki ortak ata sınıfa, kardeşleri atlayarak'
      ],
      a: 2,
      why: 'super() "üst sınıf" değil, nesnenin MRO\'sunda sıradaki sınıf demektir. Bu yüzden aynı satır, nesnenin türüne göre farklı bir kardeş sınıfa gidebilir; işbirlikçi kalıtım buna dayanır.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Aşağıdakilerden hangisi iyi tasarlanmış bir <b>mixin</b>\'i en iyi tanımlar?',
      o: ['Tüm iş mantığını içeren ana taban sınıf', 'Tek bir yeteneği ekleyen, tek başına örneklenmeyen küçük sınıf', 'Yalnız soyut metotlardan oluşan arayüz', 'Başka sınıfların nesnelerini içinde tutan kap sınıf'],
      a: 1,
      why: 'Mixin tek bir yeteneği (JSON, log, karşılaştırma) ekler ve başka sınıflarla birlikte kullanılmak üzere tasarlanır. Soyut arayüz ABC\'dir; nesneleri içinde tutmak ise kompozisyondur.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'class A: pass\nclass B(A): pass\nclass C(A): pass\nclass D(B, C): pass\nprint([k.__name__ for k in D.__mro__])\n',
      o: ['[\'D\', \'B\', \'A\', \'C\', \'object\']', '[\'D\', \'B\', \'C\', \'A\', \'object\']', '[\'D\', \'C\', \'B\', \'A\', \'object\']', '[\'D\', \'B\', \'C\', \'object\']'],
      a: 1,
      why: 'C3 kuralı: çocuk her zaman atasından önce gelir. A, hem B\'nin hem C\'nin atası olduğu için ikisinden de sonra, bir kez yer alır. Derinlik öncelikli arama (D, B, A, C) bu kuralı bozardı.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'class A:\n    def selam(self):\n        print("A")\n\nclass B(A):\n    def selam(self):\n        print("B")\n        super().selam()\n\nclass C(A):\n    def selam(self):\n        print("C")\n        super().selam()\n\nclass D(B, C):\n    def selam(self):\n        print("D")\n        super().selam()\n\nD().selam()\n',
      o: ['D\nB\nA', 'D\nB\nA\nC\nA', 'D\nB\nC\nA', 'D\nC\nB\nA'],
      a: 2,
      why: 'MRO D, B, C, A. B\'deki super() D nesnesi için A\'ya değil C\'ye gider; C\'deki super() A\'ya. Her sınıf bir kez çalışır.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'class Hesap: pass\nclass Vadeli(Hesap): pass\nclass Ozel(Hesap, Vadeli): pass\nprint("tanımlandı")\n',
      o: ['tanımlandı', 'TypeError hatası verir', 'AttributeError hatası verir', 'RecursionError hatası verir'],
      a: 1,
      raises: true,
      why: 'Ozel(Hesap, Vadeli) "Hesap, Vadeli\'den önce" der; oysa Vadeli Hesap\'ın çocuğudur ve ondan önce gelmelidir. C3 tutarlı bir sıra bulamaz ve sınıf tanımlanırken TypeError (Cannot create a consistent MRO) verir.'
    },
    {
      t: 'order',
      stage: 'Kodu oku',
      q: '<p>Her sınıfın kendi etiketini ekleyip <code>super()</code> ile zinciri sürdürdüğü programın satırlarını sırala. Çıktı <code>Vadeli>Hesap>Kayit</code> olmalı.</p>',
      lines: [
        'class Kayit:',
        '    def etiket(self): return "Kayit"',
        'class Hesap(Kayit):',
        '    def etiket(self): return "Hesap>" + super().etiket()',
        'class Vadeli(Hesap):',
        '    def etiket(self): return "Vadeli>" + super().etiket()',
        'print(Vadeli().etiket())'
      ],
      expect: 'Vadeli>Hesap>Kayit\n',
      hint: 'Bir sınıf, üst sınıfı tanımlandıktan sonra yazılabilir; zinciri sonlandıran metot super() çağırmaz.',
      why: 'super().etiket() MRO\'da sıradaki sınıfa gider: Vadeli → Hesap → Kayit. Kayit zinciri bitirir çünkü object\'te etiket yoktur; o da super() çağırsaydı AttributeError alırdın.'
    },
    {
      id: 'coklu-kalitim-1',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p><code>JsonMixin</code> yaz: <code>to_json(self)</code> nesnenin sözlüğünü (<code>vars</code>) <b>alt çizgiyle başlayan anahtarlar hariç</b>, <code>ensure_ascii=False</code> ve <code>sort_keys=True</code> ile JSON metnine çevirsin. Sonra <code>Musteri(ad, sehir)</code> sınıfını bu mixin\'le tanımla.</p>',
      guide: [
        'json modülünü içe aktar.',
        'JsonMixin içinde to_json metodunu yaz.',
        'vars(self) üzerinde gezip alt çizgiyle başlamayanlardan yeni bir sözlük kur.',
        'json.dumps(..., ensure_ascii=False, sort_keys=True) döndür.',
        'class Musteri(JsonMixin) ile kurucuyu yaz.'
      ],
      example: 'class SozlukMixin:\n    def sozluk(self):\n        return {k: v for k, v in vars(self).items() if v is not None}\n\nclass Adres(SozlukMixin):\n    def __init__(self, il, ilce=None):\n        self.il, self.ilce = il, ilce\n\nprint(Adres("Bursa").sozluk())\n',
      start: 'import json\n\nclass JsonMixin:\n    def to_json(self):\n        # TODO: alt çizgili anahtarları atla, json.dumps ile döndür\n        pass\n\n# TODO: class Musteri(JsonMixin) ... __init__(self, ad, sehir)\n',
      sol: 'import json\n\nclass JsonMixin:\n    def to_json(self):\n        veri = {k: v for k, v in vars(self).items() if not k.startswith("_")}\n        return json.dumps(veri, ensure_ascii=False, sort_keys=True)\n\nclass Musteri(JsonMixin):\n    def __init__(self, ad, sehir):\n        self.ad = ad\n        self.sehir = sehir\n',
      tests: 'm = Musteri("Ayşe", "İzmir")\nm._parola = "gizli"\nassert m.to_json() == \'{"ad": "Ayşe", "sehir": "İzmir"}\', f"beklenen JSON farklı: {m.to_json()}"\nassert JsonMixin in Musteri.__mro__, "Musteri JsonMixin\'den türemeli"\nclass Urun(JsonMixin):\n    def __init__(self):\n        self.fiyat = 10\n        self.ad = "Çay"\nassert Urun().to_json() == \'{"ad": "Çay", "fiyat": 10}\', "mixin başka sınıflarda da çalışmalı (sort_keys)"\n',
      hints: ['Kavram: mixin, vars(self) ile ev sahibinin verisine erişir.', 'Sözlük kavrayışı: {k: v for k, v in vars(self).items() if not k.startswith("_")}', 'return json.dumps(veri, ensure_ascii=False, sort_keys=True)'],
      why: 'Mixin ev sahibi sınıfın ne olduğunu bilmeden vars(self) üzerinden çalışır; bu yüzden her sınıfa eklenebilir. Alt çizgili alanları atlamak iç ayrıntıların (parola, önbellek) dışarı sızmasını önler.'
    },
    {
      id: 'coklu-kalitim-2',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>İşbirlikçi kurucular yaz. Her sınıf kendi parametresini <b>yalnız-anahtar</b> olarak alsın ve kalanını <code>super().__init__(**kwargs)</code> ile iletsin:</p><ul><li><code>Kayit</code>: <code>kimlik</code></li><li><code>ZamanDamgasiMixin</code>: <code>tarih</code> (varsayılan <code>"2026-01-01"</code>)</li><li><code>SahipMixin</code>: <code>sahip</code></li><li><code>Belge(ZamanDamgasiMixin, SahipMixin, Kayit)</code>: <code>baslik</code></li></ul><p><code>Belge(kimlik="B-1", sahip="İK", baslik="Sözleşme")</code> tüm alanları kurmalı.</p>',
      guide: [
        'Kayit.__init__(self, *, kimlik, **kwargs): super().__init__(**kwargs), sonra self.kimlik.',
        'İki mixin\'i aynı kalıpla yaz; tarih için varsayılan değer ver.',
        'Belge\'nin kurucusu baslik\'i alıp kalanını super()\'ye iletsin.',
        'Hiçbir sınıf başka bir sınıfı adıyla çağırmasın.'
      ],
      example: 'class Renkli:\n    def __init__(self, *, renk="mavi", **kw):\n        super().__init__(**kw)\n        self.renk = renk\n\nclass Boyutlu:\n    def __init__(self, *, boyut, **kw):\n        super().__init__(**kw)\n        self.boyut = boyut\n\nclass Kutu(Renkli, Boyutlu):\n    pass\n\nprint(vars(Kutu(boyut="L")))\n',
      start: 'class Kayit:\n    def __init__(self, *, kimlik, **kwargs):\n        # TODO: zinciri sürdür, sonra kimliği ata\n        self.kimlik = kimlik\n\n\nclass ZamanDamgasiMixin:\n    # TODO\n    pass\n\n\nclass SahipMixin:\n    # TODO\n    pass\n\n\nclass Belge(ZamanDamgasiMixin, SahipMixin, Kayit):\n    def __init__(self, *, baslik, **kwargs):\n        # TODO\n        self.baslik = baslik\n',
      sol: 'class Kayit:\n    def __init__(self, *, kimlik, **kwargs):\n        super().__init__(**kwargs)\n        self.kimlik = kimlik\n\n\nclass ZamanDamgasiMixin:\n    def __init__(self, *, tarih="2026-01-01", **kwargs):\n        super().__init__(**kwargs)\n        self.tarih = tarih\n\n\nclass SahipMixin:\n    def __init__(self, *, sahip, **kwargs):\n        super().__init__(**kwargs)\n        self.sahip = sahip\n\n\nclass Belge(ZamanDamgasiMixin, SahipMixin, Kayit):\n    def __init__(self, *, baslik, **kwargs):\n        super().__init__(**kwargs)\n        self.baslik = baslik\n',
      tests: 'b = Belge(kimlik="B-1", sahip="İK", baslik="Sözleşme")\nassert vars(b) == {"kimlik": "B-1", "sahip": "İK", "tarih": "2026-01-01", "baslik": "Sözleşme"}, f"tüm alanlar kurulmalı: {vars(b)}"\nb2 = Belge(kimlik="B-2", sahip="Finans", baslik="Fatura", tarih="2026-03-10")\nassert b2.tarih == "2026-03-10", "tarih adla verilince kullanılmalı"\ntry:\n    Belge(kimlik="B-3", sahip="X", baslik="Y", fazla=1)\n    assert False, "bilinmeyen argüman zincirin sonunda object\'e ulaşıp TypeError vermeli"\nexcept TypeError:\n    pass\ntry:\n    Belge("B-4", "X", "Y")\n    assert False, "konumsal argüman kabul edilmemeli (yalnız-anahtar)"\nexcept TypeError:\n    pass\n',
      hints: [
        'Kavram: her sınıf kendi parçasını alır, gerisini super()\'ye iletir.',
        'Mixin kalıbı: def __init__(self, *, sahip, **kwargs): super().__init__(**kwargs); self.sahip = sahip',
        'Kayit ve Belge\'ye de super().__init__(**kwargs) satırını ekle.'
      ],
      why: 'MRO Belge → ZamanDamgasi → Sahip → Kayit → object. Her kurucu kendi anahtarını kwargs\'tan çıkarır ve kalanını iletir; object\'e boş sözlük ulaşır. Fazladan bir anahtar object.__init__\'e kadar gider ve TypeError ile yakalanır: sessiz yazım hatası kalmaz.'
    },
    {
      id: 'coklu-kalitim-3',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p><code>KarsilastirmaMixin</code> yaz: ev sahibi sınıf <code>_anahtar()</code> metodu sağlar; mixin bu anahtara göre <code>__eq__</code> ve <code>__lt__</code> tanımlasın (diğer nesne mixin\'den değilse <code>NotImplemented</code> döndürsün) ve <code>functools.total_ordering</code> ile kalan karşılaştırmalar türesin. Sonra <code>Calisan(ad, maas)</code> sınıfını maaşa göre karşılaştırılacak biçimde yaz.</p>',
      guide: [
        'from functools import total_ordering',
        'Mixin\'i @total_ordering ile süsle.',
        '__eq__ ve __lt__ içinde önce isinstance(other, KarsilastirmaMixin) kontrolü yap.',
        'Karşılaştırmayı self._anahtar() ve other._anahtar() ile yap.',
        'Calisan._anahtar maaşı döndürsün.'
      ],
      example: 'from functools import total_ordering\n\n@total_ordering\nclass Surum:\n    def __init__(self, metin):\n        self.parca = tuple(int(x) for x in metin.split("."))\n    def __eq__(self, o):\n        return self.parca == o.parca\n    def __lt__(self, o):\n        return self.parca < o.parca\n\nprint(Surum("3.12.1") > Surum("3.9.0"))\n',
      start: 'from functools import total_ordering\n\n@total_ordering\nclass KarsilastirmaMixin:\n    def __eq__(self, other):\n        # TODO\n        pass\n\n    def __lt__(self, other):\n        # TODO\n        pass\n\n\nclass Calisan(KarsilastirmaMixin):\n    def __init__(self, ad, maas):\n        self.ad = ad\n        self.maas = maas\n    # TODO: _anahtar\n',
      sol: 'from functools import total_ordering\n\n@total_ordering\nclass KarsilastirmaMixin:\n    def __eq__(self, other):\n        if not isinstance(other, KarsilastirmaMixin):\n            return NotImplemented\n        return self._anahtar() == other._anahtar()\n\n    def __lt__(self, other):\n        if not isinstance(other, KarsilastirmaMixin):\n            return NotImplemented\n        return self._anahtar() < other._anahtar()\n\n\nclass Calisan(KarsilastirmaMixin):\n    def __init__(self, ad, maas):\n        self.ad = ad\n        self.maas = maas\n\n    def _anahtar(self):\n        return self.maas\n',
      tests: 'a, b, c = Calisan("Elif", 42000), Calisan("Can", 38000), Calisan("Deniz", 42000)\nassert [x.ad for x in sorted([a, b, c])] == ["Can", "Elif", "Deniz"], "maaşa göre artan sıralanmalı (eşitlerde sıra korunur)"\nassert a == c and a != b, "eşit maaş eşit sayılmalı"\nassert a >= c and b <= a and a > b, "total_ordering diğer karşılaştırmaları türetmeli"\nassert max([a, b]).ad == "Elif", "max çalışmalı"\nassert (a == 42000) is False, "farklı türle karşılaştırmada NotImplemented döndürülmeli; sonuç False"\ntry:\n    a < 5\n    assert False, "sayıyla < karşılaştırması TypeError vermeli"\nexcept TypeError:\n    pass\n',
      hints: [
        'Kavram: mixin, ev sahibinin _anahtar() sözleşmesine dayanır.',
        'if not isinstance(other, KarsilastirmaMixin): return NotImplemented',
        'return self._anahtar() < other._anahtar(); Calisan\'da def _anahtar(self): return self.maas'
      ],
      why: 'Mixin karşılaştırma mantığını bir kez yazar; ev sahibi yalnız neye göre karşılaştırılacağını söyler. NotImplemented döndürmek Python\'a "öbür tarafa sor" der; iki taraf da bilmiyorsa == False, < ise TypeError olur.'
    },
    {
      id: 'coklu-kalitim-4',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>İki iç gözlem fonksiyonu yaz:</p><ul><li><code>mro_adlari(cls)</code>: sınıfın MRO\'sundaki adlar, <code>object</code> hariç, liste olarak.</li><li><code>ilk_tanimlayan(cls, ad)</code>: MRO sırasıyla gezip <code>ad</code>\'ı <b>kendi</b> <code>__dict__</code>\'inde tanımlayan ilk sınıfın adını döndürsün; hiçbiri tanımlamıyorsa <code>None</code>.</li></ul>',
      start: 'def mro_adlari(cls):\n    pass\n\n\ndef ilk_tanimlayan(cls, ad):\n    pass\n',
      sol: 'def mro_adlari(cls):\n    return [k.__name__ for k in cls.__mro__ if k is not object]\n\n\ndef ilk_tanimlayan(cls, ad):\n    for k in cls.__mro__:\n        if ad in vars(k):\n            return k.__name__\n    return None\n',
      tests: 'class Hesap:\n    def kaydet(self): pass\n    def rapor(self): pass\nclass Vadeli(Hesap):\n    def kaydet(self): pass\nclass Dovizli(Hesap):\n    def rapor(self): pass\nclass DV(Vadeli, Dovizli):\n    pass\nassert mro_adlari(DV) == ["DV", "Vadeli", "Dovizli", "Hesap"], f"MRO yanlış: {mro_adlari(DV)}"\nassert ilk_tanimlayan(DV, "kaydet") == "Vadeli", "kaydet ilk Vadeli\'de bulunur"\nassert ilk_tanimlayan(DV, "rapor") == "Dovizli", "rapor Hesap\'tan önce Dovizli\'de bulunur (elmas)"\nassert ilk_tanimlayan(DV, "yok_boyle") is None, "bulunamazsa None"\nassert ilk_tanimlayan(DV, "__repr__") == "object", "object da aramaya dahil (yalnız mro_adlari\'ndan çıkarılır)"\n',
      hints: ['cls.__mro__ demetini gez; k is object olanı listeye alma.', 'ilk_tanimlayan: if ad in vars(k): return k.__name__'],
      why: 'Python\'un nitelik araması tam olarak ilk_tanimlayan\'ın yaptığıdır: MRO boyunca her sınıfın kendi sözlüğüne bakmak. rapor için Hesap değil Dovizli kazanır, çünkü elmasta ortak ata en sondadır.'
    },
    {
      id: 'coklu-kalitim-5',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p><code>LogMixin</code> yaz: <code>log(self, mesaj)</code> nesnenin <code>kayitlar</code> listesine <code>"[SinifAdi] mesaj"</code> eklesin. Liste ilk log çağrısında oluşsun (mixin kurucu tanımlamasın). Sonra <code>Siparis(no)</code> sınıfını <code>LogMixin</code> ile yaz: <code>onayla()</code> durumu <code>"onaylı"</code> yapıp <code>"AM-101 onaylandı"</code> biçiminde loglasın; <code>iptal(neden)</code> durumu <code>"iptal"</code> yapıp <code>"AM-101 iptal: neden"</code> loglasın. Başlangıç durumu <code>"yeni"</code>.</p>',
      start: 'class LogMixin:\n    pass\n\n\nclass Siparis(LogMixin):\n    pass\n',
      sol: 'class LogMixin:\n    def log(self, mesaj):\n        if not hasattr(self, "kayitlar"):\n            self.kayitlar = []\n        self.kayitlar.append(f"[{type(self).__name__}] {mesaj}")\n\n\nclass Siparis(LogMixin):\n    def __init__(self, no):\n        self.no = no\n        self.durum = "yeni"\n\n    def onayla(self):\n        self.durum = "onaylı"\n        self.log(f"{self.no} onaylandı")\n\n    def iptal(self, neden):\n        self.durum = "iptal"\n        self.log(f"{self.no} iptal: {neden}")\n',
      tests: 's = Siparis("AM-101")\nassert s.durum == "yeni", "başlangıç durumu yeni olmalı"\ns.onayla()\ns.iptal("stok yok")\nassert s.kayitlar == ["[Siparis] AM-101 onaylandı", "[Siparis] AM-101 iptal: stok yok"], f"kayıtlar yanlış: {s.kayitlar}"\nassert s.durum == "iptal", "durum iptal olmalı"\ns2 = Siparis("AM-102")\ns2.onayla()\nassert s2.kayitlar == ["[Siparis] AM-102 onaylandı"], "her nesnenin kendi kayıt listesi olmalı"\nassert "__init__" not in vars(LogMixin), "mixin kendi kurucusunu tanımlamamalı"\nclass Iade(LogMixin):\n    pass\ni = Iade(); i.log("başladı")\nassert i.kayitlar == ["[Iade] başladı"], "sınıf adı type(self).__name__ ile gelmeli"\n',
      hints: ['Liste yoksa oluştur: if not hasattr(self, "kayitlar"): self.kayitlar = []', 'Sınıf adını sabit yazma; type(self).__name__ kullan.'],
      why: 'Kurucusu olmayan mixin, ev sahibinin __init__ zincirine hiç karışmaz; durumu tembel (lazy) biçimde ilk kullanımda oluşturur. type(self).__name__ sayesinde aynı mixin her sınıfta doğru etiketi basar.'
    },
    {
      id: 'coklu-kalitim-6',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Duck typing: <code>toplam_ucret(kalemler)</code> fonksiyonunu yaz. Her kalemin <code>ucret()</code> metodunu çağırıp toplasın; metodu olmayan kalemleri <b>atlasın</b>. <code>(toplam, atlanan_sayisi)</code> demeti döndürsün; toplam <code>round(..., 2)</code> olsun. Tür kontrolü (<code>isinstance</code>) KULLANMA; EAFP ile <code>AttributeError</code> yakala. Dikkat: <code>ucret()</code> içinde oluşan başka hatalar yutulmamalı.</p>',
      start: 'def toplam_ucret(kalemler):\n    return 0, 0\n',
      sol: 'def toplam_ucret(kalemler):\n    toplam = 0\n    atlanan = 0\n    for k in kalemler:\n        try:\n            metot = k.ucret\n        except AttributeError:\n            atlanan += 1\n            continue\n        toplam += metot()\n    return round(toplam, 2), atlanan\n',
      tests: 'class Kargo:\n    def __init__(self, desi): self.desi = desi\n    def ucret(self): return 30 + self.desi * 4.5\nclass Sigorta:\n    def ucret(self): return 19.99\nclass Not:\n    pass\nclass Bozuk:\n    def ucret(self): return 1 / 0\nassert toplam_ucret([Kargo(2), Sigorta(), Not(), "metin"]) == (58.99, 2), f"gelen {toplam_ucret([Kargo(2), Sigorta(), Not(), \'metin\'])}"\nassert toplam_ucret([]) == (0, 0), "boş liste (0, 0)"\ntry:\n    toplam_ucret([Bozuk()])\n    assert False, "ucret() içindeki ZeroDivisionError yutulmamalı"\nexcept ZeroDivisionError:\n    pass\nassert "isinstance" not in __source__, "isinstance kullanmadan çöz (duck typing)"\n',
      hints: ['try bloğunu dar tut: yalnız metodu almayı (k.ucret) dene, çağırmayı try dışında yap.', 'try: metot = k.ucret / except AttributeError: atlanan += 1; continue / toplam += metot()'],
      why: 'try bloğu yalnız k.ucret erişimini kapsadığı için "metot yok" ile "metot çalışırken hata verdi" ayrılır. Geniş bir try, ucret() içindeki gerçek hataları da "metodu yok" diye yutabilirdi.'
    },
    {
      id: 'coklu-kalitim-7',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Lojistik ekibinin sınıflarında <code>Taban.__init__</code> iki kez çalışıyor ve <code>Taban.kurulum</code> sayacı her nesnede 2 artıyor. Üstelik <code>KargoTakip</code>\'in <code>bolge</code> alanı bazen kayboluyor. Hatayı bul ve düzelt: her kurucu tam bir kez çalışmalı, tüm alanlar kurulmalı.</p>',
      start: 'class Taban:\n    kurulum = 0\n    def __init__(self, **kwargs):\n        Taban.kurulum += 1\n        self.olusturuldu = True\n\n\nclass Konumlu(Taban):\n    def __init__(self, bolge, **kwargs):\n        Taban.__init__(self)\n        self.bolge = bolge\n\n\nclass Takipli(Taban):\n    def __init__(self, takip_no, **kwargs):\n        Taban.__init__(self)\n        self.takip_no = takip_no\n\n\nclass KargoTakip(Konumlu, Takipli):\n    def __init__(self, bolge, takip_no):\n        Konumlu.__init__(self, bolge)\n        Takipli.__init__(self, takip_no)\n',
      sol: 'class Taban:\n    kurulum = 0\n    def __init__(self, **kwargs):\n        super().__init__(**kwargs)\n        Taban.kurulum += 1\n        self.olusturuldu = True\n\n\nclass Konumlu(Taban):\n    def __init__(self, bolge, **kwargs):\n        super().__init__(**kwargs)\n        self.bolge = bolge\n\n\nclass Takipli(Taban):\n    def __init__(self, takip_no, **kwargs):\n        super().__init__(**kwargs)\n        self.takip_no = takip_no\n\n\nclass KargoTakip(Konumlu, Takipli):\n    def __init__(self, bolge, takip_no):\n        super().__init__(bolge=bolge, takip_no=takip_no)\n',
      tests: 'Taban.kurulum = 0\nk = KargoTakip("Marmara", "TR-555")\nassert Taban.kurulum == 1, f"Taban kurucusu tam 1 kez çalışmalı, çalıştı: {Taban.kurulum}"\nassert (k.bolge, k.takip_no, k.olusturuldu) == ("Marmara", "TR-555", True), "tüm alanlar kurulmalı"\nTaban.kurulum = 0\nt = Takipli("TR-1")\nassert Taban.kurulum == 1 and t.takip_no == "TR-1", "sınıflar tek başına da çalışmalı"\nassert "Taban.__init__" not in __source__ and "Konumlu.__init__" not in __source__, "üst sınıfları adıyla çağırma; super() kullan"\n',
      hints: [
        'Kurucuları adıyla çağırmak (Taban.__init__(self)) MRO zincirini atlar.',
        'Her sınıfta super().__init__(**kwargs) kullan; KargoTakip tüm parametreleri ADLA iletsin: super().__init__(bolge=bolge, takip_no=takip_no).'
      ],
      why: 'KargoTakip iki üstünü ayrı ayrı çağırınca her biri Taban\'ı da çağırır: ortak ata iki kez kurulur. super() zincirinde MRO KargoTakip → Konumlu → Takipli → Taban sırasıyla her kurucu bir kez çalışır; parametreler kwargs içinde doğru sınıfa ulaşır.'
    },
    {
      id: 'coklu-kalitim-8',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p>Anadolu Market\'in ürün deposuna önbellek eklendi ama veritabanı hâlâ her çağrıda sorgulanıyor (<code>sorgu_sayisi</code> artmaya devam ediyor). Hatayı bul ve düzelt; mixin ve depo kodunun mantığını değiştirmeden çözülebilir.</p>',
      start: 'class OnbellekMixin:\n    def getir(self, anahtar):\n        if not hasattr(self, "_onbellek"):\n            self._onbellek = {}\n        if anahtar not in self._onbellek:\n            self._onbellek[anahtar] = super().getir(anahtar)\n        return self._onbellek[anahtar]\n\n\nclass UrunDeposu:\n    def __init__(self):\n        self.sorgu_sayisi = 0\n        self._veri = {"U1": "Termos", "U2": "Kalem"}\n\n    def getir(self, anahtar):\n        self.sorgu_sayisi += 1\n        return self._veri.get(anahtar)\n\n\nclass HizliDepo(UrunDeposu, OnbellekMixin):\n    pass\n',
      sol: 'class OnbellekMixin:\n    def getir(self, anahtar):\n        if not hasattr(self, "_onbellek"):\n            self._onbellek = {}\n        if anahtar not in self._onbellek:\n            self._onbellek[anahtar] = super().getir(anahtar)\n        return self._onbellek[anahtar]\n\n\nclass UrunDeposu:\n    def __init__(self):\n        self.sorgu_sayisi = 0\n        self._veri = {"U1": "Termos", "U2": "Kalem"}\n\n    def getir(self, anahtar):\n        self.sorgu_sayisi += 1\n        return self._veri.get(anahtar)\n\n\nclass HizliDepo(OnbellekMixin, UrunDeposu):\n    pass\n',
      tests: 'd = HizliDepo()\nassert d.getir("U1") == "Termos" and d.getir("U1") == "Termos" and d.getir("U2") == "Kalem", "değerler doğru gelmeli"\nassert d.sorgu_sayisi == 2, f"U1 ikinci kez önbellekten gelmeli; 2 sorgu bekleniyordu, olan: {d.sorgu_sayisi}"\nassert HizliDepo.__mro__[1] is OnbellekMixin, "mixin MRO\'da depodan önce gelmeli"\n',
      hints: ['HizliDepo.__mro__\'yu yazdır: getir ilk hangi sınıfta bulunuyor?', 'Mixin\'ler solda, taban sınıf sağda: class HizliDepo(OnbellekMixin, UrunDeposu)'],
      why: 'MRO HizliDepo → UrunDeposu → OnbellekMixin olduğunda getir ilk depoda bulunur ve mixin hiç çalışmaz. Mixin\'i sola almak onu öne koyar; mixin\'deki super().getir() de MRO\'da sıradaki UrunDeposu\'na gider.'
    },
    {
      id: 'coklu-kalitim-9',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>C3 doğrusallaştırmayı kendin uygula. <code>c3(sinif, ustler)</code> fonksiyonu; <code>ustler</code> her sınıf adını doğrudan üst sınıf adlarının listesine eşleyen bir sözlük (<code>{"D": ["B", "C"], "B": ["A"], "C": ["A"], "A": []}</code>). Fonksiyon <code>sinif</code> için MRO\'yu ad listesi olarak döndürsün (object yok). Tutarlı sıra yoksa <code>TypeError("tutarsız MRO")</code> fırlatsın.</p><p>Algoritma: <code>L[X] = [X] + birleştir(L[U1], L[U2], ..., [U1, U2, ...])</code>. Birleştirmede listelerin başlarından, hiçbir listenin kuyruğunda (ilk eleman hariç kısmında) geçmeyen ilk adayı seç, sonuca ekle, tüm listelerden çıkar; listeler boşalana dek tekrarla.</p>',
      start: 'def c3(sinif, ustler):\n    return [sinif]\n',
      sol: 'def c3(sinif, ustler):\n    def birlestir(listeler):\n        listeler = [l[:] for l in listeler if l]\n        sonuc = []\n        while listeler:\n            for liste in listeler:\n                aday = liste[0]\n                if not any(aday in l[1:] for l in listeler):\n                    break\n            else:\n                raise TypeError("tutarsız MRO")\n            sonuc.append(aday)\n            listeler = [[x for x in l if x != aday] for l in listeler]\n            listeler = [l for l in listeler if l]\n        return sonuc\n\n    def L(x):\n        u = ustler.get(x, [])\n        return [x] + birlestir([L(b) for b in u] + [list(u)])\n\n    return L(sinif)\n',
      tests: 'h = {"D": ["B", "C"], "B": ["A"], "C": ["A"], "A": []}\nassert c3("D", h) == ["D", "B", "C", "A"], f"elmas: {c3(\'D\', h)}"\nh2 = {"Z": ["K1", "K2", "K3"], "K1": ["A", "B", "C"], "K2": ["D", "B", "E"], "K3": ["D", "A"], "A": [], "B": [], "C": [], "D": [], "E": []}\nassert c3("Z", h2) == ["Z", "K1", "K2", "K3", "D", "A", "B", "C", "E"], f"Wikipedia örneği: {c3(\'Z\', h2)}"\ntry:\n    c3("X", {"X": ["A", "B"], "B": ["A"], "A": []})\n    assert False, "X(A, B) ve B(A) tutarsız: TypeError beklenir"\nexcept TypeError as e:\n    assert str(e) == "tutarsız MRO"\n# Python ile karşılaştır\nclass A: pass\nclass B(A): pass\nclass C(A): pass\nclass E(C, B): pass\nassert c3("E", {"E": ["C", "B"], "B": ["A"], "C": ["A"], "A": []}) == [k.__name__ for k in E.__mro__][:-1], "Python\'un MRO\'su ile aynı olmalı"\n',
      hints: [
        'İki iç fonksiyon yaz: L(x) özyinelemeli doğrusallaştırma, birlestir(listeler) ise birleştirme.',
        'Aday kontrolü: not any(aday in l[1:] for l in listeler). for-else ile aday bulunamazsa TypeError.',
        'Adayı seçince tüm listelerden çıkar ve boşalan listeleri at.'
      ],
      why: 'C3, çocuk-önce ve yerel sıra kurallarını aynı anda gözeten bir birleştirmedir. Bir aday başka bir listenin kuyruğundaysa, o listede kendisinden önce gelmesi gereken bir sınıf vardır; bu yüzden beklemesi gerekir. Hiçbir aday seçilemiyorsa kısıtlar çelişir.'
    },
    {
      id: 'coklu-kalitim-10',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Form doğrulamayı işbirlikçi mixin\'lerle kur. Taban <code>Dogrulayici.dogrula(self)</code> boş liste döndürür. Her mixin <code>dogrula</code>\'yı ezip <b>önce kendi hatalarını</b> ekler, sonra <code>super().dogrula()</code> sonucunu sona ekleyip döndürür:</p><ul><li><code>ZorunluMixin</code>: sınıf niteliği <code>ZORUNLU</code> (ad demeti) içindeki her alan boş/None ise <code>"&lt;alan&gt; zorunlu"</code></li><li><code>EpostaMixin</code>: <code>self.eposta</code> doluysa ve tam bir <code>@</code> içermiyor ya da <code>@</code>\'den sonra nokta yoksa <code>"eposta geçersiz"</code></li><li><code>TelefonMixin</code>: <code>self.telefon</code> doluysa boşluklar atıldıktan sonra 10 haneli ve <code>5</code> ile başlayan rakam dizisi değilse <code>"telefon geçersiz"</code></li></ul><p>Son olarak <code>BasvuruFormu(ZorunluMixin, EpostaMixin, TelefonMixin, Dogrulayici)</code> yaz: <code>ZORUNLU = ("ad", "eposta")</code>, kurucusu <code>ad, eposta, telefon=None</code> alsın.</p>',
      start: 'class Dogrulayici:\n    def dogrula(self):\n        return []\n\n\nclass ZorunluMixin:\n    ZORUNLU = ()\n\n\nclass EpostaMixin:\n    pass\n\n\nclass TelefonMixin:\n    pass\n\n\nclass BasvuruFormu(ZorunluMixin, EpostaMixin, TelefonMixin, Dogrulayici):\n    ZORUNLU = ("ad", "eposta")\n\n    def __init__(self, ad, eposta, telefon=None):\n        self.ad, self.eposta, self.telefon = ad, eposta, telefon\n',
      sol: 'class Dogrulayici:\n    def dogrula(self):\n        return []\n\n\nclass ZorunluMixin:\n    ZORUNLU = ()\n\n    def dogrula(self):\n        hatalar = [f"{a} zorunlu" for a in self.ZORUNLU if not getattr(self, a, None)]\n        return hatalar + super().dogrula()\n\n\nclass EpostaMixin:\n    def dogrula(self):\n        hatalar = []\n        e = getattr(self, "eposta", None)\n        if e:\n            parca = e.split("@")\n            if len(parca) != 2 or "." not in parca[1]:\n                hatalar.append("eposta geçersiz")\n        return hatalar + super().dogrula()\n\n\nclass TelefonMixin:\n    def dogrula(self):\n        hatalar = []\n        t = getattr(self, "telefon", None)\n        if t:\n            t = t.replace(" ", "")\n            if not (len(t) == 10 and t.isdigit() and t[0] == "5"):\n                hatalar.append("telefon geçersiz")\n        return hatalar + super().dogrula()\n\n\nclass BasvuruFormu(ZorunluMixin, EpostaMixin, TelefonMixin, Dogrulayici):\n    ZORUNLU = ("ad", "eposta")\n\n    def __init__(self, ad, eposta, telefon=None):\n        self.ad, self.eposta, self.telefon = ad, eposta, telefon\n',
      tests: 'assert BasvuruFormu("Ayşe", "ayse@ornek.com", "532 111 22 33").dogrula() == [], "geçerli form hatasız olmalı"\nassert BasvuruFormu("", "ayse@ornek", "432").dogrula() == ["ad zorunlu", "eposta geçersiz", "telefon geçersiz"], f"sıra MRO\'ya uymalı: {BasvuruFormu(\'\', \'ayse@ornek\', \'432\').dogrula()}"\nassert BasvuruFormu("Can", None).dogrula() == ["eposta zorunlu"], "boş e-posta yalnız zorunlu hatası vermeli"\nassert BasvuruFormu("Can", "a@@b.com").dogrula() == ["eposta geçersiz"], "iki @ geçersiz"\nclass SadeceTelefon(TelefonMixin, Dogrulayici):\n    telefon = "5321112233x"\nassert SadeceTelefon().dogrula() == ["telefon geçersiz"], "mixin\'ler bağımsız da kullanılabilmeli"\n',
      hints: [
        'Her mixin kalıbı: hatalar = [...kendi kontrolleri...]; return hatalar + super().dogrula()',
        'Zorunlu: [f"{a} zorunlu" for a in self.ZORUNLU if not getattr(self, a, None)]',
        'Telefonu kontrol etmeden önce replace(" ", ""), sonra len == 10, isdigit, t[0] == "5".'
      ],
      why: 'Her mixin kendi kuralını uygular ve zinciri sürdürür; hataların sırası MRO\'yu izler. Yeni bir kural eklemek yeni bir mixin yazıp sınıf tanımına eklemek kadar kolaydır ve mevcut kod değişmez (açık/kapalı ilkesi).'
    },
    {
      id: 'coklu-kalitim-11',
      t: 'code',
      stage: 'Mini proje',
      diff: 3,
      q: '<p><b>Anadolu Market personel sistemi.</b></p><ol><li><code>Calisan</code>: yalnız-anahtar <code>ad</code>, <code>maas</code>; <code>prim()</code> 0 döndürür; <code>__repr__</code> <code>"SinifAdi(ad)"</code> biçiminde (<code>type(self).__name__</code>).</li><li><code>Yonetici(Calisan)</code>: ek <code>ekip</code> (kişi sayısı); <code>prim()</code> = ekip * 1000 + <code>super().prim()</code>.</li><li><code>Teknik(Calisan)</code>: ek <code>sertifika</code> (adet); <code>prim()</code> = sertifika * 500 + <code>super().prim()</code>.</li><li><code>TeknikYonetici(Yonetici, Teknik)</code>: ek kod yazmadan iki primi de alsın.</li><li><code>JsonMixin</code>: <code>to_json()</code> → <code>vars(self)</code>\'e <code>"prim": self.prim()</code> ve <code>"tur": SinifAdi</code> eklenmiş, <code>sort_keys=True, ensure_ascii=False</code> JSON. Tüm sınıflar bunu kullanabilsin (Calisan\'a karıştır).</li><li><code>bordro(calisanlar)</code>: <code>[(ad, maas + prim), ...]</code> listesini toplam ödemeye göre <b>azalan</b> sırala.</li></ol><p>Kurucular işbirlikçi olmalı: <code>TeknikYonetici(ad="Elif", maas=60000, ekip=4, sertifika=2)</code> çalışmalı.</p>',
      start: 'import json\n\n\nclass JsonMixin:\n    pass\n\n\nclass Calisan(JsonMixin):\n    pass\n\n\nclass Yonetici(Calisan):\n    pass\n\n\nclass Teknik(Calisan):\n    pass\n\n\nclass TeknikYonetici(Yonetici, Teknik):\n    pass\n\n\ndef bordro(calisanlar):\n    return []\n',
      sol: 'import json\n\n\nclass JsonMixin:\n    def to_json(self):\n        veri = dict(vars(self))\n        veri["prim"] = self.prim()\n        veri["tur"] = type(self).__name__\n        return json.dumps(veri, sort_keys=True, ensure_ascii=False)\n\n\nclass Calisan(JsonMixin):\n    def __init__(self, *, ad, maas, **kwargs):\n        super().__init__(**kwargs)\n        self.ad = ad\n        self.maas = maas\n\n    def prim(self):\n        return 0\n\n    def __repr__(self):\n        return f"{type(self).__name__}({self.ad})"\n\n\nclass Yonetici(Calisan):\n    def __init__(self, *, ekip, **kwargs):\n        super().__init__(**kwargs)\n        self.ekip = ekip\n\n    def prim(self):\n        return self.ekip * 1000 + super().prim()\n\n\nclass Teknik(Calisan):\n    def __init__(self, *, sertifika, **kwargs):\n        super().__init__(**kwargs)\n        self.sertifika = sertifika\n\n    def prim(self):\n        return self.sertifika * 500 + super().prim()\n\n\nclass TeknikYonetici(Yonetici, Teknik):\n    pass\n\n\ndef bordro(calisanlar):\n    satirlar = [(c.ad, c.maas + c.prim()) for c in calisanlar]\n    return sorted(satirlar, key=lambda s: s[1], reverse=True)\n',
      tests: 'e = TeknikYonetici(ad="Elif", maas=60000, ekip=4, sertifika=2)\nassert e.prim() == 5000, f"4*1000 + 2*500 = 5000 olmalı, gelen {e.prim()}"\nassert [k.__name__ for k in TeknikYonetici.__mro__][:4] == ["TeknikYonetici", "Yonetici", "Teknik", "Calisan"], "MRO beklenen sırada olmalı"\nassert repr(e) == "TeknikYonetici(Elif)", f"repr yanlış: {e!r}"\ny = Yonetici(ad="Can", maas=50000, ekip=3)\nt = Teknik(ad="Deniz", maas=45000, sertifika=6)\nc = Calisan(ad="Ece", maas=30000)\nassert (y.prim(), t.prim(), c.prim()) == (3000, 3000, 0), "tekil primler yanlış"\nj = json.loads(t.to_json())\nassert j == {"ad": "Deniz", "maas": 45000, "sertifika": 6, "prim": 3000, "tur": "Teknik"}, f"JSON yanlış: {j}"\nassert \'"tur": "TeknikYonetici"\' in e.to_json(), "tur alanı alt sınıf adını göstermeli"\nassert bordro([c, y, e, t]) == [("Elif", 65000), ("Can", 53000), ("Deniz", 48000), ("Ece", 30000)], f"bordro yanlış: {bordro([c, y, e, t])}"\nassert "prim" not in vars(e), "to_json nesnenin kendi sözlüğünü değiştirmemeli (kopya kullan)"\n',
      hints: [
        'Her kurucu: def __init__(self, *, kendi_param, **kwargs): super().__init__(**kwargs); self.kendi_param = ...',
        'prim zinciri: return self.ekip * 1000 + super().prim(). TeknikYonetici\'de Yonetici\'nin super()\'si Teknik\'e gider.',
        'to_json içinde veri = dict(vars(self)) ile kopya al, sonra prim ve tur ekle.'
      ],
      why: 'İşbirlikçi kurucular ve prim zinciri sayesinde TeknikYonetici tek satır kod yazmadan iki yeteneği de birleştirir: MRO TeknikYonetici → Yonetici → Teknik → Calisan, her prim bir kez eklenir. Mixin ise tüm hiyerarşiye ortak bir yetenek ekler; vars(self)\'in kopyası alınarak nesnenin durumu korunur.'
    }
  ],
  faq: [
    {
      q: 'Çoklu kalıtım kötü bir uygulama mı?',
      a: 'Hayır, ama disiplin ister. Python standart kütüphanesi ve büyük çerçeveler (Django, socketserver) mixin\'leri yoğun kullanır. Sorun, birden fazla "durumlu" ve "büyük" üst sınıfı birleştirmektir. Kural: bir ana taban sınıf + küçük, durumsuz mixin\'ler.'
    },
    {
      q: 'Mixin neden solda yazılıyor?',
      a: 'MRO soldan sağa ilerler. Mixin\'in metodu taban sınıfınkinden önce bulunmalı ki onu sarabilsin (önbellek, log) ve super() ile tabana devredebilsin. Mixin sağda olursa taban sınıfın metodu önce bulunur ve mixin hiç çalışmaz.'
    },
    {
      q: 'object.__init__ fazladan argüman alırsa ne olur?',
      a: 'TypeError: object.__init__() takes exactly one argument. Bu aslında faydalıdır: işbirlikçi zincirde hiçbir sınıfın tüketmediği bir anahtar (yazım hatası) sona ulaşır ve sessizce kaybolmak yerine hata verir.'
    },
    {
      q: 'mro() ile __mro__ farkı nedir?',
      a: '__mro__ sınıf oluşturulurken hesaplanan ve saklanan demettir. mro() bunu hesaplayan metottur ve liste döndürür; metasınıflar ezebilir. Günlük kullanımda ikisi aynı sırayı verir.'
    }
  ],
  mistakes: [
    {
      why: 'Üst sınıfı adıyla çağırmak MRO\'yu atlar; elmasta ortak ata iki kez çalışır ya da kardeş sınıf hiç çalışmaz.',
      bad: 'class Konumlu(Taban):\n    def __init__(self, bolge):\n        Taban.__init__(self)\n',
      good: 'class Konumlu(Taban):\n    def __init__(self, bolge, **kw):\n        super().__init__(**kw)\n'
    },
    {
      why: 'Mixin sağda kalırsa taban sınıfın metodu önce bulunur ve mixin\'in davranışı hiç devreye girmez.',
      bad: 'class HizliDepo(UrunDeposu, OnbellekMixin): pass',
      good: 'class HizliDepo(OnbellekMixin, UrunDeposu): pass'
    },
    {
      why: 'super() çağırmayan mixin kurucusu zinciri koparır; MRO\'da ondan sonraki sınıfların __init__\'i hiç çalışmaz.',
      bad: 'class LogMixin:\n    def __init__(self):\n        self.kayitlar = []\n',
      good: 'class LogMixin:\n    def __init__(self, **kw):\n        super().__init__(**kw)\n        self.kayitlar = []\n'
    },
    {
      why: 'Ata sınıfı çocuğundan önce yazmak C3 ile çelişir ve sınıf tanımı TypeError verir; zaten Vadeli Hesap\'ı içerdiği için Hesap\'ı yazmak gereksizdir.',
      bad: 'class Ozel(Hesap, Vadeli): ...   # Vadeli(Hesap)',
      good: 'class Ozel(Vadeli, Hesap): ...   # ya da yalnız Vadeli'
    }
  ]
}
);
})(window);
