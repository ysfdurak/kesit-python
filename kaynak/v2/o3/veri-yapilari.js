/* PythonPatika — v2 o3: Veri yapıları: yığın, kuyruk, öncelik kuyruğu, bağlı liste, hash, ağaç ve graf */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{
  id: 'veri-yapilari',
  lv: 'orta',
  mod: 'Veri Yapıları ve Algoritmalar',
  min: 50,
  title: 'Veri yapıları: yığın, kuyruk, öncelik kuyruğu, bağlı liste, hash, ağaç ve graf',
  sum: 'Yığın, kuyruk, öncelik kuyruğu, bağlı liste, hash tablosu, ikili arama ağacı ve grafı hem Python\'ın hazır araçlarıyla hem de sıfırdan sınıf yazarak öğrenir; her problem için doğru yapıyı karmaşıklık tablosuna bakarak seçersin.',
  goals: [
    'Yığını (list) ve kuyruğu (deque) doğru yerde kullanır, parantez dengesi ve geri al gibi problemleri çözebilirim.',
    'heapq ile eşit önceliklerde bile kararlı çalışan bir öncelik kuyruğu kurabilirim.',
    'Bağlı listeyi ve ikili arama ağacını sınıflarla sıfırdan yazıp ekle/ara/gez işlemlerini uygulayabilirim.',
    'dict ve set\'in hash ile nasıl çalıştığını, çakışmayı ve hashable olmanın anlamını açıklayabilirim.',
    'Grafı komşuluk listesiyle temsil eder, işlem karmaşıklığı tablosuna bakarak probleme uygun yapıyı seçebilirim.'
  ],
  body: `
<h2>Neden önemli?</h2>
<p>Anadolu Market'in çağrı merkezinde arayanlar sıraya girer; ilk arayan ilk konuşur. Şehir hastanesinin acil servisinde ise sıra geliş saatine göre değil, aciliyete göre belirlenir. Kampanya editöründe "geri al" tuşu en son yapılan işlemi geri çevirir. Lojistik ekibi depolar arasındaki yolları bir ağ olarak düşünür. Bu dört iş dört farklı <b>veri yapısı</b> (data structure) ister: kuyruk, öncelik kuyruğu, yığın ve graf.</p>
<p>Yanlış yapı seçmek kodu yanlış yapmaz ama yavaşlatır: 1 milyon elemanlı listede <code>pop(0)</code> her seferinde tüm elemanları kaydırır. Doğru yapı ise aynı işi sabit sürede yapar. Bu derste her yapının <b>ne işe yaradığını</b>, Python'daki <b>hazır karşılığını</b> ve mantığını kavramak için <b>sıfırdan nasıl yazıldığını</b> göreceksin. <code>deque</code>, <code>Counter</code> gibi araçlarla <b>collections ve itertools</b> dersinde, kümelerle <b>Demetler ve kümeler</b> dersinde tanışmıştın; burada onları veri yapısı gözüyle yeniden ele alıyoruz.</p>

<h2>Yığın (stack): son giren ilk çıkar</h2>
<p>Yığın, üst üste konmuş tabaklar gibidir: en son koyduğunu ilk alırsın (LIFO, last in first out). Python'da sıradan bir <code>list</code> mükemmel bir yığındır: <code>append</code> üste koyar, <code>pop()</code> üstten alır, <code>[-1]</code> üsttekine bakar; üçü de O(1).</p>
<pre class="py">def dengeli_mi(ifade):
    eslesme = {")": "(", "]": "[", "}": "{"}
    yigin = []
    for ch in ifade:
        if ch in "([{":
            yigin.append(ch)                       # açılanı üste koy
        elif ch in eslesme:
            if not yigin or yigin.pop() != eslesme[ch]:
                return False                       # kapanış, üstteki açılışla eşleşmeli
    return not yigin                               # açık kalan olmamalı

for f in ["(fiyat * [1 + kdv])", "{indirim: (10]", "((tutar)", ""]:
    print(repr(f), dengeli_mi(f))</pre>
<p>Derleyiciler, JSON ayrıştırıcıları ve hesap makineleri iç içe yapıları böyle kontrol eder. Yığının bir başka klasik kullanımı <b>geri al</b> (undo) özelliğidir: her işlem yığına konur, geri al en üsttekini çıkarır. Fonksiyon çağrıları da bir yığında tutulur; özyinelemede gördüğün <code>RecursionError</code> bu çağrı yığınının (call stack) taşmasıdır.</p>

<h2>Kuyruk (queue): ilk giren ilk çıkar</h2>
<p>Kuyruk, banka gişesindeki sıradır (FIFO, first in first out). Liste ile kuyruk yapmak tuzaktır: <code>liste.pop(0)</code> baştaki elemanı çıkarınca geri kalan tüm elemanları bir sola kaydırır, yani O(n)'dir. <code>collections.deque</code> (double-ended queue, iki uçlu kuyruk) iki uçta da O(1) ekler ve çıkarır.</p>
<pre class="py">from collections import deque
cagri = deque()
for musteri in ["Ayşe (sipariş)", "Mehmet (iade)", "Zeynep (kargo)"]:
    cagri.append(musteri)                 # sıranın sonuna
cagri.appendleft("Can (VIP)")             # VIP öne geçer
while cagri:
    print("Görüşülüyor:", cagri.popleft(), "| bekleyen:", len(cagri))

son_islemler = deque(maxlen=3)            # sabit boyutlu pencere
for no in range(101, 106):
    son_islemler.append(no)
print(son_islemler)</pre>
<p><code>maxlen</code> verilen bir deque dolunca yeni eleman eklendikçe öbür uçtaki en eski eleman düşer: "son 100 işlem", "son 5 dakikanın logları" için idealdir. İş parçacıkları (thread) arasında güvenli kuyruk gerekiyorsa <code>queue.Queue</code> kullanılır; onu <b>Eşzamanlılık</b> dersinde göreceksin.</p>

<h2>Öncelik kuyruğu: heapq</h2>
<p>Acil serviste sıra aciliyete göredir: kırmızı alan hastası, sarı alandakinden önce muayene edilir. <b>Öncelik kuyruğu</b> (priority queue) her zaman en öncelikli elemanı verir. Python'da <code>heapq</code> modülü, sıradan bir listeyi <b>ikili yığın</b> (binary heap) olarak düzenler: en küçük eleman hep <code>h[0]</code>'dadır; ekleme ve çıkarma O(log n)'dir.</p>
<pre class="py">import heapq
from itertools import count

sira = count()                       # eşit öncelikte geliş sırası
bekleyenler = []
for ad, oncelik in [("Ali", 3), ("Elif", 1), ("Burak", 2), ("Seda", 1)]:
    heapq.heappush(bekleyenler, (oncelik, next(sira), ad))   # 1 = en acil

while bekleyenler:
    oncelik, _, ad = heapq.heappop(bekleyenler)
    print(f"{ad} (öncelik {oncelik})")

tutarlar = [250, 1999, 75, 4300, 860, 120]
print(heapq.nlargest(3, tutarlar), heapq.nsmallest(2, tutarlar))</pre>
<p>Demetler (tuple) sırayla karşılaştırılır: önce öncelik, eşitse ikinci eleman. Araya bir <b>sıra numarası</b> koymak iki işe yarar: eşit öncelikte ilk gelen önce çıkar (kararlılık) ve Python hiçbir zaman üçüncü elemanı (karşılaştırılamayan bir sözlük ya da nesne olabilir) karşılaştırmak zorunda kalmaz. <code>heapq</code> yalnızca en küçüğü verir; en büyüğü istiyorsan önceliği eksiyle sakla: <code>(-tutar, ...)</code>.</p>
<div class="warn"><b>Yığın sıralı liste değildir</b><code>print(bekleyenler)</code> yazdığında listenin sıralı olmadığını görürsün; yalnızca <code>h[0]</code>'ın en küçük olduğu garanti edilir. Tüm sırayı görmek için <code>sorted(h)</code> kullan; ama bunu her adımda yaparsan yığının avantajını kaybedersin.</div>

<h2>Bağlı liste: düğümler zinciri</h2>
<p><b>Bağlı liste</b> (linked list), her biri bir değer ve bir sonraki düğüme bağlantı taşıyan düğümlerden (node) oluşur. Başa ekleme O(1)'dir ve hiçbir eleman kaydırılmaz; buna karşılık i'inci elemana erişmek için baştan yürümek gerekir, O(n). Python'da günlük işte bağlı liste yazmazsın (deque zaten içeride bağlı bloklar kullanır), ama mülakatlarda ve "referans" kavramını oturtmakta çok değerlidir.</p>
<pre class="py">class Dugum:
    def __init__(self, deger, sonraki=None):
        self.deger = deger
        self.sonraki = sonraki

class BagliListe:
    def __init__(self):
        self.bas = None
        self.uzunluk = 0
    def basa_ekle(self, deger):
        self.bas = Dugum(deger, self.bas)   # yeni düğüm eski başı gösterir
        self.uzunluk += 1
    def __iter__(self):
        dugum = self.bas
        while dugum:
            yield dugum.deger
            dugum = dugum.sonraki
    def ters_cevir(self):
        onceki, dugum = None, self.bas
        while dugum:
            dugum.sonraki, onceki, dugum = onceki, dugum, dugum.sonraki
        self.bas = onceki

rota = BagliListe()
for durak in ["Bursa", "Ankara", "İstanbul"]:
    rota.basa_ekle(durak)
print(list(rota), rota.uzunluk)
rota.ters_cevir()
print(" -&gt; ".join(rota))</pre>
<p><code>__iter__</code>'ı üreteçle yazınca sınıf <code>list()</code>, <code>for</code> ve <code>join</code> ile doğal çalışır. Ters çevirme, üç işaretçiyle (önceki, şimdiki, sonraki) yerinde yapılır; klasik bir mülakat sorusudur.</p>

<h2>Hash tablosu: dict ve set nasıl bu kadar hızlı?</h2>
<p>Sözlükte <code>d["AM-1042"]</code> araması, sözlükte 10 ya da 10 milyon eleman olsa da ortalama aynı sürede biter. Sırrı <b>hash tablosu</b>dur: anahtar <code>hash()</code> fonksiyonuyla bir tam sayıya çevrilir, bu sayıdan bir <b>kova</b> (bucket) indeksi hesaplanır (<code>hash(anahtar) % kova_sayisi</code>) ve değer doğrudan o kovaya gider. Aramada aynı hesap tekrar yapılır; tarama yoktur.</p>
<p>İki farklı anahtar aynı kovaya düşebilir: buna <b>çakışma</b> (collision) denir. Çözümlerden biri her kovada küçük bir liste tutmaktır (zincirleme, chaining); CPython ise boş kova arayarak ilerleyen açık adresleme (open addressing) kullanır. Tablo dolmaya başlayınca (doluluk oranı, load factor) kova sayısı büyütülür ve her şey yeniden yerleştirilir; bu yüzden ekleme "amortize" O(1)'dir.</p>
<pre class="py">class MiniSozluk:
    def __init__(self, kova_sayisi=4):
        self.kovalar = [[] for _ in range(kova_sayisi)]
    def _kova(self, anahtar):
        return self.kovalar[hash(anahtar) % len(self.kovalar)]
    def koy(self, anahtar, deger):
        kova = self._kova(anahtar)
        for i, (a, _) in enumerate(kova):
            if a == anahtar:                 # aynı anahtar: güncelle
                kova[i] = (anahtar, deger)
                return
        kova.append((anahtar, deger))        # çakışma olsa da aynı kovaya eklenir
    def al(self, anahtar):
        for a, d in self._kova(anahtar):
            if a == anahtar:
                return d
        raise KeyError(anahtar)

s = MiniSozluk()
for kod, stok in [("SUT", 40), ("EKMEK", 120), ("PEYNIR", 15), ("YAG", 8), ("CAY", 60)]:
    s.koy(kod, stok)
s.koy("SUT", 35)
print(s.al("SUT"), s.al("CAY"))
print([len(k) for k in s.kovalar], "eleman/kova")
print(hash(1) == hash(1.0), {1: "a", 1.0: "b"})</pre>
<p>Son satır önemli bir kuralı gösterir: eşit olan nesnelerin hash'i de eşit olmalıdır. <code>1 == 1.0</code> olduğu için sözlük onları aynı anahtar sayar. Bu kuralın sonucu: <b>değişebilir</b> nesneler (list, dict, set) anahtar olamaz, çünkü içerikleri değişince hash'leri de değişir ve kayıt yanlış kovada kalır. Anahtar olabilen nesnelere <b>hashable</b> denir: int, str, tuple (içi de hashable ise), frozenset. Kendi sınıfında <code>__eq__</code> yazarsan <code>__hash__</code>'i de tutarlı yazmalısın; <code>@dataclass(frozen=True)</code> bunu senin için yapar.</p>

<h2>Küme işlemleri</h2>
<p><code>set</code> değeri olmayan bir hash tablosudur: üyelik testi O(1), tekrarları otomatik atar. Kampanya hedeflemede kümeler doğal dildir:</p>
<pre class="py">sut_alan = {"m1", "m2", "m3", "m5"}
kahve_alan = {"m2", "m3", "m4"}
sadik = {"m3", "m5", "m9"}
print(sorted(sut_alan &amp; kahve_alan))          # kesişim: ikisini de alan
print(sorted(sut_alan | kahve_alan))          # birleşim
print(sorted(sut_alan - kahve_alan))          # fark: süt alıp kahve almayan
print(sorted(sut_alan ^ kahve_alan))          # yalnız birini alan
print((sut_alan &amp; kahve_alan) &lt;= (sut_alan | sadik))   # alt küme mi?
segmentler = {frozenset({"süt", "kahve"}): 2}  # frozenset sözlük anahtarı olabilir
print(segmentler[frozenset({"kahve", "süt"})])</pre>

<h2>İkili arama ağacı (BST)</h2>
<p><b>Ağaç</b> (tree), kökten dallanan düğümlerden oluşur. <b>İkili arama ağacında</b> (binary search tree) her düğümün solundaki tüm değerler ondan küçük, sağındakiler büyüktür. Bu kural sayesinde arama her adımda yarı yarıya daralır; ağaç dengeliyse ekleme ve arama O(log n)'dir. Ağacı <b>sıralı gezmek</b> (in-order: sol, kök, sağ) değerleri küçükten büyüğe verir.</p>
<pre class="py">class Dugum:
    def __init__(self, deger):
        self.deger, self.sol, self.sag = deger, None, None

def ekle(kok, deger):
    if kok is None:
        return Dugum(deger)
    if deger &lt; kok.deger:
        kok.sol = ekle(kok.sol, deger)
    elif deger &gt; kok.deger:
        kok.sag = ekle(kok.sag, deger)
    return kok                                  # eşitse eklenmez

def ara(kok, deger):
    while kok and kok.deger != deger:
        kok = kok.sol if deger &lt; kok.deger else kok.sag
    return kok is not None

def sirali(kok):
    return sirali(kok.sol) + [kok.deger] + sirali(kok.sag) if kok else []

def yukseklik(kok):
    return 1 + max(yukseklik(kok.sol), yukseklik(kok.sag)) if kok else 0

kok = None
for fiyat in [50, 30, 70, 20, 40, 60, 80]:
    kok = ekle(kok, fiyat)
print(sirali(kok), ara(kok, 60), ara(kok, 65), yukseklik(kok))
sirali_giris = None
for fiyat in range(1, 8):
    sirali_giris = ekle(sirali_giris, fiyat)
print("sıralı eklenince yükseklik:", yukseklik(sirali_giris))</pre>
<p>Son satır BST'nin zayıf noktasıdır: veriyi sıralı eklersen ağaç bir zincire (bağlı listeye) dönüşür ve işlemler O(n) olur. Gerçek sistemler bunu önlemek için kendini dengeleyen ağaçlar (AVL, kırmızı-siyah) ya da veritabanlarında B-ağaçları kullanır. Veritabanı indeksleri (index) tam olarak budur.</p>

<h2>Graf: komşuluk listesi</h2>
<p><b>Graf</b> (graph), düğümler (vertex) ve onları bağlayan kenarlardan (edge) oluşur: depolar ve yollar, kullanıcılar ve takip ilişkileri, banka hesapları ve para transferleri. Python'da en pratik temsil <b>komşuluk listesi</b>dir (adjacency list): her düğüm için komşularının listesi ya da kümesi.</p>
<pre class="py">from collections import defaultdict
yollar = [("Gebze", "İstanbul"), ("Gebze", "Bursa"), ("Bursa", "İzmir"), ("Ankara", "Bursa")]
graf = defaultdict(set)
for a, b in yollar:            # yönsüz: iki yöne de ekle
    graf[a].add(b)
    graf[b].add(a)
for depo in sorted(graf):
    print(depo, "-&gt;", sorted(graf[depo]))
en_bagli = max(sorted(graf), key=lambda d: len(graf[d]))
print("En çok bağlantı:", en_bagli, len(graf[en_bagli]))
print("Bursa-İzmir yolu var mı?", "İzmir" in graf["Bursa"])</pre>
<p>Kenar sayısı az olan (seyrek) graflarda komşuluk listesi bellek dostudur. Alternatif olan <b>komşuluk matrisi</b> (n×n tablo) "iki düğüm bağlı mı" sorusunu O(1) yanıtlar ama n² bellek ister. Graf üzerinde gezinme (BFS, DFS) ve en kısa yol <b>Algoritmalar</b> dersinin konusu.</p>

<h2>Karmaşıklık tablosu</h2>
<div class="tbl-wrap"><table>
<tr><th>İşlem</th><th>list</th><th>deque</th><th>dict</th><th>set</th><th>heapq</th></tr>
<tr><td>Sona ekle / çıkar</td><td>O(1)</td><td>O(1)</td><td>-</td><td>-</td><td>push/pop O(log n)</td></tr>
<tr><td>Başa ekle / çıkar</td><td>O(n)</td><td>O(1)</td><td>-</td><td>-</td><td>-</td></tr>
<tr><td>İndeksle erişim</td><td>O(1)</td><td>O(n) (uçlarda O(1))</td><td>-</td><td>-</td><td>en küçük h[0] O(1)</td></tr>
<tr><td>Var mı? (<code>in</code>)</td><td>O(n)</td><td>O(n)</td><td>O(1) ort.</td><td>O(1) ort.</td><td>O(n)</td></tr>
<tr><td>Anahtarla ekle/sil</td><td>-</td><td>-</td><td>O(1) ort.</td><td>O(1) ort.</td><td>-</td></tr>
<tr><td>Ortadan silme</td><td>O(n)</td><td>O(n)</td><td>O(1)</td><td>O(1)</td><td>O(n)</td></tr>
</table></div>
<div class="tbl-wrap"><table>
<tr><th>Problem</th><th>Yapı</th><th>Neden?</th></tr>
<tr><td>Geri al, parantez dengesi, DFS</td><td>Yığın (list)</td><td>En son eklenen ilk lazım</td></tr>
<tr><td>Çağrı merkezi, iş kuyruğu, BFS</td><td>Kuyruk (deque)</td><td>Geliş sırası korunur, iki uç O(1)</td></tr>
<tr><td>Acil servis, zamanlayıcı, en büyük k</td><td>Öncelik kuyruğu (heapq)</td><td>En öncelikli her an O(log n)</td></tr>
<tr><td>Müşteri no ile kayıt, sayım, önbellek</td><td>dict</td><td>Anahtarla O(1) erişim</td></tr>
<tr><td>Kara liste, tekrar ayıklama, segment</td><td>set</td><td>Üyelik O(1), küme cebiri</td></tr>
<tr><td>Sıralı veride aralık sorgusu</td><td>Sıralı liste + bisect / ağaç</td><td>O(log n) arama</td></tr>
<tr><td>Rota, ağ, ilişki</td><td>Graf (dict of set)</td><td>Bağlantıları doğal temsil eder</td></tr>
</table></div>
<div class="tip"><b>Seçim için üç soru</b>Hangi işlemi en sık yapacağım (ekleme mi, arama mı, en küçüğü almak mı)? Sıra önemli mi? Veri ne kadar büyük olacak? Bu üç sorunun cevabı yapıyı neredeyse her zaman belirler.</div>
<div class="note"><b>Gerçek işte</b>Üretimde gördüğün yavaşlıkların büyük kısmı yanlış veri yapısından gelir: döngü içinde listeye <code>in</code> ile bakmak (set olmalıydı), kuyruğu <code>pop(0)</code> ile işlemek (deque olmalıydı), en büyük 10 kaydı bulmak için milyon satırı sıralamak (<code>heapq.nlargest</code> yeterdi). Kod incelemesinde "bu döngünün içinde ne arıyoruz ve hangi yapıda?" sorusu, profil almadan önce bile birçok sorunu yakalar. Celery, RQ gibi iş kuyrukları, işletim sistemi zamanlayıcıları ve Redis'in sorted set'leri bu dersteki yapıların endüstriyel sürümleridir.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>LRU önbellek = sözlük + sıra</h3>
<p>En az kullanılanı atan önbellek (LRU cache), O(1) erişim için hash tablosu, O(1) "en eskiyi at" için çift yönlü bağlı liste birleştirir. Python'da <code>OrderedDict</code> ile <code>move_to_end</code> ve <code>popitem(last=False)</code> bunu birkaç satırda verir; <code>functools.lru_cache</code> da içeride aynı fikri kullanır.</p>
<h3>Trie, union-find ve diğerleri</h3>
<p>Ön ek araması (otomatik tamamlama) için <b>trie</b> (önek ağacı), "bu iki hesap aynı gruba mı ait" sorusu için <b>union-find</b> (ayrık kümeler), aralık toplamları için <b>segment ağacı</b> kullanılır. Hepsinin ortak noktası: belirli bir soruyu ucuzlatmak için veriyi önceden düzenlemek.</p>
<h3>Hazır kütüphaneler</h3>
<p>Sıralı kalan bir koleksiyon için <code>sortedcontainers.SortedList</code>, graflar için <code>networkx</code>, büyük sayısal diziler için <code>numpy</code> kullanılır. Sıfırdan yazmayı bilmek, bu kütüphanelerin hangi işlemde hızlı hangisinde yavaş olduğunu sezmeni sağlar.</p>
<h3>Amortize maliyet</h3>
<p><code>list.append</code> bazen tüm diziyi daha büyük bir alana kopyalar (O(n)), ama bu seyrek olur ve kapasite her seferinde katlanarak büyüdüğü için ortalama maliyet O(1) kalır. Buna amortize (amortized) karmaşıklık denir; dict büyümesi de aynı mantıkla çalışır.</p>
</section>
`,
  ex: [
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Kampanya editörüne "geri al" (undo) özelliği ekleyeceksin: her düzenleme kaydedilecek ve geri al en son düzenlemeyi iptal edecek. Hangi yapı en uygundur?',
      o: [
        'Kuyruk (deque, popleft ile)',
        'Yığın (list, append ve pop ile)',
        'Küme (set)',
        'Öncelik kuyruğu (heapq)'
      ],
      a: 1,
      why: 'Geri al her zaman EN SON yapılan işlemi ister: son giren ilk çıkar (LIFO), yani yığın. Kuyruk en eski işlemi verirdi; küme sırayı tutmaz; öncelik kuyruğu öncelik değerine göre çalışır.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Çağrı merkezi kuyruğunda 1 milyon arama bekliyor ve her seferinde en baştakini alıyorsun. <code>liste.pop(0)</code> yerine <code>deque.popleft()</code> kullanmanın nedeni nedir?',
      o: [
        'deque daha az bellek kullanır, hız aynıdır',
        'pop(0) tüm elemanları kaydırır (O(n)); popleft O(1)\'dir',
        'pop(0) eleman döndürmez',
        'deque eşzamanlı (thread) çalışır, list çalışmaz'
      ],
      a: 1,
      why: 'Liste ardışık bir dizidir; baştan eleman çıkınca geri kalan herkes bir sola kayar. deque iki uçta da sabit sürede çalışır. pop(0) elemanı döndürür; bellek ve thread farkı asıl neden değildir.'
    },
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Neden <code>{["Ankara", "İzmir"]: 120}</code> TypeError verir ama <code>{("Ankara", "İzmir"): 120}</code> çalışır?',
      o: [
        'Listeler sözlükte değer olarak da kullanılamaz',
        'Demet daha az bellek kullandığı için tercih edilir',
        'Liste değişebilir olduğu için hashable değildir',
        'Sözlük anahtarları yalnızca metin ya da demet olabilir'
      ],
      a: 2,
      why: 'Anahtarın hash\'i, kaydın hangi kovada durduğunu belirler. Liste değişebilir; içeriği değişirse hash de değişir ve kayıt kaybolur. Bu yüzden Python listeyi hashable saymaz. Değer olarak liste serbesttir; anahtar olarak int, frozenset gibi başka hashable türler de kullanılabilir.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'import heapq\nh = []\nfor x in [5, 1, 4, 2]:\n    heapq.heappush(h, x)\nprint(heapq.heappop(h), heapq.heappop(h), h[0])\n',
      o: [
        '5 4 2',
        '1 2 4',
        '1 4 2',
        '5 1 4'
      ],
      a: 1,
      why: 'heapq bir min-yığındır: heappop her zaman en küçüğü çıkarır (1, sonra 2). Kalanlar 4 ve 5; en küçük her zaman h[0]\'dadır, yani 4. Ekleme sırası (5, 1, 4, 2) sonucu etkilemez.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'from collections import deque\nd = deque(maxlen=3)\nd.extend([1, 2, 3, 4, 5])\nd.appendleft(0)\nprint(d)\n',
      o: [
        'deque([0, 1, 2], maxlen=3)',
        'deque([0, 3, 4, 5], maxlen=3)',
        'deque([0, 3, 4], maxlen=3)',
        'deque([3, 4, 5], maxlen=3)'
      ],
      a: 2,
      why: 'maxlen=3 dolunca her yeni eleman öbür uçtan bir eleman düşürür. extend sonrası [3, 4, 5] kalır. appendleft(0) soldan ekler, bu yüzden SAĞdaki 5 düşer: [0, 3, 4]. deque hiçbir zaman maxlen\'den uzun olmaz.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'stok = {1: "elma", 1.0: "armut", True: "kiraz"}\nprint(stok, len(stok))\n',
      o: [
        '{1: \'elma\', 1.0: \'armut\', True: \'kiraz\'} 3',
        '{1: \'kiraz\'} 1',
        '{True: \'kiraz\'} 1',
        '{1: \'elma\'} 1'
      ],
      a: 1,
      why: '1 == 1.0 == True ve hash\'leri eşittir; sözlük üçünü AYNI anahtar sayar. İlk eklenen anahtar nesnesi (1) korunur, değer ise her atamada güncellenir ve sonuncusu (kiraz) kalır.'
    },
    {
      t: 'order',
      stage: 'Kodu oku',
      q: '<p>İkili arama ağacına değer ekleyen özyinelemeli <code>ekle(kok, deger)</code> fonksiyonunun satırlarını sırala. Küçükler sola, büyük ya da eşitler sağa gider; fonksiyon (alt) ağacın kökünü döndürür. <code>Dugum</code> sınıfı hazır.</p>',
      lines: ['def ekle(kok, deger):', '    if kok is None:', '        return Dugum(deger)', '    if deger < kok.deger:', '        kok.sol = ekle(kok.sol, deger)', '    else:', '        kok.sag = ekle(kok.sag, deger)', '    return kok'],
      tests: 'class Dugum:\n    def __init__(self, deger):\n        self.deger, self.sol, self.sag = deger, None, None\ndef _gez(k):\n    return _gez(k.sol) + [k.deger] + _gez(k.sag) if k else []\n_k = None\nfor _x in [50, 30, 70, 20, 40]:\n    _k = ekle(_k, _x)\nassert _gez(_k) == [20, 30, 40, 50, 70], "sıralı gezinti küçükten büyüğe olmalı"\nassert _k.deger == 50 and _k.sol.deger == 30 and _k.sag.deger == 70, "ilk eklenen kök olmalı, küçükler solda"\n',
      hint: 'Önce boş ağaç (temel durum) ele alınır; sonra karşılaştırmaya göre sol ya da sağ alt ağaca inilir; en sonda kök döndürülür.',
      why: 'Özyinelemenin temel durumu boş alt ağaçtır: orada yeni düğüm oluşur. Diğer durumda değer küçükse sol, değilse sağ alt ağaca eklenir ve dönen kök ilgili bağlantıya atanır.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'veri-yapilari-1',
      diff: 1,
      q: '<p>Anadolu Market\'in fiyat formülü editörü kaydetmeden önce parantezleri kontrol etmeli. <code>dengeli_mi(ifade)</code> fonksiyonunu bir <b>yığın</b> kullanarak yaz: <code>()</code>, <code>[]</code>, <code>{}</code> doğru sırayla açılıp kapanıyorsa True, aksi hâlde False döndürsün. Diğer karakterler yok sayılır; boş metin dengelidir.</p>',
      guide: ['Kapanışları açılışlara eşleyen bir sözlük kur: {")": "(", ...}.', 'Boş bir liste (yığın) oluştur.', 'Açılış karakterinde yığına ekle (append).', 'Kapanış karakterinde: yığın boşsa ya da pop() edilen açılış eşleşmiyorsa False döndür.', 'Döngü bitince yığın boşsa True (açık kalan yok).'],
      example: '# Yığın ile HTML etiketlerinin kapanışını kontrol etmek (benzer fikir)\netiketler = ["<b>", "<i>", "</i>", "</b>"]\nyigin = []\nfor e in etiketler:\n    if e.startswith("</"):\n        print(e, "kapatıyor:", yigin.pop())\n    else:\n        yigin.append(e)\nprint("açık kalan:", yigin)\n',
      start: 'def dengeli_mi(ifade):\n    eslesme = {")": "(", "]": "[", "}": "{"}\n    yigin = []\n    for ch in ifade:\n        # TODO: açılışsa yığına koy\n        # TODO: kapanışsa yığının üstüyle eşleştir\n        pass\n    return False\n',
      sol: 'def dengeli_mi(ifade):\n    eslesme = {")": "(", "]": "[", "}": "{"}\n    yigin = []\n    for ch in ifade:\n        if ch in "([{":\n            yigin.append(ch)\n        elif ch in eslesme:\n            if not yigin or yigin.pop() != eslesme[ch]:\n                return False\n    return not yigin\n',
      tests: 'assert dengeli_mi("(fiyat * [1 + kdv]) - {indirim}") is True, "doğru iç içe yapı dengeli"\nassert dengeli_mi("") is True, "boş metin dengelidir"\nassert dengeli_mi("([)]") is False, "([)] kesişiyor: ] gelince üstte ( var"\nassert dengeli_mi("((tutar)") is False, "açık kalan parantez varsa dengesiz"\nassert dengeli_mi("tutar)") is False, "açılmadan kapanan parantez: yığın boşken pop yapılmamalı"\nassert dengeli_mi("{[()()]}") is True\n',
      hints: ['En son açılan parantez ilk kapanmalı: bu LIFO, yani yığın.', 'Kapanışta önce "if not yigin" kontrolü yap; boş listeden pop IndexError verir.', 'Döngü sonunda return not yigin (yığında açılış kalmamalı).'],
      why: 'Her kapanış, en son açılmış ve henüz kapanmamış açılışla eşleşmelidir; yığının üstü tam olarak odur. Tek geçişte O(n) çalışır.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'veri-yapilari-2',
      diff: 1,
      q: '<p>Anadolu Market çağrı merkezi için <code>CagriKuyrugu</code> sınıfını <code>collections.deque</code> ile yaz:</p><ul><li><code>ekle(musteri)</code>: sıranın sonuna ekler.</li><li><code>vip_ekle(musteri)</code>: sıranın en önüne ekler.</li><li><code>siradaki()</code>: sıradaki müşteriyi çıkarıp döndürür; kuyruk boşsa <code>None</code>.</li><li><code>len(kuyruk)</code>: bekleyen sayısını verir (<code>__len__</code>).</li></ul>',
      guide: ['__init__ içinde self._sira = deque() oluştur.', 'ekle → append, vip_ekle → appendleft.', 'siradaki: kuyruk boşsa None, değilse popleft().', '__len__ → len(self._sira) döndür.'],
      example: 'from collections import deque\nyazici = deque(["rapor.pdf"])\nyazici.append("fatura.pdf")\nyazici.appendleft("ACIL.pdf")\nprint(yazici.popleft(), len(yazici))\n',
      start: 'from collections import deque\n\nclass CagriKuyrugu:\n    def __init__(self):\n        self._sira = deque()\n\n    def ekle(self, musteri):\n        # TODO\n        pass\n\n    def vip_ekle(self, musteri):\n        # TODO\n        pass\n\n    def siradaki(self):\n        # TODO: boşsa None\n        pass\n\n    def __len__(self):\n        return 0\n',
      sol: 'from collections import deque\n\nclass CagriKuyrugu:\n    def __init__(self):\n        self._sira = deque()\n\n    def ekle(self, musteri):\n        self._sira.append(musteri)\n\n    def vip_ekle(self, musteri):\n        self._sira.appendleft(musteri)\n\n    def siradaki(self):\n        return self._sira.popleft() if self._sira else None\n\n    def __len__(self):\n        return len(self._sira)\n',
      tests: 'k = CagriKuyrugu()\nfor m in ["Ayşe", "Mehmet", "Zeynep"]:\n    k.ekle(m)\nassert len(k) == 3, "3 müşteri beklemeli"\nassert k.siradaki() == "Ayşe", "ilk arayan ilk konuşur (FIFO)"\nk.vip_ekle("Can")\nassert k.siradaki() == "Can", "VIP en öne geçmeli"\nassert [k.siradaki(), k.siradaki()] == ["Mehmet", "Zeynep"], "kalanlar geliş sırasıyla"\nassert k.siradaki() is None and len(k) == 0, "boş kuyrukta None dönmeli, hata vermemeli"\n',
      hints: ['deque\'nin append, appendleft, popleft metotlarını kullan.', 'Boş deque False sayılır: if self._sira: ...', 'return self._sira.popleft() if self._sira else None'],
      why: 'deque iki uçta da O(1) olduğu için hem normal hem VIP ekleme ve sıradakini alma sabit sürededir. Sınıf, iç yapıyı (_sira) gizleyerek çağrı merkezi diline uygun bir arayüz sunar.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'veri-yapilari-3',
      diff: 2,
      q: '<p>Şehir hastanesi acil servisi için <code>AcilServis</code> sınıfını <code>heapq</code> ile yaz. Öncelik 1 en acil, 5 en hafif.</p><ul><li><code>hasta_ekle(ad, oncelik)</code></li><li><code>siradaki()</code>: en acil hastanın adını çıkarıp döndürür; <b>eşit öncelikte önce gelen</b> önce çağrılır; bekleyen yoksa <code>None</code>.</li><li><code>bekleyen_sayisi()</code></li></ul>',
      guide: ['__init__ içinde boş bir liste (yığın) ve itertools.count() ile bir sayaç oluştur.', 'hasta_ekle: heapq.heappush(self._yigin, (oncelik, next(self._sayac), ad)).', 'siradaki: yığın boşsa None; değilse heappop ile demeti al ve adı döndür.', 'bekleyen_sayisi: len(self._yigin).'],
      example: 'import heapq\nfrom itertools import count\ns = count()\ngorevler = []\nheapq.heappush(gorevler, (2, next(s), "yedekle"))\nheapq.heappush(gorevler, (1, next(s), "fatura kes"))\nheapq.heappush(gorevler, (2, next(s), "rapor"))\nprint([heapq.heappop(gorevler)[2] for _ in range(3)])\n',
      start: 'import heapq\nfrom itertools import count\n\nclass AcilServis:\n    def __init__(self):\n        self._yigin = []\n        self._sayac = count()\n\n    def hasta_ekle(self, ad, oncelik):\n        # TODO: (oncelik, sira_no, ad) demetini yığına koy\n        pass\n\n    def siradaki(self):\n        # TODO\n        pass\n\n    def bekleyen_sayisi(self):\n        return len(self._yigin)\n',
      sol: 'import heapq\nfrom itertools import count\n\nclass AcilServis:\n    def __init__(self):\n        self._yigin = []\n        self._sayac = count()\n\n    def hasta_ekle(self, ad, oncelik):\n        heapq.heappush(self._yigin, (oncelik, next(self._sayac), ad))\n\n    def siradaki(self):\n        if not self._yigin:\n            return None\n        return heapq.heappop(self._yigin)[2]\n\n    def bekleyen_sayisi(self):\n        return len(self._yigin)\n',
      tests: 'a = AcilServis()\nfor ad, o in [("Zeynep", 3), ("Ahmet", 1), ("Bora", 3), ("Ece", 2), ("Ali", 1)]:\n    a.hasta_ekle(ad, o)\nassert a.bekleyen_sayisi() == 5\n_s = [a.siradaki() for _ in range(5)]\nassert _s == ["Ahmet", "Ali", "Ece", "Zeynep", "Bora"], f"önce öncelik, eşitlikte geliş sırası: {_s}"\nassert a.siradaki() is None, "boşken None"\n',
      hints: ['heapq en küçüğü verir; öncelik 1 en acil olduğu için doğrudan kullanabilirsin.', 'Eşit öncelikte sıra için demete ikinci eleman olarak artan bir sayı koy: next(self._sayac).', 'return heapq.heappop(self._yigin)[2] — demetin üçüncü elemanı ad.'],
      why: 'Demetler soldan sağa karşılaştırılır: önce öncelik, eşitse sıra numarası. Sıra numarası benzersiz olduğu için ad hiç karşılaştırılmaz ve ilk gelen önce çıkar. Ekleme ve çıkarma O(log n).'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'veri-yapilari-4',
      diff: 2,
      q: '<p>Kampanya metni editörü için <code>Editor</code> sınıfını iki yığınla yaz:</p><ul><li><code>yaz(parca)</code>: metnin sonuna ekler; yeni yazma <b>ileri al geçmişini temizler</b>.</li><li><code>geri_al()</code>: son yazılan parçayı geri alır; geri alınacak yoksa hiçbir şey yapmaz.</li><li><code>ileri_al()</code>: son geri alınanı yeniden uygular; yoksa hiçbir şey yapmaz.</li><li><code>metin</code> özniteliği ya da özelliği (property) güncel metni verir.</li></ul>',
      start: 'class Editor:\n    def __init__(self):\n        pass\n',
      sol: 'class Editor:\n    def __init__(self):\n        self._parcalar = []\n        self._ileri = []\n\n    @property\n    def metin(self):\n        return "".join(self._parcalar)\n\n    def yaz(self, parca):\n        self._parcalar.append(parca)\n        self._ileri.clear()\n\n    def geri_al(self):\n        if self._parcalar:\n            self._ileri.append(self._parcalar.pop())\n\n    def ileri_al(self):\n        if self._ileri:\n            self._parcalar.append(self._ileri.pop())\n',
      tests: 'e = Editor()\nfor p in ["Kasım ", "indirimi ", "%20"]:\n    e.yaz(p)\nassert e.metin == "Kasım indirimi %20"\ne.geri_al(); e.geri_al()\nassert e.metin == "Kasım ", f"iki geri al sonrası: {e.metin!r}"\ne.ileri_al()\nassert e.metin == "Kasım indirimi ", "ileri al son geri alınanı uygulamalı"\ne.yaz("%30")\ne.ileri_al()\nassert e.metin == "Kasım indirimi %30", "yeni yazma ileri al geçmişini temizlemeli"\nfor _ in range(10):\n    e.geri_al()\nassert e.metin == "", "fazla geri al hata vermemeli"\n',
      hints: ['Biri yapılanlar, biri geri alınanlar için iki liste (yığın) tut.', 'geri_al: yapılanlardan pop → geri alınanlara append; ileri_al tersi.', 'yaz içinde self._ileri.clear() unutma; metin için "".join(...).'],
      why: 'Her metin editöründeki geri al/ileri al iki yığınla çalışır. Yeni bir işlem yapıldığında ileri al yığını temizlenir; aksi hâlde artık var olmayan bir "gelecek" yeniden uygulanırdı.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'veri-yapilari-5',
      diff: 2,
      q: '<p>Teslimat rotası için tek yönlü bir <code>BagliListe</code> sınıfı yaz (Python listesi ya da deque <b>kullanmadan</b>, <code>Dugum</code> nesneleriyle):</p><ul><li><code>basa_ekle(deger)</code> ve <code>sona_ekle(deger)</code>: ikisi de O(1) olmalı (son düğümü <code>self.son</code> ile takip et).</li><li><code>sil(deger)</code>: ilk eşleşen düğümü çıkarır, bulduysa True, yoksa False döndürür (baş ve son güncellemesine dikkat).</li><li><code>__len__</code> ve <code>__iter__</code> (değerleri baştan sona verir).</li></ul>',
      start: 'class Dugum:\n    def __init__(self, deger, sonraki=None):\n        self.deger = deger\n        self.sonraki = sonraki\n\nclass BagliListe:\n    def __init__(self):\n        self.bas = None\n        self.son = None\n        self._n = 0\n',
      sol: 'class Dugum:\n    def __init__(self, deger, sonraki=None):\n        self.deger = deger\n        self.sonraki = sonraki\n\nclass BagliListe:\n    def __init__(self):\n        self.bas = None\n        self.son = None\n        self._n = 0\n\n    def basa_ekle(self, deger):\n        self.bas = Dugum(deger, self.bas)\n        if self.son is None:\n            self.son = self.bas\n        self._n += 1\n\n    def sona_ekle(self, deger):\n        yeni = Dugum(deger)\n        if self.son is None:\n            self.bas = self.son = yeni\n        else:\n            self.son.sonraki = yeni\n            self.son = yeni\n        self._n += 1\n\n    def sil(self, deger):\n        onceki, dugum = None, self.bas\n        while dugum:\n            if dugum.deger == deger:\n                if onceki is None:\n                    self.bas = dugum.sonraki\n                else:\n                    onceki.sonraki = dugum.sonraki\n                if dugum is self.son:\n                    self.son = onceki\n                self._n -= 1\n                return True\n            onceki, dugum = dugum, dugum.sonraki\n        return False\n\n    def __len__(self):\n        return self._n\n\n    def __iter__(self):\n        dugum = self.bas\n        while dugum:\n            yield dugum.deger\n            dugum = dugum.sonraki\n',
      tests: 'r = BagliListe()\nr.sona_ekle("Ankara"); r.sona_ekle("Eskişehir"); r.basa_ekle("Gebze"); r.sona_ekle("İzmir")\nassert list(r) == ["Gebze", "Ankara", "Eskişehir", "İzmir"] and len(r) == 4, f"ekleme sırası yanlış: {list(r)}"\nassert r.sil("Eskişehir") is True and list(r) == ["Gebze", "Ankara", "İzmir"], "ortadan silme"\nassert r.sil("Gebze") is True and r.bas.deger == "Ankara", "baştan silince bas güncellenmeli"\nassert r.sil("İzmir") is True and r.son.deger == "Ankara", "sondan silince son güncellenmeli"\nr.sona_ekle("Bursa")\nassert list(r) == ["Ankara", "Bursa"], "son düzgün güncellenmezse sona ekleme kopar"\nassert r.sil("Van") is False and len(r) == 2, "olmayan değer False"\nassert r.sil("Ankara") and r.sil("Bursa") and r.bas is None and r.son is None and len(r) == 0, "hepsi silinince bas ve son None"\nr.sona_ekle("Sivas")\nassert list(r) == ["Sivas"]\nassert "list(" not in __source__.split("class BagliListe")[1].split("def __iter__")[0] and "deque" not in __source__, "iç yapı için list ya da deque kullanma"\n',
      hints: ['sona_ekle\'yi O(1) yapmak için self.son düğümünü sakla; liste boşken bas ve son aynı düğümdür.', 'sil için (onceki, dugum) ikilisiyle yürü; baştaki düğüm silinirse self.bas = dugum.sonraki.', 'Silinen düğüm son düğümse self.son = onceki olmalı; uzunluğu güncellemeyi unutma.'],
      why: 'Bağlı listede silme, bağlantıyı silinen düğümün üzerinden atlatmaktır (onceki.sonraki = dugum.sonraki). Asıl hata kaynakları kenar durumlardır: baş, son ve tek elemanlı liste; testler tam olarak bunları yoklar.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'veri-yapilari-6',
      diff: 2,
      q: '<p>Ürün fiyatlarını tutmak için <code>FiyatAgaci</code> sınıfını ikili arama ağacı olarak yaz:</p><ul><li><code>ekle(fiyat)</code>: tekrarlanan değer eklenmez.</li><li><code>__contains__(fiyat)</code>: <code>45 in agac</code> çalışsın; özyineleme değil <b>döngüyle</b> ara.</li><li><code>sirali()</code>: değerleri küçükten büyüğe liste olarak döndürür.</li><li><code>aralik(alt, ust)</code>: <code>alt &lt;= fiyat &lt;= ust</code> olanları sıralı döndürür; aralık dışındaki alt ağaçlara <b>inmesin</b>.</li><li><code>__len__</code></li></ul>',
      start: 'class FiyatAgaci:\n    pass\n',
      sol: 'class _Dugum:\n    __slots__ = ("deger", "sol", "sag")\n    def __init__(self, deger):\n        self.deger, self.sol, self.sag = deger, None, None\n\nclass FiyatAgaci:\n    def __init__(self):\n        self.kok = None\n        self._n = 0\n\n    def ekle(self, fiyat):\n        if self.kok is None:\n            self.kok = _Dugum(fiyat); self._n += 1; return\n        d = self.kok\n        while True:\n            if fiyat == d.deger:\n                return\n            yon = "sol" if fiyat < d.deger else "sag"\n            cocuk = getattr(d, yon)\n            if cocuk is None:\n                setattr(d, yon, _Dugum(fiyat)); self._n += 1; return\n            d = cocuk\n\n    def __contains__(self, fiyat):\n        d = self.kok\n        while d:\n            if fiyat == d.deger:\n                return True\n            d = d.sol if fiyat < d.deger else d.sag\n        return False\n\n    def sirali(self):\n        return self.aralik(float("-inf"), float("inf"))\n\n    def aralik(self, alt, ust):\n        sonuc = []\n        def gez(d):\n            if d is None:\n                return\n            if alt < d.deger:\n                gez(d.sol)\n            if alt <= d.deger <= ust:\n                sonuc.append(d.deger)\n            if d.deger < ust:\n                gez(d.sag)\n        gez(self.kok)\n        return sonuc\n\n    def __len__(self):\n        return self._n\n',
      tests: 'a = FiyatAgaci()\nfor f in [50, 30, 70, 20, 40, 60, 80, 40, 35]:\n    a.ekle(f)\nassert len(a) == 8, "tekrarlanan 40 eklenmemeli"\nassert a.sirali() == [20, 30, 35, 40, 50, 60, 70, 80], "sıralı gezinti"\nassert 35 in a and 65 not in a, "__contains__ çalışmalı"\nassert a.aralik(33, 60) == [35, 40, 50, 60], "aralık sorgusu (uçlar dahil)"\nassert a.aralik(90, 100) == [] and FiyatAgaci().sirali() == [], "boş sonuçlar"\n_b = FiyatAgaci()\nfor f in range(1000):\n    _b.ekle((f * 7919) % 1000)\nassert _b.aralik(10, 12) == [10, 11, 12], "büyük ağaçta aralık"\n',
      hints: ['Bir iç düğüm sınıfı (deger, sol, sag) tanımla; ağaç sınıfı yalnız kökü ve eleman sayısını tutsun.', 'Arama: d = self.kok; while d: eşitse True, küçükse d = d.sol, değilse d = d.sag.', 'aralik için in-order gezinti: alt < d.deger ise sola, alt <= d.deger <= ust ise ekle, d.deger < ust ise sağa in.'],
      why: 'BST\'de aralık sorgusu, aralığın tamamen dışında kalan alt ağaçları atlayarak yalnızca gereken dalları gezer; veritabanı indekslerinin "BETWEEN" sorgusunu hızlı yapmasının nedeni budur. __contains__ yazmak sınıfı in operatörüyle doğal kullanılır yapar.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'veri-yapilari-7',
      diff: 2,
      q: '<p>Lojistik ağını grafla temsil et. İki fonksiyon yaz:</p><ul><li><code>graf_kur(yollar)</code>: <code>(a, b)</code> çiftlerinden <b>yönsüz</b> bir komşuluk listesi kursun; dönüş <code>{dugum: [komşular]}</code>, komşu listeleri alfabetik sıralı ve tekrarsız, kendine yol (a == b) yok sayılır. Hiç yolu olmayan düğüm sözlükte yer almaz.</li><li><code>merkez_depolar(graf)</code>: en çok komşusu olan düğüm(ler)in alfabetik sıralı listesini döndürsün; boş grafta <code>[]</code>.</li></ul>',
      start: 'def graf_kur(yollar):\n    pass\n\ndef merkez_depolar(graf):\n    pass\n',
      sol: 'from collections import defaultdict\n\ndef graf_kur(yollar):\n    komsu = defaultdict(set)\n    for a, b in yollar:\n        if a == b:\n            continue\n        komsu[a].add(b)\n        komsu[b].add(a)\n    return {d: sorted(k) for d, k in komsu.items()}\n\ndef merkez_depolar(graf):\n    if not graf:\n        return []\n    enc = max(len(k) for k in graf.values())\n    return sorted(d for d, k in graf.items() if len(k) == enc)\n',
      tests: '_y = [("Gebze", "İstanbul"), ("Gebze", "Bursa"), ("Bursa", "İzmir"), ("Ankara", "Bursa"), ("İstanbul", "Gebze"), ("Van", "Van"), ("Ankara", "Gebze")]\ng = graf_kur(_y)\nassert g == {"Gebze": ["Ankara", "Bursa", "İstanbul"], "İstanbul": ["Gebze"], "Bursa": ["Ankara", "Gebze", "İzmir"], "İzmir": ["Bursa"], "Ankara": ["Bursa", "Gebze"]}, f"komşuluk listesi yanlış: {g}"\nassert "Van" not in g, "kendine yol yok sayılmalı"\nassert merkez_depolar(g) == ["Bursa", "Gebze"], "eşitlikte hepsi, alfabetik"\nassert merkez_depolar({}) == []\n',
      hints: ['Tekrarları otomatik atmak için önce defaultdict(set) ile kur, sonra listeye çevir.', 'Yönsüz graf: her (a, b) için hem komsu[a].add(b) hem komsu[b].add(a).', 'merkez: önce en büyük derece (max), sonra o dereceye sahip düğümleri sorted ile topla.'],
      why: 'Komşuluk listesi seyrek ağlar için en verimli temsildir. Kurarken set kullanmak tekrar eden yolları (İstanbul-Gebze iki kez) ücretsiz ayıklar; çıktıyı sıralamak sonucu deterministik yapar.'
    },
    {
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      id: 'veri-yapilari-8',
      diff: 1,
      q: '<p>Sipariş hazırlama kuyruğu ters çalışıyor: en son gelen sipariş önce hazırlanıyor ve müşteriler şikâyet ediyor. Ayrıca kuyruk boşken <code>sonraki()</code> çöküyor. <code>SiparisKuyrugu</code> sınıfındaki <b>hataları bul ve düzelt</b>: FIFO çalışmalı, boşken <code>None</code> döndürmeli ve büyük kuyrukta da hızlı olmalı (O(1)).</p>',
      start: 'class SiparisKuyrugu:\n    def __init__(self):\n        self._liste = []\n\n    def ekle(self, siparis_no):\n        self._liste.append(siparis_no)\n\n    def sonraki(self):\n        return self._liste.pop()\n\n    def bos_mu(self):\n        return len(self._liste) == 0\n',
      sol: 'from collections import deque\n\nclass SiparisKuyrugu:\n    def __init__(self):\n        self._liste = deque()\n\n    def ekle(self, siparis_no):\n        self._liste.append(siparis_no)\n\n    def sonraki(self):\n        return self._liste.popleft() if self._liste else None\n\n    def bos_mu(self):\n        return len(self._liste) == 0\n',
      tests: 'q = SiparisKuyrugu()\nfor n in ["AM-1", "AM-2", "AM-3"]:\n    q.ekle(n)\nassert q.sonraki() == "AM-1", "ilk gelen sipariş ilk hazırlanmalı (FIFO); pop() sondan alır"\nassert [q.sonraki(), q.sonraki()] == ["AM-2", "AM-3"]\nassert q.bos_mu() and q.sonraki() is None, "boşken None dönmeli"\nassert "deque" in __source__ and "pop(0)" not in __source__, "O(1) için collections.deque ve popleft kullan (pop(0) O(n))"\n',
      hints: ['list.pop() SON elemanı çıkarır: bu yığın davranışıdır (LIFO).', 'pop(0) doğru sırayı verir ama O(n); collections.deque ve popleft kullan.', 'Boş kontrolü: return self._liste.popleft() if self._liste else None'],
      why: 'Kuyruğu listeyle yazıp pop() kullanmak onu yığına çevirir. pop(0) sırayı düzeltir ama her çağrıda tüm elemanları kaydırır; deque.popleft hem doğru hem O(1)\'dir.'
    },
    {
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      id: 'veri-yapilari-9',
      diff: 2,
      q: '<p>Randevu sisteminin öncelik kuyruğu, aynı öncelikte iki hasta gelince <code>TypeError: \'&lt;\' not supported between instances of \'dict\' and \'dict\'</code> hatasıyla çöküyor. Ayrıca en <b>yüksek</b> puanlı hastanın önce çağrılması gerekirken en düşüğü çağrılıyor. <b>Hataları bul ve düzelt</b>: yüksek puan önce, eşit puanda önce gelen önce.</p>',
      start: 'import heapq\n\nclass Triaj:\n    def __init__(self):\n        self._h = []\n\n    def ekle(self, hasta, puan):\n        heapq.heappush(self._h, (puan, hasta))\n\n    def cagir(self):\n        puan, hasta = heapq.heappop(self._h)\n        return hasta["ad"]\n',
      sol: 'import heapq\nfrom itertools import count\n\nclass Triaj:\n    def __init__(self):\n        self._h = []\n        self._sira = count()\n\n    def ekle(self, hasta, puan):\n        heapq.heappush(self._h, (-puan, next(self._sira), hasta))\n\n    def cagir(self):\n        _, _, hasta = heapq.heappop(self._h)\n        return hasta["ad"]\n',
      tests: 't = Triaj()\nt.ekle({"ad": "Ali", "tc": "1"}, 40)\nt.ekle({"ad": "Ece", "tc": "2"}, 90)\nt.ekle({"ad": "Can", "tc": "3"}, 40)\nt.ekle({"ad": "Su", "tc": "4"}, 90)\n_s = [t.cagir() for _ in range(4)]\nassert _s == ["Ece", "Su", "Ali", "Can"], f"yüksek puan önce, eşitlikte geliş sırası: {_s}"\n',
      hints: ['heapq min-yığındır; en büyüğü önce almak için puanı eksiyle sakla: -puan.', 'Puan eşitse Python demetin ikinci elemanını (dict) karşılaştırmaya çalışır ve çöker.', 'Araya itertools.count() ile benzersiz bir sıra numarası koy: (-puan, next(self._sira), hasta).'],
      why: 'Eşit önceliklerde demet karşılaştırması bir sonraki elemana geçer; sözlükler < ile karşılaştırılamaz. Benzersiz sıra numarası hem çökmeyi önler hem eşitlikte FIFO sağlar. -puan ise min-yığını max-yığın gibi kullanmanın standart yoludur.'
    },
    {
      t: 'code',
      stage: 'Meydan okuma',
      id: 'veri-yapilari-10',
      diff: 3,
      q: '<p>Python\'ın dict\'ini kullanmadan bir hash tablosu yaz: <code>HashTablosu</code>. Zincirleme (chaining) kullan: <code>self.kovalar</code> bir liste, her kova <code>(anahtar, deger)</code> çiftlerinden oluşan bir liste.</p><ul><li><code>koy(anahtar, deger)</code>, <code>al(anahtar, varsayilan=None)</code>, <code>sil(anahtar)</code> (yoksa <code>KeyError</code>), <code>__len__</code>, <code>__contains__</code>.</li><li>Başlangıçta 8 kova. Eleman sayısı / kova sayısı <b>0.75\'i aşınca</b> kova sayısı iki katına çıkarılsın ve tüm elemanlar yeniden dağıtılsın (rehash).</li><li>Aynı hash\'e sahip farklı anahtarlar (çakışma) doğru çalışmalı.</li></ul>',
      start: 'class HashTablosu:\n    def __init__(self):\n        self.kovalar = [[] for _ in range(8)]\n',
      sol: 'class HashTablosu:\n    def __init__(self):\n        self.kovalar = [[] for _ in range(8)]\n        self._n = 0\n\n    def _kova(self, anahtar):\n        return self.kovalar[hash(anahtar) % len(self.kovalar)]\n\n    def _buyut(self):\n        eski = self.kovalar\n        self.kovalar = [[] for _ in range(len(eski) * 2)]\n        for kova in eski:\n            for a, d in kova:\n                self._kova(a).append((a, d))\n\n    def koy(self, anahtar, deger):\n        kova = self._kova(anahtar)\n        for i, (a, _) in enumerate(kova):\n            if a == anahtar:\n                kova[i] = (anahtar, deger)\n                return\n        kova.append((anahtar, deger))\n        self._n += 1\n        if self._n / len(self.kovalar) > 0.75:\n            self._buyut()\n\n    def al(self, anahtar, varsayilan=None):\n        for a, d in self._kova(anahtar):\n            if a == anahtar:\n                return d\n        return varsayilan\n\n    def sil(self, anahtar):\n        kova = self._kova(anahtar)\n        for i, (a, _) in enumerate(kova):\n            if a == anahtar:\n                del kova[i]\n                self._n -= 1\n                return\n        raise KeyError(anahtar)\n\n    def __contains__(self, anahtar):\n        return any(a == anahtar for a, _ in self._kova(anahtar))\n\n    def __len__(self):\n        return self._n\n',
      tests: 'h = HashTablosu()\nassert len(h.kovalar) == 8, "başlangıçta 8 kova"\nfor i in range(6):\n    h.koy(f"AM-{i}", i * 10)\nassert len(h.kovalar) == 8, "6/8 = 0.75 aşılmadı, büyüme olmamalı"\nh.koy("AM-6", 60)\nassert len(h.kovalar) == 16, "7/8 > 0.75 olunca kova sayısı ikiye katlanmalı"\nassert all(h.al(f"AM-{i}") == i * 10 for i in range(7)), "büyüme sonrası tüm değerler bulunmalı"\nh.koy("AM-3", 999)\nassert h.al("AM-3") == 999 and len(h) == 7, "aynı anahtar güncellenmeli, sayı artmamalı"\nclass _K:\n    def __init__(self, ad): self.ad = ad\n    def __hash__(self): return 42\n    def __eq__(self, o): return isinstance(o, _K) and o.ad == self.ad\nh.koy(_K("x"), "X"); h.koy(_K("y"), "Y")\nassert h.al(_K("x")) == "X" and h.al(_K("y")) == "Y", "aynı hash, farklı anahtar: çakışma doğru çözülmeli"\nh.sil(_K("x"))\nassert _K("x") not in h and _K("y") in h and len(h) == 8, "silme yalnız ilgili anahtarı kaldırmalı"\ntry:\n    h.sil("yok"); assert False, "olmayan anahtar KeyError"\nexcept KeyError:\n    pass\nassert h.al("yok", "-") == "-"\nfor i in range(1000):\n    h.koy(i, i)\nassert len(h) == 1008 and len(h.kovalar) >= 1008 / 0.75, "büyüme doluluk oranını 0.75 altında tutmalı"\nassert sum(len(k) for k in h.kovalar) == len(h), "tüm elemanlar kovalarda olmalı"\nassert "dict(" not in __source__ and "{}" not in __source__, "Python dict\\\'i kullanma"\n',
      hints: [
        'Kova seçimi: self.kovalar[hash(anahtar) % len(self.kovalar)]; eleman sayısını ayrı bir sayaçta tut.',
        'koy: kovada aynı anahtar varsa güncelle (sayaç artmaz); yoksa ekle, sayaç artsın, doluluk > 0.75 ise büyüt.',
        'Büyütme: eski kovaları sakla, iki kat yeni kova listesi kur, her (a, d) çiftini yeni kovasına ekle (kova indeksi kova sayısına bağlı olduğu için her şey yeniden dağıtılmalı).'
      ],
      why: 'Bu, dict\'in kalbidir: hash → kova, çakışmada kova içinde eşitlikle arama, doluluk artınca yeniden boyutlandırma. Büyütme nadir ama pahalıdır; kapasite ikiye katlandığı için ortalama ekleme maliyeti yine O(1) kalır (amortize).'
    },
    {
      t: 'code',
      stage: 'Mini proje',
      id: 'veri-yapilari-11',
      diff: 3,
      q: '<p><b>Depo sipariş merkezi:</b> Anadolu Market deposu için <code>SiparisMerkezi</code> sınıfını yaz. Birden fazla veri yapısını birlikte kullanacaksın:</p><ul><li><code>ekle(no, musteri, oncelik)</code>: siparişi bekleyenlere ekler (öncelik 1 en acil). Aynı <code>no</code> daha önce eklenmişse (bekliyor ya da işlenmiş) <code>ValueError</code>. Tekrar kontrolü O(1) olmalı.</li><li><code>isle()</code>: en öncelikli siparişi (eşitlikte önce ekleneni) çıkarır, işlenenler geçmişine koyar ve <code>no</code> döndürür; bekleyen yoksa <code>None</code>.</li><li><code>geri_al()</code>: son işlenen siparişi <b>orijinal önceliği ve orijinal geliş sırasıyla</b> bekleyenlere geri koyar ve <code>no</code> döndürür; geri alınacak yoksa <code>None</code>.</li><li><code>bekleyenler()</code>: bekleyen numaraları işlenecekleri sırayla liste olarak döndürür (iç yapıyı bozmadan).</li><li><code>musteri_ozeti()</code>: <code>{musteri: işlenmiş_sipariş_sayısı}</code>, yalnız en az 1 işlenmiş siparişi olanlar.</li></ul>',
      start: 'import heapq\nfrom itertools import count\n\nclass SiparisMerkezi:\n    def __init__(self):\n        pass\n',
      sol: 'import heapq\nfrom collections import Counter\nfrom itertools import count\n\nclass SiparisMerkezi:\n    def __init__(self):\n        self._yigin = []\n        self._sira = count()\n        self._gorulen = set()\n        self._gecmis = []\n\n    def ekle(self, no, musteri, oncelik):\n        if no in self._gorulen:\n            raise ValueError(f"Tekrarlanan sipariş: {no}")\n        self._gorulen.add(no)\n        heapq.heappush(self._yigin, (oncelik, next(self._sira), no, musteri))\n\n    def isle(self):\n        if not self._yigin:\n            return None\n        kayit = heapq.heappop(self._yigin)\n        self._gecmis.append(kayit)\n        return kayit[2]\n\n    def geri_al(self):\n        if not self._gecmis:\n            return None\n        kayit = self._gecmis.pop()\n        heapq.heappush(self._yigin, kayit)\n        return kayit[2]\n\n    def bekleyenler(self):\n        return [k[2] for k in sorted(self._yigin)]\n\n    def musteri_ozeti(self):\n        return dict(Counter(k[3] for k in self._gecmis))\n',
      tests: 'm = SiparisMerkezi()\nfor no, mus, o in [("S1", "Ayşe", 2), ("S2", "Mehmet", 1), ("S3", "Ayşe", 2), ("S4", "Zeynep", 3), ("S5", "Mehmet", 1)]:\n    m.ekle(no, mus, o)\nassert m.bekleyenler() == ["S2", "S5", "S1", "S3", "S4"], f"öncelik, sonra geliş sırası: {m.bekleyenler()}"\nassert m.bekleyenler() == ["S2", "S5", "S1", "S3", "S4"], "bekleyenler() iç yapıyı bozmamalı"\nassert [m.isle(), m.isle(), m.isle()] == ["S2", "S5", "S1"]\nassert m.musteri_ozeti() == {"Mehmet": 2, "Ayşe": 1}\nassert m.geri_al() == "S1" and m.geri_al() == "S5", "geri al son işleneni döndürür (yığın)"\nassert m.bekleyenler() == ["S5", "S1", "S3", "S4"], "geri alınanlar orijinal öncelik ve sırayla dönmeli"\nassert m.musteri_ozeti() == {"Mehmet": 1}\ntry:\n    m.ekle("S2", "Biri", 1); assert False, "işlenmiş numara tekrar eklenemez"\nexcept ValueError:\n    pass\ntry:\n    m.ekle("S4", "Biri", 1); assert False, "bekleyen numara tekrar eklenemez"\nexcept ValueError:\n    pass\nwhile m.isle():\n    pass\nassert m.isle() is None and m.bekleyenler() == []\n_g = SiparisMerkezi()\nassert _g.geri_al() is None and _g.musteri_ozeti() == {}\n',
      hints: [
        'Dört yapı: bekleyenler için heapq listesi, eşitlik için count(), tekrar kontrolü için set, işlenenler için yığın (list).',
        'Yığına (oncelik, sira_no, no, musteri) demetini koy; geri alırken AYNI demeti geri push edersen orijinal sıra korunur.',
        'bekleyenler: sorted(self._yigin) yeni liste döndürür, yığına dokunmaz; özet için collections.Counter.'
      ],
      why: 'Gerçek sistemler tek bir yapıyla değil, her soruya uygun yapının birleşimiyle kurulur: öncelik için yığın (heap), tekrar için küme, geri al için yığın (stack), özet için sayaç. Demeti olduğu gibi saklamak, geri alınan siparişin kuyruktaki yerini kaybetmemesini sağlar.'
    }
  ],
  faq: [
    {
      q: 'Python\'da hazır yığın ya da bağlı liste sınıfı neden yok?',
      a: 'list zaten O(1) append/pop ile mükemmel bir yığındır; deque ise hem kuyruk hem iki uçlu liste ihtiyacını karşılar ve içeride bağlı bloklar kullanır. Ayrı bir bağlı liste sınıfına pratikte nadiren ihtiyaç duyulur; sıfırdan yazmak kavramı öğrenmek ve mülakatlar içindir.'
    },
    {
      q: 'heapq ile sorted() arasında nasıl seçim yaparım?',
      a: 'Tüm veriyi bir kez sıralayacaksan sorted. Veri sürekli eklenip en küçük/büyük sürekli alınıyorsa (zamanlayıcı, kuyruk) heapq. Yalnız en büyük k eleman lazımsa heapq.nlargest(k, veri), k küçükken tüm listeyi sıralamaktan hızlıdır.'
    },
    {
      q: 'dict\'in O(1) olduğu her zaman doğru mu?',
      a: 'Ortalama durumda evet. Çok sayıda anahtar aynı kovaya düşerse (kötü hash fonksiyonu ya da kasıtlı saldırı) arama O(n)\'e kayar. Python bu yüzden metin hash\'lerini her çalıştırmada rastgele tohumla (PYTHONHASHSEED) hesaplar; bu yüzden hash("abc") her çalıştırmada farklı çıkar.'
    },
    {
      q: 'Kendi sınıfımı sözlük anahtarı yapabilir miyim?',
      a: 'Evet; varsayılan olarak nesneler kimliğe göre hash\'lenir. __eq__ tanımlarsan __hash__\'i de tanımlamalısın, yoksa Python sınıfı hashable olmaktan çıkarır. En kolay yol @dataclass(frozen=True): alanlara göre tutarlı __eq__ ve __hash__ üretir.'
    }
  ],
  mistakes: [
    {
      bad: 'while kuyruk:\n    is_ = kuyruk.pop(0)',
      good: 'from collections import deque\nkuyruk = deque(kuyruk)\nwhile kuyruk:\n    is_ = kuyruk.popleft()',
      why: 'pop(0) her çağrıda tüm elemanları kaydırır; n elemanlı kuyruğu boşaltmak O(n²) olur. deque.popleft O(1).'
    },
    {
      bad: 'heapq.heappush(h, (oncelik, hasta_sozlugu))',
      good: 'heapq.heappush(h, (oncelik, next(sayac), hasta_sozlugu))',
      why: 'Öncelikler eşitse Python ikinci elemanı karşılaştırır; sözlükler karşılaştırılamaz ve TypeError alırsın. Benzersiz sıra numarası hem çökmeyi önler hem FIFO sağlar.'
    },
    {
      bad: 'if musteri_id in buyuk_liste:  # döngü içinde',
      good: 'kume = set(buyuk_liste)\nif musteri_id in kume:',
      why: 'Listede in tüm elemanları tarar (O(n)); döngü içinde O(n²) olur. Kümede ortalama O(1).'
    },
    {
      bad: 'en_buyuk_10 = sorted(tutarlar, reverse=True)[:10]  # 10 milyon satır',
      good: 'en_buyuk_10 = heapq.nlargest(10, tutarlar)',
      why: 'Tüm listeyi sıralamak O(n log n); nlargest k boyutlu bir yığınla O(n log k) çalışır ve daha az bellek kullanır.'
    },
    {
      bad: 'print(h)  # heap sıralı sanılıyor\nilk_uc = h[:3]',
      good: 'ilk_uc = heapq.nsmallest(3, h)',
      why: 'Yığın yalnızca h[0]\'ın en küçük olduğunu garanti eder; listenin geri kalanı sıralı değildir.'
    }
  ]
}
);
})(window);
