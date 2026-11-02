START = 41
L = 'Listeler'
S = 'Sözlükler ve kümeler'
K = 'Koşullar ve döngüler'
ITEMS = [
(L, 'orta', 'Karışık türlü listeyi sıralamak',
'''\
# Excel'den gelen fiyat sütununda bir hücre metin olarak kalmış
fiyatlar = [349, '99', 1250]
print(sorted(fiyatlar))
''',
'''\
fiyatlar = [349, '99', 1250]
temiz = [int(f) for f in fiyatlar]
print(sorted(temiz))
''',
'Python 3 farklı türleri (int ile str) sıralayamaz: \'<\' not supported between instances of \'str\' and \'int\' (TypeError). Dış kaynaktan gelen listelerde tek bir metin hücresi bütün raporu çökertir.',
'Sıralamadan önce listeyi tek türe çevir; ya da key=int gibi bir anahtar ver.'),

(L, 'orta', 'Boş listede max()/min() çağırmak',
'''\
def en_yuksek_siparis(tutarlar):
    return max(tutarlar)

print(en_yuksek_siparis([420, 1500]))
print(en_yuksek_siparis([]))      # yeni açılan şube
''',
'''\
def en_yuksek_siparis(tutarlar):
    return max(tutarlar, default=0)

print(en_yuksek_siparis([420, 1500]))
print(en_yuksek_siparis([]))
''',
'max() ve min() boş bir koleksiyonda ValueError (max() iterable argument is empty) verir. Testte hep dolu liste kullanıldığı için hata ancak canlıda, hiç siparişi olmayan bir şubeyle ortaya çıkar.',
'Boş olabilecek veride max/min için default= ver ya da boşluğu önceden denetle.'),

(S, 'temel', 'Olmayan anahtarı köşeli parantezle okumak',
'''\
stok = {'elma': 40, 'armut': 15}
print('Muz stoku:', stok['muz'])
''',
'''\
stok = {'elma': 40, 'armut': 15}
print('Muz stoku:', stok.get('muz', 0))
''',
'sozluk[anahtar] anahtar yoksa KeyError fırlatır. Eksik olabilecek anahtarlarda bu, programın ortasında çökmesine yol açar.',
'Anahtar eksik olabiliyorsa .get(anahtar, varsayılan) kullan.'),

(S, 'orta', 'Sözlüğü gezerken eleman silmek',
'''\
sepet = {'ekmek': 2, 'süt': 0, 'yumurta': 0, 'peynir': 1}
for urun in sepet:
    if sepet[urun] == 0:
        del sepet[urun]
print(sepet)
''',
'''\
sepet = {'ekmek': 2, 'süt': 0, 'yumurta': 0, 'peynir': 1}
sepet = {u: a for u, a in sepet.items() if a > 0}
print(sepet)
''',
'Gezilen sözlüğün boyutu değişirse Python RuntimeError (dictionary changed size during iteration) verir. Listelerdeki sessiz atlamanın aksine burada hemen hata alırsın.',
'Sözlükten silerken ya yeni sözlük kur ya da list(sozluk) kopyası üzerinde gez.'),

(S, 'temel', 'Boş küme için {} yazmak',
'''\
ziyaret_eden = {}
ziyaret_eden.add('Ayşe')
print(ziyaret_eden)
''',
'''\
ziyaret_eden = set()
ziyaret_eden.add('Ayşe')
print(ziyaret_eden)
''',
'{} boş bir SÖZLÜK oluşturur, boş küme değil. Sözlüğün add() metodu olmadığı için AttributeError (\'dict\' object has no attribute \'add\') alırsın.',
'Boş küme için set() yaz; {} her zaman boş sözlüktür.'),

(S, 'ileri', 'dict.fromkeys() ile değiştirilebilir varsayılan',
'''\
subeler = ['Ankara', 'İzmir']
personel = dict.fromkeys(subeler, [])
personel['Ankara'].append('Ali')
print(personel)
''',
'''\
subeler = ['Ankara', 'İzmir']
personel = {s: [] for s in subeler}
personel['Ankara'].append('Ali')
print(personel)
''',
'fromkeys() verilen değeri her anahtar için kopyalamaz; bütün anahtarlar AYNI listeyi gösterir. Bir şubeye eklenen personel hepsine eklenmiş görünür.',
'Anahtar başına ayrı liste/sözlük için comprehension ya da defaultdict(list) kullan.'),

(S, 'temel', 'Listeyi sözlük anahtarı yapmak',
'''\
mesafe = {}
mesafe[['İzmir', 'Manisa']] = 35
print(mesafe)
''',
'''\
mesafe = {}
mesafe[('İzmir', 'Manisa')] = 35
print(mesafe)
''',
'Sözlük anahtarları ve küme elemanları hash\'lenebilir (değiştirilemez) olmalıdır. Liste değiştirilebildiği için TypeError (unhashable type: \'list\') verir.',
'Birden çok değerden anahtar gerekiyorsa demet (tuple) kullan.'),

(S, 'ileri', '1, True ve 1.0 anahtarlarının çakışması',
'''\
# Durum kodu -> açıklama; kodlar farklı türlerde girilmiş
durumlar = {1: 'Hazırlanıyor', True: 'Onaylandı', 1.0: 'Kargoda'}
print(durumlar)
print('Durum sayısı:', len(durumlar))
''',
'''\
durumlar = {'HAZIR': 'Hazırlanıyor', 'ONAY': 'Onaylandı', 'KARGO': 'Kargoda'}
print(durumlar)
print('Durum sayısı:', len(durumlar))
''',
'1 == True == 1.0 ve üçünün hash değeri aynıdır; sözlük onları TEK anahtar sayar. İlk eklenen anahtar adı kalır, değer sonuncuyla ezilir. Kümelerde de {1, True, 1.0} tek elemanlıdır.',
'Sözlük anahtarlarında tür karıştırma; anlamlı ve tek türden anahtar kullan.'),

(S, 'orta', 'Tekrarları set() ile silip sırayı kaybetmek',
'''\
# Müşterinin gezdiği ürün id'leri: sıra korunmalı, tekrarlar silinmeli
ziyaret = [5, 3, 5, 1, 3, 9]
tekil = list(set(ziyaret))
print(tekil)
''',
'''\
ziyaret = [5, 3, 5, 1, 3, 9]
tekil = list(dict.fromkeys(ziyaret))
print(tekil)
''',
'Küme (set) sıra tutmaz; list(set(...)) çıktısının sırası ekleme sırası değildir ve metinlerde her çalıştırmada değişebilir. Sözlükler ise Python 3.7\'den beri ekleme sırasını korur.',
'Sırayı koruyarak tekrar silmek için dict.fromkeys() kullan.'),

(S, 'temel', 'Sözlüğü items() olmadan açmak',
'''\
kargo_ucreti = {'Ankara': 120, 'Bursa': 95}
for sehir, ucret in kargo_ucreti:
    print(sehir, ucret)
''',
'''\
kargo_ucreti = {'Ankara': 120, 'Bursa': 95}
for sehir, ucret in kargo_ucreti.items():
    print(sehir, ucret)
''',
'Sözlük üzerinde for yalnız ANAHTARLARI verir. \'Ankara\' metni iki değişkene açılmaya çalışılır ve ValueError (too many values to unpack) alırsın; iki harfli anahtarlarda ise hata vermeden harfleri dağıtır.',
'Anahtar ve değeri birlikte gezmek için .items() kullan.'),

(S, 'ileri', 'defaultdict\'i okurken anahtar eklemek',
'''\
from collections import defaultdict
satis = defaultdict(int)
satis['Ankara'] += 5
for sehir in ['Ankara', 'İzmir', 'Bursa']:
    if satis[sehir] == 0:
        print(sehir, 'satış yok')
print('Satış yapan şube sayısı:', len(satis))
''',
'''\
from collections import defaultdict
satis = defaultdict(int)
satis['Ankara'] += 5
for sehir in ['Ankara', 'İzmir', 'Bursa']:
    if satis.get(sehir, 0) == 0:
        print(sehir, 'satış yok')
print('Satış yapan şube sayısı:', len(satis))
''',
'defaultdict yalnız yazarken değil, köşeli parantezle OKURKEN de eksik anahtarı varsayılan değerle oluşturur. Sadece kontrol amacıyla bakılan şubeler sözlüğe eklenir ve sayım şişer.',
'defaultdict\'te yalnız bakmak için .get() ya da in kullan; [] okuması anahtar yaratır.'),

(S, 'ileri', 'İç içe sözlükleri ** ile birleştirmek',
'''\
varsayilan = {'kargo': {'ucret': 30, 'ucretsiz_limit': 500}, 'para': 'TL'}
musteri = {'kargo': {'ucret': 0}}
ayar = {**varsayilan, **musteri}
print(ayar)
print(ayar['kargo']['ucretsiz_limit'])
''',
'''\
def derin_birlestir(a, b):
    sonuc = dict(a)
    for k, v in b.items():
        if isinstance(v, dict) and isinstance(sonuc.get(k), dict):
            sonuc[k] = derin_birlestir(sonuc[k], v)
        else:
            sonuc[k] = v
    return sonuc

varsayilan = {'kargo': {'ucret': 30, 'ucretsiz_limit': 500}, 'para': 'TL'}
musteri = {'kargo': {'ucret': 0}}
ayar = derin_birlestir(varsayilan, musteri)
print(ayar)
print(ayar['kargo']['ucretsiz_limit'])
''',
'{**a, **b}, a | b ve update() yalnız ÜST düzeyde birleştirir: musteri[\'kargo\'] bütün kargo sözlüğünün yerine geçer ve ucretsiz_limit kaybolur (KeyError).',
'İç içe ayarları birleştirirken alt sözlükleri de birleştiren (derin) bir fonksiyon kullan.'),

(K, 'temel', 'or ile birden çok değeri sınamak',
'''\
odeme = 'havale'
if odeme == 'kredi' or 'banka':
    print('Kart komisyonu eklendi')
else:
    print('Komisyon yok')
''',
'''\
odeme = 'havale'
if odeme in ('kredi', 'banka'):
    print('Kart komisyonu eklendi')
else:
    print('Komisyon yok')
''',
'Koşul (odeme == \'kredi\') or (\'banka\') diye okunur. Boş olmayan \'banka\' metni her zaman doğru sayıldığı için koşul hep True olur ve her siparişe komisyon eklenir.',
'Bir değişkeni birden çok değerle karşılaştırırken in (...) kullan.'),

(K, 'temel', 'if içinde = kullanmak',
'''\
puan = 100
if puan = 100:
    print('Tam puan!')
''',
'''\
puan = 100
if puan == 100:
    print('Tam puan!')
''',
'= atama, == karşılaştırmadır. if içinde atama yapılamaz; Python kod çalışmadan önce SyntaxError verir ve "Maybe you meant \'==\'" diye ipucu gösterir.',
'Koşullarda karşılaştırma için == kullan.'),

(K, 'temel', 'range() bitiş değerini dahil sanmak',
'''\
# 1'den 10'a kadar taksit numaraları
print(list(range(1, 10)))
''',
'''\
print(list(range(1, 11)))
''',
'range(baş, bitiş) bitiş değerini DAHİL ETMEZ. 10 taksit yerine 9 taksit üretilir; bu, "bir eksik" (off-by-one) hatalarının en yaygın kaynağıdır.',
'range\'in üst sınırı hariçtir; n dahil olsun istiyorsan n + 1 yaz.'),

(K, 'orta', 'Aramada else\'i döngünün içine koymak',
'''\
musteriler = ['Ali', 'Zeynep', 'Okan']
aranan = 'Okan'
for m in musteriler:
    if m == aranan:
        print('Bulundu:', m)
        break
    else:
        print('Bulunamadı')
''',
'''\
musteriler = ['Ali', 'Zeynep', 'Okan']
aranan = 'Okan'
for m in musteriler:
    if m == aranan:
        print('Bulundu:', m)
        break
else:
    print('Bulunamadı')
''',
'if\'e bağlı else her eşleşmeyen elemanda çalışır ve aranan bulunsa bile ekrana "Bulunamadı" yazar. Döngüye bağlı else (for-else) ise yalnız döngü break ile kesilmeden bittiğinde bir kez çalışır.',
'"Hiçbiri bulunamadı" mesajını döngü bittikten sonra ver: for-else ya da bir bayrak değişkeni kullan.'),

(K, 'temel', 'Girintiyi yanlış satırda bitirmek',
'''\
fiyatlar = [100, 200, 300]
toplam = 0
for f in fiyatlar:
    kdvli = f * 1.2
toplam += kdvli
print(round(toplam, 2))
''',
'''\
fiyatlar = [100, 200, 300]
toplam = 0
for f in fiyatlar:
    kdvli = f * 1.2
    toplam += kdvli
print(round(toplam, 2))
''',
'Python bloğu girintiyle belirler. toplam += kdvli satırı döngünün dışında kaldığı için yalnız SON fiyat toplanır; hata da vermez.',
'Döngüde tekrarlanması gereken her satırın döngüyle aynı girintide olduğunu kontrol et.'),

(K, 'orta', 'elif koşullarını yanlış sırada yazmak',
'''\
for puan in [95, 70, 40]:
    if puan >= 50:
        not_ = 'Geçti'
    elif puan >= 85:
        not_ = 'Pekiyi'
    else:
        not_ = 'Kaldı'
    print(puan, not_)
''',
'''\
for puan in [95, 70, 40]:
    if puan >= 85:
        not_ = 'Pekiyi'
    elif puan >= 50:
        not_ = 'Geçti'
    else:
        not_ = 'Kaldı'
    print(puan, not_)
''',
'if-elif zincirinde ilk doğru koşul çalışır, sonrakilere bakılmaz. Geniş koşul (>= 50) önde olduğu için dar koşul (>= 85) hiçbir zaman çalışmaz.',
'Aralık koşullarını en dar/en yüksekten başlayarak sırala.'),

(K, 'orta', 'for değişkenini değiştirip satır atlamaya çalışmak',
'''\
satirlar = ['RAPOR', 'tarih: 01.11', 'hazırlayan: ik', 'Ayşe 42', 'Can 38']
for i in range(len(satirlar)):
    if satirlar[i] == 'RAPOR':
        i += 2          # başlıktaki iki bilgi satırını atla
        continue
    print('Veri:', satirlar[i])
''',
'''\
satirlar = ['RAPOR', 'tarih: 01.11', 'hazırlayan: ik', 'Ayşe 42', 'Can 38']
i = 0
while i < len(satirlar):
    if satirlar[i] == 'RAPOR':
        i += 3          # başlık + iki bilgi satırı
        continue
    print('Veri:', satirlar[i])
    i += 1
''',
'for döngüsü her turda değişkene range\'in SIRADAKİ değerini atar; döngü içinde i\'yi artırmak sonraki turu etkilemez. Atlanması gereken satırlar veri gibi işlenir.',
'Adım atlamak gerekiyorsa while kullan ya da listeyi önceden dilimle.'),

(K, 'orta', 'break ile iç içe döngüden çıktığını sanmak',
'''\
depolar = {'Ankara': ['somun', 'vida'], 'İzmir': ['vida'], 'Bursa': ['vida']}
for depo, urunler in depolar.items():
    for u in urunler:
        if u == 'vida':
            print('Vida ilk bulunan depo:', depo)
            break
''',
'''\
def ilk_depo(depolar, aranan):
    for depo, urunler in depolar.items():
        if aranan in urunler:
            return depo
    return None

depolar = {'Ankara': ['somun', 'vida'], 'İzmir': ['vida'], 'Bursa': ['vida']}
print('Vida ilk bulunan depo:', ilk_depo(depolar, 'vida'))
''',
'break yalnız içinde bulunduğu EN İÇTEKİ döngüyü kırar; dış döngü sonraki depoyla devam eder ve mesaj üç kez basılır.',
'İç içe döngüden tamamen çıkmak için aramayı fonksiyona taşıyıp return kullan.'),
]
