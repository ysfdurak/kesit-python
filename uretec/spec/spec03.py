START = 131
TASKS = [
dict(topic='Metinler', diff=2, kind='bug',
  title='Telefon numarası temizlenmiyor',
  q='<p>Kodda bir hata var, bul ve düzelt. Anadolu Bank müşteri kayıtlarında telefonlar <code>"0532 123-45-67"</code> gibi farklı biçimlerde girilmiş. <code>telefon_temizle(tel)</code> boşlukları, tireleri ve parantezleri silip yalnızca rakamları bırakmalı; ama fonksiyon metni hiç değiştirmeden geri veriyor.</p>',
  start=r'''
def telefon_temizle(tel):
    tel.replace(" ", "")
    tel.replace("-", "")
    tel.replace("(", "")
    tel.replace(")", "")
    return tel
''',
  sol=r'''
def telefon_temizle(tel):
    tel = tel.replace(" ", "")
    tel = tel.replace("-", "")
    tel = tel.replace("(", "")
    tel = tel.replace(")", "")
    return tel
''',
  tests=r'''
assert telefon_temizle("0532 123-45-67") == "05321234567", "Boşluk ve tireler silinmeli: 05321234567"
assert telefon_temizle("(0212) 555 00 11") == "02125550011", "Parantezler de silinmeli"
assert telefon_temizle("05001112233") == "05001112233", "Zaten temiz numara aynı kalmalı"
''',
  hints=['Metin metotları orijinal metni değiştirir mi, yoksa yeni metin mi döndürür?', 'Dönen değeri tekrar tel değişkenine ata.'],
  why='Metinler değişmezdir; replace yeni bir metin döndürür ve sonuç atanmazsa kaybolur. Her satırda tel = tel.replace(...) yazmak ya da zincirlemek (tel.replace(" ", "").replace("-", "")...) gerekir. Daha sağlam alternatif yalnızca rakamları tutmaktır: "".join(c for c in tel if c.isdigit()) — beklenmedik karakterler (nokta, artı) de böylece temizlenir.',
  tags=['replace', 'immutable', 'veri temizleme'], min=3),

# ---------------- Unicode ve Girdi ----------------
dict(topic='Unicode ve Girdi', diff=2, t='predict',
  title='Türkçe büyük-küçük harf tuzağı',
  q='<p>Müşteri adresinde şehir araması yapan kod beklenmedik sonuç veriyor. Bu kod ne yazdırır?</p>',
  code=r'''
print("İSTANBUL".lower() == "istanbul")
print(len("İ".lower()))
print("ı".upper(), "i".upper())
''',
  o=['True\n1\nI İ', 'False\n2\nI I', 'False\n1\nI İ', 'True\n2\nI I'], a=1,
  hints=['Python\'un lower/upper metotları dile duyarlı değildir; Unicode\'un genel kurallarını uygular.', '"İ" küçültülünce "i" + birleşik nokta (U+0307) olur.'],
  why='Unicode kuralına göre "İ".lower() iki karakterdir: "i" ve birleşik üst nokta (combining dot above); bu yüzden "i̇stanbul" "istanbul"a eşit değildir ve uzunluk 2\'dir. "i".upper() ise Türkçe "İ" değil, Latin "I" verir. Türkçe metinlerde önce i/İ/ı/I harflerini kendin eşleyip sonra lower/upper uygulamalısın (bir sonraki görevlerde yapacaksın).',
  tags=['unicode', 'lower', 'upper', 'Türkçe'], min=3),

dict(topic='Unicode ve Girdi', diff=1, t='order',
  title='Girdiden doğum yılı',
  q='<p>Program önce adı, sonra yaşı soruyor. Girdiler sırasıyla <code>"  ayşe"</code> ve <code>"30"</code>. Satırları doğru sıraya koy (input() çağrıları ekrana girilen değeri de yazar).</p>',
  lines=['ad = input("Ad: ").strip()', 'yas = int(input("Yaş: "))', 'yil = 2026 - yas', 'print(f"{ad.title()} yaklaşık {yil} doğumlu.")'],
  stdin=['  ayşe', '30'],
  expect='Ad:   ayşe\nYaş: 30\nAyşe yaklaşık 1996 doğumlu.\n',
  hint='Girdiler sırayla verilir: ilk input() "  ayşe", ikincisi "30" alır.',
  hints=['input() her zaman metin döndürür; yaş için int() gerekir.'],
  why='input() girdileri verildikleri sırayla tüketir; yaş sorusu önce sorulsaydı int("  ayşe") ValueError verirdi. input() hep str döndürür; sayısal işlemden önce int() ile çevirmek zorunludur. strip() kullanıcının yanlışlıkla bıraktığı boşlukları temizler, title() ilk harfi büyütür.',
  tags=['input', 'int', 'strip'], min=2),

dict(topic='Unicode ve Girdi', diff=1, kind='rehberli',
  title='Türkçe doğru büyük harf',
  q='<p>Kargo etiketlerinde şehir ve adlar büyük harfle basılıyor. Python\'un <code>upper()</code> metodu <code>"istanbul"</code> → <code>"ISTANBUL"</code> yapıyor (noktasız I!). <code>tr_upper(metin)</code> fonksiyonunu yaz: Türkçe kurallarıyla büyük harfe çevirsin: <code>i</code> → <code>İ</code>, <code>ı</code> → <code>I</code>, diğer harfler normal <code>upper()</code> ile.</p>',
  guide=['upper() çağırmadan ÖNCE i ve ı harflerini kendin dönüştür.', 'Önce "i" → "İ" değiştir.', 'Sonra "ı" → "I" değiştir.', 'En son kalan harfler için upper() uygula ve döndür.'],
  example=r'''
# Benzer teknik: özel durumu önce ele al, sonra genel metodu uygula
metin = "çay & kahve"
metin = metin.replace("&", "ve")
print(metin.title())   # Çay Ve Kahve
''',
  start=r'''
def tr_upper(metin):
    # TODO: önce i → İ
    # TODO: sonra ı → I
    return metin.upper()
''',
  sol=r'''
def tr_upper(metin):
    metin = metin.replace("i", "İ")
    metin = metin.replace("ı", "I")
    return metin.upper()
''',
  tests=r'''
assert tr_upper("istanbul") == "İSTANBUL", "\"istanbul\" → \"İSTANBUL\" (noktalı İ) olmalı"
assert tr_upper("ılık su") == "ILIK SU", "\"ılık su\" → \"ILIK SU\" olmalı"
assert tr_upper("Diyarbakır") == "DİYARBAKIR", "Karışık harfler: \"DİYARBAKIR\" olmalı"
assert tr_upper("ÇAY") == "ÇAY", "Zaten büyük olan metin değişmemeli"
''',
  hints=['upper() i harfini I\'ya çevirdiği için önce sen müdahale etmelisin.', 'replace zincirle: metin.replace("i", "İ").replace("ı", "I")', 'return metin.replace("i", "İ").replace("ı", "I").upper()'],
  why='Sıra kritiktir: upper() önce çalışırsa i ve ı ikisi de I olur ve bilgi kaybolur. Önce i → İ, ı → I eşlemesi yapılır; İ ve I zaten büyük olduğundan upper() onlara dokunmaz. Tersine tr_lower için de "I" → "ı", "İ" → "i" yapılıp sonra lower() uygulanır. Büyük projelerde PyICU gibi yerel ayara (locale) duyarlı kütüphaneler kullanılır.',
  tags=['unicode', 'upper', 'replace', 'Türkçe'], min=4),

dict(topic='Unicode ve Girdi', diff=2, kind='rehberli',
  title='Kasada fiyat girişi',
  q='<p>Basit bir kasa programı yaz (fonksiyon değil, düz program). Program <code>input("Fiyat: ")</code> ile tekrar tekrar fiyat sorsun:</p><ul><li>Girdi <code>"bitti"</code> ise döngüden çık.</li><li>Girdi geçerli bir sayı değilse <code>Geçersiz: &lt;girdi&gt;</code> yazdır ve sonrakine geç.</li><li>Geçerliyse toplama ekle.</li></ul><p>Sonunda <code>Toplam: 49.50 TL</code> biçiminde (2 ondalık) yazdır. Bu görevde try/except kullanmadan, metin metotlarıyla doğrula: bir fiyat, en fazla bir nokta içeren rakam dizisidir.</p>',
  stdin=['12.50', '7', 'abc', '30', 'bitti'],
  guide=['toplam = 0.0 ile başla, while True döngüsü kur.', 'Girdiyi strip() ile temizle; "bitti" ise break.', 'Geçerlilik: giris.replace(".", "", 1).isdigit() noktayı bir kez silince geriye yalnız rakam kalmalı.', 'Geçersizse yazdır ve continue; geçerliyse float(giris) ekle.', 'Döngüden sonra toplamı :.2f ile yazdır.'],
  example=r'''
# Benzer teknik: nöbetçi (sentinel) değere kadar okuma
komutlar = ["ekle", "ekle", "çık", "ekle"]
for k in komutlar:
    if k == "çık":
        break
    print("işlem:", k)
print("3.14".replace(".", "", 1).isdigit(), "3.1.4".replace(".", "", 1).isdigit())
''',
  start=r'''
toplam = 0.0
while True:
    giris = input("Fiyat: ").strip()
    # TODO: "bitti" gelirse döngüden çık
    # TODO: geçersizse "Geçersiz: ..." yazdır ve continue
    # TODO: geçerliyse toplama ekle
    break
# TODO: toplamı yazdır
''',
  sol=r'''
toplam = 0.0
while True:
    giris = input("Fiyat: ").strip()
    if giris == "bitti":
        break
    if not giris.replace(".", "", 1).isdigit():
        print(f"Geçersiz: {giris}")
        continue
    toplam += float(giris)
print(f"Toplam: {toplam:.2f} TL")
''',
  expect='Fiyat: 12.50\nFiyat: 7\nFiyat: abc\nGeçersiz: abc\nFiyat: 30\nFiyat: bitti\nToplam: 49.50 TL\n',
  hints=['Nöbetçi değerli döngü: while True + if ...: break', '"12.50".replace(".", "", 1) → "1250" ve isdigit() True verir.', 'if not giris.replace(".", "", 1).isdigit(): print(...); continue'],
  why='Ne kadar girdi geleceğini bilmediğinde while True + break (nöbetçi değer, sentinel) kalıbı kullanılır. replace(".", "", 1) yalnızca ilk noktayı siler; "3.1.4" gibi iki noktalı değerler yine reddedilir. continue döngünün kalanını atlayıp yeni girdiye geçer. Gerçek projede daha esnek yol try: float(giris) except ValueError: ... kalıbıdır (eksi sayıları ve "1e3" gibi biçimleri de kapsar); bunu Dosya ve Hata görevlerinde göreceksin.',
  tags=['input', 'while', 'break', 'continue', 'isdigit'], min=7),

dict(topic='Unicode ve Girdi', diff=3, kind='yaz',
  title='Aksan duyarsız müşteri araması',
  q='<p>Çağrı merkezi müşteri ararken "cagri ozdemir" yazıyor ama kayıtta "Çağrı ÖZDEMİR" var. <code>normalize_ara(metin)</code> fonksiyonunu yaz; arama için şu dönüşümleri yapsın:</p><ol><li>Unicode NFKD ile ayrıştır (<code>unicodedata.normalize</code>): ç → c + çengel işareti gibi.</li><li>Birleşik işaretleri (<code>unicodedata.combining(c)</code> doğru olanlar) at.</li><li>Noktasız <code>ı</code> → <code>i</code> yap (ayrıştırma ı\'yı değiştirmez).</li><li>Küçük harfe çevir, baştaki/sondaki boşlukları at.</li></ol>',
  start=r'''
import unicodedata

def normalize_ara(metin):
    # buraya yaz
    pass
''',
  sol=r'''
import unicodedata

def normalize_ara(metin):
    ayrik = unicodedata.normalize("NFKD", metin)
    sade = "".join(c for c in ayrik if not unicodedata.combining(c))
    sade = sade.replace("ı", "i")
    return sade.lower().strip()
''',
  tests=r'''
assert normalize_ara("Çağrı ÖZDEMİR") == "cagri ozdemir", "\"Çağrı ÖZDEMİR\" → \"cagri ozdemir\" olmalı"
assert normalize_ara("  Şükrü Işık ") == "sukru isik", "Kenar boşlukları atılmalı; Ş, ü, I, ı dönüşmeli"
assert normalize_ara("İzmir") == "izmir", "İ küçültülünce noktası kalmamalı: \"izmir\""
assert normalize_ara("cagri") == normalize_ara("ÇAĞRI"), "Aynı ad farklı yazımlarda eşit olmalı"
''',
  hints=['unicodedata.normalize("NFKD", "ç") → "c" + "\\u0327" (iki karakter).', 'Generator ile süz: "".join(c for c in ayrik if not unicodedata.combining(c))', 'İ de NFKD ile I + nokta olur; nokta atılınca lower() "i" verir.'],
  why='NFKD harfleri temel harf + birleşik işaret (combining mark) olarak ayrıştırır; işaretleri atınca aksansız temel harf kalır. Bu yöntem ç, ğ, ö, ş, ü, İ ve diğer dillerdeki é, ñ gibi harfleri de çözer. ı ise ayrı bir harftir (ayrışmaz), elle eşlenmesi gerekir. Arama ve eşleştirmede hem sorgu hem kayıt aynı fonksiyondan geçirilir. Daha basit alternatif str.maketrans("çğıöşüÇĞİÖŞÜ", "cgiosuCGIOSU") ama yalnızca Türkçe harfleri kapsar.',
  tags=['unicode', 'unicodedata', 'NFKD', 'arama'], min=9),

dict(topic='Unicode ve Girdi', diff=1, kind='yaz',
  title='Taksit hesaplayan program',
  q='<p>Anadolu Bank kredi kartı ekranı için bir program yaz (fonksiyon değil). Program:</p><ol><li><code>input("Tutar: ")</code> ile tutarı (ondalıklı olabilir),</li><li><code>input("Taksit sayısı: ")</code> ile taksit sayısını (tam sayı) alsın.</li><li>Taksit sayısı 3\'ten fazlaysa tutara %5 vade farkı eklensin.</li><li><code>Toplam: 12600.00 TL</code> ve <code>Aylık taksit: 2100.00 TL</code> satırlarını yazdırsın (2 ondalık).</li></ol><p>Test girdileri: <code>12000</code> ve <code>6</code>.</p>',
  stdin=['12000', '6'],
  start=r'''
# buraya yaz
''',
  sol=r'''
tutar = float(input("Tutar: "))
taksit = int(input("Taksit sayısı: "))
if taksit > 3:
    tutar = tutar * 1.05
print(f"Toplam: {tutar:.2f} TL")
print(f"Aylık taksit: {tutar / taksit:.2f} TL")
''',
  expect='Tutar: 12000\nTaksit sayısı: 6\nToplam: 12600.00 TL\nAylık taksit: 2100.00 TL\n',
  hints=['input() metin döndürür: tutar için float(), taksit için int() kullan.', 'f"{deger:.2f}" iki ondalık yazar.'],
  why='Girdiler her zaman metindir; tutar ondalık olabileceği için float, taksit sayısı tam olduğu için int ile çevrilir. Vade farkı koşulu if ile uygulanır; tutar *= 1.05 da aynı işi görür. Gerçek bir uygulamada kullanıcı "abc" ya da 0 girerse ValueError/ZeroDivisionError oluşur; bunları Dosya ve Hata konusunda try/except ile yakalamayı göreceksin.',
  tags=['input', 'float', 'int', 'bankacılık'], min=4),

dict(topic='Unicode ve Girdi', diff=2, kind='bug',
  title='Bayt sınırını aşan ürün adı',
  q='<p>Kodda bir hata var, bul ve düzelt. Anadolu Market\'in eski stok veritabanında ürün adı sütunu en fazla <code>limit</code> <b>bayt</b> (UTF-8) alıyor. <code>sigar_mi(metin, limit)</code> sığıyorsa <code>True</code> döndürmeli. Türkçe karakterli adlar "sığar" denip veritabanında hata veriyor.</p>',
  start=r'''
def sigar_mi(metin, limit):
    return len(metin) <= limit
''',
  sol=r'''
def sigar_mi(metin, limit):
    return len(metin.encode("utf-8")) <= limit
''',
  tests=r'''
assert sigar_mi("seker", 5) is True, "\"seker\" 5 bayttır, 5 bayta sığar"
assert sigar_mi("şeker", 5) is False, "\"şeker\" 5 karakter ama 6 bayttır (ş 2 bayt): sığmaz"
assert sigar_mi("çğış", 8) is True, "4 Türkçe harf × 2 bayt = 8 bayt: sığar"
assert sigar_mi("", 0) is True, "Boş metin 0 bayttır"
''',
  hints=['len(metin) karakter sayısını verir, bayt sayısını değil.', 'metin.encode("utf-8") bir bytes nesnesi döndürür; onun uzunluğu bayt sayısıdır.'],
  why='Python str\'si Unicode karakterlerden oluşur; len karakter sayar. UTF-8\'de ASCII harfler 1, Türkçe harfler (ş, ğ, ç, ı, ö, ü, İ) 2, emoji 4 bayttır. Veritabanı, dosya ve ağ sınırları bayt cinsindendir; bu yüzden encode edip uzunluğa bakmak gerekir. Tersine bytes → str için .decode("utf-8") kullanılır.',
  tags=['unicode', 'encode', 'UTF-8', 'bytes'], min=3),

# ---------------- Listeler ----------------
dict(topic='Listeler', diff=1, t='predict',
  title='append mi extend mi?',
  q='<p>İki depo listesine yeni ürün kodları ekleniyor. Bu kod ne yazdırır?</p>',
  code=r'''
a = [1, 2]
a.append([3, 4])
b = [1, 2]
b.extend([3, 4])
print(len(a), len(b))
print(a[-1])
''',
  o=['4 4\n4', '3 4\n[3, 4]', '4 3\n[3, 4]', '3 4\n4'], a=1,
  hints=['append argümanını TEK eleman olarak ekler, ne olursa olsun.', 'extend argümandaki elemanları tek tek ekler.'],
  why='append([3, 4]) listeyi tek bir eleman olarak ekler: a = [1, 2, [3, 4]], uzunluk 3 ve son eleman [3, 4]. extend ise elemanları açarak ekler: b = [1, 2, 3, 4], uzunluk 4. b += [3, 4] de extend ile aynı etkiyi yapar. Yanlışlıkla append kullanmak iç içe liste oluşturur ve sonraki toplama/sıralama adımlarında TypeError\'a yol açar.',
  tags=['append', 'extend', 'liste'], min=2),

dict(topic='Listeler', diff=2, t='predict',
  title='Takma ad mı kopya mı?',
  q='<p>Stok listesinin yedeği alınıyor. Bu kod ne yazdırır?</p>',
  code=r'''
stok = [10, 20, 30]
yedek = stok
kopya = stok[:]
stok[0] = 99
print(yedek[0], kopya[0])
''',
  o=['10 10', '99 99', '99 10', '10 99'], a=2,
  hints=['= işareti yeni liste oluşturur mu, yoksa aynı listeye ikinci bir ad mı verir?', '[:] dilimi yeni bir liste üretir.'],
  why='yedek = stok yeni liste oluşturmaz; iki ad aynı nesneyi gösterir (aliasing), bu yüzden stok[0] değişince yedek[0] de 99 olur. stok[:] ise sığ kopya (shallow copy) üretir; bağımsız olduğu için 10 kalır. stok.copy() ve list(stok) da kopya üretir. İç içe listelerde ise copy.deepcopy gerekir (İç İçe Veri görevlerine bak).',
  tags=['aliasing', 'kopya', 'dilimleme'], min=2),
]
