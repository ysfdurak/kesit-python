START = 171
TASKS = [
dict(topic='Koşullar', diff=1, t='order',
  title='Kritik stok uyarısı',
  q='<p>Stok seviyesine göre uyarı üreten kodun satırlarını sırala. Beklenen çıktı: <code>Stok 3: Sipariş ver</code></p>',
  lines=['stok = 3', 'kritik = stok < 5', 'durum = "Sipariş ver" if kritik else "Yeterli"', 'print(f"Stok {stok}: {durum}")'],
  expect='Stok 3: Sipariş ver\n',
  hint='Koşullu ifade (ternary), kritik değişkeni hesaplandıktan sonra kullanılabilir.',
  hints=['Karşılaştırma sonucu bir bool\'dur ve değişkende saklanabilir.'],
  why='stok < 5 ifadesi True/False üretir ve kritik değişkenine atanabilir; bu, koşula bir ad vermenin en okunur yoludur. a if kosul else b koşullu ifadesi (ternary) iki değerden birini seçer ve tek satırlık if/else\'in yerini tutar. Uzun ya da iç içe ternary yazmaktan kaçın; okunurluk düşer.',
  tags=['bool', 'ternary', 'if'], min=2),

dict(topic='Koşullar', diff=1, kind='rehberli',
  title='Acil servis önceliği',
  q='<p>Hastane randevu sisteminde hastalar renk koduyla önceliklendiriliyor. <code>oncelik(yas, kronik, acil)</code> fonksiyonunu yaz:</p><ul><li><code>acil</code> True ise <code>"kırmızı"</code></li><li>değilse, 65 yaş ve üzeri <b>ya da</b> kronik hastalığı varsa <code>"sarı"</code></li><li>diğer durumlarda <code>"yeşil"</code></li></ul>',
  guide=['En öncelikli kuralı (acil) en üste yaz.', 'elif ile yaş/kronik kuralını ekle: yas >= 65 or kronik', 'else ile kalan durumu yakala.', 'Her dalda return ile metni döndür.'],
  example=r'''
# Benzer teknik: en güçlü kural önce
def kargo_tipi(agirlik, kirilacak):
    if kirilacak:
        return "özel"
    elif agirlik > 30:
        return "palet"
    else:
        return "standart"
print(kargo_tipi(40, True), kargo_tipi(40, False), kargo_tipi(2, False))
''',
  start=r'''
def oncelik(yas, kronik, acil):
    # TODO: acil ise kırmızı
    # TODO: 65+ ya da kronik ise sarı
    # TODO: diğer durumlar yeşil
    pass
''',
  sol=r'''
def oncelik(yas, kronik, acil):
    if acil:
        return "kırmızı"
    elif yas >= 65 or kronik:
        return "sarı"
    else:
        return "yeşil"
''',
  tests=r'''
assert oncelik(30, False, True) == "kırmızı", "Acil hasta her zaman kırmızı"
assert oncelik(70, True, True) == "kırmızı", "Acil + yaşlı: yine kırmızı (acil kuralı önce gelmeli)"
assert oncelik(65, False, False) == "sarı", "Tam 65 yaş sarı olmalı (>= kullan)"
assert oncelik(40, True, False) == "sarı", "Kronik hasta sarı"
assert oncelik(40, False, False) == "yeşil", "Diğer durumlar yeşil"
''',
  hints=['if / elif / else zincirinde ilk doğru dal çalışır; en güçlü kuralı başa koy.', 'elif yas >= 65 or kronik:', 'Her dalda return "..." yaz.'],
  why='Kurallar öncelik sırasıyla yazıldığında if/elif zinciri iş kuralını birebir yansıtır; acil kontrolü önce olduğu için yaşlı ve acil bir hasta doğru şekilde kırmızı alır. Her dal return ettiği için elif/else yerine ardışık if\'ler de çalışırdı (erken dönüş, early return). Sınırlarda (65) >= mi > mı kullanılacağı belgeden doğrulanmalı; testler tam bu sınırı dener.',
  tags=['if', 'elif', 'or', 'sağlık'], min=4),

dict(topic='Koşullar', diff=2, kind='rehberli',
  title='Kademeli su faturası',
  q='<p>Belediye su tarifesi kademelidir:</p><div class="tbl-wrap"><table><tr><th>Kademe</th><th>m³ birim fiyatı</th></tr><tr><td>İlk 10 m³</td><td>20 TL</td></tr><tr><td>11–20 m³ arası</td><td>30 TL</td></tr><tr><td>20 m³ üstü</td><td>45 TL</td></tr></table></div><p>Her kademe yalnızca kendi aralığındaki tüketime uygulanır. Örn. 25 m³ = 10×20 + 10×30 + 5×45 = 725 TL. <code>su_faturasi(m3)</code> fonksiyonunu yaz.</p>',
  guide=['Tüketim 10 veya altındaysa yalnızca ilk kademe: m3 * 20', '20 veya altındaysa: ilk 10 m³ tam (200) + (m3 - 10) * 30', '20\'nin üstündeyse: 200 + 300 + (m3 - 20) * 45', 'Koşulları küçükten büyüğe if/elif/else ile yaz.'],
  example=r'''
# Benzer teknik: kademeli prim hesabı (ilk 10.000 TL %2, üstü %5)
def prim(satis):
    if satis <= 10000:
        return satis * 0.02
    return 10000 * 0.02 + (satis - 10000) * 0.05
print(prim(8000), prim(15000))
''',
  start=r'''
def su_faturasi(m3):
    if m3 <= 10:
        return m3 * 20
    # TODO: 11-20 arası kademe
    # TODO: 20 üstü kademe
''',
  sol=r'''
def su_faturasi(m3):
    if m3 <= 10:
        return m3 * 20
    elif m3 <= 20:
        return 10 * 20 + (m3 - 10) * 30
    else:
        return 10 * 20 + 10 * 30 + (m3 - 20) * 45
''',
  tests=r'''
assert su_faturasi(8) == 160, "8 m³ tamamen ilk kademede: 8 × 20 = 160"
assert su_faturasi(10) == 200, "Sınır: 10 m³ = 200"
assert su_faturasi(15) == 350, "15 m³ = 200 + 5 × 30 = 350"
assert su_faturasi(25) == 725, "25 m³ = 200 + 300 + 5 × 45 = 725"
assert su_faturasi(0) == 0, "Tüketim yoksa fatura 0"
''',
  hints=['Kademeli tarifede tüm tüketim en yüksek fiyattan hesaplanmaz; her parça kendi fiyatından.', 'elif m3 <= 20: return 200 + (m3 - 10) * 30', 'else: return 500 + (m3 - 20) * 45'],
  why='Kademeli (dilimli) hesaplarda alt kademeler her zaman tam doludur; yalnızca son kademe kısmidir. elif zinciri küçükten büyüğe sıralandığı için her dalda önceki sınırların aşıldığı bilinir. Sabit sayıları (10, 20, 30, 45) değişkenlere ya da bir kademe listesine taşımak tarife değiştiğinde kodu korur: [(10, 20), (10, 30), (None, 45)] üzerinde dönen genel bir fonksiyon, gelir vergisi dilimleri için de kullanılabilir.',
  tags=['if', 'elif', 'kademeli tarife', 'belediye'], min=6),

dict(topic='Koşullar', diff=2, kind='yaz',
  title='Şifre gücü',
  q='<p>Anadolu Bank internet şubesi kayıt ekranı için <code>sifre_gucu(sifre)</code> fonksiyonunu yaz. Şu dört ölçütten kaç tanesinin sağlandığını say:</p><ol><li>En az 8 karakter</li><li>En az bir rakam</li><li>En az bir büyük harf</li><li>En az bir küçük harf</li></ol><p>Puan 0–2 ise <code>"zayıf"</code>, 3 ise <code>"orta"</code>, 4 ise <code>"güçlü"</code> döndür.</p>',
  start=r'''
def sifre_gucu(sifre):
    # buraya yaz
    pass
''',
  sol=r'''
def sifre_gucu(sifre):
    puan = 0
    if len(sifre) >= 8:
        puan += 1
    if any(c.isdigit() for c in sifre):
        puan += 1
    if any(c.isupper() for c in sifre):
        puan += 1
    if any(c.islower() for c in sifre):
        puan += 1
    if puan == 4:
        return "güçlü"
    elif puan == 3:
        return "orta"
    return "zayıf"
''',
  tests=r'''
assert sifre_gucu("Anadolu2026") == "güçlü", "Uzun, rakamlı, büyük ve küçük harfli: güçlü"
assert sifre_gucu("anadolu2026") == "orta", "Büyük harf yok: 3 puan → orta"
assert sifre_gucu("abc") == "zayıf", "Yalnızca küçük harf: 1 puan → zayıf"
assert sifre_gucu("") == "zayıf", "Boş şifre: zayıf"
assert sifre_gucu("Ab1") == "orta", "Kısa ama üç tür karakter: 3 puan → orta"
''',
  hints=['Ölçütleri ayrı ayrı if\'lerle kontrol et (elif değil!), her biri puan eklesin.', 'any(c.isdigit() for c in sifre) "en az bir rakam var mı?" sorusunu cevaplar.'],
  why='Bağımsız ölçütler ardışık if\'lerle sayılır; elif kullanılsaydı yalnızca ilk sağlanan ölçüt puan kazandırırdı. any() ilk eşleşmede durur ve karakter karakter döngü yazmayı gereksiz kılar. Alternatif kısa yol: puan = sum([len(s) >= 8, any(...), any(...), any(...)]) — True 1, False 0 sayılır. Gerçek sistemlerde ayrıca yaygın şifre listesi ve tekrar kontrolü yapılır.',
  tags=['if', 'any', 'isdigit', 'güvenlik'], min=6),

dict(topic='Koşullar', diff=2, kind='bug',
  title='Yaş grubu sınırları',
  q='<p>Kodda bir hata var, bul ve düzelt. Belediye ulaşım kartı için <code>yas_grubu(yas)</code>: 0–17 <code>"genç"</code>, 18–64 <code>"yetişkin"</code>, 65 ve üzeri <code>"emekli"</code> döndürmeli. Gişeden şikâyet geldi: 18 ve 65 yaşındakiler yanlış kart alıyor.</p>',
  start=r'''
def yas_grubu(yas):
    if 18 < yas < 65:
        return "yetişkin"
    elif yas > 65:
        return "emekli"
    else:
        return "genç"
''',
  sol=r'''
def yas_grubu(yas):
    if yas < 18:
        return "genç"
    elif yas < 65:
        return "yetişkin"
    else:
        return "emekli"
''',
  tests=r'''
assert yas_grubu(17) == "genç", "17 yaş genç"
assert yas_grubu(18) == "yetişkin", "18 yaş YETİŞKİN olmalı (sınır dahil)"
assert yas_grubu(64) == "yetişkin", "64 yaş yetişkin"
assert yas_grubu(65) == "emekli", "65 yaş EMEKLİ olmalı (sınır dahil)"
assert yas_grubu(0) == "genç", "0 yaş genç"
''',
  hints=['18 < yas, 18 için doğru mu? 65 > 65 doğru mu?', 'Küçükten büyüğe sıralı tek yönlü karşılaştırmalar (yas < 18, yas < 65) sınır hatalarını önler.'],
  why='18 < yas ifadesi 18\'i dışarıda bırakır, yas > 65 da 65\'i; ikisi de else\'e düşüp "genç" olur. Bu tür sınır hatalarına (off-by-one) karşı en sağlam yöntem aralıkları küçükten büyüğe tek yönlü karşılaştırmayla yazmaktır: önceki koşul sağlanmadıysa alt sınır zaten garantidir. Test yazarken her zaman sınır değerlerini (17, 18, 64, 65) dene.',
  tags=['if', 'sınır değer', 'off-by-one', 'belediye'], min=3),

# ---------------- match-case ----------------
dict(topic='match-case', diff=2, t='predict',
  title='Liste kalıpları',
  q='<p>Müşteri hizmetleri komut yorumlayıcısı üç komut alıyor. Çıktı nedir?</p>',
  code=r'''
def yorumla(komut):
    match komut.split():
        case ["iptal", no]:
            return f"{no} iptal"
        case ["iade", no, *neden]:
            return f"{no} iade ({len(neden)})"
        case [tek]:
            return f"tek: {tek}"
        case _:
            return "?"

print(yorumla("iade 42 kırık kutu"))
print(yorumla("iptal"))
print(yorumla("iptal 7"))
''',
  o=['42 iade (2)\ntek: iptal\n7 iptal', '42 iade (1)\ntek: iptal\n7 iptal', '42 iade (2)\n?\n7 iptal', '42 iade (2)\niptal iptal\n7 iptal'], a=0,
  hints=['Liste kalıbı eleman SAYISIYLA birlikte eşleşir.', '*neden kalan tüm elemanları bir listede toplar.'],
  why='"iade 42 kırık kutu".split() dört elemanlıdır: "iade", no = "42", neden = ["kırık", "kutu"] → len 2. "iptal" tek elemanlı liste olduğu için ["iptal", no] kalıbına uymaz (iki eleman ister) ve [tek] kalıbına düşer. "iptal 7" iki elemanlıdır, ilk case ile eşleşir. Kalıplar yukarıdan aşağı denenir; case _ her şeyi yakalayan joker (wildcard) daldır.',
  tags=['match', 'case', 'liste kalıbı', 'yıldız'], min=4),

dict(topic='match-case', diff=2, t='order',
  title='Büyük ödeme uyarısı',
  q='<p>Ödeme olayını sözlük kalıbıyla yorumlayan kodun satırlarını sırala. Beklenen çıktı: <code>Büyük ödeme</code></p>',
  lines=['olay = {"tur": "odeme", "tutar": 1500}', 'match olay:', '    case {"tur": "odeme", "tutar": t} if t > 1000:', '        print("Büyük ödeme")', '    case {"tur": "odeme", "tutar": t}:', '        print(f"Ödeme: {t} TL")'],
  expect='Büyük ödeme\n',
  hint='Koşullu (guard) case, genel case\'ten önce gelmeli; yoksa hiç çalışmaz.',
  hints=['case kalıpları sırayla denenir; ilk eşleşen kazanır.'],
  why='match kalıpları yukarıdan aşağı dener. Koşulsuz {"tur": "odeme", "tutar": t} kalıbı her ödemeyi yakaladığı için önce yazılsaydı guard\'lı (if t > 1000) dal asla çalışmazdı. Sözlük kalıbı yalnızca belirtilen anahtarlara bakar; ek anahtarlar eşleşmeyi bozmaz. if/elif ile karşılığı: if olay.get("tur") == "odeme" and olay.get("tutar", 0) > 1000: ...',
  tags=['match', 'guard', 'sözlük kalıbı'], min=3),

dict(topic='match-case', diff=1, kind='rehberli',
  title='Kargo durum kodları',
  q='<p>Anadolu Market kargo entegrasyonu sayısal durum kodları gönderiyor. <code>durum_mesaji(kod)</code> fonksiyonunu <code>match-case</code> ile yaz:</p><ul><li>1 → <code>"Hazırlanıyor"</code></li><li>2 veya 3 → <code>"Yolda"</code></li><li>4 → <code>"Teslim edildi"</code></li><li>9 → <code>"İade"</code></li><li>diğer her şey → <code>"Bilinmeyen durum: &lt;kod&gt;"</code> (ör. <code>"Bilinmeyen durum: 7"</code>)</li></ul>',
  guide=['match kod: satırıyla başla.', 'Her sabit değer için ayrı case yaz.', 'Birden fazla değeri | ile birleştir: case 2 | 3:', 'Son dalda case _: ile f-string döndür.'],
  example=r'''
# Benzer teknik: gün numarasından vardiya
def vardiya(gun):
    match gun:
        case 6 | 7:
            return "nöbet"
        case 1:
            return "toplantı"
        case _:
            return f"normal ({gun})"
print(vardiya(7), vardiya(1), vardiya(3))
''',
  start=r'''
def durum_mesaji(kod):
    match kod:
        case 1:
            return "Hazırlanıyor"
        # TODO: 2 veya 3 → Yolda
        # TODO: 4 → Teslim edildi
        # TODO: 9 → İade
        # TODO: diğerleri
''',
  sol=r'''
def durum_mesaji(kod):
    match kod:
        case 1:
            return "Hazırlanıyor"
        case 2 | 3:
            return "Yolda"
        case 4:
            return "Teslim edildi"
        case 9:
            return "İade"
        case _:
            return f"Bilinmeyen durum: {kod}"
''',
  tests=r'''
assert durum_mesaji(1) == "Hazırlanıyor", "1 → Hazırlanıyor"
assert durum_mesaji(2) == "Yolda" and durum_mesaji(3) == "Yolda", "2 ve 3 → Yolda (| ile birleştir)"
assert durum_mesaji(4) == "Teslim edildi", "4 → Teslim edildi"
assert durum_mesaji(9) == "İade", "9 → İade"
assert durum_mesaji(7) == "Bilinmeyen durum: 7", "Tanımsız kod için mesajda kodun kendisi geçmeli"
''',
  hints=['Değer kalıbı: case 4:', 'Veya kalıbı: case 2 | 3:', 'Joker: case _: return f"Bilinmeyen durum: {kod}"'],
  why='Sabit değerlerle eşleşmede match-case, uzun if/elif zincirinden daha okunurdur; | ile birden çok değer tek dalda toplanır. case _ hiçbir değişkene bağlanmayan joker kalıptır; olmasaydı bilinmeyen kodlarda fonksiyon sessizce None döndürürdü. Alternatif: bir sözlük eşlemesi MESAJLAR.get(kod, f"Bilinmeyen durum: {kod}") — eşlemeler veriden geliyorsa sözlük daha uygundur.',
  tags=['match', 'case', '|', 'lojistik'], min=4),

dict(topic='match-case', diff=2, kind='rehberli',
  title='Hesap hareketlerini işle',
  q='<p>Anadolu Bank hesap hareketleri demetler halinde geliyor:</p><ul><li><code>("yatir", tutar)</code> → bakiyeye ekle</li><li><code>("cek", tutar)</code> → bakiyeden düş, <b>ama</b> bakiye yetmiyorsa işlemi atla</li><li><code>("transfer", tutar, hedef_iban)</code> → çekme gibi davranır (yetmiyorsa atla)</li><li>Başka biçimde gelen hareketleri yok say.</li></ul><p><code>bakiye_hesapla(baslangic, hareketler)</code> son bakiyeyi döndürsün. <code>match-case</code> ile demet kalıpları kullan.</p>',
  guide=['bakiye = baslangic ile başla, hareketlerde dolaş.', 'case ("yatir", tutar): bakiye += tutar', 'Çekme ve transferi ayrı case\'lerde yaz; guard ile yeterlilik kontrolü yap: case ("cek", tutar) if tutar <= bakiye:', 'case _: pass ile diğerlerini atla.'],
  example=r'''
# Benzer teknik: demet kalıbıyla stok hareketi
stok = 10
for hareket in [("giris", 5), ("cikis", 3), ("sayim",), ("cikis", 50)]:
    match hareket:
        case ("giris", adet):
            stok += adet
        case ("cikis", adet) if adet <= stok:
            stok -= adet
        case _:
            print("atlandı:", hareket)
print(stok)
''',
  start=r'''
def bakiye_hesapla(baslangic, hareketler):
    bakiye = baslangic
    for h in hareketler:
        match h:
            case ("yatir", tutar):
                bakiye += tutar
            # TODO: çekme (yeterliyse)
            # TODO: transfer (yeterliyse)
            # TODO: diğerleri
    return bakiye
''',
  sol=r'''
def bakiye_hesapla(baslangic, hareketler):
    bakiye = baslangic
    for h in hareketler:
        match h:
            case ("yatir", tutar):
                bakiye += tutar
            case ("cek", tutar) if tutar <= bakiye:
                bakiye -= tutar
            case ("transfer", tutar, _) if tutar <= bakiye:
                bakiye -= tutar
            case _:
                pass
    return bakiye
''',
  tests=r'''
h = [("yatir", 500), ("cek", 200), ("transfer", 100, "TR99"), ("cek", 5000)]
assert bakiye_hesapla(1000, h) == 1200, "1000 + 500 - 200 - 100 = 1200; 5000 çekme yetersiz bakiye nedeniyle atlanmalı"
assert bakiye_hesapla(100, [("transfer", 150, "TR1")]) == 100, "Yetersiz bakiyede transfer atlanmalı"
assert bakiye_hesapla(50, [("faiz",), ("yatir", 10, "fazla")]) == 50, "Tanınmayan biçimler yok sayılmalı"
assert bakiye_hesapla(0, []) == 0, "Hareket yoksa bakiye değişmez"
''',
  hints=['Demet kalıbı eleman sayısını da kontrol eder: ("yatir", 10, "fazla") ("yatir", tutar) ile eşleşmez.', 'Koşullu kalıp: case ("cek", tutar) if tutar <= bakiye:', 'Kullanmayacağın elemanı _ ile karşıla: case ("transfer", tutar, _) if tutar <= bakiye:'],
  why='Demet kalıpları hem biçimi (eleman sayısı ve sabit ilk eleman) hem de değişken bağlamayı tek satırda yapar. Guard (if) koşulu sağlanmazsa o case eşleşmemiş sayılır ve sonraki kalıplara geçilir; yetersiz bakiyeli çekme bu yüzden case _ dalına düşer ve atlanır. Gerçek sistemde atlanan işlemler bir hata listesine kaydedilir; bunu bir sonuç listesine append ederek ekleyebilirsin.',
  tags=['match', 'tuple kalıbı', 'guard', 'bankacılık'], min=7),

dict(topic='match-case', diff=2, kind='yaz',
  title='Paket tipine göre kargo ücreti',
  q='<p>Lojistik firmasının fiyatlandırması paket sözlüğünün yapısına göre değişiyor. <code>kargo_ucreti(paket)</code> fonksiyonunu <code>match-case</code> sözlük kalıplarıyla yaz:</p><ul><li><code>{"tip": "zarf"}</code> → 30</li><li><code>{"tip": "koli", "desi": d}</code> ve d ≤ 10 → 50</li><li><code>{"tip": "koli", "desi": d}</code> ve d &gt; 10 → 50 + (d − 10) × 4</li><li><code>{"tip": "palet", "kg": k}</code> → k × 2.5</li><li>Diğer her şey → <code>None</code></li></ul>',
  start=r'''
def kargo_ucreti(paket):
    # buraya yaz
    pass
''',
  sol=r'''
def kargo_ucreti(paket):
    match paket:
        case {"tip": "zarf"}:
            return 30
        case {"tip": "koli", "desi": d} if d <= 10:
            return 50
        case {"tip": "koli", "desi": d}:
            return 50 + (d - 10) * 4
        case {"tip": "palet", "kg": k}:
            return k * 2.5
        case _:
            return None
''',
  tests=r'''
assert kargo_ucreti({"tip": "zarf"}) == 30, "Zarf 30 TL"
assert kargo_ucreti({"tip": "zarf", "not": "acil"}) == 30, "Sözlük kalıbı ek anahtarları yok sayar: yine 30"
assert kargo_ucreti({"tip": "koli", "desi": 8}) == 50, "10 desi ve altı koli 50 TL"
assert kargo_ucreti({"tip": "koli", "desi": 15}) == 70, "15 desi: 50 + 5 × 4 = 70"
assert kargo_ucreti({"tip": "palet", "kg": 200}) == 500.0, "200 kg palet: 500.0"
assert kargo_ucreti({"tip": "koli"}) is None, "Desisi olmayan koli tanımsız: None"
assert kargo_ucreti({"tip": "konteyner"}) is None, "Bilinmeyen tip: None"
''',
  hints=['Sözlük kalıbı: case {"tip": "koli", "desi": d}: — d değişkenine değer bağlanır.', 'Aynı kalıbın guard\'lı sürümü (if d <= 10) guard\'sızdan önce gelmeli.'],
  why='Sözlük kalıpları yalnızca yazılan anahtarlara bakar ve eksik anahtar varsa eşleşmez; bu sayede desisi olmayan koli hiçbir koli dalına girmez ve None döner. Guard\'lı dal önce gelir, çünkü kalıplar sırayla denenir. if/elif ile yazmak için önce paket.get("tip"), sonra "desi" in paket kontrolleri gerekir; match bu yapısal kontrolü bildirimsel (declarative) hale getirir.',
  tags=['match', 'sözlük kalıbı', 'guard', 'lojistik'], min=6),
]
