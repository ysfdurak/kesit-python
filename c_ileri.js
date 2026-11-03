(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
/* ========================= 1. numpy ========================= */
  { id: 'numpy', lv: 'ileri', mod: 'Veri Bilimi Araçları', min: 35, needs: ['numpy'],
    title: 'numpy: sayısal diziler ve vektörleştirme',
    sum: 'ndarray, dtype ve şekil; döngüsüz (vektörleştirilmiş) hesap, broadcasting, maske ile seçim, eksen bazlı özet ve default_rng ile rastgele veri.',
    goals: ['ndarray oluşturup dtype ve shape bilgisini okuyabilirim', 'Döngü yerine vektörleştirilmiş işlem ve broadcasting kullanabilirim', 'Boolean maske ve fancy indeksleme ile alt küme seçebilirim', 'axis parametresiyle satır/sütun bazlı özet çıkarabilirim', 'default_rng ile tekrarlanabilir rastgele veri üretebilirim'],
    body: `<h2>Neden numpy?</h2>
<p>Anadolu Market\'in 3 şubesi 7 gün boyunca saatlik satış kaydı tutuyor. Her şube için günlük ortalama, her gün için şube toplamı, 1000 TL üstü saatlerin sayısı... Bunları saf Python listeleriyle de yazabilirsin ama iç içe döngüler hem yavaş hem de okunması zor olur. <b>numpy</b>, bu tür sayısal işleri tek satırda ve C hızında yapan kütüphanedir; pandas da altında numpy dizileri kullanır. Önce numpy\'ı anlayan, pandas\'ı çok daha rahat öğrenir.</p>

<h2>ndarray: tek tipli, sabit şekilli dizi</h2>
<p>Python listesi her türden nesne tutabilir; numpy dizisi (ndarray) ise <b>tek bir veri türü</b> (dtype) tutar ve belleğe yan yana yerleşir. Bu yüzden hızlıdır. Dizinin boyutlarını <code>shape</code> verir.</p>
<pre class="py">import numpy as np

fiyatlar = np.array([129.9, 45.5, 899.0, 12.75])
print(fiyatlar.dtype, fiyatlar.shape, fiyatlar.ndim)

adetler = np.array([3, 10, 1, 24])          # tam sayı dizisi
print(adetler.dtype)

# 3 şube x 7 gün (satır = şube, sütun = gün)
satis = np.array([
    [120, 135, 150, 110, 180, 240, 260],
    [ 80,  95,  70,  90, 130, 200, 210],
    [200, 210, 190, 220, 260, 320, 350],
])
print(satis.shape)            # (3, 7)
print(np.zeros(3), np.arange(0, 10, 2), np.linspace(0, 1, 5))
print(satis.reshape(7, 3).shape)   # aynı veri, farklı şekil
</pre>
<div class="note"><b>dtype seçimi</b>Varsayılan tam sayı türü 64 bit (int64), kayan nokta float64. Bellek kritikse <code>dtype=np.float32</code> verebilirsin ama hassasiyet düşer. Bir diziye farklı türde değer karıştırırsan numpy hepsini "en geniş" türe yükseltir: tam sayı + ondalık → float.</div>

<h2>Vektörleştirme: döngüyü numpy\'a devret</h2>
<p>Liste ile <code>[f * a for f, a in zip(fiyatlar, adetler)]</code> yazarsın; numpy ile doğrudan <code>fiyatlar * adetler</code>. Aritmetik, karşılaştırma ve matematik fonksiyonları (np.sqrt, np.log, np.round) <b>eleman eleman</b> çalışır. Buna vektörleştirme (vectorization) denir.</p>
<pre class="py">import numpy as np

fiyatlar = np.array([129.9, 45.5, 899.0, 12.75])
adetler = np.array([3, 10, 1, 24])

tutar = fiyatlar * adetler
print(tutar)
print(np.round(tutar * 1.20, 2))        # KDV dahil, 2 basamak
print(tutar.sum(), tutar.mean().round(2), tutar.max())
print(tutar.argmax())                   # en büyük tutarın indeksi
</pre>

<h3>Broadcasting: şekiller uyuşmasa da hesap</h3>
<p>Skaler ile diziyi çarpmak broadcasting\'in en basit hali: 1.20 sayısı dizinin her elemanına "yayılır". Kural şudur: iki dizinin şekilleri sağdan sola karşılaştırılır; her boyutta ya eşit olmalı ya da biri 1 olmalı. (3, 7) ile (7,) uyar (her satıra aynı 7\'li vektör), (3, 7) ile (3, 1) uyar (her satıra kendi katsayısı).</p>
<pre class="py">import numpy as np

satis = np.array([
    [120, 135, 150, 110, 180, 240, 260],
    [ 80,  95,  70,  90, 130, 200, 210],
    [200, 210, 190, 220, 260, 320, 350],
])
hedef = np.array([150, 150, 150, 150, 200, 250, 250])   # (7,) gün hedefi
print((satis &gt;= hedef).astype(int))        # her satıra yayıldı

katsayi = np.array([[1.0], [1.5], [0.8]])    # (3, 1) şube katsayısı
print(np.round(satis * katsayi)[0, :3])      # her satır kendi katsayısıyla

try:
    satis + np.array([1, 2, 3])              # (3,) ile (3, 7) uymaz
except ValueError as e:
    print("Hata:", e)
</pre>

<h2>İndeksleme ve maske</h2>
<p>Listedeki gibi <code>d[0]</code>, <code>d[1:3]</code> çalışır; iki boyutta <code>satis[1, 2]</code> (2. şube, 3. gün) ve <code>satis[:, 0]</code> (tüm şubelerin ilk günü). En güçlü araç <b>boolean maske</b>: bir karşılaştırma True/False dizisi üretir, bunu köşeli paranteze verince yalnızca True olanlar seçilir.</p>
<pre class="py">import numpy as np

tutar = np.array([389.7, 455.0, 899.0, 306.0, 1250.0, 75.5])
maske = tutar &gt; 400
print(maske)
print(tutar[maske])                 # 400 üstü tutarlar
print(maske.sum())                  # kaç tane? (True = 1)
print(np.where(tutar &gt; 400, "büyük", "küçük"))
print(tutar[[0, 2, 4]])             # fancy indeksleme: indeks listesi
print(tutar[(tutar &gt; 300) &amp; (tutar &lt; 1000)])   # ve: &amp;, veya: |, değil: ~
</pre>
<div class="warn"><b>and/or değil &amp; ve |</b>Maske birleştirirken Python\'ın <code>and</code>/<code>or</code>\'u çalışmaz ("truth value of an array is ambiguous"). <code>&amp;</code>, <code>|</code>, <code>~</code> kullan ve her karşılaştırmayı paranteze al; çünkü <code>&amp;</code> işleminin önceliği <code>&gt;</code>\'den yüksektir.</div>

<h2>Eksen (axis) ile özet</h2>
<p>İki boyutlu dizide <code>sum()</code> her şeyi toplar. <code>axis=0</code> satırlar boyunca yürür, yani <b>her sütun için</b> bir sonuç verir; <code>axis=1</code> sütunlar boyunca yürür, <b>her satır için</b> sonuç verir. Ezber yolu: axis, "yok olacak" boyuttur.</p>
<div class="tbl-wrap"><table><tr><th>İfade</th><th>Anlamı (satır = şube, sütun = gün)</th><th>Sonuç şekli</th></tr>
<tr><td><code>satis.sum()</code></td><td>Tüm satış</td><td>skaler</td></tr>
<tr><td><code>satis.sum(axis=0)</code></td><td>Her günün şube toplamı</td><td>(7,)</td></tr>
<tr><td><code>satis.sum(axis=1)</code></td><td>Her şubenin haftalık toplamı</td><td>(3,)</td></tr>
<tr><td><code>satis.mean(axis=1)</code></td><td>Her şubenin günlük ortalaması</td><td>(3,)</td></tr>
<tr><td><code>satis.argmax(axis=1)</code></td><td>Her şubenin en iyi günü (indeks)</td><td>(3,)</td></tr>
</table></div>

<h2>Rastgele veri: default_rng</h2>
<p>Test verisi, simülasyon ve örnekleme için numpy\'ın modern üreteci <code>np.random.default_rng(seed)</code>. Eski <code>np.random.seed</code> yerine bunu kullan; aynı seed aynı diziyi verir, bu da testleri tekrarlanabilir yapar.</p>
<pre class="py">import numpy as np

rng = np.random.default_rng(42)
gunluk = rng.integers(100, 500, size=7)        # 100-499 arası tam sayı
print(gunluk)
sure = rng.normal(loc=3.2, scale=0.5, size=5)  # ortalama 3.2, sapma 0.5
print(np.round(sure, 2))
print(rng.choice(["Ankara", "İzmir", "Bursa"], size=4))
print(rng.random(3).round(3))                  # 0-1 arası
</pre>

<h2>Hız farkı nereden geliyor?</h2>
<p>Python listesinde her sayı ayrı bir nesnedir; toplarken yorumlayıcı her adımda tür kontrolü yapar. numpy dizisi tek bloktur ve döngü C\'de döner. Fark küçük veride göze batmaz, bir milyon elemanda onlarca kata çıkar.</p>
<pre class="py">import numpy as np, timeit

n = 200_000
liste = list(range(n))
dizi = np.arange(n)

t_liste = timeit.timeit(lambda: sum(x * 2 for x in liste), number=5)
t_numpy = timeit.timeit(lambda: (dizi * 2).sum(), number=5)
print(f"liste: {t_liste:.4f} s  numpy: {t_numpy:.4f} s  oran: {t_liste / t_numpy:.0f}x")
</pre>
<div class="tip"><b>Altın kural</b>numpy dizisinin üstünde <code>for</code> döngüsü görürsen dur ve sor: bu işlem bir dizi ifadesiyle yazılabilir mi? Neredeyse her zaman evet.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Görünüm (view) mü kopya mı?</h3>
<p>Dilimleme (<code>d[2:5]</code>) yeni bellek ayırmaz, aynı veriye bakan bir <b>görünüm</b> döndürür; görünümü değiştirirsen asıl dizi de değişir. Boolean maske ve fancy indeksleme ise <b>kopya</b> üretir. Bağımsız bir parça istiyorsan <code>.copy()</code> çağır. Aynı mantık <code>reshape</code> için de geçerlidir.</p>
<h3>Bellek ve dtype</h3>
<p>Bir milyon float64 yaklaşık 8 MB, float32 4 MB tutar. <code>d.nbytes</code> ile ölç. Tam sayı taşması (overflow) numpy\'da sessizdir: int8 dizisine 200 yazarsan değer "döner". Kurumsal veride para tutarları için float64 ya da pandas tarafında Decimal benzeri çözümler tercih edilir.</p>
<h3>İş hayatında</h3>
<p>numpy\'ı çoğu zaman doğrudan değil, pandas sütunlarının altındaki motor olarak kullanırsın: <code>np.where</code> ile koşullu sütun, <code>np.percentile</code> ile eşik, <code>np.allclose</code> ile kayan nokta karşılaştırması. Lineer cebir (<code>np.linalg</code>) ve makine öğrenmesi kütüphaneleri de ndarray bekler.</p>
</section>`,
    ex: [
      { t: 'mc', q: '<code>satis</code> şekli (3, 7) olan bir dizi. <code>satis.mean(axis=0)</code> sonucunun şekli nedir?',
        o: ['(3,)', '(7,)', '(3, 7)', 'skaler'], a: 1,
        why: 'axis=0 satır boyutunu yok eder; her sütun (gün) için bir ortalama kalır, yani 7 eleman. axis=1 olsaydı (3,) olurdu.' },
      { t: 'code', id: 'numpy-1',
        q: '<p><code>kdv_ekle(fiyatlar, oran=0.20)</code> fonksiyonunu yaz. <code>fiyatlar</code> bir liste ya da numpy dizisi olabilir; fonksiyon numpy dizisine çevirip her fiyata KDV ekleyerek 2 basamağa yuvarlanmış bir <b>numpy dizisi</b> döndürsün. Döngü kullanma.</p>',
        start: 'import numpy as np\n\ndef kdv_ekle(fiyatlar, oran=0.20):\n    # np.asarray ile diziye çevir, vektörleştirilmiş hesap yap\n    pass\n',
        sol: 'import numpy as np\n\ndef kdv_ekle(fiyatlar, oran=0.20):\n    d = np.asarray(fiyatlar, dtype=float)\n    return np.round(d * (1 + oran), 2)\n',
        tests: 'import numpy as np\nr = kdv_ekle([100, 50.5, 12.75])\nassert isinstance(r, np.ndarray), "Sonuç numpy dizisi olmalı"\nassert r.tolist() == [120.0, 60.6, 15.3], "KDV %20 ile [120.0, 60.6, 15.3] bekleniyor"\nassert kdv_ekle(np.array([200.0]), 0.10).tolist() == [220.0], "oran=0.10 için 220.0 bekleniyor"\nassert kdv_ekle([]).shape == (0,), "Boş girdi boş dizi vermeli"\n',
        hints: ['np.asarray(fiyatlar, dtype=float) ile her girdiyi diziye çevir.', 'd * (1 + oran) tüm elemanlara uygulanır; np.round(..., 2) ile yuvarla.'],
        why: 'asarray liste/dizi fark etmeksizin ndarray verir; çarpma ve round eleman eleman çalışır, döngüye gerek kalmaz.' },
      { t: 'code', id: 'numpy-2',
        q: '<p>Satır = şube, sütun = gün olan 2 boyutlu <code>matris</code> için <code>sube_ozet(matris)</code> yaz. Sözlük döndürsün: <code>"sube_toplam"</code> → her şubenin toplamı (liste), <code>"gun_ort"</code> → her günün şube ortalaması (liste, 1 basamak yuvarlanmış), <code>"en_iyi_gun"</code> → her şube için en yüksek satışlı günün indeksi (liste).</p>',
        start: 'import numpy as np\n\ndef sube_ozet(matris):\n    m = np.asarray(matris)\n    pass\n',
        sol: 'import numpy as np\n\ndef sube_ozet(matris):\n    m = np.asarray(matris)\n    return {\n        "sube_toplam": m.sum(axis=1).tolist(),\n        "gun_ort": np.round(m.mean(axis=0), 1).tolist(),\n        "en_iyi_gun": m.argmax(axis=1).tolist(),\n    }\n',
        tests: 'm = [[120, 135, 150], [80, 95, 70], [200, 210, 190]]\nr = sube_ozet(m)\nassert r["sube_toplam"] == [405, 245, 600], "sube_toplam axis=1 ile hesaplanmalı"\nassert r["gun_ort"] == [133.3, 146.7, 136.7], "gun_ort axis=0 ortalaması, 1 basamak"\nassert r["en_iyi_gun"] == [2, 1, 1], "en_iyi_gun argmax(axis=1) olmalı"\n',
        hints: ['Şube toplamı için sütunlar yok olmalı: axis=1.', 'Gün ortalaması için satırlar yok olmalı: axis=0.', 'argmax(axis=1) her satırın en büyük indeksini verir; .tolist() ile listeye çevir.'],
        why: 'axis seçimi "hangi boyut kaybolacak" sorusuyla yapılır. tolist() numpy türlerini saf Python\'a çevirir; JSON ya da test için gerekir.' },
      { t: 'code', id: 'numpy-3',
        q: '<p><code>buyuk_siparisler(tutarlar, esik)</code> fonksiyonu, tutarı <code>esik</code>\'ten büyük <b>veya eşit</b> olan siparişlerin indekslerini liste olarak ve bu siparişlerin toplam tutarını demet olarak döndürsün: <code>(indeksler, toplam)</code>. Boolean maske kullan.</p>',
        start: 'import numpy as np\n\ndef buyuk_siparisler(tutarlar, esik):\n    d = np.asarray(tutarlar, dtype=float)\n    pass\n',
        sol: 'import numpy as np\n\ndef buyuk_siparisler(tutarlar, esik):\n    d = np.asarray(tutarlar, dtype=float)\n    maske = d >= esik\n    return np.nonzero(maske)[0].tolist(), float(d[maske].sum())\n',
        tests: 'idx, top = buyuk_siparisler([389.7, 455.0, 899.0, 306.0, 1250.0, 75.5], 400)\nassert idx == [1, 2, 4], "400 ve üstü indeksler [1, 2, 4] olmalı"\nassert abs(top - 2604.0) < 1e-6, "toplam 2604.0 olmalı"\nidx2, top2 = buyuk_siparisler([10, 20], 50)\nassert idx2 == [] and top2 == 0, "Hiç eşleşme yoksa boş liste ve 0"\n',
        hints: ['maske = d >= esik True/False dizisi verir.', 'np.nonzero(maske)[0] True olan indeksleri verir; d[maske].sum() toplamı.'],
        why: 'Maske hem seçim (d[maske]) hem de sayım/indeks bulma (nonzero, sum) için kullanılır; iki işi tek karşılaştırma yapar.' },
      { t: 'mc', q: 'Şekli (3, 1) olan dizi ile şekli (1, 4) olan dizi toplanırsa sonuç ne olur?',
        o: ['ValueError, şekiller uyuşmuyor', '(3, 4) şeklinde dizi', '(3, 1) şeklinde dizi', '(4,) şeklinde dizi'], a: 1,
        why: 'Her boyutta biri 1 olduğundan broadcasting iki tarafı da genişletir: 3 satır, 4 sütun. Bu, çarpım tablosu gibi dış işlemler için sık kullanılır.' },
      { t: 'code', id: 'numpy-4',
        q: '<p><code>simule_satis(n, seed)</code> fonksiyonu <code>np.random.default_rng(seed)</code> ile 100 ile 500 arasında (500 hariç) <code>n</code> adet tam sayıdan oluşan bir numpy dizisi döndürsün. Ardından <code>z_skor(dizi)</code> fonksiyonu <code>(x - ortalama) / standart_sapma</code> formülüyle z-skor dizisini döndürsün (numpy std, ddof=0).</p>',
        start: 'import numpy as np\n\ndef simule_satis(n, seed):\n    pass\n\ndef z_skor(dizi):\n    pass\n',
        sol: 'import numpy as np\n\ndef simule_satis(n, seed):\n    rng = np.random.default_rng(seed)\n    return rng.integers(100, 500, size=n)\n\ndef z_skor(dizi):\n    d = np.asarray(dizi, dtype=float)\n    return (d - d.mean()) / d.std()\n',
        tests: 'import numpy as np\na = simule_satis(50, 7)\nassert isinstance(a, np.ndarray) and a.shape == (50,), "50 elemanlı numpy dizisi bekleniyor"\nassert a.min() >= 100 and a.max() < 500, "Değerler 100-499 aralığında olmalı"\nassert simule_satis(50, 7).tolist() == a.tolist(), "Aynı seed aynı diziyi vermeli"\nz = z_skor([10, 20, 30])\nassert abs(z.mean()) < 1e-9, "z-skor ortalaması 0 olmalı"\nassert abs(z.std() - 1) < 1e-9, "z-skor sapması 1 olmalı"\nassert np.allclose(z, [-1.2247449, 0, 1.2247449]), "[10,20,30] için yaklaşık [-1.22, 0, 1.22]"\n',
        hints: ['rng.integers(100, 500, size=n) üst sınırı hariç tutar.', 'z_skor için ortalama ve std diziden tek seferde hesaplanır; işlem broadcasting ile her elemana uygulanır.'],
        why: 'default_rng tekrarlanabilir üretim sağlar; z-skor vektörleştirilmiş tek bir ifadedir, aykırı değer tespitinin ilk adımıdır.' },
      { t: 'mc', q: '<code>b = a[2:5]</code> yazıp <code>b[0] = 0</code> yaptın. <code>a</code> dizisi için ne söylenebilir?',
        o: ['Değişmez; dilimleme kopya üretir', 'a[2] de 0 olur; dilim bir görünümdür', 'Hata verir', 'Yalnızca a float ise değişir'], a: 1,
        why: 'numpy\'da temel dilimleme view döndürür, aynı belleği paylaşır. Bağımsız kopya için a[2:5].copy() gerekir. Boolean maske ve fancy indeksleme ise kopya verir.' }
    ],
    faq: [
      { q: 'Liste yerine ne zaman numpy kullanmalıyım?', a: 'Elemanlar aynı türde sayıysa ve üzerinde toplu matematik yapacaksan numpy. Karışık türde, sık ekleme/çıkarma yapılan koleksiyonlar için liste daha doğaldır.' },
      { q: 'np.random.seed ile default_rng arasındaki fark ne?', a: 'seed küresel durumu değiştirir ve başka kodların rastgeleliğini etkiler. default_rng bağımsız bir üreteç nesnesi verir; fonksiyonlara parametre olarak geçirilebilir ve testler izole kalır.' },
      { q: 'Dizi içinde eksik değer nasıl gösterilir?', a: 'float dizilerde np.nan kullanılır; np.isnan ile bulunur, np.nanmean gibi nan-güvenli fonksiyonlarla özetlenir. Tam sayı dizisinde nan olmaz; pandas bu eksikliği kendi türleriyle kapatır.' }
    ],
    mistakes: [
      { bad: 'tutar[(tutar > 300) and (tutar < 1000)]', good: 'tutar[(tutar > 300) & (tutar < 1000)]', why: 'and bir dizinin doğruluk değerini ister, bu belirsizdir ve hata verir; eleman eleman mantık için & ve | kullanılır.' },
      { bad: 'tutar[tutar > 300 & tutar < 1000]', good: 'tutar[(tutar > 300) & (tutar < 1000)]', why: '& işleci karşılaştırmadan önce çalışır; parantez olmadan 300 & tutar hesaplanır ve sonuç anlamsız olur.' },
      { bad: 'for i in range(len(d)):\n    d[i] = d[i] * 1.2', good: 'd = d * 1.2', why: 'Eleman eleman döngü numpy\'ın hız avantajını yok eder; aynı işi vektörleştirilmiş ifade yapar.' },
      { bad: 'np.random.seed(0)\nx = np.random.randint(0, 10, 5)', good: 'rng = np.random.default_rng(0)\nx = rng.integers(0, 10, 5)', why: 'Küresel seed yerine bağımsız üreteç hem modern API hem de test izolasyonu sağlar.' }
    ]
  },

  /* ========================= 2. pandas-giris ========================= */
  { id: 'pandas-giris', lv: 'ileri', mod: 'Veri Bilimi Araçları', min: 40, needs: ['pandas'],
    title: 'pandas giriş: Series ve DataFrame',
    sum: 'Series/DataFrame yapısı, read_csv ile veri yükleme, head/info/describe ile tanıma, loc/iloc ve boolean seçim, yeni sütun ve sıralama.',
    goals: ['Series ve DataFrame arasındaki farkı açıklayabilirim', 'CSV metnini read_csv ile DataFrame\'e yükleyebilirim', 'head/info/describe ile veriyi hızla tanıyabilirim', 'loc, iloc ve boolean maske ile satır/sütun seçebilirim', 'Yeni sütun türetip veriyi sıralayabilirim'],
    body: `<h2>Tablo düşünmek</h2>
<p>Anadolu Market\'in sipariş verisi bir tablodur: her satır bir sipariş, her sütun bir alan (müşteri, şehir, tutar, tarih). Excel\'de yaptığın filtreleme, sıralama, yeni sütun ekleme işlerini kodla ve tekrarlanabilir biçimde yapmanın aracı <b>pandas</b>\'tır. İki temel yapı var: <b>Series</b> (tek sütun, etiketli dizi) ve <b>DataFrame</b> (sütunlardan oluşan tablo). DataFrame\'in her sütunu bir Series\'tir.</p>

<h2>Series: etiketli tek boyut</h2>
<pre class="py">import pandas as pd

stok = pd.Series({"kahve": 120, "çay": 340, "şeker": 15, "un": 0})
print(stok)
print(stok["çay"])              # etiketle erişim
print(stok[stok &lt; 50])          # boolean maske
print(stok.sum(), stok.idxmax())
print((stok * 2).head(2))       # vektörleştirilmiş, numpy gibi
</pre>
<p>Series\'in bir <b>index</b>\'i (etiketler) ve <b>values</b>\'u (numpy dizisi) vardır. Etiket vermezsen 0, 1, 2... kullanılır.</p>

<h2>DataFrame oluşturma ve CSV yükleme</h2>
<p>Gerçek işte veri genelde CSV, Excel ya da veritabanından gelir. <code>pd.read_csv</code> bir dosya yolu alır; burada dosya yerine <code>io.StringIO</code> ile bellekteki metni dosya gibi veriyoruz. Aynı fonksiyon, aynı parametreler.</p>
<pre class="py">import pandas as pd, io

csv_metni = """siparis_id,musteri,sehir,kategori,adet,fiyat,tarih
1001,Ayşe,İstanbul,Gıda,3,45.5,2024-03-01
1002,Mehmet,Ankara,Elektronik,1,899.0,2024-03-01
1003,Ayşe,İstanbul,Gıda,10,12.75,2024-03-02
1004,Zeynep,İzmir,Kozmetik,2,129.9,2024-03-02
1005,Ali,Ankara,Gıda,6,45.5,2024-03-03
1006,Zeynep,İzmir,Elektronik,1,1250.0,2024-03-03
"""
df = pd.read_csv(io.StringIO(csv_metni), parse_dates=["tarih"])
print(df.head(3))
print(df.shape, list(df.columns))
print(df.dtypes)
</pre>
<div class="tip"><b>parse_dates</b>Tarih sütununu baştan datetime yapmak sonradan <code>to_datetime</code> çağırmaktan kolaydır. Biçim özelse <code>date_format="%d.%m.%Y"</code> ver.</div>

<h2>Veriyi tanımak: head, info, describe</h2>
<p>Yeni bir veri setine ilk bakışta üç komut: <code>head()</code> ilk satırlar, <code>info()</code> sütun türleri ve eksik sayısı, <code>describe()</code> sayısal özet (ortalama, çeyrekler, min/max). Ek olarak <code>value_counts()</code> kategorik sütunun dağılımını verir.</p>
<pre class="py">import pandas as pd, io

csv_metni = """siparis_id,musteri,sehir,kategori,adet,fiyat
1001,Ayşe,İstanbul,Gıda,3,45.5
1002,Mehmet,Ankara,Elektronik,1,899.0
1003,Ayşe,İstanbul,Gıda,10,12.75
1004,Zeynep,İzmir,Kozmetik,2,129.9
1005,Ali,Ankara,Gıda,6,45.5
"""
df = pd.read_csv(io.StringIO(csv_metni))
df.info()
print(df.describe().round(1))
print(df["sehir"].value_counts())
print(df["kategori"].unique(), df["kategori"].nunique())
</pre>

<h2>Seçme: sütun, loc, iloc, maske</h2>
<p>Dört yol, dört farklı soru:</p>
<div class="tbl-wrap"><table><tr><th>Yazım</th><th>Ne seçer</th><th>Örnek</th></tr>
<tr><td><code>df["tutar"]</code></td><td>Tek sütun (Series)</td><td><code>df["sehir"]</code></td></tr>
<tr><td><code>df[["a", "b"]]</code></td><td>Birden çok sütun (DataFrame)</td><td><code>df[["musteri", "sehir"]]</code></td></tr>
<tr><td><code>df.loc[etiket, sütun]</code></td><td>Etiketle satır/sütun</td><td><code>df.loc[2, "sehir"]</code>, <code>df.loc[df.adet &gt; 2, ["musteri"]]</code></td></tr>
<tr><td><code>df.iloc[konum, konum]</code></td><td>Sıra numarasıyla</td><td><code>df.iloc[0]</code>, <code>df.iloc[:3, 1:3]</code></td></tr>
<tr><td><code>df[maske]</code></td><td>Koşula uyan satırlar</td><td><code>df[df.sehir == "Ankara"]</code></td></tr>
</table></div>
<pre class="py">import pandas as pd, io

csv_metni = """siparis_id,musteri,sehir,kategori,adet,fiyat
1001,Ayşe,İstanbul,Gıda,3,45.5
1002,Mehmet,Ankara,Elektronik,1,899.0
1003,Ayşe,İstanbul,Gıda,10,12.75
1004,Zeynep,İzmir,Kozmetik,2,129.9
1005,Ali,Ankara,Gıda,6,45.5
"""
df = pd.read_csv(io.StringIO(csv_metni))
print(df.loc[1, "musteri"])                  # etiket 1 (varsayılan index)
print(df.iloc[-1])                           # son satır
print(df.loc[df["sehir"] == "Ankara", ["musteri", "fiyat"]])
print(df[(df["kategori"] == "Gıda") &amp; (df["adet"] &gt;= 5)])
print(df[df["sehir"].isin(["İzmir", "Ankara"])]["siparis_id"].tolist())
</pre>
<div class="warn"><b>loc etiket, iloc konum</b>Varsayılan index 0,1,2 olduğunda ikisi aynı sonucu verir ve fark gözükmez. Filtreledikten sonra index 1, 4 gibi seyrek kalır: <code>loc[1]</code> etiketi 1 olan satırı, <code>iloc[1]</code> ikinci satırı verir. Dilimde de fark var: <code>loc[0:2]</code> 2 dahil, <code>iloc[0:2]</code> hariç.</div>

<h2>Yeni sütun ve sıralama</h2>
<p>Sütunlar arası aritmetik numpy gibi vektörleştirilmiştir. Yeni sütun atamak için <code>df["tutar"] = ...</code> ya da zincirleme kullanımda <code>df.assign(tutar=...)</code>. Sıralama <code>sort_values</code>, en büyük n için <code>nlargest</code>.</p>
<pre class="py">import pandas as pd, io

csv_metni = """siparis_id,musteri,sehir,adet,fiyat
1001,Ayşe,İstanbul,3,45.5
1002,Mehmet,Ankara,1,899.0
1003,Ayşe,İstanbul,10,12.75
1004,Zeynep,İzmir,2,129.9
1005,Ali,Ankara,6,45.5
"""
df = pd.read_csv(io.StringIO(csv_metni))
df["tutar"] = df["adet"] * df["fiyat"]
df["buyuk"] = df["tutar"] &gt; 200
print(df.sort_values("tutar", ascending=False).head(3))
print(df.sort_values(["sehir", "tutar"], ascending=[True, False])[["sehir", "tutar"]])
print(df.nlargest(2, "tutar")[["musteri", "tutar"]])
print(df.assign(kdv=lambda d: d["tutar"] * 0.2)[["tutar", "kdv"]].head(2))
</pre>
<div class="note"><b>Kopya mı, görünüm mü?</b>pandas 2.x ve 3.x, Copy-on-Write kuralına geçiyor: filtrelenmiş bir DataFrame\'e <code>df[maske]["tutar"] = 0</code> şeklinde zincirle atama yapma; asıl tabloyu değiştirmez. Her zaman <code>df.loc[maske, "tutar"] = 0</code> yaz.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Index kavramı</h3>
<p>Index yalnızca satır numarası değildir; müşteri numarası ya da tarih olabilir (<code>df.set_index("siparis_id")</code>). O zaman <code>loc</code> gerçek iş anahtarıyla çalışır ve birleştirme/hizalama (alignment) otomatik olur: iki Series toplandığında aynı etiketler eşleşir, olmayanlar NaN olur. <code>reset_index()</code> geri döner.</p>
<h3>Büyük veride</h3>
<p>Milyonlarca satırda <code>read_csv</code>\'ye <code>usecols</code> (gerekli sütunlar), <code>dtype</code> (küçük türler) ve <code>chunksize</code> (parça parça okuma) ver. <code>df.memory_usage(deep=True)</code> ile sütun başına bellek ölçülür; tekrar eden metinler için <code>category</code> türü çoğu zaman belleği onda birine indirir.</p>
<h3>İş hayatında</h3>
<p>Analist olarak ilk saatin hep aynıdır: yükle, <code>info</code>, <code>describe</code>, <code>value_counts</code>, birkaç maske. Bu "keşif" aşamasını küçük fonksiyonlara ayırırsan (yükle, filtrele, türet) hem test yazabilir hem de aynı raporu her ay tek komutla üretirsin.</p>
</section>`,
    ex: [
      { t: 'code', id: 'pandas-giris-1',
        q: '<p><code>yukle(csv_metni)</code> fonksiyonu verilen CSV metnini <code>io.StringIO</code> ve <code>pd.read_csv</code> ile DataFrame\'e çevirsin; <code>tarih</code> sütunu varsa datetime türüne dönüştürülsün (parse_dates). DataFrame\'i döndür.</p>',
        start: 'import pandas as pd, io\n\ndef yukle(csv_metni):\n    pass\n',
        sol: 'import pandas as pd, io\n\ndef yukle(csv_metni):\n    df = pd.read_csv(io.StringIO(csv_metni))\n    if "tarih" in df.columns:\n        df["tarih"] = pd.to_datetime(df["tarih"])\n    return df\n',
        tests: 'import pandas as pd\nm = "id,sehir,tutar,tarih\\n1,Ankara,10.5,2024-01-02\\n2,İzmir,20,2024-01-03\\n"\ndf = yukle(m)\nassert isinstance(df, pd.DataFrame), "DataFrame dönmeli"\nassert df.shape == (2, 4), "2 satır 4 sütun bekleniyor"\nassert list(df.columns) == ["id", "sehir", "tutar", "tarih"], "Sütun adları korunmalı"\nassert str(df["tarih"].dtype).startswith("datetime64"), "tarih sütunu datetime olmalı"\nassert df["tutar"].sum() == 30.5, "tutar sayısal okunmalı"\ndf2 = yukle("a,b\\n1,2\\n")\nassert df2.shape == (1, 2), "tarih olmayan CSV de yüklenmeli"\n',
        hints: ['pd.read_csv(io.StringIO(csv_metni)) metni dosya gibi okur.', 'pd.to_datetime(df["tarih"]) ya da read_csv(parse_dates=["tarih"]) — ama sütun yoksa hata verir; önce kontrol et.'],
        why: 'StringIO bellekteki metni dosya nesnesi gibi sunar; read_csv tür çıkarımı yapar, tarih için açık dönüşüm gerekir.' },
      { t: 'code', id: 'pandas-giris-2',
        q: '<p><code>sehir_siparisleri(df, sehir)</code> fonksiyonu, <code>sehir</code> sütunu verilen şehre eşit olan satırları <code>tutar</code> sütununa göre <b>azalan</b> sırada döndürsün. Index 0\'dan başlayacak biçimde sıfırlansın (<code>reset_index(drop=True)</code>).</p>',
        start: 'import pandas as pd\n\ndef sehir_siparisleri(df, sehir):\n    pass\n',
        sol: 'import pandas as pd\n\ndef sehir_siparisleri(df, sehir):\n    alt = df[df["sehir"] == sehir]\n    return alt.sort_values("tutar", ascending=False).reset_index(drop=True)\n',
        tests: 'import pandas as pd\ndf = pd.DataFrame({"id": [1, 2, 3, 4], "sehir": ["Ankara", "İzmir", "Ankara", "Bursa"], "tutar": [50.0, 80.0, 120.0, 10.0]})\nr = sehir_siparisleri(df, "Ankara")\nassert list(r["id"]) == [3, 1], "Ankara siparişleri tutara göre azalan: id 3, 1"\nassert list(r.index) == [0, 1], "Index sıfırlanmalı"\nassert len(sehir_siparisleri(df, "Van")) == 0, "Olmayan şehir boş DataFrame vermeli"\nassert len(df) == 4, "Orijinal df değişmemeli"\n',
        hints: ['df[df["sehir"] == sehir] filtreler.', 'sort_values("tutar", ascending=False) ardından reset_index(drop=True).'],
        why: 'Maske ile filtre, sort_values ile sıralama, reset_index ile temiz index: en yaygın üçlü. Orijinal df hiç değişmez.' },
      { t: 'code', id: 'pandas-giris-3',
        q: '<p><code>tutar_ekle(df)</code> fonksiyonu <code>adet * fiyat</code> değerinden <code>tutar</code> sütunu ve tutar 500\'den büyükse True olan <code>buyuk</code> sütunu eklenmiş <b>yeni</b> bir DataFrame döndürsün. Orijinal <code>df</code> değişmemeli (ipucu: <code>assign</code> ya da önce <code>copy()</code>).</p>',
        start: 'import pandas as pd\n\ndef tutar_ekle(df):\n    pass\n',
        sol: 'import pandas as pd\n\ndef tutar_ekle(df):\n    y = df.copy()\n    y["tutar"] = y["adet"] * y["fiyat"]\n    y["buyuk"] = y["tutar"] > 500\n    return y\n',
        tests: 'import pandas as pd\ndf = pd.DataFrame({"adet": [3, 1, 10], "fiyat": [45.5, 899.0, 12.75]})\nr = tutar_ekle(df)\nassert r["tutar"].tolist() == [136.5, 899.0, 127.5], "tutar = adet * fiyat"\nassert r["buyuk"].tolist() == [False, True, False], "buyuk: tutar > 500"\nassert "tutar" not in df.columns, "Orijinal df değişmemeli"\nassert list(r.columns) == ["adet", "fiyat", "tutar", "buyuk"], "Sütun sırası: adet, fiyat, tutar, buyuk"\n',
        hints: ['df.copy() ile bağımsız kopya al, sonra sütun ata.', 'Alternatif: df.assign(tutar=df["adet"] * df["fiyat"]).assign(buyuk=lambda d: d["tutar"] > 500).'],
        why: 'Fonksiyonlar girdiyi değiştirmemeli; copy ya da assign yeni tablo üretir, böylece çağıran taraf sürpriz yaşamaz.' },
      { t: 'mc', q: 'Filtrelenmiş bir DataFrame\'in index\'i [2, 5, 7]. <code>df.loc[5]</code> ve <code>df.iloc[1]</code> için doğru olan hangisi?',
        o: ['İkisi de aynı satırı verir', 'loc[5] KeyError verir', 'iloc[1] etiketi 1 olan satırı arar', 'loc[5] hata vermez, iloc[1] üçüncü satırı verir'], a: 0,
        why: 'loc etiketle çalışır: etiketi 5 olan satır ikinci satırdır. iloc konumla çalışır: 1 numaralı konum da ikinci satırdır. Bu örnekte çakışırlar ama genelde farklıdır.' },
      { t: 'code', id: 'pandas-giris-4',
        q: '<p><code>en_iyi_musteriler(df, n)</code> fonksiyonu <code>tutar</code> sütununa göre en yüksek <code>n</code> satırın <code>musteri</code> değerlerini <b>liste</b> olarak döndürsün (büyükten küçüğe). <code>nlargest</code> kullan.</p>',
        start: 'import pandas as pd\n\ndef en_iyi_musteriler(df, n):\n    pass\n',
        sol: 'import pandas as pd\n\ndef en_iyi_musteriler(df, n):\n    return df.nlargest(n, "tutar")["musteri"].tolist()\n',
        tests: 'import pandas as pd\ndf = pd.DataFrame({"musteri": ["Ayşe", "Mehmet", "Zeynep", "Ali"], "tutar": [136.5, 899.0, 1250.0, 273.0]})\nassert en_iyi_musteriler(df, 2) == ["Zeynep", "Mehmet"], "En yüksek 2: Zeynep, Mehmet"\nassert en_iyi_musteriler(df, 10) == ["Zeynep", "Mehmet", "Ali", "Ayşe"], "n büyükse tüm satırlar sıralı döner"\nassert en_iyi_musteriler(df, 0) == [], "n=0 boş liste"\n',
        hints: ['df.nlargest(n, "tutar") en büyük n satırı sıralı verir.', '["musteri"].tolist() ile listeye çevir.'],
        why: 'nlargest, sort_values + head ikilisinin kısa ve hızlı hâlidir; büyük veride tüm tabloyu sıralamaz.' },
      { t: 'mc', q: 'Aşağıdakilerden hangisi "Ankara\'daki 2 adetten fazla siparişler" filtresini doğru yazar?',
        o: ['df[df.sehir == "Ankara" and df.adet > 2]', 'df[(df.sehir == "Ankara") & (df.adet > 2)]', 'df[df.sehir == "Ankara" & df.adet > 2]', 'df.loc["Ankara", "adet" > 2]'], a: 1,
        why: 'Maske birleştirmede & kullanılır ve her koşul paranteze alınır. and dizilerde belirsizlik hatası verir; parantezsiz & öncelik yüzünden yanlış hesaplanır.' },
      { t: 'mc', q: 'Bir DataFrame\'de hangi sütunlarda eksik değer olduğunu ve sütun türlerini tek komutla görmek için hangisi en uygun?',
        o: ['df.describe()', 'df.head()', 'df.info()', 'df.shape'], a: 2,
        why: 'info() her sütunun adını, boş olmayan değer sayısını ve dtype\'ını listeler. describe sayısal özet, head ilk satırlar, shape yalnızca boyut verir.' }
    ],
    faq: [
      { q: 'df.sehir ile df["sehir"] aynı mı?', a: 'Okumada evet. Ama sütun adı boşluk içeriyorsa, Türkçe karakter sorunu varsa ya da bir metot adıyla çakışıyorsa (count, min) nokta yazımı çalışmaz; atamada da df["yeni"] = ... kullanılmalıdır. Köşeli parantez her zaman güvenlidir.' },
      { q: 'SettingWithCopyWarning ne demek?', a: 'Filtrelenmiş bir alt tabloya atama yaptığında pandas 2.x "bu belki kopya, asıl tablo değişmeyebilir" uyarısı verir. Çözüm: df.loc[maske, "sütun"] = değer tek adımda yazmak. pandas 3 ile Copy-on-Write varsayılan olduğundan zincirleme atama hiç etki etmez.' },
      { q: 'read_csv Türkçe karakterleri bozdu, ne yapmalıyım?', a: 'Dosyanın kodlamasını encoding="utf-8" ya da eski Windows dosyaları için encoding="cp1254" olarak ver. Ayırıcı noktalı virgülse sep=";", ondalık virgülse decimal="," ekle.' }
    ],
    mistakes: [
      { bad: 'df[df.tutar > 500]["buyuk"] = True', good: 'df.loc[df.tutar > 500, "buyuk"] = True', why: 'Zincirleme atama kopya üzerinde çalışır ve asıl tabloya yazmaz; loc ile tek adımda seç ve ata.' },
      { bad: 'df.loc[0:2]  # 3 satır bekleyerek iloc gibi kullanmak', good: 'df.iloc[0:2]  # konum, 2 hariç', why: 'loc etiket dilimi bitişi dahil eder, iloc hariç tutar; sayısal konum için iloc kullan.' },
      { bad: 'df.sort_values("tutar")\nprint(df.head())', good: 'df = df.sort_values("tutar")\nprint(df.head())', why: 'sort_values yeni DataFrame döndürür, yerinde değiştirmez; sonucu bir değişkene ata.' },
      { bad: 'pd.read_csv(csv_metni)', good: 'pd.read_csv(io.StringIO(csv_metni))', why: 'read_csv bir dosya yolu ya da dosya nesnesi bekler; ham metin verirsen onu dosya adı sanıp bulamaz.' }
    ]
  },

  /* ========================= 3. pandas-temizlik ========================= */
  { id: 'pandas-temizlik', lv: 'ileri', mod: 'Veri Bilimi Araçları', min: 40, needs: ['pandas'],
    title: 'Veri temizleme: eksik, tür, metin, yinelenen',
    sum: 'isna/fillna/dropna ile eksik değer, to_numeric/to_datetime/astype ile tür dönüşümü, .str metotları, duplicated, IQR ile aykırı değer ve category türü.',
    goals: ['Eksik değerleri bulup silme ya da doldurma kararını verebilirim', 'Metin olarak gelen sayı ve tarihleri doğru türe çevirebilirim', '.str metotlarıyla kirli metin sütunlarını standartlaştırabilirim', 'Yinelenen kayıtları tespit edip temizleyebilirim', 'IQR yöntemiyle aykırı değerleri işaretleyebilirim'],
    body: `<h2>Gerçek veri kirlidir</h2>
<p>Ilgaz Bank\'ın şubelerden toplanan kredi başvuru dosyasında şehir adı bir satırda "ankara", diğerinde " ANKARA " yazar; tutar sütunu "12.500,00 TL" gibi metindir; bazı gelirler boştur; aynı başvuru iki kez girilmiştir. Analizin yüzde yetmişi bu temizliktir. Bu derste pandas\'ın temizlik araçlarını bir akış olarak öğreneceksin: <b>eksikleri gör → türleri düzelt → metni standartlaştır → yinelenenleri at → aykırıları işaretle</b>.</p>

<h2>Eksik değer: isna, fillna, dropna</h2>
<p>pandas eksik değeri <code>NaN</code> (sayısal) ya da <code>NaT</code> (tarih) ile gösterir. <code>isna()</code> maske verir; <code>isna().sum()</code> sütun başına eksik sayısı. Karar iki yönlü: satırı at (<code>dropna</code>) ya da doldur (<code>fillna</code>). Doldurma değeri iş bilgisine bağlıdır: gelir için medyan, şehir için "Bilinmiyor", sayaç için 0.</p>
<pre class="py">import pandas as pd, io

csv = """basvuru,musteri,sehir,gelir,skor
1,Ayşe,Ankara,25000,710
2,Mehmet,,18000,
3,Zeynep,İzmir,,655
4,Ali,Bursa,42000,780
5,Can,,,
"""
df = pd.read_csv(io.StringIO(csv))
print(df.isna().sum())
print(df.dropna(subset=["gelir"]).shape)          # geliri olmayanı at
print(df.dropna(thresh=4).shape)                  # en az 4 dolu alanı olanı tut

temiz = df.copy()
temiz["gelir"] = temiz["gelir"].fillna(temiz["gelir"].median())
temiz["sehir"] = temiz["sehir"].fillna("Bilinmiyor")
temiz["skor"] = temiz["skor"].fillna(0)
print(temiz)
</pre>
<div class="warn"><b>inplace kullanma</b><code>df.fillna(0, inplace=True)</code> hâlâ çalışır ama Copy-on-Write ile beklenmedik davranır ve pandas ekibi kaldırmayı planlıyor. Her zaman sonucu ata: <code>df["x"] = df["x"].fillna(0)</code>.</div>

<h2>Tür dönüşümü</h2>
<p>CSV\'den gelen "12.500,00 TL" metni toplanamaz. Önce metni temizle, sonra <code>pd.to_numeric</code> ile sayıya çevir. <code>errors="coerce"</code> çevrilemeyeni NaN yapar; hata fırlatmak yerine sonradan <code>isna</code> ile yakalarsın. Tarih için <code>pd.to_datetime(..., format=...)</code>; biçimi açıkça yazmak hem hız hem güvenlik sağlar. Tam sayı/kategori gibi dönüşümler <code>astype</code>.</p>
<pre class="py">import pandas as pd

df = pd.DataFrame({
    "tutar": ["12.500,00 TL", "1.250,50 TL", "bilinmiyor", "800,00 TL"],
    "tarih": ["05.03.2024", "17.03.2024", "01.04.2024", "hatalı"],
    "taksit": ["12", "6", "3", "24"],
})
tmp = (df["tutar"].str.replace(" TL", "", regex=False)
                  .str.replace(".", "", regex=False)
                  .str.replace(",", ".", regex=False))
df["tutar_num"] = pd.to_numeric(tmp, errors="coerce")
df["tarih_dt"] = pd.to_datetime(df["tarih"], format="%d.%m.%Y", errors="coerce")
df["taksit"] = df["taksit"].astype(int)
print(df.dtypes)
print(df[["tutar_num", "tarih_dt", "taksit"]])
print("çevrilemeyen tutar:", int(df["tutar_num"].isna().sum()))
</pre>

<h2>Metin temizliği: .str</h2>
<p>Bir metin Series\'inin <code>.str</code> erişimcisi, Python string metotlarını tüm sütuna vektörleştirilmiş uygular: <code>strip, lower, upper, title, replace, contains, startswith, split, len</code>. Eksik değerler atlanır (NaN kalır).</p>
<pre class="py">import pandas as pd

s = pd.Series([" ankara", "ANKARA ", "İzmir", "izmir", "Bursa  ", None])
std = s.str.strip().str.title()
print(std.tolist())
print(std.value_counts())
print(s.str.contains("ank", case=False, na=False).tolist())

email = pd.Series(["ayse@anadolu.com", "MEHMET@Gmail.COM", "zeynep@anadolu.com"])
print(email.str.lower().str.split("@").str[1].value_counts())
</pre>
<div class="tip"><b>title ve Türkçe</b><code>str.title()</code> "izmir" → "Izmir" yapar (noktalı İ sorunu). Şehir gibi sınırlı listelerde bir eşleme sözlüğü ve <code>.map</code> daha güvenlidir: <code>s.str.strip().str.lower().map(sehir_sozlugu)</code>.</div>

<h2>Yinelenen kayıtlar</h2>
<p><code>duplicated()</code> ikinci ve sonraki tekrarlar için True verir; <code>subset</code> ile hangi sütunlara göre bakılacağını, <code>keep</code> ile hangisinin tutulacağını ("first", "last", False) seçersin. <code>drop_duplicates</code> aynı parametrelerle siler.</p>
<pre class="py">import pandas as pd

df = pd.DataFrame({
    "basvuru": [1, 2, 2, 3, 1],
    "musteri": ["Ayşe", "Mehmet", "Mehmet", "Zeynep", "Ayşe"],
    "skor": [710, 640, 655, 700, 715],
})
print(df.duplicated(subset=["basvuru"]).tolist())
print(df.drop_duplicates(subset=["basvuru"], keep="last").sort_values("basvuru"))
print("tam kopya satır:", int(df.duplicated().sum()))
</pre>

<h2>Aykırı değer: IQR kuralı</h2>
<p>Gelir sütununda 25.000\'ler arasında bir 2.500.000 görürsen bu hata mı gerçek mi? Önce işaretle, sonra iş birimine sor. Basit ve sağlam yöntem <b>IQR</b>: Q1 ve Q3 çeyrekleri, IQR = Q3 - Q1; <code>[Q1 - 1.5·IQR, Q3 + 1.5·IQR]</code> dışı aykırıdır. <code>clip</code> ile sınırlara çekebilir ya da maskeyle ayırabilirsin.</p>
<pre class="py">import pandas as pd

gelir = pd.Series([25000, 18000, 31000, 42000, 27000, 2500000, 22000, 150])
q1, q3 = gelir.quantile(0.25), gelir.quantile(0.75)
iqr = q3 - q1
alt, ust = q1 - 1.5 * iqr, q3 + 1.5 * iqr
aykiri = (gelir &lt; alt) | (gelir &gt; ust)
print(f"sınırlar: {alt:.0f} - {ust:.0f}")
print(gelir[aykiri].tolist())
print(gelir.clip(lower=alt, upper=ust).astype(int).tolist())
</pre>

<h2>Kategorik tür</h2>
<p>Şehir, ürün kategorisi, durum gibi az sayıda değer alan metin sütunları <code>astype("category")</code> ile hem bellek hem hız kazandırır. groupby yaparken <code>observed=True</code> vererek yalnızca veride bulunan kategorileri al.</p>
<div class="tbl-wrap"><table><tr><th>Sorun</th><th>Araç</th><th>Not</th></tr>
<tr><td>Boş hücre</td><td><code>isna, fillna, dropna</code></td><td>Doldurma değeri iş kararıdır</td></tr>
<tr><td>Metin sayı</td><td><code>.str.replace + to_numeric(errors="coerce")</code></td><td>Önce binlik/ondalık ayıracı düzelt</td></tr>
<tr><td>Metin tarih</td><td><code>to_datetime(format=...)</code></td><td>Biçimi açıkça yaz</td></tr>
<tr><td>Kirli metin</td><td><code>.str.strip().str.lower(), .map</code></td><td>Türkçe İ/ı için eşleme</td></tr>
<tr><td>Tekrar</td><td><code>duplicated, drop_duplicates</code></td><td>subset ile iş anahtarı</td></tr>
<tr><td>Uç değer</td><td><code>quantile, clip</code></td><td>Silme değil işaretle</td></tr>
</table></div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Temizlik fonksiyonu kalıbı</h3>
<p>Üretimde temizlik adımlarını <code>def temizle(df) -&gt; pd.DataFrame</code> biçiminde, girdiyi değiştirmeyen, zincirlenebilir fonksiyonlara böl ve <code>df.pipe(temizle_sehir).pipe(tutar_sayisal)</code> ile bağla. Her fonksiyona küçük bir test yaz: 5 satırlık örnek girdi, beklenen çıktı. Böylece veri kaynağı değiştiğinde hangi adımın kırıldığını saniyede görürsün.</p>
<h3>Eksikliğin türü</h3>
<p>Eksiklik rastgele mi (sensör arızası) yoksa anlamlı mı (müşteri gelir beyan etmedi)? İkinci durumda doldurmak yerine "beyan_yok" bayrağı eklemek modele ve rapora daha dürüst bilgi verir. Eksik oranı yüzde 40\'ı aşan sütunu doldurmak yerine çoğunlukla atmak doğrudur.</p>
<h3>Nullable türler</h3>
<p>Tam sayı sütununda NaN olunca pandas sütunu float yapar. <code>astype("Int64")</code> (büyük I) eksik destekleyen tam sayı türüdür; pandas 3 ile metinler için varsayılan <code>str</code> türü de gelir. Üretim kodunda tür kontrolünü dtype adına değil davranışa göre yap (<code>pd.api.types.is_numeric_dtype</code>).</p>
</section>`,
    ex: [
      { t: 'code', id: 'pandas-temizlik-1',
        q: '<p><code>sehir_duzelt(df)</code> fonksiyonu, <code>sehir</code> sütunundaki değerlerin baş/son boşluklarını kırpıp küçük harfe çevirsin ve ardından şu sözlükle standart ada eşlesin: <code>{"ankara": "Ankara", "izmir": "İzmir", "istanbul": "İstanbul", "bursa": "Bursa"}</code>. Sözlükte olmayan ya da eksik değerler <code>"Diğer"</code> olsun. Yeni bir DataFrame döndür; orijinal değişmesin.</p>',
        start: 'import pandas as pd\n\nSEHIR = {"ankara": "Ankara", "izmir": "İzmir", "istanbul": "İstanbul", "bursa": "Bursa"}\n\ndef sehir_duzelt(df):\n    pass\n',
        sol: 'import pandas as pd\n\nSEHIR = {"ankara": "Ankara", "izmir": "İzmir", "istanbul": "İstanbul", "bursa": "Bursa"}\n\ndef sehir_duzelt(df):\n    y = df.copy()\n    anahtar = y["sehir"].str.strip().str.lower()\n    y["sehir"] = anahtar.map(SEHIR).fillna("Diğer")\n    return y\n',
        tests: 'import pandas as pd\ndf = pd.DataFrame({"id": [1, 2, 3, 4, 5, 6], "sehir": [" ankara", "ANKARA ", "izmir", "Bursa  ", None, "Van"]})\nr = sehir_duzelt(df)\nassert r["sehir"].tolist() == ["Ankara", "Ankara", "İzmir", "Bursa", "Diğer", "Diğer"], "Beklenen: Ankara, Ankara, İzmir, Bursa, Diğer, Diğer"\nassert df["sehir"].tolist()[0] == " ankara", "Orijinal df değişmemeli"\nassert r["id"].tolist() == [1, 2, 3, 4, 5, 6], "Diğer sütunlar korunmalı"\n',
        hints: ['Önce .str.strip().str.lower() ile anahtarı üret.', '.map(SEHIR) eşleşmeyenleri NaN yapar; .fillna("Diğer") ile doldur.'],
        why: 'strip+lower normalize eder, map sözlükle standartlaştırır, fillna kalanları yakalar. Türkçe büyük/küçük harf tuzağından böyle kaçılır.' },
      { t: 'code', id: 'pandas-temizlik-2',
        q: '<p><code>tutar_sayisal(df)</code> fonksiyonu <code>tutar</code> sütunundaki <code>"12.500,00 TL"</code> biçimli metinleri float\'a çevirsin: " TL" ekini ve binlik noktasını kaldır, ondalık virgülü noktaya çevir, <code>pd.to_numeric(errors="coerce")</code> uygula. Sonucu <code>tutar</code> sütununa yazılmış yeni DataFrame döndür.</p>',
        start: 'import pandas as pd\n\ndef tutar_sayisal(df):\n    pass\n',
        sol: 'import pandas as pd\n\ndef tutar_sayisal(df):\n    y = df.copy()\n    s = (y["tutar"].astype(str)\n         .str.replace(" TL", "", regex=False)\n         .str.replace(".", "", regex=False)\n         .str.replace(",", ".", regex=False))\n    y["tutar"] = pd.to_numeric(s, errors="coerce")\n    return y\n',
        tests: 'import pandas as pd, math\ndf = pd.DataFrame({"tutar": ["12.500,00 TL", "1.250,50 TL", "bilinmiyor", "800,00 TL"]})\nr = tutar_sayisal(df)\nv = r["tutar"].tolist()\nassert v[0] == 12500.0 and v[1] == 1250.5 and v[3] == 800.0, "Beklenen 12500.0, 1250.5, 800.0"\nassert math.isnan(v[2]), "Çevrilemeyen değer NaN olmalı"\nassert str(r["tutar"].dtype).startswith("float"), "Sütun float olmalı"\nassert df["tutar"].tolist()[0] == "12.500,00 TL", "Orijinal df değişmemeli"\n',
        hints: ['Üç .str.replace zinciri: " TL" → "", "." → "", "," → "."; regex=False ver.', 'pd.to_numeric(s, errors="coerce") çevrilemeyeni NaN yapar.'],
        why: 'Türk para biçiminde nokta binlik, virgül ondalıktır; sırayla temizlenir. errors="coerce" hatalı satırı patlatmak yerine işaretler.' },
      { t: 'code', id: 'pandas-temizlik-3',
        q: '<p><code>eksikleri_doldur(df)</code> fonksiyonu: <code>gelir</code> sütunundaki eksikleri sütun medyanıyla, <code>sehir</code> eksiklerini <code>"Bilinmiyor"</code> ile doldursun; <code>skor</code> sütunu eksik olan satırları tamamen atsın. Index sıfırlanmış yeni DataFrame döndür.</p>',
        start: 'import pandas as pd\n\ndef eksikleri_doldur(df):\n    pass\n',
        sol: 'import pandas as pd\n\ndef eksikleri_doldur(df):\n    medyan = df["gelir"].median()\n    y = df.dropna(subset=["skor"]).copy()\n    y["gelir"] = y["gelir"].fillna(medyan)\n    y["sehir"] = y["sehir"].fillna("Bilinmiyor")\n    return y.reset_index(drop=True)\n',
        tests: 'import pandas as pd\ndf = pd.DataFrame({\n    "musteri": ["Ayşe", "Mehmet", "Zeynep", "Ali", "Can"],\n    "sehir": ["Ankara", None, "İzmir", "Bursa", None],\n    "gelir": [25000.0, 18000.0, None, 42000.0, None],\n    "skor": [710.0, None, 655.0, 780.0, 700.0],\n})\nr = eksikleri_doldur(df)\nassert len(r) == 4, "skor eksik olan Mehmet atılmalı, 4 satır kalmalı"\nassert "Mehmet" not in r["musteri"].tolist(), "Mehmet satırı atılmalı"\nassert r["sehir"].tolist() == ["Ankara", "İzmir", "Bursa", "Bilinmiyor"], "sehir eksikleri Bilinmiyor"\nassert r["gelir"].tolist() == [25000.0, 25000.0, 42000.0, 25000.0], "gelir medyanı (25000) ile doldurulmalı"\nassert list(r.index) == [0, 1, 2, 3], "Index sıfırlanmalı"\nassert int(df.isna().sum().sum()) == 5, "Orijinal df değişmemeli"\n',
        hints: ['Önce dropna(subset=["skor"]) ile satırları at; medyan kalan satırlardan hesaplanmalı.', 'fillna sonucu ata; inplace kullanma. Sonda reset_index(drop=True).'],
        why: 'Sıra önemlidir: skor eksiği atılınca medyan kalan veriden hesaplanır (25000). Her adım yeni nesne döndürür, orijinal korunur.' },
      { t: 'mc', q: '<code>pd.to_numeric(s, errors="coerce")</code> çağrısında sayıya çevrilemeyen bir değer için ne olur?',
        o: ['ValueError fırlatılır', 'Değer olduğu gibi kalır', 'NaN olur', '0 olur'], a: 2,
        why: 'coerce "zorla": çevrilemeyen NaN olur. errors="raise" (varsayılan) hata fırlatır. Eski "ignore" seçeneği kaldırılmıştır.' },
      { t: 'code', id: 'pandas-temizlik-4',
        q: '<p><code>aykiri_maske(s)</code> fonksiyonu bir sayısal Series alsın ve IQR kuralına göre (Q1 - 1.5·IQR altı ya da Q3 + 1.5·IQR üstü) aykırı olan elemanlar için True içeren bir boolean Series döndürsün. Çeyrekleri <code>quantile(0.25)</code> ve <code>quantile(0.75)</code> ile hesapla.</p>',
        start: 'import pandas as pd\n\ndef aykiri_maske(s):\n    pass\n',
        sol: 'import pandas as pd\n\ndef aykiri_maske(s):\n    q1, q3 = s.quantile(0.25), s.quantile(0.75)\n    iqr = q3 - q1\n    return (s < q1 - 1.5 * iqr) | (s > q3 + 1.5 * iqr)\n',
        tests: 'import pandas as pd\ns = pd.Series([25000, 18000, 31000, 42000, 27000, 2500000, 22000, 150])\nm = aykiri_maske(s)\nassert isinstance(m, pd.Series) and m.dtype == bool, "Boolean Series dönmeli"\nassert m.tolist() == [False, False, False, False, False, True, False, True], "2500000 ve 150 aykırı olmalı"\nassert aykiri_maske(pd.Series([10, 11, 12, 13])).sum() == 0, "Düzgün veride aykırı yok"\n',
        hints: ['q1 = s.quantile(0.25), q3 = s.quantile(0.75), iqr = q3 - q1.', 'İki karşılaştırmayı | ile birleştir, her birini paranteze al.'],
        why: 'IQR dağılım varsayımı gerektirmeyen sağlam bir eşiktir; sonuç maske olarak döner ki silme kararı çağıran tarafa kalsın.' },
      { t: 'mc', q: 'Aynı <code>basvuru</code> numarasına sahip satırlardan yalnızca <b>en son gireni</b> tutmak için hangisi doğru?',
        o: ['df.drop_duplicates()', 'df.drop_duplicates(subset=["basvuru"], keep="last")', 'df.drop_duplicates(subset=["basvuru"])', 'df.duplicated(subset=["basvuru"], keep=False)'], a: 1,
        why: 'subset ile iş anahtarı seçilir, keep="last" sonuncuyu bırakır. Parametresiz drop_duplicates tüm sütunlara bakar; keep varsayılanı "first"tir; duplicated silmez yalnızca işaretler.' },
      { t: 'code', id: 'pandas-temizlik-5',
        q: '<p><code>yinelenenleri_at(df)</code> fonksiyonu <code>basvuru</code> sütununa göre yinelenen satırlardan <b>sonuncuyu</b> tutsun, <code>basvuru</code>\'ya göre artan sıralasın ve index\'i sıfırlasın. Ayrıca kaç satır atıldığını ikinci değer olarak döndür: <code>(df_temiz, atilan_sayi)</code>.</p>',
        start: 'import pandas as pd\n\ndef yinelenenleri_at(df):\n    pass\n',
        sol: 'import pandas as pd\n\ndef yinelenenleri_at(df):\n    t = df.drop_duplicates(subset=["basvuru"], keep="last")\n    t = t.sort_values("basvuru").reset_index(drop=True)\n    return t, len(df) - len(t)\n',
        tests: 'import pandas as pd\ndf = pd.DataFrame({"basvuru": [1, 2, 2, 3, 1], "skor": [710, 640, 655, 700, 715]})\nt, n = yinelenenleri_at(df)\nassert n == 2, "2 satır atılmalı"\nassert t["basvuru"].tolist() == [1, 2, 3], "basvuru artan sıralı"\nassert t["skor"].tolist() == [715, 655, 700], "Son girilen tutulmalı: 715, 655, 700"\nassert list(t.index) == [0, 1, 2], "Index sıfırlanmalı"\n',
        hints: ['drop_duplicates(subset=["basvuru"], keep="last").', 'Atılan sayı: len(df) - len(temiz).'],
        why: 'Yinelenen temizliğinde "hangisi doğru kayıt?" sorusu iş kuralıdır; burada en son giriş. Atılan sayıyı raporlamak denetim için önemlidir.' }
    ],
    faq: [
      { q: 'NaN ile None aynı mı?', a: 'pandas ikisini de eksik sayar (isna ikisine True der). Sayısal sütunda eksik NaN olarak saklanır; nesne sütununda None kalabilir. Karşılaştırmada NaN == NaN False döner, bu yüzden hep isna kullan.' },
      { q: 'Eksik değerleri ortalama ile mi medyan ile mi doldurmalıyım?', a: 'Aykırı değer varsa ortalama kayar, medyan dayanıklıdır. Gelir, tutar gibi çarpık dağılımlarda medyan; simetrik ölçümlerde ortalama kullanılabilir. Mümkünse grup bazlı (şehre göre medyan) doldur.' },
      { q: 'astype(int) "cannot convert NaN" hatası veriyor.', a: 'Eksik değer varken int olamaz. Önce fillna, ya da eksik destekleyen astype("Int64") kullan.' }
    ],
    mistakes: [
      { bad: 'df["gelir"].fillna(0, inplace=True)', good: 'df["gelir"] = df["gelir"].fillna(0)', why: 'inplace Copy-on-Write ile ara kopya üzerinde çalışabilir ve etkisiz kalır; atama her sürümde güvenlidir.' },
      { bad: 'df[df["skor"] == None]', good: 'df[df["skor"].isna()]', why: '== None eleman eleman çalışmaz ve hep False verir; eksik kontrolü isna/notna ile yapılır.' },
      { bad: 'pd.to_datetime(df["tarih"])  # "05.03.2024" için', good: 'pd.to_datetime(df["tarih"], format="%d.%m.%Y")', why: 'Biçim belirtilmezse gün/ay karışabilir ve uyarı alırsın; açık format hem doğru hem hızlıdır.' },
      { bad: 'df["tutar"].str.replace(".", "")', good: 'df["tutar"].str.replace(".", "", regex=False)', why: 'Nokta regex\'te "her karakter" demektir; regex=False vermezsen düz metin olarak değil kalıp olarak yorumlanır.' }
    ]
  },
  /* ========================= 4. pandas-groupby ========================= */
  { id: 'pandas-groupby', lv: 'ileri', mod: 'Veri Bilimi Araçları', min: 45, needs: ['pandas'],
    title: 'groupby, pivot, merge ve zaman serisi',
    sum: 'groupby/agg/transform ile özet, pivot_table ile çapraz tablo, merge/concat ile tablo birleştirme, resample ile zaman serisi ve apply tuzağı; Anadolu Market satış analizi.',
    goals: ['groupby ile grup bazlı özet ve çoklu agg çıkarabilirim', 'transform ile grup istatistiğini satırlara geri yazabilirim', 'pivot_table ile çapraz tablo üretebilirim', 'merge ve concat ile tabloları doğru türde birleştirebilirim', 'Tarih index\'i ve resample ile aylık/haftalık özet çıkarabilirim'],
    body: `<h2>Soru: "Hangi şehir, hangi kategoride ne kadar satıyor?"</h2>
<p>Anadolu Market yönetimi her ay aynı soruları sorar: şehir bazında ciro, kategori bazında ortalama sepet, müşteri başına sipariş sayısı, haftalık trend. Bu soruların hepsi "böl → hesapla → birleştir" (split-apply-combine) kalıbıdır ve pandas\'ta <b>groupby</b> ile yazılır. Derste tek bir sipariş tablosu üzerinden tüm araçları sırayla göreceğiz.</p>

<h2>groupby ve agg</h2>
<p><code>df.groupby("sehir")</code> tabloyu şehir gruplarına böler; ardından <code>["tutar"].sum()</code> gibi bir özet uygulanır. Birden çok özet için <code>agg</code>: sözlükle sütun başına fonksiyon, ya da <b>adlandırılmış agg</b> ile çıktı sütun adlarını kendin ver.</p>
<pre class="py">import pandas as pd, io

CSV = """siparis_id,musteri,sehir,kategori,adet,fiyat,tarih
1001,Ayşe,İstanbul,Gıda,3,45.5,2024-03-01
1002,Mehmet,Ankara,Elektronik,1,899.0,2024-03-01
1003,Ayşe,İstanbul,Gıda,10,12.75,2024-03-04
1004,Zeynep,İzmir,Kozmetik,2,129.9,2024-03-05
1005,Ali,Ankara,Gıda,6,45.5,2024-03-09
1006,Zeynep,İzmir,Elektronik,1,1250.0,2024-03-12
1007,Mehmet,Ankara,Gıda,4,12.75,2024-03-15
1008,Ayşe,İstanbul,Kozmetik,1,129.9,2024-03-20
"""
df = pd.read_csv(io.StringIO(CSV), parse_dates=["tarih"])
df["tutar"] = df["adet"] * df["fiyat"]

print(df.groupby("sehir")["tutar"].sum())
print(df.groupby("sehir").agg(
    ciro=("tutar", "sum"),
    siparis=("siparis_id", "count"),
    ort_sepet=("tutar", "mean"),
).round(1))
print(df.groupby(["sehir", "kategori"])["tutar"].sum().reset_index().head(4))
</pre>
<div class="tip"><b>reset_index</b>groupby sonucu grup anahtarlarını index yapar. Raporda düz tablo istiyorsan <code>reset_index()</code> ya da baştan <code>groupby(..., as_index=False)</code>.</div>

<h2>transform: grubun özetini satıra geri yaz</h2>
<p><code>agg</code> grup başına bir satır verir; <code>transform</code> ise her satıra kendi grubunun değerini yazar, uzunluk değişmez. "Her siparişin, şehrinin toplam cirosundaki payı" sorusu bunu ister.</p>
<pre class="py">import pandas as pd

df = pd.DataFrame({
    "sehir": ["Ankara", "Ankara", "İzmir", "İzmir", "İzmir"],
    "tutar": [899.0, 273.0, 259.8, 1250.0, 51.0],
})
df["sehir_toplam"] = df.groupby("sehir")["tutar"].transform("sum")
df["pay"] = (df["tutar"] / df["sehir_toplam"] * 100).round(1)
df["sehir_sira"] = df.groupby("sehir")["tutar"].rank(ascending=False).astype(int)
print(df)
print(df[df["sehir_sira"] == 1])      # her şehrin en büyük siparişi
</pre>

<h2>pivot_table: çapraz tablo</h2>
<p>Satırlarda şehir, sütunlarda kategori, hücrede ciro: Excel\'in pivotu. <code>fill_value</code> boş kombinasyonu doldurur, <code>margins=True</code> toplam satır/sütun ekler.</p>
<pre class="py">import pandas as pd

df = pd.DataFrame({
    "sehir": ["İstanbul", "Ankara", "İstanbul", "İzmir", "Ankara", "İzmir"],
    "kategori": ["Gıda", "Elektronik", "Gıda", "Kozmetik", "Gıda", "Elektronik"],
    "tutar": [136.5, 899.0, 127.5, 259.8, 273.0, 1250.0],
})
pv = pd.pivot_table(df, index="sehir", columns="kategori", values="tutar",
                    aggfunc="sum", fill_value=0, margins=True, margins_name="Toplam")
print(pv)
print(pd.crosstab(df["sehir"], df["kategori"]))   # yalnızca sayım
</pre>

<h2>merge, join, concat</h2>
<p>Siparişler bir tabloda, müşteri bilgileri (segment, kayıt tarihi) başka tabloda. SQL JOIN\'in karşılığı <code>pd.merge</code>. <code>how</code> parametresi hangi satırların kalacağını belirler:</p>
<div class="tbl-wrap"><table><tr><th>how</th><th>Sonuç</th><th>Tipik kullanım</th></tr>
<tr><td><code>inner</code></td><td>İki tarafta da eşleşenler</td><td>Yalnızca bilinen müşterilerin siparişleri</td></tr>
<tr><td><code>left</code></td><td>Sol tablonun tümü, sağdan eşleşen</td><td>Siparişleri koru, müşteri bilgisi yoksa NaN</td></tr>
<tr><td><code>outer</code></td><td>Her iki tablonun tümü</td><td>Uyuşmazlık denetimi</td></tr>
<tr><td><code>concat</code></td><td>Alt alta (ya da yan yana) ekleme</td><td>Aylık dosyaları birleştirme</td></tr>
</table></div>
<pre class="py">import pandas as pd

siparis = pd.DataFrame({"siparis_id": [1, 2, 3, 4], "musteri_id": [10, 20, 10, 99], "tutar": [136.5, 899.0, 127.5, 50.0]})
musteri = pd.DataFrame({"musteri_id": [10, 20, 30], "ad": ["Ayşe", "Mehmet", "Zeynep"], "segment": ["Altın", "Gümüş", "Gümüş"]})

print(pd.merge(siparis, musteri, on="musteri_id", how="inner"))
sol = pd.merge(siparis, musteri, on="musteri_id", how="left", indicator=True)
print(sol[["siparis_id", "ad", "_merge"]])
print(sol[sol["ad"].isna()]["siparis_id"].tolist(), "-&gt; müşterisi bilinmeyen sipariş")

mart = pd.DataFrame({"ay": ["Mart"], "ciro": [1213.0]})
nisan = pd.DataFrame({"ay": ["Nisan"], "ciro": [1480.5]})
print(pd.concat([mart, nisan], ignore_index=True))
</pre>
<div class="warn"><b>Satır patlaması</b>Sağ tabloda anahtar tekrar ediyorsa (bir müşteri iki satır) merge sonrası sol tablo satırları çoğalır ve ciro iki kat çıkar. Birleştirmeden önce <code>musteri["musteri_id"].is_unique</code> kontrol et ya da <code>validate="many_to_one"</code> ver; pandas tekrar varsa hata fırlatır.</div>

<h2>Zaman serisi: resample</h2>
<p>Tarih sütununu index yapınca (<code>set_index("tarih")</code>) pandas zamanı anlar: <code>resample("W")</code> haftalık, <code>"ME"</code> ay sonu, <code>"D"</code> günlük kovalara böler ve groupby gibi özetler. <code>.dt</code> erişimcisi ile ay, hafta günü gibi parçalar sütun olarak çıkarılır.</p>
<pre class="py">import pandas as pd

df = pd.DataFrame({
    "tarih": pd.to_datetime(["2024-03-01", "2024-03-01", "2024-03-04", "2024-03-05",
                             "2024-03-09", "2024-03-12", "2024-03-15", "2024-03-20"]),
    "tutar": [136.5, 899.0, 127.5, 259.8, 273.0, 1250.0, 51.0, 129.9],
})
haftalik = df.set_index("tarih")["tutar"].resample("W").sum()
print(haftalik)
df["gun_adi"] = df["tarih"].dt.day_name()
df["hafta"] = df["tarih"].dt.isocalendar().week
print(df.groupby("hafta", observed=True)["tutar"].agg(["sum", "count"]))
print(haftalik.rolling(2).mean().round(1).dropna())    # hareketli ortalama
</pre>

<h2>apply tuzağı</h2>
<p><code>df.apply(func, axis=1)</code> her satır için Python fonksiyonu çağırır: esnek ama yavaştır, çünkü vektörleştirme kaybolur. Çoğu "satır bazlı" iş aslında sütun aritmetiği, <code>np.where</code>, <code>np.select</code> ya da <code>map</code> ile yazılabilir. <code>apply</code>\'ı son çare olarak, küçük veride ya da gerçekten karmaşık mantıkta kullan.</p>
<pre class="py">import pandas as pd, numpy as np

df = pd.DataFrame({"tutar": [136.5, 899.0, 127.5, 1250.0, 51.0], "segment": ["Altın", "Gümüş", "Altın", "Gümüş", "Bronz"]})

# yavaş yol
df["indirim_a"] = df.apply(lambda r: 0.10 if r["segment"] == "Altın" else 0.0, axis=1)
# hızlı yol: map ve np.select
df["indirim_b"] = df["segment"].map({"Altın": 0.10, "Gümüş": 0.05}).fillna(0.0)
df["kademe"] = np.select([df["tutar"] &gt;= 1000, df["tutar"] &gt;= 500], ["büyük", "orta"], default="küçük")
print(df)
</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Anadolu Market aylık rapor kalıbı</h3>
<p>Üretimde rapor üç fonksiyona ayrılır: <code>yukle()</code> ham veriyi getirir ve temizler; <code>zenginlestir()</code> müşteri ve ürün tablolarıyla merge eder, türetilmiş sütunları ekler; <code>ozetle()</code> groupby/pivot ile çıktı tablolarını üretir. Her birinin girdi-çıktı sözleşmesi (sütun adları ve türleri) testle korunur. Böylece "geçen ay raporu neden farklı?" sorusunun cevabı dakikada bulunur.</p>
<h3>category ve observed</h3>
<p>Şehir gibi sütunları <code>category</code> yaptıysan <code>groupby(..., observed=True)</code> yaz; aksi hâlde veride olmayan kategoriler sıfır satırı olarak gelir ve pandas 2.x uyarı verir (3.x\'te varsayılan True oldu). Kod iki sürümde de aynı davransın diye parametreyi her zaman açıkça ver.</p>
<h3>Pencere fonksiyonları</h3>
<p><code>rolling</code> (hareketli), <code>expanding</code> (kümülatif), <code>shift</code> (önceki dönem) ve <code>pct_change</code> ile "geçen haftaya göre değişim" hesaplanır. Grup içinde pencere için <code>groupby("sehir")["tutar"].shift(1)</code> deseni SQL\'deki LAG ile aynıdır.</p>
</section>`,
    ex: [
      { t: 'code', id: 'pandas-groupby-1',
        q: '<p><code>sehir_ozeti(df)</code> fonksiyonu <code>sehir</code> bazında <code>ciro</code> (tutar toplamı), <code>siparis</code> (satır sayısı) ve <code>ort_sepet</code> (tutar ortalaması, 2 basamak) sütunlarını içeren, <code>ciro</code>\'ya göre azalan sıralı ve <code>sehir</code>\'in normal sütun olduğu (index değil) bir DataFrame döndürsün.</p>',
        start: 'import pandas as pd\n\ndef sehir_ozeti(df):\n    pass\n',
        sol: 'import pandas as pd\n\ndef sehir_ozeti(df):\n    oz = df.groupby("sehir", observed=True).agg(\n        ciro=("tutar", "sum"),\n        siparis=("tutar", "count"),\n        ort_sepet=("tutar", "mean"),\n    ).reset_index()\n    oz["ort_sepet"] = oz["ort_sepet"].round(2)\n    return oz.sort_values("ciro", ascending=False).reset_index(drop=True)\n',
        tests: 'import pandas as pd\ndf = pd.DataFrame({"sehir": ["İstanbul", "Ankara", "İstanbul", "İzmir", "Ankara", "İzmir"], "tutar": [136.5, 899.0, 127.5, 259.8, 273.0, 1250.0]})\nr = sehir_ozeti(df)\nassert list(r.columns) == ["sehir", "ciro", "siparis", "ort_sepet"], "Sütunlar: sehir, ciro, siparis, ort_sepet"\nassert r["sehir"].tolist() == ["İzmir", "Ankara", "İstanbul"], "ciro azalan: İzmir, Ankara, İstanbul"\nassert r["ciro"].round(1).tolist() == [1509.8, 1172.0, 264.0], "ciro toplamları yanlış"\nassert r["siparis"].tolist() == [2, 2, 2], "siparis sayımı yanlış"\nassert r["ort_sepet"].tolist() == [754.9, 586.0, 132.0], "ort_sepet 2 basamak ortalama"\n',
        hints: ['groupby("sehir").agg(ciro=("tutar","sum"), siparis=("tutar","count"), ort_sepet=("tutar","mean")).', 'reset_index() ile sehir sütun olur; sort_values("ciro", ascending=False).'],
        why: 'Adlandırılmış agg çıktı sütunlarını baştan adlandırır; reset_index raporlanabilir düz tablo verir.' },
      { t: 'code', id: 'pandas-groupby-2',
        q: '<p><code>grup_payi(df)</code> fonksiyonu her satıra, satırın <code>tutar</code>\'ının kendi <code>sehir</code> grubundaki toplam tutara yüzdesel payını <code>pay</code> sütunu olarak (1 basamak yuvarlanmış) eklesin. <code>transform</code> kullan, satır sayısı değişmesin, yeni DataFrame döndür.</p>',
        start: 'import pandas as pd\n\ndef grup_payi(df):\n    pass\n',
        sol: 'import pandas as pd\n\ndef grup_payi(df):\n    y = df.copy()\n    toplam = y.groupby("sehir", observed=True)["tutar"].transform("sum")\n    y["pay"] = (y["tutar"] / toplam * 100).round(1)\n    return y\n',
        tests: 'import pandas as pd\ndf = pd.DataFrame({"sehir": ["Ankara", "Ankara", "İzmir", "İzmir", "İzmir"], "tutar": [800.0, 200.0, 250.0, 1250.0, 500.0]})\nr = grup_payi(df)\nassert len(r) == 5, "Satır sayısı değişmemeli"\nassert r["pay"].tolist() == [80.0, 20.0, 12.5, 62.5, 25.0], "pay: [80.0, 20.0, 12.5, 62.5, 25.0]"\nassert "pay" not in df.columns, "Orijinal df değişmemeli"\n',
        hints: ['groupby("sehir")["tutar"].transform("sum") her satıra grubunun toplamını verir.', 'pay = tutar / toplam * 100, sonra .round(1).'],
        why: 'transform, agg\'den farklı olarak satır sayısını korur; grup istatistiğini satıra yayarak oran hesaplamanın standart yoludur.' },
      { t: 'code', id: 'pandas-groupby-3',
        q: '<p><code>capraz(df)</code> fonksiyonu satırlarda <code>sehir</code>, sütunlarda <code>kategori</code>, hücrelerde <code>tutar</code> toplamı olan bir pivot tablo döndürsün; boş kombinasyonlar 0 olsun, toplam satır/sütun <b>eklenmesin</b>.</p>',
        start: 'import pandas as pd\n\ndef capraz(df):\n    pass\n',
        sol: 'import pandas as pd\n\ndef capraz(df):\n    return pd.pivot_table(df, index="sehir", columns="kategori", values="tutar", aggfunc="sum", fill_value=0)\n',
        tests: 'import pandas as pd\ndf = pd.DataFrame({\n    "sehir": ["İstanbul", "Ankara", "İstanbul", "İzmir", "Ankara"],\n    "kategori": ["Gıda", "Elektronik", "Gıda", "Kozmetik", "Gıda"],\n    "tutar": [136.5, 899.0, 127.5, 259.8, 273.0],\n})\npv = capraz(df)\nassert pv.shape == (3, 3), "3 şehir x 3 kategori"\nassert pv.loc["İstanbul", "Gıda"] == 264.0, "İstanbul-Gıda 264.0 olmalı"\nassert pv.loc["İstanbul", "Elektronik"] == 0, "Boş kombinasyon 0 olmalı"\nassert pv.loc["Ankara", "Elektronik"] == 899.0, "Ankara-Elektronik 899.0"\nassert "Toplam" not in pv.index and "All" not in pv.index, "margins eklenmemeli"\n',
        hints: ['pd.pivot_table(df, index="sehir", columns="kategori", values="tutar", aggfunc="sum", fill_value=0).'],
        why: 'pivot_table groupby + unstack kısayoludur; fill_value olmayan kombinasyonları NaN yerine 0 ile doldurur.' },
      { t: 'mc', q: 'Sipariş tablosunu müşteri tablosuyla birleştirirken "tüm siparişler kalsın, müşterisi bulunamayanlarda ad NaN olsun" isteniyor. Hangi <code>how</code>?',
        o: ['inner', 'outer', 'left (sipariş sol tabloysa)', 'right'], a: 2,
        why: 'left sol tablonun tüm satırlarını korur; sağdan eşleşmeyen alanlar NaN olur. inner eşleşmeyen siparişi düşürür, outer müşteri tablosundaki siparişsiz müşterileri de ekler.' },
      { t: 'code', id: 'pandas-groupby-4',
        q: '<p><code>zenginlestir(siparis, musteri)</code> fonksiyonu iki tabloyu <code>musteri_id</code> üzerinden <b>left</b> merge ile birleştirsin (tüm siparişler kalsın), <code>segment</code> eksik olanları <code>"Bilinmiyor"</code> yapsın ve segment bazında tutar toplamını <code>pd.Series</code> olarak döndürsün (index: segment, alfabetik sıralı).</p>',
        start: 'import pandas as pd\n\ndef zenginlestir(siparis, musteri):\n    pass\n',
        sol: 'import pandas as pd\n\ndef zenginlestir(siparis, musteri):\n    b = pd.merge(siparis, musteri, on="musteri_id", how="left")\n    b["segment"] = b["segment"].fillna("Bilinmiyor")\n    return b.groupby("segment", observed=True)["tutar"].sum().sort_index()\n',
        tests: 'import pandas as pd\nsiparis = pd.DataFrame({"siparis_id": [1, 2, 3, 4], "musteri_id": [10, 20, 10, 99], "tutar": [136.5, 899.0, 127.5, 50.0]})\nmusteri = pd.DataFrame({"musteri_id": [10, 20, 30], "segment": ["Altın", "Gümüş", "Gümüş"]})\nr = zenginlestir(siparis, musteri)\nassert isinstance(r, pd.Series), "Series dönmeli"\nassert r.index.tolist() == ["Altın", "Bilinmiyor", "Gümüş"], "index alfabetik: Altın, Bilinmiyor, Gümüş"\nassert r.tolist() == [264.0, 50.0, 899.0], "toplamlar [264.0, 50.0, 899.0]"\n',
        hints: ['pd.merge(siparis, musteri, on="musteri_id", how="left").', 'fillna("Bilinmiyor") sonra groupby("segment")["tutar"].sum().sort_index().'],
        why: 'left merge siparişi kaybetmez; eşleşmeyen müşteri NaN olur ve ayrı segment olarak raporlanır, böylece veri kalitesi sorunu görünür kalır.' },
      { t: 'code', id: 'pandas-groupby-5',
        q: '<p><code>aylik(df)</code> fonksiyonu <code>tarih</code> (datetime) ve <code>tutar</code> sütunlu tabloyu ay bazında toplasın ve <code>{"2024-03": 1213.0, ...}</code> biçiminde, anahtarı <code>"YYYY-MM"</code> metni olan bir sözlük döndürsün. <code>resample("ME")</code> ya da <code>dt.to_period("M")</code> kullanabilirsin.</p>',
        start: 'import pandas as pd\n\ndef aylik(df):\n    pass\n',
        sol: 'import pandas as pd\n\ndef aylik(df):\n    s = df.set_index("tarih")["tutar"].resample("ME").sum()\n    return {k.strftime("%Y-%m"): float(v) for k, v in s.items() if v != 0}\n',
        tests: 'import pandas as pd\ndf = pd.DataFrame({\n    "tarih": pd.to_datetime(["2024-03-01", "2024-03-15", "2024-04-02", "2024-04-20", "2024-06-01"]),\n    "tutar": [100.0, 250.0, 80.0, 20.0, 500.0],\n})\nr = aylik(df)\nassert r["2024-03"] == 350.0 and r["2024-04"] == 100.0 and r["2024-06"] == 500.0, "Aylık toplamlar yanlış"\nassert isinstance(list(r.keys())[0], str), "Anahtar metin olmalı"\n',
        hints: ['set_index("tarih")["tutar"].resample("ME").sum() ay sonu kovalarına toplar.', 'Anahtar için ts.strftime("%Y-%m"). Boş aylar 0 gelir; istersen atla.'],
        why: 'resample tarih index\'ini düzenli aralıklara böler. "ME" ay sonu anlamına gelir; pandas 2.2 ve 3 bunu destekler.' },
      { t: 'mc', q: '<code>df.apply(f, axis=1)</code> yerine ne zaman alternatif aramalısın?',
        o: ['Her zaman; apply hiçbir koşulda kullanılmaz', 'Satır sayısı büyük ve f sütun aritmetiğiyle yazılabiliyorsa', 'Yalnızca string sütunlarda', 'f birden fazla sütun okuyorsa apply tek seçenektir'], a: 1,
        why: 'apply satır başına Python çağrısı yapar; vektörleştirilmiş sütun işlemleri, map, np.where/np.select çok daha hızlıdır. Birden fazla sütun okumak da vektörel yazılabilir.' }
    ],
    faq: [
      { q: 'groupby sonucu neden MultiIndex oldu?', a: 'Birden çok anahtar (["sehir","kategori"]) verince index iki seviyeli olur. reset_index() ile düz sütunlara çevir ya da unstack() ile ikinci anahtarı sütunlara aç.' },
      { q: 'merge\'den sonra satır sayım arttı, neden?', a: 'Sağ tabloda anahtar tekrar ediyor; her eşleşme çoğalır. Önce drop_duplicates ile sağ tabloyu teke indir ya da validate="many_to_one" ile hatayı erken yakala.' },
      { q: 'resample("M") uyarı verdi.', a: 'pandas 2.2 ile ay sonu için "ME", yıl sonu için "YE" kullanılır; "M" ve "Y" kullanımdan kaldırılıyor.' }
    ],
    mistakes: [
      { bad: 'df.groupby("sehir").tutar.sum()["Ankara"]  # category sütunda tüm kategoriler', good: 'df.groupby("sehir", observed=True)["tutar"].sum()', why: 'category sütunlarda observed verilmezse veride olmayan kategoriler sıfır satır olarak gelir ve sürüme göre davranış değişir; açıkça True ver.' },
      { bad: 'pd.merge(siparis, musteri)  # ortak sütuna güvenmek', good: 'pd.merge(siparis, musteri, on="musteri_id", how="left", validate="many_to_one")', why: 'Anahtar belirtmemek yanlış ortak sütunla birleştirebilir; how ve validate niyeti açıkça yazar ve hatayı erken yakalar.' },
      { bad: 'df.apply(lambda r: r["adet"] * r["fiyat"], axis=1)', good: 'df["adet"] * df["fiyat"]', why: 'Satır bazlı apply vektörleştirmeyi kaybeder; sütun aritmetiği hem kısa hem onlarca kat hızlıdır.' },
      { bad: 'df["tarih"].resample("W").sum()', good: 'df.set_index("tarih")["tutar"].resample("W").sum()', why: 'resample DatetimeIndex ister; tarih sütunu index yapılmadan çağrılamaz (ya da on="tarih" verilir).' }
    ]
  },

  /* ========================= 5. gorsellestirme ========================= */
  { id: 'gorsellestirme', lv: 'ileri', mod: 'Veri Bilimi Araçları', min: 35, needs: ['matplotlib', 'pandas'],
    title: 'matplotlib ile görselleştirme',
    sum: 'Figure/Axes modeli; çizgi, çubuk, histogram ve dağılım grafikleri; başlık, eksen, legend; savefig ile dosyaya yazma; pandas .plot kısayolu.',
    goals: ['Figure ve Axes nesnelerini ayırt edip ax üzerinden çizebilirim', 'Veri türüne uygun grafik tipini seçebilirim', 'Başlık, eksen etiketi, legend ve biçimle grafiği okunur yapabilirim', 'savefig ile grafiği dosyaya yazıp figürü kapatabilirim', 'pandas .plot ile hızlı keşif grafiği çizebilirim'],
    body: `<h2>Tablo mu grafik mi?</h2>
<p>Anadolu Market\'in haftalık ciro tablosunu yöneticiye gönderirsen 12 sayıya bakar; aynı veriyi çizgi grafik yaparsan düşüşü saniyede görür. Grafik bir bulgu iletişim aracıdır. Python\'da temel kütüphane <b>matplotlib</b>; pandas\'ın <code>.plot()</code> kısayolu da altında onu kullanır.</p>

<div class="note"><b>Bu ortamda</b>Tarayıcıdaki Python (Pyodide) görüntü penceresi açamaz; bu yüzden örneklerde <code>matplotlib.use("Agg")</code> ile görüntüsüz (headless) arka uç kullanıyor, figürü dosyaya yazıyor ve grafiğin <b>yapısını</b> (başlık, çizgi sayısı, çubuk sayısı) print ile gösteriyoruz. Kendi bilgisayarında aynı kod <code>plt.show()</code> ile pencere açar.</div>

<h2>Figure ve Axes</h2>
<p>Bir <b>Figure</b> tuvaldir; içinde bir ya da daha çok <b>Axes</b> (grafik alanı) bulunur. Modern kullanım: <code>fig, ax = plt.subplots()</code> ile ikisini al, çizimi <code>ax</code> üzerinden yap. <code>plt.plot()</code> gibi "durum makinesi" çağrıları da çalışır ama birden çok grafikte karışır.</p>
<pre class="py">import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

haftalar = ["H1", "H2", "H3", "H4", "H5", "H6"]
ciro = [1213, 1480, 1390, 1725, 1610, 1950]
hedef = [1300, 1400, 1500, 1600, 1700, 1800]

fig, ax = plt.subplots(figsize=(7, 4))
ax.plot(haftalar, ciro, marker="o", label="Ciro")
ax.plot(haftalar, hedef, linestyle="--", color="gray", label="Hedef")
ax.set_title("Anadolu Market haftalık ciro")
ax.set_xlabel("Hafta")
ax.set_ylabel("TL")
ax.legend()
ax.grid(True, alpha=0.3)
fig.savefig("ciro.png", dpi=120, bbox_inches="tight")
plt.close(fig)

print("başlık:", ax.get_title())
print("çizgi sayısı:", len(ax.lines))
print("ilk çizginin y verisi:", list(ax.lines[0].get_ydata()))
</pre>
<div class="tip"><b>savefig ve close</b>Her figürü dosyaya yazdıktan sonra <code>plt.close(fig)</code> çağır. Döngüde yüz grafik üretirken kapatmazsan bellek şişer ve matplotlib uyarı verir.</div>

<h2>Grafik türü seçimi</h2>
<div class="tbl-wrap"><table><tr><th>Soru</th><th>Grafik</th><th>matplotlib</th><th>pandas</th></tr>
<tr><td>Zaman içinde nasıl değişti?</td><td>Çizgi</td><td><code>ax.plot</code></td><td><code>s.plot()</code></td></tr>
<tr><td>Kategoriler arası karşılaştırma</td><td>Çubuk</td><td><code>ax.bar / ax.barh</code></td><td><code>s.plot.bar()</code></td></tr>
<tr><td>Bir değişkenin dağılımı</td><td>Histogram</td><td><code>ax.hist</code></td><td><code>s.plot.hist()</code></td></tr>
<tr><td>İki değişken ilişkisi</td><td>Dağılım</td><td><code>ax.scatter</code></td><td><code>df.plot.scatter(x, y)</code></td></tr>
<tr><td>Parça-bütün (az kategori)</td><td>Pasta (dikkatli)</td><td><code>ax.pie</code></td><td><code>s.plot.pie()</code></td></tr>
</table></div>

<h2>Çubuk ve histogram</h2>
<pre class="py">import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

sehirler = ["İstanbul", "Ankara", "İzmir", "Bursa"]
ciro = [4210, 2980, 2450, 1120]

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9, 3.5))
cubuklar = ax1.bar(sehirler, ciro, color="steelblue")
ax1.set_title("Şehir bazında ciro")
ax1.bar_label(cubuklar, fmt="%d")           # çubuk üstüne değer
ax1.tick_params(axis="x", rotation=20)

tutarlar = [45, 120, 80, 95, 310, 60, 75, 899, 130, 55, 210, 48, 1250, 90, 70]
ax2.hist(tutarlar, bins=6, color="darkorange", edgecolor="white")
ax2.set_title("Sipariş tutarı dağılımı")
ax2.set_xlabel("TL")
fig.tight_layout()
fig.savefig("sehir_hist.png")
plt.close(fig)

print("çubuk sayısı:", len(ax1.patches), "histogram kutusu:", len(ax2.patches))
print("en yüksek çubuk:", max(p.get_height() for p in ax1.patches))
</pre>
<p><code>ax.patches</code> çubukları ve histogram kutularını dikdörtgen nesneler olarak tutar; <code>get_height()</code> yüksekliğini verir. Testlerde grafiğin doğru veriyle çizildiğini bu şekilde kontrol ederiz.</p>

<h2>Dağılım grafiği ve pandas .plot</h2>
<p>Bir DataFrame\'den hızlı keşif grafiği için <code>df.plot(...)</code>: döndürdüğü nesne yine bir Axes\'tir, üstüne matplotlib ile başlık ve etiket ekleyebilirsin. <code>ax=</code> parametresiyle kendi Axes\'ine çizdirirsin.</p>
<pre class="py">import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd

df = pd.DataFrame({
    "sehir": ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"],
    "musteri": [820, 540, 460, 210, 330],
    "ciro": [4210, 2980, 2450, 1120, 1890],
})
fig, ax = plt.subplots(figsize=(5, 4))
df.plot.scatter(x="musteri", y="ciro", ax=ax, s=60, color="seagreen")
for _, r in df.iterrows():
    ax.annotate(r["sehir"], (r["musteri"], r["ciro"]), textcoords="offset points", xytext=(5, 5))
ax.set_title("Müşteri sayısı ve ciro")
fig.savefig("scatter.png")
plt.close(fig)
print("başlık:", ax.get_title(), "| nokta koleksiyonu:", len(ax.collections))

ax2 = df.set_index("sehir")["ciro"].sort_values().plot.barh(title="Ciro (TL)")
print("barh çubuk sayısı:", len(ax2.patches))
plt.close("all")
</pre>

<h2>Okunur grafik için kontrol listesi</h2>
<ul>
<li><b>Başlık</b> bulguyu söylesin: "Ciro" değil, "Haftalık ciro hedefin altında kaldı".</li>
<li><b>Eksen etiketleri</b> birim içersin (TL, adet, %).</li>
<li>Birden çok seri varsa <b>legend</b>; tek seriyse legend gereksiz.</li>
<li>Çubuk grafiği sıralı çiz (<code>sort_values</code>), y ekseni sıfırdan başlasın.</li>
<li>Renk az ve anlamlı olsun: vurgulanacak çubuk farklı, gerisi gri.</li>
<li><code>fig.tight_layout()</code> ya da <code>bbox_inches="tight"</code> ile kesilen etiketleri düzelt.</li>
</ul>
<div class="warn"><b>Pasta grafiği</b>Dörtten fazla dilimde insan gözü oranları karşılaştıramaz; sıralı yatay çubuk neredeyse her zaman daha iyidir.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Rapor üretimini fonksiyonlaştır</h3>
<p>Her grafik için <code>def ciz_ciro(df, yol: str) -&gt; None</code> gibi bir fonksiyon yaz: veri alır, figür kurar, dosyaya yazar, kapatır. Raporlama betiği bu fonksiyonları sırayla çağırır ve PNG\'leri bir HTML ya da PDF şablonuna gömer. Fonksiyonun test edilebilir olması için <code>ax</code> döndürmek de yaygındır; test başlığı ve çizgi sayısını kontrol eder.</p>
<h3>Stil ve tutarlılık</h3>
<p><code>plt.rcParams</code> ya da <code>plt.style.use("ggplot")</code> ile tüm grafiklerde aynı yazı tipi, renk ve ızgara. Kurumsal renkler için bir liste tanımla ve <code>color=</code> ile sırayla kullan. Türkçe karakter sorunu yaşarsan DejaVu Sans gibi Unicode destekli bir yazı tipi seç.</p>
<h3>Ötesi</h3>
<p>İstatistiksel grafikler için seaborn (matplotlib üstüne), etkileşimli panolar için plotly ya da Power BI. Ama hepsinin temelinde aynı sorular: hangi soru, hangi grafik, hangi vurgu.</p>
</section>`,
    ex: [
      { t: 'code', id: 'gorsellestirme-1',
        q: '<p><code>ciro_grafigi(haftalar, ciro)</code> fonksiyonu <code>plt.subplots()</code> ile bir figür kursun, <code>haftalar</code>\'a karşı <code>ciro</code> çizgisini <code>ax.plot</code> ile çizsin, başlığı <code>"Haftalık ciro"</code>, x etiketi <code>"Hafta"</code>, y etiketi <code>"TL"</code> yapsın, figürü <code>"ciro.png"</code> dosyasına kaydedip kapatsın ve <code>ax</code> nesnesini döndürsün. Başlangıç kodundaki <code>matplotlib.use("Agg")</code> satırını koru.</p>',
        start: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef ciro_grafigi(haftalar, ciro):\n    pass\n',
        sol: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef ciro_grafigi(haftalar, ciro):\n    fig, ax = plt.subplots()\n    ax.plot(haftalar, ciro, marker="o")\n    ax.set_title("Haftalık ciro")\n    ax.set_xlabel("Hafta")\n    ax.set_ylabel("TL")\n    fig.savefig("ciro.png")\n    plt.close(fig)\n    return ax\n',
        tests: 'import os\nax = ciro_grafigi(["H1", "H2", "H3"], [1213, 1480, 1390])\nassert ax.get_title() == "Haftalık ciro", "Başlık \\"Haftalık ciro\\" olmalı"\nassert ax.get_xlabel() == "Hafta" and ax.get_ylabel() == "TL", "Eksen etiketleri Hafta / TL olmalı"\nassert len(ax.lines) == 1, "Tek çizgi çizilmeli"\nassert list(ax.lines[0].get_ydata()) == [1213, 1480, 1390], "Çizginin y verisi ciro olmalı"\nassert os.path.exists("ciro.png"), "ciro.png dosyası kaydedilmeli"\n',
        hints: ['fig, ax = plt.subplots(); ax.plot(haftalar, ciro).', 'ax.set_title, ax.set_xlabel, ax.set_ylabel; fig.savefig("ciro.png"); plt.close(fig); return ax.'],
        why: 'Axes üzerinden çizim, etiketleme, kaydetme ve kapatma: üretim grafiklerinin tam döngüsü. ax döndürmek testi mümkün kılar.' },
      { t: 'code', id: 'gorsellestirme-2',
        q: '<p><code>sehir_cubuk(ciro: dict)</code> fonksiyonu şehir → ciro sözlüğünü alsın, şehirleri ciroya göre <b>azalan</b> sıralayıp <code>ax.bar</code> ile çubuk grafiği çizsin; başlık <code>"Şehir bazında ciro"</code>. Figürü <code>"sehir.png"</code>\'ye kaydedip kapat ve <code>ax</code> döndür.</p>',
        start: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef sehir_cubuk(ciro):\n    pass\n',
        sol: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef sehir_cubuk(ciro):\n    sirali = sorted(ciro.items(), key=lambda kv: kv[1], reverse=True)\n    adlar = [k for k, _ in sirali]\n    degerler = [v for _, v in sirali]\n    fig, ax = plt.subplots()\n    ax.bar(adlar, degerler)\n    ax.set_title("Şehir bazında ciro")\n    fig.savefig("sehir.png")\n    plt.close(fig)\n    return ax\n',
        tests: 'ax = sehir_cubuk({"Ankara": 2980, "İstanbul": 4210, "Bursa": 1120, "İzmir": 2450})\nassert ax.get_title() == "Şehir bazında ciro", "Başlık yanlış"\nassert len(ax.patches) == 4, "4 çubuk olmalı"\nyuk = [p.get_height() for p in ax.patches]\nassert yuk == [4210, 2980, 2450, 1120], "Çubuklar azalan sıralı olmalı"\netiket = [t.get_text() for t in ax.get_xticklabels()]\nassert etiket[0] == "İstanbul", "İlk çubuk İstanbul olmalı"\n',
        hints: ['sorted(ciro.items(), key=lambda kv: kv[1], reverse=True) ile sırala.', 'ax.bar(adlar, degerler); patches çubukları tutar.'],
        why: 'Sıralı çubuk grafik karşılaştırmayı kolaylaştırır. ax.patches her çubuğun yüksekliğine erişim sağlar; test de bunu kullanır.' },
      { t: 'code', id: 'gorsellestirme-3',
        q: '<p><code>dagilim(tutarlar, kutu=5)</code> fonksiyonu tutar listesinin histogramını <code>ax.hist(tutarlar, bins=kutu)</code> ile çizsin, başlık <code>"Tutar dağılımı"</code>, x etiketi <code>"TL"</code>; <code>"hist.png"</code>\'ye kaydet, kapat, <code>ax</code> döndür.</p>',
        start: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef dagilim(tutarlar, kutu=5):\n    pass\n',
        sol: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef dagilim(tutarlar, kutu=5):\n    fig, ax = plt.subplots()\n    ax.hist(tutarlar, bins=kutu)\n    ax.set_title("Tutar dağılımı")\n    ax.set_xlabel("TL")\n    fig.savefig("hist.png")\n    plt.close(fig)\n    return ax\n',
        tests: 'veri = [45, 120, 80, 95, 310, 60, 75, 899, 130, 55, 210, 48, 1250, 90, 70]\nax = dagilim(veri)\nassert ax.get_title() == "Tutar dağılımı" and ax.get_xlabel() == "TL", "Başlık/etiket yanlış"\nassert len(ax.patches) == 5, "Varsayılan 5 kutu olmalı"\nassert sum(p.get_height() for p in ax.patches) == len(veri), "Kutu yükseklikleri toplamı eleman sayısına eşit olmalı"\nax2 = dagilim(veri, kutu=8)\nassert len(ax2.patches) == 8, "kutu=8 ile 8 kutu olmalı"\n',
        hints: ['ax.hist(tutarlar, bins=kutu) her kutu için bir patch üretir.'],
        why: 'Histogram dağılımı gösterir; kutu sayısı ayrıntı düzeyini belirler. Yüksekliklerin toplamı eleman sayısıdır, bu testte doğrulanır.' },
      { t: 'mc', q: 'Beş şehrin cirosunu karşılaştırmak için en uygun grafik hangisi?',
        o: ['Pasta grafiği', 'Sıralı çubuk grafiği', 'Çizgi grafiği', 'Histogram'], a: 1,
        why: 'Kategoriler arası karşılaştırma çubukla okunur; çizgi zamansal süreklilik ima eder, histogram tek değişkenin dağılımı içindir, pasta beş dilimde oranları zor okutur.' },
      { t: 'mc', q: 'Döngüde 200 grafik üretip kaydediyorsun; bellek sürekli artıyor. En olası sebep nedir?',
        o: ['savefig dpi değeri çok yüksek', 'Figürler plt.close ile kapatılmıyor', 'ax.set_title her seferinde çağrılıyor', 'Agg arka ucu bellek sızdırır'], a: 1,
        why: 'Her plt.subplots yeni figür açar ve kapatılmadıkça bellekte kalır. savefig sonrası plt.close(fig) ya da plt.close("all") çağrılmalıdır.' },
      { t: 'code', id: 'gorsellestirme-4',
        q: '<p><code>hedef_karsilastir(haftalar, ciro, hedef)</code> fonksiyonu aynı Axes üzerine iki çizgi çizsin: ciro (label <code>"Ciro"</code>) ve hedef (label <code>"Hedef"</code>); <code>ax.legend()</code> çağır, başlık <code>"Ciro ve hedef"</code>. Ayrıca hedefin altında kalan hafta sayısını hesapla. <code>"hedef.png"</code> kaydet, kapat; <code>(ax, altta_kalan_sayi)</code> döndür.</p>',
        start: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef hedef_karsilastir(haftalar, ciro, hedef):\n    pass\n',
        sol: 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n\ndef hedef_karsilastir(haftalar, ciro, hedef):\n    fig, ax = plt.subplots()\n    ax.plot(haftalar, ciro, label="Ciro")\n    ax.plot(haftalar, hedef, linestyle="--", label="Hedef")\n    ax.set_title("Ciro ve hedef")\n    ax.legend()\n    altta = sum(1 for c, h in zip(ciro, hedef) if c < h)\n    fig.savefig("hedef.png")\n    plt.close(fig)\n    return ax, altta\n',
        tests: 'ax, n = hedef_karsilastir(["H1", "H2", "H3", "H4"], [1213, 1480, 1390, 1725], [1300, 1400, 1500, 1600])\nassert ax.get_title() == "Ciro ve hedef", "Başlık yanlış"\nassert len(ax.lines) == 2, "İki çizgi olmalı"\nassert [l.get_label() for l in ax.lines] == ["Ciro", "Hedef"], "Çizgi etiketleri Ciro ve Hedef"\nassert ax.get_legend() is not None, "legend çağrılmalı"\nassert n == 2, "H1 ve H3 hedefin altında: 2"\n',
        hints: ['İki ax.plot çağrısı, her birine label= ver; ax.legend() etiketleri gösterir.', 'Altta kalan: zip(ciro, hedef) ile karşılaştır.'],
        why: 'Aynı Axes üzerinde çoklu seri + legend, karşılaştırma grafiğinin temelidir; fonksiyonun bulguyu (altta kalan sayı) da döndürmesi raporu besler.' }
    ],
    faq: [
      { q: 'plt.plot ile ax.plot arasındaki fark ne?', a: 'plt.plot "geçerli" Axes\'e çizer; tek grafikte sorun yok. Birden çok grafik ya da fonksiyon içinde çizim yapıyorsan hangi eksene çizdiğini açıkça belirtmek için ax.plot kullan.' },
      { q: 'Türkçe karakterler kutu olarak görünüyor.', a: 'Kullanılan yazı tipi Unicode desteklemiyordur. plt.rcParams["font.family"] = "DejaVu Sans" gibi destekli bir yazı tipi seç.' },
      { q: 'Grafiği Excel ya da PowerPoint\'e nasıl koyarım?', a: 'savefig ile PNG (ekran) ya da SVG/PDF (vektör, baskı) kaydet; dpi=150 ve üstü ekran için yeterlidir. Dosyayı sunuma resim olarak ekle.' }
    ],
    mistakes: [
      { bad: 'ax.plot(x, y)\nplt.title("Ciro")  # başka figür aktifse yanlış yere gider', good: 'ax.plot(x, y)\nax.set_title("Ciro")', why: 'plt.* çağrıları geçerli figüre gider; birden çok figürde karışır. Axes metotları hedefi belirsizlik bırakmadan seçer.' },
      { bad: 'for s in sehirler:\n    fig, ax = plt.subplots()\n    ax.bar(...)\n    fig.savefig(f"{s}.png")', good: 'for s in sehirler:\n    fig, ax = plt.subplots()\n    ax.bar(...)\n    fig.savefig(f"{s}.png")\n    plt.close(fig)', why: 'Kapatılmayan figürler bellekte birikir; döngüde mutlaka close çağır.' },
      { bad: 'ax.plot(x, y1)\nax.plot(x, y2)\nax.legend()  # label verilmedi', good: 'ax.plot(x, y1, label="Ciro")\nax.plot(x, y2, label="Hedef")\nax.legend()', why: 'legend yalnızca label verilen serileri gösterir; etiketsiz çizgilerde uyarı alır ve boş legend görürsün.' }
    ]
  },

  /* ========================= 6. async ========================= */
  { id: 'async', lv: 'ileri', mod: 'Eşzamanlılık ve Performans', min: 45,
    title: 'asyncio: coroutine, await ve gather',
    sum: 'Olay döngüsü, coroutine ve await, gather/create_task ile eşzamanlı I/O, asyncio.sleep ile sahte gecikme, Semaphore ile sınırlama, timeout, async for/with.',
    goals: ['Coroutine ile normal fonksiyon arasındaki farkı açıklayabilirim', 'Birden çok I/O işini gather ile eşzamanlı çalıştırabilirim', 'create_task ile arka plan görevi başlatıp sonucunu toplayabilirim', 'Semaphore ve wait_for ile eşzamanlılığı sınırlayıp zaman aşımı koyabilirim', 'async for ve async with kalıplarını okuyup kullanabilirim'],
    body: `<h2>Beklemek zaman kaybı</h2>
<p>Ilgaz Bank\'ın bir servisi, bir kredi başvurusu için üç dış sisteme soruyor: kimlik doğrulama, kredi skoru, kara liste. Her biri yaklaşık yarım saniye. Sırayla sorarsan 1,5 saniye; aynı anda sorup üçünü de beklersen yarım saniye. İşlemci bu süre boyunca zaten boştur, yalnızca ağ cevabını bekler. <b>asyncio</b> bu "beklerken başka işe geç" düşüncesini tek iş parçacığında (thread) gerçekleştirir. Kural: asyncio <b>I/O beklemesi</b> için iyidir; ağır hesap için değil (onun için bir sonraki ders).</p>

<h2>Coroutine ve await</h2>
<p><code>async def</code> ile tanımlanan fonksiyon çağrılınca çalışmaz, bir <b>coroutine nesnesi</b> döndürür. Çalışması için ya <code>await</code> edilir ya da olay döngüsüne (event loop) verilir. <code>await</code> "bu iş bitene kadar beni duraklat, döngü başka işe geçebilir" demektir. Gerçek ağ yerine <code>asyncio.sleep</code> ile sahte gecikme kullanacağız; <code>time.sleep</code> ise döngüyü <b>bloklar</b>, asla kullanma.</p>
<pre class="py">import asyncio, time

async def skor_sor(musteri: str, sure: float) -&gt; int:
    await asyncio.sleep(sure)          # sahte ağ gecikmesi
    return 600 + len(musteri) * 10

async def main():
    t0 = time.perf_counter()
    a = await skor_sor("Ayşe", 0.2)    # sırayla: önce bu biter
    b = await skor_sor("Mehmet", 0.2)  # sonra bu
    print(a, b, f"{time.perf_counter() - t0:.2f} s (sıralı)")

loop = asyncio.new_event_loop()
loop.run_until_complete(main())
loop.close()
</pre>
<div class="note"><b>Olay döngüsünü başlatmak</b>Betiklerde standart kalıp <code>asyncio.run(main())</code>. Jupyter ve tarayıcı (Pyodide) gibi zaten bir döngü çalışan ortamlarda bu çağrı sorun çıkarabilir; o yüzden bu derste <code>loop = asyncio.new_event_loop(); loop.run_until_complete(main())</code> kalıbını kullanıyoruz. İkisi de aynı işi yapar: coroutine\'i çalıştırıp sonucunu verir.</div>

<h2>gather: hepsini aynı anda</h2>
<p><code>asyncio.gather(c1, c2, c3)</code> coroutine\'leri birlikte başlatır, hepsinin bitmesini bekler ve sonuçları <b>verilen sırayla</b> liste olarak döndürür. Toplam süre en uzun işin süresi kadardır.</p>
<pre class="py">import asyncio, time

async def servis(ad: str, sure: float) -&gt; str:
    await asyncio.sleep(sure)
    return f"{ad}: tamam"

async def main():
    t0 = time.perf_counter()
    sonuc = await asyncio.gather(
        servis("kimlik", 0.3),
        servis("skor", 0.2),
        servis("kara_liste", 0.25),
    )
    print(sonuc)
    print(f"{time.perf_counter() - t0:.2f} s (eşzamanlı; en uzunu 0.3)")

loop = asyncio.new_event_loop()
loop.run_until_complete(main())
loop.close()
</pre>
<div class="tip"><b>Hata yönetimi</b>Varsayılan <code>gather</code>'da ilk hata hemen yükselir ama <b>diğer işler iptal edilmez</b>, arkada çalışmaya devam eder. <code>return_exceptions=True</code> hatayı yükseltmez, sonuç listesinde o konuma istisna nesnesini koyar. Biri hata verince hepsini birlikte iptal etmek için <code>asyncio.TaskGroup</code> kullan. Toplu sorgulamada "biri patladı diye hepsi çökmesin" istiyorsan bunu kullan.</div>

<h2>create_task: arka planda başlat</h2>
<p><code>gather</code> hepsini beklerken <code>asyncio.create_task(coro)</code> işi hemen zamanlar ve sana bir <b>Task</b> verir; sen başka şey yapar, istediğinde <code>await task</code> ile sonucu alırsın. Bir sayaç, bir ısıtma işlemi ya da sonucu sonra gereken sorgu için uygundur.</p>
<pre class="py">import asyncio

async def kur_doviz(sure=0.2):
    await asyncio.sleep(sure)
    return {"USD": 32.5, "EUR": 35.1}

async def main():
    gorev = asyncio.create_task(kur_doviz())     # hemen başlar
    print("kur isteği gönderildi, başka iş yapıyorum")
    await asyncio.sleep(0.05)
    print("görev bitti mi?", gorev.done())
    kur = await gorev                            # burada bekle
    print("kur:", kur, "bitti mi?", gorev.done())

loop = asyncio.new_event_loop()
loop.run_until_complete(main())
loop.close()
</pre>

<h2>Semaphore ve timeout</h2>
<p>Bin müşteri için skor sorgusunu aynı anda atarsan karşı sistem seni engeller. <code>asyncio.Semaphore(n)</code> aynı anda en çok n işin "içeride" olmasına izin verir. <code>asyncio.wait_for(coro, timeout=s)</code> süre dolarsa <code>TimeoutError</code> fırlatır; 3.11+ ile <code>async with asyncio.timeout(s)</code> bloğu da var.</p>
<pre class="py">import asyncio, time

sem = asyncio.Semaphore(3)

async def sorgu(i: int) -&gt; int:
    async with sem:                      # aynı anda en çok 3
        await asyncio.sleep(0.1)
        return i * i

async def yavas():
    await asyncio.sleep(1.0)
    return "geç geldi"

async def main():
    t0 = time.perf_counter()
    sonuc = await asyncio.gather(*(sorgu(i) for i in range(9)))
    print(sonuc, f"{time.perf_counter() - t0:.2f} s (9 iş / 3 eşzamanlı ≈ 0.3)")
    try:
        await asyncio.wait_for(yavas(), timeout=0.2)
    except TimeoutError:
        print("zaman aşımı: 0.2 s içinde cevap gelmedi")

loop = asyncio.new_event_loop()
loop.run_until_complete(main())
loop.close()
</pre>
<div class="warn"><b>asyncio.TimeoutError</b>Python 3.11\'den itibaren <code>asyncio.TimeoutError</code> yerleşik <code>TimeoutError</code> ile aynı sınıftır; ikisini de yakalayabilirsin. Eski sürümlerde ayrıydılar.</div>

<h2>async for ve async with</h2>
<p>Sayfalı API\'den veri çekerken her sayfa bir bekleme gerektirir; <b>async üreteç</b> (<code>async def</code> içinde <code>yield</code>) bunu doğal ifade eder ve <code>async for</code> ile tüketilir. <code>async with</code> ise açılış/kapanışı bekleme gerektiren kaynaklar (bağlantı, oturum) içindir; Semaphore örneğinde gördün.</p>
<pre class="py">import asyncio

async def sayfalar(toplam: int, boyut: int = 3):
    for baslangic in range(0, toplam, boyut):
        await asyncio.sleep(0.05)                      # her sayfa bir istek
        yield list(range(baslangic, min(baslangic + boyut, toplam)))

async def main():
    hepsi = []
    async for sayfa in sayfalar(8):
        print("sayfa geldi:", sayfa)
        hepsi.extend(sayfa)
    print("toplam kayıt:", len(hepsi))

loop = asyncio.new_event_loop()
loop.run_until_complete(main())
loop.close()
</pre>

<div class="tbl-wrap"><table><tr><th>Araç</th><th>Ne zaman</th></tr>
<tr><td><code>await coro</code></td><td>Sonuç hemen lazım, sırayla</td></tr>
<tr><td><code>gather</code></td><td>Birkaç bağımsız iş, hepsinin sonucu lazım</td></tr>
<tr><td><code>create_task</code></td><td>Arka planda başlat, sonra topla</td></tr>
<tr><td><code>Semaphore</code></td><td>Eşzamanlılığı sınırla (rate limit)</td></tr>
<tr><td><code>wait_for / timeout</code></td><td>Yavaş cevabı kesmek</td></tr>
<tr><td><code>async for</code></td><td>Parça parça gelen veri</td></tr>
</table></div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Bloklayan kodu izole et</h3>
<p>Olay döngüsünde <code>time.sleep</code>, ağır hesap ya da senkron veritabanı sürücüsü tüm görevleri dondurur. Böyle bir işi <code>await asyncio.to_thread(func, *args)</code> ile ayrı iş parçacığına at; döngü akmaya devam eder. Gerçek ağ kütüphanesi seçerken async destekli olanı seç (httpx, aiohttp, asyncpg).</p>
<h3>Task yaşam döngüsü</h3>
<p>Referansı tutulmayan bir Task çöp toplayıcı tarafından yok edilebilir; task\'leri bir listede ya da <code>asyncio.TaskGroup</code> (3.11+) içinde tut. TaskGroup, <code>async with</code> bloğu bitene kadar tüm görevleri bekler ve biri hata verirse diğerlerini iptal eder; yapılandırılmış eşzamanlılık (structured concurrency) denilen bu yaklaşım üretim kodunda tercih edilir.</p>
<h3>Ne zaman async?</h3>
<p>Binlerce eşzamanlı bağlantı, web sunucusu (FastAPI), çok sayıda API çağrısı: evet. Tek dosya işleme, CPU-yoğun analiz, basit betik: hayır; karmaşıklığı hak etmez.</p>
</section>`,
    ex: [
      { t: 'code', id: 'async-1',
        q: '<p>Coroutine <code>skor_sor(musteri, sure)</code>: <code>asyncio.sleep(sure)</code> ile beklesin, <code>600 + len(musteri) * 10</code> döndürsün. Ardından <code>toplu_skor(musteriler, sure)</code> coroutine\'i tüm müşterileri <code>gather</code> ile <b>aynı anda</b> sorgulayıp <code>{musteri: skor}</code> sözlüğü döndürsün. Testler toplam sürenin tek gecikmeye yakın olduğunu kontrol eder.</p>',
        start: 'import asyncio\n\nasync def skor_sor(musteri, sure):\n    pass\n\nasync def toplu_skor(musteriler, sure):\n    pass\n',
        sol: 'import asyncio\n\nasync def skor_sor(musteri, sure):\n    await asyncio.sleep(sure)\n    return 600 + len(musteri) * 10\n\nasync def toplu_skor(musteriler, sure):\n    skorlar = await asyncio.gather(*(skor_sor(m, sure) for m in musteriler))\n    return dict(zip(musteriler, skorlar))\n',
        tests: 'import asyncio, time\nloop = asyncio.new_event_loop()\nt0 = time.perf_counter()\nr = loop.run_until_complete(toplu_skor(["Ayşe", "Mehmet", "Ali"], 0.2))\nsure = time.perf_counter() - t0\nloop.close()\nassert r == {"Ayşe": 640, "Mehmet": 660, "Ali": 630}, "Skor sözlüğü yanlış"\nassert sure < (0.5 * (4 if __import__("sys").platform == "emscripten" else 1)), f"Sorgular eşzamanlı olmalı (gather); süre {sure:.2f} s"\n',
        hints: ['skor_sor içinde await asyncio.sleep(sure).', 'gather(*(skor_sor(m, sure) for m in musteriler)) sonuçları sırayla verir; zip ile sözlüğe çevir.'],
        why: 'gather üç 0.2 s beklemeyi üst üste değil yan yana koyar; toplam 0.2 s civarı kalır. Sonuç sırası girdi sırasıyla aynıdır.' },
      { t: 'code', id: 'async-2',
        q: '<p><code>sinirli_sorgu(idler, es_zamanli)</code> coroutine\'i her id için <code>asyncio.sleep(0.05)</code> bekleyip <code>id * 2</code> hesaplasın; ancak <code>asyncio.Semaphore(es_zamanli)</code> ile aynı anda en çok <code>es_zamanli</code> sorgu çalışsın. Ek olarak aynı anda içeride olan en yüksek sayıyı ölçüp sonuç listesiyle birlikte döndür: <code>(sonuclar, tepe)</code>.</p>',
        start: 'import asyncio\n\nasync def sinirli_sorgu(idler, es_zamanli):\n    sem = asyncio.Semaphore(es_zamanli)\n    aktif = 0\n    tepe = 0\n    # her id için bir iç coroutine yaz, gather ile çalıştır\n    pass\n',
        sol: 'import asyncio\n\nasync def sinirli_sorgu(idler, es_zamanli):\n    sem = asyncio.Semaphore(es_zamanli)\n    aktif = 0\n    tepe = 0\n\n    async def bir(i):\n        nonlocal aktif, tepe\n        async with sem:\n            aktif += 1\n            tepe = max(tepe, aktif)\n            await asyncio.sleep(0.05)\n            aktif -= 1\n            return i * 2\n\n    sonuclar = await asyncio.gather(*(bir(i) for i in idler))\n    return list(sonuclar), tepe\n',
        tests: 'import asyncio\nloop = asyncio.new_event_loop()\nson, tepe = loop.run_until_complete(sinirli_sorgu(list(range(10)), 3))\nloop.close()\nassert son == [i * 2 for i in range(10)], "Sonuçlar id*2 ve girdi sırasında olmalı"\nassert tepe == 3, f"Aynı anda en çok 3 sorgu olmalı, ölçülen {tepe}"\nloop = asyncio.new_event_loop()\nson2, tepe2 = loop.run_until_complete(sinirli_sorgu([1, 2], 5))\nloop.close()\nassert tepe2 == 2 and son2 == [2, 4], "2 iş varsa tepe 2 olmalı"\n',
        hints: ['İç coroutine içinde async with sem: bloğu kullan; nonlocal ile sayaçları güncelle.', 'Sayaç artışını sleep\'ten önce, azalışı sonra yap; tepe = max(tepe, aktif).'],
        why: 'Semaphore eşzamanlılığı sınırlar; tek iş parçacığı olduğundan sayaç güncellemesi await arasında güvenlidir. Tepe değeri sınırın çalıştığını kanıtlar.' },
      { t: 'code', id: 'async-3',
        q: '<p><code>guvenli_sorgu(sure, zaman_asimi)</code> coroutine\'i <code>asyncio.sleep(sure)</code> bekleyip <code>"tamam"</code> döndüren bir iç coroutine\'i <code>asyncio.wait_for</code> ile <code>zaman_asimi</code> saniye sınırlayarak çalıştırsın. Süre dolarsa istisna yakalanıp <code>"zaman aşımı"</code> döndürülsün.</p>',
        start: 'import asyncio\n\nasync def guvenli_sorgu(sure, zaman_asimi):\n    pass\n',
        sol: 'import asyncio\n\nasync def guvenli_sorgu(sure, zaman_asimi):\n    async def is_yap():\n        await asyncio.sleep(sure)\n        return "tamam"\n    try:\n        return await asyncio.wait_for(is_yap(), timeout=zaman_asimi)\n    except TimeoutError:\n        return "zaman aşımı"\n',
        tests: 'import asyncio\nloop = asyncio.new_event_loop()\nassert loop.run_until_complete(guvenli_sorgu(0.05, 0.5)) == "tamam", "Süre yetiyorsa tamam dönmeli"\nassert loop.run_until_complete(guvenli_sorgu(0.5, 0.05)) == "zaman aşımı", "Süre dolunca zaman aşımı dönmeli"\nloop.close()\n',
        hints: ['await asyncio.wait_for(coro, timeout=zaman_asimi).', 'except TimeoutError (3.11+ asyncio.TimeoutError ile aynı).'],
        why: 'wait_for süresi dolan görevi iptal eder ve TimeoutError fırlatır; yakalayıp anlamlı bir değer döndürmek servisin kilitlenmesini önler.' },
      { t: 'mc', q: '<code>async def</code> ile tanımlı <code>f()</code> fonksiyonunu <code>f()</code> diye çağırıp await etmezsen ne olur?',
        o: ['Fonksiyon normal çalışır', 'Coroutine nesnesi oluşur, gövde çalışmaz', 'SyntaxError', 'Olay döngüsü otomatik başlar'], a: 1,
        why: 'Coroutine çağrısı yalnızca bir nesne üretir; gövde await ya da create_task ile zamanlanınca çalışır. Python "coroutine was never awaited" uyarısı verir.' },
      { t: 'mc', q: 'Olay döngüsü içinde <code>time.sleep(1)</code> çağırmanın etkisi nedir?',
        o: ['Yalnızca o görev 1 sn bekler, diğerleri akar', 'Tüm görevler 1 sn donar', 'Hata fırlatılır', 'Döngü otomatik olarak to_thread kullanır'], a: 1,
        why: 'time.sleep senkron ve bloklayıcıdır; tek iş parçacığındaki döngü başka göreve geçemez. Beklemek için asyncio.sleep, bloklayan iş için asyncio.to_thread kullanılır.' },
      { t: 'code', id: 'async-4',
        q: '<p>Async üreteç <code>sayfalar(toplam, boyut)</code>: her sayfadan önce <code>asyncio.sleep(0.01)</code> bekleyip <code>boyut</code> elemanlık sayı listeleri üretsin (0..toplam-1 aralığını kapsayan, son sayfa kısa olabilir). <code>hepsini_topla(toplam, boyut)</code> coroutine\'i <code>async for</code> ile sayfaları gezip tüm sayıları tek listede, ayrıca sayfa sayısını döndürsün: <code>(liste, sayfa_sayisi)</code>.</p>',
        start: 'import asyncio\n\nasync def sayfalar(toplam, boyut):\n    pass\n\nasync def hepsini_topla(toplam, boyut):\n    pass\n',
        sol: 'import asyncio\n\nasync def sayfalar(toplam, boyut):\n    for b in range(0, toplam, boyut):\n        await asyncio.sleep(0.01)\n        yield list(range(b, min(b + boyut, toplam)))\n\nasync def hepsini_topla(toplam, boyut):\n    hepsi, n = [], 0\n    async for sayfa in sayfalar(toplam, boyut):\n        hepsi.extend(sayfa)\n        n += 1\n    return hepsi, n\n',
        tests: 'import asyncio\nloop = asyncio.new_event_loop()\nl, n = loop.run_until_complete(hepsini_topla(8, 3))\nassert l == list(range(8)), "Tüm sayılar 0..7 toplanmalı"\nassert n == 3, "8 kayıt 3\'lük sayfada 3 sayfa eder"\nl2, n2 = loop.run_until_complete(hepsini_topla(0, 3))\nassert l2 == [] and n2 == 0, "toplam=0 ise boş"\nloop.close()\n',
        hints: ['async def içinde yield kullanınca async üreteç olur.', 'Tüketici tarafında async for sayfa in sayfalar(...).'],
        why: 'Async üreteç, her adımda bekleme gerektiren akışları (sayfalı API, akış okuma) döngü gibi ifade eder; async for her yield arasında döngüye kontrolü bırakır.' }
    ],
    faq: [
      { q: 'asyncio.run ile new_event_loop + run_until_complete arasındaki fark ne?', a: 'asyncio.run döngüyü kurar, çalıştırır, kalan görevleri kapatır ve döngüyü yok eder; betiklerde tercih edilen budur. Jupyter ya da tarayıcı gibi zaten döngü çalışan ortamlarda hata verebilir; orada yeni bir döngü yaratıp run_until_complete çağırmak ya da üst seviye await kullanmak gerekir.' },
      { q: 'gather sonuçları hangi sırada verir?', a: 'Verilen coroutine sırasında; hangisinin önce bittiği önemli değildir. Bitiş sırasıyla işlemek istersen asyncio.as_completed kullan.' },
      { q: 'asyncio CPU-yoğun işi hızlandırır mı?', a: 'Hayır. Tek iş parçacığında çalışır; hesap yaparken bekleyen başka iş olmaz. CPU işi için multiprocessing ya da numpy gibi C tabanlı kütüphaneler gerekir.' }
    ],
    mistakes: [
      { bad: 'async def f():\n    time.sleep(1)', good: 'async def f():\n    await asyncio.sleep(1)', why: 'time.sleep tüm olay döngüsünü bloklar; asyncio.sleep yalnızca bu görevi duraklatır.' },
      { bad: 'sonuc = skor_sor("Ayşe", 0.2)\nprint(sonuc)  # <coroutine object ...>', good: 'sonuc = await skor_sor("Ayşe", 0.2)', why: 'await olmadan coroutine çalışmaz; yalnızca nesnesi elde edilir.' },
      { bad: 'for m in musteriler:\n    r = await skor_sor(m, 0.2)   # sırayla, yavaş', good: 'r = await asyncio.gather(*(skor_sor(m, 0.2) for m in musteriler))', why: 'Döngü içinde await işleri sıraya sokar; bağımsız işler gather ile aynı anda başlatılmalıdır.' },
      { bad: 'asyncio.create_task(isle())\n# referans tutulmadı, await edilmedi', good: 'g = asyncio.create_task(isle())\n...\nawait g', why: 'Referansı tutulmayan görev toplanabilir ve hatası sessizce kaybolur; görevleri sakla ve bekle (ya da TaskGroup kullan).' }
    ]
  }
);
})(window);
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
/* ========================= 7. eszamanlilik ========================= */
  { id: 'eszamanlilik', lv: 'ileri', mod: 'Eşzamanlılık ve Performans', min: 40,
    title: 'threading, concurrent.futures ve GIL',
    sum: 'Thread ve havuz (ThreadPoolExecutor), Lock ile paylaşılan durumu koruma, queue ile üretici-tüketici, GIL\'in etkisi ve ProcessPoolExecutor kavramı; hangi iş için hangi araç.',
    goals: ['ThreadPoolExecutor ile I/O işlerini paralel çalıştırıp sonuçları toplayabilirim', 'Yarış durumunu (race condition) tanıyıp Lock ile önleyebilirim', 'queue.Queue ile üretici-tüketici kalıbı kurabilirim', 'GIL\'in thread ve process seçimini nasıl etkilediğini açıklayabilirim', 'asyncio, thread ve process arasında işe göre doğru aracı seçebilirim'],
    body: `<div class="warn"><b>Bu derste örnekler tarayıcıda farklı davranır</b>Tarayıcıdaki Python gerçek iş parçacığı başlatamaz: thread\'ler sırayla çalışır. Bu yüzden thread örneklerinde hız kazancı ya da yarış durumu burada görünmez. Her örneğin altında <b>kendi bilgisayarında beklenen çıktı</b> yazıyor; bu dersi bilgisayarında da çalıştırman iyi olur.</div>
<h2>Üç araç, üç farklı iş</h2>
<p>Anadolu Market\'in gece işi: 200 tedarikçi dosyasını indir (ağ beklemesi), her birini ayrıştır (hafif), sonra 2 milyon satırda fiyat optimizasyonu hesapla (ağır hesap). Üçü de "aynı anda daha çok iş" ister ama farklı araçlarla: ağ için thread ya da asyncio, ağır hesap için süreç (process). Bu dersin amacı doğru aracı seçmeyi ve paylaşılan veriyi güvenle korumayı öğretmek.</p>

<h2>İş parçacığı (thread) ve havuz</h2>
<p>Thread, aynı süreç içinde paralel akan bir çalışma hattıdır; belleği paylaşır. Elle <code>threading.Thread</code> başlatabilirsin ama modern kalıp <code>concurrent.futures.ThreadPoolExecutor</code>: sabit sayıda işçi, <code>submit</code> ile iş ver, <code>Future</code> ile sonucu al; ya da <code>map</code> ile liste gibi kullan.</p>
<pre class="py">import time
from concurrent.futures import ThreadPoolExecutor, as_completed

def indir(tedarikci: str) -&gt; str:
    time.sleep(0.1)                       # sahte ağ beklemesi
    return f"{tedarikci}.csv"

tedarikciler = ["Ege", "Marmara", "Karadeniz", "Akdeniz", "Anadolu", "Trakya"]

t0 = time.perf_counter()
sirali = [indir(t) for t in tedarikciler]
print(f"sıralı: {time.perf_counter() - t0:.2f} s")

t0 = time.perf_counter()
with ThreadPoolExecutor(max_workers=3) as havuz:
    sonuc = list(havuz.map(indir, tedarikciler))      # sıra korunur
print(sonuc, f"havuz(3): {time.perf_counter() - t0:.2f} s")

with ThreadPoolExecutor(max_workers=6) as havuz:
    gelecekler = {havuz.submit(indir, t): t for t in tedarikciler}
    for f in as_completed(gelecekler):                  # bitiş sırasıyla
        print("bitti:", f.result())
</pre>
<pre class="out">Kendi bilgisayarında beklenen çıktı (süre değişebilir, "bitti" sırası her seferinde farklı olabilir):
sıralı: 0.60 s
['Ege.csv', 'Marmara.csv', 'Karadeniz.csv', 'Akdeniz.csv', 'Anadolu.csv', 'Trakya.csv'] havuz(3): 0.20 s
bitti: Marmara.csv
bitti: Ege.csv
…
Tarayıcıda iki süre de 0.60 s görünür, çünkü thread\'ler sırayla çalışır.</pre>
<div class="tip"><b>map mi submit mi?</b><code>map</code> girdi sırasında sonuç verir ve kısa yazılır. <code>submit</code> + <code>as_completed</code> biten işi hemen işlemene, hataları tek tek yakalamana izin verir; <code>f.result()</code> işçideki istisnayı burada yeniden fırlatır.</div>

<h2>GIL: tek anda tek Python</h2>
<p>CPython\'da <b>GIL</b> (Global Interpreter Lock) aynı anda yalnızca bir thread\'in Python bytecode çalıştırmasına izin verir. Thread\'ler beklerken (ağ, disk, <code>sleep</code>) GIL\'i bırakır; o yüzden I/O işinde havuz gerçek hız sağlar. Ama saf Python hesabında iki thread sırayla çalışır, toplam süre düşmez, hatta kilit alışverişi yüzünden artabilir.</p>
<pre class="py">import time
from concurrent.futures import ThreadPoolExecutor

def hesap(n: int) -&gt; int:
    return sum(i * i for i in range(n))         # saf Python, CPU işi

N = 300_000
t0 = time.perf_counter()
[hesap(N) for _ in range(4)]
tek = time.perf_counter() - t0

t0 = time.perf_counter()
with ThreadPoolExecutor(max_workers=4) as havuz:
    list(havuz.map(hesap, [N] * 4))
coklu = time.perf_counter() - t0
print(f"sıralı {tek:.2f} s, 4 thread {coklu:.2f} s -&gt; GIL yüzünden kazanç yok")
</pre>
<div class="note"><b>Çıkış yolu</b>CPU işi için <code>ProcessPoolExecutor</code>: her işçi ayrı bir süreçtir, kendi GIL\'i vardır, çekirdekler gerçekten paralel çalışır. Bedeli: veri süreçler arasında kopyalanır (pickle), başlatma maliyeti vardır. Kullanımı ThreadPoolExecutor ile aynı arayüzdür; yalnızca sınıf adı değişir ve fonksiyon modül düzeyinde tanımlı olmalıdır. Tarayıcıdaki Python\'da süreç oluşturulamadığı için bu derste yalnızca anlatıyoruz; kendi makinende dene. Python 3.13 ile deneysel gelen, 3.14\'te resmî destek kazanan "free-threaded" yapı GIL\'siz çalışabiliyor ama varsayılan değil ve henüz varsayılan değil.</div>

<h2>Yarış durumu ve Lock</h2>
<p>İki thread aynı sayacı artırırsa ne olur? <code>sayac += 1</code> aslında oku-artır-yaz üç adımdır; GIL adımların arasında thread değiştirebilir ve bir artış kaybolur. Buna <b>yarış durumu</b> (race condition) denir. Çözüm: paylaşılan veriye erişimi <code>threading.Lock</code> ile tek seferde bir thread\'e vermek.</p>
<pre class="py">import threading, time
from concurrent.futures import ThreadPoolExecutor

bakiye = 0
kilit = threading.Lock()

def yatir_guvensiz(n):
    global bakiye
    for _ in range(n):
        tmp = bakiye            # oku
        time.sleep(0)           # başka thread'e sıra ver: yarışı görünür kılar
        bakiye = tmp + 1        # yaz

def yatir_guvenli(n):
    global bakiye
    for _ in range(n):
        with kilit:             # kritik bölge
            bakiye += 1

for fn in (yatir_guvensiz, yatir_guvenli):
    bakiye = 0
    with ThreadPoolExecutor(max_workers=4) as havuz:
        list(havuz.map(fn, [2_000] * 4))
    print(fn.__name__, "beklenen 8000, gelen", bakiye)
</pre>
<pre class="out">Kendi bilgisayarında beklenen çıktı (ilk sayı her çalıştırmada farklı olur, 8000'den küçüktür):
yatir_guvensiz beklenen 8000, gelen 2004
yatir_guvenli beklenen 8000, gelen 8000
Tarayıcıda ikisi de 8000 görünür, çünkü thread'ler sırayla çalışır: yarış burada oluşmaz.</pre>
<div class="warn"><b>Kilit her yerde değil</b>Kilit tutulan süre kısa olsun; kilit içinde I/O yapma. Birden çok kilit varsa hep aynı sırada al, yoksa karşılıklı bekleme (deadlock) oluşur. Mümkünse paylaşılan durumdan kaçın: her işçi kendi sonucunu döndürsün, ana thread toplasın.</div>

<h2>queue ile üretici-tüketici</h2>
<p><code>queue.Queue</code> thread-güvenli bir kuyruktur: üreticiler <code>put</code>, tüketiciler <code>get</code> yapar, kilitle uğraşmazsın. <code>None</code> gibi bir "zehirli hap" (sentinel) ile tüketicilere bitişi bildir; <code>task_done</code>/<code>join</code> ile tüm işlerin bittiğini bekle.</p>
<pre class="py">import queue, threading, time

kuyruk: queue.Queue = queue.Queue()
islenen = []
kilit = threading.Lock()

def tuketici(ad):
    while True:
        siparis = kuyruk.get()
        if siparis is None:          # bitiş sinyali
            kuyruk.task_done()
            break
        time.sleep(0.01)             # sahte işleme
        with kilit:
            islenen.append((ad, siparis))
        kuyruk.task_done()

isciler = [threading.Thread(target=tuketici, args=(f"isci{i}",)) for i in range(3)]
for t in isciler:
    t.start()
for sid in range(1001, 1011):
    kuyruk.put(sid)
for _ in isciler:
    kuyruk.put(None)
kuyruk.join()
print("işlenen sipariş:", sorted(s for _, s in islenen))
print("işçi başına:", {ad: sum(1 for a, _ in islenen if a == ad) for ad in ("isci0", "isci1", "isci2")})
</pre>
<pre class="out">Kendi bilgisayarında beklenen çıktı (dağılım her seferinde değişir):
işlenen sipariş: [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010]
işçi başına: {'isci0': 3, 'isci1': 3, 'isci2': 4}
Tarayıcıda işin tamamını ilk işçi yapar: {'isci0': 10, 'isci1': 0, 'isci2': 0}.</pre>

<h2>Hangi iş için hangisi?</h2>
<div class="tbl-wrap"><table><tr><th>İş türü</th><th>Araç</th><th>Neden</th></tr>
<tr><td>Çok sayıda ağ/disk beklemesi, kütüphane async destekliyor</td><td>asyncio</td><td>Tek thread, binlerce bağlantı, düşük bellek</td></tr>
<tr><td>Ağ/disk beklemesi, kütüphane senkron (requests, sqlite)</td><td>ThreadPoolExecutor</td><td>Kodu değiştirmeden paralel; GIL beklerken bırakılır</td></tr>
<tr><td>Saf Python CPU hesabı</td><td>ProcessPoolExecutor</td><td>GIL\'i aşar, çekirdekleri kullanır</td></tr>
<tr><td>Sayısal hesap</td><td>numpy/pandas (önce bunu dene)</td><td>Vektörel işlem C'de çalışır, çoğu zaman tek çekirdekte bile en hızlısıdır; numpy birçok döngüde GIL\'i bırakır, pandas\'ta bu işleme göre değişir</td></tr>
<tr><td>Basit betik</td><td>Hiçbiri</td><td>Karmaşıklık maliyeti kazancı geçer</td></tr>
</table></div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>İşçi sayısı</h3>
<p>I/O işinde işçi sayısı çekirdek sayısından bağımsızdır; karşı sistemin kaldırabileceği kadar (10-50) seçilir. CPU işinde <code>os.cpu_count()</code> kadar süreç yeterlidir; fazlası bağlam değişimine harcanır. ThreadPoolExecutor\'ın varsayılanı <code>min(32, cpu_count + 4)</code>\'tür.</p>
<h3>Hata ve zaman aşımı</h3>
<p><code>future.result(timeout=5)</code> bekleme süresini sınırlar; <code>concurrent.futures.wait(..., return_when=FIRST_EXCEPTION)</code> ilk hatada durmanı sağlar. Thread içindeki yakalanmamış istisna kaybolmaz, <code>result()</code> çağrısında yeniden fırlatılır; ama <code>threading.Thread</code> ile elle başlattığın thread\'de yalnızca stderr\'e yazılır, bu yüzden havuz tercih edilir.</p>
<h3>asyncio ile köprü</h3>
<p>Async kodda senkron bir kütüphane çağırman gerekiyorsa <code>await asyncio.to_thread(func)</code> arka planda bir ThreadPoolExecutor kullanır. Tersine, senkron koddan async kütüphane çağırmak için ayrı bir thread\'de olay döngüsü çalıştırılır. İki dünya birbirini dışlamaz; sınırı bilinçli çiz.</p>
</section>`,
    ex: [
      { t: 'code', id: 'eszamanlilik-1',
        q: '<p><code>paralel_indir(tedarikciler, isci)</code> fonksiyonu <code>ThreadPoolExecutor(max_workers=isci)</code> ile her tedarikçi için <code>indir</code> fonksiyonunu çalıştırsın (indir verilmiştir; 0.1 s bekler ve <code>"ad.csv"</code> döndürür) ve sonuçları <b>girdi sırasında</b> liste olarak döndürsün. Testler sürenin sıralı çalışmadan kısa olduğunu kontrol eder.</p>',
        start: 'import time\nfrom concurrent.futures import ThreadPoolExecutor\n\ndef indir(tedarikci):\n    time.sleep(0.1)\n    return f"{tedarikci}.csv"\n\ndef paralel_indir(tedarikciler, isci):\n    pass\n',
        sol: 'import time\nfrom concurrent.futures import ThreadPoolExecutor\n\ndef indir(tedarikci):\n    time.sleep(0.1)\n    return f"{tedarikci}.csv"\n\ndef paralel_indir(tedarikciler, isci):\n    with ThreadPoolExecutor(max_workers=isci) as havuz:\n        return list(havuz.map(indir, tedarikciler))\n',
        tests: 'import time\nt0 = time.perf_counter()\nr = paralel_indir(["Ege", "Marmara", "Karadeniz", "Akdeniz", "Anadolu", "Trakya"], 6)\nsure = time.perf_counter() - t0\nassert r == ["Ege.csv", "Marmara.csv", "Karadeniz.csv", "Akdeniz.csv", "Anadolu.csv", "Trakya.csv"], "Sonuçlar girdi sırasında olmalı"\nassert sure < (0.45 * (4 if __import__("sys").platform == "emscripten" else 1)), f"6 işçiyle 6 indirme ~0.1 s sürmeli, ölçülen {sure:.2f}"\nassert paralel_indir([], 2) == [], "Boş girdi boş liste"\n',
        hints: ['with ThreadPoolExecutor(max_workers=isci) as havuz:', 'havuz.map(indir, tedarikciler) sırayı korur; list() ile topla.'],
        why: 'map, submit+result döngüsünün kısa hâlidir ve sırayı korur. Havuz with bloğundan çıkarken tüm işlerin bitmesini bekler.' },
      { t: 'code', id: 'eszamanlilik-2',
        q: '<p><code>Hesap</code> sınıfı: <code>bakiye</code> özniteliği 0 ile başlasın; <code>yatir(miktar)</code> metodu bakiyeyi artırsın ve bu artış <code>threading.Lock</code> ile korunsun. Ardından <code>stres(hesap, thread_sayisi, tekrar)</code> fonksiyonu <code>ThreadPoolExecutor</code> ile her biri <code>tekrar</code> kez <code>yatir(1)</code> çağıran <code>thread_sayisi</code> iş başlatsın ve son bakiyeyi döndürsün.</p>',
        start: 'import threading\nfrom concurrent.futures import ThreadPoolExecutor\n\nclass Hesap:\n    def __init__(self):\n        self.bakiye = 0\n        self._kilit = threading.Lock()\n\n    def yatir(self, miktar):\n        pass\n\ndef stres(hesap, thread_sayisi, tekrar):\n    pass\n',
        sol: 'import threading\nfrom concurrent.futures import ThreadPoolExecutor\n\nclass Hesap:\n    def __init__(self):\n        self.bakiye = 0\n        self._kilit = threading.Lock()\n\n    def yatir(self, miktar):\n        with self._kilit:\n            yeni = self.bakiye + miktar\n            self.bakiye = yeni\n\ndef stres(hesap, thread_sayisi, tekrar):\n    def is_yap(_):\n        for _ in range(tekrar):\n            hesap.yatir(1)\n    with ThreadPoolExecutor(max_workers=thread_sayisi) as havuz:\n        list(havuz.map(is_yap, range(thread_sayisi)))\n    return hesap.bakiye\n',
        tests: 'import threading\nh = Hesap()\nassert stres(h, 4, 20000) == 80000, "4 thread x 20000 yatırma = 80000 olmalı (Lock ile)"\nassert isinstance(h._kilit, type(threading.Lock())), "_kilit bir Lock olmalı"\nh2 = Hesap()\nh2.yatir(50)\nassert h2.bakiye == 50, "yatir tek çağrıda bakiyeyi artırmalı"\n',
        hints: ['yatir içinde with self._kilit: bloğunda bakiyeyi güncelle.', 'stres: iç fonksiyon tekrar kez yatir(1) çağırsın; havuz.map ile thread_sayisi kez çalıştır.'],
        why: 'Kritik bölge (oku-artır-yaz) kilitle korunursa thread sayısı ne olursa olsun toplam doğru çıkar. Kilidi nesnenin içinde tutmak kapsüllemeyi korur.' },
      { t: 'code', id: 'eszamanlilik-3',
        q: '<p><code>uretici_tuketici(siparisler, isci_sayisi)</code> fonksiyonu: bir <code>queue.Queue</code> oluştursun, <code>isci_sayisi</code> kadar tüketici thread başlatsın; her tüketici kuyruktan sipariş alıp <code>siparis * 2</code> değerini thread-güvenli biçimde bir sonuç listesine eklesin; <code>None</code> gelince dursun. Üretici tüm siparişleri ve ardından her işçiye bir <code>None</code> koysun. Fonksiyon sonuçları <b>artan sıralı</b> liste olarak döndürsün.</p>',
        start: 'import queue, threading\n\ndef uretici_tuketici(siparisler, isci_sayisi):\n    kuyruk = queue.Queue()\n    sonuc = []\n    kilit = threading.Lock()\n    pass\n',
        sol: 'import queue, threading\n\ndef uretici_tuketici(siparisler, isci_sayisi):\n    kuyruk = queue.Queue()\n    sonuc = []\n    kilit = threading.Lock()\n\n    def tuketici():\n        while True:\n            s = kuyruk.get()\n            if s is None:\n                break\n            with kilit:\n                sonuc.append(s * 2)\n\n    isciler = [threading.Thread(target=tuketici) for _ in range(isci_sayisi)]\n    for t in isciler:\n        t.start()\n    for s in siparisler:\n        kuyruk.put(s)\n    for _ in isciler:\n        kuyruk.put(None)\n    for t in isciler:\n        t.join()\n    return sorted(sonuc)\n',
        tests: 'r = uretici_tuketici(list(range(1, 51)), 3)\nassert r == [i * 2 for i in range(1, 51)], "Her sipariş bir kez işlenip 2 ile çarpılmalı"\nassert uretici_tuketici([], 2) == [], "Boş girdi boş sonuç"\nassert uretici_tuketici([7], 4) == [14], "Tek eleman 4 işçiyle de çalışmalı"\n',
        hints: ['Tüketici: while True: s = kuyruk.get(); None ise break.', 'Üretici put\'ları bitince her işçi için bir None koy, sonra t.join() ile bekle.'],
        why: 'Kuyruk üretici ile tüketiciyi ayırır; sentinel her işçiyi temiz kapatır; join tüm iş bitene kadar bekler. Sonuç listesine ekleme kilitle korunur.' },
      { t: 'mc', q: 'Saf Python ile 4 büyük matrisin determinantını hesaplıyorsun ve 4 thread kullandın; süre düşmedi. En doğru açıklama?',
        o: ['Thread sayısı az', 'GIL aynı anda tek thread\'in Python kodu çalıştırmasına izin veriyor', 'ThreadPoolExecutor yalnızca map ile hızlanır', 'Matris boyutu küçük'], a: 1,
        why: 'CPU-yoğun saf Python kodunda GIL thread\'leri sırayla çalıştırır. Çözüm ProcessPoolExecutor ya da numpy gibi GIL\'i bırakan C kütüphaneleridir.' },
      { t: 'mc', q: 'Senkron <code>requests</code> kütüphanesiyle 300 URL\'yi çekmek istiyorsun. En az kod değişikliğiyle hızlanma hangi araçla gelir?',
        o: ['asyncio ile await requests.get', 'ProcessPoolExecutor', 'ThreadPoolExecutor', 'multiprocessing.Pool'], a: 2,
        why: 'requests senkron ve I/O ağırlıklı; thread havuzu beklerken GIL\'i bırakır, kod aynen kalır. asyncio için async bir kütüphane (httpx) gerekir; süreçler bu iş için ağırdır.' },
      { t: 'code', id: 'eszamanlilik-4',
        q: '<p><code>toplu_sorgu(idler, sorgu, isci)</code> fonksiyonu <code>submit</code> ve <code>as_completed</code> kullanarak her id için <code>sorgu(id)</code> çağırsın. <code>sorgu</code> bazı id\'ler için istisna fırlatabilir: hata verenleri atlayıp başarılı sonuçları <code>{id: sonuc}</code> sözlüğü ve hata veren id\'leri <b>sıralı liste</b> olarak döndür: <code>(sonuclar, hatalilar)</code>.</p>',
        start: 'from concurrent.futures import ThreadPoolExecutor, as_completed\n\ndef toplu_sorgu(idler, sorgu, isci):\n    pass\n',
        sol: 'from concurrent.futures import ThreadPoolExecutor, as_completed\n\ndef toplu_sorgu(idler, sorgu, isci):\n    sonuclar, hatalilar = {}, []\n    with ThreadPoolExecutor(max_workers=isci) as havuz:\n        gelecekler = {havuz.submit(sorgu, i): i for i in idler}\n        for f in as_completed(gelecekler):\n            i = gelecekler[f]\n            try:\n                sonuclar[i] = f.result()\n            except Exception:\n                hatalilar.append(i)\n    return sonuclar, sorted(hatalilar)\n',
        tests: 'import time\ndef sorgu(i):\n    time.sleep(0.01)\n    if i % 4 == 0:\n        raise ValueError("servis hatası")\n    return i * 10\ns, h = toplu_sorgu(list(range(1, 11)), sorgu, 4)\nassert h == [4, 8], "4 ve 8 hata vermeli"\nassert s == {1: 10, 2: 20, 3: 30, 5: 50, 6: 60, 7: 70, 9: 90, 10: 100}, "Başarılı sonuçlar id*10"\n',
        hints: ['gelecekler = {havuz.submit(sorgu, i): i for i in idler} ile Future → id eşlemesi tut.', 'as_completed içinde f.result() try/except ile sar; hata veren id\'yi listeye ekle.'],
        why: 'result() işçideki istisnayı ana thread\'de yeniden fırlatır; böylece hatalar tek tek ele alınır ve bir hata tüm partiyi düşürmez.' }
    ],
    faq: [
      { q: 'Thread mi asyncio mu?', a: 'Kütüphanen async destekliyorsa ve bağlantı sayısı çoksa asyncio; senkron kütüphaneyle ya da az sayıda paralel işte thread daha az kod değişikliği ister. İkisi de CPU işini hızlandırmaz.' },
      { q: 'Lock yerine ne kullanabilirim?', a: 'Paylaşılan durumu hiç oluşturmamak en iyisi: her işçi sonucunu döndürsün, ana thread birleştirsin. Gerekiyorsa queue.Queue thread-güvenlidir; sayaç için threading.Lock, okuma-yazma ağırlıklı yapılarda RLock ya da Condition.' },
      { q: 'ProcessPoolExecutor\'da fonksiyonum "can\'t pickle" hatası verdi.', a: 'Süreçlere gönderilen fonksiyon ve veriler pickle\'lanabilir olmalı: fonksiyon modül düzeyinde tanımlı olmalı (lambda ya da iç fonksiyon olmaz), argümanlar basit veri olmalı.' }
    ],
    mistakes: [
      { bad: 'with ThreadPoolExecutor() as havuz:\n    for i in idler:\n        havuz.submit(sorgu, i).result()', good: 'with ThreadPoolExecutor() as havuz:\n    gelecekler = [havuz.submit(sorgu, i) for i in idler]\n    sonuc = [f.result() for f in gelecekler]', why: 'Her submit\'in hemen ardından result beklemek işleri sıraya sokar; önce hepsini gönder, sonra topla.' },
      { bad: 'sayac += 1   # birden çok thread\'den', good: 'with kilit:\n    sayac += 1', why: 'Artırma atomik değildir; kilitsiz güncelleme artışları kaybeder.' },
      { bad: 't = threading.Thread(target=isle)\nt.start()\nprint(sonuc)  # t bitmeden', good: 't = threading.Thread(target=isle)\nt.start()\nt.join()\nprint(sonuc)', why: 'join olmadan ana akış thread\'i beklemez; sonuç henüz hazır olmayabilir.' },
      { bad: 'with ProcessPoolExecutor() as p:\n    p.map(lambda x: x * 2, veri)', good: 'def ikiyle_carp(x):\n    return x * 2\n\nwith ProcessPoolExecutor() as p:\n    p.map(ikiyle_carp, veri)', why: 'Süreçler fonksiyonu pickle ile taşır; lambda pickle\'lanamaz. Modül düzeyinde adlı fonksiyon gerekir.' }
    ]
  },

  /* ========================= 8. performans ========================= */
  { id: 'performans', lv: 'ileri', mod: 'Eşzamanlılık ve Performans', min: 40, needs: ['numpy'],
    title: 'Profil ve optimizasyon',
    sum: 'timeit ve cProfile ile ölçme, Big-O sezgisi, set/dict ile sabit zamanlı arama, string birleştirme, üreteçle bellek, lru_cache ve numpy\'a geçiş.',
    goals: ['timeit ve cProfile ile darboğazı ölçerek bulabilirim', 'Big-O ile algoritmanın ölçeklenmesini tahmin edebilirim', 'Doğru veri yapısıyla (set/dict) aramayı hızlandırabilirim', 'Üreteç ve lru_cache ile bellek ve zaman kazanabilirim', 'Ne zaman numpy\'a geçmem gerektiğini bilirim'],
    body: `<h2>Önce ölç, sonra düzelt</h2>
<p>Ilgaz Bank\'ın gece raporu 40 dakika sürüyor ve ekip "Python yavaş" diyor. Çoğu zaman yavaş olan Python değil, bir listede milyon kez <code>in</code> aramak ya da döngüde string biriktirmektir. Optimizasyonun ilk kuralı: <b>tahmin etme, ölç</b>. İkinci kuralı: en çok zaman geçen yüzde 5\'lik kodu düzelt, gerisine dokunma.</p>

<h2>timeit: küçük parçayı ölç</h2>
<p><code>timeit</code> bir ifadeyi çok kez çalıştırıp toplam süreyi verir; çöp toplayıcıyı kapatır, en küçük gürültüyle ölçer. İki alternatifi karşılaştırmak için idealdir.</p>
<pre class="py">import timeit

musteriler = list(range(50_000))
kume = set(musteriler)
aranan = [49_999, 25_000, -1, 10]

t_liste = timeit.timeit(lambda: [x in musteriler for x in aranan], number=50)
t_kume = timeit.timeit(lambda: [x in kume for x in aranan], number=50)
print(f"liste in: {t_liste:.4f} s   set in: {t_kume:.6f} s")
print(f"set yaklaşık {t_liste / t_kume:.0f} kat hızlı")
</pre>

<h2>cProfile: büyük programda nerede?</h2>
<p>Bütün betikte hangi fonksiyonun süre yediğini <code>cProfile</code> gösterir. Bellek içinde çalıştırıp <code>pstats</code> ile en pahalı birkaç fonksiyonu sıralarsın. <code>tottime</code> fonksiyonun kendi süresi, <code>cumtime</code> çağırdıklarıyla birlikte toplam.</p>
<pre class="py">import cProfile, pstats, io

def musteri_bul(musteri_id, liste):
    return musteri_id in liste                  # O(n)

def rapor(n):
    liste = list(range(n))
    bulunan = 0
    for i in range(0, n, 7):
        if musteri_bul(i, liste):
            bulunan += 1
    return bulunan

pr = cProfile.Profile()
pr.enable()
rapor(20_000)
pr.disable()

cikti = io.StringIO()
pstats.Stats(pr, stream=cikti).sort_stats("cumulative").print_stats(4)
satirlar = [s for s in cikti.getvalue().splitlines() if "musteri_bul" in s or "rapor" in s]
print("\\n".join(satirlar))
</pre>
<p>Çıktıda <code>musteri_bul</code> binlerce kez çağrılıyor ve toplam sürenin neredeyse tamamını alıyor. Düzeltme fonksiyonu hızlandırmak değil, <b>veri yapısını değiştirmek</b>: listeyi bir kez set\'e çevir.</p>

<h2>Big-O sezgisi</h2>
<p>Big-O, girdi n büyüyünce sürenin nasıl büyüdüğünü söyler. Sabitleri değil eğilimi önemser; 10 bin satırda fark etmeyen şey 10 milyonda saatlere dönüşür.</p>
<div class="tbl-wrap"><table><tr><th>İşlem</th><th>Karmaşıklık</th><th>Örnek</th></tr>
<tr><td><code>x in set</code>, <code>d[k]</code>, <code>lst[i]</code>, <code>lst.append</code></td><td>O(1)</td><td>Hash ile sabit zaman</td></tr>
<tr><td><code>x in list</code>, <code>lst.index</code>, <code>min/max/sum</code></td><td>O(n)</td><td>Baştan sona tarar</td></tr>
<tr><td><code>lst.insert(0, x)</code>, <code>lst.pop(0)</code></td><td>O(n)</td><td>Her elemanı kaydırır (deque kullan)</td></tr>
<tr><td><code>sorted</code>, <code>lst.sort</code></td><td>O(n log n)</td><td>Timsort</td></tr>
<tr><td>İç içe iki döngü (her sipariş × her müşteri)</td><td>O(n·m)</td><td>Sözlükle O(n+m)\'e iner</td></tr>
<tr><td>Sıralı listede <code>bisect</code></td><td>O(log n)</td><td>İkili arama</td></tr>
</table></div>
<pre class="py">import timeit

siparisler = [(i, i % 1000) for i in range(20_000)]          # (siparis, musteri_id)
musteriler = [(m, f"Müşteri{m}") for m in range(1000)]

def birlestir_yavas():                     # O(n·m)
    return [(s, ad) for s, m in siparisler for mid, ad in musteriler if mid == m]

def birlestir_hizli():                     # O(n+m)
    ad = dict(musteriler)
    return [(s, ad[m]) for s, m in siparisler]

assert birlestir_yavas()[:3] == birlestir_hizli()[:3]
print(f"yavaş: {timeit.timeit(birlestir_yavas, number=1):.3f} s")
print(f"hızlı: {timeit.timeit(birlestir_hizli, number=1):.4f} s")
</pre>

<h2>Sık kazanımlar</h2>
<h3>String birleştirme</h3>
<p>Döngüde <code>s += parça</code> her seferinde yeni string üretir. Parçaları listede biriktirip <code>"".join(...)</code> ya da f-string kullan.</p>
<h3>Üreteçle bellek</h3>
<p><code>[f(x) for x in range(10**7)]</code> tüm listeyi belleğe koyar; <code>(f(x) for x in ...)</code> ya da <code>yield</code> tek seferde bir eleman üretir. <code>sum</code>, <code>max</code>, <code>any</code> gibi tüketiciler üreteçle çalışır. Büyük dosyayı satır satır okumak da aynı ilkedir.</p>
<h3>lru_cache</h3>
<p>Aynı girdiyle tekrar tekrar çağrılan saf (yan etkisiz) fonksiyonu <code>functools.lru_cache</code> ile ezberle. Özyinelemeli hesaplar ve pahalı sorgular için çarpıcıdır.</p>
<pre class="py">import timeit, sys
from functools import lru_cache

def birlestir_arti(n):
    s = ""
    for i in range(n):
        s += f"{i},"
    return s

def birlestir_join(n):
    return ",".join(str(i) for i in range(n)) + ","

assert birlestir_arti(100) == birlestir_join(100)
print(f"+=: {timeit.timeit(lambda: birlestir_arti(20_000), number=5):.3f} s  "
      f"join: {timeit.timeit(lambda: birlestir_join(20_000), number=5):.3f} s")

liste = [x * x for x in range(100_000)]
uretec = (x * x for x in range(100_000))
print("liste:", sys.getsizeof(liste), "bayt | üreteç:", sys.getsizeof(uretec), "bayt")

@lru_cache(maxsize=None)
def taksit_katsayi(ay: int) -&gt; float:
    return 1.0 if ay == 0 else taksit_katsayi(ay - 1) * 1.02

t0 = timeit.default_timer()
print(round(taksit_katsayi(400), 4), f"{timeit.default_timer() - t0:.5f} s")
print(taksit_katsayi.cache_info())
</pre>

<h2>numpy\'a geçiş</h2>
<p>Sayısal bir döngüyü ne kadar iyileştirsen de yorumlayıcı maliyeti kalır. Veri tek tip sayı ve işlem eleman eleman ise numpy\'a geç: döngü C\'de döner, bellek yan yana olur. Kural: "for ile milyon sayı" gördüğünde numpy/pandas düşün.</p>
<pre class="py">import timeit, numpy as np

tutarlar = [float(i % 500) for i in range(300_000)]
dizi = np.array(tutarlar)

def kdv_python():
    return sum(t * 1.2 for t in tutarlar if t &gt; 100)

def kdv_numpy():
    return float((dizi[dizi &gt; 100] * 1.2).sum())

assert abs(kdv_python() - kdv_numpy()) &lt; 1e-3
print(f"python: {timeit.timeit(kdv_python, number=3):.3f} s  numpy: {timeit.timeit(kdv_numpy, number=3):.4f} s")
</pre>
<div class="warn"><b>Erken optimizasyon</b>Okunur kodu "belki hızlanır" diye bozma. Önce doğru çalışan kod, sonra ölçüm, sonra yalnızca ölçümün gösterdiği yer. Çoğu rapor için sorun bir tane O(n·m) döngüdür.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Optimizasyon sırası</h3>
<div class="steps-list"><ol>
<li>Ölç: cProfile ile en pahalı fonksiyonları bul, timeit ile alternatifi doğrula.</li>
<li>Algoritma ve veri yapısı: O(n²)\'yi O(n)\'e indir; list → set/dict, pop(0) → deque, sıralı arama → bisect.</li>
<li>Python düzeyi: üreteç, join, lru_cache, yerel değişken, gereksiz kopyadan kaçınma.</li>
<li>Kütüphaneye devret: numpy/pandas, sqlite/veritabanı sorgusu, yerleşik fonksiyonlar (sum, sorted) C\'de çalışır.</li>
<li>Paralellik: I/O için thread/asyncio, CPU için süreçler. En son adım, çünkü karmaşıklık getirir.</li>
</ol></div>
<h3>Bellek de ölçülür</h3>
<p><code>tracemalloc</code> hangi satırın ne kadar bellek ayırdığını gösterir; <code>sys.getsizeof</code> tek nesnenin boyutudur (içindekileri saymaz). Büyük veri için pandas\'ta küçük dtype ve category, saf Python\'da <code>__slots__</code> ve üreteç.</p>
<h3>Ölçüm hataları</h3>
<p>İlk çalıştırma önbellek yüzünden yavaştır; <code>number</code> ve <code>repeat</code> ile birkaç kez ölç, en küçüğü al. Dizüstünde pil modu, arka plan işleri ölçümü oynatır; karşılaştırmayı aynı oturumda ve arka arkaya yap.</p>
</section>`,
    ex: [
      { t: 'code', id: 'performans-1',
        q: '<p><code>kara_listede(islemler, kara_liste)</code> fonksiyonu, işlem listesindeki <code>(islem_id, musteri_id)</code> çiftlerinden müşterisi kara listede olanların <code>islem_id</code>\'lerini döndürsün. <code>kara_liste</code> büyük bir liste olarak gelir; aramayı O(1) yapmak için önce <code>set</code>\'e çevir. Test, 200 bin işlemle kısa sürede bitmesini bekler.</p>',
        start: 'def kara_listede(islemler, kara_liste):\n    pass\n',
        sol: 'def kara_listede(islemler, kara_liste):\n    kume = set(kara_liste)\n    return [iid for iid, mid in islemler if mid in kume]\n',
        tests: 'import time\nislemler = [(i, i % 5000) for i in range(200_000)]\nkara = list(range(0, 5000, 100))\nt0 = time.perf_counter()\nr = kara_listede(islemler, kara)\nsure = time.perf_counter() - t0\nassert len(r) == 200_000 // 100, "Her 100 müşteriden biri kara listede: 2000 işlem"\nassert r[:3] == [0, 100, 200], "İlk işlemler 0, 100, 200 olmalı"\nassert sure < (1.0 * (4 if __import__("sys").platform == "emscripten" else 1)), f"Çok yavaş ({sure:.2f} s): set kullan"\nassert kara_listede([(1, 9)], []) == [], "Boş kara liste boş sonuç"\n',
        hints: ['kume = set(kara_liste) bir kez; sonra mid in kume.', 'Liste comprehension ile islem_id topla.'],
        why: 'Listede in O(n), set\'te O(1). 200 bin işlem × 50 elemanlı liste bile yavaştır; set ile dönüşüm maliyeti bir kez ödenir.' },
      { t: 'code', id: 'performans-2',
        q: '<p><code>rapor_satiri(kayitlar)</code> fonksiyonu <code>(ad, tutar)</code> demetlerinden <code>"ad:tutar"</code> parçalarını <code>;</code> ile birleştirip tek string döndürsün. Döngüde <code>+=</code> kullanma; <code>join</code> ile yaz. <code>sayi_karesi_toplami(n)</code> fonksiyonu ise 0..n-1 karelerinin toplamını <b>liste oluşturmadan</b> (üreteç ifadesiyle) hesaplasın.</p>',
        start: 'def rapor_satiri(kayitlar):\n    pass\n\ndef sayi_karesi_toplami(n):\n    pass\n',
        sol: 'def rapor_satiri(kayitlar):\n    return ";".join(f"{ad}:{tutar}" for ad, tutar in kayitlar)\n\ndef sayi_karesi_toplami(n):\n    return sum(i * i for i in range(n))\n',
        tests: 'import time\nassert rapor_satiri([("Ayşe", 120), ("Ali", 45.5)]) == "Ayşe:120;Ali:45.5", "Biçim ad:tutar;ad:tutar"\nassert rapor_satiri([]) == "", "Boş girdi boş string"\nassert sayi_karesi_toplami(4) == 14, "0+1+4+9 = 14"\nt0 = time.perf_counter()\nassert sayi_karesi_toplami(1_000_000) == 333332833333500000, "n=1e6 sonucu yanlış"\nassert time.perf_counter() - t0 < (2.0 * (4 if __import__("sys").platform == "emscripten" else 1)), "Çok yavaş"\nsrc = __source__.split("def sayi_karesi_toplami")[-1]\nassert "[" not in src.split("return")[-1], "Liste yerine üreteç ifadesi kullan (köşeli parantez olmasın)"\n',
        hints: ['";".join(f"{ad}:{tutar}" for ad, tutar in kayitlar).', 'sum(i * i for i in range(n)) — köşeli parantez yok, üreteç.'],
        why: 'join parçaları tek seferde birleştirir; üreteç ifadesi ara liste oluşturmadan sum\'a eleman akıtır, bellek sabit kalır.' },
      { t: 'code', id: 'performans-3',
        q: '<p><code>kredi_katsayi(ay)</code> fonksiyonu özyinelemeli tanımlansın: <code>ay == 0</code> için 1.0, aksi hâlde <code>kredi_katsayi(ay - 1) * 1.015</code>. Fonksiyonu <code>functools.lru_cache</code> ile süsle. Ayrıca <code>cagri_sayisi</code> adlı modül düzeyi sayacı her gerçek (önbelleksiz) çalışmada artır; testler önbelleğin çalıştığını bu sayaçla kontrol eder.</p>',
        start: 'from functools import lru_cache\n\ncagri_sayisi = 0\n\ndef kredi_katsayi(ay):\n    pass\n',
        sol: 'from functools import lru_cache\n\ncagri_sayisi = 0\n\n@lru_cache(maxsize=None)\ndef kredi_katsayi(ay):\n    global cagri_sayisi\n    cagri_sayisi += 1\n    if ay == 0:\n        return 1.0\n    return kredi_katsayi(ay - 1) * 1.015\n',
        tests: 'assert abs(kredi_katsayi(12) - 1.015 ** 12) < 1e-9, "12 ay için 1.015^12"\nn1 = cagri_sayisi\nassert n1 == 13, f"İlk hesapta 0..12 için 13 gerçek çağrı olmalı, oldu {n1}"\nkredi_katsayi(12)\nkredi_katsayi(5)\nassert cagri_sayisi == 13, "Önbellekten dönmeli, sayaç artmamalı"\nkredi_katsayi(15)\nassert cagri_sayisi == 16, "13,14,15 için 3 yeni çağrı"\nassert hasattr(kredi_katsayi, "cache_info"), "lru_cache ile süslenmeli"\n',
        hints: ['@lru_cache(maxsize=None) dekoratörünü fonksiyonun üstüne koy.', 'global cagri_sayisi; her gövde çalışmasında +1.'],
        why: 'lru_cache aynı argümanla ikinci çağrıda gövdeyi hiç çalıştırmaz; özyinelemede ara sonuçlar da ezberlendiği için 15 istenince yalnızca 13-15 hesaplanır.' },
      { t: 'mc', q: 'Bir fonksiyon 50 bin siparişin her biri için 2 bin müşterilik listede <code>in</code> ile arama yapıyor. Bu kodun karmaşıklığı ve en etkili düzeltme hangisi?',
        o: ['O(n log n); listeyi sırala', 'O(n·m); müşteri listesini set/dict yap', 'O(n); thread ekle', 'O(1); zaten hızlı'], a: 1,
        why: 'İç içe tarama O(n·m)\'dir. Set/dict ile arama O(1) olur ve toplam O(n+m)\'e iner. Thread CPU işinde GIL yüzünden yardımcı olmaz.' },
      { t: 'mc', q: 'cProfile çıktısında bir fonksiyonun <code>tottime</code> değeri küçük ama <code>cumtime</code> değeri çok büyük. Bu ne anlama gelir?',
        o: ['Fonksiyonun kendisi yavaş', 'Zaman çağırdığı alt fonksiyonlarda geçiyor', 'Profil hatalı', 'Fonksiyon hiç çağrılmamış'], a: 1,
        why: 'tottime fonksiyonun kendi gövdesinde geçen süre, cumtime alt çağrılar dahil toplamdır. Fark büyükse darboğaz çağırdığı fonksiyonlardadır.' },
      { t: 'code', id: 'performans-4',
        q: '<p><code>hizli_kdv(tutarlar, esik)</code> fonksiyonu numpy kullanarak tutar listesinden <code>esik</code>\'ten büyük olanların 1.2 ile çarpılmış toplamını <code>float</code> olarak döndürsün (döngü yok). Test 300 bin elemanla hızı kontrol eder.</p>',
        start: 'import numpy as np\n\ndef hizli_kdv(tutarlar, esik):\n    pass\n',
        sol: 'import numpy as np\n\ndef hizli_kdv(tutarlar, esik):\n    d = np.asarray(tutarlar, dtype=float)\n    return float((d[d > esik] * 1.2).sum())\n',
        tests: 'import time\nassert abs(hizli_kdv([50, 150, 300], 100) - 540.0) < 1e-9, "(150+300)*1.2 = 540"\nassert hizli_kdv([10, 20], 100) == 0.0, "Eşik üstü yoksa 0.0"\nveri = [float(i % 500) for i in range(300_000)]\nbeklenen = sum(t * 1.2 for t in veri if t > 100)\nt0 = time.perf_counter()\nr = hizli_kdv(veri, 100)\nassert abs(r - beklenen) < 1e-3, "Toplam saf Python ile aynı olmalı"\nassert isinstance(r, float), "float dönmeli"\n',
        hints: ['np.asarray(tutarlar, dtype=float) sonra maske d > esik.', 'float((d[maske] * 1.2).sum()).'],
        why: 'Maske + vektör çarpımı + sum tek C döngüsünde biter. Liste → dizi dönüşümü bir maliyettir; veri zaten numpy/pandas ise o da yoktur.' }
    ],
    faq: [
      { q: 'time.time ile timeit arasındaki fark ne?', a: 'time.time duvar saatidir, tek ölçüm gürültülüdür. timeit perf_counter kullanır, çöp toplayıcıyı kapatır, ifadeyi çok kez tekrarlar; mikro karşılaştırmada güvenilirdir.' },
      { q: 'lru_cache her fonksiyona konabilir mi?', a: 'Yalnızca saf fonksiyonlara: aynı girdi aynı çıktı, yan etki yok. Argümanlar hashlenebilir olmalı (liste olmaz, demet olur). Değişen dış veriye bağlı fonksiyonda eski sonuç döner.' },
      { q: 'Kodum hâlâ yavaş, Python\'ı mı bırakmalıyım?', a: 'Önce profil ve veri yapısı, sonra numpy/pandas ya da veritabanı sorgusu. Gerçekten CPU-yoğun kalan dar bir çekirdek varsa Cython, numba ya da Rust eklentisi; tüm projeyi taşımak nadiren gerekir.' }
    ],
    mistakes: [
      { bad: 'for m in musteriler:\n    if m in kara_liste_listesi: ...', good: 'kara = set(kara_liste_listesi)\nfor m in musteriler:\n    if m in kara: ...', why: 'Listede arama her seferinde taramadır; set hash ile sabit zamanda bulur.' },
      { bad: 'metin = ""\nfor p in parcalar:\n    metin += p', good: 'metin = "".join(parcalar)', why: 'Her += yeni string kopyalar; join tek seferde ayırır.' },
      { bad: 'kuyruk = []\n...\nkuyruk.pop(0)', good: 'from collections import deque\nkuyruk = deque()\n...\nkuyruk.popleft()', why: 'list.pop(0) tüm elemanları kaydırır (O(n)); deque iki uçta O(1) çalışır.' },
      { bad: 'toplam = sum([x * x for x in range(10**7)])', good: 'toplam = sum(x * x for x in range(10**7))', why: 'Köşeli parantez önce 10 milyonluk liste kurar; üreteç ifadesi elemanları akıtır, bellek sabit kalır.' }
    ]
  },

  /* ========================= 9. bellek-ic-yapi ========================= */
  { id: 'bellek-ic-yapi', lv: 'ileri', mod: 'Eşzamanlılık ve Performans', min: 40,
    title: 'Python\'ın iç yapısı: nesne, referans, bellek',
    sum: 'Her şey nesne; id/is ve ==, referans sayımı ve gc, değişebilirlik ve copy/deepcopy, interning, __slots__, sys.getsizeof ve dis ile bytecode.',
    goals: ['Değişkenin nesneye referans olduğunu id/is ile gösterebilirim', 'Referans sayımı ve çöp toplayıcının ne zaman devreye girdiğini açıklayabilirim', 'Sığ ve derin kopya farkını bilip doğru olanı seçebilirim', 'Interning ve is tuzağını tanırım', '__slots__ ve getsizeof ile bellek kullanımını küçültüp ölçebilirim'],
    body: `<h2>Neden iç yapı?</h2>
<p>Ilgaz Bank\'ta bir geliştirici müşteri listesini "kopyalayıp" değiştirdi; asıl liste de değişti ve yanlış hesaplara SMS gitti. Başka biri <code>if durum is "aktif"</code> yazdı, bazen çalıştı bazen çalışmadı. Üçüncüsü 10 milyon küçük nesneyle belleği doldurdu. Üçü de Python\'ın nesne modelini bilmemekten kaynaklanır. Bu ders, günlük hatalara yol açan iç mekanizmaları gösterir.</p>

<h2>Her şey nesne, değişken bir etiket</h2>
<p>Python\'da <code>a = [1, 2]</code> demek, bellekte bir liste nesnesi yaratıp <code>a</code> adını ona bağlamaktır. <code>b = a</code> ikinci bir ad bağlar, yeni nesne yaratmaz. <code>id()</code> nesnenin kimliğini (CPython\'da adresi) verir; <code>is</code> "aynı nesne mi", <code>==</code> "aynı değer mi" sorar.</p>
<pre class="py">a = [1, 2, 3]
b = a                 # aynı nesneye ikinci etiket
c = [1, 2, 3]         # ayrı nesne, aynı değer
print(a is b, a is c, a == c)
print(id(a) == id(b), id(a) == id(c))

b.append(4)
print(a)              # a da değişti; çünkü aynı nesne

def ekle(lst):
    lst.append(99)    # çağıranın listesi değişir
ekle(a)
print(a)
</pre>
<div class="note"><b>Çağrı modeli</b>Python "nesne referansıyla çağırır": fonksiyona nesnenin adresi gider. Değişebilir (mutable) nesneyi içeride değiştirirsen dışarısı etkilenir; değişmez (immutable) nesneye yeniden atama yaparsan yalnızca yerel ad değişir.</div>

<h2>Değişebilirlik ve kopya</h2>
<p>int, float, str, tuple, frozenset değişmezdir; list, dict, set ve kendi sınıfların değişebilir. Bağımsız bir liste istiyorsan kopyala: <code>lst.copy()</code>, <code>lst[:]</code>, <code>list(lst)</code> <b>sığ kopya</b> (shallow) verir: dış kap yeni, içindeki nesneler aynı. İç içe yapıda <code>copy.deepcopy</code> gerekir.</p>
<pre class="py">import copy

musteri = {"ad": "Ayşe", "hesaplar": [1500.0, 320.0]}
sig = musteri.copy()
derin = copy.deepcopy(musteri)

sig["ad"] = "Ayşe K."            # dış sözlük bağımsız
sig["hesaplar"].append(50.0)     # iç liste paylaşılıyor!
print(musteri["ad"], musteri["hesaplar"])

derin["hesaplar"].append(999.0)
print(musteri["hesaplar"], derin["hesaplar"])

print(musteri["hesaplar"] is sig["hesaplar"], musteri["hesaplar"] is derin["hesaplar"])
</pre>
<div class="warn"><b>Varsayılan argüman tuzağı</b><code>def ekle(x, liste=[])</code> yazarsan liste bir kez yaratılır ve tüm çağrılar arasında paylaşılır. <code>liste=None</code> ver, içeride <code>if liste is None: liste = []</code>.</div>

<h2>Referans sayımı ve çöp toplayıcı</h2>
<p>CPython her nesnede bir sayaç tutar: kaç ad/kap ona işaret ediyor. Sayı sıfıra inince nesne anında silinir. <code>sys.getrefcount</code> bunu gösterir (çağrının kendisi +1 ekler). Sayım, birbirini gösteren <b>döngüsel</b> referanslarda yetmez (a → b → a); bunları periyodik çalışan <code>gc</code> modülü bulup temizler.</p>
<pre class="py">import sys, gc

veri = [1, 2, 3]
print(sys.getrefcount(veri))          # 2: veri + getrefcount argümanı
alias = veri
print(sys.getrefcount(veri))          # 3
del alias
print(sys.getrefcount(veri))          # 2

class Dugum:
    def __init__(self, ad):
        self.ad = ad
        self.es = None

a, b = Dugum("a"), Dugum("b")
a.es, b.es = b, a                     # döngü
del a, b                              # sayaç sıfıra inmez
print("gc topladı:", gc.collect() &gt;= 2)
print("gc eşikleri:", gc.get_threshold())
</pre>
<div class="tip"><b>Pratikte</b>gc\'yi elle çağırman nadiren gerekir. Sızıntı şüphesinde <code>tracemalloc</code> ile anlık görüntü al, büyüyen satırı bul; çoğu zaman sorun küresel bir liste ya da önbelleğin sınırsız büyümesidir, gc değil.</div>

<h2>Interning: is tuzağı</h2>
<p>CPython küçük tam sayıları (-5..256) ve bazı kısa string\'leri bir kez yaratıp paylaşır (interning). Bu yüzden <code>a = 100; b = 100; a is b</code> True çıkar ama 1000 için False olabilir. Çıkarım: değer karşılaştırması <b>her zaman</b> <code>==</code>; <code>is</code> yalnızca <code>None</code>, <code>True</code>, <code>False</code> ve "aynı nesne mi" sorusu için.</p>
<pre class="py">a, b = 100, 100
c, d = 10**5, 10**5
print(a is b, c is d, c == d)          # interning küçük sayıda

s1 = "aktif"
s2 = "".join(["ak", "tif"])
print(s1 == s2, s1 is s2)              # değer eşit, kimlik farklı olabilir

import sys
s3 = sys.intern(s2)
print(s3 is sys.intern("aktif"))       # intern ile zorla paylaştırma
</pre>

<h2>Bellek boyutu ve __slots__</h2>
<p><code>sys.getsizeof(x)</code> nesnenin kendi boyutunu verir (içindekileri saymaz). Normal bir sınıf örneği öznitelikleri bir <code>__dict__</code> sözlüğünde tutar; milyonlarca küçük nesnede bu sözlükler belleği yutar. <code>__slots__</code> tanımlarsan öznitelikler sabit yuvalarda saklanır, sözlük oluşmaz, bellek belirgin düşer ve erişim biraz hızlanır. Bedeli: tanımlanmamış öznitelik eklenemez.</p>
<pre class="py">import sys

class Islem:
    def __init__(self, hesap, tutar):
        self.hesap = hesap
        self.tutar = tutar

class IslemSlots:
    __slots__ = ("hesap", "tutar")
    def __init__(self, hesap, tutar):
        self.hesap = hesap
        self.tutar = tutar

n = Islem(1, 10.0)
s = IslemSlots(1, 10.0)
print("normal:", sys.getsizeof(n) + sys.getsizeof(n.__dict__), "bayt")
print("slots :", sys.getsizeof(s), "bayt")
print(hasattr(s, "__dict__"))
try:
    s.aciklama = "x"
except AttributeError as e:
    print("slots engelledi:", e)
print(sys.getsizeof([]), sys.getsizeof([1, 2, 3]), sys.getsizeof((1, 2, 3)), sys.getsizeof("ab"))
</pre>
<div class="tbl-wrap"><table><tr><th>Kavram</th><th>Araç</th><th>Günlük etkisi</th></tr>
<tr><td>Kimlik vs değer</td><td><code>is</code>, <code>==</code>, <code>id</code></td><td>is yalnızca None/singleton için</td></tr>
<tr><td>Kopya</td><td><code>copy()</code>, <code>deepcopy</code></td><td>İç içe yapıda deepcopy</td></tr>
<tr><td>Ömür</td><td>refcount, <code>gc</code></td><td>Döngüsel referans, sızıntı</td></tr>
<tr><td>Bellek</td><td><code>getsizeof</code>, <code>__slots__</code>, <code>tracemalloc</code></td><td>Çok sayıda küçük nesne</td></tr>
<tr><td>Çalışma</td><td><code>dis</code></td><td>Neden bazı ifadeler hızlı</td></tr>
</table></div>

<h2>Bytecode: dis ile kısa bakış</h2>
<p>Python kaynak kodu önce <b>bytecode</b>\'a derlenir, sonra sanal makine bu komutları yorumlar. <code>dis</code> modülü bu komutları gösterir; "neden yerel değişken küreselden hızlı?" gibi soruların cevabı buradadır (LOAD_FAST vs LOAD_GLOBAL).</p>
<pre class="py">import dis

def kdv(tutar):
    return tutar * 1.2

komutlar = [i.opname for i in dis.get_instructions(kdv)]
print(komutlar)
print("sabit katlama:", [i.argval for i in dis.get_instructions(lambda: 60 * 60 * 24) if i.opname == "RETURN_CONST" or i.opname == "LOAD_CONST"])
</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Değişmezliği tasarımda kullan</h3>
<p>Fonksiyona verilen listeyi değiştirmeyen, yeni liste döndüren "saf" fonksiyonlar paylaşım hatalarını baştan önler. <code>@dataclass(frozen=True)</code>, <code>tuple</code>, <code>frozenset</code> ve <code>MappingProxyType</code> değişmez arayüz sağlar; eşzamanlı kodda kilit ihtiyacını azaltır.</p>
<h3>Zayıf referans</h3>
<p>Önbellek tutarken nesnelerin ömrünü uzatmak istemezsin; <code>weakref</code> sayaç artırmadan referans tutar, nesne başka yerde silinince önbellek girdisi de düşer (<code>WeakValueDictionary</code>).</p>
<h3>Bellek ayırıcı</h3>
<p>CPython küçük nesneler için kendi havuz ayırıcısını (pymalloc) kullanır; serbest bırakılan bellek işletim sistemine hemen dönmeyebilir. Uzun süreli süreçlerde "bellek düşmüyor" gözlemi çoğu zaman sızıntı değil bu havuzlamadır. Gerçek sızıntıyı <code>tracemalloc</code> ile iki anlık görüntü arasındaki farktan bul.</p>
</section>`,
    ex: [
      { t: 'code', id: 'bellek-ic-yapi-1',
        q: '<p><code>guvenli_kopya(musteri)</code> fonksiyonu, iç içe listeler/sözlükler içerebilen <code>musteri</code> sözlüğünün <b>tamamen bağımsız</b> bir kopyasını döndürsün; kopyada yapılan hiçbir değişiklik orijinali etkilememeli. Ayrıca <code>ayni_nesne(a, b)</code> fonksiyonu iki değerin aynı nesne olup olmadığını (kimlik) döndürsün.</p>',
        start: 'import copy\n\ndef guvenli_kopya(musteri):\n    pass\n\ndef ayni_nesne(a, b):\n    pass\n',
        sol: 'import copy\n\ndef guvenli_kopya(musteri):\n    return copy.deepcopy(musteri)\n\ndef ayni_nesne(a, b):\n    return a is b\n',
        tests: 'm = {"ad": "Ayşe", "hesaplar": [1500.0, 320.0], "adres": {"il": "Ankara"}}\nk = guvenli_kopya(m)\nk["hesaplar"].append(50.0)\nk["adres"]["il"] = "İzmir"\nk["ad"] = "X"\nassert m == {"ad": "Ayşe", "hesaplar": [1500.0, 320.0], "adres": {"il": "Ankara"}}, "Orijinal değişmemeli (deepcopy)"\nassert k["hesaplar"] == [1500.0, 320.0, 50.0], "Kopya değişmeli"\nl = [1]\nassert ayni_nesne(l, l) is True and ayni_nesne(l, [1]) is False, "ayni_nesne kimlik (is) ile karşılaştırmalı"\nassert ayni_nesne(None, None) is True, "None tek nesnedir"\n',
        hints: ['copy.deepcopy iç içe tüm yapıyı kopyalar; dict.copy() yalnızca dış katmanı.', 'Kimlik için is kullan, == değil.'],
        why: 'Sığ kopya iç listeyi paylaşır; deepcopy her seviyeyi yeniden yaratır. is nesne kimliğini karşılaştırır, == değeri.' },
      { t: 'code', id: 'bellek-ic-yapi-2',
        q: '<p><code>siparis_ekle(urun, sepet=None)</code> fonksiyonunu yaz: <code>sepet</code> verilmezse <b>her çağrıda yeni</b> bir liste oluştursun, ürünü ekleyip listeyi döndürsün. Varsayılan argüman olarak <code>[]</code> kullanma; testler iki ayrı çağrının birbirini etkilemediğini kontrol eder.</p>',
        start: 'def siparis_ekle(urun, sepet=None):\n    pass\n',
        sol: 'def siparis_ekle(urun, sepet=None):\n    if sepet is None:\n        sepet = []\n    sepet.append(urun)\n    return sepet\n',
        tests: 'a = siparis_ekle("kahve")\nb = siparis_ekle("çay")\nassert a == ["kahve"] and b == ["çay"], "Her çağrı yeni liste almalı"\nassert a is not b, "İki çağrının listesi aynı nesne olmamalı"\nc = siparis_ekle("un", a)\nassert c is a and a == ["kahve", "un"], "Verilen sepet yerinde güncellenmeli"\nassert siparis_ekle.__defaults__ == (None,), "Varsayılan None olmalı, [] değil"\n',
        hints: ['if sepet is None: sepet = []', 'Varsayılan değerler fonksiyon tanımlanırken bir kez yaratılır; değişebilir nesne paylaşılır.'],
        why: 'None nöbetçi (sentinel) kalıbı, değişebilir varsayılan argümanın çağrılar arasında paylaşılmasını önler.' },
      { t: 'code', id: 'bellek-ic-yapi-3',
        q: '<p><code>Islem</code> sınıfını <code>__slots__ = ("hesap", "tutar", "tarih")</code> ile tanımla; <code>__init__(hesap, tutar, tarih)</code> üç özniteliği atasın. <code>bellek_karsilastir(n)</code> fonksiyonu, <code>__slots__</code>\'suz eşdeğer <code>IslemDict</code> sınıfı (verilmiştir) ile <code>Islem</code>\'in birer örneğinin <code>sys.getsizeof</code> ile ölçülen boyutunu (IslemDict için <code>__dict__</code> boyutunu da ekleyerek) <code>(dict_boyut, slots_boyut)</code> olarak döndürsün.</p>',
        start: 'import sys\n\nclass IslemDict:\n    def __init__(self, hesap, tutar, tarih):\n        self.hesap = hesap\n        self.tutar = tutar\n        self.tarih = tarih\n\nclass Islem:\n    pass\n\ndef bellek_karsilastir(n):\n    pass\n',
        sol: 'import sys\n\nclass IslemDict:\n    def __init__(self, hesap, tutar, tarih):\n        self.hesap = hesap\n        self.tutar = tutar\n        self.tarih = tarih\n\nclass Islem:\n    __slots__ = ("hesap", "tutar", "tarih")\n\n    def __init__(self, hesap, tutar, tarih):\n        self.hesap = hesap\n        self.tutar = tutar\n        self.tarih = tarih\n\ndef bellek_karsilastir(n):\n    d = IslemDict(1, 10.0, "2024-01-01")\n    s = Islem(1, 10.0, "2024-01-01")\n    return sys.getsizeof(d) + sys.getsizeof(d.__dict__), sys.getsizeof(s)\n',
        tests: 'i = Islem(7, 25.5, "2024-03-01")\nassert (i.hesap, i.tutar, i.tarih) == (7, 25.5, "2024-03-01"), "Öznitelikler atanmalı"\nassert not hasattr(i, "__dict__"), "__slots__ tanımlı sınıfta __dict__ olmamalı"\ntry:\n    i.aciklama = "x"\n    raise AssertionError("Tanımsız öznitelik eklenememeli")\nexcept AttributeError:\n    pass\nd, s = bellek_karsilastir(1)\nassert isinstance(d, int) and isinstance(s, int), "Boyutlar tam sayı olmalı"\nassert s < d, f"__slots__ örneği daha küçük olmalı ({s} < {d})"\n',
        hints: ['Sınıf gövdesinin başına __slots__ = ("hesap", "tutar", "tarih") yaz.', 'sys.getsizeof(d) + sys.getsizeof(d.__dict__) ile dict\'li örneğin gerçek maliyetini ölç.'],
        why: '__slots__ örnek başına sözlüğü kaldırır; öznitelikler sabit yuvalarda tutulur. Milyonlarca kayıtta fark yüzlerce MB olabilir.' },
      { t: 'mc', q: '<code>a = 1000; b = 1000; print(a is b)</code> ifadesi için en doğru açıklama hangisi?',
        o: ['Her zaman True; sayılar değişmezdir', 'Sonuç uygulama ayrıntısına bağlıdır; değer için == kullanılmalı', 'Her zaman False', 'SyntaxError'], a: 1,
        why: 'CPython yalnızca -5..256 arasını önceden paylaştırır; 1000 için aynı satırda True, ayrı satırlarda False çıkabilir. Değer karşılaştırması == iledir, is yalnızca None gibi tekil nesneler için.' },
      { t: 'mc', q: 'İki nesne birbirine referans veriyor (a.es = b, b.es = a) ve dış referanslar silindi. Bellek nasıl geri alınır?',
        o: ['Referans sayımı anında siler', 'Döngüsel çöp toplayıcı (gc) bulup temizler', 'Program bitene kadar asla', 'del çağrısı zorunludur'], a: 1,
        why: 'Sayaçlar birbirleri yüzünden sıfıra inmez; CPython\'ın nesil tabanlı gc\'si döngüleri periyodik olarak tespit edip serbest bırakır.' },
      { t: 'code', id: 'bellek-ic-yapi-4',
        q: '<p><code>referans_sayisi(nesne)</code> fonksiyonu <code>sys.getrefcount</code> ile ölçülen değerden fonksiyon çağrısının eklediği 1\'i düşerek "gerçek" sayıyı döndürsün. <code>ayni_deger_farkli_nesne(x)</code> fonksiyonu ise <code>x</code> listesinin <b>değerce eşit ama kimliği farklı</b> bir kopyasını döndürsün (sığ kopya yeterli).</p>',
        start: 'import sys\n\ndef referans_sayisi(nesne):\n    pass\n\ndef ayni_deger_farkli_nesne(x):\n    pass\n',
        sol: 'import sys\n\ndef referans_sayisi(nesne):\n    return sys.getrefcount(nesne) - 1\n\ndef ayni_deger_farkli_nesne(x):\n    return list(x)\n',
        tests: 'import sys\nv = [1, 2, 3]\nn1 = referans_sayisi(v)\nassert isinstance(n1, int) and n1 >= 1, "tam sayı bir referans sayısı döndürmeli"\nalias = v\nassert referans_sayisi(v) == n1 + 1, "Yeni bir ad eklenince sayı 1 artmalı"\ndel alias\nassert referans_sayisi(v) == n1, "Ad silinince sayı geri düşmeli"\nk = ayni_deger_farkli_nesne(v)\nassert k == v and k is not v, "Değer eşit, kimlik farklı olmalı"\n',
        hints: ['sys.getrefcount(nesne) - 1; argüman olarak geçiş geçici bir referans ekler.', 'list(x), x[:] ya da x.copy() yeni liste nesnesi üretir.'],
        why: 'Referans sayısı adlar ve kaplar eklendikçe artar, silindikçe düşer. Sığ kopya yeni dış nesne verir; içerik aynı nesnelere işaret eder.' }
    ],
    faq: [
      { q: 'Python değeri mi referansı mı geçirir?', a: 'Nesne referansını geçirir. Değişebilir nesne içeride değiştirilirse dışarıda görülür; yeniden atama (x = ...) yalnızca yerel adı değiştirir.' },
      { q: 'del nesneyi siler mi?', a: 'Hayır, yalnızca adı kaldırır ve referans sayısını bir azaltır. Nesne başka referansı kalmayınca silinir.' },
      { q: '__slots__ her sınıfa koymalı mıyım?', a: 'Hayır. Yalnızca çok sayıda (yüz binlerce) küçük örnek oluşan veri sınıflarında anlamlıdır. dataclass(slots=True) ile kolayca eklenir; dinamik öznitelik ve çoklu kalıtımda dikkat gerekir.' }
    ],
    mistakes: [
      { bad: 'if durum is "aktif":', good: 'if durum == "aktif":', why: 'String kimliği interning\'e bağlıdır ve güvenilmez; değer karşılaştırması == ile yapılır.' },
      { bad: 'yedek = veri\nyedek.append(x)  # veri de değişir', good: 'yedek = veri.copy()\nyedek.append(x)', why: 'Atama kopya değildir, aynı nesneye ikinci addır; bağımsızlık için copy (iç içe yapıda deepcopy).' },
      { bad: 'def ekle(urun, sepet=[]):\n    sepet.append(urun)\n    return sepet', good: 'def ekle(urun, sepet=None):\n    if sepet is None:\n        sepet = []\n    sepet.append(urun)\n    return sepet', why: 'Varsayılan liste tanımda bir kez yaratılır ve çağrılar arasında paylaşılır.' },
      { bad: 'print(sys.getsizeof(buyuk_liste), "bayt bellek")', good: 'tracemalloc.start()\n...\nsnap = tracemalloc.take_snapshot()', why: 'getsizeof yalnızca kabın kendi boyutunu verir, elemanları saymaz; gerçek kullanım için tracemalloc ya da toplam hesaplama gerekir.' }
    ]
  }
);
})(window);
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{ id: 'ileri-oop', lv: 'ileri', mod: 'Mimari', min: 40,
    title: 'İleri OOP: dunder metotlar, ABC, Protocol ve descriptor',
    sum: 'Sınıflarını Python\'ın yerleşik türleri gibi davranacak şekilde tasarla: eşitlik, sıralama, uzunluk, indeksleme, çağrılabilirlik, soyut sınıflar, Protocol, descriptor, __slots__ ve metaclass\'a kısa bakış.',
    goals: ['__eq__, __hash__, __lt__ gibi dunder metotlarla sınıfımı küme, sözlük ve sorted ile uyumlu yapabilirim', '__len__, __getitem__, __iter__ ve __call__ ile kendi koleksiyon ve çağrılabilir nesnelerimi yazabilirim', 'ABC ile zorunlu arayüz, Protocol ile yapısal tipleme arasında doğru seçimi yapabilirim', 'Descriptor ve property ile alan doğrulamasını tek yerde toplayabilirim', '__slots__, classmethod, staticmethod ve metaclass\'ın ne zaman gerektiğini açıklayabilirim'],
    body: `<h2>Neden önemli?</h2>
<p>Orta seviyede sınıf yazmayı, kalıtımı ve dataclass\'ı öğrendin. Kurumsal kodda ise sınıfların "Python gibi" davranması beklenir: bir <code>Para</code> nesnesi <code>==</code> ile karşılaştırılabilmeli, bir kümeye konabilmeli, <code>sorted</code> ile sıralanabilmeli; bir <code>Sepet</code> nesnesi <code>len()</code> ve <code>for</code> ile kullanılabilmeli. Ilgaz Bank\'ta bir işlem motoru yazarken "bu iki tutar eşit mi?" sorusunun cevabı <code>id()</code> karşılaştırması olursa raporlar yanlış çıkar. Bu dersin konusu, sınıflarını dil ile bütünleştiren <b>özel metotlar</b> (dunder methods, "double underscore") ve kodun sınırlarını tanımlayan soyutlama araçlarıdır.</p>

<h2>Eşitlik, hash ve sıralama</h2>
<p>Varsayılan olarak iki nesne yalnızca aynı nesneyse eşittir. <code>__eq__</code> yazarak "değer eşitliği" tanımlarsın. Dikkat: <code>__eq__</code> yazıp <code>__hash__</code> yazmazsan Python nesneyi <b>hashlenemez</b> yapar; küme ve sözlük anahtarı olarak kullanamazsın. Değişmez (immutable) nesnelerde <code>__hash__</code>\'i eşitlikte kullandığın alanlardan üret.</p>
<pre class="py">from functools import total_ordering

@total_ordering
class Para:
    """Ilgaz Bank: kuruş hassasiyetinde tutar."""
    __slots__ = ('kurus', 'birim')

    def __init__(self, tutar: float, birim: str = 'TRY'):
        self.kurus = round(tutar * 100)
        self.birim = birim

    def __repr__(self):
        return f'Para({self.kurus / 100:.2f}, {self.birim!r})'

    def __eq__(self, other):
        if not isinstance(other, Para):
            return NotImplemented
        return (self.kurus, self.birim) == (other.kurus, other.birim)

    def __hash__(self):
        return hash((self.kurus, self.birim))

    def __lt__(self, other):
        if not isinstance(other, Para) or self.birim != other.birim:
            return NotImplemented
        return self.kurus &lt; other.kurus

    def __add__(self, other):
        if not isinstance(other, Para) or self.birim != other.birim:
            return NotImplemented
        return Para((self.kurus + other.kurus) / 100, self.birim)

a, b, c = Para(10.10), Para(10.10), Para(3.5)
print(a == b, a is b)          # True False
print(len({a, b, c}))          # 2  -&gt; hash tutarlı
print(sorted([a, c, Para(7)])) # küçükten büyüğe
print(a + c, a &gt; c)
</pre>
<div class="tip"><b>total_ordering</b><code>functools.total_ordering</code>, yalnızca <code>__eq__</code> ve bir karşılaştırma metodu (örneğin <code>__lt__</code>) tanımladığında geri kalan <code>__le__</code>, <code>__gt__</code>, <code>__ge__</code> metotlarını üretir. <code>NotImplemented</code> döndürmek, "ben bilmiyorum, karşı taraf denesin" demektir; <code>raise</code> etmekten farklıdır.</div>

<h2>Koleksiyon gibi davranmak</h2>
<p>Dört metot yeter: <code>__len__</code>, <code>__getitem__</code>, <code>__iter__</code>, <code>__contains__</code>. Yalnızca <code>__getitem__</code> yazarsan Python 0, 1, 2 diye indeksleyerek <code>for</code> döngüsünü ve <code>in</code> kontrolünü bile üretir; ama açıkça <code>__iter__</code> yazmak daha hızlı ve nettir.</p>
<pre class="py">class Sepet:
    def __init__(self):
        self._kalemler: list[tuple[str, int, float]] = []

    def ekle(self, urun, adet, fiyat):
        self._kalemler.append((urun, adet, fiyat))
        return self            # zincirleme için

    def __len__(self):
        return len(self._kalemler)

    def __getitem__(self, i):          # int ve dilim (slice) destekler
        return self._kalemler[i]

    def __iter__(self):
        return iter(self._kalemler)

    def __contains__(self, urun):
        return any(k[0] == urun for k in self._kalemler)

    def __call__(self, kdv=0.20):      # sepet(0.2) -&gt; toplam
        return round(sum(a * f for _, a, f in self._kalemler) * (1 + kdv), 2)

    def __bool__(self):
        return bool(self._kalemler)

s = Sepet().ekle('kahve', 2, 150.0).ekle('bardak', 4, 40.0)
print(len(s), 'kahve' in s, 'çay' in s)
print(s[0], s[-1:])
for urun, adet, fiyat in s:
    print(f'{urun:&lt;8}{adet:&gt;3} x {fiyat:&gt;7.2f}')
print('KDV dahil:', s())
print('boş sepet:', bool(Sepet()))
</pre>
<div class="note"><b>__bool__ yoksa __len__ kullanılır</b>Bir nesnenin doğruluk değeri önce <code>__bool__</code>, o yoksa <code>__len__</code> ile belirlenir. Koleksiyon sınıflarında <code>__len__</code> yazdığında <code>if sepet:</code> otomatik olarak "sepet boş mu?" anlamına gelir.</div>

<h2>ABC: zorunlu arayüz</h2>
<p><code>abc.ABC</code> ve <code>@abstractmethod</code>, alt sınıfın mutlaka gerçekleştirmesi gereken metotları tanımlar. Eksik bırakılan metot varsa sınıf <b>örneklenemez</b>; hata, nesne yaratılırken, yani erken çıkar. Ödeme sağlayıcıları, bildirim kanalları, depolama katmanları gibi "birden fazla gerçekleştirme, tek sözleşme" durumlarında kullan.</p>
<pre class="py">from abc import ABC, abstractmethod

class OdemeSaglayici(ABC):
    @abstractmethod
    def tahsil_et(self, tutar: float) -&gt; str: ...

    def makbuz(self, tutar):            # somut metot: alt sınıflara miras
        return f'{self.__class__.__name__}: {tutar:.2f} TL tahsil edildi'

class KrediKarti(OdemeSaglayici):
    def tahsil_et(self, tutar):
        return self.makbuz(tutar)

class Havale(OdemeSaglayici):
    pass                                 # tahsil_et eksik!

print(KrediKarti().tahsil_et(250))
try:
    Havale()
except TypeError as e:
    print('Hata:', e)
print(issubclass(KrediKarti, OdemeSaglayici), isinstance(KrediKarti(), OdemeSaglayici))
</pre>

<h2>Protocol: yapısal tipleme</h2>
<p>ABC "kalıtımla sözleşme" kurar; <code>typing.Protocol</code> ise "bu metotlara sahip olan herkes uyar" der (ördek tipleme, duck typing). Alt sınıf olmak gerekmez; <code>@runtime_checkable</code> eklersen <code>isinstance</code> da çalışır. Dış kütüphanelerin sınıflarını değiştiremediğin, ama onları kendi fonksiyonlarına parametre olarak almak istediğin durumlarda Protocol tek çözümdür.</p>
<pre class="py">from typing import Protocol, runtime_checkable

@runtime_checkable
class Raporlanabilir(Protocol):
    def satir(self) -&gt; str: ...

class Siparis:
    def __init__(self, no, tutar): self.no, self.tutar = no, tutar
    def satir(self): return f'SIP-{self.no} {self.tutar:.2f}'

class Musteri:
    def __init__(self, ad): self.ad = ad
    def satir(self): return f'MUS {self.ad}'

def yazdir(kayitlar: list[Raporlanabilir]):
    for k in kayitlar:
        print(k.satir())

yazdir([Siparis(1, 99.9), Musteri('Ayşe')])
print(isinstance(Siparis(2, 1), Raporlanabilir), isinstance(3, Raporlanabilir))
</pre>
<div class="tbl-wrap"><table><tr><th>Özellik</th><th>ABC</th><th>Protocol</th></tr><tr><td>İlişki</td><td>Nominal: alt sınıf olmalı</td><td>Yapısal: metotlar uyuşmalı</td></tr><tr><td>Eksik metot</td><td>Örnekleme anında TypeError</td><td>Statik denetleyici (mypy) uyarır</td></tr><tr><td>Somut metot paylaşımı</td><td>Evet, miras alınır</td><td>Hayır (yalnızca imza)</td></tr><tr><td>Dış kütüphane sınıfı</td><td>Uyarlamak gerekir</td><td>Olduğu gibi uyar</td></tr><tr><td>Tipik kullanım</td><td>Kendi eklenti sistemin</td><td>Fonksiyon parametresi sözleşmesi</td></tr></table></div>

<h2>Descriptor ve property</h2>
<p><code>property</code> tek alana doğrulama eklemek için idealdir. Aynı doğrulamayı on sınıfta yirmi alana uygulayacaksan <b>descriptor</b> yaz: <code>__set_name__</code>, <code>__get__</code>, <code>__set__</code> metotlarına sahip bir sınıf. Pydantic, Django ORM ve dataclass\'ın <code>field</code> mekanizması bu altyapıya dayanır.</p>
<pre class="py">class Pozitif:
    """Alan değeri pozitif sayı olmalı; aksi halde ValueError."""
    def __set_name__(self, owner, name):
        self.ad = name
        self.gizli = '_' + name

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return getattr(obj, self.gizli)

    def __set__(self, obj, deger):
        if not isinstance(deger, (int, float)) or deger &lt;= 0:
            raise ValueError(f'{self.ad} pozitif olmalı, gelen: {deger!r}')
        setattr(obj, self.gizli, deger)

class KrediBasvurusu:
    tutar = Pozitif()
    vade_ay = Pozitif()

    def __init__(self, tutar, vade_ay):
        self.tutar = tutar
        self.vade_ay = vade_ay

    @property
    def aylik_taksit(self):             # salt okunur hesaplanmış alan
        return round(self.tutar / self.vade_ay, 2)

k = KrediBasvurusu(120_000, 24)
print(k.tutar, k.vade_ay, k.aylik_taksit)
try:
    k.vade_ay = 0
except ValueError as e:
    print('Hata:', e)
</pre>

<h2>__slots__, classmethod, staticmethod</h2>
<p><code>__slots__</code> nesnenin <code>__dict__</code> sözlüğünü kaldırır: bellek düşer, öznitelik erişimi hızlanır, yanlışlıkla <code>self.tutr = 5</code> yazmak AttributeError verir. Milyonlarca küçük nesne ürettiğin (işlem kayıtları, log satırları) sınıflarda değerlidir; dinamik öznitelik eklemen gereken yerlerde kullanma.</p>
<p><code>@classmethod</code> alternatif kurucu (constructor) yazmanın standart yoludur: <code>Siparis.from_dict(...)</code>, <code>datetime.fromisoformat(...)</code>. İlk parametresi sınıfın kendisidir; alt sınıftan çağrılınca alt sınıfı üretir. <code>@staticmethod</code> ise sınıfla ilgili ama ne örneğe ne sınıfa ihtiyaç duyan yardımcı fonksiyondur (ör. doğrulama).</p>
<pre class="py">from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class Islem:
    hesap: str
    tutar: float

    @staticmethod
    def hesap_gecerli(hesap: str) -&gt; bool:
        return hesap.startswith('TR') and len(hesap) == 26

    @classmethod
    def from_dict(cls, d: dict):
        if not cls.hesap_gecerli(d['hesap']):
            raise ValueError('IBAN geçersiz')
        return cls(hesap=d['hesap'], tutar=float(d['tutar']))

i = Islem.from_dict({'hesap': 'TR' + '0' * 24, 'tutar': '150.75'})
print(i)
try:
    i.ekstra = 1
except (AttributeError, TypeError) as e:   # Python 3.12'de frozen+slots bazen TypeError verir
    print('slots engelledi:', type(e).__name__)
</pre>
<div class="warn"><b>Kalıtım ve __slots__</b>Alt sınıf da <code>__slots__</code> tanımlamazsa <code>__dict__</code> geri gelir ve kazanım kaybolur. Çoklu kalıtımda iki ebeveynin ikisi de boş olmayan <code>__slots__</code> taşıyorsa "layout conflict" hatası alırsın.</div>

<h2>Metaclass\'a kısa bakış</h2>
<p>Metaclass, sınıfın sınıfıdır: <code>type</code>. <code>class X:</code> ifadesi aslında <code>type('X', (), {...})</code> çağrısıdır. Kendi metaclass\'ını yazarak sınıf tanımlanırken müdahale edebilirsin (otomatik kayıt, alan doğrulama). Uygulama kodunda nadiren gerekir; çoğu ihtiyaç <code>__init_subclass__</code> ile daha basit çözülür:</p>
<pre class="py">class Eklenti:
    kayit: dict[str, type] = {}

    def __init_subclass__(cls, anahtar=None, **kw):
        super().__init_subclass__(**kw)
        Eklenti.kayit[anahtar or cls.__name__.lower()] = cls

class CsvDisaAktar(Eklenti, anahtar='csv'): ...
class JsonDisaAktar(Eklenti, anahtar='json'): ...

print(sorted(Eklenti.kayit))
print(type(Eklenti), type(type))
</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Kurumsal kodda dunder disiplini</h3>
<p>İş hayatında sık görülen hatalar: <code>__eq__</code> yazıp <code>__hash__</code> unutmak (nesne kümeye girince TypeError), değişebilir (mutable) nesneye <code>__hash__</code> vermek (sözlükte kaybolan anahtarlar), <code>__repr__</code> yazmamak (log dosyasında <code>&lt;Siparis object at 0x...&gt;</code>). Pratik kural: değer nesneleri için <code>@dataclass(frozen=True)</code> kullan, eşitlik ve hash hazır gelir; davranış sınıflarında yalnızca gerçekten gereken dunder\'ları yaz.</p>
<p>ABC mi Protocol mü sorusunda ekip kuralı genelde şudur: kendi yazdığın eklenti sistemi ve paylaşılan somut metotlar varsa ABC; fonksiyon parametresi için "şu metoda sahip olsun" diyorsan Protocol. İkisini birlikte de kullanabilirsin: ABC gerçekleştirmeyi zorunlu kılar, Protocol test çiftlerinin (test double) kalıtım olmadan geçmesini sağlar.</p>
<p>Descriptor yazarken <code>__set_name__</code> kullan; alan adını elle tekrar etmek hata kaynağıdır. Performans kritik sınıflarda <code>__slots__</code> ile dataclass\'ın <code>slots=True</code> seçeneğini birleştir. Metaclass\'ı yalnızca bir çerçeve (framework) yazıyorsan düşün; uygulama kodunda görürsen önce <code>__init_subclass__</code> ya da sınıf dekoratörü ile çözülüp çözülemeyeceğini sor.</p>
</section>`,
    ex: [
      { t: 'code', id: 'ileri-oop-1',
        q: '<p>Ilgaz Bank için <code>Tutar</code> sınıfı yaz. Kurucu <code>Tutar(kurus: int, birim: str = \'TRY\')</code> olsun. <code>__eq__</code> (kurus ve birim eşitse), <code>__hash__</code> (aynı alanlardan), <code>__lt__</code> (aynı birimde kurus karşılaştır) ve <code>__add__</code> (aynı birimde yeni Tutar döndür) metotlarını tanımla. Farklı tür ile karşılaştırmada <code>NotImplemented</code> döndür.</p>',
        start: 'class Tutar:\n    def __init__(self, kurus: int, birim: str = \'TRY\'):\n        self.kurus = kurus\n        self.birim = birim\n\n    # __eq__, __hash__, __lt__, __add__ yaz\n',
        sol: 'class Tutar:\n    def __init__(self, kurus: int, birim: str = \'TRY\'):\n        self.kurus = kurus\n        self.birim = birim\n\n    def __eq__(self, other):\n        if not isinstance(other, Tutar):\n            return NotImplemented\n        return (self.kurus, self.birim) == (other.kurus, other.birim)\n\n    def __hash__(self):\n        return hash((self.kurus, self.birim))\n\n    def __lt__(self, other):\n        if not isinstance(other, Tutar) or self.birim != other.birim:\n            return NotImplemented\n        return self.kurus < other.kurus\n\n    def __add__(self, other):\n        if not isinstance(other, Tutar) or self.birim != other.birim:\n            return NotImplemented\n        return Tutar(self.kurus + other.kurus, self.birim)\n',
        tests: 'assert Tutar(100) == Tutar(100), "Aynı kuruş ve birim eşit olmalı"\nassert Tutar(100) != Tutar(100, \'USD\'), "Farklı birim eşit olmamalı"\nassert Tutar(100) != 100, "Farklı türle eşit olmamalı"\nassert len({Tutar(5), Tutar(5), Tutar(6)}) == 2, "Hash eşitlikle tutarlı olmalı"\nassert Tutar(3) < Tutar(4), "__lt__ kuruşa göre karşılaştırmalı"\nassert sorted([Tutar(9), Tutar(1), Tutar(5)])[0] == Tutar(1), "sorted çalışmalı"\nt = Tutar(150) + Tutar(50)\nassert isinstance(t, Tutar) and t.kurus == 200, "__add__ yeni Tutar döndürmeli"\nimport operator\ntry:\n    operator.lt(Tutar(1), Tutar(1, \'USD\'))\n    assert False, "Farklı birimde < TypeError vermeli"\nexcept TypeError:\n    pass\n',
        hints: ['__eq__ içinde önce isinstance kontrolü yap; değilse NotImplemented döndür.', '__hash__ için hash((self.kurus, self.birim)) yeterli.', '__add__ aynı birimde Tutar(self.kurus + other.kurus, self.birim) döndürsün.'],
        why: 'NotImplemented döndürmek Python\'a "karşı tarafın metodunu dene" der; ikisi de bilmiyorsa TypeError oluşur. Hash, eşitlikte kullanılan alanlardan üretildiği için küme doğru çalışır.' },
      { t: 'mc', q: 'Bir sınıfa yalnızca <code>__eq__</code> yazdın, <code>__hash__</code> yazmadın. Ne olur?',
        o: ['Hiçbir şey değişmez, varsayılan hash kullanılır', 'Nesne hashlenemez olur; kümeye konamaz', 'Python otomatik olarak __eq__ alanlarından hash üretir', 'Sınıf tanımı SyntaxError verir'],
        a: 1, why: '__eq__ tanımlanıp __hash__ tanımlanmazsa Python __hash__ = None atar; nesne set/dict anahtarı olarak kullanılınca TypeError: unhashable type alırsın. Otomatik üretim yalnızca frozen dataclass gibi yapılarda vardır.' },
      { t: 'code', id: 'ileri-oop-3',
        q: '<p>Anadolu Market için <code>Katalog</code> sınıfı yaz. Kurucu <code>Katalog(urunler: dict[str, float])</code> (ürün adı -> fiyat). Şunları destekle: <code>len(k)</code> ürün sayısı, <code>k[\'kahve\']</code> fiyat (yoksa KeyError), <code>\'kahve\' in k</code>, <code>for ad in k</code> ürün adları üzerinde döner (alfabetik), <code>k(oran)</code> çağrısı tüm fiyatları oran ile çarpılmış yeni bir Katalog döndürür.</p>',
        start: 'class Katalog:\n    def __init__(self, urunler: dict[str, float]):\n        self._urunler = dict(urunler)\n    # __len__, __getitem__, __contains__, __iter__, __call__\n',
        sol: 'class Katalog:\n    def __init__(self, urunler: dict[str, float]):\n        self._urunler = dict(urunler)\n\n    def __len__(self):\n        return len(self._urunler)\n\n    def __getitem__(self, ad):\n        return self._urunler[ad]\n\n    def __contains__(self, ad):\n        return ad in self._urunler\n\n    def __iter__(self):\n        return iter(sorted(self._urunler))\n\n    def __call__(self, oran):\n        return Katalog({a: round(f * oran, 2) for a, f in self._urunler.items()})\n',
        tests: 'k = Katalog({\'kahve\': 150.0, \'bardak\': 40.0, \'çay\': 80.0})\nassert len(k) == 3, "len ürün sayısını vermeli"\nassert k[\'kahve\'] == 150.0, "__getitem__ fiyatı döndürmeli"\nassert \'çay\' in k and \'süt\' not in k, "__contains__ çalışmalı"\nassert list(k) == [\'bardak\', \'kahve\', \'çay\'], "__iter__ alfabetik ad vermeli"\ntry:\n    k[\'süt\']\n    assert False, "Olmayan ürün KeyError vermeli"\nexcept KeyError:\n    pass\nz = k(1.1)\nassert isinstance(z, Katalog) and abs(z[\'kahve\'] - 165.0) < 1e-6, "__call__ zamlı yeni katalog döndürmeli"\nassert k[\'kahve\'] == 150.0, "Orijinal katalog değişmemeli"\n',
        hints: ['__iter__ için iter(sorted(self._urunler)) döndür.', '__call__ içinde sözlük comprehension ile yeni Katalog üret.'],
        why: 'Dört dunder ile sınıf yerleşik koleksiyon gibi davranır; __call__ nesneyi fonksiyon gibi çağrılabilir yapar ve orijinali değiştirmeden yeni nesne döndürmek yan etkiyi önler.' },
      { t: 'code', id: 'ileri-oop-4',
        q: '<p><code>abc</code> modülüyle <code>Bildirim</code> soyut sınıfını yaz: soyut metot <code>gonder(self, mesaj) -> str</code>, somut metot <code>etiketle(self, mesaj)</code> = <code>f\'[{self.__class__.__name__}] {mesaj}\'</code>. <code>Eposta</code> ve <code>Sms</code> alt sınıfları <code>gonder</code> içinde <code>etiketle</code> sonucunu döndürsün. Ayrıca hiçbir metot gerçekleştirmeyen <code>Eksik(Bildirim)</code> sınıfı tanımla (örneklenemeyecek).</p>',
        start: 'from abc import ABC, abstractmethod\n\n# Bildirim, Eposta, Sms, Eksik\n',
        sol: 'from abc import ABC, abstractmethod\n\nclass Bildirim(ABC):\n    @abstractmethod\n    def gonder(self, mesaj) -> str: ...\n\n    def etiketle(self, mesaj):\n        return f\'[{self.__class__.__name__}] {mesaj}\'\n\nclass Eposta(Bildirim):\n    def gonder(self, mesaj):\n        return self.etiketle(mesaj)\n\nclass Sms(Bildirim):\n    def gonder(self, mesaj):\n        return self.etiketle(mesaj)\n\nclass Eksik(Bildirim):\n    pass\n',
        tests: 'assert Eposta().gonder(\'merhaba\') == \'[Eposta] merhaba\', "Eposta etiketli mesaj döndürmeli"\nassert Sms().gonder(\'kod 1234\') == \'[Sms] kod 1234\', "Sms etiketli mesaj döndürmeli"\nassert issubclass(Sms, Bildirim), "Sms Bildirim alt sınıfı olmalı"\nimport inspect\nassert inspect.isabstract(Bildirim), "Bildirim soyut olmalı"\ntry:\n    Eksik()\n    assert False, "Eksik örneklenemez olmalı (TypeError)"\nexcept TypeError:\n    pass\n',
        hints: ['class Bildirim(ABC): ve metodun üstüne @abstractmethod.', 'Somut etiketle metodu ABC içinde normal şekilde tanımlanır.'],
        why: 'ABC, alt sınıfın sözleşmeyi erken (örnekleme anında) ihlal ettiğini söyler; somut metotlar ise ortak davranışı paylaşır.' },
      { t: 'mc', q: '<code>__slots__</code> kullanmanın doğru gerekçesi hangisi?',
        o: ['Nesneye dinamik öznitelik ekleyebilmek', 'Çok sayıda küçük nesnede bellek ve erişim hızı kazanmak', 'Sınıfı otomatik olarak hashlenebilir yapmak', 'Kalıtımı engellemek'],
        a: 1, why: '__slots__ nesne başına __dict__ sözlüğünü kaldırır; bellek düşer, öznitelik erişimi hızlanır. Dinamik öznitelik eklemeyi engeller, hash ya da kalıtımla ilgisi yoktur.' },
      { t: 'code', id: 'ileri-oop-6',
        q: '<p><code>Aralik</code> adlı descriptor yaz: <code>Aralik(alt, ust)</code>. <code>__set_name__</code> ile alan adını öğrensin, <code>__get__</code> değeri döndürsün, <code>__set__</code> değer <code>alt &lt;= deger &lt;= ust</code> değilse <code>ValueError</code> fırlatsın (mesajda alan adı geçsin). Sonra <code>Kampanya</code> sınıfında <code>indirim = Aralik(0, 70)</code> ve <code>stok = Aralik(0, 10_000)</code> alanlarını kullan; kurucu <code>Kampanya(indirim, stok)</code>.</p>',
        start: 'class Aralik:\n    def __init__(self, alt, ust):\n        self.alt, self.ust = alt, ust\n    # __set_name__, __get__, __set__\n\nclass Kampanya:\n    indirim = Aralik(0, 70)\n    stok = Aralik(0, 10_000)\n    def __init__(self, indirim, stok):\n        self.indirim = indirim\n        self.stok = stok\n',
        sol: 'class Aralik:\n    def __init__(self, alt, ust):\n        self.alt, self.ust = alt, ust\n\n    def __set_name__(self, owner, name):\n        self.ad = name\n        self.gizli = \'_\' + name\n\n    def __get__(self, obj, objtype=None):\n        if obj is None:\n            return self\n        return getattr(obj, self.gizli)\n\n    def __set__(self, obj, deger):\n        if not (self.alt <= deger <= self.ust):\n            raise ValueError(f\'{self.ad}: {deger} [{self.alt}, {self.ust}] dışında\')\n        setattr(obj, self.gizli, deger)\n\nclass Kampanya:\n    indirim = Aralik(0, 70)\n    stok = Aralik(0, 10_000)\n    def __init__(self, indirim, stok):\n        self.indirim = indirim\n        self.stok = stok\n',
        tests: 'k = Kampanya(25, 500)\nassert k.indirim == 25 and k.stok == 500, "__get__ değeri döndürmeli"\nk.indirim = 70\nassert k.indirim == 70, "Sınır değer kabul edilmeli"\ntry:\n    k.indirim = 71\n    assert False, "71 ValueError vermeli"\nexcept ValueError as e:\n    assert \'indirim\' in str(e), "Hata mesajında alan adı olmalı"\ntry:\n    Kampanya(-1, 5)\n    assert False, "Negatif indirim ValueError vermeli"\nexcept ValueError:\n    pass\nk2 = Kampanya(10, 20)\nassert k.indirim == 70 and k2.indirim == 10, "Her nesne kendi değerini tutmalı"\nassert isinstance(Kampanya.indirim, Aralik), "Sınıftan erişimde descriptor dönmeli"\n',
        hints: ['__set_name__(self, owner, name) içinde self.ad = name; self.gizli = \'_\' + name.', 'Değeri nesnenin üzerinde gizli adla sakla: setattr(obj, self.gizli, deger).', '__get__ içinde obj None ise self döndür.'],
        why: 'Descriptor, doğrulamayı tek sınıfta toplar; her alan için property yazmak yerine Aralik(0, 70) demek yeter. Değer nesnede tutulduğu için örnekler birbirini etkilemez.' },
      { t: 'code', id: 'ileri-oop-7',
        q: '<p><code>Musteri</code> sınıfı yaz: alanlar <code>ad</code>, <code>eposta</code>. <code>@staticmethod eposta_gecerli(eposta) -> bool</code> (tam bir <code>@</code> ve ondan sonra en az bir nokta içermeli). <code>@classmethod from_dict(cls, d)</code>: <code>d[\'ad\']</code> boşluklarını kırpsın, e-posta geçersizse <code>ValueError</code>, geçerliyse e-postayı küçük harfe çevirip nesne döndürsün. Bir <code>KurumsalMusteri(Musteri)</code> alt sınıfı da tanımla (gövdesi pass); from_dict alt sınıftan çağrılınca alt sınıf örneği üretmeli.</p>',
        start: 'class Musteri:\n    def __init__(self, ad, eposta):\n        self.ad, self.eposta = ad, eposta\n    # eposta_gecerli, from_dict\n\nclass KurumsalMusteri(Musteri):\n    pass\n',
        sol: 'class Musteri:\n    def __init__(self, ad, eposta):\n        self.ad, self.eposta = ad, eposta\n\n    @staticmethod\n    def eposta_gecerli(eposta) -> bool:\n        if eposta.count(\'@\') != 1:\n            return False\n        return \'.\' in eposta.split(\'@\')[1]\n\n    @classmethod\n    def from_dict(cls, d):\n        eposta = d[\'eposta\'].strip()\n        if not cls.eposta_gecerli(eposta):\n            raise ValueError(\'e-posta geçersiz\')\n        return cls(d[\'ad\'].strip(), eposta.lower())\n\nclass KurumsalMusteri(Musteri):\n    pass\n',
        tests: 'assert Musteri.eposta_gecerli(\'a@b.com\') and not Musteri.eposta_gecerli(\'ab.com\') and not Musteri.eposta_gecerli(\'a@b\'), "eposta_gecerli kuralları"\nm = Musteri.from_dict({\'ad\': \'  Ayşe \', \'eposta\': \'AYSE@Anadolu.com\'})\nassert m.ad == \'Ayşe\' and m.eposta == \'ayse@anadolu.com\', "from_dict kırpmalı ve küçültmeli"\nk = KurumsalMusteri.from_dict({\'ad\': \'Acme\', \'eposta\': \'x@acme.com.tr\'})\nassert type(k) is KurumsalMusteri, "Alt sınıftan çağrı alt sınıf örneği üretmeli"\ntry:\n    Musteri.from_dict({\'ad\': \'X\', \'eposta\': \'bozuk\'})\n    assert False, "Geçersiz e-posta ValueError vermeli"\nexcept ValueError:\n    pass\n',
        hints: ['classmethod içinde cls(...) kullan, Musteri(...) değil.', 'Geçerlilik: eposta.count(\'@\') == 1 ve \'@\' sonrası parçada nokta var.'],
        why: 'cls ile üretmek alt sınıfların alternatif kurucuyu miras almasını sağlar. staticmethod ne self ne cls ister; saf yardımcı fonksiyondur.' },
      { t: 'mc', q: 'Dış bir kütüphanenin sınıfını değiştiremiyorsun ama <code>kapat()</code> metoduna sahip her nesneyi kabul eden bir fonksiyon yazmak istiyorsun. En uygun araç?',
        o: ['abc.ABC ile soyut sınıf', 'typing.Protocol', 'Metaclass', '__slots__'],
        a: 1, why: 'Protocol yapısal tipleme sağlar: kalıtım gerekmeden metodu olan her nesne uyar. ABC alt sınıf olmayı gerektirir; dış kütüphane sınıfını değiştiremezsin.' }
    ],
    faq: [
      { q: 'NotImplemented ile NotImplementedError aynı şey mi?', a: 'Hayır. NotImplemented, ikili operatör metotlarından döndürülen özel bir değerdir; Python karşı tarafın yansıma metodunu dener. NotImplementedError ise fırlatılan bir istisnadır, soyut gövdelerde ya da "henüz yazılmadı" durumunda kullanılır.' },
      { q: 'dataclass varken dunder yazmaya gerek var mı?', a: 'Değer nesneleri için çoğunlukla yok: @dataclass(frozen=True, order=True) eşitlik, hash ve sıralama üretir. Koleksiyon davranışı (__len__, __getitem__), __call__ ya da özel aritmetik gerekiyorsa elle yazarsın.' },
      { q: 'Descriptor ne zaman property\'den iyidir?', a: 'Aynı doğrulama mantığı birden fazla alan ya da sınıfta tekrar ediyorsa. Tek bir hesaplanmış alan için property daha okunur.' },
      { q: 'Metaclass öğrenmeli miyim?', a: 'Kavramı bil, nadiren yaz. Çerçeve (ORM, doğrulama kütüphanesi) yazmıyorsan __init_subclass__ ve sınıf dekoratörleri ihtiyaçların çoğunu karşılar.' }
    ],
    mistakes: [
      { bad: 'class P:\n    def __eq__(self, o): return self.x == o.x', good: 'class P:\n    def __eq__(self, o):\n        if not isinstance(o, P): return NotImplemented\n        return self.x == o.x\n    def __hash__(self): return hash(self.x)', why: 'Tür kontrolü olmadan P() == 5 AttributeError verir; __hash__ olmadan nesne kümeye giremez.' },
      { bad: 'class Liste:\n    def __len__(self): return self.n\n# if liste: ... her zaman n != 0 kontrolü', good: 'class Liste:\n    def __len__(self): return self.n\n    def __bool__(self): return True  # gerçekten istiyorsan', why: '__len__ tanımlayınca doğruluk değeri uzunluktan türer; boş koleksiyonun False sayılmasını istemiyorsan __bool__ yazmalısın.' },
      { bad: 'class A:\n    __slots__ = (\'x\',)\nclass B(A):\n    pass  # B nesnelerinde __dict__ geri gelir', good: 'class A:\n    __slots__ = (\'x\',)\nclass B(A):\n    __slots__ = (\'y\',)', why: 'Alt sınıf __slots__ tanımlamazsa __dict__ oluşur ve bellek kazanımı kaybolur.' },
      { bad: 'class M:\n    def from_dict(d):\n        return M(d[\'ad\'])', good: 'class M:\n    @classmethod\n    def from_dict(cls, d):\n        return cls(d[\'ad\'])', why: 'Dekoratörsüz metot örnek metodudur; sınıftan çağrı d parametresini self sanır. classmethod + cls alt sınıflarda da doğru tür üretir.' }
    ]
  }
);
})(window);
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{ id: 'tasarim-kaliplari', lv: 'ileri', mod: 'Mimari', min: 38,
    title: 'Tasarım kalıpları Python\'da',
    sum: 'Strateji, fabrika, gözlemci, tekil, adaptör ve komut kalıplarını Python\'a özgü biçimde uygula; fonksiyonların birinci sınıf olduğu yerde kalıbın gereksizleştiğini gör.',
    goals: ['Strateji kalıbını sınıf hiyerarşisi yerine fonksiyon sözlüğüyle kurabilirim', 'Fabrika ve kayıt (registry) ile nesne üretimini çağıran koddan ayırabilirim', 'Gözlemci ve komut kalıplarıyla olay ve geri alma mekanizması tasarlayabilirim', 'Tekil (singleton) yerine neden modül düzeyi nesne kullanıldığını açıklayabilirim', 'Adaptör ile uyumsuz arayüzleri değişiklik yapmadan bağlayabilirim'],
    body: `<h2>Neden önemli?</h2>
<p>Tasarım kalıpları (design patterns), tekrar eden tasarım sorunlarına verilmiş isimli çözümlerdir. Kod incelemesinde "burada strateji kalıbı daha uygun" cümlesi, dakikalarca anlatımın yerini tutar. Ama kalıpların çoğu Java/C++ dünyasında, fonksiyonların nesne olmadığı bir ortamda doğdu. Python\'da fonksiyonlar birinci sınıf (first-class) değerdir, sınıflar çalışma zamanında oluşturulabilir, modüller zaten tekil nesnedir. Bu yüzden bu derste her kalıbı iki kez göreceksin: klasik biçimi ve Python\'da sade biçimi. Hedef, kalıbı ezberlemek değil; <b>ne zaman gerektiğini ve ne zaman gerekmediğini</b> ayırt etmektir.</p>

<h2>Strateji: değiştirilebilir davranış</h2>
<p>Anadolu Market\'te kargo ücreti şehre, ağırlığa ve kampanyaya göre farklı kurallarla hesaplanıyor. Klasik çözüm bir <code>KargoStratejisi</code> soyut sınıfı ve alt sınıflarıdır. Python\'da aynı iş, aynı imzaya sahip fonksiyonlar ve bir sözlükle çözülür.</p>
<pre class="py">from typing import Callable

Strateji = Callable[[float, str], float]   # (agirlik_kg, sehir) -&gt; ücret

def sabit(agirlik, sehir):
    return 49.90

def agirlik_bazli(agirlik, sehir):
    return 20 + 8 * agirlik

def bolgesel(agirlik, sehir):
    uzak = {'Hakkari', 'Kars', 'Van'}
    return agirlik_bazli(agirlik, sehir) * (1.5 if sehir in uzak else 1.0)

STRATEJILER: dict[str, Strateji] = {
    'sabit': sabit, 'agirlik': agirlik_bazli, 'bolgesel': bolgesel,
}

def kargo_ucreti(agirlik, sehir, strateji: str = 'agirlik'):
    hesapla = STRATEJILER[strateji]
    return round(hesapla(agirlik, sehir), 2)

for s in STRATEJILER:
    print(f'{s:&lt;9}', kargo_ucreti(3.5, 'Van', s))
</pre>
<div class="tip"><b>Kalıp gerekmeyen durum</b>Strateji, "davranışı parametre olarak geçir" demektir. Python\'da bu zaten <code>sorted(key=...)</code>, <code>map</code>, dekoratör ile her gün yaptığın şeydir. Stratejinin durumu (state) ve birden fazla metodu varsa o zaman sınıf (ya da Protocol) düşün.</div>

<h2>Fabrika ve kayıt (registry)</h2>
<p>Fabrika (factory), "hangi sınıfın üretileceğini" çağıran koddan gizler. Ilgaz Bank\'ta rapor türüne göre farklı dışa aktarıcı üretmek gibi. Python\'da en temiz biçim: bir sözlükte sınıfları tut, <code>__init_subclass__</code> ya da dekoratörle otomatik kaydet. Sınıflar zaten çağrılabilir olduğu için ayrı bir "Creator" hiyerarşisine gerek kalmaz.</p>
<pre class="py">import json, csv, io

KAYIT: dict[str, type] = {}

def disa_aktarici(format_adi):
    def kaydet(cls):
        KAYIT[format_adi] = cls
        return cls
    return kaydet

@disa_aktarici('json')
class JsonAktar:
    def yaz(self, satirlar):
        return json.dumps(satirlar, ensure_ascii=False)

@disa_aktarici('csv')
class CsvAktar:
    def yaz(self, satirlar):
        buf = io.StringIO()
        w = csv.DictWriter(buf, fieldnames=list(satirlar[0]))
        w.writeheader(); w.writerows(satirlar)
        return buf.getvalue().strip()

def aktarici_uret(format_adi: str):
    try:
        return KAYIT[format_adi]()
    except KeyError:
        raise ValueError(f'desteklenmeyen format: {format_adi!r}; seçenekler: {sorted(KAYIT)}')

veri = [{'hesap': 'TR01', 'bakiye': 1500.0}, {'hesap': 'TR02', 'bakiye': -20.5}]
for f in ('json', 'csv'):
    print(aktarici_uret(f).yaz(veri))
try:
    aktarici_uret('xml')
except ValueError as e:
    print(e)
</pre>

<h2>Gözlemci: olaylara abone olmak</h2>
<p>Gözlemci (observer), bir olay olduğunda ilgilenen herkese haber verir; yayıncı aboneleri tanımaz. Sipariş onaylanınca stok düşsün, e-posta gitsin, muhasebe kaydı açılsın. Python\'da abone bir fonksiyon, abone listesi de bir listedir.</p>
<pre class="py">from collections import defaultdict

class OlayYayini:
    def __init__(self):
        self._aboneler = defaultdict(list)

    def abone_ol(self, olay, fn=None):
        if fn is None:                 # @bus.abone_ol('olay') biçimi: dekoratör döndür
            return lambda f: self.abone_ol(olay, f)
        self._aboneler[olay].append(fn)
        return fn

    def yayinla(self, olay, **veri):
        for fn in self._aboneler[olay]:
            fn(**veri)

bus = OlayYayini()
stok = {'kahve': 10}

@bus.abone_ol('siparis_onay')
def stok_dus(urun, adet, **_):
    stok[urun] -= adet
    print(f'stok güncellendi: {urun}={stok[urun]}')

@bus.abone_ol('siparis_onay')
def eposta(musteri, **_):
    print(f'e-posta: {musteri} siparişiniz onaylandı')

bus.yayinla('siparis_onay', urun='kahve', adet=3, musteri='ayse@x.com')
bus.yayinla('iade', urun='kahve')     # abone yok, sessizce geçer
</pre>
<div class="warn"><b>Abone hataları</b>Bir abonenin fırlattığı istisna diğer abonelere ulaşmayı engeller. Üretim kodunda her aboneyi <code>try/except</code> ile sarıp loglamak, ya da hataları toplayıp sonunda raporlamak gerekir. Ayrıca abonelerin çağrı sırasına güvenme; sıraya bağımlılık varsa gözlemci yanlış kalıptır.</div>

<h2>Tekil (singleton) ve neden modül daha iyi</h2>
<p>Tekil, bir sınıftan yalnızca tek örnek olmasını garanti eder: yapılandırma, bağlantı havuzu, logger. Klasik gerçekleştirme <code>__new__</code> üzerinden yapılır. Ancak Python\'da her modül yalnızca bir kez yüklenir ve zaten tekildir: <code>config.py</code> içinde <code>AYARLAR = {...}</code> yazmak, aynı garantiyi sıfır kodla verir ve test ederken yerine sahte nesne koymak (monkeypatch) çok daha kolaydır.</p>
<pre class="py">class Ayarlar:
    _ornek = None
    def __new__(cls):
        if cls._ornek is None:
            cls._ornek = super().__new__(cls)
            cls._ornek.degerler = {'para_birimi': 'TRY'}
        return cls._ornek

a, b = Ayarlar(), Ayarlar()
print(a is b, a.degerler)

# Pythonic eşdeğer: modül düzeyinde tek nesne
import types
config = types.SimpleNamespace(para_birimi='TRY', kdv=0.20)
print(config.para_birimi, config.kdv)
</pre>
<div class="tbl-wrap"><table><tr><th>Kalıp</th><th>Çözdüğü sorun</th><th>Klasik biçim</th><th>Python\'da sade biçim</th></tr><tr><td>Strateji</td><td>Değiştirilebilir algoritma</td><td>Soyut sınıf + alt sınıflar</td><td>Fonksiyon sözlüğü, key=</td></tr><tr><td>Fabrika</td><td>Üretimi gizlemek</td><td>Creator hiyerarşisi</td><td>Kayıt sözlüğü + sınıf çağrısı</td></tr><tr><td>Gözlemci</td><td>Gevşek bağlı bildirim</td><td>Subject/Observer arayüzü</td><td>Fonksiyon listesi</td></tr><tr><td>Tekil</td><td>Tek örnek</td><td>__new__ ile kontrol</td><td>Modül düzeyi nesne</td></tr><tr><td>Adaptör</td><td>Uyumsuz arayüz</td><td>Sarmalayıcı sınıf</td><td>Sarmalayıcı sınıf ya da fonksiyon</td></tr><tr><td>Komut</td><td>İşlemi nesne yapmak, geri alma</td><td>execute/undo arayüzü</td><td>dataclass + Protocol</td></tr></table></div>

<h2>Adaptör: uyumsuz arayüzleri bağlamak</h2>
<p>Eski bir ödeme kütüphanesi <code>charge(amount_cents)</code> bekliyor, yeni kodun ise <code>tahsil_et(tutar_tl)</code> çağırıyor. Hiçbirini değiştirmeden ikisini bir adaptörle bağlarsın. Adaptör ince olmalı: dönüştür, yönlendir, bitir.</p>
<pre class="py">class EskiOdemeKutuphanesi:          # değiştiremediğin dış kod
    def charge(self, amount_cents: int) -&gt; dict:
        return {'ok': amount_cents &gt; 0, 'cents': amount_cents}

class OdemeAdaptoru:
    def __init__(self, eski):
        self._eski = eski
    def tahsil_et(self, tutar_tl: float) -&gt; bool:
        return self._eski.charge(round(tutar_tl * 100))['ok']

def siparisi_tamamla(saglayici, tutar):
    return 'tamam' if saglayici.tahsil_et(tutar) else 'reddedildi'

print(siparisi_tamamla(OdemeAdaptoru(EskiOdemeKutuphanesi()), 149.90))
print(siparisi_tamamla(OdemeAdaptoru(EskiOdemeKutuphanesi()), 0))
</pre>

<h2>Komut: işlemi nesne yapmak</h2>
<p>Komut (command) kalıbında her işlem; çalıştırılabilen ve geri alınabilen bir nesnedir. Geri al/yinele, işlem kuyruğu, denetim kaydı (audit log) için kullanılır. Ilgaz Bank\'ta hesap hareketlerini komut olarak modellemek, hatalı bir toplu işlemi tersine çevirmeyi mümkün kılar.</p>
<pre class="py">from dataclasses import dataclass, field

@dataclass
class YatirKomutu:
    hesaplar: dict
    hesap: str
    tutar: float
    def uygula(self):
        self.hesaplar[self.hesap] += self.tutar
    def geri_al(self):
        self.hesaplar[self.hesap] -= self.tutar

@dataclass
class TransferKomutu:
    hesaplar: dict
    kaynak: str
    hedef: str
    tutar: float
    def uygula(self):
        if self.hesaplar[self.kaynak] &lt; self.tutar:
            raise ValueError('yetersiz bakiye')
        self.hesaplar[self.kaynak] -= self.tutar
        self.hesaplar[self.hedef] += self.tutar
    def geri_al(self):
        self.hesaplar[self.hedef] -= self.tutar
        self.hesaplar[self.kaynak] += self.tutar

@dataclass
class Islemci:
    gecmis: list = field(default_factory=list)
    def calistir(self, komut):
        komut.uygula()
        self.gecmis.append(komut)
    def geri_al(self):
        if self.gecmis:
            self.gecmis.pop().geri_al()

h = {'TR01': 100.0, 'TR02': 0.0}
p = Islemci()
p.calistir(YatirKomutu(h, 'TR01', 50))
p.calistir(TransferKomutu(h, 'TR01', 'TR02', 120))
print(h)
p.geri_al(); print('transfer geri alındı:', h)
p.geri_al(); print('yatırma geri alındı:', h)
</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Kalıp seçiminde kurumsal refleksler</h3>
<p>Kod incelemelerinde en sık görülen kalıp hatası "fazla mimari"dir: üç satırlık bir koşul için strateji hiyerarşisi, iki format için fabrika sınıfı. Kuralı şöyle koy: kalıbı, aynı sorunu <b>ikinci kez</b> çözerken tanıt, birincide değil. Birinci sınıf fonksiyonlar, <code>functools.partial</code>, dataclass ve Protocol, klasik kalıpların büyük kısmını iki üç satıra indirir.</p>
<p>Buna karşılık bazı kalıplar Python\'da bile sınıf ister: komut (durum + geri alma), gözlemci (abone yönetimi, hata izolasyonu), adaptör (dış sistem sınırı). Bunların ortak noktası, kodun bir sınırda durmasıdır: dış kütüphane, ağ, veritabanı, kullanıcı etkileşimi. Sınırlarda açık arayüz (Protocol) tanımla; içeride sade fonksiyonlarla kal.</p>
<p>Testte kalıpların karşılığı: strateji sözlüğünü testte sahte fonksiyonla değiştir; gözlemcide aboneleri listeye toplayıp yayın sonrası kontrol et; komutlarda <code>uygula</code> + <code>geri_al</code> sonrası durumun başlangıca döndüğünü doğrula (round-trip testi). Tekil yerine modül düzeyi nesne kullanmanın en büyük getirisi de burada: <code>monkeypatch.setattr(config, 'kdv', 0)</code> ile tek satırda izole test.</p>
</section>`,
    ex: [
      { t: 'code', id: 'tasarim-kaliplari-1',
        q: '<p>Anadolu Market indirim stratejileri. Üç fonksiyon yaz: <code>yok(tutar)</code> tutarı döndürür; <code>yuzde10(tutar)</code> %10 indirir; <code>esik(tutar)</code> 500 ve üzerinde 50 TL düşer, altında aynen döndürür. Bunları <code>INDIRIMLER</code> sözlüğünde <code>\'yok\'</code>, <code>\'yuzde10\'</code>, <code>\'esik\'</code> anahtarlarıyla tut. <code>odenecek(tutar, strateji=\'yok\')</code> fonksiyonu sözlükten stratejiyi bulup sonucu 2 ondalığa yuvarlasın; bilinmeyen strateji için <code>ValueError</code> fırlatsın.</p>',
        start: 'def yok(tutar):\n    pass\n\n# yuzde10, esik, INDIRIMLER, odenecek\n',
        sol: 'def yok(tutar):\n    return tutar\n\ndef yuzde10(tutar):\n    return tutar * 0.9\n\ndef esik(tutar):\n    return tutar - 50 if tutar >= 500 else tutar\n\nINDIRIMLER = {\'yok\': yok, \'yuzde10\': yuzde10, \'esik\': esik}\n\ndef odenecek(tutar, strateji=\'yok\'):\n    if strateji not in INDIRIMLER:\n        raise ValueError(f\'bilinmeyen strateji: {strateji}\')\n    return round(INDIRIMLER[strateji](tutar), 2)\n',
        tests: 'assert odenecek(200) == 200, "Varsayılan strateji tutarı değiştirmemeli"\nassert abs(odenecek(199.9, \'yuzde10\') - 179.91) < 1e-6, "yuzde10 %10 indirmeli"\nassert odenecek(500, \'esik\') == 450 and odenecek(499, \'esik\') == 499, "esik 500 ve üzerinde 50 düşmeli"\nassert set(INDIRIMLER) == {\'yok\', \'yuzde10\', \'esik\'}, "INDIRIMLER anahtarları"\ntry:\n    odenecek(10, \'bilinmez\')\n    assert False, "Bilinmeyen strateji ValueError vermeli"\nexcept ValueError:\n    pass\n',
        hints: ['Sözlük değerleri fonksiyonun kendisi olmalı: yok, yok() değil.', 'odenecek içinde INDIRIMLER[strateji](tutar) çağrısı yap.'],
        why: 'Fonksiyonlar birinci sınıf olduğu için strateji kalıbı sözlük + çağrı ile biter; yeni strateji eklemek tek satırdır.' },
      { t: 'mc', q: 'Python\'da klasik tekil (singleton) sınıfı yerine modül düzeyi nesne önerilmesinin temel nedeni nedir?',
        o: ['Modüller daha hızlı yüklenir', 'Modül zaten tek kez yüklenir; testte değiştirmesi kolaydır', 'Sınıflar Python\'da tekil olamaz', 'Modül nesneleri değişmezdir'],
        a: 1, why: 'import sistemi bir modülü tek kez yükler ve sys.modules\'da tutar; bu zaten tekil garantisidir. Ayrıca modül öznitelikleri monkeypatch ile kolayca değiştirilir. Diğer seçenekler yanlış iddialardır.' },
      { t: 'code', id: 'tasarim-kaliplari-3',
        q: '<p>Kayıt tabanlı fabrika. <code>KAYIT</code> adlı boş sözlük ve <code>rapor(ad)</code> adlı sınıf dekoratörü yaz: dekoratör sınıfı <code>KAYIT[ad]</code> olarak kaydedip sınıfı aynen döndürsün. Sonra <code>@rapor(\'ozet\')</code> ile <code>OzetRapor</code> (metot <code>uret(self, satirlar)</code> -> <code>f\'{len(satirlar)} satır\'</code>) ve <code>@rapor(\'toplam\')</code> ile <code>ToplamRapor</code> (<code>uret</code> -> satırlardaki <code>\'tutar\'</code> toplamı, float) tanımla. <code>rapor_uret(ad)</code> ilgili sınıfın yeni örneğini döndürsün; yoksa <code>KeyError</code>.</p>',
        start: 'KAYIT = {}\n\ndef rapor(ad):\n    pass\n\n# OzetRapor, ToplamRapor, rapor_uret\n',
        sol: 'KAYIT = {}\n\ndef rapor(ad):\n    def kaydet(cls):\n        KAYIT[ad] = cls\n        return cls\n    return kaydet\n\n@rapor(\'ozet\')\nclass OzetRapor:\n    def uret(self, satirlar):\n        return f\'{len(satirlar)} satır\'\n\n@rapor(\'toplam\')\nclass ToplamRapor:\n    def uret(self, satirlar):\n        return float(sum(s[\'tutar\'] for s in satirlar))\n\ndef rapor_uret(ad):\n    return KAYIT[ad]()\n',
        tests: 'veri = [{\'tutar\': 10.5}, {\'tutar\': 4.5}]\nassert set(KAYIT) == {\'ozet\', \'toplam\'}, "Dekoratör iki sınıfı kaydetmeli"\nassert KAYIT[\'ozet\'] is OzetRapor, "Dekoratör sınıfı aynen döndürmeli"\nassert rapor_uret(\'ozet\').uret(veri) == \'2 satır\', "OzetRapor satır sayısı"\nassert abs(rapor_uret(\'toplam\').uret(veri) - 15.0) < 1e-6, "ToplamRapor toplam"\nassert rapor_uret(\'ozet\') is not rapor_uret(\'ozet\'), "Her çağrı yeni örnek üretmeli"\ntry:\n    rapor_uret(\'yok\')\n    assert False, "Kayıtsız ad KeyError vermeli"\nexcept KeyError:\n    pass\n',
        hints: ['Parametreli dekoratör iki katmanlı: rapor(ad) -> kaydet(cls) -> cls.', 'rapor_uret içinde KAYIT[ad]() ile örnek üret.'],
        why: 'Sınıflar çağrılabilir olduğundan fabrika bir sözlük aramasına iner; dekoratör kaydı tanım yerinde tutar, merkezi if/elif zincirine gerek kalmaz.' },
      { t: 'code', id: 'tasarim-kaliplari-4',
        q: '<p><code>OlayYayini</code> sınıfı yaz: <code>abone_ol(olay, fn)</code> fonksiyonu kaydeder ve fn\'i döndürür; <code>yayinla(olay, **veri)</code> o olayın tüm abonelerini sırayla <code>fn(**veri)</code> ile çağırır. Bir abone istisna fırlatırsa diğerleri yine çağrılmalı; yayinla, fırlatılan istisnaların listesini döndürsün (hata yoksa boş liste).</p>',
        start: 'from collections import defaultdict\n\nclass OlayYayini:\n    def __init__(self):\n        self._aboneler = defaultdict(list)\n    # abone_ol, yayinla\n',
        sol: 'from collections import defaultdict\n\nclass OlayYayini:\n    def __init__(self):\n        self._aboneler = defaultdict(list)\n\n    def abone_ol(self, olay, fn):\n        self._aboneler[olay].append(fn)\n        return fn\n\n    def yayinla(self, olay, **veri):\n        hatalar = []\n        for fn in self._aboneler[olay]:\n            try:\n                fn(**veri)\n            except Exception as e:\n                hatalar.append(e)\n        return hatalar\n',
        tests: 'bus = OlayYayini()\nlog = []\nbus.abone_ol(\'siparis\', lambda **v: log.append((\'a\', v[\'no\'])))\ndef bozuk(**v):\n    raise RuntimeError(\'patladı\')\nbus.abone_ol(\'siparis\', bozuk)\nf = bus.abone_ol(\'siparis\', lambda **v: log.append((\'c\', v[\'no\'])))\nassert callable(f), "abone_ol fonksiyonu geri döndürmeli"\nhatalar = bus.yayinla(\'siparis\', no=7)\nassert log == [(\'a\', 7), (\'c\', 7)], "Hatalı abone diğerlerini engellememeli"\nassert len(hatalar) == 1 and isinstance(hatalar[0], RuntimeError), "Hatalar listede dönmeli"\nassert bus.yayinla(\'yok\') == [], "Abonesi olmayan olay boş liste döndürmeli"\n',
        hints: ['Her aboneyi try/except Exception ile sar; istisnayı listeye ekle.', 'defaultdict(list) sayesinde olmayan olay için boş liste döner.'],
        why: 'Gözlemci kalıbında hata izolasyonu kritiktir: bir abonenin çökmesi diğer iş kurallarını atlatmamalı. Hataları döndürmek çağırana karar hakkı verir.' },
      { t: 'mc', q: 'Komut (command) kalıbının en belirgin faydası hangisi?',
        o: ['Daha az bellek kullanımı', 'Nesne üretimini gizlemek', 'İşlemleri geri alınabilir ve kuyruklanabilir nesneler yapmak', 'Arayüz uyumsuzluğunu gidermek'],
        a: 2, why: 'Komut, her işlemi uygula/geri_al metotlu bir nesne yapar; böylece geçmiş tutma, geri alma, kuyruk ve denetim kaydı kolaylaşır. Üretimi gizlemek fabrika, uyumsuzluk adaptör konusudur.' },
      { t: 'code', id: 'tasarim-kaliplari-6',
        q: '<p>Ilgaz Bank için komut kalıbı. <code>CekKomutu(hesaplar, hesap, tutar)</code> dataclass\'ı: <code>uygula()</code> bakiye yetersizse <code>ValueError</code> fırlatıp hiçbir şey değiştirmesin, yeterliyse düşsün; <code>geri_al()</code> tutarı geri eklesin. <code>Islemci</code> sınıfı: <code>calistir(komut)</code> uygula\'yı çağırıp başarılıysa geçmişe eklesin (hata fırlarsa geçmişe eklemeden hatayı yeniden fırlatsın), <code>geri_al()</code> son komutu geri alsın ve döndürsün (geçmiş boşsa None), <code>gecmis</code> listesi dışarıdan okunabilsin.</p>',
        start: 'from dataclasses import dataclass, field\n\n@dataclass\nclass CekKomutu:\n    hesaplar: dict\n    hesap: str\n    tutar: float\n    # uygula, geri_al\n\n@dataclass\nclass Islemci:\n    gecmis: list = field(default_factory=list)\n    # calistir, geri_al\n',
        sol: 'from dataclasses import dataclass, field\n\n@dataclass\nclass CekKomutu:\n    hesaplar: dict\n    hesap: str\n    tutar: float\n\n    def uygula(self):\n        if self.hesaplar[self.hesap] < self.tutar:\n            raise ValueError(\'yetersiz bakiye\')\n        self.hesaplar[self.hesap] -= self.tutar\n\n    def geri_al(self):\n        self.hesaplar[self.hesap] += self.tutar\n\n@dataclass\nclass Islemci:\n    gecmis: list = field(default_factory=list)\n\n    def calistir(self, komut):\n        komut.uygula()\n        self.gecmis.append(komut)\n\n    def geri_al(self):\n        if not self.gecmis:\n            return None\n        k = self.gecmis.pop()\n        k.geri_al()\n        return k\n',
        tests: 'h = {\'TR01\': 100.0}\np = Islemci()\np.calistir(CekKomutu(h, \'TR01\', 30))\nassert h[\'TR01\'] == 70 and len(p.gecmis) == 1, "Çekim bakiyeyi düşürmeli ve geçmişe girmeli"\ntry:\n    p.calistir(CekKomutu(h, \'TR01\', 500))\n    assert False, "Yetersiz bakiye ValueError vermeli"\nexcept ValueError:\n    pass\nassert h[\'TR01\'] == 70 and len(p.gecmis) == 1, "Başarısız komut bakiye ve geçmişi değiştirmemeli"\nk = p.geri_al()\nassert isinstance(k, CekKomutu) and h[\'TR01\'] == 100, "geri_al son komutu tersine çevirmeli"\nassert p.geri_al() is None, "Boş geçmişte None dönmeli"\n',
        hints: ['uygula içinde önce kontrol, sonra değişiklik: hata durumunda durum bozulmasın.', 'calistir\'da uygula başarılı olduktan sonra append yap.'],
        why: 'Komut nesnesi hem işlemi hem tersini taşır; Islemci yalnızca sıralamayı bilir. Başarısız komutun geçmişe girmemesi geri alma zincirini tutarlı tutar.' },
      { t: 'code', id: 'tasarim-kaliplari-7',
        q: '<p>Adaptör. Verilen <code>EskiSmsServisi.send(self, to: str, body: str) -> int</code> (gönderilen karakter sayısını döndürür) sınıfını değiştirmeden, <code>SmsAdaptoru(eski)</code> sınıfı yaz: <code>gonder(self, telefon: str, mesaj: str) -> bool</code>. Telefon numarasındaki boşluk ve tireleri temizleyip <code>+90</code> ile başlamıyorsa başına eklesin, eski servisi çağırsın ve dönen sayı 0\'dan büyükse True döndürsün. Ayrıca adaptör son gönderilen numarayı <code>son_numara</code> özniteliğinde tutsun.</p>',
        start: 'class EskiSmsServisi:\n    def send(self, to: str, body: str) -> int:\n        return len(body) if to.startswith(\'+\') else 0\n\nclass SmsAdaptoru:\n    def __init__(self, eski):\n        self._eski = eski\n        self.son_numara = None\n    # gonder\n',
        sol: 'class EskiSmsServisi:\n    def send(self, to: str, body: str) -> int:\n        return len(body) if to.startswith(\'+\') else 0\n\nclass SmsAdaptoru:\n    def __init__(self, eski):\n        self._eski = eski\n        self.son_numara = None\n\n    def gonder(self, telefon: str, mesaj: str) -> bool:\n        tel = telefon.replace(\' \', \'\').replace(\'-\', \'\')\n        if not tel.startswith(\'+90\'):\n            tel = \'+90\' + tel.lstrip(\'0\')\n        self.son_numara = tel\n        return self._eski.send(tel, mesaj) > 0\n',
        tests: 'a = SmsAdaptoru(EskiSmsServisi())\nassert a.gonder(\'0532 111-22-33\', \'Kodunuz 4821\') is True, "Geçerli gönderim True dönmeli"\nassert a.son_numara == \'+905321112233\', "Numara temizlenip +90 ile başlamalı"\nassert a.gonder(\'+90 532 000 00 00\', \'x\') is True and a.son_numara == \'+905320000000\', "+90 ile başlayan numara tekrar eklenmemeli"\nassert a.gonder(\'5321112233\', \'\') is False, "Boş mesaj 0 karakter -> False"\n',
        hints: ['Boşluk ve tireyi replace ile kaldır.', 'Başta 0 varsa kırp: tel.lstrip(\'0\'), sonra +90 ekle.'],
        why: 'Adaptör yalnızca biçim dönüştürür ve yönlendirir; eski servis ve yeni kod birbirinden habersiz kalır, ikisi de değişmez.' }
    ],
    faq: [
      { q: 'Kalıpları ezberlemeli miyim?', a: 'İsimlerini ve çözdükleri sorunu bil; ekip içinde ortak dil sağlar. Gerçekleştirme biçimi dile göre değişir; Python\'da çoğu kalıp fonksiyon ve sözlükle sadeleşir.' },
      { q: 'Strateji için sınıf mı fonksiyon mu?', a: 'Tek metot ve durum yoksa fonksiyon. Stratejinin yapılandırması, birden fazla metodu ya da tutması gereken durumu varsa sınıf (ve parametre tipi olarak Protocol).' },
      { q: 'Gözlemci yerine ne zaman kuyruk kullanmalıyım?', a: 'Aboneler ağır iş yapıyorsa, süreç dışına çıkıyorsa ya da yeniden deneme gerekiyorsa mesaj kuyruğu (Celery, RabbitMQ, Kafka) uygundur. Süreç içi, hafif ve senkron bildirimlerde liste tabanlı gözlemci yeter.' }
    ],
    mistakes: [
      { bad: 'if tur == \'json\': return JsonAktar()\nelif tur == \'csv\': return CsvAktar()\nelif ...', good: 'KAYIT = {\'json\': JsonAktar, \'csv\': CsvAktar}\nreturn KAYIT[tur]()', why: 'Uzun if/elif zinciri her yeni tür için değiştirilmek zorunda; sözlük kaydı açık-kapalı ilkesine uyar.' },
      { bad: 'class Strateji(ABC): ...\nclass Sabit(Strateji): ...\nclass Agirlik(Strateji): ...\n# her biri tek metot', good: 'STRATEJILER = {\'sabit\': sabit, \'agirlik\': agirlik_bazli}', why: 'Durumsuz tek metotlu sınıflar fonksiyonla aynı işi yapar; hiyerarşi gereksiz yük ekler.' },
      { bad: 'for fn in aboneler:\n    fn(**veri)  # ilk hata zinciri keser', good: 'for fn in aboneler:\n    try:\n        fn(**veri)\n    except Exception as e:\n        hatalar.append(e)', why: 'Gözlemcide bir abonenin hatası diğer iş kurallarının atlanmasına yol açmamalı.' }
    ]
  }
);
})(window);
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{ id: 'tip-sistemi-ileri', lv: 'ileri', mod: 'Mimari', min: 40,
    title: 'İleri tip sistemi: Generic, Protocol, TypedDict ve mypy',
    sum: 'Generic/TypeVar, Protocol, Literal, TypedDict, overload, NewType, Callable ve ParamSpec ile kodun sözleşmesini yaz; mypy/pyright\'ın nasıl çalıştığını ve strict modu öğren.',
    goals: ['TypeVar ve Generic ile türü koruyan konteyner ve fonksiyon yazabilirim', 'Literal, TypedDict ve NewType ile sözlük ve kimlik türlerini kesinleştirebilirim', 'overload ile girdiye göre değişen dönüş tipini bildirebilirim', 'Callable ve ParamSpec ile dekoratörün imzasını koruyabilirim', 'mypy/pyright\'ın çalışma mantığını ve strict modun ne denetlediğini açıklayabilirim'],
    body: `<h2>Neden önemli?</h2>
<p>Orta seviyede tip ipuçlarını (type hints) belgeleme aracı olarak kullandın. Kurumsal projelerde ipuçları bundan fazlasıdır: CI\'da çalışan <code>mypy</code> ya da <code>pyright</code>, kod çalışmadan önce "bu fonksiyona None gelebilir" ya da "bu sözlükte böyle bir anahtar yok" der. Ilgaz Bank\'ta bir müşteri numarasıyla hesap numarasını karıştıran kod, test edilmediyse üretimde patlar; <code>NewType</code> ile bu karışıklık derleme-benzeri aşamada yakalanır. Bu ders, tip sistemini bir sözleşme dili olarak kullanmayı öğretir. Unutma: Python çalışma zamanında ipuçlarını <b>denetlemez</b>; bu yüzden alıştırmalarda ipuçlarını <code>typing.get_type_hints</code> ve <code>inspect.signature</code> ile okuyarak kendimiz kontrol edeceğiz.</p>

<h2>TypeVar ve Generic</h2>
<p>Bir fonksiyon "ne verirsen onu döndürür" diyorsa <code>Any</code> yazmak bilgiyi kaybettirir. <code>TypeVar</code>, "burada bir tür var, adı T, giriş ve çıkışta aynı" der. Sınıfları da generic yapabilirsin: <code>Stack[int]</code>. Python 3.12 ile <code>def ilk[T](...)</code> ve <code>class Stack[T]:</code> kısa sözdizimi geldi; eski sözdizimini de tanıman gerekir çünkü kurumsal kodun çoğu onunla yazıldı.</p>
<pre class="py">from typing import TypeVar, Generic, get_type_hints

T = TypeVar('T')

def ilk(dizi: list[T], varsayilan: T) -&gt; T:
    return dizi[0] if dizi else varsayilan

class Stack(Generic[T]):
    def __init__(self) -&gt; None:
        self._v: list[T] = []
    def push(self, x: T) -&gt; None:
        self._v.append(x)
    def pop(self) -&gt; T:
        return self._v.pop()
    def __len__(self) -&gt; int:
        return len(self._v)

# Python 3.12 kısa sözdizimi
def son[U](dizi: list[U]) -&gt; U:
    return dizi[-1]

s: Stack[str] = Stack()
s.push('TR01'); s.push('TR02')
print(s.pop(), len(s))
print(ilk([], 0), ilk([3.5], 0.0), son(['a', 'b']))
print(get_type_hints(ilk))          # çalışma zamanında ipuçlarını oku
</pre>
<div class="note"><b>Sınırlı TypeVar</b><code>TypeVar('N', int, float)</code> yalnızca bu türlere izin verir; <code>TypeVar('C', bound=Comparable)</code> ise "bu Protocol\'ü sağlayan her tür" der. <code>sorted</code> benzeri fonksiyonlar bound ile yazılır.</div>

<h2>Literal, TypedDict, NewType</h2>
<p><code>Literal['TRY', 'USD']</code> bir parametrenin yalnızca belirli değerleri alabileceğini söyler; enum kadar ağır değildir. <code>TypedDict</code> JSON\'dan gelen sözlüklerin anahtarlarını ve tiplerini tanımlar; mypy yanlış anahtarı yakalar, çalışma zamanında ise sıradan <code>dict</code>\'tir. <code>NewType</code> aynı temel türden ayrı kimlikler üretir: <code>MusteriNo</code> ve <code>HesapNo</code> ikisi de <code>int</code> olsa bile birbirinin yerine geçemez.</p>
<pre class="py">from typing import Literal, TypedDict, NewType, NotRequired

ParaBirimi = Literal['TRY', 'USD', 'EUR']
MusteriNo = NewType('MusteriNo', int)
HesapNo = NewType('HesapNo', int)

class Islem(TypedDict):
    hesap: HesapNo
    tutar: float
    birim: ParaBirimi
    aciklama: NotRequired[str]        # isteğe bağlı anahtar

def bakiye_etkisi(i: Islem) -&gt; float:
    kur = {'TRY': 1.0, 'USD': 1.0, 'EUR': 1.0}   # örnek
    return i['tutar'] * kur[i['birim']]

i: Islem = {'hesap': HesapNo(1001), 'tutar': 250.0, 'birim': 'TRY'}
print(bakiye_etkisi(i), type(i).__name__)
print(Islem.__required_keys__, Islem.__optional_keys__)
m = MusteriNo(1001)
print(m == 1001, type(m))             # çalışma zamanında sıradan int
</pre>
<div class="warn"><b>Çalışma zamanı denetlemez</b><code>{'hesap': 1, 'tutar': 'yüz', 'birim': 'XXX'}</code> yazsan Python ses çıkarmaz; yalnızca mypy uyarır. Dış veriyi (API, dosya) gerçekten doğrulamak için pydantic ya da elle kontrol gerekir; TypedDict bir niyet beyanıdır.</div>

<h2>overload: girdiye göre dönüş tipi</h2>
<p>Bir fonksiyon <code>str</code> alınca <code>str</code>, <code>list[str]</code> alınca <code>list[str]</code> döndürüyorsa tek imza bunu anlatamaz. <code>@overload</code> ile "görünür imzaları" sıralar, en sonda gerçek gerçekleştirmeyi yazarsın. Overload gövdeleri <code>...</code> olur; çalışma zamanında yalnızca son tanım kalır.</p>
<pre class="py">from typing import overload

@overload
def normalize(x: str) -&gt; str: ...
@overload
def normalize(x: list[str]) -&gt; list[str]: ...
def normalize(x):
    if isinstance(x, str):
        return x.strip().lower()
    return [s.strip().lower() for s in x]

print(normalize('  AYŞE '), normalize([' A', 'b ']))
</pre>

<h2>Callable ve ParamSpec</h2>
<p><code>Callable[[int, str], bool]</code> "int ve str alıp bool döndüren" fonksiyon tipidir. Dekoratör yazarken sorun şudur: <code>Callable[..., T]</code> dönüş tipini korur ama parametre bilgisini yutar; editör artık yanlış argümanı göremez. <code>ParamSpec</code> parametre listesini bir değişken gibi taşır ve dekoratör imzayı olduğu gibi aktarır.</p>
<pre class="py">from typing import Callable, ParamSpec, TypeVar
from functools import wraps
import inspect

P = ParamSpec('P')
R = TypeVar('R')

def logla(fn: Callable[P, R]) -&gt; Callable[P, R]:
    @wraps(fn)
    def sarmal(*args: P.args, **kwargs: P.kwargs) -&gt; R:
        print(f'-&gt; {fn.__name__}{args}{kwargs or ""}')
        return fn(*args, **kwargs)
    return sarmal

@logla
def faiz(anapara: float, oran: float, ay: int = 12) -&gt; float:
    return round(anapara * oran * ay / 12, 2)

print(faiz(10_000, 0.3, ay=6))
print(inspect.signature(faiz))       # wraps sayesinde imza korunur
</pre>

<h2>mypy ve pyright nasıl çalışır?</h2>
<p>Her iki araç da kodu çalıştırmaz; kaynak dosyayı ayrıştırır, her ifadenin tipini <b>çıkarım</b> (inference) ile bulur ve ipuçlarıyla tutarsızlıkları raporlar. İpucu olmayan fonksiyon mypy için varsayılan olarak denetlenmez; <code>--strict</code> bunu değiştirir. Sık karşılaşılan bayraklar:</p>
<div class="tbl-wrap"><table><tr><th>Bayrak / ayar</th><th>Ne denetler</th><th>Tipik hata</th></tr><tr><td>disallow_untyped_defs</td><td>Her fonksiyon ipuçlu olmalı</td><td>Function is missing a type annotation</td></tr><tr><td>no_implicit_optional</td><td>Varsayılan None ise tip Optional olmalı</td><td>Incompatible default for argument</td></tr><tr><td>warn_return_any</td><td>Any döndüren fonksiyon uyarır</td><td>Returning Any from function</td></tr><tr><td>strict_equality</td><td>Asla eşit olamayacak türleri karşılaştırma</td><td>Non-overlapping equality check</td></tr><tr><td>warn_unused_ignores</td><td>Gereksiz # type: ignore</td><td>Unused "type: ignore" comment</td></tr></table></div>
<p><code>pyproject.toml</code> içinde <code>[tool.mypy] strict = true</code> ile hepsi açılır. Pyright (VS Code\'daki Pylance) daha katı çıkarım yapar ve daha hızlıdır; ekipler genelde birini CI\'da zorunlu kılar. Dar daraltma (narrowing) kavramını öğren: <code>if x is None: return</code> satırından sonra denetleyici <code>x</code>\'in artık None olmadığını bilir; <code>isinstance</code>, <code>in</code>, <code>assert</code> ve <code>match</code> de daraltır.</p>
<pre class="py">from typing import TypeGuard, assert_never, Literal

Durum = Literal['acik', 'kapali', 'askida']

def pozitif_floatlar(v: list[object]) -&gt; TypeGuard[list[float]]:
    return all(isinstance(x, (int, float)) and x &gt; 0 for x in v)

def etiket(d: Durum) -&gt; str:
    match d:
        case 'acik': return 'Aktif'
        case 'kapali': return 'Kapalı'
        case 'askida': return 'Askıda'
        case _: assert_never(d)      # yeni değer eklenirse mypy uyarır

veri: list[object] = [1.5, 2, 3.0]
if pozitif_floatlar(veri):
    print(sum(veri))                 # artık list[float]
print(etiket('askida'))
</pre>
<div class="tip"><b>Aşamalı sıkılaştırma</b>Büyük eski kod tabanında strict\'i bir anda açma. Önce <code>check_untyped_defs</code>, sonra modül modül <code>disallow_untyped_defs</code>; her adımda hata sayısını CI\'da ölç. Şu an geçmeyen dosyaları <code>[[tool.mypy.overrides]]</code> ile geçici muaf tut.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Tipleri sözleşme olarak kullanmak</h3>
<p>Olgun ekiplerde tip ipuçları belgelemeden çok tasarım aracıdır. Bir fonksiyon <code>dict[str, Any]</code> alıyorsa bu genelde "şeklini bilmiyorum" itirafıdır; TypedDict ya da dataclass\'a çevirmek sorunun yarısını çözer. <code>Optional</code> parametre çokluğu fonksiyonun iki iş yaptığına işarettir. <code>NewType</code> ile kimlikleri ayırmak, Ilgaz Bank örneğindeki gibi "müşteri no yerine hesap no gönderme" hatasını tamamen ortadan kaldırır.</p>
<p>Variance (değişinti) konusunu bil: <code>list[int]</code>, <code>list[float]</code>\'ın alt türü <b>değildir</b> (liste değişebilir, invariant); ama <code>Sequence[int]</code>, <code>Sequence[float]</code> yerine geçer (salt okunur, covariant). Parametre tiplerinde olabildiğince genel soyut tip (<code>Sequence</code>, <code>Mapping</code>, <code>Iterable</code>), dönüşte somut tip (<code>list</code>, <code>dict</code>) kullanmak bu sorunların çoğunu önler.</p>
<p>Çalışma zamanı doğrulaması gerekiyorsa pydantic, TypedDict\'in doğal devamıdır: aynı alan tanımı hem denetleyiciye hem çalışma zamanına hizmet eder. Ancak iç fonksiyonlarda doğrulama tekrarı maliyetlidir; doğrulamayı sınırda (API girişi, dosya okuma) yap, içeride tiplere güven.</p>
</section>`,
    ex: [
      { t: 'code', id: 'tip-sistemi-ileri-1',
        q: '<p>Generic <code>Kuyruk</code> sınıfı yaz: <code>class Kuyruk(Generic[T])</code>. Metotlar: <code>ekle(self, x: T) -> None</code>, <code>al(self) -> T</code> (en eski elemanı çıkarır; boşsa <code>IndexError</code>), <code>__len__(self) -> int</code>. Tip ipuçları zorunlu: testler <code>get_type_hints</code> ile <code>ekle</code>\'nin <code>x</code> parametresinin <code>T</code>, <code>al</code>\'ın dönüşünün <code>T</code> olduğunu kontrol edecek.</p>',
        start: 'from typing import TypeVar, Generic, get_type_hints\nfrom collections import deque\n\nT = TypeVar(\'T\')\n\nclass Kuyruk(Generic[T]):\n    pass\n',
        sol: 'from typing import TypeVar, Generic, get_type_hints\nfrom collections import deque\n\nT = TypeVar(\'T\')\n\nclass Kuyruk(Generic[T]):\n    def __init__(self) -> None:\n        self._d: deque[T] = deque()\n\n    def ekle(self, x: T) -> None:\n        self._d.append(x)\n\n    def al(self) -> T:\n        if not self._d:\n            raise IndexError(\'kuyruk boş\')\n        return self._d.popleft()\n\n    def __len__(self) -> int:\n        return len(self._d)\n',
        tests: 'k: Kuyruk[str] = Kuyruk()\nk.ekle(\'a\'); k.ekle(\'b\')\nassert len(k) == 2, "__len__ eleman sayısı"\nassert k.al() == \'a\' and k.al() == \'b\', "al FIFO sırasıyla vermeli"\ntry:\n    k.al()\n    assert False, "Boş kuyrukta IndexError"\nexcept IndexError:\n    pass\nh = get_type_hints(Kuyruk.ekle)\nassert h.get(\'x\') is T, "ekle parametresi T tipinde olmalı"\nassert get_type_hints(Kuyruk.al).get(\'return\') is T, "al dönüşü T olmalı"\nassert get_type_hints(Kuyruk.__len__).get(\'return\') is int, "__len__ dönüşü int olmalı"\nfrom typing import Generic as _G\nassert _G in Kuyruk.__mro__, "Kuyruk Generic[T] türetmeli"\n',
        hints: ['collections.deque ile popleft O(1).', 'Her metoda parametre ve dönüş ipucu yaz; T değişkenini kullan.'],
        why: 'Generic[T] sınıfın içindeki T\'yi dışarıdan verilen türe bağlar; Kuyruk[str] için denetleyici al() sonucunun str olduğunu bilir.' },
      { t: 'mc', q: '<code>TypedDict</code> ile tanımlanmış bir sözlüğe yanlış tipte değer atarsan çalışma zamanında ne olur?',
        o: ['TypeError fırlatılır', 'Hiçbir şey olmaz; yalnızca statik denetleyici uyarır', 'Değer otomatik dönüştürülür', 'KeyError fırlatılır'],
        a: 1, why: 'TypedDict çalışma zamanında sıradan dict\'tir; tip bilgisi yalnızca mypy/pyright içindir. Gerçek doğrulama için pydantic ya da elle kontrol gerekir.' },
      { t: 'code', id: 'tip-sistemi-ileri-3',
        q: '<p><code>MusteriNo = NewType(\'MusteriNo\', int)</code> ve <code>HesapNo = NewType(\'HesapNo\', int)</code> tanımla. <code>class Hesap(TypedDict)</code>: <code>no: HesapNo</code>, <code>sahip: MusteriNo</code>, <code>bakiye: float</code>. Fonksiyon <code>musteri_toplam(hesaplar: list[Hesap], m: MusteriNo) -> float</code>: m\'ye ait hesapların bakiye toplamını döndürsün. İpuçları tam olmalı (testler get_type_hints ile bakacak).</p>',
        start: 'from typing import NewType, TypedDict, get_type_hints\n\n# MusteriNo, HesapNo, Hesap, musteri_toplam\n',
        sol: 'from typing import NewType, TypedDict, get_type_hints\n\nMusteriNo = NewType(\'MusteriNo\', int)\nHesapNo = NewType(\'HesapNo\', int)\n\nclass Hesap(TypedDict):\n    no: HesapNo\n    sahip: MusteriNo\n    bakiye: float\n\ndef musteri_toplam(hesaplar: list[Hesap], m: MusteriNo) -> float:\n    return float(sum(h[\'bakiye\'] for h in hesaplar if h[\'sahip\'] == m))\n',
        tests: 'hs = [\n    {\'no\': HesapNo(1), \'sahip\': MusteriNo(10), \'bakiye\': 100.0},\n    {\'no\': HesapNo(2), \'sahip\': MusteriNo(10), \'bakiye\': 50.5},\n    {\'no\': HesapNo(3), \'sahip\': MusteriNo(11), \'bakiye\': 999.0},\n]\nassert abs(musteri_toplam(hs, MusteriNo(10)) - 150.5) < 1e-6, "Müşteri 10 toplamı 150.5"\nassert musteri_toplam(hs, MusteriNo(99)) == 0, "Hesabı olmayan müşteri 0"\nassert MusteriNo.__supertype__ is int and HesapNo.__supertype__ is int, "NewType int tabanlı olmalı"\nassert set(Hesap.__annotations__) == {\'no\', \'sahip\', \'bakiye\'}, "Hesap alanları"\nh = get_type_hints(musteri_toplam)\nassert h[\'m\'] is MusteriNo and h[\'return\'] is float, "musteri_toplam ipuçları"\nassert h[\'hesaplar\'] == list[Hesap], "hesaplar: list[Hesap] olmalı"\n',
        hints: ['NewType çağrısı bir fonksiyon gibi davranır: MusteriNo(10) int döndürür.', 'Toplamı float() ile sarmala ki boş durumda da float dönsün.'],
        why: 'NewType statik düzeyde iki int\'i ayırır; TypedDict JSON benzeri yapının şeklini belgeler. İkisi de çalışma zamanında maliyetsizdir.' },
      { t: 'code', id: 'tip-sistemi-ileri-4',
        q: '<p><code>@overload</code> ile <code>tl(x)</code> fonksiyonunu yaz: <code>float</code> alınca <code>str</code> döndürür (<code>f\'{x:,.2f} TL\'</code>), <code>list[float]</code> alınca <code>list[str]</code> döndürür (her eleman aynı biçimde). Overload imzaları + gerçek gerçekleştirme olmak üzere üç tanım olsun. Testler <code>typing.get_overloads</code> ile iki overload kaydedildiğini kontrol edecek.</p>',
        start: 'from typing import overload, get_overloads\n\n# tl overload\'ları ve gerçekleştirme\n',
        sol: 'from typing import overload, get_overloads\n\n@overload\ndef tl(x: float) -> str: ...\n@overload\ndef tl(x: list[float]) -> list[str]: ...\ndef tl(x):\n    if isinstance(x, list):\n        return [tl(v) for v in x]\n    return f\'{x:,.2f} TL\'\n',
        tests: 'assert tl(1234.5) == \'1,234.50 TL\', "float -> biçimli str"\nassert tl([1.0, 20.25]) == [\'1.00 TL\', \'20.25 TL\'], "list -> list[str]"\nassert tl([]) == [], "Boş liste boş liste"\novs = get_overloads(tl)\nassert len(ovs) == 2, "İki overload kaydedilmeli"\nfrom typing import get_type_hints\ndonusler = {get_type_hints(o)[\'return\'] for o in ovs}\nassert str in donusler and list[str] in donusler, "Overload dönüş tipleri str ve list[str]"\n',
        hints: ['Overload gövdeleri yalnızca ... olsun.', 'Gerçek gerçekleştirmede isinstance(x, list) ile ayır.'],
        why: 'Overload denetleyiciye "görünür imzaları" sunar; Python 3.11+ get_overloads ile bunlar çalışma zamanında da okunabilir. Gerçekleştirme tek ve dinamiktir.' },
      { t: 'mc', q: 'Dekoratörde <code>Callable[..., R]</code> yerine <code>ParamSpec</code> kullanmanın kazancı nedir?',
        o: ['Dekoratör daha hızlı çalışır', 'Sarmalanan fonksiyonun parametre imzası tip denetleyicide korunur', 'functools.wraps\'e gerek kalmaz', 'Dönüş tipi otomatik Any olur'],
        a: 1, why: 'ParamSpec parametre listesini taşır; böylece dekore edilmiş fonksiyona yanlış argüman verildiğinde mypy/pyright yakalar. Çalışma zamanı hızıyla ilgisi yok; wraps hâlâ __name__ ve imza için gerekir.' },
      { t: 'code', id: 'tip-sistemi-ileri-6',
        q: '<p><code>ParamSpec</code> ve <code>TypeVar</code> ile <code>sayac</code> dekoratörü yaz: <code>def sayac(fn: Callable[P, R]) -> Callable[P, R]</code>. Dekore edilen fonksiyon her çağrıldığında <code>sarmal.cagri</code> sayacı artsın; <code>functools.wraps</code> kullan. Sonra <code>@sayac</code> ile <code>komisyon(tutar: float, oran: float = 0.01) -> float</code> fonksiyonunu tanımla (<code>round(tutar * oran, 2)</code>). Testler <code>inspect.signature</code> ile imzanın korunduğunu kontrol edecek.</p>',
        start: 'from typing import Callable, ParamSpec, TypeVar\nfrom functools import wraps\nimport inspect\n\nP = ParamSpec(\'P\')\nR = TypeVar(\'R\')\n\n# sayac ve komisyon\n',
        sol: 'from typing import Callable, ParamSpec, TypeVar\nfrom functools import wraps\nimport inspect\n\nP = ParamSpec(\'P\')\nR = TypeVar(\'R\')\n\ndef sayac(fn: Callable[P, R]) -> Callable[P, R]:\n    @wraps(fn)\n    def sarmal(*args: P.args, **kwargs: P.kwargs) -> R:\n        sarmal.cagri += 1\n        return fn(*args, **kwargs)\n    sarmal.cagri = 0\n    return sarmal\n\n@sayac\ndef komisyon(tutar: float, oran: float = 0.01) -> float:\n    return round(tutar * oran, 2)\n',
        tests: 'assert komisyon(1000) == 10.0 and komisyon(200, oran=0.05) == 10.0, "komisyon hesabı"\nassert komisyon.cagri == 2, "Sayaç her çağrıda artmalı"\nassert komisyon.__name__ == \'komisyon\', "wraps ile ad korunmalı"\nsig = inspect.signature(komisyon)\nassert list(sig.parameters) == [\'tutar\', \'oran\'], "İmza (tutar, oran) olarak korunmalı"\nassert sig.parameters[\'oran\'].default == 0.01, "Varsayılan değer korunmalı"\nassert sig.return_annotation is float, "Dönüş ipucu korunmalı"\n',
        hints: ['Sayaç için fonksiyon özniteliği: sarmal.cagri = 0, içeride sarmal.cagri += 1.', 'wraps(fn) __wrapped__ ekler; inspect.signature bunu izler.'],
        why: 'ParamSpec statik imzayı, wraps ise çalışma zamanı imzasını korur; ikisi birlikte dekoratörü "görünmez" yapar.' },
      { t: 'code', id: 'tip-sistemi-ileri-7',
        q: '<p>Çalışma zamanı tip denetleyicisi yaz: <code>tip_kontrol(fn)</code> dekoratörü, <code>typing.get_type_hints(fn)</code> ve <code>inspect.signature(fn).bind(*args, **kwargs)</code> ile her argümanın ipucundaki türe <code>isinstance</code> uymasını kontrol etsin; uymuyorsa <code>TypeError</code> (mesajda parametre adı geçsin). İpucu olmayan parametreler atlanır; yalnızca basit sınıf ipuçları (int, str, float...) desteklenir. Sonra <code>@tip_kontrol</code> ile <code>kredi_skoru(musteri: str, gelir: float, gecikme: int) -> int</code> fonksiyonunu tanımla: <code>int(min(900, gelir / 100 - gecikme * 50))</code>.</p>',
        start: 'import inspect\nfrom typing import get_type_hints\nfrom functools import wraps\n\ndef tip_kontrol(fn):\n    pass\n\n# kredi_skoru\n',
        sol: 'import inspect\nfrom typing import get_type_hints\nfrom functools import wraps\n\ndef tip_kontrol(fn):\n    hints = get_type_hints(fn)\n    sig = inspect.signature(fn)\n\n    @wraps(fn)\n    def sarmal(*args, **kwargs):\n        bagli = sig.bind(*args, **kwargs)\n        for ad, deger in bagli.arguments.items():\n            tip = hints.get(ad)\n            if isinstance(tip, type) and not isinstance(deger, tip):\n                raise TypeError(f\'{ad}: {tip.__name__} bekleniyor, {type(deger).__name__} geldi\')\n        return fn(*args, **kwargs)\n    return sarmal\n\n@tip_kontrol\ndef kredi_skoru(musteri: str, gelir: float, gecikme: int) -> int:\n    return int(min(900, gelir / 100 - gecikme * 50))\n',
        tests: 'assert kredi_skoru(\'Ayşe\', 50000.0, 1) == 450, "Skor hesabı"\nassert kredi_skoru(\'Ali\', 1e6, gecikme=0) == 900, "Üst sınır 900"\ntry:\n    kredi_skoru(\'Ali\', \'çok\', 0)\n    assert False, "gelir str verilince TypeError"\nexcept TypeError as e:\n    assert \'gelir\' in str(e), "Hata mesajında parametre adı olmalı"\ntry:\n    kredi_skoru(123, 1000.0, 0)\n    assert False, "musteri int verilince TypeError"\nexcept TypeError:\n    pass\nassert kredi_skoru.__name__ == \'kredi_skoru\', "wraps kullanılmalı"\n',
        hints: ['sig.bind(*args, **kwargs).arguments, parametre adı -> değer sözlüğü verir.', 'hints[\'return\'] de sözlükte; parametre adlarıyla eşleştiğinden karışmaz ama yalnızca arguments üzerinde dön.'],
        why: 'get_type_hints ipuçlarını gerçek sınıflara çözer, signature.bind ise konumsal/anahtarlı argümanları adlara eşler. Bu iki araç, pydantic benzeri kütüphanelerin temelidir.' },
      { t: 'mc', q: 'Aşağıdakilerden hangisi mypy için bir daraltma (narrowing) ifadesi DEĞİLDİR?',
        o: ['if x is None: return', 'isinstance(x, str)', 'print(x)', 'match x: case int(): ...'],
        a: 2, why: 'print çağrısı x\'in tipi hakkında bilgi vermez. None kontrolü, isinstance ve match desenleri denetleyicinin sonraki satırlarda tipi daraltmasını sağlar.' }
    ],
    faq: [
      { q: 'Python 3.12 sözdizimi (def f[T]) ile TypeVar aynı mı?', a: 'Aynı kavram, daha kısa yazım. Yeni sözdizimi değişkeni fonksiyona/sınıfa özel tanımlar ve variance\'ı otomatik çıkarır. Eski kod tabanları ve 3.11 altı projeler için TypeVar bilmek gerekir.' },
      { q: 'Any ile object arasındaki fark?', a: 'Any denetimi kapatır: her şey yapılabilir. object en genel türdür ama metot çağırmak için önce daraltman gerekir. Bilinmeyen girdi için object + isinstance daha güvenlidir.' },
      { q: 'mypy mi pyright mı?', a: 'İkisi de standart uyumlu. Pyright daha hızlı ve katı çıkarım yapar, VS Code ile bütünleşiktir; mypy eklenti ekosistemi (django-stubs vb.) ile daha yaygındır. Ekibin seçtiğini CI\'da strict ile çalıştır.' },
      { q: 'Tip ipuçları performansı etkiler mi?', a: 'İpuçları modül yüklenirken bir kez değerlendirilir; from __future__ import annotations ile string olarak ertelenir. Çalışma zamanı hızına etkisi yok denecek kadar azdır.' }
    ],
    mistakes: [
      { bad: 'def bul(ad: str, varsayilan: str = None) -> str: ...', good: 'def bul(ad: str, varsayilan: str | None = None) -> str | None: ...', why: 'Varsayılan None ise tip Optional olmalı; strict mod "implicit Optional" hatası verir.' },
      { bad: 'def ilk(xs: list[Any]) -> Any:\n    return xs[0]', good: 'def ilk[T](xs: list[T]) -> T:\n    return xs[0]', why: 'Any bilgiyi yutar; çağıran taraf dönüşün tipini kaybeder. TypeVar girdi-çıktı ilişkisini korur.' },
      { bad: 'def topla(xs: list[float]) -> float: ...\ntopla([1, 2, 3])  # list[int] -> hata', good: 'from collections.abc import Sequence\ndef topla(xs: Sequence[float]) -> float: ...', why: 'list invariant\'tır: list[int], list[float] yerine geçmez. Parametrede Sequence/Iterable gibi salt okunur soyut tip kullan.' },
      { bad: 'x: Islem = json.loads(metin)  # doğrulandı sanmak', good: 'ham = json.loads(metin)\nif not isinstance(ham.get(\'tutar\'), (int, float)):\n    raise ValueError(\'tutar sayı olmalı\')\nx: Islem = ham', why: 'TypedDict çalışma zamanında doğrulama yapmaz; dış veri sınırda elle ya da pydantic ile doğrulanmalı.' }
    ]
  }
);
})(window);
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{ id: 'api-web', lv: 'ileri', mod: 'Mimari', min: 42,
    title: 'API ve web: HTTP, requests/httpx, FastAPI ve doğrulama',
    sum: 'HTTP\'nin temelleri, requests/httpx kullanım kalıpları, FastAPI ile uç nokta yazma, JSON doğrulama, hata kodları, yeniden deneme ve zaman aşımı; tarayıcıda sahte istemci ve fonksiyon tabanlı yönlendiriciyle çalıştır.',
    goals: ['HTTP yöntemleri, durum kodları ve başlıkları doğru yorumlayabilirim', 'requests/httpx ile oturum, zaman aşımı ve hata yönetimi kalıplarını uygulayabilirim', 'FastAPI uç noktasının yapısını ve pydantic doğrulamasının mantığını açıklayabilirim', 'Dış API yanıtını şemaya göre doğrulayıp tutarlı hata kodları üretebilirim', 'Üstel geri çekilme ile yeniden deneme ve idempotency mantığını kurabilirim'],
    body: `<h2>Neden önemli?</h2>
<p>Kurumsal Python kodunun büyük bölümü bir ağ sınırında durur: Anadolu Market\'in sipariş servisi kargo firmasının API\'sine istek atar, Ilgaz Bank\'ın kredi modülü skor servisinden yanıt bekler. Bu sınırda her şey ters gidebilir: zaman aşımı, 503, bozuk JSON, beklenmeyen alan. Bu derste HTTP\'yi, istemci kütüphanelerini ve bir API yazmanın iskeletini öğreneceksin. Tarayıcıda ağ erişimi olmadığı için örnekler <b>sahte istemci</b> (fake client) ile çalışır; gerçek <code>requests</code>/<code>httpx</code>/FastAPI kodu gösterim olarak verilir. Sahte istemci yaklaşımı aynı zamanda ekiplerin birim testte kullandığı yöntemdir, boşa gitmez.</p>

<h2>HTTP temelleri</h2>
<p>Bir HTTP isteği: yöntem (GET, POST, PUT, PATCH, DELETE), yol (<code>/siparisler/42</code>), başlıklar (<code>Authorization</code>, <code>Content-Type</code>) ve gövde (genelde JSON). Yanıt: durum kodu, başlıklar, gövde. GET ve DELETE idempotent (tekrarlanınca aynı sonuç), POST değildir; bu yüzden POST\'u körlemesine yeniden denemek çift sipariş yaratabilir.</p>
<div class="tbl-wrap"><table><tr><th>Kod</th><th>Anlamı</th><th>İstemci ne yapmalı</th></tr><tr><td>200 / 201</td><td>Başarılı / oluşturuldu</td><td>Gövdeyi işle</td></tr><tr><td>204</td><td>Başarılı, gövde yok</td><td>JSON parse etmeye çalışma</td></tr><tr><td>400 / 422</td><td>Hatalı istek / doğrulama hatası</td><td>Yeniden deneme; girdiyi düzelt</td></tr><tr><td>401 / 403</td><td>Kimlik yok / yetki yok</td><td>Token yenile ya da dur</td></tr><tr><td>404</td><td>Kaynak yok</td><td>İş kuralına göre karar</td></tr><tr><td>429</td><td>Çok fazla istek</td><td>Retry-After kadar bekle</td></tr><tr><td>500 / 502 / 503</td><td>Sunucu hatası</td><td>Üstel geri çekilmeyle yeniden dene</td></tr></table></div>

<h2>requests ve httpx kalıpları</h2>
<p>İki kütüphane de benzer arayüz sunar; <code>httpx</code> async ve HTTP/2 destekler. Üç kural: her isteğe <b>zaman aşımı</b> ver (varsayılan sonsuzdur), <b>oturum</b> (Session/Client) kullan (bağlantı tekrar kullanımı, ortak başlık), <code>raise_for_status()</code> ile 4xx/5xx\'i istisnaya çevir.</p>
<pre class="py"># Gösterim: gerçek projede böyle yazılır (burada çalışmaz)
GOSTERIM = '''
import httpx

with httpx.Client(base_url="https://api.anadolu.example",
                  headers={"Authorization": "Bearer TOKEN"},
                  timeout=httpx.Timeout(5.0, connect=2.0)) as client:
    r = client.get("/siparisler", params={"durum": "bekliyor", "limit": 50})
    r.raise_for_status()
    siparisler = r.json()
    r2 = client.post("/siparisler", json={"musteri": 10, "tutar": 99.9})
    print(r2.status_code, r2.json()["id"])
'''
print(GOSTERIM.strip().splitlines()[0])
print('Satır sayısı:', len(GOSTERIM.strip().splitlines()))
</pre>
<p>Şimdi aynı sözleşmeye uyan, elimizdeki yanıtları döndüren küçük bir sahte istemci yazalım. Gerçek kodda bu sınıfın yerine <code>httpx.Client</code> geçer; iş mantığı değişmez.</p>
<pre class="py">import json

class SahteYanit:
    def __init__(self, status_code, govde='', headers=None):
        self.status_code = status_code
        self.text = govde
        self.headers = headers or {}
    def json(self):
        return json.loads(self.text)
    def raise_for_status(self):
        if self.status_code &gt;= 400:
            raise RuntimeError(f'HTTP {self.status_code}')

class SahteIstemci:
    """Yol -&gt; yanıt tablosu; gerçek httpx.Client ile aynı yüzey."""
    def __init__(self, tablo):
        self.tablo = tablo
        self.istekler = []
    def get(self, yol, params=None, timeout=5.0):
        self.istekler.append(('GET', yol, params))
        return self.tablo.get(yol, SahteYanit(404, '{"detail":"yok"}'))
    def post(self, yol, json=None, timeout=5.0):
        self.istekler.append(('POST', yol, json))
        return self.tablo.get(yol, SahteYanit(404, '{"detail":"yok"}'))

client = SahteIstemci({
    '/siparisler/42': SahteYanit(200, '{"id": 42, "tutar": 149.9, "durum": "kargoda"}'),
    '/siparisler/99': SahteYanit(404, '{"detail": "sipariş yok"}'),
})

def siparis_getir(client, no):
    r = client.get(f'/siparisler/{no}', timeout=5.0)
    if r.status_code == 404:
        return None
    r.raise_for_status()
    return r.json()

print(siparis_getir(client, 42))
print(siparis_getir(client, 99))
print(client.istekler)
</pre>
<div class="warn"><b>Zaman aşımı yoksa üretimde askıda kalırsın</b><code>requests.get(url)</code> varsayılan olarak sonsuza kadar bekler. Bir bağlantı zaman aşımı (connect) ve bir okuma zaman aşımı (read) belirle; httpx\'te <code>Timeout(5.0, connect=2.0)</code>, requests\'te <code>timeout=(2, 5)</code>.</div>

<h2>FastAPI ile uç nokta</h2>
<p>FastAPI, fonksiyon imzasındaki tip ipuçlarından hem doğrulamayı hem belgeyi üretir. Gövde modeli pydantic <code>BaseModel</code>\'dir: alan tipleri uymazsa otomatik 422 döner.</p>
<pre class="py">GOSTERIM = '''
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI()

class SiparisIstek(BaseModel):
    musteri_id: int
    tutar: float = Field(gt=0)
    sehir: str

DB: dict[int, dict] = {}

@app.post("/siparisler", status_code=201)
def siparis_olustur(s: SiparisIstek):
    no = len(DB) + 1
    DB[no] = s.model_dump() | {"id": no, "durum": "bekliyor"}
    return DB[no]

@app.get("/siparisler/{no}")
def siparis_getir(no: int):
    if no not in DB:
        raise HTTPException(status_code=404, detail="sipariş yok")
    return DB[no]
'''
print('FastAPI uç noktaları:', [s.strip() for s in GOSTERIM.splitlines() if s.startswith('@app')])
</pre>
<p>Pyodide\'de FastAPI yok; ama mantığı <b>fonksiyon tabanlı yönlendirici</b> (router) ile birebir kurabiliriz: yol deseni + yöntem bir fonksiyona eşlenir, gövde bir doğrulayıcıdan geçer, hata durumunda kod ve detay döner.</p>
<pre class="py">import json, re
from dataclasses import dataclass, asdict

class HTTPHata(Exception):
    def __init__(self, kod, detay):
        self.kod, self.detay = kod, detay

@dataclass
class SiparisIstek:          # pydantic mantığı, elle
    musteri_id: int
    tutar: float
    sehir: str
    @classmethod
    def dogrula(cls, ham: dict):
        hatalar = []
        if not isinstance(ham.get('musteri_id'), int): hatalar.append('musteri_id int olmalı')
        t = ham.get('tutar')
        if not isinstance(t, (int, float)) or t &lt;= 0: hatalar.append('tutar &gt; 0 olmalı')
        if not isinstance(ham.get('sehir'), str) or not ham['sehir']: hatalar.append('sehir boş olamaz')
        if hatalar:
            raise HTTPHata(422, hatalar)
        return cls(ham['musteri_id'], float(t), ham['sehir'])

class Uygulama:
    def __init__(self):
        self.rotalar = []          # (yöntem, regex, fonksiyon)
    def rota(self, yontem, desen):
        rx = re.compile('^' + re.sub(r'\\{(\\w+)\\}', r'(?P&lt;\\1&gt;[^/]+)', desen) + '$')
        def kaydet(fn):
            self.rotalar.append((yontem, rx, fn)); return fn
        return kaydet
    def istek(self, yontem, yol, govde=None):
        for y, rx, fn in self.rotalar:
            m = rx.match(yol)
            if m and y == yontem:
                try:
                    return 200, fn(**m.groupdict(), govde=govde)
                except HTTPHata as e:
                    return e.kod, {'detail': e.detay}
        return 404, {'detail': 'rota yok'}

app = Uygulama()
DB = {}

@app.rota('POST', '/siparisler')
def olustur(govde):
    s = SiparisIstek.dogrula(govde)
    no = len(DB) + 1
    DB[no] = asdict(s) | {'id': no, 'durum': 'bekliyor'}
    return DB[no]

@app.rota('GET', '/siparisler/{no}')
def getir(no, govde=None):
    no = int(no)
    if no not in DB:
        raise HTTPHata(404, 'sipariş yok')
    return DB[no]

print(app.istek('POST', '/siparisler', {'musteri_id': 7, 'tutar': 99.9, 'sehir': 'Bursa'}))
print(app.istek('POST', '/siparisler', {'musteri_id': '7', 'tutar': -1}))
print(app.istek('GET', '/siparisler/1'))
print(app.istek('GET', '/siparisler/5'))
</pre>
<div class="tip"><b>Doğrulama sınırda, güven içeride</b>Gövdeyi uç noktada bir kez doğrula; iç fonksiyonlara doğrulanmış dataclass/pydantic nesnesi ver. Hata yanıtı tutarlı bir şekil taşısın: <code>{"detail": ...}</code>. Günlük kaydına istek kimliğini (request id) ekle; destek ekibi hatayı bununla bulur.</div>

<h2>Yeniden deneme ve zaman aşımı</h2>
<p>Geçici hatalar (429, 502, 503, bağlantı kopması) için <b>üstel geri çekilme</b> (exponential backoff) kullan: 1 s, 2 s, 4 s... ve küçük rastgele sapma (jitter) ekle ki yüzlerce istemci aynı anda tekrar vurmasın. 4xx hatalarında (429 hariç) yeniden deneme yapma; istek zaten yanlış. POST\'ta yeniden deneme yapacaksan <code>Idempotency-Key</code> başlığı gönder.</p>
<pre class="py">import random

def geri_cekilme_sureleri(deneme, taban=1.0, tavan=30.0, jitter=0.2):
    """deneme 0,1,2... için bekleme süreleri (saniye)."""
    sure = min(tavan, taban * 2 ** deneme)
    return round(sure * (1 + random.uniform(-jitter, jitter)), 2)

def yeniden_dene(fn, deneme_sayisi=4, uyku=lambda s: None):
    son_hata = None
    for i in range(deneme_sayisi):
        try:
            r = fn()
            if r.status_code in (429, 502, 503):
                raise RuntimeError(f'geçici: {r.status_code}')
            return r
        except RuntimeError as e:
            son_hata = e
            if i &lt; deneme_sayisi - 1:
                uyku(geri_cekilme_sureleri(i))
    raise RuntimeError(f'{deneme_sayisi} denemede başarısız: {son_hata}')

random.seed(1)
yanitlar = iter([SahteYanit(503), SahteYanit(503), SahteYanit(200, '{"ok": true}')])
bekleme = []
r = yeniden_dene(lambda: next(yanitlar), uyku=bekleme.append)
print(r.status_code, r.json(), 'beklemeler:', bekleme)
</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Üretim API istemcisi kontrol listesi</h3>
<p>Kurumsal bir istemci modülü şu parçaları taşır: tek bir <code>Client</code> nesnesi (oturum), merkezi zaman aşımı, 5xx/429 için geri çekilmeli yeniden deneme, 4xx için anlamlı iş istisnaları (<code>SiparisBulunamadi</code> gibi), yanıt şemasının doğrulanması (TypedDict/pydantic), istek kimliği ve süresinin loglanması. Sahte istemciyi <code>Protocol</code> ile tanımlarsan hem gerçek hem test istemcisi aynı imzaya uyar; iş mantığı ağ olmadan test edilir.</p>
<p>Sunucu tarafında FastAPI\'nin bağımlılık enjeksiyonu (<code>Depends</code>) veritabanı oturumu ve kimlik doğrulamayı uç noktadan ayırır. Asenkron uç noktalar (<code>async def</code>) yalnızca I/O beklerken kazanç sağlar; CPU ağırlıklı işi <code>run_in_executor</code> ya da ayrı işçiye ver. Sürümleme (<code>/v1/</code>), sayfalama (<code>limit/offset</code> ya da imleç), oran sınırlama (rate limit) ve OpenAPI belgesi, bir API\'nin "üretime hazır" sayılması için beklenen asgari özelliklerdir.</p>
<p>Devre kesici (circuit breaker) kalıbını da bil: dış servis art arda başarısız olunca bir süre hiç istek atmadan hızlı hata dön; böylece hem kendi hizmetin yavaşlamaz hem de karşı tarafa yük bindirmezsin.</p>
</section>`,
    ex: [
      { t: 'mc', q: 'Bir POST isteği 503 ile başarısız oldu. En doğru davranış hangisi?',
        o: ['Hemen tekrar dene, en fazla 100 kez', 'Üstel geri çekilme ve Idempotency-Key ile sınırlı sayıda yeniden dene', 'Hiç yeniden deneme; 5xx kalıcıdır', 'Yöntemi GET\'e çevirip dene'],
        a: 1, why: '503 geçici bir hatadır; geri çekilme ile yeniden denemek doğrudur. POST idempotent olmadığından çift kayıt riskini Idempotency-Key ile önlersin. Anında ve sınırsız tekrar sunucuyu daha da zorlar.' },
      { t: 'code', id: 'api-web-2',
        q: '<p>Sahte yanıt sınıfı verildi. <code>yanit_isle(yanit)</code> fonksiyonu yaz: 2xx ise <code>yanit.json()</code> döndürsün (204 ise <code>None</code>); 404 ise <code>None</code>; 429 ve 5xx ise <code>GeciciHata</code> (özel istisna) fırlatsın; diğer 4xx için <code>KaliciHata</code> fırlatsın. İstisnalar <code>kod</code> özniteliği taşısın.</p>',
        start: 'import json\n\nclass SahteYanit:\n    def __init__(self, status_code, text=\'\'):\n        self.status_code, self.text = status_code, text\n    def json(self):\n        return json.loads(self.text)\n\nclass GeciciHata(Exception):\n    def __init__(self, kod):\n        super().__init__(f\'geçici hata {kod}\')\n        self.kod = kod\n\nclass KaliciHata(Exception):\n    def __init__(self, kod):\n        super().__init__(f\'kalıcı hata {kod}\')\n        self.kod = kod\n\ndef yanit_isle(yanit):\n    pass\n',
        sol: 'import json\n\nclass SahteYanit:\n    def __init__(self, status_code, text=\'\'):\n        self.status_code, self.text = status_code, text\n    def json(self):\n        return json.loads(self.text)\n\nclass GeciciHata(Exception):\n    def __init__(self, kod):\n        super().__init__(f\'geçici hata {kod}\')\n        self.kod = kod\n\nclass KaliciHata(Exception):\n    def __init__(self, kod):\n        super().__init__(f\'kalıcı hata {kod}\')\n        self.kod = kod\n\ndef yanit_isle(yanit):\n    k = yanit.status_code\n    if k == 204:\n        return None\n    if 200 <= k < 300:\n        return yanit.json()\n    if k == 404:\n        return None\n    if k == 429 or k >= 500:\n        raise GeciciHata(k)\n    raise KaliciHata(k)\n',
        tests: 'assert yanit_isle(SahteYanit(200, \'{"a": 1}\')) == {\'a\': 1}, "200 json dönmeli"\nassert yanit_isle(SahteYanit(201, \'[1]\')) == [1], "201 de başarılı"\nassert yanit_isle(SahteYanit(204)) is None, "204 gövdesiz: None"\nassert yanit_isle(SahteYanit(404, \'{}\')) is None, "404 None"\nfor k in (429, 500, 503):\n    try:\n        yanit_isle(SahteYanit(k)); assert False, f"{k} GeciciHata vermeli"\n    except GeciciHata as e:\n        assert e.kod == k, "kod özniteliği"\nfor k in (400, 401, 422):\n    try:\n        yanit_isle(SahteYanit(k)); assert False, f"{k} KaliciHata vermeli"\n    except KaliciHata as e:\n        assert e.kod == k, "kod özniteliği"\n',
        hints: ['204 kontrolünü 2xx kontrolünden önce yap; json() boş metinde patlar.', '429 ve >=500 geçici, geri kalan 4xx kalıcı.'],
        why: 'Durum kodunu iş istisnalarına çevirmek, çağıran kodun "yeniden dene / vazgeç / yok say" kararını HTTP ayrıntısı bilmeden vermesini sağlar.' },
      { t: 'code', id: 'api-web-3',
        q: '<p>Üstel geri çekilmeli yeniden deneme. <code>yeniden_dene(fn, deneme=3, bekle=None)</code>: <code>fn()</code> çağrısı <code>GeciciHata</code> fırlatırsa bekleyip tekrar dener; beklemeler 1, 2, 4... saniye (<code>2 ** i</code>) ve her bekleme <code>bekle(saniye)</code> ile yapılır (None ise beklemez). <code>deneme</code> kadar denedikten sonra hâlâ başarısızsa son istisnayı yeniden fırlatsın. Diğer istisnalar hemen yayılsın. Başarılı sonucu döndürsün.</p>',
        start: 'class GeciciHata(Exception):\n    pass\n\ndef yeniden_dene(fn, deneme=3, bekle=None):\n    pass\n',
        sol: 'class GeciciHata(Exception):\n    pass\n\ndef yeniden_dene(fn, deneme=3, bekle=None):\n    son = None\n    for i in range(deneme):\n        try:\n            return fn()\n        except GeciciHata as e:\n            son = e\n            if i < deneme - 1 and bekle is not None:\n                bekle(2 ** i)\n    raise son\n',
        tests: 'sayac = {\'n\': 0}\ndef bazen():\n    sayac[\'n\'] += 1\n    if sayac[\'n\'] < 3:\n        raise GeciciHata(\'503\')\n    return \'ok\'\nbeklemeler = []\nassert yeniden_dene(bazen, deneme=4, bekle=beklemeler.append) == \'ok\', "Üçüncü denemede başarmalı"\nassert beklemeler == [1, 2], "Beklemeler 1 ve 2 saniye olmalı"\nassert sayac[\'n\'] == 3, "Başarıdan sonra tekrar denenmemeli"\ndef hep():\n    raise GeciciHata(\'hep\')\ntry:\n    yeniden_dene(hep, deneme=2)\n    assert False, "Tüm denemeler başarısızsa istisna fırlamalı"\nexcept GeciciHata as e:\n    assert str(e) == \'hep\', "Son istisna yeniden fırlatılmalı"\ndef kalici():\n    raise ValueError(\'kalıcı\')\ntry:\n    yeniden_dene(kalici)\n    assert False\nexcept ValueError:\n    pass\n',
        hints: ['Döngüde başarı olursa hemen return.', 'Son denemeden sonra bekleme yapma; raise son.'],
        why: 'Yalnızca geçici hatayı yakalayıp diğerlerini yaymak, programlama hatalarının yeniden denemeyle gizlenmesini önler.' },
      { t: 'code', id: 'api-web-4',
        q: '<p>pydantic mantığını elle kur. <code>dogrula_siparis(ham: dict) -> dict</code>: kurallar: <code>musteri_id</code> pozitif int (bool değil), <code>tutar</code> pozitif sayı, <code>sehir</code> boş olmayan str, <code>urunler</code> en az bir elemanlı str listesi. Tüm hataları toplayıp <code>DogrulamaHatasi(hatalar: list[str])</code> fırlat (istisnanın <code>hatalar</code> özniteliği olsun); her hata mesajı alan adıyla başlasın. Geçerliyse <code>tutar</code> float\'a çevrilmiş yeni sözlük döndür.</p>',
        start: 'class DogrulamaHatasi(Exception):\n    def __init__(self, hatalar):\n        super().__init__(\'; \'.join(hatalar))\n        self.hatalar = hatalar\n\ndef dogrula_siparis(ham):\n    pass\n',
        sol: 'class DogrulamaHatasi(Exception):\n    def __init__(self, hatalar):\n        super().__init__(\'; \'.join(hatalar))\n        self.hatalar = hatalar\n\ndef dogrula_siparis(ham):\n    h = []\n    m = ham.get(\'musteri_id\')\n    if not isinstance(m, int) or isinstance(m, bool) or m <= 0:\n        h.append(\'musteri_id: pozitif tam sayı olmalı\')\n    t = ham.get(\'tutar\')\n    if not isinstance(t, (int, float)) or isinstance(t, bool) or t <= 0:\n        h.append(\'tutar: pozitif sayı olmalı\')\n    s = ham.get(\'sehir\')\n    if not isinstance(s, str) or not s.strip():\n        h.append(\'sehir: boş olamaz\')\n    u = ham.get(\'urunler\')\n    if not isinstance(u, list) or not u or not all(isinstance(x, str) for x in u):\n        h.append(\'urunler: en az bir ürün adı içeren liste olmalı\')\n    if h:\n        raise DogrulamaHatasi(h)\n    return {\'musteri_id\': m, \'tutar\': float(t), \'sehir\': s, \'urunler\': list(u)}\n',
        tests: 'ok = dogrula_siparis({\'musteri_id\': 5, \'tutar\': 120, \'sehir\': \'İzmir\', \'urunler\': [\'kahve\']})\nassert ok[\'tutar\'] == 120.0 and isinstance(ok[\'tutar\'], float), "tutar float olmalı"\nassert ok[\'urunler\'] == [\'kahve\'] and ok[\'sehir\'] == \'İzmir\', "Alanlar korunmalı"\ntry:\n    dogrula_siparis({\'musteri_id\': \'5\', \'tutar\': -1, \'sehir\': \'\', \'urunler\': []})\n    assert False, "Hatalı girdi DogrulamaHatasi vermeli"\nexcept DogrulamaHatasi as e:\n    assert len(e.hatalar) == 4, "Dört hata toplanmalı"\n    assert all(any(h.startswith(a) for a in (\'musteri_id\', \'tutar\', \'sehir\', \'urunler\')) for h in e.hatalar), "Mesajlar alan adıyla başlamalı"\ntry:\n    dogrula_siparis({\'musteri_id\': True, \'tutar\': 1, \'sehir\': \'A\', \'urunler\': [\'x\']})\n    assert False, "bool musteri_id reddedilmeli"\nexcept DogrulamaHatasi as e:\n    assert len(e.hatalar) == 1 and e.hatalar[0].startswith(\'musteri_id\')\ntry:\n    dogrula_siparis({})\n    assert False\nexcept DogrulamaHatasi as e:\n    assert len(e.hatalar) == 4, "Eksik alanlar da hata olmalı"\n',
        hints: ['bool, int\'in alt sınıfıdır; isinstance(m, bool) ile ayrıca dışla.', 'Hataları listede topla, sonunda tek seferde fırlat; API 422 yanıtı tüm hataları birlikte gösterir.'],
        why: 'Tüm hataları birden döndürmek istemcinin üç tur yerine tek turda düzeltme yapmasını sağlar; pydantic de böyle davranır.' },
      { t: 'mc', q: 'FastAPI bir uç noktanın gövde modelinde tip uyuşmazlığı bulursa varsayılan olarak hangi durum kodunu döner?',
        o: ['400', '404', '422', '500'],
        a: 2, why: 'FastAPI/pydantic doğrulama hataları için 422 Unprocessable Entity döner ve hata listesini detail alanında verir. 400 genel hatalı istek, 500 sunucu hatasıdır.' },
      { t: 'code', id: 'api-web-6',
        q: '<p>Fonksiyon tabanlı yönlendirici yaz. <code>Uygulama</code> sınıfı: <code>rota(yontem, desen)</code> dekoratörü; desen <code>/x/{ad}</code> biçiminde parametre içerebilir. <code>istek(yontem, yol, govde=None)</code> eşleşen fonksiyonu yol parametreleri (str) ve <code>govde=</code> ile çağırıp <code>(200, sonuç)</code> döndürsün; fonksiyon <code>HTTPHata(kod, detay)</code> fırlatırsa <code>(kod, {\'detail\': detay})</code>; yol eşleşir ama yöntem eşleşmezse <code>(405, {\'detail\': \'yöntem desteklenmiyor\'})</code>; hiç eşleşme yoksa <code>(404, {\'detail\': \'rota yok\'})</code>.</p>',
        start: 'import re\n\nclass HTTPHata(Exception):\n    def __init__(self, kod, detay):\n        self.kod, self.detay = kod, detay\n\nclass Uygulama:\n    def __init__(self):\n        self.rotalar = []\n    # rota, istek\n',
        sol: 'import re\n\nclass HTTPHata(Exception):\n    def __init__(self, kod, detay):\n        self.kod, self.detay = kod, detay\n\nclass Uygulama:\n    def __init__(self):\n        self.rotalar = []\n\n    def rota(self, yontem, desen):\n        rx = re.compile(\'^\' + re.sub(r\'\\{(\\w+)\\}\', r\'(?P<\\1>[^/]+)\', desen) + \'$\')\n        def kaydet(fn):\n            self.rotalar.append((yontem, rx, fn))\n            return fn\n        return kaydet\n\n    def istek(self, yontem, yol, govde=None):\n        yol_eslesti = False\n        for y, rx, fn in self.rotalar:\n            m = rx.match(yol)\n            if not m:\n                continue\n            yol_eslesti = True\n            if y != yontem:\n                continue\n            try:\n                return 200, fn(**m.groupdict(), govde=govde)\n            except HTTPHata as e:\n                return e.kod, {\'detail\': e.detay}\n        if yol_eslesti:\n            return 405, {\'detail\': \'yöntem desteklenmiyor\'}\n        return 404, {\'detail\': \'rota yok\'}\n',
        tests: 'app = Uygulama()\nDB = {\'1\': {\'id\': 1, \'ad\': \'kahve\'}}\n@app.rota(\'GET\', \'/urunler/{no}\')\ndef getir(no, govde=None):\n    if no not in DB:\n        raise HTTPHata(404, \'ürün yok\')\n    return DB[no]\n@app.rota(\'POST\', \'/urunler\')\ndef ekle(govde):\n    return {\'eklendi\': govde[\'ad\']}\nassert app.istek(\'GET\', \'/urunler/1\') == (200, {\'id\': 1, \'ad\': \'kahve\'}), "Yol parametresi ile GET"\nassert app.istek(\'GET\', \'/urunler/9\') == (404, {\'detail\': \'ürün yok\'}), "HTTPHata koda dönmeli"\nassert app.istek(\'POST\', \'/urunler\', {\'ad\': \'çay\'}) == (200, {\'eklendi\': \'çay\'}), "POST gövde"\nassert app.istek(\'DELETE\', \'/urunler\')[0] == 405, "Yol var yöntem yok: 405"\nassert app.istek(\'GET\', \'/yok\') == (404, {\'detail\': \'rota yok\'}), "Bilinmeyen yol 404"\nassert getir(\'1\') == DB[\'1\'], "Dekoratör fonksiyonu aynen döndürmeli"\n',
        hints: ['Deseni regex\'e çevir: {ad} -> (?P&lt;ad>[^/]+).', 'Yol eşleşti ama yöntem farklıysa bayrak tut; döngü sonunda 405 döndür.'],
        why: 'Gerçek çerçeveler de aynı şeyi yapar: desen -> regex, eşleşme -> fonksiyon çağrısı, istisna -> durum kodu. 405 ayrımı, istemciye yolun doğru ama yöntemin yanlış olduğunu söyler.' },
      { t: 'code', id: 'api-web-7',
        q: '<p>Sayfalı API tüketimi. Sahte istemcinin <code>get(yol, params)</code> metodu <code>{\'items\': [...], \'next\': sonraki_sayfa_veya_None}</code> döndüren <code>SahteYanit</code> verir. <code>tum_siparisler(client, yol=\'/siparisler\')</code> fonksiyonu <code>page=1</code>\'den başlayıp <code>next</code> None olana kadar tüm <code>items</code>\'ı tek listede toplayıp döndürsün. Her yanıtta <code>raise_for_status()</code> çağır. Sahte istemci ve 3 sayfalık veri start kodunda hazır.</p>',
        start: 'import json\n\nclass SahteYanit:\n    def __init__(self, kod, veri):\n        self.status_code, self._veri = kod, veri\n    def json(self):\n        return self._veri\n    def raise_for_status(self):\n        if self.status_code >= 400:\n            raise RuntimeError(f\'HTTP {self.status_code}\')\n\nclass SahteIstemci:\n    SAYFALAR = {1: ([1, 2], 2), 2: ([3, 4], 3), 3: ([5], None)}\n    def __init__(self):\n        self.cagri = []\n    def get(self, yol, params=None):\n        p = (params or {}).get(\'page\', 1)\n        self.cagri.append(p)\n        items, nxt = self.SAYFALAR[p]\n        return SahteYanit(200, {\'items\': [{\'id\': i} for i in items], \'next\': nxt})\n\ndef tum_siparisler(client, yol=\'/siparisler\'):\n    pass\n',
        sol: 'import json\n\nclass SahteYanit:\n    def __init__(self, kod, veri):\n        self.status_code, self._veri = kod, veri\n    def json(self):\n        return self._veri\n    def raise_for_status(self):\n        if self.status_code >= 400:\n            raise RuntimeError(f\'HTTP {self.status_code}\')\n\nclass SahteIstemci:\n    SAYFALAR = {1: ([1, 2], 2), 2: ([3, 4], 3), 3: ([5], None)}\n    def __init__(self):\n        self.cagri = []\n    def get(self, yol, params=None):\n        p = (params or {}).get(\'page\', 1)\n        self.cagri.append(p)\n        items, nxt = self.SAYFALAR[p]\n        return SahteYanit(200, {\'items\': [{\'id\': i} for i in items], \'next\': nxt})\n\ndef tum_siparisler(client, yol=\'/siparisler\'):\n    hepsi = []\n    sayfa = 1\n    while sayfa is not None:\n        r = client.get(yol, params={\'page\': sayfa})\n        r.raise_for_status()\n        veri = r.json()\n        hepsi.extend(veri[\'items\'])\n        sayfa = veri[\'next\']\n    return hepsi\n',
        tests: 'c = SahteIstemci()\nsonuc = tum_siparisler(c)\nassert [s[\'id\'] for s in sonuc] == [1, 2, 3, 4, 5], "Tüm sayfalar birleştirilmeli"\nassert c.cagri == [1, 2, 3], "Sayfalar sırayla ve bir kez istenmeli"\n',
        hints: ['while sayfa is not None döngüsü; her turda params={\'page\': sayfa}.', 'veri[\'next\'] ile sonraki sayfayı al.'],
        why: 'Sayfalama döngüsü gerçek API\'lerde en sık yazılan kalıptır; sahte istemci iş mantığını ağ olmadan test etmeni sağlar.' }
    ],
    faq: [
      { q: 'requests mi httpx mi?', a: 'Yeni projelerde httpx: aynı arayüz, async ve HTTP/2 desteği, zaman aşımı varsayılanı daha güvenli. requests çok yaygın; mevcut projede değiştirmeye değmeyebilir.' },
      { q: 'FastAPI yerine Flask/Django kullanmalı mıyım?', a: 'Saf API için FastAPI (tip tabanlı doğrulama, otomatik OpenAPI, async). Yönetim paneli, ORM ve oturum yönetimi gerekiyorsa Django. Flask küçük ve esnek, ama doğrulama ve belgeyi kendin eklersin.' },
      { q: 'Test ortamında gerçek API\'ye istek atmalı mıyım?', a: 'Birim testlerde hayır: sahte istemci ya da respx/responses ile yanıtları taklit et. Entegrasyon testlerinde ayrı bir sandbox ortamı kullan; CI\'da ağ bağımlılığı testleri kırılgan yapar.' }
    ],
    mistakes: [
      { bad: 'r = requests.get(url)\nveri = r.json()', good: 'r = session.get(url, timeout=(2, 5))\nr.raise_for_status()\nveri = r.json()', why: 'Zaman aşımı olmadan istek sonsuza kadar bekleyebilir; raise_for_status olmadan 500 yanıtının gövdesini veri sanırsın.' },
      { bad: 'for i in range(10):\n    try:\n        return client.post(url, json=veri)\n    except Exception:\n        continue', good: 'for i in range(4):\n    try:\n        return client.post(url, json=veri, headers={\'Idempotency-Key\': key})\n    except GeciciHata:\n        time.sleep(2 ** i)\nraise', why: 'Tüm istisnaları yutup anında tekrar denemek hem çift kayıt yaratır hem de kalıcı hataları gizler.' },
      { bad: 'veri = r.json()\ntutar = veri[\'tutar\'] * 1.2', good: 'veri = r.json()\nif not isinstance(veri.get(\'tutar\'), (int, float)):\n    raise ValueError(\'tutar eksik veya sayı değil\')\ntutar = veri[\'tutar\'] * 1.2', why: 'Dış API yanıtı sözleşmeye uymayabilir; sınırda doğrulamadan kullanmak belirsiz hatalara yol açar.' }
    ]
  }
);
})(window);
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{ id: 'veri-boru-hatti', lv: 'ileri', mod: 'Üretime Hazırlık', min: 42,
    title: 'Veri boru hattı (ETL): çıkar, dönüştür, yükle',
    sum: 'Anadolu Market günlük satış ETL\'i: pathlib ile dosya düzeni, logging, şema doğrulama, hata kuyruğu, idempotent yükleme (sqlite3) ve zamanlama kavramı.',
    goals: ['Extract/transform/load adımlarını ayrı, test edilebilir fonksiyonlara bölebilirim', 'pathlib ile gelen/işlenen/hatalı dosya düzeni kurabilirim', 'Şema doğrulamasıyla bozuk satırları hata kuyruğuna ayırabilirim', 'sqlite3 ile idempotent (tekrar çalıştırılabilir) yükleme yazabilirim', 'logging ile izlenebilir çalışma kaydı tutar, cron/Airflow zamanlamasını açıklayabilirim'],
    body: `<h2>Neden önemli?</h2>
<p>Anadolu Market her gece mağaza sistemlerinden gelen satış dosyalarını merkez veritabanına yükler. Bu iş bir kez yazılıp yıllarca her gece çalışır; bu yüzden "çalışıyor" yetmez: dosya yarım gelirse ne olur, aynı dosya iki kez gelirse mükerrer kayıt oluşur mu, bozuk satır tüm yüklemeyi durdurur mu, sabah ekip neyin yüklendiğini nereden görür? Bu derste bir <b>veri boru hattı</b> (data pipeline) kurarken sorulan bu soruların standart cevaplarını öğreneceksin. ETL = Extract (çıkar), Transform (dönüştür), Load (yükle).</p>

<h2>Dosya düzeni ve pathlib</h2>
<p>Klasik düzen üç klasördür: <code>gelen/</code> (ham dosyalar bırakılır), <code>islenen/</code> (başarıyla yüklenenler taşınır), <code>hatali/</code> (işlenemeyenler ve hata kuyruğu). <code>pathlib.Path</code> ile klasörleri oluştur, dosyaları desenle bul, taşı. Pyodide\'de bellek içi dosya sistemi olduğu için aynı kod tarayıcıda da çalışır.</p>
<pre class="py">from pathlib import Path
import shutil

KOK = Path('etl_demo')
GELEN, ISLENEN, HATALI = KOK / 'gelen', KOK / 'islenen', KOK / 'hatali'
for k in (GELEN, ISLENEN, HATALI):
    k.mkdir(parents=True, exist_ok=True)

(GELEN / 'satis_2024-05-01.csv').write_text(
    'siparis_no,sehir,tutar,adet\\n1001,İzmir,149.90,2\\n1002,Bursa,80.00,1\\n', encoding='utf-8')
(GELEN / 'satis_2024-05-02.csv').write_text(
    'siparis_no,sehir,tutar,adet\\n1003,Ankara,abc,1\\n1004,İzmir,20.5,3\\n', encoding='utf-8')
(GELEN / 'notlar.txt').write_text('bu dosya ETL konusu değil')

for p in sorted(GELEN.glob('satis_*.csv')):
    print(p.name, p.stem, p.suffix, p.stat().st_size, 'bayt')
shutil.move(str(GELEN / 'notlar.txt'), str(HATALI / 'notlar.txt'))
print('hatali:', [p.name for p in HATALI.iterdir()])
</pre>
<div class="tip"><b>Dosya adında tarih</b><code>satis_2024-05-01.csv</code> gibi ISO tarihli adlar hem sıralamayı hem "bu dosya daha önce yüklendi mi?" sorusunu kolaylaştırır. İş tarihi (business date) ile dosyanın geliş zamanını karıştırma; ikisini de kaydet.</div>

<h2>Extract ve şema doğrulama</h2>
<p>Çıkarma adımı ham satırları okur; dönüştürme adımı her satırı şemaya göre doğrular ve tipler. Bozuk satır tüm işi durdurmamalı; <b>hata kuyruğuna</b> (dead-letter queue) yazılıp iş devam etmeli. Her hata kaydı: kaynak dosya, satır numarası, ham veri, hata nedeni.</p>
<pre class="py">import csv, io
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation

@dataclass(frozen=True)
class Satis:
    siparis_no: int
    sehir: str
    tutar: Decimal
    adet: int

SEHIRLER = {'İzmir', 'Bursa', 'Ankara', 'İstanbul'}

def dogrula(ham: dict) -&gt; Satis:
    try:
        no = int(ham['siparis_no'])
        tutar = Decimal(ham['tutar'])
        adet = int(ham['adet'])
    except (KeyError, ValueError, InvalidOperation) as e:
        raise ValueError(f'tip hatası: {e}') from e
    if tutar &lt; 0: raise ValueError('tutar negatif')
    if adet &lt;= 0: raise ValueError('adet pozitif olmalı')
    sehir = ham['sehir'].strip()
    if sehir not in SEHIRLER: raise ValueError(f'bilinmeyen şehir: {sehir}')
    return Satis(no, sehir, tutar, adet)

def extract_transform(metin: str, kaynak: str):
    gecerli, hatalar = [], []
    for i, ham in enumerate(csv.DictReader(io.StringIO(metin)), start=2):   # 1 = başlık
        try:
            gecerli.append(dogrula(ham))
        except ValueError as e:
            hatalar.append({'kaynak': kaynak, 'satir': i, 'ham': ham, 'neden': str(e)})
    return gecerli, hatalar

metin = 'siparis_no,sehir,tutar,adet\\n1003,Ankara,abc,1\\n1004,İzmir,20.5,3\\n1005,Mars,5,1\\n'
g, h = extract_transform(metin, 'satis_2024-05-02.csv')
print('geçerli:', g)
for x in h:
    print('HATA', x['satir'], x['neden'])
</pre>
<div class="note"><b>Para için Decimal</b>Satış tutarlarını float ile toplarsan kuruş farkları birikir. Dönüştürme adımında <code>Decimal</code>\'e çevir, veritabanına kuruş cinsinden tam sayı ya da metin olarak yaz.</div>

<h2>Load: idempotent yükleme</h2>
<p>İdempotent yükleme, aynı dosyayı iki kez çalıştırınca sonucun değişmemesi demektir. İki araç: tabloda doğal anahtar üzerinde <code>UNIQUE</code> kısıtı ve <code>INSERT ... ON CONFLICT DO UPDATE</code> (upsert); ayrıca hangi dosyanın yüklendiğini tutan bir <code>yukleme_kaydi</code> tablosu. Yükleme bir <b>işlem</b> (transaction) içinde yapılır: ya hepsi ya hiçbiri.</p>
<pre class="py">import sqlite3
from decimal import Decimal

def semayi_kur(con):
    con.executescript('''
        CREATE TABLE IF NOT EXISTS satis (
            siparis_no INTEGER PRIMARY KEY, sehir TEXT NOT NULL,
            tutar_kurus INTEGER NOT NULL, adet INTEGER NOT NULL, kaynak TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS yukleme_kaydi (
            kaynak TEXT PRIMARY KEY, satir INTEGER, hata INTEGER, yuklendi_utc TEXT);
    ''')

def load(con, satislar, kaynak, hata_sayisi):
    with con:                                   # transaction: hata olursa geri alınır
        con.executemany('''
            INSERT INTO satis (siparis_no, sehir, tutar_kurus, adet, kaynak)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(siparis_no) DO UPDATE SET
                sehir=excluded.sehir, tutar_kurus=excluded.tutar_kurus,
                adet=excluded.adet, kaynak=excluded.kaynak
        ''', [(s.siparis_no, s.sehir, int(s.tutar * 100), s.adet, kaynak) for s in satislar])
        con.execute('''INSERT INTO yukleme_kaydi VALUES (?, ?, ?, datetime('now'))
                       ON CONFLICT(kaynak) DO UPDATE SET satir=excluded.satir, hata=excluded.hata,
                       yuklendi_utc=excluded.yuklendi_utc''', (kaynak, len(satislar), hata_sayisi))

con = sqlite3.connect(':memory:')
semayi_kur(con)
veri = [Satis(1001, 'İzmir', Decimal('149.90'), 2), Satis(1002, 'Bursa', Decimal('80.00'), 1)]
load(con, veri, 'satis_2024-05-01.csv', 0)
load(con, veri, 'satis_2024-05-01.csv', 0)     # ikinci çalıştırma: mükerrer yok
print(con.execute('SELECT COUNT(*), SUM(tutar_kurus) FROM satis').fetchone())
print(con.execute('SELECT kaynak, satir FROM yukleme_kaydi').fetchall())
</pre>
<div class="warn"><b>Yarım yükleme</b><code>with con:</code> bloğu istisna durumunda <code>ROLLBACK</code> yapar. Dosyayı <code>islenen/</code> klasörüne taşıma işlemini yalnızca commit başarılı olduktan sonra yap; yoksa veritabanında olmayan bir dosya "işlendi" görünür.</div>

<h2>logging ile izlenebilirlik</h2>
<p><code>print</code> yerine <code>logging</code>: seviye (INFO/WARNING/ERROR), zaman damgası, modül adı, ve üretimde dosyaya ya da merkezi log sistemine yönlendirme. Her çalıştırma için bir <b>çalıştırma kimliği</b> (run id) üret; sabah ekip "dün gece 03:00 çalıştırması" diye arar.</p>
<pre class="py">import logging, io, uuid

akis = io.StringIO()
logging.basicConfig(stream=akis, level=logging.INFO,
                    format='%(asctime)s %(levelname)s %(name)s: %(message)s', force=True)
log = logging.getLogger('etl.satis')

run_id = uuid.UUID(int=12345)            # gerçekte uuid.uuid4()
log.info('başladı run_id=%s', run_id)
log.info('dosya=%s geçerli=%d hata=%d', 'satis_2024-05-02.csv', 1, 2)
log.warning('hata kuyruğuna yazıldı: %d satır', 2)
log.error('dosya okunamadı: %s', 'satis_2024-05-03.csv')
print(akis.getvalue())
</pre>
<div class="tbl-wrap"><table><tr><th>Adım</th><th>Girdi</th><th>Çıktı</th><th>Hata durumunda</th></tr><tr><td>Extract</td><td>gelen/*.csv</td><td>ham satır listesi</td><td>Dosya hatali/ klasörüne, ERROR log</td></tr><tr><td>Transform</td><td>ham satırlar</td><td>Satis nesneleri + hata kuyruğu</td><td>Satır kuyruğa, WARNING log, iş devam</td></tr><tr><td>Load</td><td>Satis nesneleri</td><td>DB satırları + yükleme kaydı</td><td>ROLLBACK, dosya gelen/ içinde kalır</td></tr><tr><td>Arşiv</td><td>işlenen dosya</td><td>islenen/ klasörü</td><td>Yalnızca commit sonrası</td></tr></table></div>

<h2>Uçtan uca: Anadolu Market günlük satış ETL\'i</h2>
<pre class="py">import sqlite3, shutil, json, logging, io
from pathlib import Path

def calistir(kok: Path, con, log):
    gelen, islenen, hatali = kok / 'gelen', kok / 'islenen', kok / 'hatali'
    for k in (gelen, islenen, hatali): k.mkdir(parents=True, exist_ok=True)
    ozet = []
    for dosya in sorted(gelen.glob('satis_*.csv')):
        gecerli, hatalar = extract_transform(dosya.read_text(encoding='utf-8'), dosya.name)
        if hatalar:
            (hatali / (dosya.stem + '.hatalar.jsonl')).write_text(
                '\\n'.join(json.dumps(h, ensure_ascii=False) for h in hatalar), encoding='utf-8')
        load(con, gecerli, dosya.name, len(hatalar))
        shutil.move(str(dosya), str(islenen / dosya.name))
        log.info('%s: %d yüklendi, %d hatalı', dosya.name, len(gecerli), len(hatalar))
        ozet.append((dosya.name, len(gecerli), len(hatalar)))
    return ozet

akis = io.StringIO()
logging.basicConfig(stream=akis, level=logging.INFO, format='%(levelname)s %(message)s', force=True)
con = sqlite3.connect(':memory:'); semayi_kur(con)
print(calistir(Path('etl_demo'), con, logging.getLogger('etl')))
print('kalan gelen:', [p.name for p in Path('etl_demo/gelen').iterdir()])
print(con.execute('SELECT sehir, SUM(tutar_kurus)/100.0 FROM satis GROUP BY sehir').fetchall())
print(akis.getvalue().strip())
</pre>

<h2>Zamanlama: cron ve Airflow</h2>
<p>Betiği her gece çalıştırmak için en basit araç <code>cron</code>\'dur: <code>0 3 * * * /opt/etl/.venv/bin/python -m etl.satis</code> satırı her gün 03:00\'te çalıştırır. Boru hattı büyüyünce (bağımlılıklar, yeniden deneme, izleme, geriye dönük çalıştırma) Airflow, Prefect ya da Dagster gibi orkestratörler kullanılır: her adım bir görev (task), görevler yönlü çevrimsiz çizge (DAG) oluşturur, başarısız görev tek başına yeniden denenir. İdempotent yazılmış bir ETL, bu araçlarla sorunsuz çalışır; idempotent olmayan ise her yeniden denemede mükerrer kayıt üretir.</p>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Üretim ETL\'inde olgunluk işaretleri</h3>
<p>İyi bir boru hattı; yapılandırmayı koddan ayırır (ortam değişkeni, TOML), her çalıştırma için metrik üretir (satır sayısı, süre, hata oranı) ve bu metrikleri bir panoya ya da uyarı sistemine gönderir. Hata oranı bir eşiği aşarsa (örneğin satırların yüzde biri) yükleme durdurulur; sessizce yüzde kırk hatalı dosya yüklemek, hiç yüklememekten kötüdür.</p>
<p>Veri kalitesi kontrolleri (data quality checks) yüklemeden sonra çalışır: bugünün toplamı dünün yüzde ellisinden azsa uyar, şehir listesinde bilinmeyen değer varsa uyar. Great Expectations ve pandera bu kontrolleri bildirimsel yazmanı sağlar. Büyük hacimde satır satır Python yerine pandas (ya da Polars) ile vektörel dönüştürme ve <code>to_sql</code>/COPY ile toplu yükleme yapılır; ancak hata kuyruğu, idempotency ve log disiplini aynı kalır.</p>
<p>Geriye dönük çalıştırma (backfill) için betik tarih parametresi almalı: <code>python -m etl.satis --tarih 2024-05-01</code>. Bugünün tarihini kodun içinde <code>date.today()</code> ile sabitlemek, bir hafta sonra "geçen pazartesiyi yeniden yükle" ihtiyacını imkânsız kılar.</p>
</section>`,
    ex: [
      { t: 'code', id: 'veri-boru-hatti-1',
        q: '<p><code>dogrula_satir(ham: dict) -> dict</code> yaz. Kurallar: <code>siparis_no</code> int\'e çevrilebilmeli; <code>tutar</code> <code>Decimal</code>\'e çevrilebilmeli ve negatif olmamalı; <code>adet</code> pozitif int; <code>sehir</code> kırpılmış ve boş olmamalı. Hata durumunda <code>ValueError</code>. Geçerliyse <code>{\'siparis_no\': int, \'sehir\': str, \'tutar_kurus\': int (tutar*100, yuvarlanmış), \'adet\': int}</code> döndür.</p>',
        start: 'from decimal import Decimal, InvalidOperation\n\ndef dogrula_satir(ham):\n    pass\n',
        sol: 'from decimal import Decimal, InvalidOperation\n\ndef dogrula_satir(ham):\n    try:\n        no = int(ham[\'siparis_no\'])\n        tutar = Decimal(str(ham[\'tutar\']))\n        adet = int(ham[\'adet\'])\n    except (KeyError, ValueError, InvalidOperation) as e:\n        raise ValueError(f\'tip hatası: {e}\') from e\n    if tutar < 0:\n        raise ValueError(\'tutar negatif\')\n    if adet <= 0:\n        raise ValueError(\'adet pozitif olmalı\')\n    sehir = str(ham.get(\'sehir\', \'\')).strip()\n    if not sehir:\n        raise ValueError(\'sehir boş\')\n    return {\'siparis_no\': no, \'sehir\': sehir, \'tutar_kurus\': int(round(tutar * 100)), \'adet\': adet}\n',
        tests: 'r = dogrula_satir({\'siparis_no\': \'1001\', \'sehir\': \' İzmir \', \'tutar\': \'149.90\', \'adet\': \'2\'})\nassert r == {\'siparis_no\': 1001, \'sehir\': \'İzmir\', \'tutar_kurus\': 14990, \'adet\': 2}, "Geçerli satır dönüştürülmeli"\nassert dogrula_satir({\'siparis_no\': 1, \'sehir\': \'A\', \'tutar\': \'0.1\', \'adet\': 1})[\'tutar_kurus\'] == 10, "0.1 -> 10 kuruş (float hatası olmamalı)"\nfor bozuk in (\n    {\'siparis_no\': \'x\', \'sehir\': \'A\', \'tutar\': \'1\', \'adet\': \'1\'},\n    {\'siparis_no\': \'1\', \'sehir\': \'A\', \'tutar\': \'abc\', \'adet\': \'1\'},\n    {\'siparis_no\': \'1\', \'sehir\': \'A\', \'tutar\': \'-5\', \'adet\': \'1\'},\n    {\'siparis_no\': \'1\', \'sehir\': \'A\', \'tutar\': \'5\', \'adet\': \'0\'},\n    {\'siparis_no\': \'1\', \'sehir\': \'  \', \'tutar\': \'5\', \'adet\': \'1\'},\n    {\'sehir\': \'A\', \'tutar\': \'5\', \'adet\': \'1\'},\n):\n    try:\n        dogrula_satir(bozuk)\n        assert False, f"Bozuk satır ValueError vermeli: {bozuk}"\n    except ValueError:\n        pass\n',
        hints: ['Decimal(str(x)) ile float girdiyi de güvenli çevir; InvalidOperation yakala.', 'KeyError\'ı da ValueError\'a çevir; eksik alan şema hatasıdır.'],
        why: 'Dönüştürme adımı tipleri sabitler ve parayı kuruşa çevirir; sonraki adımlar artık doğrulanmış veriyle çalışır.' },
      { t: 'code', id: 'veri-boru-hatti-2',
        q: '<p><code>extract_transform(metin: str, kaynak: str, dogrulayici) -> tuple[list, list]</code>: CSV metnini <code>csv.DictReader</code> ile okur, her satırı <code>dogrulayici(ham)</code>\'dan geçirir. Geçerli sonuçları ilk listeye; <code>ValueError</code> verenleri <code>{\'kaynak\', \'satir\', \'ham\', \'neden\'}</code> sözlüğü olarak ikinci listeye koyar. <code>satir</code> dosyadaki gerçek satır numarası (başlık 1, ilk veri 2).</p>',
        start: 'import csv, io\n\ndef extract_transform(metin, kaynak, dogrulayici):\n    pass\n',
        sol: 'import csv, io\n\ndef extract_transform(metin, kaynak, dogrulayici):\n    gecerli, hatalar = [], []\n    for i, ham in enumerate(csv.DictReader(io.StringIO(metin)), start=2):\n        try:\n            gecerli.append(dogrulayici(ham))\n        except ValueError as e:\n            hatalar.append({\'kaynak\': kaynak, \'satir\': i, \'ham\': ham, \'neden\': str(e)})\n    return gecerli, hatalar\n',
        tests: 'def d(ham):\n    if ham[\'tutar\'] == \'abc\':\n        raise ValueError(\'tutar sayı değil\')\n    return int(ham[\'no\'])\nmetin = \'no,tutar\\n1,5\\n2,abc\\n3,7\\n\'\ng, h = extract_transform(metin, \'x.csv\', d)\nassert g == [1, 3], "Geçerli satırlar sırayla"\nassert len(h) == 1 and h[0][\'satir\'] == 3 and h[0][\'kaynak\'] == \'x.csv\', "Hatalı satır 3. satırda"\nassert h[0][\'neden\'] == \'tutar sayı değil\' and h[0][\'ham\'] == {\'no\': \'2\', \'tutar\': \'abc\'}, "Hata kaydı alanları"\nassert extract_transform(\'no,tutar\\n\', \'y.csv\', d) == ([], []), "Boş dosya boş sonuç"\n',
        hints: ['enumerate(..., start=2) ile başlığı say.', 'Yalnızca ValueError yakala; programlama hataları yayılmalı.'],
        why: 'Bozuk satırı kuyruğa ayırıp devam etmek işi durdurmaz; satır numarası ve ham veri ile hata sabah kolayca bulunur.' },
      { t: 'mc', q: 'ETL yüklemesinin idempotent olması ne demektir?',
        o: ['Yükleme her zaman çok hızlı tamamlanır', 'Aynı girdiyle tekrar çalıştırmak sonucu değiştirmez', 'Yükleme hiçbir zaman hata vermez', 'Yükleme sırayla tek iş parçacığında yapılır'],
        a: 1, why: 'İdempotent yükleme, aynı dosyanın iki kez işlenmesinin mükerrer kayıt üretmemesi demektir; upsert ve yükleme kaydı tablosu ile sağlanır. Hız, hatasızlık ve iş parçacığı sayısıyla ilgisi yoktur.' },
      { t: 'code', id: 'veri-boru-hatti-4',
        q: '<p>İdempotent yükleme. <code>semayi_kur(con)</code>: <code>satis(siparis_no INTEGER PRIMARY KEY, sehir TEXT, tutar_kurus INTEGER, adet INTEGER)</code> tablosunu oluştursun (IF NOT EXISTS). <code>load(con, satirlar: list[dict]) -> int</code>: satırları <code>INSERT ... ON CONFLICT(siparis_no) DO UPDATE</code> ile tek işlemde yüklesin ve tablodaki toplam satır sayısını döndürsün. Satır sözlükleri <code>siparis_no, sehir, tutar_kurus, adet</code> anahtarlarını taşır.</p>',
        start: 'import sqlite3\n\ndef semayi_kur(con):\n    pass\n\ndef load(con, satirlar):\n    pass\n',
        sol: 'import sqlite3\n\ndef semayi_kur(con):\n    con.execute(\'\'\'CREATE TABLE IF NOT EXISTS satis (\n        siparis_no INTEGER PRIMARY KEY, sehir TEXT, tutar_kurus INTEGER, adet INTEGER)\'\'\')\n\ndef load(con, satirlar):\n    with con:\n        con.executemany(\'\'\'INSERT INTO satis (siparis_no, sehir, tutar_kurus, adet)\n            VALUES (:siparis_no, :sehir, :tutar_kurus, :adet)\n            ON CONFLICT(siparis_no) DO UPDATE SET sehir=excluded.sehir,\n                tutar_kurus=excluded.tutar_kurus, adet=excluded.adet\'\'\', satirlar)\n    return con.execute(\'SELECT COUNT(*) FROM satis\').fetchone()[0]\n',
        tests: 'con = sqlite3.connect(\':memory:\')\nsemayi_kur(con); semayi_kur(con)\nv = [{\'siparis_no\': 1, \'sehir\': \'İzmir\', \'tutar_kurus\': 1000, \'adet\': 1},\n     {\'siparis_no\': 2, \'sehir\': \'Bursa\', \'tutar_kurus\': 500, \'adet\': 2}]\nassert load(con, v) == 2, "İlk yükleme 2 satır"\nassert load(con, v) == 2, "Tekrar yükleme mükerrer üretmemeli"\nv[1][\'tutar_kurus\'] = 700\nassert load(con, [v[1]]) == 2, "Güncelleme satır eklememeli"\nassert con.execute(\'SELECT tutar_kurus FROM satis WHERE siparis_no=2\').fetchone()[0] == 700, "Çakışmada güncellenmeli"\nassert con.execute(\'SELECT SUM(tutar_kurus) FROM satis\').fetchone()[0] == 1700, "Toplam"\n',
        hints: ['executemany adlandırılmış parametrelerle (:ad) sözlük listesi alabilir.', 'with con: bloğu commit/rollback yönetir.'],
        why: 'PRIMARY KEY + ON CONFLICT DO UPDATE, "varsa güncelle yoksa ekle" davranışını tek SQL ile verir; işlem bloğu yarım yüklemeyi önler.' },
      { t: 'code', id: 'veri-boru-hatti-5',
        q: '<p>Dosya düzeni. <code>klasorleri_kur(kok: Path) -> dict</code>: <code>gelen</code>, <code>islenen</code>, <code>hatali</code> alt klasörlerini oluşturup <code>{\'gelen\': Path, ...}</code> döndürsün. <code>bekleyen_dosyalar(kok) -> list[Path]</code>: <code>gelen/</code> içindeki <code>satis_*.csv</code> dosyalarını ada göre sıralı döndürsün. <code>arsivle(dosya: Path, hedef_klasor: Path) -> Path</code>: dosyayı hedef klasöre taşıyıp yeni yolu döndürsün (<code>Path.replace</code> kullan).</p>',
        start: 'from pathlib import Path\n\ndef klasorleri_kur(kok):\n    pass\n\ndef bekleyen_dosyalar(kok):\n    pass\n\ndef arsivle(dosya, hedef_klasor):\n    pass\n',
        sol: 'from pathlib import Path\n\ndef klasorleri_kur(kok):\n    kok = Path(kok)\n    d = {ad: kok / ad for ad in (\'gelen\', \'islenen\', \'hatali\')}\n    for p in d.values():\n        p.mkdir(parents=True, exist_ok=True)\n    return d\n\ndef bekleyen_dosyalar(kok):\n    return sorted((Path(kok) / \'gelen\').glob(\'satis_*.csv\'))\n\ndef arsivle(dosya, hedef_klasor):\n    hedef = Path(hedef_klasor) / Path(dosya).name\n    Path(dosya).replace(hedef)\n    return hedef\n',
        tests: 'import tempfile, shutil\nkok = Path(tempfile.mkdtemp()) / \'etl_test\'\nd = klasorleri_kur(kok)\nassert set(d) == {\'gelen\', \'islenen\', \'hatali\'} and all(p.is_dir() for p in d.values()), "Üç klasör oluşmalı"\nklasorleri_kur(kok)\n(d[\'gelen\'] / \'satis_2024-05-02.csv\').write_text(\'a\')\n(d[\'gelen\'] / \'satis_2024-05-01.csv\').write_text(\'b\')\n(d[\'gelen\'] / \'notlar.txt\').write_text(\'c\')\nb = bekleyen_dosyalar(kok)\nassert [p.name for p in b] == [\'satis_2024-05-01.csv\', \'satis_2024-05-02.csv\'], "Yalnızca satis_*.csv, sıralı"\nyeni = arsivle(b[0], d[\'islenen\'])\nassert yeni == d[\'islenen\'] / \'satis_2024-05-01.csv\' and yeni.exists() and not b[0].exists(), "Dosya taşınmalı"\nassert len(bekleyen_dosyalar(kok)) == 1, "Taşınan dosya artık bekleyen değil"\nshutil.rmtree(kok.parent, ignore_errors=True)\n',
        hints: ['mkdir(parents=True, exist_ok=True) tekrar çağrıda hata vermez.', 'Path.glob(\'satis_*.csv\') ve sorted().'],
        why: 'pathlib ile klasör düzeni platformdan bağımsız kurulur; glob deseni ETL dışı dosyaları doğal olarak dışarıda bırakır.' },
      { t: 'code', id: 'veri-boru-hatti-6',
        q: '<p>Hata kuyruğu ve logging. <code>hata_kuyruguna_yaz(hatalar: list[dict], yol: Path) -> int</code>: her hatayı bir satır JSON (<code>ensure_ascii=False</code>) olarak dosyaya <b>ekleyerek</b> (append) yazsın, yazılan satır sayısını döndürsün. <code>etl_logger(akis) -> logging.Logger</code>: <code>\'etl\'</code> adlı logger\'a verilen akışa yazan bir <code>StreamHandler</code> eklesin, format <code>\'%(levelname)s %(message)s\'</code>, seviye INFO; önce logger\'daki eski handler\'ları temizlesin, <code>propagate=False</code> yapsın.</p>',
        start: 'import json, logging\nfrom pathlib import Path\n\ndef hata_kuyruguna_yaz(hatalar, yol):\n    pass\n\ndef etl_logger(akis):\n    pass\n',
        sol: 'import json, logging\nfrom pathlib import Path\n\ndef hata_kuyruguna_yaz(hatalar, yol):\n    yol = Path(yol)\n    with yol.open(\'a\', encoding=\'utf-8\') as f:\n        for h in hatalar:\n            f.write(json.dumps(h, ensure_ascii=False) + \'\\n\')\n    return len(hatalar)\n\ndef etl_logger(akis):\n    log = logging.getLogger(\'etl\')\n    log.handlers.clear()\n    h = logging.StreamHandler(akis)\n    h.setFormatter(logging.Formatter(\'%(levelname)s %(message)s\'))\n    log.addHandler(h)\n    log.setLevel(logging.INFO)\n    log.propagate = False\n    return log\n',
        tests: 'import io, tempfile\nyol = Path(tempfile.mkdtemp()) / \'hatalar.jsonl\'\nassert hata_kuyruguna_yaz([{\'satir\': 2, \'neden\': \'tutar sayı değil\'}], yol) == 1\nassert hata_kuyruguna_yaz([{\'satir\': 5, \'neden\': \'şehir yok\'}, {\'satir\': 6, \'neden\': \'x\'}], yol) == 2\nsatirlar = yol.read_text(encoding=\'utf-8\').strip().splitlines()\nassert len(satirlar) == 3, "Append ile 3 satır olmalı"\nassert json.loads(satirlar[1])[\'neden\'] == \'şehir yok\' and \'şehir\' in satirlar[1], "Türkçe karakter kaçırılmadan yazılmalı"\nakis = io.StringIO()\nlog = etl_logger(akis)\nlog.debug(\'gizli\'); log.info(\'yüklendi %d\', 3); log.warning(\'uyarı\')\nciktilar = akis.getvalue().strip().splitlines()\nassert ciktilar == [\'INFO yüklendi 3\', \'WARNING uyarı\'], f"Log biçimi/seviyesi yanlış: {ciktilar}"\nlog2 = etl_logger(io.StringIO())\nassert len(log2.handlers) == 1 and log2 is log, "Tekrar çağrıda handler birikmemeli"\n',
        hints: ['JSONL: her satır bir JSON nesnesi, dosya \'a\' modunda açılır.', 'logging.getLogger(\'etl\') aynı nesneyi döndürür; handlers.clear() ile birikmeyi önle.'],
        why: 'JSONL hata kuyruğu hem insan hem makine tarafından okunur; dedicated logger ile ETL\'in kaydı uygulamanın diğer loglarından ayrışır.' },
      { t: 'mc', q: 'Yüklenen dosyayı <code>islenen/</code> klasörüne taşımak için en doğru an hangisi?',
        o: ['Dosya okunur okunmaz', 'Dönüştürme adımı bittiğinde', 'Veritabanı işlemi (commit) başarıyla tamamlandıktan sonra', 'Hata kuyruğu yazıldığında'],
        a: 2, why: 'Dosya ancak verisi kalıcı olarak veritabanına girdikten sonra işlenmiş sayılır. Daha erken taşırsan rollback durumunda dosya "işlendi" görünür ama veri yoktur.' }
    ],
    faq: [
      { q: 'Satır satır Python yerine pandas kullanmalı mıyım?', a: 'Dosya büyükse (yüz binlerce satır) evet: vektörel dönüştürme çok daha hızlıdır. Ancak hata kuyruğu, idempotent yükleme ve log disiplini aynen kalır; pandas yalnızca transform adımını değiştirir.' },
      { q: 'cron mu Airflow mu?', a: 'Tek betik, tek bağımlılık, günde bir çalışma: cron yeter. Birbirine bağlı görevler, yeniden deneme, geriye dönük çalıştırma ve izleme gerekiyorsa bir orkestratör (Airflow, Prefect, Dagster).' },
      { q: 'Hata oranı ne zaman işi durdurmalı?', a: 'Ekiple bir eşik belirle (örneğin satırların yüzde biri). Eşik altı hatalar kuyruğa gider, iş devam eder; eşik üstü dosya tamamen reddedilir ve uyarı gönderilir. Sessizce yarı bozuk veri yüklemek en kötü senaryodur.' }
    ],
    mistakes: [
      { bad: 'for ham in reader:\n    satislar.append(dogrula(ham))  # ilk bozuk satırda iş durur', good: 'for i, ham in enumerate(reader, start=2):\n    try:\n        satislar.append(dogrula(ham))\n    except ValueError as e:\n        hatalar.append({\'satir\': i, \'neden\': str(e)})', why: 'Tek bozuk satır bütün günün yüklemesini engellememeli; hata kuyruğuna ayır.' },
      { bad: 'con.execute(\'INSERT INTO satis VALUES (?, ?, ?)\', satir)\n# aynı dosya ikinci kez gelince mükerrer', good: 'con.execute(\'INSERT INTO satis VALUES (?, ?, ?) ON CONFLICT(siparis_no) DO UPDATE SET ...\', satir)', why: 'Upsert ile tekrar çalıştırma güvenli olur; yeniden denemeler mükerrer kayıt üretmez.' },
      { bad: 'shutil.move(dosya, islenen)\nload(con, satislar)', good: 'load(con, satislar)   # commit\nshutil.move(dosya, islenen)', why: 'Önce taşıyıp sonra yüklersen yükleme başarısız olunca dosya kaybolmuş gibi görünür.' },
      { bad: 'tarih = date.today()  # betik içinde sabit', good: 'parser.add_argument(\'--tarih\', default=str(date.today()))', why: 'Tarih parametre olmazsa geçmiş bir günü yeniden yüklemek (backfill) mümkün olmaz.' }
    ]
  }
);
})(window);
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{ id: 'paketleme-dagitim', lv: 'ileri', mod: 'Üretime Hazırlık', min: 36,
    title: 'Paketleme ve dağıtım: pyproject, CLI, sürümleme, wheel ve Docker',
    sum: 'Kodunu kurulabilir bir pakete dönüştür: pyproject.toml, src düzeni, argparse ile CLI, entry point, semver, wheel/sdist, pip install -e ve Docker\'a kısa bakış.',
    goals: ['pyproject.toml ve src düzeniyle kurulabilir paket iskeleti kurabilirim', 'argparse ile alt komutlu, test edilebilir bir CLI yazabilirim', 'Entry point ile paketimi terminal komutu olarak sunabilirim', 'Semantik sürümlemeyi uygular ve sürümleri karşılaştırabilirim', 'wheel/sdist üretimi, editable kurulum ve Docker imajının temel mantığını açıklayabilirim'],
    body: `<h2>Neden önemli?</h2>
<p>"Bilgisayarımda çalışıyor" cümlesi, kurumsal yazılımda bir hata raporudur. Ilgaz Bank\'ta yazdığın kredi skoru modülü üç farklı ekibin projesinde, bir zamanlanmış görevde ve bir Docker konteynerinde çalışacaksa; kodu <b>paket</b> olarak kurulabilir, sürümlenebilir ve komut satırından çağrılabilir yapman gerekir. Bu ders modern Python paketleme standardını (PEP 517/518/621) ve dağıtım zincirini anlatır. Pyodide\'de <code>pip</code> ve derleme araçları yok; bu yüzden yapılandırma dosyalarını gösterim olarak okuyacak, CLI ve sürümleme mantığını ise gerçekten çalıştıracağız.</p>

<h2>pyproject.toml ve src düzeni</h2>
<p><code>pyproject.toml</code>, paketin tek yapılandırma dosyasıdır: ad, sürüm, bağımlılıklar, derleme aracı ve araç ayarları (ruff, mypy, pytest). <b>src düzeni</b> (src layout) paketi <code>src/paket_adi/</code> altına koyar; böylece testler kurulmamış kaynak klasörü yerine kurulu paketi içe aktarır ve "yerelde çalışıyor, kurulunca çalışmıyor" hatası erken yakalanır.</p>
<pre class="py">PYPROJECT = '''
[build-system]
requires = ["setuptools&gt;=69", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "anadolu-skor"
version = "1.2.0"
description = "Ilgaz Bank kredi skoru araçları"
requires-python = "&gt;=3.11"
dependencies = ["httpx&gt;=0.27", "pydantic&gt;=2"]

[project.optional-dependencies]
dev = ["pytest", "ruff", "mypy"]

[project.scripts]
anadolu-skor = "anadolu_skor.cli:main"

[tool.setuptools.packages.find]
where = ["src"]
'''
import tomllib
cfg = tomllib.loads(PYPROJECT)
print(cfg['project']['name'], cfg['project']['version'])
print('bağımlılıklar:', cfg['project']['dependencies'])
print('komut:', cfg['project']['scripts'])
</pre>
<div class="tbl-wrap"><table><tr><th>Dosya / klasör</th><th>Görevi</th></tr><tr><td>pyproject.toml</td><td>Paket üst verisi, bağımlılıklar, araç ayarları</td></tr><tr><td>src/anadolu_skor/__init__.py</td><td>Paket kökü; <code>__version__</code> burada</td></tr><tr><td>src/anadolu_skor/cli.py</td><td>Komut satırı giriş noktası</td></tr><tr><td>tests/</td><td>pytest testleri (paketin dışında)</td></tr><tr><td>README.md, LICENSE, CHANGELOG.md</td><td>Belgeleme ve lisans; README PyPI sayfası olur</td></tr><tr><td>dist/</td><td>Üretilen wheel ve sdist (git\'e girmez)</td></tr></table></div>
<div class="note"><b>requirements.txt ile farkı</b><code>dependencies</code> paketin ihtiyaç duyduğu <i>aralıkları</i> söyler (<code>httpx&gt;=0.27</code>). <code>requirements.txt</code> ya da lock dosyası (pip-tools, uv, poetry) ise belirli bir ortamda kurulan <i>tam sürümleri</i> sabitler. Kütüphane yazıyorsan geniş aralık; uygulama dağıtıyorsan lock dosyası.</div>

<h2>argparse ile CLI</h2>
<p>Paket bir komut sunuyorsa giriş noktası <code>main(argv=None)</code> imzalı olmalı: <code>parse_args(argv)</code> listeyi parametre alır; böylece test, <code>sys.argv</code>\'ye dokunmadan <code>main(['skor', '--gelir', '5000'])</code> çağırabilir. Alt komutlar (<code>skor</code>, <code>rapor</code>) için <code>add_subparsers</code> kullan ve her alt komuta <code>set_defaults(func=...)</code> ile işlev bağla.</p>
<pre class="py">import argparse, json

def skor_hesapla(gelir: float, gecikme: int) -&gt; int:
    return int(max(300, min(900, gelir / 100 - gecikme * 40)))

def cmd_skor(args):
    s = skor_hesapla(args.gelir, args.gecikme)
    if args.json:
        print(json.dumps({'gelir': args.gelir, 'gecikme': args.gecikme, 'skor': s}))
    else:
        print(f'Skor: {s}')
    return 0 if s &gt;= 500 else 2            # çıkış kodu: 2 = riskli

def cmd_surum(args):
    print('anadolu-skor 1.2.0'); return 0

def build_parser():
    p = argparse.ArgumentParser(prog='anadolu-skor', description='Kredi skoru araçları')
    p.add_argument('-v', '--verbose', action='store_true')
    sub = p.add_subparsers(dest='komut', required=True)
    s = sub.add_parser('skor', help='skor hesapla')
    s.add_argument('--gelir', type=float, required=True)
    s.add_argument('--gecikme', type=int, default=0)
    s.add_argument('--json', action='store_true')
    s.set_defaults(func=cmd_skor)
    sub.add_parser('surum', help='sürümü yaz').set_defaults(func=cmd_surum)
    return p

def main(argv=None) -&gt; int:
    args = build_parser().parse_args(argv)
    return args.func(args)

print('çıkış:', main(['skor', '--gelir', '60000', '--gecikme', '1']))
print('çıkış:', main(['skor', '--gelir', '20000', '--gecikme', '3', '--json']))
print('çıkış:', main(['surum']))
</pre>
<div class="tip"><b>Çıkış kodu</b><code>main</code> int döndürsün, <code>if __name__ == '__main__': raise SystemExit(main())</code> ile çağrılsın. 0 başarı, 1 genel hata, 2 kullanım hatası geleneği cron ve CI\'da "iş başarısız" sinyalini ücretsiz verir. Hata mesajları <code>stderr</code>\'a, veri <code>stdout</code>\'a: böylece çıktı boruyla başka komuta aktarılabilir.</div>

<h2>Entry point ve editable kurulum</h2>
<p><code>[project.scripts]</code> altındaki <code>anadolu-skor = "anadolu_skor.cli:main"</code> satırı, kurulumda <code>anadolu-skor</code> adlı bir çalıştırılabilir üretir; bu dosya <code>main()</code>\'i çağırıp dönüş değerini çıkış koduna çevirir. Geliştirme sırasında <code>pip install -e .</code> (editable) paketi kopyalamak yerine kaynağa bağlar: kodu değiştirince yeniden kurmadan etkisi görülür.</p>
<div class="steps-list"><ol><li><code>python -m venv .venv &amp;&amp; source .venv/bin/activate</code></li><li><code>pip install -e ".[dev]"</code> → paket + geliştirme bağımlılıkları</li><li><code>anadolu-skor skor --gelir 50000</code> → entry point çalışır</li><li><code>pytest</code> → testler kurulu paketi içe aktarır</li><li><code>python -m build</code> → <code>dist/anadolu_skor-1.2.0-py3-none-any.whl</code> ve <code>.tar.gz</code></li><li><code>twine upload dist/*</code> (ya da şirket içi depo: Artifactory, Nexus, devpi)</li></ol></div>

<h2>Sürümleme: semver</h2>
<p>Semantik sürümleme <code>MAJOR.MINOR.PATCH</code>: PATCH hata düzeltmesi (geriye uyumlu), MINOR yeni özellik (geriye uyumlu), MAJOR kırıcı değişiklik. Ön sürüm ekleri (<code>1.3.0rc1</code>) sıralamada final sürümün önüne gelir. Bağımlılık belirtirken <code>&gt;=1.2,&lt;2</code> (ya da <code>~=1.2</code>) kalıbı, kırıcı değişikliği dışarıda bırakır. Sürümü tek yerde tut: <code>pyproject.toml</code>\'da ya da <code>__init__.py</code>\'de (<code>dynamic = ["version"]</code> ile diğerinden okunur).</p>
<pre class="py">import re
from functools import total_ordering

@total_ordering
class Surum:
    _rx = re.compile(r'^(\\d+)\\.(\\d+)\\.(\\d+)(?:rc(\\d+))?$')

    def __init__(self, metin):
        m = self._rx.match(metin)
        if not m:
            raise ValueError(f'geçersiz sürüm: {metin!r}')
        self.major, self.minor, self.patch = (int(m[i]) for i in (1, 2, 3))
        self.rc = int(m[4]) if m[4] else None

    def _anahtar(self):
        # rc'li sürüm aynı numaralı finalden küçük: (.., 0, rc) &lt; (.., 1, 0)
        return (self.major, self.minor, self.patch, 0 if self.rc is not None else 1, self.rc or 0)

    def __eq__(self, o): return self._anahtar() == o._anahtar()
    def __lt__(self, o): return self._anahtar() &lt; o._anahtar()
    def __repr__(self):
        return f'{self.major}.{self.minor}.{self.patch}' + (f'rc{self.rc}' if self.rc is not None else '')

    def uyumlu(self, diger):
        """~= uyumu: aynı major, en az bu sürüm."""
        return self.major == diger.major and diger &gt;= self

print(sorted(Surum(s) for s in ['1.10.0', '1.2.0', '1.2.0rc1', '2.0.0', '1.9.3']))
print(Surum('1.2.0').uyumlu(Surum('1.9.3')), Surum('1.2.0').uyumlu(Surum('2.0.0')))
</pre>
<div class="warn"><b>Sürüm metni sıralaması</b><code>'1.10.0' &lt; '1.9.0'</code> metin olarak doğrudur ama sürüm olarak yanlıştır. Her zaman sayısal parçalara ayır ya da <code>packaging.version.Version</code> kullan.</div>

<h2>wheel, sdist ve Docker</h2>
<p><b>sdist</b> (source distribution) kaynak kodun arşividir; kurulumda derlenir. <b>wheel</b> önceden derlenmiş, doğrudan kopyalanan biçimdir; saf Python paketlerde <code>py3-none-any</code>, C uzantılılarda platforma özel etiket taşır. Kurumsal depolara wheel yüklemek kurulumu hızlandırır ve derleme araçları gerektirmez.</p>
<p>Docker, paketi işletim sistemi ve Python sürümüyle birlikte paketler. Tipik <code>Dockerfile</code> iki aşamalıdır: ilk aşamada wheel üretilir, ikinci aşamada yalnızca wheel kurulur; böylece derleme araçları son imaja girmez ve imaj küçük kalır.</p>
<pre class="py">DOCKERFILE = '''
FROM python:3.12-slim AS build
WORKDIR /src
COPY . .
RUN pip install --no-cache-dir build &amp;&amp; python -m build --wheel

FROM python:3.12-slim
COPY --from=build /src/dist/*.whl /tmp/
RUN pip install --no-cache-dir /tmp/*.whl &amp;&amp; rm /tmp/*.whl
USER 1000
ENTRYPOINT ["anadolu-skor"]
CMD ["--help"]
'''
asamalar = [s for s in DOCKERFILE.splitlines() if s.startswith('FROM')]
print('aşama sayısı:', len(asamalar))
for s in asamalar:
    print(' ', s)
</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Kurumsal dağıtım zinciri</h3>
<p>Olgun ekiplerde paket sürümü git etiketinden türetilir (<code>setuptools-scm</code> ya da <code>hatch-vcs</code>): <code>v1.2.0</code> etiketi atılınca CI wheel üretir, testleri koşar, şirket içi PyPI\'ye yükler ve Docker imajını aynı etiketle kayıt defterine (registry) iter. Elle sürüm numarası yazmak ve "unuttum" hataları böylece biter. CHANGELOG, "Keep a Changelog" biçiminde tutulur ve her MINOR/MAJOR sürümde kırıcı değişiklikler açıkça yazılır.</p>
<p>Bağımlılık güvenliği: lock dosyası tekrarlanabilir kurulum sağlar; <code>pip-audit</code> bilinen zafiyetleri tarar; Dependabot/Renovate güncellemeleri otomatik PR olarak açar. Docker imajında <code>root</code> olmayan kullanıcı, sabitlenmiş temel imaj etiketi ve <code>--no-cache-dir</code> standarttır.</p>
<p>Alternatif araç zincirleri: <code>uv</code> (çok hızlı pip/venv/lock), <code>poetry</code> ve <code>hatch</code> (bağımlılık + derleme + yayın tek araç). Hepsi aynı <code>pyproject.toml</code> standardına dayanır; ekip hangisini seçerse seçsin bu dersteki kavramlar değişmez.</p>
</section>`,
    ex: [
      { t: 'code', id: 'paketleme-dagitim-1',
        q: '<p><code>argparse</code> ile <code>build_parser()</code> ve <code>main(argv=None) -> int</code> yaz. Program adı <code>anadolu-market</code>. Alt komutlar: <code>kdv</code> (<code>--tutar</code> float zorunlu, <code>--oran</code> float varsayılan 0.20) KDV dahil tutarı <code>f\'{x:.2f}\'</code> biçiminde yazdırıp 0 döndürsün; <code>sehirler</code> (<code>--sayi</code> int varsayılan 3) <code>[\'İstanbul\', \'Ankara\', \'İzmir\', \'Bursa\', \'Antalya\']</code> listesinin ilk <code>sayi</code> elemanını her satıra bir tane yazdırıp 0 döndürsün. Alt komut zorunlu olsun.</p>',
        start: 'import argparse\n\nSEHIRLER = [\'İstanbul\', \'Ankara\', \'İzmir\', \'Bursa\', \'Antalya\']\n\ndef build_parser():\n    pass\n\ndef main(argv=None):\n    pass\n',
        sol: 'import argparse\n\nSEHIRLER = [\'İstanbul\', \'Ankara\', \'İzmir\', \'Bursa\', \'Antalya\']\n\ndef cmd_kdv(args):\n    print(f\'{args.tutar * (1 + args.oran):.2f}\')\n    return 0\n\ndef cmd_sehirler(args):\n    for s in SEHIRLER[:args.sayi]:\n        print(s)\n    return 0\n\ndef build_parser():\n    p = argparse.ArgumentParser(prog=\'anadolu-market\')\n    sub = p.add_subparsers(dest=\'komut\', required=True)\n    k = sub.add_parser(\'kdv\')\n    k.add_argument(\'--tutar\', type=float, required=True)\n    k.add_argument(\'--oran\', type=float, default=0.20)\n    k.set_defaults(func=cmd_kdv)\n    s = sub.add_parser(\'sehirler\')\n    s.add_argument(\'--sayi\', type=int, default=3)\n    s.set_defaults(func=cmd_sehirler)\n    return p\n\ndef main(argv=None):\n    args = build_parser().parse_args(argv)\n    return args.func(args)\n',
        tests: 'import io, contextlib\ndef calistir(argv):\n    buf = io.StringIO()\n    with contextlib.redirect_stdout(buf):\n        kod = main(argv)\n    return kod, buf.getvalue()\nkod, out = calistir([\'kdv\', \'--tutar\', \'100\'])\nassert kod == 0 and out.strip() == \'120.00\', f"kdv varsayılan oran: {out!r}"\nkod, out = calistir([\'kdv\', \'--tutar\', \'50\', \'--oran\', \'0.1\'])\nassert out.strip() == \'55.00\', "kdv özel oran"\nkod, out = calistir([\'sehirler\'])\nassert out.strip().splitlines() == [\'İstanbul\', \'Ankara\', \'İzmir\'], "sehirler varsayılan 3"\nkod, out = calistir([\'sehirler\', \'--sayi\', \'1\'])\nassert out.strip() == \'İstanbul\', "sehirler --sayi 1"\np = build_parser()\nassert p.prog == \'anadolu-market\', "prog adı"\ntry:\n    with contextlib.redirect_stderr(io.StringIO()):\n        p.parse_args([])\n    assert False, "Alt komut zorunlu olmalı"\nexcept SystemExit:\n    pass\n',
        hints: ['add_subparsers(dest=\'komut\', required=True).', 'Her alt komuta set_defaults(func=...) ile işlev bağla; main args.func(args) döndürsün.'],
        why: 'parse_args(argv) ile CLI saf bir fonksiyon gibi test edilir; alt komut + set_defaults kalıbı komut sayısı arttıkça if zincirini önler.' },
      { t: 'mc', q: '<code>pip install -e .</code> komutunun etkisi nedir?',
        o: ['Paketi site-packages\'a kopyalar', 'Paketi kaynak klasöre bağlar; kod değişikliği kurulum yenilemeden görünür', 'Yalnızca bağımlılıkları kurar, paketi kurmaz', 'Paketi wheel olarak derleyip dist/ klasörüne yazar'],
        a: 1, why: 'Editable kurulum paketi kopyalamak yerine kaynağa işaret eder; geliştirme sırasında her değişiklikte yeniden kurma gerekmez. Wheel üretimi python -m build işidir.' },
      { t: 'code', id: 'paketleme-dagitim-3',
        q: '<p><code>Surum</code> sınıfı yaz: <code>Surum(\'1.2.3\')</code> ya da <code>Surum(\'1.2.3rc1\')</code> ayrıştırsın (geçersizse <code>ValueError</code>); <code>major, minor, patch, rc</code> öznitelikleri (rc yoksa None). Karşılaştırma: rc\'li sürüm aynı numaralı finalden küçük, rc\'ler kendi aralarında sayıyla sıralanır. <code>__eq__</code>, <code>__lt__</code> (ve total_ordering) ile <code>sorted</code> çalışsın. <code>str(s)</code> orijinal biçimi versin. Ek metot <code>yukselt(seviye)</code>: <code>\'major\'|\'minor\'|\'patch\'</code> için yeni (rc\'siz) Surum döndürsün; major artınca minor ve patch sıfırlanır, minor artınca patch sıfırlanır.</p>',
        start: 'import re\nfrom functools import total_ordering\n\n@total_ordering\nclass Surum:\n    pass\n',
        sol: 'import re\nfrom functools import total_ordering\n\n@total_ordering\nclass Surum:\n    _rx = re.compile(r\'^(\\d+)\\.(\\d+)\\.(\\d+)(?:rc(\\d+))?$\')\n\n    def __init__(self, metin):\n        m = self._rx.match(metin)\n        if not m:\n            raise ValueError(f\'geçersiz sürüm: {metin!r}\')\n        self.major, self.minor, self.patch = int(m[1]), int(m[2]), int(m[3])\n        self.rc = int(m[4]) if m[4] else None\n\n    def _anahtar(self):\n        return (self.major, self.minor, self.patch, 0 if self.rc is not None else 1, self.rc or 0)\n\n    def __eq__(self, o):\n        return isinstance(o, Surum) and self._anahtar() == o._anahtar()\n\n    def __lt__(self, o):\n        return self._anahtar() < o._anahtar()\n\n    def __hash__(self):\n        return hash(self._anahtar())\n\n    def __str__(self):\n        s = f\'{self.major}.{self.minor}.{self.patch}\'\n        return s + (f\'rc{self.rc}\' if self.rc is not None else \'\')\n\n    def yukselt(self, seviye):\n        if seviye == \'major\':\n            return Surum(f\'{self.major + 1}.0.0\')\n        if seviye == \'minor\':\n            return Surum(f\'{self.major}.{self.minor + 1}.0\')\n        if seviye == \'patch\':\n            return Surum(f\'{self.major}.{self.minor}.{self.patch + 1}\')\n        raise ValueError(seviye)\n',
        tests: 's = Surum(\'1.2.3rc1\')\nassert (s.major, s.minor, s.patch, s.rc) == (1, 2, 3, 1), "Ayrıştırma"\nassert Surum(\'2.0.0\').rc is None, "rc yoksa None"\nassert str(Surum(\'1.10.0\')) == \'1.10.0\' and str(s) == \'1.2.3rc1\', "__str__"\nsirali = [str(x) for x in sorted(Surum(v) for v in [\'1.10.0\', \'1.2.0\', \'1.2.0rc2\', \'1.2.0rc1\', \'2.0.0\', \'1.9.3\'])]\nassert sirali == [\'1.2.0rc1\', \'1.2.0rc2\', \'1.2.0\', \'1.9.3\', \'1.10.0\', \'2.0.0\'], f"Sıralama yanlış: {sirali}"\nassert Surum(\'1.2.0\') == Surum(\'1.2.0\') and Surum(\'1.2.0\') >= Surum(\'1.2.0rc9\'), "Eşitlik ve >="\nassert str(Surum(\'1.2.3\').yukselt(\'major\')) == \'2.0.0\', "major yükseltme"\nassert str(Surum(\'1.2.3\').yukselt(\'minor\')) == \'1.3.0\', "minor yükseltme"\nassert str(Surum(\'1.2.3rc1\').yukselt(\'patch\')) == \'1.2.4\', "patch yükseltme rc\'yi düşürmeli"\nfor kotu in (\'1.2\', \'v1.2.3\', \'1.2.3-beta\', \'a.b.c\'):\n    try:\n        Surum(kotu); assert False, f"{kotu} ValueError vermeli"\n    except ValueError:\n        pass\n',
        hints: ['Regex: ^(\\d+)\\.(\\d+)\\.(\\d+)(?:rc(\\d+))?$', 'Sıralama anahtarı: (major, minor, patch, 0 rc varsa / 1 final, rc_no).'],
        why: 'Sürümü sayısal parçalara ayırmak metin sıralaması hatasını önler; rc için ek bayrak, ön sürümü finalden önce konumlandırır.' },
      { t: 'code', id: 'paketleme-dagitim-4',
        q: '<p>Bağımlılık belirtimi çözümleyici. <code>uyumlu_mu(belirtim: str, surum: str) -> bool</code>: belirtim <code>\'&gt;=1.2,&lt;2\'</code> gibi virgülle ayrılmış koşullardan oluşur; operatörler <code>&gt;=, &lt;=, &gt;, &lt;, ==, !=</code>. Sürümler <code>\'1.2\'</code> ya da <code>\'1.2.3\'</code> biçiminde; eksik parçalar 0 sayılır (<code>1.2 == 1.2.0</code>). Tüm koşullar sağlanıyorsa True. Boş belirtim her sürümle uyumludur.</p>',
        start: 'import operator\n\ndef uyumlu_mu(belirtim, surum):\n    pass\n',
        sol: 'import operator, re\n\n_OPS = {\'>=\': operator.ge, \'<=\': operator.le, \'>\': operator.gt, \'<\': operator.lt, \'==\': operator.eq, \'!=\': operator.ne}\n\ndef _parcala(v):\n    p = [int(x) for x in v.strip().split(\'.\')]\n    while len(p) < 3:\n        p.append(0)\n    return tuple(p)\n\ndef uyumlu_mu(belirtim, surum):\n    hedef = _parcala(surum)\n    for kosul in filter(None, (k.strip() for k in belirtim.split(\',\'))):\n        m = re.match(r\'^(>=|<=|==|!=|>|<)\\s*([\\d.]+)$\', kosul)\n        if not m:\n            raise ValueError(f\'geçersiz koşul: {kosul!r}\')\n        if not _OPS[m[1]](hedef, _parcala(m[2])):\n            return False\n    return True\n',
        tests: 'assert uyumlu_mu(\'>=1.2,<2\', \'1.9.3\'), "1.9.3 aralıkta"\nassert not uyumlu_mu(\'>=1.2,<2\', \'2.0.0\'), "2.0.0 üst sınır dışı"\nassert not uyumlu_mu(\'>=1.2,<2\', \'1.1.9\'), "1.1.9 alt sınır dışı"\nassert uyumlu_mu(\'==1.2\', \'1.2.0\'), "1.2 == 1.2.0"\nassert uyumlu_mu(\'!=1.2.3\', \'1.2.4\') and not uyumlu_mu(\'!=1.2.3\', \'1.2.3\'), "!="\nassert uyumlu_mu(\'>1.10\', \'1.11.0\') and not uyumlu_mu(\'>1.10\', \'1.9.9\'), "1.10 > 1.9 sayısal karşılaştırma"\nassert uyumlu_mu(\'\', \'0.0.1\'), "Boş belirtim her şeyle uyumlu"\nassert uyumlu_mu(\' >= 1.0 , <= 1.5 \', \'1.5\'), "Boşluklar tolere edilmeli"\n',
        hints: ['Sürümü tuple\'a çevir, eksik parçaları 0 ile doldur; tuple karşılaştırması sayısaldır.', 'operator modülündeki ge/le/gt/lt/eq/ne fonksiyonlarını sözlükte eşle.'],
        why: 'pip\'in yaptığı işin sade hali: her koşul bağımsız değerlendirilir, hepsi sağlanmalı. Tuple karşılaştırması 1.10 > 1.9 sorununu çözer.' },
      { t: 'mc', q: 'Bir kütüphane <code>1.4.2</code> sürümünde. Geriye uyumlu yeni bir fonksiyon eklendi. Semver\'e göre yeni sürüm ne olmalı?',
        o: ['2.0.0', '1.4.3', '1.5.0', '1.4.2.1'],
        a: 2, why: 'Geriye uyumlu yeni özellik MINOR artışıdır: 1.5.0 (PATCH sıfırlanır). 1.4.3 hata düzeltmesi, 2.0.0 kırıcı değişiklik içindir.' },
      { t: 'code', id: 'paketleme-dagitim-6',
        q: '<p>pyproject doğrulayıcı. <code>pyproject_kontrol(metin: str) -> list[str]</code>: TOML metnini <code>tomllib.loads</code> ile ayrıştırıp şu sorunları listelesin (sorun yoksa boş liste): <code>\'build-system eksik\'</code>; <code>\'project.name eksik\'</code>; <code>\'project.version geçersiz\'</code> (yoksa ya da <code>X.Y.Z</code> biçiminde değilse); <code>\'project.requires-python eksik\'</code>; her <code>project.scripts</code> girdisi <code>\'modul.yol:fonksiyon\'</code> biçiminde değilse <code>f\'scripts.{ad} geçersiz\'</code>. Sorunlar bu sırayla listelensin.</p>',
        start: 'import tomllib, re\n\ndef pyproject_kontrol(metin):\n    pass\n',
        sol: 'import tomllib, re\n\ndef pyproject_kontrol(metin):\n    cfg = tomllib.loads(metin)\n    sorunlar = []\n    if \'build-system\' not in cfg:\n        sorunlar.append(\'build-system eksik\')\n    proje = cfg.get(\'project\', {})\n    if \'name\' not in proje:\n        sorunlar.append(\'project.name eksik\')\n    if not re.fullmatch(r\'\\d+\\.\\d+\\.\\d+\', str(proje.get(\'version\', \'\'))):\n        sorunlar.append(\'project.version geçersiz\')\n    if \'requires-python\' not in proje:\n        sorunlar.append(\'project.requires-python eksik\')\n    for ad, hedef in proje.get(\'scripts\', {}).items():\n        if not re.fullmatch(r\'[A-Za-z_][\\w.]*:[A-Za-z_]\\w*\', str(hedef)):\n            sorunlar.append(f\'scripts.{ad} geçersiz\')\n    return sorunlar\n',
        tests: 'iyi = \'\'\'\n[build-system]\nrequires = ["setuptools"]\n[project]\nname = "anadolu-skor"\nversion = "1.2.0"\nrequires-python = ">=3.11"\n[project.scripts]\nanadolu-skor = "anadolu_skor.cli:main"\n\'\'\'\nassert pyproject_kontrol(iyi) == [], "Geçerli dosyada sorun olmamalı"\nkotu = \'\'\'\n[project]\nversion = "1.2"\n[project.scripts]\nx = "anadolu_skor.cli"\ny = "paket.mod:main"\n\'\'\'\nassert pyproject_kontrol(kotu) == [\'build-system eksik\', \'project.name eksik\', \'project.version geçersiz\', \'project.requires-python eksik\', \'scripts.x geçersiz\'], f"Sorun listesi: {pyproject_kontrol(kotu)}"\nassert pyproject_kontrol(\'[build-system]\\nrequires=[]\\n\') == [\'project.name eksik\', \'project.version geçersiz\', \'project.requires-python eksik\'], "project tablosu yoksa"\n',
        hints: ['tomllib.loads sözlük döndürür; cfg.get(\'project\', {}) ile güvenli eriş.', 'Entry point biçimi için re.fullmatch(r\'[\\w.]+:\\w+\', hedef).'],
        why: 'CI\'da böyle bir kontrol, "yanlış entry point ile yayınlanan paket" gibi pahalı hataları yayından önce yakalar.' },
      { t: 'code', id: 'paketleme-dagitim-7',
        q: '<p>Çıkış kodu ve stderr disiplini. <code>main(argv) -> int</code>: tek argüman <code>--dosya YOL</code> alır. Dosya yoksa <code>sys.stderr</code>\'a <code>f\'hata: {yol} bulunamadı\'</code> yazıp 1 döndürür. Varsa satır sayısını <code>stdout</code>\'a yazıp 0 döndürür. Argüman eksikse argparse\'ın kendi davranışı (SystemExit 2) kalsın.</p>',
        start: 'import argparse, sys\nfrom pathlib import Path\n\ndef main(argv=None):\n    pass\n',
        sol: 'import argparse, sys\nfrom pathlib import Path\n\ndef main(argv=None):\n    p = argparse.ArgumentParser(prog=\'satir-say\')\n    p.add_argument(\'--dosya\', required=True)\n    args = p.parse_args(argv)\n    yol = Path(args.dosya)\n    if not yol.exists():\n        print(f\'hata: {args.dosya} bulunamadı\', file=sys.stderr)\n        return 1\n    print(len(yol.read_text(encoding=\'utf-8\').splitlines()))\n    return 0\n',
        tests: 'import io, contextlib, tempfile\nd = Path(tempfile.mkdtemp())\n(d / \'a.txt\').write_text(\'x\\ny\\nz\\n\', encoding=\'utf-8\')\nout, err = io.StringIO(), io.StringIO()\nwith contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):\n    kod = main([\'--dosya\', str(d / \'a.txt\')])\nassert kod == 0 and out.getvalue().strip() == \'3\' and err.getvalue() == \'\', "Var olan dosya: 3 satır, stderr boş"\nout, err = io.StringIO(), io.StringIO()\nwith contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):\n    kod = main([\'--dosya\', str(d / \'yok.txt\')])\nassert kod == 1 and out.getvalue() == \'\' and \'bulunamadı\' in err.getvalue(), "Olmayan dosya: kod 1, mesaj stderr\'da"\ntry:\n    with contextlib.redirect_stderr(io.StringIO()):\n        main([])\n    assert False, "Eksik argüman SystemExit vermeli"\nexcept SystemExit as e:\n    assert e.code == 2, "argparse kullanım hatası kodu 2"\n',
        hints: ['print(..., file=sys.stderr) ile hata akışına yaz.', 'Dönüş değeri çıkış kodudur; raise SystemExit(main()) dış katmanda yapılır.'],
        why: 'Veri stdout\'a, hata stderr\'a ve anlamlı çıkış kodu: cron, CI ve boru hatları bu sözleşmeye dayanır.' }
    ],
    faq: [
      { q: 'setup.py hâlâ gerekli mi?', a: 'Hayır. PEP 621 ile pyproject.toml tek dosya yeter; setuptools, hatch, flit, poetry hepsi okur. Eski projelerde setup.py görürsen onu pyproject\'e taşımak iyi bir ilk görevdir.' },
      { q: 'click/typer yerine argparse mi?', a: 'argparse standart kütüphanede, bağımlılık eklemez; küçük ve orta CLI için yeter. Çok alt komutlu, renkli, otomatik tamamlamalı araçlarda typer (tip ipuçlarından CLI üretir) daha hızlı geliştirilir.' },
      { q: 'Şirket içi paket deposu nasıl olur?', a: 'Artifactory, Nexus, devpi ya da bulut sağlayıcı depoları PyPI protokolünü konuşur; pip --index-url ile yönlendirilir. CI, etiketlenen sürümü buraya twine ile yükler.' }
    ],
    mistakes: [
      { bad: 'def main():\n    args = parser.parse_args()  # sys.argv\'ye bağlı', good: 'def main(argv=None):\n    args = parser.parse_args(argv)', why: 'argv parametresi olmadan CLI yalnızca alt süreç olarak test edilebilir; listeyle çağrı birim testi mümkün kılar.' },
      { bad: 'if \'1.10.0\' > \'1.9.0\': ...  # False!', good: 'from packaging.version import Version\nif Version(\'1.10.0\') > Version(\'1.9.0\'): ...', why: 'Metin karşılaştırması karakter karakterdir; sürümler sayısal parçalarla karşılaştırılmalı.' },
      { bad: 'dependencies = ["httpx==0.27.0", "pydantic==2.6.1"]  # kütüphanede', good: 'dependencies = ["httpx>=0.27,<1", "pydantic>=2,<3"]', why: 'Kütüphane bağımlılığını tam sabitlemek, kullanıcıların diğer paketleriyle çakışma yaratır; sabitleme uygulamanın lock dosyasında olur.' },
      { bad: 'print(\'hata: dosya yok\')\nreturn 0', good: 'print(\'hata: dosya yok\', file=sys.stderr)\nreturn 1', why: 'Hata stdout\'a ve kod 0 ile dönerse cron ve CI işi başarılı sanır; veri boruları bozulur.' }
    ]
  }
);
})(window);
/* Kesit Python — İleri 3: Üretime Hazırlık ve Bitirme (kalite-ci, mulakat-hazirlik, proje-ileri) */
// needs: pandas
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
/* ───────────────────────── 1. kalite-ci ───────────────────────── */
{
  id: 'kalite-ci',
  lv: 'ileri',
  mod: 'Üretime Hazırlık',
  min: 45,
  title: 'Kod kalitesi ve CI: ruff, mypy, pre-commit, pytest, GitHub Actions',
  sum: 'Kod kalitesini otomatik araçlarla korumayı, test ve kapsam ölçmeyi, pre-commit ve GitHub Actions ile her commit\'te kontrol çalıştırmayı öğrenirsin.',
  goals: [
    'ruff, black, isort ve mypy\'nin ne yaptığını ve projeye nasıl eklendiğini açıklayabilirim.',
    'pytest fixture\'larıyla tekrar eden test hazırlığını paylaştırıp coverage ile kapsamı ölçebilirim.',
    'pre-commit kancalarıyla hatalı kodun depoya girmesini commit anında engelleyebilirim.',
    'GitHub Actions iş akışı yazıp her push\'ta lint, tip denetimi ve testleri çalıştırabilirim.',
    'ast modülüyle kendi küçük lint kurallarımı yazabilir, kod inceleme listesi uygulayabilirim.'
  ],
  body: `
<h2>Neden kalite otomasyonu?</h2>
<p>Ilgaz Bank\'ın kredi skorlama paketini üç kişi geliştiriyor. Biri sekmeyle, diğeri boşlukla girinti yapıyor; birinin bıraktığı <code>print</code> çağrısı üretim logunu dolduruyor; <code>None</code> dönebilen bir fonksiyon başka bir yerde <code>.upper()</code> ile çağrılıyor ve gece yarısı çöküyor. Bunların hiçbiri "dikkat etmekle" çözülmez; insan dikkati tükenir, araçlar tükenmez. Kalite otomasyonu (quality automation), bu kontrolleri makineye devretmek ve her commit\'te, her pull request\'te aynı standardı uygulamaktır.</p>
<p>Üretime hazır bir Python projesinde kalite zinciri dört halkadan oluşur: biçimlendirici (formatter) kodu tek stile getirir, linter şüpheli kalıpları yakalar, tip denetleyici (type checker) sözleşmeleri doğrular, test koşucusu davranışı kanıtlar. pre-commit bu zinciri yerelde, CI (continuous integration, sürekli tümleştirme) sunucuda çalıştırır.</p>

<h2>Biçim ve lint: ruff, black, isort</h2>
<p><b>black</b> "uzlaşmaz biçimlendirici"dir: tırnak, satır kırma, boşluk gibi tartışmaları tek stile bağlar; tartışma biter. <b>isort</b> import satırlarını gruplar ve alfabetik sıralar (standart kütüphane, üçüncü parti, proje). <b>ruff</b> ise Rust ile yazılmış, çok hızlı bir linter; flake8, isort ve pyflakes kurallarının büyük kısmını tek araçta toplar ve <code>ruff format</code> komutuyla black\'in yerini de alabilir. Yeni projelerde yaygın tercih yalnızca ruff\'tır; eski projelerde üçlüyü birlikte görürsün.</p>
<p>Ayarlar <code>pyproject.toml</code> içinde yaşar:</p>
<pre class="code">[tool.ruff]
line-length = 88
target-version = "py312"

[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP"]   # pycodestyle, pyflakes, isort, bugbear, pyupgrade
ignore = ["E501"]                     # satır uzunluğunu format halleder

[tool.mypy]
python_version = "3.12"
strict = true</pre>
<div class="tbl-wrap"><table>
<tr><th>Araç</th><th>Ne yapar</th><th>Komut</th><th>Yakaladığı örnek</th></tr>
<tr><td>ruff check</td><td>Lint: hatalı/şüpheli kalıp</td><td>ruff check .</td><td>Kullanılmayan import, tanımsız ad, mutable default</td></tr>
<tr><td>ruff format / black</td><td>Biçimlendirme</td><td>ruff format .</td><td>Girinti, tırnak, satır kırma</td></tr>
<tr><td>isort</td><td>Import sıralama</td><td>isort .</td><td>Karışık import grupları</td></tr>
<tr><td>mypy</td><td>Statik tip denetimi</td><td>mypy src/</td><td>str | None değere .upper() çağırmak</td></tr>
<tr><td>pytest --cov</td><td>Test ve kapsam</td><td>pytest --cov=paket</td><td>Hiç test edilmeyen dal</td></tr>
</table></div>

<h2>Kendi lint kuralını yazmak: ast</h2>
<p>Linter\'ların sihri yok: kaynak kodu <code>ast</code> (abstract syntax tree, soyut sözdizimi ağacı) ile ayrıştırır ve ağaçta dolaşırlar. Aynı şeyi sen de yapabilirsin. Aşağıdaki örnek, bir kod parçasında unutulmuş <code>print</code> çağrılarını bulur:</p>
<pre class="py">import ast

KOD = '''
import os
import json

def skor_hesapla(gelir, borc):
    print("debug:", gelir)
    oran = borc / gelir
    return json.dumps({"oran": oran})
'''

agac = ast.parse(KOD)
for dugum in ast.walk(agac):
    if isinstance(dugum, ast.Call) and isinstance(dugum.func, ast.Name):
        if dugum.func.id == "print":
            print(f"satır {dugum.lineno}: print bırakılmış")</pre>
<p><code>ast.walk</code> ağaçtaki her düğümü gezer; <code>ast.Call</code> bir fonksiyon çağrısı, <code>ast.Name</code> basit bir addır. Aynı yaklaşımla kullanılmayan import\'ları bulmak da kolay: import edilen adları topla, kodda <code>ast.Name</code> olarak geçenleri topla, farkı al. Yukarıdaki kodda <code>os</code> import edilmiş ama hiç kullanılmamış; ruff bunu F401 koduyla bildirir. Alıştırmalarda bu kuralı kendin yazacaksın.</p>
<div class="tip"><b>ast.Attribute</b><code>json.dumps</code> gibi çağrılarda modül adı <code>ast.Attribute</code> düğümünün <code>value</code> kısmındaki <code>ast.Name</code> olarak görünür. <code>ast.walk</code> tüm alt düğümleri de gezdiği için yalnızca <code>ast.Name</code> toplamak yeterlidir.</div>

<h2>mypy ile tip sözleşmesi</h2>
<p>Tip ipuçları (type hints) belge gibidir; mypy onları sözleşmeye dönüştürür. Şu fonksiyonu düşün:</p>
<pre class="py">def musteri_bul(idler: dict[int, str], mid: int) -&gt; str | None:
    return idler.get(mid)

ad = musteri_bul({1: "Ayşe"}, 2)
# mypy: Item "None" of "str | None" has no attribute "upper"
# print(ad.upper())
if ad is not None:
    print(ad.upper())
else:
    print("müşteri yok")</pre>
<p>Yorum satırındaki çağrı mypy\'de hata verir, çünkü dönüş tipi <code>None</code> olabilir. Bu uyarı, gece yarısı çökmesini kod yazılırken yakalar. <code>strict = true</code> ile her fonksiyonun tip açıklaması zorunlu olur; yeni projede baştan açmak kolay, eski projede modül modül açmak gerçekçidir.</p>

<h2>pytest fixture ve coverage</h2>
<p>Testlerin çoğu aynı hazırlığı tekrarlar: örnek sipariş listesi, geçici dizin, sahte veritabanı. <b>fixture</b>, bu hazırlığı bir fonksiyona koyup testlere parametre olarak enjekte eder. pytest, test fonksiyonunun parametre adına bakarak aynı adlı fixture\'ı bulur ve çağırır:</p>
<pre class="code">import pytest

@pytest.fixture
def siparisler():
    return [{"id": 1, "tutar": 250}, {"id": 2, "tutar": 90}]

@pytest.fixture
def gecici_db(tmp_path):            # fixture başka fixture kullanabilir
    yol = tmp_path / "test.db"
    baglanti = sqlite3.connect(yol)
    yield baglanti                  # test burada çalışır
    baglanti.close()                # temizlik (teardown)

def test_toplam(siparisler):
    assert toplam_tutar(siparisler) == 340</pre>
<p>Fixture gövdesindeki <code>yield</code>, kurulum ile temizliği ayırır: yield\'den öncesi kurulum, sonrası temizlik. Test hata verse bile temizlik çalışır. Bu, bağlam yöneticisiyle aynı mantıktır; aşağıdaki örnekte pytest olmadan aynı deseni kendi elinle kuruyorsun:</p>
<pre class="py">from contextlib import contextmanager

gunluk = []

@contextmanager
def ornek_hesaplar():
    gunluk.append("kurulum")
    hesaplar = {"TR1": 1000, "TR2": 250}
    try:
        yield hesaplar
    finally:
        gunluk.append("temizlik")

with ornek_hesaplar() as h:
    h["TR1"] -= 100
    print("bakiye:", h["TR1"])

try:
    with ornek_hesaplar() as h:
        raise ValueError("test patladı")
except ValueError:
    pass
print(gunluk)</pre>
<p><b>coverage</b> (kapsam) ise testlerin kodun yüzde kaçını çalıştırdığını ölçer: <code>pytest --cov=anadolu --cov-report=term-missing</code> komutu her dosya için yüzde ve test edilmeyen satır numaralarını listeler. Yüzde yüz hedef değil, işaret fenerdir: hiç dokunulmayan bir hata dalı (<code>except</code> bloğu gibi) genelde en çok çökmeye yol açan yerdir.</p>
<div class="warn"><b>Kapsam yüzdesi kaliteyi garanti etmez</b>Satırın çalışmış olması doğru çalıştığı anlamına gelmez; assert içermeyen bir test yüzde yüz kapsam verir ama hiçbir şey kanıtlamaz. Kapsamı düşük dalları bulmak için kullan, hedef sayı için değil.</div>

<h2>pre-commit: hatayı commit anında yakala</h2>
<p><b>pre-commit</b>, git\'in commit kancasına (hook) bağlanan bir araçtır. Her <code>git commit</code> öncesinde tanımlı araçları yalnızca değişen dosyalarda çalıştırır; biri başarısız olursa commit yapılmaz. Yapılandırma <code>.pre-commit-config.yaml</code> dosyasındadır:</p>
<pre class="code">repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.6.9
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.11.2
    hooks:
      - id: mypy</pre>
<p>Kurulum iki komut: <code>pip install pre-commit</code> ve <code>pre-commit install</code>. İlk kez tüm projede çalıştırmak için <code>pre-commit run --all-files</code>. Ekip için anlamı şu: biçim tartışması pull request\'e hiç gelmez, inceleme (review) mantığa odaklanır.</p>

<h2>GitHub Actions ile CI</h2>
<p>Yerel kanca kişisel bir güvencedir; birisi <code>--no-verify</code> ile atlayabilir. CI, aynı kontrolleri sunucuda, herkes için, her push\'ta çalıştırır. GitHub Actions iş akışı (workflow) <code>.github/workflows/ci.yml</code> içinde YAML olarak tanımlanır:</p>
<pre class="code">name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  kalite:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python: ["3.11", "3.12"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: $&#123;&#123; matrix.python &#125;&#125;
      - run: pip install -e ".[dev]"
      - run: ruff check .
      - run: ruff format --check .
      - run: mypy src/
      - run: pytest --cov=anadolu --cov-fail-under=80</pre>
<p>Yapı üç katmanlıdır: <b>on</b> ne zaman tetikleneceğini, <b>jobs</b> hangi işlerin çalışacağını, her işteki <b>steps</b> sıralı adımları belirtir. Bir adım ya hazır bir eylem kullanır (<code>uses</code>) ya da bir kabuk komutu çalıştırır (<code>run</code>). <code>matrix</code> aynı işi birden fazla Python sürümünde koşturur. Son satırdaki <code>--cov-fail-under=80</code>, kapsam eşiğin altına düşerse işi kırmızıya boyar.</p>
<p>YAML yazarken yapıyı kafanda bir Python sözlüğü gibi tut: iş akışı bir dict, <code>jobs</code> bir dict, <code>steps</code> bir dict listesi. Aşağıdaki örnek, aynı yapıyı Python sözlüğü olarak kuruyor ve kurallara uyup uymadığını denetliyor; alıştırmada bunu tam bir doğrulayıcıya çevireceksin:</p>
<pre class="py">akis = {
    "name": "CI",
    "on": ["push", "pull_request"],
    "jobs": {
        "kalite": {
            "runs-on": "ubuntu-latest",
            "steps": [
                {"uses": "actions/checkout@v4"},
                {"run": "pip install -e ."},
                {"run": "pytest"},
            ],
        }
    },
}

for ad, is_ in akis["jobs"].items():
    adimlar = is_.get("steps", [])
    print(f"{ad}: {len(adimlar)} adım, runs-on={is_.get('runs-on')}")
    for i, adim in enumerate(adimlar, 1):
        tur = "uses" if "uses" in adim else "run"
        print(f"  {i}. {tur}: {adim[tur]}")</pre>
<div class="note"><b>Gizli bilgiler</b>API anahtarı ve parolayı YAML\'a yazma; depo ayarlarındaki Secrets bölümüne koy ve <code>$&#123;&#123; secrets.DB_PASSWORD &#125;&#125;</code> ile oku. Loglarda otomatik maskelenir.</div>

<h2>Kod inceleme listesi</h2>
<p>Araçlar biçimi ve tipi denetler; mantığı insan denetler. Pull request incelerken şu listeyi sırayla geç:</p>
<div class="steps-list"><ol>
<li><b>Amaç:</b> PR açıklaması ne yapıldığını ve neden yapıldığını söylüyor mu? Tek bir konuya mı odaklanmış?</li>
<li><b>Test:</b> Yeni davranışın testi var mı? Hata senaryosu (boş liste, None, negatif tutar) test edilmiş mi?</li>
<li><b>Adlandırma:</b> Fonksiyon adı ne yaptığını söylüyor mu? <code>veri2</code>, <code>tmp</code>, <code>islem_yap</code> gibi adlar var mı?</li>
<li><b>Hata yönetimi:</b> Çıplak <code>except:</code> var mı? Hata yutuluyor mu, loglanıyor mu?</li>
<li><b>Yan etki:</b> Fonksiyon parametresini (listeyi, sözlüğü) yerinde değiştiriyor mu? Global durum var mı?</li>
<li><b>Gereksiz karmaşıklık:</b> Aynı iş daha az kodla, standart kütüphaneyle yapılabilir mi?</li>
<li><b>Güvenlik:</b> Kullanıcı girdisi SQL\'e, kabuk komutuna, dosya yoluna doğrudan gidiyor mu? Gizli bilgi kodda mı?</li>
</ol></div>
<p>Yorumlarda ton önemli: "Bu yanlış" yerine "Burada tutar None gelirse ne olur?" diye sor. İyi inceleme, yazarın öğrenmesini sağlar; kötü inceleme bir sonraki PR\'ı geciktirir.</p>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Kalite kapıları (quality gates)</h3>
<p>Kurumsal ekiplerde ana dala birleştirme (merge) için koşullar tanımlanır: CI yeşil, en az bir onay, kapsam düşmemiş, tip hatası sıfır. GitHub\'da "branch protection" ile bu kapılar zorunlu kılınır. Kapıları kademeli sıkılaştır; ilk gün yüzde doksan kapsam istemek ekibi küstürür.</p>
<h3>Hızlı CI</h3>
<p>Yavaş CI, atlanan CI\'dır. Üç pratik: bağımlılıkları önbelleğe al (<code>actions/setup-python</code> içindeki <code>cache: pip</code>), yalnızca değişen testleri önce koş (<code>pytest --lf</code>), yavaş entegrasyon testlerini ayrı işe taşı ve yalnızca ana dalda çalıştır.</p>
<h3>ruff kural seçimi</h3>
<p>Tüm kuralları açmak gürültü yaratır. Başlangıç seti <code>E, F, I</code>; olgun projede <code>B</code> (bugbear: mutable default, gereksiz lambda), <code>UP</code> (pyupgrade: eski sözdizimi), <code>SIM</code> (sadeleştirme) eklenir. Her kuralı kapatırken <code>ignore</code> listesine yorum yaz: altı ay sonra neden kapattığını hatırlamazsın.</p>
<h3>Tip denetimini kademeli açmak</h3>
<p>Eski kod tabanında mypy önce yüzlerce hata verir. Çözüm: <code>[[tool.mypy.overrides]]</code> ile eski modüllere <code>ignore_errors = true</code>, yeni modüllere <code>strict = true</code>. Her dokunulan modül sıkı moda taşınır; birkaç ayda tüm taban temizlenir.</p>
</section>`,
  ex: [
    { t: 'code', id: 'kalite-ci-1',
      q: '<p>Kaynak kodu metin olarak alan <code>uzun_satirlar(kod, limit=88)</code> fonksiyonunu yaz. Uzunluğu <code>limit</code>\'i aşan satırlar için <code>(satir_no, uzunluk)</code> demetlerinden oluşan liste döndürsün; satır numarası 1\'den başlasın. Satır sonundaki <code>\\n</code> uzunluğa dahil değil.</p>',
      start: 'def uzun_satirlar(kod, limit=88):\n    pass\n',
      sol: 'def uzun_satirlar(kod, limit=88):\n    sonuc = []\n    for no, satir in enumerate(kod.splitlines(), 1):\n        if len(satir) > limit:\n            sonuc.append((no, len(satir)))\n    return sonuc\n',
      tests: 'kod = "import os\\n" + "x = " + "1 + " * 30 + "1\\n" + "y = 2\\n"\nr = uzun_satirlar(kod)\nassert r == [(2, 125)], f"2. satır 125 karakter olmalı, gelen {r}"\nassert uzun_satirlar(kod, 200) == [], "limit 200 ise hiçbir satır uzun değil"\nassert uzun_satirlar("a = 1\\nbb = 22\\n", 5) == [(2, 7)], "limit 5 ile yalnızca 2. satır"\nassert uzun_satirlar("") == [], "boş kod boş liste"\n',
      hints: ['kod.splitlines() satır sonlarını atar.', 'enumerate(..., 1) ile 1 tabanlı numara al.'],
      why: 'ruff E501 kuralının çekirdeği tam olarak budur: satır satır gez, uzunluğu ölç, limiti aşanları bildir.' },
    { t: 'code', id: 'kalite-ci-2',
      q: '<p><code>ast</code> modülüyle <code>print_bul(kod)</code> fonksiyonunu yaz: kodda <code>print(...)</code> olarak çağrılan her yerin satır numarasını artan sırada liste olarak döndürsün. Yalnızca doğrudan <code>print</code> adıyla yapılan çağrılar sayılsın; <code>logger.print(...)</code> gibi nitelik çağrıları sayılmasın.</p>',
      start: 'import ast\n\ndef print_bul(kod):\n    pass\n',
      sol: 'import ast\n\ndef print_bul(kod):\n    agac = ast.parse(kod)\n    satirlar = []\n    for d in ast.walk(agac):\n        if isinstance(d, ast.Call) and isinstance(d.func, ast.Name) and d.func.id == "print":\n            satirlar.append(d.lineno)\n    return sorted(satirlar)\n',
      tests: 'kod = "def f(x):\\n    print(x)\\n    y = x * 2\\n    logger.print(y)\\n    if y:\\n        print(\\"ok\\")\\n    return y\\n"\nassert print_bul(kod) == [2, 6], f"print satırları [2, 6] olmalı, gelen {print_bul(kod)}"\nassert print_bul("x = 1\\n") == [], "print yoksa boş liste"\nassert print_bul("print(1); print(2)\\n") == [1, 1], "aynı satırda iki print iki kez sayılır"\n',
      hints: ['ast.parse(kod) ağacı verir; ast.walk ile tüm düğümleri gez.', 'ast.Call düğümünün .func alanı ast.Name ise .id adı verir; .lineno satır numarasıdır.'],
      why: 'Linter mantığı: ağacı gez, ilgilendiğin düğüm türünü filtrele, konumunu bildir. ast.Attribute olan çağrılar (logger.print) ast.Name koşulunda elenir.' },
    { t: 'code', id: 'kalite-ci-3',
      q: '<p><code>kullanilmayan_importlar(kod)</code> fonksiyonunu yaz: <code>import x</code>, <code>import x as y</code> ve <code>from m import x</code> biçimlerinde bağlanan adları toplasın; kod gövdesinde <code>ast.Name</code> olarak hiç geçmeyenleri import sırasıyla liste olarak döndürsün. <code>import os.path</code> için bağlanan ad <code>os</code>\'tur; <code>as</code> varsa takma ad bağlanır.</p>',
      start: 'import ast\n\ndef kullanilmayan_importlar(kod):\n    pass\n',
      sol: 'import ast\n\ndef kullanilmayan_importlar(kod):\n    agac = ast.parse(kod)\n    import_edilen = []\n    for d in ast.walk(agac):\n        if isinstance(d, (ast.Import, ast.ImportFrom)):\n            for alias in d.names:\n                ad = alias.asname or alias.name.split(".")[0]\n                import_edilen.append(ad)\n    kullanilan = {d.id for d in ast.walk(agac) if isinstance(d, ast.Name)}\n    return [ad for ad in import_edilen if ad not in kullanilan]\n',
      tests: 'kod = "import os\\nimport json\\nimport numpy as np\\nfrom collections import Counter, deque\\nimport os.path\\n\\ndef f(x):\\n    return json.dumps(Counter(x))\\n"\nr = kullanilmayan_importlar(kod)\nassert r == ["os", "np", "deque", "os"], f"beklenen [\'os\', \'np\', \'deque\', \'os\'], gelen {r}"\nassert kullanilmayan_importlar("import re\\nprint(re.sub)\\n") == [], "re kullanılıyor"\nassert kullanilmayan_importlar("x = 1\\n") == [], "import yoksa boş"\n',
      hints: ['ast.Import ve ast.ImportFrom düğümlerinin .names listesi alias nesneleri içerir: .name ve .asname.', 'Bağlanan ad: asname varsa o, yoksa name\'in ilk noktadan önceki kısmı.', 'Kullanılan adlar: ast.Name düğümlerinin .id kümesi.'],
      why: 'ruff F401 kuralı bu mantıkla çalışır. json.dumps çağrısında json bir ast.Name olarak göründüğü için kullanılmış sayılır; os ve np hiç geçmediğinden raporlanır.' },
    { t: 'mc', q: 'ruff ile black arasındaki temel fark nedir?',
      o: ['ruff yalnızca import sıralar, black ise lint ve tip denetimi yapar', 'black biçimlendirir; ruff lint yapar ve biçimlendirebilir', 'İkisi de yalnızca biçimlendirir, aralarında tek fark ruff\'ın daha yavaş olmasıdır', 'black tip denetimi de yapar'], a: 1,
      why: 'black yalnızca biçimlendiricidir. ruff bir linter olarak başladı, ruff format ile biçimlendirme de ekledi ve Rust sayesinde çok hızlıdır. Tip denetimi mypy\'nin işidir.' },
    { t: 'code', id: 'kalite-ci-4',
      q: '<p>pytest fixture benzeri bir yardımcı yaz: <code>gecici_hesaplar(gunluk)</code> bir bağlam yöneticisi (contextmanager) olsun. Girişte <code>gunluk</code> listesine <code>"kurulum"</code> eklesin ve <code>{"TR1": 1000, "TR2": 250}</code> sözlüğünün <b>yeni bir kopyasını</b> versin; çıkışta, blok hata verse bile, <code>"temizlik"</code> eklesin.</p>',
      start: 'from contextlib import contextmanager\n\n@contextmanager\ndef gecici_hesaplar(gunluk):\n    pass\n',
      sol: 'from contextlib import contextmanager\n\n@contextmanager\ndef gecici_hesaplar(gunluk):\n    gunluk.append("kurulum")\n    hesaplar = {"TR1": 1000, "TR2": 250}\n    try:\n        yield hesaplar\n    finally:\n        gunluk.append("temizlik")\n',
      tests: 'g = []\nwith gecici_hesaplar(g) as h:\n    h["TR1"] -= 100\n    assert h["TR1"] == 900, "sözlük değiştirilebilir olmalı"\nassert g == ["kurulum", "temizlik"], f"günlük [kurulum, temizlik] olmalı, gelen {g}"\nwith gecici_hesaplar(g) as h2:\n    assert h2["TR1"] == 1000, "her kullanımda taze sözlük verilmeli"\ng2 = []\ntry:\n    with gecici_hesaplar(g2):\n        raise ValueError("x")\nexcept ValueError:\n    pass\nassert g2 == ["kurulum", "temizlik"], "hata olsa da temizlik çalışmalı"\n',
      hints: ['yield öncesi kurulum, sonrası temizlik.', 'try: yield ... finally: temizlik ile hata durumunda da temizlik garanti olur.', 'Sözlüğü her çağrıda fonksiyon içinde yeniden oluştur.'],
      why: 'pytest fixture\'larındaki yield deseni birebir budur. finally bloğu, test hata verse de kaynağın kapanmasını sağlar; sözlüğü her girişte yeniden kurmak testlerin birbirini etkilemesini önler.' },
    { t: 'code', id: 'kalite-ci-5',
      q: '<p>GitHub Actions iş akışını temsil eden sözlüğü doğrulayan <code>is_akisi_dogrula(akis)</code> fonksiyonunu yaz. Hata mesajlarını (str) liste olarak döndürsün; sorun yoksa boş liste. Kurallar ve mesajlar:</p><ul><li><code>"name"</code> yoksa: <code>"name eksik"</code></li><li><code>"on"</code> yoksa: <code>"on eksik"</code></li><li><code>"jobs"</code> yoksa ya da boş sözlükse: <code>"jobs boş"</code> (bu durumda iş kontrolü yapılmaz)</li><li>Her iş için <code>"runs-on"</code> yoksa: <code>"{is}: runs-on eksik"</code></li><li>Her iş için <code>"steps"</code> yoksa ya da boş listeyse: <code>"{is}: steps boş"</code></li><li>Her adımda ne <code>"uses"</code> ne <code>"run"</code> varsa: <code>"{is}: adım {i} uses/run içermiyor"</code> (i 1\'den başlar)</li></ul>',
      start: 'def is_akisi_dogrula(akis):\n    hatalar = []\n    pass\n',
      sol: 'def is_akisi_dogrula(akis):\n    hatalar = []\n    if "name" not in akis:\n        hatalar.append("name eksik")\n    if "on" not in akis:\n        hatalar.append("on eksik")\n    jobs = akis.get("jobs")\n    if not jobs:\n        hatalar.append("jobs boş")\n        return hatalar\n    for ad, is_ in jobs.items():\n        if "runs-on" not in is_:\n            hatalar.append(f"{ad}: runs-on eksik")\n        adimlar = is_.get("steps")\n        if not adimlar:\n            hatalar.append(f"{ad}: steps boş")\n            continue\n        for i, adim in enumerate(adimlar, 1):\n            if "uses" not in adim and "run" not in adim:\n                hatalar.append(f"{ad}: adım {i} uses/run içermiyor")\n    return hatalar\n',
      tests: 'iyi = {"name": "CI", "on": ["push"], "jobs": {"test": {"runs-on": "ubuntu-latest", "steps": [{"uses": "actions/checkout@v4"}, {"run": "pytest"}]}}}\nassert is_akisi_dogrula(iyi) == [], "geçerli akış hata vermemeli"\nkotu = {"on": ["push"], "jobs": {"test": {"steps": [{"uses": "a"}, {"name": "x"}]}, "lint": {"runs-on": "ubuntu-latest", "steps": []}}}\nr = is_akisi_dogrula(kotu)\nassert r == ["name eksik", "test: runs-on eksik", "test: adım 2 uses/run içermiyor", "lint: steps boş"], f"gelen {r}"\nassert is_akisi_dogrula({"name": "x"}) == ["on eksik", "jobs boş"], "jobs boşsa iş kontrolü yapılmaz"\nassert is_akisi_dogrula({"name": "x", "on": "push", "jobs": {}}) == ["jobs boş"], "boş jobs sözlüğü"\n',
      hints: ['Önce üst seviye anahtarları kontrol et; jobs boşsa hemen döndür.', 'Her iş için runs-on ve steps kontrolü, ardından enumerate(steps, 1) ile adımlar.'],
      why: 'YAML doğrulayıcılar aynı mantıkla çalışır: zorunlu anahtarlar, boş olmayan koleksiyonlar, her öğenin asgari alanları. Mesajların sırası kontrol sırasını izler.' },
    { t: 'mc', q: 'pre-commit kancası (hook) ne zaman çalışır ve başarısız olursa ne olur?',
      o: ['Her push\'ta sunucuda çalışır; başarısızsa PR kapanır', 'git commit anında yerelde çalışır; başarısızsa commit oluşmaz', 'Yalnızca pytest çalıştırır', 'Her dosya kaydedildiğinde editörde çalışır'], a: 1,
      why: 'pre-commit git\'in commit kancasına bağlanır ve değişen dosyalarda araçları koşturur; biri hata verirse commit yapılmaz. Sunucu tarafı denetim CI\'nın işidir.' },
    { t: 'code', id: 'kalite-ci-6',
      q: '<p>Kapsam raporu üreten <code>kapsam_raporu(dosyalar)</code> fonksiyonunu yaz. <code>dosyalar</code>, dosya adını <code>(toplam_satir, calisan_satir)</code> demetine eşleyen bir sözlük. Dönüş: her dosya için yüzdeyi (1 ondalık, float) içeren sözlük ve ek olarak <code>"TOPLAM"</code> anahtarında tüm satırlar üzerinden hesaplanan genel yüzde. Toplam satırı 0 olan dosyanın yüzdesi 100.0 sayılsın.</p>',
      start: 'def kapsam_raporu(dosyalar):\n    pass\n',
      sol: 'def kapsam_raporu(dosyalar):\n    rapor = {}\n    toplam = calisan = 0\n    for ad, (t, c) in dosyalar.items():\n        rapor[ad] = round(c / t * 100, 1) if t else 100.0\n        toplam += t\n        calisan += c\n    rapor["TOPLAM"] = round(calisan / toplam * 100, 1) if toplam else 100.0\n    return rapor\n',
      tests: 'r = kapsam_raporu({"rfm.py": (40, 36), "cli.py": (20, 10), "__init__.py": (0, 0)})\nassert r["rfm.py"] == 90.0, "rfm 90.0"\nassert r["cli.py"] == 50.0, "cli 50.0"\nassert r["__init__.py"] == 100.0, "boş dosya 100.0"\nassert abs(r["TOPLAM"] - 76.7) < 1e-9, f"toplam 46/60 = 76.7 olmalı, gelen {r[\'TOPLAM\']}"\nassert kapsam_raporu({}) == {"TOPLAM": 100.0}, "boş girdi yalnızca TOPLAM"\n',
      hints: ['Dosya yüzdesi: calisan / toplam * 100, round(..., 1).', 'Genel yüzde dosya yüzdelerinin ortalaması değil; satır toplamları üzerinden hesaplanır.'],
      why: 'coverage.py raporunun TOTAL satırı satır toplamlarından hesaplanır; dosya yüzdelerinin ortalaması küçük dosyaları abartır. Sıfır satırlı dosya bölme hatasına yol açmasın diye ayrıca ele alınır.' }
  ],
  faq: [
    { q: 'ruff varken black ve isort hâlâ gerekli mi?', a: 'Yeni projede hayır: ruff check (I kuralıyla import sıralama dahil) ve ruff format ikisinin işini görür. Eski projelerde üçlüyü birlikte görebilirsin; aynı anda iki biçimlendirici çalıştırmak çatışma yaratabilir, birini seç.' },
    { q: 'Testler yerelde geçiyor, CI\'da patlıyor. Neden?', a: 'En sık nedenler: CI\'da farklı Python sürümü (matrix), eksik bağımlılık (pyproject\'e yazılmamış), yerel bir dosyaya ya da ortam değişkenine bağımlılık, zaman dilimi veya dosya yolu farkı (Windows/Linux). CI loglarını baştan oku; ilk hata gerçek nedendir.' },
    { q: 'mypy strict çok hata veriyor, ne yapmalıyım?', a: 'Kademeli aç: eski modüllere override ile ignore_errors, yeni modüllere strict. Her dokunduğun modülü sıkı moda taşı. Dış kütüphanenin tip bilgisi yoksa types-* paketini kur ya da ignore_missing_imports kullan.' },
    { q: 'Kapsam hedefi kaç olmalı?', a: 'Tek bir doğru sayı yok. Kritik iş mantığı (ücret, faiz, stok) yüksek, otomatik üretilen kod ve basit CLI düşük olabilir. Pratik kural: kapsamı düşürmeyen PR kabul edilir; eşik mevcut değerin biraz altına konur ve zamanla yükseltilir.' }
  ],
  mistakes: [
    { bad: 'def ekle(x, liste=[]):\n    liste.append(x)\n    return liste', good: 'def ekle(x, liste=None):\n    if liste is None:\n        liste = []\n    liste.append(x)\n    return liste', why: 'Mutable varsayılan değer çağrılar arasında paylaşılır; ruff B006 bunu yakalar. None kullanıp içeride oluştur.' },
    { bad: 'try:\n    tutar = float(s)\nexcept:\n    tutar = 0', good: 'try:\n    tutar = float(s)\nexcept ValueError:\n    tutar = 0.0', why: 'Çıplak except KeyboardInterrupt ve SystemExit dahil her şeyi yutar; ruff E722 uyarır. Beklediğin istisnayı yakala.' },
    { bad: 'import os, sys, json\nprint(json.dumps({}))', good: 'import json\n\nprint(json.dumps({}))', why: 'Kullanılmayan import (F401) gürültü ve yanlış bağımlılık izlenimi yaratır; tek satırda çoklu import (E401) stil kuralını bozar.' },
    { bad: 'def test_toplam():\n    toplam_tutar([{"tutar": 1}])', good: 'def test_toplam():\n    assert toplam_tutar([{"tutar": 1}]) == 1', why: 'assert içermeyen test kapsamı yükseltir ama hiçbir şeyi doğrulamaz; fonksiyon yanlış sonuç verse de yeşil kalır.' }
  ]
}
,
/* ───────────────────────── 2. mulakat-hazirlik ───────────────────────── */
{
  id: 'mulakat-hazirlik',
  lv: 'ileri',
  mod: 'Üretime Hazırlık',
  min: 50,
  title: 'Mülakat hazırlığı: Python soruları, algoritmalar, canlı kodlama',
  sum: 'Teknik mülakatlarda sık sorulan Python kavram sorularını, klasik algoritma görevlerini ve canlı kodlama tekniklerini çalışırsın.',
  goals: [
    'GIL, mutable default, is/==, shallow/deep copy, generator, decorator ve __slots__ sorularına net ve kısa cevap verebilirim.',
    'İki toplam, anagram grupları, en uzun ardışık dizi gibi klasik görevleri sözlük ve küme ile O(n) çözebilirim.',
    'Kayan pencere, iki pointer, ikili arama ve BFS kalıplarını tanıyıp uygun soruda kullanabilirim.',
    'Çözümün zaman ve bellek karmaşıklığını Big-O ile açıklayabilirim.',
    'Canlı kodlamada soruyu netleştirme, örnekle düşünme, kaba çözümden iyileştirme adımlarını uygulayabilirim.'
  ],
  body: `
<h2>Mülakat neyi ölçer?</h2>
<p>Anadolu Market\'in veri ekibine Python geliştirici alınıyor. İlk tur kavram soruları: "GIL nedir, pandas\'ı neden etkilemez?" İkinci tur canlı kodlama: "Şu sipariş listesinde toplamı X eden iki ürünü bul." Üçüncü tur sistem tasarımı: "Günde milyonlarca siparişi işleyen bir boru hattını nasıl kurarsın?" Üç tur üç farklı şeyi ölçer: dili gerçekten anlıyor musun, problemi yapılandırılmış biçimde çözebiliyor musun, büyük resmi görüyor musun. Bu ders üçünü de çalıştırır; ağırlık ikinci turda, çünkü en çok orada elenilir.</p>

<h2>Sık sorulan Python kavram soruları</h2>
<p>Aşağıdaki tablo, mülakatlarda en sık çıkan kavram sorularını ve bir cümlelik çekirdek cevaplarını listeler. Cevabı ezberleme; her birini küçük bir örnekle gösterebilecek kadar anla.</p>
<div class="tbl-wrap"><table>
<tr><th>Soru</th><th>Çekirdek cevap</th><th>Takip sorusu</th></tr>
<tr><td>GIL nedir?</td><td>CPython\'da aynı anda yalnızca bir iş parçacığının Python bytecode çalıştırmasına izin veren kilit</td><td>Neden threading I/O için işe yarar ama CPU için yaramaz? (I/O beklerken kilit bırakılır; numpy/pandas C kodu da bırakır)</td></tr>
<tr><td>Mutable default argüman</td><td>Varsayılan değer tanım anında bir kez oluşur; liste/sözlük çağrılar arasında paylaşılır</td><td>Çözüm? (None + içeride oluştur)</td></tr>
<tr><td>is ile == farkı</td><td>is kimlik (aynı nesne mi), == eşitlik (__eq__)</td><td>Neden <code>x is None</code> doğru, <code>x == None</code> yanlış stil? (None tekildir; __eq__ ezilebilir)</td></tr>
<tr><td>Shallow / deep copy</td><td>Shallow dış kabı kopyalar, iç nesneler paylaşılır; deep özyinelemeli kopyalar</td><td>list(x), x[:], x.copy() hangisi? (hepsi shallow)</td></tr>
<tr><td>Generator vs list</td><td>Generator tembel, tek geçişlik, O(1) bellek; liste tüm veriyi tutar, tekrar gezilir</td><td>sum(x*x for x in r) neden sum([x*x for x in r])\'den iyi?</td></tr>
<tr><td>Decorator</td><td>Fonksiyon alıp fonksiyon döndüren fonksiyon; @ sözdizimi şekerdir</td><td>functools.wraps neden? (ad ve docstring korunur)</td></tr>
<tr><td>__slots__</td><td>Örnek başına __dict__ yerine sabit alanlar; bellek ve erişim hızı kazancı</td><td>Dezavantaj? (dinamik nitelik eklenemez, çoklu kalıtımda dikkat)</td></tr>
</table></div>
<p>Üçünü kodla doğrula; mülakatta "göstereyim" diyebilmek güven verir:</p>
<pre class="py">import copy

# is vs ==
a = [1, 2]
b = [1, 2]
print(a == b, a is b)          # True False

# shallow vs deep
siparis = {"id": 1, "urunler": ["kalem"]}
s1 = siparis.copy()
s2 = copy.deepcopy(siparis)
siparis["urunler"].append("defter")
print(s1["urunler"], s2["urunler"])   # paylaşılan liste / bağımsız liste

# mutable default
def ekle(x, kutu=[]):
    kutu.append(x)
    return kutu
print(ekle(1), ekle(2))        # aynı liste iki kez

# __slots__
class Nokta:
    __slots__ = ("x", "y")
    def __init__(self, x, y):
        self.x, self.y = x, y
n = Nokta(1, 2)
print(hasattr(n, "__dict__"))  # False</pre>

<h2>Algoritma soruları: kalıpları tanı</h2>
<p>Mülakat sorularının büyük kısmı beş altı kalıba iner. Soruyu duyunca kalıbı tanırsan çözümün yarısı bitmiştir.</p>
<h3>1. Sözlükle sayım ve arama: iki toplam</h3>
<p>"Listede toplamı hedef eden iki elemanın indekslerini bul." Kaba yol çift döngü, O(n²). Akıllı yol: gördüğün her sayıyı sözlüğe koy, sıradaki sayının tamamlayıcısı (hedef - sayı) sözlükte mi diye bak. Tek geçiş, O(n).</p>
<pre class="py">def iki_toplam(sayilar, hedef):
    gorulen = {}                       # değer -&gt; indeks
    for i, s in enumerate(sayilar):
        kalan = hedef - s
        if kalan in gorulen:
            return [gorulen[kalan], i]
        gorulen[s] = i
    return []

fiyatlar = [250, 90, 410, 160, 300]
print(iki_toplam(fiyatlar, 500))   # 250 + 250 yok; 90 + 410 -&gt; [1, 2]
print(iki_toplam(fiyatlar, 1000))  # []</pre>
<p>Aynı kalıp "anagram grupları"nda anahtarı sıralanmış harfler yaparak, "en çok tekrar eden ürün"de <code>Counter</code> ile görünür. Soru "bul, say, grupla" diyorsa sözlük düşün.</p>

<h3>2. Küme ile O(n): en uzun ardışık dizi</h3>
<p>"Sırasız sayılarda en uzun ardışık sayı dizisinin uzunluğu?" Sıralamak O(n log n). Küme ile O(n): her sayı için, bir eksiği kümede yoksa bu bir dizinin başıdır; ileri say.</p>
<pre class="py">def en_uzun_ardisik(sayilar):
    kume = set(sayilar)
    en_iyi = 0
    for s in kume:
        if s - 1 not in kume:          # yalnızca dizi başlarından say
            n = 1
            while s + n in kume:
                n += 1
            en_iyi = max(en_iyi, n)
    return en_iyi

print(en_uzun_ardisik([100, 4, 200, 1, 3, 2]))   # 1,2,3,4 -&gt; 4</pre>
<p>Neden O(n)? Her sayı yalnızca ait olduğu dizinin başından itibaren bir kez sayılır. Mülakatçı "neden while içinde while var ama O(n)?" diye sorar; cevap bu.</p>

<h3>3. Kayan pencere (sliding window)</h3>
<p>"Art arda k günün en yüksek toplam cirosu" ya da "tekrarsız en uzun alt dize." Sabit ya da esneyen bir pencereyi sağa kaydırırsın; giren elemanı ekler, çıkanı çıkarırsın. Her adımda yeniden toplamak O(n·k); pencereyle O(n).</p>
<pre class="py">def en_iyi_pencere(ciro, k):
    toplam = sum(ciro[:k])
    en_iyi, bas = toplam, 0
    for i in range(k, len(ciro)):
        toplam += ciro[i] - ciro[i - k]
        if toplam &gt; en_iyi:
            en_iyi, bas = toplam, i - k + 1
    return bas, en_iyi

gunluk = [120, 300, 80, 450, 200, 90, 310]
print(en_iyi_pencere(gunluk, 3))   # (1, 830): 300+80+450</pre>

<h3>4. İki pointer ve ikili arama</h3>
<p>Sıralı veride iki uçtan ortaya yürümek (iki pointer) ya da ortadan ikiye bölmek (ikili arama, O(log n)) klasik kalıplardır. <code>bisect</code> modülü ikili aramayı hazır verir ama mülakatta elle yazmanı isterler: <code>lo, hi</code> sınırları ve <code>mid</code> hesabı; döngü <code>lo &lt;= hi</code> sürdükçe.</p>
<pre class="py">def ikili_ara(sirali, hedef):
    lo, hi = 0, len(sirali) - 1
    while lo &lt;= hi:
        mid = (lo + hi) // 2
        if sirali[mid] == hedef:
            return mid
        if sirali[mid] &lt; hedef:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

print(ikili_ara([3, 8, 15, 21, 42, 57], 21))   # 3
print(ikili_ara([3, 8, 15, 21, 42, 57], 22))   # -1</pre>

<h3>5. BFS: en kısa yol</h3>
<p>Grafta "A\'dan B\'ye en az kaç adım?" sorusunda genişlik öncelikli arama (BFS) kullanılır: kuyruk (<code>collections.deque</code>) ve ziyaret edilenler kümesi. Depo ağı, sosyal bağlantı, kelime merdiveni; hepsi aynı kalıp.</p>
<pre class="py">from collections import deque

depolar = {
    "İstanbul": ["Bursa", "Kocaeli"],
    "Bursa": ["İstanbul", "Eskişehir"],
    "Kocaeli": ["İstanbul", "Ankara"],
    "Eskişehir": ["Bursa", "Ankara"],
    "Ankara": ["Kocaeli", "Eskişehir"],
}

def en_kisa_adim(graf, bas, hedef):
    kuyruk = deque([(bas, 0)])
    ziyaret = {bas}
    while kuyruk:
        dugum, adim = kuyruk.popleft()
        if dugum == hedef:
            return adim
        for komsu in graf.get(dugum, []):
            if komsu not in ziyaret:
                ziyaret.add(komsu)
                kuyruk.append((komsu, adim + 1))
    return -1

print(en_kisa_adim(depolar, "İstanbul", "Ankara"))   # 2</pre>
<div class="warn"><b>Ziyareti kuyruğa eklerken işaretle</b>Kuyruktan çıkarırken işaretlersen aynı düğüm kuyruğa birden çok kez girer; büyük grafta süre patlar. Kümeye ekleme anı, kuyruğa ekleme anıyla aynı olmalı.</div>

<h2>Karmaşıklık: Big-O konuşabilmek</h2>
<p>Her çözümden sonra mülakatçı "karmaşıklığı ne?" diye sorar. Kısa sözlük: sözlük/küme erişimi O(1) ortalama; listede arama O(n); sıralama O(n log n); çift döngü O(n²); ikili arama O(log n); BFS O(V + E). Bellek için de aynı soru gelir: ek sözlük tutuyorsan O(n) bellek. "Daha iyisi var mı?" sorusuna, mümkünse "hayır, çünkü her elemana en az bir kez bakmak gerekir" gibi bir alt sınır argümanı ver.</p>
<div class="tip"><b>Python\'a özgü püf noktalar</b><code>in</code> listede O(n), kümede O(1). String birleştirmede döngüde <code>+=</code> yerine liste toplayıp <code>"".join</code>. <code>list.pop(0)</code> O(n), <code>deque.popleft()</code> O(1). Bunları söylemek "dili biliyor" izlenimi verir.</div>

<h2>Canlı kodlama ipuçları</h2>
<div class="steps-list"><ol>
<li><b>Soruyu tekrar et ve netleştir:</b> Girdi boş olabilir mi? Negatif sayı var mı? Tekrar eden eleman? Çıktı indeks mi değer mi? Her soru bir puan.</li>
<li><b>Küçük bir örnek yaz:</b> 4-5 elemanlı girdi ve beklenen çıktı. Örnek olmadan kod yazma.</li>
<li><b>Önce kaba çözümü söyle:</b> "Çift döngüyle O(n²) olur; sözlükle O(n)\'e indirebilirim." Mülakatçı düşünme sürecini görmek ister.</li>
<li><b>Sesli düşün, sessiz yazma:</b> Takıldığında "burada iki seçenek var" de. Sessizlik en kötü sinyaldir.</li>
<li><b>Yazdıktan sonra örnekle izle:</b> Kodu satır satır örnek üzerinde yürüt. Kenar durumları (boş, tek eleman, hepsi aynı) kontrol et.</li>
<li><b>Karmaşıklığı kendin söyle:</b> Sorulmadan "zaman O(n), bellek O(n)" de.</li>
<li><b>Temiz ad ve küçük fonksiyon:</b> <code>a, b, tmp</code> yerine <code>gorulen, kalan</code>. Test edilebilir fonksiyon yaz, <code>print</code> ile değil <code>return</code> ile sonuç ver.</li>
</ol></div>

<h2>Sistem tasarımı için Python</h2>
<p>Üst düzey pozisyonlarda "Ilgaz Bank\'ın işlem akışını işleyen bir servis tasarla" tarzı sorular gelir. Beklenen, kod değil, bileşenler ve seçimler: giriş (API, kuyruk), işleme (worker havuzu), depolama (ilişkisel/belge), gözlemleme (log, metrik). Python özelinde şunları söyleyebilmek fark yaratır: I/O yoğun servis için asyncio + FastAPI; CPU yoğun iş için multiprocessing ya da ayrı worker; büyük veri için pandas yerine parçalı işleme ya da polars/duckdb; durum paylaşımı için Redis; kuyruk için Celery/RQ ya da bulut kuyruğu. Her seçimi "neden" ile bağla: "GIL yüzünden CPU işini thread\'e değil process\'e veririm."</p>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Soruyu kalıba indirgeme pratiği</h3>
<p>Her gün bir soru çöz ve çözümden sonra şu üç satırı yaz: kalıp (sözlük / küme / pencere / iki pointer / ikili arama / BFS-DFS / dinamik programlama), karmaşıklık, kenar durumları. Bir ay sonra soruları duyar duymaz kalıbı göreceksin. Dinamik programlama (en uzun ortak alt dizi, para üstü) ve heap (en büyük k eleman, <code>heapq.nlargest</code>) bu dersin kapsamı dışında kalan ama sık sorulan iki kalıptır; sırada onlar olsun.</p>
<h3>Yanlış ama sık verilen cevaplar</h3>
<p>"GIL Python\'ı tek çekirdekli yapar" (yanlış: multiprocessing ve C uzantıları çekirdekleri kullanır). "Tuple değişmezdir, içi de değişmez" (yanlış: tuple içindeki liste değişir). "Decorator yalnızca loglama içindir" (eksik: önbellek, yetki, yeniden deneme, kayıt). "is daha hızlıdır, hep onu kullan" (yanlış: kimlik ile eşitlik farklı sorulardır; küçük tamsayı önbelleği yanıltır).</p>
<h3>Ev ödevi projesi (take-home)</h3>
<p>Bazı şirketler canlı kodlama yerine ev ödevi verir. Değerlendirme ölçütleri: README (nasıl çalışır, nasıl test edilir), testler, tip ipuçları, lint temizliği, küçük ve odaklı commit\'ler, hata yönetimi. Bir önceki dersin kalite zincirini uygula; "çalışıyor" yetmez, "üretime konabilir" izlenimi ver.</p>
<h3>Davranışsal sorular</h3>
<p>"Zor bir hatayı nasıl buldun?" sorusuna STAR biçiminde cevap ver: Durum, Görev, Eylem, Sonuç. Teknik ayrıntı ver (profil aldım, darboğaz sorgu birleştirmedeydi, indeks ekledim) ama bir dakikayı geçme.</p>
</section>`,
  ex: [
    { t: 'code', id: 'mulakat-hazirlik-1',
      q: '<p><code>iki_toplam(sayilar, hedef)</code>: toplamı <code>hedef</code> eden iki farklı elemanın indekslerini <code>[kucuk, buyuk]</code> listesi olarak döndürsün; yoksa boş liste. Çözüm tek geçişte O(n) olmalı (sözlük kullan); çift döngü testte zaman aşımına düşer.</p>',
      start: 'def iki_toplam(sayilar, hedef):\n    pass\n',
      sol: 'def iki_toplam(sayilar, hedef):\n    gorulen = {}\n    for i, s in enumerate(sayilar):\n        kalan = hedef - s\n        if kalan in gorulen:\n            return [gorulen[kalan], i]\n        gorulen[s] = i\n    return []\n',
      tests: 'assert iki_toplam([250, 90, 410, 160, 300], 500) == [1, 2], "90 + 410"\nassert iki_toplam([3, 3], 6) == [0, 1], "aynı değerden iki tane farklı indeks"\nassert iki_toplam([1, 2, 3], 10) == [], "yoksa boş liste"\nassert iki_toplam([], 5) == [], "boş girdi"\nimport time\nbuyuk = list(range(200000))\nt0 = time.perf_counter()\nassert iki_toplam(buyuk, 399997) == [199998, 199999], "büyük girdi"\nassert time.perf_counter() - t0 < (2 * (4 if __import__("sys").platform == "emscripten" else 1)), "çözüm O(n) olmalı; çift döngü çok yavaş"\n',
      hints: ['Sözlükte değer -> indeks tut.', 'Her elemanda hedef - s sözlükte var mı diye bak; yoksa elemanı ekle.'],
      why: 'Zaman O(n), bellek O(n). Sözlük aramasının O(1) olması çift döngüyü tek geçişe indirir. Elemanı kontrolden sonra eklemek aynı indeksin iki kez kullanılmasını önler.' },
    { t: 'code', id: 'mulakat-hazirlik-2',
      q: '<p><code>anagram_gruplari(kelimeler)</code>: aynı harflerden oluşan kelimeleri gruplasın. Dönüş: her grup bir liste (girdi sırası korunur), gruplar ilk görülme sırasına göre dizilmiş liste.</p>',
      start: 'def anagram_gruplari(kelimeler):\n    pass\n',
      sol: 'def anagram_gruplari(kelimeler):\n    gruplar = {}\n    for k in kelimeler:\n        anahtar = "".join(sorted(k))\n        gruplar.setdefault(anahtar, []).append(k)\n    return list(gruplar.values())\n',
      tests: 'r = anagram_gruplari(["kalem", "melak", "defter", "lemak", "silgi", "ilgis"])\nassert r == [["kalem", "melak", "lemak"], ["defter"], ["silgi", "ilgis"]], f"gelen {r}"\nassert anagram_gruplari([]) == [], "boş girdi"\nassert anagram_gruplari(["a"]) == [["a"]], "tek kelime"\n',
      hints: ['Anahtar: "".join(sorted(kelime)).', 'dict.setdefault(anahtar, []).append(k) ile grupla; dict ekleme sırasını korur.'],
      why: 'Zaman O(n · k log k) (k kelime uzunluğu, sıralama için); bellek O(n). Sıralanmış harfler anagramlar için ortak anahtar üretir; sözlük ekleme sırasını koruduğundan grup sırası doğal olarak ilk görülme sırasıdır.' },
    { t: 'code', id: 'mulakat-hazirlik-3',
      q: '<p><code>en_uzun_ardisik(sayilar)</code>: sırasız tamsayı listesinde ardışık (1 farkla) sayılardan oluşan en uzun dizinin uzunluğunu döndürsün. Sıralama kullanmadan küme ile O(n) çöz. Boş liste için 0.</p>',
      start: 'def en_uzun_ardisik(sayilar):\n    pass\n',
      sol: 'def en_uzun_ardisik(sayilar):\n    kume = set(sayilar)\n    en_iyi = 0\n    for s in kume:\n        if s - 1 not in kume:\n            n = 1\n            while s + n in kume:\n                n += 1\n            en_iyi = max(en_iyi, n)\n    return en_iyi\n',
      tests: 'assert en_uzun_ardisik([100, 4, 200, 1, 3, 2]) == 4, "1,2,3,4"\nassert en_uzun_ardisik([]) == 0, "boş"\nassert en_uzun_ardisik([7, 7, 7]) == 1, "tekrarlar tek sayılır"\nassert en_uzun_ardisik([-2, -1, 0, 5, 6]) == 3, "negatifler"\nimport time\nbuyuk = list(range(0, 300000, 2)) + list(range(1, 100000, 2))\nt0 = time.perf_counter()\nassert en_uzun_ardisik(buyuk) == 100001, "0..100000 ardışık"\nassert time.perf_counter() - t0 < (3 * (4 if __import__("sys").platform == "emscripten" else 1)), "O(n) olmalı; her sayıdan ileri sayma O(n²) olur"\n',
      hints: ['Listeyi kümeye çevir.', 'Yalnızca s-1 kümede olmayan sayılardan (dizi başı) ileri say.'],
      why: 'Zaman O(n), bellek O(n). İç while yalnızca dizi başlarında çalışır; her eleman toplamda bir kez sayılır. Dizi başı kontrolü olmadan çözüm O(n²) olur, büyük girdi testi bunu yakalar.' },
    { t: 'code', id: 'mulakat-hazirlik-4',
      q: '<p>Kayan pencere: <code>en_iyi_pencere(ciro, k)</code> art arda <code>k</code> günün en yüksek toplam cirosunu veren pencerenin <code>(baslangic_indeksi, toplam)</code> demetini döndürsün. Eşitlikte ilk pencere kazanır. <code>k</code> liste uzunluğundan büyükse ya da liste boşsa <code>(-1, 0)</code> döndür. Her pencereyi yeniden toplamadan O(n) çöz.</p>',
      start: 'def en_iyi_pencere(ciro, k):\n    pass\n',
      sol: 'def en_iyi_pencere(ciro, k):\n    if k <= 0 or k > len(ciro):\n        return (-1, 0)\n    toplam = sum(ciro[:k])\n    en_iyi, bas = toplam, 0\n    for i in range(k, len(ciro)):\n        toplam += ciro[i] - ciro[i - k]\n        if toplam > en_iyi:\n            en_iyi, bas = toplam, i - k + 1\n    return (bas, en_iyi)\n',
      tests: 'assert en_iyi_pencere([120, 300, 80, 450, 200, 90, 310], 3) == (1, 830), "300+80+450"\nassert en_iyi_pencere([5, 5, 5], 2) == (0, 10), "eşitlikte ilk pencere"\nassert en_iyi_pencere([1, 2], 3) == (-1, 0), "k büyükse (-1, 0)"\nassert en_iyi_pencere([], 1) == (-1, 0), "boş liste"\nassert en_iyi_pencere([4, 9, 1], 1) == (1, 9), "k=1 en büyük eleman"\n',
      hints: ['İlk k elemanın toplamıyla başla.', 'Her adımda yeni elemanı ekle, pencereden çıkanı (i-k) çıkar.'],
      why: 'Zaman O(n), bellek O(1). Pencere kaydıkça yalnızca bir giren bir çıkan eleman güncellenir; yeniden toplama O(n·k) olurdu.' },
    { t: 'mc', q: '<code>x = [1, 2]; y = x[:]</code> ve ardından <code>x.append(3)</code> sonrasında <code>y</code> nedir?',
      o: ['[1, 2, 3]', '[1, 2]', 'Hata verir', 'None'], a: 1,
      why: 'Dilimleme yeni bir liste (shallow copy) üretir; dış kap ayrıdır, bu yüzden x\'e ekleme y\'yi etkilemez. İç nesneler mutable olsaydı (iç içe liste) onlar paylaşılırdı.' },
    { t: 'code', id: 'mulakat-hazirlik-5',
      q: '<p>İkili arama: <code>ikili_ara(sirali, hedef)</code> artan sıralı listede <code>hedef</code>\'in indeksini, yoksa <code>-1</code> döndürsün. <code>bisect</code> ve <code>list.index</code> kullanma; <code>lo/hi/mid</code> ile elle yaz. Ayrıca döngü adım sayısını say ve <code>(indeks, adim)</code> döndür (adım: mid hesaplanan tur sayısı).</p>',
      start: 'def ikili_ara(sirali, hedef):\n    lo, hi = 0, len(sirali) - 1\n    adim = 0\n    pass\n',
      sol: 'def ikili_ara(sirali, hedef):\n    lo, hi = 0, len(sirali) - 1\n    adim = 0\n    while lo <= hi:\n        adim += 1\n        mid = (lo + hi) // 2\n        if sirali[mid] == hedef:\n            return (mid, adim)\n        if sirali[mid] < hedef:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return (-1, adim)\n',
      tests: 'veri = [3, 8, 15, 21, 42, 57, 60, 75]\nassert ikili_ara(veri, 21)[0] == 3, "21 indeks 3"\nassert ikili_ara(veri, 22)[0] == -1, "22 yok"\nassert ikili_ara([], 5) == (-1, 0), "boş liste 0 adım"\nassert ikili_ara([7], 7) == (0, 1), "tek eleman 1 adım"\nbuyuk = list(range(0, 2000000, 2))\nidx, adim = ikili_ara(buyuk, 1999998)\nassert idx == 999999, "son eleman"\nassert adim <= 21, f"1 milyon elemanda en çok ~20 adım olmalı, {adim} adım yapıldı"\n',
      hints: ['while lo &lt;= hi: mid = (lo + hi) // 2.', 'Küçükse lo = mid + 1, büyükse hi = mid - 1.'],
      why: 'Zaman O(log n), bellek O(1). Her tur arama aralığını yarılar; 1 milyon eleman için en çok 20-21 adım. lo &lt;= hi koşulu tek elemanlı aralığı da kontrol eder.' },
    { t: 'code', id: 'mulakat-hazirlik-6',
      q: '<p>BFS: <code>en_kisa_adim(graf, bas, hedef)</code> komşuluk sözlüğü (<code>{dugum: [komsular]}</code>) verilen yönsüz grafta <code>bas</code>\'tan <code>hedef</code>\'e en az kaç kenar geçildiğini döndürsün; ulaşılamıyorsa <code>-1</code>. <code>bas == hedef</code> ise 0. <code>collections.deque</code> kullan.</p>',
      start: 'from collections import deque\n\ndef en_kisa_adim(graf, bas, hedef):\n    pass\n',
      sol: 'from collections import deque\n\ndef en_kisa_adim(graf, bas, hedef):\n    kuyruk = deque([(bas, 0)])\n    ziyaret = {bas}\n    while kuyruk:\n        dugum, adim = kuyruk.popleft()\n        if dugum == hedef:\n            return adim\n        for komsu in graf.get(dugum, []):\n            if komsu not in ziyaret:\n                ziyaret.add(komsu)\n                kuyruk.append((komsu, adim + 1))\n    return -1\n',
      tests: 'g = {"İstanbul": ["Bursa", "Kocaeli"], "Bursa": ["İstanbul", "Eskişehir"], "Kocaeli": ["İstanbul", "Ankara"], "Eskişehir": ["Bursa", "Ankara"], "Ankara": ["Kocaeli", "Eskişehir"], "Van": []}\nassert en_kisa_adim(g, "İstanbul", "Ankara") == 2, "İstanbul-Kocaeli-Ankara"\nassert en_kisa_adim(g, "Bursa", "Kocaeli") == 2, "Bursa-İstanbul-Kocaeli"\nassert en_kisa_adim(g, "İstanbul", "Van") == -1, "ulaşılamaz"\nassert en_kisa_adim(g, "Ankara", "Ankara") == 0, "aynı düğüm 0"\n',
      hints: ['Kuyruğa (düğüm, adım) çifti koy; ziyaret kümesine kuyruğa eklerken ekle.', 'Hedefi kuyruktan çıkarırken kontrol et ve adımı döndür.'],
      why: 'Zaman O(V + E), bellek O(V). BFS katman katman ilerlediği için hedefe ilk ulaşan yol en kısadır. Ziyareti kuyruğa eklerken işaretlemek aynı düğümün tekrar kuyruğa girmesini önler.' },
    { t: 'code', id: 'mulakat-hazirlik-7',
      q: '<p>İki pointer: artan sıralı <code>fiyatlar</code> listesinde toplamı <code>butce</code>\'yi aşmayan en büyük toplamı veren iki farklı ürünün <code>(i, j)</code> indekslerini döndür (<code>i &lt; j</code>). Hiçbir çift sığmıyorsa ya da liste 2\'den kısaysa <code>None</code>. Fonksiyon adı <code>en_iyi_cift(fiyatlar, butce)</code>; iki uçtan ortaya yürüyen O(n) çözüm yaz.</p>',
      start: 'def en_iyi_cift(fiyatlar, butce):\n    pass\n',
      sol: 'def en_iyi_cift(fiyatlar, butce):\n    i, j = 0, len(fiyatlar) - 1\n    en_iyi = None\n    en_iyi_toplam = -1\n    while i < j:\n        t = fiyatlar[i] + fiyatlar[j]\n        if t <= butce:\n            if t > en_iyi_toplam:\n                en_iyi_toplam, en_iyi = t, (i, j)\n            i += 1\n        else:\n            j -= 1\n    return en_iyi\n',
      tests: 'assert en_iyi_cift([90, 160, 250, 300, 410], 500) == (0, 4), "90 + 410 = 500"\nassert en_iyi_cift([90, 160, 250, 300, 410], 1000) == (3, 4), "en pahalı iki"\nassert en_iyi_cift([300, 400], 500) == None, "hiçbir çift sığmaz"\nassert en_iyi_cift([100], 500) == None, "tek eleman"\nassert en_iyi_cift([50, 50, 50], 100) == (0, 2), "ilk bulunan 100 toplamı; daha iyisi yok"\n',
      hints: ['i baştan, j sondan başlasın.', 'Toplam bütçeyi aşıyorsa j azalt; sığıyorsa en iyiyi güncelle ve i artır.'],
      why: 'Zaman O(n), bellek O(1). Sıralı veride toplam fazla geliyorsa büyük ucu küçültmek, az geliyorsa küçük ucu büyütmek tüm anlamlı çiftleri tek geçişte tarar.' }
  ],
  faq: [
    { q: 'Mülakatta çözümü hatırlayamazsam ne yapmalıyım?', a: 'Kaba çözümü yaz ve karmaşıklığını söyle; sonra "sözlükle iyileştirebilirim" gibi yönü belirt. Çalışan O(n²) çözüm, bitmemiş O(n) çözümden iyidir. Mülakatçıdan ipucu istemek de puan kaybettirmez; sessiz kalmak kaybettirir.' },
    { q: 'Hangi dili/araçları bildiğimi nasıl kanıtlarım?', a: 'Kodda Pythonic kalıplar kullan: enumerate, zip, comprehension, setdefault, deque, Counter. Big-O ve bellek yorumunu kendin ekle. Küçük bir test (assert) yazmak güçlü bir sinyaldir.' },
    { q: 'GIL sorusunda ne kadar derine inmeliyim?', a: 'Üç cümle: ne olduğu, neden I/O için threading işe yarar (bekleme sırasında kilit bırakılır), CPU işi için multiprocessing ya da C uzantıları (numpy) kullanılır. Python 3.13\'te deneysel gelip 3.14\'te resmî destek kazanan serbest iş parçacığı (free-threaded) derlemesinin varlığını bilmek artı puan.' },
    { q: 'Ev ödevi projesinde en çok neye bakıyorlar?', a: 'README, testler, temiz yapı ve hata yönetimi. Fazla özellik eklemek yerine istenen işi eksiksiz, test edilmiş ve okunur biçimde teslim et.' }
  ],
  mistakes: [
    { bad: 'if x == None:\n    ...', good: 'if x is None:\n    ...', why: 'None tekil nesnedir; kimlik karşılaştırması hem doğru hem de __eq__ ezilmiş sınıflarda güvenlidir (PEP 8).' },
    { bad: 'kuyruk = []\n...\ndugum = kuyruk.pop(0)', good: 'from collections import deque\nkuyruk = deque()\n...\ndugum = kuyruk.popleft()', why: 'list.pop(0) tüm elemanları kaydırır, O(n); BFS\'te toplam O(n²) olur. deque.popleft() O(1).' },
    { bad: 'for i in range(len(a)):\n    for j in range(len(a)):\n        if a[i] + a[j] == hedef:\n            ...', good: 'gorulen = {}\nfor i, s in enumerate(a):\n    if hedef - s in gorulen:\n        ...\n    gorulen[s] = i', why: 'Çift döngü O(n²) ve i == j durumunda aynı elemanı iki kez kullanır; sözlük hem O(n) hem doğru.' },
    { bad: 'metin = ""\nfor p in parcalar:\n    metin += p', good: 'metin = "".join(parcalar)', why: 'Döngüde string birleştirme her adımda yeni nesne oluşturur; join tek seferde birleştirir ve mülakatta "dili biliyor" sinyali verir.' }
  ]
}
,
/* ───────────────────────── 3. proje-ileri ───────────────────────── */
// needs: pandas
{
  id: 'proje-ileri',
  lv: 'ileri',
  mod: 'Bitirme',
  min: 90,
  needs: ['pandas'],
  title: 'Bitirme projesi: Anadolu Market müşteri analitiği paketi',
  sum: 'pandas ile RFM segmentasyonu ve kohort analizi, async ile sayfalı veri çekme, argparse CLI ve unittest içeren uçtan uca bir analitik paket kurarsın.',
  goals: [
    'Sipariş verisinden müşteri başına recency/frequency/monetary ölçütlerini hesaplayıp quantile skorlarıyla segment üretebilirim.',
    'İlk sipariş ayına göre kohort tablosu kurup müşteri tutundurmayı (retention) okuyabilirim.',
    'groupby ile en çok satan ürün ve kategoriyi ciro ve adetle raporlayabilirim.',
    'asyncio ile sayfalı bir API\'den tüm kayıtları sırayla ve güvenli biçimde çekebilirim.',
    'argparse ile alt komutlu bir CLI tasarlayıp iş mantığını unittest ile test edebilirim.'
  ],
  body: `
<h2>Proje: müşteri analitiği paketi</h2>
<p>Anadolu Market\'in pazarlama ekibi üç soru soruyor: "Hangi müşterilere kampanya gönderelim?", "Yeni gelen müşteriler ikinci ay geri dönüyor mu?", "Hangi ürün ve kategori ciroyu taşıyor?" Bu projede üç soruyu cevaplayan, komut satırından çalışan ve testli bir paket kuracaksın. Paket, önceki derslerin hepsini birleştirir: pandas (groupby, qcut, pivot), asyncio (sayfalı veri çekme), argparse (CLI), unittest (doğrulama).</p>
<div class="tbl-wrap"><table>
<tr><th>Modül</th><th>Sorumluluk</th><th>Ana fonksiyonlar</th></tr>
<tr><td>veri.py</td><td>Ham kayıtları DataFrame\'e çevirmek</td><td>siparis_df</td></tr>
<tr><td>rfm.py</td><td>RFM ölçütleri, skor, segment</td><td>rfm_hesapla, rfm_skor, segment</td></tr>
<tr><td>kohort.py</td><td>İlk sipariş ayına göre tutundurma tablosu</td><td>kohort_tablosu</td></tr>
<tr><td>urun.py</td><td>En çok satan ürün/kategori</td><td>en_cok_satan</td></tr>
<tr><td>api.py</td><td>Sayfalı veri çekme (async)</td><td>api_sayfa, hepsini_cek</td></tr>
<tr><td>cli.py</td><td>argparse ile komutlar</td><td>parse_args, main</td></tr>
<tr><td>tests/</td><td>unittest</td><td>TestRfm, TestKohort</td></tr>
</table></div>
<div class="note"><b>Her kutu bağımsız</b>Bu sayfadaki her kod kutusu kendi başına çalışır; bu yüzden örnek veri ve gerekli fonksiyonlar her kutuda yeniden kurulur. Gerçek pakette hepsi ayrı modüllerde bir kez yazılır.</div>
<div class="note"><b>Sürüm uyumu</b>Bu uygulama tarayıcıda pandas 2.2, bilgisayarında büyük olasılıkla pandas 3.x çalıştırır. İkisinde de aynı sonucu veren sade bir API kullanacağız: <code>groupby(..., observed=True)</code> belirt, <code>inplace=True</code> kullanma (kopya döndür), <code>pd.qcut</code>\'tan önce <code>rank(method="first")</code> uygula, kategorik/str tür ayrıntılarına yaslanma.</div>

<h2>1. Veri katmanı</h2>
<p>Veri ders içinde küçük bir sözlük listesi; gerçek hayatta aynı yapı CSV ya da API\'den gelir. İlk iş tarihi gerçek tarih türüne çevirmek ve ay sütununu çıkarmak:</p>
<pre class="py">import pandas as pd

KAYITLAR = [
    {"musteri": "Ayşe", "tarih": "2024-01-05", "urun": "Kalem", "kategori": "Kırtasiye", "tutar": 120.0},
    {"musteri": "Mehmet", "tarih": "2024-01-12", "urun": "Kulaklık", "kategori": "Elektronik", "tutar": 850.0},
    {"musteri": "Ayşe", "tarih": "2024-02-03", "urun": "Defter", "kategori": "Kırtasiye", "tutar": 60.0},
    {"musteri": "Zeynep", "tarih": "2024-02-10", "urun": "Kulaklık", "kategori": "Elektronik", "tutar": 850.0},
    {"musteri": "Ayşe", "tarih": "2024-03-15", "urun": "Kulaklık", "kategori": "Elektronik", "tutar": 850.0},
    {"musteri": "Mehmet", "tarih": "2024-03-20", "urun": "Kalem", "kategori": "Kırtasiye", "tutar": 120.0},
    {"musteri": "Ali", "tarih": "2024-03-22", "urun": "Çanta", "kategori": "Aksesuar", "tutar": 400.0},
    {"musteri": "Zeynep", "tarih": "2024-04-01", "urun": "Defter", "kategori": "Kırtasiye", "tutar": 60.0},
    {"musteri": "Ali", "tarih": "2024-04-18", "urun": "Kalem", "kategori": "Kırtasiye", "tutar": 120.0},
    {"musteri": "Elif", "tarih": "2024-04-25", "urun": "Çanta", "kategori": "Aksesuar", "tutar": 400.0},
]

def siparis_df(kayitlar):
    df = pd.DataFrame(kayitlar)
    df["tarih"] = pd.to_datetime(df["tarih"])
    df["ay"] = df["tarih"].dt.to_period("M").astype(str)
    return df

df = siparis_df(KAYITLAR)
print(df[["musteri", "ay", "tutar"]].head())
print("satır:", len(df), "| müşteri:", df["musteri"].nunique())</pre>
<p><code>to_period("M")</code> tarihi aya yuvarlar; <code>astype(str)</code> ile "2024-01" gibi karşılaştırması kolay bir metne çevirmek iki pandas sürümünde de aynı davranır.</p>

<h2>2. RFM segmentasyonu</h2>
<p>RFM üç ölçüt: <b>Recency</b> (son siparişten bu yana geçen gün; az olması iyi), <b>Frequency</b> (sipariş sayısı), <b>Monetary</b> (toplam harcama). Her müşteri için üçünü hesaplayıp her birini 1-4 arası skora çeviririz; skorların toplamı segment belirler.</p>
<pre class="py">import pandas as pd

df = pd.DataFrame({
    "musteri": ["Ayşe", "Mehmet", "Ayşe", "Zeynep", "Ayşe", "Mehmet", "Ali", "Zeynep", "Ali", "Elif"],
    "tarih": pd.to_datetime(["2024-01-05", "2024-01-12", "2024-02-03", "2024-02-10", "2024-03-15",
                             "2024-03-20", "2024-03-22", "2024-04-01", "2024-04-18", "2024-04-25"]),
    "urun": ["Kalem", "Kulaklık", "Defter", "Kulaklık", "Kulaklık", "Kalem", "Çanta", "Defter", "Kalem", "Çanta"],
    "kategori": ["Kırtasiye", "Elektronik", "Kırtasiye", "Elektronik", "Elektronik", "Kırtasiye", "Aksesuar", "Kırtasiye", "Kırtasiye", "Aksesuar"],
    "tutar": [120.0, 850.0, 60.0, 850.0, 850.0, 120.0, 400.0, 60.0, 120.0, 400.0],
})

def rfm_hesapla(df, bugun):
    bugun = pd.Timestamp(bugun)
    g = df.groupby("musteri", observed=True)
    rfm = pd.DataFrame({
        "recency": (bugun - g["tarih"].max()).dt.days,
        "frequency": g["tarih"].count(),
        "monetary": g["tutar"].sum(),
    })
    return rfm.reset_index()

rfm = rfm_hesapla(df, "2024-05-01")
print(rfm)</pre>
<p>Skorlama için quantile (çeyreklik) kullanırız: müşterileri ölçüte göre dört eşit gruba böl, en iyi gruba 4 ver. <code>pd.qcut</code> bunu yapar; ancak aynı değere sahip çok müşteri varsa "kenarlar tekrarlı" hatası verir. Çare, önce <code>rank(method="first")</code> ile her müşteriye benzersiz bir sıra vermek. Recency\'de küçük değer iyi olduğu için etiketleri ters çeviririz.</p>
<pre class="py">import pandas as pd

df = pd.DataFrame({
    "musteri": ["Ayşe", "Mehmet", "Ayşe", "Zeynep", "Ayşe", "Mehmet", "Ali", "Zeynep", "Ali", "Elif"],
    "tarih": pd.to_datetime(["2024-01-05", "2024-01-12", "2024-02-03", "2024-02-10", "2024-03-15",
                             "2024-03-20", "2024-03-22", "2024-04-01", "2024-04-18", "2024-04-25"]),
    "urun": ["Kalem", "Kulaklık", "Defter", "Kulaklık", "Kulaklık", "Kalem", "Çanta", "Defter", "Kalem", "Çanta"],
    "kategori": ["Kırtasiye", "Elektronik", "Kırtasiye", "Elektronik", "Elektronik", "Kırtasiye", "Aksesuar", "Kırtasiye", "Kırtasiye", "Aksesuar"],
    "tutar": [120.0, 850.0, 60.0, 850.0, 850.0, 120.0, 400.0, 60.0, 120.0, 400.0],
})

def rfm_hesapla(df, bugun):
    bugun = pd.Timestamp(bugun)
    g = df.groupby("musteri", observed=True)
    rfm = pd.DataFrame({
        "recency": (bugun - g["tarih"].max()).dt.days,
        "frequency": g["tarih"].count(),
        "monetary": g["tutar"].sum(),
    })
    return rfm.reset_index()

def rfm_skor(rfm, q=4):
    rfm = rfm.copy()
    etiket = list(range(1, q + 1))
    rfm["R"] = pd.qcut(rfm["recency"].rank(method="first"), q, labels=etiket[::-1]).astype(int)
    rfm["F"] = pd.qcut(rfm["frequency"].rank(method="first"), q, labels=etiket).astype(int)
    rfm["M"] = pd.qcut(rfm["monetary"].rank(method="first"), q, labels=etiket).astype(int)
    rfm["skor"] = rfm["R"] + rfm["F"] + rfm["M"]
    return rfm

def segment(skor, q=4):
    ust = 3 * q
    if skor &gt;= ust - 2:
        return "Şampiyon"
    if skor &gt;= ust - 5:
        return "Sadık"
    if skor &gt;= 6:
        return "Potansiyel"
    return "Riskli"

rfm = rfm_hesapla(df, "2024-05-01")
skorlu = rfm_skor(rfm)
skorlu["segment"] = skorlu["skor"].apply(segment)
print(skorlu[["musteri", "R", "F", "M", "skor", "segment"]])</pre>
<div class="tip"><b>Neden rank(method="first")?</b>Beş müşteriden üçünün frequency\'si 2 ise qcut dört kutuya bölemez ve ValueError verir. rank(method="first") eşitleri görülme sırasına göre ayırır; kutu sınırları benzersiz olur. Üretimde eşitlik bozma kuralını (ör. son sipariş tarihi) belgele; farklı sürümlerde sıra değişmesin diye önce sırala.</div>

<h2>3. Kohort analizi</h2>
<p>Kohort (cohort), ilk siparişini aynı ayda veren müşteri grubudur. Soru: Ocak kohortundan kaç müşteri şubatta (1. ay), martta (2. ay) yine alışveriş yaptı? Hesap üç adım: her müşterinin ilk ayı, her siparişin ilk aya göre kaçıncı ayda olduğu, kohort × ay_no tablosunda benzersiz müşteri sayısı. Ay farkını sürümden bağımsız hesaplamak için yıl*12+ay tamsayısını kullanıyoruz.</p>
<pre class="py">import pandas as pd

df = pd.DataFrame({
    "musteri": ["Ayşe", "Mehmet", "Ayşe", "Zeynep", "Ayşe", "Mehmet", "Ali", "Zeynep", "Ali", "Elif"],
    "tarih": pd.to_datetime(["2024-01-05", "2024-01-12", "2024-02-03", "2024-02-10", "2024-03-15",
                             "2024-03-20", "2024-03-22", "2024-04-01", "2024-04-18", "2024-04-25"]),
    "urun": ["Kalem", "Kulaklık", "Defter", "Kulaklık", "Kulaklık", "Kalem", "Çanta", "Defter", "Kalem", "Çanta"],
    "kategori": ["Kırtasiye", "Elektronik", "Kırtasiye", "Elektronik", "Elektronik", "Kırtasiye", "Aksesuar", "Kırtasiye", "Kırtasiye", "Aksesuar"],
    "tutar": [120.0, 850.0, 60.0, 850.0, 850.0, 120.0, 400.0, 60.0, 120.0, 400.0],
})

def ay_index(seri):
    return seri.dt.year * 12 + seri.dt.month

def kohort_tablosu(df):
    df = df.copy()
    ilk = df.groupby("musteri", observed=True)["tarih"].min()
    df["ilk"] = df["musteri"].map(ilk)
    df["kohort"] = df["ilk"].dt.to_period("M").astype(str)
    df["ay_no"] = ay_index(df["tarih"]) - ay_index(df["ilk"])
    tablo = (df.groupby(["kohort", "ay_no"], observed=True)["musteri"]
               .nunique().unstack(fill_value=0))
    return tablo

tablo = kohort_tablosu(df)
print(tablo)
print("Ocak kohortu 2. ayda:", int(tablo.loc["2024-01", 2]))</pre>
<p>Tabloyu okuma: satır kohort, sütun ilk aydan itibaren geçen ay. 0. sütun kohort büyüklüğüdür; sonraki sütunları ona bölersen tutundurma oranını (retention rate) elde edersin. Üretimde bu tablo ısı haritasına dönüşür.</p>

<h2>4. En çok satan ürün ve kategori</h2>
<pre class="py">import pandas as pd

df = pd.DataFrame({
    "musteri": ["Ayşe", "Mehmet", "Ayşe", "Zeynep", "Ayşe", "Mehmet", "Ali", "Zeynep", "Ali", "Elif"],
    "tarih": pd.to_datetime(["2024-01-05", "2024-01-12", "2024-02-03", "2024-02-10", "2024-03-15",
                             "2024-03-20", "2024-03-22", "2024-04-01", "2024-04-18", "2024-04-25"]),
    "urun": ["Kalem", "Kulaklık", "Defter", "Kulaklık", "Kulaklık", "Kalem", "Çanta", "Defter", "Kalem", "Çanta"],
    "kategori": ["Kırtasiye", "Elektronik", "Kırtasiye", "Elektronik", "Elektronik", "Kırtasiye", "Aksesuar", "Kırtasiye", "Kırtasiye", "Aksesuar"],
    "tutar": [120.0, 850.0, 60.0, 850.0, 850.0, 120.0, 400.0, 60.0, 120.0, 400.0],
})

def en_cok_satan(df, sutun="urun", n=3):
    g = df.groupby(sutun, observed=True)["tutar"].agg(["count", "sum"]).reset_index()
    g.columns = [sutun, "adet", "ciro"]
    return (g.sort_values(["ciro", sutun], ascending=[False, True])
             .head(n).reset_index(drop=True))

print(en_cok_satan(df))
print(en_cok_satan(df, "kategori", 2))</pre>
<p>Sıralamada ikinci anahtar olarak ürün adını eklemek, eşit ciroda sonucu deterministik yapar; testler bunu sever.</p>

<h2>5. Sahte API\'den sayfalı veri çekme</h2>
<p>Gerçek sistemde siparişler bir API\'den sayfa sayfa gelir: <code>?sayfa=0&amp;boyut=100</code>. Ağ erişimimiz yok, bu yüzden API\'yi <code>asyncio.sleep</code> ile bekleyen bir coroutine olarak simüle ediyoruz. Yanıt, veriyi ve "son sayfa mı" bilgisini taşır; istemci son sayfaya kadar döner.</p>
<pre class="py">import asyncio

KAYITLAR = [{"id": i, "tutar": 100 + i * 10} for i in range(10)]

async def api_sayfa(kayitlar, sayfa, boyut):
    await asyncio.sleep(0.01)            # ağ gecikmesi simülasyonu
    bas = sayfa * boyut
    return {"veri": kayitlar[bas:bas + boyut], "son": bas + boyut &gt;= len(kayitlar)}

async def hepsini_cek(kayitlar, boyut):
    hepsi, sayfa = [], 0
    while True:
        yanit = await api_sayfa(kayitlar, sayfa, boyut)
        hepsi.extend(yanit["veri"])
        if yanit["son"]:
            break
        sayfa += 1
    return hepsi, sayfa + 1

loop = asyncio.new_event_loop()
veri, sayfa_sayisi = loop.run_until_complete(hepsini_cek(KAYITLAR, 4))
loop.close()
print(len(veri), "kayıt,", sayfa_sayisi, "sayfa")</pre>
<p>Sayfalar birbirine bağlı (bir sonrakini çekmek için öncekinin "son" bilgisi gerekir), bu yüzden sıralı await doğru. Toplam sayfa sayısı önceden biliniyorsa <code>gather</code> ile paralel çekmek mümkündür; alıştırmada iki yaklaşımı da göreceksin.</p>
<div class="warn"><b>Olay döngüsü</b>Tarayıcıda ve Jupyter\'da zaten bir döngü çalıştığı için <code>asyncio.run</code> hata verebilir; <code>new_event_loop().run_until_complete</code> kalıbı her ortamda çalışır.</div>

<h2>6. CLI: argparse ile alt komutlar</h2>
<p>Pazarlama ekibi kod yazmadan <code>python -m analitik rfm --bugun 2024-05-01</code> diyebilmeli. <code>parse_args</code> fonksiyonuna liste verebilmek test için kritik: <code>sys.argv</code> yerine <code>parse_args(["rfm", "--q", "3"])</code> ile her komutu testte deneyebilirsin.</p>
<pre class="py">import argparse

def parse_args(argv=None):
    p = argparse.ArgumentParser(prog="analitik", description="Anadolu Market müşteri analitiği")
    p.add_argument("komut", choices=["rfm", "kohort", "top"])
    p.add_argument("--bugun", default="2024-05-01")
    p.add_argument("--q", type=int, default=4)
    p.add_argument("--n", type=int, default=3)
    p.add_argument("--sutun", choices=["urun", "kategori"], default="urun")
    return p.parse_args(argv)

a = parse_args(["top", "--sutun", "kategori", "--n", "2"])
print(a.komut, a.sutun, a.n)
try:
    parse_args(["sil"])
except SystemExit as e:
    print("geçersiz komut, çıkış kodu:", e.code)</pre>
<p><code>main(argv)</code> fonksiyonu argümana göre ilgili fonksiyonu çağırıp sonucu yazdırır; iş mantığı CLI\'dan ayrı kaldığı için testler <code>main</code>\'e dokunmadan hesap fonksiyonlarını doğrular.</p>

<h2>7. unittest ile doğrulama</h2>
<pre class="code">import unittest

class TestRfm(unittest.TestCase):
    def setUp(self):
        self.df = siparis_df(KAYITLAR)

    def test_recency_ayse(self):
        rfm = rfm_hesapla(self.df, "2024-05-01").set_index("musteri")
        self.assertEqual(int(rfm.loc["Ayşe", "recency"]), 47)

    def test_skor_araligi(self):
        sk = rfm_skor(rfm_hesapla(self.df, "2024-05-01"))
        self.assertTrue(sk["skor"].between(3, 12).all())

if __name__ == "__main__":
    unittest.main(argv=["x"], exit=False)</pre>
<p><code>setUp</code> her testten önce taze veri kurar. Tarayıcıda <code>unittest.main(argv=["x"], exit=False)</code> kalıbı gerekir; aksi halde unittest tarayıcının argümanlarını okumaya çalışır ve çıkış yapar.</p>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Üretime taşırken</h3>
<p>Gerçek paket şu farklarla büyür: veri CSV/parquet ya da veritabanından okunur (<code>pd.read_sql</code>), API çağrıları httpx ile yapılır ve yeniden deneme (retry) + zaman aşımı eklenir, çıktı parquet ya da bir BI aracına yazılır, iş akışı zamanlayıcıyla (cron, Airflow) her gece koşar. RFM eşikleri sabit kodlanmaz, yapılandırma dosyasından okunur.</p>
<h3>Sürüm uyumunu test etmek</h3>
<p>pandas 2.2 ve 3.x farkları (varsayılan str türü, Copy-on-Write, groupby observed varsayılanı) için CI matrisinde iki sürümü de koştur. <code>inplace</code>\'ten kaçınmak, <code>observed=True</code> yazmak ve zincirleme atama yapmamak uyumun yüzde doksanıdır.</p>
<h3>RFM\'in ötesi</h3>
<p>RFM basit ve açıklanabilir olduğu için hâlâ yaygın; ama müşteri yaşam boyu değeri (CLV) tahmini, kayıp (churn) olasılığı ve ürün öneri sistemleri bir sonraki adımdır. Hepsi aynı veri katmanının üstüne kurulur; bu projedeki <code>siparis_df</code> temel kalır.</p>
<h3>Performans</h3>
<p>Milyonlarca satırda <code>apply(segment)</code> yavaşlar; <code>pd.cut</code> ile vektörel segmentleme ya da <code>np.select</code> kullan. Kohort tablosu için <code>pivot_table</code> ve kategorik türler belleği düşürür.</p>
</section>`,
  ex: [
    { t: 'code', id: 'proje-ileri-1',
      q: '<p>Parça 1: <code>siparis_df(kayitlar)</code> ve <code>rfm_hesapla(df, bugun)</code> fonksiyonlarını yaz. <code>siparis_df</code> sözlük listesini DataFrame\'e çevirsin, <code>tarih</code> sütununu datetime yapsın, <code>ay</code> sütununu <code>"YYYY-MM"</code> metni olarak eklesin. <code>rfm_hesapla</code> müşteri başına <code>recency</code> (bugün - son sipariş, gün), <code>frequency</code> (sipariş adedi) ve <code>monetary</code> (toplam tutar) sütunlarıyla, <code>musteri</code> sütunu olan (indeks değil) bir DataFrame döndürsün.</p>',
      start: 'import pandas as pd\n\nKAYITLAR = [\n    {"musteri": "Ayşe", "tarih": "2024-01-05", "urun": "Kalem", "kategori": "Kırtasiye", "tutar": 120.0},\n    {"musteri": "Mehmet", "tarih": "2024-01-12", "urun": "Kulaklık", "kategori": "Elektronik", "tutar": 850.0},\n    {"musteri": "Ayşe", "tarih": "2024-02-03", "urun": "Defter", "kategori": "Kırtasiye", "tutar": 60.0},\n    {"musteri": "Zeynep", "tarih": "2024-02-10", "urun": "Kulaklık", "kategori": "Elektronik", "tutar": 850.0},\n    {"musteri": "Ayşe", "tarih": "2024-03-15", "urun": "Kulaklık", "kategori": "Elektronik", "tutar": 850.0},\n    {"musteri": "Mehmet", "tarih": "2024-03-20", "urun": "Kalem", "kategori": "Kırtasiye", "tutar": 120.0},\n    {"musteri": "Ali", "tarih": "2024-03-22", "urun": "Çanta", "kategori": "Aksesuar", "tutar": 400.0},\n    {"musteri": "Zeynep", "tarih": "2024-04-01", "urun": "Defter", "kategori": "Kırtasiye", "tutar": 60.0},\n    {"musteri": "Ali", "tarih": "2024-04-18", "urun": "Kalem", "kategori": "Kırtasiye", "tutar": 120.0},\n    {"musteri": "Elif", "tarih": "2024-04-25", "urun": "Çanta", "kategori": "Aksesuar", "tutar": 400.0},\n]\n\ndef siparis_df(kayitlar):\n    pass\n\ndef rfm_hesapla(df, bugun):\n    pass\n',
      sol: 'import pandas as pd\n\nKAYITLAR = [\n    {"musteri": "Ayşe", "tarih": "2024-01-05", "urun": "Kalem", "kategori": "Kırtasiye", "tutar": 120.0},\n    {"musteri": "Mehmet", "tarih": "2024-01-12", "urun": "Kulaklık", "kategori": "Elektronik", "tutar": 850.0},\n    {"musteri": "Ayşe", "tarih": "2024-02-03", "urun": "Defter", "kategori": "Kırtasiye", "tutar": 60.0},\n    {"musteri": "Zeynep", "tarih": "2024-02-10", "urun": "Kulaklık", "kategori": "Elektronik", "tutar": 850.0},\n    {"musteri": "Ayşe", "tarih": "2024-03-15", "urun": "Kulaklık", "kategori": "Elektronik", "tutar": 850.0},\n    {"musteri": "Mehmet", "tarih": "2024-03-20", "urun": "Kalem", "kategori": "Kırtasiye", "tutar": 120.0},\n    {"musteri": "Ali", "tarih": "2024-03-22", "urun": "Çanta", "kategori": "Aksesuar", "tutar": 400.0},\n    {"musteri": "Zeynep", "tarih": "2024-04-01", "urun": "Defter", "kategori": "Kırtasiye", "tutar": 60.0},\n    {"musteri": "Ali", "tarih": "2024-04-18", "urun": "Kalem", "kategori": "Kırtasiye", "tutar": 120.0},\n    {"musteri": "Elif", "tarih": "2024-04-25", "urun": "Çanta", "kategori": "Aksesuar", "tutar": 400.0},\n]\n\ndef siparis_df(kayitlar):\n    df = pd.DataFrame(kayitlar)\n    df["tarih"] = pd.to_datetime(df["tarih"])\n    df["ay"] = df["tarih"].dt.to_period("M").astype(str)\n    return df\n\ndef rfm_hesapla(df, bugun):\n    bugun = pd.Timestamp(bugun)\n    g = df.groupby("musteri", observed=True)\n    rfm = pd.DataFrame({\n        "recency": (bugun - g["tarih"].max()).dt.days,\n        "frequency": g["tarih"].count(),\n        "monetary": g["tutar"].sum(),\n    })\n    return rfm.reset_index()\n',
      tests: 'import pandas as pd\ndf = siparis_df(KAYITLAR)\nassert len(df) == 10, "10 satır"\nassert pd.api.types.is_datetime64_any_dtype(df["tarih"]), "tarih datetime olmalı"\nassert list(df["ay"].head(3)) == ["2024-01", "2024-01", "2024-02"], "ay sütunu YYYY-MM metni"\nrfm = rfm_hesapla(df, "2024-05-01")\nassert "musteri" in rfm.columns, "musteri bir sütun olmalı (reset_index)"\nr = rfm.set_index("musteri")\nassert int(r.loc["Ayşe", "recency"]) == 47, "Ayşe recency 47 gün"\nassert int(r.loc["Ayşe", "frequency"]) == 3, "Ayşe 3 sipariş"\nassert abs(float(r.loc["Ayşe", "monetary"]) - 1030.0) < 1e-6, "Ayşe toplam 1030"\nassert int(r.loc["Elif", "recency"]) == 6 and int(r.loc["Elif", "frequency"]) == 1, "Elif 6 gün, 1 sipariş"\nassert len(rfm) == 5, "5 müşteri"\n',
      hints: ['pd.to_datetime ve .dt.to_period("M").astype(str).', 'groupby("musteri", observed=True) üzerinde tarih max/count ve tutar sum; (bugun - max).dt.days.', 'Sonunda reset_index() ile musteri sütun olsun.'],
      why: 'Üç ölçüt tek groupby nesnesinden üç ayrı toplamla gelir. Timestamp farkı Timedelta verir; .dt.days ile gün sayısına çevrilir.' },
    { t: 'code', id: 'proje-ileri-2',
      q: '<p>Parça 2: <code>rfm_skor(rfm, q=4)</code> ve <code>segment(skor, q=4)</code> yaz. <code>rfm_skor</code> girdiyi değiştirmeden kopya döndürsün; <code>R</code>, <code>F</code>, <code>M</code> sütunlarını <code>pd.qcut</code> ile 1..q arası tamsayı skor olarak eklesin (recency\'de küçük değer yüksek skor; eşitlikler için <code>rank(method="first")</code>), <code>skor</code> = R+F+M. <code>segment</code>: skor ≥ 3q-2 ise <code>"Şampiyon"</code>, ≥ 3q-5 ise <code>"Sadık"</code>, ≥ 6 ise <code>"Potansiyel"</code>, aksi halde <code>"Riskli"</code>.</p>',
      start: 'import pandas as pd\n\nRFM = pd.DataFrame({\n    "musteri": ["Ali", "Ayşe", "Elif", "Mehmet", "Zeynep"],\n    "recency": [13, 47, 6, 42, 30],\n    "frequency": [2, 3, 1, 2, 2],\n    "monetary": [520.0, 1030.0, 400.0, 970.0, 910.0],\n})\n\ndef rfm_skor(rfm, q=4):\n    pass\n\ndef segment(skor, q=4):\n    pass\n',
      sol: 'import pandas as pd\n\nRFM = pd.DataFrame({\n    "musteri": ["Ali", "Ayşe", "Elif", "Mehmet", "Zeynep"],\n    "recency": [13, 47, 6, 42, 30],\n    "frequency": [2, 3, 1, 2, 2],\n    "monetary": [520.0, 1030.0, 400.0, 970.0, 910.0],\n})\n\ndef rfm_skor(rfm, q=4):\n    rfm = rfm.copy()\n    etiket = list(range(1, q + 1))\n    rfm["R"] = pd.qcut(rfm["recency"].rank(method="first"), q, labels=etiket[::-1]).astype(int)\n    rfm["F"] = pd.qcut(rfm["frequency"].rank(method="first"), q, labels=etiket).astype(int)\n    rfm["M"] = pd.qcut(rfm["monetary"].rank(method="first"), q, labels=etiket).astype(int)\n    rfm["skor"] = rfm["R"] + rfm["F"] + rfm["M"]\n    return rfm\n\ndef segment(skor, q=4):\n    ust = 3 * q\n    if skor >= ust - 2:\n        return "Şampiyon"\n    if skor >= ust - 5:\n        return "Sadık"\n    if skor >= 6:\n        return "Potansiyel"\n    return "Riskli"\n',
      tests: 'sk = rfm_skor(RFM).set_index("musteri")\nassert "R" not in RFM.columns, "girdi değiştirilmemeli (kopya döndür)"\nassert int(sk.loc["Ayşe", "R"]) == 1 and int(sk.loc["Ayşe", "F"]) == 4 and int(sk.loc["Ayşe", "M"]) == 4, "Ayşe R=1 F=4 M=4"\nassert int(sk.loc["Elif", "R"]) == 4, "en yeni müşteri R=4"\nassert int(sk.loc["Ayşe", "skor"]) == 9, "Ayşe skor 9"\nassert sk["skor"].between(3, 12).all(), "skor 3..12 arası"\nassert set(sk["R"]) == {1, 2, 3, 4}, "R 1..4 değer almalı"\nsk3 = rfm_skor(RFM, q=3)\nassert sk3["skor"].between(3, 9).all() and set(sk3["F"]) == {1, 2, 3}, "q=3 ile skor 3..9"\nassert segment(12) == "Şampiyon" and segment(10) == "Şampiyon", "12 ve 10 Şampiyon"\nassert segment(9) == "Sadık" and segment(7) == "Sadık", "9 ve 7 Sadık"\nassert segment(6) == "Potansiyel" and segment(5) == "Riskli", "6 Potansiyel, 5 Riskli"\nassert segment(7, q=3) == "Şampiyon", "q=3: 7 Şampiyon"\n',
      hints: ['rfm.copy() ile başla.', 'pd.qcut(seri.rank(method="first"), q, labels=[...]).astype(int); recency için labels tersten.', 'segment eşikleri 3q-2, 3q-5, 6.'],
      why: 'qcut eşit sayıda müşteri içeren kutular üretir; rank(method="first") eşit değerlerde kutu sınırlarının çakışmasını önler. Etiketleri tersten vermek recency için "az gün = yüksek skor" kuralını uygular.' },
    { t: 'code', id: 'proje-ileri-3',
      q: '<p>Parça 3: <code>kohort_tablosu(df)</code> yaz. Her müşterinin kohortu ilk sipariş ayı (<code>"YYYY-MM"</code> metni), her siparişin <code>ay_no</code>\'su ilk aya göre geçen tam ay sayısı (yıl*12+ay farkı). Dönüş: satırlar kohort, sütunlar ay_no, hücreler o kohorttan o ayda sipariş veren <b>benzersiz</b> müşteri sayısı; olmayan hücre 0. (<code>groupby(...).nunique().unstack(fill_value=0)</code>)</p>',
      start: 'import pandas as pd\n\nKAYITLAR = [\n    {"musteri": "Ayşe", "tarih": "2024-01-05", "tutar": 120.0},\n    {"musteri": "Mehmet", "tarih": "2024-01-12", "tutar": 850.0},\n    {"musteri": "Ayşe", "tarih": "2024-02-03", "tutar": 60.0},\n    {"musteri": "Zeynep", "tarih": "2024-02-10", "tutar": 850.0},\n    {"musteri": "Ayşe", "tarih": "2024-03-15", "tutar": 850.0},\n    {"musteri": "Mehmet", "tarih": "2024-03-20", "tutar": 120.0},\n    {"musteri": "Ali", "tarih": "2024-03-22", "tutar": 400.0},\n    {"musteri": "Zeynep", "tarih": "2024-04-01", "tutar": 60.0},\n    {"musteri": "Ali", "tarih": "2024-04-18", "tutar": 120.0},\n    {"musteri": "Elif", "tarih": "2024-04-25", "tutar": 400.0},\n]\ndf = pd.DataFrame(KAYITLAR)\ndf["tarih"] = pd.to_datetime(df["tarih"])\n\ndef kohort_tablosu(df):\n    pass\n',
      sol: 'import pandas as pd\n\nKAYITLAR = [\n    {"musteri": "Ayşe", "tarih": "2024-01-05", "tutar": 120.0},\n    {"musteri": "Mehmet", "tarih": "2024-01-12", "tutar": 850.0},\n    {"musteri": "Ayşe", "tarih": "2024-02-03", "tutar": 60.0},\n    {"musteri": "Zeynep", "tarih": "2024-02-10", "tutar": 850.0},\n    {"musteri": "Ayşe", "tarih": "2024-03-15", "tutar": 850.0},\n    {"musteri": "Mehmet", "tarih": "2024-03-20", "tutar": 120.0},\n    {"musteri": "Ali", "tarih": "2024-03-22", "tutar": 400.0},\n    {"musteri": "Zeynep", "tarih": "2024-04-01", "tutar": 60.0},\n    {"musteri": "Ali", "tarih": "2024-04-18", "tutar": 120.0},\n    {"musteri": "Elif", "tarih": "2024-04-25", "tutar": 400.0},\n]\ndf = pd.DataFrame(KAYITLAR)\ndf["tarih"] = pd.to_datetime(df["tarih"])\n\ndef ay_index(seri):\n    return seri.dt.year * 12 + seri.dt.month\n\ndef kohort_tablosu(df):\n    df = df.copy()\n    ilk = df.groupby("musteri", observed=True)["tarih"].min()\n    df["ilk"] = df["musteri"].map(ilk)\n    df["kohort"] = df["ilk"].dt.to_period("M").astype(str)\n    df["ay_no"] = ay_index(df["tarih"]) - ay_index(df["ilk"])\n    tablo = (df.groupby(["kohort", "ay_no"], observed=True)["musteri"]\n               .nunique().unstack(fill_value=0))\n    return tablo\n',
      tests: 't = kohort_tablosu(df)\nassert list(t.index) == ["2024-01", "2024-02", "2024-03", "2024-04"], f"kohort satırları, gelen {list(t.index)}"\nassert [int(c) for c in t.columns] == [0, 1, 2], f"ay_no sütunları 0,1,2; gelen {list(t.columns)}"\nassert int(t.loc["2024-01", 0]) == 2 and int(t.loc["2024-01", 1]) == 1 and int(t.loc["2024-01", 2]) == 2, "Ocak kohortu: 2, 1, 2"\nassert int(t.loc["2024-02", 1]) == 0 and int(t.loc["2024-02", 2]) == 1, "Şubat kohortu: 1. ay 0, 2. ay 1"\nassert int(t.loc["2024-04", 0]) == 1 and int(t.loc["2024-04", 1]) == 0, "Nisan kohortu 1, sonra 0"\nassert "ilk" not in df.columns and "kohort" not in df.columns, "girdi değiştirilmemeli"\n',
      hints: ['İlk sipariş: groupby("musteri")["tarih"].min(); map ile her satıra yay.', 'Ay indeksi: dt.year*12 + dt.month; fark ay_no.', 'groupby(["kohort", "ay_no"])["musteri"].nunique().unstack(fill_value=0).'],
      why: 'Kohort analizi üç adım: ilk ay, görece ay, pivot. nunique aynı müşterinin aynı ayda iki siparişini bir kez sayar; fill_value=0 boş hücreleri doldurur. Yıl*12+ay tamsayısı Period aritmetiğine göre sürümden bağımsızdır.' },
    { t: 'code', id: 'proje-ileri-4',
      q: '<p>Parça 4: <code>en_cok_satan(df, sutun="urun", n=3)</code> yaz. <code>sutun</code>\'a göre gruplayıp <code>adet</code> (satır sayısı) ve <code>ciro</code> (tutar toplamı) sütunlarıyla, ciroya göre azalan (eşitlikte <code>sutun</code> değerine göre artan) sıralı ilk <code>n</code> satırı döndür; indeks 0\'dan başlasın ve sütunlar tam olarak <code>[sutun, "adet", "ciro"]</code> olsun.</p>',
      start: 'import pandas as pd\n\ndf = pd.DataFrame({\n    "urun": ["Kalem", "Kulaklık", "Defter", "Kulaklık", "Kulaklık", "Kalem", "Çanta", "Defter", "Kalem", "Çanta"],\n    "kategori": ["Kırtasiye", "Elektronik", "Kırtasiye", "Elektronik", "Elektronik", "Kırtasiye", "Aksesuar", "Kırtasiye", "Kırtasiye", "Aksesuar"],\n    "tutar": [120.0, 850.0, 60.0, 850.0, 850.0, 120.0, 400.0, 60.0, 120.0, 400.0],\n})\n\ndef en_cok_satan(df, sutun="urun", n=3):\n    pass\n',
      sol: 'import pandas as pd\n\ndf = pd.DataFrame({\n    "urun": ["Kalem", "Kulaklık", "Defter", "Kulaklık", "Kulaklık", "Kalem", "Çanta", "Defter", "Kalem", "Çanta"],\n    "kategori": ["Kırtasiye", "Elektronik", "Kırtasiye", "Elektronik", "Elektronik", "Kırtasiye", "Aksesuar", "Kırtasiye", "Kırtasiye", "Aksesuar"],\n    "tutar": [120.0, 850.0, 60.0, 850.0, 850.0, 120.0, 400.0, 60.0, 120.0, 400.0],\n})\n\ndef en_cok_satan(df, sutun="urun", n=3):\n    g = df.groupby(sutun, observed=True)["tutar"].agg(["count", "sum"]).reset_index()\n    g.columns = [sutun, "adet", "ciro"]\n    return (g.sort_values(["ciro", sutun], ascending=[False, True])\n             .head(n).reset_index(drop=True))\n',
      tests: 'r = en_cok_satan(df)\nassert list(r.columns) == ["urun", "adet", "ciro"], f"sütunlar, gelen {list(r.columns)}"\nassert list(r["urun"]) == ["Kulaklık", "Çanta", "Kalem"], f"sıra, gelen {list(r[\'urun\'])}"\nassert list(r["adet"]) == [3, 2, 3], "adetler"\nassert [float(x) for x in r["ciro"]] == [2550.0, 800.0, 360.0], "cirolar"\nassert list(r.index) == [0, 1, 2], "indeks 0..2"\nk = en_cok_satan(df, "kategori", 2)\nassert list(k["kategori"]) == ["Elektronik", "Aksesuar"], "kategori ilk 2"\nassert len(en_cok_satan(df, n=10)) == 4, "n büyükse tüm ürünler"\n',
      hints: ['groupby(sutun)["tutar"].agg(["count", "sum"]).reset_index() ve sütunları yeniden adlandır.', 'sort_values([ciro, sutun], ascending=[False, True]).head(n).reset_index(drop=True).'],
      why: 'agg ile iki özet tek seferde gelir. İkincil sıralama anahtarı eşit ciroda deterministik sıra sağlar; reset_index(drop=True) temiz 0..n-1 indeks verir.' },
    { t: 'code', id: 'proje-ileri-5',
      q: '<p>Parça 5: sahte API ve istemci. <code>api_sayfa(kayitlar, sayfa, boyut)</code> coroutine\'i <code>asyncio.sleep(0.01)</code> bekleyip <code>{"veri": [...], "son": bool}</code> döndürsün (<code>son</code>: bu sayfadan sonra kayıt kalmadı mı). <code>hepsini_cek(kayitlar, boyut)</code> sayfaları 0\'dan başlayarak <code>son</code> gelene kadar sırayla çekip <code>(tum_kayitlar, sayfa_sayisi)</code> döndürsün. Boş liste için 1 sayfa (boş) çekilmiş sayılır.</p>',
      start: 'import asyncio\n\nasync def api_sayfa(kayitlar, sayfa, boyut):\n    pass\n\nasync def hepsini_cek(kayitlar, boyut):\n    pass\n',
      sol: 'import asyncio\n\nasync def api_sayfa(kayitlar, sayfa, boyut):\n    await asyncio.sleep(0.01)\n    bas = sayfa * boyut\n    return {"veri": kayitlar[bas:bas + boyut], "son": bas + boyut >= len(kayitlar)}\n\nasync def hepsini_cek(kayitlar, boyut):\n    hepsi, sayfa = [], 0\n    while True:\n        yanit = await api_sayfa(kayitlar, sayfa, boyut)\n        hepsi.extend(yanit["veri"])\n        if yanit["son"]:\n            break\n        sayfa += 1\n    return hepsi, sayfa + 1\n',
      tests: 'import asyncio, inspect\nassert inspect.iscoroutinefunction(api_sayfa) and inspect.iscoroutinefunction(hepsini_cek), "ikisi de async def olmalı"\nloop = asyncio.new_event_loop()\nkayit = [{"id": i} for i in range(10)]\ny = loop.run_until_complete(api_sayfa(kayit, 2, 4))\nassert y["veri"] == [{"id": 8}, {"id": 9}] and y["son"] is True, "2. sayfa (boyut 4) son 2 kayıt ve son=True"\ny0 = loop.run_until_complete(api_sayfa(kayit, 0, 4))\nassert len(y0["veri"]) == 4 and y0["son"] is False, "0. sayfa 4 kayıt, son değil"\nhepsi, n = loop.run_until_complete(hepsini_cek(kayit, 4))\nassert hepsi == kayit and n == 3, "10 kayıt, boyut 4 -> 3 sayfa"\nhepsi2, n2 = loop.run_until_complete(hepsini_cek(kayit, 5))\nassert hepsi2 == kayit and n2 == 2, "boyut 5 -> tam 2 sayfa"\nbos, nb = loop.run_until_complete(hepsini_cek([], 4))\nassert bos == [] and nb == 1, "boş veri: 1 boş sayfa"\nloop.close()\n',
      hints: ['Dilim: kayitlar[sayfa*boyut : sayfa*boyut + boyut]; son = bas + boyut >= len.', 'İstemcide while True: await, extend, son ise break, sayfa += 1.'],
      why: 'Sayfalı API kalıbı: sunucu "daha var mı" bilgisini döndürür, istemci ona göre durur. Sıralı await burada doğru çünkü bir sonraki istek öncekinin cevabına bağlı; tam boyutta biten veri için son bayrağı >= ile doğru hesaplanır.' },
    { t: 'code', id: 'proje-ileri-6',
      q: '<p>Parça 6: CLI. <code>parse_args(argv)</code> fonksiyonu argparse ile şu arayüzü kursun: zorunlu konumsal <code>komut</code> (<code>rfm</code>, <code>kohort</code>, <code>top</code> seçenekleri), <code>--bugun</code> (varsayılan <code>"2024-05-01"</code>), <code>--q</code> (int, 4), <code>--n</code> (int, 3), <code>--sutun</code> (<code>urun</code>/<code>kategori</code>, varsayılan <code>urun</code>). Ardından <code>main(argv)</code>: komuta göre <code>"rfm q=4 bugun=2024-05-01"</code>, <code>"kohort"</code> ya da <code>"top sutun=urun n=3"</code> biçiminde metin döndürsün (gerçek hesap yerine özet metin; iş mantığı diğer parçalarda).</p>',
      start: 'import argparse\n\ndef parse_args(argv):\n    pass\n\ndef main(argv):\n    pass\n',
      sol: 'import argparse\n\ndef parse_args(argv):\n    p = argparse.ArgumentParser(prog="analitik")\n    p.add_argument("komut", choices=["rfm", "kohort", "top"])\n    p.add_argument("--bugun", default="2024-05-01")\n    p.add_argument("--q", type=int, default=4)\n    p.add_argument("--n", type=int, default=3)\n    p.add_argument("--sutun", choices=["urun", "kategori"], default="urun")\n    return p.parse_args(argv)\n\ndef main(argv):\n    a = parse_args(argv)\n    if a.komut == "rfm":\n        return f"rfm q={a.q} bugun={a.bugun}"\n    if a.komut == "kohort":\n        return "kohort"\n    return f"top sutun={a.sutun} n={a.n}"\n',
      tests: 'a = parse_args(["rfm"])\nassert a.komut == "rfm" and a.q == 4 and a.bugun == "2024-05-01" and a.n == 3 and a.sutun == "urun", "varsayılanlar"\nb = parse_args(["top", "--sutun", "kategori", "--n", "2"])\nassert b.sutun == "kategori" and b.n == 2 and isinstance(b.n, int), "--n int olmalı"\nassert main(["rfm", "--q", "3", "--bugun", "2024-06-01"]) == "rfm q=3 bugun=2024-06-01", "rfm çıktısı"\nassert main(["kohort"]) == "kohort", "kohort çıktısı"\nassert main(["top"]) == "top sutun=urun n=3", "top çıktısı"\nimport contextlib, io\nfor kotu in (["sil"], ["top", "--sutun", "fiyat"], ["rfm", "--q", "abc"]):\n    try:\n        with contextlib.redirect_stderr(io.StringIO()):\n            parse_args(kotu)\n        raise AssertionError(f"{kotu} geçersiz olmalı (SystemExit)")\n    except SystemExit:\n        pass\n',
      hints: ['add_argument("komut", choices=[...]) konumsal; --q için type=int, default=4.', 'parse_args(argv) listeyi doğrudan alır; sys.argv kullanma.', 'main içinde a.komut\'a göre f-string döndür.'],
      why: 'argparse choices ve type doğrulamayı sana bırakmaz; geçersiz değerde hata mesajı basıp SystemExit fırlatır. parse_args(liste) tasarımı CLI\'yı test edilebilir kılar; main sonucu print etmek yerine döndürünce testler çıktıyı yakalamakla uğraşmaz.' },
    { t: 'mc', q: '<code>pd.qcut</code> çağrısından önce <code>rank(method="first")</code> uygulamanın amacı nedir?',
      o: ['Değerleri büyükten küçüğe sıralayıp en büyüğe 1 vermek', 'Eşit değerleri ayırıp kutu sınırı çakışmasını önlemek', 'NaN değerleri sütun ortalamasıyla doldurmak', 'Skorları 0-1 aralığına ölçeklemek'], a: 1,
      why: 'qcut quantile sınırlarını değerlerden hesaplar; çok sayıda eşit değer olunca sınırlar çakışır ve ValueError verir. rank(method="first") her satıra benzersiz sıra vererek sınırları ayırır.' },
    { t: 'mc', q: 'Kohort tablosunda 0. sütun (ay_no = 0) neyi gösterir?',
      o: ['Kohortun ilk ayındaki toplam cirosu', 'Kohort büyüklüğü (ilk aydaki müşteri sayısı)', 'İlk aydan sonra kaybedilen müşteri sayısı', 'Kohortun ortalama sipariş tutarı'], a: 1,
      why: 'ay_no = 0, her müşterinin ilk sipariş ayıdır; o hücre kohorttaki herkesi içerir. Sonraki sütunlar bu sayıya bölünerek tutundurma oranı elde edilir.' }
  ],
  faq: [
    { q: 'RFM için kaç kutu (q) kullanmalıyım?', a: 'Yaygın tercih 4 ya da 5. Müşteri sayısı az ise (yüzlerin altında) 3 yeterli; fazla kutu küçük gruplarda anlamsız ayrımlar üretir. Kutu sayısını yapılandırmadan okunur yap, sabit kodlama.' },
    { q: 'pandas 2.2 ile 3.x arasında bu projeyi etkileyen fark var mı?', a: 'Kullandığımız API\'de yok: groupby(observed=True), qcut, unstack, sort_values iki sürümde de aynı. 3.x\'te metin sütunları varsayılan olarak str türünde gelir ve Copy-on-Write açıktır; bu yüzden inplace ve zincirleme atama kullanmıyoruz.' },
    { q: 'Sayfaları paralel çekmek daha hızlı olmaz mıydı?', a: 'Toplam sayfa sayısı önceden biliniyorsa (API toplam kayıt sayısını döndürüyorsa) gather ile paralel çekmek çok daha hızlıdır; aynı anda istek sayısını Semaphore ile sınırla. "Son sayfa" bayrağına bağlı API\'de sıralı çekmek zorunludur ya da iki aşamalı strateji (önce ilk sayfa, sonra kalanlar paralel) kurulur.' },
    { q: 'Testleri nasıl çalıştırırım, hangi dosya yapısı?', a: 'Paket kökünde tests/ klasörü, her modül için test_*.py; python -m unittest discover ya da pytest. CI\'da (önceki ders) pandas 2.2 ve 3.x için iki matris girişi tanımla.' }
  ],
  mistakes: [
    { bad: 'df["ay"] = df["tarih"].dt.to_period("M")\ndf[df["ay"] == "2024-01"]', good: 'df["ay"] = df["tarih"].dt.to_period("M").astype(str)\ndf[df["ay"] == "2024-01"]', why: 'Period ile metin karşılaştırması sürüme göre farklı davranır; astype(str) ile karşılaştırma ve test her yerde aynı sonucu verir.' },
    { bad: 'pd.qcut(rfm["frequency"], 4, labels=[1, 2, 3, 4])', good: 'pd.qcut(rfm["frequency"].rank(method="first"), 4, labels=[1, 2, 3, 4])', why: 'Çok sayıda eşit frequency değeri kutu sınırlarını çakıştırır ve ValueError üretir; rank ile benzersiz sıra verilir.' },
    { bad: 'rfm.sort_values("skor", inplace=True)\nreturn rfm', good: 'return rfm.sort_values("skor")', why: 'inplace girdiyi değiştirir, test ve çağıran kodu şaşırtır; pandas 3.x Copy-on-Write ile de kafa karıştırıcıdır. Yeni DataFrame döndür.' },
    { bad: 'def main():\n    args = parser.parse_args()\n    ...', good: 'def main(argv=None):\n    args = parser.parse_args(argv)\n    ...', why: 'sys.argv\'ye bağlı main test edilemez; argv parametresi testte liste vermeye, üretimde None ile gerçek argümanları okumaya izin verir.' }
  ]
}
);
})(window);
