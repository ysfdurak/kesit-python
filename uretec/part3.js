/* ───────────────────────── 7. listeler ───────────────────────── */
{
  id: 'listeler',
  lv: 'temel',
  mod: 'Veri Türleri',
  min: 25,
  title: 'Listeler',
  sum: 'Sipariş ve tutar listelerini indeks ve dilimle okur; append, insert, pop, remove ile değiştirir; sort ve sorted ile sıralar; iç içe liste ve kopyalama tuzağını öğrenirsin.',
  goals: [
    'Liste oluşturup indeks ve dilimle elemanlara erişebilirim.',
    'append, insert, pop, remove, extend ile listeyi yerinde değiştirebilirim.',
    'sort ile sorted arasındaki farkı bilir, doğru olanı seçerim.',
    'İç içe listelerle tablo benzeri veriyi tutup okuyabilirim.',
    'Liste kopyalama tuzağını açıklayıp copy ile güvenli kopya alabilirim.'
  ],
  body: `
<h2>Tek değişken yetmeyince</h2>
<p>Anadolu Market'e bugün 5 sipariş geldi. Tutarları <code>t1</code>, <code>t2</code>, <code>t3</code>... diye ayrı değişkenlerde tutmak hem yorucu hem de yarın 500 sipariş gelince imkânsız. <b>Liste</b> (list), birden fazla değeri sıralı biçimde tek değişkende tutar. Köşeli parantezle yazılır, elemanlar virgülle ayrılır ve her türden değer içerebilir.</p>
<pre class="py">tutarlar = [1499.9, 250, 89.5, 3200, 475]
sehirler = ["İzmir", "Ankara", "İzmir", "Bursa", "İstanbul"]
karisik = ["AM-00417", 1499.9, True, None]
print(tutarlar)
print(len(tutarlar), "sipariş")
print(sum(tutarlar), max(tutarlar), min(tutarlar))
print(round(sum(tutarlar) / len(tutarlar), 2), "TL ortalama")</pre>
<p><code>len</code>, <code>sum</code>, <code>max</code>, <code>min</code> hazır fonksiyonları listelerle doğrudan çalışır. Beş satırda bir günün özet raporu çıktı; analistin ilk Python kazancı budur.</p>

<h2>İndeks ve dilim</h2>
<p>Metinlerdeki kuralların aynısı: 0'dan başlar, negatif sondan sayar, dilimde bitiş hariçtir.</p>
<pre class="py">sehirler = ["İzmir", "Ankara", "İzmir", "Bursa", "İstanbul"]
print(sehirler[0], sehirler[-1])
print(sehirler[1:3])
print(sehirler[:2], sehirler[3:])
print("Bursa" in sehirler)
print(sehirler.index("Bursa"))
print(sehirler.count("İzmir"))</pre>
<p><code>in</code> elemanın var olup olmadığını, <code>index</code> ilk konumunu, <code>count</code> kaç kez geçtiğini verir. Var olmayan bir indeks IndexError, var olmayan bir değer için <code>index</code> ValueError verir; önce <code>in</code> ile sormak güvenlidir.</p>

<h2>Listeyi değiştirmek</h2>
<p>Metinlerden en büyük farkı burada: liste <b>değiştirilebilir</b> (mutable). Metotların çoğu listeyi yerinde değiştirir ve hiçbir şey döndürmez (<code>None</code>).</p>
<pre class="py">bekleyen = ["AM-101", "AM-102", "AM-103"]
bekleyen.append("AM-104")          # sona ekle
bekleyen.insert(0, "AM-100")       # başa ekle (konum, değer)
print(bekleyen)
islenen = bekleyen.pop(0)          # konumdaki elemanı çıkar ve döndür
print("İşlendi:", islenen, "| kalan:", bekleyen)
bekleyen.remove("AM-102")          # değere göre ilk eşleşeni sil
print(bekleyen)
bekleyen.extend(["AM-105", "AM-106"])   # başka listeyi ekle
print(bekleyen, len(bekleyen))
bekleyen[0] = "AM-101-DUZELTME"    # yerinde değiştir
print(bekleyen[0])</pre>
<div class="tbl-wrap"><table>
<tr><th>Metot</th><th>Ne yapar</th><th>Döndürür</th></tr>
<tr><td><code>append(x)</code></td><td>Sona tek eleman ekler</td><td>None</td></tr>
<tr><td><code>insert(i, x)</code></td><td>i konumuna ekler</td><td>None</td></tr>
<tr><td><code>extend(liste)</code></td><td>Başka listenin elemanlarını ekler</td><td>None</td></tr>
<tr><td><code>pop(i)</code></td><td>i konumundakini çıkarır (varsayılan: son)</td><td>Çıkarılan eleman</td></tr>
<tr><td><code>remove(x)</code></td><td>x değerinin ilkini siler</td><td>None</td></tr>
<tr><td><code>sort()</code></td><td>Yerinde sıralar</td><td>None</td></tr>
<tr><td><code>reverse()</code></td><td>Yerinde ters çevirir</td><td>None</td></tr>
</table></div>
<div class="warn"><b>append bir liste eklemez, elemanı ekler</b><code>a.append([1, 2])</code> listenin içine bir liste koyar (iç içe). İki listeyi birleştirmek için <code>extend</code> ya da <code>a + b</code> kullan.</div>

<h2>sort ve sorted</h2>
<p>En sık karıştırılan ikili. <code>liste.sort()</code> listeyi yerinde sıralar ve <code>None</code> döndürür. <code>sorted(liste)</code> ise orijinale dokunmaz, sıralı <b>yeni</b> bir liste döndürür.</p>
<pre class="py">tutarlar = [1499.9, 250, 89.5, 3200, 475]
sirali = sorted(tutarlar)
print(sirali)
print(tutarlar)                       # orijinal aynı
tutarlar.sort(reverse=True)           # yerinde, büyükten küçüğe
print(tutarlar)
print("En büyük 3:", tutarlar[:3])
sehirler = ["İzmir", "ankara", "Bursa"]
print(sorted(sehirler))
print(sorted(sehirler, key=str.lower))</pre>
<p>Son iki satır önemli bir ayrıntıyı gösterir: sıralama büyük-küçük harfe duyarlıdır, büyük harfler önce gelir. <code>key=str.lower</code> ile "küçük harfli hâline göre sırala" dersin. Türkçe karakterler için tam alfabetik sıralama <code>locale</code> modülü gerektirir; raporda genellikle <code>key=str.lower</code> yeterlidir.</p>
<div class="tip"><b>Hangisini seçmeli?</b>Orijinal sıralamaya tekrar ihtiyacın olacaksa <code>sorted</code>, olmayacaksa <code>sort</code> (bellek kullanmaz). Zincirleme bir ifadede, örneğin <code>sorted(x)[:3]</code>, yalnızca sorted çalışır.</div>

<h2>İç içe liste: küçük bir tablo</h2>
<p>Her sipariş birden fazla bilgi taşıyorsa her satır bir liste, tüm satırlar da bir liste olur. Bu, bir tablonun en basit hâlidir.</p>
<pre class="py">siparisler = [
    ["AM-101", "İzmir", 1499.9],
    ["AM-102", "Ankara", 250],
    ["AM-103", "İzmir", 89.5],
]
print(siparisler[1])            # ikinci satır
print(siparisler[1][2])         # ikinci satırın tutarı
siparisler[2][2] = 99.5         # tutarı düzelt
print(siparisler[2])
siparisler.append(["AM-104", "Bursa", 3200])
print(len(siparisler), "satır")
print(siparisler[0][1], siparisler[-1][1])</pre>
<p>İlk indeks satırı, ikinci indeks sütunu seçer. Döngüleri öğrenince bu yapıyı satır satır gezip şehir bazlı toplam çıkaracaksın; sözlükler dersinde ise sütunlara isimle erişmenin daha okunur yolunu göreceksin.</p>

<h2>Kopyalama tuzağı</h2>
<p>Burası herkesin bir kere başına gelen hata. <code>b = a</code> yazmak listeyi kopyalamaz; aynı listeye ikinci bir etiket takar. Birini değiştirdiğinde diğeri de değişir çünkü ikisi de aynı nesnedir.</p>
<pre class="py">onayli = ["AM-101", "AM-102"]
yedek = onayli                 # kopya DEĞİL, aynı liste
yedek.append("AM-103")
print("onayli:", onayli)       # o da değişti!
print(onayli is yedek)

gercek_yedek = onayli.copy()   # ya da onayli[:] ya da list(onayli)
gercek_yedek.append("AM-999")
print("onayli:", onayli)
print("gercek_yedek:", gercek_yedek)
print(onayli is gercek_yedek)</pre>
<p><code>is</code> operatörü "aynı nesne mi" diye sorar; <code>==</code> ise "içerikleri eşit mi". <code>copy()</code>, <code>[:]</code> ve <code>list()</code> üçü de yüzeysel kopya (shallow copy) alır: dış liste yeni, ama içindeki listeler hâlâ paylaşılır. İç içe listelerde tam bağımsız kopya için <code>copy.deepcopy</code> gerekir.</p>
<div class="note"><b>Neden metinlerde bu sorun yoktu?</b>Metin değişmezdir; onu "değiştiren" her işlem yeni nesne üretir, dolayısıyla paylaşılan nesne hiç bozulmaz. Liste yerinde değiştiğinden paylaşım görünür hâle gelir. Aynı tuzak sözlük ve kümelerde de vardır.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Fonksiyona liste vermek</h3>
<p>Bir fonksiyon parametre olarak liste alıp <code>append</code> yaparsa çağıranın listesi de değişir; bu kopyalama tuzağının fonksiyon hâlidir. İyi uygulama: fonksiyon ya listeyi değiştirdiğini adıyla belli eder (<code>listeye_ekle</code>) ya da hiç dokunmayıp yeni liste döndürür. Varsayılan parametre olarak <code>def f(x=[])</code> yazmak ise klasik bir tuzaktır; fonksiyonlar dersinde göreceksin.</p>
<h3>Liste ne zaman yanlış araçtır?</h3>
<p>Liste "var mı" sorusunu baştan sona tarayarak yanıtlar; yüz bin müşteri numarasının içinde arama yapacaksan küme (set) ya da sözlük (dict) çok daha hızlıdır. Listenin başından sürekli eleman çıkarmak (<code>pop(0)</code>) da yavaştır; kuyruk için <code>collections.deque</code> vardır. Sayısal hesaplar içinse numpy dizileri hem hızlı hem bellek dostudur. Liste, sıralı ve küçük-orta boyutlu veri için doğru araçtır.</p>
<h3>Comprehension'a hazırlık</h3>
<p>Orta seviyede <code>[t * 1.2 for t in tutarlar]</code> gibi tek satırda yeni liste üreten liste kavrayışlarını (list comprehension) öğreneceksin. Şimdi append ile adım adım yaptığın her şey orada tek ifadeye inecek; temel sağlamsa geçiş bir gün sürer.</p>
</section>
`,
  ex: [
    { t: 'code', id: 'listeler-1',
      q: '<p>Bugünkü tutarlar <code>tutarlar = [1499.9, 250, 89.5, 3200, 475]</code>. Üç değişken hesapla: <code>toplam</code> (tüm tutarların toplamı), <code>en_buyuk</code> (en büyük tutar) ve <code>ortalama</code> (2 basamağa yuvarlanmış ortalama).</p>',
      start: 'tutarlar = [1499.9, 250, 89.5, 3200, 475]\n# toplam, en_buyuk, ortalama\n',
      sol: 'tutarlar = [1499.9, 250, 89.5, 3200, 475]\ntoplam = sum(tutarlar)\nen_buyuk = max(tutarlar)\nortalama = round(toplam / len(tutarlar), 2)\nprint(toplam, en_buyuk, ortalama)\n',
      tests: 'assert abs(toplam - 5514.4) < 1e-6, "toplam 5514.4 olmalı"\nassert en_buyuk == 3200, "en_buyuk 3200 olmalı"\nassert abs(ortalama - 1102.88) < 1e-6, "ortalama 1102.88 olmalı"\n',
      hints: ['sum, max ve len hazır fonksiyonlardır.', 'ortalama = round(toplam / len(tutarlar), 2)'],
      why: 'Hazır fonksiyonlar liste üzerinde doğrudan çalışır; döngüye gerek kalmaz.' },
    { t: 'code', id: 'listeler-2',
      q: '<p>Bekleyen sipariş kuyruğu <code>kuyruk = ["AM-101", "AM-102", "AM-103"]</code>. Şu işlemleri sırayla yap: sona <code>"AM-104"</code> ekle; başa <code>"AM-100"</code> ekle; baştaki elemanı <code>pop</code> ile çıkarıp <code>islenen</code> değişkenine koy; <code>"AM-102"</code> değerini <code>remove</code> ile sil. Sonunda <code>kuyruk</code> şöyle olmalı: <code>["AM-101", "AM-103", "AM-104"]</code>.</p>',
      start: 'kuyruk = ["AM-101", "AM-102", "AM-103"]\n# işlemleri sırayla uygula\n',
      sol: 'kuyruk = ["AM-101", "AM-102", "AM-103"]\nkuyruk.append("AM-104")\nkuyruk.insert(0, "AM-100")\nislenen = kuyruk.pop(0)\nkuyruk.remove("AM-102")\nprint(islenen, kuyruk)\n',
      tests: 'assert islenen == "AM-100", "islenen AM-100 olmalı (başa eklenen çıkarıldı)"\nassert kuyruk == ["AM-101", "AM-103", "AM-104"], "kuyruk [AM-101, AM-103, AM-104] olmalı"\n',
      hints: ['insert(0, x) başa ekler; pop(0) baştakini çıkarır.', 'remove değere göre siler, pop konuma göre.'],
      why: 'append/insert ekler, pop konumdan çıkarıp döndürür, remove değere göre siler; hepsi listeyi yerinde değiştirir.' },
    { t: 'mc', q: '<code>a = [3, 1, 2]</code> için <code>b = a.sort()</code> yazarsan <code>b</code> ne olur?',
      o: ['[1, 2, 3]', '[3, 1, 2]', 'None', 'Hata verir'], a: 2,
      why: 'sort() listeyi yerinde sıralar ve None döndürür; b None olur, a ise [1, 2, 3]. Yeni liste istiyorsan sorted(a) kullan.' },
    { t: 'code', id: 'listeler-3',
      q: '<p><code>en_buyuk_uc(tutarlar)</code> fonksiyonu yaz: verilen tutar listesinin en büyük üç değerini büyükten küçüğe yeni bir liste olarak döndürsün. <b>Orijinal liste değişmemeli</b> (sorted kullan).</p>',
      start: 'def en_buyuk_uc(tutarlar):\n    pass\n',
      sol: 'def en_buyuk_uc(tutarlar):\n    return sorted(tutarlar, reverse=True)[:3]\n',
      tests: 'veri = [1499.9, 250, 89.5, 3200, 475]\nassert en_buyuk_uc(veri) == [3200, 1499.9, 475], "en büyük üç: [3200, 1499.9, 475]"\nassert veri == [1499.9, 250, 89.5, 3200, 475], "orijinal liste değişmemeli; sorted kullan"\nassert en_buyuk_uc([5, 1]) == [5, 1], "kısa listede eldekini döndür"\n',
      hints: ['sorted(liste, reverse=True) büyükten küçüğe yeni liste verir.', 'Dilim [:3] ilk üçü alır.'],
      why: 'sorted orijinale dokunmaz; reverse=True ve dilim ile en büyük üç elde edilir.' },
    { t: 'mc', q: 'Aşağıdaki kod ne yazdırır?<br><code>a = [1, 2]<br>b = a<br>b.append(3)<br>print(a)</code>',
      o: ['[1, 2]', '[1, 2, 3]', 'Hata verir', '[3]'], a: 1,
      why: 'b = a kopyalamaz; iki ad aynı listeye işaret eder. b üzerinden eklenen eleman a\'da da görünür. Kopya için a.copy() gerekir.' },
    { t: 'code', id: 'listeler-4',
      q: '<p>Sipariş tablosu iç içe liste olarak verildi. <code>izmir_toplam</code> adlı değişkende yalnızca şehri <code>"İzmir"</code> olan satırların tutar toplamını hesapla. Henüz döngü bilmiyorsan satırlara indeksle tek tek erişebilirsin (0. ve 2. satır İzmir). Ayrıca 3. satırın (indeks 3) tutarını <code>3300</code> olarak düzelt.</p>',
      start: 'siparisler = [\n    ["AM-101", "İzmir", 1499.9],\n    ["AM-102", "Ankara", 250],\n    ["AM-103", "İzmir", 89.5],\n    ["AM-104", "Bursa", 3200],\n]\n# izmir_toplam hesapla, AM-104 tutarını 3300 yap\n',
      sol: 'siparisler = [\n    ["AM-101", "İzmir", 1499.9],\n    ["AM-102", "Ankara", 250],\n    ["AM-103", "İzmir", 89.5],\n    ["AM-104", "Bursa", 3200],\n]\nizmir_toplam = siparisler[0][2] + siparisler[2][2]\nsiparisler[3][2] = 3300\nprint(izmir_toplam, siparisler[3])\n',
      tests: 'assert abs(izmir_toplam - 1589.4) < 1e-6, "izmir_toplam 1589.4 olmalı"\nassert siparisler[3][2] == 3300, "AM-104 tutarı 3300 olmalı"\nassert siparisler[3][0] == "AM-104", "diğer alanlar değişmemeli"\n',
      hints: ['siparisler[0][2] ilk satırın tutarı.', 'siparisler[3][2] = 3300 yerinde değiştirir.'],
      why: 'İlk indeks satırı, ikinci indeks sütunu seçer; iç liste değiştirilebilir olduğundan yerinde atama yapılır.' },
    { t: 'mc', q: '<code>a = [1, 2]</code> ve <code>a.append([3, 4])</code> sonrası <code>len(a)</code> kaçtır?',
      o: ['4', '2', '3', 'Hata verir'], a: 2,
      why: 'append tek bir eleman ekler; [3, 4] listesi tek eleman olarak girer ve a = [1, 2, [3, 4]] olur. Dört elemanlı liste için extend gerekir.' },
    { t: 'code', id: 'listeler-5',
      q: '<p><code>guvenli_kopya_ekle(liste, eleman)</code> fonksiyonu yaz: verilen listenin bir <b>kopyasını</b> alıp sonuna elemanı eklesin ve yeni listeyi döndürsün. Orijinal liste kesinlikle değişmemeli.</p>',
      start: 'def guvenli_kopya_ekle(liste, eleman):\n    pass\n',
      sol: 'def guvenli_kopya_ekle(liste, eleman):\n    yeni = liste.copy()\n    yeni.append(eleman)\n    return yeni\n',
      tests: 'orijinal = ["AM-101", "AM-102"]\nsonuc = guvenli_kopya_ekle(orijinal, "AM-103")\nassert sonuc == ["AM-101", "AM-102", "AM-103"], "yeni liste elemanı içermeli"\nassert orijinal == ["AM-101", "AM-102"], "orijinal liste değişmemeli; copy() kullan"\nassert sonuc is not orijinal, "farklı bir liste nesnesi dönmeli"\n',
      hints: ['liste.copy() ya da liste[:] yeni liste verir.', 'Kopyaya append yap, kopyayı döndür.'],
      why: 'Kopya almadan append yaparsan çağıranın listesi bozulur; copy bu tuzağı önler.' }
  ],
  faq: [
    { q: "Liste ile metin aynı şekilde dilimleniyor, farkları ne?", a: "Dilimleme ve indeks kuralları aynı. Temel fark: liste değiştirilebilir (eleman atayabilir, ekleyip silebilirsin), metin değişmez. Ayrıca liste her türden eleman tutar, metin yalnızca karakter." },
    { q: "pop() ile remove() arasındaki fark ne?", a: "pop konuma göre çıkarır ve çıkardığı elemanı döndürür (parametresiz sonuncuyu alır). remove değere göre ilk eşleşeni siler ve hiçbir şey döndürmez." },
    { q: "Listenin içindeki listeleri de kopyalamak istersem?", a: "copy() yüzeysel kopya alır; iç listeler paylaşılmaya devam eder. Tam bağımsız kopya için import copy; copy.deepcopy(liste) kullan." }
  ],
  mistakes: [
    { bad: 'sirali = tutarlar.sort()\nprint(sirali)', good: 'sirali = sorted(tutarlar)\nprint(sirali)', why: 'sort() None döndürür; sıralı yeni liste için sorted() kullan.' },
    { bad: 'a = [1, 2]\na.append([3, 4])', good: 'a = [1, 2]\na.extend([3, 4])', why: 'append listeyi tek eleman olarak iç içe ekler; elemanları eklemek için extend.' },
    { bad: 'yedek = liste\nyedek.append(x)', good: 'yedek = liste.copy()\nyedek.append(x)', why: 'Atama kopya oluşturmaz; iki ad aynı listeyi paylaşır.' },
    { bad: 'liste = [1, 2, 3]\nprint(liste[3])', good: 'liste = [1, 2, 3]\nprint(liste[-1])', why: 'Üç elemanlı listenin son indeksi 2\'dir; 3 IndexError verir. Son eleman için -1 kullan.' }
  ]
},

/* ───────────────────────── 8. demet-kume ───────────────────────── */
{
  id: 'demet-kume',
  lv: 'temel',
  mod: 'Veri Türleri',
  min: 22,
  title: 'Demet (tuple) ve küme (set)',
  sum: 'Değişmez kayıtlar için demeti, benzersiz değerler ve küme işlemleri için kümeyi öğrenir; liste, demet ve küme arasında ne zaman hangisini seçeceğini kavrarsın.',
  goals: [
    'Demet oluşturup açma (unpacking) ile elemanlarını değişkenlere dağıtabilirim.',
    'Demetin değişmezliğinin ne sağladığını ve ne zaman tercih edileceğini açıklayabilirim.',
    'Kümeyle tekrarları kaldırıp hızlı üyelik testi yapabilirim.',
    'Birleşim, kesişim ve fark işlemleriyle iki müşteri grubunu karşılaştırabilirim.',
    'Liste, demet ve küme arasından göreve uygun yapıyı seçebilirim.'
  ],
  body: `
<h2>İki yeni kap</h2>
<p>Liste çoğu işi görür ama iki durumda eksik kalır. Birincisi: bazı veriler asla değişmemeli; bir şubenin koordinatı, bir siparişin (kod, tarih) kimliği. İkincisi: bazen sırayla değil "hangileri var" ile ilgilenirsin; Anadolu Market'ten alışveriş yapmış benzersiz şehirler, hem kredi kartı hem mevduat müşterisi olanlar. İlk iş için <b>demet</b> (tuple), ikincisi için <b>küme</b> (set) var.</p>

<h2>Demet: değişmez liste</h2>
<p>Demet, parantezle yazılan ve oluşturulduktan sonra <b>değiştirilemeyen</b> sıralı bir koleksiyondur. İndeks, dilim, <code>len</code>, <code>in</code> hepsi listeyle aynı çalışır; sadece ekleme, silme ve atama yoktur.</p>
<pre class="py">sube = ("Ilgaz Bank Konak", 38.4189, 27.1287)
print(sube[0])
print(sube[1:])
print(len(sube), "Konak" in sube[0])
tek = (42,)             # tek elemanlı demet: virgül şart
degil = (42)            # bu sadece 42 sayısı
print(type(tek), type(degil))
parantezsiz = 1, 2, 3   # parantez bile gerekmez
print(parantezsiz)</pre>
<p>Tek elemanlı demette virgül şarttır; <code>(42)</code> yalnızca bir sayıdır. Aslında demeti yapan şey parantez değil virgüldür: <code>1, 2, 3</code> tek başına bir demettir. Sayılar dersinde <code>1499,90</code> yazınca demet oluşmasının sebebi buydu.</p>
<pre class="py">sube = ("Konak", 38.4189, 27.1287)
try:
    sube[0] = "Alsancak"
except TypeError as hata:
    print("Değiştirilemez:", hata)
yeni_sube = ("Alsancak",) + sube[1:]
print(yeni_sube)</pre>
<p>Değiştirmek istersen metinlerde olduğu gibi yeni bir demet kurarsın. Buradaki <code>try/except</code> yapısını Hatalar dersinde öğreneceksin; şimdilik "hata verir ama program durmasın" diye oku.</p>

<h2>Açma (unpacking)</h2>
<p>Demetin en güçlü yanı: elemanlarını tek satırda ayrı değişkenlere dağıtabilirsin. Buna açma (unpacking) denir ve fonksiyonlar birden fazla değer döndürürken sürekli karşına çıkar.</p>
<pre class="py">sube = ("Konak", 38.4189, 27.1287)
ad, enlem, boylam = sube
print(ad, enlem, boylam)
a, b = 10, 20
a, b = b, a                    # takas, geçici değişkensiz
print(a, b)
bolum, kalan = divmod(10000, 3)
print(bolum, kalan)
ilk, *orta, son = [1, 2, 3, 4, 5]
print(ilk, orta, son)</pre>
<p>Sol taraftaki değişken sayısı eleman sayısıyla eşleşmeli, yoksa ValueError alırsın. Yıldızlı ad (<code>*orta</code>) "geri kalan hepsi" demektir ve liste olarak gelir. Açma yalnızca demet için değil liste ve her yinelenebilir için çalışır.</p>
<div class="tip"><b>Demet ne zaman?</b>Elemanların sayısı ve anlamı sabitse demet kullan: (enlem, boylam), (ad, soyad), (yıl, ay, gün). Elemanlar aynı türden ve sayısı değişkense liste: sipariş tutarları, şehir adları. Demet ayrıca sözlük anahtarı olabilir; liste olamaz.</div>

<h2>Küme: benzersiz elemanlar</h2>
<p>Küme süslü parantezle yazılır, sırasızdır ve her elemanı yalnızca bir kez tutar. Bir listeyi <code>set()</code>'e vermek tekrarları anında kaldırır.</p>
<pre class="py">sehirler = ["İzmir", "Ankara", "İzmir", "Bursa", "İzmir", "Ankara"]
benzersiz = set(sehirler)
print(benzersiz)
print(len(benzersiz), "farklı şehir")
benzersiz.add("İstanbul")
benzersiz.add("Ankara")            # zaten var, bir şey olmaz
benzersiz.discard("Bursa")         # yoksa da hata vermez
print(sorted(benzersiz))           # sıralı görmek için listeye çevir
print("İzmir" in benzersiz)
bos = set()                        # {} boş sözlük olur, dikkat</pre>
<p>Küme sırasız olduğundan indeksle erişemezsin (<code>benzersiz[0]</code> hata verir) ve yazdırınca sıra her çalıştırmada farklı olabilir. Sıralı görmek için <code>sorted</code> kullan. Kümenin asıl gücü hızdır: <code>in</code> sorgusu listede baştan sona tarama yaparken kümede eleman sayısından bağımsız, neredeyse anında yanıtlanır. Yüz binlerce müşteri numarası içinde arama yapacaksan küme kullan.</p>
<div class="warn"><b>Küme elemanları değişmez olmalı</b>Kümeye sayı, metin ve demet koyabilirsin ama liste ya da sözlük koyamazsın; <code>{[1, 2]}</code> TypeError verir. Sebep: küme elemanları için karma (hash) hesaplar ve değişebilen nesnelerin karması tutarlı olmaz.</div>

<h2>Küme işlemleri</h2>
<p>Ilgaz Bank'ta iki müşteri grubu var: kredi kartı olanlar ve mevduat hesabı olanlar. Pazarlama ekibi şunu soruyor: hangileri ikisine de sahip, hangileri yalnızca kredi kartına sahip, toplam kaç farklı müşteri var?</p>
<pre class="py">kredi_karti = {"M-101", "M-102", "M-103", "M-104"}
mevduat = {"M-103", "M-104", "M-105"}
print("Her ikisi:", kredi_karti &amp; mevduat)       # kesişim
print("Toplam farklı:", kredi_karti | mevduat)    # birleşim
print("Sadece kart:", kredi_karti - mevduat)      # fark
print("Yalnız birinde:", kredi_karti ^ mevduat)   # simetrik fark
print(kredi_karti.intersection(mevduat))         # aynı şey, metot hâli
print({"M-103"} &lt;= mevduat)                       # alt küme mi?</pre>
<div class="tbl-wrap"><table>
<tr><th>İşlem</th><th>Operatör</th><th>Metot</th><th>Anlamı</th></tr>
<tr><td>Birleşim</td><td><code>a | b</code></td><td><code>a.union(b)</code></td><td>Herhangi birinde olanlar</td></tr>
<tr><td>Kesişim</td><td><code>a &amp; b</code></td><td><code>a.intersection(b)</code></td><td>İkisinde de olanlar</td></tr>
<tr><td>Fark</td><td><code>a - b</code></td><td><code>a.difference(b)</code></td><td>a'da olup b'de olmayanlar</td></tr>
<tr><td>Simetrik fark</td><td><code>a ^ b</code></td><td><code>a.symmetric_difference(b)</code></td><td>Yalnızca birinde olanlar</td></tr>
<tr><td>Alt küme</td><td><code>a &lt;= b</code></td><td><code>a.issubset(b)</code></td><td>a'nın tamamı b'de mi</td></tr>
</table></div>
<p>Bu dört işlem, SQL'deki JOIN ve EXCEPT sorgularının Python karşılığıdır. "Geçen ay alışveriş yapıp bu ay yapmayan müşteriler" sorusu tek bir fark işlemidir: <code>gecen_ay - bu_ay</code>.</p>

<h2>Hangisini ne zaman?</h2>
<div class="tbl-wrap"><table>
<tr><th>Özellik</th><th>Liste</th><th>Demet</th><th>Küme</th></tr>
<tr><td>Yazım</td><td><code>[1, 2]</code></td><td><code>(1, 2)</code></td><td><code>{1, 2}</code></td></tr>
<tr><td>Sıralı</td><td>Evet</td><td>Evet</td><td>Hayır</td></tr>
<tr><td>Değiştirilebilir</td><td>Evet</td><td>Hayır</td><td>Evet (elemanlar değişmez)</td></tr>
<tr><td>Tekrar</td><td>Olabilir</td><td>Olabilir</td><td>Olamaz</td></tr>
<tr><td>İndeks</td><td>Var</td><td>Var</td><td>Yok</td></tr>
<tr><td>Tipik iş</td><td>Sıralı kayıtlar</td><td>Sabit yapılı kayıt, çoklu dönüş</td><td>Benzersizlik, üyelik, karşılaştırma</td></tr>
</table></div>
<div class="note"><b>frozenset</b>Değişmez küme istersen <code>frozenset</code> var; kümelerin kümesini yaparken ya da sözlük anahtarı olarak küme kullanırken gerekir. Nadir ama var olduğunu bil.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Demet neden sözlük anahtarı olabilir?</h3>
<p>Sözlükler ve kümeler elemanı bulmak için karma (hash) değeri kullanır. Karma, nesnenin içeriğinden hesaplanır; içerik değişirse karma da değişir ve nesne kaybolur. Demet değişmez olduğundan karması sabittir, bu yüzden <code>{("İzmir", 2025): 1500}</code> gibi bileşik anahtarlar kurabilirsin. Şehir-yıl bazlı özetlerde çok işe yarar.</p>
<h3>namedtuple ve dataclass'a doğru</h3>
<p><code>sube[1]</code> okunur değildir; enlem mi boylam mı? <code>collections.namedtuple</code> demete alan adı verir: <code>sube.enlem</code>. Python 3.7'den beri <code>dataclass</code> aynı işi daha güçlü yapar. Orta seviyede ikisini de göreceksin; şimdilik demet, "küçük ve sabit kayıt" için yeterli.</p>
<h3>Büyük veri setlerinde küme</h3>
<p>İki büyük listeyi "hangi elemanlar ortak" diye iç içe döngüyle karşılaştırmak eleman sayısının karesiyle büyür: on bin eleman için yüz milyon karşılaştırma. Kümeye çevirip kesişim almak doğrusal zamanda biter. Analist olarak öğreneceğin ilk performans kuralı budur: üyelik ve karşılaştırma işlerinde listeyi kümeye çevir.</p>
</section>
`,
  ex: [
    { t: 'code', id: 'demet-kume-1',
      q: '<p>Şube bilgisi demet olarak verildi: <code>sube = ("Konak", 38.4189, 27.1287)</code>. Açma (unpacking) ile üç elemanı <code>ad</code>, <code>enlem</code> ve <code>boylam</code> değişkenlerine dağıt. Tek satırda yap.</p>',
      start: 'sube = ("Konak", 38.4189, 27.1287)\n# açma ile üç değişkene dağıt\n',
      sol: 'sube = ("Konak", 38.4189, 27.1287)\nad, enlem, boylam = sube\nprint(ad, enlem, boylam)\n',
      tests: 'assert ad == "Konak", "ad Konak olmalı"\nassert abs(enlem - 38.4189) < 1e-9, "enlem 38.4189 olmalı"\nassert abs(boylam - 27.1287) < 1e-9, "boylam 27.1287 olmalı"\n',
      hints: ['Sol tarafa üç değişken, sağa demeti yaz.', 'ad, enlem, boylam = sube'],
      why: 'Açma, demetin elemanlarını sırayla sol taraftaki adlara dağıtır.' },
    { t: 'mc', q: '<code>t = (5)</code> ve <code>u = (5,)</code> ifadelerinin türleri sırasıyla nedir?',
      o: ['tuple ve tuple', 'int ve tuple', 'tuple ve int', 'int ve list'], a: 1,
      why: 'Demeti oluşturan şey virgüldür. (5) sadece parantezli bir sayıdır (int); (5,) ise tek elemanlı demettir.' },
    { t: 'code', id: 'demet-kume-2',
      q: '<p><code>benzersiz_sehirler(sehirler)</code> fonksiyonu yaz: tekrarlı şehir listesini alıp tekrarları kaldırılmış ve <b>alfabetik sıralı bir liste</b> döndürsün. Örnek: <code>["İzmir", "Ankara", "İzmir", "Bursa"]</code> → <code>["Ankara", "Bursa", "İzmir"]</code>.</p>',
      start: 'def benzersiz_sehirler(sehirler):\n    pass\n',
      sol: 'def benzersiz_sehirler(sehirler):\n    return sorted(set(sehirler))\n',
      tests: 'assert benzersiz_sehirler(["İzmir", "Ankara", "İzmir", "Bursa"]) == ["Ankara", "Bursa", "İzmir"], "tekrarsız ve sıralı olmalı"\nassert benzersiz_sehirler([]) == [], "boş liste için boş liste"\nassert benzersiz_sehirler(["A", "A", "A"]) == ["A"], "tek şehir"\n',
      hints: ['set() tekrarları kaldırır.', 'sorted(set(...)) sıralı liste verir.'],
      why: 'set benzersizleştirir, sorted hem sıralar hem de kümeyi listeye çevirir.' },
    { t: 'code', id: 'demet-kume-3',
      q: '<p>Ilgaz Bank müşteri grupları: <code>kredi_karti = {"M-101", "M-102", "M-103", "M-104"}</code> ve <code>mevduat = {"M-103", "M-104", "M-105"}</code>. Üç küme hesapla: <code>her_ikisi</code> (kesişim), <code>sadece_kart</code> (kartı olup mevduatı olmayanlar) ve <code>tum_musteriler</code> (birleşim).</p>',
      start: 'kredi_karti = {"M-101", "M-102", "M-103", "M-104"}\nmevduat = {"M-103", "M-104", "M-105"}\n# her_ikisi, sadece_kart, tum_musteriler\n',
      sol: 'kredi_karti = {"M-101", "M-102", "M-103", "M-104"}\nmevduat = {"M-103", "M-104", "M-105"}\nher_ikisi = kredi_karti & mevduat\nsadece_kart = kredi_karti - mevduat\ntum_musteriler = kredi_karti | mevduat\nprint(sorted(her_ikisi), sorted(sadece_kart), len(tum_musteriler))\n',
      tests: 'assert her_ikisi == {"M-103", "M-104"}, "her_ikisi kesişim olmalı"\nassert sadece_kart == {"M-101", "M-102"}, "sadece_kart fark olmalı"\nassert tum_musteriler == {"M-101", "M-102", "M-103", "M-104", "M-105"}, "tum_musteriler birleşim olmalı"\n',
      hints: ['& kesişim, - fark, | birleşim.', 'her_ikisi = kredi_karti & mevduat'],
      why: 'Küme operatörleri SQL JOIN ve EXCEPT mantığını tek karakterle verir.' },
    { t: 'mc', q: 'Aşağıdakilerden hangisi bir kümeye eleman olarak <b>eklenemez</b>?',
      o: ['"İzmir"', '(38.4, 27.1)', '[1, 2]', '42'], a: 2,
      why: 'Küme elemanları karma (hash) alabilen, yani değişmez nesneler olmalı. Liste değiştirilebilir olduğu için eklenemez; metin, demet ve sayı eklenebilir.' },
    { t: 'code', id: 'demet-kume-4',
      q: '<p><code>kaybedilen_musteriler(gecen_ay, bu_ay)</code> fonksiyonu yaz. İki parametre de müşteri numarası listesidir (tekrar içerebilir). Geçen ay alışveriş yapıp bu ay yapmayan müşterilerin <b>sıralı listesini</b> döndürsün.</p>',
      start: 'def kaybedilen_musteriler(gecen_ay, bu_ay):\n    pass\n',
      sol: 'def kaybedilen_musteriler(gecen_ay, bu_ay):\n    return sorted(set(gecen_ay) - set(bu_ay))\n',
      tests: 'assert kaybedilen_musteriler(["M-1", "M-2", "M-3", "M-2"], ["M-2", "M-4"]) == ["M-1", "M-3"], "M-1 ve M-3 kaybedildi"\nassert kaybedilen_musteriler(["M-1"], ["M-1"]) == [], "herkes kaldıysa boş liste"\nassert kaybedilen_musteriler([], ["M-9"]) == [], "geçen ay kimse yoksa boş"\n',
      hints: ['Listeleri set() ile kümeye çevir.', 'Fark işlemi: set(gecen_ay) - set(bu_ay)'],
      why: 'Fark işlemi, ilk kümede olup ikincide olmayanları verir; sorted sonucu sıralı listeye çevirir.' },
    { t: 'mc', q: 'Bir siparişin (kod, tarih, tutar) üçlüsünü saklamak için hangi yapı en uygundur?',
      o: ['Küme, çünkü hızlıdır', 'Liste, çünkü değiştirilebilir', 'Demet, çünkü yapı sabittir ve sözlük anahtarı olabilir', 'Metin'], a: 2,
      why: 'Eleman sayısı ve anlamı sabit olan kayıtlar için demet idealdir; yanlışlıkla değiştirilemez ve gerekirse sözlük anahtarı olur. Küme sırayı korumaz.' }
  ],
  faq: [
    { q: "Demet listeye göre ne avantaj sağlıyor, sadece değişmezlik mi?", a: "Değişmezlik en önemlisi: yanlışlıkla bozulmaz, sözlük anahtarı ve küme elemanı olabilir. Ayrıca biraz daha az bellek kullanır ve niyeti belli eder: bunu değiştirmeyeceğim." },
    { q: "Küme neden sırasız, listedeki sırayı koruyamaz mı?", a: "Küme elemanları karma değerine göre yerleştirilir; bu hız sağlar ama sırayı kaybeder. Sırayı koruyarak tekrarları kaldırmak için list(dict.fromkeys(liste)) hilesi kullanılır; sözlükler ekleme sırasını korur." },
    { q: "Boş küme nasıl oluşturulur?", a: "set() ile. {} yazarsan boş sözlük oluşur; bu, Python'da süslü parantezin önce sözlüğe ait olmasından kaynaklanır." }
  ],
  mistakes: [
    { bad: 'tek = (42)', good: 'tek = (42,)', why: 'Virgül olmadan parantez yalnızca gruplama yapar; tek elemanlı demet için virgül şart.' },
    { bad: 'bos = {}\nbos.add(1)', good: 'bos = set()\nbos.add(1)', why: '{} boş sözlüktür ve add metodu yoktur; boş küme set() ile oluşturulur.' },
    { bad: 'k = {1, 2, 3}\nprint(k[0])', good: 'k = {1, 2, 3}\nprint(sorted(k)[0])', why: 'Küme sırasızdır ve indekslenemez; sıralı erişim için önce listeye çevir.' },
    { bad: 'ad, enlem = ("Konak", 38.4, 27.1)', good: 'ad, enlem, boylam = ("Konak", 38.4, 27.1)', why: 'Açmada değişken sayısı eleman sayısına eşit olmalı; yoksa ValueError.' }
  ]
},

/* ───────────────────────── 9. sozlukler ───────────────────────── */
{
  id: 'sozlukler',
  lv: 'temel',
  mod: 'Veri Türleri',
  min: 26,
  title: 'Sözlükler (dict)',
  sum: 'Müşteri ve sipariş kayıtlarını anahtar-değer çiftleriyle tutar; get, items ve update ile güvenle okur-günceller; iç içe sözlükle JSON benzeri yapı kurar ve sayım kalıbını öğrenirsin.',
  goals: [
    'Sözlük oluşturup anahtarla değer okuyabilir, ekleyebilir ve silebilirim.',
    'get ile eksik anahtarı hatasız yönetebilir, keys/values/items ile içeriği gezebilirim.',
    'update ve yerinde atama ile kayıtları güncelleyebilirim.',
    'İç içe sözlükle müşteri-sipariş gibi hiyerarşik veriyi modelleyebilir, JSON ile ilişkisini açıklayabilirim.',
    'Sayım kalıbıyla bir listedeki değerlerin kaç kez geçtiğini bulabilirim.'
  ],
  body: `
<h2>İsimle erişmek</h2>
<p>Listeler dersinde bir siparişi <code>["AM-101", "İzmir", 1499.9]</code> diye tutmuştun. Üç ay sonra <code>siparis[2]</code> gördüğünde bunun tutar olduğunu hatırlayacak mısın? <b>Sözlük</b> (dictionary, dict) her değere bir <b>anahtar</b> (key) verir: <code>siparis["tutar"]</code>. Anadolu Market'in müşteri kaydı, Ilgaz Bank'ın hesap bilgisi, bir API'den dönen yanıt: iş dünyasındaki verinin büyük kısmı bu biçimdedir.</p>
<pre class="py">musteri = {
    "no": "M-101",
    "ad": "Ayşe Yılmaz",
    "sehir": "İzmir",
    "bakiye": 12500.0,
    "aktif": True,
}
print(musteri["ad"])
print(musteri["bakiye"] + 500)
print(len(musteri), "alan")
print(type(musteri))</pre>
<p>Süslü parantez içinde <code>anahtar: değer</code> çiftleri. Anahtar genelde metindir ama sayı ve demet de olabilir; değişmez olması yeter. Değer ise her şey olabilir: sayı, metin, liste, hatta başka bir sözlük. Python 3.7'den beri sözlük, anahtarların ekleme sırasını korur.</p>

<h2>Okuma: köşeli parantez mi get mi?</h2>
<p>Var olmayan anahtarı köşeli parantezle istersen KeyError alırsın. <code>get</code> ise bulamazsa <code>None</code> ya da senin verdiğin varsayılanı döndürür ve programı durdurmaz.</p>
<pre class="py">musteri = {"no": "M-101", "ad": "Ayşe Yılmaz", "sehir": "İzmir"}
print(musteri.get("sehir"))
print(musteri.get("telefon"))              # None
print(musteri.get("telefon", "kayıtlı değil"))
print("telefon" in musteri)                # anahtar var mı?
print("ad" in musteri)
try:
    print(musteri["telefon"])
except KeyError as hata:
    print("KeyError:", hata)</pre>
<p>Kural: anahtarın kesin var olduğunu biliyorsan köşeli parantez (hata alırsan bu gerçek bir sorundur ve görmek istersin). Eksik olabilecek alanlarda <code>get</code>. <code>in</code> operatörü sözlükte <b>anahtarları</b> arar, değerleri değil.</p>

<h2>Ekleme, güncelleme, silme</h2>
<pre class="py">hesap = {"no": "TR-5501", "bakiye": 10000}
hesap["sahip"] = "Mehmet Kaya"        # yeni anahtar ekle
hesap["bakiye"] = hesap["bakiye"] - 750   # değeri değiştir
hesap["bakiye"] += 2000               # kısayol
print(hesap)
hesap.update({"sube": "Konak", "bakiye": 11250})   # toplu güncelle
print(hesap)
silinen = hesap.pop("sube")           # anahtarı çıkar, değeri döndür
print(silinen, hesap)
del hesap["sahip"]
print(hesap)
print(hesap.pop("yok", "bulunamadı")) # varsayılanlı pop</pre>
<p>Aynı anahtara ikinci kez atama yapmak üzerine yazar; sözlükte anahtar tekrarı yoktur. <code>update</code> başka bir sözlükten alanları alır: var olanları günceller, olmayanları ekler. <code>pop</code> ve <code>del</code> siler; <code>pop</code> değeri geri verdiği için daha sık kullanılır.</p>
<div class="tbl-wrap"><table>
<tr><th>İşlem</th><th>Yazım</th><th>Eksik anahtarda</th></tr>
<tr><td>Oku</td><td><code>d["k"]</code></td><td>KeyError</td></tr>
<tr><td>Güvenli oku</td><td><code>d.get("k", varsayilan)</code></td><td>varsayılan döner</td></tr>
<tr><td>Ekle / güncelle</td><td><code>d["k"] = v</code></td><td>eklenir</td></tr>
<tr><td>Toplu güncelle</td><td><code>d.update(baska)</code></td><td>eklenir</td></tr>
<tr><td>Sil ve al</td><td><code>d.pop("k")</code></td><td>KeyError (varsayılan verilmezse)</td></tr>
<tr><td>Sil</td><td><code>del d["k"]</code></td><td>KeyError</td></tr>
<tr><td>Var mı?</td><td><code>"k" in d</code></td><td>False</td></tr>
</table></div>

<h2>keys, values, items</h2>
<p>Sözlüğün üç görünümü vardır: anahtarlar, değerler ve çiftler. Bunlar liste gibi gezilebilir; döngüler dersinde her gün kullanacaksın. Şimdilik listeye çevirip bakalım:</p>
<pre class="py">fiyatlar = {"kahve makinesi": 1499.9, "kalem": 2.5, "defter": 45}
print(list(fiyatlar.keys()))
print(list(fiyatlar.values()))
print(list(fiyatlar.items()))
print("Toplam:", sum(fiyatlar.values()))
print("En pahalı:", max(fiyatlar, key=fiyatlar.get))
urun, fiyat = list(fiyatlar.items())[0]     # demet açma!
print(urun, fiyat)</pre>
<p><code>items</code> her çifti bir demet olarak verir; demet açmayı öğrendiğin için <code>urun, fiyat = ...</code> yazabildin. <code>max(fiyatlar, key=fiyatlar.get)</code> kalıbı "değeri en büyük olan anahtarı bul" demektir ve raporlarda çok geçer.</p>

<h2>İç içe sözlük ve JSON'a hazırlık</h2>
<p>Bir müşterinin birden fazla siparişi, bir siparişin birden fazla ürünü var. Değer olarak liste ve sözlük kullanarak hiyerarşi kurarsın:</p>
<pre class="py">musteri = {
    "no": "M-101",
    "ad": "Ayşe Yılmaz",
    "adres": {"sehir": "İzmir", "ilce": "Konak", "posta": "35220"},
    "siparisler": [
        {"kod": "AM-101", "tutar": 1499.9, "teslim": True},
        {"kod": "AM-103", "tutar": 89.5, "teslim": False},
    ],
}
print(musteri["adres"]["sehir"])
print(musteri["siparisler"][0]["kod"])
print(musteri["siparisler"][-1]["teslim"])
musteri["adres"]["ilce"] = "Bornova"
musteri["siparisler"].append({"kod": "AM-110", "tutar": 250, "teslim": False})
print(len(musteri["siparisler"]), "sipariş")
import json
print(json.dumps(musteri, ensure_ascii=False, indent=2)[:80])</pre>
<p>Zincirleme köşeli parantez derinlere iner: önce adres sözlüğü, sonra içindeki şehir. Son satırlardaki <code>json</code> modülü bu yapıyı metne çevirir. <b>JSON</b>, web servislerinin ve yapılandırma dosyalarının ortak dilidir ve Python sözlüğüyle neredeyse birebir aynı görünür: süslü parantez, anahtar-değer, listeler. Sözlüğü iyi kavradıysan JSON'ı zaten biliyorsun; JSON ve CSV dersinde dosyadan okuyup yazacağız.</p>
<div class="warn"><b>Kopyalama tuzağı burada da var</b><code>yedek = musteri</code> kopya değildir; <code>musteri.copy()</code> ise yalnızca dış sözlüğü kopyalar, içindeki adres sözlüğü ve sipariş listesi paylaşılır. İç içe yapıyı tamamen kopyalamak için <code>copy.deepcopy</code> kullan.</div>

<h2>Sayım kalıbı</h2>
<p>Analistin en sık yazdığı kod parçalarından biri: bir listedeki her değerin kaç kez geçtiğini bulmak. Şehir bazlı sipariş adedi, ürün bazlı satış, hata türü bazlı log sayısı. Sözlük bunun için biçilmiş kaftan; anahtar değer, değer ise sayaç olur. Döngüyü henüz görmediğin için önce adım adım, sonra döngülü hâlini gösteriyorum:</p>
<pre class="py">sehirler = ["İzmir", "Ankara", "İzmir", "Bursa", "İzmir", "Ankara"]
sayim = {}
sayim["İzmir"] = sayim.get("İzmir", 0) + 1     # ilk kez: 0 + 1
sayim["Ankara"] = sayim.get("Ankara", 0) + 1
sayim["İzmir"] = sayim.get("İzmir", 0) + 1     # ikinci kez: 1 + 1
print(sayim)

sayim = {}
for sehir in sehirler:          # döngü: her şehir için aynı satır
    sayim[sehir] = sayim.get(sehir, 0) + 1
print(sayim)
print("En çok:", max(sayim, key=sayim.get))</pre>
<p>Kalıbın kalbi tek satır: <code>sayim[x] = sayim.get(x, 0) + 1</code>. <code>get</code>'in varsayılanı 0 olduğu için ilk karşılaşmada hata çıkmaz. Döngüler dersinde <code>for</code> satırını tam olarak anlayacaksın; şimdilik "listenin her elemanı için bu satırı çalıştır" diye oku. Aynı işi hazır yapan <code>collections.Counter</code> da var; Orta seviyede göreceksin.</p>
<div class="tip"><b>Gruplama kalıbı</b>Saymak yerine toplamak istersen aynı yapı çalışır: <code>toplam[sehir] = toplam.get(sehir, 0) + tutar</code>. Şehir bazlı ciro bu tek satırdır.</div>
<div class="note"><b>Anahtar olarak ne kullanmalı?</b>Metin, sayı ve demet anahtar olabilir; liste olamaz (değişebilir). "Şehir ve yıl" gibi bileşik anahtar için demet kullan: <code>ciro[("İzmir", 2025)]</code>.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Sözlük neden hızlı?</h3>
<p>Sözlük, kümeyle aynı karma tablo (hash table) yapısını kullanır. Anahtarın karması hesaplanır ve değer doğrudan o adreste aranır; sözlük bir milyon kayıt da tutsa okuma süresi değişmez. Listede "no'su M-101 olan müşteri" aramak baştan sona taramadır. Bu yüzden kayıtları numarayla erişilecekse liste değil sözlükte tut: <code>musteriler["M-101"]</code>.</p>
<h3>setdefault ve defaultdict</h3>
<p>Sayım kalıbındaki <code>get(x, 0)</code> yerine <code>sayim.setdefault(x, 0)</code> da yazılır; anahtar yoksa ekler ve değeri döndürür. Gruplama için <code>collections.defaultdict(list)</code> daha temizdir: <code>gruplar[sehir].append(siparis)</code> tek satırda, var mı diye bakmadan. Standart kütüphane dersinde bu araçları ayrıntılı ele alacağız.</p>
<h3>Veri modeli olarak sözlük: sınırlar</h3>
<p>Sözlük esnektir ama "ad" yerine yanlışlıkla "adi" yazarsan Python şikâyet etmez; sessizce yeni alan ekler. Büyük projelerde bu tür yazım hatalarını yakalamak için kayıtları <code>dataclass</code> ya da <code>TypedDict</code> ile tanımlarsın. Sözlük veri taşımak için, dataclass veri tanımlamak için. Orta seviyede bu ayrımı yaşayarak öğreneceksin.</p>
</section>
`,
  ex: [
    { t: 'code', id: 'sozlukler-1',
      q: '<p>Bir müşteri kaydı oluştur: <code>musteri</code> adlı sözlük şu anahtarları taşısın: <code>"no"</code> → <code>"M-101"</code>, <code>"ad"</code> → <code>"Ayşe Yılmaz"</code>, <code>"sehir"</code> → <code>"İzmir"</code>, <code>"bakiye"</code> → <code>12500.0</code>. Sonra <code>"telefon"</code> anahtarıyla <code>"0532 000 00 00"</code> ekle ve bakiyeyi 500 artır.</p>',
      start: 'musteri = {\n    # alanları yaz\n}\n# telefon ekle, bakiyeyi 500 artır\n',
      sol: 'musteri = {\n    "no": "M-101",\n    "ad": "Ayşe Yılmaz",\n    "sehir": "İzmir",\n    "bakiye": 12500.0,\n}\nmusteri["telefon"] = "0532 000 00 00"\nmusteri["bakiye"] += 500\nprint(musteri)\n',
      tests: 'assert musteri["no"] == "M-101" and musteri["ad"] == "Ayşe Yılmaz", "no ve ad alanları doğru olmalı"\nassert musteri["sehir"] == "İzmir", "sehir İzmir olmalı"\nassert musteri["telefon"] == "0532 000 00 00", "telefon anahtarı eklenmeli"\nassert abs(musteri["bakiye"] - 13000.0) < 1e-6, "bakiye 13000.0 olmalı"\nassert len(musteri) == 5, "sözlükte 5 anahtar olmalı"\n',
      hints: ['Yeni anahtar: musteri["telefon"] = "..."', 'Artırma: musteri["bakiye"] += 500'],
      why: 'Köşeli parantezle atama hem yeni anahtar ekler hem var olanı günceller.' },
    { t: 'mc', q: '<code>d = {"a": 1}</code> için <code>d.get("b", 0)</code> ve <code>d["b"]</code> sırasıyla ne verir?',
      o: ['0 ve None', '0 ve KeyError', 'None ve 0', 'KeyError ve KeyError'], a: 1,
      why: 'get varsayılan değeri (0) döndürür ve hata vermez; köşeli parantez eksik anahtarda KeyError fırlatır.' },
    { t: 'code', id: 'sozlukler-2',
      q: '<p><code>alan_getir(kayit, anahtar)</code> fonksiyonu yaz: sözlükte anahtar varsa değerini, yoksa <code>"bilinmiyor"</code> metnini döndürsün. <code>get</code> kullan; KeyError çıkmamalı.</p>',
      start: 'def alan_getir(kayit, anahtar):\n    pass\n',
      sol: 'def alan_getir(kayit, anahtar):\n    return kayit.get(anahtar, "bilinmiyor")\n',
      tests: 'm = {"ad": "Ayşe", "sehir": "İzmir"}\nassert alan_getir(m, "sehir") == "İzmir", "var olan anahtarın değeri dönmeli"\nassert alan_getir(m, "telefon") == "bilinmiyor", "eksik anahtar için bilinmiyor dönmeli"\nassert alan_getir({}, "x") == "bilinmiyor", "boş sözlükte de çalışmalı"\n',
      hints: ['kayit.get(anahtar, varsayilan)'],
      why: 'get, eksik anahtarda hata yerine varsayılanı döndürür; raporlarda eksik alanlar böyle yönetilir.' },
    { t: 'code', id: 'sozlukler-3',
      q: '<p>Fiyat listesi <code>fiyatlar = {"kahve makinesi": 1499.9, "kalem": 2.5, "defter": 45}</code>. <code>update</code> ile iki değişiklik uygula: <code>"kalem"</code> fiyatını <code>3.0</code> yap ve <code>"silgi"</code> ürününü <code>1.5</code> ile ekle. Sonra <code>toplam</code> değişkeninde tüm fiyatların toplamını, <code>en_pahali</code> değişkeninde en pahalı ürünün <b>adını</b> hesapla.</p>',
      start: 'fiyatlar = {"kahve makinesi": 1499.9, "kalem": 2.5, "defter": 45}\n# update, toplam, en_pahali\n',
      sol: 'fiyatlar = {"kahve makinesi": 1499.9, "kalem": 2.5, "defter": 45}\nfiyatlar.update({"kalem": 3.0, "silgi": 1.5})\ntoplam = sum(fiyatlar.values())\nen_pahali = max(fiyatlar, key=fiyatlar.get)\nprint(toplam, en_pahali)\n',
      tests: 'assert fiyatlar["kalem"] == 3.0 and fiyatlar["silgi"] == 1.5, "update ile kalem 3.0, silgi 1.5 olmalı"\nassert abs(toplam - 1549.4) < 1e-6, "toplam 1549.4 olmalı"\nassert en_pahali == "kahve makinesi", "en pahalı ürün adı kahve makinesi"\n',
      hints: ['fiyatlar.update({"kalem": 3.0, "silgi": 1.5})', 'max(fiyatlar, key=fiyatlar.get) değeri en büyük anahtarı verir.'],
      why: 'update toplu günceller; values toplamı ve key=fiyatlar.get kalıbı özet için standarttır.' },
    { t: 'mc', q: '<code>"İzmir" in musteri</code> ifadesi sözlükte neyi kontrol eder?',
      o: ['Değerler arasında "İzmir" var mı', 'Anahtarlar arasında "İzmir" var mı', 'Hem anahtar hem değerlerde', 'Sözlüğün adı "İzmir" mi'], a: 1,
      why: 'in operatörü sözlükte anahtarları arar. Değerlerde aramak için "İzmir" in musteri.values() yazılır.' },
    { t: 'code', id: 'sozlukler-4',
      q: '<p>İç içe müşteri kaydı verildi. Şu üç işi yap: <code>sehir</code> değişkenine adres içindeki şehri al; <code>ilk_kod</code> değişkenine ilk siparişin kodunu al; sipariş listesine <code>{"kod": "AM-110", "tutar": 250, "teslim": False}</code> sözlüğünü ekle.</p>',
      start: 'musteri = {\n    "no": "M-101",\n    "adres": {"sehir": "İzmir", "ilce": "Konak"},\n    "siparisler": [\n        {"kod": "AM-101", "tutar": 1499.9, "teslim": True},\n        {"kod": "AM-103", "tutar": 89.5, "teslim": False},\n    ],\n}\n# sehir, ilk_kod, yeni sipariş\n',
      sol: 'musteri = {\n    "no": "M-101",\n    "adres": {"sehir": "İzmir", "ilce": "Konak"},\n    "siparisler": [\n        {"kod": "AM-101", "tutar": 1499.9, "teslim": True},\n        {"kod": "AM-103", "tutar": 89.5, "teslim": False},\n    ],\n}\nsehir = musteri["adres"]["sehir"]\nilk_kod = musteri["siparisler"][0]["kod"]\nmusteri["siparisler"].append({"kod": "AM-110", "tutar": 250, "teslim": False})\nprint(sehir, ilk_kod, len(musteri["siparisler"]))\n',
      tests: 'assert sehir == "İzmir", "sehir İzmir olmalı"\nassert ilk_kod == "AM-101", "ilk_kod AM-101 olmalı"\nassert len(musteri["siparisler"]) == 3, "sipariş listesi 3 elemanlı olmalı"\nassert musteri["siparisler"][2]["kod"] == "AM-110", "yeni siparişin kodu AM-110 olmalı"\n',
      hints: ['musteri["adres"]["sehir"] zincirleme erişim.', 'Liste değerine append yapabilirsin.'],
      why: 'Zincirleme köşeli parantez iç yapıya iner; iç liste değiştirilebilir olduğundan append doğrudan çalışır.' },
    { t: 'code', id: 'sozlukler-5',
      q: '<p><code>sayim(degerler)</code> fonksiyonu yaz: bir liste alıp her değerin kaç kez geçtiğini sözlük olarak döndürsün. Sayım kalıbını kullan: <code>sonuc[x] = sonuc.get(x, 0) + 1</code>. Örnek: <code>["İzmir", "Ankara", "İzmir"]</code> → <code>{"İzmir": 2, "Ankara": 1}</code>.</p>',
      start: 'def sayim(degerler):\n    sonuc = {}\n    for deger in degerler:\n        # kalıbı uygula\n        pass\n    return sonuc\n',
      sol: 'def sayim(degerler):\n    sonuc = {}\n    for deger in degerler:\n        sonuc[deger] = sonuc.get(deger, 0) + 1\n    return sonuc\n',
      tests: 'assert sayim(["İzmir", "Ankara", "İzmir"]) == {"İzmir": 2, "Ankara": 1}, "İzmir 2, Ankara 1 olmalı"\nassert sayim([]) == {}, "boş liste için boş sözlük"\nassert sayim(["a", "a", "a", "b"]) == {"a": 3, "b": 1}, "a 3, b 1 olmalı"\n',
      hints: ['get(deger, 0) ilk karşılaşmada 0 verir.', 'sonuc[deger] = sonuc.get(deger, 0) + 1'],
      why: 'get ile varsayılan 0, eksik anahtar hatasını önler; her tekrar sayacı bir artırır.' },
    { t: 'mc', q: 'Aşağıdakilerden hangisi sözlük anahtarı olarak <b>kullanılamaz</b>?',
      o: ['("İzmir", 2025)', '"M-101"', '["İzmir", 2025]', '2025'], a: 2,
      why: 'Anahtar değişmez (hashable) olmalıdır. Liste değiştirilebilir olduğu için anahtar olamaz; demet, metin ve sayı olabilir.' }
  ],
  faq: [
    { q: "Sözlükte sıra var mı?", a: "Python 3.7 ve sonrasında sözlük, anahtarların eklenme sırasını korur. Yine de sözlüğü sıraya göre değil anahtara göre kullanmak için tasarla; sıralama gerekiyorsa sorted(d.items()) kullan." },
    { q: "Sözlük ile JSON aynı şey mi?", a: "Görünüşte çok benzer ama JSON bir metin biçimidir, sözlük bir Python nesnesidir. json.dumps sözlüğü JSON metnine, json.loads JSON metnini sözlüğe çevirir. JSON'da anahtarlar yalnızca metin olabilir ve True yerine true yazılır." },
    { q: "Anahtar yoksa hata almak mı yoksa get kullanmak mı daha iyi?", a: "Anahtarın kesinlikle olması gerekiyorsa köşeli parantez kullan; hata, bir veri sorununu erken gösterir. Alan isteğe bağlıysa (telefon, ikinci adres) get ile varsayılan ver." }
  ],
  mistakes: [
    { bad: 'telefon = musteri["telefon"]', good: 'telefon = musteri.get("telefon", "yok")', why: 'İsteğe bağlı alanlarda köşeli parantez KeyError verir; get varsayılanla devam eder.' },
    { bad: 'sayim[sehir] = sayim[sehir] + 1', good: 'sayim[sehir] = sayim.get(sehir, 0) + 1', why: 'İlk karşılaşmada anahtar yoktur ve KeyError çıkar; get(…, 0) bunu önler.' },
    { bad: 'ciro[["İzmir", 2025]] = 1500', good: 'ciro[("İzmir", 2025)] = 1500', why: 'Liste anahtar olamaz (değişebilir); bileşik anahtar için demet kullan.' },
    { bad: 'yedek = musteri\nyedek["ad"] = "X"', good: 'import copy\nyedek = copy.deepcopy(musteri)\nyedek["ad"] = "X"', why: 'Atama kopya değildir; iç içe sözlükte tam bağımsız kopya için deepcopy gerekir.' }
  ]
}
);
})(window);
