START = 141
TASKS = [
dict(topic='Listeler', diff=2, t='order',
  title='Fiyata göre ürün sırası',
  q='<p>Ürünleri pahalıdan ucuza sıralayıp adlarını yazdıran kodun satırlarını sırala. Beklenen çıktı:</p><pre class="out">Fiyat sırası: Kahve Çay Şeker</pre>',
  lines=['urunler = [("Çay", 64.9), ("Kahve", 189.0), ("Şeker", 42.5)]', 'sirali = sorted(urunler, key=lambda u: u[1], reverse=True)', 'adlar = [u[0] for u in sirali]', 'adlar.insert(0, "Fiyat sırası:")', 'print(" ".join(adlar))'],
  expect='Fiyat sırası: Kahve Çay Şeker\n',
  hint='Başlık metni listenin başına, adlar oluşturulduktan sonra eklenir.',
  hints=['sorted yeni liste döndürür; key ile neye göre sıralanacağını, reverse ile yönünü belirtirsin.'],
  why='sorted(..., key=lambda u: u[1], reverse=True) demetleri ikinci elemana (fiyata) göre azalan sıralar ve yeni liste döndürür; orijinal liste değişmez. Liste kavrayışı (comprehension) her demetten adı alır. insert(0, ...) başa ekler, join boşlukla birleştirir. Alternatif: urunler.sort(...) listeyi yerinde sıralar ve None döndürür; sonucu bir değişkene atamak yaygın bir hatadır.',
  tags=['sorted', 'key', 'lambda', 'insert'], min=3),

dict(topic='Listeler', diff=1, kind='rehberli',
  title='Vardiya listesini güncelle',
  q='<p>Üretim bandının vardiya listesinde değişiklik var. <code>vardiya_guncelle(liste, gelen, ayrilan)</code> fonksiyonunu yaz:</p><ul><li>Orijinal listeyi <b>değiştirme</b>; kopyası üzerinde çalış.</li><li><code>ayrilan</code> listede varsa çıkar (yoksa hata verme).</li><li><code>gelen</code> listede yoksa ekle (aynı kişi iki kez olmasın).</li><li>Alfabetik sıralı yeni listeyi döndür.</li></ul>',
  guide=['liste.copy() ile bir kopya oluştur.', 'if ayrilan in yeni: yeni.remove(ayrilan)', 'if gelen not in yeni: yeni.append(gelen)', 'yeni.sort() ile sırala ve döndür.'],
  example=r'''
# Benzer teknik: kopya üzerinde güvenli ekleme/çıkarma
raf = ["kalem", "silgi"]
yeni_raf = raf.copy()
if "silgi" in yeni_raf:
    yeni_raf.remove("silgi")
if "defter" not in yeni_raf:
    yeni_raf.append("defter")
print(raf, sorted(yeni_raf))
''',
  start=r'''
def vardiya_guncelle(liste, gelen, ayrilan):
    yeni = liste.copy()
    # TODO: ayrilan listede varsa çıkar
    # TODO: gelen listede yoksa ekle
    # TODO: sırala
    return yeni
''',
  sol=r'''
def vardiya_guncelle(liste, gelen, ayrilan):
    yeni = liste.copy()
    if ayrilan in yeni:
        yeni.remove(ayrilan)
    if gelen not in yeni:
        yeni.append(gelen)
    yeni.sort()
    return yeni
''',
  tests=r'''
orj = ["Can", "Ayşe", "Mert"]
assert vardiya_guncelle(orj, "Deniz", "Mert") == ["Ayşe", "Can", "Deniz"], "Mert çıkmalı, Deniz eklenmeli, sonuç sıralı olmalı"
assert orj == ["Can", "Ayşe", "Mert"], "Orijinal liste DEĞİŞMEMELİ: kopya üzerinde çalış"
assert vardiya_guncelle(["Ali"], "Ali", "Zeynep") == ["Ali"], "Zaten olan kişi tekrar eklenmemeli; olmayan kişiyi çıkarmak hata vermemeli"
''',
  hints=['remove listede olmayan elemanda ValueError verir; önce in ile kontrol et.', 'sort() yerinde sıralar ve None döndürür; return yeni.sort() yazma.', 'if gelen not in yeni: yeni.append(gelen)'],
  why='Fonksiyona gelen listeyi değiştirmek çağıran kodda sürpriz yan etkiye yol açar; copy() ile çalışmak güvenlidir. remove olmayan eleman için ValueError fırlattığı için önce in ile kontrol edilir. sort() None döndürdüğünden önce sıralayıp sonra listeyi döndürürüz; alternatif olarak return sorted(yeni). Tekrarsızlık önemliyse küme (set) kullanmak da bir seçenektir ama sıra bilgisi kaybolur.',
  tags=['copy', 'remove', 'append', 'sort', 'İK'], min=5),

dict(topic='Listeler', diff=2, kind='rehberli',
  title='Hareketli ortalama',
  q='<p>Anadolu Market günlük satışlarındaki dalgalanmayı yumuşatmak için <b>hareketli ortalama</b> (moving average) hesaplanıyor. <code>hareketli_ortalama(degerler, n)</code> fonksiyonunu yaz: art arda gelen her <code>n</code> elemanlık pencerenin ortalamasını (2 ondalık) içeren listeyi döndürsün. <code>n</code> liste uzunluğundan büyükse boş liste döndür.</p><p>Örnek: <code>[10, 20, 30, 40]</code>, n=2 → <code>[15.0, 25.0, 35.0]</code></p>',
  guide=['Pencere sayısı len(degerler) - n + 1 kadardır.', 'for i in range(...) ile her pencerenin başlangıç indeksini dolaş.', 'Pencere: degerler[i:i + n]', 'Ortalamayı round(sum(pencere) / n, 2) ile ekle.'],
  example=r'''
# Benzer teknik: kayan pencere ile ardışık toplamlar
gunluk = [3, 5, 2, 8, 6]
for i in range(len(gunluk) - 3 + 1):
    pencere = gunluk[i:i + 3]
    print(pencere, sum(pencere))
''',
  start=r'''
def hareketli_ortalama(degerler, n):
    sonuc = []
    # TODO: her pencere başlangıcı için döngü kur
    # TODO: pencereyi dilimle, ortalamasını ekle
    return sonuc
''',
  sol=r'''
def hareketli_ortalama(degerler, n):
    sonuc = []
    for i in range(len(degerler) - n + 1):
        pencere = degerler[i:i + n]
        sonuc.append(round(sum(pencere) / n, 2))
    return sonuc
''',
  tests=r'''
assert hareketli_ortalama([10, 20, 30, 40], 2) == [15.0, 25.0, 35.0], "n=2 için 3 pencere: [15.0, 25.0, 35.0]"
assert hareketli_ortalama([5, 7, 9], 3) == [7.0], "n = uzunluk ise tek pencere olmalı"
assert hareketli_ortalama([1, 2, 2], 2) == [1.5, 2.0], "Ondalıklı ortalamalar: [1.5, 2.0]"
assert hareketli_ortalama([4, 8], 5) == [], "n uzunluktan büyükse boş liste dönmeli"
''',
  hints=['Son pencerenin başlangıcı len - n indeksindedir; range bitişi hariç tuttuğu için +1 gerekir.', 'range(len(degerler) - n + 1) negatifse döngü hiç çalışmaz: boş liste kendiliğinden döner.', 'sonuc.append(round(sum(degerler[i:i + n]) / n, 2))'],
  why='Kayan pencere (sliding window) dilimleme ile kolayca kurulur. range(len - n + 1) tam pencere sayısını verir; n büyükse aralık boş kalır ve ek kontrol gerekmez. Her pencerede sum çağırmak O(n·k) maliyetlidir; çok büyük verilerde bir önceki toplamdan çıkan elemanı çıkarıp gelen elemanı ekleyerek O(n)\'e inilir. pandas\'ta aynı iş seri.rolling(n).mean() ile yapılır.',
  tags=['dilimleme', 'range', 'pencere', 'ortalama'], min=6),

dict(topic='Listeler', diff=2, kind='yaz',
  title='Sayfalama (pagination)',
  q='<p>Anadolu Bank internet şubesi işlem geçmişini sayfa sayfa gösteriyor. <code>sayfa_getir(kayitlar, sayfa, boyut)</code> fonksiyonunu yaz:</p><ul><li><code>sayfa</code> 1\'den başlar.</li><li>İstenen sayfadaki en fazla <code>boyut</code> kaydı liste olarak döndür.</li><li><code>sayfa</code> 1\'den küçükse ya da kayıt kalmadıysa boş liste döndür.</li></ul>',
  start=r'''
def sayfa_getir(kayitlar, sayfa, boyut):
    # buraya yaz
    pass
''',
  sol=r'''
def sayfa_getir(kayitlar, sayfa, boyut):
    if sayfa < 1:
        return []
    bas = (sayfa - 1) * boyut
    return kayitlar[bas:bas + boyut]
''',
  tests=r'''
k = list(range(1, 24))
assert sayfa_getir(k, 1, 10) == list(range(1, 11)), "1. sayfa 1..10 kayıtlarını vermeli"
assert sayfa_getir(k, 3, 10) == [21, 22, 23], "Son sayfa eksik dolu olabilir: [21, 22, 23]"
assert sayfa_getir(k, 4, 10) == [], "Kayıt kalmadıysa boş liste"
assert sayfa_getir(k, 0, 10) == [], "Sayfa 0 geçersiz: boş liste (negatif dilim tuzağına dikkat)"
''',
  hints=['Başlangıç indeksi = (sayfa - 1) * boyut', 'Dilimleme liste dışına taşınca hata vermez, eksik/boş döner.'],
  why='Sayfa n\'nin ilk kaydı (n - 1) * boyut indeksindedir; dilimleme sınırı aşınca hata vermediği için son sayfa ve olmayan sayfa kendiliğinden doğru çalışır. sayfa = 0 kontrolü şarttır: aksi halde bas = -10 olur ve negatif dilim listenin sonundan kayıt döndürür — sessiz bir hata. Veritabanında aynı mantık LIMIT boyut OFFSET bas ile yapılır.',
  tags=['dilimleme', 'sayfalama', 'kenar durum'], min=5),

dict(topic='Listeler', diff=3, kind='yaz',
  title='İki sıralı listeyi birleştir',
  q='<p>İki şubenin işlem saatleri ayrı ayrı <b>sıralı</b> listelerde tutuluyor. <code>sirali_birlestir(a, b)</code> fonksiyonunu yaz: iki listeyi tek bir sıralı listede birleştirsin. <code>sort()</code>/<code>sorted()</code> KULLANMA; iki işaretçi (two pointers) yöntemiyle her adımda iki listenin önündeki küçük elemanı al.</p>',
  start=r'''
def sirali_birlestir(a, b):
    # buraya yaz
    pass
''',
  sol=r'''
def sirali_birlestir(a, b):
    sonuc = []
    i = j = 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            sonuc.append(a[i])
            i += 1
        else:
            sonuc.append(b[j])
            j += 1
    sonuc.extend(a[i:])
    sonuc.extend(b[j:])
    return sonuc
''',
  tests=r'''
assert sirali_birlestir([1, 4, 9], [2, 3, 10, 12]) == [1, 2, 3, 4, 9, 10, 12], "Karışık birleşim sıralı olmalı"
assert sirali_birlestir([], [5, 6]) == [5, 6], "Bir liste boşsa diğeri aynen dönmeli"
assert sirali_birlestir([2, 2], [2]) == [2, 2, 2], "Eşit elemanların hepsi korunmalı"
assert sirali_birlestir([], []) == [], "İki boş liste: boş sonuç"
assert "sort" not in __source__, "Bu görevde sort/sorted kullanmadan çöz"
''',
  hints=['i ve j adlı iki indeks tut; ikisi de 0\'dan başlar.', 'Döngü biri bitince durur; kalan elemanları extend ile sona ekle.', 'if a[i] <= b[j]: sonuc.append(a[i]); i += 1'],
  why='Her adımda yalnızca iki listenin ön elemanı karşılaştırılır, bu yüzden toplam iş O(len(a) + len(b)) olur; sorted(a + b) ise O(n log n). Döngü bittiğinde listelerden birinde kalan elemanlar zaten sıralı olduğundan doğrudan eklenir. Bu, birleştirmeli sıralamanın (merge sort) çekirdeğidir. Hazır alternatif: heapq.merge(a, b) aynı işi tembel (lazy) yapar.',
  tags=['two pointers', 'while', 'algoritma', 'merge'], min=9),

dict(topic='Listeler', diff=2, kind='bug',
  title='Döngüde silinen iptaller',
  q='<p>Kodda bir hata var, bul ve düzelt. <code>iptalleri_cikar(tutarlar)</code> negatif tutarlı (iptal edilmiş) işlemleri çıkarıp kalanları döndürmeli. Ama art arda gelen iki iptalden biri listede kalıyor.</p>',
  start=r'''
def iptalleri_cikar(tutarlar):
    for t in tutarlar:
        if t < 0:
            tutarlar.remove(t)
    return tutarlar
''',
  sol=r'''
def iptalleri_cikar(tutarlar):
    return [t for t in tutarlar if t >= 0]
''',
  tests=r'''
assert iptalleri_cikar([100, -5, -7, 40]) == [100, 40], "Art arda iki iptal (-5, -7) de çıkmalı"
assert iptalleri_cikar([-1, -2, -3]) == [], "Hepsi iptalse boş liste"
assert iptalleri_cikar([10, 20]) == [10, 20], "İptal yoksa liste aynı kalmalı"
''',
  hints=['Üzerinde dolaştığın listeyi döngü içinde küçültürsen ne olur? Python indeksle ilerler.', 'Yeni bir liste oluştur: koşulu sağlayanları topla.'],
  why='for döngüsü içte bir indeksle ilerler; -5 silinince -7 onun yerine kayar ve döngü bir sonraki indekse geçtiği için -7 atlanır. Üzerinde dolaşılan listeyi değiştirmek bu yüzden tehlikelidir. Çözüm yeni liste oluşturmak (comprehension) ya da kopya üzerinde dolaşmaktır: for t in tutarlar[:]. Comprehension ayrıca orijinal listeyi değiştirmediği için yan etkisizdir.',
  tags=['remove', 'comprehension', 'döngüde değişiklik'], min=4),

# ---------------- Demet ve Küme ----------------
dict(topic='Demet ve Küme', diff=1, t='predict',
  title='Demet açma ve tek elemanlı demet',
  q='<p>Bu kod ne yazdırır?</p>',
  code=r'''
a, b = 3, 5
a, b = b, a + b
print(a, b)
x = (7,)
y = (7)
print(type(x).__name__, type(y).__name__)
''',
  o=['5 8\ntuple tuple', '5 10\ntuple int', '5 8\ntuple int', '5 8\nint int'], a=2,
  hints=['Sağ taraf önce tamamen hesaplanır, sonra atama yapılır.', 'Demeti oluşturan parantez değil virgüldür.'],
  why='a, b = b, a + b satırında sağ taraf eski değerlerle (5, 3 + 5) hesaplanır, sonra atanır: a = 5, b = 8. Bu yüzden geçici değişkene gerek kalmadan takas yapılabilir. (7,) virgül içerdiği için demettir; (7) ise sadece parantez içindeki tam sayıdır. Tek elemanlı demet yazarken sondaki virgülü unutmak yaygın bir hatadır.',
  tags=['tuple', 'unpacking', 'takas'], min=2),

dict(topic='Demet ve Küme', diff=2, t='predict',
  title='Küme işlemleriyle müşteri analizi',
  q='<p>Ocak ve şubat aylarında alışveriş yapan müşteriler kümelerde. Bu kod ne yazdırır?</p>',
  code=r'''
ocak = {"Ali", "Ayşe", "Can"}
subat = {"Ayşe", "Can", "Deniz"}
print(sorted(ocak & subat))
print(sorted(ocak - subat), len(ocak | subat))
print(sorted(ocak ^ subat))
''',
  o=["['Ayşe', 'Can']\n['Ali'] 4\n['Ali', 'Deniz']", "['Ayşe', 'Can']\n['Ali'] 6\n['Ali', 'Deniz']", "['Ayşe', 'Can']\n['Deniz'] 4\n['Ali', 'Deniz']", "['Ali', 'Deniz']\n['Ali'] 4\n['Ayşe', 'Can']"], a=0,
  hints=['& kesişim, | birleşim, - fark, ^ simetrik fark.', 'Birleşimde ortak elemanlar bir kez sayılır.'],
  why='& iki ayda da gelenleri (sadık müşteriler: Ayşe, Can), ocak - subat ocakta gelip şubatta gelmeyenleri (kayıp: Ali) verir. | birleşimde tekrarlar bir kez sayılır: 4 kişi. ^ yalnızca bir ayda gelenleri verir: Ali ve Deniz. Kümeler sırasız olduğu için çıktıyı tutarlı yapmak adına sorted kullanıldı. Metot karşılıkları: intersection, union, difference, symmetric_difference.',
  tags=['set', 'kesişim', 'fark', 'birleşim'], min=3),

dict(topic='Demet ve Küme', diff=1, kind='rehberli',
  title='Müşteri kaybı raporu',
  q='<p>Anadolu Market pazarlama ekibi aylık müşteri hareketini görmek istiyor. <code>musteri_hareketi(gecen_ay, bu_ay)</code> fonksiyonunu yaz. Parametreler müşteri adlarının <b>listeleridir</b> (tekrar içerebilir). Şu anahtarlara sahip sözlük döndür, her değer <b>alfabetik sıralı liste</b> olsun:</p><ul><li><code>"kayip"</code>: geçen ay gelip bu ay gelmeyenler</li><li><code>"yeni"</code>: bu ay gelip geçen ay gelmeyenler</li><li><code>"sadik"</code>: iki ayda da gelenler</li></ul>',
  guide=['İki listeyi set() ile kümeye çevir (tekrarlar gider).', 'Fark (-) ile kayıp ve yeni müşterileri bul.', 'Kesişim (&) ile sadık müşterileri bul.', 'Her kümeyi sorted() ile listeye çevirip sözlüğe koy.'],
  example=r'''
# Benzer teknik: iki sınıfın ders seçimlerini karşılaştırmak
a_sinifi = set(["mat", "fizik", "kimya", "mat"])
b_sinifi = set(["mat", "biyoloji"])
print(sorted(a_sinifi - b_sinifi), sorted(a_sinifi & b_sinifi))
''',
  start=r'''
def musteri_hareketi(gecen_ay, bu_ay):
    once = set(gecen_ay)
    simdi = set(bu_ay)
    # TODO: kayıp, yeni ve sadık kümelerini hesapla
    return {"kayip": [], "yeni": [], "sadik": []}
''',
  sol=r'''
def musteri_hareketi(gecen_ay, bu_ay):
    once = set(gecen_ay)
    simdi = set(bu_ay)
    return {
        "kayip": sorted(once - simdi),
        "yeni": sorted(simdi - once),
        "sadik": sorted(once & simdi),
    }
''',
  tests=r'''
r = musteri_hareketi(["Ali", "Ayşe", "Can", "Ali"], ["Can", "Deniz", "Ayşe", "Ece"])
assert r["kayip"] == ["Ali"], "Ali geçen ay geldi, bu ay gelmedi: kayıp"
assert r["yeni"] == ["Deniz", "Ece"], "Deniz ve Ece yeni müşteri (alfabetik)"
assert r["sadik"] == ["Ayşe", "Can"], "Ayşe ve Can iki ayda da geldi: sadık"
assert musteri_hareketi([], ["X"]) == {"kayip": [], "yeni": ["X"], "sadik": []}, "Geçen ay boşsa herkes yeni"
''',
  hints=['Küme farkı: a - b, kesişim: a & b', 'sorted(kume) sıralı bir LİSTE döndürür.', '"kayip": sorted(once - simdi)'],
  why='Üyelik karşılaştırma sorularında kümeler hem kısa hem hızlıdır: fark ve kesişim tek operatördür, in kontrolü O(1)\'dir. Listelerle aynı iş [m for m in gecen_ay if m not in bu_ay] gibi döngülerle yapılabilir ama tekrarları ayrıca temizlemek gerekir ve büyük listelerde yavaştır. Kümeler sırasız olduğundan raporlamada sorted ile sabit sıra verilir.',
  tags=['set', 'fark', 'kesişim', 'pazarlama'], min=5),

dict(topic='Demet ve Küme', diff=2, kind='rehberli',
  title='En geç teslimat kaydı',
  q='<p>Lojistik ekibi teslimat kayıtlarını <code>(kargo_no, sehir, gun)</code> demetleri olarak tutuyor. <code>en_gec_teslimat(kayitlar)</code> fonksiyonunu yaz:</p><ul><li>Teslim süresi (<code>gun</code>) en uzun olan kaydı bul; eşitlikte listede <b>ilk gelen</b> kazanır.</li><li><code>"KRG-104 (Van): 6 gün"</code> biçiminde metin döndür.</li><li>Liste boşsa <code>None</code> döndür.</li></ul>',
  guide=['Önce boş liste kontrolü yap.', 'max(kayitlar, key=lambda k: k[2]) en büyük gün değerine sahip demeti verir (eşitlikte ilkini).', 'Bulunan demeti üç değişkene aç: no, sehir, gun = ...', 'f-string ile metni oluştur.'],
  example=r'''
# Benzer teknik: demet listesinde en düşük puanlı kaydı bulmak
ogrenciler = [("Ece", 78), ("Can", 64), ("Mert", 64)]
ad, puan = min(ogrenciler, key=lambda o: o[1])
print(f"{ad}: {puan}")   # Can: 64 (eşitlikte ilk gelen)
''',
  start=r'''
def en_gec_teslimat(kayitlar):
    # TODO: boş liste kontrolü
    # TODO: max + key ile en uzun süreli kaydı bul
    # TODO: demeti aç ve metni döndür
    pass
''',
  sol=r'''
def en_gec_teslimat(kayitlar):
    if not kayitlar:
        return None
    no, sehir, gun = max(kayitlar, key=lambda k: k[2])
    return f"{no} ({sehir}): {gun} gün"
''',
  tests=r'''
k = [("KRG-101", "Ankara", 2), ("KRG-104", "Van", 6), ("KRG-107", "Kars", 6), ("KRG-110", "İzmir", 1)]
assert en_gec_teslimat(k) == "KRG-104 (Van): 6 gün", "En uzun 6 gün; eşitlikte listede ilk gelen KRG-104 seçilmeli"
assert en_gec_teslimat([("KRG-1", "Bursa", 3)]) == "KRG-1 (Bursa): 3 gün", "Tek kayıt kendisini döndürmeli"
assert en_gec_teslimat([]) is None, "Boş listede None dönmeli (max boş listede hata verir)"
''',
  hints=['max fonksiyonu key parametresiyle neye göre karşılaştıracağını öğrenir.', 'max boş listede ValueError verir; önce if not kayitlar kontrolü.', 'no, sehir, gun = max(kayitlar, key=lambda k: k[2])'],
  why='max(..., key=...) tüm demeti döndürür ama karşılaştırmayı yalnızca key\'in verdiği değere göre yapar; eşitlikte ilk karşılaştığını korur. Demet açma (unpacking) ile alanlara anlamlı adlar verilir, k[0] k[1] gibi sihirli indekslerden kurtulunur. Alternatif: max(kayitlar, key=operator.itemgetter(2)) ya da max\'ın default=None parametresiyle boş liste kontrolü.',
  tags=['tuple', 'max', 'key', 'unpacking', 'lojistik'], min=5),
]
