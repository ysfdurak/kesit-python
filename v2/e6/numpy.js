/* PythonPatika — 'numpy' dersi uzantısı (Derinleş) */
// needs: numpy
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'numpy',
    min: 25,
    needs: ['numpy'],
    html: `<h2>Derinleş: kurulum, numpy 2 ve eksik kalan araçlar</h2><p>Temel kavramlar (ndarray, vektörleştirme, broadcasting, maske, axis) hazır. Bu bölümde iş hayatında her gün karşına çıkan ama giriş derslerinde atlanan parçaları tamamlıyoruz: kurulum ve sürüm sorunları, dizi kurma ve birleştirme araçları, sıralama ve tekilleştirme, çok koşullu dönüşüm, birikimli hesaplar ve eksik değerli istatistik.</p><h3>Kurulum ve sürüm kontrolü</h3><p>Tarayıcıdaki motorda numpy hazırdır. Kendi bilgisayarında sanal ortamı (virtual environment) etkinleştirip pip ile kurarsın. <code>pip</code> yerine <code>python -m pip</code> yazmak, paketin doğru Python yorumlayıcısına kurulmasını garanti eder.</p><pre class="code"># Windows (PowerShell)
py -m venv .venv
.venv\\Scripts\\Activate.ps1
python -m pip install --upgrade pip
python -m pip install numpy

# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate
python -m pip install numpy

# Sürümü sabitlemek (requirements.txt)
numpy&gt;=2.0,&lt;3
</pre><p>Kurulumdan sonra ilk iş sürümü ve hangi yorumlayıcının kullanıldığını kontrol etmektir:</p><pre class="py">import sys
import numpy as np

print("Python:", sys.version_info[:2])
print("numpy :", np.__version__)
ana = int(np.__version__.split(".")[0])
print("numpy 2 serisi mi?", ana &gt;= 2)
</pre><div class="tbl-wrap"><table><tr><th>Belirti</th><th>Neden</th><th>Çözüm</th></tr><tr><td><code>ModuleNotFoundError: No module named 'numpy'</code></td><td>Paket başka bir Python'a kurulmuş ya da sanal ortam etkin değil</td><td>Ortamı etkinleştir, <code>python -m pip install numpy</code></td></tr><tr><td><code>A module that was compiled using NumPy 1.x cannot be run in NumPy 2.x</code></td><td>Eski derlenmiş bir paket (ör. eski pandas, scipy) numpy 2 ile uyumsuz</td><td>O paketi güncelle (<code>pip install -U pandas</code>) ya da geçici olarak <code>numpy&lt;2</code> sabitle</td></tr><tr><td><code>AttributeError: module 'numpy' has no attribute 'float'</code></td><td><code>np.float</code>, <code>np.int</code>, <code>np.object</code> takma adları kaldırıldı</td><td>Python'un <code>float</code>/<code>int</code>'ini ya da <code>np.float64</code>/<code>np.int64</code> kullan</td></tr><tr><td><code>UFuncTypeError: Cannot cast ufunc 'multiply' output</code></td><td>Tam sayı diziye yerinde (<code>*=</code>) ondalık sonuç yazılıyor</td><td>Diziyi baştan <code>dtype=float</code> kur ya da <code>d = d * 1.2</code> yaz</td></tr></table></div><h3>Dizi kurma ve şekil değiştirme</h3><p><code>np.zeros</code>, <code>np.ones</code>, <code>np.full</code> sabit dizi; <code>np.eye</code> birim matris kurar. <code>arange(baş, bit, adım)</code> adımı, <code>linspace(baş, bit, adet)</code> eleman sayısını sabitler; ondalık adımda <code>arange</code> yuvarlama yüzünden bir eleman fazla ya da eksik üretebilir, bu yüzden ondalık aralıklarda <code>linspace</code> güvenlidir. <code>reshape(-1, 7)</code> içindeki <code>-1</code> "bu boyutu sen hesapla" demektir; <code>ravel()</code> diziyi tek boyuta indirir, <code>.T</code> devrik (transpose) verir.</p><pre class="py">import numpy as np

saatlik = np.arange(1, 15)            # 14 günlük satış (örnek)
hafta = saatlik.reshape(-1, 7)        # 2 hafta x 7 gün
print(hafta.shape)
print(hafta.T.shape)                  # 7 x 2
print(np.full(3, 99.9), np.eye(2).tolist())

# Birleştirme
h1 = np.array([10, 12, 9])
h2 = np.array([11, 14, 8])
print(np.concatenate([h1, h2]))       # uç uca: (6,)
print(np.vstack([h1, h2]).shape)      # alt alta: (2, 3)
print(np.column_stack([h1, h2]).shape)  # yan yana: (3, 2)
</pre><h3>Sıralama, sıra indeksi ve tekilleştirme</h3><p><code>np.sort</code> sıralı kopya verir; <code>argsort</code> ise "sıralamak için hangi indeksleri hangi sırayla almalıyım?" sorusunu yanıtlar. Bu sayede bir diziye göre başka bir diziyi (ürün adlarını adetlere göre) sıralayabilirsin. <code>np.unique(..., return_counts=True)</code> tekil değerleri ve kaç kez geçtiklerini birlikte döndürür; küçük bir <code>value_counts</code> gibidir.</p><pre class="py">import numpy as np

urunler = np.array(["kahve", "çay", "şeker", "un"])
adet = np.array([120, 340, 15, 80])

sira = np.argsort(adet)[::-1]          # büyükten küçüğe indeksler
print(sira, urunler[sira][:2])         # en çok satan iki ürün

sehirler = np.array(["Ankara", "İzmir", "Ankara", "Bursa", "Ankara"])
deger, sayi = np.unique(sehirler, return_counts=True)
print(dict(zip(deger.tolist(), sayi.tolist())))
print(np.isin(sehirler, ["İzmir", "Bursa"]))
</pre><h3>Çok koşullu dönüşüm: np.select ve np.clip</h3><p><code>np.where</code> iki dallı bir if gibidir. Üç ve daha fazla dal için <code>np.select(kosullar, secenekler, default=...)</code> kullanılır; koşullar sırayla denenir ve ilk doğru olan kazanır, tıpkı if/elif zinciri gibi. <code>np.clip(d, alt, üst)</code> değerleri bir aralığa kırpar (ör. indirim oranı %0 ile %50 arasında kalsın).</p><pre class="py">import numpy as np

tutar = np.array([250.0, 640.0, 1200.0, 90.0])
kosullar = [tutar &gt;= 1000, tutar &gt;= 500]
oranlar = [0.15, 0.10]
indirim = np.select(kosullar, oranlar, default=0.0)
print(indirim)
print(np.round(tutar * (1 - indirim), 2))
print(np.clip(np.array([-3, 20, 75]), 0, 50))
</pre><h3>Birikimli hesaplar ve eksik değerli istatistik</h3><p><code>cumsum</code> yürüyen toplam (kümülatif ciro), <code>diff</code> ardışık fark (günlük değişim) verir. <code>np.percentile</code> ve <code>np.median</code> aykırı değere dayanıklı özetlerdir. Dizide <code>np.nan</code> varsa <code>mean</code> sonucu da <code>nan</code> olur; <code>np.nanmean</code>, <code>np.nansum</code>, <code>np.nanmax</code> eksikleri yok sayar.</p><pre class="py">import numpy as np

gunluk = np.array([120.0, 135.0, np.nan, 110.0, 180.0])
print(np.cumsum(np.nan_to_num(gunluk)))     # nan yerine 0
print(np.diff([120, 135, 150, 110]))        # günlük değişim
print(gunluk.mean(), np.nanmean(gunluk))    # nan vs 136.25
print(np.isnan(gunluk).sum(), "eksik gün")
print(np.percentile([10, 20, 30, 40, 1000], 50))

# Matris çarpımı: adet (2 şube x 3 ürün) @ fiyat (3,)
adet = np.array([[2, 1, 0], [5, 0, 3]])
fiyat = np.array([45.5, 899.0, 12.75])
print(adet @ fiyat)                         # şube başına ciro
</pre><div class="tip"><b>Kayan nokta karşılaştırması</b><code>0.1 + 0.2 == 0.3</code> numpy'da da False verir. Testlerde ve kontrol kodunda <code>np.isclose(a, b)</code> (eleman eleman) ya da <code>np.allclose(a, b)</code> (tek bool) kullan.</div><div class="warn"><b>Yerinde işlem ve tür</b><code>d *= 1.2</code> yerinde çalışır ve dizinin türünü değiştiremez: tam sayı dizide hata verir; tek tek <code>d[i] = d[i] * 1.2</code> atamak ise <b>sessizce</b> küsuratı keser. Para hesaplarında diziyi baştan <code>float</code> kur.</div><div class="note"><b>Gerçek işte</b>Analist ekiplerinde numpy çoğunlukla üç yerde görünür: pandas sütunlarına <code>np.select</code> ile kademeli kural uygulamak (prim, indirim, risk sınıfı), <code>np.percentile</code> ile eşik belirlemek ve simülasyon için <code>default_rng</code> ile tekrarlanabilir veri üretmek. Projede numpy sürümünü <code>requirements.txt</code> içinde aralıkla sabitlemek, "benim bilgisayarımda çalışıyordu" sorunlarının çoğunu önler.</div>`,
    ex: [
      { t: 'mc',
        stage: 'Isınma',
        needs: ['numpy'],
        q: 'Kendi bilgisayarında eski bir betik <code>np.zeros(3, dtype=np.float)</code> satırında <code>AttributeError</code> veriyor. En doğru düzeltme hangisi?',
        o: ['numpy\'ı 1.20 sürümüne düşürüp sabitlemek', '<code>dtype=float</code> ya da <code>np.float64</code> yazmak', 'Başa <code>import numpy.float</code> satırı eklemek', '<code>np.zeros</code> yerine Python listesi kullanmak'],
        a: 1,
        why: 'np.float, np.int gibi takma adlar yalnızca Python\'un yerleşik türlerine işaret ediyordu ve kaldırıldı. Yerleşik float ya da açık np.float64 aynı işi görür; sürümü düşürmek sorunu ertelemekten başka bir şey değildir.' },
      { t: 'predict',
        stage: 'Kodu oku',
        needs: ['numpy'],
        q: 'Bu kod ne yazdırır?',
        code: 'import numpy as np\nsehir = np.array(["Bursa", "Ankara", "Bursa", "İzmir", "Bursa"])\nd, s = np.unique(sehir, return_counts=True)\nprint(d.tolist(), s.tolist())\n',
        o: ['[\'Bursa\', \'Ankara\', \'İzmir\'] [3, 1, 1]', '[\'Ankara\', \'Bursa\', \'İzmir\'] [1, 3, 1]', '[\'Ankara\', \'Bursa\', \'İzmir\'] [3, 1, 1]', '[\'Bursa\', \'Ankara\', \'Bursa\', \'İzmir\', \'Bursa\'] [3, 1, 3, 1, 3]'],
        a: 1,
        why: 'np.unique sonucu her zaman sıralıdır (görülme sırası değil). Sayılar da bu sıralı değerlere karşılık gelir: Ankara 1, Bursa 3, İzmir 1.' },
      { t: 'predict',
        stage: 'Kodu oku',
        needs: ['numpy'],
        q: 'Bu kod ne yazdırır?',
        code: 'import numpy as np\nadet = np.array([40, 10, 30])\nprint(np.argsort(adet).tolist())\nprint(np.sort(adet).tolist())\n',
        o: ['[1, 2, 0]\n[10, 30, 40]', '[2, 0, 1]\n[10, 30, 40]', '[1, 2, 0]\n[40, 10, 30]', '[0, 1, 2]\n[10, 30, 40]'],
        a: 0,
        why: 'argsort sıralı diziyi değil, sıralamak için alınacak indeksleri verir: en küçük 10 indeks 1\'de, sonra 30 indeks 2\'de, sonra 40 indeks 0\'da. np.sort ise değerlerin sıralı kopyasını döndürür.' },
      { t: 'predict',
        stage: 'Kodu oku',
        needs: ['numpy'],
        q: 'Tam sayı dizide yerinde çarpma yapılıyor. Ne olur?',
        code: 'import numpy as np\nfiyat = np.array([10, 20, 30])\nfiyat *= 1.2\nprint(fiyat)\n',
        o: ['[12. 24. 36.]', '[12 24 36]', 'UFuncTypeError hatası verir', '[10 20 30]'],
        a: 2,
        raises: true,
        why: 'Yerinde işlem (*=) sonucu mevcut int64 dizinin içine yazmaya çalışır; float sonucu int\'e güvenli biçimde çeviremeyeceği için numpy UFuncTypeError (bir TypeError alt sınıfı) fırlatır. fiyat = fiyat * 1.2 yazarsan yeni bir float dizi oluşur.' },
      { t: 'order',
        stage: 'Kodu oku',
        needs: ['numpy'],
        q: '<p>İki haftalık günlük satışı alt alta birleştirip her haftanın kümülatif toplamının son değerini (haftalık toplam) yazdıran programın satırlarını sırala.</p>',
        lines: ['import numpy as np', 'h1 = np.array([10, 20, 30])', 'h2 = np.array([5, 5, 5])', 'tablo = np.vstack([h1, h2])', 'kumulatif = np.cumsum(tablo, axis=1)', 'print(kumulatif[:, -1].tolist())'],
        expect: '[60, 15]\n',
        hint: 'Önce diziler, sonra birleştirme, sonra satır boyunca cumsum.',
        why: 'vstack (2, 3) bir tablo kurar; cumsum(axis=1) her satırda soldan sağa yürür, son sütun haftanın toplamıdır.' },
      { t: 'code',
        id: 'numpy-x1',
        stage: 'Rehberli',
        diff: 2,
        needs: ['numpy'],
        q: '<p>Anadolu Market kademeli indirim uyguluyor: tutar 1000 ve üstü ise %15, 500 ve üstü ise %10, aksi halde %0. <code>indirimli(tutarlar)</code> fonksiyonu <code>np.select</code> ile indirimi uygulayıp 2 basamağa yuvarlanmış <b>numpy dizisi</b> döndürsün.</p>',
        guide: ['Girdiyi float numpy dizisine çevir.', 'Koşul listesini büyükten küçüğe yaz: önce >= 1000, sonra >= 500.', 'Oran listesini aynı sırada kur ve np.select\'e default=0.0 ver.', 'tutar * (1 - oran) hesapla ve np.round ile 2 basamağa yuvarla.'],
        example: 'import numpy as np\nnot_ = np.array([45, 72, 90])\nharf = np.select([not_ >= 85, not_ >= 70], ["A", "B"], default="C")\nprint(harf)\n',
        start: 'import numpy as np\n\ndef indirimli(tutarlar):\n    t = np.asarray(tutarlar, dtype=float)\n    # TODO: kosullar = [...]\n    # TODO: oranlar = [...]\n    # TODO: oran = np.select(..., default=0.0)\n    return t\n',
        sol: 'import numpy as np\n\ndef indirimli(tutarlar):\n    t = np.asarray(tutarlar, dtype=float)\n    kosullar = [t >= 1000, t >= 500]\n    oranlar = [0.15, 0.10]\n    oran = np.select(kosullar, oranlar, default=0.0)\n    return np.round(t * (1 - oran), 2)\n',
        tests: 'import numpy as np\nr = indirimli([250, 640, 1200, 500, 1000])\nassert isinstance(r, np.ndarray), "numpy dizisi döndürmelisin"\nassert np.allclose(r, [250.0, 576.0, 1020.0, 450.0, 850.0]), f"Beklenen [250, 576, 1020, 450, 850], gelen {r.tolist()}: sınırlar (500 ve 1000) dahil olmalı"\nassert indirimli([]).shape == (0,), "Boş girdi boş dizi vermeli"\n',
        hints: ['Çok dallı koşul için np.select(kosullar, secenekler, default=...) kullanılır.', 'Koşulların sırası önemli: t >= 1000 önce gelmezse 1200 TL %10 alır.', 'oran = np.select([t >= 1000, t >= 500], [0.15, 0.10], default=0.0)'],
        why: 'np.select if/elif zincirinin vektörleştirilmiş halidir: ilk doğru koşulun seçeneği alınır. Sınır değerlerin (500, 1000) dahil olması >= ile sağlanır.' },
      { t: 'code',
        id: 'numpy-x2',
        stage: 'Rehberli',
        diff: 2,
        needs: ['numpy'],
        q: '<p>Bir mağazanın aylık hedefi var. <code>hedef_gunu(gunluk, hedef)</code> fonksiyonu günlük satış listesinin kümülatif toplamının hedefe <b>ilk ulaştığı</b> günün indeksini (0 tabanlı, int) döndürsün; hedefe hiç ulaşılmazsa <code>-1</code> döndürsün. Python döngüsü kullanma.</p>',
        guide: ['np.cumsum ile yürüyen toplamı hesapla.', 'Yürüyen toplam >= hedef maskesini kur.', 'Maske içinde hiç True yoksa -1 döndür (maske.any()).', 'İlk True\'nun indeksini np.argmax(maske) verir; int\'e çevir.'],
        example: 'import numpy as np\nsicaklik = np.array([12, 15, 21, 25, 19])\nmaske = sicaklik > 20\nprint(maske.any(), int(np.argmax(maske)))   # ilk 20 üstü gün: 2\n',
        start: 'import numpy as np\n\ndef hedef_gunu(gunluk, hedef):\n    toplam = np.cumsum(gunluk)\n    # TODO: maske kur\n    # TODO: hiç ulaşılmadıysa -1\n    # TODO: ilk True indeksini döndür\n    return None\n',
        sol: 'import numpy as np\n\ndef hedef_gunu(gunluk, hedef):\n    toplam = np.cumsum(gunluk)\n    maske = toplam >= hedef\n    if not maske.any():\n        return -1\n    return int(np.argmax(maske))\n',
        tests: 'assert hedef_gunu([100, 200, 300, 400], 600) == 2, "100+200+300=600: hedefe 2. indekste ulaşılır (>= dahil)"\nassert hedef_gunu([100, 200], 1000) == -1, "Hedefe ulaşılmazsa -1"\nassert hedef_gunu([700, 10], 500) == 0, "İlk gün yeterliyse 0"\nassert isinstance(hedef_gunu([1, 2], 1), int), "Sonuç int olmalı"\nassert "for " not in __source__, "Döngü yerine cumsum ve argmax kullan"\n',
        hints: ['Yürüyen toplam için np.cumsum.', 'np.argmax bir bool dizide ilk True\'nun konumunu verir; ama hiç True yoksa 0 döner, bu yüzden önce any() kontrolü gerekir.', 'if not maske.any(): return -1'],
        why: 'cumsum + karşılaştırma + argmax üçlüsü "ilk kez eşiği geçtiği an" sorularının vektörleştirilmiş kalıbıdır. argmax\'ın hiç True yokken 0 döndürmesi klasik bir tuzaktır.' },
      { t: 'code',
        id: 'numpy-x3',
        stage: 'Rehberli',
        diff: 2,
        needs: ['numpy'],
        q: '<p>Satır = şube, sütun = gün olan matriste bazı günler <code>np.nan</code> (veri gelmemiş). <code>eksikli_ozet(matris)</code> şu sözlüğü döndürsün: <code>"ortalama"</code> → her şubenin eksikler hariç günlük ortalaması (2 basamak, liste), <code>"eksik"</code> → her şubedeki eksik gün sayısı (int listesi).</p>',
        guide: ['Matrisi float numpy dizisine çevir.', 'np.nanmean(..., axis=1) ile satır ortalaması al, np.round ile yuvarla.', 'np.isnan(m) bool matris verir; axis=1 boyunca topla.', 'İkisini .tolist() ile listeye çevirip sözlüğe koy.'],
        example: 'import numpy as np\nd = np.array([[1.0, np.nan], [np.nan, np.nan]])\nprint(np.nansum(d, axis=0), np.isnan(d).sum(axis=0))\n',
        start: 'import numpy as np\n\ndef eksikli_ozet(matris):\n    m = np.asarray(matris, dtype=float)\n    # TODO: ortalama = ...\n    # TODO: eksik = ...\n    return {"ortalama": [], "eksik": []}\n',
        sol: 'import numpy as np\n\ndef eksikli_ozet(matris):\n    m = np.asarray(matris, dtype=float)\n    ortalama = np.round(np.nanmean(m, axis=1), 2)\n    eksik = np.isnan(m).sum(axis=1)\n    return {"ortalama": ortalama.tolist(), "eksik": [int(x) for x in eksik]}\n',
        tests: 'import numpy as np\nnan = np.nan\nr = eksikli_ozet([[100, nan, 200], [50, 60, 70], [nan, nan, 30]])\nassert r["ortalama"] == [150.0, 60.0, 30.0], f"nan hariç ortalama [150, 60, 30] olmalı, gelen {r[\'ortalama\']}"\nassert r["eksik"] == [1, 0, 2], "Eksik sayıları [1, 0, 2] olmalı"\nassert all(type(x) is int for x in r["eksik"]), "eksik değerleri int olmalı"\n',
        hints: ['nan içeren dizide mean nan döner; nan-güvenli sürümü np.nanmean.', 'np.isnan(m).sum(axis=1) her satırdaki True sayısını verir.', 'int listesine çevirmek için [int(x) for x in eksik] ya da .tolist().'],
        why: 'nan-fonksiyonları eksik değeri yok sayar; isnan maskesinin toplamı eksik sayısıdır. Raporlarda ortalamanın yanında eksik sayısını da vermek, ortalamanın kaç güne dayandığını gösterir.' },
      { t: 'code',
        id: 'numpy-x4',
        stage: 'Kendin yaz',
        diff: 2,
        needs: ['numpy'],
        q: '<p><code>en_cok_satan(urunler, adetler, n)</code> fonksiyonu adetlere göre en çok satan <code>n</code> ürünün adını büyükten küçüğe liste olarak döndürsün. <code>np.argsort</code> kullan; <code>n</code> ürün sayısından büyükse tüm ürünleri döndür.</p>',
        start: 'import numpy as np\n\ndef en_cok_satan(urunler, adetler, n):\n    pass\n',
        sol: 'import numpy as np\n\ndef en_cok_satan(urunler, adetler, n):\n    u = np.asarray(urunler)\n    a = np.asarray(adetler)\n    sira = np.argsort(a)[::-1][:n]\n    return u[sira].tolist()\n',
        tests: 'r = en_cok_satan(["kahve", "çay", "şeker", "un"], [120, 340, 15, 80], 2)\nassert r == ["çay", "kahve"], f"En çok satan iki ürün [\'çay\', \'kahve\'] olmalı, gelen {r}"\nassert en_cok_satan(["a", "b"], [1, 2], 5) == ["b", "a"], "n fazla büyükse tüm ürünler sıralı dönmeli"\nassert isinstance(r, list), "liste döndür"\n',
        hints: ['argsort küçükten büyüğe indeks verir; [::-1] ile ters çevir.', 'İndeks dizisiyle ürün dizisini seç: u[sira]; dilimleme n büyük olsa da hata vermez.'],
        why: 'argsort bir diziye göre başka bir diziyi sıralamanın yoludur; dilimleme taşmada hata vermediği için kenar durum kendiliğinden çözülür.' },
      { t: 'code',
        id: 'numpy-x5',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        needs: ['numpy'],
        q: '<p><b>Hatayı bul ve düzelt.</b> <code>merkezle(dizi)</code> her elemandan dizinin ortalamasını çıkarmalı ve <b>yeni</b> bir dizi döndürmeli. Ama çağırdıktan sonra kullanıcının orijinal dizisi de değişiyor.</p>',
        start: 'import numpy as np\n\ndef merkezle(dizi):\n    d = dizi[:]\n    d -= d.mean()\n    return d\n',
        sol: 'import numpy as np\n\ndef merkezle(dizi):\n    d = np.array(dizi, dtype=float)\n    d -= d.mean()\n    return d\n',
        tests: 'import numpy as np\norj = np.array([10.0, 20.0, 30.0])\nr = merkezle(orj)\nassert r.tolist() == [-10.0, 0.0, 10.0], "Sonuç [-10, 0, 10] olmalı"\nassert orj.tolist() == [10.0, 20.0, 30.0], "Orijinal dizi değişmemeli: numpy\'da [:] bir görünüm (view) verir, kopya değil"\ntam = np.array([1, 2, 3, 6])\nassert merkezle(tam).tolist() == [-2.0, -1.0, 0.0, 3.0], "Tam sayı dizide de çalışmalı (float kopya kur)"\n',
        hints: ['Listede [:] kopya üretir ama numpy dizisinde görünüm üretir.', 'np.array(dizi, dtype=float) hem kopya hem float tür verir; tam sayı dizide -= hatası da böylece önlenir.'],
        why: 'numpy dilimi aynı belleği paylaşır; yerinde -= orijinali bozar. np.array(..., dtype=float) (ya da .astype(float), .copy()) bağımsız kopya oluşturur.' },
      { t: 'code',
        id: 'numpy-x6',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        needs: ['numpy'],
        q: '<p><b>Hatayı bul ve düzelt.</b> <code>kdv_ekle(fiyatlar)</code> fiyatlara %20 KDV ekleyip 2 basamağa yuvarlamalı. Hata vermiyor ama <code>[10, 25, 33]</code> için <code>[12, 30, 39]</code> döndürüyor; 39.6 olması gerekirdi.</p>',
        start: 'import numpy as np\n\ndef kdv_ekle(fiyatlar):\n    d = np.array(fiyatlar)\n    for i in range(len(d)):\n        d[i] = round(d[i] * 1.2, 2)\n    return d.tolist()\n',
        sol: 'import numpy as np\n\ndef kdv_ekle(fiyatlar):\n    d = np.array(fiyatlar, dtype=float)\n    return np.round(d * 1.2, 2).tolist()\n',
        tests: 'r = kdv_ekle([10, 25, 33])\nassert r == [12.0, 30.0, 39.6], f"Beklenen [12.0, 30.0, 39.6], gelen {r}: tam sayı dizi küsuratı sessizce keser"\nassert kdv_ekle([99.99]) == [119.99], "99.99 * 1.2 = 119.988 → 119.99"\n',
        hints: ['np.array([10, 25, 33]) int64 dizi kurar; içine yazılan 39.6 → 39 olur.', 'dtype=float ver ve döngü yerine vektörleştirilmiş np.round(d * 1.2, 2) kullan.'],
        why: 'numpy dizisinin türü sabittir; int diziye eleman eleman ondalık yazmak uyarısız keser. Türü baştan float yapmak ve döngüyü kaldırmak hem doğru hem hızlıdır.' },
      { t: 'code',
        id: 'numpy-x7',
        stage: 'Meydan okuma',
        diff: 3,
        needs: ['numpy'],
        q: '<p><code>hareketli_ortalama(dizi, k)</code> fonksiyonu <code>k</code> günlük hareketli ortalamayı döndürsün: sonuç <code>len(dizi) - k + 1</code> elemanlı float numpy dizisi, i. eleman <code>dizi[i:i+k]</code>\'nın ortalaması. Kurallar: <code>k &lt;= 0</code> ise <code>ValueError</code>; <code>k &gt; len(dizi)</code> ise boş dizi. Python döngüsü kullanma (ipucu: <code>np.cumsum</code> ya da <code>np.convolve</code>).</p>',
        start: 'import numpy as np\n\ndef hareketli_ortalama(dizi, k):\n    pass\n',
        sol: 'import numpy as np\n\ndef hareketli_ortalama(dizi, k):\n    if k <= 0:\n        raise ValueError("k pozitif olmalı")\n    d = np.asarray(dizi, dtype=float)\n    if k > len(d):\n        return np.array([], dtype=float)\n    c = np.cumsum(np.concatenate([[0.0], d]))\n    return (c[k:] - c[:-k]) / k\n',
        tests: 'import numpy as np\nr = hareketli_ortalama([10, 20, 30, 40, 50], 3)\nassert np.allclose(r, [20, 30, 40]), f"3 günlük ortalama [20, 30, 40] olmalı, gelen {r}"\nassert np.allclose(hareketli_ortalama([5, 7], 1), [5, 7]), "k=1 dizinin kendisi"\nassert hareketli_ortalama([1, 2], 3).shape == (0,), "k > n ise boş dizi"\ntry:\n    hareketli_ortalama([1, 2], 0)\n    assert False, "k=0 ValueError vermeli"\nexcept ValueError:\n    pass\nbuyuk = np.arange(100000, dtype=float)\nassert np.allclose(hareketli_ortalama(buyuk, 10)[:2], [4.5, 5.5]), "Büyük dizide de doğru"\nassert "for " not in __source__ and "while " not in __source__, "Döngü yerine cumsum/convolve kullan"\n',
        hints: ['Pencere toplamı = cumsum[i+k] - cumsum[i]; başa 0 eklenmiş cumsum işini kolaylaştırır.', 'np.concatenate([[0.0], d]) ile başa 0 ekle; c[k:] - c[:-k] pencere toplamlarını verir.', 'Alternatif: np.convolve(d, np.ones(k) / k, mode="valid").'],
        why: 'Kümülatif toplam farkı, her pencereyi yeniden toplamadan O(n) hareketli ortalama verir; pandas\'ın rolling().mean() işlemi de aynı fikre dayanır. Kenar durumlar (k<=0, k>n) üretim kodunda açıkça ele alınmalıdır.' }
    ],
    faq: [
      { q: 'numpy 1 ile 2 arasında kodumu etkileyecek fark var mı?',
        a: 'Çoğu günlük kod aynen çalışır. Kaldırılan takma adlar (np.float, np.int, np.object), bazı fonksiyon adlarının taşınması ve skalerlerin yazdırılma biçimi (np.float64(1.5) gibi) en sık karşılaşılan farklardır. Eski derlenmiş paketler numpy 2 ile açılmazsa o paketleri güncelle.' },
      { q: 'np.vstack, np.concatenate ve np.stack arasındaki fark ne?',
        a: 'concatenate var olan bir eksen boyunca uç uca ekler; vstack tek boyutlu dizileri satır yapıp alt alta koyar; stack ise YENİ bir eksen açar (iki (3,) dizi → (2, 3)). Şekli emin değilsen sonucun .shape değerini yazdır.' }
    ],
    mistakes: [
      { bad: 'kopya = dizi[:]\nkopya[0] = 0',
        good: 'kopya = dizi.copy()\nkopya[0] = 0',
        why: 'Listede [:] kopyadır ama numpy\'da görünümdür; orijinal dizi de değişir.' },
      { bad: 'ilk = np.argmax(toplam >= hedef)',
        good: 'm = toplam >= hedef\nilk = int(np.argmax(m)) if m.any() else -1',
        why: 'Hiç True yoksa argmax 0 döndürür ve "ilk gün ulaşıldı" gibi yanlış bir sonuç üretir.' }
    ]
  }
);
})(window);
