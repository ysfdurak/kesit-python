/* ───────────────────────── 3. fonksiyonel ───────────────────────── */
{
  id: 'fonksiyonel',
  lv: 'orta',
  mod: 'Pythonic Kod',
  min: 28,
  title: 'Fonksiyonel araçlar: lambda, map, sorted key ve closure',
  sum: 'Fonksiyonları değer gibi kullanmayı öğrenir; lambda, map/filter/reduce, çok anahtarlı sorted, any/all, closure ve functools.partial ile veriyi kısa ve esnek biçimde işlersin.',
  goals: [
    'Fonksiyonu değişkene atayıp başka fonksiyona argüman olarak geçirebilirim.',
    'lambda ile tek satırlık isimsiz fonksiyon yazabilir, ne zaman def tercih edeceğimi bilirim.',
    'sorted ve key ile tek ya da çok anahtarlı, karışık yönlü sıralama yapabilirim.',
    'map/filter/reduce ile any/all araçlarını yerinde kullanabilirim.',
    'Closure ve functools.partial ile davranışı parametreleyen fonksiyonlar üretebilirim.'
  ],
  body: `
<h2>Neden önemli?</h2>
<p>Anadolu Market'in rapor ekibinden şu istek gelsin: "Siparişleri önce şehre göre alfabetik, aynı şehirde tutara göre büyükten küçüğe sırala." Ya da Ilgaz Bank'tan: "Her şube için farklı komisyon oranıyla hesaplama yapan bir fonksiyon üret." Bu isteklerin ortak noktası, <b>fonksiyonun kendisinin bir veri gibi</b> ele alınmasıdır: sıralama ölçütünü fonksiyon olarak ver, komisyon oranını fonksiyona gömüp yeni fonksiyon üret. Python'da fonksiyonlar birinci sınıf (first-class) nesnelerdir: değişkene atanır, listeye konur, argüman olarak geçirilir, başka fonksiyondan döndürülür. Bu dersteki araçların hepsi bu tek fikrin üstüne kuruludur.</p>

<h2>Fonksiyon bir değerdir</h2>
<pre class="py">def kdv_ekle(tutar):
    return round(tutar * 1.20, 2)

def indirim_uygula(tutar):
    return round(tutar * 0.90, 2)

# Değişkene ata (parantez yok: çağırmıyoruz, işaret ediyoruz)
islem = kdv_ekle
print(islem(100))

# Listeye koy, sırayla uygula
boru = [indirim_uygula, kdv_ekle]
tutar = 1000
for f in boru:
    tutar = f(tutar)
    print(f.__name__, "->", tutar)

# Argüman olarak geçir
def uygula(fonk, degerler):
    return [fonk(d) for d in degerler]

print(uygula(kdv_ekle, [100, 250]))</pre>
<p><code>kdv_ekle</code> ile <code>kdv_ekle()</code> arasındaki fark kritik: ilki fonksiyon nesnesinin kendisi, ikincisi onun çağrılıp dönen sonucu. Argüman olarak her zaman parantezsiz halini verirsin.</p>

<h2>lambda: tek satırlık isimsiz fonksiyon</h2>
<p><code>lambda parametreler: ifade</code>, tek bir ifade döndüren küçük bir fonksiyon üretir. Adı yoktur, <code>return</code> yazılmaz, gövdesi tek ifadedir. Yeri, başka fonksiyona kısa bir ölçüt verirken.</p>
<pre class="py">kare = lambda x: x * x
print(kare(7))

# Asıl kullanım: argüman olarak
siparisler = [("IST-1", 1200), ("ANK-2", 350), ("IZM-3", 4800)]
print(sorted(siparisler, key=lambda s: s[1]))
print(max(siparisler, key=lambda s: s[1]))</pre>
<div class="warn"><b>lambda'yı değişkene atama</b><code>kare = lambda x: x * x</code> çalışır ama PEP 8 buna karşıdır: hata mesajlarında adı "&lt;lambda&gt;" görünür ve docstring yazamazsın. Bir ad verecek kadar önemliyse <code>def</code> yaz. lambda yalnız "o anda, o satırda" gereken küçük ölçütler içindir.</div>

<h2>sorted ve key: tek, çoklu ve karışık yönlü sıralama</h2>
<p><code>sorted(kaynak, key=f)</code>, her öğe için <code>f(öğe)</code>'yi hesaplar ve bu değere göre sıralar; öğenin kendisi değişmez. Birden fazla ölçüt için key bir demet döndürür: Python demetleri soldan sağa karşılaştırır.</p>
<pre class="py">siparisler = [
    {"no": 101, "sehir": "İstanbul", "tutar": 1200},
    {"no": 102, "sehir": "Ankara", "tutar": 350},
    {"no": 103, "sehir": "İstanbul", "tutar": 4800},
    {"no": 104, "sehir": "Ankara", "tutar": 2100},
    {"no": 105, "sehir": "İzmir", "tutar": 90},
]

# Tek anahtar
for s in sorted(siparisler, key=lambda s: s["tutar"], reverse=True):
    print(s["no"], s["tutar"])
print("---")

# Çok anahtar: şehir artan, sonra tutar artan
for s in sorted(siparisler, key=lambda s: (s["sehir"], s["tutar"])):
    print(s["sehir"], s["tutar"])
print("---")

# Karışık yön: şehir artan, tutar AZALAN -> sayıyı eksiyle ters çevir
for s in sorted(siparisler, key=lambda s: (s["sehir"], -s["tutar"])):
    print(s["sehir"], s["tutar"])</pre>
<p>Karışık yön hilesi sayılar için <code>-değer</code>. Metin alanını ters çevirmek gerekirse iki aşamalı sıralama yaparsın: önce ikincil anahtara göre sırala, sonra birincil anahtara göre <code>reverse=True</code> ile; Python'ın sıralaması kararlı (stable) olduğu için eşit öğelerin önceki sırası korunur. Sözlük alanlarına erişim için <code>operator.itemgetter("sehir", "tutar")</code> lambda'nın hazır ve biraz daha hızlı karşılığıdır.</p>
<div class="note"><b>Türkçe harf sırası</b>Varsayılan sıralama Unicode kod noktasına göredir; "İzmir" ile "Istanbul" beklediğin sırada gelmeyebilir ve "ç", "z"den sonra gelir. Basit işler için <code>key=str.casefold</code> yeter; tam Türkçe sıralama için <code>locale</code> ya da özel bir anahtar fonksiyonu gerekir.</div>

<h2>map, filter, reduce</h2>
<p>Üç klasik: <code>map(f, kaynak)</code> her öğeye f uygular, <code>filter(f, kaynak)</code> f'nin True döndürdüğü öğeleri tutar, <code>functools.reduce(f, kaynak)</code> öğeleri ikişer ikişer birleştirerek tek değere indirger. map ve filter tembel yineleyici döndürür.</p>
<pre class="py">from functools import reduce

tutarlar = [1200, 350, 4800, 90]

print(list(map(lambda t: t * 1.2, tutarlar)))
print(list(filter(lambda t: t &gt; 500, tutarlar)))
print(reduce(lambda a, b: a + b, tutarlar))
print(reduce(lambda a, b: a if a &gt; b else b, tutarlar))

# map ile hazır fonksiyon: lambda gerekmez
metin_tutarlar = ["1200", "350"]
print(list(map(int, metin_tutarlar)))
print(sum(map(int, metin_tutarlar)))

# Aynı işler comprehension ile
print([t * 1.2 for t in tutarlar])
print([t for t in tutarlar if t &gt; 500])
print(sum(tutarlar), max(tutarlar))</pre>
<p>Son blok önemli bir dersi gösteriyor: map/filter'ın lambda ile kullanımı çoğu zaman comprehension'dan daha az okunur, ve <code>reduce</code>'un en yaygın iki kullanımı zaten <code>sum</code> ve <code>max</code> olarak hazır. Kural şu:</p>
<div class="tbl-wrap"><table>
<tr><th>Durum</th><th>Tercih</th><th>Örnek</th></tr>
<tr><td>Hazır fonksiyon uygulanacak</td><td>map</td><td><code>map(int, satirlar)</code>, <code>map(str.strip, satirlar)</code></td></tr>
<tr><td>Dönüşüm bir ifade</td><td>comprehension</td><td><code>[t * 1.2 for t in tutarlar]</code></td></tr>
<tr><td>Süzme + dönüşüm birlikte</td><td>comprehension</td><td><code>[t * 1.2 for t in tutarlar if t &gt; 500]</code></td></tr>
<tr><td>Toplam, en büyük, en küçük</td><td>sum/max/min</td><td><code>sum(tutarlar)</code></td></tr>
<tr><td>Özel ikili birleştirme</td><td>reduce</td><td>Sözlükleri birleştirmek, çarpım</td></tr>
<tr><td>Fonksiyonu zincire argüman vermek</td><td>map/filter</td><td>Boru hattında ölçüt dışarıdan geliyorsa</td></tr>
</table></div>

<h2>any ve all</h2>
<p>İki küçük ama çok kullanılan araç. <code>any</code> "en az biri doğru mu", <code>all</code> "hepsi doğru mu" sorar; ikisi de üreteç ifadesiyle en güzel okunur ve sonucu bulur bulmaz durur (kısa devre).</p>
<pre class="py">basvurular = [
    {"ad": "Ayşe", "gelir": 25000, "kara_liste": False},
    {"ad": "Mehmet", "gelir": 9000, "kara_liste": False},
    {"ad": "Zeynep", "gelir": 40000, "kara_liste": True},
]
print(any(b["kara_liste"] for b in basvurular))
print(all(b["gelir"] &gt;= 10000 for b in basvurular))
print(all(b["ad"] for b in basvurular))   # boş ad yok mu?
print(any([]), all([]))                     # boş kaynakta: False, True</pre>

<h2>Closure: ayarını içinde taşıyan fonksiyon</h2>
<p>Bir fonksiyon, içinde tanımlanan başka bir fonksiyonu döndürürse, içteki fonksiyon dıştakinin değişkenlerini "hatırlar". Bu yapıya closure (kapanış) denir. Ilgaz Bank'ta her şubenin komisyon oranı farklı olsun: tek bir fabrika (factory) fonksiyonundan şubeye özel hesaplayıcılar üretirsin.</p>
<pre class="py">def komisyon_hesaplayici(oran, asgari):
    def hesapla(tutar):
        return max(round(tutar * oran, 2), asgari)
    return hesapla

kadikoy = komisyon_hesaplayici(0.015, 5)
merkez = komisyon_hesaplayici(0.010, 10)

print(kadikoy(1000), kadikoy(100))
print(merkez(1000), merkez(100))

# İçteki fonksiyon neyi hatırlıyor?
print(kadikoy.__closure__[0].cell_contents, kadikoy.__closure__[1].cell_contents)

# Sayaç: durum tutan closure (nonlocal gerekir)
def sayac():
    adet = 0
    def arttir():
        nonlocal adet
        adet += 1
        return adet
    return arttir

say = sayac()
print(say(), say(), say())</pre>
<p><code>nonlocal</code>, içteki fonksiyonun dıştaki değişkene <b>yazmasına</b> izin verir; yalnız okuyorsan gerekmez. Closure, "ayar + davranış" paketlemenin hafif yoludur; sınıf yazmaya değmeyecek kadar küçük durumlar için idealdir. Bir sonraki derste göreceğin dekoratörler tümüyle closure'dur.</p>

<h2>functools.partial: argümanı önceden doldur</h2>
<p>Varolan bir fonksiyonun bazı argümanlarını sabitleyip yeni fonksiyon üretmek istiyorsan closure yazmana gerek yok; <code>partial</code> bunu tek satırda yapar.</p>
<pre class="py">from functools import partial

def fiyatla(tutar, kdv, indirim):
    return round(tutar * (1 - indirim) * (1 + kdv), 2)

standart = partial(fiyatla, kdv=0.20, indirim=0.0)
kampanya = partial(fiyatla, kdv=0.20, indirim=0.15)

print(standart(1000))
print(kampanya(1000))
print(list(map(kampanya, [100, 200])))

# Hazır fonksiyonlarla da
ikili = partial(int, base=2)
print(ikili("1010"))</pre>
<p><code>partial</code> ürünü sıradan bir çağrılabilirdir; <code>map</code>'e, <code>sorted</code>'ın key'ine, bir dekoratöre argüman olarak verilebilir. Doldurduğun argümanları çağrı anında yeniden geçersen senin verdiğin kazanır.</p>

<h2>Hepsi bir arada: Anadolu Market sipariş raporu</h2>
<pre class="py">from functools import partial

siparisler = [
    {"no": 101, "sehir": "İstanbul", "tutar": 1200, "durum": "teslim"},
    {"no": 102, "sehir": "Ankara", "tutar": 350, "durum": "iptal"},
    {"no": 103, "sehir": "İstanbul", "tutar": 4800, "durum": "kargoda"},
    {"no": 104, "sehir": "Ankara", "tutar": 2100, "durum": "teslim"},
]

def esik_ustu(esik, s):
    return s["durum"] != "iptal" and s["tutar"] &gt;= esik

buyukler = list(filter(partial(esik_ustu, 1000), siparisler))
sirali = sorted(buyukler, key=lambda s: (s["sehir"], -s["tutar"]))
for s in sirali:
    print(f'{s["sehir"]:&lt;10}{s["no"]:&gt;5}{s["tutar"]:&gt;8}')
print("Hepsi 1000 üstü mü:", all(s["tutar"] &gt;= 1000 for s in sirali))</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Saf fonksiyon ve test edilebilirlik</h3>
<p>Fonksiyonel programlamanın kalbi saf fonksiyondur (pure function): aynı girdiye her zaman aynı çıktıyı verir, dışarıdaki hiçbir şeyi değiştirmez. <code>kdv_ekle(100)</code> saftır; "global listeye ekleyen" bir fonksiyon değildir. Saf fonksiyonlar test etmesi en kolay kod parçalarıdır: girdi ver, çıktıyı assert et, bitti. İş kodunda veri dönüşümlerini saf fonksiyonlara, yan etkileri (dosya yazma, veritabanı, e-posta) ise sınırlı birkaç noktaya toplarsan hem test hem hata ayıklama kolaylaşır.</p>
<h3>Closure'ın geç bağlanma tuzağı</h3>
<p>Döngü içinde lambda ya da iç fonksiyon üretirken dikkat: <code>[lambda: i for i in range(3)]</code> listesindeki üç fonksiyon da çağrıldığında 2 döndürür; çünkü <code>i</code> çağrı anında okunur, döngü bitmiştir. Çözüm değeri o anda bağlamak: <code>lambda i=i: i</code> ya da <code>partial</code>. Bu tuzak kod incelemelerinde ve mülakatlarda sık çıkar.</p>
<h3>İş hayatında nasıl görünür?</h3>
<p>pandas'ta <code>df["tutar"].map(f)</code> ve <code>df.apply(f, axis=1)</code>, bu dersteki map'in sütun üzerinde çalışan hali. Web çerçevelerinde yol (route) işleyicileri, olay dinleyicileri ve geri çağırma (callback) fonksiyonları hep "fonksiyonu argüman olarak geçir" kalıbıdır. Konfigürasyonla davranış üretme (şube bazlı komisyon, müşteri segmentine göre indirim) ise closure ve partial'ın doğal alanıdır; bu desenle bir "if şube == ... elif şube == ..." zincirinden kurtulursun.</p>
</section>
`,
  ex: [
    { t: 'mc', q: '<code>sorted(kayitlar, key=lambda k: (k["sehir"], -k["tutar"]))</code> ne yapar?',
      o: ['Şehre göre azalan, aynı şehirde tutara göre artan sıralar', 'Şehir artan, aynı şehirde tutar azalan', 'Yalnız tutara göre azalan sıralar', 'Negatif tutarları başa alır'], a: 1,
      why: 'Demet soldan sağa karşılaştırılır: önce şehir alfabetik artan; eşit şehirlerde -tutar artan demek tutar azalan demektir.' },
    { t: 'code', id: 'fonksiyonel-1',
      q: '<p><code>uygula(fonk, degerler)</code> fonksiyonunu yaz: bir fonksiyon ve bir liste alsın, fonksiyonu her öğeye uygulayıp sonuçları liste olarak döndürsün. Sonra <code>kare</code> adında bir <code>lambda</code> tanımla (<code>x * x</code>) ve <code>uygula(kare, [1, 2, 3])</code> sonucunu yazdır.</p>',
      start: 'def uygula(fonk, degerler):\n    pass\n\nkare = None  # lambda ile değiştir\nprint(uygula(kare, [1, 2, 3]))\n',
      sol: 'def uygula(fonk, degerler):\n    return [fonk(d) for d in degerler]\n\nkare = lambda x: x * x\nprint(uygula(kare, [1, 2, 3]))\n',
      tests: 'assert uygula(kare, [1, 2, 3]) == [1, 4, 9], "kare uygulanınca [1, 4, 9]"\nassert uygula(str.upper, ["a", "b"]) == ["A", "B"], "hazır fonksiyonla da çalışmalı"\nassert uygula(len, []) == [], "boş liste için boş"\nassert kare.__name__ == "<lambda>", "kare bir lambda olmalı"\n',
      expect: '[1, 4, 9]\n',
      hints: ['fonk(d) her öğeye uygular; comprehension ile topla.', 'kare = lambda x: x * x'],
      why: 'Fonksiyon parametre olarak geçirilir ve içeride parantezle çağrılır; lambda tek ifadelik isimsiz fonksiyon üretir.' },
    { t: 'code', id: 'fonksiyonel-2',
      q: '<p><code>sirala(siparisler)</code> fonksiyonunu yaz: her sipariş <code>"sehir"</code> ve <code>"tutar"</code> anahtarlı sözlük. Önce şehre göre alfabetik artan, aynı şehirde tutara göre <b>azalan</b> sıralanmış yeni liste döndür. Girdi listesini değiştirme; <code>sorted</code> ve <code>key</code> kullan.</p>',
      start: 'def sirala(siparisler):\n    pass\n',
      sol: 'def sirala(siparisler):\n    return sorted(siparisler, key=lambda s: (s["sehir"], -s["tutar"]))\n',
      tests: 'veri = [\n    {"sehir": "İstanbul", "tutar": 1200},\n    {"sehir": "Ankara", "tutar": 350},\n    {"sehir": "İstanbul", "tutar": 4800},\n    {"sehir": "Ankara", "tutar": 2100},\n]\nkopya = list(veri)\nsonuc = sirala(veri)\nassert [(s["sehir"], s["tutar"]) for s in sonuc] == [("Ankara", 2100), ("Ankara", 350), ("İstanbul", 4800), ("İstanbul", 1200)], "şehir artan, tutar azalan bekleniyor"\nassert veri == kopya, "girdi listesi değişmemeli (sorted kullan)"\nassert sirala([]) == [], "boş için boş"\n',
      hints: ['key bir demet döndürsün: (şehir, -tutar).', 'Sayıyı eksiyle çevirmek azalan sıralama verir.'],
      why: 'Demet anahtarı çok ölçütlü sıralama sağlar; sayısal alanı negatifleyerek yönü tersine çevirirsin.' },
    { t: 'mc', q: '<code>any(b["kara_liste"] for b in [])</code> ve <code>all(b["gelir"] &gt; 0 for b in [])</code> ne döndürür?',
      o: ['True, True', 'False, False', 'False, True', 'Hata'], a: 2,
      why: 'Boş kaynakta any hiçbir doğru bulamaz: False. all ise hiçbir yanlış bulamaz: True (boş doğruluk). Bu kural matematiksel mantıkla tutarlıdır.' },
    { t: 'code', id: 'fonksiyonel-3',
      q: '<p><code>komisyon_hesaplayici(oran, asgari)</code> fabrika fonksiyonunu yaz: bir fonksiyon döndürsün; dönen fonksiyon <code>tutar</code> alıp <code>tutar * oran</code> ile <code>asgari</code> değerinden büyük olanı döndürsün (<code>round(..., 2)</code> uygula). Closure kullan; sınıf yazma.</p>',
      start: 'def komisyon_hesaplayici(oran, asgari):\n    pass\n',
      sol: 'def komisyon_hesaplayici(oran, asgari):\n    def hesapla(tutar):\n        return max(round(tutar * oran, 2), asgari)\n    return hesapla\n',
      tests: 'k = komisyon_hesaplayici(0.015, 5)\nassert callable(k), "fonksiyon döndürmeli"\nassert abs(k(1000) - 15.0) < 1e-6, "1000 * 0.015 = 15.0"\nassert k(100) == 5, "1.5 < 5 asgari olduğu için 5"\nm = komisyon_hesaplayici(0.01, 10)\nassert m(5000) == 50, "farklı ayar farklı sonuç vermeli"\nassert k(1000) != m(1000), "her hesaplayıcı kendi oranını hatırlamalı"\n',
      hints: ['İçte def hesapla(tutar): tanımla ve return hesapla (parantezsiz).', 'max(round(tutar * oran, 2), asgari)'],
      why: 'İç fonksiyon dıştaki oran ve asgari değerlerini kapatır (closure); her çağrı bağımsız bir ayar taşıyan yeni fonksiyon üretir.' },
    { t: 'code', id: 'fonksiyonel-4',
      q: '<p><code>fiyatla(tutar, kdv, indirim)</code> fonksiyonu veriliyor. <code>functools.partial</code> ile <code>kampanya</code> adında yeni bir çağrılabilir üret: <code>kdv=0.20</code>, <code>indirim=0.15</code> sabit olsun ve yalnız <code>tutar</code> alsın. Sonra <code>kampanya</code>\'yı <code>map</code> ile <code>[100, 200]</code> listesine uygulayıp sonucu <code>liste</code> adlı değişkende liste olarak tut.</p>',
      start: 'from functools import partial\n\ndef fiyatla(tutar, kdv, indirim):\n    return round(tutar * (1 - indirim) * (1 + kdv), 2)\n\nkampanya = None\nliste = None\n',
      sol: 'from functools import partial\n\ndef fiyatla(tutar, kdv, indirim):\n    return round(tutar * (1 - indirim) * (1 + kdv), 2)\n\nkampanya = partial(fiyatla, kdv=0.20, indirim=0.15)\nliste = list(map(kampanya, [100, 200]))\n',
      tests: 'import functools\nassert isinstance(kampanya, functools.partial), "kampanya partial ile üretilmeli"\nassert abs(kampanya(100) - 102.0) < 1e-6, "100 -> 102.0"\nassert liste == [102.0, 204.0], "liste [102.0, 204.0] olmalı"\n',
      hints: ['partial(fiyatla, kdv=0.20, indirim=0.15)', 'list(map(kampanya, [100, 200]))'],
      why: 'partial argümanları önceden doldurup yeni çağrılabilir üretir; map ile her öğeye uygulanır.' },
    { t: 'code', id: 'fonksiyonel-5',
      q: '<p><code>sayac()</code> fonksiyonunu yaz: her çağrıldığında 1 artan bir sayı döndüren bir fonksiyon üretsin. <code>s = sayac()</code> sonra <code>s(), s(), s()</code> sırasıyla 1, 2, 3 vermeli; başka bir <code>sayac()</code> çağrısı sıfırdan başlamalı. Closure ve <code>nonlocal</code> kullan; global değişken yok.</p>',
      start: 'def sayac():\n    adet = 0\n    def arttir():\n        pass\n    return arttir\n',
      sol: 'def sayac():\n    adet = 0\n    def arttir():\n        nonlocal adet\n        adet += 1\n        return adet\n    return arttir\n',
      tests: 's = sayac()\nassert (s(), s(), s()) == (1, 2, 3), "ardışık çağrılar 1, 2, 3 vermeli"\nt = sayac()\nassert t() == 1, "yeni sayaç sıfırdan başlamalı"\nassert s() == 4, "eski sayaç kendi durumunu korumalı"\nassert "adet" not in globals(), "global değişken kullanma"\n',
      hints: ['İç fonksiyonda nonlocal adet yazmadan adet += 1 UnboundLocalError verir.', 'return adet ile güncel değeri döndür.'],
      why: 'nonlocal, iç fonksiyonun dış kapsamdaki değişkene yazmasını sağlar; her sayac() çağrısı kendi adet hücresini taşır.' },
    { t: 'mc', q: '<code>reduce(lambda a, b: a + b, tutarlar)</code> yerine iş kodunda ne yazmalısın?',
      o: ['sum(tutarlar)', 'map(lambda a, b: a + b, tutarlar)', 'all(tutarlar)', 'sorted(tutarlar)[-1]'], a: 0,
      why: 'reduce ile toplama, sum\'ın yavaş ve okunmaz halidir. reduce yalnız hazır karşılığı olmayan özel birleştirmeler için kalmalı.' }
  ],
  faq: [
    { q: 'lambda ile def arasında performans farkı var mı?', a: 'Yok; ikisi de aynı tür fonksiyon nesnesi üretir. Fark okunurluk ve yetenektedir: def\'in adı, docstring\'i ve çok satırlı gövdesi olur; lambda tek ifadedir.' },
    { q: 'map ve filter neden liste değil de garip bir nesne döndürüyor?', a: 'Python 3\'te ikisi de tembel yineleyici döndürür; öğeler istendikçe üretilir. Liste istiyorsan list(...) ile sar; for ile gezecek ya da sum\'a verecekseniz sarmaya gerek yok.' },
    { q: 'sorted ile list.sort() farkı ne?', a: 'sorted yeni liste döndürür, kaynağı değiştirmez ve her yinelenebilirle çalışır. list.sort() listeyi yerinde sıralar ve None döndürür; bu yüzden x = liste.sort() yazanlar None ile kalır.' },
    { q: 'Closure yerine sınıf ne zaman daha iyi?', a: 'Durum birden fazla değişkense, birden çok davranış (metot) gerekiyorsa ya da durumun dışarıdan okunup değiştirilmesi gerekiyorsa sınıf daha açık olur. Tek ayar + tek davranış için closure ya da partial yeter.' }
  ],
  mistakes: [
    { bad: 'sorted(siparisler, key=lambda s: s["tutar"]())', good: 'sorted(siparisler, key=lambda s: s["tutar"])', why: 'Tutar bir sayıdır, çağrılamaz; "int object is not callable". key\'e verilen lambda\'nın kendisi çağrılır, içindeki değer değil.' },
    { bad: 'sirali = siparisler.sort(key=lambda s: s["tutar"])\nprint(sirali[0])', good: 'sirali = sorted(siparisler, key=lambda s: s["tutar"])\nprint(sirali[0])', why: 'list.sort() yerinde sıralar ve None döndürür; sirali None olur. Yeni liste için sorted kullan.' },
    { bad: 'def sayac():\n    adet = 0\n    def arttir():\n        adet += 1\n        return adet\n    return arttir', good: 'def sayac():\n    adet = 0\n    def arttir():\n        nonlocal adet\n        adet += 1\n        return adet\n    return arttir', why: 'nonlocal olmadan adet += 1 iç fonksiyonda yeni yerel değişken sayılır ve okunmadan atama yapıldığı için UnboundLocalError verir.' },
    { bad: 'fonklar = [lambda: i for i in range(3)]\nprint([f() for f in fonklar])  # [2, 2, 2]', good: 'fonklar = [lambda i=i: i for i in range(3)]\nprint([f() for f in fonklar])  # [0, 1, 2]', why: 'Closure değişkeni çağrı anında okur; döngü bitince i hep 2\'dir. Varsayılan parametre değeri o anda bağlar.' }
  ]
},
