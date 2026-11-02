/* Kesit Python — 'listeler' dersi uzantısı (Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'listeler',
    min: 25,
    html: `<p>Demet ve küme <b>Demetler ve kümeler</b>, iç içe veri yapıları <b>İç içe veri</b>, tek satırda liste üretme ise Orta seviyedeki <b>Kapsamlı ifadeler</b> dersinde. Bu bölüm listenin kendisini derinleştiriyor: dilimle değiştirme, yıldızlı açma, anahtarla sıralama, en sık tuzaklar ve hangi işlemin ne kadar pahalı olduğu.</p><h2>Dilimle okuma, dilimle yazma</h2><p>Dilim yalnızca okumak için değildir; bir dilime atama yaparak listenin bir bölümünü tek seferde değiştirebilir, silebilir ya da araya eleman ekleyebilirsin. Üçüncü parametre olan adım da listelerde metinlerdeki gibi çalışır.</p><pre class="py">kuyruk = ["AM-101", "AM-102", "AM-103", "AM-104", "AM-105", "AM-106"]
print(kuyruk[::2])          # ikide bir: tek sıradakiler
print(kuyruk[::-1])         # ters sıra (yeni liste)
print(kuyruk[-3:])          # son üç

kuyruk[1:3] = ["AM-102-D"]  # iki elemanı bir elemanla değiştir
print(kuyruk)
kuyruk[1:1] = ["ACIL-1", "ACIL-2"]   # araya ekle (hiçbir şey silmeden)
print(kuyruk)
del kuyruk[-2:]             # son ikisini sil
print(kuyruk, len(kuyruk))
kuyruk.clear()              # tamamını boşalt (aynı liste nesnesi)
print(kuyruk)</pre><p>Dilime atamada sağ tarafın uzunluğu dilimle aynı olmak zorunda değildir; liste kendiliğinden büyür ya da küçülür. <code>del liste[i]</code> tek elemanı, <code>del liste[a:b]</code> bir aralığı siler. <code>clear()</code> ile <code>liste = []</code> arasındaki fark ise kopyalama tuzağıyla ilgilidir: <code>clear</code> aynı nesneyi boşaltır, dolayısıyla o listeyi gösteren diğer adlar da boş listeyi görür; <code>= []</code> ise yalnızca bu adı yeni bir listeye taşır.</p><h2>Liste oluşturmanın yolları ve yıldızlı açma</h2><pre class="py">sira_no = list(range(1, 6))           # [1, 2, 3, 4, 5]
harfler = list("ABC")                 # her karakter bir eleman
sehirler = "İzmir;Ankara;Bursa".split(";")
bos = [0] * 4
print(sira_no, harfler, sehirler, bos)

ilk, *orta, son = [120, 340, 95, 410, 60]
print(ilk, orta, son)
basliklar, *veri = ["ad,tutar", "Ayşe,120", "Ali,95"]
print(basliklar, "|", veri)
print(*sehirler, sep=" &gt; ")           # listeyi argümanlara aç</pre><p>Yıldızlı ad (<code>*orta</code>) "geri kalan her şeyi bir listede topla" demektir; kalan yoksa boş liste olur. CSV'de başlık satırını veriden ayırmak gibi işlerde çok okunur bir kalıptır. Fonksiyon çağrısında <code>*liste</code> ise ters yönde çalışır ve elemanları ayrı ayrı argüman olarak verir.</p><h2>Anahtarla sıralama: key</h2><p><code>sort</code>, <code>sorted</code>, <code>min</code> ve <code>max</code> bir <code>key</code> fonksiyonu alabilir. Python her elemanı bu fonksiyondan geçirir ve karşılaştırmayı sonuca göre yapar; elemanların kendisi değişmez. Henüz kendi fonksiyonunu yazmadan da hazır fonksiyonlarla çok şey yaparsın:</p><pre class="py">urunler = ["Çay", "Kahve Makinesi", "Su", "Filtre Kahve"]
print(sorted(urunler, key=len))               # kısadan uzuna
print(max(urunler, key=len), min(urunler, key=len))
farklar = [-120, 45, -15, 300, -310]
print(sorted(farklar, key=abs))               # mutlak değere göre
print(max(farklar, key=abs))                  # en büyük sapma
etiketler = ["b-ürün", "A-ürün", "c-ürün"]
print(sorted(etiketler), sorted(etiketler, key=str.lower))
print(list(reversed(urunler)))                # ters sırada yeni liste</pre><p>Python'ın sıralaması <b>kararlıdır</b> (stable): anahtarları eşit olan elemanlar, orijinal sıralarını korur. Yukarıda "Çay" ve "Su" ikisi de kısa ama "Su" daha kısa olduğu için önce gelir; uzunluğu eşit olsaydı listedeki sırayla dizilirlerdi. Birden çok ölçüte göre sıralamayı (önce şehir, sonra tutar) fonksiyonlar dersinden sonra <code>lambda</code> ve demet anahtarlarla yapacaksın.</p><h2>Çarpmayla iç içe liste tuzağı</h2><p><code>[0] * 4</code> güvenlidir çünkü 0 değiştirilemez. Ama <code>[[0] * 3] * 2</code> yazdığında dış liste <b>aynı iç listeyi</b> iki kez içerir; birini değiştirince hepsi değişir. Tablo kurarken her satır için yeni bir liste oluşturman gerekir:</p><pre class="py">yanlis = [[0] * 3] * 2
yanlis[0][0] = 99
print(yanlis)                     # iki satır birden değişti
print(yanlis[0] is yanlis[1])

dogru = [[0] * 3 for _ in range(2)]   # her satır ayrı liste
dogru[0][0] = 99
print(dogru)
print(dogru[0] is dogru[1])</pre><p>İkinci yazımdaki <code>for _ in range(2)</code> kısmı bir liste kavrayışıdır (list comprehension); döngüleri öğrendikten sonra tam olarak ne yaptığını anlayacaksın. Şimdilik kalıp olarak bil: "her satır için yeni <code>[0] * 3</code> üret".</p><h2>Hangi işlem ne kadar pahalı?</h2><p>Liste, elemanları bellekte art arda tutan bir dizidir. Bu yüzden sondaki işlemler ucuz, baştaki ve ortadaki işlemler pahalıdır: başa eleman eklemek, diğer bütün elemanları bir kaydırmayı gerektirir. Algoritmalar dersinde bunu büyük O gösterimiyle (Big O) tartışacağız; şimdilik tabloyu tanı:</p><div class="tbl-wrap"><table><tr><th>İşlem</th><th>Maliyet</th><th>Açıklama</th></tr><tr><td><code>liste[i]</code>, <code>liste[i] = x</code></td><td>Sabit, O(1)</td><td>Listenin boyundan bağımsız</td></tr><tr><td><code>append(x)</code>, <code>pop()</code></td><td>Sabit, O(1)</td><td>Sondan ekle/çıkar</td></tr><tr><td><code>len(liste)</code></td><td>Sabit, O(1)</td><td>Uzunluk saklanır, sayılmaz</td></tr><tr><td><code>insert(0, x)</code>, <code>pop(0)</code></td><td>Doğrusal, O(n)</td><td>Tüm elemanlar kayar</td></tr><tr><td><code>x in liste</code>, <code>index</code>, <code>count</code>, <code>remove</code></td><td>Doğrusal, O(n)</td><td>Baştan sona tarama</td></tr><tr><td><code>liste[a:b]</code>, <code>copy()</code></td><td>Dilim boyu kadar</td><td>Yeni liste oluşturur</td></tr><tr><td><code>sort()</code>, <code>sorted()</code></td><td>O(n log n)</td><td>Çok verimli Timsort algoritması</td></tr></table></div><div class="tip"><b>Yüz bin elemanda fark eder</b>On elemanlı bir listede bu tablonun hiçbir önemi yok. Ama 100.000 müşteri numarasında <code>in</code> ile arama yapan bir döngü saniyeler sürer, aynı iş kümeyle (set) anında biter. Kuyruk gibi iki uçtan çalışan yapılar için <code>collections.deque</code> vardır. Önce doğru çalışan kodu yaz, yavaşlık görürsen bu tabloya dön.</div><div class="note"><b>Gerçek işte</b>Web uygulamaları ve API'ler sonuçları sayfa sayfa döndürür: "2. sayfa, sayfa başına 20 kayıt". Bunun arkasında tam olarak dilimleme vardır: <code>kayitlar[(sayfa - 1) * boyut : sayfa * boyut]</code>. Dilim sınırları aşınca hata yerine boş liste döndüğü için son sayfanın ötesine geçen istekler de kendiliğinden güvenli olur. Veritabanında aynı iş <code>LIMIT</code> ve <code>OFFSET</code> ile, pandas'ta <code>df.iloc[a:b]</code> ile yapılır; mantık birebir aynıdır.</div>`,
    ex: [
      {
        t: 'mc',
        id: 'listeler-x1',
        stage: 'Isınma',
        q: '100.000 elemanlı bir listede aşağıdaki işlemlerden hangisi en yavaştır?',
        o: [
          '<code>liste.append(x)</code> ile sona yeni eleman eklemek',
          '<code>liste.pop(0)</code> ile baştaki elemanı çıkarmak',
          '<code>liste[-1]</code> ile son elemanı okumak',
          '<code>len(liste)</code> ile eleman sayısını almak'
        ],
        a: 1,
        why: 'pop(0) baştaki elemanı çıkarınca kalan 99.999 elemanın hepsi bir sola kaydırılır (O(n)). append, son elemana erişim ve len listenin boyundan bağımsız, sabit sürelidir. Baştan sık çıkarma yapıyorsan collections.deque kullan.'
      },
      {
        t: 'predict',
        id: 'listeler-x2',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'ilk, *orta, son = [10, 20, 30, 40]\nprint(ilk, orta, son)\n',
        o: ['10 [20, 30] 40', '10 20 30 40', '10 (20, 30) 40', '10 [20, 30, 40] 40'],
        a: 0,
        why: 'Yıldızlı ad, ilk ve son atandıktan sonra kalan elemanları her zaman bir LİSTE olarak toplar; demet değil.'
      },
      {
        t: 'predict',
        id: 'listeler-x3',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'tablo = [[0] * 2] * 3\ntablo[0][0] = 5\nprint(tablo)\n',
        o: ['[[5, 0], [5, 0], [5, 0]]', '[[5, 0], [0, 0], [0, 0]]', '[[5, 5], [0, 0], [0, 0]]', '[[5, 0, 0, 0, 0, 0]]'],
        a: 0,
        why: 'Dış listeyi * 3 ile çoğaltmak iç listeyi kopyalamaz; üç eleman da aynı [0, 0] nesnesini gösterir. Birinin ilk elemanını değiştirince üçünde de görünür.'
      },
      {
        t: 'predict',
        id: 'listeler-x4',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'a = [5, 1, 4, 2, 3]\na[1:3] = []\nprint(a, a[::-2])\n',
        o: ['[5, 2, 3] [3, 5]', '[5, 4, 2, 3] [3, 4]', '[5, 2, 3] [3, 2, 5]', '[2, 3] [3]'],
        a: 0,
        why: 'a[1:3] = [] 1 ve 2. indeksteki (1 ve 4) elemanları siler: [5, 2, 3]. [::-2] sondan başlayıp ikişer geri gider: 3, sonra 5.'
      },
      {
        t: 'order',
        id: 'listeler-x5',
        stage: 'Kodu oku',
        q: '<p>Sipariş kuyruğunu düzenleyen satırları sırala. İkinci sıradaki sipariş iptal edilip "-R" ekiyle en başa alınacak, sonra ilk iki sipariş yazdırılacak. Beklenen çıktı:</p><pre class="out">[\'AM-2-R\', \'AM-1\', \'AM-3\', \'AM-4\', \'AM-5\'] [\'AM-2-R\', \'AM-1\']</pre>',
        lines: ['siparisler = ["AM-1", "AM-2", "AM-3", "AM-4", "AM-5"]', 'iptal = siparisler.pop(1)', 'siparisler.insert(0, iptal + "-R")', 'ilk_iki = siparisler[:2]', 'print(siparisler, ilk_iki)'],
        expect: '[\'AM-2-R\', \'AM-1\', \'AM-3\', \'AM-4\', \'AM-5\'] [\'AM-2-R\', \'AM-1\']\n',
        hint: 'pop çıkardığı elemanı döndürür; insert onu kullanmadan önce çıkarılmış olmalı. ilk_iki ise son hâlden alınmalı.',
        why: 'pop(1) "AM-2"yi çıkarıp döndürür, insert(0, ...) onu "-R" ekiyle başa koyar. Dilim, ancak liste son hâlini aldıktan sonra alınırsa beklenen ilk iki elemanı verir.'
      },
      {
        t: 'code',
        id: 'listeler-x6',
        stage: 'Rehberli',
        diff: 1,
        q: '<p>API için sayfalama fonksiyonu yaz: <code>sayfa(kayitlar, no, boyut=10)</code>, <code>no</code>. sayfadaki kayıtları (1\'den başlayarak) yeni bir liste olarak döndürsün. Son sayfa eksik olabilir; var olmayan bir sayfa için boş liste dönmeli.</p>',
        guide: ['Sayfanın başlangıç indeksini hesapla: (no - 1) * boyut.', 'Bitiş indeksi: no * boyut (dilimde bitiş hariçtir).', 'kayitlar[baslangic:bitis] dilimini döndür; sınır aşılırsa dilim kendiliğinden kısalır.'],
        example: 'gunler = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]\nhafta_ici = gunler[0:5]\nhafta_sonu = gunler[5:10]\nprint(hafta_ici, hafta_sonu)\n',
        start: 'def sayfa(kayitlar, no, boyut=10):\n    # TODO: başlangıç ve bitiş indekslerini hesapla\n    baslangic = 0\n    bitis = boyut\n    # TODO: dilimi döndür\n    return kayitlar[baslangic:bitis]\n',
        sol: 'def sayfa(kayitlar, no, boyut=10):\n    baslangic = (no - 1) * boyut\n    bitis = no * boyut\n    return kayitlar[baslangic:bitis]\n',
        tests: 'veri = list(range(1, 24))\nassert sayfa(veri, 1) == list(range(1, 11)), "1. sayfa 1..10 olmalı"\nassert sayfa(veri, 2) == list(range(11, 21)), "2. sayfa 11..20 olmalı"\nassert sayfa(veri, 3) == [21, 22, 23], "Son sayfa eksik olabilir"\nassert sayfa(veri, 4) == [], "Var olmayan sayfa boş liste döndürmeli"\nassert sayfa(veri, 2, boyut=5) == [6, 7, 8, 9, 10], "boyut parametresi dikkate alınmalı"\n',
        hints: ['Sayfa numarası 1\'den, indeks 0\'dan başlar; aradaki fark (no - 1).', 'Dilim sınırı aşınca hata vermez, eldekini verir.', 'return kayitlar[(no - 1) * boyut : no * boyut]'],
        why: 'Sayfalama, dilimlemenin en yaygın gerçek kullanımıdır. Dilimin sınır aşımında hata yerine boş ya da kısa liste döndürmesi, son sayfa ve ötesi için ayrı kontrol yazmanı gereksiz kılar.'
      },
      {
        t: 'code',
        id: 'listeler-x7',
        stage: 'Rehberli',
        diff: 1,
        q: '<p>Ürün adlarından oluşan bir listede etiket basımı için en kısa ve en uzun adı bul. <code>ad_uclari(urunler)</code> fonksiyonu <code>(en_kisa, en_uzun)</code> demeti döndürsün. Eşit uzunlukta birden çok ad varsa listede önce geleni seç. Örnek: <code>["Çay", "Kahve Makinesi", "Su", "Filtre Kahve"]</code> → <code>("Su", "Kahve Makinesi")</code>.</p>',
        guide: ['min ve max fonksiyonları key parametresi alır.', 'key=len, karşılaştırmayı adın uzunluğuna göre yaptırır.', 'İkisini bir demet olarak döndür.'],
        example: 'sayilar = [-7, 3, -12, 5]\nprint(min(sayilar, key=abs), max(sayilar, key=abs))\n',
        start: 'def ad_uclari(urunler):\n    # TODO: uzunluğa göre en kısa ve en uzun adı bul\n    en_kisa = min(urunler)\n    en_uzun = max(urunler)\n    return (en_kisa, en_uzun)\n',
        sol: 'def ad_uclari(urunler):\n    en_kisa = min(urunler, key=len)\n    en_uzun = max(urunler, key=len)\n    return (en_kisa, en_uzun)\n',
        tests: 'assert ad_uclari(["Çay", "Kahve Makinesi", "Su", "Filtre Kahve"]) == ("Su", "Kahve Makinesi"), "Uzunluğa göre seçilmeli, alfabeye göre değil"\nassert ad_uclari(["abc", "xyz", "pq"]) == ("pq", "abc"), "Eşit uzunlukta listede önce gelen seçilmeli"\nassert ad_uclari(["Tek"]) == ("Tek", "Tek"), "Tek elemanlı listede ikisi de aynı"\n',
        hints: ['min(urunler) alfabetik olarak en küçüğü verir.', 'key=len uzunluğa göre karşılaştırır.', 'min(urunler, key=len), max(urunler, key=len)'],
        why: 'key, elemanları değiştirmeden karşılaştırma ölçütünü değiştirir. min ve max eşitlik durumunda ilk karşılaştıkları elemanı döndürür; bu da "listede önce gelen" kuralını kendiliğinden sağlar.'
      },
      {
        t: 'code',
        id: 'listeler-x8',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Depo raf planı için <code>raf_tablosu(satir, sutun, dolgu=0)</code> fonksiyonunu yaz: <code>satir</code> × <code>sutun</code> boyutunda, her hücresi <code>dolgu</code> olan iç içe bir liste döndürsün. Satırlar birbirinden <b>bağımsız</b> olmalı: bir hücreyi değiştirmek diğer satırları etkilememeli.</p>',
        guide: ['Tek bir satır [dolgu] * sutun ile kurulur.', '[satir_listesi] * satir yazmak satırları paylaştırır; bu tuzaktan kaçın.', 'Her satır için yeni liste üret: [[dolgu] * sutun for _ in range(satir)]'],
        example: 'haftalar = [["-"] * 2 for _ in range(3)]\nhaftalar[0][1] = "X"\nprint(haftalar)\n',
        start: 'def raf_tablosu(satir, sutun, dolgu=0):\n    # TODO: satırlar bağımsız olmalı!\n    return [[dolgu] * sutun] * satir\n',
        sol: 'def raf_tablosu(satir, sutun, dolgu=0):\n    return [[dolgu] * sutun for _ in range(satir)]\n',
        tests: 't = raf_tablosu(3, 2)\nassert t == [[0, 0], [0, 0], [0, 0]], "3 satır, 2 sütun, hepsi 0"\nt[0][0] = 9\nassert t[1][0] == 0 and t[2][0] == 0, "Bir hücreyi değiştirmek diğer satırları etkilememeli"\nassert raf_tablosu(1, 3, "-") == [["-", "-", "-"]], "dolgu parametresi kullanılmalı"\nassert raf_tablosu(0, 4) == [], "0 satır boş liste"\n',
        hints: ['Dış listeyi * ile çoğaltmak iç listeyi kopyalamaz.', 'Her satır için ayrı [dolgu] * sutun ifadesi çalışmalı.', 'return [[dolgu] * sutun for _ in range(satir)]'],
        why: 'Liste kavrayışı her turda ifadeyi yeniden değerlendirir, dolayısıyla her satır kendi listesini alır. [[...]] * n ise aynı iç listeye n referans üretir.'
      },
      {
        t: 'code',
        id: 'listeler-x9',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p><code>son_n(liste, n)</code> fonksiyonunu yaz: listenin son <code>n</code> elemanını yeni bir liste olarak döndürsün. <code>n</code> sıfırsa boş liste, listenin uzunluğundan büyükse tüm liste dönmeli. Dikkat: <code>liste[-0:]</code> tüm listeyi verir!</p>',
        sol: 'def son_n(liste, n):\n    if n <= 0:\n        return []\n    return liste[-n:]\n',
        tests: 'assert son_n([1, 2, 3, 4, 5], 2) == [4, 5], "Son 2 eleman"\nassert son_n([1, 2, 3], 0) == [], "n=0 boş liste döndürmeli; -0 sıfırdır ve [-0:] tüm listeyi verir"\nassert son_n([1, 2, 3], 10) == [1, 2, 3], "n listeden büyükse tüm liste"\nassert son_n([], 3) == [], "Boş liste"\nl = [1, 2]\nassert son_n(l, 2) is not l, "Yeni bir liste dönmeli"\n',
        hints: ['-0 ile 0 aynı sayıdır; liste[0:] tüm listeyi verir.', 'n <= 0 durumunu ayrıca ele al, sonra liste[-n:] döndür.'],
        why: 'Negatif dilim sınırı sondan sayar, ama -0 sıfıra eşittir ve [0:] baştan başlar. Bu kenar durumu ayrıca ele almak gerekir. Dilim her zaman yeni liste döndürdüğü için orijinal korunur.'
      },
      {
        t: 'code',
        id: 'listeler-x10',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Bu fonksiyon her çağrıda yeni bir sipariş kuyruğu başlatmalı, ama ikinci çağrıda önceki siparişler de kuyrukta görünüyor. <b>Hatayı bul ve düzelt.</b></p>',
        start: 'def kuyruga_ekle(siparis, kuyruk=[]):\n    kuyruk.append(siparis)\n    return kuyruk\n',
        sol: 'def kuyruga_ekle(siparis, kuyruk=None):\n    if kuyruk is None:\n        kuyruk = []\n    kuyruk.append(siparis)\n    return kuyruk\n',
        tests: 'assert kuyruga_ekle("AM-1") == ["AM-1"], "İlk çağrı tek elemanlı kuyruk"\nassert kuyruga_ekle("AM-2") == ["AM-2"], "İkinci çağrı önceki siparişi içermemeli: varsayılan liste paylaşılıyor"\nmevcut = ["AM-9"]\nassert kuyruga_ekle("AM-10", mevcut) == ["AM-9", "AM-10"], "Verilen kuyruğa eklemeli"\n',
        hints: ['Varsayılan değer fonksiyon tanımlanırken bir kez oluşturulur.', 'Aynı [] her çağrıda yeniden kullanılır ve append onu büyütür.', 'Varsayılanı None yap, fonksiyonun içinde yeni liste oluştur.'],
        why: 'Varsayılan parametre değerleri def satırı çalıştığında bir kez değerlendirilir. Değiştirilebilir bir varsayılan (liste, sözlük) bütün çağrılar arasında paylaşılır. Standart çözüm None varsayılanı ve fonksiyon içinde yeni nesne oluşturmaktır.'
      },
      {
        t: 'code',
        id: 'listeler-x11',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Teslim sürelerinin ortanca (medyan) değerini bulan fonksiyon <code>TypeError</code> veriyor; düzeltildiğinde de bazen yanlış değer döndürüyor. <b>Hataları bul ve düzelt.</b> Tek sayıda eleman için sıralanmış listenin ortasındaki eleman, çift sayıda için ortadaki iki elemanın ortalaması döndürülsün. Orijinal liste değişmemeli.</p>',
        start: 'def ortanca(sureler):\n    sureler.sort()\n    orta = len(sureler) / 2\n    return sureler[orta]\n',
        sol: 'def ortanca(sureler):\n    sirali = sorted(sureler)\n    n = len(sirali)\n    orta = n // 2\n    if n % 2 == 1:\n        return sirali[orta]\n    return (sirali[orta - 1] + sirali[orta]) / 2\n',
        tests: 'assert ortanca([5, 1, 3]) == 3, "Tek sayıda: sıralı listenin ortası"\nassert ortanca([4, 1, 3, 2]) == 2.5, "Çift sayıda: ortadaki iki değerin ortalaması"\nl = [9, 2, 7]\nortanca(l)\nassert l == [9, 2, 7], "Orijinal liste değişmemeli: sort yerine sorted kullan"\nassert ortanca([42]) == 42, "Tek eleman"\n',
        hints: ['Liste indeksi tam sayı olmalı; / her zaman float verir.', 'sort() çağıranın listesini yerinde değiştirir.', 'Çift uzunlukta iki ortadaki elemanı (orta - 1 ve orta) kullan.'],
        why: '/ float döndürür ve liste indeksi float olamaz (TypeError); // gerekir. sort() listeyi yerinde değiştirdiği için çağıranın verisi bozulur; sorted() yeni liste verir. Çift uzunluk durumu ise ortancanın tanımı gereği ayrıca ele alınmalıdır.'
      },
      {
        t: 'code',
        id: 'listeler-x12',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Vardiya çizelgesinde personel listesini döndürmek gerekiyor. <code>dondur(liste, k)</code> fonksiyonu listeyi sağa doğru <code>k</code> adım döndürsün ve yeni bir liste döndürsün: <code>dondur([1, 2, 3, 4, 5], 2)</code> → <code>[4, 5, 1, 2, 3]</code>. Negatif <code>k</code> sola döndürür, <code>k</code> listenin uzunluğundan büyük olabilir, boş liste boş döner. Döngü kullanmadan, dilimlemeyle çöz.</p>',
        sol: 'def dondur(liste, k):\n    if not liste:\n        return []\n    k = k % len(liste)\n    return liste[-k:] + liste[:-k] if k else liste[:]\n',
        tests: 'assert dondur([1, 2, 3, 4, 5], 2) == [4, 5, 1, 2, 3], "Sağa 2 adım"\nassert dondur([1, 2, 3, 4, 5], 7) == [4, 5, 1, 2, 3], "7 adım, 5 elemanda 2 adımla aynıdır"\nassert dondur([1, 2, 3, 4, 5], -1) == [2, 3, 4, 5, 1], "Negatif k sola döndürür"\nassert dondur([1, 2, 3], 3) == [1, 2, 3], "Uzunluk kadar döndürmek listeyi değiştirmez (-0 tuzağı!)"\nassert dondur([], 4) == [], "Boş liste"\nl = [1, 2]\nassert dondur(l, 0) is not l, "Her zaman yeni liste dönmeli"\n',
        hints: [
          'k % len(liste) hem büyük k\'yı hem negatif k\'yı 0..n-1 aralığına indirir.',
          'Sağa k döndürmek: son k eleman + geri kalanlar → liste[-k:] + liste[:-k]',
          'k sıfır olunca [-0:] tüm listeyi, [:-0] boş listeyi verir; bu durumu ayrıca ele al.'
        ],
        why: 'Mod alma döndürme miktarını normalize eder (Python\'da % sonucu bölenin işaretini aldığı için negatif k da doğru çalışır). İki dilimin birleşimi döndürmeyi O(n) sürede yapar. k = 0 kenar durumu, -0 dilim tuzağı yüzünden ayrıca ele alınır.'
      }
    ],
    faq: [
      {
        q: 'liste.clear() ile liste = [] arasındaki fark ne?',
        a: 'clear() mevcut liste nesnesini yerinde boşaltır; aynı listeyi gösteren başka değişkenler de boş listeyi görür. liste = [] ise yalnızca bu adı yeni, boş bir listeye bağlar; eski liste başka bir yerden gösteriliyorsa içeriğiyle birlikte orada kalır. Listeyi paylaşan herkesin boş görmesini istiyorsan clear, yalnızca kendi değişkenini sıfırlamak istiyorsan = [].'
      },
      {
        q: 'reversed(liste), liste[::-1] ve liste.reverse() arasındaki fark ne?',
        a: 'liste.reverse() yerinde ters çevirir ve None döndürür. liste[::-1] ters sıralı yeni bir liste oluşturur. reversed(liste) ise liste değil, elemanları tersten veren bir yineleyici (iterator) döndürür; döngüde kullanmak için bellek dostudur, liste olarak görmek için list(reversed(liste)) yazarsın.'
      }
    ],
    mistakes: [
      {
        bad: 'tablo = [[0] * 3] * 4\ntablo[0][1] = 5   # 4 satır birden değişir',
        good: 'tablo = [[0] * 3 for _ in range(4)]\ntablo[0][1] = 5',
        why: 'Dış listeyi * ile çoğaltmak iç listenin referansını çoğaltır; tüm satırlar aynı nesnedir. Her satır için yeni liste üret.'
      },
      {
        bad: 'orta = sureler[len(sureler) / 2]',
        good: 'orta = sureler[len(sureler) // 2]',
        why: '/ her zaman float döndürür ve liste indeksi float olamaz: TypeError: list indices must be integers or slices, not float. İndeks hesabında // kullan.'
      }
    ]
  }
);
})(window);
