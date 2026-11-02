/* ───────────────────────── 2. mulakat-hazirlik ───────────────────────── */
{
  id: 'mulakat-hazirlik',
  lv: 'ileri',
  mod: 'Üretime Hazırlık',
  min: 50,
  title: 'Mülakat hazırlığı: Python soruları, algoritmalar, canlı kodlama',
  sum: 'Teknik mülakatlarda sık sorulan Python kavram sorularını, klasik algoritma görevlerini ve canlı kodlama tekniklerini çalışırsın.',
  goals: [
    'GIL, mutable default, is/==, shallow/deep copy, generator, decorator ve __slots__ sorularına net ve kısa cevap verebilirim.',
    'İki toplam, anagram grupları, en uzun ardışık dizi gibi klasik görevleri sözlük ve küme ile O(n) çözebilirim.',
    'Kayan pencere, iki pointer, ikili arama ve BFS kalıplarını tanıyıp uygun soruda kullanabilirim.',
    'Çözümün zaman ve bellek karmaşıklığını Big-O ile açıklayabilirim.',
    'Canlı kodlamada soruyu netleştirme, örnekle düşünme, kaba çözümden iyileştirme adımlarını uygulayabilirim.'
  ],
  body: `
<h2>Mülakat neyi ölçer?</h2>
<p>Anadolu Market\'in veri ekibine Python geliştirici alınıyor. İlk tur kavram soruları: "GIL nedir, pandas\'ı neden etkilemez?" İkinci tur canlı kodlama: "Şu sipariş listesinde toplamı X eden iki ürünü bul." Üçüncü tur sistem tasarımı: "Günde milyonlarca siparişi işleyen bir boru hattını nasıl kurarsın?" Üç tur üç farklı şeyi ölçer: dili gerçekten anlıyor musun, problemi yapılandırılmış biçimde çözebiliyor musun, büyük resmi görüyor musun. Bu ders üçünü de çalıştırır; ağırlık ikinci turda, çünkü en çok orada elenilir.</p>

<h2>Sık sorulan Python kavram soruları</h2>
<p>Aşağıdaki tablo, mülakatlarda en sık çıkan kavram sorularını ve bir cümlelik çekirdek cevaplarını listeler. Cevabı ezberleme; her birini küçük bir örnekle gösterebilecek kadar anla.</p>
<div class="tbl-wrap"><table>
<tr><th>Soru</th><th>Çekirdek cevap</th><th>Takip sorusu</th></tr>
<tr><td>GIL nedir?</td><td>CPython\'da aynı anda yalnızca bir iş parçacığının Python bytecode çalıştırmasına izin veren kilit</td><td>Neden threading I/O için işe yarar ama CPU için yaramaz? (I/O beklerken kilit bırakılır; numpy/pandas C kodu da bırakır)</td></tr>
<tr><td>Mutable default argüman</td><td>Varsayılan değer tanım anında bir kez oluşur; liste/sözlük çağrılar arasında paylaşılır</td><td>Çözüm? (None + içeride oluştur)</td></tr>
<tr><td>is ile == farkı</td><td>is kimlik (aynı nesne mi), == eşitlik (__eq__)</td><td>Neden <code>x is None</code> doğru, <code>x == None</code> yanlış stil? (None tekildir; __eq__ ezilebilir)</td></tr>
<tr><td>Shallow / deep copy</td><td>Shallow dış kabı kopyalar, iç nesneler paylaşılır; deep özyinelemeli kopyalar</td><td>list(x), x[:], x.copy() hangisi? (hepsi shallow)</td></tr>
<tr><td>Generator vs list</td><td>Generator tembel, tek geçişlik, O(1) bellek; liste tüm veriyi tutar, tekrar gezilir</td><td>sum(x*x for x in r) neden sum([x*x for x in r])\'den iyi?</td></tr>
<tr><td>Decorator</td><td>Fonksiyon alıp fonksiyon döndüren fonksiyon; @ sözdizimi şekerdir</td><td>functools.wraps neden? (ad ve docstring korunur)</td></tr>
<tr><td>__slots__</td><td>Örnek başına __dict__ yerine sabit alanlar; bellek ve erişim hızı kazancı</td><td>Dezavantaj? (dinamik nitelik eklenemez, çoklu kalıtımda dikkat)</td></tr>
</table></div>
<p>Üçünü kodla doğrula; mülakatta "göstereyim" diyebilmek güven verir:</p>
<pre class="py">import copy

# is vs ==
a = [1, 2]
b = [1, 2]
print(a == b, a is b)          # True False

# shallow vs deep
siparis = {"id": 1, "urunler": ["kalem"]}
s1 = siparis.copy()
s2 = copy.deepcopy(siparis)
siparis["urunler"].append("defter")
print(s1["urunler"], s2["urunler"])   # paylaşılan liste / bağımsız liste

# mutable default
def ekle(x, kutu=[]):
    kutu.append(x)
    return kutu
print(ekle(1), ekle(2))        # aynı liste iki kez

# __slots__
class Nokta:
    __slots__ = ("x", "y")
    def __init__(self, x, y):
        self.x, self.y = x, y
n = Nokta(1, 2)
print(hasattr(n, "__dict__"))  # False</pre>

<h2>Algoritma soruları: kalıpları tanı</h2>
<p>Mülakat sorularının büyük kısmı beş altı kalıba iner. Soruyu duyunca kalıbı tanırsan çözümün yarısı bitmiştir.</p>
<h3>1. Sözlükle sayım ve arama: iki toplam</h3>
<p>"Listede toplamı hedef eden iki elemanın indekslerini bul." Kaba yol çift döngü, O(n²). Akıllı yol: gördüğün her sayıyı sözlüğe koy, sıradaki sayının tamamlayıcısı (hedef - sayı) sözlükte mi diye bak. Tek geçiş, O(n).</p>
<pre class="py">def iki_toplam(sayilar, hedef):
    gorulen = {}                       # değer -&gt; indeks
    for i, s in enumerate(sayilar):
        kalan = hedef - s
        if kalan in gorulen:
            return [gorulen[kalan], i]
        gorulen[s] = i
    return []

fiyatlar = [250, 90, 410, 160, 300]
print(iki_toplam(fiyatlar, 500))   # 250 + 250 yok; 90 + 410 -&gt; [1, 2]
print(iki_toplam(fiyatlar, 1000))  # []</pre>
<p>Aynı kalıp "anagram grupları"nda anahtarı sıralanmış harfler yaparak, "en çok tekrar eden ürün"de <code>Counter</code> ile görünür. Soru "bul, say, grupla" diyorsa sözlük düşün.</p>

<h3>2. Küme ile O(n): en uzun ardışık dizi</h3>
<p>"Sırasız sayılarda en uzun ardışık sayı dizisinin uzunluğu?" Sıralamak O(n log n). Küme ile O(n): her sayı için, bir eksiği kümede yoksa bu bir dizinin başıdır; ileri say.</p>
<pre class="py">def en_uzun_ardisik(sayilar):
    kume = set(sayilar)
    en_iyi = 0
    for s in kume:
        if s - 1 not in kume:          # yalnızca dizi başlarından say
            n = 1
            while s + n in kume:
                n += 1
            en_iyi = max(en_iyi, n)
    return en_iyi

print(en_uzun_ardisik([100, 4, 200, 1, 3, 2]))   # 1,2,3,4 -&gt; 4</pre>
<p>Neden O(n)? Her sayı yalnızca ait olduğu dizinin başından itibaren bir kez sayılır. Mülakatçı "neden while içinde while var ama O(n)?" diye sorar; cevap bu.</p>

<h3>3. Kayan pencere (sliding window)</h3>
<p>"Art arda k günün en yüksek toplam cirosu" ya da "tekrarsız en uzun alt dize." Sabit ya da esneyen bir pencereyi sağa kaydırırsın; giren elemanı ekler, çıkanı çıkarırsın. Her adımda yeniden toplamak O(n·k); pencereyle O(n).</p>
<pre class="py">def en_iyi_pencere(ciro, k):
    toplam = sum(ciro[:k])
    en_iyi, bas = toplam, 0
    for i in range(k, len(ciro)):
        toplam += ciro[i] - ciro[i - k]
        if toplam &gt; en_iyi:
            en_iyi, bas = toplam, i - k + 1
    return bas, en_iyi

gunluk = [120, 300, 80, 450, 200, 90, 310]
print(en_iyi_pencere(gunluk, 3))   # (1, 830): 300+80+450</pre>

<h3>4. İki pointer ve ikili arama</h3>
<p>Sıralı veride iki uçtan ortaya yürümek (iki pointer) ya da ortadan ikiye bölmek (ikili arama, O(log n)) klasik kalıplardır. <code>bisect</code> modülü ikili aramayı hazır verir ama mülakatta elle yazmanı isterler: <code>lo, hi</code> sınırları ve <code>mid</code> hesabı; döngü <code>lo &lt;= hi</code> sürdükçe.</p>
<pre class="py">def ikili_ara(sirali, hedef):
    lo, hi = 0, len(sirali) - 1
    while lo &lt;= hi:
        mid = (lo + hi) // 2
        if sirali[mid] == hedef:
            return mid
        if sirali[mid] &lt; hedef:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

print(ikili_ara([3, 8, 15, 21, 42, 57], 21))   # 3
print(ikili_ara([3, 8, 15, 21, 42, 57], 22))   # -1</pre>

<h3>5. BFS: en kısa yol</h3>
<p>Grafta "A\'dan B\'ye en az kaç adım?" sorusunda genişlik öncelikli arama (BFS) kullanılır: kuyruk (<code>collections.deque</code>) ve ziyaret edilenler kümesi. Depo ağı, sosyal bağlantı, kelime merdiveni; hepsi aynı kalıp.</p>
<pre class="py">from collections import deque

depolar = {
    "İstanbul": ["Bursa", "Kocaeli"],
    "Bursa": ["İstanbul", "Eskişehir"],
    "Kocaeli": ["İstanbul", "Ankara"],
    "Eskişehir": ["Bursa", "Ankara"],
    "Ankara": ["Kocaeli", "Eskişehir"],
}

def en_kisa_adim(graf, bas, hedef):
    kuyruk = deque([(bas, 0)])
    ziyaret = {bas}
    while kuyruk:
        dugum, adim = kuyruk.popleft()
        if dugum == hedef:
            return adim
        for komsu in graf.get(dugum, []):
            if komsu not in ziyaret:
                ziyaret.add(komsu)
                kuyruk.append((komsu, adim + 1))
    return -1

print(en_kisa_adim(depolar, "İstanbul", "Ankara"))   # 2</pre>
<div class="warn"><b>Ziyareti kuyruğa eklerken işaretle</b>Kuyruktan çıkarırken işaretlersen aynı düğüm kuyruğa birden çok kez girer; büyük grafta süre patlar. Kümeye ekleme anı, kuyruğa ekleme anıyla aynı olmalı.</div>

<h2>Karmaşıklık: Big-O konuşabilmek</h2>
<p>Her çözümden sonra mülakatçı "karmaşıklığı ne?" diye sorar. Kısa sözlük: sözlük/küme erişimi O(1) ortalama; listede arama O(n); sıralama O(n log n); çift döngü O(n²); ikili arama O(log n); BFS O(V + E). Bellek için de aynı soru gelir: ek sözlük tutuyorsan O(n) bellek. "Daha iyisi var mı?" sorusuna, mümkünse "hayır, çünkü her elemana en az bir kez bakmak gerekir" gibi bir alt sınır argümanı ver.</p>
<div class="tip"><b>Python\'a özgü püf noktalar</b><code>in</code> listede O(n), kümede O(1). String birleştirmede döngüde <code>+=</code> yerine liste toplayıp <code>"".join</code>. <code>list.pop(0)</code> O(n), <code>deque.popleft()</code> O(1). Bunları söylemek "dili biliyor" izlenimi verir.</div>

<h2>Canlı kodlama ipuçları</h2>
<div class="steps-list"><ol>
<li><b>Soruyu tekrar et ve netleştir:</b> Girdi boş olabilir mi? Negatif sayı var mı? Tekrar eden eleman? Çıktı indeks mi değer mi? Her soru bir puan.</li>
<li><b>Küçük bir örnek yaz:</b> 4-5 elemanlı girdi ve beklenen çıktı. Örnek olmadan kod yazma.</li>
<li><b>Önce kaba çözümü söyle:</b> "Çift döngüyle O(n²) olur; sözlükle O(n)\'e indirebilirim." Mülakatçı düşünme sürecini görmek ister.</li>
<li><b>Sesli düşün, sessiz yazma:</b> Takıldığında "burada iki seçenek var" de. Sessizlik en kötü sinyaldir.</li>
<li><b>Yazdıktan sonra örnekle izle:</b> Kodu satır satır örnek üzerinde yürüt. Kenar durumları (boş, tek eleman, hepsi aynı) kontrol et.</li>
<li><b>Karmaşıklığı kendin söyle:</b> Sorulmadan "zaman O(n), bellek O(n)" de.</li>
<li><b>Temiz ad ve küçük fonksiyon:</b> <code>a, b, tmp</code> yerine <code>gorulen, kalan</code>. Test edilebilir fonksiyon yaz, <code>print</code> ile değil <code>return</code> ile sonuç ver.</li>
</ol></div>

<h2>Sistem tasarımı için Python</h2>
<p>Üst düzey pozisyonlarda "Anadolu Bank\'ın işlem akışını işleyen bir servis tasarla" tarzı sorular gelir. Beklenen, kod değil, bileşenler ve seçimler: giriş (API, kuyruk), işleme (worker havuzu), depolama (ilişkisel/belge), gözlemleme (log, metrik). Python özelinde şunları söyleyebilmek fark yaratır: I/O yoğun servis için asyncio + FastAPI; CPU yoğun iş için multiprocessing ya da ayrı worker; büyük veri için pandas yerine parçalı işleme ya da polars/duckdb; durum paylaşımı için Redis; kuyruk için Celery/RQ ya da bulut kuyruğu. Her seçimi "neden" ile bağla: "GIL yüzünden CPU işini thread\'e değil process\'e veririm."</p>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Soruyu kalıba indirgeme pratiği</h3>
<p>Her gün bir soru çöz ve çözümden sonra şu üç satırı yaz: kalıp (sözlük / küme / pencere / iki pointer / ikili arama / BFS-DFS / dinamik programlama), karmaşıklık, kenar durumları. Bir ay sonra soruları duyar duymaz kalıbı göreceksin. Dinamik programlama (en uzun ortak alt dizi, para üstü) ve heap (en büyük k eleman, <code>heapq.nlargest</code>) bu dersin kapsamı dışında kalan ama sık sorulan iki kalıptır; sırada onlar olsun.</p>
<h3>Yanlış ama sık verilen cevaplar</h3>
<p>"GIL Python\'ı tek çekirdekli yapar" (yanlış: multiprocessing ve C uzantıları çekirdekleri kullanır). "Tuple değişmezdir, içi de değişmez" (yanlış: tuple içindeki liste değişir). "Decorator yalnızca loglama içindir" (eksik: önbellek, yetki, yeniden deneme, kayıt). "is daha hızlıdır, hep onu kullan" (yanlış: kimlik ile eşitlik farklı sorulardır; küçük tamsayı önbelleği yanıltır).</p>
<h3>Ev ödevi projesi (take-home)</h3>
<p>Bazı şirketler canlı kodlama yerine ev ödevi verir. Değerlendirme ölçütleri: README (nasıl çalışır, nasıl test edilir), testler, tip ipuçları, lint temizliği, küçük ve odaklı commit\'ler, hata yönetimi. Bir önceki dersin kalite zincirini uygula; "çalışıyor" yetmez, "üretime konabilir" izlenimi ver.</p>
<h3>Davranışsal sorular</h3>
<p>"Zor bir hatayı nasıl buldun?" sorusuna STAR biçiminde cevap ver: Durum, Görev, Eylem, Sonuç. Teknik ayrıntı ver (profil aldım, darboğaz sorgu birleştirmedeydi, indeks ekledim) ama bir dakikayı geçme.</p>
</section>`,
  ex: [
    { t: 'code', id: 'mulakat-hazirlik-1',
      q: '<p><code>iki_toplam(sayilar, hedef)</code>: toplamı <code>hedef</code> eden iki farklı elemanın indekslerini <code>[kucuk, buyuk]</code> listesi olarak döndürsün; yoksa boş liste. Çözüm tek geçişte O(n) olmalı (sözlük kullan); çift döngü testte zaman aşımına düşer.</p>',
      start: 'def iki_toplam(sayilar, hedef):\n    pass\n',
      sol: 'def iki_toplam(sayilar, hedef):\n    gorulen = {}\n    for i, s in enumerate(sayilar):\n        kalan = hedef - s\n        if kalan in gorulen:\n            return [gorulen[kalan], i]\n        gorulen[s] = i\n    return []\n',
      tests: 'assert iki_toplam([250, 90, 410, 160, 300], 500) == [1, 2], "90 + 410"\nassert iki_toplam([3, 3], 6) == [0, 1], "aynı değerden iki tane farklı indeks"\nassert iki_toplam([1, 2, 3], 10) == [], "yoksa boş liste"\nassert iki_toplam([], 5) == [], "boş girdi"\nimport time\nbuyuk = list(range(200000))\nt0 = time.perf_counter()\nassert iki_toplam(buyuk, 399997) == [199998, 199999], "büyük girdi"\nassert time.perf_counter() - t0 < 2, "çözüm O(n) olmalı; çift döngü çok yavaş"\n',
      hints: ['Sözlükte değer -> indeks tut.', 'Her elemanda hedef - s sözlükte var mı diye bak; yoksa elemanı ekle.'],
      why: 'Zaman O(n), bellek O(n). Sözlük aramasının O(1) olması çift döngüyü tek geçişe indirir. Elemanı kontrolden sonra eklemek aynı indeksin iki kez kullanılmasını önler.' },
    { t: 'code', id: 'mulakat-hazirlik-2',
      q: '<p><code>anagram_gruplari(kelimeler)</code>: aynı harflerden oluşan kelimeleri gruplasın. Dönüş: her grup bir liste (girdi sırası korunur), gruplar ilk görülme sırasına göre dizilmiş liste.</p>',
      start: 'def anagram_gruplari(kelimeler):\n    pass\n',
      sol: 'def anagram_gruplari(kelimeler):\n    gruplar = {}\n    for k in kelimeler:\n        anahtar = "".join(sorted(k))\n        gruplar.setdefault(anahtar, []).append(k)\n    return list(gruplar.values())\n',
      tests: 'r = anagram_gruplari(["kalem", "melak", "defter", "lemak", "silgi", "ilgis"])\nassert r == [["kalem", "melak", "lemak"], ["defter"], ["silgi", "ilgis"]], f"gelen {r}"\nassert anagram_gruplari([]) == [], "boş girdi"\nassert anagram_gruplari(["a"]) == [["a"]], "tek kelime"\n',
      hints: ['Anahtar: "".join(sorted(kelime)).', 'dict.setdefault(anahtar, []).append(k) ile grupla; dict ekleme sırasını korur.'],
      why: 'Zaman O(n · k log k) (k kelime uzunluğu, sıralama için); bellek O(n). Sıralanmış harfler anagramlar için ortak anahtar üretir; sözlük ekleme sırasını koruduğundan grup sırası doğal olarak ilk görülme sırasıdır.' },
    { t: 'code', id: 'mulakat-hazirlik-3',
      q: '<p><code>en_uzun_ardisik(sayilar)</code>: sırasız tamsayı listesinde ardışık (1 farkla) sayılardan oluşan en uzun dizinin uzunluğunu döndürsün. Sıralama kullanmadan küme ile O(n) çöz. Boş liste için 0.</p>',
      start: 'def en_uzun_ardisik(sayilar):\n    pass\n',
      sol: 'def en_uzun_ardisik(sayilar):\n    kume = set(sayilar)\n    en_iyi = 0\n    for s in kume:\n        if s - 1 not in kume:\n            n = 1\n            while s + n in kume:\n                n += 1\n            en_iyi = max(en_iyi, n)\n    return en_iyi\n',
      tests: 'assert en_uzun_ardisik([100, 4, 200, 1, 3, 2]) == 4, "1,2,3,4"\nassert en_uzun_ardisik([]) == 0, "boş"\nassert en_uzun_ardisik([7, 7, 7]) == 1, "tekrarlar tek sayılır"\nassert en_uzun_ardisik([-2, -1, 0, 5, 6]) == 3, "negatifler"\nimport time\nbuyuk = list(range(0, 300000, 2)) + list(range(1, 100000, 2))\nt0 = time.perf_counter()\nassert en_uzun_ardisik(buyuk) == 100001, "0..100000 ardışık"\nassert time.perf_counter() - t0 < 3, "O(n) olmalı; her sayıdan ileri sayma O(n²) olur"\n',
      hints: ['Listeyi kümeye çevir.', 'Yalnızca s-1 kümede olmayan sayılardan (dizi başı) ileri say.'],
      why: 'Zaman O(n), bellek O(n). İç while yalnızca dizi başlarında çalışır; her eleman toplamda bir kez sayılır. Dizi başı kontrolü olmadan çözüm O(n²) olur, büyük girdi testi bunu yakalar.' },
    { t: 'code', id: 'mulakat-hazirlik-4',
      q: '<p>Kayan pencere: <code>en_iyi_pencere(ciro, k)</code> art arda <code>k</code> günün en yüksek toplam cirosunu veren pencerenin <code>(baslangic_indeksi, toplam)</code> demetini döndürsün. Eşitlikte ilk pencere kazanır. <code>k</code> liste uzunluğundan büyükse ya da liste boşsa <code>(-1, 0)</code> döndür. Her pencereyi yeniden toplamadan O(n) çöz.</p>',
      start: 'def en_iyi_pencere(ciro, k):\n    pass\n',
      sol: 'def en_iyi_pencere(ciro, k):\n    if k <= 0 or k > len(ciro):\n        return (-1, 0)\n    toplam = sum(ciro[:k])\n    en_iyi, bas = toplam, 0\n    for i in range(k, len(ciro)):\n        toplam += ciro[i] - ciro[i - k]\n        if toplam > en_iyi:\n            en_iyi, bas = toplam, i - k + 1\n    return (bas, en_iyi)\n',
      tests: 'assert en_iyi_pencere([120, 300, 80, 450, 200, 90, 310], 3) == (1, 830), "300+80+450"\nassert en_iyi_pencere([5, 5, 5], 2) == (0, 10), "eşitlikte ilk pencere"\nassert en_iyi_pencere([1, 2], 3) == (-1, 0), "k büyükse (-1, 0)"\nassert en_iyi_pencere([], 1) == (-1, 0), "boş liste"\nassert en_iyi_pencere([4, 9, 1], 1) == (1, 9), "k=1 en büyük eleman"\n',
      hints: ['İlk k elemanın toplamıyla başla.', 'Her adımda yeni elemanı ekle, pencereden çıkanı (i-k) çıkar.'],
      why: 'Zaman O(n), bellek O(1). Pencere kaydıkça yalnızca bir giren bir çıkan eleman güncellenir; yeniden toplama O(n·k) olurdu.' },
    { t: 'mc', q: '<code>x = [1, 2]; y = x[:]</code> ve ardından <code>x.append(3)</code> sonrasında <code>y</code> nedir?',
      o: ['[1, 2, 3]', '[1, 2]', 'Hata verir', 'None'], a: 1,
      why: 'Dilimleme yeni bir liste (shallow copy) üretir; dış kap ayrıdır, bu yüzden x\'e ekleme y\'yi etkilemez. İç nesneler mutable olsaydı (iç içe liste) onlar paylaşılırdı.' },
    { t: 'code', id: 'mulakat-hazirlik-5',
      q: '<p>İkili arama: <code>ikili_ara(sirali, hedef)</code> artan sıralı listede <code>hedef</code>\'in indeksini, yoksa <code>-1</code> döndürsün. <code>bisect</code> ve <code>list.index</code> kullanma; <code>lo/hi/mid</code> ile elle yaz. Ayrıca döngü adım sayısını say ve <code>(indeks, adim)</code> döndür (adım: mid hesaplanan tur sayısı).</p>',
      start: 'def ikili_ara(sirali, hedef):\n    lo, hi = 0, len(sirali) - 1\n    adim = 0\n    pass\n',
      sol: 'def ikili_ara(sirali, hedef):\n    lo, hi = 0, len(sirali) - 1\n    adim = 0\n    while lo <= hi:\n        adim += 1\n        mid = (lo + hi) // 2\n        if sirali[mid] == hedef:\n            return (mid, adim)\n        if sirali[mid] < hedef:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return (-1, adim)\n',
      tests: 'veri = [3, 8, 15, 21, 42, 57, 60, 75]\nassert ikili_ara(veri, 21)[0] == 3, "21 indeks 3"\nassert ikili_ara(veri, 22)[0] == -1, "22 yok"\nassert ikili_ara([], 5) == (-1, 0), "boş liste 0 adım"\nassert ikili_ara([7], 7) == (0, 1), "tek eleman 1 adım"\nbuyuk = list(range(0, 2000000, 2))\nidx, adim = ikili_ara(buyuk, 1999998)\nassert idx == 999999, "son eleman"\nassert adim <= 21, f"1 milyon elemanda en çok ~20 adım olmalı, {adim} adım yapıldı"\n',
      hints: ['while lo <= hi: mid = (lo + hi) // 2.', 'Küçükse lo = mid + 1, büyükse hi = mid - 1.'],
      why: 'Zaman O(log n), bellek O(1). Her tur arama aralığını yarılar; 1 milyon eleman için en çok 20-21 adım. lo <= hi koşulu tek elemanlı aralığı da kontrol eder.' },
    { t: 'code', id: 'mulakat-hazirlik-6',
      q: '<p>BFS: <code>en_kisa_adim(graf, bas, hedef)</code> komşuluk sözlüğü (<code>{dugum: [komsular]}</code>) verilen yönsüz grafta <code>bas</code>\'tan <code>hedef</code>\'e en az kaç kenar geçildiğini döndürsün; ulaşılamıyorsa <code>-1</code>. <code>bas == hedef</code> ise 0. <code>collections.deque</code> kullan.</p>',
      start: 'from collections import deque\n\ndef en_kisa_adim(graf, bas, hedef):\n    pass\n',
      sol: 'from collections import deque\n\ndef en_kisa_adim(graf, bas, hedef):\n    kuyruk = deque([(bas, 0)])\n    ziyaret = {bas}\n    while kuyruk:\n        dugum, adim = kuyruk.popleft()\n        if dugum == hedef:\n            return adim\n        for komsu in graf.get(dugum, []):\n            if komsu not in ziyaret:\n                ziyaret.add(komsu)\n                kuyruk.append((komsu, adim + 1))\n    return -1\n',
      tests: 'g = {"İstanbul": ["Bursa", "Kocaeli"], "Bursa": ["İstanbul", "Eskişehir"], "Kocaeli": ["İstanbul", "Ankara"], "Eskişehir": ["Bursa", "Ankara"], "Ankara": ["Kocaeli", "Eskişehir"], "Van": []}\nassert en_kisa_adim(g, "İstanbul", "Ankara") == 2, "İstanbul-Kocaeli-Ankara"\nassert en_kisa_adim(g, "Bursa", "Kocaeli") == 2, "Bursa-İstanbul-Kocaeli"\nassert en_kisa_adim(g, "İstanbul", "Van") == -1, "ulaşılamaz"\nassert en_kisa_adim(g, "Ankara", "Ankara") == 0, "aynı düğüm 0"\n',
      hints: ['Kuyruğa (düğüm, adım) çifti koy; ziyaret kümesine kuyruğa eklerken ekle.', 'Hedefi kuyruktan çıkarırken kontrol et ve adımı döndür.'],
      why: 'Zaman O(V + E), bellek O(V). BFS katman katman ilerlediği için hedefe ilk ulaşan yol en kısadır. Ziyareti kuyruğa eklerken işaretlemek aynı düğümün tekrar kuyruğa girmesini önler.' },
    { t: 'code', id: 'mulakat-hazirlik-7',
      q: '<p>İki pointer: artan sıralı <code>fiyatlar</code> listesinde toplamı <code>butce</code>\'yi aşmayan en büyük toplamı veren iki farklı ürünün <code>(i, j)</code> indekslerini döndür (<code>i &lt; j</code>). Hiçbir çift sığmıyorsa ya da liste 2\'den kısaysa <code>None</code>. Fonksiyon adı <code>en_iyi_cift(fiyatlar, butce)</code>; iki uçtan ortaya yürüyen O(n) çözüm yaz.</p>',
      start: 'def en_iyi_cift(fiyatlar, butce):\n    pass\n',
      sol: 'def en_iyi_cift(fiyatlar, butce):\n    i, j = 0, len(fiyatlar) - 1\n    en_iyi = None\n    en_iyi_toplam = -1\n    while i < j:\n        t = fiyatlar[i] + fiyatlar[j]\n        if t <= butce:\n            if t > en_iyi_toplam:\n                en_iyi_toplam, en_iyi = t, (i, j)\n            i += 1\n        else:\n            j -= 1\n    return en_iyi\n',
      tests: 'assert en_iyi_cift([90, 160, 250, 300, 410], 500) == (0, 4), "90 + 410 = 500"\nassert en_iyi_cift([90, 160, 250, 300, 410], 1000) == (3, 4), "en pahalı iki"\nassert en_iyi_cift([300, 400], 500) == None, "hiçbir çift sığmaz"\nassert en_iyi_cift([100], 500) == None, "tek eleman"\nassert en_iyi_cift([50, 50, 50], 100) == (0, 2), "ilk bulunan 100 toplamı; daha iyisi yok"\n',
      hints: ['i baştan, j sondan başlasın.', 'Toplam bütçeyi aşıyorsa j azalt; sığıyorsa en iyiyi güncelle ve i artır.'],
      why: 'Zaman O(n), bellek O(1). Sıralı veride toplam fazla geliyorsa büyük ucu küçültmek, az geliyorsa küçük ucu büyütmek tüm anlamlı çiftleri tek geçişte tarar.' }
  ],
  faq: [
    { q: 'Mülakatta çözümü hatırlayamazsam ne yapmalıyım?', a: 'Kaba çözümü yaz ve karmaşıklığını söyle; sonra "sözlükle iyileştirebilirim" gibi yönü belirt. Çalışan O(n²) çözüm, bitmemiş O(n) çözümden iyidir. Mülakatçıdan ipucu istemek de puan kaybettirmez; sessiz kalmak kaybettirir.' },
    { q: 'Hangi dili/araçları bildiğimi nasıl kanıtlarım?', a: 'Kodda Pythonic kalıplar kullan: enumerate, zip, comprehension, setdefault, deque, Counter. Big-O ve bellek yorumunu kendin ekle. Küçük bir test (assert) yazmak güçlü bir sinyaldir.' },
    { q: 'GIL sorusunda ne kadar derine inmeliyim?', a: 'Üç cümle: ne olduğu, neden I/O için threading işe yarar (bekleme sırasında kilit bırakılır), CPU işi için multiprocessing ya da C uzantıları (numpy) kullanılır. Python 3.13 ile deneysel serbest iş parçacığı (free-threaded) derlemesinin varlığını bilmek artı puan.' },
    { q: 'Ev ödevi projesinde en çok neye bakıyorlar?', a: 'README, testler, temiz yapı ve hata yönetimi. Fazla özellik eklemek yerine istenen işi eksiksiz, test edilmiş ve okunur biçimde teslim et.' }
  ],
  mistakes: [
    { bad: 'if x == None:\n    ...', good: 'if x is None:\n    ...', why: 'None tekil nesnedir; kimlik karşılaştırması hem doğru hem de __eq__ ezilmiş sınıflarda güvenlidir (PEP 8).' },
    { bad: 'kuyruk = []\n...\ndugum = kuyruk.pop(0)', good: 'from collections import deque\nkuyruk = deque()\n...\ndugum = kuyruk.popleft()', why: 'list.pop(0) tüm elemanları kaydırır, O(n); BFS\'te toplam O(n²) olur. deque.popleft() O(1).' },
    { bad: 'for i in range(len(a)):\n    for j in range(len(a)):\n        if a[i] + a[j] == hedef:\n            ...', good: 'gorulen = {}\nfor i, s in enumerate(a):\n    if hedef - s in gorulen:\n        ...\n    gorulen[s] = i', why: 'Çift döngü O(n²) ve i == j durumunda aynı elemanı iki kez kullanır; sözlük hem O(n) hem doğru.' },
    { bad: 'metin = ""\nfor p in parcalar:\n    metin += p', good: 'metin = "".join(parcalar)', why: 'Döngüde string birleştirme her adımda yeni nesne oluşturur; join tek seferde birleştirir ve mülakatta "dili biliyor" sinyali verir.' }
  ]
}
