START = 111
TASKS = [
# ---------------- Değişkenler ve Türler ----------------
dict(topic='Değişkenler ve Türler', diff=1, t='predict',
  title='Metin çarpı sayı',
  q='<p>Anadolu Market stok ekranında fiyat bir metin kutusundan geliyor. Bu kod ne yazdırır?</p>',
  code=r'''
fiyat = "45"
adet = 3
print(fiyat * adet)
print(int(fiyat) * adet)
''',
  o=['135\n135', '454545\n135', 'TypeError hatası verir', '45 45 45\n135'], a=1,
  hints=['Bir metni bir tam sayıyla çarpmak Python\'da yasak mı, yoksa başka bir anlamı mı var?', '"ab" * 2 ifadesinin sonucunu düşün.'],
  why='Metin * tam sayı, metni o kadar kez yan yana yazar: "45" * 3 → "454545". Hata vermez, bu yüzden fark edilmesi zor bir hatadır. Sayısal çarpım için önce int("45") ile dönüştürmelisin; ikinci satır 45 * 3 = 135 yazar. Metin + sayı ise TypeError verirdi; çarpım verdirmez.',
  tags=['str', 'int', 'tür dönüşümü'], min=2),

dict(topic='Değişkenler ve Türler', diff=2, t='predict',
  title='Dönüşümler ve doğruluk',
  q='<p>Form verisi temizlenirken şu satırlar çalışıyor. Çıktı ne olur?</p>',
  code=r'''
print(int("0012") + 1)
print(bool("0"), bool(0))
print(float("3") == 3)
''',
  o=['0013\nFalse False\nTrue', '13\nFalse False\nFalse', '13\nTrue False\nTrue', '13\nTrue False\nFalse'], a=2,
  hints=['int() baştaki sıfırları ne yapar?', 'Boş olmayan her metin True sayılır; içinde "0" yazsa bile.'],
  why='int("0012") baştaki sıfırları yok sayar ve 12 verir, +1 ile 13 olur. bool("0") True\'dur çünkü metin boş değildir; bool(0) ise False\'tur. float("3") 3.0 üretir ve 3.0 == 3 karşılaştırması True\'dur (değer eşitliği, tür eşitliği değil). Formdan gelen "0" değerini mantıksal yapmak istiyorsan bool(int(x)) kullanmalısın.',
  tags=['bool', 'int', 'float', 'truthiness'], min=3),

dict(topic='Değişkenler ve Türler', diff=1, t='order',
  title='Ham stok verisini sayıya çevir',
  q='<p>Depo tarayıcısından gelen <code>"  120 adet  "</code> metnini temizleyip stok değerini hesaplayan satırları doğru sıraya koy. Çıktı: <code>Stok: 120, değer: 7788.00 TL</code></p>',
  lines=['ham = "  120 adet  "', 'temiz = ham.strip()', 'stok = int(temiz.split()[0])', 'deger = stok * 64.9', 'print(f"Stok: {stok}, değer: {deger:.2f} TL")'],
  expect='Stok: 120, değer: 7788.00 TL\n',
  hint='Her satır bir öncekinin ürettiği değişkeni kullanıyor; zinciri takip et.',
  hints=['Bir değişkeni kullanmadan önce tanımlamış olmalısın.'],
  why='Değişkenler yukarıdan aşağı oluşur: önce ham metin, sonra strip() ile kenar boşlukları atılmış hali, sonra split()[0] ile ilk parça alınıp int()\'e çevrilir. Ancak sayıya çevrildikten sonra çarpma yapılabilir. Tek satırda int(ham.split()[0]) da yazılabilirdi (split boşlukları zaten atar) ama ara değişkenler hata ayıklamayı kolaylaştırır.',
  tags=['int', 'strip', 'split', 'f-string'], min=2),

dict(topic='Değişkenler ve Türler', diff=1, kind='rehberli',
  title='Basit net maaş hesabı',
  q='<p>İK birimi için sadeleştirilmiş bir bordro hesabı yap. <code>net_maas(brut)</code> fonksiyonunu yaz:</p><ul><li>SGK işçi payı: brütün %14\'ü</li><li>İşsizlik payı: brütün %1\'i</li><li>Vergi matrahı: brüt − SGK − işsizlik</li><li>Gelir vergisi: matrahın %15\'i</li><li>Net: matrah − vergi, 2 ondalığa yuvarlanmış</li></ul><p>(Oranlar eğitim amaçlı sabittir; gerçek bordro dilimlidir.)</p>',
  guide=['Her kesintiyi ayrı, anlamlı adlı bir değişkende hesapla (sgk, issizlik).', 'Matrahı brütten iki kesintiyi çıkararak bul.', 'Vergiyi matrah üzerinden hesapla, brüt üzerinden değil.', 'Neti round(..., 2) ile döndür.'],
  example=r'''
# Benzer teknik: fatura toplamı (adım adım değişkenlerle)
ara_toplam = 850.0
indirim = ara_toplam * 0.10
kdv_matrahi = ara_toplam - indirim
kdv = kdv_matrahi * 0.20
print(round(kdv_matrahi + kdv, 2))
''',
  start=r'''
def net_maas(brut):
    sgk = brut * 0.14
    # TODO: işsizlik payını hesapla (%1)
    # TODO: matrah = brüt - sgk - işsizlik
    # TODO: vergi = matrahın %15'i
    # TODO: net maaşı 2 ondalıkla döndür
    pass
''',
  sol=r'''
def net_maas(brut):
    sgk = brut * 0.14
    issizlik = brut * 0.01
    matrah = brut - sgk - issizlik
    vergi = matrah * 0.15
    return round(matrah - vergi, 2)
''',
  tests=r'''
assert net_maas(30000) is not None, "Fonksiyon bir değer döndürmeli (return unutulmasın)"
assert net_maas(30000) == 21675.0, "30000 brüt için: sgk 4200, işsizlik 300, matrah 25500, vergi 3825 → net 21675.0"
assert net_maas(50000) == 36125.0, "50000 brüt için net 36125.0 olmalı"
assert net_maas(0) == 0, "0 brüt maaşın neti 0 olmalı"
''',
  hints=['Değişkenleri sırayla tanımla; her biri öncekini kullanır.', 'matrah = brut - sgk - issizlik', 'return round(matrah - matrah * 0.15, 2)'],
  why='Hesabı ara değişkenlere bölmek hem okunurluğu hem kontrolü kolaylaştırır: bordro uzmanı her satırı kendi tablosuyla karşılaştırabilir. Vergi brüt yerine matrah üzerinden hesaplanır; sık yapılan hata budur. Alternatif olarak net = brut * 0.85 * 0.85 tek satırda yazılabilir (0.85 = 1 - 0.15) ama oranlar değiştiğinde neyin ne olduğu kaybolur. Gerçek uygulamada para için Decimal kullanılır.',
  tags=['float', 'round', 'değişken adlandırma', 'İK'], min=6),

dict(topic='Değişkenler ve Türler', diff=2, kind='yaz',
  title='Kargoda desi mi kilo mu?',
  q='<p>Lojistik firmaları paketin hem gerçek ağırlığına (kg) hem hacmine bakar. Desi = en × boy × yükseklik / 3000 (cm cinsinden). Ücrete esas ağırlık ikisinden <b>büyük</b> olanın <b>yukarı yuvarlanmış</b> tam sayı halidir.</p><p><code>ucretli_agirlik(en, boy, yukseklik, kg)</code> fonksiyonunu yaz ve tam sayı (<code>int</code>) döndür.</p>',
  start=r'''
def ucretli_agirlik(en, boy, yukseklik, kg):
    # buraya yaz
    pass
''',
  sol=r'''
import math

def ucretli_agirlik(en, boy, yukseklik, kg):
    desi = en * boy * yukseklik / 3000
    return math.ceil(max(desi, kg))
''',
  tests=r'''
assert ucretli_agirlik(30, 20, 10, 1.5) == 2, "Desi 2.0, kg 1.5 → büyük olan 2.0, yukarı yuvarlanınca 2"
assert ucretli_agirlik(50, 40, 30, 3) == 20, "Hacimli ama hafif paket: desi 20 > 3 kg → 20"
assert ucretli_agirlik(10, 10, 10, 0.2) == 1, "Desi 0.33, kg 0.2 → 0.33 yukarı yuvarlanınca 1"
assert ucretli_agirlik(10, 10, 10, 7.1) == 8, "Ağır küçük paket: 7.1 kg yukarı yuvarlanınca 8"
assert isinstance(ucretli_agirlik(30, 20, 10, 1.5), int), "Sonuç int olmalı (math.ceil int döndürür)"
''',
  hints=['max(a, b) iki değerden büyüğünü verir.', 'Yukarı yuvarlamak için math.ceil kullan (round en yakına yuvarlar, int aşağı keser).'],
  why='max ile desi ve kg karşılaştırılır, math.ceil ile her zaman yukarı yuvarlanır ve sonuç int olur. round(0.33) 0 verirdi, int(7.1) 7 verirdi; ikisi de firmayı zarara sokar. math kullanmadan -(-x // 1) hilesiyle de tavan alınabilir ama sonuç float olur, int() ile sarman gerekir.',
  tags=['math.ceil', 'max', 'float', 'lojistik'], min=5),

dict(topic='Değişkenler ve Türler', diff=3, kind='yaz',
  title='Kuruş hassasiyetinde toplam',
  q='<p><code>0.1 + 0.2</code> Python\'da <code>0.30000000000000004</code> verir; parayı float ile toplamak kuruş kaydırır. Ilgaz Bank kasası fiyatları metin olarak alıyor: <code>"19.90"</code>, <code>"5.05"</code>, <code>"100"</code>, <code>"7.5"</code>.</p><p><code>kurus_topla(fiyatlar)</code> fonksiyonunu yaz: listedeki tüm fiyatların toplamını <b>tam sayı kuruş</b> olarak döndürsün. <code>float()</code> kullanma; metni noktadan böl, lira ve kuruş kısmını ayrı ayrı tam sayıya çevir. Tek haneli kuruş <code>"7.5"</code> → 50 kuruş demektir.</p>',
  start=r'''
def kurus_topla(fiyatlar):
    # buraya yaz
    pass
''',
  sol=r'''
def kurus_topla(fiyatlar):
    toplam = 0
    for f in fiyatlar:
        if "." in f:
            lira, kurus = f.split(".")
            kurus = kurus.ljust(2, "0")
        else:
            lira, kurus = f, "0"
        toplam += int(lira) * 100 + int(kurus)
    return toplam
''',
  tests=r'''
assert kurus_topla(["0.10", "0.20"]) == 30, "0.10 + 0.20 tam 30 kuruş olmalı (float hatası yok)"
assert kurus_topla(["19.90", "5.05", "100"]) == 12495, "19.90 + 5.05 + 100 = 124.95 TL = 12495 kuruş"
assert kurus_topla(["7.5"]) == 750, "\"7.5\" 7 lira 50 kuruştur: 750"
assert kurus_topla([]) == 0, "Boş liste için toplam 0 olmalı"
assert "float(" not in __source__, "Bu görevde float() kullanmadan çözmelisin"
''',
  hints=['"19.90".split(".") → ["19", "90"]. Nokta yoksa tüm metin liradır.', '"5".ljust(2, "0") → "50": tek haneli kuruşu sağdan sıfırla doldur.', 'toplam += int(lira) * 100 + int(kurus)'],
  why='Float ikilik tabanda 0.1\'i tam gösteremez; bu yüzden finans yazılımları parayı tam sayı kuruş ya da decimal.Decimal ile tutar. Metni bölüp tam sayılarla çalışmak her zaman kesin sonuç verir. ljust ile "5" → "50" yapmak "7.5" tuzağını çözer. Alternatif: from decimal import Decimal; int(sum(Decimal(f) for f in fiyatlar) * 100) — Decimal metinden oluşturulduğunda kesindir.',
  tags=['float hassasiyeti', 'split', 'int', 'bankacılık'], min=8),

dict(topic='Değişkenler ve Türler', diff=2, kind='bug',
  title='sum adını gölgeleyen değişken',
  q='<p>Kodda bir hata var, bul ve düzelt. <code>sepet_ozeti(fiyatlar)</code> sepet toplamını ve ortalama fiyatı demet olarak döndürmeli; ama <code>TypeError: \'int\' object is not callable</code> veriyor.</p>',
  start=r'''
def sepet_ozeti(fiyatlar):
    sum = 0
    for f in fiyatlar:
        sum = sum + f
    ortalama = sum(fiyatlar) / len(fiyatlar)
    return sum, ortalama
''',
  sol=r'''
def sepet_ozeti(fiyatlar):
    toplam = 0
    for f in fiyatlar:
        toplam = toplam + f
    ortalama = toplam / len(fiyatlar)
    return toplam, ortalama
''',
  tests=r'''
assert sepet_ozeti([10, 20, 30]) == (60, 20.0), "[10, 20, 30] için (60, 20.0) dönmeli"
assert sepet_ozeti([99.5]) == (99.5, 99.5), "Tek ürünlü sepette toplam ve ortalama aynı olmalı"
''',
  hints=['Hata mesajı "int çağrılamaz" diyor: hangi ad hem sayı hem fonksiyon olarak kullanılıyor?', 'sum, Python\'un yerleşik (built-in) fonksiyonudur; aynı adla değişken açınca fonksiyon gizlenir.'],
  why='sum = 0 satırı yerleşik sum fonksiyonunun adını yerel bir tam sayıyla gölgeler (shadowing); sonra sum(...) çağrısı aslında 60(...) olur. Çözüm değişkene toplam gibi farklı bir ad vermek. Döngüye hiç gerek yoktu: toplam = sum(fiyatlar) de yeterli olurdu. list, str, id, max, input gibi yerleşik adları değişken adı olarak kullanmaktan kaçın.',
  tags=['built-in', 'shadowing', 'TypeError'], min=4),

# ---------------- Operatörler ----------------
dict(topic='Operatörler', diff=1, t='predict',
  title='İşlem önceliği',
  q='<p>Bir fiyat formülünde parantez unutulmuş. Bu kod ne yazdırır?</p>',
  code=r'''
print(2 + 3 * 4 ** 2)
print((2 + 3) * 4 ** 2)
print(-2 ** 2)
''',
  o=['400\n80\n4', '50\n80\n4', '50\n80\n-4', '50\n400\n-4'], a=2,
  hints=['Öncelik sırası: ** → tekli eksi → * / // % → + -', '** tekli eksiden daha önce uygulanır.'],
  why='** en yüksek önceliğe sahiptir: 4 ** 2 = 16, sonra 3 * 16 = 48, sonra 2 + 48 = 50. Parantezli halde (5) * 16 = 80. -2 ** 2 ifadesi -(2 ** 2) = -4 olarak okunur; (-2) ** 2 yazsaydın 4 olurdu. Emin olmadığında parantez kullan: okuyan kişi için de netlik sağlar.',
  tags=['öncelik', '**', 'aritmetik'], min=2),

dict(topic='Operatörler', diff=2, t='predict',
  title='Negatif sayılarda // ve %',
  q='<p>Ilgaz Bank\'ta negatif bakiyeleri gruplayan kod şu satırları içeriyor. Çıktı nedir?</p>',
  code=r'''
print(-7 // 2, -7 % 2)
print(7 // -2, 7 % -2)
''',
  o=['-3 -1\n-3 1', '-4 1\n-4 -1', '-3 1\n-3 -1', '-4 -1\n-4 1'], a=1,
  hints=['// sıfıra doğru değil, eksi sonsuza doğru yuvarlar (taban).', 'Python\'da a % b sonucunun işareti b ile aynıdır.'],
  why='Python\'da // taban bölmedir: -3.5 aşağı yuvarlanır → -4. Kalan, a == (a // b) * b + a % b eşitliğini sağlar: -7 = -4*2 + 1 → kalan 1. 7 // -2 yine -4, 7 = -4*(-2) + (-1) → kalan -1. C, Java ve JavaScript sıfıra doğru keser (-3), bu yüzden diller arası veri taşırken dikkat et. Sıfıra doğru kesmek istersen int(a / b) kullan.',
  tags=['//', '%', 'negatif sayılar'], min=3),

dict(topic='Operatörler', diff=1, kind='rehberli',
  title='Koli dağılımı',
  q='<p>Anadolu Market deposunda ürünler sabit kapasiteli kolilere konuyor. <code>koli_dagilimi(adet, kapasite)</code> fonksiyonunu yaz; şu üç değeri <b>demet</b> olarak döndürsün:</p><ol><li><code>dolu</code>: tamamen dolan koli sayısı</li><li><code>artan</code>: dolu kolilere sığmayan ürün sayısı</li><li><code>gereken</code>: toplam koli sayısı (artan varsa bir koli daha)</li></ol><p>Örnek: 100 ürün, kapasite 24 → <code>(4, 4, 5)</code>.</p>',
  guide=['Tam bölme (//) ile dolu koli sayısını bul.', 'Kalan (%) ile artan ürün sayısını bul.', 'Artan 0\'dan büyükse gereken = dolu + 1, değilse dolu.', 'Üç değeri virgülle ayırarak döndür: return a, b, c'],
  example=r'''
# Benzer teknik: dakikayı saat ve dakikaya ayırmak
toplam_dakika = 135
saat = toplam_dakika // 60
dakika = toplam_dakika % 60
print(saat, dakika)   # 2 15
''',
  start=r'''
def koli_dagilimi(adet, kapasite):
    dolu = 0      # TODO: tam bölme ile hesapla
    artan = 0     # TODO: kalan ile hesapla
    # TODO: gereken koli sayısını hesapla
    return dolu, artan
''',
  sol=r'''
def koli_dagilimi(adet, kapasite):
    dolu = adet // kapasite
    artan = adet % kapasite
    gereken = dolu + (1 if artan > 0 else 0)
    return dolu, artan, gereken
''',
  tests=r'''
assert koli_dagilimi(100, 24) == (4, 4, 5), "100 ürün / 24 kapasite: 4 dolu koli, 4 artan, 5 koli gerekir"
assert koli_dagilimi(48, 24) == (2, 0, 2), "Tam bölünüyorsa fazladan koli gerekmez: (2, 0, 2)"
assert koli_dagilimi(5, 24) == (0, 5, 1), "Kapasiteden az ürün: hiç dolu koli yok ama 1 koli gerekir"
assert koli_dagilimi(0, 24) == (0, 0, 0), "Ürün yoksa koli de yok"
''',
  hints=['// tam bölme, % kalan verir.', 'Koşullu ifade: deger_a if kosul else deger_b', 'gereken = dolu + (1 if artan > 0 else 0)'],
  why='// ve % birlikte "kaç tam grup, kaç artan" sorusunun standart cevabıdır; divmod(adet, kapasite) ikisini tek seferde verir. Gereken koli sayısı aslında tavan bölmedir: -(-adet // kapasite) ya da math.ceil(adet / kapasite) da aynı sonucu verir. Büyük sayılarda tam sayı yöntemi float yuvarlama hatası riski taşımaz.',
  tags=['//', '%', 'divmod', 'lojistik'], min=5),
]
