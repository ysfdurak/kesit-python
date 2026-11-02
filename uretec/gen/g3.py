import sys; sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/gen')
from jsgen import D, write

LID = 'mulakat-hazirlik'

HTML = r'''
<h2>Derinleş: eksik kalan beş kalıp</h2>
<p>Ders boyunca sözlük, küme, kayan pencere, iki pointer, ikili arama ve BFS kalıplarını gördün. Mülakat sorularının geri kalanının çoğu beş kalıba daha iner: <b>yığın (stack)</b>, <b>yığın-kuyruk (heap)</b>, <b>önek toplamı (prefix sum)</b>, <b>dinamik programlama (dynamic programming)</b> ve <b>geri izleme (backtracking)</b>. Bunlara aralık birleştirme ve LRU önbellek gibi "tasarım" sorularını eklersen klasik soru havuzunun büyük bölümünü kapsamış olursun. Özyinelemenin temelini "Özyineleme" dersinde, sıralama algoritmalarının içini "Algoritmalar" dersinde gördün; burada mülakat açısından bakıyoruz.</p>

<div class="tbl-wrap"><table>
<tr><th>Soruda duyduğun</th><th>Kalıp</th><th>Python aracı</th><th>Tipik karmaşıklık</th></tr>
<tr><td>"eşleşen parantez", "bir sonraki büyük eleman", "geri al"</td><td>Yığın</td><td><code>list.append</code> / <code>pop</code></td><td>O(n)</td></tr>
<tr><td>"en büyük k", "en sık k", "sıralı listeleri birleştir", "en kısa yol (ağırlıklı)"</td><td>Heap</td><td><code>heapq</code></td><td>O(n log k)</td></tr>
<tr><td>"toplamı k olan alt dizi sayısı", "aralık toplamı"</td><td>Önek toplamı + sözlük</td><td><code>itertools.accumulate</code>, <code>dict</code></td><td>O(n)</td></tr>
<tr><td>"en az kaç", "kaç farklı yol", "en uzun ortak"</td><td>Dinamik programlama</td><td>liste tablosu, <code>functools.cache</code></td><td>O(n·m)</td></tr>
<tr><td>"tüm kombinasyonlar", "tüm permütasyonlar", "geçerli tüm yerleşimler"</td><td>Geri izleme</td><td>özyineleme + liste</td><td>üstel</td></tr>
<tr><td>"çakışan aralıklar", "toplantı odası"</td><td>Sırala + tara</td><td><code>sorted(key=...)</code></td><td>O(n log n)</td></tr>
</table></div>

<h3>1. Yığın: son giren ilk çıkar</h3>
<p>Parantez doğrulama en klasik yığın sorusudur. Bir adım ötesi <b>monoton yığın</b>dır: "her gün için fiyatın kaç gün sonra yükseleceğini bul" gibi sorularda, henüz cevabı bulunmamış günlerin indekslerini azalan sırada yığında tutarsın. Her indeks bir kez girip bir kez çıktığı için toplam O(n) olur.</p>
<pre class="py">def gecerli_mi(ifade):
    eslesme = {")": "(", "]": "[", "}": "{"}
    yigin = []
    for c in ifade:
        if c in "([{":
            yigin.append(c)
        elif c in eslesme:
            if not yigin or yigin.pop() != eslesme[c]:
                return False
    return not yigin

print(gecerli_mi("{[()()]}"), gecerli_mi("([)]"), gecerli_mi("(("))

def kac_gun_sonra(fiyat):
    sonuc = [0] * len(fiyat)
    yigin = []                          # cevabı bekleyen günlerin indeksleri
    for i, f in enumerate(fiyat):
        while yigin and fiyat[yigin[-1]] &lt; f:
            j = yigin.pop()
            sonuc[j] = i - j
        yigin.append(i)
    return sonuc

print(kac_gun_sonra([73, 74, 75, 71, 69, 72, 76, 73]))</pre>

<h3>2. Heap: en büyük k ve ağırlıklı en kısa yol</h3>
<p><code>heapq</code> en küçük elemanı her zaman <code>h[0]</code>'da tutan bir min-heap'tir; ekleme ve çıkarma O(log n). "En büyük k" için boyutu k olan bir min-heap tut: yeni eleman tepedekinden büyükse değiştir. Böylece n elemanı O(n log k)'da tararsın; <code>heapq.nlargest</code> bunu hazır yapar. Max-heap gerekiyorsa değerleri eksiyle çarparak koy. Dijkstra algoritması da heap'e dayanır: her adımda en yakın düğümü çıkarırsın.</p>
<pre class="py">import heapq

siparisler = [("S1", 420), ("S2", 90), ("S3", 1250), ("S4", 610), ("S5", 300)]
print(heapq.nlargest(2, siparisler, key=lambda s: s[1]))

def dijkstra(graf, bas):
    mesafe = {bas: 0}
    h = [(0, bas)]
    while h:
        d, u = heapq.heappop(h)
        if d &gt; mesafe.get(u, float("inf")):
            continue                     # eski, geçersiz kayıt
        for v, w in graf.get(u, []):
            yeni = d + w
            if yeni &lt; mesafe.get(v, float("inf")):
                mesafe[v] = yeni
                heapq.heappush(h, (yeni, v))
    return mesafe

yollar = {"Depo": [("Kadıköy", 12), ("Beşiktaş", 7)],
          "Beşiktaş": [("Kadıköy", 3), ("Şişli", 4)],
          "Kadıköy": [("Ataşehir", 6)], "Şişli": [("Ataşehir", 15)]}
print(dijkstra(yollar, "Depo"))</pre>

<h3>3. Önek toplamı</h3>
<p><code>onek[i]</code> ilk i elemanın toplamıysa, i..j aralığının toplamı <code>onek[j+1] - onek[i]</code> olur. "Toplamı k olan kaç alt dizi var?" sorusunda her konumda "şimdiye kadarki toplam - k" değerinin daha önce kaç kez görüldüğünü sözlükte sayarsın. Negatif sayılar olduğunda kayan pencere çalışmaz, önek toplamı çalışır; bu ayrımı söylemek artı puandır.</p>

<h3>4. Dinamik programlama</h3>
<p>İki işaret ara: <b>optimal alt yapı</b> (büyük problemin cevabı küçüklerinkinden kurulur) ve <b>örtüşen alt problemler</b> (aynı küçük problem tekrar tekrar çözülür). İki yazım şekli vardır: yukarıdan aşağı (özyineleme + <code>functools.cache</code>) ve aşağıdan yukarı (tablo). Mülakatta önce özyinelemeli tanımı söyle, sonra tabloya çevir.</p>
<pre class="py">from functools import cache

def para_ustu(bozuklar, tutar):
    """En az kaç bozuk para? Mümkün değilse -1."""
    SONSUZ = float("inf")
    dp = [0] + [SONSUZ] * tutar          # dp[t]: t tutarı için en az para
    for t in range(1, tutar + 1):
        for b in bozuklar:
            if b &lt;= t and dp[t - b] + 1 &lt; dp[t]:
                dp[t] = dp[t - b] + 1
    return dp[tutar] if dp[tutar] != SONSUZ else -1

print(para_ustu([1, 5, 10, 25], 63), para_ustu([5, 10], 3))

@cache
def yol_sayisi(satir, sutun):
    """Izgarada sol üstten sağ alta yalnız sağ/aşağı giderek kaç yol?"""
    if satir == 1 or sutun == 1:
        return 1
    return yol_sayisi(satir - 1, sutun) + yol_sayisi(satir, sutun - 1)

print(yol_sayisi(3, 7), yol_sayisi.cache_info().hits)</pre>
<div class="warn"><b>Açgözlü yaklaşım tuzağı</b>Para üstünde "her seferinde en büyük parayı al" (greedy) TL/kuruş gibi sistemlerde doğru çalışır ama <code>[1, 3, 4]</code> ile 6 için 4+1+1 (3 para) verir; doğrusu 3+3 (2 para). Mülakatçı tam bu karşı örneği sorar: greedy önerirsen neden doğru olduğunu kanıtlamaya hazır ol.</div>

<h3>5. Geri izleme ve aralıklar</h3>
<p>Geri izleme, seçim yap, özyinele, seçimi geri al döngüsüdür. "Toplamı hedef olan tüm kombinasyonlar" ya da "tüm alt kümeler" bu kalıptır; dalı erken kesmek (pruning, ör. sıralı adaylarda toplam aşınca <code>break</code>) süreyi ciddi biçimde düşürür. Aralık sorularında ise neredeyse her zaman ilk adım başlangıca göre sıralamaktır.</p>
<pre class="py">def birlestir(araliklar):
    sonuc = []
    for bas, bit in sorted(araliklar):
        if sonuc and bas &lt;= sonuc[-1][1]:
            sonuc[-1][1] = max(sonuc[-1][1], bit)
        else:
            sonuc.append([bas, bit])
    return sonuc

print(birlestir([(9, 11), (1, 3), (2, 6), (8, 10), (15, 18)]))

def alt_kumeler(ogeler):
    sonuc, secim = [], []
    def gez(i):
        if i == len(ogeler):
            sonuc.append(secim.copy())   # kopyala: secim değişmeye devam edecek
            return
        secim.append(ogeler[i]); gez(i + 1)   # al
        secim.pop();             gez(i + 1)   # alma (geri al)
    gez(0)
    return sonuc

print(alt_kumeler(["çay", "simit", "peynir"]))</pre>
<div class="tip"><b>Python'a özgü kısa yollar</b>Mülakatçı izin veriyorsa <code>collections.Counter.most_common</code>, <code>heapq.merge</code>, <code>bisect.bisect_left</code>, <code>itertools.combinations</code> ve <code>functools.cache</code> kullanmak serbesttir; ama "bunu elle yazabilir misin?" sorusuna hazır ol. Önce hazır aracı söyle, sonra elle yazmayı teklif et.</div>
<div class="note"><b>Gerçek işte</b>Bu kalıplar yalnız mülakat için değil: monoton yığın borsa/fiyat verisinde "bir sonraki zirve" hesabında, heap öncelikli iş kuyruklarında ve "en çok satan 10 ürün" raporlarında, önek toplamı kümülatif ciro ve tarih aralığı sorgularında, aralık birleştirme vardiya ve toplantı odası planlamada, LRU önbellek ise API yanıtlarını önbelleğe alırken doğrudan karşına çıkar.</div>
'''

ex = []
ex.append(dict(t='mc', stage='Isınma', q='Soru: "Bir kargo şirketi farklı değerlerde paketleri birleştirerek tam olarak X kg\'a en az paketle ulaşmak istiyor." Alt problemler tekrar ediyor. Hangi kalıp uygundur?',
    o=['Kayan pencere: ardışık paketleri topla', 'Dinamik programlama: dp[x] = en az paket', 'İkili arama: paket ağırlıklarında ara', 'Açgözlü: her seferinde en ağırı al'], a=1,
    why='"En az kaç" + örtüşen alt problemler dinamik programlamanın işaretidir (para üstü problemiyle aynı yapı). Açgözlü yaklaşım bazı ağırlık setlerinde yanlış sonuç verir; kayan pencere ardışıklık gerektirir.'))
ex.append(dict(t='mc', stage='Isınma', q='1 milyon siparişten en yüksek tutarlı 10 tanesini istiyorsun. <code>heapq.nlargest(10, ...)</code> ile <code>sorted(...)[-10:]</code> arasındaki fark nedir?',
    o=['İkisi de O(n log n) çalışır; fark yalnız kodun okunabilirliğindedir', 'sorted her zaman daha hızlıdır çünkü tamamen C ile yazılmıştır', 'nlargest k boyutlu heap ile O(n log k); sorted O(n log n)', 'nlargest yalnız tam sayılarla çalışır, sözlüklerde key kabul etmez'], a=2,
    why='nlargest yalnız k elemanlık bir heap tutar; k çok küçükken n log k, n log n\'den belirgin biçimde küçüktür ve ek bellek O(k) olur. sorted tüm listeyi kopyalayıp sıralar. İkisi de C ile yazılmıştır ve key ile her türde çalışır.'))
ex.append(dict(t='predict', stage='Kodu oku', q='Bu heap kodu ne yazdırır?',
    code=D('''
        import heapq
        h = [5, 1, 8, 3, 9]
        heapq.heapify(h)
        heapq.heappush(h, 0)
        print(h[0], heapq.nlargest(2, h), len(h))
    '''),
    o=['5 [9, 8] 6', '0 [9, 8] 6', '0 [8, 9] 6', '1 [9, 8] 5'], a=1,
    why='heapify listeyi min-heap yapar; 0 eklenince en küçük eleman h[0] = 0 olur. nlargest büyükten küçüğe sıralı döndürür: [9, 8]. Liste 6 elemanlıdır.'))
ex.append(dict(t='predict', stage='Kodu oku', q='Önbellekli Fibonacci\'de fonksiyon gövdesi kaç kez çalışır?',
    code=D('''
        from functools import lru_cache
        cagri = 0

        @lru_cache(maxsize=None)
        def fib(n):
            global cagri
            cagri += 1
            return n if n < 2 else fib(n - 1) + fib(n - 2)

        print(fib(10), cagri)
    '''),
    o=['55 177', '55 10', '89 11', '55 11'], a=3,
    why='Önbellekle her n (0\'dan 10\'a, 11 değer) için gövde yalnız bir kez çalışır; sonraki çağrılar önbellekten döner. Önbelleksiz sürümde gövde 177 kez çalışırdı. fib(10) = 55.'))
ex.append(dict(t='predict', stage='Kodu oku', q='Parantez denetleyicisi bu girdide ne yazdırır?',
    code=D('''
        yigin = []
        es = {")": "(", "]": "["}
        for c in "([)]":
            if c in "([":
                yigin.append(c)
            elif yigin and es[c] == yigin[-1]:
                yigin.pop()
            else:
                print("hata:", c)
                break
        print(yigin)
    '''),
    o=['[]', 'hata: ]\n[\'(\']', 'hata: )\n[\'(\', \'[\']', 'hata: )\n[\'(\']'], a=2,
    why='"(" ve "[" yığına girer. ")" geldiğinde tepe "[" olduğu için eşleşmez, hata yazılır ve döngü kırılır; yığın hiç boşalmamıştır. Sayım tabanlı (her türden açılan = kapanan) bir denetleyici bu girdiyi yanlışlıkla geçerli sayardı.'))
ex.append(dict(t='order', stage='Kodu oku', q='<p>Çakışan zaman aralıklarını birleştiren programın satırlarını sırala.</p>',
    lines=['araliklar = [(13, 15), (9, 11), (10, 12), (16, 17)]',
           'sonuc = []',
           'for bas, bit in sorted(araliklar):',
           '    if sonuc and bas <= sonuc[-1][1]:',
           '        sonuc[-1][1] = max(sonuc[-1][1], bit)',
           '    else:',
           '        sonuc.append([bas, bit])',
           'print(sonuc)'],
    expect='[[9, 12], [13, 15], [16, 17]]\n',
    hint='Önce aralıkları başlangıca göre sırala; bir aralık son birleştirilmiş aralığın bitişinden önce başlıyorsa genişlet.',
    why='Sıralama sayesinde yalnız son eklenen aralıkla karşılaştırmak yeter. (9,11) ve (10,12) çakışır → [9,12]; diğerleri ayrı kalır. Karmaşıklık sıralamadan dolayı O(n log n).'))

def code(stage, n, diff, q, start, sol, tests, hints, why, guide=None, example=None, kind=None):
    e = dict(t='code', stage=stage)
    if kind: e['kind'] = kind
    e.update(id=f'{LID}-x{n}', diff=diff, q=q)
    if guide: e['guide'] = guide
    if example: e['example'] = example
    e.update(start=start, sol=sol, tests=tests, hints=hints, why=why)
    return e

ex.append(code('Rehberli', 1, 1,
    '<p><code>gecerli_parantez(s: str) -&gt; bool</code> yaz. <code>()[]{}</code> parantezleri doğru sırayla açılıp kapanıyorsa <code>True</code>. Parantez dışındaki karakterleri (harf, rakam, boşluk) yok say. Boş metin geçerlidir.</p>',
    D('''
        def gecerli_parantez(s):
            eslesme = {")": "(", "]": "[", "}": "{"}
            yigin = []
            for c in s:
                # TODO: açılışsa yığına ekle
                # TODO: kapanışsa yığın boş mu / tepe eşleşiyor mu bak
                pass
            # TODO: sonunda yığın boş olmalı
            return False
    '''),
    D('''
        def gecerli_parantez(s):
            eslesme = {")": "(", "]": "[", "}": "{"}
            yigin = []
            for c in s:
                if c in "([{":
                    yigin.append(c)
                elif c in eslesme:
                    if not yigin or yigin.pop() != eslesme[c]:
                        return False
            return not yigin
    '''),
    D('''
        assert gecerli_parantez("") is True, "boş metin geçerlidir"
        assert gecerli_parantez("f(x[0]) + {a: (1)}") is True, "harfler yok sayılır, iç içe yapı geçerli"
        assert gecerli_parantez("([)]") is False, "çapraz kapanış geçersiz: sayılar eşit olsa da sıra yanlış"
        assert gecerli_parantez("((") is False, "kapanmamış parantez kalırsa geçersiz"
        assert gecerli_parantez("())") is False, "boş yığında kapanış geçersiz"
    '''),
    ['Son açılan ilk kapanmalı: yığın (stack) kullan.', 'Kapanışta yığın boşsa ya da yigin.pop() eşleşen açılış değilse False.', 'Döngü bitince return not yigin.'],
    'Her karakter bir kez işlenir: O(n) zaman, en kötü O(n) bellek. Yalnız sayaç tutan çözümler "([)]" gibi çapraz durumları yakalayamaz.',
    guide=['Kapanış → açılış eşleşme sözlüğünü hazırla (verildi).', 'Açılış karakterini yığına ekle.', 'Kapanışta yığın boşsa ya da tepe eşleşmiyorsa hemen False döndür.', 'Parantez olmayan karakterleri atla.', 'Döngü sonunda yığın boşsa True.'],
    example=D('''
        # Yığınla "geri al" geçmişi
        gecmis = []
        for islem in ["yaz:a", "yaz:b", "geri", "yaz:c"]:
            if islem == "geri":
                if gecmis:
                    gecmis.pop()
            else:
                gecmis.append(islem)
        print(gecmis)
    ''')))

ex.append(code('Rehberli', 2, 2,
    '<p><code>en_sik_k(urunler: list[str], k: int) -&gt; list[str]</code> yaz: en çok satılan k ürünü sıklığa göre azalan sırada döndürsün. Sıklık eşitse alfabetik olarak önce gelen önde olsun. <code>heapq</code> kullan (<code>Counter.most_common</code> eşitlikte alfabetik sıra garantilemez).</p>',
    D('''
        import heapq
        from collections import Counter

        def en_sik_k(urunler, k):
            sayim = Counter(urunler)
            # TODO: heapq.nsmallest ile (-adet, ad) anahtarına göre k ürün seç
            return []
    '''),
    D('''
        import heapq
        from collections import Counter

        def en_sik_k(urunler, k):
            sayim = Counter(urunler)
            return heapq.nsmallest(k, sayim, key=lambda u: (-sayim[u], u))
    '''),
    D('''
        satis = ["çay", "kahve", "su", "çay", "simit", "kahve", "su", "çay", "ayran"]
        assert en_sik_k(satis, 1) == ["çay"], "en sık ürün çay (3 kez)"
        assert en_sik_k(satis, 3) == ["çay", "kahve", "su"], "kahve ve su 2'şer kez: alfabetik sıra"
        assert en_sik_k(satis, 10) == ["çay", "kahve", "su", "ayran", "simit"], "k ürün sayısından büyükse hepsi döner"
        assert en_sik_k([], 2) == [], "boş liste"
    '''),
    ['Önce Counter ile say; sonra k elemanlı seçim yap.', 'Büyükten küçüğe + alfabetik için anahtar (-adet, ad) olur; bunun en küçük k tanesi aranır.', 'heapq.nsmallest(k, sayim, key=lambda u: (-sayim[u], u))'],
    'nsmallest k boyutlu heap ile O(n log k) çalışır. Eksi işaretli sayım "büyük olan önce", ikinci alan "eşitlikte alfabetik" kuralını tek anahtarda birleştirir.',
    guide=['Counter ile her ürünün adedini çıkar.', 'Sıralama anahtarını düşün: önce adet (büyükten küçüğe), sonra ad (küçükten büyüğe).', 'Bu anahtarın en küçük k elemanını heapq.nsmallest ile seç.', 'Sonucu liste olarak döndür.'],
    example=D('''
        import heapq

        notlar = {"Ali": 85, "Ece": 92, "Can": 85, "Su": 70}
        # en yüksek 2 not, eşitlikte ada göre
        print(heapq.nsmallest(2, notlar, key=lambda ad: (-notlar[ad], ad)))
    ''')))

ex.append(code('Rehberli', 3, 2,
    '<p>Para üstü (coin change). <code>en_az_para(bozuklar: list[int], tutar: int) -&gt; int</code>: <code>tutar</code>\'ı tam olarak oluşturmak için gereken en az bozuk para sayısını döndür (her paradan sınırsız). Mümkün değilse <code>-1</code>, tutar 0 ise 0.</p>',
    D('''
        def en_az_para(bozuklar, tutar):
            SONSUZ = float("inf")
            dp = [0] + [SONSUZ] * tutar
            for t in range(1, tutar + 1):
                # TODO: her bozuk para b için dp[t - b] + 1 ile dp[t]'yi güncelle
                pass
            # TODO: SONSUZ kaldıysa -1
            return dp[tutar]
    '''),
    D('''
        def en_az_para(bozuklar, tutar):
            SONSUZ = float("inf")
            dp = [0] + [SONSUZ] * tutar
            for t in range(1, tutar + 1):
                for b in bozuklar:
                    if b <= t and dp[t - b] + 1 < dp[t]:
                        dp[t] = dp[t - b] + 1
            return dp[tutar] if dp[tutar] != SONSUZ else -1
    '''),
    D('''
        assert en_az_para([1, 5, 10, 25], 63) == 6, "63 = 25+25+10+1+1+1 -> 6 para"
        assert en_az_para([1, 3, 4], 6) == 2, "6 = 3+3; açgözlü 4+1+1 (3 para) yanlıştır"
        assert en_az_para([5, 10], 3) == -1, "3 oluşturulamaz -> -1"
        assert en_az_para([2], 0) == 0, "0 tutar için 0 para"
        assert en_az_para([7, 2], 100) == 15, "100 = 14 x 7 + 1 x 2 -> 15 para"
    '''),
    ['dp[t], t tutarı için en az para sayısıdır; dp[0] = 0.', 'Her t için tüm paraları dene: dp[t] = min(dp[t], dp[t - b] + 1).', 'Son satır: return dp[tutar] if dp[tutar] != SONSUZ else -1'],
    'Aşağıdan yukarı DP: her alt tutar bir kez hesaplanır, O(tutar × para_çeşidi) zaman. [1, 3, 4] ile 6 örneği açgözlü yaklaşımın neden yanlış olduğunu gösterir.',
    guide=['dp tablosu hazır: dp[0] = 0, diğerleri sonsuz.', 'Her t tutarı için her b parasını dene (b <= t olmalı).', 'dp[t - b] + 1 daha küçükse dp[t]\'yi güncelle.', 'Sonda dp[tutar] hâlâ sonsuzsa -1 döndür.'],
    example=D('''
        # Merdiven: 1 ya da 2 basamak atlayarak n basamağa kaç yolla çıkılır?
        def yol(n):
            dp = [1, 1] + [0] * (n - 1)
            for i in range(2, n + 1):
                dp[i] = dp[i - 1] + dp[i - 2]
            return dp[n]

        print(yol(5))
    ''')))

ex.append(code('Rehberli', 4, 2,
    '<p><code>aralik_birlestir(araliklar: list[tuple[int, int]]) -&gt; list[tuple[int, int]]</code> yaz. Çakışan ya da uç uca değen (<code>(1, 3)</code> ve <code>(3, 5)</code>) aralıkları birleştir; sonucu başlangıca göre sıralı demet listesi olarak döndür. Girdi listesini değiştirme.</p>',
    D('''
        def aralik_birlestir(araliklar):
            sonuc = []
            for bas, bit in araliklar:  # TODO: önce sırala
                # TODO: sonuc boş değilse ve bas <= son bitiş ise genişlet, değilse ekle
                pass
            return sonuc
    '''),
    D('''
        def aralik_birlestir(araliklar):
            sonuc = []
            for bas, bit in sorted(araliklar):
                if sonuc and bas <= sonuc[-1][1]:
                    sonuc[-1][1] = max(sonuc[-1][1], bit)
                else:
                    sonuc.append([bas, bit])
            return [tuple(a) for a in sonuc]
    '''),
    D('''
        g = [(8, 10), (1, 3), (2, 6), (15, 18)]
        assert aralik_birlestir(g) == [(1, 6), (8, 10), (15, 18)], "(1,3) ve (2,6) birleşir"
        assert g == [(8, 10), (1, 3), (2, 6), (15, 18)], "girdi listesi değişmemeli"
        assert aralik_birlestir([(1, 3), (3, 5)]) == [(1, 5)], "uç uca değen aralıklar birleşir"
        assert aralik_birlestir([(1, 10), (2, 3), (4, 5)]) == [(1, 10)], "içerilen aralıklar yutulur: max ile bitişi koru"
        assert aralik_birlestir([]) == [], "boş girdi"
    '''),
    ['İlk adım her zaman başlangıca göre sıralamak: sorted(araliklar).', 'Sonuçtaki son aralığı genişletebilmek için onu liste olarak tut, en sonda demete çevir.', 'Bitişi güncellerken max kullan: (1,10) içindeki (2,3) bitişi küçültmemeli.'],
    'Sıralamadan sonra tek geçiş yeterlidir: O(n log n). sorted yeni liste döndürdüğü için girdi korunur; list.sort() kullansaydın çağıranın listesi değişirdi.',
    guide=['sorted(araliklar) ile başlangıca göre dolaş.', 'Sonuç boşsa ya da yeni aralık son aralığın bitişinden sonra başlıyorsa yeni aralık ekle.', 'Aksi halde son aralığın bitişini max(eski, yeni) yap.', 'Sonda listeleri demete çevir.'],
    example=D('''
        # Vardiya listesinde boşluk var mı?
        vardiyalar = sorted([(14, 22), (6, 14), (23, 30)])
        for (b1, s1), (b2, s2) in zip(vardiyalar, vardiyalar[1:]):
            if b2 > s1:
                print(f"{s1}-{b2} arası boşluk")
    ''')))

ex.append(code('Kendin yaz', 5, 2,
    '<p><code>tekrarsiz_en_uzun(s: str) -&gt; int</code>: içinde hiçbir karakterin tekrar etmediği en uzun <b>ardışık</b> alt metnin uzunluğunu döndür. O(n) çözüm bekleniyor (değişken boyutlu kayan pencere).</p>',
    D('''
        def tekrarsiz_en_uzun(s):
            pass
    '''),
    D('''
        def tekrarsiz_en_uzun(s):
            son_gorulme = {}
            sol = en_iyi = 0
            for sag, c in enumerate(s):
                if c in son_gorulme and son_gorulme[c] >= sol:
                    sol = son_gorulme[c] + 1
                son_gorulme[c] = sag
                en_iyi = max(en_iyi, sag - sol + 1)
            return en_iyi
    '''),
    D('''
        assert tekrarsiz_en_uzun("abcabcbb") == 3, "abc -> 3"
        assert tekrarsiz_en_uzun("bbbbb") == 1, "tek karakter tekrarı -> 1"
        assert tekrarsiz_en_uzun("pwwkew") == 3, "wke -> 3 (pwke ardışık değil)"
        assert tekrarsiz_en_uzun("") == 0, "boş metin -> 0"
        assert tekrarsiz_en_uzun("abba") == 2, "sol sınır geri gitmemeli: abba -> 2"
        assert tekrarsiz_en_uzun("İstanbul") == 8, "Türkçe karakterler de tek karakterdir"
    '''),
    ['Pencerenin sol ve sağ ucunu tut; sağ her adımda ilerler.', 'Her karakterin en son görüldüğü indeksi sözlükte sakla.', 'Tekrar eden karakter pencerenin içindeyse (son_gorulme >= sol) solu onun bir sağına taşı; "abba" kenar durumuna dikkat.'],
    'Her karakter bir kez işlenir, sol yalnız ileri gider: O(n). son_gorulme[c] >= sol kontrolü, pencerenin dışında kalmış eski bir görülmenin solu geri çekmesini engeller.'))

ex.append(code('Kendin yaz', 6, 2,
    '<p><code>toplami_k_alt_dizi(sayilar: list[int], k: int) -&gt; int</code>: toplamı tam olarak <code>k</code> olan <b>ardışık</b> alt dizilerin sayısını döndür. Sayılar negatif olabilir (bu yüzden kayan pencere çalışmaz). O(n) çözüm yaz.</p>',
    D('''
        def toplami_k_alt_dizi(sayilar, k):
            pass
    '''),
    D('''
        def toplami_k_alt_dizi(sayilar, k):
            gorulen = {0: 1}
            toplam = sayac = 0
            for s in sayilar:
                toplam += s
                sayac += gorulen.get(toplam - k, 0)
                gorulen[toplam] = gorulen.get(toplam, 0) + 1
            return sayac
    '''),
    D('''
        assert toplami_k_alt_dizi([1, 1, 1], 2) == 2, "[1,1] iki farklı konumda"
        assert toplami_k_alt_dizi([1, 2, 3], 3) == 2, "[1,2] ve [3]"
        assert toplami_k_alt_dizi([3, -1, 1, 2, -2, 3], 3) == 7, f"negatif sayılarla 7 alt dizi, gelen {toplami_k_alt_dizi([3, -1, 1, 2, -2, 3], 3)}"
        assert toplami_k_alt_dizi([0, 0], 0) == 3, "[0], [0], [0,0]"
        assert toplami_k_alt_dizi([], 5) == 0, "boş liste"
    '''),
    ['Önek toplamı: i..j aralığının toplamı onek[j] - onek[i-1].', 'Şu anki toplam T ise, daha önce T - k önek toplamı kaç kez görüldüyse o kadar alt dizi burada biter.', 'Sözlüğü {0: 1} ile başlat: baştan başlayan alt diziler için.'],
    'Her konumda "toplam - k" değerinin geçmişte kaç kez görüldüğünü sözlükten O(1)\'de okursun; toplam O(n). {0: 1} başlangıcı, alt dizinin en baştan başladığı durumu sayar.'))

ex.append(code('Kendin yaz', 7, 2,
    '<p>Monoton yığın. <code>kac_gun_sonra(fiyatlar: list[int]) -&gt; list[int]</code>: her gün için fiyatın kaç gün sonra o günkünden <b>kesin olarak</b> yüksek olacağını döndür; hiç yükselmeyecekse 0. O(n) çözüm bekleniyor.</p>',
    D('''
        def kac_gun_sonra(fiyatlar):
            pass
    '''),
    D('''
        def kac_gun_sonra(fiyatlar):
            sonuc = [0] * len(fiyatlar)
            yigin = []
            for i, f in enumerate(fiyatlar):
                while yigin and fiyatlar[yigin[-1]] < f:
                    j = yigin.pop()
                    sonuc[j] = i - j
                yigin.append(i)
            return sonuc
    '''),
    D('''
        assert kac_gun_sonra([73, 74, 75, 71, 69, 72, 76, 73]) == [1, 1, 4, 2, 1, 1, 0, 0], "klasik örnek"
        assert kac_gun_sonra([30, 30, 31]) == [2, 1, 0], "eşit fiyat yükseliş sayılmaz"
        assert kac_gun_sonra([5, 4, 3]) == [0, 0, 0], "sürekli düşüş"
        assert kac_gun_sonra([]) == [], "boş liste"
        import time
        b = time.perf_counter()
        kac_gun_sonra(list(range(200000, 0, -1)) + [10**9])
        assert time.perf_counter() - b < 2, "O(n) olmalı; iç içe tam döngü çok yavaş kalır"
    '''),
    ['Cevabı henüz bilinmeyen günlerin indekslerini yığında tut.', 'Yeni gün, yığının tepesindeki günden pahalıysa o günün cevabı bulunmuştur: pop et ve farkı yaz.', 'Her indeks yığına bir kez girer, bir kez çıkar: toplam O(n).'],
    'Yığındaki fiyatlar her zaman azalan sıradadır (monoton). Yeni bir yüksek fiyat, kendinden ucuz tüm bekleyen günleri tek seferde çözer.'))

ex.append(code('Kendin yaz', 8, 2,
    '<p><code>ada_sayisi(harita: list[str]) -&gt; int</code>: harita satırlardan oluşan bir ızgaradır; <code>"1"</code> kara, <code>"0"</code> su. Yatay ya da dikey komşu karalar aynı adadır (çapraz değil). Ada sayısını döndür. Girdi listesini değiştirme. Özyineleme sınırına takılmamak için yığınla (iteratif) dolaşman önerilir.</p>',
    D('''
        def ada_sayisi(harita):
            pass
    '''),
    D('''
        def ada_sayisi(harita):
            if not harita:
                return 0
            R, C = len(harita), len(harita[0])
            gorulen = set()
            adalar = 0
            for r in range(R):
                for c in range(C):
                    if harita[r][c] == "1" and (r, c) not in gorulen:
                        adalar += 1
                        yigin = [(r, c)]
                        gorulen.add((r, c))
                        while yigin:
                            y, x = yigin.pop()
                            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                                ny, nx = y + dy, x + dx
                                if 0 <= ny < R and 0 <= nx < C and harita[ny][nx] == "1" and (ny, nx) not in gorulen:
                                    gorulen.add((ny, nx))
                                    yigin.append((ny, nx))
            return adalar
    '''),
    D('''
        h = ["11000",
             "11000",
             "00100",
             "00011"]
        assert ada_sayisi(h) == 3, "üç ada"
        assert ada_sayisi(["101", "010", "101"]) == 5, "çapraz komşuluk sayılmaz: 5 ada"
        assert ada_sayisi(["000"]) == 0, "kara yok"
        assert ada_sayisi([]) == 0, "boş harita"
        buyuk = ["1" * 300] * 300
        assert ada_sayisi(buyuk) == 1, "300x300 tek ada; özyinelemeli DFS burada RecursionError verebilir"
    '''),
    ['Her hücreyi gez; ziyaret edilmemiş bir kara bulunca ada sayısını artır ve o adanın tamamını işaretle.', 'İşaretleme için DFS ya da BFS: yığın ya da deque ile komşuları dolaş.', 'Sınır kontrolü: 0 <= ny < R and 0 <= nx < C.'],
    'Her hücre en fazla bir kez yığına girer: O(R×C). Python\'un varsayılan özyineleme sınırı (~1000) büyük ızgarada özyinelemeli DFS\'i çökertir; iteratif yığın bu riski kaldırır.'))

ex.append(code('Kendin yaz', 9, 2,
    '<p>En uzun ortak alt dizi (LCS). <code>lcs(a: str, b: str) -&gt; int</code>: iki metnin, sırası korunarak (ardışık olması gerekmeden) ortak olan en uzun alt dizisinin uzunluğunu döndür. Örn. <code>"ANADOLU"</code> ve <code>"ANKARA"</code> → <code>"ANA"</code> → 3.</p>',
    D('''
        def lcs(a, b):
            pass
    '''),
    D('''
        def lcs(a, b):
            onceki = [0] * (len(b) + 1)
            for ca in a:
                simdi = [0] * (len(b) + 1)
                for j, cb in enumerate(b, 1):
                    if ca == cb:
                        simdi[j] = onceki[j - 1] + 1
                    else:
                        simdi[j] = max(onceki[j], simdi[j - 1])
                onceki = simdi
            return onceki[-1]
    '''),
    D('''
        assert lcs("ANADOLU", "ANKARA") == 3, "ANA ortak: 3"
        assert lcs("abcde", "ace") == 3, "ace -> 3"
        assert lcs("abc", "def") == 0, "ortak karakter yok"
        assert lcs("", "abc") == 0, "boş metin"
        assert lcs("a" * 400, "a" * 400) == 400, "400x400 tablo hızlı çalışmalı (özyinelemeli önbelleksiz çözüm üstel)"
    '''),
    ['dp[i][j]: a\'nın ilk i, b\'nin ilk j karakteri için LCS uzunluğu.', 'Karakterler eşitse dp[i-1][j-1] + 1, değilse max(dp[i-1][j], dp[i][j-1]).', 'Bellek için yalnız önceki satırı tutman yeterli.'],
    'Klasik iki boyutlu DP: O(len(a) × len(b)) zaman; yalnız iki satır tutarak bellek O(len(b)). Diff araçları ve DNA hizalama bu fikre dayanır.'))

ex.append(code('Kendin yaz', 10, 2,
    '<p><code>kendisi_haric_carpim(sayilar: list[int]) -&gt; list[int]</code>: her konum için <b>o eleman hariç</b> diğer tüm elemanların çarpımını döndür. <b>Bölme kullanma</b> (sıfırlar olabilir); O(n) zaman.</p>',
    D('''
        def kendisi_haric_carpim(sayilar):
            pass
    '''),
    D('''
        def kendisi_haric_carpim(sayilar):
            n = len(sayilar)
            sonuc = [1] * n
            sol = 1
            for i in range(n):
                sonuc[i] = sol
                sol *= sayilar[i]
            sag = 1
            for i in range(n - 1, -1, -1):
                sonuc[i] *= sag
                sag *= sayilar[i]
            return sonuc
    '''),
    D('''
        assert kendisi_haric_carpim([1, 2, 3, 4]) == [24, 12, 8, 6], "klasik örnek"
        assert kendisi_haric_carpim([2, 0, 5]) == [0, 10, 0], "tek sıfır: yalnız onun konumu sıfırdan farklı"
        assert kendisi_haric_carpim([0, 0, 3]) == [0, 0, 0], "iki sıfır: hepsi 0"
        assert kendisi_haric_carpim([7]) == [1], "tek eleman: boş çarpım 1"
        assert "/" not in __source__, "bölme kullanma"
    '''),
    ['Her konumun cevabı = solundakilerin çarpımı × sağındakilerin çarpımı.', 'İlk geçişte soldan sağa sol çarpımları yaz.', 'İkinci geçişte sağdan sola giderek sağ çarpımla çarp.'],
    'Önek ve sonek çarpımları iki geçişte hesaplanır: O(n) zaman, sonuç listesi dışında O(1) ek bellek. Bölmeli çözüm sıfır içeren girdide çöker ya da yanlış sonuç verir.'))

ex.append(code('Kendin yaz', 11, 3,
    '<p>Geri izleme. <code>kombinasyon_toplam(adaylar: list[int], hedef: int) -&gt; list[list[int]]</code>: toplamı <code>hedef</code> olan tüm kombinasyonları döndür. Her aday sınırsız kez kullanılabilir; adaylar pozitif ve birbirinden farklıdır. Her kombinasyon artan sıralı olsun, liste de sözlük sırasına (lexicographic) göre sıralı olsun; aynı kombinasyon iki kez gelmesin.</p>',
    D('''
        def kombinasyon_toplam(adaylar, hedef):
            pass
    '''),
    D('''
        def kombinasyon_toplam(adaylar, hedef):
            adaylar = sorted(adaylar)
            sonuc, secim = [], []

            def gez(bas, kalan):
                if kalan == 0:
                    sonuc.append(secim.copy())
                    return
                for i in range(bas, len(adaylar)):
                    a = adaylar[i]
                    if a > kalan:
                        break
                    secim.append(a)
                    gez(i, kalan - a)
                    secim.pop()

            gez(0, hedef)
            return sonuc
    '''),
    D('''
        assert kombinasyon_toplam([2, 3, 6, 7], 7) == [[2, 2, 3], [7]], "klasik örnek"
        assert kombinasyon_toplam([3, 2, 5], 8) == [[2, 2, 2, 2], [2, 3, 3], [3, 5]], "adaylar sırasız gelebilir"
        assert kombinasyon_toplam([4], 3) == [], "çözüm yok"
        assert kombinasyon_toplam([1], 0) == [[]], "hedef 0: boş kombinasyon tek çözümdür"
    '''),
    ['Adayları sırala; aynı kombinasyonun farklı sıralarını engellemek için her seviyede yalnız mevcut indeksten ve sonrasından seç.', 'Seç → özyinele (aynı indeksle, tekrar kullanılabildiği için) → geri al (pop).', 'Aday kalandan büyükse döngüyü kır (budama).'],
    'Bas indeksi, [2,3] ve [3,2] gibi aynı kümenin tekrarlarını önler. Sıralı adaylar sayesinde erken break ile arama ağacı budanır. Sonuca secim.copy() eklenmeli; yoksa tüm sonuçlar aynı (sonunda boşalan) listeyi gösterir.'))

ex.append(code('Hata avı', 12, 2,
    '<p><b>Hatayı bul ve düzelt.</b> <code>ilk_konum(sirali, hedef)</code> artan sıralı listede <code>hedef</code>\'in <b>ilk</b> geçtiği indeksi, yoksa -1 döndürmeli (O(log n), bisect kullanmadan). Mevcut kod tekrarlı elemanlarda rastgele bir kopyanın indeksini veriyor ve tek elemanlı listede hedefi bulamıyor.</p>',
    D('''
        def ilk_konum(sirali, hedef):
            lo, hi = 0, len(sirali) - 1
            while lo < hi:
                mid = (lo + hi) // 2
                if sirali[mid] == hedef:
                    return mid
                if sirali[mid] < hedef:
                    lo = mid + 1
                else:
                    hi = mid - 1
            return -1
    '''),
    D('''
        def ilk_konum(sirali, hedef):
            lo, hi = 0, len(sirali) - 1
            bulunan = -1
            while lo <= hi:
                mid = (lo + hi) // 2
                if sirali[mid] == hedef:
                    bulunan = mid
                    hi = mid - 1
                elif sirali[mid] < hedef:
                    lo = mid + 1
                else:
                    hi = mid - 1
            return bulunan
    '''),
    D('''
        assert ilk_konum([5], 5) == 0, "tek elemanlı listede bulunmalı (lo <= hi)"
        assert ilk_konum([1, 2, 2, 2, 2, 3], 2) == 1, "ilk 2 indeks 1'de"
        assert ilk_konum([7, 7, 7, 7, 7, 7, 7], 7) == 0, "hepsi aynıysa 0"
        assert ilk_konum([1, 3, 5], 4) == -1, "yoksa -1"
        assert ilk_konum([], 1) == -1, "boş liste"
    '''),
    ['İki ayrı hata var: döngü koşulu ve eşitlikte hemen dönmek.', 'lo < hi koşulu, lo == hi olduğunda son adayı hiç kontrol etmez.', 'Eşleşmede indeksi kaydet ve aramaya SOLDA devam et (hi = mid - 1).'],
    'Alt sınır (lower bound) araması, eşleşmeyi bulunca durmaz; daha soldaki eşleşmeleri arar. bisect.bisect_left aynı işi yapar; mülakatta "hazırı bisect_left" demek artı puandır.'))

ex.append(code('Hata avı', 13, 2,
    '<p><b>Hatayı bul ve düzelt.</b> Bağlı listeyi (linked list) tersine çeviren <code>ters_cevir(bas)</code> fonksiyonu yeni başı döndürmeli. Mevcut kod yalnız ilk düğümü döndürüyor; listenin geri kalanı kayboluyor.</p>',
    D('''
        class Dugum:
            def __init__(self, deger, sonraki=None):
                self.deger = deger
                self.sonraki = sonraki

        def ters_cevir(bas):
            onceki = None
            simdiki = bas
            while simdiki:
                simdiki.sonraki = onceki
                onceki = simdiki
                simdiki = simdiki.sonraki
            return onceki
    '''),
    D('''
        class Dugum:
            def __init__(self, deger, sonraki=None):
                self.deger = deger
                self.sonraki = sonraki

        def ters_cevir(bas):
            onceki = None
            simdiki = bas
            while simdiki:
                sonraki = simdiki.sonraki
                simdiki.sonraki = onceki
                onceki = simdiki
                simdiki = sonraki
            return onceki
    '''),
    D('''
        def listeye(d):
            r = []
            while d:
                r.append(d.deger)
                d = d.sonraki
            return r
        bas = Dugum(1, Dugum(2, Dugum(3, Dugum(4))))
        assert listeye(ters_cevir(bas)) == [4, 3, 2, 1], "1->2->3->4 tersine 4->3->2->1 olmalı"
        assert ters_cevir(None) is None, "boş liste None döndürür"
        assert listeye(ters_cevir(Dugum(9))) == [9], "tek düğüm"
    '''),
    ['Bağlantıyı değiştirmeden önce bir sonraki düğümü bir yerde sakla.', 'simdiki.sonraki = onceki yazıldıktan sonra simdiki.sonraki artık eski sonraki değil.', 'Geçici değişken: sonraki = simdiki.sonraki, sonra en sonda simdiki = sonraki.'],
    'Klasik "referansı kaybetme" hatası: oku yeniden yönlendirdiğin anda ilerideki düğümlere giden tek yolu silersin. Üç işaretçi (onceki, simdiki, sonraki) ile O(n) zaman, O(1) bellek.'))

ex.append(code('Meydan okuma', 14, 3,
    '<p>LRU önbellek tasarla. <code>LRUOnbellek(kapasite)</code> sınıfı: <code>getir(anahtar)</code> değeri döndürür, yoksa <code>-1</code>; erişilen anahtar "en son kullanılan" olur. <code>koy(anahtar, deger)</code> ekler ya da günceller (güncelleme de kullanım sayılır); kapasite aşılırsa <b>en uzun süredir kullanılmayan</b> anahtar çıkarılır. İki işlem de O(1) olmalı. <code>len(onbellek)</code> eleman sayısını versin.</p>',
    D('''
        class LRUOnbellek:
            def __init__(self, kapasite):
                pass
    '''),
    D('''
        from collections import OrderedDict

        class LRUOnbellek:
            def __init__(self, kapasite):
                self.kapasite = kapasite
                self.veri = OrderedDict()

            def getir(self, anahtar):
                if anahtar not in self.veri:
                    return -1
                self.veri.move_to_end(anahtar)
                return self.veri[anahtar]

            def koy(self, anahtar, deger):
                if anahtar in self.veri:
                    self.veri.move_to_end(anahtar)
                self.veri[anahtar] = deger
                if len(self.veri) > self.kapasite:
                    self.veri.popitem(last=False)

            def __len__(self):
                return len(self.veri)
    '''),
    D('''
        c = LRUOnbellek(2)
        c.koy("kur:USD", 41.2)
        c.koy("kur:EUR", 44.9)
        assert c.getir("kur:USD") == 41.2, "USD önbellekte"
        c.koy("kur:GBP", 52.3)
        assert c.getir("kur:EUR") == -1, "USD az önce kullanıldığı için çıkarılan EUR olmalı"
        assert c.getir("kur:GBP") == 52.3 and len(c) == 2, "kapasite 2"
        c.koy("kur:USD", 41.5)
        c.koy("kur:CHF", 47.0)
        assert c.getir("kur:GBP") == -1, "güncelleme de kullanımdır: GBP en eski kaldı ve çıktı"
        assert c.getir("kur:USD") == 41.5, "güncellenmiş değer"
        b = LRUOnbellek(1)
        b.koy("a", 1); b.koy("a", 2)
        assert len(b) == 1 and b.getir("a") == 2, "aynı anahtarı güncellemek eleman eklemez"
    '''),
    ['Sıra bilgisi + O(1) erişim gerekiyor: collections.OrderedDict ikisini birden verir.', 'move_to_end(anahtar) bir anahtarı "en yeni" yapar; popitem(last=False) en eskiyi çıkarır.', 'koy içinde önce var olanı sona taşı, sonra ata, sonra kapasiteyi kontrol et.'],
    'OrderedDict içten çift yönlü bağlı liste + sözlüktür; mülakatçı "OrderedDict olmadan" derse aynı yapıyı Dugum sınıfı ve sözlükle kurarsın. functools.lru_cache de aynı politikayı kullanır.'))

ex.append(code('Meydan okuma', 15, 3,
    '<p>Dijkstra. <code>en_kisa_yollar(kenarlar: list[tuple[str, str, int]], bas: str) -&gt; dict[str, int]</code>: kenarlar <b>yönlü</b> ve ağırlıkları negatif olmayan <code>(kaynak, hedef, km)</code> demetleridir. <code>bas</code>\'tan ulaşılabilen her düğümün en kısa mesafesini (kendisi 0) <b>anahtara göre sıralı</b> sözlük olarak döndür; ulaşılamayan düğümler sözlükte olmasın. <code>heapq</code> kullan.</p>',
    D('''
        import heapq

        def en_kisa_yollar(kenarlar, bas):
            pass
    '''),
    D('''
        import heapq
        from collections import defaultdict

        def en_kisa_yollar(kenarlar, bas):
            graf = defaultdict(list)
            for u, v, w in kenarlar:
                graf[u].append((v, w))
            mesafe = {bas: 0}
            h = [(0, bas)]
            while h:
                d, u = heapq.heappop(h)
                if d > mesafe[u]:
                    continue
                for v, w in graf[u]:
                    yeni = d + w
                    if yeni < mesafe.get(v, float("inf")):
                        mesafe[v] = yeni
                        heapq.heappush(h, (yeni, v))
            return dict(sorted(mesafe.items()))
    '''),
    D('''
        k = [("Depo", "Bursa", 150), ("Depo", "İzmit", 100), ("İzmit", "Bursa", 30),
             ("Bursa", "Eskişehir", 150), ("İzmit", "Eskişehir", 220), ("Ankara", "Depo", 450)]
        r = en_kisa_yollar(k, "Depo")
        assert r == {"Bursa": 130, "Depo": 0, "Eskişehir": 280, "İzmit": 100}, f"beklenen mesafeler farklı: {r}"
        assert list(r) == sorted(r), "anahtarlar sıralı olmalı"
        assert "Ankara" not in r, "yönlü grafta Depo'dan Ankara'ya yol yok"
        assert en_kisa_yollar([], "X") == {"X": 0}, "kenarsız: yalnız başlangıç"
        import random
        random.seed(0)
        buyuk = [(f"n{i}", f"n{random.randrange(2000)}", random.randint(1, 50)) for i in range(2000) for _ in range(5)]
        import time
        t = time.perf_counter()
        en_kisa_yollar(buyuk, "n0")
        assert time.perf_counter() - t < 2, "heap ile O((V+E) log V) olmalı"
    '''),
    ['Önce komşuluk listesi kur: graf[u] = [(v, w), ...].', 'Heap\'te (mesafe, düğüm) tut; her seferinde en küçük mesafeli düğümü çıkar.', 'Heap\'ten çıkan kayıt mesafe[u]\'dan büyükse eski kayıttır, atla (lazy deletion).'],
    'Heap\'li Dijkstra O((V + E) log V) çalışır. "Eski kaydı atla" kontrolü, heap\'ten silme yapmadan güncellemeyi mümkün kılar. Negatif ağırlıkta Dijkstra yanlış sonuç verir; o durumda Bellman-Ford gerekir.'))

faq = [
    dict(q='Dinamik programlamayı nasıl tanırım ve nereden başlarım?', a='"En az/en çok", "kaç farklı yol" ve "en uzun/en kısa" gibi optimizasyon ya da sayım soruları, bir de küçük girdide kaba özyinelemenin aynı alt problemi tekrar tekrar çözdüğünü görmek. Önce durumu tanımla (dp[i] neyi temsil ediyor?), sonra geçişi (dp[i] öncekilerden nasıl kurulur?), sonra başlangıç değerlerini yaz. Özyineleme + @cache ile başlayıp tabloya çevirmek en güvenli yoldur.'),
    dict(q='Kaç soru çözmeliyim, hangi sırayla?', a='Sayıdan çok kalıp önemli. Bu dersteki 13 kalıbın her birinden 3–5 soru (toplam 50–70) çoğu orta düzey mülakat için yeterlidir. Sıra: sözlük/küme → iki pointer/pencere → yığın → ikili arama → BFS/DFS → heap → önek toplamı → DP → geri izleme. Her soruyu 25 dakikada çözmeye çalış; çözemezsen çözümü oku ve iki gün sonra baştan yaz.'),
    dict(q='Mülakatta özyineleme mi, döngü mü yazmalıyım?', a='Ağaç ve geri izleme sorularında özyineleme daha okunur. Ama Python\'da varsayılan özyineleme sınırı 1000 civarıdır ve kuyruk özyinelemesi optimize edilmez; büyük girdide (ızgara, uzun bağlı liste) iteratif yığın kullan ve bunu mülakatçıya söyle. Bu tek cümle "Python\'u gerçekten biliyor" izlenimi verir.')
]
mistakes = [
    dict(bad='sonuc.append(secim)  # geri izlemede', good='sonuc.append(secim.copy())  # ya da secim[:]', why='secim listesi geri izleme boyunca değişmeye devam eder; kopyalamazsan sonuçtaki tüm elemanlar aynı (sonunda boş) listeyi gösterir.'),
    dict(bad='heapq.heappush(h, -fiyat)\n# ... sonra\nen_buyuk = heapq.heappop(h)  # eksi işaretli kaldı', good='heapq.heappush(h, -fiyat)\nen_buyuk = -heapq.heappop(h)', why='heapq yalnız min-heap sunar; max-heap için eksiyle koyduğun değeri çıkarırken tekrar eksiyle çarpmayı unutmak sessiz yanlış sonuç üretir.'),
    dict(bad='def dfs(r, c):\n    ...\n    dfs(r + 1, c)  # 1000x1000 ızgarada', good='yigin = [(r, c)]\nwhile yigin:\n    y, x = yigin.pop()\n    ...', why='Büyük ızgarada özyinelemeli DFS RecursionError verir. sys.setrecursionlimit geçici çözümdür; iteratif yığın kalıcı çözümdür.')
]

write('/home/claude/py/v2/e8/mulakat-hazirlik.js', LID, 60, HTML, ex, faq, mistakes, '15 ek algoritma görevi')
