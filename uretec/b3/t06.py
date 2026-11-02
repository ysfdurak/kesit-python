T = [
dict(id='b-361', topic='Eşzamanlılık', diff=2, kind='bug',
  title='Hata sonrası bırakılmayan kilit',
  q='<p>Kodda bir hata var, bul ve düzelt. <code>kaydet(kayit)</code> paylaşılan <code>islenen</code> listesine kilit altında ekleme yapıyor. Negatif tutarlı bir kayıt <code>ValueError</code> fırlattıktan sonra servis tamamen donuyor: sonraki tüm çağrılar kilidi sonsuza dek bekliyor.</p>',
  start=r'''
import threading

kilit = threading.Lock()
islenen = []

def kaydet(kayit):
    kilit.acquire()
    if kayit.get("tutar", 0) < 0:
        raise ValueError("negatif tutar")
    islenen.append(kayit)
    kilit.release()
''',
  sol=r'''
import threading

kilit = threading.Lock()
islenen = []

def kaydet(kayit):
    with kilit:
        if kayit.get("tutar", 0) < 0:
            raise ValueError("negatif tutar")
        islenen.append(kayit)
''',
  tests=r'''
kaydet({"no": 1, "tutar": 50})
try:
    kaydet({"no": 2, "tutar": -5})
    assert False, "Negatif tutar ValueError fırlatmalı"
except ValueError:
    pass
assert not kilit.locked(), "Hata sonrasında kilit serbest kalmalı: acquire/release yerine with kilit: kullan"
kaydet({"no": 3, "tutar": 10})
assert [k["no"] for k in islenen] == [1, 3], "Geçerli kayıtlar (1 ve 3) eklenmeli"
''',
  hints=['İstisna fırladığında <code>kilit.release()</code> satırına hiç ulaşılmaz.', 'Kilidi her çıkış yolunda bırakmak için <code>try/finally</code> ya da bağlam yöneticisi gerekir.', '<code>with kilit:</code> bloğu istisnada da kilidi bırakır.'],
  why='Elle acquire/release çiftinde araya giren her return ya da istisna kilidi sızdırır ve sistem kilitlenir. with kilit: bağlam yöneticisi __exit__’te her durumda release çağırır (try/finally’nin kısa yolu). Kritik bölgeyi olabildiğince kısa tut: doğrulama gibi paylaşılan veriye dokunmayan işleri kilidin dışına almak bekleme süresini azaltır. Aynı thread’in kilidi yeniden alması gerekiyorsa threading.RLock kullanılır.',
  tags=['Lock', 'with', 'kaynak sızıntısı'], min=3),

dict(id='b-362', topic='Eşzamanlılık', diff=2, kind='tamamla',
  title='Future sonuçlarını hatalarla birlikte topla',
  q='<p>Rapor servisi birçok işi havuza gönderiyor ve <code>{Future: iş_adı}</code> sözlüğü tutuyor. <code>sonuclari_topla(isler)</code> işler bittikçe (<code>as_completed</code>) sonuçları toplasın: başarılılar <code>{ad: sonuç}</code>, hata verenler <code>{ad: hata_mesajı}</code>. <code>___</code> boşluklarını doldur.</p>',
  start=r'''
from concurrent.futures import Future, as_completed

def sonuclari_topla(isler):
    basarili, hatali = {}, {}
    for f in as_completed(isler):
        ad = isler[f]
        try:
            basarili[ad] = f.___()
        except ___ as e:
            hatali[ad] = str(e)
    return basarili, hatali
''',
  sol=r'''
from concurrent.futures import Future, as_completed

def sonuclari_topla(isler):
    basarili, hatali = {}, {}
    for f in as_completed(isler):
        ad = isler[f]
        try:
            basarili[ad] = f.result()
        except Exception as e:
            hatali[ad] = str(e)
    return basarili, hatali
''',
  tests=r'''
f1, f2, f3 = Future(), Future(), Future()
f1.set_result(120)
f2.set_exception(ValueError("eksik sütun"))
f3.set_result(80)
b, h = sonuclari_topla({f1: "satis", f2: "stok", f3: "iade"})
assert b == {"satis": 120, "iade": 80}, f"Başarılı işler {{'satis': 120, 'iade': 80}}; gelen {b}"
assert h == {"stok": "eksik sütun"}, f"Hata mesajı yakalanmalı; gelen {h}"
''',
  hints=['İşçide fırlayan istisna Future içinde saklanır ve sonucu istediğinde yeniden fırlatılır.', 'Sonucu almak için <code>f.result()</code>.', 'Genel iş hataları için <code>except Exception as e</code>.'],
  why='Havuzdaki bir iş hata verirse istisna kaybolmaz; Future içinde saklanır ve result() çağrısında yeniden fırlatılır. result() hiç çağrılmazsa hata sessizce yutulur — klasik bir üretim hatası. as_completed işleri bitiş sırasıyla verir, böylece yavaş bir iş hızlıların işlenmesini bekletmez; Executor.map ise girdi sırasını korur ama ilk hatada döngüyü keser. Alternatif: concurrent.futures.wait(isler, return_when=FIRST_EXCEPTION) ile ilk hatada durmak.',
  tags=['Future', 'as_completed', 'hata yönetimi'], min=3),

dict(id='b-363', topic='Eşzamanlılık', diff=3, kind='yaz',
  title='İş parçacığı güvenli jeton kovası (rate limiter)',
  q='<p>Ödeme API\'si saniyede en fazla belirli sayıda isteğe izin veriyor; birden çok işçi thread aynı sınırlayıcıyı paylaşacak. <code>TokenKovasi(kapasite, hiz, saat=time.monotonic)</code> sınıfını yaz: kova <code>kapasite</code> jetonla dolu başlar, saniyede <code>hiz</code> jeton dolar (kapasiteyi aşmaz). <code>izin_ver(maliyet=1)</code>: yeterli jeton varsa düşer ve <code>True</code>, yoksa <code>False</code> döndürür. Durum güncellemesini bir <code>threading.Lock</code> (<code>self.kilit</code>) altında yap. <code>saat</code> parametresi testte sahte saat vermek içindir.</p>',
  start=r'''
import threading
import time

class TokenKovasi:
    pass
''',
  sol=r'''
import threading
import time

class TokenKovasi:
    def __init__(self, kapasite, hiz, saat=time.monotonic):
        self.kapasite = kapasite
        self.hiz = hiz
        self.saat = saat
        self.jeton = float(kapasite)
        self.son = saat()
        self.kilit = threading.Lock()

    def izin_ver(self, maliyet=1):
        with self.kilit:
            simdi = self.saat()
            self.jeton = min(self.kapasite, self.jeton + (simdi - self.son) * self.hiz)
            self.son = simdi
            if self.jeton >= maliyet:
                self.jeton -= maliyet
                return True
            return False
''',
  tests=r'''
zaman = [0.0]
k = TokenKovasi(3, 2, saat=lambda: zaman[0])
assert [k.izin_ver() for _ in range(4)] == [True, True, True, False], "Dolu kova 3 isteğe izin verir, 4.'yü reddeder"
zaman[0] = 0.5
assert k.izin_ver() is True, "0.5 sn'de 2 jeton/sn × 0.5 = 1 jeton dolar"
assert k.izin_ver() is False, "Dolan tek jeton harcandı"
zaman[0] = 100.0
assert [k.izin_ver() for _ in range(4)] == [True, True, True, False], "Uzun bekleme kapasiteyi (3) aşmamalı"
assert k.izin_ver(maliyet=0) is True
zaman[0] = 101.0
assert k.izin_ver(maliyet=3) is False and k.izin_ver(maliyet=2) is True, "Maliyet jetondan büyükse reddet, jeton düşme"
assert hasattr(k, "kilit") and hasattr(k.kilit, "acquire"), "self.kilit bir Lock olmalı"
''',
  hints=['Her çağrıda geçen süreye göre jeton ekle: <code>(simdi - son) * hiz</code>, sonra <code>min(kapasite, ...)</code>.', 'Son güncelleme zamanını sakla ve her çağrıda yenile.', 'Oku-hesapla-yaz adımlarının tümü <code>with self.kilit:</code> içinde olmalı.'],
  why='Jeton kovası kısa patlamalara (kapasite kadar) izin verirken uzun vadede ortalama hızı sınırlar; tembel dolum sayesinde arka planda zamanlayıcı gerekmez, her çağrı O(1). Saat time.monotonic olmalı: sistem saati geri alınırsa time.time negatif süre verir. Kilit olmadan iki thread aynı jetonu aynı anda harcayabilir. Alternatifler: sabit pencere sayacı (basit ama pencere sınırında 2× patlama), sızdıran kova (leaky bucket, sabit çıkış hızı), dağıtık sistemlerde Redis tabanlı sınırlayıcı.',
  tags=['rate limiting', 'token bucket', 'Lock', 'monotonic'], min=12),

dict(id='b-364', topic='Performans', diff=2, kind='predict',
  title='Küçük önbellekte kim düşer?',
  q='<p>Kapasitesi 2 olan LRU önbellekle döviz kurlarını sorgulayan bu kod ne yazdırır?</p>',
  code=r'''
from functools import lru_cache

@lru_cache(maxsize=2)
def kur(doviz):
    return len(doviz)

for d in ["USD", "EUR", "USD", "GBP", "EUR"]:
    kur(d)
print(kur.cache_info())
''',
  o=['CacheInfo(hits=1, misses=4, maxsize=2, currsize=2)', 'CacheInfo(hits=2, misses=3, maxsize=2, currsize=2)', 'CacheInfo(hits=2, misses=3, maxsize=2, currsize=3)', 'CacheInfo(hits=1, misses=4, maxsize=2, currsize=3)'], a=0,
  hints=['LRU: en uzun süredir kullanılmayan (least recently used) eleman dolu önbellekten çıkarılır.', 'USD ikinci kez sorulunca "en yeni" olur; GBP gelince EUR düşer.'],
  why='Adım adım: USD ıska [USD]; EUR ıska [USD, EUR]; USD isabet → sıra [EUR, USD]; GBP ıska, en eski EUR düşer [USD, GBP]; EUR ıska, USD düşer [GBP, EUR]. Sonuç 1 isabet, 4 ıska; boyut kapasiteyi (2) aşamaz. Her işlem O(1)’dir (sözlük + çift bağlı liste). cache_info isabet oranını ölçmek için kullanılır; oran düşükse maxsize büyütülür ya da önbellek gereksizdir. Sınırsız önbellek için functools.cache, süreli önbellek için cachetools.TTLCache.',
  tags=['lru_cache', 'önbellek', 'cache_info'], min=3),

dict(id='b-365', topic='Performans', diff=1, kind='order',
  title='Counter ile en çok satanlar',
  q='<p>Ürünleri tek geçişte sayıp en çok satan 2 ürünü yazdıran programın satırlarını sırala.</p>',
  lines=[
    'from collections import Counter',
    'sayac = Counter()',
    'for urun in ["çay", "kahve", "çay", "süt", "çay", "kahve"]:',
    '    sayac[urun] += 1',
    'en_cok = sayac.most_common(2)',
    'print(en_cok)',
  ],
  expect="[('çay', 3), ('kahve', 2)]\n",
  hints=['Sayaç döngüden önce oluşturulmalı.', 'most_common ancak sayım bittikten sonra anlamlıdır.'],
  why='Counter sözlük tabanlıdır: her artış O(1), toplam O(n). most_common(k) içerde heapq.nlargest kullanır: O(n log k), tüm listeyi sıralamaktan (O(n log n)) ucuzdur. Kısa yol: Counter(urunler).most_common(2). Her ürün için liste.count(urun) çağırmak ise O(n²) olur — büyük veride klasik darboğaz.',
  tags=['Counter', 'most_common', 'O(n)'], min=2),

dict(id='b-366', topic='Performans', diff=2, kind='rehberli',
  title='İç içe arama yerine sözlük indeksi',
  q='<p>Her sipariş için müşteri listesini baştan sona tarayan rapor 20 bin siparişte dakikalar sürüyor. <code>siparis_zenginlestir(siparisler, musteriler)</code> fonksiyonunu yaz: <code>siparisler</code> <code>{"no", "musteri_id"}</code>, <code>musteriler</code> <code>{"id", "ad"}</code> sözlüklerinin listesi. Her sipariş için <code>(no, ad)</code> demeti döndür; müşterisi bulunamayan siparişte ad <code>None</code> olsun. Önce müşteri id → ad sözlüğü kur, sonra tek geçişte eşleştir.</p>',
  guide=['Müşterilerden bir kez <code>{m["id"]: m["ad"] for m in musteriler}</code> indeksi kur: O(m).', 'Siparişlerde dolaş; her biri için indeksten <code>.get(id)</code> ile adı al: O(1).', 'Bulunamayan id için <code>.get</code> zaten <code>None</code> döndürür.', 'Sonuç listesini sipariş sırasıyla döndür.'],
  example=r'''
urunler = [{"kod": "A1", "fiyat": 10}, {"kod": "B2", "fiyat": 25}]
fiyat_indeks = {u["kod"]: u["fiyat"] for u in urunler}   # bir kez kur
sepet = ["B2", "A1", "C3"]
print([(k, fiyat_indeks.get(k)) for k in sepet])          # her arama O(1)
''',
  start=r'''
def siparis_zenginlestir(siparisler, musteriler):
    # TODO 1: müşterilerden bir kez id → ad sözlüğü kur (iç içe döngü YOK)
    indeks = {}
    sonuc = []
    for s in siparisler:
        # TODO 2: indeksten .get ile adı al (bulunamazsa None)
        ad = None
        sonuc.append((s["no"], ad))
    return sonuc
''',
  sol=r'''
def siparis_zenginlestir(siparisler, musteriler):
    indeks = {m["id"]: m["ad"] for m in musteriler}
    return [(s["no"], indeks.get(s["musteri_id"])) for s in siparisler]
''',
  tests=r'''
import time
m = [{"id": 1, "ad": "Ayşe"}, {"id": 2, "ad": "Can"}]
s = [{"no": 10, "musteri_id": 2}, {"no": 11, "musteri_id": 9}, {"no": 12, "musteri_id": 1}]
assert siparis_zenginlestir(s, m) == [(10, "Can"), (11, None), (12, "Ayşe")], "Eşleşmeyen müşteri None olmalı, sıra korunmalı"
N = 20000
mb = [{"id": i, "ad": f"M{i}"} for i in range(N)]
sb = [{"no": i, "musteri_id": (i * 7) % N} for i in range(N)]
t0 = time.perf_counter()
r = siparis_zenginlestir(sb, mb)
sure = time.perf_counter() - t0
assert r[3] == (3, "M21"), "Büyük veride eşleşme yanlış"
assert sure < 1.0, f"20 bin × 20 bin için sözlük indeksiyle < 1 sn beklenir; {sure:.2f} sn sürdü (iç içe döngü O(n·m))"
''',
  hints=['Darboğaz, her sipariş için tüm müşterileri taramak: 20.000 × 20.000 = 400 milyon karşılaştırma.', 'Sözlük anahtarla aramayı ortalama O(1) yapar.', '<code>indeks = {m["id"]: m["ad"] for m in musteriler}</code>, sonra <code>indeks.get(s["musteri_id"])</code>.'],
  why='İç içe döngüyle eşleştirme O(n·m)’dir; hash indeksiyle O(n + m)’ye iner — veritabanlarının hash join’i tam olarak budur. Bellek bedeli O(m). id tekrar ediyorsa sözlük son kaydı tutar; çoklu eşleşme gerekiyorsa defaultdict(list) kullanılır. Alternatifler: pandas merge, SQL JOIN; her iki liste id’ye göre sıralıysa iki işaretçili birleştirme (merge join) O(n + m) ve ek bellek gerektirmez.',
  tags=['hash join', 'dict', 'karmaşıklık'], min=6),

dict(id='b-367', topic='Performans', diff=2, kind='bug',
  title='Kuyrukta list.pop(0) darboğazı',
  q='<p>Kodda bir performans hatası var, bul ve düzelt. <code>sirayla_isle(isler)</code> işleri geliş sırasıyla (FIFO) işleyip her işin sonucunu listeye ekliyor; mantık doğru ama 60 bin işte saniyeler sürüyor. Sorun kuyruk veri yapısında.</p>',
  start=r'''
def sirayla_isle(isler):
    kuyruk = list(isler)
    sonuc = []
    while kuyruk:
        is_ = kuyruk.pop(0)
        sonuc.append(is_ * 2)
    return sonuc
''',
  sol=r'''
from collections import deque

def sirayla_isle(isler):
    kuyruk = deque(isler)
    sonuc = []
    while kuyruk:
        is_ = kuyruk.popleft()
        sonuc.append(is_ * 2)
    return sonuc
''',
  tests=r'''
import time
assert sirayla_isle([3, 1, 2]) == [6, 2, 4], "FIFO sırası korunmalı"
assert sirayla_isle([]) == [], "Boş kuyruk"
t0 = time.perf_counter()
r = sirayla_isle(range(60000))
sure = time.perf_counter() - t0
assert r[-1] == 119998, "Son iş yanlış işlendi"
assert "pop(0)" not in __source__, "list.pop(0) her çağrıda tüm elemanları kaydırır (O(n)); deque.popleft() kullan"
assert sure < 1.0, f"60 bin iş < 1 sn sürmeli; {sure:.2f} sn sürdü"
''',
  hints=['Liste dizi tabanlıdır: baştan eleman silmek kalan tüm elemanları bir sola kaydırır.', '<code>collections.deque</code> iki uçtan da O(1) ekleme/çıkarma yapar.', '<code>kuyruk = deque(isler)</code> ve <code>kuyruk.popleft()</code>'],
  why='list.pop(0) O(n) olduğu için n işlik döngü O(n²) olur; deque.popleft() O(1) ile toplam O(n). Bu, BFS ve iş kuyruklarında en sık görülen gizli darboğazdır. Burada sıra değişmediği için doğrudan [x * 2 for x in isler] de yeterliydi; kuyruk gerçekten gerekiyorsa (işlerken yeni iş ekleniyorsa) deque doğru yapıdır. Thread’ler arası kuyruk için queue.Queue, asenkron için asyncio.Queue kullanılır.',
  tags=['deque', 'pop(0)', 'O(n²)'], min=4),

dict(id='b-368', topic='Performans', diff=2, kind='yaz',
  title='Sonsuz akışı parçalara böl (tembel)',
  q='<p>Banka işlem akışı bellek sığmayacak kadar büyük; satırları 1000\'lik paketler hâlinde veritabanına yazmak istiyoruz. <code>parcala(akis, boyut)</code> <b>üreteç</b> fonksiyonunu yaz: herhangi bir yinelenebiliri (liste, dosya, sonsuz üreteç) alıp <code>boyut</code> elemanlı <b>listeler</b> üretsin; son paket eksik olabilir. Tüm girdiyi belleğe alma (<code>list(akis)</code> yok); <code>boyut &lt; 1</code> ise <code>ValueError</code>.</p>',
  start=r'''
from itertools import islice

def parcala(akis, boyut):
    pass
''',
  sol=r'''
from itertools import islice

def parcala(akis, boyut):
    if boyut < 1:
        raise ValueError("boyut en az 1 olmalı")
    it = iter(akis)
    while paket := list(islice(it, boyut)):
        yield paket
''',
  tests=r'''
import itertools, inspect
assert inspect.isgeneratorfunction(parcala), "parcala bir üreteç olmalı (yield)"
assert list(parcala(range(7), 3)) == [[0, 1, 2], [3, 4, 5], [6]], "Son paket eksik olabilir"
assert list(parcala([], 3)) == [], "Boş girdi → hiç paket yok"
ilk3 = list(islice(parcala(itertools.count(), 1000), 3))
assert [p[0] for p in ilk3] == [0, 1000, 2000], "Sonsuz akışta tembel çalışmalı (list(akis) sonsuza dek sürer)"
try:
    next(parcala([1], 0))
    assert False, "boyut 0 için ValueError"
except ValueError:
    pass
''',
  hints=['<code>iter(akis)</code> ile tek bir yineleyici al; her paket aynı yineleyiciden devam etmeli.', '<code>list(islice(it, boyut))</code> sonraki en fazla boyut elemanı alır; boşsa akış bitmiştir.', 'Mors operatörüyle: <code>while paket := list(islice(it, boyut)): yield paket</code>'],
  why='Üreteç, girdiyi istendikçe çektiği için bellek O(boyut)’ta kalır; toplam zaman O(n). Aynı yineleyiciden islice ile çekmek, dilimlemenin (akis[i:i+boyut]) yalnız listelerde çalışması kısıtını kaldırır. Python 3.12’de itertools.batched(akis, boyut) aynı işi demetlerle yapar; pandas’ta read_csv(chunksize=...) ve SQLAlchemy’de yield_per aynı fikrin karşılığıdır.',
  tags=['üreteç', 'islice', 'bellek', 'walrus'], min=6),

dict(id='b-369', topic='Performans', diff=3, kind='yaz',
  title='Kayan pencerede en yüksek fiyat (O(n))',
  q='<p>Borsa ekranı her an için son <code>k</code> işlemin en yüksek fiyatını gösteriyor. <code>kayan_maks(fiyatlar, k)</code> fonksiyonunu yaz: her tam pencere için maksimumu içeren liste döndürsün (uzunluk <code>n - k + 1</code>). Naif <code>max(pencere)</code> çözümü O(n·k) olduğu için 60 bin fiyat ve k=10000\'de çok yavaş; <code>collections.deque</code> ile <b>monoton kuyruk</b> kurarak O(n) çöz.</p>',
  start=r'''
from collections import deque

def kayan_maks(fiyatlar, k):
    pass
''',
  sol=r'''
from collections import deque

def kayan_maks(fiyatlar, k):
    dq = deque()          # indeksler; fiyatları azalan sırada
    sonuc = []
    for i, f in enumerate(fiyatlar):
        while dq and fiyatlar[dq[-1]] <= f:
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()
        if i >= k - 1:
            sonuc.append(fiyatlar[dq[0]])
    return sonuc
''',
  tests=r'''
import random, time
assert kayan_maks([1, 3, -1, -3, 5, 3, 6, 7], 3) == [3, 3, 5, 5, 6, 7], "Klasik örnek"
assert kayan_maks([4, 2], 1) == [4, 2], "k=1 diziyi aynen verir"
assert kayan_maks([2, 2, 2], 2) == [2, 2], "Eşit değerler"
random.seed(7)
v = [random.randint(1, 100) for _ in range(300)]
assert kayan_maks(v, 17) == [max(v[i:i + 17]) for i in range(len(v) - 16)], "Rastgele veride naif sonuçla aynı olmalı"
buyuk = [random.random() for _ in range(60000)]
t0 = time.perf_counter()
kayan_maks(buyuk, 10000)
sure = time.perf_counter() - t0
assert sure < 2.0, f"O(n) çözüm 2 sn altında bitmeli (naif max O(n·k) ≈ 5×10⁸ işlem); {sure:.2f} sn sürdü"
''',
  hints=['Kuyrukta indeks tut; kuyruğun başı her zaman pencerenin en büyüğü olsun.', 'Yeni fiyat geldiğinde kuyruğun sonundaki daha küçük (ya da eşit) fiyatları at: onlar artık hiç maksimum olamaz.', 'Baştaki indeks pencereden çıktıysa (<code>dq[0] &lt;= i - k</code>) popleft.'],
  why='Her indeks kuyruğa bir kez girer ve en fazla bir kez çıkar; bu yüzden toplam iş O(n) (amortize), bellek O(k). Naif yöntem her pencerede max alır: O(n·k) — örnekte 10⁹ işlem. Alternatifler: heap ile O(n log n) (eski elemanları tembel silerek), pandas’ta Series.rolling(k).max() (C hızında), numpy’de sliding_window_view(a, k).max(axis=1) (O(n·k) ama vektörel).',
  tags=['monoton kuyruk', 'deque', 'kayan pencere', 'amortize'], min=14),

dict(id='b-370', topic='İleri OOP ve Metaprogramlama', diff=2, kind='predict',
  title='Elmas kalıtımda super() zinciri',
  q='<p>Loglama ve denetim katmanlarını karışım (mixin) olarak birleştiren bu kod ne yazdırır?</p>',
  code=r'''
class Taban:
    def kaydet(self):
        return ["Taban"]

class Log(Taban):
    def kaydet(self):
        return ["Log"] + super().kaydet()

class Denetim(Taban):
    def kaydet(self):
        return ["Denetim"] + super().kaydet()

class Servis(Log, Denetim):
    def kaydet(self):
        return ["Servis"] + super().kaydet()

print(Servis().kaydet())
''',
  o=["['Servis', 'Log', 'Denetim', 'Taban']", "['Servis', 'Log', 'Taban']", "['Servis', 'Log', 'Taban', 'Denetim', 'Taban']", "['Servis', 'Denetim', 'Log', 'Taban']"], a=0,
  hints=['super() "ebeveyn" değil, MRO\'daki bir sonraki sınıf demektir.', 'Servis.__mro__ = Servis, Log, Denetim, Taban, object (C3 doğrusallaştırma).'],
  why='Python çoklu kalıtımda C3 algoritmasıyla tek bir yöntem çözümleme sırası (MRO) kurar: Servis → Log → Denetim → Taban → object. Log içindeki super() Taban’a değil, MRO’da Log’dan sonra gelen Denetim’e gider; böylece Taban yalnız bir kez çağrılır (elmas problemi çözülür). Bu işbirlikçi kalıtım, her sınıfın super() çağırmasına dayanır; biri doğrudan Taban.kaydet(self) derse zincir kopar. MRO’yu Servis.__mro__ ya da Servis.mro() ile görebilirsin.',
  tags=['MRO', 'super', 'mixin', 'çoklu kalıtım'], min=4),
]
