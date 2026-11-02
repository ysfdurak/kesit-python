START = 181
TASKS = [
dict(topic='match-case', diff=3, kind='yaz',
  title='Kasa komut yorumlayıcısı',
  q='<p>Anadolu Market\'in self-servis kasası metin komutlarıyla çalışıyor. <code>kasa(komutlar)</code> fonksiyonunu yaz; komutları sırayla işleyip son tutarı (2 ondalık) döndürsün:</p><ul><li><code>"ekle &lt;ürün&gt; &lt;fiyat&gt;"</code> → sepete ekle (fiyat ondalık olabilir)</li><li><code>"sil &lt;ürün&gt;"</code> → o üründen <b>bir tanesini</b> çıkar (yoksa bir şey yapma)</li><li><code>"indirim &lt;yüzde&gt;"</code> → en sonda toplam tutara uygulanacak indirim yüzdesini ayarla (son verilen geçerli)</li><li>Başka her komutta <code>ValueError(f"Bilinmeyen komut: {komut}")</code> fırlat.</li></ul><p><code>match komut.split():</code> ile liste kalıpları kullan.</p>',
  start=r'''
def kasa(komutlar):
    # buraya yaz
    pass
''',
  sol=r'''
def kasa(komutlar):
    sepet = []
    indirim = 0
    for komut in komutlar:
        match komut.split():
            case ["ekle", urun, fiyat]:
                sepet.append((urun, float(fiyat)))
            case ["sil", urun]:
                for i, (ad, _) in enumerate(sepet):
                    if ad == urun:
                        del sepet[i]
                        break
            case ["indirim", yuzde]:
                indirim = float(yuzde)
            case _:
                raise ValueError(f"Bilinmeyen komut: {komut}")
    toplam = sum(f for _, f in sepet)
    return round(toplam * (1 - indirim / 100), 2)
''',
  tests=r'''
assert kasa(["ekle çay 65", "ekle kahve 190", "ekle çay 65", "sil çay"]) == 255.0, "Bir çay silinince 65 + 190 = 255.0"
assert kasa(["ekle su 10", "indirim 10", "ekle süt 40"]) == 45.0, "İndirim en sonda toplama uygulanır: 50 × 0.9 = 45.0"
assert kasa(["sil ekmek"]) == 0, "Olmayan ürünü silmek hata vermemeli"
assert kasa([]) == 0, "Boş komut listesi: 0"
try:
    kasa(["ekle çay 65", "öde"])
    assert False, "Bilinmeyen komutta ValueError fırlatılmalı"
except ValueError as e:
    assert str(e) == "Bilinmeyen komut: öde", "Hata mesajı \"Bilinmeyen komut: öde\" olmalı"
''',
  hints=['Sepeti (ürün, fiyat) demetleri listesi olarak tut; silme için ilk eşleşeni bul ve break ile çık.', 'Liste kalıpları eleman sayısını da kontrol eder: ["ekle", urun, fiyat] tam üç parça ister.', 'case _: raise ValueError(f"Bilinmeyen komut: {komut}")'],
  why='komut.split() ile parçalanan liste, match\'in liste kalıplarıyla hem komut adını hem argüman sayısını tek seferde doğrular; "ekle çay" gibi eksik komutlar da case _ dalına düşer ve hata verir. Silmede break yalnızca ilk eşleşeni kaldırır; remove kullanmak için demetin tam karşılığını bilmek gerekirdi. İndirimin en sonda uygulanması, komut sırasından bağımsız tutarlı sonuç verir. if/elif ile yazsaydın parcalar[0] ve len(parcalar) kontrollerini elle yapman gerekirdi.',
  tags=['match', 'liste kalıbı', 'ValueError', 'kasa'], min=10),

dict(topic='match-case', diff=1, kind='tamamla',
  title='Hafta içi mi hafta sonu mu?',
  q='<p>İK mesai sistemi için <code>gun_tipi(gun)</code> fonksiyonu Türkçe gün adına göre <code>"hafta sonu"</code>, <code>"hafta içi"</code> ya da <code>"geçersiz"</code> döndürmeli. Boşlukları (<code>___</code>) doldur.</p>',
  start=r'''
def gun_tipi(gun):
    match gun:
        case "Cumartesi" ___ "Pazar":
            return "hafta sonu"
        case "Pazartesi" | "Salı" | "Çarşamba" | "Perşembe" | "Cuma":
            return "hafta içi"
        case ___:
            return "geçersiz"
''',
  sol=r'''
def gun_tipi(gun):
    match gun:
        case "Cumartesi" | "Pazar":
            return "hafta sonu"
        case "Pazartesi" | "Salı" | "Çarşamba" | "Perşembe" | "Cuma":
            return "hafta içi"
        case _:
            return "geçersiz"
''',
  tests=r'''
assert gun_tipi("Pazar") == "hafta sonu", "Pazar hafta sonu"
assert gun_tipi("Cumartesi") == "hafta sonu", "Cumartesi hafta sonu"
assert gun_tipi("Çarşamba") == "hafta içi", "Çarşamba hafta içi"
assert gun_tipi("Bayram") == "geçersiz", "Tanımsız gün: geçersiz"
''',
  hints=['Birden fazla değeri tek case\'te birleştiren operatör ikinci satırda örnek olarak var.', 'Her şeyi yakalayan joker kalıp alt çizgidir.'],
  why='| "veya kalıbı"dır (or pattern); değerlerden biri eşleşirse dal çalışır. _ joker kalıbı her değerle eşleşir ve değişkene bağlanmaz. case diger: yazsaydın da her şeyi yakalardı ama değeri diger adına bağlardı. Büyük/küçük harf farkı önemliyse match gun.capitalize(): gibi önce normalize edebilirsin (Türkçe İ için dikkat!).',
  tags=['match', '|', 'joker', 'İK'], min=2),

# ---------------- Döngüler ----------------
dict(topic='Döngüler', diff=2, t='predict',
  title='continue, break ve for-else',
  q='<p>Sipariş adetlerini tarayan döngü ne yazdırır?</p>',
  code=r'''
for no in [3, 8, 5, 12, 6]:
    if no % 2:
        continue
    if no > 10:
        print("büyük", no)
        break
    print("çift", no)
else:
    print("bitti")
''',
  o=['çift 8\nbüyük 12\nbitti', 'çift 8\nbüyük 12', 'çift 8\nbüyük 12\nçift 6', '3\nçift 8\n5\nbüyük 12'], a=1,
  hints=['no % 2 tek sayılarda 1 (doğru) olur: continue o turu atlar.', 'Döngünün else bloğu yalnızca döngü break OLMADAN biterse çalışır.'],
  why='3 ve 5 tek olduğu için continue ile atlanır; 8 çifttir ama 10\'dan büyük değil, "çift 8" yazılır. 12\'de "büyük 12" yazılır ve break döngüyü bitirir; 6 hiç işlenmez. for-else\'in else bloğu yalnızca döngü break\'siz tükenirse çalıştığından "bitti" yazılmaz. Bu kalıp "aradığını bulamazsan şunu yap" senaryoları için kullanışlıdır.',
  tags=['for', 'continue', 'break', 'for-else'], min=3),

dict(topic='Döngüler', diff=2, t='order',
  title='Borç hangi ayda kapandı?',
  q='<p>Taksit ödemelerini ay ay düşen ve borcun kapandığı ayı bulan kodun satırlarını sırala. Beklenen çıktı: <code>Borç 4. ayda kapandı, fazla: 150 TL</code></p>',
  lines=['odemeler = [300, 250, 400, 200]', 'kalan = sum(odemeler) - 150', 'for ay, tutar in enumerate(odemeler, start=1):', '    kalan -= tutar', '    if kalan <= 0:', '        print(f"Borç {ay}. ayda kapandı, fazla: {-kalan} TL")', '        break'],
  expect='Borç 4. ayda kapandı, fazla: 150 TL\n',
  hint='Borçtan düşme işlemi, kontrolden önce yapılmalı; break print\'ten sonra gelir.',
  hints=['enumerate(liste, start=1) hem sıra numarasını (1\'den) hem elemanı verir.'],
  why='enumerate(..., start=1) ay numarasını elle sayaç tutmadan verir. Her turda önce ödeme düşülür, sonra kalan kontrol edilir; sıra ters olsaydı borç bir ay geç kapanmış görünürdü. break, borç kapandığı anda döngüden çıkar. Borcun hiç kapanmama durumunu raporlamak için for-else kullanılabilir: else: print("Borç kapanmadı").',
  tags=['for', 'enumerate', 'break', 'bankacılık'], min=3),

dict(topic='Döngüler', diff=1, kind='rehberli',
  title='Kümülatif ciro',
  q='<p>Anadolu Market yönetimi ay içinde ciroyu gün gün birikimli görmek istiyor. <code>kumulatif(gunluk)</code> fonksiyonunu yaz: her gün için o güne kadarki toplamı içeren listeyi döndürsün.</p><p>Örnek: <code>[100, 250, 50]</code> → <code>[100, 350, 400]</code></p>',
  guide=['Bir toplam değişkeni (0) ve boş sonuç listesi oluştur.', 'Her günlük değeri toplama ekle.', 'Toplamın o anki değerini sonuca ekle.', 'Listeyi döndür.'],
  example=r'''
# Benzer teknik: birikimli kilometre
etaplar = [12, 30, 8]
yol = 0
for km in etaplar:
    yol += km
    print("şimdiye kadar:", yol)
''',
  start=r'''
def kumulatif(gunluk):
    toplam = 0
    sonuc = []
    for deger in gunluk:
        # TODO: toplamı güncelle
        # TODO: toplamı listeye ekle
        pass
    return sonuc
''',
  sol=r'''
def kumulatif(gunluk):
    toplam = 0
    sonuc = []
    for deger in gunluk:
        toplam += deger
        sonuc.append(toplam)
    return sonuc
''',
  tests=r'''
assert kumulatif([100, 250, 50]) == [100, 350, 400], "[100, 250, 50] → [100, 350, 400]"
assert kumulatif([5]) == [5], "Tek gün: kendisi"
assert kumulatif([]) == [], "Boş liste: boş sonuç"
assert kumulatif([10, -3, 0]) == [10, 7, 7], "İade (negatif) günleri toplamı düşürür"
''',
  hints=['Biriktirici (accumulator) değişken döngü DIŞINDA başlatılır.', 'toplam += deger', 'sonuc.append(toplam)'],
  why='Biriktirici kalıbı: döngü dışında başlat, her turda güncelle, ara sonucu kaydet. Sıra önemli: önce ekleme sonra kaydetme; tersi bir gün geriden gelen liste üretir. Hazır alternatif: from itertools import accumulate; list(accumulate(gunluk)). pandas\'ta seri.cumsum() aynı işi yapar.',
  tags=['for', 'biriktirici', 'accumulate', 'ciro'], min=3),

dict(topic='Döngüler', diff=2, kind='rehberli',
  title='İlk mükerrer işlemi yakala',
  q='<p>Ilgaz Bank sahtecilik birimi, işlem akışında <b>ilk tekrar eden</b> işlem numarasını hemen bulmak istiyor (akış uzun olabilir; tekrar görülür görülmez durmak gerekir). <code>ilk_tekrar(islem_nolari)</code> fonksiyonunu yaz: ikinci kez görülen ilk numarayı döndürsün; tekrar yoksa <code>None</code>.</p><p>Örnek: <code>[7, 3, 9, 3, 7]</code> → <code>3</code> (3, 7\'den önce ikinci kez görülür).</p>',
  guide=['Görülen numaralar için boş bir küme oluştur.', 'Akışta sırayla dolaş.', 'Numara kümede varsa hemen döndür (döngü biter).', 'Yoksa kümeye ekle; döngü biterse None döndür.'],
  example=r'''
# Benzer teknik: ilk geçersiz kaydı bulup durmak
kayitlar = ["ok", "ok", "HATA", "ok"]
for i, k in enumerate(kayitlar):
    if k == "HATA":
        print("ilk hata satırı:", i)
        break
''',
  start=r'''
def ilk_tekrar(islem_nolari):
    gorulen = set()
    for no in islem_nolari:
        # TODO: no daha önce görüldüyse döndür
        # TODO: değilse kümeye ekle
        pass
    # TODO: tekrar yoksa ne döner?
    return -1
''',
  sol=r'''
def ilk_tekrar(islem_nolari):
    gorulen = set()
    for no in islem_nolari:
        if no in gorulen:
            return no
        gorulen.add(no)
    return None
''',
  tests=r'''
assert ilk_tekrar([7, 3, 9, 3, 7]) == 3, "3 ikinci kez 7\'den önce görülür"
assert ilk_tekrar([1, 2, 3]) is None, "Tekrar yoksa None"
assert ilk_tekrar([]) is None, "Boş akışta None"
assert ilk_tekrar([5, 5]) == 5, "Hemen tekrar eden 5"
''',
  hints=['Kümede in kontrolü çok hızlıdır.', 'Fonksiyon içinde return döngüyü de bitirir.', 'if no in gorulen: return no'],
  why='return döngünün ortasında fonksiyonu bitirir; bu yüzden ilk tekrar bulunduğu anda kalan akış hiç işlenmez (erken çıkış). Küme üyeliği O(1) olduğu için toplam iş O(n)\'dir. Liste ile gorulen tutmak O(n²) olurdu. "Bulunamadı" için -1 yerine None döndürmek daha güvenlidir, çünkü -1 geçerli bir değer olabilir ve if sonuc: kontrolü 0 numarasında yanılır; is None ile kontrol et.',
  tags=['for', 'set', 'erken çıkış', 'sahtecilik'], min=4),

dict(topic='Döngüler', diff=2, kind='yaz',
  title='Salon koltuk planı',
  q='<p>Belediye kültür merkezi bilet sistemi için <code>koltuk_plani(sira_sayisi, koltuk_sayisi)</code> fonksiyonunu yaz. Sıralar A\'dan başlayan harflerle, koltuklar 1\'den başlayan sayılarla adlandırılır. Her sıra için koltuk adlarını boşlukla birleştiren bir metin üret ve bu metinlerin listesini döndür.</p><p>Örnek: <code>koltuk_plani(2, 3)</code> → <code>["A1 A2 A3", "B1 B2 B3"]</code></p>',
  start=r'''
def koltuk_plani(sira_sayisi, koltuk_sayisi):
    # buraya yaz
    pass
''',
  sol=r'''
def koltuk_plani(sira_sayisi, koltuk_sayisi):
    plan = []
    for i in range(sira_sayisi):
        harf = chr(ord("A") + i)
        koltuklar = []
        for k in range(1, koltuk_sayisi + 1):
            koltuklar.append(f"{harf}{k}")
        plan.append(" ".join(koltuklar))
    return plan
''',
  tests=r'''
assert koltuk_plani(2, 3) == ["A1 A2 A3", "B1 B2 B3"], "2 sıra × 3 koltuk"
assert koltuk_plani(4, 1) == ["A1", "B1", "C1", "D1"], "4 sıra × 1 koltuk"
assert koltuk_plani(0, 5) == [], "Sıra yoksa boş liste"
assert koltuk_plani(1, 10)[0].split()[-1] == "A10", "Son koltuk A10 (range bitişine dikkat)"
''',
  hints=['Harf üretmek: chr(ord("A") + i) → i=0 için A, i=1 için B.', 'İç içe döngü: dış döngü sıralar, iç döngü koltuklar; iç döngüde range(1, koltuk_sayisi + 1).'],
  why='ord harfin kod noktasını, chr kod noktasından harfi verir; A\'ya i eklemek ardışık harfleri üretir. Dış döngü her sıra için bir kez, iç döngü her koltuk için çalışır (iç içe döngü). range\'in bitişi hariç olduğu için 1\'den başlayan numaralarda +1 gerekir. Kısa alternatif: " ".join(f"{harf}{k}" for k in range(1, koltuk_sayisi + 1)). Harf listesi için string.ascii_uppercase[i] de kullanılabilir.',
  tags=['iç içe döngü', 'chr', 'ord', 'belediye'], min=5),

dict(topic='Döngüler', diff=3, kind='yaz',
  title='En uzun yükseliş serisi',
  q='<p>Borsa analisti, bir hissenin kapanış fiyatlarında art arda <b>kesin artan</b> en uzun serinin uzunluğunu istiyor. <code>en_uzun_artis(fiyatlar)</code> fonksiyonunu yaz.</p><p>Örnek: <code>[10, 11, 12, 9, 10, 15, 20, 18]</code> → 9, 10, 15, 20 serisi → <code>4</code>. Eşit fiyat seriyi bozar. Boş listede 0, tek elemanda 1.</p>',
  start=r'''
def en_uzun_artis(fiyatlar):
    # buraya yaz
    pass
''',
  sol=r'''
def en_uzun_artis(fiyatlar):
    if not fiyatlar:
        return 0
    en_uzun = 1
    simdiki = 1
    for i in range(1, len(fiyatlar)):
        if fiyatlar[i] > fiyatlar[i - 1]:
            simdiki += 1
            en_uzun = max(en_uzun, simdiki)
        else:
            simdiki = 1
    return en_uzun
''',
  tests=r'''
assert en_uzun_artis([10, 11, 12, 9, 10, 15, 20, 18]) == 4, "9, 10, 15, 20 → 4"
assert en_uzun_artis([5, 5, 5]) == 1, "Eşit fiyatlar seriyi bozar: 1"
assert en_uzun_artis([3, 2, 1]) == 1, "Sürekli düşüşte en uzun seri 1"
assert en_uzun_artis([1, 2, 3, 4]) == 4, "Seri listenin sonuna kadar sürüyorsa da sayılmalı"
assert en_uzun_artis([]) == 0, "Boş listede 0"
assert en_uzun_artis([42]) == 1, "Tek eleman: 1"
''',
  hints=['İki sayaç tut: şu anki seri uzunluğu ve şimdiye kadarki en uzun.', 'Her elemanı bir öncekiyle karşılaştır; artış yoksa şu anki seriyi 1\'e sıfırla. En uzunu her artışta güncelle (döngü bitince değil).'],
  why='Tek geçişte (O(n)) iki durum değişkeniyle çözülür: simdiki seri ve en_uzun. En uzunu artış anında güncellemek, serinin listenin sonuna kadar sürdüğü durumu da yakalar; yalnızca seri bozulduğunda güncelleseydin [1, 2, 3, 4] için 1 dönerdi — sık yapılan bir hata. Boş liste kontrolü 1 dönmesini önler. zip(fiyatlar, fiyatlar[1:]) ile ardışık çiftler üzerinden de yazılabilir.',
  tags=['for', 'seri', 'kenar durum', 'finans'], min=8),

dict(topic='Döngüler', diff=2, kind='bug',
  title='Son taksit eksik',
  q='<p>Kodda bir hata var, bul ve düzelt. <code>taksit_tablosu(tutar, ay)</code> her ay için <code>"1. ay: 500.00 TL"</code> biçiminde satır üretmeli. Müşteri 6 taksitli alışverişinin tablosunda yalnızca 5 satır gördüğünü bildirdi.</p>',
  start=r'''
def taksit_tablosu(tutar, ay):
    satirlar = []
    for i in range(1, ay):
        satirlar.append(f"{i}. ay: {tutar / ay:.2f} TL")
    return satirlar
''',
  sol=r'''
def taksit_tablosu(tutar, ay):
    satirlar = []
    for i in range(1, ay + 1):
        satirlar.append(f"{i}. ay: {tutar / ay:.2f} TL")
    return satirlar
''',
  tests=r'''
t = taksit_tablosu(3000, 6)
assert len(t) == 6, "6 taksit için 6 satır olmalı"
assert t[0] == "1. ay: 500.00 TL", "İlk satır \"1. ay: 500.00 TL\""
assert t[-1] == "6. ay: 500.00 TL", "Son satır \"6. ay: 500.00 TL\" olmalı"
assert taksit_tablosu(100, 1) == ["1. ay: 100.00 TL"], "Tek çekim: tek satır"
''',
  hints=['range(1, 6) hangi sayıları üretir? 6 dahil mi?', 'Bitiş değeri hariç olduğu için bir fazlasını ver.'],
  why='range(baslangic, bitis) bitişi dahil etmez: range(1, 6) → 1..5. 1\'den başlayan sayımda bitiş ay + 1 olmalıdır. Klasik "bir eksik" (off-by-one) hatasıdır. Alternatif: for i in range(ay): ve satırda i + 1 kullanmak. Gerçek taksit hesabında kuruş artıkları son taksite eklenir; 1000 / 3 gibi tutarlarda toplam tutmayabilir.',
  tags=['range', 'off-by-one', 'taksit'], min=3),

# ---------------- Fonksiyonlar ----------------
dict(topic='Fonksiyonlar', diff=2, t='predict',
  title='Değişebilir varsayılan parametre',
  q='<p>Her müşteri için yeni sepet oluşturması beklenen fonksiyon iki kez çağrılıyor. Çıktı nedir?</p>',
  code=r'''
def ekle(urun, sepet=[]):
    sepet.append(urun)
    return sepet

print(ekle("çay"))
print(ekle("kahve"))
''',
  o=["['çay']\n['kahve']", "['çay']\n['çay', 'kahve']", "['çay', 'kahve']\n['çay', 'kahve']", "TypeError hatası verir"], a=1,
  hints=['Varsayılan değerler fonksiyon her çağrıldığında mı, yoksa tanımlandığında bir kez mi oluşturulur?'],
  why='Varsayılan değer def satırı çalıştığında BİR KEZ oluşturulur ve tüm çağrılar aynı listeyi paylaşır; ikinci müşteri birincinin çayını da görür. Doğru kalıp: def ekle(urun, sepet=None): if sepet is None: sepet = [] — böylece her çağrıda yeni liste üretilir. Bu kural liste, sözlük, küme gibi tüm değişebilir (mutable) varsayılanlar için geçerlidir.',
  tags=['varsayılan parametre', 'mutable', 'tuzak'], min=3),
]
