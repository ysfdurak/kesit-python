START = 81
D = 'Dosya ve kodlama'
H = 'Hatalar ve istisnalar'
O = 'OOP'
ITEMS = [
(D, 'temel', 'write() ile satır sonunu unutmak',
'''\
subeler = ['Ankara', 'İzmir', 'Bursa']
with open('subeler.txt', 'w', encoding='utf-8') as f:
    for s in subeler:
        f.write(s)

with open('subeler.txt', encoding='utf-8') as f:
    print(f.read())
''',
'''\
subeler = ['Ankara', 'İzmir', 'Bursa']
with open('subeler.txt', 'w', encoding='utf-8') as f:
    for s in subeler:
        f.write(s + '\\n')

with open('subeler.txt', encoding='utf-8') as f:
    print(f.read())
''',
'print() satır sonunu kendisi ekler ama write() eklemez. Satırlar birbirine yapışır ve dosya tek satır olur.',
'write() ile satır yazarken \\n\'yi kendin ekle (ya da print(..., file=f) kullan).'),

(D, 'temel', 'readlines() satır sonlarını unutmak',
'''\
with open('kara_liste.txt', 'w', encoding='utf-8') as f:
    f.write('ali@ornek.com\\nveli@ornek.com\\n')

with open('kara_liste.txt', encoding='utf-8') as f:
    liste = f.readlines()
print(liste)
print('veli@ornek.com' in liste)
''',
'''\
with open('kara_liste.txt', 'w', encoding='utf-8') as f:
    f.write('ali@ornek.com\\nveli@ornek.com\\n')

with open('kara_liste.txt', encoding='utf-8') as f:
    liste = f.read().splitlines()
print(liste)
print('veli@ornek.com' in liste)
''',
'readlines() ve for satir in f her satırı sonundaki \\n ile birlikte verir. \'veli@ornek.com\' ile \'veli@ornek.com\\n\' eşit olmadığı için kara listedeki adres yakalanmaz.',
'Satırları karşılaştırmadan önce strip() uygula ya da read().splitlines() kullan.'),

(D, 'orta', 'Aynı dosya nesnesini iki kez okumak',
'''\
with open('sayilar.txt', 'w', encoding='utf-8') as f:
    f.write('10\\n20\\n30\\n')

with open('sayilar.txt', encoding='utf-8') as f:
    adet = len(f.readlines())
    toplam = sum(int(s) for s in f)
print(adet, toplam)
''',
'''\
with open('sayilar.txt', 'w', encoding='utf-8') as f:
    f.write('10\\n20\\n30\\n')

with open('sayilar.txt', encoding='utf-8') as f:
    satirlar = f.readlines()
adet = len(satirlar)
toplam = sum(int(s) for s in satirlar)
print(adet, toplam)
''',
'Dosya nesnesi okuma konumunu (imleç) hatırlar. İlk okuma dosyanın sonuna gider; ikinci okuma hiçbir şey bulamaz ve toplam 0 çıkar, hata da vermez.',
'Dosyayı bir kez oku ve sonucu değişkende tut; gerekirse f.seek(0) ile başa dön.'),

(D, 'orta', 'Noktalı virgüllü CSV\'yi varsayılan ayarla okumak',
'''\
import csv
with open('fiyat.csv', 'w', encoding='utf-8') as f:
    f.write('urun;fiyat\\nçay;42,5\\nşeker;38\\n')

with open('fiyat.csv', encoding='utf-8', newline='') as f:
    for satir in csv.reader(f):
        print(satir)
''',
'''\
import csv
with open('fiyat.csv', 'w', encoding='utf-8') as f:
    f.write('urun;fiyat\\nçay;42,5\\nşeker;38\\n')

with open('fiyat.csv', encoding='utf-8', newline='') as f:
    for satir in csv.DictReader(f, delimiter=';'):
        print(satir['urun'], float(satir['fiyat'].replace(',', '.')))
''',
'Türkçe Excel, ondalık ayırıcı virgül olduğu için CSV\'de alanları ; ile ayırır. csv modülü varsayılan olarak virgülle böldüğü için 42,5 fiyatı ikiye bölünür, sütunlar kayar.',
'Türkçe CSV dosyalarında delimiter=\';\' ver ve ondalık virgülü noktaya çevir.'),

(D, 'ileri', 'Excel CSV\'sindeki BOM\'u görmezden gelmek',
'''\
import csv
# Excel "CSV UTF-8" çıktısı dosyanın başına BOM işareti koyar
with open('personel.csv', 'w', encoding='utf-8-sig') as f:
    f.write('ad,departman\\nEce,Satış\\n')

with open('personel.csv', encoding='utf-8', newline='') as f:
    satir = next(csv.DictReader(f))
print(satir['ad'])
''',
'''\
import csv
with open('personel.csv', 'w', encoding='utf-8-sig') as f:
    f.write('ad,departman\\nEce,Satış\\n')

with open('personel.csv', encoding='utf-8-sig', newline='') as f:
    satir = next(csv.DictReader(f))
print(satir['ad'])
''',
'BOM (U+FEFF) dosyanın ilk karakteridir ve utf-8 ile okununca ilk sütunun adına yapışır: \'\\ufeffad\'. Ekranda görünmediği için satir[\'ad\'] neden KeyError veriyor anlaşılmaz.',
'Excel\'den gelen UTF-8 CSV\'leri encoding=\'utf-8-sig\' ile aç.'),

(D, 'ileri', 'Dosyayı kapatmadan okumak',
'''\
f = open('rapor.txt', 'w', encoding='utf-8')
f.write('Günlük ciro: 18450 TL\\n')
# close() unutuldu; başka bir adım dosyayı hemen okuyor
with open('rapor.txt', encoding='utf-8') as g:
    print(repr(g.read()))
''',
'''\
with open('rapor.txt', 'w', encoding='utf-8') as f:
    f.write('Günlük ciro: 18450 TL\\n')
with open('rapor.txt', encoding='utf-8') as g:
    print(repr(g.read()))
''',
'write() veriyi önce bellekteki tampona yazar; disk ancak tampon dolunca, flush() ya da close() çağrılınca güncellenir. Kapatılmamış dosyayı okuyan adım boş dosya görür; program çökerse veri hiç yazılmaz.',
'Dosyaları her zaman with bloğuyla aç; blok bitince dosya kesin kapanır.'),

(H, 'temel', 'Çıplak except ile hataları yutmak',
'''\
def ortalama(tutarlar):
    try:
        return sum(tutarlar) / len(tutralar)    # yazım hatası
    except:
        return 'Geçersiz veri'

print(ortalama([100, 200]))
''',
'''\
def ortalama(tutarlar):
    try:
        return sum(tutarlar) / len(tutarlar)
    except ZeroDivisionError:
        return 'Veri yok'

print(ortalama([100, 200]))
print(ortalama([]))
''',
'except: (türsüz) her hatayı yakalar; burada yazım hatasından doğan NameError da "geçersiz veri" diye gizlenir. Hata ayıklamak saatler alır, çünkü gerçek neden hiç görünmez.',
'Yalnız beklediğin ve ele alabildiğin hata türünü yakala.'),

(H, 'temel', 'Yanlış hata türünü yakalamak',
'''\
def birim_fiyat(tutar, adet):
    try:
        return tutar / adet
    except ValueError:
        return 0

print(birim_fiyat(500, 0))
''',
'''\
def birim_fiyat(tutar, adet):
    try:
        return tutar / adet
    except ZeroDivisionError:
        return 0

print(birim_fiyat(500, 0))
''',
'Sıfıra bölme ValueError değil ZeroDivisionError fırlatır. except bloğu eşleşmediği için hata yakalanmaz ve program çöker.',
'Hangi hatanın fırlatılacağını bir kez çalıştırıp gör; except\'e o türü yaz.'),

(H, 'orta', 'Genel except\'i özelinden önce yazmak',
'''\
try:
    adet = int('on iki')
except Exception:
    print('Bilinmeyen hata')
except ValueError:
    print('Lütfen adedi rakamla yaz')
''',
'''\
try:
    adet = int('on iki')
except ValueError:
    print('Lütfen adedi rakamla yaz')
except Exception:
    print('Bilinmeyen hata')
''',
'except blokları yukarıdan aşağı denenir ve ilk eşleşen çalışır. ValueError da bir Exception olduğu için genel blok her şeyi yakalar; özel mesaj hiç gösterilmez.',
'except bloklarını özelden genele doğru sırala.'),

(H, 'ileri', 'finally içinde return yazmak',
'''\
def odeme_al(tutar):
    try:
        if tutar <= 0:
            raise ValueError('Geçersiz tutar')
        return 'ödendi'
    finally:
        return 'işlem tamamlandı'

print(odeme_al(-50))
''',
'''\
def odeme_al(tutar):
    try:
        if tutar <= 0:
            raise ValueError('Geçersiz tutar')
        return 'ödendi'
    finally:
        print('Kayıt kapatıldı')

try:
    print(odeme_al(-50))
except ValueError as e:
    print('Hata:', e)
''',
'finally içindeki return, try\'dan fırlayan hatayı sessizce iptal eder ve dönüş değerini ezer. Geçersiz ödeme "tamamlandı" sayılır. (Python 3.14 bu kullanım için uyarı da verir.)',
'finally yalnız temizlik yapsın; içinde return, break, continue kullanma.'),

(H, 'temel', 'Metin fırlatmaya çalışmak',
'''\
def stok_dus(stok, adet):
    if adet > stok:
        raise 'Yetersiz stok'
    return stok - adet

print(stok_dus(3, 5))
''',
'''\
def stok_dus(stok, adet):
    if adet > stok:
        raise ValueError('Yetersiz stok')
    return stok - adet

try:
    print(stok_dus(3, 5))
except ValueError as e:
    print('Hata:', e)
''',
'raise yalnız istisna sınıfı ya da nesnesi kabul eder. Metin fırlatmak kendi başına TypeError (exceptions must derive from BaseException) üretir ve asıl mesaj kaybolur.',
'raise ile her zaman bir istisna nesnesi fırlat: raise ValueError(\'mesaj\').'),

(H, 'ileri', 'except değişkenini bloktan sonra kullanmak',
'''\
try:
    int('abc')
except ValueError as e:
    print('Dönüştürülemedi')
print('Son hata:', e)
''',
'''\
son_hata = None
try:
    int('abc')
except ValueError as e:
    print('Dönüştürülemedi')
    son_hata = e
print('Son hata:', son_hata)
''',
'except ... as e ile verilen ad, blok bitince Python tarafından SİLİNİR (döngüsel başvuruları önlemek için). Bloğun dışında e\'ye erişmek NameError verir.',
'Hatayı sonra kullanacaksan except içinde başka bir değişkene ata.'),

(H, 'orta', 'try bloğunu bütün döngünün etrafına koymak',
'''\
kayitlar = ['120', '80', 'yok', '45']
toplam = 0
try:
    for k in kayitlar:
        toplam += int(k)
except ValueError:
    print('Hatalı kayıt atlandı')
print('Toplam:', toplam)
''',
'''\
kayitlar = ['120', '80', 'yok', '45']
toplam = 0
for k in kayitlar:
    try:
        toplam += int(k)
    except ValueError:
        print('Hatalı kayıt atlandı:', k)
print('Toplam:', toplam)
''',
'Hata döngünün dışında yakalanınca döngü ilk hatalı kayıtta TAMAMEN durur. Mesaj "atlandı" der ama aslında sonraki bütün kayıtlar (45) da işlenmemiştir.',
'Kayıt başına devam etmek istiyorsan try/except\'i döngünün içine koy.'),

(H, 'ileri', 'Üreteç içinde next() hatasını sızdırmak',
'''\
def ikiserli(siparisler):
    akis = iter(siparisler)
    while True:
        a = next(akis)
        b = next(akis)
        yield (a, b)

print(list(ikiserli([101, 102, 103, 104, 105])))
''',
'''\
def ikiserli(siparisler):
    akis = iter(siparisler)
    while True:
        try:
            a = next(akis)
        except StopIteration:
            return
        b = next(akis, None)
        yield (a, b)

print(list(ikiserli([101, 102, 103, 104, 105])))
''',
'PEP 479\'dan beri üreteç gövdesinden sızan StopIteration, RuntimeError (generator raised StopIteration) hatasına dönüştürülür. Eski kodlarda sessizce biten döngüler bugün çöker.',
'Üreteç içinde next() kullanırken StopIteration\'ı yakala ya da next(it, varsayılan) yaz.'),

(H, 'ileri', '__exit__ içinden True döndürmek',
'''\
class Islem:
    def __enter__(self):
        print('İşlem başladı')
        return self
    def __exit__(self, tur, deger, iz):
        print('İşlem kapandı')
        return True          # "başarılı" demek istendi

with Islem():
    bakiye = 100 - int('elli')
print('Havale tamamlandı')
''',
'''\
class Islem:
    def __enter__(self):
        print('İşlem başladı')
        return self
    def __exit__(self, tur, deger, iz):
        print('İşlem kapandı')
        return False         # hatayı bastırma

try:
    with Islem():
        bakiye = 100 - int('elli')
    print('Havale tamamlandı')
except ValueError:
    print('Havale iptal: tutar geçersiz')
''',
'Bağlam yöneticisinin __exit__ metodu True döndürürse with bloğundaki hata BASTIRILIR. Hatalı havale başarılı gibi devam eder.',
'__exit__ yalnız bilerek bastırmak istediğin hatalarda True döndürsün; varsayılan None/False.'),

(H, 'orta', 'Çıplak except ile sys.exit()\'i yakalamak',
'''\
import sys

def kapat():
    sys.exit('Bakım başlıyor')

try:
    kapat()
except:
    print('Bir sorun oldu, devam ediliyor')
print('Sipariş alınmaya devam')
''',
'''\
import sys

def kapat():
    sys.exit('Bakım başlıyor')

def calistir():
    try:
        kapat()
    except Exception:
        print('Bir sorun oldu, devam ediliyor')
    print('Sipariş alınmaya devam')

try:
    calistir()
except SystemExit as e:      # yalnız örnekte gösterebilmek için
    print('Program kapandı:', e)
''',
'sys.exit() SystemExit, Ctrl+C ise KeyboardInterrupt fırlatır; ikisi de Exception\'dan değil BaseException\'dan türer. Çıplak except bunları da yakalar ve kapanması gereken program çalışmaya devam eder.',
'Genel yakalama gerekiyorsa except Exception yaz; çıplak except kullanma.'),

(O, 'temel', 'Metotta self parametresini unutmak',
'''\
class Hesap:
    def __init__(self, bakiye):
        self.bakiye = bakiye
    def bakiye_goster():
        return self.bakiye

h = Hesap(500)
print(h.bakiye_goster())
''',
'''\
class Hesap:
    def __init__(self, bakiye):
        self.bakiye = bakiye
    def bakiye_goster(self):
        return self.bakiye

h = Hesap(500)
print(h.bakiye_goster())
''',
'h.bakiye_goster() çağrısı nesnenin kendisini ilk argüman olarak gönderir. Metot parametre almıyorsa TypeError (takes 0 positional arguments but 1 was given) alırsın.',
'Örnek metotlarının ilk parametresi her zaman self olsun.'),

(O, 'orta', 'Sınıf düzeyinde liste tanımlamak',
'''\
class Sepet:
    urunler = []
    def ekle(self, urun):
        self.urunler.append(urun)

a = Sepet()
b = Sepet()
a.ekle('çay')
print('B sepeti:', b.urunler)
''',
'''\
class Sepet:
    def __init__(self):
        self.urunler = []
    def ekle(self, urun):
        self.urunler.append(urun)

a = Sepet()
b = Sepet()
a.ekle('çay')
print('B sepeti:', b.urunler)
''',
'Sınıf gövdesinde tanımlanan değişken bütün örneklerce PAYLAŞILIR. Değiştirilebilir bir listeyse bir müşterinin sepetine eklenen ürün herkesin sepetinde görünür.',
'Örneğe özel veriyi __init__ içinde self.ad = ... ile oluştur.'),

(O, 'orta', 'Alt sınıfta super().__init__() çağırmamak',
'''\
class Personel:
    def __init__(self, ad):
        self.ad = ad

class Yonetici(Personel):
    def __init__(self, ad, ekip):
        self.ekip = ekip

y = Yonetici('Selin', ['Can', 'Ece'])
print(y.ad)
''',
'''\
class Personel:
    def __init__(self, ad):
        self.ad = ad

class Yonetici(Personel):
    def __init__(self, ad, ekip):
        super().__init__(ad)
        self.ekip = ekip

y = Yonetici('Selin', ['Can', 'Ece'])
print(y.ad, y.ekip)
''',
'Alt sınıf __init__ yazınca üst sınıfın __init__\'i kendiliğinden çalışmaz. Üst sınıfın kurduğu alanlar (ad) hiç oluşmaz ve AttributeError alırsın.',
'Alt sınıfın __init__\'inde önce super().__init__(...) çağır.'),

(O, 'temel', '__init__ adını yanlış yazmak',
'''\
class Urun:
    def __int__(self, ad, fiyat):
        self.ad = ad
        self.fiyat = fiyat

u = Urun('Çay', 42)
print(u.ad)
''',
'''\
class Urun:
    def __init__(self, ad, fiyat):
        self.ad = ad
        self.fiyat = fiyat

u = Urun('Çay', 42)
print(u.ad, u.fiyat)
''',
'__int__ geçerli ama bambaşka bir özel metottur (int() dönüşümü). Kurucu tanımlanmamış sayıldığı için Urun(\'Çay\', 42) çağrısı TypeError (Urun() takes no arguments) verir.',
'Kurucunun adı iki alt çizgiyle __init__; hata mesajında "takes no arguments" görürsen önce bunu kontrol et.'),
]
