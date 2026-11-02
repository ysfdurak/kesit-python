START = 121
TASKS = [
# ---------------- Operatörler ----------------
dict(topic='Operatörler', diff=2, kind='rehberli',
  title='Kampanya uygunluğu (and / or / not)',
  q='<p>Anadolu Market kampanya kuralları:</p><ul><li><b>Kural A:</b> müşteri üye <b>ve</b> sepet tutarı en az 300 TL</li><li><b>Kural B:</b> kupon kodu <code>"HOSGELDIN"</code> <b>ve</b> bu müşterinin ilk siparişi</li><li>Kural A <b>veya</b> Kural B sağlanmalı; <b>ama</b> müşteri kara listedeyse hiçbir durumda kampanya yok.</li></ul><p><code>kampanya_uygun(tutar, uye, kupon, ilk_siparis, kara_liste)</code> fonksiyonunu yaz; <code>True</code>/<code>False</code> döndürsün.</p>',
  guide=['Kural A\'yı ayrı bir mantıksal değişkende hesapla (kural_a = ...).', 'Kural B\'yi de ayrı değişkende hesapla.', 'Sonucu "(A veya B) ve kara listede değil" olarak birleştir.', 'Parantezleri unutma: and, or\'dan önce değerlendirilir.'],
  example=r'''
# Benzer teknik: kural parçalarını adlandırıp birleştirmek
yas = 34
gelir = 42000
calisiyor = True
yas_uygun = 18 <= yas <= 70
gelir_uygun = gelir >= 30000 and calisiyor
print(yas_uygun and gelir_uygun)
''',
  start=r'''
def kampanya_uygun(tutar, uye, kupon, ilk_siparis, kara_liste):
    kural_a = uye and tutar >= 300
    # TODO: kural_b'yi yaz (kupon ve ilk sipariş)
    # TODO: (A veya B) ve kara listede değil
    return kural_a
''',
  sol=r'''
def kampanya_uygun(tutar, uye, kupon, ilk_siparis, kara_liste):
    kural_a = uye and tutar >= 300
    kural_b = kupon == "HOSGELDIN" and ilk_siparis
    return (kural_a or kural_b) and not kara_liste
''',
  tests=r'''
assert kampanya_uygun(350, True, "", False, False) is True, "Üye ve 350 TL: Kural A sağlanıyor → True"
assert kampanya_uygun(250, True, "", False, False) is False, "Üye ama 250 TL: hiçbir kural sağlanmıyor → False"
assert kampanya_uygun(50, False, "HOSGELDIN", True, False) is True, "Kupon + ilk sipariş: Kural B sağlanıyor → True"
assert kampanya_uygun(50, False, "HOSGELDIN", False, False) is False, "Kupon var ama ilk sipariş değil → False"
assert kampanya_uygun(900, True, "HOSGELDIN", True, True) is False, "Kara listedeki müşteri hiçbir durumda kampanya alamaz"
''',
  hints=['Her kuralı ayrı bir True/False değişkeninde tutmak işini kolaylaştırır.', 'kural_b = kupon == "HOSGELDIN" and ilk_siparis', 'return (kural_a or kural_b) and not kara_liste'],
  why='Karmaşık iş kurallarını adlandırılmış ara değişkenlere bölmek hem hatayı azaltır hem de kodu kural metniyle karşılaştırılabilir kılar. and önceliği or\'dan yüksektir; parantez olmadan kural_a or kural_b and not kara_liste yazsaydın kara liste yalnızca Kural B\'yi etkilerdi ve kara listedeki üye müşteri kampanya alırdı. Alternatif: önce kara listeyi kontrol edip erken dönmek (if kara_liste: return False).',
  tags=['and', 'or', 'not', 'mantıksal'], min=6),

dict(topic='Operatörler', diff=2, kind='yaz',
  title='Nakit yuvarlama (5 kuruş)',
  q='<p>Bazı ülkelerde 1 ve 2 kuruşluk madeni para kullanılmaz; kasada nakit tutar en yakın 5 kuruşa yuvarlanır. Kuralda kalan 0, 1, 2 kuruş ise aşağı; 3, 4 kuruş ise yukarı yuvarlanır.</p><p><code>nakit_yuvarla(kurus)</code> fonksiyonunu yaz: tam sayı kuruşu alıp yuvarlanmış tam sayı kuruşu döndürsün. <code>round()</code> kullanma; <code>%</code> ve aritmetik yeter.</p>',
  start=r'''
def nakit_yuvarla(kurus):
    # buraya yaz
    pass
''',
  sol=r'''
def nakit_yuvarla(kurus):
    kalan = kurus % 5
    if kalan <= 2:
        return kurus - kalan
    return kurus + (5 - kalan)
''',
  tests=r'''
assert nakit_yuvarla(1232) == 1230, "1232: kalan 2 → aşağı, 1230"
assert nakit_yuvarla(1233) == 1235, "1233: kalan 3 → yukarı, 1235"
assert nakit_yuvarla(1235) == 1235, "Zaten 5'in katıysa değişmez"
assert nakit_yuvarla(1239) == 1240, "1239: kalan 4 → yukarı, 1240"
assert nakit_yuvarla(0) == 0, "0 kuruş 0 kalır"
assert "round(" not in __source__, "Bu görevde round() kullanmadan % ile çöz"
''',
  hints=['kurus % 5 sayının 5\'in katından ne kadar fazla olduğunu verir.', 'Kalan küçükse kalanı çıkar, büyükse (5 - kalan) ekle.'],
  why='% 5 ile 5\'in bir önceki katına olan uzaklığı bulunur; kalan ≤ 2 ise o kata iner, değilse bir sonraki kata çıkılır. Tek satırlık alternatif: (kurus + 2) // 5 * 5 — 2 eklemek "yarıdan sonrası yukarı" etkisini verir. round(kurus / 5) * 5 de çalışır gibi görünür ama Python round\'u .5 durumlarında en yakın çift sayıya yuvarlar (banker\'s rounding) ve float bölme içerir.',
  tags=['%', '//', 'yuvarlama', 'kasa'], min=5),

dict(topic='Operatörler', diff=2, kind='bug',
  title='Her şehre hızlı teslimat',
  q='<p>Kodda bir hata var, bul ve düzelt. <code>hizli_teslimat(sehir)</code> yalnızca <code>"İstanbul"</code> ve <code>"Ankara"</code> için <code>True</code> döndürmeli. Ama müşteri hizmetleri Van\'dan gelen siparişlerin de "hızlı teslimat" etiketi aldığını bildirdi.</p>',
  start=r'''
def hizli_teslimat(sehir):
    if sehir == "İstanbul" or "Ankara":
        return True
    return False
''',
  sol=r'''
def hizli_teslimat(sehir):
    if sehir in ("İstanbul", "Ankara"):
        return True
    return False
''',
  tests=r'''
assert hizli_teslimat("İstanbul") is True, "İstanbul hızlı teslimat almalı"
assert hizli_teslimat("Ankara") is True, "Ankara hızlı teslimat almalı"
assert hizli_teslimat("Van") is False, "Van hızlı teslimat ALMAMALI: or sağ tarafı ayrı değerlendiriliyor"
assert hizli_teslimat("") is False, "Boş şehir için False dönmeli"
''',
  hints=['Koşul (sehir == "İstanbul") or ("Ankara") olarak okunuyor. "Ankara" tek başına True mu False mu?', 'Ya her iki tarafa sehir == yaz ya da in ile demet içinde ara.'],
  why='or her iki tarafı ayrı ayrı değerlendirir; "Ankara" boş olmayan bir metin olduğu için her zaman doğrudur (truthy), bu yüzden koşul hep True olur. Doğrusu sehir == "İstanbul" or sehir == "Ankara" ya da daha okunur haliyle sehir in ("İstanbul", "Ankara"). Fonksiyon tek satıra da indirilebilir: return sehir in {"İstanbul", "Ankara"}.',
  tags=['or', 'in', 'truthiness', 'mantık hatası'], min=3),

dict(topic='Operatörler', diff=1, kind='tamamla',
  title='Sadakat puanı',
  q='<p>Anadolu Market sadakat programı: her 10 TL için 1 puan (tam bölme), sepet 1000 TL ve üstüyse puan <b>iki katına</b> çıkar, en sonda her siparişe 5 puan hoş geldin bonusu eklenir. <code>sadakat_puani(tutar)</code> fonksiyonundaki boşlukları (<code>___</code>) <b>bileşik atama operatörleriyle</b> (<code>+=</code>, <code>*=</code> …) doldur.</p>',
  start=r'''
def sadakat_puani(tutar):
    puan = tutar ___ 10
    if tutar >= 1000:
        puan ___ 2
    puan ___ 5
    return puan
''',
  sol=r'''
def sadakat_puani(tutar):
    puan = tutar // 10
    if tutar >= 1000:
        puan *= 2
    puan += 5
    return puan
''',
  tests=r'''
assert sadakat_puani(259) == 30, "259 TL: 259 // 10 = 25 puan + 5 bonus = 30"
assert sadakat_puani(1000) == 205, "1000 TL: 100 puan, 2 katı 200, +5 = 205"
assert sadakat_puani(5) == 5, "5 TL: 0 puan + 5 bonus = 5"
assert isinstance(sadakat_puani(259), int), "Puan tam sayı olmalı: / yerine // kullan"
''',
  hints=['Her 10 TL için 1 puan: ondalık istemiyoruz, tam bölme lazım.', 'puan *= 2, puan = puan * 2 ile aynı şeydir.'],
  why='// tam bölme kesirli puanı atar (259 → 25). *= ve += bileşik atamalardır: puan = puan * 2 yazmanın kısa yoludur. Sıra önemlidir: bonus iki katına çıkarmadan sonra eklenir; önce eklenseydi 1000 TL için 210 puan çıkardı. Tamsayı yerine / kullanırsan 25.9 gibi float puanlar oluşur.',
  tags=['//', '+=', '*=', 'bileşik atama'], min=3),

# ---------------- Metinler ----------------
dict(topic='Metinler', diff=1, t='predict',
  title='Sipariş kodunu dilimle',
  q='<p>Anadolu Market sipariş kodları <code>"AM-2026-IST-0042"</code> biçiminde. Bu kod ne yazdırır?</p>',
  code=r'''
kod = "AM-2026-IST-0042"
print(kod[3:7])
print(kod[-4:])
print(kod[::5])
''',
  o=['2026\n0042\nA2T2', '-202\n0042\nA2T2', '2026\n042\nA-I0', '2026\n0042\nA0T2'], a=0,
  hints=['Dilimde başlangıç dahil, bitiş hariçtir.', '[::5] baştan itibaren her 5. karakteri alır: 0, 5, 10, 15. indeksler.'],
  why='kod[3:7] 3, 4, 5, 6. indeksleri alır: "2026". kod[-4:] son dört karakteri verir: "0042". kod[::5] 0, 5, 10, 15 indekslerindeki karakterlerdir: A, 2, T, 2. Gerçek işte sabit biçimli kodları dilimlemek yerine kod.split("-") ile parçalamak daha dayanıklıdır; biçim değişirse indeksler kayar.',
  tags=['dilimleme', 'indeks', 'str'], min=2),

dict(topic='Metinler', diff=2, t='predict',
  title='Metinler değişmez',
  q='<p>Bu kod ne yazdırır?</p>',
  code=r'''
ad = "anadolu market"
ad.upper()
print(ad)
print(ad.title().replace(" ", ""))
print(ad.find("x"), ad.count("a"))
''',
  o=['ANADOLU MARKET\nAnadoluMarket\n-1 3', 'anadolu market\nAnadoluMarket\n-1 3', 'anadolu market\nAnadolu Market\nNone 3', 'anadolu market\nAnadoluMarket\n-1 4'], a=1,
  hints=['upper() yeni bir metin döndürür; sonucu bir yere atanmadı.', 'find bulamazsa hata vermez, özel bir sayı döndürür.'],
  why='Metinler değişmezdir (immutable): ad.upper() yeni bir metin üretir ama atanmadığı için kaybolur; ad aynen kalır. title() her kelimenin ilk harfini büyütür, replace boşlukları siler: "AnadoluMarket". find bulamazsa -1 döndürür (index() ise ValueError fırlatır). "anadolu market" içinde 3 tane a vardır (0, 2, 9. indeksler).',
  tags=['immutable', 'upper', 'find', 'count'], min=3),

dict(topic='Metinler', diff=2, t='order',
  title='Fiş satırı biçimlendir',
  q='<p>Kasa sisteminden gelen <code>"Elma;3;12.50"</code> satırını ayrıştırıp fiş satırı yazdıran kodun satırlarını sırala. Beklenen çıktı:</p><pre class="out">ELMA....   37.50 TL</pre>',
  lines=['satir = "Elma;3;12.50"', 'ad, adet, fiyat = satir.split(";")', 'tutar = int(adet) * float(fiyat)', 'etiket = ad.upper().ljust(8, ".")', 'print(f"{etiket}{tutar:>8.2f} TL")'],
  expect='ELMA....   37.50 TL\n',
  hint='split ile parçalar oluşmadan ne tutar ne etiket hesaplanabilir.',
  hints=['Önce veri, sonra ayrıştırma, sonra hesap, en son yazdırma.'],
  why='split(";") metni üç parçaya böler ve demet açma (unpacking) ile üç değişkene atar. Parçalar hâlâ metindir; int() ve float() ile çevrilir. ljust(8, ".") etiketi 8 karaktere noktayla tamamlar; :>8.2f sayıyı 8 karakterlik alanda sağa yaslı, 2 ondalıkla yazar. Bu iki teknikle hizalı fiş/rapor satırları üretilir.',
  tags=['split', 'ljust', 'f-string', 'biçimlendirme'], min=3),

dict(topic='Metinler', diff=1, kind='rehberli',
  title='Ürün adından URL kısaltması (slug)',
  q='<p>Anadolu Market ürün sayfalarının adresleri ürün adından üretiliyor: <code>"Çay Bardağı Seti"</code> → <code>"cay-bardagi-seti"</code>.</p><p><code>slug_olustur(ad)</code> fonksiyonunu yaz:</p><ul><li>Küçük harfe çevir</li><li>Türkçe karakterleri dönüştür: ç→c, ğ→g, ı→i, ö→o, ş→s, ü→u</li><li>Kelimeleri (fazla boşluklar dahil) tek <code>-</code> ile birleştir</li></ul>',
  guide=['ad.lower() ile küçük harfe çevir.', 'str.maketrans("çğıöşü", "cgiosu") ile bir dönüşüm tablosu oluştur.', 'metin.translate(tablo) ile karakterleri değiştir.', 'split() (argümansız) ile kelimelere böl, "-".join(...) ile birleştir.'],
  example=r'''
# Benzer teknik: telefon tuş harflerini rakama çevirmek
tablo = str.maketrans("abc", "222")
print("cab".translate(tablo))           # 222
print("_".join("  çok   boşluklu  metin ".split()))   # çok_boşluklu_metin
''',
  start=r'''
def slug_olustur(ad):
    metin = ad.lower()
    # TODO: Türkçe karakter tablosunu oluştur (maketrans)
    # TODO: translate ile uygula
    # TODO: kelimelere böl ve "-" ile birleştir
    return metin
''',
  sol=r'''
def slug_olustur(ad):
    metin = ad.lower()
    tablo = str.maketrans("çğıöşü", "cgiosu")
    metin = metin.translate(tablo)
    return "-".join(metin.split())
''',
  tests=r'''
assert slug_olustur("Çay Bardağı Seti") == "cay-bardagi-seti", "\"Çay Bardağı Seti\" → \"cay-bardagi-seti\" olmalı"
assert slug_olustur("  Şık   Ütü Masası ") == "sik-utu-masasi", "Fazla boşluklar tek tireye dönüşmeli, baş/son boşluk olmamalı"
assert slug_olustur("Kahve") == "kahve", "Tek kelime sadece küçük harfe çevrilmeli"
''',
  hints=['Karakter karakter değiştirmek için translate en temiz yoldur.', 'split() argümansız çağrılınca tüm boşluk gruplarını ayırıcı sayar ve boş parçaları atar.', 'return "-".join(metin.translate(tablo).split())'],
  why='maketrans iki eşit uzunlukta metinden harf-harf dönüşüm tablosu kurar; translate tek geçişte tüm karakterleri değiştirir (altı ayrı replace çağrısından hızlıdır). split() argümansız kullanılınca birden çok boşluğu tek ayırıcı sayar ve baş/son boşlukları yok sayar, bu yüzden strip\'e gerek kalmaz. Dikkat: "İ".lower() Python\'da "i̇" (noktalı) verir; büyük İ içeren adlar için Unicode ve Girdi görevlerindeki düzeltmeye bak.',
  tags=['maketrans', 'translate', 'split', 'join'], min=6),

dict(topic='Metinler', diff=2, kind='rehberli',
  title='Hizalı fatura satırı',
  q='<p>Faturadaki her satır sabit genişlikte olmalı: ürün adı 15 karakter sola yaslı, adet 4 karakter sağa yaslı, tutar 10 karakter sağa yaslı ve 2 ondalıklı. Ürün adı 15 karakterden uzunsa ilk 14 karakteri alınıp sonuna <code>…</code> eklenir (toplam 15).</p><p><code>fatura_satiri(urun, adet, fiyat)</code> fonksiyonu bu satırı (metin) döndürsün. Tutar = adet × fiyat.</p>',
  guide=['Önce ad uzunluğunu kontrol et: len(urun) > 15 ise kısalt.', 'Kısaltma: urun[:14] + "…"', 'Tutarı hesapla.', 'f-string ile hizala: {ad:<15}{adet:>4}{tutar:>10.2f}'],
  example=r'''
# Benzer teknik: hizalı personel listesi
ad = "Ayşe Yılmaz"
gun = 22
print(f"[{ad:<12}][{gun:>3}][{1234.5:>9.2f}]")
''',
  start=r'''
def fatura_satiri(urun, adet, fiyat):
    # TODO: uzun adları 14 karakter + "…" yap
    tutar = adet * fiyat
    # TODO: hizalı metni f-string ile döndür
    return urun
''',
  sol=r'''
def fatura_satiri(urun, adet, fiyat):
    if len(urun) > 15:
        urun = urun[:14] + "…"
    tutar = adet * fiyat
    return f"{urun:<15}{adet:>4}{tutar:>10.2f}"
''',
  tests=r'''
s = fatura_satiri("Çay", 2, 64.9)
assert s == "Çay" + " " * 12 + "   2" + "    129.80", "\"Çay\", 2, 64.9 için ad 15 sola, adet 4 sağa, tutar 10 sağa yaslı olmalı"
assert len(s) == 29, "Satır uzunluğu her zaman 15 + 4 + 10 = 29 olmalı"
u = fatura_satiri("Organik Fındık Ezmesi", 1, 189.0)
assert u.startswith("Organik Fındık…"), "Uzun ad 14 karakter + … olarak kısaltılmalı"
assert len(u) == 29, "Kısaltılmış satır da 29 karakter olmalı"
''',
  hints=['Biçim belirteçleri: < sola, > sağa yaslar; sayı genişliktir.', '.2f iki ondalık demektir; genişlikle birleşir: >10.2f', 'return f"{urun:<15}{adet:>4}{tutar:>10.2f}"'],
  why='f-string biçim belirteçleri (format spec) rapor ve fiş üretmenin en kısa yoludur: hizalama yönü, genişlik ve ondalık tek ifadede belirtilir. Uzun adları kısaltmazsan :<15 metni kesmez, sadece kısa olanları doldurur; satır taşar ve sütunlar kayar. Alternatif: urun.ljust(15), str(adet).rjust(4), format(tutar, ">10.2f") — aynı işi metotlarla yapar.',
  tags=['f-string', 'hizalama', 'dilimleme', 'fatura'], min=7),

dict(topic='Metinler', diff=2, kind='yaz',
  title='Yorumu kelime ortasından kesmeden kısalt',
  q='<p>Müşteri yorumları liste ekranında en fazla <code>n</code> karakter gösteriliyor. <code>kisalt(metin, n)</code> fonksiyonunu yaz:</p><ul><li>Metin <code>n</code> karakter veya daha kısaysa olduğu gibi döndür.</li><li>Uzunsa, ilk <code>n</code> karakter içindeki <b>son boşluğa</b> kadar al (kelime bölünmesin), sondaki boşluğu at ve <code>"..."</code> ekle.</li><li>İlk <code>n</code> karakterde hiç boşluk yoksa ilk <code>n</code> karakteri alıp <code>"..."</code> ekle.</li></ul>',
  start=r'''
def kisalt(metin, n):
    # buraya yaz
    pass
''',
  sol=r'''
def kisalt(metin, n):
    if len(metin) <= n:
        return metin
    parca = metin[:n]
    bosluk = parca.rfind(" ")
    if bosluk == -1:
        return parca + "..."
    return parca[:bosluk].rstrip() + "..."
''',
  tests=r'''
assert kisalt("Kargo çok hızlı geldi", 50) == "Kargo çok hızlı geldi", "Kısa metin aynen dönmeli"
assert kisalt("Kargo çok hızlı geldi, teşekkürler", 17) == "Kargo çok hızlı...", "17 karakterde \"geldi\" bölünmemeli: \"Kargo çok hızlı...\""
assert kisalt("Mükemmelötesiharika", 5) == "Mükem...", "Boşluk yoksa ilk n karakter + ..."
assert kisalt("Ürün güzel", 10) == "Ürün güzel", "Tam n uzunluktaki metin aynen dönmeli"
''',
  hints=['metin[:n] ile ilk n karakteri al, sonra içinde son boşluğu ara.', 'rfind sağdan arar, bulamazsa -1 döndürür.'],
  why='Önce uzunluk kontrolüyle kısa metinler erken döndürülür. metin[:n] içinde rfind(" ") son kelime sınırını bulur; o noktaya kadar dilimlemek kelimeyi bölmez. Boşluk yoksa (-1) düz kesmeye düşülür. Alternatif: textwrap.shorten(metin, width=n, placeholder="...") benzer işi yapar ama boşlukları sadeleştirir ve placeholder\'ı genişliğe dahil eder.',
  tags=['rfind', 'dilimleme', 'kenar durum'], min=6),
]
