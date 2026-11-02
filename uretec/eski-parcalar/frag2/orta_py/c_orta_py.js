/* PythonPatika — Orta 1: Pythonic Kod (kapsamli-ifadeler … dekoratorler) */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
/* ───────────────────────── 1. kapsamli-ifadeler ───────────────────────── */
{
  id: 'kapsamli-ifadeler',
  lv: 'orta',
  mod: 'Pythonic Kod',
  min: 25,
  title: 'Comprehension\'lar: tek satırda dönüştür ve süz',
  sum: 'Liste, sözlük ve küme comprehension ile üreteç ifadesini öğrenir; koşullu ve iç içe biçimlerini kullanır; ne zaman klasik döngüye dönmen gerektiğini anlarsın.',
  goals: [
    'Bir for döngüsünü liste comprehension (list comprehension) olarak yeniden yazabilirim.',
    'Koşullu süzme (if) ile koşullu değer (if-else) arasındaki farkı ayırt edebilirim.',
    'Sözlük ve küme comprehension ile veriyi tek satırda yeniden şekillendirebilirim.',
    'Üreteç ifadesi (generator expression) ile büyük veriyi belleğe almadan toplayabilirim.',
    'Comprehension\'ın okunurluğu bozduğu durumu tanır ve klasik döngüye geri dönebilirim.'
  ],
  body: `
<h2>Neden önemli?</h2>
<p>Anadolu Market'in sipariş listesinde her gün binlerce kayıt var. Analist olarak en sık yaptığın iş üç adımdır: bir listeyi <b>dönüştür</b> (her siparişin tutarını KDV'li yap), <b>süz</b> (yalnız İstanbul siparişlerini al) ve <b>yeniden grupla</b> (ürün koduna göre sözlük kur). Temel seviyede bunu <code>for</code> döngüsü ve boş listeye <code>append</code> ile yaptın. Çalışır, ama dört satır tutar ve niyetin satırlar arasında kaybolur. Comprehension (kapsamlı ifade), aynı işi tek ve okunur bir satırda yazmanı sağlar. Python topluluğunun "Pythonic" dediği kodun ilk işareti budur.</p>

<h2>Liste comprehension</h2>
<p>Kalıp şudur: <code>[ifade for öğe in kaynak]</code>. Köşeli parantez "sonuç bir liste" der; <code>for</code> kısmı kaynağı gezer; baştaki ifade her öğeden ne üretileceğini söyler.</p>
<pre class="py">tutarlar = [1200, 350, 4800, 90]

# Klasik yol
kdvli = []
for t in tutarlar:
    kdvli.append(round(t * 1.20, 2))
print(kdvli)

# Comprehension
kdvli2 = [round(t * 1.20, 2) for t in tutarlar]
print(kdvli2)
print(kdvli == kdvli2)</pre>
<p>İkisi aynı listeyi üretir. Farkı okuyuş biçiminde: ilkinde "boş liste aç, döngü kur, ekle" adımlarını izlersin; ikincisinde "tutarların KDV'li hali" diye tek nefeste okursun. Comprehension'ı sağdan sola değil, <b>baştan</b> oku: "şunu al, her öğe için, kaynaktan".</p>

<h3>Süzme: sondaki if</h3>
<p>Kaynaktaki her öğeyi değil, yalnız koşulu sağlayanları istiyorsan <code>for</code>'dan sonra bir <code>if</code> eklersin. Bu <code>if</code> bir eleme filtresidir; <code>else</code>'i yoktur.</p>
<pre class="py">siparisler = [
    {"no": 101, "sehir": "İstanbul", "tutar": 1200, "durum": "teslim"},
    {"no": 102, "sehir": "Ankara", "tutar": 350, "durum": "iptal"},
    {"no": 103, "sehir": "İstanbul", "tutar": 4800, "durum": "kargoda"},
    {"no": 104, "sehir": "İzmir", "tutar": 90, "durum": "teslim"},
    {"no": 105, "sehir": "İstanbul", "tutar": 760, "durum": "iptal"},
]

ist = [s["no"] for s in siparisler if s["sehir"] == "İstanbul"]
print("İstanbul siparişleri:", ist)

gecerli_tutar = [s["tutar"] for s in siparisler if s["durum"] != "iptal"]
print("İptal olmayan tutarlar:", gecerli_tutar)
print("Ciro:", sum(gecerli_tutar))

# Birden fazla koşul: and ile
buyuk_ist = [s["no"] for s in siparisler
             if s["sehir"] == "İstanbul" and s["tutar"] &gt; 1000]
print("İstanbul ve 1000 üstü:", buyuk_ist)</pre>

<h3>Koşullu değer: baştaki if-else</h3>
<p>Her öğeyi tutmak ama bazısına farklı değer vermek istiyorsan <code>if-else</code> <b>ifadenin başına</b> gelir. Bu bir filtre değil, "şu durumda A, aksi halde B" seçimidir.</p>
<pre class="py">tutarlar = [1200, 350, 4800, 90]
etiket = ["büyük" if t &gt;= 1000 else "küçük" for t in tutarlar]
print(etiket)

# İkisi birlikte: önce süz (sondaki if), sonra seç (baştaki if-else)
pozitif_etiket = ["büyük" if t &gt;= 1000 else "küçük"
                  for t in tutarlar if t &gt; 100]
print(pozitif_etiket)</pre>
<div class="warn"><b>En sık karışan nokta</b>Sondaki <code>if</code> öğe eler, <code>else</code> alamaz. Baştaki <code>if ... else ...</code> öğe elemez, her öğeye bir değer verir ve <code>else</code> zorunludur. <code>[x for x in liste if x &gt; 0 else 0]</code> yazarsan SyntaxError alırsın.</div>

<h2>Sözlük ve küme comprehension</h2>
<p>Süslü parantez ve <code>anahtar: değer</code> yazarsan sözlük, yalnız tek değer yazarsan küme üretilir. Sözlük comprehension, listeyi "anahtara göre erişilebilir" hale getirmenin en kısa yoludur.</p>
<pre class="py">siparisler = [
    {"no": 101, "sehir": "İstanbul", "tutar": 1200},
    {"no": 102, "sehir": "Ankara", "tutar": 350},
    {"no": 103, "sehir": "İstanbul", "tutar": 4800},
    {"no": 104, "sehir": "İzmir", "tutar": 90},
]

# Sipariş no -> tutar sözlüğü
tutar_by_no = {s["no"]: s["tutar"] for s in siparisler}
print(tutar_by_no[103])

# Fiyat listesini yüzde 10 zamla yeniden kur
fiyat = {"kahve": 120, "çay": 80, "şeker": 45}
zamli = {urun: round(f * 1.10) for urun, f in fiyat.items()}
print(zamli)

# Küme: tekrarsız şehirler
sehirler = {s["sehir"] for s in siparisler}
print(sehirler, len(sehirler))</pre>
<p>Sözlük comprehension'da aynı anahtar iki kez üretilirse sonuncusu kazanır; bu bazen istediğin şeydir (son fiyatı tut), bazen sessiz bir veri kaybı. Emin değilsen önce anahtarların tekrarsız olduğunu kontrol et.</p>

<h2>İç içe comprehension</h2>
<p>İki <code>for</code> yan yana yazılabilir; sıraları, klasik iç içe döngüdeki sırayla aynıdır: dıştaki önce. Tipik kullanım, liste listesini düzleştirmek (flatten) ya da iki listenin çiftlerini üretmektir.</p>
<pre class="py">kargolar = [
    ["K-1", "K-2"],
    ["K-3"],
    ["K-4", "K-5", "K-6"],
]
duz = [k for paket in kargolar for k in paket]
print(duz)

# Aynı şeyin klasik hali; for sırası birebir aynı
duz2 = []
for paket in kargolar:
    for k in paket:
        duz2.append(k)
print(duz == duz2)

# Ürün x şehir çiftleri
urunler = ["kahve", "çay"]
sehirler = ["Ankara", "İzmir"]
print([(u, s) for u in urunler for s in sehirler])</pre>
<p>İç içe iki <code>for</code> ile bir <code>if</code> hâlâ okunur. Üçüncü <code>for</code> ya da iç içe bir comprehension (comprehension içinde comprehension) başladığında dur ve klasik döngü yaz; aşağıda nedenini göreceksin.</p>

<h2>Üreteç ifadesi: parantezsiz tembel liste</h2>
<p>Köşeli parantez yerine yuvarlak parantez kullanırsan ortaya bir liste değil, bir üreteç (generator) çıkar. Üreteç, öğeleri istendikçe tek tek üretir; tamamını bellekte tutmaz. Toplama, en büyük bulma gibi tek geçişlik işlerde bu, hem bellek hem zaman kazandırır.</p>
<pre class="py">siparisler = [
    {"no": 101, "tutar": 1200, "durum": "teslim"},
    {"no": 102, "tutar": 350, "durum": "iptal"},
    {"no": 103, "tutar": 4800, "durum": "kargoda"},
]

# Liste: önce tüm tutarlar bellekte kurulur, sonra toplanır
print(sum([s["tutar"] for s in siparisler if s["durum"] != "iptal"]))

# Üreteç: öğeler sum'a aktıkça üretilir
print(sum(s["tutar"] for s in siparisler if s["durum"] != "iptal"))

# any / all ile doğal eşleşir
print(any(s["durum"] == "iptal" for s in siparisler))
print(all(s["tutar"] &gt; 0 for s in siparisler))

g = (s["no"] for s in siparisler)
print(type(g).__name__)
print(list(g))
print(list(g))   # ikinci kez boş: üreteç tükendi</pre>
<p>Son iki satır önemli: üreteç bir kere gezilir. Sonucu iki kez kullanacaksan listeye çevir ya da üreteci yeniden kur. Fonksiyona tek argüman olarak veriyorsan dıştaki parantez yeterlidir: <code>sum(x for x in ...)</code>.</p>

<div class="tbl-wrap"><table>
<tr><th>Biçim</th><th>Sözdizimi</th><th>Sonuç</th><th>Tipik iş</th></tr>
<tr><td>Liste</td><td><code>[f(x) for x in k]</code></td><td>list, hemen kurulur</td><td>Dönüştürülmüş liste gerekince</td></tr>
<tr><td>Sözlük</td><td><code>{a: b for x in k}</code></td><td>dict</td><td>Listeyi anahtarla erişilir yapmak</td></tr>
<tr><td>Küme</td><td><code>{f(x) for x in k}</code></td><td>set, tekrarsız</td><td>Benzersiz değerler</td></tr>
<tr><td>Üreteç ifadesi</td><td><code>(f(x) for x in k)</code></td><td>generator, tembel</td><td>sum/max/any/all, büyük veri</td></tr>
</table></div>

<h2>Ne zaman kullanılmamalı?</h2>
<p>Comprehension bir okunurluk aracıdır; okunurluğu bozuyorsa amacından sapmış demektir. Şu işaretlerde klasik döngüye dön:</p>
<ul>
<li><b>Yan etki:</b> <code>[print(x) for x in liste]</code> gibi sonucu kullanılmayan comprehension yazma. Hem gereksiz bir liste kurar hem niyeti gizler. <code>for</code> yaz.</li>
<li><b>Üçten fazla parça:</b> İki <code>for</code> + bir <code>if</code> sınırdır. Daha fazlası tek satıra sığsa bile kimse okuyamaz.</li>
<li><b>Karmaşık ifade:</b> Baştaki ifade uzun bir <code>if-else</code> zinciri ya da birden çok fonksiyon çağrısıysa önce yardımcı fonksiyon yaz, comprehension'da onu çağır.</li>
<li><b>Hata yakalama gerekiyorsa:</b> Comprehension içinde <code>try</code> yazılamaz. Öğe bazında hata olasılığı varsa döngü ya da yardımcı fonksiyon.</li>
<li><b>Döngü içinde durma gerekiyorsa:</b> <code>break</code> comprehension'da yoktur. Belirli bir koşulda durman gerekiyorsa döngü ya da <code>itertools.takewhile</code>.</li>
</ul>
<pre class="py">siparisler = [
    {"no": 101, "sehir": "istanbul ", "tutar": "1200"},
    {"no": 102, "sehir": "ANKARA", "tutar": "350"},
    {"no": 103, "sehir": " İzmir", "tutar": "4800"},
]

# Okunmaz: her şey tek satırda
kotu = {s["no"]: (s["sehir"].strip().title(), int(s["tutar"]) * 1.2) for s in siparisler if s["tutar"].isdigit() and len(s["sehir"].strip()) &gt; 2}

# Okunur: yardımcı fonksiyon + kısa comprehension
def temizle(s):
    return (s["sehir"].strip().title(), round(int(s["tutar"]) * 1.2, 2))

def gecerli(s):
    return s["tutar"].isdigit() and len(s["sehir"].strip()) &gt; 2

iyi = {s["no"]: temizle(s) for s in siparisler if gecerli(s)}
print(iyi)
print(kotu == iyi)</pre>
<div class="tip"><b>Kural: niyet tek nefeste okunmalı</b>Comprehension'ı yazdıktan sonra yüksek sesle oku. "Geçerli siparişlerin temizlenmiş halinden no-değer sözlüğü" diyebiliyorsan iyidir. Nefesin yetmiyorsa parçala.</div>
<div class="note"><b>Değişken sızması yok</b>Python 3'te comprehension'ın döngü değişkeni (<code>s</code>, <code>x</code>) kendi kapsamında kalır; dışarıdaki aynı adlı değişkeni ezmez. Python 2'de ezerdi; eski kaynaklardaki uyarılar bu yüzdendir.</div>

<h2>Anadolu Market: sipariş süzme boru hattı</h2>
<p>Şimdi parçaları birleştir. Ham sipariş listesinden şu rapor istensin: iptal olmayan, tutarı 500 üstü siparişlerin şehir bazında toplam cirosu.</p>
<pre class="py">siparisler = [
    {"no": 101, "sehir": "İstanbul", "tutar": 1200, "durum": "teslim"},
    {"no": 102, "sehir": "Ankara", "tutar": 350, "durum": "iptal"},
    {"no": 103, "sehir": "İstanbul", "tutar": 4800, "durum": "kargoda"},
    {"no": 104, "sehir": "İzmir", "tutar": 90, "durum": "teslim"},
    {"no": 105, "sehir": "İstanbul", "tutar": 760, "durum": "iptal"},
    {"no": 106, "sehir": "Ankara", "tutar": 2100, "durum": "teslim"},
]

gecerli = [s for s in siparisler if s["durum"] != "iptal" and s["tutar"] &gt; 500]
sehirler = {s["sehir"] for s in gecerli}
rapor = {sehir: sum(s["tutar"] for s in gecerli if s["sehir"] == sehir)
         for sehir in sorted(sehirler)}
print(rapor)</pre>
<p>Üç comprehension, üç net adım: süz, benzersiz şehirleri bul, her şehir için topla. Her satır tek bir şey yapıyor; bu yüzden bir ay sonra da anlaşılır.</p>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Comprehension ve performans</h3>
<p>Liste comprehension, eşdeğer <code>for</code>+<code>append</code> döngüsünden genellikle biraz daha hızlıdır; çünkü <code>append</code> metodunu her turda aramak yerine yorumlayıcı özel bir "listeye ekle" komutu kullanır. Ama bu fark küçüktür ve seçim nedenin hız değil okunurluk olmalıdır. Asıl büyük fark, liste ile üreteç ifadesi arasındadır: milyon satırlık bir kaynakta <code>sum([...])</code> önce milyon öğelik liste kurar, <code>sum(...)</code> ise tek tek üretip toplar. Büyük veride üreteç ifadesini varsayılan yap; listeye yalnız sonucu birden çok kez kullanacaksan çevir.</p>
<h3>İş hayatında nasıl görünür?</h3>
<p>Kod incelemelerinde (code review) comprehension'ın en sık iki eleştirisi vardır: "bu satır çok uzun, böl" ve "burada liste yerine üreteç yeterdi". Bir de ters yönde: "burada comprehension yazılabilirdi" diye işaretlenen üç satırlık <code>append</code> döngüleri. Her ikisini de otomatik tarayan ruff ve pylint gibi araçlar vardır; ekipler çoğu zaman satır uzunluğunu 88 ya da 100 karakterle sınırlar. İleride pandas öğrendiğinde comprehension'ların yerini büyük ölçüde sütun işlemleri alacak; ama JSON yanıtlarını, API verisini ve konfigürasyon listelerini şekillendirirken comprehension hep elinin altında olacak.</p>
</section>
`,
  ex: [
    { t: 'mc', q: '<code>[t * 2 for t in [1, 2, 3] if t &gt; 1]</code> ifadesinin sonucu nedir?',
      o: ['[2, 4, 6]', '[4, 6]', '[2, 3]', 'SyntaxError'], a: 1,
      why: 'Sondaki if önce süzer: 1 elenir, 2 ve 3 kalır. Sonra baştaki ifade ikiyle çarpar: [4, 6].' },
    { t: 'code', id: 'kapsamli-ifadeler-1',
      q: '<p><code>kdvli(tutarlar)</code> fonksiyonunu yaz: sayı listesi alsın, her tutarın yüzde 20 KDV eklenmiş halini (<code>round(t * 1.2, 2)</code>) içeren yeni bir liste döndürsün. Liste comprehension kullan.</p>',
      start: 'def kdvli(tutarlar):\n    # liste comprehension ile\n    pass\n',
      sol: 'def kdvli(tutarlar):\n    return [round(t * 1.2, 2) for t in tutarlar]\n',
      tests: 'assert kdvli([100, 250]) == [120.0, 300.0], "100 ve 250 için [120.0, 300.0] bekleniyor"\nassert kdvli([]) == [], "boş liste için boş liste dönmeli"\nassert kdvli([10]) == [12.0], "10 için [12.0] bekleniyor"\nassert isinstance(kdvli([1]), list), "sonuç liste olmalı"\n',
      hints: ['[ifade for t in tutarlar] kalıbı.', 'İfade: round(t * 1.2, 2)'],
      why: 'Baştaki ifade her tutarı dönüştürür; for kaynağı gezer; köşeli parantez sonucu liste yapar.' },
    { t: 'code', id: 'kapsamli-ifadeler-2',
      q: '<p><code>sehir_siparisleri(siparisler, sehir)</code> fonksiyonunu yaz. <code>siparisler</code>, her biri <code>"no"</code>, <code>"sehir"</code>, <code>"durum"</code> anahtarlı sözlüklerden oluşan bir liste. Verilen şehre ait ve durumu <code>"iptal"</code> olmayan siparişlerin <code>no</code> değerlerini liste olarak döndür. Sıra korunsun.</p>',
      start: 'def sehir_siparisleri(siparisler, sehir):\n    pass\n',
      sol: 'def sehir_siparisleri(siparisler, sehir):\n    return [s["no"] for s in siparisler\n            if s["sehir"] == sehir and s["durum"] != "iptal"]\n',
      tests: 'veri = [\n    {"no": 1, "sehir": "İstanbul", "durum": "teslim"},\n    {"no": 2, "sehir": "Ankara", "durum": "teslim"},\n    {"no": 3, "sehir": "İstanbul", "durum": "iptal"},\n    {"no": 4, "sehir": "İstanbul", "durum": "kargoda"},\n]\nassert sehir_siparisleri(veri, "İstanbul") == [1, 4], "İstanbul için [1, 4] bekleniyor (iptal elenmeli)"\nassert sehir_siparisleri(veri, "Ankara") == [2], "Ankara için [2] bekleniyor"\nassert sehir_siparisleri(veri, "İzmir") == [], "İzmir için boş liste bekleniyor"\n',
      hints: ['İki koşulu and ile bağla.', 'Koşul for\'dan sonra, sonda yazılır; else yok.'],
      why: 'Sondaki if filtre görevi görür; iki koşul and ile tek if içinde birleşir.' },
    { t: 'mc', q: 'Aşağıdakilerden hangisi <b>geçersiz</b> sözdizimidir?',
      o: ['["evet" if x else "hayır" for x in bayraklar]', '[x for x in sayilar if x &gt; 0 else 0]', '{x: x * x for x in range(3)}', '(x for x in sayilar if x)'], a: 1,
      why: 'Sondaki if yalnız filtredir, else alamaz. Değer seçmek için if-else ifadenin başına yazılır: [x if x > 0 else 0 for x in sayilar].' },
    { t: 'code', id: 'kapsamli-ifadeler-3',
      q: '<p><code>fiyat_sozlugu(urunler)</code> fonksiyonunu yaz. <code>urunler</code>, <code>(kod, fiyat)</code> demetlerinden oluşan bir liste. Sözlük comprehension ile kodu anahtar, fiyatın yüzde 10 zamlı halini (<code>round(fiyat * 1.1)</code>, tam sayı) değer yapan sözlük döndür.</p>',
      start: 'def fiyat_sozlugu(urunler):\n    pass\n',
      sol: 'def fiyat_sozlugu(urunler):\n    return {kod: round(fiyat * 1.1) for kod, fiyat in urunler}\n',
      tests: 'assert fiyat_sozlugu([("A1", 100), ("B2", 50)]) == {"A1": 110, "B2": 55}, "{A1: 110, B2: 55} bekleniyor"\nassert fiyat_sozlugu([]) == {}, "boş girdi için boş sözlük"\nassert fiyat_sozlugu([("K", 200)]) == {"K": 220}, "K için 220"\nassert isinstance(fiyat_sozlugu([("K", 200)])["K"], int), "değer tam sayı olmalı (round)"\n',
      hints: ['for kod, fiyat in urunler ile demeti aç.', 'Süslü parantez ve anahtar: değer.'],
      why: 'Demet açma (unpacking) comprehension içinde de çalışır; süslü parantez ve iki nokta sözlük üretir.' },
    { t: 'code', id: 'kapsamli-ifadeler-4',
      q: '<p><code>duzlestir(paketler)</code> fonksiyonunu yaz: liste listesi alsın, tek düz liste döndürsün. İç içe iki <code>for</code> içeren tek bir liste comprehension kullan; sıra korunsun.</p>',
      start: 'def duzlestir(paketler):\n    pass\n',
      sol: 'def duzlestir(paketler):\n    return [k for paket in paketler for k in paket]\n',
      tests: 'assert duzlestir([[1, 2], [3], [4, 5, 6]]) == [1, 2, 3, 4, 5, 6], "sıra korunarak düzleşmeli"\nassert duzlestir([]) == [], "boş için boş"\nassert duzlestir([[], ["a"], []]) == ["a"], "boş alt listeler atlanmalı"\n',
      hints: ['Dıştaki for önce yazılır: for paket in paketler.', 'Sonra for k in paket; başta k.'],
      why: 'İç içe comprehension\'da for sırası klasik iç içe döngüyle aynıdır: dıştaki önce, içteki sonra.' },
    { t: 'mc', q: 'Milyon satırlık bir sipariş listesinde yalnız toplam ciroyu hesaplayacaksın. Hangisi bellek açısından en uygun?',
      o: ['sum([s["tutar"] for s in siparisler])', 'sum(s["tutar"] for s in siparisler)', 'list(map(lambda s: s["tutar"], siparisler))', 'sum(list(s["tutar"] for s in siparisler))'], a: 1,
      why: 'Üreteç ifadesi öğeleri sum\'a tek tek akıtır; ara liste kurmaz. Diğer üç seçenek önce milyon öğelik bir liste oluşturur.' },
    { t: 'code', id: 'kapsamli-ifadeler-5',
      q: '<p><code>sehir_cirosu(siparisler)</code> fonksiyonunu yaz. Her sipariş <code>"sehir"</code>, <code>"tutar"</code>, <code>"durum"</code> anahtarlı sözlük. Durumu <code>"iptal"</code> olmayan siparişleri şehir bazında toplayan bir sözlük döndür (şehir → toplam tutar). Hiç geçerli siparişi olmayan şehir sözlükte yer almasın. En az bir comprehension ve <code>sum</code> ile üreteç ifadesi kullan.</p>',
      start: 'def sehir_cirosu(siparisler):\n    gecerli = [s for s in siparisler if s["durum"] != "iptal"]\n    # şehir kümesi ve toplamlar\n    pass\n',
      sol: 'def sehir_cirosu(siparisler):\n    gecerli = [s for s in siparisler if s["durum"] != "iptal"]\n    sehirler = {s["sehir"] for s in gecerli}\n    return {sehir: sum(s["tutar"] for s in gecerli if s["sehir"] == sehir)\n            for sehir in sehirler}\n',
      tests: 'veri = [\n    {"sehir": "İstanbul", "tutar": 100, "durum": "teslim"},\n    {"sehir": "Ankara", "tutar": 50, "durum": "iptal"},\n    {"sehir": "İstanbul", "tutar": 200, "durum": "kargoda"},\n    {"sehir": "İzmir", "tutar": 30, "durum": "teslim"},\n]\nassert sehir_cirosu(veri) == {"İstanbul": 300, "İzmir": 30}, "İstanbul 300, İzmir 30; Ankara yalnız iptal olduğu için yok"\nassert sehir_cirosu([]) == {}, "boş için boş sözlük"\n',
      hints: ['Önce benzersiz şehirleri küme comprehension ile bul.', 'Sonra her şehir için sum(... for s in gecerli if s["sehir"] == sehir).', 'Dıştaki sözlük comprehension şehirleri gezsin.'],
      why: 'Üç adım, üç comprehension: süz, benzersiz şehirleri çıkar, şehir başına üreteç ifadesiyle topla.' }
  ],
  faq: [
    { q: 'Comprehension her zaman for döngüsünden hızlı mı?', a: 'Liste comprehension genellikle biraz daha hızlıdır ama fark küçüktür. Seçimini okunurluğa göre yap; büyük veride asıl kazanç üreteç ifadesinin belleği korumasıdır.' },
    { q: 'Comprehension içinde try/except ya da break kullanabilir miyim?', a: 'Hayır. İkisi de comprehension sözdiziminde yoktur. Hata yakalaman gerekiyorsa yardımcı fonksiyon yazıp onu çağır; erken durman gerekiyorsa klasik döngü ya da itertools.takewhile kullan.' },
    { q: 'Tuple comprehension var mı?', a: 'Yok. Yuvarlak parantez üreteç ifadesi üretir. Demet istiyorsan tuple(x for x in ...) yaz.' },
    { q: 'Üreteci iki kez gezince neden boş geliyor?', a: 'Üreteç tek kullanımlıktır; tükenince yeni öğe üretmez. Sonucu birden çok kez kullanacaksan list(...) ile listeye çevir ya da üreteci yeniden oluştur.' }
  ],
  mistakes: [
    { bad: '[x for x in sayilar if x > 0 else 0]', good: '[x if x > 0 else 0 for x in sayilar]', why: 'Değer seçen if-else ifadenin başına yazılır; sondaki if yalnız filtredir ve else alamaz.' },
    { bad: '[print(s["no"]) for s in siparisler]', good: 'for s in siparisler:\n    print(s["no"])', why: 'Sonucu kullanılmayan comprehension gereksiz liste kurar ve niyeti gizler. Yan etki için döngü yaz.' },
    { bad: 'g = (s["tutar"] for s in siparisler)\ntoplam = sum(g)\nen_buyuk = max(g)', good: 'tutarlar = [s["tutar"] for s in siparisler]\ntoplam = sum(tutarlar)\nen_buyuk = max(tutarlar)', why: 'Üreteç ilk sum ile tükenir; max boş üreteç görür ve ValueError verir. İki kez kullanılacak veri listeye alınmalı.' },
    { bad: '[k for k in paket for paket in kargolar]', good: '[k for paket in kargolar for k in paket]', why: 'İç içe for sırası dıştan içe yazılır. Ters yazınca paket henüz tanımlı olmadığı için NameError alırsın.' }
  ]
},
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
<p>Anadolu Market'in rapor ekibinden şu istek gelsin: "Siparişleri önce şehre göre alfabetik, aynı şehirde tutara göre büyükten küçüğe sırala." Ya da Anadolu Bank'tan: "Her şube için farklı komisyon oranıyla hesaplama yapan bir fonksiyon üret." Bu isteklerin ortak noktası, <b>fonksiyonun kendisinin bir veri gibi</b> ele alınmasıdır: sıralama ölçütünü fonksiyon olarak ver, komisyon oranını fonksiyona gömüp yeni fonksiyon üret. Python'da fonksiyonlar birinci sınıf (first-class) nesnelerdir: değişkene atanır, listeye konur, argüman olarak geçirilir, başka fonksiyondan döndürülür. Bu dersteki araçların hepsi bu tek fikrin üstüne kuruludur.</p>

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
<p>Bir fonksiyon, içinde tanımlanan başka bir fonksiyonu döndürürse, içteki fonksiyon dıştakinin değişkenlerini "hatırlar". Bu yapıya closure (kapanış) denir. Anadolu Bank'ta her şubenin komisyon oranı farklı olsun: tek bir fabrika (factory) fonksiyonundan şubeye özel hesaplayıcılar üretirsin.</p>
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
