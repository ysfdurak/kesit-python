/* Kesit Python — 'metinler' dersi uzantısı (Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'metinler',
    min: 25,
    html: `<p>Unicode, Türkçe İ/ı sorunu ve kodlamalar <b>Unicode ve metin kodlaması</b> dersinde, biçim belirtimlerinin tamamı <b>String biçimleme</b> dersinde. Bu bölüm, günlük veri işinde en çok kullanılan ama temel derste yer bulamayan metin araçlarını topluyor.</p><h2>Metot haritası</h2><p>str türünün kırktan fazla metodu var. Hepsini ezberlemen gerekmez; ama hangi işin hazır bir metodu olduğunu bilmek seni gereksiz kod yazmaktan kurtarır.</p><div class="tbl-wrap"><table><tr><th>Amaç</th><th>Metotlar</th><th>Not</th></tr><tr><td>Arama</td><td><code>find</code>, <code>rfind</code>, <code>index</code>, <code>count</code>, <code>in</code></td><td>find bulamazsa -1, index ValueError</td></tr><tr><td>Önek / sonek</td><td><code>startswith</code>, <code>endswith</code>, <code>removeprefix</code>, <code>removesuffix</code></td><td>startswith demet de alır</td></tr><tr><td>Bölme</td><td><code>split</code>, <code>rsplit</code>, <code>partition</code>, <code>rpartition</code>, <code>splitlines</code></td><td>maxsplit ile en fazla N kez böl</td></tr><tr><td>Temizleme</td><td><code>strip</code>, <code>lstrip</code>, <code>rstrip</code></td><td>Parametre bir karakter KÜMESİDİR</td></tr><tr><td>Hizalama</td><td><code>ljust</code>, <code>rjust</code>, <code>center</code>, <code>zfill</code></td><td>Sabit genişlikli çıktı</td></tr><tr><td>Harf</td><td><code>lower</code>, <code>upper</code>, <code>title</code>, <code>capitalize</code>, <code>casefold</code></td><td>Karşılaştırma için casefold</td></tr><tr><td>Değiştirme</td><td><code>replace</code>, <code>translate</code> + <code>str.maketrans</code></td><td>replace'in üçüncü parametresi adet</td></tr><tr><td>Denetim</td><td><code>isdigit</code>, <code>isalpha</code>, <code>isalnum</code>, <code>isspace</code></td><td>Boş metinde hepsi False</td></tr></table></div><h2>Bölmenin ince ayarları: maxsplit, rsplit, partition</h2><p>Gerçek veride ayraç, alanın kendi içinde de geçebilir. Bir log satırının mesaj kısmında iki nokta, bir adresin içinde virgül olabilir. Bu yüzden "en fazla kaç kez böleceğini" söylemek önemlidir.</p><pre class="py">log = "2025-03-14 09:41:07 ERROR Ödeme reddedildi: kart limiti yetersiz"
tarih, saat, seviye, mesaj = log.split(" ", 3)     # en fazla 3 kez böl
print(seviye, "|", mesaj)

dosya = "rapor.2025.mart.csv"
ad, uzanti = dosya.rsplit(".", 1)                   # sağdan bir kez böl
print(ad, "-&gt;", uzanti)

anahtar, ayrac, deger = "SUBE=Konak=Merkez".partition("=")
print(anahtar, "|", ayrac, "|", deger)
print("ayraç yok".partition("="))                   # her zaman 3 parça

satirlar = "AM-101\\nAM-102\\r\\nAM-103\\n".splitlines()
print(satirlar)</pre><p><code>partition</code> her zaman üç elemanlı bir demet döndürür: önce, ayraç, sonra. Ayraç yoksa ikinci ve üçüncü eleman boş metindir; bu sayede açma (unpacking) hiç hata vermez. <code>splitlines</code> ise Windows (<code>\\r\\n</code>) ve Unix (<code>\\n</code>) satır sonlarını aynı anda tanır; <code>split("\\n")</code> Windows dosyalarında satır sonlarına <code>\\r</code> bırakır.</p><h2>strip tuzağı ve removeprefix</h2><p><code>strip</code>, <code>lstrip</code> ve <code>rstrip</code> bir parametre alabilir, ama bu parametre bir önek değil <b>karakter kümesidir</b>: "baştan, bu karakterlerden herhangi biri olduğu sürece sil" der. Python 3.9 ile gelen <code>removeprefix</code> / <code>removesuffix</code> ise tam olarak verdiğin metni, yalnızca bir kez siler.</p><pre class="py">kod = "SKU-KS-0042"
print(kod.lstrip("SKU-"))         # S, K, U, - bitene kadar siler: "0042"
print(kod.removeprefix("SKU-"))   # yalnız öneki siler: "KS-0042"
print("rapor_rapor.csv".removesuffix(".csv"))
print("00042".lstrip("0"), "42".zfill(6))
print("***İndirim***".strip("*"))</pre><div class="warn"><b>Sessiz veri kaybı</b><code>lstrip("SKU-")</code> çoğu kodda doğru çalışıyor gibi görünür, ta ki ürün kodu S, K ya da U harfiyle başlayana kadar. Bu tür hatalar testte değil canlıda çıkar. Bir öneki silmek istiyorsan her zaman <code>removeprefix</code> kullan.</div><h2>Hizalama ve dolgu</h2><p>Terminal raporu, sabit genişlikli banka dosyası ya da fiş çıktısı üretirken sütunları hizalaman gerekir. f-string biçimleme bunu yapar, ama metot karşılıkları da bilinmeye değer: <code>ljust</code> sola, <code>rjust</code> sağa, <code>center</code> ortaya yaslar; <code>zfill</code> soluna sıfır ekler.</p><pre class="py">print("ANADOLU MARKET".center(30, "="))
print("Ürün".ljust(18) + "Adet".rjust(5) + "Tutar".rjust(7))
print("Kahve Makinesi".ljust(18) + "1".rjust(5) + "1500".rjust(7))
print("Filtre Kahve".ljust(18) + "3".rjust(5) + "360".rjust(7))
print("-" * 30)
print("Fiş no:", "417".zfill(8))</pre><h2>translate: çok karakteri tek seferde değiştirmek</h2><p>Beş farklı harfi değiştirmek için beş kez <code>replace</code> zincirlemek yerine bir dönüşüm tablosu kurabilirsin. <code>str.maketrans("eski", "yeni")</code> iki eşit uzunlukta metni karakter karakter eşler; üçüncü parametre silinecek karakterleri verir. URL, dosya adı ya da sistem kodu üretirken Türkçe karakterleri ASCII'ye çevirmenin en temiz yoludur.</p><pre class="py">TR_ASCII = str.maketrans("çğıöşüÇĞİÖŞÜ", "cgiosuCGIOSU", "'")
baslik = "Şükrü'nün Ödeme Çizelgesi"
print(baslik.translate(TR_ASCII))
print(baslik.translate(TR_ASCII).lower().replace(" ", "-"))</pre><h2>Metin karşılaştırma ve birkaç küçük ayrıntı</h2><ul><li><b>Sözlük sırası:</b> Metinler karakter karakter, kod numarasına göre karşılaştırılır. Büyük harfler küçüklerden önce gelir (<code>"Z" &lt; "a"</code>) ve rakam olarak yazılmış sayılar metin gibi sıralanır: <code>"10" &lt; "9"</code> True'dur. Sayı karşılaştıracaksan önce çevir.</li><li><b>Demetle önek/sonek:</b> <code>dosya.endswith((".csv", ".xlsx"))</code> birden fazla uzantıyı tek seferde sorar.</li><li><b>replace adedi:</b> <code>"a-b-c".replace("-", "/", 1)</code> yalnızca ilk eşleşmeyi değiştirir.</li><li><b>Bitişik metinler:</b> Yan yana yazılan metin sabitleri birleşir: <code>("Anadolu " "Market")</code>. Uzun metinleri parantez içinde satırlara bölmenin PEP 8 uyumlu yoludur.</li></ul><pre class="py">print("10" &lt; "9", 10 &lt; 9)
print("Zeytin" &lt; "armut", "zeytin" &lt; "armut")
dosya = "ciro_mart.XLSX"
print(dosya.lower().endswith((".csv", ".xlsx")))
print("2025-03-14".replace("-", "/", 1))
mesaj = ("Sayın müşterimiz, siparişiniz "
         "kargoya verilmiştir.")
print(mesaj)</pre><div class="note"><b>Gerçek işte</b>KVKK ve bankacılık düzenlemeleri, kart numarası, IBAN, T.C. kimlik numarası gibi verilerin loglarda ve ekranlarda açık görünmemesini ister. Bu yüzden Ilgaz Bank'ın her uygulamasında bir "maskeleme" fonksiyonu bulunur: kart numarasının yalnız son dört hanesi gösterilir (<code>**** **** **** 9012</code>), IBAN dörder hanelik gruplara ayrılarak okunur hâle getirilir. Bu fonksiyonlar tamamen bu bölümdeki araçlarla, dilimleme, <code>replace</code>, <code>rjust</code> ve <code>join</code> ile yazılır. Maskelemeyi veriyi loga yazmadan <b>önce</b> yapmak gerekir; sonradan log dosyasını temizlemek çok daha zordur.</div>`,
    ex: [
      {
        t: 'mc',
        id: 'metinler-x1',
        stage: 'Isınma',
        q: '<code>"SUBE=Konak".partition("=")</code> ne döndürür?',
        o: ['<code>["SUBE", "Konak"]</code>', '<code>("SUBE", "=", "Konak")</code>', '<code>("SUBE", "Konak")</code>', '<code>"SUBE"</code>'],
        a: 1,
        why: 'partition her zaman üç elemanlı bir demet döndürür: ayraçtan önceki kısım, ayracın kendisi ve sonrası. split ise liste döndürür ve ayracı içermez.'
      },
      {
        t: 'predict',
        id: 'metinler-x2',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'kod = "AM-00417"\nprint(kod.lstrip("AM-0"), kod.removeprefix("AM-"))\n',
        o: ['417 00417', '00417 00417', '417 417', '0417 00417'],
        a: 0,
        why: 'lstrip("AM-0") A, M, - ve 0 karakterlerini, başka bir karakter gelene kadar soldan siler; sıfırlar da gider. removeprefix ise yalnızca "AM-" önekini bir kez siler.'
      },
      {
        t: 'predict',
        id: 'metinler-x3',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'kayit = "2025-03-14 ERROR Ödeme reddedildi: kart limiti"\nseviye, _, mesaj = kayit[11:].partition(" ")\nprint(seviye)\nprint(mesaj.split(":")[0])\n',
        o: ['ERROR\nÖdeme reddedildi', '2025-03-14\nERROR', 'ERROR\nÖdeme reddedildi: kart limiti', ' ERROR\nÖdeme'],
        a: 0,
        why: 'kayit[11:] tarihi ve boşluğu atlar ("ERROR Ödeme..."). partition ilk boşluktan böler: seviye "ERROR", mesaj geri kalanı. split(":")[0] mesajın iki noktadan önceki kısmını verir.'
      },
      {
        t: 'predict',
        id: 'metinler-x4',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        code: 'print("42".zfill(5), "7".rjust(3, "*"), "a,b,c,d".split(",", 2))\n',
        o: ['00042 **7 [\'a\', \'b\', \'c,d\']', '42000 7** [\'a\', \'b\', \'c\', \'d\']', '00042 **7 [\'a\', \'b\', \'c\', \'d\']', '00042 7** [\'a\', \'b\', \'c,d\']'],
        a: 0,
        why: 'zfill soldan sıfırla 5 karaktere tamamlar. rjust sağa yaslar, boşluğu soldan "*" ile doldurur. split(",", 2) en fazla 2 kez böler; geri kalan "c,d" tek parça kalır.'
      },
      {
        t: 'order',
        id: 'metinler-x5',
        stage: 'Kodu oku',
        q: '<p>Kart numarasını maskeleyen satırları sırala: boşluklar silinecek, son dört hane dışındaki tüm haneler yıldız olacak. Çıktı: <code>************9012</code></p>',
        lines: ['kart = "4543 1234 5678 9012"', 'rakamlar = kart.replace(" ", "")', 'son4 = rakamlar[-4:]', 'maskeli = "*" * (len(rakamlar) - 4) + son4', 'print(maskeli)'],
        expect: '************9012\n',
        hint: 'Her satır bir öncekinin ürettiği değişkeni kullanıyor.',
        why: 'Önce boşluklar silinir (16 hane), sonra son dört hane alınır, kalan 12 hane yerine 12 yıldız konur.'
      },
      {
        t: 'code',
        id: 'metinler-x6',
        stage: 'Rehberli',
        diff: 1,
        q: '<p><code>log_ayristir(satir)</code> fonksiyonunu yaz. <code>"2025-03-14 09:41:07 ERROR Ödeme reddedildi: limit"</code> gibi bir log satırından <code>(tarih, seviye, mesaj)</code> demeti döndürsün (saat atılır). Mesajın içinde boşluk ve iki nokta olabilir; satırın sonundaki satır sonu temizlenmeli.</p><p>Beklenen: <code>("2025-03-14", "ERROR", "Ödeme reddedildi: limit")</code></p>',
        guide: ['Satırı strip() ile temizle.', 'split(" ", 3) ile en fazla 3 kez böl: tarih, saat, seviye, mesaj.', 'Dört parçayı dört değişkene aç.', 'Saat hariç üçünü demet olarak döndür.'],
        example: 'adres = "Atatürk Cad. No 5 Konak İzmir"\ncadde, ek, no, geri_kalan = adres.split(" ", 3)\nprint(cadde, "|", geri_kalan)\n',
        start: 'def log_ayristir(satir):\n    # TODO: temizle ve en fazla 3 kez böl\n    parcalar = satir.split()\n    # TODO: (tarih, seviye, mesaj) döndür\n    return parcalar\n',
        sol: 'def log_ayristir(satir):\n    tarih, saat, seviye, mesaj = satir.strip().split(" ", 3)\n    return (tarih, seviye, mesaj)\n',
        tests: 'assert log_ayristir("2025-03-14 09:41:07 ERROR Ödeme reddedildi: limit") == ("2025-03-14", "ERROR", "Ödeme reddedildi: limit"), "Mesaj bölünmeden tek parça kalmalı"\nassert log_ayristir("2025-03-15 10:00:00 INFO Rapor hazır\\n") == ("2025-03-15", "INFO", "Rapor hazır"), "Sondaki satır sonu temizlenmeli"\n',
        hints: ['split\'in ikinci parametresi en fazla kaç kez bölüneceğini söyler.', 'split(" ", 3) dört parça verir.', 'tarih, saat, seviye, mesaj = satir.strip().split(" ", 3)'],
        why: 'maxsplit, sondaki serbest metin alanını korumanın standart yoludur. Parametresiz split mesajı kelimelerine ayırırdı.'
      },
      {
        t: 'code',
        id: 'metinler-x7',
        stage: 'Rehberli',
        diff: 1,
        q: '<p>Yüklenen dosya adlarından rapor başlığı üret. <code>rapor_basligi(dosya)</code> fonksiyonu:</p><ul><li>sondaki <code>.csv</code> uzantısını (harf duyarsız) silsin,</li><li>alt çizgileri boşluğa çevirsin,</li><li>her kelimenin ilk harfini büyütsün (<code>title</code>).</li></ul><p>Örnek: <code>"haziran_satis_ozeti.CSV"</code> → <code>"Haziran Satis Ozeti"</code>. Adın içindeki "csv" kelimesine dokunma: <code>"csv_aktarim.csv"</code> → <code>"Csv Aktarim"</code>.</p>',
        guide: ['Önce lower() ile harfleri küçült (uzantı da küçülür).', 'removesuffix(".csv") yalnızca sondaki uzantıyı siler.', 'replace("_", " ") ile alt çizgileri boşluk yap.', 'title() ile kelimelerin ilk harfini büyüt.'],
        example: 'ad = "Mart_Ciro.XLSX"\nprint(ad.lower().removesuffix(".xlsx").replace("_", " ").title())\n',
        start: 'def rapor_basligi(dosya):\n    # TODO: küçült, uzantıyı sil, alt çizgileri boşluk yap, başlık biçimine çevir\n    return dosya.replace(".csv", "")\n',
        sol: 'def rapor_basligi(dosya):\n    return dosya.lower().removesuffix(".csv").replace("_", " ").title()\n',
        tests: 'assert rapor_basligi("haziran_satis_ozeti.CSV") == "Haziran Satis Ozeti", "Uzantı harf duyarsız silinmeli"\nassert rapor_basligi("csv_aktarim.csv") == "Csv Aktarim", "Yalnızca sondaki .csv silinmeli; addaki csv kalmalı"\nassert rapor_basligi("stok.csv.csv") == "Stok.Csv", "removesuffix yalnızca bir kez siler"\n',
        hints: ['replace(".csv", "") her yerdeki eşleşmeyi siler; sonek için başka bir metot var.', 'removesuffix Python 3.9 ile geldi.', 'Zincir: lower → removesuffix → replace → title'],
        why: 'removesuffix yalnızca metnin sonundaki eşleşmeyi, bir kez siler; replace ise her yerde değiştirir, rstrip(".csv") de karakter kümesi gibi davranır ("stok.csv" → "stok" ama "docs.csv" → "do"). Uzantıyı harf duyarsız silmek için önce lower uygulanır.'
      },
      {
        t: 'code',
        id: 'metinler-x8',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Müşteri ekranında IBAN okunur biçimde gösterilmeli. <code>iban_bicimle(iban)</code> fonksiyonu boşlukları silsin, harfleri büyütsün ve dörder karakterlik gruplar hâlinde, aralarına boşluk koyarak döndürsün.</p><p><code>" tr33 0006 1005197864578413 26"</code> → <code>"TR33 0006 1005 1978 6457 8413 26"</code></p>',
        guide: [
          'replace(" ", "") ile tüm boşlukları sil, upper() ile büyüt.',
          'textwrap modülünün wrap(metin, 4) fonksiyonu metni 4 karakterlik parçalardan oluşan bir listeye böler.',
          '" ".join(...) ile parçaları boşlukla birleştir.'
        ],
        example: 'import textwrap\nkod = "ABCDEFGHIJ"\nparcalar = textwrap.wrap(kod, 3)\nprint(parcalar)\nprint("-".join(parcalar))\n',
        start: 'import textwrap\n\n\ndef iban_bicimle(iban):\n    # TODO: boşlukları sil ve büyük harfe çevir\n    temiz = iban\n    # TODO: 4\'lü gruplara böl ve boşlukla birleştir\n    return temiz\n',
        sol: 'import textwrap\n\n\ndef iban_bicimle(iban):\n    temiz = iban.replace(" ", "").upper()\n    return " ".join(textwrap.wrap(temiz, 4))\n',
        tests: 'assert iban_bicimle(" tr33 0006 1005197864578413 26") == "TR33 0006 1005 1978 6457 8413 26", "Boşluklar silinip 4\'lü gruplar oluşmalı"\nassert iban_bicimle("TR330006100519786457841326") == "TR33 0006 1005 1978 6457 8413 26", "Bitişik IBAN da gruplanmalı"\nassert iban_bicimle("DE89370400440532013000") == "DE89 3704 0044 0532 0130 00", "Farklı uzunlukta IBAN"\n',
        hints: ['Temizlik: iban.replace(" ", "").upper()', 'textwrap.wrap(temiz, 4) bir liste döndürür.', 'return " ".join(textwrap.wrap(temiz, 4))'],
        why: 'Önce normalize et (boşluk sil, büyüt), sonra biçimlendir: veri temizliğinin genel sırası budur. textwrap.wrap metni sabit genişlikli parçalara böler; join de bunları istediğin ayraçla birleştirir.'
      },
      {
        t: 'code',
        id: 'metinler-x9',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p><code>tckn_bicim_gecerli(no)</code> fonksiyonunu yaz. Bir T.C. kimlik numarasının <b>biçim</b> olarak geçerli olup olmadığını döndürsün (algoritma kontrolü gerekmez): baştaki/sondaki boşluklar temizlendikten sonra tam 11 karakter olmalı, hepsi rakam olmalı ve <code>0</code> ile başlamamalı.</p>',
        sol: 'def tckn_bicim_gecerli(no):\n    s = no.strip()\n    return len(s) == 11 and s.isdigit() and not s.startswith("0")\n',
        tests: 'assert tckn_bicim_gecerli("10000000146") is True, "11 rakamlı, 0 ile başlamayan numara geçerli biçimdedir"\nassert tckn_bicim_gecerli(" 10000000146 ") is True, "Boşluklar temizlenmeli"\nassert tckn_bicim_gecerli("01234567890") is False, "0 ile başlayamaz"\nassert tckn_bicim_gecerli("1234567890") is False, "10 hane eksik"\nassert tckn_bicim_gecerli("1234567890a") is False, "Harf içeremez"\nassert tckn_bicim_gecerli("") is False, "Boş metin geçersiz"\n',
        hints: ['Üç koşulu and ile bağla: uzunluk, isdigit, startswith.', 'Önce strip() uygula; sonra len(s) == 11 and s.isdigit() and not s.startswith("0")'],
        why: 'Biçim doğrulaması ucuz kontrolleri birleştirir. isdigit boş metinde False döndürdüğü için ayrıca boşluk kontrolüne gerek kalmaz; yine de uzunluk kontrolü bunu zaten yakalar.'
      },
      {
        t: 'code',
        id: 'metinler-x10',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Ürün kodlarından <code>"SKU-"</code> önekini silen fonksiyon bazı ürünlerde kodun bir kısmını da siliyor: <code>"SKU-KS01"</code> için <code>"KS01"</code> yerine <code>"01"</code> dönüyor. <b>Hatayı bul ve düzelt.</b></p>',
        start: 'def urun_kodu(kod):\n    return kod.strip().lstrip("SKU-")\n',
        sol: 'def urun_kodu(kod):\n    return kod.strip().removeprefix("SKU-")\n',
        tests: 'assert urun_kodu("SKU-KS01") == "KS01", "Yalnızca SKU- öneki silinmeli; K ve S harfleri kalmalı"\nassert urun_kodu(" SKU-A100 ") == "A100", "Boşluklar temizlenmeli"\nassert urun_kodu("SKU-USB-3") == "USB-3", "U, S, B ile başlayan kodlar bozulmamalı"\nassert urun_kodu("KS02") == "KS02", "Önek yoksa kod değişmemeli"\n',
        hints: [
          'lstrip\'in parametresi bir önek mi, bir karakter kümesi mi?',
          'lstrip("SKU-") S, K, U ve - karakterlerinden herhangi birini, başka bir karakter gelene kadar siler.',
          'Öneki tam olarak bir kez silen metot: removeprefix.'
        ],
        why: 'lstrip/rstrip/strip bir karakter kümesi alır. "SKU-KS01" için S, K, U, -, K, S hepsi kümede olduğundan silinir ve "01" kalır. removeprefix tam metni yalnızca başta ve bir kez siler.'
      },
      {
        t: 'code',
        id: 'metinler-x11',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 1,
        q: '<p>Şehir adlarını normalize eden fonksiyon hiçbir şey değiştirmiyor gibi: <code>"  izmir "</code> için <code>"Izmir"</code> beklenirken olduğu gibi dönüyor. <b>Hatayı bul ve düzelt.</b> (Türkçe İ konusunu Unicode dersinde çözeceksin; burada <code>title()</code> yeterli.)</p>',
        start: 'def sehir_normalize(sehir):\n    sehir.strip()\n    sehir.title()\n    return sehir\n',
        sol: 'def sehir_normalize(sehir):\n    sehir = sehir.strip()\n    sehir = sehir.title()\n    return sehir\n',
        tests: 'assert sehir_normalize("  izmir ") == "Izmir", "Boşluk silinip ilk harf büyümeli"\nassert sehir_normalize("ANKARA") == "Ankara", "Büyük harfli ad düzeltilmeli"\nassert sehir_normalize("bursa") == "Bursa", "Küçük harfli ad düzeltilmeli"\n',
        hints: ['Metinler değiştirilemez; metotlar yeni bir metin döndürür.', 'Dönen sonucu bir yere atıyor musun?', 'sehir = sehir.strip() gibi yeniden ata ya da zincirle: return sehir.strip().title()'],
        why: 'strip() ve title() orijinal metni değiştirmez, yeni metin döndürür. Sonuç atanmadığı için kaybolur. Ya her adımda yeniden ata ya da metotları zincirleyip sonucu döndür.'
      },
      {
        t: 'code',
        id: 'metinler-x12',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Anadolu Market kampanya sayfaları için başlıktan URL kısaltması (slug) üreten <code>slug_olustur(baslik)</code> fonksiyonunu yaz:</p><ul><li>Kesme işaretleri (<code>\'</code>) tamamen silinsin.</li><li>Türkçe harfler ASCII karşılıklarına çevrilsin (ç→c, ğ→g, ı→i, ö→o, ş→s, ü→u, İ→i dahil büyükleri).</li><li>Tamamı küçük harf olsun.</li><li>Harf ve rakam dışındaki her karakter ayraç sayılsın; kelimeler tek tire ile birleşsin, baş ve sonda tire olmasın.</li></ul><p><code>"İzmir\'de Yaz İndirimi %50!"</code> → <code>"izmirde-yaz-indirimi-50"</code></p>',
        sol: 'import string\n\nTR = str.maketrans("çğıöşüÇĞİÖŞÜ", "cgiosuCGIOSU", "\'")\nNOKTALAMA = str.maketrans(string.punctuation, " " * len(string.punctuation))\n\n\ndef slug_olustur(baslik):\n    s = baslik.translate(TR).lower()\n    s = s.translate(NOKTALAMA)\n    return "-".join(s.split())\n',
        tests: 'assert slug_olustur("İzmir\'de Yaz İndirimi %50!") == "izmirde-yaz-indirimi-50", "Kesme silinmeli, Türkçe harfler ve noktalama dönüştürülmeli"\nassert slug_olustur("  Çay & Kahve -- Şölen  ") == "cay-kahve-solen", "Art arda ayraçlar tek tireye inmeli"\nassert slug_olustur("ÖĞRENCİ İNDİRİMİ") == "ogrenci-indirimi", "Büyük Türkçe harfler doğru çevrilmeli (İ → i)"\nassert slug_olustur("Yeni Sezon 2025") == "yeni-sezon-2025", "Rakamlar korunmalı"\n',
        hints: [
          'Türkçe harfleri lower()\'dan ÖNCE çevir; "İ".lower() iki karakterlik bir sonuç üretir.',
          'str.maketrans(string.punctuation, " " * len(string.punctuation)) tüm noktalamayı boşluğa çevirir.',
          'Son adım: "-".join(s.split()) fazla boşlukları da yok eder.'
        ],
        why: 'translate birden çok karakter dönüşümünü tek geçişte yapar. Türkçe harfleri lower\'dan önce çevirmek "İ" sorununu baştan engeller. split() + join kalıbı art arda gelen ayraçları ve baştaki/sondaki boşlukları kendiliğinden temizler.'
      }
    ],
    faq: [
      {
        q: 'split() ile split(" ") arasında fark var mı?',
        a: 'Evet. Parametresiz split() her türlü boşluk dizisini (birden fazla boşluk, sekme, satır sonu) tek ayraç sayar ve baştaki/sondaki boşlukları yok sayar. split(" ") ise her tek boşlukta böler; "a  b".split(" ") sonucu [\'a\', \'\', \'b\'] olur. Kullanıcı girdisi ve dağınık metinde parametresiz split, sabit biçimli veride açık ayraç kullan.'
      },
      {
        q: 'Metinleri karşılaştırırken lower mı, casefold mu?',
        a: 'Yalnızca karşılaştırma yapacaksan casefold daha kapsamlıdır (Almanca ß gibi özel durumları da ele alır). Ekranda gösterilecek metin için lower/upper/title kullanılır. Türkçe I/İ için ikisi de yetmez; Unicode dersindeki çözüme bak.'
      }
    ],
    mistakes: [
      {
        bad: 'kod = "SKU-KS01".lstrip("SKU-")   # "01"',
        good: 'kod = "SKU-KS01".removeprefix("SKU-")   # "KS01"',
        why: 'strip ailesi bir karakter kümesi alır ve kümedeki karakterler bitene kadar siler. Belirli bir öneki ya da soneki silmek için removeprefix/removesuffix kullan.'
      },
      {
        bad: 'satirlar = icerik.split("\\n")',
        good: 'satirlar = icerik.splitlines()',
        why: 'Windows\'ta oluşturulmuş dosyalarda satır sonu \\r\\n\'dir; split("\\n") her satırın sonunda görünmez bir \\r bırakır ve karşılaştırmalar başarısız olur. splitlines tüm satır sonu türlerini tanır.'
      }
    ]
  }
);
})(window);
