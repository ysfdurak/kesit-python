/* ───────────────────────── 2. iteratorler-uretecler ───────────────────────── */
{
  id: 'iteratorler-uretecler',
  lv: 'orta',
  mod: 'Pythonic Kod',
  min: 30,
  title: 'Yineleyiciler ve üreteçler: veriyi akıtarak işle',
  sum: 'iter/next protokolünü, __iter__/__next__ ile kendi yineleyici sınıfını ve yield ile üreteç fonksiyonlarını öğrenir; büyük log akışını belleğe almadan satır satır işlersin.',
  goals: [
    'iter ve next ile for döngüsünün perde arkasını açıklayabilirim.',
    '__iter__ ve __next__ metotlarıyla kendi yineleyici sınıfımı yazabilirim.',
    'yield ile üreteç fonksiyonu yazıp tembel değerlendirmeden yararlanabilirim.',
    'Üreteçleri zincirleyerek büyük bir log akışını satır satır işleyebilirim.',
    'yield from ile üreteçleri birleştirebilir ve itertools\'un ne zaman devreye girdiğini söyleyebilirim.'
  ],
  body: `
<h2>Neden önemli?</h2>
<p>Anadolu Bank'ın işlem günlüğü (log) her gün milyonlarca satır üretir. "Dosyayı oku, listeye at, sonra işle" yaklaşımı küçük dosyada çalışır; büyük dosyada belleği doldurur ve program çöker. Python'ın çözümü, veriyi tek seferde değil <b>akıtarak</b> işlemektir: bir satır oku, işle, bırak, sonrakine geç. Bu akışın altyapısı yineleyici (iterator) protokolüdür; en kolay yazım biçimi de üreteç (generator) fonksiyonlarıdır. Bu dersi bitirdiğinde <code>for</code> döngüsünün aslında ne yaptığını, dosyaların neden satır satır okunabildiğini ve kendi veri akışlarını nasıl kuracağını bileceksin.</p>

<h2>for döngüsünün perde arkası: iter ve next</h2>
<p>Bir listeyi <code>for</code> ile gezdiğinde Python iki şey yapar: önce <code>iter(liste)</code> ile bir yineleyici alır, sonra bitene kadar <code>next(yineleyici)</code> çağırır. Bittiğini anlamanın yolu <code>StopIteration</code> istisnasıdır.</p>
<pre class="py">islemler = ["EFT 500", "Havale 1200", "Kart 90"]

it = iter(islemler)
print(type(it).__name__)
print(next(it))
print(next(it))
print(next(it))
try:
    next(it)
except StopIteration:
    print("Yineleyici tükendi")

# for döngüsü tam olarak bunu yapar:
it = iter(islemler)
while True:
    try:
        satir = next(it)
    except StopIteration:
        break
    print("işle:", satir)</pre>
<p>İki kavramı ayır: <b>yinelenebilir</b> (iterable), üzerinde <code>iter()</code> çağrılabilen her şeydir: liste, demet, sözlük, metin, dosya, range. <b>Yineleyici</b> (iterator), <code>next()</code> ile öğe veren nesnedir. Liste yinelenebilirdir ama yineleyici değildir; <code>next(liste)</code> hata verir. <code>iter(liste)</code> ise yineleyici döndürür. Yineleyiciler tek yönlüdür: geri saramazsın, tükenince biter.</p>
<div class="note"><b>next'in ikinci parametresi</b><code>next(it, None)</code> yazarsan tükendiğinde istisna yerine <code>None</code> döner. "İlk eşleşen öğe ya da yok" sorularında çok kullanışlıdır: <code>next((s for s in siparisler if s["no"] == 103), None)</code>.</div>

<h2>Kendi yineleyici sınıfın: __iter__ ve __next__</h2>
<p>Bir sınıf iki metot tanımlarsa yineleyici olur: <code>__iter__</code> kendisini döndürür, <code>__next__</code> sıradaki öğeyi döndürür ya da <code>StopIteration</code> fırlatır. Örnek: Anadolu Bank'ta bir hesaba günlük faiz işleyen, verilen gün kadar bakiye üreten sayaç.</p>
<pre class="py">class FaizAkisi:
    """Her gün bakiyeye günlük faiz ekler; gun_sayisi kadar bakiye üretir."""

    def __init__(self, bakiye, gunluk_oran, gun_sayisi):
        self.bakiye = bakiye
        self.oran = gunluk_oran
        self.kalan = gun_sayisi

    def __iter__(self):
        return self

    def __next__(self):
        if self.kalan == 0:
            raise StopIteration
        self.kalan -= 1
        self.bakiye = round(self.bakiye * (1 + self.oran), 2)
        return self.bakiye

for b in FaizAkisi(10000, 0.001, 3):
    print(b)

akis = FaizAkisi(500, 0.01, 2)
print(next(akis), next(akis), next(akis, "bitti"))</pre>
<p>Bu sınıf tüm günlerin listesini önceden hesaplamaz; her <code>next</code> çağrısında bir adım ilerler. Gün sayısı bir milyon olsa da bellekte yalnız üç sayı tutar. Fakat gördüğün gibi sınıf yazmak kalabalık: durum değişkenleri, iki metot, elle istisna. Python bunun kısa yolunu sunar.</p>

<h2>yield: üreteç fonksiyonu</h2>
<p>İçinde <code>yield</code> geçen bir fonksiyon, çağrıldığında çalışmaz; bir üreteç nesnesi döndürür. Her <code>next</code> çağrısında kod bir sonraki <code>yield</code>'e kadar koşar, değeri verir ve <b>olduğu yerde durur</b>; yerel değişkenler korunur. Fonksiyon bitince <code>StopIteration</code> kendiliğinden fırlar.</p>
<pre class="py">def faiz_akisi(bakiye, gunluk_oran, gun_sayisi):
    for _ in range(gun_sayisi):
        bakiye = round(bakiye * (1 + gunluk_oran), 2)
        yield bakiye

g = faiz_akisi(10000, 0.001, 3)
print(type(g).__name__)
print(list(g))

# Üreteç nerede durdu? Takip edelim
def adimli():
    print("  başladı")
    yield 1
    print("  1 ile 2 arası")
    yield 2
    print("  bitiyor")

u = adimli()
print("üreteç oluştu, henüz hiçbir şey basılmadı")
print(next(u))
print(next(u))
print(next(u, "son"))</pre>
<p>Önceki 15 satırlık sınıfın işini 4 satırlık fonksiyon yaptı. Çıktıdaki "başladı" yazısının ancak ilk <code>next</code>'te basıldığına dikkat et: üreteç <b>tembel</b>dir (lazy evaluation); istenmeden hiçbir şey hesaplamaz.</p>
<div class="tbl-wrap"><table>
<tr><th>Özellik</th><th>Liste döndüren fonksiyon</th><th>Üreteç fonksiyonu</th></tr>
<tr><td>Anahtar sözcük</td><td><code>return liste</code></td><td><code>yield öğe</code></td></tr>
<tr><td>Ne zaman hesaplar</td><td>Çağrıda, hepsini</td><td>next geldikçe, birer birer</td></tr>
<tr><td>Bellek</td><td>Tüm sonuç kadar</td><td>Tek öğe ve yerel değişkenler kadar</td></tr>
<tr><td>Yeniden gezme</td><td>İstediğin kadar</td><td>Tek sefer; yeniden çağır</td></tr>
<tr><td>Sonsuz dizi</td><td>İmkânsız</td><td>Doğal (while True + yield)</td></tr>
<tr><td>len, indeks</td><td>Var</td><td>Yok</td></tr>
</table></div>

<h2>Büyük log akışını satır satır işleme</h2>
<p>Asıl güç üreteçleri <b>zincirlemekte</b> ortaya çıkar. Her üreteç tek bir iş yapar ve sonucunu bir sonrakine akıtır; hiçbir aşamada tüm veri bellekte olmaz. Anadolu Bank'ın işlem günlüğünden "HATA" satırlarını ayıklayıp tutarlarını toplayalım. Burada log'u bir metin olarak üretiyoruz; gerçekte dosya satırlarını gezersin ve dosya nesnesi de zaten tembel bir yineleyicidir.</p>
<pre class="py">LOG = """2024-03-01 09:12 OK EFT 500
2024-03-01 09:15 HATA Havale 1200
2024-03-01 09:20 OK Kart 90

2024-03-01 09:31 HATA EFT 2500
2024-03-01 09:40 OK Havale 300
"""

def satirlar(metin):
    """Ham satırları üret; boşları at."""
    for satir in metin.splitlines():
        satir = satir.strip()
        if satir:
            yield satir

def ayristir(satirlar):
    """Her satırı sözlüğe çevir."""
    for s in satirlar:
        tarih, saat, durum, tur, tutar = s.split()
        yield {"saat": saat, "durum": durum, "tur": tur, "tutar": int(tutar)}

def hatalar(kayitlar):
    for k in kayitlar:
        if k["durum"] == "HATA":
            yield k

boru = hatalar(ayristir(satirlar(LOG)))
print(type(boru).__name__)   # henüz tek satır bile okunmadı

toplam = 0
for k in boru:
    print(k["saat"], k["tur"], k["tutar"])
    toplam += k["tutar"]
print("Hatalı işlem toplamı:", toplam)</pre>
<p>Üç üreteç üç küçük sorumluluk: temizle, ayrıştır, süz. Her birini ayrı ayrı test edebilir, yeniden kullanabilir, sıralarını değiştirebilirsin. Dosya büyüklüğü ne olursa olsun bellekte yalnız o anki satır bulunur. Gerçek dosyada ilk üreteci şöyle yazarsın: <code>with open(yol) as f: for satir in f: ...</code>.</p>
<div class="tip"><b>Boru hattı deseni</b>Veri işleme kodunu "kaynak üreteci → dönüştürücü üreteçler → tüketici döngü" biçiminde kur. pandas'ta, Spark'ta, Unix borularında aynı desen vardır; burada öğrendiğin kafa yapısı oralara taşınır.</div>

<h2>Sonsuz üreteçler ve erken durma</h2>
<p>Üreteç tüm değerleri önceden üretmediği için sonsuz dizi tanımlamak güvenlidir; yeter ki tüketen taraf bir yerde dursun.</p>
<pre class="py">def islem_no(baslangic=1000):
    n = baslangic
    while True:
        yield f"TRX-{n}"
        n += 1

uretici = islem_no()
for _ in range(3):
    print(next(uretici))

# break ile dur
for no in islem_no(2000):
    if no.endswith("3"):
        print("durduk:", no)
        break</pre>
<div class="warn"><b>Sonsuz üreteci list() ile sarma</b><code>list(islem_no())</code> yazarsan program asla bitmez ve belleği tüketir. Sonsuz üreteçleri daima <code>next</code>, <code>break</code> ya da <code>itertools.islice</code> ile sınırla.</div>

<h2>yield from: üreteçleri birleştir</h2>
<p>Bir üreteç başka bir yinelenebilirin tüm öğelerini aynen aktaracaksa <code>for x in kaynak: yield x</code> yerine <code>yield from kaynak</code> yazarsın. Hem kısadır hem iç içe yapıları (ağaç, kategori ağacı) gezmek için doğal okunur.</p>
<pre class="py">def ist_siparisleri():
    yield from ["IST-1", "IST-2"]

def ank_siparisleri():
    yield "ANK-1"

def tum_siparisler():
    yield from ist_siparisleri()
    yield from ank_siparisleri()
    yield "MANUEL-1"

print(list(tum_siparisler()))

# Kategori ağacını düzleştir
kategoriler = {
    "ad": "Elektronik",
    "alt": [
        {"ad": "Telefon", "alt": []},
        {"ad": "Bilgisayar", "alt": [{"ad": "Dizüstü", "alt": []}]},
    ],
}

def adlar(kat):
    yield kat["ad"]
    for alt in kat["alt"]:
        yield from adlar(alt)

print(list(adlar(kategoriler)))</pre>
<p><code>adlar</code> fonksiyonu kendini çağırıyor (özyineleme) ve her alt dalın ürettiklerini <code>yield from</code> ile yukarı aktarıyor. Aynı şeyi iç içe döngülerle yazmak hem uzun hem hataya açıktır.</p>

<h2>itertools'a köprü</h2>
<p>Üreteçlerle yaptığın birçok işin hazır, C ile yazılmış ve tembel çalışan sürümü <code>itertools</code> modülündedir. Birkaç tanıdık:</p>
<pre class="py">import itertools

def islem_no(n=1):
    while True:
        yield f"TRX-{n}"
        n += 1

# Sonsuz üreteçten güvenle ilk 3'ü al
print(list(itertools.islice(islem_no(), 3)))

# Koşul bozulana kadar al
tutarlar = [100, 250, 400, 90, 800]
print(list(itertools.takewhile(lambda t: t &lt; 300, tutarlar)))

# Birden fazla kaynağı tek akışta gez
ist = ["IST-1", "IST-2"]
ank = ["ANK-1"]
print(list(itertools.chain(ist, ank)))

# Koşarak toplam (running total)
print(list(itertools.accumulate([100, 250, 400])))</pre>
<p>Bunların hepsi üreteç döndürür; yani zincirine sorunsuz eklenirler. Ayrıntılı tur için ileride "collections/itertools" dersi var; bu derste bilmen gereken şu: kendi üretecini yazmadan önce itertools'ta hazırı var mı diye bak.</p>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Üreteçle iki yönlü iletişim</h3>
<p><code>yield</code> bir ifadedir, değer de alabilir: <code>alinan = yield verilen</code> yazdığında dışarıdan <code>g.send(deger)</code> ile üretece veri gönderebilirsin. Bu özellik, durumu koruyan işlemci (coroutine) yazmayı sağlar; örneğin koşan ortalama hesaplayan, her gönderilen tutarda güncel ortalamayı veren bir üreteç. <code>g.close()</code> üreteci düzgünce kapatır, içindeki <code>finally</code> bloklarını çalıştırır. Python'ın <code>asyncio</code> altyapısı tarihsel olarak bu mekanizmanın üstüne kuruldu; İleri seviyedeki async dersinde "await" gördüğünde "yield'in bir kuzeni" diye düşünebilirsin.</p>
<h3>İş hayatında nasıl görünür?</h3>
<p>Veri mühendisliği işlerinde "dosyayı bir seferde okuma" kuralı neredeyse kutsaldır. Bir ETL betiği 20 GB'lık CSV'yi satır satır gezer, her satırı dönüştürür ve hedefe parça parça yazar; bu dersin boru hattı deseni birebir oradadır. API sayfalama (pagination) kodu da tipik bir üreteçtir: "sayfa çek, kayıtları yield et, sonraki sayfa varsa devam et"; tüketici tarafı sayfa kavramını hiç görmez. Kod incelemesinde "bu fonksiyon liste döndürmek yerine yield etmeli" notu, bellek sorununu daha oluşmadan önleyen klasik bir yorumdur.</p>
</section>
`,
  ex: [
    { t: 'mc', q: '<code>it = iter([1, 2]); next(it); next(it); next(it)</code> satırı çalıştırıldığında ne olur?',
      o: ['None döner', 'StopIteration fırlar', '1 döner, baştan başlar', 'IndexError fırlar'], a: 1,
      why: 'Yineleyici tükenince next, StopIteration fırlatır. for döngüsü bu istisnayı yakalayıp döngüyü bitirir; varsayılan vermek için next(it, None) kullanılır.' },
    { t: 'code', id: 'iteratorler-uretecler-1',
      q: '<p><code>ciftler(n)</code> adında bir üreteç fonksiyonu yaz: 0\'dan başlayıp <code>n</code> dahil olmayana kadar çift sayıları sırayla <code>yield</code> etsin. Liste döndürme; fonksiyon çağrıldığında bir üreteç nesnesi dönmeli.</p>',
      start: 'def ciftler(n):\n    # yield kullan\n    pass\n',
      sol: 'def ciftler(n):\n    for i in range(0, n, 2):\n        yield i\n',
      tests: 'import types\nassert isinstance(ciftler(5), types.GeneratorType), "fonksiyon üreteç döndürmeli (yield kullan)"\nassert list(ciftler(7)) == [0, 2, 4, 6], "ciftler(7) -> 0,2,4,6"\nassert list(ciftler(0)) == [], "ciftler(0) boş olmalı"\nassert next(ciftler(10)) == 0, "ilk değer 0 olmalı"\n',
      hints: ['range(0, n, 2) çift sayıları verir.', 'Döngü içinde yield i yaz; return yok.'],
      why: 'İçinde yield geçen fonksiyon çağrılınca üreteç nesnesi döner; her next bir sonraki yield\'e kadar koşar.' },
    { t: 'code', id: 'iteratorler-uretecler-2',
      q: '<p><code>Sayac</code> sınıfını yaz: <code>Sayac(baslangic, bitis)</code> ile kurulsun ve <code>for</code> ile gezildiğinde <code>baslangic</code>\'tan <code>bitis</code>\'e kadar (bitis dahil) tam sayıları üretsin. <code>__iter__</code> ve <code>__next__</code> metotlarını kendin yaz; <code>range</code> ya da <code>yield</code> kullanma.</p>',
      start: 'class Sayac:\n    def __init__(self, baslangic, bitis):\n        self.simdiki = baslangic\n        self.bitis = bitis\n\n    def __iter__(self):\n        pass\n\n    def __next__(self):\n        pass\n',
      sol: 'class Sayac:\n    def __init__(self, baslangic, bitis):\n        self.simdiki = baslangic\n        self.bitis = bitis\n\n    def __iter__(self):\n        return self\n\n    def __next__(self):\n        if self.simdiki > self.bitis:\n            raise StopIteration\n        deger = self.simdiki\n        self.simdiki += 1\n        return deger\n',
      tests: 'assert list(Sayac(3, 6)) == [3, 4, 5, 6], "Sayac(3, 6) -> 3,4,5,6"\nassert list(Sayac(5, 4)) == [], "başlangıç > bitiş ise boş"\ns = Sayac(1, 2)\nassert next(s) == 1 and next(s) == 2, "next sırayla 1, 2 vermeli"\ntry:\n    next(s)\n    assert False, "tükenince StopIteration fırlatmalı"\nexcept StopIteration:\n    pass\nimport types\nk = Sayac(1, 3)\nassert iter(k) is k, "__iter__ nesnenin kendisini döndürmeli"\nassert not isinstance(k, types.GeneratorType), "sınıf tabanlı yineleyici bekleniyor"\n',
      hints: ['__iter__ self döndürmeli.', '__next__ içinde sınırı aşınca raise StopIteration.', 'Değeri döndürmeden önce simdiki\'yi bir artır.'],
      why: '__iter__ nesnenin kendisini verir; __next__ durumu ilerletir ve bitince StopIteration fırlatır. for döngüsü bu protokolü kullanır.' },
    { t: 'mc', q: 'Aşağıdaki kod ne basar?<pre class="out">def u():\n    print("A")\n    yield 1\n    print("B")\ng = u()\nprint("C")\nnext(g)</pre>',
      o: ['A, C', 'C, A', 'A, B, C', 'C, A, B'], a: 1,
      why: 'Üreteç fonksiyonu çağrıldığında gövdesi çalışmaz; önce "C" basılır. İlk next, ilk yield\'e kadar koşar ve "A" basar. "B" için ikinci next gerekir.' },
    { t: 'code', id: 'iteratorler-uretecler-3',
      q: '<p>Log akışı için iki üreteç yaz. <code>temiz_satirlar(metin)</code>: metni satırlara bölsün, baştaki/sondaki boşlukları kırpsın, boş satırları atlayıp kalanları <code>yield</code> etsin. <code>hatali_tutarlar(satirlar)</code>: her satır <code>"SAAT DURUM TUTAR"</code> biçiminde; durumu <code>"HATA"</code> olanların tutarını <code>int</code> olarak <code>yield</code> etsin. İki fonksiyon da üreteç olmalı.</p>',
      start: 'def temiz_satirlar(metin):\n    pass\n\ndef hatali_tutarlar(satirlar):\n    pass\n',
      sol: 'def temiz_satirlar(metin):\n    for satir in metin.splitlines():\n        satir = satir.strip()\n        if satir:\n            yield satir\n\ndef hatali_tutarlar(satirlar):\n    for s in satirlar:\n        saat, durum, tutar = s.split()\n        if durum == "HATA":\n            yield int(tutar)\n',
      tests: 'import types\nLOG = "09:00 OK 100\\n\\n  09:05 HATA 250  \\n09:10 HATA 40\\n09:20 OK 5\\n"\nassert isinstance(temiz_satirlar(LOG), types.GeneratorType), "temiz_satirlar üreteç olmalı"\nassert list(temiz_satirlar(LOG)) == ["09:00 OK 100", "09:05 HATA 250", "09:10 HATA 40", "09:20 OK 5"], "boş satır atlanmalı, boşluk kırpılmalı"\nassert isinstance(hatali_tutarlar(iter([])), types.GeneratorType), "hatali_tutarlar üreteç olmalı"\nassert list(hatali_tutarlar(temiz_satirlar(LOG))) == [250, 40], "HATA tutarları [250, 40] olmalı"\nassert sum(hatali_tutarlar(temiz_satirlar(LOG))) == 290, "toplam 290"\n',
      hints: ['metin.splitlines() ile satırlara böl, strip() ile kırp.', 'if satir: yield satir ile boşları atla.', 'İkinci fonksiyonda s.split() üç parça verir; int(tutar) yield et.'],
      why: 'İki üreteç zincirlenir: ilki temizler, ikincisi süzüp dönüştürür. Hiçbir aşamada tüm log bellekte tutulmaz.' },
    { t: 'code', id: 'iteratorler-uretecler-4',
      q: '<p><code>islem_no(baslangic)</code> sonsuz bir üreteç olsun: <code>"TRX-1000"</code>, <code>"TRX-1001"</code>, ... biçiminde sınırsız numara üretsin. Sonra <code>ilk_n(uretec, n)</code> fonksiyonunu yaz: herhangi bir yineleyiciden ilk <code>n</code> öğeyi liste olarak döndürsün (<code>itertools.islice</code> kullanabilir ya da <code>next</code> ile yazabilirsin).</p>',
      start: 'def islem_no(baslangic):\n    pass\n\ndef ilk_n(uretec, n):\n    pass\n',
      sol: 'import itertools\n\ndef islem_no(baslangic):\n    n = baslangic\n    while True:\n        yield f"TRX-{n}"\n        n += 1\n\ndef ilk_n(uretec, n):\n    return list(itertools.islice(uretec, n))\n',
      tests: 'assert ilk_n(islem_no(1000), 3) == ["TRX-1000", "TRX-1001", "TRX-1002"], "ilk üç numara"\nassert ilk_n(islem_no(5), 0) == [], "n=0 için boş"\ng = islem_no(1)\nnext(g); next(g)\nassert ilk_n(g, 2) == ["TRX-3", "TRX-4"], "kaldığı yerden devam etmeli"\nassert ilk_n(iter([1, 2]), 5) == [1, 2], "kaynak kısa ise olanı döndür"\n',
      hints: ['while True içinde yield f"TRX-{n}" ve n += 1.', 'itertools.islice(uretec, n) ilk n öğeyi tembelce verir; list ile topla.'],
      why: 'Sonsuz üreteç güvenlidir çünkü tembeldir; islice yalnız istenen kadar next çağırır.' },
    { t: 'code', id: 'iteratorler-uretecler-5',
      q: '<p>Kategori ağacı <code>{"ad": ..., "alt": [...]}</code> biçiminde iç içe sözlüklerden oluşuyor. <code>adlar(kat)</code> üreteç fonksiyonunu yaz: önce düğümün adını, sonra tüm alt düğümlerin adlarını derinlik öncelikli sırayla <code>yield</code> etsin. Alt düğümler için kendini çağır ve <code>yield from</code> kullan.</p>',
      start: 'def adlar(kat):\n    pass\n',
      sol: 'def adlar(kat):\n    yield kat["ad"]\n    for alt in kat["alt"]:\n        yield from adlar(alt)\n',
      tests: 'agac = {"ad": "Elektronik", "alt": [\n    {"ad": "Telefon", "alt": []},\n    {"ad": "Bilgisayar", "alt": [{"ad": "Dizüstü", "alt": []}, {"ad": "Masaüstü", "alt": []}]},\n]}\nassert list(adlar(agac)) == ["Elektronik", "Telefon", "Bilgisayar", "Dizüstü", "Masaüstü"], "derinlik öncelikli sıra bekleniyor"\nassert list(adlar({"ad": "Tek", "alt": []})) == ["Tek"], "yaprak düğüm yalnız kendi adını vermeli"\nimport types\nassert isinstance(adlar(agac), types.GeneratorType), "adlar üreteç olmalı"\n',
      hints: ['Önce yield kat["ad"].', 'Sonra for alt in kat["alt"]: yield from adlar(alt).'],
      why: 'yield from, alt çağrının ürettiği her öğeyi yukarı aktarır; özyinelemeyle ağaç tek düz akışa dönüşür.' },
    { t: 'mc', q: 'Bir üreteç fonksiyonunun sonucunu hem toplamak hem de en büyüğünü bulmak istiyorsun. Doğru yaklaşım hangisi?',
      o: ['g = f(); sum(g); max(g)', 'Önce list(f()) ile listeye al, ikisini ondan hesapla', 'max(g) önce, sum(g) sonra çağır', 'reversed(g) ile ikinci bir geçiş yaparak max\'ı bul'], a: 1,
      why: 'Üreteç tek geçişliktir; sum onu tüketince max boş akış görür ve hata verir. Birden çok kullanım için listeye çevir ya da üreteci yeniden oluştur.' }
  ],
  faq: [
    { q: 'Yinelenebilir (iterable) ile yineleyici (iterator) arasındaki fark ne?', a: 'Yinelenebilir, iter() ile üzerinde yineleyici alınabilen her şeydir (liste, dosya, sözlük). Yineleyici ise next() ile öğe veren nesnedir ve tek yönlüdür. Her yineleyici aynı zamanda yinelenebilirdir (iter kendisini döndürür) ama liste bir yineleyici değildir.' },
    { q: 'Üreteç fonksiyonunda return kullanabilir miyim?', a: 'Evet; return üreteci bitirir (StopIteration fırlar). return\'e değer verirsen bu değer StopIteration.value olarak taşınır ve yield from ifadesinin sonucu olur; günlük kullanımda nadiren gerekir.' },
    { q: 'Üretecin kaç öğe üreteceğini len ile öğrenebilir miyim?', a: 'Hayır; üreteç öğeleri önceden bilmez. Saymak istersen sum(1 for _ in g) yazabilirsin ama bu üreteci tüketir. Sayı gerekiyorsa listeye çevir.' },
    { q: 'Dosyaları for ile satır satır okumak da mı tembel?', a: 'Evet. Dosya nesnesi bir yineleyicidir; for satir in f her adımda tek satır okur. Bu yüzden büyük dosyalarda f.read() ya da f.readlines() yerine doğrudan for kullan.' }
  ],
  mistakes: [
    { bad: 'def kareler(n):\n    sonuc = []\n    for i in range(n):\n        sonuc.append(i * i)\n    return sonuc\ntoplam = sum(kareler(10_000_000))', good: 'def kareler(n):\n    for i in range(n):\n        yield i * i\ntoplam = sum(kareler(10_000_000))', why: 'Liste sürümü on milyon sayıyı belleğe alır; üreteç sürümü tek tek üretir ve sum tüketir.' },
    { bad: 'g = (x for x in veri)\nprint(sum(g))\nprint(max(g))', good: 'liste = list(veri)\nprint(sum(liste))\nprint(max(liste))', why: 'Üreteç sum ile tükenir; max boş akışa "max() arg is an empty sequence" hatası verir.' },
    { bad: 'def sonsuz():\n    n = 0\n    while True:\n        yield n\n        n += 1\nhepsi = list(sonsuz())', good: 'import itertools\nilk10 = list(itertools.islice(sonsuz(), 10))', why: 'Sonsuz üreteci list ile sarmak programı asla bitmeyen bir döngüye sokar; islice ya da break ile sınırla.' },
    { bad: 'class Sayac:\n    def __next__(self):\n        ...\nfor x in Sayac():\n    pass', good: 'class Sayac:\n    def __iter__(self):\n        return self\n    def __next__(self):\n        ...', why: 'for döngüsü önce iter() çağırır; __iter__ yoksa "object is not iterable" hatası alırsın.' }
  ]
},
