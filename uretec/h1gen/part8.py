START = 141
P = 'pandas'
N = 'numpy'
A = 'async ve eşzamanlılık'
G = 'Test ve güvenlik'
ITEMS = [
(P, 'orta', 'Metin olarak duran sayılara göre sıralamak',
'''\
import pandas as pd
df = pd.DataFrame({'urun': ['A', 'B', 'C'], 'adet': ['100', '20', '3']})
print(df.sort_values('adet', ascending=False)['urun'].tolist())
''',
'''\
import pandas as pd
df = pd.DataFrame({'urun': ['A', 'B', 'C'], 'adet': ['100', '20', '3']})
df['adet'] = pd.to_numeric(df['adet'])
print(df.sort_values('adet', ascending=False)['urun'].tolist())
''',
'Sütun metin türündeyse sıralama sözlük sırasıyla yapılır: \'3\' > \'20\' > \'100\'. En çok satan ürün listenin sonuna düşer; max(), min() ve karşılaştırmalar da aynı şekilde yanılır.',
'Hesaplamadan önce df.dtypes\'a bak; sayı olması gereken sütunları pd.to_numeric ile çevir.'),

(P, 'ileri', 'Sıralamadan sonra loc[0] ile ilk satırı almak',
'''\
import pandas as pd
df = pd.DataFrame({'sube': ['Ankara', 'İzmir', 'Bursa'], 'ciro': [1200, 800, 1500]})
sirali = df.sort_values('ciro', ascending=False)
print('En yüksek ciro:', sirali.loc[0, 'sube'])
''',
'''\
import pandas as pd
df = pd.DataFrame({'sube': ['Ankara', 'İzmir', 'Bursa'], 'ciro': [1200, 800, 1500]})
sirali = df.sort_values('ciro', ascending=False)
print('En yüksek ciro:', sirali.iloc[0]['sube'])
''',
'loc ETİKETLE, iloc KONUMLA seçer. Sıralama satır etiketlerini (index) korur; loc[0] hâlâ ilk eklenen satırı (Ankara) getirir, sıralamadaki ilk satırı (Bursa) değil.',
'Sıradaki konuma göre seçmek için iloc kullan ya da sıralamadan sonra reset_index(drop=True) yap.'),

(P, 'ileri', 'Tekrarlı anahtarla merge edip toplamı şişirmek',
'''\
import pandas as pd
siparis = pd.DataFrame({'musteri_id': [1, 2], 'tutar': [500, 300]})
adres = pd.DataFrame({'musteri_id': [1, 1, 2], 'adres': ['Ev', 'İş', 'Ev']})
birlesik = siparis.merge(adres, on='musteri_id')
print('Ciro:', birlesik['tutar'].sum())
''',
'''\
import pandas as pd
siparis = pd.DataFrame({'musteri_id': [1, 2], 'tutar': [500, 300]})
adres = pd.DataFrame({'musteri_id': [1, 1, 2], 'adres': ['Ev', 'İş', 'Ev']})
tekil = adres.drop_duplicates('musteri_id')
birlesik = siparis.merge(tekil, on='musteri_id', validate='many_to_one')
print('Ciro:', birlesik['tutar'].sum())
''',
'Sağ tabloda bir anahtar iki kez geçerse her eşleşme için ayrı satır oluşur; 1 numaralı müşterinin 500 TL\'lik siparişi iki kez sayılır. merge hata vermez, sadece satır sayısı artar.',
'merge\'den önce anahtarın tekilliğini denetle ve validate= parametresiyle beklentini yaz.'),

(P, 'ileri', 'groupby\'ın boş anahtarlı satırları atması',
'''\
import pandas as pd
df = pd.DataFrame({'kanal': ['web', None, 'mağaza', 'web'], 'tutar': [100, 250, 80, 70]})
ozet = df.groupby('kanal')['tutar'].sum()
print(ozet.to_dict())
print('Özet toplamı:', ozet.sum(), '| Gerçek toplam:', df['tutar'].sum())
''',
'''\
import pandas as pd
df = pd.DataFrame({'kanal': ['web', None, 'mağaza', 'web'], 'tutar': [100, 250, 80, 70]})
ozet = df.fillna({'kanal': 'Bilinmiyor'}).groupby('kanal')['tutar'].sum()
print(ozet.to_dict())
print('Özet toplamı:', ozet.sum(), '| Gerçek toplam:', df['tutar'].sum())
''',
'groupby varsayılan olarak (dropna=True) anahtarı boş olan satırları sessizce dışarıda bırakır. Kanalı girilmemiş 250 TL rapordan kaybolur ve özet toplam gerçek toplamı tutmaz.',
'Gruplamadan önce boş anahtarları doldur ya da groupby(..., dropna=False) kullan; özet toplamını genel toplamla karşılaştır.'),

(N, 'temel', 'Dizileri if içinde == ile karşılaştırmak',
'''\
import numpy as np
hedef = np.array([100, 200, 300])
gerceklesen = np.array([100, 200, 300])
if hedef == gerceklesen:
    print('Hedef tuttu')
''',
'''\
import numpy as np
hedef = np.array([100, 200, 300])
gerceklesen = np.array([100, 200, 300])
if np.array_equal(hedef, gerceklesen):
    print('Hedef tuttu')
print('Tutan ay sayısı:', (hedef == gerceklesen).sum())
''',
'numpy\'de == eleman eleman karşılaştırır ve bir True/False DİZİSİ döndürür. if bu diziyi tek bir mantıksal değere çeviremez: ValueError (truth value of an array ... is ambiguous).',
'Diziler için np.array_equal, (a == b).all() ya da .any() kullan.'),

(N, 'orta', 'Tamsayı dizisine ondalıklı değer yazmak',
'''\
import numpy as np
fiyat = np.array([10, 20, 30])
fiyat[0] = 12.75
print(fiyat)
''',
'''\
import numpy as np
fiyat = np.array([10, 20, 30], dtype=float)
fiyat[0] = 12.75
print(fiyat)
''',
'numpy dizisinin tek bir türü (dtype) vardır ve sonradan değişmez. Tamsayı dizisine yazılan 12.75 sessizce 12\'ye kesilir; kuruşlar uyarısız kaybolur.',
'Ondalık değer tutacak dizileri baştan dtype=float ile oluştur ve dtype\'ı kontrol et.'),

(N, 'orta', 'Dilimin kopya olduğunu sanmak',
'''\
import numpy as np
gunluk = np.array([120, 90, 150, 80])
senaryo = gunluk[:2]       # ilk iki gün için "ya iki katı olsaydı" senaryosu
senaryo *= 2
print('Gerçek veri:', gunluk)
''',
'''\
import numpy as np
gunluk = np.array([120, 90, 150, 80])
senaryo = gunluk[:2].copy()
senaryo *= 2
print('Gerçek veri:', gunluk)
print('Senaryo   :', senaryo)
''',
'Python listesinin aksine numpy dilimi kopya değil GÖRÜNÜMDÜR (view): aynı belleği paylaşır. Senaryo üzerindeki değişiklik gerçek veriyi bozar.',
'numpy\'de dilimi bağımsız değiştireceksen .copy() ile kopyala.'),

(N, 'ileri', 'Küçük tamsayı türünde taşma',
'''\
import numpy as np
adet = np.array([100, 120], dtype=np.int8)   # bellekten tasarruf için
print(adet * 2)
''',
'''\
import numpy as np
adet = np.array([100, 120], dtype=np.int64)
print(adet * 2)
''',
'int8 en fazla 127 tutabilir. Python int\'inin aksine numpy tamsayıları sınırlıdır ve dizi işlemlerinde taşma UYARISIZ başa sarar: 200 → -56. int32 ile büyük toplamlar da aynı şekilde bozulur.',
'Değer aralığını bilmeden küçük dtype seçme; şüphede int64/float64 kullan.'),

(N, 'ileri', 'Yanlış şekilli dizilerde yayınlama (broadcasting)',
'''\
import numpy as np
fiyat = np.array([[10], [20], [30]])    # dosyadan sütun olarak (3, 1) okundu
adet = np.array([1, 2, 3])              # (3,)
print('Ciro:', (fiyat * adet).sum())
''',
'''\
import numpy as np
fiyat = np.array([[10], [20], [30]])
adet = np.array([1, 2, 3])
print('Ciro:', (fiyat.ravel() * adet).sum())
''',
'(3, 1) ve (3,) şekilli diziler çarpılınca numpy hata vermez, ikisini (3, 3) matrise yayar ve her fiyatı her adetle çarpar. 140 olması gereken ciro 360 çıkar.',
'Eleman eleman işlemden önce .shape\'leri kontrol et; gerekirse ravel()/reshape ile eşitle.'),

(N, 'orta', 'Eksik değerli dizide mean() almak',
'''\
import numpy as np
sicaklik = np.array([21.5, np.nan, 23.0])    # depo sensörü bir ölçümü kaçırdı
print('Ortalama:', sicaklik.mean())
''',
'''\
import numpy as np
sicaklik = np.array([21.5, np.nan, 23.0])
print('Ortalama:', np.nanmean(sicaklik))
print('Eksik ölçüm:', np.isnan(sicaklik).sum())
''',
'NaN içeren bir dizide sum, mean, max gibi işlemlerin sonucu NaN olur (pandas\'ın aksine numpy NaN\'i atlamaz). Tek bir kayıp ölçüm bütün raporu NaN yapar.',
'Eksik değer olabilecek dizilerde np.nanmean, np.nansum, np.nanmax kullan ve eksik sayısını raporla.'),

(A, 'orta', 'Eşyordamı await etmeden çağırmak',
'''\
import asyncio

async def stok_getir(urun):
    await asyncio.sleep(0.01)
    return 0

async def main():
    stok = stok_getir('çay')
    print('Gelen değer türü:', type(stok).__name__)
    if stok:
        print('Satışa açık')
    stok.close()                    # örnekte uyarıyı susturmak için

asyncio.run(main())
''',
'''\
import asyncio

async def stok_getir(urun):
    await asyncio.sleep(0.01)
    return 0

async def main():
    stok = await stok_getir('çay')
    print('Gelen değer türü:', type(stok).__name__)
    if stok:
        print('Satışa açık')
    else:
        print('Tükendi')

asyncio.run(main())
''',
'async def ile tanımlanan fonksiyonu çağırmak onu ÇALIŞTIRMAZ, bir eşyordam (coroutine) nesnesi döndürür. Nesne doğruluk testinde True sayılır; stoğu 0 olan ürün satışa açık görünür. (Python ayrıca "coroutine was never awaited" uyarısı verir.)',
'async fonksiyonun sonucunu almak için her zaman await yaz.'),

(A, 'orta', 'async fonksiyonda time.sleep() kullanmak',
'''\
import asyncio, time

async def kurye(ad, sure):
    print(ad, 'yola çıktı')
    time.sleep(sure)                # olay döngüsünü kilitler
    print(ad, 'teslim etti')

async def main():
    await asyncio.gather(kurye('Mert', 0.03), kurye('Ece', 0.01))

asyncio.run(main())
''',
'''\
import asyncio

async def kurye(ad, sure):
    print(ad, 'yola çıktı')
    await asyncio.sleep(sure)       # bekleme sırasında diğer görevler çalışır
    print(ad, 'teslim etti')

async def main():
    await asyncio.gather(kurye('Mert', 0.03), kurye('Ece', 0.01))

asyncio.run(main())
''',
'asyncio tek iş parçacığında çalışır; time.sleep, requests.get, ağır hesap gibi engelleyici (blocking) çağrılar bütün olay döngüsünü durdurur. gather kullansan da görevler sırayla çalışır, eşzamanlılık kazancı sıfırlanır.',
'async kodda asyncio.sleep ve async kütüphaneler kullan; engelleyici işi asyncio.to_thread ile ayır.'),

(A, 'orta', 'Bağımsız istekleri sırayla await etmek',
'''\
import asyncio

async def fiyat_al(firma, sure, fiyat):
    print(firma, 'sorgulandı')
    await asyncio.sleep(sure)
    print(firma, 'yanıt verdi')
    return fiyat

async def main():
    a = await fiyat_al('Kargo A', 0.03, 95)
    b = await fiyat_al('Kargo B', 0.01, 80)
    print('En ucuz:', min(a, b))

asyncio.run(main())
''',
'''\
import asyncio

async def fiyat_al(firma, sure, fiyat):
    print(firma, 'sorgulandı')
    await asyncio.sleep(sure)
    print(firma, 'yanıt verdi')
    return fiyat

async def main():
    a, b = await asyncio.gather(fiyat_al('Kargo A', 0.03, 95),
                                fiyat_al('Kargo B', 0.01, 80))
    print('En ucuz:', min(a, b))

asyncio.run(main())
''',
'Her await bir sonraki satıra geçmeden önce işin bitmesini bekler. Birbirinden bağımsız iki sorguyu arka arkaya await etmek, async yazdığın hâlde toplam süreyi ikisinin toplamı yapar.',
'Bağımsız beklemeleri asyncio.gather (ya da TaskGroup) ile aynı anda başlat.'),

(A, 'ileri', 'gather\'da tek hatayla bütün sonuçları kaybetmek',
'''\
import asyncio

async def sube_raporu(sube):
    await asyncio.sleep(0.01)
    if sube == 'Bursa':
        raise ConnectionError('Bursa sunucusu yanıt vermedi')
    return sube + ': tamam'

async def main():
    sonuclar = await asyncio.gather(*(sube_raporu(s) for s in ['Ankara', 'Bursa', 'İzmir']))
    print(sonuclar)

asyncio.run(main())
''',
'''\
import asyncio

async def sube_raporu(sube):
    await asyncio.sleep(0.01)
    if sube == 'Bursa':
        raise ConnectionError('Bursa sunucusu yanıt vermedi')
    return sube + ': tamam'

async def main():
    sonuclar = await asyncio.gather(*(sube_raporu(s) for s in ['Ankara', 'Bursa', 'İzmir']),
                                    return_exceptions=True)
    for s in sonuclar:
        print('HATA: ' + str(s) if isinstance(s, Exception) else s)

asyncio.run(main())
''',
'gather varsayılan olarak ilk hatayı hemen yukarı fırlatır; başarıyla biten Ankara ve İzmir raporları da elinden gider. Tek şubenin arızası bütün gün sonu raporunu düşürür.',
'Kısmi başarı kabul ediliyorsa gather(..., return_exceptions=True) kullan ve her sonucu ayrı denetle.'),

(A, 'ileri', 'create_task ile başlatılan görevi beklememek',
'''\
import asyncio

async def log_yaz(mesaj):
    await asyncio.sleep(0.01)
    print('LOG:', mesaj)

async def main():
    asyncio.create_task(log_yaz('Sipariş 101 alındı'))
    print('Yanıt gönderildi')

asyncio.run(main())
''',
'''\
import asyncio

async def log_yaz(mesaj):
    await asyncio.sleep(0.01)
    print('LOG:', mesaj)

async def main():
    gorev = asyncio.create_task(log_yaz('Sipariş 101 alındı'))
    print('Yanıt gönderildi')
    await gorev

asyncio.run(main())
''',
'create_task görevi zamanlar ama tamamlanmasını garanti etmez. main bitince asyncio.run kalan görevleri İPTAL eder; log hiç yazılmaz. Başvurusu tutulmayan görevler çöp toplayıcıyla da kaybolabilir.',
'Başlattığın her görevin başvurusunu sakla ve sonunda await et (ya da asyncio.TaskGroup kullan).'),

(A, 'ileri', 'await arasında paylaşılan değişkeni güncellemek',
'''\
import asyncio
stok = 10

async def satis(adet):
    global stok
    mevcut = stok
    await asyncio.sleep(0)        # ödeme servisini bekle
    stok = mevcut - adet

async def main():
    await asyncio.gather(*(satis(1) for _ in range(5)))
    print('Kalan stok:', stok)

asyncio.run(main())
''',
'''\
import asyncio
stok = 10
kilit = None

async def satis(adet):
    global stok
    async with kilit:
        mevcut = stok
        await asyncio.sleep(0)
        stok = mevcut - adet

async def main():
    global kilit
    kilit = asyncio.Lock()
    await asyncio.gather(*(satis(1) for _ in range(5)))
    print('Kalan stok:', stok)

asyncio.run(main())
''',
'Tek iş parçacığında bile her await bir görev değiştirme noktasıdır. Beş satış aynı eski stoğu (10) okur, hepsi 9 yazar; dört satış kaybolur (yarış durumu, race condition).',
'Oku-bekle-yaz adımlarını asyncio.Lock ile koru ya da güncellemeyi tek atomik adımda yap.'),

(G, 'temel', 'Testte float sonucu == ile denetlemek',
'''\
def sepet_toplami(fiyatlar):
    return sum(fiyatlar)

assert sepet_toplami([0.1, 0.2]) == 0.3, 'Toplam yanlış'
print('Test geçti')
''',
'''\
import math

def sepet_toplami(fiyatlar):
    return sum(fiyatlar)

assert math.isclose(sepet_toplami([0.1, 0.2]), 0.3), 'Toplam yanlış'
print('Test geçti')
''',
'Fonksiyon doğru çalışsa da kayan nokta yuvarlaması yüzünden test AssertionError ile düşer. Ekip testi "kırılgan" diye kapatır, gerçek hatalar da bu sırada gözden kaçar.',
'float sonuçlarını testte math.isclose ya da pytest.approx ile karşılaştır.'),

(G, 'orta', 'assert\'i parantezle demet olarak yazmak',
'''\
def tutar_dogrula(tutar):
    assert (tutar > 0, 'Tutar pozitif olmalı')
    return 'onaylandı'

print(tutar_dogrula(-500))
''',
'''\
def tutar_dogrula(tutar):
    if tutar <= 0:
        raise ValueError('Tutar pozitif olmalı')
    return 'onaylandı'

try:
    print(tutar_dogrula(-500))
except ValueError as e:
    print('Reddedildi:', e)
''',
'assert (koşul, mesaj) boş olmayan bir DEMETİ denetler ve demet her zaman doğrudur; denetim hiç başarısız olmaz (Python yalnız bir SyntaxWarning verir). Ayrıca python -O ile çalıştırılınca bütün assert\'ler tamamen silinir.',
'Kullanıcı girdisini assert ile değil if + raise ile doğrula; assert\'i yalnız iç tutarlılık ve testler için kullan.'),

(G, 'orta', 'Kullanıcı girdisini eval() ile çalıştırmak',
'''\
# "Toplam hesapla" kutusu: kullanıcı liste yazacaktı
girdi = "__import__('os').getcwd() and 'Sunucu dosyalarına erişildi!'"
print(eval(girdi))
''',
'''\
import ast
for girdi in ['[120, 80, 45]', "__import__('os').getcwd()"]:
    try:
        print('Toplam:', sum(ast.literal_eval(girdi)))
    except (ValueError, SyntaxError):
        print('Reddedildi:', girdi)
''',
'eval() verilen metni Python kodu olarak ÇALIŞTIRIR; kullanıcı dosya silebilir, şifreleri okuyabilir, sunucuyu ele geçirebilir. ast.literal_eval yalnız sayı, metin, liste, sözlük gibi sabitleri kabul eder.',
'Dışarıdan gelen metni asla eval/exec ile çalıştırma; veri için ast.literal_eval ya da json.loads kullan.'),

(G, 'ileri', 'SQL sorgusunu f-string ile kurmak',
'''\
import sqlite3
db = sqlite3.connect(':memory:')
db.execute('CREATE TABLE musteri (ad TEXT, bakiye INTEGER)')
db.executemany('INSERT INTO musteri VALUES (?, ?)', [('Ali', 500), ('Ece', 900)])

ad = "x' OR '1'='1"              # giriş formuna yazılan değer
sorgu = f"SELECT ad, bakiye FROM musteri WHERE ad = '{ad}'"
print(db.execute(sorgu).fetchall())
''',
'''\
import sqlite3
db = sqlite3.connect(':memory:')
db.execute('CREATE TABLE musteri (ad TEXT, bakiye INTEGER)')
db.executemany('INSERT INTO musteri VALUES (?, ?)', [('Ali', 500), ('Ece', 900)])

ad = "x' OR '1'='1"
sorgu = 'SELECT ad, bakiye FROM musteri WHERE ad = ?'
print(db.execute(sorgu, (ad,)).fetchall())
''',
'Girdiyi sorgu metnine yapıştırınca kullanıcı SQL yazabilir hâle gelir (SQL injection): OR \'1\'=\'1\' koşulu bütün müşterilerin bakiyesini döker; aynı yolla tablo silinebilir.',
'SQL\'de değerleri her zaman parametreyle (? ya da :ad) geçir; sorguyu f-string ile kurma.'),
]
