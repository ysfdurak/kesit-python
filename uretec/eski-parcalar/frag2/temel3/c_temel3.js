/* PythonPatika — Temel 3: Fonksiyonlar ve Modüller (fonksiyonlar, kapsam-moduller, string-bicimleme) */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
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
/* ───────────────────────── 2. kapsam-moduller ───────────────────────── */
{
  id: 'kapsam-moduller',
  lv: 'temel',
  mod: 'Fonksiyonlar ve Modüller',
  min: 28,
  title: 'Kapsam ve modüller',
  sum: 'Bir adın nerede geçerli olduğunu (LEGB) öğrenir, global tuzağından kaçınır, import biçimlerini ve __name__ kalıbını kavrar, math/random/statistics ile standart kütüphaneye ilk adımı atarsın.',
  goals: [
    'Yerel ve global kapsamı ayırt edip LEGB arama sırasını açıklayabilirim.',
    'global anahtar sözcüğünün ne zaman gerekip ne zaman tuzak olduğunu söyleyebilirim.',
    'import, from ... import ve as biçimlerini yerinde kullanabilirim.',
    'if __name__ == "__main__" kalıbının ne işe yaradığını anlatabilirim.',
    'math, random ve statistics modülleriyle hesap yapabilir, random için seed kullanabilirim.'
  ],
  body: `
<h2>Bir isim nerede görünür?</h2>
<p>Anadolu Bank'ta günlük işlem raporu üreten bir betik yazdın. Fonksiyonun içinde <code>toplam</code> adında bir değişken var, dışarıda da başka bir <code>toplam</code>. Hangisi hangisi? Python bunu <b>kapsam</b> (scope) kurallarıyla çözer: her ad belirli bir bölgede geçerlidir. Fonksiyon içinde atanan ad o fonksiyona aittir, dışarıdan görünmez; fonksiyon bittiğinde silinir.</p>
<pre class="py">komisyon_orani = 0.002          # global (modül düzeyi)

def komisyon(tutar):
    kesinti = tutar * komisyon_orani   # global okunur
    return round(kesinti, 2)

print(komisyon(15000))
print(komisyon_orani)
try:
    print(kesinti)               # yerel ad dışarıdan görünmez
except NameError as e:
    print("Hata:", e)</pre>
<p><code>kesinti</code> fonksiyonun <b>yerel</b> (local) değişkenidir; dışarıda yoktur. <code>komisyon_orani</code> ise <b>global</b>: modülün en üst düzeyinde tanımlandı, her fonksiyon onu okuyabilir.</p>

<h2>LEGB sırası</h2>
<p>Python bir adı gördüğünde dört katmanı sırayla arar: <b>L</b>ocal (içinde bulunulan fonksiyon), <b>E</b>nclosing (iç içe fonksiyonlarda dıştaki fonksiyon), <b>G</b>lobal (modül), <b>B</b>uilt-in (print, len gibi yerleşikler). İlk bulduğunda durur.</p>
<div class="tbl-wrap"><table>
<tr><th>Katman</th><th>Nerede tanımlanır</th><th>Örnek</th></tr>
<tr><td>Local</td><td>Fonksiyon gövdesinde atanan adlar ve parametreler</td><td><code>kesinti</code>, <code>tutar</code></td></tr>
<tr><td>Enclosing</td><td>İç fonksiyonu saran dış fonksiyonun yerelleri</td><td>iç fonksiyonun gördüğü <code>oran</code></td></tr>
<tr><td>Global</td><td>Dosyanın en üst düzeyi</td><td><code>komisyon_orani</code></td></tr>
<tr><td>Built-in</td><td>Python'ın kendisi</td><td><code>print</code>, <code>len</code>, <code>sum</code></td></tr>
</table></div>
<pre class="py">def rapor_hazirla(hesaplar):
    baslik = "Anadolu Bank Günlük Özet"     # enclosing

    def satir(ad, bakiye):
        return baslik[:12] + " | " + ad + ": " + str(bakiye)   # baslik dıştan okunur

    for ad, bakiye in hesaplar:
        print(satir(ad, bakiye))

rapor_hazirla([("Ayşe", 12500), ("Mehmet", 830)])
print(len("deneme"))      # built-in katmanı</pre>
<div class="warn"><b>Yerleşik adı ezme</b><code>sum = 0</code> ya da <code>list = [1, 2]</code> yazarsan built-in <code>sum</code>/<code>list</code> gölgelenir ve sonraki satırlarda <code>sum(fiyatlar)</code> "int object is not callable" hatası verir. Değişken adlarını yerleşiklerden seçme: <code>toplam</code>, <code>liste</code> de.</div>

<h2>global tuzağı</h2>
<p>Globali okumak serbesttir. Ama fonksiyon içinde ona <b>atama</b> yaparsan Python yeni bir yerel oluşturur; global değişmez. Hem okuyup hem değiştirmeye kalkarsan <code>UnboundLocalError</code> alırsın.</p>
<pre class="py">sayac = 0

def islem_kaydet_yanlis():
    sayac_yerel = sayac + 1      # okumak sorun değil
    return sayac_yerel

def islem_kaydet_global():
    global sayac
    sayac += 1

islem_kaydet_global()
islem_kaydet_global()
print("global sayaç:", sayac)

def islem_kaydet_temiz(sayac):
    return sayac + 1             # saf: değer al, yeni değer döndür

yeni = islem_kaydet_temiz(sayac)
print("temiz yol:", yeni)</pre>
<p><code>global sayac</code> satırı "bu fonksiyonda sayac derken modüldekini kastediyorum" der. Çalışır, ama bir programda on tane fonksiyon aynı globali değiştiriyorsa hangi değeri kimin bozduğunu bulmak kabusa döner. Kural: <b>değeri parametre olarak al, yenisini return et</b>. <code>global</code> yalnızca küçük betiklerde ve bilinçli kullanılan bir istisnadır.</p>
<div class="note"><b>nonlocal</b>İç içe fonksiyonlarda dıştaki fonksiyonun değişkenini değiştirmek için <code>nonlocal</code> kullanılır. Nadir gerekir; dekoratör ve kapanış (closure) konularında karşına çıkacak.</div>

<h2>Modül nedir, nasıl içe aktarılır?</h2>
<p>Bir <code>.py</code> dosyası aynı zamanda bir <b>modüldür</b> (module). <code>fiyat.py</code> içine <code>kdv_hesapla</code> yazdıysan başka dosyadan <code>import fiyat</code> deyip <code>fiyat.kdv_hesapla(100)</code> diye çağırırsın. Python'la gelen yüzlerce modüle <b>standart kütüphane</b> (standard library) denir; hiçbir şey kurmadan kullanılır. Dört import biçimi var:</p>
<pre class="py">import math                      # 1) modülü tümüyle al, math. öneki ile kullan
print(math.ceil(1234.1))

from math import sqrt, floor     # 2) yalnızca istenen adları al
print(sqrt(144), floor(7.9))

import statistics as st          # 3) kısa takma ad (alias)
print(st.mean([120, 85, 230]))

from random import randint as rastgele_tam   # 4) ada takma ad
print(type(rastgele_tam(1, 6)))</pre>
<p>Kurumsal kodda en yaygın olanlar 1 ve 3: <code>math.sqrt</code> yazımı, <code>sqrt</code>'nin nereden geldiğini okuyana söyler. <code>from x import *</code> ise bütün adları dosyaya boca eder; hangi ad nereden geldi belli olmaz, kaçın.</p>

<h2>if __name__ == "__main__"</h2>
<p>Her modülün <code>__name__</code> adlı bir değişkeni vardır. Dosya doğrudan çalıştırılıyorsa değeri <code>"__main__"</code>, başka bir dosya tarafından <code>import</code> edildiyse dosyanın adıdır. Bu sayede aynı dosya hem kütüphane hem de çalıştırılabilir betik olabilir: fonksiyonlar her zaman tanımlanır, ama "demo" ya da "ana akış" kodu yalnızca doğrudan çalıştırıldığında koşar.</p>
<pre class="py">def faiz_hesapla(anapara, yillik_oran, ay):
    """Basit faiz: anapara * oran * (ay / 12)"""
    return round(anapara * yillik_oran * ay / 12, 2)

def main():
    print("Anadolu Bank mevduat hesabı")
    print("6 ay, 50.000 TL, %40:", faiz_hesapla(50000, 0.40, 6))

print("__name__ değeri:", __name__)
if __name__ == "__main__":
    main()</pre>
<p>Bu dosyayı başka bir yerden <code>import faiz</code> dersen yalnızca <code>faiz_hesapla</code> ve <code>main</code> tanımlanır; demo satırları basılmaz. Yazdığın her betiğe bu kalıbı koymak, ileride test yazarken ve kodu başkasıyla paylaşırken hayat kurtarır.</p>

<h2>Standart kütüphaneye giriş: math, random, statistics</h2>
<pre class="py">import math, random, statistics

# math: matematik
print(math.ceil(2.1), math.floor(2.9), round(2.5), round(3.5))
print(math.sqrt(2), math.pi)

# statistics: temel istatistik
bakiyeler = [1200, 4500, 980, 4500, 13000]
print("ortalama:", statistics.mean(bakiyeler))
print("medyan:", statistics.median(bakiyeler))
print("mod:", statistics.mode(bakiyeler))

# random: rastgelelik, seed ile tekrarlanabilir
random.seed(42)
print(random.randint(1, 100))
print(random.choice(["İstanbul", "Ankara", "İzmir"]))
print(random.sample(range(1000, 2000), 3))</pre>
<p><code>random.seed(42)</code> rastgele sayı üretecini sabit bir başlangıca getirir; aynı seed, aynı dizi. Test yazarken ve sahte veri üretirken bu şart: aksi hâlde testin her koşuda farklı veri görür. <code>round</code>'un 2.5'i 2'ye, 3.5'i 4'e yuvarladığına dikkat et; bu "bankacı yuvarlaması"dır (round half to even), <code>math.floor</code> ve <code>math.ceil</code> ise her zaman aşağı/yukarı gider.</p>
<div class="tip"><b>os ve sys kısaca</b><code>os.getcwd()</code> çalışma klasörünü, <code>os.listdir()</code> dosyaları, <code>sys.argv</code> komut satırı argümanlarını, <code>sys.version</code> Python sürümünü verir. Dosya işlemleri dersinde <code>os</code> ve <code>pathlib</code>'e döneceğiz. Tarayıcı ortamında dosya sistemi bellek içidir, o yüzden burada <code>os.listdir</code> çıktısı bilgisayarındakinden farklı görünür.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Modül bir kez yüklenir</h3>
<p>Aynı modülü on dosyada import etsen de Python onu bir kez çalıştırır ve <code>sys.modules</code> sözlüğünde saklar; sonraki importlar oradan döner. Bu yüzden modülün en üst düzeyine yazdığın kod (örneğin bir veritabanı bağlantısı) yalnızca ilk importta koşar. Modülün üst düzeyinde "iş" yapma; fonksiyon tanımla, işi <code>main()</code> içinde yap.</p>
<h3>Paketler ve kendi modüllerin</h3>
<p>Klasörün içine <code>__init__.py</code> koyarsan o klasör bir <b>paket</b> (package) olur: <code>from anadolu.fiyat import kdv_hesapla</code>. Python modülü bulmak için <code>sys.path</code> listesindeki klasörlere sırayla bakar; ilk sırada çalıştırılan dosyanın klasörü vardır. "ModuleNotFoundError" aldığında ilk kontrol edeceğin şey bu listedir. Git ve proje yapısı dersinde paket düzenine ayrıntılı gireceğiz.</p>
<h3>Kapsam neden önemli?</h3>
<p>Globale bağımlı fonksiyon, dışarıdaki durumu bilmeden test edilemez. Bir üretim sisteminde "fonksiyon dün çalışıyordu, bugün bozuldu" hatalarının büyük kısmı bir yerde değiştirilen global bir değerden çıkar. Fonksiyona ihtiyacı olan her şeyi parametre olarak vermek (dependency injection fikrinin en sade hâli) kodu hem test edilebilir hem taşınabilir yapar.</p>
</section>
`,
  ex: [
    { t: 'mc', q: 'Aşağıdaki kod ne yazdırır?<br><code>x = 10</code><br><code>def f():</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;x = 5</code><br><code>f()</code><br><code>print(x)</code>',
      o: ['5', '10', 'UnboundLocalError', 'None'], a: 1,
      why: 'Fonksiyon içindeki x = 5 yeni bir yerel değişken oluşturur; global x\'e dokunmaz. Globali değiştirmek için global x gerekirdi.' },
    { t: 'code', id: 'kapsam-moduller-1',
      q: '<p>Aşağıdaki kod <code>global</code> kullanarak <code>toplam_islem</code> sayacını artırıyor. Kodu globalsiz, saf bir fonksiyona çevir: <code>islem_ekle(sayac, tutar)</code> fonksiyonu mevcut sayaç değerini ve tutarı alsın, tutar 0\'dan büyükse sayacı 1 artırılmış olarak, değilse aynı değerle döndürsün. Global değişken kullanma.</p>',
      start: 'toplam_islem = 0\n\ndef islem_ekle(tutar):\n    global toplam_islem\n    if tutar > 0:\n        toplam_islem += 1\n\n# islem_ekle(sayac, tutar) olarak yeniden yaz\n',
      sol: 'def islem_ekle(sayac, tutar):\n    if tutar > 0:\n        return sayac + 1\n    return sayac\n',
      tests: 'assert "global " not in __source__, "global anahtar sözcüğü kullanılmamalı"\nassert islem_ekle(0, 250) == 1, "pozitif tutar sayacı 1 artırmalı"\nassert islem_ekle(5, 0) == 5, "sıfır tutar sayacı değiştirmemeli"\nassert islem_ekle(5, -40) == 5, "negatif tutar sayacı değiştirmemeli"\ns = 0\nfor t in [100, -5, 30, 0, 70]:\n    s = islem_ekle(s, t)\nassert s == 3, "beş işlemden üçü pozitif: sayaç 3 olmalı"\n',
      hints: ['Fonksiyon iki parametre alsın: sayac ve tutar.', 'Değiştirmek yerine yeni değeri return et.'],
      why: 'Saf fonksiyon dış durumu değiştirmez: mevcut değeri parametre olarak alır, yeni değeri döndürür. Çağıran yer sonucu değişkene atar.' },
    { t: 'mc', q: 'Hangi import biçimi, bir modüldeki tüm adları dosyaya kontrolsüzce döktüğü için ekip kodunda kaçınılması gereken biçimdir?',
      o: ['import math', 'from math import sqrt', 'from math import *', 'import statistics as st'], a: 2,
      why: 'Yıldızlı import modüldeki her adı mevcut ad alanına ekler; hangi adın nereden geldiği belirsizleşir ve var olan adlar sessizce ezilebilir. Diğer üç biçim açık ve okunurdur.' },
    { t: 'code', id: 'kapsam-moduller-2',
      q: '<p><code>math</code> modülünü kullanarak <code>kargo_kutusu(adet, kutu_kapasitesi)</code> fonksiyonunu yaz: verilen adet ürünü taşımak için gereken kutu sayısını döndürsün (yukarı yuvarlanmış tam sayı). Ayrıca <code>taksit_tutari(toplam, ay)</code> fonksiyonu toplam tutarı aya bölüp sonucu 2 ondalığa yuvarlasın ve döndürsün.</p>',
      start: 'import math\n\ndef kargo_kutusu(adet, kutu_kapasitesi):\n    pass\n\ndef taksit_tutari(toplam, ay):\n    pass\n',
      sol: 'import math\n\ndef kargo_kutusu(adet, kutu_kapasitesi):\n    return math.ceil(adet / kutu_kapasitesi)\n\ndef taksit_tutari(toplam, ay):\n    return round(toplam / ay, 2)\n',
      tests: 'assert kargo_kutusu(10, 4) == 3, "10 ürün, 4\'lük kutu: 3 kutu"\nassert kargo_kutusu(8, 4) == 2, "8 ürün, 4\'lük kutu: 2 kutu"\nassert kargo_kutusu(1, 12) == 1, "1 ürün: 1 kutu"\nassert isinstance(kargo_kutusu(10, 4), int), "kutu sayısı tam sayı olmalı"\nassert taksit_tutari(1000, 3) == 333.33, "1000 / 3 iki ondalıkla 333.33"\nassert taksit_tutari(2400, 12) == 200.0, "2400 / 12 = 200.0"\n',
      hints: ['math.ceil(x) sayıyı yukarı yuvarlar ve int döndürür.', 'round(toplam / ay, 2) kuruş hassasiyeti verir.'],
      why: 'Kutu sayısında yarım kutu olmaz; math.ceil yukarı yuvarlar. Taksitte ise kuruş için round(…, 2) yeter.' },
    { t: 'code', id: 'kapsam-moduller-3',
      q: '<p><code>statistics</code> modülüyle <code>bakiye_ozeti(bakiyeler)</code> fonksiyonunu yaz. Sayı listesinden üç değerli bir demet döndürsün: ortalama (2 ondalığa yuvarlanmış), medyan ve en yüksek değer.</p>',
      start: 'import statistics\n\ndef bakiye_ozeti(bakiyeler):\n    # (ortalama, medyan, en_yuksek) döndür\n    pass\n',
      sol: 'import statistics\n\ndef bakiye_ozeti(bakiyeler):\n    ort = round(statistics.mean(bakiyeler), 2)\n    med = statistics.median(bakiyeler)\n    return ort, med, max(bakiyeler)\n',
      tests: 'r = bakiye_ozeti([1200, 4500, 980, 4500, 13000])\nassert r == (4836.0, 4500, 13000), "beklenen (4836.0, 4500, 13000), gelen %r" % (r,)\nr2 = bakiye_ozeti([10, 20, 30, 40])\nassert r2[0] == 25.0 and r2[1] == 25.0 and r2[2] == 40, "çift sayıda eleman: medyan ortadaki ikinin ortalaması"\nassert bakiye_ozeti([7]) == (7, 7, 7), "tek elemanlı liste"\n',
      hints: ['statistics.mean ve statistics.median kullan.', 'En yüksek için yerleşik max yeter.'],
      why: 'statistics modülü ortalama ve medyanı hazır verir; demet döndürerek üç değeri tek seferde yollarsın.' },
    { t: 'code', id: 'kapsam-moduller-4',
      q: '<p><code>random</code> modülüyle <code>sahte_siparisler(n, seed)</code> fonksiyonunu yaz. Önce <code>random.seed(seed)</code> çağırsın, sonra n adet sipariş üretip liste olarak döndürsün. Her sipariş bir sözlük: <code>{"sehir": ..., "tutar": ...}</code>. Şehir <code>["İstanbul", "Ankara", "İzmir"]</code> listesinden <code>random.choice</code> ile, tutar <code>random.randint(50, 500)</code> ile seçilsin.</p>',
      start: 'import random\n\nSEHIRLER = ["İstanbul", "Ankara", "İzmir"]\n\ndef sahte_siparisler(n, seed):\n    pass\n',
      sol: 'import random\n\nSEHIRLER = ["İstanbul", "Ankara", "İzmir"]\n\ndef sahte_siparisler(n, seed):\n    random.seed(seed)\n    liste = []\n    for _ in range(n):\n        liste.append({"sehir": random.choice(SEHIRLER), "tutar": random.randint(50, 500)})\n    return liste\n',
      tests: 'a = sahte_siparisler(5, 1)\nassert len(a) == 5, "5 sipariş üretilmeli"\nassert all(set(s.keys()) == {"sehir", "tutar"} for s in a), "her sipariş sehir ve tutar anahtarlarını taşımalı"\nassert all(s["sehir"] in ["İstanbul", "Ankara", "İzmir"] for s in a), "şehir listeden seçilmeli"\nassert all(50 <= s["tutar"] <= 500 for s in a), "tutar 50-500 aralığında olmalı"\nb = sahte_siparisler(5, 1)\nassert a == b, "aynı seed aynı siparişleri üretmeli"\nassert sahte_siparisler(0, 3) == [], "n=0 boş liste vermeli"\n',
      hints: ['Fonksiyonun ilk satırı random.seed(seed) olsun.', 'for _ in range(n): ile n kez sözlük oluşturup listeye ekle.'],
      why: 'seed sabitlenince choice ve randint aynı sırayı üretir; test bu sayede iki çağrının birebir eşit olduğunu doğrulayabilir.' },
    { t: 'mc', q: 'Bir dosyada <code>if __name__ == "__main__":</code> bloğu ne zaman çalışır?',
      o: ['Dosya başka bir modülden import edildiğinde', 'Dosya doğrudan çalıştırıldığında', 'Her zaman', 'Yalnızca main() fonksiyonu tanımlıysa'], a: 1,
      why: 'Doğrudan çalıştırılan dosyanın __name__ değeri "__main__" olur; import edilen dosyada ise modülün adıdır ve blok atlanır. Böylece aynı dosya hem kütüphane hem betik olur.' },
    { t: 'code', id: 'kapsam-moduller-5',
      q: '<p><code>net_maas(brut, kesinti_orani=0.15)</code> fonksiyonu brütten kesinti düşüp sonucu 2 ondalığa yuvarlayarak döndürsün. Ardından <code>main()</code> fonksiyonu tanımla; bu fonksiyon <code>print(net_maas(30000))</code> çalıştırsın. <code>main()</code> çağrısı yalnızca <code>if __name__ == "__main__":</code> bloğunun içinde olsun.</p>',
      start: 'def net_maas(brut, kesinti_orani=0.15):\n    pass\n\ndef main():\n    pass\n\n# __name__ kontrolü ile main() çağır\n',
      sol: 'def net_maas(brut, kesinti_orani=0.15):\n    return round(brut * (1 - kesinti_orani), 2)\n\ndef main():\n    print(net_maas(30000))\n\nif __name__ == "__main__":\n    main()\n',
      tests: 'assert net_maas(30000) == 25500.0, "30000 brüt, %15 kesinti: 25500.0"\nassert net_maas(10000, 0.2) == 8000.0, "10000 brüt, %20 kesinti: 8000.0"\nassert "__name__" in __source__ and "__main__" in __source__, "if __name__ == \\"__main__\\": kalıbı kullanılmalı"\n',
      expect: '25500.0\n',
      hints: ['net = brut * (1 - kesinti_orani).', 'Dosyanın sonuna if __name__ == "__main__": main() yaz.'],
      why: 'Bu ortamda kod doğrudan çalıştığı için __name__ "__main__" olur ve main() koşar; aynı dosya import edilseydi yalnızca fonksiyonlar tanımlanırdı.' }
  ],
  faq: [
    { q: 'Fonksiyon içinden global değişkeni okumak için de global yazmam gerekir mi?', a: 'Hayır. Okumak serbesttir; LEGB sırası globali bulur. global yalnızca fonksiyon içinde o ada yeni bir değer atamak istediğinde gerekir ve o da genelde kötü tasarım işaretidir.' },
    { q: 'import math ile from math import sqrt arasında performans farkı var mı?', a: 'Pratikte yok; modül her iki durumda da bir kez yüklenir. Fark okunurluktur: math.sqrt yazımı adın nereden geldiğini gösterir, bu yüzden ekip kodunda tercih edilir.' },
    { q: 'random.seed olmadan testler neden bozulur?', a: 'Seed verilmezse üreteç sistem saatinden başlar ve her koşuda farklı sayı üretir. Test "beklenen değer" ile karşılaştıramaz. Seed sabitlenince dizi tekrarlanabilir olur.' },
    { q: 'Kendi yazdığım .py dosyasını nasıl import ederim?', a: 'Aynı klasöre koy ve dosya adını .py olmadan yaz: fiyat.py için import fiyat. Dosya adı Python kurallarına uymalı (boşluk ve tire yok) ve standart kütüphane modülleriyle çakışmamalı; random.py adlı bir dosya gerçek random modülünü gölgeler.' }
  ],
  mistakes: [
    { bad: 'sayac = 0\ndef art():\n    sayac += 1', good: 'def art(sayac):\n    return sayac + 1', why: 'Fonksiyon içinde atama yapılan ad yerel sayılır; okunmadan artırılamaz ve UnboundLocalError verir. Parametre al, değer döndür.' },
    { bad: 'sum = 0\nfor f in fiyatlar:\n    sum += f\nprint(sum(fiyatlar))', good: 'toplam = 0\nfor f in fiyatlar:\n    toplam += f\nprint(sum(fiyatlar))', why: 'sum adını değişkene verince yerleşik sum fonksiyonu gölgelenir ve çağrı "int object is not callable" hatası verir.' },
    { bad: 'import math\nprint(sqrt(16))', good: 'import math\nprint(math.sqrt(16))', why: 'import math yalnızca math adını getirir; sqrt\'ye math. öneki ile ulaşılır ya da from math import sqrt yazılır.' },
    { bad: 'main()', good: 'if __name__ == "__main__":\n    main()', why: 'Koşulsuz çağrı, dosya import edildiğinde de main()\'i çalıştırır; kalıp bunu yalnızca doğrudan çalıştırmaya sınırlar.' }
  ]
},
/* ───────────────────────── 3. string-bicimleme ───────────────────────── */
{
  id: 'string-bicimleme',
  lv: 'temel',
  mod: 'Fonksiyonlar ve Modüller',
  min: 28,
  title: 'Metin biçimlendirme ve rapor üretme',
  sum: 'f-string ile hizalama, genişlik, binlik ayırıcı, yüzde ve ondalık biçimlerini öğrenir; format(), çok satırlı metin ve ljust/rjust ile Anadolu Bank hesap özeti gibi düzgün tablolu raporlar üretirsin.',
  goals: [
    'f-string içinde hizalama (<, >, ^), genişlik ve dolgu karakteri kullanabilirim.',
    'Sayıları binlik ayırıcı, sabit ondalık ve yüzde olarak biçimlendirebilirim.',
    'format() fonksiyonu ve str.format yöntemini f-string ile karşılaştırabilirim.',
    'Çok satırlı metin ve döngüyle sütunları hizalı bir tablo yazdırabilirim.',
    'Türkçe karakter içeren metinlerde ljust/rjust ve len davranışını açıklayabilirim.'
  ],
  body: `
<h2>Neden biçimlendirme?</h2>
<p>Anadolu Bank'ın müşteri hizmetleri ekibi her sabah bir hesap özeti görmek istiyor: hesap adı, bakiye, son işlem. <code>print(ad, bakiye)</code> ile çıkan "Ayşe 12500.5" satırı doğru ama okunmaz; bakiyeler alt alta hizalanmıyor, binlikler ayrılmıyor, kuruşlar bazen bir bazen iki hane. Raporun işe yaraması için metni <b>biçimlendirmen</b> (formatting) gerekir. Python'da bunun ana aracı f-string; bu derste süslü parantezin içindeki iki noktadan sonrasını, yani <b>biçim belirtecini</b> (format spec) öğreneceksin.</p>

<h2>f-string hatırlatma ve biçim belirteci</h2>
<p><code>f"..."</code> içinde <code>{ifade}</code> yazarsın; Python ifadeyi hesaplayıp metne gömer. İki nokta ile belirteç eklersin: <code>{deger:belirtec}</code>. Belirtecin genel sırası şöyledir: <b>dolgu</b> + <b>hizalama</b> + <b>genişlik</b> + <b>binlik</b> + <b>.ondalık</b> + <b>tür</b>. Her parça isteğe bağlıdır.</p>
<pre class="py">bakiye = 12500.5
print(f"[{bakiye}]")           # ham
print(f"[{bakiye:.2f}]")       # 2 ondalık
print(f"[{bakiye:,.2f}]")      # binlik ayırıcı + 2 ondalık
print(f"[{bakiye:12,.2f}]")    # 12 karakter genişlik, sağa hizalı (sayı varsayılanı)
print(f"[{bakiye:&lt;12,.2f}]")   # sola hizalı
print(f"[{bakiye:^12,.2f}]")   # ortalı
print(f"[{bakiye:*&gt;12,.2f}]")  # yıldızla doldur, sağa hizala</pre>
<p>Sayılar varsayılan olarak <b>sağa</b>, metinler <b>sola</b> hizalanır. Bu raporlarda tam istediğin şeydir: sütun başlığı solda, tutarlar sağda alt alta.</p>
<div class="tbl-wrap"><table>
<tr><th>Belirteç</th><th>Anlamı</th><th>Örnek</th><th>Sonuç</th></tr>
<tr><td><code>:.2f</code></td><td>Sabit 2 ondalık</td><td><code>f"{3.14159:.2f}"</code></td><td>3.14</td></tr>
<tr><td><code>:,</code></td><td>Binlik ayırıcı (virgül)</td><td><code>f"{1234567:,}"</code></td><td>1,234,567</td></tr>
<tr><td><code>:_</code></td><td>Binlik ayırıcı (alt çizgi)</td><td><code>f"{1234567:_}"</code></td><td>1_234_567</td></tr>
<tr><td><code>:.1%</code></td><td>Yüzde, 1 ondalık (100 ile çarpar)</td><td><code>f"{0.1575:.1%}"</code></td><td>15.8%</td></tr>
<tr><td><code>:10</code></td><td>En az 10 karakter genişlik</td><td><code>f"{'ad':10}"</code></td><td>ad ve 8 boşluk</td></tr>
<tr><td><code>:&gt;10</code> / <code>:&lt;10</code> / <code>:^10</code></td><td>Sağa / sola / ortaya hizala</td><td><code>f"{'ad':^6}"</code></td><td>"  ad  "</td></tr>
<tr><td><code>:05d</code></td><td>Tam sayı, sıfırla 5 haneye doldur</td><td><code>f"{42:05d}"</code></td><td>00042</td></tr>
<tr><td><code>:+.1f</code></td><td>İşareti her zaman göster</td><td><code>f"{250.0:+.1f}"</code></td><td>+250.0</td></tr>
<tr><td><code>:e</code></td><td>Bilimsel gösterim</td><td><code>f"{1500000:.2e}"</code></td><td>1.50e+06</td></tr>
</table></div>
<pre class="py">oran = 0.1575
siparis_no = 42
fark = -1250.75
print(f"Faiz oranı: {oran:.2%}")
print(f"Sipariş no: {siparis_no:06d}")
print(f"Değişim: {fark:+,.2f} TL")
print(f"Başlık: {'Özet':-^30}")
print(f"{'Hesap':&lt;12}{'Bakiye':&gt;14}")
print(f"{'Ayşe':&lt;12}{12500.5:&gt;14,.2f}")
print(f"{'Mehmet Can':&lt;12}{830:&gt;14,.2f}")</pre>
<div class="tip"><b>Hata ayıklama kısayolu</b><code>f"{bakiye=}"</code> yazımı hem adı hem değeri basar: <code>bakiye=12500.5</code>. Değişken takibi için print'e en hızlı yol.</div>
<div class="note"><b>Türkçe binlik ve ondalık</b>Python'ın <code>,</code> ayırıcısı İngiliz biçimidir (1,234.50). Türkçe "1.234,50" için en pratik yol biçimlendirip karakterleri takas etmektir: <code>f"{x:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")</code>. <code>locale</code> modülü de var ama sistem ayarına bağlıdır, tarayıcıda ve sunucuda farklı davranabilir.</div>

<h2>format() ve str.format</h2>
<p>f-string Python 3.6'da geldi; eski kodda ve bazı özel durumlarda iki akraba görürsün. <code>format(deger, belirtec)</code> fonksiyonu tek bir değeri biçimlendirir; belirteci bir değişkende tutabildiğin için "kullanıcı hangi ondalık sayısını istediyse" gibi dinamik senaryolarda işe yarar. <code>"...{}...".format(x)</code> yöntemi ise şablonu önceden hazırlayıp sonra doldurmak için kullanılır, örneğin bir ayar dosyasından okunan mesaj kalıbında.</p>
<pre class="py">x = 1234.5678
print(format(x, ",.2f"))
print(format(x, "&gt;15.1f"))

ondalik = 3
print(f"{x:.{ondalik}f}")          # f-string içinde iç içe belirteç

sablon = "Sayın {ad}, {tarih} itibarıyla bakiyeniz {bakiye:,.2f} TL'dir."
print(sablon.format(ad="Ayşe Yılmaz", tarih="28.10.2026", bakiye=12500.5))
print("{0} - {1} - {0}".format("A", "B"))</pre>
<p>Günlük kodda tercih sırası: önce f-string, şablon dışarıdan geliyorsa <code>str.format</code>, tek değer ve dinamik belirteç için <code>format()</code>. <code>%</code> işaretli eski biçimlendirmeyi (<code>"%s" % ad</code>) yalnızca eski kodda görürsün; yeni kodda kullanma.</p>

<h2>Çok satırlı metin</h2>
<p>Üç tırnak, satır sonlarını koruyan metin oluşturur ve f-string ile birleşebilir. Bir hesap özetinin başlığı için biçilmiş kaftan:</p>
<pre class="py">musteri = "Ayşe Yılmaz"
hesap_no = "TR33 0006 1005 1978 6457 8413 26"
bakiye = 12500.5
baslik = f"""{'ANADOLU BANK':^40}
{'Hesap Özeti':^40}
{'=' * 40}
Müşteri : {musteri}
IBAN    : {hesap_no}
Bakiye  : {bakiye:,.2f} TL
{'=' * 40}"""
print(baslik)</pre>
<p>Girintili bir fonksiyon içinde üç tırnaklı metin yazdığında satır başlarındaki boşluklar da metne girer; o durumda <code>textwrap.dedent</code> yardımcı olur. Tek satırlık uzun metinleri bölmek içinse yan yana yazılan tırnaklı parçalar otomatik birleşir: <code>("a" "b")</code> → <code>"ab"</code>.</p>

<h2>Basit tablo yazdırma</h2>
<p>Gerçek iş: hesap listesinden hizalı bir tablo üret. Kalıp hep aynıdır: başlık satırı, ayraç çizgisi, döngüde her satır aynı genişliklerle, en altta toplam. Genişlikleri bir yerde sabit tutarsan başlık ve satırlar asla kaymaz.</p>
<pre class="py">hesaplar = [
    ("Ayşe Yılmaz", "Vadesiz", 12500.5, 3),
    ("Mehmet Can", "Vadeli", 830, 0),
    ("Şirin Öztürk", "Vadesiz", 148200.75, 12),
    ("İlker Ağaoğlu", "Kredi", -5400, 1),
]
G_AD, G_TUR, G_BAK, G_ISL = 16, 9, 14, 6
print(f"{'Müşteri':&lt;{G_AD}}{'Tür':&lt;{G_TUR}}{'Bakiye (TL)':&gt;{G_BAK}}{'İşlem':&gt;{G_ISL}}")
print("-" * (G_AD + G_TUR + G_BAK + G_ISL))
toplam = 0
for ad, tur, bakiye, islem in hesaplar:
    print(f"{ad:&lt;{G_AD}}{tur:&lt;{G_TUR}}{bakiye:&gt;{G_BAK},.2f}{islem:&gt;{G_ISL}}")
    toplam += bakiye
print("-" * (G_AD + G_TUR + G_BAK + G_ISL))
print(f"{'TOPLAM':&lt;{G_AD + G_TUR}}{toplam:&gt;{G_BAK},.2f}")</pre>
<p>Genişlikleri de süslü parantezle gömebildiğine dikkat et: <code>{ad:&lt;{G_AD}}</code>. Sütun genişliğini verinin en uzun elemanından hesaplamak istersen <code>max(len(h[0]) for h in hesaplar) + 2</code> yeter.</p>

<h2>Türkçe karakter ve ljust/rjust</h2>
<p><code>str.ljust(n)</code>, <code>str.rjust(n)</code> ve <code>str.center(n)</code> f-string hizalamasının yöntem hâlidir; ikinci argümanla dolgu karakteri alırlar. Bir listeyi sütun sütun yazdırırken f-string kadar sık kullanılır.</p>
<pre class="py">print("Şube".ljust(10, ".") + "|")
print("İzmir".rjust(10) + "|")
print("Çağrı".center(11, "*") + "|")
print(len("İzmir"), len("Izmir"))
print(len("Şirin Öztürk"), len("Sirin Ozturk"))
for sehir in ["İstanbul", "Çorum", "Iğdır", "Muş"]:
    print(sehir.ljust(10) + "|" + str(len(sehir)).rjust(3))</pre>
<p>Python 3 metinleri Unicode olarak tutar; <code>len("İzmir")</code> 5'tir, hizalama Türkçe harflerle de doğru çalışır. İki yerde dikkat: <b>büyük-küçük dönüşümünde</b> <code>"ı".upper()</code> "I", ama <code>"I".lower()</code> "i" verir (Türkçe noktasız ı Unicode'un genel kuralında yoktur), bu yüzden şehir adlarını karşılaştırırken <code>casefold</code> yerine sabit bir sözlükten yararlanmak daha güvenlidir. Ve <b>terminal fontu</b> bazı karakterleri farklı genişlikte çizebilir; hizalama karakter sayısına göredir, piksele göre değil.</p>
<div class="warn"><b>Para ile float</b>Raporda <code>:.2f</code> kuruşu düzgün gösterir ama arka planda 0.1 + 0.2 hâlâ 0.30000000000000004'tür. Gösterim için f-string, hesap için (özellikle bankacılıkta) <code>decimal.Decimal</code> kullanılır. Orta seviyede ayrıntısına gireceğiz; şimdilik biçimlendirmenin hesabı değil görünümü düzelttiğini unutma.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>__format__ ve özel biçimler</h3>
<p>Belirteçler yalnızca sayı ve metin için değildir. <code>datetime</code> nesneleri kendi belirteçlerini tanır: <code>f"{tarih:%d.%m.%Y}"</code>. Kendi sınıfını yazdığında <code>__format__</code> yöntemini tanımlayarak <code>f"{hesap:kisa}"</code> gibi özel biçimler kurabilirsin. Bu, raporlama kütüphanelerinin arkasındaki mekanizmadır.</p>
<h3>Gerçek raporlarda ne kullanılır?</h3>
<p>Düz metin tablo, log dosyaları ve terminal araçları için hâlâ standarttır. E-posta ve web raporlarında aynı veriyi HTML tablosuna, Excel'e ya da PDF'e dökersin; pandas'ın <code>to_string</code>, <code>to_markdown</code> ve <code>to_excel</code> yöntemleri bu dersteki kalıbın endüstriyel sürümüdür. <code>tabulate</code> ve <code>rich</code> gibi üçüncü parti paketler de renkli, çerçeveli terminal tabloları üretir. Temel mantık değişmez: genişlik, hizalama, ondalık.</p>
<h3>Biçimlendirme ve güvenlik</h3>
<p>Kullanıcıdan gelen metni doğrudan <code>str.format</code> şablonu olarak kullanma: <code>kullanici_metni.format(...)</code> yazımı, kötü niyetli bir şablonun nesne özelliklerine erişmesine kapı açar. Şablon senin, veri kullanıcının olsun; f-string bu açıdan daha güvenlidir çünkü şablon kodun içindedir.</p>
</section>
`,
  ex: [
    { t: 'mc', q: '<code>f"{1234567.891:,.1f}"</code> ifadesi ne üretir?',
      o: ['1,234,567.9', '1234567.9', '1.234.567,9', '1,234,567.891'], a: 0,
      why: 'Virgül binlik ayırıcı ekler, .1f ise bir ondalığa yuvarlar. Python\'ın , ayırıcısı İngiliz biçimidir; Türkçe biçim için ayrıca replace gerekir.' },
    { t: 'code', id: 'string-bicimleme-1',
      q: '<p><code>tutar_yazisi(tutar)</code> fonksiyonunu yaz: sayıyı binlik ayırıcılı, iki ondalıklı ve sonunda <code> TL</code> ekiyle metin olarak döndürsün. Örnek: <code>tutar_yazisi(12500.5)</code> → <code>"12,500.50 TL"</code>.</p>',
      start: 'def tutar_yazisi(tutar):\n    pass\n',
      sol: 'def tutar_yazisi(tutar):\n    return f"{tutar:,.2f} TL"\n',
      tests: 'assert tutar_yazisi(12500.5) == "12,500.50 TL", "12500.5 -> 12,500.50 TL"\nassert tutar_yazisi(830) == "830.00 TL", "830 -> 830.00 TL"\nassert tutar_yazisi(1234567.891) == "1,234,567.89 TL", "1234567.891 -> 1,234,567.89 TL"\nassert tutar_yazisi(-5400) == "-5,400.00 TL", "negatif tutar"\n',
      hints: ['Belirteç: virgül ve .2f birlikte, yani :,.2f', 'f"{tutar:,.2f} TL" döndür.'],
      why: 'Virgül binlik ayırıcı, .2f sabit iki ondalık verir; metnin sonuna boşluk ve TL eklenir.' },
    { t: 'code', id: 'string-bicimleme-2',
      q: '<p><code>yuzde_degisim(eski, yeni)</code> fonksiyonunu yaz: iki değer arasındaki yüzde değişimi ((yeni - eski) / eski) <b>işaretli</b> ve bir ondalıklı yüzde metni olarak döndürsün. Örnek: <code>yuzde_degisim(200, 250)</code> → <code>"+25.0%"</code>, <code>yuzde_degisim(200, 150)</code> → <code>"-25.0%"</code>.</p>',
      start: 'def yuzde_degisim(eski, yeni):\n    pass\n',
      sol: 'def yuzde_degisim(eski, yeni):\n    oran = (yeni - eski) / eski\n    return f"{oran:+.1%}"\n',
      tests: 'assert yuzde_degisim(200, 250) == "+25.0%", "200 -> 250: +25.0%"\nassert yuzde_degisim(200, 150) == "-25.0%", "200 -> 150: -25.0%"\nassert yuzde_degisim(1000, 1000) == "+0.0%", "değişim yoksa +0.0%"\nassert yuzde_degisim(80, 100.4) == "+25.5%", "80 -> 100.4: +25.5%"\n',
      hints: ['Önce oranı hesapla: (yeni - eski) / eski.', 'Belirteç :+.1% hem işareti gösterir hem 100 ile çarpıp % ekler.'],
      why: '% türü oranı 100 ile çarpıp yüzde işareti ekler; + ise pozitif değerlerde de işaret basar.' },
    { t: 'mc', q: '<code>f"{\'Ad\':*^8}"</code> ifadesinin sonucu hangisidir?',
      o: ['Ad******', '******Ad', '***Ad***', 'Hata verir'], a: 2,
      why: 'Belirteçte * dolgu karakteri, ^ ortalama, 8 genişliktir. İki harflik Ad, 8 karakter içinde ortalanır: her iki yana üçer yıldız.' },
    { t: 'code', id: 'string-bicimleme-3',
      q: '<p><code>hesap_satiri(ad, tur, bakiye)</code> fonksiyonunu yaz. Tek satırlık metin döndürsün: ad 16 karakter sola hizalı, tür 9 karakter sola hizalı, bakiye 14 karakter sağa hizalı, binlik ayırıcılı ve iki ondalıklı. Toplam uzunluk 39 karakter olmalı.</p>',
      start: 'def hesap_satiri(ad, tur, bakiye):\n    pass\n',
      sol: 'def hesap_satiri(ad, tur, bakiye):\n    return f"{ad:<16}{tur:<9}{bakiye:>14,.2f}"\n',
      tests: 's = hesap_satiri("Ayşe Yılmaz", "Vadesiz", 12500.5)\nassert len(s) == 39, "satır 39 karakter olmalı, gelen %d" % len(s)\nassert s.startswith("Ayşe Yılmaz     "), "ad 16 karakter sola hizalı olmalı"\nassert s[16:25] == "Vadesiz  ", "tür 9 karakter sola hizalı olmalı"\nassert s[25:] == "     12,500.50", "bakiye 14 karakter sağa hizalı, binlik ve 2 ondalık olmalı"\ns2 = hesap_satiri("Mehmet Can", "Vadeli", 830)\nassert s2 == "Mehmet Can      Vadeli           830.00", "ikinci satır: %r" % s2\n',
      hints: ['Üç süslü parantezi yan yana yaz; aralarına boşluk koyma.', 'Metin için :<16, sayı için :>14,.2f'],
      why: 'Sabit genişlikler sayesinde her satır aynı sütunlarda başlar; başlık satırıyla aynı genişlikler kullanılırsa tablo hizalı çıkar.' },
    { t: 'code', id: 'string-bicimleme-4',
      q: '<p>Aşağıdaki <code>hesaplar</code> listesinden bir tablo yazdır. Önce başlık satırı: <code>Müşteri</code> 14 karakter sola, <code>Bakiye</code> 12 karakter sağa hizalı. Sonra 26 tireden oluşan bir çizgi. Sonra her hesap için ad 14 sola, bakiye 12 sağa (binlik, 2 ondalık). En sonda yine 26 tire ve <code>TOPLAM</code> 14 sola, toplam bakiye 12 sağa.</p>',
      start: 'hesaplar = [("Ayşe", 12500.5), ("Mehmet", 830), ("Şirin", 148200.75)]\n# tabloyu yazdır\n',
      sol: 'hesaplar = [("Ayşe", 12500.5), ("Mehmet", 830), ("Şirin", 148200.75)]\nprint(f"{\'Müşteri\':<14}{\'Bakiye\':>12}")\nprint("-" * 26)\ntoplam = 0\nfor ad, bakiye in hesaplar:\n    print(f"{ad:<14}{bakiye:>12,.2f}")\n    toplam += bakiye\nprint("-" * 26)\nprint(f"{\'TOPLAM\':<14}{toplam:>12,.2f}")\n',
      expect: 'Müşteri             Bakiye\n--------------------------\nAyşe             12,500.50\nMehmet              830.00\nŞirin           148,200.75\n--------------------------\nTOPLAM          161,531.25\n',
      hints: ['Başlık ve satırlar aynı genişlikleri kullanmalı: 14 ve 12.', 'Döngüde toplamı biriktir, çizgiden sonra yazdır.', '"-" * 26 yirmi altı tire üretir.'],
      why: 'Başlık, satırlar ve toplam aynı genişlik belirteçlerini paylaştığı için sütunlar kaymaz; sayılar sağa hizalanınca ondalıklar alt alta gelir.' },
    { t: 'code', id: 'string-bicimleme-5',
      q: '<p><code>ozet_metni(musteri, bakiye, islem_sayisi)</code> fonksiyonunu yaz. Üç satırlık bir metin döndürsün (satırlar <code>\\n</code> ile ayrılsın, sonda satır sonu olmasın):</p><pre class="out">Müşteri : &lt;ad&gt;\nBakiye  : &lt;binlik, 2 ondalık&gt; TL\nİşlem   : &lt;sayı&gt; adet</pre><p>Örnek: <code>ozet_metni("Ayşe", 12500.5, 3)</code> ikinci satırda <code>Bakiye  : 12,500.50 TL</code> içermeli.</p>',
      start: 'def ozet_metni(musteri, bakiye, islem_sayisi):\n    pass\n',
      sol: 'def ozet_metni(musteri, bakiye, islem_sayisi):\n    return f"""Müşteri : {musteri}\nBakiye  : {bakiye:,.2f} TL\nİşlem   : {islem_sayisi} adet"""\n',
      tests: 'm = ozet_metni("Ayşe", 12500.5, 3)\nsatirlar = m.split("\\n")\nassert len(satirlar) == 3, "üç satır olmalı, gelen %d" % len(satirlar)\nassert satirlar[0] == "Müşteri : Ayşe", "ilk satır: %r" % satirlar[0]\nassert satirlar[1] == "Bakiye  : 12,500.50 TL", "ikinci satır: %r" % satirlar[1]\nassert satirlar[2] == "İşlem   : 3 adet", "üçüncü satır: %r" % satirlar[2]\nassert ozet_metni("Mehmet", 830, 0).split("\\n")[1] == "Bakiye  : 830.00 TL", "830 -> 830.00 TL"\n',
      hints: ['Üç tırnaklı f-string ya da "\\n" ile birleştirilmiş tek satırlık f-string kullanabilirsin.', 'Etiketlerdeki boşluklara dikkat: "Müşteri : ", "Bakiye  : ", "İşlem   : "'],
      why: 'Çok satırlı f-string satır sonlarını korur; bakiye için :,.2f belirteci rapor biçimini verir.' },
    { t: 'mc', q: '<code>"İzmir".ljust(8, ".")</code> ifadesinin sonucu nedir?',
      o: ['"...İzmir"', '"İzmir..."', '"İzmir...."', '"Izmir..."'], a: 1,
      why: 'ljust metni sola yaslar ve sağı dolgu karakteriyle 8 karaktere tamamlar; İzmir 5 karakter olduğundan üç nokta eklenir. Python 3 Unicode kullandığı için İ tek karakterdir ve değişmez.' }
  ],
  faq: [
    { q: 'f-string içinde süslü parantezin kendisini nasıl yazarım?', a: 'İki kere yaz: f"{{ve}}" çıktısı {ve} olur. Tek süslü parantez her zaman ifade başlangıcı sayılır.' },
    { q: 'Türkçe biçim (1.234,50) için locale kullanmalı mıyım?', a: 'locale sistem ayarına bağlıdır; tarayıcıda, Windows\'ta ve Linux sunucuda farklı sonuç verebilir. Küçük raporlarda replace ile takas güvenlidir; büyük projelerde Babel gibi paketler kullanılır.' },
    { q: 'Yuvarlama için round mu :.2f mi?', a: ':.2f yalnızca görünümü değiştirir, değer aynı kalır; round değeri değiştirir. Raporda :.2f, sonraki hesapta kullanılacak değerde round tercih edilir. Para hesabında ise decimal.Decimal.' },
    { q: 'Tablo sütun genişliğini nasıl otomatik bulurum?', a: 'Her sütun için en uzun değerin uzunluğunu al: g = max(len(str(x)) for x in sutun) + 2. Sonra f"{deger:<{g}}" ile genişliği gömebilirsin.' }
  ],
  mistakes: [
    { bad: 'print(f"{bakiye:2f}")', good: 'print(f"{bakiye:.2f}")', why: 'Nokta olmadan 2, genişlik sayılır; ondalık sayısı için .2 gerekir.' },
    { bad: 'print(f"Toplam: {toplam}")  # 12500.5', good: 'print(f"Toplam: {toplam:,.2f}")  # 12,500.50', why: 'Ham float kuruşu düzensiz gösterir; raporda sabit ondalık ve binlik ayırıcı kullan.' },
    { bad: 'print(f"{oran}%")  # 0.1575%', good: 'print(f"{oran:.1%}")  # 15.8%', why: 'Oran 0-1 aralığındaysa % belirteci 100 ile çarpıp işareti ekler; elle % eklemek yanlış sayı gösterir.' },
    { bad: 'print("Ad".ljust(10) + "Bakiye".ljust(10))\nprint("Ayşe".ljust(10) + f"{bakiye:.2f}")', good: 'print(f"{\'Ad\':<10}{\'Bakiye\':>12}")\nprint(f"{\'Ayşe\':<10}{bakiye:>12,.2f}")', why: 'Sayı sütunu sağa hizalanmalı ve başlıkla aynı genişliği kullanmalı; aksi hâlde ondalıklar alt alta gelmez.' }
  ]
}
);
})(window);
