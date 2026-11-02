from common import write

DS = 'kirli_veri'
TOPIC = 'Veri seti: Kirli veri'
T = []


def add(**k):
    k.setdefault('topic', TOPIC)
    k.setdefault('ds', DS)
    T.append(k)


BAYI_TANIM = ('<p><code>bayi</code> tablosu Excel\'den gelmiş: ilk satır rapor başlığı ("Anadolu Market · Bayi satış raporu"), ikinci satır gerçek sütun adları '
              '(<code>Bayi, Şehir, Tarih, Tutar, Not</code>), sonra veri. Tutarlar Türkçe biçimde (<code>"1.250,50"</code>), şehirler karışık yazımlı, bir satır tamamen boş, bir satır yinelenmiş.</p>')

# ---------------------------------------------------------------- TEMEL
add(id='b-466', lv='temel', diff=1, kind='rehberli', title='Türkçe sayıyı çevir: "1.250,50" → 1250.5',
    q='<p><b>Finans ekibi soruyor:</b> "Bayilerden gelen Excel\'deki tutarları toplayamıyoruz; hepsi metin. Power Query\'de <i>Yerel ayarı kullanarak tür değiştir (Türkçe)</i> adımının Python karşılığı ne?"</p>'
      + BAYI_TANIM +
      '<p>1) <code>tr_sayi(metin)</code> fonksiyonunu yaz: kenar boşluklarını at; boş metin ya da <code>"-"</code> ise <code>None</code>; değilse binlik ayıracı noktaları sil, ondalık virgülü noktaya çevir, <code>float</code> döndür.<br>'
      '2) <code>ham_toplam(kayitlar)</code>: ilk iki satırı (başlık + sütun adları) atla, <code>Column4</code> değerlerini <code>tr_sayi</code> ile çevir, <code>None</code> olmayanları topla (2 ondalık). '
      'Veriyi <code>veri.kayitlar("kirli_veri", "bayi", cevir=False)</code> ile ham metin olarak oku.</p>',
    guide=['<code>metin.strip()</code> ile boşlukları at.', 'Boş ya da <code>"-"</code> ise <code>None</code> döndür.',
           'Önce noktaları sil (<code>replace(".", "")</code>), SONRA virgülü noktaya çevir; sıra önemli.', '<code>ham_toplam</code>\'da <code>kayitlar[2:]</code> üzerinde gez, None olmayanları topla.'],
    example='''
# Benzer teknik: Avrupa biçimli yüzde metnini sayıya çevirmek
def yuzde(metin):
    metin = metin.strip().rstrip("%")
    return float(metin.replace(",", ".")) / 100

print(yuzde(" 12,5% "), yuzde("3%"))
''',
    start='''
import veri

kayitlar = veri.kayitlar("kirli_veri", "bayi", cevir=False)
print(kayitlar[:3])


def tr_sayi(metin):
    metin = metin.strip()
    # TODO 1: boş ya da "-" ise None döndür
    # TODO 2: noktaları sil, virgülü noktaya çevir, float döndür
    return metin


def ham_toplam(kayitlar):
    toplam = 0.0
    for satir in kayitlar[2:]:
        deger = tr_sayi(satir["Column4"])
        # TODO 3: None değilse toplama ekle
    return round(toplam, 2)
''',
    sol='''
import veri

kayitlar = veri.kayitlar("kirli_veri", "bayi", cevir=False)


def tr_sayi(metin):
    metin = metin.strip()
    if metin in ("", "-"):
        return None
    return float(metin.replace(".", "").replace(",", "."))


def ham_toplam(kayitlar):
    toplam = 0.0
    for satir in kayitlar[2:]:
        deger = tr_sayi(satir["Column4"])
        if deger is not None:
            toplam += deger
    return round(toplam, 2)


print(ham_toplam(kayitlar))
''',
    calc={'R': 'ham_toplam(kayitlar)'},
    tests='''
assert tr_sayi("1.250,50") == 1250.5, "1.250,50 → 1250.5"
assert tr_sayi("1.430") == 1430.0, "Türkçe biçimde 1.430 bin dört yüz otuzdur, 1.43 değil"
assert tr_sayi("760,25") == 760.25, "760,25 → 760.25"
assert tr_sayi(" 980 ") == 980.0, "Boşluklu tam sayı da çevrilmeli"
assert tr_sayi("-") is None and tr_sayi("") is None, "Tire ve boş metin None olmalı"
assert tr_sayi("12.345.678,9") == 12345678.9, "Birden çok binlik ayıracı da silinmeli"
assert ham_toplam(kayitlar) == @R@, "Ham toplam tutmuyor (yinelenen satır bu adımda hâlâ içeride)"
''',
    hints=['Türkçe biçimde nokta binlik, virgül ondalık ayıracıdır.', 'Önce <code>replace(".", "")</code>, sonra <code>replace(",", ".")</code>.',
           '<code>return float(metin.replace(".", "").replace(",", "."))</code>'],
    why='Sıra kritiktir: virgülü önce noktaya çevirirsen "1.250,50" → "1.250.50" olur ve ayırt edemezsin. '
        '<code>veri.kayitlar</code>\'ın otomatik dönüşümü (cevir=True) "1.430" metnini İngilizce kurala göre 1.43 yapardı: sessiz ve bin kat yanlış bir hata. '
        'Bu yüzden kirli veride önce ham metin okunur, dönüşüm bilinçli yapılır. Gerçek işte <code>locale</code> modülü ya da pandas\'ta '
        '<code>read_csv(thousands=".", decimal=",")</code> da kullanılır.',
    tags=['Türkçe sayı', 'replace', 'Power Query'], min=6)

add(id='b-467', lv='temel', diff=1, kind='yaz', title='Başlık satırını at, ilk satırı başlık yap',
    q='<p><b>Raporlama ekibi soruyor:</b> "Excel\'den gelen dosyada sütun adları Column1, Column2... Power Query\'deki <i>Üst satırları kaldır</i> + <i>İlk satırı üst bilgi olarak kullan</i> adımlarını Python\'la yapalım."</p>'
      + BAYI_TANIM +
      '<p><code>basliklari_duzelt(kayitlar)</code> fonksiyonunu yaz (<code>veri.kayitlar("kirli_veri", "bayi", cevir=False)</code>). İlk satırı (rapor başlığı) at; ikinci satırdaki değerleri yeni sütun adları yap; '
      'kalan her satırı bu adlarla yeni bir sözlüğe çevir. <b>Tüm hücreleri boş</b> olan satırları atla. Dönüş: sözlük listesi.</p>',
    start='''
import veri

kayitlar = veri.kayitlar("kirli_veri", "bayi", cevir=False)


def basliklari_duzelt(kayitlar):
    pass
''',
    sol='''
import veri

kayitlar = veri.kayitlar("kirli_veri", "bayi", cevir=False)


def basliklari_duzelt(kayitlar):
    eski = list(kayitlar[0].keys())
    yeni = [kayitlar[1][k] for k in eski]
    sonuc = []
    for satir in kayitlar[2:]:
        degerler = [satir[k] for k in eski]
        if all(d.strip() == "" for d in degerler):
            continue
        sonuc.append(dict(zip(yeni, degerler)))
    return sonuc


temiz = basliklari_duzelt(kayitlar)
print(len(temiz), temiz[0])
''',
    calc={'N': 'len(basliklari_duzelt(kayitlar))', 'ILK': 'basliklari_duzelt(kayitlar)[0]'},
    tests='''
r = basliklari_duzelt(kayitlar)
assert list(r[0].keys()) == ["Bayi", "Şehir", "Tarih", "Tutar", "Not"], "Sütun adları ikinci satırdan gelmeli"
assert len(r) == @N@, "Rapor başlığı, sütun adı satırı ve boş satır atılınca 9 satır kalmalı"
assert r[0] == @ILK@, "İlk veri satırı tutmuyor"
assert all(any(v.strip() for v in s.values()) for s in r), "Tamamen boş satır kalmamalı"
''',
    hints=['Eski anahtarlar (<code>Column1...</code>) ilk sözlüğün <code>keys()</code>\'inde; yeni adlar <code>kayitlar[1]</code>\'in değerlerinde.',
           '<code>dict(zip(yeni_adlar, degerler))</code> iki listeden sözlük kurar.', 'Boş satır: <code>all(d.strip() == "" for d in degerler)</code>.'],
    why='Excel raporlarının üstündeki başlık/logo satırları, veri dosyasını okunmaz hâle getirir; ilk iş "gerçek başlık satırını" bulmaktır. '
        '<code>zip</code> + <code>dict</code> kalıbı sütun eşlemenin en temiz yoludur. pandas\'ta aynı iş tek satır: <code>pd.read_csv(yol, skiprows=2)</code>. '
        'Gerçek hayatta başlık satırının yeri değişebilir; o zaman "Bayi" kelimesini içeren ilk satırı arayan küçük bir döngü daha sağlamdır.',
    tags=['zip', 'başlık satırı', 'Power Query'], min=6)

add(id='b-468', lv='temel', diff=1, kind='rehberli', title='Şehir adlarını Türkçe kurallarla düzelt',
    q='<p><b>Bölge raporu hazırlayan analist soruyor:</b> "Aynı şehir <code>" istanbul "</code>, <code>"ANKARA"</code>, <code>"ankara"</code> diye üç farklı yazılmış. Power Query\'de <i>Kırp</i> + <i>Her Sözcüğün İlk Harfini Büyüt</i> yaptım ama <i>Istanbul</i> çıktı!"</p>'
      '<p><code>tr_baslik(metin)</code> fonksiyonunu yaz: kenar boşluklarını at; tümünü <b>Türkçe kurala göre</b> küçült (<code>"I"→"ı"</code>, <code>"İ"→"i"</code>, sonra <code>lower()</code>); '
      'ilk harfi Türkçe kurala göre büyüt (<code>"i"→"İ"</code>, <code>"ı"→"I"</code>, diğerleri <code>upper()</code>). '
      'Sonra <code>sehirler(kayitlar)</code>: bayi verisinin (<code>veri.kayitlar("kirli_veri", "bayi", cevir=False)</code>) <code>Column2</code> sütunundaki şehirleri ilk 2 satırı atlayarak düzelt, boşları atla, '
      'tekrarsız ve alfabetik sıralı (Python <code>sorted</code>) liste döndür.</p>',
    guide=['<code>strip()</code> ile boşlukları at; boş metinse olduğu gibi döndür.',
           'Küçültmeden ÖNCE <code>"I"</code> ve <code>"İ"</code> harflerini değiştir; Python\'un <code>lower()</code>\'ı "I"yı "i" yapar (İngilizce kural).',
           'İlk harf için küçük bir sözlük: <code>{"i": "İ", "ı": "I"}</code>; sözlükte yoksa <code>upper()</code>.',
           '<code>sehirler</code>: kümeye ekle, <code>sorted</code> ile döndür.'],
    example='''
# Benzer teknik: özel harf eşlemesiyle büyük harfe çevirme
def tr_upper(metin):
    return metin.replace("i", "İ").replace("ı", "I").upper()

print("istanbul".upper(), "|", tr_upper("istanbul"), "|", tr_upper("ırmak"))
''',
    start='''
import veri

kayitlar = veri.kayitlar("kirli_veri", "bayi", cevir=False)


def tr_baslik(metin):
    metin = metin.strip()
    if not metin:
        return metin
    # TODO 1: I → ı, İ → i dönüşümünü yap, sonra lower()
    # TODO 2: ilk harfi Türkçe kurala göre büyüt
    return metin.title()


def sehirler(kayitlar):
    kume = set()
    # TODO 3: kayitlar[2:] içindeki Column2 değerlerini düzeltip ekle (boşları atla)
    return sorted(kume)
''',
    sol='''
import veri

kayitlar = veri.kayitlar("kirli_veri", "bayi", cevir=False)


def tr_baslik(metin):
    metin = metin.strip()
    if not metin:
        return metin
    kucuk = metin.replace("I", "ı").replace("İ", "i").lower()
    ilk = {"i": "İ", "ı": "I"}.get(kucuk[0], kucuk[0].upper())
    return ilk + kucuk[1:]


def sehirler(kayitlar):
    kume = set()
    for satir in kayitlar[2:]:
        s = tr_baslik(satir["Column2"])
        if s:
            kume.add(s)
    return sorted(kume)


print(sehirler(kayitlar))
''',
    calc={'R': 'sehirler(kayitlar)'},
    tests='''
assert tr_baslik(" istanbul ") == "İstanbul", "istanbul → İstanbul (noktalı büyük İ)"
assert tr_baslik("ANKARA") == "Ankara", "ANKARA → Ankara"
assert tr_baslik("izmir  ") == "İzmir", "izmir → İzmir"
assert tr_baslik("ŞIRNAK") == "Şırnak", "ŞIRNAK → Şırnak (I küçülünce ı olur)"
assert tr_baslik("ığdır") == "Iğdır", "ığdır → Iğdır (ı büyüyünce I olur)"
assert tr_baslik("") == "", "Boş metin boş kalmalı"
assert sehirler(kayitlar) == @R@, "Düzeltilmiş tekil şehir listesi tutmuyor"
''',
    hints=['Python\'un <code>lower()</code>/<code>upper()</code>/<code>title()</code> yöntemleri Türkçe i/ı kuralını bilmez.',
           'Küçültme: <code>metin.replace("I", "ı").replace("İ", "i").lower()</code>',
           'Büyütme: <code>{"i": "İ", "ı": "I"}.get(k[0], k[0].upper()) + k[1:]</code>'],
    why='Unicode varsayılan büyük/küçük harf kuralları İngilizce temellidir: "i".upper() → "I", "I".lower() → "i". Türkçede ise i↔İ ve ı↔I eşleşir. '
        'Bu "Türk i sorunu" yazılım dünyasında ünlüdür; şehir/isim temizliğinde sessizce yanlış veri üretir. Excel ve Power Query de bölgesel ayara bakmadan aynı hatayı yapabilir. '
        'Çok sözcüklü adlar için metni boşluktan bölüp her parçaya aynı işlemi uygula. Dikkat: <code>sorted</code> Unicode kod sırasıyla sıralar, bu yüzden İstanbul ve İzmir listenin sonuna düşer; '
        'gerçek Türkçe alfabetik sıra için özel bir sıralama anahtarı (ör. harf → sıra sözlüğü) ya da <code>locale</code>/PyICU gerekir.',
    tags=['Türkçe karakter', 'lower', 'upper', 'temizlik'], min=7)

add(id='b-469', lv='temel', diff=1, kind='bug', title='Yinelenen müşteri silinmiyor',
    q='<p><b>CRM ekibi şikâyet ediyor:</b> "Müşteri listesinde 102 numaralı Mehmet Kaya hâlâ iki kez görünüyor; e-postası bir yerde büyük harfle yazılmış."</p>'
      '<p><code>musteri</code> tablosu da başlıksız gelmiş: sütunlar <code>Column1..Column4</code>, ilk satır gerçek başlık (<code>MusteriNo, Ad Soyad, E-posta, KayitTarihi</code>). '
      '<code>tekil_musteriler(kayitlar)</code> (<code>veri.kayitlar("kirli_veri", "musteri", cevir=False)</code>) her <code>MusteriNo</code>\'dan <b>ilk görüleni</b> tutarak sözlük listesi döndürmeli. '
      '<b>Hatayı bul ve düzelt.</b></p>',
    start='''
import veri

kayitlar = veri.kayitlar("kirli_veri", "musteri", cevir=False)


def tekil_musteriler(kayitlar):
    eski = list(kayitlar[0].keys())
    adlar = [kayitlar[0][k] for k in eski]
    gorulen = set()
    sonuc = []
    for satir in kayitlar[1:]:
        kayit = dict(zip(adlar, [satir[k] for k in eski]))
        anahtar = tuple(kayit.values())
        if anahtar in gorulen:
            continue
        gorulen.add(anahtar)
        sonuc.append(kayit)
    return sonuc
''',
    sol='''
import veri

kayitlar = veri.kayitlar("kirli_veri", "musteri", cevir=False)


def tekil_musteriler(kayitlar):
    eski = list(kayitlar[0].keys())
    adlar = [kayitlar[0][k] for k in eski]
    gorulen = set()
    sonuc = []
    for satir in kayitlar[1:]:
        kayit = dict(zip(adlar, [satir[k] for k in eski]))
        anahtar = kayit["MusteriNo"]
        if anahtar in gorulen:
            continue
        gorulen.add(anahtar)
        sonuc.append(kayit)
    return sonuc


for m in tekil_musteriler(kayitlar):
    print(m)
''',
    calc={'NOS': '[m["MusteriNo"] for m in tekil_musteriler(kayitlar)]', 'E102': 'tekil_musteriler(kayitlar)[1]["E-posta"]'},
    tests='''
r = tekil_musteriler(kayitlar)
assert [m["MusteriNo"] for m in r] == @NOS@, "Her müşteri numarası bir kez ve ilk görülme sırasıyla olmalı"
assert r[1]["E-posta"] == @E102@, "102 için İLK görülen kayıt tutulmalı"
assert list(r[0].keys()) == ["MusteriNo", "Ad Soyad", "E-posta", "KayitTarihi"], "Başlıklar ilk satırdan gelmeli"
''',
    hints=['İki 102 satırı tüm alanlarda aynı mı? E-postaya dikkat et.', 'Yinelenen tanımı "tüm satır aynı" değil, "aynı müşteri numarası" olmalı.',
           '<code>anahtar = kayit["MusteriNo"]</code>'],
    why='Tüm satırı anahtar yapmak yalnız birebir kopyaları yakalar; harf büyüklüğü, boşluk gibi küçük farklar yinelenen kaydı kaçırır. '
        'Yinelemeyi iş anahtarına (müşteri no, e-posta) göre tanımlamak gerekir. Power Query\'de "Yinelenenleri kaldır" seçili sütunlara göre çalışır; '
        'pandas\'ta <code>drop_duplicates(subset=["MusteriNo"], keep="first")</code>. Kalıcı çözüm, karşılaştırmadan önce alanları normalize etmektir (e-postayı küçültmek gibi).',
    tags=['yinelenen', 'set', 'iş anahtarı'], min=5)

add(id='b-470', lv='temel', diff=1, kind='tamamla', title='Aşağı doldur ve sütunu böl',
    q='<p><b>Ürün ekibi soruyor:</b> "Ürün listesinde kategori yalnız grubun ilk satırında yazıyor, kod ile ad da aynı hücrede. Power Query\'de <i>Aşağı doldur</i> ve <i>Sütunu sınırlayıcıya göre böl</i> yapıyorduk."</p>'
      '<p><code>urunleri_duzelt(kayitlar)</code> (<code>veri.kayitlar("kirli_veri", "urun", cevir=False)</code>) fonksiyonundaki <code>___</code> boşluklarını doldur. '
      'Her satır için <code>{"kategori", "kod", "ad", "fiyat"}</code> sözlüğü üret: kategori boşsa bir öncekini kullan; <code>"E01 Kablosuz Kulaklık"</code> metnini ilk boşluktan ikiye böl; fiyat tam sayı.</p>',
    start='''
import veri

kayitlar = veri.kayitlar("kirli_veri", "urun", cevir=False)


def urunleri_duzelt(kayitlar):
    sonuc = []
    son_kategori = None
    for satir in kayitlar:
        if satir["Kategori"].strip():
            son_kategori = ___
        kod, ad = satir["Ürün Kodu ve Adı"].split(" ", ___)
        sonuc.append({"kategori": son_kategori, "kod": kod, "ad": ad, "fiyat": ___(satir["Fiyat"])})
    return sonuc
''',
    sol='''
import veri

kayitlar = veri.kayitlar("kirli_veri", "urun", cevir=False)


def urunleri_duzelt(kayitlar):
    sonuc = []
    son_kategori = None
    for satir in kayitlar:
        if satir["Kategori"].strip():
            son_kategori = satir["Kategori"].strip()
        kod, ad = satir["Ürün Kodu ve Adı"].split(" ", 1)
        sonuc.append({"kategori": son_kategori, "kod": kod, "ad": ad, "fiyat": int(satir["Fiyat"])})
    return sonuc


for u in urunleri_duzelt(kayitlar):
    print(u)
''',
    calc={'R': 'urunleri_duzelt(kayitlar)'},
    tests='''
r = urunleri_duzelt(kayitlar)
assert len(r) == 9, "9 ürün"
assert r[1] == {"kategori": "Elektronik", "kod": "E02", "ad": "Akıllı Saat", "fiyat": 3499}, "Boş kategori bir önceki satırdan doldurulmalı"
assert r[2]["ad"] == "Powerbank 20000mAh", "split(\\" \\", 1) yalnız İLK boşluktan bölmeli; ad birden çok sözcük olabilir"
assert r == @R@, "Düzeltilmiş ürün listesi tutmuyor"
''',
    hints=['Son görülen kategoriyi bir değişkende tut.', '<code>split(" ", 1)</code> en fazla bir kez böler: <code>["E01", "Kablosuz Kulaklık"]</code>.',
           '<code>satir["Kategori"].strip()</code>, <code>1</code>, <code>int</code>'],
    why='Aşağı doldurma (fill down), birleştirilmiş hücreli Excel raporlarının klasik sorunudur; çözüm "son görülen değeri" taşımaktır. pandas\'ta <code>df["Kategori"].replace("", None).ffill()</code>. '
        '<code>split(" ", 1)</code>\'deki ikinci argüman (maxsplit) adın içindeki boşlukları korur; maxsplit olmadan "Kablosuz Kulaklık" ikiye bölünür ve iki değişkene açma ValueError verir.',
    tags=['fill down', 'split', 'maxsplit'], min=4)

# ---------------------------------------------------------------- ORTA
add(id='b-471', lv='orta', diff=2, kind='rehberli', needs=['pandas'], title='Bayi raporunu pandas ile temizle',
    q='<p><b>Finans ekibi soruyor:</b> "Bayi Excel\'ini her ay elle düzeltiyoruz. pandas ile tek fonksiyonda temiz tabloya çevirebilir misin?"</p>' + BAYI_TANIM +
      '<p><code>bayi_oku()</code> fonksiyonunu yaz: <code>veri.oku("kirli_veri", "bayi", skiprows=2, dtype=str)</code> ile oku (ilk iki satır atlanır, gerçek başlıklar gelir; her şey metin), '
      'tamamen boş satırları ve birebir yinelenen satırları at, <code>Tutar</code> sütununu Türkçe biçimden sayıya çevir (<code>"-"</code> → NaN), index\'i sıfırla. Diğer sütunlara dokunma.</p>',
    guide=['<code>veri.oku(..., skiprows=2, dtype=str)</code>; <code>dtype=str</code> pandas\'ın "1.430"\'u 1.43 sanmasını önler.',
           '<code>dropna(how="all")</code> ve <code>drop_duplicates()</code>.',
           'Tutar: <code>.str.replace(".", "", regex=False).str.replace(",", ".", regex=False)</code>, sonra <code>pd.to_numeric(..., errors="coerce")</code>.',
           '<code>reset_index(drop=True)</code> ile döndür.'],
    example='''
import pandas as pd
# Benzer teknik: metin sütununu temizleyip sayıya çevirmek (çevrilemeyen → NaN)
s = pd.Series(["12,5", "yok", "7"])
print(pd.to_numeric(s.str.replace(",", ".", regex=False), errors="coerce"))
''',
    start='''
import veri
import pandas as pd


def bayi_oku():
    df = veri.oku("kirli_veri", "bayi", skiprows=2, dtype=str)
    # TODO 1: tamamen boş satırları ve yinelenenleri at
    # TODO 2: Tutar'ı Türkçe biçimden sayıya çevir ("-" → NaN)
    # TODO 3: index'i sıfırla
    return df
''',
    sol='''
import veri
import pandas as pd


def bayi_oku():
    df = veri.oku("kirli_veri", "bayi", skiprows=2, dtype=str)
    df = df.dropna(how="all").drop_duplicates()
    temiz = df["Tutar"].str.replace(".", "", regex=False).str.replace(",", ".", regex=False)
    df["Tutar"] = pd.to_numeric(temiz, errors="coerce")
    return df.reset_index(drop=True)


print(bayi_oku())
''',
    calc={'N': 'len(bayi_oku())', 'TOP': 'round(float(bayi_oku()["Tutar"].sum()), 2)', 'NA': 'int(bayi_oku()["Tutar"].isna().sum())'},
    tests='''
df = bayi_oku()
assert list(df.columns) == ["Bayi", "Şehir", "Tarih", "Tutar", "Not"], "Başlıklar 3. satırdan gelmeli (skiprows=2)"
assert len(df) == @N@, "Boş satır ve yinelenen Merkez Bayi satırı atılınca 8 satır kalmalı"
assert pd.api.types.is_float_dtype(df["Tutar"]), "Tutar sayısal (float) olmalı"
assert abs(df["Tutar"].sum() - @TOP@) < 0.01, "Tutar toplamı tutmuyor: 1.430 → 1430 olmalı"
assert df["Tutar"].isna().sum() == @NA@, "Yalnız \\"-\\" olan tutar NaN olmalı"
assert list(df.index) == list(range(len(df))), "index 0\\'dan ardışık olmalı"
''',
    hints=['Boş satır: <code>dropna(how="all")</code>; birebir kopya: <code>drop_duplicates()</code>.',
           '<code>regex=False</code> önemli: regex\'te "." her karakter demektir.',
           '<code>pd.to_numeric(temiz, errors="coerce")</code> çevrilemeyen "-" değerini NaN yapar.'],
    why='<code>dtype=str</code> olmadan pandas karışık sütunu bazen sayıya çevirmeye çalışır ve Türkçe "1.430"u 1.43 okur. Önce metin olarak almak, dönüşümü senin kontrolüne bırakır. '
        '<code>str.replace(".", "")</code> çağrısında <code>regex=False</code> yazmazsan (eski pandas sürümlerinde varsayılan regex=True idi) nokta "her karakter" anlamına gelir ve tüm metni siler. '
        'Alternatif: <code>pd.read_csv(yol, skiprows=2, thousands=".", decimal=",")</code>; ama "-" gibi değerler sütunu yine metin bırakır.',
    tags=['read_csv', 'to_numeric', 'dropna', 'drop_duplicates'], min=8)

add(id='b-472', lv='orta', diff=2, kind='yaz', needs=['pandas'], title='Gün.Ay.Yıl tarihlerini çevir',
    q='<p><b>Raporlama ekibi soruyor:</b> "Bayi tarihleri <code>05.01.2024</code> biçiminde ve bir satırda <i>bilinmiyor</i> yazıyor. Kaç tarih bozuk, rapor hangi tarih aralığını kapsıyor?"</p>'
      '<p><code>tarih_ozeti(df)</code> fonksiyonunu yaz. <code>df</code>, <code>veri.oku("kirli_veri", "bayi", skiprows=2, dtype=str).dropna(how="all")</code> ile gelir. '
      '<code>Tarih</code> sütununu <code>format="%d.%m.%Y"</code> ve <code>errors="coerce"</code> ile çevir. '
      'Dönüş: <code>(gecersiz_sayisi, en_erken, en_gec)</code>; tarihler <code>"YYYY-MM-DD"</code> metni.</p>',
    start='''
import veri
import pandas as pd

df = veri.oku("kirli_veri", "bayi", skiprows=2, dtype=str).dropna(how="all")


def tarih_ozeti(df):
    pass
''',
    sol='''
import veri
import pandas as pd

df = veri.oku("kirli_veri", "bayi", skiprows=2, dtype=str).dropna(how="all")


def tarih_ozeti(df):
    t = pd.to_datetime(df["Tarih"], format="%d.%m.%Y", errors="coerce")
    gecersiz = int(t.isna().sum())
    return gecersiz, t.min().strftime("%Y-%m-%d"), t.max().strftime("%Y-%m-%d")


print(tarih_ozeti(df))
''',
    calc={'R': 'tarih_ozeti(df)'},
    tests='''
r = tarih_ozeti(df)
assert r == @R@, "Geçersiz sayısı ya da tarih aralığı tutmuyor"
assert r[1] == "2024-01-05", "05.01.2024 gün.ay.yıl → 5 Ocak (1 Mayıs değil!)"
k = pd.DataFrame({"Tarih": ["01.02.2024", "31.12.2023", "2024/01/01"]})
assert tarih_ozeti(k) == (1, "2023-12-31", "2024-02-01"), "Biçime uymayan metin geçersiz sayılmalı"
''',
    hints=['Biçimi açıkça ver: <code>format="%d.%m.%Y"</code>.', '<code>errors="coerce"</code> çevrilemeyeni NaT yapar; <code>isna().sum()</code> ile say.',
           'Metne çevirmek için <code>t.min().strftime("%Y-%m-%d")</code>.'],
    why='Biçim vermeden <code>pd.to_datetime</code> tarihi tahmin etmeye çalışır; "05.01.2024" için ay.gün (ABD) yorumu seçip 1 Mayıs üretebilir. '
        '<code>format</code> hem doğruluk hem hız sağlar. <code>errors="coerce"</code> bozuk değerleri NaT yapar; hata fırlatmak yerine sayıp raporlamak veri kalitesi işinin parçasıdır. '
        'Power Query\'deki "Yerel ayarı kullanarak tür değiştir (Türkçe)" adımının karşılığıdır. NaT değerleri <code>min</code>/<code>max</code>\'ta atlanır.',
    tags=['to_datetime', 'format', 'NaT'], min=6)

add(id='b-473', lv='orta', diff=2, kind='rehberli', needs=['pandas'], title='Hedef tablosunu özetten çöz (unpivot)',
    q='<p><b>Planlama ekibi soruyor:</b> "Hedefler aylar sütun olacak şekilde (geniş) gelmiş; Power BI\'da <i>Diğer sütunları özetten çıkar</i> yapıyorduk. Python\'la uzun biçime çevirelim."</p>'
      '<p><code>hedef</code> tablosu: <code>Kategori, Oca, Şub, Mar</code> (Giyim\'in Mart hedefi boş). <code>hedef_uzun(hedef)</code> fonksiyonunu yaz (<code>veri.oku("kirli_veri", "hedef")</code>):</p>'
      '<ul><li><code>melt</code> ile <code>Kategori, Ay, Hedef</code> sütunlarına çevir</li><li>Hedefi boş satırları at</li>'
      '<li><code>AyNo</code> sütunu ekle (<code>Oca</code>→1, <code>Şub</code>→2, <code>Mar</code>→3) ve <code>Hedef</code>\'i tam sayı yap</li>'
      '<li><code>Kategori, AyNo</code>\'ya göre sırala, index\'i sıfırla</li></ul>',
    guide=['<code>hedef.melt(id_vars="Kategori", var_name="Ay", value_name="Hedef")</code>', '<code>dropna(subset=["Hedef"])</code>',
           '<code>map({"Oca": 1, "Şub": 2, "Mar": 3})</code> ile AyNo; <code>astype(int)</code>.', '<code>sort_values(["Kategori", "AyNo"]).reset_index(drop=True)</code>'],
    example='''
import pandas as pd
# Benzer teknik: geniş → uzun (melt)
genis = pd.DataFrame({"magaza": ["A", "B"], "Pzt": [5, 7], "Sal": [6, None]})
uzun = genis.melt(id_vars="magaza", var_name="gun", value_name="adet").dropna()
print(uzun)
''',
    start='''
import veri
import pandas as pd

hedef = veri.oku("kirli_veri", "hedef")


def hedef_uzun(hedef):
    uzun = hedef.melt(id_vars="Kategori", var_name="Ay", value_name="Hedef")
    # TODO 1: boş hedefleri at
    # TODO 2: AyNo ekle, Hedef'i int yap
    # TODO 3: sırala ve index'i sıfırla
    return uzun
''',
    sol='''
import veri
import pandas as pd

hedef = veri.oku("kirli_veri", "hedef")


def hedef_uzun(hedef):
    uzun = hedef.melt(id_vars="Kategori", var_name="Ay", value_name="Hedef")
    uzun = uzun.dropna(subset=["Hedef"]).copy()
    uzun["AyNo"] = uzun["Ay"].map({"Oca": 1, "Şub": 2, "Mar": 3})
    uzun["Hedef"] = uzun["Hedef"].astype(int)
    return uzun.sort_values(["Kategori", "AyNo"]).reset_index(drop=True)


print(hedef_uzun(hedef))
''',
    calc={'N': 'len(hedef_uzun(hedef))', 'AY': 'hedef_uzun(hedef).groupby("AyNo")["Hedef"].sum().to_dict()',
          'ILK': '[x.item() if hasattr(x, "item") else x for x in hedef_uzun(hedef).iloc[0].tolist()]'},
    tests='''
r = hedef_uzun(hedef)
assert list(r.columns) == ["Kategori", "Ay", "Hedef", "AyNo"], "Sütunlar: Kategori, Ay, Hedef, AyNo"
assert len(r) == @N@, "4 kategori × 3 ay = 12, boş Giyim/Mar atılınca 11"
assert r.groupby("AyNo")["Hedef"].sum().to_dict() == @AY@, "Aylık toplam hedefler tutmuyor"
assert r.iloc[0].tolist() == @ILK@, "İlk satır (alfabetik ilk kategori, 1. ay) tutmuyor"
assert pd.api.types.is_integer_dtype(r["Hedef"]), "Hedef tam sayı olmalı"
''',
    hints=['Geniş → uzun dönüşümü <code>melt</code>.', 'Boş hücre melt sonrası NaN satır olur; <code>dropna(subset=["Hedef"])</code>.',
           'Boş hücre yüzünden sütun float okunur; NaN\'ı attıktan sonra <code>astype(int)</code> güvenlidir.'],
    why='Analiz ve modelleme için veri "uzun" (tidy) biçimde olmalı: her satır bir gözlem (kategori × ay). Geniş biçimde yeni bir ay eklemek yeni sütun demektir ve tüm formülleri bozar. '
        '<code>melt</code> Power Query\'deki "Özetten çıkar" (unpivot) ile aynıdır; tersi <code>pivot</code>\'tur. Boş bir hücre tüm sütunu float yapar (NaN float\'tır); '
        'NaN atılmadan <code>astype(int)</code> hata verir.',
    tags=['melt', 'unpivot', 'tidy veri'], min=7)

add(id='b-474', lv='orta', diff=2, kind='yaz', needs=['pandas'], title='Eksik hedefi satır ortalamasıyla doldur',
    q='<p><b>Planlama ekibi soruyor:</b> "Giyim\'in Mart hedefi boş gelmiş. Şimdilik o kategorinin diğer aylarının ortalamasını yazalım; kaynağa da hangi hücreyi doldurduğumuzu not edelim."</p>'
      '<p><code>hedef_doldur(hedef)</code> fonksiyonunu yaz (<code>veri.oku("kirli_veri", "hedef")</code>). Her boş ay hücresini o satırın (kategorinin) dolu aylarının ortalamasıyla doldur, '
      'tüm ay sütunlarını tam sayı yap. Ayrıca <code>dolduruldu</code> adlı bir sütun ekle: o satırda en az bir hücre doldurulduysa <code>True</code>. '
      'Orijinal DataFrame değişmesin. Dönüş: yeni DataFrame.</p>',
    start='''
import veri
import pandas as pd

hedef = veri.oku("kirli_veri", "hedef")


def hedef_doldur(hedef):
    pass
''',
    sol='''
import veri
import pandas as pd

hedef = veri.oku("kirli_veri", "hedef")


def hedef_doldur(hedef):
    df = hedef.copy()
    aylar = ["Oca", "Şub", "Mar"]
    df["dolduruldu"] = df[aylar].isna().any(axis=1)
    ortalama = df[aylar].mean(axis=1)
    for ay in aylar:
        df[ay] = df[ay].fillna(ortalama).astype(int)
    return df


print(hedef_doldur(hedef))
''',
    calc={'R': 'hedef_doldur(hedef).to_dict("list")'},
    tests='''
r = hedef_doldur(hedef)
g = r[r["Kategori"] == "Giyim"].iloc[0]
assert g["Mar"] == 20250, "Giyim Mart = (21000 + 19500) / 2 = 20250"
assert r["dolduruldu"].tolist() == [False, False, True, False], "Yalnız Giyim satırı doldurulmuş olarak işaretlenmeli"
assert r.to_dict("list") == @R@, "Doldurulmuş tablo tutmuyor"
assert hedef["Mar"].isna().sum() == 1, "Orijinal DataFrame değişmemeli (copy kullan)"
''',
    hints=['Satır ortalaması: <code>df[aylar].mean(axis=1)</code> (NaN\'ları atlar).', '<code>fillna</code> bir Series alırsa index\'e göre hizalayarak doldurur.',
           'İşaret sütununu doldurmadan ÖNCE hesapla: <code>df[aylar].isna().any(axis=1)</code>.'],
    why='<code>fillna(Series)</code> her satırı kendi değeriyle doldurur; satır ortalaması <code>axis=1</code> ile alınır. Doldurma bir varsayımdır; '
        '<code>dolduruldu</code> gibi bir bayrak tutmak, sonradan raporda tahmini değerleri ayırt etmeyi sağlar (veri soy kütüğü). '
        'Alternatifler: önceki ayla doldurmak (<code>ffill(axis=1)</code> → 19500), 0 yazmak (hedefi yok saymak) ya da boş bırakmak; doğru seçim iş kuralına bağlıdır. '
        '<code>copy()</code> olmadan çağıranın tablosunu değiştirirsin; yan etkisiz fonksiyon yazmak iyi alışkanlıktır.',
    tags=['fillna', 'axis=1', 'eksik veri'], min=6)

add(id='b-475', lv='orta', diff=2, kind='bug', needs=['pandas'], title='Başlık satırı veriye karışmış',
    q='<p><b>Analist soruyor:</b> "Müşteri tablosunu okuyup ilk satırı başlık yaptım ama müşteri sayısı bir fazla çıkıyor ve <code>MusteriNo</code> sütununda <i>MusteriNo</i> diye bir değer var!"</p>'
      '<p><code>musteri_oku()</code>, <code>veri.oku("kirli_veri", "musteri", dtype=str)</code> ile okuyup ilk satırı başlık yapmalı ve <b>yalnız veri satırlarını</b> döndürmeli (index 0\'dan). '
      '<b>Hatayı bul ve düzelt.</b></p>',
    start='''
import veri
import pandas as pd


def musteri_oku():
    df = veri.oku("kirli_veri", "musteri", dtype=str)
    df.columns = df.iloc[0]
    return df
''',
    sol='''
import veri
import pandas as pd


def musteri_oku():
    df = veri.oku("kirli_veri", "musteri", dtype=str)
    df.columns = df.iloc[0]
    df = df.iloc[1:].reset_index(drop=True)
    df.columns.name = None
    return df


print(musteri_oku())
''',
    calc={'N': 'len(musteri_oku())', 'ILK': 'musteri_oku().iloc[0].tolist()'},
    tests='''
df = musteri_oku()
assert list(df.columns) == ["MusteriNo", "Ad Soyad", "E-posta", "KayitTarihi"], "Sütun adları ilk satırdan gelmeli"
assert "MusteriNo" not in df["MusteriNo"].tolist(), "Başlık satırı veride kalmamalı"
assert len(df) == @N@, "6 veri satırı olmalı (yinelenen henüz atılmadı)"
assert df.iloc[0].tolist() == @ILK@, "İlk veri satırı 101 numaralı müşteri olmalı"
assert list(df.index) == list(range(len(df))), "index 0\\'dan başlamalı"
''',
    hints=['Başlık olarak kullandığın satır hâlâ DataFrame\'in içinde mi?', 'İlk satırı at: <code>df.iloc[1:]</code>.',
           '<code>df = df.iloc[1:].reset_index(drop=True)</code>'],
    why='<code>df.columns = df.iloc[0]</code> yalnız sütun adlarını değiştirir; satır yerinde kalır ve veri gibi sayılır. Power Query\'deki "İlk satırı üst bilgi olarak kullan" adımı '
        'ikisini birden yapar. Daha kısa yol: <code>veri.oku("kirli_veri", "musteri", skiprows=1, dtype=str)</code> (dosyadaki Column1.. satırını atlar, ikinci satırı başlık alır). '
        '<code>columns.name = None</code> ise iloc\'tan gelen satır adını (0) sütun başlığından temizler; yazdırırken kafa karıştırmaz.',
    tags=['başlık satırı', 'iloc', 'reset_index'], min=4)

add(id='b-476', lv='orta', diff=2, kind='rehberli', needs=['pandas'], title='Müşteri tablosunu normalize et',
    q='<p><b>CRM ekibi soruyor:</b> "Müşteri listesini sisteme yüklemeden önce temizleyelim: e-postalar küçük harf, tarihler gerçek tarih, yinelenenler gitsin, sorunlu kayıtları da görelim."</p>'
      '<p><code>musteri_temizle()</code> fonksiyonunu yaz. Ham veri: <code>veri.oku("kirli_veri", "musteri", skiprows=1, dtype=str)</code> (ilk satır atlanınca gerçek başlıklar gelir). Adımlar:</p>'
      '<ul><li><code>MusteriNo</code> → int</li><li><code>E-posta</code>: kenar boşluğu at, küçük harfe çevir (boş kalabilir, NaN)</li>'
      '<li><code>KayitTarihi</code>: <code>format="%Y-%m-%d"</code>, <code>errors="coerce"</code> (2024-02-30 gibi imkânsız tarih → NaT)</li>'
      '<li><code>MusteriNo</code>\'ya göre yinelenenleri at (ilkini tut), index\'i sıfırla</li></ul>'
      '<p>Dönüş: <code>(temiz_df, sorunlu)</code>; <code>sorunlu</code>, e-postası boş <b>ya da</b> tarihi NaT olan müşterilerin <code>MusteriNo</code> listesi (artan).</p>',
    guide=['Okuduktan sonra tür dönüşümlerini yap: <code>astype(int)</code>, <code>str.strip().str.lower()</code>, <code>pd.to_datetime(...)</code>.',
           'E-postayı küçülttükten SONRA yinelenenleri at; böylece iş anahtarı tutarlı olur.',
           '<code>drop_duplicates(subset="MusteriNo", keep="first")</code>', 'Sorunlu: <code>df["E-posta"].isna() | df["KayitTarihi"].isna()</code>.'],
    example='''
import pandas as pd
# Benzer teknik: metin normalize + koşullu satır seçimi
df = pd.DataFrame({"kod": ["A1", "a1 ", None], "tarih": ["2024-01-01", "2024-13-01", "2024-02-02"]})
df["kod"] = df["kod"].str.strip().str.upper()
df["tarih"] = pd.to_datetime(df["tarih"], format="%Y-%m-%d", errors="coerce")
print(df, df[df["kod"].isna() | df["tarih"].isna()].index.tolist())
''',
    start='''
import veri
import pandas as pd


def musteri_temizle():
    df = veri.oku("kirli_veri", "musteri", skiprows=1, dtype=str)
    # TODO 1: MusteriNo int, E-posta strip+lower, KayitTarihi tarih (coerce)
    # TODO 2: MusteriNo'ya göre yinelenenleri at, index sıfırla
    # TODO 3: e-postası boş ya da tarihi NaT olanların listesi
    sorunlu = []
    return df, sorunlu
''',
    sol='''
import veri
import pandas as pd


def musteri_temizle():
    df = veri.oku("kirli_veri", "musteri", skiprows=1, dtype=str)
    df["MusteriNo"] = df["MusteriNo"].astype(int)
    df["E-posta"] = df["E-posta"].str.strip().str.lower()
    df["KayitTarihi"] = pd.to_datetime(df["KayitTarihi"], format="%Y-%m-%d", errors="coerce")
    df = df.drop_duplicates(subset="MusteriNo", keep="first").reset_index(drop=True)
    maske = df["E-posta"].isna() | df["KayitTarihi"].isna()
    sorunlu = sorted(df.loc[maske, "MusteriNo"].tolist())
    return df, sorunlu


temiz, sorunlu = musteri_temizle()
print(temiz)
print("Sorunlu:", sorunlu)
''',
    calc={'N': 'len(musteri_temizle()[0])', 'S': 'musteri_temizle()[1]', 'E': 'musteri_temizle()[0]["E-posta"].dropna().tolist()'},
    tests='''
df, sorunlu = musteri_temizle()
assert len(df) == @N@, "102 bir kez kalmalı → 5 müşteri"
assert df["MusteriNo"].tolist() == [101, 102, 103, 104, 105], "MusteriNo tam sayı ve sırası korunmuş olmalı"
assert df["E-posta"].dropna().tolist() == @E@, "E-postalar küçük harfe çevrilmeli"
assert pd.api.types.is_datetime64_any_dtype(df["KayitTarihi"]), "KayitTarihi tarih türünde olmalı"
assert sorunlu == @S@, "104 (e-posta yok) ve 105 (30 Şubat) sorunlu olmalı"
''',
    hints=['Önce dönüşümler, sonra yinelenen silme, en son sorun raporu.', 'İmkânsız tarih için <code>errors="coerce"</code>; NaT olur.',
           'Sorunlular: <code>df.loc[maske, "MusteriNo"].tolist()</code>'],
    why='Temizlik adımlarının sırası sonucu değiştirir: e-posta küçültülmeden e-postaya göre yineleme aranırsa "MEHMET.KAYA@" ile "mehmet.kaya@" farklı görünür. '
        'Burada anahtar MusteriNo olduğu için sıra sorun yaratmasa da alışkanlık olarak önce normalize et, sonra karşılaştır. '
        'Sorunlu kayıtları silmek yerine listelemek, veri sahibine geri bildirim vermeyi sağlar; Power Query\'deki "Hataları tut" adımına benzer. '
        '<code>to_datetime(errors="coerce")</code> 30 Şubat gibi takvimde olmayan tarihleri de yakalar.',
    tags=['normalize', 'to_datetime', 'drop_duplicates', 'veri kalitesi'], min=9)

add(id='b-477', lv='orta', diff=2, kind='yaz', needs=['pandas'], title='Sütun kalitesi raporu',
    q='<p><b>Veri yönetişimi ekibi soruyor:</b> "Power Query\'deki <i>Sütun kalitesi</i> paneline benzer bir özet istiyoruz: dosyada kaç sorun var?"</p>'
      '<p><code>kalite_raporu(df)</code> fonksiyonunu yaz. <code>df</code> = <code>veri.oku("kirli_veri", "bayi", skiprows=2, dtype=str)</code> (hiçbir temizlik yapılmamış). Şu sözlüğü döndür:</p>'
      '<ul><li><code>satir</code>: toplam satır</li><li><code>bos_satir</code>: tüm hücreleri boş satır sayısı</li>'
      '<li><code>yinelenen</code>: boş olmayan satırlar arasında birebir kopya sayısı (ilk görülen sayılmaz)</li>'
      '<li><code>gecersiz_tarih</code>: <code>Tarih</code>\'i dolu ama <code>%d.%m.%Y</code> biçiminde çevrilemeyen</li>'
      '<li><code>gecersiz_tutar</code>: <code>Tutar</code>\'ı dolu ama Türkçe sayıya çevrilemeyen</li></ul>',
    start='''
import veri
import pandas as pd

df = veri.oku("kirli_veri", "bayi", skiprows=2, dtype=str)


def kalite_raporu(df):
    pass
''',
    sol='''
import veri
import pandas as pd

df = veri.oku("kirli_veri", "bayi", skiprows=2, dtype=str)


def kalite_raporu(df):
    bos = df.isna().all(axis=1)
    dolu = df[~bos]
    tarih = pd.to_datetime(dolu["Tarih"], format="%d.%m.%Y", errors="coerce")
    sayi = pd.to_numeric(dolu["Tutar"].str.replace(".", "", regex=False).str.replace(",", ".", regex=False), errors="coerce")
    return {
        "satir": len(df),
        "bos_satir": int(bos.sum()),
        "yinelenen": int(dolu.duplicated().sum()),
        "gecersiz_tarih": int((dolu["Tarih"].notna() & tarih.isna()).sum()),
        "gecersiz_tutar": int((dolu["Tutar"].notna() & sayi.isna()).sum()),
    }


print(kalite_raporu(df))
''',
    calc={'R': 'kalite_raporu(df)'},
    tests='''
r = kalite_raporu(df)
assert r == @R@, "Kalite raporu tutmuyor"
k = pd.DataFrame({"Bayi": ["A", "A", None, "B"], "Tarih": ["01.01.2024", "01.01.2024", None, None], "Tutar": ["5", "5", None, "x"]})
assert kalite_raporu(k) == {"satir": 4, "bos_satir": 1, "yinelenen": 1, "gecersiz_tarih": 0, "gecersiz_tutar": 1}, "Boş tarih geçersiz sayılmaz; yalnız dolu ama çevrilemeyenler"
''',
    hints=['Boş satır: <code>df.isna().all(axis=1)</code>.', '"Dolu ama çevrilemeyen" = <code>orijinal.notna() &amp; cevrilmis.isna()</code>.',
           'Yinelenen: <code>dolu.duplicated().sum()</code> (ilk görüleni saymaz).'],
    why='"Geçersiz" ile "eksik" farklı sorunlardır: boş hücre veri girilmemiş demektir, "bilinmiyor" ise yanlış biçimde girilmiş veridir; düzeltme yolları da farklıdır. '
        '<code>notna() &amp; isna()</code> kalıbı bu ayrımı yapar. <code>duplicated()</code> ilk görüleni False sayar; tüm kopyaları görmek için <code>keep=False</code>. '
        'Böyle bir raporu her yüklemede çalıştırmak (veri sözleşmesi testi), sorunları panoya ulaşmadan yakalar.',
    tags=['veri kalitesi', 'duplicated', 'isna'], min=8)

# ---------------------------------------------------------------- İLERİ
add(id='b-478', lv='ileri', diff=3, kind='rehberli', needs=['pandas'], title='Uçtan uca bayi temizleme hattı',
    q='<p><b>Finans direktörü soruyor:</b> "Bayi raporunu her ay temizleyip şehir bazında toplayan, tekrar kullanılabilir tek bir fonksiyon istiyorum."</p>' + BAYI_TANIM +
      '<p><code>bayi_hatti()</code> fonksiyonunu yaz; <code>(temiz, sehir_ozeti)</code> döndürsün:</p>'
      '<ul><li><code>temiz</code>: <code>veri.oku("kirli_veri", "bayi", skiprows=2, dtype=str)</code>; boş ve yinelenen satırlar atılmış; <code>Şehir</code> hazır verilen <code>tr_baslik</code> ile düzeltilmiş; '
      '<code>Tarih</code> datetime (<code>%d.%m.%Y</code>, coerce); <code>Tutar</code> float (Türkçe biçim, coerce); <code>Not</code> sütunu atılmış; index sıfırlanmış.</li>'
      '<li><code>sehir_ozeti</code>: <code>temiz</code>\'den şehir başına <code>Tutar</code> toplamı (NaN atlanır), azalan, 2 ondalık Series.</li></ul>',
    guide=['Oku, <code>dropna(how="all")</code>, <code>drop_duplicates()</code>.',
           '<code>Şehir</code>: <code>.map(tr_baslik)</code> (her hücreye Python fonksiyonu uygular).',
           '<code>Tarih</code> ve <code>Tutar</code> dönüşümleri; <code>drop(columns="Not")</code>; <code>reset_index(drop=True)</code>.',
           'Özet: <code>groupby("Şehir")["Tutar"].sum().sort_values(ascending=False).round(2)</code>.'],
    example='''
import pandas as pd
# Benzer teknik: bir Python fonksiyonunu sütuna uygulamak ve zincirleme temizlik
def kisalt(s):
    return s.strip()[:3].upper()

df = pd.DataFrame({"ulke": [" türkiye", "Almanya ", " türkiye"], "adet": ["1", "2", "3"]})
df = df.assign(ulke=df["ulke"].map(kisalt), adet=pd.to_numeric(df["adet"]))
print(df.groupby("ulke")["adet"].sum())
''',
    start='''
import veri
import pandas as pd


def tr_baslik(metin):
    metin = str(metin).strip()
    kucuk = metin.replace("I", "ı").replace("İ", "i").lower()
    return {"i": "İ", "ı": "I"}.get(kucuk[:1], kucuk[:1].upper()) + kucuk[1:]


def bayi_hatti():
    df = veri.oku("kirli_veri", "bayi", skiprows=2, dtype=str)
    # TODO 1: boş ve yinelenen satırları at
    # TODO 2: Şehir'i tr_baslik ile düzelt
    # TODO 3: Tarih ve Tutar dönüşümleri, Not sütununu at, index sıfırla
    # TODO 4: şehir özeti
    sehir_ozeti = None
    return df, sehir_ozeti
''',
    sol='''
import veri
import pandas as pd


def tr_baslik(metin):
    metin = str(metin).strip()
    kucuk = metin.replace("I", "ı").replace("İ", "i").lower()
    return {"i": "İ", "ı": "I"}.get(kucuk[:1], kucuk[:1].upper()) + kucuk[1:]


def bayi_hatti():
    df = veri.oku("kirli_veri", "bayi", skiprows=2, dtype=str)
    df = df.dropna(how="all").drop_duplicates().copy()
    df["Şehir"] = df["Şehir"].map(tr_baslik)
    df["Tarih"] = pd.to_datetime(df["Tarih"], format="%d.%m.%Y", errors="coerce")
    tutar = df["Tutar"].str.replace(".", "", regex=False).str.replace(",", ".", regex=False)
    df["Tutar"] = pd.to_numeric(tutar, errors="coerce")
    df = df.drop(columns="Not").reset_index(drop=True)
    sehir_ozeti = df.groupby("Şehir")["Tutar"].sum().sort_values(ascending=False).round(2)
    return df, sehir_ozeti


temiz, ozet = bayi_hatti()
print(temiz)
print(ozet)
''',
    calc={'OZ': 'bayi_hatti()[1].to_dict()', 'N': 'len(bayi_hatti()[0])', 'IDX0': 'bayi_hatti()[1].index[0]'},
    tests='''
temiz, ozet = bayi_hatti()
assert list(temiz.columns) == ["Bayi", "Şehir", "Tarih", "Tutar"], "Not sütunu atılmış olmalı"
assert len(temiz) == @N@, "Boş ve yinelenen satırlar atılmalı"
assert pd.api.types.is_datetime64_any_dtype(temiz["Tarih"]) and pd.api.types.is_float_dtype(temiz["Tutar"]), "Tarih datetime, Tutar float olmalı"
assert "İstanbul" in temiz["Şehir"].tolist() and "Istanbul" not in temiz["Şehir"].tolist(), "Şehirler Türkçe kurala göre düzeltilmeli"
assert ozet is not None and ozet.index[0] == @IDX0@, "En yüksek tutarlı şehir en üstte"
assert ozet.to_dict() == @OZ@, "Şehir özeti tutmuyor: ankara ve ANKARA tek şehirde toplanmalı"
''',
    hints=['Satır işlemleri (boş/yinelenen) önce, sütun dönüşümleri sonra.', '<code>df["Şehir"].map(tr_baslik)</code>',
           'Özet: <code>df.groupby("Şehir")["Tutar"].sum().sort_values(ascending=False).round(2)</code>'],
    why='Temizlik hattını tek fonksiyonda toplamak, Power Query\'deki "Uygulanan adımlar" listesinin kod karşılığıdır: her ay aynı adımlar aynı sırayla, elle müdahalesiz çalışır. '
        'Şehir düzeltilmeden gruplanırsa "ankara" ve "ANKARA" iki ayrı şehir olur ve toplamlar bölünür. '
        '<code>sum()</code> NaN\'ları atlar; bu yüzden Alsancak (tutar "-") özetin içinde 0 ile görünür; bunu bilerek raporla.',
    tags=['pipeline', 'map', 'groupby', 'ETL'], min=12)

add(id='b-479', lv='ileri', diff=3, kind='yaz', needs=['pandas'], title='Uygulanan adımlar günlüğü',
    q='<p><b>Denetim ekibi soruyor:</b> "Temizlikte hangi adımda kaç satır kaybettiğimizi görmek istiyoruz; Power Query\'deki <i>Uygulanan adımlar</i> gibi bir günlük olsun."</p>'
      '<p><code>adim_gunlugu(df, adimlar)</code> fonksiyonunu yaz: <code>adimlar</code>, <code>(ad, fonksiyon)</code> demetlerinden oluşan bir liste; her fonksiyon DataFrame alıp DataFrame döndürür. '
      'Fonksiyonları sırayla uygula (her biri bir öncekinin sonucunu alır). Dönüş: <code>(son_df, gunluk)</code>; <code>gunluk</code> = '
      '<code>[("Kaynak", satir), (ad1, satir), ...]</code>.</p>'
      '<p>Ardından şu adımları tanımla ve <code>veri.oku("kirli_veri", "bayi", skiprows=2, dtype=str)</code> üzerinde çalıştır (sonucu <code>sonuc, gunluk</code> değişkenlerine ata):</p>'
      '<ol><li><code>"Boş satırları kaldır"</code></li><li><code>"Yinelenenleri kaldır"</code></li>'
      '<li><code>"Geçersiz tarihleri kaldır"</code> (<code>%d.%m.%Y</code> ile çevrilemeyen)</li><li><code>"Tutarı olmayanları kaldır"</code> (Türkçe sayıya çevrilemeyen)</li></ol>',
    start='''
import veri
import pandas as pd

ham = veri.oku("kirli_veri", "bayi", skiprows=2, dtype=str)


def adim_gunlugu(df, adimlar):
    pass


# adımları tanımla, çalıştır: sonuc, gunluk = adim_gunlugu(ham, ADIMLAR)
''',
    sol='''
import veri
import pandas as pd

ham = veri.oku("kirli_veri", "bayi", skiprows=2, dtype=str)


def adim_gunlugu(df, adimlar):
    gunluk = [("Kaynak", len(df))]
    for ad, fonk in adimlar:
        df = fonk(df)
        gunluk.append((ad, len(df)))
    return df, gunluk


def tarih_gecerli(df):
    t = pd.to_datetime(df["Tarih"], format="%d.%m.%Y", errors="coerce")
    return df[t.notna()]


def tutar_gecerli(df):
    s = df["Tutar"].str.replace(".", "", regex=False).str.replace(",", ".", regex=False)
    return df[pd.to_numeric(s, errors="coerce").notna()]


ADIMLAR = [
    ("Boş satırları kaldır", lambda d: d.dropna(how="all")),
    ("Yinelenenleri kaldır", lambda d: d.drop_duplicates()),
    ("Geçersiz tarihleri kaldır", tarih_gecerli),
    ("Tutarı olmayanları kaldır", tutar_gecerli),
]

sonuc, gunluk = adim_gunlugu(ham, ADIMLAR)
for ad, n in gunluk:
    print(f"{ad:<28}{n:>3} satır")
''',
    calc={'G': 'gunluk', 'B': 'sonuc["Bayi"].tolist()'},
    tests='''
assert gunluk == @G@, "Adım günlüğü tutmuyor: her adımdan sonra satır sayısı"
assert sonuc["Bayi"].tolist() == @B@, "Son tabloda kalan bayiler tutmuyor"
k = pd.DataFrame({"x": [1, 2, 3, 4]})
son, g = adim_gunlugu(k, [("Tekleri at", lambda d: d[d["x"] % 2 == 0]), ("İlkini al", lambda d: d.head(1))])
assert g == [("Kaynak", 4), ("Tekleri at", 2), ("İlkini al", 1)] and son["x"].tolist() == [2], "Adımlar sırayla, her biri bir öncekinin sonucuna uygulanmalı"
assert adim_gunlugu(k, [])[1] == [("Kaynak", 4)], "Adım yoksa yalnız Kaynak satırı"
''',
    hints=['Fonksiyonlar birinci sınıf nesnedir: listede saklanıp sonra çağrılabilir.', 'Döngüde <code>df = fonk(df)</code> ve her adımdan sonra <code>len(df)</code>\'i günlüğe ekle.',
           'Kısa adımlar için <code>lambda d: d.dropna(how="all")</code> yeterli.'],
    why='Adımları veri (liste) olarak tanımlamak, hattı yeniden sıralamayı, adım eklemeyi ve günlük tutmayı kolaylaştırır; bu, fonksiyon bileşimi (composition) fikridir. '
        'pandas\'ta aynı zincir <code>df.pipe(f1).pipe(f2)</code> ile de yazılır ama araya günlük koymak bu kalıpla daha kolaydır. '
        'Satır sayısı günlüğü, "veri nerede kayboldu?" sorusunu denetimde tek bakışta yanıtlar; üretim hatlarında genellikle <code>logging</code> ile kaydedilir.',
    tags=['pipeline', 'fonksiyon listesi', 'lambda', 'günlük'], min=10)

add(id='b-480', lv='ileri', diff=3, kind='yaz', needs=['pandas'], title='Ürünleri hedeflerle eşleştir (anti-join)',
    q='<p><b>Planlama ekibi soruyor:</b> "Hedef verdiğimiz ama ürün listesinde karşılığı olmayan kategori var mı? Ya da tersi?"</p>'
      '<p><code>kategori_eslesme(urun, hedef)</code> fonksiyonunu yaz (<code>veri.oku("kirli_veri", "urun")</code> ve <code>veri.oku("kirli_veri", "hedef")</code>).</p>'
      '<ul><li><code>urun</code>: <code>Kategori</code> sütununu aşağı doldur (<code>ffill</code>); kategori başına <code>urun_sayisi</code> ve <code>ort_fiyat</code> (2 ondalık)</li>'
      '<li><code>hedef</code>: kategori başına <code>q1_hedef</code> = Oca + Şub + Mar (boşlar atlanır)</li>'
      '<li>İkisini <code>Kategori</code> üzerinden <b>dış birleştir</b> (<code>how="outer", indicator=True</code>); <code>_merge</code>\'yi <code>durum</code> sütununa çevir: '
      '<code>both</code>→<code>"eşleşti"</code>, <code>left_only</code>→<code>"yalnız ürün"</code>, <code>right_only</code>→<code>"yalnız hedef"</code></li></ul>'
      '<p>Dönüş: sütunlar <code>Kategori, urun_sayisi, ort_fiyat, q1_hedef, durum</code>; <code>Kategori</code>\'ye göre sıralı, index 0\'dan.</p>',
    start='''
import veri
import pandas as pd

urun = veri.oku("kirli_veri", "urun")
hedef = veri.oku("kirli_veri", "hedef")


def kategori_eslesme(urun, hedef):
    pass
''',
    sol='''
import veri
import pandas as pd

urun = veri.oku("kirli_veri", "urun")
hedef = veri.oku("kirli_veri", "hedef")


def kategori_eslesme(urun, hedef):
    u = urun.assign(Kategori=urun["Kategori"].ffill())
    uo = u.groupby("Kategori").agg(urun_sayisi=("Fiyat", "size"), ort_fiyat=("Fiyat", "mean")).reset_index()
    uo["ort_fiyat"] = uo["ort_fiyat"].round(2)
    h = hedef.assign(q1_hedef=hedef[["Oca", "Şub", "Mar"]].sum(axis=1))[["Kategori", "q1_hedef"]]
    df = uo.merge(h, on="Kategori", how="outer", indicator=True)
    etiket = {"both": "eşleşti", "left_only": "yalnız ürün", "right_only": "yalnız hedef"}
    df["durum"] = df["_merge"].astype(str).map(etiket)
    df = df.drop(columns="_merge").sort_values("Kategori").reset_index(drop=True)
    return df[["Kategori", "urun_sayisi", "ort_fiyat", "q1_hedef", "durum"]]


print(kategori_eslesme(urun, hedef))
''',
    calc={'D': 'kategori_eslesme(urun, hedef)["durum"].tolist()', 'K': 'kategori_eslesme(urun, hedef)["Kategori"].tolist()',
          'Q': 'kategori_eslesme(urun, hedef)["q1_hedef"].tolist()', 'F': 'kategori_eslesme(urun, hedef)["ort_fiyat"].dropna().tolist()'},
    tests='''
r = kategori_eslesme(urun, hedef)
assert list(r.columns) == ["Kategori", "urun_sayisi", "ort_fiyat", "q1_hedef", "durum"], "Sütun adları ve sırası"
assert r["Kategori"].tolist() == @K@, "Kategoriler alfabetik ve iki tablonun birleşimi olmalı"
assert r["durum"].tolist() == @D@, "Giyim yalnız hedefte var; diğerleri eşleşmeli"
assert r["q1_hedef"].tolist() == @Q@, "Q1 hedefleri tutmuyor (Giyim Mart boş, atlanmalı)"
assert r["ort_fiyat"].dropna().tolist() == @F@, "Ortalama fiyatlar tutmuyor: kategori aşağı doldurulmuş olmalı"
assert pd.isna(r.loc[r["Kategori"] == "Giyim", "urun_sayisi"]).all(), "Giyim için ürün bilgisi boş (NaN) olmalı"
''',
    hints=['Önce iki tarafı kategori düzeyine indir, sonra birleştir.', '<code>merge(..., how="outer", indicator=True)</code> eşleşme durumunu <code>_merge</code> sütununda verir.',
           '<code>_merge</code> kategorik türdedir; <code>astype(str).map(etiket)</code> ile Türkçe etikete çevir.'],
    why='Dış birleştirme + <code>indicator=True</code>, iki listeyi karşılaştırmanın (reconciliation) en hızlı yoludur: tek çağrıda eşleşenler ve iki yöndeki eşleşmeyenler (anti-join) görünür. '
        'Power Query\'de bunun için "Sol karşıt" ve "Sağ karşıt" birleştirme türleri ayrı ayrı kullanılır. Aşağı doldurma yapılmadan gruplanırsa ürünlerin çoğu NaN kategoriye düşer '
        've ortalamalar yanlış çıkar. <code>sum(axis=1)</code> NaN\'ı atlar (0 sayar); hedefi boş ayı "bilinmiyor" saymak istiyorsan <code>min_count=3</code> ver.',
    tags=['merge outer', 'indicator', 'anti-join', 'ffill'], min=10)

if __name__ == '__main__':
    write('/home/claude/py/v3/d1/ds_kirli.js', 'Kesit Python — veri seti görevleri: Kirli veri / Power Query adımları (b-466 … b-480)', T)
