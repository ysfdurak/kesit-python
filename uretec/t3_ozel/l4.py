LESSON = {
'id': 'ozyineleme', 'lv': 'temel', 'mod': 'Fonksiyonlar ve Modüller', 'min': 40,
'title': 'Özyineleme (recursion)',
'sum': 'Kendini çağıran fonksiyonları temel durum ve özyinelemeli adımla kurar; çağrı yığınını girintili print ile izler, faktöriyel, fibonacci ve memoization, iç içe liste, klasör ağacı ve ikili aramayı özyinelemeyle çözer, RecursionError\'ı ve döngüyle karşılaştırmayı öğrenirsin.',
'goals': [
    'Özyinelemeli bir fonksiyonu temel durum ve küçülen özyinelemeli adım olarak kurabilirim.',
    'Çağrı yığınını girintili print ile görselleştirip çağrıların hangi sırayla açılıp kapandığını açıklayabilirim.',
    'Fibonacci\'nin neden yavaşladığını açıklar, sözlükle ya da lru_cache ile memoization uygularım.',
    'İç içe listeleri ve klasör/kategori ağaçlarını özyinelemeyle gezebilirim.',
    'RecursionError\'ın sebebini bilir, özyineleme ile döngü arasında gerekçeyle seçim yaparım.'
],
'body': '''
<h2>Kendine benzeyen problemler</h2>
<p>Anadolu Market'in ürün kategorilerini düşün: "Elektronik" altında "Telefon", onun altında "Akıllı telefon" ve "Aksesuar", aksesuarın altında "Kılıf" ve "Şarj aleti". Kaç katman olduğu belli değil; yarın bir katman daha eklenebilir. Kategori ağacındaki toplam ürün sayısını nasıl hesaplarsın? İç içe kaç döngü yazacağını bilemezsin.</p>
<p>Ama şu cümle her katman için doğrudur: "Bir kategorinin ürün sayısı, kendi ürünleri artı her alt kategorinin ürün sayısıdır." Cümlenin içinde aynı soru, daha küçük bir parça için tekrar soruluyor. İşte <b>özyineleme</b> (recursion) budur: bir fonksiyonun, problemi daha küçük bir parçası için <b>kendini çağırması</b>. Klasör ağaçları, organizasyon şemaları, iç içe yorum dizileri, JSON belgeleri, matematikteki faktöriyel ve fibonacci hep bu yapıdadır.</p>

<h2>İki zorunlu parça</h2>
<p>Her özyinelemeli fonksiyonun iki parçası vardır:</p>
<ul>
<li><b>Temel durum</b> (base case): cevabı doğrudan bilinen, kendini çağırmayan en küçük durum. Olmazsa fonksiyon sonsuza dek kendini çağırır.</li>
<li><b>Özyinelemeli adım</b> (recursive step): problemi <b>küçültüp</b> kendini çağıran ve gelen cevabı kullanarak sonucu kuran kısım. Her çağrı temel duruma biraz daha yaklaşmalı.</li>
</ul>
<pre class="py">def geri_say(n):
    if n == 0:                 # temel durum
        print("Kampanya başladı!")
        return
    print(n)
    geri_say(n - 1)            # özyinelemeli adım: n küçülüyor

geri_say(3)

def faktoriyel(n):
    if n <= 1:                 # temel durum: 0! = 1! = 1
        return 1
    return n * faktoriyel(n - 1)

print(faktoriyel(5))
print(faktoriyel(0))</pre>
<p>Faktöriyelin matematiksel tanımı zaten özyinelemelidir: <code>n! = n × (n-1)!</code> ve <code>0! = 1</code>. Kod bu tanımın neredeyse birebir kopyası. Özyinelemeyi tasarlarken kendine iki soru sor: "En küçük, cevabını doğrudan bildiğim durum ne?" ve "Bir küçüğünün cevabını bilseydim, bunun cevabını nasıl kurardım?" İkinci soruda <b>küçüğün cevabının doğru geleceğine güvenirsin</b>; buna "özyinelemeli inanç sıçraması" (recursive leap of faith) denir.</p>

<h2>Çağrı yığınını görmek</h2>
<p>Bir fonksiyon çağrıldığında Python onun yerel değişkenlerini bir <b>çerçeve</b> (frame) içinde tutar ve çerçeveyi <b>çağrı yığınının</b> (call stack) tepesine koyar. Fonksiyon dönünce çerçeve yığından kalkar. Özyinelemede aynı fonksiyonun birçok çerçevesi aynı anda yığında bekler; her birinin kendi <code>n</code>'i vardır. Bunu görmenin en iyi yolu, derinliği bir parametreyle taşıyıp girintili yazdırmaktır.</p>
<pre class="py">def faktoriyel_iz(n, derinlik=0):
    girinti = "    " * derinlik
    print(f"{girinti}faktoriyel({n}) çağrıldı")
    if n <= 1:
        print(f"{girinti}temel durum → 1")
        return 1
    alt = faktoriyel_iz(n - 1, derinlik + 1)
    sonuc = n * alt
    print(f"{girinti}faktoriyel({n}) = {n} × {alt} = {sonuc}")
    return sonuc

faktoriyel_iz(4)</pre>
<p>Çıktıda iki aşama görürsün: <b>iniş</b> sırasında çağrılar açılır ve hiçbiri henüz bitmemiştir (çarpma bekliyor); temel duruma varınca <b>çıkış</b> başlar ve her çerçeve, alttan gelen cevapla kendi çarpmasını yapıp yukarıya döner. Özyinelemeli adımdan <b>sonra</b> yazılan kod çıkış sırasında, yani ters sırayla çalışır.</p>
<div class="tip"><b>Hata ayıklama alışkanlığı</b>Özyinelemeli bir fonksiyon beklediğin sonucu vermiyorsa, ilk iş bu örnekteki gibi bir <code>derinlik</code> parametresi ekleyip giriş ve çıkışı girintili yazdır. Ağacın hangi dalında yanlış değer üretildiği hemen görünür.</div>

<h2>Liste üzerinde özyineleme</h2>
<p>Listeler de doğal olarak özyinelemelidir: bir liste, "ilk eleman" ile "geri kalan liste"den oluşur. Boş liste temel durumdur.</p>
<pre class="py">def toplam(liste):
    if not liste:                          # boş liste
        return 0
    return liste[0] + toplam(liste[1:])

def ters(metin):
    if len(metin) <= 1:
        return metin
    return ters(metin[1:]) + metin[0]

print(toplam([120, 80, 45.5]))
print(ters("Anadolu"))</pre>
<p>Bu örnekler kavramı öğretmek içindir; gerçek kodda <code>sum</code> ve <code>[::-1]</code> kullanırsın. Ayrıca <code>liste[1:]</code> her çağrıda yeni bir kopya oluşturur; uzun listelerde hem yavaş hem de yığın derinliği sınırına takılır. Özyinelemenin asıl gücü, düz listelerde değil, <b>derinliği bilinmeyen</b> yapılarda ortaya çıkar.</p>

<h2>İç içe liste: derinliği bilinmeyen yapı</h2>
<p>Bir depo sayım listesi, raflar içinde kutular, kutular içinde paketler olarak iç içe gelmiş olsun. Kaç katman olduğunu bilmeden tüm adetleri toplamak döngüyle zordur; özyinelemeyle doğaldır: her eleman ya bir sayıdır (temel durum) ya da yine bir listedir (özyinelemeli adım).</p>
<pre class="py">depo = [12, [3, 4, [10, 2]], [], [[[7]]], 1]

def ic_ice_toplam(veri):
    toplam = 0
    for x in veri:
        if isinstance(x, list):
            toplam += ic_ice_toplam(x)     # alt liste: aynı soruyu sor
        else:
            toplam += x                    # sayı: doğrudan ekle
    return toplam

def derinlik(veri):
    if not isinstance(veri, list):
        return 0
    en = 0
    for x in veri:
        en = max(en, derinlik(x))
    return 1 + en

print(ic_ice_toplam(depo))
print(derinlik(depo))</pre>
<p>Burada döngü ve özyineleme birlikte çalışıyor: döngü bir katmandaki <b>kardeşleri</b> gezer, özyineleme bir katman <b>aşağı</b> iner. Ağaç gezen fonksiyonların çoğu bu şekildedir. Temel durum ayrı bir <code>if</code> olarak değil, "liste değilse doğrudan ekle" dalı olarak gizlenmiştir.</p>

<h2>Klasör ağacı gezmek</h2>
<p>Dosya sistemi en tanıdık ağaçtır. Gerçek diske dokunmadan iç içe sözlükle simüle edelim: değer bir sayıysa dosya (boyutu KB), sözlükse klasördür.</p>
<pre class="py">disk = {
    "raporlar": {
        "2025": {"ocak.csv": 120, "subat.csv": 135},
        "ozet.pdf": 900,
    },
    "gorseller": {"logo.png": 48, "kampanya": {"banner.png": 310}},
    "notlar.txt": 4,
}

def toplam_boyut(klasor):
    toplam = 0
    for ad, icerik in klasor.items():
        if isinstance(icerik, dict):
            toplam += toplam_boyut(icerik)
        else:
            toplam += icerik
    return toplam

def agac_yazdir(klasor, derinlik=0):
    for ad, icerik in klasor.items():
        girinti = "  " * derinlik
        if isinstance(icerik, dict):
            print(f"{girinti}{ad}/  ({toplam_boyut(icerik)} KB)")
            agac_yazdir(icerik, derinlik + 1)
        else:
            print(f"{girinti}{ad}  {icerik} KB")

agac_yazdir(disk)
print("Toplam:", toplam_boyut(disk), "KB")</pre>
<p>Gerçek diskte aynı mantığı <code>pathlib.Path.iterdir()</code> ve <code>is_dir()</code> ile kurarsın; Python'un <code>os.walk</code> fonksiyonu da içeride tam olarak bu gezintiyi yapar.</p>

<h2>Fibonacci ve memoization</h2>
<p>Fibonacci dizisinde her sayı önceki ikisinin toplamıdır: 0, 1, 1, 2, 3, 5, 8, ... Tanımı özyinelemelidir ve koda doğrudan çevrilir. Ama bir sorun var: her çağrı <b>iki</b> çağrı daha yapar ve aynı değerler tekrar tekrar hesaplanır.</p>
<pre class="py">cagri = 0

def fib(n):
    global cagri
    cagri += 1
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

for n in [10, 20, 25]:
    cagri = 0
    print(f"fib({n}) = {fib(n)}, çağrı sayısı: {cagri}")</pre>
<p>fib(25) için iki yüz binden fazla çağrı yapılıyor; fib(40) yüz milyonları bulur. Çare: bir kez hesapladığın sonucu bir sözlükte saklayıp tekrar istendiğinde oradan vermek. Bu tekniğe <b>memoization</b> (ezberleme) denir.</p>
<pre class="py">def fib_memo(n, memo=None):
    if memo is None:
        memo = {}
    if n < 2:
        return n
    if n in memo:
        return memo[n]
    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]

print(fib_memo(80))

from functools import lru_cache

@lru_cache(maxsize=None)
def fib_cache(n):
    if n < 2:
        return n
    return fib_cache(n - 1) + fib_cache(n - 2)

print(fib_cache(80))
print(fib_cache.cache_info())</pre>
<p><code>memo=None</code> ile başlayıp içeride sözlük oluşturmamızın sebebi, Fonksiyonlar dersindeki değişebilir varsayılan tuzağıdır. <code>@lru_cache</code> ise aynı işi otomatik yapan hazır bir araçtır; başındaki <code>@</code> işaretiyle yazılan yapıya dekoratör denir ve Orta seviyede ayrıntılı göreceksin. Ezberleme yalnızca aynı argümanla aynı sonucu veren (saf) fonksiyonlarda güvenlidir.</p>

<h2>İkili arama: özyinelemeli</h2>
<p>Sıralı bir listede arama yaparken her adımda ortadaki elemana bakıp aramayı yarıya indirebilirsin: aranan değer ortadakinden küçükse sol yarıda, büyükse sağ yarıda ara. "Yarıda ara" aynı problemin küçüğüdür; temel durum, aralığın boşalmasıdır.</p>
<pre class="py">def ikili_ara(liste, hedef, bas=0, son=None):
    if son is None:
        son = len(liste) - 1
    if bas > son:                       # aralık boş: yok
        return -1
    orta = (bas + son) // 2
    print(f"  aralık [{bas}, {son}], orta={orta} ({liste[orta]})")
    if liste[orta] == hedef:
        return orta
    if hedef < liste[orta]:
        return ikili_ara(liste, hedef, bas, orta - 1)
    return ikili_ara(liste, hedef, orta + 1, son)

musteri_nolari = [101, 115, 220, 318, 402, 517, 640, 777, 812, 905]
print("Sonuç:", ikili_ara(musteri_nolari, 640))
print("Sonuç:", ikili_ara(musteri_nolari, 300))</pre>
<p>On elemanlı listede en fazla dört adım; bir milyon elemanda yaklaşık yirmi adım. Doğrusal arama bir milyon adım sürebilirdi. Her çağrıda listeyi dilimlemek yerine <code>bas</code> ve <code>son</code> indekslerini taşıdığımıza dikkat et; böylece kopya oluşturmayız.</p>

<h2>RecursionError ve yığın sınırı</h2>
<p>Yığın sonsuz değildir. Python, çok derin özyinelemeyi bir koruma sınırıyla durdurur ve <code>RecursionError</code> fırlatır. Sınır varsayılan olarak yaklaşık 1000 çerçevedir.</p>
<pre class="py">import sys
print("Sınır:", sys.getrecursionlimit())

def sonsuz(n):
    return sonsuz(n + 1)               # temel durum yok!

try:
    sonsuz(0)
except RecursionError as e:
    print("Hata:", e)

def toplam(liste):
    return 0 if not liste else liste[0] + toplam(liste[1:])

try:
    print(toplam(list(range(5000))))
except RecursionError:
    print("5000 elemanlı listede özyinelemeli toplam sınırı aştı")</pre>
<div class="warn"><b>Sınırı yükseltmek çözüm değildir</b><code>sys.setrecursionlimit(100000)</code> yazmak mümkündür ama gerçek yığın belleği tükenirse Python hata mesajı bile veremeden çökebilir. RecursionError genelde iki şeyden birini söyler: ya temel durum eksik/ulaşılamaz (hata), ya da problem bu derinlik için döngüyle çözülmelidir. Python, bazı dillerdeki gibi kuyruk çağrısı eniyilemesi (tail call optimization) yapmaz; özyinelemenin derinliği her zaman yığında yer kaplar.</div>

<h2>Döngü mü, özyineleme mi?</h2>
<div class="tbl-wrap"><table>
<tr><th>Durum</th><th>Tercih</th><th>Neden</th></tr>
<tr><td>Düz liste, sayaç, toplam, arama</td><td>Döngü</td><td>Daha hızlı, yığın sınırı yok, okunur</td></tr>
<tr><td>Derinliği bilinmeyen ağaç (klasör, kategori, JSON)</td><td>Özyineleme</td><td>Yapının tanımıyla aynı şekilde yazılır</td></tr>
<tr><td>Böl ve yönet (ikili arama, birleştirerek sıralama)</td><td>Özyineleme (ya da döngü)</td><td>Derinlik log n, sınır sorun olmaz</td></tr>
<tr><td>Çok derin zincir (on binlerce adım)</td><td>Döngü + yığın listesi</td><td>RecursionError riski</td></tr>
<tr><td>Tüm kombinasyonları deneme (sepet seçenekleri)</td><td>Özyineleme</td><td>"Al ya da alma" kararı doğal olarak dallanır</td></tr>
</table></div>
<div class="note"><b>Gerçek işte</b>Bir backend geliştiricisi özyinelemeyi en çok ağaç biçimli veride kullanır: e-ticaret sitesinin kategori menüsünü oluşturmak, bir yorumun tüm yanıt zincirini göstermek, organizasyon şemasında bir yöneticinin altındaki tüm çalışanları bulmak, bilinmeyen derinlikteki bir JSON yanıtında belirli bir anahtarı aramak, bir klasördeki tüm faturaları toplamak. Veri analistleri ise memoization fikrini sık kullanır: pahalı bir hesap ya da sorgu sonucunu önbelleğe almak, raporun dakikalar yerine saniyeler içinde çıkmasını sağlar.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Özyinelemeyi döngüye çevirmek: açık yığın</h3>
<p>Her özyineleme, Python'un çağrı yığınının işini senin yöneteceğin bir listeyle (açık yığın, explicit stack) yapılabilir. Böylece derinlik sınırı ortadan kalkar. Klasör boyutunu yığınla hesaplayalım:</p>
<pre class="py">disk = {"a": {"b": {"c.txt": 5}, "d.txt": 7}, "e.txt": 1}

def toplam_boyut_yigin(kok):
    toplam = 0
    yigin = [kok]
    while yigin:
        klasor = yigin.pop()
        for icerik in klasor.values():
            if isinstance(icerik, dict):
                yigin.append(icerik)       # sonra gezilecek
            else:
                toplam += icerik
    return toplam

print(toplam_boyut_yigin(disk))</pre>
<p><code>pop()</code> sondan alırsa derinlik öncelikli (depth-first), <code>pop(0)</code> ya da <code>collections.deque.popleft()</code> baştan alırsa genişlik öncelikli (breadth-first) gezinti olur. Graf algoritmalarının temeli bu iki gezintidir.</p>
<h3>Böl ve yönet</h3>
<p>Birleştirerek sıralama (merge sort) listeyi ikiye böler, her yarıyı özyinelemeyle sıralar, sonra iki sıralı yarıyı birleştirir. Derinlik yalnızca log n olduğundan bir milyon elemanda bile yirmi katmanı geçmez. Python'un <code>sorted</code> fonksiyonu (Timsort) bu fikrin geliştirilmiş bir hâlini kullanır.</p>
<h3>Özyinelemeli düşünmenin kontrol listesi</h3>
<ol>
<li>Temel durum(lar) her olası girdi için gerçekten ulaşılabilir mi? (Negatif sayı, boş liste, boş sözlük)</li>
<li>Her çağrı problemi küçültüyor mu?</li>
<li>Özyinelemeli çağrının <b>dönüş değerini kullanıyor musun</b>? (En sık hata: çağırıp sonucu atmak)</li>
<li>Aynı alt problemler tekrar tekrar mı çözülüyor? Öyleyse memoization.</li>
<li>Derinlik binleri bulabilir mi? Öyleyse açık yığınla döngü.</li>
</ol>
</section>
''',
'ex': [
# Isınma
{'t': 'mc', 'stage': 'Isınma',
 'q': 'Özyinelemeli bir fonksiyonda temel durum (base case) hiç yazılmazsa ne olur?',
 'o': ['Python fonksiyonu otomatik olarak döngüye çevirir', 'Fonksiyon kendini durmadan çağırır ve RecursionError oluşur', 'Fonksiyon None döndürüp sessizce biter', 'SyntaxError verir, kod hiç çalışmaz'],
 'a': 1,
 'why': 'Temel durum olmadan her çağrı yeni bir çağrı yapar; yığın yaklaşık 1000 çerçevelik sınıra ulaşınca Python RecursionError fırlatır. Söz dizimi açısından kod geçerlidir, bu yüzden SyntaxError oluşmaz.'},
{'t': 'mc', 'stage': 'Isınma',
 'q': 'Naif <code>fib(n) = fib(n-1) + fib(n-2)</code> neden büyük n için çok yavaştır?',
 'o': ['Büyük sayıları toplamak her adımda daha fazla bellek ve zaman istediği için', 'Aynı alt değerler tekrar tekrar hesaplanır, çağrı sayısı üstel büyür', 'Python özyinelemeli fonksiyonları her çağrıda yeniden derlediği için', 'Her çağrı bir önceki çağrının listesini baştan kopyaladığı için'],
 'a': 1,
 'why': 'Her çağrı iki çağrı daha yapar ve fib(n-2) gibi değerler ağacın farklı dallarında defalarca yeniden hesaplanır. Memoization her değeri bir kez hesaplayarak çağrı sayısını doğrusal düzeye indirir.'},
# Kodu oku
{'t': 'predict', 'stage': 'Kodu oku', 'q': 'Bu kod ne yazdırır?',
 'code': 'def f(n):\n    if n == 0:\n        return 0\n    return n + f(n - 1)\n\nprint(f(4))\n',
 'o': ['4', '10', '24', '0'], 'a': 1,
 'why': 'f(4) = 4 + f(3) = 4 + 3 + f(2) = 4 + 3 + 2 + 1 + f(0) = 10. 24 faktöriyel (çarpım) olurdu; 0 temel durumun kendisidir.'},
{'t': 'predict', 'stage': 'Kodu oku', 'q': 'Çağrı yığınının iniş ve çıkışı: bu kod ne yazdırır?',
 'code': 'def g(n):\n    if n == 0:\n        return\n    print("giriş", n)\n    g(n - 1)\n    print("çıkış", n)\n\ng(2)\n',
 'o': ['giriş 2\nçıkış 2\ngiriş 1\nçıkış 1', 'giriş 2\ngiriş 1\nçıkış 2\nçıkış 1', 'giriş 2\ngiriş 1\nçıkış 1\nçıkış 2', 'giriş 1\ngiriş 2\nçıkış 2\nçıkış 1'], 'a': 2,
 'why': 'Özyinelemeli çağrıdan önceki print iniş sırasında (2, 1), sonraki print çıkış sırasında ters sırayla (1, 2) çalışır. g(1) tamamen bitmeden g(2)\'nin "çıkış" satırına geçilmez.'},
{'t': 'predict', 'stage': 'Kodu oku', 'q': 'Bu kod çalıştırılınca ne olur?',
 'code': 'def bakiye_hesapla(ay):\n    if ay == 0:\n        return 1000\n    return bakiye_hesapla(ay - 2) * 1.02\n\nprint(bakiye_hesapla(5))\n',
 'o': ['1104.08 yazdırır', 'RecursionError hatası verir', '1061.21 yazdırır', 'ValueError hatası verir'], 'a': 1, 'raises': True,
 'why': 'ay 5, 3, 1, -1, -3 ... diye ikişer azalır ve hiçbir zaman tam 0 olmaz; temel duruma ulaşılamaz. Güvenli temel durum if ay <= 0 olurdu.'},
{'t': 'order', 'stage': 'Kodu oku',
 'q': '<p>İç içe listedeki tüm sayıları sayan (kaç tane sayı olduğunu bulan) özyinelemeli fonksiyonun satırlarını sırala.</p>',
 'lines': [
    'def say(veri):',
    '    adet = 0',
    '    for x in veri:',
    '        if isinstance(x, list):',
    '            adet += say(x)',
    '        else:',
    '            adet += 1',
    '    return adet',
    'print(say([1, [2, 3, [4]], [], 5]))'],
 'expect': '5\n',
 'hint': 'Sayaç döngüden önce başlar; döngü içinde alt liste için özyinelemeli çağrının sonucu eklenir, sayı için 1 eklenir; return döngüden sonra.',
 'why': 'Döngü bir katmandaki elemanları gezer, alt listeler için aynı fonksiyon bir katman aşağı iner ve kendi sayısını döndürür; bu sonuç üst katmandaki sayaca eklenir.'},
# Rehberli
{'t': 'code', 'stage': 'Rehberli', 'id': 'ozyineleme-1', 'diff': 1,
 'q': '<p><code>basamak_toplami(n)</code> fonksiyonunu <b>özyinelemeyle</b> yaz: negatif olmayan bir tam sayının basamaklarının toplamını döndürsün. Örnek: <code>basamak_toplami(4071)</code> → 12. (Anadolu Bank hesap numarası kontrol hanesi hesaplarında bu tür işlemler kullanılır.) Döngü ve <code>str</code> dönüşümü kullanma.</p>',
 'guide': ['Temel durumu yaz: n tek basamaklıysa (n < 10) n\'nin kendisini döndür.', 'Son basamağı n % 10 ile al.', 'Geri kalan sayıyı n // 10 ile elde et.', 'Son basamak + basamak_toplami(geri kalan) döndür.'],
 'example': 'def basamak_sayisi(n):\n    if n < 10:\n        return 1\n    return 1 + basamak_sayisi(n // 10)\n\nprint(basamak_sayisi(4071), basamak_sayisi(7))\n',
 'start': 'def basamak_toplami(n):\n    # TODO: temel durum (tek basamak)\n    # TODO: son basamak + kalan sayının basamak toplamı\n    pass\n',
 'sol': 'def basamak_toplami(n):\n    if n < 10:\n        return n\n    return n % 10 + basamak_toplami(n // 10)\n',
 'tests': 'assert basamak_toplami(4071) == 12, "4 + 0 + 7 + 1 = 12"\nassert basamak_toplami(7) == 7, "tek basamaklı sayı temel durumdur, kendisini döndürür"\nassert basamak_toplami(0) == 0, "0 için 0"\nassert basamak_toplami(99999) == 45, "99999 için 45"\nassert "for " not in __source__ and "while " not in __source__ and "str(" not in __source__, "döngü ve str kullanmadan özyinelemeyle çöz"\n',
 'hints': ['n % 10 son basamağı, n // 10 son basamağı atılmış sayıyı verir.', 'Temel durum: if n < 10: return n', 'return n % 10 + basamak_toplami(n // 10)'],
 'why': 'Her çağrı sayıdan bir basamak atar, böylece tek basamağa (temel duruma) mutlaka ulaşılır; dönüşte basamaklar toplanır.'},
{'t': 'code', 'stage': 'Rehberli', 'id': 'ozyineleme-2', 'diff': 2,
 'q': '<p>Depo sayım verisi rastgele derinlikte iç içe listeler olarak geliyor. <code>ic_ice_toplam(veri)</code> fonksiyonunu yaz: tüm sayıları (int ya da float) toplasın; alt listelere özyinelemeyle insin. Metin gibi sayı olmayan elemanları yok saysın.</p>',
 'guide': ['Toplamı 0 ile başlat ve elemanları döngüyle gez.', 'Eleman bir listeyse ic_ice_toplam(eleman) sonucunu toplama ekle.', 'Eleman int ya da float ise doğrudan ekle (isinstance(x, (int, float))).', 'Diğer her şeyi atla ve döngüden sonra toplamı döndür.'],
 'example': 'def metinleri_say(veri):\n    adet = 0\n    for x in veri:\n        if isinstance(x, list):\n            adet += metinleri_say(x)\n        elif isinstance(x, str):\n            adet += 1\n    return adet\n\nprint(metinleri_say(["a", [1, "b", ["c"]], 2]))\n',
 'start': 'def ic_ice_toplam(veri):\n    toplam = 0\n    for x in veri:\n        # TODO: liste ise özyinelemeli çağrının sonucunu ekle\n        # TODO: sayı ise doğrudan ekle\n        pass\n    return toplam\n',
 'sol': 'def ic_ice_toplam(veri):\n    toplam = 0\n    for x in veri:\n        if isinstance(x, list):\n            toplam += ic_ice_toplam(x)\n        elif isinstance(x, (int, float)):\n            toplam += x\n    return toplam\n',
 'tests': 'assert ic_ice_toplam([12, [3, 4, [10, 2]], [], [[[7]]], 1]) == 39, "tüm katmanlardaki sayıların toplamı 39"\nassert ic_ice_toplam([]) == 0, "boş liste 0"\nassert ic_ice_toplam([[[]]]) == 0, "yalnız boş listeler 0"\nassert ic_ice_toplam([1.5, ["raf-A", [2.5]], "not"]) == 4.0, "metinler yok sayılmalı, ondalıklılar toplanmalı"\n',
 'hints': ['Döngü kardeşleri gezer, özyineleme bir katman aşağı iner.', 'isinstance(x, list) ile alt listeyi tanı.', 'toplam += ic_ice_toplam(x) satırında dönüş değerini mutlaka kullan.'],
 'why': 'Her alt liste aynı problemin küçük bir örneğidir; fonksiyon onun toplamını hesaplayıp döndürür ve üst katman bu sonucu kendi toplamına ekler.'},
{'t': 'code', 'stage': 'Rehberli', 'id': 'ozyineleme-3', 'diff': 2,
 'q': '<p>İç içe sözlükle simüle edilen bir dosya sisteminde, değer sayıysa dosya (KB), sözlükse klasördür. <code>dosya_sayisi(klasor)</code> fonksiyonunu yaz: tüm alt klasörlerdekiler dahil toplam <b>dosya</b> sayısını döndürsün (klasörler sayılmaz).</p>',
 'guide': ['Sayacı 0 ile başlat.', 'klasor.values() ile içerikleri gez.', 'İçerik bir sözlükse dosya_sayisi(icerik) sonucunu ekle.', 'Değilse (dosya) 1 ekle.', 'Sayacı döndür.'],
 'example': 'def klasor_sayisi(klasor):\n    adet = 0\n    for icerik in klasor.values():\n        if isinstance(icerik, dict):\n            adet += 1 + klasor_sayisi(icerik)\n    return adet\n\nprint(klasor_sayisi({"a": {"b": {}, "x.txt": 1}, "c": {}}))\n',
 'start': 'def dosya_sayisi(klasor):\n    adet = 0\n    for ad, icerik in klasor.items():\n        # TODO: alt klasörse özyinele, dosyaysa 1 ekle\n        pass\n    return adet\n',
 'sol': 'def dosya_sayisi(klasor):\n    adet = 0\n    for ad, icerik in klasor.items():\n        if isinstance(icerik, dict):\n            adet += dosya_sayisi(icerik)\n        else:\n            adet += 1\n    return adet\n',
 'tests': 'disk = {"raporlar": {"2025": {"ocak.csv": 120, "subat.csv": 135}, "ozet.pdf": 900}, "gorseller": {"logo.png": 48, "kampanya": {"banner.png": 310}}, "notlar.txt": 4}\nassert dosya_sayisi(disk) == 6, f"6 dosya var; gelen {dosya_sayisi(disk)}"\nassert dosya_sayisi({}) == 0, "boş klasörde 0 dosya"\nassert dosya_sayisi({"bos": {}, "daha_bos": {"x": {}}}) == 0, "yalnız boş klasörler 0"\nassert dosya_sayisi({"a.txt": 0}) == 1, "boyutu 0 olan dosya da dosyadır"\n',
 'hints': ['Klasör = sözlük, dosya = sayı.', 'isinstance(icerik, dict) ise adet += dosya_sayisi(icerik)', 'else: adet += 1'],
 'why': 'Klasör ağacı kendine benzer bir yapıdır: bir klasörün dosya sayısı, doğrudan dosyaları ile alt klasörlerinin dosya sayılarının toplamıdır.'},
# Kendin yaz
{'t': 'code', 'stage': 'Kendin yaz', 'id': 'ozyineleme-4', 'diff': 2,
 'q': '<p><code>fib(n, memo=None)</code> fonksiyonunu özyineleme ve sözlükle memoization kullanarak yaz (<code>fib(0) = 0</code>, <code>fib(1) = 1</code>). <code>fib(90)</code> anında hesaplanabilmeli. Değişebilir varsayılan tuzağına düşme: <code>memo={}</code> yerine <code>None</code> ile başla. (lru_cache kullanma; tekniği elle kur.)</p>',
 'start': 'def fib(n, memo=None):\n    pass\n',
 'sol': 'def fib(n, memo=None):\n    if memo is None:\n        memo = {}\n    if n < 2:\n        return n\n    if n in memo:\n        return memo[n]\n    memo[n] = fib(n - 1, memo) + fib(n - 2, memo)\n    return memo[n]\n',
 'tests': 'assert [fib(i) for i in range(8)] == [0, 1, 1, 2, 3, 5, 8, 13], "ilk sekiz değer 0, 1, 1, 2, 3, 5, 8, 13 olmalı"\nassert fib(90) == 2880067194370816120, "fib(90) memoization ile anında hesaplanmalı"\nassert "lru_cache" not in __source__ and "cache" not in __source__.replace("memo", ""), "lru_cache kullanmadan sözlükle yaz"\nassert "memo={})" not in __source__.replace(" ", ""), "değişebilir varsayılan kullanma; None ile başla"\n',
 'hints': ['Önce memo None ise boş sözlük oluştur, sonra temel durum, sonra sözlükte var mı kontrolü.', 'Hesaplanan değeri memo[n] = ... ile sakla ve memo\'yu özyinelemeli çağrılara aktar.'],
 'why': 'Her n değeri bir kez hesaplanıp sözlükte saklandığı için çağrı sayısı üstelden doğrusala iner; memo\'yu parametreyle taşımak tüm çağrıların aynı sözlüğü paylaşmasını sağlar.'},
{'t': 'code', 'stage': 'Kendin yaz', 'id': 'ozyineleme-5', 'diff': 2,
 'q': '<p><code>ikili_ara(liste, hedef, bas=0, son=None)</code> fonksiyonunu <b>özyinelemeli</b> yaz. <code>liste</code> küçükten büyüğe sıralı müşteri numaralarıdır. Hedef bulunursa indeksini, yoksa <code>-1</code> döndür. Listeyi dilimleme (kopya oluşturma); <code>bas</code> ve <code>son</code> indekslerini taşı.</p>',
 'start': 'def ikili_ara(liste, hedef, bas=0, son=None):\n    pass\n',
 'sol': 'def ikili_ara(liste, hedef, bas=0, son=None):\n    if son is None:\n        son = len(liste) - 1\n    if bas > son:\n        return -1\n    orta = (bas + son) // 2\n    if liste[orta] == hedef:\n        return orta\n    if hedef < liste[orta]:\n        return ikili_ara(liste, hedef, bas, orta - 1)\n    return ikili_ara(liste, hedef, orta + 1, son)\n',
 'tests': 'nolar = [101, 115, 220, 318, 402, 517, 640, 777, 812, 905]\nfor i, n in enumerate(nolar):\n    assert ikili_ara(nolar, n) == i, f"{n} indeks {i}\'de bulunmalı"\nassert ikili_ara(nolar, 300) == -1, "olmayan numara -1"\nassert ikili_ara(nolar, 1) == -1 and ikili_ara(nolar, 9999) == -1, "aralık dışı değerler -1"\nassert ikili_ara([], 5) == -1, "boş liste -1"\nbuyuk = list(range(0, 2_000_000, 2))\nassert ikili_ara(buyuk, 1_234_566) == 617_283, "büyük listede de hızlı ve doğru çalışmalı"\nassert __source__.count("ikili_ara(") >= 2, "fonksiyon kendini çağırmalı (özyinelemeli)"\nassert "while" not in __source__, "döngü değil özyineleme kullan"\n',
 'hints': ['Temel durum: bas > son ise aralık boştur, -1 döndür.', 'Ortadaki değerle karşılaştır; küçükse (bas, orta - 1), büyükse (orta + 1, son) aralığında kendini çağır ve sonucu return et.'],
 'why': 'Her çağrı aralığı yarıya indirir; bir milyon elemanda en fazla yaklaşık 20 çağrı olduğundan yığın sınırına yaklaşılmaz. İndeks taşımak kopya maliyetini ortadan kaldırır.'},
{'t': 'code', 'stage': 'Kendin yaz', 'id': 'ozyineleme-6', 'diff': 2,
 'q': '<p>İK departmanı organizasyon şemasını iç içe sözlük olarak tutuyor: her çalışan <code>{"ad": ..., "unvan": ..., "ekip": [alt çalışanlar]}</code>. <code>sema_yazdir(calisan, derinlik=0)</code> fonksiyonunu yaz: her çalışanı derinlik başına 4 boşluk girintiyle <code>Ad (Unvan)</code> biçiminde yazdırsın, sonra ekibini aynı şekilde bir derinlik fazla girintiyle yazdırsın. <code>"ekip"</code> anahtarı olmayabilir. Program sonunda verilen <code>sirket</code> ile çağır.</p><pre class="out">Ayşe (Genel Müdür)\n    Mehmet (Satış Direktörü)\n        Can (Bölge Müdürü)\n        Ece (Bölge Müdürü)\n    Zeynep (BT Direktörü)\n        Deniz (Yazılımcı)</pre>',
 'start': 'sirket = {"ad": "Ayşe", "unvan": "Genel Müdür", "ekip": [\n    {"ad": "Mehmet", "unvan": "Satış Direktörü", "ekip": [\n        {"ad": "Can", "unvan": "Bölge Müdürü"},\n        {"ad": "Ece", "unvan": "Bölge Müdürü", "ekip": []},\n    ]},\n    {"ad": "Zeynep", "unvan": "BT Direktörü", "ekip": [\n        {"ad": "Deniz", "unvan": "Yazılımcı"},\n    ]},\n]}\n\ndef sema_yazdir(calisan, derinlik=0):\n    pass\n\nsema_yazdir(sirket)\n',
 'sol': 'sirket = {"ad": "Ayşe", "unvan": "Genel Müdür", "ekip": [\n    {"ad": "Mehmet", "unvan": "Satış Direktörü", "ekip": [\n        {"ad": "Can", "unvan": "Bölge Müdürü"},\n        {"ad": "Ece", "unvan": "Bölge Müdürü", "ekip": []},\n    ]},\n    {"ad": "Zeynep", "unvan": "BT Direktörü", "ekip": [\n        {"ad": "Deniz", "unvan": "Yazılımcı"},\n    ]},\n]}\n\ndef sema_yazdir(calisan, derinlik=0):\n    print("    " * derinlik + f"{calisan[\'ad\']} ({calisan[\'unvan\']})")\n    for alt in calisan.get("ekip", []):\n        sema_yazdir(alt, derinlik + 1)\n\nsema_yazdir(sirket)\n',
 'expect': 'Ayşe (Genel Müdür)\n    Mehmet (Satış Direktörü)\n        Can (Bölge Müdürü)\n        Ece (Bölge Müdürü)\n    Zeynep (BT Direktörü)\n        Deniz (Yazılımcı)\n',
 'hints': ['Önce çalışanın kendisini "    " * derinlik girintiyle yazdır.', 'Sonra calisan.get("ekip", []) içindeki her alt çalışan için sema_yazdir(alt, derinlik + 1) çağır. Ekibi boş olan çalışan temel durumdur: döngü hiç çalışmaz.'],
 'why': 'Derinlik parametresi çağrı yığınındaki seviyeyi taşır; ekibi olmayan çalışanda döngü çalışmadığı için özyineleme kendiliğinden durur, ayrı bir if gerekmez.'},
{'t': 'code', 'stage': 'Kendin yaz', 'id': 'ozyineleme-7', 'diff': 2,
 'q': '<p><code>dosya_bul(klasor, uzanti, yol="")</code> fonksiyonunu yaz. Klasör iç içe sözlüktür (sözlük = klasör, sayı = dosya boyutu). Adı <code>uzanti</code> ile biten tüm dosyaların tam yollarını (<code>"raporlar/2025/ocak.csv"</code> gibi, ayraç <code>/</code>) sözlükteki gezinme sırasıyla bir liste olarak döndürsün.</p>',
 'start': 'def dosya_bul(klasor, uzanti, yol=""):\n    pass\n',
 'sol': 'def dosya_bul(klasor, uzanti, yol=""):\n    bulunan = []\n    for ad, icerik in klasor.items():\n        tam = yol + "/" + ad if yol else ad\n        if isinstance(icerik, dict):\n            bulunan.extend(dosya_bul(icerik, uzanti, tam))\n        elif ad.endswith(uzanti):\n            bulunan.append(tam)\n    return bulunan\n',
 'tests': 'disk = {"raporlar": {"2025": {"ocak.csv": 120, "subat.csv": 135, "grafik.png": 40}, "ozet.pdf": 900}, "gorseller": {"logo.png": 48, "kampanya": {"banner.png": 310}}, "liste.csv": 4}\nassert dosya_bul(disk, ".csv") == ["raporlar/2025/ocak.csv", "raporlar/2025/subat.csv", "liste.csv"], f"csv yolları hatalı: {dosya_bul(disk, \'.csv\')}"\nassert dosya_bul(disk, ".png") == ["raporlar/2025/grafik.png", "gorseller/logo.png", "gorseller/kampanya/banner.png"], "png dosyaları tam yollarıyla gelmeli"\nassert dosya_bul(disk, ".exe") == [], "eşleşme yoksa boş liste"\nassert dosya_bul({}, ".csv") == [], "boş klasör"\n',
 'hints': ['Yolu parametreyle aşağı taşı: alt klasör çağrısına yol + "/" + ad ver (en üstte başında / olmamalı).', 'Alt klasörden dönen listeyi extend ile kendi listene ekle.'],
 'why': 'Yol bilgisi iniş sırasında parametreyle taşınır, bulunan dosyalar çıkış sırasında listelerle yukarı toplanır; bu iki yönlü akış ağaç gezen fonksiyonların temel kalıbıdır.'},
# Hata avı
{'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'ozyineleme-8', 'diff': 1,
 'q': '<p>Hatayı bul ve düzelt. <code>taksit_secenekleri(n)</code> n taksitli bir alışverişte kampanya kodu için n! (faktöriyel) hesaplıyor. <code>taksit_secenekleri(5)</code> doğru çalışıyor ama tek çekim (0 taksit) gönderilince sistem çöküyor.</p>',
 'start': 'def taksit_secenekleri(n):\n    if n == 1:\n        return 1\n    return n * taksit_secenekleri(n - 1)\n',
 'sol': 'def taksit_secenekleri(n):\n    if n <= 1:\n        return 1\n    return n * taksit_secenekleri(n - 1)\n',
 'tests': 'assert taksit_secenekleri(5) == 120, "5! = 120"\nassert taksit_secenekleri(1) == 1, "1! = 1"\ntry:\n    sonuc = taksit_secenekleri(0)\nexcept RecursionError:\n    raise AssertionError("0 için temel duruma hiç ulaşılmıyor (0, -1, -2, ...): temel durumu n <= 1 yap")\nassert sonuc == 1, "0! = 1 olmalı"\n',
 'hints': ['n = 0 ile başlayınca çağrılar 0, -1, -2 diye iner; n == 1 hiç gerçekleşmez.', 'Temel durumu tüm küçük girdileri kapsayacak şekilde genişlet: n <= 1.'],
 'why': 'Temel durum her olası girdi için ulaşılabilir olmalı. Eşitlik (==) yerine aralık (<=) kontrolü, beklenmeyen başlangıç değerlerinde de özyinelemeyi durdurur.'},
{'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'ozyineleme-9', 'diff': 2,
 'q': '<p>Hatayı bul ve düzelt. <code>en_derin(kategori)</code> bir kategori ağacının derinliğini döndürmeli: alt kategorisi olmayan kategori 1, bir katman alt kategorisi olan 2, ... Fonksiyon hata vermiyor ama her ağaç için 1 döndürüyor.</p>',
 'start': 'def en_derin(kategori):\n    en = 0\n    for alt in kategori.get("alt", []):\n        en_derin(alt)\n        en = max(en, 1)\n    return 1 + en\n',
 'sol': 'def en_derin(kategori):\n    en = 0\n    for alt in kategori.get("alt", []):\n        en = max(en, en_derin(alt))\n    return 1 + en\n',
 'tests': 'yaprak = {"ad": "Kılıf"}\nassert en_derin(yaprak) == 1, "alt kategorisi olmayan kategori derinliği 1"\nagac = {"ad": "Elektronik", "alt": [\n    {"ad": "Telefon", "alt": [{"ad": "Aksesuar", "alt": [{"ad": "Kılıf"}, {"ad": "Şarj"}]}, {"ad": "Akıllı"}]},\n    {"ad": "TV"},\n]}\nassert en_derin(agac) == 4, f"Elektronik > Telefon > Aksesuar > Kılıf: derinlik 4; gelen {en_derin(agac)}"\nassert en_derin({"ad": "A", "alt": [{"ad": "B"}]}) == 2, "tek katman alt kategori: 2"\n',
 'hints': ['Özyinelemeli çağrının dönüş değeri nereye gidiyor?', 'Alt ağacın derinliğini kullan: en = max(en, en_derin(alt))'],
 'why': 'Özyinelemeli çağrıyı yapıp sonucunu kullanmamak en sık hatadır: alt ağaçlar hesaplanır ama cevap çöpe gider. Dönüş değeri üst katmanın hesabına katılmalıdır.'},
# Meydan okuma
{'t': 'code', 'stage': 'Meydan okuma', 'id': 'ozyineleme-10', 'diff': 3,
 'q': '<p>Anadolu Market "hediye çeki" kampanyası: müşteri çekinin tutarını <b>tam olarak</b> harcamak istiyor. <code>tam_sepetler(urunler, butce)</code> fonksiyonunu özyinelemeyle yaz: <code>urunler</code> <code>(ad, fiyat)</code> listesidir; her ürün en fazla bir kez seçilebilir. Fiyat toplamı tam <code>butce</code> olan tüm ürün kombinasyonlarını, her biri ürün adlarının listede geçtiği sırayla bir liste olacak şekilde döndür. Kombinasyonların sırası: her adımda ürünü <b>almayı</b> önce dene, sonra <b>almamayı</b>.</p><p>Örnek: <code>[("çay", 50), ("kahve", 100), ("kupa", 50)]</code>, bütçe 100 → <code>[["çay", "kupa"], ["kahve"]]</code></p>',
 'start': 'def tam_sepetler(urunler, butce):\n    pass\n',
 'sol': 'def tam_sepetler(urunler, butce, i=0, secilen=None):\n    if secilen is None:\n        secilen = []\n    if butce == 0:\n        return [secilen[:]]\n    if butce < 0 or i == len(urunler):\n        return []\n    ad, fiyat = urunler[i]\n    secilen.append(ad)\n    alinan = tam_sepetler(urunler, butce - fiyat, i + 1, secilen)\n    secilen.pop()\n    alinmayan = tam_sepetler(urunler, butce, i + 1, secilen)\n    return alinan + alinmayan\n',
 'tests': 'u = [("çay", 50), ("kahve", 100), ("kupa", 50)]\nassert tam_sepetler(u, 100) == [["çay", "kupa"], ["kahve"]], f"örnekteki sonuç bekleniyordu; gelen {tam_sepetler(u, 100)}"\nassert tam_sepetler(u, 200) == [["çay", "kahve", "kupa"]], "tüm ürünler tam 200"\nassert tam_sepetler(u, 30) == [], "hiçbir kombinasyon 30 etmiyor"\nassert tam_sepetler(u, 0) == [[]], "bütçe 0 ise tek çözüm boş sepettir"\nassert tam_sepetler([], 50) == [], "ürün yoksa çözüm yok"\nv = [("a", 10), ("b", 20), ("c", 30), ("d", 40), ("e", 50)]\nr = tam_sepetler(v, 60)\nassert r == [["a", "b", "c"], ["a", "e"], ["b", "d"]], f"al/alma sırası korunmalı; gelen {r}"\nassert tam_sepetler(u, 100) == [["çay", "kupa"], ["kahve"]], "art arda çağrılar birbirini etkilememeli (değişebilir varsayılan tuzağı)"\n',
 'hints': ['Her ürün için iki dal var: al (bütçeden düş, sonraki ürüne geç) ya da alma (bütçe aynı, sonraki ürüne geç).', 'Temel durumlar: bütçe 0 → bir çözüm bulundu; bütçe negatif ya da ürün kalmadı → çözüm yok.', 'İndeks (i) ve o ana kadar seçilenleri ek parametrelerle taşı; seçilen listesini kopyalayarak sonuca ekle ve dönüşte pop ile geri al (geri izleme, backtracking).'],
 'why': '"Al ya da alma" kararı her üründe ikiye dallanan bir ağaç kurar; temel durumlar bu ağacın yapraklarıdır. Seçilen listesini ekle-çalıştır-geri al kalıbıyla yönetmek geri izleme (backtracking) tekniğidir; sonuca eklerken kopya almak, sonraki değişikliklerin çözümü bozmasını önler.'},
# Mini proje
{'t': 'code', 'stage': 'Mini proje', 'id': 'ozyineleme-11', 'diff': 3,
 'q': '<p>Anadolu Market kategori ağacı için üç özyinelemeli fonksiyon yaz. Her düğüm <code>{"ad": ..., "urunler": [fiyatlar], "alt": [alt düğümler]}</code> biçimindedir; <code>"urunler"</code> ve <code>"alt"</code> anahtarları olmayabilir.</p><ul><li><code>urun_sayisi(dugum)</code>: düğüm ve tüm alt kategorilerdeki toplam ürün sayısı.</li><li><code>en_pahali(dugum)</code>: ağaçtaki en yüksek fiyat; hiç ürün yoksa <code>None</code>.</li><li><code>yol_bul(dugum, ad)</code>: kökten adı verilen kategoriye kadar kategori adlarının listesi (ör. <code>["Elektronik", "Telefon", "Aksesuar"]</code>); bulunamazsa <code>None</code>.</li></ul>',
 'start': 'agac = {"ad": "Elektronik", "urunler": [15000], "alt": [\n    {"ad": "Telefon", "urunler": [32000, 18500], "alt": [\n        {"ad": "Aksesuar", "urunler": [250, 400, 650]},\n        {"ad": "Akıllı saat", "urunler": [], "alt": []},\n    ]},\n    {"ad": "Bilgisayar", "alt": [{"ad": "Dizüstü", "urunler": [45000]}]},\n]}\n\ndef urun_sayisi(dugum):\n    # TODO\n    pass\n\ndef en_pahali(dugum):\n    # TODO\n    pass\n\ndef yol_bul(dugum, ad):\n    # TODO\n    pass\n',
 'sol': 'agac = {"ad": "Elektronik", "urunler": [15000], "alt": [\n    {"ad": "Telefon", "urunler": [32000, 18500], "alt": [\n        {"ad": "Aksesuar", "urunler": [250, 400, 650]},\n        {"ad": "Akıllı saat", "urunler": [], "alt": []},\n    ]},\n    {"ad": "Bilgisayar", "alt": [{"ad": "Dizüstü", "urunler": [45000]}]},\n]}\n\ndef urun_sayisi(dugum):\n    adet = len(dugum.get("urunler", []))\n    for alt in dugum.get("alt", []):\n        adet += urun_sayisi(alt)\n    return adet\n\ndef en_pahali(dugum):\n    en = None\n    for f in dugum.get("urunler", []):\n        if en is None or f > en:\n            en = f\n    for alt in dugum.get("alt", []):\n        alt_en = en_pahali(alt)\n        if alt_en is not None and (en is None or alt_en > en):\n            en = alt_en\n    return en\n\ndef yol_bul(dugum, ad):\n    if dugum["ad"] == ad:\n        return [dugum["ad"]]\n    for alt in dugum.get("alt", []):\n        yol = yol_bul(alt, ad)\n        if yol is not None:\n            return [dugum["ad"]] + yol\n    return None\n',
 'tests': 'assert urun_sayisi(agac) == 7, f"toplam 7 ürün (1 + 2 + 3 + 0 + 0 + 1); gelen {urun_sayisi(agac)}"\nassert urun_sayisi({"ad": "Boş"}) == 0, "anahtarları olmayan düğümde 0"\nassert en_pahali(agac) == 45000, "en pahalı ürün Dizüstü altında 45000"\nassert en_pahali({"ad": "Boş", "alt": [{"ad": "Daha boş"}]}) is None, "hiç ürün yoksa None"\nassert en_pahali(agac["alt"][0]) == 32000, "Telefon alt ağacında en pahalı 32000"\nassert yol_bul(agac, "Aksesuar") == ["Elektronik", "Telefon", "Aksesuar"], f"Aksesuar yolu hatalı: {yol_bul(agac, \'Aksesuar\')}"\nassert yol_bul(agac, "Dizüstü") == ["Elektronik", "Bilgisayar", "Dizüstü"], "Dizüstü yolu"\nassert yol_bul(agac, "Elektronik") == ["Elektronik"], "kökün yolu yalnız kendisi"\nassert yol_bul(agac, "Mobilya") is None, "bulunamayan kategori None"\n',
 'hints': ['Üç fonksiyonun da iskeleti aynı: kendi düğümünü işle, sonra dugum.get("alt", []) içindeki her alt düğüm için kendini çağır ve sonucu birleştir.', 'en_pahali\'de alt ağaçtan None gelebilir; karşılaştırmadan önce kontrol et.', 'yol_bul\'da bir alt ağaçtan None olmayan bir yol gelirse başına kendi adını ekleyip hemen döndür.'],
 'why': 'Ağaç üzerindeki hemen her soru aynı kalıpla çözülür: düğümün kendi katkısı + alt ağaçların özyinelemeli cevaplarının birleşimi. Birleştirme işlemi soruya göre değişir: toplama, en büyük seçme ya da ilk bulunan yolu öne ekleyerek yukarı taşıma.'},
],
'faq': [
 {'q': 'Özyineleme döngüden daha mı yavaş?', 'a': 'Python\'da genellikle evet: her çağrı bir çerçeve oluşturur ve bunun maliyeti vardır. Düz listelerde döngü tercih edilir. Ama ağaç gibi yapılarda özyineleme hem daha kısa hem daha az hataya açıktır; hız farkı çoğu iş için önemsizdir.'},
 {'q': 'Recursion limit\'i yükseltmek güvenli mi?', 'a': 'sys.setrecursionlimit ile yükseltebilirsin ama gerçek yığın belleği tükenirse yorumlayıcı hata mesajı vermeden çökebilir. Derinlik binleri buluyorsa açık yığınlı döngüye geçmek daha sağlıklıdır.'},
 {'q': 'Memoization ile önbellek (cache) aynı şey mi?', 'a': 'Memoization, bir fonksiyonun sonuçlarını argümanlarına göre saklayan özel bir önbellekleme türüdür. Genel önbellek kavramı daha geniştir: veritabanı sorgusu, web yanıtı, dosya içeriği gibi her pahalı sonucu kapsar.'},
 {'q': 'Her özyinelemeli fonksiyon döngüyle yazılabilir mi?', 'a': 'Evet. En kötü ihtimalle çağrı yığınının işini kendi listenle (açık yığın) yaparsın. Bazen sonuç çok daha uzun ve karışık olur; bu yüzden ağaç ve geri izleme problemlerinde özyineleme tercih edilir.'},
],
'mistakes': [
 {'bad': 'def fakt(n):\n    if n == 1:\n        return 1\n    return n * fakt(n - 1)', 'good': 'def fakt(n):\n    if n <= 1:\n        return 1\n    return n * fakt(n - 1)', 'why': 'fakt(0) ya da negatif girdide n == 1 hiç gerçekleşmez ve RecursionError oluşur.'},
 {'bad': 'for alt in dugum["alt"]:\n    derinlik(alt)', 'good': 'for alt in dugum["alt"]:\n    en = max(en, derinlik(alt))', 'why': 'Özyinelemeli çağrının dönüş değeri kullanılmazsa alt ağacın cevabı kaybolur.'},
 {'bad': 'def fib(n, memo={}):\n    ...', 'good': 'def fib(n, memo=None):\n    if memo is None:\n        memo = {}', 'why': 'Değişebilir varsayılan tüm çağrılar arasında paylaşılır; beklenmedik sonuçlar ve bellek sızıntısı yaratabilir.'},
 {'bad': 'def toplam(liste):\n    return liste[0] + toplam(liste[1:])', 'good': 'def toplam(liste):\n    if not liste:\n        return 0\n    return liste[0] + toplam(liste[1:])', 'why': 'Boş liste temel durumu yoksa sonunda liste[0] IndexError verir.'},
 {'bad': 'sonuclar.append(secilen)', 'good': 'sonuclar.append(secilen[:])', 'why': 'Geri izlemede seçilen listesi sonra değişir; kopya almazsan kaydettiğin çözümler de bozulur.'},
],
}
