START = 1
D = 'Değişkenler ve türler'
S = 'Sayılar ve kayan nokta'
M = 'Metinler ve Türkçe karakter'
ITEMS = [
(D, 'temel', 'input() ile gelen sayıları toplamak',
'''\
# Anadolu Market sepet ekranı: değerler input() ile geldi (input hep str döndürür)
sepet = '120'
kargo = '30'
print('Ödenecek:', sepet + kargo)
''',
'''\
sepet = '120'
kargo = '30'
print('Ödenecek:', int(sepet) + int(kargo))
''',
'input() ve dosyadan okunan her değer metindir (str). İki metni + ile birleştirince toplama değil yan yana ekleme olur: 120 ile 30 yerine 12030 çıkar. Hata vermediği için fark edilmesi zordur.',
'Dışarıdan gelen veriyi hesaba sokmadan önce int() ya da float() ile türüne çevir.'),

(D, 'temel', 'Metinle sayıyı + ile birleştirmek',
'''\
toplam = 150
print('Sipariş toplamı: ' + toplam + ' TL')
''',
'''\
toplam = 150
print(f'Sipariş toplamı: {toplam} TL')
''',
'Python türleri kendiliğinden dönüştürmez: str + int işlemi TypeError verir (can only concatenate str (not "int") to str). JavaScript gibi dillerden gelenlerin en sık yaptığı hatadır.',
'Metin içine değer koyacaksan f-string kullan; + ile yalnız metinleri birleştir.'),

(D, 'temel', 'Listeyi = ile kopyaladığını sanmak',
'''\
kasim_fiyat = [100, 250, 80]
aralik_fiyat = kasim_fiyat          # kopya sanıldı
aralik_fiyat[0] = 120               # yalnız aralık zamlanacaktı
print('Kasım:', kasim_fiyat)
print('Aralık:', aralik_fiyat)
''',
'''\
kasim_fiyat = [100, 250, 80]
aralik_fiyat = kasim_fiyat.copy()   # ya da list(kasim_fiyat), kasim_fiyat[:]
aralik_fiyat[0] = 120
print('Kasım:', kasim_fiyat)
print('Aralık:', aralik_fiyat)
''',
'Atama (=) nesneyi kopyalamaz; aynı listeye ikinci bir ad (etiket) verir. Bu yüzden aralik_fiyat üzerinden yapılan değişiklik kasim_fiyat\'ta da görünür ve geçmiş ayın fiyatları bozulur.',
'= yeni ad verir, kopya üretmez; değiştirilebilir nesneyi kopyalamak için .copy() kullan.'),

(D, 'ileri', 'Değer karşılaştırmasında is kullanmak',
'''\
limit = int('1000')        # formdan gelen değer
harcama = 1000
if harcama is limit:
    print('Limite ulaştın')
else:
    print('Limitin altındasın')
''',
'''\
limit = int('1000')
harcama = 1000
if harcama == limit:
    print('Limite ulaştın')
else:
    print('Limitin altındasın')
''',
'is iki adın AYNI nesne olup olmadığına bakar, == ise değerlerin eşitliğine. CPython yalnız -5..256 arası küçük tamsayıları önbellekte tuttuğu için küçük sayılarda is tesadüfen doğru çalışır, 1000 gibi değerlerde ise iki ayrı nesne oluşur ve sonuç False olur.',
'Değer karşılaştırmasında == kullan; is yalnız None, True, False gibi tekil nesneler için.'),

(D, 'temel', 'Yerleşik adları değişken adı yapmak',
'''\
gunluk = [1200, 850, 990]
sum = 0
for g in gunluk:
    sum += g
print('Hafta toplamı:', sum)
haftalik = [3040, 2780]
print('Ay toplamı:', sum(haftalik))
''',
'''\
gunluk = [1200, 850, 990]
toplam = 0
for g in gunluk:
    toplam += g
print('Hafta toplamı:', toplam)
haftalik = [3040, 2780]
print('Ay toplamı:', sum(haftalik))
''',
'sum, list, str, max, id, type, input gibi adlar yerleşik fonksiyonlardır. Aynı adla değişken tanımlayınca yerleşik fonksiyonu gölgelersin; sonra sum(...) çağırınca \'int\' object is not callable (TypeError) alırsın.',
'Değişkenlere yerleşik fonksiyon adı verme: list yerine urunler, sum yerine toplam yaz.'),

(D, 'orta', 'bool(\'False\') değerinin True olması',
'''\
# ayar.conf dosyasından okunan değer metin olarak geldi
bakim_modu = 'False'
if bakim_modu:
    print('Site bakımda, siparişler kapalı')
else:
    print('Siparişler açık')
''',
'''\
bakim_modu = 'False'
bakim_acik = bakim_modu.strip().lower() in ('true', '1', 'evet')
if bakim_acik:
    print('Site bakımda, siparişler kapalı')
else:
    print('Siparişler açık')
''',
'Boş olmayan her metin doğruluk testinde True sayılır; \'False\', \'0\' ve \'hayır\' metinleri de dahil. Ayar dosyası, ortam değişkeni ya da CSV\'den gelen mantıksal değerler metin olduğu için if ile doğrudan sınanamaz.',
'Metinden gelen mantıksal değeri açıkça karşılaştırarak çevir; bool(metin) kullanma.'),

(D, 'temel', 'Ondalıklı metni doğrudan int() ile çevirmek',
'''\
# Lezzet Kurye: paket ağırlığı formdan '3.5' olarak geldi
agirlik = int('3.5')
print(agirlik)
''',
'''\
agirlik = float('3.5')
print(agirlik)
print('Yuvarlanmış kg:', round(agirlik))
''',
'int() ondalık nokta içeren bir metni çeviremez: ValueError (invalid literal for int() with base 10). int(3.5) sayıda çalışır ama int(\'3.5\') metinde çalışmaz.',
'Ondalık olabilecek metni önce float() ile çevir; tamsayı gerekiyorsa sonra round() ya da int() uygula.'),

(D, 'orta', 'İç içe listede sığ kopya',
'''\
sablon = [['Pazartesi', []], ['Salı', []]]
ekip_a = sablon.copy()
ekip_a[0][1].append('Ayşe')
print('Şablon:', sablon)
''',
'''\
import copy
sablon = [['Pazartesi', []], ['Salı', []]]
ekip_a = copy.deepcopy(sablon)
ekip_a[0][1].append('Ayşe')
print('Şablon:', sablon)
print('Ekip A:', ekip_a)
''',
'.copy(), list() ve [:] sığ (shallow) kopya üretir: dış liste yenidir ama içindeki listeler hâlâ ortaktır. İç listeye eklenen eleman şablonu da bozar; Pusula İK vardiya şablonları tam bu yüzden karışır.',
'İç içe değiştirilebilir yapıları kopyalarken copy.deepcopy() kullan.'),

(D, 'orta', 'Tek elemanlı demette virgülü unutmak',
'''\
sehirler = ('İzmir')          # demet sanıldı
for s in sehirler:
    print(s, end=' ')
print()
print(type(sehirler).__name__)
''',
'''\
sehirler = ('İzmir',)         # virgül demeti yapar
for s in sehirler:
    print(s, end=' ')
print()
print(type(sehirler).__name__)
''',
'Demeti parantez değil virgül oluşturur. (\'İzmir\') yalnız parantez içine alınmış bir metindir; döngü onu harf harf gezer. Tek elemanlı demet için sondaki virgül zorunludur.',
'Tek elemanlı demet yazarken virgülü koy: (x,).'),

(D, 'ileri', 'True değerinin int sayılması',
'''\
# JSON'dan gelen adet listesi; biri yanlışlıkla true olmuş
adetler = [10, True, 5, 'yok']
toplam = sum(a for a in adetler if isinstance(a, int))
print('Toplam adet:', toplam)
''',
'''\
adetler = [10, True, 5, 'yok']
gecerli = [a for a in adetler if isinstance(a, int) and not isinstance(a, bool)]
print('Toplam adet:', sum(gecerli))
print('Atlanan kayıt:', len(adetler) - len(gecerli))
''',
'bool, int\'in alt sınıfıdır: isinstance(True, int) True döner ve True toplamada 1 sayılır. Veri doğrulamada bu yüzden hatalı true değerleri sessizce sayı gibi işlenir.',
'Sayı denetiminde bool\'u ayrıca dışla: isinstance(x, int) and not isinstance(x, bool).'),

(S, 'temel', 'Kayan noktalı sayıları == ile karşılaştırmak',
'''\
odenen = 0.1 + 0.2
beklenen = 0.3
if odenen == beklenen:
    print('Ödeme tamam')
else:
    print('Eksik ödeme!', odenen)
''',
'''\
import math
odenen = 0.1 + 0.2
beklenen = 0.3
if math.isclose(odenen, beklenen, abs_tol=1e-9):
    print('Ödeme tamam')
else:
    print('Eksik ödeme!', odenen)
''',
'0.1 ve 0.2 ikili sistemde tam gösterilemez; toplam 0.30000000000000004 olur. Kayan noktalı (float) sayılarda == neredeyse hiç güvenilir değildir.',
'float karşılaştırırken math.isclose() ya da bir tolerans kullan; para için Decimal veya kuruş (int) tut.'),

(S, 'temel', '/ bölmesinin hep float döndürmesi',
'''\
urun_sayisi = 10
sayfa_basi = 5
sayfa = urun_sayisi / sayfa_basi
for s in range(sayfa):
    print('Sayfa', s + 1)
''',
'''\
urun_sayisi = 10
sayfa_basi = 5
sayfa = urun_sayisi // sayfa_basi
for s in range(sayfa):
    print('Sayfa', s + 1)
''',
'Python 3\'te / bölmesi sonuç tam çıksa bile float döndürür (10 / 5 = 2.0). range(), liste indeksi gibi yerler float kabul etmez ve TypeError verir.',
'Tamsayı sonuç gerekiyorsa // kullan; yukarı yuvarlamak için -(-a // b) ya da math.ceil.'),

(S, 'orta', 'round() fonksiyonunun banker yuvarlaması',
'''\
# Fatura tutarlarını tam liraya yuvarla
for tutar in [0.5, 1.5, 2.5, 3.5]:
    print(tutar, '->', round(tutar))
''',
'''\
from decimal import Decimal, ROUND_HALF_UP
for tutar in ['0.5', '1.5', '2.5', '3.5']:
    yuv = Decimal(tutar).quantize(Decimal('1'), rounding=ROUND_HALF_UP)
    print(tutar, '->', yuv)
''',
'round() "yarımı çifte yuvarla" (banker yuvarlaması) kuralını kullanır: 0.5 → 0, 2.5 → 2. Okulda öğrendiğin "yarım yukarı" kuralı değildir; faturada kuruş farkları doğurur.',
'Ticari yuvarlama gerekiyorsa Decimal ve ROUND_HALF_UP kullan; round()\'a güvenme.'),

(S, 'orta', 'Parayı float ile toplamak',
'''\
# Ilgaz Bank: 10 adet 0.10 TL komisyon
toplam = 0
for _ in range(10):
    toplam += 0.10
print(toplam)
print(toplam == 1.0)
''',
'''\
from decimal import Decimal
toplam = Decimal('0')
for _ in range(10):
    toplam += Decimal('0.10')
print(toplam)
print(toplam == Decimal('1.00'))
''',
'Her float toplama küçük bir yuvarlama hatası ekler ve hatalar birikir: 0.10\'u on kez toplayınca 1.0 yerine 0.9999999999999999 çıkar. Muhasebe mutabakatında bu kuruşlar sorun olur.',
'Para hesabında Decimal (metinden kurulmuş) ya da kuruş cinsinden int kullan.'),

(S, 'orta', 'Decimal nesnesini float\'tan kurmak',
'''\
from decimal import Decimal
faiz = Decimal(0.1)
print(faiz)
print(faiz * 3 == Decimal('0.3'))
''',
'''\
from decimal import Decimal
faiz = Decimal('0.1')
print(faiz)
print(faiz * 3 == Decimal('0.3'))
''',
'Decimal(0.1) yazınca float\'ın taşıdığı ikili hata da Decimal\'e kopyalanır ve 55 basamaklı bir sayı elde edersin. Decimal\'in kesinliği ancak metinden kurulunca işe yarar.',
'Decimal\'i her zaman metinden kur: Decimal(\'0.1\').'),

(S, 'ileri', 'Negatif bölmede int() ile aşağı yuvarladığını sanmak',
'''\
# Gün farkını haftaya çevir (-10 = 10 gün önce); haftalar AŞAĞI yuvarlanmalı
for gun in [10, 3, -3, -10]:
    print(gun, '-> hafta', int(gun / 7))
''',
'''\
for gun in [10, 3, -3, -10]:
    print(gun, '-> hafta', gun // 7)
''',
'int() sayıyı sıfıra doğru keser (-0.43 → 0, -1.43 → -1), // ise aşağı, eksi sonsuza doğru yuvarlar (-3 // 7 = -1). Pozitif sayılarda ikisi aynı sonucu verdiği için hata ancak geçmiş tarihler (negatif farklar) gelince ortaya çıkar. Aynı nedenle -7 % 2 de -1 değil 1 olur.',
'Aşağı yuvarlamak istiyorsan // ya da math.floor kullan; int() sıfıra doğru keser.'),

(S, 'temel', 'Sayıları metin olarak karşılaştırmak',
'''\
# CSV'den gelen stok değerleri metin
stok = '9'
esik = '10'
if stok > esik:
    print('Stok yeterli')
else:
    print('Sipariş ver')
''',
'''\
stok = '9'
esik = '10'
if int(stok) > int(esik):
    print('Stok yeterli')
else:
    print('Sipariş ver')
''',
'Metinler harf harf (sözlük sırasıyla) karşılaştırılır: \'9\' > \'10\' çünkü \'9\' > \'1\'. Aynı sorun sorted() ile metin sayıları sıralarken de çıkar: [\'10\', \'9\', \'100\'] doğru sıralanmaz.',
'Sayısal karşılaştırma ve sıralamadan önce metni sayıya çevir.'),

(S, 'ileri', 'NaN değerinin max ve sıralamayı bozması',
'''\
# Kanat Havayolları: bir sensör ölçümü okunamadı (nan)
olcumler = [float('nan'), 41.2, 39.8, 43.5]
print('En yüksek:', max(olcumler))
print('En düşük:', min(olcumler))
''',
'''\
import math
olcumler = [float('nan'), 41.2, 39.8, 43.5]
gecerli = [x for x in olcumler if not math.isnan(x)]
print('En yüksek:', max(gecerli))
print('En düşük:', min(gecerli))
''',
'NaN hiçbir şeyle (kendisiyle bile) karşılaştırılamaz; her < ve > sorusuna False döner. Bu yüzden max() ve min() NaN listenin başındaysa NaN döndürür, başka yerdeyse onu yok sayar; sorted() da NaN\'in konumuna göre bozuk sıra üretir. Hiçbiri hata vermez.',
'Karşılaştırma ve sıralamadan önce NaN değerleri math.isnan() ile ayıkla.'),

(M, 'temel', 'Türkçe i harfinde upper()',
'''\
sehir = 'istanbul'
print(sehir.upper())
print(sehir.upper() == 'İSTANBUL')
''',
'''\
def tr_upper(metin):
    return metin.replace('i', 'İ').replace('ı', 'I').upper()

sehir = 'istanbul'
print(tr_upper(sehir))
print(tr_upper(sehir) == 'İSTANBUL')
''',
'Python\'ın upper()/lower() fonksiyonları dilden bağımsız Unicode kurallarını uygular: küçük i büyüyünce noktasız I olur. Türkçede doğrusu İ\'dir; şehir adı ve müşteri adı eşleştirmeleri bu yüzden tutmaz.',
'Türkçe metinde büyük/küçük harf çevirmeden önce i/İ ve ı/I harflerini kendin eşle.'),

(M, 'ileri', 'İ harfini lower() ile küçültmek',
'''\
girilen = 'İZMİR'
kayitli = 'izmir'
kucuk = girilen.lower()
print(len(girilen), len(kucuk))
print(kucuk == kayitli)
''',
'''\
def tr_lower(metin):
    return metin.replace('İ', 'i').replace('I', 'ı').lower()

girilen = 'İZMİR'
kayitli = 'izmir'
kucuk = tr_lower(girilen)
print(len(girilen), len(kucuk))
print(kucuk == kayitli)
''',
'\'İ\'.lower() tek harf değil, i + birleşen nokta (U+0307) olmak üzere İKİ karakter üretir. Metin uzar ve görünüşte aynı olan \'izmir\' ile eşit çıkmaz; arama ve filtreler sessizce kaçar.',
'Türkçe metni küçültürken İ ve I harflerini lower()\'dan önce kendin dönüştür.'),
]
