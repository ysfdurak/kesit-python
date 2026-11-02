from gen import emit

body = r'''
<h2>Bir harf neden bu kadar sorun çıkarır?</h2>
<p>Anadolu Market'in müşteri listesini Excel'den aldın; "Şişli" yerine "Ãžiãžli", "İzmir" yerine "Ä°zmir" görüyorsun. Aramada "istanbul" yazan müşteri "İSTANBUL" kaydını bulamıyor. Alfabetik sıralı raporda "Çorum" listenin en sonunda, "Zonguldak"tan sonra çıkıyor. Bunların hepsi aynı kökten gelir: bilgisayar harf bilmez, <b>sayı</b> bilir. Bir harfin hangi sayıyla, o sayının da hangi baytlarla saklandığını anlamayan geliştirici, Türkçe veriyle her gün bu hatalarla boğuşur. Bu ders metinlerin "altını" gösteriyor: Unicode, UTF-8, bytes ve Türkçeye özel tuzaklar. Metin metotlarını (split, strip, replace) metinler dersinde gördün; burada karakterin kendisine iniyoruz.</p>

<h2>ASCII, Unicode ve UTF-8</h2>
<p><b>ASCII</b> (1960'lar) 128 karakterlik bir tablodur: İngilizce harfler, rakamlar, noktalama. "A" = 65, "a" = 97. ç, ş, ğ, ı, İ, ö, ü yoktur. Bu yüzden her ülke kendi 256'lık tablosunu yaptı; Türkçe için Windows'ta <b>cp1254</b>, standartlarda <b>ISO-8859-9</b>. Aynı sayı farklı tabloda farklı harf demekti ve karmaşa buradan doğdu.</p>
<p><b>Unicode</b> bu karmaşayı bitiren evrensel katalogdur: dünyadaki her karaktere (emoji dâhil) tek bir numara verir. Bu numaraya <b>kod noktası</b> (code point) denir ve <code>U+00E7</code> (ç) biçiminde yazılır. Unicode "hangi numara" sorusunu çözer; "bu numara diske hangi baytlarla yazılır" sorusunu ise bir <b>kodlama</b> (encoding) çözer. Bugünün standardı <b>UTF-8</b>'dir: ASCII karakterlerini 1 bayt, Türkçe harfleri 2 bayt, çoğu Asya karakterini 3, emojileri 4 baytla yazar. ASCII ile geriye dönük uyumludur; web sayfalarının çok büyük bölümü UTF-8'dir.</p>
<div class="tbl-wrap"><table>
<tr><th>Karakter</th><th>Kod noktası</th><th>ord()</th><th>UTF-8 baytları</th><th>cp1254</th></tr>
<tr><td>A</td><td>U+0041</td><td>65</td><td>41 (1 bayt)</td><td>41</td></tr>
<tr><td>ç</td><td>U+00E7</td><td>231</td><td>C3 A7 (2 bayt)</td><td>E7</td></tr>
<tr><td>ş</td><td>U+015F</td><td>351</td><td>C5 9F (2 bayt)</td><td>FE</td></tr>
<tr><td>ı</td><td>U+0131</td><td>305</td><td>C4 B1 (2 bayt)</td><td>FD</td></tr>
<tr><td>İ</td><td>U+0130</td><td>304</td><td>C4 B0 (2 bayt)</td><td>DD</td></tr>
<tr><td>₺</td><td>U+20BA</td><td>8378</td><td>E2 82 BA (3 bayt)</td><td>yok</td></tr>
<tr><td>😀</td><td>U+1F600</td><td>128512</td><td>F0 9F 98 80 (4 bayt)</td><td>yok</td></tr>
</table></div>

<h2>ord, chr ve kaçış dizileri</h2>
<p>Python 3'te <code>str</code> türü bir Unicode kod noktaları dizisidir. <code>ord(karakter)</code> kod noktasını, <code>chr(sayi)</code> karakteri verir. Klavyede olmayan karakterleri metin içinde <b>kaçış dizileriyle</b> (escape sequences) yazarsın.</p>
<pre class="py">print(ord("A"), ord("a"), ord("ç"), ord("₺"))
print(chr(65), chr(304), chr(0x20BA))
print(f"U+{ord('ş'):04X}")              # kod noktası gösterimi

print("Fiyat: 120\u20ba")               # \u + 4 hane
print("\N{LATIN CAPITAL LETTER I WITH DOT ABOVE}zmir")   # adıyla
print("Ad\tŞehir\nAyşe\tİzmir")         # sekme ve satır sonu
print("C:\\raporlar\\yeni", 'Market\'in', "\"tırnak\"")
print(r"C:\raporlar\yeni")              # ham dize: \ olduğu gibi</pre>
<div class="tbl-wrap"><table>
<tr><th>Dizi</th><th>Anlamı</th><th>Dizi</th><th>Anlamı</th></tr>
<tr><td><code>\n</code></td><td>Satır sonu (newline)</td><td><code>\\</code></td><td>Ters eğik çizginin kendisi</td></tr>
<tr><td><code>\t</code></td><td>Sekme (tab)</td><td><code>\'</code> <code>\"</code></td><td>Tırnak işareti</td></tr>
<tr><td><code>\r</code></td><td>Satır başına dön (Windows satır sonu <code>\r\n</code>)</td><td><code>\xhh</code></td><td>2 haneli onaltılık kod</td></tr>
<tr><td><code>\uhhhh</code></td><td>4 haneli kod noktası</td><td><code>\U0001F600</code></td><td>8 haneli kod noktası</td></tr>
</table></div>
<div class="warn"><b>Windows yolu tuzağı</b><code>"C:\yeni\tablo.csv"</code> yazarsan <code>\t</code> sekmeye dönüşür ve dosya bulunamaz (<code>\y</code> ise Python 3.12'de SyntaxWarning verir). Üç çözüm: ham dize <code>r"C:\yeni\tablo.csv"</code>, ileri eğik çizgi <code>"C:/yeni/tablo.csv"</code> (Windows bunu da kabul eder) ya da en iyisi <code>pathlib.Path</code>. Ham dize tek ters eğik çizgiyle bitemez: <code>r"C:\"</code> sözdizimi hatasıdır.</div>

<h2>bytes: metnin disk ve ağdaki hâli</h2>
<p>Dosyalar, ağ paketleri ve veritabanı sürücüleri <b>bayt</b> taşır. Python'da bunun türü <code>bytes</code>'tır ve <code>b"..."</code> ile yazılır. Metni bayta çevirmeye <b>encode</b> (kodlama), bayttan metne dönmeye <b>decode</b> (kod çözme) denir. Kural: <b>içeride str, sınırda bytes</b>. Programına giren baytı hemen decode et, çıkarken encode et.</p>
<pre class="py">metin = "Şube: İzmir ₺"
veri = metin.encode("utf-8")
print(veri)
print(len(metin), "karakter,", len(veri), "bayt")
print(veri.decode("utf-8") == metin)

eski = metin[:-2].encode("cp1254")          # eski Windows Türkçe tablosu
print(eski, len(eski), "bayt")
try:
    eski.decode("utf-8")
except UnicodeDecodeError as e:
    print("Hata:", e.reason, "| konum:", e.start)
print(eski.decode("cp1254"))
print(eski.decode("utf-8", errors="replace"))</pre>
<p>Son satırdaki <code>errors="replace"</code> çözülemeyen baytları <code>�</code> ile değiştirir; <code>"ignore"</code> sessizce atar. İkisi de veri kaybıdır, yalnızca son çare olarak kullan. Asıl çözüm: verinin hangi kodlamayla yazıldığını öğrenip onunla açmak.</p>
<h3>Dosyalarda encoding="utf-8"</h3>
<p><code>open()</code> kodlama belirtilmezse işletim sisteminin varsayılanını kullanır; Türkçe Windows'ta bu genellikle cp1254'tür, macOS/Linux'ta UTF-8. Aynı kod iki bilgisayarda farklı davranır. Bu yüzden metin dosyası açarken <b>her zaman</b> <code>encoding="utf-8"</code> yaz. Excel'in "CSV UTF-8" kaydı dosyanın başına görünmez bir BOM işareti koyar; böyle dosyaları <code>encoding="utf-8-sig"</code> ile açarsan ilk sütun adı bozulmaz.</p>
<pre class="py">with open("musteriler.csv", "w", encoding="utf-8") as f:
    f.write("ad;şehir\nAyşe;İzmir\nÇağrı;Muğla\n")

with open("musteriler.csv", encoding="utf-8") as f:
    print(f.read())

with open("musteriler.csv", "rb") as f:          # ikili mod: bytes gelir
    print(f.read()[:12])</pre>

<h2>Türkçe I/İ/ı/i: büyük-küçük harf tuzağı</h2>
<p>Türkçede dört ayrı i harfi vardır: noktalı <b>i/İ</b> ve noktasız <b>ı/I</b>. Python'un <code>upper()</code> ve <code>lower()</code> metotları Unicode'un <b>dilden bağımsız</b> kurallarını uygular; o kurallarda <code>i</code>'nin büyüğü <code>I</code>'dır. Sonuç:</p>
<pre class="py">print("istanbul".upper())          # ISTANBUL  (İSTANBUL değil!)
print("IĞDIR".lower())             # iğdir     (ığdır değil!)
print("ırmak".upper())             # IRMAK     (doğru)
kucuk = "İzmir".lower()
print(kucuk, len(kucuk), len("İzmir"))   # i + birleşik nokta: 6 karakter!
print(kucuk == "izmir")
print("Straße".lower(), "Straße".casefold())   # casefold daha agresif</pre>
<p><code>"İ".lower()</code>, <code>i</code> ve ardından görünmez bir <b>birleşik nokta</b> (U+0307) üretir; uzunluk 2 olur ve "izmir" ile eşleşmez. <code>casefold()</code> büyük/küçük harf duyarsız karşılaştırma için tasarlanmıştır (Almanca ß → ss) ama Türkçe I sorununu o da çözmez. Çözüm basit: büyütmeden/küçültmeden önce dört harfi elle eşle.</p>
<pre class="py">def tr_upper(metin):
    return metin.replace("i", "İ").replace("ı", "I").upper()

def tr_lower(metin):
    return metin.replace("İ", "i").replace("I", "ı").lower()

print(tr_upper("istanbul ılgaz"))     # İSTANBUL ILGAZ
print(tr_lower("IĞDIR İZMİR"))        # ığdır izmir
print(tr_lower("İzmir") == "izmir")   # True</pre>
<div class="tip"><b>str.maketrans ile daha hızlı</b>Çok sayıda kayıtta <code>TR_BUYUK = str.maketrans("iı", "İI")</code> tablosunu bir kez oluşturup <code>metin.translate(TR_BUYUK).upper()</code> kullanmak, zincirleme replace'ten daha hızlı ve okunurdur.</div>

<h2>Metin karşılaştırma ve Türkçe sıralama</h2>
<p>Python metinleri <b>kod noktası sırasıyla</b>, karakter karakter karşılaştırır (sözlükbilimsel, lexicographic). İlk farklı karakter kazananı belirler; biri diğerinin başıysa kısa olan küçüktür. Bu, PCAP sınavının sevdiği bir konudur ve üç sürpriz içerir: büyük harfler küçüklerden önce gelir (<code>"Z" &lt; "a"</code>), rakamlar metin gibi karşılaştırılır (<code>"10" &lt; "9"</code>) ve Türkçe harfler İngilizce alfabenin <b>sonuna</b> düşer (ç = 231, z = 122).</p>
<pre class="py">print("Zeytin" &lt; "armut", "10" &lt; "9", "elma" &lt; "elmas")
sehirler = ["Zonguldak", "çorum", "Ankara", "Iğdır", "İzmir", "ağrı", "Bursa", "Şanlıurfa"]
print(sorted(sehirler))

ALFABE = "abcçdefgğhıijklmnoöpqrsştuüvwxyz"
SIRA = {harf: i for i, harf in enumerate(ALFABE)}

def tr_anahtar(kelime):
    kucuk = kelime.replace("İ", "i").replace("I", "ı").lower()
    return [SIRA.get(h, 100 + ord(h)) for h in kucuk]

print(sorted(sehirler, key=tr_anahtar))</pre>
<p><code>sorted</code>'a verdiğin <code>key</code> fonksiyonu her elemanı karşılaştırılabilir bir değere çevirir; burada her harfi Türk alfabesindeki sırasına. Alfabede olmayan karakterler (boşluk, rakam) 100'den sonraya, kendi kod noktası sırasıyla yerleşir. Kendi bilgisayarında <code>locale.setlocale(locale.LC_COLLATE, "tr_TR.UTF-8")</code> ve <code>key=locale.strxfrm</code> da kullanılabilir, ama yerel ayarın sistemde kurulu olmasına bağlıdır; sunucularda çoğu zaman yoktur.</p>

<h2>Normalleştirme: aynı görünen, farklı olan</h2>
<p>"ç" harfi Unicode'da iki biçimde yazılabilir: tek kod noktası <code>U+00E7</code> (birleşik, NFC) ya da <code>c</code> + birleşik çengel <code>U+0327</code> (ayrışık, NFD). Ekranda aynı görünürler ama <code>==</code> False döner. macOS dosya adları ve bazı kopyala-yapıştır kaynakları NFD üretir. <code>unicodedata.normalize</code> ikisini aynı biçime getirir; aynı araç aksanları silmek (URL kısaltması, "slug") için de kullanılır.</p>
<pre class="py">import unicodedata

a = "\u00e7ay"           # ç tek kod noktası
b = "c\u0327ay"          # c + birleşik çengel
print(a, b, a == b, len(a), len(b))
print(unicodedata.normalize("NFC", a) == unicodedata.normalize("NFC", b))

def aksansiz(metin):
    ayrik = unicodedata.normalize("NFD", metin)
    sade = "".join(h for h in ayrik if not unicodedata.combining(h))
    return sade.replace("ı", "i")      # ı ayrışmaz, elle eşle

print(aksansiz("Çağrı Şüküroğlu Gölbaşı"))
print(unicodedata.name("ğ"))</pre>
<div class="note"><b>Gerçek işte</b>Ilgaz Bank müşteri eşleştirme ekibi, şubelerden gelen "İSMAİL ÖZTÜRK", "ismail ozturk" ve "Ismail Öztürk" kayıtlarının aynı kişi olup olmadığını bulmak zorunda. Kullandıkları "anahtar üretici" tam olarak bu dersin adımlarıdır: NFC normalleştirme, Türkçe kurallarıyla küçük harf, aksanları silme, fazla boşlukları teke indirme. Bu anahtar üzerinden yapılan eşleştirme, mükerrer müşteri kaydını ve bunun yol açtığı yanlış risk raporlarını büyük ölçüde azaltır. E-ticaret aramasında da aynı mantık çalışır: "cagri" yazan kullanıcı "Çağrı" ürününü bulmalıdır.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Karakter mi, kod noktası mı, grafem mi?</h3>
<p><code>len()</code> kod noktası sayar. Kullanıcının "bir karakter" gördüğü şeye <b>grafem</b> (grapheme) denir ve birden fazla kod noktasından oluşabilir: ayrışık "ç" 2, bayrak emojisi 2, aile emojisi 7 kod noktasıdır. SMS karakter sayacı ya da isim kısaltma gibi işlerde bu fark hataya yol açar. Grafem kümelemesi için <code>regex</code> paketinin <code>\X</code> deseni ya da <code>grapheme</code> paketi kullanılır (kendi bilgisayarında: <code>pip install regex</code>).</p>
<h3>Bayt sınırı olan alanlar</h3>
<p>Bazı veritabanı sütunları ve protokoller sınırı karakter değil <b>bayt</b> olarak koyar. "50 karakter" sandığın "ŞŞŞ..." metni UTF-8'de 100 bayttır. Kırparken baytı ortadan bölersen geçersiz UTF-8 üretirsin; doğru yol karakter karakter ilerleyip bayt toplamını izlemek ya da <code>veri[:sinir].decode("utf-8", errors="ignore")</code> ile yarım kalan son karakteri atmaktır.</p>
<h3>Varsayılan kodlamanın geleceği</h3>
<p>PEP 686 ile Python 3.15'te UTF-8 modu varsayılan hâle geliyor; o zaman <code>open()</code> her platformda UTF-8 kullanacak. O güne kadar ve eski sürümleri destekleyen her kodda <code>encoding="utf-8"</code> yazmak tek güvenli yoldur. <code>python -X utf8</code> ya da <code>PYTHONUTF8=1</code> ortam değişkeni bu modu bugünden açar.</p>
<h3>Gerçek dilbilimsel sıralama</h3>
<p>Kendi anahtar fonksiyonun Türkçe için yeterlidir; çok dilli ürünlerde ise Unicode Collation Algorithm (UCA) gerekir. PyICU paketi bunu sağlar: <code>icu.Collator.createInstance(icu.Locale("tr_TR"))</code>. Veritabanı tarafında PostgreSQL'in <code>COLLATE "tr-TR-x-icu"</code> ayarı aynı işi yapar.</p>
</section>
'''

ex = []
ex += [
  dict(t='mc', stage='Isınma',
    q='"ş" harfi UTF-8 ile kodlandığında kaç bayt yer kaplar?',
    o=['1', '2', '3', '4'], a=1,
    why='ASCII dışındaki Latin harfleri (ç, ş, ğ, ı, İ, ö, ü) UTF-8\'de 2 bayttır. ASCII karakterleri 1, ₺ gibi semboller 3, emojiler 4 bayttır.'),
  dict(t='mc', stage='Isınma',
    q='Python\'da <code>"IĞDIR".lower()</code> ne döndürür?',
    o=['"ığdır"', '"iğdir"', '"IĞDIR"', 'UnicodeError'], a=1,
    why='lower() dilden bağımsız Unicode kuralını uygular: I\'nın küçüğü i\'dir. Türkçe doğru sonuç (ığdır) için I → ı eşlemesini önceden elle yapmalısın.'),
  dict(t='mc', stage='Isınma',
    q='<code>UnicodeDecodeError</code> hatası en çok hangi durumda ortaya çıkar?',
    o=['Metin çok uzun olduğunda', 'str değerini encode etmeye çalışırken', 'Baytları yanlış kodlamayla çözerken', 'Dosya bulunamadığında'], a=2,
    why='Decode bayttan metne dönüştür. cp1254 ile yazılmış baytları utf-8 ile çözmeye çalışınca geçersiz bayt dizileri bu hatayı verir. Çözüm doğru kodlamayı (encoding=...) belirtmektir.'),
]
ex += [
  dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
    code='print(len("çay"), len("çay".encode("utf-8")), "Zeytin" < "armut")\n',
    o=['3 3 False', '3 4 True', '4 4 True', '3 4 False'], a=1,
    why='"çay" 3 karakterdir; ç UTF-8\'de 2 bayt olduğundan toplam 4 bayt. "Z" (90) "a"dan (97) küçük kod noktasına sahip olduğu için "Zeytin" < "armut" True\'dur.'),
  dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
    code='k = "İ".lower()\nprint(k == "i", len(k))\n',
    o=['True 1', 'False 1', 'False 2', 'True 2'], a=2,
    why='"İ".lower() tek başına i değil, i + birleşik nokta (U+0307) üretir. Bu yüzden "i" ile eşit değildir ve uzunluğu 2\'dir. Türkçe metinde tr_lower gibi bir yardımcı şart.'),
  dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
    code='print(sorted(["Zeytin", "armut", "Çilek", "elma"]))\n',
    o=["['armut', 'Çilek', 'elma', 'Zeytin']", "['Zeytin', 'armut', 'elma', 'Çilek']", "['armut', 'elma', 'Zeytin', 'Çilek']", "['Çilek', 'Zeytin', 'armut', 'elma']"], a=1,
    why='Varsayılan sıralama kod noktasına göredir: büyük harfler (Z=90) küçüklerden (a=97) önce, Ç (199) ise ASCII harflerinin tamamından sonra gelir. Türkçe sıralama için key fonksiyonu gerekir.'),
  dict(t='order', stage='Kodu oku',
    q='<p>Bir metni UTF-8 baytlarına çevirip geri çözen ve karakter sayısı, bayt sayısı ile gidiş-dönüş eşitliğini yazdıran programı sırala. Çıktı <code>11 13 True</code> olmalı.</p>',
    lines=['ham = "Şube: İzmir"', 'veri = ham.encode("utf-8")', 'geri = veri.decode("utf-8")', 'print(len(ham), len(veri), geri == ham)'],
    expect='11 13 True\n',
    hint='Önce metin, sonra encode (str → bytes), sonra decode (bytes → str).',
    why='encode metni bayta, decode baytı metne çevirir. Ş ve İ ikişer bayt olduğu için 11 karakter 13 bayt eder; aynı kodlamayla gidiş-dönüş kayıpsızdır.'),
]
ex += [
  dict(t='code', id='unicode-metin-1', stage='Rehberli', diff=1,
    q='<p>Anadolu Market kargo etiketlerinde şehir ve müşteri adları büyük harfle basılıyor, arama kutusunda ise küçük harfe çevriliyor. Türkçe kurallarına uyan iki fonksiyon yaz: <code>tr_upper(metin)</code> ve <code>tr_lower(metin)</code>. <code>i ↔ İ</code> ve <code>ı ↔ I</code> doğru eşleşmeli; diğer harfler normal upper/lower ile dönüşmeli.</p>',
    guide=['tr_upper: önce "i" → "İ" ve "ı" → "I" değiştir.', 'Sonra kalan harfler için .upper() çağır.', 'tr_lower: önce "İ" → "i" ve "I" → "ı" değiştir.', 'Sonra .lower() çağır.'],
    example='# Aynı fikir: özel durumu önce elle çöz, sonra genel kuralı uygula\ndef almanca_buyuk(metin):\n    return metin.replace("ß", "ẞ").upper()\n\nprint(almanca_buyuk("straße"))\n',
    start='def tr_upper(metin):\n    # TODO: i ve ı harflerini önce elle dönüştür\n    return metin.upper()\n\ndef tr_lower(metin):\n    # TODO: İ ve I harflerini önce elle dönüştür\n    return metin.lower()\n',
    sol='def tr_upper(metin):\n    return metin.replace("i", "İ").replace("ı", "I").upper()\n\ndef tr_lower(metin):\n    return metin.replace("İ", "i").replace("I", "ı").lower()\n',
    tests='assert tr_upper("istanbul") == "İSTANBUL", "i büyüyünce İ olmalı"\nassert tr_upper("ılgaz çiçek") == "ILGAZ ÇİÇEK", "ı → I, i → İ, ç → Ç"\nassert tr_lower("IĞDIR") == "ığdır", "I küçülünce ı olmalı"\nassert tr_lower("İZMİR") == "izmir", "İ küçülünce tek karakterlik i olmalı"\nassert len(tr_lower("İ")) == 1, "Birleşik nokta (U+0307) kalmamalı"\nassert tr_lower(tr_upper("şırınga ile")) == "şırınga ile", "Gidiş-dönüş aynı metni vermeli"\n',
    hints=['Python\'un upper/lower\'ı Türkçe değil, dilden bağımsız kurala göre çalışır.', 'replace\'i upper/lower\'dan ÖNCE uygula; sonra yaparsan iş işten geçmiş olur.', 'return metin.replace("i", "İ").replace("ı", "I").upper()'],
    why='Özel durumları önce elle dönüştürüp kalanını genel metoda bırakmak, dil-özel kuralları uygulamanın en basit yoludur. "İ".lower() birleşik nokta ürettiği için tr_lower\'da İ → i eşlemesi şarttır.'),
  dict(t='code', id='unicode-metin-2', stage='Rehberli', diff=2,
    q='<p>Belediye nüfus raporundaki mahalle adları Türk alfabesine göre sıralanmalı. <code>tr_sirala(kelimeler)</code> fonksiyonu yeni bir sıralı liste döndürsün:</p><ul><li>Alfabe: <code>"abcçdefgğhıijklmnoöpqrsştuüvwxyz"</code></li><li>Büyük/küçük harf fark etmesin (Türkçe kurallarıyla küçült: İ→i, I→ı).</li><li>Alfabede olmayan karakterler (boşluk, rakam, tire) tüm harflerden sonra, kendi kod noktası sırasıyla gelsin.</li></ul>',
    guide=['Harf → sıra numarası sözlüğü kur: {harf: i for i, harf in enumerate(ALFABE)}.', 'tr_anahtar(kelime) yardımcı fonksiyonu yaz: önce Türkçe küçült.', 'Her harfi sıra numarasına çevir; sözlükte yoksa 100 + ord(harf) kullan.', 'Liste döndür ve sorted(kelimeler, key=tr_anahtar) ile sırala.'],
    example='# Özel sıra: beden ölçülerini mantıklı sıraya koy\nSIRA = {"S": 0, "M": 1, "L": 2, "XL": 3}\nbedenler = ["XL", "S", "L", "M", "S"]\nprint(sorted(bedenler, key=lambda b: SIRA.get(b, 99)))\n',
    start='ALFABE = "abcçdefgğhıijklmnoöpqrsştuüvwxyz"\nSIRA = {harf: i for i, harf in enumerate(ALFABE)}\n\ndef tr_anahtar(kelime):\n    # TODO: Türkçe küçült, sonra her harfi sıra numarasına çevir\n    return kelime.lower()\n\ndef tr_sirala(kelimeler):\n    # TODO: key olarak tr_anahtar kullan\n    return sorted(kelimeler)\n',
    sol='ALFABE = "abcçdefgğhıijklmnoöpqrsştuüvwxyz"\nSIRA = {harf: i for i, harf in enumerate(ALFABE)}\n\ndef tr_anahtar(kelime):\n    kucuk = kelime.replace("İ", "i").replace("I", "ı").lower()\n    return [SIRA.get(h, 100 + ord(h)) for h in kucuk]\n\ndef tr_sirala(kelimeler):\n    return sorted(kelimeler, key=tr_anahtar)\n',
    tests='m = ["Zafer", "çamlık", "Cumhuriyet", "Işıklar", "İnönü", "hürriyet", "Ğ Sokak", "Gazi", "Şirinyer", "sahil", "Ufuk", "Ümit", "Ova", "Özgür"]\nbeklenen = ["Cumhuriyet", "çamlık", "Gazi", "Ğ Sokak", "hürriyet", "Işıklar", "İnönü", "Ova", "Özgür", "sahil", "Şirinyer", "Ufuk", "Ümit", "Zafer"]\nassert tr_sirala(m) == beklenen, "Türk alfabesi sırası bekleniyordu, geldi: " + repr(tr_sirala(m))\nassert tr_sirala(["ab", "a"]) == ["a", "ab"], "Kısa olan (önek) önce gelmeli"\nassert tr_sirala(["a1", "a b", "ab"]) == ["ab", "a b", "a1"], "Harf olmayanlar harflerden sonra gelmeli"\nliste = ["b", "a"]\ntr_sirala(liste)\nassert liste == ["b", "a"], "Orijinal liste değişmemeli (sorted yeni liste döndürür)"\n',
    hints=['sorted(..., key=f) her elemanı f ile karşılaştırılabilir bir değere çevirir; listeler eleman eleman karşılaştırılır.', 'dict.get(h, 100 + ord(h)) alfabede olmayan karakteri sona atar.', 'return [SIRA.get(h, 100 + ord(h)) for h in kucuk]'],
    why='key fonksiyonu her kelimeyi bir sayı listesine çevirir; Python listeleri soldan sağa karşılaştırdığı için sonuç Türk alfabesine göre sözlükbilimsel sıradır. Küçültmeyi Türkçe kuralıyla yapmak I/İ harflerinin doğru yere düşmesini sağlar.'),
  dict(t='code', id='unicode-metin-3', stage='Rehberli', diff=2,
    q='<p>Şubelerden gelen dosyaların bazıları UTF-8, bazıları eski Windows Türkçe (cp1254) kodlamasında. <code>guvenli_coz(veri)</code> fonksiyonu <code>bytes</code> alsın ve:</p><ul><li>Önce UTF-8 ile çözmeyi denesin.</li><li><code>UnicodeDecodeError</code> olursa cp1254 ile çözsün.</li><li><code>(metin, kullanilan_kodlama)</code> demeti döndürsün; kodlama adı <code>"utf-8"</code> ya da <code>"cp1254"</code>.</li></ul>',
    guide=['try bloğunda veri.decode("utf-8") dene ve ("...", "utf-8") döndür.', 'except UnicodeDecodeError bloğu yaz.', 'Orada veri.decode("cp1254") ile çöz ve kodlamayı "cp1254" olarak döndür.'],
    example='def sayi_oku(metin):\n    try:\n        return int(metin), "tam sayı"\n    except ValueError:\n        return float(metin), "ondalık"\n\nprint(sayi_oku("42"), sayi_oku("4.5"))\n',
    start='def guvenli_coz(veri):\n    # TODO: önce utf-8 dene, olmazsa cp1254\n    return veri.decode("utf-8"), "utf-8"\n',
    sol='def guvenli_coz(veri):\n    try:\n        return veri.decode("utf-8"), "utf-8"\n    except UnicodeDecodeError:\n        return veri.decode("cp1254"), "cp1254"\n',
    tests='assert guvenli_coz("Şeker 1 kg".encode("utf-8")) == ("Şeker 1 kg", "utf-8"), "UTF-8 veri utf-8 ile çözülmeli"\nassert guvenli_coz("Şeker 1 kg".encode("cp1254")) == ("Şeker 1 kg", "cp1254"), "cp1254 veri UnicodeDecodeError sonrası cp1254 ile çözülmeli"\nassert guvenli_coz(b"Cay 2 kg") == ("Cay 2 kg", "utf-8"), "Saf ASCII her iki kodlamada geçerli; utf-8 önce denenmeli"\nassert guvenli_coz("Iğdır".encode("cp1254"))[0] == "Iğdır", "ğ ve ı cp1254\'te de doğru çözülmeli"\n',
    hints=['Hata türü UnicodeDecodeError; genel except kullanma.', 'try içindeki return başarılıysa except hiç çalışmaz.', 'except UnicodeDecodeError: return veri.decode("cp1254"), "cp1254"'],
    why='UTF-8 katı bir biçime sahiptir; cp1254 baytları (ör. Ş = 0xDE) çoğu zaman geçersiz UTF-8 dizisi oluşturur ve hata verir. Bu yüzden önce UTF-8 denemek, olmazsa eski kodlamaya düşmek pratik ve güvenilir bir sezgiseldir. Ters sırayla denersen cp1254 her baytı kabul ettiği için UTF-8 veriyi bozuk çözersin.'),
  dict(t='code', id='unicode-metin-4', stage='Rehberli', diff=2,
    q='<p>Anadolu Market ürün sayfası adresleri (URL) için "slug" üret. <code>slug_yap(baslik)</code>:</p><ul><li>Türkçe kurallarıyla küçük harfe çevir (İ→i, I→ı).</li><li><code>unicodedata.normalize("NFD", ...)</code> ile ayrıştırıp birleşik işaretleri (<code>unicodedata.combining</code>) at; <code>ı</code> harfini elle <code>i</code> yap.</li><li>Harf ya da rakam olmayan her karakter dizisini tek tireye çevir; baştaki/sondaki tireleri sil.</li></ul><p>Örnek: <code>"Çağrı Merkezi: İş İlanı!"</code> → <code>"cagri-merkezi-is-ilani"</code></p>',
    guide=['Önce Türkçe küçült (İ → i, I → ı, sonra lower).', 'NFD ile ayrıştır ve combining olmayan karakterleri birleştir; ardından ı → i.', 'Karakter karakter gez: isalnum() ise ekle, değilse tire ekle (son karakter zaten tire değilse).', 'Sonucu strip("-") ile temizleyip döndür.'],
    example='import unicodedata\nad = "Gölbaşı"\nayrik = unicodedata.normalize("NFD", ad)\nprint(len(ad), len(ayrik))\nprint([unicodedata.name(h) for h in ayrik][:3])\nprint("".join(h for h in ayrik if not unicodedata.combining(h)))\n',
    start='import unicodedata\n\ndef slug_yap(baslik):\n    metin = baslik.lower()   # TODO: Türkçe küçült\n    # TODO: NFD + combining olanları at + ı -> i\n    sonuc = ""\n    for h in metin:\n        # TODO: harf/rakam değilse tek tire\n        sonuc += h\n    return sonuc\n',
    sol='import unicodedata\n\ndef slug_yap(baslik):\n    metin = baslik.replace("İ", "i").replace("I", "ı").lower()\n    ayrik = unicodedata.normalize("NFD", metin)\n    metin = "".join(h for h in ayrik if not unicodedata.combining(h)).replace("ı", "i")\n    sonuc = ""\n    for h in metin:\n        if h.isalnum():\n            sonuc += h\n        elif not sonuc.endswith("-"):\n            sonuc += "-"\n    return sonuc.strip("-")\n',
    tests='assert slug_yap("Çağrı Merkezi: İş İlanı!") == "cagri-merkezi-is-ilani", "Örnek başlık"\nassert slug_yap("  IĞDIR   Kayısısı 1 kg ") == "igdir-kayisisi-1-kg", "Baş/son tire olmamalı, ardışık boşluk tek tire"\nassert slug_yap("Şüküroğlu & Öztürk") == "sukuroglu-ozturk", "Aksanlar silinmeli, & ve boşluklar tek tire"\nassert slug_yap("!!!") == "", "Yalnız işaret varsa boş slug"\n',
    hints=['ı harfinin NFD ayrışması yoktur; combining ile silinmez, replace("ı", "i") gerekir.', 'İ\'yi lower() ile küçültürsen i + birleşik nokta olur; NFD aşaması noktayı siler ama Türkçe küçültme ile başlamak daha temizdir.', 'Tire eklemeden önce sonuc.endswith("-") ile tekrarı engelle.'],
    why='NFD her aksanlı harfi taban harf + birleşik işarete ayırır; combining işaretleri atınca ç→c, ş→s, ğ→g, ö→o, ü→u olur. ı tek kod noktası olduğundan elle eşlenir. Bu, arama motorları ve URL\'ler için yaygın bir "ASCII\'leştirme" kalıbıdır.'),
]
ex += [
  dict(t='code', id='unicode-metin-5', stage='Kendin yaz', diff=1,
    q='<p><code>kod_noktalari(metin)</code> fonksiyonu metindeki her karakterin Unicode kod noktasını <code>"U+XXXX"</code> biçiminde (en az 4 haneli, büyük harfli onaltılık) bir liste olarak döndürsün. Örnek: <code>kod_noktalari("Aç")</code> → <code>["U+0041", "U+00E7"]</code>.</p>',
    start='def kod_noktalari(metin):\n    pass\n',
    sol='def kod_noktalari(metin):\n    return [f"U+{ord(h):04X}" for h in metin]\n',
    tests='assert kod_noktalari("Aç") == ["U+0041", "U+00E7"], "A=0041, ç=00E7"\nassert kod_noktalari("İı") == ["U+0130", "U+0131"], "İ ve ı ardışık kod noktalarıdır"\nassert kod_noktalari("₺") == ["U+20BA"], "Türk lirası işareti"\nassert kod_noktalari("😀") == ["U+1F600"], "4 haneden büyük kod noktası kırpılmamalı"\nassert kod_noktalari("") == [], "Boş metin boş liste"\n',
    hints=['ord(h) kod noktasını tam sayı olarak verir.', 'f-string biçimi: :04X → en az 4 hane, sıfırla doldur, büyük onaltılık.', 'return [f"U+{ord(h):04X}" for h in metin]'],
    why='ord karakteri sayıya çevirir, :04X biçimi onu Unicode belgelerindeki standart gösterime dönüştürür. 04 en az genişliktir; daha büyük sayılar kırpılmaz.'),
  dict(t='code', id='unicode-metin-6', stage='Kendin yaz', diff=2,
    q='<p>Log dosyasına yazılan kullanıcı mesajlarında satır sonu ve sekme karakterleri log satırlarını bozuyor. <code>gorunur_yap(metin)</code> fonksiyonu:</p><ul><li>Ters eğik çizgi <code>\\</code> → iki karakterlik <code>\\\\</code></li><li>Satır sonu → iki karakterlik <code>\\n</code></li><li>Sekme → iki karakterlik <code>\\t</code></li></ul><p>dönüşümlerini yapsın. Sonuç tek satır olmalı ve dönüşüm geri alınabilir olmalı (önceden metinde bulunan ters eğik çizgi ile senin eklediğin karışmamalı).</p>',
    start='def gorunur_yap(metin):\n    pass\n',
    sol='def gorunur_yap(metin):\n    return metin.replace("\\\\", "\\\\\\\\").replace("\\n", "\\\\n").replace("\\t", "\\\\t")\n',
    tests='assert gorunur_yap("Merhaba\\nDünya") == "Merhaba\\\\nDünya", "Satır sonu iki karakterlik \\\\n olmalı"\nassert gorunur_yap("a\\tb") == "a\\\\tb", "Sekme \\\\t olmalı"\nassert gorunur_yap("C:\\\\yeni") == "C:\\\\\\\\yeni", "Var olan ters eğik çizgi ikiye katlanmalı"\nassert gorunur_yap("x\\\\n") == "x\\\\\\\\n", "Metindeki \\\\ + n ile gerçek satır sonu karışmamalı: önce ters eğik çizgiyi kaçır"\nassert "\\n" not in gorunur_yap("1\\n2\\n3"), "Sonuç tek satır olmalı"\n',
    hints=['Python kodunda tek ters eğik çizgi "\\\\" ile yazılır; satır sonu "\\n".', 'Sıra önemli: ters eğik çizgiyi EN ÖNCE kaçır, yoksa eklediğin \\n\'leri de ikiye katlarsın.', 'Üç replace\'i zincirle: önce "\\\\", sonra "\\n", sonra "\\t".'],
    why='Kaçış işleminde kaçış karakterinin kendisi önce işlenmelidir; aksi hâlde sonraki adımda eklenen ters eğik çizgiler yeniden kaçırılır ve dönüşüm geri alınamaz hâle gelir. repr() ve json.dumps da aynı kuralı izler.'),
  dict(t='code', id='unicode-metin-7', stage='Kendin yaz', diff=2,
    q='<p>Müşteri arama formunda iki adın "aynı" sayılıp sayılmayacağına karar veren <code>turkce_esit(a, b)</code> fonksiyonunu yaz. İki metin şu işlemlerden sonra eşitse True döndür: NFC normalleştirme, baş/son boşlukları kırpma, aradaki birden fazla boşluğu teke indirme, Türkçe kurallarıyla küçük harfe çevirme (İ→i, I→ı). Aksanları <b>silme</b>: "Öztürk" ile "Ozturk" farklıdır.</p>',
    start='def turkce_esit(a, b):\n    pass\n',
    sol='import unicodedata\n\ndef _anahtar(s):\n    s = unicodedata.normalize("NFC", s)\n    s = " ".join(s.split())\n    return s.replace("İ", "i").replace("I", "ı").lower()\n\ndef turkce_esit(a, b):\n    return _anahtar(a) == _anahtar(b)\n',
    tests='assert turkce_esit("İSTANBUL", "istanbul"), "İSTANBUL = istanbul"\nassert turkce_esit("IĞDIR", "ığdır"), "IĞDIR = ığdır"\nassert not turkce_esit("ISPARTA", "isparta"), "Türkçede ISPARTA\'nın küçüğü ısparta\'dır; isparta ile eşit değil"\nassert turkce_esit("  Ayşe   Kaya ", "ayşe kaya"), "Boşluklar normalleşmeli"\nassert turkce_esit("c\\u0327ay", "Çay"), "NFD yazılmış ç ile NFC Ç aynı kabul edilmeli"\nassert not turkce_esit("Öztürk", "Ozturk"), "Aksanlar silinmemeli"\n',
    hints=['Önce iki metni aynı "anahtar" biçimine getiren yardımcı fonksiyon yaz, sonra anahtarları karşılaştır.', '" ".join(s.split()) hem kırpar hem ardışık boşlukları teke indirir.', 'NFC normalleştirmeyi küçültmeden önce yap.'],
    why='Karşılaştırmadan önce her iki tarafı aynı kanonik biçime çevirmek (normalize → boşluk → küçült) eşleştirme işlerinin temel kalıbıdır. Python\'un lower() ya da casefold() fonksiyonu Türkçe I/İ için yanlış sonuç vereceğinden kendi eşlemen gerekir.'),
  dict(t='code', id='unicode-metin-8', stage='Kendin yaz', diff=2,
    q='<p>SMS sağlayıcısı mesaj başına <b>bayt</b> sınırı koyuyor. <code>utf8_kirp(metin, max_bayt)</code> fonksiyonu, metnin UTF-8 kodlaması <code>max_bayt</code>\'ı aşmayacak en uzun <b>baş kısmını</b> str olarak döndürsün. Karakter asla ortadan bölünmemeli (yarım bayt dizisi kalmamalı).</p>',
    start='def utf8_kirp(metin, max_bayt):\n    pass\n',
    sol='def utf8_kirp(metin, max_bayt):\n    toplam = 0\n    sonuc = []\n    for h in metin:\n        n = len(h.encode("utf-8"))\n        if toplam + n > max_bayt:\n            break\n        sonuc.append(h)\n        toplam += n\n    return "".join(sonuc)\n',
    tests='assert utf8_kirp("Merhaba", 4) == "Merh", "ASCII\'de bayt = karakter"\nassert utf8_kirp("şşş", 5) == "şş", "Her ş 2 bayt; 5 bayta 2 tane sığar, 3. yarım kalmamalı"\nassert utf8_kirp("a₺b", 3) == "a", "₺ 3 bayt; a(1) + ₺(3) = 4 > 3"\nassert utf8_kirp("İzmir", 100) == "İzmir", "Sınır yeterliyse metin aynen döner"\nassert utf8_kirp("çay", 0) == "", "0 baytta boş metin"\nfor n in range(0, 12):\n    assert len(utf8_kirp("Çağrı ₺ 😀", n).encode("utf-8")) <= n, f"{n} bayt sınırı aşılmamalı"\n',
    hints=['Her karakterin bayt sayısı farklı: len(h.encode("utf-8")).', 'Karakter karakter ilerle; eklemeden önce toplam + n > max_bayt mı diye kontrol et.', 'Alternatif tek satır: metin.encode()[:max_bayt].decode("utf-8", errors="ignore")'],
    why='Bayt sınırı olan alanlarda karakter sayısı yanıltıcıdır. Karakter karakter ilerleyip bayt toplamını izlemek kırpmanın her zaman geçerli UTF-8 üretmesini garanti eder. errors="ignore" ile yarım kalan son diziyi atmak da aynı sonucu veren kısa bir yoldur.'),
]
ex += [
  dict(t='code', id='unicode-metin-9', stage='Hata avı', kind='bug', diff=1,
    q='<p><b>Hatayı bul ve düzelt.</b> SMS ağ geçidinden gelen baytları çözen <code>sms_bilgi(veri)</code> fonksiyonu <code>(metin, karakter_sayisi)</code> döndürmeli. Türkçe karakterli mesajlarda çöküyor ve karakter sayısı da yanlış hesaplanıyor. Veri UTF-8 kodlu geliyor.</p>',
    start='def sms_bilgi(veri):\n    metin = veri.decode("ascii")\n    return metin, len(veri)\n',
    sol='def sms_bilgi(veri):\n    metin = veri.decode("utf-8")\n    return metin, len(metin)\n',
    tests='assert sms_bilgi("Kargonuz yolda".encode("utf-8")) == ("Kargonuz yolda", 14), "ASCII mesaj"\nassert sms_bilgi("Şifreniz: 4821".encode("utf-8")) == ("Şifreniz: 4821", 14), "Ş 2 bayttır ama 1 karakterdir: 14 karakter"\nassert sms_bilgi("İyi günler ₺".encode("utf-8"))[1] == 12, "Karakter sayısı baytlardan değil metinden hesaplanmalı"\n',
    hints=['ASCII yalnızca 128 karakteri bilir; ş, İ, ₺ yoktur.', 'len(veri) bayt sayısıdır; karakter sayısı için çözülmüş metnin uzunluğunu al.', 'veri.decode("utf-8") ve len(metin)'],
    why='Veriyi yazıldığı kodlamayla çözmek gerekir: ascii Türkçe baytlarda UnicodeDecodeError verir. len(bytes) bayt, len(str) karakter sayar; UTF-8\'de bunlar ancak saf ASCII metinde eşittir.'),
  dict(t='code', id='unicode-metin-10', stage='Hata avı', kind='bug', diff=2,
    q='<p><b>Hatayı bul ve düzelt.</b> <code>urun_ara(urunler, sorgu)</code> ürün adlarında büyük/küçük harf duyarsız arama yapıp eşleşenleri liste sırasıyla döndürmeli. Kullanıcı "izmir" yazınca "İZMİR KÖFTE" bulunmuyor, "ISPARTA" yazınca "Isparta Gülü" de bulunmuyor. Türkçe kurallarıyla düzelt.</p>',
    start='def urun_ara(urunler, sorgu):\n    s = sorgu.lower()\n    return [u for u in urunler if s in u.lower()]\n',
    sol='def tr_lower(metin):\n    return metin.replace("İ", "i").replace("I", "ı").lower()\n\ndef urun_ara(urunler, sorgu):\n    s = tr_lower(sorgu)\n    return [u for u in urunler if s in tr_lower(u)]\n',
    tests='urunler = ["İZMİR KÖFTE", "Isparta Gülü", "Iğdır Kayısısı", "izmir boyozu", "Çay"]\nassert urun_ara(urunler, "izmir") == ["İZMİR KÖFTE", "izmir boyozu"], "izmir iki ürünü bulmalı: İ\'nin küçüğü i"\nassert urun_ara(urunler, "ISPARTA") == ["Isparta Gülü"], "ISPARTA → ısparta, Isparta → ısparta"\nassert urun_ara(urunler, "ığdır") == ["Iğdır Kayısısı"], "ı ile arama I içeren ürünü bulmalı"\nassert urun_ara(urunler, "ÇAY") == ["Çay"], "Ç normal kuralla da doğru küçülür"\n',
    hints=['"İ".lower() i + birleşik nokta verir; "I".lower() ise ı değil i verir.', 'Sorguyu VE ürün adını aynı Türkçe küçültme fonksiyonundan geçir.', 'tr_lower = replace("İ", "i").replace("I", "ı").lower()'],
    why='Arama karşılaştırmasında iki taraf aynı kurala göre küçültülmeli. Python\'un lower() metodu Türkçe I/İ için dilden bağımsız sonuç ürettiği için eşleşmeler kaçar; tek bir tr_lower yardımcısı iki sorunu birden çözer.'),
]
ex += [
  dict(t='code', id='unicode-metin-11', stage='Meydan okuma', diff=3,
    q='<p>Müşteri yorumlarında en sık geçen kelimeleri raporla. <code>kelime_frekansi(metin, n)</code>:</p><ul><li>Metni NFC normalleştir, Türkçe kurallarıyla küçült (İ→i, I→ı).</li><li>Kelime = ardışık <b>harflerden</b> (<code>str.isalpha()</code>) oluşan dizi; diğer her karakter ayırıcıdır (kesme işareti dahil: "Market\'in" → "market", "in").</li><li>2 harften kısa kelimeleri sayma.</li><li>En sık <code>n</code> kelimeyi <code>(kelime, sayı)</code> listesi olarak döndür: sayıya göre azalan, eşitlikte <b>Türk alfabesi</b> sırasıyla (alfabe: <code>"abcçdefgğhıijklmnoöpqrsştuüvwxyz"</code>).</li></ul>',
    start='def kelime_frekansi(metin, n):\n    pass\n',
    sol='import unicodedata\n\nALFABE = "abcçdefgğhıijklmnoöpqrsştuüvwxyz"\nSIRA = {h: i for i, h in enumerate(ALFABE)}\n\ndef _tr_lower(s):\n    return s.replace("İ", "i").replace("I", "ı").lower()\n\ndef _tr_anahtar(k):\n    return [SIRA.get(h, 100 + ord(h)) for h in k]\n\ndef kelime_frekansi(metin, n):\n    metin = _tr_lower(unicodedata.normalize("NFC", metin))\n    sayac = {}\n    kelime = ""\n    for h in metin + " ":\n        if h.isalpha():\n            kelime += h\n        else:\n            if len(kelime) >= 2:\n                sayac[kelime] = sayac.get(kelime, 0) + 1\n            kelime = ""\n    sirali = sorted(sayac.items(), key=lambda kv: (-kv[1], _tr_anahtar(kv[0])))\n    return sirali[:n]\n',
    tests='yorum = "Çay çok güzel! ÇAY taze, kargo hızlı. Iğdır kayısısı güzel; İZMİR\'e kargo hızlı geldi. Çok çok iyi."\nr = kelime_frekansi(yorum, 4)\nassert r == [("çok", 3), ("çay", 2), ("güzel", 2), ("hızlı", 2)], "Sayıya göre azalan, eşitlikte Türk alfabesi: çay < güzel < hızlı < kargo; geldi: " + repr(r)\nassert ("kargo", 2) in kelime_frekansi(yorum, 10), "kargo 2 kez geçiyor"\nassert ("ığdır", 1) in kelime_frekansi(yorum, 20), "IĞDIR → ığdır (Türkçe küçültme)"\nassert ("izmir", 1) in kelime_frekansi(yorum, 20), "İZMİR\'e → izmir ve e; e tek harf olduğu için sayılmaz"\nassert all(len(k) >= 2 for k, _ in kelime_frekansi(yorum, 50)), "Tek harfli kelimeler sayılmamalı"\nassert kelime_frekansi("c\\u0327ay C\\u0327AY çay", 1) == [("çay", 3)], "NFD yazılmış ç de aynı kelime sayılmalı"\nassert kelime_frekansi("", 3) == [], "Boş metin boş liste"\n',
    hints=['Önce normalleştir ve Türkçe küçült; sonra karakter karakter gezerek harf dizilerini topla.', 'Metnin sonuna bir boşluk ekleyerek son kelimenin de sayılmasını garanti et.', 'Sıralama anahtarı demet olabilir: key=lambda kv: (-kv[1], tr_anahtar(kv[0]))'],
    why='Gerçek metin işleme hattı: normalleştir → küçült → böl → say → sırala. NFC adımı farklı yazılmış aynı kelimeleri birleştirir; isalpha() Türkçe harfleri de harf sayar. Demet anahtarında -sayı azalan sıralama, ikinci eleman ise eşitlik durumunda Türk alfabesi sırası sağlar.'),
]

faq = [
  dict(q='Python 2\'deki unicode/str karmaşası Python 3\'te var mı?', a='Hayır. Python 3\'te <code>str</code> her zaman Unicode metindir, <code>bytes</code> ise ham baytlardır ve ikisi otomatik karışmaz: <code>"a" + b"b"</code> TypeError verir. Eski kod örneklerinde gördüğün <code>u"..."</code> öneki Python 3\'te zararsızdır ama gereksizdir.'),
  dict(q='Dosyamın hangi kodlamada olduğunu nasıl anlarım?', a='Kesin bir yolu yoktur; baytlar kodlamayı söylemez. Pratikte: önce UTF-8 dene (katı biçimi sayesinde yanlışsa çoğu zaman hata verir), olmazsa kaynağa sor ya da cp1254/ISO-8859-9 dene. <code>charset-normalizer</code> paketi istatistiksel tahmin yapar (kendi bilgisayarında: <code>pip install charset-normalizer</code>).'),
  dict(q='Excel CSV\'mi açınca ilk sütunun adı "\\ufeffad" görünüyor. Neden?', a='Excel "CSV UTF-8" kaydında dosyanın başına BOM (U+FEFF) koyar. <code>open(..., encoding="utf-8-sig")</code> ile açarsan BOM otomatik atılır. Excel\'in Türkçe karakterleri doğru göstermesi için dosya yazarken de <code>utf-8-sig</code> kullanabilirsin.'),
  dict(q='casefold() ile lower() arasındaki fark ne?', a='<code>casefold()</code> büyük/küçük harf duyarsız karşılaştırma için tasarlanmış daha agresif bir dönüşümdür; örneğin Almanca ß\'yi ss yapar. İkisi de Türkçe I/İ kuralını bilmez. Türkçe metin için önce I/İ eşlemesini elle yap, sonra lower ya da casefold uygula.'),
]

mistakes = [
  dict(bad='with open("musteriler.csv") as f:\n    veri = f.read()', good='with open("musteriler.csv", encoding="utf-8") as f:\n    veri = f.read()', why='Kodlama belirtilmezse işletim sisteminin varsayılanı kullanılır; Türkçe Windows\'ta cp1254 olabilir ve Türkçe karakterler bozulur.'),
  dict(bad='if sorgu.lower() in urun.lower():', good='def tr_lower(s):\n    return s.replace("İ", "i").replace("I", "ı").lower()\nif tr_lower(sorgu) in tr_lower(urun):', why='lower() Türkçe I/İ kuralını bilmez: "I" → "i", "İ" → "i̇" (2 karakter) olur ve arama eşleşmeleri kaçar.'),
  dict(bad='yol = "C:\\yeni\\tablo.csv"', good='yol = r"C:\\yeni\\tablo.csv"\n# ya da: Path("C:/yeni/tablo.csv")', why='Normal metinde \\t sekmeye dönüşür; Windows yollarında ham dize ya da pathlib kullan.'),
  dict(bad='sehirler.sort()   # Çorum en sona düşer', good='sehirler.sort(key=tr_anahtar)', why='Varsayılan sıralama kod noktasına göredir; Türkçe harfler İngilizce harflerin tamamından sonra gelir.'),
  dict(bad='metin = veri.decode("utf-8", errors="ignore")   # her ihtimale karşı', good='metin = veri.decode("utf-8")   # hata verirse kaynağın kodlamasını öğren', why='errors="ignore" hatayı gizler ve veriyi sessizce kaybeder; önce doğru kodlamayı bul.'),
]

L = dict(id='unicode-metin', lv='temel', mod='Veri Türleri', min=40,
  title='Karakterler, Unicode ve Türkçe',
  sum='ASCII, Unicode ve UTF-8 farkı, kod noktası ve ord/chr, kaçış dizileri ve ham dize, bytes ile encode/decode, encoding="utf-8", Türkçe I/İ tuzakları, Türk alfabesine göre sıralama ve unicodedata ile normalleştirmeyi öğrenirsin.',
  goals=['ASCII, Unicode ve UTF-8 arasındaki farkı açıklar, bir karakterin kod noktasını ve bayt sayısını bulabilirim.',
         'Kaçış dizilerini ve ham dizeleri doğru kullanır, Windows yolu tuzağından kaçınırım.',
         'str ile bytes arasında encode/decode yapar, UnicodeDecodeError\'ı doğru kodlamayla çözerim.',
         'Türkçe I/İ/ı/i için doğru büyük-küçük harf dönüşümü ve Türk alfabesine göre sıralama yazabilirim.',
         'unicodedata.normalize ile metinleri karşılaştırma ve arama için normalleştiririm.'],
  body=body, ex=ex, faq=faq, mistakes=mistakes)
emit(L)
