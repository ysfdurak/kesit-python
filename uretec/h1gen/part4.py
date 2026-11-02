START = 61
K = 'Koşullar ve döngüler'
F = 'Fonksiyonlar ve kapsam'
D = 'Dosya ve kodlama'
ITEMS = [
(K, 'orta', 'Sıfırı "değer yok" sanmak',
'''\
stok = 0          # ürün gerçekten tükendi
if not stok:
    print('Stok bilgisi gelmedi')
else:
    print('Stok:', stok)
''',
'''\
stok = 0
if stok is None:
    print('Stok bilgisi gelmedi')
else:
    print('Stok:', stok)
''',
'0, 0.0, boş metin ve boş liste doğruluk testinde False sayılır. "if not stok" hem "değer yok" (None) hem "değer sıfır" durumunu yakalar; tükenmiş ürün, bilgisi eksik ürün gibi raporlanır.',
'Eksik değeri sınarken if x is None yaz; sıfır geçerli bir değer olabilir.'),

(K, 'ileri', 'Kayan noktalı sayıyla while koşulu kurmak',
'''\
oran = 0.0
adim = 0
while oran != 1.0 and adim < 20:   # sınır olmasa sonsuz döngü!
    oran += 0.1
    adim += 1
print(adim, oran)
''',
'''\
adim = 0
oran = 0.0
while oran < 1.0 - 1e-9:
    adim += 1
    oran = adim / 10       # hatayı biriktirme, her seferinde hesapla
print(adim, oran)
''',
'0.1 on kez toplanınca tam 1.0 olmaz (0.9999999999999999), bu yüzden != 1.0 koşulu hiç sağlanmaz ve döngü sonsuza gider. Burada güvenlik sınırı 20 adımda durdurdu.',
'Döngü koşulunda float için != / == kullanma; < ile tolerans koy ya da tamsayı sayaçtan hesapla.'),

(K, 'temel', 'enumerate() ile sırayı 0\'dan başlatmak',
'''\
kazananlar = ['Deniz', 'Mert', 'Selin']
for sira, ad in enumerate(kazananlar):
    print(f'{sira}. {ad}')
''',
'''\
kazananlar = ['Deniz', 'Mert', 'Selin']
for sira, ad in enumerate(kazananlar, start=1):
    print(f'{sira}. {ad}')
''',
'enumerate() saymaya 0\'dan başlar; kullanıcıya gösterilen sıra numaralarında birinci "0." olur.',
'Kullanıcıya gösterilecek numaralarda enumerate(..., start=1) kullan.'),

(K, 'ileri', 'match/case içinde sabit adı yazmak',
'''\
BASARILI = 200
yanit_kodu = 404
match yanit_kodu:
    case BASARILI:
        print('Ödeme alındı')
print('BASARILI artık:', BASARILI)
''',
'''\
from enum import IntEnum

class Durum(IntEnum):
    BASARILI = 200

yanit_kodu = 404
match yanit_kodu:
    case Durum.BASARILI:
        print('Ödeme alındı')
    case _:
        print('Ödeme başarısız, kod:', yanit_kodu)
''',
'case içinde noktasız bir ad yazmak bir YAKALAMA kalıbıdır: değer karşılaştırılmaz, her şey eşleşir ve değer o ada atanır. 404 yanıtı "Ödeme alındı" olarak işlenir, sabitin kendisi de 404 olur.',
'case içinde sabit kullanacaksan noktalı ad (Durum.BASARILI) ya da doğrudan literal yaz.'),

(F, 'orta', 'Değiştirilebilir varsayılan argüman',
'''\
def sepete_ekle(urun, sepet=[]):
    sepet.append(urun)
    return sepet

print(sepete_ekle('kalem'))    # müşteri A
print(sepete_ekle('defter'))   # müşteri B
''',
'''\
def sepete_ekle(urun, sepet=None):
    if sepet is None:
        sepet = []
    sepet.append(urun)
    return sepet

print(sepete_ekle('kalem'))
print(sepete_ekle('defter'))
''',
'Varsayılan değer fonksiyon TANIMLANIRKEN bir kez oluşturulur ve bütün çağrılar aynı listeyi paylaşır. B müşterisinin sepetinde A\'nın kalemi görünür.',
'Varsayılan argüman olarak liste/sözlük verme; None ver ve fonksiyon içinde yenisini oluştur.'),

(F, 'temel', 'return yazmayı unutmak',
'''\
def kdv_hesapla(tutar):
    sonuc = tutar * 0.20

print(kdv_hesapla(500))
''',
'''\
def kdv_hesapla(tutar):
    return tutar * 0.20

print(kdv_hesapla(500))
''',
'return içermeyen fonksiyon her zaman None döndürür. Hesap yapılır ama sonuç fonksiyonun içinde kalır.',
'Fonksiyonun ürettiği değeri return ile dışarı ver.'),

(F, 'temel', 'return yerine print kullanmak',
'''\
def indirim(tutar):
    print(tutar * 0.1)

toplam_indirim = indirim(300) + indirim(200)
print(toplam_indirim)
''',
'''\
def indirim(tutar):
    return tutar * 0.1

toplam_indirim = indirim(300) + indirim(200)
print(toplam_indirim)
''',
'print değeri yalnız ekrana yazar; fonksiyonun sonucu yine None olur. None + None işlemi TypeError verir. Ekranda sayıyı görmek, fonksiyonun onu döndürdüğü anlamına gelmez.',
'Hesaplayan fonksiyon return etsin; yazdırmayı çağıran kod yapsın.'),

(F, 'orta', 'Fonksiyon içinde global değişkeni artırmak',
'''\
toplam_ciro = 0

def satis_ekle(tutar):
    toplam_ciro += tutar

satis_ekle(250)
print(toplam_ciro)
''',
'''\
def satis_ekle(ciro, tutar):
    return ciro + tutar

toplam_ciro = 0
toplam_ciro = satis_ekle(toplam_ciro, 250)
print(toplam_ciro)
''',
'Fonksiyon içinde bir ada atama yapılınca (+= dahil) Python o adı YEREL kabul eder. Yerel değişken henüz değer almadığı için UnboundLocalError alırsın.',
'Global durumu fonksiyon içinde değiştirme; değeri parametreyle al, sonucu return et (gerekirse global anahtar kelimesi).'),

(F, 'ileri', 'Döngüde lambda ile geç bağlama',
'''\
indirimler = []
for oran in [10, 20, 30]:
    indirimler.append(lambda fiyat: fiyat * (100 - oran) / 100)
print([f(200) for f in indirimler])
''',
'''\
indirimler = []
for oran in [10, 20, 30]:
    indirimler.append(lambda fiyat, oran=oran: fiyat * (100 - oran) / 100)
print([f(200) for f in indirimler])
''',
'Kapanışlar (closure) değişkenin DEĞERİNİ değil ADINI hatırlar; değer fonksiyon çağrıldığında okunur (late binding). Çağrı anında döngü bittiği için hepsi son oranı (30) kullanır.',
'Döngüde fonksiyon üretirken değeri varsayılan argümanla ya da functools.partial ile o anda bağla.'),

(F, 'temel', 'Fonksiyonu parantezsiz çağırmak',
'''\
def stok_var():
    return False

if stok_var:
    print('Satışa açık')
else:
    print('Tükendi')
''',
'''\
def stok_var():
    return False

if stok_var():
    print('Satışa açık')
else:
    print('Tükendi')
''',
'Parantezsiz stok_var fonksiyonun kendisidir, çağrılmaz. Fonksiyon nesnesi doğruluk testinde her zaman True sayıldığı için ürün hep satışa açık görünür.',
'Fonksiyonu çağırmak için parantez yaz: stok_var().'),

(F, 'orta', 'Listeyi *args fonksiyonuna açmadan vermek',
'''\
def toplam_tutar(*tutarlar):
    return sum(tutarlar)

sepet = [120, 80, 45]
print(toplam_tutar(sepet))
''',
'''\
def toplam_tutar(*tutarlar):
    return sum(tutarlar)

sepet = [120, 80, 45]
print(toplam_tutar(*sepet))
''',
'*tutarlar argümanları bir demette toplar. Listeyi tek argüman olarak verince tutarlar = ([120, 80, 45],) olur ve sum() int ile listeyi toplamaya çalışıp TypeError verir.',
'Koleksiyonu ayrı argümanlar olarak geçirmek için çağrıda * ile aç.'),

(F, 'ileri', 'Varsayılan değeri globalden tanım anında almak',
'''\
KDV = 0.18

def kdv_ekle(tutar, oran=KDV):
    return round(tutar * (1 + oran), 2)

KDV = 0.20        # mevzuat değişti, ayar güncellendi
print(kdv_ekle(100))
''',
'''\
KDV = 0.18

def kdv_ekle(tutar, oran=None):
    if oran is None:
        oran = KDV
    return round(tutar * (1 + oran), 2)

KDV = 0.20
print(kdv_ekle(100))
''',
'Varsayılan değer def satırı çalıştığında bir kez hesaplanır. KDV sonradan değişse de fonksiyon eski oranı kullanmaya devam eder; ayar değişikliği sessizce etkisiz kalır.',
'Değişebilecek ayarları varsayılan değere gömme; None ver ve çağrı anında oku.'),

(F, 'ileri', 'İç fonksiyonda nonlocal yazmamak',
'''\
def sayac_olustur():
    adet = 0
    def arttir():
        adet += 1
        return adet
    return arttir

siparis_no = sayac_olustur()
print(siparis_no())
''',
'''\
def sayac_olustur():
    adet = 0
    def arttir():
        nonlocal adet
        adet += 1
        return adet
    return arttir

siparis_no = sayac_olustur()
print(siparis_no(), siparis_no())
''',
'İç fonksiyon dıştaki değişkeni okuyabilir ama atama yaptığı anda (+=) o ad iç fonksiyonun yereli olur. Okuma atamadan önce geldiği için UnboundLocalError alırsın.',
'Kapanış içinde dış değişkeni değiştireceksen nonlocal ile bildir.'),

(F, 'orta', 'Argüman olarak gelen listeyi değiştirmek',
'''\
def indirimli(fiyatlar):
    for i in range(len(fiyatlar)):
        fiyatlar[i] = round(fiyatlar[i] * 0.9, 2)
    return fiyatlar

liste_fiyat = [100, 250]
kampanya = indirimli(liste_fiyat)
print('Liste:', liste_fiyat)
print('Kampanya:', kampanya)
''',
'''\
def indirimli(fiyatlar):
    return [round(f * 0.9, 2) for f in fiyatlar]

liste_fiyat = [100, 250]
kampanya = indirimli(liste_fiyat)
print('Liste:', liste_fiyat)
print('Kampanya:', kampanya)
''',
'Python argümanları nesneye başvuru olarak geçirir; fonksiyon listeyi yerinde değiştirirse çağıranın listesi de değişir. Liste fiyatları kampanyayla birlikte kalıcı olarak düşer.',
'Fonksiyon, açıkça istenmedikçe aldığı listeyi değiştirmesin; yeni liste döndürsün.'),

(F, 'ileri', 'Derin özyinelemeyle büyük listeyi işlemek',
'''\
def toplam(liste):
    if not liste:
        return 0
    return liste[0] + toplam(liste[1:])

print(toplam(list(range(5000))))
''',
'''\
def toplam(liste):
    sonuc = 0
    for x in liste:
        sonuc += x
    return sonuc

print(toplam(list(range(5000))))
''',
'Python kuyruk özyinelemeyi optimize etmez ve çağrı derinliği varsayılan olarak yaklaşık 1000 ile sınırlıdır; 5000 elemanda RecursionError alırsın. Ayrıca liste[1:] her adımda kopya üretir ve iş O(n²) olur.',
'Derinliği veriye bağlı özyineleme yerine döngü kullan; özyinelemeyi ağaç gibi sığ yapılara sakla.'),

(F, 'temel', 'Konumsal argümanların sırasını karıştırmak',
'''\
def kargo_ucreti(agirlik_kg, mesafe_km):
    return 20 + agirlik_kg * 5 + mesafe_km * 0.1

print(kargo_ucreti(450, 2))     # 2 kg, 450 km kastedildi
''',
'''\
def kargo_ucreti(agirlik_kg, mesafe_km):
    return 20 + agirlik_kg * 5 + mesafe_km * 0.1

print(kargo_ucreti(mesafe_km=450, agirlik_kg=2))
''',
'Konumsal argümanlar yalnız sırayla eşleşir. Aynı türden iki sayıyı yer değiştirmek hata vermez, sadece yanlış sonuç (2270.2 TL) üretir.',
'Aynı türden birden çok parametre varsa çağrıda anahtar kelimeli argüman kullan.'),

(F, 'ileri', 'Dekoratörde functools.wraps unutmak',
'''\
def zamanla(f):
    def sarmal(*args, **kwargs):
        return f(*args, **kwargs)
    return sarmal

@zamanla
def rapor_olustur():
    """Günlük satış raporunu hazırlar."""
    return 'ok'

print(rapor_olustur.__name__, '|', rapor_olustur.__doc__)
''',
'''\
import functools

def zamanla(f):
    @functools.wraps(f)
    def sarmal(*args, **kwargs):
        return f(*args, **kwargs)
    return sarmal

@zamanla
def rapor_olustur():
    """Günlük satış raporunu hazırlar."""
    return 'ok'

print(rapor_olustur.__name__, '|', rapor_olustur.__doc__)
''',
'Dekoratör orijinal fonksiyonu sarmal fonksiyonla değiştirir; ad, belge metni ve imza kaybolur. Loglar, hata izleri, yardım sayfaları ve fonksiyon adına göre çalışan araçlar (ör. web yönlendirme) yanlış ad görür.',
'Her dekoratörde iç fonksiyonu @functools.wraps(f) ile süsle.'),

(F, 'orta', 'Döngünün ilk turunda return etmek',
'''\
def hepsi_odendi(faturalar):
    for f in faturalar:
        if f['odendi']:
            return True
        else:
            return False

print(hepsi_odendi([{'odendi': True}, {'odendi': False}]))
''',
'''\
def hepsi_odendi(faturalar):
    for f in faturalar:
        if not f['odendi']:
            return False
    return True

print(hepsi_odendi([{'odendi': True}, {'odendi': False}]))
print(all(f['odendi'] for f in [{'odendi': True}]))
''',
'Döngüdeki if/else\'in iki dalında da return olunca fonksiyon yalnız İLK elemana bakıp çıkar. Ödenmemiş ikinci fatura hiç denetlenmez.',
'"Hepsi" sorusunda olumsuz durumda erken çık, olumlu sonucu döngü bitince ver (ya da all() kullan).'),

(D, 'orta', 'Windows-1254 dosyayı UTF-8 sanmak',
'''\
# Eski muhasebe programının çıktısını taklit ediyoruz
with open('musteriler.csv', 'w', encoding='cp1254') as f:
    f.write('ad;şehir\\nŞule;Çorum\\n')

with open('musteriler.csv', encoding='utf-8') as f:
    print(f.read())
''',
'''\
with open('musteriler.csv', 'w', encoding='cp1254') as f:
    f.write('ad;şehir\\nŞule;Çorum\\n')

with open('musteriler.csv', encoding='cp1254') as f:
    print(f.read())
''',
'Türkçe Windows ve eski Excel çıktıları çoğu zaman cp1254 (Windows-1254) kodlamasıyla yazılır. Bu baytları UTF-8 diye okumaya çalışınca ş, Ç gibi harflerde UnicodeDecodeError alırsın.',
'Dosyanın kodlamasını öğren ve open() içinde encoding= ile açıkça belirt.'),

(D, 'temel', 'Günlüğe \'w\' kipiyle yazmak',
'''\
for olay in ['giriş', 'sipariş', 'çıkış']:
    with open('islem.log', 'w', encoding='utf-8') as f:
        f.write(olay + '\\n')

with open('islem.log', encoding='utf-8') as f:
    print(f.read())
''',
'''\
open('islem.log', 'w', encoding='utf-8').close()   # örnek için günlüğü sıfırla
for olay in ['giriş', 'sipariş', 'çıkış']:
    with open('islem.log', 'a', encoding='utf-8') as f:
        f.write(olay + '\\n')

with open('islem.log', encoding='utf-8') as f:
    print(f.read())
''',
'\'w\' kipi dosyayı her açılışta SIFIRLAR. Döngüde her olay öncekini siler ve günlükte yalnız son satır kalır.',
'Var olan dosyanın sonuna eklemek için \'a\' (append) kipini kullan.'),
]
