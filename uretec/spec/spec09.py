START = 191
TASKS = [
dict(topic='Fonksiyonlar', diff=1, kind='rehberli',
  title='Yalnız-anahtar parametreli etiket',
  q='<p>Raf etiketi basan fonksiyonda indirim oranı yanlışlıkla fiyat yerine verilip hatalı etiketler basılmış. Bunu önlemek için <code>fiyat_etiketi(ad, fiyat, *, indirim=0, para_birimi="TL")</code> fonksiyonunu yaz: <code>*</code>\'dan sonraki parametreler <b>yalnızca adıyla</b> verilebilir (keyword-only).</p><ul><li>Net fiyat = fiyat × (1 − indirim/100), 2 ondalık</li><li>İndirim yoksa: <code>"Çay: 65.00 TL"</code></li><li>İndirim varsa: <code>"Çay: 58.50 TL (%10 indirim)"</code></li></ul>',
  guide=['Parametre listesine * koyarak sonrakileri yalnız-anahtar yap.', 'Net fiyatı hesapla.', 'Temel metni f-string ile oluştur ({net:.2f}).', 'indirim 0\'dan büyükse sonuna " (%10 indirim)" ekle ve döndür.'],
  example=r'''
# Benzer teknik: yalnız-anahtar parametre
def rapor(baslik, *, sayfa=1, yatay=False):
    return f"{baslik} s.{sayfa} {'yatay' if yatay else 'dikey'}"
print(rapor("Satış", sayfa=3))
try:
    rapor("Satış", 3)
except TypeError as e:
    print("Hata:", e)
''',
  start=r'''
def fiyat_etiketi(ad, fiyat, indirim=0, para_birimi="TL"):
    # TODO: indirimden sonraki parametreleri yalnız-anahtar yap (*)
    # TODO: net fiyatı hesapla
    # TODO: indirim varsa açıklama ekle
    return f"{ad}: {fiyat} {para_birimi}"
''',
  sol=r'''
def fiyat_etiketi(ad, fiyat, *, indirim=0, para_birimi="TL"):
    net = fiyat * (1 - indirim / 100)
    metin = f"{ad}: {net:.2f} {para_birimi}"
    if indirim > 0:
        metin += f" (%{indirim} indirim)"
    return metin
''',
  tests=r'''
assert fiyat_etiketi("Çay", 65) == "Çay: 65.00 TL", "İndirimsiz: \"Çay: 65.00 TL\""
assert fiyat_etiketi("Çay", 65, indirim=10) == "Çay: 58.50 TL (%10 indirim)", "%10 indirimle 58.50 ve açıklama"
assert fiyat_etiketi("Tea", 3, para_birimi="USD") == "Tea: 3.00 USD", "Para birimi adıyla değiştirilebilmeli"
try:
    fiyat_etiketi("Çay", 65, 10)
    assert False, "indirim konumsal verilememeli: * ile yalnız-anahtar yap"
except TypeError:
    pass
''',
  hints=['def f(a, b, *, c=0): — c artık yalnızca c=... biçiminde verilebilir.', 'Biçimlendirme: f"{net:.2f}"', 'if indirim > 0: metin += f" (%{indirim} indirim)"'],
  why='Parametre listesindeki çıplak * sonraki parametreleri yalnız-anahtar (keyword-only) yapar; fiyat_etiketi("Çay", 65, 10) çağrısı TypeError verir ve 10\'un ne anlama geldiği belirsizliği ortadan kalkar. Özellikle aynı türde birden çok sayısal parametre olan fonksiyonlarda (oran, adet, gün) bu, sessiz hataları önler. Benzer şekilde / ile yalnız-konumsal (positional-only) parametre tanımlanır.',
  tags=['keyword-only', 'varsayılan', 'f-string'], min=5),

dict(topic='Fonksiyonlar', diff=2, kind='rehberli',
  title='Fiyat kuralını fonksiyonla ver',
  q='<p>Anadolu Market fiyatlandırma ekibi farklı kuralları denemek istiyor. İki fonksiyon yaz:</p><ol><li><code>yuvarla_99(fiyat)</code>: fiyatın tam kısmını alıp <code>.99</code> ekler (10.20 → 10.99, 5.7 → 5.99), 2 ondalık.</li><li><code>uygula(fiyatlar, kural)</code>: <code>kural</code> bir <b>fonksiyondur</b>; her fiyata uygulanmış yeni listeyi döndürür.</li></ol><p>Böylece <code>uygula(liste, yuvarla_99)</code> ya da <code>uygula(liste, lambda f: f * 0.9)</code> yazılabilecek.</p>',
  guide=['yuvarla_99: int(fiyat) tam kısmı verir; 0.99 ekle ve round(..., 2) yap.', 'uygula: boş bir liste oluştur.', 'Her fiyat için kural(fiyat) çağır ve sonucu ekle.', 'Fonksiyonu parametre olarak verirken parantez KOYMA: uygula(l, yuvarla_99)'],
  example=r'''
# Benzer teknik: fonksiyonu argüman olarak geçmek
def iki_kat(x):
    return x * 2

def her_birine(liste, islem):
    return [islem(x) for x in liste]

print(her_birine([1, 2, 3], iki_kat))
print(her_birine(["a", "b"], str.upper))
''',
  start=r'''
def yuvarla_99(fiyat):
    # TODO: tam kısım + 0.99
    pass

def uygula(fiyatlar, kural):
    sonuc = []
    # TODO: her fiyata kural fonksiyonunu uygula
    return sonuc
''',
  sol=r'''
def yuvarla_99(fiyat):
    return round(int(fiyat) + 0.99, 2)

def uygula(fiyatlar, kural):
    sonuc = []
    for f in fiyatlar:
        sonuc.append(kural(f))
    return sonuc
''',
  tests=r'''
assert yuvarla_99(10.20) == 10.99, "10.20 → 10.99"
assert yuvarla_99(5.7) == 5.99, "5.7 → 5.99"
assert uygula([10.2, 5.7], yuvarla_99) == [10.99, 5.99], "uygula fonksiyonu yuvarla_99\'u her fiyata uygulamalı"
assert uygula([100, 50], lambda f: f * 0.9) == [90.0, 45.0], "lambda ile %10 indirim kuralı da çalışmalı"
assert uygula([], yuvarla_99) == [], "Boş listede boş sonuç"
''',
  hints=['Python\'da fonksiyonlar da değerdir; bir değişkene atanabilir, argüman olarak verilebilir.', 'kural(f) ile parametre olarak gelen fonksiyonu çağırırsın.', 'sonuc.append(kural(f))'],
  why='Fonksiyonlar birinci sınıf nesnelerdir (first-class): parametre olarak geçilip içeride çağrılabilir. Böylece uygula fonksiyonu kuralı bilmeden her türlü dönüşümü uygular; yeni kural eklemek için uygula\'ya dokunmak gerekmez. Bu, orta seviyedeki map(), sorted(key=...) ve dekoratörlerin temelidir. Hazır karşılığı: list(map(kural, fiyatlar)).',
  tags=['higher-order', 'lambda', 'birinci sınıf fonksiyon'], min=6),

dict(topic='Fonksiyonlar', diff=2, kind='yaz',
  title='Kredi taksiti hesaplayıcı',
  q='<p>Ilgaz Bank kredi simülatörü için <code>aylik_taksit(anapara, aylik_faiz_yuzde, ay)</code> fonksiyonunu yaz. Eşit taksitli kredinin (annüite) formülü:</p><pre class="out">taksit = P × r / (1 − (1 + r) ** (−n))</pre><p>Burada P anapara, r aylık faiz oranı (yüzde değil: %3 → 0.03), n ay sayısıdır. Faiz 0 ise taksit = P / n. Sonucu 2 ondalığa yuvarla. Fonksiyona kısa bir belge dizesi (docstring) ekle.</p>',
  start=r'''
def aylik_taksit(anapara, aylik_faiz_yuzde, ay):
    # buraya yaz
    pass
''',
  sol=r'''
def aylik_taksit(anapara, aylik_faiz_yuzde, ay):
    """Eşit taksitli kredinin aylık taksitini döndürür."""
    r = aylik_faiz_yuzde / 100
    if r == 0:
        return round(anapara / ay, 2)
    return round(anapara * r / (1 - (1 + r) ** (-ay)), 2)
''',
  tests=r'''
assert aylik_taksit(120000, 0, 12) == 10000.0, "Faizsiz: 120000 / 12 = 10000.0"
assert aylik_taksit(100000, 3, 12) == 10046.21, "100000 TL, aylık %3, 12 ay → 10046.21"
assert aylik_taksit(50000, 2, 24) == 2643.55, "50000 TL, aylık %2, 24 ay → 2643.55"
assert aylik_taksit.__doc__, "Fonksiyonun bir docstring\'i olmalı"
''',
  hints=['Önce yüzdeyi orana çevir: r = aylik_faiz_yuzde / 100. Faiz 0\'sa formül sıfıra böler; ayrı ele al.', 'Üs için **, negatif üs için (1 + r) ** (-ay).'],
  why='Formül faiz sıfırken 0/0 olur (ZeroDivisionError); bu yüzden r == 0 özel durumu önce ele alınır. Yüzde ile oranı ayırmak, kredi hesaplarında en sık hata kaynağını ortadan kaldırır. Docstring help(aylik_taksit) ile görünür ve ekip içi belgelemedir. Gerçek bankacılıkta faiz üzerine BSMV/KKDF vergileri eklenir ve tutarlar Decimal ile hesaplanır.',
  tags=['fonksiyon', 'docstring', '**', 'kredi'], min=6),

dict(topic='Fonksiyonlar', diff=3, kind='yaz',
  title='Ağırlıklı not ortalaması',
  q='<p>Okul sistemi için <code>agirlikli_ortalama(*notlar, agirliklar=None)</code> fonksiyonunu yaz:</p><ul><li>Notlar değişken sayıda konumsal argüman olarak gelir: <code>agirlikli_ortalama(70, 80, 90)</code></li><li><code>agirliklar</code> verilmezse düz ortalama al.</li><li>Verilirse Σ(not × ağırlık) / Σ(ağırlık) hesapla.</li><li>Hiç not yoksa <code>ValueError("Not yok")</code>; ağırlık sayısı not sayısına eşit değilse <code>ValueError("Ağırlık sayısı uyuşmuyor")</code> fırlat.</li><li>Sonucu 2 ondalığa yuvarla.</li></ul>',
  start=r'''
def agirlikli_ortalama(*notlar, agirliklar=None):
    # buraya yaz
    pass
''',
  sol=r'''
def agirlikli_ortalama(*notlar, agirliklar=None):
    if not notlar:
        raise ValueError("Not yok")
    if agirliklar is None:
        agirliklar = [1] * len(notlar)
    if len(agirliklar) != len(notlar):
        raise ValueError("Ağırlık sayısı uyuşmuyor")
    toplam = 0
    for n, a in zip(notlar, agirliklar):
        toplam += n * a
    return round(toplam / sum(agirliklar), 2)
''',
  tests=r'''
assert agirlikli_ortalama(70, 80, 90) == 80.0, "Ağırlıksız düz ortalama 80.0"
assert agirlikli_ortalama(60, 90, agirliklar=[0.4, 0.6]) == 78.0, "Vize %40, final %60: 60×0.4 + 90×0.6 = 78.0"
assert agirlikli_ortalama(55) == 55.0, "Tek not: kendisi"
for args, kw, mesaj in [((), {}, "Not yok"), ((70, 80), {"agirliklar": [1]}, "Ağırlık sayısı uyuşmuyor")]:
    try:
        agirlikli_ortalama(*args, **kw)
        assert False, f"ValueError(\"{mesaj}\") fırlatılmalı"
    except ValueError as e:
        assert str(e) == mesaj, f"Hata mesajı \"{mesaj}\" olmalı"
''',
  hints=['*notlar fonksiyon içinde bir demettir; boşsa if not notlar ile yakalanır.', 'Ağırlık yoksa her not için 1 ağırlık kullanmak düz ortalamaya denktir. Notlar ve ağırlıkları zip ile eşle.'],
  why='*notlar değişken sayıda konumsal argümanı demette toplar; ondan sonra gelen agirliklar otomatik olarak yalnız-anahtar parametre olur. Ağırlık verilmediğinde [1] * n kullanmak iki ayrı formül yazma ihtiyacını ortadan kaldırır. Hatalı girdide sessizce yanlış sonuç döndürmek yerine anlamlı mesajlı ValueError fırlatmak, çağıran kodun sorunu fark etmesini sağlar. Varsayılanın None olması mutable varsayılan tuzağını da önler.',
  tags=['*args', 'keyword-only', 'ValueError', 'zip', 'okul'], min=8),

dict(topic='Fonksiyonlar', diff=2, kind='bug',
  title='Ziyaret sayacı UnboundLocalError veriyor',
  q='<p>Kodda bir hata var, bul ve düzelt. Belediye web sitesinin basit ziyaret sayacı <code>ziyaret_kaydet()</code> her çağrıda modül düzeyindeki <code>toplam_ziyaret</code> değişkenini 1 artırıp yeni değeri döndürmeli. Ama ilk çağrıda <code>UnboundLocalError</code> veriyor.</p>',
  start=r'''
toplam_ziyaret = 0

def ziyaret_kaydet():
    toplam_ziyaret += 1
    return toplam_ziyaret
''',
  sol=r'''
toplam_ziyaret = 0

def ziyaret_kaydet():
    global toplam_ziyaret
    toplam_ziyaret += 1
    return toplam_ziyaret
''',
  tests=r'''
a = ziyaret_kaydet()
b = ziyaret_kaydet()
assert b == a + 1, "Her çağrı sayacı 1 artırmalı"
assert toplam_ziyaret == b, "Modül düzeyindeki toplam_ziyaret güncellenmeli"
''',
  hints=['Fonksiyon içinde bir ada atama yapılırsa Python onu yerel değişken sayar.', 'Modül düzeyindeki değişkeni değiştirmek istediğini global anahtar sözcüğüyle bildir.'],
  why='Fonksiyon gövdesinde toplam_ziyaret += 1 bir atama olduğu için Python bu adı yerel kabul eder; ama yerel değer henüz yoktur, okuma anında UnboundLocalError oluşur. global toplam_ziyaret bildirimi atamanın modül düzeyindeki değişkene yapılacağını söyler. Yine de global durum test etmeyi zorlaştırır; daha iyi tasarım sayacı parametre olarak alıp yeni değeri döndürmek ya da bir sınıf/sözlük içinde tutmaktır.',
  tags=['global', 'kapsam', 'UnboundLocalError'], min=3),

dict(topic='Fonksiyonlar', diff=1, kind='tamamla',
  title='Çalışanları maaşa göre sırala',
  q='<p>İK raporu için <code>maas_sirasi(calisanlar)</code> fonksiyonu sözlük listesini maaşa göre <b>azalan</b>, eşit maaşta ada göre <b>artan</b> sıralayıp yalnızca adları döndürmeli. <code>lambda</code> içindeki boşlukları (<code>___</code>) doldur.</p>',
  start=r'''
def maas_sirasi(calisanlar):
    sirali = sorted(calisanlar, key=lambda c: (___, ___))
    return [c["ad"] for c in sirali]
''',
  sol=r'''
def maas_sirasi(calisanlar):
    sirali = sorted(calisanlar, key=lambda c: (-c["maas"], c["ad"]))
    return [c["ad"] for c in sirali]
''',
  tests=r'''
c = [{"ad": "Mert", "maas": 42000}, {"ad": "Ayşe", "maas": 55000}, {"ad": "Can", "maas": 42000}]
assert maas_sirasi(c) == ["Ayşe", "Can", "Mert"], "Ayşe en yüksek maaş; Can ve Mert eşit, alfabetik"
assert maas_sirasi([]) == [], "Boş listede boş sonuç"
''',
  hints=['Azalan sayısal sıra için maaşın negatifini kullan.', 'İkinci kriter eşitlikte devreye girer: c["ad"]'],
  why='lambda tek ifadelik isimsiz fonksiyondur; key\'e verilen demet önce maaşa (negatif → azalan) sonra ada göre sıralar. reverse=True kullanılsaydı adlar da tersine dönerdi. Alternatif: from operator import itemgetter yalnızca artan sıralamada işe yarar; karışık yönlü sıralamada negatif hilesi ya da iki aşamalı kararlı sıralama kullanılır.',
  tags=['lambda', 'sorted', 'key', 'İK'], min=3),

# ---------------- Özyineleme ----------------
dict(topic='Özyineleme', diff=2, t='predict',
  title='Geri sayım ve dönüş yolu',
  q='<p>Özyinelemeli fonksiyon hem çağrıdan önce hem sonra yazdırıyor. Çıktı nedir?</p>',
  code=r'''
def geri_say(n):
    if n == 0:
        print("Başla!")
        return
    print(n)
    geri_say(n - 1)
    print("<", n)

geri_say(2)
''',
  o=['2\n1\nBaşla!', '2\n1\nBaşla!\n< 2\n< 1', '2\n1\nBaşla!\n< 1\n< 2', '2\n< 2\n1\n< 1\nBaşla!'], a=2,
  hints=['Özyinelemeli çağrı bitmeden sonraki print çalışmaz.', 'Çağrılar yığın (stack) gibi biter: en son başlayan ilk biter.'],
  why='geri_say(2) 2 yazar ve geri_say(1)\'i çağırır; o da 1 yazıp geri_say(0)\'ı çağırır, "Başla!" yazılır. Sonra çağrılar ters sırayla tamamlanır: önce geri_say(1)\'in kalan satırı "< 1", sonra geri_say(2)\'nin "< 2". Çağrı yığını (call stack) son giren ilk çıkar (LIFO) mantığıyla çalışır. Ağaç gezme ve geri izleme (backtracking) algoritmaları bu "dönüş yolunda iş yapma" özelliğine dayanır.',
  tags=['özyineleme', 'call stack', 'temel durum'], min=3),

dict(topic='Özyineleme', diff=2, t='order',
  title='İç içe listelerin derin toplamı',
  q='<p>Kategori ağacındaki satış adetleri iç içe listelerde. Herhangi bir derinlikteki sayıları toplayan özyinelemeli fonksiyonun satırlarını sırala. Beklenen çıktı: <code>15</code></p>',
  lines=['def derin_topla(veri):', '    if isinstance(veri, int):', '        return veri', '    return sum(derin_topla(x) for x in veri)', 'print(derin_topla([1, [2, 3], [[4], 5]]))'],
  expect='15\n',
  hint='Temel durum (tek sayı) özyinelemeli adımdan önce kontrol edilmeli.',
  hints=['Özyinelemeli her fonksiyonun bir temel durumu (base case) ve kendini daha küçük parçayla çağıran bir adımı vardır.'],
  why='Temel durum: veri bir tam sayıysa kendisini döndür. Değilse bir listedir; her elemanı için aynı fonksiyon çağrılır ve sonuçlar toplanır. Derinlik ne olursa olsun ([[4]] gibi) her seviye bir alt çağrıyla çözülür. Temel durum sonra yazılsaydı sum bir tam sayı üzerinde dolaşmaya çalışıp TypeError verirdi.',
  tags=['özyineleme', 'isinstance', 'iç içe liste'], min=3),

dict(topic='Özyineleme', diff=2, kind='rehberli',
  title='Organizasyon şemasında kişi sayısı',
  q='<p>İK organizasyon şeması iç içe sözlüklerle tutuluyor: her kişinin <code>"ad"</code> ve kendisine bağlı kişilerin listesi <code>"ekip"</code> var. <code>kisi_say(dugum)</code> özyinelemeli fonksiyonunu yaz: verilen kişi dahil, altındaki herkesi (tüm seviyeler) saysın.</p>',
  guide=['Sayaç 1 ile başlar (kişinin kendisi).', 'Ekipteki her alt kişi için kisi_say(alt) çağır.', 'Dönen değerleri sayaca ekle.', 'Ekip boşsa döngü hiç çalışmaz: bu temel durumdur, 1 döner.'],
  example=r'''
# Benzer teknik: klasör ağacında dosya sayısı
def dosya_say(klasor):
    toplam = len(klasor["dosyalar"])
    for alt in klasor["alt"]:
        toplam += dosya_say(alt)
    return toplam

kok = {"dosyalar": ["a", "b"], "alt": [{"dosyalar": ["c"], "alt": []}]}
print(dosya_say(kok))   # 3
''',
  start=r'''
def kisi_say(dugum):
    toplam = 1
    # TODO: ekipteki her kişi için özyinelemeli çağrı yap ve topla
    return toplam
''',
  sol=r'''
def kisi_say(dugum):
    toplam = 1
    for alt in dugum["ekip"]:
        toplam += kisi_say(alt)
    return toplam
''',
  tests=r'''
sema = {"ad": "Genel Müdür", "ekip": [
    {"ad": "Satış Md.", "ekip": [{"ad": "Ece", "ekip": []}, {"ad": "Can", "ekip": []}]},
    {"ad": "IT Md.", "ekip": [{"ad": "Mert", "ekip": [{"ad": "Stajyer", "ekip": []}]}]},
]}
assert kisi_say(sema) == 7, "Genel müdür dahil 7 kişi var"
assert kisi_say(sema["ekip"][1]) == 3, "IT Md. altında kendisi dahil 3 kişi"
assert kisi_say({"ad": "Tek", "ekip": []}) == 1, "Ekibi olmayan kişi: 1"
''',
  hints=['Her kişi kendisi + alt ekiplerinin sayısıdır.', 'for alt in dugum["ekip"]:', 'toplam += kisi_say(alt)'],
  why='Ağaç yapıları doğal olarak özyinelemelidir: bir düğümün boyutu, kendisi artı çocuklarının boyutlarıdır. Ekip listesi boş olduğunda döngü çalışmaz ve 1 döner; ayrıca if ile temel durum yazmaya gerek kalmaz. Tek satırlık karşılığı: return 1 + sum(kisi_say(a) for a in dugum["ekip"]). Çok derin ağaçlarda (binlerce seviye) Python\'un özyineleme sınırına takılmamak için yığın (stack) kullanan döngüsel sürüm yazılır.',
  tags=['özyineleme', 'ağaç', 'iç içe sözlük', 'İK'], min=5),

dict(topic='Özyineleme', diff=1, kind='yaz',
  title='Özyinelemeli üs alma',
  q='<p><code>us_al(taban, us)</code> fonksiyonunu <b>özyinelemeli</b> yaz: <code>taban ** us</code> değerini döndürsün (us ≥ 0 tam sayı). <code>**</code> operatörü ve <code>pow</code> kullanma. İpucu: taban<sup>0</sup> = 1 ve taban<sup>n</sup> = taban × taban<sup>n−1</sup>.</p>',
  start=r'''
def us_al(taban, us):
    # buraya yaz
    pass
''',
  sol=r'''
def us_al(taban, us):
    if us == 0:
        return 1
    return taban * us_al(taban, us - 1)
''',
  tests=r'''
assert us_al(2, 10) == 1024, "2^10 = 1024"
assert us_al(5, 0) == 1, "Her sayının 0. kuvveti 1 (temel durum)"
assert us_al(3, 1) == 3, "3^1 = 3"
assert us_al(1.05, 2) == 1.05 * 1.05, "Ondalık taban da çalışmalı"
assert __source__.count("us_al(") >= 2, "Fonksiyon kendini çağırmalı (özyineleme)"
assert "**" not in __source__ and "pow(" not in __source__, "** ve pow kullanmadan çöz"
''',
  hints=['Temel durum: us 0 ise 1 döndür.', 'Özyinelemeli adım: taban * us_al(taban, us - 1)'],
  why='Her özyinelemeli fonksiyonun iki parçası vardır: temel durum (us == 0 → 1) ve problemi küçülten adım (us - 1). Her çağrı us\'u bir azalttığı için sonunda temel duruma ulaşılır. Bu sürüm us adet çağrı yapar; daha hızlı "hızlı üs alma" yönteminde us çiftse us_al(taban * taban, us // 2) kullanılır ve çağrı sayısı log(us)\'e iner.',
  tags=['özyineleme', 'temel durum', 'üs'], min=3),
]
