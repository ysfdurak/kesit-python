html = f'''
<h2>Ölçüm araç kutusu: hangi soruya hangi araç?</h2>
<p>Derste <code>timeit</code> ve <code>cProfile</code> ile tanıştın. Gerçek işte soru her zaman "ne kadar sürdü?" değildir; bazen "hangi satır?", bazen "çalışan bir sunucu neden takıldı?", bazen "bellek nereye gitti?" diye sorarsın. Her soru için ayrı bir araç vardır.</p>
<div class="tbl-wrap"><table>
<tr><th>Soru</th><th>Araç</th><th>Nerede çalışır?</th></tr>
<tr><td>İki kısa alternatiften hangisi hızlı?</td><td><code>timeit</code> (<code>repeat</code> ile)</td><td>Standart kütüphane, tarayıcıda da</td></tr>
<tr><td>Bir iş bloğu kaç saniye sürdü?</td><td><code>time.perf_counter()</code></td><td>Standart kütüphane</td></tr>
<tr><td>Hangi fonksiyon zaman yiyor?</td><td><code>cProfile</code> + <code>pstats</code></td><td>Standart kütüphane</td></tr>
<tr><td>Fonksiyonun hangi satırı?</td><td><code>line_profiler</code> (kernprof)</td><td>Kendi bilgisayarında, <code>pip install line_profiler</code></td></tr>
<tr><td>Çalışan süreç neden yavaş? (kodu değiştirmeden)</td><td><code>py-spy</code></td><td>Kendi bilgisayarında, <code>pip install py-spy</code></td></tr>
<tr><td>CPU + bellek birlikte, satır satır</td><td><code>scalene</code></td><td>Kendi bilgisayarında, <code>pip install scalene</code></td></tr>
<tr><td>Hangi satır ne kadar bellek ayırdı?</td><td><code>tracemalloc</code></td><td>Standart kütüphane</td></tr>
</table></div>

<h3>perf_counter, time ve process_time</h3>
<p><code>time.time()</code> duvar saatidir; sistem saati senkronize edilince geri bile gidebilir. Süre ölçmek için <b>tekdüze (monotonic)</b> ve yüksek çözünürlüklü <code>time.perf_counter()</code> kullan. <code>time.process_time()</code> yalnızca işlemcinin senin sürecin için harcadığı süreyi verir; ağ ya da disk beklerken artmaz. Fark büyükse kodun hesap yapmıyor, bekliyordur: çözüm algoritma değil, eşzamanlılıktır (bunu <i>eszamanlilik</i> ve <i>async</i> derslerinde gördün).</p>
{pre("""
import time
from functools import wraps

def zamanla(fn):
    @wraps(fn)
    def sarmal(*args, **kwargs):
        t0, c0 = time.perf_counter(), time.process_time()
        try:
            return fn(*args, **kwargs)
        finally:
            duvar = time.perf_counter() - t0
            cpu = time.process_time() - c0
            print(f"{fn.__name__}: duvar={duvar:.3f}s cpu={cpu:.3f}s")
    return sarmal

@zamanla
def hesapla():
    return sum(i * i for i in range(300_000))

@zamanla
def bekle():
    time.sleep(0.2)          # ağ/disk beklemesinin taklidi

hesapla()
bekle()                      # duvar ~0.2 s, cpu ~0: kod bekliyor, hesaplamıyor
""")}

<h3>timeit.repeat: gürültüye karşı en küçük değer</h3>
<p>Tek bir ölçüm arka plandaki işlere, önbelleğe, işlemci frekansına göre oynar. <code>timeit.repeat(..., repeat=5, number=N)</code> ölçümü beş kez tekrarlar; <b>ortalamayı değil en küçüğü</b> al. En küçük değer "kodun gerçekte ne kadar sürdüğüne" en yakın olandır; daha büyük değerler kodun değil makinenin gürültüsüdür.</p>
{pre("""
import timeit

veri = list(range(10_000))
sonuclar = timeit.repeat(lambda: sorted(veri, reverse=True), repeat=5, number=200)
print("ölçümler:", [round(s, 4) for s in sonuclar])
print(f"en iyi: {min(sonuclar) / 200 * 1e6:.1f} µs / çağrı")
""")}

<h2>Komut satırından profil: kurulum ve sık hatalar</h2>
<p>Aşağıdaki araçlar tarayıcıda çalışmaz; kendi bilgisayarında, projenin sanal ortamı etkinken dene.</p>
{precode("""
# 1) cProfile'ı kod değiştirmeden çalıştır, kümülatif süreye göre sırala
python -m cProfile -s cumtime gece_raporu.py | head -25

# 2) Sonucu dosyaya kaydedip sonra incele
python -m cProfile -o profil.out gece_raporu.py
python -m pstats profil.out        # açılan kabukta: sort cumtime / stats 15

# 3) Satır satır: fonksiyonun üstüne @profile yaz, kernprof ile çalıştır
pip install line_profiler
kernprof -l -v gece_raporu.py

# 4) Çalışan sürece dışarıdan bak (sunucuyu durdurmadan)
pip install py-spy
py-spy top --pid 12345
py-spy record -o profil.svg -- python gece_raporu.py   # alev grafiği (flame graph)
""")}
<div class="tbl-wrap"><table>
<tr><th>Belirti</th><th>Neden</th><th>Çözüm</th></tr>
<tr><td><code>NameError: name 'profile' is not defined</code></td><td><code>@profile</code> dekoratörünü yalnızca <code>kernprof</code> tanımlar; betiği düz <code>python</code> ile çalıştırdın</td><td><code>kernprof -l -v dosya.py</code> kullan ya da işin bitince dekoratörü sil</td></tr>
<tr><td>py-spy: <code>Permission denied</code></td><td>macOS ve Linux başka sürece bağlanmayı kısıtlar</td><td>macOS'ta <code>sudo py-spy ...</code>; Linux'ta <code>sudo</code> ya da kendi başlattığın süreci <code>record -- python ...</code> ile izle</td></tr>
<tr><td><code>kernprof: command not found</code></td><td>Paket başka bir ortama kuruldu ya da Scripts/bin klasörü PATH'te değil</td><td>Sanal ortamı etkinleştir; <code>python -m kernprof -l -v dosya.py</code></td></tr>
<tr><td>cProfile çıktısında yüzlerce <code>{{built-in method ...}}</code> satırı</td><td>Sıralama yapılmadı</td><td><code>-s cumtime</code> ekle, ilk 20-30 satıra bak</td></tr>
</table></div>
<div class="warn"><b>Profilci de yavaşlatır</b>cProfile her fonksiyon çağrısını sayar; çok küçük fonksiyonları çok sık çağıran kod profil altında 2-3 kat yavaş görünebilir. Mutlak süreye değil, <b>oranlara</b> bak: "toplam sürenin yüzde 80'i şu fonksiyonda" bilgisi doğrudur.</div>

<h2>Bellek profili: tracemalloc ile anlık görüntü karşılaştırma</h2>
<p><code>tracemalloc</code> Python'ın ayırdığı belleği izler. İki anlık görüntü (snapshot) alıp farkını satır satır listelersen "bellek nerede büyüdü?" sorusunu yanıtlarsın. <code>get_traced_memory()</code> ise (şu an, tepe) çiftini verir; bir fonksiyonun en yüksek bellek kullanımını ölçmenin en kolay yoludur.</p>
{pre("""
import tracemalloc

def liste_ile(n):
    return sum([i * 2 for i in range(n)])

def uretec_ile(n):
    return sum(i * 2 for i in range(n))

for fn in (liste_ile, uretec_ile):
    tracemalloc.start()
    fn(200_000)
    simdi, tepe = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    print(f"{fn.__name__:11}: tepe {tepe / 1024:8.1f} KB")
""")}

<h2>Standart kütüphanenin hızlı yolları</h2>
<p>Çoğu "hızlandırma" yeni bir şey yazmak değil, C ile yazılmış hazır aracı bulmaktır.</p>
<div class="tbl-wrap"><table>
<tr><th>Yavaş kalıp</th><th>Hızlı karşılığı</th><th>Neden</th></tr>
<tr><td><code>sorted(x, reverse=True)[:10]</code></td><td><code>heapq.nlargest(10, x)</code></td><td>Tümünü sıralamaz: O(n log k)</td></tr>
<tr><td>Sıralı listede <code>for</code> ile eşik arama</td><td><code>bisect.bisect_right</code></td><td>İkili arama: O(log n)</td></tr>
<tr><td>Elle sayaç sözlüğü</td><td><code>collections.Counter</code></td><td>Sayım döngüsü C'de</td></tr>
<tr><td>Döngüde <code>sonuc.append(f(x))</code></td><td>Liste kapsamı ya da <code>map</code></td><td>Metot araması her turda tekrarlanmaz</td></tr>
<tr><td>Döngüde <code>math.sqrt</code>, <code>self.oran</code></td><td>Döngü öncesi yerel ada bağla</td><td>Yerel ad araması nitelik aramasından ucuzdur</td></tr>
</table></div>
{pre("""
import heapq, bisect
from collections import Counter

tutarlar = [120, 5400, 80, 990, 15000, 300, 7200]
print("en büyük 3:", heapq.nlargest(3, tutarlar))

# Kademeli komisyon: 0-999 %3, 1000-4999 %2, 5000+ %1
esikler = [1000, 5000]
oranlar = [0.03, 0.02, 0.01]
for t in (500, 1000, 7200):
    print(t, "->", oranlar[bisect.bisect_right(esikler, t)])

sehirler = ["İzmir", "Ankara", "İzmir", "Bursa", "İzmir", "Ankara"]
print(Counter(sehirler).most_common(2))
""")}

<h2>Python yetmediğinde: seçenekler</h2>
<p>Algoritmayı düzelttin, numpy'a geçtin, hâlâ yavaş mı? Sırayla şu seçeneklere bakılır: <b>multiprocessing</b> (CPU işini çekirdeklere dağıtır, <i>eszamanlilik</i> dersinde), <b>Numba</b> (<code>pip install numba</code>, sayısal fonksiyonu <code>@njit</code> ile makine koduna derler), <b>Cython</b> (Python'a C tipleri ekleyip derler), <b>PyPy</b> (JIT'li alternatif yorumlayıcı; saf Python döngülerinde çok hızlı, bazı C eklentileriyle sorunlu). Python 3.13 ile deneysel JIT ve GIL'siz (free-threaded) sürüm de geldi; üretimde kullanmadan önce bağımlılıklarının desteklediğini doğrula.</p>
<div class="tip"><b>Önce soruyu küçült</b>En büyük kazanç çoğu zaman daha az veri işlemektir: SQL'de filtreyi veritabanına yaptır, yalnız gereken sütunları oku, dünün sonucunu önbellekten al. Hiç çalışmayan kod en hızlı koddur.</div>
<div class="note"><b>Gerçek işte</b>Performans düzeltmesini bir pull request'e koyarken "hızlandı" yazmak yetmez. Ölçümü de koy: hangi veri boyutuyla, kaç tekrarla, önce ve sonra kaç saniye. Ekip arkadaşın aynı komutu çalıştırıp sonucu doğrulayabilmeli. Kritik raporlar için basit bir süre testi (ör. "10 bin satır 2 saniyenin altında") CI'da gerilemeyi yakalar.</div>
'''

EX = []
EX.append(dict(t='mc', stage='Isınma',
    q='<code>timeit.repeat(..., repeat=5)</code> beş ölçüm döndürdü: 0.41, 0.39, 0.52, 0.40, 0.88. Raporda hangisini kullanmalısın?',
    o=['Ortalamayı (0.52), çünkü tüm ölçümleri hesaba katar', 'En küçüğü (0.39); büyük değerler makinenin gürültüsüdür', 'En büyüğü (0.88), en kötü durumu göstermek için', 'Medyanı; timeit yalnızca medyanla doğru sonuç verir'],
    a=1, why='Kodun kendisi her seferinde aynı işi yapar; ölçümü uzatan şey arka plan işleri ve önbellek gibi dış etkenlerdir. Bu yüzden timeit belgeleri en küçük değeri önerir. Ortalama ve en büyük değer gürültüyü de içerir.'))
EX.append(dict(t='mc', stage='Isınma',
    q='Bir fonksiyon için <code>perf_counter</code> farkı 4.2 s, <code>process_time</code> farkı 0.1 s çıktı. En olası yorum hangisi?',
    o=['Algoritma O(n²) karmaşıklıkta; önce iç içe döngüyü düzeltmelisin', 'Kod çoğunlukla G/Ç bekliyor (ağ/disk); hesap yapmıyor', 'process_time hatalı ölçer; yalnızca perf_counter\'a güvenmelisin', 'Çöp toplayıcı arka planda yaklaşık 4 saniye çalışmış'],
    a=1, why='process_time yalnız CPU süresini sayar. Duvar süresi büyük, CPU süresi küçükse kod hesap yapmıyor, G/Ç bekliyordur. Algoritmayı hızlandırmak bunu çözmez; istek sayısını azaltmak, toplu istek ya da thread/asyncio çözer.'))
EX.append(dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
    code='from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef kur(para):\n    return {"USD": 32.5, "EUR": 35.1}[para]\n\nfor p in ["USD", "EUR", "USD", "USD"]:\n    kur(p)\ni = kur.cache_info()\nprint(i.hits, i.misses, i.currsize)\n',
    o=['2 2 2', '0 4 2', '3 1 1', '2 2 4'], a=0,
    why='İlk USD ve ilk EUR çağrıları önbellekte yoktur (2 miss); sonraki iki USD önbellekten gelir (2 hit). Önbellekte iki farklı anahtar durur (currsize 2).'))
EX.append(dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
    code='import bisect\n\nesikler = [1000, 5000, 20000]\netiket = ["bronz", "gümüş", "altın", "platin"]\nfor ciro in (999, 1000, 20000):\n    print(etiket[bisect.bisect_right(esikler, ciro)], end=" ")\n',
    o=['bronz gümüş platin', 'bronz bronz altın', 'gümüş gümüş platin', 'bronz gümüş altın'], a=0,
    why='bisect_right eşit değeri sağına yerleştirir: 999 → 0 (bronz), 1000 → 1 (gümüş), 20000 → 3 (platin). bisect_left kullanılsaydı 1000 bronz, 20000 altın olurdu.'))
EX.append(dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
    code='tutarlar = (t * 2 for t in [10, 20, 30])\nprint(sum(tutarlar))\nprint(sum(tutarlar))\nprint(max(tutarlar, default=-1))\n',
    o=['120\n120\n60', '120\n0\n-1', '120\n0\n60', '120\nStopIteration'], a=1,
    why='Üreteç ifadesi bellekte yer kaplamaz ama tek kullanımlıktır. İlk sum onu tüketir; ikinci sum boş üreteci toplar (0), max boş olduğundan default değeri döner.'))
EX.append(dict(t='order', stage='Kodu oku',
    q='<p>Anadolu Market sipariş günlüğündeki en sık 2 şehri bulan ve bunu en hızlı yoldan yapan programın satırlarını sırala.</p>',
    lines=['from collections import Counter', 'kayitlar = "İzmir;Ankara;İzmir;Bursa;İzmir;Ankara"', 'sehirler = kayitlar.split(";")', 'sayac = Counter(sehirler)', 'for sehir, adet in sayac.most_common(2):', '    print(f"{sehir}: {adet}")'],
    expect='İzmir: 3\nAnkara: 2\n', hint='Önce metni parçala, sonra say, en son en sık olanları yazdır.',
    why='Counter sayımı C\'de yapar; most_common(k) içeride heapq kullanır, tümünü sıralamaz.'))
EX.append(dict(t='code', stage='Rehberli', id='performans-x1', diff=1,
    q='<p><code>sure_olc(fn)</code> adlı bir dekoratör yaz. Dekore edilen fonksiyon her çağrıldığında geçen süreyi <code>time.perf_counter()</code> ile ölçüp saniye cinsinden <code>SURELER</code> adlı modül düzeyi sözlüğe <code>SURELER[fonksiyon_adi]</code> listesine eklesin; fonksiyonun dönüş değerini aynen döndürsün. Fonksiyon hata fırlatsa bile süre kaydedilsin. <code>functools.wraps</code> ile fonksiyon adını koru.</p>',
    guide=['SURELER adında boş bir sözlük tanımla.', 'Dekoratörün içinde *args, **kwargs alan bir sarmal fonksiyon yaz ve @wraps(fn) ile süsle.', 'Başlangıçta perf_counter() al; çağrıyı try içinde yap.', 'finally bloğunda farkı hesapla ve SURELER.setdefault(fn.__name__, []) listesine ekle.', 'Sarmalı döndür.'],
    example='import time\n\ndef say(fn):\n    sayac = {"n": 0}\n    def sarmal(*a, **k):\n        sayac["n"] += 1\n        try:\n            return fn(*a, **k)\n        finally:\n            print("çağrı", sayac["n"])\n    return sarmal\n\n@say\ndef iki_kat(x):\n    return 2 * x\n\nprint(iki_kat(4))\n',
    start='import time\nfrom functools import wraps\n\nSURELER = {}\n\ndef sure_olc(fn):\n    # TODO: @wraps(fn) ile sarmal fonksiyon yaz\n    # TODO: perf_counter ile süreyi ölç, finally içinde SURELER\'e ekle\n    return fn\n',
    sol='import time\nfrom functools import wraps\n\nSURELER = {}\n\ndef sure_olc(fn):\n    @wraps(fn)\n    def sarmal(*args, **kwargs):\n        t0 = time.perf_counter()\n        try:\n            return fn(*args, **kwargs)\n        finally:\n            SURELER.setdefault(fn.__name__, []).append(time.perf_counter() - t0)\n    return sarmal\n',
    tests='@sure_olc\ndef topla(a, b):\n    return a + b\n\n@sure_olc\ndef patla():\n    raise ValueError("x")\n\nassert topla(2, 3) == 5, "Dönüş değeri aynen dönmeli"\ntopla(1, 1)\nassert len(SURELER.get("topla", [])) == 2, "topla iki kez çağrıldı; SURELER[\'topla\'] iki süre içermeli"\nassert all(isinstance(s, float) and s >= 0 for s in SURELER["topla"]), "Süreler saniye cinsinden float olmalı"\ntry:\n    patla()\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError("Hata yutulmamalı, yeniden fırlamalı")\nassert len(SURELER.get("patla", [])) == 1, "Hata fırlasa bile süre kaydedilmeli (finally)"\nassert topla.__name__ == "topla", "@wraps ile fonksiyon adı korunmalı"\n',
    hints=['Dekoratör bir fonksiyon alır, yeni bir fonksiyon döndürür; ölçüm sarmalın içinde yapılır.', 'try: return fn(*args, **kwargs) / finally: ... kalıbı, hata olsa da süre kaydını garanti eder.', 'SURELER.setdefault(fn.__name__, []).append(time.perf_counter() - t0)'],
    why='finally bloğu hem normal dönüşte hem hatada çalışır; böylece yavaş VE hatalı çağrılar da ölçülür. wraps olmadan profil çıktılarında tüm fonksiyonlar "sarmal" adıyla görünür.'))
EX.append(dict(t='code', stage='Rehberli', id='performans-x2', diff=2,
    q='<p><code>en_cok_cagrilan(fn, *args)</code> fonksiyonunu yaz: <code>fn(*args)</code> çağrısını <code>cProfile.Profile</code> altında çalıştırsın, <code>pstats.Stats(profil).stats</code> sözlüğünden <b>en çok çağrılan</b> fonksiyonun adını ve çağrı sayısını <code>(ad, sayi)</code> demeti olarak döndürsün. <code>stats</code> sözlüğünde anahtar <code>(dosya, satir, ad)</code>, değer <code>(cc, nc, tt, ct, callers)</code> biçimindedir; çağrı sayısı <code>nc</code>\'dir. Yalnızca adı <code>&lt;</code> ile başlamayan, yani gerçek Python fonksiyonlarını say; dosya adı <code>~</code> olan yerleşikleri de atla.</p>',
    guide=['cProfile.Profile() oluştur, enable() ile başlat, fn(*args) çağır, disable() ile durdur.', 'pstats.Stats(profil).stats sözlüğünde dolaş.', 'Anahtarı (dosya, satir, ad) olarak aç; dosya "~" ise ya da ad "<" ile başlıyorsa atla.', 'nc değeri en büyük olanı takip et ve (ad, nc) döndür.'],
    example='import cProfile, pstats\n\ndef kare(x):\n    return x * x\n\np = cProfile.Profile()\np.enable()\n[kare(i) for i in range(5)]\np.disable()\nfor (dosya, satir, ad), (cc, nc, tt, ct, _) in pstats.Stats(p).stats.items():\n    if ad == "kare":\n        print(ad, nc)\n',
    start='import cProfile, pstats\n\ndef en_cok_cagrilan(fn, *args):\n    profil = cProfile.Profile()\n    # TODO: profil altında fn(*args) çağır\n    # TODO: pstats.Stats(profil).stats içinden en çok çağrılanı bul\n    return None\n',
    sol='import cProfile, pstats\n\ndef en_cok_cagrilan(fn, *args):\n    profil = cProfile.Profile()\n    profil.enable()\n    fn(*args)\n    profil.disable()\n    en = (None, -1)\n    for (dosya, satir, ad), (cc, nc, tt, ct, callers) in pstats.Stats(profil).stats.items():\n        if dosya == "~" or ad.startswith("<"):\n            continue\n        if nc > en[1]:\n            en = (ad, nc)\n    return en\n',
    tests='def musteri_bul(mid, liste):\n    return mid in liste\n\ndef rapor(n):\n    liste = list(range(n))\n    return sum(1 for i in range(0, n, 10) if musteri_bul(i, liste))\n\nsonuc = en_cok_cagrilan(rapor, 500)\nassert sonuc == ("musteri_bul", 50), f"rapor(500) içinde musteri_bul 50 kez çağrılır; gelen: {sonuc}"\n\ndef a():\n    return b() + b() + b()\ndef b():\n    return 1\nassert en_cok_cagrilan(a) == ("b", 3), "a() içinde b üç kez çağrılır"\n',
    hints=['Profile nesnesinin enable/disable metotları ölçümü açıp kapatır.', 'pstats.Stats(profil).stats.items() size ((dosya, satir, ad), (cc, nc, tt, ct, callers)) çiftleri verir.', 'if dosya == "~" or ad.startswith("<"): continue  ile yerleşikleri ve genexpr/listcomp gibi iç kodları ele.'],
    why='Gerçek projelerde profil çıktısını programla okuyup "en pahalı 5 fonksiyon" raporu üretmek, CI\'da performans gerilemesini otomatik yakalamanın temelidir.'))
EX.append(dict(t='code', stage='Rehberli', id='performans-x3', diff=2,
    q='<p><code>tepe_bellek(fn, *args)</code> fonksiyonunu yaz: <code>tracemalloc</code> ile <code>fn(*args)</code> çağrısı sırasında ulaşılan <b>tepe</b> bellek miktarını bayt cinsinden (int) döndürsün. İzleme her durumda (fn hata fırlatsa bile) durdurulmalı.</p>',
    guide=['tracemalloc.start() ile izlemeyi başlat.', 'try bloğunda fn(*args) çağır.', 'tracemalloc.get_traced_memory() (simdi, tepe) döndürür; tepe değerini al.', 'finally içinde tracemalloc.stop() çağır ve tepeyi döndür.'],
    example='import tracemalloc\n\ntracemalloc.start()\nveri = ["x" * 100 for _ in range(1000)]\nsimdi, tepe = tracemalloc.get_traced_memory()\ntracemalloc.stop()\nprint(simdi > 100_000, tepe >= simdi)\n',
    start='import tracemalloc\n\ndef tepe_bellek(fn, *args):\n    # TODO: izlemeyi başlat, fn\'i çağır, tepe değerini oku\n    # TODO: finally ile tracemalloc.stop()\n    return 0\n',
    sol='import tracemalloc\n\ndef tepe_bellek(fn, *args):\n    tracemalloc.start()\n    try:\n        fn(*args)\n        _, tepe = tracemalloc.get_traced_memory()\n    finally:\n        tracemalloc.stop()\n    return tepe\n',
    tests='import tracemalloc\nbuyuk = tepe_bellek(lambda n: sum([i for i in range(n)]), 100_000)\nkucuk = tepe_bellek(lambda n: sum(i for i in range(n)), 100_000)\nassert isinstance(buyuk, int), "Tepe değeri int (bayt) olmalı"\nassert buyuk > 500_000, f"100 bin elemanlı liste en az 500 KB tutar; gelen {buyuk}"\nassert kucuk < buyuk / 10, "Üreteçli sürüm listeli sürümden çok daha az bellek kullanmalı"\ndef hatali():\n    raise RuntimeError("x")\ntry:\n    tepe_bellek(hatali)\nexcept RuntimeError:\n    pass\nassert not tracemalloc.is_tracing(), "Hata olsa bile tracemalloc.stop() çağrılmalı"\n',
    hints=['tracemalloc.start / get_traced_memory / stop üçlüsü yeter.', 'get_traced_memory() iki değer döndürür: (şu anki, tepe). Sana ikincisi lazım.', 'try: fn(*args); _, tepe = tracemalloc.get_traced_memory()  finally: tracemalloc.stop()'],
    why='Tepe bellek, sunucunun kaç GB RAM istediğini belirler. Listeyi üreteçle değiştirmenin kazancını bu fonksiyonla sayıya dökebilirsin.'))
EX.append(dict(t='code', stage='Kendin yaz', id='performans-x4', diff=2,
    q='<p><code>en_buyuk_islemler(islemler, k)</code> yaz: <code>islemler</code> (hesap, tutar) demetlerinden oluşan bir liste. Tutarı en büyük <code>k</code> işlemi büyükten küçüğe liste olarak döndür. Tüm listeyi sıralama; <code>heapq.nlargest</code> kullan. k 0 ya da negatifse boş liste dön.</p>',
    start='def en_buyuk_islemler(islemler, k):\n    pass\n',
    sol='import heapq\n\ndef en_buyuk_islemler(islemler, k):\n    if k <= 0:\n        return []\n    return heapq.nlargest(k, islemler, key=lambda x: x[1])\n',
    tests='veri = [("TR1", 500), ("TR2", 12000), ("TR3", 80), ("TR4", 9500), ("TR5", 30000)]\nassert en_buyuk_islemler(veri, 2) == [("TR5", 30000), ("TR2", 12000)], "En büyük iki tutar 30000 ve 12000"\nassert en_buyuk_islemler(veri, 10) == sorted(veri, key=lambda x: -x[1]), "k listeden büyükse hepsi sıralı dönmeli"\nassert en_buyuk_islemler(veri, 0) == [], "k=0 için boş liste"\nassert "nlargest" in __source__, "heapq.nlargest kullanmalısın"\n',
    hints=['heapq.nlargest(k, liste, key=...) imzasını kullan.', 'key=lambda x: x[1] tutara göre karşılaştırır.'],
    why='nlargest k küçükken O(n log k) çalışır ve tüm listeyi kopyalayıp sıralamaz; milyonlarca işlemde "ilk 10" için idealdir.'))
EX.append(dict(t='code', stage='Kendin yaz', id='performans-x5', diff=2,
    q='<p>Anadolu Bank kademeli komisyon uyguluyor. <code>komisyonlar(tutarlar)</code> fonksiyonu her tutar için komisyonu (tutar × oran, 2 basamağa yuvarlanmış) liste olarak döndürsün. Kademeler: 1000 altı %3, 1000–4999 %2, 5000–19999 %1, 20000 ve üstü %0.5. Uzun if/elif yerine sıralı <code>ESIKLER</code> listesi ve <code>bisect</code> kullan.</p>',
    start='ESIKLER = [1000, 5000, 20000]\nORANLAR = [0.03, 0.02, 0.01, 0.005]\n\ndef komisyonlar(tutarlar):\n    pass\n',
    sol='import bisect\n\nESIKLER = [1000, 5000, 20000]\nORANLAR = [0.03, 0.02, 0.01, 0.005]\n\ndef komisyonlar(tutarlar):\n    return [round(t * ORANLAR[bisect.bisect_right(ESIKLER, t)], 2) for t in tutarlar]\n',
    tests='assert komisyonlar([999]) == [29.97], "999 TL ilk kademe: %3"\nassert komisyonlar([1000]) == [20.0], "1000 TL tam sınırda ikinci kademeye girer: %2"\nassert komisyonlar([5000, 19999, 20000]) == [50.0, 199.99, 100.0], "Sınır değerlerini kontrol et"\nassert komisyonlar([]) == [], "Boş liste boş sonuç"\nassert "bisect" in __source__, "bisect modülünü kullanmalısın"\n',
    hints=['bisect_right(ESIKLER, t) tutarın kaçıncı kademede olduğunu verir.', 'Sınırdaki 1000 değeri ikinci kademeye girmeli: bisect_left mi bisect_right mı?'],
    why='Kademe sayısı arttıkça if/elif zinciri uzar ve hata riski büyür; veri + bisect hem O(log n) hem de yeni kademe eklemeyi tek satırlık veri değişikliğine indirir.'))
EX.append(dict(t='code', stage='Hata avı', id='performans-x6', kind='bug', diff=2,
    q='<p>Hatayı bul ve düzelt. Bir geliştirici <code>kdv_toplam</code> fonksiyonunu hızlandırmak için <code>lru_cache</code> ekledi ama fonksiyon artık liste ile çağrılınca çöküyor. <code>kdv_toplam(tutarlar)</code> liste ile çağrılabilmeli ve önbellekten yararlanmaya devam etmeli (aynı tutarlarla ikinci çağrı önbellekten gelmeli).</p>',
    start='from functools import lru_cache\n\n@lru_cache(maxsize=128)\ndef kdv_toplam(tutarlar):\n    return round(sum(t * 1.2 for t in tutarlar), 2)\n',
    sol='from functools import lru_cache\n\n@lru_cache(maxsize=128)\ndef _kdv_toplam(tutarlar):\n    return round(sum(t * 1.2 for t in tutarlar), 2)\n\ndef kdv_toplam(tutarlar):\n    return _kdv_toplam(tuple(tutarlar))\n',
    tests='assert kdv_toplam([100, 200]) == 360.0, "100 ve 200 TL\'nin KDV dahil toplamı 360"\nassert kdv_toplam([100, 200]) == 360.0\nassert kdv_toplam((50,)) == 60.0, "Demetle de çalışmalı"\nimport functools\nkaynak = __source__\nassert "lru_cache" in kaynak, "Önbelleği kaldırma; liste sorununu çöz"\nadaylar = [v for v in globals().values() if hasattr(v, "cache_info")]\nassert adaylar and max(a.cache_info().hits for a in adaylar) >= 1, "Aynı tutarlarla ikinci çağrı önbellekten (hit) gelmeli"\n',
    hints=['Hata mesajı "unhashable type: list" diyor: lru_cache argümanları sözlük anahtarı olarak saklar.', 'Önbellekli iç fonksiyon demet alsın; dıştaki fonksiyon listeyi tuple(...) ile çevirsin.'],
    why='lru_cache argümanları hash\'ler; liste ve sözlük hashlenemez. Değişmez bir türe (tuple, frozenset) çevirip önbellekli yardımcıya geçmek standart çözümdür.'))
EX.append(dict(t='code', stage='Hata avı', id='performans-x7', kind='bug', diff=2,
    q='<p>Hatayı bul ve düzelt. Bellek tasarrufu için listeyi üreteçle değiştiren ekip arkadaşın <code>ozet(tutarlar)</code> fonksiyonunu bozdu: artık <code>ZeroDivisionError</code> veriyor. Fonksiyon <code>{"toplam": ..., "adet": ..., "ortalama": ...}</code> döndürmeli ve girdiyi <b>tek geçişte</b> işlemeli (girdi büyük bir üreteç de olabilir, liste yapmadan çöz). Boş girdide ortalama 0 olsun.</p>',
    start='def ozet(tutarlar):\n    kdvli = (t * 1.2 for t in tutarlar)\n    toplam = sum(kdvli)\n    adet = len(list(kdvli))\n    return {"toplam": round(toplam, 2), "adet": adet, "ortalama": round(toplam / adet, 2)}\n',
    sol='def ozet(tutarlar):\n    toplam = 0.0\n    adet = 0\n    for t in tutarlar:\n        toplam += t * 1.2\n        adet += 1\n    ortalama = toplam / adet if adet else 0\n    return {"toplam": round(toplam, 2), "adet": adet, "ortalama": round(ortalama, 2)}\n',
    tests='assert ozet([100, 200, 300]) == {"toplam": 720.0, "adet": 3, "ortalama": 240.0}, "Üç tutarın KDV dahil özeti yanlış"\nassert ozet(x for x in [50, 50]) == {"toplam": 120.0, "adet": 2, "ortalama": 60.0}, "Girdi üreteç olabilir: tek geçişte topla ve say"\nassert ozet([]) == {"toplam": 0.0, "adet": 0, "ortalama": 0}, "Boş girdide ortalama 0"\nassert "list(" not in __source__, "Bellek için liste oluşturma; tek döngüde topla ve say"\n',
    hints=['Üreteç sum() ile tüketildikten sonra boştur; ikinci kez gezilemez.', 'Tek bir for döngüsünde hem toplamı hem adedi biriktir.'],
    why='Üreteçler bellek dostudur ama tek kullanımlıktır. Birden çok istatistik gerekiyorsa tek döngüde biriktirmek hem doğru hem bellek açısından en verimlisidir.'))
EX.append(dict(t='code', stage='Meydan okuma', id='performans-x8', diff=3,
    q='<p>Anadolu Market günlük ciro serisinde <code>k</code> günlük hareketli ortalama istiyor. <code>hareketli_ortalama(degerler, k)</code> her pencere için ortalamayı (2 basamak yuvarlanmış) liste olarak döndürsün; sonuç uzunluğu <code>len(degerler) - k + 1</code>. Her pencereyi yeniden toplamak O(n·k)\'dır; <b>kayan toplam</b> ile O(n) çöz: yeni gireni ekle, çıkanı düş. <code>k &lt;= 0</code> ise <code>ValueError</code>, <code>k</code> uzunluktan büyükse boş liste.</p>',
    start='def hareketli_ortalama(degerler, k):\n    pass\n',
    sol='def hareketli_ortalama(degerler, k):\n    if k <= 0:\n        raise ValueError("k pozitif olmalı")\n    n = len(degerler)\n    if k > n:\n        return []\n    toplam = sum(degerler[:k])\n    sonuc = [round(toplam / k, 2)]\n    for i in range(k, n):\n        toplam += degerler[i] - degerler[i - k]\n        sonuc.append(round(toplam / k, 2))\n    return sonuc\n',
    tests='assert hareketli_ortalama([10, 20, 30, 40, 50], 3) == [20.0, 30.0, 40.0], "3 günlük ortalamalar 20, 30, 40"\nassert hareketli_ortalama([5, 7], 1) == [5.0, 7.0], "k=1 değerlerin kendisi"\nassert hareketli_ortalama([1, 2], 5) == [], "k uzunluktan büyükse boş liste"\ntry:\n    hareketli_ortalama([1, 2], 0)\n    raise AssertionError("k=0 ValueError vermeli")\nexcept ValueError:\n    pass\nimport random, time\nrandom.seed(0)\nveri = [random.randint(100, 999) for _ in range(200_000)]\nt0 = time.perf_counter()\nr = hareketli_ortalama(veri, 5000)\nassert len(r) == 200_000 - 5000 + 1, "Sonuç uzunluğu n-k+1 olmalı"\nassert abs(r[0] - round(sum(veri[:5000]) / 5000, 2)) < 0.011 and abs(r[-1] - round(sum(veri[-5000:]) / 5000, 2)) < 0.011, "İlk/son pencere ortalaması yanlış"\nassert time.perf_counter() - t0 < 5, "Çok yavaş: her pencereyi yeniden toplama, kayan toplam kullan"\n',
    hints=['İlk pencerenin toplamını bir kez hesapla.', 'Pencere bir kaydığında toplam += yeni - eski olur; yeni = degerler[i], eski = degerler[i - k].'],
    why='Kayan pencere tekniği zaman serilerinde, log analizinde ve hız sınırlamada sürekli karşına çıkar; n·k işi n\'e indirir.'))

EXT = dict(id='performans', min=30, html=html, ex=EX,
    faq=[dict(q='Profil araçlarını üretim sunucusunda çalıştırmak güvenli mi?', a='cProfile ve line_profiler kodu belirgin yavaşlatır; üretimde kısa süreli ve dikkatli kullan. py-spy örnekleme (sampling) yapar, süreci durdurmadan dışarıdan okur ve ek yükü çok düşüktür; canlı sistemde ilk tercih odur.'),
         dict(q='Python 3.11 ve sonrası gerçekten daha mı hızlı?', a='Evet; 3.11 ile gelen uyarlanabilir yorumlayıcı birçok saf Python kodunu belirgin hızlandırdı. Sürüm yükseltmek çoğu zaman en ucuz optimizasyondur, ama bağımlılıklarının yeni sürümü desteklediğini önce testlerle doğrula.')],
    mistakes=[dict(bad='import time\nt0 = time.time()\nrapor()\nprint(time.time() - t0)', good='import time\nt0 = time.perf_counter()\nrapor()\nprint(time.perf_counter() - t0)', why='time.time duvar saatidir; saat senkronizasyonunda atlayabilir ve çözünürlüğü düşüktür. Süre ölçümü için perf_counter tekdüze ve hassastır.'),
              dict(bad='@lru_cache\ndef musteri_getir(musteri_id):\n    return db.sorgu(musteri_id)  # veri değişebilir', good='@lru_cache(maxsize=1024)\ndef ulke_kodu(ad):\n    return ULKELER[ad]  # saf, değişmeyen veri\n# değişen veri için TTL\'li önbellek ve cache_clear()', why='lru_cache süresiz ve sınırsız (maxsize=None) olabilir; değişen veriyi önbelleklemek eski bilgi döndürür, sınırsız önbellek de belleği şişirir.')])
