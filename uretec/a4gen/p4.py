import sys
sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/a4gen')
from common import main

N = 'numpy'
S = 'SQL + Python'
NN = ['numpy']
NS = ['sqlite3']
P = []

# ================================================================= numpy
P.append(dict(
    id='a-231', title='Soğuk zincir sıcaklık özeti', track=N, diff='Kolay', needs=NN, mode='stdin',
    tags=['numpy', 'mean', 'std', 'stdin'], src='HackerRank NumPy: Mean, Var, and Std benzeri',
    statement='<p>Anadolu Market\'in soğuk zincir deposundaki sensör, gün boyunca sıcaklık ölçümleri gönderiyor. Ölçümleri NumPy dizisine çevir ve özet istatistikleri yazdır.</p>'
              '<p>Üç satır yazdır: <code>ortalama: X</code>, <code>std: Y</code> (popülasyon standart sapması, <code>ddof=0</code>) ve <code>aralik: MIN MAX</code>. Tüm sayılar 2 ondalık.</p>',
    input='<p>İlk satırda N, ikinci satırda boşlukla ayrılmış N ondalıklı sayı.</p>',
    output='<p>Üç satır, örnekteki biçimde.</p>',
    constraints='1 ≤ N ≤ 10^5; −30 ≤ değer ≤ 30',
    samples=[{'in': '5\n2.5 3.1 4.0 2.9 3.5\n', 'why': 'Ortalama 3.20; en düşük 2.50, en yüksek 4.00.'}],
    hidden=[
        {'in': '1\n-18.0\n'},
        {'in': '4\n0 0 0 0\n'},
        {'in': '6\n-2.25 -1.5 0.75 1.25 3.0 -0.5\n'},
        {'gen': 'import random\nrandom.seed(231)\nn = 1000\nprint(n)\nprint(*[round(random.gauss(4, 1.2), 2) for _ in range(n)])\n'},
        {'gen': 'import random\nrandom.seed(31)\nn = 20000\nprint(n)\nprint(*[round(random.uniform(-30, 30), 2) for _ in range(n)])\n'},
    ],
    start='import numpy as np\n\nn = int(input())\n# kodunu yaz\n',
    sol='''
        import numpy as np

        n = int(input())
        a = np.array(input().split(), dtype=float)
        print(f"ortalama: {a.mean():.2f}")
        print(f"std: {a.std():.2f}")
        print(f"aralik: {a.min():.2f} {a.max():.2f}")
        ''',
    editorial='<p><b>Dönüşüm:</b> <code>np.array(input().split(), dtype=float)</code> metin listesini tek adımda float dizisine çevirir; <code>np.fromstring</code> eskimiş (deprecated) bir yoldur.</p>'
              '<p><b>ddof:</b> NumPy\'ın <code>std()</code> varsayılanı <code>ddof=0</code> (popülasyon), pandas\'ın <code>std()</code> varsayılanı <code>ddof=1</code> (örneklem). '
              'Aynı veride iki kütüphane farklı sonuç verirse ilk bakılacak yer burasıdır.</p>'
              '<p><b>Biçim:</b> <code>-0.00</code> yazımı biçimlendirmede görülebilir; burada testler sıfır ortalamalı veriyi doğrudan 0 ile verdiği için sorun yok.</p>',
    hints=['<code>np.array(input().split(), dtype=float)</code>', '<code>a.mean()</code>, <code>a.std()</code>, <code>a.min()</code>, <code>a.max()</code>', '<code>f"{x:.2f}"</code>'],
))

P.append(dict(
    id='a-232', title='Yolculuk mesafesi yüzdelikleri', track=N, diff='Kolay', needs=NN,
    tags=['numpy', 'percentile', 'veri seti'], src='Dağılım özeti: percentile / quantile',
    fn='mesafe_yuzdelik', ds='pedal_izmir',
    statement='<p>Pedal İzmir fiyat ekibi, yolculuk mesafelerinin dağılımına göre kademeli fiyat düşünüyor. '
              '<code>veri.kayitlar("pedal_izmir", "bk_trips")</code> içindeki <code>distance_km</code> değerlerini (kapanmamış yolculuklarda <code>None</code>; bunları at) NumPy dizisine çevir.</p>'
              '<p><code>mesafe_yuzdelik(yuzdelikler)</code>: verilen her yüzdelik için <code>np.percentile</code> değerini 2 ondalığa yuvarlayıp liste olarak döndür.</p>',
    input='<p><code>yuzdelikler</code>: 0–100 arası sayılar listesi.</p>',
    output='<p><code>list[float]</code></p>',
    constraints='bk_trips 116 517 satır',
    samples=[('mesafe_yuzdelik([50, 90])', 'Medyan ve 90. yüzdelik mesafe (km).')],
    calls=['mesafe_yuzdelik([0, 25, 75, 100])', 'mesafe_yuzdelik([99])'],
    start='''
        import veri
        import numpy as np

        def mesafe_yuzdelik(yuzdelikler):
            yolculuklar = veri.kayitlar("pedal_izmir", "bk_trips")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        import numpy as np

        KM = np.array([y["distance_km"] for y in veri.kayitlar("pedal_izmir", "bk_trips") if y["distance_km"] is not None])

        def mesafe_yuzdelik(yuzdelikler):
            km = KM
            return [round(float(v), 2) for v in np.percentile(km, yuzdelikler)]
        ''',
    editorial='<p><b>Vektörel yüzdelik:</b> <code>np.percentile(dizi, [50, 90])</code> birden çok yüzdeliği tek çağrıda hesaplar (diziyi bir kez sıralar). '
              'Varsayılan yöntem doğrusal ara değerlemedir (pandas <code>quantile</code> ile aynı).</p>'
              '<p><b>None tuzağı:</b> <code>None</code> içeren liste <code>np.array</code>\'e verilirse <code>dtype=object</code> dizi oluşur ve <code>percentile</code> hata verir. '
              'Alternatif: <code>np.array(liste, dtype=float)</code> None\'ları <code>nan</code> yapar, sonra <code>np.nanpercentile</code>.</p>'
              '<p><b>Neden yüzdelik?</b> Mesafe sağa çarpık bir dağılımdır; ortalama birkaç uzun yolculuktan etkilenir, yüzdelikler fiyat kademeleri için daha sağlam sınırlar verir.</p>',
    hints=['Önce None\'ları at.', '<code>np.percentile(km, yuzdelikler)</code> bir dizi döndürür.', '<code>round(float(v), 2)</code>'],
))

P.append(dict(
    id='a-233', title='Ortalamanın üstündeki günler', track=N, diff='Kolay', needs=NN, mode='stdin',
    tags=['numpy', 'boolean mask', 'stdin'], src='NumPy boolean indexing temelleri',
    statement='<p>Lezzet Kurye bir restoranın günlük sipariş sayılarını inceliyor. Ortalamanın <b>kesin olarak üstünde</b> kalan günlerin sayısını ve bu günlerdeki toplam siparişi bul.</p>'
              '<p>Tek satırda <code>adet toplam</code> yazdır.</p>',
    input='<p>İlk satır N, ikinci satır N tamsayı.</p>',
    output='<p><code>adet toplam</code></p>',
    constraints='1 ≤ N ≤ 10^5; 0 ≤ değer ≤ 10^4',
    samples=[{'in': '6\n10 20 30 40 50 60\n', 'why': 'Ortalama 35; 40, 50, 60 üstte: 3 gün, 150 sipariş.'}],
    hidden=[
        {'in': '1\n7\n'},
        {'in': '4\n5 5 5 5\n'},
        {'in': '5\n0 0 0 0 100\n'},
        {'gen': 'import random\nrandom.seed(233)\nn = 5000\nprint(n)\nprint(*[random.randint(0, 300) for _ in range(n)])\n'},
        {'gen': 'import random\nrandom.seed(3)\nn = 20000\nprint(n)\nprint(*[random.randint(0, 10000) for _ in range(n)])\n'},
    ],
    start='import numpy as np\n\nn = int(input())\n# kodunu yaz\n',
    sol='''
        import numpy as np

        n = int(input())
        a = np.array(input().split(), dtype=np.int64)
        ust = a[a > a.mean()]
        print(ust.size, int(ust.sum()))
        ''',
    editorial='<p><b>Maske:</b> <code>a &gt; a.mean()</code> aynı boyda bir <code>bool</code> dizisi üretir; <code>a[maske]</code> yalnız True konumlarını seçer. '
              'Sayım için <code>maske.sum()</code> da kullanılabilir (True=1).</p>'
              '<p><b>Kenar durum:</b> Tüm değerler eşitse hiçbiri ortalamanın <i>üstünde</i> değildir → <code>0 0</code>. Boş dizinin <code>sum()</code>\'ı 0\'dır.</p>'
              '<p><b>Tip:</b> <code>int(ust.sum())</code> NumPy tamsayısını düz Python tamsayısına çevirir; yazdırmada fark etmez ama JSON\'da önemlidir.</p>',
    hints=['<code>maske = a &gt; a.mean()</code>', '<code>a[maske].size</code> ve <code>a[maske].sum()</code>'],
))

P.append(dict(
    id='a-234', title='Mağaza × ürün ciro matrisi', track=N, diff='Orta', needs=NN, mode='stdin',
    tags=['numpy', 'broadcasting', 'argmax', 'axis'], src='NumPy broadcasting + eksen boyunca toplama',
    statement='<p>Anadolu Market\'in S mağazası ve U ürünü var. Haftalık satış <b>adetleri</b> S×U bir matris olarak, ürünlerin birim fiyatları ise U uzunlukta bir vektör olarak geliyor.</p>'
              '<p>Ciro matrisi = adet × fiyat (her sütun kendi fiyatıyla çarpılır). İki satır yazdır:</p>'
              '<ol><li><code>magaza I TUTAR</code>: cirosu en yüksek mağazanın 1 tabanlı sırası ve cirosu (2 ondalık).</li>'
              '<li><code>urun J ADET</code>: tüm mağazalarda toplam <b>adedi</b> en yüksek ürünün 1 tabanlı sırası ve toplam adedi.</li></ol>'
              '<p>Eşitlikte küçük sıra numarası seçilir.</p>',
    input='<p>İlk satır <code>S U</code>; sonra S satır, her birinde U tamsayı (adet); son satırda U ondalıklı fiyat.</p>',
    output='<p>İki satır, örnekteki biçimde.</p>',
    constraints='1 ≤ S, U ≤ 300; 0 ≤ adet ≤ 1000; 0 &lt; fiyat ≤ 10^4',
    samples=[{'in': '2 3\n1 2 3\n4 0 1\n10.0 5.5 2.0\n', 'why': 'Ciro: mağaza 1 = 10+11+6 = 27, mağaza 2 = 40+0+2 = 42. Adet: ürün 1 = 5, ürün 3 = 4.'}],
    hidden=[
        {'in': '1 1\n7\n3.25\n'},
        {'in': '3 2\n1 1\n1 1\n0 2\n1.0 1.0\n'},
        {'in': '2 4\n0 0 0 0\n0 0 0 0\n9.9 1.1 2.2 3.3\n'},
        {'gen': 'import random\nrandom.seed(234)\ns, u = 40, 25\nprint(s, u)\nfor _ in range(s):\n    print(*[random.randint(0, 1000) for _ in range(u)])\nprint(*[random.randint(1, 1000000) / 100 for _ in range(u)])\n'},
        {'gen': 'import random\nrandom.seed(4)\ns, u = 120, 120\nprint(s, u)\nfor _ in range(s):\n    print(*[random.randint(0, 1000) for _ in range(u)])\nprint(*[random.randint(1, 1000000) / 100 for _ in range(u)])\n'},
    ],
    start='import numpy as np\n\ns, u = map(int, input().split())\n# kodunu yaz\n',
    sol='''
        import numpy as np

        s, u = map(int, input().split())
        adet = np.array([input().split() for _ in range(s)], dtype=np.int64)
        fiyat = np.array(input().split(), dtype=float)
        ciro = adet * fiyat
        m = int(ciro.sum(axis=1).argmax())
        p = int(adet.sum(axis=0).argmax())
        print(f"magaza {m + 1} {ciro.sum(axis=1)[m]:.2f}")
        print(f"urun {p + 1} {adet.sum(axis=0)[p]}")
        ''',
    editorial='<p><b>Broadcasting:</b> (S, U) şekilli matrisi (U,) şekilli vektörle çarpınca NumPy vektörü her satıra "yayar": her sütun kendi fiyatıyla çarpılır. Döngü yok.</p>'
              '<p><b>Eksenler:</b> <code>sum(axis=1)</code> satır boyunca toplar → mağaza başına (S,) dizi; <code>sum(axis=0)</code> sütun boyunca → ürün başına (U,) dizi. '
              'Akılda tutma yolu: <i>axis, kaybolan boyuttur</i>.</p>'
              '<p><b>argmax:</b> En büyük değerin <i>ilk</i> indeksini döndürür; eşitlikte küçük sıra kuralı kendiliğinden sağlanır. 0 tabanlı olduğu için +1 eklemeyi unutma.</p>'
              '<p><b>Karmaşıklık:</b> O(S·U).</p>',
    hints=['<code>np.array([input().split() for _ in range(s)], dtype=np.int64)</code>', '<code>ciro = adet * fiyat</code> (broadcasting)',
           'Mağaza: <code>ciro.sum(axis=1).argmax()</code>; ürün: <code>adet.sum(axis=0).argmax()</code>'],
))

P.append(dict(
    id='a-235', title='En yakın havalimanları', track=N, diff='Orta', needs=NN,
    tags=['numpy', 'vektörel', 'haversine', 'argsort'], src='Vektörel haversine mesafesi (coğrafi analiz)',
    fn='en_yakin_havalimanlari', ds='kanat_havayollari',
    statement='<p>Kanat Havayolları, bir havalimanı kapandığında yönlendirme (divert) seçeneklerini hızlıca görmek istiyor. '
              '<code>hv_airports</code> tablosunda <code>airport_code, lat, lon</code> var.</p>'
              '<p><code>en_yakin_havalimanlari(kod, k)</code>: <code>kod</code> havalimanından diğer tüm havalimanlarına büyük daire (haversine) mesafesini <b>NumPy ile vektörel</b> hesapla '
              '(Dünya yarıçapı R = 6371 km) ve en yakın <code>k</code> havalimanını <code>(kod, km)</code> olarak döndür; km en yakın tamsayıya yuvarlanmış <code>int</code>. Kendisi listeye girmez.</p>'
              '<p>Haversine: <code>a = sin²(Δφ/2) + cos φ1 · cos φ2 · sin²(Δλ/2)</code>, <code>d = 2R · arcsin(√a)</code> (açılar radyan).</p>',
    input='<p><code>kod</code>: havalimanı kodu; <code>k</code>: int.</p>',
    output='<p><code>list</code> of <code>(str, int)</code>, mesafeye göre artan.</p>',
    constraints='hv_airports 19 satır',
    samples=[('en_yakin_havalimanlari(\'IST\', 3)', 'İstanbul Havalimanı\'na en yakın 3 havalimanı.')],
    calls=['en_yakin_havalimanlari(\'VAN\', 2)', 'en_yakin_havalimanlari(\'LHR\', 4)', 'len(en_yakin_havalimanlari(\'AYT\', 100))'],
    start='''
        import veri
        import numpy as np

        def en_yakin_havalimanlari(kod, k):
            hav = veri.kayitlar("kanat_havayollari", "hv_airports")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        import numpy as np

        def en_yakin_havalimanlari(kod, k):
            hav = veri.kayitlar("kanat_havayollari", "hv_airports")
            kodlar = np.array([h["airport_code"] for h in hav])
            lat = np.radians([h["lat"] for h in hav])
            lon = np.radians([h["lon"] for h in hav])
            i = int(np.where(kodlar == kod)[0][0])
            a = np.sin((lat - lat[i]) / 2) ** 2 + np.cos(lat[i]) * np.cos(lat) * np.sin((lon - lon[i]) / 2) ** 2
            d = 2 * 6371 * np.arcsin(np.sqrt(a))
            sira = [j for j in np.argsort(d, kind="stable") if j != i][:k]
            return [(str(kodlar[j]), int(round(d[j]))) for j in sira]
        ''',
    editorial='<p><b>Vektörel hesap:</b> Tek havalimanının koordinatı (skaler) tüm dizilerle işleme girer; NumPy 19 mesafeyi tek ifadede hesaplar. '
              '10 bin noktada da aynı kod döngüden onlarca kat hızlıdır.</p>'
              '<p><b>Radyan:</b> <code>np.sin</code> radyan bekler; derece vermek en sık hatadır. <code>np.radians</code> listeyi doğrudan diziye çevirir.</p>'
              '<p><b>argsort:</b> Sıralanmış <i>indeksleri</i> verir; kendisi (mesafe 0) her zaman ilk sıradadır, filtreyle atılır. '
              'Sadece k eleman gerekiyorsa büyük dizilerde <code>np.argpartition</code> O(n) çalışır.</p>'
              '<p><b>Not:</b> Haversine Dünya\'yı küre sayar; gerçek havacılık hesapları elipsoit (Vincenty) kullanır, fark ~%0.5.</p>',
    hints=['Koordinatları <code>np.radians</code> ile diziye çevir.', 'Kaynak indeks: <code>np.where(kodlar == kod)[0][0]</code>',
           '<code>np.argsort(d)</code> ile sırala, kaynağı atla.'],
))

P.append(dict(
    id='a-236', title='Hareketli ortalama ve en iyi hafta', track=N, diff='Orta', needs=NN, mode='stdin',
    tags=['numpy', 'convolve', 'cumsum', 'kayan pencere'], src='HackerRank/LeetCode "maximum average subarray" fikri, NumPy ile',
    statement='<p>Pedal İzmir günlük yolculuk sayılarını <code>k</code> günlük hareketli ortalamayla yumuşatmak istiyor.</p>'
              '<p>İki satır yazdır: 1) tüm <code>N-k+1</code> pencerenin ortalaması, boşlukla ayrılmış, her biri 2 ondalık; 2) ortalaması en yüksek pencerenin 1 tabanlı <b>başlangıç</b> günü '
              '(eşitlikte en erken).</p>',
    input='<p>İlk satır <code>N k</code>; ikinci satır N tamsayı.</p>',
    output='<p>İki satır.</p>',
    constraints='1 ≤ k ≤ N ≤ 10^5; 0 ≤ değer ≤ 10^4',
    samples=[{'in': '5 3\n1 2 3 4 5\n', 'why': 'Pencereler (1,2,3), (2,3,4), (3,4,5) → 2, 3, 4; en iyi pencere 3. günde başlar.'}],
    hidden=[
        {'in': '1 1\n9\n'},
        {'in': '4 4\n1 2 3 4\n'},
        {'in': '6 2\n5 5 1 1 5 5\n'},
        {'gen': 'import random\nrandom.seed(236)\nn, k = 500, 7\nprint(n, k)\nprint(*[random.randint(0, 2000) for _ in range(n)])\n'},
        {'gen': 'import random\nrandom.seed(6)\nn, k = 20000, 30\nprint(n, k)\nprint(*[random.randint(0, 10000) for _ in range(n)])\n'},
    ],
    start='import numpy as np\n\nn, k = map(int, input().split())\n# kodunu yaz\n',
    sol='''
        import numpy as np

        n, k = map(int, input().split())
        a = np.array(input().split(), dtype=np.int64)
        c = np.concatenate(([0], np.cumsum(a)))
        toplam = c[k:] - c[:-k]
        ort = toplam / k
        print(" ".join(f"{x:.2f}" for x in ort))
        print(int(toplam.argmax()) + 1)
        ''',
    editorial='<p><b>Önek toplamı:</b> <code>c = [0, a0, a0+a1, …]</code> ise <code>i</code>\'de başlayan pencere toplamı <code>c[i+k] - c[i]</code>\'dir. '
              'NumPy dilimleriyle tüm pencereler tek satırda: <code>c[k:] - c[:-k]</code>. O(N).</p>'
              '<p><b>Alternatif:</b> <code>np.convolve(a, np.ones(k), "valid") / k</code> aynı sonucu verir; büyük k\'da da hızlıdır ama kayan nokta toplamı nedeniyle '
              'son basamaklarda minik farklar olabilir. <code>argmax</code>\'ı tamsayı toplamlar üzerinde yapmak eşitlik karşılaştırmasını kesinleştirir.</p>'
              '<p><b>Kaba kuvvet:</b> Her pencereyi ayrı toplamak O(N·k) = 3·10^6 işlem; Python döngüsünde yavaş, NumPy\'da kabul edilebilir ama gereksiz.</p>',
    hints=['<code>np.cumsum</code> ile önek toplamı, başına 0 ekle.', 'Pencere toplamları: <code>c[k:] - c[:-k]</code>', '<code>argmax() + 1</code>'],
))

P.append(dict(
    id='a-237', title='İstasyon komşuluk matrisi', track=N, diff='Zor', needs=NN,
    tags=['numpy', 'broadcasting', 'mesafe matrisi', 'veri seti'], src='İkili mesafe matrisi (pairwise distances) — scipy.spatial.distance fikri',
    fn='istasyon_komsulari', ds='pedal_izmir',
    statement='<p>Pedal İzmir yeni istasyon planlarken mevcut istasyonların birbirine ne kadar yakın olduğunu görmek istiyor. <code>bk_stations</code>: <code>station_id, name, lat, lon</code>.</p>'
              '<p>Tüm istasyon çiftleri arasındaki haversine mesafesini (R = 6371 km) <b>broadcasting</b> ile tek bir N×N matriste hesapla. <code>istasyon_komsulari(r_km)</code> şunu döndürsün:</p>'
              '<ol><li><code>en_yakin_cift</code>: birbirine en yakın iki farklı istasyonun adları, <code>station_id</code>\'si küçük olan önce, ve mesafeleri <b>metre</b> (en yakın tamsayı): <code>(ad1, ad2, metre)</code>.</li>'
              '<li><code>en_kalabalik</code>: <code>r_km</code> yarıçapında (≤) en çok komşusu olan istasyonun adı ve komşu sayısı (kendisi hariç); eşitlikte küçük <code>station_id</code>: <code>(ad, sayi)</code>.</li></ol>'
              '<p>Sonuç: <code>(en_yakin_cift, en_kalabalik)</code>.</p>',
    input='<p><code>r_km</code>: float &gt; 0.</p>',
    output='<p><code>tuple</code>: <code>((str, str, int), (str, int))</code></p>',
    constraints='bk_stations 62 satır (station_id sıralı)',
    samples=[('istasyon_komsulari(1.0)', '1 km yarıçapta en çok komşusu olan istasyon.')],
    calls=['istasyon_komsulari(0.5)', 'istasyon_komsulari(3)[1]', 'istasyon_komsulari(0.01)[1][1]'],
    start='''
        import veri
        import numpy as np

        def istasyon_komsulari(r_km):
            istasyonlar = veri.kayitlar("pedal_izmir", "bk_stations")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        import numpy as np

        def istasyon_komsulari(r_km):
            ist = sorted(veri.kayitlar("pedal_izmir", "bk_stations"), key=lambda s: s["station_id"])
            ad = [s["name"] for s in ist]
            lat = np.radians([s["lat"] for s in ist])
            lon = np.radians([s["lon"] for s in ist])
            dlat = lat[:, None] - lat[None, :]
            dlon = lon[:, None] - lon[None, :]
            a = np.sin(dlat / 2) ** 2 + np.cos(lat)[:, None] * np.cos(lat)[None, :] * np.sin(dlon / 2) ** 2
            d = 2 * 6371 * np.arcsin(np.sqrt(np.clip(a, 0, 1)))
            np.fill_diagonal(d, np.inf)
            i, j = np.unravel_index(np.argmin(d), d.shape)
            i, j = sorted((int(i), int(j)))
            komsu = (d <= r_km).sum(axis=1)
            m = int(komsu.argmax())
            return ((ad[i], ad[j], int(round(d[i, j] * 1000))), (ad[m], int(komsu[m])))
        ''',
    editorial='<p><b>Broadcasting ile N×N:</b> <code>lat[:, None]</code> şekli (N,1), <code>lat[None, :]</code> şekli (1,N); farkları (N,N) matris olur. '
              'Döngüsüz, 62×62 = 3844 mesafe tek ifadede.</p>'
              '<p><b>Köşegen:</b> Her istasyonun kendine uzaklığı 0\'dır; <code>fill_diagonal(d, inf)</code> hem en yakın çift aramasından hem komşu sayımından onu çıkarır.</p>'
              '<p><b>unravel_index:</b> <code>argmin</code> düzleştirilmiş indeks verir; <code>np.unravel_index(k, d.shape)</code> onu (satır, sütun)\'a çevirir. Matris simetrik olduğu için '
              'en küçük değer (i,j) ve (j,i)\'de iki kez görünür; argmin satır öncelikli taradığından küçük satırlı olanı bulur, yine de <code>sorted</code> ile garantiye alıyoruz.</p>'
              '<p><b>clip:</b> Kayan nokta hatası <code>a</code>\'yı 1.0000000002 yapabilir ve <code>arcsin</code> NaN döner; <code>np.clip(a, 0, 1)</code> güvenlik kemeridir.</p>'
              '<p><b>Bellek:</b> N×N matris N=10^5\'te 80 GB olur; büyük ölçekte KD-tree (<code>scipy.spatial.cKDTree</code>) ya da BallTree kullanılır.</p>',
    hints=['<code>lat[:, None] - lat[None, :]</code> (N,N) fark matrisi verir.', 'Köşegeni <code>np.inf</code> yap.',
           '<code>np.unravel_index(np.argmin(d), d.shape)</code>; komşu sayısı <code>(d &lt;= r_km).sum(axis=1)</code>.'],
))

P.append(dict(
    id='a-238', title='Reklam bütçesi ve satış: doğrusal model', track=N, diff='Zor', needs=NN, mode='stdin',
    tags=['numpy', 'regresyon', 'lstsq', 'R kare'], src='En küçük kareler (OLS) — ISLR "Advertising" vakası fikri',
    statement='<p>Anadolu Market pazarlama ekibi haftalık dijital reklam bütçesi (bin TL) ile satış (bin TL) arasındaki ilişkiyi <code>satis = a·butce + b</code> doğrusu ile modellemek istiyor.</p>'
              '<p>En küçük kareler yöntemiyle <code>a</code> (eğim) ve <code>b</code> (kesişim) değerlerini, modelin <b>R²</b> değerini ve verilen yeni bütçe için tahmini hesapla. '
              'Dört satır yazdır: <code>egim: A</code>, <code>kesisim: B</code>, <code>r2: R</code> (bu üçü 4 ondalık) ve <code>tahmin: T</code> (2 ondalık).</p>'
              '<p>R² = 1 − Σ(y − ŷ)² / Σ(y − ȳ)².</p>',
    input='<p>İlk satır N; sonra N satır <code>butce satis</code>; son satır tahmin edilecek bütçe.</p>',
    output='<p>Dört satır.</p>',
    constraints='2 ≤ N ≤ 10^5; bütçe değerlerinden en az ikisi farklı, satış değerlerinden en az ikisi farklı',
    samples=[{'in': '4\n1 3\n2 5\n3 7\n4 9\n10\n', 'why': 'Tam doğrusal: satis = 2·butce + 1, R² = 1, tahmin 21.'}],
    hidden=[
        {'in': '2\n0 1\n10 21\n5\n'},
        {'in': '3\n1 5\n2 4\n3 9\n100\n'},
        {'in': '5\n10 25\n20 41\n30 58\n40 62\n50 90\n35\n'},
        {'gen': 'import random\nrandom.seed(238)\nn = 200\nprint(n)\nfor _ in range(n):\n    x = random.uniform(0, 100)\n    print(round(x, 2), round(3.5 * x + 40 + random.gauss(0, 25), 2))\nprint(75)\n'},
        {'gen': 'import random\nrandom.seed(8)\nn = 20000\nprint(n)\nfor _ in range(n):\n    x = random.uniform(5, 500)\n    print(round(x, 2), round(-0.8 * x + 900 + random.gauss(0, 120), 2))\nprint(250.5)\n'},
    ],
    start='import sys\nimport numpy as np\n\nveri_satirlari = sys.stdin.read().split()\n# kodunu yaz\n',
    sol='''
        import sys
        import numpy as np

        t = sys.stdin.read().split()
        n = int(t[0])
        xy = np.array(t[1:1 + 2 * n], dtype=float).reshape(n, 2)
        x, y = xy[:, 0], xy[:, 1]
        yeni = float(t[1 + 2 * n])
        A = np.column_stack([x, np.ones(n)])
        (a, b), *_ = np.linalg.lstsq(A, y, rcond=None)
        tahmin = a * x + b
        ss_res = ((y - tahmin) ** 2).sum()
        ss_tot = ((y - y.mean()) ** 2).sum()
        r2 = 1 - ss_res / ss_tot
        print(f"egim: {a:.4f}")
        print(f"kesisim: {b:.4f}")
        print(f"r2: {r2:.4f}")
        print(f"tahmin: {a * yeni + b:.2f}")
        ''',
    editorial='<p><b>Tasarım matrisi:</b> <code>A = [x, 1]</code> sütunları; <code>np.linalg.lstsq(A, y)</code> ‖Ax − y‖²\'yi en aza indiren <code>[a, b]</code>\'yi döndürür. '
              'Alternatifler: <code>np.polyfit(x, y, 1)</code> (aynı sonuç, katsayılar yüksek dereceden düşüğe) ya da kapalı form '
              '<code>a = cov(x, y) / var(x)</code>, <code>b = ȳ − a·x̄</code>.</p>'
              '<p><b>Neden normal denklemler değil?</b> <code>inv(AᵀA) @ Aᵀ @ y</code> matematiksel olarak doğru ama sayısal olarak kararsızdır (koşul sayısının karesi); '
              '<code>lstsq</code> QR/SVD kullanır.</p>'
              '<p><b>R²:</b> Modelin açıkladığı varyans oranı. Sabit y\'de payda 0 olur ve R² tanımsızdır; gerçek kodda bu durumu ayrıca ele al. '
              '<b>Dikkat:</b> R² yüksek olması nedensellik göstermez; bütçe satışın yüksek olduğu dönemlerde artırılıyor olabilir (ters nedensellik).</p>'
              '<p><b>Girdi:</b> 10^5 satırda <code>input()</code> döngüsü yerine <code>sys.stdin.read().split()</code> ve <code>reshape</code> çok daha hızlıdır.</p>',
    hints=['Tüm girdiyi <code>sys.stdin.read().split()</code> ile al, <code>reshape(n, 2)</code>.', '<code>np.linalg.lstsq(np.column_stack([x, np.ones(n)]), y, rcond=None)</code>',
           'R² = 1 − SS_res / SS_tot; SS_tot = Σ(y − ȳ)².'],
))

# ================================================================= SQL + Python
P.append(dict(
    id='a-239', title='Şehirlere göre müşteri (SQL)', track=S, diff='Kolay', needs=NS,
    tags=['sqlite3', 'GROUP BY', 'LIMIT', 'parametre'], src='SQL temel GROUP BY + Python DB-API',
    fn='sehir_musteri_sayisi', ds='anadolu_market',
    statement='<p><code>veri.baglan("anadolu_market")</code> tüm tabloları içeren bellek içi bir SQLite bağlantısı döndürür. <code>customers</code> tablosunda <code>customer_id, city, segment, …</code> var.</p>'
              '<p><code>sehir_musteri_sayisi(n)</code>: SQL ile şehir başına müşteri sayısını hesapla; sayıya göre azalan, eşitlikte şehir adına göre artan sırala ve ilk <code>n</code> satırı '
              '<code>[(şehir, sayı), ...]</code> listesi olarak döndür. <code>n</code>\'i sorguya <b>parametre</b> (<code>?</code>) olarak ver.</p>',
    input='<p><code>n</code>: int.</p>',
    output='<p><code>list</code> of <code>(str, int)</code></p>',
    constraints='customers 150 satır',
    samples=[('sehir_musteri_sayisi(3)', 'En çok müşterisi olan 3 şehir.')],
    calls=['sehir_musteri_sayisi(1)', 'sehir_musteri_sayisi(8)'],
    start='''
        import veri

        def sehir_musteri_sayisi(n):
            con = veri.baglan("anadolu_market", tablolar=["customers"])
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri

        def sehir_musteri_sayisi(n):
            con = veri.baglan("anadolu_market", tablolar=["customers"])
            sorgu = """
                SELECT city, COUNT(*) AS adet
                FROM customers
                GROUP BY city
                ORDER BY adet DESC, city
                LIMIT ?
            """
            sonuc = con.execute(sorgu, (n,)).fetchall()
            con.close()
            return sonuc
        ''',
    editorial='<p><b>DB-API akışı:</b> <code>con.execute(sorgu, parametreler)</code> bir imleç (cursor) döndürür; <code>fetchall()</code> tüm satırları demet listesi olarak verir. '
              'Parametreler her zaman bir <b>demet</b> olmalı: <code>(n,)</code> — virgülü unutursan <code>(n)</code> yalnız bir sayıdır ve hata alırsın.</p>'
              '<p><b>Neden parametre?</b> f-string ile sorgu kurmak (<code>f"LIMIT {n}"</code>) kullanıcı girdisinde SQL enjeksiyonuna kapı açar. '
              '<code>?</code> yer tutucusu değeri sorgudan ayrı gönderir.</p>'
              '<p><b>tablolar=[...]:</b> Büyük setlerde yalnız gereken tabloları yüklemek bağlantıyı hızlandırır.</p>'
              '<p><b>Sıralama notu:</b> SQLite metinleri bayt sırasıyla karşılaştırır; <code>İ</code> ile başlayan şehirler Z\'den sonra gelir. Türkçe sıralama için Python\'da <code>locale</code>/özel anahtar gerekir.</p>',
    hints=['<code>GROUP BY city ORDER BY adet DESC, city LIMIT ?</code>', '<code>con.execute(sorgu, (n,)).fetchall()</code>'],
))

P.append(dict(
    id='a-240', title='Şehrin şubeleri ve müşterileri', track=S, diff='Kolay', needs=NS,
    tags=['sqlite3', 'JOIN', 'LEFT JOIN', 'parametre'], src='SQL JOIN + parametreli sorgu',
    fn='sube_musterileri', ds='anadolu_bank',
    statement='<p>Anadolu Bank bölge müdürü kendi şehrindeki şubelerin müşteri sayılarını görmek istiyor. <code>bank_branches</code>: <code>branch_id, name, city</code>; '
              '<code>bank_customers</code>: <code>customer_id, branch_id, …</code></p>'
              '<p><code>sube_musterileri(sehir)</code>: şehri <code>sehir</code> olan şubeleri ve her birine bağlı müşteri sayısını SQL ile getir. Müşterisi olmayan şube de 0 ile görünmeli. '
              'Müşteri sayısına göre azalan, eşitlikte şube adına göre artan sırada <code>[(şube_adı, sayı), ...]</code> döndür. Şehri <code>?</code> parametresiyle ver.</p>',
    input='<p><code>sehir</code>: str.</p>',
    output='<p><code>list</code> of <code>(str, int)</code></p>',
    constraints='bank_branches 12, bank_customers 500 satır',
    samples=[('sube_musterileri(\'İstanbul\')', 'İstanbul şubeleri ve müşteri sayıları.')],
    calls=['sube_musterileri(\'Ankara\')', 'sube_musterileri(\'İzmir\')', 'sube_musterileri(\'Hakkari\')', 'sube_musterileri("x\' OR \'1\'=\'1")'],
    start='''
        import veri

        def sube_musterileri(sehir):
            con = veri.baglan("anadolu_bank", tablolar=["bank_branches", "bank_customers"])
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri

        def sube_musterileri(sehir):
            con = veri.baglan("anadolu_bank", tablolar=["bank_branches", "bank_customers"])
            sorgu = """
                SELECT b.name, COUNT(c.customer_id) AS adet
                FROM bank_branches b
                LEFT JOIN bank_customers c ON c.branch_id = b.branch_id
                WHERE b.city = ?
                GROUP BY b.branch_id, b.name
                ORDER BY adet DESC, b.name
            """
            return con.execute(sorgu, (sehir,)).fetchall()
        ''',
    editorial='<p><b>LEFT JOIN + COUNT(sütun):</b> Müşterisi olmayan şube LEFT JOIN sonrası bir satırla gelir ama müşteri sütunları NULL\'dır. '
              '<code>COUNT(*)</code> bu satırı 1 sayardı; <code>COUNT(c.customer_id)</code> NULL\'ları saymadığı için doğru sonuç 0 verir.</p>'
              '<p><b>Enjeksiyon testi:</b> Son test <code>"x\' OR \'1\'=\'1"</code> gibi kötü niyetli bir metin gönderiyor. f-string ile kurulan sorgu tüm şubeleri döndürürdü; '
              '<code>?</code> parametresi metni yalnız bir değer olarak eşler ve boş liste döner.</p>'
              '<p><b>GROUP BY branch_id:</b> Aynı adlı iki şube olsa bile karışmasın diye anahtar kimlikle gruplanır.</p>',
    hints=['<code>FROM bank_branches b LEFT JOIN bank_customers c ON ...</code>', '<code>COUNT(c.customer_id)</code> NULL saymaz.', '<code>WHERE b.city = ?</code>, <code>(sehir,)</code>'],
))

P.append(dict(
    id='a-241', title='Şehirden kalkan uçuşlar', track=S, diff='Kolay', needs=NS,
    tags=['sqlite3', 'JOIN', 'COUNT'], src='Çok tablolu JOIN zinciri',
    fn='kalkis_sayisi', ds='kanat_havayollari',
    statement='<p>Kanat Havayolları\'nda bir şehrin birden fazla havalimanı olabilir (İstanbul: IST ve SAW). <code>hv_flights.route_id</code> → <code>hv_routes.origin</code> → '
              '<code>hv_airports.airport_code</code> / <code>city</code> zincirini kullan.</p>'
              '<p><code>kalkis_sayisi(sehir)</code>: kalkış havalimanı <code>sehir</code>\'de olan ve <code>status</code>\'u <code>cancelled</code> <b>olmayan</b> uçuşların sayısını SQL ile hesaplayıp <code>int</code> döndür.</p>',
    input='<p><code>sehir</code>: <code>hv_airports.city</code> değeri.</p>',
    output='<p><code>int</code></p>',
    constraints='hv_flights 3173, hv_routes 45, hv_airports 19 satır',
    samples=[('kalkis_sayisi(\'İstanbul\')', 'IST ve SAW\'dan gerçekleşen kalkışlar.')],
    calls=['kalkis_sayisi(\'Ankara\')', 'kalkis_sayisi(\'Muğla\')', 'kalkis_sayisi(\'Londra\')', 'kalkis_sayisi(\'Atlantis\')'],
    start='''
        import veri

        def kalkis_sayisi(sehir):
            con = veri.baglan("kanat_havayollari", tablolar=["hv_flights", "hv_routes", "hv_airports"])
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri

        def kalkis_sayisi(sehir):
            con = veri.baglan("kanat_havayollari", tablolar=["hv_flights", "hv_routes", "hv_airports"])
            sorgu = """
                SELECT COUNT(*)
                FROM hv_flights f
                JOIN hv_routes r ON r.route_id = f.route_id
                JOIN hv_airports a ON a.airport_code = r.origin
                WHERE a.city = ? AND f.status <> 'cancelled'
            """
            (adet,) = con.execute(sorgu, (sehir,)).fetchone()
            return adet
        ''',
    editorial='<p><b>fetchone:</b> Tek değerli (skaler) sorgularda <code>fetchone()</code> tek bir demet döndürür: <code>(1234,)</code>. '
              '<code>(adet,) = ...</code> açma ifadesi değeri doğrudan alır; <code>fetchone()[0]</code> da olur.</p>'
              '<p><b>Neden JOIN zinciri?</b> Uçuş tablosunda şehir yok; normalize edilmiş şemada bilgi ilişkili tablolarda durur. '
              'Python\'da aynı işi sözlüklerle yapmak mümkündür (a-205), ama SQL motoru join\'i optimize eder.</p>'
              '<p><b>Sık hata:</b> <code>status != "cancelled"</code> — SQL\'de metin sabitleri <b>tek tırnak</b> ister; çift tırnak sütun adı demektir (SQLite bazen hoşgörülüdür, diğer veritabanları değil).</p>',
    hints=['<code>JOIN hv_routes r ON r.route_id = f.route_id</code>', '<code>JOIN hv_airports a ON a.airport_code = r.origin</code>', '<code>fetchone()[0]</code>'],
))

P.append(dict(
    id='a-242', title='Çalışma moduna göre eğitim dağılımı', track=S, diff='Kolay', needs=NS,
    tags=['sqlite3', 'IS NULL', 'dict'], src='SQL filtre + Python sözlüğe dönüştürme',
    fn='egitim_dagilimi', ds='pusula_ik',
    statement='<p>Pusula İK, uzaktan ve hibrit çalışanların eğitim profilini görmek istiyor. <code>ik_employees</code>: <code>education, work_mode, term_date</code> (aktif çalışanda boş → SQL\'de <code>NULL</code>).</p>'
              '<p><code>egitim_dagilimi(mod)</code>: <code>work_mode = mod</code> olan <b>aktif</b> çalışanları SQL ile eğitim düzeyine göre say ve <code>{eğitim: sayı}</code> sözlüğü döndür.</p>',
    input='<p><code>mod</code>: <code>"ofis"</code>, <code>"hibrit"</code> ya da <code>"uzaktan"</code>.</p>',
    output='<p><code>dict</code></p>',
    constraints='ik_employees 2199 satır',
    samples=[('egitim_dagilimi(\'uzaktan\')', 'Aktif uzaktan çalışanların eğitim dağılımı.')],
    calls=['egitim_dagilimi(\'hibrit\')', 'egitim_dagilimi(\'ofis\')', 'egitim_dagilimi(\'ay\')'],
    start='''
        import veri

        def egitim_dagilimi(mod):
            con = veri.baglan("pusula_ik", tablolar=["ik_employees"])
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri

        def egitim_dagilimi(mod):
            con = veri.baglan("pusula_ik", tablolar=["ik_employees"])
            sorgu = """
                SELECT education, COUNT(*)
                FROM ik_employees
                WHERE work_mode = ? AND term_date IS NULL
                GROUP BY education
            """
            return dict(con.execute(sorgu, (mod,)).fetchall())
        ''',
    editorial='<p><b>NULL karşılaştırması:</b> SQL\'de <code>term_date = NULL</code> hiçbir zaman doğru olmaz (sonuç UNKNOWN); her zaman <code>IS NULL</code> / <code>IS NOT NULL</code> kullan. '
              'Bu, Python\'daki <code>is None</code> kuralının SQL karşılığıdır.</p>'
              '<p><b>dict(fetchall()):</b> İki sütunlu sonuç (anahtar, değer) demetlerinden oluştuğu için <code>dict()</code>\'e doğrudan verilebilir.</p>'
              '<p><b>Not:</b> <code>veri.baglan</code> CSV\'deki boş hücreleri <code>None</code> olarak yükler; SQLite bunu NULL saklar.</p>',
    hints=['<code>WHERE work_mode = ? AND term_date IS NULL</code>', '<code>dict(con.execute(...).fetchall())</code>'],
))

P.append(dict(
    id='a-243', title='Restoranların ABC sınıflaması', track=S, diff='Orta', needs=NS,
    tags=['sqlite3', 'Pareto', 'kümülatif', 'SQL + Python'], src='ABC analizi (Pareto 80/20) — envanter/portföy yönetimi',
    fn='abc_siniflari', ds='lezzet_kurye',
    statement='<p>Lezzet Kurye iş geliştirme ekibi restoran portföyünü Pareto ilkesine göre üç sınıfa ayırmak istiyor.</p>'
              '<ol><li><b>SQL:</b> <code>lk_order_lines</code> (<code>order_id, qty, unit_price</code>) ve <code>lk_orders</code> (<code>restaurant_id, status</code>) ile <code>status = \'teslim\'</code> '
              'siparişlerde restoran başına ciro = <code>SUM(qty * unit_price)</code>; <code>lk_restaurants.name</code> ile adı al.</li>'
              '<li><b>Python:</b> Restoranları ciroya göre azalan sırala (eşitlikte ada göre). Her restoran için <b>kendisi dahil</b> kümülatif ciro payını hesapla: '
              '≤ %80 ise <b>A</b>, ≤ %95 ise <b>B</b>, aksi halde <b>C</b>.</li></ol>'
              '<p><code>abc_siniflari()</code>: <code>{"A": [adlar...], "B": [...], "C": [...]}</code> döndür (listeler ciro sırasıyla).</p>',
    input='<p>Parametre yok.</p>',
    output='<p><code>dict</code>: sınıf → restoran adları listesi.</p>',
    constraints='lk_order_lines 14 974, lk_orders 7178, lk_restaurants 30 satır',
    samples=[('{k: len(v) for k, v in abc_siniflari().items()}', 'Her sınıftaki restoran sayısı.')],
    calls=['abc_siniflari()[\'A\'][:3]', 'abc_siniflari()[\'C\']', 'sum(len(v) for v in abc_siniflari().values())'],
    start='''
        import veri

        def abc_siniflari():
            con = veri.baglan("lezzet_kurye", tablolar=["lk_order_lines", "lk_orders", "lk_restaurants"])
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri

        def abc_siniflari():
            con = veri.baglan("lezzet_kurye", tablolar=["lk_order_lines", "lk_orders", "lk_restaurants"])
            sorgu = """
                SELECT r.name, SUM(l.qty * l.unit_price) AS ciro
                FROM lk_order_lines l
                JOIN lk_orders o ON o.order_id = l.order_id
                JOIN lk_restaurants r ON r.restaurant_id = o.restaurant_id
                WHERE o.status = 'teslim'
                GROUP BY r.restaurant_id, r.name
            """
            satirlar = sorted(con.execute(sorgu).fetchall(), key=lambda x: (-x[1], x[0]))
            toplam = sum(c for _, c in satirlar)
            sonuc = {"A": [], "B": [], "C": []}
            kumulatif = 0
            for ad, ciro in satirlar:
                kumulatif += ciro
                pay = 100 * kumulatif / toplam
                sinif = "A" if pay <= 80 else "B" if pay <= 95 else "C"
                sonuc[sinif].append(ad)
            return sonuc
        ''',
    editorial='<p><b>İş bölümü:</b> Ağır kaldırmayı (15 bin satırın join\'i ve toplaması) SQL yapar, 30 satırlık sonuç üzerindeki sıralı/kümülatif mantığı Python yapar. '
              'Kümülatif pay SQL\'de de <code>SUM(ciro) OVER (ORDER BY ciro DESC)</code> pencere fonksiyonuyla yazılabilir; ama sınıflama kuralları değiştikçe Python\'da tutmak daha esnektir.</p>'
              '<p><b>Sınır tanımı:</b> "Kendisi dahil ≤ %80" ile "kendisinden öncekiler &lt; %80" farklı sonuç verir: ikincisinde %80 eşiğini aşan restoran da A olur. '
              'Hangi tanımı kullandığını raporda yaz.</p>'
              '<p><b>Yorum:</b> A sınıfı genellikle restoranların küçük bir kısmıdır ama cironun %80\'ini getirir — hesap yöneticisi atamaları buna göre yapılır.</p>',
    hints=['SQL: iki JOIN, <code>WHERE o.status = \'teslim\'</code>, <code>GROUP BY</code> restoran.', 'Python: <code>sorted(..., key=lambda x: (-x[1], x[0]))</code>',
           'Kümülatif toplamı döngüde biriktir, payı toplam ciroya böl.'],
))

P.append(dict(
    id='a-244', title='En popüler bisiklet rotaları', track=S, diff='Orta', needs=NS,
    tags=['sqlite3', 'self join', 'GROUP BY', 'büyük tablo'], src='Bike-share "top routes" analizi',
    fn='populer_rotalar', ds='pedal_izmir',
    statement='<p>Pedal İzmir, bisiklet yolu yatırımları için en çok kullanılan istasyon-istasyon rotalarını arıyor. <code>bk_trips</code> (<code>start_station, end_station</code>) ve '
              '<code>bk_stations</code> (<code>station_id, name</code>) tablolarını kullan. Büyük set olduğu için yalnız bu iki tabloyu yükle: '
              '<code>veri.baglan("pedal_izmir", tablolar=["bk_trips", "bk_stations"])</code>.</p>'
              '<p><code>populer_rotalar(n)</code>: kapanmış (<code>end_station</code> dolu) ve başlangıcı bitişinden <b>farklı</b> yolculukları (başlangıç, bitiş) çiftine göre say. '
              'En sık <code>n</code> rotayı <code>(başlangıç_adı, bitiş_adı, sayı)</code> olarak döndür; sayıya göre azalan, eşitlikte başlangıç id, sonra bitiş id artan.</p>',
    input='<p><code>n</code>: int.</p>',
    output='<p><code>list</code> of <code>(str, str, int)</code></p>',
    constraints='bk_trips 116 517, bk_stations 62 satır',
    samples=[('populer_rotalar(3)', 'En sık kullanılan 3 rota.')],
    calls=['populer_rotalar(5)[3:]'],
    start='''
        import veri

        def populer_rotalar(n):
            con = veri.baglan("pedal_izmir", tablolar=["bk_trips", "bk_stations"])
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri

        CON = veri.baglan("pedal_izmir", tablolar=["bk_trips", "bk_stations"])  # büyük tabloyu bir kez yükle

        def populer_rotalar(n):
            con = CON
            sorgu = """
                SELECT s1.name, s2.name, COUNT(*) AS adet
                FROM bk_trips t
                JOIN bk_stations s1 ON s1.station_id = t.start_station
                JOIN bk_stations s2 ON s2.station_id = t.end_station
                WHERE t.end_station IS NOT NULL AND t.start_station <> t.end_station
                GROUP BY t.start_station, t.end_station
                ORDER BY adet DESC, t.start_station, t.end_station
                LIMIT ?
            """
            return con.execute(sorgu, (n,)).fetchall()
        ''',
    editorial='<p><b>Aynı tabloya iki kez join:</b> İstasyon adı hem başlangıç hem bitiş için gerektiğinden <code>bk_stations</code> iki farklı takma adla (<code>s1</code>, <code>s2</code>) bağlanır.</p>'
              '<p><b>Gruplama anahtarı:</b> Ada göre değil kimliğe göre gruplamak, aynı adlı istasyonları karıştırmaz ve sıralama kuralını (id) doğrudan uygular.</p>'
              '<p><b>Yönlü rota:</b> A→B ve B→A ayrı sayılır. Yönsüz istenseydi <code>MIN(start, end)</code>, <code>MAX(start, end)</code> ile gruplamak gerekirdi.</p>'
              '<p><b>Performans:</b> Tüm seti yüklemek (bk_weather, bk_maintenance…) gereksiz; <code>tablolar=</code> ile yükleme süresi belirgin kısalır.</p>',
    hints=['<code>bk_stations</code>\'ı iki kez, farklı takma adla join et.', '<code>WHERE end_station IS NOT NULL AND start_station &lt;&gt; end_station</code>',
           '<code>GROUP BY t.start_station, t.end_station</code>'],
))

P.append(dict(
    id='a-245', title='Üyelik seviyesine göre yolcu harcaması', track=S, diff='Orta', needs=NS,
    tags=['sqlite3', 'LEFT JOIN', 'COALESCE', 'alt sorgu'], src='Sadakat programı analizi: LEFT JOIN ile sıfır harcayanları korumak',
    fn='seviye_harcama', ds='kanat_havayollari',
    statement='<p>Kanat Havayolları sadakat programı ekibi, üyelik seviyelerinin (<code>hv_passengers.tier</code>: Classic, Silver, Gold, Elite) ortalama harcamasını görmek istiyor.</p>'
              '<p><code>seviye_harcama(durum="flown")</code>: SQL ile her yolcunun <code>status = durum</code> olan rezervasyonlarının (<code>hv_bookings.price</code>) toplamını bul; '
              'hiç böyle rezervasyonu olmayan yolcular <b>0</b> harcamayla dahil edilmeli. Sonra Python ile seviye başına <b>yolcu başına ortalama harcamayı</b> (2 ondalık) hesapla '
              've <code>{seviye: ortalama}</code> döndür.</p>',
    input='<p><code>durum</code>: rezervasyon durumu.</p>',
    output='<p><code>dict</code>: seviye → float.</p>',
    constraints='hv_passengers 900, hv_bookings 5020 satır',
    samples=[('seviye_harcama()', 'Uçulmuş biletlerden yolcu başına ortalama harcama.')],
    calls=['seviye_harcama(\'no_show\')', 'seviye_harcama(\'iade\')'],
    start='''
        import veri

        def seviye_harcama(durum="flown"):
            con = veri.baglan("kanat_havayollari", tablolar=["hv_passengers", "hv_bookings"])
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        from collections import defaultdict

        def seviye_harcama(durum="flown"):
            con = veri.baglan("kanat_havayollari", tablolar=["hv_passengers", "hv_bookings"])
            sorgu = """
                SELECT p.passenger_id, p.tier, COALESCE(SUM(b.price), 0) AS harcama
                FROM hv_passengers p
                LEFT JOIN hv_bookings b ON b.passenger_id = p.passenger_id AND b.status = ?
                GROUP BY p.passenger_id, p.tier
            """
            toplam, adet = defaultdict(float), defaultdict(int)
            for _, tier, harcama in con.execute(sorgu, (durum,)):
                toplam[tier] += harcama
                adet[tier] += 1
            return {t: round(toplam[t] / adet[t], 2) for t in adet}
        ''',
    editorial='<p><b>Filtre nerede?</b> Durum koşulunu <code>WHERE b.status = ?</code> olarak yazarsan LEFT JOIN fiilen INNER JOIN\'e döner: rezervasyonu olmayan yolcuların '
              '<code>b.status</code> değeri NULL\'dır ve WHERE onları eler. Koşulu <code>ON</code> içine koymak, yolcuyu korur ama yalnız eşleşen rezervasyonları bağlar.</p>'
              '<p><b>COALESCE:</b> Eşleşme yoksa <code>SUM</code> NULL döner; <code>COALESCE(..., 0)</code> onu 0 yapar.</p>'
              '<p><b>İmleç üzerinde döngü:</b> <code>for satir in con.execute(...)</code> satırları tek tek getirir; büyük sonuçlarda <code>fetchall()</code>\'dan daha az bellek kullanır.</p>'
              '<p><b>Fark:</b> "Harcayan yolcuların ortalaması" ile "tüm yolcuların ortalaması" farklı sorulardır; sadakat programında hareketsiz üyeleri saymak önemlidir.</p>',
    hints=['<code>LEFT JOIN hv_bookings b ON b.passenger_id = p.passenger_id AND b.status = ?</code>', '<code>COALESCE(SUM(b.price), 0)</code>',
           'Python\'da seviye başına toplam ve yolcu sayısı tut.'],
))

P.append(dict(
    id='a-246', title='Aylık net para akışı', track=S, diff='Orta', needs=NS,
    tags=['sqlite3', 'substr', 'JOIN', 'max/min'], src='Nakit akışı raporu: SQL ile aylık toplama, Python ile seçim',
    fn='net_akis', ds='anadolu_bank',
    statement='<p>Anadolu Bank hazine ekibi, hesap türü bazında aylık net para akışını (giren + çıkan, <code>amount</code> işaretli) izliyor. '
              '<code>bank_txns</code> (<code>account_id, txn_time, amount</code>) ve <code>bank_accounts</code> (<code>account_id, account_type</code>) tablolarını kullan.</p>'
              '<p><code>net_akis(hesap_turu)</code>: SQL ile <code>account_type = hesap_turu</code> olan hesapların işlemlerini ay (<code>"YYYY-MM"</code>) bazında topla. '
              'Python ile en yüksek ve en düşük net akışlı ayı bul: <code>(en_iyi_ay, tutar, en_kotu_ay, tutar)</code>; tutarlar 2 ondalık. Hesap türü yoksa <code>None</code>.</p>',
    input='<p><code>hesap_turu</code>: <code>"vadesiz"</code>, <code>"vadeli"</code>, <code>"kredi_karti"</code>.</p>',
    output='<p><code>tuple</code>: <code>(str, float, str, float)</code> ya da <code>None</code>.</p>',
    constraints='bank_txns 42 284, bank_accounts 849 satır',
    samples=[('net_akis(\'vadesiz\')', 'Vadesiz hesaplarda en iyi ve en kötü ay.')],
    calls=['net_akis(\'kredi_karti\')', 'net_akis(\'vadeli\')', 'net_akis(\'altin\')'],
    start='''
        import veri

        def net_akis(hesap_turu):
            con = veri.baglan("anadolu_bank", tablolar=["bank_txns", "bank_accounts"])
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri

        def net_akis(hesap_turu):
            con = veri.baglan("anadolu_bank", tablolar=["bank_txns", "bank_accounts"])
            sorgu = """
                SELECT substr(t.txn_time, 1, 7) AS ay, SUM(t.amount) AS net
                FROM bank_txns t
                JOIN bank_accounts a ON a.account_id = t.account_id
                WHERE a.account_type = ?
                GROUP BY ay
            """
            aylar = con.execute(sorgu, (hesap_turu,)).fetchall()
            if not aylar:
                return None
            iyi = max(aylar, key=lambda x: x[1])
            kotu = min(aylar, key=lambda x: x[1])
            return (iyi[0], round(iyi[1], 2), kotu[0], round(kotu[1], 2))
        ''',
    editorial='<p><b>Ay anahtarı:</b> SQLite\'ta tarih tipi yoktur; ISO metninde <code>substr(txn_time, 1, 7)</code> ya da <code>strftime(\'%Y-%m\', txn_time)</code> ayı verir. '
              'SQLite\'ta <code>substr</code> <b>1 tabanlıdır</b> (Python dilimlemesi 0 tabanlı) — en sık karışıklık.</p>'
              '<p><b>max/min key:</b> Python\'da <code>max(liste, key=...)</code> tüm satırı döndürür, yalnız değeri değil; böylece ay adını da kaybetmezsin.</p>'
              '<p><b>Alternatif:</b> İki ayrı SQL (<code>ORDER BY net DESC LIMIT 1</code> ve <code>ASC LIMIT 1</code>) da olur ama aynı veriyi iki kez toplar.</p>',
    hints=['<code>substr(t.txn_time, 1, 7) AS ay</code>', '<code>JOIN bank_accounts a ON a.account_id = t.account_id</code>', '<code>max(aylar, key=lambda x: x[1])</code>'],
))

P.append(dict(
    id='a-247', title='Kategori kârlılığı (Kesit BI)', track=S, diff='Orta', needs=NS,
    tags=['sqlite3', 'strftime', 'JOIN', 'marj'], src='Power BI ölçüsü (Kâr Marjı %) SQL ile',
    fn='kategori_karlilik', ds='kesit_bi',
    statement='<p>Kesit BI modelinde <code>Satislar</code> (<code>Tarih, UrunNo, Durum, Tutar, Maliyet</code>; Maliyet satırın toplam maliyetidir) ve <code>Urunler</code> (<code>UrunNo, Kategori</code>) var. '
              'Power BI\'daki "Kâr Marjı %" ölçüsünü SQL + Python ile yeniden üret.</p>'
              '<p><code>kategori_karlilik(yil)</code>: <code>Durum</code> değeri <code>"İptal"</code> ya da <code>"İade"</code> <b>olmayan</b> ve <code>Tarih</code>\'i verilen yılda olan satırlar için '
              'kategori başına <code>SUM(Tutar)</code> ve <code>SUM(Maliyet)</code> değerlerini SQL ile al. Python\'da marj = <code>(tutar − maliyet) / tutar * 100</code> hesapla ve '
              '<code>[(kategori, marj), ...]</code> listesini marja göre azalan sırada döndür (1 ondalık).</p>',
    input='<p><code>yil</code>: int.</p>',
    output='<p><code>list</code> of <code>(str, float)</code></p>',
    constraints='Satislar 1620, Urunler 40 satır',
    samples=[('kategori_karlilik(2024)', '2024 kategori marjları.')],
    calls=['kategori_karlilik(2023)', 'kategori_karlilik(2022)[-1]', 'kategori_karlilik(2019)'],
    start='''
        import veri

        def kategori_karlilik(yil):
            con = veri.baglan("kesit_bi", tablolar=["Satislar", "Urunler"])
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri

        def kategori_karlilik(yil):
            con = veri.baglan("kesit_bi", tablolar=["Satislar", "Urunler"])
            sorgu = """
                SELECT u.Kategori, SUM(s.Tutar), SUM(s.Maliyet)
                FROM Satislar s
                JOIN Urunler u ON u.UrunNo = s.UrunNo
                WHERE s.Durum NOT IN ('İptal', 'İade') AND strftime('%Y', s.Tarih) = ?
                GROUP BY u.Kategori
            """
            satirlar = con.execute(sorgu, (str(yil),)).fetchall()
            marj = [(k, round((t - m) / t * 100, 1)) for k, t, m in satirlar]
            return sorted(marj, key=lambda x: x[1], reverse=True)
        ''',
    editorial='<p><b>Tip tuzağı:</b> <code>strftime(\'%Y\', Tarih)</code> <b>metin</b> döndürür; <code>= 2024</code> (sayı) ile karşılaştırma SQLite\'ta eşleşmez ve boş sonuç alırsın. '
              'Parametreyi <code>str(yil)</code> olarak ver ya da <code>CAST(strftime(...) AS INTEGER)</code> kullan.</p>'
              '<p><b>Oranların toplamı:</b> Marjı satır satır hesaplayıp ortalamasını almak yerine önce toplamları alıp sonra oranlamak, Power BI\'daki '
              '<code>DIVIDE(SUM(Tutar) - SUM(Maliyet), SUM(Tutar))</code> ölçüsüyle aynı sonucu verir.</p>'
              '<p><b>NOT IN:</b> Liste içinde NULL varsa <code>NOT IN</code> hiçbir satır döndürmez — SQL\'in üç değerli mantığının ünlü tuzağı; burada sabit liste olduğu için güvenli.</p>',
    hints=['<code>strftime(\'%Y\', s.Tarih) = ?</code> ve parametre <code>(str(yil),)</code>.', '<code>Durum NOT IN (\'İptal\', \'İade\')</code>', 'Marjı Python\'da toplamlardan hesapla.'],
))

P.append(dict(
    id='a-248', title='Satın alma hunisi', track=S, diff='Orta', needs=NS,
    tags=['sqlite3', 'COUNT DISTINCT', 'dinamik sorgu', 'huni'], src='Funnel analizi (product analytics)',
    fn='huni', ds='anadolu_market',
    statement='<p>Anadolu Market ürün ekibi web sitesindeki satın alma hunisini ölçüyor. <code>web_events</code>: <code>user_id, event_type, event_time, device</code>. Huni adımları sırasıyla: '
              '<code>visit → product_view → add_to_cart → checkout → purchase</code>.</p>'
              '<p><code>huni(cihaz=None)</code>: SQL ile her adımı yapan <b>farklı</b> kullanıcı sayısını bul (<code>cihaz</code> verilirse yalnız o cihaz). Python ile her adım için '
              '<code>(adım, kullanıcı, bir_önceki_adıma_göre_yüzde)</code> listesi döndür; ilk adımın yüzdesi 100.0, yüzdeler 1 ondalık. Hiç olay yoksa adımın sayısı 0 ve yüzdesi 0.0 olsun.</p>'
              '<p>Cihaz filtresini <b>parametreyle</b> ekle (sorguyu koşullu kur ama değeri asla metne gömme).</p>',
    input='<p><code>cihaz</code>: <code>None</code> ya da <code>web_events.device</code> değeri.</p>',
    output='<p><code>list</code> of <code>(str, int, float)</code>, 5 eleman.</p>',
    constraints='web_events 1412 satır',
    samples=[('huni()', 'Tüm cihazlarda huni.')],
    calls=['huni(\'mobile\')', 'huni(\'desktop\')', 'huni(\'buzdolabi\')'],
    start='''
        import veri

        ADIMLAR = ["visit", "product_view", "add_to_cart", "checkout", "purchase"]

        def huni(cihaz=None):
            con = veri.baglan("anadolu_market", tablolar=["web_events"])
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri

        ADIMLAR = ["visit", "product_view", "add_to_cart", "checkout", "purchase"]

        def huni(cihaz=None):
            con = veri.baglan("anadolu_market", tablolar=["web_events"])
            sorgu = "SELECT event_type, COUNT(DISTINCT user_id) FROM web_events"
            parametre = ()
            if cihaz is not None:
                sorgu += " WHERE device = ?"
                parametre = (cihaz,)
            sorgu += " GROUP BY event_type"
            sayim = dict(con.execute(sorgu, parametre).fetchall())
            sonuc, onceki = [], None
            for adim in ADIMLAR:
                n = sayim.get(adim, 0)
                if onceki is None:
                    yuzde = 100.0 if n else 0.0
                else:
                    yuzde = round(100 * n / onceki, 1) if onceki else 0.0
                sonuc.append((adim, n, yuzde))
                onceki = n
            return sonuc
        ''',
    editorial='<p><b>Dinamik ama güvenli sorgu:</b> Koşul <i>yapısını</i> (<code>WHERE device = ?</code>) Python\'da eklemek serbesttir; <i>değeri</i> her zaman parametre demetiyle gönder. '
              'Böylece tek fonksiyon hem filtreli hem filtresiz çalışır.</p>'
              '<p><b>COUNT(DISTINCT):</b> Bir kullanıcı 5 ürün görüntüleyebilir; huni kişi sayar, olay değil.</p>'
              '<p><b>Basit huni sınırı:</b> Bu yöntem adımların <i>sırasını</i> denetlemez (önce sepete ekleyip sonra ziyaret eden kullanıcı da sayılır). '
              'Sıralı huni için her kullanıcının olaylarını zamana göre gezip adımları sırayla eşlemek gerekir.</p>'
              '<p><b>Sıfıra bölme:</b> Önceki adımda kullanıcı yoksa oran tanımsızdır; 0.0 ile kapattık.</p>',
    hints=['Sorguyu parça parça kur; <code>WHERE device = ?</code> yalnız cihaz verilince eklenir.', '<code>COUNT(DISTINCT user_id)</code>',
           '<code>sayim.get(adim, 0)</code> ve önceki adım sayısıyla oran.'],
))

P.append(dict(
    id='a-249', title='Yöneticinin tüm ekibi (özyinelemeli SQL)', track=S, diff='Zor', needs=NS,
    tags=['sqlite3', 'WITH RECURSIVE', 'hiyerarşi', 'CTE'], src='SQL recursive CTE — org chart sorgusu (LeetCode "All People Report to the Given Manager" fikri)',
    fn='ekip_buyuklugu', ds='pusula_ik',
    statement='<p>Pusula İK\'da her çalışanın <code>manager_id</code> sütunu doğrudan yöneticisini gösterir (Genel Müdür\'de boş). Bir yöneticinin <b>tüm</b> ekibi: doğrudan bağlıları, '
              'onların bağlıları, … şeklinde ağacın altındaki herkes.</p>'
              '<p><code>ekip_buyuklugu(emp_id, sadece_aktif=True)</code>: <code>WITH RECURSIVE</code> ile alt ağacı çıkar ve <code>(dogrudan, toplam, derinlik)</code> döndür: '
              '<code>dogrudan</code> = doğrudan bağlı sayısı, <code>toplam</code> = tüm alt ağaç (kendisi hariç), <code>derinlik</code> = en alt kademeye kadar seviye sayısı (ekip yoksa 0). '
              '<code>sadece_aktif=True</code> ise yalnız aktif (<code>term_date IS NULL</code>) çalışanları say <b>ve</b> ağaçta yalnız aktifler üzerinden in (ayrılmış bir yöneticinin altı sayılmaz).</p>',
    input='<p><code>emp_id</code>: int; <code>sadece_aktif</code>: bool.</p>',
    output='<p><code>tuple</code>: <code>(int, int, int)</code></p>',
    constraints='ik_employees 2199 satır',
    samples=[('ekip_buyuklugu(1)', 'Genel Müdür\'ün aktif organizasyonu.')],
    calls=['ekip_buyuklugu(1, False)', 'ekip_buyuklugu(2)', 'ekip_buyuklugu(3)', 'ekip_buyuklugu(2199)'],
    start='''
        import veri

        def ekip_buyuklugu(emp_id, sadece_aktif=True):
            con = veri.baglan("pusula_ik", tablolar=["ik_employees"])
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri

        def ekip_buyuklugu(emp_id, sadece_aktif=True):
            con = veri.baglan("pusula_ik", tablolar=["ik_employees"])
            filtre = "AND e.term_date IS NULL" if sadece_aktif else ""
            sorgu = f"""
                WITH RECURSIVE ekip(emp_id, seviye) AS (
                    SELECT e.emp_id, 1 FROM ik_employees e
                    WHERE e.manager_id = ? {filtre}
                    UNION
                    SELECT e.emp_id, k.seviye + 1
                    FROM ik_employees e
                    JOIN ekip k ON e.manager_id = k.emp_id
                    WHERE 1 = 1 {filtre}
                )
                SELECT COALESCE(SUM(seviye = 1), 0), COUNT(*), COALESCE(MAX(seviye), 0) FROM ekip
            """
            return tuple(con.execute(sorgu, (emp_id,)).fetchone())
        ''',
    editorial='<p><b>WITH RECURSIVE:</b> İki parça: <i>çapa</i> (anchor) sorgu doğrudan bağlıları seçer; <i>özyinelemeli</i> parça, CTE\'nin kendisiyle join yaparak bir alt kademeyi ekler. '
              'Yeni satır gelmeyince durur. <code>seviye</code> sütunu derinliği taşır.</p>'
              '<p><b>UNION vs UNION ALL:</b> <code>UNION</code> tekrarları eler; hatalı veride döngü (A→B→A) olsa bile sonsuza gitmez. Ağaç kesinse <code>UNION ALL</code> daha hızlıdır.</p>'
              '<p><b>f-string ama güvenli:</b> Sorguya eklenen <code>filtre</code> metni kullanıcıdan gelmiyor, kodda sabit; kullanıcı değeri (<code>emp_id</code>) yine <code>?</code> ile gidiyor.</p>'
              '<p><b>SUM(koşul):</b> SQLite\'ta karşılaştırma 1/0 döndürür, <code>SUM(seviye = 1)</code> doğrudan bağlı sayısını verir. Boş CTE\'de SUM/MAX NULL döner; <code>COALESCE</code> 0 yapar.</p>'
              '<p><b>Python alternatifi:</b> a-203\'teki gibi komşuluk listesi + BFS. SQL sürümü veri tabanından ayrılmadan çalışır ve büyük tablolarda indeksle hızlanır.</p>',
    hints=['Çapa: <code>WHERE manager_id = ?</code>; özyineleme: <code>JOIN ekip k ON e.manager_id = k.emp_id</code>.', 'Seviyeyi CTE\'de taşı: <code>k.seviye + 1</code>.',
           'Sonuç: <code>SUM(seviye = 1)</code>, <code>COUNT(*)</code>, <code>MAX(seviye)</code>; boş durum için <code>COALESCE</code>.'],
))

P.append(dict(
    id='a-250', title='Aktarmalı uçuş seçenekleri', track=S, diff='Zor', needs=NS,
    tags=['sqlite3', 'self join', 'julianday', 'zaman aralığı'], src='Uçuş arama motoru: tek aktarmalı bağlantı (self join)',
    fn='aktarmali_secenekler', ds='kanat_havayollari',
    statement='<p>Kanat Havayolları web sitesi, direkt uçuş olmayan şehir çiftleri için <b>tek aktarmalı</b> seçenekler göstermek istiyor.</p>'
              '<p><code>aktarmali_secenekler(kalkis, varis, ay, min_dk=45, max_dk=180)</code>: SQL ile <code>hv_flights</code>\'ı (rotalar için <code>hv_routes</code>) kendisiyle birleştir:</p>'
              '<ul><li>1. bacak <code>kalkis</code>\'ten kalkar ve <code>sched_dep</code>\'i <code>ay</code> (<code>"YYYY-MM"</code>) ayındadır.</li>'
              '<li>2. bacak 1. bacağın indiği havalimanından kalkar ve <code>varis</code>\'e iner; aktarma havalimanı <code>kalkis</code> ya da <code>varis</code> olamaz.</li>'
              '<li>Aktarma süresi = 2. bacak <code>sched_dep</code> − 1. bacak <code>sched_arr</code>, <code>min_dk ≤ süre ≤ max_dk</code>.</li>'
              '<li>İki bacak da <code>cancelled</code> olmamalı.</li></ul>'
              '<p>Sonuç: <code>[(tarih, ucus1, aktarma_kodu, ucus2, toplam_dk), ...]</code>; <code>tarih</code> 1. bacağın kalkış günü (<code>"YYYY-MM-DD"</code>), uçuşlar <code>flight_no</code>, '
              'toplam = 2. bacak <code>sched_arr</code> − 1. bacak <code>sched_dep</code> (tamsayı dakika). Sıralama: toplam süreye göre artan, eşitlikte 1. bacağın kalkış zamanına göre.</p>',
    input='<p>Havalimanı kodları, ay ve aktarma süresi sınırları (dakika).</p>',
    output='<p><code>list</code> of <code>(str, str, str, str, int)</code></p>',
    constraints='hv_flights 3173, hv_routes 45 satır',
    samples=[('aktarmali_secenekler(\'ESB\', \'FRA\', \'2024-10\')[:3]', 'Ekim 2024\'te Ankara → Frankfurt, en kısa üç aktarmalı seçenek.')],
    calls=['len(aktarmali_secenekler(\'ESB\', \'FRA\', \'2024-10\'))', 'aktarmali_secenekler(\'ADA\', \'GZT\', \'2024-11\', 60, 90)',
           'aktarmali_secenekler(\'AYT\', \'GZT\', \'2024-12\')[-2:]', 'aktarmali_secenekler(\'ESB\', \'IST\', \'2024-10\')', 'len(aktarmali_secenekler(\'TZX\', \'ERZ\', \'2024-09\', 0, 600))'],
    start='''
        import veri

        def aktarmali_secenekler(kalkis, varis, ay, min_dk=45, max_dk=180):
            con = veri.baglan("kanat_havayollari", tablolar=["hv_flights", "hv_routes"])
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri

        def aktarmali_secenekler(kalkis, varis, ay, min_dk=45, max_dk=180):
            con = veri.baglan("kanat_havayollari", tablolar=["hv_flights", "hv_routes"])
            sorgu = """
                WITH u AS (
                    SELECT f.flight_no, f.sched_dep, f.sched_arr, f.status, r.origin, r.dest
                    FROM hv_flights f JOIN hv_routes r ON r.route_id = f.route_id
                    WHERE f.status <> 'cancelled'
                )
                SELECT date(a.sched_dep), a.flight_no, a.dest, b.flight_no,
                       CAST(ROUND((julianday(b.sched_arr) - julianday(a.sched_dep)) * 1440) AS INTEGER) AS toplam
                FROM u a
                JOIN u b ON b.origin = a.dest
                WHERE a.origin = :kalkis AND b.dest = :varis
                  AND a.dest NOT IN (:kalkis, :varis)
                  AND substr(a.sched_dep, 1, 7) = :ay
                  AND ROUND((julianday(b.sched_dep) - julianday(a.sched_arr)) * 1440) BETWEEN :mn AND :mx
                ORDER BY toplam, a.sched_dep
            """
            return con.execute(sorgu, {"kalkis": kalkis, "varis": varis, "ay": ay, "mn": min_dk, "mx": max_dk}).fetchall()
        ''',
    editorial='<p><b>Self join:</b> Aynı uçuş kümesini <code>a</code> (1. bacak) ve <code>b</code> (2. bacak) olarak iki kez kullanırız; bağlantı koşulu <code>b.origin = a.dest</code>. '
              'Ortak hazırlığı (rota bilgisi + iptal filtresi) bir CTE\'de (<code>WITH u AS ...</code>) yapmak sorguyu sadeleştirir.</p>'
              '<p><b>Zaman farkı:</b> SQLite\'ta <code>julianday</code> gün cinsinden ondalık sayı verir; ×1440 dakikaya çevirir. Kayan nokta artıkları (44.99999) yüzünden '
              '<code>ROUND</code> şart, yoksa tam 45 dakikalık aktarma sınırda kaybolabilir.</p>'
              '<p><b>Adlandırılmış parametreler:</b> Aynı değer sorguda birden çok kez geçince <code>:kalkis</code> biçimi ve sözlük, sırayla <code>?</code> saymaktan daha okunur ve güvenlidir.</p>'
              '<p><b>Neden aktarma ≠ kalkış/varış?</b> ESB→IST→ESB→… gibi anlamsız döngüleri ve "varışa uğrayıp geri dönen" seçenekleri eler.</p>'
              '<p><b>Not:</b> Tüm saatler yerel saat olarak kabul edildi; uluslararası bağlantılarda saat dilimleri (<code>hv_airports.tz_offset</code>) hesaba katılmalıdır.</p>',
    hints=['Uçuş + rota bilgisini bir CTE\'de hazırla, sonra CTE\'yi kendisiyle join et.', 'Aktarma: <code>(julianday(b.sched_dep) - julianday(a.sched_arr)) * 1440</code>',
           'Aynı değeri çok kez kullanmak için <code>:ad</code> parametreleri ve sözlük.'],
))

if __name__ == '__main__':
    main(P, '/home/claude/py/v3/a4/arena_04.js')
