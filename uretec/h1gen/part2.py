START = 21
M = 'Metinler ve Türkçe karakter'
L = 'Listeler'
ITEMS = [
(M, 'orta', 'Türkçe kelimeleri sorted() ile sıralamak',
'''\
iller = ['Çorum', 'Adana', 'Zonguldak', 'Bursa', 'Şanlıurfa', 'Ordu']
print(sorted(iller))
''',
'''\
ALFABE = 'abcçdefgğhıijklmnoöprsştuüvyz'

def tr_anahtar(kelime):
    k = kelime.replace('İ', 'i').replace('I', 'ı').lower()
    return [ALFABE.index(h) if h in ALFABE else 100 + ord(h) for h in k]

iller = ['Çorum', 'Adana', 'Zonguldak', 'Bursa', 'Şanlıurfa', 'Ordu']
print(sorted(iller, key=tr_anahtar))
''',
'sorted() metinleri Unicode kod numarasına göre sıralar. Ç, Ş, Ö, Ü, Ğ, İ harflerinin kodları İngilizce harflerin hepsinden büyük olduğu için Çorum ve Şanlıurfa listenin en sonuna düşer.',
'Türkçe sıralama için alfabe sırasını veren bir key fonksiyonu kullan (ya da PyICU gibi bir kütüphane).'),

(M, 'temel', 'Metot sonucunu atamayı unutmak',
'''\
plaka = ' 35abc123 '
plaka.strip()
plaka.upper()
print(repr(plaka))
''',
'''\
plaka = ' 35abc123 '
plaka = plaka.strip().upper()
print(repr(plaka))
''',
'Metinler değiştirilemez (immutable): strip(), upper(), replace() orijinal metni değiştirmez, YENİ bir metin döndürür. Sonucu bir değişkene atamazsan yapılan iş kaybolur.',
'Metin metotlarının sonucunu mutlaka bir değişkene ata.'),

(M, 'orta', 'Uzantı silmek için rstrip() kullanmak',
'''\
dosya = 'satislar_ekst.txt'
print(dosya.rstrip('.txt'))
''',
'''\
dosya = 'satislar_ekst.txt'
print(dosya.removesuffix('.txt'))
''',
'strip/rstrip/lstrip argümanı bir ek değil, silinecek KARAKTER KÜMESİDİR. rstrip(\'.txt\') sondan ., t ve x harflerinin hepsini siler; satislar_ekst adındaki son t de gider.',
'Belirli bir öneki/eki silmek için removeprefix()/removesuffix() kullan.'),

(M, 'temel', 'Sonda ayraç kalan metni split() etmek',
'''\
satir = 'elma,armut,muz,'
urunler = satir.split(',')
print(urunler)
print('Ürün sayısı:', len(urunler))
''',
'''\
satir = 'elma,armut,muz,'
urunler = [u.strip() for u in satir.split(',') if u.strip()]
print(urunler)
print('Ürün sayısı:', len(urunler))
''',
'split(ayraç) iki ayraç arasındaki ve sondaki boş parçaları da döndürür. Sonda virgül kalan bir satırda listeye boş metin eklenir ve sayım bir fazla çıkar.',
'split() sonrası boş parçaları ve boşlukları süz.'),

(M, 'temel', 'Etiket aramasında alt metin tuzağı',
'''\
etiketler = 'kargosuz,kampanya'
if 'kargo' in etiketler:
    print('Kargo ücreti eklenecek')
else:
    print('Kargo ücreti yok')
''',
'''\
etiketler = 'kargosuz,kampanya'
etiket_kumesi = set(etiketler.split(','))
if 'kargo' in etiket_kumesi:
    print('Kargo ücreti eklenecek')
else:
    print('Kargo ücreti yok')
''',
'Metin üzerinde in, alt metin (substring) arar: \'kargo\' kelimesi \'kargosuz\' içinde geçtiği için yanlış eşleşme olur. Virgüllü listeyi metin olarak bırakmak bu hatanın kaynağıdır.',
'Tam eşleşme istiyorsan metni parçala ve listede/kümede ara.'),

(M, 'ileri', 'Unicode normalleştirmeyi atlamak',
'''\
# Biri Mac'ten (ayrık biçim), biri Windows'tan gelen aynı müşteri adı
ad1 = '\\u015eule'          # Ş tek karakter
ad2 = 'S\\u0327ule'         # S + birleşen çengel
print(ad1, ad2)
print(ad1 == ad2, len(ad1), len(ad2))
''',
'''\
import unicodedata
ad1 = '\\u015eule'
ad2 = 'S\\u0327ule'
n1 = unicodedata.normalize('NFC', ad1)
n2 = unicodedata.normalize('NFC', ad2)
print(n1, n2)
print(n1 == n2, len(n1), len(n2))
''',
'Ş, Ç, Ğ, Ö, Ü gibi harfler Unicode\'da ya tek karakter (birleşik) ya da harf + işaret (ayrık) olarak yazılabilir. Ekranda aynı görünürler ama == False döner; macOS dosya adları ve kopyala-yapıştır verileri bu sorunu sık doğurur.',
'Farklı kaynaklardan gelen metinleri karşılaştırmadan önce unicodedata.normalize(\'NFC\', ...) uygula.'),

(M, 'orta', 'Binlik ayracı Türkçe sanmak',
'''\
ciro = 1234567.5
print(f'Ciro: {ciro:,.2f} TL')
''',
'''\
def tl(sayi):
    s = f'{sayi:,.2f}'
    return s.replace(',', '_').replace('.', ',').replace('_', '.')

ciro = 1234567.5
print(f'Ciro: {tl(ciro)} TL')
''',
'Biçim belirtecindeki , binlik ayırıcıyı İngilizce kurala göre koyar: 1,234,567.50. Türkçe raporda bu sayı "bir virgül iki yüz otuz dört" gibi okunur ve yanlış anlaşılır. locale ayarı da her sunucuda kurulu olmadığı için güvenilir değildir.',
'Türkçe rapor için ayraçları açıkça değiştiren küçük bir biçim fonksiyonu yaz.'),

(M, 'temel', 'f harfini unutmak',
'''\
ad = 'Elif'
puan = 92
print('Sayın {ad}, puanın {puan}')
''',
'''\
ad = 'Elif'
puan = 92
print(f'Sayın {ad}, puanın {puan}')
''',
'Süslü parantezler yalnız f-string içinde değerlendirilir. Başta f harfi yoksa metin olduğu gibi yazılır; hata vermez, müşteriye "{ad}" yazan e-posta gider.',
'Süslü parantezle değer yazdırıyorsan metnin başına f koyduğunu kontrol et.'),

(M, 'orta', 'title() ile ad-soyad düzeltmek',
'''\
sube = "anadolu'nun izmir şubesi"
print(sube.title())
''',
'''\
def tr_baslik(metin):
    def buyut(h):
        return {'i': 'İ', 'ı': 'I'}.get(h, h.upper())
    return ' '.join(buyut(k[0]) + k[1:] for k in metin.split())

sube = "anadolu'nun izmir şubesi"
print(tr_baslik(sube))
''',
'title() kesme işaretinden sonraki harfi de yeni kelime sayar (Anadolu\'Nun) ve i harfini noktasız I yapar (Izmir). Türkçe özel adlarda iki hata birden çıkar.',
'Türkçe başlık biçimi için kelimeleri boşluktan böl ve yalnız ilk harfi Türkçe kurala göre büyüt.'),

(M, 'ileri', 'Regex\'te [a-zA-Z] ile harf aramak',
'''\
import re
ad_soyad = 'Çağrı Öztürk'
print(re.findall(r'[a-zA-Z]+', ad_soyad))
''',
'''\
import re
ad_soyad = 'Çağrı Öztürk'
print(re.findall(r'[^\\W\\d_]+', ad_soyad))
''',
'[a-zA-Z] yalnız 52 İngilizce harfi kapsar; ç, ğ, ı, ö, ş, ü ve büyükleri bu aralıkta değildir. İsimler parçalanır, doğrulama kuralları Türkçe adları reddeder.',
'Harf aramak için Unicode farkında olan [^\\W\\d_] ya da \\w kullan; [a-zA-Z] yazma.'),

(L, 'temel', 'Gezerken listeden silmek',
'''\
kodlar = ['YAZ10', 'IPTAL', 'IPTAL', 'KIS20']
for k in kodlar:
    if k == 'IPTAL':
        kodlar.remove(k)
print(kodlar)
''',
'''\
kodlar = ['YAZ10', 'IPTAL', 'IPTAL', 'KIS20']
kodlar = [k for k in kodlar if k != 'IPTAL']
print(kodlar)
''',
'for döngüsü listeyi indeksle gezer. Bir eleman silinince sonrakiler bir sola kayar ve döngü bir sonrakini atlar; arka arkaya gelen iki IPTAL\'den biri listede kalır.',
'Gezdiğin listeyi değiştirme; süzülmüş yeni bir liste kur.'),

(L, 'temel', 'append() ile liste eklemek',
'''\
sepet = ['ekmek', 'süt']
yeni = ['peynir', 'zeytin']
sepet.append(yeni)
print(sepet)
print('Ürün sayısı:', len(sepet))
''',
'''\
sepet = ['ekmek', 'süt']
yeni = ['peynir', 'zeytin']
sepet.extend(yeni)
print(sepet)
print('Ürün sayısı:', len(sepet))
''',
'append() argümanını TEK eleman olarak ekler; liste verirsen iç içe liste oluşur ve ürün sayısı yanlış çıkar. Elemanları tek tek eklemek extend()\'in (ya da +=) işidir.',
'Tek eleman için append, bir koleksiyonun elemanları için extend.'),

(L, 'temel', 'sort() sonucunu değişkene atamak',
'''\
fiyatlar = [349, 99, 1250, 15]
sirali = fiyatlar.sort()
print(sirali)
''',
'''\
fiyatlar = [349, 99, 1250, 15]
sirali = sorted(fiyatlar)
print(sirali)
''',
'list.sort() listeyi yerinde sıralar ve None döndürür. Sonucu atadığın değişken None olur; sonraki satırlarda TypeError ya da boş rapor alırsın.',
'Yeni liste istiyorsan sorted(), yerinde sıralama istiyorsan yalnız liste.sort() yaz ve atama yapma.'),

(L, 'orta', 'Matrisi [[0] * n] * m ile kurmak',
'''\
# 3 kurye x 3 gün teslimat tablosu
tablo = [[0] * 3] * 3
tablo[0][0] = 5        # 1. kurye, 1. gün
print(tablo)
''',
'''\
tablo = [[0] * 3 for _ in range(3)]
tablo[0][0] = 5
print(tablo)
''',
'Dış * işlemi iç listeyi kopyalamaz, aynı listeye üç kez başvuru koyar. Bir satırı değiştirince bütün satırlar değişir.',
'İç içe liste kurarken comprehension kullan: [[0] * n for _ in range(m)].'),

(L, 'temel', 'Son elemana len() ile ulaşmak',
'''\
siparisler = [1001, 1002, 1003]
son = siparisler[len(siparisler)]
print(son)
''',
'''\
siparisler = [1001, 1002, 1003]
son = siparisler[-1]
print(son)
''',
'İndeksler 0\'dan başlar; 3 elemanlı listenin son indeksi 2\'dir. liste[len(liste)] her zaman IndexError (list index out of range) verir.',
'Son eleman için liste[-1] kullan.'),

(L, 'temel', 'index() ile olmayan elemanı aramak',
'''\
subeler = ['Ankara', 'İzmir', 'Bursa']
sira = subeler.index('Antalya')
print('Sıra:', sira)
''',
'''\
subeler = ['Ankara', 'İzmir', 'Bursa']
aranan = 'Antalya'
if aranan in subeler:
    print('Sıra:', subeler.index(aranan))
else:
    print(aranan, 'şubesi yok')
''',
'list.index() eleman bulunamazsa -1 döndürmez, ValueError fırlatır (str.find\'in aksine). Kullanıcıdan gelen değerlerle aramada program çöker.',
'index() çağırmadan önce in ile var mı diye bak ya da ValueError\'u yakala.'),

(L, 'temel', 'append() sonucunu listeye geri atamak',
'''\
gorevler = ['rapor']
gorevler = gorevler.append('toplantı')
gorevler.append('e-posta')
print(gorevler)
''',
'''\
gorevler = ['rapor']
gorevler.append('toplantı')
gorevler.append('e-posta')
print(gorevler)
''',
'append(), extend(), insert(), remove(), sort() gibi yerinde çalışan liste metotları None döndürür. Sonucu listeye geri atarsan listeyi kaybedersin ve sonraki çağrıda AttributeError (\'NoneType\' object has no attribute \'append\') alırsın.',
'Yerinde değiştiren liste metotlarının sonucunu atama.'),

(L, 'orta', 'İndeksle gezerken del kullanmak',
'''\
bakiyeler = [100, -20, -5, 40]
for i in range(len(bakiyeler)):
    if bakiyeler[i] < 0:
        del bakiyeler[i]
print(bakiyeler)
''',
'''\
bakiyeler = [100, -20, -5, 40]
bakiyeler = [b for b in bakiyeler if b >= 0]
print(bakiyeler)
''',
'range(len(liste)) döngü başında bir kez hesaplanır. Eleman silindikçe liste kısalır ama döngü eski uzunluğa kadar devam eder; sonunda IndexError gelir. Hata olmasa bile kayan indeks yüzünden bazı elemanlar atlanır.',
'Silme yapacaksan süzülmüş yeni liste kur ya da listeyi sondan başa doğru gez.'),

(L, 'ileri', 'Karışık sıralamada reverse=True kullanmak',
'''\
# Puana göre azalan, eşitlikte ada göre artan sıralama isteniyor
sonuclar = [('Ece', 90), ('Can', 85), ('Ayşe', 90)]
print(sorted(sonuclar, key=lambda x: (x[1], x[0]), reverse=True))
''',
'''\
sonuclar = [('Ece', 90), ('Can', 85), ('Ayşe', 90)]
print(sorted(sonuclar, key=lambda x: (-x[1], x[0])))
''',
'reverse=True anahtarın TÜM parçalarını ters çevirir; puan azalırken adlar da Z\'den A\'ya sıralanır. Bir alan artan, diğeri azalan olacaksa sayısal alanın işaretini değiştir ya da iki aşamalı kararlı sıralama yap.',
'Karışık yönlü sıralamada reverse yerine anahtarda eksi işareti kullan.'),

(L, 'ileri', 'True değerinin listede 1 gibi bulunması',
'''\
yetkili_idler = [1, 7, 12]
gelen = True     # form hatası: id yerine onay kutusu değeri geldi
if gelen in yetkili_idler:
    print('Erişim verildi')
else:
    print('Erişim yok')
''',
'''\
yetkili_idler = [1, 7, 12]
gelen = True
if type(gelen) is int and gelen in yetkili_idler:
    print('Erişim verildi')
else:
    print('Erişim yok')
''',
'in, == ile karşılaştırır ve True == 1, False == 0 eşitlikleri doğrudur. Bu yüzden True değeri 1 numaralı kullanıcı gibi eşleşir; count(), index() ve sözlük anahtarlarında da aynı tuzak vardır.',
'Kimlik/yetki denetiminde değerin türünü de doğrula; True\'nun 1 sayılabileceğini unutma.'),
]
