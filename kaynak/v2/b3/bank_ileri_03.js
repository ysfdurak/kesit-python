/* Kesit Python — pratik bankası: ileri görevler (b-331 … b-340) */
(function (W) {
'use strict';
const B = W.PY_BANK = W.PY_BANK || [];
B.push(
  {
    id: 'b-331',
    lv: 'ileri',
    topic: 'İstatistik',
    diff: 2,
    kind: 'yaz',
    needs: ['scipy', 'numpy'],
    title: 'Teslim süresi için güven aralığı',
    q: '<p>Lojistik ekibi kargo teslim sürelerinin (saat) ortalaması için güven aralığı istiyor. <code>guven_araligi(veri, guven=0.95)</code> fonksiyonunu yaz: örneklem ortalaması ± <i>t</i> kritik değeri × standart hata formülüyle <code>(alt, ust)</code> demetini 2 ondalık döndürsün. Standart sapmada <b>örneklem</b> formülünü (ddof=1) kullan. 2\'den az gözlemde <code>ValueError</code> fırlat.</p>',
    start: 'import numpy as np\nfrom scipy import stats\n\ndef guven_araligi(veri, guven=0.95):\n    pass\n',
    sol: 'import numpy as np\nfrom scipy import stats\n\ndef guven_araligi(veri, guven=0.95):\n    x = np.asarray(veri, dtype=float)\n    n = len(x)\n    if n < 2:\n        raise ValueError("En az 2 gözlem gerekli")\n    ort = x.mean()\n    se = x.std(ddof=1) / np.sqrt(n)\n    tkrit = stats.t.ppf((1 + guven) / 2, df=n - 1)\n    return round(float(ort - tkrit * se), 2), round(float(ort + tkrit * se), 2)\n',
    tests: 'v = [42, 50, 47, 55, 48, 52, 46, 51]\nalt, ust = guven_araligi(v)\nassert (alt, ust) == (45.52, 52.23), f"%95 aralık (45.52, 52.23) olmalı; gelen {(alt, ust)}. ddof=1 ve t.ppf((1+guven)/2, n-1) kullandın mı?"\na90 = guven_araligi(v, 0.90)\nassert a90[0] > alt and a90[1] < ust, "%90 güven aralığı %95\'ten dar olmalı"\nassert isinstance(alt, float), "Python float döndür"\ntry:\n    guven_araligi([5])\n    assert False, "Tek gözlemde ValueError bekleniyordu"\nexcept ValueError:\n    pass\n',
    hints: ['Standart hata = s / √n, s örneklem standart sapması (<code>std(ddof=1)</code>).', 'İki yanlı aralıkta kritik değer <code>stats.t.ppf((1 + guven) / 2, df=n - 1)</code>.', 'Kısa yol: <code>stats.t.interval(guven, n - 1, loc=ort, scale=se)</code>.'],
    why: 'Popülasyon varyansı bilinmediğinde ve n küçükken z yerine t dağılımı kullanılır; serbestlik derecesi n−1. Hesap O(n). Güven aralığı "gerçek ortalama %95 olasılıkla buradadır" değil, "bu yöntem tekrarlandığında aralıkların %95’i gerçek ortalamayı kapsar" demektir. Alternatifler: stats.t.interval; çarpık veride bootstrap aralığı; çok büyük n’de z (stats.norm.ppf) ile neredeyse aynı sonuç.',
    tags: ['güven aralığı', 't dağılımı', 'ddof'],
    min: 6
  },

  {
    id: 'b-332',
    lv: 'ileri',
    topic: 'İstatistik',
    diff: 2,
    kind: 'bug',
    needs: ['scipy', 'numpy'],
    title: 'Ki-kare testine yüzde verilmiş',
    q: '<p>Kodda bir hata var, bul ve düzelt. <code>donusum_testi(tablo, alfa)</code> iki kampanyanın dönüşüm oranları arasında fark olup olmadığını ki-kare bağımsızlık testiyle ölçüyor. <code>tablo</code> her satırı bir kampanya olan <code>[dönüşen, dönüşmeyen]</code> <b>sayılarıdır</b>. Fonksiyon <code>(p 4 ondalık, anlamli)</code> döndürmeli ama binlerce müşteriyle yapılan testte bile p-değeri gereğinden büyük çıkıyor.</p>',
    start: 'import numpy as np\nfrom scipy import stats\n\ndef donusum_testi(tablo, alfa=0.05):\n    t = np.asarray(tablo, dtype=float)\n    oranlar = t / t.sum(axis=1, keepdims=True) * 100\n    chi2, p, dof, beklenen = stats.chi2_contingency(oranlar)\n    return round(float(p), 4), bool(p < alfa)\n',
    sol: 'import numpy as np\nfrom scipy import stats\n\ndef donusum_testi(tablo, alfa=0.05):\n    t = np.asarray(tablo, dtype=float)\n    chi2, p, dof, beklenen = stats.chi2_contingency(t)\n    return round(float(p), 4), bool(p < alfa)\n',
    tests: 'from scipy import stats as _st\ntablo = [[120, 880], [165, 835]]\np, karar = donusum_testi(tablo)\np0 = _st.chi2_contingency(tablo)[1]\nassert abs(p - round(p0, 4)) < 1e-4, f"p {round(p0, 4)} olmalı; gelen {p}. Ki-kare SAYILARLA çalışır, yüzdeye çevirmek örneklem büyüklüğünü siler"\nassert karar is True, "2000 müşteride %12 ve %16.5 dönüşüm farkı anlamlı olmalı"\np2, k2 = donusum_testi([[10, 90], [11, 89]])\nassert k2 is False, "Küçük ve yakın oranlar anlamlı çıkmamalı"\n',
    hints: ['Ki-kare istatistiği gözlenen ve beklenen <b>frekanslar</b> arasındaki farka dayanır.', 'Yüzdeye çevirince her satır 100 kişi gibi davranır; 1000 kişilik bilgi kaybolur.', 'Oran satırını sil, <code>chi2_contingency(t)</code> çağır.'],
    why: 'Ki-kare istatistiği Σ(gözlenen − beklenen)² / beklenen ile hesaplanır ve sayılarla ölçeklenir: aynı oranlar 10 kat daha çok müşteriyle 10 kat büyük istatistik verir. Yüzdeye çevirmek n’yi yapay olarak 100’e indirir, testin gücünü öldürür. Hesap O(r·c). 2×2 tabloda scipy varsayılan olarak Yates süreklilik düzeltmesi uygular (correction=True). Alternatif: iki oran z-testi (statsmodels proportions_ztest) ya da küçük sayılarda stats.fisher_exact.',
    tags: ['chi2_contingency', 'ki-kare', 'dönüşüm oranı'],
    min: 5
  },

  {
    id: 'b-333',
    lv: 'ileri',
    topic: 'İstatistik',
    diff: 3,
    kind: 'yaz',
    needs: ['scipy', 'numpy'],
    title: 'Spearman korelasyonunu elle kur',
    q: '<p>Reklam harcaması ile satış arasındaki ilişkide bir aykırı kampanya Pearson katsayısını bozuyor; ekip sıra tabanlı Spearman korelasyonunu kullanmaya karar verdi. <code>spearman(x, y)</code> fonksiyonunu <b>scipy.stats.spearmanr kullanmadan</b> yaz: iki diziyi sıralara (rank) çevir — eşit değerlere <b>ortalama sıra</b> ver — ve sıralar arasındaki Pearson korelasyonunu 4 ondalık döndür. <code>scipy.stats.rankdata</code> ve <code>np.corrcoef</code> kullanabilirsin.</p>',
    start: 'import numpy as np\nfrom scipy import stats\n\ndef spearman(x, y):\n    pass\n',
    sol: 'import numpy as np\nfrom scipy import stats\n\ndef spearman(x, y):\n    rx = stats.rankdata(x)          # eşitlere ortalama sıra\n    ry = stats.rankdata(y)\n    return round(float(np.corrcoef(rx, ry)[0, 1]), 4)\n',
    tests: 'from scipy import stats as _st\nreklam = [10, 20, 30, 40, 50, 60]\nsatis = [100, 180, 260, 300, 330, 5000]\nr = spearman(reklam, satis)\nassert r == 1.0, f"Satış reklamla tam monoton artıyor → Spearman 1.0; gelen {r}"\np = _st.pearsonr(reklam, satis)[0]\nassert p < 0.8, "(Bilgi) Pearson aykırı değer yüzünden 1\'den çok uzak"\nx = [3, 1, 4, 1, 5, 9, 2, 6]\ny = [2, 7, 1, 8, 2, 8, 1, 8]\nbeklenen = round(float(_st.spearmanr(x, y)[0]), 4)\nassert spearman(x, y) == beklenen, f"Eşitlikli veride {beklenen} olmalı; eşit değerlere ortalama sıra verdin mi (rankdata)?"\nassert "spearmanr" not in __source__, "spearmanr kullanma; sıraları kendin hesapla"\n',
    hints: ['Spearman katsayısı = sıraların Pearson korelasyonu.', '<code>stats.rankdata([10, 20, 20])</code> → <code>[1., 2.5, 2.5]</code> (eşitlere ortalama sıra).', '<code>np.corrcoef(rx, ry)[0, 1]</code> iki dizi arasındaki korelasyonu verir.'],
    why: 'Spearman verinin büyüklüğünü değil sırasını kullandığı için aykırı değerlere dayanıklıdır ve doğrusal olmayan ama monoton ilişkileri yakalar (burada 1.0), Pearson ise 5000’lik kampanya yüzünden düşer. Sıralama O(n log n), korelasyon O(n). Eşitlik yoksa kısa formül 1 − 6Σd² / (n(n²−1)) de kullanılabilir ama eşitlikte yanlış verir; sıraların Pearson’ı her durumda doğrudur. Alternatifler: stats.spearmanr, pandas df.corr(method="spearman"), Kendall tau (stats.kendalltau).',
    tags: ['Spearman', 'rankdata', 'korelasyon', 'aykırı değer'],
    min: 9
  },

  {
    id: 'b-334',
    lv: 'ileri',
    topic: 'İstatistik',
    diff: 2,
    kind: 'tamamla',
    needs: ['numpy'],
    title: 'Bootstrap ile güven aralığı',
    q: '<p>Sepet tutarları çarpık dağıldığı için ekip formül yerine <b>bootstrap</b> ile ortalamanın güven aralığını çıkarıyor: veriden <b>yerine koyarak</b> n elemanlı örneklemler çek, her birinin ortalamasını al, ortalamaların yüzdeliklerini aralık olarak kullan. <code>bootstrap_ga</code> fonksiyonundaki <code>___</code> boşluklarını doldur.</p>',
    start: 'import numpy as np\n\ndef bootstrap_ga(veri, n_tekrar=2000, guven=0.95, tohum=42):\n    rng = np.random.default_rng(tohum)\n    x = np.asarray(veri, dtype=float)\n    ornekler = rng.choice(x, size=(n_tekrar, len(x)), replace=___)\n    ortalamalar = ornekler.mean(axis=___)\n    alfa = (1 - guven) / 2\n    alt, ust = np.quantile(ortalamalar, [alfa, 1 - alfa])\n    return round(float(alt), 2), round(float(ust), 2)\n',
    sol: 'import numpy as np\n\ndef bootstrap_ga(veri, n_tekrar=2000, guven=0.95, tohum=42):\n    rng = np.random.default_rng(tohum)\n    x = np.asarray(veri, dtype=float)\n    ornekler = rng.choice(x, size=(n_tekrar, len(x)), replace=True)\n    ortalamalar = ornekler.mean(axis=1)\n    alfa = (1 - guven) / 2\n    alt, ust = np.quantile(ortalamalar, [alfa, 1 - alfa])\n    return round(float(alt), 2), round(float(ust), 2)\n',
    tests: 'sepet = [120, 85, 60, 2400, 150, 95, 70, 310, 45, 130, 88, 99]\nalt, ust = bootstrap_ga(sepet)\nort = sum(sepet) / len(sepet)\nassert alt < ort < ust, f"Ortalama ({ort:.2f}) aralığın içinde olmalı; gelen {(alt, ust)}"\nassert ust - alt > 50, "Aralık genişliği sıfır olmamalı: yerine koymadan (replace=False) çekersen her örnek aynı ortalamayı verir"\nassert bootstrap_ga(sepet) == (alt, ust), "Aynı tohumla sonuç tekrarlanabilir olmalı"\na90 = bootstrap_ga(sepet, guven=0.90)\nassert a90[1] - a90[0] < ust - alt, "%90 aralık %95\'ten dar olmalı"\nassert bootstrap_ga([50, 50, 50]) == (50.0, 50.0), "Sabit veride aralık tek noktaya iner"\n',
    hints: ['Bootstrap\'in özü yerine koyarak örneklemedir: aynı gözlem bir örneklemde birden çok kez çıkabilir.', 'Matris (n_tekrar, n) şeklinde; her SATIR bir bootstrap örneklemi.', '<code>replace=True</code>, <code>mean(axis=1)</code>'],
    why: 'Bootstrap, dağılım varsayımı yapmadan örneklem dağılımını veriden yeniden örnekleyerek taklit eder; çarpık veride t-aralığından daha gerçekçidir. Tek matris çekimi ile B×n işlem vektörel yapılır: O(B·n) zaman ve bellek. Çok büyük B·n’de parçalı döngü kullanılır. Alternatif: scipy.stats.bootstrap (BCa yöntemi ile daha isabetli aralık). Tohum (seed) sonucun tekrarlanabilir olmasını sağlar.',
    tags: ['bootstrap', 'default_rng', 'quantile'],
    min: 5
  },

  {
    id: 'b-335',
    lv: 'ileri',
    topic: 'scikit-learn',
    diff: 2,
    kind: 'predict',
    t: 'predict',
    needs: ['scikit-learn'],
    title: 'train_test_split kaç satır ayırır?',
    q: '<p>10 satırlık veriyi %25 test olacak şekilde bölen bu kod ne yazdırır?</p>',
    code: 'from sklearn.model_selection import train_test_split\n\nX = [[i] for i in range(10)]\ny = [0, 1] * 5\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0)\nprint(len(X_tr), len(X_te))\nprint(type(X_te).__name__)\n',
    o: ['7.5 2.5\nlist', '7 3\nlist', '8 2\nlist', '7 3\nndarray'],
    a: 1,
    hints: ['Test kümesi boyutu kesirli çıkarsa yukarı yuvarlanır (ceil).', 'Girdi Python listesi ise çıktılar da liste olarak döner.'],
    why: 'test_size=0.25 × 10 = 2.5 → test için yukarı yuvarlanır (3), eğitim kalan 7 olur. scikit-learn girdinin türünü korur: liste verirsen liste, DataFrame verirsen DataFrame döner. Sınıf oranlarını korumak için stratify=y eklenir; zaman serisinde rastgele bölme yerine TimeSeriesSplit ya da tarihe göre kesme yapılır, yoksa gelecek bilgisi eğitime sızar.',
    tags: ['train_test_split', 'test_size'],
    min: 3
  },

  {
    id: 'b-336',
    lv: 'ileri',
    topic: 'scikit-learn',
    diff: 2,
    kind: 'order',
    t: 'order',
    needs: ['scikit-learn'],
    title: 'Ölçekleme + lojistik regresyon hattı',
    q: '<p>Kredi başvurularını (gelir puanı, gecikme günü) sınıflandıran bir <code>Pipeline</code> kuran, eğiten, iki yeni başvuruyu tahmin eden ve ölçekleyicinin öğrendiği ortalamaları yazdıran programın satırlarını sırala.</p>',
    lines: ['from sklearn import linear_model, pipeline, preprocessing', 'adimlar = [("olcek", preprocessing.StandardScaler()), ("model", linear_model.LogisticRegression())]', 'model = pipeline.Pipeline(adimlar)', 'model.fit([[1, 20], [2, 18], [8, 3], [9, 1], [2, 25], [10, 2]], [0, 0, 1, 1, 0, 1])', 'tahmin = model.predict([[7, 4], [1, 22]])', 'print(tahmin.tolist(), model.named_steps["olcek"].mean_.round(2).tolist())'],
    expect: '[1, 0] [5.33, 11.5]\n',
    hints: ['Adımlar listesi Pipeline kurulmadan önce hazır olmalı.', 'predict ancak fit\'ten sonra çağrılabilir; mean_ de fit sırasında öğrenilir.'],
    why: 'Pipeline adımları ("ad", nesne) çiftleri olarak alır; fit önce ölçekleyiciyi eğitim verisine uydurur (fit_transform), sonra dönüştürülmüş veriyle modeli eğitir. predict aynı dönüşümü (eğitimde öğrenilen ortalama/std ile) uygular, böylece test verisi sızıntısı olmaz. named_steps ile ara adımlara erişilir. Kısa yazım: make_pipeline(StandardScaler(), LogisticRegression()).',
    tags: ['Pipeline', 'StandardScaler', 'LogisticRegression'],
    min: 4
  },

  {
    id: 'b-337',
    lv: 'ileri',
    topic: 'scikit-learn',
    diff: 2,
    kind: 'rehberli',
    needs: ['scikit-learn', 'numpy'],
    title: 'Reklam harcamasından satış tahmini',
    q: '<p><code>reklam_modeli(harcama, satis)</code> fonksiyonunu yaz: haftalık reklam harcaması (bin TL) ve satış (adet) listeleriyle bir <code>LinearRegression</code> modeli eğitsin ve <code>(egim, kesisim, tahmin_100)</code> demetini 2 ondalık döndürsün; <code>tahmin_100</code> 100 bin TL harcamada beklenen satıştır.</p>',
    guide: ['scikit-learn özellik matrisi (X) için 2 boyut ister: harcamayı <code>(n, 1)</code> şekline getir.', '<code>LinearRegression().fit(X, y)</code> ile eğit.', 'Eğim <code>coef_[0]</code>, kesişim <code>intercept_</code> içindedir.', 'Tahmin için de 2 boyutlu girdi ver: <code>[[100]]</code>.', 'Değerleri <code>float</code> yapıp 2 ondalığa yuvarla.'],
    example: 'import numpy as np\nfrom sklearn.linear_model import LinearRegression\nsicaklik = np.array([20, 25, 30, 35]).reshape(-1, 1)\ndondurma = [200, 260, 310, 370]\nm = LinearRegression().fit(sicaklik, dondurma)\nprint(m.coef_, m.intercept_, m.predict([[28]]))\n',
    start: 'import numpy as np\nfrom sklearn.linear_model import LinearRegression\n\ndef reklam_modeli(harcama, satis):\n    X = np.asarray(harcama, dtype=float)\n    # TODO 1: X\'i (n, 1) şekline getir\n    # TODO 2: modeli eğit\n    # TODO 3: eğim, kesişim ve 100 için tahmini al\n    # TODO 4: 2 ondalık float demet döndür\n    return None\n',
    sol: 'import numpy as np\nfrom sklearn.linear_model import LinearRegression\n\ndef reklam_modeli(harcama, satis):\n    X = np.asarray(harcama, dtype=float).reshape(-1, 1)\n    m = LinearRegression().fit(X, satis)\n    egim = round(float(m.coef_[0]), 2)\n    kesisim = round(float(m.intercept_), 2)\n    tahmin = round(float(m.predict([[100]])[0]), 2)\n    return egim, kesisim, tahmin\n',
    tests: 'r = reklam_modeli([10, 20, 30, 40, 50], [130, 170, 205, 250, 290])\nassert r is not None and len(r) == 3, "(egim, kesisim, tahmin_100) demeti döndür"\negim, kes, t100 = r\nassert abs(egim - 4.0) < 1e-9, f"Eğim 4.0 olmalı (her bin TL ~4 adet); gelen {egim}"\nassert abs(kes - 89.0) < 1e-9, f"Kesişim 89.0 olmalı; gelen {kes}"\nassert abs(t100 - 489.0) < 1e-9, f"100 bin TL\'de tahmin 489.0 olmalı; gelen {t100}"\nassert all(isinstance(v, float) for v in r), "Python float döndür"\n',
    hints: ['Tek özellikli veride <code>reshape(-1, 1)</code> sütun vektörü üretir.', '<code>m = LinearRegression().fit(X, satis)</code>; sonra <code>m.coef_[0]</code>, <code>m.intercept_</code>.', 'Tahmin: <code>m.predict([[100]])[0]</code>.'],
    why: 'scikit-learn’de X her zaman (örnek, özellik) şeklinde 2 boyutludur; 1 boyutlu dizi verirsen "Expected 2D array" hatası alırsın. En küçük kareler çözümü tek özellikte O(n). Eğim "1 bin TL ek reklam ≈ 4 adet ek satış" diye yorumlanır, ama bu korelasyondur; nedensellik için deney (A/B) gerekir. Alternatifler: np.polyfit(x, y, 1), scipy.stats.linregress (p-değeri ve r ile), statsmodels OLS (ayrıntılı istatistik özeti).',
    tags: ['LinearRegression', 'reshape', 'regresyon'],
    min: 6
  },

  {
    id: 'b-338',
    lv: 'ileri',
    topic: 'scikit-learn',
    diff: 3,
    kind: 'bug',
    needs: ['scikit-learn', 'numpy'],
    title: 'Ölçekleyici test verisini görüyor (sızıntı)',
    q: '<p>Kodda bir hata var, bul ve düzelt. <code>olcekle(X_egitim, X_test)</code> özellikleri standartlaştırıp <code>(X_egitim_olcekli, X_test_olcekli, scaler)</code> döndürüyor. Kod çalışıyor ama ölçekleyici <b>test verisinden de</b> öğreniyor; bu, modelin canlıda göreceğinden daha iyi skor üretmesine (veri sızıntısı, data leakage) yol açar.</p>',
    start: 'import numpy as np\nfrom sklearn.preprocessing import StandardScaler\n\ndef olcekle(X_egitim, X_test):\n    scaler = StandardScaler()\n    scaler.fit(np.vstack([X_egitim, X_test]))\n    return scaler.transform(X_egitim), scaler.transform(X_test), scaler\n',
    sol: 'import numpy as np\nfrom sklearn.preprocessing import StandardScaler\n\ndef olcekle(X_egitim, X_test):\n    scaler = StandardScaler()\n    X_egitim_o = scaler.fit_transform(X_egitim)\n    return X_egitim_o, scaler.transform(X_test), scaler\n',
    tests: 'Xe = np.array([[10.0, 1.0], [20.0, 3.0], [30.0, 5.0]])\nXt = np.array([[1000.0, 50.0]])\na, b, s = olcekle(Xe, Xt)\nassert np.allclose(s.mean_, [20.0, 3.0]), f"Ölçekleyici yalnız eğitim verisinden öğrenmeli: mean_ [20, 3] olmalı, gelen {s.mean_}"\nassert np.allclose(a.mean(axis=0), 0), "Eğitim verisi ölçeklenince sütun ortalamaları 0 olmalı"\nassert b[0, 0] > 10, "Test satırı eğitim dağılımına göre çok uç; büyük z-skoru almalı"\n',
    hints: ['Ölçekleyici ortalama ve standart sapmayı <code>fit</code> sırasında öğrenir.', 'fit\'e yalnız eğitim verisi girmeli; test verisine sadece <code>transform</code> uygulanır.', '<code>scaler.fit_transform(X_egitim)</code> ve <code>scaler.transform(X_test)</code>'],
    why: 'Test verisi modelin hiç görmediği geleceği temsil eder; ölçekleme, eksik değer doldurma, kodlama gibi her öğrenen adım yalnız eğitim verisiyle fit edilmelidir. Aksi hâlde istatistikler testten bilgi taşır ve doğrulama skoru iyimser olur. En sağlam çözüm adımları Pipeline içine koymak: cross_val_score her katmanda fit’i otomatik olarak yalnız eğitim katmanına uygular. Maliyet: fit O(n·d), transform O(n·d).',
    tags: ['data leakage', 'StandardScaler', 'fit_transform'],
    min: 5
  },

  {
    id: 'b-339',
    lv: 'ileri',
    topic: 'scikit-learn',
    diff: 2,
    kind: 'yaz',
    needs: ['scikit-learn'],
    title: 'Sahtecilik modeli: precision, recall, F1',
    q: '<p>Ilgaz Bank sahte işlem modelinin sonuçlarını raporluyor (1 = sahte). <code>metrikler(y_gercek, y_tahmin)</code> fonksiyonunu <b>sklearn.metrics kullanmadan</b> yaz: TP, FP, FN sayılarından <code>{"precision", "recall", "f1"}</code> sözlüğünü 3 ondalık döndürsün. Payda 0 olursa ilgili metrik 0.0 olsun.</p>',
    start: 'def metrikler(y_gercek, y_tahmin):\n    pass\n',
    sol: 'def metrikler(y_gercek, y_tahmin):\n    tp = sum(1 for g, t in zip(y_gercek, y_tahmin) if g == 1 and t == 1)\n    fp = sum(1 for g, t in zip(y_gercek, y_tahmin) if g == 0 and t == 1)\n    fn = sum(1 for g, t in zip(y_gercek, y_tahmin) if g == 1 and t == 0)\n    p = tp / (tp + fp) if tp + fp else 0.0\n    r = tp / (tp + fn) if tp + fn else 0.0\n    f1 = 2 * p * r / (p + r) if p + r else 0.0\n    return {"precision": round(p, 3), "recall": round(r, 3), "f1": round(f1, 3)}\n',
    tests: 'from sklearn.metrics import precision_score, recall_score, f1_score\ng = [0, 0, 1, 1, 0, 1, 0, 0, 1, 0]\nt = [0, 1, 1, 0, 0, 1, 0, 0, 1, 1]\nm = metrikler(g, t)\nassert m["precision"] == round(precision_score(g, t), 3) == 0.6, f"precision = TP/(TP+FP) = 3/5 = 0.6; gelen {m[\'precision\']}"\nassert m["recall"] == round(recall_score(g, t), 3) == 0.75, f"recall = TP/(TP+FN) = 3/4 = 0.75; gelen {m[\'recall\']}"\nassert m["f1"] == round(f1_score(g, t), 3), f"f1 = 2PR/(P+R) ≈ 0.667; gelen {m[\'f1\']}"\nz = metrikler([0, 0, 1], [0, 0, 0])\nassert z == {"precision": 0.0, "recall": 0.0, "f1": 0.0}, "Hiç pozitif tahmin yoksa sıfıra bölme yerine 0.0"\nassert "sklearn" not in __source__, "Metrikleri kendin hesapla"\n',
    hints: ['TP: gerçek 1, tahmin 1; FP: gerçek 0, tahmin 1; FN: gerçek 1, tahmin 0.', 'precision = TP/(TP+FP), recall = TP/(TP+FN), F1 bunların harmonik ortalaması.', 'Paydaları <code>if tp + fp else 0.0</code> gibi koşullu ifadeyle koru.'],
    why: 'Dengesiz veride (sahte işlem nadir) doğruluk (accuracy) yanıltıcıdır: hep "0" diyen model %99 doğru çıkar. Precision "alarm verdiklerimizin ne kadarı gerçekten sahte", recall "sahtelerin ne kadarını yakaladık" sorusunu yanıtlar; F1 ikisini dengeler. Tek geçiş O(n). Alternatif: sklearn.metrics.precision_recall_fscore_support(zero_division=0) ya da classification_report; eşik seçimi için precision_recall_curve.',
    tags: ['precision', 'recall', 'F1', 'karışıklık matrisi'],
    min: 6
  },

  {
    id: 'b-340',
    lv: 'ileri',
    topic: 'scikit-learn',
    diff: 3,
    kind: 'yaz',
    needs: ['scikit-learn', 'pandas'],
    title: 'Karma özellikli kredi modeli (ColumnTransformer)',
    q: '<p><code>kredi_modeli(df, y)</code> fonksiyonunu yaz: <code>df</code> sütunları <code>gelir</code>, <code>borc_orani</code> (sayısal) ve <code>sehir</code> (kategorik). Sayısal sütunları <code>StandardScaler</code>, şehri <code>OneHotEncoder(handle_unknown="ignore")</code> ile dönüştüren bir <code>ColumnTransformer</code> ve ardından <code>LogisticRegression</code> içeren bir <code>Pipeline</code> kur, eğit ve <b>eğitilmiş pipeline\'ı</b> döndür. Canlıda daha önce görülmemiş bir şehir gelince model hata vermemeli.</p>',
    start: 'import pandas as pd\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import OneHotEncoder, StandardScaler\n\ndef kredi_modeli(df, y):\n    pass\n',
    sol: 'import pandas as pd\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import OneHotEncoder, StandardScaler\n\ndef kredi_modeli(df, y):\n    on_isleme = ColumnTransformer([\n        ("sayisal", StandardScaler(), ["gelir", "borc_orani"]),\n        ("kategorik", OneHotEncoder(handle_unknown="ignore"), ["sehir"]),\n    ])\n    model = Pipeline([("on_isleme", on_isleme), ("model", LogisticRegression())])\n    return model.fit(df, y)\n',
    tests: 'df = pd.DataFrame({\n    "gelir": [45, 80, 30, 95, 25, 70, 60, 20, 88, 35],\n    "borc_orani": [0.2, 0.1, 0.7, 0.15, 0.8, 0.3, 0.25, 0.9, 0.05, 0.6],\n    "sehir": ["Ankara", "İzmir", "Ankara", "Bursa", "İzmir", "Bursa", "Ankara", "Bursa", "İzmir", "Ankara"],\n})\ny = [1, 1, 0, 1, 0, 1, 1, 0, 1, 0]\nm = kredi_modeli(df, y)\nassert isinstance(m, Pipeline), "Eğitilmiş bir Pipeline döndür"\nassert (m.predict(df) == y).mean() >= 0.9, "Bu ayrışabilir veride eğitim doğruluğu en az %90 olmalı"\nyeni = pd.DataFrame({"gelir": [90, 22], "borc_orani": [0.1, 0.85], "sehir": ["Trabzon", "Ankara"]})\ntry:\n    t = m.predict(yeni)\nexcept ValueError:\n    assert False, "Görülmemiş şehir (Trabzon) hata vermemeli: OneHotEncoder(handle_unknown=\'ignore\')"\nassert t.tolist() == [1, 0], f"Yüksek gelir/düşük borç onay (1), tersi ret (0) almalı; gelen {t.tolist()}"\n',
    hints: ['ColumnTransformer\'a <code>(ad, dönüştürücü, sütun_listesi)</code> üçlüleri verilir.', 'OneHotEncoder\'da <code>handle_unknown="ignore"</code> bilinmeyen kategoriyi tümü 0 vektörle temsil eder.', 'Pipeline([("on_isleme", ct), ("model", LogisticRegression())]).fit(df, y)'],
    why: 'ColumnTransformer farklı sütun türlerine farklı dönüşümü tek nesnede uygular; Pipeline içinde olduğu için fit yalnız eğitim verisinden öğrenir ve canlıda aynı dönüşüm tekrarlanır (eğitim-servis tutarlılığı). handle_unknown="ignore" olmazsa yeni kategori ValueError fırlatır ve canlı servis düşer. Maliyet: one-hot k kategori için k sütun ekler; çok yüksek kardinalitede hedef kodlama (TargetEncoder) ya da hashing tercih edilir. Alternatif: make_column_transformer ve make_pipeline kısa yazımları.',
    tags: ['ColumnTransformer', 'OneHotEncoder', 'Pipeline', 'handle_unknown'],
    min: 12
  }
);
})(window);
