(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
/* ========================= 7. eszamanlilik ========================= */
  { id: 'eszamanlilik', lv: 'ileri', mod: 'Eşzamanlılık ve Performans', min: 40,
    title: 'threading, concurrent.futures ve GIL',
    sum: 'Thread ve havuz (ThreadPoolExecutor), Lock ile paylaşılan durumu koruma, queue ile üretici-tüketici, GIL\'in etkisi ve ProcessPoolExecutor kavramı; hangi iş için hangi araç.',
    goals: ['ThreadPoolExecutor ile I/O işlerini paralel çalıştırıp sonuçları toplayabilirim', 'Yarış durumunu (race condition) tanıyıp Lock ile önleyebilirim', 'queue.Queue ile üretici-tüketici kalıbı kurabilirim', 'GIL\'in thread ve process seçimini nasıl etkilediğini açıklayabilirim', 'asyncio, thread ve process arasında işe göre doğru aracı seçebilirim'],
    body: `<h2>Üç araç, üç farklı iş</h2>
<p>Anadolu Market\'in gece işi: 200 tedarikçi dosyasını indir (ağ beklemesi), her birini ayrıştır (hafif), sonra 2 milyon satırda fiyat optimizasyonu hesapla (ağır hesap). Üçü de "aynı anda daha çok iş" ister ama farklı araçlarla: ağ için thread ya da asyncio, ağır hesap için süreç (process). Bu dersin amacı doğru aracı seçmeyi ve paylaşılan veriyi güvenle korumayı öğretmek.</p>

<h2>İş parçacığı (thread) ve havuz</h2>
<p>Thread, aynı süreç içinde paralel akan bir çalışma hattıdır; belleği paylaşır. Elle <code>threading.Thread</code> başlatabilirsin ama modern kalıp <code>concurrent.futures.ThreadPoolExecutor</code>: sabit sayıda işçi, <code>submit</code> ile iş ver, <code>Future</code> ile sonucu al; ya da <code>map</code> ile liste gibi kullan.</p>
<pre class="py">import time
from concurrent.futures import ThreadPoolExecutor, as_completed

def indir(tedarikci: str) -&gt; str:
    time.sleep(0.2)                       # sahte ağ beklemesi
    return f"{tedarikci}.csv"

tedarikciler = ["Ege", "Marmara", "Karadeniz", "Akdeniz", "Anadolu", "Trakya"]

t0 = time.perf_counter()
sirali = [indir(t) for t in tedarikciler]
print(f"sıralı: {time.perf_counter() - t0:.2f} s")

t0 = time.perf_counter()
with ThreadPoolExecutor(max_workers=3) as havuz:
    sonuc = list(havuz.map(indir, tedarikciler))      # sıra korunur
print(sonuc, f"havuz(3): {time.perf_counter() - t0:.2f} s")

with ThreadPoolExecutor(max_workers=6) as havuz:
    gelecekler = {havuz.submit(indir, t): t for t in tedarikciler}
    for f in as_completed(gelecekler):                  # bitiş sırasıyla
        print("bitti:", f.result())
</pre>
<div class="tip"><b>map mi submit mi?</b><code>map</code> girdi sırasında sonuç verir ve kısa yazılır. <code>submit</code> + <code>as_completed</code> biten işi hemen işlemene, hataları tek tek yakalamana izin verir; <code>f.result()</code> işçideki istisnayı burada yeniden fırlatır.</div>

<h2>GIL: tek anda tek Python</h2>
<p>CPython\'da <b>GIL</b> (Global Interpreter Lock) aynı anda yalnızca bir thread\'in Python bytecode çalıştırmasına izin verir. Thread\'ler beklerken (ağ, disk, <code>sleep</code>) GIL\'i bırakır; o yüzden I/O işinde havuz gerçek hız sağlar. Ama saf Python hesabında iki thread sırayla çalışır, toplam süre düşmez, hatta kilit alışverişi yüzünden artabilir.</p>
<pre class="py">import time
from concurrent.futures import ThreadPoolExecutor

def hesap(n: int) -&gt; int:
    return sum(i * i for i in range(n))         # saf Python, CPU işi

N = 300_000
t0 = time.perf_counter()
[hesap(N) for _ in range(4)]
tek = time.perf_counter() - t0

t0 = time.perf_counter()
with ThreadPoolExecutor(max_workers=4) as havuz:
    list(havuz.map(hesap, [N] * 4))
coklu = time.perf_counter() - t0
print(f"sıralı {tek:.2f} s, 4 thread {coklu:.2f} s -&gt; GIL yüzünden kazanç yok")
</pre>
<div class="note"><b>Çıkış yolu</b>CPU işi için <code>ProcessPoolExecutor</code>: her işçi ayrı bir süreçtir, kendi GIL\'i vardır, çekirdekler gerçekten paralel çalışır. Bedeli: veri süreçler arasında kopyalanır (pickle), başlatma maliyeti vardır. Kullanımı ThreadPoolExecutor ile aynı arayüzdür; yalnızca sınıf adı değişir ve fonksiyon modül düzeyinde tanımlı olmalıdır. Tarayıcıdaki Python\'da süreç oluşturulamadığı için bu derste yalnızca anlatıyoruz; kendi makinende dene. Python 3.13 ile deneysel "free-threaded" yapı GIL\'siz çalışabiliyor ama henüz varsayılan değil.</div>

<h2>Yarış durumu ve Lock</h2>
<p>İki thread aynı sayacı artırırsa ne olur? <code>sayac += 1</code> aslında oku-artır-yaz üç adımdır; GIL adımların arasında thread değiştirebilir ve bir artış kaybolur. Buna <b>yarış durumu</b> (race condition) denir. Çözüm: paylaşılan veriye erişimi <code>threading.Lock</code> ile tek seferde bir thread\'e vermek.</p>
<pre class="py">import threading
from concurrent.futures import ThreadPoolExecutor

bakiye = 0
kilit = threading.Lock()

def yatir_guvensiz(n):
    global bakiye
    for _ in range(n):
        tmp = bakiye            # oku
        tmp += 1                # artır
        bakiye = tmp            # yaz  (arada başka thread girebilir)

def yatir_guvenli(n):
    global bakiye
    for _ in range(n):
        with kilit:             # kritik bölge
            bakiye += 1

for fn in (yatir_guvensiz, yatir_guvenli):
    bakiye = 0
    with ThreadPoolExecutor(max_workers=4) as havuz:
        list(havuz.map(fn, [50_000] * 4))
    print(fn.__name__, "beklenen 200000, gelen", bakiye)
</pre>
<div class="warn"><b>Kilit her yerde değil</b>Kilit tutulan süre kısa olsun; kilit içinde I/O yapma. Birden çok kilit varsa hep aynı sırada al, yoksa karşılıklı bekleme (deadlock) oluşur. Mümkünse paylaşılan durumdan kaçın: her işçi kendi sonucunu döndürsün, ana thread toplasın.</div>

<h2>queue ile üretici-tüketici</h2>
<p><code>queue.Queue</code> thread-güvenli bir kuyruktur: üreticiler <code>put</code>, tüketiciler <code>get</code> yapar, kilitle uğraşmazsın. <code>None</code> gibi bir "zehirli hap" (sentinel) ile tüketicilere bitişi bildir; <code>task_done</code>/<code>join</code> ile tüm işlerin bittiğini bekle.</p>
<pre class="py">import queue, threading, time

kuyruk: queue.Queue = queue.Queue()
islenen = []
kilit = threading.Lock()

def tuketici(ad):
    while True:
        siparis = kuyruk.get()
        if siparis is None:          # bitiş sinyali
            kuyruk.task_done()
            break
        time.sleep(0.01)             # sahte işleme
        with kilit:
            islenen.append((ad, siparis))
        kuyruk.task_done()

isciler = [threading.Thread(target=tuketici, args=(f"isci{i}",)) for i in range(3)]
for t in isciler:
    t.start()
for sid in range(1001, 1011):
    kuyruk.put(sid)
for _ in isciler:
    kuyruk.put(None)
kuyruk.join()
print("işlenen sipariş:", sorted(s for _, s in islenen))
print("işçi başına:", {ad: sum(1 for a, _ in islenen if a == ad) for ad in ("isci0", "isci1", "isci2")})
</pre>

<h2>Hangi iş için hangisi?</h2>
<div class="tbl-wrap"><table><tr><th>İş türü</th><th>Araç</th><th>Neden</th></tr>
<tr><td>Çok sayıda ağ/disk beklemesi, kütüphane async destekliyor</td><td>asyncio</td><td>Tek thread, binlerce bağlantı, düşük bellek</td></tr>
<tr><td>Ağ/disk beklemesi, kütüphane senkron (requests, sqlite)</td><td>ThreadPoolExecutor</td><td>Kodu değiştirmeden paralel; GIL beklerken bırakılır</td></tr>
<tr><td>Saf Python CPU hesabı</td><td>ProcessPoolExecutor</td><td>GIL\'i aşar, çekirdekleri kullanır</td></tr>
<tr><td>Sayısal hesap</td><td>numpy/pandas (önce bunu dene)</td><td>C döngüsü GIL\'i bırakır; çoğu zaman paralelliğe gerek kalmaz</td></tr>
<tr><td>Basit betik</td><td>Hiçbiri</td><td>Karmaşıklık maliyeti kazancı geçer</td></tr>
</table></div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>İşçi sayısı</h3>
<p>I/O işinde işçi sayısı çekirdek sayısından bağımsızdır; karşı sistemin kaldırabileceği kadar (10-50) seçilir. CPU işinde <code>os.cpu_count()</code> kadar süreç yeterlidir; fazlası bağlam değişimine harcanır. ThreadPoolExecutor\'ın varsayılanı <code>min(32, cpu_count + 4)</code>\'tür.</p>
<h3>Hata ve zaman aşımı</h3>
<p><code>future.result(timeout=5)</code> bekleme süresini sınırlar; <code>concurrent.futures.wait(..., return_when=FIRST_EXCEPTION)</code> ilk hatada durmanı sağlar. Thread içindeki yakalanmamış istisna kaybolmaz, <code>result()</code> çağrısında yeniden fırlatılır; ama <code>threading.Thread</code> ile elle başlattığın thread\'de yalnızca stderr\'e yazılır, bu yüzden havuz tercih edilir.</p>
<h3>asyncio ile köprü</h3>
<p>Async kodda senkron bir kütüphane çağırman gerekiyorsa <code>await asyncio.to_thread(func)</code> arka planda bir ThreadPoolExecutor kullanır. Tersine, senkron koddan async kütüphane çağırmak için ayrı bir thread\'de olay döngüsü çalıştırılır. İki dünya birbirini dışlamaz; sınırı bilinçli çiz.</p>
</section>`,
    ex: [
      { t: 'code', id: 'eszamanlilik-1',
        q: '<p><code>paralel_indir(tedarikciler, isci)</code> fonksiyonu <code>ThreadPoolExecutor(max_workers=isci)</code> ile her tedarikçi için <code>indir</code> fonksiyonunu çalıştırsın (indir verilmiştir; 0.1 s bekler ve <code>"ad.csv"</code> döndürür) ve sonuçları <b>girdi sırasında</b> liste olarak döndürsün. Testler sürenin sıralı çalışmadan kısa olduğunu kontrol eder.</p>',
        start: 'import time\nfrom concurrent.futures import ThreadPoolExecutor\n\ndef indir(tedarikci):\n    time.sleep(0.1)\n    return f"{tedarikci}.csv"\n\ndef paralel_indir(tedarikciler, isci):\n    pass\n',
        sol: 'import time\nfrom concurrent.futures import ThreadPoolExecutor\n\ndef indir(tedarikci):\n    time.sleep(0.1)\n    return f"{tedarikci}.csv"\n\ndef paralel_indir(tedarikciler, isci):\n    with ThreadPoolExecutor(max_workers=isci) as havuz:\n        return list(havuz.map(indir, tedarikciler))\n',
        tests: 'import time\nt0 = time.perf_counter()\nr = paralel_indir(["Ege", "Marmara", "Karadeniz", "Akdeniz", "Anadolu", "Trakya"], 6)\nsure = time.perf_counter() - t0\nassert r == ["Ege.csv", "Marmara.csv", "Karadeniz.csv", "Akdeniz.csv", "Anadolu.csv", "Trakya.csv"], "Sonuçlar girdi sırasında olmalı"\nassert sure < 0.45, f"6 işçiyle 6 indirme ~0.1 s sürmeli, ölçülen {sure:.2f}"\nassert paralel_indir([], 2) == [], "Boş girdi boş liste"\n',
        hints: ['with ThreadPoolExecutor(max_workers=isci) as havuz:', 'havuz.map(indir, tedarikciler) sırayı korur; list() ile topla.'],
        why: 'map, submit+result döngüsünün kısa hâlidir ve sırayı korur. Havuz with bloğundan çıkarken tüm işlerin bitmesini bekler.' },
      { t: 'code', id: 'eszamanlilik-2',
        q: '<p><code>Hesap</code> sınıfı: <code>bakiye</code> özniteliği 0 ile başlasın; <code>yatir(miktar)</code> metodu bakiyeyi artırsın ve bu artış <code>threading.Lock</code> ile korunsun. Ardından <code>stres(hesap, thread_sayisi, tekrar)</code> fonksiyonu <code>ThreadPoolExecutor</code> ile her biri <code>tekrar</code> kez <code>yatir(1)</code> çağıran <code>thread_sayisi</code> iş başlatsın ve son bakiyeyi döndürsün.</p>',
        start: 'import threading\nfrom concurrent.futures import ThreadPoolExecutor\n\nclass Hesap:\n    def __init__(self):\n        self.bakiye = 0\n        self._kilit = threading.Lock()\n\n    def yatir(self, miktar):\n        pass\n\ndef stres(hesap, thread_sayisi, tekrar):\n    pass\n',
        sol: 'import threading\nfrom concurrent.futures import ThreadPoolExecutor\n\nclass Hesap:\n    def __init__(self):\n        self.bakiye = 0\n        self._kilit = threading.Lock()\n\n    def yatir(self, miktar):\n        with self._kilit:\n            yeni = self.bakiye + miktar\n            self.bakiye = yeni\n\ndef stres(hesap, thread_sayisi, tekrar):\n    def is_yap(_):\n        for _ in range(tekrar):\n            hesap.yatir(1)\n    with ThreadPoolExecutor(max_workers=thread_sayisi) as havuz:\n        list(havuz.map(is_yap, range(thread_sayisi)))\n    return hesap.bakiye\n',
        tests: 'import threading\nh = Hesap()\nassert stres(h, 4, 20000) == 80000, "4 thread x 20000 yatırma = 80000 olmalı (Lock ile)"\nassert isinstance(h._kilit, type(threading.Lock())), "_kilit bir Lock olmalı"\nh2 = Hesap()\nh2.yatir(50)\nassert h2.bakiye == 50, "yatir tek çağrıda bakiyeyi artırmalı"\n',
        hints: ['yatir içinde with self._kilit: bloğunda bakiyeyi güncelle.', 'stres: iç fonksiyon tekrar kez yatir(1) çağırsın; havuz.map ile thread_sayisi kez çalıştır.'],
        why: 'Kritik bölge (oku-artır-yaz) kilitle korunursa thread sayısı ne olursa olsun toplam doğru çıkar. Kilidi nesnenin içinde tutmak kapsüllemeyi korur.' },
      { t: 'code', id: 'eszamanlilik-3',
        q: '<p><code>uretici_tuketici(siparisler, isci_sayisi)</code> fonksiyonu: bir <code>queue.Queue</code> oluştursun, <code>isci_sayisi</code> kadar tüketici thread başlatsın; her tüketici kuyruktan sipariş alıp <code>siparis * 2</code> değerini thread-güvenli biçimde bir sonuç listesine eklesin; <code>None</code> gelince dursun. Üretici tüm siparişleri ve ardından her işçiye bir <code>None</code> koysun. Fonksiyon sonuçları <b>artan sıralı</b> liste olarak döndürsün.</p>',
        start: 'import queue, threading\n\ndef uretici_tuketici(siparisler, isci_sayisi):\n    kuyruk = queue.Queue()\n    sonuc = []\n    kilit = threading.Lock()\n    pass\n',
        sol: 'import queue, threading\n\ndef uretici_tuketici(siparisler, isci_sayisi):\n    kuyruk = queue.Queue()\n    sonuc = []\n    kilit = threading.Lock()\n\n    def tuketici():\n        while True:\n            s = kuyruk.get()\n            if s is None:\n                break\n            with kilit:\n                sonuc.append(s * 2)\n\n    isciler = [threading.Thread(target=tuketici) for _ in range(isci_sayisi)]\n    for t in isciler:\n        t.start()\n    for s in siparisler:\n        kuyruk.put(s)\n    for _ in isciler:\n        kuyruk.put(None)\n    for t in isciler:\n        t.join()\n    return sorted(sonuc)\n',
        tests: 'r = uretici_tuketici(list(range(1, 51)), 3)\nassert r == [i * 2 for i in range(1, 51)], "Her sipariş bir kez işlenip 2 ile çarpılmalı"\nassert uretici_tuketici([], 2) == [], "Boş girdi boş sonuç"\nassert uretici_tuketici([7], 4) == [14], "Tek eleman 4 işçiyle de çalışmalı"\n',
        hints: ['Tüketici: while True: s = kuyruk.get(); None ise break.', 'Üretici put\'ları bitince her işçi için bir None koy, sonra t.join() ile bekle.'],
        why: 'Kuyruk üretici ile tüketiciyi ayırır; sentinel her işçiyi temiz kapatır; join tüm iş bitene kadar bekler. Sonuç listesine ekleme kilitle korunur.' },
      { t: 'mc', q: 'Saf Python ile 4 büyük matrisin determinantını hesaplıyorsun ve 4 thread kullandın; süre düşmedi. En doğru açıklama?',
        o: ['Thread sayısı az', 'GIL aynı anda tek thread\'in Python kodu çalıştırmasına izin veriyor', 'ThreadPoolExecutor yalnızca map ile hızlanır', 'Matris boyutu küçük'], a: 1,
        why: 'CPU-yoğun saf Python kodunda GIL thread\'leri sırayla çalıştırır. Çözüm ProcessPoolExecutor ya da numpy gibi GIL\'i bırakan C kütüphaneleridir.' },
      { t: 'mc', q: 'Senkron <code>requests</code> kütüphanesiyle 300 URL\'yi çekmek istiyorsun. En az kod değişikliğiyle hızlanma hangi araçla gelir?',
        o: ['asyncio ile await requests.get', 'ProcessPoolExecutor', 'ThreadPoolExecutor', 'multiprocessing.Pool'], a: 2,
        why: 'requests senkron ve I/O ağırlıklı; thread havuzu beklerken GIL\'i bırakır, kod aynen kalır. asyncio için async bir kütüphane (httpx) gerekir; süreçler bu iş için ağırdır.' },
      { t: 'code', id: 'eszamanlilik-4',
        q: '<p><code>toplu_sorgu(idler, sorgu, isci)</code> fonksiyonu <code>submit</code> ve <code>as_completed</code> kullanarak her id için <code>sorgu(id)</code> çağırsın. <code>sorgu</code> bazı id\'ler için istisna fırlatabilir: hata verenleri atlayıp başarılı sonuçları <code>{id: sonuc}</code> sözlüğü ve hata veren id\'leri <b>sıralı liste</b> olarak döndür: <code>(sonuclar, hatalilar)</code>.</p>',
        start: 'from concurrent.futures import ThreadPoolExecutor, as_completed\n\ndef toplu_sorgu(idler, sorgu, isci):\n    pass\n',
        sol: 'from concurrent.futures import ThreadPoolExecutor, as_completed\n\ndef toplu_sorgu(idler, sorgu, isci):\n    sonuclar, hatalilar = {}, []\n    with ThreadPoolExecutor(max_workers=isci) as havuz:\n        gelecekler = {havuz.submit(sorgu, i): i for i in idler}\n        for f in as_completed(gelecekler):\n            i = gelecekler[f]\n            try:\n                sonuclar[i] = f.result()\n            except Exception:\n                hatalilar.append(i)\n    return sonuclar, sorted(hatalilar)\n',
        tests: 'import time\ndef sorgu(i):\n    time.sleep(0.01)\n    if i % 4 == 0:\n        raise ValueError("servis hatası")\n    return i * 10\ns, h = toplu_sorgu(list(range(1, 11)), sorgu, 4)\nassert h == [4, 8], "4 ve 8 hata vermeli"\nassert s == {1: 10, 2: 20, 3: 30, 5: 50, 6: 60, 7: 70, 9: 90, 10: 100}, "Başarılı sonuçlar id*10"\n',
        hints: ['gelecekler = {havuz.submit(sorgu, i): i for i in idler} ile Future → id eşlemesi tut.', 'as_completed içinde f.result() try/except ile sar; hata veren id\'yi listeye ekle.'],
        why: 'result() işçideki istisnayı ana thread\'de yeniden fırlatır; böylece hatalar tek tek ele alınır ve bir hata tüm partiyi düşürmez.' }
    ],
    faq: [
      { q: 'Thread mi asyncio mu?', a: 'Kütüphanen async destekliyorsa ve bağlantı sayısı çoksa asyncio; senkron kütüphaneyle ya da az sayıda paralel işte thread daha az kod değişikliği ister. İkisi de CPU işini hızlandırmaz.' },
      { q: 'Lock yerine ne kullanabilirim?', a: 'Paylaşılan durumu hiç oluşturmamak en iyisi: her işçi sonucunu döndürsün, ana thread birleştirsin. Gerekiyorsa queue.Queue thread-güvenlidir; sayaç için threading.Lock, okuma-yazma ağırlıklı yapılarda RLock ya da Condition.' },
      { q: 'ProcessPoolExecutor\'da fonksiyonum "can\'t pickle" hatası verdi.', a: 'Süreçlere gönderilen fonksiyon ve veriler pickle\'lanabilir olmalı: fonksiyon modül düzeyinde tanımlı olmalı (lambda ya da iç fonksiyon olmaz), argümanlar basit veri olmalı.' }
    ],
    mistakes: [
      { bad: 'with ThreadPoolExecutor() as havuz:\n    for i in idler:\n        havuz.submit(sorgu, i).result()', good: 'with ThreadPoolExecutor() as havuz:\n    gelecekler = [havuz.submit(sorgu, i) for i in idler]\n    sonuc = [f.result() for f in gelecekler]', why: 'Her submit\'in hemen ardından result beklemek işleri sıraya sokar; önce hepsini gönder, sonra topla.' },
      { bad: 'sayac += 1   # birden çok thread\'den', good: 'with kilit:\n    sayac += 1', why: 'Artırma atomik değildir; kilitsiz güncelleme artışları kaybeder.' },
      { bad: 't = threading.Thread(target=isle)\nt.start()\nprint(sonuc)  # t bitmeden', good: 't = threading.Thread(target=isle)\nt.start()\nt.join()\nprint(sonuc)', why: 'join olmadan ana akış thread\'i beklemez; sonuç henüz hazır olmayabilir.' },
      { bad: 'with ProcessPoolExecutor() as p:\n    p.map(lambda x: x * 2, veri)', good: 'def ikiyle_carp(x):\n    return x * 2\n\nwith ProcessPoolExecutor() as p:\n    p.map(ikiyle_carp, veri)', why: 'Süreçler fonksiyonu pickle ile taşır; lambda pickle\'lanamaz. Modül düzeyinde adlı fonksiyon gerekir.' }
    ]
  },

  /* ========================= 8. performans ========================= */
  { id: 'performans', lv: 'ileri', mod: 'Eşzamanlılık ve Performans', min: 40, needs: ['numpy'],
    title: 'Profil ve optimizasyon',
    sum: 'timeit ve cProfile ile ölçme, Big-O sezgisi, set/dict ile sabit zamanlı arama, string birleştirme, üreteçle bellek, lru_cache ve numpy\'a geçiş.',
    goals: ['timeit ve cProfile ile darboğazı ölçerek bulabilirim', 'Big-O ile algoritmanın ölçeklenmesini tahmin edebilirim', 'Doğru veri yapısıyla (set/dict) aramayı hızlandırabilirim', 'Üreteç ve lru_cache ile bellek ve zaman kazanabilirim', 'Ne zaman numpy\'a geçmem gerektiğini bilirim'],
    body: `<h2>Önce ölç, sonra düzelt</h2>
<p>Anadolu Bank\'ın gece raporu 40 dakika sürüyor ve ekip "Python yavaş" diyor. Çoğu zaman yavaş olan Python değil, bir listede milyon kez <code>in</code> aramak ya da döngüde string biriktirmektir. Optimizasyonun ilk kuralı: <b>tahmin etme, ölç</b>. İkinci kuralı: en çok zaman geçen yüzde 5\'lik kodu düzelt, gerisine dokunma.</p>

<h2>timeit: küçük parçayı ölç</h2>
<p><code>timeit</code> bir ifadeyi çok kez çalıştırıp toplam süreyi verir; çöp toplayıcıyı kapatır, en küçük gürültüyle ölçer. İki alternatifi karşılaştırmak için idealdir.</p>
<pre class="py">import timeit

musteriler = list(range(50_000))
kume = set(musteriler)
aranan = [49_999, 25_000, -1, 10]

t_liste = timeit.timeit(lambda: [x in musteriler for x in aranan], number=50)
t_kume = timeit.timeit(lambda: [x in kume for x in aranan], number=50)
print(f"liste in: {t_liste:.4f} s   set in: {t_kume:.6f} s")
print(f"set yaklaşık {t_liste / t_kume:.0f} kat hızlı")
</pre>

<h2>cProfile: büyük programda nerede?</h2>
<p>Bütün betikte hangi fonksiyonun süre yediğini <code>cProfile</code> gösterir. Bellek içinde çalıştırıp <code>pstats</code> ile en pahalı birkaç fonksiyonu sıralarsın. <code>tottime</code> fonksiyonun kendi süresi, <code>cumtime</code> çağırdıklarıyla birlikte toplam.</p>
<pre class="py">import cProfile, pstats, io

def musteri_bul(musteri_id, liste):
    return musteri_id in liste                  # O(n)

def rapor(n):
    liste = list(range(n))
    bulunan = 0
    for i in range(0, n, 7):
        if musteri_bul(i, liste):
            bulunan += 1
    return bulunan

pr = cProfile.Profile()
pr.enable()
rapor(20_000)
pr.disable()

cikti = io.StringIO()
pstats.Stats(pr, stream=cikti).sort_stats("cumulative").print_stats(4)
satirlar = [s for s in cikti.getvalue().splitlines() if "musteri_bul" in s or "rapor" in s]
print("\n".join(satirlar))
</pre>
<p>Çıktıda <code>musteri_bul</code> binlerce kez çağrılıyor ve toplam sürenin neredeyse tamamını alıyor. Düzeltme fonksiyonu hızlandırmak değil, <b>veri yapısını değiştirmek</b>: listeyi bir kez set\'e çevir.</p>

<h2>Big-O sezgisi</h2>
<p>Big-O, girdi n büyüyünce sürenin nasıl büyüdüğünü söyler. Sabitleri değil eğilimi önemser; 10 bin satırda fark etmeyen şey 10 milyonda saatlere dönüşür.</p>
<div class="tbl-wrap"><table><tr><th>İşlem</th><th>Karmaşıklık</th><th>Örnek</th></tr>
<tr><td><code>x in set</code>, <code>d[k]</code>, <code>lst[i]</code>, <code>lst.append</code></td><td>O(1)</td><td>Hash ile sabit zaman</td></tr>
<tr><td><code>x in list</code>, <code>lst.index</code>, <code>min/max/sum</code></td><td>O(n)</td><td>Baştan sona tarar</td></tr>
<tr><td><code>lst.insert(0, x)</code>, <code>lst.pop(0)</code></td><td>O(n)</td><td>Her elemanı kaydırır (deque kullan)</td></tr>
<tr><td><code>sorted</code>, <code>lst.sort</code></td><td>O(n log n)</td><td>Timsort</td></tr>
<tr><td>İç içe iki döngü (her sipariş × her müşteri)</td><td>O(n·m)</td><td>Sözlükle O(n+m)\'e iner</td></tr>
<tr><td>Sıralı listede <code>bisect</code></td><td>O(log n)</td><td>İkili arama</td></tr>
</table></div>
<pre class="py">import timeit

siparisler = [(i, i % 1000) for i in range(20_000)]          # (siparis, musteri_id)
musteriler = [(m, f"Müşteri{m}") for m in range(1000)]

def birlestir_yavas():                     # O(n·m)
    return [(s, ad) for s, m in siparisler for mid, ad in musteriler if mid == m]

def birlestir_hizli():                     # O(n+m)
    ad = dict(musteriler)
    return [(s, ad[m]) for s, m in siparisler]

assert birlestir_yavas()[:3] == birlestir_hizli()[:3]
print(f"yavaş: {timeit.timeit(birlestir_yavas, number=1):.3f} s")
print(f"hızlı: {timeit.timeit(birlestir_hizli, number=1):.4f} s")
</pre>

<h2>Sık kazanımlar</h2>
<h3>String birleştirme</h3>
<p>Döngüde <code>s += parça</code> her seferinde yeni string üretir. Parçaları listede biriktirip <code>"".join(...)</code> ya da f-string kullan.</p>
<h3>Üreteçle bellek</h3>
<p><code>[f(x) for x in range(10**7)]</code> tüm listeyi belleğe koyar; <code>(f(x) for x in ...)</code> ya da <code>yield</code> tek seferde bir eleman üretir. <code>sum</code>, <code>max</code>, <code>any</code> gibi tüketiciler üreteçle çalışır. Büyük dosyayı satır satır okumak da aynı ilkedir.</p>
<h3>lru_cache</h3>
<p>Aynı girdiyle tekrar tekrar çağrılan saf (yan etkisiz) fonksiyonu <code>functools.lru_cache</code> ile ezberle. Özyinelemeli hesaplar ve pahalı sorgular için çarpıcıdır.</p>
<pre class="py">import timeit, sys
from functools import lru_cache

def birlestir_arti(n):
    s = ""
    for i in range(n):
        s += f"{i},"
    return s

def birlestir_join(n):
    return ",".join(str(i) for i in range(n)) + ","

assert birlestir_arti(100) == birlestir_join(100)
print(f"+=: {timeit.timeit(lambda: birlestir_arti(20_000), number=5):.3f} s  "
      f"join: {timeit.timeit(lambda: birlestir_join(20_000), number=5):.3f} s")

liste = [x * x for x in range(100_000)]
uretec = (x * x for x in range(100_000))
print("liste:", sys.getsizeof(liste), "bayt | üreteç:", sys.getsizeof(uretec), "bayt")

@lru_cache(maxsize=None)
def taksit_katsayi(ay: int) -&gt; float:
    return 1.0 if ay == 0 else taksit_katsayi(ay - 1) * 1.02

t0 = timeit.default_timer()
print(round(taksit_katsayi(400), 4), f"{timeit.default_timer() - t0:.5f} s")
print(taksit_katsayi.cache_info())
</pre>

<h2>numpy\'a geçiş</h2>
<p>Sayısal bir döngüyü ne kadar iyileştirsen de yorumlayıcı maliyeti kalır. Veri tek tip sayı ve işlem eleman eleman ise numpy\'a geç: döngü C\'de döner, bellek yan yana olur. Kural: "for ile milyon sayı" gördüğünde numpy/pandas düşün.</p>
<pre class="py">import timeit, numpy as np

tutarlar = [float(i % 500) for i in range(300_000)]
dizi = np.array(tutarlar)

def kdv_python():
    return sum(t * 1.2 for t in tutarlar if t &gt; 100)

def kdv_numpy():
    return float((dizi[dizi &gt; 100] * 1.2).sum())

assert abs(kdv_python() - kdv_numpy()) &lt; 1e-3
print(f"python: {timeit.timeit(kdv_python, number=3):.3f} s  numpy: {timeit.timeit(kdv_numpy, number=3):.4f} s")
</pre>
<div class="warn"><b>Erken optimizasyon</b>Okunur kodu "belki hızlanır" diye bozma. Önce doğru çalışan kod, sonra ölçüm, sonra yalnızca ölçümün gösterdiği yer. Çoğu rapor için sorun bir tane O(n·m) döngüdür.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Optimizasyon sırası</h3>
<div class="steps-list"><ol>
<li>Ölç: cProfile ile en pahalı fonksiyonları bul, timeit ile alternatifi doğrula.</li>
<li>Algoritma ve veri yapısı: O(n²)\'yi O(n)\'e indir; list → set/dict, pop(0) → deque, sıralı arama → bisect.</li>
<li>Python düzeyi: üreteç, join, lru_cache, yerel değişken, gereksiz kopyadan kaçınma.</li>
<li>Kütüphaneye devret: numpy/pandas, sqlite/veritabanı sorgusu, yerleşik fonksiyonlar (sum, sorted) C\'de çalışır.</li>
<li>Paralellik: I/O için thread/asyncio, CPU için süreçler. En son adım, çünkü karmaşıklık getirir.</li>
</ol></div>
<h3>Bellek de ölçülür</h3>
<p><code>tracemalloc</code> hangi satırın ne kadar bellek ayırdığını gösterir; <code>sys.getsizeof</code> tek nesnenin boyutudur (içindekileri saymaz). Büyük veri için pandas\'ta küçük dtype ve category, saf Python\'da <code>__slots__</code> ve üreteç.</p>
<h3>Ölçüm hataları</h3>
<p>İlk çalıştırma önbellek yüzünden yavaştır; <code>number</code> ve <code>repeat</code> ile birkaç kez ölç, en küçüğü al. Dizüstünde pil modu, arka plan işleri ölçümü oynatır; karşılaştırmayı aynı oturumda ve arka arkaya yap.</p>
</section>`,
    ex: [
      { t: 'code', id: 'performans-1',
        q: '<p><code>kara_listede(islemler, kara_liste)</code> fonksiyonu, işlem listesindeki <code>(islem_id, musteri_id)</code> çiftlerinden müşterisi kara listede olanların <code>islem_id</code>\'lerini döndürsün. <code>kara_liste</code> büyük bir liste olarak gelir; aramayı O(1) yapmak için önce <code>set</code>\'e çevir. Test, 200 bin işlemle kısa sürede bitmesini bekler.</p>',
        start: 'def kara_listede(islemler, kara_liste):\n    pass\n',
        sol: 'def kara_listede(islemler, kara_liste):\n    kume = set(kara_liste)\n    return [iid for iid, mid in islemler if mid in kume]\n',
        tests: 'import time\nislemler = [(i, i % 5000) for i in range(200_000)]\nkara = list(range(0, 5000, 100))\nt0 = time.perf_counter()\nr = kara_listede(islemler, kara)\nsure = time.perf_counter() - t0\nassert len(r) == 200_000 // 100, "Her 100 müşteriden biri kara listede: 2000 işlem"\nassert r[:3] == [0, 100, 200], "İlk işlemler 0, 100, 200 olmalı"\nassert sure < 1.0, f"Çok yavaş ({sure:.2f} s): set kullan"\nassert kara_listede([(1, 9)], []) == [], "Boş kara liste boş sonuç"\n',
        hints: ['kume = set(kara_liste) bir kez; sonra mid in kume.', 'Liste comprehension ile islem_id topla.'],
        why: 'Listede in O(n), set\'te O(1). 200 bin işlem × 50 elemanlı liste bile yavaştır; set ile dönüşüm maliyeti bir kez ödenir.' },
      { t: 'code', id: 'performans-2',
        q: '<p><code>rapor_satiri(kayitlar)</code> fonksiyonu <code>(ad, tutar)</code> demetlerinden <code>"ad:tutar"</code> parçalarını <code>;</code> ile birleştirip tek string döndürsün. Döngüde <code>+=</code> kullanma; <code>join</code> ile yaz. <code>sayi_karesi_toplami(n)</code> fonksiyonu ise 0..n-1 karelerinin toplamını <b>liste oluşturmadan</b> (üreteç ifadesiyle) hesaplasın.</p>',
        start: 'def rapor_satiri(kayitlar):\n    pass\n\ndef sayi_karesi_toplami(n):\n    pass\n',
        sol: 'def rapor_satiri(kayitlar):\n    return ";".join(f"{ad}:{tutar}" for ad, tutar in kayitlar)\n\ndef sayi_karesi_toplami(n):\n    return sum(i * i for i in range(n))\n',
        tests: 'import time\nassert rapor_satiri([("Ayşe", 120), ("Ali", 45.5)]) == "Ayşe:120;Ali:45.5", "Biçim ad:tutar;ad:tutar"\nassert rapor_satiri([]) == "", "Boş girdi boş string"\nassert sayi_karesi_toplami(4) == 14, "0+1+4+9 = 14"\nt0 = time.perf_counter()\nassert sayi_karesi_toplami(1_000_000) == 333332833333500000, "n=1e6 sonucu yanlış"\nassert time.perf_counter() - t0 < 2.0, "Çok yavaş"\nsrc = __source__.split("def sayi_karesi_toplami")[-1]\nassert "[" not in src.split("return")[-1], "Liste yerine üreteç ifadesi kullan (köşeli parantez olmasın)"\n',
        hints: ['";".join(f"{ad}:{tutar}" for ad, tutar in kayitlar).', 'sum(i * i for i in range(n)) — köşeli parantez yok, üreteç.'],
        why: 'join parçaları tek seferde birleştirir; üreteç ifadesi ara liste oluşturmadan sum\'a eleman akıtır, bellek sabit kalır.' },
      { t: 'code', id: 'performans-3',
        q: '<p><code>kredi_katsayi(ay)</code> fonksiyonu özyinelemeli tanımlansın: <code>ay == 0</code> için 1.0, aksi hâlde <code>kredi_katsayi(ay - 1) * 1.015</code>. Fonksiyonu <code>functools.lru_cache</code> ile süsle. Ayrıca <code>cagri_sayisi</code> adlı modül düzeyi sayacı her gerçek (önbelleksiz) çalışmada artır; testler önbelleğin çalıştığını bu sayaçla kontrol eder.</p>',
        start: 'from functools import lru_cache\n\ncagri_sayisi = 0\n\ndef kredi_katsayi(ay):\n    pass\n',
        sol: 'from functools import lru_cache\n\ncagri_sayisi = 0\n\n@lru_cache(maxsize=None)\ndef kredi_katsayi(ay):\n    global cagri_sayisi\n    cagri_sayisi += 1\n    if ay == 0:\n        return 1.0\n    return kredi_katsayi(ay - 1) * 1.015\n',
        tests: 'assert abs(kredi_katsayi(12) - 1.015 ** 12) < 1e-9, "12 ay için 1.015^12"\nn1 = cagri_sayisi\nassert n1 == 13, f"İlk hesapta 0..12 için 13 gerçek çağrı olmalı, oldu {n1}"\nkredi_katsayi(12)\nkredi_katsayi(5)\nassert cagri_sayisi == 13, "Önbellekten dönmeli, sayaç artmamalı"\nkredi_katsayi(15)\nassert cagri_sayisi == 16, "13,14,15 için 3 yeni çağrı"\nassert hasattr(kredi_katsayi, "cache_info"), "lru_cache ile süslenmeli"\n',
        hints: ['@lru_cache(maxsize=None) dekoratörünü fonksiyonun üstüne koy.', 'global cagri_sayisi; her gövde çalışmasında +1.'],
        why: 'lru_cache aynı argümanla ikinci çağrıda gövdeyi hiç çalıştırmaz; özyinelemede ara sonuçlar da ezberlendiği için 15 istenince yalnızca 13-15 hesaplanır.' },
      { t: 'mc', q: 'Bir fonksiyon 50 bin siparişin her biri için 2 bin müşterilik listede <code>in</code> ile arama yapıyor. Bu kodun karmaşıklığı ve en etkili düzeltme hangisi?',
        o: ['O(n log n); listeyi sırala', 'O(n·m); müşteri listesini set/dict yap', 'O(n); thread ekle', 'O(1); zaten hızlı'], a: 1,
        why: 'İç içe tarama O(n·m)\'dir. Set/dict ile arama O(1) olur ve toplam O(n+m)\'e iner. Thread CPU işinde GIL yüzünden yardımcı olmaz.' },
      { t: 'mc', q: 'cProfile çıktısında bir fonksiyonun <code>tottime</code> değeri küçük ama <code>cumtime</code> değeri çok büyük. Bu ne anlama gelir?',
        o: ['Fonksiyonun kendisi yavaş', 'Zaman çağırdığı alt fonksiyonlarda geçiyor', 'Profil hatalı', 'Fonksiyon hiç çağrılmamış'], a: 1,
        why: 'tottime fonksiyonun kendi gövdesinde geçen süre, cumtime alt çağrılar dahil toplamdır. Fark büyükse darboğaz çağırdığı fonksiyonlardadır.' },
      { t: 'code', id: 'performans-4',
        q: '<p><code>hizli_kdv(tutarlar, esik)</code> fonksiyonu numpy kullanarak tutar listesinden <code>esik</code>\'ten büyük olanların 1.2 ile çarpılmış toplamını <code>float</code> olarak döndürsün (döngü yok). Test 300 bin elemanla hızı kontrol eder.</p>',
        start: 'import numpy as np\n\ndef hizli_kdv(tutarlar, esik):\n    pass\n',
        sol: 'import numpy as np\n\ndef hizli_kdv(tutarlar, esik):\n    d = np.asarray(tutarlar, dtype=float)\n    return float((d[d > esik] * 1.2).sum())\n',
        tests: 'import time\nassert abs(hizli_kdv([50, 150, 300], 100) - 540.0) < 1e-9, "(150+300)*1.2 = 540"\nassert hizli_kdv([10, 20], 100) == 0.0, "Eşik üstü yoksa 0.0"\nveri = [float(i % 500) for i in range(300_000)]\nbeklenen = sum(t * 1.2 for t in veri if t > 100)\nt0 = time.perf_counter()\nr = hizli_kdv(veri, 100)\nassert abs(r - beklenen) < 1e-3, "Toplam saf Python ile aynı olmalı"\nassert isinstance(r, float), "float dönmeli"\n',
        hints: ['np.asarray(tutarlar, dtype=float) sonra maske d > esik.', 'float((d[maske] * 1.2).sum()).'],
        why: 'Maske + vektör çarpımı + sum tek C döngüsünde biter. Liste → dizi dönüşümü bir maliyettir; veri zaten numpy/pandas ise o da yoktur.' }
    ],
    faq: [
      { q: 'time.time ile timeit arasındaki fark ne?', a: 'time.time duvar saatidir, tek ölçüm gürültülüdür. timeit perf_counter kullanır, çöp toplayıcıyı kapatır, ifadeyi çok kez tekrarlar; mikro karşılaştırmada güvenilirdir.' },
      { q: 'lru_cache her fonksiyona konabilir mi?', a: 'Yalnızca saf fonksiyonlara: aynı girdi aynı çıktı, yan etki yok. Argümanlar hashlenebilir olmalı (liste olmaz, demet olur). Değişen dış veriye bağlı fonksiyonda eski sonuç döner.' },
      { q: 'Kodum hâlâ yavaş, Python\'ı mı bırakmalıyım?', a: 'Önce profil ve veri yapısı, sonra numpy/pandas ya da veritabanı sorgusu. Gerçekten CPU-yoğun kalan dar bir çekirdek varsa Cython, numba ya da Rust eklentisi; tüm projeyi taşımak nadiren gerekir.' }
    ],
    mistakes: [
      { bad: 'for m in musteriler:\n    if m in kara_liste_listesi: ...', good: 'kara = set(kara_liste_listesi)\nfor m in musteriler:\n    if m in kara: ...', why: 'Listede arama her seferinde taramadır; set hash ile sabit zamanda bulur.' },
      { bad: 'metin = ""\nfor p in parcalar:\n    metin += p', good: 'metin = "".join(parcalar)', why: 'Her += yeni string kopyalar; join tek seferde ayırır.' },
      { bad: 'kuyruk = []\n...\nkuyruk.pop(0)', good: 'from collections import deque\nkuyruk = deque()\n...\nkuyruk.popleft()', why: 'list.pop(0) tüm elemanları kaydırır (O(n)); deque iki uçta O(1) çalışır.' },
      { bad: 'toplam = sum([x * x for x in range(10**7)])', good: 'toplam = sum(x * x for x in range(10**7))', why: 'Köşeli parantez önce 10 milyonluk liste kurar; üreteç ifadesi elemanları akıtır, bellek sabit kalır.' }
    ]
  },

  /* ========================= 9. bellek-ic-yapi ========================= */
  { id: 'bellek-ic-yapi', lv: 'ileri', mod: 'Eşzamanlılık ve Performans', min: 40,
    title: 'Python\'ın iç yapısı: nesne, referans, bellek',
    sum: 'Her şey nesne; id/is ve ==, referans sayımı ve gc, değişebilirlik ve copy/deepcopy, interning, __slots__, sys.getsizeof ve dis ile bytecode.',
    goals: ['Değişkenin nesneye referans olduğunu id/is ile gösterebilirim', 'Referans sayımı ve çöp toplayıcının ne zaman devreye girdiğini açıklayabilirim', 'Sığ ve derin kopya farkını bilip doğru olanı seçebilirim', 'Interning ve is tuzağını tanırım', '__slots__ ve getsizeof ile bellek kullanımını küçültüp ölçebilirim'],
    body: `<h2>Neden iç yapı?</h2>
<p>Anadolu Bank\'ta bir geliştirici müşteri listesini "kopyalayıp" değiştirdi; asıl liste de değişti ve yanlış hesaplara SMS gitti. Başka biri <code>if durum is "aktif"</code> yazdı, bazen çalıştı bazen çalışmadı. Üçüncüsü 10 milyon küçük nesneyle belleği doldurdu. Üçü de Python\'ın nesne modelini bilmemekten kaynaklanır. Bu ders, günlük hatalara yol açan iç mekanizmaları gösterir.</p>

<h2>Her şey nesne, değişken bir etiket</h2>
<p>Python\'da <code>a = [1, 2]</code> demek, bellekte bir liste nesnesi yaratıp <code>a</code> adını ona bağlamaktır. <code>b = a</code> ikinci bir ad bağlar, yeni nesne yaratmaz. <code>id()</code> nesnenin kimliğini (CPython\'da adresi) verir; <code>is</code> "aynı nesne mi", <code>==</code> "aynı değer mi" sorar.</p>
<pre class="py">a = [1, 2, 3]
b = a                 # aynı nesneye ikinci etiket
c = [1, 2, 3]         # ayrı nesne, aynı değer
print(a is b, a is c, a == c)
print(id(a) == id(b), id(a) == id(c))

b.append(4)
print(a)              # a da değişti; çünkü aynı nesne

def ekle(lst):
    lst.append(99)    # çağıranın listesi değişir
ekle(a)
print(a)
</pre>
<div class="note"><b>Çağrı modeli</b>Python "nesne referansıyla çağırır": fonksiyona nesnenin adresi gider. Değişebilir (mutable) nesneyi içeride değiştirirsen dışarısı etkilenir; değişmez (immutable) nesneye yeniden atama yaparsan yalnızca yerel ad değişir.</div>

<h2>Değişebilirlik ve kopya</h2>
<p>int, float, str, tuple, frozenset değişmezdir; list, dict, set ve kendi sınıfların değişebilir. Bağımsız bir liste istiyorsan kopyala: <code>lst.copy()</code>, <code>lst[:]</code>, <code>list(lst)</code> <b>sığ kopya</b> (shallow) verir: dış kap yeni, içindeki nesneler aynı. İç içe yapıda <code>copy.deepcopy</code> gerekir.</p>
<pre class="py">import copy

musteri = {"ad": "Ayşe", "hesaplar": [1500.0, 320.0]}
sig = musteri.copy()
derin = copy.deepcopy(musteri)

sig["ad"] = "Ayşe K."            # dış sözlük bağımsız
sig["hesaplar"].append(50.0)     # iç liste paylaşılıyor!
print(musteri["ad"], musteri["hesaplar"])

derin["hesaplar"].append(999.0)
print(musteri["hesaplar"], derin["hesaplar"])

print(musteri["hesaplar"] is sig["hesaplar"], musteri["hesaplar"] is derin["hesaplar"])
</pre>
<div class="warn"><b>Varsayılan argüman tuzağı</b><code>def ekle(x, liste=[])</code> yazarsan liste bir kez yaratılır ve tüm çağrılar arasında paylaşılır. <code>liste=None</code> ver, içeride <code>if liste is None: liste = []</code>.</div>

<h2>Referans sayımı ve çöp toplayıcı</h2>
<p>CPython her nesnede bir sayaç tutar: kaç ad/kap ona işaret ediyor. Sayı sıfıra inince nesne anında silinir. <code>sys.getrefcount</code> bunu gösterir (çağrının kendisi +1 ekler). Sayım, birbirini gösteren <b>döngüsel</b> referanslarda yetmez (a → b → a); bunları periyodik çalışan <code>gc</code> modülü bulup temizler.</p>
<pre class="py">import sys, gc

veri = [1, 2, 3]
print(sys.getrefcount(veri))          # 2: veri + getrefcount argümanı
alias = veri
print(sys.getrefcount(veri))          # 3
del alias
print(sys.getrefcount(veri))          # 2

class Dugum:
    def __init__(self, ad):
        self.ad = ad
        self.es = None

a, b = Dugum("a"), Dugum("b")
a.es, b.es = b, a                     # döngü
del a, b                              # sayaç sıfıra inmez
print("gc topladı:", gc.collect() &gt;= 2)
print("gc eşikleri:", gc.get_threshold())
</pre>
<div class="tip"><b>Pratikte</b>gc\'yi elle çağırman nadiren gerekir. Sızıntı şüphesinde <code>tracemalloc</code> ile anlık görüntü al, büyüyen satırı bul; çoğu zaman sorun küresel bir liste ya da önbelleğin sınırsız büyümesidir, gc değil.</div>

<h2>Interning: is tuzağı</h2>
<p>CPython küçük tam sayıları (-5..256) ve bazı kısa string\'leri bir kez yaratıp paylaşır (interning). Bu yüzden <code>a = 100; b = 100; a is b</code> True çıkar ama 1000 için False olabilir. Çıkarım: değer karşılaştırması <b>her zaman</b> <code>==</code>; <code>is</code> yalnızca <code>None</code>, <code>True</code>, <code>False</code> ve "aynı nesne mi" sorusu için.</p>
<pre class="py">a, b = 100, 100
c, d = 10**5, 10**5
print(a is b, c is d, c == d)          # interning küçük sayıda

s1 = "aktif"
s2 = "".join(["ak", "tif"])
print(s1 == s2, s1 is s2)              # değer eşit, kimlik farklı olabilir

import sys
s3 = sys.intern(s2)
print(s3 is sys.intern("aktif"))       # intern ile zorla paylaştırma
</pre>

<h2>Bellek boyutu ve __slots__</h2>
<p><code>sys.getsizeof(x)</code> nesnenin kendi boyutunu verir (içindekileri saymaz). Normal bir sınıf örneği öznitelikleri bir <code>__dict__</code> sözlüğünde tutar; milyonlarca küçük nesnede bu sözlükler belleği yutar. <code>__slots__</code> tanımlarsan öznitelikler sabit yuvalarda saklanır, sözlük oluşmaz, bellek belirgin düşer ve erişim biraz hızlanır. Bedeli: tanımlanmamış öznitelik eklenemez.</p>
<pre class="py">import sys

class Islem:
    def __init__(self, hesap, tutar):
        self.hesap = hesap
        self.tutar = tutar

class IslemSlots:
    __slots__ = ("hesap", "tutar")
    def __init__(self, hesap, tutar):
        self.hesap = hesap
        self.tutar = tutar

n = Islem(1, 10.0)
s = IslemSlots(1, 10.0)
print("normal:", sys.getsizeof(n) + sys.getsizeof(n.__dict__), "bayt")
print("slots :", sys.getsizeof(s), "bayt")
print(hasattr(s, "__dict__"))
try:
    s.aciklama = "x"
except AttributeError as e:
    print("slots engelledi:", e)
print(sys.getsizeof([]), sys.getsizeof([1, 2, 3]), sys.getsizeof((1, 2, 3)), sys.getsizeof("ab"))
</pre>
<div class="tbl-wrap"><table><tr><th>Kavram</th><th>Araç</th><th>Günlük etkisi</th></tr>
<tr><td>Kimlik vs değer</td><td><code>is</code>, <code>==</code>, <code>id</code></td><td>is yalnızca None/singleton için</td></tr>
<tr><td>Kopya</td><td><code>copy()</code>, <code>deepcopy</code></td><td>İç içe yapıda deepcopy</td></tr>
<tr><td>Ömür</td><td>refcount, <code>gc</code></td><td>Döngüsel referans, sızıntı</td></tr>
<tr><td>Bellek</td><td><code>getsizeof</code>, <code>__slots__</code>, <code>tracemalloc</code></td><td>Çok sayıda küçük nesne</td></tr>
<tr><td>Çalışma</td><td><code>dis</code></td><td>Neden bazı ifadeler hızlı</td></tr>
</table></div>

<h2>Bytecode: dis ile kısa bakış</h2>
<p>Python kaynak kodu önce <b>bytecode</b>\'a derlenir, sonra sanal makine bu komutları yorumlar. <code>dis</code> modülü bu komutları gösterir; "neden yerel değişken küreselden hızlı?" gibi soruların cevabı buradadır (LOAD_FAST vs LOAD_GLOBAL).</p>
<pre class="py">import dis

def kdv(tutar):
    return tutar * 1.2

komutlar = [i.opname for i in dis.get_instructions(kdv)]
print(komutlar)
print("sabit katlama:", [i.argval for i in dis.get_instructions(lambda: 60 * 60 * 24) if i.opname == "RETURN_CONST" or i.opname == "LOAD_CONST"])
</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Değişmezliği tasarımda kullan</h3>
<p>Fonksiyona verilen listeyi değiştirmeyen, yeni liste döndüren "saf" fonksiyonlar paylaşım hatalarını baştan önler. <code>@dataclass(frozen=True)</code>, <code>tuple</code>, <code>frozenset</code> ve <code>MappingProxyType</code> değişmez arayüz sağlar; eşzamanlı kodda kilit ihtiyacını azaltır.</p>
<h3>Zayıf referans</h3>
<p>Önbellek tutarken nesnelerin ömrünü uzatmak istemezsin; <code>weakref</code> sayaç artırmadan referans tutar, nesne başka yerde silinince önbellek girdisi de düşer (<code>WeakValueDictionary</code>).</p>
<h3>Bellek ayırıcı</h3>
<p>CPython küçük nesneler için kendi havuz ayırıcısını (pymalloc) kullanır; serbest bırakılan bellek işletim sistemine hemen dönmeyebilir. Uzun süreli süreçlerde "bellek düşmüyor" gözlemi çoğu zaman sızıntı değil bu havuzlamadır. Gerçek sızıntıyı <code>tracemalloc</code> ile iki anlık görüntü arasındaki farktan bul.</p>
</section>`,
    ex: [
      { t: 'code', id: 'bellek-ic-yapi-1',
        q: '<p><code>guvenli_kopya(musteri)</code> fonksiyonu, iç içe listeler/sözlükler içerebilen <code>musteri</code> sözlüğünün <b>tamamen bağımsız</b> bir kopyasını döndürsün; kopyada yapılan hiçbir değişiklik orijinali etkilememeli. Ayrıca <code>ayni_nesne(a, b)</code> fonksiyonu iki değerin aynı nesne olup olmadığını (kimlik) döndürsün.</p>',
        start: 'import copy\n\ndef guvenli_kopya(musteri):\n    pass\n\ndef ayni_nesne(a, b):\n    pass\n',
        sol: 'import copy\n\ndef guvenli_kopya(musteri):\n    return copy.deepcopy(musteri)\n\ndef ayni_nesne(a, b):\n    return a is b\n',
        tests: 'm = {"ad": "Ayşe", "hesaplar": [1500.0, 320.0], "adres": {"il": "Ankara"}}\nk = guvenli_kopya(m)\nk["hesaplar"].append(50.0)\nk["adres"]["il"] = "İzmir"\nk["ad"] = "X"\nassert m == {"ad": "Ayşe", "hesaplar": [1500.0, 320.0], "adres": {"il": "Ankara"}}, "Orijinal değişmemeli (deepcopy)"\nassert k["hesaplar"] == [1500.0, 320.0, 50.0], "Kopya değişmeli"\nl = [1]\nassert ayni_nesne(l, l) is True and ayni_nesne(l, [1]) is False, "ayni_nesne kimlik (is) ile karşılaştırmalı"\nassert ayni_nesne(None, None) is True, "None tek nesnedir"\n',
        hints: ['copy.deepcopy iç içe tüm yapıyı kopyalar; dict.copy() yalnızca dış katmanı.', 'Kimlik için is kullan, == değil.'],
        why: 'Sığ kopya iç listeyi paylaşır; deepcopy her seviyeyi yeniden yaratır. is nesne kimliğini karşılaştırır, == değeri.' },
      { t: 'code', id: 'bellek-ic-yapi-2',
        q: '<p><code>siparis_ekle(urun, sepet=None)</code> fonksiyonunu yaz: <code>sepet</code> verilmezse <b>her çağrıda yeni</b> bir liste oluştursun, ürünü ekleyip listeyi döndürsün. Varsayılan argüman olarak <code>[]</code> kullanma; testler iki ayrı çağrının birbirini etkilemediğini kontrol eder.</p>',
        start: 'def siparis_ekle(urun, sepet=None):\n    pass\n',
        sol: 'def siparis_ekle(urun, sepet=None):\n    if sepet is None:\n        sepet = []\n    sepet.append(urun)\n    return sepet\n',
        tests: 'a = siparis_ekle("kahve")\nb = siparis_ekle("çay")\nassert a == ["kahve"] and b == ["çay"], "Her çağrı yeni liste almalı"\nassert a is not b, "İki çağrının listesi aynı nesne olmamalı"\nc = siparis_ekle("un", a)\nassert c is a and a == ["kahve", "un"], "Verilen sepet yerinde güncellenmeli"\nassert siparis_ekle.__defaults__ == (None,), "Varsayılan None olmalı, [] değil"\n',
        hints: ['if sepet is None: sepet = []', 'Varsayılan değerler fonksiyon tanımlanırken bir kez yaratılır; değişebilir nesne paylaşılır.'],
        why: 'None nöbetçi (sentinel) kalıbı, değişebilir varsayılan argümanın çağrılar arasında paylaşılmasını önler.' },
      { t: 'code', id: 'bellek-ic-yapi-3',
        q: '<p><code>Islem</code> sınıfını <code>__slots__ = ("hesap", "tutar", "tarih")</code> ile tanımla; <code>__init__(hesap, tutar, tarih)</code> üç özniteliği atasın. <code>bellek_karsilastir(n)</code> fonksiyonu, <code>__slots__</code>\'suz eşdeğer <code>IslemDict</code> sınıfı (verilmiştir) ile <code>Islem</code>\'in birer örneğinin <code>sys.getsizeof</code> ile ölçülen boyutunu (IslemDict için <code>__dict__</code> boyutunu da ekleyerek) <code>(dict_boyut, slots_boyut)</code> olarak döndürsün.</p>',
        start: 'import sys\n\nclass IslemDict:\n    def __init__(self, hesap, tutar, tarih):\n        self.hesap = hesap\n        self.tutar = tutar\n        self.tarih = tarih\n\nclass Islem:\n    pass\n\ndef bellek_karsilastir(n):\n    pass\n',
        sol: 'import sys\n\nclass IslemDict:\n    def __init__(self, hesap, tutar, tarih):\n        self.hesap = hesap\n        self.tutar = tutar\n        self.tarih = tarih\n\nclass Islem:\n    __slots__ = ("hesap", "tutar", "tarih")\n\n    def __init__(self, hesap, tutar, tarih):\n        self.hesap = hesap\n        self.tutar = tutar\n        self.tarih = tarih\n\ndef bellek_karsilastir(n):\n    d = IslemDict(1, 10.0, "2024-01-01")\n    s = Islem(1, 10.0, "2024-01-01")\n    return sys.getsizeof(d) + sys.getsizeof(d.__dict__), sys.getsizeof(s)\n',
        tests: 'i = Islem(7, 25.5, "2024-03-01")\nassert (i.hesap, i.tutar, i.tarih) == (7, 25.5, "2024-03-01"), "Öznitelikler atanmalı"\nassert not hasattr(i, "__dict__"), "__slots__ tanımlı sınıfta __dict__ olmamalı"\ntry:\n    i.aciklama = "x"\n    raise AssertionError("Tanımsız öznitelik eklenememeli")\nexcept AttributeError:\n    pass\nd, s = bellek_karsilastir(1)\nassert isinstance(d, int) and isinstance(s, int), "Boyutlar tam sayı olmalı"\nassert s < d, f"__slots__ örneği daha küçük olmalı ({s} < {d})"\n',
        hints: ['Sınıf gövdesinin başına __slots__ = ("hesap", "tutar", "tarih") yaz.', 'sys.getsizeof(d) + sys.getsizeof(d.__dict__) ile dict\'li örneğin gerçek maliyetini ölç.'],
        why: '__slots__ örnek başına sözlüğü kaldırır; öznitelikler sabit yuvalarda tutulur. Milyonlarca kayıtta fark yüzlerce MB olabilir.' },
      { t: 'mc', q: '<code>a = 1000; b = 1000; print(a is b)</code> ifadesi için en doğru açıklama hangisi?',
        o: ['Her zaman True; sayılar değişmezdir', 'Sonuç uygulama ayrıntısına bağlıdır; değer için == kullanılmalı', 'Her zaman False', 'SyntaxError'], a: 1,
        why: 'CPython yalnızca -5..256 arasını önceden paylaştırır; 1000 için aynı satırda True, ayrı satırlarda False çıkabilir. Değer karşılaştırması == iledir, is yalnızca None gibi tekil nesneler için.' },
      { t: 'mc', q: 'İki nesne birbirine referans veriyor (a.es = b, b.es = a) ve dış referanslar silindi. Bellek nasıl geri alınır?',
        o: ['Referans sayımı anında siler', 'Döngüsel çöp toplayıcı (gc) bulup temizler', 'Program bitene kadar asla', 'del çağrısı zorunludur'], a: 1,
        why: 'Sayaçlar birbirleri yüzünden sıfıra inmez; CPython\'ın nesil tabanlı gc\'si döngüleri periyodik olarak tespit edip serbest bırakır.' },
      { t: 'code', id: 'bellek-ic-yapi-4',
        q: '<p><code>referans_sayisi(nesne)</code> fonksiyonu <code>sys.getrefcount</code> ile ölçülen değerden fonksiyon çağrısının eklediği 1\'i düşerek "gerçek" sayıyı döndürsün. <code>ayni_deger_farkli_nesne(x)</code> fonksiyonu ise <code>x</code> listesinin <b>değerce eşit ama kimliği farklı</b> bir kopyasını döndürsün (sığ kopya yeterli).</p>',
        start: 'import sys\n\ndef referans_sayisi(nesne):\n    pass\n\ndef ayni_deger_farkli_nesne(x):\n    pass\n',
        sol: 'import sys\n\ndef referans_sayisi(nesne):\n    return sys.getrefcount(nesne) - 1\n\ndef ayni_deger_farkli_nesne(x):\n    return list(x)\n',
        tests: 'import sys\nv = [1, 2, 3]\nn1 = referans_sayisi(v)\nassert isinstance(n1, int) and n1 >= 1, "tam sayı bir referans sayısı döndürmeli"\nalias = v\nassert referans_sayisi(v) == n1 + 1, "Yeni bir ad eklenince sayı 1 artmalı"\ndel alias\nassert referans_sayisi(v) == n1, "Ad silinince sayı geri düşmeli"\nk = ayni_deger_farkli_nesne(v)\nassert k == v and k is not v, "Değer eşit, kimlik farklı olmalı"\n',
        hints: ['sys.getrefcount(nesne) - 1; argüman olarak geçiş geçici bir referans ekler.', 'list(x), x[:] ya da x.copy() yeni liste nesnesi üretir.'],
        why: 'Referans sayısı adlar ve kaplar eklendikçe artar, silindikçe düşer. Sığ kopya yeni dış nesne verir; içerik aynı nesnelere işaret eder.' }
    ],
    faq: [
      { q: 'Python değeri mi referansı mı geçirir?', a: 'Nesne referansını geçirir. Değişebilir nesne içeride değiştirilirse dışarıda görülür; yeniden atama (x = ...) yalnızca yerel adı değiştirir.' },
      { q: 'del nesneyi siler mi?', a: 'Hayır, yalnızca adı kaldırır ve referans sayısını bir azaltır. Nesne başka referansı kalmayınca silinir.' },
      { q: '__slots__ her sınıfa koymalı mıyım?', a: 'Hayır. Yalnızca çok sayıda (yüz binlerce) küçük örnek oluşan veri sınıflarında anlamlıdır. dataclass(slots=True) ile kolayca eklenir; dinamik öznitelik ve çoklu kalıtımda dikkat gerekir.' }
    ],
    mistakes: [
      { bad: 'if durum is "aktif":', good: 'if durum == "aktif":', why: 'String kimliği interning\'e bağlıdır ve güvenilmez; değer karşılaştırması == ile yapılır.' },
      { bad: 'yedek = veri\nyedek.append(x)  # veri de değişir', good: 'yedek = veri.copy()\nyedek.append(x)', why: 'Atama kopya değildir, aynı nesneye ikinci addır; bağımsızlık için copy (iç içe yapıda deepcopy).' },
      { bad: 'def ekle(urun, sepet=[]):\n    sepet.append(urun)\n    return sepet', good: 'def ekle(urun, sepet=None):\n    if sepet is None:\n        sepet = []\n    sepet.append(urun)\n    return sepet', why: 'Varsayılan liste tanımda bir kez yaratılır ve çağrılar arasında paylaşılır.' },
      { bad: 'print(sys.getsizeof(buyuk_liste), "bayt bellek")', good: 'tracemalloc.start()\n...\nsnap = tracemalloc.take_snapshot()', why: 'getsizeof yalnızca kabın kendi boyutunu verir, elemanları saymaz; gerçek kullanım için tracemalloc ya da toplam hesaplama gerekir.' }
    ]
  }
);
})(window);
