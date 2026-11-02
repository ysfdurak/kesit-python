/* ───────────────────────── 1. fonksiyonlar ───────────────────────── */
{
  id: 'fonksiyonlar',
  lv: 'temel',
  mod: 'Fonksiyonlar ve Modüller',
  min: 30,
  title: 'Fonksiyonlar',
  sum: 'def ile kendi fonksiyonunu yazar; parametre, varsayılan değer, anahtar sözcüklü argüman, *args/**kwargs ve çoklu return ile Anadolu Market KDV ve indirim hesaplarını tek yerden yönetirsin.',
  goals: [
    'def ile parametreli fonksiyon tanımlayıp return ile değer döndürebilirim.',
    'Varsayılan değerli ve anahtar sözcüklü argümanları doğru sırayla kullanabilirim.',
    '*args ve **kwargs ile değişken sayıda argüman alan fonksiyon yazabilirim.',
    'Bir fonksiyondan birden fazla değeri demet olarak döndürüp açabilirim.',
    'Docstring yazar, saf fonksiyonu tanır ve değişebilir varsayılan tuzağından kaçınırım.'
  ],
  body: `
<h2>Neden fonksiyon?</h2>
<p>Anadolu Market'in fiyat ekibinde çalıştığını düşün. Ürün listesi, sepet özeti, fatura, iade ekranı: hepsinde KDV hesaplanıyor. Bu hesabı her ekranda ayrı ayrı yazarsan bir gün KDV oranı değiştiğinde dört yeri de bulup düzeltmen gerekir; birini unutursan fatura yanlış kesilir. Fonksiyon (function), "bu hesabı bir kere yaz, her yerden çağır" demenin yoludur. Şimdiye kadar <code>print</code>, <code>len</code>, <code>round</code> gibi hazır fonksiyonları kullandın; bu derste kendi fonksiyonlarını yazacaksın.</p>
<p>Fonksiyonun üç kazancı var: <b>tekrarı önler</b> (aynı kodu bir kere yazarsın), <b>ad verir</b> (<code>kdv_hesapla(fiyat)</code> yazısı, formülün kendisinden daha anlaşılırdır) ve <b>test edilebilir</b> küçük parçalar üretir.</p>

<h2>def, parametre ve return</h2>
<p>Bir fonksiyon <code>def</code> anahtar sözcüğü, bir ad, parantez içinde parametreler (parameter) ve iki nokta ile tanımlanır. Gövde girintilidir. <code>return</code>, fonksiyonun ürettiği değeri çağıran yere geri gönderir.</p>
<pre class="py">def kdv_hesapla(fiyat, oran=0.20):
    """Fiyata KDV ekler ve KDV dahil tutarı döndürür."""
    return round(fiyat * (1 + oran), 2)

print(kdv_hesapla(100))        # varsayılan oran %20
print(kdv_hesapla(100, 0.10))  # gıda ürünü, %10
print(kdv_hesapla(fiyat=250, oran=0.01))</pre>
<p>Burada <code>fiyat</code> ve <code>oran</code> <b>parametre</b>, çağrıda verdiğin <code>100</code> ve <code>0.10</code> ise <b>argüman</b> (argument). Parametre tanımdaki isimdir, argüman o isme gerçekten gönderilen değer. Üçlü tırnak içindeki ilk metin <b>docstring</b>: fonksiyonun ne yaptığını anlatır, <code>help(kdv_hesapla)</code> yazınca görünür. İşyerinde her fonksiyona bir satırlık docstring yazma alışkanlığı, kodunu okuyan ekip arkadaşlarına bırakacağın en kıymetli nottur.</p>
<div class="note"><b>return olmayan fonksiyon</b>Bir fonksiyonda <code>return</code> yoksa ya da yalnızca <code>return</code> yazılmışsa fonksiyon <code>None</code> döndürür. <code>sonuc = print("x")</code> yazarsan <code>sonuc</code> None olur; print ekrana yazar ama değer döndürmez.</div>

<h2>Varsayılan değer ve anahtar sözcüklü argüman</h2>
<p><code>oran=0.20</code> yazımı <b>varsayılan değer</b> (default value) verir: çağıran oran belirtmezse 0.20 kullanılır. Varsayılan değerli parametreler, değersiz olanlardan <b>sonra</b> gelmek zorundadır; <code>def f(oran=0.2, fiyat)</code> SyntaxError verir.</p>
<p>Çağrıda <code>fiyat=250</code> gibi ad belirtmeye <b>anahtar sözcüklü argüman</b> (keyword argument) denir. Konumsal (positional) argümanlar sırayla eşleşir; anahtar sözcüklüler ise adla eşleşir, bu yüzden sırası önemsizdir. İkisini karıştırabilirsin ama konumsallar her zaman önce gelir.</p>
<pre class="py">def indirim_uygula(fiyat, yuzde=0, kupon=0, uye=False):
    tutar = fiyat * (1 - yuzde / 100)
    tutar -= kupon
    if uye:
        tutar *= 0.95          # üyelere ek %5
    return round(max(tutar, 0), 2)

print(indirim_uygula(1000))
print(indirim_uygula(1000, 10))
print(indirim_uygula(1000, kupon=50))
print(indirim_uygula(1000, 10, uye=True))
print(indirim_uygula(fiyat=40, kupon=100))   # eksiye düşmez</pre>
<p>Dört parametreli bir fonksiyonda <code>indirim_uygula(1000, 0, 0, True)</code> yazmak okunmaz; <code>indirim_uygula(1000, uye=True)</code> ise kendini anlatır. Çok parametreli fonksiyonlarda anahtar sözcük kullanmak, PEP 8 kadar önemli bir ekip kuralıdır.</p>

<h2>Çoklu dönüş: demet açma</h2>
<p>Python'da bir fonksiyon birden fazla değer "döndürüyor" gibi görünür; aslında tek bir demet (tuple) döndürür ve sen onu açarsın (unpacking). Fatura hesabında ara toplam, KDV ve genel toplamı birlikte döndürmek doğal bir örnektir:</p>
<pre class="py">def fatura_hesapla(sepet, kdv_orani=0.20):
    """sepet: (urun, adet, birim_fiyat) demetlerinin listesi"""
    ara_toplam = 0
    for urun, adet, fiyat in sepet:
        ara_toplam += adet * fiyat
    kdv = round(ara_toplam * kdv_orani, 2)
    return ara_toplam, kdv, round(ara_toplam + kdv, 2)

sepet = [("Kahve Makinesi", 1, 1500), ("Filtre", 3, 45.5), ("Fincan", 6, 30)]
ara, kdv, toplam = fatura_hesapla(sepet)
print("Ara toplam:", ara)
print("KDV:", kdv)
print("Genel toplam:", toplam)
print(type(fatura_hesapla(sepet)))</pre>
<p>Son satır <code>&lt;class 'tuple'&gt;</code> basar: döndürülen şey gerçekten bir demettir. Üç değişkene açmak için sol tarafa üç ad yazarsın; sayı tutmazsa <code>ValueError</code> alırsın.</p>

<h2>*args ve **kwargs</h2>
<p>Kaç argüman geleceğini önceden bilmediğin durumlar olur. Sepete 2 ürün de eklenebilir 20 ürün de. <code>*args</code> fazladan gelen <b>konumsal</b> argümanları bir demette, <code>**kwargs</code> fazladan gelen <b>anahtar sözcüklü</b> argümanları bir sözlükte toplar. <code>args</code> ve <code>kwargs</code> adları gelenektir; yıldızlar asıl işi yapar.</p>
<pre class="py">def sepet_toplami(*fiyatlar, **secenekler):
    toplam = sum(fiyatlar)
    print("gelen fiyatlar:", fiyatlar)
    print("gelen seçenekler:", secenekler)
    if secenekler.get("kargo_bedava", False) is False and toplam &lt; 500:
        toplam += secenekler.get("kargo", 49.9)
    return round(toplam, 2)

print(sepet_toplami(120, 85.5, 60))
print(sepet_toplami(120, 85.5, 60, kargo=29.9))
print(sepet_toplami(900, 250, kargo_bedava=True))</pre>
<p>Yıldızın tersi de çalışır: elindeki listeyi <code>sepet_toplami(*liste)</code>, sözlüğü <code>f(**sozluk)</code> diyerek açıp argüman olarak gönderebilirsin.</p>
<div class="tbl-wrap"><table>
<tr><th>Yazım</th><th>Ne alır</th><th>Fonksiyon içinde türü</th><th>Örnek çağrı</th></tr>
<tr><td><code>def f(a, b)</code></td><td>Tam iki konumsal argüman</td><td>tekil değerler</td><td><code>f(1, 2)</code></td></tr>
<tr><td><code>def f(a, b=5)</code></td><td>Bir zorunlu, bir isteğe bağlı</td><td>tekil değerler</td><td><code>f(1)</code>, <code>f(1, b=9)</code></td></tr>
<tr><td><code>def f(*args)</code></td><td>Sıfır veya daha çok konumsal</td><td>tuple</td><td><code>f()</code>, <code>f(1, 2, 3)</code></td></tr>
<tr><td><code>def f(**kwargs)</code></td><td>Sıfır veya daha çok anahtar sözcüklü</td><td>dict</td><td><code>f(x=1, y=2)</code></td></tr>
<tr><td><code>def f(a, *args, k=0, **kwargs)</code></td><td>Hepsi birden, bu sırayla</td><td>karışık</td><td><code>f(1, 2, 3, k=4, z=5)</code></td></tr>
</table></div>

<h2>Saf fonksiyon</h2>
<p>Aynı girdiye her zaman aynı çıktıyı veren ve dış dünyayı değiştirmeyen fonksiyona <b>saf fonksiyon</b> (pure function) denir. <code>kdv_hesapla(100)</code> her çağrıda 120.0 verir; ekrana yazmaz, dosyaya dokunmaz, global değişken bozmaz. Saf fonksiyonlar test etmesi en kolay, hata ayıklaması en rahat parçalardır. Hesabı yapan fonksiyonla sonucu yazdıran kodu ayır: hesap saf kalsın, print dışarıda olsun. Ders boyunca bu kalıbı göreceksin: <code>fatura_hesapla</code> hesaplar, çağıran yer yazdırır.</p>

<h2>Değişebilir varsayılan tuzağı</h2>
<p>Python'da en meşhur tuzaklardan biri: varsayılan değer, fonksiyon <b>tanımlandığında bir kez</b> oluşturulur, her çağrıda yeniden değil. Varsayılan bir liste ya da sözlükse, tüm çağrılar aynı nesneyi paylaşır.</p>
<pre class="py">def sepete_ekle(urun, sepet=[]):      # TUZAK
    sepet.append(urun)
    return sepet

print(sepete_ekle("Kahve"))
print(sepete_ekle("Çay"))              # Kahve hâlâ içeride!

def sepete_ekle_dogru(urun, sepet=None):
    if sepet is None:
        sepet = []
    sepet.append(urun)
    return sepet

print(sepete_ekle_dogru("Kahve"))
print(sepete_ekle_dogru("Çay"))</pre>
<div class="warn"><b>Kural</b>Varsayılan değer olarak asla <code>[]</code>, <code>{}</code> ya da <code>set()</code> yazma. <code>None</code> ver, gövdede <code>if sepet is None: sepet = []</code> ile oluştur. Sayı, metin, demet ve <code>None</code> gibi değişmez (immutable) varsayılanlar güvenlidir.</div>
<div class="tip"><b>İyi fonksiyon nasıl olur?</b>Tek bir iş yapar, adı fiille başlar (<code>hesapla</code>, <code>bul</code>, <code>filtrele</code>), 3-5 parametreyi geçmez, docstring taşır ve mümkünse saftır. 40 satırı geçen bir fonksiyon genelde ikiye bölünmek ister.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Yalnızca anahtar sözcüklü ve yalnızca konumsal parametreler</h3>
<p>Python 3'te parametre listesine tek başına <code>*</code> koyarsan sonrasındaki parametreler yalnızca adla verilebilir: <code>def indirim(fiyat, *, yuzde=0, kupon=0)</code>. Artık <code>indirim(1000, 10)</code> hata verir; <code>indirim(1000, yuzde=10)</code> yazmak zorunludur. Bu, yanlışlıkla yüzde yerine kupon göndermeyi imkânsız kılar. Tersi için <code>/</code> kullanılır: <code>def f(a, b, /)</code> yazımında a ve b yalnızca konumsaldır; <code>len</code> gibi yerleşik fonksiyonlar böyledir.</p>
<h3>Tip ipuçları</h3>
<p>Kurumsal kodda fonksiyon imzasına tip ipucu (type hint) eklenir: <code>def kdv_hesapla(fiyat: float, oran: float = 0.20) -&gt; float:</code>. Python bunları zorlamaz ama editör ve <code>mypy</code> gibi araçlar hataları daha yazarken yakalar. Dataclass ve typing dersinde ayrıntıya gireceğiz; şimdilik imzaya tip yazmayı deneyebilirsin, zararı yoktur.</p>
<h3>Fonksiyon bir değerdir</h3>
<p>Python'da fonksiyon da bir nesnedir: değişkene atanır, listeye konur, başka fonksiyona argüman olarak verilir. <code>hesaplar = {"kdv": kdv_hesapla, "indirim": indirim_uygula}</code> gibi bir sözlükle "işlem adı → fonksiyon" tablosu kurabilirsin. Orta seviyedeki fonksiyonel programlama ve dekoratör dersleri tamamen bu fikrin üstüne kurulur.</p>
</section>
`,
  ex: [
    { t: 'mc', q: 'Aşağıdaki tanımlardan hangisi <b>SyntaxError</b> verir?',
      o: ['def f(a, b=2):', 'def f(a=1, b):', 'def f(*args, k=0):', 'def f(a, *args, **kwargs):'], a: 1,
      why: 'Varsayılan değerli parametre, değersiz parametreden önce gelemez; Python "non-default argument follows default argument" hatası verir. Diğer üçü geçerli imzalardır.' },
    { t: 'code', id: 'fonksiyonlar-1',
      q: '<p><code>kdv_dahil(fiyat, oran=0.20)</code> fonksiyonunu yaz. Fiyata verilen orandaki KDV\'yi ekleyip sonucu 2 ondalığa yuvarlayarak döndürsün. Oran verilmezse %20 kullanılsın.</p>',
      start: 'def kdv_dahil(fiyat, oran=0.20):\n    # buraya yaz\n    pass\n',
      sol: 'def kdv_dahil(fiyat, oran=0.20):\n    return round(fiyat * (1 + oran), 2)\n',
      tests: 'assert kdv_dahil(100) == 120.0, "kdv_dahil(100) 120.0 olmalı"\nassert kdv_dahil(100, 0.10) == 110.0, "kdv_dahil(100, 0.10) 110.0 olmalı"\nassert kdv_dahil(oran=0.01, fiyat=250) == 252.5, "anahtar sözcüklü çağrı 252.5 vermeli"\nassert abs(kdv_dahil(33.33) - 40.0) < 1e-6, "kdv_dahil(33.33) 40.0 olmalı"\n',
      hints: ['KDV dahil tutar = fiyat * (1 + oran).', 'round(x, 2) ile iki ondalığa yuvarla ve return et.'],
      why: 'Varsayılan oran tanımda verilir; çağıran belirtmezse 0.20 kullanılır. round ile kuruş hassasiyeti korunur.' },
    { t: 'code', id: 'fonksiyonlar-2',
      q: '<p><code>indirimli_fiyat(fiyat, yuzde=0, kupon=0)</code> fonksiyonunu yaz. Önce yüzde indirimi uygulasın, sonra kupon tutarını düşsün. Sonuç sıfırın altına inemez (en az 0 döndür). Sonucu 2 ondalığa yuvarla.</p>',
      start: 'def indirimli_fiyat(fiyat, yuzde=0, kupon=0):\n    # buraya yaz\n    pass\n',
      sol: 'def indirimli_fiyat(fiyat, yuzde=0, kupon=0):\n    tutar = fiyat * (1 - yuzde / 100) - kupon\n    return round(max(tutar, 0), 2)\n',
      tests: 'assert indirimli_fiyat(1000) == 1000.0, "indirimsiz çağrı 1000.0 vermeli"\nassert indirimli_fiyat(1000, 10) == 900.0, "%10 indirim 900.0 vermeli"\nassert indirimli_fiyat(1000, kupon=50) == 950.0, "50 kupon 950.0 vermeli"\nassert indirimli_fiyat(1000, 10, 50) == 850.0, "önce yüzde sonra kupon: 850.0"\nassert indirimli_fiyat(40, kupon=100) == 0, "sonuç eksiye düşmemeli"\n',
      hints: ['Önce fiyat * (1 - yuzde / 100), sonra - kupon.', 'max(tutar, 0) ile eksiyi engelle.'],
      why: 'İşlem sırası görevde belirtildiği gibi: önce yüzde, sonra kupon. max ile alt sınır konur, round ile kuruş yuvarlanır.' },
    { t: 'mc', q: '<code>def f(a, b=5): return a * b</code> tanımı varken <code>f(2, b=3)</code> çağrısı ne döndürür?',
      o: ['10', '6', 'Hata verir', 'None'], a: 1,
      why: 'Konumsal 2 a\'ya, anahtar sözcüklü b=3 varsayılanı ezer; 2 * 3 = 6. Konumsal ve anahtar sözcüklü argümanlar birlikte kullanılabilir.' },
    { t: 'code', id: 'fonksiyonlar-3',
      q: '<p><code>siparis_ozeti(sepet)</code> fonksiyonunu yaz. <code>sepet</code>, <code>(urun, adet, birim_fiyat)</code> demetlerinden oluşan bir listedir. Fonksiyon üç değer döndürsün: toplam adet, ara toplam ve KDV dahil (%20) genel toplam. Para değerlerini 2 ondalığa yuvarla.</p>',
      start: 'def siparis_ozeti(sepet):\n    # toplam_adet, ara_toplam, genel_toplam döndür\n    pass\n',
      sol: 'def siparis_ozeti(sepet):\n    toplam_adet = 0\n    ara_toplam = 0\n    for urun, adet, fiyat in sepet:\n        toplam_adet += adet\n        ara_toplam += adet * fiyat\n    ara_toplam = round(ara_toplam, 2)\n    genel = round(ara_toplam * 1.20, 2)\n    return toplam_adet, ara_toplam, genel\n',
      tests: 'sepet = [("Kahve Makinesi", 1, 1500), ("Filtre", 3, 45.5), ("Fincan", 6, 30)]\nr = siparis_ozeti(sepet)\nassert isinstance(r, tuple) and len(r) == 3, "üç değerli bir demet döndürmeli"\nadet, ara, genel = r\nassert adet == 10, "toplam adet 10 olmalı"\nassert abs(ara - 1816.5) < 1e-6, "ara toplam 1816.5 olmalı"\nassert abs(genel - 2179.8) < 1e-6, "genel toplam 2179.8 olmalı"\nassert siparis_ozeti([]) == (0, 0, 0), "boş sepet (0, 0, 0) vermeli"\n',
      hints: ['for urun, adet, fiyat in sepet: ile demetleri aç.', 'return a, b, c yazımı bir demet döndürür.', 'Genel toplam = ara_toplam * 1.20.'],
      why: 'Döngüde adet ve tutar birikir; return virgülle üç değeri tek demet olarak gönderir, çağıran yer bunu üç değişkene açar.' },
    { t: 'code', id: 'fonksiyonlar-4',
      q: '<p><code>kampanya_toplami(*fiyatlar, **ayarlar)</code> fonksiyonunu yaz. Verilen tüm fiyatları toplasın. <code>ayarlar</code> içinde <code>indirim</code> anahtarı varsa toplamdan o yüzde kadar düşsün; <code>kargo</code> anahtarı varsa o tutarı eklesin. Sonucu 2 ondalığa yuvarlayıp döndürsün.</p>',
      start: 'def kampanya_toplami(*fiyatlar, **ayarlar):\n    # buraya yaz\n    pass\n',
      sol: 'def kampanya_toplami(*fiyatlar, **ayarlar):\n    toplam = sum(fiyatlar)\n    if "indirim" in ayarlar:\n        toplam *= 1 - ayarlar["indirim"] / 100\n    if "kargo" in ayarlar:\n        toplam += ayarlar["kargo"]\n    return round(toplam, 2)\n',
      tests: 'assert kampanya_toplami() == 0, "argümansız çağrı 0 vermeli"\nassert kampanya_toplami(100, 200, 50) == 350.0, "üç fiyat 350.0 vermeli"\nassert kampanya_toplami(100, 200, indirim=10) == 270.0, "%10 indirimle 270.0"\nassert kampanya_toplami(100, kargo=29.9) == 129.9, "kargo eklenince 129.9"\nassert kampanya_toplami(200, 200, indirim=25, kargo=20) == 320.0, "indirim ve kargo birlikte 320.0"\n',
      hints: ['sum(fiyatlar) demetin toplamını verir.', '"indirim" in ayarlar ile anahtarın varlığını kontrol et.'],
      why: '*fiyatlar tüm konumsal argümanları demette, **ayarlar anahtar sözcüklüleri sözlükte toplar; sözlükte anahtar var mı diye bakıp hesaba katılır.' },
    { t: 'mc', q: '<code>def ekle(x, liste=[]): liste.append(x); return liste</code> tanımından sonra <code>ekle(1)</code> ve ardından <code>ekle(2)</code> çağrılırsa ikinci çağrı ne döndürür?',
      o: ['[2]', '[1, 2]', '[1]', 'Hata verir'], a: 1,
      why: 'Varsayılan liste fonksiyon tanımlanırken bir kez oluşturulur ve tüm çağrılar onu paylaşır. İlk çağrı 1 ekler, ikinci çağrı aynı listeye 2 ekler. Çözüm: liste=None yazıp gövdede oluşturmak.' },
    { t: 'code', id: 'fonksiyonlar-5',
      q: '<p>Aşağıdaki <code>musteri_ekle(ad, liste=[])</code> fonksiyonu değişebilir varsayılan tuzağına düşüyor: her çağrı aynı listeyi paylaşıyor. Fonksiyonu düzelt: liste verilmezse her çağrıda <b>yeni</b> bir liste oluşturulsun, ad eklenip liste döndürülsün. Fonksiyon adı ve davranışı aynı kalsın.</p>',
      start: 'def musteri_ekle(ad, liste=[]):\n    liste.append(ad)\n    return liste\n',
      sol: 'def musteri_ekle(ad, liste=None):\n    if liste is None:\n        liste = []\n    liste.append(ad)\n    return liste\n',
      tests: 'a = musteri_ekle("Ayşe")\nb = musteri_ekle("Mehmet")\nassert a == ["Ayşe"], "ilk çağrı [\'Ayşe\'] vermeli"\nassert b == ["Mehmet"], "ikinci çağrı yeni liste [\'Mehmet\'] vermeli, paylaşılan liste olmamalı"\nassert a is not b, "her çağrı ayrı liste döndürmeli"\nmevcut = ["Zeynep"]\nassert musteri_ekle("Can", mevcut) == ["Zeynep", "Can"], "verilen listeye eklemeli"\nassert mevcut == ["Zeynep", "Can"], "verilen liste yerinde güncellenmeli"\n',
      hints: ['Varsayılanı None yap.', 'Gövdede if liste is None: liste = [] yaz.'],
      why: 'None değişmezdir ve paylaşım sorunu yaratmaz; gövdede her çağrı için taze liste oluşturulur. Dışarıdan liste verilirse o liste kullanılır.' }
  ],
  faq: [
    { q: 'Parametre ile argüman arasındaki fark tam olarak ne?', a: 'Parametre, fonksiyon tanımındaki isimdir (def f(fiyat)). Argüman, çağrıda o isme gönderilen değerdir (f(100)). Günlük konuşmada ikisi karışır ama hata mesajlarında ayrımı bilmek işe yarar.' },
    { q: 'Bir fonksiyon hem değer döndürüp hem ekrana yazabilir mi?', a: 'Evet ama genelde kötü fikirdir. Hesaplayan fonksiyon saf kalsın (yalnızca return), yazdırma işini çağıran kod yapsın. Böylece aynı fonksiyonu raporda, testte ve başka hesaplarda kullanabilirsin.' },
    { q: 'args ve kwargs adlarını değiştirebilir miyim?', a: 'Evet; önemli olan yıldızlar. def f(*fiyatlar, **secenekler) tamamen geçerlidir ve çoğu zaman daha okunurdur. args/kwargs yalnızca yaygın bir gelenektir.' },
    { q: 'return a, b yazınca gerçekten iki değer mi dönüyor?', a: 'Hayır, tek bir demet (tuple) döner. x, y = f() yazımı o demeti iki değişkene açar. Bu yüzden sonucu tek değişkene de alabilirsin: r = f(); r[0].' }
  ],
  mistakes: [
    { bad: 'def kdv(fiyat):\n    sonuc = fiyat * 1.2\nprint(kdv(100))', good: 'def kdv(fiyat):\n    return fiyat * 1.2\nprint(kdv(100))', why: 'return yazılmayan fonksiyon None döndürür; hesap yapılır ama dışarı çıkmaz.' },
    { bad: 'def f(oran=0.2, fiyat):\n    return fiyat * oran', good: 'def f(fiyat, oran=0.2):\n    return fiyat * oran', why: 'Varsayılan değerli parametreler sona konur; aksi hâlde SyntaxError.' },
    { bad: 'def ekle(x, liste=[]):\n    liste.append(x)\n    return liste', good: 'def ekle(x, liste=None):\n    if liste is None:\n        liste = []\n    liste.append(x)\n    return liste', why: 'Değişebilir varsayılan tüm çağrılar arasında paylaşılır; None ile her çağrıda yeni liste oluşur.' },
    { bad: 'indirim_uygula(uye=True, 1000)', good: 'indirim_uygula(1000, uye=True)', why: 'Anahtar sözcüklü argümandan sonra konumsal argüman gelemez.' }
  ]
},
