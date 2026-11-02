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
<p>Anadolu Bank\'ın bir servisi, bir kredi başvurusu için üç dış sisteme soruyor: kimlik doğrulama, kredi skoru, kara liste. Her biri yaklaşık yarım saniye. Sırayla sorarsan 1,5 saniye; aynı anda sorup üçünü de beklersen yarım saniye. İşlemci bu süre boyunca zaten boştur, yalnızca ağ cevabını bekler. <b>asyncio</b> bu "beklerken başka işe geç" düşüncesini tek iş parçacığında (thread) gerçekleştirir. Kural: asyncio <b>I/O beklemesi</b> için iyidir; ağır hesap için değil (onun için bir sonraki ders).</p>

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
<div class="tip"><b>Hata yönetimi</b><code>gather(..., return_exceptions=True)</code> bir iş hata verirse diğerlerini iptal etmez; sonuç listesinde o konuma istisna nesnesini koyar. Toplu sorgulamada "biri patladı diye hepsi çökmesin" istiyorsan bunu kullan.</div>

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
        tests: 'import asyncio, time\nloop = asyncio.new_event_loop()\nt0 = time.perf_counter()\nr = loop.run_until_complete(toplu_skor(["Ayşe", "Mehmet", "Ali"], 0.2))\nsure = time.perf_counter() - t0\nloop.close()\nassert r == {"Ayşe": 640, "Mehmet": 660, "Ali": 630}, "Skor sözlüğü yanlış"\nassert sure < 0.5, f"Sorgular eşzamanlı olmalı (gather); süre {sure:.2f} s"\n',
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
