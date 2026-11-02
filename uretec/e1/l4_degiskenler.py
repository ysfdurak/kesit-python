import sys; sys.path.insert(0, sys.path[0])
from lib import *

html = (
'<h2>Çoklu atama, takas ve açma</h2>'
'<p>Python aynı satırda birden fazla değişkene değer atamana izin verir. Bu yalnızca kısalık değil, bazı işleri çok daha güvenli yapar. En bilinen örnek iki değişkenin değerini takas etmektir (swap): başka dillerde geçici bir değişken gerekir, Python\'da tek satır yeter.</p>'
+ P('''
sol_raf, sag_raf = "Çay", "Kahve"
print("Önce:", sol_raf, sag_raf)
sol_raf, sag_raf = sag_raf, sol_raf     # takas
print("Sonra:", sol_raf, sag_raf)

siparis = ("AM-417", "İzmir", 1499.9)   # bir kayıt
no, sehir, tutar = siparis              # açma (unpacking)
print(no, "|", sehir, "|", tutar)

stok = rezerve = 0                      # zincirleme atama
stok += 40
print("stok:", stok, "rezerve:", rezerve)
''') +
'<p>Takas neden çalışır? Python önce sağ tarafın tamamını hesaplar ve geçici bir demet (tuple) kurar, sonra soldaki adlara sırayla dağıtır. Açmada (unpacking) soldaki ad sayısı sağdaki eleman sayısıyla aynı olmalıdır; değilse <code>ValueError: too many values to unpack</code> alırsın. Bu katılık iyi bir şeydir: CSV satırında beklenmedik fazladan bir sütun varsa hata hemen ortaya çıkar.</p>'
'<div class="warn"><b>Zincirleme atamada paylaşım</b><code>stok = rezerve = 0</code> sayılarla güvenlidir çünkü sayı değişmezdir; <code>+=</code> yeni bir sayı üretir. Ama <code>a = b = []</code> yazarsan iki ad <b>aynı</b> listeyi gösterir ve birine eklediğin eleman ötekinde de görünür. Listelerde her değişkene ayrı ayrı <code>[]</code> ata.</div>'

'<h2>Değer, kimlik ve değiştirilebilirlik</h2>'
'<p>Her nesnenin üç özelliği vardır: <b>değer</b> (içeriği), <b>tür</b> ve <b>kimlik</b> (bellekteki yeri). <code>==</code> değerleri, <code>is</code> kimlikleri karşılaştırır; <code>id()</code> ise kimliği bir sayı olarak verir.</p>'
+ P('''
a = [1, 2, 3]
b = [1, 2, 3]
c = a
print(a == b, a is b)    # eşit değerler, farklı nesneler
print(a is c)            # aynı nesneye iki etiket
print(id(a) == id(c))

kargo_no = None
print(kargo_no is None)  # None için hep is kullan
''') +
table(['Değiştirilemez (immutable)', 'Değiştirilebilir (mutable)'], [
    ['<code>int</code>, <code>float</code>, <code>bool</code>, <code>complex</code>', '<code>list</code>'],
    ['<code>str</code>', '<code>dict</code>'],
    ['<code>tuple</code>, <code>frozenset</code>', '<code>set</code>'],
    ['<code>None</code>', 'Kendi yazdığın çoğu sınıf'],
]) +
'<p>Değiştirilemez bir nesneyi "değiştiren" her işlem aslında yeni bir nesne üretir ve adı ona taşır. <code>tutar += 250</code> satırından sonra <code>id(tutar)</code> farklıdır. Değiştirilebilir nesneler ise yerinde değişir; liste, sözlük ve küme derslerinde bu farkın sonuçlarını sık sık göreceksin.</p>'
'<div class="tip"><b>is ile sayı karşılaştırma</b>Küçük tam sayılar ve kısa metinler bellekte önbelleğe alınabildiği için <code>x is 5</code> bazen True çıkar, bazen çıkmaz; Python 3.8+ bunun için uyarı da verir. Kural basit: <code>is</code> yalnızca <code>None</code>, <code>True</code>/<code>False</code> ve "aynı nesne mi" sorusu için; değer karşılaştırmasında hep <code>==</code>.</div>'

'<h2>Tür dönüşümünün tuzakları</h2>'
'<p>Dönüşüm fonksiyonlarının kuralları sezgine her zaman uymaz. Bu tablo, gerçek veride en sık karşılaşılan durumları topluyor; Girdi ve dönüşüm dersinde girdiyi güvenli çevirmeyi ayrıca göreceksin.</p>'
+ table(['İfade', 'Sonuç', 'Neden'], [
    ['<code>int(" 42\\n")</code>', '<code>42</code>', 'Baştaki/sondaki boşluklar yok sayılır'],
    ['<code>int("3.0")</code>', '<code>ValueError</code>', 'int metni yalnız tam sayı yazımı olarak kabul eder'],
    ['<code>int(float("3.0"))</code>', '<code>3</code>', 'Önce float, sonra int'],
    ['<code>int(-3.9)</code>', '<code>-3</code>', 'Sıfıra doğru keser, yuvarlamaz'],
    ['<code>float("1e3")</code>', '<code>1000.0</code>', 'Bilimsel gösterim kabul edilir'],
    ['<code>bool("False")</code>', '<code>True</code>', 'Boş olmayan her metin True\'dur'],
    ['<code>bool(0.0)</code>, <code>bool([])</code>', '<code>False</code>', 'Sıfır ve boş koleksiyonlar False'],
    ['<code>str(None)</code>', '<code>"None"</code>', 'Dört harflik bir metin olur, boş değil'],
    ['<code>int(True)</code>', '<code>1</code>', 'bool, int\'in alt türüdür'],
]) +
P('''
print(int(" 42\\n") + 1)
print(bool("False"), bool(""), bool("0"))
print(repr(str(None)), len(str(None)))
print(isinstance(True, int), type(True) == int)
''') +
'<p>Son satırdaki fark ince ama önemli: <code>isinstance</code> alt türleri de kabul eder (<code>True</code> bir <code>int</code> sayılır), <code>type(x) == int</code> ise tam tür eşleşmesi ister. Bir değerin bool mu sayı mı olduğunu ayırt etmen gerekiyorsa bool kontrolünü <b>önce</b> yap. Birden fazla türe izin vermek için <code>isinstance(x, (int, float))</code> yazabilirsin.</p>'

'<h2>Adlandırmanın ince ayrıntıları</h2>'
+ table(['Biçim', 'Anlamı', 'Örnek'], [
    ['<code>snake_case</code>', 'Normal değişken ve fonksiyon', '<code>toplam_tutar</code>'],
    ['<code>BUYUK_HARF</code>', 'Sabit (değiştirme sözü)', '<code>KDV_ORANI</code>'],
    ['<code>_</code>', 'Kullanılmayacak değer', '<code>no, _, tutar = kayit</code>'],
    ['<code>_on_ek</code>', '"İç kullanım" işareti', '<code>_gecici_toplam</code>'],
    ['<code>son_ek_</code>', 'Anahtar sözcükle çakışmayı önler', '<code>class_</code>, <code>type_</code>'],
    ['<code>__cift__</code>', 'Python\'ın özel adları (dunder)', '<code>__name__</code>; kendin uydurma'],
]) +
'<p>Bir adı <code>del</code> ile silebilirsin; nesneyi değil, etiketi kaldırır. Silinen adı kullanmaya çalışırsan NameError alırsın. Pratikte <code>del</code>\'i değişkenler için nadiren, büyük ara verileri bellekten erken bırakmak için kullanırsın.</p>'
+ P('''
kayit = ("AM-418", "Bursa", 3200)
no, _, tutar = kayit       # şehri kullanmayacağız
print(no, tutar)
gecici = tutar * 2
del gecici
print("gecici" in dir())   # artık tanımlı değil
''') +

'<div class="note"><b>Gerçek işte</b>Uygulama ayarları çoğunlukla ortam değişkenlerinden ya da yapılandırma dosyalarından <b>metin</b> olarak gelir: <code>DEBUG="false"</code>, <code>PORT="8080"</code>. <code>bool("false")</code> True döndürdüğü için "hata ayıklama kapalı" sandığın sistem canlıda açık kalabilir; bu, gerçek projelerde sık görülen bir hatadır. Ayarları okurken metni açıkça karşılaştır (<code>deger.strip().lower() in ("1", "true", "evet")</code>) ve sayıları <code>int()</code> ile çevir. Yapılandırma dersinde bunu pydantic gibi araçlarla otomatikleştirmeyi göreceksin.</div>'
)

ex = [
    dict(t='mc', stage='Isınma',
         q='Bir yapılandırma dosyasından <code>"False"</code> metni okundu. <code>bool("False")</code> ne döndürür?',
         o=['<code>False</code>, çünkü metnin içeriği False', '<code>True</code>, çünkü boş olmayan her metin True\'dur', '<code>ValueError</code> hatası verir', '<code>None</code> döndürür'],
         a=1,
         why='bool() bir metnin içeriğini yorumlamaz, yalnızca boş olup olmadığına bakar. "False", "0", "hayır" hepsi boş olmayan metinlerdir ve True verir. Ayar metinlerini açıkça karşılaştırman gerekir.'),
    dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
         code='a, b = 5, 9\na, b = b, a\nprint(a, b)\n',
         o=['9 5', '5 9', '9 9', '5 5'], a=0,
         why='Sağ taraf (b, a) yani (9, 5) önce tamamen hesaplanır, sonra a ve b\'ye dağıtılır. Bu yüzden takas geçici değişken olmadan doğru çalışır.'),
    dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
         code='print(bool("False"), bool(""), bool(" "), bool(0.0))\n',
         o=['True False True False', 'False False False False', 'False False True False', 'True False False False'], a=0,
         why='"False" ve " " (tek boşluk) boş olmayan metinlerdir, True verir. "" boş metindir, 0.0 sıfırdır; ikisi de False.'),
    dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
         code='x = y = 10\nx += 5\nprint(x, y)\n',
         o=['15 15', '15 10', '10 10', '10 15'], a=1,
         why='Sayılar değiştirilemez. x += 5 mevcut 10\'u değiştirmez, yeni bir 15 nesnesi üretip x etiketini ona taşır; y hâlâ 10\'u gösterir.'),
    dict(t='order', stage='Kodu oku',
         q='<p>Depo stok güncellemesini yapan satırları sırala. Stok metin olarak geliyor, sayıya çevrilip güncellenecek. Çıktı <code>Stok: 125</code> olmalı.</p>',
         lines=['stok_metin = " 120\\n"', 'stok = int(stok_metin)', 'gelen = stok // 4', 'stok = stok + gelen - 25', 'print("Stok:", stok)'],
         expect='Stok: 125\n',
         hint='Hangi değişken hangisinden türetiliyor? gelen, çevrilmiş stok\'un dörtte biri.',
         why='Metin önce int\'e çevrilmeli (int baştaki/sondaki boşlukları yok sayar). gelen = 120 // 4 = 30; yeni stok 120 + 30 - 25 = 125. Satırların her biri bir öncekinin ürettiği değeri kullanır.'),
    dict(t='code', stage='Rehberli', diff=1,
         q='<p>Ayarlar dosyasından gelen metni gerçek bir mantıksal değere çeviren <code>ayar_bool(metin)</code> fonksiyonunu yaz. Baştaki/sondaki boşlukları ve büyük-küçük harfi yok say; <code>"1"</code>, <code>"true"</code>, <code>"evet"</code>, <code>"on"</code> değerleri <code>True</code>, geri kalan her şey <code>False</code> olsun.</p>',
         guide=['Metni strip() ile temizle.', 'lower() ile küçük harfe çevir.', 'Sonucun ("1", "true", "evet", "on") demetinde olup olmadığını in ile sor.', 'in zaten True/False verir; onu doğrudan döndür.'],
         example='renk = "  KIRMIZI "\ntemiz = renk.strip().lower()\nprint(temiz in ("kirmizi", "mavi"))\n',
         start='def ayar_bool(metin):\n    # TODO: metni temizle ve küçük harfe çevir\n    temiz = metin\n    # TODO: kabul edilen değerlerden biri mi?\n    return bool(temiz)\n',
         sol='def ayar_bool(metin):\n    temiz = metin.strip().lower()\n    return temiz in ("1", "true", "evet", "on")\n',
         tests='assert ayar_bool("true") is True, "\\"true\\" True olmalı"\nassert ayar_bool("  TRUE\\n") is True, "Boşluk ve büyük harf yok sayılmalı"\nassert ayar_bool("False") is False, "bool(\\"False\\") tuzağı: False metni False olmalı"\nassert ayar_bool("0") is False, "\\"0\\" False olmalı"\nassert ayar_bool("evet") is True and ayar_bool("on") is True, "evet ve on kabul edilmeli"\nassert ayar_bool("") is False, "Boş metin False olmalı"\n',
         hints=['bool(metin) burada işe yaramaz: içeriğe bakmaz.', 'Temizleme zinciri: metin.strip().lower()', 'return temiz in ("1", "true", "evet", "on")'],
         why='Metni içerik olarak yorumlamak için açık bir karşılaştırma gerekir. in operatörü zaten True/False döndürdüğünden if yazmaya gerek yoktur.'),
    dict(t='code', stage='Rehberli', diff=1,
         q='<p>Sipariş kayıtları <code>("AM-417", "Ayşe Yılmaz", 1499.9, True)</code> biçiminde dört elemanlı demetler (no, müşteri, tutar, ödendi mi) olarak geliyor. <code>siparis_ozeti(kayit)</code> fonksiyonunu yaz; açma (unpacking) kullanarak şu metni döndürsün:</p><pre class="out">AM-417 - Ayşe Yılmaz: 1499.9 TL (ödendi)</pre><p>Ödenmemişse parantez içinde <code>bekliyor</code> yazsın.</p>',
         guide=['Demeti tek satırda dört değişkene aç: no, musteri, tutar, odendi = kayit', 'Ödeme durumunu bir değişkene koy: "ödendi" ya da "bekliyor".', 'f-string ile metni kur ve döndür.'],
         example='urun = ("Kahve", 450, 3)\nad, fiyat, adet = urun\nprint(f"{ad}: {fiyat * adet} TL")\n',
         start='def siparis_ozeti(kayit):\n    # TODO: kaydı dört değişkene aç\n    # TODO: durumu belirle\n    # TODO: metni döndür\n    return ""\n',
         sol='def siparis_ozeti(kayit):\n    no, musteri, tutar, odendi = kayit\n    durum = "ödendi" if odendi else "bekliyor"\n    return f"{no} - {musteri}: {tutar} TL ({durum})"\n',
         tests='assert siparis_ozeti(("AM-417", "Ayşe Yılmaz", 1499.9, True)) == "AM-417 - Ayşe Yılmaz: 1499.9 TL (ödendi)", "Ödenmiş sipariş özeti hatalı"\nassert siparis_ozeti(("AM-418", "Ali Kaya", 250, False)) == "AM-418 - Ali Kaya: 250 TL (bekliyor)", "Ödenmemiş siparişte bekliyor yazmalı"\nassert "= kayit" in __source__, "Kaydı indeksle değil, açma ile (a, b, c, d = kayit) değişkenlere dağıt"\n',
         hints=['Soldaki ad sayısı demetteki eleman sayısıyla (4) aynı olmalı.', 'Koşullu ifade: "ödendi" if odendi else "bekliyor"', 'return f"{no} - {musteri}: {tutar} TL ({durum})"'],
         why='Açma, kayit[0], kayit[1] gibi anlamsız indeksler yerine her alana anlamlı bir ad verir. Kayıt beklenmedik sayıda alan içerirse ValueError ile hemen fark edersin.'),
    dict(t='code', stage='Rehberli', diff=2,
         q='<p>Bir veri temizleme aracı için <code>tur_adi(deger)</code> fonksiyonunu yaz. Değerin türüne göre şu metinlerden birini döndürsün: <code>"bool"</code>, <code>"int"</code>, <code>"float"</code>, <code>"str"</code>, <code>"None"</code>; bunların dışındaki her şey için <code>"diğer"</code>. <code>isinstance</code> kullan.</p><p>Dikkat: <code>isinstance(True, int)</code> da True verir!</p>',
         guide=['Önce None durumunu is None ile yakala.', 'bool kontrolünü int kontrolünden ÖNCE yap; yoksa True "int" sayılır.', 'Sonra int, float ve str için isinstance ile sırayla sor.', 'Hiçbiri değilse "diğer" döndür.'],
         example='def isaret(x):\n    if x is None:\n        return "yok"\n    if isinstance(x, (int, float)):\n        return "sayı"\n    return "başka"\n\nprint(isaret(None), isaret(3.5), isaret("a"))\n',
         start='def tur_adi(deger):\n    # TODO: None\n    # TODO: bool (int\'ten önce!)\n    # TODO: int, float, str\n    if isinstance(deger, int):\n        return "int"\n    return "diğer"\n',
         sol='def tur_adi(deger):\n    if deger is None:\n        return "None"\n    if isinstance(deger, bool):\n        return "bool"\n    if isinstance(deger, int):\n        return "int"\n    if isinstance(deger, float):\n        return "float"\n    if isinstance(deger, str):\n        return "str"\n    return "diğer"\n',
         tests='assert tur_adi(True) == "bool", "True bool olmalı; bool kontrolünü int\'ten önce yap"\nassert tur_adi(42) == "int", "42 int"\nassert tur_adi(3.5) == "float", "3.5 float"\nassert tur_adi("42") == "str", "Tırnaklı 42 bir metindir"\nassert tur_adi(None) == "None", "None için is None"\nassert tur_adi([1, 2]) == "diğer", "Liste diğer sayılmalı"\n',
         hints=['isinstance alt türleri de kabul eder; bool, int\'in alt türüdür.', 'Kontrollerin sırası: None → bool → int → float → str.', 'if isinstance(deger, bool): return "bool" satırı int kontrolünden önce gelmeli.'],
         why='bool, int\'in alt sınıfı olduğundan isinstance(True, int) True verir. Özel olanı (bool) genel olandan (int) önce kontrol etmek, tür ayrımında genel bir kuraldır.'),
    dict(t='code', stage='Kendin yaz', diff=2,
         q='<p>Formlardan gelen alanlar için <code>bos_mu(deger)</code> fonksiyonunu yaz. <code>None</code>, boş metin ve yalnızca boşluktan oluşan metin "boş" sayılsın (<code>True</code>). Ama <code>0</code> ve <code>0.0</code> geçerli değerlerdir (stok sıfır olabilir), boş sayılmasın (<code>False</code>).</p>',
         sol='def bos_mu(deger):\n    if deger is None:\n        return True\n    if isinstance(deger, str):\n        return deger.strip() == ""\n    return False\n',
         tests='assert bos_mu(None) is True, "None boştur"\nassert bos_mu("") is True and bos_mu("   ") is True, "Boş ve yalnız boşluklu metin boştur"\nassert bos_mu(0) is False, "0 geçerli bir stok değeridir, boş değil"\nassert bos_mu(0.0) is False, "0.0 boş değil"\nassert bos_mu("İzmir") is False, "Dolu metin boş değil"\nassert bos_mu(" 0 ") is False, "\\"0\\" metni doludur"\n',
         hints=['if not deger: yazmak 0\'ı da boş sayar; bu yüzden işe yaramaz.', 'Önce is None, sonra metinse strip() ile kontrol et; diğer her şey dolu.'],
         why='"if not deger" kısayolu 0, 0.0 ve False\'u da boş sayar; stok, bakiye gibi alanlarda bu ciddi bir hatadır. Boşluk kavramını türüne göre açıkça tanımlamak gerekir.'),
    dict(t='code', stage='Hata avı', kind='bug', diff=1,
         q='<p>CSV\'den okunan iki adet değeri toplanmalı ama sonuç <code>"355"</code> gibi bir şey çıkıyor. <b>Hatayı bul ve düzelt.</b> <code>toplam_adet("35", "20")</code> → <code>55</code> olmalı.</p>',
         start='def toplam_adet(a_metin, b_metin):\n    toplam = a_metin + b_metin\n    return toplam\n',
         sol='def toplam_adet(a_metin, b_metin):\n    toplam = int(a_metin) + int(b_metin)\n    return toplam\n',
         tests='assert toplam_adet("35", "20") == 55, "35 + 20 = 55 olmalı; metinler + ile birleşir, toplanmaz"\nassert toplam_adet(" 7", "3\\n") == 10, "Boşluklu değerler de çevrilebilmeli"\nassert isinstance(toplam_adet("1", "2"), int), "Sonuç int olmalı"\n',
         hints=['CSV\'den gelen her şey metindir.', 'Metin + metin birleştirme yapar.', 'Toplamadan önce int() ile çevir.'],
         why='Metinlerde + birleştirme operatörüdür: "35" + "20" = "3520". Hata vermediği için fark edilmesi zordur. int() baştaki/sondaki boşlukları kendisi temizler.'),
    dict(t='code', stage='Hata avı', kind='bug', diff=2,
         q='<p>Sepet toplamını hesaplayan fonksiyon <code>TypeError: \'int\' object is not callable</code> veriyor. <b>Hatayı bul ve düzelt.</b></p>',
         start='def sepet_toplami(fiyatlar):\n    sum = 0\n    toplam = sum(fiyatlar)\n    return toplam\n',
         sol='def sepet_toplami(fiyatlar):\n    toplam = sum(fiyatlar)\n    return toplam\n',
         tests='assert sepet_toplami([100, 250, 75]) == 425, "Toplam 425 olmalı"\nassert sepet_toplami([]) == 0, "Boş sepetin toplamı 0"\nassert "sum = " not in __source__, "Hazır sum fonksiyonunun adını değişken olarak kullanma"\n',
         hints=['Hata mesajı "int çağrılamaz" diyor: hangi ad bir int\'e bağlandı?', 'sum hazır bir fonksiyondur; ona 0 atayınca fonksiyonu kaybettin.', 'sum = 0 satırını kaldır ya da değişkene başka bir ad ver.'],
         why='sum = 0 yazınca sum adı artık hazır fonksiyonu değil 0 sayısını gösterir (gölgeleme, shadowing). sum(...) çağrısı 0(...) olur ve TypeError verir. list, str, type, id, input gibi adlar için de aynı tuzak geçerlidir.'),
    dict(t='code', stage='Meydan okuma', diff=3,
         q='<p>Bir CSV hücresindeki metni en uygun Python değerine çeviren <code>otomatik_cevir(metin)</code> fonksiyonunu yaz. Önce baştaki/sondaki boşlukları temizle, sonra:</p><ul><li><code>""</code> ya da <code>"null"</code> (harf duyarsız) → <code>None</code></li><li><code>"true"</code> / <code>"false"</code> (harf duyarsız) → <code>True</code> / <code>False</code></li><li>tam sayı yazımı (<code>"42"</code>, <code>"-7"</code>) → <code>int</code></li><li>ondalık yazımı (<code>"3.5"</code>, <code>"-0.25"</code>) → <code>float</code></li><li>geri kalan her şey → temizlenmiş metin</li></ul><p><code>try/except</code> kullanmadan, metin metotlarıyla çöz.</p>',
         sol='def otomatik_cevir(metin):\n    s = metin.strip()\n    kucuk = s.lower()\n    if kucuk in ("", "null"):\n        return None\n    if kucuk == "true":\n        return True\n    if kucuk == "false":\n        return False\n    govde = s[1:] if s.startswith("-") else s\n    if govde.isdigit():\n        return int(s)\n    if govde.count(".") == 1 and govde.replace(".", "").isdigit():\n        return float(s)\n    return s\n',
         tests='assert otomatik_cevir(" 42 ") == 42 and isinstance(otomatik_cevir("42"), int), "42 int olmalı"\nassert otomatik_cevir("-7") == -7, "Negatif tam sayı desteklenmeli"\nassert otomatik_cevir("3.5") == 3.5 and isinstance(otomatik_cevir("3.5"), float), "3.5 float olmalı"\nassert otomatik_cevir("-0.25") == -0.25, "Negatif ondalık desteklenmeli"\nassert otomatik_cevir("TRUE") is True and otomatik_cevir("false") is False, "true/false harf duyarsız bool olmalı"\nassert otomatik_cevir("") is None and otomatik_cevir("NULL") is None, "Boş ve null None olmalı"\nassert otomatik_cevir("1.2.3") == "1.2.3", "İki noktalı metin sayı değildir"\nassert otomatik_cevir(" İzmir ") == "İzmir", "Diğer metinler temizlenip döner"\nassert otomatik_cevir("-") == "-", "Tek başına eksi işareti metindir"\n',
         hints=['Sıra önemli: önce None, sonra bool, sonra sayılar, en son metin.', 'Eksi işaretini ayrı ele al: govde = s[1:] if s.startswith("-") else s', 'Ondalık için: tam bir nokta olmalı ve nokta silinince geri kalan rakam olmalı.'],
         why='Tür çıkarımı (type inference) pandas gibi araçların CSV okurken yaptığı işin küçük bir modelidir. "".isdigit() False döndürdüğü için tek başına "-" ya da "." sayı sayılmaz. Bu kontroller girdiyi doğrularken try/except\'ten önce düşünülmesi gereken kenar durumları gösterir.'),
]

faq = [
    dict(q='a, b = b, a gerçekten güvenli mi, yoksa bir değer kaybolabilir mi?',
         a='Güvenlidir. Python sağ tarafı tamamen hesaplayıp geçici bir demet oluşturur, atamayı ondan sonra yapar. Bu yüzden atama sırasında a\'nın yeni değeri b\'nin hesabını etkilemez. Üç ya da daha fazla değişkenle de (a, b, c = c, a, b) aynı mantıkla çalışır.'),
    dict(q='type(x) == int mi, isinstance(x, int) mi kullanmalıyım?',
         a='Neredeyse her zaman isinstance. Alt türleri de kabul eder ve birden fazla türü tek seferde sorabilir: isinstance(x, (int, float)). type(x) == int yalnızca tam tür eşleşmesi gerektiğinde, örneğin True\'yu sayıdan ayırmak istediğinde anlamlıdır; orada da isinstance(x, bool) kontrolünü önce yapmak daha okunurdur.'),
]
mistakes = [
    dict(bad='if x == None:\n    print("boş")', good='if x is None:\n    print("boş")',
         why='None tekil bir nesnedir; kimlik karşılaştırması (is) hem daha hızlı hem de daha doğrudur. == bazı sınıflarda özel davranışla beklenmedik sonuç verebilir. PEP 8 None için is kullanılmasını ister.'),
    dict(bad='a = b = []\na.append("AM-101")\nprint(b)  # ["AM-101"] !', good='a = []\nb = []\na.append("AM-101")',
         why='Zincirleme atama tek bir liste oluşturur ve iki adı aynı nesneye bağlar. Değiştirilebilir nesnelerde her değişkene ayrı nesne ata.'),
]

write('degiskenler', 22, html, ex, faq, mistakes)
