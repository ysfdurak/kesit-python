/* PythonPatika — Orta: Kapsam ve kapanışlar (closures) derinlemesine */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push({
  id: 'kapanis-kapsam',
  lv: 'orta',
  mod: 'Pythonic Kod',
  min: 40,
  title: 'Kapsam ve kapanışlar (closures) derinlemesine',
  sum: 'LEGB kuralını, global ile nonlocal farkını, kapanışın değişkeni nasıl yakaladığını, döngüdeki geç bağlama tuzağını, fabrika fonksiyonlarını, __closure__ hücrelerini ve functools.partial ile ilişkisini iş senaryolarıyla derinlemesine öğrenirsin.',
  goals: [
    'Bir adın hangi kapsamda arandığını LEGB sırasıyla açıklayabilir, UnboundLocalError nedenini bulabilirim.',
    'global ile nonlocal arasındaki farkı bilir, durum tutan kapanışı doğru yazabilirim.',
    'Döngüde lambda üretirken geç bağlama tuzağını tanır, üç farklı yolla düzeltebilirim.',
    'Çarpan, sayaç ve indirim kuralı gibi fabrika fonksiyonları yazıp __closure__ ile içlerini inceleyebilirim.',
    'Kapanış, sınıf ve functools.partial arasında duruma göre doğru aracı seçebilirim.'
  ],
  body: `
<h2>Neden önemli?</h2>
<p>Anadolu Market'in kampanya ekibi her hafta yeni kural tanımlıyor: "500 TL üstüne yüzde 10", "Ankara'ya kargo 30 TL indirimli", "ilk siparişe 50 TL". Anadolu Bank'ta ise her kart için farklı günlük harcama limiti var. Bu kuralları tek tek <code>if</code> bloklarıyla yazarsan kod büyüdükçe yönetilemez olur. Python'ın cevabı şudur: kuralı bir <b>fonksiyon olarak üret</b>, ayarını içine göm, ihtiyaç olunca çağır. Ayarını içinde taşıyan bu fonksiyona <b>kapanış</b> (closure) denir.</p>
<p>Fonksiyonel araçlar dersinde kapanışla ilk kez tanıştın (sayaç ve komisyon hesaplayıcı yazdın). Bu derste perdenin arkasına geçiyoruz: Python bir adı nerede arar, iç fonksiyon dış değişkeni nasıl "hatırlar", hatırladığı şey değer mi yoksa değişkenin kendisi mi, ve bu farkın döngülerde neden can sıktığı. Bu bilgi dekoratörlerin, geri çağırma (callback) fonksiyonlarının ve PCAP sınavının 5.3 konusunun temelidir.</p>

<h2>LEGB tekrar: bir ad nerede aranır?</h2>
<p>Kapsam ve modüller dersinde gördüğün kural: Python bir adı okurken sırayla dört yere bakar ve ilk bulduğunu kullanır.</p>
<div class="tbl-wrap"><table>
<tr><th>Harf</th><th>Kapsam</th><th>Örnek</th></tr>
<tr><td>L</td><td>Yerel (Local): fonksiyonun kendi adları</td><td>Parametreler, fonksiyon içinde atanan adlar</td></tr>
<tr><td>E</td><td>Kapsayan (Enclosing): dıştaki fonksiyonların adları</td><td>İç fonksiyonun gördüğü dış değişken</td></tr>
<tr><td>G</td><td>Genel (Global): modül düzeyindeki adlar</td><td>Dosyanın en üstünde tanımlanan sabitler</td></tr>
<tr><td>B</td><td>Yerleşik (Built-in): Python'ın hazır adları</td><td><code>len</code>, <code>sum</code>, <code>print</code></td></tr>
</table></div>
<pre class="py">kdv = 0.20                      # G: genel

def fatura(tutar):              # tutar: L (fatura için)
    kargo = 30                  # L (fatura için)
    def satir(adet):            # adet: L (satir için)
        # kargo E'den, kdv G'den, round B'den gelir
        return round(adet * tutar * (1 + kdv) + kargo, 2)
    return satir(2)

print(fatura(100))</pre>
<p>Önemli ayrıntı: Bir adın hangi kapsama ait olduğuna Python <b>derleme anında</b> karar verir, çalışma anında değil. Fonksiyonun gövdesinde bir ada herhangi bir yerde atama yapılıyorsa, o ad fonksiyonun tamamı boyunca yereldir. Bu yüzden aşağıdaki kod, atama satırı okumadan sonra gelse bile hata verir:</p>
<pre class="py">toplam = 0

def ekle(tutar):
    try:
        toplam += tutar          # toplam = toplam + tutar: önce okur!
    except UnboundLocalError as h:
        print("Hata:", h)

ekle(50)</pre>
<p><code>toplam += tutar</code> bir atama olduğu için <code>toplam</code> yerel sayılır; okumaya çalıştığında yerel <code>toplam</code> henüz bağlanmamıştır (unbound). Hata adı da buradan gelir: <b>UnboundLocalError</b>.</p>

<h2>global ve nonlocal: hangi kutuya yazıyorsun?</h2>
<p>Okumak için bildirim gerekmez; <b>atamak</b> istediğin ad yerel değilse Python'a söylemen gerekir. İki anahtar kelime vardır ve farklı kutulara yazar:</p>
<div class="tbl-wrap"><table>
<tr><th></th><th><code>global ad</code></th><th><code>nonlocal ad</code></th></tr>
<tr><td>Nereye yazar?</td><td>Modül düzeyindeki ada</td><td>En yakın kapsayan fonksiyondaki ada</td></tr>
<tr><td>Ad önceden var olmalı mı?</td><td>Hayır, yoksa oluşturur</td><td>Evet, yoksa SyntaxError</td></tr>
<tr><td>Modül düzeyinde kullanılır mı?</td><td>Anlamsız ama hata değil</td><td>Hayır, SyntaxError</td></tr>
<tr><td>Tipik kullanım</td><td>Nadiren; yapılandırma, önbellek</td><td>Kapanışta sayaç, bakiye, durum</td></tr>
<tr><td>Test edilebilirlik</td><td>Kötü: gizli paylaşılan durum</td><td>İyi: durum kapanışa özel</td></tr>
</table></div>
<pre class="py">sayac = 0                       # genel

def genel_artir():
    global sayac
    sayac += 1

def kasa_ac():
    sayac = 100                 # kasa_ac'a ait, genel sayac'tan bağımsız
    def islem():
        nonlocal sayac          # kasa_ac'taki sayac'a yazar
        sayac += 1
        return sayac
    return islem

genel_artir(); genel_artir()
k = kasa_ac()
print(k(), k())                 # 101 102
print("genel sayac:", sayac)    # 2: nonlocal genele dokunmadı</pre>
<div class="warn"><b>nonlocal genel değişkeni bulmaz</b><code>nonlocal</code> yalnızca kapsayan <i>fonksiyonlara</i> bakar, modül düzeyine asla çıkmaz. Dış fonksiyonda o ad yoksa kod daha çalışmadan <code>SyntaxError: no binding for nonlocal</code> verir.</div>

<h2>Kapanış neyi yakalar: değeri mi, değişkeni mi?</h2>
<p>İç fonksiyon dıştaki bir adı kullandığında ve dış fonksiyon bittikten sonra da yaşamaya devam ettiğinde kapanış oluşur. Python o adı bir <b>hücre</b> (cell) nesnesine koyar; dış fonksiyon da iç fonksiyon da aynı hücreyi görür. Yakalanan şey o anki <b>değer değil, hücrenin kendisidir</b>. Hücredeki değer sonradan değişirse iç fonksiyon yeni değeri görür.</p>
<pre class="py">def carpan(k):
    def uygula(x):
        return x * k
    k = k + 1                   # dönmeden önce k değişti
    return uygula

c = carpan(3)
print(c(10))                                # 40, 30 değil
print(c.__code__.co_freevars)               # serbest değişken adları
print(c.__closure__)                        # hücre demeti
print(c.__closure__[0].cell_contents)       # hücredeki güncel değer</pre>
<p><code>__code__.co_freevars</code> iç fonksiyonun dışarıdan kullandığı <b>serbest değişkenlerin</b> (free variables) adlarını, <code>__closure__</code> ise aynı sırayla hücreleri verir. Hiç serbest değişken kullanmayan fonksiyonda <code>__closure__</code> <code>None</code> olur. Bu özellikler hata ayıklamada ve PCAP sorularında karşına çıkar.</p>
<p>Hücre paylaşıldığı için aynı dış fonksiyondan dönen <b>iki</b> iç fonksiyon tek bir durumu ortak kullanabilir. Her yeni çağrı ise yeni hücre ve bağımsız durum üretir:</p>
<pre class="py">def hesap(bakiye):
    def yatir(tutar):
        nonlocal bakiye
        bakiye += tutar
    def goster():
        return bakiye
    return yatir, goster

yatir_a, goster_a = hesap(100)
yatir_b, goster_b = hesap(0)
yatir_a(50)
yatir_b(10)
print(goster_a(), goster_b())                          # 150 10
print(yatir_a.__closure__[0] is goster_a.__closure__[0])  # aynı hücre</pre>

<h2>Geç bağlama (late binding) tuzağı</h2>
<p>"Hücreyi yakalar" kuralının en ünlü sonucu budur. Döngüde fonksiyon üretirsen hepsi döngü değişkeninin <b>aynı</b> hücresini paylaşır. Değer, fonksiyon <b>çağrıldığında</b> okunur; o anda döngü çoktan bitmiştir.</p>
<pre class="py">oranlar = [0.05, 0.10, 0.20]
kurallar = []
for oran in oranlar:
    kurallar.append(lambda tutar: tutar * oran)

print([k(100) for k in kurallar])      # üçü de 20.0!

# Çözüm 1: varsayılan argüman, değeri TANIM anında kopyalar
kurallar = [lambda tutar, oran=oran: tutar * oran for oran in oranlar]
print([k(100) for k in kurallar])

# Çözüm 2: fabrika fonksiyonu, her çağrı yeni hücre açar
def kural_uret(oran):
    return lambda tutar: tutar * oran
kurallar = [kural_uret(o) for o in oranlar]
print([k(100) for k in kurallar])

# Çözüm 3: functools.partial, argümanı o anda sabitler
from functools import partial
def kural(tutar, oran):
    return tutar * oran
kurallar = [partial(kural, oran=o) for o in oranlar]
print([k(100) for k in kurallar])</pre>
<div class="tip"><b>Hangi çözüm?</b>Varsayılan argüman en kısa çözümdür ama fonksiyonun imzasına çağıranın değiştirebileceği gizli bir parametre ekler (<code>k(100, oran=5)</code>). Ekip kodunda fabrika fonksiyonu ya da <code>partial</code> daha temiz ve niyeti daha açıktır.</div>

<h2>Fabrika fonksiyonları: kural üreten kural</h2>
<p>Fabrika fonksiyonu (factory function), ayarları alıp bu ayarlarla çalışan yeni bir fonksiyon döndürür. Doğrulamayı fabrikada bir kez yaparsın; üretilen fonksiyon her çağrıda hızlı ve sade kalır.</p>
<pre class="py">def indirim_kurali(oran, esik=0):
    if not 0 &lt; oran &lt; 1:
        raise ValueError("oran 0 ile 1 arasında olmalı")
    def uygula(tutar):
        if tutar &gt;= esik:
            return round(tutar * (1 - oran), 2)
        return tutar
    uygula.__name__ = f"indirim_{int(oran * 100)}"
    return uygula

hafta_sonu = indirim_kurali(0.10, esik=500)
ogrenci = indirim_kurali(0.15)
for tutar in [300, 750]:
    print(tutar, hafta_sonu(tutar), ogrenci(tutar))
print(hafta_sonu.__name__, ogrenci.__name__)</pre>
<p>Anadolu Bank'ta kart başına günlük limit de aynı kalıptır; bu kez kapanış durumu <b>değiştirir</b>, bu yüzden <code>nonlocal</code> gerekir:</p>
<pre class="py">def gunluk_limit(limit):
    kalan = limit
    def harca(tutar):
        nonlocal kalan
        if tutar &gt; kalan:
            return f"RED: {tutar} TL, kalan {kalan} TL"
        kalan -= tutar
        return f"ONAY: {tutar} TL, kalan {kalan} TL"
    return harca

kart = gunluk_limit(1000)
for t in [400, 500, 200]:
    print(kart(t))</pre>

<h2>Kapanış mı, sınıf mı?</h2>
<p>Kapanış "tek metotlu küçük bir nesne" gibidir. Durum büyüdükçe ve davranış çoğaldıkça sınıf daha okunur olur.</p>
<div class="tbl-wrap"><table>
<tr><th>Ölçüt</th><th>Kapanış</th><th>Sınıf</th></tr>
<tr><td>Davranış sayısı</td><td>Bir (ya da birkaç iç fonksiyon)</td><td>Çok sayıda metot</td></tr>
<tr><td>Durumu dışarıdan görmek</td><td>Zor: <code>__closure__</code> ile</td><td>Kolay: <code>nesne.alan</code></td></tr>
<tr><td>Kalıtım, <code>__repr__</code>, karşılaştırma</td><td>Yok</td><td>Var</td></tr>
<tr><td>Satır sayısı</td><td>Az</td><td>Daha fazla</td></tr>
<tr><td>Tipik yer</td><td>Dekoratör, callback, <code>key=</code>, kural</td><td>Hesap, sepet, bağlantı</td></tr>
</table></div>
<pre class="py">class Carpan:
    def __init__(self, k):
        self.k = k
    def __call__(self, x):        # nesneyi fonksiyon gibi çağrılabilir yapar
        return x * self.k

def carpan(k):
    return lambda x: x * k

kdv_sinif = Carpan(1.2)
kdv_kapanis = carpan(1.2)
print(kdv_sinif(100), kdv_kapanis(100))
print(kdv_sinif.k, kdv_kapanis.__closure__[0].cell_contents)</pre>

<h2>functools.partial ile ilişkisi</h2>
<p><code>partial</code>, "argümanı önceden doldur" işini kapanış yazmadan yapar ve ayarı açıkça gösterir: <code>.func</code>, <code>.args</code>, <code>.keywords</code>. Kendi iç mantığı yoksa, sadece argüman sabitliyorsan <code>partial</code> seç; fabrikada doğrulama, hesap ya da durum varsa kapanış seç.</p>
<pre class="py">from functools import partial

def kargo_ucreti(desi, sehir, ekspres=False):
    tarife = {"İstanbul": 40, "Ankara": 45, "Van": 70}
    ucret = tarife[sehir] + desi * 5
    return ucret * 1.5 if ekspres else ucret

ankara = partial(kargo_ucreti, sehir="Ankara")
print(ankara(4), ankara(4, ekspres=True))
print(ankara.func.__name__, ankara.args, ankara.keywords)

def sehir_tarifesi(sehir):                 # aynı işin kapanış hâli
    def hesapla(desi, ekspres=False):
        return kargo_ucreti(desi, sehir, ekspres)
    return hesapla
print(sehir_tarifesi("Ankara")(4))</pre>

<div class="note"><b>Gerçek işte</b>Kapanışları en çok üç yerde görürsün: (1) dekoratörlerde, sarılan fonksiyonu hatırlayan iç fonksiyon olarak; (2) arayüz ve olay sistemlerinde, "butona basılınca şu sipariş için şunu yap" geri çağırmalarında (geç bağlama hatasının en sık çıktığı yer burasıdır: tüm butonlar son siparişi işler); (3) iş kurallarının yapılandırmadan üretildiği kural motorlarında. Kod incelemesinde döngü içinde <code>lambda</code> gördüğünde ilk sorulacak soru şudur: "Bu değişken çağrı anında ne olacak?"</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Hücreler ve bellek</h3>
<p>Kapanış dış fonksiyonun yalnızca kullandığı adları tutar, tüm yerel değişkenleri değil. Yine de büyük bir listeyi yakalayan kapanış yaşadıkça liste de bellekte kalır. Uzun ömürlü callback'lerde yalnızca gerekeni yakala: <code>adet = len(buyuk_liste)</code> deyip <code>adet</code>'i kullan.</p>
<h3>Değiştirilebilir nesneyle nonlocal'sız durum</h3>
<p>Hücredeki ad yeniden bağlanmıyorsa <code>nonlocal</code> gerekmez: <code>onbellek = {}</code> yakalayıp <code>onbellek[k] = v</code> demek bir atama değil, nesneyi değiştirmektir. Hafızalı (memoize) fonksiyonlar ve <code>lru_cache</code>'in basit hâli böyle yazılır. Ama <code>onbellek = {}</code> diye yeniden atarsan yine <code>nonlocal</code> ister.</p>
<h3>Kapanış ve eşzamanlılık</h3>
<p>Paylaşılan hücreyi birden fazla iş parçacığı (thread) değiştiriyorsa <code>sayac += 1</code> atomik değildir; Eşzamanlılık dersinde bunun için kilit (lock) kullanacaksın. Ayrıca kapanışlar <code>pickle</code> ile serileştirilemez; çok işlemcili (multiprocessing) kodda modül düzeyi fonksiyon ya da <code>partial</code> tercih edilir.</p>
<h3>PCAP 5.3 için kontrol listesi</h3>
<ul><li>İç fonksiyon dış adı okuyorsa bildirim gerekmez; atıyorsa <code>nonlocal</code> gerekir.</li><li>Dış fonksiyon döndükten sonra da iç fonksiyon dış değeri görür: kapanış.</li><li>Döngüde üretilen lambdalar son değeri görür; <code>i=i</code> ile düzelir.</li><li><code>__closure__</code> yoksa <code>None</code>; varsa hücre demeti, değer <code>cell_contents</code>'te.</li></ul>
</section>
`,
  ex: [
    { t: 'mc', stage: 'Isınma',
      q: 'İç fonksiyonda, dıştaki <b>fonksiyonun</b> <code>adet</code> değişkenini artırmak istiyorsun (<code>adet += 1</code>). Hangi bildirim gerekir?',
      o: ['global adet', 'nonlocal adet', 'Bildirim gerekmez, atama yeterli', 'self.adet kullanmak gerekir'], a: 1,
      why: 'Kapsayan fonksiyonun adına yazmak için nonlocal kullanılır. global modül düzeyindeki ada yazar; bildirimsiz atama ise yeni bir yerel ad açar ve okuma önce geldiği için UnboundLocalError verir.' },
    { t: 'mc', stage: 'Isınma',
      q: 'Hiç serbest değişken kullanmayan bir fonksiyonda (örneğin <code>def f(x): return x * 2</code>) <code>f.__closure__</code> ne döndürür?',
      o: ['Boş demet ()', 'None', 'Boş liste []', 'AttributeError hatası verir'], a: 1,
      why: 'Her fonksiyonda __closure__ özelliği vardır; serbest değişken yoksa değeri None olur. Serbest değişken varsa her biri için bir hücre içeren demet döner.' },
    { t: 'mc', stage: 'Isınma',
      q: 'Yalnızca bir argümanı önceden sabitlemek istiyorsun, ek mantık yok. <code>functools.partial</code> neden çoğu zaman elle yazılmış kapanıştan daha iyidir?',
      o: ['partial her çağrıda daha az bellek kullanır, kapanış ise her çağrıda dış fonksiyonu yeniden çalıştırır', 'Sabitlenen değerler .func, .args ve .keywords ile açıkça görülür', 'Kapanış anahtar kelimeli argüman kabul edemez', 'partial geç bağlama tuzağından etkilenir, bu yüzden daha esnektir'], a: 1,
      why: 'partial nesnesi neyi sabitlediğini açıkça gösterir ve tek satırdır. Kapanış dış fonksiyonu yeniden çalıştırmaz; anahtar kelimeli argüman da alabilir. partial ise değeri oluşturulduğu anda sabitlediği için geç bağlama tuzağından ETKİLENMEZ.' },
    { t: 'predict', stage: 'Kodu oku', q: 'Bu kod ne yazdırır?',
      code: 'islemler = []\nfor i in range(3):\n    islemler.append(lambda x: x * i)\nprint([f(10) for f in islemler])\n',
      o: ['[0, 10, 20]', '[20, 20, 20]', '[0, 0, 0]', '[30, 30, 30]'], a: 1,
      why: 'Üç lambda da aynı i değişkenini yakalar ve değeri çağrı anında okur. Döngü bittiğinde i 2\'dir; bu yüzden hepsi 10 * 2 = 20 döndürür. range(3) 3\'e ulaşmadığı için 30 değil.' },
    { t: 'predict', stage: 'Kodu oku', q: 'Bu kod ne yazdırır?',
      code: 'def hesap():\n    bakiye = 100\n    def yatir(t):\n        nonlocal bakiye\n        bakiye += t\n    def goster():\n        return bakiye\n    return yatir, goster\n\ny1, g1 = hesap()\ny2, g2 = hesap()\ny1(50)\ny2(10)\ny1(5)\nprint(g1(), g2())\n',
      o: ['165 165', '155 110', '100 100', '160 115'], a: 1,
      why: 'Aynı hesap() çağrısından dönen yatir ve goster tek hücreyi paylaşır; her yeni hesap() çağrısı ise yeni bir hücre açar. Birinci hesap 100+50+5 = 155, ikinci 100+10 = 110 olur.' },
    { t: 'predict', stage: 'Kodu oku', q: 'Bu kod ne yazdırır?',
      code: 'def carpan(k):\n    def f(x):\n        return x * k\n    k = k * 2\n    return f\n\nc = carpan(3)\nprint(c.__code__.co_freevars, c.__closure__[0].cell_contents, c(10))\n',
      o: ["('k',) 3 30", "('k',) 6 60", "('x', 'k') 6 60", "() 3 30"], a: 1,
      why: 'f, k adının hücresini yakalar; dönmeden önce k = 6 olduğu için hücrede 6 vardır ve c(10) 60 döndürür. x f\'nin kendi parametresidir (yerel), serbest değişken değildir.' },
    { t: 'order', stage: 'Kodu oku',
      q: '<p>Her çağrıldığında bir artan sayaç üreten fabrikayı kur ve üç kez çağır. Çıktı <code>1 2 3</code> olmalı.</p>',
      lines: ['def sayac_uret():', '    adet = 0', '    def say():', '        nonlocal adet', '        adet += 1', '        return adet', '    return say', 's = sayac_uret()', 'print(s(), s(), s())'],
      expect: '1 2 3\n',
      hint: 'nonlocal bildirimi, adete yazan satırdan önce ve iç fonksiyonun ilk satırında olmalı.',
      why: 'Dış fonksiyon adet\'i tanımlar, iç fonksiyon nonlocal ile ona yazar, dış fonksiyon iç fonksiyonu çağırmadan döndürür. Her s() çağrısı aynı hücreyi artırır.' },
    { t: 'code', stage: 'Rehberli', id: 'kapanis-kapsam-1', diff: 1,
      q: '<p>Anadolu Market fiyat çarpanları: <code>carpan_uret(k)</code> fabrika fonksiyonunu yaz. Bir fonksiyon döndürsün; dönen fonksiyon <code>x</code> alıp <code>x * k</code> döndürsün. Örnek: <code>kdv = carpan_uret(1.2)</code> sonra <code>kdv(100)</code> → <code>120.0</code>.</p>',
      guide: ['carpan_uret içinde x parametreli bir iç fonksiyon tanımla.', 'İç fonksiyon x * k döndürsün; k dış fonksiyondan gelir.', 'carpan_uret iç fonksiyonu parantezsiz (çağırmadan) döndürsün.'],
      example: 'def onek_ekle(onek):\n    def ekle(metin):\n        return onek + metin\n    return ekle\n\nsiparis_no = onek_ekle("AM-")\nprint(siparis_no("101"))\n',
      start: 'def carpan_uret(k):\n    # TODO: x alıp x * k döndüren iç fonksiyonu tanımla\n    # TODO: iç fonksiyonu çağırmadan döndür\n    pass\n',
      sol: 'def carpan_uret(k):\n    def carp(x):\n        return x * k\n    return carp\n\nkdv = carpan_uret(1.2)\nprint(kdv(100))\n',
      tests: 'kdv = carpan_uret(1.2)\nassert callable(kdv), "carpan_uret bir fonksiyon döndürmeli (parantezsiz return)"\nassert abs(kdv(100) - 120) < 1e-9, "kdv(100) 120 olmalı"\nikiye = carpan_uret(2)\nassert ikiye(21) == 42, "carpan_uret(2)(21) 42 olmalı"\nassert abs(kdv(10) - 12) < 1e-9, "her üretilen fonksiyon kendi k değerini hatırlamalı"\nassert ikiye.__closure__ is not None and ikiye.__closure__[0].cell_contents == 2, "k kapanışta (hücrede) saklanmalı"\n',
      hints: ['Fonksiyon içinde def ile ikinci bir fonksiyon tanımlayabilirsin.', 'return carp yaz, return carp(x) değil.', 'def carp(x): return x * k ve ardından return carp'],
      why: 'İç fonksiyon k adını kapsayan fonksiyondan okur; dış fonksiyon bittikten sonra k hücrede yaşamaya devam eder. Her carpan_uret çağrısı kendi hücresini açar.' },
    { t: 'code', stage: 'Rehberli', id: 'kapanis-kapsam-2', diff: 2,
      q: '<p>Kampanya ekibi için <code>indirim_kurali(oran, esik)</code> fabrikasını yaz. <code>oran</code> 0 ile 1 arasında (ikisi hariç) değilse fabrika <b>hemen</b> <code>ValueError</code> fırlatsın. Dönen fonksiyon <code>tutar</code> alsın: tutar <code>esik</code> değerine eşit ya da büyükse <code>round(tutar * (1 - oran), 2)</code>, değilse tutarı olduğu gibi döndürsün.</p>',
      guide: ['Önce oran kontrolünü fabrikanın başında yap ve gerekirse ValueError fırlat.', 'tutar parametreli bir iç fonksiyon tanımla.', 'İç fonksiyonda esik ile karşılaştırıp indirimli ya da aynı tutarı döndür.', 'Fabrika iç fonksiyonu döndürsün.'],
      example: 'def kargo_kurali(bedava_esik):\n    if bedava_esik < 0:\n        raise ValueError("eşik negatif olamaz")\n    def ucret(tutar):\n        return 0 if tutar >= bedava_esik else 30\n    return ucret\n\nk = kargo_kurali(400)\nprint(k(350), k(450))\n',
      start: 'def indirim_kurali(oran, esik):\n    # TODO: oran 0 < oran < 1 değilse ValueError fırlat\n    def uygula(tutar):\n        # TODO: esik kontrolü ve indirim\n        pass\n    # TODO: iç fonksiyonu döndür\n',
      sol: 'def indirim_kurali(oran, esik):\n    if not 0 < oran < 1:\n        raise ValueError("oran 0 ile 1 arasında olmalı")\n    def uygula(tutar):\n        if tutar >= esik:\n            return round(tutar * (1 - oran), 2)\n        return tutar\n    return uygula\n\nhs = indirim_kurali(0.10, 500)\nprint(hs(300), hs(750))\n',
      tests: 'hs = indirim_kurali(0.10, 500)\nassert hs(300) == 300, "eşiğin altındaki tutar değişmemeli"\nassert hs(500) == 450.0, "eşiğe eşit tutar indirim almalı: 500 * 0.9 = 450"\nassert hs(750) == 675.0, "750 * 0.9 = 675"\nassert indirim_kurali(0.15, 0)(99.99) == 84.99, "sonuç 2 ondalığa yuvarlanmalı"\nfor kotu in (0, 1, 1.5, -0.1):\n    try:\n        indirim_kurali(kotu, 100)\n    except ValueError:\n        pass\n    else:\n        raise AssertionError(f"oran={kotu} için fabrika ValueError fırlatmalı (çağrı anında değil, üretim anında)")\n',
      hints: ['Doğrulama iç fonksiyonda değil, fabrikanın gövdesinde olmalı.', 'if not 0 < oran < 1: raise ValueError(...)', 'İç fonksiyon: if tutar >= esik: return round(tutar * (1 - oran), 2) ve sonra return tutar'],
      why: 'Fabrika doğrulamayı bir kez yapar; hatalı kural sisteme hiç giremez. Üretilen fonksiyon oran ve esik değerlerini kapanıştan okur.' },
    { t: 'code', stage: 'Rehberli', id: 'kapanis-kapsam-3', diff: 2,
      q: '<p>Anadolu Bank kart limiti: <code>harcama_limiti(gunluk_limit)</code> fabrikasını yaz. Dönen <code>harca(tutar)</code> fonksiyonu tutar kalan limiti aşmıyorsa kalan limitten düşüp <code>True</code>, aşıyorsa hiçbir şeyi değiştirmeden <code>False</code> döndürsün. Her kartın limiti birbirinden bağımsız olmalı.</p>',
      guide: ['Fabrikada kalan = gunluk_limit ile durumu başlat.', 'harca içinde kalan\'a yazacağın için nonlocal bildir.', 'tutar kalan\'dan büyükse False döndür.', 'Değilse kalan\'dan düş ve True döndür.'],
      example: 'def stok_takip(adet):\n    kalan = adet\n    def sat(n):\n        nonlocal kalan\n        if n > kalan:\n            return "yetersiz"\n        kalan -= n\n        return kalan\n    return sat\n\ns = stok_takip(5)\nprint(s(2), s(4), s(3))\n',
      start: 'def harcama_limiti(gunluk_limit):\n    kalan = gunluk_limit\n    def harca(tutar):\n        # TODO: kalan\'a yazabilmek için bildirim\n        # TODO: limit aşılıyorsa False\n        # TODO: değilse düş ve True\n        pass\n    return harca\n',
      sol: 'def harcama_limiti(gunluk_limit):\n    kalan = gunluk_limit\n    def harca(tutar):\n        nonlocal kalan\n        if tutar > kalan:\n            return False\n        kalan -= tutar\n        return True\n    return harca\n\nkart = harcama_limiti(1000)\nprint(kart(400), kart(700), kart(600))\n',
      tests: 'kart = harcama_limiti(1000)\nassert kart(400) is True, "400 TL 1000 limitte onaylanmalı"\nassert kart(700) is False, "kalan 600 iken 700 reddedilmeli"\nassert kart(600) is True, "reddedilen işlem limiti azaltmamalı; 600 hâlâ onaylanmalı"\nassert kart(1) is False, "limit bitti, 1 TL bile reddedilmeli"\nk2 = harcama_limiti(50)\nassert k2(50) is True, "ikinci kart kendi limitine sahip olmalı (bağımsız hücre)"\n',
      hints: ['kalan -= tutar bir atamadır; nonlocal olmadan UnboundLocalError alırsın.', 'nonlocal kalan satırı harca\'nın ilk satırı olsun.', 'if tutar > kalan: return False, sonra kalan -= tutar ve return True'],
      why: 'nonlocal sayesinde harca, fabrika çağrısına özel kalan hücresini günceller. Her harcama_limiti çağrısı yeni hücre açtığı için kartlar birbirini etkilemez.' },
    { t: 'code', stage: 'Rehberli', id: 'kapanis-kapsam-4', diff: 2,
      q: '<p>Hata ayıklama aracı: <code>serbest_degiskenler(f)</code> fonksiyonunu yaz. Bir fonksiyonun yakaladığı serbest değişkenleri <code>{ad: değer}</code> sözlüğü olarak döndürsün. Adlar <code>f.__code__.co_freevars</code>, hücreler <code>f.__closure__</code> içinde aynı sıradadır. Kapanışı olmayan fonksiyonda boş sözlük döndür.</p>',
      guide: ['f.__closure__ None ise hemen {} döndür.', 'Adları f.__code__.co_freevars ile al.', 'Adları ve hücreleri zip ile eşle.', 'Her hücrenin değerini cell_contents ile oku.'],
      example: 'adlar = ("sehir", "oran")\ndegerler = ["Ankara", 0.2]\nprint({a: d for a, d in zip(adlar, degerler)})\n',
      start: 'def serbest_degiskenler(f):\n    # TODO: __closure__ None ise boş sözlük\n    # TODO: co_freevars ile __closure__ hücrelerini eşle, cell_contents oku\n    pass\n',
      sol: 'def serbest_degiskenler(f):\n    if f.__closure__ is None:\n        return {}\n    return {ad: hucre.cell_contents for ad, hucre in zip(f.__code__.co_freevars, f.__closure__)}\n\ndef kural(oran, esik):\n    return lambda t: t * oran if t >= esik else t\nprint(serbest_degiskenler(kural(0.1, 500)))\n',
      tests: 'def kural(oran, esik):\n    return lambda t: t * oran if t >= esik else t\nassert serbest_degiskenler(kural(0.1, 500)) == {"esik": 500, "oran": 0.1}, "esik ve oran hücreleri okunmalı"\ndef duz(x):\n    return x + 1\nassert serbest_degiskenler(duz) == {}, "kapanışı olmayan fonksiyonda {} dönmeli"\ndef dis():\n    a = 1\n    def ic():\n        return a\n    a = 99\n    return ic\nassert serbest_degiskenler(dis()) == {"a": 99}, "hücredeki GÜNCEL değer okunmalı"\n',
      hints: ['Hücre nesnesinin değeri cell_contents özelliğindedir.', 'zip(f.__code__.co_freevars, f.__closure__) ad-hücre çiftleri verir.', 'return {ad: h.cell_contents for ad, h in zip(...)}'],
      why: 'co_freevars ve __closure__ aynı sırayla dizilir; zip ile eşleyip cell_contents okunur. Hücre o anki değeri tuttuğu için dış fonksiyonda sonradan yapılan atama da görünür.' },
    { t: 'code', stage: 'Kendin yaz', id: 'kapanis-kapsam-5', diff: 2,
      q: '<p><code>kural_listesi(oranlar)</code> fonksiyonunu yaz: her oran için <code>tutar</code> alıp <code>round(tutar * oran, 2)</code> döndüren bir fonksiyon üretsin ve bunları aynı sırada liste olarak döndürsün. Geç bağlama tuzağına düşme: <code>[f(100) for f in kural_listesi([0.05, 0.1, 0.2])]</code> sonucu <code>[5.0, 10.0, 20.0]</code> olmalı.</p>',
      start: 'def kural_listesi(oranlar):\n    pass\n',
      sol: 'def kural_listesi(oranlar):\n    def uret(oran):\n        return lambda tutar: round(tutar * oran, 2)\n    return [uret(o) for o in oranlar]\n\nprint([f(100) for f in kural_listesi([0.05, 0.1, 0.2])])\n',
      tests: 'fs = kural_listesi([0.05, 0.1, 0.2])\nassert isinstance(fs, list) and len(fs) == 3, "üç fonksiyonluk liste dönmeli"\nassert [f(100) for f in fs] == [5.0, 10.0, 20.0], "her fonksiyon KENDİ oranını kullanmalı; hepsi 20 ise geç bağlama tuzağı"\nassert kural_listesi([]) == [], "boş oran listesi boş liste vermeli"\nassert kural_listesi([0.18])[0](1000) == 180.0, "tek oran da çalışmalı"\n',
      hints: ['Döngüde doğrudan lambda yazarsan hepsi son oranı görür.', 'Bir yardımcı fabrika (uret(oran)) ya da lambda tutar, oran=oran: ... kullan.'],
      why: 'Yardımcı fabrikanın her çağrısı yeni bir hücre açar, böylece her lambda kendi oranını tutar. Varsayılan argüman (oran=oran) da çalışır ama imzaya gizli parametre ekler.' },
    { t: 'code', stage: 'Kendin yaz', id: 'kapanis-kapsam-6', diff: 2,
      q: '<p><code>sayac_seti(baslangic=0)</code> fonksiyonunu yaz. <code>{"artir": ..., "azalt": ..., "deger": ...}</code> sözlüğü döndürsün; üç fonksiyon aynı durumu paylaşsın. <code>artir(n=1)</code> değeri n artırıp yeni değeri, <code>azalt(n=1)</code> n azaltıp yeni değeri döndürsün; değer 0\'ın altına düşecekse hiçbir şeyi değiştirmeden <code>ValueError</code> fırlatsın. <code>deger()</code> güncel değeri döndürsün.</p>',
      start: 'def sayac_seti(baslangic=0):\n    pass\n',
      sol: 'def sayac_seti(baslangic=0):\n    deger = baslangic\n    def artir(n=1):\n        nonlocal deger\n        deger += n\n        return deger\n    def azalt(n=1):\n        nonlocal deger\n        if deger - n < 0:\n            raise ValueError("stok negatif olamaz")\n        deger -= n\n        return deger\n    def oku():\n        return deger\n    return {"artir": artir, "azalt": azalt, "deger": oku}\n\ns = sayac_seti(5)\nprint(s["artir"](3), s["azalt"](2), s["deger"]())\n',
      tests: 's = sayac_seti(5)\nassert s["artir"]() == 6, "artir() varsayılan 1 artırmalı"\nassert s["artir"](4) == 10, "artir(4) 10 vermeli"\nassert s["azalt"](3) == 7, "azalt(3) 7 vermeli"\nassert s["deger"]() == 7, "deger() güncel değeri okumalı (aynı hücre)"\ntry:\n    s["azalt"](8)\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError("0\'ın altına düşüren azalt ValueError fırlatmalı")\nassert s["deger"]() == 7, "hatalı azalt değeri değiştirmemeli"\nt = sayac_seti()\nassert t["deger"]() == 0 and s["deger"]() == 7, "her sayac_seti bağımsız olmalı"\n',
      hints: ['Üç iç fonksiyon tek bir dış değişkeni paylaşır; değiştirenlerde nonlocal gerekir.', 'Okuyan fonksiyonda nonlocal gerekmez.', 'azalt\'ta önce kontrol et, sonra düş.'],
      why: 'Aynı fabrika çağrısındaki iç fonksiyonlar tek hücreyi paylaşır. Bu, küçük bir nesneyi sınıfsız kurmanın yoludur; daha fazla davranış gerekirse sınıfa geçmek doğal adımdır.' },
    { t: 'code', stage: 'Kendin yaz', id: 'kapanis-kapsam-7', diff: 2,
      q: '<p>Aşağıdaki <code>kargo_ucreti(desi, sehir, ekspres=False)</code> hazır. İki şey yap: (1) <code>functools.partial</code> ile <code>ankara_kargo</code> adında, sehir="Ankara" sabitlenmiş bir çağrılabilir üret; (2) aynı işi kapanışla yapan <code>sehir_tarifesi(sehir)</code> fabrikasını yaz: <code>hesapla(desi, ekspres=False)</code> döndürsün.</p>',
      start: 'def kargo_ucreti(desi, sehir, ekspres=False):\n    tarife = {"İstanbul": 40, "Ankara": 45, "Van": 70}\n    ucret = tarife[sehir] + desi * 5\n    return ucret * 1.5 if ekspres else ucret\n\nankara_kargo = None  # partial ile üret\n\ndef sehir_tarifesi(sehir):\n    pass\n',
      sol: 'from functools import partial\n\ndef kargo_ucreti(desi, sehir, ekspres=False):\n    tarife = {"İstanbul": 40, "Ankara": 45, "Van": 70}\n    ucret = tarife[sehir] + desi * 5\n    return ucret * 1.5 if ekspres else ucret\n\nankara_kargo = partial(kargo_ucreti, sehir="Ankara")\n\ndef sehir_tarifesi(sehir):\n    def hesapla(desi, ekspres=False):\n        return kargo_ucreti(desi, sehir, ekspres)\n    return hesapla\n\nprint(ankara_kargo(4), sehir_tarifesi("Van")(2, ekspres=True))\n',
      tests: 'import functools\nassert isinstance(ankara_kargo, functools.partial), "ankara_kargo functools.partial nesnesi olmalı"\nassert ankara_kargo.keywords == {"sehir": "Ankara"}, "partial sehir=\\"Ankara\\" anahtar kelimesini sabitlemeli"\nassert ankara_kargo(4) == 65, "Ankara 4 desi: 45 + 20 = 65"\nassert ankara_kargo(4, ekspres=True) == 97.5, "ekspres 1.5 kat"\nvan = sehir_tarifesi("Van")\nassert van(2) == 80, "Van 2 desi: 70 + 10 = 80"\nassert van(2, ekspres=True) == 120.0, "Van ekspres 120"\nassert sehir_tarifesi("Ankara")(4) == ankara_kargo(4), "kapanış ve partial aynı sonucu vermeli"\nassert van.__closure__ is not None, "sehir_tarifesi kapanış döndürmeli"\n',
      hints: ['from functools import partial; partial(fonk, sehir="Ankara")', 'Kapanışta iç fonksiyon kargo_ucreti(desi, sehir, ekspres) çağırır.'],
      why: 'partial argümanı sabitler ve bunu .keywords ile gösterir; kapanış aynı işi yapar ama ek mantık (doğrulama, kayıt) eklemek için daha esnektir.' },
    { t: 'code', stage: 'Kendin yaz', id: 'kapanis-kapsam-8', diff: 2,
      q: '<p><code>hafizali(fonk)</code> fonksiyonunu yaz: tek argümanlı bir fonksiyonu alıp sonuçlarını hatırlayan yeni bir fonksiyon döndürsün. Aynı argümanla ikinci çağrıda <code>fonk</code> yeniden çalışmamalı. Önbelleği dışarıdan görebilmek için dönen fonksiyona <code>onbellek</code> özniteliği olarak aynı sözlüğü ekle.</p>',
      start: 'def hafizali(fonk):\n    pass\n',
      sol: 'def hafizali(fonk):\n    onbellek = {}\n    def sarici(x):\n        if x not in onbellek:\n            onbellek[x] = fonk(x)\n        return onbellek[x]\n    sarici.onbellek = onbellek\n    return sarici\n\ncagri = []\ndef kur(para):\n    cagri.append(para)\n    return {"USD": 32.5, "EUR": 35.1}[para]\nk = hafizali(kur)\nprint(k("USD"), k("USD"), k("EUR"), cagri)\n',
      tests: 'cagri = []\ndef kur(para):\n    cagri.append(para)\n    return {"USD": 32.5, "EUR": 35.1}[para]\nk = hafizali(kur)\nassert k("USD") == 32.5 and k("USD") == 32.5, "doğru kur dönmeli"\nassert cagri == ["USD"], "ikinci USD çağrısı önbellekten gelmeli; asıl fonksiyon bir kez çalışmalı"\nassert k("EUR") == 35.1 and cagri == ["USD", "EUR"], "yeni argüman asıl fonksiyonu çalıştırmalı"\nassert k.onbellek == {"USD": 32.5, "EUR": 35.1}, "onbellek özniteliği önbellek sözlüğü olmalı"\nk2 = hafizali(kur)\nassert k2.onbellek == {}, "her hafizali çağrısının kendi önbelleği olmalı"\n',
      hints: ['Önbellek sözlüğünü fabrikada oluştur; içine yazmak atama sayılmaz, nonlocal gerekmez.', 'sarici.onbellek = onbellek ile fonksiyona öznitelik eklenebilir.'],
      why: 'Sözlüğü değiştirmek (onbellek[x] = ...) adı yeniden bağlamadığı için nonlocal gerektirmez. Bu yapı functools.lru_cache\'in en sade hâlidir.' },
    { t: 'code', stage: 'Hata avı', kind: 'bug', id: 'kapanis-kapsam-9', diff: 2,
      q: '<p><b>Hatayı bul ve düzelt.</b> Bildirim servisinde her kanal için mesaj biçimlendiren fonksiyonlar üretiliyor. Ama <code>islevler["sms"]("Kargonuz yolda")</code> çağrısı <code>"[eposta] Kargonuz yolda"</code> döndürüyor. <code>bildirim_islevleri(kanallar)</code> fonksiyonunu düzelt.</p>',
      start: 'def bildirim_islevleri(kanallar):\n    islevler = {}\n    for kanal in kanallar:\n        islevler[kanal] = lambda mesaj: f"[{kanal}] {mesaj}"\n    return islevler\n\nislevler = bildirim_islevleri(["sms", "push", "eposta"])\nprint(islevler["sms"]("Kargonuz yolda"))\n',
      sol: 'def bildirim_islevleri(kanallar):\n    islevler = {}\n    for kanal in kanallar:\n        islevler[kanal] = lambda mesaj, kanal=kanal: f"[{kanal}] {mesaj}"\n    return islevler\n\nislevler = bildirim_islevleri(["sms", "push", "eposta"])\nprint(islevler["sms"]("Kargonuz yolda"))\n',
      tests: 'f = bildirim_islevleri(["sms", "push", "eposta"])\nassert f["sms"]("Kargonuz yolda") == "[sms] Kargonuz yolda", "sms işlevi kendi kanalını yazmalı; [eposta] görüyorsan geç bağlama"\nassert f["push"]("x") == "[push] x", "push işlevi [push] yazmalı"\nassert f["eposta"]("y") == "[eposta] y"\n',
      hints: ['Lambda kanal değişkenini değil, değişkenin hücresini yakalar; döngü bitince son kanal kalır.', 'lambda mesaj, kanal=kanal: ... değeri tanım anında sabitler.'],
      why: 'Döngüdeki her lambda aynı kanal hücresini paylaşıyordu. Varsayılan argüman değeri tanım anında kopyaladığı için her lambda kendi kanalını tutar. Fabrika fonksiyonu da aynı sorunu çözer.' },
    { t: 'code', stage: 'Hata avı', kind: 'bug', id: 'kapanis-kapsam-10', diff: 2,
      q: '<p><b>Hatayı bul ve düzelt.</b> Kasa raporu için <code>islem_kaydedici()</code> fabrikası, her çağrıda işlem sayısını ve toplam tutarı güncelleyip <code>(adet, toplam)</code> döndürmeli. Ama ilk çağrıda <code>UnboundLocalError</code> veriyor.</p>',
      start: 'def islem_kaydedici():\n    adet = 0\n    toplam = 0\n    def kaydet(tutar):\n        adet += 1\n        toplam = toplam + tutar\n        return adet, toplam\n    return kaydet\n\nk = islem_kaydedici()\nprint(k(100))\nprint(k(50))\n',
      sol: 'def islem_kaydedici():\n    adet = 0\n    toplam = 0\n    def kaydet(tutar):\n        nonlocal adet, toplam\n        adet += 1\n        toplam = toplam + tutar\n        return adet, toplam\n    return kaydet\n\nk = islem_kaydedici()\nprint(k(100))\nprint(k(50))\n',
      tests: 'k = islem_kaydedici()\nassert k(100) == (1, 100), "ilk işlemden sonra (1, 100)"\nassert k(50) == (2, 150), "ikinci işlemden sonra (2, 150)"\nk2 = islem_kaydedici()\nassert k2(10) == (1, 10), "yeni kaydedici sıfırdan başlamalı"\n',
      hints: ['İç fonksiyonda atama yapılan her ad yerel sayılır.', 'Tek satırda iki ad: nonlocal adet, toplam'],
      why: 'adet += 1 ve toplam = toplam + ... atama olduğu için iki ad da yerel sayılıyor ve okunmadan önce bağlanmamış oluyordu. nonlocal adet, toplam ile kapsayan fonksiyonun hücrelerine yazılır.' },
    { t: 'code', stage: 'Meydan okuma', id: 'kapanis-kapsam-11', diff: 3,
      q: '<p>Anadolu Bank API\'sinde hız sınırlayıcı: <code>oran_sinirlayici(limit, pencere)</code> fabrikasını yaz. Dönen <code>izin(zaman)</code> fonksiyonu, saniye cinsinden <code>zaman</code> alır. Son <code>pencere</code> saniyedeki (yani <code>zaman - pencere</code> değerinden <b>büyük</b> zamanlı) kabul edilmiş istek sayısı <code>limit</code>\'ten azsa isteği kaydedip <code>True</code>, değilse <code>False</code> döndürür (reddedilen istek kaydedilmez). Zaman geriye giderse (önceki çağrıdan küçükse) <code>ValueError</code> fırlat. Eski kayıtları silerek belleği sınırlı tut.</p>',
      start: 'def oran_sinirlayici(limit, pencere):\n    pass\n',
      sol: 'from collections import deque\n\ndef oran_sinirlayici(limit, pencere):\n    kabul = deque()\n    son = None\n    def izin(zaman):\n        nonlocal son\n        if son is not None and zaman < son:\n            raise ValueError("zaman geriye gidemez")\n        son = zaman\n        while kabul and kabul[0] <= zaman - pencere:\n            kabul.popleft()\n        if len(kabul) < limit:\n            kabul.append(zaman)\n            return True\n        return False\n    izin.kayitlar = kabul\n    return izin\n\ni = oran_sinirlayici(2, 10)\nprint([i(t) for t in [0, 1, 2, 10, 11, 12]])\n',
      tests: 'i = oran_sinirlayici(2, 10)\nassert [i(t) for t in [0, 1, 2]] == [True, True, False], "10 sn içinde en fazla 2 istek"\nassert i(10) is True, "zaman 10\'da 0\'daki kayıt pencereden çıkar (0 <= 10 - 10)"\nassert i(11) is True, "1\'deki kayıt da çıktı"\nassert i(12) is False, "10 ve 11 hâlâ pencerede"\ntry:\n    i(5)\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError("zaman geriye giderse ValueError")\nj = oran_sinirlayici(1, 5)\nassert j(0) and not j(4) and j(5), "pencere sınırı: 0 <= 5 - 5 olduğu için 5\'te yeniden izin"\nk = oran_sinirlayici(3, 1)\nfor t in range(1000):\n    k(t)\nif hasattr(k, "kayitlar"):\n    assert len(k.kayitlar) <= 3, "eski kayıtlar silinmeli"\nelse:\n    hucreler = [h.cell_contents for h in k.__closure__ if isinstance(h.cell_contents, (list, __import__(\'collections\').deque))]\n    assert all(len(h) <= 3 for h in hucreler), "eski kayıtlar silinmeli; liste sınırsız büyümemeli"\n',
      hints: ['Kabul edilen zamanları bir deque\'da tut; baştan eskileri popleft ile at.', 'Son zamanı tutmak için ikinci bir dış değişken ve nonlocal gerekir; deque\'ya eklemek için gerekmez.', 'Eski kayıt koşulu: kabul[0] <= zaman - pencere'],
      why: 'Kapanış iki tür durum tutar: değiştirilen bir nesne (deque, nonlocal gerekmez) ve yeniden bağlanan bir ad (son, nonlocal gerekir). Kayan pencere deque ile her çağrıda yalnızca süresi dolanları atar.' },
    { t: 'code', stage: 'Mini proje', id: 'kapanis-kapsam-12', diff: 3,
      q: '<p>Anadolu Market kampanya motoru. Üç fonksiyon yaz:</p><ul><li><code>kural(tur, deger)</code>: <code>"yuzde"</code> için tutarı yüzde <code>deger</code> indiren, <code>"sabit"</code> için <code>deger</code> TL düşen (0\'ın altına inmeyen) bir fonksiyon döndürsün. Başka tür için <code>ValueError</code>.</li><li><code>kosullu(kosul, kural_f)</code>: <code>kosul(tutar)</code> True ise <code>kural_f</code>\'yi uygulayan, değilse tutarı aynen döndüren fonksiyon döndürsün.</li><li><code>zincirle(*kurallar)</code>: kuralları sırayla uygulayıp sonucu 2 ondalığa yuvarlayan tek bir fonksiyon döndürsün.</li></ul>',
      start: 'def kural(tur, deger):\n    pass\n\ndef kosullu(kosul, kural_f):\n    pass\n\ndef zincirle(*kurallar):\n    pass\n',
      sol: 'def kural(tur, deger):\n    if tur == "yuzde":\n        return lambda t: t * (1 - deger / 100)\n    if tur == "sabit":\n        return lambda t: max(t - deger, 0)\n    raise ValueError(f"bilinmeyen kural türü: {tur}")\n\ndef kosullu(kosul, kural_f):\n    def uygula(t):\n        return kural_f(t) if kosul(t) else t\n    return uygula\n\ndef zincirle(*kurallar):\n    def uygula(t):\n        for k in kurallar:\n            t = k(t)\n        return round(t, 2)\n    return uygula\n\nkampanya = zincirle(kosullu(lambda t: t >= 500, kural("yuzde", 10)), kural("sabit", 50))\nprint(kampanya(400), kampanya(1000))\n',
      tests: 'y10 = kural("yuzde", 10)\nassert abs(y10(200) - 180) < 1e-9, "yüzde 10: 200 -> 180"\nassert kural("sabit", 50)(30) == 0, "sabit indirim 0\'ın altına inmemeli"\ntry:\n    kural("hediye", 1)\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError("bilinmeyen tür ValueError fırlatmalı")\nk = kosullu(lambda t: t >= 500, y10)\nassert k(400) == 400 and abs(k(500) - 450) < 1e-9, "kosullu yalnızca koşul sağlanınca uygulamalı"\nkampanya = zincirle(kosullu(lambda t: t >= 500, kural("yuzde", 10)), kural("sabit", 50))\nassert kampanya(400) == 350, "400: yüzde yok, 50 TL sabit -> 350"\nassert kampanya(1000) == 850.0, "1000: yüzde 10 -> 900, sonra -50 -> 850"\nassert zincirle()(123.456) == 123.46, "boş zincir yalnızca yuvarlar"\noranlar = [kural("yuzde", d) for d in (10, 20)]\nassert [round(f(100), 2) for f in oranlar] == [90.0, 80.0], "kural fabrikası geç bağlamaya düşmemeli"\n',
      hints: ['kural bir fabrika: tur\'a göre farklı lambda döndürür; deger kapanışta saklanır.', 'zincirle(*kurallar) içindeki iç fonksiyon for k in kurallar: t = k(t) yapar.', 'Bilinmeyen tür kontrolünü fabrikada yap, iç fonksiyonda değil.'],
      why: 'Her parça küçük bir fabrikadır: ayarı kapanışta tutar, aynı imzalı (tutar -> tutar) fonksiyon döndürür. Aynı imza sayesinde kurallar serbestçe birleşir; kural motorlarının temeli budur.' }
  ],
  faq: [
    { q: 'Kapanış ile dekoratör aynı şey mi?', a: 'Hayır ama çok yakın. Dekoratör, bir fonksiyonu alıp yeni fonksiyon döndüren bir fabrikadır ve döndürdüğü sarıcı, sarılan fonksiyonu kapanışla hatırlar. Yani her dekoratör kapanış kullanır, ama her kapanış dekoratör değildir.' },
    { q: 'nonlocal ile global aynı anda kullanılabilir mi?', a: 'Farklı adlar için evet: bir iç fonksiyonda <code>global ayar</code> ve <code>nonlocal sayac</code> birlikte yazılabilir. Aynı ad için ikisi birden kullanılamaz; SyntaxError verir.' },
    { q: 'Varsayılan argümanla (i=i) düzeltme neden çalışıyor?', a: 'Varsayılan değerler fonksiyon TANIMLANIRKEN bir kez hesaplanıp fonksiyonun <code>__defaults__</code> özelliğine kopyalanır. Böylece her lambda o anki değeri kendi içinde saklar; döngü değişkeninin hücresine bağlı kalmaz.' },
    { q: 'Kapanıştaki değeri dışarıdan değiştirebilir miyim?', a: 'Teknik olarak <code>f.__closure__[0].cell_contents = yeni</code> Python 3.7+ ile mümkündür ama bunu yalnızca hata ayıklamada yap. Dışarıdan değiştirilmesi gereken durum varsa sınıf ya da açık bir ayarlayıcı (setter) iç fonksiyon kullan.' },
    { q: 'Lambda da kapanış olabilir mi?', a: 'Evet. <code>lambda x: x * k</code> bir fonksiyon içinde yazılır ve k dış fonksiyondansa bu lambda da bir kapanıştır; __closure__ özelliği doludur. Lambda ile def arasında kapsam açısından hiçbir fark yoktur.' }
  ],
  mistakes: [
    { bad: 'def sayac():\n    n = 0\n    def say():\n        n += 1\n        return n\n    return say', good: 'def sayac():\n    n = 0\n    def say():\n        nonlocal n\n        n += 1\n        return n\n    return say', why: 'İç fonksiyonda atama yapılan ad yereldir; nonlocal olmadan UnboundLocalError alırsın.' },
    { bad: 'butonlar = [lambda: sil(s) for s in siparisler]', good: 'butonlar = [lambda s=s: sil(s) for s in siparisler]', why: 'Geç bağlama: tüm lambdalar döngü bittikten sonraki son s değerini görür ve hep son siparişi siler.' },
    { bad: 'def fabrika(k):\n    def f(x):\n        return x * k\n    return f()', good: 'def fabrika(k):\n    def f(x):\n        return x * k\n    return f', why: 'Fabrika fonksiyonu döndürmeli, çağırmamalı; f() yazınca TypeError (x eksik) alırsın ya da fonksiyon yerine sonuç dönen hatalı bir yapı kurarsın.' },
    { bad: 'def kasa():\n    nonlocal bakiye\n    bakiye = 0', good: 'bakiye = 0\ndef kasa():\n    global bakiye\n    bakiye = 0', why: 'nonlocal yalnızca kapsayan bir FONKSİYONdaki adı bulur; modül düzeyindeki ad için global gerekir (ya da daha iyisi, durumu parametreyle taşı).' }
  ]
});
})(window);
