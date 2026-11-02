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
<p>Anadolu Bank\'ın şubelerden toplanan kredi başvuru dosyasında şehir adı bir satırda "ankara", diğerinde " ANKARA " yazar; tutar sütunu "12.500,00 TL" gibi metindir; bazı gelirler boştur; aynı başvuru iki kez girilmiştir. Analizin yüzde yetmişi bu temizliktir. Bu derste pandas\'ın temizlik araçlarını bir akış olarak öğreneceksin: <b>eksikleri gör → türleri düzelt → metni standartlaştır → yinelenenleri at → aykırıları işaretle</b>.</p>

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
        sol: 'import pandas as pd\n\ndef eksikleri_doldur(df):\n    y = df.dropna(subset=["skor"]).copy()\n    y["gelir"] = y["gelir"].fillna(y["gelir"].median())\n    y["sehir"] = y["sehir"].fillna("Bilinmiyor")\n    return y.reset_index(drop=True)\n',
        tests: 'import pandas as pd\ndf = pd.DataFrame({\n    "musteri": ["Ayşe", "Mehmet", "Zeynep", "Ali", "Can"],\n    "sehir": ["Ankara", None, "İzmir", "Bursa", None],\n    "gelir": [25000.0, 18000.0, None, 42000.0, None],\n    "skor": [710.0, None, 655.0, 780.0, 700.0],\n})\nr = eksikleri_doldur(df)\nassert len(r) == 4, "skor eksik olan Mehmet atılmalı, 4 satır kalmalı"\nassert "Mehmet" not in r["musteri"].tolist(), "Mehmet satırı atılmalı"\nassert r["sehir"].tolist() == ["Ankara", "İzmir", "Bursa", "Bilinmiyor"], "sehir eksikleri Bilinmiyor"\nassert r["gelir"].tolist() == [25000.0, 25000.0, 42000.0, 25000.0], "gelir medyanı (25000) ile doldurulmalı"\nassert list(r.index) == [0, 1, 2, 3], "Index sıfırlanmalı"\nassert int(df.isna().sum().sum()) == 6, "Orijinal df değişmemeli"\n',
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
