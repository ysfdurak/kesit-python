T = [
dict(id='b-401', topic='ETL ve Orkestrasyon', diff=2, kind='tamamla',
  title='Görev bağımlılıklarından çalışma sırası (DAG)',
  q='<p>Airflow benzeri bir orkestratör, görevleri bağımlılıklarına göre sıralar: bir görev ancak tüm ön koşulları bittikten sonra çalışır. <code>calistirma_sirasi(dag)</code> standart kütüphanedeki <code>graphlib.TopologicalSorter</code> ile bunu yapıyor; <code>dag</code> sözlüğü <code>{görev: [ön_koşullar]}</code>. Döngü varsa <code>CycleError</code> yükselmeli. <code>___</code> boşluklarını doldur.</p>',
  start=r'''
from graphlib import CycleError, TopologicalSorter

def calistirma_sirasi(dag):
    ts = TopologicalSorter()
    for gorev, onkosullar in dag.items():
        ts.___(gorev, *onkosullar)
    return list(ts.___())
''',
  sol=r'''
from graphlib import CycleError, TopologicalSorter

def calistirma_sirasi(dag):
    ts = TopologicalSorter()
    for gorev, onkosullar in dag.items():
        ts.add(gorev, *onkosullar)
    return list(ts.static_order())
''',
  tests=r'''
dag = {
    "rapor": ["birlestir"],
    "birlestir": ["siparis_cek", "musteri_cek"],
    "siparis_cek": [],
    "musteri_cek": [],
    "eposta": ["rapor"],
}
s = calistirma_sirasi(dag)
assert sorted(s) == sorted(dag), "Her görev bir kez yer almalı"
once = lambda a, b: s.index(a) < s.index(b)
assert once("siparis_cek", "birlestir") and once("musteri_cek", "birlestir"), "Çekme görevleri birleştirmeden önce"
assert once("birlestir", "rapor") and once("rapor", "eposta"), "rapor → eposta zinciri korunmalı"
try:
    calistirma_sirasi({"a": ["b"], "b": ["a"]})
    assert False, "Döngüsel bağımlılık CycleError vermeli"
except CycleError:
    pass
''',
  hints=['TopologicalSorter\'a düğüm ve ön koşullarını ekleyen metot <code>add(dugum, *onkosullar)</code>.', 'Tüm sırayı tek seferde veren metot <code>static_order()</code>; bir üreteç döndürür.', 'Döngü varsa <code>static_order</code> kendiliğinden <code>CycleError</code> fırlatır.'],
  why='Görev bağımlılıkları yönlü döngüsüz bir çizgedir (DAG); topolojik sıralama her görevi ön koşullarından sonra yerleştirir (Kahn algoritması, O(V + E)). graphlib (3.9+) bunu hazır sunar; get_ready()/done() arayüzüyle bağımsız görevleri paralel çalıştırmak da mümkündür. Döngü, hiçbir zaman başlatılamayacak görevler demektir, bu yüzden erken hata vermek doğrudur. Airflow, Prefect, Dagster ve dbt aynı fikri büyük ölçekte uygular.',
  tags=['DAG', 'topolojik sıralama', 'graphlib', 'orkestrasyon'], min=4),

dict(id='b-402', topic='ETL ve Orkestrasyon', diff=2, kind='yaz',
  title='Veri kalitesi kontrolü ve karantina',
  q='<p>Yüklemeden önce sipariş satırları denetlenecek. <code>denetle(satirlar)</code> fonksiyonunu yaz: her satır <code>{"no", "musteri_id", "tarih", "tutar"}</code> sözlüğü (değerler metin). Kurallar sırasıyla kontrol edilir ve satırın <b>ilk</b> ihlali kaydedilir: <code>"eksik musteri_id"</code> (boş metin), <code>"geçersiz tarih"</code> (YYYY-MM-DD değil ya da var olmayan gün), <code>"geçersiz tutar"</code> (sayı değil ya da negatif), <code>"tekrar no"</code> (aynı <code>no</code> daha önce geçerli olarak görüldüyse). <code>(gecerli_satirlar, hatalar)</code> döndür; <code>hatalar</code> = <code>[(satır_sırası (1\'den), neden), ...]</code>. Geçerli satırlarda <code>tutar</code> float\'a çevrilsin.</p>',
  start=r'''
from datetime import datetime

def denetle(satirlar):
    pass
''',
  sol=r'''
from datetime import datetime

def denetle(satirlar):
    gecerli, hatalar, gorulen = [], [], set()
    for i, s in enumerate(satirlar, 1):
        if not s.get("musteri_id", "").strip():
            hatalar.append((i, "eksik musteri_id"))
            continue
        try:
            datetime.strptime(s["tarih"], "%Y-%m-%d")
        except ValueError:
            hatalar.append((i, "geçersiz tarih"))
            continue
        try:
            tutar = float(s["tutar"])
        except ValueError:
            tutar = -1
        if tutar < 0:
            hatalar.append((i, "geçersiz tutar"))
            continue
        if s["no"] in gorulen:
            hatalar.append((i, "tekrar no"))
            continue
        gorulen.add(s["no"])
        gecerli.append({**s, "tutar": tutar})
    return gecerli, hatalar
''',
  tests=r'''
satirlar = [
    {"no": "1", "musteri_id": "M1", "tarih": "2026-02-28", "tutar": "100.5"},
    {"no": "2", "musteri_id": "", "tarih": "2026-02-28", "tutar": "50"},
    {"no": "3", "musteri_id": "M2", "tarih": "2026-02-30", "tutar": "50"},
    {"no": "4", "musteri_id": "M3", "tarih": "2026-03-01", "tutar": "-5"},
    {"no": "5", "musteri_id": "M3", "tarih": "01.03.2026", "tutar": "abc"},
    {"no": "1", "musteri_id": "M4", "tarih": "2026-03-02", "tutar": "20"},
    {"no": "6", "musteri_id": "M5", "tarih": "2026-03-02", "tutar": "abc"},
    {"no": "7", "musteri_id": "M6", "tarih": "2026-03-03", "tutar": "0"},
]
g, h = denetle(satirlar)
assert [x["no"] for x in g] == ["1", "7"], f"Geçerli satırlar no 1 ve 7; gelen {[x['no'] for x in g]}"
assert g[0]["tutar"] == 100.5 and isinstance(g[1]["tutar"], float), "tutar float'a çevrilmeli"
assert h == [(2, "eksik musteri_id"), (3, "geçersiz tarih"), (4, "geçersiz tutar"), (5, "geçersiz tarih"), (6, "tekrar no"), (7, "geçersiz tutar")], f"Hata listesi yanlış: {h}"
assert satirlar[0]["tutar"] == "100.5", "Girdi satırları değiştirilmemeli"
''',
  hints=['Her kuralda ihlal varsa hatayı ekle ve <code>continue</code> ile sonraki satıra geç (yalnız ilk ihlal).', '<code>datetime.strptime(t, "%Y-%m-%d")</code> 30 Şubat gibi olmayan günlerde de <code>ValueError</code> fırlatır.', 'Görülen geçerli numaraları bir kümede tut; geçersiz satırın numarası tekrar sayılmaz.'],
  why='Hatalı satırları sessizce atmak yerine nedenleriyle karantinaya almak, kaynak sistemdeki sorunu bulup düzeltmeyi sağlar ve yüklenen veriye güven verir. Kurallar ucuzdan pahalıya sıralanır, ilk ihlalde durulur: O(n) zaman, tekrar kontrolü için O(n) bellek (küme). Girdiyi değiştirmemek ({**s, ...} ile yeni sözlük) hattı yeniden çalıştırılabilir kılar. Ölçekli alternatifler: pandera / Great Expectations ile bildirimsel şema ve beklentiler, pydantic modelleriyle satır doğrulama.',
  tags=['veri kalitesi', 'doğrulama', 'karantina', 'strptime'], min=10),

dict(id='b-403', topic='ETL ve Orkestrasyon', diff=3, kind='yaz',
  title='Filigranla artımlı çekme (eşit zaman damgaları)',
  q='<p>Kaynak tablodan her çalışmada yalnız yeni/güncellenmiş kayıtlar çekilecek. Yalnız <code>guncellendi &gt; son_zaman</code> kullanmak, aynı saniyede güncellenen ve önceki partiye sığmayan kayıtları kaçırır. <code>artimli_cek(kaynak, isaret, limit)</code> fonksiyonunu yaz: kayıtlar <code>{"id", "guncellendi"}</code> içerir (guncellendi ISO metni, karşılaştırılabilir). Filigran (watermark) <code>(guncellendi, id)</code> demetidir; <code>isaret</code> <code>None</code> ise baştan başla. <code>(guncellendi, id)</code> değeri filigrandan <b>büyük</b> kayıtları bu demete göre sıralayıp en fazla <code>limit</code> tanesini al. <code>(parti, yeni_isaret)</code> döndür; parti boşsa işaret değişmez.</p>',
  start=r'''
def artimli_cek(kaynak, isaret, limit):
    pass
''',
  sol=r'''
def artimli_cek(kaynak, isaret, limit):
    anahtar = lambda k: (k["guncellendi"], k["id"])
    adaylar = sorted((k for k in kaynak if isaret is None or anahtar(k) > isaret), key=anahtar)
    parti = adaylar[:limit]
    yeni = anahtar(parti[-1]) if parti else isaret
    return parti, yeni
''',
  tests=r'''
kaynak = [
    {"id": 5, "guncellendi": "2026-05-01T10:00:00"},
    {"id": 2, "guncellendi": "2026-05-01T10:00:00"},
    {"id": 9, "guncellendi": "2026-05-01T10:00:00"},
    {"id": 1, "guncellendi": "2026-05-01T09:59:59"},
    {"id": 7, "guncellendi": "2026-05-01T10:00:01"},
]
p1, w1 = artimli_cek(kaynak, None, 2)
assert [k["id"] for k in p1] == [1, 2], f"İlk parti zaman, sonra id sırasıyla [1, 2]; gelen {[k['id'] for k in p1]}"
assert w1 == ("2026-05-01T10:00:00", 2), f"Filigran son kaydın (guncellendi, id) demeti olmalı; gelen {w1}"
p2, w2 = artimli_cek(kaynak, w1, 2)
assert [k["id"] for k in p2] == [5, 9], f"Aynı saniyedeki kalan kayıtlar (5, 9) kaçırılmamalı; gelen {[k['id'] for k in p2]}"
p3, w3 = artimli_cek(kaynak, w2, 2)
assert [k["id"] for k in p3] == [7] and w3 == ("2026-05-01T10:00:01", 7), "Son parti"
p4, w4 = artimli_cek(kaynak, w3, 2)
assert p4 == [] and w4 == w3, "Yeni kayıt yoksa boş parti, filigran değişmez"
kaynak.append({"id": 3, "guncellendi": "2026-05-02T08:00:00"})
assert [k["id"] for k in artimli_cek(kaynak, w4, 10)[0]] == [3], "Sonradan gelen güncelleme yakalanmalı"
''',
  hints=['Karşılaştırma anahtarı olarak demet kullan: <code>(k["guncellendi"], k["id"])</code>; Python demetleri soldan sağa karşılaştırır.', 'Filigrandan büyük olanları filtrele, aynı anahtara göre sırala, ilk <code>limit</code> tanesini al.', 'Yeni filigran, partinin son elemanının anahtarı; parti boşsa eski işaret.'],
  why='Artımlı yükleme tüm tabloyu her seferinde taşımak yerine yalnız değişenleri alır (CDC’nin basit hâli). Yalnız zaman damgasıyla "büyüktür" kullanmak, limit aynı saniyedeki kayıtların ortasına denk geldiğinde geri kalanını kaçırır; "büyük-eşit" ise tekrar yükler. Bileşik (zaman, id) filigranı her kaydı kesin sıralar ve kayıpsız, tekrarsız devam etmeyi sağlar. SQL karşılığı: WHERE (guncellendi, id) > (:t, :id) ORDER BY guncellendi, id LIMIT :n (satır değeri karşılaştırması) — (guncellendi, id) üzerinde bileşik indeksle O(log n + limit). Burada bellek içi sıralama O(n log n). Filigran, yükleme başarıyla bittikten SONRA kalıcı olarak kaydedilmeli.',
  tags=['artımlı yükleme', 'watermark', 'CDC', 'demet karşılaştırma'], min=12),

dict(id='b-404', topic='Algoritma', diff=2, kind='predict',
  title='bisect_left ve bisect_right',
  q='<p>Sıralı fiyat listesinde ikili arama yapan bu kod ne yazdırır?</p>',
  code=r'''
from bisect import bisect_left, bisect_right

fiyat = [10, 20, 20, 20, 35]
print(bisect_left(fiyat, 20), bisect_right(fiyat, 20), bisect_left(fiyat, 25))
''',
  o=['1 4 4', '1 3 4', '2 4 4', '1 4 3'], a=0,
  hints=['bisect_left eşit elemanların en soluna, bisect_right en sağının bir sonrasına ekleme noktasını verir.', 'Listede olmayan 25 için ekleme noktası 20\'lerden sonra, 35\'ten öncedir.'],
  why='bisect_left(a, x) "x’ten küçük eleman sayısı", bisect_right(a, x) "x’e eşit ya da küçük eleman sayısı"dır; farkları (4 − 1 = 3) x’in kaç kez geçtiğini O(log n)’de verir. 25 listede yok; ekleme noktası 4. Fiyat aralığı sorguları (20 ≤ f < 35 kaç ürün?) bisect_left(35) − bisect_left(20) ile O(log n) yapılır. Python 3.10+’da key= parametresi de var.',
  tags=['bisect', 'ikili arama', 'O(log n)'], min=3),

dict(id='b-405', topic='Algoritma', diff=2, kind='rehberli',
  title='Mutabakat: toplamı tutan iki işlem',
  q='<p>Banka mutabakat ekibi, ekstrede tek kalem görünen bir tutarın iki ayrı işlemin toplamı olup olmadığını arıyor. <code>iki_toplam(tutarlar, hedef)</code> fonksiyonunu O(n) yaz: toplamı <code>hedef</code> olan iki farklı işlemin indekslerini <code>(i, j)</code> (<code>i &lt; j</code>) döndür; birden çok çift varsa <b>j\'si en küçük</b> olanı (ilk tamamlananı) seç; yoksa <code>None</code>. Tutarlar kuruş cinsinden tam sayıdır.</p>',
  guide=['Daha önce gördüğün tutarları <code>{tutar: indeks}</code> sözlüğünde tut.', 'Her j için tamamlayıcıyı hesapla: <code>hedef - tutarlar[j]</code>.', 'Tamamlayıcı sözlükte varsa <code>(sozluk[tamamlayici], j)</code> döndür.', 'Yoksa mevcut tutarı sözlüğe ekle (aynı tutar tekrar ederse ilk indeksi koru).', 'Döngü biterse <code>None</code>.'],
  example=r'''
# Benzer teknik: listede daha önce görülen ilk tekrarı bul (O(n))
gorulen = set()
for i, kod in enumerate(["A1", "B2", "C3", "B2", "A1"]):
    if kod in gorulen:
        print("ilk tekrar:", kod, "indeks", i)
        break
    gorulen.add(kod)
''',
  start=r'''
def iki_toplam(tutarlar, hedef):
    gorulen = {}
    for j, t in enumerate(tutarlar):
        # TODO 1: tamamlayıcıyı hesapla
        # TODO 2: sözlükte varsa (i, j) döndür
        # TODO 3: yoksa t'yi sözlüğe ekle (ilk indeksi koru)
        pass
    return ()
''',
  sol=r'''
def iki_toplam(tutarlar, hedef):
    gorulen = {}
    for j, t in enumerate(tutarlar):
        tamamlayici = hedef - t
        if tamamlayici in gorulen:
            return gorulen[tamamlayici], j
        gorulen.setdefault(t, j)
    return None
''',
  tests=r'''
import time
assert iki_toplam([1500, 2750, 990, 3100, 1250], 4000) == (1, 4), "2750 + 1250 = 4000 → (1, 4)"
assert iki_toplam([500, 500], 1000) == (0, 1), "Aynı tutar iki farklı işlemde olabilir"
assert iki_toplam([500], 1000) is None, "Bir işlem kendisiyle eşleşmemeli"
assert iki_toplam([100, 300, 200, 100, 300], 400) == (0, 1), "İlk tamamlanan çift (j en küçük)"
assert iki_toplam([], 5) is None
buyuk = list(range(0, 400000, 2))
t0 = time.perf_counter()
assert iki_toplam(buyuk, 799994) == (199998, 199999), "Büyük listede doğru çift"
assert time.perf_counter() - t0 < 1.0, "O(n) çözüm 1 sn altında bitmeli (iç içe döngü O(n²))"
''',
  hints=['İç içe döngü O(n²); her eleman için "eşini daha önce gördüm mü?" sorusunu O(1)\'de yanıtla.', 'Önce kontrol et, sonra ekle: böylece bir işlem kendisiyle eşleşmez.', '<code>gorulen.setdefault(t, j)</code> tekrar eden tutarda ilk indeksi korur.'],
  why='Hash tablosu tamamlayıcı aramasını O(1)’e indirir; toplam O(n) zaman, O(n) bellek. Önce-kontrol-sonra-ekle sırası hem kendiyle eşleşmeyi önler hem de j’si en küçük çifti bulur. Liste sıralıysa iki işaretçi yöntemi O(1) ek bellekle çalışır (ama sıralama O(n log n) ve orijinal indeksleri ayrıca tutmak gerekir). Kuruş cinsinden tam sayı kullanmak float eşitlik sorunlarını önler. Üç ya da daha çok kalemin toplamı (subset sum) NP-zordur; küçük n için DP ya da sınırlı arama gerekir.',
  tags=['hash map', 'two sum', 'O(n)', 'mutabakat'], min=6),

dict(id='b-406', topic='Algoritma', diff=2, kind='bug',
  title='İkili aramada sınır hatası',
  q='<p>Kodda bir hata var, bul ve düzelt. <code>ilk_buyuk_esit(a, x)</code> sıralı listede <code>x</code>\'ten büyük ya da eşit ilk elemanın indeksini döndürmeli (<code>bisect_left</code> ile aynı); böyle bir eleman yoksa <code>len(a)</code>. Fiyatı tüm ürünlerden yüksek bir sorguda yanlış indeks dönüyor.</p>',
  start=r'''
def ilk_buyuk_esit(a, x):
    lo, hi = 0, len(a) - 1
    while lo < hi:
        orta = (lo + hi) // 2
        if a[orta] < x:
            lo = orta + 1
        else:
            hi = orta
    return lo
''',
  sol=r'''
def ilk_buyuk_esit(a, x):
    lo, hi = 0, len(a)
    while lo < hi:
        orta = (lo + hi) // 2
        if a[orta] < x:
            lo = orta + 1
        else:
            hi = orta
    return lo
''',
  tests=r'''
import random
from bisect import bisect_left
a = [10, 20, 20, 35, 50]
assert ilk_buyuk_esit(a, 20) == 1, "İlk 20 indeks 1"
assert ilk_buyuk_esit(a, 5) == 0, "Hepsinden küçükse 0"
assert ilk_buyuk_esit(a, 99) == 5, "Hepsinden büyükse len(a) = 5 dönmeli; arama aralığı [0, len(a)) olmalı"
assert ilk_buyuk_esit([], 3) == 0, "Boş liste"
random.seed(1)
for _ in range(300):
    v = sorted(random.randint(0, 30) for _ in range(random.randint(0, 12)))
    x = random.randint(-2, 32)
    assert ilk_buyuk_esit(v, x) == bisect_left(v, x), f"{v}, x={x} için {bisect_left(v, x)} beklenir"
''',
  hints=['Cevap 0 ile len(a) arasında herhangi bir değer olabilir: n + 1 olası sonuç.', 'hi = len(a) - 1 ile başlarsan "hiçbiri" anlamındaki len(a) asla dönemez.', 'Yarı açık aralık kullan: <code>lo, hi = 0, len(a)</code>.'],
  why='İkili aramada değişmez (invariant) netleştirilmeli: cevap her zaman [lo, hi] aralığında. Olası cevaplar 0..n (n+1 değer) olduğundan hi = n başlamalıdır; hi = n − 1 son konumu dışlar. Döngü lo == hi olunca biter, O(log n). Bu tür sınır hataları rastgele girdiyi güvenilir bir referansla (bisect_left) karşılaştıran testlerle (property-based testing, ör. hypothesis) kolayca yakalanır. Üretimde kendi ikili aramanı yazmak yerine bisect modülünü kullan.',
  tags=['ikili arama', 'off-by-one', 'invariant'], min=4),

dict(id='b-407', topic='Algoritma', diff=2, kind='yaz',
  title='Toplantı odası rezervasyonlarını birleştir',
  q='<p>Toplantı odası rezervasyonları <code>[baslangic, bitis)</code> dakika aralıkları olarak geliyor (sırasız). <code>birlestir(araliklar)</code> fonksiyonunu yaz: çakışan ya da <b>uç uca değen</b> (<code>[60, 90]</code> ve <code>[90, 120]</code>) aralıkları birleştirip başlangıca göre sıralı liste döndür. Girdi listesini değiştirme.</p>',
  start=r'''
def birlestir(araliklar):
    pass
''',
  sol=r'''
def birlestir(araliklar):
    sonuc = []
    for bas, bit in sorted(araliklar):
        if sonuc and bas <= sonuc[-1][1]:
            sonuc[-1][1] = max(sonuc[-1][1], bit)
        else:
            sonuc.append([bas, bit])
    return sonuc
''',
  tests=r'''
g = [[540, 600], [60, 90], [90, 120], [100, 110], [570, 630], [700, 720]]
kopya = [x[:] for x in g]
assert birlestir(g) == [[60, 120], [540, 630], [700, 720]], f"Beklenen [[60, 120], [540, 630], [700, 720]]; gelen {birlestir(g)}"
assert g == kopya, "Girdi değiştirilmemeli"
assert birlestir([]) == [], "Boş liste"
assert birlestir([[1, 10], [2, 3]]) == [[1, 10]], "İçerilen aralık kapsayan aralıkta kalmalı (max ile bitiş)"
''',
  hints=['Önce başlangıca göre sırala; bu sayede yalnız son birleştirilen aralıkla karşılaştırman yeter.', 'Yeni aralığın başı son aralığın bitişinden küçük ya da eşitse birleştir: bitiş = max(iki bitiş).', 'sorted yeni liste döndürür; ama sonuca eklediğin alt listeleri yeni oluştur (<code>[bas, bit]</code>) ki girdi değişmesin.'],
  why='Sıralama sonrası tek geçiş: O(n log n) zaman, O(n) çıktı. max kullanmak [1,10] içine düşen [2,3] gibi aralıkların bitişi küçültmesini önler. Alt listeleri yeniden oluşturmak girdinin yanlışlıkla değişmesini (aliasing) engeller. Aynı kalıp: takvim boş zaman bulma, IP aralıklarını birleştirme, vardiya çakışma kontrolü. Çok sayıda ekleme/sorgu varsa aralık ağacı (interval tree) ya da sortedcontainers ile dinamik yapı kullanılır.',
  tags=['aralık birleştirme', 'sıralama', 'mülakat'], min=6),

dict(id='b-408', topic='Algoritma', diff=2, kind='yaz',
  title='En kârlı ardışık dönem (Kadane)',
  q='<p>Mağazanın günlük net kâr/zarar listesi var. <code>en_karli_donem(gunluk)</code> fonksiyonunu O(n) yaz: toplamı en büyük olan <b>ardışık</b> gün aralığını bul ve <code>(toplam, bas, bit)</code> döndür (bas ve bit dahil indeksler). Eşit toplamlı birden çok aralık varsa en erken başlayanı, o da eşitse en kısa olanı seç. Tüm günler zarardaysa en küçük zararlı tek günü döndür. Boş listede <code>ValueError</code>.</p>',
  start=r'''
def en_karli_donem(gunluk):
    pass
''',
  sol=r'''
def en_karli_donem(gunluk):
    if not gunluk:
        raise ValueError("Boş liste")
    en_iyi = None
    mevcut, bas = 0, 0
    for i, x in enumerate(gunluk):
        if mevcut < 0:              # negatif birikim geleceğe zarar: bugünden yeniden başla
            mevcut, bas = 0, i
        mevcut += x
        if en_iyi is None or mevcut > en_iyi[0] or (mevcut == en_iyi[0] and (bas, i) < en_iyi[1:]):
            en_iyi = (mevcut, bas, i)
    return en_iyi
''',
  tests=r'''
assert en_karli_donem([-2, 1, -3, 4, -1, 2, 1, -5, 4]) == (6, 3, 6), "Klasik örnek: 4 - 1 + 2 + 1 = 6, gün 3-6"
assert en_karli_donem([-8, -3, -6]) == (-3, 1, 1), "Hepsi zarardaysa en küçük zararlı gün"
assert en_karli_donem([5]) == (5, 0, 0)
assert en_karli_donem([2, -2, 2]) == (2, 0, 0), "Eşit toplamda en erken başlayan, sonra en kısa"
assert en_karli_donem([0, 0, 3]) == (3, 0, 2), "Eşit toplamda en erken başlayan aralık (0'dan)"
def _kaba(v):
    return max((sum(v[i:j + 1]), -i, -(j - i)) for i in range(len(v)) for j in range(i, len(v)))
import random
random.seed(3)
for _ in range(200):
    v = [random.randint(-6, 6) for _ in range(random.randint(1, 10))]
    t, b, s = en_karli_donem(v)
    k = _kaba(v)
    assert (t, -b, -(s - b)) == k, f"{v} için beklenen toplam {k[0]}, başlangıç {-k[1]}; gelen {(t, b, s)}"
try:
    en_karli_donem([])
    assert False, "Boş listede ValueError"
except ValueError:
    pass
''',
  hints=['Kadane: her gün için "burada biten en iyi toplam" ya önceki toplama eklenir ya da bugünden yeniden başlar.', 'Mevcut toplam negatife düşerse bir sonraki günden yeniden başla; sıfırsa devam etmek başlangıcı erken tutar.', 'En iyiyi güncellerken eşitlikte <code>(bas, bit)</code> demetini karşılaştırarak erken ve kısa olanı seç.'],
  why='Kadane algoritması her konumda "burada biten en iyi alt dizi"yi tek geçişte günceller: O(n) zaman, O(1) bellek; kaba kuvvet O(n²) (ön toplamlarla) ya da O(n³). Negatif birikim geleceğe yalnız zarar verir, bu yüzden sıfırlanır; sıfır birikimde devam etmek eşitlikte daha erken başlangıcı korur. Eşitlik kurallarını açıkça belirtmek iş raporlarında tekrarlanabilir sonuç verir. Rastgele testlerde kaba kuvvetle karşılaştırmak kenar durum hatalarını yakalar. Hisse alım-satım ("en iyi al-sat günü") problemi bunun fark dizisi üzerindeki hâlidir.',
  tags=['Kadane', 'dinamik programlama', 'O(n)'], min=10),

dict(id='b-409', topic='Algoritma', diff=3, kind='yaz',
  title='Depolar arası en kısa rota (Dijkstra)',
  q='<p>Lojistik ağında depolar ve aralarındaki yol süreleri (dakika, yönlü) var. <code>en_kisa_rota(ag, kaynak, hedef)</code> fonksiyonunu <code>heapq</code> ile Dijkstra algoritmasıyla yaz: <code>ag</code> = <code>{"A": [("B", 7), ("C", 9)], ...}</code>. <code>(toplam_sure, [kaynak, ..., hedef])</code> döndür; hedefe ulaşılamıyorsa <code>(math.inf, [])</code>. Kaynak = hedef ise <code>(0, [kaynak])</code>. Bazı düğümler yalnız hedef olarak geçebilir (sözlükte anahtarı olmayabilir).</p>',
  start=r'''
import heapq
import math

def en_kisa_rota(ag, kaynak, hedef):
    pass
''',
  sol=r'''
import heapq
import math

def en_kisa_rota(ag, kaynak, hedef):
    mesafe = {kaynak: 0}
    onceki = {}
    yigin = [(0, kaynak)]
    while yigin:
        d, u = heapq.heappop(yigin)
        if u == hedef:
            yol = [u]
            while u in onceki:
                u = onceki[u]
                yol.append(u)
            return d, yol[::-1]
        if d > mesafe.get(u, math.inf):
            continue
        for v, w in ag.get(u, []):
            yeni = d + w
            if yeni < mesafe.get(v, math.inf):
                mesafe[v] = yeni
                onceki[v] = u
                heapq.heappush(yigin, (yeni, v))
    return math.inf, []
''',
  tests=r'''
ag = {
    "Ankara": [("Eskişehir", 140), ("Konya", 160), ("Kayseri", 190)],
    "Eskişehir": [("Bursa", 90), ("İstanbul", 230)],
    "Konya": [("Antalya", 190)],
    "Bursa": [("İstanbul", 100), ("İzmir", 210)],
    "Kayseri": [],
}
assert en_kisa_rota(ag, "Ankara", "İstanbul") == (330, ["Ankara", "Eskişehir", "Bursa", "İstanbul"]), "Ankara→İstanbul: Bursa üzerinden 140+90+100 = 330 dk, doğrudan Eskişehir→İstanbul (370) daha uzun"
s, yol = en_kisa_rota(ag, "Ankara", "İzmir")
assert (s, yol) == (440, ["Ankara", "Eskişehir", "Bursa", "İzmir"]), f"Ankara→İzmir 140+90+210 = 440; gelen {(s, yol)}"
assert en_kisa_rota(ag, "Kayseri", "İzmir") == (math.inf, []), "Ulaşılamayan hedef (inf, [])"
assert en_kisa_rota(ag, "Konya", "Konya") == (0, ["Konya"]), "Kaynak = hedef"
ag2 = {"A": [("B", 10), ("C", 1)], "C": [("B", 2)], "B": [("D", 1)]}
assert en_kisa_rota(ag2, "A", "D") == (4, ["A", "C", "B", "D"]), "Doğrudan kenar (10) yerine dolaylı yol (1+2) seçilmeli"
''',
  hints=['Öncelik kuyruğunda <code>(mesafe, düğüm)</code> tut; <code>heappop</code> her zaman en yakın düğümü verir.', 'Kuyruktan çıkan bayat kayıtları (<code>d &gt; mesafe[u]</code>) atla; daha iyi bir yol bulunduğunda <code>onceki[v] = u</code> kaydet.', 'Hedef kuyruktan çıktığında yolu <code>onceki</code> zincirini geriye izleyerek kur ve ters çevir.'],
  why='Dijkstra negatif olmayan ağırlıklı çizgede en kısa yolu bulur: ikili yığınla O((V + E) log V). Hedef kuyruktan ilk çıktığında mesafesi kesinleşmiştir, erken çıkmak gereksiz işi önler. "Tembel silme" (bayat kayıtları atlama) heapq’da azalt-anahtar işlemi olmadığı için standart kalıptır. Negatif kenar varsa Bellman-Ford, tüm çiftler için Floyd-Warshall, iyi bir sezgisel varsa A* kullanılır; üretimde networkx.dijkstra_path ya da OR-Tools (araç rotalama) tercih edilir.',
  tags=['Dijkstra', 'heapq', 'çizge', 'en kısa yol'], min=15),

dict(id='b-410', topic='Algoritma', diff=3, kind='yaz',
  title='Kargo aracına en değerli yük (0/1 sırt çantası)',
  q='<p>Kargo aracının taşıma kapasitesi <code>kapasite</code> kg (tam sayı). Her paketin ağırlığı ve teslimat ücreti var; paketler bölünemez. <code>yuk_sec(agirlik, deger, kapasite)</code> fonksiyonunu dinamik programlamayla yaz: toplam ağırlık kapasiteyi aşmadan toplam değeri en büyük yapan paketleri seç ve <code>(en_buyuk_deger, secilen_indeksler_artan)</code> döndür. Açgözlü (değer/ağırlık oranına göre) seçim her zaman doğru sonuç vermez.</p>',
  start=r'''
def yuk_sec(agirlik, deger, kapasite):
    pass
''',
  sol=r'''
def yuk_sec(agirlik, deger, kapasite):
    n = len(agirlik)
    dp = [[0] * (kapasite + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        a, d = agirlik[i - 1], deger[i - 1]
        for c in range(kapasite + 1):
            dp[i][c] = dp[i - 1][c]
            if a <= c and dp[i - 1][c - a] + d > dp[i][c]:
                dp[i][c] = dp[i - 1][c - a] + d
    secilen, c = [], kapasite
    for i in range(n, 0, -1):
        if dp[i][c] != dp[i - 1][c]:
            secilen.append(i - 1)
            c -= agirlik[i - 1]
    return dp[n][kapasite], sorted(secilen)
''',
  tests=r'''
assert yuk_sec([10, 20, 30], [60, 100, 120], 50) == (220, [1, 2]), "20 + 30 kg → 100 + 120 = 220 (açgözlü oran seçimi 160 verirdi)"
deger, sec = yuk_sec([1, 3, 4, 5], [1, 4, 5, 7], 7)
assert deger == 9 and sum([1, 3, 4, 5][i] for i in sec) <= 7 and sum([1, 4, 5, 7][i] for i in sec) == 9, f"Kapasite 7: en iyi değer 9; gelen {(deger, sec)}"
assert yuk_sec([5, 6], [10, 20], 4) == (0, []), "Hiçbir paket sığmıyorsa (0, [])"
assert yuk_sec([], [], 10) == (0, []), "Paket yoksa (0, [])"
import itertools, random
random.seed(11)
for _ in range(60):
    n = random.randint(1, 8)
    ag = [random.randint(1, 9) for _ in range(n)]
    dg = [random.randint(1, 20) for _ in range(n)]
    K = random.randint(0, 25)
    en_iyi = max(sum(dg[i] for i in alt) for r in range(n + 1) for alt in itertools.combinations(range(n), r) if sum(ag[i] for i in alt) <= K)
    d, s = yuk_sec(ag, dg, K)
    assert d == en_iyi, f"{ag}, {dg}, K={K}: en iyi {en_iyi}, gelen {d}"
    assert sum(ag[i] for i in s) <= K and sum(dg[i] for i in s) == d and s == sorted(set(s)), "Seçilen indeksler kapasiteye uymalı ve değeri vermeli"
''',
  hints=['<code>dp[i][c]</code>: ilk i paketle c kapasitede ulaşılabilecek en büyük değer.', 'Her paket için iki seçenek: alma (<code>dp[i-1][c]</code>) ya da al (<code>dp[i-1][c - a] + d</code>, a ≤ c ise).', 'Seçimi geri izlemek için sondan başa git: <code>dp[i][c] != dp[i-1][c]</code> ise i−1. paket seçilmiştir, c\'den ağırlığını düş.'],
  why='0/1 sırt çantası NP-zordur ama tam sayı kapasitede sözde-polinom DP ile O(n·K) zaman ve bellekte çözülür. Tam tablo, hangi paketlerin seçildiğini geri izlemeyi sağlar; yalnız değer gerekseydi tek boyutlu dizi (kapasiteyi sondan başa dolaşarak) O(K) bellek yeterdi. Açgözlü oran yöntemi yalnız bölünebilir (kesirli) sırt çantasında optimaldir. K çok büyükse (ör. gram cinsinden milyonlar) DP pratik olmaz; o zaman dal-sınır (branch and bound), tamsayı programlama (OR-Tools, PuLP) ya da yaklaşık algoritmalar kullanılır.',
  tags=['sırt çantası', 'dinamik programlama', 'geri izleme'], min=15),
]
