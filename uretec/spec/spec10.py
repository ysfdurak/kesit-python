START = 201
TASKS = [
dict(topic='Özyineleme', diff=3, kind='yaz',
  title='Özyinelemeli ikili arama',
  q='<p>Ilgaz Bank müşteri numaraları <b>sıralı</b> bir listede. <code>ikili_ara(liste, hedef, bas=0, son=None)</code> fonksiyonunu <b>özyinelemeli</b> yaz: hedef listedeyse indeksini, yoksa <code>-1</code> döndürsün. Her adımda aralığın ortasındaki elemana bak ve aramayı sol ya da sağ yarıyla sınırla. Liste dilimleme (<code>liste[a:b]</code>) kullanma; <code>bas</code>/<code>son</code> indeksleriyle çalış (dilimleme her adımda kopya üretir).</p>',
  start=r'''
def ikili_ara(liste, hedef, bas=0, son=None):
    # buraya yaz
    pass
''',
  sol=r'''
def ikili_ara(liste, hedef, bas=0, son=None):
    if son is None:
        son = len(liste) - 1
    if bas > son:
        return -1
    orta = (bas + son) // 2
    if liste[orta] == hedef:
        return orta
    if liste[orta] < hedef:
        return ikili_ara(liste, hedef, orta + 1, son)
    return ikili_ara(liste, hedef, bas, orta - 1)
''',
  tests=r'''
L = [102, 115, 230, 341, 456, 578, 690, 777]
assert ikili_ara(L, 456) == 4, "456 dördüncü indekste"
assert ikili_ara(L, 102) == 0, "İlk eleman: 0"
assert ikili_ara(L, 777) == 7, "Son eleman: 7"
assert ikili_ara(L, 500) == -1, "Olmayan değer: -1"
assert ikili_ara([], 5) == -1, "Boş liste: -1"
assert __source__.count("ikili_ara(") >= 2, "Fonksiyon kendini çağırmalı (özyineleme)"
''',
  hints=['Temel durum: bas > son ise aralık boşalmıştır, -1 döndür. son None gelirse len(liste) - 1 yap.', 'orta = (bas + son) // 2; hedef büyükse aramayı orta + 1 .. son aralığında, küçükse bas .. orta - 1 aralığında sürdür. Özyinelemeli çağrının sonucunu return etmeyi unutma.'],
  why='Her çağrı arama aralığını yarıya indirdiği için en fazla log2(n) adım gerekir: 1 milyon kayıtta ~20 karşılaştırma. Dilimleme yerine indeks taşımak her adımda liste kopyalamayı önler. Özyinelemeli çağrının sonucunu return etmezsen fonksiyon None döndürür — çok yaygın bir hata. Gerçek projede hazır bisect modülü kullanılır: i = bisect.bisect_left(liste, hedef) ve ardından liste[i] == hedef kontrolü.',
  tags=['özyineleme', 'ikili arama', 'algoritma'], min=9),

dict(topic='Özyineleme', diff=2, kind='bug',
  title='Alt klasörlerin sayfaları kayboluyor',
  q='<p>Kodda bir hata var, bul ve düzelt. Belediye arşivindeki belge klasörleri iç içe: her klasörde <code>"sayfa"</code> (o klasördeki sayfa sayısı) ve <code>"alt"</code> (alt klasörler listesi) var. <code>sayfa_say(klasor)</code> tüm alt klasörler dahil toplam sayfa sayısını döndürmeli; ama yalnızca en üst klasörün sayfalarını sayıyor.</p>',
  start=r'''
def sayfa_say(klasor):
    toplam = klasor["sayfa"]
    for alt in klasor["alt"]:
        sayfa_say(alt)
    return toplam
''',
  sol=r'''
def sayfa_say(klasor):
    toplam = klasor["sayfa"]
    for alt in klasor["alt"]:
        toplam += sayfa_say(alt)
    return toplam
''',
  tests=r'''
arsiv = {"sayfa": 10, "alt": [{"sayfa": 5, "alt": []}, {"sayfa": 2, "alt": [{"sayfa": 8, "alt": []}]}]}
assert sayfa_say(arsiv) == 25, "10 + 5 + 2 + 8 = 25 sayfa"
assert sayfa_say({"sayfa": 3, "alt": []}) == 3, "Alt klasörü olmayan klasör: kendi sayfası"
''',
  hints=['Özyinelemeli çağrı bir değer döndürüyor; o değer nereye gidiyor?', 'Dönen değeri toplama ekle.'],
  why='Özyinelemeli çağrı doğru sonucu hesaplar ama dönüş değeri hiçbir yere atanmadığı için kaybolur. toplam += sayfa_say(alt) ile her alt ağacın toplamı üst seviyeye taşınır. "Sonucu kullanılmayan özyinelemeli çağrı" hata ayıklarken ilk bakılacak yerdir; fonksiyon bir şey döndürüyorsa çağrının solunda bir atama ya da return olmalıdır.',
  tags=['özyineleme', 'dönüş değeri', 'ağaç', 'belediye'], min=3),

dict(topic='Özyineleme', diff=2, kind='tamamla',
  title='İç içe listeyi düzleştir',
  q='<p>Kategori ağacından gelen ürün kodları her derinlikte iç içe listelerde. <code>duzlestir(veri)</code> özyinelemeli fonksiyonu bunları tek düz listeye çevirmeli (sıra korunarak). Boşlukları (<code>___</code>) doldur.</p>',
  start=r'''
def duzlestir(veri):
    sonuc = []
    for x in veri:
        if isinstance(x, ___):
            sonuc.extend(___)
        else:
            sonuc.append(x)
    return sonuc
''',
  sol=r'''
def duzlestir(veri):
    sonuc = []
    for x in veri:
        if isinstance(x, list):
            sonuc.extend(duzlestir(x))
        else:
            sonuc.append(x)
    return sonuc
''',
  tests=r'''
assert duzlestir(["A1", ["B1", ["C1", "C2"]], "A2"]) == ["A1", "B1", "C1", "C2", "A2"], "Her derinlikteki kodlar sırayla düz listede olmalı"
assert duzlestir([[[]]]) == [], "Yalnızca boş listeler: boş sonuç"
assert duzlestir([1, 2]) == [1, 2], "Zaten düz liste aynı kalmalı"
''',
  hints=['Eleman bir liste mi? Hangi türle kontrol edersin?', 'Alt listeyi düzleştirmek için aynı fonksiyonu çağır ve sonucunu extend ile ekle.'],
  why='Eleman listeyse aynı fonksiyon onu düzleştirir ve extend ile elemanları tek tek eklenir; değilse yaprak elemandır ve append edilir. append(duzlestir(x)) yazsaydın iç içelik geri gelirdi. Temel durum burada açıkça yazılmaz: liste olmayan elemanlar özyinelemeyi durdurur. Dikkat: metinler de dolaşılabilir olduğundan isinstance(x, list) yerine "dolaşılabilir mi" kontrolü yapmak "abc" → "a", "b", "c" hatasına yol açar.',
  tags=['özyineleme', 'extend', 'isinstance'], min=3),

# ---------------- Dosya ve Hata ----------------
dict(topic='Dosya ve Hata', diff=2, t='predict',
  title='try / except / else / finally sırası',
  q='<p>Bu kod ne yazdırır?</p>',
  code=r'''
def dene(x):
    try:
        sonuc = 10 / x
    except ZeroDivisionError:
        print("sıfır")
        return -1
    else:
        print("tamam")
        return sonuc
    finally:
        print("son")

print(dene(0))
print(dene(5))
''',
  o=['sıfır\n-1\nson\ntamam\n2.0\nson', 'sıfır\nson\n-1\ntamam\nson\n2.0', 'sıfır\n-1\ntamam\n2.0', 'sıfır\nson\n-1\ntamam\n2.0'], a=1,
  hints=['finally, return olsa bile fonksiyon çıkmadan önce çalışır.', 'print(dene(0)) önce fonksiyonun içindekileri yazdırır, sonra dönen değeri.'],
  why='dene(0): bölme hata verir, except çalışır ("sıfır"), return -1 hazırlanır ama fonksiyon çıkmadan finally çalışır ("son"); sonra dışarıdaki print -1 yazar. dene(5): hata olmadığı için else çalışır ("tamam"), yine çıkmadan önce finally ("son"), ardından 2.0. finally kaynak kapatma (dosya, bağlantı) için idealdir çünkü hata da olsa return da olsa çalışır.',
  tags=['try', 'except', 'else', 'finally'], min=3),

dict(topic='Dosya ve Hata', diff=2, kind='rehberli',
  title='Log dosyası özeti',
  q='<p>Anadolu Market sunucusu günlük dosyası tutuyor; her satır <code>"SEVİYE mesaj"</code> biçiminde, seviye <code>INFO</code>, <code>WARN</code> ya da <code>ERROR</code>. <code>log_ozet(dosya_adi)</code> fonksiyonunu yaz: dosyayı okuyup her seviyeden kaç satır olduğunu sözlük olarak döndürsün: <code>{"INFO": 3, "WARN": 1, "ERROR": 2}</code>. Boş satırları atla; üç seviye sonuçta her zaman bulunsun (yoksa 0). Test dosyayı senin için önceden yazıyor.</p>',
  guide=['Sonuç sözlüğünü üç seviye 0 olacak şekilde başlat.', 'with open(dosya_adi, encoding="utf-8") as f: ile dosyayı aç.', 'Her satırı strip() et; boşsa continue.', 'İlk kelimeyi split()[0] ile al; sözlükte varsa 1 artır.'],
  example=r'''
# Benzer teknik: dosyaya yaz, sonra satır satır oku
with open("ornek.txt", "w", encoding="utf-8") as f:
    f.write("elma 3\narmut 5\n\nelma 2\n")
say = {}
with open("ornek.txt", encoding="utf-8") as f:
    for satir in f:
        satir = satir.strip()
        if not satir:
            continue
        meyve = satir.split()[0]
        say[meyve] = say.get(meyve, 0) + 1
print(say)
''',
  start=r'''
def log_ozet(dosya_adi):
    ozet = {"INFO": 0, "WARN": 0, "ERROR": 0}
    # TODO: dosyayı with ile aç
    # TODO: boş satırları atla, ilk kelimeye göre say
    return ozet
''',
  sol=r'''
def log_ozet(dosya_adi):
    ozet = {"INFO": 0, "WARN": 0, "ERROR": 0}
    with open(dosya_adi, encoding="utf-8") as f:
        for satir in f:
            satir = satir.strip()
            if not satir:
                continue
            seviye = satir.split()[0]
            if seviye in ozet:
                ozet[seviye] += 1
    return ozet
''',
  tests=r'''
with open("sunucu.log", "w", encoding="utf-8") as f:
    f.write("INFO açılış\nERROR veritabanı yanıt vermedi\nINFO sipariş 501\n\nWARN disk %85\nERROR ödeme zaman aşımı\nINFO kapanış\n")
assert log_ozet("sunucu.log") == {"INFO": 3, "WARN": 1, "ERROR": 2}, "3 INFO, 1 WARN, 2 ERROR olmalı; boş satır atlanmalı"
with open("bos.log", "w", encoding="utf-8") as f:
    f.write("")
assert log_ozet("bos.log") == {"INFO": 0, "WARN": 0, "ERROR": 0}, "Boş dosyada tüm seviyeler 0"
''',
  hints=['Dosya nesnesi üzerinde for ile dolaşmak satır satır okur (sonundaki \\n dahil).', 'Boş satırda split()[0] IndexError verir; önce if not satir: continue.', 'seviye = satir.split()[0]; if seviye in ozet: ozet[seviye] += 1'],
  why='with bloğu dosyayı hata olsa bile otomatik kapatır. Dosyada for ile dolaşmak tüm dosyayı belleğe almadan satır satır okur; gigabaytlık log dosyalarında bile çalışır. Sözlüğü üç seviyeyle önceden başlatmak hem "her zaman bulunsun" şartını karşılar hem de bilinmeyen seviyeleri (DEBUG gibi) sessizce süzer. encoding="utf-8" belirtmek Windows\'ta Türkçe karakter hatalarını önler.',
  tags=['dosya', 'with', 'okuma', 'log'], min=6),

dict(topic='Dosya ve Hata', diff=1, kind='yaz',
  title='Satış raporunu CSV olarak yaz',
  q='<p>Gün sonu satış raporunu dosyaya yazan <code>rapor_yaz(dosya_adi, satislar)</code> fonksiyonunu yaz. <code>satislar</code> bir sözlük: <code>ürün → adet</code>. Dosyanın ilk satırı başlık <code>urun,adet</code> olsun, sonra her ürün bir satırda (<code>çay,40</code>). Her satır <code>\\n</code> ile bitsin. Fonksiyon yazdığı <b>toplam satır sayısını</b> (başlık dahil) döndürsün. <code>csv</code> modülü kullanmadan, düz metin yazarak çöz.</p>',
  start=r'''
def rapor_yaz(dosya_adi, satislar):
    # buraya yaz
    pass
''',
  sol=r'''
def rapor_yaz(dosya_adi, satislar):
    with open(dosya_adi, "w", encoding="utf-8") as f:
        f.write("urun,adet\n")
        for urun, adet in satislar.items():
            f.write(f"{urun},{adet}\n")
    return len(satislar) + 1
''',
  tests=r'''
n = rapor_yaz("rapor.csv", {"çay": 40, "kahve": 55})
with open("rapor.csv", encoding="utf-8") as f:
    icerik = f.read()
assert icerik == "urun,adet\nçay,40\nkahve,55\n", "Dosya içeriği başlık + her ürün bir satır olmalı"
assert n == 3, "Başlık dahil 3 satır yazıldı"
assert rapor_yaz("bos.csv", {}) == 1, "Satış yoksa yalnızca başlık: 1"
with open("bos.csv", encoding="utf-8") as f:
    assert f.read() == "urun,adet\n", "Boş raporda yalnız başlık satırı olmalı"
''',
  hints=['"w" modu dosyayı oluşturur (varsa üzerine yazar).', 'write() satır sonu eklemez; "\\n" sen yazmalısın.'],
  why='"w" kipi dosyayı sıfırdan yazar; aynı rapor iki kez üretilirse eski içerik silinir (eklemek için "a" kullanılır). write otomatik satır sonu eklemediği için her satırın sonuna \\n konur. with bloğu bittiğinde dosya kapanır ve tampondaki veri diske yazılır; kapatmadan okumaya çalışmak eksik içerik gösterebilir. Gerçek CSV\'de virgül içeren ürün adları için csv.writer kullanmak gerekir (orta seviye JSON/CSV konusu).',
  tags=['dosya', 'yazma', 'with', 'rapor'], min=4),

dict(topic='Dosya ve Hata', diff=3, kind='yaz',
  title='Ayar dosyası okuyucu',
  q='<p>Lojistik uygulamasının ayarları <code>anahtar = değer</code> satırlarından oluşan bir metin dosyasında. <code>ayar_oku(dosya_adi)</code> fonksiyonunu yaz:</p><ul><li><code>#</code> ile başlayan satırlar yorumdur, boş satırlar atlanır.</li><li>Anahtar ve değerin etrafındaki boşluklar temizlenir; değer içinde <code>=</code> olabilir (yalnızca <b>ilk</b> <code>=</code>\'den böl).</li><li>Değer tamamen rakamsa <code>int</code>\'e çevrilir, değilse metin kalır.</li><li><code>=</code> içermeyen satırlar geçersizdir, atlanır.</li><li>Dosya yoksa hata fırlatma; boş sözlük döndür.</li></ul>',
  start=r'''
def ayar_oku(dosya_adi):
    # buraya yaz
    pass
''',
  sol=r'''
def ayar_oku(dosya_adi):
    ayarlar = {}
    try:
        with open(dosya_adi, encoding="utf-8") as f:
            for satir in f:
                satir = satir.strip()
                if not satir or satir.startswith("#") or "=" not in satir:
                    continue
                anahtar, deger = satir.split("=", 1)
                anahtar = anahtar.strip()
                deger = deger.strip()
                ayarlar[anahtar] = int(deger) if deger.isdigit() else deger
    except FileNotFoundError:
        return {}
    return ayarlar
''',
  tests=r'''
with open("ayar.conf", "w", encoding="utf-8") as f:
    f.write("# depo ayarları\ndepo = Gebze\n\nmax_palet=120\nbaglanti = host=10.0.0.5\nbozuk satır\n  zaman_asimi =  30 \n")
a = ayar_oku("ayar.conf")
assert a["depo"] == "Gebze", "depo = Gebze (boşluklar temizlenmeli)"
assert a["max_palet"] == 120, "Rakamsal değer int olmalı: 120"
assert a["baglanti"] == "host=10.0.0.5", "Yalnızca ilk = işaretinden bölünmeli"
assert a["zaman_asimi"] == 30, "Kenar boşluklu sayı da int olmalı"
assert len(a) == 4, "Yorum, boş ve geçersiz satırlar atlanmalı: 4 ayar"
assert ayar_oku("olmayan_dosya.conf") == {}, "Dosya yoksa boş sözlük (FileNotFoundError yakalanmalı)"
''',
  hints=['split("=", 1) en fazla bir kez böler: "a = b=c" → ["a ", " b=c"].', 'Atlanacak satır koşullarını tek if\'te birleştir; dosya yoksa oluşan FileNotFoundError\'ı try/except ile yakala.'],
  why='Sınırlı bölme split("=", 1) değerin içindeki = işaretlerini korur. Koşulları birleştirip continue ile erken atlamak döngü gövdesini sade tutar. isdigit ile güvenli dönüşüm yapılır (negatif sayılar için try: int(deger) except ValueError kullanılabilir). Dosya yokken boş sözlük döndürmek "varsayılan ayarlarla çalış" davranışıdır; yalnızca beklenen hatayı (FileNotFoundError) yakalamak, izin hatası gibi gerçek sorunları gizlememeyi sağlar. Hazır alternatif: configparser modülü INI dosyalarını okur.',
  tags=['dosya', 'FileNotFoundError', 'split', 'ayar'], min=9),

dict(topic='Dosya ve Hata', diff=2, kind='bug',
  title='Yanlış hata türü yakalanıyor',
  q='<p>Kodda bir hata var, bul ve düzelt. İK başvuru formunda yaş alanı metin olarak geliyor. <code>yas_al(metin)</code> sayıya çevrilebiliyorsa tam sayıyı, çevrilemiyorsa <code>None</code> döndürmeli. Ama <code>"otuz"</code> girilince program çöküyor.</p>',
  start=r'''
def yas_al(metin):
    try:
        return int(metin)
    except TypeError:
        return None
''',
  sol=r'''
def yas_al(metin):
    try:
        return int(metin)
    except ValueError:
        return None
''',
  tests=r'''
assert yas_al("34") == 34, "\"34\" → 34"
assert yas_al(" 27 ") == 27, "int() kenar boşluklarını tolere eder: 27"
assert yas_al("otuz") is None, "\"otuz\" çevrilemez → None (ValueError yakalanmalı)"
assert yas_al("") is None, "Boş metin → None"
''',
  hints=['int("otuz") hangi hatayı fırlatır? Konsolda dene.', 'Tür doğru (str) ama değer uygunsuz: bu ValueError\'dır.'],
  why='int("otuz") ValueError fırlatır: argümanın türü doğru (str) ama değeri uygunsuz. TypeError ise yanlış tür içindir (ör. int([1])). Yanlış türü yakalamak hatayı hiç yakalamamakla aynıdır. Çıplak except: ya da except Exception: yazmak "çalışıyor" görünür ama yazım hatalarını bile yutar; her zaman beklediğin en dar hata türünü yakala. Gerekirse birden fazla: except (ValueError, TypeError).',
  tags=['ValueError', 'TypeError', 'try/except', 'İK'], min=3),

dict(topic='Dosya ve Hata', diff=1, kind='tamamla',
  title='İşlem günlüğüne satır ekle',
  q='<p>Ilgaz Bank denetim günlüğüne her işlemde bir satır <b>eklenmeli</b> (önceki kayıtlar silinmeden). <code>log_ekle(dosya_adi, mesaj)</code> mesajı sona yeni satır olarak ekleyip dosyadaki toplam satır sayısını döndürmeli. Boşlukları (<code>___</code>) doldur.</p>',
  start=r'''
def log_ekle(dosya_adi, mesaj):
    with open(dosya_adi, "___", encoding="utf-8") as f:
        f.write(mesaj + ___)
    with open(dosya_adi, encoding="utf-8") as f:
        return len(f.readlines())
''',
  sol=r'''
def log_ekle(dosya_adi, mesaj):
    with open(dosya_adi, "a", encoding="utf-8") as f:
        f.write(mesaj + "\n")
    with open(dosya_adi, encoding="utf-8") as f:
        return len(f.readlines())
''',
  tests=r'''
with open("denetim.log", "w", encoding="utf-8") as f:
    f.write("açılış\n")
assert log_ekle("denetim.log", "havale 500 TL") == 2, "Eski satır korunmalı, yeni satır eklenmeli: 2 satır"
assert log_ekle("denetim.log", "EFT 1200 TL") == 3, "Bir ekleme daha: 3 satır"
with open("denetim.log", encoding="utf-8") as f:
    assert f.read() == "açılış\nhavale 500 TL\nEFT 1200 TL\n", "Satırlar sırayla, her biri \\n ile bitmeli"
''',
  hints=['"w" dosyayı siler; sona eklemek için başka bir kip var (append).', 'write satır sonunu kendisi eklemez.'],
  why='"a" (append) kipi dosya yoksa oluşturur, varsa imleci sona alır ve mevcut içeriğe dokunmaz; "w" ise her açılışta dosyayı sıfırlar ve denetim kaydını yok ederdi. write otomatik \\n eklemediği için satır sonu elle eklenir; aksi halde kayıtlar tek satırda birleşir. Çok büyük günlüklerde satır saymak için readlines yerine sum(1 for _ in f) kullanmak belleği korur.',
  tags=['dosya', 'append', 'kip', 'bankacılık'], min=3),

dict(topic='Dosya ve Hata', diff=2, kind='tamamla',
  title='Toplu dönüşümde hataları ayır',
  q='<p>Anadolu Market\'in Excel\'den aktarılan fiyat sütununda bazı hücreler bozuk. <code>toplu_donustur(degerler)</code> her metni <code>float</code>\'a çevirmeye çalışmalı; başarılıları <code>sayilar</code> listesine, çevrilemeyenleri <code>(indeks, değer)</code> demetleri olarak <code>hatalar</code> listesine koyup <code>(sayilar, hatalar)</code> döndürmeli. Boşlukları (<code>___</code>) doldur.</p>',
  start=r'''
def toplu_donustur(degerler):
    sayilar = []
    hatalar = []
    for i, d in enumerate(degerler):
        try:
            sayi = float(d)
        except ___:
            hatalar.append(___)
        ___:
            sayilar.append(sayi)
    return sayilar, hatalar
''',
  sol=r'''
def toplu_donustur(degerler):
    sayilar = []
    hatalar = []
    for i, d in enumerate(degerler):
        try:
            sayi = float(d)
        except ValueError:
            hatalar.append((i, d))
        else:
            sayilar.append(sayi)
    return sayilar, hatalar
''',
  tests=r'''
s, h = toplu_donustur(["12.5", "abc", "7", "", "3,5"])
assert s == [12.5, 7.0], "Geçerli değerler: [12.5, 7.0]"
assert h == [(1, "abc"), (3, ""), (4, "3,5")], "Hatalar indeksleriyle: abc, boş metin ve virgüllü 3,5"
assert toplu_donustur([]) == ([], []), "Boş girişte iki boş liste"
''',
  hints=['float("abc") hangi hatayı verir?', 'try bloğu hatasız biterse çalışan blok: else. Hata kaydı için (i, d) demeti.'],
  why='try/except/else ile yalnızca riskli satır (float) try içinde tutulur; başarılı durumdaki iş else\'e konur, böylece append sırasında oluşabilecek başka hatalar yanlışlıkla "dönüşüm hatası" sayılmaz. Hatalı kayıtları indeksleriyle toplamak, tek bozuk hücre yüzünden tüm aktarımı durdurmak yerine raporlayıp devam etmeyi sağlar (ETL\'de yaygın kalıp). "3,5" Türkçe ondalık virgülüdür; önceden d.replace(",", ".") ile kurtarılabilir.',
  tags=['try/except/else', 'ValueError', 'veri temizleme'], min=4),
]
