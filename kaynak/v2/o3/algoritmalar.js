/* Kesit Python — v2 o3: Algoritmalar ve Big-O: arama, sıralama, iki işaretçi, dinamik programlama, BFS/DFS */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{
  id: 'algoritmalar',
  lv: 'orta',
  mod: 'Veri Yapıları ve Algoritmalar',
  min: 55,
  title: 'Algoritmalar ve Big-O: arama, sıralama, iki işaretçi, dinamik programlama, BFS/DFS',
  sum: 'Big-O sezgisi kurar; doğrusal ve ikili aramayı (bisect), beş klasik sıralamayı ve Timsort\'u, iki işaretçi, kayan pencere, önek toplamı, açgözlü yaklaşım, dinamik programlama ve BFS/DFS kalıplarını iş problemleri üzerinde adım sayarak öğrenirsin.',
  goals: [
    'Bir kodun zaman ve bellek karmaşıklığını Big-O ile tahmin edip adım sayacıyla doğrulayabilirim.',
    'Sıralı veride bisect ile ikili arama yapar, dilim/eşik sorularını O(log n) çözebilirim.',
    'Kabarcık, seçmeli, eklemeli, birleştirme ve hızlı sıralamayı yazıp Timsort\'un kararlılığını kullanabilirim.',
    'İki işaretçi, kayan pencere ve önek toplamı kalıplarıyla O(n²) çözümleri O(n)\'e indirebilirim.',
    'Açgözlü yaklaşımın ne zaman yanıldığını görür, dinamik programlama ve BFS/DFS ile doğru çözümü kurabilirim.'
  ],
  body: `
<h2>Neden önemli?</h2>
<p>Anadolu Market'in "aynı müşteri, aynı gün, aynı tutar" şüpheli sipariş kontrolü test ortamında 1.000 siparişle bir saniyede çalışıyordu. Canlıya çıkınca günde 2 milyon sipariş geldi ve iş saatlerce sürdü. Kod yanlış değildi; <b>algoritma</b> ölçeklenmiyordu: her siparişi diğer her siparişle karşılaştırıyordu. 1.000 sipariş için 1 milyon karşılaştırma, 2 milyon sipariş için 4 trilyon.</p>
<p>Bu derste algoritmanın maliyetini <b>Big-O</b> ile konuşmayı, klasik arama ve sıralama algoritmalarını ve iş hayatında en çok karşına çıkacak çözüm kalıplarını öğreneceksin. Veri yapılarını bir önceki <b>Veri yapıları</b> dersinde gördün; profil alma ve ölçümü <b>Profil ve optimizasyon</b>, mülakat kalıplarını <b>Mülakat hazırlığı</b> dersinde derinleştireceksin.</p>

<h2>Big-O sezgisi</h2>
<p>Big-O, girdi büyüdükçe adım sayısının <b>nasıl büyüdüğünü</b> anlatır; saniye değil, büyüme hızıdır. Sabitler ve küçük terimler atılır: 3n + 5 adım O(n)'dir. Bellek için de aynı dil kullanılır: ek bir liste kuran algoritma O(n) bellek (space) kullanır.</p>
<div class="tbl-wrap"><table>
<tr><th>Sınıf</th><th>Örnek</th><th>n = 1.000</th><th>n = 1.000.000</th></tr>
<tr><td>O(1)</td><td>dict'te anahtar, listede indeks</td><td>1</td><td>1</td></tr>
<tr><td>O(log n)</td><td>ikili arama</td><td>~10</td><td>~20</td></tr>
<tr><td>O(n)</td><td>listede tek geçiş, <code>in</code> ile liste araması</td><td>1.000</td><td>1.000.000</td></tr>
<tr><td>O(n log n)</td><td><code>sorted</code>, birleştirme sıralaması</td><td>~10.000</td><td>~20.000.000</td></tr>
<tr><td>O(n²)</td><td>iç içe döngü, kabarcık sıralaması</td><td>1.000.000</td><td>10<sup>12</sup> (pratikte imkânsız)</td></tr>
<tr><td>O(2<sup>n</sup>)</td><td>tüm alt kümeleri denemek</td><td>astronomik</td><td>astronomik</td></tr>
</table></div>
<p>Sezgiyi kurmanın en iyi yolu <b>adım saymaktır</b>:</p>
<pre class="py">def adim_say(n):
    tek = cift = 0
    for i in range(n):          # tek döngü
        tek += 1
    for i in range(n):          # iç içe döngü
        for j in range(n):
            cift += 1
    return tek, cift

for n in [10, 100, 1000]:
    print(n, adim_say(n))</pre>
<p>n on katına çıkınca tek döngü on kat, iç içe döngü yüz kat büyür. Şüpheli sipariş problemindeki çözüm de buradan gelir: siparişleri (müşteri, gün, tutar) anahtarıyla bir sözlükte toplamak tek geçiştir, O(n).</p>

<h2>Doğrusal arama ve ikili arama</h2>
<p><b>Doğrusal arama</b> (linear search) baştan sona bakar: O(n). Veri <b>sıralıysa</b> <b>ikili arama</b> (binary search) ortadaki elemana bakar ve aramayı her adımda yarıya indirir: O(log n). 1 milyon elemanda en fazla 20 adım. Python'da hazır hâli <code>bisect</code> modülüdür.</p>
<pre class="py">import bisect
fiyatlar = [49, 75, 120, 120, 120, 300, 999]
print(bisect.bisect_left(fiyatlar, 120))    # 120'nin ilk konumu (sola yerleştirme)
print(bisect.bisect_right(fiyatlar, 120))   # son 120'nin bir sağı
print(bisect.bisect_right(fiyatlar, 120) - bisect.bisect_left(fiyatlar, 120), "adet 120 TL")
bisect.insort(fiyatlar, 150)                # sırayı bozmadan ekle
print(fiyatlar)

def var_mi(sirali, x):
    i = bisect.bisect_left(sirali, x)
    return i &lt; len(sirali) and sirali[i] == x
print(var_mi(fiyatlar, 300), var_mi(fiyatlar, 301))</pre>
<p><code>bisect</code>'in en güçlü kullanımı <b>dilim tablolarıdır</b>: vergi dilimi, kargo ücreti, not aralığı, risk skoru. Uzun bir <code>if/elif</code> zinciri yerine sınırları bir listeye koyar, hangi aralıkta olduğunu bisect ile bulursun:</p>
<pre class="py">import bisect
SINIRLAR = [1000, 5000, 20000]          # TL
PUAN = ["düşük", "orta", "yüksek", "çok yüksek"]
def risk(tutar):
    return PUAN[bisect.bisect_right(SINIRLAR, tutar)]
for t in [500, 1000, 4999, 5000, 75000]:
    print(t, risk(t))</pre>
<div class="warn"><b>İkili arama yalnızca sıralı veride çalışır</b>Sırasız listede bisect hata vermez, sessizce yanlış cevap verir. Bir kez sıralamak O(n log n)'dir; bu yalnızca çok sayıda arama yapacaksan kârlıdır. Tek bir arama için doğrusal arama daha ucuzdur.</div>

<h2>Sıralama algoritmaları</h2>
<p>Python'da her gün <code>sorted</code> kullanırsın; ama klasik algoritmaları bilmek hem mülakatlarda sorulur hem de "neden bazı çözümler yavaş" sorusunu cevaplar. Üç basit algoritma O(n²)'dir:</p>
<ul><li><b>Kabarcık</b> (bubble): komşuları karşılaştırıp yer değiştirir; her turda en büyük sona "kabarır".</li>
<li><b>Seçmeli</b> (selection): kalanların en küçüğünü bulup başa koyar; az yer değiştirme yapar.</li>
<li><b>Eklemeli</b> (insertion): her elemanı solundaki sıralı kısımda yerine kaydırır; neredeyse sıralı veride O(n)'e yaklaşır.</li></ul>
<pre class="py">def kabarcik(a):
    a, k = list(a), 0
    for son in range(len(a) - 1, 0, -1):
        degisti = False
        for i in range(son):
            k += 1
            if a[i] &gt; a[i + 1]:
                a[i], a[i + 1] = a[i + 1], a[i]
                degisti = True
        if not degisti:              # hiç değişmediyse liste sıralı
            break
    return a, k

def secmeli(a):
    a, k = list(a), 0
    for i in range(len(a)):
        en_kucuk = i
        for j in range(i + 1, len(a)):
            k += 1
            if a[j] &lt; a[en_kucuk]:
                en_kucuk = j
        a[i], a[en_kucuk] = a[en_kucuk], a[i]
    return a, k

veri = [42, 7, 19, 3, 88, 21, 5, 64]
print(kabarcik(veri), secmeli(veri))
print("sıralı girdi:", kabarcik(sorted(veri))[1], "karşılaştırma (kabarcık),", secmeli(sorted(veri))[1], "(seçmeli)")</pre>
<p>Sıralı girdide kabarcık erken çıkışla n-1 karşılaştırmada biter; seçmeli ise her durumda n(n-1)/2 karşılaştırma yapar. Aynı Big-O sınıfındaki algoritmalar bile girdiye göre çok farklı davranabilir.</p>
<p><b>Böl ve fethet</b> (divide and conquer) algoritmaları O(n log n)'e iner. <b>Birleştirme sıralaması</b> (merge sort) listeyi ikiye böler, her yarıyı sıralar ve iki sıralı listeyi tek geçişte birleştirir. <b>Hızlı sıralama</b> (quick sort) bir pivot seçer, küçükleri sola büyükleri sağa ayırır ve her parçayı sıralar.</p>
<pre class="py">def birlestirme(a):
    if len(a) &lt;= 1:
        return list(a)
    orta = len(a) // 2
    sol, sag = birlestirme(a[:orta]), birlestirme(a[orta:])
    sonuc, i, j = [], 0, 0
    while i &lt; len(sol) and j &lt; len(sag):
        if sol[i] &lt;= sag[j]:          # &lt;= kararlılığı korur
            sonuc.append(sol[i]); i += 1
        else:
            sonuc.append(sag[j]); j += 1
    return sonuc + sol[i:] + sag[j:]

def hizli(a):
    if len(a) &lt;= 1:
        return list(a)
    pivot = a[len(a) // 2]
    return (hizli([x for x in a if x &lt; pivot]) + [x for x in a if x == pivot]
            + hizli([x for x in a if x &gt; pivot]))

veri = [42, 7, 19, 3, 88, 21, 5, 64, 19]
print(birlestirme(veri))
print(hizli(veri))</pre>
<div class="tbl-wrap"><table>
<tr><th>Algoritma</th><th>En iyi</th><th>Ortalama</th><th>En kötü</th><th>Ek bellek</th><th>Kararlı mı?</th></tr>
<tr><td>Kabarcık</td><td>O(n)</td><td>O(n²)</td><td>O(n²)</td><td>O(1)</td><td>Evet</td></tr>
<tr><td>Seçmeli</td><td>O(n²)</td><td>O(n²)</td><td>O(n²)</td><td>O(1)</td><td>Hayır</td></tr>
<tr><td>Eklemeli</td><td>O(n)</td><td>O(n²)</td><td>O(n²)</td><td>O(1)</td><td>Evet</td></tr>
<tr><td>Birleştirme</td><td>O(n log n)</td><td>O(n log n)</td><td>O(n log n)</td><td>O(n)</td><td>Evet</td></tr>
<tr><td>Hızlı</td><td>O(n log n)</td><td>O(n log n)</td><td>O(n²)</td><td>O(log n)</td><td>Genelde hayır</td></tr>
<tr><td>Timsort (Python)</td><td>O(n)</td><td>O(n log n)</td><td>O(n log n)</td><td>O(n)</td><td>Evet</td></tr>
</table></div>
<p><b>Timsort</b>, Python'ın <code>sorted</code> ve <code>list.sort</code> algoritmasıdır: birleştirme ve eklemeli sıralamanın melezidir, verideki hazır sıralı parçaları (run) bulur ve gerçek hayattaki "kısmen sıralı" veride çok hızlıdır. En önemli özelliği <b>kararlı</b> (stable) olmasıdır: anahtarı eşit olan elemanlar orijinal sıralarını korur. Bu sayede çok anahtarlı sıralamayı iki adımda yapabilirsin:</p>
<pre class="py">siparisler = [("Ankara", 250), ("İzmir", 975), ("Ankara", 975), ("Bursa", 250), ("İzmir", 120)]
# Hedef: tutara göre azalan, eşit tutarda şehre göre artan
adim1 = sorted(siparisler, key=lambda s: s[0])                 # önce İKİNCİL anahtar
adim2 = sorted(adim1, key=lambda s: s[1], reverse=True)        # sonra birincil
print(adim2)
print(sorted(siparisler, key=lambda s: (-s[1], s[0])) == adim2)   # tek adımlı karşılığı</pre>
<div class="tip"><b>Kendi sıralamanı yazma, key'i iyi yaz</b>Üretim kodunda kendi sıralama algoritmanı neredeyse hiç yazmazsın; Timsort C ile yazılmıştır ve senin Python döngünden onlarca kat hızlıdır. Asıl beceri doğru <code>key</code> fonksiyonunu kurmaktır.</div>

<h2>İki işaretçi ve kayan pencere</h2>
<p><b>İki işaretçi</b> (two pointers) kalıbında sıralı bir dizide iki indeks birbirine doğru ya da aynı yönde ilerler; iç içe döngü gerektiren birçok soru tek geçişe iner. <b>Kayan pencere</b> (sliding window) ise ardışık bir aralığı genişletip daraltarak "en kısa/en uzun ardışık dönem" sorularını O(n) çözer: sağ uç her adımda ilerler, koşul sağlandıkça sol uç daralır.</p>
<pre class="py">def hedef_ciro_donemi(gunluk, hedef):
    """Toplamı hedefe ulaşan en kısa ardışık gün sayısı (değerler pozitif)."""
    sol, toplam, en_kisa = 0, 0, None
    for sag, deger in enumerate(gunluk):
        toplam += deger                         # pencereyi sağa genişlet
        while toplam &gt;= hedef:                  # koşul sağlanıyor: soldan daralt
            uzunluk = sag - sol + 1
            en_kisa = uzunluk if en_kisa is None else min(en_kisa, uzunluk)
            toplam -= gunluk[sol]
            sol += 1
    return en_kisa

ciro = [120, 80, 400, 90, 300, 50, 600]
print(hedef_ciro_donemi(ciro, 650), hedef_ciro_donemi(ciro, 5000))</pre>
<p>Her eleman pencereye bir kez girer, bir kez çıkar: toplam O(n). Aynı soruyu tüm (başlangıç, bitiş) çiftlerini deneyerek çözmek O(n²) olurdu.</p>

<h2>Önek toplamı</h2>
<p>"3. günden 10. güne kadar ciro ne?" sorusu günde binlerce kez soruluyorsa her seferinde toplamak O(n)'dir. <b>Önek toplamı</b> (prefix sum) dizisini bir kez kurarsın; sonra her aralık toplamı tek çıkarma işlemidir, O(1).</p>
<pre class="py">from itertools import accumulate
ciro = [120, 80, 400, 90, 300, 50, 600]
onek = [0, *accumulate(ciro)]           # onek[i] = ilk i günün toplamı
print(onek)
def aralik(i, j):                        # i..j günleri dahil (0 tabanlı)
    return onek[j + 1] - onek[i]
print(aralik(2, 4), sum(ciro[2:5]))
print(aralik(0, 6) == sum(ciro))</pre>
<p>Değerler negatif değilse önek dizisi sıralıdır; "kümülatif ciro ilk hangi gün 1000'i geçti?" sorusunu <code>bisect</code> ile O(log n) cevaplarsın. Bu, iki tekniği birleştirmenin güzel bir örneğidir.</p>

<h2>Açgözlü yaklaşım ve dinamik programlama</h2>
<p><b>Açgözlü</b> (greedy) algoritma her adımda o an en iyi görünen seçimi yapar ve geri dönmez. Türk lirası küpürleriyle para üstü vermek için "her seferinde sığan en büyük küpürü ver" doğru sonucu verir. Ama küpürler değişince açgözlü yaklaşım yanılabilir:</p>
<pre class="py">def acgozlu(tutar, kupurler):
    sonuc = []
    for k in sorted(kupurler, reverse=True):
        while tutar &gt;= k:
            sonuc.append(k)
            tutar -= k
    return sonuc

print(acgozlu(185, [200, 100, 50, 20, 10, 5, 1]))
print(acgozlu(6, [1, 3, 4]))     # 4+1+1 = 3 adet, ama 3+3 = 2 adet!

def en_az_kupur(tutar, kupurler):
    en_az = [0] + [float("inf")] * tutar        # en_az[t]: t için en az küpür
    for t in range(1, tutar + 1):
        for k in kupurler:
            if k &lt;= t and en_az[t - k] + 1 &lt; en_az[t]:
                en_az[t] = en_az[t - k] + 1
    return en_az[tutar]
print(en_az_kupur(6, [1, 3, 4]))</pre>
<p>İkinci fonksiyon <b>dinamik programlama</b>dır (dynamic programming, DP): büyük problemi örtüşen küçük alt problemlere böler, her alt problemi <b>bir kez</b> çözüp tabloya yazar. DP'ye iki yoldan gidilir: yukarıdan aşağı özyineleme + önbellek (memoization, <code>functools.cache</code>) ya da aşağıdan yukarı tablo doldurma (tabulation).</p>
<p>Klasik ısınma problemi <b>merdiven</b>: n basamaklı merdiveni birer ya da ikişer basamak çıkarak kaç farklı yolla çıkarsın? Son adım ya 1 ya 2 basamaktır, öyleyse yol(n) = yol(n-1) + yol(n-2).</p>
<pre class="py">from functools import cache
cagri = 0
def saf(n):
    global cagri
    cagri += 1
    return 1 if n &lt;= 1 else saf(n - 1) + saf(n - 2)

@cache
def hatirlayan(n):
    return 1 if n &lt;= 1 else hatirlayan(n - 1) + hatirlayan(n - 2)

def tablo(n):
    once, simdi = 1, 1                  # yol(0), yol(1)
    for _ in range(n - 1):
        once, simdi = simdi, once + simdi
    return simdi

print(saf(25), "çağrı sayısı:", cagri)
print(hatirlayan(25), tablo(25), tablo(90))</pre>
<p>Saf özyineleme aynı alt problemleri tekrar tekrar çözer ve üstel büyür; önbellekli ve tablolu sürümler O(n)'dir. Tablolu sürüm yalnızca son iki değeri tuttuğu için O(1) bellek kullanır.</p>
<p>İş hayatındaki DP örneği: <b>en uzun ortak alt dizi</b> (longest common subsequence, LCS). İki metindeki karakterlerin sırası bozulmadan seçilebilecek en uzun ortak dizi; <code>diff</code> araçları, yazım düzeltme ve kayıt eşleştirme bunun üstüne kurulur.</p>
<pre class="py">def lcs_uzunluk(a, b):
    T = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                T[i][j] = T[i - 1][j - 1] + 1          # karakterler eşleşti
            else:
                T[i][j] = max(T[i - 1][j], T[i][j - 1])  # birini atla
    return T[-1][-1]
print(lcs_uzunluk("ATATÜRK CAD", "ATATURK CADDESI"))
print(lcs_uzunluk("KIZILAY", "KIZILCAHAMAM"))</pre>

<h2>BFS ve DFS: grafı gezmek</h2>
<p>Grafı gezmenin iki temel yolu vardır. <b>BFS</b> (genişlik öncelikli arama, breadth-first search) bir kuyrukla katman katman ilerler; ağırlıksız grafta <b>en kısa yolu</b> bulur. <b>DFS</b> (derinlik öncelikli arama, depth-first search) bir yığınla (ya da özyinelemeyle) bir dalın sonuna kadar gider; bağlı bileşenleri, döngüleri ve erişilebilirliği bulmakta kullanılır. İkisi de O(düğüm + kenar) çalışır.</p>
<pre class="py">from collections import deque
yollar = {"Gebze": ["İstanbul", "Bursa", "Kocaeli"], "İstanbul": ["Gebze", "Tekirdağ"],
          "Bursa": ["Gebze", "İzmir", "Eskişehir"], "Eskişehir": ["Bursa", "Ankara"],
          "Ankara": ["Eskişehir"], "İzmir": ["Bursa"], "Kocaeli": ["Gebze"], "Tekirdağ": ["İstanbul"]}

def bfs_yol(graf, bas, hedef):
    onceki = {bas: None}
    kuyruk = deque([bas])
    while kuyruk:
        d = kuyruk.popleft()
        if d == hedef:
            yol = []
            while d is not None:
                yol.append(d); d = onceki[d]
            return yol[::-1]
        for k in graf.get(d, []):
            if k not in onceki:          # ziyaret edildi mi? (set gibi O(1))
                onceki[k] = d
                kuyruk.append(k)
    return None

def dfs_erisilen(graf, bas):
    gorulen, yigin = set(), [bas]
    while yigin:
        d = yigin.pop()
        if d not in gorulen:
            gorulen.add(d)
            yigin.extend(graf.get(d, []))
    return gorulen

print(" -&gt; ".join(bfs_yol(yollar, "Tekirdağ", "Ankara")))
print(len(dfs_erisilen(yollar, "İzmir")), "depoya ulaşılabilir")</pre>
<p>BFS ile DFS arasındaki tek fark kuyruk mu yığın mı kullandığındır; veri yapısı seçimi algoritmanın davranışını belirler. Ağırlıklı grafta (yolların km'si farklıysa) en kısa yol için BFS yerine <code>heapq</code> kullanan Dijkstra algoritması gerekir.</p>
<div class="note"><b>Gerçek işte</b>Algoritma bilgisi günlük işte çoğunlukla "doğru kalıbı tanımak" olarak karşına çıkar: iki listeyi eşleştirirken iç içe döngü yerine sözlük, tarih aralığı sorgusunda bisect, raporlarda kümülatif toplam, kampanya bütçesinde açgözlü yaklaşımın tuzağı, organizasyon şemasında ya da kategori ağacında DFS. Kod incelemesinde "bu döngü 10 milyon kayıtta ne yapar?" sorusunu sormak, canlıda yaşanacak yavaşlıkların çoğunu daha yazılırken yakalar.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Zaman-bellek takası</h3>
<p>Önek toplamı, önbellek ve indeks aynı fikrin farklı yüzleridir: biraz bellek harcayıp sonraki sorguları ucuzlatmak. Hangisinin kârlı olduğu sorgu/güncelleme oranına bağlıdır: veri sık değişiyorsa önek dizisini her seferinde yeniden kurmak pahalılaşır; o zaman Fenwick ağacı gibi yapılar devreye girer.</p>
<h3>Sınır analizi: girdi boyutundan algoritmayı tahmin et</h3>
<p>Python saniyede kabaca 10 milyon basit işlem yapar. n ≤ 20 ise üstel (alt küme denemek), n ≤ 3.000 ise O(n²), n ≤ 10<sup>6</sup> ise O(n log n) ya da O(n) gerekir. Bu kaba hesap, kodu yazmadan önce yaklaşımın işe yarayıp yaramayacağını söyler.</p>
<h3>NP-zor problemler</h3>
<p>Sırt çantası (knapsack), gezgin satıcı (TSP) ve araç rotalama gibi problemlerin büyük girdiler için bilinen hızlı ve kesin çözümü yoktur. Lojistikte bu problemlerle sezgisel yöntemler (heuristic), yaklaşık algoritmalar ya da OR-Tools gibi çözücülerle uğraşılır; "en iyi" yerine "yeterince iyi ve hızlı" hedeflenir.</p>
<h3>Ölç, sonra karar ver</h3>
<p>Big-O büyüme hızını söyler, sabitleri söylemez. Küçük n'de O(n²) bir C fonksiyonu, O(n log n) bir Python döngüsünden hızlı olabilir. Karar vermeden önce <code>timeit</code> ve <code>cProfile</code> ile ölç; bunu Profil ve optimizasyon dersinde göreceksin.</p>
</section>
`,
  ex: [
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Bir fonksiyon n siparişin her birini, aynı listedeki diğer tüm siparişlerle karşılaştırıyor (iç içe iki döngü). Zaman karmaşıklığı nedir?',
      o: [
        'O(n)',
        'O(n log n)',
        'O(n²)',
        'O(2n)'
      ],
      a: 2,
      why: 'Dış döngü n kez, iç döngü her seferinde n kez döner: n × n. O(2n) aslında O(n) ile aynıdır (sabit atılır). n log n ise sıralama gibi böl-fethet algoritmalarının sınıfıdır.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: '<code>bisect.bisect_left(liste, x)</code> ile ikili arama yapmadan önce listenin hangi koşulu sağlaması gerekir?',
      o: [
        'Tekrar eden eleman içermemeli',
        'Artan sırada sıralı olmalı',
        'Yalnızca tam sayılardan oluşmalı',
        'Uzunluğu 2\'nin kuvveti olmalı'
      ],
      a: 1,
      why: 'İkili arama, ortadaki elemana bakıp aramanın yarısını atar; bu yalnızca sıralı veride geçerlidir. Tekrarlar sorun değildir (bisect_left ilk konumu verir); karşılaştırılabilen her tür kullanılabilir; uzunluk serbesttir.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Python\'ın <code>sorted</code> fonksiyonu için hangisi doğrudur?',
      o: [
        'Hızlı sıralama kullanır ve en kötü durumu O(n²)\'dir',
        'Kararlıdır: eşit anahtarlı elemanlar ilk sıralarını korur',
        'Her zaman listeyi yerinde değiştirir',
        'Sıralı girdide de mutlaka n log n karşılaştırma yapar'
      ],
      a: 1,
      why: 'sorted, kararlı bir algoritma olan Timsort\'u kullanır; en kötü durum O(n log n), sıralı girdide O(n)\'dir. Yerinde değiştiren list.sort\'tur; sorted yeni liste döndürür.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'import bisect\ndilimler = [0, 1000, 5000, 20000]\nprint(bisect.bisect_right(dilimler, 5000), bisect.bisect_left(dilimler, 5000))\n',
      o: [
        '2 2',
        '3 3',
        '3 2',
        '2 3'
      ],
      a: 2,
      why: '5000 listede 2. indekste. bisect_left eşit elemanın SOLUNU (2), bisect_right SAĞINI (3) verir. Dilim tablolarında hangi tarafı seçtiğin, sınır değerin hangi dilime düşeceğini belirler.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'kayitlar = [("Ali", 2), ("Ece", 1), ("Can", 2), ("Su", 1)]\nprint([ad for ad, _ in sorted(kayitlar, key=lambda k: k[1])])\n',
      o: [
        '[\'Ece\', \'Su\', \'Ali\', \'Can\']',
        '[\'Su\', \'Ece\', \'Can\', \'Ali\']',
        '[\'Ece\', \'Su\', \'Can\', \'Ali\']',
        '[\'Ali\', \'Can\', \'Ece\', \'Su\']'
      ],
      a: 0,
      why: 'Anahtar yalnızca sayıdır; 1\'ler önce gelir. Timsort kararlı olduğu için eşit anahtarlılar (Ece-Su, Ali-Can) girdideki sıralarını korur. Adlar alfabetik sıralanmaz.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu açgözlü para üstü kodu ne yazdırır?',
      code: 'def acgozlu(tutar, kupurler):\n    sonuc = []\n    for k in sorted(kupurler, reverse=True):\n        while tutar >= k:\n            sonuc.append(k)\n            tutar -= k\n    return sonuc\nr = acgozlu(6, [1, 3, 4])\nprint(r, len(r))\n',
      o: [
        '[3, 3] 2',
        '[4, 1, 1] 3',
        '[4, 2] 2',
        '[1, 1, 1, 1, 1, 1] 6'
      ],
      a: 1,
      why: 'Açgözlü algoritma önce sığan en büyük küpürü (4) alır, kalan 2 için iki tane 1 verir: 3 küpür. En iyi çözüm 3+3 (2 küpür) olsa da açgözlü yaklaşım geri dönüp bunu denemez. 2 TL küpürü olmadığı için [4, 2] mümkün değildir.'
    },
    {
      t: 'order',
      stage: 'Kodu oku',
      q: '<p>İki sıralı listeyi iki işaretçiyle tek sıralı listede birleştiren <code>birlestir(a, b)</code> fonksiyonunun satırlarını sırala.</p>',
      lines: ['def birlestir(a, b):', '    i, j, sonuc = 0, 0, []', '    while i < len(a) and j < len(b):', '        if a[i] <= b[j]:', '            sonuc.append(a[i]); i += 1', '        else:', '            sonuc.append(b[j]); j += 1', '    return sonuc + a[i:] + b[j:]'],
      tests: 'assert birlestir([1, 4, 9], [2, 3, 10, 11]) == [1, 2, 3, 4, 9, 10, 11], "iki sıralı liste birleşmeli"\nassert birlestir([], [5]) == [5] and birlestir([1, 2], []) == [1, 2], "boş listeler"\n',
      hint: 'İşaretçiler ve sonuç listesi döngüden önce kurulur; döngü bitince listelerden birinde kalanlar sona eklenir.',
      why: 'Her adımda iki listenin başındaki en küçük eleman alınır ve o listenin işaretçisi ilerler. Bir liste bitince diğerinde kalanlar zaten sıralıdır, olduğu gibi eklenir. Toplam O(len(a) + len(b)).'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'algoritmalar-1',
      diff: 1,
      q: '<p>Eklemeli sıralamayı (insertion sort) adım sayacıyla yaz: <code>eklemeli_sirala(liste)</code> orijinal listeyi <b>değiştirmeden</b> sıralı yeni bir liste ve yapılan <b>karşılaştırma sayısını</b> <code>(sirali, karsilastirma)</code> demeti olarak döndürsün. Her <code>a[j] &gt; anahtar</code> karşılaştırması 1 sayılır. <code>sorted</code> ya da <code>.sort()</code> kullanma.</p>',
      guide: ['list(liste) ile kopya al, sayacı 0 yap.', 'i = 1\'den sona kadar: anahtar = a[i], j = i - 1.', 'while j >= 0: sayacı artır; a[j] > anahtar ise a[j + 1] = a[j], j -= 1; değilse break.', 'Döngüden sonra a[j + 1] = anahtar; en sonda (a, sayac) döndür.'],
      example: '# Sıralı kısma tek bir elemanı yerleştirmek (eklemeli sıralamanın bir adımı)\na = [10, 20, 40, 50, 30]\nanahtar, j = a[4], 3\nwhile j >= 0 and a[j] > anahtar:\n    a[j + 1] = a[j]\n    j -= 1\na[j + 1] = anahtar\nprint(a)\n',
      start: 'def eklemeli_sirala(liste):\n    a = list(liste)\n    karsilastirma = 0\n    for i in range(1, len(a)):\n        anahtar = a[i]\n        j = i - 1\n        # TODO: anahtardan büyükleri sağa kaydır, her karşılaştırmayı say\n        # TODO: anahtarı yerine koy\n    return a, karsilastirma\n',
      sol: 'def eklemeli_sirala(liste):\n    a = list(liste)\n    karsilastirma = 0\n    for i in range(1, len(a)):\n        anahtar = a[i]\n        j = i - 1\n        while j >= 0:\n            karsilastirma += 1\n            if a[j] > anahtar:\n                a[j + 1] = a[j]\n                j -= 1\n            else:\n                break\n        a[j + 1] = anahtar\n    return a, karsilastirma\n',
      tests: '_v = [42, 7, 19, 3, 88, 21]\n_s, _k = eklemeli_sirala(_v)\nassert _s == [3, 7, 19, 21, 42, 88], f"sıralama yanlış: {_s}"\nassert _v == [42, 7, 19, 3, 88, 21], "orijinal liste değişmemeli"\nassert eklemeli_sirala(list(range(100)))[1] == 99, "sıralı girdide n-1 karşılaştırma (en iyi durum O(n))"\nassert eklemeli_sirala(list(range(100, 0, -1)))[1] == 4950, "ters sıralı girdide n(n-1)/2 karşılaştırma (en kötü durum O(n²))"\nassert eklemeli_sirala([]) == ([], 0) and eklemeli_sirala([5])[0] == [5]\nassert "sorted(" not in __kod__ and ".sort(" not in __kod__, "hazır sıralama kullanma"\n',
      hints: ['Eklemeli sıralama: soldaki kısım hep sıralıdır; her yeni eleman bu kısımda yerine kayarak girer.', 'Karşılaştırmayı say, sonra karar ver: büyükse kaydır, değilse break.', 'Döngü bittikten sonra boşalan yer a[j + 1]\'dir: a[j + 1] = anahtar.'],
      why: 'Sayaç, Big-O\'yu somutlaştırır: sıralı girdide her eleman tek karşılaştırmayla yerinde kalır (n-1), ters sıralıda her eleman tüm soluna kayar (n(n-1)/2). Timsort küçük parçalarda bu yüzden eklemeli sıralama kullanır.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'algoritmalar-2',
      diff: 1,
      q: '<p>Anadolu Market kargo ücreti desi (hacim) dilimine göre belirlenir. <code>kargo_ucreti(desi)</code> fonksiyonunu <code>bisect</code> ile yaz (if/elif zinciri kurma):</p><div class="tbl-wrap"><table><tr><th>Desi</th><th>Ücret (TL)</th></tr><tr><td>0 &lt; desi ≤ 1</td><td>30</td></tr><tr><td>1 &lt; desi ≤ 3</td><td>45</td></tr><tr><td>3 &lt; desi ≤ 5</td><td>60</td></tr><tr><td>5 &lt; desi ≤ 10</td><td>85</td></tr><tr><td>10 &lt; desi ≤ 20</td><td>120</td></tr><tr><td>20 &lt; desi ≤ 30</td><td>160</td></tr></table></div><p><code>desi &lt;= 0</code> ya da <code>desi &gt; 30</code> ise <code>ValueError</code> yükselsin.</p>',
      guide: ['Üst sınırları ve ücretleri iki paralel liste olarak tanımla.', 'Geçersiz desi için önce ValueError kontrolü yap.', 'Sınır değer (ör. 3) alt dilime aittir; bu yüzden eşit değerin SOLUNU veren bisect_left uygun.', 'Bulunan indeksle ücret listesinden değeri döndür.'],
      example: 'import bisect\nsinirlar = [49, 69, 84, 100]          # not üst sınırları\nharfler = ["FF", "CC", "BB", "AA"]\nfor not_ in [30, 49, 50, 84, 100]:\n    print(not_, harfler[bisect.bisect_left(sinirlar, not_)])\n',
      start: 'import bisect\n\nSINIRLAR = [1, 3, 5, 10, 20, 30]\nUCRETLER = [30, 45, 60, 85, 120, 160]\n\ndef kargo_ucreti(desi):\n    # TODO: geçersiz desi için ValueError\n    # TODO: bisect ile dilim indeksini bul\n    return 0\n',
      sol: 'import bisect\n\nSINIRLAR = [1, 3, 5, 10, 20, 30]\nUCRETLER = [30, 45, 60, 85, 120, 160]\n\ndef kargo_ucreti(desi):\n    if desi <= 0 or desi > SINIRLAR[-1]:\n        raise ValueError(f"Geçersiz desi: {desi}")\n    return UCRETLER[bisect.bisect_left(SINIRLAR, desi)]\n',
      tests: '_b = {0.5: 30, 1: 30, 1.01: 45, 3: 45, 4: 60, 5: 60, 7.5: 85, 10: 85, 15: 120, 20: 120, 20.5: 160, 30: 160}\nfor _d, _u in _b.items():\n    assert kargo_ucreti(_d) == _u, f"{_d} desi için {_u} TL bekleniyordu, gelen {kargo_ucreti(_d)} (sınır değer alt dilime aittir)"\nfor _d in (0, -2, 30.1):\n    try:\n        kargo_ucreti(_d); assert False, f"{_d} için ValueError bekleniyordu"\n    except ValueError:\n        pass\nassert "elif" not in __kod__, "if/elif zinciri yerine bisect kullan"\n',
      hints: ['Sınırlar sıralı bir liste; desinin hangi aralıkta olduğunu ikili arama söyler.', 'bisect_left(SINIRLAR, 3) → 1 (3, 45 TL dilimine düşer); bisect_right olsaydı 2 dönerdi.', 'return UCRETLER[bisect.bisect_left(SINIRLAR, desi)]'],
      why: 'Dilim tablosunu veri olarak tutmak, yeni dilim eklemeyi kod değiştirmeden yapmayı sağlar ve arama O(log n)\'dir. "≤ üst sınır" kuralında bisect_left, "< üst sınır" kuralında bisect_right seçilir; sınır hatalarının çoğu bu seçimden çıkar.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'algoritmalar-3',
      diff: 2,
      q: '<p>Finans ekibi günlük ciro listesi üzerinde binlerce "i. günden j. güne toplam ciro" sorgusu çalıştırıyor. <code>aralik_toplamlari(ciro, sorgular)</code> fonksiyonunu <b>önek toplamı</b> ile yaz: <code>sorgular</code> <code>(i, j)</code> çiftlerinin listesidir (0 tabanlı, iki uç dahil); her sorgunun toplamını sırayla liste olarak döndürsün. Önek dizisini bir kez kur; sorgu başına <code>sum</code> çağırma (her sorgu O(1) olmalı).</p>',
      guide: ['onek = [0] ile başla; her ciro değerini bir önceki önek değerine ekleyerek listeye ekle (ya da itertools.accumulate).', 'onek[k], ilk k günün toplamıdır; uzunluğu len(ciro) + 1.', 'i..j toplamı = onek[j + 1] - onek[i].', 'Her sorgu için bu farkı hesaplayıp sonuç listesine ekle.'],
      example: 'from itertools import accumulate\nadim = [3000, 4500, 2000, 5200]\nkumulatif = [0, *accumulate(adim)]\nprint(kumulatif)\nprint("2. ve 3. gün:", kumulatif[4] - kumulatif[2])\n',
      start: 'def aralik_toplamlari(ciro, sorgular):\n    onek = [0]\n    # TODO: önek toplamlarını kur\n    sonuc = []\n    # TODO: her (i, j) için onek farkını ekle\n    return sonuc\n',
      sol: 'def aralik_toplamlari(ciro, sorgular):\n    onek = [0]\n    for c in ciro:\n        onek.append(onek[-1] + c)\n    sonuc = []\n    for i, j in sorgular:\n        sonuc.append(onek[j + 1] - onek[i])\n    return sonuc\n',
      tests: '_c = [120, 80, 400, 90, 300, 50, 600]\nassert aralik_toplamlari(_c, [(2, 4), (0, 6), (3, 3), (0, 0)]) == [790, 1640, 90, 120], "aralık toplamları yanlış"\nassert aralik_toplamlari(_c, []) == []\n_buyuk = list(range(200_000))\n_s = [(i, 199_999) for i in range(0, 200_000, 7)]\nassert aralik_toplamlari(_buyuk, _s)[:2] == [sum(_buyuk), sum(_buyuk) - sum(range(7))], "büyük girdide doğru sonuç"\nassert "sum(" not in __kod__, "sorgu başına sum kullanma; önek farkını kullan"\n',
      hints: ['Önek dizisi: onek[k + 1] = onek[k] + ciro[k].', 'Aralık toplamı iki önek değerinin farkıdır; çizerek kontrol et: onek[j + 1] j dahil toplamı içerir.', 'sonuc.append(onek[j + 1] - onek[i])'],
      why: 'Önek dizisini kurmak O(n), her sorgu O(1); q sorgu için toplam O(n + q). Her sorguda sum çağırmak O(n·q) olurdu: 200 bin günlük veride 28 bin sorgu, milyarlarca toplama demektir.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'algoritmalar-4',
      diff: 2,
      q: '<p>Birleştirme sıralamasını (merge sort) <b>kararlı</b> ve <code>key</code> destekli yaz: <code>birlestirme_sirala(liste, key=None)</code> sıralı yeni bir liste döndürsün; <code>key</code> verilirse elemanlar <code>key(eleman)</code>\'a göre karşılaştırılsın, eşit anahtarlılar orijinal sıralarını korusun. Orijinal liste değişmesin. <code>sorted</code>, <code>.sort</code> ve <code>heapq</code> kullanma.</p>',
      start: 'def birlestirme_sirala(liste, key=None):\n    pass\n',
      sol: 'def birlestirme_sirala(liste, key=None):\n    anahtar = key or (lambda x: x)\n    def sirala(a):\n        if len(a) <= 1:\n            return list(a)\n        orta = len(a) // 2\n        sol, sag = sirala(a[:orta]), sirala(a[orta:])\n        sonuc, i, j = [], 0, 0\n        while i < len(sol) and j < len(sag):\n            if anahtar(sol[i]) <= anahtar(sag[j]):\n                sonuc.append(sol[i]); i += 1\n            else:\n                sonuc.append(sag[j]); j += 1\n        return sonuc + sol[i:] + sag[j:]\n    return sirala(list(liste))\n',
      tests: 'import random as _r\n_r.seed(0)\n_v = [_r.randint(0, 50) for _ in range(300)]\n_k = list(_v)\nassert birlestirme_sirala(_v) == sorted(_v), "rastgele 300 sayı doğru sıralanmalı"\nassert _v == _k, "orijinal değişmemeli"\n_s = [("Ankara", 250), ("İzmir", 975), ("Bursa", 250), ("Van", 120), ("Muş", 975)]\nassert birlestirme_sirala(_s, key=lambda x: x[1]) == [("Van", 120), ("Ankara", 250), ("Bursa", 250), ("İzmir", 975), ("Muş", 975)], "kararlılık: eşit tutarlılar girdi sırasını korumalı"\nassert birlestirme_sirala([]) == [] and birlestirme_sirala((3, 1, 2)) == [1, 2, 3]\nassert "sorted(" not in __kod__ and ".sort(" not in __kod__ and "heapq" not in __kod__, "hazır sıralama kullanma"\n',
      hints: ['Böl: listeyi ortadan ikiye ayır ve her yarıyı özyinelemeli sırala. Temel durum: uzunluk 0 ya da 1.', 'Birleştir: iki işaretçiyle küçük olanı al. Kararlılık için eşitlikte SOLDAKİNİ al: key(sol[i]) <= key(sag[j]).', 'key None ise kimlik fonksiyonu kullan: anahtar = key or (lambda x: x).'],
      why: 'Birleştirme sıralaması her durumda O(n log n)\'dir. Kararlılık tek bir karakterde saklıdır: < yerine <= yazmak eşit elemanlarda sol yarıyı (girdide önce geleni) öne alır. Timsort\'un birleştirme adımı da bu kurala uyar.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'algoritmalar-5',
      diff: 2,
      q: '<p>Satış ekibi "aylık hedefe en az kaç ardışık günde ulaştık?" diye soruyor. <code>en_kisa_donem(gunluk, hedef)</code> fonksiyonunu <b>kayan pencere</b> ile O(n) yaz: toplamı <code>hedef</code>\'e eşit ya da büyük olan en kısa ardışık günler dizisinin <code>(baslangic, uzunluk)</code> demetini döndürsün; eşit uzunlukta birden fazla varsa <b>en erken başlayanı</b> seçsin. Hiçbir dönem yetmiyorsa <code>None</code>. Günlük satışlar negatif değildir.</p>',
      start: 'def en_kisa_donem(gunluk, hedef):\n    pass\n',
      sol: 'def en_kisa_donem(gunluk, hedef):\n    sol, toplam, en_iyi = 0, 0, None\n    for sag, deger in enumerate(gunluk):\n        toplam += deger\n        while sol <= sag and toplam >= hedef:\n            uzunluk = sag - sol + 1\n            if en_iyi is None or uzunluk < en_iyi[1]:\n                en_iyi = (sol, uzunluk)\n            toplam -= gunluk[sol]\n            sol += 1\n    return en_iyi\n',
      tests: '_c = [120, 80, 400, 90, 300, 50, 600]\nassert en_kisa_donem(_c, 650) == (5, 2), f"50+600=650, 2 gün; gelen {en_kisa_donem(_c, 650)}"\nassert en_kisa_donem(_c, 600) == (6, 1), "tek gün yeterli olabilir"\nassert en_kisa_donem(_c, 400) == (2, 1), "eşit uzunlukta en erken başlayan (400 ve 600 tek gün): 2. gün"\nassert en_kisa_donem(_c, 10_000) is None, "ulaşılamayan hedef None"\nassert en_kisa_donem([], 5) is None\nassert en_kisa_donem([0, 0, 5, 0], 5) == (2, 1)\n_b = [1] * 300_000\nassert en_kisa_donem(_b, 150_000) == (0, 150_000), "büyük girdide de hızlı çalışmalı (O(n))"\n',
      hints: ['Sağ ucu her adımda ilerlet ve toplama ekle; toplam hedefe ulaştıkça sol ucu daralt.', 'Daraltmadan önce mevcut pencereyi aday olarak değerlendir; yalnız kesin daha kısa ise güncelle (< ile), böylece en erken başlayan kalır.', 'Her eleman en fazla bir kez eklenir, bir kez çıkarılır: toplam O(n).'],
      why: 'Pozitif değerlerde pencereyi genişletmek toplamı artırır, daraltmak azaltır; bu tek yönlülük kayan pencereyi mümkün kılar. İç içe döngüyle tüm aralıkları denemek 300 bin günde 45 milyar adım olurdu.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'algoritmalar-6',
      diff: 2,
      q: '<p>Bir kafe zinciri kasada para üstü verirken en az sayıda küpür kullanmak istiyor ama elindeki küpür seti standart değil (açgözlü yaklaşım yanılabilir). <code>para_ustu(tutar, kupurler)</code> fonksiyonunu <b>dinamik programlama</b> ile yaz: en az sayıda küpürden oluşan bir çözümü <b>büyükten küçüğe sıralı liste</b> olarak döndürsün; tutar oluşturulamıyorsa <code>None</code>; <code>tutar == 0</code> ise <code>[]</code>. Her küpürden sınırsız var.</p>',
      start: 'def para_ustu(tutar, kupurler):\n    pass\n',
      sol: 'def para_ustu(tutar, kupurler):\n    sonsuz = float("inf")\n    en_az = [0] + [sonsuz] * tutar\n    secilen = [0] * (tutar + 1)\n    for t in range(1, tutar + 1):\n        for k in kupurler:\n            if k <= t and en_az[t - k] + 1 < en_az[t]:\n                en_az[t] = en_az[t - k] + 1\n                secilen[t] = k\n    if en_az[tutar] == sonsuz:\n        return None\n    sonuc = []\n    while tutar > 0:\n        sonuc.append(secilen[tutar])\n        tutar -= secilen[tutar]\n    return sorted(sonuc, reverse=True)\n',
      tests: 'assert para_ustu(6, [1, 3, 4]) == [3, 3], "açgözlü 4+1+1 verir; en az küpür 3+3"\nassert para_ustu(185, [200, 100, 50, 20, 10, 5, 1]) == [100, 50, 20, 10, 5], "standart TL küpürleri"\nassert para_ustu(7, [2, 4]) is None, "tek sayı çift küpürlerle oluşturulamaz"\nassert para_ustu(0, [5]) == []\nassert len(para_ustu(63, [1, 5, 10, 21, 25])) == 3, "63 = 21+21+21 (açgözlü 25+25+10+1+1+1 = 6 küpür verirdi)"\nassert sum(para_ustu(2999, [7, 13, 50])) == 2999, "büyük tutarda geçerli çözüm"\n',
      hints: ['en_az[t]: t tutarı için gereken en az küpür; en_az[0] = 0, diğerleri sonsuz.', 'Her t için her küpürü dene: en_az[t] = min(en_az[t], en_az[t - k] + 1). Hangi küpürün seçildiğini ayrı bir listede sakla.', 'Çözümü geri kurmak için tutardan başlayıp secilen[tutar] kadar düş; sonra büyükten küçüğe sırala.'],
      why: 'DP her ara tutarın en iyi çözümünü bir kez hesaplar: O(tutar × küpür sayısı). Açgözlü yaklaşım standart küpürlerde doğru, keyfi kümelerde yanlıştır; hangi durumda güvenli olduğunu bilmek, ne zaman DP\'ye geçmen gerektiğini söyler.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'algoritmalar-7',
      diff: 2,
      q: '<p>Ilgaz Bank dolandırıcılık ekibi, aralarında para transferi olan hesapları gruplamak istiyor (A → B ve B → C varsa A, B, C aynı halkadadır; yön önemsiz). <code>transfer_halkalari(hesaplar, transferler)</code> fonksiyonunu <b>DFS</b> ile yaz:</p><ul><li><code>hesaplar</code>: tüm hesap numaraları; <code>transferler</code>: <code>(gonderen, alici)</code> çiftleri.</li><li>Dönüş: her grup hesap numaralarının sıralı listesi; gruplar <b>büyükten küçüğe</b> (eşitlikte ilk hesap numarasına göre artan) sıralı.</li><li>Hiç transferi olmayan hesap tek kişilik bir gruptur.</li><li>Özyineleme kullanma (100 bin hesaplık zincirde Python\'ın özyineleme sınırı aşılır): yığınla yinelemeli DFS yaz.</li></ul>',
      start: 'def transfer_halkalari(hesaplar, transferler):\n    pass\n',
      sol: 'from collections import defaultdict\n\ndef transfer_halkalari(hesaplar, transferler):\n    komsu = defaultdict(set)\n    for a, b in transferler:\n        komsu[a].add(b)\n        komsu[b].add(a)\n    gorulen, gruplar = set(), []\n    for h in hesaplar:\n        if h in gorulen:\n            continue\n        grup, yigin = [], [h]\n        gorulen.add(h)\n        while yigin:\n            d = yigin.pop()\n            grup.append(d)\n            for k in komsu[d]:\n                if k not in gorulen:\n                    gorulen.add(k)\n                    yigin.append(k)\n        gruplar.append(sorted(grup))\n    return sorted(gruplar, key=lambda g: (-len(g), g[0]))\n',
      tests: '_h = ["H1", "H2", "H3", "H4", "H5", "H6", "H7"]\n_t = [("H1", "H2"), ("H3", "H2"), ("H5", "H6"), ("H2", "H1")]\nassert transfer_halkalari(_h, _t) == [["H1", "H2", "H3"], ["H5", "H6"], ["H4"], ["H7"]], f"gruplar yanlış: {transfer_halkalari(_h, _t)}"\nassert transfer_halkalari([], []) == []\n_n = 100_000\n_z = [f"Z{i:06d}" for i in range(_n)]\n_g = transfer_halkalari(_z, list(zip(_z, _z[1:])))\nassert len(_g) == 1 and len(_g[0]) == _n, "100 bin hesaplık zincir tek grup olmalı (özyineleme sınırına takılmadan)"\n',
      hints: ['Önce yönsüz bir komşuluk sözlüğü (set\'ler) kur.', 'Her ziyaret edilmemiş hesaptan yeni bir DFS başlat: yığın = [h]; pop et, gruba ekle, görülmemiş komşuları görüldü işaretleyip yığına it.', 'Sonda: sorted(gruplar, key=lambda g: (-len(g), g[0])).'],
      why: 'Her DFS bir bağlı bileşeni (connected component) tam olarak gezer; tüm hesaplar için toplam O(hesap + transfer). Düğümü yığına iterken görüldü işaretlemek, aynı hesabın yığına defalarca girmesini önler. Yinelemeli DFS derin zincirlerde RecursionError vermez.'
    },
    {
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      id: 'algoritmalar-8',
      diff: 2,
      q: '<p>Sıralı işlem zaman damgalarında bir değerin <b>ilk</b> geçtiği konumu bulan <code>ilk_konum(sirali, hedef)</code> fonksiyonu bazı durumlarda -1 döndürüyor, bazılarında ilk değil ortadaki konumu veriyor. <b>Hataları bul ve düzelt</b>: fonksiyon ikili arama (O(log n)) olarak kalmalı; değer yoksa -1.</p>',
      start: 'def ilk_konum(sirali, hedef):\n    lo, hi = 0, len(sirali) - 1\n    while lo < hi:\n        orta = (lo + hi) // 2\n        if sirali[orta] == hedef:\n            return orta\n        elif sirali[orta] < hedef:\n            lo = orta + 1\n        else:\n            hi = orta - 1\n    return -1\n',
      sol: 'def ilk_konum(sirali, hedef):\n    lo, hi = 0, len(sirali)\n    while lo < hi:\n        orta = (lo + hi) // 2\n        if sirali[orta] < hedef:\n            lo = orta + 1\n        else:\n            hi = orta\n    if lo < len(sirali) and sirali[lo] == hedef:\n        return lo\n    return -1\n',
      tests: '_a = [3, 5, 5, 5, 5, 8, 13]\nassert ilk_konum(_a, 13) == 6, "son eleman bulunmalı (lo == hi olduğunda da kontrol edilmeli)"\nassert ilk_konum([7], 7) == 0, "tek elemanlı listede bulunmalı"\nassert ilk_konum(_a, 5) == 1, "tekrar edenlerde İLK konum dönmeli"\nassert ilk_konum(_a, 3) == 0 and ilk_konum(_a, 4) == -1 and ilk_konum(_a, 99) == -1 and ilk_konum([], 1) == -1\nimport bisect as _bs\n_b = sorted([i // 3 for i in range(3000)])\nassert all(ilk_konum(_b, x) == _bs.bisect_left(_b, x) for x in range(0, 1000, 37)), "bisect_left ile aynı sonucu vermeli"\n',
      hints: [
        'lo < hi koşuluyla ve hi = len - 1 ile döngü, aralık tek elemana inince o elemanı hiç kontrol etmeden çıkar.',
        'Eşitlik bulunca hemen dönmek, tekrar edenlerden herhangi birini verir; ilk konum için aramaya SOLDA devam etmelisin (hi = orta).',
        'Yarı açık aralık kalıbı: lo, hi = 0, len; a[orta] < hedef ise lo = orta + 1, değilse hi = orta; döngü sonunda a[lo] == hedef mi kontrol et.'
      ],
      why: 'İkili aramanın hataları neredeyse hep sınırlardadır. Yarı açık aralık [lo, hi) ve "küçükse sağa, değilse sola daral" kuralı, döngü sonunda lo\'yu hedefin ilk konumuna (bisect_left) getirir; eşitlikte hemen dönmemek ilk konumu garanti eder.'
    },
    {
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      id: 'algoritmalar-9',
      diff: 2,
      q: '<p>Depo merdiveni sorusu: robot her hamlede 1 ya da 2 basamak çıkabiliyor; <code>yol_sayisi(n)</code> n basamağa kaç farklı yolla çıkılabileceğini döndürmeli. <code>yol_sayisi(0)</code> 1 olmalı (hiç hareket etmemek tek yoldur). Mevcut kod küçük n\'de yanlış sonuç veriyor, n = 80 gibi değerlerde ise bitmiyor. <b>Hataları bul ve düzelt.</b></p>',
      start: 'def yol_sayisi(n):\n    if n <= 2:\n        return n\n    return yol_sayisi(n - 1) + yol_sayisi(n - 2)\n',
      sol: 'def yol_sayisi(n):\n    once, simdi = 1, 1\n    for _ in range(n - 1):\n        once, simdi = simdi, once + simdi\n    return simdi\n',
      tests: 'assert yol_sayisi(0) == 1, "0 basamak için 1 yol (hiç hareket etmemek)"\nassert [yol_sayisi(n) for n in range(1, 7)] == [1, 2, 3, 5, 8, 13], "küçük değerler yanlış"\nassert yol_sayisi(80) == 37889062373143906, "n=80 hızla hesaplanmalı (memo ya da tablo ile O(n))"\nassert yol_sayisi(500) > 10**100\n',
      hints: ['Temel durum hatası: n <= 2 için n döndürmek n = 0\'da 0 verir; doğrusu yol(0) = yol(1) = 1.', 'Saf özyineleme aynı alt problemleri üstel sayıda tekrar çözer.', '@functools.cache ekle ya da son iki değeri tutan bir döngüye çevir (n = 500\'de özyineleme derinliği de sorun olabilir).'],
      why: 'İki hata vardı: temel durum yanlıştı (0 basamak için 1 yol vardır) ve hatırlamayan özyineleme O(2^n) çalışıyordu. Aşağıdan yukarı tablo yalnız son iki değeri tutar: O(n) zaman, O(1) bellek, özyineleme derinliği sorunu da yok.'
    },
    {
      t: 'code',
      stage: 'Meydan okuma',
      id: 'algoritmalar-10',
      diff: 3,
      q: '<p>İki sistemden gelen adres ya da ürün kodu kayıtlarını eşleştirmek için en uzun ortak alt diziyi (LCS) bul: <code>ortak_alt_dizi(a, b)</code> <code>(uzunluk, dizi)</code> demetini döndürsün. <code>dizi</code>, hem <code>a</code>\'nın hem <code>b</code>\'nin alt dizisi (karakterlerin sırası korunur, ardışık olmaları gerekmez) olan en uzun metinlerden <b>biridir</b>. Dinamik programlama tablosu kur ve çözümü geriye doğru izleyerek (backtracking) metni oluştur. 400 × 400 karakterlik girdide de hızlı çalışmalı (O(n·m)).</p>',
      start: 'def ortak_alt_dizi(a, b):\n    pass\n',
      sol: 'def ortak_alt_dizi(a, b):\n    n, m = len(a), len(b)\n    T = [[0] * (m + 1) for _ in range(n + 1)]\n    for i in range(1, n + 1):\n        ai, onceki, satir = a[i - 1], T[i - 1], T[i]\n        for j in range(1, m + 1):\n            if ai == b[j - 1]:\n                satir[j] = onceki[j - 1] + 1\n            else:\n                satir[j] = max(onceki[j], satir[j - 1])\n    i, j, parcalar = n, m, []\n    while i and j:\n        if a[i - 1] == b[j - 1]:\n            parcalar.append(a[i - 1]); i -= 1; j -= 1\n        elif T[i - 1][j] >= T[i][j - 1]:\n            i -= 1\n        else:\n            j -= 1\n    return T[n][m], "".join(reversed(parcalar))\n',
      tests: 'def _alt_mi(s, t):\n    it = iter(t)\n    return all(ch in it for ch in s)\nfor _a, _b, _n in [("ATATÜRK CAD", "ATATURK CADDESI", 10), ("KIZILAY", "KIZILCAHAMAM", 6), ("ABC", "XYZ", 0), ("", "ABC", 0), ("AM-2026-117", "AM-2026-117", 11)]:\n    _u, _d = ortak_alt_dizi(_a, _b)\n    assert _u == _n, f"{_a!r} / {_b!r}: uzunluk {_n} olmalı, gelen {_u}"\n    assert len(_d) == _u and _alt_mi(_d, _a) and _alt_mi(_d, _b), f"{_d!r} iki metnin de alt dizisi olmalı ve uzunluğu {_u} olmalı"\nimport random as _r\n_r.seed(1)\n_x = "".join(_r.choice("ACGT") for _ in range(400))\n_y = "".join(_r.choice("ACGT") for _ in range(400))\n_u, _d = ortak_alt_dizi(_x, _y)\nassert _u > 200 and len(_d) == _u and _alt_mi(_d, _x) and _alt_mi(_d, _y), "400x400 girdide geçerli LCS"\n',
      hints: [
        'T[i][j]: a\'nın ilk i, b\'nin ilk j karakterinin LCS uzunluğu. Karakterler eşitse T[i-1][j-1] + 1, değilse max(T[i-1][j], T[i][j-1]).',
        'Metni kurmak için T[n][m]\'den geriye yürü: karakterler eşitse ekle ve çapraz git; değilse daha büyük komşuya (yukarı ya da sola) git.',
        'Geriye yürürken toplanan karakterleri en sonda ters çevir.'
      ],
      why: 'LCS, örtüşen alt problemlerin klasik örneğidir: her (i, j) hücresi bir kez hesaplanır, O(n·m). Geri izleme tabloyu kurarken verilen kararları tersine okuyarak çözümün kendisini çıkarır; diff araçlarının "eklenen/silinen satır" çıktısı da böyle üretilir.'
    },
    {
      t: 'code',
      stage: 'Meydan okuma',
      id: 'algoritmalar-11',
      diff: 3,
      q: '<p>Depo robotu raflar arasında yalnızca yukarı, aşağı, sola ve sağa hareket edebiliyor. <code>en_kisa_rota(harita)</code> fonksiyonunu <b>BFS</b> ile yaz: <code>harita</code> eşit uzunlukta metinlerden oluşan bir listedir; <code>"S"</code> başlangıç, <code>"H"</code> hedef, <code>"#"</code> raf (geçilemez), <code>"."</code> boş koridordur. Fonksiyon S\'den H\'ye en az adım sayısını döndürsün; ulaşılamıyorsa -1. 300×300\'lük haritada da hızlı çalışmalı.</p>',
      start: 'from collections import deque\n\ndef en_kisa_rota(harita):\n    pass\n',
      sol: 'from collections import deque\n\ndef en_kisa_rota(harita):\n    satir, sutun = len(harita), len(harita[0]) if harita else 0\n    bas = next((r, c) for r in range(satir) for c in range(sutun) if harita[r][c] == "S")\n    mesafe = {bas: 0}\n    kuyruk = deque([bas])\n    while kuyruk:\n        r, c = kuyruk.popleft()\n        if harita[r][c] == "H":\n            return mesafe[(r, c)]\n        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n            nr, nc = r + dr, c + dc\n            if 0 <= nr < satir and 0 <= nc < sutun and harita[nr][nc] != "#" and (nr, nc) not in mesafe:\n                mesafe[(nr, nc)] = mesafe[(r, c)] + 1\n                kuyruk.append((nr, nc))\n    return -1\n',
      tests: '_h1 = ["S.#.....",\n       ".##.###.",\n       "....#H..",\n       ".##.#...",\n       "........"]\nassert en_kisa_rota(_h1) == 11, f"en kısa rota 11 adım, gelen {en_kisa_rota(_h1)}"\nassert en_kisa_rota(["S#H"]) == -1, "raf yolu kapatıyorsa -1"\nassert en_kisa_rota(["SH"]) == 1\nassert en_kisa_rota(["H..", "...", "..S"]) == 4\n_n = 300\n_b = ["S" + "." * (_n - 1)] + ["." * _n for _ in range(_n - 2)] + ["." * (_n - 1) + "H"]\nassert en_kisa_rota(_b) == 2 * (_n - 1), "300x300 boş haritada Manhattan mesafesi"\n',
      hints: ['Izgara bir graftır: her hücre düğüm, komşu 4 hücre kenardır.', 'BFS: deque ile başla, mesafe sözlüğü hem ziyaret kaydı hem adım sayısıdır. Kuyruktan ilk çıkan H en kısa mesafededir.', 'Sınır kontrolü: 0 <= nr < satir ve 0 <= nc < sutun; raf ("#") ve görülmüş hücreleri atla.'],
      why: 'Ağırlıksız grafta BFS hücreleri mesafe sırasıyla gezer; hedef kuyruktan ilk çıktığında bulunan mesafe en kısadır. Her hücre bir kez kuyruğa girdiği için O(satır × sütun) çalışır. DFS ilk bulduğu yolu verirdi, en kısayı değil.'
    },
    {
      t: 'code',
      stage: 'Mini proje',
      id: 'algoritmalar-12',
      diff: 3,
      q: '<p><b>Satış analizi motoru:</b> Anadolu Market finans ekibi için <code>SatisAnalizi</code> sınıfını yaz. Kurucuya <code>gunluk</code> (negatif olmayan günlük ciro listesi) verilir; önek toplamı <b>bir kez</b> kurucuda hesaplanır.</p><ul><li><code>aralik(i, j)</code>: i..j günleri (dahil) toplam ciro, O(1).</li><li><code>hedefe_ulasilan_gun(hedef)</code>: kümülatif ciro ilk hangi gün <code>hedef</code>\'e ulaşıyor (≥), o günün indeksi; ulaşılamıyorsa -1. Önek dizisi üzerinde <code>bisect</code> ile O(log n).</li><li><code>en_iyi_donem(k)</code>: toplamı en yüksek olan k ardışık günün <code>(baslangic, toplam)</code> demeti; eşitlikte en erken. k geçersizse (≤ 0 ya da gün sayısından büyük) <code>ValueError</code>.</li><li><code>zirve_gunler(k)</code>: en yüksek cirolu k günün indeksleri, ciroya göre azalan, eşitlikte küçük indeks önce (<code>heapq.nlargest</code> kullanabilirsin).</li><li><code>medyan()</code>: günlük ciroların medyanı (çift sayıda günde ortadaki ikisinin ortalaması).</li></ul>',
      start: 'import bisect\nimport heapq\n\nclass SatisAnalizi:\n    def __init__(self, gunluk):\n        self.gunluk = list(gunluk)\n',
      sol: 'import bisect\nimport heapq\n\nclass SatisAnalizi:\n    def __init__(self, gunluk):\n        self.gunluk = list(gunluk)\n        self.onek = [0]\n        for c in self.gunluk:\n            self.onek.append(self.onek[-1] + c)\n\n    def aralik(self, i, j):\n        return self.onek[j + 1] - self.onek[i]\n\n    def hedefe_ulasilan_gun(self, hedef):\n        k = bisect.bisect_left(self.onek, hedef, lo=1)\n        return k - 1 if k < len(self.onek) else -1\n\n    def en_iyi_donem(self, k):\n        if not 0 < k <= len(self.gunluk):\n            raise ValueError(f"Geçersiz dönem uzunluğu: {k}")\n        en_iyi = (0, self.aralik(0, k - 1))\n        for bas in range(1, len(self.gunluk) - k + 1):\n            t = self.aralik(bas, bas + k - 1)\n            if t > en_iyi[1]:\n                en_iyi = (bas, t)\n        return en_iyi\n\n    def zirve_gunler(self, k):\n        en_yuksek = heapq.nlargest(k, ((c, -i) for i, c in enumerate(self.gunluk)))\n        return [-eksi_i for _, eksi_i in en_yuksek]\n\n    def medyan(self):\n        s = sorted(self.gunluk)\n        n = len(s)\n        orta = n // 2\n        return s[orta] if n % 2 else (s[orta - 1] + s[orta]) / 2\n',
      tests: '_c = [120, 80, 400, 90, 300, 50, 600, 400]\ns = SatisAnalizi(_c)\nassert s.aralik(2, 4) == 790 and s.aralik(0, 7) == 2040, "aralık toplamı"\nassert s.hedefe_ulasilan_gun(600) == 2, "120+80+400 = 600: 2. gün hedefe ulaşılır (≥)"\nassert s.hedefe_ulasilan_gun(601) == 3 and s.hedefe_ulasilan_gun(1) == 0, "eşik testleri"\nassert s.hedefe_ulasilan_gun(5000) == -1, "ulaşılamayan hedef -1"\nassert s.en_iyi_donem(2) == (6, 1000), f"600+400 = 1000; gelen {s.en_iyi_donem(2)}"\nassert s.en_iyi_donem(1) == (6, 600) and s.en_iyi_donem(8) == (0, 2040)\nfor _k in (0, 9):\n    try:\n        s.en_iyi_donem(_k); assert False, f"k={_k} için ValueError"\n    except ValueError:\n        pass\nassert s.zirve_gunler(3) == [6, 2, 7], f"600 (6), 400 (2), 400 (7): eşitlikte küçük indeks önce; gelen {s.zirve_gunler(3)}"\nassert s.medyan() == 210.0, "çift sayıda gün: sıralı listede ortadaki iki değer 120 ve 300, medyan 210.0"\nassert SatisAnalizi([5, 1, 9]).medyan() == 5, "tek sayıda gün: ortadaki değer"\n',
      hints: [
        'Kurucuda önek dizisini kur: onek[0] = 0, onek[i + 1] = onek[i] + gunluk[i].',
        'Önek dizisi azalmaz; bisect_left(onek, hedef, lo=1) hedefe ilk ulaşılan önek konumunu verir, gün indeksi bunun bir eksiğidir.',
        'zirve için (ciro, -indeks) demetleriyle heapq.nlargest: eşit ciroda -indeks büyük olan (yani küçük indeks) önce gelir.'
      ],
      why: 'Tek bir ön hesaplama (önek dizisi) üç farklı soruyu ucuzlatır: aralık toplamı O(1), eşik günü O(log n), k-günlük dönem taraması O(n). Bu, gerçek analitik sistemlerin (OLAP küpleri, materialized view) arkasındaki fikrin küçük bir örneğidir.'
    }
  ],
  faq: [
    {
      q: 'Kendi sıralama algoritmamı ne zaman yazarım?',
      a: 'Neredeyse hiçbir zaman: üretimde sorted ve list.sort kullanırsın. Sıfırdan yazmak mülakatlar, kavramı anlamak ve çok özel durumlar (dış bellek sıralaması, akan veride birleştirme) içindir. Asıl beceri doğru key fonksiyonunu ve doğru veri yapısını seçmektir.'
    },
    {
      q: 'Big-O küçük veride önemli mi?',
      a: 'Az. 100 elemanlık listede O(n²) ile O(n log n) arasındaki fark mikrosaniyelerdir; okunur kod daha değerlidir. Ama veri büyüyecekse (sipariş, log, işlem verisi hep büyür) karmaşıklığı baştan doğru seçmek, sonradan yeniden yazmaktan çok ucuzdur.'
    },
    {
      q: 'Dinamik programlama problemini nasıl tanırım?',
      a: 'İki işaret ara: (1) en iyi/kaç yol/en uzun gibi bir optimizasyon ya da sayma sorusu, (2) problemin aynı alt problemleri tekrar tekrar içermesi. Önce özyinelemeli tanımı yaz (yol(n) = yol(n-1) + yol(n-2)), sonra @cache ekle; çalışınca istersen tabloya çevir.'
    },
    {
      q: 'BFS mi DFS mi kullanmalıyım?',
      a: 'Ağırlıksız grafta en kısa yol ya da "en az adım" soruluyorsa BFS. Tüm bağlı parçaları bulmak, erişilebilirlik, döngü tespiti, ağaç gezintisi gibi işlerde DFS genelde daha basittir. İkisi de O(V + E); fark yalnızca kuyruk mu yığın mı kullandığındır.'
    }
  ],
  mistakes: [
    {
      bad: 'for s in siparisler:\n    for t in siparisler:\n        if s is not t and s["musteri"] == t["musteri"]:\n            supheli.add(s["no"])',
      good: 'gruplar = defaultdict(list)\nfor s in siparisler:\n    gruplar[s["musteri"]].append(s["no"])\nsupheli = {no for g in gruplar.values() if len(g) > 1 for no in g}',
      why: 'İç içe döngü O(n²): 1 milyon siparişte 10^12 karşılaştırma. Anahtara göre gruplamak tek geçiştir, O(n).'
    },
    {
      bad: 'i = bisect.bisect_left(fiyatlar, x)  # fiyatlar sırasız',
      good: 'fiyatlar.sort()\ni = bisect.bisect_left(fiyatlar, x)',
      why: 'bisect sırasız listede hata vermez, sessizce yanlış konum döndürür. İkili arama sıralı veri gerektirir.'
    },
    {
      bad: 'def fib(n):\n    return n if n < 2 else fib(n - 1) + fib(n - 2)',
      good: '@functools.cache\ndef fib(n):\n    return n if n < 2 else fib(n - 1) + fib(n - 2)',
      why: 'Hatırlamayan özyineleme aynı alt problemleri üstel sayıda çözer; fib(40) yüz milyonlarca çağrı yapar. Önbellek O(n)\'e indirir.'
    },
    {
      bad: 'for (i, j) in sorgular:\n    print(sum(ciro[i:j + 1]))',
      good: 'onek = [0, *accumulate(ciro)]\nfor (i, j) in sorgular:\n    print(onek[j + 1] - onek[i])',
      why: 'Her sorguda dilim + sum O(n); çok sorguda O(n·q). Önek toplamı sorgu başına O(1).'
    },
    {
      bad: 'kupurler.sort(reverse=True)  # açgözlü her zaman en iyisidir',
      good: '# küpür seti standart değilse DP ile en az küpürü hesapla',
      why: 'Açgözlü yaklaşım {1, 3, 4} gibi kümelerde yanlış sonuç verir (6 = 4+1+1 yerine 3+3). Doğruluğu kanıtlanmamış açgözlü seçim yerine DP kullan.'
    }
  ]
}
);
})(window);
