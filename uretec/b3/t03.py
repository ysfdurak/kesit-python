T = [
dict(id='b-331', topic='İstatistik', diff=2, kind='yaz', needs=['scipy', 'numpy'],
  title='Teslim süresi için güven aralığı',
  q='<p>Lojistik ekibi kargo teslim sürelerinin (saat) ortalaması için güven aralığı istiyor. <code>guven_araligi(veri, guven=0.95)</code> fonksiyonunu yaz: örneklem ortalaması ± <i>t</i> kritik değeri × standart hata formülüyle <code>(alt, ust)</code> demetini 2 ondalık döndürsün. Standart sapmada <b>örneklem</b> formülünü (ddof=1) kullan. 2\'den az gözlemde <code>ValueError</code> fırlat.</p>',
  start=r'''
import numpy as np
from scipy import stats

def guven_araligi(veri, guven=0.95):
    pass
''',
  sol=r'''
import numpy as np
from scipy import stats

def guven_araligi(veri, guven=0.95):
    x = np.asarray(veri, dtype=float)
    n = len(x)
    if n < 2:
        raise ValueError("En az 2 gözlem gerekli")
    ort = x.mean()
    se = x.std(ddof=1) / np.sqrt(n)
    tkrit = stats.t.ppf((1 + guven) / 2, df=n - 1)
    return round(float(ort - tkrit * se), 2), round(float(ort + tkrit * se), 2)
''',
  tests=r'''
v = [42, 50, 47, 55, 48, 52, 46, 51]
alt, ust = guven_araligi(v)
assert (alt, ust) == (45.52, 52.23), f"%95 aralık (45.52, 52.23) olmalı; gelen {(alt, ust)}. ddof=1 ve t.ppf((1+guven)/2, n-1) kullandın mı?"
a90 = guven_araligi(v, 0.90)
assert a90[0] > alt and a90[1] < ust, "%90 güven aralığı %95'ten dar olmalı"
assert isinstance(alt, float), "Python float döndür"
try:
    guven_araligi([5])
    assert False, "Tek gözlemde ValueError bekleniyordu"
except ValueError:
    pass
''',
  hints=['Standart hata = s / √n, s örneklem standart sapması (<code>std(ddof=1)</code>).', 'İki yanlı aralıkta kritik değer <code>stats.t.ppf((1 + guven) / 2, df=n - 1)</code>.', 'Kısa yol: <code>stats.t.interval(guven, n - 1, loc=ort, scale=se)</code>.'],
  why='Popülasyon varyansı bilinmediğinde ve n küçükken z yerine t dağılımı kullanılır; serbestlik derecesi n−1. Hesap O(n). Güven aralığı "gerçek ortalama %95 olasılıkla buradadır" değil, "bu yöntem tekrarlandığında aralıkların %95’i gerçek ortalamayı kapsar" demektir. Alternatifler: stats.t.interval; çarpık veride bootstrap aralığı; çok büyük n’de z (stats.norm.ppf) ile neredeyse aynı sonuç.',
  tags=['güven aralığı', 't dağılımı', 'ddof'], min=6),

dict(id='b-332', topic='İstatistik', diff=2, kind='bug', needs=['scipy', 'numpy'],
  title='Ki-kare testine yüzde verilmiş',
  q='<p>Kodda bir hata var, bul ve düzelt. <code>donusum_testi(tablo, alfa)</code> iki kampanyanın dönüşüm oranları arasında fark olup olmadığını ki-kare bağımsızlık testiyle ölçüyor. <code>tablo</code> her satırı bir kampanya olan <code>[dönüşen, dönüşmeyen]</code> <b>sayılarıdır</b>. Fonksiyon <code>(p 4 ondalık, anlamli)</code> döndürmeli ama binlerce müşteriyle yapılan testte bile p-değeri gereğinden büyük çıkıyor.</p>',
  start=r'''
import numpy as np
from scipy import stats

def donusum_testi(tablo, alfa=0.05):
    t = np.asarray(tablo, dtype=float)
    oranlar = t / t.sum(axis=1, keepdims=True) * 100
    chi2, p, dof, beklenen = stats.chi2_contingency(oranlar)
    return round(float(p), 4), bool(p < alfa)
''',
  sol=r'''
import numpy as np
from scipy import stats

def donusum_testi(tablo, alfa=0.05):
    t = np.asarray(tablo, dtype=float)
    chi2, p, dof, beklenen = stats.chi2_contingency(t)
    return round(float(p), 4), bool(p < alfa)
''',
  tests=r'''
from scipy import stats as _st
tablo = [[120, 880], [165, 835]]
p, karar = donusum_testi(tablo)
p0 = _st.chi2_contingency(tablo)[1]
assert abs(p - round(p0, 4)) < 1e-4, f"p {round(p0, 4)} olmalı; gelen {p}. Ki-kare SAYILARLA çalışır, yüzdeye çevirmek örneklem büyüklüğünü siler"
assert karar is True, "2000 müşteride %12 ve %16.5 dönüşüm farkı anlamlı olmalı"
p2, k2 = donusum_testi([[10, 90], [11, 89]])
assert k2 is False, "Küçük ve yakın oranlar anlamlı çıkmamalı"
''',
  hints=['Ki-kare istatistiği gözlenen ve beklenen <b>frekanslar</b> arasındaki farka dayanır.', 'Yüzdeye çevirince her satır 100 kişi gibi davranır; 1000 kişilik bilgi kaybolur.', 'Oran satırını sil, <code>chi2_contingency(t)</code> çağır.'],
  why='Ki-kare istatistiği Σ(gözlenen − beklenen)² / beklenen ile hesaplanır ve sayılarla ölçeklenir: aynı oranlar 10 kat daha çok müşteriyle 10 kat büyük istatistik verir. Yüzdeye çevirmek n’yi yapay olarak 100’e indirir, testin gücünü öldürür. Hesap O(r·c). 2×2 tabloda scipy varsayılan olarak Yates süreklilik düzeltmesi uygular (correction=True). Alternatif: iki oran z-testi (statsmodels proportions_ztest) ya da küçük sayılarda stats.fisher_exact.',
  tags=['chi2_contingency', 'ki-kare', 'dönüşüm oranı'], min=5),

dict(id='b-333', topic='İstatistik', diff=3, kind='yaz', needs=['scipy', 'numpy'],
  title='Spearman korelasyonunu elle kur',
  q='<p>Reklam harcaması ile satış arasındaki ilişkide bir aykırı kampanya Pearson katsayısını bozuyor; ekip sıra tabanlı Spearman korelasyonunu kullanmaya karar verdi. <code>spearman(x, y)</code> fonksiyonunu <b>scipy.stats.spearmanr kullanmadan</b> yaz: iki diziyi sıralara (rank) çevir — eşit değerlere <b>ortalama sıra</b> ver — ve sıralar arasındaki Pearson korelasyonunu 4 ondalık döndür. <code>scipy.stats.rankdata</code> ve <code>np.corrcoef</code> kullanabilirsin.</p>',
  start=r'''
import numpy as np
from scipy import stats

def spearman(x, y):
    pass
''',
  sol=r'''
import numpy as np
from scipy import stats

def spearman(x, y):
    rx = stats.rankdata(x)          # eşitlere ortalama sıra
    ry = stats.rankdata(y)
    return round(float(np.corrcoef(rx, ry)[0, 1]), 4)
''',
  tests=r'''
from scipy import stats as _st
reklam = [10, 20, 30, 40, 50, 60]
satis = [100, 180, 260, 300, 330, 5000]
r = spearman(reklam, satis)
assert r == 1.0, f"Satış reklamla tam monoton artıyor → Spearman 1.0; gelen {r}"
p = _st.pearsonr(reklam, satis)[0]
assert p < 0.8, "(Bilgi) Pearson aykırı değer yüzünden 1'den çok uzak"
x = [3, 1, 4, 1, 5, 9, 2, 6]
y = [2, 7, 1, 8, 2, 8, 1, 8]
beklenen = round(float(_st.spearmanr(x, y)[0]), 4)
assert spearman(x, y) == beklenen, f"Eşitlikli veride {beklenen} olmalı; eşit değerlere ortalama sıra verdin mi (rankdata)?"
assert "spearmanr" not in __source__, "spearmanr kullanma; sıraları kendin hesapla"
''',
  hints=['Spearman katsayısı = sıraların Pearson korelasyonu.', '<code>stats.rankdata([10, 20, 20])</code> → <code>[1., 2.5, 2.5]</code> (eşitlere ortalama sıra).', '<code>np.corrcoef(rx, ry)[0, 1]</code> iki dizi arasındaki korelasyonu verir.'],
  why='Spearman verinin büyüklüğünü değil sırasını kullandığı için aykırı değerlere dayanıklıdır ve doğrusal olmayan ama monoton ilişkileri yakalar (burada 1.0), Pearson ise 5000’lik kampanya yüzünden düşer. Sıralama O(n log n), korelasyon O(n). Eşitlik yoksa kısa formül 1 − 6Σd² / (n(n²−1)) de kullanılabilir ama eşitlikte yanlış verir; sıraların Pearson’ı her durumda doğrudur. Alternatifler: stats.spearmanr, pandas df.corr(method="spearman"), Kendall tau (stats.kendalltau).',
  tags=['Spearman', 'rankdata', 'korelasyon', 'aykırı değer'], min=9),

dict(id='b-334', topic='İstatistik', diff=2, kind='tamamla', needs=['numpy'],
  title='Bootstrap ile güven aralığı',
  q='<p>Sepet tutarları çarpık dağıldığı için ekip formül yerine <b>bootstrap</b> ile ortalamanın güven aralığını çıkarıyor: veriden <b>yerine koyarak</b> n elemanlı örneklemler çek, her birinin ortalamasını al, ortalamaların yüzdeliklerini aralık olarak kullan. <code>bootstrap_ga</code> fonksiyonundaki <code>___</code> boşluklarını doldur.</p>',
  start=r'''
import numpy as np

def bootstrap_ga(veri, n_tekrar=2000, guven=0.95, tohum=42):
    rng = np.random.default_rng(tohum)
    x = np.asarray(veri, dtype=float)
    ornekler = rng.choice(x, size=(n_tekrar, len(x)), replace=___)
    ortalamalar = ornekler.mean(axis=___)
    alfa = (1 - guven) / 2
    alt, ust = np.quantile(ortalamalar, [alfa, 1 - alfa])
    return round(float(alt), 2), round(float(ust), 2)
''',
  sol=r'''
import numpy as np

def bootstrap_ga(veri, n_tekrar=2000, guven=0.95, tohum=42):
    rng = np.random.default_rng(tohum)
    x = np.asarray(veri, dtype=float)
    ornekler = rng.choice(x, size=(n_tekrar, len(x)), replace=True)
    ortalamalar = ornekler.mean(axis=1)
    alfa = (1 - guven) / 2
    alt, ust = np.quantile(ortalamalar, [alfa, 1 - alfa])
    return round(float(alt), 2), round(float(ust), 2)
''',
  tests=r'''
sepet = [120, 85, 60, 2400, 150, 95, 70, 310, 45, 130, 88, 99]
alt, ust = bootstrap_ga(sepet)
ort = sum(sepet) / len(sepet)
assert alt < ort < ust, f"Ortalama ({ort:.2f}) aralığın içinde olmalı; gelen {(alt, ust)}"
assert ust - alt > 50, "Aralık genişliği sıfır olmamalı: yerine koymadan (replace=False) çekersen her örnek aynı ortalamayı verir"
assert bootstrap_ga(sepet) == (alt, ust), "Aynı tohumla sonuç tekrarlanabilir olmalı"
a90 = bootstrap_ga(sepet, guven=0.90)
assert a90[1] - a90[0] < ust - alt, "%90 aralık %95'ten dar olmalı"
assert bootstrap_ga([50, 50, 50]) == (50.0, 50.0), "Sabit veride aralık tek noktaya iner"
''',
  hints=['Bootstrap\'in özü yerine koyarak örneklemedir: aynı gözlem bir örneklemde birden çok kez çıkabilir.', 'Matris (n_tekrar, n) şeklinde; her SATIR bir bootstrap örneklemi.', '<code>replace=True</code>, <code>mean(axis=1)</code>'],
  why='Bootstrap, dağılım varsayımı yapmadan örneklem dağılımını veriden yeniden örnekleyerek taklit eder; çarpık veride t-aralığından daha gerçekçidir. Tek matris çekimi ile B×n işlem vektörel yapılır: O(B·n) zaman ve bellek. Çok büyük B·n’de parçalı döngü kullanılır. Alternatif: scipy.stats.bootstrap (BCa yöntemi ile daha isabetli aralık). Tohum (seed) sonucun tekrarlanabilir olmasını sağlar.',
  tags=['bootstrap', 'default_rng', 'quantile'], min=5),

dict(id='b-335', topic='scikit-learn', diff=2, kind='predict', needs=['scikit-learn'],
  title='train_test_split kaç satır ayırır?',
  q='<p>10 satırlık veriyi %25 test olacak şekilde bölen bu kod ne yazdırır?</p>',
  code=r'''
from sklearn.model_selection import train_test_split

X = [[i] for i in range(10)]
y = [0, 1] * 5
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0)
print(len(X_tr), len(X_te))
print(type(X_te).__name__)
''',
  o=['7 3\nlist', '8 2\nlist', '7 3\nndarray', '7.5 2.5\nlist'], a=0,
  hints=['Test kümesi boyutu kesirli çıkarsa yukarı yuvarlanır (ceil).', 'Girdi Python listesi ise çıktılar da liste olarak döner.'],
  why='test_size=0.25 × 10 = 2.5 → test için yukarı yuvarlanır (3), eğitim kalan 7 olur. scikit-learn girdinin türünü korur: liste verirsen liste, DataFrame verirsen DataFrame döner. Sınıf oranlarını korumak için stratify=y eklenir; zaman serisinde rastgele bölme yerine TimeSeriesSplit ya da tarihe göre kesme yapılır, yoksa gelecek bilgisi eğitime sızar.',
  tags=['train_test_split', 'test_size'], min=3),

dict(id='b-336', topic='scikit-learn', diff=2, kind='order', needs=['scikit-learn'],
  title='Ölçekleme + lojistik regresyon hattı',
  q='<p>Kredi başvurularını (gelir puanı, gecikme günü) sınıflandıran bir <code>Pipeline</code> kuran, eğiten, iki yeni başvuruyu tahmin eden ve ölçekleyicinin öğrendiği ortalamaları yazdıran programın satırlarını sırala.</p>',
  lines=[
    'from sklearn import linear_model, pipeline, preprocessing',
    'adimlar = [("olcek", preprocessing.StandardScaler()), ("model", linear_model.LogisticRegression())]',
    'model = pipeline.Pipeline(adimlar)',
    'model.fit([[1, 20], [2, 18], [8, 3], [9, 1], [2, 25], [10, 2]], [0, 0, 1, 1, 0, 1])',
    'tahmin = model.predict([[7, 4], [1, 22]])',
    'print(tahmin.tolist(), model.named_steps["olcek"].mean_.round(2).tolist())',
  ],
  expect='[1, 0] [5.33, 11.5]\n',
  hints=['Adımlar listesi Pipeline kurulmadan önce hazır olmalı.', 'predict ancak fit\'ten sonra çağrılabilir; mean_ de fit sırasında öğrenilir.'],
  why='Pipeline adımları ("ad", nesne) çiftleri olarak alır; fit önce ölçekleyiciyi eğitim verisine uydurur (fit_transform), sonra dönüştürülmüş veriyle modeli eğitir. predict aynı dönüşümü (eğitimde öğrenilen ortalama/std ile) uygular, böylece test verisi sızıntısı olmaz. named_steps ile ara adımlara erişilir. Kısa yazım: make_pipeline(StandardScaler(), LogisticRegression()).',
  tags=['Pipeline', 'StandardScaler', 'LogisticRegression'], min=4),

dict(id='b-337', topic='scikit-learn', diff=2, kind='rehberli', needs=['scikit-learn', 'numpy'],
  title='Reklam harcamasından satış tahmini',
  q='<p><code>reklam_modeli(harcama, satis)</code> fonksiyonunu yaz: haftalık reklam harcaması (bin TL) ve satış (adet) listeleriyle bir <code>LinearRegression</code> modeli eğitsin ve <code>(egim, kesisim, tahmin_100)</code> demetini 2 ondalık döndürsün; <code>tahmin_100</code> 100 bin TL harcamada beklenen satıştır.</p>',
  guide=['scikit-learn özellik matrisi (X) için 2 boyut ister: harcamayı <code>(n, 1)</code> şekline getir.', '<code>LinearRegression().fit(X, y)</code> ile eğit.', 'Eğim <code>coef_[0]</code>, kesişim <code>intercept_</code> içindedir.', 'Tahmin için de 2 boyutlu girdi ver: <code>[[100]]</code>.', 'Değerleri <code>float</code> yapıp 2 ondalığa yuvarla.'],
  example=r'''
import numpy as np
from sklearn.linear_model import LinearRegression
sicaklik = np.array([20, 25, 30, 35]).reshape(-1, 1)
dondurma = [200, 260, 310, 370]
m = LinearRegression().fit(sicaklik, dondurma)
print(m.coef_, m.intercept_, m.predict([[28]]))
''',
  start=r'''
import numpy as np
from sklearn.linear_model import LinearRegression

def reklam_modeli(harcama, satis):
    X = np.asarray(harcama, dtype=float)
    # TODO 1: X'i (n, 1) şekline getir
    # TODO 2: modeli eğit
    # TODO 3: eğim, kesişim ve 100 için tahmini al
    # TODO 4: 2 ondalık float demet döndür
    return None
''',
  sol=r'''
import numpy as np
from sklearn.linear_model import LinearRegression

def reklam_modeli(harcama, satis):
    X = np.asarray(harcama, dtype=float).reshape(-1, 1)
    m = LinearRegression().fit(X, satis)
    egim = round(float(m.coef_[0]), 2)
    kesisim = round(float(m.intercept_), 2)
    tahmin = round(float(m.predict([[100]])[0]), 2)
    return egim, kesisim, tahmin
''',
  tests=r'''
r = reklam_modeli([10, 20, 30, 40, 50], [130, 170, 205, 250, 290])
assert r is not None and len(r) == 3, "(egim, kesisim, tahmin_100) demeti döndür"
egim, kes, t100 = r
assert abs(egim - 4.0) < 1e-9, f"Eğim 4.0 olmalı (her bin TL ~4 adet); gelen {egim}"
assert abs(kes - 89.0) < 1e-9, f"Kesişim 89.0 olmalı; gelen {kes}"
assert abs(t100 - 489.0) < 1e-9, f"100 bin TL'de tahmin 489.0 olmalı; gelen {t100}"
assert all(isinstance(v, float) for v in r), "Python float döndür"
''',
  hints=['Tek özellikli veride <code>reshape(-1, 1)</code> sütun vektörü üretir.', '<code>m = LinearRegression().fit(X, satis)</code>; sonra <code>m.coef_[0]</code>, <code>m.intercept_</code>.', 'Tahmin: <code>m.predict([[100]])[0]</code>.'],
  why='scikit-learn’de X her zaman (örnek, özellik) şeklinde 2 boyutludur; 1 boyutlu dizi verirsen "Expected 2D array" hatası alırsın. En küçük kareler çözümü tek özellikte O(n). Eğim "1 bin TL ek reklam ≈ 4 adet ek satış" diye yorumlanır, ama bu korelasyondur; nedensellik için deney (A/B) gerekir. Alternatifler: np.polyfit(x, y, 1), scipy.stats.linregress (p-değeri ve r ile), statsmodels OLS (ayrıntılı istatistik özeti).',
  tags=['LinearRegression', 'reshape', 'regresyon'], min=6),

dict(id='b-338', topic='scikit-learn', diff=3, kind='bug', needs=['scikit-learn', 'numpy'],
  title='Ölçekleyici test verisini görüyor (sızıntı)',
  q='<p>Kodda bir hata var, bul ve düzelt. <code>olcekle(X_egitim, X_test)</code> özellikleri standartlaştırıp <code>(X_egitim_olcekli, X_test_olcekli, scaler)</code> döndürüyor. Kod çalışıyor ama ölçekleyici <b>test verisinden de</b> öğreniyor; bu, modelin canlıda göreceğinden daha iyi skor üretmesine (veri sızıntısı, data leakage) yol açar.</p>',
  start=r'''
import numpy as np
from sklearn.preprocessing import StandardScaler

def olcekle(X_egitim, X_test):
    scaler = StandardScaler()
    scaler.fit(np.vstack([X_egitim, X_test]))
    return scaler.transform(X_egitim), scaler.transform(X_test), scaler
''',
  sol=r'''
import numpy as np
from sklearn.preprocessing import StandardScaler

def olcekle(X_egitim, X_test):
    scaler = StandardScaler()
    X_egitim_o = scaler.fit_transform(X_egitim)
    return X_egitim_o, scaler.transform(X_test), scaler
''',
  tests=r'''
Xe = np.array([[10.0, 1.0], [20.0, 3.0], [30.0, 5.0]])
Xt = np.array([[1000.0, 50.0]])
a, b, s = olcekle(Xe, Xt)
assert np.allclose(s.mean_, [20.0, 3.0]), f"Ölçekleyici yalnız eğitim verisinden öğrenmeli: mean_ [20, 3] olmalı, gelen {s.mean_}"
assert np.allclose(a.mean(axis=0), 0), "Eğitim verisi ölçeklenince sütun ortalamaları 0 olmalı"
assert b[0, 0] > 10, "Test satırı eğitim dağılımına göre çok uç; büyük z-skoru almalı"
''',
  hints=['Ölçekleyici ortalama ve standart sapmayı <code>fit</code> sırasında öğrenir.', 'fit\'e yalnız eğitim verisi girmeli; test verisine sadece <code>transform</code> uygulanır.', '<code>scaler.fit_transform(X_egitim)</code> ve <code>scaler.transform(X_test)</code>'],
  why='Test verisi modelin hiç görmediği geleceği temsil eder; ölçekleme, eksik değer doldurma, kodlama gibi her öğrenen adım yalnız eğitim verisiyle fit edilmelidir. Aksi hâlde istatistikler testten bilgi taşır ve doğrulama skoru iyimser olur. En sağlam çözüm adımları Pipeline içine koymak: cross_val_score her katmanda fit’i otomatik olarak yalnız eğitim katmanına uygular. Maliyet: fit O(n·d), transform O(n·d).',
  tags=['data leakage', 'StandardScaler', 'fit_transform'], min=5),

dict(id='b-339', topic='scikit-learn', diff=2, kind='yaz', needs=['scikit-learn'],
  title='Sahtecilik modeli: precision, recall, F1',
  q='<p>Ilgaz Bank sahte işlem modelinin sonuçlarını raporluyor (1 = sahte). <code>metrikler(y_gercek, y_tahmin)</code> fonksiyonunu <b>sklearn.metrics kullanmadan</b> yaz: TP, FP, FN sayılarından <code>{"precision", "recall", "f1"}</code> sözlüğünü 3 ondalık döndürsün. Payda 0 olursa ilgili metrik 0.0 olsun.</p>',
  start=r'''
def metrikler(y_gercek, y_tahmin):
    pass
''',
  sol=r'''
def metrikler(y_gercek, y_tahmin):
    tp = sum(1 for g, t in zip(y_gercek, y_tahmin) if g == 1 and t == 1)
    fp = sum(1 for g, t in zip(y_gercek, y_tahmin) if g == 0 and t == 1)
    fn = sum(1 for g, t in zip(y_gercek, y_tahmin) if g == 1 and t == 0)
    p = tp / (tp + fp) if tp + fp else 0.0
    r = tp / (tp + fn) if tp + fn else 0.0
    f1 = 2 * p * r / (p + r) if p + r else 0.0
    return {"precision": round(p, 3), "recall": round(r, 3), "f1": round(f1, 3)}
''',
  tests=r'''
from sklearn.metrics import precision_score, recall_score, f1_score
g = [0, 0, 1, 1, 0, 1, 0, 0, 1, 0]
t = [0, 1, 1, 0, 0, 1, 0, 0, 1, 1]
m = metrikler(g, t)
assert m["precision"] == round(precision_score(g, t), 3) == 0.6, f"precision = TP/(TP+FP) = 3/5 = 0.6; gelen {m['precision']}"
assert m["recall"] == round(recall_score(g, t), 3) == 0.75, f"recall = TP/(TP+FN) = 3/4 = 0.75; gelen {m['recall']}"
assert m["f1"] == round(f1_score(g, t), 3), f"f1 = 2PR/(P+R) ≈ 0.667; gelen {m['f1']}"
z = metrikler([0, 0, 1], [0, 0, 0])
assert z == {"precision": 0.0, "recall": 0.0, "f1": 0.0}, "Hiç pozitif tahmin yoksa sıfıra bölme yerine 0.0"
assert "sklearn" not in __source__, "Metrikleri kendin hesapla"
''',
  hints=['TP: gerçek 1, tahmin 1; FP: gerçek 0, tahmin 1; FN: gerçek 1, tahmin 0.', 'precision = TP/(TP+FP), recall = TP/(TP+FN), F1 bunların harmonik ortalaması.', 'Paydaları <code>if tp + fp else 0.0</code> gibi koşullu ifadeyle koru.'],
  why='Dengesiz veride (sahte işlem nadir) doğruluk (accuracy) yanıltıcıdır: hep "0" diyen model %99 doğru çıkar. Precision "alarm verdiklerimizin ne kadarı gerçekten sahte", recall "sahtelerin ne kadarını yakaladık" sorusunu yanıtlar; F1 ikisini dengeler. Tek geçiş O(n). Alternatif: sklearn.metrics.precision_recall_fscore_support(zero_division=0) ya da classification_report; eşik seçimi için precision_recall_curve.',
  tags=['precision', 'recall', 'F1', 'karışıklık matrisi'], min=6),

dict(id='b-340', topic='scikit-learn', diff=3, kind='yaz', needs=['scikit-learn', 'pandas'],
  title='Karma özellikli kredi modeli (ColumnTransformer)',
  q='<p><code>kredi_modeli(df, y)</code> fonksiyonunu yaz: <code>df</code> sütunları <code>gelir</code>, <code>borc_orani</code> (sayısal) ve <code>sehir</code> (kategorik). Sayısal sütunları <code>StandardScaler</code>, şehri <code>OneHotEncoder(handle_unknown="ignore")</code> ile dönüştüren bir <code>ColumnTransformer</code> ve ardından <code>LogisticRegression</code> içeren bir <code>Pipeline</code> kur, eğit ve <b>eğitilmiş pipeline\'ı</b> döndür. Canlıda daha önce görülmemiş bir şehir gelince model hata vermemeli.</p>',
  start=r'''
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

def kredi_modeli(df, y):
    pass
''',
  sol=r'''
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

def kredi_modeli(df, y):
    on_isleme = ColumnTransformer([
        ("sayisal", StandardScaler(), ["gelir", "borc_orani"]),
        ("kategorik", OneHotEncoder(handle_unknown="ignore"), ["sehir"]),
    ])
    model = Pipeline([("on_isleme", on_isleme), ("model", LogisticRegression())])
    return model.fit(df, y)
''',
  tests=r'''
df = pd.DataFrame({
    "gelir": [45, 80, 30, 95, 25, 70, 60, 20, 88, 35],
    "borc_orani": [0.2, 0.1, 0.7, 0.15, 0.8, 0.3, 0.25, 0.9, 0.05, 0.6],
    "sehir": ["Ankara", "İzmir", "Ankara", "Bursa", "İzmir", "Bursa", "Ankara", "Bursa", "İzmir", "Ankara"],
})
y = [1, 1, 0, 1, 0, 1, 1, 0, 1, 0]
m = kredi_modeli(df, y)
assert isinstance(m, Pipeline), "Eğitilmiş bir Pipeline döndür"
assert (m.predict(df) == y).mean() >= 0.9, "Bu ayrışabilir veride eğitim doğruluğu en az %90 olmalı"
yeni = pd.DataFrame({"gelir": [90, 22], "borc_orani": [0.1, 0.85], "sehir": ["Trabzon", "Ankara"]})
try:
    t = m.predict(yeni)
except ValueError:
    assert False, "Görülmemiş şehir (Trabzon) hata vermemeli: OneHotEncoder(handle_unknown='ignore')"
assert t.tolist() == [1, 0], f"Yüksek gelir/düşük borç onay (1), tersi ret (0) almalı; gelen {t.tolist()}"
''',
  hints=['ColumnTransformer\'a <code>(ad, dönüştürücü, sütun_listesi)</code> üçlüleri verilir.', 'OneHotEncoder\'da <code>handle_unknown="ignore"</code> bilinmeyen kategoriyi tümü 0 vektörle temsil eder.', 'Pipeline([("on_isleme", ct), ("model", LogisticRegression())]).fit(df, y)'],
  why='ColumnTransformer farklı sütun türlerine farklı dönüşümü tek nesnede uygular; Pipeline içinde olduğu için fit yalnız eğitim verisinden öğrenir ve canlıda aynı dönüşüm tekrarlanır (eğitim-servis tutarlılığı). handle_unknown="ignore" olmazsa yeni kategori ValueError fırlatır ve canlı servis düşer. Maliyet: one-hot k kategori için k sütun ekler; çok yüksek kardinalitede hedef kodlama (TargetEncoder) ya da hashing tercih edilir. Alternatif: make_column_transformer ve make_pipeline kısa yazımları.',
  tags=['ColumnTransformer', 'OneHotEncoder', 'Pipeline', 'handle_unknown'], min=12),
]
