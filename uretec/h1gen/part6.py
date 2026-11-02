START = 101
O = 'OOP'
C = 'Comprehension ve üreteçler'
T = 'Tarih-saat ve saat dilimi'
ITEMS = [
(O, 'ileri', '__eq__ yazıp __hash__\'i unutmak',
'''\
class Musteri:
    def __init__(self, tc):
        self.tc = tc
    def __eq__(self, diger):
        return self.tc == diger.tc

tekil = {Musteri('111'), Musteri('111'), Musteri('222')}
print(len(tekil))
''',
'''\
class Musteri:
    def __init__(self, tc):
        self.tc = tc
    def __eq__(self, diger):
        return isinstance(diger, Musteri) and self.tc == diger.tc
    def __hash__(self):
        return hash(self.tc)

tekil = {Musteri('111'), Musteri('111'), Musteri('222')}
print(len(tekil))
''',
'__eq__ tanımlayan bir sınıfın __hash__\'i Python tarafından None yapılır; nesneler kümeye ve sözlük anahtarına konamaz (TypeError: unhashable type). Eşit nesnelerin hash\'i de eşit olmak zorundadır.',
'__eq__ yazarsan aynı alanlardan __hash__ da yaz (ya da @dataclass(frozen=True) kullan).'),

(O, 'orta', 'Nesneleri __eq__ olmadan karşılaştırmak',
'''\
class Para:
    def __init__(self, tutar, birim):
        self.tutar = tutar
        self.birim = birim

print(Para(100, 'TL') == Para(100, 'TL'))
''',
'''\
from dataclasses import dataclass

@dataclass
class Para:
    tutar: int
    birim: str

print(Para(100, 'TL') == Para(100, 'TL'))
''',
'Varsayılan == iki nesnenin AYNI nesne olup olmadığına bakar (is gibi). Aynı değerleri taşıyan iki ayrı Para nesnesi eşit sayılmaz; testler ve tekrar denetimleri yanlış sonuç verir.',
'Değer nesnelerinde __eq__ tanımla ya da @dataclass kullan.'),

(O, 'ileri', 'Sınıf sayacını self üzerinden artırmak',
'''\
class Siparis:
    toplam = 0
    def __init__(self):
        self.toplam += 1

Siparis()
Siparis()
print('Toplam sipariş:', Siparis.toplam)
''',
'''\
class Siparis:
    toplam = 0
    def __init__(self):
        Siparis.toplam += 1

Siparis()
Siparis()
print('Toplam sipariş:', Siparis.toplam)
''',
'self.toplam += 1 önce sınıf değişkenini OKUR, sonra sonucu nesnenin kendi özniteliğine YAZAR. Sınıf değişkeni hiç değişmez; her nesnede ayrı bir toplam = 1 oluşur.',
'Sınıf düzeyindeki ortak değeri değiştirirken sınıf adını (ya da type(self)) kullan.'),

(O, 'ileri', 'property tanımlayıp setter yazmamak',
'''\
class Urun:
    def __init__(self, ad, fiyat):
        self.ad = ad
        self.fiyat = fiyat           # setter yok!
    @property
    def fiyat(self):
        return self._fiyat

u = Urun('Çay', 42)
print(u.fiyat)
''',
'''\
class Urun:
    def __init__(self, ad, fiyat):
        self.ad = ad
        self.fiyat = fiyat           # setter üzerinden doğrulanır
    @property
    def fiyat(self):
        return self._fiyat
    @fiyat.setter
    def fiyat(self, deger):
        if deger < 0:
            raise ValueError('Fiyat negatif olamaz')
        self._fiyat = deger

u = Urun('Çay', 42)
print(u.fiyat)
''',
'Yalnız @property ile tanımlanan öznitelik salt okunurdur; __init__ içindeki self.fiyat = ... ataması bile AttributeError (property \'fiyat\' of \'Urun\' object has no setter) verir. Setter yazarken de değeri property ile AYNI adda (self.fiyat) saklarsan setter kendini çağırır ve sonsuz özyinelemeye düşersin; gerçek değer _fiyat gibi farklı bir adda durmalı.',
'property\'e atama yapılacaksa @ad.setter yaz ve asıl değeri alt çizgili ayrı bir adda (_fiyat) sakla.'),

(O, 'ileri', 'Alternatif kurucuyu staticmethod ile yazmak',
'''\
class Hesap:
    def __init__(self, bakiye):
        self.bakiye = bakiye
    @staticmethod
    def metinden(satir):
        return Hesap(float(satir))

class VadeliHesap(Hesap):
    faiz = 0.40

h = VadeliHesap.metinden('1000')
print(type(h).__name__, hasattr(h, 'faiz'))
''',
'''\
class Hesap:
    def __init__(self, bakiye):
        self.bakiye = bakiye
    @classmethod
    def metinden(cls, satir):
        return cls(float(satir))

class VadeliHesap(Hesap):
    faiz = 0.40

h = VadeliHesap.metinden('1000')
print(type(h).__name__, hasattr(h, 'faiz'))
''',
'staticmethod hangi sınıf üzerinden çağrıldığını bilmez; Hesap adını sabit yazdığı için alt sınıftan çağrılsa da üst sınıf nesnesi döndürür. VadeliHesap.metinden() faizsiz düz bir Hesap üretir.',
'Nesne üreten alternatif kurucuları @classmethod ile yaz ve cls(...) döndür.'),

(O, 'orta', 'Çift alt çizgili alana alt sınıftan erişmek',
'''\
class Hesap:
    def __init__(self, bakiye):
        self.__bakiye = bakiye

class VadeliHesap(Hesap):
    def faiz_ekle(self):
        self.__bakiye *= 1.1

VadeliHesap(100).faiz_ekle()
''',
'''\
class Hesap:
    def __init__(self, bakiye):
        self._bakiye = bakiye

class VadeliHesap(Hesap):
    def faiz_ekle(self):
        self._bakiye = round(self._bakiye * 1.1, 2)

v = VadeliHesap(100)
v.faiz_ekle()
print(v._bakiye)
''',
'__ad biçimi gizlilik değil ad bozma (name mangling) yapar: Hesap içinde _Hesap__bakiye, VadeliHesap içinde _VadeliHesap__bakiye olur. Alt sınıf üst sınıfın alanını bulamaz ve AttributeError alır.',
'"İç kullanım" alanları için tek alt çizgi (_bakiye) yeterli; çift alt çizgiyi yalnız ad çakışmasını önlemek için kullan.'),

(O, 'temel', 'Özniteliği yalnız bir metotta oluşturmak',
'''\
class Kurye:
    def __init__(self, ad):
        self.ad = ad
    def teslimata_cik(self):
        self.durum = 'yolda'

k = Kurye('Mert')
print(k.ad, k.durum)
''',
'''\
class Kurye:
    def __init__(self, ad):
        self.ad = ad
        self.durum = 'beklemede'
    def teslimata_cik(self):
        self.durum = 'yolda'

k = Kurye('Mert')
print(k.ad, k.durum)
''',
'Öznitelik ancak ona atama yapan satır çalışınca oluşur. teslimata_cik() çağrılmamış bir kuryede durum alanı yoktur ve AttributeError alırsın.',
'Nesnenin bütün özniteliklerini __init__ içinde başlangıç değeriyle tanımla.'),

(O, 'ileri', 'dataclass alanına liste varsayılanı vermek',
'''\
from dataclasses import dataclass

@dataclass
class Sepet:
    musteri: str
    urunler: list = []

print(Sepet('Ayşe'))
''',
'''\
from dataclasses import dataclass, field

@dataclass
class Sepet:
    musteri: str
    urunler: list = field(default_factory=list)

a = Sepet('Ayşe')
b = Sepet('Can')
a.urunler.append('çay')
print(a, b)
''',
'dataclass, değiştirilebilir varsayılan değerlerin bütün nesnelerce paylaşılacağını bildiği için list, dict, set varsayılanlarını sınıf tanımlanırken ValueError ile reddeder.',
'dataclass alanında değiştirilebilir varsayılan için field(default_factory=list) kullan.'),

(C, 'orta', 'Üreteci iki kez kullanmak',
'''\
kdvli = (t * 1.2 for t in [100, 200, 300])
print('Toplam:', sum(kdvli))
print('Liste:', list(kdvli))
''',
'''\
kdvli = [t * 1.2 for t in [100, 200, 300]]
print('Toplam:', sum(kdvli))
print('Liste:', kdvli)
''',
'Üreteç ifadesi (generator) tek kullanımlıktır; sum() tüketince içi boşalır. İkinci kullanım hata vermez, sadece boş sonuç döner.',
'Veriyi birden çok kez kullanacaksan liste kur; üreteci tek geçişlik işlerde kullan.'),

(C, 'temel', 'Comprehension\'da else\'i sona yazmak',
'''\
puanlar = [45, 80, 62]
durum = [p for p in puanlar if p >= 50 else 'Kaldı']
print(durum)
''',
'''\
puanlar = [45, 80, 62]
durum = ['Geçti' if p >= 50 else 'Kaldı' for p in puanlar]
print(durum)
''',
'Sondaki if bir SÜZGEÇTİR ve else alamaz (SyntaxError). Her eleman için iki değerden birini seçmek istiyorsan koşullu ifade (a if koşul else b) for\'dan ÖNCE yazılır.',
'Süzmek için sona if, dönüştürmek için başa "a if koşul else b".'),

(C, 'orta', 'İç içe comprehension\'da for sırasını ters yazmak',
'''\
siparisler = [[120, 80], [45], [300, 15]]
tutarlar = [t for t in s for s in siparisler]
print(tutarlar)
''',
'''\
siparisler = [[120, 80], [45], [300, 15]]
tutarlar = [t for s in siparisler for t in s]
print(tutarlar)
''',
'İç içe comprehension\'daki for\'lar, iç içe yazılmış normal döngülerle AYNI sırada okunur: önce dış döngü (for s in siparisler), sonra iç döngü. Ters yazınca s henüz tanımlı olmadığı için NameError alırsın.',
'for\'ları normal iç içe döngüdeki sırayla, dıştan içe yaz.'),

(C, 'ileri', 'Sınıf gövdesindeki comprehension\'da sınıf değişkeni',
'''\
class Fiyatlandirma:
    kdv = 0.20
    kdvli = [round(f * (1 + kdv), 2) for f in [100, 250]]

print(Fiyatlandirma.kdvli)
''',
'''\
class Fiyatlandirma:
    kdv = 0.20
    @classmethod
    def kdvli(cls, fiyatlar):
        return [round(f * (1 + cls.kdv), 2) for f in fiyatlar]

print(Fiyatlandirma.kdvli([100, 250]))
''',
'Sınıf gövdesi bir kapsam (scope) oluşturmaz; içindeki comprehension sınıf değişkenlerini göremez ve NameError verir. (En dıştaki iterable istisnadır, o yüzden hata bazen kafa karıştırır.)',
'Sınıf değişkenini kullanan hesapları metoda taşı ya da sınıf dışında yap.'),

(C, 'ileri', 'Üreteçte in ile arayıp sonra yeniden kullanmak',
'''\
onaylilar = (s for s in [101, 102, 103, 104])
if 102 in onaylilar:
    print('102 onaylı')
print('Onaylı siparişler:', list(onaylilar))
''',
'''\
onaylilar = {101, 102, 103, 104}
if 102 in onaylilar:
    print('102 onaylı')
print('Onaylı siparişler:', sorted(onaylilar))
''',
'in işleci üreteci aranan elemanı bulana kadar TÜKETİR. Sonraki kullanımda 101 ve 102 kaybolmuştur; hata da vermez.',
'Üyelik denetimi yapacaksan veriyi küme ya da listeye çevir.'),

(C, 'ileri', 'Üreteç koşulunun geç değerlendirilmesi',
'''\
esik = 100
buyuk_siparisler = (t for t in [80, 120, 150] if t > esik)
esik = 130            # başka bir rapor için eşik değişti
print(list(buyuk_siparisler))
''',
'''\
esik = 100
buyuk_siparisler = [t for t in [80, 120, 150] if t > esik]
esik = 130
print(buyuk_siparisler)
''',
'Üreteçte yalnız en dıştaki iterable hemen değerlendirilir; if koşulu ve dönüşüm, eleman İSTENDİĞİNDE çalışır. Bu arada değişen esik, sonucu sessizce değiştirir.',
'Üreteci, bağımlı olduğu değişkenler değişmeden tüket ya da hemen liste kur.'),

(C, 'temel', 'Sözlük comprehension\'da tekrar eden anahtar',
'''\
musteriler = [('Ankara', 'Ali'), ('İzmir', 'Ece'), ('Ankara', 'Can')]
sehre_gore = {sehir: ad for sehir, ad in musteriler}
print(sehre_gore)
''',
'''\
from collections import defaultdict
musteriler = [('Ankara', 'Ali'), ('İzmir', 'Ece'), ('Ankara', 'Can')]
sehre_gore = defaultdict(list)
for sehir, ad in musteriler:
    sehre_gore[sehir].append(ad)
print(dict(sehre_gore))
''',
'Aynı anahtar ikinci kez gelince önceki değerin ÜZERİNE yazılır. Ankara\'daki Ali sessizce kaybolur.',
'Bir anahtara birden çok değer düşebiliyorsa defaultdict(list) ile grupla.'),

(C, 'temel', 'Üretecin uzunluğunu len() ile almak',
'''\
siparisler = [120, 45, 300, 80]
buyukler = (s for s in siparisler if s > 100)
print('Büyük sipariş sayısı:', len(buyukler))
''',
'''\
siparisler = [120, 45, 300, 80]
buyukler = [s for s in siparisler if s > 100]
print('Büyük sipariş sayısı:', len(buyukler))
print('Bellek dostu sayım:', sum(1 for s in siparisler if s > 100))
''',
'Üreteç elemanlarını önceden bilmez, bu yüzden len() desteklemez (TypeError: object of type \'generator\' has no len()).',
'Uzunluk gerekiyorsa liste kur ya da sum(1 for ...) ile say.'),

(T, 'temel', 'strptime\'da %M ile %m\'yi karıştırmak',
'''\
from datetime import datetime
t = datetime.strptime('05.03.2024', '%d.%M.%Y')
print(t)
''',
'''\
from datetime import datetime
t = datetime.strptime('05.03.2024', '%d.%m.%Y')
print(t)
''',
'%m ay, %M dakikadır. Yanlış kodla 03 dakika olarak okunur, ay varsayılan 1 (Ocak) kalır ve hiçbir hata vermez: 5 Mart, 5 Ocak 00:03 olur.',
'Biçim kodlarında küçük m ay, büyük M dakika, H saat, S saniyedir; çıktıyı mutlaka bir kez yazdırıp kontrol et.'),

(T, 'orta', 'Saat dilimli ve dilimsiz tarihleri karşılaştırmak',
'''\
from datetime import datetime, timezone
son_odeme = datetime(2024, 11, 5, 17, 0)               # saat dilimsiz
odeme_zamani = datetime(2024, 11, 5, 13, 30, tzinfo=timezone.utc)
print(odeme_zamani <= son_odeme)
''',
'''\
from datetime import datetime, timezone, timedelta
TR = timezone(timedelta(hours=3))
son_odeme = datetime(2024, 11, 5, 17, 0, tzinfo=TR)
odeme_zamani = datetime(2024, 11, 5, 13, 30, tzinfo=timezone.utc)
print(odeme_zamani <= son_odeme)
''',
'Saat dilimi olmayan (naive) bir datetime\'ın hangi ana denk geldiği belli değildir; Python onu dilimli (aware) bir tarihle karşılaştırmayı TypeError ile reddeder.',
'Sistemde bütün zamanları saat dilimli tut (tercihen UTC sakla, ekranda yerel göster).'),

(T, 'orta', 'timedelta.seconds ile toplam süreyi okumak',
'''\
from datetime import datetime
cikis = datetime(2024, 11, 1, 8, 0)
varis = datetime(2024, 11, 3, 11, 30)
sure = varis - cikis
print('Yolculuk (saat):', sure.seconds / 3600)
''',
'''\
from datetime import datetime
cikis = datetime(2024, 11, 1, 8, 0)
varis = datetime(2024, 11, 3, 11, 30)
sure = varis - cikis
print('Yolculuk (saat):', sure.total_seconds() / 3600)
''',
'timedelta süreyi days, seconds ve microseconds olarak AYRI tutar; .seconds yalnız gün dışında kalan kısımdır (0–86399). 2 gün 3.5 saatlik yolculuk 3.5 saat görünür.',
'Toplam süre için her zaman total_seconds() kullan.'),

(T, 'ileri', 'Ay eklemek için timedelta(days=30) kullanmak',
'''\
from datetime import date, timedelta
baslangic = date(2024, 1, 15)     # taksit günü: her ayın 15'i
for i in range(1, 5):
    print(baslangic + timedelta(days=30 * i))
''',
'''\
import calendar
from datetime import date

def ay_ekle(t, n):
    yil, ay = divmod(t.month - 1 + n, 12)
    yil, ay = t.year + yil, ay + 1
    gun = min(t.day, calendar.monthrange(yil, ay)[1])
    return date(yil, ay, gun)

baslangic = date(2024, 1, 15)
for i in range(1, 5):
    print(ay_ekle(baslangic, i))
''',
'Aylar 28–31 gün sürdüğü için "30 gün" bir ay değildir. Ayın 15\'indeki taksit 14\'üne kayar ve kayma birikir. Ayın 31\'inde başlayan taksitte ise Şubat\'ı atlayıp 1 Mart\'a düşer; iyi bir ay_ekle fonksiyonu günü ayın son gününe sabitler.',
'Ay eklerken ayın gün sayısını hesaba katan bir fonksiyon (ya da dateutil.relativedelta) kullan.'),
]
