/* Kesit Python — Orta 1: Pythonic Kod (kapsamli-ifadeler … dekoratorler) */
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
<p>Ilgaz Bank'ın işlem günlüğü (log) her gün milyonlarca satır üretir. "Dosyayı oku, listeye at, sonra işle" yaklaşımı küçük dosyada çalışır; büyük dosyada belleği doldurur ve program çöker. Python'ın çözümü, veriyi tek seferde değil <b>akıtarak</b> işlemektir: bir satır oku, işle, bırak, sonrakine geç. Bu akışın altyapısı yineleyici (iterator) protokolüdür; en kolay yazım biçimi de üreteç (generator) fonksiyonlarıdır. Bu dersi bitirdiğinde <code>for</code> döngüsünün aslında ne yaptığını, dosyaların neden satır satır okunabildiğini ve kendi veri akışlarını nasıl kuracağını bileceksin.</p>

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
<p>Bir sınıf iki metot tanımlarsa yineleyici olur: <code>__iter__</code> kendisini döndürür, <code>__next__</code> sıradaki öğeyi döndürür ya da <code>StopIteration</code> fırlatır. Örnek: Ilgaz Bank'ta bir hesaba günlük faiz işleyen, verilen gün kadar bakiye üreten sayaç.</p>
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
<p>Asıl güç üreteçleri <b>zincirlemekte</b> ortaya çıkar. Her üreteç tek bir iş yapar ve sonucunu bir sonrakine akıtır; hiçbir aşamada tüm veri bellekte olmaz. Ilgaz Bank'ın işlem günlüğünden "HATA" satırlarını ayıklayıp tutarlarını toplayalım. Burada log'u bir metin olarak üretiyoruz; gerçekte dosya satırlarını gezersin ve dosya nesnesi de zaten tembel bir yineleyicidir.</p>
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
<p>Ilgaz Bank'ın işlem servisinde on farklı fonksiyon var: para transferi, bakiye sorgusu, kredi başvurusu... Hepsinde aynı üç şey isteniyor: çağrı loglansın, süresi ölçülsün, geçici hata olursa yeniden denensin. Bu üç davranışı on fonksiyona tek tek kopyalamak hem tekrar hem bakım kâbusudur. Dekoratör (decorator), bir fonksiyonu alıp etrafına davranış ekleyen ve yeni fonksiyon döndüren bir araçtır; <code>@zamanla</code> yazarsın, iş biter. Bağlam yöneticisi (context manager) ise aynı fikrin "bir blok öncesi ve sonrası" sürümüdür: dosyayı aç ve ne olursa olsun kapat, bağlantıyı kur ve bırak, işlemi başlat ve hata olursa geri al. İkisi de önceki dersteki closure ve "fonksiyon bir değerdir" fikrinin üstüne kuruludur.</p>

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
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{
    id: 'siniflar-oop', lv: 'orta', mod: 'Nesne Yönelimli Programlama', min: 35,
    title: 'Sınıflar: veri ve davranışı bir arada tutmak',
    sum: 'class, __init__, self, nitelik ve metotlarla kendi veri tipini tanımlar; __repr__, sınıf niteliği ve property ile Ilgaz Bank Hesap sınıfını kurarsın.',
    goals: [
      'class ve __init__ ile nesne oluşturup self\'in ne olduğunu açıklayabilirim.',
      'Örnek niteliği ile sınıf niteliği arasındaki farkı gösterebilirim.',
      '__repr__ ve __str__ yazıp nesnemi okunur biçimde yazdırabilirim.',
      'property ile hesaplanan ve korunan nitelik tanımlayabilirim.',
      'classmethod ve staticmethod\'un ne zaman gerektiğini söyleyebilirim.'
    ],
    body: `
<h2>Neden önemli?</h2>
<p>Ilgaz Bank\'ta bir hesabı temsil etmek için şimdiye kadar sözlük kullandın: <code>{"no": "TR01", "sahip": "Ayşe", "bakiye": 1200}</code>. Para çekme fonksiyonunu ayrı yazdın, bakiye kontrolünü başka bir yere koydun; üç ay sonra "bakiye" anahtarını birisi "balance" yazdı ve raporlar sessizce boş geldi. <b>Sınıf</b> (class), veriyi ve o veriye ait davranışı tek bir çatı altında toplar: hesap kendi bakiyesini bilir, kendi para çekme kuralını uygular, kendini okunur biçimde yazdırır. Nesne yönelimli programlama (OOP) büyük projelerin, kütüphanelerin ve iş mantığının yazılma biçimidir; bu derste temeli kuruyoruz.</p>

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
        q: '<p>Ilgaz Bank için <code>Hesap</code> sınıfını yaz. <code>Hesap(no, sahip, bakiye=0.0)</code> ile kurulsun; <code>yatir(tutar)</code> bakiyeyi artırsın, <code>cek(tutar)</code> yeterli bakiye varsa düşüp <code>True</code>, yoksa bakiyeyi değiştirmeden <code>False</code> döndürsün. <code>__repr__</code> tam olarak <code>Hesap(\'TR01\', \'Ayşe\', 100.0)</code> biçiminde olsun (bakiye float, dizeler tırnaklı).</p>',
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
<p>Ilgaz Bank\'ta üç hesap türü var: vadesiz, vadeli ve kredili. Üçü de para yatırma, bakiye gösterme ve işlem kaydı tutma işini aynı yapar; ama para çekme kuralı farklıdır (vadelide vade dolmadan çekilmez, kredilide eksiye inilebilir). Üç ayrı sınıf yazıp ortak kodu kopyalarsan bir hata düzeltmesini üç yerde yapmak zorunda kalırsın. <b>Kalıtım</b> (inheritance) ortak kısmı bir üst sınıfa koyar, alt sınıflar yalnızca farkı yazar. <b>Polimorfizm</b> (polymorphism) ise bu üç türü tek bir döngüde "hesap" olarak işlemeni sağlar: her nesne kendi <code>cek</code> metodunu bilir.</p>

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
<p>Temel seviyede <code>try/except</code> ile hatayı yakaladın. Ama Ilgaz Bank\'ın transfer servisinde "bir hata oldu" demek yetmez: yetersiz bakiye mi, hesap bulunamadı mı, günlük limit mi aşıldı? Çağıran kod bunları ayırt edip farklı tepki vermeli: birinde müşteriye mesaj, diğerinde operasyon ekibine alarm. Hata <b>tasarımı</b> bu ayrımı kodun bir parçası yapar: anlamlı istisna sınıfları, nedeni koruyan zincirleme, sonradan araştırılabilen log kayıtları. Üretimde gece üçte uyandıran hataların çoğu, kötü yakalanmış ve sessizce yutulmuş istisnalardır.</p>

<h2>Özel istisna hiyerarşisi</h2>
<p><code>Exception</code>\'dan türeyen bir temel sınıf ve ondan türeyen özel sınıflar tanımlarsın. Hiyerarşi sayesinde çağıran, ister tek tek ister hepsini birden yakalar. Gövde genellikle boştur (<code>pass</code> ya da docstring); gerekirse ek nitelik taşır.</p>
<pre class="py">class BankaHatasi(Exception):
    """Ilgaz Bank iş kurallarının temel hatası."""

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
        tests: 'assert bolu(9, 3) == 3.0, "normal bölme"\nlog.disabled = True\nassert bolu(1, 0) is None, "sıfıra bölmede None"\n',
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
);
})(window);
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{
    id: 'collections-itertools', lv: 'orta', mod: 'Standart Kütüphane', min: 30,
    title: 'collections ve itertools: hazır veri yapıları ve yineleme araçları',
    sum: 'Counter, defaultdict, deque, namedtuple ile veriyi daha az kodla tutar; chain, groupby, product, combinations, accumulate ve islice ile yinelemeyi tek geçişte kurarsın.',
    goals: [
      'Counter ile sayım ve en çok geçenleri tek satırda bulabilirim.',
      'defaultdict ile gruplama kodundaki "anahtar var mı" kontrolünü kaldırabilirim.',
      'deque ile sabit boyutlu son N kaydı ve iki uçtan hızlı kuyruğu kurabilirim.',
      'namedtuple ile okunur, hafif kayıt tipleri tanımlayabilirim.',
      'itertools fonksiyonlarıyla zincirleme, gruplama, kombinasyon ve kümülatif toplam üretebilirim.'
    ],
    body: `
<h2>Neden önemli?</h2>
<p>Anadolu Market'in raporlama ekibinde çalıştığını düşün. Her gün "hangi şehirden kaç sipariş geldi", "son 5 işlem neydi", "ürün çiftlerinin hangisi birlikte alınıyor" gibi sorular geliyor. Bunların hepsini sözlük ve for döngüsüyle yazabilirsin; ama Python'ın standart kütüphanesindeki <code>collections</code> ve <code>itertools</code> modülleri aynı işi daha kısa, daha hızlı ve daha az hatayla yapar. Bu ders, "elle yazdığın yardımcı kodun" yerine hazır ve test edilmiş araçları koymayı öğretir.</p>

<h2>collections modülü</h2>
<h3>Counter: sayım yapan sözlük</h3>
<p><code>Counter</code> (sayaç), bir yinelenebilirdeki (iterable) elemanları sayar ve <code>eleman: adet</code> sözlüğü üretir. En çok geçenleri <code>most_common(n)</code> ile alırsın; olmayan anahtar için hata değil <code>0</code> döner.</p>
<pre class="py">from collections import Counter

siparis_sehirleri = ["İstanbul", "Ankara", "İstanbul", "İzmir", "Ankara", "İstanbul", "Bursa"]
sayac = Counter(siparis_sehirleri)
print(sayac)
print("En çok 2 şehir:", sayac.most_common(2))
print("Adana siparişi:", sayac["Adana"])      # KeyError yok, 0 döner

# Counter'lar toplanabilir
dun = Counter({"İstanbul": 3, "Ankara": 1})
bugun = Counter({"İstanbul": 2, "İzmir": 4})
print("İki gün toplam:", dun + bugun)
print("Toplam sipariş:", sum(sayac.values()))</pre>

<h3>defaultdict: eksik anahtarı kendisi üreten sözlük</h3>
<p>Klasik gruplama kodunda <code>if sehir not in gruplar: gruplar[sehir] = []</code> satırı hep tekrar eder. <code>defaultdict(list)</code> bu satırı kaldırır: olmayan bir anahtara eriştiğinde fabrika fonksiyonunu (<code>list</code>, <code>int</code>, <code>set</code>...) çağırıp varsayılan değeri yerleştirir.</p>
<pre class="py">from collections import defaultdict

islemler = [
    ("TR01", 250.0), ("TR02", 80.0), ("TR01", 120.5), ("TR03", 999.0), ("TR02", 15.0),
]

hesap_toplam = defaultdict(float)
hesap_hareket = defaultdict(list)
for hesap, tutar in islemler:
    hesap_toplam[hesap] += tutar        # ilk erişimde 0.0 ile başlar
    hesap_hareket[hesap].append(tutar)  # ilk erişimde [] ile başlar

print(dict(hesap_toplam))
print(dict(hesap_hareket))
print("TR09 toplam:", hesap_toplam["TR09"])  # dikkat: erişim anahtarı OLUŞTURUR
print("Anahtarlar:", list(hesap_toplam))</pre>
<div class="warn"><b>Erişim yan etkisi</b>defaultdict'te bir anahtarı okumak bile onu oluşturur. Yalnızca "var mı?" diye bakmak istiyorsan <code>"TR09" in d</code> kullan ya da <code>d.get("TR09")</code> çağır; köşeli parantezle okuma.</div>

<h3>deque: iki uçlu kuyruk</h3>
<p>Listenin başından eleman çıkarmak (<code>pop(0)</code>) tüm elemanları kaydırdığı için yavaştır. <code>deque</code> (double-ended queue) iki uçtan da O(1) ekleme/çıkarma yapar. <code>maxlen</code> verirsen "son N kayıt" penceresi elde edersin: yeni eleman gelince en eski kendiliğinden düşer.</p>
<pre class="py">from collections import deque

son_islemler = deque(maxlen=3)
for tutar in [100, 250, 80, 999, 42]:
    son_islemler.append(tutar)
    print("Pencere:", list(son_islemler))

kuyruk = deque(["müşteri-1", "müşteri-2"])
kuyruk.append("müşteri-3")       # sağa ekle
kuyruk.appendleft("acil")        # sola ekle
print(kuyruk.popleft(), "işleme alındı")
print("Kalan:", list(kuyruk))
kuyruk.rotate(1)                 # döndür
print("Döndürülmüş:", list(kuyruk))</pre>

<h3>namedtuple: adlandırılmış demet</h3>
<p>Bir işlemi <code>("TR01", 250.0, "havale")</code> diye tutarsan üç ay sonra <code>islem[2]</code> ne demekti diye bakarsın. <code>namedtuple</code> demete alan adı verir: <code>islem.tur</code>. Değiştirilemez (immutable) ve hafiftir; sözlükten az yer kaplar. Daha fazla özellik (varsayılan değer, metot) istersen <code>dataclass</code> dersine dön.</p>
<pre class="py">from collections import namedtuple

Islem = namedtuple("Islem", ["hesap", "tutar", "tur"])
i1 = Islem("TR01", 250.0, "havale")
i2 = Islem(hesap="TR02", tutar=80.0, tur="kart")

print(i1.hesap, i1.tutar, i1.tur)
print(i1[0], "=", i1.hesap)              # indeksle de çalışır
hesap, tutar, tur = i2                   # paketten çıkarma
print(tutar)
print(i1._asdict())                      # sözlüğe çevir
print(i1._replace(tutar=300.0))          # yeni kopya (orijinal değişmez)</pre>

<div class="note"><b>OrderedDict notu</b>Python 3.7'den beri normal <code>dict</code> ekleme sırasını korur; bu yüzden <code>OrderedDict</code> çoğu kodda gerekmez. Hâlâ iki farkı var: eşitlik karşılaştırmasında sırayı dikkate alır ve <code>move_to_end()</code> metodu vardır (LRU önbellek gibi yapılarda kullanılır). Eski kodda görürsen şaşırma.</div>

<div class="tbl-wrap"><table>
<tr><th>Araç</th><th>Ne zaman</th><th>Yerine geçtiği elle yazılan kod</th></tr>
<tr><td>Counter</td><td>Sayım, en çok geçen</td><td>d[x] = d.get(x, 0) + 1</td></tr>
<tr><td>defaultdict</td><td>Gruplama, toplama</td><td>if k not in d: d[k] = []</td></tr>
<tr><td>deque</td><td>Kuyruk, son N kayıt</td><td>lst.pop(0), lst = lst[-N:]</td></tr>
<tr><td>namedtuple</td><td>Hafif, değişmez kayıt</td><td>t[0], t[1] ile indeks erişimi</td></tr>
<tr><td>ChainMap</td><td>Katmanlı ayar (varsayılan + kullanıcı)</td><td>{**varsayilan, **kullanici}</td></tr>
</table></div>

<h2>itertools modülü</h2>
<p><code>itertools</code> fonksiyonları tembel (lazy) çalışır: sonuç listesini bellekte kurmaz, istendikçe üretir. Bu yüzden büyük verilerle ve üreteçlerle (generator) iyi anlaşır. Sonucu görmek için <code>list()</code> ile sarman gerekir.</p>

<h3>chain ve islice</h3>
<p><code>chain(a, b)</code> birden çok yinelenebiliri tek akış gibi gezer; <code>chain.from_iterable</code> iç içe listeyi düzleştirir. <code>islice(it, start, stop, step)</code> ise üreteçlerde dilimleme yapar; listeye çevirmeden "ilk 3" almak için kullanılır.</p>
<pre class="py">from itertools import chain, islice, count

subat = ["S-101", "S-102"]
mart = ["S-201", "S-202", "S-203"]
print(list(chain(subat, mart)))
print(list(chain.from_iterable([subat, mart, ["S-301"]])))

# Sonsuz sayaçtan ilk 4 sipariş numarası
numaralar = (f"S-{n}" for n in count(1000))
print(list(islice(numaralar, 4)))
print(list(islice(mart, 1, None)))   # 1. indeksten sona</pre>

<h3>groupby: ardışık grupları ayırma</h3>
<p><code>groupby</code> SQL'deki GROUP BY'a benzer ama bir tuzağı var: yalnızca <b>ardışık</b> eşit anahtarları gruplar. Bu yüzden önce aynı anahtara göre <code>sorted()</code> yapmalısın. Grup nesnesi tembel bir yineleyicidir; bir kez tüketilir.</p>
<pre class="py">from itertools import groupby

siparisler = [
    {"sehir": "Ankara", "tutar": 120}, {"sehir": "İzmir", "tutar": 300},
    {"sehir": "Ankara", "tutar": 80},  {"sehir": "İstanbul", "tutar": 50},
]
anahtar = lambda s: s["sehir"]
for sehir, grup in groupby(sorted(siparisler, key=anahtar), key=anahtar):
    grup = list(grup)                      # tüketmeden önce listeye al
    print(sehir, len(grup), "sipariş, toplam", sum(s["tutar"] for s in grup))

# Sıralamadan: Ankara iki ayrı gruba bölünür!
print([k for k, _ in groupby(siparisler, key=anahtar)])</pre>

<h3>product, combinations, permutations</h3>
<pre class="py">from itertools import product, combinations, permutations

bedenler = ["S", "M"]
renkler = ["kırmızı", "siyah", "beyaz"]
print("Varyant sayısı:", len(list(product(bedenler, renkler))))
print(list(product(bedenler, renkler))[:3])

sepet = ["laptop", "mouse", "çanta", "kulaklık"]
print("İkili kombinasyon:", list(combinations(sepet, 2))[:4])   # sıra önemsiz
print("Sıralı ikili:", list(permutations(sepet[:3], 2)))        # sıra önemli
print("Kendisiyle çarpım:", list(product("01", repeat=2)))</pre>

<h3>accumulate: kümülatif değerler</h3>
<p><code>accumulate</code> birikimli toplam üretir; <code>func</code> ile başka işlem (örneğin <code>max</code>) verebilirsin. Banka bakiyesi, yılbaşından bugüne satış, tepe değer gibi raporlar için birebir.</p>
<pre class="py">from itertools import accumulate
import operator

hareketler = [1000, -250, 400, -1200, 300]
print("Bakiye:", list(accumulate(hareketler)))
print("Bakiye (başlangıç 500):", list(accumulate(hareketler, initial=500)))
print("Şimdiye kadarki tepe:", list(accumulate(hareketler, max)))
print("Çarpımsal:", list(accumulate([1.1, 1.2, 0.9], operator.mul)))</pre>

<div class="tip"><b>zip_longest ve pairwise</b><code>zip</code> en kısa listede durur; eşit olmayan uzunluklarda <code>itertools.zip_longest(a, b, fillvalue=None)</code> kullan. Ardışık çiftler (bugün-dün farkı gibi) için <code>itertools.pairwise(lst)</code> (3.10+) vardır: <code>[(1,2),(2,3),...]</code>.</div>

<h2>Birlikte kullanım: küçük bir rapor</h2>
<pre class="py">from collections import Counter, defaultdict, namedtuple
from itertools import accumulate

Satis = namedtuple("Satis", "gun kategori tutar")
veri = [
    Satis("Pzt", "elektronik", 1500), Satis("Pzt", "giyim", 300),
    Satis("Sal", "elektronik", 700),  Satis("Sal", "kitap", 120),
    Satis("Çar", "giyim", 450),
]
print("Kategori adedi:", Counter(s.kategori for s in veri))
gunluk = defaultdict(int)
for s in veri:
    gunluk[s.gun] += s.tutar
print("Günlük:", dict(gunluk))
print("Kümülatif:", list(accumulate(gunluk.values())))</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>İş hayatında nerede karşına çıkar?</h3>
<p>Günlük (log) analizinde <code>Counter</code> ile en çok hata veren uç noktayı bulmak, <code>deque(maxlen=1000)</code> ile "son 1000 istek" üzerinden hareketli ortalama hesaplamak, <code>defaultdict(set)</code> ile "her müşteri hangi ürünleri aldı" tablosunu kurmak çok yaygın kalıplardır. Pazar sepeti (market basket) analizine giriş düzeyinde <code>combinations(sepet, 2)</code> ile ürün çiftlerini sayıp <code>Counter</code> ile birleştirince "birlikte alınan ürünler" raporu elde edersin.</p>
<p>Performans tarafında: <code>Counter</code> ve <code>defaultdict</code> C düzeyinde yazılmıştır; elle yazdığın <code>get</code> döngüsünden genelde hızlıdır. <code>itertools</code> tembel olduğu için milyonlarca satırı diske yazmadan akış halinde işleyebilirsin; pandas yüklemeden önce denenecek ilk araç budur. Ancak <code>groupby</code> için önce sıralama gerekir; sıralama O(n log n) olduğundan büyük veride tek <code>defaultdict</code> geçişi (O(n)) daha ucuza gelebilir. Aracı seçerken "sıralı sonuç mu, yoksa toplam mı istiyorum?" sorusunu sor.</p>
<p>Son bir not: <code>namedtuple</code> okunurluğu artırır ama değiştirilemez; kaydı güncellemek istiyorsan <code>_replace</code> yeni nesne döndürür. Mutasyon gerekiyorsa <code>@dataclass</code>; bellek kritikse <code>@dataclass(slots=True)</code> tercih et.</p>
</section>
`,
    ex: [
      { t: 'mc', q: 'Aşağıdakilerden hangisi <code>Counter(["a","b","a"])["z"]</code> ifadesinin sonucudur?',
        o: ['KeyError fırlatır', '0', 'None', '[]'], a: 1,
        why: 'Counter olmayan anahtar için 0 döndürür; sözlük gibi KeyError vermez. None ya da boş liste döndürmez.' },
      { t: 'mc', q: '<code>groupby</code> kullanmadan önce veriyi neden sıralamak gerekir?',
        o: ['Daha hızlı çalışması için', 'Yalnızca ardışık eşit anahtarları grupladığından', 'Anahtar fonksiyonu sıralı veri bekler', 'Sıralanmazsa hata fırlatır'], a: 1,
        why: 'groupby ardışık (yan yana) eşit anahtarları tek grup yapar; sırasız veride aynı anahtar birden çok gruba bölünür. Hata fırlatmaz, sessizce yanlış sonuç verir.' },
      { t: 'code', id: 'collections-itertools-1',
        q: '<p>Anadolu Market sipariş listesinden şehir bazlı sayım yapan <code>en_cok_sehirler(siparisler, n)</code> fonksiyonunu yaz. <code>siparisler</code>, her biri <code>{"sehir": ..., "tutar": ...}</code> olan sözlük listesidir. Fonksiyon en çok sipariş gelen <code>n</code> şehri <code>[(sehir, adet), ...]</code> biçiminde, adede göre azalan sırada döndürsün. <code>Counter</code> kullan.</p>',
        start: 'from collections import Counter\n\ndef en_cok_sehirler(siparisler, n):\n    # buraya yaz\n    pass\n',
        sol: 'from collections import Counter\n\ndef en_cok_sehirler(siparisler, n):\n    sayac = Counter(s["sehir"] for s in siparisler)\n    return sayac.most_common(n)\n',
        tests: 'veri = [{"sehir": "Ankara", "tutar": 1}, {"sehir": "İzmir", "tutar": 2}, {"sehir": "Ankara", "tutar": 3}, {"sehir": "Bursa", "tutar": 4}, {"sehir": "Ankara", "tutar": 5}, {"sehir": "İzmir", "tutar": 6}]\nassert en_cok_sehirler(veri, 1) == [("Ankara", 3)], "En çok 1 şehir Ankara (3) olmalı"\nassert en_cok_sehirler(veri, 2) == [("Ankara", 3), ("İzmir", 2)], "İlk iki şehir Ankara ve İzmir olmalı"\nassert en_cok_sehirler([], 3) == [], "Boş listede boş sonuç dönmeli"\n',
        hints: ['Counter bir üreteç ifadesi alabilir: Counter(s["sehir"] for s in siparisler).', 'most_common(n) zaten azalan sırada (sehir, adet) listesi döndürür.'],
        why: 'Counter sayımı yapar, most_common(n) en çok geçen n elemanı azalan sırada demet listesi olarak verir.' },
      { t: 'code', id: 'collections-itertools-2',
        q: '<p>Ilgaz Bank işlemlerini hesaba göre gruplayan <code>hesaba_gore(islemler)</code> fonksiyonunu yaz. <code>islemler</code>, <code>(hesap_no, tutar)</code> demetlerinden oluşur. Dönüş değeri normal bir <code>dict</code> olsun: anahtar hesap numarası, değer o hesabın tutarlarının listesi (geliş sırasıyla). <code>defaultdict</code> kullan ve sonucu <code>dict()</code> ile çevir.</p>',
        start: 'from collections import defaultdict\n\ndef hesaba_gore(islemler):\n    # buraya yaz\n    pass\n',
        sol: 'from collections import defaultdict\n\ndef hesaba_gore(islemler):\n    gruplar = defaultdict(list)\n    for hesap, tutar in islemler:\n        gruplar[hesap].append(tutar)\n    return dict(gruplar)\n',
        tests: 'r = hesaba_gore([("TR01", 100), ("TR02", 50), ("TR01", 25)])\nassert r == {"TR01": [100, 25], "TR02": [50]}, "Gruplama yanlış: " + str(r)\nassert type(r) is dict, "Sonuç normal dict olmalı (defaultdict değil)"\nassert hesaba_gore([]) == {}, "Boş girdi için boş sözlük dönmeli"\n',
        hints: ['defaultdict(list) ile gruplar[hesap].append(tutar) doğrudan çalışır.', 'Dönüşte dict(gruplar) yazarak tipi normal sözlüğe çevir.'],
        why: 'defaultdict(list) ilk erişimde boş liste oluşturur; böylece "anahtar var mı" kontrolüne gerek kalmaz. dict() ile sarmak dış dünyaya sade bir sözlük verir.' },
      { t: 'code', id: 'collections-itertools-3',
        q: '<p>Hareketli pencere ortalaması hesaplayan <code>son_n_ortalama(degerler, n)</code> fonksiyonunu yaz. Fonksiyon <code>deque(maxlen=n)</code> kullanarak her adımda son <code>n</code> değerin ortalamasını hesaplasın ve tüm ortalamaları liste olarak döndürsün (ilk adımlarda pencere n\'den kısa olabilir; mevcut elemanların ortalamasını al). Sonuçları 2 basamağa yuvarla.</p>',
        start: 'from collections import deque\n\ndef son_n_ortalama(degerler, n):\n    # buraya yaz\n    pass\n',
        sol: 'from collections import deque\n\ndef son_n_ortalama(degerler, n):\n    pencere = deque(maxlen=n)\n    sonuc = []\n    for d in degerler:\n        pencere.append(d)\n        sonuc.append(round(sum(pencere) / len(pencere), 2))\n    return sonuc\n',
        tests: 'assert son_n_ortalama([10, 20, 30, 40], 2) == [10.0, 15.0, 25.0, 35.0], "Pencere 2 için ortalamalar yanlış"\nassert son_n_ortalama([3, 6, 9], 5) == [3.0, 4.5, 6.0], "Pencere veriden uzunsa tüm elemanların ortalaması alınmalı"\nassert son_n_ortalama([], 3) == [], "Boş girdi boş liste döndürmeli"\n',
        hints: ['deque(maxlen=n) dolunca en eski eleman kendiliğinden düşer.', 'Her append sonrası sum(pencere) / len(pencere) hesapla.'],
        why: 'maxlen verilen deque, pencereyi kendisi yönetir; sen yalnızca ekleyip ortalamayı hesaplarsın.' },
      { t: 'code', id: 'collections-itertools-4',
        q: '<p>Sepet analizi: <code>birlikte_alinan(sepetler)</code> fonksiyonu, her biri ürün adlarından oluşan liste olan <code>sepetler</code> için, birlikte alınan ürün çiftlerini saysın. Her sepet içindeki ürünleri önce <code>sorted()</code> ile sırala, sonra <code>itertools.combinations(..., 2)</code> ile çiftleri üret ve <code>Counter</code> ile say. Sonuç <code>Counter</code> (ya da dict) olsun; anahtarlar <code>(urun1, urun2)</code> demetleri.</p>',
        start: 'from collections import Counter\nfrom itertools import combinations\n\ndef birlikte_alinan(sepetler):\n    # buraya yaz\n    pass\n',
        sol: 'from collections import Counter\nfrom itertools import combinations\n\ndef birlikte_alinan(sepetler):\n    sayac = Counter()\n    for sepet in sepetler:\n        for cift in combinations(sorted(sepet), 2):\n            sayac[cift] += 1\n    return sayac\n',
        tests: 'sepetler = [["mouse", "laptop"], ["laptop", "mouse", "çanta"], ["çanta", "kitap"]]\nr = birlikte_alinan(sepetler)\nassert r[("laptop", "mouse")] == 2, "laptop-mouse çifti 2 kez geçmeli"\nassert r[("laptop", "çanta")] == 1, "laptop-çanta 1 kez geçmeli"\nassert r[("kitap", "çanta")] == 1, "kitap-çanta 1 kez geçmeli"\nassert ("mouse", "laptop") not in r, "Çiftler sıralı olmalı: (laptop, mouse)"\nassert sum(r.values()) == 5, "Toplam çift sayısı 5 olmalı"\n',
        hints: ['combinations(sorted(sepet), 2) her sepet için sıralı ikilileri üretir.', 'Counter() boş başlat; sayac[cift] += 1 ile artır. Ya da Counter(chain.from_iterable(...)).'],
        why: 'Sıralama sayesinde (a, b) ve (b, a) aynı anahtara düşer; combinations sırayı önemsemeyen çiftleri üretir, Counter sayar.' },
      { t: 'code', id: 'collections-itertools-5',
        q: '<p>Ilgaz Bank hesap özeti: <code>bakiye_gecmisi(baslangic, hareketler)</code> fonksiyonu başlangıç bakiyesi ve hareket listesinden (pozitif yatırma, negatif çekme) her hareket sonrası bakiyeyi liste olarak döndürsün. <code>itertools.accumulate</code> ve <code>initial</code> parametresini kullan; başlangıç değerinin kendisi listede OLMASIN.</p>',
        start: 'from itertools import accumulate\n\ndef bakiye_gecmisi(baslangic, hareketler):\n    # buraya yaz\n    pass\n',
        sol: 'from itertools import accumulate\n\ndef bakiye_gecmisi(baslangic, hareketler):\n    return list(accumulate(hareketler, initial=baslangic))[1:]\n',
        tests: 'assert bakiye_gecmisi(500, [100, -50, -200]) == [600, 550, 350], "Bakiye geçmişi yanlış"\nassert bakiye_gecmisi(0, []) == [], "Hareket yoksa boş liste dönmeli"\nassert bakiye_gecmisi(1000, [-1000]) == [0], "Tek hareket doğru hesaplanmalı"\n',
        hints: ['accumulate(hareketler, initial=baslangic) ilk eleman olarak başlangıcı da üretir.', 'Listeye çevirip [1:] ile ilk elemanı at.'],
        why: 'initial parametresi birikimin başlangıç noktasını verir; ilk üretilen eleman başlangıcın kendisi olduğu için dilimle atılır.' },
      { t: 'mc', q: 'Bir listeden sürekli olarak baştan eleman çıkarıp sona ekleyeceksen hangi yapı en uygundur?',
        o: ['list', 'tuple', 'deque', 'set'], a: 2,
        why: 'deque iki uçtan O(1) ekleme/çıkarma yapar; list.pop(0) tüm elemanları kaydırır. tuple değişmez, set sıra tutmaz.' }
    ],
    faq: [
      { q: 'Counter ile dict.get(x, 0) + 1 arasında gerçek fark var mı?', a: 'Sonuç aynıdır ama Counter daha kısa, okunur ve most_common, toplama/çıkarma gibi ek yetenekler sunar. Ayrıca olmayan anahtarda 0 döndürmesi raporlama kodunu sadeleştirir.' },
      { q: 'defaultdict JSON\'a çevrilirken sorun çıkarır mı?', a: 'Hayır, json.dumps defaultdict\'i normal sözlük gibi yazar. Yine de fonksiyonlardan dışarı verirken dict() ile çevirmek, çağıranın yanlışlıkla anahtar oluşturmasını engeller.' },
      { q: 'itertools sonuçlarını neden list() ile sarmam gerekiyor?', a: 'itertools fonksiyonları tembel yineleyici döndürür; print ettiğinde nesne adresini görürsün. Elemanları görmek ya da birden çok kez gezmek için list() ile somutlaştır.' },
      { q: 'namedtuple mı dataclass mı?', a: 'Değişmez, çok sayıda ve küçük kayıt için namedtuple hafiftir. Varsayılan değer, metot, değiştirilebilirlik ve tip ipucu istiyorsan dataclass daha uygundur.' }
    ],
    mistakes: [
      { bad: 'for k, g in groupby(veri, key=f):\n    ...', good: 'for k, g in groupby(sorted(veri, key=f), key=f):\n    ...', why: 'groupby yalnızca ardışık eşit anahtarları gruplar; sırasız veride aynı anahtar parçalanır.' },
      { bad: 'd = defaultdict(list)\nif d["x"]:\n    ...', good: 'd = defaultdict(list)\nif "x" in d:\n    ...', why: 'Köşeli parantezle okumak anahtarı oluşturur; "var mı" kontrolü için in kullan.' },
      { bad: 'ciftler = combinations(sepet, 2)\nprint(len(ciftler))', good: 'ciftler = list(combinations(sepet, 2))\nprint(len(ciftler))', why: 'itertools yineleyicilerinin len() yoktur; önce listeye çevir ya da sum(1 for _ in ...) kullan.' },
      { bad: 'son = lst[-3:]\nlst.pop(0)', good: 'son = deque(maxlen=3)\nson.append(x)', why: 'Sabit boyutlu pencere için deque(maxlen) hem daha hızlı hem de kendi kendini yönetir.' }
    ]
  }
);
})(window);
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{
    id: 'tarih-saat', lv: 'orta', mod: 'Standart Kütüphane', min: 30,
    title: 'Tarih ve saat: datetime, timedelta, biçimleme ve saat dilimi',
    sum: 'date/datetime/timedelta ile tarih aritmetiği yapar, strftime/strptime ile metne çevirir, zoneinfo ile saat dilimi ekler, ay sonu ve iş günü hesaplarını güvenle kurarsın.',
    goals: [
      'date, datetime ve timedelta nesnelerini oluşturup aralarında aritmetik yapabilirim.',
      'strftime ile Türkçe raporlara uygun biçim, strptime ile metinden tarih üretebilirim.',
      'ISO 8601 biçimini tanır, fromisoformat/isoformat ile dönüşüm yapabilirim.',
      'zoneinfo ile Europe/Istanbul gibi saat dilimlerini ve UTC dönüşümünü uygulayabilirim.',
      'Ay sonu, iş günü ve vade hesaplarını hatasız yazabilirim.'
    ],
    body: `
<h2>Neden önemli?</h2>
<p>Ilgaz Bank'ta "vadesi 30 gün sonra dolan krediler", Anadolu Market'te "son 7 günün siparişleri", İK'da "deneme süresi biten çalışanlar"... Hemen her iş sorusunun içinde tarih var. Tarihler metin olarak gelir ("2026-03-15", "15.03.2026", "15 Mart 2026"), hesap yapmak için nesneye çevirmen, sonra tekrar insanın okuyacağı biçime döndürmen gerekir. Yanlış yapılan tarih hesabı sessiz hata üretir: program çökmez ama rapor yanlış çıkar. Bu ders o hataları en baştan engellemeyi öğretir.</p>

<h2>Üç temel tip</h2>
<div class="tbl-wrap"><table>
<tr><th>Tip</th><th>Ne tutar</th><th>Örnek</th></tr>
<tr><td>date</td><td>Yıl, ay, gün</td><td>date(2026, 3, 15)</td></tr>
<tr><td>datetime</td><td>Tarih + saat (+ isteğe bağlı saat dilimi)</td><td>datetime(2026, 3, 15, 14, 30)</td></tr>
<tr><td>timedelta</td><td>Süre (gün, saniye, mikrosaniye)</td><td>timedelta(days=30, hours=2)</td></tr>
<tr><td>time</td><td>Yalnızca saat</td><td>time(9, 0)</td></tr>
</table></div>
<pre class="py">from datetime import date, datetime, timedelta

basvuru = date(2026, 3, 15)
vade = basvuru + timedelta(days=30)
print("Başvuru:", basvuru, "| Vade:", vade)
print("Haftanın günü (0=Pzt):", vade.weekday(), "| ISO (1=Pzt):", vade.isoweekday())

fark = date(2026, 12, 31) - basvuru
print("Yıl sonuna kalan gün:", fark.days, "| tip:", type(fark).__name__)

t = datetime(2026, 3, 15, 14, 30)
print("2 saat 45 dk sonra:", t + timedelta(hours=2, minutes=45))
print("Parçalar:", t.year, t.month, t.day, t.hour, t.minute)
print("Yalnızca tarih:", t.date(), "| yalnızca saat:", t.time())
print("Replace ile ayın 1'i:", t.replace(day=1).date())</pre>
<div class="note"><b>timedelta neyi bilmez?</b>timedelta'da ay ve yıl yoktur; çünkü "1 ay" 28-31 gün arasında değişir. Ay eklemek için <code>replace()</code> ile yıl/ayı kendin hesaplarsın (aşağıda) ya da üçüncü parti <code>dateutil.relativedelta</code> kullanırsın.</div>

<h2>Metne çevirme: strftime ve strptime</h2>
<p><code>strftime</code> (string format time) nesneyi metne, <code>strptime</code> (string parse time) metni nesneye çevirir. İkisi de aynı biçim kodlarını kullanır. Ezberlemek yerine tabloya bak:</p>
<div class="tbl-wrap"><table>
<tr><th>Kod</th><th>Anlam</th><th>Örnek</th></tr>
<tr><td>%Y / %y</td><td>Yıl 4 / 2 hane</td><td>2026 / 26</td></tr>
<tr><td>%m / %d</td><td>Ay / gün (sıfır dolgulu)</td><td>03 / 05</td></tr>
<tr><td>%H / %M / %S</td><td>Saat / dakika / saniye</td><td>14 / 05 / 09</td></tr>
<tr><td>%B / %b</td><td>Ay adı uzun / kısa (dile bağlı)</td><td>March / Mar</td></tr>
<tr><td>%A / %a</td><td>Gün adı uzun / kısa</td><td>Sunday / Sun</td></tr>
<tr><td>%j</td><td>Yılın günü</td><td>074</td></tr>
<tr><td>%z / %Z</td><td>UTC farkı / dilim adı</td><td>+0300 / +03</td></tr>
</table></div>
<pre class="py">from datetime import datetime

t = datetime(2026, 3, 5, 9, 7)
print(t.strftime("%d.%m.%Y %H:%M"))      # Türkiye'de alışık olunan biçim
print(t.strftime("%Y-%m-%d"))            # ISO, sıralanabilir
print(t.strftime("%d/%m/%y"))

# Metinden nesneye: biçim metinle BİREBİR uyuşmalı
s = "15.03.2026 14:30"
d = datetime.strptime(s, "%d.%m.%Y %H:%M")
print(d, type(d).__name__)

# Türkçe ay adı: %B yerel dile bağlıdır, kendin eşle
AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
         "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]
print(f"{d.day} {AYLAR[d.month - 1]} {d.year}")</pre>
<div class="warn"><b>%B ve %A dile bağlıdır</b>Sunucunun yerel ayarına (locale) göre "March" ya da "Mart" basar; çoğu sunucuda İngilizcedir. Türkçe rapor için ay/gün adlarını kendi listenden al; strptime ile Türkçe ay adı ayrıştırmaya çalışma.</div>

<h2>ISO 8601: makineler arası ortak dil</h2>
<p><code>2026-03-15T14:30:00+03:00</code> biçimi ISO 8601'dir. API'ler, JSON ve veritabanları bunu kullanır; metin olarak sıralandığında kronolojik sıra çıkar. Python'da <code>isoformat()</code> ve <code>fromisoformat()</code> bu işi görür.</p>
<pre class="py">from datetime import datetime, date

d = datetime(2026, 3, 15, 14, 30)
print(d.isoformat())
print(d.isoformat(sep=" ", timespec="minutes"))
print(datetime.fromisoformat("2026-03-15T14:30:00"))
print(datetime.fromisoformat("2026-03-15 14:30:00+03:00"))
print(date.fromisoformat("2026-03-15"))

# Metin sıralaması = kronolojik sıralama
print(sorted(["2026-03-15", "2025-12-01", "2026-01-20"]))</pre>

<h2>Saat dilimi: naive ve aware</h2>
<p>Saat dilimi bilgisi olmayan datetime'a <b>naive</b>, olana <b>aware</b> denir. İkisini karşılaştıramaz ya da çıkaramazsın; Python <code>TypeError</code> verir. Kural: sistem içinde UTC sakla, kullanıcıya gösterirken yerel dilime çevir. <code>zoneinfo</code> (3.9+) IANA veritabanını kullanır; Türkiye için <code>"Europe/Istanbul"</code> (2016'dan beri sabit +03).</p>
<pre class="py">from datetime import datetime, timezone, timedelta
try:
    from zoneinfo import ZoneInfo
    IST = ZoneInfo("Europe/Istanbul")
except Exception:            # bazı kısıtlı ortamlarda tz veritabanı olmayabilir
    IST = timezone(timedelta(hours=3), "+03")

utc_an = datetime(2026, 3, 15, 11, 30, tzinfo=timezone.utc)
ist_an = utc_an.astimezone(IST)
print("UTC   :", utc_an.isoformat())
print("İst.  :", ist_an.isoformat())
print("Aynı an mı?", utc_an == ist_an)

# Naive'e dilim ekleme: replace (dönüştürmez, etiketler)
yerel = datetime(2026, 3, 15, 14, 30).replace(tzinfo=IST)
print("UTC'ye:", yerel.astimezone(timezone.utc).strftime("%H:%M %Z"))
print("Şu an UTC:", datetime.now(timezone.utc).tzinfo)</pre>
<div class="tip"><b>utcnow() kullanma</b><code>datetime.utcnow()</code> naive döner ve 3.12'de kullanımdan kaldırılma uyarısı verir. Doğrusu <code>datetime.now(timezone.utc)</code>; yerel saat için <code>datetime.now(IST)</code>.</div>

<h2>İş hesapları: ay sonu, iş günü, yaş</h2>
<p>Finans ve İK'da en çok şu üç hesap sorulur. Hepsini standart kütüphaneyle çözebilirsin.</p>
<pre class="py">from datetime import date, timedelta
import calendar

def ay_sonu(d: date) -&gt; date:
    son_gun = calendar.monthrange(d.year, d.month)[1]
    return d.replace(day=son_gun)

def ay_ekle(d: date, n: int) -&gt; date:
    toplam = d.year * 12 + (d.month - 1) + n
    yil, ay = divmod(toplam, 12)
    gun = min(d.day, calendar.monthrange(yil, ay + 1)[1])   # 31 Ocak + 1 ay = 28/29 Şubat
    return date(yil, ay + 1, gun)

def is_gunu_ekle(d: date, n: int) -&gt; date:
    while n &gt; 0:
        d += timedelta(days=1)
        if d.weekday() &lt; 5:        # 0-4 hafta içi
            n -= 1
    return d

print("Şubat sonu:", ay_sonu(date(2026, 2, 10)))
print("31 Ocak + 1 ay:", ay_ekle(date(2026, 1, 31), 1))
print("Cuma + 3 iş günü:", is_gunu_ekle(date(2026, 3, 13), 3))
print("Mart 2026 takvimi:", calendar.monthrange(2026, 3))   # (ilk gün, gün sayısı)

dogum = date(1998, 7, 20); bugun = date(2026, 3, 15)
yas = bugun.year - dogum.year - ((bugun.month, bugun.day) &lt; (dogum.month, dogum.day))
print("Yaş:", yas)</pre>

<h2>Pratik: son 7 gün filtresi</h2>
<pre class="py">from datetime import date, timedelta

siparisler = [
    ("S-1", "2026-03-10", 450), ("S-2", "2026-03-14", 120),
    ("S-3", "2026-03-01", 800), ("S-4", "2026-03-15", 60),
]
bugun = date(2026, 3, 15)
esik = bugun - timedelta(days=7)
son_hafta = [s for s in siparisler if date.fromisoformat(s[1]) &gt;= esik]
print("Son 7 gün:", [s[0] for s in son_hafta], "toplam", sum(s[2] for s in son_hafta))
for s in son_hafta:
    gun_once = (bugun - date.fromisoformat(s[1])).days
    print(f"{s[0]}: {gun_once} gün önce")</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Üretim sistemlerinde tarih disiplini</h3>
<p>Kurumsal kodda üç kural yerleşmiştir: (1) Veritabanı ve log'da her zaman UTC ve aware datetime sakla; (2) dönüşümü yalnızca sunum katmanında yap; (3) "bugün"ü fonksiyon içinde <code>date.today()</code> ile değil, parametre olarak al. Üçüncü kural test yazarken hayat kurtarır: <code>vade_gecti(islem, bugun=date(2026,1,1))</code> deterministik test edilir, <code>date.today()</code> içeren fonksiyon ise her gün farklı sonuç verir.</p>
<p>Zaman damgası (timestamp) ile çalışırken <code>datetime.fromtimestamp(ts, tz=timezone.utc)</code> kullan; dilimsiz çağrı makinenin yerel saatini varsayar ve sunucu-geliştirici makinesi arasında fark çıkar. Yaz saati uygulayan dilimlerde (Avrupa, ABD) bir günün 23 ya da 25 saat olabileceğini unutma; "yarın aynı saat" hesabı için yerel dilimde <code>timedelta(days=1)</code> ekleyip tekrar <code>astimezone</code> yapmak gerekir. Türkiye 2016'dan beri sabit +03 kullandığı için bu sorun yerelde görünmez ama uluslararası müşteri verisinde görünür.</p>
<p>Performans ipucu: milyonlarca satırda <code>strptime</code> yavaştır; biçim sabit ISO ise <code>fromisoformat</code> birkaç kat hızlıdır. pandas'a geçtiğinde <code>pd.to_datetime(..., format=...)</code> aynı mantıkla çalışır.</p>
</section>
`,
    ex: [
      { t: 'mc', q: '<code>timedelta</code> ile aşağıdakilerden hangisi doğrudan ifade EDİLEMEZ?',
        o: ['3 gün', '1 ay', '90 dakika', '2 hafta'], a: 1,
        why: 'timedelta gün, saniye ve mikrosaniye (ve haftalar/saatler/dakikalar bunlara çevrilerek) tutar. Ay uzunluğu değişken olduğundan ay desteklenmez.' },
      { t: 'mc', q: 'Naive bir datetime ile aware bir datetime\'ı çıkarırsan ne olur?',
        o: ['UTC varsayılır', 'TypeError fırlatılır', 'Sonuç None olur', 'Yerel saat varsayılır'], a: 1,
        why: 'Python naive ve aware nesneleri karşılaştırmaya ya da çıkarmaya izin vermez; TypeError verir. Varsayım yapmaz.' },
      { t: 'code', id: 'tarih-saat-1',
        q: '<p>Ilgaz Bank kredi sistemi için <code>vade_tarihi(baslangic: str, gun: int) -> str</code> fonksiyonunu yaz. <code>baslangic</code> "GG.AA.YYYY" biçiminde metin, <code>gun</code> eklenecek gün sayısıdır. Sonucu yine "GG.AA.YYYY" biçiminde döndür.</p>',
        start: 'from datetime import datetime, timedelta\n\ndef vade_tarihi(baslangic, gun):\n    # buraya yaz\n    pass\n',
        sol: 'from datetime import datetime, timedelta\n\ndef vade_tarihi(baslangic, gun):\n    d = datetime.strptime(baslangic, "%d.%m.%Y")\n    return (d + timedelta(days=gun)).strftime("%d.%m.%Y")\n',
        tests: 'assert vade_tarihi("15.03.2026", 30) == "14.04.2026", "15.03.2026 + 30 gün = 14.04.2026"\nassert vade_tarihi("25.12.2025", 10) == "04.01.2026", "Yıl geçişi doğru olmalı"\nassert vade_tarihi("28.02.2024", 1) == "29.02.2024", "Artık yıl dikkate alınmalı"\nassert vade_tarihi("01.01.2026", 0) == "01.01.2026", "0 gün aynı tarihi vermeli"\n',
        hints: ['strptime(baslangic, "%d.%m.%Y") ile nesneye çevir.', 'timedelta(days=gun) ekle, strftime ile aynı biçime döndür.'],
        why: 'strptime metni datetime yapar, timedelta ile toplanır, strftime geri metne çevirir. Artık yıl ve ay geçişlerini Python hesaplar.' },
      { t: 'code', id: 'tarih-saat-2',
        q: '<p><code>ay_sonu(d: date) -> date</code> fonksiyonu verilen tarihin bulunduğu ayın son gününü döndürsün. <code>calendar.monthrange</code> kullanabilirsin. Artık yıl Şubat\'ı doğru hesaplanmalı.</p>',
        start: 'from datetime import date\nimport calendar\n\ndef ay_sonu(d):\n    # buraya yaz\n    pass\n',
        sol: 'from datetime import date\nimport calendar\n\ndef ay_sonu(d):\n    return d.replace(day=calendar.monthrange(d.year, d.month)[1])\n',
        tests: 'from datetime import date\nassert ay_sonu(date(2026, 2, 10)) == date(2026, 2, 28), "2026 Şubat 28 gün"\nassert ay_sonu(date(2024, 2, 1)) == date(2024, 2, 29), "2024 artık yıl, Şubat 29"\nassert ay_sonu(date(2026, 12, 31)) == date(2026, 12, 31), "Zaten ay sonuysa aynı gün"\nassert ay_sonu(date(2026, 4, 5)) == date(2026, 4, 30), "Nisan 30 gün"\n',
        hints: ['calendar.monthrange(yil, ay) (ilk_gun, gun_sayisi) demeti döndürür.', 'd.replace(day=...) yeni tarih üretir.'],
        why: 'monthrange ayın gün sayısını artık yılı da hesaba katarak verir; replace ile günü o değere çekersin.' },
      { t: 'code', id: 'tarih-saat-3',
        q: '<p>Anadolu Market lojistik: <code>teslimat_gunu(siparis: date, is_gunu: int) -> date</code> fonksiyonu, siparişten itibaren <code>is_gunu</code> kadar iş günü (Pzt-Cum) sonrasını döndürsün. Hafta sonları sayılmaz; sipariş günü sayılmaz.</p>',
        start: 'from datetime import date, timedelta\n\ndef teslimat_gunu(siparis, is_gunu):\n    # buraya yaz\n    pass\n',
        sol: 'from datetime import date, timedelta\n\ndef teslimat_gunu(siparis, is_gunu):\n    d = siparis\n    while is_gunu > 0:\n        d += timedelta(days=1)\n        if d.weekday() < 5:\n            is_gunu -= 1\n    return d\n',
        tests: 'from datetime import date\nassert teslimat_gunu(date(2026, 3, 13), 1) == date(2026, 3, 16), "Cuma + 1 iş günü = Pazartesi"\nassert teslimat_gunu(date(2026, 3, 13), 3) == date(2026, 3, 18), "Cuma + 3 iş günü = Çarşamba"\nassert teslimat_gunu(date(2026, 3, 16), 5) == date(2026, 3, 23), "Pzt + 5 iş günü = sonraki Pzt"\nassert teslimat_gunu(date(2026, 3, 14), 1) == date(2026, 3, 16), "Cumartesi + 1 iş günü = Pazartesi"\nassert teslimat_gunu(date(2026, 3, 16), 0) == date(2026, 3, 16), "0 iş günü aynı gün"\n',
        hints: ['weekday() 0-4 hafta içi, 5-6 hafta sonu.', 'Gün gün ilerle; hafta içine denk gelince sayacı azalt.'],
        why: 'Her adımda bir gün ekleyip yalnızca hafta içi günlerde sayacı düşürmek en okunur çözümdür.' },
      { t: 'code', id: 'tarih-saat-4',
        q: '<p>Sunucu logları UTC ISO 8601 metinleriyle geliyor (örn. <code>"2026-03-15T11:30:00+00:00"</code>). <code>istanbul_saati(iso: str) -> str</code> fonksiyonu bu metni alıp İstanbul saatine (UTC+3) çevirsin ve <code>"GG.AA.YYYY SS:DD"</code> biçiminde döndürsün. <code>datetime.fromisoformat</code> ve <code>astimezone</code> kullan. Saat dilimi için <code>timezone(timedelta(hours=3))</code> kullanabilirsin.</p>',
        start: 'from datetime import datetime, timezone, timedelta\n\nIST = timezone(timedelta(hours=3))\n\ndef istanbul_saati(iso):\n    # buraya yaz\n    pass\n',
        sol: 'from datetime import datetime, timezone, timedelta\n\nIST = timezone(timedelta(hours=3))\n\ndef istanbul_saati(iso):\n    d = datetime.fromisoformat(iso)\n    return d.astimezone(IST).strftime("%d.%m.%Y %H:%M")\n',
        tests: 'assert istanbul_saati("2026-03-15T11:30:00+00:00") == "15.03.2026 14:30", "UTC 11:30 -> İstanbul 14:30"\nassert istanbul_saati("2026-03-15T22:30:00+00:00") == "16.03.2026 01:30", "Gün değişimi doğru olmalı"\nassert istanbul_saati("2026-01-01T00:00:00+00:00") == "01.01.2026 03:00", "Yılbaşı dönüşümü"\n',
        hints: ['fromisoformat "+00:00" sonekini okuyup aware nesne üretir.', 'astimezone(IST) dönüştürür; replace(tzinfo=...) yalnızca etiketler, kullanma.'],
        why: 'fromisoformat aware datetime verir; astimezone gerçek dönüşümü yapar; strftime istenen biçimi üretir.' },
      { t: 'code', id: 'tarih-saat-5',
        q: '<p>Raporlama: <code>gun_farki_listesi(tarihler: list[str], bugun: str) -> list[int]</code> fonksiyonu ISO biçimli ("YYYY-AA-GG") tarih listesini alsın ve her biri için <code>bugun</code>\'e kaç gün kaldığını (gelecekse pozitif, geçmişse negatif) liste olarak döndürsün.</p>',
        start: 'from datetime import date\n\ndef gun_farki_listesi(tarihler, bugun):\n    # buraya yaz\n    pass\n',
        sol: 'from datetime import date\n\ndef gun_farki_listesi(tarihler, bugun):\n    b = date.fromisoformat(bugun)\n    return [(date.fromisoformat(t) - b).days for t in tarihler]\n',
        tests: 'r = gun_farki_listesi(["2026-03-20", "2026-03-10", "2026-03-15"], "2026-03-15")\nassert r == [5, -5, 0], "Farklar [5, -5, 0] olmalı, gelen: " + str(r)\nassert gun_farki_listesi([], "2026-01-01") == [], "Boş liste boş dönmeli"\nassert gun_farki_listesi(["2027-01-01"], "2026-01-01") == [365], "2026 artık yıl değil, 365 gün"\n',
        hints: ['date.fromisoformat ile her metni tarihe çevir.', 'İki date çıkarınca timedelta gelir; .days ile tam sayı al.'],
        why: 'date çıkarması timedelta döndürür; .days işaretli gün sayısını verir. Liste comprehension işi tek satıra indirir.' },
      { t: 'mc', q: 'Aşağıdaki biçimlerden hangisi metin olarak sıralandığında kronolojik sıra verir?',
        o: ['15.03.2026', '03/15/2026', '2026-03-15', '15 Mart 2026'], a: 2,
        why: 'ISO 8601 (YYYY-MM-DD) en büyük birimden en küçüğe gittiği için metin sıralaması tarih sıralamasıyla aynıdır. Diğerleri gün ya da ayla başladığından yanlış sıralanır.' }
    ],
    faq: [
      { q: 'date.today() ile datetime.now() farkı ne?', a: 'date.today() yalnızca yıl-ay-gün döndürür; datetime.now() saat, dakika, saniye ve mikrosaniye de içerir. Saat dilimi için datetime.now(tz) kullan; date.today() dilim almaz.' },
      { q: 'Türkçe ay adıyla tarih basmak için ne yapmalıyım?', a: 'strftime %B yerel ayara bağlıdır ve çoğu sunucuda İngilizcedir. En güvenlisi kendi Türkçe ay listeni tutup d.month ile indekslemektir.' },
      { q: 'Tarihleri metin olarak saklayıp karşılaştırabilir miyim?', a: 'Yalnızca ISO biçimindeyse (YYYY-MM-DD) metin karşılaştırması doğru sonuç verir. GG.AA.YYYY gibi biçimlerde mutlaka nesneye çevir.' },
      { q: 'zoneinfo bulunamadı hatası alıyorum.', a: 'Bazı minimal sistemlerde IANA veritabanı yoktur; pip install tzdata çözer. Türkiye sabit +03 olduğundan geçici çözüm olarak timezone(timedelta(hours=3)) kullanılabilir.' }
    ],
    mistakes: [
      { bad: 'd + timedelta(months=1)', good: 'd.replace(year=d.year + (d.month == 12), month=d.month % 12 + 1)', why: 'timedelta ay parametresi almaz; ay eklemek için yıl/ayı kendin hesapla ya da dateutil.relativedelta kullan.' },
      { bad: 'datetime.strptime("15.03.2026", "%Y-%m-%d")', good: 'datetime.strptime("15.03.2026", "%d.%m.%Y")', why: 'Biçim kodu metinle birebir uyuşmalı; aksi halde ValueError alırsın.' },
      { bad: 'datetime.utcnow()', good: 'datetime.now(timezone.utc)', why: 'utcnow naive nesne döndürür ve kullanımdan kaldırılıyor; now(timezone.utc) aware nesne verir.' },
      { bad: 'yerel = naive.replace(tzinfo=IST)\nutc = naive.replace(tzinfo=timezone.utc)', good: 'yerel = naive.replace(tzinfo=IST)\nutc = yerel.astimezone(timezone.utc)', why: 'replace yalnızca etiket değiştirir, saati kaydırmaz; dönüşüm için astimezone gerekir.' }
    ]
  }
);
})(window);
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{
    id: 'regex', lv: 'orta', mod: 'Standart Kütüphane', min: 35,
    title: 'Düzenli ifadeler (regex): metinde kalıp arama ve çıkarma',
    sum: 're.search/match/findall/sub ile kalıp arar, gruplarla veri çıkarır, telefon/e-posta/IBAN benzeri doğrulamalar yazar ve regex tuzaklarından kaçınırsın.',
    goals: [
      'search, match, fullmatch, findall ve sub arasındaki farkı bilip doğru olanı seçebilirim.',
      'Karakter sınıfları, niceleyiciler ve çapalarla kalıp kurabilirim.',
      'Gruplar ve adlandırılmış gruplarla metinden yapılandırılmış veri çıkarabilirim.',
      'Telefon, e-posta ve IBAN benzeri iş kalıplarını doğrulayabilirim.',
      're.compile, bayraklar ve açgözlülük gibi tuzakları yönetebilirim.'
    ],
    body: `
<h2>Neden önemli?</h2>
<p>Ilgaz Bank'a gelen EFT açıklamalarından fatura numarasını çıkarmak, Anadolu Market müşteri formundaki telefonun doğru biçimde olduğunu kontrol etmek, log dosyasından hata kodlarını toplamak... Bunların ortak noktası: metin içinde <b>kalıp</b> (pattern) aramak. <code>str.find</code> ve <code>in</code> sabit metin arar; "5 ile başlayan 10 haneli sayı" gibi kalıpları ise düzenli ifadeler (regular expression, regex) bulur. Regex küçük bir dildir; doğru kullanınca 20 satırlık ayrıştırma kodu bir satıra iner, yanlış kullanınca kimsenin okuyamadığı bir satır çıkar. Bu ders ikisi arasındaki çizgiyi öğretir.</p>

<h2>Temel sözlük</h2>
<div class="tbl-wrap"><table>
<tr><th>Yapı</th><th>Anlam</th><th>Örnek</th></tr>
<tr><td>\\d  \\w  \\s</td><td>Rakam / harf-rakam-alt çizgi / boşluk</td><td>\\d{3} → 3 rakam</td></tr>
<tr><td>\\D  \\W  \\S</td><td>Yukarıdakilerin tersi</td><td>\\D+ → rakam olmayanlar</td></tr>
<tr><td>.</td><td>Satır sonu dışında herhangi bir karakter</td><td>a.c → abc, a-c</td></tr>
<tr><td>[abc]  [^abc]  [a-z]</td><td>Küme / küme dışı / aralık</td><td>[A-Z]{2} → iki büyük harf</td></tr>
<tr><td>*  +  ?  {n,m}</td><td>0+ / 1+ / 0-1 / n ile m arası</td><td>\\d{2,4}</td></tr>
<tr><td>^  $  \\b</td><td>Satır başı / sonu / kelime sınırı</td><td>^TR → TR ile başlar</td></tr>
<tr><td>( )  (?P&lt;ad&gt; )  (?: )</td><td>Grup / adlandırılmış grup / yakalamayan grup</td><td>(?P&lt;yil&gt;\\d{4})</td></tr>
<tr><td>a|b</td><td>Veya</td><td>TL|USD|EUR</td></tr>
</table></div>
<div class="tip"><b>Her zaman ham dize kullan</b>Kalıpları <code>r"..."</code> ile yaz. Aksi halde Python <code>"\\b"</code>yi geri silme (backspace) karakteri sanır, <code>"\\d"</code> için uyarı verir. <code>r</code> öneki ters eğik çizgiyi olduğu gibi bırakır.</div>

<h2>Dört ana fonksiyon</h2>
<p><code>re.search</code> metnin herhangi bir yerinde ilk eşleşmeyi bulur; <code>re.match</code> yalnızca <b>baştan</b> eşleşir; <code>re.fullmatch</code> tüm metnin kalıba uymasını ister (doğrulama için en doğrusu); <code>re.findall</code> tüm eşleşmeleri liste olarak verir. <code>search/match/fullmatch</code> eşleşme yoksa <code>None</code> döndürür; bu yüzden sonucu önce <code>if</code> ile kontrol edersin.</p>
<pre class="py">import re

aciklama = "EFT - Fatura No: FT-2026-00431, tutar 1.250,00 TL"
m = re.search(r"FT-\\d{4}-\\d{5}", aciklama)
print("search :", m.group() if m else None, "| konum:", m.span())
print("match  :", re.match(r"FT-", aciklama))          # baş 'EFT' olduğu için None
print("match2 :", re.match(r"EFT", aciklama).group())
print("full   :", re.fullmatch(r"\\d{10}", "5321234567") is not None)
print("full2  :", re.fullmatch(r"\\d{10}", "532123456X") is not None)
print("findall:", re.findall(r"\\d+", aciklama))
print("bos    :", re.search(r"\\d+", "rakam yok"))      # None</pre>

<h2>Gruplar: eşleşmenin parçalarını almak</h2>
<p>Parantez, eşleşmenin bir bölümünü yakalar (capture). <code>group(1)</code> ilk grubu, <code>groups()</code> hepsini verir. Adlandırılmış gruplar <code>(?P&lt;ad&gt;...)</code> ile kodu okunur yapar; <code>groupdict()</code> doğrudan sözlük döndürür. Yakalamak istemediğin ama gruplaman gereken yerde <code>(?:...)</code> kullan.</p>
<pre class="py">import re

satir = "2026-03-15 14:30:07 ERROR odeme-servisi: zaman asimi (kod=504)"
kalip = r"(?P&lt;tarih&gt;\\d{4}-\\d{2}-\\d{2}) (?P&lt;saat&gt;[\\d:]+) (?P&lt;seviye&gt;[A-Z]+) (?P&lt;servis&gt;[\\w-]+): (?P&lt;mesaj&gt;.*)"
m = re.search(kalip, satir)
print(m.group("seviye"), "-", m.group("servis"))
print(m.groupdict())
print(m.group(1), m.group(3))      # sıra numarasıyla da erişilir

# findall: grup varsa yalnızca grupları döndürür
fiyatlar = "laptop 25.999 TL, mouse 349 TL, çanta 1.200 TL"
print(re.findall(r"(\\w+) ([\\d.]+) TL", fiyatlar))
# finditer: eşleşme nesneleriyle gez
for e in re.finditer(r"(?P&lt;urun&gt;\\w+) (?P&lt;fiyat&gt;[\\d.]+) TL", fiyatlar):
    print(e["urun"], "→", e["fiyat"].replace(".", ""))</pre>

<h2>re.sub: bul ve değiştir</h2>
<p><code>re.sub(kalip, yeni, metin)</code> tüm eşleşmeleri değiştirir. <code>yeni</code> içinde <code>\\1</code> ya da <code>\\g&lt;ad&gt;</code> ile grup kullanabilirsin; karmaşık dönüşümlerde <code>yeni</code> yerine fonksiyon verirsin. KVKK gereği kart numarası maskeleme tipik bir örnektir.</p>
<pre class="py">import re

mesaj = "Kart 5401 2345 6789 1234 ile 350 TL ödeme; TC 12345678901 doğrulandı."
# Kartın ilk 4 ve son 4'ünü bırak, ortayı maskele
maskeli = re.sub(r"(\\d{4}) \\d{4} \\d{4} (\\d{4})", r"\\1 **** **** \\2", mesaj)
print(maskeli)
# 11 haneli sayıyı tamamen gizle
print(re.sub(r"\\b\\d{11}\\b", "***********", maskeli))
# Tarih biçimi değiştir: 2026-03-15 -&gt; 15.03.2026
print(re.sub(r"(\\d{4})-(\\d{2})-(\\d{2})", r"\\3.\\2.\\1", "Rapor tarihi 2026-03-15"))
# Fonksiyonla değiştirme: fiyatları yüzde 10 artır
print(re.sub(r"\\d+", lambda m: str(int(m.group()) * 11 // 10), "mouse 350 TL, çanta 1200 TL"))
# Fazla boşlukları teke indir, kaç tane değişti?
yeni, adet = re.subn(r"\\s+", " ", "çok    fazla   boşluk")
print(yeni, "|", adet)</pre>

<h2>İş kalıpları: telefon, e-posta, IBAN</h2>
<p>Kurumsal formlarda en çok karşılaşılan üç doğrulama. Amaç "biçimsel olarak makul mü?" sorusuna cevap vermektir; gerçek doğrulama (IBAN kontrol basamağı, e-posta adresinin var olması) regex'in işi değildir.</p>
<pre class="py">import re

TELEFON = re.compile(r"^(?:\\+90|0)?\\s?5\\d{2}\\s?\\d{3}\\s?\\d{2}\\s?\\d{2}$")
EPOSTA = re.compile(r"^[\\w.+-]+@[\\w-]+(?:\\.[\\w-]+)+$")
IBAN_TR = re.compile(r"^TR\\d{2}\\s?(?:\\d{4}\\s?){5}\\d{2}$")   # TR + 24 hane = 26 karakter

for t in ["0532 123 45 67", "+90 532 123 45 67", "5321234567", "0212 123 45 67", "532 12 34"]:
    print(f"{t:&gt;18} →", bool(TELEFON.match(t)))
for e in ["ayse.yilmaz@anadolumarket.com.tr", "ali@firma", "kötü@@adres.com"]:
    print(f"{e:&gt;34} →", bool(EPOSTA.match(e)))
for i in ["TR33 0006 1005 1978 6457 8413 26", "TR330006100519786457841326", "TR12 3456"]:
    print(f"{i:&gt;34} →", bool(IBAN_TR.match(i)))</pre>
<div class="note"><b>Neden compile?</b><code>re.compile</code> kalıbı bir kez derler ve bir nesne verir; döngüde binlerce kez kullanacaksan okunurluk ve hız kazandırır. Python zaten son kalıpları önbelleğe alır, bu yüzden tek seferlik kullanımda fark yoktur; compile'ın asıl faydası kalıba <b>ad vermek</b>tir.</div>

<h2>Tuzaklar</h2>
<h3>1. Açgözlülük (greedy)</h3>
<p><code>.*</code> olabildiğince çok karakter yutar. <code>&lt;b&gt;x&lt;/b&gt; ve &lt;b&gt;y&lt;/b&gt;</code> metninde <code>&lt;b&gt;.*&lt;/b&gt;</code> tüm satırı alır. Tembel (lazy) sürüm <code>.*?</code> en kısa eşleşmede durur.</p>
<h3>2. Nokta ve özel karakterler</h3>
<p><code>.</code> "her karakter" demektir; gerçek nokta için <code>\\.</code> yaz. Kullanıcıdan gelen metni kalıba gömeceksen <code>re.escape()</code> ile kaçır.</p>
<h3>3. match ile doğrulama</h3>
<p><code>re.match(r"\\d{10}", "5321234567abc")</code> eşleşir çünkü yalnızca baştan bakar. Doğrulama için <code>fullmatch</code> ya da <code>^...$</code> kullan.</p>
<h3>4. Çok satırlı metin ve bayraklar</h3>
<pre class="py">import re

html = "&lt;b&gt;laptop&lt;/b&gt; ve &lt;b&gt;mouse&lt;/b&gt;"
print("açgözlü:", re.findall(r"&lt;b&gt;.*&lt;/b&gt;", html))
print("tembel :", re.findall(r"&lt;b&gt;.*?&lt;/b&gt;", html))

print("nokta  :", re.findall(r"1.5", "1.5 ve 1x5 ve 125"))
print("kaçmış :", re.findall(r"1\\.5", "1.5 ve 1x5 ve 125"))
print("escape :", re.escape("fiyat (TL)?"))

log = "INFO baslat\\nERROR disk dolu\\nerror: yetki yok\\nINFO bitti"
print("IGNORECASE:", re.findall(r"^error.*", log, flags=re.IGNORECASE | re.MULTILINE))
print("MULTILINE yok:", re.findall(r"^ERROR.*", log))

# VERBOSE: uzun kalıbı açıklamalı yaz
TUTAR = re.compile(r"""
    (?P&lt;miktar&gt;\\d{1,3}(?:\\.\\d{3})*(?:,\\d{2})?)   # 1.250,00 gibi
    \\s*(?P&lt;birim&gt;TL|USD|EUR)                      # para birimi
""", re.VERBOSE)
print(TUTAR.search("Toplam: 1.250,00 TL ödendi").groupdict())</pre>

<div class="warn"><b>Regex her şeyin cevabı değil</b>HTML/JSON/CSV gibi yapılı biçimleri regex ile ayrıştırma; her birinin kendi ayrıştırıcısı var (<code>json</code>, <code>csv</code>, <code>html.parser</code>). Basit "ile başlıyor mu", "içeriyor mu" sorularında <code>str.startswith</code> ve <code>in</code> hem hızlı hem okunurdur. Regex'i düzensiz metinden kalıp çıkarmak için sakla.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Üretim kodunda regex disiplini</h3>
<p>Kurumsal projelerde kalıplar modülün başında büyük harfli sabit olarak <code>re.compile</code> ile tanımlanır ve yanına bir yorumla "ne eşleşir, ne eşleşmez" örnekleri yazılır. Her kalıbın en az bir pozitif ve bir negatif test örneği olur; çünkü regex'ler değiştirilirken en çok "önceden eşleşen artık eşleşmiyor" hatası çıkar. <code>re.VERBOSE</code> ile parçalara açıklama eklemek üç ay sonra kendine iyilik yapmaktır.</p>
<p>Güvenlik: bazı kalıplar belirli girdilerde üstel zaman alır (ReDoS, örn. <code>(a+)+$</code> kalıbına uzun "aaaa...b" vermek). Kullanıcıdan gelen metne iç içe niceleyici içeren kalıp uygulayacaksan girdinin uzunluğunu sınırla. Python 3.11 ile gelen <code>(?&gt;...)</code> atomik gruplar ve sahiplenici niceleyiciler (<code>a++</code>) geri izlemeyi keserek bu sorunu azaltır.</p>
<p>Unicode: Python 3'te <code>\\w</code> varsayılan olarak Türkçe harfleri de kapsar (<code>re.ASCII</code> bayrağı vermediğin sürece). Büyük/küçük harf duyarsız eşleşmede "İ/i" ve "I/ı" ayrımı yanıltabilir; kritik karşılaştırmalarda metni önce normalize et. Son olarak, bir kalıbı yazdıktan sonra dört beş örnek metinle etkileşimli olarak denemek (regex101 gibi araçlar ya da küçük bir Python döngüsü) hatayı üretime gitmeden yakalar.</p>
</section>
`,
    ex: [
      { t: 'mc', q: 'Bir metnin TAMAMEN kalıba uyup uymadığını kontrol etmek için en doğru fonksiyon hangisidir?',
        o: ['re.search', 're.match', 're.fullmatch', 're.findall'], a: 2,
        why: 'fullmatch tüm metnin kalıba uymasını ister. match yalnızca baştan eşleşir ve sonda fazlalığı kaçırır; search herhangi bir yerde arar; findall liste döndürür.' },
      { t: 'mc', q: '<code>re.findall(r"&lt;b&gt;.*&lt;/b&gt;", "&lt;b&gt;a&lt;/b&gt; &lt;b&gt;b&lt;/b&gt;")</code> kaç eleman döndürür?',
        o: ['2', '1', '0', '4'], a: 1,
        why: '.* açgözlüdür: ilk <b> ile son </b> arasındaki her şeyi tek eşleşme olarak alır. İki ayrı eleman için .*? (tembel) gerekir.' },
      { t: 'code', id: 'regex-1',
        q: '<p>Anadolu Market müşteri formu için <code>gecerli_telefon(metin: str) -> bool</code> fonksiyonunu yaz. Geçerli biçimler: isteğe bağlı <code>+90</code> ya da <code>0</code> öneki, ardından <code>5</code> ile başlayan 10 hane; haneler arasında isteğe bağlı tek boşluklar olabilir (örn. "0532 123 45 67", "+90 532 123 45 67", "5321234567"). Sabit hat (0212...) ve eksik haneler geçersiz olmalı. <code>re.fullmatch</code> kullan.</p>',
        start: 'import re\n\ndef gecerli_telefon(metin):\n    # buraya yaz\n    pass\n',
        sol: 'import re\n\nTELEFON = re.compile(r"(?:\\+90|0)?\\s?5\\d{2}\\s?\\d{3}\\s?\\d{2}\\s?\\d{2}")\n\ndef gecerli_telefon(metin):\n    return TELEFON.fullmatch(metin) is not None\n',
        tests: 'assert gecerli_telefon("0532 123 45 67") is True, "0532 123 45 67 geçerli olmalı"\nassert gecerli_telefon("+90 532 123 45 67") is True, "+90 ile geçerli olmalı"\nassert gecerli_telefon("5321234567") is True, "Boşluksuz 10 hane geçerli olmalı"\nassert gecerli_telefon("0212 123 45 67") is False, "Sabit hat geçersiz olmalı"\nassert gecerli_telefon("532 12 34") is False, "Eksik hane geçersiz olmalı"\nassert gecerli_telefon("05321234567x") is False, "Sonda harf geçersiz olmalı"\nassert gecerli_telefon("") is False, "Boş metin geçersiz"\n',
        hints: ['Önek için (?:\\+90|0)? yakalamayan isteğe bağlı grup kullan.', 'Boşluklar için \\s? (0 ya da 1 boşluk) koy; fullmatch ile sonda fazlalığı engelle.', 'Sonucu bool yapmak için "is not None" ya da bool() kullan.'],
        why: 'fullmatch tüm metni kontrol eder; isteğe bağlı önek ve boşluklar ? niceleyicisiyle çözülür; 5 ile başlama şartı kalıba gömülüdür.' },
      { t: 'code', id: 'regex-2',
        q: '<p>Ilgaz Bank EFT açıklamalarından fatura numarası çıkaran <code>fatura_no(aciklama: str) -> str | None</code> fonksiyonunu yaz. Fatura numarası biçimi: <code>FT-</code> + 4 haneli yıl + <code>-</code> + 5 hane (örn. <code>FT-2026-00431</code>). Metnin herhangi bir yerinde olabilir; bulunamazsa <code>None</code> döndür.</p>',
        start: 'import re\n\ndef fatura_no(aciklama):\n    # buraya yaz\n    pass\n',
        sol: 'import re\n\ndef fatura_no(aciklama):\n    m = re.search(r"FT-\\d{4}-\\d{5}", aciklama)\n    return m.group() if m else None\n',
        tests: 'assert fatura_no("EFT - Fatura No: FT-2026-00431, tutar 1.250 TL") == "FT-2026-00431", "Fatura numarası bulunmalı"\nassert fatura_no("Havale FT-2025-99999") == "FT-2025-99999", "Sonda olan numara bulunmalı"\nassert fatura_no("Kira ödemesi") is None, "Numara yoksa None dönmeli"\nassert fatura_no("FT-26-00431 hatalı") is None, "Kısa yıl eşleşmemeli"\n',
        hints: ['re.search eşleşme nesnesi ya da None döndürür.', 'Kalıp: FT-\\d{4}-\\d{5}; sonucu m.group() ile al.'],
        why: 'search ilk eşleşmeyi bulur; koşullu ifade None durumunu güvenli şekilde ele alır.' },
      { t: 'code', id: 'regex-3',
        q: '<p>Sunucu log satırlarını ayrıştıran <code>log_ayristir(satir: str) -> dict | None</code> fonksiyonunu yaz. Satır biçimi: <code>"YYYY-AA-GG SS:DD:SS SEVIYE servis-adi: mesaj"</code>. Adlandırılmış gruplarla <code>{"tarih", "saat", "seviye", "servis", "mesaj"}</code> anahtarlı sözlük döndür; biçime uymayan satır için <code>None</code>. Servis adı harf, rakam, alt çizgi ve tire içerebilir.</p>',
        start: 'import re\n\ndef log_ayristir(satir):\n    # buraya yaz\n    pass\n',
        sol: 'import re\n\nKALIP = re.compile(r"(?P<tarih>\\d{4}-\\d{2}-\\d{2}) (?P<saat>\\d{2}:\\d{2}:\\d{2}) (?P<seviye>[A-Z]+) (?P<servis>[\\w-]+): (?P<mesaj>.*)")\n\ndef log_ayristir(satir):\n    m = KALIP.fullmatch(satir)\n    return m.groupdict() if m else None\n',
        tests: 'r = log_ayristir("2026-03-15 14:30:07 ERROR odeme-servisi: zaman asimi (kod=504)")\nassert r == {"tarih": "2026-03-15", "saat": "14:30:07", "seviye": "ERROR", "servis": "odeme-servisi", "mesaj": "zaman asimi (kod=504)"}, "Ayrıştırma yanlış: " + str(r)\nr2 = log_ayristir("2026-03-15 09:00:00 INFO api_v2: basladi")\nassert r2["servis"] == "api_v2" and r2["seviye"] == "INFO", "Alt çizgili servis adı desteklenmeli"\nassert log_ayristir("bozuk satır") is None, "Uymayan satır için None dönmeli"\n',
        hints: ['(?P<ad>...) ile adlandırılmış grup; m.groupdict() sözlük verir.', 'Servis için [\\w-]+ kullan; mesaj için .* (satır sonuna kadar).'],
        why: 'Adlandırılmış gruplar sayesinde groupdict doğrudan istenen sözlüğü üretir; uymayan satırda search/fullmatch None döndürür.' },
      { t: 'code', id: 'regex-4',
        q: '<p>KVKK maskeleme: <code>kart_maskele(metin: str) -> str</code> fonksiyonu metindeki <code>"DDDD DDDD DDDD DDDD"</code> biçimindeki (boşlukla ayrılmış 4x4 hane) tüm kart numaralarının ortadaki 8 hanesini yıldızlasın: <code>"5401 **** **** 1234"</code>. Diğer metin değişmesin. <code>re.sub</code> ve gruplar kullan.</p>',
        start: 'import re\n\ndef kart_maskele(metin):\n    # buraya yaz\n    pass\n',
        sol: 'import re\n\ndef kart_maskele(metin):\n    return re.sub(r"\\b(\\d{4}) \\d{4} \\d{4} (\\d{4})\\b", r"\\1 **** **** \\2", metin)\n',
        tests: 'assert kart_maskele("Kart 5401 2345 6789 1234 ile ödeme") == "Kart 5401 **** **** 1234 ile ödeme", "Orta 8 hane maskelenmeli"\nassert kart_maskele("A: 1111 2222 3333 4444, B: 5555 6666 7777 8888") == "A: 1111 **** **** 4444, B: 5555 **** **** 8888", "Tüm kartlar maskelenmeli"\nassert kart_maskele("Telefon 0532 123 45 67") == "Telefon 0532 123 45 67", "Kart olmayan metin değişmemeli"\n',
        hints: ['İlk ve son 4 haneyi parantezle yakala, ortadakileri yakalama.', 'Değiştirme metninde \\1 ve \\2 ile grupları geri koy (ham dize kullan).'],
        why: 're.sub tüm eşleşmeleri değiştirir; gruplar korunacak kısımları taşır, orta bloklar sabit yıldızla değiştirilir.' },
      { t: 'code', id: 'regex-5',
        q: '<p>Fiyat çıkarma: <code>fiyatlari_bul(metin: str) -> list[float]</code> fonksiyonu, metindeki <code>"1.250,00 TL"</code> ya da <code>"349 TL"</code> biçimindeki Türk formatlı tutarları bulup float listesine çevirsin (binlik ayırıcı nokta kaldırılır, ondalık virgül noktaya çevrilir). Para birimi mutlaka "TL" olmalı; "USD" tutarları alınmasın.</p>',
        start: 'import re\n\ndef fiyatlari_bul(metin):\n    # buraya yaz\n    pass\n',
        sol: 'import re\n\nKALIP = re.compile(r"(\\d{1,3}(?:\\.\\d{3})*(?:,\\d{2})?|\\d+(?:,\\d{2})?)\\s*TL\\b")\n\ndef fiyatlari_bul(metin):\n    sonuc = []\n    for ham in KALIP.findall(metin):\n        sonuc.append(float(ham.replace(".", "").replace(",", ".")))\n    return sonuc\n',
        tests: 'r = fiyatlari_bul("laptop 25.999,90 TL, mouse 349 TL, kulaklık 120 USD, çanta 1.200 TL")\nassert r == [25999.9, 349.0, 1200.0], "Tutarlar [25999.9, 349.0, 1200.0] olmalı, gelen: " + str(r)\nassert fiyatlari_bul("fiyat yok") == [], "Tutar yoksa boş liste"\nassert fiyatlari_bul("Toplam: 1.250,00 TL") == [1250.0], "Tek tutar doğru çevrilmeli"\n',
        hints: ['Binlik grupları için \\d{1,3}(?:\\.\\d{3})* ve isteğe bağlı (?:,\\d{2})? kullan; ardından \\s*TL.', 'Yakalanan metinde önce noktayı sil, sonra virgülü noktaya çevir, float() uygula.'],
        why: 'Kalıp Türk biçimini tanır ve yalnızca TL ile biteni yakalar; metin temizliği float dönüşümünü mümkün kılar.' },
      { t: 'mc', q: 'Kullanıcının girdiği bir metni kalıbın içine gömmeden önce ne yapmalısın?',
        o: ['re.compile ile derlemek', 'str.strip uygulamak', 're.escape ile kaçırmak', 'lower() ile küçültmek'], a: 2,
        why: 're.escape, metindeki nokta, parantez gibi özel regex karakterlerini kaçırır; aksi halde "1.5" gibi bir girdi "1x5" ile de eşleşir ya da kalıp bozulur.' }
    ],
    faq: [
      { q: 'match ve search arasında ne fark var?', a: 'match yalnızca metnin başından eşleşmeye çalışır; search metnin herhangi bir yerinde ilk eşleşmeyi bulur. Doğrulama için ikisi de yetersiz olabilir; fullmatch kullan.' },
      { q: 'findall neden bazen demet listesi döndürüyor?', a: 'Kalıpta birden çok yakalama grubu varsa findall her eşleşme için grupların demetini döndürür. Tek grup varsa yalnızca o grubun metnini, grup yoksa tüm eşleşmeyi verir. Gruplamayı yakalamadan yapmak için (?:...) kullan.' },
      { q: 'E-posta doğrulamak için "doğru" regex nedir?', a: 'RFC\'ye tam uyan regex sayfalarca uzundur ve pratik değildir. İş kodunda "bir @ var, öncesi ve sonrası makul karakterler, en az bir nokta" düzeyinde kalıp yeterlidir; gerçek doğrulama onay e-postasıyla yapılır.' },
      { q: 'Ham dize (r"...") kullanmazsam ne olur?', a: '\\b backspace, \\n satır sonu gibi Python kaçışları devreye girer; \\d gibi geçersiz kaçışlar için uyarı alırsın. Kalıpları her zaman r ile yaz.' }
    ],
    mistakes: [
      { bad: 're.match(r"\\d{10}", "5321234567abc")  # eşleşir', good: 're.fullmatch(r"\\d{10}", "5321234567abc")  # None', why: 'match yalnızca baştan bakar, sondaki fazlalığı görmez; doğrulamada fullmatch kullan.' },
      { bad: 're.findall("<b>.*</b>", html)', good: 're.findall("<b>.*?</b>", html)', why: 'Açgözlü .* ilk açılış ile son kapanış arasındaki her şeyi tek parça alır; tembel .*? en kısa eşleşmede durur.' },
      { bad: 'm = re.search(kalip, metin)\nprint(m.group())', good: 'm = re.search(kalip, metin)\nif m:\n    print(m.group())', why: 'Eşleşme yoksa m None olur ve .group() AttributeError fırlatır.' },
      { bad: 're.search("1.5", fiyat)', good: 're.search(r"1\\.5", fiyat)', why: 'Nokta her karakterle eşleşir; gerçek nokta için kaçırılmalı.' }
    ]
  }
);
})(window);
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{
    id: 'json-csv', lv: 'orta', mod: 'Standart Kütüphane', min: 30,
    title: 'JSON ve CSV: veri alışverişinin iki ortak dili',
    sum: 'json ile dumps/loads, Türkçe karakter ve tarih gibi özel tipleri yönetir; csv ile reader/DictReader/DictWriter kullanır; iç içe veriyi düz tabloya çevirirsin.',
    goals: [
      'json.dumps/loads ve dump/load ile Python nesnelerini JSON\'a çevirip geri okuyabilirim.',
      'ensure_ascii, indent, sort_keys ve default parametrelerini doğru kullanabilirim.',
      'csv.reader/DictReader ile CSV okuyup DictWriter ile yazabilirim.',
      'io.StringIO ile dosya yazmadan CSV/JSON metinleriyle çalışabilirim.',
      'İç içe JSON verisini düz satırlara (CSV) çevirebilirim.'
    ],
    body: `
<h2>Neden önemli?</h2>
<p>Anadolu Market'in sipariş API'si JSON döner; muhasebe ekibi ise Excel'de açacağı CSV ister. Ilgaz Bank'ın eski sistemi CSV üretir, yeni mikroservisler JSON konuşur. Bir veri analisti ya da geliştirici olarak işinin önemli bir kısmı bu iki biçim arasında güvenle dönüşüm yapmaktır. İkisi de "düz metin" olduğu için basit görünür; ama Türkçe karakter, tarih, ondalık sayı ve iç içe yapılar en çok hatanın çıktığı yerlerdir.</p>

<h2>JSON (JavaScript Object Notation)</h2>
<p>JSON'da altı tip vardır: nesne (object, Python'da dict), dizi (array, list), metin (str), sayı (int/float), boolean (true/false) ve null (None). Demet, küme, tarih ve Decimal gibi tipler JSON'da <b>yoktur</b>; onları sen dönüştürürsün.</p>
<div class="tbl-wrap"><table>
<tr><th>Python</th><th>JSON</th><th>Geri dönüşte</th></tr>
<tr><td>dict</td><td>object { }</td><td>dict</td></tr>
<tr><td>list, tuple</td><td>array [ ]</td><td>list (demet listeye döner!)</td></tr>
<tr><td>str</td><td>string</td><td>str</td></tr>
<tr><td>int, float</td><td>number</td><td>int / float</td></tr>
<tr><td>True / False / None</td><td>true / false / null</td><td>True / False / None</td></tr>
<tr><td>datetime, Decimal, set, dataclass</td><td>desteklenmez</td><td>default= ile çevir</td></tr>
</table></div>

<h3>dumps ve loads</h3>
<p><code>dumps</code> (dump string) nesneyi JSON metnine, <code>loads</code> metni nesneye çevirir. Dosyayla çalışırken <code>dump(obj, f)</code> ve <code>load(f)</code> kullanılır.</p>
<pre class="py">import json

siparis = {
    "no": "S-1001", "musteri": "Ayşe Yılmaz", "sehir": "İzmir",
    "kalemler": [{"urun": "laptop", "adet": 1, "fiyat": 25999.9}, {"urun": "mouse", "adet": 2, "fiyat": 349.0}],
    "odendi": True, "kupon": None,
}
print(json.dumps(siparis))                      # Türkçe harfler \\u ile kaçırıldı
print(json.dumps(siparis, ensure_ascii=False))  # okunur Türkçe
print(json.dumps({"b": 1, "a": 2}, indent=2, sort_keys=True))

geri = json.loads('{"no": "S-1", "tutar": 120.5, "etiketler": ["hızlı", "kargo"], "iptal": null}')
print(geri["tutar"] + 1, geri["iptal"], type(geri["etiketler"]).__name__)</pre>
<div class="tip"><b>ensure_ascii=False</b>Varsayılan <code>ensure_ascii=True</code>, "İzmir"i <code>"\\u0130zmir"</code> yapar. Geçerli JSON'dur ama insan okuyamaz ve dosya büyür. Türkçe veri yazarken hep <code>ensure_ascii=False</code> ve dosyayı <code>encoding="utf-8"</code> ile aç.</div>

<h3>default: desteklenmeyen tipleri çevirmek</h3>
<p><code>json.dumps</code> tanımadığı bir nesneyle karşılaşınca <code>TypeError</code> verir. <code>default=fonksiyon</code> parametresi bu durumda çağrılır; sen tipi JSON'un bildiği bir şeye çevirirsin.</p>
<pre class="py">import json
from datetime import date, datetime
from decimal import Decimal
from dataclasses import dataclass, asdict

@dataclass
class Islem:
    hesap: str
    tutar: Decimal
    tarih: date

def json_uyumlu(o):
    if isinstance(o, (date, datetime)):
        return o.isoformat()
    if isinstance(o, Decimal):
        return str(o)            # para için float'a çevirme, hassasiyet kaybolur
    if isinstance(o, set):
        return sorted(o)
    if hasattr(o, "__dataclass_fields__"):
        return asdict(o)
    raise TypeError(f"JSON'a çevrilemiyor: {type(o).__name__}")

kayit = {"islem": Islem("TR01", Decimal("1250.75"), date(2026, 3, 15)), "etiketler": {"eft", "acil"}}
print(json.dumps(kayit, default=json_uyumlu, ensure_ascii=False, indent=2))

try:
    json.dumps({"t": date.today()})
except TypeError as e:
    print("default olmadan:", e)</pre>

<h3>Okurken hata yakalama</h3>
<pre class="py">import json

ham = ['{"a": 1}', "{'a': 1}", '{"a": 1,}', '']
for h in ham:
    try:
        print(repr(h), "→", json.loads(h))
    except json.JSONDecodeError as e:
        print(repr(h), "→ HATA:", e.msg, "konum", e.pos)</pre>
<div class="warn"><b>JSON Python değildir</b>Tek tırnak, sondaki virgül, yorum satırı ve <code>True</code> (büyük T) JSON'da geçersizdir. Elle JSON yazma; <code>json.dumps</code> ürettirsin.</div>

<h2>CSV (Comma-Separated Values)</h2>
<p>CSV, her satırın bir kayıt ve alanların virgülle (Türkiye'de Excel çoğu zaman noktalı virgülle) ayrıldığı düz metindir. <code>"İstanbul, Avrupa"</code> gibi virgül içeren değer tırnak içine alınır; bu yüzden <code>split(",")</code> ile ayrıştırmak <b>yanlıştır</b>, <code>csv</code> modülü tırnak kurallarını bilir.</p>
<p>Derste dosya yerine <code>io.StringIO</code> kullanıyoruz: bellekte bir "dosya gibi" nesne. Gerçek dosyada tek fark <code>open("x.csv", newline="", encoding="utf-8")</code> yazmaktır.</p>
<pre class="py">import csv, io

ham = """no,musteri,sehir,tutar
S-1,Ayşe Yılmaz,İzmir,1250.50
S-2,"Mehmet, Ali",Ankara,80
S-3,Zeynep Kaya,"İstanbul, Avrupa",349.90
"""
# reader: liste listesi
for satir in csv.reader(io.StringIO(ham)):
    print(satir)

# DictReader: başlıkları anahtar yapar
toplam = 0.0
for kayit in csv.DictReader(io.StringIO(ham)):
    toplam += float(kayit["tutar"])    # CSV'de her şey metindir!
    print(kayit["musteri"], "-", kayit["sehir"])
print("Toplam:", round(toplam, 2))

print("Yanlış yol:", 'S-2,"Mehmet, Ali",Ankara,80'.split(","))</pre>

<h3>Yazma: writer ve DictWriter</h3>
<pre class="py">import csv, io

kayitlar = [
    {"hesap": "TR01", "tutar": 1250.5, "aciklama": "Kira, Mart"},
    {"hesap": "TR02", "tutar": -80, "aciklama": "Kart ödemesi"},
]
cikti = io.StringIO()
yazici = csv.DictWriter(cikti, fieldnames=["hesap", "tutar", "aciklama"], delimiter=";")
yazici.writeheader()
yazici.writerows(kayitlar)
print(cikti.getvalue())

# Noktalı virgüllü Türkçe Excel CSV'sini geri okuma
for k in csv.DictReader(io.StringIO(cikti.getvalue()), delimiter=";"):
    print(k)

# Satır listesi için writer
c2 = io.StringIO()
w = csv.writer(c2)
w.writerow(["ad", "not"])
w.writerow(["Ali", 'Dedi ki: "tamam"'])      # tırnak otomatik kaçırılır
print(c2.getvalue())</pre>
<div class="note"><b>newline="" neden?</b>Gerçek dosya açarken <code>open(..., newline="")</code> ver; aksi halde Windows'ta her kayıt arasına boş satır girer. Excel'in Türkçe ayarları için <code>delimiter=";"</code> ve ondalık virgül gerekebilir; dosya başına BOM için <code>encoding="utf-8-sig"</code> kullanılır.</div>

<h2>İç içe veriyi düzleştirme</h2>
<p>JSON doğal olarak iç içedir (sipariş → kalemler → ürün). CSV ise düzdür. Dönüşüm için iki yaygın strateji var: (1) iç sözlükleri <code>"adres.sehir"</code> gibi noktalı anahtarlara aç; (2) listeleri her eleman bir satır olacak şekilde "patlat" (explode). İkisini birlikte gösterelim.</p>
<pre class="py">import csv, io, json

ham = json.loads("""[
  {"no": "S-1", "musteri": {"ad": "Ayşe", "sehir": "İzmir"},
   "kalemler": [{"urun": "laptop", "adet": 1}, {"urun": "mouse", "adet": 2}]},
  {"no": "S-2", "musteri": {"ad": "Ali", "sehir": "Ankara"},
   "kalemler": [{"urun": "çanta", "adet": 1}]}
]""")

def duzlestir(d, onek=""):
    """İç içe sözlüğü noktalı anahtarlarla tek seviyeye indir (listeleri olduğu gibi bırak)."""
    duz = {}
    for k, v in d.items():
        ad = f"{onek}{k}"
        if isinstance(v, dict):
            duz.update(duzlestir(v, ad + "."))
        else:
            duz[ad] = v
    return duz

satirlar = []
for s in ham:
    temel = duzlestir({k: v for k, v in s.items() if k != "kalemler"})
    for kalem in s["kalemler"]:            # her kalem ayrı satır
        satirlar.append({**temel, **kalem})

print(satirlar[0])
cikti = io.StringIO()
w = csv.DictWriter(cikti, fieldnames=list(satirlar[0].keys()))
w.writeheader(); w.writerows(satirlar)
print(cikti.getvalue())</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Büyük dosyalar, şema ve güvenlik</h3>
<p><code>json.load</code> tüm dosyayı belleğe alır; yüz megabaytlık bir dışa aktarımda bu sorun olabilir. Çözüm genellikle <b>JSON Lines</b> (her satırda bir JSON nesnesi, .jsonl) biçimidir: satır satır okur, her satıra <code>json.loads</code> uygularsın; log sistemleri ve veri hatları bu biçimi sever. CSV'de ise <code>csv.reader</code> zaten tembeldir; dosyayı satır satır tüketir.</p>
<p>Şema (schema): CSV'de her alan metindir; "tutar" sütununun sayı olduğunu sen bilirsin. Üretim kodunda okuduğun her satırı bir <code>dataclass</code>'a ya da <code>pydantic</code> modeline geçirip tip dönüşümünü tek yerde yapmak, hataları (boş hücre, "1.250,50" gibi Türk biçimi) erkenden yakalar. Para için <code>float</code> yerine <code>Decimal</code> kullan; JSON'a yazarken <code>str</code> olarak çık.</p>
<p>Güvenlik: <code>json.loads</code> güvenlidir (kod çalıştırmaz) ama <code>pickle</code> ve <code>eval</code> değildir; dış kaynaktan veri alırken asla kullanma. CSV'de "CSV enjeksiyonu" diye bir şey var: <code>=HYPERLINK(...)</code> ile başlayan hücre Excel'de formül olarak çalışır. Kullanıcı girdisini CSV'ye yazarken <code>=</code>, <code>+</code>, <code>-</code>, <code>@</code> ile başlayan hücrelerin önüne tek tırnak koymak yaygın önlemdir. Son olarak, iki sistem arasında veri taşırken <code>sort_keys=True</code> ve sabit <code>indent</code> ile üretilen JSON, git farklarını okunur tutar.</p>
</section>
`,
    ex: [
      { t: 'mc', q: '<code>json.loads(json.dumps((1, 2)))</code> ifadesinin sonucu nedir?',
        o: ['(1, 2)', '[1, 2]', '"(1, 2)"', 'TypeError'], a: 1,
        why: 'JSON\'da demet yoktur; dumps demeti diziye çevirir, loads diziyi liste olarak okur. Hata vermez, sessizce tip değişir.' },
      { t: 'mc', q: 'Türkçe karakterli veriyi insanların okuyacağı JSON dosyasına yazarken hangi parametre gerekir?',
        o: ['indent=4', 'sort_keys=True', 'ensure_ascii=False', 'default=str'], a: 2,
        why: 'ensure_ascii=False Türkçe harfleri \\u kaçışı yerine olduğu gibi yazar. indent biçimlendirir, sort_keys sıralar, default desteklenmeyen tipleri çevirir.' },
      { t: 'code', id: 'json-csv-1',
        q: '<p>Anadolu Market CSV dışa aktarımından toplam ciroyu hesaplayan <code>sehir_cirosu(csv_metni: str) -> dict</code> fonksiyonunu yaz. CSV başlıkları <code>no,sehir,tutar</code>; alanlar virgülle ayrılmış, bazı değerler tırnak içinde olabilir. Şehir bazında tutar toplamını (float, 2 basamağa yuvarlanmış) sözlük olarak döndür. <code>csv.DictReader</code> ve <code>io.StringIO</code> kullan.</p>',
        start: 'import csv, io\n\ndef sehir_cirosu(csv_metni):\n    # buraya yaz\n    pass\n',
        sol: 'import csv, io\n\ndef sehir_cirosu(csv_metni):\n    toplam = {}\n    for k in csv.DictReader(io.StringIO(csv_metni)):\n        toplam[k["sehir"]] = toplam.get(k["sehir"], 0.0) + float(k["tutar"])\n    return {s: round(t, 2) for s, t in toplam.items()}\n',
        tests: 'ham = "no,sehir,tutar\\nS-1,İzmir,100.5\\nS-2,\\"İstanbul, Avrupa\\",50\\nS-3,İzmir,19.5\\n"\nr = sehir_cirosu(ham)\nassert r == {"İzmir": 120.0, "İstanbul, Avrupa": 50.0}, "Şehir ciroları yanlış: " + str(r)\nassert sehir_cirosu("no,sehir,tutar\\n") == {}, "Yalnızca başlık varsa boş sözlük"\n',
        hints: ['csv.DictReader(io.StringIO(metin)) her satırı sözlük olarak verir.', 'CSV değerleri metindir; float(k["tutar"]) ile çevir.'],
        why: 'DictReader tırnaklı alanları doğru ayrıştırır; dict.get ile toplama yapılır; sonunda yuvarlanır.' },
      { t: 'code', id: 'json-csv-2',
        q: '<p>Ilgaz Bank işlem kayıtlarını JSON\'a çeviren <code>islem_json(islemler: list[dict]) -> str</code> fonksiyonunu yaz. Her işlem sözlüğünde <code>tarih</code> alanı <code>datetime.date</code>, <code>tutar</code> alanı <code>Decimal</code> olabilir. Tarihi ISO metnine, Decimal\'i <code>str</code>\'ye çeviren bir <code>default</code> fonksiyonu kullan; çıktıda Türkçe karakterler kaçırılmasın (<code>ensure_ascii=False</code>) ve anahtarlar sıralı olsun (<code>sort_keys=True</code>). Girinti kullanma.</p>',
        start: 'import json\nfrom datetime import date\nfrom decimal import Decimal\n\ndef islem_json(islemler):\n    # buraya yaz\n    pass\n',
        sol: 'import json\nfrom datetime import date\nfrom decimal import Decimal\n\ndef _cevir(o):\n    if isinstance(o, date):\n        return o.isoformat()\n    if isinstance(o, Decimal):\n        return str(o)\n    raise TypeError(type(o).__name__)\n\ndef islem_json(islemler):\n    return json.dumps(islemler, default=_cevir, ensure_ascii=False, sort_keys=True)\n',
        tests: 'from datetime import date\nfrom decimal import Decimal\nimport json\ns = islem_json([{"tutar": Decimal("1250.75"), "hesap": "TR01", "aciklama": "Kira Şubat", "tarih": date(2026, 2, 1)}])\nassert s == \'[{"aciklama": "Kira Şubat", "hesap": "TR01", "tarih": "2026-02-01", "tutar": "1250.75"}]\', "JSON metni beklenenden farklı: " + s\nassert "\\\\u015e" not in s, "Türkçe karakter kaçırılmamalı (ensure_ascii=False)"\nassert json.loads(islem_json([])) == [], "Boş liste için [] dönmeli"\n',
        hints: ['default parametresine isinstance ile tip ayıran bir fonksiyon ver.', 'json.dumps(..., default=f, ensure_ascii=False, sort_keys=True).'],
        why: 'default fonksiyonu yalnızca JSON\'un tanımadığı tiplerde çağrılır; sort_keys deterministik çıktı, ensure_ascii=False okunur Türkçe sağlar.' },
      { t: 'code', id: 'json-csv-3',
        q: '<p>Muhasebe için CSV üreten <code>csv_uret(kayitlar: list[dict], alanlar: list[str]) -> str</code> fonksiyonunu yaz. <code>csv.DictWriter</code> ile noktalı virgül (<code>;</code>) ayırıcılı, başlık satırlı CSV metni döndür. Satır sonu olarak <code>"\\n"</code> kullan (<code>lineterminator="\\n"</code>). Kayıtlarda <code>alanlar</code> dışındaki anahtarlar yok sayılsın (<code>extrasaction="ignore"</code>).</p>',
        start: 'import csv, io\n\ndef csv_uret(kayitlar, alanlar):\n    # buraya yaz\n    pass\n',
        sol: 'import csv, io\n\ndef csv_uret(kayitlar, alanlar):\n    cikti = io.StringIO()\n    w = csv.DictWriter(cikti, fieldnames=alanlar, delimiter=";", lineterminator="\\n", extrasaction="ignore")\n    w.writeheader()\n    w.writerows(kayitlar)\n    return cikti.getvalue()\n',
        tests: 'r = csv_uret([{"hesap": "TR01", "tutar": 100, "gizli": 1}, {"hesap": "TR02", "tutar": "a;b"}], ["hesap", "tutar"])\nassert r == \'hesap;tutar\\nTR01;100\\nTR02;"a;b"\\n\', "CSV çıktısı beklenenden farklı: " + repr(r)\nassert csv_uret([], ["x"]) == "x\\n", "Kayıt yoksa yalnızca başlık"\n',
        hints: ['io.StringIO() üzerine DictWriter kur, writeheader ve writerows çağır.', 'delimiter=";", lineterminator="\\n", extrasaction="ignore" parametrelerini unutma.'],
        why: 'DictWriter başlığı ve satırları tırnak kurallarına uygun yazar; ayırıcı içeren değer otomatik tırnaklanır.' },
      { t: 'code', id: 'json-csv-4',
        q: '<p>İç içe sözlüğü düzleştiren <code>duzlestir(d: dict, onek: str = "") -> dict</code> fonksiyonunu yaz. İç sözlüklerin anahtarları noktayla birleşsin: <code>{"a": {"b": 1, "c": {"d": 2}}, "e": 3}</code> → <code>{"a.b": 1, "a.c.d": 2, "e": 3}</code>. Listeler ve diğer değerler olduğu gibi kalsın. Özyineleme (recursion) kullan.</p>',
        start: 'def duzlestir(d, onek=""):\n    # buraya yaz\n    pass\n',
        sol: 'def duzlestir(d, onek=""):\n    duz = {}\n    for k, v in d.items():\n        ad = f"{onek}{k}"\n        if isinstance(v, dict):\n            duz.update(duzlestir(v, ad + "."))\n        else:\n            duz[ad] = v\n    return duz\n',
        tests: 'assert duzlestir({"a": {"b": 1, "c": {"d": 2}}, "e": 3}) == {"a.b": 1, "a.c.d": 2, "e": 3}, "Düzleştirme yanlış"\nassert duzlestir({"musteri": {"ad": "Ayşe", "etiket": [1, 2]}}) == {"musteri.ad": "Ayşe", "musteri.etiket": [1, 2]}, "Listeler olduğu gibi kalmalı"\nassert duzlestir({}) == {}, "Boş sözlük boş dönmeli"\nassert duzlestir({"a": {}}) == {}, "Boş iç sözlük hiç anahtar üretmemeli"\n',
        hints: ['Her değer için isinstance(v, dict) kontrol et.', 'İç sözlük için duzlestir(v, ad + ".") sonucunu update ile birleştir.'],
        why: 'Özyineleme iç sözlükleri açar; onek parametresi yolu taşır; dict olmayan değerler olduğu gibi yazılır.' },
      { t: 'code', id: 'json-csv-5',
        q: '<p>Güvenli JSON okuma: <code>guvenli_yukle(metin: str, varsayilan=None)</code> fonksiyonu metni <code>json.loads</code> ile çözsün; metin geçersiz JSON ise (<code>json.JSONDecodeError</code>) ya da sonuç bir <code>dict</code> değilse <code>varsayilan</code> değerini döndürsün.</p>',
        start: 'import json\n\ndef guvenli_yukle(metin, varsayilan=None):\n    # buraya yaz\n    pass\n',
        sol: 'import json\n\ndef guvenli_yukle(metin, varsayilan=None):\n    try:\n        veri = json.loads(metin)\n    except json.JSONDecodeError:\n        return varsayilan\n    return veri if isinstance(veri, dict) else varsayilan\n',
        tests: 'assert guvenli_yukle(\'{"a": 1}\') == {"a": 1}, "Geçerli sözlük döndürülmeli"\nassert guvenli_yukle("{\'a\': 1}") is None, "Tek tırnaklı JSON geçersiz, None dönmeli"\nassert guvenli_yukle("[1, 2]", {}) == {}, "Liste dict değil, varsayılan dönmeli"\nassert guvenli_yukle("", {"bos": True}) == {"bos": True}, "Boş metin için varsayılan"\n',
        hints: ['json.JSONDecodeError yakala (ValueError alt sınıfıdır).', 'Sonucu isinstance(veri, dict) ile kontrol et.'],
        why: 'try/except çözümleme hatasını, isinstance tip kontrolünü ele alır; her iki durumda da güvenli varsayılan döner.' }
    ],
    faq: [
      { q: 'json.dump ile json.dumps farkı ne?', a: 'dumps metin (string) döndürür; dump doğrudan açık bir dosya nesnesine yazar. load/loads için de aynı ilişki geçerlidir.' },
      { q: 'CSV okurken sayılar neden metin geliyor?', a: 'CSV\'nin tip bilgisi yoktur; her hücre metindir. int()/float()/Decimal() ile kendin çevirirsin. Türk biçimli "1.250,50" için önce noktayı sil, virgülü noktaya çevir.' },
      { q: 'Neden split(",") yerine csv modülü?', a: 'Tırnak içindeki virgüller, kaçırılmış tırnaklar ve çok satırlı hücreler split ile bozulur; csv modülü RFC 4180 kurallarını uygular.' },
      { q: 'Excel CSV\'mi Türkçe karakterleri bozuk açıyor.', a: 'Dosyayı encoding="utf-8-sig" ile yaz; başa eklenen BOM Excel\'e UTF-8 olduğunu söyler. Ayrıca Türkçe Excel noktalı virgül ayırıcı bekler.' }
    ],
    mistakes: [
      { bad: 'json.loads("{\'ad\': \'Ali\'}")', good: 'json.loads(\'{"ad": "Ali"}\')', why: 'JSON yalnızca çift tırnak kabul eder; tek tırnak JSONDecodeError verir.' },
      { bad: 'satir.split(",")', good: 'next(csv.reader([satir]))', why: 'Tırnak içindeki virgüller split ile yanlış bölünür; csv modülü tırnakları anlar.' },
      { bad: 'json.dumps({"t": date.today()})', good: 'json.dumps({"t": date.today()}, default=str)', why: 'date JSON\'da yoktur; default ile çevirmezsen TypeError alırsın.' },
      { bad: 'open("rapor.csv", "w")', good: 'open("rapor.csv", "w", newline="", encoding="utf-8")', why: 'newline="" olmadan Windows\'ta boş satırlar oluşur; encoding belirtilmezse Türkçe karakter bozulabilir.' }
    ]
  }
);
})(window);
/* Kesit Python — Orta 3: Standart Kütüphane (devam), Kalite ve Proje, Bitirme (standart-kutuphane … proje-orta) */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
/* ───────────────────────── 1. standart-kutuphane ───────────────────────── */
{
  id: 'standart-kutuphane',
  lv: 'orta',
  mod: 'Standart Kütüphane',
  min: 35,
  title: 'Standart kütüphane turu',
  sum: 'pathlib, shutil, argparse, decimal, statistics, hashlib ve secrets gibi "pilleri dahil" modüllerle dosya, komut satırı, para hesabı ve güvenlik işlerini tek satır import ile çözersin.',
  goals: [
    'pathlib ve shutil ile geçici klasörde dosya oluşturup listeleyebilir, kopyalayıp silebilirim.',
    'argparse ile komut satırı argümanlarını tanımlayıp parse_args ile test edebilirim.',
    'Para hesabında float yerine Decimal ve quantize kullanmanın nedenini açıklayabilirim.',
    'statistics, math, random, textwrap ve enum modüllerini doğru yerde seçebilirim.',
    'hashlib ile özet (hash) üretip secrets ile güvenli rastgele değer oluşturabilirim.'
  ],
  body: `
<h2>Neden "piller dahil"?</h2>
<p>Python'ın sloganlarından biri "batteries included" (piller dahil): kurulumla birlikte gelen standart kütüphane (standard library) yüzlerce modül içerir. Anadolu Market'te bir analist olarak her gün şunlarla karşılaşırsın: rapor klasörünü taramak, betiğe komut satırından parametre vermek, kuruşu kuruşuna tutar hesaplamak, satış rakamlarının ortalamasını ve sapmasını almak, bir parolayı güvenli saklamak. Bunların hiçbiri için pip ile paket kurman gerekmez. Bu ders, en sık kullanacağın modülleri tek turda gezer; her birini derinlemesine değil, "ne zaman hangisine uzanırım" düzeyinde öğrenirsin.</p>

<div class="tbl-wrap"><table>
<tr><th>İhtiyaç</th><th>Modül</th><th>Anahtar fonksiyon / sınıf</th></tr>
<tr><td>Dosya yolu, klasör, okuma-yazma</td><td>pathlib, os, shutil, tempfile</td><td>Path, mkdir, glob, copy, rmtree</td></tr>
<tr><td>Komut satırı argümanı</td><td>argparse, sys</td><td>ArgumentParser, parse_args, sys.argv</td></tr>
<tr><td>Zaman ölçme, bekleme</td><td>time</td><td>perf_counter, sleep</td></tr>
<tr><td>Rastgelelik</td><td>random, secrets</td><td>seed, choice, sample / token_hex</td></tr>
<tr><td>İstatistik ve matematik</td><td>statistics, math</td><td>mean, median, stdev / ceil, floor, sqrt</td></tr>
<tr><td>Metin sarma</td><td>textwrap</td><td>fill, shorten, dedent</td></tr>
<tr><td>Sabit küme</td><td>enum</td><td>Enum, auto</td></tr>
<tr><td>Kesin ondalık, kesir</td><td>decimal, fractions</td><td>Decimal, quantize / Fraction</td></tr>
<tr><td>Özet (hash)</td><td>hashlib</td><td>sha256, hexdigest</td></tr>
</table></div>

<h2>Dosya sistemi: pathlib, shutil, tempfile</h2>
<p><code>pathlib.Path</code>, dosya yolunu bir nesne olarak temsil eder; <code>/</code> işleciyle parça ekler, <code>.name</code>, <code>.suffix</code>, <code>.parent</code> ile parçalara ayırırsın. <code>os</code> modülü daha eski ve düşük seviyelidir; <code>os.environ</code> ve <code>os.getcwd()</code> gibi birkaç şey için hâlâ gerekir. <code>shutil</code> ise "kabuk yardımcıları": kopyalama, taşıma, klasörü komple silme. Aşağıdaki örnek, geçici bir klasörde (tempfile) küçük bir rapor arşivi kurar; bu klasör bellekte oluşur ve <code>with</code> bloğu bitince otomatik silinir.</p>
<pre class="py">import shutil
import tempfile
from pathlib import Path

with tempfile.TemporaryDirectory() as gecici:
    kok = Path(gecici) / "raporlar"
    kok.mkdir()
    for ay in ("ocak", "subat", "mart"):
        (kok / f"satis_{ay}.csv").write_text(f"sehir,tutar\\nAnkara,{len(ay) * 100}\\n", encoding="utf-8")
    (kok / "notlar.txt").write_text("Mart raporu eksik kontrol edilecek", encoding="utf-8")

    csvler = sorted(p.name for p in kok.glob("*.csv"))
    print("CSV dosyaları:", csvler)
    print("İlk dosyanın gövdesi:", (kok / "satis_ocak.csv").stem, "| uzantı:", (kok / "satis_ocak.csv").suffix)

    yedek = Path(gecici) / "yedek"
    shutil.copytree(kok, yedek)
    print("Yedekteki dosya sayısı:", len(list(yedek.iterdir())))

    shutil.rmtree(yedek)
    print("Yedek silindi mi?", not yedek.exists())
print("Geçici klasör de silindi mi?", not Path(gecici).exists())</pre>
<p><code>glob("*.csv")</code> deseni yalnızca o klasöre bakar; alt klasörler dahil aramak için <code>rglob</code> kullan. <code>write_text</code> / <code>read_text</code> dosyayı açıp kapatma işini senin yerine yapar.</p>
<div class="tip"><b>Yol birleştirmede string toplama yapma</b><code>klasor + "/" + ad</code> yerine <code>Path(klasor) / ad</code> yaz. Windows'ta ters eğik çizgi, Linux'ta düz çizgi sorununu pathlib kendisi çözer.</div>

<h2>Komut satırı: sys.argv ve argparse</h2>
<p>Betiği terminalden <code>python rapor.py --sehir Ankara --limit 5</code> diye çalıştırdığında argümanlar <code>sys.argv</code> listesine düşer. Bunları elle ayrıştırmak yerine <code>argparse</code> kullanırsın: tür dönüşümü, varsayılan değer, zorunluluk kontrolü ve <code>--help</code> çıktısı hazır gelir. Testte ya da burada tarayıcıda gerçek terminal olmadığı için <code>parse_args</code>'a listeyi elinle verirsin; bu, argparse'ı test etmenin de standart yoludur.</p>
<pre class="py">import argparse

def parser_kur() -&gt; argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="rapor", description="Anadolu Market şehir raporu")
    p.add_argument("--sehir", required=True, help="Raporlanacak şehir")
    p.add_argument("--limit", type=int, default=10, help="Kaç satır gösterilsin")
    p.add_argument("--ozet", action="store_true", help="Yalnızca toplamları yaz")
    return p

p = parser_kur()
a = p.parse_args(["--sehir", "Ankara", "--limit", "5"])
print(a.sehir, a.limit, a.ozet)
b = p.parse_args(["--sehir", "İzmir", "--ozet"])
print(b.sehir, b.limit, b.ozet)
print(type(b.limit).__name__)</pre>
<p><code>action="store_true"</code> bayrak (flag) tanımlar: yazılırsa True, yazılmazsa False. <code>type=int</code> sayesinde "5" metni tam sayıya çevrilir; geçersiz bir değer gelirse argparse anlaşılır bir hata basıp çıkar.</p>
<div class="note"><b>sys ne işe yarar?</b><code>sys.argv</code> dışında <code>sys.exit(1)</code> ile betiği hata koduyla bitirir, <code>sys.version</code> ile sürümü okur, <code>sys.path</code> ile modül arama yollarını görürsün. Betiğin "başarısız" bittiğini zamanlayıcıya bildirmenin yolu sıfır dışı bir çıkış kodudur.</div>

<h2>Para hesabı: neden float değil, Decimal?</h2>
<p>Ilgaz Bank'ta 0.1 + 0.2 liranın 0.3 çıkmaması kabul edilemez. Float ikili tabanda saklandığı için bazı ondalıkları tam temsil edemez. <code>decimal.Decimal</code> ise onluk tabanda, senin belirlediğin hassasiyette çalışır. İki kural: Decimal'i <b>string</b>'den kur (float'tan kurarsan hata taşınır) ve sonucu <code>quantize</code> ile kuruşa yuvarla.</p>
<pre class="py">from decimal import Decimal, ROUND_HALF_UP
from fractions import Fraction

print("float:  ", 0.1 + 0.2)
print("Decimal:", Decimal("0.1") + Decimal("0.2"))

tutar = Decimal("1234.567")
kdv = tutar * Decimal("0.20")
print("KDV ham:", kdv)
print("KDV kuruş:", kdv.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))

# Yanlış kullanım: float'tan Decimal
print("float'tan:", Decimal(0.1))

# Kesir: 3 ortağın payı tam olarak 1/3
pay = Fraction(1, 3)
print("3 pay toplamı:", pay * 3, "| ondalık:", float(pay))</pre>
<p><code>ROUND_HALF_UP</code> ticari yuvarlamadır (0.005 yukarı). Varsayılan <code>ROUND_HALF_EVEN</code> bankacı yuvarlaması olarak bilinir; muhasebe kuralına göre hangisini kullanacağını iş birimine sor. <code>Fraction</code> ise oran ve pay hesaplarında kayıpsız sonuç verir.</p>
<div class="warn"><b>Decimal ile float'ı karıştırma</b><code>Decimal("10") * 0.2</code> yazarsan TypeError alırsın. Çarpanı da Decimal yap: <code>Decimal("10") * Decimal("0.2")</code>. Tam sayıyla çarpmak serbesttir.</div>

<h2>Sayılar ve rastgelelik: statistics, math, random, time</h2>
<p>Küçük bir satış listesinin özetini çıkarmak için pandas'a gerek yok. <code>statistics</code> ortalama, medyan ve standart sapmayı verir; <code>math</code> yuvarlama ve kök işlemlerini; <code>random</code> örneklem seçmeyi; <code>time.perf_counter</code> ise bir işin kaç saniye sürdüğünü ölçmeyi sağlar.</p>
<pre class="py">import math
import random
import statistics
import time

satislar = [1250, 980, 1430, 1120, 2990, 1010, 1180]
print("ortalama:", round(statistics.mean(satislar), 2))
print("medyan:  ", statistics.median(satislar))
print("sapma:   ", round(statistics.stdev(satislar), 2))
print("en büyük tam sayı sayfa:", math.ceil(len(satislar) / 3), "| kök:", math.sqrt(144))

random.seed(42)
print("denetim için seçilen 3 satış:", random.sample(satislar, 3))

t0 = time.perf_counter()
toplam = sum(i * i for i in range(100_000))
print("süre (sn) sıfırdan büyük mü?", time.perf_counter() - t0 &gt; 0)</pre>
<p><code>random.seed(42)</code> deterministik sonuç verir: aynı tohumla aynı örneklem çıkar. Test yazarken ve raporu tekrarlanabilir kılarken bu şarttır. Medyanın ortalamadan küçük olması, 2990 gibi bir uç değerin ortalamayı yukarı çektiğini anlatır.</p>

<h2>Metin, sabit küme, özet: textwrap, enum, hashlib, secrets</h2>
<p>Son grup birbirinden bağımsız ama hepsi günlük işte çıkar. <code>textwrap.fill</code> uzun açıklamayı satırlara böler, <code>shorten</code> listede sığmayan başlığı kısaltır. <code>enum.Enum</code>, "ONAYLI / BEKLEMEDE / RED" gibi sabit kümeleri yazım hatasına kapalı hale getirir. <code>hashlib</code> bir metnin parmak izini (hash) üretir; parola doğrulamada parolayı değil, tuzla (salt) birleştirilmiş özetini saklarsın. Tuz üretmek için <code>random</code> değil, kriptografik <code>secrets</code> modülü kullanılır.</p>
<pre class="py">import hashlib
import secrets
import textwrap
from enum import Enum, auto

aciklama = "Anadolu Market, müşterinin iade talebini 14 gün içinde değerlendirir ve sonucu e-posta ile bildirir."
print(textwrap.fill(aciklama, width=40))
print(textwrap.shorten(aciklama, width=30, placeholder="..."))

class Durum(Enum):
    BEKLEMEDE = auto()
    ONAYLI = auto()
    RED = auto()

basvuru = Durum.ONAYLI
print(basvuru, "|", basvuru.name, "|", basvuru.value, "|", basvuru is Durum["ONAYLI"])

tuz = secrets.token_hex(8)
parola = "Gizli123"
ozet = hashlib.sha256((tuz + parola).encode("utf-8")).hexdigest()
print("tuz uzunluğu:", len(tuz), "| özet uzunluğu:", len(ozet))
print("aynı parola aynı özeti verir mi?", ozet == hashlib.sha256((tuz + parola).encode("utf-8")).hexdigest())
print("parola değişince özet değişir mi?", ozet != hashlib.sha256((tuz + "gizli123").encode("utf-8")).hexdigest())</pre>
<p>Özet tek yönlüdür: özetten parolaya dönülemez. Tuz, iki müşteri aynı parolayı seçse bile saklanan özetlerin farklı olmasını sağlar. Gerçek sistemlerde sha256 yerine yavaş ve tuzlu parola algoritmaları (bcrypt, argon2) tercih edilir; sha256'yı dosya bütünlüğü ve veri parmak izi için kullan.</p>
<div class="tip"><b>random mı, secrets mi?</b>Örneklem, simülasyon ve test verisi için <code>random</code>; token, tuz, geçici şifre, sıfırlama bağlantısı için <code>secrets</code>. random'ın çıktısı tahmin edilebilir, secrets'ınki işletim sisteminin kriptografik kaynağından gelir.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Standart kütüphane ne zaman yetmez?</h3>
<p>Tur bitti; şimdi sınırlar. Bir işi standart kütüphaneyle çözebiliyorsan dış paket ekleme: bağımlılık, güvenlik ve sürüm yükü taşırsın. Ama şu durumlarda dış pakete geçmek doğru karardır: argparse ile 20'den fazla alt komut yönetiyorsan <code>typer</code> ya da <code>click</code>; binlerce satırlık istatistikte <code>statistics</code> yerine numpy ve pandas; parola saklamada hashlib yerine <code>argon2-cffi</code> veya <code>bcrypt</code>; karmaşık tarih işlerinde <code>dateutil</code>. Karar ölçütün şu: "Standart kütüphane bu işi yapabiliyor mu ve kod hâlâ okunur mu?"</p>
<p>Bir de kurumsal kodda sık görülen üç küçük kalıbı aklında tut. Birincisi, betiğin her zaman <code>main(argv=None)</code> fonksiyonuyla başlaması: <code>argv</code> None ise <code>sys.argv[1:]</code> kullanır, değilse verileni; böylece aynı fonksiyon hem terminalden hem testten çağrılır. İkincisi, para alanlarını veritabanından okuduğun anda <code>Decimal</code>'e çevirip raporun sonuna kadar Decimal tutmak; float'a yalnızca grafik çizerken dönmek. Üçüncüsü, <code>Enum</code> üyelerini veritabanında <code>.name</code> olarak saklamak; sayısal <code>.value</code> saklarsan üye sırası değişince veri bozulur.</p>
</section>
`,
  ex: [
    { t: 'mc', q: 'Ilgaz Bank\'ta faiz hesabı yazıyorsun. <code>0.1 + 0.2 == 0.3</code> ifadesi float ile neden <code>False</code> döner?',
      o: ['Python toplama işleminde yuvarlama hatası yapar', 'İkili tabanda 0.1 ve 0.2 tam temsil edilemez', '== işleci float için çalışmaz', 'Sonuç 0.30000000000000004 olduğu için Python onu metne çevirir'],
      a: 1,
      why: 'Float sayılar ikili (binary) kesirlerle saklanır; 0.1 ve 0.2 sonsuz ikili kesir olduğu için en yakın değere yuvarlanır ve toplam 0.3 olmaz. Decimal onluk tabanda çalıştığı için bu sorunu yaşamaz.' },

    { t: 'code', id: 'standart-kutuphane-1',
      q: '<p>Anadolu Market için <code>kdv_hesapla(tutar, oran="0.20")</code> fonksiyonunu yaz. İki parametre de metin (string) olarak gelir. Fonksiyon tutarı <code>Decimal</code>\'e çevirip KDV\'yi hesaplasın ve sonucu <code>ROUND_HALF_UP</code> ile kuruşa (<code>Decimal("0.01")</code>) yuvarlanmış bir <code>Decimal</code> olarak döndürsün.</p>',
      start: 'from decimal import Decimal, ROUND_HALF_UP\n\ndef kdv_hesapla(tutar, oran="0.20"):\n    # tutar ve oran string gelir\n    pass\n',
      sol: 'from decimal import Decimal, ROUND_HALF_UP\n\ndef kdv_hesapla(tutar, oran="0.20"):\n    kdv = Decimal(tutar) * Decimal(oran)\n    return kdv.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)\n',
      tests: 'from decimal import Decimal\nr = kdv_hesapla("100")\nassert isinstance(r, Decimal), "Sonuç Decimal olmalı"\nassert r == Decimal("20.00"), "100 TL için KDV 20.00 olmalı"\nassert str(r) == "20.00", "Sonuç kuruşa yuvarlanmış olmalı (20.00)"\nassert kdv_hesapla("1234.567") == Decimal("246.91"), "1234.567 * 0.20 = 246.9134 -> 246.91 olmalı"\nassert kdv_hesapla("0.025", "1") == Decimal("0.03"), "ROUND_HALF_UP: 0.025 -> 0.03 olmalı"\nassert kdv_hesapla("50", "0.10") == Decimal("5.00"), "oran parametresi kullanılmalı"\n',
      hints: ['Decimal(tutar) * Decimal(oran) ile ham KDV\'yi bul.', 'quantize(Decimal("0.01"), rounding=ROUND_HALF_UP) iki basamağa yuvarlar.'],
      why: 'Metinden Decimal kurmak float hatasını baştan engeller; quantize ise hem yuvarlar hem de sonucun her zaman iki ondalıkla gösterilmesini sağlar.' },

    { t: 'code', id: 'standart-kutuphane-2',
      q: '<p><code>uzantiya_gore_say(klasor)</code> fonksiyonunu yaz. <code>klasor</code> bir <code>pathlib.Path</code>\'tir. Fonksiyon yalnızca o klasördeki (alt klasörler hariç) <b>dosyaları</b> uzantısına göre saysın ve <code>{".csv": 2, ".txt": 1}</code> gibi bir sözlük döndürsün. Uzantısız dosyalar <code>""</code> anahtarına yazılsın.</p>',
      start: 'from pathlib import Path\n\ndef uzantiya_gore_say(klasor):\n    pass\n',
      sol: 'from pathlib import Path\n\ndef uzantiya_gore_say(klasor):\n    sayim = {}\n    for p in klasor.iterdir():\n        if p.is_file():\n            sayim[p.suffix] = sayim.get(p.suffix, 0) + 1\n    return sayim\n',
      tests: 'import tempfile\nfrom pathlib import Path\nwith tempfile.TemporaryDirectory() as d:\n    kok = Path(d)\n    for ad in ("ocak.csv", "subat.csv", "notlar.txt", "README"):\n        (kok / ad).write_text("x", encoding="utf-8")\n    (kok / "alt").mkdir()\n    (kok / "alt" / "gizli.csv").write_text("y", encoding="utf-8")\n    r = uzantiya_gore_say(kok)\n    assert isinstance(r, dict), "Sözlük dönmeli"\n    assert r.get(".csv") == 2, "Üst klasörde 2 csv var (alt klasördeki sayılmamalı)"\n    assert r.get(".txt") == 1, "1 txt olmalı"\n    assert r.get("") == 1, "Uzantısız dosya \\"\\" anahtarına yazılmalı"\n    assert ".alt" not in r and "alt" not in r, "Klasörler sayılmamalı"\n    assert uzantiya_gore_say(kok / "alt") == {".csv": 1}, "Alt klasör tek başına verilince 1 csv"\n',
      hints: ['klasor.iterdir() ile içeriği gez; p.is_file() ile klasörleri ele.', 'p.suffix uzantıyı nokta ile verir; uzantısızda boş metindir.'],
      why: 'iterdir yalnızca bir seviye tarar; is_file klasörleri eler; suffix doğrudan sözlük anahtarı olarak kullanılır.' },

    { t: 'code', id: 'standart-kutuphane-3',
      q: '<p>Komut satırı aracı için <code>argumanlari_ayristir(argv)</code> fonksiyonunu argparse ile yaz. <code>argv</code> bir liste olarak gelir (örn. <code>["--sehir", "Ankara"]</code>). Tanımlanacak argümanlar: <code>--sehir</code> (zorunlu, metin), <code>--limit</code> (tam sayı, varsayılan 10), <code>--ozet</code> (bayrak; yazılırsa True). Fonksiyon <code>parse_args(argv)</code> sonucunu (Namespace) döndürsün.</p>',
      start: 'import argparse\n\ndef argumanlari_ayristir(argv):\n    p = argparse.ArgumentParser(prog="rapor")\n    # argümanları ekle\n    return p.parse_args(argv)\n',
      sol: 'import argparse\n\ndef argumanlari_ayristir(argv):\n    p = argparse.ArgumentParser(prog="rapor")\n    p.add_argument("--sehir", required=True)\n    p.add_argument("--limit", type=int, default=10)\n    p.add_argument("--ozet", action="store_true")\n    return p.parse_args(argv)\n',
      tests: 'a = argumanlari_ayristir(["--sehir", "Ankara"])\nassert a.sehir == "Ankara", "--sehir okunmalı"\nassert a.limit == 10, "limit varsayılanı 10 olmalı"\nassert a.ozet is False, "--ozet yazılmayınca False olmalı"\nb = argumanlari_ayristir(["--sehir", "İzmir", "--limit", "5", "--ozet"])\nassert b.limit == 5 and isinstance(b.limit, int), "--limit tam sayıya çevrilmeli (type=int)"\nassert b.ozet is True, "--ozet yazılınca True olmalı"\ntry:\n    argumanlari_ayristir(["--limit", "3"])\n    assert False, "--sehir verilmezse hata olmalı (required=True)"\nexcept SystemExit:\n    pass\n',
      hints: ['add_argument("--sehir", required=True)', 'Sayı için type=int, default=10; bayrak için action="store_true".'],
      why: 'argparse zorunlu argüman eksikse SystemExit fırlatır; testte bunu yakalamak argparse davranışını doğrulamanın standart yoludur.' },

    { t: 'code', id: 'standart-kutuphane-4',
      q: '<p>Anadolu Market günlük satış listesi için <code>ozet_istatistik(sayilar)</code> fonksiyonunu yaz. <code>statistics</code> modülünü kullanarak <code>{"ortalama": ..., "medyan": ..., "sapma": ...}</code> sözlüğü döndürsün; üç değer de <code>round(x, 2)</code> ile yuvarlansın. Sapma için örneklem standart sapması (<code>stdev</code>) kullanılsın. Liste tek elemanlıysa sapma <code>0.0</code> olsun.</p>',
      start: 'import statistics\n\ndef ozet_istatistik(sayilar):\n    pass\n',
      sol: 'import statistics\n\ndef ozet_istatistik(sayilar):\n    sapma = statistics.stdev(sayilar) if len(sayilar) > 1 else 0.0\n    return {\n        "ortalama": round(statistics.mean(sayilar), 2),\n        "medyan": round(statistics.median(sayilar), 2),\n        "sapma": round(sapma, 2),\n    }\n',
      tests: 'r = ozet_istatistik([1250, 980, 1430, 1120, 2990, 1010, 1180])\nassert set(r) == {"ortalama", "medyan", "sapma"}, "Anahtarlar ortalama, medyan, sapma olmalı"\nassert abs(r["ortalama"] - 1422.86) < 0.01, "ortalama 1422.86 olmalı"\nassert abs(r["medyan"] - 1180) < 0.01, "medyan 1180 olmalı"\nassert abs(r["sapma"] - 707.48) < 0.01, "örneklem sapması 707.48 olmalı (stdev)"\nassert ozet_istatistik([500]) == {"ortalama": 500, "medyan": 500, "sapma": 0.0}, "Tek elemanda sapma 0.0 olmalı"\n',
      hints: ['statistics.mean, statistics.median, statistics.stdev', 'stdev tek elemanda hata verir; len kontrolü yap.'],
      why: 'stdev örneklem sapmasıdır (n-1 ile böler); pstdev ise popülasyon sapması. Tek elemanlı listede stdev StatisticsError fırlatır, bu yüzden korunur.' },

    { t: 'mc', q: 'Ilgaz Bank müşterisine şifre sıfırlama bağlantısı için tek kullanımlık bir token üreteceksin. Hangisi doğru seçimdir?',
      o: ['random.randint(100000, 999999)', 'hashlib.sha256(b"token").hexdigest()', 'secrets.token_urlsafe(32)', 'random.choice(string.ascii_letters)'],
      a: 2,
      why: 'secrets modülü kriptografik olarak güvenli rastgelelik üretir; random tahmin edilebilirdir. hashlib ise rastgele değer üretmez, verilen girdinin özetini alır; sabit girdiyle her zaman aynı sonucu verir.' },

    { t: 'code', id: 'standart-kutuphane-5',
      q: '<p><code>parola_ozeti(parola, tuz)</code> fonksiyonunu yaz: <code>tuz + parola</code> metnini UTF-8 olarak kodlayıp SHA-256 özetinin onaltılık (hex) halini döndürsün. Ardından <code>tuz_uret()</code> fonksiyonunu yaz: <code>secrets.token_hex(8)</code> ile 16 karakterlik bir tuz döndürsün.</p>',
      start: 'import hashlib\nimport secrets\n\ndef parola_ozeti(parola, tuz):\n    pass\n\ndef tuz_uret():\n    pass\n',
      sol: 'import hashlib\nimport secrets\n\ndef parola_ozeti(parola, tuz):\n    return hashlib.sha256((tuz + parola).encode("utf-8")).hexdigest()\n\ndef tuz_uret():\n    return secrets.token_hex(8)\n',
      tests: 'import hashlib\nbeklenen = hashlib.sha256("abc123Gizli".encode("utf-8")).hexdigest()\nassert parola_ozeti("Gizli", "abc123") == beklenen, "Özet sha256(tuz + parola) olmalı"\nassert len(parola_ozeti("x", "y")) == 64, "sha256 hex özeti 64 karakter olmalı"\nassert parola_ozeti("Gizli", "abc123") != parola_ozeti("gizli", "abc123"), "Farklı parola farklı özet vermeli"\nt1, t2 = tuz_uret(), tuz_uret()\nassert len(t1) == 16, "token_hex(8) 16 karakter üretir"\nassert t1 != t2, "Her çağrı farklı tuz üretmeli"\nassert all(c in "0123456789abcdef" for c in t1), "Tuz onaltılık karakterlerden oluşmalı"\n',
      hints: ['hashlib.sha256(metin.encode("utf-8")).hexdigest()', 'Önce tuz, sonra parola: (tuz + parola)'],
      why: 'hexdigest 32 baytlık özeti 64 karakterlik hex metne çevirir. Tuz, aynı parolaya sahip iki kullanıcının farklı özet almasını sağlar.' },

    { t: 'mc', q: '<code>class Durum(Enum)</code> içinde <code>ONAYLI = auto()</code> tanımladın. Bir sipariş kaydını veritabanına yazarken hangi değeri saklamak daha güvenlidir?',
      o: ['Durum.ONAYLI.value (sayı)', 'Durum.ONAYLI.name ("ONAYLI")', 'str(Durum.ONAYLI)', 'id(Durum.ONAYLI)'],
      a: 1,
      why: 'auto() ile üretilen sayısal value, üyeler yeniden sıralanınca değişebilir; name ise sabit ve okunurdur. str() "Durum.ONAYLI" gibi sınıf adını da taşır, id() ise çalıştırma arasında değişen bellek adresidir.' }
  ],
  faq: [
    { q: 'os.path ile pathlib arasında hangisini kullanmalıyım?', a: 'Yeni kodda pathlib. os.path metin tabanlıdır ve her işlem için ayrı fonksiyon çağırırsın; Path nesnesi ise okunur ve zincirlenebilir. Eski kodu okurken os.path.join, os.path.exists gibi fonksiyonları tanıman yeter.' },
    { q: 'Decimal her yerde float\'tan yavaş mı?', a: 'Evet, belirgin biçimde yavaştır ama para hesabında doğruluk hızdan önemlidir. Bilimsel hesap ve grafik için float, para ve muhasebe için Decimal kullan.' },
    { q: 'argparse parse_args() argümansız çağrılınca ne olur?', a: 'sys.argv[1:] listesini okur, yani terminalden gelen gerçek argümanları. Test ve notebook ortamında bu beklenmedik hatalara yol açar; bu yüzden argümanı her zaman liste olarak geçirebilen bir yapı kur.' },
    { q: 'sha256 ile parola saklamak yeterli mi?', a: 'Üretimde yeterli değil: sha256 hızlıdır, saldırgan milyarlarca denemeyi kısa sürede yapar. Parola için argon2 veya bcrypt gibi yavaş ve tuzlu algoritmalar kullanılır; sha256 dosya bütünlüğü ve parmak izi için uygundur.' }
  ],
  mistakes: [
    { bad: 'Decimal(0.1) + Decimal(0.2)', good: 'Decimal("0.1") + Decimal("0.2")', why: 'Float\'tan kurulan Decimal, float\'ın hatasını olduğu gibi taşır. Decimal her zaman metinden ya da tam sayıdan kurulur.' },
    { bad: 'yol = klasor + "/" + "rapor.csv"', good: 'yol = Path(klasor) / "rapor.csv"', why: 'Metin birleştirme işletim sistemine göre bozulur ve klasor zaten Path ise TypeError verir. / işleci her platformda doğru ayırıcıyı kullanır.' },
    { bad: 'token = str(random.randint(0, 10**9))', good: 'token = secrets.token_urlsafe(32)', why: 'random tahmin edilebilir bir üreteçtir; güvenlik amaçlı değerler kriptografik secrets modülünden gelmelidir.' },
    { bad: 'statistics.stdev([1500])', good: 'statistics.stdev(x) if len(x) > 1 else 0.0', why: 'Örneklem sapması en az iki değer ister; tek elemanda StatisticsError fırlatır.' }
  ]
},
/* ───────────────────────── 2. sqlite-python ───────────────────────── */
{
  id: 'sqlite-python',
  lv: 'orta',
  mod: 'Standart Kütüphane',
  min: 35,
  title: 'sqlite3 ile Python',
  sum: 'Bellek içi SQLite veritabanı kurar, parametreli sorguyla SQL enjeksiyonundan korunur, executemany ile toplu yükler, Row factory ile satırları sözlük gibi okur ve transaction mantığını kavrarsın.',
  goals: [
    'sqlite3 ile bellek içi veritabanı açıp tablo oluşturabilir, veri ekleyip sorgulayabilirim.',
    'Parametreli sorgu (?) ile SQL enjeksiyonunu engelleyebilir, executemany ile toplu ekleme yapabilirim.',
    'Row factory ile satırları sütun adıyla okuyup sözlüğe çevirebilirim.',
    'commit, rollback ve bağlam yöneticisi ile transaction davranışını yönetebilirim.',
    'Hangi işi SQL\'e, hangisini Python\'a bırakacağıma karar verebilirim.'
  ],
  body: `
<h2>Neden SQLite?</h2>
<p>SQLite, tek bir dosyada (ya da bellekte) yaşayan, sunucu gerektirmeyen bir ilişkisel veritabanıdır (relational database). Python ile birlikte gelen <code>sqlite3</code> modülü sayesinde kurulum yapmadan SQL yazabilirsin. Anadolu Market'te bir analist için tipik kullanım şu: binlerce satırlık sipariş CSV'sini bir SQLite tablosuna yükle, SQL ile grupla ve filtrele, sonucu Python ile raporla. Masaüstü uygulamaları, mobil uygulamalar ve tarayıcılar da yerel verisini SQLite'ta tutar; yani öğrendiğin şey oyuncak değil, dünyanın en yaygın veritabanı motoru.</p>
<p>Kesit SQL'de SQL'in kendisini öğrendin. Bu derste sorulan soru farklı: <b>Python, SQL ile nasıl konuşur?</b> Üç kavram yeter: bağlantı (connection), imleç (cursor) ve transaction.</p>

<h2>Bağlantı, tablo, ekleme, sorgu</h2>
<p><code>sqlite3.connect(":memory:")</code> yalnızca RAM'de yaşayan bir veritabanı açar; program bitince kaybolur. Derste ve testte idealdir. Dosya istersen <code>connect("market.db")</code> yazarsın. <code>execute</code> bir SQL cümlesi çalıştırır, <code>fetchall</code> sonuç satırlarını demet listesi olarak getirir.</p>
<pre class="py">import sqlite3

con = sqlite3.connect(":memory:")
con.execute("""
    CREATE TABLE siparis (
        id INTEGER PRIMARY KEY,
        musteri TEXT NOT NULL,
        sehir TEXT NOT NULL,
        tutar REAL NOT NULL
    )
""")
con.execute("INSERT INTO siparis (musteri, sehir, tutar) VALUES (?, ?, ?)", ("Ayşe", "Ankara", 1250.0))
con.execute("INSERT INTO siparis (musteri, sehir, tutar) VALUES (?, ?, ?)", ("Mehmet", "İzmir", 480.5))
con.commit()

satirlar = con.execute("SELECT id, musteri, sehir, tutar FROM siparis ORDER BY id").fetchall()
print(satirlar)
print("ilk satır türü:", type(satirlar[0]).__name__)
toplam = con.execute("SELECT SUM(tutar) FROM siparis").fetchone()[0]
print("toplam:", toplam)
con.close()</pre>
<p>Dikkat edilecek nokta: <code>fetchall</code> demet (tuple) listesi döner, sütun adları yoktur. <code>fetchone</code> tek satır (ya da None) getirir; tek değerli sonuçlarda <code>[0]</code> ile içini alırsın. <code>con.execute</code>, arka planda bir imleç oluşturup çalıştırmanın kısa yoludur; <code>cur = con.cursor()</code> ile açık imleç de kullanabilirsin.</p>

<h2>Parametreli sorgu ve SQL enjeksiyonu</h2>
<p>Yukarıdaki <code>?</code> işaretleri yer tutucudur (placeholder). Değerleri SQL metnine f-string ile gömmek yerine ayrı bir demetle verirsin. Bunun iki nedeni var: sqlite3 tırnak ve özel karakterleri doğru kaçırır, ve kullanıcıdan gelen metin SQL olarak <b>yorumlanmaz</b>. Aşağıdaki örnek, kötü niyetli bir girdinin f-string'li sorguyu nasıl ele geçirdiğini, parametreli sorgunun ise aynı metni sadece veri olarak gördüğünü gösterir.</p>
<pre class="py">import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE musteri (ad TEXT, sehir TEXT)")
con.executemany("INSERT INTO musteri VALUES (?, ?)", [("Ayşe", "Ankara"), ("Can", "Bursa"), ("Elif", "Ankara")])

girdi = "Ankara' OR '1'='1"   # arama kutusuna yazılan kötü niyetli metin

# YANLIŞ: metin SQL'in parçası olur, koşul her zaman doğru çıkar
kotu = con.execute(f"SELECT ad FROM musteri WHERE sehir = '{girdi}'").fetchall()
print("f-string ile:", [r[0] for r in kotu])

# DOĞRU: metin yalnızca bir değerdir, hiçbir şehirle eşleşmez
iyi = con.execute("SELECT ad FROM musteri WHERE sehir = ?", (girdi,)).fetchall()
print("parametre ile:", [r[0] for r in iyi])

# İsimli parametre: okunur ve sıraya bağlı değil
isimli = con.execute("SELECT ad FROM musteri WHERE sehir = :s ORDER BY ad", {"s": "Ankara"}).fetchall()
print("isimli parametre:", [r[0] for r in isimli])</pre>
<div class="warn"><b>Tek değerli parametre demet olmalı</b><code>(girdi,)</code> sondaki virgüle dikkat. <code>(girdi)</code> yazarsan parantez bir işlem önceliği parantezi olur, demet değil; sqlite3 metni karakter karakter parametre sanıp hata verir.</div>
<p><code>executemany</code>, aynı sorguyu bir dizi parametreyle tekrar tekrar çalıştırır; CSV'den yüzlerce satır yüklerken döngüde tek tek <code>execute</code> çağırmaktan hem kısa hem hızlıdır.</p>

<h2>Row factory: satırı sözlük gibi okumak</h2>
<p><code>r[2]</code> yazıp "üçüncü sütun hangisiydi" diye düşünmek hata kaynağıdır. <code>con.row_factory = sqlite3.Row</code> dedikten sonra her satır hem indeksle hem sütun adıyla okunur; <code>dict(satir)</code> ile gerçek sözlüğe çevrilir ve JSON'a gitmeye hazır olur.</p>
<pre class="py">import json
import sqlite3

con = sqlite3.connect(":memory:")
con.row_factory = sqlite3.Row
con.execute("CREATE TABLE siparis (id INTEGER PRIMARY KEY, sehir TEXT, tutar REAL)")
con.executemany("INSERT INTO siparis (sehir, tutar) VALUES (?, ?)", [
    ("Ankara", 1250.0), ("İzmir", 480.5), ("Ankara", 300.0), ("Bursa", 920.0), ("İzmir", 150.0)
])

for row in con.execute("SELECT sehir, COUNT(*) AS adet, SUM(tutar) AS toplam FROM siparis GROUP BY sehir ORDER BY toplam DESC"):
    print(row["sehir"], row["adet"], row["toplam"])

ilk = con.execute("SELECT * FROM siparis WHERE id = ?", (1,)).fetchone()
print("sütunlar:", ilk.keys())
print("sözlük:", dict(ilk))
print(json.dumps([dict(r) for r in con.execute("SELECT id, sehir FROM siparis WHERE sehir = 'İzmir'")], ensure_ascii=False))</pre>
<p>GROUP BY, SUM ve ORDER BY işini SQL yaptı; Python yalnızca sonucu dolaştı. Bu iş bölümü dersin sonundaki "köprü" bölümünün özeti.</p>

<h2>Transaction: commit, rollback, bağlam yöneticisi</h2>
<p>Ilgaz Bank'ta bir havale iki UPDATE'tir: gönderenden düş, alıcıya ekle. İlki olup ikincisi olmazsa para buharlaşır. Transaction (işlem bütünlüğü) tam bunu çözer: bir grup değişiklik ya hep birlikte kalıcı olur (<code>commit</code>) ya da hep birlikte geri alınır (<code>rollback</code>). sqlite3'te bağlantı nesnesi <code>with</code> ile kullanılınca blok hatasız biterse otomatik commit, istisna çıkarsa otomatik rollback yapar. Dikkat: <code>with con:</code> bağlantıyı <b>kapatmaz</b>, yalnızca transaction'ı yönetir.</p>
<pre class="py">import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE hesap (no TEXT PRIMARY KEY, bakiye REAL NOT NULL CHECK (bakiye &gt;= 0))")
con.executemany("INSERT INTO hesap VALUES (?, ?)", [("TR01", 1000.0), ("TR02", 200.0)])
con.commit()

def havale(gonderen: str, alici: str, tutar: float) -&gt; bool:
    try:
        with con:
            con.execute("UPDATE hesap SET bakiye = bakiye - ? WHERE no = ?", (tutar, gonderen))
            con.execute("UPDATE hesap SET bakiye = bakiye + ? WHERE no = ?", (tutar, alici))
        return True
    except sqlite3.IntegrityError as e:
        print("geri alındı:", e)
        return False

def bakiyeler():
    return dict(con.execute("SELECT no, bakiye FROM hesap ORDER BY no").fetchall())

print("başlangıç:", bakiyeler())
print("300 havale:", havale("TR01", "TR02", 300.0), bakiyeler())
print("5000 havale:", havale("TR01", "TR02", 5000.0), bakiyeler())</pre>
<p>İkinci havalede ilk UPDATE bakiyeyi eksiye düşürmeye çalışınca CHECK kısıtı <code>IntegrityError</code> fırlattı; <code>with con</code> bloğu bu istisnayı görüp her şeyi geri aldı. Bakiyeler ilk havaleden sonraki halinde kaldı. Kısıtı veritabanına yazmak, Python tarafındaki <code>if</code> kontrolünü unutsan bile veriyi korur.</p>
<div class="tip"><b>Bağlantıyı kapatmayı unutma</b>Dosya tabanlı veritabanında işin bitince <code>con.close()</code> çağır; en temizi bağlantıyı <code>contextlib.closing(sqlite3.connect(...))</code> ile açmak ya da sınıfına <code>__enter__/__exit__</code> yazmaktır. Bellek içi veritabanında kapatma, veriyi de siler.</div>
<div class="note"><b>Tür eşlemesi</b>SQLite'ın INTEGER, REAL, TEXT, BLOB türleri sırasıyla int, float, str, bytes olarak gelir. Tarih tipi yoktur: tarihleri ISO metni ("2024-03-15") olarak sakla, karşılaştırma yine doğru çalışır. NULL ise Python'da None olur.</div>

<h2>Kesit SQL'e köprü: SQL ne yapar, Python ne yapar?</h2>
<p>İki araç rakip değil, iş arkadaşı. Küme işlemleri (filtre, gruplama, birleştirme, sıralama) veritabanı motorunun uzmanlık alanıdır; milyon satırda Python döngüsünden kat kat hızlıdır ve veriyi belleğe taşımaz. Python ise SQL'in beceremediği yerde devreye girer: karmaşık iş kuralları, dış sistemlerle konuşma, rapor biçimleme, test.</p>
<div class="tbl-wrap"><table>
<tr><th>İş</th><th>SQL'e bırak</th><th>Python'a bırak</th></tr>
<tr><td>Şehre göre toplam ciro</td><td>GROUP BY sehir, SUM(tutar)</td><td>Sonucu tabloya/JSON'a dök</td></tr>
<tr><td>Son 30 günün siparişleri</td><td>WHERE tarih &gt;= ?</td><td>Tarih aralığını hesapla, parametre olarak ver</td></tr>
<tr><td>Şüpheli işlem kuralı (çok adımlı)</td><td>Ham satırları getir</td><td>Kuralı fonksiyonla uygula, test et</td></tr>
<tr><td>CSV'den yükleme</td><td>INSERT (executemany)</td><td>CSV'yi oku, temizle, türleri çevir</td></tr>
<tr><td>Müşteriye e-posta</td><td>Alıcı listesini seç</td><td>Şablon doldur, gönder</td></tr>
</table></div>
<p>Pratik kural: "Veriyi azaltan iş SQL'de, veriyi anlamlandıran iş Python'da." Bir SELECT'in döndürdüğü satır sayısı ne kadar azsa, Python tarafı o kadar hızlı ve basit olur.</p>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Üretimde sqlite3: kalıplar ve sınırlar</h3>
<p>Bir veri katmanı (data layer) yazarken sorguları uygulamanın her yerine dağıtma; bir <code>Depo</code> sınıfında topla. Sınıfın kurucusu bağlantıyı alır, metotları (<code>ekle</code>, <code>sehre_gore_toplam</code>) SQL'i saklar, geri kalan kod SQL görmez. Böylece bir gün PostgreSQL'e geçersen yalnızca bu sınıfı değiştirirsin. Testlerde ise aynı sınıfa <code>":memory:"</code> bağlantısı verirsin; her test temiz bir veritabanıyla başlar, dosya kirliliği olmaz.</p>
<p>Şema değişiklikleri (migration) için <code>CREATE TABLE IF NOT EXISTS</code> başlangıçtır; büyüyen projede <code>PRAGMA user_version</code> ile şema sürümü tutup sırayla ALTER TABLE betikleri çalıştırırsın. Performans için iki not: toplu eklemede her satırdan sonra commit yapma, executemany + tek commit kullan; sık filtrelenen sütuna <code>CREATE INDEX</code> ekle. SQLite'ın sınırı eşzamanlı yazmadır: aynı anda tek yazar kabul eder. Çok kullanıcılı web uygulaması ya da gigabaytlarca büyüyen veri için PostgreSQL gibi sunucu tabanlı bir motora geçersin; ama Python tarafındaki kalıp (bağlantı, parametreli sorgu, transaction) birebir aynı kalır, çünkü hepsi DB-API 2.0 standardını izler.</p>
</section>
`,
  ex: [
    { t: 'mc', q: 'Arama kutusundan gelen <code>sehir</code> değişkenini sorguya eklemenin güvenli yolu hangisidir?',
      o: ['con.execute(f"SELECT * FROM m WHERE sehir = \'{sehir}\'")', 'con.execute("SELECT * FROM m WHERE sehir = " + repr(sehir))', 'con.execute("SELECT * FROM m WHERE sehir = ?", (sehir,))', 'con.execute("SELECT * FROM m WHERE sehir = ?" % sehir)'],
      a: 2,
      why: 'Yer tutucu (?) ile değer ayrı geçirilir; sqlite3 onu asla SQL olarak yorumlamaz. f-string, + ve % ile metin birleştirme, girdiyi SQL\'in parçası yapar ve enjeksiyona açıktır.' },

    { t: 'code', id: 'sqlite-python-1',
      q: '<p>Anadolu Market için <code>veritabani_kur()</code> fonksiyonunu yaz: <code>":memory:"</code> bağlantısı açsın, <code>siparis</code> tablosunu <code>id INTEGER PRIMARY KEY, musteri TEXT, sehir TEXT, tutar REAL</code> sütunlarıyla oluştursun ve bağlantıyı döndürsün. Sonra <code>siparis_ekle(con, kayitlar)</code> fonksiyonunu yaz: <code>kayitlar</code> <code>(musteri, sehir, tutar)</code> demetlerinden oluşan bir listedir; <code>executemany</code> ile eklesin, <code>commit</code> yapsın ve eklenen satır sayısını döndürsün.</p>',
      start: 'import sqlite3\n\ndef veritabani_kur():\n    pass\n\ndef siparis_ekle(con, kayitlar):\n    pass\n',
      sol: 'import sqlite3\n\ndef veritabani_kur():\n    con = sqlite3.connect(":memory:")\n    con.execute("CREATE TABLE siparis (id INTEGER PRIMARY KEY, musteri TEXT, sehir TEXT, tutar REAL)")\n    return con\n\ndef siparis_ekle(con, kayitlar):\n    con.executemany("INSERT INTO siparis (musteri, sehir, tutar) VALUES (?, ?, ?)", kayitlar)\n    con.commit()\n    return len(kayitlar)\n',
      tests: 'import sqlite3\ncon = veritabani_kur()\nassert isinstance(con, sqlite3.Connection), "Bağlantı nesnesi dönmeli"\ncols = [r[1] for r in con.execute("PRAGMA table_info(siparis)")]\nassert cols == ["id", "musteri", "sehir", "tutar"], "Sütunlar id, musteri, sehir, tutar olmalı"\nn = siparis_ekle(con, [("Ayşe", "Ankara", 1250.0), ("Can", "Bursa", 300.0), ("Elif", "Ankara", 90.5)])\nassert n == 3, "Eklenen satır sayısı 3 dönmeli"\nassert con.execute("SELECT COUNT(*) FROM siparis").fetchone()[0] == 3, "Tabloda 3 satır olmalı"\nassert con.execute("SELECT musteri FROM siparis WHERE id = 1").fetchone()[0] == "Ayşe", "id otomatik artmalı (1 -> Ayşe)"\nassert siparis_ekle(con, []) == 0, "Boş listede 0 dönmeli"\n',
      hints: ['sqlite3.connect(":memory:") ve con.execute("CREATE TABLE ...")', 'executemany("INSERT ... VALUES (?, ?, ?)", kayitlar) sonra con.commit()'],
      why: 'INTEGER PRIMARY KEY sütunu verilmeyince SQLite otomatik numara atar; executemany tüm demetleri tek sorguyla işler.' },

    { t: 'code', id: 'sqlite-python-2',
      q: '<p><code>sehre_gore_toplam(con)</code> fonksiyonunu yaz. <code>con</code> içinde <code>siparis(sehir, tutar)</code> tablosu dolu gelir. Fonksiyon SQL ile (GROUP BY) şehir başına sipariş adedini ve toplam tutarı hesaplasın ve toplam tutara göre azalan sırada <code>[{"sehir": ..., "adet": ..., "toplam": ...}, ...]</code> listesi döndürsün. İpucu: <code>con.row_factory = sqlite3.Row</code> ile satırları <code>dict(...)</code>\'e çevirebilirsin.</p>',
      start: 'import sqlite3\n\ndef sehre_gore_toplam(con):\n    pass\n',
      sol: 'import sqlite3\n\ndef sehre_gore_toplam(con):\n    con.row_factory = sqlite3.Row\n    sql = "SELECT sehir, COUNT(*) AS adet, SUM(tutar) AS toplam FROM siparis GROUP BY sehir ORDER BY toplam DESC"\n    return [dict(r) for r in con.execute(sql)]\n',
      tests: 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE siparis (id INTEGER PRIMARY KEY, sehir TEXT, tutar REAL)")\ncon.executemany("INSERT INTO siparis (sehir, tutar) VALUES (?, ?)", [("Ankara", 1250.0), ("İzmir", 480.5), ("Ankara", 300.0), ("Bursa", 920.0), ("İzmir", 150.0)])\nr = sehre_gore_toplam(con)\nassert isinstance(r, list) and all(isinstance(x, dict) for x in r), "Sözlük listesi dönmeli"\nassert [x["sehir"] for x in r] == ["Ankara", "Bursa", "İzmir"], "Toplama göre azalan: Ankara, Bursa, İzmir"\nassert r[0]["adet"] == 2 and abs(r[0]["toplam"] - 1550.0) < 1e-6, "Ankara: adet 2, toplam 1550.0"\nassert r[2]["adet"] == 2 and abs(r[2]["toplam"] - 630.5) < 1e-6, "İzmir: adet 2, toplam 630.5"\nassert set(r[1]) == {"sehir", "adet", "toplam"}, "Anahtarlar sehir, adet, toplam olmalı"\n',
      hints: ['SELECT sehir, COUNT(*) AS adet, SUM(tutar) AS toplam FROM siparis GROUP BY sehir ORDER BY toplam DESC', 'row_factory = sqlite3.Row sonra [dict(r) for r in ...]'],
      why: 'Gruplama ve sıralama SQL\'de yapılır; AS ile verilen takma adlar Row üzerinden doğrudan sözlük anahtarı olur.' },

    { t: 'code', id: 'sqlite-python-3',
      q: '<p>Ilgaz Bank için <code>havale(con, gonderen, alici, tutar)</code> fonksiyonunu yaz. <code>hesap(no TEXT PRIMARY KEY, bakiye REAL CHECK (bakiye &gt;= 0))</code> tablosu hazır gelir. Fonksiyon <code>with con:</code> bloğu içinde gönderenin bakiyesini düşüp alıcınınkini artırsın. Blok başarılı biterse <code>True</code> döndürsün; <code>sqlite3.IntegrityError</code> çıkarsa (bakiye eksiye düşerse) istisnayı yakalayıp <code>False</code> döndürsün. Başarısız havalede hiçbir bakiye değişmemeli.</p>',
      start: 'import sqlite3\n\ndef havale(con, gonderen, alici, tutar):\n    pass\n',
      sol: 'import sqlite3\n\ndef havale(con, gonderen, alici, tutar):\n    try:\n        with con:\n            con.execute("UPDATE hesap SET bakiye = bakiye - ? WHERE no = ?", (tutar, gonderen))\n            con.execute("UPDATE hesap SET bakiye = bakiye + ? WHERE no = ?", (tutar, alici))\n        return True\n    except sqlite3.IntegrityError:\n        return False\n',
      tests: 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE hesap (no TEXT PRIMARY KEY, bakiye REAL NOT NULL CHECK (bakiye >= 0))")\ncon.executemany("INSERT INTO hesap VALUES (?, ?)", [("TR01", 1000.0), ("TR02", 200.0)])\ncon.commit()\ndef bak(): return dict(con.execute("SELECT no, bakiye FROM hesap").fetchall())\nassert havale(con, "TR01", "TR02", 300.0) is True, "Yeterli bakiyede True dönmeli"\nassert bak() == {"TR01": 700.0, "TR02": 500.0}, "300 havale sonrası TR01=700, TR02=500 olmalı"\nassert havale(con, "TR01", "TR02", 5000.0) is False, "Yetersiz bakiyede False dönmeli"\nassert bak() == {"TR01": 700.0, "TR02": 500.0}, "Başarısız havalede bakiyeler değişmemeli (rollback)"\nassert havale(con, "TR02", "TR01", 500.0) is True, "Tam bakiye kadar havale geçerli"\nassert bak() == {"TR01": 1200.0, "TR02": 0.0}, "Son durum TR01=1200, TR02=0"\n',
      hints: ['with con: bloğu içinde iki UPDATE; istisna çıkarsa blok otomatik rollback yapar.', 'try/except sqlite3.IntegrityError ile False döndür.'],
      why: 'Bağlantı bağlam yöneticisi olarak kullanılınca hatasız çıkışta commit, istisnada rollback yapar; CHECK kısıtı eksi bakiyeyi veritabanı seviyesinde engeller.' },

    { t: 'mc', q: '<code>with con:</code> bloğu bittiğinde sqlite3 bağlantısına ne olur?',
      o: ['Bağlantı kapanır', 'Transaction commit edilir, bağlantı açık kalır', 'Tablolar silinir', 'Hiçbir şey; with yalnızca dosyalar içindir'],
      a: 1,
      why: 'sqlite3.Connection\'ın bağlam yöneticisi transaction\'ı yönetir: hatasız çıkışta commit, istisnada rollback. Bağlantıyı kapatmak için ayrıca close() gerekir.' },

    { t: 'code', id: 'sqlite-python-4',
      q: '<p><code>csv_den_yukle(con, metin)</code> fonksiyonunu yaz. <code>metin</code>, başlık satırı <code>musteri,sehir,tutar</code> olan bir CSV string\'idir. Fonksiyon <code>csv.DictReader</code> ile satırları okusun, <code>tutar</code>\'ı float\'a çevirsin, <code>siparis(musteri, sehir, tutar)</code> tablosuna <code>executemany</code> ile eklesin, commit yapsın ve eklenen satır sayısını döndürsün. Tablo hazır gelir.</p>',
      start: 'import csv\nimport io\nimport sqlite3\n\ndef csv_den_yukle(con, metin):\n    pass\n',
      sol: 'import csv\nimport io\nimport sqlite3\n\ndef csv_den_yukle(con, metin):\n    okuyucu = csv.DictReader(io.StringIO(metin))\n    kayitlar = [(r["musteri"], r["sehir"], float(r["tutar"])) for r in okuyucu]\n    con.executemany("INSERT INTO siparis (musteri, sehir, tutar) VALUES (?, ?, ?)", kayitlar)\n    con.commit()\n    return len(kayitlar)\n',
      tests: 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE siparis (id INTEGER PRIMARY KEY, musteri TEXT, sehir TEXT, tutar REAL)")\nmetin = "musteri,sehir,tutar\\nAyşe,Ankara,1250.0\\nCan,Bursa,300\\nElif,İzmir,90.5\\n"\nassert csv_den_yukle(con, metin) == 3, "3 satır eklenmeli"\nrows = con.execute("SELECT musteri, sehir, tutar FROM siparis ORDER BY id").fetchall()\nassert rows == [("Ayşe", "Ankara", 1250.0), ("Can", "Bursa", 300.0), ("Elif", "İzmir", 90.5)], "Satırlar doğru sırayla ve float tutarla eklenmeli"\nassert isinstance(rows[1][2], float), "tutar REAL (float) olarak saklanmalı"\nassert csv_den_yukle(con, "musteri,sehir,tutar\\n") == 0, "Yalnızca başlık varsa 0 dönmeli"\n',
      hints: ['csv.DictReader(io.StringIO(metin)) her satırı sözlük verir.', 'Önce (musteri, sehir, float(tutar)) demetleri listesini kur, sonra executemany.'],
      why: 'CSV\'yi okuyup türleri çevirmek Python\'un işi, satırları saklamak SQL\'in; executemany ikisini tek adımda bağlar.' },

    { t: 'mc', q: 'Bir milyon satırlık sipariş tablosunda şehir başına ciroyu hesaplayacaksın. En doğru yaklaşım hangisi?',
      o: ['SELECT * ile hepsini çekip Python sözlüğüyle toplamak', 'Her şehir için ayrı SELECT SUM sorgusu göndermek', 'GROUP BY ile tek sorguda özetleyip sonucu Python\'da raporlamak', 'Satırları pandas\'a aktarmak için önce CSV\'ye yazmak'],
      a: 2,
      why: 'Veriyi azaltan iş (gruplama) veritabanında yapılır; tek sorgu hem ağ/bellek yükünü düşürür hem hızlıdır. Her şehir için ayrı sorgu N kat yavaştır; tüm satırları Python\'a taşımak belleği boşa harcar.' }
  ],
  faq: [
    { q: 'executemany ile döngüde execute arasında gerçek fark var mı?', a: 'Sonuç aynı, hız farklı: executemany sorguyu bir kez derler ve parametreleri art arda uygular. Binlerce satırda belirgin kazanç sağlar; ayrıca kod kısalır.' },
    { q: 'Sorgu sonucunu neden tuple olarak alıyorum, sözlük daha kolay değil mi?', a: 'Varsayılan tuple hız içindir. con.row_factory = sqlite3.Row dersen hem indeks hem sütun adıyla erişirsin; dict(row) ile tam sözlüğe çevirirsin. Yeni projede row_factory ayarlamak iyi alışkanlıktır.' },
    { q: 'Tarihleri nasıl saklamalıyım?', a: 'ISO 8601 metni olarak: "2024-03-15" ya da "2024-03-15T10:30:00". Metin karşılaştırması kronolojik sırayla örtüşür, SQLite\'ın date() fonksiyonları da bu biçimi tanır.' },
    { q: 'Pyodide/tarayıcıda dosya veritabanı açabilir miyim?', a: 'Evet, sanal dosya sistemine yazılır ama sayfa yenilenince kaybolur. Derste ve testte ":memory:" kullan; kalıcı veri gerçek Python kurulumunda dosya ile tutulur.' }
  ],
  mistakes: [
    { bad: 'con.execute("SELECT * FROM m WHERE ad = ?", ad)', good: 'con.execute("SELECT * FROM m WHERE ad = ?", (ad,))', why: 'Parametreler bir dizi olmalı. Metin verilirse sqlite3 onu karakter karakter parametre sayar ve "Incorrect number of bindings" hatası verir.' },
    { bad: 'con.execute("INSERT INTO t VALUES (?)", (x,))\n# commit yok', good: 'con.execute("INSERT INTO t VALUES (?)", (x,))\ncon.commit()', why: 'Commit edilmeyen değişiklik bağlantı kapanınca kaybolur; başka bir bağlantı da onu göremez.' },
    { bad: 'with con:\n    ...\n# "bağlantı kapandı" sanmak', good: 'with con:\n    ...\ncon.close()', why: 'Bağlantı nesnesinin with bloğu yalnızca commit/rollback yapar; kaynağı serbest bırakmak için close gerekir.' },
    { bad: 'for sehir in sehirler:\n    con.execute(f"SELECT SUM(tutar) FROM s WHERE sehir=\'{sehir}\'")', good: 'con.execute("SELECT sehir, SUM(tutar) FROM s GROUP BY sehir")', why: 'Hem enjeksiyona açık hem de N ayrı sorgu; tek GROUP BY sorgusu hem güvenli hem hızlıdır.' }
  ]
},
/* ───────────────────────── 3. test-yazma ───────────────────────── */
{
  id: 'test-yazma',
  lv: 'orta',
  mod: 'Kalite ve Proje',
  min: 40,
  title: 'Test yazma: unittest, pytest ve mock',
  sum: 'unittest ile TestCase yazar, assert metotlarını ve setUp/subTest kalıplarını kullanır, pytest tarzını tanır, mock ile dış bağımlılığı taklit eder ve TDD döngüsünü uygularsın.',
  goals: [
    'unittest.TestCase ile test sınıfı yazıp assertEqual, assertAlmostEqual, assertRaises gibi metotları kullanabilirim.',
    'setUp/tearDown ve subTest ile tekrarı azaltıp parametreli test kurabilirim.',
    'Test paketini loadTestsFromTestCase ve TextTestRunner ile programatik olarak çalıştırıp sonucu okuyabilirim.',
    'pytest tarzı assert ve parametrize mantığını açıklayabilirim.',
    'unittest.mock ile zaman, ağ gibi dış bağımlılıkları taklit edip TDD döngüsünü uygulayabilirim.'
  ],
  body: `
<h2>Neden test yazarız?</h2>
<p>Ilgaz Bank'ta komisyon hesaplayan fonksiyonu değiştirdin; üç ay sonra biri "EFT komisyonu yanlış çıkıyor" dedi. Test olmadan hatanın hangi değişiklikle geldiğini bulmak saatler alır. Test (test) olduğunda ise her değişiklikten sonra tek komutla "hâlâ her şey doğru mu?" sorusunun yanıtını alırsın. Test, kodun sözleşmesidir: "Bu girdiyle bu çıktıyı veririm" cümlesinin çalıştırılabilir hali. İyi test üç şey sağlar: hatayı erken yakalar, kodu korkmadan değiştirmeni (refactoring) sağlar ve fonksiyonun nasıl kullanıldığını belgeler.</p>

<h2>unittest ile ilk test sınıfı</h2>
<p>Python'ın standart test çerçevesi <code>unittest</code>'tir. Kural basit: <code>unittest.TestCase</code>'den türeyen bir sınıf yazarsın, adı <code>test_</code> ile başlayan her metot bir testtir, içinde <code>self.assert...</code> metotlarıyla beklentini belirtirsin. Normalde testleri terminalden <code>python -m unittest</code> ile koşarsın; burada tarayıcıda olduğumuz için paketi (suite) elle yükleyip <code>TextTestRunner</code> ile çalıştıracağız. Çıktıyı <code>io.StringIO</code>'ya yönlendirmek, test raporunun program çıktısına karışmasını önler.</p>
<pre class="py">import io
import unittest

def komisyon(tutar: float, kanal: str) -&gt; float:
    """Ilgaz Bank havale komisyonu: mobil ücretsiz, şube binde 5, en az 5 TL."""
    if tutar &lt;= 0:
        raise ValueError("tutar pozitif olmalı")
    if kanal == "mobil":
        return 0.0
    return max(5.0, tutar * 0.005)

class KomisyonTest(unittest.TestCase):
    def test_mobil_ucretsiz(self):
        self.assertEqual(komisyon(1000, "mobil"), 0.0)

    def test_sube_binde_bes(self):
        self.assertAlmostEqual(komisyon(10_000, "sube"), 50.0)

    def test_sube_asgari_bes(self):
        self.assertEqual(komisyon(100, "sube"), 5.0)

    def test_negatif_tutar_hata(self):
        with self.assertRaises(ValueError):
            komisyon(-1, "mobil")

suite = unittest.defaultTestLoader.loadTestsFromTestCase(KomisyonTest)
print("test sayısı:", suite.countTestCases())
sonuc = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(suite)
print("koşan:", sonuc.testsRun, "| hata:", len(sonuc.failures) + len(sonuc.errors))
print("hepsi geçti mi?", sonuc.wasSuccessful())</pre>
<p><code>assertAlmostEqual</code> kayan noktalı sayıları 7 basamağa kadar karşılaştırır; para hesabında <code>assertEqual(0.1 + 0.2, 0.3)</code> yazarsan test boşuna düşer. <code>assertRaises</code> bir bağlam yöneticisidir: bloğun içinde beklenen istisna çıkmazsa test başarısız olur.</p>
<div class="tbl-wrap"><table>
<tr><th>Metot</th><th>Ne kontrol eder</th><th>Örnek</th></tr>
<tr><td>assertEqual(a, b)</td><td>a == b</td><td>assertEqual(topla(2, 3), 5)</td></tr>
<tr><td>assertNotEqual(a, b)</td><td>a != b</td><td>assertNotEqual(token1, token2)</td></tr>
<tr><td>assertTrue(x) / assertFalse(x)</td><td>bool(x)</td><td>assertTrue(gecerli_mi("TR01"))</td></tr>
<tr><td>assertIn(a, b)</td><td>a in b</td><td>assertIn("Ankara", sehirler)</td></tr>
<tr><td>assertIsNone(x)</td><td>x is None</td><td>assertIsNone(bul("yok"))</td></tr>
<tr><td>assertAlmostEqual(a, b, places=2)</td><td>round(a-b, places) == 0</td><td>assertAlmostEqual(kdv, 20.0, places=2)</td></tr>
<tr><td>assertRaises(Hata)</td><td>blok Hata fırlatır</td><td>with self.assertRaises(ValueError): ...</td></tr>
<tr><td>assertCountEqual(a, b)</td><td>aynı elemanlar, sıra fark etmez</td><td>assertCountEqual(sonuc, [1, 2, 3])</td></tr>
</table></div>

<h2>setUp, tearDown ve subTest</h2>
<p>Her testte aynı veriyi kurmak tekrar yaratır. <code>setUp</code> her test metodundan <b>önce</b>, <code>tearDown</code> her testten <b>sonra</b> çalışır; nesneleri <code>self</code> üzerinde paylaşırsın. <code>subTest</code> ise tek bir test metodunda birden çok girdiyi denemeni sağlar; biri düşse bile diğerleri koşmaya devam eder ve rapor hangi girdinin düştüğünü söyler. Bu, pytest'teki <code>parametrize</code>'ın unittest karşılığıdır.</p>
<pre class="py">import io
import unittest

class Sepet:
    def __init__(self):
        self.urunler = []
    def ekle(self, ad, fiyat, adet=1):
        if adet &lt; 1:
            raise ValueError("adet en az 1")
        self.urunler.append((ad, fiyat, adet))
    def toplam(self):
        return sum(f * a for _, f, a in self.urunler)
    def indirimli(self, oran):
        return round(self.toplam() * (1 - oran), 2)

class SepetTest(unittest.TestCase):
    def setUp(self):
        self.sepet = Sepet()
        self.sepet.ekle("klavye", 450.0)
        self.sepet.ekle("kablo", 25.0, 2)

    def tearDown(self):
        self.sepet.urunler.clear()

    def test_toplam(self):
        self.assertEqual(self.sepet.toplam(), 500.0)

    def test_indirim_oranlari(self):
        for oran, beklenen in [(0.0, 500.0), (0.1, 450.0), (0.5, 250.0)]:
            with self.subTest(oran=oran):
                self.assertAlmostEqual(self.sepet.indirimli(oran), beklenen)

    def test_sifir_adet_hata(self):
        with self.assertRaises(ValueError):
            self.sepet.ekle("x", 1.0, 0)

suite = unittest.defaultTestLoader.loadTestsFromTestCase(SepetTest)
adlar = [t.id().split(".")[-1] for t in suite]
print("testler:", adlar)
sonuc = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(suite)
print("başarılı:", sonuc.wasSuccessful(), "| koşan:", sonuc.testsRun)</pre>
<div class="warn"><b>Test adlarını run'dan ÖNCE topla</b>Suite çalıştırıldıktan sonra içi boşaltılır; <code>for t in suite</code> artık hiçbir şey vermez. Test adlarını ya da sayısını raporlayacaksan <code>run</code> çağrısından önce al. Yukarıdaki <code>adlar</code> satırının yeri bu yüzden önemli.</div>
<div class="note"><b>Testler birbirinden bağımsız olmalı</b>unittest metotları alfabetik sırada koşturur, sen yazdığın sırada değil. Bir testin diğerinin bıraktığı veriye güvenmesi gizli hata üretir; setUp her test için temiz başlangıç sağlar.</div>

<h2>pytest tarzı: düz assert ve parametrize</h2>
<p>Sektörde çoğu proje <code>pytest</code> kullanır (pip ile kurulur; burada çalıştıramıyoruz ama tanıman gerekir). Fark biçimseldir: sınıf şart değil, <code>test_</code> ile başlayan düz fonksiyon yeter; <code>self.assertEqual</code> yerine düz <code>assert</code> yazarsın ve pytest hata mesajını kendisi zenginleştirir. Parametreli test için dekoratör vardır:</p>
<pre class="py"># pytest tarzı (gösterim; burada çalıştırmıyoruz)
ornek = '''
import pytest
from bank import komisyon

def test_mobil_ucretsiz():
    assert komisyon(1000, "mobil") == 0.0

@pytest.mark.parametrize("tutar, beklenen", [
    (100, 5.0),
    (10_000, 50.0),
    (2_000, 10.0),
])
def test_sube(tutar, beklenen):
    assert komisyon(tutar, "sube") == pytest.approx(beklenen)

def test_negatif():
    with pytest.raises(ValueError):
        komisyon(-1, "mobil")
'''
print(ornek.strip().count("def test_"), "test fonksiyonu; parametrize 3 ayrı test üretir")
print("komut: pytest -v    ->  test_sube[100-5.0], test_sube[10000-50.0], ...")</pre>
<p>pytest unittest sınıflarını da koşturabilir; yani bugün unittest ile yazdığın testler pytest kurulduğunda da çalışır. Yeni projede pytest, standart kütüphaneyle sınırlı ortamda unittest seçersin; mantık ikisinde de aynı: düzenle (arrange), çalıştır (act), doğrula (assert).</p>

<h2>Dış bağımlılığı taklit etmek: unittest.mock</h2>
<p>"Gece saatinde yapılan işlem şüphelidir" kuralını test etmek istiyorsun; ama fonksiyon <code>datetime.now()</code> çağırıyor ve testin sonucu saat kaçta koştuğuna bağlı. Çözüm, gerçek bağımlılığı sahte bir nesneyle (mock) değiştirmek. <code>patch</code> bir adı geçici olarak değiştirir, <code>MagicMock</code> ise her çağrıyı kaydeden ve istediğin değeri döndüren esnek bir nesnedir. Kural: bağımlılığı <b>kullanıldığı yerde</b> yamalarsın, tanımlandığı yerde değil.</p>
<pre class="py">import io
import unittest
from datetime import datetime
from unittest.mock import MagicMock, patch

class IslemKurali:
    def saat(self) -&gt; int:
        return datetime.now().hour          # dış bağımlılık: gerçek saat

    def gece_mi(self) -&gt; bool:
        s = self.saat()
        return s &gt;= 23 or s &lt; 6

def sms_gonder(gonderici, telefon, metin):
    return gonderici.gonder(telefon, metin)

class KuralTest(unittest.TestCase):
    def test_gece_uc(self):
        with patch.object(IslemKurali, "saat", return_value=3):
            self.assertTrue(IslemKurali().gece_mi())

    def test_ogle_on_iki(self):
        with patch.object(IslemKurali, "saat", return_value=12):
            self.assertFalse(IslemKurali().gece_mi())

    def test_sms_cagrisi(self):
        sahte = MagicMock()
        sahte.gonder.return_value = "OK"
        self.assertEqual(sms_gonder(sahte, "5551234567", "Kod: 1234"), "OK")
        sahte.gonder.assert_called_once_with("5551234567", "Kod: 1234")

suite = unittest.defaultTestLoader.loadTestsFromTestCase(KuralTest)
sonuc = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(suite)
print("başarılı:", sonuc.wasSuccessful(), "| koşan:", sonuc.testsRun)
print("gerçek saat şu an gece mi?", IslemKurali().gece_mi())</pre>
<p><code>patch.object(IslemKurali, "saat", return_value=3)</code> sınıfın <code>saat</code> metodunu blok boyunca sabit 3 döndüren sahte bir metotla değiştirir. Modül düzeyindeki bir fonksiyonu yamalamak için <code>patch("anadolu.kurallar.saat_ver", return_value=3)</code> gibi modül yolu yazarsın; bu derste tek dosyada çalıştığımız için sınıf üzerinden yamalıyoruz. <code>assert_called_once_with</code> ise mock'un tam olarak bu argümanlarla bir kez çağrıldığını doğrular; SMS'in gerçekten gönderilmediğinden de emin olursun.</p>
<div class="tip"><b>Mock'u az kullan</b>Her şeyi mock'larsan testler kodun yapısına yapışır; fonksiyonu yeniden düzenlediğinde testler bozulur ama hata yoktur. Yalnızca yavaş, dışa bağımlı ya da rastgele olanı (saat, ağ, veritabanı, random) taklit et.</div>

<h2>TDD döngüsü: Kırmızı, Yeşil, Düzenle</h2>
<p>Test güdümlü geliştirme (Test-Driven Development) kodu yazmadan önce testi yazmaktır. Döngü üç adımdır ve her tur birkaç dakika sürer:</p>
<div class="steps-list"><ol>
<li><b>Kırmızı:</b> İstediğin davranış için küçük bir test yaz; henüz kod olmadığı için test düşer.</li>
<li><b>Yeşil:</b> Testi geçirecek en basit kodu yaz. Güzel olması gerekmez, geçmesi gerekir.</li>
<li><b>Düzenle (refactor):</b> Testler yeşilken kodu temizle: tekrarı kaldır, ad düzelt. Testler hâlâ yeşilse bitti; sonraki davranışa geç.</li>
</ol></div>
<p>TDD'nin asıl kazancı tasarımdır: fonksiyonu önce kullanan kişi olarak yazdığın için arayüzü (parametre adları, dönüş tipi) kullanıcı gözüyle seçersin. Alıştırmalarda tam bunu yapacaksın: önce test sınıfı, sonra fonksiyon.</p>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Test piramidi ve kurumsal pratik</h3>
<p>Bir projede üç katman test bulunur. Tabanda <b>birim testleri</b> (unit): tek fonksiyon ya da sınıf, milisaniyede koşar, yüzlerce olur. Ortada <b>entegrasyon testleri</b>: veritabanı, dosya, API ile birlikte çalışır; sqlite3 <code>":memory:"</code> burada kahramandır. Tepede <b>uçtan uca</b> testler: gerçek sistemin tamamı; azdır ve yavaştır. Piramidin ters dönmesi (çok uçtan uca, az birim) testlerin yavaş ve kırılgan olmasına yol açar.</p>
<p>Üç pratik kural: Birincisi, test adı bir cümle olsun: <code>test_sube_komisyonu_asgari_bes_lira</code>; düşen testin adı hatayı anlatır. İkincisi, her test tek bir şeyi doğrulasın; üç assert'li test düştüğünde hangisi diye bakmak zaman alır. Üçüncüsü, kapsama (coverage) yüzdesine takılma; kritik iş kuralı (para, yetki, tarih) yüzde yüz, loglama satırı sıfır olabilir. CI (sürekli entegrasyon) ortamında testler her commit'te otomatik koşar; İleri seviyede GitHub Actions ile bunu kuracaksın. O gün geldiğinde elinde zaten yeşil bir test paketi olmalı.</p>
</section>
`,
  ex: [
    { t: 'mc', q: 'Ilgaz Bank\'ta <code>faiz(1000, 0.03)</code> fonksiyonunun <code>30.0</code> döndürmesini bekliyorsun; sonuç float. Hangi assert en uygundur?',
      o: ['self.assertEqual(faiz(1000, 0.03), 30)', 'self.assertTrue(faiz(1000, 0.03) == 30.0)', 'self.assertAlmostEqual(faiz(1000, 0.03), 30.0)', 'self.assertIs(faiz(1000, 0.03), 30.0)'],
      a: 2,
      why: 'Float sonuçlar yuvarlama farkı taşıyabilir; assertAlmostEqual 7 basamağa kadar yakınlığı kabul eder. assertEqual ve assertTrue tam eşitlik ister, assertIs ise kimlik (aynı nesne) karşılaştırır ve float için yanlıştır.' },

    { t: 'code', id: 'test-yazma-1',
      q: '<p>Hazır gelen <code>komisyon(tutar, kanal)</code> fonksiyonu için <code>KomisyonTest(unittest.TestCase)</code> sınıfını yaz. En az üç test metodu olsun: (1) <code>test_mobil</code>: mobil kanalda 0.0 döner; (2) <code>test_sube</code>: 10000 TL şube işleminde 50.0 döner (assertAlmostEqual); (3) <code>test_negatif</code>: negatif tutarda <code>ValueError</code> fırlatılır (assertRaises). Metot adları tam böyle olsun.</p>',
      start: 'import unittest\n\ndef komisyon(tutar, kanal):\n    if tutar <= 0:\n        raise ValueError("tutar pozitif olmalı")\n    if kanal == "mobil":\n        return 0.0\n    return max(5.0, tutar * 0.005)\n\nclass KomisyonTest(unittest.TestCase):\n    pass\n',
      sol: 'import unittest\n\ndef komisyon(tutar, kanal):\n    if tutar <= 0:\n        raise ValueError("tutar pozitif olmalı")\n    if kanal == "mobil":\n        return 0.0\n    return max(5.0, tutar * 0.005)\n\nclass KomisyonTest(unittest.TestCase):\n    def test_mobil(self):\n        self.assertEqual(komisyon(1000, "mobil"), 0.0)\n\n    def test_sube(self):\n        self.assertAlmostEqual(komisyon(10000, "sube"), 50.0)\n\n    def test_negatif(self):\n        with self.assertRaises(ValueError):\n            komisyon(-1, "mobil")\n',
      tests: 'import io\nimport unittest\nassert issubclass(KomisyonTest, unittest.TestCase), "KomisyonTest unittest.TestCase\'den türemeli"\nsuite = unittest.defaultTestLoader.loadTestsFromTestCase(KomisyonTest)\nadlar = {t.id().split(".")[-1] for t in suite}\nfor ad in ("test_mobil", "test_sube", "test_negatif"):\n    assert ad in adlar, f"{ad} adlı test metodu olmalı"\nsonuc = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(suite)\nassert sonuc.testsRun >= 3, "En az 3 test koşmalı"\nassert sonuc.wasSuccessful(), "Tüm testler geçmeli (doğru fonksiyona karşı testler düşmemeli)"\n',
      hints: ['def test_mobil(self): self.assertEqual(komisyon(1000, "mobil"), 0.0)', 'with self.assertRaises(ValueError): komisyon(-1, "mobil")'],
      why: 'Üç test üç davranışı belgeler: ücretsiz kanal, oran hesabı ve hata durumu. assertRaises bağlam yöneticisi olarak kullanıldığında bloktaki çağrının istisna fırlatması beklenir.' },

    { t: 'code', id: 'test-yazma-2',
      q: '<p>TDD: önce test var, kod yok. Aşağıdaki <code>SepetTest</code> sınıfı hazır. Testleri geçirecek <code>Sepet</code> sınıfını yaz: <code>ekle(ad, fiyat, adet=1)</code> (adet 1\'den küçükse <code>ValueError</code>), <code>toplam()</code> (fiyat × adet toplamı) ve <code>indirimli(oran)</code> (toplamın <code>1 - oran</code> katı, <code>round(..., 2)</code>).</p>',
      start: 'import unittest\n\nclass Sepet:\n    # TDD: testleri geçirecek sınıfı yaz\n    pass\n\nclass SepetTest(unittest.TestCase):\n    def setUp(self):\n        self.sepet = Sepet()\n        self.sepet.ekle("klavye", 450.0)\n        self.sepet.ekle("kablo", 25.0, 2)\n\n    def test_toplam(self):\n        self.assertEqual(self.sepet.toplam(), 500.0)\n\n    def test_indirim(self):\n        for oran, beklenen in [(0.0, 500.0), (0.1, 450.0), (0.5, 250.0)]:\n            with self.subTest(oran=oran):\n                self.assertAlmostEqual(self.sepet.indirimli(oran), beklenen)\n\n    def test_sifir_adet(self):\n        with self.assertRaises(ValueError):\n            self.sepet.ekle("x", 1.0, 0)\n',
      sol: 'import unittest\n\nclass Sepet:\n    def __init__(self):\n        self.urunler = []\n\n    def ekle(self, ad, fiyat, adet=1):\n        if adet < 1:\n            raise ValueError("adet en az 1")\n        self.urunler.append((ad, fiyat, adet))\n\n    def toplam(self):\n        return sum(f * a for _, f, a in self.urunler)\n\n    def indirimli(self, oran):\n        return round(self.toplam() * (1 - oran), 2)\n\nclass SepetTest(unittest.TestCase):\n    def setUp(self):\n        self.sepet = Sepet()\n        self.sepet.ekle("klavye", 450.0)\n        self.sepet.ekle("kablo", 25.0, 2)\n\n    def test_toplam(self):\n        self.assertEqual(self.sepet.toplam(), 500.0)\n\n    def test_indirim(self):\n        for oran, beklenen in [(0.0, 500.0), (0.1, 450.0), (0.5, 250.0)]:\n            with self.subTest(oran=oran):\n                self.assertAlmostEqual(self.sepet.indirimli(oran), beklenen)\n\n    def test_sifir_adet(self):\n        with self.assertRaises(ValueError):\n            self.sepet.ekle("x", 1.0, 0)\n',
      tests: 'import io\nimport unittest\nsuite = unittest.defaultTestLoader.loadTestsFromTestCase(SepetTest)\nsayi = suite.countTestCases()\nsonuc = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(suite)\nassert sonuc.testsRun == sayi == 3, "3 test koşmalı"\nassert sonuc.wasSuccessful(), "Sepet sınıfı tüm testleri geçmeli"\ns = Sepet()\nassert s.toplam() == 0, "Boş sepetin toplamı 0 olmalı"\ns.ekle("a", 10.0, 3)\nassert s.toplam() == 30.0, "10 x 3 = 30 olmalı"\nassert s.indirimli(0.25) == 22.5, "30 * 0.75 = 22.5 olmalı"\n',
      hints: ['__init__ içinde self.urunler = [] tut; ekle demet eklesin.', 'toplam: sum(fiyat * adet ...); indirimli: round(self.toplam() * (1 - oran), 2)'],
      why: 'Testler arayüzü önceden belirledi; sınıf yalnızca onları geçecek kadar yazıldı. setUp her testte yeni sepet kurduğu için testler birbirini etkilemez.' },

    { t: 'mc', q: '<code>suite = loadTestsFromTestCase(T)</code> yükledin ve <code>run(suite)</code> çağırdın. Sonra <code>[t.id() for t in suite]</code> boş liste döndü. Neden?',
      o: ['Testler başarısız olduğu için suite temizlendi', 'id() yalnızca pytest\'te vardır', 'TextTestRunner suite\'i çalıştırdıktan sonra içini boşaltır', 'loadTestsFromTestCase tembel (lazy) çalışır'],
      a: 2,
      why: 'unittest, çalıştırılan testleri bellekten düşürmek için suite\'i run sonrasında boşaltır. Test adlarını ya da sayısını kaydetmek istiyorsan run çağrısından önce topla.' },

    { t: 'code', id: 'test-yazma-3',
      q: '<p>Ilgaz Bank şüpheli işlem kuralı: <code>IslemKurali.gece_mi()</code>, <code>self.saat()</code> 23 ve üzeri ya da 6\'dan küçükse True döner. <code>GeceTest(unittest.TestCase)</code> sınıfını yaz; <code>unittest.mock.patch.object(IslemKurali, "saat", return_value=...)</code> kullanarak iki test metodu oluştur: <code>test_gece</code> (saat 2 iken <code>IslemKurali().gece_mi()</code> True) ve <code>test_gunduz</code> (saat 14 iken False). Testler gerçek saate bağımlı olmamalı.</p>',
      start: 'import unittest\nfrom datetime import datetime\nfrom unittest.mock import patch\n\nclass IslemKurali:\n    def saat(self):\n        return datetime.now().hour\n\n    def gece_mi(self):\n        s = self.saat()\n        return s >= 23 or s < 6\n\nclass GeceTest(unittest.TestCase):\n    pass\n',
      sol: 'import unittest\nfrom datetime import datetime\nfrom unittest.mock import patch\n\nclass IslemKurali:\n    def saat(self):\n        return datetime.now().hour\n\n    def gece_mi(self):\n        s = self.saat()\n        return s >= 23 or s < 6\n\nclass GeceTest(unittest.TestCase):\n    def test_gece(self):\n        with patch.object(IslemKurali, "saat", return_value=2):\n            self.assertTrue(IslemKurali().gece_mi())\n\n    def test_gunduz(self):\n        with patch.object(IslemKurali, "saat", return_value=14):\n            self.assertFalse(IslemKurali().gece_mi())\n',
      tests: 'import io\nimport unittest\nfrom unittest.mock import patch\nsuite = unittest.defaultTestLoader.loadTestsFromTestCase(GeceTest)\nadlar = {t.id().split(".")[-1] for t in suite}\nassert {"test_gece", "test_gunduz"} <= adlar, "test_gece ve test_gunduz metotları olmalı"\n# Testler gerçek saatten bağımsız olmalı: datetime.now sabitlenince de geçmeli\nimport datetime as _dt\nclass _SahteDT(_dt.datetime):\n    _saat = 12\n    @classmethod\n    def now(cls, tz=None):\n        return _dt.datetime(2024, 1, 1, cls._saat, 0, 0)\nfor sabit in (3, 12, 23):\n    _SahteDT._saat = sabit\n    globals()["datetime"] = _SahteDT\n    s2 = unittest.defaultTestLoader.loadTestsFromTestCase(GeceTest)\n    r = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(s2)\n    globals()["datetime"] = _dt.datetime\n    assert r.wasSuccessful(), f"saat {sabit} iken bile testler geçmeli (patch.object kullanılmalı)"\nsonuc = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(suite)\nassert sonuc.testsRun >= 2 and sonuc.wasSuccessful(), "Tüm testler geçmeli"\n',
      hints: ['with patch.object(IslemKurali, "saat", return_value=2): self.assertTrue(IslemKurali().gece_mi())', 'patch.object bloğu bitince gerçek saat metodu geri gelir.'],
      why: 'patch.object, gece_mi içinde çağrılan saat metodunu blok süresince sahte bir metotla değiştirir; test ne zaman koşarsa koşsun aynı sonucu verir.' },

    { t: 'code', id: 'test-yazma-4',
      q: '<p><code>iban_gecerli(iban)</code> fonksiyonu hazır: "TR" ile başlayıp toplam 26 karakter ve ilk ikisinden sonrası rakam ise True. <code>IbanTest(unittest.TestCase)</code> sınıfında <b>tek</b> bir <code>test_ornekler</code> metodu yaz; içinde <code>self.subTest(iban=...)</code> ile şu dört örneği sırayla dene: <code>"TR" + "1"*24</code> → True, <code>"DE" + "1"*24</code> → False, <code>"TR123"</code> → False, <code>"TR" + "A"*24</code> → False.</p>',
      start: 'import unittest\n\ndef iban_gecerli(iban):\n    return len(iban) == 26 and iban.startswith("TR") and iban[2:].isdigit()\n\nclass IbanTest(unittest.TestCase):\n    pass\n',
      sol: 'import unittest\n\ndef iban_gecerli(iban):\n    return len(iban) == 26 and iban.startswith("TR") and iban[2:].isdigit()\n\nclass IbanTest(unittest.TestCase):\n    def test_ornekler(self):\n        ornekler = [\n            ("TR" + "1" * 24, True),\n            ("DE" + "1" * 24, False),\n            ("TR123", False),\n            ("TR" + "A" * 24, False),\n        ]\n        for iban, beklenen in ornekler:\n            with self.subTest(iban=iban):\n                self.assertEqual(iban_gecerli(iban), beklenen)\n',
      tests: 'import io\nimport unittest\nsuite = unittest.defaultTestLoader.loadTestsFromTestCase(IbanTest)\nadlar = [t.id().split(".")[-1] for t in suite]\nassert adlar == ["test_ornekler"], "Yalnızca test_ornekler adlı tek bir test metodu olmalı"\nassert "subTest" in __source__, "subTest kullanılmalı"\nsonuc = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(suite)\nassert sonuc.testsRun == 1 and sonuc.wasSuccessful(), "test_ornekler geçmeli"\n# Yanlış fonksiyona karşı test düşmeli (test gerçekten kontrol ediyor mu?)\n_orj = iban_gecerli\ndef iban_gecerli(iban):\n    return True\ns2 = unittest.defaultTestLoader.loadTestsFromTestCase(IbanTest)\nr2 = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(s2)\nassert not r2.wasSuccessful(), "Her zaman True dönen fonksiyona karşı test düşmeli (False beklenen örnekler kontrol edilmeli)"\niban_gecerli = _orj\n',
      hints: ['Örnekleri (iban, beklenen) listesinde tut, for ile dön.', 'with self.subTest(iban=iban): self.assertEqual(iban_gecerli(iban), beklenen)'],
      why: 'subTest tek metotta çok girdi dener; düşen alt test diğerlerini durdurmaz ve rapor hangi iban\'ın düştüğünü gösterir. Testin bozuk fonksiyonda düşmesi, testin gerçekten bir şey kontrol ettiğinin kanıtıdır.' },

    { t: 'mc', q: '<code>rapor.py</code> modülü <code>from saat import simdi</code> ile saat fonksiyonunu içe aktarıp kullanıyor. Testte hangi yolu yamalamalısın?',
      o: ['patch("saat.simdi")', 'patch("rapor.simdi")', 'patch("datetime.datetime.now")', 'patch("simdi")'],
      a: 1,
      why: 'from ... import ile ad rapor modülünün ad alanına kopyalanır; rapor o kopyayı kullanır. Bu yüzden bağımlılık kullanıldığı yerde (rapor.simdi) yamalanır; saat.simdi yamalansa rapor hâlâ eski referansı tutar.' },

    { t: 'mc', q: 'TDD döngüsünde "Yeşil" adımının amacı nedir?',
      o: ['Kodu en temiz haliyle yazmak', 'Testi geçirecek en basit kodu yazmak', 'Tüm olası testleri önceden yazmak', 'Kapsama raporunu yüzde yüze çıkarmak'],
      a: 1,
      why: 'Yeşil adımı yalnızca testi geçirmeye odaklanır; temizlik bir sonraki Düzenle (refactor) adımının işidir. Tüm testleri önceden yazmak TDD\'nin küçük adımlar ilkesine aykırıdır.' }
  ],
  faq: [
    { q: 'unittest mi pytest mi öğrenmeliyim?', a: 'İkisini de tanı. unittest kurulum gerektirmez ve her ortamda vardır; pytest sektörde yaygın, daha kısa ve okunur. pytest unittest sınıflarını da çalıştırır, yani burada yazdığın testler boşa gitmez.' },
    { q: 'Testleri gerçek projede nasıl çalıştırırım?', a: 'Terminalde proje kökünde python -m unittest discover (tests/ klasöründeki test_*.py dosyalarını bulur) ya da pytest. Bu derste tarayıcıda olduğumuz için suite\'i elle yükleyip TextTestRunner ile koşturuyoruz.' },
    { q: 'Özel (private) metotları test etmeli miyim?', a: 'Genelde hayır; testler dışa açık davranışı doğrular. Özel metot karmaşıksa bu, onun ayrı bir sınıfa ya da fonksiyona çıkması gerektiğinin işaretidir.' },
    { q: 'Mock ile her şeyi taklit etmek zararlı mı?', a: 'Aşırı mock testleri kodun iç yapısına bağlar; yeniden düzenlemede testler bozulur ama hata yoktur. Yalnızca dışa bağımlı ya da yavaş parçayı (saat, ağ, veritabanı, dosya) taklit et.' }
  ],
  mistakes: [
    { bad: 'def mobil_testi(self):\n    self.assertEqual(komisyon(100, "mobil"), 0)', good: 'def test_mobil(self):\n    self.assertEqual(komisyon(100, "mobil"), 0)', why: 'unittest yalnızca adı test_ ile başlayan metotları toplar; diğer ad hiç çalışmaz ve "hepsi geçti" yanılgısı doğar.' },
    { bad: 'self.assertEqual(kdv(100), 20.000000001)', good: 'self.assertAlmostEqual(kdv(100), 20.0, places=2)', why: 'Float sonuçlar yuvarlama farkı taşır; assertAlmostEqual belirli basamağa kadar yakınlığı kabul eder.' },
    { bad: 'self.assertRaises(ValueError, komisyon(-1, "x"))', good: 'with self.assertRaises(ValueError):\n    komisyon(-1, "x")', why: 'İlk biçimde fonksiyon assertRaises\'e girmeden çağrılır ve istisna testin dışında patlar. Bağlam yöneticisi biçimi çağrıyı denetim altında yapar.' },
    { bad: 'sonuc = runner.run(suite)\nadlar = [t.id() for t in suite]', good: 'adlar = [t.id() for t in suite]\nsonuc = runner.run(suite)', why: 'Suite çalıştırıldıktan sonra boşaltılır; adlar run\'dan önce toplanmalıdır.' }
  ]
},
/* ───────────────────────── 4. sanal-ortam-pip ───────────────────────── */
{
  id: 'sanal-ortam-pip',
  lv: 'orta',
  mod: 'Kalite ve Proje',
  min: 30,
  title: 'Sanal ortam ve paket yönetimi',
  sum: 'venv ile projeye özel ortam kurar, pip ile paket yükler, requirements.txt ve pyproject.toml ile bağımlılıkları sürüm sabitleyerek yönetir, çatışmaları tanır ve uv/poetry gibi modern araçları tanırsın.',
  goals: [
    'venv ile sanal ortam oluşturup etkinleştirebilir, neden gerekli olduğunu açıklayabilirim.',
    'pip install, pip freeze ve requirements.txt ile bağımlılıkları kurup kaydedebilirim.',
    '==, >=, ~= sürüm belirteçlerinin farkını ve semver mantığını açıklayabilirim.',
    'pyproject.toml dosyasındaki bağımlılıkları tomllib ile okuyabilirim.',
    'Bağımlılık çatışmasının ne olduğunu ve nasıl çözüleceğini anlatabilirim.'
  ],
  body: `
<h2>Sorun: "Benim makinemde çalışıyordu"</h2>
<p>Anadolu Market'in raporlama betiği senin bilgisayarında kusursuz çalışıyor; iş arkadaşın çalıştırınca <code>ModuleNotFoundError: No module named 'openpyxl'</code> alıyor. Bir başka projede pandas'ın eski sürümü gerekiyor, ama bilgisayarına yenisini kurdun ve eski proje bozuldu. İki sorunun da kaynağı aynı: paketler (package) bilgisayara <b>global</b> kurulmuş. Çözüm iki parçalı: her projeye kendi izole paket klasörü (sanal ortam, virtual environment) ve projenin hangi paketlerin hangi sürümünü istediğini yazan bir liste (requirements.txt ya da pyproject.toml).</p>
<div class="note"><b>Bu derste terminal komutları gösterilir</b>Tarayıcıdaki Python'da pip ya da venv çalıştıramayız; komutları kendi bilgisayarında dene. Kod alıştırmaları ise bu araçların ürettiği metin dosyalarını Python ile ayrıştırmak üzerine; iş hayatında da tam bunu yaparsın: CI betiği requirements'ı okur, sürümü kontrol eder.</div>

<h2>Sanal ortam: venv</h2>
<p><code>venv</code>, standart kütüphanenin parçasıdır. Proje klasöründe şu üç komut yeter:</p>
<div class="steps-list"><ol>
<li><code>python -m venv .venv</code> — proje içinde <code>.venv</code> klasörü oluşturur; içinde ayrı bir Python ve boş bir paket klasörü vardır.</li>
<li>Etkinleştir: Windows'ta <code>.venv\\Scripts\\activate</code>, macOS/Linux'ta <code>source .venv/bin/activate</code>. Terminal satırının başında <code>(.venv)</code> belirir.</li>
<li>Artık <code>pip install</code> yalnızca bu klasöre kurar; <code>deactivate</code> ile çıkarsın.</li>
</ol></div>
<p>Kural: her proje kendi <code>.venv</code>'ine sahip olur ve bu klasör <b>asla</b> Git'e girmez (sonraki derste <code>.gitignore</code>'a yazacağız). Ortamı başkasıyla paylaşmazsın; paylaştığın şey bağımlılık listesidir, ortamı herkes kendi makinesinde o listeden yeniden kurar.</p>
<pre class="py">import sys
from pathlib import Path

# Sanal ortam etkin mi? sys.prefix sanal ortamın yolunu, base_prefix gerçek kurulumu gösterir
etkin = sys.prefix != sys.base_prefix
print("sanal ortam etkin mi?", etkin)
print("Python sürümü:", sys.version_info.major, ".", sys.version_info.minor, sep="")

# Tipik bir proje yerleşimi (gösterim)
agac = {
    "anadolu-rapor/": ["pyproject.toml", "requirements.txt", "README.md", ".gitignore", ".venv/  (Git'e girmez)", "src/anadolu_rapor/", "tests/"],
}
for kok, parcalar in agac.items():
    print(kok)
    for p in parcalar:
        print("  ", p)</pre>

<h2>pip: kur, listele, dondur</h2>
<p><code>pip</code> Python'ın paket yöneticisidir ve PyPI (Python Package Index) deposundan indirir. Günlük komutlar:</p>
<div class="tbl-wrap"><table>
<tr><th>Komut</th><th>Ne yapar</th></tr>
<tr><td>pip install pandas</td><td>En yeni uyumlu sürümü kurar</td></tr>
<tr><td>pip install "pandas==2.2.2"</td><td>Tam o sürümü kurar</td></tr>
<tr><td>pip install -r requirements.txt</td><td>Listedeki her şeyi kurar</td></tr>
<tr><td>pip install -e .</td><td>Projenin kendisini düzenlenebilir modda kurar (pyproject gerekir)</td></tr>
<tr><td>pip list</td><td>Kurulu paketleri gösterir</td></tr>
<tr><td>pip freeze &gt; requirements.txt</td><td>Kurulu paketleri tam sürümle dosyaya yazar</td></tr>
<tr><td>pip uninstall pandas</td><td>Kaldırır</td></tr>
<tr><td>pip install --upgrade pip</td><td>pip'in kendisini günceller</td></tr>
</table></div>
<p><code>pip freeze</code> çıktısı <code>paket==sürüm</code> satırlarından oluşur. Bu, "o gün çalışan tam kombinasyon"un fotoğrafıdır; dağıtımda (deployment) bu dosyayı kullanırsın ki sunucuda da birebir aynı sürümler kurulsun.</p>

<h2>Sürüm belirteçleri ve semver</h2>
<p>Paketler çoğunlukla anlamsal sürümleme (semantic versioning, semver) kullanır: <code>MAJOR.MINOR.PATCH</code>. PATCH hata düzeltmesidir, MINOR geriye uyumlu yeni özellik, MAJOR ise uyumu bozabilen değişiklik. requirements.txt satırında hangi sürümleri kabul ettiğini belirtirsin:</p>
<div class="tbl-wrap"><table>
<tr><th>Belirteç</th><th>Anlamı</th><th>Ne zaman</th></tr>
<tr><td>pandas==2.2.2</td><td>Tam olarak 2.2.2</td><td>Dağıtım, tekrarlanabilirlik</td></tr>
<tr><td>pandas&gt;=2.0</td><td>2.0 ve üstü, sınırsız</td><td>Kütüphane yazarken (esnek)</td></tr>
<tr><td>pandas~=2.2.0</td><td>&gt;=2.2.0 ve &lt;2.3 (son basamak serbest)</td><td>Yama güncellemelerine açık</td></tr>
<tr><td>pandas&gt;=2.0,&lt;3</td><td>2.x serisi</td><td>MAJOR kırılmasından korunmak</td></tr>
<tr><td>pandas</td><td>Herhangi bir sürüm</td><td>Hızlı deneme; üretimde kaçın</td></tr>
</table></div>
<p>Sürüm metnini karşılaştırırken metin karşılaştırması yanıltır: <code>"2.10.0" &lt; "2.9.0"</code> metin olarak doğru ama sürüm olarak yanlıştır. Parçalara bölüp tam sayıya çevirmek gerekir; aşağıdaki küçük ayrıştırıcı requirements satırlarını sözlüğe döker ve sürümü doğru karşılaştırır.</p>
<pre class="py">import re

def surum_demeti(s: str) -&gt; tuple[int, ...]:
    return tuple(int(p) for p in s.split("."))

print('"2.10.0" &lt; "2.9.0" metin olarak:', "2.10.0" &lt; "2.9.0")
print("demet olarak:", surum_demeti("2.10.0") &lt; surum_demeti("2.9.0"))

requirements = """
# Anadolu Market rapor aracı
pandas==2.2.2
openpyxl&gt;=3.1
requests~=2.31.0

rich
"""
desen = re.compile(r"^([A-Za-z0-9_.-]+)\\s*(==|&gt;=|~=|&lt;=|&gt;|&lt;)?\\s*([0-9.]+)?$")
for satir in requirements.splitlines():
    satir = satir.strip()
    if not satir or satir.startswith("#"):
        continue
    ad, op, ver = desen.match(satir).groups()
    print(f"{ad:10} {op or '(her sürüm)':12} {ver or ''}")</pre>
<p>Düzenli ifade üç parça yakalar: paket adı, işleç, sürüm. Yorum ve boş satırlar atlanır. Gerçek requirements dosyalarında ek kurallar da bulunur (ortam işaretleri, <code>-r</code> ile başka dosya), ama günlük işte bu kadarı yeter.</p>
<div class="warn"><b>~= tuzağı</b><code>~=2.2</code> ile <code>~=2.2.0</code> farklıdır. İlki "&gt;=2.2, &lt;3.0" (minor serbest), ikincisi "&gt;=2.2.0, &lt;2.3" (yalnızca patch serbest). Son basamak kaç haneli yazıldıysa o basamak serbest kalır.</div>

<h2>pyproject.toml: modern standart</h2>
<p>Yeni projelerde bağımlılıklar <code>requirements.txt</code> yerine (ya da onunla birlikte) <code>pyproject.toml</code> içinde tutulur. TOML, okunur bir yapılandırma biçimidir; Python 3.11'den beri standart kütüphanedeki <code>tomllib</code> ile okunur (yalnızca okuma; yazmak için dış paket gerekir). Aynı dosya projenin adını, sürümünü ve araç ayarlarını da taşır.</p>
<pre class="py">import tomllib

pyproject = """
[project]
name = "anadolu-rapor"
version = "0.3.1"
requires-python = "&gt;=3.11"
dependencies = [
    "pandas==2.2.2",
    "openpyxl&gt;=3.1",
]

[project.optional-dependencies]
dev = ["pytest&gt;=8", "ruff"]

[tool.ruff]
line-length = 100
"""
veri = tomllib.loads(pyproject)
proje = veri["project"]
print(proje["name"], proje["version"], "| Python:", proje["requires-python"])
print("bağımlılıklar:", proje["dependencies"])
print("geliştirme:", proje["optional-dependencies"]["dev"])
print("ruff satır uzunluğu:", veri["tool"]["ruff"]["line-length"])</pre>
<p><code>optional-dependencies</code> altındaki <code>dev</code> grubu yalnızca geliştiricilerin kurduğu paketlerdir (test, biçimlendirici); <code>pip install -e ".[dev]"</code> ile kurulur. Üretim sunucusuna pytest kurmazsın.</p>
<div class="tip"><b>uv ve poetry</b>pip + venv her yerde çalışır ama yavaş ve elle yönetimlidir. <code>uv</code> (Rust ile yazılmış, çok hızlı) ve <code>poetry</code>, sanal ortamı ve kilit dosyasını (lock file) otomatik yönetir: <code>uv add pandas</code> hem pyproject'e yazar hem kurar hem <code>uv.lock</code> üretir. Kilit dosyası, pip freeze'in modern karşılığıdır: her bağımlılığın bağımlılığının bile tam sürümünü tutar.</div>

<h2>Bağımlılık çatışması</h2>
<p>Paket A, <code>requests&gt;=2.31</code> isterken paket B <code>requests&lt;2.30</code> isterse pip "ResolutionImpossible" hatası verir: iki koşulu aynı anda sağlayan sürüm yok. Çatışma (dependency conflict) genellikle eski bir paketin güncellenmemesinden doğar. Çözüm sırası: önce iki paketin daha yeni sürümlerini dene; olmuyorsa birini değiştir; son çare, çatışan işi ayrı sanal ortamda çalışan ayrı bir araca taşı. Çatışmayı erken fark etmek için bağımlılık listesini küçük tut: gerçekten kullandığın paketleri yaz, "bir gün lazım olur" diye ekleme.</p>
<pre class="py">def aralikta(ver: tuple, kosullar: list[tuple[str, tuple]]) -&gt; bool:
    for op, hedef in kosullar:
        if op == "&gt;=" and not ver &gt;= hedef: return False
        if op == "&lt;" and not ver &lt; hedef: return False
        if op == "==" and not ver == hedef: return False
    return True

# A: requests&gt;=2.31  |  B: requests&lt;2.30
kosullar = [("&gt;=", (2, 31, 0)), ("&lt;", (2, 30, 0))]
adaylar = [(2, 28, 0), (2, 29, 0), (2, 31, 0), (2, 32, 3)]
uygun = [v for v in adaylar if aralikta(v, kosullar)]
print("iki koşulu da sağlayan sürüm:", uygun or "YOK -> çatışma")</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Tekrarlanabilir ortam: kurumsal pratik</h3>
<p>Kurumsal projelerde iki dosya birlikte yaşar: <code>pyproject.toml</code> geniş aralıklarla "ne istiyoruz"u söyler (<code>pandas&gt;=2.2,&lt;3</code>), kilit dosyası (<code>uv.lock</code>, <code>poetry.lock</code> ya da <code>pip freeze</code> çıktısı) "bugün tam olarak ne kuruldu"yu. Geliştirici esnek aralıkla çalışır, sunucu ve CI kilit dosyasıyla kurar; böylece "testler geçti ama üretimde patladı" sürprizi kalkar. Kilit dosyasını Git'e koyarsın; <code>.venv</code>'i koymazsın.</p>
<p>Üç alışkanlık daha: Birincisi, <code>requires-python</code> alanını yaz; ekip üyeleri 3.9 ile 3.12 arasında dağılmışsa <code>match</code> gibi yeni sözdizimi bir makinede çalışıp diğerinde çalışmaz. İkincisi, bağımlılıkları düzenli olarak güncelle ama tek tek: hepsini aynı anda yükseltirsen kırılan testin hangi paketten kaynaklandığını bulamazsın. Üçüncüsü, güvenlik taraması: <code>pip audit</code> (ya da uv/poetry'nin eşdeğeri) bilinen açıklı sürümleri listeler; Ilgaz Bank gibi düzenlemeye tabi kurumlarda bu tarama CI'da zorunlu adımdır.</p>
</section>
`,
  ex: [
    { t: 'mc', q: 'requirements.txt içinde <code>pandas~=2.2.0</code> yazıyor. Hangi sürümler kabul edilir?',
      o: ['Yalnızca 2.2.0', '2.2.0 ve üstü, 3.0 hariç', '2.2.0 ve üstü, 2.3.0 hariç', 'Yalnızca 2.x.0 biçimindekiler'],
      a: 2,
      why: '~= "uyumlu sürüm" işlecidir: yazılan son basamak serbest bırakılır. ~=2.2.0 için bu, >=2.2.0 ve <2.3 demektir; yama güncellemelerine açık, minor değişikliğe kapalı.' },

    { t: 'code', id: 'sanal-ortam-pip-1',
      q: '<p><code>requirements_ayristir(metin)</code> fonksiyonunu yaz. <code>metin</code> bir requirements.txt içeriğidir. Boş satırları ve <code>#</code> ile başlayan yorum satırlarını atla. Her paket satırı için <code>(ad, islec, surum)</code> demeti üret; işleç ve sürüm yoksa ikisi de <code>None</code> olsun. Satır başı/sonu boşlukları kırp. Desteklenecek işleçler: <code>==</code>, <code>&gt;=</code>, <code>&lt;=</code>, <code>~=</code>, <code>&gt;</code>, <code>&lt;</code>. Liste döndür.</p>',
      start: 'import re\n\ndef requirements_ayristir(metin):\n    pass\n',
      sol: 'import re\n\nDESEN = re.compile(r"^([A-Za-z0-9_.\\-]+)\\s*(==|>=|<=|~=|>|<)?\\s*([0-9][0-9A-Za-z.]*)?$")\n\ndef requirements_ayristir(metin):\n    sonuc = []\n    for satir in metin.splitlines():\n        satir = satir.strip()\n        if not satir or satir.startswith("#"):\n            continue\n        m = DESEN.match(satir)\n        ad, op, ver = m.groups()\n        sonuc.append((ad, op, ver))\n    return sonuc\n',
      tests: 'metin = "# rapor araci\\npandas==2.2.2\\n\\nopenpyxl>=3.1\\n  requests ~= 2.31.0  \\nrich\\n# son\\n"\nr = requirements_ayristir(metin)\nassert isinstance(r, list), "Liste dönmeli"\nassert len(r) == 4, "4 paket satırı var (yorum ve boş satırlar atlanmalı)"\nassert r[0] == ("pandas", "==", "2.2.2"), "pandas==2.2.2 -> (\'pandas\', \'==\', \'2.2.2\')"\nassert r[1] == ("openpyxl", ">=", "3.1"), "openpyxl>=3.1 doğru ayrışmalı"\nassert r[2] == ("requests", "~=", "2.31.0"), "Boşluklu satır kırpılıp ~= tanınmalı"\nassert r[3] == ("rich", None, None), "Sürümsüz paket (ad, None, None) olmalı"\nassert requirements_ayristir("") == [], "Boş metinde boş liste"\n',
      hints: ['splitlines ile dön, strip et, boş ve # satırları continue.', 'Düzenli ifade: ad, isteğe bağlı işleç, isteğe bağlı sürüm; groups() üç değer verir.'],
      why: 'Düzenli ifadede işleç ve sürüm grupları isteğe bağlı (?) olduğu için eksik olduklarında None döner; alternatifler uzun işleçlerden (==, >=) kısa olanlara (>) sıralanır ki >= önce denensin.' },

    { t: 'code', id: 'sanal-ortam-pip-2',
      q: '<p><code>surum_karsilastir(a, b)</code> fonksiyonunu yaz. <code>a</code> ve <code>b</code> <code>"2.10.0"</code> gibi sürüm metinleridir. Noktayla bölüp her parçayı tam sayıya çevir; eksik parçaları 0 say (<code>"2.2"</code> ile <code>"2.2.0"</code> eşit). <code>a &lt; b</code> ise <code>-1</code>, eşitse <code>0</code>, büyükse <code>1</code> döndür.</p>',
      start: 'def surum_karsilastir(a, b):\n    pass\n',
      sol: 'def surum_karsilastir(a, b):\n    pa = [int(p) for p in a.split(".")]\n    pb = [int(p) for p in b.split(".")]\n    n = max(len(pa), len(pb))\n    pa += [0] * (n - len(pa))\n    pb += [0] * (n - len(pb))\n    if pa < pb:\n        return -1\n    if pa > pb:\n        return 1\n    return 0\n',
      tests: 'assert surum_karsilastir("2.10.0", "2.9.0") == 1, "2.10.0 > 2.9.0 olmalı (metin karşılaştırması yanıltır)"\nassert surum_karsilastir("2.9.0", "2.10.0") == -1, "2.9.0 < 2.10.0"\nassert surum_karsilastir("2.2", "2.2.0") == 0, "Eksik parça 0 sayılmalı"\nassert surum_karsilastir("3.0.0", "2.99.99") == 1, "MAJOR öncelikli"\nassert surum_karsilastir("1.0.1", "1.0.1") == 0, "Eşit sürüm 0"\nassert surum_karsilastir("1.0", "1.0.5") == -1, "1.0 < 1.0.5"\n',
      hints: ['[int(p) for p in a.split(".")] ile listeye çevir.', 'Kısa listeyi 0 ile doldur; sonra liste karşılaştırması soldan sağa çalışır.'],
      why: 'Tam sayı listeleri sözlük sırasıyla karşılaştırılır: önce MAJOR, eşitse MINOR, eşitse PATCH. Metin karşılaştırmasında "1" < "9" olduğu için 10, 9\'dan küçük görünürdü.' },

    { t: 'code', id: 'sanal-ortam-pip-3',
      q: '<p><code>bagimliliklar(toml_metni, grup=None)</code> fonksiyonunu yaz. <code>tomllib.loads</code> ile pyproject içeriğini oku. <code>grup</code> None ise <code>[project].dependencies</code> listesini, bir grup adı verilmişse <code>[project.optional-dependencies]</code> altındaki o grubun listesini döndür. Grup yoksa boş liste döndür.</p>',
      start: 'import tomllib\n\ndef bagimliliklar(toml_metni, grup=None):\n    pass\n',
      sol: 'import tomllib\n\ndef bagimliliklar(toml_metni, grup=None):\n    proje = tomllib.loads(toml_metni).get("project", {})\n    if grup is None:\n        return list(proje.get("dependencies", []))\n    return list(proje.get("optional-dependencies", {}).get(grup, []))\n',
      tests: 'py = \'[project]\\nname = "anadolu-rapor"\\nversion = "0.3.1"\\ndependencies = ["pandas==2.2.2", "openpyxl>=3.1"]\\n\\n[project.optional-dependencies]\\ndev = ["pytest>=8", "ruff"]\\n\\n[tool.ruff]\\nline-length = 100\\n\'\nassert bagimliliklar(py) == ["pandas==2.2.2", "openpyxl>=3.1"], "Ana bağımlılıklar dönmeli"\nassert bagimliliklar(py, "dev") == ["pytest>=8", "ruff"], "dev grubu dönmeli"\nassert bagimliliklar(py, "docs") == [], "Olmayan grupta boş liste"\nassert bagimliliklar(\'[project]\\nname = "x"\\n\') == [], "dependencies yoksa boş liste"\n',
      hints: ['tomllib.loads(metin)["project"]', 'optional-dependencies bir sözlüktür; .get(grup, []) ile güvenle al.'],
      why: 'tomllib TOML\'ı iç içe sözlüklere çevirir; get zinciri eksik alanlarda KeyError yerine boş liste vermeyi sağlar.' },

    { t: 'mc', q: 'Ekip arkadaşın projeyi klonladı, <code>pip install -r requirements.txt</code> çalıştırmadan betiği başlattı ve ModuleNotFoundError aldı. Ama senin repoda <code>.venv</code> klasörü de vardı. Doğru yaklaşım hangisi?',
      o: ['.venv klasörünü Git\'e ekleyip paylaşmak', '.venv\'i .gitignore\'a yazıp requirements.txt ile kurulum yaptırmak', 'Paketleri global olarak kurmasını söylemek', 'Betiğin başına pip install satırı eklemek'],
      a: 1,
      why: 'Sanal ortam makineye özgüdür (mutlak yollar, işletim sistemi); paylaşılmaz, bağımlılık listesinden yeniden kurulur. Global kurulum projeler arası çatışma yaratır; betik içinden pip çağırmak ise kırılgan ve güvensizdir.' },

    { t: 'code', id: 'sanal-ortam-pip-4',
      q: '<p><code>kosulu_saglar(surum, kosul)</code> fonksiyonunu yaz. <code>surum</code> <code>"2.2.5"</code> gibi bir metin, <code>kosul</code> ise <code>"&gt;=2.2"</code>, <code>"==2.2.5"</code>, <code>"&lt;3"</code> ya da <code>"~=2.2.0"</code> gibi tek koşuldur. Sürümleri tam sayı demetine çevirip (eksik parçalar 0) koşulu değerlendir. <code>~=X.Y.Z</code>: <code>&gt;=X.Y.Z</code> ve <code>&lt;X.(Y+1)</code>; <code>~=X.Y</code>: <code>&gt;=X.Y</code> ve <code>&lt;(X+1)</code>. Bool döndür.</p>',
      start: 'import re\n\ndef _demet(s, n=3):\n    p = [int(x) for x in s.split(".")]\n    return tuple(p + [0] * (n - len(p)))\n\ndef kosulu_saglar(surum, kosul):\n    pass\n',
      sol: 'import re\n\ndef _demet(s, n=3):\n    p = [int(x) for x in s.split(".")]\n    return tuple(p + [0] * (n - len(p)))\n\ndef kosulu_saglar(surum, kosul):\n    m = re.match(r"^(==|>=|<=|~=|>|<)\\s*([0-9.]+)$", kosul.strip())\n    op, hedef_metin = m.groups()\n    v = _demet(surum)\n    hedef = _demet(hedef_metin)\n    if op == "==":\n        return v == hedef\n    if op == ">=":\n        return v >= hedef\n    if op == "<=":\n        return v <= hedef\n    if op == ">":\n        return v > hedef\n    if op == "<":\n        return v < hedef\n    # ~= : son yazılan basamak serbest\n    parcalar = [int(x) for x in hedef_metin.split(".")]\n    ust = parcalar[:-1]\n    ust[-1] += 1\n    ust_demet = _demet(".".join(str(x) for x in ust))\n    return hedef <= v < ust_demet\n',
      tests: 'assert kosulu_saglar("2.2.5", ">=2.2") is True, "2.2.5 >= 2.2"\nassert kosulu_saglar("2.1.9", ">=2.2") is False, "2.1.9 < 2.2"\nassert kosulu_saglar("2.2.5", "==2.2.5") is True, "tam eşleşme"\nassert kosulu_saglar("2.10.0", "<3") is True, "2.10.0 < 3"\nassert kosulu_saglar("3.0.0", "<3") is False, "3.0.0 < 3 değil"\nassert kosulu_saglar("2.2.9", "~=2.2.0") is True, "~=2.2.0: 2.2.9 uygun"\nassert kosulu_saglar("2.3.0", "~=2.2.0") is False, "~=2.2.0: 2.3.0 uygun değil"\nassert kosulu_saglar("2.9.0", "~=2.2") is True, "~=2.2: 2.9.0 uygun (minor serbest)"\nassert kosulu_saglar("3.0.0", "~=2.2") is False, "~=2.2: 3.0.0 uygun değil"\n',
      hints: ['Önce düzenli ifadeyle işleç ve sürümü ayır; _demet ile demete çevir.', '~= için üst sınır: yazılan sürümün son parçasını at, bir öncekini 1 artır.'],
      why: 'Demet karşılaştırması sürüm sırasını doğru verir. ~= işlecinin üst sınırı, kaç basamak yazıldığına bağlıdır; bu yüzden sınır orijinal metinden hesaplanır, doldurulmuş demetten değil.' },

    { t: 'mc', q: '<code>pip freeze &gt; requirements.txt</code> ile üretilen dosyanın asıl amacı nedir?',
      o: ['Projenin istediği en düşük sürümleri belgelemek', 'O anda kurulu tam sürümlerin fotoğrafını alıp aynısını başka makinede kurmak', 'Kullanılmayan paketleri temizlemek', 'pyproject.toml dosyasını otomatik üretmek'],
      a: 1,
      why: 'freeze, kurulu her paketi paket==sürüm biçiminde yazar; bu, dağıtımda birebir aynı ortamı yeniden kurmak içindir. En düşük sürümler ve esnek aralıklar pyproject.toml\'un işidir.' }
  ],
  faq: [
    { q: 'conda ile venv arasındaki fark ne?', a: 'conda hem Python hem Python dışı (C kütüphaneleri, R) paketleri yönetir ve veri bilimi ekosisteminde yaygındır. venv yalnızca Python paketleri içindir ve standart kütüphaneyle gelir. Şirketin hangisini kullandığına uy; mantık aynıdır: projeye özel izole ortam.' },
    { q: 'requirements.txt mi pyproject.toml mu?', a: 'Yeni projede pyproject.toml ana kaynak; requirements.txt (ya da kilit dosyası) dağıtım için ondan üretilir. Eski projelerde yalnızca requirements.txt görürsün; ikisini de okuyabilmen yeter.' },
    { q: 'Paketi yanlışlıkla global kurdum, ne olur?', a: 'Genelde zarar yok ama projeler arası sürüm çatışması riski doğar. pip uninstall ile kaldır, sanal ortamı etkinleştirip yeniden kur. Terminalde (.venv) ön ekini görmeden pip install yazmamayı alışkanlık edin.' },
    { q: 'uv kullanıyorsam pip öğrenmeme gerek var mı?', a: 'Var: uv, pip komutlarını da destekler (uv pip install) ve şirket sunucularının çoğunda hâlâ yalnızca pip bulunur. uv/poetry, pip bilgisinin üstüne gelen kolaylıktır, yerine geçen değil.' }
  ],
  mistakes: [
    { bad: '"2.10.0" > "2.9.0"  # False', good: 'tuple(map(int, "2.10.0".split("."))) > tuple(map(int, "2.9.0".split(".")))  # True', why: 'Metin karşılaştırması karakter karakter gider: "1" < "9" olduğu için 10, 9\'dan küçük görünür. Sürümler tam sayı parçalarıyla karşılaştırılır.' },
    { bad: 'git add .venv/', good: 'echo ".venv/" >> .gitignore', why: 'Sanal ortam makineye özgü ve büyüktür; depoya girmez. Paylaşılan şey bağımlılık listesidir.' },
    { bad: 'pandas\nrequests\n# requirements.txt (sürümsüz)', good: 'pandas==2.2.2\nrequests~=2.31.0', why: 'Sürümsüz liste her kurulumda farklı sürüm getirir; "dün çalışıyordu" sorununa yol açar. Dağıtımda sürüm sabitle.' },
    { bad: 'pip install pandas  # (.venv) etkin değilken', good: 'source .venv/bin/activate\npip install pandas', why: 'Ortam etkin değilse paket global kuruluma gider ve proje ortamında bulunamaz.' }
  ]
},
/* ───────────────────────── 5. git-proje-yapisi ───────────────────────── */
{
  id: 'git-proje-yapisi',
  lv: 'orta',
  mod: 'Kalite ve Proje',
  min: 35,
  title: 'Git ve proje yapısı',
  sum: 'Temel Git akışını (init, add, commit, branch, merge, pull request) kavrar, .gitignore kurallarını fnmatch ile çözümler, src yerleşimli proje ağacı kurar, README yazar, config ve .env ile gizli bilgiyi koddan ayırır ve kod inceleme kültürünü tanırsın.',
  goals: [
    'init, add, commit, branch, merge ve pull request adımlarıyla temel Git akışını anlatabilirim.',
    '.gitignore kurallarını okuyup bir dosya yolunun kurala uyup uymadığını fnmatch ile belirleyebilirim.',
    'src yerleşimli standart bir Python proje ağacını kurabilir ve doğrulayabilirim.',
    'Gizli bilgiyi .env ve os.environ ile koddan ayırabilir, eksik değişkende anlamlı hata verebilirim.',
    'Kod incelemesinde (code review) neye bakılacağını ve nasıl yorum yazılacağını açıklayabilirim.'
  ],
  body: `
<h2>Neden Git?</h2>
<p>Ilgaz Bank'ın risk ekibinde üç analist aynı rapor betiğini geliştiriyor. "rapor_v2_son_FINAL.py" dosyaları e-postayla dolaşıyor, kimin hangi satırı değiştirdiği belli değil, dün çalışan sürüm kayboldu. Git, sürüm kontrol sistemi (version control system) olarak bu kaosu bitirir: her değişiklik kim, ne zaman, neden bilgisiyle kaydedilir; herkes aynı anda ayrı dallarda çalışır; istenirse herhangi bir güne geri dönülür. Git öğrenmek Python'dan bağımsız bir beceri ama Python geliştiricisi için şart: işe alım testlerinde ilk sorulan şey GitHub profilindir.</p>
<div class="note"><b>Bu derste Git komutları gösterilir</b>Tarayıcıda Git çalıştıramayız; komutları kendi bilgisayarında dene. Kod alıştırmaları Git ve proje yapısının Python tarafını işler: .gitignore kurallarını eşleştirmek, proje ağacını doğrulamak, ortam değişkeni okumak.</div>

<h2>Temel akış: init, add, commit</h2>
<p>Git üç bölgeyle çalışır: çalışma dizini (dosyaların), hazırlık alanı (staging, "sonraki kayda girecekler") ve depo (repository, kalıcı geçmiş). Günlük döngü şudur:</p>
<div class="steps-list"><ol>
<li><code>git init</code> — klasörü depo yapar (bir kez).</li>
<li>Dosyaları düzenle; <code>git status</code> ile neyin değiştiğini gör.</li>
<li><code>git add src/rapor.py</code> — değişikliği hazırlık alanına koy (<code>git add .</code> hepsini).</li>
<li><code>git commit -m "Şehir raporuna KDV sütunu eklendi"</code> — anlamlı bir mesajla kaydet.</li>
<li><code>git log --oneline</code> — geçmişi gör.</li>
</ol></div>
<p>İyi commit mesajı emir kipinde, kısa ve "ne, neden" sorusuna yanıt verir: "KDV hesabını Decimal'e taşı (float yuvarlama hatası)". "düzeltmeler", "wip", "asdf" gibi mesajlar üç ay sonra hiçbir şey anlatmaz.</p>

<h2>Dal, birleştirme ve pull request</h2>
<p>Dal (branch), ana koda dokunmadan deneme yapmanı sağlar. <code>git switch -c sehir-raporu</code> yeni dal açar; orada commit'lersin; iş bitince <code>git switch main</code> ve <code>git merge sehir-raporu</code> ile birleştirirsin. Ekip çalışmasında birleştirme doğrudan değil, <b>pull request</b> (PR; GitLab'da merge request) üzerinden yapılır: dalını sunucuya <code>git push</code> ile gönderirsin, PR açarsın, ekip arkadaşın inceler, onaylar, sonra main'e birleşir. Aynı satırı iki kişi farklı değiştirdiyse çakışma (conflict) çıkar; Git dosyaya <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code> ve <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> işaretleri koyar, sen doğru halini seçip yeniden commit'lersin.</p>
<div class="tbl-wrap"><table>
<tr><th>Komut</th><th>Ne yapar</th></tr>
<tr><td>git clone URL</td><td>Uzak depoyu indirir</td></tr>
<tr><td>git switch -c dal-adi</td><td>Yeni dal açıp ona geçer</td></tr>
<tr><td>git pull</td><td>Uzaktaki değişiklikleri alır</td></tr>
<tr><td>git push -u origin dal-adi</td><td>Dalı uzak depoya gönderir</td></tr>
<tr><td>git merge dal-adi</td><td>Dalı bulunduğun dala birleştirir</td></tr>
<tr><td>git diff</td><td>Kaydedilmemiş değişiklikleri gösterir</td></tr>
<tr><td>git restore dosya</td><td>Dosyadaki kaydedilmemiş değişikliği geri alır</td></tr>
<tr><td>git stash</td><td>Yarım işi geçici rafa kaldırır</td></tr>
</table></div>

<h2>.gitignore: neyi depoya koymazsın?</h2>
<p>Sanal ortam, önbellek, gizli anahtar ve büyük veri dosyaları depoya girmez. <code>.gitignore</code> dosyası satır satır desen (pattern) içerir; Git o desenlere uyan dosyaları görmezden gelir. Desenler kabuk joker karakterleriyle yazılır: <code>*</code> herhangi karakter dizisi, <code>?</code> tek karakter, sonda <code>/</code> klasör, başta <code>!</code> istisna. Python tarafında aynı jokerleri <code>fnmatch</code> modülü çözer; CI betiklerinde "bu dosya ignore'da mı" kontrolü böyle yazılır.</p>
<pre class="py">from fnmatch import fnmatch

gitignore = """
# Python
__pycache__/
*.pyc
.venv/
# Gizli bilgi
.env
# Veri ve çıktı
data/*.csv
*.log
!onemli.log
"""

def kurallar(metin: str) -&gt; list[str]:
    return [s.strip() for s in metin.splitlines() if s.strip() and not s.strip().startswith("#")]

def yok_sayilir_mi(yol: str, kurallar: list[str]) -&gt; bool:
    sonuc = False
    for k in kurallar:
        istisna = k.startswith("!")
        desen = k[1:] if istisna else k
        if desen.endswith("/"):
            uydu = yol.startswith(desen) or ("/" + desen) in ("/" + yol)
        else:
            uydu = fnmatch(yol, desen) or fnmatch(yol.rsplit("/", 1)[-1], desen)
        if uydu:
            sonuc = not istisna
    return sonuc

k = kurallar(gitignore)
for yol in ["src/rapor.py", "src/__pycache__/rapor.cpython-312.pyc", ".env", "data/satis.csv", "data/README.md", "hata.log", "onemli.log", ".venv/bin/python"]:
    print(f"{yol:40} {'YOK SAY' if yok_sayilir_mi(yol, k) else 'izle'}")</pre>
<p>Kurallar sırayla uygulanır ve son eşleşen kazanır; bu yüzden <code>!onemli.log</code> satırı <code>*.log</code>'dan sonra gelince istisna olur. Gerçek Git'in eşleştirme kuralları biraz daha zengindir (<code>**</code>, kök bağıl yollar) ama bu basit model günlük ihtiyacın yüzde doksanını karşılar.</p>
<div class="warn"><b>Bir kez push edilen gizli bilgi geri alınamaz</b>.env dosyasını yanlışlıkla commit'leyip push ettiysen silmek yetmez: geçmişte kalır. Anahtarı derhal iptal edip yenisini üret. .env satırını .gitignore'a <b>ilk commit'ten önce</b> yaz.</div>

<h2>Proje yapısı: src yerleşimi</h2>
<p>Küçük bir betik tek dosya olabilir; ama test, bağımlılık ve ekip devreye girince standart bir ağaç gerekir. Python topluluğunun önerdiği <b>src yerleşimi</b> (src layout), paketi <code>src/</code> altına koyar; böylece testler yanlışlıkla kurulmamış yerel kodu değil, kurulmuş paketi test eder.</p>
<pre class="py">import tempfile
from pathlib import Path

AGAC = {
    "README.md": "# Anadolu Rapor\\n\\nŞehir bazlı satış raporu aracı.\\n\\n## Kurulum\\n\\n    pip install -e .\\n",
    ".gitignore": ".venv/\\n__pycache__/\\n.env\\n",
    "pyproject.toml": '[project]\\nname = "anadolu-rapor"\\nversion = "0.1.0"\\n',
    ".env.example": "DB_URL=sqlite:///market.db\\nAPI_KEY=buraya-anahtar\\n",
    "src/anadolu_rapor/__init__.py": "",
    "src/anadolu_rapor/rapor.py": "def sehir_ozeti(satirlar):\\n    return {}\\n",
    "tests/test_rapor.py": "import unittest\\n",
}

with tempfile.TemporaryDirectory() as d:
    kok = Path(d) / "anadolu-rapor"
    for yol, icerik in AGAC.items():
        hedef = kok / yol
        hedef.parent.mkdir(parents=True, exist_ok=True)
        hedef.write_text(icerik, encoding="utf-8")
    for p in sorted(kok.rglob("*")):
        derinlik = len(p.relative_to(kok).parts) - 1
        print("  " * derinlik + ("+ " if p.is_dir() else "- ") + p.name)
    print("README ilk satır:", (kok / "README.md").read_text(encoding="utf-8").splitlines()[0])</pre>
<p>README (benioku) dosyası projenin kapısıdır: ne yapar, nasıl kurulur, nasıl çalıştırılır, nasıl test edilir. Dört başlık yeterlidir. <code>.env.example</code> ise gerçek değerler olmadan hangi ortam değişkenlerinin gerektiğini gösterir; depoya girer, <code>.env</code> girmez.</p>

<h2>Config ve .env: gizli bilgi koddan ayrı</h2>
<p>Veritabanı parolası, API anahtarı, e-posta şifresi kodda yazmaz. Bunlar ortam değişkeni (environment variable) olarak işletim sisteminden okunur: <code>os.environ</code> bir sözlük gibi davranır. Geliştirme makinesinde değişkenleri <code>.env</code> dosyasından yüklersin (python-dotenv paketi ya da birkaç satırlık kendi okuyucun); sunucuda ise dağıtım sistemi onları doğrudan tanımlar. Kod iki ortamda da aynıdır.</p>
<pre class="py">import os

ENV_ORNEK = """
# Anadolu Market yerel ayarlar
DB_URL=sqlite:///market.db
API_KEY="abc-123"
DEBUG=true
"""

def env_yukle(metin: str) -&gt; dict[str, str]:
    degerler = {}
    for satir in metin.splitlines():
        satir = satir.strip()
        if not satir or satir.startswith("#") or "=" not in satir:
            continue
        ad, deger = satir.split("=", 1)
        degerler[ad.strip()] = deger.strip().strip('"').strip("'")
    return degerler

for ad, deger in env_yukle(ENV_ORNEK).items():
    os.environ.setdefault(ad, deger)   # gerçek ortamda zaten varsa ezme

def ayar(ad: str, varsayilan: str | None = None) -&gt; str:
    deger = os.environ.get(ad, varsayilan)
    if deger is None:
        raise RuntimeError(f"Eksik ortam değişkeni: {ad} (.env dosyasını kontrol et)")
    return deger

print("DB_URL :", ayar("DB_URL"))
print("API_KEY:", ayar("API_KEY")[:3] + "***")
print("DEBUG  :", ayar("DEBUG").lower() == "true")
print("PORT   :", ayar("PORT", "8000"))
try:
    ayar("SMTP_SIFRE")
except RuntimeError as e:
    print("hata:", e)</pre>
<p><code>setdefault</code> önemli: sunucuda tanımlı gerçek değer varsa .env'deki değeri yazmaz. Eksik değişkende programın ilk saniyede anlaşılır bir mesajla durması, iki saat sonra "None" hatasıyla çökmesinden iyidir.</p>
<div class="tip"><b>Anahtarı loglama</b>Hata ayıklarken <code>print(os.environ)</code> yazmak tüm gizli bilgileri log dosyasına döker. Değeri göstermen gerekiyorsa ilk üç karakter artı yıldız yeter.</div>

<h2>Kod inceleme kültürü</h2>
<p>Pull request'in asıl değeri kodun ikinci bir göz tarafından okunmasıdır. İnceleyen (reviewer) şunlara bakar: iş kuralı doğru mu, test var mı, isimler anlaşılır mı, gizli bilgi sızmış mı, aynı şey daha basit yazılabilir mi? Yorum yazarken kişiyi değil kodu konuş: "Bu döngü O(n²), sözlükle tek geçişte olur" iyi; "Bunu nasıl böyle yazarsın" kötü. Yazar olarak ise PR'ı küçük tut (bir PR bir iş), açıklamaya "neden"i yaz ve yorumları savunma değil öğrenme fırsatı olarak gör. İncelemeyi bekletmemek de nezakettir: küçük PR aynı gün incelenir.</p>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Dal stratejisi ve otomasyon</h3>
<p>Ekipler büyüdükçe dal düzeni kural haline gelir. En yaygın model "GitHub flow": <code>main</code> her zaman çalışır durumdadır; her iş kısa ömürlü bir dalda yapılır (<code>feature/sehir-raporu</code>, <code>fix/kdv-yuvarlama</code>); PR ile birleşir; birleşince dal silinir. Daha katı kurumlarda (bankacılık gibi) <code>develop</code> ve <code>release</code> dalları da olur. Hangi modeli kullanırsan kullan, kural aynı: main'e doğrudan push yok, her değişiklik incelenir.</p>
<p>Otomasyon bunu destekler. Pre-commit kancaları (hook) commit'ten önce biçimlendiriciyi (ruff, black) ve basit kontrolleri çalıştırır; böylece inceleme, girinti ve boşluk tartışmasına harcanmaz. CI (GitHub Actions, GitLab CI) her PR'da testleri koşar ve kırmızıysa birleştirmeyi engeller. Commit mesajlarında "Conventional Commits" düzeni (<code>feat:</code>, <code>fix:</code>, <code>docs:</code>) değişiklik günlüğünü otomatik üretmeyi sağlar. İleri seviyedeki "Kalite ve CI" dersinde bu zinciri uçtan uca kuracaksın; bugün için hedefin küçük: anlamlı commit, temiz .gitignore, gizli bilgi .env'de.</p>
</section>
`,
  ex: [{ t: 'mc', q: 'Yeni bir özellik üzerinde çalışırken ana kodu bozmamak için ilk yapılacak şey hangisidir?',
      o: ['git commit -m "wip"', 'git switch -c ozellik-adi', 'git stash', 'git push origin main'],
      a: 1,
      why: 'Yeni dal açmak (switch -c) işi ana koddan izole eder. stash yarım işi geçici kaldırır, wip commit geçmişi kirletir, main\'e push ise tam da kaçınılması gereken şeydir.' },
    { t: 'mc', q: 'Bir ekip arkadaşın yanlışlıkla <code>.env</code> dosyasını commit edip push etti ve sonra sildi. Şimdi ne yapılmalı?',
      o: ['Hiçbir şey; dosya silindiği için sorun kalmadı', '.env\'i .gitignore\'a eklemek yeterli', 'İçindeki anahtarları derhal iptal edip yenilemek ve .gitignore\'a eklemek', 'Depoyu silip yeniden oluşturmak'],
      a: 2,
      why: 'Push edilen içerik Git geçmişinde ve uzak sunucuda kalır; silmek geçmişi temizlemez. Sızan anahtar artık sızmış sayılır ve iptal edilir. .gitignore tekrarını önler ama olanı geri almaz.' },
    { t: 'mc', q: 'Kod incelemesinde (code review) aşağıdaki yorumlardan hangisi iyi örnektir?',
      o: ['Bu nasıl çalışıyor anlamadım, baştan yaz.', 'Burada iç içe döngü O(n²); şehir sözlüğüyle tek geçişte olur, ister misin örnek yazayım?', 'Bence olmuş, onaylıyorum.', 'Girintiler 2 boşluk olmalıydı.'],
      a: 1,
      why: 'İyi yorum kodu konuşur, somut sorun ve çözüm önerir, yardım teklif eder. "Baştan yaz" kişiselleştirir ve yol göstermez; girinti tartışması biçimlendiriciye bırakılır; içeriksiz onay inceleme sayılmaz.' },
    { t: 'mc', q: 'src yerleşiminin (src layout) temel avantajı nedir?',
      o: ['Daha az klasör gerektirir', 'Testler kurulu paketi test eder, yanlışlıkla yerel kodu değil', 'pip install gerekmez', 'Git çakışmalarını azaltır'],
      a: 1,
      why: 'Paket src/ altında olunca proje kökünden çalışan testler onu doğrudan içe aktaramaz; pip install -e . ile kurulu paket kullanılır. Böylece "bende çalışıyor, kurulumda bozuk" hataları yakalanır.' }],
  faq: [
    { q: 'Git ile GitHub aynı şey mi?', a: 'Hayır. Git bilgisayarında çalışan sürüm kontrol aracıdır; GitHub (ve GitLab, Bitbucket) Git depolarını barındıran, pull request ve inceleme arayüzü sunan web hizmetidir. Git olmadan GitHub olmaz, ama GitHub olmadan Git olur.' },
    { q: 'Ne sıklıkla commit yapmalıyım?', a: 'Çalışan her mantıksal adımda: bir fonksiyon, bir test, bir düzeltme. Günde birkaç küçük commit, haftada bir dev commit\'ten iyidir; geri almak ve incelemek kolaylaşır.' },
    { q: '.env dosyasını Python nasıl okur?', a: 'Standart kütüphanede hazır okuyucu yok; derste yazdığımız birkaç satır ya da python-dotenv paketi (load_dotenv) kullanılır. Sunucuda .env yerine dağıtım aracı değişkenleri doğrudan tanımlar; kod os.environ üzerinden aynı şekilde okur.' },
    { q: 'Tek kişilik projede dal ve PR gerekli mi?', a: 'Zorunlu değil ama alışkanlık değerli: dal açıp birleştirmek main\'i her zaman çalışır tutar ve iş başvurusunda GitHub geçmişin düzenli görünür.' }
  ],
  mistakes: [
    { bad: 'API_KEY = "sk-abc123..."  # kodun içinde', good: 'API_KEY = os.environ["API_KEY"]', why: 'Kodda yazılan gizli bilgi depoya girer ve herkesin eline geçer; ortam değişkeni koddan ayrı yaşar.' },
    { bad: 'git add .\ngit commit -m "düzeltmeler"', good: 'git add src/rapor.py\ngit commit -m "fix: KDV hesabını Decimal\'e taşı"', why: 'Anlamsız mesaj geçmişi işe yaramaz kılar; add . ise istemediğin dosyaları (.env, veri) da ekleyebilir.' },
    { bad: 'print(os.environ)  # hata ayıklama', good: 'print(ayar("API_KEY")[:3] + "***")', why: 'Tüm ortamı yazdırmak gizli bilgileri log dosyasına döker. Yalnızca gerekli değeri, maskeleyerek göster.' },
    { bad: '# .gitignore\n*.py', good: '# .gitignore\n__pycache__/\n*.pyc\n.venv/\n.env', why: 'Kaynak kodu yok saymak projeyi boş bırakır; yok sayılan şey türetilmiş, makineye özgü ve gizli dosyalardır.' }
  ]
},
/* ───────────────────────── 6. proje-orta ───────────────────────── */
{
  id: 'proje-orta',
  lv: 'orta',
  mod: 'Bitirme',
  min: 60,
  title: 'Orta bitirme projesi: Ilgaz Bank işlem analizi',
  sum: 'Orta seviyede öğrendiğin her şeyi tek projede birleştirirsin: dataclass ile işlem modeli, CSV ayrıştırma, kategori toplamları, çok koşullu şüpheli işlem kuralı, JSON rapor ve unittest ile doğrulama.',
  goals: [
    'dataclass ile alan tipleri belirli bir Transaction modeli kurup CSV metninden nesne listesi üretebilirim.',
    'Kategoriye göre toplamları Decimal ile hatasız hesaplayabilirim.',
    'Gece saati, yüksek tutar ve kısa sürede tekrarlayan işlem kurallarını birleştirip şüpheli işlemleri işaretleyebilirim.',
    'Analiz sonucunu JSON rapor olarak üretebilir ve JSON\'a uygun olmayan tipleri dönüştürebilirim.',
    'Projenin parçalarını unittest ile test edip bütünü tek bir akışta çalıştırabilirim.'
  ],
  body: `
<h2>Proje tanımı</h2>
<p>Ilgaz Bank'ın kart operasyon ekibi senden küçük ama gerçekçi bir araç istiyor: günlük kart işlemlerini okuyacak, kategori bazında harcamayı özetleyecek, şüpheli görünen işlemleri işaretleyecek ve sonucu JSON raporu olarak verecek. Ekip, kuralların test edilmiş olmasını şart koşuyor; çünkü yanlış pozitif bir müşterinin kartını gereksiz yere bloke eder, yanlış negatif ise dolandırıcılığı kaçırır.</p>
<p>Bu ders diğerlerinden farklı: yeni kavram öğretmez, öğrendiklerini birleştirir. Alıştırmalar birbirini tamamlayan altı parçadır; her parçada bir önceki parçanın fonksiyonu hazır gelir. Aşağıda her parçanın kuramı ve örnek çıktısı var; alıştırmalarda kendi sürümünü yazacaksın.</p>
<div class="tbl-wrap"><table>
<tr><th>Parça</th><th>Ne yapar</th><th>Kullandığın dersler</th></tr>
<tr><td>1. Model</td><td>Transaction dataclass'ı ve CSV'den okuma</td><td>dataclass-typing, json-csv, tarih-saat, decimal</td></tr>
<tr><td>2. Özet</td><td>Kategoriye göre toplam</td><td>collections, kapsamli-ifadeler</td></tr>
<tr><td>3. Kural A-B</td><td>Gece saati ve yüksek tutar</td><td>tarih-saat, fonksiyonel</td></tr>
<tr><td>4. Kural C</td><td>Aynı kartta 10 dakikada 3 işlem</td><td>iteratorler, tarih-saat, sıralama</td></tr>
<tr><td>5. Rapor</td><td>JSON çıktı, tip dönüşümü</td><td>json-csv, decimal</td></tr>
<tr><td>6. Test</td><td>unittest ile kural testleri</td><td>test-yazma</td></tr>
</table></div>

<h2>Parça 1: Veri modeli ve CSV okuma</h2>
<p>Her işlem beş alan taşır: işlem kimliği, kart numarası (maskeli), zaman, tutar, kategori. Tutar para olduğu için <code>Decimal</code>, zaman <code>datetime</code>. <code>frozen=True</code> ile işlem nesnesi değiştirilemez olur: analiz sırasında kimse bir tutarı yanlışlıkla güncelleyemez. CSV metni <code>csv.DictReader</code> ile okunur, her satır <code>Transaction</code>'a dönüştürülür.</p>
<pre class="py">import csv
import io
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal

@dataclass(frozen=True)
class Transaction:
    id: str
    kart: str
    zaman: datetime
    tutar: Decimal
    kategori: str

VERI = """id,kart,zaman,tutar,kategori
T1,****1111,2024-03-15 09:12:00,245.90,market
T2,****1111,2024-03-15 13:40:00,1200.00,elektronik
T3,****2222,2024-03-15 02:15:00,8500.00,kuyumcu
T4,****3333,2024-03-15 23:50:00,60.00,yakit
T5,****3333,2024-03-15 23:54:00,75.50,yakit
T6,****3333,2024-03-15 23:58:00,90.00,market
T7,****2222,2024-03-15 18:00:00,430.00,market
"""

def csv_oku(metin: str) -&gt; list[Transaction]:
    islemler = []
    for satir in csv.DictReader(io.StringIO(metin)):
        islemler.append(Transaction(
            id=satir["id"],
            kart=satir["kart"],
            zaman=datetime.strptime(satir["zaman"], "%Y-%m-%d %H:%M:%S"),
            tutar=Decimal(satir["tutar"]),
            kategori=satir["kategori"],
        ))
    return islemler

islemler = csv_oku(VERI)
print(len(islemler), "işlem okundu")
print(islemler[2])
print("tutar türü:", type(islemler[0].tutar).__name__, "| saat:", islemler[2].zaman.hour)</pre>
<div class="tip"><b>Dönüşüm tek yerde</b>Metinden tipe dönüşüm yalnızca csv_oku içinde yapılır. Sonraki hiçbir parça "acaba tutar string mi" diye düşünmez; bu, katmanlı tasarımın en sade halidir.</div>

<h2>Parça 2: Kategoriye göre toplam</h2>
<p>Klasik gruplama: sözlükte biriktir. <code>defaultdict(Decimal)</code> başlangıç değeri olarak <code>Decimal(0)</code> verir, böylece <code>+=</code> doğrudan çalışır. Çıktıyı toplam tutara göre azalan sıralamak raporun okunurluğunu artırır.</p>
<pre class="py">from collections import defaultdict
from decimal import Decimal

# Parça 1'deki islemler listesini yeniden kuralım (kısa sürüm)
from dataclasses import dataclass
from datetime import datetime

@dataclass(frozen=True)
class Transaction:
    id: str
    kart: str
    zaman: datetime
    tutar: Decimal
    kategori: str

islemler = [
    Transaction("T1", "****1111", datetime(2024, 3, 15, 9, 12), Decimal("245.90"), "market"),
    Transaction("T2", "****1111", datetime(2024, 3, 15, 13, 40), Decimal("1200.00"), "elektronik"),
    Transaction("T3", "****2222", datetime(2024, 3, 15, 2, 15), Decimal("8500.00"), "kuyumcu"),
    Transaction("T7", "****2222", datetime(2024, 3, 15, 18, 0), Decimal("430.00"), "market"),
]

def kategori_toplam(islemler: list[Transaction]) -&gt; dict[str, Decimal]:
    toplam: dict[str, Decimal] = defaultdict(Decimal)
    for t in islemler:
        toplam[t.kategori] += t.tutar
    return dict(sorted(toplam.items(), key=lambda kv: kv[1], reverse=True))

for kategori, tutar in kategori_toplam(islemler).items():
    print(f"{kategori:12} {tutar:&gt;10}")</pre>

<h2>Parça 3 ve 4: Şüpheli işlem kuralları</h2>
<p>Operasyon ekibinin üç kuralı var; bir işlem bunlardan <b>en az birine</b> uyarsa şüpheli sayılır ve hangi kurallara takıldığı raporda görünür:</p>
<ul>
<li><b>gece:</b> işlem saati 23:00 ve sonrası ya da 06:00'dan önce.</li>
<li><b>yuksek_tutar:</b> tutar 5000 TL ve üzeri.</li>
<li><b>sik_islem:</b> aynı kartta, herhangi bir 10 dakikalık pencerede 3 ya da daha fazla işlem; pencereye giren her işlem işaretlenir.</li>
</ul>
<p>İlk iki kural tek işleme bakar; birer satırlık saf fonksiyonlardır. Üçüncü kural işlemler arası ilişkiye bakar: karta göre grupla, zamana göre sırala, her işlem için "bu işlemle başlayan 10 dakikalık pencerede kaç işlem var?" diye say; 3 ve üstüyse penceredeki tüm işlemleri işaretle.</p>
<pre class="py">from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timedelta
from decimal import Decimal

@dataclass(frozen=True)
class Transaction:
    id: str
    kart: str
    zaman: datetime
    tutar: Decimal
    kategori: str

islemler = [
    Transaction("T3", "****2222", datetime(2024, 3, 15, 2, 15), Decimal("8500.00"), "kuyumcu"),
    Transaction("T4", "****3333", datetime(2024, 3, 15, 23, 50), Decimal("60.00"), "yakit"),
    Transaction("T5", "****3333", datetime(2024, 3, 15, 23, 54), Decimal("75.50"), "yakit"),
    Transaction("T6", "****3333", datetime(2024, 3, 15, 23, 58), Decimal("90.00"), "market"),
    Transaction("T7", "****2222", datetime(2024, 3, 15, 18, 0), Decimal("430.00"), "market"),
]

def gece_mi(t: Transaction) -&gt; bool:
    return t.zaman.hour &gt;= 23 or t.zaman.hour &lt; 6

def yuksek_mi(t: Transaction, esik: Decimal = Decimal("5000")) -&gt; bool:
    return t.tutar &gt;= esik

def sik_islem_idleri(islemler: list[Transaction], pencere_dk: int = 10, esik: int = 3) -&gt; set[str]:
    karta_gore: dict[str, list[Transaction]] = defaultdict(list)
    for t in islemler:
        karta_gore[t.kart].append(t)
    supheli: set[str] = set()
    pencere = timedelta(minutes=pencere_dk)
    for grup in karta_gore.values():
        grup.sort(key=lambda t: t.zaman)
        for i, baslangic in enumerate(grup):
            icindekiler = [t for t in grup[i:] if t.zaman - baslangic.zaman &lt;= pencere]
            if len(icindekiler) &gt;= esik:
                supheli.update(t.id for t in icindekiler)
    return supheli

def supheli_isaretle(islemler: list[Transaction]) -&gt; dict[str, list[str]]:
    sik = sik_islem_idleri(islemler)
    sonuc = {}
    for t in islemler:
        nedenler = []
        if gece_mi(t): nedenler.append("gece")
        if yuksek_mi(t): nedenler.append("yuksek_tutar")
        if t.id in sik: nedenler.append("sik_islem")
        if nedenler:
            sonuc[t.id] = nedenler
    return sonuc

for tid, nedenler in supheli_isaretle(islemler).items():
    print(tid, "-&gt;", ", ".join(nedenler))</pre>
<p>T3 iki kurala birden takıldı (gece ve yüksek tutar); T4-T5-T6 ise hem gece hem sık işlem. T7 temiz. Pencere mantığında <code>grup[i:]</code> dilimi yalnızca ileriye bakar; sıralı liste sayesinde geçmişe bakmaya gerek yoktur.</p>
<div class="warn"><b>Sınır değerleri test et</b>23:00 tam saati gece mi? 5000.00 tam tutar yüksek mi? 10 dakika 0 saniye pencerede mi? Kuralları yazarken <code>&gt;=</code> ile <code>&gt;</code> arasındaki farkı iş birimine sor ve testte sabitle. Bu projede üç sınır da dahil (&gt;=) kabul edildi.</div>

<h2>Parça 5: JSON rapor</h2>
<p>Rapor üç bölüm taşır: genel özet (işlem sayısı, toplam tutar), kategori toplamları ve şüpheli işlemler. <code>json.dumps</code> Decimal ve datetime'ı tanımaz; ya rapor sözlüğünü kurarken metne çevirirsin ya da <code>default=</code> parametresine bir dönüştürücü verirsin. Para alanlarını <b>metin</b> olarak yazmak ("8500.00") float'a çevirmekten güvenlidir: alıcı sistem tekrar Decimal'e dönebilir.</p>
<pre class="py">import json
from datetime import datetime
from decimal import Decimal

def json_uyumlu(nesne):
    if isinstance(nesne, Decimal):
        return str(nesne)
    if isinstance(nesne, datetime):
        return nesne.isoformat()
    raise TypeError(f"JSON'a çevrilemez: {type(nesne).__name__}")

rapor = {
    "tarih": datetime(2024, 3, 15).date().isoformat(),
    "islem_sayisi": 7,
    "toplam_tutar": Decimal("10601.40"),
    "kategori_toplam": {"kuyumcu": Decimal("8500.00"), "elektronik": Decimal("1200.00")},
    "supheli": [
        {"id": "T3", "kart": "****2222", "zaman": datetime(2024, 3, 15, 2, 15), "tutar": Decimal("8500.00"), "nedenler": ["gece", "yuksek_tutar"]},
    ],
}
metin = json.dumps(rapor, default=json_uyumlu, ensure_ascii=False, indent=2)
print(metin)
geri = json.loads(metin)
print("geri okunan toplam:", Decimal(geri["toplam_tutar"]) + Decimal("0.60"))</pre>

<h2>Parça 6: Testler</h2>
<p>Kurallar test edilmeden teslim edilmez. Her kural için en az bir pozitif, bir negatif ve bir sınır testi yazarsın. Test verisi küçük ve elle hesaplanabilir olmalı; büyük CSV'yi teste sokma. Aşağıdaki örnek yalnızca gece kuralını test eder; alıştırmada üç kuralı birden yazacaksın.</p>
<pre class="py">import io
import unittest
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal

@dataclass(frozen=True)
class Transaction:
    id: str
    kart: str
    zaman: datetime
    tutar: Decimal
    kategori: str

def gece_mi(t):
    return t.zaman.hour &gt;= 23 or t.zaman.hour &lt; 6

def islem(saat, dakika=0, tutar="100"):
    return Transaction("X", "****0000", datetime(2024, 3, 15, saat, dakika), Decimal(tutar), "market")

class GeceKuraliTest(unittest.TestCase):
    def test_gece_yarisi_sonrasi(self):
        self.assertTrue(gece_mi(islem(2, 15)))
    def test_sinir_23_dahil(self):
        self.assertTrue(gece_mi(islem(23, 0)))
    def test_sinir_6_haric(self):
        self.assertFalse(gece_mi(islem(6, 0)))
    def test_ogle_degil(self):
        self.assertFalse(gece_mi(islem(13, 40)))

suite = unittest.defaultTestLoader.loadTestsFromTestCase(GeceKuraliTest)
adlar = [t.id().split(".")[-1] for t in suite]
sonuc = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(suite)
print(len(adlar), "test:", adlar)
print("başarılı:", sonuc.wasSuccessful())</pre>
<p><code>islem(...)</code> yardımcı fonksiyonu test verisini tek satırda kurar; test gövdeleri yalnızca kuralı konuşur. Bu küçük "fabrika" kalıbı, test dosyalarını okunur tutmanın en ucuz yoludur.</p>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Bu projeyi üretime taşısaydın</h3>
<p>Gerçek bir kart izleme sistemi aynı iskeleti büyütür. Kurallar bir listede tutulur: her kural <code>(ad, fonksiyon)</code> çifti olur ve <code>supheli_isaretle</code> listeyi dolaşır; yeni kural eklemek if satırı eklemek değil, listeye eleman eklemek haline gelir. Eşikler (5000 TL, 10 dakika, 3 işlem) koda değil yapılandırmaya yazılır; operasyon ekibi kodu değiştirmeden ayarı değiştirir. Sık işlem kuralı milyonlarca işlemde O(n²)'ye yaklaşır; sıralı listede iki işaretçiyle (sliding window) tek geçişe iner, İleri seviyedeki performans dersinin konusu.</p>
<p>Veri CSV'den değil veritabanından gelir: sqlite3 dersindeki iş bölümü burada da geçerli; kart ve tarih aralığı filtresini SQL yapar, kuralları Python uygular. Rapor JSON olarak bir kuyruk ya da API'ye gider, operasyon ekibi panelde görür. Testler CI'da her commit'te koşar; bir kuralın eşiği değişince önce test güncellenir. Bu dersteki altı parça, o sistemin küçültülmüş ama eksiksiz bir modelidir: model, hesap, kural, rapor, test. Bir mülakatta "orta seviye Python projesi anlat" dendiğinde anlatacağın şey tam olarak bu.</p>
</section>
`,
  ex: [
    { t: 'code', id: 'proje-orta-1',
      q: '<p><b>Parça 1.</b> <code>Transaction</code> dataclass\'ını (<code>frozen=True</code>; alanlar: <code>id: str</code>, <code>kart: str</code>, <code>zaman: datetime</code>, <code>tutar: Decimal</code>, <code>kategori: str</code>) ve <code>csv_oku(metin)</code> fonksiyonunu yaz. CSV başlığı <code>id,kart,zaman,tutar,kategori</code>; zaman biçimi <code>%Y-%m-%d %H:%M:%S</code>. Tutar <code>Decimal</code>\'e (metinden), zaman <code>datetime</code>\'a çevrilsin. <code>Transaction</code> listesi döndür.</p>',
      start: 'import csv\nimport io\nfrom dataclasses import dataclass\nfrom datetime import datetime\nfrom decimal import Decimal\n\n@dataclass(frozen=True)\nclass Transaction:\n    pass\n\ndef csv_oku(metin):\n    pass\n',
      sol: 'import csv\nimport io\nfrom dataclasses import dataclass\nfrom datetime import datetime\nfrom decimal import Decimal\n\n@dataclass(frozen=True)\nclass Transaction:\n    id: str\n    kart: str\n    zaman: datetime\n    tutar: Decimal\n    kategori: str\n\ndef csv_oku(metin):\n    islemler = []\n    for satir in csv.DictReader(io.StringIO(metin)):\n        islemler.append(Transaction(\n            id=satir["id"],\n            kart=satir["kart"],\n            zaman=datetime.strptime(satir["zaman"], "%Y-%m-%d %H:%M:%S"),\n            tutar=Decimal(satir["tutar"]),\n            kategori=satir["kategori"],\n        ))\n    return islemler\n',
      tests: 'import dataclasses\nfrom datetime import datetime\nfrom decimal import Decimal\nveri = "id,kart,zaman,tutar,kategori\\nT1,****1111,2024-03-15 09:12:00,245.90,market\\nT3,****2222,2024-03-15 02:15:00,8500.00,kuyumcu\\n"\nassert dataclasses.is_dataclass(Transaction), "Transaction bir dataclass olmalı"\nalanlar = [f.name for f in dataclasses.fields(Transaction)]\nassert alanlar == ["id", "kart", "zaman", "tutar", "kategori"], "Alan sırası id, kart, zaman, tutar, kategori olmalı"\nr = csv_oku(veri)\nassert len(r) == 2, "2 işlem okunmalı"\nassert r[0].id == "T1" and r[0].kart == "****1111" and r[0].kategori == "market", "T1 alanları doğru olmalı"\nassert r[0].zaman == datetime(2024, 3, 15, 9, 12, 0), "zaman datetime\'a çevrilmeli"\nassert isinstance(r[1].tutar, Decimal) and r[1].tutar == Decimal("8500.00"), "tutar Decimal olmalı"\ntry:\n    r[0].tutar = Decimal("1")\n    assert False, "frozen=True: alan değiştirilememeli"\nexcept dataclasses.FrozenInstanceError:\n    pass\nassert csv_oku("id,kart,zaman,tutar,kategori\\n") == [], "Yalnızca başlıkta boş liste"\n',
      hints: ['@dataclass(frozen=True) ve beş alanı tip ipucuyla sırayla yaz.', 'datetime.strptime(metin, "%Y-%m-%d %H:%M:%S"); Decimal(satir["tutar"])'],
      why: 'frozen dataclass değişmez bir kayıt tipi verir; dönüşümler yalnızca okuma katmanında yapılır, sonraki parçalar tipli nesnelerle çalışır.' },

    { t: 'code', id: 'proje-orta-2',
      q: '<p><b>Parça 2.</b> <code>Transaction</code> hazır. <code>kategori_toplam(islemler)</code> fonksiyonunu yaz: kategori → toplam tutar (<code>Decimal</code>) sözlüğü döndürsün; sözlük toplam tutara göre <b>azalan</b> sırada olsun (eşit tutarlarda kategori adına göre artan). Ayrıca <code>genel_ozet(islemler)</code>: <code>{"islem_sayisi": int, "toplam_tutar": Decimal, "kart_sayisi": int}</code> döndürsün (kart_sayisi farklı kart adedi).</p>',
      start: 'from collections import defaultdict\nfrom dataclasses import dataclass\nfrom datetime import datetime\nfrom decimal import Decimal\n\n@dataclass(frozen=True)\nclass Transaction:\n    id: str\n    kart: str\n    zaman: datetime\n    tutar: Decimal\n    kategori: str\n\ndef kategori_toplam(islemler):\n    pass\n\ndef genel_ozet(islemler):\n    pass\n',
      sol: 'from collections import defaultdict\nfrom dataclasses import dataclass\nfrom datetime import datetime\nfrom decimal import Decimal\n\n@dataclass(frozen=True)\nclass Transaction:\n    id: str\n    kart: str\n    zaman: datetime\n    tutar: Decimal\n    kategori: str\n\ndef kategori_toplam(islemler):\n    toplam = defaultdict(Decimal)\n    for t in islemler:\n        toplam[t.kategori] += t.tutar\n    return dict(sorted(toplam.items(), key=lambda kv: (-kv[1], kv[0])))\n\ndef genel_ozet(islemler):\n    return {\n        "islem_sayisi": len(islemler),\n        "toplam_tutar": sum((t.tutar for t in islemler), Decimal(0)),\n        "kart_sayisi": len({t.kart for t in islemler}),\n    }\n',
      tests: 'from datetime import datetime\nfrom decimal import Decimal\ndef T(i, kart, saat, tutar, kat):\n    return Transaction(i, kart, datetime(2024, 3, 15, saat), Decimal(tutar), kat)\nislemler = [T("T1", "****1111", 9, "245.90", "market"), T("T2", "****1111", 13, "1200.00", "elektronik"), T("T3", "****2222", 2, "8500.00", "kuyumcu"), T("T7", "****2222", 18, "430.00", "market"), T("T8", "****3333", 10, "1200.00", "yakit")]\nkt = kategori_toplam(islemler)\nassert list(kt) == ["kuyumcu", "elektronik", "yakit", "market"], "Azalan tutar, eşitlikte ad sırası: kuyumcu, elektronik, yakit, market"\nassert kt["market"] == Decimal("675.90") and isinstance(kt["market"], Decimal), "market toplamı Decimal 675.90"\no = genel_ozet(islemler)\nassert o["islem_sayisi"] == 5, "5 işlem"\nassert o["toplam_tutar"] == Decimal("11575.90") and isinstance(o["toplam_tutar"], Decimal), "Toplam Decimal 11575.90"\nassert o["kart_sayisi"] == 3, "3 farklı kart"\nassert genel_ozet([]) == {"islem_sayisi": 0, "toplam_tutar": Decimal(0), "kart_sayisi": 0}, "Boş listede sıfırlar; toplam Decimal(0) olmalı"\n',
      hints: ['defaultdict(Decimal) ile biriktir; sorted(..., key=lambda kv: (-kv[1], kv[0]))', 'sum(üreteç, Decimal(0)) başlangıç değeri verilmezse boş listede int 0 döner.'],
      why: 'Sıralama anahtarı (-tutar, ad) ikili ölçütü tek seferde verir; sum\'a Decimal(0) başlangıcı tipin her durumda Decimal kalmasını sağlar.' },

    { t: 'code', id: 'proje-orta-3',
      q: '<p><b>Parça 3.</b> İki saf kural fonksiyonu yaz. <code>gece_mi(t)</code>: işlem saati 23 ve üzeri ya da 6\'dan küçükse True. <code>yuksek_mi(t, esik=Decimal("5000"))</code>: tutar eşiğe eşit ya da büyükse True. Sonra <code>kurallari_uygula(t, kurallar)</code>: <code>kurallar</code> <code>[("gece", gece_mi), ("yuksek_tutar", yuksek_mi)]</code> gibi (ad, fonksiyon) çiftleridir; işleme uyan kuralların adlarını sırayla liste olarak döndürsün.</p>',
      start: 'from dataclasses import dataclass\nfrom datetime import datetime\nfrom decimal import Decimal\n\n@dataclass(frozen=True)\nclass Transaction:\n    id: str\n    kart: str\n    zaman: datetime\n    tutar: Decimal\n    kategori: str\n\ndef gece_mi(t):\n    pass\n\ndef yuksek_mi(t, esik=Decimal("5000")):\n    pass\n\ndef kurallari_uygula(t, kurallar):\n    pass\n',
      sol: 'from dataclasses import dataclass\nfrom datetime import datetime\nfrom decimal import Decimal\n\n@dataclass(frozen=True)\nclass Transaction:\n    id: str\n    kart: str\n    zaman: datetime\n    tutar: Decimal\n    kategori: str\n\ndef gece_mi(t):\n    return t.zaman.hour >= 23 or t.zaman.hour < 6\n\ndef yuksek_mi(t, esik=Decimal("5000")):\n    return t.tutar >= esik\n\ndef kurallari_uygula(t, kurallar):\n    return [ad for ad, fn in kurallar if fn(t)]\n',
      tests: 'from datetime import datetime\nfrom decimal import Decimal\ndef T(saat, dakika=0, tutar="100"):\n    return Transaction("X", "****0000", datetime(2024, 3, 15, saat, dakika), Decimal(tutar), "market")\nassert gece_mi(T(2, 15)) is True, "02:15 gece"\nassert gece_mi(T(23, 0)) is True, "23:00 sınırı dahil"\nassert gece_mi(T(5, 59)) is True, "05:59 gece"\nassert gece_mi(T(6, 0)) is False, "06:00 gece değil"\nassert gece_mi(T(13, 40)) is False, "13:40 gece değil"\nassert yuksek_mi(T(12, tutar="5000.00")) is True, "5000 sınırı dahil"\nassert yuksek_mi(T(12, tutar="4999.99")) is False, "4999.99 yüksek değil"\nassert yuksek_mi(T(12, tutar="1000"), esik=Decimal("999")) is True, "esik parametresi kullanılmalı"\nkurallar = [("gece", gece_mi), ("yuksek_tutar", yuksek_mi)]\nassert kurallari_uygula(T(2, tutar="8500"), kurallar) == ["gece", "yuksek_tutar"], "İkisine de uyan"\nassert kurallari_uygula(T(12, tutar="8500"), kurallar) == ["yuksek_tutar"], "Yalnız yüksek"\nassert kurallari_uygula(T(12), kurallar) == [], "Hiçbirine uymayan boş liste"\n',
      hints: ['t.zaman.hour >= 23 or t.zaman.hour < 6', '[ad for ad, fn in kurallar if fn(t)]'],
      why: 'Kurallar saf fonksiyon olunca tek tek test edilir; (ad, fonksiyon) listesi yeni kural eklemeyi if eklemekten ayırır.' },

    { t: 'code', id: 'proje-orta-4',
      q: '<p><b>Parça 4.</b> <code>sik_islem_idleri(islemler, pencere_dk=10, esik=3)</code> fonksiyonunu yaz. İşlemleri karta göre grupla, her grubu zamana göre sırala. Her işlem için, o işlemle başlayan ve <code>pencere_dk</code> dakika süren (sınır dahil) pencereye giren işlemleri say; sayı <code>esik</code> ve üzeriyse penceredeki <b>tüm</b> işlemlerin id\'lerini sonuç kümesine ekle. <code>set</code> döndür.</p>',
      start: 'from collections import defaultdict\nfrom dataclasses import dataclass\nfrom datetime import datetime, timedelta\nfrom decimal import Decimal\n\n@dataclass(frozen=True)\nclass Transaction:\n    id: str\n    kart: str\n    zaman: datetime\n    tutar: Decimal\n    kategori: str\n\ndef sik_islem_idleri(islemler, pencere_dk=10, esik=3):\n    pass\n',
      sol: 'from collections import defaultdict\nfrom dataclasses import dataclass\nfrom datetime import datetime, timedelta\nfrom decimal import Decimal\n\n@dataclass(frozen=True)\nclass Transaction:\n    id: str\n    kart: str\n    zaman: datetime\n    tutar: Decimal\n    kategori: str\n\ndef sik_islem_idleri(islemler, pencere_dk=10, esik=3):\n    karta_gore = defaultdict(list)\n    for t in islemler:\n        karta_gore[t.kart].append(t)\n    pencere = timedelta(minutes=pencere_dk)\n    supheli = set()\n    for grup in karta_gore.values():\n        grup.sort(key=lambda t: t.zaman)\n        for i, bas in enumerate(grup):\n            icinde = [t for t in grup[i:] if t.zaman - bas.zaman <= pencere]\n            if len(icinde) >= esik:\n                supheli.update(t.id for t in icinde)\n    return supheli\n',
      tests: 'from datetime import datetime\nfrom decimal import Decimal\ndef T(i, kart, saat, dk):\n    return Transaction(i, kart, datetime(2024, 3, 15, saat, dk), Decimal("50"), "yakit")\nislemler = [T("T6", "****3333", 23, 58), T("T4", "****3333", 23, 50), T("T5", "****3333", 23, 54), T("T1", "****1111", 9, 0), T("T2", "****1111", 9, 5), T("T9", "****1111", 9, 30)]\nr = sik_islem_idleri(islemler)\nassert isinstance(r, set), "set dönmeli"\nassert r == {"T4", "T5", "T6"}, "3333 kartında 10 dk içinde 3 işlem: T4, T5, T6 (sırasız girdi sıralanmalı)"\nassert "T1" not in r and "T9" not in r, "1111 kartında 10 dk içinde yalnızca 2 işlem var"\nsinir = [T("A", "****5", 10, 0), T("B", "****5", 10, 4), T("C", "****5", 10, 10)]\nassert sik_islem_idleri(sinir) == {"A", "B", "C"}, "Tam 10 dakika sınırı dahil"\nassert sik_islem_idleri(sinir + [T("D", "****5", 10, 11)], pencere_dk=5) == set(), "5 dk pencerede 3 işlem yok"\nassert sik_islem_idleri(sinir, esik=4) == set(), "esik 4 iken 3 işlem yetmez"\nassert sik_islem_idleri([]) == set(), "Boş listede boş küme"\n',
      hints: ['defaultdict(list) ile karta göre grupla, grup.sort(key=lambda t: t.zaman).', 'grup[i:] dilimi ileriye bakar; t.zaman - bas.zaman <= timedelta(minutes=pencere_dk)'],
      why: 'Sıralı grup üzerinde her işlemden ileriye bakan pencere, aynı karttaki yoğunluğu yakalar; set kullanmak aynı işlemin birden çok pencerede tekrar işaretlenmesini sorun olmaktan çıkarır.' },

    { t: 'code', id: 'proje-orta-5',
      q: '<p><b>Parça 5.</b> Önceki parçaların fonksiyonları hazır. <code>rapor_uret(islemler)</code> fonksiyonunu yaz: şu yapıda bir sözlük kurup <code>json.dumps(..., ensure_ascii=False, default=json_uyumlu)</code> ile JSON <b>metni</b> döndürsün. Yapı: <code>{"ozet": genel_ozet sonucu, "kategori_toplam": {...}, "supheli": [{"id", "kart", "zaman", "tutar", "nedenler"}, ...]}</code>. Şüpheli listesi işlem id\'sine göre sıralı; nedenler sırası <code>gece, yuksek_tutar, sik_islem</code>. <code>json_uyumlu(nesne)</code> fonksiyonunu da yaz: <code>Decimal</code> → <code>str</code>, <code>datetime</code> → <code>isoformat()</code>, diğerleri <code>TypeError</code>.</p>',
      start: 'import json\nfrom collections import defaultdict\nfrom dataclasses import dataclass\nfrom datetime import datetime, timedelta\nfrom decimal import Decimal\n\n@dataclass(frozen=True)\nclass Transaction:\n    id: str\n    kart: str\n    zaman: datetime\n    tutar: Decimal\n    kategori: str\n\ndef kategori_toplam(islemler):\n    toplam = defaultdict(Decimal)\n    for t in islemler:\n        toplam[t.kategori] += t.tutar\n    return dict(sorted(toplam.items(), key=lambda kv: (-kv[1], kv[0])))\n\ndef genel_ozet(islemler):\n    return {"islem_sayisi": len(islemler), "toplam_tutar": sum((t.tutar for t in islemler), Decimal(0)), "kart_sayisi": len({t.kart for t in islemler})}\n\ndef gece_mi(t):\n    return t.zaman.hour >= 23 or t.zaman.hour < 6\n\ndef yuksek_mi(t, esik=Decimal("5000")):\n    return t.tutar >= esik\n\ndef sik_islem_idleri(islemler, pencere_dk=10, esik=3):\n    karta_gore = defaultdict(list)\n    for t in islemler:\n        karta_gore[t.kart].append(t)\n    pencere = timedelta(minutes=pencere_dk)\n    supheli = set()\n    for grup in karta_gore.values():\n        grup.sort(key=lambda t: t.zaman)\n        for i, bas in enumerate(grup):\n            icinde = [t for t in grup[i:] if t.zaman - bas.zaman <= pencere]\n            if len(icinde) >= esik:\n                supheli.update(t.id for t in icinde)\n    return supheli\n\ndef json_uyumlu(nesne):\n    pass\n\ndef rapor_uret(islemler):\n    pass\n',
      sol: 'import json\nfrom collections import defaultdict\nfrom dataclasses import dataclass\nfrom datetime import datetime, timedelta\nfrom decimal import Decimal\n\n@dataclass(frozen=True)\nclass Transaction:\n    id: str\n    kart: str\n    zaman: datetime\n    tutar: Decimal\n    kategori: str\n\ndef kategori_toplam(islemler):\n    toplam = defaultdict(Decimal)\n    for t in islemler:\n        toplam[t.kategori] += t.tutar\n    return dict(sorted(toplam.items(), key=lambda kv: (-kv[1], kv[0])))\n\ndef genel_ozet(islemler):\n    return {"islem_sayisi": len(islemler), "toplam_tutar": sum((t.tutar for t in islemler), Decimal(0)), "kart_sayisi": len({t.kart for t in islemler})}\n\ndef gece_mi(t):\n    return t.zaman.hour >= 23 or t.zaman.hour < 6\n\ndef yuksek_mi(t, esik=Decimal("5000")):\n    return t.tutar >= esik\n\ndef sik_islem_idleri(islemler, pencere_dk=10, esik=3):\n    karta_gore = defaultdict(list)\n    for t in islemler:\n        karta_gore[t.kart].append(t)\n    pencere = timedelta(minutes=pencere_dk)\n    supheli = set()\n    for grup in karta_gore.values():\n        grup.sort(key=lambda t: t.zaman)\n        for i, bas in enumerate(grup):\n            icinde = [t for t in grup[i:] if t.zaman - bas.zaman <= pencere]\n            if len(icinde) >= esik:\n                supheli.update(t.id for t in icinde)\n    return supheli\n\ndef json_uyumlu(nesne):\n    if isinstance(nesne, Decimal):\n        return str(nesne)\n    if isinstance(nesne, datetime):\n        return nesne.isoformat()\n    raise TypeError(f"JSON\'a çevrilemez: {type(nesne).__name__}")\n\ndef rapor_uret(islemler):\n    sik = sik_islem_idleri(islemler)\n    supheli = []\n    for t in sorted(islemler, key=lambda t: t.id):\n        nedenler = []\n        if gece_mi(t):\n            nedenler.append("gece")\n        if yuksek_mi(t):\n            nedenler.append("yuksek_tutar")\n        if t.id in sik:\n            nedenler.append("sik_islem")\n        if nedenler:\n            supheli.append({"id": t.id, "kart": t.kart, "zaman": t.zaman, "tutar": t.tutar, "nedenler": nedenler})\n    rapor = {"ozet": genel_ozet(islemler), "kategori_toplam": kategori_toplam(islemler), "supheli": supheli}\n    return json.dumps(rapor, ensure_ascii=False, default=json_uyumlu)\n',
      tests: 'import json\nfrom datetime import datetime\nfrom decimal import Decimal\nassert json_uyumlu(Decimal("8500.00")) == "8500.00", "Decimal str olmalı"\nassert json_uyumlu(datetime(2024, 3, 15, 2, 15)) == "2024-03-15T02:15:00", "datetime isoformat olmalı"\ntry:\n    json_uyumlu({1, 2})\n    assert False, "Bilinmeyen tipte TypeError"\nexcept TypeError:\n    pass\ndef T(i, kart, saat, dk, tutar, kat):\n    return Transaction(i, kart, datetime(2024, 3, 15, saat, dk), Decimal(tutar), kat)\nislemler = [T("T1", "****1111", 9, 12, "245.90", "market"), T("T2", "****1111", 13, 40, "1200.00", "elektronik"), T("T3", "****2222", 2, 15, "8500.00", "kuyumcu"), T("T4", "****3333", 23, 50, "60.00", "yakit"), T("T5", "****3333", 23, 54, "75.50", "yakit"), T("T6", "****3333", 23, 58, "90.00", "market"), T("T7", "****2222", 18, 0, "430.00", "market")]\nmetin = rapor_uret(islemler)\nassert isinstance(metin, str), "JSON metni (str) dönmeli"\nr = json.loads(metin)\nassert set(r) == {"ozet", "kategori_toplam", "supheli"}, "Üst anahtarlar ozet, kategori_toplam, supheli"\nassert r["ozet"]["islem_sayisi"] == 7 and r["ozet"]["toplam_tutar"] == "10601.40" and r["ozet"]["kart_sayisi"] == 3, "Özet: 7 işlem, 10601.40, 3 kart"\nassert list(r["kategori_toplam"]) == ["kuyumcu", "elektronik", "market", "yakit"], "Kategori sırası azalan tutar"\nassert r["kategori_toplam"]["market"] == "765.90", "market toplamı metin olarak 765.90"\nids = [s["id"] for s in r["supheli"]]\nassert ids == ["T3", "T4", "T5", "T6"], "Şüpheliler id sırasıyla T3, T4, T5, T6"\nassert r["supheli"][0]["nedenler"] == ["gece", "yuksek_tutar"], "T3: gece ve yuksek_tutar"\nassert r["supheli"][1]["nedenler"] == ["gece", "sik_islem"], "T4: gece ve sik_islem"\nassert r["supheli"][0]["zaman"] == "2024-03-15T02:15:00" and r["supheli"][0]["tutar"] == "8500.00", "zaman isoformat, tutar metin"\nassert "ş" not in metin or "\\\\u" not in metin, "ensure_ascii=False ile Türkçe karakter korunmalı"\n',
      hints: ['json_uyumlu: isinstance ile Decimal ve datetime ayrımı, sonra raise TypeError.', 'rapor_uret: sorted(islemler, key=lambda t: t.id) üzerinde nedenleri topla; json.dumps(rapor, ensure_ascii=False, default=json_uyumlu).'],
      why: 'default parametresi json.dumps\'ın tanımadığı her nesne için çağrılır; para metin olarak yazılır ki alıcı taraf kayıpsız Decimal\'e dönebilsin.' },

    { t: 'code', id: 'proje-orta-6',
      q: '<p><b>Parça 6.</b> Kural fonksiyonları hazır. <code>KuralTest(unittest.TestCase)</code> sınıfını yaz; en az şu beş test metodu olsun: <code>test_gece_sinir</code> (23:00 True, 06:00 False), <code>test_gunduz_degil</code> (13:00 False), <code>test_yuksek_sinir</code> (5000.00 True, 4999.99 False), <code>test_sik_islem_uc</code> (aynı kartta 10 dk içinde 3 işlem hepsi işaretli), <code>test_sik_islem_iki</code> (2 işlem işaretlenmez). Yardımcı bir <code>islem(...)</code> fabrika fonksiyonu yazabilirsin.</p>',
      start: 'import io\nimport unittest\nfrom collections import defaultdict\nfrom dataclasses import dataclass\nfrom datetime import datetime, timedelta\nfrom decimal import Decimal\n\n@dataclass(frozen=True)\nclass Transaction:\n    id: str\n    kart: str\n    zaman: datetime\n    tutar: Decimal\n    kategori: str\n\ndef gece_mi(t):\n    return t.zaman.hour >= 23 or t.zaman.hour < 6\n\ndef yuksek_mi(t, esik=Decimal("5000")):\n    return t.tutar >= esik\n\ndef sik_islem_idleri(islemler, pencere_dk=10, esik=3):\n    karta_gore = defaultdict(list)\n    for t in islemler:\n        karta_gore[t.kart].append(t)\n    pencere = timedelta(minutes=pencere_dk)\n    supheli = set()\n    for grup in karta_gore.values():\n        grup.sort(key=lambda t: t.zaman)\n        for i, bas in enumerate(grup):\n            icinde = [t for t in grup[i:] if t.zaman - bas.zaman <= pencere]\n            if len(icinde) >= esik:\n                supheli.update(t.id for t in icinde)\n    return supheli\n\ndef islem(i="X", kart="****0000", saat=12, dakika=0, tutar="100"):\n    return Transaction(i, kart, datetime(2024, 3, 15, saat, dakika), Decimal(tutar), "market")\n\nclass KuralTest(unittest.TestCase):\n    pass\n',
      sol: 'import io\nimport unittest\nfrom collections import defaultdict\nfrom dataclasses import dataclass\nfrom datetime import datetime, timedelta\nfrom decimal import Decimal\n\n@dataclass(frozen=True)\nclass Transaction:\n    id: str\n    kart: str\n    zaman: datetime\n    tutar: Decimal\n    kategori: str\n\ndef gece_mi(t):\n    return t.zaman.hour >= 23 or t.zaman.hour < 6\n\ndef yuksek_mi(t, esik=Decimal("5000")):\n    return t.tutar >= esik\n\ndef sik_islem_idleri(islemler, pencere_dk=10, esik=3):\n    karta_gore = defaultdict(list)\n    for t in islemler:\n        karta_gore[t.kart].append(t)\n    pencere = timedelta(minutes=pencere_dk)\n    supheli = set()\n    for grup in karta_gore.values():\n        grup.sort(key=lambda t: t.zaman)\n        for i, bas in enumerate(grup):\n            icinde = [t for t in grup[i:] if t.zaman - bas.zaman <= pencere]\n            if len(icinde) >= esik:\n                supheli.update(t.id for t in icinde)\n    return supheli\n\ndef islem(i="X", kart="****0000", saat=12, dakika=0, tutar="100"):\n    return Transaction(i, kart, datetime(2024, 3, 15, saat, dakika), Decimal(tutar), "market")\n\nclass KuralTest(unittest.TestCase):\n    def test_gece_sinir(self):\n        self.assertTrue(gece_mi(islem(saat=23)))\n        self.assertFalse(gece_mi(islem(saat=6)))\n\n    def test_gunduz_degil(self):\n        self.assertFalse(gece_mi(islem(saat=13)))\n\n    def test_yuksek_sinir(self):\n        self.assertTrue(yuksek_mi(islem(tutar="5000.00")))\n        self.assertFalse(yuksek_mi(islem(tutar="4999.99")))\n\n    def test_sik_islem_uc(self):\n        uc = [islem("A", saat=23, dakika=50), islem("B", saat=23, dakika=54), islem("C", saat=23, dakika=58)]\n        self.assertEqual(sik_islem_idleri(uc), {"A", "B", "C"})\n\n    def test_sik_islem_iki(self):\n        iki = [islem("A", saat=9, dakika=0), islem("B", saat=9, dakika=5)]\n        self.assertEqual(sik_islem_idleri(iki), set())\n',
      tests: 'import io\nimport unittest\nassert issubclass(KuralTest, unittest.TestCase), "KuralTest TestCase\'den türemeli"\nsuite = unittest.defaultTestLoader.loadTestsFromTestCase(KuralTest)\nadlar = {t.id().split(".")[-1] for t in suite}\nfor ad in ("test_gece_sinir", "test_gunduz_degil", "test_yuksek_sinir", "test_sik_islem_uc", "test_sik_islem_iki"):\n    assert ad in adlar, f"{ad} metodu olmalı"\nsonuc = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(suite)\nassert sonuc.testsRun >= 5 and sonuc.wasSuccessful(), "Doğru kurallara karşı tüm testler geçmeli"\n# Testler gerçekten kontrol ediyor mu? Kuralları bozup düşmelerini bekle\n_y, _s = yuksek_mi, sik_islem_idleri\ndef yuksek_mi(t, esik=Decimal("5000")): return t.tutar > esik\nr2 = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(unittest.defaultTestLoader.loadTestsFromTestCase(KuralTest))\nyuksek_mi = _y\ndef sik_islem_idleri(islemler, pencere_dk=10, esik=3): return {t.id for t in islemler}\nr3 = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(unittest.defaultTestLoader.loadTestsFromTestCase(KuralTest))\nsik_islem_idleri = _s\nassert not r2.wasSuccessful(), "yuksek_mi 5000 sınırını dışlayınca test_yuksek_sinir düşmeli (5000.00 True beklenmeli)"\nassert not r3.wasSuccessful(), "Her işlemi işaretleyen sik_islem_idleri ile test_sik_islem_iki düşmeli"\n',
      hints: ['islem(saat=23) ile sınır işlemi üret; assertTrue/assertFalse.', 'test_sik_islem_uc: aynı kartta 23:50, 23:54, 23:58; assertEqual(sik_islem_idleri(...), {"A", "B", "C"})'],
      why: 'Her kural için pozitif, negatif ve sınır testi yazılır; fabrika fonksiyonu test verisini kısa tutar. Bozulmuş kurala karşı testin düşmesi, testin gerçekten çalıştığını gösterir.' },

    { t: 'mc', q: 'Raporda tutarları JSON\'a <code>"8500.00"</code> metni olarak yazdık, <code>8500.0</code> sayısı olarak değil. Bunun nedeni nedir?',
      o: ['JSON sayı tipini desteklemez', 'Metin daha az yer kaplar', 'Alıcı taraf metni kayıpsız Decimal\'e çevirebilir; float yuvarlama hatası taşıyabilir', 'json.dumps Decimal\'i otomatik metne çevirir'],
      a: 2,
      why: 'JSON sayıları çoğu dilde float olarak okunur ve para hassasiyeti kaybolabilir; metin ise Decimal("8500.00") ile birebir geri döner. json.dumps Decimal\'i tanımaz, default ile biz çeviririz.' }
  ],
  faq: [
    { q: 'Gerçek projede CSV yerine ne kullanırdım?', a: 'Veritabanı ya da API. sqlite3 dersindeki gibi SQL ile tarih ve kart filtresini yapıp yalnızca gerekli satırları Python\'a alırdın; csv_oku yerine satırları Transaction\'a çeviren tek bir fonksiyon değişirdi, kalan parçalar aynı kalır.' },
    { q: 'Sık işlem kuralı büyük veride yavaş olmaz mı?', a: 'Olur: her işlem için ileriye bakan liste O(n²)\'ye yaklaşır. Sıralı listede iki işaretçiyle kayan pencere tek geçişte çözer; İleri seviyedeki performans dersinde bu dönüşümü yapacaksın.' },
    { q: 'Kuralların eşiklerini nereye koymalıyım?', a: 'Parametre olarak (esik, pencere_dk) fonksiyonda; değerlerini yapılandırma dosyası ya da ortam değişkeninden okuyarak. Kod değişmeden operasyon ekibi eşiği ayarlayabilmeli.' },
    { q: 'Bu projeyi portföyüme nasıl koyarım?', a: 'src yerleşimiyle bir depo aç, README\'ye ne yaptığını ve nasıl çalıştırılacağını yaz, testleri tests/ altına koy, örnek CSV ekle, .gitignore ve pyproject.toml ile tamamla. Git dersindeki her şey burada işe yarar.' }
  ],
  mistakes: [
    { bad: 'tutar=float(satir["tutar"])', good: 'tutar=Decimal(satir["tutar"])', why: 'Para hesabında float yuvarlama hatası birikir; CSV\'den gelen metin doğrudan Decimal\'e çevrilir.' },
    { bad: 'sum(t.tutar for t in islemler)', good: 'sum((t.tutar for t in islemler), Decimal(0))', why: 'Boş listede sum int 0 döner ve tip tutarsızlaşır; başlangıç değeri Decimal(0) her durumda Decimal verir.' },
    { bad: 'json.dumps(rapor)  # Decimal içeriyor', good: 'json.dumps(rapor, default=json_uyumlu)', why: 'json Decimal ve datetime\'ı tanımaz, TypeError fırlatır; default ile dönüştürücü verilir.' },
    { bad: 'for i, bas in enumerate(grup):\n    icinde = [t for t in grup if abs(t.zaman - bas.zaman) <= pencere]', good: 'grup.sort(key=lambda t: t.zaman)\nfor i, bas in enumerate(grup):\n    icinde = [t for t in grup[i:] if t.zaman - bas.zaman <= pencere]', why: 'Sıralamadan ve ileriye bakmadan pencere hesaplamak hem yanlış (geçmiş ve gelecek karışır, 20 dakikalık pencere oluşur) hem gereksiz yavaştır.' }
  ]
}
);
})(window);
