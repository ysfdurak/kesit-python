START = 151
TASKS = [
dict(topic='Demet ve Küme', diff=2, kind='yaz',
  title='Mükerrer işlem numaraları',
  q='<p>Anadolu Bank\'ın gün sonu dosyasında bazı işlem numaraları birden fazla kez geçiyor (mükerrer kayıt). <code>mukerrerler(islem_nolari)</code> fonksiyonunu yaz: birden fazla geçen numaraları <b>küçükten büyüğe sıralı liste</b> olarak döndürsün; her numara sonuçta bir kez yer alsın. Kümelerle çöz (<code>count()</code> kullanma; büyük listelerde çok yavaştır).</p>',
  start=r'''
def mukerrerler(islem_nolari):
    # buraya yaz
    pass
''',
  sol=r'''
def mukerrerler(islem_nolari):
    gorulen = set()
    tekrar = set()
    for no in islem_nolari:
        if no in gorulen:
            tekrar.add(no)
        else:
            gorulen.add(no)
    return sorted(tekrar)
''',
  tests=r'''
assert mukerrerler([501, 502, 501, 503, 502, 501]) == [501, 502], "501 ve 502 tekrar ediyor; her biri bir kez, sıralı"
assert mukerrerler([1, 2, 3]) == [], "Tekrar yoksa boş liste"
assert mukerrerler([]) == [], "Boş liste için boş sonuç"
assert mukerrerler([9, 9]) == [9], "İki kez geçen tek numara"
assert ".count(" not in __source__, "count() kullanmadan, görülenler kümesiyle çöz"
''',
  hints=['İki küme tut: şimdiye kadar görülenler ve tekrar edenler.', 'Bir numara görülenlerdeyse tekrar kümesine ekle, değilse görülenlere ekle.'],
  why='Kümede üyelik testi (in) ortalama O(1) olduğu için liste tek geçişte (O(n)) taranır. [x for x in liste if liste.count(x) > 1] çözümü her eleman için listeyi baştan saydığından O(n²)\'dir; 100 bin kayıtta saniyeler sürer. Tekrar kümesi aynı numarayı bir kez tuttuğu için sonuçta mükerrer yazım olmaz. Alternatif: collections.Counter ile sayıp sayısı > 1 olanları seçmek (orta seviyede).',
  tags=['set', 'tekrar', 'performans', 'bankacılık'], min=5),

dict(topic='Demet ve Küme', diff=1, kind='yaz',
  title='Depo robotunun yolu',
  q='<p>Anadolu Market deposunda raflar ızgara üzerinde <code>(x, y)</code> demetleriyle konumlanıyor. Robot yalnızca yatay ve dikey hareket edebildiği için iki nokta arası mesafe <b>Manhattan mesafesi</b>dir: <code>|x1 - x2| + |y1 - y2|</code>.</p><p><code>rota_uzunlugu(duraklar)</code> fonksiyonunu yaz: art arda gelen duraklar arasındaki mesafelerin toplamını döndürsün. Tek durak veya boş listede 0.</p>',
  start=r'''
def rota_uzunlugu(duraklar):
    # buraya yaz
    pass
''',
  sol=r'''
def rota_uzunlugu(duraklar):
    toplam = 0
    for i in range(len(duraklar) - 1):
        x1, y1 = duraklar[i]
        x2, y2 = duraklar[i + 1]
        toplam += abs(x1 - x2) + abs(y1 - y2)
    return toplam
''',
  tests=r'''
assert rota_uzunlugu([(0, 0), (3, 4)]) == 7, "(0,0) → (3,4): 3 + 4 = 7"
assert rota_uzunlugu([(0, 0), (2, 0), (2, 5), (0, 5)]) == 9, "2 + 5 + 2 = 9"
assert rota_uzunlugu([(1, 1)]) == 0, "Tek durakta yol 0"
assert rota_uzunlugu([]) == 0, "Boş rotada yol 0"
''',
  hints=['Her demeti iki değişkene aç: x1, y1 = duraklar[i]', 'abs() mutlak değer verir; ardışık çiftler için range(len - 1) dolaş.'],
  why='Demet açma koordinatlara anlamlı ad verir. range(len(duraklar) - 1) ardışık çiftleri gezer; liste boş ya da tek elemanlıysa aralık boş kalır ve 0 döner. Daha "Pythonca" alternatif zip ile çiftlemek: for (x1, y1), (x2, y2) in zip(duraklar, duraklar[1:]). Python 3.10+ itertools.pairwise(duraklar) de aynı işi yapar.',
  tags=['tuple', 'unpacking', 'abs', 'lojistik'], min=4),

dict(topic='Demet ve Küme', diff=2, kind='tamamla',
  title='Yetki kontrolü',
  q='<p>Anadolu Bank iç sisteminde her işlem bir yetki kümesi gerektiriyor. <code>yetki_kontrol(kullanici, gerekli)</code> iki küme alıyor ve <code>(izinli_mi, eksikler)</code> demeti döndürüyor: <code>izinli_mi</code> gerekli yetkilerin <b>hepsi</b> kullanıcıda varsa <code>True</code>; <code>eksikler</code> kullanıcıda olmayan gerekli yetkilerin <b>sıralı listesi</b>. Boşlukları (<code>___</code>) doldur.</p>',
  start=r'''
def yetki_kontrol(kullanici, gerekli):
    izinli_mi = gerekli.___(kullanici)
    eksikler = sorted(gerekli ___ kullanici)
    return izinli_mi, eksikler
''',
  sol=r'''
def yetki_kontrol(kullanici, gerekli):
    izinli_mi = gerekli.issubset(kullanici)
    eksikler = sorted(gerekli - kullanici)
    return izinli_mi, eksikler
''',
  tests=r'''
assert yetki_kontrol({"oku", "yaz", "onayla"}, {"oku", "onayla"}) == (True, []), "Tüm gerekli yetkiler var: (True, [])"
assert yetki_kontrol({"oku"}, {"oku", "yaz", "sil"}) == (False, ["sil", "yaz"]), "Eksikler sıralı liste: [\"sil\", \"yaz\"]"
assert yetki_kontrol(set(), set()) == (True, []), "Hiç yetki gerekmiyorsa izin var"
''',
  hints=['"A, B\'nin alt kümesi mi?" sorusunun metodu: A.issubset(B) (ya da A <= B).', 'Gerekli olup kullanıcıda olmayanlar: küme farkı.'],
  why='issubset "gerekli kümenin her elemanı kullanıcıda var mı" sorusunu tek çağrıda cevaplar; operatör karşılığı gerekli <= kullanici. Fark (-) eksik yetkileri verir ve aslında izinli_mi = not eksikler diye de yazılabilirdi. Rol tabanlı yetkilendirmede (RBAC) bu desen yaygındır; kümeler sırasız olduğu için kullanıcıya gösterilecek listeler sıralanır.',
  tags=['set', 'issubset', 'fark', 'güvenlik'], min=3),

# ---------------- Sözlükler ----------------
dict(topic='Sözlükler', diff=2, t='predict',
  title='get ve setdefault',
  q='<p>Fiyat sözlüğü güncellenirken şu satırlar çalışıyor. Çıktı nedir?</p>',
  code=r'''
fiyat = {"çay": 65, "kahve": 190}
fiyat.setdefault("şeker", 42)
fiyat.setdefault("çay", 70)
print(fiyat.get("süt", 0), fiyat["çay"], len(fiyat))
print(list(fiyat)[-1])
''',
  o=['0 70 3\nşeker', 'None 65 3\nşeker', '0 65 3\nşeker', '0 65 3\nkahve'], a=2,
  hints=['setdefault anahtar zaten varsa değeri değiştirmez.', 'Sözlükler ekleme sırasını korur (Python 3.7+).'],
  why='setdefault(k, v) anahtar yoksa ekler, varsa dokunmaz ve mevcut değeri döndürür; bu yüzden çay 65 kalır, şeker eklenir. get("süt", 0) olmayan anahtar için hata yerine varsayılanı (0) verir. Sözlükler ekleme sırasını korur; list(fiyat) anahtarları verir ve son eklenen "şeker"dir. Değeri koşulsuz güncellemek için fiyat["çay"] = 70 yazılır.',
  tags=['dict', 'get', 'setdefault', 'sıra'], min=3),

dict(topic='Sözlükler', diff=1, t='order',
  title='Fiyatlara %10 zam',
  q='<p>Ürün sözlüğüne yeni ürün ekleyip tüm fiyatlara %10 zam yapan kodun satırlarını sırala. Beklenen çıktı:</p><pre class="out">{\'çay\': 71.5, \'kahve\': 209.0, \'şeker\': 44.0}</pre>',
  lines=['fiyatlar = {"çay": 65.0, "kahve": 190.0}', 'fiyatlar["şeker"] = 40.0', 'for urun in fiyatlar:', '    fiyatlar[urun] = round(fiyatlar[urun] * 1.1, 2)', 'print(fiyatlar)'],
  expect="{'çay': 71.5, 'kahve': 209.0, 'şeker': 44.0}\n",
  hint='Şekere de zam yapılmış: ürün döngüden ÖNCE eklenmeli.',
  hints=['Var olan anahtarın değerini döngüde değiştirmek güvenlidir; anahtar eklemek/silmek değildir.'],
  why='Döngüde mevcut anahtarların değerlerini güncellemek serbesttir (sözlüğün boyutu değişmez). Şeker döngüden sonra eklenseydi 40.0 olarak kalırdı. round(..., 2) float kalıntılarını (71.50000000000001) temizler. Alternatif tek satır: fiyatlar = {u: round(f * 1.1, 2) for u, f in fiyatlar.items()} — yeni sözlük üretir.',
  tags=['dict', 'for', 'güncelleme'], min=2),

dict(topic='Sözlükler', diff=1, kind='rehberli',
  title='İki deponun stoğunu birleştir',
  q='<p>Anadolu Market\'in Ankara ve İzmir depolarının stokları ayrı sözlüklerde (<code>ürün → adet</code>). <code>stok_birlestir(depo1, depo2)</code> fonksiyonunu yaz: toplam stoğu gösteren <b>yeni</b> bir sözlük döndürsün. Bir üründe yalnız bir depoda varsa o adet kullanılır. Orijinal sözlükler değişmesin.</p>',
  guide=['depo1.copy() ile sonucu başlat.', 'depo2.items() üzerinde dolaş: for urun, adet in ...', 'sonuc.get(urun, 0) + adet ile topla ve ata.', 'Sonucu döndür.'],
  example=r'''
# Benzer teknik: iki günün ziyaretçi sayılarını birleştirmek
pazartesi = {"web": 120, "mobil": 80}
sali = {"mobil": 95, "magaza": 30}
toplam = pazartesi.copy()
for kanal, sayi in sali.items():
    toplam[kanal] = toplam.get(kanal, 0) + sayi
print(toplam)
''',
  start=r'''
def stok_birlestir(depo1, depo2):
    sonuc = depo1.copy()
    # TODO: depo2'deki her ürün için adetleri ekle
    return sonuc
''',
  sol=r'''
def stok_birlestir(depo1, depo2):
    sonuc = depo1.copy()
    for urun, adet in depo2.items():
        sonuc[urun] = sonuc.get(urun, 0) + adet
    return sonuc
''',
  tests=r'''
a = {"çay": 10, "kahve": 5}
b = {"kahve": 7, "şeker": 3}
assert stok_birlestir(a, b) == {"çay": 10, "kahve": 12, "şeker": 3}, "Ortak ürün toplanmalı, tekil ürünler aynen gelmeli"
assert a == {"çay": 10, "kahve": 5}, "depo1 DEĞİŞMEMELİ: copy() ile çalış"
assert stok_birlestir({}, {"x": 1}) == {"x": 1}, "Boş depoyla birleşim diğerini vermeli"
''',
  hints=['items() anahtar ve değeri birlikte verir.', 'get(urun, 0) ürün yoksa 0 döndürür, KeyError vermez.', 'sonuc[urun] = sonuc.get(urun, 0) + adet'],
  why='copy() ile başlamak depo1\'i korur; get(anahtar, 0) "yoksa sıfırdan başla" kalıbının en kısa halidir. Sadece ilk sözlüğü kopyalayıp ikinciyi üzerine eklediğimiz için tek döngü yeter. Alternatif: collections.Counter(depo1) + Counter(depo2) aynı sonucu verir (ama sıfır ve negatif adetleri düşürür). {**depo1, **depo2} ise toplamaz, üzerine yazar — sık yapılan bir yanılgı.',
  tags=['dict', 'get', 'items', 'stok'], min=4),

dict(topic='Sözlükler', diff=2, kind='rehberli',
  title='Departmana göre çalışanlar',
  q='<p>İK sisteminden çalışanlar <code>(ad, departman)</code> demetleri olarak geliyor. <code>departman_listesi(calisanlar)</code> fonksiyonunu yaz: <code>departman → [adlar]</code> sözlüğü döndürsün. Adlar listede <b>geliş sırasıyla</b> yer alsın. Ayrıca her departman listesinde aynı ad iki kez olmasın.</p>',
  guide=['Boş sözlükle başla.', 'Her (ad, departman) çifti için setdefault(departman, []) ile listeyi al ya da oluştur.', 'Ad listede yoksa ekle.', 'Sözlüğü döndür.'],
  example=r'''
# Benzer teknik: şehre göre mağazaları gruplamak
magazalar = [("Kadıköy", "İstanbul"), ("Alsancak", "İzmir"), ("Beşiktaş", "İstanbul")]
gruplar = {}
for ad, sehir in magazalar:
    gruplar.setdefault(sehir, []).append(ad)
print(gruplar)
''',
  start=r'''
def departman_listesi(calisanlar):
    gruplar = {}
    for ad, departman in calisanlar:
        # TODO: departman listesini setdefault ile al
        # TODO: ad listede yoksa ekle
        pass
    return gruplar
''',
  sol=r'''
def departman_listesi(calisanlar):
    gruplar = {}
    for ad, departman in calisanlar:
        liste = gruplar.setdefault(departman, [])
        if ad not in liste:
            liste.append(ad)
    return gruplar
''',
  tests=r'''
c = [("Ayşe", "Satış"), ("Mert", "IT"), ("Can", "Satış"), ("Ayşe", "Satış"), ("Ece", "IT")]
assert departman_listesi(c) == {"Satış": ["Ayşe", "Can"], "IT": ["Mert", "Ece"]}, "Satış: [Ayşe, Can], IT: [Mert, Ece]; tekrar eden Ayşe bir kez"
assert list(departman_listesi(c)) == ["Satış", "IT"], "Departmanlar ilk görülme sırasıyla gelmeli"
assert departman_listesi([]) == {}, "Boş girişte boş sözlük"
''',
  hints=['setdefault(anahtar, []) anahtar yoksa boş liste koyar ve HER durumda listeyi döndürür.', 'Dönen liste sözlükteki listenin kendisidir; ona append etmek sözlüğü günceller.', 'liste = gruplar.setdefault(departman, []); if ad not in liste: liste.append(ad)'],
  why='setdefault "yoksa oluştur, sonra ver" işini tek çağrıda yapar ve dönen liste sözlükteki nesnenin kendisi olduğu için ona eklemek sözlüğü günceller. Tekrar kontrolü için listede in kullanmak küçük gruplar için yeterlidir; çok büyük gruplarda yanında bir küme tutulur. Orta seviyede aynı işi collections.defaultdict(list) ile daha kısa yapacaksın.',
  tags=['dict', 'setdefault', 'gruplama', 'İK'], min=5),

dict(topic='Sözlükler', diff=2, kind='yaz',
  title='Fiyat değişikliği raporu',
  q='<p>Anadolu Market fiyat listesi güncellendi. <code>fiyat_farki(eski, yeni)</code> fonksiyonunu yaz (iki sözlük: <code>ürün → fiyat</code>). Şu sözlüğü döndürsün:</p><ul><li>Fiyatı <b>değişen</b> ürünler: <code>ürün → (eski_fiyat, yeni_fiyat)</code></li><li>Yalnız yeni listede olan ürünler: <code>ürün → (None, yeni_fiyat)</code></li><li>Yalnız eski listede olan (kaldırılan) ürünler: <code>ürün → (eski_fiyat, None)</code></li><li>Fiyatı aynı kalan ürünler sonuca girmez.</li></ul>',
  start=r'''
def fiyat_farki(eski, yeni):
    # buraya yaz
    pass
''',
  sol=r'''
def fiyat_farki(eski, yeni):
    rapor = {}
    for urun in eski.keys() | yeni.keys():
        e = eski.get(urun)
        y = yeni.get(urun)
        if e != y:
            rapor[urun] = (e, y)
    return rapor
''',
  tests=r'''
e = {"çay": 65, "kahve": 190, "süt": 30}
y = {"çay": 70, "kahve": 190, "şeker": 42}
r = fiyat_farki(e, y)
assert r["çay"] == (65, 70), "Çayın fiyatı değişti: (65, 70)"
assert "kahve" not in r, "Kahve aynı fiyatta: rapora girmemeli"
assert r["şeker"] == (None, 42), "Şeker yeni ürün: (None, 42)"
assert r["süt"] == (30, None), "Süt kaldırıldı: (30, None)"
assert len(r) == 3, "Raporda tam 3 ürün olmalı"
assert fiyat_farki({}, {}) == {}, "İki boş listede rapor boş"
''',
  hints=['İki sözlüğün tüm anahtarları: eski.keys() | yeni.keys() (küme gibi birleşim).', 'get(urun) anahtar yoksa None döndürür; bu tam da istenen değer.'],
  why='dict.keys() küme benzeri bir görünüm (view) döndürür; | ile iki sözlüğün tüm anahtarları tek döngüde gezilir. get varsayılan olarak None verdiği için eksik taraf otomatik None olur ve e != y karşılaştırması hem değişen hem eklenen hem de kaldırılan ürünleri yakalar. Alternatif: üç ayrı döngü (ortak, yalnız eski, yalnız yeni) — daha uzun ama bazı ekipler okunurluk için tercih eder.',
  tags=['dict', 'keys', 'get', 'karşılaştırma'], min=6),

dict(topic='Sözlükler', diff=3, kind='yaz',
  title='Satış sıralaması (eşitlikte alfabetik)',
  q='<p>Haftalık satış sözlüğü <code>ürün → adet</code>. <code>satis_sirasi(satislar, n)</code> fonksiyonunu yaz: en çok satan <code>n</code> ürünü <code>(ürün, adet)</code> demetleri listesi olarak döndürsün. Sıralama adet <b>azalan</b>; adetler eşitse ürün adı <b>alfabetik artan</b>. <code>n</code> ürün sayısından büyükse hepsini döndür.</p>',
  start=r'''
def satis_sirasi(satislar, n):
    # buraya yaz
    pass
''',
  sol=r'''
def satis_sirasi(satislar, n):
    sirali = sorted(satislar.items(), key=lambda kv: (-kv[1], kv[0]))
    return sirali[:n]
''',
  tests=r'''
s = {"çay": 40, "kahve": 55, "biskuvi": 40, "su": 90, "ayran": 12}
assert satis_sirasi(s, 3) == [("su", 90), ("kahve", 55), ("biskuvi", 40)], "Eşit 40 adette biskuvi, çay\'dan önce gelmeli (alfabetik)"
assert satis_sirasi(s, 10)[-1] == ("ayran", 12), "n büyükse tüm ürünler dönmeli, en az satan sonda"
assert len(satis_sirasi(s, 10)) == 5, "5 ürün var, 5 demet dönmeli"
assert satis_sirasi({}, 3) == [], "Boş sözlükte boş liste"
''',
  hints=['items() → (ürün, adet) demetleri; sorted ile sırala.', 'Çok kriterli sıralama: key bir demet döndürsün. Azalan sayı için eksi işareti kullan: (-adet, ad)'],
  why='key fonksiyonu demet döndürdüğünde Python önce ilk elemana, eşitlikte ikinciye bakar. Sayısal alanı negatif yapmak (-adet) o alanı azalan, metni artan sıralamanın en kısa yoludur; reverse=True kullansaydın adlar da ters sıralanırdı. Dilimleme n büyük olsa bile hata vermez. Alternatif: iki aşamalı kararlı sıralama — önce ada göre, sonra adete göre reverse=True (Python sıralaması kararlıdır, stable). Çok büyük veride heapq.nsmallest(n, ..., key=...) daha verimlidir.',
  tags=['dict', 'sorted', 'çok kriterli sıralama'], min=7),

dict(topic='Sözlükler', diff=2, kind='bug',
  title='Döngüde sözlükten silme',
  q='<p>Kodda bir hata var, bul ve düzelt. <code>bos_stoklari_sil(stok)</code> stoğu 0 olan ürünleri sözlükten çıkarıp sözlüğü döndürmeli. Ama <code>RuntimeError: dictionary changed size during iteration</code> hatası veriyor.</p>',
  start=r'''
def bos_stoklari_sil(stok):
    for urun in stok:
        if stok[urun] == 0:
            del stok[urun]
    return stok
''',
  sol=r'''
def bos_stoklari_sil(stok):
    for urun in list(stok):
        if stok[urun] == 0:
            del stok[urun]
    return stok
''',
  tests=r'''
assert bos_stoklari_sil({"çay": 0, "kahve": 5, "süt": 0}) == {"kahve": 5}, "Stoğu 0 olan çay ve süt silinmeli"
assert bos_stoklari_sil({"a": 1}) == {"a": 1}, "Silinecek ürün yoksa sözlük aynı kalmalı"
assert bos_stoklari_sil({}) == {}, "Boş sözlük boş kalmalı"
''',
  hints=['Üzerinde dolaştığın sözlüğün boyutunu değiştiremezsin.', 'Anahtarların bir kopyası üzerinde dolaş: list(stok)'],
  why='Sözlük üzerinde dolaşırken eleman eklemek ya da silmek boyutu değiştirir ve Python bunu RuntimeError ile durdurur. list(stok) anahtarların anlık bir kopyasını alır; silme işlemi orijinal sözlükte güvenle yapılır. Alternatif ve genelde tercih edilen yol yeni sözlük üretmektir: return {u: a for u, a in stok.items() if a != 0} — yan etkisizdir ama çağıranın elindeki sözlük değişmez, gereksinime göre seç.',
  tags=['dict', 'del', 'RuntimeError', 'döngüde değişiklik'], min=3),
]
