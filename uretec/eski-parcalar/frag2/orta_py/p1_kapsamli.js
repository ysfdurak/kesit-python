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
